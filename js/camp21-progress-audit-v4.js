/*
 * Camp21 Progress Audit V4 (pure, no DOM or storage side effects).
 * Integration standard for Flanahao/kaoyan-tiku 21-Day Camp.
 * Source snapshot: 2026-10-30 V4 Progress Engine Specification.
 *
 * Invariants:
 * - Status change alone is never evidence of a solved question;
 * - Only per-question practice/review events can increase completion;
 * - User-selected plan day never controls the event's actual study date;
 * - All mastery requires current 'proficient' AND a passing review event;
 * - No mock is auto-completed from historic marks;
 * - Unknown offline inventory cannot reach 100%.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Camp21ProgressAuditV4 = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  var STATUS = new Set(["proficient", "familiar", "vague", "rusty", "wrong", "unmarked"]);

  function dayString(value) {
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) throw Error("Invalid date");
    if (d.getHours() < 3) d.setDate(d.getDate() - 1);
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  function questionKey(subjectId, chapterId, idx) {
    if (!subjectId || !chapterId || !Number.isInteger(idx) || idx < 0) {
      throw Error("Invalid question identity");
    }
    return String(subjectId) + ":" + String(chapterId) + ":" + idx;
  }

  function scopedIds(task) {
    var found = new Set();
    (task.scopedItems || []).forEach(function (slice) {
      if (!slice.subjectId || !slice.chapterId || !Array.isArray(slice.indices)) {
        throw Error("Invalid scopedItems in task " + task.id);
      }
      slice.indices.forEach(function (idx) {
        var q = questionKey(slice.subjectId, slice.chapterId, idx);
        if (found.has(q)) throw Error("Duplicate ID inside task " + task.id + ": " + q);
        found.add(q);
      });
    });
    return Array.from(found);
  }

  function newAudit() {
    return {
      version: 4,
      events: [],
      offlineEvents: [],
      mockRecords: {},
      paperCorrections: {},
      manualClaims: {},
      legacyMigration: { reviewed: false }
    };
  }

  function safeAudit(source) {
    var s = source && typeof source === "object" ? source : newAudit();
    return {
      version: 4,
      events: Array.isArray(s.events) ? s.events : [],
      offlineEvents: Array.isArray(s.offlineEvents) ? s.offlineEvents : [],
      mockRecords: s.mockRecords || {},
      paperCorrections: s.paperCorrections || {},
      manualClaims: s.manualClaims || {},
      legacyMigration: s.legacyMigration || { reviewed: false }
    };
  }

  function taskById(tasks, id) {
    return (tasks || []).find(function (t) { return t.id === id; }) || null;
  }

  function eventId(opts, ts) {
    if (opts && opts.id) return String(opts.id);
    return "camp-v4-" + ts + "-" + Math.random().toString(36).slice(2);
  }

  /*
   * Explicit per-question practice event, created only after the UI confirms
   * that the student actually attempted the question.
   *
   * For 'review', outcome=pass/fail is required. Merely clicking a status
   * button uses a different (non-credit) 'status' event.
   *
   * taskId must come from the actual practice-session context.
   * If a task is studied late, pass allowBacklog: true; retain actual day.
   */
  function recordPractice(audit, tasks, payload, opts) {
    opts = opts || {};
    var s = safeAudit(audit);
    if (!payload || !["attempt", "review", "status"].includes(payload.kind)) {
      throw Error("kind must be attempt, review, or status");
    }
    var qid = questionKey(payload.subjectId, payload.chapterId, Number(payload.idx));
    var task = taskById(tasks, opts.taskId);
    if (!task) throw Error("Unknown taskId. Unassigned events need manual assignment.");
    if (!scopedIds(task).includes(qid)) throw Error("Question is outside task scopedItems");
    var ts = Number(opts.timestamp == null ? Date.now() : opts.timestamp);
    if (!Number.isFinite(ts)) throw Error("Invalid timestamp");
    var studyDay = dayString(ts);
    if (!opts.allowBacklog && task.date && studyDay !== task.date) {
      throw Error("Task does not belong to actual study date " + studyDay);
    }
    if (payload.kind === "review" && !["pass", "fail"].includes(payload.outcome)) {
      throw Error("A review requires an explicit pass/fail outcome");
    }
    var status = String(payload.statusAfter || "unmarked");
    if (!STATUS.has(status)) throw Error("Unsupported status");
    var id = eventId(opts, ts);
    if (s.events.some(function (ev) { return ev.id === id; })) return s; // idempotent
    s.events.push({
      id: id,
      ts: ts,
      studyDay: studyDay,
      taskId: task.id,
      qid: qid,
      kind: payload.kind,
      outcome: payload.kind === "review" ? payload.outcome : null,
      statusAfter: status,
      source: payload.source || "question-ui"
    });
    return s;
  }

  function lastReview(events, taskId, qid) {
    return (events || []).filter(function (e) {
      return e.taskId === taskId && e.qid === qid && e.kind === "review";
    }).sort(function (a, b) { return a.ts - b.ts; }).at(-1) || null;
  }

  function evaluateOnline(task, audit, readStatus) {
    var ids = scopedIds(task), s = safeAudit(audit);
    if (!ids.length) {
      return {
        type: "online",
        state: "NEEDS_SCOPE",
        target: 0,
        attempted: 0,
        mastered: 0,
        coveragePct: null,
        masteryPct: null,
        isDone: false
      };
    }
    var attempted = 0, mastered = 0, broadGreen = 0;
    ids.forEach(function (qid) {
      var status = String(readStatus(qid) || "unmarked");
      if (status === "proficient" || status === "familiar") broadGreen++;
      var events = s.events.filter(function (e) {
        return e.taskId === task.id && e.qid === qid;
      });
      if (events.some(function (e) { return e.kind === "attempt" || e.kind === "review"; })) attempted++;
      var review = lastReview(events, task.id, qid);
      // A later downgrade revokes a previous pass. Getting back to
      // 'proficient' requires another successful review.
      var downgradedAfterPass = !!(review && events.some(function (e) {
        return e.ts > review.ts && e.statusAfter !== "proficient";
      }));
      if (review && review.outcome === "pass" &&
          status === "proficient" && !downgradedAfterPass) mastered++;
    });
    var n = ids.length;
    return {
      type: "online",
      state: mastered === n ? "MASTERED" : (attempted === n ? "COVERED_NOT_MASTERED" : "IN_PROGRESS"),
      target: n,
      attempted: attempted,
      broadGreen: broadGreen,
      mastered: mastered,
      coveragePct: Math.round(attempted / n * 100),
      masteryPct: Math.round(mastered / n * 100),
      isDone: mastered === n
    };
  }

  function recordOffline(audit, task, itemId, action, opts) {
    opts = opts || {};
    var items = task.offlineItemIds;
    if (!Array.isArray(items) || !items.length) {
      throw Error("Offline inventory not supplied");
    }
    if (!items.includes(itemId)) throw Error("Offline item not in task inventory");
    if (!["attempt", "pass", "fail"].includes(action)) throw Error("Invalid offline action");
    var s = safeAudit(audit), ts = Number(opts.timestamp == null ? Date.now() : opts.timestamp);
    var id = eventId(opts, ts);
    if (s.offlineEvents.some(function (e) { return e.id === id; })) return s;
    s.offlineEvents.push({
      id: id,
      taskId: task.id,
      itemId: itemId,
      action: action,
      ts: ts,
      studyDay: dayString(ts)
    });
    return s;
  }

  function evaluateOffline(task, audit) {
    var ids = task.offlineItemIds;
    if (!Array.isArray(ids) || !ids.length) {
      return {
        type: "offline",
        state: "NEEDS_INVENTORY",
        target: null,
        attempted: 0,
        mastered: 0,
        coveragePct: null,
        masteryPct: null,
        isDone: false
      };
    }
    var keys = Array.from(new Set(ids)), s = safeAudit(audit);
    var attempted = 0, mastered = 0;
    keys.forEach(function (qid) {
      var events = s.offlineEvents.filter(function (e) {
        return e.taskId === task.id && e.itemId === qid;
      }).sort(function (a, b) { return a.ts - b.ts; });
      if (events.length) attempted++;
      var lastVerdict = events.filter(function (e) { return e.action === "pass" || e.action === "fail"; }).at(-1);
      if (lastVerdict && lastVerdict.action === "pass") mastered++;
    });
    var n = keys.length;
    return {
      type: "offline",
      state: mastered === n ? "MASTERED" : "IN_PROGRESS",
      target: n,
      attempted: attempted,
      mastered: mastered,
      coveragePct: Math.round(100 * attempted / n),
      masteryPct: Math.round(100 * mastered / n),
      isDone: mastered === n
    };
  }

  function recordMock(audit, taskId, record) {
    var s = safeAudit(audit);
    if (!record || !record.paperId) throw Error("A stable paperId is required");
    var started = Number(record.startedAt), submitted = Number(record.submittedAt);
    if (!Number.isFinite(started) || !Number.isFinite(submitted) || submitted < started) {
      throw Error("Invalid mock session timestamps");
    }
    s.mockRecords[taskId] = {
      paperId: record.paperId,
      startedAt: started,
      submittedAt: submitted,
      gradedAt: record.gradedAt || null,
      fullPaperSubmitted: record.fullPaperSubmitted === true,
      durationMinutes: Math.round((submitted - started) / 60000)
    };
    return s;
  }

  function evaluateMock(task, audit) {
    var r = safeAudit(audit).mockRecords[task.id];
    var complete = !!(r && r.fullPaperSubmitted && r.gradedAt &&
       r.durationMinutes >= 180 && r.paperId);
    return {
      type: "mock",
      state: complete ? "SUBMITTED_GRADED" : "NEEDS_MOCK_EVIDENCE",
      target: 1,
      attempted: (r && r.fullPaperSubmitted) ? 1 : 0,
      mastered: complete ? 1 : 0,
      coveragePct: (r && r.fullPaperSubmitted) ? 100 : 0,
      masteryPct: complete ? 100 : 0,
      isDone: complete,
      mockRecord: r || null
    };
  }

  function recordPaperCorrection(audit, taskId, paperId, record) {
    var s = safeAudit(audit);
    var key = String(taskId) + "_" + String(paperId);
    var nextMap = Object.assign({}, s.paperCorrections || {});
    nextMap[key] = Object.assign({}, nextMap[key] || {}, record || {});
    return Object.assign({}, s, { paperCorrections: nextMap });
  }

  function evaluateCorrection(task, audit) {
    var s = safeAudit(audit);
    var key = String(task.id) + "_" + String(task.paperId);
    var rec = (s.paperCorrections && s.paperCorrections[key]) || null;
    var v41 = (typeof window !== "undefined" && window.Camp21ScheduleV41)
      ? window.Camp21ScheduleV41
      : (typeof require === "function" ? (function () { try { return require("./camp21-schedule-v41.js"); } catch (e) { return null; } })() : null);
    var prog = (v41 && typeof v41.paperProgress === "function")
      ? v41.paperProgress(rec)
      : {
          stage: rec && rec.fullPaperSubmitted ? (rec.graded ? (rec.correctionSessionConfirmed ? "CORRECTED_WAITING_RECHECK" : "GRADED_WAITING_CORRECTION") : "SUBMITTED_WAITING_GRADING") : "NOT_SUBMITTED",
          examDone: !!(rec && rec.fullPaperSubmitted),
          correctionDone: !!(rec && rec.correctionSessionConfirmed && (!rec.wrongQuestionIds || rec.wrongQuestionIds.length === 0 || (rec.correctedQuestionIds && rec.correctedQuestionIds.length >= rec.wrongQuestionIds.length))),
          strictlyMastered: !!(rec && rec.allAssignedQuestionsStrictlyMastered),
          unresolvedWrongIds: (rec && rec.wrongQuestionIds) ? (rec.wrongQuestionIds.filter(function (id) { return !(rec.correctedQuestionIds || []).includes(id); })) : []
        };
    var isDone = prog.strictlyMastered;
    return {
      type: "correction",
      state: prog.stage,
      target: 1,
      attempted: (prog.examDone && prog.correctionDone) ? 1 : 0,
      mastered: isDone ? 1 : 0,
      coveragePct: (prog.examDone && prog.correctionDone) ? 100 : 0,
      masteryPct: isDone ? 100 : 0,
      isDone: isDone,
      unresolvedWrongIds: prog.unresolvedWrongIds || [],
      record: rec,
      paperProgress: prog
    };
  }

  function evaluateTask(task, audit, readStatus) {
    // Precedence matters: mocks can have optional chapter links, but those
    // links MUST NEVER count as an auto-completion signal.
    if (task.isOptionalOnlineMock || task.kind === "mock") return evaluateMock(task, audit);
    if (task.kind === "offline") return evaluateOffline(task, audit);
    if (task.kind === "correction") return evaluateCorrection(task, audit);
    if (Array.isArray(task.scopedItems) && task.scopedItems.length) {
      return evaluateOnline(task, audit, readStatus);
    }
    return {
      type: "untracked",
      state: "NEEDS_SCOPE_OR_INVENTORY",
      target: null,
      attempted: 0,
      mastered: 0,
      coveragePct: null,
      masteryPct: null,
      isDone: false
    };
  }

  function evaluateDay(tasks, audit, readStatus) {
    var results = (tasks || []).map(function (task) {
      return {
        taskId: task.id,
        result: evaluateTask(task, audit, readStatus)
      };
    });
    var total = results.length;
    var completed = results.filter(function (x) { return x.result.isDone; }).length;
    var missing = results.filter(function (x) { return x.result.target == null || x.result.target === 0; }).length;
    var masteryPct = total ? Math.round(results.reduce(function (sum, x) {
      return sum + (x.result.masteryPct == null ? 0 : x.result.masteryPct);
    }, 0) / total) : 0;

    var onlineTasks = results.filter(function (x) { return x.result.type === "online"; });
    var onlineTarget = onlineTasks.reduce(function (sum, x) { return sum + (x.result.target || 0); }, 0);
    var onlineMastered = onlineTasks.reduce(function (sum, x) { return sum + (x.result.mastered || 0); }, 0);
    var onlineAttempted = onlineTasks.reduce(function (sum, x) { return sum + (x.result.attempted || 0); }, 0);
    var onlineBroadGreen = onlineTasks.reduce(function (sum, x) { return sum + (x.result.broadGreen || 0); }, 0);
    var onlineMasteryPct = onlineTarget > 0 ? Math.round((onlineMastered / onlineTarget) * 100) : 0;
    var taskPct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      results: results,
      totalTasks: total,
      completedTasks: completed,
      untrackedTasks: missing,
      masteryPct: masteryPct,
      taskPct: taskPct,
      onlineTarget: onlineTarget,
      onlineMastered: onlineMastered,
      onlineAttempted: onlineAttempted,
      onlineBroadGreen: onlineBroadGreen,
      onlineMasteryPct: onlineMasteryPct,
      isDone: total > 0 && completed === total && missing === 0
    };
  }

  /*
   * V3 module audit: the numerator is derived from unique scoped question IDs.
   * Manual claims are shown separately and never contribute to verified totals.
   */
  function reconcileQuota(moduleName, dayTasks, audit, readStatus, target, manualClaim) {
    var relevant = (dayTasks || []).filter(function (t) { return t.moduleId === moduleName; });
    var all = new Set(), attempted = new Set(), mastered = new Set();
    var s = safeAudit(audit);
    relevant.forEach(function (task) {
      scopedIds(task).forEach(function (qid) {
        all.add(qid);
        var ev = s.events.filter(function (e) { return e.taskId === task.id && e.qid === qid; });
        if (ev.some(function (e) { return e.kind === "attempt" || e.kind === "review"; })) attempted.add(qid);
        var review = lastReview(ev, task.id, qid);
        var changedDown = !!(review && ev.some(function (e) {
          return e.ts > review.ts && e.statusAfter !== "proficient";
        }));
        if (review && review.outcome === "pass" && readStatus(qid) === "proficient" && !changedDown) mastered.add(qid);
      });
    });
    var goal = Math.max(0, Number(target) || 0), mapped = all.size;
    return {
      module: moduleName,
      target: goal,
      mapped: mapped,
      coverageVerified: attempted.size,
      masteryVerified: mastered.size,
      manualClaim: Math.max(0, Number(manualClaim) || 0),
      missingScope: Math.max(0, goal - mapped),
      backlog: Math.max(0, goal - attempted.size),
      verifiedComplete: goal > 0 && mapped === goal && mastered.size === goal
    };
  }

  return {
    dayString: dayString,
    questionKey: questionKey,
    scopedIds: scopedIds,
    newAudit: newAudit,
    safeAudit: safeAudit,
    taskById: taskById,
    eventId: eventId,
    recordPractice: recordPractice,
    lastReview: lastReview,
    evaluateOnline: evaluateOnline,
    recordOffline: recordOffline,
    evaluateOffline: evaluateOffline,
    recordMock: recordMock,
    evaluateMock: evaluateMock,
    evaluateTask: evaluateTask,
    evaluateDay: evaluateDay,
    reconcileQuota: reconcileQuota,
    recordPaperCorrection: recordPaperCorrection,
    evaluateCorrection: evaluateCorrection
  };
});
