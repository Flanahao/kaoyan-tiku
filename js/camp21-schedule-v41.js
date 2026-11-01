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
  var SCHEDULED_STUDY = 845;

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
      slot("07:20","08:00","起床、早餐、赶赴图书馆（途中泛听政治音频带背，不计入净专注）",false,"transit"),
      slot("08:00","08:30","【英语·早间开机】大小作文功能句与模板段背默",true,"english"),
      slot("08:30","11:30",mathMock
        ? "🔥【数学·3h考场整块】全真模考：独立答卷180分钟，不含订正"
        : "🔥【数学·3h考场整块】09–23真题非绿题/旧题攻坚，严禁翻看答案",
        true,"math-exam"),
      slot("11:30","12:30",mathMock
        ? "【数学·订正】试卷阅卷估分、错因归类与错题独立重算（60分钟）"
        : "【数学·订正】真题做题订正与深度反思；余时转刷《邂逅遗憾》（60分钟）",
        true,"math-correction"),
      slot("12:30","13:30","🍱 午饭 + 💤 强制午休深度趴睡（25–30m充能，不计入净专注）",false,"meal"),
      slot("13:30","14:00","【政治·上半场】《27肖1000题》刷题25–30题（快速开机拉升专注）",true,"politics"),
      slot("14:00","17:00",majorMock
        ? "🔥【专业课·3h考场整块】南大851/华科824全真模考180分钟，订正另外记录"
        : "🔥【专业课·3h考场整块】南大851/华科824真题做题+订正弹性180分钟",
        true,"major"),
      slot("17:00","17:50","【英语·阅读】真题阅读精读1–2篇与生词语境复盘",true,"english"),
      slot("17:50","18:30","🍜 晚饭与散步调整（错峰就餐，放松大脑，18:30准时回座）",false,"meal"),
      slot("18:30","19:00","【政治·下半场】《27肖1000题》刷题25题 + 当日错题复盘标绿",true,"politics"),
      slot("19:00","20:30","🔥【数学·晚间主攻】《邂逅遗憾》专项技巧攻坚（90分钟吃透核心题型）",true,"xhy"),
      slot("20:30","21:20","🔥【专业课·波哥攻坚】波哥全套（讲义+强化+习题集+电路专题，50分钟夯实）",true,"major-boge"),
      slot("21:20","22:20","🔥【专业课·芝麻大题】《芝麻400题》大题推导专场（15–20m/题，精做4–6道大题）",true,"major-zhima"),
      slot("22:20","22:50","🚲 闭馆离开、通勤回家、洗漱换衣",false,"transit"),
      slot("22:50","00:15","🔥【数学·深夜筑基】《张宇30讲》核心定理与例题清透（85分钟彻底脱载880/36讲）",true,"math-30"),
      slot("00:15","00:30","战报打卡与安稳就寝准备（00:30前准时入睡，睡足7h05m深度充能）",false,"sleep")
    ];
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
      scheduledCorrectionMinutes:kind==="math" && isMathMockDay(d) ? 60 : null,
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
      note=mock?"纯做题180m，订正任务独立计算":"09–23真题旧题与非绿题攻坚；订正放11:30–12:30";
    } else if (id==="d"+d+"_math_correction") {
      type="math-correction";
      time="11:30–12:30";
      note="真题/模考深度订正与错因复盘，余时转刷邂逅遗憾";
    } else if (id==="d"+d+"_m_pm") {
      type="math-xhy";
      time="19:00–20:30";
      note="晚间90分钟专注攻坚《邂逅遗憾》专项技巧";
    } else if (id==="d"+d+"_p_pm") {
      type=majorMock?"major-full-mock":"major-flex";
      time="14:00–17:00";
      note=majorMock
        ? "南大851/华科824完整180分钟交卷；订正独立列入待处理"
        : "南大851/华科824做题+订正弹性180分钟";
    } else if (id==="d"+d+"_p_ev" || id==="d"+d+"_p_bg") {
      type="major-boge";
      time="20:30–21:20";
      note="波哥全套讲义/习题/强化及电路专题攻坚（50m）";
    } else if (id==="d"+d+"_p_zm") {
      type="major-zhima";
      time="21:20–22:20";
      note="《芝麻400题》综合大题推导专场（15–20m/题，精做4–6道大题）";
    } else if (id==="d"+d+"_night") {
      type="math-30";
      time="22:50–00:15";
      note="《张宇30讲》深夜基础筑基与清透（彻底脱载880/36讲）";
    } else if (id==="d"+d+"_pol") {
      type="politics";
      time="13:30–14:00 & 18:30–19:00";
      note="午间25–30题快速开机 + 晚间25题与错题复盘标绿";
    } else if (id==="d"+d+"_eng") {
      type="english";
      time="08:00–08:30 & 17:00–17:50";
      note="早间作文功能句背默30m + 傍晚真题精读50m";
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
        scheduleNotes:"订正11:30–12:30（余时转刷邂逅遗憾）"
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
