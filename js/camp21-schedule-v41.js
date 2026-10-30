/*
 * Camp21 V4.1 Schedule + Correction Reference Module.
 * Pure JavaScript. Does not mutate existing task IDs, scopes, green marks,
 * V3 quotas, or localStorage. The actual UI integration belongs in
 * js/camp21-plan.js after checking the latest code.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Camp21ScheduleV41 = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  var MATH_FULL_MOCK_DAYS = Object.freeze([1, 2]);
  var MAJOR_FULL_MOCK_DAYS = Object.freeze([7, 14, 21]);
  var NET_FOCUS_GOAL = 780;
  var SCHEDULED_STUDY = 850;

  function requireDay(day) {
    var n = Number(day);
    if (!Number.isInteger(n) || n < 1 || n > 21) {
      throw new RangeError("Day must be between 1 and 21");
    }
    return n;
  }

  function minutes(clock) {
    if (!/^\d\d:\d\d$/.test(clock)) throw new Error("Bad clock: " + clock);
    var a = clock.split(":").map(Number);
    if (a[0] > 23 || a[1] > 59) throw new Error("Invalid time: " + clock);
    return a[0] * 60 + a[1];
  }

  function duration(from, to) {
    var a = minutes(from), b = minutes(to);
    return (b - a + 1440) % 1440;
  }

  function slot(from, to, name, isStudy, tag) {
    return {
      start: from, end: to, label: name, study: !!isStudy,
      minutes: duration(from, to), tag: tag || "general"
    };
  }

  function isMathMockDay(day, opts) {
    requireDay(day);
    // If an extra math full mock is chosen, callers must explicitly specify it.
    return MATH_FULL_MOCK_DAYS.includes(day) ||
      !!(opts && opts.extraMathMockDays &&
        opts.extraMathMockDays.includes(day));
  }

  function isMajorMockDay(day) {
    return MAJOR_FULL_MOCK_DAYS.includes(requireDay(day));
  }

  function scheduleForDay(day, options) {
    var d = requireDay(day), mathMock = isMathMockDay(d, options);
    var majorMock = isMajorMockDay(d);
    var result = [
      slot("07:20","08:00","起床、早餐、通勤（不计入净专注）",false,"transit"),
      slot("08:00","08:30","英语作文背默",true,"english"),
      slot("08:30","11:30",mathMock
        ? "数学完整模拟：独立答卷180分钟，不含订正"
        : "数学真题非绿题/旧题攻坚；余时题库训练",
        true,"math-exam"),
      slot("11:30","12:30",mathMock
        ? "数学订正①：阅卷、错因、独立重算（60分钟）"
        : "数学真题订正；若已处理完改刷《邂逅遗憾》",
        true,"math-correction"),
      slot("12:30","13:30","午饭与午休（含可选政治带背，不算净专注）",false,"meal"),
      slot("13:30","14:00","政治肖1000题①",true,"politics"),
      slot("14:00","17:00",majorMock
        ? "专业课完整模考180分钟，订正另外记录"
        : "专业课做题+订正弹性180分钟，例：120+60",
        true,"major"),
      slot("17:00","17:50","英语阅读精读",true,"english"),
      slot("17:50","18:25","晚饭",false,"meal"),
      slot("18:25","19:05","政治肖1000题②及错题",true,"politics")
    ];
    if (mathMock) {
      result.push(slot("19:05","19:35","数学订正②（30分钟）",true,"math-correction"));
      result.push(slot("19:35","20:45","《邂逅遗憾》推进（70分钟）",true,"xhy"));
    } else {
      result.push(slot("19:05","20:45","《邂逅遗憾》推进（100分钟）",true,"xhy"));
    }
    result.push(
      slot("20:45","22:00","波哥/电路/南大期末/芝麻400全量攻坚",true,"major-special"),
      slot("22:00","22:50","闭馆、回家、洗漱",false,"transit"),
      slot("22:50","00:35","880/36讲/30讲/1000基础及复检",true,"math-books")
    );
    var study = result.reduce(function(sum, item){
      return sum + (item.study ? item.minutes : 0);
    },0);
    if (study !== SCHEDULED_STUDY) throw new Error("Bad schedule minutes: " + study);
    return {
      day: d, mathMock: mathMock, majorMock: majorMock,
      scheduledStudyMinutes: study, netFocusGoalMinutes: NET_FOCUS_GOAL,
      slots:result
    };
  }

  function correctionTask(day, paperId, kind) {
    var d=requireDay(day);
    if (kind !== "math" && kind !== "major") throw Error("Unknown correction kind");
    if (!paperId) throw Error("paperId is required");
    return {
      id: "camp-v41-correction-" + kind + "-d" + d + "-" + String(paperId),
      day:d, kind:kind, paperId:String(paperId),
      requiresGrading:true,
      requiresQuestionEvidence:true,
      scheduledCorrectionMinutes:kind==="math" && isMathMockDay(d) ? 90 : null,
      autoComplete:false
    };
  }

  function distinctIds(items) {
    if (!Array.isArray(items)) return [];
    return Array.from(new Set(items.map(String)));
  }

  /*
   * A full math mock's correction is not complete just because 90 minutes
   * were reserved or a button is clicked.
   *
   * Required:
   * - submitted + graded
   * - actual wrong-question IDs
   * - per-question correction evidence for all wrong questions
   * - separate later strict mastery, if requested
   *
   * Do NOT auto-set existing textbook/question statuses here.
   */
  function paperProgress(record) {
    var r=record || {};
    var wrong=distinctIds(r.wrongQuestionIds);
    var corrected=new Set(distinctIds(r.correctedQuestionIds));
    var unresolved=wrong.filter(function(id){return !corrected.has(id);});
    if (!r.fullPaperSubmitted) {
      return {stage:"NOT_SUBMITTED",examDone:false,correctionDone:false,
        strictlyMastered:false,unresolvedWrongIds:unresolved};
    }
    if (!r.graded || !Array.isArray(r.wrongQuestionIds)) {
      return {stage:"SUBMITTED_WAITING_GRADING",examDone:true,
        correctionDone:false,strictlyMastered:false,unresolvedWrongIds:null};
    }
    if (!r.correctionSessionConfirmed || unresolved.length>0) {
      return {stage:"GRADED_WAITING_CORRECTION",examDone:true,
        correctionDone:false,strictlyMastered:false,unresolvedWrongIds:unresolved};
    }
    return {
      stage:r.allAssignedQuestionsStrictlyMastered===true
        ? "STRICT_MASTERED" : "CORRECTED_WAITING_RECHECK",
      examDone:true,correctionDone:true,
      strictlyMastered:r.allAssignedQuestionsStrictlyMastered===true,
      unresolvedWrongIds:[]
    };
  }

  /*
   * The true/false flags in `paperProgress()` must be provided by
   * trusted question-level events in the actual repository.
   * A UI checkbox alone is NOT evidence for strictly mastered.
   */
  function majorFlexAllocation(practiceMinutes, correctionMinutes, fullMock) {
    var p=Number(practiceMinutes), c=Number(correctionMinutes);
    if (![p,c].every(function(n){return Number.isInteger(n)&&n>=0;})) {
      throw new Error("Minutes must be nonnegative integers");
    }
    if (p+c>180) throw new Error("The 14:00–17:00 block only has 180 minutes");
    if (fullMock && (p !== 180 || c !== 0)) {
      throw new Error("A full professional mock takes all 180 minutes");
    }
    return {
      practiceMinutes:p, correctionMinutes:c, unallocatedMinutes:180-p-c,
      fullMock:!!fullMock,
      correctionRequiresSeparateBacklog:!!fullMock
    };
  }

  // Produce view-only metadata; do not mutate stored tasks, ID/scopes/targets.
  function taskScheduleMetadata(task, day) {
    var d=requireDay(day), id=String(task && task.id || "");
    var mock=isMathMockDay(d), majorMock=isMajorMockDay(d);
    var type="unchanged", time=task && task.time || "";
    var note="";
    if (id==="d"+d+"_m_am") {
      type=mock?"math-full-mock":"math-targeted";
      time="08:30–11:30";
      note=mock?"只做题，订正任务独立计算":"旧题与非绿题优先；订正放11:30–12:30";
    } else if (id==="d"+d+"_m_pm") {
      type="math-evening";
      time=mock?"19:35–20:45":"19:05–20:45";
      note=mock?"模考日数学19:05–19:35先订正":"旧题日完整100分钟主攻";
    } else if (id==="d"+d+"_p_pm") {
      type=majorMock?"major-full-mock":"major-flex";
      time="14:00–17:00";
      note=majorMock
        ? "完整180分钟交卷；订正独立列入待处理"
        : "180分钟内做题+订正弹性分配；不宣称严格全真模考";
    } else if (id==="d"+d+"_p_ev") {
      type="major-special";time="20:45–22:00";
    } else if (id==="d"+d+"_night") {
      type="math-night";time="22:50–00:35";
    } else if (id==="d"+d+"_pol") {
      type="politics";time="13:30–14:00 & 18:25–19:05";
    } else if (id==="d"+d+"_eng") {
      type="english";time="08:00–08:30 & 17:00–17:50";
    }
    return {taskId:id, day:d, type:type,time:time,note:note};
  }


  /*
   * Existing repo D1 morning math task mixes s1_zt_2022 and xhy_gs_03.
   * The math exam must be exam-only; do not lose the XHY scope, and don't
   * count it twice in the existing V3 XHY quota.
   * A caller must reconcile overflowScopes against same-day V3 assignments.
   */
  function splitMathMockMorningScope(task, day) {
    var d = requireDay(day);
    if (!isMathMockDay(d) ||
        String(task && task.id) !== "d" + d + "_m_am") {
      throw new Error("Expected a math full-mock morning task");
    }
    var scopes = Array.isArray(task.scopedItems) ? task.scopedItems : [];
    var examScopes = scopes.filter(function(slice){
      return /^s1_zt_20\d{2}$/.test(String(slice.chapterId || ""));
    });
    var overflowScopes = scopes.filter(function(slice){
      return !/^s1_zt_20\d{2}$/.test(String(slice.chapterId || ""));
    });
    if (!examScopes.length) throw new Error("Math exam scope not found");
    function size(arr) {
      return arr.reduce(function(sum, slice){
        return sum + new Set(slice.indices || []).size;
      },0);
    }
    return {
      exam: Object.assign({},task,{
        time:"08:30–11:30",
        catLabel:"数学·完整3h模考（不含订正）",
        scopedItems:examScopes,
        targetCount:size(examScopes),
        scheduleNotes:"订正①11:30–12:30；订正②19:05–19:35"
      }),
      overflowScopes:overflowScopes,
      overflowCount:size(overflowScopes),
      needsQuotaReconciliation:overflowScopes.length>0
    };
  }

  return {
    MATH_FULL_MOCK_DAYS:MATH_FULL_MOCK_DAYS,
    MAJOR_FULL_MOCK_DAYS:MAJOR_FULL_MOCK_DAYS,
    NET_FOCUS_GOAL:NET_FOCUS_GOAL,
    SCHEDULED_STUDY:SCHEDULED_STUDY,
    duration:duration,scheduleForDay:scheduleForDay,
    isMathMockDay:isMathMockDay,isMajorMockDay:isMajorMockDay,
    correctionTask:correctionTask,paperProgress:paperProgress,
    majorFlexAllocation:majorFlexAllocation,taskScheduleMetadata:taskScheduleMetadata,
    splitMathMockMorningScope:splitMathMockMorningScope
  };
});
