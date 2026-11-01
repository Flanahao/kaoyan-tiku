/* ==========================================================================
   🔥 Kyson 21天魔鬼特训营 · 每日任务清单与实时进度系统 (camp21-plan.js)
   覆盖周期：Day 0 (2026-10-30 预热) + Day 1 (2026-10-31) ~ Day 21 (2026-11-20)
   包含：上下午双3h考场整块、邂逅遗憾、36讲/880/30讲、波哥全套、⚡电路专题、🎓南大期末题、肖1000、英语
   ========================================================================== */
(function () {
  'use strict';

  var STATE_KEY_SUFFIX = 'kaoyan_camp21_state_v1';
  var SETTINGS_KEY_SUFFIX = 'study_dashboard_settings_v1';

  // V3 零删减全量配额数据（6879待绿/核验 + 801历史绿题复检 = 7680可量化题次）
  var V3_FULL_DATA = {
  "version": "5.0-refined-focus",
  "source": "用户2026-10-30上传PDF题库备份统计 + 原始逐日任务；非题库真实最新状态，须本地按备份校准",
  "begin": "2026-10-31",
  "end": "2026-11-20",
  "fixed_net_focus_goal_minutes": 780,
  "study_schedule_minutes": 845,
  "totals": {
    "math_truth": 226,
    "xhy": 1166,
    "880": 0,
    "36": 0,
    "30_and_1000basic": 759,
    "politics": 1131,
    "bogo_1_8": 801,
    "bogo_ch9": 49,
    "nju851": 193,
    "hust824": 233,
    "zhima400": 105
  },
  "definition": {
    "pending_target": "原PDF记录的待绿题目数；此处按未来21日拆配额，不代表已经熟练",
    "zhima400": "完整400题首次覆盖。原用户允许专题选刷；为了满足此次全覆盖要求按400题全部纳入，若实际题量不同按真实书籍校正",
    "bogo_ch9": "Ch9讲义10+习题39；强化Ch7的18道不重复加算（已包含在1-8的994题统计）",
    "offline_electrical_and_nju_final": "源PDF未给出手头讲义/期末题精确题量，必须扫描本地资料建立全量子任务，不得以4晚/6晚代替全量保证",
    "nju_gap": "源PDF整体193待绿，而显式列出的各年内容合计183，差额10列入D20待对账补遗，不能凭空编造具体题号",
    "mastery": "必须通过不看答案独立复做才可标绿；首次覆盖数与真实熟练数分开",
    "counting": "不同材料跨书题目不去重；同一书章节、同一题本身不得重复计数"
  },
  "days": [
    {
      "day": 1,
      "date": "2026-10-31",
      "math_truth_task": "2022数一整卷22题",
      "math_truth_pending_target": 22,
      "xhy_chapter_scope": "Ch3积分未标21+红黄35",
      "xhy_pending_target": 56,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 27,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 5,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2007/08/09",
      "major_special_scope": "波哥Ch4傅里叶；1–3章旧错题回炉",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 54,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 2,
      "date": "2026-11-01",
      "math_truth_task": "2023数一整卷22题",
      "math_truth_pending_target": 22,
      "xhy_chapter_scope": "Ch3积分剩26+Ch1极限前35",
      "xhy_pending_target": 61,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 44,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 6,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2015+2021剩余",
      "major_special_scope": "波哥Ch4继续；讲义与基础同步",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 47,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 3,
      "date": "2026-11-02",
      "math_truth_task": "2009非绿19题",
      "math_truth_pending_target": 19,
      "xhy_chapter_scope": "Ch1极限36–95",
      "xhy_pending_target": 60,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 22,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 5,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2010/11",
      "major_special_scope": "波哥Ch4收官；强化1–3章旧错",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 51,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 4,
      "date": "2026-11-03",
      "math_truth_task": "2010非绿8+2011非绿9题",
      "math_truth_pending_target": 17,
      "xhy_chapter_scope": "Ch1极限96–129+Ch2导数1–35",
      "xhy_pending_target": 69,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 24,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 4,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2016",
      "major_special_scope": "波哥Ch5拉氏、基础错题",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 40,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 5,
      "date": "2026-11-04",
      "math_truth_task": "2012非绿16题",
      "math_truth_pending_target": 16,
      "xhy_chapter_scope": "Ch2导数36–101",
      "xhy_pending_target": 66,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 21,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 5,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2012/13/14",
      "major_special_scope": "波哥Ch5收官，强化/基础",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 49,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 6,
      "date": "2026-11-05",
      "math_truth_task": "2013非绿15题",
      "math_truth_pending_target": 15,
      "xhy_chapter_scope": "Ch4微分方程57",
      "xhy_pending_target": 57,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 7,
      "hust824_pending_target": 12,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 5,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2017 + 南大851 2015",
      "major_special_scope": "波哥Ch5讲义与基础清零",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 46,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 7,
      "date": "2026-11-06",
      "math_truth_task": "2014非绿14题",
      "math_truth_pending_target": 14,
      "xhy_chapter_scope": "Ch5多元微分68",
      "xhy_pending_target": 68,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 10,
      "zhima400_firstpass_target": 5,
      "politics_pending_target": 55,
      "major_exam_block": "专业课模拟卷①",
      "major_special_scope": "电路D1/4：Ch9讲义10；强化Ch7 18计入波哥1–8指标",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 1,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 54,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 8,
      "date": "2026-11-07",
      "math_truth_task": "2015非绿10+2016非绿14题",
      "math_truth_pending_target": 24,
      "xhy_chapter_scope": "Ch6二重积分46+Ch7级数10",
      "xhy_pending_target": 56,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 20,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 20,
      "zhima400_firstpass_target": 4,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2018",
      "major_special_scope": "电路D2/4：Ch9习题前20+手头讲义",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 9,
      "date": "2026-11-08",
      "math_truth_task": "2017非绿15题",
      "math_truth_pending_target": 15,
      "xhy_chapter_scope": "Ch7无穷级数11–88",
      "xhy_pending_target": 78,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 23,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 19,
      "zhima400_firstpass_target": 5,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2016/17/18",
      "major_special_scope": "电路D3/4：Ch9习题后19+系统函数",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 40,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 10,
      "date": "2026-11-09",
      "math_truth_task": "2018非绿14题",
      "math_truth_pending_target": 14,
      "xhy_chapter_scope": "Ch8空间几何30+Ch9线面积分35",
      "xhy_pending_target": 65,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 23,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 6,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2019",
      "major_special_scope": "电路D4/4：手头资料全部完成；未清零继续挂账",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 56,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 11,
      "date": "2026-11-10",
      "math_truth_task": "2019非绿16题",
      "math_truth_pending_target": 16,
      "xhy_chapter_scope": "Ch9线面积分后36+Ch10高数20+线代Ch1前15",
      "xhy_pending_target": 71,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 21,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 5,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2019/2024",
      "major_special_scope": "南大期末D1/6：卷积/时域；波哥Ch6",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 47,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 12,
      "date": "2026-11-11",
      "math_truth_task": "2020非绿21题",
      "math_truth_pending_target": 21,
      "xhy_chapter_scope": "线代Ch1后20+Ch2前35",
      "xhy_pending_target": 55,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 26,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 4,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2020",
      "major_special_scope": "南大期末D2/6：傅里叶/采样；波哥Ch6",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 41,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 13,
      "date": "2026-11-12",
      "math_truth_task": "2021非绿11题",
      "math_truth_pending_target": 11,
      "xhy_chapter_scope": "线代Ch2后21+Ch3向量44+Ch4前10",
      "xhy_pending_target": 75,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 18,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 6,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2025/2026",
      "major_special_scope": "南大期末D3/6：拉氏/s域；波哥Ch6",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 35,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 14,
      "date": "2026-11-13",
      "math_truth_task": "2009–2011真题复检",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "线代Ch4后11+Ch5相似29+Ch6前35",
      "xhy_pending_target": 75,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 7,
      "politics_pending_target": 55,
      "major_exam_block": "专业课模拟卷②",
      "major_special_scope": "南大期末D4/6：电路综合；波哥Ch7",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 1,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 51,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 15,
      "date": "2026-11-14",
      "math_truth_task": "2012–2014真题复检",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "线代Ch6后7+Ch7数一19+概率Ch1 18+Ch2前20",
      "xhy_pending_target": 64,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 28,
      "bogo_ch1to8_pending_target": 40,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 5,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2022",
      "major_special_scope": "南大期末D5/6：Z变换；波哥Ch8",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 34,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 16,
      "date": "2026-11-15",
      "math_truth_task": "2015–2017真题复检",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "概率Ch2后20+Ch3前35",
      "xhy_pending_target": 55,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 28,
      "bogo_ch1to8_pending_target": 40,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 5,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2023",
      "major_special_scope": "南大期末D6/6：全部题量清零；波哥强化1–3旧错",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 59,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 17,
      "date": "2026-11-16",
      "math_truth_task": "2018–2020真题复检",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "概率Ch3后10+Ch4数字特征49",
      "xhy_pending_target": 59,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 28,
      "bogo_ch1to8_pending_target": 40,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 5,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2024",
      "major_special_scope": "波哥1–8剩余所有待绿题+芝麻400",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 18,
      "date": "2026-11-17",
      "math_truth_task": "2021–2023真题复检",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "概率Ch5 13+Ch6 20+Ch7 21+Ch8 22",
      "xhy_pending_target": 76,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 44,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 40,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 4,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2020–23全部待绿",
      "major_special_scope": "波哥1–8剩余所有待绿题+芝麻400",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 56,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 19,
      "date": "2026-11-18",
      "math_truth_task": "2009–2023全部342题错题抽检",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "高数错题复检",
      "xhy_pending_target": 0,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 40,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 5,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2015–19错题盲刷",
      "major_special_scope": "电路专题全量查缺、手头资料复做",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 40,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 20,
      "date": "2026-11-19",
      "math_truth_task": "2009–2023全部342题终验",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "线代/概率错题复检",
      "xhy_pending_target": 0,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 10,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 40,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 4,
      "politics_pending_target": 55,
      "major_exam_block": "南大851对账补遗+华科2020–24二刷",
      "major_special_scope": "南大期末题全量查缺、手头资料复做",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 35,
      "zy1000basic_pending_target": 0
    },
    {
      "day": 21,
      "date": "2026-11-20",
      "math_truth_task": "数学真题全卷结果与错因总验收",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "全书绿标验收",
      "xhy_pending_target": 0,
      "ll880_pending_target": 0,
      "zy36_pending_target": 0,
      "zy30_and_zy1000basic_pending_target": 65,
      "nju851_pending_target": 0,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 43,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 8,
      "politics_pending_target": 31,
      "major_exam_block": "专业课模拟卷③+全科验收",
      "major_special_scope": "波哥1–9全部+芝麻400+各校真题总验收",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 1,
      "historic_green_recheck_target": 41,
      "zy30_pending_target": 35,
      "zy1000basic_pending_target": 0
    }
  ],
  "historic_green_recheck_total": 801,
  "historic_green_recheck_by_module": {
    "math_truth": 116,
    "xhy": 53,
    "880": 185,
    "36": 42,
    "30_and_1000basic": 157,
    "bogo_1_8": 193,
    "nju851": 36,
    "hust824": 2,
    "politics": 17
  },
  "full_inventory_numeric_total": 7680,
  "definitions_update": "政治带背30分钟=通勤15分钟+午饭散步15分钟，均不计入780分钟净专注。"
};

  var V3_QUOTA_MODULES = [
    { key: 'math_truth_pending_target', id: 'math_truth', label: '数一09-23真题(待绿)', total: 226, green: 116, bookTotal: 342, cat: 'math' },
    { key: 'xhy_pending_target', id: 'xhy', label: '《邂逅遗憾》25章(待绿)', total: 1166, green: 53, bookTotal: 1219, cat: 'math' },
    { key: 'zy30_pending_target', id: 'zy30', label: '《基础30讲》30章(待核验)', total: 759, green: 113, bookTotal: 872, cat: 'math' },
    { key: 'll880_pending_target', id: 'll880', label: '《李林880》(已舍弃减负)', total: 0, green: 185, bookTotal: 1181, cat: 'math' },
    { key: 'zy36_pending_target', id: 'zy36', label: '《强化36讲》(已舍弃减负)', total: 0, green: 42, bookTotal: 461, cat: 'math' },
    { key: 'zy1000basic_pending_target', id: 'zy1000b', label: '《1000题基础篇》(已舍弃减负)', total: 0, green: 44, bookTotal: 550, cat: 'math' },
    { key: 'nju851_pending_target', id: 'nju851', label: '南大851真题20套(待绿)', total: 193, green: 36, bookTotal: 229, cat: 'major' },
    { key: 'hust824_pending_target', id: 'hust824', label: '华科824近10套(待绿)', total: 233, green: 2, bookTotal: 235, cat: 'major' },
    { key: 'bogo_ch1to8_pending_target', id: 'bogo18', label: '波哥1-8章讲义/习题/强化(待绿)', total: 801, green: 193, bookTotal: 994, cat: 'major' },
    { key: 'bogo_ch9_pending_target', id: 'bogo9', label: '波哥Ch9电路讲义10+习题39', total: 49, green: 3, bookTotal: 49, cat: 'major' },
    { key: 'zhima400_firstpass_target', id: 'zhima400', label: '《芝麻400题》核心大题专场(每日4-6道大题)', total: 105, green: 0, bookTotal: 105, cat: 'major' },
    { key: 'politics_pending_target', id: 'politics', label: '《27肖1000》52章(待绿)', total: 1131, green: 17, bookTotal: 1148, cat: 'politics' },
    { key: 'historic_green_recheck_target', id: 'recheck801', label: '🟢历史已绿题全科复检队列', total: 801, green: 801, bookTotal: 801, cat: 'recheck' }
  ];

  // 14h05m (845m) 铁血作息时间块（含午饭、午休、晚饭、22:20闭馆通勤）
  var CAMP21_SCHEDULE_SLOTS = [
    { start: '07:20', end: '08:00', dur: '40m', scene: '居家/通勤', title: '起床 + 早餐 + 赶赴图书馆（路上泛听政治带背，不计入净专注）', target: '不赖床，通勤途中完成政治带背输入' },
    { start: '08:00', end: '08:30', dur: '30m', scene: '图书馆', title: '【英语·早间开机】大小作文功能句与模板段背默', target: '默写昨日模板句 + 背熟今日功能段 (30m)' },
    { start: '08:30', end: '11:30', dur: '3h00m', scene: '图书馆·考场块', title: '🔥【数学·3h考场整块】09–23真题全真模考或非绿题攻坚（纯做题180m，不翻答案）', target: 'D1/D2全真模考；D3起真题非绿题重做，严禁翻看答案', hot: true },
    { start: '11:30', end: '12:30', dur: '1h00m', scene: '图书馆', title: '【数学·订正】真题试卷阅卷估分、错因归类与错题独立重算', target: '模考日深度订正60m；非模考日深度订正旧题，结余时间转刷《邂逅遗憾》', hot: true },
    { start: '12:30', end: '13:30', dur: '1h00m', scene: '餐厅/图书馆', title: '🍱 午饭 + 💤 强制午休深度趴睡（不计入净专注）', target: '闭眼充能25–30m，满血迎战下午3h专业课考场块' },
    { start: '13:30', end: '14:00', dur: '30m', scene: '图书馆', title: '【政治·上半场】《27肖1000题》刷题 25–30 题', target: '午休后快速开机，用选择题拉起专注 (30m)' },
    { start: '14:00', end: '17:00', dur: '3h00m', scene: '图书馆·考场块', title: '🔥【专业课·3h下午大整块】南大851/华科824真题做题+订正弹性180m（D7/14/21全真模考）', target: '普通日120m做题+60m订正弹性调整；模考日180m全真作答且订正另记', hot: true },
    { start: '17:00', end: '17:50', dur: '50m', scene: '图书馆', title: '【英语·阅读精读】1–2篇真题阅读精读与生词语境复盘', target: '3h高强度理工计算后，精读真题换挡大脑 (50m)' },
    { start: '17:50', end: '18:30', dur: '40m', scene: '餐厅', title: '🍜 晚饭与散步休息（错峰就餐，放松大脑，18:30准时回座）', target: '错峰进餐7分饱，散步放松大脑，18:30准时坐回座位' },
    { start: '18:30', end: '19:00', dur: '30m', scene: '图书馆', title: '【政治·下半场】《27肖1000题》刷题 25 题 + 当日错题复盘标绿', target: '搞定今日50–55题定额，顺手清掉错题 (30m)' },
    { start: '19:00', end: '20:30', dur: '1h30m', scene: '图书馆', title: '🔥【数学·晚间主攻】《邂逅遗憾》专项技巧攻坚（90分钟吃透核心题型）', target: '晚间90分钟全量攻坚《邂逅遗憾》题型与解法技巧', hot: true },
    { start: '20:30', end: '21:20', dur: '50m', scene: '图书馆', title: '🔥【专业课·波哥攻坚】波哥全套（讲义+强化+习题集+电路专题，50分钟夯实）', target: '掌握波哥信号全套体系与电路专题，绝不放手 (50m)', hot: true },
    { start: '21:20', end: '22:20', dur: '1h00m', scene: '图书馆', title: '🔥【专业课·芝麻大题】《芝麻400题》大题推导专场（15–20m/题，精做4–6道大题）', target: '全真推导考场大题步骤，规范解题格式，每日精做4–6道深度大题 (60m)', hot: true },
    { start: '22:20', end: '22:50', dur: '30m', scene: '闭馆/回家', title: '🚲 闭馆回家 + 到家立刻洗漱换睡衣', target: '绝不躺床刷手机，22:50准时坐到书桌前' },
    { start: '22:50', end: '00:15', dur: '1h25m', scene: '居家·深夜局', title: '🔥【数学·深夜筑基】《张宇30讲》核心定理与例题清透（彻底脱载880/36讲）', target: '深夜85m集中清透30讲基础筑基与例题吃透', hot: true },
    { start: '00:15', end: '00:30', dur: '15m', scene: '居家·就寝准备', title: '战报核对打卡 + 00:30前安稳入睡，睡足 7h05m 深度睡眠', target: '今日任务闭环，安稳就寝，满血迎接新一天' }
  ];

  // 21天（含Day 0今晚预热）完整作战计划表（V5.0精简做减法版）
  var CAMP21_DAYS = [
  {
    "day": 0,
    "date": "2026-10-30",
    "label": "Day 0 · 今晚预热局",
    "week": "开营预热（今晚 21:15–00:15）",
    "focus": "熟悉特训指挥舱 + 邂逅高数第3章积分扫尾 + 30讲第1讲点绿",
    "tasks": [
      {
        "id": "d0_math1",
        "cat": "math",
        "catLabel": "数学·预热",
        "time": "21:15–22:30",
        "title": "《邂逅遗憾》高数第3章积分：清完剩余21道未标题",
        "desc": "第3章积分目前已绿50题，还剩21道未标，今晚先热身干掉未标题！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章·积分(21道未标)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 21,
        "mode": "done",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章·积分(21道未标)",
            "indices": [
              109,
              110,
              111,
              112,
              115,
              116,
              117,
              118,
              119,
              120,
              121,
              122,
              123,
              124,
              125,
              126,
              127,
              128,
              129,
              130,
              131
            ],
            "taskType": "clear_unmarked",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-10-30",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null
      },
      {
        "id": "d0_major1",
        "cat": "MajorSpecial",
        "catLabel": "⚡电路/波哥预热",
        "time": "22:30–23:30",
        "title": "波哥习题集第4章傅里叶：清掉剩余15道未标题",
        "desc": "习题集第4章已做59/74题，先把最后15道未标题收尾，准备明天正式开营！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_04",
            "label": "波哥习题集第4章(15道未标)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 15,
        "mode": "done",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_04",
            "label": "波哥习题集第4章(15道未标)",
            "indices": [
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              70,
              71,
              72,
              73
            ],
            "taskType": "clear_unmarked",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-10-30",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null
      },
      {
        "id": "d0_night",
        "cat": "night",
        "catLabel": "居家·点绿预热",
        "time": "23:30–00:15",
        "title": "《基础30讲》高数第1讲快速过筛点绿 + 准备明日2022数一真题答题卡",
        "desc": "纸质书已做过，快速看题想思路点🟢熟练，明天08:30准时开启Day 1！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch1",
            "label": "30讲高数第1讲(48道未标)",
            "moduleId": "other"
          }
        ],
        "targetCount": 48,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch1",
            "label": "30讲高数第1讲(48道未标)",
            "indices": [
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-10-30",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 1,
    "date": "2026-10-31",
    "label": "Day 1 (10.31 周六)",
    "week": "第一周 · 22/23真题模考 & 36讲线代收官 & 波哥傅氏拉氏",
    "focus": "22年数一3h模考 + 南大07-09三套连刷 + 邂逅第3章积分错题 + 36讲线代1-3讲",
    "tasks": [
      {
        "id": "d1_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大小作文功能段背默(30m) + 下午真题阅读精读2篇 & 生词本复盘(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2024",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-10-31",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d1_eng:essay_recite",
          "d1_eng:reading_practice"
        ]
      },
      {
        "id": "d1_m_am",
        "cat": "math",
        "catLabel": "数学·完整3h模考（不含订正）",
        "time": "08:30–11:30",
        "title": "2022年数一真题全卷模考（纯做题180m，不含订正）",
        "desc": "08:30-11:30严格掐表3h独立完成2022年真题22题；严禁翻看答案；订正由独立订正任务记录。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2022",
            "label": "22年数一真题(22题)",
            "moduleId": "math_truth"
          }
        ],
        "targetCount": 22,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2022",
            "label": "22年数一真题(22题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          }
        ],
        "date": "2026-10-31",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "scheduleNotes": "订正11:30–12:30（余时转刷邂逅遗憾）"
      },
      {
        "id": "d1_math_correction",
        "date": "2026-10-31",
        "day": 1,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "2022年数一试卷深度订正与错因复盘（90分钟）",
        "desc": "11:30–12:30核对答案估分、错题归类分析与独立重算；余时转刷《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_2022",
        "paperTitle": "2022年考研数学一真题试卷",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": true,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d1_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》马原导论+第1章(前55题) + 复盘第4章10道错题 + 通勤带背30m",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100402",
            "label": "马原·导论(9题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100403",
            "label": "马原·第1章(题1–46)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100406",
            "label": "马原·第4章政经(错题前10道)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 64,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100402",
            "label": "马原·导论(9题)",
            "indices": [
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100403",
            "label": "马原·第1章(题1–46)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100406",
            "label": "马原·第4章政经(错题前10道)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              7,
              8,
              9,
              10
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-10-31",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null
      },
      {
        "id": "d1_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【南大851三套连刷】2007年(11题) + 2008年(11题) + 2009年(11题)",
        "desc": "14:00–17:00内根据卷面难度弹性分配做题与订正时间（如120m做题+60m订正，总和≤180m）。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_07",
            "label": "南大07真题",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_08",
            "label": "南大08真题",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_09",
            "label": "南大09真题",
            "moduleId": "other"
          }
        ],
        "targetCount": 27,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_07",
            "label": "南大07真题",
            "indices": [
              0,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_08",
            "label": "南大08真题",
            "indices": [
              2,
              6,
              7,
              8,
              9,
              10
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_09",
            "label": "南大09真题",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-10-31",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "flexTotalMinutes": 180
      },
      {
        "id": "d1_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》高数第3章积分：攻坚40题",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章·积分(40题)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 40,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章·积分(40题)",
            "indices": [
              0,
              3,
              6,
              7,
              8,
              12,
              13,
              14,
              17,
              18,
              27,
              28,
              30,
              31,
              32,
              33,
              36,
              37,
              38,
              39,
              41,
              43,
              45,
              49,
              51,
              53,
              54,
              55,
              56,
              59,
              60,
              61,
              62,
              65,
              66,
              69,
              70,
              77,
              78,
              79
            ],
            "moduleId": "xhy"
          }
        ],
        "date": "2026-10-31",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null
      },
      {
        "id": "d1_p_ev",
        "cat": "major",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "波哥第4章傅里叶(上)：强化习题集第4章(前30题) + 基础习题集第4章错题(前15题)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_04",
            "label": "波哥强化第4章(前30道非绿)",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_04",
            "label": "波哥习题集第4章(错题前15道)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 45,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_04",
            "label": "波哥强化第4章(前30道非绿)",
            "indices": [
              3,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_04",
            "label": "波哥习题集第4章(错题前15道)",
            "indices": [
              3,
              6,
              7,
              9,
              14,
              15,
              16,
              18,
              20,
              30,
              32,
              33,
              42,
              43,
              44
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-10-31",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null
      },
      {
        "id": "d1_p_zm",
        "date": "2026-10-31",
        "day": 1,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】26芝麻南大851模拟卷(一)·大题推导(前5题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 5,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_01",
            "label": "26芝麻南大851模拟卷(一)·大题推导(前5题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_01",
            "label": "26芝麻南大851模拟卷(一)·大题推导(前5题)",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d1_night",
        "date": "2026-10-31",
        "day": 1,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲高数第1讲·函数极限与连续（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 54,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch1",
            "label": "30讲高数第1讲·函数极限与连续",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch1",
            "label": "30讲高数第1讲·函数极限与连续",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 2,
    "date": "2026-11-01",
    "label": "Day 2 (11.01 周日)",
    "week": "第一周 · 22/23真题模考 & 36讲线代收官 & 波哥傅氏拉氏",
    "focus": "23年数一3h模考 + 华科15&21真题 + 邂逅第3章收官&第1章启动 + 36讲线代4-6讲",
    "tasks": [
      {
        "id": "d2_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间小作文格式与模板背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2024",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-01",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d2_eng:essay_recite",
          "d2_eng:reading_practice"
        ]
      },
      {
        "id": "d2_m_am",
        "cat": "math",
        "catLabel": "数学·完整3h模考（不含订正）",
        "time": "08:30–11:30",
        "title": "2023年数一真题全卷模考（纯做题180m，不含订正）",
        "desc": "08:30-11:30全真模考2023年真题22题；独立计时作答，严禁翻看答案；订正由独立订正任务记录。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2023",
            "label": "23年数一真题(22题)",
            "moduleId": "math_truth"
          }
        ],
        "targetCount": 22,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2023",
            "label": "23年数一真题(22题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          }
        ],
        "date": "2026-11-01",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "scheduleNotes": "订正11:30–12:30（余时转刷邂逅遗憾）"
      },
      {
        "id": "d2_math_correction",
        "date": "2026-11-01",
        "day": 2,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "2023年数一试卷深度订正与错因复盘（90分钟）",
        "desc": "11:30–12:30核对答案估分、错题归类分析与独立重算；余时转刷《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_2023",
        "paperTitle": "2023年考研数学一真题试卷",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": true,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d2_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》马原第1章收尾(后37题) + 第2章认识论(前20题) + 复盘第4章错题",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100403",
            "label": "马原·第1章(题47–83收官)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100404",
            "label": "马原·第2章(题1–20)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 57,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100403",
            "label": "马原·第1章(题47–83收官)",
            "indices": [
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              70,
              71,
              72,
              73,
              74,
              75,
              76,
              77,
              78,
              79,
              80,
              81,
              82
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100404",
            "label": "马原·第2章(题1–20)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-01",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null
      },
      {
        "id": "d2_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【华科824】2015年真题(18题全真) + 2021年真题扫尾(清8未标+18错题)",
        "desc": "14:00–17:00内根据卷面难度弹性分配做题与订正时间（如120m做题+60m订正，总和≤180m）。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_15",
            "label": "华科15真题(18题)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_21",
            "label": "华科21真题(28题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 44,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_15",
            "label": "华科15真题(18题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_21",
            "label": "华科21真题(28题)",
            "indices": [
              0,
              1,
              2,
              3,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-01",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "flexTotalMinutes": 180
      },
      {
        "id": "d2_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》高数第3章积分：攻坚61题",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章·积分(61题)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 61,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章·积分(61题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              85,
              86,
              87,
              88,
              90,
              91,
              94,
              95,
              96,
              98,
              99,
              100,
              101,
              102,
              103,
              104,
              105,
              106,
              107,
              108,
              114
            ],
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-01",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null
      },
      {
        "id": "d2_p_ev",
        "cat": "major",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "波哥第4章傅里叶(中)：强化第4章(推至50题) + 基础习题集第4章(74题全部清零全绿！)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_04",
            "label": "波哥强化第4章(中20道非绿)",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_04",
            "label": "波哥习题集第4章(最后12道错题收官)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 32,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_04",
            "label": "波哥强化第4章(中20道非绿)",
            "indices": [
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_04",
            "label": "波哥习题集第4章(最后12道错题收官)",
            "indices": [
              45,
              46,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-01",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null
      },
      {
        "id": "d2_p_zm",
        "date": "2026-11-01",
        "day": 2,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】26芝麻南大851模拟卷(一)·大题推导(后6题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 6,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_01",
            "label": "26芝麻南大851模拟卷(一)·大题推导(后6题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_01",
            "label": "26芝麻南大851模拟卷(一)·大题推导(后6题)",
            "indices": [
              5,
              6,
              7,
              8,
              9,
              10
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d2_night",
        "date": "2026-11-01",
        "day": 2,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲高数第2讲·数列极限 + 30讲高数第3讲·一元函数微分学概念（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 47,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch2",
            "label": "30讲高数第2讲·数列极限",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch3",
            "label": "30讲高数第3讲·一元函数微分学概念",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch2",
            "label": "30讲高数第2讲·数列极限",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch3",
            "label": "30讲高数第3讲·一元函数微分学概念",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 3,
    "date": "2026-11-02",
    "label": "Day 3 (11.02 周一)",
    "week": "第一周 · 22/23真题模考 & 36讲线代收官 & 波哥傅氏拉氏",
    "focus": "09年真题清零 + 南大10-11真题 + 邂逅第1章推进至95题 + 36讲线代全绿收官！",
    "tasks": [
      {
        "id": "d3_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大作文首段与图画描述背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2023",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-02",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d3_eng:essay_recite",
          "d3_eng:reading_practice"
        ],
        "day": 3
      },
      {
        "id": "d3_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "2009年数一真题(19道非绿题重做清零) + 无缝接《邂逅遗憾》高数第1章(推至65题)",
        "desc": "09年真题共19道🟡/🔴题，用1.5h–2h全部重算变绿；剩余时间+11:30后推进邂逅第1章25题！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2009",
            "label": "09年数一真题(23题)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅高数第1章(题41–65)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 44,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2009",
            "label": "09年数一真题(23题)",
            "indices": [
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅高数第1章(题41–65)",
            "indices": [
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-02",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 3,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d3_math_correction",
        "date": "2026-11-02",
        "day": 3,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d3",
        "paperTitle": "数一真题深度订正专场 (D3)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d3_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》马原第2章认识论收官(后39题) + 第3章唯物史观(前16题)",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100404",
            "label": "马原·第2章(题21–59收官)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100405",
            "label": "马原·第3章(题1–16)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 55,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100404",
            "label": "马原·第2章(题21–59收官)",
            "indices": [
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100405",
            "label": "马原·第3章(题1–16)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-02",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 3
      },
      {
        "id": "d3_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【南大851两套连刷】2010年真题(11题) + 2011年真题(11题)",
        "desc": "下午3h考场块完整拿下南大10、11两年真题共22道大题，当场订正全部标绿。（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_10",
            "label": "南大10真题(11题)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_11",
            "label": "南大11真题(11题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 22,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_10",
            "label": "南大10真题(11题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_11",
            "label": "南大11真题(11题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-02",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 3,
        "flexTotalMinutes": 180
      },
      {
        "id": "d3_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》高数第1章 极限与函数性质（推进至95题）",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅高数第1章(题66–95)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 30,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅高数第1章(题66–95)",
            "indices": [
              65,
              66,
              67,
              68,
              69,
              70,
              71,
              72,
              73,
              74,
              75,
              76,
              77,
              78,
              79,
              80,
              81,
              82,
              83,
              84,
              85,
              86,
              87,
              88,
              89,
              90,
              91,
              92,
              93,
              94
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-02",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 3
      },
      {
        "id": "d3_p_ev",
        "cat": "major",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "波哥第4章傅里叶(收官)：强化第4章(后18题收官) + 讲义第4章34题过筛全绿",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_04",
            "label": "波哥强化第4章(后12道非绿收官)",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_04",
            "label": "波哥讲义第4章(35题)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 46,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_04",
            "label": "波哥强化第4章(后12道非绿收官)",
            "indices": [
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_04",
            "label": "波哥讲义第4章(35题)",
            "indices": [
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-02",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null,
        "day": 3
      },
      {
        "id": "d3_p_zm",
        "date": "2026-11-02",
        "day": 3,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】26芝麻南大851模拟卷(二)·大题推导(前5题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 5,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_02",
            "label": "26芝麻南大851模拟卷(二)·大题推导(前5题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_02",
            "label": "26芝麻南大851模拟卷(二)·大题推导(前5题)",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d3_night",
        "date": "2026-11-02",
        "day": 3,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲高数第4讲·一元函数微分学计算 + 30讲高数第5讲·一元微分应用(一)（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 51,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch4",
            "label": "30讲高数第4讲·一元函数微分学计算",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch5",
            "label": "30讲高数第5讲·一元微分应用(一)",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch4",
            "label": "30讲高数第4讲·一元函数微分学计算",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch5",
            "label": "30讲高数第5讲·一元微分应用(一)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 4,
    "date": "2026-11-03",
    "label": "Day 4 (11.03 周二)",
    "week": "第一周 · 22/23真题模考 & 36讲线代收官 & 波哥傅氏拉氏",
    "focus": "10+11两年数一真题清零 + 华科16真题 + 邂逅第1章收官&第2章启动 + 波哥拉氏启动",
    "tasks": [
      {
        "id": "d4_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大作文中间论证段背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2023",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-03",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d4_eng:essay_recite",
          "d4_eng:reading_practice"
        ],
        "day": 4
      },
      {
        "id": "d4_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "2010年(8道非绿) + 2011年(9道非绿) 真题并刷全绿 + 邂逅第1章收官(题96–129，🎉第1章全绿！)",
        "desc": "10、11两年合计仅17道非绿题，上午一并清零标绿；随后把邂逅第1章最后34题全部干完收官！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2010",
            "label": "10年数一真题(23题)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2011",
            "label": "11年数一真题(23题)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅高数第1章(题96–129收官)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 51,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2010",
            "label": "10年数一真题(23题)",
            "indices": [
              1,
              2,
              14,
              15,
              17,
              18,
              19,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2011",
            "label": "11年数一真题(23题)",
            "indices": [
              0,
              2,
              5,
              8,
              17,
              18,
              19,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅高数第1章(题96–129收官)",
            "indices": [
              95,
              96,
              97,
              98,
              99,
              100,
              101,
              102,
              103,
              104,
              105,
              106,
              107,
              108,
              109,
              110,
              111,
              112,
              113,
              114,
              115,
              116,
              117,
              118,
              119,
              120,
              121,
              122,
              123,
              124,
              125,
              126,
              127,
              128
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-03",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 4,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d4_math_correction",
        "date": "2026-11-03",
        "day": 4,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d4",
        "paperTitle": "数一真题深度订正专场 (D4)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d4_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》马原第3章唯物史观收官(后40题) + 第4章政经(清20未标+15错题)",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100405",
            "label": "马原·第3章(题17–56收官)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100406",
            "label": "马原·第4章政经(20未标+15错题)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 75,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100405",
            "label": "马原·第3章(题17–56收官)",
            "indices": [
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100406",
            "label": "马原·第4章政经(20未标+15错题)",
            "indices": [
              93,
              94,
              95,
              96,
              97,
              98,
              99,
              100,
              101,
              102,
              103,
              104,
              105,
              106,
              107,
              108,
              109,
              110,
              111,
              112,
              11,
              12,
              13,
              14,
              18,
              19,
              20,
              21,
              23,
              24,
              25,
              26,
              27,
              28,
              29
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-03",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 4
      },
      {
        "id": "d4_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【华科824】2016年真题(24题) 3h全真模考 + 订正标绿",
        "desc": "严格3小时考场标准拿下华科2016年真题24题，做完立刻批改并把错题标黄/红、掌握题标绿。（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_16",
            "label": "华科16真题(24题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 24,
        "mode": "done",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_16",
            "label": "华科16真题(24题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-03",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 4,
        "flexTotalMinutes": 180
      },
      {
        "id": "d4_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》高数第2章 导数（推进前35题，题1–35）",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_02",
            "label": "邂逅高数第2章(题1–35)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 35,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_02",
            "label": "邂逅高数第2章(题1–35)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-03",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 4
      },
      {
        "id": "d4_p_ev",
        "cat": "major",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "波哥第5章拉氏变换(上)：强化第5章(前19题) + 基础习题集第5章(清前30道错题)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_05",
            "label": "波哥强化第5章(前19题)",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_05",
            "label": "波哥习题集第5章(前30道错题)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 49,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_05",
            "label": "波哥强化第5章(前19题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_05",
            "label": "波哥习题集第5章(前30道错题)",
            "indices": [
              7,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              21,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              38,
              39,
              40,
              41,
              43,
              44,
              45,
              46
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-03",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null,
        "day": 4
      },
      {
        "id": "d4_p_zm",
        "date": "2026-11-03",
        "day": 4,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】26芝麻南大851模拟卷(二)·大题推导(后4题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 4,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_02",
            "label": "26芝麻南大851模拟卷(二)·大题推导(后4题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_02",
            "label": "26芝麻南大851模拟卷(二)·大题推导(后4题)",
            "indices": [
              5,
              6,
              7,
              8
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d4_night",
        "date": "2026-11-03",
        "day": 4,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲高数第6讲·一元微分应用(二) + 30讲高数第7讲·一元微分应用(三)（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 40,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch6",
            "label": "30讲高数第6讲·一元微分应用(二)",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch7",
            "label": "30讲高数第7讲·一元微分应用(三)",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch6",
            "label": "30讲高数第6讲·一元微分应用(二)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch7",
            "label": "30讲高数第7讲·一元微分应用(三)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 5,
    "date": "2026-11-04",
    "label": "Day 5 (11.04 周三)",
    "week": "第一周 · 22/23真题模考 & 36讲线代收官 & 波哥傅氏拉氏",
    "focus": "12年数一真题清零 + 南大12-14三套连刷 + 邂逅第2章导数收官 + 波哥拉氏收官",
    "tasks": [
      {
        "id": "d5_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大作文结尾总结段背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2022",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-04",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d5_eng:essay_recite",
          "d5_eng:reading_practice"
        ],
        "day": 5
      },
      {
        "id": "d5_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "2012年数一真题(16道非绿题重做清零) + 邂逅高数第2章导数(推至65题)",
        "desc": "上午清零2012年真题16道🟡/🔴题，余下时间推进《邂逅遗憾》高数第2章30题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2012",
            "label": "12年数一真题(23题)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_02",
            "label": "邂逅高数第2章(题36–65)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 46,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2012",
            "label": "12年数一真题(23题)",
            "indices": [
              2,
              4,
              5,
              6,
              7,
              10,
              12,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_02",
            "label": "邂逅高数第2章(题36–65)",
            "indices": [
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-04",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 5,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d5_math_correction",
        "date": "2026-11-04",
        "day": 5,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d5",
        "paperTitle": "数一真题深度订正专场 (D5)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d5_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》马原第5章(44题) + 第6章(前15题) + 复盘第4章政经错题",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100407",
            "label": "马原·第5章(44题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100408",
            "label": "马原·第6章(题1–15)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 59,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100407",
            "label": "马原·第5章(44题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100408",
            "label": "马原·第6章(题1–15)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-04",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 5
      },
      {
        "id": "d5_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【南大851三套连刷】2012年(7题) + 2013年(7题) + 2014年(7题)",
        "desc": "12–14年南大真题每套7道大题（合计21题），3小时整块一气呵成刷完并订正标绿！（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_12",
            "label": "南大12真题(7题)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_13",
            "label": "南大13真题(7题)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_14",
            "label": "南大14真题(7题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 21,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_12",
            "label": "南大12真题(7题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_13",
            "label": "南大13真题(7题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_14",
            "label": "南大14真题(7题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-04",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 5,
        "flexTotalMinutes": 180
      },
      {
        "id": "d5_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》高数第2章 导数（后36题，🎉第2章101题全绿收官！）",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_02",
            "label": "邂逅高数第2章(题66–101收官)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 36,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_02",
            "label": "邂逅高数第2章(题66–101收官)",
            "indices": [
              65,
              66,
              67,
              68,
              69,
              70,
              71,
              72,
              73,
              74,
              75,
              76,
              77,
              78,
              79,
              80,
              81,
              82,
              83,
              84,
              85,
              86,
              87,
              88,
              89,
              90,
              91,
              92,
              93,
              94,
              95,
              96,
              97,
              98,
              99,
              100
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-04",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 5
      },
      {
        "id": "d5_p_ev",
        "cat": "major",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "波哥第5章拉氏变换(收官)：强化第5章(后18题收官) + 习题集第5章(清剩余36道错题) + 讲义第5章(15错题)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_05",
            "label": "波哥强化第5章(后18题收官)",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_05",
            "label": "波哥习题集第5章(后36道错题收官)",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_05",
            "label": "波哥讲义第5章(51题收官)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 69,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_05",
            "label": "波哥强化第5章(后18题收官)",
            "indices": [
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_05",
            "label": "波哥习题集第5章(后36道错题收官)",
            "indices": [
              47,
              48,
              49,
              50,
              51,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              65,
              67,
              68,
              69,
              70,
              71,
              72,
              73,
              74,
              75,
              76,
              77,
              78,
              80,
              81,
              82,
              83,
              84,
              85,
              86
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_05",
            "label": "波哥讲义第5章(51题收官)",
            "indices": [
              3,
              6,
              19,
              25,
              26,
              27,
              28,
              31,
              32,
              33,
              36,
              37,
              39,
              44,
              50
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-04",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null,
        "day": 5
      },
      {
        "id": "d5_p_zm",
        "date": "2026-11-04",
        "day": 5,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】26芝麻南大851模拟卷(三)·大题推导(前5题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 5,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_03",
            "label": "26芝麻南大851模拟卷(三)·大题推导(前5题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_03",
            "label": "26芝麻南大851模拟卷(三)·大题推导(前5题)",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d5_night",
        "date": "2026-11-04",
        "day": 5,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲高数第8讲·一元积分学概念性质 + 30讲高数第10讲·一元积分应用(一)（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 49,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch8",
            "label": "30讲高数第8讲·一元积分学概念性质",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch10",
            "label": "30讲高数第10讲·一元积分应用(一)",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch8",
            "label": "30讲高数第8讲·一元积分学概念性质",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch10",
            "label": "30讲高数第10讲·一元积分应用(一)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 6,
    "date": "2026-11-05",
    "label": "Day 6 (11.05 周四)",
    "week": "第一周 · ⚡电路专题必搞启动 & 36讲概率收官",
    "focus": "13年真题清零 + 华科17&南大15真题 + 邂逅第4章微分方程全章 + ⚡电路专题(Day 1/5)",
    "tasks": [
      {
        "id": "d6_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大小作文整篇限时默写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2022",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-05",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d6_eng:essay_recite",
          "d6_eng:reading_practice"
        ],
        "day": 6
      },
      {
        "id": "d6_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "2013年数一真题(15道非绿题重做清零) + 邂逅高数第4章微分方程(前25题)",
        "desc": "上午清零2013年真题15道错题，随后开启邂逅第4章微分方程（共59题）前25题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2013",
            "label": "13年数一真题(23题)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_04",
            "label": "邂逅高数第4章(前25道非绿)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 40,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2013",
            "label": "13年数一真题(23题)",
            "indices": [
              1,
              3,
              4,
              5,
              7,
              8,
              9,
              14,
              15,
              16,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_04",
            "label": "邂逅高数第4章(前25道非绿)",
            "indices": [
              0,
              1,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-05",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 6,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d6_math_correction",
        "date": "2026-11-05",
        "day": 6,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d6",
        "paperTitle": "数一真题深度订正专场 (D6)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d6_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》马原第6–7章收官 + 毛中特导论与第1–2章(共57题)",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100408",
            "label": "马原·第6章(题16–26收官)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100409",
            "label": "马原·第7章(6题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100410",
            "label": "毛中特·导论",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100411",
            "label": "毛中特·第1章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100412",
            "label": "毛中特·第2章(37题)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 68,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100408",
            "label": "马原·第6章(题16–26收官)",
            "indices": [
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100409",
            "label": "马原·第7章(6题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100410",
            "label": "毛中特·导论",
            "indices": [
              0,
              1,
              2,
              3
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100411",
            "label": "毛中特·第1章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100412",
            "label": "毛中特·第2章(37题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-05",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 6
      },
      {
        "id": "d6_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【华科824 + 南大851】华科2017年真题(12题) + 南大2015年真题(7题)",
        "desc": "华科17年(12题)与南大15年(7题)合计19题，3小时整块完美匹配！（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_17",
            "label": "华科17真题(12题)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_15",
            "label": "南大15真题(7题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 19,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_17",
            "label": "华科17真题(12题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_15",
            "label": "南大15真题(7题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-05",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 6,
        "flexTotalMinutes": 180
      },
      {
        "id": "d6_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》高数第4章 微分方程（后34题，🎉第4章59题全绿收官！）",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_04",
            "label": "邂逅高数第4章(后32道非绿收官)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 32,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_04",
            "label": "邂逅高数第4章(后32道非绿收官)",
            "indices": [
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-05",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 6
      },
      {
        "id": "d6_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "⚡【电路专题Day 1】手头《电路专题》讲义核心模型 + 波哥讲义第9章电路专题(10道错题清零)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_09",
            "label": "波哥讲义第9章·电路专题(10题)",
            "moduleId": "bogo9"
          }
        ],
        "targetCount": 10,
        "mode": "green",
        "offlineLabel": "手头《电路专题》第1部分",
        "offlineTarget": 1,
        "special": true,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_09",
            "label": "波哥讲义第9章·电路专题(10题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo9"
          }
        ],
        "date": "2026-11-05",
        "kind": "online",
        "moduleId": "bogo9",
        "moduleIds": [
          "bogo9"
        ],
        "offlineItemIds": null,
        "day": 6
      },
      {
        "id": "d6_p_zm",
        "date": "2026-11-05",
        "day": 6,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】26芝麻南大851模拟卷(三)·大题推导(后5题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 5,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_03",
            "label": "26芝麻南大851模拟卷(三)·大题推导(后5题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_03",
            "label": "26芝麻南大851模拟卷(三)·大题推导(后5题)",
            "indices": [
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d6_night",
        "date": "2026-11-05",
        "day": 6,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲高数第9讲·一元函数积分学计算（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 46,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch9",
            "label": "30讲高数第9讲·一元函数积分学计算",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch9",
            "label": "30讲高数第9讲·一元函数积分学计算",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 7,
    "date": "2026-11-06",
    "label": "Day 7 (11.06 周五)",
    "week": "第一周收官 · 专业课模拟卷(一) & ⚡电路专题(Day 2/5)",
    "focus": "14年真题清零 + 🔥专业课模拟卷(一)3h模考 + 邂逅第5章多元微分全章 + ⚡电路专题(2/5)",
    "tasks": [
      {
        "id": "d7_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间第一周作文模板总复盘默写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2021",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-06",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d7_eng:essay_recite",
          "d7_eng:reading_practice"
        ],
        "day": 7
      },
      {
        "id": "d7_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "2014年数一真题(14道非绿题重做清零) + 邂逅高数第5章多元微分(前28题)",
        "desc": "上午清零14年真题14道错题，无缝切入邂逅第5章多元微分（共68题）前28题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2014",
            "label": "14年数一真题(23题)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_05",
            "label": "邂逅高数第5章(题1–28)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 42,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2014",
            "label": "14年数一真题(23题)",
            "indices": [
              0,
              1,
              3,
              5,
              7,
              8,
              12,
              13,
              16,
              17,
              18,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_05",
            "label": "邂逅高数第5章(题1–28)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-06",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 7,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d7_math_correction",
        "date": "2026-11-06",
        "day": 7,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d7",
        "paperTitle": "数一真题深度订正专场 (D7)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d7_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》毛中特第3–6章(55题) + 马原第4章政经错题清零",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100413",
            "label": "毛中特·第3章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100414",
            "label": "毛中特·第4章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100415",
            "label": "毛中特·第5章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100416",
            "label": "毛中特·第6章",
            "moduleId": "politics"
          }
        ],
        "targetCount": 55,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100413",
            "label": "毛中特·第3章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100414",
            "label": "毛中特·第4章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100415",
            "label": "毛中特·第5章",
            "indices": [
              0,
              1
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100416",
            "label": "毛中特·第6章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-06",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 7
      },
      {
        "id": "d7_p_pm",
        "cat": "major",
        "catLabel": "专业课·全真3h模考",
        "time": "14:00–17:00",
        "title": "🔥【专业课模拟卷(一)】3h全真模考（可选手头模拟卷1 或 网站刺猬哥/芝麻模拟卷一）",
        "desc": "第一周周五下午14:00-17:00全真模拟！可刷手头纸质模拟卷(一)或网站内26模拟卷一，当场批改复盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_mn_26_01",
            "label": "26刺猬哥预测卷(一)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_01",
            "label": "26芝麻模拟卷(一)",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "专业课模拟卷(一) 3h模考+订正",
        "offlineTarget": 1,
        "special": true,
        "isOptionalOnlineMock": true,
        "scopedItems": [],
        "date": "2026-11-06",
        "kind": "mock",
        "moduleId": "mock",
        "moduleIds": [
          "mock"
        ],
        "offlineItemIds": null,
        "day": 7,
        "isFullMock": true
      },
      {
        "id": "d7_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》高数第5章 多元微分（后40题，🎉第5章68题全绿收官！）",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_05",
            "label": "邂逅高数第5章(题29–68收官)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 40,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_05",
            "label": "邂逅高数第5章(题29–68收官)",
            "indices": [
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-06",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 7
      },
      {
        "id": "d7_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "⚡【电路专题Day 2】手头《电路专题》典型题攻坚 + 波哥强化习题集第7章电路专题(题1–10)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_07",
            "label": "波哥强化第7章·电路(前10题)",
            "moduleId": "bogo9"
          }
        ],
        "targetCount": 10,
        "mode": "green",
        "offlineLabel": "手头《电路专题》第2部分",
        "offlineTarget": 1,
        "special": true,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_07",
            "label": "波哥强化第7章·电路(前10题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo9"
          }
        ],
        "date": "2026-11-06",
        "kind": "online",
        "moduleId": "bogo9",
        "moduleIds": [
          "bogo9"
        ],
        "offlineItemIds": null,
        "day": 7
      },
      {
        "id": "d7_p_zm",
        "date": "2026-11-06",
        "day": 7,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】26芝麻南大851模拟卷(四)·大题推导(前5题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 5,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_04",
            "label": "26芝麻南大851模拟卷(四)·大题推导(前5题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_04",
            "label": "26芝麻南大851模拟卷(四)·大题推导(前5题)",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d7_night",
        "date": "2026-11-06",
        "day": 7,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲高数第11讲·一元积分应用(二) + 30讲高数第12讲·一元积分应用(三) + 30讲高数第14讲·二重积分（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 54,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch11",
            "label": "30讲高数第11讲·一元积分应用(二)",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch12",
            "label": "30讲高数第12讲·一元积分应用(三)",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch14",
            "label": "30讲高数第14讲·二重积分",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch11",
            "label": "30讲高数第11讲·一元积分应用(二)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch12",
            "label": "30讲高数第12讲·一元积分应用(三)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch14",
            "label": "30讲高数第14讲·二重积分",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 8,
    "date": "2026-11-07",
    "label": "Day 8 (11.07 周六)",
    "week": "第二周 · ⚡电路专题收官 & 🎓南大期末题登场 & 真题一轮通关",
    "focus": "15+16两年真题清零 + 华科18真题 + 邂逅第6章二重积分全章 + ⚡电路专题(Day 3/5)",
    "tasks": [
      {
        "id": "d8_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间图表/材料作文模板背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2021",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-07",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d8_eng:essay_recite",
          "d8_eng:reading_practice"
        ],
        "day": 8
      },
      {
        "id": "d8_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "2015年(10道非绿) + 2016年(14道非绿) 真题并刷全绿 + 邂逅第6章二重积分(前20题)",
        "desc": "15、16两年合计24道非绿题，上午3h整块全部重做标绿；11:30后推进邂逅第6章二重积分前20题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2015",
            "label": "15年数一真题(23题)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2016",
            "label": "16年数一真题(23题)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_06",
            "label": "邂逅高数第6章(题1–20)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 44,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2015",
            "label": "15年数一真题(23题)",
            "indices": [
              5,
              7,
              11,
              12,
              15,
              16,
              18,
              19,
              20,
              21
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2016",
            "label": "16年数一真题(23题)",
            "indices": [
              2,
              4,
              5,
              7,
              11,
              13,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_06",
            "label": "邂逅高数第6章(题1–20)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-07",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 8,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d8_math_correction",
        "date": "2026-11-07",
        "day": 8,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d8",
        "paperTitle": "数一真题深度订正专场 (D8)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d8_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》毛中特第7–8章收官 + 新思想导论与第1–4章(共53题)",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100417",
            "label": "毛中特·第7章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100418",
            "label": "毛中特·第8章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100421",
            "label": "新思想·导论",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100422",
            "label": "新思想·第1章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100423",
            "label": "新思想·第2章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100424",
            "label": "新思想·第3章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100425",
            "label": "新思想·第4章",
            "moduleId": "politics"
          }
        ],
        "targetCount": 53,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100417",
            "label": "毛中特·第7章",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100418",
            "label": "毛中特·第8章",
            "indices": [
              0,
              1,
              2,
              3
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100421",
            "label": "新思想·导论",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100422",
            "label": "新思想·第1章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100423",
            "label": "新思想·第2章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100424",
            "label": "新思想·第3章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100425",
            "label": "新思想·第4章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-07",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 8
      },
      {
        "id": "d8_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【华科824】2018年真题(20题) 3h全真模考 + 订正标绿",
        "desc": "3小时考场标准拿下华科2018年真题20题，当场批改复盘。（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_18",
            "label": "华科18真题(20题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 20,
        "mode": "done",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_18",
            "label": "华科18真题(20题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-07",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 8,
        "flexTotalMinutes": 180
      },
      {
        "id": "d8_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》高数第6章二重积分(后26题收官) + 第7章无穷级数(前10题)",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_06",
            "label": "邂逅高数第6章(题21–46收官)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_07",
            "label": "邂逅高数第7章(题1–10)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 36,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_06",
            "label": "邂逅高数第6章(题21–46收官)",
            "indices": [
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_07",
            "label": "邂逅高数第7章(题1–10)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-07",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 8
      },
      {
        "id": "d8_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "⚡【电路专题Day 3】手头《电路专题》综合大题 + 波哥强化第7章电路专题(后8题，🎉强化电路收官！)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_07",
            "label": "波哥强化第7章·电路(后8题收官)",
            "moduleId": "bogo9"
          }
        ],
        "targetCount": 8,
        "mode": "green",
        "offlineLabel": "手头《电路专题》第3部分",
        "offlineTarget": 1,
        "special": true,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_07",
            "label": "波哥强化第7章·电路(后8题收官)",
            "indices": [
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo9"
          }
        ],
        "date": "2026-11-07",
        "kind": "online",
        "moduleId": "bogo9",
        "moduleIds": [
          "bogo9"
        ],
        "offlineItemIds": null,
        "day": 8
      },
      {
        "id": "d8_p_zm",
        "date": "2026-11-07",
        "day": 8,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】26芝麻南大851模拟卷(四)·大题推导(后4题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 4,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_04",
            "label": "26芝麻南大851模拟卷(四)·大题推导(后4题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_04",
            "label": "26芝麻南大851模拟卷(四)·大题推导(后4题)",
            "indices": [
              5,
              6,
              7,
              8
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d8_night",
        "date": "2026-11-07",
        "day": 8,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲高数第13讲·多元函数微分学（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 36,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch13",
            "label": "30讲高数第13讲·多元函数微分学",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch13",
            "label": "30讲高数第13讲·多元函数微分学",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 9,
    "date": "2026-11-08",
    "label": "Day 9 (11.08 周日)",
    "week": "第二周 · ⚡电路专题收官 & 🎓南大期末题登场 & 真题一轮通关",
    "focus": "17年真题清零 + 南大16-18三套连刷 + 邂逅第7章无穷级数收官 + ⚡电路专题(Day 4/5)",
    "tasks": [
      {
        "id": "d9_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间小作文建议信/投诉信/邀请信背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2020",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-08",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d9_eng:essay_recite",
          "d9_eng:reading_practice"
        ],
        "day": 9
      },
      {
        "id": "d9_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "2017年数一真题(15道非绿，含11未标) 重做清零 + 邂逅第7章无穷级数(推至45题)",
        "desc": "17年真题有11道未标题+4道错题，上午精做标绿；随后推进邂逅第7章无穷级数35题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2017",
            "label": "17年数一真题(23题)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_07",
            "label": "邂逅高数第7章(题11–45)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 50,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2017",
            "label": "17年数一真题(23题)",
            "indices": [
              2,
              4,
              7,
              8,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_07",
            "label": "邂逅高数第7章(题11–45)",
            "indices": [
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-08",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 9,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d9_math_correction",
        "date": "2026-11-08",
        "day": 9,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d9",
        "paperTitle": "数一真题深度订正专场 (D9)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d9_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》新思想第5–7章(改革开放/高质量发展/科教人才，共59题)",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100426",
            "label": "新思想·第5章(17题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100427",
            "label": "新思想·第6章(33题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100428",
            "label": "新思想·第7章(9题)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 59,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100426",
            "label": "新思想·第5章(17题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100427",
            "label": "新思想·第6章(33题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100428",
            "label": "新思想·第7章(9题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-08",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 9
      },
      {
        "id": "d9_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【南大851三套连刷】2016年(7题) + 2017年(7题) + 2018年(9题)",
        "desc": "16–18年南大真题合计23题，下午3h考场块完整刷完并订正标绿！（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_16",
            "label": "南大16真题(7题)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_17",
            "label": "南大17真题(7题)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_18",
            "label": "南大18真题(9题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 23,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_16",
            "label": "南大16真题(7题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_17",
            "label": "南大17真题(7题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_18",
            "label": "南大18真题(9题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-08",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 9,
        "flexTotalMinutes": 180
      },
      {
        "id": "d9_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》高数第7章 无穷级数（后43题，🎉第7章88题全绿收官！）",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_07",
            "label": "邂逅高数第7章(题46–88收官)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 43,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_07",
            "label": "邂逅高数第7章(题46–88收官)",
            "indices": [
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              70,
              71,
              72,
              73,
              74,
              75,
              76,
              77,
              78,
              79,
              80,
              81,
              82,
              83,
              84,
              85,
              86,
              87
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-08",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 9
      },
      {
        "id": "d9_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "⚡【电路专题Day 4】波哥习题集第9章电路专题(39题，清前20道🟡/🔴错题) + 手头电路专题难题攻克",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_09",
            "label": "波哥习题集第9章·电路(前20道错题)",
            "moduleId": "bogo9"
          }
        ],
        "targetCount": 20,
        "mode": "green",
        "offlineLabel": "手头《电路专题》第4部分",
        "offlineTarget": 1,
        "special": true,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_09",
            "label": "波哥习题集第9章·电路(前20道错题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              11,
              12,
              13,
              14,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo9"
          }
        ],
        "date": "2026-11-08",
        "kind": "online",
        "moduleId": "bogo9",
        "moduleIds": [
          "bogo9"
        ],
        "offlineItemIds": null,
        "day": 9
      },
      {
        "id": "d9_p_zm",
        "date": "2026-11-08",
        "day": 9,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】26芝麻南大851模拟卷(五)·大题推导(前5题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 5,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_05",
            "label": "26芝麻南大851模拟卷(五)·大题推导(前5题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_05",
            "label": "26芝麻南大851模拟卷(五)·大题推导(前5题)",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d9_night",
        "date": "2026-11-08",
        "day": 9,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲高数第15讲·常微分方程（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 40,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch15",
            "label": "30讲高数第15讲·常微分方程",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch15",
            "label": "30讲高数第15讲·常微分方程",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 10,
    "date": "2026-11-09",
    "label": "Day 10 (11.09 周一)",
    "week": "第二周 · ⚡电路专题100%收官 & 线面积分攻坚",
    "focus": "18年真题清零 + 华科19真题 + 邂逅第8章空间几何&第9章线面积分 + ⚡电路专题(Day 5/5收官！)",
    "tasks": [
      {
        "id": "d10_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大作文人生哲理/文化交流主题背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2020",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-09",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d10_eng:essay_recite",
          "d10_eng:reading_practice"
        ],
        "day": 10
      },
      {
        "id": "d10_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "2018年数一真题(14道非绿题重做清零) + 邂逅高数第8章空间几何(全章30题全绿收官！)",
        "desc": "上午清零18年真题14道错题，随后把邂逅第8章空间几何30题全部拿下！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2018",
            "label": "18年数一真题(23题)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_08",
            "label": "邂逅第8章·空间几何(30题)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 44,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2018",
            "label": "18年数一真题(23题)",
            "indices": [
              0,
              1,
              7,
              10,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_08",
            "label": "邂逅第8章·空间几何(30题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-09",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 10,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d10_math_correction",
        "date": "2026-11-09",
        "day": 10,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d10",
        "paperTitle": "数一真题深度订正专场 (D10)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d10_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》新思想第8–10章(民主/法治/文化强国，共52题)",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100429",
            "label": "新思想·第8章(24题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100430",
            "label": "新思想·第9章(10题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100431",
            "label": "新思想·第10章(18题)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 52,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100429",
            "label": "新思想·第8章(24题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100430",
            "label": "新思想·第9章(10题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100431",
            "label": "新思想·第10章(18题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-09",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 10
      },
      {
        "id": "d10_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【华科824】2019年真题(23题) 3h全真模考 + 订正标绿",
        "desc": "下午3h整块完成华科2019年真题23题并批改复盘。（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_19",
            "label": "华科19真题(23题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 23,
        "mode": "done",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_19",
            "label": "华科19真题(23题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-09",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 10,
        "flexTotalMinutes": 180
      },
      {
        "id": "d10_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》高数第9章 三重积分和线面积分（前35题，题1–35）",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_09",
            "label": "邂逅高数第9章(题1–35)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 35,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_09",
            "label": "邂逅高数第9章(题1–35)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-09",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 10
      },
      {
        "id": "d10_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "⚡【电路专题Day 5收官】波哥习题集第9章电路专题(清后17道错题) + 手头《电路专题》100%通关！",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_09",
            "label": "波哥习题集第9章·电路(后17道错题收官)",
            "moduleId": "bogo9"
          }
        ],
        "targetCount": 17,
        "mode": "green",
        "offlineLabel": "手头《电路专题》全套收官验收",
        "offlineTarget": 1,
        "special": true,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_09",
            "label": "波哥习题集第9章·电路(后17道错题收官)",
            "indices": [
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo9"
          }
        ],
        "date": "2026-11-09",
        "kind": "online",
        "moduleId": "bogo9",
        "moduleIds": [
          "bogo9"
        ],
        "offlineItemIds": null,
        "day": 10
      },
      {
        "id": "d10_p_zm",
        "date": "2026-11-09",
        "day": 10,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】26芝麻南大851模拟卷(五)·大题推导(后6题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 6,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_05",
            "label": "26芝麻南大851模拟卷(五)·大题推导(后6题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_05",
            "label": "26芝麻南大851模拟卷(五)·大题推导(后6题)",
            "indices": [
              5,
              6,
              7,
              8,
              9,
              10
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d10_night",
        "date": "2026-11-09",
        "day": 10,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲高数第16讲·无穷级数（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 56,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch16",
            "label": "30讲高数第16讲·无穷级数",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch16",
            "label": "30讲高数第16讲·无穷级数",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 11,
    "date": "2026-11-10",
    "label": "Day 11 (11.10 周二)",
    "week": "第二周 · 🎓南大期末题必搞(Day 1/6) & 邂逅高数全篇收官！",
    "focus": "19年真题清零 + 南大19&24真题 + 邂逅高数10章全收官 + 🎓南大期末题(1/6)&波哥Z变换",
    "tasks": [
      {
        "id": "d11_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大作文科技创新/环境保护主题背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2019",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-10",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d11_eng:essay_recite",
          "d11_eng:reading_practice"
        ],
        "day": 11
      },
      {
        "id": "d11_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "2019年数一真题(16道非绿，含9未标) 重做清零 + 邂逅第9章线面积分(后36题，🎉第9章收官！)",
        "desc": "上午清零19年真题16道非绿题，随后把邂逅第9章三重与线面积分后36题全部刷完标绿！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2019",
            "label": "19年数一真题(23题)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_09",
            "label": "邂逅高数第9章(题36–71收官)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 52,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2019",
            "label": "19年数一真题(23题)",
            "indices": [
              2,
              3,
              5,
              8,
              10,
              11,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_09",
            "label": "邂逅高数第9章(题36–71收官)",
            "indices": [
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              70
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-10",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 11,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d11_math_correction",
        "date": "2026-11-10",
        "day": 11,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d11",
        "paperTitle": "数一真题深度订正专场 (D11)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d11_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》新思想第11–16章(社会/生态/国安/国防/一国两制/外交，共52题)",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100432",
            "label": "新思想·第11章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100433",
            "label": "新思想·第12章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100439",
            "label": "新思想·第13章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100435",
            "label": "新思想·第14章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100436",
            "label": "新思想·第15章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100437",
            "label": "新思想·第16章",
            "moduleId": "politics"
          }
        ],
        "targetCount": 52,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100432",
            "label": "新思想·第11章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100433",
            "label": "新思想·第12章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100439",
            "label": "新思想·第13章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100435",
            "label": "新思想·第14章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100436",
            "label": "新思想·第15章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100437",
            "label": "新思想·第16章",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-10",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 11
      },
      {
        "id": "d11_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【南大851两套连刷】2019年真题(11题) + 2024年真题(10题)",
        "desc": "下午3h整块拿下南大19年与24年真题共21道大题，当场批改订正标绿！（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_19",
            "label": "南大19真题(11题)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_24",
            "label": "南大24真题(10题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 21,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_19",
            "label": "南大19真题(11题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_24",
            "label": "南大24真题(10题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-10",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 11,
        "flexTotalMinutes": 180
      },
      {
        "id": "d11_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》高数第10章线面补充(20题，🎉邂逅高数744题全篇收官！) + 线代第1章行列式(前16题)",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_10",
            "label": "邂逅第10章·线面补充(20题)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_11",
            "label": "邂逅线代第1章(前16道非绿)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 36,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_10",
            "label": "邂逅第10章·线面补充(20题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_11",
            "label": "邂逅线代第1章(前16道非绿)",
            "indices": [
              0,
              1,
              2,
              3,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-10",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 11
      },
      {
        "id": "d11_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "🎓【南大期末题Day 1】时域与卷积期末题专练 + 波哥强化第6章离散复频域(题1–25) & 讲义第6章扫尾",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_06",
            "label": "波哥强化第6章(前25题)",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_06",
            "label": "波哥讲义第6章(27题收官)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 35,
        "mode": "green",
        "offlineLabel": "手头《南大期末题》Day 1 (时域/卷积)",
        "offlineTarget": 1,
        "special": true,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_06",
            "label": "波哥强化第6章(前25题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_06",
            "label": "波哥讲义第6章(27题收官)",
            "indices": [
              0,
              2,
              3,
              6,
              12,
              15,
              22,
              23,
              25,
              26
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-10",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null,
        "day": 11
      },
      {
        "id": "d11_p_zm",
        "date": "2026-11-10",
        "day": 11,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】26芝麻南大851模拟卷(六)·大题推导(前5题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 5,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_06",
            "label": "26芝麻南大851模拟卷(六)·大题推导(前5题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_06",
            "label": "26芝麻南大851模拟卷(六)·大题推导(前5题)",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d11_night",
        "date": "2026-11-10",
        "day": 11,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲高数第17讲·多元积分预备知识 + 30讲线代第1讲·行列式（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 47,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch17",
            "label": "30讲高数第17讲·多元积分预备知识",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch19",
            "label": "30讲线代第1讲·行列式",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch17",
            "label": "30讲高数第17讲·多元积分预备知识",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch19",
            "label": "30讲线代第1讲·行列式",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 12,
    "date": "2026-11-11",
    "label": "Day 12 (11.11 周三)",
    "week": "第二周 · 🎓南大期末题必搞(Day 2/6) & 20年数一重点攻坚",
    "focus": "20年数一真题(21道非绿) + 华科20真题 + 邂逅线代第1-2章 + 🎓南大期末题(2/6)",
    "tasks": [
      {
        "id": "d12_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大小作文高频功能句默写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2019",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-11",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d12_eng:essay_recite",
          "d12_eng:reading_practice"
        ],
        "day": 12
      },
      {
        "id": "d12_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "2020年数一真题(21道非绿，含12未标) 3h深度攻克 + 邂逅线代第1章行列式收官(后20题)",
        "desc": "2020年是史上最难数一真题之一（剩21道非绿），上午用足时间逐题攻克标绿；随后收官邂逅线代第1章！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2020",
            "label": "20年数一真题(23题)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_11",
            "label": "邂逅线代第1章(后19道非绿收官)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 40,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2020",
            "label": "20年数一真题(23题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_11",
            "label": "邂逅线代第1章(后19道非绿收官)",
            "indices": [
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-11",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 12,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d12_math_correction",
        "date": "2026-11-11",
        "day": 12,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d12",
        "paperTitle": "数一真题深度订正专场 (D12)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d12_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》新思想第17章收官 + 史纲第1–2章(共57题)",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100438",
            "label": "新思想·第17章(13题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100440",
            "label": "史纲·第1章(22题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100441",
            "label": "史纲·第2章(22题)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 57,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100438",
            "label": "新思想·第17章(13题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100440",
            "label": "史纲·第1章(22题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100441",
            "label": "史纲·第2章(22题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-11",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 12
      },
      {
        "id": "d12_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【华科824】2020年真题(26题) 3h全真模考 + 订正标绿",
        "desc": "下午3h考场整块完成华科2020年真题26题，当场批改复盘。（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_20",
            "label": "华科20真题(26题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 26,
        "mode": "done",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_20",
            "label": "华科20真题(26题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-11",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 12,
        "flexTotalMinutes": 180
      },
      {
        "id": "d12_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》线代第2章 矩阵（前35题，题1–35）",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_12",
            "label": "邂逅线代第2章(题1–35)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 35,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_12",
            "label": "邂逅线代第2章(题1–35)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-11",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 12
      },
      {
        "id": "d12_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "🎓【南大期末题Day 2】傅里叶与采样调制期末题 + 波哥强化第6章离散复频域(后30题，🎉强化第6章收官！)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_06",
            "label": "波哥强化第6章(后30题收官)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 30,
        "mode": "green",
        "offlineLabel": "手头《南大期末题》Day 2 (傅氏/采样)",
        "offlineTarget": 1,
        "special": true,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_06",
            "label": "波哥强化第6章(后30题收官)",
            "indices": [
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-11",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null,
        "day": 12
      },
      {
        "id": "d12_p_zm",
        "date": "2026-11-11",
        "day": 12,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】26芝麻南大851模拟卷(六)·大题推导(后4题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 4,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_06",
            "label": "26芝麻南大851模拟卷(六)·大题推导(后4题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_06",
            "label": "26芝麻南大851模拟卷(六)·大题推导(后4题)",
            "indices": [
              5,
              6,
              7,
              8
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d12_night",
        "date": "2026-11-11",
        "day": 12,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲高数第18讲·多元函数积分学（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 41,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch18",
            "label": "30讲高数第18讲·多元函数积分学",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch18",
            "label": "30讲高数第18讲·多元函数积分学",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 13,
    "date": "2026-11-12",
    "label": "Day 13 (11.12 周四)",
    "week": "第二周 · 🎉09-23数学真题一轮全通 & 🎓南大期末题(Day 3/6)",
    "focus": "21年真题清零(09-23一轮通关！) + 南大25&26真题 + 邂逅线代2-3章 + 🎓南大期末题(3/6)",
    "tasks": [
      {
        "id": "d13_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间小作文通知/告示/纪要模板背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2018",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-12",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d13_eng:essay_recite",
          "d13_eng:reading_practice"
        ],
        "day": 13
      },
      {
        "id": "d13_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "2021年数一真题(11道非绿题重做，🎉09–23年15套真题一轮全通！) + 邂逅线代第2章矩阵收官(后21题)",
        "desc": "上午清完2021年真题11道错题，09–23年15套真题完成一轮全覆盖！余时收官邂逅线代第2章矩阵并开启第3章向量前15题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2021",
            "label": "21年数一真题(22题)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_12",
            "label": "邂逅线代第2章(题36–56收官)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_13",
            "label": "邂逅线代第3章(题1–15)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 47,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2021",
            "label": "21年数一真题(22题)",
            "indices": [
              1,
              8,
              9,
              12,
              13,
              15,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "clear_non_green",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_12",
            "label": "邂逅线代第2章(题36–56收官)",
            "indices": [
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_13",
            "label": "邂逅线代第3章(题1–15)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-12",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 13,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d13_math_correction",
        "date": "2026-11-12",
        "day": 13,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d13",
        "paperTitle": "数一真题深度订正专场 (D13)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d13_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》史纲第3–4章(辛亥革命/建党与大革命，共65题)",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100442",
            "label": "史纲·第3章(24题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100443",
            "label": "史纲·第4章(41题)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 65,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100442",
            "label": "史纲·第3章(24题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100443",
            "label": "史纲·第4章(41题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-12",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 13
      },
      {
        "id": "d13_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【南大851最新卷】2025年真题(9题) + 2026年真题(10题)（🎉南大16套未做卷全部刷完！）",
        "desc": "下午3h整块攻克南大最新25、26年真题共19题！至此南大851全部20套真题一轮全部做完！（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_25",
            "label": "南大25真题(9题)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_26",
            "label": "南大26真题(10题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 18,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_25",
            "label": "南大25真题(9题)",
            "indices": [
              0,
              2,
              3,
              4,
              5,
              6,
              7,
              8
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_26",
            "label": "南大26真题(10题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-12",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 13,
        "flexTotalMinutes": 180
      },
      {
        "id": "d13_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》线代第3章向量(后29题收官) + 第4章方程组(前10题)",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_13",
            "label": "邂逅线代第3章(题16–44收官)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_14",
            "label": "邂逅线代第4章(题1–10)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 39,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_13",
            "label": "邂逅线代第3章(题16–44收官)",
            "indices": [
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_14",
            "label": "邂逅线代第4章(题1–10)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-12",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 13
      },
      {
        "id": "d13_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "🎓【南大期末题Day 3】拉氏变换与S域系统期末题 + 波哥习题集第6章Z变换(清前30道🟡/🔴错题)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_06",
            "label": "波哥习题集第6章(前30道错题)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 30,
        "mode": "green",
        "offlineLabel": "手头《南大期末题》Day 3 (拉氏/S域)",
        "offlineTarget": 1,
        "special": true,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_06",
            "label": "波哥习题集第6章(前30道错题)",
            "indices": [
              1,
              2,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              16,
              18,
              19,
              21,
              22,
              23,
              25,
              26,
              27,
              28,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              40
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-12",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null,
        "day": 13
      },
      {
        "id": "d13_p_zm",
        "date": "2026-11-12",
        "day": 13,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】25芝麻南大851模拟卷(一)·大题推导(全卷6题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 6,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_01",
            "label": "25芝麻南大851模拟卷(一)·大题推导(全卷6题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_01",
            "label": "25芝麻南大851模拟卷(一)·大题推导(全卷6题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d13_night",
        "date": "2026-11-12",
        "day": 13,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲线代第2讲·矩阵运算（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 35,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch20",
            "label": "30讲线代第2讲·矩阵运算",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch20",
            "label": "30讲线代第2讲·矩阵运算",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 14,
    "date": "2026-11-13",
    "label": "Day 14 (11.13 周五)",
    "week": "第二周收官 · 专业课模拟卷(二) & 🎓南大期末题(Day 4/6) & 真题二刷启动",
    "focus": "09-11数一真题二刷100%全绿 + 🔥专业课模拟卷(二)3h模考 + 邂逅线代4-6章 + 🎓南大期末题(4/6)",
    "tasks": [
      {
        "id": "d14_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间第二周大小作文限时默写检验(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2018",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-13",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d14_eng:essay_recite",
          "d14_eng:reading_practice"
        ],
        "day": 14
      },
      {
        "id": "d14_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "【真题二刷Day 1】09–11年真题残余黄/红题盲做清零 + 邂逅线代第4章收官(后11题) & 第5章相似(全29题)",
        "desc": "开启真题二刷验收：确保09、10、11三年真题共69题100%全绿！随后拿下邂逅线代第4章收尾与第5章相似矩阵全部29题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2009",
            "label": "09真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2010",
            "label": "10真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2011",
            "label": "11真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_14",
            "label": "邂逅线代第4章(题11–21收官)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_15",
            "label": "邂逅线代第5章·相似(29题)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 109,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2009",
            "label": "09真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2010",
            "label": "10真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2011",
            "label": "11真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_14",
            "label": "邂逅线代第4章(题11–21收官)",
            "indices": [
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_15",
            "label": "邂逅线代第5章·相似(29题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-13",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 14,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d14_math_correction",
        "date": "2026-11-13",
        "day": 14,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d14",
        "paperTitle": "数一真题深度订正专场 (D14)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d14_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》史纲第5–6章(革命新道路/抗日战争，共64题) + 第二周政治错题复盘",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100444",
            "label": "史纲·第5章(22题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100445",
            "label": "史纲·第6章(42题)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 64,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100444",
            "label": "史纲·第5章(22题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100445",
            "label": "史纲·第6章(42题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-13",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 14
      },
      {
        "id": "d14_p_pm",
        "cat": "major",
        "catLabel": "专业课·全真3h模考",
        "time": "14:00–17:00",
        "title": "🔥【专业课模拟卷(二)】3h全真模考（可选手头模拟卷2 或 网站刺猬哥/芝麻模拟卷二）",
        "desc": "第二周周五下午14:00-17:00全真3h模拟！检验本周电路专题与期末题特训成果。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_mn_26_02",
            "label": "26刺猬哥预测卷(二)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_02",
            "label": "26芝麻模拟卷(二)",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "专业课模拟卷(二) 3h模考+订正",
        "offlineTarget": 1,
        "special": true,
        "isOptionalOnlineMock": true,
        "scopedItems": [],
        "date": "2026-11-13",
        "kind": "mock",
        "moduleId": "mock",
        "moduleIds": [
          "mock"
        ],
        "offlineItemIds": null,
        "day": 14,
        "isFullMock": true
      },
      {
        "id": "d14_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》线代第6章 二次型（前35题，题1–35）",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_16",
            "label": "邂逅线代第6章(题1–35)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 35,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_16",
            "label": "邂逅线代第6章(题1–35)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-13",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 14
      },
      {
        "id": "d14_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "🎓【南大期末题Day 4】Z变换与离散系统期末题 + 波哥习题集第6章Z变换(清后27道错题，🎉第6章74题全绿！)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_06",
            "label": "波哥习题集第6章(后27道错题收官)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 27,
        "mode": "green",
        "offlineLabel": "手头《南大期末题》Day 4 (Z变换/离散)",
        "offlineTarget": 1,
        "special": true,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_06",
            "label": "波哥习题集第6章(后27道错题收官)",
            "indices": [
              41,
              42,
              43,
              45,
              46,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              72,
              73
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-13",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null,
        "day": 14
      },
      {
        "id": "d14_p_zm",
        "date": "2026-11-13",
        "day": 14,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】25芝麻南大851模拟卷(二)·大题推导(全卷7题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 7,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_02",
            "label": "25芝麻南大851模拟卷(二)·大题推导(全卷7题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_02",
            "label": "25芝麻南大851模拟卷(二)·大题推导(全卷7题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d14_night",
        "date": "2026-11-13",
        "day": 14,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲线代第3讲·向量组与线性相关 + 30讲线代第4讲·线性方程组解的结构（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 51,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch21",
            "label": "30讲线代第3讲·向量组与线性相关",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch22",
            "label": "30讲线代第4讲·线性方程组解的结构",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch21",
            "label": "30讲线代第3讲·向量组与线性相关",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch22",
            "label": "30讲线代第4讲·线性方程组解的结构",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 15,
    "date": "2026-11-14",
    "label": "Day 15 (11.14 周六)",
    "week": "第三周 · 🎓南大期末题收官 & 邂逅线代概率冲刺 & 华科22-24压轴",
    "focus": "12-14真题二刷 + 华科22真题 + 邂逅线代收官&概率启动 + 🎓南大期末题(Day 5/6)&波哥第7章",
    "tasks": [
      {
        "id": "d15_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大作文正反论证/双刃剑模板背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2017",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-14",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d15_eng:essay_recite",
          "d15_eng:reading_practice"
        ],
        "day": 15
      },
      {
        "id": "d15_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "【真题二刷Day 2】12–14年真题残余错题清零 + 邂逅线代第6章收尾(7题) & 第7章数一专项(19题，🎉邂逅线代收官！)",
        "desc": "上午二刷12–14年真题确保69题100%全绿；随后完成邂逅线代最后26题，宣告《邂逅遗憾》线代篇247题全部收官！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2012",
            "label": "12真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2013",
            "label": "13真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2014",
            "label": "14真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_16",
            "label": "邂逅线代第6章(题36–42收官)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_17",
            "label": "邂逅线代第7章·数一专项(19题)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 95,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2012",
            "label": "12真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2013",
            "label": "13真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2014",
            "label": "14真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_16",
            "label": "邂逅线代第6章(题36–42收官)",
            "indices": [
              35,
              36,
              37,
              38,
              39,
              40,
              41
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_17",
            "label": "邂逅线代第7章·数一专项(19题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-14",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 15,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d15_math_correction",
        "date": "2026-11-14",
        "day": 15,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d15",
        "paperTitle": "数一真题深度订正专场 (D15)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d15_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》史纲第7–8章(新中国成立与社会主义建设探索，共59题)",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100446",
            "label": "史纲·第7章(23题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100447",
            "label": "史纲·第8章(36题)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 59,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100446",
            "label": "史纲·第7章(23题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100447",
            "label": "史纲·第8章(36题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-14",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 15
      },
      {
        "id": "d15_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【华科824】2022年真题(28题) 3h全真模考 + 订正标绿",
        "desc": "进入华科近3年压轴大卷！3小时考场标准完成2022年真题28题并批改复盘。（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_22",
            "label": "华科22真题(28题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 28,
        "mode": "done",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_22",
            "label": "华科22真题(28题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-14",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 15,
        "flexTotalMinutes": 180
      },
      {
        "id": "d15_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》概率第1章随机事件(18题) + 第2章一维随机变量(前20题)",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_18",
            "label": "邂逅概率第1章(18题)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_19",
            "label": "邂逅概率第2章(题1–20)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 38,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_18",
            "label": "邂逅概率第1章(18题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_19",
            "label": "邂逅概率第2章(题1–20)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-14",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 15
      },
      {
        "id": "d15_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "🎓【南大期末题Day 5】DTFT与滤波器综合期末题 + 波哥第7章DTFT(讲义8错题 + 习题集35错题清零)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_07",
            "label": "波哥讲义第7章·DTFT(8题)",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_07",
            "label": "波哥习题集第7章·DTFT(35题)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 43,
        "mode": "green",
        "offlineLabel": "手头《南大期末题》Day 5 (DTFT/系统)",
        "offlineTarget": 1,
        "special": true,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_07",
            "label": "波哥讲义第7章·DTFT(8题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_07",
            "label": "波哥习题集第7章·DTFT(35题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-14",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null,
        "day": 15
      },
      {
        "id": "d15_p_zm",
        "date": "2026-11-14",
        "day": 15,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】25芝麻南大851模拟卷(三)·大题推导(前5题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 5,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_03",
            "label": "25芝麻南大851模拟卷(三)·大题推导(前5题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_03",
            "label": "25芝麻南大851模拟卷(三)·大题推导(前5题)",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d15_night",
        "date": "2026-11-14",
        "day": 15,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲线代第5讲·特征值与特征向量（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 34,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch23",
            "label": "30讲线代第5讲·特征值与特征向量",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch23",
            "label": "30讲线代第5讲·特征值与特征向量",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 16,
    "date": "2026-11-15",
    "label": "Day 16 (11.15 周日)",
    "week": "第三周 · 🎓南大期末题100%收官 & 🎉波哥4-9章全线收官！",
    "focus": "15-17真题二刷 + 华科23真题 + 邂逅概率第2-3章 + 🎓南大期末题(Day 6/6收官)&波哥第8章收官",
    "tasks": [
      {
        "id": "d16_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间小作文推荐信/道歉信/感谢信背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2017",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-15",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d16_eng:essay_recite",
          "d16_eng:reading_practice"
        ],
        "day": 16
      },
      {
        "id": "d16_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "【真题二刷Day 3】15–17年真题残余错题清零 + 邂逅概率第2章一维随机变量收官(后20题)",
        "desc": "二刷15–17年真题确保69题100%全绿；随后收官邂逅概率第2章40题！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2015",
            "label": "15真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2016",
            "label": "16真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2017",
            "label": "17真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_19",
            "label": "邂逅概率第2章(题21–40收官)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 89,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2015",
            "label": "15真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2016",
            "label": "16真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2017",
            "label": "17真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_19",
            "label": "邂逅概率第2章(题21–40收官)",
            "indices": [
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-15",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 16,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d16_math_correction",
        "date": "2026-11-15",
        "day": 16,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d16",
        "paperTitle": "数一真题深度订正专场 (D16)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d16_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》史纲第9–10章收官 + 思修绪论与第1–2章(共52题)",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100448",
            "label": "史纲·第9章(12题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100449",
            "label": "史纲·第10章(7题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100450",
            "label": "思修·绪论(7题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100451",
            "label": "思修·第1章(16题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100452",
            "label": "思修·第2章(10题)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 52,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100448",
            "label": "史纲·第9章(12题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100449",
            "label": "史纲·第10章(7题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100450",
            "label": "思修·绪论(7题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100451",
            "label": "思修·第1章(16题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100452",
            "label": "思修·第2章(10题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-15",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 16
      },
      {
        "id": "d16_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【华科824】2023年真题(28题) 3h全真模考 + 订正标绿",
        "desc": "下午3h整块完成华科2023年真题28题并当场批改复盘。（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_23",
            "label": "华科23真题(28题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 28,
        "mode": "done",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_23",
            "label": "华科23真题(28题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-15",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 16,
        "flexTotalMinutes": 180
      },
      {
        "id": "d16_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》概率第3章 二维随机变量（前35题，题1–35）",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_20",
            "label": "邂逅概率第3章(题1–35)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 35,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_20",
            "label": "邂逅概率第3章(题1–35)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-15",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 16
      },
      {
        "id": "d16_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "🎓【南大期末题Day 6收官】期末错题总验收 + 波哥第8章傅氏应用(讲义3题+习题集45题清零，🎉波哥4–9章全通！)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_08",
            "label": "波哥讲义第8章(3题收官)",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_08",
            "label": "波哥习题集第8章(45题收官)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 48,
        "mode": "green",
        "offlineLabel": "手头《南大期末题》全套收官验收",
        "offlineTarget": 1,
        "special": true,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_08",
            "label": "波哥讲义第8章(3题收官)",
            "indices": [
              0,
              1,
              2
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_08",
            "label": "波哥习题集第8章(45题收官)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-15",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null,
        "day": 16
      },
      {
        "id": "d16_p_zm",
        "date": "2026-11-15",
        "day": 16,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】25芝麻南大851模拟卷(三)·大题推导(后5题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 5,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_03",
            "label": "25芝麻南大851模拟卷(三)·大题推导(后5题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_03",
            "label": "25芝麻南大851模拟卷(三)·大题推导(后5题)",
            "indices": [
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d16_night",
        "date": "2026-11-15",
        "day": 16,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲线代第6讲·二次型与正定性 + 30讲概率第1讲·随机事件与概率（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 59,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch24",
            "label": "30讲线代第6讲·二次型与正定性",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch25",
            "label": "30讲概率第1讲·随机事件与概率",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch24",
            "label": "30讲线代第6讲·二次型与正定性",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch25",
            "label": "30讲概率第1讲·随机事件与概率",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 17,
    "date": "2026-11-16",
    "label": "Day 17 (11.16 周一)",
    "week": "第三周 · 华科近10年真题收官 & 📚芝麻400题专题",
    "focus": "18-20真题二刷 + 华科24真题(华科收官！) + 邂逅概率第3-4章收官 + 📚芝麻400题(一)",
    "tasks": [
      {
        "id": "d17_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大小作文套卷限时仿写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2016",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-16",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d17_eng:essay_recite",
          "d17_eng:reading_practice"
        ],
        "day": 17
      },
      {
        "id": "d17_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "【真题二刷Day 4】18–20年真题残余错题清零 + 邂逅概率第3章收尾(10题) & 第4章数字特征(前15题)",
        "desc": "重点二刷18–20年真题确保69题100%全绿；随后收官邂逅概率第3章并开启第4章数字特征。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2018",
            "label": "18真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2019",
            "label": "19真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2020",
            "label": "20真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_20",
            "label": "邂逅概率第3章(题36–45收官)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_21",
            "label": "邂逅概率第4章(题1–15)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 94,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2018",
            "label": "18真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2019",
            "label": "19真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2020",
            "label": "20真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_20",
            "label": "邂逅概率第3章(题36–45收官)",
            "indices": [
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_21",
            "label": "邂逅概率第4章(题1–15)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-16",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 17,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d17_math_correction",
        "date": "2026-11-16",
        "day": 17,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d17",
        "paperTitle": "数一真题深度订正专场 (D17)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d17_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》思修第3–5章(中国精神/价值准则/道德规范，共70题)",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100453",
            "label": "思修·第3章(15题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100454",
            "label": "思修·第4章(14题)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100455",
            "label": "思修·第5章(41题)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 70,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100453",
            "label": "思修·第3章(15题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100454",
            "label": "思修·第4章(14题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100455",
            "label": "思修·第5章(41题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-16",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 17
      },
      {
        "id": "d17_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【华科824收官】2024年真题(28题) 3h全真模考（🎉华科近10年真题全部刷完！）",
        "desc": "下午3h整块完成华科2024年最新真题28题！至此华科824近10年真题一轮全部通关！（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_24",
            "label": "华科24真题(28题收官)",
            "moduleId": "other"
          }
        ],
        "targetCount": 28,
        "mode": "done",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_24",
            "label": "华科24真题(28题收官)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-16",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 17,
        "flexTotalMinutes": 180
      },
      {
        "id": "d17_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》概率第4章 随机变量的数字特征（后34题，🎉第4章49题全绿收官！）",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_21",
            "label": "邂逅概率第4章(题16–49收官)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 34,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_21",
            "label": "邂逅概率第4章(题16–49收官)",
            "indices": [
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-16",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 17
      },
      {
        "id": "d17_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "📚【芝麻400题专题一】时域/卷积/傅氏挑刷 + 波哥强化第1–2章残余错题清零(46道🟡/🔴题)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_01",
            "label": "波哥强化第1章(50题收官)",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_02",
            "label": "波哥强化第2章(49题收官)",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_01",
            "label": "波哥习题集第1章(88题未标)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 134,
        "mode": "green",
        "offlineLabel": "《芝麻400题》专题一挑刷",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_01",
            "label": "波哥强化第1章(50题收官)",
            "indices": [
              7,
              12,
              13,
              16,
              23,
              24,
              32,
              36,
              37,
              41,
              42,
              44,
              46,
              47,
              48
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_02",
            "label": "波哥强化第2章(49题收官)",
            "indices": [
              1,
              2,
              3,
              4,
              5,
              7,
              8,
              9,
              13,
              15,
              16,
              17,
              25,
              26,
              27,
              28,
              29,
              33,
              34,
              35,
              36,
              37,
              38,
              40,
              42,
              43,
              44,
              45,
              46,
              47,
              48
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_01",
            "label": "波哥习题集第1章(88题未标)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              70,
              71,
              72,
              73,
              74,
              75,
              76,
              77,
              78,
              79,
              80,
              81,
              82,
              83,
              84,
              85,
              86,
              87
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-16",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null,
        "day": 17
      },
      {
        "id": "d17_p_zm",
        "date": "2026-11-16",
        "day": 17,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】25芝麻南大851模拟卷(四)·大题推导(前5题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 5,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_04",
            "label": "25芝麻南大851模拟卷(四)·大题推导(前5题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_04",
            "label": "25芝麻南大851模拟卷(四)·大题推导(前5题)",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d17_night",
        "date": "2026-11-16",
        "day": 17,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲概率第2讲·一维随机变量及分布（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 36,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch26",
            "label": "30讲概率第2讲·一维随机变量及分布",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch26",
            "label": "30讲概率第2讲·一维随机变量及分布",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 18,
    "date": "2026-11-17",
    "label": "Day 18 (11.17 周二)",
    "week": "第三周 · 🎉《邂逅遗憾》1219题 & 《肖1000》1148题 & 南大20套 全部大满贯！",
    "focus": "21-23真题二刷 + 南大20-23错题专场全绿 + 🎉邂逅1219题全书收官 + 🎉肖1000全书刷完！",
    "tasks": [
      {
        "id": "d18_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大小作文套卷限时仿写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2016",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-17",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d18_eng:essay_recite",
          "d18_eng:reading_practice"
        ],
        "day": 18
      },
      {
        "id": "d18_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "【真题二刷Day 5收官】21–23年真题残余错题清零 + 邂逅概率第5章大数定律(13题) & 第6章抽样分布(20题)",
        "desc": "上午二刷21–23年真题确保66题100%全绿（09–23年15套真题二刷全部完成！）；随后拿下邂逅概率第5、6章共33题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2021",
            "label": "21真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2022",
            "label": "22真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2023",
            "label": "23真题(二刷全绿)",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_22",
            "label": "邂逅概率第5章·大数定律(13题)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_23",
            "label": "邂逅概率第6章·抽样分布(20题)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 99,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2021",
            "label": "21真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2022",
            "label": "22真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2023",
            "label": "23真题(二刷全绿)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_22",
            "label": "邂逅概率第5章·大数定律(13题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_23",
            "label": "邂逅概率第6章·抽样分布(20题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-17",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 18,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d18_math_correction",
        "date": "2026-11-17",
        "day": 18,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d18",
        "paperTitle": "数一真题深度订正专场 (D18)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d18_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "《27肖1000》思修第6章法治素养(63题)（🎉🎉《27肖1000题》全书52章1148题一轮全部刷完！）",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100456",
            "label": "思修·第6章法治(63题收官)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 63,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100456",
            "label": "思修·第6章法治(63题收官)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-17",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 18
      },
      {
        "id": "d18_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【南大851全绿验收】2020–2023年真题 44道🟡/🔴/⚪非绿题专场清零（🎉南大20套229题100%全绿！）",
        "desc": "专门用3小时把之前做过的南大20–23年真题里剩下的44道非绿题逐一重算标绿，实现南大851二十年真题100%全绿！（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_20",
            "label": "南大20真题(19题全绿)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_21",
            "label": "南大21真题(10道黄/红错题)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_22",
            "label": "南大22真题(22题全绿)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_23",
            "label": "南大23真题(11道黄/红错题)",
            "moduleId": "other"
          }
        ],
        "targetCount": 44,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_20",
            "label": "南大20真题(19题全绿)",
            "indices": [
              4,
              5,
              6,
              8,
              9,
              13,
              15,
              16,
              17,
              18
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_21",
            "label": "南大21真题(10道黄/红错题)",
            "indices": [
              0,
              2,
              3,
              6,
              7,
              8,
              10,
              12,
              13,
              15
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_22",
            "label": "南大22真题(22题全绿)",
            "indices": [
              4,
              5,
              7,
              8,
              9,
              12,
              13,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_23",
            "label": "南大23真题(11道黄/红错题)",
            "indices": [
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              15,
              18
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-17",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 18,
        "flexTotalMinutes": 180
      },
      {
        "id": "d18_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》概率第7章参数估计(21题) + 第8章假设检验(22题)（🎉🎉《邂逅遗憾》全书25章1219题100%收官！）",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_24",
            "label": "邂逅概率第7章·参数估计(21题)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_25",
            "label": "邂逅概率第8章·假设检验(22题)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 43,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_24",
            "label": "邂逅概率第7章·参数估计(21题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_25",
            "label": "邂逅概率第8章·假设检验(22题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "clear_non_green",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-17",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 18
      },
      {
        "id": "d18_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "📚【芝麻400题专题二】拉氏/Z变换/系统函数挑刷 + 波哥强化第3章离散时域(清18未标+5错题，🎉波哥强化1–7章全绿！)",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_03",
            "label": "波哥强化第3章(33题收官)",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_02",
            "label": "波哥习题集第2章(66题未标)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 89,
        "mode": "green",
        "offlineLabel": "《芝麻400题》专题二挑刷",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_03",
            "label": "波哥强化第3章(33题收官)",
            "indices": [
              6,
              7,
              8,
              9,
              11,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_02",
            "label": "波哥习题集第2章(66题未标)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-17",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null,
        "day": 18
      },
      {
        "id": "d18_p_zm",
        "date": "2026-11-17",
        "day": 18,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】25芝麻南大851模拟卷(四)·大题推导(后4题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 4,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_04",
            "label": "25芝麻南大851模拟卷(四)·大题推导(后4题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_04",
            "label": "25芝麻南大851模拟卷(四)·大题推导(后4题)",
            "indices": [
              5,
              6,
              7,
              8
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d18_night",
        "date": "2026-11-17",
        "day": 18,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲概率第3讲·多维随机变量及分布 + 30讲概率第4讲·随机变量的数字特征（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 56,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch27",
            "label": "30讲概率第3讲·多维随机变量及分布",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch28",
            "label": "30讲概率第4讲·随机变量的数字特征",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch27",
            "label": "30讲概率第3讲·多维随机变量及分布",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch28",
            "label": "30讲概率第4讲·随机变量的数字特征",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 19,
    "date": "2026-11-18",
    "label": "Day 19 (11.18 周三)",
    "week": "第三周 · 全科二刷三刷错题清零大决战 (Day 1/3)",
    "focus": "09-23数学真题三刷抽检 + 华科15-19错题二刷 + 邂逅高数错题二刷 + 波哥1-3章线上点绿",
    "tasks": [
      {
        "id": "d19_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大小作文高频模板默写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2015",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-18",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d19_eng:essay_recite",
          "d19_eng:reading_practice"
        ],
        "day": 19
      },
      {
        "id": "d19_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "【真题三刷验收(上)】2009–2016年8套数一真题 错题转盘无死角抽检 + 顽固题重算",
        "desc": "打开网站「错题转盘」或逐套检查09–16年真题，任何之前卡壳过的题当场动笔再算一遍，确保100%秒出思路！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2009",
            "label": "09真题验收",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2012",
            "label": "12真题验收",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2014",
            "label": "14真题验收",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2016",
            "label": "16真题验收",
            "moduleId": "math_truth"
          }
        ],
        "targetCount": 92,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2009",
            "label": "09真题验收",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2012",
            "label": "12真题验收",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2014",
            "label": "14真题验收",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2016",
            "label": "16真题验收",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          }
        ],
        "date": "2026-11-18",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth"
        ],
        "offlineItemIds": null,
        "day": 19,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d19_math_correction",
        "date": "2026-11-18",
        "day": 19,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d19",
        "paperTitle": "数一真题深度订正专场 (D19)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d19_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "【肖1000错题总清零(一)】马原全8章 🟡/🔴错题专场二刷全绿",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100403",
            "label": "马原·第1章(二刷复检)",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100406",
            "label": "马原·第4章政经(剩余52道错题清零)",
            "moduleId": "politics"
          }
        ],
        "targetCount": 135,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100403",
            "label": "马原·第1章(二刷复检)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              70,
              71,
              72,
              73,
              74,
              75,
              76,
              77,
              78,
              79,
              80,
              81,
              82
            ],
            "taskType": "full_recheck",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100406",
            "label": "马原·第4章政经(剩余52道错题清零)",
            "indices": [
              30,
              31,
              32,
              35,
              36,
              37,
              39,
              41,
              42,
              44,
              45,
              46,
              47,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              65,
              67,
              68,
              69,
              70,
              71,
              72,
              73,
              74,
              75,
              76,
              77,
              78,
              79,
              80,
              81,
              82,
              83,
              84,
              85,
              87,
              88,
              89,
              90,
              91,
              92
            ],
            "taskType": "clear_non_green",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-18",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 19
      },
      {
        "id": "d19_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【华科824二刷清零(上)】2015–2019年5套华科真题 🟡/🔴错题专场重做全绿",
        "desc": "下午3h整块把第一、二周刷过的华科15–19年真题里留下的所有模糊/不会题全部二刷变绿！（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_15",
            "label": "华科15全绿",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_16",
            "label": "华科16全绿",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_17",
            "label": "华科17全绿",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_18",
            "label": "华科18全绿",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_19",
            "label": "华科19全绿",
            "moduleId": "other"
          }
        ],
        "targetCount": 97,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_15",
            "label": "华科15全绿",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_16",
            "label": "华科16全绿",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_17",
            "label": "华科17全绿",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_18",
            "label": "华科18全绿",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_19",
            "label": "华科19全绿",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-18",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 19,
        "flexTotalMinutes": 180
      },
      {
        "id": "d19_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "【《邂逅遗憾》二刷(上)】高数第1–10章 残余🟡/🔴错题集中二刷清零",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅第1章(二刷复检)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_02",
            "label": "邂逅第2章(二刷复检)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_07",
            "label": "邂逅第7章(二刷复检)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_09",
            "label": "邂逅第9章(二刷复检)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 389,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅第1章(二刷复检)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              70,
              71,
              72,
              73,
              74,
              75,
              76,
              77,
              78,
              79,
              80,
              81,
              82,
              83,
              84,
              85,
              86,
              87,
              88,
              89,
              90,
              91,
              92,
              93,
              94,
              95,
              96,
              97,
              98,
              99,
              100,
              101,
              102,
              103,
              104,
              105,
              106,
              107,
              108,
              109,
              110,
              111,
              112,
              113,
              114,
              115,
              116,
              117,
              118,
              119,
              120,
              121,
              122,
              123,
              124,
              125,
              126,
              127,
              128
            ],
            "taskType": "full_recheck",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_02",
            "label": "邂逅第2章(二刷复检)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              70,
              71,
              72,
              73,
              74,
              75,
              76,
              77,
              78,
              79,
              80,
              81,
              82,
              83,
              84,
              85,
              86,
              87,
              88,
              89,
              90,
              91,
              92,
              93,
              94,
              95,
              96,
              97,
              98,
              99,
              100
            ],
            "taskType": "full_recheck",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_07",
            "label": "邂逅第7章(二刷复检)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              70,
              71,
              72,
              73,
              74,
              75,
              76,
              77,
              78,
              79,
              80,
              81,
              82,
              83,
              84,
              85,
              86,
              87
            ],
            "taskType": "full_recheck",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_09",
            "label": "邂逅第9章(二刷复检)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62,
              63,
              64,
              65,
              66,
              67,
              68,
              69,
              70
            ],
            "taskType": "full_recheck",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-18",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 19
      },
      {
        "id": "d19_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "📚【芝麻400题专题三】+ 波哥1–3章讲义与基础习题集（线下已做部分线上过筛点绿）",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_01",
            "label": "波哥讲义第1章",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_02",
            "label": "波哥讲义第2章",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_03",
            "label": "波哥讲义第3章",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_03",
            "label": "波哥习题集第3章(44题未标)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 119,
        "mode": "green",
        "offlineLabel": "《芝麻400题》专题三挑刷",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_01",
            "label": "波哥讲义第1章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_02",
            "label": "波哥讲义第2章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_03",
            "label": "波哥讲义第3章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_03",
            "label": "波哥习题集第3章(44题未标)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43
            ],
            "taskType": "clear_non_green",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-18",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18"
        ],
        "offlineItemIds": null,
        "day": 19
      },
      {
        "id": "d19_p_zm",
        "date": "2026-11-18",
        "day": 19,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】25芝麻南大851模拟卷(五)·大题推导(前5题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 5,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_05",
            "label": "25芝麻南大851模拟卷(五)·大题推导(前5题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_05",
            "label": "25芝麻南大851模拟卷(五)·大题推导(前5题)",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d19_night",
        "date": "2026-11-18",
        "day": 19,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲概率第5讲·大数定律与中心极限定理 + 30讲概率第6讲·数理统计基础（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 40,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch29",
            "label": "30讲概率第5讲·大数定律与中心极限定理",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch30",
            "label": "30讲概率第6讲·数理统计基础",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch29",
            "label": "30讲概率第5讲·大数定律与中心极限定理",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch30",
            "label": "30讲概率第6讲·数理统计基础",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 20,
    "date": "2026-11-19",
    "label": "Day 20 (11.19 周四)",
    "week": "第三周 · 全科二刷三刷错题清零大决战 (Day 2/3)",
    "focus": "17-23数学真题三刷100%全绿 + 华科20-24错题二刷全绿 + 邂逅线代概率错题二刷 + 电路/期末题终极复盘",
    "tasks": [
      {
        "id": "d20_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大小作文终极个人模板定稿默写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2015",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-19",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d20_eng:essay_recite",
          "d20_eng:reading_practice"
        ],
        "day": 20
      },
      {
        "id": "d20_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "【真题三刷终极验收(下)】2017–2023年7套数一真题 100%全绿验收（🎉09–23年342题100%全绿！）",
        "desc": "逐套核验17–23年真题，把最后残余的任何一道非绿题彻底干掉，达成09–23年15套数一真题342道题100%全绿成就！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2017",
            "label": "17真题全绿",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2019",
            "label": "19真题全绿",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2020",
            "label": "20真题全绿",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2022",
            "label": "22真题全绿",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2023",
            "label": "23真题全绿",
            "moduleId": "math_truth"
          }
        ],
        "targetCount": 113,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2017",
            "label": "17真题全绿",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2019",
            "label": "19真题全绿",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2020",
            "label": "20真题全绿",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2022",
            "label": "22真题全绿",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2023",
            "label": "23真题全绿",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          }
        ],
        "date": "2026-11-19",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth"
        ],
        "offlineItemIds": null,
        "day": 20,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d20_math_correction",
        "date": "2026-11-19",
        "day": 20,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d20",
        "paperTitle": "数一真题深度订正专场 (D20)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d20_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "【肖1000错题总清零(二)】新思想 + 毛中特 🟡/🔴错题专场二刷全绿",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100412",
            "label": "毛中特·第2章",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100427",
            "label": "新思想·第6章",
            "moduleId": "politics"
          }
        ],
        "targetCount": 70,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100412",
            "label": "毛中特·第2章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36
            ],
            "taskType": "full_recheck",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100427",
            "label": "新思想·第6章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32
            ],
            "taskType": "full_recheck",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-19",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 20
      },
      {
        "id": "d20_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h弹性",
        "time": "14:00–17:00",
        "title": "【南大851对账补遗10道未标题(21年3题+23年7题) + 华科824(20–24)错题回炉】",
        "desc": "精准补齐南大851在2021年(3道未标⚪)与2023年(7道未标⚪)合计10道差额题（凑齐193道待绿全覆盖），并完成华科824近5年错题二刷！（14:00–17:00弹性分配做题与订正，总和≤180m）",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_21",
            "label": "南大21真题(对账补遗3道未标题)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_23",
            "label": "南大23真题(对账补遗7道未标题)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_20",
            "label": "华科20真题",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_21",
            "label": "华科21真题",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_22",
            "label": "华科22真题",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_23",
            "label": "华科23真题",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_24",
            "label": "华科24真题",
            "moduleId": "other"
          }
        ],
        "targetCount": 148,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_21",
            "label": "南大21真题(对账补遗3道未标题)",
            "indices": [
              17,
              18,
              19
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_23",
            "label": "南大23真题(对账补遗7道未标题)",
            "indices": [
              12,
              13,
              16,
              17,
              19,
              20,
              21
            ],
            "taskType": "clear_non_green",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_20",
            "label": "华科20真题",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_21",
            "label": "华科21真题",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_22",
            "label": "华科22真题",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_23",
            "label": "华科23真题",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_24",
            "label": "华科24真题",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-19",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 20,
        "flexTotalMinutes": 180
      },
      {
        "id": "d20_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "【《邂逅遗憾》二刷(下)】线代第1–7章 & 概率第1–8章 残余🟡/🔴错题集中二刷清零",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_12",
            "label": "邂逅线代第2章(二刷复检)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_16",
            "label": "邂逅线代第6章(二刷复检)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_20",
            "label": "邂逅概率第3章(二刷复检)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_21",
            "label": "邂逅概率第4章(二刷复检)",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 192,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_12",
            "label": "邂逅线代第2章(二刷复检)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55
            ],
            "taskType": "full_recheck",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_16",
            "label": "邂逅线代第6章(二刷复检)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41
            ],
            "taskType": "full_recheck",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_20",
            "label": "邂逅概率第3章(二刷复检)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44
            ],
            "taskType": "full_recheck",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_21",
            "label": "邂逅概率第4章(二刷复检)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48
            ],
            "taskType": "full_recheck",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-19",
        "kind": "online",
        "moduleId": "xhy",
        "moduleIds": [
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 20
      },
      {
        "id": "d20_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "⚡电路专题 + 🎓南大期末题 + 波哥4–9章 顽固红题终极二刷清零",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_09",
            "label": "波哥习题集第9章·电路(二刷复检)",
            "moduleId": "bogo9"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_07",
            "label": "波哥强化第7章·电路(二刷复检)",
            "moduleId": "bogo9"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_05",
            "label": "波哥习题集第5章(二刷复检)",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_06",
            "label": "波哥习题集第6章(二刷复检)",
            "moduleId": "bogo18"
          }
        ],
        "targetCount": 95,
        "mode": "green",
        "offlineLabel": "⚡电路专题+🎓南大期末题错题二刷",
        "offlineTarget": 1,
        "special": true,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_09",
            "label": "波哥习题集第9章·电路(二刷复检)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38
            ],
            "taskType": "full_recheck",
            "moduleId": "bogo9"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_07",
            "label": "波哥强化第7章·电路(二刷复检)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17
            ],
            "taskType": "full_recheck",
            "moduleId": "bogo9"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_05",
            "label": "波哥习题集第5章(二刷复检)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              8,
              9,
              20,
              22,
              23,
              24,
              25,
              26,
              37,
              42,
              52,
              64,
              66,
              79
            ],
            "taskType": "full_recheck",
            "moduleId": "bogo18"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_06",
            "label": "波哥习题集第6章(二刷复检)",
            "indices": [
              0,
              3,
              14,
              15,
              17,
              20,
              24,
              29,
              30,
              38,
              39,
              44,
              47,
              56,
              57,
              70,
              71
            ],
            "taskType": "full_recheck",
            "moduleId": "bogo18"
          }
        ],
        "date": "2026-11-19",
        "kind": "online",
        "moduleId": "bogo18",
        "moduleIds": [
          "bogo18",
          "bogo9"
        ],
        "offlineItemIds": null,
        "day": 20
      },
      {
        "id": "d20_p_zm",
        "date": "2026-11-19",
        "day": 20,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】25芝麻南大851模拟卷(五)·大题推导(后4题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 4,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_05",
            "label": "25芝麻南大851模拟卷(五)·大题推导(后4题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_05",
            "label": "25芝麻南大851模拟卷(五)·大题推导(后4题)",
            "indices": [
              5,
              6,
              7,
              8
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d20_night",
        "date": "2026-11-19",
        "day": 20,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲高数前10讲核心定理与典型题二刷复查（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 35,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch1",
            "label": "30讲高数前10讲核心定理与典型题二刷复查",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch1",
            "label": "30讲高数前10讲核心定理与典型题二刷复查",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  },
  {
    "day": 21,
    "date": "2026-11-20",
    "label": "Day 21 (11.20 周五 · 结营大满贯)",
    "week": "第三周结营 · 🔥专业课模拟卷(三) & 21天特训全科绿标总验收！",
    "focus": "数学真题&邂逅&36讲&880结营总检 + 🔥专业课模拟卷(三)3h模考 + 肖1000全绿验收 + 后29天模拟卷交接",
    "tasks": [
      {
        "id": "d21_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00–08:30 & 17:00–17:50",
        "title": "早间大小作文考场全真模拟默写(30m) + 下午真题阅读与生词本总检(50m)",
        "desc": "早间08:00–08:30背默作文功能句(30m) + 下午17:00–17:50真题阅读精读与生词复盘(50m)。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2025",
            "label": "英语真题阅读/词本",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": [],
        "date": "2026-11-20",
        "kind": "offline",
        "moduleId": "english",
        "moduleIds": [
          "english"
        ],
        "offlineItemIds": [
          "d21_eng:essay_recite",
          "d21_eng:reading_practice"
        ],
        "day": 21
      },
      {
        "id": "d21_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h考场块",
        "time": "08:30–11:30",
        "title": "🎉【数学21天结营总验收】09–23真题(15套) + 《邂逅遗憾》(25章) 绿标率终极总检",
        "desc": "最后核查09–23年真题与《邂逅遗憾》全书绿标率，整理出后29天考前模拟卷冲刺阶段的「核心公式与易错陷阱清单」！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2022",
            "label": "22真题终检",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2023",
            "label": "23真题终检",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章(绿标终检)",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_16",
            "label": "邂逅线代终检",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_24",
            "label": "邂逅概率终检",
            "moduleId": "xhy"
          }
        ],
        "targetCount": 157,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2022",
            "label": "22真题终检",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2023",
            "label": "23真题终检",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21
            ],
            "taskType": "full_recheck",
            "moduleId": "math_truth"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章(绿标终检)",
            "indices": [
              1,
              2,
              4,
              5,
              9,
              10,
              11,
              15,
              16,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              29,
              34,
              35,
              40,
              42,
              44,
              46,
              47,
              48,
              50,
              52,
              57,
              58,
              63,
              64,
              67,
              68,
              71,
              72,
              73,
              74,
              75,
              76,
              80,
              81,
              82,
              83,
              84,
              89,
              92,
              93,
              97,
              113
            ],
            "taskType": "full_recheck",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_16",
            "label": "邂逅线代终检",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41
            ],
            "taskType": "full_recheck",
            "moduleId": "xhy"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_24",
            "label": "邂逅概率终检",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20
            ],
            "taskType": "full_recheck",
            "moduleId": "xhy"
          }
        ],
        "date": "2026-11-20",
        "kind": "online",
        "moduleId": "math_truth",
        "moduleIds": [
          "math_truth",
          "xhy"
        ],
        "offlineItemIds": null,
        "day": 21,
        "scheduleNotes": "纯做题180m不翻答案；订正放11:30–12:30"
      },
      {
        "id": "d21_math_correction",
        "date": "2026-11-20",
        "day": 21,
        "cat": "math",
        "catLabel": "数学·订正(60m)",
        "time": "11:30–12:30",
        "title": "09–23真题做题阅卷估分与深度订正（60分钟）",
        "desc": "11:30–12:30核对答案、错因归类分析与独立重算；已处理完毕的结余时间无缝转入《邂逅遗憾》。",
        "kind": "correction",
        "paperId": "shu1_zt_d21",
        "paperTitle": "数一真题深度订正专场 (D21)",
        "targetCount": 0,
        "scopedItems": [],
        "chapters": [],
        "moduleId": "correction",
        "moduleIds": [
          "correction"
        ],
        "requiresGrading": false,
        "scheduledCorrectionMinutes": 60,
        "offlineItemIds": null
      },
      {
        "id": "d21_pol",
        "cat": "politics",
        "catLabel": "政治·60m",
        "time": "13:30–14:00 & 18:30–19:00",
        "title": "🎉【肖1000结营总验收】史纲 + 思修 🟡/🔴错题专场二刷清零（肖1000全书1148题100%全绿！）",
        "desc": "午间13:30–14:00刷题开机(30m) + 晚间18:30–19:00刷题及错题复盘标绿(30m)。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100445",
            "label": "史纲·第6章全绿",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100456",
            "label": "思修·第6章全绿",
            "moduleId": "politics"
          }
        ],
        "targetCount": 105,
        "mode": "green",
        "offlineLabel": "政治带背30m",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100445",
            "label": "史纲·第6章全绿",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41
            ],
            "taskType": "full_recheck",
            "moduleId": "politics"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100456",
            "label": "思修·第6章全绿",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              49,
              50,
              51,
              52,
              53,
              54,
              55,
              56,
              57,
              58,
              59,
              60,
              61,
              62
            ],
            "taskType": "full_recheck",
            "moduleId": "politics"
          }
        ],
        "date": "2026-11-20",
        "kind": "online",
        "moduleId": "politics",
        "moduleIds": [
          "politics"
        ],
        "offlineItemIds": null,
        "day": 21
      },
      {
        "id": "d21_p_pm",
        "cat": "major",
        "catLabel": "专业课·全真3h模考",
        "time": "14:00–17:00",
        "title": "🔥【专业课模拟卷(三) · 结营大考】3h全真模考（手头模拟卷3 或 网站刺猬哥/芝麻模拟卷三）",
        "desc": "21天魔鬼特训最后一场下午3h全真模考！用满分状态检验南大851+华科824+电路专题+南大期末题全部打通后的硬实力！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_mn_26_03",
            "label": "26刺猬哥预测卷(三)",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_03",
            "label": "26芝麻模拟卷(三)",
            "moduleId": "other"
          }
        ],
        "offlineLabel": "专业课模拟卷(三) 3h结营模考+订正",
        "offlineTarget": 1,
        "special": true,
        "isOptionalOnlineMock": true,
        "scopedItems": [],
        "date": "2026-11-20",
        "kind": "mock",
        "moduleId": "mock",
        "moduleIds": [
          "mock"
        ],
        "offlineItemIds": null,
        "day": 21,
        "isFullMock": true
      },
      {
        "id": "d21_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间90m",
        "time": "19:00–20:30",
        "title": "《邂逅遗憾》&《36讲》&《李林880》全书终极复盘验收",
        "desc": "晚间19:00–20:30集中火力推进《邂逅遗憾》专项技巧，吃透典型题型与解题逻辑。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch57",
            "label": "36讲线代终检",
            "moduleId": "other"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch66",
            "label": "36讲概率终检",
            "moduleId": "other"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch159",
            "label": "880高数第2章(未标与绿标终检)",
            "moduleId": "other"
          }
        ],
        "targetCount": 87,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch57",
            "label": "36讲线代终检",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch66",
            "label": "36讲概率终检",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch159",
            "label": "880高数第2章(未标与绿标终检)",
            "indices": [
              19,
              37,
              46,
              50,
              54,
              61,
              62,
              63,
              64,
              65,
              66,
              70,
              71,
              72,
              73,
              76,
              77,
              81,
              85,
              90,
              96,
              105,
              108,
              110,
              0,
              1,
              3,
              4,
              6,
              10,
              11,
              12,
              13,
              21,
              22,
              23,
              25,
              26,
              30,
              31,
              44,
              45,
              47,
              48,
              58,
              59,
              67,
              74,
              75,
              78,
              79,
              83,
              84,
              86,
              87,
              89,
              94,
              95,
              100,
              101
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          }
        ],
        "date": "2026-11-20",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other"
        ],
        "offlineItemIds": null,
        "day": 21
      },
      {
        "id": "d21_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·波哥攻坚(50m)",
        "time": "20:30–21:20",
        "title": "🎉【专业课21天结营总验收】南大851(20套)+华科824(10套)+波哥(1–9章)+⚡电路+🎓期末题 终极验收",
        "desc": "20:30–21:20 50分钟坚决掌握波哥全套（讲义+强化+习题集+电路专题），夯实信号大盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_26",
            "label": "南大851终检",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_24",
            "label": "华科824终检",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_09",
            "label": "波哥电路专题终检",
            "moduleId": "bogo9"
          }
        ],
        "targetCount": 40,
        "mode": "green",
        "offlineLabel": "专业课21天特训结营总验收",
        "offlineTarget": 1,
        "special": true,
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_26",
            "label": "南大851终检",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_24",
            "label": "华科824终检",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27
            ],
            "taskType": "full_recheck",
            "moduleId": "other"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_09",
            "label": "波哥电路专题终检",
            "indices": [
              10,
              15
            ],
            "taskType": "full_recheck",
            "moduleId": "bogo9"
          }
        ],
        "date": "2026-11-20",
        "kind": "online",
        "moduleId": "other",
        "moduleIds": [
          "other",
          "bogo9"
        ],
        "offlineItemIds": null,
        "day": 21
      },
      {
        "id": "d21_p_zm",
        "date": "2026-11-20",
        "day": 21,
        "cat": "major",
        "catLabel": "专业课·芝麻大题(60m)",
        "time": "21:20–22:20",
        "title": "📚【芝麻400题】25芝麻南大851模拟卷(六)·大题推导(全卷8题)",
        "desc": "21:20–22:20 考场大题全真手推（按15–20m/题标准），规范书写状态方程与系统函数推导，每日精做4–6道深度大题。",
        "targetCount": 8,
        "mode": "green",
        "kind": "online",
        "moduleId": "zhima400",
        "moduleIds": [
          "zhima400"
        ],
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_06",
            "label": "25芝麻南大851模拟卷(六)·大题推导(全卷8题)",
            "moduleId": "zhima400"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_25_06",
            "label": "25芝麻南大851模拟卷(六)·大题推导(全卷8题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7
            ],
            "taskType": "clear_non_green",
            "moduleId": "zhima400"
          }
        ],
        "offlineItemIds": null
      },
      {
        "id": "d21_night",
        "date": "2026-11-20",
        "day": 21,
        "cat": "night",
        "catLabel": "居家深夜·30讲85m",
        "time": "22:50–00:15",
        "title": "🔥《张宇30讲》深夜基础筑基与刷透：30讲线代与概率核心定理与典型题二刷验收（彻底脱载880/36讲）",
        "desc": "22:50–00:15 深夜85m集中清透《张宇30讲》，吃透核心定理条件与典型例题，夯实坚不可摧的数学基础盘。",
        "targetCount": 35,
        "mode": "green",
        "kind": "online",
        "moduleId": "zy30",
        "moduleIds": [
          "zy30"
        ],
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch19",
            "label": "30讲线代与概率核心定理与典型题二刷验收",
            "moduleId": "zy30"
          }
        ],
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch19",
            "label": "30讲线代与概率核心定理与典型题二刷验收",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              7,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32,
              33,
              34
            ],
            "taskType": "clear_non_green",
            "moduleId": "zy30"
          }
        ],
        "offlineItemIds": null
      }
    ]
  }
];
  // ===== 工具与状态管理引擎 (V4 题号级逐题审计与双轨核验引擎) =====
  var CAMP21_BASELINE_STR = {"ch1": "PPPPPP________________________________________________", "ch2": "__________________________", "ch3": "_____________________", "ch4": "___________________________", "ch5": "________________________", "ch6": "_______________________________", "ch7": "_________", "ch8": "__________________________", "ch9": "______________________________________________", "ch10": "WWWWVVWWWRRPWRPPPFPPVFV", "ch11": "WWWRWWWWWWW______", "ch12": "________", "ch13": "PFFVVVPFFW____________PPP___________", "ch14": "_____________________________", "ch15": "PPWFRWRWFRWRRWPFRFWWWWWPPWWF____________", "ch16": "VWWVWVWWRWRWPFVWVWWWWWWRWPWWWRWRWWRWWPWWP_______________", "ch17": "____________P__________", "ch18": "VVVFWRPFWPVFWWWWVFVPPRWWRWWRWWFWPWFW_____", "ch19": "________________________", "ch20": "PVPFRPPPPPPPPPPFFVPPPPPPPWPVWWPFFPV", "ch21": "__________________________", "ch22": "_________________________", "ch23": "PRWPWPFPVVPWPVPWRWRPWPPPVVPRVFVFWR", "ch24": "PVVFPVPPPPVRPPPPPPF______", "ch25": "__________________________________", "ch26": "FFPVPFWRVPPV________________________", "ch27": "______________________________", "ch28": "__________________________", "ch29": "___________", "ch30": "_____________________________", "ch31": "P____________W_", "ch32": "VFWWWWWWWWWRW", "ch33": "PVWVFRFV", "ch34": "RWRVWVVPW", "ch35": "_________", "ch36": "______________________", "ch37": "_____", "ch38": "FVR_VFVV", "ch39": "P__W_PFW_F____________", "ch40": "_______________", "ch41": "___________________", "ch42": "_______", "ch43": "________________________________", "ch44": "________", "ch45": "__________________P", "ch46": "PPPPPFPPPWWPWWWFWWVWW___RW_________________________V_____", "ch47": "WRWWWFV", "ch48": "___________FPPWFPVVPPVWVWWWWW", "ch49": "_______", "ch50": "WRPW", "ch51": "WPP_PV_WVP___FPFWW__", "ch52": "_________", "ch53": "__________", "ch54": "_______", "ch55": "V___", "ch56": "__________", "ch57": "PVWPVWWW_______", "ch58": "__________", "ch59": "VWWVRRW_____", "ch60": "______", "ch61": "____", "ch62": "_________", "ch63": "__________", "ch64": "___", "ch65": "_____", "ch66": "____________", "ch67": "_______________________", "ch68": "____________", "ch69": "_______________", "ch70": "__________________", "ch71": "________________________", "ch72": "______________________", "ch73": "_____", "ch74": "RRP__P__P_PVFFPPPFVPVVFWP", "ch75": "____________________________________", "ch76": "___________________", "ch77": "___________", "ch78": "_______", "ch79": "________________________", "ch80": "________________________", "ch81": "_____________________", "ch82": "___________________", "ch83": "______________", "ch84": "________________", "ch85": "PPPPPPPPPPPPPPPP", "ch86": "______________________________________", "ch87": "PPFWWWWW___", "ch88": "______________________", "ch89": "________________", "ch90": "_________________________________", "ch91": "_____________________", "ch92": "FPV", "ch93": "RR_RFRPF______F____", "ch94": "____________________________", "ch95": "__________________________", "ch96": "_________", "ch97": "_____", "ch98": "________________________________________", "ch99": "_________________________________________", "ch100": "________________________________________", "ch101": "________________________________________", "ch102": "_______________", "ch103": "_____________________________", "ch104": "___________", "ch105": "PPF________________", "ch106": "_______________", "ch107": "FFPWWWWWWPWRWRFRW", "ch108": "V______________________", "ch109": "______________________", "ch110": "_______", "ch111": "____", "ch112": "W_P_______", "ch113": "________", "ch114": "_______________", "ch115": "___________", "ch116": "_________", "ch117": "_____________________", "ch118": "___________________________", "ch119": "______________", "ch120": "FPFRPPFPW__", "ch121": "______________", "ch122": "_____________________", "ch123": "________", "ch124": "________________________", "ch125": "WRPWWW", "ch126": "WW_W___W_", "ch127": "_______", "ch128": "_______", "ch129": "____________", "ch130": "_____________________", "ch131": "____", "ch132": "____________", "ch133": "______________________________", "ch134": "__________________P______________________", "ch135": "_______________________________________", "ch136": "_______________________________________________________________", "ch137": "_PWR_____R_F____________________VF_________", "ch138": "________________", "ch139": "P___F___________________", "ch140": "____________________", "ch141": "________________________________", "ch142": "______________________________________________________________________", "ch143": "_________________________", "ch144": "__________________________", "ch145": "______________________", "ch146": "_________________________________________", "ch147": "_________________________________________________________", "ch148": "______________________________________", "ch149": "_________________________________________________", "ch150": "_______________________________", "ch151": "VWWVVPWWVPPVVPWP___________", "ch152": "__________________________________", "ch153": "______________________________", "ch154": "____________________________", "ch155": "_____________", "ch156": "_________________", "ch157": "____________________", "ch158": "__________________________________________________________", "ch159": "PPVPPWFWWVPPPFWRWWW_WFFPWFFWRWPFWWWVV_VWWWWVFP_PFV_VVW_WWVPFW______PWW____FP__PPV_WFF_PPWP_WWVFP_VRWFFRRR_RW_W_RRR", "ch160": "PVVPFPWPPWWWWFPWPWR_FFFWWVW___FVVP_W________RRW_PV_W_FRVPRFWFPWWWPPPPWWWWW__V_VWVWRRVPWWRRW_P_WVWW_FR_PWPPWW___________________________", "ch161": "PPVPFPFPRVPPPFWPWVFVP__PR", "ch162": "____________________________________________________________________", "ch163": "WPPPPWWWVWPVWFWPPWWW______________________________________________________________", "ch164": "FVPRVVWVFWVWV_____________________________________________________", "ch165": "FFPWPFFPPFW____________________________________________________________", "ch166": "WVVWWWWPWVRWWWRWWPWWWWWR_____VVPWFRWWWWWVPVWVRRRWP__________________", "ch167": "PFWVRFPFVVFVPVPV__PWPRF_F_R_______", "ch168": "FPPWFPPRWWWPFVFWVVWPVPWWPPPPFVFF__VWWP___________", "ch169": "_______________________________________", "ch170": "________________________________________________", "ch171": "FPPRRWPRRWRRRWW__________PVVFWW_________________________", "ch172": "VPVPW___VPPVPRVW____PWWR_______________________________", "ch173": "PRWPPWPPPFFFPPPPWVWWWWWW", "ch174": "WRWRFRWPWWRVPWVVW_FFPP_FFR_W___V_", "ch175": "PWWWWWVPWWWWWWWWPWWWRWWWPVWWWWVVVWRWPWVW", "ch176": "WFRWWWWWVWWWPWRRWWWRRWWWPWWWWFWVVVFWPRPRVV_____P__", "ch177": "__________", "ch178": "_________________________", "ch179": "________________________", "ch180": "_______", "opt880-ch01": "___________________________________________________________________________", "opt880-ch02": "___________________________________________________________________________________________________________________________", "opt880-ch03": "________________________________________________________________________________________________________________________________________________________________________________", "opt880-ch04": "____________________________", "opt880-ch05": "__________________________________________________________________________", "opt880-ch06": "____________________________________________________________________________________", "opt880-ch07": "_________________________________________________________________________", "opt880-ch08": "________________________________________________________________________________________________", "opt880-ch09": "_____________________________________________________________________________", "opt880-ch10": "_________________________________", "opt880-ch11": "_______________________________________________", "opt880-ch12": "____________________________________________", "opt880-ch13": "____________________________________________________", "opt880-ch14": "__________________________________________________________________________________", "opt880-ch15": "____________________________________________________________________________", "opt880-ch16": "______________________________", "opt880-ch17": "________________________________", "opt880-ch18": "_____________________________________________________", "opt880-ch19": "______________________________________________________________", "opt880-ch20": "_________", "opt880-ch21": "______________________________", "opt880-ch22": "______________________________________________", "opt880-ch23": "______", "ch261": "_______________________________________________________", "ch262": "____________________________________________________________________________________________________", "ch263": "_____________________________________________________________________________________", "ch264": "__________", "ch265": "_________________________________________________________________", "ch266": "____________________________________________________________", "ch267": "____________________________________________________________", "ch268": "_______________________________________________________", "ch269": "_____________________________________________", "ch270": "___________________", "ch271": "_________________________________", "ch272": "____________________________", "ch273": "__________________________________", "ch274": "_______________________________________", "ch275": "_____________________________________", "ch276": "________________________", "ch277": "_________________________________", "ch278": "__________________________________", "ch279": "____________________________________", "ch280": "__________", "ch281": "_______________", "ch282": "___________________", "ch283": "____", "yeyu_gd_01": "______________________________________________________", "yeyu_gd_02": "_______________________________________________", "yeyu_gd_03": "_________________________", "yeyu_gd_04": "____________________________________________________________________________________________________", "yeyu_gd_05": "FFFPVFFPPPFW___________________________________________________", "yeyu_gd_06": "________________PFPPVPVW_P_________________________________", "yeyu_gd_07": "_____________________", "yeyu_gd_08": "___________________", "yeyu_gd_09": "___________", "yeyu_gd_10": "__________________VVFRFWWF", "yeyu_gd_11": "__________", "yeyu_gd_12": "______________________________________________________________", "yeyu_gd_13": "____", "yeyu_gd_14": "____", "yeyu_gd_15": "___", "yeyu_gd_16": "_________", "yeyu_gd_17": "_______", "yeyu_gd_18": "RPWWWPVRPWWPPPPVPPPVWRRWVRWPFWPFW", "yeyu_gd_19": "__________________", "yeyu_gd_20": "_______", "yeyu_gd_21": "__________", "yeyu_gd_22": "__________________________", "yeyu_la_01": "PPPPPPPPPPPPPPPPPPPPWVVWWPPPWWPW", "yeyu_la_02": "_________________________________________", "yeyu_la_03": "PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP", "yeyu_la_05": "__________________", "yeyu_la_06": "___________________", "yeyu_la_07": "P___________________________________________________________", "yeyu_la_08": "PFPPPPPPVPVVFWPPWP______________________________", "yeyu_la_09": "___________________________________________________", "yeyu_la_10": "WWWWWW", "yeyu_la_11": "_", "yeyu_pr_01": "________________________________________________", "yeyu_pr_02": "____________________________", "yeyu_pr_03": "_________________________________", "yeyu_pr_04": "_________________________", "yeyu_pr_05": "_______", "yeyu_pr_06": "_____________________", "yeyu_pr_07": "____________________", "yeyu_pr_08": "_____", "xhy_gs_01": "_________________________________________________________________________________________________________________________________", "xhy_gs_02": "_____________________________________________________________________________________________________", "xhy_gs_03": "VPPRPFVVVPFFWWVPPVWPPPPPPPPVRFRVVWFPRWWVFVFVPVFFPWPWFVRRWPFRVWVFPVVFFWVPFPPPFWWWFFPPPWWRWFWRFPRVVFVVWVWWWWWWW____FR_________________", "xhy_gs_04": "W_PFWWRV___________________________________________________", "xhy_gs_05": "____________________________________________________________________", "xhy_gs_06": "______________________________________________", "xhy_gs_07": "________________________________________________________________________________________", "xhy_gs_08": "______________________________", "xhy_gs_09": "_______________________________________________________________________", "xhy_gs_10": "____________________", "xhy_xd_11": "____F_______________________________", "xhy_xd_12": "________________________________________________________", "xhy_xd_13": "____________________________________________", "xhy_xd_14": "_____________________", "xhy_xd_15": "_____________________________", "xhy_xd_16": "__________________________________________", "xhy_xd_17": "___________________", "xhy_gl_18": "__________________", "xhy_gl_19": "________________________________________", "xhy_gl_20": "_____________________________________________", "xhy_gl_21": "_________________________________________________", "xhy_gl_22": "_____________", "xhy_gl_23": "____________________", "xhy_gl_24": "_____________________", "xhy_gl_25": "______________________", "s1_zt_1987": "_____________________", "s1_zt_1988": "______________________", "s1_zt_1989": "_______________________", "s1_zt_1990": "___________________R___", "s1_zt_1991": "______________________", "s1_zt_1992": "______________________", "s1_zt_1993": "_______________________", "s1_zt_1994": "______________________", "s1_zt_1995": "______________________", "s1_zt_1996": "______________________", "s1_zt_1997": "______________________", "s1_zt_1998": "_______________________", "s1_zt_1999": "_____________________", "s1_zt_2000": "_____________________", "s1_zt_2001": "____________________", "s1_zt_2002": "____________________", "s1_zt_2003": "______________________", "s1_zt_2004": "_______________________", "s1_zt_2005": "_______________________", "s1_zt_2006": "_______________________", "s1_zt_2007": "________________________", "s1_zt_2008": "____________________W__", "s1_zt_2009": "PFFRVVWRVWPRWWWWRWWWWWW", "s1_zt_2010": "PWWPPPPPPPPFFPVVFRWVFFW", "s1_zt_2011": "VPVPPWPPRPPPPPPPFVRVFWW", "s1_zt_2012": "FPWPVWWVFFWPRPRRWWVRRWW", "s1_zt_2013": "PVFVWWPWWVPPPPVWVFWWWWV", "s1_zt_2014": "VWPWPWPWVPPPVWPFWWWFWWW", "s1_zt_2015": "PPPPFWPVPPPWWPPVWPRVWWF", "s1_zt_2016": "PPWPVVPWPFPWPWP_R______", "s1_zt_2017": "PPWPWPPWRPPF___________", "s1_zt_2018": "RVFPPPPWPPVFPWVRRWWVWRR", "s1_zt_2019": "PPVWPWPP_FRRPRV________", "s1_zt_2020": "VWWWRRWWPPW____________", "s1_zt_2021": "FWPFPPFPVWPPWVPWPRWWWR", "s1_zt_2022": "______________________", "s1_zt_2023": "______________________", "s1_zt_2024": "______________________", "s1_zt_2025": "______________________", "s1_zt_2026": "______________________", "bg_jy_01": "__________________________", "bg_jy_02": "__________________________", "bg_jy_03": "_______________________", "bg_jy_04": "P__________________________________", "bg_jy_05": "FFPVFFVPPPFPFFFPPPPVPPPPFVVRWPFWVVPFVVFVFFPPWFFPPFV", "bg_jy_06": "VPVVPFWPPPPPVFFVPPPFFFVVP__", "bg_jy_07": "WWWWWWWW", "bg_jy_08": "RRV", "bg_jy_09": "VRWWRRWWWW", "bg_jy_10": "_________", "bg_xt_01": "________________________________________________________________________________________", "bg_xt_02": "__________________________________________________________________", "bg_xt_03": "____________________________________________", "bg_xt_04": "PFPVPFWWPVFPPPWWWPRFWPPFPFPPPPWPVRFFFPPFPPWWVVVPPRVWWWRVRWR_______________", "bg_xt_05": "FFFPFFFRPPWWWWWWWWWRPWPPFPPWVRWVVWWWWFWVVWPVWWWWWWWWPWWWWWWWWWWWFVFVWWRRWRWWWWWFWWWWWWW", "bg_xt_06": "PWRPVWWWRWWWWWPPRPVVFVRWPVWWWPFVWVVWWWPFWWVVFWVPWWWWWWWWPPRVWRWWWRRRRRFPWW", "bg_xt_07": "WVWWWWWWWWWWRWWWWWWWWWWWWWWWWWWWWWW", "bg_xt_08": "RWRWWWWWWWWWWWWWW____________________R_______", "bg_xt_09": "VWVWWRRWWVFRWRWFWVRVRRVRVWWWWRWRRRRRRRW", "bg_xt_10": "WPW____________________________________", "dlut_852_11": "__________", "dlut_852_13": "___________", "dlut_852_14": "_________", "dlut_852_15": "____________", "dlut_852_16": "_________", "dlut_852_17": "________", "dlut_852_18": "________", "dlut_852_19": "________", "dlut_852_20": "________", "dlut_852_22": "__________________________", "dlut_852_24": "___________________", "nju_851_07": "WPR________", "nju_851_08": "FP_PFP_____", "nju_851_09": "___________", "nju_851_10": "___________", "nju_851_11": "___________", "nju_851_12": "_______", "nju_851_13": "_______", "nju_851_14": "_______", "nju_851_15": "_______", "nju_851_16": "_______", "nju_851_17": "_______", "nju_851_18": "_________", "nju_851_19": "___________", "nju_851_20": "PPPPWVWPWRPPFVFRVRV", "nju_851_21": "WPVRPPVVWPWPWWFRF___", "nju_851_22": "PPFPVVFWWWPPWWPFWWWWWW", "nju_851_23": "PVRRWWRWWWFP__PW__W___", "nju_851_24": "__________", "nju_851_25": "_F_______", "nju_851_26": "__________", "whu_807_10": "________", "whu_807_11": "________", "whu_807_12": "________", "whu_807_13": "__________", "whu_807_14": "__________", "whu_807_15": "__________", "whu_807_16": "__________", "whu_807_17": "__________", "whu_807_18": "__________", "whu_807_20": "__________", "whu_807_21": "______________", "whu_807_22": "__________", "whu_807_23": "____________________", "whu_807_24": "___________", "xmu_847_10": "_____", "xmu_847_11": "_________", "xmu_847_12": "_________", "xmu_847_13": "__________", "xmu_847_14": "_________", "xmu_847_15": "__________", "xmu_847_16": "________", "xmu_847_17": "_________", "xmu_847_18": "_________", "xmu_847_19": "_________", "xmu_847_20": "________", "xmu_847_21": "________", "xmu_847_22": "________", "xmu_847_23": "________", "xmu_847_24": "________", "xmu_847_25": "________", "hust_824_06": "______________", "hust_824_07": "____________________", "hust_824_08": "____________________", "hust_824_09": "__________________________________", "hust_824_10": "_________________________________", "hust_824_11": "_______________________________", "hust_824_12": "___________________________", "hust_824_13": "________________________", "hust_824_14": "________________", "hust_824_15": "__________________", "hust_824_16": "________________________", "hust_824_17": "____________", "hust_824_18": "____________________", "hust_824_19": "_______________________", "hust_824_20": "__________________________", "hust_824_21": "RRWWPPWRWWRRRWWWWWRV________", "hust_824_22": "____________________________", "hust_824_23": "____________________________", "hust_824_24": "____________________________", "bg_qh_01": "PPPPPPPWFPPPRWPPWPPPPFFWVPPPPPPFRFPFWVFFPVRPWPVWWP", "bg_qh_02": "PVVVRVFWRRPPPRPVRRPFPPPPPWRWWWPPPWWRWWWPVFWWRRRRR", "bg_qh_03": "PPPPPPWRVWPWPPP__________________", "bg_qh_04": "PPPVPPW___________P_________________________________________________", "bg_qh_05": "_____________________________________", "bg_qh_06": "_______________________________________________________", "bg_qh_07": "__________________", "bg_qh_08": "______________________", "nju_851_mn_26_01": "_________", "nju_851_mn_26_02": "_________", "nju_851_mn_26_03": "_________", "nju_851_mn_26_04": "_________", "nju_851_mn_26_05": "_________", "nju_851_mn_26_06": "_________", "nju_851_zm_26_01": "___________", "nju_851_zm_26_02": "_________", "nju_851_zm_26_03": "__________", "nju_851_zm_26_04": "_________", "nju_851_zm_26_05": "___________", "nju_851_zm_26_06": "_________", "nju_851_zm_25_01": "______", "nju_851_zm_25_02": "_______", "nju_851_zm_25_03": "__________", "nju_851_zm_25_04": "_________", "nju_851_zm_25_05": "_________", "nju_851_zm_25_06": "________", "moni_ll_01": "______________________", "moni_ll_02": "______________________", "moni_ll_03": "______________________", "moni_ll_04": "______________________", "moni_ll_05": "______________________", "moni_ll_06": "______________________", "moni_zy_01": "RWFWPPWRWWPWVWFVRWWWRW", "moni_zy_02": "FPVWWWWVPWPVRWRVPWWVRW", "moni_zy_03": "______________________", "moni_zy_04": "______________________", "moni_zy_05": "______________________", "moni_zy_06": "______________________", "moni_zy_07": "______________________", "moni_zy_08": "______________________", "xuantian_ll26_01": "________________", "xuantian_ll26_02": "VPP_P_____F__P__", "xuantian_ll26_03": "VPW_____________", "xuantian_ll26_04": "________________", "xuantian_ll26_05": "________________", "xuantian_ll26_06": "________________", "pol_b25728-c100402": "F________", "pol_b25728-c100403": "___________________________________________________________________________________", "pol_b25728-c100404": "___________________________________________________________", "pol_b25728-c100405": "________________________________________________________", "pol_b25728-c100406": "WWWWWWFVWWVVVVWFFFWVWRFVWVRWVWWWRFFVWWFWFWWFWWRWFFFVWWWWWWWWWWVWPVFVVWWWWWWVWWWWWWWVVWFWWWWWW____________________", "pol_b25728-c100407": "____________________________________________", "pol_b25728-c100408": "__________________________", "pol_b25728-c100409": "______", "pol_b25728-c100410": "V___", "pol_b25728-c100411": "__________", "pol_b25728-c100412": "_____________________________________", "pol_b25728-c100413": "_______________________", "pol_b25728-c100414": "_________________", "pol_b25728-c100415": "__", "pol_b25728-c100416": "_____________", "pol_b25728-c100417": "_____", "pol_b25728-c100418": "____", "pol_b25728-c100421": "___________", "pol_b25728-c100422": "__________", "pol_b25728-c100423": "_______", "pol_b25728-c100424": "________", "pol_b25728-c100425": "________", "pol_b25728-c100426": "_________________", "pol_b25728-c100427": "_________________________________", "pol_b25728-c100428": "_________", "pol_b25728-c100429": "________________________", "pol_b25728-c100430": "__________", "pol_b25728-c100431": "__________________", "pol_b25728-c100432": "____________", "pol_b25728-c100433": "________", "pol_b25728-c100439": "__________", "pol_b25728-c100435": "_______", "pol_b25728-c100436": "__________", "pol_b25728-c100437": "_____", "pol_b25728-c100438": "_____________", "pol_b25728-c100440": "______________________", "pol_b25728-c100441": "______________________", "pol_b25728-c100442": "________________________", "pol_b25728-c100443": "_________________________________________", "pol_b25728-c100444": "______________________", "pol_b25728-c100445": "__________________________________________", "pol_b25728-c100446": "_______________________", "pol_b25728-c100447": "____________________________________", "pol_b25728-c100448": "____________", "pol_b25728-c100449": "_______", "pol_b25728-c100450": "_______", "pol_b25728-c100451": "________________", "pol_b25728-c100452": "__________", "pol_b25728-c100453": "_______________", "pol_b25728-c100454": "______________", "pol_b25728-c100455": "_________________________________________", "pol_b25728-c100456": "_______________________________________________________________"};
  var CAMP21_CHAPTER_META = {"ch1": {"t": 54, "s": "s1", "n": "基础30讲 - 高数 - 第1讲 函数极限与连续", "w": "基础30讲"}, "ch2": {"t": 26, "s": "s1", "n": "基础30讲 - 高数 - 第2讲 数列极限", "w": "基础30讲"}, "ch3": {"t": 21, "s": "s1", "n": "基础30讲 - 高数 - 第3讲 一元函数微分学的概念", "w": "基础30讲"}, "ch4": {"t": 27, "s": "s1", "n": "基础30讲 - 高数 - 第4讲 一元函数微分学的计算", "w": "基础30讲"}, "ch5": {"t": 24, "s": "s1", "n": "基础30讲 - 高数 - 第5讲 一元函数微分学的应用（一）", "w": "基础30讲"}, "ch6": {"t": 31, "s": "s1", "n": "基础30讲 - 高数 - 第6讲一元函数微分学的应用（二）", "w": "基础30讲"}, "ch7": {"t": 9, "s": "s1", "n": "基础30讲 - 高数 - 第7讲 一元函数微分学的应用（三）", "w": "基础30讲"}, "ch8": {"t": 26, "s": "s1", "n": "基础30讲 - 高数 - 第8讲 一元函数积分学的概念与性质", "w": "基础30讲"}, "ch9": {"t": 46, "s": "s1", "n": "基础30讲 - 高数 - 第9讲 一元函数积分学的计算", "w": "基础30讲"}, "ch10": {"t": 23, "s": "s1", "n": "基础30讲 - 高数 - 第10讲 一元函数积分学的应用（一）", "w": "基础30讲"}, "ch11": {"t": 17, "s": "s1", "n": "基础30讲 - 高数 - 第11讲 一元函数积分学的应用（二）", "w": "基础30讲"}, "ch12": {"t": 8, "s": "s1", "n": "基础30讲 - 高数 - 第12讲 一元函数积分学的应用（三）", "w": "基础30讲"}, "ch13": {"t": 36, "s": "s1", "n": "基础30讲 - 高数 - 第13讲 多元函数微分学", "w": "基础30讲"}, "ch14": {"t": 29, "s": "s1", "n": "基础30讲 - 高数 - 第14讲 二重积分", "w": "基础30讲"}, "ch15": {"t": 40, "s": "s1", "n": "基础30讲 - 高数 - 第15讲 微分方程", "w": "基础30讲"}, "ch16": {"t": 56, "s": "s1", "n": "基础30讲 - 高数 - 第16讲 无穷级数（仅数一、数三）", "w": "基础30讲"}, "ch17": {"t": 23, "s": "s1", "n": "基础30讲 - 高数 - 第17讲 多元函数积分学的预备知识（仅数一）", "w": "基础30讲"}, "ch18": {"t": 41, "s": "s1", "n": "基础30讲 - 高数 - 第18讲 多元函数积分学（仅数一）", "w": "基础30讲"}, "ch19": {"t": 24, "s": "s1", "n": "基础30讲 - 线代 - 第1讲 行列式", "w": "基础30讲"}, "ch20": {"t": 35, "s": "s1", "n": "基础30讲 - 线代 - 第2讲 矩阵", "w": "基础30讲"}, "ch21": {"t": 26, "s": "s1", "n": "基础30讲 - 线代 - 第3讲 向量组", "w": "基础30讲"}, "ch22": {"t": 25, "s": "s1", "n": "基础30讲 - 线代 - 第4讲 线性方程组", "w": "基础30讲"}, "ch23": {"t": 34, "s": "s1", "n": "基础30讲 - 线代 - 第5讲 特征值与特征向量", "w": "基础30讲"}, "ch24": {"t": 25, "s": "s1", "n": "基础30讲 - 线代 - 第6讲 二次型", "w": "基础30讲"}, "ch25": {"t": 34, "s": "s1", "n": "基础30讲 - 概率论 - 第1讲 随机事件与概率", "w": "基础30讲"}, "ch26": {"t": 36, "s": "s1", "n": "基础30讲 - 概率论 - 第2讲 一维随机变量及其分布", "w": "基础30讲"}, "ch27": {"t": 30, "s": "s1", "n": "基础30讲 - 概率论 - 第3讲 多维随机变量及其分布", "w": "基础30讲"}, "ch28": {"t": 26, "s": "s1", "n": "基础30讲 - 概率论 - 第4讲 随机变量的数字特征", "w": "基础30讲"}, "ch29": {"t": 11, "s": "s1", "n": "基础30讲 - 概率论 - 第5讲 大数定律与中心极限定理", "w": "基础30讲"}, "ch30": {"t": 29, "s": "s1", "n": "基础30讲 - 概率论 - 第6讲 数理统计", "w": "基础30讲"}, "ch31": {"t": 15, "s": "s1", "n": "强化36讲 - 高数 - 第1讲 函数极限与连续", "w": "强化36讲"}, "ch32": {"t": 13, "s": "s1", "n": "强化36讲 - 高数 - 第2讲 数列极限", "w": "强化36讲"}, "ch33": {"t": 8, "s": "s1", "n": "强化36讲 - 高数 - 第3讲 一元函数微分学的概念", "w": "强化36讲"}, "ch34": {"t": 9, "s": "s1", "n": "强化36讲 - 高数 - 第4讲 一元函数微分学的计算", "w": "强化36讲"}, "ch35": {"t": 9, "s": "s1", "n": "强化36讲 - 高数 - 第5讲 一元函数微分学的应用（一）—几何应用", "w": "强化36讲"}, "ch36": {"t": 22, "s": "s1", "n": "强化36讲 - 高数 - 第6讲 一元函数微分学的应用（二）—中值定理等", "w": "强化36讲"}, "ch37": {"t": 5, "s": "s1", "n": "强化36讲 - 高数 - 第7讲 一元函数微分学的应用（三）—物理应用与经济应用", "w": "强化36讲"}, "ch38": {"t": 8, "s": "s1", "n": "强化36讲 - 高数 - 第8讲 一元函数积分学的概念与性质", "w": "强化36讲"}, "ch39": {"t": 22, "s": "s1", "n": "强化36讲 - 高数 - 第9讲 一元函数积分学的概念与性质", "w": "强化36讲"}, "ch40": {"t": 15, "s": "s1", "n": "强化36讲 - 高数 - 第10讲 一元函数积分学的应用（一）—几何应用", "w": "强化36讲"}, "ch41": {"t": 19, "s": "s1", "n": "强化36讲 - 高数 - 第11讲 一元函数积分学的应用（二）—积分等式与积分不等式", "w": "强化36讲"}, "ch42": {"t": 7, "s": "s1", "n": "强化36讲 - 高数 - 第12讲 一元函数积分学的应用（三）—物理应用与经济应用", "w": "强化36讲"}, "ch43": {"t": 32, "s": "s1", "n": "强化36讲 - 高数 - 第13讲 多元函数微分学", "w": "强化36讲"}, "ch44": {"t": 8, "s": "s1", "n": "强化36讲 - 高数 - 第14讲 二重积分", "w": "强化36讲"}, "ch45": {"t": 19, "s": "s1", "n": "强化36讲 - 高数 - 第15讲 微分方程", "w": "强化36讲"}, "ch46": {"t": 57, "s": "s1", "n": "强化36讲 - 高数 - 第16讲 无穷级数（仅数一、三）", "w": "强化36讲"}, "ch47": {"t": 7, "s": "s1", "n": "强化36讲 - 高数 - 第17讲 多元函数积分学的预备知识（仅数一）", "w": "强化36讲"}, "ch48": {"t": 29, "s": "s1", "n": "强化36讲 - 高数 - 第18讲 多元函数积分学（仅数一）", "w": "强化36讲"}, "ch49": {"t": 7, "s": "s1", "n": "强化36讲 - 线代 - 第1讲 行列式", "w": "强化36讲"}, "ch50": {"t": 4, "s": "s1", "n": "强化36讲 - 线代 - 第2讲 余子式和代数余子式的计算", "w": "强化36讲"}, "ch51": {"t": 20, "s": "s1", "n": "强化36讲 - 线代 - 第3讲 矩阵运算", "w": "强化36讲"}, "ch52": {"t": 9, "s": "s1", "n": "强化36讲 - 线代 - 第4讲 矩阵的秩", "w": "强化36讲"}, "ch53": {"t": 10, "s": "s1", "n": "强化36讲 - 线代 - 第5讲 线性方程组", "w": "强化36讲"}, "ch54": {"t": 7, "s": "s1", "n": "强化36讲 - 线代 - 第6讲 向量组", "w": "强化36讲"}, "ch55": {"t": 4, "s": "s1", "n": "强化36讲 - 线代 - 第7讲 特征值与特征向量", "w": "强化36讲"}, "ch56": {"t": 10, "s": "s1", "n": "强化36讲 - 线代 - 第8讲 相似理论", "w": "强化36讲"}, "ch57": {"t": 15, "s": "s1", "n": "强化36讲 - 线代 - 第9讲 二次型", "w": "强化36讲"}, "ch58": {"t": 10, "s": "s1", "n": "强化36讲 - 概率论 - 第1讲 随机事件和概率", "w": "强化36讲"}, "ch59": {"t": 12, "s": "s1", "n": "强化36讲 - 概率论 - 第2讲 一维随机变量及其分布", "w": "强化36讲"}, "ch60": {"t": 6, "s": "s1", "n": "强化36讲 - 概率论 - 第3讲 一维随机变量函数的分布", "w": "强化36讲"}, "ch61": {"t": 4, "s": "s1", "n": "强化36讲 - 概率论 - 第4讲 多维随机变量及其分布", "w": "强化36讲"}, "ch62": {"t": 9, "s": "s1", "n": "强化36讲 - 概率论 - 第5讲 多维随机变量函数的分布", "w": "强化36讲"}, "ch63": {"t": 10, "s": "s1", "n": "强化36讲 - 概率论 - 第6讲 数字特征", "w": "强化36讲"}, "ch64": {"t": 3, "s": "s1", "n": "强化36讲 - 概率论 - 第7讲 大数定律与中心极限定理", "w": "强化36讲"}, "ch65": {"t": 5, "s": "s1", "n": "强化36讲 - 概率论 - 第8讲 统计量及其分布", "w": "强化36讲"}, "ch66": {"t": 12, "s": "s1", "n": "强化36讲 - 概率论 - 第9讲 参数估计与假设检验", "w": "强化36讲"}, "ch67": {"t": 23, "s": "s1", "n": "1000题 - 基础篇-高数 - 第1章 函数极限与连续", "w": "1000题"}, "ch68": {"t": 12, "s": "s1", "n": "1000题 - 基础篇-高数 - 第2讲 数列极限", "w": "1000题"}, "ch69": {"t": 15, "s": "s1", "n": "1000题 - 基础篇-高数 - 第3章 一元函数微分学的概念", "w": "1000题"}, "ch70": {"t": 18, "s": "s1", "n": "1000题 - 基础篇-高数 - 第4章 一元函数微分学的计算", "w": "1000题"}, "ch71": {"t": 24, "s": "s1", "n": "1000题 - 基础篇-高数 - 第5章 一元函数微分学的应用（一）—几何应用", "w": "1000题"}, "ch72": {"t": 22, "s": "s1", "n": "1000题 - 基础篇-高数 - 第6章 一元函数微分学的应用（二）—中值定理与不等式", "w": "1000题"}, "ch73": {"t": 5, "s": "s1", "n": "1000题 - 基础篇-高数 - 第7章 一元函数微分学的应用（三）—物理应用", "w": "1000题"}, "ch74": {"t": 25, "s": "s1", "n": "1000题 - 基础篇-高数 - 第8章 一元函数积分学的概念与性质", "w": "1000题"}, "ch75": {"t": 36, "s": "s1", "n": "1000题 - 基础篇-高数 - 第9章 一元函数积分学的计算", "w": "1000题"}, "ch76": {"t": 19, "s": "s1", "n": "1000题 - 基础篇-高数 - 第10章 一元函数积分的应用（一）—几何应用", "w": "1000题"}, "ch77": {"t": 11, "s": "s1", "n": "1000题 - 基础篇-高数 - 第11章 一元函数积分学的应用（二）—积分等式与积分不等式", "w": "1000题"}, "ch78": {"t": 7, "s": "s1", "n": "1000题 - 基础篇-高数 - 第12章 一元函数积分学的应用（三）—物理应用", "w": "1000题"}, "ch79": {"t": 24, "s": "s1", "n": "1000题 - 基础篇-高数 - 第13章 多元函数微分学", "w": "1000题"}, "ch80": {"t": 24, "s": "s1", "n": "1000题 - 基础篇-高数 - 第14章 二重积分", "w": "1000题"}, "ch81": {"t": 21, "s": "s1", "n": "1000题 - 基础篇-高数 - 第15章 微分方程", "w": "1000题"}, "ch82": {"t": 19, "s": "s1", "n": "1000题 - 基础篇-高数 - 第16章 无穷级数", "w": "1000题"}, "ch83": {"t": 14, "s": "s1", "n": "1000题 - 基础篇-高数 - 第17章 多元函数积分学的预备知识", "w": "1000题"}, "ch84": {"t": 16, "s": "s1", "n": "1000题 - 基础篇-高数 - 第18章 多元函数积分学", "w": "1000题"}, "ch85": {"t": 16, "s": "s1", "n": "1000题 - 基础篇-高数 - 零基础", "w": "1000题"}, "ch86": {"t": 38, "s": "s1", "n": "1000题 - 强化篇-高数 - 第1章 函数极限与连续", "w": "1000题"}, "ch87": {"t": 11, "s": "s1", "n": "1000题 - 强化篇-高数 - 第2章 数列极限", "w": "1000题"}, "ch88": {"t": 22, "s": "s1", "n": "1000题 - 强化篇-高数 - 第3章 一元函数微分学的概念", "w": "1000题"}, "ch89": {"t": 16, "s": "s1", "n": "1000题 - 强化篇-高数 - 第4章 一元函数微分学的计算", "w": "1000题"}, "ch90": {"t": 33, "s": "s1", "n": "1000题 - 强化篇-高数 - 第5章 一元函数微分学的应用—几何应用", "w": "1000题"}, "ch91": {"t": 21, "s": "s1", "n": "1000题 - 强化篇-高数 - 第6章 一元函数为分析的应用—中值定理等", "w": "1000题"}, "ch92": {"t": 3, "s": "s1", "n": "1000题 - 强化篇-高数 - 第7章 一元函数微分学的应用—物理应用", "w": "1000题"}, "ch93": {"t": 19, "s": "s1", "n": "1000题 - 强化篇-高数 - 第8章 一元函数积分学的概念与性质", "w": "1000题"}, "ch94": {"t": 28, "s": "s1", "n": "1000题 - 强化篇-高数 - 第9章 一元函数积分学的计算", "w": "1000题"}, "ch95": {"t": 26, "s": "s1", "n": "1000题 - 强化篇-高数 - 第10章 一元函数积分学的应用—几何应用", "w": "1000题"}, "ch96": {"t": 9, "s": "s1", "n": "1000题 - 强化篇-高数 - 第11章 一元函数积分学的应用—积分等式与积分不等式", "w": "1000题"}, "ch97": {"t": 5, "s": "s1", "n": "1000题 - 强化篇-高数 - 第12章 一元函数积分学的应用—物理应用", "w": "1000题"}, "ch98": {"t": 40, "s": "s1", "n": "1000题 - 强化篇-高数 - 第13章 多元函数微分学", "w": "1000题"}, "ch99": {"t": 41, "s": "s1", "n": "1000题 - 强化篇-高数 - 第14章 二重积分", "w": "1000题"}, "ch100": {"t": 40, "s": "s1", "n": "1000题 - 强化篇-高数 - 第15章 微分方程", "w": "1000题"}, "ch101": {"t": 40, "s": "s1", "n": "1000题 - 强化篇-高数 - 第16章 无穷级数", "w": "1000题"}, "ch102": {"t": 15, "s": "s1", "n": "1000题 - 强化篇-高数 - 第17章 多元函数积分学的预备知识", "w": "1000题"}, "ch103": {"t": 29, "s": "s1", "n": "1000题 - 强化篇-高数 - 第18章 多元函数积分学", "w": "1000题"}, "ch104": {"t": 11, "s": "s1", "n": "1000题 - 基础篇-线代 - 第1章 行列式", "w": "1000题"}, "ch105": {"t": 19, "s": "s1", "n": "1000题 - 基础篇-线代 - 第2章 矩阵", "w": "1000题"}, "ch106": {"t": 15, "s": "s1", "n": "1000题 - 基础篇-线代 - 第3章 向量组", "w": "1000题"}, "ch107": {"t": 17, "s": "s1", "n": "1000题 - 基础篇-线代 - 第4章 线性方程组", "w": "1000题"}, "ch108": {"t": 23, "s": "s1", "n": "1000题 - 基础篇-线代 - 第5章 特征值与特征向量", "w": "1000题"}, "ch109": {"t": 22, "s": "s1", "n": "1000题 - 基础篇-线代 - 第6章 二次型", "w": "1000题"}, "ch110": {"t": 7, "s": "s1", "n": "1000题 - 强化篇-线代 - 第1章 行列式", "w": "1000题"}, "ch111": {"t": 4, "s": "s1", "n": "1000题 - 强化篇-线代 - 第2章 余子式和代数余子式的计算", "w": "1000题"}, "ch112": {"t": 10, "s": "s1", "n": "1000题 - 强化篇-线代 - 第3章 矩阵运算", "w": "1000题"}, "ch113": {"t": 8, "s": "s1", "n": "1000题 - 强化篇-线代 - 第4章 矩阵的秩", "w": "1000题"}, "ch114": {"t": 15, "s": "s1", "n": "1000题 - 强化篇-线代 - 第5章 线性方程组", "w": "1000题"}, "ch115": {"t": 11, "s": "s1", "n": "1000题 - 强化篇-线代 - 第6章 向量组", "w": "1000题"}, "ch116": {"t": 9, "s": "s1", "n": "1000题 - 强化篇-线代 - 第7章 特征值与特征向量", "w": "1000题"}, "ch117": {"t": 21, "s": "s1", "n": "1000题 - 强化篇-线代 - 第8章 相似理论", "w": "1000题"}, "ch118": {"t": 27, "s": "s1", "n": "1000题 - 强化篇-线代 - 第9章 二次型", "w": "1000题"}, "ch119": {"t": 14, "s": "s1", "n": "1000题 - 基础篇-概率论 - 第1章 随机事件与概率", "w": "1000题"}, "ch120": {"t": 11, "s": "s1", "n": "1000题 - 基础篇-概率论 - 第2章 一维随机变量及其分布", "w": "1000题"}, "ch121": {"t": 14, "s": "s1", "n": "1000题 - 基础篇-概率论 - 第3章 多维随机变量的数字特征", "w": "1000题"}, "ch122": {"t": 21, "s": "s1", "n": "1000题 - 基础篇-概率论 - 第4章 随机变量的数字特征", "w": "1000题"}, "ch123": {"t": 8, "s": "s1", "n": "1000题 - 基础篇-概率论 - 第5章 大数定律与中心极限定理", "w": "1000题"}, "ch124": {"t": 24, "s": "s1", "n": "1000题 - 基础篇-概率论 - 第6章 数理统计", "w": "1000题"}, "ch125": {"t": 6, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第1章 随机事件和概率", "w": "1000题"}, "ch126": {"t": 9, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第2章 一维随机变量及其分布", "w": "1000题"}, "ch127": {"t": 7, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第3章 一维随机变量函数的分布", "w": "1000题"}, "ch128": {"t": 7, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第4章 多维随机变量及其分布", "w": "1000题"}, "ch129": {"t": 12, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第5章 多维随机变量函数的分布", "w": "1000题"}, "ch130": {"t": 21, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第6章 数字特征", "w": "1000题"}, "ch131": {"t": 4, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第7章 大数定律与中心极限定理", "w": "1000题"}, "ch132": {"t": 12, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第8章 统计量及其分布", "w": "1000题"}, "ch133": {"t": 30, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第9章 参数估计与假设检验", "w": "1000题"}, "ch134": {"t": 41, "s": "s1", "n": "李范全书 - 高数 - 第1章 极限、连续与求极限的方法", "w": "李范全书"}, "ch135": {"t": 39, "s": "s1", "n": "李范全书 - 高数 - 第2章 一元函数的导数与微分概念及其计算", "w": "李范全书"}, "ch136": {"t": 63, "s": "s1", "n": "李范全书 - 高数 - 第3章 一元函数积分概念、计算及应用", "w": "李范全书"}, "ch137": {"t": 43, "s": "s1", "n": "李范全书 - 高数 - 第4章 微分中值定理及其应用", "w": "李范全书"}, "ch138": {"t": 16, "s": "s1", "n": "李范全书 - 高数 - 第5章 一元函数的泰勒公式及其应用", "w": "李范全书"}, "ch139": {"t": 24, "s": "s1", "n": "李范全书 - 高数 - 第6章 常微分方程", "w": "李范全书"}, "ch140": {"t": 20, "s": "s1", "n": "李范全书 - 高数 - 第7章 向量代数和空间解析几何", "w": "李范全书"}, "ch141": {"t": 32, "s": "s1", "n": "李范全书 - 高数 - 第8章 多元函数微分学", "w": "李范全书"}, "ch142": {"t": 70, "s": "s1", "n": "李范全书 - 高数 - 第9章 多元函数积分的概念、计算及其应用", "w": "李范全书"}, "ch143": {"t": 25, "s": "s1", "n": "李范全书 - 高数 - 第10章 多元函数积分学中的基本公式及其应用", "w": "李范全书"}, "ch144": {"t": 26, "s": "s1", "n": "李范全书 - 高数 - 第11章 无穷级数", "w": "李范全书"}, "ch145": {"t": 22, "s": "s1", "n": "李范全书 - 线代 - 第1章 行列式", "w": "李范全书"}, "ch146": {"t": 41, "s": "s1", "n": "李范全书 - 线代 - 第2章 矩阵", "w": "李范全书"}, "ch147": {"t": 57, "s": "s1", "n": "李范全书 - 线代 - 第3章 向量组的线性关系与秩", "w": "李范全书"}, "ch148": {"t": 38, "s": "s1", "n": "李范全书 - 线代 - 第4章 线性方程组", "w": "李范全书"}, "ch149": {"t": 49, "s": "s1", "n": "李范全书 - 线代 - 第5章 特征向量与特征值，相似，对角化", "w": "李范全书"}, "ch150": {"t": 31, "s": "s1", "n": "李范全书 - 线代 - 第6章 二次型", "w": "李范全书"}, "ch151": {"t": 27, "s": "s1", "n": "李范全书 - 概率论 - 第1章 随机事件和概率", "w": "李范全书"}, "ch152": {"t": 34, "s": "s1", "n": "李范全书 - 概率论 - 第2章 随机变量及其分布", "w": "李范全书"}, "ch153": {"t": 30, "s": "s1", "n": "李范全书 - 概率论 - 第3章 多维随机变量及其分布", "w": "李范全书"}, "ch154": {"t": 28, "s": "s1", "n": "李范全书 - 概率论 - 第4章 随机变量的数字特征", "w": "李范全书"}, "ch155": {"t": 13, "s": "s1", "n": "李范全书 - 概率论 - 第5章 大数定律和中心极限定理", "w": "李范全书"}, "ch156": {"t": 17, "s": "s1", "n": "李范全书 - 概率论 - 第6章 数理统计的基本概念", "w": "李范全书"}, "ch157": {"t": 20, "s": "s1", "n": "李范全书 - 概率论 - 第7章 参数估计和假设检验", "w": "李范全书"}, "ch158": {"t": 58, "s": "s1", "n": "李林880 - 高数 - 第1章 函数、极限、连续", "w": "李林880"}, "ch159": {"t": 114, "s": "s1", "n": "李林880 - 高数 - 第2章 一元函数微分学", "w": "李林880"}, "ch160": {"t": 135, "s": "s1", "n": "李林880 - 高数 - 第3章 一元函数积分学", "w": "李林880"}, "ch161": {"t": 25, "s": "s1", "n": "李林880 - 高数 - 第4章 空间解析几何", "w": "李林880"}, "ch162": {"t": 68, "s": "s1", "n": "李林880 - 高数 - 第5章 多元函数微分学", "w": "李林880"}, "ch163": {"t": 82, "s": "s1", "n": "李林880 - 高数 - 第6章 重积分", "w": "李林880"}, "ch164": {"t": 66, "s": "s1", "n": "李林880 - 高数 - 第7章 微分方程", "w": "李林880"}, "ch165": {"t": 71, "s": "s1", "n": "李林880 - 高数 - 第8章 无穷级数", "w": "李林880"}, "ch166": {"t": 68, "s": "s1", "n": "李林880 - 高数 - 第9章 曲线积分与曲面积分", "w": "李林880"}, "ch167": {"t": 34, "s": "s1", "n": "李林880 - 线代 - 第10章 行列式", "w": "李林880"}, "ch168": {"t": 49, "s": "s1", "n": "李林880 - 线代 - 第11章 矩阵", "w": "李林880"}, "ch169": {"t": 39, "s": "s1", "n": "李林880 - 线代 - 第12章 向量", "w": "李林880"}, "ch170": {"t": 48, "s": "s1", "n": "李林880 - 线代 - 第13章 线性方程组", "w": "李林880"}, "ch171": {"t": 56, "s": "s1", "n": "李林880 - 线代 - 第14章 相似矩阵", "w": "李林880"}, "ch172": {"t": 55, "s": "s1", "n": "李林880 - 线代 - 第15章 二次型", "w": "李林880"}, "ch173": {"t": 24, "s": "s1", "n": "李林880 - 概率论 - 第16章 随机事件及其概率", "w": "李林880"}, "ch174": {"t": 33, "s": "s1", "n": "李林880 - 概率论 - 第17章 随机变量及其分布", "w": "李林880"}, "ch175": {"t": 40, "s": "s1", "n": "李林880 - 概率论 - 第18章 多维随机变量及其分布", "w": "李林880"}, "ch176": {"t": 50, "s": "s1", "n": "李林880 - 概率论 - 第19章 随机变量的数字特征", "w": "李林880"}, "ch177": {"t": 10, "s": "s1", "n": "李林880 - 概率论 - 第20章 大数定律与中心极限定理", "w": "李林880"}, "ch178": {"t": 25, "s": "s1", "n": "李林880 - 概率论 - 第21章 数理统计的基本概念", "w": "李林880"}, "ch179": {"t": 24, "s": "s1", "n": "李林880 - 概率论 - 第22章 参数估计", "w": "李林880"}, "ch180": {"t": 7, "s": "s1", "n": "李林880 - 概率论 - 第23章 假设检验", "w": "李林880"}, "opt880-ch01": {"t": 75, "s": "s1", "n": "李林880优化版 - 高数 - 第1章 函数、极限、连续", "w": "李林880优化版"}, "opt880-ch02": {"t": 123, "s": "s1", "n": "李林880优化版 - 高数 - 第2章 一元函数微分学及其应用", "w": "李林880优化版"}, "opt880-ch03": {"t": 176, "s": "s1", "n": "李林880优化版 - 高数 - 第3章 一元函数积分学及其应用", "w": "李林880优化版"}, "opt880-ch04": {"t": 28, "s": "s1", "n": "李林880优化版 - 高数 - 第4章 空间解析几何", "w": "李林880优化版"}, "opt880-ch05": {"t": 74, "s": "s1", "n": "李林880优化版 - 高数 - 第5章 多元函数微分学及其应用", "w": "李林880优化版"}, "opt880-ch06": {"t": 84, "s": "s1", "n": "李林880优化版 - 高数 - 第6章 重积分及其应用", "w": "李林880优化版"}, "opt880-ch07": {"t": 73, "s": "s1", "n": "李林880优化版 - 高数 - 第7章 微分方程及其应用", "w": "李林880优化版"}, "opt880-ch08": {"t": 96, "s": "s1", "n": "李林880优化版 - 高数 - 第8章 无穷级数", "w": "李林880优化版"}, "opt880-ch09": {"t": 77, "s": "s1", "n": "李林880优化版 - 高数 - 第9章 曲线积分与曲面积分", "w": "李林880优化版"}, "opt880-ch10": {"t": 33, "s": "s1", "n": "李林880优化版 - 线代 - 第10章 行列式", "w": "李林880优化版"}, "opt880-ch11": {"t": 47, "s": "s1", "n": "李林880优化版 - 线代 - 第11章 矩阵", "w": "李林880优化版"}, "opt880-ch12": {"t": 44, "s": "s1", "n": "李林880优化版 - 线代 - 第12章 向量", "w": "李林880优化版"}, "opt880-ch13": {"t": 52, "s": "s1", "n": "李林880优化版 - 线代 - 第13章 线性方程组", "w": "李林880优化版"}, "opt880-ch14": {"t": 82, "s": "s1", "n": "李林880优化版 - 线代 - 第14章 相似矩阵", "w": "李林880优化版"}, "opt880-ch15": {"t": 76, "s": "s1", "n": "李林880优化版 - 线代 - 第15章 二次型", "w": "李林880优化版"}, "opt880-ch16": {"t": 30, "s": "s1", "n": "李林880优化版 - 概率论 - 第16章 随机事件及其概率", "w": "李林880优化版"}, "opt880-ch17": {"t": 32, "s": "s1", "n": "李林880优化版 - 概率论 - 第17章 随机变量及其分布", "w": "李林880优化版"}, "opt880-ch18": {"t": 53, "s": "s1", "n": "李林880优化版 - 概率论 - 第18章 多维随机变量及其分布", "w": "李林880优化版"}, "opt880-ch19": {"t": 62, "s": "s1", "n": "李林880优化版 - 概率论 - 第19章 随机变量的数字特征", "w": "李林880优化版"}, "opt880-ch20": {"t": 9, "s": "s1", "n": "李林880优化版 - 概率论 - 第20章 大数定律与中心极限定理", "w": "李林880优化版"}, "opt880-ch21": {"t": 30, "s": "s1", "n": "李林880优化版 - 概率论 - 第21章 数理统计的基本概念", "w": "李林880优化版"}, "opt880-ch22": {"t": 46, "s": "s1", "n": "李林880优化版 - 概率论 - 第22章 参数估计", "w": "李林880优化版"}, "opt880-ch23": {"t": 6, "s": "s1", "n": "李林880优化版 - 概率论 - 第23章 假设检验", "w": "李林880优化版"}, "ch261": {"t": 55, "s": "s1", "n": "李艳芳900 - 高数 - 第1章 函数、极限、连续", "w": "李艳芳900"}, "ch262": {"t": 100, "s": "s1", "n": "李艳芳900 - 高数 - 第2章 一元函数微分学", "w": "李艳芳900"}, "ch263": {"t": 85, "s": "s1", "n": "李艳芳900 - 高数 - 第3章 一元函数积分学", "w": "李艳芳900"}, "ch264": {"t": 10, "s": "s1", "n": "李艳芳900 - 高数 - 第4章 向量代数与空间解析几何", "w": "李艳芳900"}, "ch265": {"t": 65, "s": "s1", "n": "李艳芳900 - 高数 - 第5章 多元函数微分学", "w": "李艳芳900"}, "ch266": {"t": 60, "s": "s1", "n": "李艳芳900 - 高数 - 第6章 重积分及其应用", "w": "李艳芳900"}, "ch267": {"t": 60, "s": "s1", "n": "李艳芳900 - 高数 - 第7章 常微分方程", "w": "李艳芳900"}, "ch268": {"t": 55, "s": "s1", "n": "李艳芳900 - 高数 - 第8章 无穷级数", "w": "李艳芳900"}, "ch269": {"t": 45, "s": "s1", "n": "李艳芳900 - 高数 - 第9章 曲线积分与曲面积分", "w": "李艳芳900"}, "ch270": {"t": 19, "s": "s1", "n": "李艳芳900 - 线代 - 第10章 行列式", "w": "李艳芳900"}, "ch271": {"t": 33, "s": "s1", "n": "李艳芳900 - 线代 - 第11章 矩阵", "w": "李艳芳900"}, "ch272": {"t": 28, "s": "s1", "n": "李艳芳900 - 线代 - 第12章 向量", "w": "李艳芳900"}, "ch273": {"t": 34, "s": "s1", "n": "李艳芳900 - 线代 - 第13章 线性方程组", "w": "李艳芳900"}, "ch274": {"t": 39, "s": "s1", "n": "李艳芳900 - 线代 - 第14章 矩阵的特征值与特征向量", "w": "李艳芳900"}, "ch275": {"t": 37, "s": "s1", "n": "李艳芳900 - 线代 - 第15章 二次型", "w": "李艳芳900"}, "ch276": {"t": 24, "s": "s1", "n": "李艳芳900 - 概率论 - 第16章 随机事件及其概率", "w": "李艳芳900"}, "ch277": {"t": 33, "s": "s1", "n": "李艳芳900 - 概率论 - 第17章 随机变量及其分布", "w": "李艳芳900"}, "ch278": {"t": 34, "s": "s1", "n": "李艳芳900 - 概率论 - 第18章 多维随机变量及其分布", "w": "李艳芳900"}, "ch279": {"t": 36, "s": "s1", "n": "李艳芳900 - 概率论 - 第19章 随机变量的数字特征", "w": "李艳芳900"}, "ch280": {"t": 10, "s": "s1", "n": "李艳芳900 - 概率论 - 第20章 大数定律与中心极限定理", "w": "李艳芳900"}, "ch281": {"t": 15, "s": "s1", "n": "李艳芳900 - 概率论 - 第21章 数理统计的基本概念", "w": "李艳芳900"}, "ch282": {"t": 19, "s": "s1", "n": "李艳芳900 - 概率论 - 第22章 参数估计", "w": "李艳芳900"}, "ch283": {"t": 4, "s": "s1", "n": "李艳芳900 - 概率论 - 第23章 假设检验", "w": "李艳芳900"}, "yeyu_gd_01": {"t": 54, "s": "s1", "n": "夜雨强化 - 高数 - 第1章 极限", "w": "夜雨强化"}, "yeyu_gd_02": {"t": 47, "s": "s1", "n": "夜雨强化 - 高数 - 第2章 导数与高阶导数", "w": "夜雨强化"}, "yeyu_gd_03": {"t": 25, "s": "s1", "n": "夜雨强化 - 高数 - 第3章 极值点与拐点", "w": "夜雨强化"}, "yeyu_gd_04": {"t": 100, "s": "s1", "n": "夜雨强化 - 高数 - 第4章 微分中值定理与不等式证明", "w": "夜雨强化"}, "yeyu_gd_05": {"t": 63, "s": "s1", "n": "夜雨强化 - 高数 - 第5章 不定积分计算方法", "w": "夜雨强化"}, "yeyu_gd_06": {"t": 59, "s": "s1", "n": "夜雨强化 - 高数 - 第6章 定积分与反常积分", "w": "夜雨强化"}, "yeyu_gd_07": {"t": 21, "s": "s1", "n": "夜雨强化 - 高数 - 第7章 定积分的几何与物理应用", "w": "夜雨强化"}, "yeyu_gd_08": {"t": 19, "s": "s1", "n": "夜雨强化 - 高数 - 第8章 多元函数微分学与极值最值", "w": "夜雨强化"}, "yeyu_gd_09": {"t": 11, "s": "s1", "n": "夜雨强化 - 高数 - 第9章 常微分方程与微分方程综合题", "w": "夜雨强化"}, "yeyu_gd_10": {"t": 26, "s": "s1", "n": "夜雨强化 - 高数 - 第10章 二重积分计算与对称性", "w": "夜雨强化"}, "yeyu_gd_11": {"t": 10, "s": "s1", "n": "夜雨强化 - 高数 - 第11章 三重积分计算与柱面球面坐标", "w": "夜雨强化"}, "yeyu_gd_12": {"t": 62, "s": "s1", "n": "夜雨强化 - 高数 - 第12章 常数项级数与幂级数", "w": "夜雨强化"}, "yeyu_gd_13": {"t": 4, "s": "s1", "n": "夜雨强化 - 高数 - 第13章 傅里叶级数", "w": "夜雨强化"}, "yeyu_gd_14": {"t": 4, "s": "s1", "n": "夜雨强化 - 高数 - 第14章 第一类与第二类曲线积分", "w": "夜雨强化"}, "yeyu_gd_15": {"t": 3, "s": "s1", "n": "夜雨强化 - 高数 - 第15章 第一类与第二类曲面积分及高斯斯托克斯公式", "w": "夜雨强化"}, "yeyu_gd_16": {"t": 9, "s": "s1", "n": "夜雨强化 - 高数 - 第16章 微分不等式与积分不等式综合", "w": "夜雨强化"}, "yeyu_gd_17": {"t": 7, "s": "s1", "n": "夜雨强化 - 高数 - 第17章 空间解析几何", "w": "夜雨强化"}, "yeyu_gd_18": {"t": 33, "s": "s1", "n": "夜雨强化 - 高数 - 第18章 极限概念与选择题特训", "w": "夜雨强化"}, "yeyu_gd_19": {"t": 18, "s": "s1", "n": "夜雨强化 - 高数 - 第19章 导数概念与选择题特训", "w": "夜雨强化"}, "yeyu_gd_20": {"t": 7, "s": "s1", "n": "夜雨强化 - 高数 - 第20章 积分概念与选择题特训", "w": "夜雨强化"}, "yeyu_gd_21": {"t": 10, "s": "s1", "n": "夜雨强化 - 高数 - 第21章 多元微分概念与选择题特训", "w": "夜雨强化"}, "yeyu_gd_22": {"t": 26, "s": "s1", "n": "夜雨强化 - 高数 - 第22章 级数概念与选择题特训", "w": "夜雨强化"}, "yeyu_la_01": {"t": 32, "s": "s1", "n": "夜雨强化 - 线代 - 第1章 行列式的计算与性质", "w": "夜雨强化"}, "yeyu_la_02": {"t": 41, "s": "s1", "n": "夜雨强化 - 线代 - 第2章 向量与线性相关性", "w": "夜雨强化"}, "yeyu_la_03": {"t": 42, "s": "s1", "n": "夜雨强化 - 线代 - 第3章 常见矩阵的性质与运算", "w": "夜雨强化"}, "yeyu_la_05": {"t": 18, "s": "s1", "n": "夜雨强化 - 线代 - 第5章 矩阵 An 次方计算", "w": "夜雨强化"}, "yeyu_la_06": {"t": 19, "s": "s1", "n": "夜雨强化 - 线代 - 第6章 矩阵及分块矩阵的秩", "w": "夜雨强化"}, "yeyu_la_07": {"t": 60, "s": "s1", "n": "夜雨强化 - 线代 - 第7章 线性方程组所有考法", "w": "夜雨强化"}, "yeyu_la_08": {"t": 48, "s": "s1", "n": "夜雨强化 - 线代 - 第8章 相似的所有考法", "w": "夜雨强化"}, "yeyu_la_09": {"t": 51, "s": "s1", "n": "夜雨强化 - 线代 - 第9章 二次型的所有考法", "w": "夜雨强化"}, "yeyu_la_10": {"t": 6, "s": "s1", "n": "夜雨强化 - 线代 - 第10章 专题一：AB=BA 专题（矩阵可交换）", "w": "夜雨强化"}, "yeyu_la_11": {"t": 1, "s": "s1", "n": "夜雨强化 - 线代 - 第11章 专题二：AB=0 专题", "w": "夜雨强化"}, "yeyu_pr_01": {"t": 48, "s": "s1", "n": "夜雨强化 - 概率论 - 第1章 随机事件及其概率", "w": "夜雨强化"}, "yeyu_pr_02": {"t": 28, "s": "s1", "n": "夜雨强化 - 概率论 - 第2章 一维随机变量及其分布", "w": "夜雨强化"}, "yeyu_pr_03": {"t": 33, "s": "s1", "n": "夜雨强化 - 概率论 - 第3章 二维随机变量及其分布", "w": "夜雨强化"}, "yeyu_pr_04": {"t": 25, "s": "s1", "n": "夜雨强化 - 概率论 - 第4章 随机变量的数字特征", "w": "夜雨强化"}, "yeyu_pr_05": {"t": 7, "s": "s1", "n": "夜雨强化 - 概率论 - 第5章 大数定律和中心极限定理", "w": "夜雨强化"}, "yeyu_pr_06": {"t": 21, "s": "s1", "n": "夜雨强化 - 概率论 - 第6章 数理统计的基本概念", "w": "夜雨强化"}, "yeyu_pr_07": {"t": 20, "s": "s1", "n": "夜雨强化 - 概率论 - 第7章 参数估计", "w": "夜雨强化"}, "yeyu_pr_08": {"t": 5, "s": "s1", "n": "夜雨强化 - 概率论 - 第8章 假设检验与置信区间", "w": "夜雨强化"}, "xhy_gs_01": {"t": 129, "s": "s1", "n": "邂逅遗憾 - 高数 - 第1章 极限与函数性质", "w": "邂逅遗憾"}, "xhy_gs_02": {"t": 101, "s": "s1", "n": "邂逅遗憾 - 高数 - 第2章 导数", "w": "邂逅遗憾"}, "xhy_gs_03": {"t": 132, "s": "s1", "n": "邂逅遗憾 - 高数 - 第3章 积分", "w": "邂逅遗憾"}, "xhy_gs_04": {"t": 59, "s": "s1", "n": "邂逅遗憾 - 高数 - 第4章 微分方程", "w": "邂逅遗憾"}, "xhy_gs_05": {"t": 68, "s": "s1", "n": "邂逅遗憾 - 高数 - 第5章 多元微分", "w": "邂逅遗憾"}, "xhy_gs_06": {"t": 46, "s": "s1", "n": "邂逅遗憾 - 高数 - 第6章 二重积分", "w": "邂逅遗憾"}, "xhy_gs_07": {"t": 88, "s": "s1", "n": "邂逅遗憾 - 高数 - 第7章 无穷级数", "w": "邂逅遗憾"}, "xhy_gs_08": {"t": 30, "s": "s1", "n": "邂逅遗憾 - 高数 - 第8章 空间几何", "w": "邂逅遗憾"}, "xhy_gs_09": {"t": 71, "s": "s1", "n": "邂逅遗憾 - 高数 - 第9章 三重积分和线面积分", "w": "邂逅遗憾"}, "xhy_gs_10": {"t": 20, "s": "s1", "n": "邂逅遗憾 - 高数 - 第10章 空间几何线面积分补充", "w": "邂逅遗憾"}, "xhy_xd_11": {"t": 36, "s": "s1", "n": "邂逅遗憾 - 线代 - 第1章 行列式", "w": "邂逅遗憾"}, "xhy_xd_12": {"t": 56, "s": "s1", "n": "邂逅遗憾 - 线代 - 第2章 矩阵", "w": "邂逅遗憾"}, "xhy_xd_13": {"t": 44, "s": "s1", "n": "邂逅遗憾 - 线代 - 第3章 向量", "w": "邂逅遗憾"}, "xhy_xd_14": {"t": 21, "s": "s1", "n": "邂逅遗憾 - 线代 - 第4章 方程组", "w": "邂逅遗憾"}, "xhy_xd_15": {"t": 29, "s": "s1", "n": "邂逅遗憾 - 线代 - 第5章 相似", "w": "邂逅遗憾"}, "xhy_xd_16": {"t": 42, "s": "s1", "n": "邂逅遗憾 - 线代 - 第6章 二次型", "w": "邂逅遗憾"}, "xhy_xd_17": {"t": 19, "s": "s1", "n": "邂逅遗憾 - 线代 - 第7章 数一专项", "w": "邂逅遗憾"}, "xhy_gl_18": {"t": 18, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第1章 随机事件及其概率", "w": "邂逅遗憾"}, "xhy_gl_19": {"t": 40, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第2章 一维随机变量", "w": "邂逅遗憾"}, "xhy_gl_20": {"t": 45, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第3章 二维随机变量", "w": "邂逅遗憾"}, "xhy_gl_21": {"t": 49, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第4章 随机变量的数字特征", "w": "邂逅遗憾"}, "xhy_gl_22": {"t": 13, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第5章 大数定律与中心极限定理", "w": "邂逅遗憾"}, "xhy_gl_23": {"t": 20, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第6章 抽样分布", "w": "邂逅遗憾"}, "xhy_gl_24": {"t": 21, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第7章 参数估计", "w": "邂逅遗憾"}, "xhy_gl_25": {"t": 22, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第8章 区间估计与假设检验", "w": "邂逅遗憾"}, "s1_zt_1987": {"t": 21, "s": "s1", "n": "历年真题 - 1987年真题", "w": "历年真题"}, "s1_zt_1988": {"t": 22, "s": "s1", "n": "历年真题 - 1988年真题", "w": "历年真题"}, "s1_zt_1989": {"t": 23, "s": "s1", "n": "历年真题 - 1989年真题", "w": "历年真题"}, "s1_zt_1990": {"t": 23, "s": "s1", "n": "历年真题 - 1990年真题", "w": "历年真题"}, "s1_zt_1991": {"t": 22, "s": "s1", "n": "历年真题 - 1991年真题", "w": "历年真题"}, "s1_zt_1992": {"t": 22, "s": "s1", "n": "历年真题 - 1992年真题", "w": "历年真题"}, "s1_zt_1993": {"t": 23, "s": "s1", "n": "历年真题 - 1993年真题", "w": "历年真题"}, "s1_zt_1994": {"t": 22, "s": "s1", "n": "历年真题 - 1994年真题", "w": "历年真题"}, "s1_zt_1995": {"t": 22, "s": "s1", "n": "历年真题 - 1995年真题", "w": "历年真题"}, "s1_zt_1996": {"t": 22, "s": "s1", "n": "历年真题 - 1996年真题", "w": "历年真题"}, "s1_zt_1997": {"t": 22, "s": "s1", "n": "历年真题 - 1997年真题", "w": "历年真题"}, "s1_zt_1998": {"t": 23, "s": "s1", "n": "历年真题 - 1998年真题", "w": "历年真题"}, "s1_zt_1999": {"t": 21, "s": "s1", "n": "历年真题 - 1999年真题", "w": "历年真题"}, "s1_zt_2000": {"t": 21, "s": "s1", "n": "历年真题 - 2000年真题", "w": "历年真题"}, "s1_zt_2001": {"t": 20, "s": "s1", "n": "历年真题 - 2001年真题", "w": "历年真题"}, "s1_zt_2002": {"t": 20, "s": "s1", "n": "历年真题 - 2002年真题", "w": "历年真题"}, "s1_zt_2003": {"t": 22, "s": "s1", "n": "历年真题 - 2003年真题", "w": "历年真题"}, "s1_zt_2004": {"t": 23, "s": "s1", "n": "历年真题 - 2004年真题", "w": "历年真题"}, "s1_zt_2005": {"t": 23, "s": "s1", "n": "历年真题 - 2005年真题", "w": "历年真题"}, "s1_zt_2006": {"t": 23, "s": "s1", "n": "历年真题 - 2006年真题", "w": "历年真题"}, "s1_zt_2007": {"t": 24, "s": "s1", "n": "历年真题 - 2007年真题", "w": "历年真题"}, "s1_zt_2008": {"t": 23, "s": "s1", "n": "历年真题 - 2008年真题", "w": "历年真题"}, "s1_zt_2009": {"t": 23, "s": "s1", "n": "历年真题 - 2009年真题", "w": "历年真题"}, "s1_zt_2010": {"t": 23, "s": "s1", "n": "历年真题 - 2010年真题", "w": "历年真题"}, "s1_zt_2011": {"t": 23, "s": "s1", "n": "历年真题 - 2011年真题", "w": "历年真题"}, "s1_zt_2012": {"t": 23, "s": "s1", "n": "历年真题 - 2012年真题", "w": "历年真题"}, "s1_zt_2013": {"t": 23, "s": "s1", "n": "历年真题 - 2013年真题", "w": "历年真题"}, "s1_zt_2014": {"t": 23, "s": "s1", "n": "历年真题 - 2014年真题", "w": "历年真题"}, "s1_zt_2015": {"t": 23, "s": "s1", "n": "历年真题 - 2015年真题", "w": "历年真题"}, "s1_zt_2016": {"t": 23, "s": "s1", "n": "历年真题 - 2016年真题", "w": "历年真题"}, "s1_zt_2017": {"t": 23, "s": "s1", "n": "历年真题 - 2017年真题", "w": "历年真题"}, "s1_zt_2018": {"t": 23, "s": "s1", "n": "历年真题 - 2018年真题", "w": "历年真题"}, "s1_zt_2019": {"t": 23, "s": "s1", "n": "历年真题 - 2019年真题", "w": "历年真题"}, "s1_zt_2020": {"t": 23, "s": "s1", "n": "历年真题 - 2020年真题", "w": "历年真题"}, "s1_zt_2021": {"t": 22, "s": "s1", "n": "历年真题 - 2021年真题", "w": "历年真题"}, "s1_zt_2022": {"t": 22, "s": "s1", "n": "历年真题 - 2022年真题", "w": "历年真题"}, "s1_zt_2023": {"t": 22, "s": "s1", "n": "历年真题 - 2023年真题", "w": "历年真题"}, "s1_zt_2024": {"t": 22, "s": "s1", "n": "历年真题 - 2024年真题", "w": "历年真题"}, "s1_zt_2025": {"t": 22, "s": "s1", "n": "历年真题 - 2025年真题", "w": "历年真题"}, "s1_zt_2026": {"t": 22, "s": "s1", "n": "历年真题 - 2026年真题", "w": "历年真题"}, "bg_jy_01": {"t": 26, "s": "zhuanye", "n": "波哥讲义例题 - 第1章 信号与系统绪论", "w": "波哥讲义例题"}, "bg_jy_02": {"t": 26, "s": "zhuanye", "n": "波哥讲义例题 - 第2章 连续系统时域分析", "w": "波哥讲义例题"}, "bg_jy_03": {"t": 23, "s": "zhuanye", "n": "波哥讲义例题 - 第3章 离散系统时域分析", "w": "波哥讲义例题"}, "bg_jy_04": {"t": 35, "s": "zhuanye", "n": "波哥讲义例题 - 第4章 傅里叶变换理论及频域分析", "w": "波哥讲义例题"}, "bg_jy_05": {"t": 51, "s": "zhuanye", "n": "波哥讲义例题 - 第5章 连续时间系统的复频域分析", "w": "波哥讲义例题"}, "bg_jy_06": {"t": 27, "s": "zhuanye", "n": "波哥讲义例题 - 第6章 离散时间系统的z域分析", "w": "波哥讲义例题"}, "bg_jy_07": {"t": 8, "s": "zhuanye", "n": "波哥讲义例题 - 第7章 离散时间傅氏分析", "w": "波哥讲义例题"}, "bg_jy_08": {"t": 3, "s": "zhuanye", "n": "波哥讲义例题 - 第8章 傅氏变换运用", "w": "波哥讲义例题"}, "bg_jy_09": {"t": 10, "s": "zhuanye", "n": "波哥讲义例题 - 第9章 电路专题", "w": "波哥讲义例题"}, "bg_jy_10": {"t": 9, "s": "zhuanye", "n": "波哥讲义例题 - 第10章 状态变量分析", "w": "波哥讲义例题"}, "bg_xt_01": {"t": 88, "s": "zhuanye", "n": "波哥习题集 - 第1章 信号及其基本运算", "w": "波哥习题集"}, "bg_xt_02": {"t": 66, "s": "zhuanye", "n": "波哥习题集 - 第2章 连续信号的时域分析", "w": "波哥习题集"}, "bg_xt_03": {"t": 44, "s": "zhuanye", "n": "波哥习题集 - 第3章 离散系统时域分析", "w": "波哥习题集"}, "bg_xt_04": {"t": 74, "s": "zhuanye", "n": "波哥习题集 - 第4章 傅里叶变换及频域分析", "w": "波哥习题集"}, "bg_xt_05": {"t": 87, "s": "zhuanye", "n": "波哥习题集 - 第5章 拉普拉斯变换", "w": "波哥习题集"}, "bg_xt_06": {"t": 74, "s": "zhuanye", "n": "波哥习题集 - 第6章 z 变换", "w": "波哥习题集"}, "bg_xt_07": {"t": 35, "s": "zhuanye", "n": "波哥习题集 - 第7章 离散时间傅氏变换", "w": "波哥习题集"}, "bg_xt_08": {"t": 45, "s": "zhuanye", "n": "波哥习题集 - 第8章 傅氏变换的应用", "w": "波哥习题集"}, "bg_xt_09": {"t": 39, "s": "zhuanye", "n": "波哥习题集 - 第9章 电路专题", "w": "波哥习题集"}, "bg_xt_10": {"t": 39, "s": "zhuanye", "n": "波哥习题集 - 第10章 状态变量分析", "w": "波哥习题集"}, "dlut_852_11": {"t": 10, "s": "zhuanye", "n": "大连理工大学852 - 2011年真题", "w": "大连理工大学852"}, "dlut_852_13": {"t": 11, "s": "zhuanye", "n": "大连理工大学852 - 2013年真题", "w": "大连理工大学852"}, "dlut_852_14": {"t": 9, "s": "zhuanye", "n": "大连理工大学852 - 2014年真题", "w": "大连理工大学852"}, "dlut_852_15": {"t": 12, "s": "zhuanye", "n": "大连理工大学852 - 2015年真题", "w": "大连理工大学852"}, "dlut_852_16": {"t": 9, "s": "zhuanye", "n": "大连理工大学852 - 2016年真题", "w": "大连理工大学852"}, "dlut_852_17": {"t": 8, "s": "zhuanye", "n": "大连理工大学852 - 2017年真题", "w": "大连理工大学852"}, "dlut_852_18": {"t": 8, "s": "zhuanye", "n": "大连理工大学852 - 2018年真题", "w": "大连理工大学852"}, "dlut_852_19": {"t": 8, "s": "zhuanye", "n": "大连理工大学852 - 2019年真题", "w": "大连理工大学852"}, "dlut_852_20": {"t": 8, "s": "zhuanye", "n": "大连理工大学852 - 2020年真题", "w": "大连理工大学852"}, "dlut_852_22": {"t": 26, "s": "zhuanye", "n": "大连理工大学852 - 2022年真题", "w": "大连理工大学852"}, "dlut_852_24": {"t": 19, "s": "zhuanye", "n": "大连理工大学852 - 2024年真题", "w": "大连理工大学852"}, "nju_851_07": {"t": 11, "s": "zhuanye", "n": "南京大学851 - 2007年真题", "w": "南京大学851"}, "nju_851_08": {"t": 11, "s": "zhuanye", "n": "南京大学851 - 2008年真题", "w": "南京大学851"}, "nju_851_09": {"t": 11, "s": "zhuanye", "n": "南京大学851 - 2009年真题", "w": "南京大学851"}, "nju_851_10": {"t": 11, "s": "zhuanye", "n": "南京大学851 - 2010年真题", "w": "南京大学851"}, "nju_851_11": {"t": 11, "s": "zhuanye", "n": "南京大学851 - 2011年真题", "w": "南京大学851"}, "nju_851_12": {"t": 7, "s": "zhuanye", "n": "南京大学851 - 2012年真题", "w": "南京大学851"}, "nju_851_13": {"t": 7, "s": "zhuanye", "n": "南京大学851 - 2013年真题", "w": "南京大学851"}, "nju_851_14": {"t": 7, "s": "zhuanye", "n": "南京大学851 - 2014年真题", "w": "南京大学851"}, "nju_851_15": {"t": 7, "s": "zhuanye", "n": "南京大学851 - 2015年真题", "w": "南京大学851"}, "nju_851_16": {"t": 7, "s": "zhuanye", "n": "南京大学851 - 2016年真题", "w": "南京大学851"}, "nju_851_17": {"t": 7, "s": "zhuanye", "n": "南京大学851 - 2017年真题", "w": "南京大学851"}, "nju_851_18": {"t": 9, "s": "zhuanye", "n": "南京大学851 - 2018年真题", "w": "南京大学851"}, "nju_851_19": {"t": 11, "s": "zhuanye", "n": "南京大学851 - 2019年真题", "w": "南京大学851"}, "nju_851_20": {"t": 19, "s": "zhuanye", "n": "南京大学851 - 2020年真题", "w": "南京大学851"}, "nju_851_21": {"t": 20, "s": "zhuanye", "n": "南京大学851 - 2021年真题", "w": "南京大学851"}, "nju_851_22": {"t": 22, "s": "zhuanye", "n": "南京大学851 - 2022年真题", "w": "南京大学851"}, "nju_851_23": {"t": 22, "s": "zhuanye", "n": "南京大学851 - 2023年真题", "w": "南京大学851"}, "nju_851_24": {"t": 10, "s": "zhuanye", "n": "南京大学851 - 2024年真题", "w": "南京大学851"}, "nju_851_25": {"t": 9, "s": "zhuanye", "n": "南京大学851 - 2025年真题", "w": "南京大学851"}, "nju_851_26": {"t": 10, "s": "zhuanye", "n": "南京大学851 - 2026年真题", "w": "南京大学851"}, "whu_807_10": {"t": 8, "s": "zhuanye", "n": "武汉大学807 - 2010年真题", "w": "武汉大学807"}, "whu_807_11": {"t": 8, "s": "zhuanye", "n": "武汉大学807 - 2011年真题", "w": "武汉大学807"}, "whu_807_12": {"t": 8, "s": "zhuanye", "n": "武汉大学807 - 2012年真题", "w": "武汉大学807"}, "whu_807_13": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2013年真题", "w": "武汉大学807"}, "whu_807_14": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2014年真题", "w": "武汉大学807"}, "whu_807_15": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2015年真题", "w": "武汉大学807"}, "whu_807_16": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2016年真题", "w": "武汉大学807"}, "whu_807_17": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2017年真题", "w": "武汉大学807"}, "whu_807_18": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2018年真题", "w": "武汉大学807"}, "whu_807_20": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2020年真题", "w": "武汉大学807"}, "whu_807_21": {"t": 14, "s": "zhuanye", "n": "武汉大学807 - 2021年真题", "w": "武汉大学807"}, "whu_807_22": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2022年真题", "w": "武汉大学807"}, "whu_807_23": {"t": 20, "s": "zhuanye", "n": "武汉大学807 - 2023年真题", "w": "武汉大学807"}, "whu_807_24": {"t": 11, "s": "zhuanye", "n": "武汉大学807 - 2024年真题", "w": "武汉大学807"}, "xmu_847_10": {"t": 5, "s": "zhuanye", "n": "厦门大学847 - 2010年真题", "w": "厦门大学847"}, "xmu_847_11": {"t": 9, "s": "zhuanye", "n": "厦门大学847 - 2011年真题", "w": "厦门大学847"}, "xmu_847_12": {"t": 9, "s": "zhuanye", "n": "厦门大学847 - 2012年真题", "w": "厦门大学847"}, "xmu_847_13": {"t": 10, "s": "zhuanye", "n": "厦门大学847 - 2013年真题", "w": "厦门大学847"}, "xmu_847_14": {"t": 9, "s": "zhuanye", "n": "厦门大学847 - 2014年真题", "w": "厦门大学847"}, "xmu_847_15": {"t": 10, "s": "zhuanye", "n": "厦门大学847 - 2015年真题", "w": "厦门大学847"}, "xmu_847_16": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2016年真题", "w": "厦门大学847"}, "xmu_847_17": {"t": 9, "s": "zhuanye", "n": "厦门大学847 - 2017年真题", "w": "厦门大学847"}, "xmu_847_18": {"t": 9, "s": "zhuanye", "n": "厦门大学847 - 2018年真题", "w": "厦门大学847"}, "xmu_847_19": {"t": 9, "s": "zhuanye", "n": "厦门大学847 - 2019年真题", "w": "厦门大学847"}, "xmu_847_20": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2020年真题", "w": "厦门大学847"}, "xmu_847_21": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2021年真题", "w": "厦门大学847"}, "xmu_847_22": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2022年真题", "w": "厦门大学847"}, "xmu_847_23": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2023年真题", "w": "厦门大学847"}, "xmu_847_24": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2024年真题", "w": "厦门大学847"}, "xmu_847_25": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2025年真题", "w": "厦门大学847"}, "hust_824_06": {"t": 14, "s": "zhuanye", "n": "华中科技大学824 - 2006年真题", "w": "华中科技大学824"}, "hust_824_07": {"t": 20, "s": "zhuanye", "n": "华中科技大学824 - 2007年真题", "w": "华中科技大学824"}, "hust_824_08": {"t": 20, "s": "zhuanye", "n": "华中科技大学824 - 2008年真题", "w": "华中科技大学824"}, "hust_824_09": {"t": 34, "s": "zhuanye", "n": "华中科技大学824 - 2009年真题", "w": "华中科技大学824"}, "hust_824_10": {"t": 33, "s": "zhuanye", "n": "华中科技大学824 - 2010年真题", "w": "华中科技大学824"}, "hust_824_11": {"t": 31, "s": "zhuanye", "n": "华中科技大学824 - 2011年真题", "w": "华中科技大学824"}, "hust_824_12": {"t": 27, "s": "zhuanye", "n": "华中科技大学824 - 2012年真题", "w": "华中科技大学824"}, "hust_824_13": {"t": 24, "s": "zhuanye", "n": "华中科技大学824 - 2013年真题", "w": "华中科技大学824"}, "hust_824_14": {"t": 16, "s": "zhuanye", "n": "华中科技大学824 - 2014年真题", "w": "华中科技大学824"}, "hust_824_15": {"t": 18, "s": "zhuanye", "n": "华中科技大学824 - 2015年真题", "w": "华中科技大学824"}, "hust_824_16": {"t": 24, "s": "zhuanye", "n": "华中科技大学824 - 2016年真题", "w": "华中科技大学824"}, "hust_824_17": {"t": 12, "s": "zhuanye", "n": "华中科技大学824 - 2017年真题", "w": "华中科技大学824"}, "hust_824_18": {"t": 20, "s": "zhuanye", "n": "华中科技大学824 - 2018年真题", "w": "华中科技大学824"}, "hust_824_19": {"t": 23, "s": "zhuanye", "n": "华中科技大学824 - 2019年真题", "w": "华中科技大学824"}, "hust_824_20": {"t": 26, "s": "zhuanye", "n": "华中科技大学824 - 2020年真题", "w": "华中科技大学824"}, "hust_824_21": {"t": 28, "s": "zhuanye", "n": "华中科技大学824 - 2021年真题", "w": "华中科技大学824"}, "hust_824_22": {"t": 28, "s": "zhuanye", "n": "华中科技大学824 - 2022年真题", "w": "华中科技大学824"}, "hust_824_23": {"t": 28, "s": "zhuanye", "n": "华中科技大学824 - 2023年真题", "w": "华中科技大学824"}, "hust_824_24": {"t": 28, "s": "zhuanye", "n": "华中科技大学824 - 2024年真题", "w": "华中科技大学824"}, "bg_qh_01": {"t": 50, "s": "zhuanye", "n": "波哥强化习题集 - 第1章 信号及其基本运算", "w": "波哥强化习题集"}, "bg_qh_02": {"t": 49, "s": "zhuanye", "n": "波哥强化习题集 - 第2章 连续系统的时域分析", "w": "波哥强化习题集"}, "bg_qh_03": {"t": 33, "s": "zhuanye", "n": "波哥强化习题集 - 第3章 离散系统的时域分析", "w": "波哥强化习题集"}, "bg_qh_04": {"t": 68, "s": "zhuanye", "n": "波哥强化习题集 - 第4章 连续时间信号的傅里叶分析", "w": "波哥强化习题集"}, "bg_qh_05": {"t": 37, "s": "zhuanye", "n": "波哥强化习题集 - 第5章 拉普拉斯变换", "w": "波哥强化习题集"}, "bg_qh_06": {"t": 55, "s": "zhuanye", "n": "波哥强化习题集 - 第6章 离散时域复频域分析", "w": "波哥强化习题集"}, "bg_qh_07": {"t": 18, "s": "zhuanye", "n": "波哥强化习题集 - 第7章 电路专题", "w": "波哥强化习题集"}, "bg_qh_08": {"t": 22, "s": "zhuanye", "n": "波哥强化习题集 - 第8章 状态变量分析", "w": "波哥强化习题集"}, "nju_851_mn_26_01": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26刺猬哥终极预测卷（一）", "w": "南京大学851模拟卷"}, "nju_851_mn_26_02": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26刺猬哥终极预测卷（二）", "w": "南京大学851模拟卷"}, "nju_851_mn_26_03": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26刺猬哥终极预测卷（三）", "w": "南京大学851模拟卷"}, "nju_851_mn_26_04": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26刺猬哥终极预测卷（四）", "w": "南京大学851模拟卷"}, "nju_851_mn_26_05": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26刺猬哥终极预测卷（五）", "w": "南京大学851模拟卷"}, "nju_851_mn_26_06": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26刺猬哥终极预测卷（六）", "w": "南京大学851模拟卷"}, "nju_851_zm_26_01": {"t": 11, "s": "zhuanye", "n": "南京大学851模拟卷 - 26芝麻南大851模拟卷（一）", "w": "南京大学851模拟卷"}, "nju_851_zm_26_02": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26芝麻南大851模拟卷（二）", "w": "南京大学851模拟卷"}, "nju_851_zm_26_03": {"t": 10, "s": "zhuanye", "n": "南京大学851模拟卷 - 26芝麻南大851模拟卷（三）", "w": "南京大学851模拟卷"}, "nju_851_zm_26_04": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26芝麻南大851模拟卷（四）", "w": "南京大学851模拟卷"}, "nju_851_zm_26_05": {"t": 11, "s": "zhuanye", "n": "南京大学851模拟卷 - 26芝麻南大851模拟卷（五）", "w": "南京大学851模拟卷"}, "nju_851_zm_26_06": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26芝麻南大851模拟卷（六）", "w": "南京大学851模拟卷"}, "nju_851_zm_25_01": {"t": 6, "s": "zhuanye", "n": "南京大学851模拟卷 - 25芝麻南大851模拟卷（一）", "w": "南京大学851模拟卷"}, "nju_851_zm_25_02": {"t": 7, "s": "zhuanye", "n": "南京大学851模拟卷 - 25芝麻南大851模拟卷（二）", "w": "南京大学851模拟卷"}, "nju_851_zm_25_03": {"t": 10, "s": "zhuanye", "n": "南京大学851模拟卷 - 25芝麻南大851模拟卷（三）", "w": "南京大学851模拟卷"}, "nju_851_zm_25_04": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 25芝麻南大851模拟卷（四）", "w": "南京大学851模拟卷"}, "nju_851_zm_25_05": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 25芝麻南大851模拟卷（五）", "w": "南京大学851模拟卷"}, "nju_851_zm_25_06": {"t": 8, "s": "zhuanye", "n": "南京大学851模拟卷 - 25芝麻南大851模拟卷（六）", "w": "南京大学851模拟卷"}, "moni_ll_01": {"t": 22, "s": "moni", "n": "李林六套卷 - 第1套", "w": "李林六套卷"}, "moni_ll_02": {"t": 22, "s": "moni", "n": "李林六套卷 - 第2套", "w": "李林六套卷"}, "moni_ll_03": {"t": 22, "s": "moni", "n": "李林六套卷 - 第3套", "w": "李林六套卷"}, "moni_ll_04": {"t": 22, "s": "moni", "n": "李林六套卷 - 第4套", "w": "李林六套卷"}, "moni_ll_05": {"t": 22, "s": "moni", "n": "李林六套卷 - 第5套", "w": "李林六套卷"}, "moni_ll_06": {"t": 22, "s": "moni", "n": "李林六套卷 - 第6套", "w": "李林六套卷"}, "moni_zy_01": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第1套", "w": "张宇八套卷"}, "moni_zy_02": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第2套", "w": "张宇八套卷"}, "moni_zy_03": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第3套", "w": "张宇八套卷"}, "moni_zy_04": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第4套", "w": "张宇八套卷"}, "moni_zy_05": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第5套", "w": "张宇八套卷"}, "moni_zy_06": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第6套", "w": "张宇八套卷"}, "moni_zy_07": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第7套", "w": "张宇八套卷"}, "moni_zy_08": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第8套", "w": "张宇八套卷"}, "xuantian_ll26_01": {"t": 16, "s": "xuantian", "n": "26李林六套卷 - 第1套", "w": "26李林六套卷"}, "xuantian_ll26_02": {"t": 16, "s": "xuantian", "n": "26李林六套卷 - 第2套", "w": "26李林六套卷"}, "xuantian_ll26_03": {"t": 16, "s": "xuantian", "n": "26李林六套卷 - 第3套", "w": "26李林六套卷"}, "xuantian_ll26_04": {"t": 16, "s": "xuantian", "n": "26李林六套卷 - 第4套", "w": "26李林六套卷"}, "xuantian_ll26_05": {"t": 16, "s": "xuantian", "n": "26李林六套卷 - 第5套", "w": "26李林六套卷"}, "xuantian_ll26_06": {"t": 16, "s": "xuantian", "n": "26李林六套卷 - 第6套", "w": "26李林六套卷"}, "pol_b25728-c100402": {"t": 9, "s": "pol", "n": "27肖1000 - 马原 - 导论", "w": "27肖1000"}, "pol_b25728-c100403": {"t": 83, "s": "pol", "n": "27肖1000 - 马原 - 第一章世界的物质性及发展规律", "w": "27肖1000"}, "pol_b25728-c100404": {"t": 59, "s": "pol", "n": "27肖1000 - 马原 - 第二章实践与认识及其发展规律", "w": "27肖1000"}, "pol_b25728-c100405": {"t": 56, "s": "pol", "n": "27肖1000 - 马原 - 第三章人类社会及其发展规律", "w": "27肖1000"}, "pol_b25728-c100406": {"t": 113, "s": "pol", "n": "27肖1000 - 马原 - 第四章资本主义的本质及规律", "w": "27肖1000"}, "pol_b25728-c100407": {"t": 44, "s": "pol", "n": "27肖1000 - 马原 - 第五章资本主义的发展及其趋势", "w": "27肖1000"}, "pol_b25728-c100408": {"t": 26, "s": "pol", "n": "27肖1000 - 马原 - 第六章社会主义的发展及其规律", "w": "27肖1000"}, "pol_b25728-c100409": {"t": 6, "s": "pol", "n": "27肖1000 - 马原 - 第七章共产主义崇高理想及其最终实现", "w": "27肖1000"}, "pol_b25728-c100410": {"t": 4, "s": "pol", "n": "27肖1000 - 毛中特 - 导论  马克思主义中国化时代化的历史进程与理论成果", "w": "27肖1000"}, "pol_b25728-c100411": {"t": 10, "s": "pol", "n": "27肖1000 - 毛中特 - 第一章 毛泽东思想及其历史地位", "w": "27肖1000"}, "pol_b25728-c100412": {"t": 37, "s": "pol", "n": "27肖1000 - 毛中特 - 第二章 新民主主义革命理论", "w": "27肖1000"}, "pol_b25728-c100413": {"t": 23, "s": "pol", "n": "27肖1000 - 毛中特 - 第三章 社会主义改造理论", "w": "27肖1000"}, "pol_b25728-c100414": {"t": 17, "s": "pol", "n": "27肖1000 - 毛中特 - 第四章 社会主义建设道路初步探索", "w": "27肖1000"}, "pol_b25728-c100415": {"t": 2, "s": "pol", "n": "27肖1000 - 毛中特 - 第五章 中国特色社会主义理论体系的形成发展", "w": "27肖1000"}, "pol_b25728-c100416": {"t": 13, "s": "pol", "n": "27肖1000 - 毛中特 - 第六章 邓小平理论", "w": "27肖1000"}, "pol_b25728-c100417": {"t": 5, "s": "pol", "n": "27肖1000 - 毛中特 - 第七章 “三个代表”重要思想", "w": "27肖1000"}, "pol_b25728-c100418": {"t": 4, "s": "pol", "n": "27肖1000 - 毛中特 - 第八章 科学发展观", "w": "27肖1000"}, "pol_b25728-c100421": {"t": 11, "s": "pol", "n": "27肖1000 - 新思想 - 导论", "w": "27肖1000"}, "pol_b25728-c100422": {"t": 10, "s": "pol", "n": "27肖1000 - 新思想 - 第一章 新时代坚持和发展中国特色社会主义", "w": "27肖1000"}, "pol_b25728-c100423": {"t": 7, "s": "pol", "n": "27肖1000 - 新思想 - 第二章 以中国式现代化全面推进中华民族伟大复兴", "w": "27肖1000"}, "pol_b25728-c100424": {"t": 8, "s": "pol", "n": "27肖1000 - 新思想 - 第三章 坚持党的全面领导", "w": "27肖1000"}, "pol_b25728-c100425": {"t": 8, "s": "pol", "n": "27肖1000 - 新思想 - 第四章 坚持以人民为中心", "w": "27肖1000"}, "pol_b25728-c100426": {"t": 17, "s": "pol", "n": "27肖1000 - 新思想 - 第五章 全面深化改革开放", "w": "27肖1000"}, "pol_b25728-c100427": {"t": 33, "s": "pol", "n": "27肖1000 - 新思想 - 第六章 推动高质量发展", "w": "27肖1000"}, "pol_b25728-c100428": {"t": 9, "s": "pol", "n": "27肖1000 - 新思想 - 第七章 社会主义现代化建设的教育、科技、人才战略", "w": "27肖1000"}, "pol_b25728-c100429": {"t": 24, "s": "pol", "n": "27肖1000 - 新思想 - 第八章 发展全过程人民民主", "w": "27肖1000"}, "pol_b25728-c100430": {"t": 10, "s": "pol", "n": "27肖1000 - 新思想 - 第九章 全面依法治国(结合第五部分第六章的内容进行复习)", "w": "27肖1000"}, "pol_b25728-c100431": {"t": 18, "s": "pol", "n": "27肖1000 - 新思想 - 第十章 建设社会主义文化强国", "w": "27肖1000"}, "pol_b25728-c100432": {"t": 12, "s": "pol", "n": "27肖1000 - 新思想 - 第十一章 以保障和改善民生为重点加强社会建设", "w": "27肖1000"}, "pol_b25728-c100433": {"t": 8, "s": "pol", "n": "27肖1000 - 新思想 - 第十二章 建设社会主义生态文明", "w": "27肖1000"}, "pol_b25728-c100439": {"t": 10, "s": "pol", "n": "27肖1000 - 新思想 - 第十三章 维护和塑造国家安全", "w": "27肖1000"}, "pol_b25728-c100435": {"t": 7, "s": "pol", "n": "27肖1000 - 新思想 - 第十四章 建设巩固国防和强大人民军队", "w": "27肖1000"}, "pol_b25728-c100436": {"t": 10, "s": "pol", "n": "27肖1000 - 新思想 - 第十五章 坚持“一国两制”和推进祖国完全统一", "w": "27肖1000"}, "pol_b25728-c100437": {"t": 5, "s": "pol", "n": "27肖1000 - 新思想 - 第十六章 中国特色大国外交和推动构建人类命运共同体", "w": "27肖1000"}, "pol_b25728-c100438": {"t": 13, "s": "pol", "n": "27肖1000 - 新思想 - 第十七章 全面从严治党", "w": "27肖1000"}, "pol_b25728-c100440": {"t": 22, "s": "pol", "n": "27肖1000 - 史纲 - 第一章 进入近代后中华民族的磨难与抗争", "w": "27肖1000"}, "pol_b25728-c100441": {"t": 22, "s": "pol", "n": "27肖1000 - 史纲 - 第二章 不同社会力量对国家出路的早期探索", "w": "27肖1000"}, "pol_b25728-c100442": {"t": 24, "s": "pol", "n": "27肖1000 - 史纲 - 第三章 辛亥革命与君主专制制度的终结", "w": "27肖1000"}, "pol_b25728-c100443": {"t": 41, "s": "pol", "n": "27肖1000 - 史纲 - 第四章 中国共产党成立和中国革命新局面", "w": "27肖1000"}, "pol_b25728-c100444": {"t": 22, "s": "pol", "n": "27肖1000 - 史纲 - 第五章 中国革命的新道路", "w": "27肖1000"}, "pol_b25728-c100445": {"t": 42, "s": "pol", "n": "27肖1000 - 史纲 - 第六章 中华民族的抗日战争", "w": "27肖1000"}, "pol_b25728-c100446": {"t": 23, "s": "pol", "n": "27肖1000 - 史纲 - 第七章 为建立新中国而奋斗", "w": "27肖1000"}, "pol_b25728-c100447": {"t": 36, "s": "pol", "n": "27肖1000 - 史纲 - 第八章 中华人民共和国的成立与中国社会主义建设道路的探索", "w": "27肖1000"}, "pol_b25728-c100448": {"t": 12, "s": "pol", "n": "27肖1000 - 史纲 - 第九章 改革开放与中国特色社会主义的开创和发展", "w": "27肖1000"}, "pol_b25728-c100449": {"t": 7, "s": "pol", "n": "27肖1000 - 史纲 - 第十章 中国特色社会主义进入新时代", "w": "27肖1000"}, "pol_b25728-c100450": {"t": 7, "s": "pol", "n": "27肖1000 - 思修 - 绪论 担当复兴大任成就时代新人", "w": "27肖1000"}, "pol_b25728-c100451": {"t": 16, "s": "pol", "n": "27肖1000 - 思修 - 第一章 领悟人生真谛把握人生方向", "w": "27肖1000"}, "pol_b25728-c100452": {"t": 10, "s": "pol", "n": "27肖1000 - 思修 - 第二章 追求远大理想坚定崇高信念", "w": "27肖1000"}, "pol_b25728-c100453": {"t": 15, "s": "pol", "n": "27肖1000 - 思修 - 第三章 继承优良传统弘扬中国精神", "w": "27肖1000"}, "pol_b25728-c100454": {"t": 14, "s": "pol", "n": "27肖1000 - 思修 - 第四章 明确价值要求践行价值准则", "w": "27肖1000"}, "pol_b25728-c100455": {"t": 41, "s": "pol", "n": "27肖1000 - 思修 - 第五章 遵守道德规范锤炼道德品格", "w": "27肖1000"}, "pol_b25728-c100456": {"t": 63, "s": "pol", "n": "27肖1000 - 思修 - 第六章 学习法治思想提升法治素养", "w": "27肖1000"}};
  var V41 = (typeof window !== 'undefined' && window.Camp21ScheduleV41) || null;
  var CAMP21_SCHEDULED_MINUTES = (V41 && V41.SCHEDULED_STUDY) || 845;
  var CAMP21_NET_FOCUS_GOAL = (V41 && V41.NET_FOCUS_GOAL) || 780;
  var BASE_CODE_MAP = { P: 'proficient', F: 'familiar', V: 'vague', R: 'rusty', W: 'wrong', _: 'unmarked' };

  var AuditV4 = (typeof window !== 'undefined' && window.Camp21ProgressAuditV4) ? window.Camp21ProgressAuditV4 : (function () {
    // Pure fallback if camp21-progress-audit-v4.js is not loaded
    var STATUS = new Set(["proficient","familiar","vague","rusty","wrong","unmarked"]);
    function dayString(val) {
      var d = new Date(val);
      if (Number.isNaN(d.getTime())) throw Error("Invalid date");
      if (d.getHours() < 3) d.setDate(d.getDate() - 1);
      return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    }
    function questionKey(sid, cid, idx) {
      if (!sid || !cid || !Number.isInteger(idx) || idx < 0) throw Error("Invalid question identity");
      return String(sid) + ":" + String(cid) + ":" + idx;
    }
    function scopedIds(task) {
      var found = new Set();
      (task.scopedItems || []).forEach(function (slice) {
        if (!slice.subjectId || !slice.chapterId || !Array.isArray(slice.indices)) throw Error("Invalid scopedItems in task " + task.id);
        slice.indices.forEach(function (idx) {
          var q = questionKey(slice.subjectId, slice.chapterId, idx);
          if (found.has(q)) throw Error("Duplicate ID inside task " + task.id + ": " + q);
          found.add(q);
        });
      });
      return Array.from(found);
    }
    function newAudit() {
      return { version: 4, events: [], offlineEvents: [], mockRecords: {}, manualClaims: {}, legacyMigration: { reviewed: false } };
    }
    function safeAudit(source) {
      var s = source && typeof source === "object" ? source : newAudit();
      return {
        version: 4,
        events: Array.isArray(s.events) ? s.events : [],
        offlineEvents: Array.isArray(s.offlineEvents) ? s.offlineEvents : [],
        mockRecords: s.mockRecords || {},
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
    function recordPractice(audit, tasks, payload, opts) {
      opts = opts || {};
      var s = safeAudit(audit);
      if (!payload || !["attempt","review","status"].includes(payload.kind)) throw Error("kind must be attempt, review, or status");
      var qid = questionKey(payload.subjectId, payload.chapterId, Number(payload.idx));
      var task = taskById(tasks, opts.taskId);
      if (!task) throw Error("Unknown taskId. Unassigned events need manual assignment.");
      if (!scopedIds(task).includes(qid)) throw Error("Question is outside task scopedItems");
      var ts = Number(opts.timestamp == null ? Date.now() : opts.timestamp);
      if (!Number.isFinite(ts)) throw Error("Invalid timestamp");
      var studyDay = dayString(ts);
      if (!opts.allowBacklog && task.date && studyDay !== task.date) throw Error("Task does not belong to actual study date " + studyDay);
      if (payload.kind === "review" && !["pass","fail"].includes(payload.outcome)) throw Error("A review requires an explicit pass/fail outcome");
      var status = String(payload.statusAfter || "unmarked");
      if (!STATUS.has(status)) throw Error("Unsupported status");
      var id = eventId(opts, ts);
      if (s.events.some(function (ev) { return ev.id === id; })) return s;
      s.events.push({ id: id, ts: ts, studyDay: studyDay, taskId: task.id, qid: qid, kind: payload.kind, outcome: payload.kind === "review" ? payload.outcome : null, statusAfter: status, source: payload.source || "question-ui" });
      return s;
    }
    function lastReview(events, taskId, qid) {
      return (events || []).filter(function (e) { return e.taskId === taskId && e.qid === qid && e.kind === "review"; }).sort(function (a, b) { return a.ts - b.ts; }).at(-1) || null;
    }
    function evaluateOnline(task, audit, readStatus) {
      var ids = scopedIds(task), s = safeAudit(audit);
      if (!ids.length) return { type: "online", state: "NEEDS_SCOPE", target: 0, attempted: 0, mastered: 0, coveragePct: null, masteryPct: null, isDone: false };
      var attempted = 0, mastered = 0, broadGreen = 0;
      ids.forEach(function (qid) {
        var status = String(readStatus(qid) || "unmarked");
        if (status === "proficient" || status === "familiar") broadGreen++;
        var events = s.events.filter(function (e) { return e.taskId === task.id && e.qid === qid; });
        if (events.some(function (e) { return e.kind === "attempt" || e.kind === "review"; })) attempted++;
        var review = lastReview(events, task.id, qid);
        var downgradedAfterPass = !!(review && events.some(function (e) { return e.ts > review.ts && e.statusAfter !== "proficient"; }));
        if (review && review.outcome === "pass" && status === "proficient" && !downgradedAfterPass) mastered++;
      });
      var n = ids.length;
      return {
        type: "online",
        state: mastered === n ? "MASTERED" : (attempted === n ? "COVERED_NOT_MASTERED" : "IN_PROGRESS"),
        target: n, attempted: attempted, broadGreen: broadGreen, mastered: mastered,
        coveragePct: Math.round(attempted / n * 100), masteryPct: Math.round(mastered / n * 100), isDone: mastered === n
      };
    }
    function recordOffline(audit, task, itemId, action, opts) {
      opts = opts || {};
      var items = task.offlineItemIds;
      if (!Array.isArray(items) || !items.length) throw Error("Offline inventory not supplied");
      if (!items.includes(itemId)) throw Error("Offline item not in task inventory");
      if (!["attempt","pass","fail"].includes(action)) throw Error("Invalid offline action");
      var s = safeAudit(audit), ts = Number(opts.timestamp == null ? Date.now() : opts.timestamp);
      var id = eventId(opts, ts);
      if (s.offlineEvents.some(function (e) { return e.id === id; })) return s;
      s.offlineEvents.push({ id: id, taskId: task.id, itemId: itemId, action: action, ts: ts, studyDay: dayString(ts) });
      return s;
    }
    function evaluateOffline(task, audit) {
      var ids = task.offlineItemIds;
      if (!Array.isArray(ids) || !ids.length) return { type: "offline", state: "NEEDS_INVENTORY", target: null, attempted: 0, mastered: 0, coveragePct: null, masteryPct: null, isDone: false };
      var keys = Array.from(new Set(ids)), s = safeAudit(audit);
      var attempted = 0, mastered = 0;
      keys.forEach(function (qid) {
        var events = s.offlineEvents.filter(function (e) { return e.taskId === task.id && e.itemId === qid; }).sort(function (a, b) { return a.ts - b.ts; });
        if (events.length) attempted++;
        var lastVerdict = events.filter(function (e) { return e.action === "pass" || e.action === "fail"; }).at(-1);
        if (lastVerdict && lastVerdict.action === "pass") mastered++;
      });
      var n = keys.length;
      return { type: "offline", state: mastered === n ? "MASTERED" : "IN_PROGRESS", target: n, attempted: attempted, mastered: mastered, coveragePct: Math.round(100 * attempted / n), masteryPct: Math.round(100 * mastered / n), isDone: mastered === n };
    }
    function recordMock(audit, taskId, record) {
      var s = safeAudit(audit);
      if (!record || !record.paperId) throw Error("A stable paperId is required");
      var started = Number(record.startedAt), submitted = Number(record.submittedAt);
      if (!Number.isFinite(started) || !Number.isFinite(submitted) || submitted < started) throw Error("Invalid mock session timestamps");
      s.mockRecords[taskId] = { paperId: record.paperId, startedAt: started, submittedAt: submitted, gradedAt: record.gradedAt || null, fullPaperSubmitted: record.fullPaperSubmitted === true, durationMinutes: Math.round((submitted - started) / 60000) };
      return s;
    }
    function evaluateMock(task, audit) {
      var r = safeAudit(audit).mockRecords[task.id];
      var complete = !!(r && r.fullPaperSubmitted && r.gradedAt && r.durationMinutes >= 180 && r.paperId);
      return { type: "mock", state: complete ? "SUBMITTED_GRADED" : "NEEDS_MOCK_EVIDENCE", target: 1, attempted: (r && r.fullPaperSubmitted) ? 1 : 0, mastered: complete ? 1 : 0, coveragePct: (r && r.fullPaperSubmitted) ? 100 : 0, masteryPct: complete ? 100 : 0, isDone: complete, mockRecord: r || null };
    }
    function evaluateTask(task, audit, readStatus) {
      if (task.isOptionalOnlineMock || task.kind === "mock") return evaluateMock(task, audit);
      if (task.kind === "offline") return evaluateOffline(task, audit);
      if (Array.isArray(task.scopedItems) && task.scopedItems.length) return evaluateOnline(task, audit, readStatus);
      return { type: "untracked", state: "NEEDS_SCOPE_OR_INVENTORY", target: null, attempted: 0, mastered: 0, coveragePct: null, masteryPct: null, isDone: false };
    }
    function evaluateDay(tasks, audit, readStatus) {
      var results = (tasks || []).map(function (task) { return { taskId: task.id, result: evaluateTask(task, audit, readStatus) }; });
      var total = results.length;
      var completed = results.filter(function (x) { return x.result.isDone; }).length;
      var missing = results.filter(function (x) { return x.result.target == null || x.result.target === 0; }).length;
      var masteryPct = total ? Math.round(results.reduce(function (sum, x) { return sum + (x.result.masteryPct == null ? 0 : x.result.masteryPct); }, 0) / total) : 0;
      var onlineTasks = results.filter(function (x) { return x.result.type === "online"; });
      var onlineTarget = onlineTasks.reduce(function (sum, x) { return sum + (x.result.target || 0); }, 0);
      var onlineMastered = onlineTasks.reduce(function (sum, x) { return sum + (x.result.mastered || 0); }, 0);
      var onlineAttempted = onlineTasks.reduce(function (sum, x) { return sum + (x.result.attempted || 0); }, 0);
      var onlineBroadGreen = onlineTasks.reduce(function (sum, x) { return sum + (x.result.broadGreen || 0); }, 0);
      var onlineMasteryPct = onlineTarget > 0 ? Math.round((onlineMastered / onlineTarget) * 100) : 0;
      var taskPct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { results: results, totalTasks: total, completedTasks: completed, untrackedTasks: missing, masteryPct: masteryPct, taskPct: taskPct, onlineTarget: onlineTarget, onlineMastered: onlineMastered, onlineAttempted: onlineAttempted, onlineBroadGreen: onlineBroadGreen, onlineMasteryPct: onlineMasteryPct, isDone: total > 0 && completed === total && missing === 0 };
    }
    function reconcileQuota(moduleName, dayTasks, audit, readStatus, target, manualClaim) {
      var relevant = (dayTasks || []).filter(function (t) { return t.moduleId === moduleName || (Array.isArray(t.moduleIds) && t.moduleIds.indexOf(moduleName) !== -1); });
      var all = new Set(), attempted = new Set(), mastered = new Set();
      var s = safeAudit(audit);
      relevant.forEach(function (task) {
        (task.scopedItems || []).forEach(function (slice) {
          if (slice.moduleId && slice.moduleId !== moduleName && relevant.length > 1) return;
          (slice.indices || []).forEach(function (idx) {
            var qid = questionKey(slice.subjectId, slice.chapterId, idx);
            all.add(qid);
            var ev = s.events.filter(function (e) { return e.taskId === task.id && e.qid === qid; });
            if (ev.some(function (e) { return e.kind === "attempt" || e.kind === "review"; })) attempted.add(qid);
            var review = lastReview(ev, task.id, qid);
            var changedDown = !!(review && ev.some(function (e) { return e.ts > review.ts && e.statusAfter !== "proficient"; }));
            if (review && review.outcome === "pass" && readStatus(qid) === "proficient" && !changedDown) mastered.add(qid);
          });
        });
      });
      var goal = Math.max(0, Number(target) || 0), mapped = all.size;
      return {
        module: moduleName, target: goal, mapped: mapped,
        coverageVerified: attempted.size, masteryVerified: mastered.size,
        manualClaim: Math.max(0, Number(manualClaim) || 0),
        missingScope: Math.max(0, goal - mapped), backlog: Math.max(0, goal - attempted.size),
        verifiedComplete: goal > 0 && mapped === goal && mastered.size === goal
      };
    }
    return { dayString, questionKey, scopedIds, newAudit, safeAudit, taskById, eventId, recordPractice, lastReview, evaluateOnline, recordOffline, evaluateOffline, recordMock, evaluateMock, evaluateTask, evaluateDay, reconcileQuota };
  })();

  if (typeof window !== 'undefined' && !window.Camp21ProgressAuditV4) {
    window.Camp21ProgressAuditV4 = AuditV4;
  }

  // Flatten all tasks for audit lookups
  var allCampTasks = [];
  CAMP21_DAYS.forEach(function (day) {
    (day.tasks || []).forEach(function (task) {
      task.date = day.date;
      allCampTasks.push(task);
    });
  });

  function getPrefix() {
    try {
      if (typeof window.userStoragePrefix === 'function') {
        var p = window.userStoragePrefix();
        if (typeof p === 'string' && p) return p;
      }
    } catch (e) {}
    return 'user_guest_';
  }

  function stateStorageKey() {
    return getPrefix() + STATE_KEY_SUFFIX;
  }

  function auditStorageKey() {
    return getPrefix() + 'kaoyan_camp21_audit_v4';
  }

  function defaultOfflineMaterials() {
    return {
      circuit: { name: '⚡手头电路专题纸质讲义及全部题目', totalInventoried: 0, done: 0, mastered: 0, note: '' },
      njuFinal: { name: '🎓手头南大历年期末题全部试卷', totalInventoried: 0, done: 0, mastered: 0, note: '' }
    };
  }

  function loadCampState() {
    try {
      var raw = window.localStorage.getItem(stateStorageKey());
      if (!raw) {
        raw = window.localStorage.getItem(getPrefix() + 'kaoyan_camp21_state_v3');
      }
      var parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object') {
        parsed.checked = parsed.checked || {};
        parsed.manualConfirmed = parsed.manualConfirmed || {};
        parsed.recheckVerified = parsed.recheckVerified || {};
        parsed.offline = parsed.offline || {};
        parsed.v3Actual = parsed.v3Actual || {};
        parsed.v3Mastered = parsed.v3Mastered || {};
        parsed.netFocus = parsed.netFocus || {};
        parsed.dayNotes = parsed.dayNotes || {};
        parsed.offlineMaterials = parsed.offlineMaterials || defaultOfflineMaterials();
        return parsed;
      }
    } catch (e) {}
    return {
      selectedDay: null,
      collapsed: false,
      checked: {},
      manualConfirmed: {},
      recheckVerified: {},
      offline: {},
      v3Actual: {},
      v3Mastered: {},
      netFocus: {},
      dayNotes: {},
      offlineMaterials: defaultOfflineMaterials(),
      goalsInitialized: false
    };
  }

  function saveCampState(state) {
    try {
      var json = JSON.stringify(state);
      window.localStorage.setItem(stateStorageKey(), json);
      window.localStorage.setItem(getPrefix() + 'kaoyan_camp21_state_v3', json);
    } catch (e) {}
  }

  function loadAuditV4() {
    try {
      var raw = window.localStorage.getItem(auditStorageKey());
      if (raw) {
        return AuditV4.safeAudit(JSON.parse(raw));
      }
    } catch (e) {
      console.error('V4 审计存储解析异常，请勿覆盖', e);
    }
    return AuditV4.newAudit();
  }

  function saveAuditV4(audit) {
    try {
      window.localStorage.setItem(auditStorageKey(), JSON.stringify(audit));
      return true;
    } catch (e) {
      console.error('V4 保存失败', e);
      return false;
    }
  }

  // 凌晨 00:00–02:59 归属前一学习日（P0-1 / T11）
  function getTodayCampDay(customNow) {
    var now = customNow ? new Date(customNow) : new Date();
    if (now.getHours() < 3) {
      now.setDate(now.getDate() - 1);
    }
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    var todayStr = y + '-' + m + '-' + d;
    for (var i = 0; i < CAMP21_DAYS.length; i++) {
      if (CAMP21_DAYS[i].date === todayStr) return CAMP21_DAYS[i].day;
    }
    if (todayStr < '2026-10-30') return 0;
    if (todayStr > '2026-11-20') return 21;
    return 1;
  }

  function getActiveDayNumber() {
    var st = loadCampState();
    if (typeof st.selectedDay === 'number' && st.selectedDay >= 0 && st.selectedDay <= 21) {
      return st.selectedDay;
    }
    return getTodayCampDay();
  }

  function getDayObj(dayNum) {
    for (var i = 0; i < CAMP21_DAYS.length; i++) {
      if (CAMP21_DAYS[i].day === dayNum) return CAMP21_DAYS[i];
    }
    return CAMP21_DAYS[1] || CAMP21_DAYS[0];
  }

  function ensureCampDailyGoals() {
    var st = loadCampState();
    if (st.goalsInitialized) return;
    try {
      var sKey = getPrefix() + SETTINGS_KEY_SUFFIX;
      var raw = window.localStorage.getItem(sKey);
      var settings = raw ? JSON.parse(raw) : {};
      settings = settings && typeof settings === 'object' ? settings : {};
      settings.dailyGoals = settings.dailyGoals || {};
      var m = Number(settings.dailyGoals.math) || 20;
      var j = Number(settings.dailyGoals.major) || 20;
      var p = Number(settings.dailyGoals.politics) || 20;
      if (m === 20 && j === 20 && p === 20) {
        settings.dailyGoals.math = 100;
        settings.dailyGoals.major = 50;
        settings.dailyGoals.politics = 55;
      }
      if (!settings.examDate) {
        settings.examDate = '2026-12-19';
      }
      window.localStorage.setItem(sKey, JSON.stringify(settings));
      st.goalsInitialized = true;
      saveCampState(st);
      if (window.StudyAnalytics && typeof window.StudyAnalytics.render === 'function') {
        window.StudyAnalytics.render();
      }
    } catch (e) {}
  }

  // 章节元数据字典（内置兜底，保证首页 index 与做题页 study 100% 同步）
  var _chapterMapCache = null;
  function getChapterMeta(subjectId, chapterId) {
    if (CAMP21_CHAPTER_META && CAMP21_CHAPTER_META[chapterId]) {
      var cm = CAMP21_CHAPTER_META[chapterId];
      return { total: cm.t, name: cm.n, suffix: cm.s, wb: cm.w };
    }
    if (!_chapterMapCache && Array.isArray(window.SUBJECTS)) {
      _chapterMapCache = {};
      window.SUBJECTS.forEach(function (sub) {
        if (!sub || !Array.isArray(sub.chapters)) return;
        sub.chapters.forEach(function (ch) {
          if (ch && ch.id) {
            _chapterMapCache[sub.id + ':' + ch.id] = {
              total: Number(ch.ownTotal || ch.total) || 0,
              name: ch.name || ch.short || ch.id,
              suffix: sub.storageSuffix || 's1'
            };
          }
        });
      });
    }
    var key = subjectId + ':' + chapterId;
    if (_chapterMapCache && _chapterMapCache[key]) return _chapterMapCache[key];
    var suffixMap = { shu1: 's1', zhuanye: 'zhuanye', politics: 'pol', english: 'en', math_moni: 'moni', math_xuantian: 'xuantian' };
    return { total: 0, name: chapterId, suffix: suffixMap[subjectId] || 's1' };
  }

  function getChapterStatusMap(subjectId, chapterId) {
    var meta = getChapterMeta(subjectId, chapterId);
    var stKey = getPrefix() + chapterId + '_' + meta.suffix + '_status';
    try {
      return JSON.parse(window.localStorage.getItem(stKey) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function getBaselineStatus(chapterId, idx) {
    var s = CAMP21_BASELINE_STR[chapterId];
    if (!s || idx < 0 || idx >= s.length) return 'unmarked';
    var code = s.charAt(idx) || '_';
    return BASE_CODE_MAP[code] || 'unmarked';
  }

  function getChapterLiveStats(subjectId, chapterId) {
    var meta = getChapterMeta(subjectId, chapterId);
    var obj = getChapterStatusMap(subjectId, chapterId);
    var green = 0, proficient = 0, familiar = 0, yellow = 0, red = 0, done = 0;
    var keys = Object.keys(obj);
    var maxIdx = meta.total;
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var idx = Number(k);
      if (!Number.isFinite(idx) || idx < 0) continue;
      if (meta.total > 0 && idx >= meta.total) continue;
      if (idx + 1 > maxIdx) maxIdx = idx + 1;
      var v = obj[k];
      if (v === 'proficient') { proficient++; green++; done++; }
      else if (v === 'familiar') { familiar++; green++; done++; }
      else if (v === 'vague' || v === 'rusty') { yellow++; done++; }
      else if (v === 'wrong') { red++; done++; }
    }
    var total = meta.total || maxIdx || 0;
    var unmarked = Math.max(0, total - done);
    return {
      total: total, done: done, green: green, proficient: proficient,
      familiar: familiar, yellow: yellow, red: red, unmarked: unmarked, name: meta.name
    };
  }

  function formatQuestionRanges(nums) {
    if (!Array.isArray(nums) || nums.length === 0) return '无';
    var sorted = nums.slice().sort(function (a, b) { return a - b; });
    var ranges = [];
    var rStart = sorted[0], rEnd = sorted[0];
    for (var i = 1; i < sorted.length; i++) {
      if (sorted[i] === rEnd + 1) {
        rEnd = sorted[i];
      } else {
        ranges.push(rStart === rEnd ? ('#' + rStart) : ('#' + rStart + '~#' + rEnd));
        rStart = sorted[i];
        rEnd = sorted[i];
      }
    }
    ranges.push(rStart === rEnd ? ('#' + rStart) : ('#' + rStart + '~#' + rEnd));
    if (ranges.length > 5) {
      return ranges.slice(0, 4).join(', ') + ' 等(' + sorted.length + '题)';
    }
    return ranges.join(', ');
  }

  // 读取单题在题库中当前的 live status
  function readStatusByQuestionKey(qid) {
    var cut = qid.lastIndexOf(':');
    var rest = qid.slice(0, cut);
    var sep = rest.indexOf(':');
    var sid = rest.slice(0, sep);
    var cid = rest.slice(sep + 1);
    var idx = qid.slice(cut + 1);
    return getChapterStatusMap(sid, cid)[idx] || 'unmarked';
  }

  // ===== V4 核心适配器：严格基于 AuditV4 核算单卡真实进度 =====
  function evaluateScopedV4(task, audit) {
    audit = audit || loadAuditV4();
    var core = AuditV4.evaluateTask(task, audit, readStatusByQuestionKey);

    // 统计章节历史存量（仅展示在跳转按钮旁作参考，不混入今日进度分母）
    var invTotal = 0, invDone = 0, invGreen = 0, invProf = 0, invUnmarked = 0;
    (task.chapters || []).forEach(function (c) {
      var st = getChapterLiveStats(c.subjectId, c.chapterId);
      invTotal += st.total;
      invDone += st.done;
      invGreen += st.green;
      invProf += st.proficient;
      invUnmarked += st.unmarked;
    });

    var remainingDetails = [];
    if (core.type === 'online' && Array.isArray(task.scopedItems)) {
      task.scopedItems.forEach(function (slice) {
        var liveMap = getChapterStatusMap(slice.subjectId, slice.chapterId);
        var sliceRemNums = [];
        (slice.indices || []).forEach(function (idx) {
          var qid = AuditV4.questionKey(slice.subjectId, slice.chapterId, idx);
          var st = liveMap[String(idx)] || 'unmarked';
          var evs = (audit.events || []).filter(function (e) {
            return e.taskId === task.id && e.qid === qid;
          });
          var review = AuditV4.lastReview(evs, task.id, qid);
          var downgraded = !!(review && evs.some(function (e) {
            return e.ts > review.ts && e.statusAfter !== 'proficient';
          }));
          var isMastered = review && review.outcome === 'pass' && st === 'proficient' && !downgraded;
          if (!isMastered) {
            sliceRemNums.push(idx + 1);
          }
        });
        if (sliceRemNums.length > 0) {
          remainingDetails.push({
            subjectId: slice.subjectId,
            chapterId: slice.chapterId,
            label: slice.label,
            taskType: slice.taskType,
            count: sliceRemNums.length,
            rangeText: formatQuestionRanges(sliceRemNums),
            remNums: sliceRemNums
          });
        }
      });
    }

    var remainingSummary = remainingDetails.map(function (r) {
      return r.label + ' 剩' + r.count + '题[' + r.rangeText + ']';
    }).join('；');

    var statusBadge = '';
    if (core.type === 'correction') {
      var progStage = (core.paperProgress && core.paperProgress.stage) || core.state;
      var stageBadgeMap = {
        'NOT_SUBMITTED': '⏳ 待全真模考答卷 (180m)',
        'SUBMITTED_WAITING_GRADING': '⏳ 已交卷 · 待核对答案与估分',
        'GRADED_WAITING_CORRECTION': '⏳ 已批改 · 待90m错题独立重算',
        'CORRECTED_WAITING_RECHECK': '📝 订正完成 · 待逐题复检确认',
        'STRICT_MASTERED': '💎 全卷复检通过 · 严格熟练'
      };
      statusBadge = stageBadgeMap[progStage] || ('⏳ 试卷状态: ' + progStage);
    } else if (core.state === 'NEEDS_SCOPE' || core.state === 'NEEDS_INVENTORY') {
      statusBadge = '⚠️ 待映射/待盘点 (不可自动完成)';
    } else if (core.state === 'NEEDS_MOCK_EVIDENCE') {
      statusBadge = '⏳ 待全真3h模考记录 (交卷+批改)';
    } else if (core.isDone) {
      statusBadge = '💎 严格熟练全部通过 (' + (core.mastered || core.target || 0) + '/' + (core.target || 0) + ')';
    } else if (core.state === 'COVERED_NOT_MASTERED') {
      statusBadge = '📘 本轮已覆盖 · 待严格复检 (' + (core.mastered || 0) + '/' + (core.target || 0) + ')';
    } else {
      statusBadge = '⏳ 待清零 ' + (core.target == null ? '?' : Math.max(0, core.target - (core.mastered || 0))) + ' 题';
    }

    return {
      type: core.type,
      state: core.state,
      isScopedOnline: core.type === 'online',
      targetVal: core.target || 0,
      currentVal: core.mastered,
      pct: core.masteryPct || 0,
      coveragePct: core.coveragePct || 0,
      strictProficient: core.mastered,
      broadGreen: core.broadGreen || 0,
      attempted: core.attempted,
      remainingCount: core.target == null ? null : Math.max(0, core.target - core.mastered),
      remainingDetails: remainingDetails,
      remainingSummary: remainingSummary,
      isDone: core.isDone,
      statusBadge: statusBadge,
      masteryTier: core.isDone ? 'strict_proficient' : (core.state === 'COVERED_NOT_MASTERED' ? 'covered_not_mastered' : 'in_progress'),
      invTotal: invTotal,
      invGreen: invGreen,
      invProf: invProf,
      invUnmarked: invUnmarked,
      mockRecord: core.mockRecord || null,
      paperProgress: core.paperProgress || null,
      correctionRecord: core.record || null
    };
  }

  // 每日总进度核算：线上严格熟练率与全天任务达标率双轨并行（P1-6）
  function evaluateDayProgress(dayObj, state, audit) {
    audit = audit || loadAuditV4();
    var tasks = (dayObj && dayObj.tasks) || [];
    var coreDay = AuditV4.evaluateDay(tasks, audit, readStatusByQuestionKey);
    return {
      results: coreDay.results,
      totalTasks: coreDay.totalTasks,
      doneTasks: coreDay.completedTasks,
      completedTasks: coreDay.completedTasks,
      untrackedTasks: coreDay.untrackedTasks,
      pct: coreDay.onlineMasteryPct, // 顶栏与核心百分比默认展示线上题目严格熟练率
      masteryPct: coreDay.masteryPct,
      taskPct: coreDay.taskPct,
      onlineTarget: coreDay.onlineTarget,
      onlineMastered: coreDay.onlineMastered,
      onlineAttempted: coreDay.onlineAttempted,
      onlineBroadGreen: coreDay.onlineBroadGreen,
      onlineMasteryPct: coreDay.onlineMasteryPct,
      isDone: coreDay.isDone
    };
  }

  function getFourCaliberSubjectStats() {
    var groups = {
      math: { label: '数学', total: 0, done: 0, broadGreen: 0, strictProf: 0, familiar: 0, yellow: 0, red: 0, unmarked: 0 },
      major: { label: '专业课', total: 0, done: 0, broadGreen: 0, strictProf: 0, familiar: 0, yellow: 0, red: 0, unmarked: 0 },
      politics: { label: '政治', total: 0, done: 0, broadGreen: 0, strictProf: 0, familiar: 0, yellow: 0, red: 0, unmarked: 0 }
    };
    Object.keys(CAMP21_CHAPTER_META).forEach(function (cid) {
      var m = CAMP21_CHAPTER_META[cid];
      var grp = m.s === 'zhuanye' ? 'major' : (m.s === 'pol' ? 'politics' : (m.s === 's1' ? 'math' : null));
      if (!grp || !groups[grp]) return;
      var sid = grp === 'major' ? 'zhuanye' : (grp === 'politics' ? 'politics' : 'shu1');
      var st = getChapterLiveStats(sid, cid);
      var g = groups[grp];
      g.total += st.total;
      g.done += st.done;
      g.broadGreen += st.green;
      g.strictProf += st.proficient;
      g.familiar += st.familiar;
      g.yellow += st.yellow;
      g.red += st.red;
      g.unmarked += st.unmarked;
    });
    return groups;
  }


  function getDay0PreheatSlots() {
    return [
      { start: '21:15', end: '22:30', dur: '1h15m', scene: '预热局', title: '【数学·预热】《邂逅遗憾》高数第3章积分未标21题攻坚', target: '干掉未标21题', study: true },
      { start: '22:30', end: '23:30', dur: '1h00m', scene: '预热局', title: '【专业课·预热】电路考点盘点', target: '熟悉资料与范围', study: true },
      { start: '23:30', end: '00:15', dur: '45m', scene: '预热局', title: '【数学·点绿】《基础30讲》第1讲点绿与系统测试', target: '熟悉系统操作与打标', study: true }
    ];
  }

  function getV3DayQuota(dayNum) {
    var n = Math.max(1, Math.min(21, Number(dayNum) || 1));
    return V3_FULL_DATA.days[n - 1] || V3_FULL_DATA.days[0];
  }

  function getDayNetFocus(state, dayNum) {
    var f = (state.netFocus && state.netFocus[String(dayNum)]) || {};
    var math = Math.max(0, Math.floor(Number(f.math) || 0));
    var major = Math.max(0, Math.floor(Number(f.major) || 0));
    var politics = Math.max(0, Math.floor(Number(f.politics) || 0));
    var english = Math.max(0, Math.floor(Number(f.english) || 0));
    var sum = math + major + politics + english;
    return {
      math: math, major: major, politics: politics, english: english,
      sum: sum, goal: CAMP21_NET_FOCUS_GOAL, schedule: CAMP21_SCHEDULED_MINUTES,
      pct: Math.min(100, Math.round((sum / 780) * 100)),
      reached: sum >= 780
    };
  }

  // V3 配额对账：严格区分“题库已验证”与“手工申报”（P0-4 / T08）
  function getV3QuotaStatsForDay(state, audit, dayNum) {
    state = state || loadCampState();
    audit = audit || loadAuditV4();
    var q = getV3DayQuota(dayNum);
    var dayObj = getDayObj(dayNum);
    var items = [];
    var totalTarget = 0, totalVerifiedMastered = 0, totalVerifiedCoverage = 0, totalManualClaim = 0;

    V3_QUOTA_MODULES.forEach(function (mod) {
      var target = Number(q[mod.key]) || 0;
      if (dayNum === 0) target = 0;
      var recKey = 'd' + dayNum + '_' + mod.id;
      var manualClaim = Math.max(0, Math.floor(Number(state.v3Actual && state.v3Actual[recKey]) || 0));
      var manualMastered = Math.min(manualClaim, Math.max(0, Math.floor(Number(state.v3Mastered && state.v3Mastered[recKey]) || 0)));

      var reconciled = AuditV4.reconcileQuota(
        mod.id,
        dayObj.tasks,
        audit,
        readStatusByQuestionKey,
        target,
        manualClaim
      );

      totalTarget += target;
      totalVerifiedCoverage += reconciled.coverageVerified;
      totalVerifiedMastered += reconciled.masteryVerified;
      totalManualClaim += manualClaim;

      items.push({
        mod: mod,
        recKey: recKey,
        target: target,
        mapped: reconciled.mapped,
        coverageVerified: reconciled.coverageVerified,
        masteryVerified: reconciled.masteryVerified,
        missingScope: reconciled.missingScope,
        manualClaim: manualClaim,
        manualMastered: manualMastered,
        backlog: reconciled.backlog,
        verifiedComplete: reconciled.verifiedComplete
      });
    });

    var verifiedPct = totalTarget > 0 ? Math.min(100, Math.round((totalVerifiedMastered / totalTarget) * 100)) : 0;
    return {
      items: items,
      totalTarget: totalTarget,
      totalVerifiedCoverage: totalVerifiedCoverage,
      totalVerifiedMastered: totalVerifiedMastered,
      totalManualClaim: totalManualClaim,
      verifiedPct: verifiedPct
    };
  }

  // 记录真实逐题练习/复检事件（P0-1 / P0-2 / T03 / T06）
  function saveRealQuestionPractice(taskId, subjectId, chapterId, idx, kind, outcome, explicitBacklog) {
    var task = AuditV4.taskById(allCampTasks, taskId);
    if (!task) return false;

    var currentStatus = getChapterStatusMap(subjectId, chapterId)[String(idx)] || 'unmarked';
    var nextStatus = currentStatus;
    if (kind === 'review') {
      if (outcome === 'pass') {
        nextStatus = 'proficient';
      } else if (outcome === 'fail') {
        nextStatus = 'wrong';
      }
    }

    var audit = loadAuditV4();
    var nextAudit = AuditV4.recordPractice(audit, allCampTasks, {
      kind: kind,
      outcome: outcome || null,
      subjectId: subjectId,
      chapterId: chapterId,
      idx: Number(idx),
      statusAfter: nextStatus,
      source: 'camp-v4-practice'
    }, {
      taskId: taskId,
      timestamp: Date.now(),
      allowBacklog: explicitBacklog === true || (task.date && AuditV4.dayString(Date.now()) !== task.date)
    });

    // 同步更新题库实时状态表
    if (nextStatus !== currentStatus) {
      var meta = getChapterMeta(subjectId, chapterId);
      var stKey = getPrefix() + chapterId + '_' + meta.suffix + '_status';
      try {
        var stObj = JSON.parse(window.localStorage.getItem(stKey) || '{}');
        stObj[String(idx)] = nextStatus;
        window.localStorage.setItem(stKey, JSON.stringify(stObj));
      } catch (e) {}
    }

    saveAuditV4(nextAudit);
    renderAll();
    return true;
  }

  // ===== 提示条 & 弹窗与交互实现 =====
  var _toastTimer = null;
  function showCampToast(msg) {
    var el = document.getElementById('camp21GuardToast');
    if (!el && typeof document !== 'undefined' && document.body) {
      el = document.createElement('div');
      el.id = 'camp21GuardToast';
      el.className = 'camp21-guard-toast';
      document.body.appendChild(el);
    }
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(function () {
      el.classList.remove('is-visible');
    }, 4200);
  }

  // 双轨顶部圆环与特训按钮（P1-6）
  function enhanceHeaderDailyGoalButton(dayObj, dayProg) {
    var btn = document.getElementById('dailyGoalButton');
    if (!btn) return;

    var titleEl = btn.querySelector('.daily-goal-title');
    if (titleEl) {
      titleEl.innerHTML = '今日目标 <span class="daily-goal-camp-badge" id="camp21HeaderBadge">🔥 D' + dayObj.day + '</span>';
    }

    var campItem = document.getElementById('dailyGoalCampItem');
    if (!campItem) {
      campItem = document.createElement('span');
      campItem.className = 'daily-goal-item camp21-goal-item';
      campItem.id = 'dailyGoalCampItem';
      campItem.innerHTML =
        '<span class="daily-goal-ring" id="dailyGoalCampRing" data-short="训" aria-hidden="true">' +
          '<span id="dailyGoalCampPct">0%</span>' +
        '</span>' +
        '<span class="daily-goal-copy">' +
          '<strong>3周特训</strong>' +
          '<span id="dailyGoalCampText">0/0题</span>' +
        '</span>';
      btn.insertBefore(campItem, btn.querySelector('.daily-goal-item'));
    }

    var ring = document.getElementById('dailyGoalCampRing');
    var pctEl = document.getElementById('dailyGoalCampPct');
    var txtEl = document.getElementById('dailyGoalCampText');
    var isComplete = dayProg.isDone;

    campItem.classList.toggle('is-complete', isComplete);
    if (ring) ring.style.setProperty('--goal-progress', dayProg.onlineMasteryPct + '%');
    if (pctEl) pctEl.textContent = dayProg.onlineMasteryPct + '%';
    if (txtEl) {
      txtEl.textContent = dayProg.onlineTarget > 0
        ? ('💎' + dayProg.onlineMastered + '/' + dayProg.onlineTarget + '题 (' + dayProg.doneTasks + '/' + dayProg.totalTasks + '项)')
        : (dayProg.doneTasks + '/' + dayProg.totalTasks + '项');
    }

    if (campItem && !campItem._camp21Bound) {
      campItem._camp21Bound = true;
      campItem.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        openCampModal('today');
      });
    }

    var standaloneBtn = document.getElementById('camp21StandaloneBtn');
    if (!standaloneBtn && btn.parentNode) {
      standaloneBtn = document.createElement('button');
      standaloneBtn.type = 'button';
      standaloneBtn.id = 'camp21StandaloneBtn';
      standaloneBtn.className = 'camp21-btn primary';
      standaloneBtn.style.cssText = 'margin-left:6px;padding:6px 12px;border-radius:999px;font-size:12px;font-weight:800;white-space:nowrap;';
      standaloneBtn.addEventListener('click', function () {
        openCampModal('today');
      });
      btn.insertAdjacentElement('afterend', standaloneBtn);
    }
    if (standaloneBtn) {
      standaloneBtn.innerHTML = '🔥 D' + dayObj.day + ' · 特训指挥舱 (💎' + dayProg.onlineMasteryPct + '% · 任务' + dayProg.doneTasks + '/' + dayProg.totalTasks + ')';
    }
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function jumpToChapter(subjectId, chapterId) {
    var modal = document.getElementById('camp21ModalBackdrop');
    if (modal) modal.hidden = true;
    if (typeof window.openWeakChapter === 'function' && subjectId !== 'english') {
      window.openWeakChapter(subjectId, chapterId);
      return;
    }
    if (subjectId === 'english' && typeof window.switchSubject === 'function') {
      window.switchSubject('english');
      if (typeof window.switchChapter === 'function') {
        window.switchChapter(chapterId);
      }
      return;
    }
    window.location.href = 'study.html?subject=' + encodeURIComponent(subjectId) + '&chapter=' + encodeURIComponent(chapterId);
  }

  // ===== 渲染单个任务卡片 HTML =====
  function buildTaskCardHtml(task, state, audit) {
    var ev = evaluateScopedV4(task, audit);
    var cardCls = 'camp21-task-card' + (ev.isDone ? ' is-done' : '') + (task.special ? ' is-highlight-special' : '') + (' tier-' + ev.masteryTier);
    var chapters = Array.isArray(task.chapters) ? task.chapters : [];

    var statsHtml = '';
    var actionButtonsHtml = '';

    if (ev.type === 'online') {
      var primaryMetricLabel = '🎯 本卡绑定 ' + ev.targetVal + ' 题 · 💎严格熟练 ' + ev.strictProficient + '/' + ev.targetVal + ' 题 (' + ev.pct + '%)';
      var remHtml = '';

      if (ev.remainingDetails.length > 0) {
        var remItems = ev.remainingDetails.map(function (r) {
          return '<div class="camp21-rem-item">📍 <strong>' + escapeHtml(r.label) + '</strong> 待清零 <strong>' + r.count + '</strong> 题：<code class="camp21-rem-codes">' + escapeHtml(r.rangeText) + '</code></div>';
        }).join('');
        remHtml = '<div class="camp21-rem-box">' + remItems + '</div>';
      } else {
        remHtml = '<div class="camp21-rem-box is-all-proficient">💎 本卡 ' + ev.targetVal + ' 道绑定题已全部通过本轮严格熟练复检！</div>';
      }

      statsHtml =
        '<div class="camp21-task-prog-section">' +
          '<div class="camp21-task-stats-row">' +
            '<span><strong>' + primaryMetricLabel + '</strong></span>' +
            '<span class="camp21-stat-pills">' +
              '<span class="st-attempted" title="本轮已独立作答/覆盖题数">✍️已做 ' + ev.attempted + '/' + ev.targetVal + '</span>' +
              '<span class="st-green" title="题库广义绿标数 (熟练+熟悉)">🟢广义绿 ' + ev.broadGreen + '/' + ev.targetVal + '</span>' +
              '<span class="st-prof" title="通过本轮逐题复检严格熟练数">💎严格熟练 ' + ev.strictProficient + '/' + ev.targetVal + '</span>' +
              '<span class="st-rem" title="待清零题数">⏳待清零 ' + ev.remainingCount + '</span>' +
            '</span>' +
          '</div>' +
          '<div class="camp21-mini-track"><div class="camp21-mini-fill" style="width:' + ev.pct + '%"></div></div>' +
          remHtml +
        '</div>';

      actionButtonsHtml = '<button type="button" class="camp21-recheck-btn primary-action" data-action="open-practice-modal" data-task="' + escapeHtml(task.id) + '">📝 逐题练习/复检核验</button>';
    } else if (ev.type === 'correction') {
      var prog = ev.paperProgress || {};
      var stageDescMap = {
        'NOT_SUBMITTED': '⏳ 尚未交卷 (请在08:30–11:30完成180m独立模拟作答并交卷)',
        'SUBMITTED_WAITING_GRADING': '⏳ 已交卷 · 待核对答案并录入错题',
        'GRADED_WAITING_CORRECTION': '⏳ 已批改 · 待在11:30–12:30 & 19:05–19:35完成90m错题独立重算订正',
        'CORRECTED_WAITING_RECHECK': '📝 90m订正完成 · 待逐题复检确认',
        'STRICT_MASTERED': '💎 试卷全题复检通过 · 严格熟练验收'
      };
      var stageDesc = stageDescMap[prog.stage] || prog.stage;
      var unresolvedWrong = prog.unresolvedWrongIds || [];
      var unresolvedHtml = unresolvedWrong.length > 0
        ? ('<div style="font-size:12px;margin-top:6px;color:#dc2626;">❌ 尚有 <strong>' + unresolvedWrong.length + '</strong> 道错题待独立重算订正: <code class="camp21-rem-codes">' + escapeHtml(unresolvedWrong.join(', ')) + '</code></div>')
        : (prog.stage === 'STRICT_MASTERED' 
            ? '<div style="font-size:12px;margin-top:6px;color:#15803d;font-weight:700;">💎 全卷错题已全部完成独立重算与逐题复检验收！</div>'
            : (prog.examDone && prog.correctionDone ? '<div style="font-size:12px;margin-top:6px;color:#2563eb;font-weight:600;">✅ 本卷错题已全部完成独立重算，待逐题复检确认。</div>' : ''));

      statsHtml =
        '<div class="camp21-task-prog-section">' +
          '<div class="camp21-task-stats-row">' +
            '<span><strong>📝 试卷全流程状态：' + escapeHtml(ev.statusBadge) + '</strong></span>' +
            '<span class="camp21-stat-pills"><span class="st-attempted">' + escapeHtml(stageDesc) + '</span></span>' +
          '</div>' +
          '<div class="camp21-mini-track"><div class="camp21-mini-fill" style="width:' + (ev.isDone ? '100%' : (prog.examDone ? (prog.correctionDone ? '75%' : '45%') : '10%')) + '"></div></div>' +
          unresolvedHtml +
        '</div>';

      actionButtonsHtml = '<button type="button" class="camp21-recheck-btn primary-action" data-action="open-paper-correction-modal" data-task="' + escapeHtml(task.id) + '" data-paper="' + escapeHtml(task.paperId || '') + '">📝 试卷交卷/批改/订正管理</button>';
    } else if (ev.type === 'mock') {
      var mockStatusText = ev.isDone
        ? ('💎 3h全真模考已完成并通过审核 (试卷: ' + escapeHtml(ev.mockRecord.paperId) + ' · 时长: ' + ev.mockRecord.durationMinutes + 'm)')
        : '⏳ 待完成3小时全真模考并录入交卷批改记录 (需完整交卷+批改+>=180m)';

      statsHtml =
        '<div class="camp21-task-prog-section">' +
          '<div class="camp21-task-stats-row">' +
            '<span><strong>📋 3小时全真模考终验：' + (ev.isDone ? '1/1 已达成' : '0/1 待录入') + '</strong></span>' +
            '<span class="camp21-stat-pills"><span class="st-attempted">' + escapeHtml(mockStatusText) + '</span></span>' +
          '</div>' +
          '<div class="camp21-mini-track"><div class="camp21-mini-fill" style="width:' + (ev.isDone ? '100%' : '0%') + '"></div></div>' +
        '</div>';

      actionButtonsHtml = '<button type="button" class="camp21-recheck-btn" data-action="open-mock-modal" data-task="' + escapeHtml(task.id) + '">📋 录入/查看3h模考记录</button>';
    } else {
      // offline
      var offText = ev.state === 'NEEDS_INVENTORY'
        ? '⚠️ 资料题量待盘点录入 (未盘点前不可宣称100%完成)'
        : (ev.isDone ? '💎 纸质/线下任务已全部盘点做通 (' + ev.currentVal + '/' + ev.targetVal + ')' : ('📝 线下盘点完成度 ' + ev.currentVal + '/' + ev.targetVal));

      statsHtml =
        '<div class="camp21-task-prog-section">' +
          '<div class="camp21-task-stats-row">' +
            '<span><strong>📝 线下资料/任务进度：' + (ev.targetVal == null ? '待盘点' : (ev.currentVal + '/' + ev.targetVal)) + '</strong> (' + (ev.pct == null ? '0%' : (ev.pct + '%')) + ')</span>' +
            '<span class="camp21-stat-pills"><span class="st-attempted">' + escapeHtml(offText) + '</span></span>' +
          '</div>' +
          '<div class="camp21-mini-track"><div class="camp21-mini-fill" style="width:' + (ev.pct || 0) + '%"></div></div>' +
        '</div>';

      actionButtonsHtml = '<button type="button" class="camp21-recheck-btn" data-action="open-offline-modal" data-task="' + escapeHtml(task.id) + '">📝 线下资料盘点与自评</button>';
    }

    var chipsHtml = chapters.map(function (c) {
      var st = getChapterLiveStats(c.subjectId, c.chapterId);
      var subStat = st.total > 0 ? (' [全章存量: 🟢' + st.green + '/' + st.total + ' · 💎' + st.proficient + ' · ⚪' + st.unmarked + ']') : '';
      return '<button type="button" class="camp21-jump-chip" data-action="jump" data-subject="' + escapeHtml(c.subjectId) + '" data-chapter="' + escapeHtml(c.chapterId) + '" title="点击跳转到该章节题库（括号内为全章历史存量参考，不混入今日单卡进度）">' +
        '🚀 ' + escapeHtml(c.label) + escapeHtml(subStat) +
      '</button>';
    }).join('');

    var flexHtml = '';
    if (task.flexTotalMinutes === 180 || (task.cat === 'major' && !task.isOptionalOnlineMock && task.time && task.time.indexOf('14:00') >= 0)) {
      var dKey = 'd' + (task.day || getActiveDayNumber());
      var fState = (state.majorFlex && state.majorFlex[dKey]) || { practice: 120, correction: 60 };
      var curSum = fState.practice + fState.correction;
      var sumBadge = curSum === 180 
        ? '<span style="color:#15803d;font-weight:700;">✅ 合计180m满额</span>' 
        : (curSum < 180 ? '<span style="color:#2563eb;font-weight:600;">未用满 (余' + (180 - curSum) + 'm)</span>' : '<span style="color:#dc2626;font-weight:800;">⚠️ 超额 ' + (curSum - 180) + 'm</span>');

      flexHtml =
        '<div class="camp21-major-flex-box" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:8px 10px;margin:8px 0;font-size:12px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
            '<span style="font-weight:700;color:#0f172a;">⏱️ 14:00–17:00 考场块弹性作息分配 (总上限180分钟)</span>' +
            '<span style="font-size:11.5px;">' + sumBadge + '</span>' +
          '</div>' +
          '<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">' +
            '<label style="display:flex;align-items:center;gap:4px;">' +
              '<span>✍️ 做题：</span>' +
              '<input type="number" min="0" max="180" value="' + fState.practice + '" class="camp21-flex-input" data-flex-day="' + escapeHtml(dKey) + '" data-type="practice" style="width:54px;padding:3px 6px;border:1px solid #cbd5e1;border-radius:4px;font-size:12px;"> 分钟' +
            '</label>' +
            '<label style="display:flex;align-items:center;gap:4px;">' +
              '<span>📝 订正：</span>' +
              '<input type="number" min="0" max="180" value="' + fState.correction + '" class="camp21-flex-input" data-flex-day="' + escapeHtml(dKey) + '" data-type="correction" style="width:54px;padding:3px 6px;border:1px solid #cbd5e1;border-radius:4px;font-size:12px;"> 分钟' +
            '</label>' +
            '<button type="button" class="camp21-btn" data-action="save-major-flex" data-flex-day="' + escapeHtml(dKey) + '" style="padding:3px 8px;font-size:11.5px;">💾 保存作息</button>' +
          '</div>' +
        '</div>';
    }

    return (
      '<div class="' + cardCls + '" data-task-id="' + escapeHtml(task.id) + '">' +
        '<div class="camp21-task-top">' +
          '<div class="camp21-task-title-box" style="width:100%;">' +
            '<div class="camp21-task-kicker-row">' +
              '<span class="camp21-cat-badge cat-' + escapeHtml(task.cat) + '">' + escapeHtml(task.catLabel) + '</span>' +
              '<span class="camp21-time-tag">⏰ ' + escapeHtml(task.time) + '</span>' +
              '<span class="camp21-status-tier-badge tier-' + escapeHtml(ev.masteryTier) + '">' + escapeHtml(ev.statusBadge) + '</span>' +
            '</div>' +
            '<div class="camp21-task-title">' + escapeHtml(task.title) + '</div>' +
            '<div class="camp21-task-desc">' + escapeHtml(task.desc) + '</div>' +
          '</div>' +
        '</div>' +
        flexHtml +
        statsHtml +
        '<div class="camp21-task-footer">' +
          '<div class="camp21-jump-chips">' + chipsHtml + '</div>' +
          '<div style="display:flex;gap:6px;align-items:center;">' + actionButtonsHtml + '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ===== V3 13h 净专注记录条 & 四维口径条 & 配额对账台 (P0-4) =====
  function buildV3FocusAndQuotaStripHtml(dayNum, state, audit) {
    var nf = getDayNetFocus(state, dayNum);
    var qs = getV3QuotaStatsForDay(state, audit, dayNum);
    var cal = getFourCaliberSubjectStats();
    var activeQuotaItems = qs.items.filter(function (it) { return it.target > 0; });

    var quotaRowsHtml = activeQuotaItems.map(function (it) {
      var verifiedCls = it.verifiedComplete ? 'color:#15803d;font-weight:800;' : 'color:#b45309;font-weight:700;';
      return (
        '<div class="camp21-v3-qcard">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
            '<strong style="font-size:12px;color:#0f172a;">' + escapeHtml(it.mod.label) + '</strong>' +
            '<span style="font-size:11px;font-weight:800;' + verifiedCls + '">' + (it.verifiedComplete ? '💎题库全经验证' : ('待清零:' + it.backlog)) + '</span>' +
          '</div>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;background:#f8fafc;padding:6px;border-radius:6px;margin-bottom:6px;">' +
            '<div>今日配额: <strong>' + it.target + '</strong> 题</div>' +
            '<div>已映射: <strong>' + it.mapped + '</strong> 题' + (it.missingScope > 0 ? (' <span style="color:#dc2626;">(缺' + it.missingScope + ')</span>') : '') + '</div>' +
            '<div style="color:#1d4ed8;">验证覆盖: <strong>' + it.coverageVerified + '</strong></div>' +
            '<div style="color:#15803d;">严格熟练: <strong>' + it.masteryVerified + '</strong></div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;font-size:11px;border-top:1px dashed #e2e8f0;padding-top:4px;">' +
            '<span style="color:#64748b;">手工申报:</span>' +
            '<label style="display:inline-flex;align-items:center;gap:2px;">实做:' +
              '<input type="number" min="0" max="2000" class="camp21-v3-num-input" data-action="v3-actual" data-reckey="' + escapeHtml(it.recKey) + '" value="' + it.manualClaim + '">' +
            '</label>' +
            '<label style="display:inline-flex;align-items:center;gap:2px;">掌握:' +
              '<input type="number" min="0" max="2000" class="camp21-v3-num-input" data-action="v3-mastered" data-reckey="' + escapeHtml(it.recKey) + '" value="' + it.manualMastered + '">' +
            '</label>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    var caliberHtml = ['math', 'major', 'politics'].map(function (k) {
      var g = cal[k];
      return '<span class="camp21-caliber-chip">' +
        '<strong>[' + g.label + '全书存量]</strong> ' +
        '✍️已覆盖 ' + g.done + '/' + g.total + ' · ' +
        '🟢广义绿 ' + g.broadGreen + ' (💎精通 ' + g.strictProf + ' / 熟悉 ' + g.familiar + ') · ' +
        '🟡' + g.yellow + ' 🔴' + g.red + ' ⚪未标 ' + g.unmarked +
      '</span>';
    }).join('');

    return (
      '<div class="camp21-v3-strip">' +
        '<div class="camp21-caliber-bar">' +
          '<span style="font-weight:800;color:#1e293b;">📐 题库四维真实存量口径（严禁将历史存量冒充今日任务，本轮需逐题复检确认严格精通）：</span>' +
          caliberHtml +
        '</div>' +
        '<div class="camp21-v3-focus-row">' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<span style="font-size:12.5px;font-weight:800;color:#0f172a;">⏱️ 今日真实净专注记录（排班 14h05m / 达标线 13h=780m，00:00–02:59归属前一日）：</span>' +
            '<span style="font-size:12.5px;font-weight:800;color:' + (nf.reached ? '#15803d' : '#ea580c') + ';">' +
              Math.floor(nf.sum / 60) + 'h' + String(nf.sum % 60).padStart(2, '0') + 'm (' + nf.sum + '/780m · ' + nf.pct + '%) ' + (nf.reached ? '✅13h达标' : '⏳未满13h') +
            '</span>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
            '<label style="font-size:11.5px;font-weight:700;color:#334155;">数学(分): <input type="number" min="0" max="1440" class="camp21-v3-num-input" data-action="v3-focus" data-day="' + dayNum + '" data-subj="math" value="' + nf.math + '"></label>' +
            '<label style="font-size:11.5px;font-weight:700;color:#334155;">专业课(分): <input type="number" min="0" max="1440" class="camp21-v3-num-input" data-action="v3-focus" data-day="' + dayNum + '" data-subj="major" value="' + nf.major + '"></label>' +
            '<label style="font-size:11.5px;font-weight:700;color:#334155;">政治(分): <input type="number" min="0" max="1440" class="camp21-v3-num-input" data-action="v3-focus" data-day="' + dayNum + '" data-subj="politics" value="' + nf.politics + '"></label>' +
            '<label style="font-size:11.5px;font-weight:700;color:#334155;">英语(分): <input type="number" min="0" max="1440" class="camp21-v3-num-input" data-action="v3-focus" data-day="' + dayNum + '" data-subj="english" value="' + nf.english + '"></label>' +
          '</div>' +
        '</div>' +
        (dayNum >= 1 ? (
          '<details class="camp21-v3-quota-details">' +
            '<summary>📌 展开 V4 对账台（今日定额 <strong>' + qs.totalTarget + '</strong> 题次 | 题库已验证严格熟练 <strong>' + qs.totalVerifiedMastered + '</strong> 题 | 手工申报实做 <strong>' + qs.totalManualClaim + '</strong> 题 · 严禁手填冒充验证）</summary>' +
            '<div class="camp21-v3-qgrid">' + quotaRowsHtml + '</div>' +
          '</details>'
        ) : '') +
      '</div>'
    );
  }

  // ===== 渲染工作台顶部面板 (#camp21WorkbenchPanel) =====
  function renderWorkbenchPanel() {
    var mainContent = document.querySelector('.main-content');
    if (!mainContent) return;

    var panel = document.getElementById('camp21WorkbenchPanel');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'camp21WorkbenchPanel';
      panel.className = 'camp21-workbench-panel';
      mainContent.insertBefore(panel, mainContent.firstChild);
      bindPanelEvents(panel);
    }

    var state = loadCampState();
    var audit = loadAuditV4();
    var activeDay = getActiveDayNumber();
    var todayDay = getTodayCampDay();
    var dayObj = getDayObj(activeDay);
    var dayProg = evaluateDayProgress(dayObj, state, audit);

    enhanceHeaderDailyGoalButton(dayObj, dayProg);

    panel.classList.toggle('is-collapsed', !!state.collapsed);

    var optionsHtml = CAMP21_DAYS.map(function (d) {
      var isTodayTag = d.day === todayDay ? ' [今日]' : '';
      return '<option value="' + d.day + '" ' + (d.day === activeDay ? 'selected' : '') + '>' +
        escapeHtml(d.label + isTodayTag) +
      '</option>';
    }).join('');

    var cardsHtml = dayObj.tasks.map(function (t) {
      return buildTaskCardHtml(t, state, audit);
    }).join('');

    panel.innerHTML =
      '<div class="camp21-wb-header">' +
        '<div class="camp21-wb-left">' +
          '<span class="camp21-fire-pill">🔥 21天魔鬼特训 V4</span>' +
          '<div class="camp21-day-nav">' +
            '<button type="button" class="camp21-day-nav-btn" data-action="prev-day" ' + (activeDay <= 0 ? 'disabled' : '') + ' title="前一天">◀</button>' +
            '<select class="camp21-day-select" data-action="select-day" aria-label="选择特训天数">' + optionsHtml + '</select>' +
            '<button type="button" class="camp21-day-nav-btn" data-action="next-day" ' + (activeDay >= 21 ? 'disabled' : '') + ' title="后一天">▶</button>' +
          '</div>' +
          (activeDay !== todayDay ? '<button type="button" class="camp21-btn" data-action="goto-today">📍 回到今日(D' + todayDay + ')</button>' : '') +
          '<span class="camp21-phase-tag">' + escapeHtml(dayObj.focus) + '</span>' +
        '</div>' +
        '<div class="camp21-wb-progress-wrap">' +
          '<div class="camp21-wb-progress-bar-box">' +
            '<div class="camp21-wb-progress-meta">' +
              '<span><strong>💎 线上严格熟练：' + dayProg.onlineMastered + '/' + dayProg.onlineTarget + ' 题 (' + dayProg.onlineMasteryPct + '%)</strong> · 全部任务达标：' + dayProg.doneTasks + '/' + dayProg.totalTasks + ' 项 (' + dayProg.taskPct + '%)' + (dayProg.untrackedTasks > 0 ? (' · <span style="color:#ea580c;">⚠️' + dayProg.untrackedTasks + '项待盘点</span>') : '') + '</span>' +
              '<strong>' + dayProg.onlineMasteryPct + '%</strong>' +
            '</div>' +
            '<div class="camp21-wb-progress-track">' +
              '<div class="camp21-wb-progress-fill" style="width:' + dayProg.onlineMasteryPct + '%"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="camp21-wb-actions">' +
          '<button type="button" class="camp21-btn primary" data-action="open-modal" data-tab="all">🗓️ 21天全景表</button>' +
          '<button type="button" class="camp21-btn" data-action="open-modal" data-tab="v3ledger">📊 V4对账总账</button>' +
          '<button type="button" class="camp21-btn report-btn" data-action="copy-report">📋 复制今日战报</button>' +
          '<button type="button" class="camp21-btn" data-action="open-settings">⚙️ 目标设置</button>' +
          '<button type="button" class="camp21-btn" data-action="toggle-collapse">' + (state.collapsed ? '展开清单 ▼' : '收起 ▲') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="camp21-wb-body">' +
        buildV3FocusAndQuotaStripHtml(activeDay, state, audit) +
        '<div class="camp21-tasks-grid">' + cardsHtml + '</div>' +
      '</div>';
  }

  function renderHomeOverviewCard() {
    var homeShell = document.querySelector('.home-shell');
    if (!homeShell) return;

    var card = document.getElementById('camp21HomeOverviewCard');
    if (!card) {
      card = document.createElement('section');
      card.id = 'camp21HomeOverviewCard';
      card.className = 'camp21-home-card';
      var hero = homeShell.querySelector('.kh-hero') || homeShell.children[1];
      if (hero && hero.nextSibling) {
        homeShell.insertBefore(card, hero.nextSibling);
      } else {
        homeShell.appendChild(card);
      }
      bindPanelEvents(card);
    }

    var state = loadCampState();
    var audit = loadAuditV4();
    var activeDay = getActiveDayNumber();
    var dayObj = getDayObj(activeDay);
    var dayProg = evaluateDayProgress(dayObj, state, audit);

    card.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
          '<span class="camp21-fire-pill">🔥 21天魔鬼特训 V4 · ' + escapeHtml(dayObj.label) + '</span>' +
          '<strong style="font-size:14px;color:#0f172a;">' + escapeHtml(dayObj.focus) + '</strong>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<span style="font-size:13px;font-weight:800;color:#ea580c;">💎 严格熟练：' + dayProg.onlineMastered + '/' + dayProg.onlineTarget + ' (' + dayProg.onlineMasteryPct + '%) · 任务：' + dayProg.doneTasks + '/' + dayProg.totalTasks + '项</span>' +
          '<a href="study.html" class="camp21-btn primary" style="text-decoration:none;">🚀 进入特训工作台</a>' +
        '</div>' +
      '</div>' +
      '<div class="camp21-wb-progress-track" style="height:10px;">' +
        '<div class="camp21-wb-progress-fill" style="width:' + dayProg.onlineMasteryPct + '%"></div>' +
      '</div>';
  }

  // ===== 逐题复检练习弹窗 (P0-2 / P0-3) =====
  var _activePracticeModal = null;
  function closeAllCampSubModals() {
    ['camp21PracticeModalBackdrop', 'camp21MockModalBackdrop', 'camp21OfflineModalBackdrop', 'camp21CorrectionModalBackdrop'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
  }

  function openTaskPracticeModal(taskId, filterChapterId) {
    closeAllCampSubModals();
    var task = AuditV4.taskById(allCampTasks, taskId);
    if (!task) return;

    var audit = loadAuditV4();
    var existingModal = document.getElementById('camp21PracticeModalBackdrop');
    if (existingModal) existingModal.remove();

    var backdrop = document.createElement('div');
    backdrop.id = 'camp21PracticeModalBackdrop';
    backdrop.className = 'camp21-modal-backdrop';
    backdrop.style.zIndex = '10050';

    var scopedSlices = task.scopedItems || [];
    if (filterChapterId) {
      scopedSlices = scopedSlices.filter(function (s) { return s.chapterId === filterChapterId; });
    }

    var questionRows = [];
    scopedSlices.forEach(function (slice) {
      var liveMap = getChapterStatusMap(slice.subjectId, slice.chapterId);
      (slice.indices || []).forEach(function (idx) {
        var qid = AuditV4.questionKey(slice.subjectId, slice.chapterId, idx);
        var st = liveMap[String(idx)] || 'unmarked';
        var evs = (audit.events || []).filter(function (e) { return e.taskId === task.id && e.qid === qid; });
        var rev = AuditV4.lastReview(evs, task.id, qid);
        var downgraded = !!(rev && evs.some(function (e) { return e.ts > rev.ts && e.statusAfter !== 'proficient'; }));
        var isMastered = rev && rev.outcome === 'pass' && st === 'proficient' && !downgraded;
        var hasAttempt = evs.some(function (e) { return e.kind === 'attempt' || e.kind === 'review'; });

        questionRows.push({
          subjectId: slice.subjectId,
          chapterId: slice.chapterId,
          label: slice.label,
          idx: idx,
          qid: qid,
          status: st,
          isMastered: isMastered,
          hasAttempt: hasAttempt,
          lastOutcome: rev ? rev.outcome : null
        });
      });
    });

    var rowsHtml = questionRows.map(function (q) {
      var statusBadge = q.isMastered
        ? '<span style="color:#15803d;font-weight:800;">💎 严格熟练通过</span>'
        : (q.lastOutcome === 'fail' ? '<span style="color:#dc2626;font-weight:800;">❌ 复检未通过</span>' : '<span style="color:#b45309;font-weight:700;">⏳ 待复检</span>');
      var liveBadge = '<span class="camp21-status-chip ' + q.status + '">' + q.status + '</span>';

      return (
        '<tr style="border-bottom:1px solid #f1f5f9;">' +
          '<td style="padding:8px 10px;font-weight:700;">' + escapeHtml(q.label) + ' #' + (q.idx + 1) + '</td>' +
          '<td style="padding:8px 10px;">' + liveBadge + '</td>' +
          '<td style="padding:8px 10px;">' + statusBadge + '</td>' +
          '<td style="padding:8px 10px;text-align:right;">' +
            '<button type="button" class="camp21-btn" style="padding:3px 8px;font-size:11px;margin-right:4px;" data-action="practice-pass" data-task="' + escapeHtml(task.id) + '" data-sub="' + escapeHtml(q.subjectId) + '" data-chap="' + escapeHtml(q.chapterId) + '" data-idx="' + q.idx + '">✅ 独立做对(通过)</button>' +
            '<button type="button" class="camp21-btn" style="padding:3px 8px;font-size:11px;margin-right:4px;" data-action="practice-fail" data-task="' + escapeHtml(task.id) + '" data-sub="' + escapeHtml(q.subjectId) + '" data-chap="' + escapeHtml(q.chapterId) + '" data-idx="' + q.idx + '">❌ 做错(不通过)</button>' +
            '<button type="button" class="camp21-btn" style="padding:3px 6px;font-size:11px;" data-action="jump" data-subject="' + escapeHtml(q.subjectId) + '" data-chapter="' + escapeHtml(q.chapterId) + '">🚀 直达</button>' +
          '</td>' +
        '</tr>'
      );
    }).join('');

    backdrop.innerHTML =
      '<div class="camp21-modal-dialog" style="max-width:760px;max-height:88vh;display:flex;flex-direction:column;" role="dialog">' +
        '<div class="camp21-modal-header">' +
          '<div class="camp21-modal-title-wrap">' +
            '<h3>📝 逐题练习与严格熟练复检 · ' + escapeHtml(task.title) + '</h3>' +
            '<p style="font-size:12px;color:#64748b;">本轮逐题独立作答通过且当前状态为熟练(proficient)方可计入严格熟练，杜绝一键批量通过。</p>' +
          '</div>' +
          '<button type="button" class="camp21-modal-close" data-action="close-practice-modal">×</button>' +
        '</div>' +
        '<div style="overflow-y:auto;padding:12px;flex:1;">' +
          '<table style="width:100%;border-collapse:collapse;font-size:12px;">' +
            '<thead>' +
              '<tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0;text-align:left;">' +
                '<th style="padding:8px 10px;">题号与章节</th>' +
                '<th style="padding:8px 10px;">当前标记</th>' +
                '<th style="padding:8px 10px;">复检结果</th>' +
                '<th style="padding:8px 10px;text-align:right;">核验操作</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + rowsHtml + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';

    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) backdrop.remove();
    });
  }

  // 模考录入弹窗（P1-5）
  function openMockSessionModal(taskId) {
    closeAllCampSubModals();
    var task = AuditV4.taskById(allCampTasks, taskId);
    if (!task) return;
    var audit = loadAuditV4();
    var existingModal = document.getElementById('camp21MockModalBackdrop');
    if (existingModal) existingModal.remove();

    var r = audit.mockRecords[task.id] || {};
    var duration = r.durationMinutes || 180;
    var paperId = r.paperId || '2023南大851全真模拟卷';
    var isSubmitted = r.fullPaperSubmitted === true;
    var isGraded = !!r.gradedAt;

    var backdrop = document.createElement('div');
    backdrop.id = 'camp21MockModalBackdrop';
    backdrop.className = 'camp21-modal-backdrop';
    backdrop.style.zIndex = '10060';

    backdrop.innerHTML =
      '<div class="camp21-modal-dialog" style="max-width:520px;" role="dialog">' +
        '<div class="camp21-modal-header">' +
          '<div class="camp21-modal-title-wrap">' +
            '<h3>📋 3小时全真模考录入 · ' + escapeHtml(task.title) + '</h3>' +
            '<p style="font-size:12px;color:#64748b;">严格3小时模考、完整交卷并完成批改后方可终验，历史章节标记不自动计入模考完成。</p>' +
          '</div>' +
          '<button type="button" class="camp21-modal-close" data-action="close-mock-modal">×</button>' +
        '</div>' +
        '<form id="camp21MockForm" style="padding:16px;display:flex;flex-direction:column;gap:12px;font-size:13px;">' +
          '<label><strong>试卷名称/编号：</strong>' +
            '<input type="text" id="mockPaperId" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;margin-top:4px;" value="' + escapeHtml(paperId) + '" required>' +
          '</label>' +
          '<label><strong>模考实际专注时长 (分钟，必须 ≥ 180)：</strong>' +
            '<input type="number" id="mockDuration" min="1" max="600" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;margin-top:4px;" value="' + duration + '" required>' +
          '</label>' +
          '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;">' +
            '<input type="checkbox" id="mockFullPaper" ' + (isSubmitted ? 'checked' : '') + '> <strong>已完整作答全卷并按时交卷</strong>' +
          '</label>' +
          '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;">' +
            '<input type="checkbox" id="mockGraded" ' + (isGraded ? 'checked' : '') + '> <strong>已完成对答案和逐题批改</strong>' +
          '</label>' +
          '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;">' +
            '<button type="button" class="camp21-btn" data-action="close-mock-modal">取消</button>' +
            '<button type="submit" class="camp21-btn primary">💾 录入并核验模考</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) backdrop.remove();
    });

    document.getElementById('camp21MockForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var pid = document.getElementById('mockPaperId').value.trim();
      var dur = Number(document.getElementById('mockDuration').value) || 0;
      var fullSub = document.getElementById('mockFullPaper').checked;
      var graded = document.getElementById('mockGraded').checked;

      var now = Date.now();
      var startedAt = now - dur * 60000;
      var curAudit = loadAuditV4();
      var nextAudit = AuditV4.recordMock(curAudit, task.id, {
        paperId: pid,
        startedAt: startedAt,
        submittedAt: now,
        gradedAt: graded ? now : null,
        fullPaperSubmitted: fullSub
      });
      saveAuditV4(nextAudit);
      backdrop.remove();
      renderAll();
      showCampToast(dur >= 180 && fullSub && graded ? '✅ 3小时全真模考终验成功！' : 'ℹ️ 已保存模考记录（需时长≥180m、全卷交卷且批改完成方可终验）。');
    });
  }


  // ===== 试卷全真模考与独立订正管理弹窗 (V4.1) =====
  function openPaperCorrectionModal(taskId, paperId) {
    closeAllCampSubModals();
    var task = AuditV4.taskById(allCampTasks, taskId);
    var audit = loadAuditV4();
    var existingModal = document.getElementById('camp21CorrectionModalBackdrop');
    if (existingModal) existingModal.remove();

    var key = String(taskId) + "_" + String(paperId);
    var rec = (audit.paperCorrections && audit.paperCorrections[key]) || {};
    var v41 = window.Camp21ScheduleV41;
    var prog = (v41 && typeof v41.paperProgress === 'function')
      ? v41.paperProgress(rec)
      : { stage: rec.fullPaperSubmitted ? (rec.graded ? 'GRADED_WAITING_CORRECTION' : 'SUBMITTED_WAITING_GRADING') : 'NOT_SUBMITTED', unresolvedWrongIds: [] };

    var isSubmitted = rec.fullPaperSubmitted === true;
    var isGraded = rec.graded === true;
    var isConfirmed = rec.correctionSessionConfirmed === true;
    var isMastered = rec.allAssignedQuestionsStrictlyMastered === true;
    var wrongStr = Array.isArray(rec.wrongQuestionIds) ? rec.wrongQuestionIds.join(', ') : '';
    var corrStr = Array.isArray(rec.correctedQuestionIds) ? rec.correctedQuestionIds.join(', ') : '';
    var dur = rec.correctionMinutes || (task && task.scheduledCorrectionMinutes) || 90;

    var stages = [
      { id: 'NOT_SUBMITTED', label: '①未交卷' },
      { id: 'SUBMITTED_WAITING_GRADING', label: '②已交卷待批改' },
      { id: 'GRADED_WAITING_CORRECTION', label: '③已批改待订正' },
      { id: 'CORRECTED_WAITING_RECHECK', label: '④订正完成待复检' },
      { id: 'STRICT_MASTERED', label: '⑤严格熟练' }
    ];

    var stageBarHtml = stages.map(function (st) {
      var active = prog.stage === st.id;
      return '<div style="flex:1;text-align:center;padding:6px 2px;font-size:11px;font-weight:' + (active ? '800' : '500') + ';background:' + (active ? '#2563eb;color:#fff;' : '#f1f5f9;color:#64748b;') + ';border-radius:4px;">' + st.label + '</div>';
    }).join('');

    var backdrop = document.createElement('div');
    backdrop.id = 'camp21CorrectionModalBackdrop';
    backdrop.className = 'camp21-modal-backdrop';
    backdrop.style.zIndex = '10060';

    backdrop.innerHTML =
      '<div class="camp21-modal-dialog" style="max-width:560px;" role="dialog">' +
        '<div class="camp21-modal-header">' +
          '<div class="camp21-modal-title-wrap">' +
            '<h3>📝 试卷全真模考与独立订正 · ' + escapeHtml((task && task.paperTitle) || paperId) + '</h3>' +
            '<p style="font-size:12px;color:#64748b;">严格分离“独立模考作答”与“深度订正”。未订正完绝不因时间耗尽而自动通过。</p>' +
          '</div>' +
          '<button type="button" class="camp21-modal-close" data-action="close-correction-modal">×</button>' +
        '</div>' +
        '<div style="padding:10px 16px 0 16px;display:flex;gap:4px;">' + stageBarHtml + '</div>' +
        '<form id="camp21CorrectionForm" style="padding:16px;display:flex;flex-direction:column;gap:12px;font-size:13px;">' +
          '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;background:#f8fafc;padding:8px 10px;border-radius:6px;border:1px solid #e2e8f0;">' +
            '<input type="checkbox" id="corrFullSubmitted" ' + (isSubmitted ? 'checked' : '') + '> <strong>① 已在考场块完整作答180分钟并交卷</strong>' +
          '</label>' +
          '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;background:#f8fafc;padding:8px 10px;border-radius:6px;border:1px solid #e2e8f0;">' +
            '<input type="checkbox" id="corrGraded" ' + (isGraded ? 'checked' : '') + '> <strong>② 已核对官方解析并完成全卷估分与批改</strong>' +
          '</label>' +
          '<label><strong>③ 错题题号录入 (逗号或空格分隔，例如: 3, 7, 12, 19, 21)：</strong>' +
            '<input type="text" id="corrWrongIds" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;margin-top:4px;" value="' + escapeHtml(wrongStr) + '" placeholder="若全卷满分可留空">' +
          '</label>' +
          '<label><strong>④ 已独立重算并订正完成的题号 (例如: 3, 7)：</strong>' +
            '<input type="text" id="corrCorrectedIds" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;margin-top:4px;" value="' + escapeHtml(corrStr) + '" placeholder="重算做通后再填入">' +
          '</label>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
            '<label><strong>订正累计专注时长 (分钟)：</strong>' +
              '<input type="number" id="corrMinutes" min="0" max="600" style="width:100%;padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;margin-top:4px;" value="' + dur + '">' +
            '</label>' +
            '<label style="display:flex;align-items:center;gap:6px;margin-top:22px;cursor:pointer;">' +
              '<input type="checkbox" id="corrSessionConfirmed" ' + (isConfirmed ? 'checked' : '') + '> <strong>完成订正错因复盘</strong>' +
            '</label>' +
          '</div>' +
          '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;background:#f0fdf4;padding:8px 10px;border-radius:6px;border:1px solid #bbf7d0;">' +
            '<input type="checkbox" id="corrStrictMastered" ' + (isMastered ? 'checked' : '') + '> <strong>⑤ 已逐题复检确认，全卷所有题目严格熟练掌握</strong>' +
          '</label>' +
          '<div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;">' +
            '<button type="button" class="camp21-btn" data-action="close-correction-modal">取消</button>' +
            '<button type="submit" class="camp21-btn primary">💾 保存试卷订正状态</button>' +
          '</div>' +
        '</form>' +
      '</div>';

    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) backdrop.remove();
    });

    backdrop.querySelector('[data-action="close-correction-modal"]').addEventListener('click', function () {
      backdrop.remove();
    });

    document.getElementById('camp21CorrectionForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var sub = document.getElementById('corrFullSubmitted').checked;
      var gr = document.getElementById('corrGraded').checked;
      var rawWrong = document.getElementById('corrWrongIds').value.trim();
      var rawCorr = document.getElementById('corrCorrectedIds').value.trim();
      var cf = document.getElementById('corrSessionConfirmed').checked;
      var mins = Number(document.getElementById('corrMinutes').value) || 0;
      var mast = document.getElementById('corrStrictMastered').checked;

      function parseIds(str) {
        if (!str) return [];
        return Array.from(new Set(str.split(/[\s,，、]+/).map(function (s) { return s.trim(); }).filter(Boolean)));
      }

      var wrongList = parseIds(rawWrong);
      var corrList = parseIds(rawCorr);

      var curAudit = loadAuditV4();
      var nextAudit = AuditV4.recordPaperCorrection(curAudit, taskId, paperId, {
        fullPaperSubmitted: sub,
        graded: gr,
        wrongQuestionIds: wrongList,
        correctedQuestionIds: corrList,
        correctionSessionConfirmed: cf,
        correctionMinutes: mins,
        allAssignedQuestionsStrictlyMastered: mast && sub && gr && (wrongList.length === 0 || corrList.length >= wrongList.length)
      });
      saveAuditV4(nextAudit);
      backdrop.remove();
      renderAll();
      showCampToast('✅ 试卷模考订正记录已保存！');
    });
  }

  // 线下资料盘点弹窗（P1-6）
  function openOfflineInventoryModal(taskId) {
    closeAllCampSubModals();
    var task = AuditV4.taskById(allCampTasks, taskId);
    if (!task) return;
    var audit = loadAuditV4();
    var existingModal = document.getElementById('camp21OfflineModalBackdrop');
    if (existingModal) existingModal.remove();

    var backdrop = document.createElement('div');
    backdrop.id = 'camp21OfflineModalBackdrop';
    backdrop.className = 'camp21-modal-backdrop';
    backdrop.style.zIndex = '10060';

    var items = task.offlineItemIds || [];
    var itemsHtml = items.map(function (itId) {
      var evs = (audit.offlineEvents || []).filter(function (e) { return e.taskId === task.id && e.itemId === itId; });
      var last = evs.filter(function (e) { return e.action === 'pass' || e.action === 'fail'; }).at(-1);
      var isPass = last && last.action === 'pass';

      return (
        '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid #f1f5f9;">' +
          '<span>' + escapeHtml(itId) + '</span>' +
          '<div>' +
            '<button type="button" class="camp21-btn ' + (isPass ? 'primary' : '') + '" style="padding:2px 8px;font-size:11px;margin-right:4px;" data-action="offline-pass" data-task="' + escapeHtml(task.id) + '" data-item="' + escapeHtml(itId) + '">✅已通</button>' +
            '<button type="button" class="camp21-btn" style="padding:2px 8px;font-size:11px;" data-action="offline-fail" data-task="' + escapeHtml(task.id) + '" data-item="' + escapeHtml(itId) + '">❌待攻坚</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    backdrop.innerHTML =
      '<div class="camp21-modal-dialog" style="max-width:540px;" role="dialog">' +
        '<div class="camp21-modal-header">' +
          '<div class="camp21-modal-title-wrap">' +
            '<h3>📝 线下纸质资料盘点 · ' + escapeHtml(task.title) + '</h3>' +
            '<p style="font-size:12px;color:#64748b;">逐项盘点题号与通过状态，未完成前不计入每日总达标分母。</p>' +
          '</div>' +
          '<button type="button" class="camp21-modal-close" data-action="close-offline-modal">×</button>' +
        '</div>' +
        '<div style="padding:14px;max-height:60vh;overflow-y:auto;">' +
          (items.length > 0 ? itemsHtml : '<div style="color:#b45309;padding:12px;">⚠️ 本任务当前尚未盘点具体题量清单，总进度不可自动计为100%。</div>') +
        '</div>' +
      '</div>';

    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) backdrop.remove();
    });
  }

  // 战报复制（四口径严格一致，P1-6 / T13）
  function copyDailyReport() {
    var state = loadCampState();
    var audit = loadAuditV4();
    var dayObj = getDayObj(getActiveDayNumber());
    var dayProg = evaluateDayProgress(dayObj, state, audit);
    var nf = getDayNetFocus(state, dayObj.day);
    var qs = getV3QuotaStatsForDay(state, audit, dayObj.day);

    var lines = [
      '【🔥 21天魔鬼特训 V4精准对账版 · ' + dayObj.label + ' 每日战报】',
      '⏱️ 今日真实净专注：' + Math.floor(nf.sum / 60) + '小时' + String(nf.sum % 60).padStart(2, '0') + '分 (' + nf.sum + '/780分钟 · ' + (nf.reached ? '✅13h达标' : '⏳未满13h') + ') [数' + nf.math + 'm/专' + nf.major + 'm/政' + nf.politics + 'm/英' + nf.english + 'm]',
      '💎 线上题目严格熟练：' + dayProg.onlineMastered + '/' + dayProg.onlineTarget + ' 题 (' + dayProg.onlineMasteryPct + '%) | 本轮已覆盖 ' + dayProg.onlineAttempted + ' 题 | 广义绿 ' + dayProg.onlineBroadGreen + ' 题',
      '📊 全天全部任务达标：' + dayProg.doneTasks + '/' + dayProg.totalTasks + ' 项 (' + dayProg.taskPct + '%)' + (dayProg.untrackedTasks > 0 ? (' [⚠️含 ' + dayProg.untrackedTasks + ' 项待盘点任务]') : ''),
      '📌 V4全量定额对账：今日配额 ' + qs.totalTarget + ' 题次 | 题库已验证掌握 ' + qs.totalVerifiedMastered + ' 题 | 手工申报实做 ' + qs.totalManualClaim + ' 题'
    ];

    dayObj.tasks.forEach(function (t) {
      var ev = evaluateScopedV4(t, audit);
      var mark = ev.isDone ? '✅' : '⏳';
      var statStr = ev.type === 'online'
        ? (' [绑定 ' + ev.targetVal + '题 | 💎严格熟练 ' + ev.strictProficient + '/' + ev.targetVal + ' (' + ev.pct + '%) | ✍️已做' + ev.attempted + ' 🟢广义绿' + ev.broadGreen + ' ⏳待清零' + ev.remainingCount + '题]')
        : (' [' + ev.statusBadge + ']');
      lines.push(mark + ' ' + t.catLabel + '：' + t.title + statStr);
    });

    var text = lines.join('\n');
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(function () {
        window.alert('✅ 今日特训战报已复制到剪贴板！你可以直接粘贴发给助手汇报：\n\n' + text);
      }).catch(function () {
        window.prompt('请复制以下今日特训战报：', text);
      });
    } else {
      window.prompt('请复制以下今日特训战报：', text);
    }
    return text;
  }

  // ===== 全景指挥舱 Modal (#camp21ModalBackdrop) =====
  var _activeModalTab = 'today';
  function ensureCampModal() {
    var backdrop = document.getElementById('camp21ModalBackdrop');
    if (backdrop) return backdrop;
    backdrop = document.createElement('div');
    backdrop.id = 'camp21ModalBackdrop';
    backdrop.className = 'camp21-modal-backdrop';
    backdrop.hidden = true;
    backdrop.innerHTML =
      '<div class="camp21-modal-dialog" role="dialog" aria-modal="true" aria-label="21天魔鬼特训全景指挥舱">' +
        '<div class="camp21-modal-header">' +
          '<div class="camp21-modal-title-wrap">' +
            '<h2>🔥 Kyson 考研冲刺 · 21天魔鬼特训 V4全景指挥舱</h2>' +
            '<p>真实逐题练习审计 · 双轨核验 · 绝不跨天串账 · 严禁旧绿标冒充严格熟练</p>' +
          '</div>' +
          '<button type="button" class="camp21-modal-close" data-action="close-modal" aria-label="关闭">×</button>' +
        '</div>' +
        '<div class="camp21-modal-tabs">' +
          '<button type="button" class="camp21-tab-btn" data-action="switch-tab" data-tab="today">📋 今日特训清单 & 净专注</button>' +
          '<button type="button" class="camp21-tab-btn" data-action="switch-tab" data-tab="v3ledger">📊 V4对账总账 (7680题次与逐题核对)</button>' +
          '<button type="button" class="camp21-tab-btn" data-action="switch-tab" data-tab="all">🗓️ 21天全景作战大表</button>' +
          '<button type="button" class="camp21-tab-btn" data-action="switch-tab" data-tab="schedule">⏰ 14h10m 排班作息表</button>' +
          '<button type="button" class="camp21-tab-btn" data-action="open-settings">⚙️ 原版每日目标设置</button>' +
        '</div>' +
        '<div class="camp21-modal-body" id="camp21ModalBody"></div>' +
      '</div>';
    document.body.appendChild(backdrop);
    bindPanelEvents(backdrop);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) backdrop.hidden = true;
    });
    return backdrop;
  }

  function openCampModal(tab) {
    closeAllCampSubModals();
    _activeModalTab = tab || 'today';
    var backdrop = ensureCampModal();
    backdrop.hidden = false;
    renderCampModalContent();
  }

  function renderCampModalContent() {
    var backdrop = document.getElementById('camp21ModalBackdrop');
    if (!backdrop || backdrop.hidden) return;
    var tabBtns = backdrop.querySelectorAll('.camp21-tab-btn[data-tab]');
    for (var i = 0; i < tabBtns.length; i++) {
      tabBtns[i].classList.toggle('active', tabBtns[i].getAttribute('data-tab') === _activeModalTab);
    }
    var body = document.getElementById('camp21ModalBody');
    if (!body) return;

    var state = loadCampState();
    var audit = loadAuditV4();
    var activeDay = getActiveDayNumber();
    var dayObj = getDayObj(activeDay);

    if (_activeModalTab === 'today') {
      var dayProg = evaluateDayProgress(dayObj, state, audit);
      var cardsHtml = dayObj.tasks.map(function (t) { return buildTaskCardHtml(t, state, audit); }).join('');
      body.innerHTML =
        '<div style="padding:10px 14px;">' +
          buildV3FocusAndQuotaStripHtml(activeDay, state, audit) +
          '<div class="camp21-tasks-grid" style="margin-top:12px;">' + cardsHtml + '</div>' +
        '</div>';
    } else if (_activeModalTab === 'v3ledger') {
      var qs = getV3QuotaStatsForDay(state, audit, activeDay);
      var rowsHtml = qs.items.map(function (it) {
        return (
          '<tr style="border-bottom:1px solid #e2e8f0;">' +
            '<td style="padding:8px 10px;font-weight:700;">' + escapeHtml(it.mod.label) + '</td>' +
            '<td style="padding:8px 10px;text-align:center;">' + it.target + '</td>' +
            '<td style="padding:8px 10px;text-align:center;color:#1d4ed8;font-weight:700;">' + it.coverageVerified + '</td>' +
            '<td style="padding:8px 10px;text-align:center;color:#15803d;font-weight:800;">' + it.masteryVerified + '</td>' +
            '<td style="padding:8px 10px;text-align:center;">' + (it.missingScope > 0 ? ('<span style="color:#dc2626;">待映射 ' + it.missingScope + '</span>') : '已全映射') + '</td>' +
            '<td style="padding:8px 10px;text-align:center;">' + it.manualClaim + '</td>' +
            '<td style="padding:8px 10px;text-align:center;">' + it.manualMastered + '</td>' +
            '<td style="padding:8px 10px;text-align:center;color:#ea580c;font-weight:700;">' + it.backlog + '</td>' +
            '<td style="padding:8px 10px;text-align:center;">' + (it.verifiedComplete ? '💎已通过' : '⏳未满') + '</td>' +
          '</tr>'
        );
      }).join('');

      body.innerHTML =
        '<div style="padding:12px 14px;">' +
          '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px;margin-bottom:12px;font-size:12.5px;color:#1e3a8a;">' +
            '<strong>📊 V4 零删减全量总账对账规则：</strong>每道题必须在当前属于熟练(proficient)且存在本轮复检通过记录方可计入“题库已验证严格熟练”；手工填报单独显示，严禁冒充题库验证。' +
          '</div>' +
          '<table style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;">' +
            '<thead>' +
              '<tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">' +
                '<th style="padding:8px 10px;">模块书目</th>' +
                '<th style="padding:8px 10px;text-align:center;">今日配额</th>' +
                '<th style="padding:8px 10px;text-align:center;">验证覆盖</th>' +
                '<th style="padding:8px 10px;text-align:center;">严格熟练</th>' +
                '<th style="padding:8px 10px;text-align:center;">题目映射</th>' +
                '<th style="padding:8px 10px;text-align:center;">申报实做</th>' +
                '<th style="padding:8px 10px;text-align:center;">申报掌握</th>' +
                '<th style="padding:8px 10px;text-align:center;">待清零</th>' +
                '<th style="padding:8px 10px;text-align:center;">结论</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' + rowsHtml + '</tbody>' +
          '</table>' +
        '</div>';
    } else if (_activeModalTab === 'all') {
      var allRows = CAMP21_DAYS.map(function (d) {
        var dp = evaluateDayProgress(d, state, audit);
        return (
          '<tr class="' + (d.day === activeDay ? 'is-active-day' : '') + '">' +
            '<td><strong>' + escapeHtml(d.label) + '</strong><br><small>' + d.date + '</small></td>' +
            '<td>' + escapeHtml(d.focus) + '</td>' +
            '<td>💎严格熟练 ' + dp.onlineMastered + '/' + dp.onlineTarget + ' (' + dp.onlineMasteryPct + '%)<br>任务 ' + dp.doneTasks + '/' + dp.totalTasks + '</td>' +
            '<td><button type="button" class="camp21-btn" data-action="pick-day" data-day="' + d.day + '">查看D' + d.day + '</button></td>' +
          '</tr>'
        );
      }).join('');
      body.innerHTML =
        '<div style="padding:12px 14px;">' +
          '<table class="camp21-all-days-table">' +
            '<thead><tr><th>日期</th><th>核心攻坚焦点</th><th>V4真实核验进度</th><th>切换</th></tr></thead>' +
            '<tbody>' + allRows + '</tbody>' +
          '</table>' +
        '</div>';
    } else if (_activeModalTab === 'schedule') {
      var V41 = window.Camp21ScheduleV41;
      var shownSlots = (V41 && activeDay >= 1 && activeDay <= 21)
        ? V41.scheduleForDay(activeDay).slots
        : (activeDay === 0 ? getDay0PreheatSlots() : CAMP21_SCHEDULE_SLOTS);

      var actualDay = getTodayCampDay();
      var isTodayActive = (activeDay === actualDay);
      var nowMinutes = (new Date()).getHours() * 60 + (new Date()).getMinutes();

      function parseClockMinutes(clock) {
        if (!clock || clock.indexOf(':') === -1) return 0;
        var parts = clock.split(':');
        return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
      }

      var slotsHtml = shownSlots.map(function (s) {
        var startMin = parseClockMinutes(s.start), endMin = parseClockMinutes(s.end);
        var isCurrent = false;
        if (isTodayActive) {
          if (endMin < startMin) { // cross midnight e.g. 22:50 - 00:35
            isCurrent = (nowMinutes >= startMin || nowMinutes < endMin);
          } else {
            isCurrent = (nowMinutes >= startMin && nowMinutes < endMin);
          }
        }
        var currentBadge = isCurrent ? '<span style="background:#ef4444;color:#fff;font-size:11px;padding:2px 6px;border-radius:4px;margin-left:8px;font-weight:700;">🔥 进行中</span>' : '';
        var durStr = s.minutes ? (s.minutes + 'm') : (s.dur || '');
        var tagBadge = s.study ? '<span style="background:#e0f2fe;color:#0369a1;font-size:11px;padding:2px 6px;border-radius:4px;font-weight:600;">学习 (' + durStr + ')</span>' : '<span style="background:#f1f5f9;color:#64748b;font-size:11px;padding:2px 6px;border-radius:4px;">生活/通勤</span>';

        return (
          '<div class="camp21-slot-card ' + (isCurrent ? 'is-current-slot' : '') + '" style="' + (isCurrent ? 'border-left:4px solid #ef4444;background:#fff5f5;' : '') + '">' +
            '<div class="camp21-slot-time" style="font-weight:700;">' + s.start + ' - ' + s.end + '</div>' +
            '<div class="camp21-slot-info">' +
              '<div style="font-weight:700;color:#0f172a;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">' +
                escapeHtml(s.label || s.title) + tagBadge + currentBadge +
              '</div>' +
              '<div style="font-size:11.5px;color:#64748b;margin-top:2px;">' + escapeHtml(s.desc || s.target || '') + '</div>' +
            '</div>' +
          '</div>'
        );
      }).join('');

      var dayNotice = (activeDay === 1 || activeDay === 2)
        ? '<div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px;color:#92400e;"><strong>📌 D' + activeDay + ' 数学全真模考日：</strong>08:30–11:30独立答卷180分钟（不含订正）；11:30–12:30订正①(60m)；19:05–19:35订正②(30m)。合计90分钟专属订正。</div>'
        : ([7, 14, 21].indexOf(activeDay) >= 0
          ? '<div style="background:#ede9fe;border:1px solid #ddd6fe;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px;color:#5b21b6;"><strong>📌 D' + activeDay + ' 专业课全真模考日：</strong>14:00–17:00独立全真模拟180分钟，订正另外列入待处理队列。</div>'
          : '<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px;color:#166534;"><strong>📌 D' + activeDay + ' 常规强化日：</strong>专业课14:00–17:00实行做题+订正弹性180分钟；数学上午旧题攻坚，晚间100分钟主攻《邂逅遗憾》。</div>');

      body.innerHTML =
        '<div style="padding:12px 14px;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
            '<div style="font-weight:700;font-size:13.5px;color:#1e293b;">📅 D' + activeDay + ' 当日详细排班表 (全天排班 850m / 净专注目标 780m)</div>' +
            '<div style="font-size:12px;color:#64748b;">' + (isTodayActive ? '🟢 正在查看今天' : '👀 正在查看非本日规划') + '</div>' +
          '</div>' +
          dayNotice +
          '<div class="camp21-schedule-list">' + slotsHtml + '</div>' +
        '</div>';
    }
  }

  // ===== 事件委托与生命周期绑定 =====
  function bindPanelEvents(container) {
    if (!container || container._camp21EventsBound) return;
    container._camp21EventsBound = true;

    container.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      var state = loadCampState();

      if (action === 'prev-day') {
        state.selectedDay = Math.max(0, getActiveDayNumber() - 1);
        saveCampState(state);
        renderAll();
      } else if (action === 'next-day') {
        state.selectedDay = Math.min(21, getActiveDayNumber() + 1);
        saveCampState(state);
        renderAll();
      } else if (action === 'goto-today') {
        state.selectedDay = getTodayCampDay();
        saveCampState(state);
        renderAll();
      } else if (action === 'pick-day') {
        state.selectedDay = Number(btn.getAttribute('data-day')) || 0;
        saveCampState(state);
        _activeModalTab = 'today';
        renderAll();
      } else if (action === 'toggle-collapse') {
        state.collapsed = !state.collapsed;
        saveCampState(state);
        renderAll();
      } else if (action === 'open-modal') {
        openCampModal(btn.getAttribute('data-tab') || 'today');
      } else if (action === 'close-modal') {
        var bd = document.getElementById('camp21ModalBackdrop');
        if (bd) bd.hidden = true;
      } else if (action === 'switch-tab') {
        _activeModalTab = btn.getAttribute('data-tab') || 'today';
        renderCampModalContent();
      } else if (action === 'open-paper-correction-modal') {
        var tId = btn.getAttribute('data-task');
        var pId = btn.getAttribute('data-paper');
        openPaperCorrectionModal(tId, pId);
      } else if (action === 'close-correction-modal') {
        var el = document.getElementById('camp21CorrectionModalBackdrop');
        if (el) el.remove();
      } else if (action === 'save-major-flex') {
        var dayKey = btn.getAttribute('data-flex-day');
        var card = btn.closest('.camp21-task-card');
        if (card && dayKey) {
          var pInput = card.querySelector('.camp21-flex-input[data-type="practice"]');
          var cInput = card.querySelector('.camp21-flex-input[data-type="correction"]');
          var pVal = Math.max(0, parseInt(pInput ? pInput.value : 120, 10) || 0);
          var cVal = Math.max(0, parseInt(cInput ? cInput.value : 60, 10) || 0);
          if (pVal + cVal > 180) {
            window.alert('⚠️ 14:00–17:00 考场块仅有 180 分钟，当前分配合计 ' + (pVal + cVal) + ' 分钟，不可超过 180 分钟！请重新调整。');
            return;
          }
          state.majorFlex = state.majorFlex || {};
          state.majorFlex[dayKey] = { practice: pVal, correction: cVal };
          saveCampState(state);
          renderAll();
          showCampToast('✅ 已保存 D' + dayKey.replace('d', '') + ' 专业课弹性作息：做题 ' + pVal + 'm + 订正 ' + cVal + 'm');
        }
      } else if (action === 'open-settings') {
        var bd2 = document.getElementById('camp21ModalBackdrop');
        if (bd2) bd2.hidden = true;
        var origModal = document.getElementById('studySettingsModal');
        if (origModal) {
          origModal.hidden = false;
          origModal.style.display = 'flex';
        }
      } else if (action === 'copy-report') {
        copyDailyReport();
      } else if (action === 'jump') {
        jumpToChapter(btn.getAttribute('data-subject'), btn.getAttribute('data-chapter'));
      } else if (action === 'open-practice-modal') {
        openTaskPracticeModal(btn.getAttribute('data-task'));
      } else if (action === 'close-practice-modal') {
        var pBd = document.getElementById('camp21PracticeModalBackdrop');
        if (pBd) pBd.remove();
      } else if (action === 'practice-pass' || action === 'practice-fail') {
        var tId = btn.getAttribute('data-task');
        var sId = btn.getAttribute('data-sub');
        var cId = btn.getAttribute('data-chap');
        var idx = Number(btn.getAttribute('data-idx'));
        var outcome = action === 'practice-pass' ? 'pass' : 'fail';
        saveRealQuestionPractice(tId, sId, cId, idx, 'review', outcome, true);
        openTaskPracticeModal(tId); // 刷新弹窗
      } else if (action === 'open-mock-modal') {
        openMockSessionModal(btn.getAttribute('data-task'));
      } else if (action === 'close-mock-modal') {
        var mBd = document.getElementById('camp21MockModalBackdrop');
        if (mBd) mBd.remove();
      } else if (action === 'open-offline-modal') {
        openOfflineInventoryModal(btn.getAttribute('data-task'));
      } else if (action === 'close-offline-modal') {
        var oBd = document.getElementById('camp21OfflineModalBackdrop');
        if (oBd) oBd.remove();
      } else if (action === 'offline-pass' || action === 'offline-fail') {
        var offTId = btn.getAttribute('data-task');
        var itId = btn.getAttribute('data-item');
        var offTask = AuditV4.taskById(allCampTasks, offTId);
        if (offTask) {
          var curAud = loadAuditV4();
          var nextAud = AuditV4.recordOffline(curAud, offTask, itId, action === 'offline-pass' ? 'pass' : 'fail');
          saveAuditV4(nextAud);
          openOfflineInventoryModal(offTId);
          renderAll();
        }
      }
    });

    container.addEventListener('change', function (e) {
      var target = e.target;
      if (!target) return;
      var action = target.getAttribute('data-action');
      var state = loadCampState();
      if (action === 'select-day') {
        state.selectedDay = Number(target.value) || 0;
        saveCampState(state);
        renderAll();
      } else if (action === 'v3-actual' || action === 'v3-mastered') {
        var rk = target.getAttribute('data-reckey');
        var val = Math.max(0, Math.floor(Number(target.value) || 0));
        if (action === 'v3-actual') {
          state.v3Actual[rk] = val;
          if ((state.v3Mastered[rk] || 0) > val) state.v3Mastered[rk] = val;
        } else {
          state.v3Mastered[rk] = Math.min(val, Math.max(0, Number(state.v3Actual[rk]) || val));
          if (!state.v3Actual[rk] && val > 0) state.v3Actual[rk] = val;
        }
        saveCampState(state);
        renderAll();
      } else if (action === 'v3-focus') {
        var dStr = String(target.getAttribute('data-day') || getActiveDayNumber());
        var subj = target.getAttribute('data-subj');
        state.netFocus[dStr] = state.netFocus[dStr] || {};
        state.netFocus[dStr][subj] = Math.max(0, Math.min(1440, Math.floor(Number(target.value) || 0)));
        saveCampState(state);
        renderAll();
      }
    });
  }

  function renderAll() {
    _chapterMapCache = null;
    ensureCampDailyGoals();
    renderWorkbenchPanel();
    renderHomeOverviewCard();
    renderCampModalContent();
  }

  // 安全挂钩学习分析日志（P1-7 / T12）
  function lastAnalyticsEvent() {
    try {
      var events = JSON.parse(window.localStorage.getItem(getPrefix() + 'study_events_v1') || '[]');
      return Array.isArray(events) && events.length ? events[events.length - 1] : null;
    } catch (_) { return null; }
  }

  function hookStudyAnalyticsSafely() {
    var analytics = window.StudyAnalytics;
    if (!analytics || typeof analytics.recordStatus !== 'function' || analytics._campV4Wrapped) return;

    var original = analytics.recordStatus;
    analytics.recordStatus = function (payload) {
      var before = lastAnalyticsEvent();
      var result = original.apply(this, arguments);
      var after = lastAnalyticsEvent();
      var saved = after && (!before || after.id !== before.id);
      var matches = saved && payload &&
        String(after.subjectId) === String(payload.subjectId) &&
        String(after.chapterId) === String(payload.chapterId) &&
        Number(after.idx) === Number(payload.idx) &&
        after.status === payload.status;

      if (matches) {
        // 查找当前题号绑定的学习任务（若有）
        try {
          var activeDay = getActiveDayNumber();
          var dayObj = getDayObj(activeDay);
          var activeTask = null;
          (dayObj.tasks || []).forEach(function (t) {
            (t.scopedItems || []).forEach(function (slice) {
              if (slice.chapterId === payload.chapterId && slice.indices && slice.indices.indexOf(Number(payload.idx)) !== -1) {
                activeTask = t;
              }
            });
          });
          if (activeTask) {
            var curAudit = loadAuditV4();
            var nextAudit = AuditV4.recordPractice(curAudit, allCampTasks, {
              kind: 'status',
              subjectId: payload.subjectId,
              chapterId: payload.chapterId,
              idx: Number(payload.idx),
              statusAfter: payload.status,
              source: 'analytics-status-hook'
            }, {
              taskId: activeTask.id,
              timestamp: Date.now(),
              allowBacklog: true
            });
            saveAuditV4(nextAudit);
          }
        } catch (e) {}
        renderAll();
      }
      return result;
    };
    analytics._campV4Wrapped = true;

    if (typeof analytics.render === 'function' && !analytics._campV4RenderWrapped) {
      var origRender = analytics.render;
      analytics.render = function () {
        var res = origRender.apply(this, arguments);
        try { renderAll(); } catch (e) {}
        return res;
      };
      analytics._campV4RenderWrapped = true;
    }
  }

  function init() {
    hookStudyAnalyticsSafely();
    renderAll();
    window.addEventListener('storage', function () {
      renderAll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.KaoyanCamp21 = {
    render: renderAll,
    openModal: openCampModal,
    getDays: function () { return CAMP21_DAYS; },
    getDayObj: getDayObj,
    getV3FullData: function () { return V3_FULL_DATA; },
    getTodayDay: getTodayCampDay,
    getActiveDay: getActiveDayNumber,
    evaluateTaskProgress: evaluateScopedV4,
    evaluateDayProgress: evaluateDayProgress,
    getFourCaliberSubjectStats: getFourCaliberSubjectStats,
    getV3QuotaStatsForDay: getV3QuotaStatsForDay,
    saveRealQuestionPractice: saveRealQuestionPractice,
    openTaskPracticeModal: openTaskPracticeModal,
    openMockSessionModal: openMockSessionModal,
    openOfflineInventoryModal: openOfflineInventoryModal,
    formatQuestionRanges: formatQuestionRanges,
    getStateKey: stateStorageKey,
    getAuditKey: auditStorageKey,
    loadState: loadCampState,
    saveState: saveCampState,
    loadAudit: loadAuditV4,
    saveAudit: saveAuditV4,
    AuditV4: AuditV4
  };
})();
