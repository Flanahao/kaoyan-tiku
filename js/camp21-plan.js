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
  "version": "3.0-all-required",
  "source": "用户2026-10-30上传PDF题库备份统计 + 原始逐日任务；非题库真实最新状态，须本地按备份校准",
  "begin": "2026-10-31",
  "end": "2026-11-20",
  "fixed_net_focus_goal_minutes": 780,
  "study_schedule_minutes": 845,
  "totals": {
    "math_truth": 226,
    "xhy": 1166,
    "880": 996,
    "36": 419,
    "30_and_1000basic": 1265,
    "politics": 1131,
    "bogo_1_8": 801,
    "bogo_ch9": 49,
    "nju851": 193,
    "hust824": 233,
    "zhima400": 400
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
      "ll880_pending_target": 40,
      "zy36_pending_target": 25,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 27,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2007/08/09",
      "major_special_scope": "波哥Ch4傅里叶；1–3章旧错题回炉",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 2,
      "date": "2026-11-01",
      "math_truth_task": "2023数一整卷22题",
      "math_truth_pending_target": 22,
      "xhy_chapter_scope": "Ch3积分剩26+Ch1极限前35",
      "xhy_pending_target": 61,
      "ll880_pending_target": 40,
      "zy36_pending_target": 25,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 44,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2015+2021剩余",
      "major_special_scope": "波哥Ch4继续；讲义与基础同步",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 3,
      "date": "2026-11-02",
      "math_truth_task": "2009非绿19题",
      "math_truth_pending_target": 19,
      "xhy_chapter_scope": "Ch1极限36–95",
      "xhy_pending_target": 60,
      "ll880_pending_target": 40,
      "zy36_pending_target": 25,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 22,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2010/11",
      "major_special_scope": "波哥Ch4收官；强化1–3章旧错",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 4,
      "date": "2026-11-03",
      "math_truth_task": "2010非绿8+2011非绿9题",
      "math_truth_pending_target": 17,
      "xhy_chapter_scope": "Ch1极限96–129+Ch2导数1–35",
      "xhy_pending_target": 69,
      "ll880_pending_target": 40,
      "zy36_pending_target": 25,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 24,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2016",
      "major_special_scope": "波哥Ch5拉氏、基础错题",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 5,
      "date": "2026-11-04",
      "math_truth_task": "2012非绿16题",
      "math_truth_pending_target": 16,
      "xhy_chapter_scope": "Ch2导数36–101",
      "xhy_pending_target": 66,
      "ll880_pending_target": 40,
      "zy36_pending_target": 25,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 21,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2012/13/14",
      "major_special_scope": "波哥Ch5收官，强化/基础",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 6,
      "date": "2026-11-05",
      "math_truth_task": "2013非绿15题",
      "math_truth_pending_target": 15,
      "xhy_chapter_scope": "Ch4微分方程57",
      "xhy_pending_target": 57,
      "ll880_pending_target": 40,
      "zy36_pending_target": 25,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 7,
      "hust824_pending_target": 12,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2017 + 南大851 2015",
      "major_special_scope": "波哥Ch5讲义与基础清零",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 7,
      "date": "2026-11-06",
      "math_truth_task": "2014非绿14题",
      "math_truth_pending_target": 14,
      "xhy_chapter_scope": "Ch5多元微分68",
      "xhy_pending_target": 68,
      "ll880_pending_target": 48,
      "zy36_pending_target": 20,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 36,
      "bogo_ch9_pending_target": 10,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "专业课模拟卷①",
      "major_special_scope": "电路D1/4：Ch9讲义10；强化Ch7 18计入波哥1–8指标",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 1,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 8,
      "date": "2026-11-07",
      "math_truth_task": "2015非绿10+2016非绿14题",
      "math_truth_pending_target": 24,
      "xhy_chapter_scope": "Ch6二重积分46+Ch7级数10",
      "xhy_pending_target": 56,
      "ll880_pending_target": 48,
      "zy36_pending_target": 20,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 20,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 20,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2018",
      "major_special_scope": "电路D2/4：Ch9习题前20+手头讲义",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 9,
      "date": "2026-11-08",
      "math_truth_task": "2017非绿15题",
      "math_truth_pending_target": 15,
      "xhy_chapter_scope": "Ch7无穷级数11–88",
      "xhy_pending_target": 78,
      "ll880_pending_target": 48,
      "zy36_pending_target": 20,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 23,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 19,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2016/17/18",
      "major_special_scope": "电路D3/4：Ch9习题后19+系统函数",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 10,
      "date": "2026-11-09",
      "math_truth_task": "2018非绿14题",
      "math_truth_pending_target": 14,
      "xhy_chapter_scope": "Ch8空间几何30+Ch9线面积分35",
      "xhy_pending_target": 65,
      "ll880_pending_target": 48,
      "zy36_pending_target": 20,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 23,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2019",
      "major_special_scope": "电路D4/4：手头资料全部完成；未清零继续挂账",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 11,
      "date": "2026-11-10",
      "math_truth_task": "2019非绿16题",
      "math_truth_pending_target": 16,
      "xhy_chapter_scope": "Ch9线面积分后36+Ch10高数20+线代Ch1前15",
      "xhy_pending_target": 71,
      "ll880_pending_target": 48,
      "zy36_pending_target": 20,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 21,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2019/2024",
      "major_special_scope": "南大期末D1/6：卷积/时域；波哥Ch6",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 12,
      "date": "2026-11-11",
      "math_truth_task": "2020非绿21题",
      "math_truth_pending_target": 21,
      "xhy_chapter_scope": "线代Ch1后20+Ch2前35",
      "xhy_pending_target": 55,
      "ll880_pending_target": 48,
      "zy36_pending_target": 20,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 26,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2020",
      "major_special_scope": "南大期末D2/6：傅里叶/采样；波哥Ch6",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 13,
      "date": "2026-11-12",
      "math_truth_task": "2021非绿11题",
      "math_truth_pending_target": 11,
      "xhy_chapter_scope": "线代Ch2后21+Ch3向量44+Ch4前10",
      "xhy_pending_target": 75,
      "ll880_pending_target": 56,
      "zy36_pending_target": 20,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 18,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2025/2026",
      "major_special_scope": "南大期末D3/6：拉氏/s域；波哥Ch6",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 14,
      "date": "2026-11-13",
      "math_truth_task": "2009–2011真题复检",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "线代Ch4后11+Ch5相似29+Ch6前35",
      "xhy_pending_target": 75,
      "ll880_pending_target": 56,
      "zy36_pending_target": 20,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 38,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "专业课模拟卷②",
      "major_special_scope": "南大期末D4/6：电路综合；波哥Ch7",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 1,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 15,
      "date": "2026-11-14",
      "math_truth_task": "2012–2014真题复检",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "线代Ch6后7+Ch7数一19+概率Ch1 18+Ch2前20",
      "xhy_pending_target": 64,
      "ll880_pending_target": 56,
      "zy36_pending_target": 20,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 28,
      "bogo_ch1to8_pending_target": 40,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2022",
      "major_special_scope": "南大期末D5/6：Z变换；波哥Ch8",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 16,
      "date": "2026-11-15",
      "math_truth_task": "2015–2017真题复检",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "概率Ch2后20+Ch3前35",
      "xhy_pending_target": 55,
      "ll880_pending_target": 56,
      "zy36_pending_target": 20,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 28,
      "bogo_ch1to8_pending_target": 40,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2023",
      "major_special_scope": "南大期末D6/6：全部题量清零；波哥强化1–3旧错",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 17,
      "date": "2026-11-16",
      "math_truth_task": "2018–2020真题复检",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "概率Ch3后10+Ch4数字特征49",
      "xhy_pending_target": 59,
      "ll880_pending_target": 56,
      "zy36_pending_target": 20,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 28,
      "bogo_ch1to8_pending_target": 40,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2024",
      "major_special_scope": "波哥1–8剩余所有待绿题+芝麻400",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 18,
      "date": "2026-11-17",
      "math_truth_task": "2021–2023真题复检",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "概率Ch5 13+Ch6 20+Ch7 21+Ch8 22",
      "xhy_pending_target": 76,
      "ll880_pending_target": 56,
      "zy36_pending_target": 20,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 44,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 40,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "南大851 2020–23全部待绿",
      "major_special_scope": "波哥1–8剩余所有待绿题+芝麻400",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 19,
      "date": "2026-11-18",
      "math_truth_task": "2009–2023全部342题错题抽检",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "高数错题复检",
      "xhy_pending_target": 0,
      "ll880_pending_target": 44,
      "zy36_pending_target": 10,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 0,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 40,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "华科824 2015–19错题盲刷",
      "major_special_scope": "电路专题全量查缺、手头资料复做",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 20,
      "date": "2026-11-19",
      "math_truth_task": "2009–2023全部342题终验",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "线代/概率错题复检",
      "xhy_pending_target": 0,
      "ll880_pending_target": 44,
      "zy36_pending_target": 10,
      "zy30_and_zy1000basic_pending_target": 60,
      "nju851_pending_target": 10,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 40,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 20,
      "politics_pending_target": 55,
      "major_exam_block": "南大851对账补遗+华科2020–24二刷",
      "major_special_scope": "南大期末题全量查缺、手头资料复做",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 0,
      "historic_green_recheck_target": 38,
      "zy30_pending_target": 36,
      "zy1000basic_pending_target": 24
    },
    {
      "day": 21,
      "date": "2026-11-20",
      "math_truth_task": "数学真题全卷结果与错因总验收",
      "math_truth_pending_target": 0,
      "xhy_chapter_scope": "全书绿标验收",
      "xhy_pending_target": 0,
      "ll880_pending_target": 44,
      "zy36_pending_target": 9,
      "zy30_and_zy1000basic_pending_target": 65,
      "nju851_pending_target": 0,
      "hust824_pending_target": 0,
      "bogo_ch1to8_pending_target": 43,
      "bogo_ch9_pending_target": 0,
      "zhima400_firstpass_target": 0,
      "politics_pending_target": 31,
      "major_exam_block": "专业课模拟卷③+全科验收",
      "major_special_scope": "波哥1–9全部+芝麻400+各校真题总验收",
      "english": "作文背默30min + 阅读50min",
      "politics_audio": "通勤15min + 午饭散步15min（合计30min，不计入净专注）",
      "mock_exam": 1,
      "historic_green_recheck_target": 41,
      "zy30_pending_target": 39,
      "zy1000basic_pending_target": 26
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
    { key: 'll880_pending_target', id: 'll880', label: '《李林880》23章(待绿)', total: 996, green: 185, bookTotal: 1181, cat: 'math' },
    { key: 'zy36_pending_target', id: 'zy36', label: '《强化36讲》36章(待绿)', total: 419, green: 42, bookTotal: 461, cat: 'math' },
    { key: 'zy30_pending_target', id: 'zy30', label: '《基础30讲》30章(待核验)', total: 759, green: 113, bookTotal: 872, cat: 'math' },
    { key: 'zy1000basic_pending_target', id: 'zy1000b', label: '《1000题基础篇》31章(待核验)', total: 506, green: 44, bookTotal: 550, cat: 'math' },
    { key: 'nju851_pending_target', id: 'nju851', label: '南大851真题20套(待绿)', total: 193, green: 36, bookTotal: 229, cat: 'major' },
    { key: 'hust824_pending_target', id: 'hust824', label: '华科824近10套(待绿)', total: 233, green: 2, bookTotal: 235, cat: 'major' },
    { key: 'bogo_ch1to8_pending_target', id: 'bogo18', label: '波哥1-8章讲义/习题/强化(待绿)', total: 801, green: 193, bookTotal: 994, cat: 'major' },
    { key: 'bogo_ch9_pending_target', id: 'bogo9', label: '波哥Ch9电路讲义10+习题39', total: 49, green: 3, bookTotal: 49, cat: 'major' },
    { key: 'zhima400_firstpass_target', id: 'zhima400', label: '《芝麻400题》全书覆盖', total: 400, green: 0, bookTotal: 400, cat: 'major' },
    { key: 'politics_pending_target', id: 'politics', label: '《27肖1000》52章(待绿)', total: 1131, green: 17, bookTotal: 1148, cat: 'politics' },
    { key: 'historic_green_recheck_target', id: 'recheck801', label: '🟢历史已绿题全科复检队列', total: 801, green: 801, bookTotal: 801, cat: 'recheck' }
  ];

  // 13.5h+ 铁血作息时间块（含午饭、午休、晚饭、22:00闭馆通勤）
  var CAMP21_SCHEDULE_SLOTS = [
    { start: '07:20', end: '08:00', dur: '40m', scene: '居家/通勤', title: '起床 + 高蛋白早餐 + 赶赴图书馆（路上耳机听政治带背15m）', target: '绝不赖床，路上完成第1段政治带背输入' },
    { start: '08:00', end: '08:30', dur: '30m', scene: '图书馆', title: '【英语·早间开机】大小作文功能句背诵 + 动笔默写', target: '默写昨日模板句 + 背熟今日功能段' },
    { start: '08:30', end: '11:30', dur: '3h00m', scene: '图书馆·考场块', title: '🔥【数学·真题3h大整块】09–23真题模考/非绿题重做 + 余时无缝接《邂逅遗憾》', target: '22/23年3h全真模考；09–21年清零每套非绿题，剩余时间直接刷《邂逅遗憾》', hot: true },
    { start: '11:30', end: '12:15', dur: '45m', scene: '图书馆', title: '【数学·邂逅遗憾(上)】继续推进《邂逅遗憾》当日新题', target: '连同上午结余时间，中午前拿下 20–25 道《邂逅遗憾》' },
    { start: '12:15', end: '13:25', dur: '70m', scene: '餐厅/图书馆', title: '🍱 午饭(35m，散步听政治带背15m) + 💤 强制午休趴睡(30m) + 洗脸开机(5m)', target: '必须闭眼睡够25–30m，确保下午14:00满血考场状态' },
    { start: '13:25', end: '14:00', dur: '35m', scene: '图书馆', title: '【政治·上半场】《27肖1000题》新刷 30 题', target: '用30道选择题快速拉起午睡后的专注度' },
    { start: '14:00', end: '17:00', dur: '3h00m', scene: '图书馆·考场块', title: '🔥【专业课·真题/模拟卷3h大整块】华科824(1套) / 模拟卷(1套) / 南大851(2–3套小卷)', target: '严格按3h考场标准动笔算完 + 当场批改订正打标', hot: true },
    { start: '17:00', end: '17:50', dur: '50m', scene: '图书馆', title: '【英语·阅读精读】1–2篇真题阅读 + 网站生词本复盘', target: '3h高强度理工计算后，用英语阅读给大脑换挡' },
    { start: '17:50', end: '18:30', dur: '40m', scene: '餐厅', title: '🍜 晚饭时间（错峰干饭不排队，7分饱，快走回馆）', target: '严禁晚饭看剧刷短视频，18:30准时坐回座位' },
    { start: '18:30', end: '19:00', dur: '30m', scene: '图书馆', title: '【政治·下半场】《27肖1000题》新刷 25 题 + 复盘10道错题标绿', target: '凑齐每日52–55题定额，顺手清掉马原/各科黄红错题' },
    { start: '19:00', end: '20:45', dur: '1h45m', scene: '图书馆', title: '🔥【数学·邂逅遗憾(下)】集中火力推进《邂逅遗憾》主干章', target: '晚间再拿下 30–35 道《邂逅遗憾》（全天合计约55题）', hot: true },
    { start: '20:45', end: '22:00', dur: '1h15m', scene: '图书馆', title: '🔥【专业课·专题与波哥攻坚】波哥4–9章 & ⚡电路专题 & 🎓南大期末题 & 📚芝麻400题', target: 'W1波哥傅氏/拉氏；Day6-10⚡电路专题必搞；Day11-16🎓南大期末题必搞；W3芝麻400', hot: true },
    { start: '22:00', end: '22:50', dur: '50m', scene: '闭馆/回家', title: '🚲 闭馆回家 + 到家立刻洗澡换睡衣', target: '进门先洗澡，绝不躺床看手机！22:50准时坐上书桌' },
    { start: '22:50', end: '00:15', dur: '1h25m', scene: '居家·深夜局', title: '🔥【数学·收尾风暴】45m《36讲》线代概率/《880》错题 + 25m《30讲/1000题》点绿 + 15m汇报', target: '每天干掉36讲/880约 20–30 题 + 纸质已做题点绿 2–3 讲', hot: true }
  ];

  // 21天（含Day 0今晚预热）完整作战计划表（Part 1: Day 0 ~ Day 10）
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
            "label": "邂逅高数第3章·积分(21道未标)"
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
            "taskType": "clear_unmarked"
          }
        ]
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
            "label": "波哥习题集第4章(15道未标)"
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
            "taskType": "clear_unmarked"
          }
        ]
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
            "label": "30讲高数第1讲(48道未标)"
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d1_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "【3h全真模考】2022年数一真题(22题全新) + 邂逅第3章积分未标收尾",
        "desc": "08:30-11:30严格掐表3h完成2022年真题并批改标绿；11:30-12:15清完邂逅第3章剩余未标题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2022",
            "label": "22年数一真题(22题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章·积分(错题前15道)"
          }
        ],
        "targetCount": 37,
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章·积分(错题前15道)",
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
              32
            ],
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d1_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【南大851三套连刷】2007年(11题) + 2008年(11题) + 2009年(11题)",
        "desc": "早期南大真题每套题量精炼（07剩10非绿、08剩6非绿、09全11题），3小时整块连刷3套并全部订正标绿！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_07",
            "label": "南大07真题"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_08",
            "label": "南大08真题"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_09",
            "label": "南大09真题"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d1_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》高数第3章积分：清零61道🟡/🔴错题（上半场35题）",
        "desc": "把第3章积分之前做出的35道模糊+26道不会题逐题重算，今晚至少把绿标推到105题以上！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章·积分(错题中25道)"
          }
        ],
        "targetCount": 25,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章·积分(错题中25道)",
            "indices": [
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d1_p_ev",
        "cat": "major",
        "catLabel": "专业课·晚间1h15m",
        "time": "20:45–22:00",
        "title": "波哥第4章傅里叶(上)：强化习题集第4章(前30题) + 基础习题集第4章错题(前15题)",
        "desc": "强化第4章共68题（已绿6题），今晚推进至30题；同时清理基础习题集第4章的黄红错题。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_04",
            "label": "波哥强化第4章(前30道非绿)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_04",
            "label": "波哥习题集第4章(错题前15道)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d1_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》马原导论+第1章(前55题) + 复盘第4章10道错题 + 通勤带背30m",
        "desc": "午休后35m刷30题，晚饭后30m刷25题+复盘马原第4章已有的黄红错题，通勤听带背。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100402",
            "label": "马原·导论(9题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100403",
            "label": "马原·第1章(题1–46)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100406",
            "label": "马原·第4章政经(错题前10道)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d1_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大小作文功能段背默(30m) + 下午真题阅读精读2篇 & 生词本复盘(50m)",
        "desc": "08:00-08:30动笔默写作文模板；17:00-17:50精读阅读并收录生词。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2024",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d1_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《强化36讲》线代第1–3讲(行列式/余子式/矩阵，共25道非绿) + 《基础30讲》高数第2讲(29道非绿)过筛点绿",
        "desc": "45m把36讲线代前3讲（待绿23题）全部刷完标绿；25m将纸质已做的30讲高数第1–2讲快速过筛点绿！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch49",
            "label": "36讲线代第1讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch50",
            "label": "36讲线代第2讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch51",
            "label": "36讲线代第3讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch2",
            "label": "30讲高数第2讲"
          }
        ],
        "targetCount": 49,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch49",
            "label": "36讲线代第1讲",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch50",
            "label": "36讲线代第2讲",
            "indices": [
              0,
              1,
              3
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch51",
            "label": "36讲线代第3讲",
            "indices": [
              0,
              3,
              5,
              6,
              7,
              8,
              10,
              11,
              12,
              16,
              17,
              18,
              19
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch2",
            "label": "30讲高数第2讲",
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d2_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "【3h全真模考】2023年数一真题(22题全新) + 邂逅第3章积分最后26道错题清零(第3章100%全绿！)",
        "desc": "08:30-11:30全真模考2023年真题并订正标绿；11:30-12:15把邂逅第3章积分推到132/132全绿收官！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2023",
            "label": "23年数一真题(22题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章·积分(最后21道错题收官)"
          }
        ],
        "targetCount": 43,
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章·积分(最后21道错题收官)",
            "indices": [
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d2_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【华科824】2015年真题(18题全真) + 2021年真题扫尾(清8未标+18错题)",
        "desc": "3小时整块完成华科2015年全套18题，并把之前做了一半的华科2021年真题彻底清零标绿！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_15",
            "label": "华科15真题(18题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_21",
            "label": "华科21真题(28题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d2_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》高数第1章 极限与函数性质（推进前40题，题1–40）",
        "desc": "邂逅第1章共129题，今晚正式开刷第1章，高强度拿下前40题并标绿！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅高数第1章(题1–40)"
          }
        ],
        "targetCount": 40,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅高数第1章(题1–40)",
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d2_p_ev",
        "cat": "major",
        "catLabel": "专业课·晚间1h15m",
        "time": "20:45–22:00",
        "title": "波哥第4章傅里叶(中)：强化第4章(推至50题) + 基础习题集第4章(74题全部清零全绿！)",
        "desc": "把波哥基础习题集第4章剩余错题全部干掉实现74/74全绿，强化第4章推进到50题。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_04",
            "label": "波哥强化第4章(中20道非绿)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_04",
            "label": "波哥习题集第4章(最后12道错题收官)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d2_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》马原第1章收尾(后37题) + 第2章认识论(前20题) + 复盘第4章错题",
        "desc": "确保马原第1章83题全部刷完标绿，并开启第2章认识论。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100403",
            "label": "马原·第1章(题47–83收官)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100404",
            "label": "马原·第2章(题1–20)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d2_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间小作文格式与模板背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "坚持每天早晚各一段英语输入输出，保持语感不断档。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2024",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d2_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《强化36讲》线代第4–6讲(秩/方程组/向量组，共26题) + 《基础30讲》高数第3–4讲点绿",
        "desc": "45m刷完36讲线代第4–6讲26道题；25m将30讲高数第3–4讲（48题）快速过筛点绿。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch52",
            "label": "36讲线代第4讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch53",
            "label": "36讲线代第5讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch54",
            "label": "36讲线代第6讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch3",
            "label": "30讲高数第3讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch4",
            "label": "30讲高数第4讲"
          }
        ],
        "targetCount": 74,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch52",
            "label": "36讲线代第4讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch53",
            "label": "36讲线代第5讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch54",
            "label": "36讲线代第6讲",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch3",
            "label": "30讲高数第3讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch4",
            "label": "30讲高数第4讲",
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d3_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "2009年数一真题(19道非绿题重做清零) + 无缝接《邂逅遗憾》高数第1章(推至65题)",
        "desc": "09年真题共19道🟡/🔴题，用1.5h–2h全部重算变绿；剩余时间+11:30后推进邂逅第1章25题！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2009",
            "label": "09年数一真题(23题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅高数第1章(题41–65)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d3_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【南大851两套连刷】2010年真题(11题) + 2011年真题(11题)",
        "desc": "下午3h考场块完整拿下南大10、11两年真题共22道大题，当场订正全部标绿。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_10",
            "label": "南大10真题(11题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_11",
            "label": "南大11真题(11题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d3_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》高数第1章 极限与函数性质（推进至95题）",
        "desc": "晚间再攻克30道极限题，第1章129题已完成近3/4！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅高数第1章(题66–95)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d3_p_ev",
        "cat": "major",
        "catLabel": "专业课·晚间1h15m",
        "time": "20:45–22:00",
        "title": "波哥第4章傅里叶(收官)：强化第4章(后18题收官) + 讲义第4章34题过筛全绿",
        "desc": "今晚彻底拿下波哥第4章傅里叶变换（讲义+习题集+强化习题集三书全绿）！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_04",
            "label": "波哥强化第4章(后12道非绿收官)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_04",
            "label": "波哥讲义第4章(35题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d3_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》马原第2章认识论收官(后39题) + 第3章唯物史观(前16题)",
        "desc": "完成马原第2章全部59题并开启第3章，复盘10道错题。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100404",
            "label": "马原·第2章(题21–59收官)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100405",
            "label": "马原·第3章(题1–16)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d3_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大作文首段与图画描述背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "保持每日80分钟英语高效输入输出。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2023",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d3_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《强化36讲》线代第7–9讲(特征值/相似/二次型，🎉36讲线代全书收官！) + 《30讲》高数第5–6讲点绿",
        "desc": "今晚刷完ch55–ch57（待绿27题），仅用3天彻底干完《强化36讲》线代全篇！同时点绿30讲第5–6讲。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch55",
            "label": "36讲线代第7讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch56",
            "label": "36讲线代第8讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch57",
            "label": "36讲线代第9讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch5",
            "label": "30讲高数第5讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch6",
            "label": "30讲高数第6讲"
          }
        ],
        "targetCount": 82,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch55",
            "label": "36讲线代第7讲",
            "indices": [
              0,
              1,
              2,
              3
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch56",
            "label": "36讲线代第8讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch57",
            "label": "36讲线代第9讲",
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
              14
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch5",
            "label": "30讲高数第5讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch6",
            "label": "30讲高数第6讲",
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d4_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "2010年(8道非绿) + 2011年(9道非绿) 真题并刷全绿 + 邂逅第1章收官(题96–129，🎉第1章全绿！)",
        "desc": "10、11两年合计仅17道非绿题，上午一并清零标绿；随后把邂逅第1章最后34题全部干完收官！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2010",
            "label": "10年数一真题(23题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2011",
            "label": "11年数一真题(23题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅高数第1章(题96–129收官)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d4_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【华科824】2016年真题(24题) 3h全真模考 + 订正标绿",
        "desc": "严格3小时考场标准拿下华科2016年真题24题，做完立刻批改并把错题标黄/红、掌握题标绿。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_16",
            "label": "华科16真题(24题)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d4_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》高数第2章 导数（推进前35题，题1–35）",
        "desc": "邂逅第2章导数共101题，今晚拿下前35题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_02",
            "label": "邂逅高数第2章(题1–35)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d4_p_ev",
        "cat": "major",
        "catLabel": "专业课·晚间1h15m",
        "time": "20:45–22:00",
        "title": "波哥第5章拉氏变换(上)：强化第5章(前19题) + 基础习题集第5章(清前30道错题)",
        "desc": "拉氏变换是后面电路专题的基石！今晚做强化第5章前19题，并把习题集第5章绿标从21推到51题。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_05",
            "label": "波哥强化第5章(前19题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_05",
            "label": "波哥习题集第5章(前30道错题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d4_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》马原第3章唯物史观收官(后40题) + 第4章政经(清20未标+15错题)",
        "desc": "马原第3章56题全绿收官，同时清理马原第4章政经剩余20道未标题与错题。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100405",
            "label": "马原·第3章(题17–56收官)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100406",
            "label": "马原·第4章政经(20未标+15错题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d4_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大作文中间论证段背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "背熟因果分析与举例论证黄金句型，下午精读阅读。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2023",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d4_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《强化36讲》概率第1–3讲(事件/一维随机变量，共28题) + 《30讲》高数第7–8讲点绿",
        "desc": "正式启动36讲概率篇（ch58–ch60共28题），同时将30讲高数第7–8讲（35题）过筛点绿。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch58",
            "label": "36讲概率第1讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch59",
            "label": "36讲概率第2讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch60",
            "label": "36讲概率第3讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch7",
            "label": "30讲高数第7讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch8",
            "label": "30讲高数第8讲"
          }
        ],
        "targetCount": 63,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch58",
            "label": "36讲概率第1讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch59",
            "label": "36讲概率第2讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch60",
            "label": "36讲概率第3讲",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch7",
            "label": "30讲高数第7讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch8",
            "label": "30讲高数第8讲",
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d5_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "2012年数一真题(16道非绿题重做清零) + 邂逅高数第2章导数(推至65题)",
        "desc": "上午清零2012年真题16道🟡/🔴题，余下时间推进《邂逅遗憾》高数第2章30题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2012",
            "label": "12年数一真题(23题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_02",
            "label": "邂逅高数第2章(题36–65)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d5_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【南大851三套连刷】2012年(7题) + 2013年(7题) + 2014年(7题)",
        "desc": "12–14年南大真题每套7道大题（合计21题），3小时整块一气呵成刷完并订正标绿！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_12",
            "label": "南大12真题(7题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_13",
            "label": "南大13真题(7题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_14",
            "label": "南大14真题(7题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d5_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》高数第2章 导数（后36题，🎉第2章101题全绿收官！）",
        "desc": "今晚干掉第2章最后36题，邂逅高数前3章（极限+导数+积分共362题）全部攻克！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_02",
            "label": "邂逅高数第2章(题66–101收官)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d5_p_ev",
        "cat": "major",
        "catLabel": "专业课·晚间1h15m",
        "time": "20:45–22:00",
        "title": "波哥第5章拉氏变换(收官)：强化第5章(后18题收官) + 习题集第5章(清剩余36道错题) + 讲义第5章(15错题)",
        "desc": "把拉氏变换三本书剩余错题一网打尽，为明晚正式启动「⚡电路专题」扫清一切障碍！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_05",
            "label": "波哥强化第5章(后18题收官)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_05",
            "label": "波哥习题集第5章(后36道错题收官)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_05",
            "label": "波哥讲义第5章(51题收官)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d5_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》马原第5章(44题) + 第6章(前15题) + 复盘第4章政经错题",
        "desc": "推进马原第5、6章资本主义发展与社会主义规律共59题。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100407",
            "label": "马原·第5章(44题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100408",
            "label": "马原·第6章(题1–15)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d5_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大作文结尾总结段背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "完成大作文三段式闭环合练。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2022",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d5_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《强化36讲》概率第4–6讲(多维随机变量与数字特征，共23题) + 《30讲》高数第9–10讲点绿",
        "desc": "45m刷完36讲概率ch61–ch63（23题）；25m点绿30讲高数第9–10讲（含第10讲15道错题快速复盘）。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch61",
            "label": "36讲概率第4讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch62",
            "label": "36讲概率第5讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch63",
            "label": "36讲概率第6讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch9",
            "label": "30讲高数第9讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch10",
            "label": "30讲高数第10讲"
          }
        ],
        "targetCount": 84,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch61",
            "label": "36讲概率第4讲",
            "indices": [
              0,
              1,
              2,
              3
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch62",
            "label": "36讲概率第5讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch63",
            "label": "36讲概率第6讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch9",
            "label": "30讲高数第9讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch10",
            "label": "30讲高数第10讲",
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
              12,
              13,
              20,
              22
            ],
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d6_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "2013年数一真题(15道非绿题重做清零) + 邂逅高数第4章微分方程(前25题)",
        "desc": "上午清零2013年真题15道错题，随后开启邂逅第4章微分方程（共59题）前25题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2013",
            "label": "13年数一真题(23题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_04",
            "label": "邂逅高数第4章(前25道非绿)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d6_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【华科824 + 南大851】华科2017年真题(12题) + 南大2015年真题(7题)",
        "desc": "华科17年(12题)与南大15年(7题)合计19题，3小时整块完美匹配！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_17",
            "label": "华科17真题(12题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_15",
            "label": "南大15真题(7题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d6_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》高数第4章 微分方程（后34题，🎉第4章59题全绿收官！）",
        "desc": "今晚一鼓作气把邂逅第4章微分方程全部刷完标绿！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_04",
            "label": "邂逅高数第4章(后32道非绿收官)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d6_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "⚡电路专题必搞 (1/5)",
        "time": "20:45–22:00",
        "title": "⚡【电路专题Day 1】手头《电路专题》讲义核心模型 + 波哥讲义第9章电路专题(10道错题清零)",
        "desc": "紧接拉氏变换刚刷完的热度，今晚正式启动【电路专题】！先吃透手头电路专题资料第1部分 + 清零波哥讲义第9章10题。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_09",
            "label": "波哥讲义第9章·电路专题(10题)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d6_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》马原第6–7章收官 + 毛中特导论与第1–2章(共57题)",
        "desc": "今日马原新题全部刷完！正式切入毛中特导论与第1–2章。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100408",
            "label": "马原·第6章(题16–26收官)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100409",
            "label": "马原·第7章(6题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100410",
            "label": "毛中特·导论"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100411",
            "label": "毛中特·第1章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100412",
            "label": "毛中特·第2章(37题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d6_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大小作文整篇限时默写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "脱离模板独立默写1篇大作文框架，下午精读阅读。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2022",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d6_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《强化36讲》概率第7–9讲(大数定律/统计量/参数估计，🎉36讲概率全书收官！) + 《30讲》高数第11–12讲点绿",
        "desc": "今晚刷完ch64–ch66（20题），至此《强化36讲》线代+概率全部清零全绿！同时点绿30讲第11–12讲。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch64",
            "label": "36讲概率第7讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch65",
            "label": "36讲概率第8讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch66",
            "label": "36讲概率第9讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch11",
            "label": "30讲高数第11讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch12",
            "label": "30讲高数第12讲"
          }
        ],
        "targetCount": 45,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch64",
            "label": "36讲概率第7讲",
            "indices": [
              0,
              1,
              2
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch65",
            "label": "36讲概率第8讲",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch66",
            "label": "36讲概率第9讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch11",
            "label": "30讲高数第11讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch12",
            "label": "30讲高数第12讲",
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d7_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "2014年数一真题(14道非绿题重做清零) + 邂逅高数第5章多元微分(前28题)",
        "desc": "上午清零14年真题14道错题，无缝切入邂逅第5章多元微分（共68题）前28题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2014",
            "label": "14年数一真题(23题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_05",
            "label": "邂逅高数第5章(题1–28)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d7_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h模考",
        "time": "14:00–17:00",
        "title": "🔥【专业课模拟卷(一)】3h全真模考（可选手头模拟卷1 或 网站刺猬哥/芝麻模拟卷一）",
        "desc": "第一周周五下午14:00-17:00全真模拟！可刷手头纸质模拟卷(一)或网站内26模拟卷一，当场批改复盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_mn_26_01",
            "label": "26刺猬哥预测卷(一)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_01",
            "label": "26芝麻模拟卷(一)"
          }
        ],
        "offlineLabel": "专业课模拟卷(一) 3h模考+订正",
        "offlineTarget": 1,
        "special": true,
        "isOptionalOnlineMock": true,
        "scopedItems": []
      },
      {
        "id": "d7_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》高数第5章 多元微分（后40题，🎉第5章68题全绿收官！）",
        "desc": "第一周结束前拿下邂逅第5章多元微分全部68题！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_05",
            "label": "邂逅高数第5章(题29–68收官)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d7_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "⚡电路专题必搞 (2/5)",
        "time": "20:45–22:00",
        "title": "⚡【电路专题Day 2】手头《电路专题》典型题攻坚 + 波哥强化习题集第7章电路专题(题1–10)",
        "desc": "继续推进手头《电路专题》第2部分，并完成波哥强化习题集第7章电路专题前10题。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_07",
            "label": "波哥强化第7章·电路(前10题)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d7_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》毛中特第3–6章(55题) + 马原第4章政经错题清零",
        "desc": "刷完毛中特第3–6章共55题，同时把马原第4章残余错题再清15道。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100413",
            "label": "毛中特·第3章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100414",
            "label": "毛中特·第4章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100415",
            "label": "毛中特·第5章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100416",
            "label": "毛中特·第6章"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100415",
            "label": "毛中特·第5章",
            "indices": [
              0,
              1
            ],
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d7_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间第一周作文模板总复盘默写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "复盘本周背诵的所有大小作文语料。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2021",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d7_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《李林880》高数第2章微分(54道🟡/🔴错题，清前30题) + 《30讲》高数第13–14讲点绿",
        "desc": "36讲线代概率已收官！今晚切入880高数错题二刷（ch159现有36绿+54错题，今晚推至66绿），并点绿30讲第13–14讲。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch159",
            "label": "880高数第2章(前30道错题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch13",
            "label": "30讲高数第13讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch14",
            "label": "30讲高数第14讲"
          }
        ],
        "targetCount": 86,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch159",
            "label": "880高数第2章(前30道错题)",
            "indices": [
              2,
              5,
              7,
              8,
              9,
              14,
              15,
              16,
              17,
              18,
              20,
              24,
              27,
              28,
              29,
              32,
              33,
              34,
              35,
              36,
              38,
              39,
              40,
              41,
              42,
              43,
              49,
              51,
              52,
              53
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch13",
            "label": "30讲高数第13讲",
            "indices": [
              3,
              4,
              5,
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch14",
            "label": "30讲高数第14讲",
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d8_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "2015年(10道非绿) + 2016年(14道非绿) 真题并刷全绿 + 邂逅第6章二重积分(前20题)",
        "desc": "15、16两年合计24道非绿题，上午3h整块全部重做标绿；11:30后推进邂逅第6章二重积分前20题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2015",
            "label": "15年数一真题(23题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2016",
            "label": "16年数一真题(23题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_06",
            "label": "邂逅高数第6章(题1–20)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d8_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【华科824】2018年真题(20题) 3h全真模考 + 订正标绿",
        "desc": "3小时考场标准拿下华科2018年真题20题，当场批改复盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_18",
            "label": "华科18真题(20题)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d8_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》高数第6章二重积分(后26题收官) + 第7章无穷级数(前10题)",
        "desc": "今晚把第6章二重积分46题全部收官，并开启数一重头戏第7章无穷级数！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_06",
            "label": "邂逅高数第6章(题21–46收官)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_07",
            "label": "邂逅高数第7章(题1–10)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d8_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "⚡电路专题必搞 (3/5)",
        "time": "20:45–22:00",
        "title": "⚡【电路专题Day 3】手头《电路专题》综合大题 + 波哥强化第7章电路专题(后8题，🎉强化电路收官！)",
        "desc": "完成波哥强化习题集第7章电路专题全部18题，并推进手头《电路专题》第3部分综合题！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_07",
            "label": "波哥强化第7章·电路(后8题收官)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d8_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》毛中特第7–8章收官 + 新思想导论与第1–4章(共53题)",
        "desc": "毛中特全篇收官！正式进入新思想前4章。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100417",
            "label": "毛中特·第7章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100418",
            "label": "毛中特·第8章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100421",
            "label": "新思想·导论"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100422",
            "label": "新思想·第1章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100423",
            "label": "新思想·第2章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100424",
            "label": "新思想·第3章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100425",
            "label": "新思想·第4章"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d8_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间图表/材料作文模板背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "兼顾英语一新题型/图表转换句式。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2021",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d8_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《李林880》高数第2章错题收尾(后24题) + 第3章积分错题(前10题) + 《30讲》高数第15–16讲点绿",
        "desc": "把880高数第2章已做错题全部清零（达90绿），开启第3章积分错题，同时点绿30讲第15–16讲。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch159",
            "label": "880高数第2章(后24道错题收官)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch160",
            "label": "880高数第3章(前10道错题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch15",
            "label": "30讲高数第15讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch16",
            "label": "30讲高数第16讲"
          }
        ],
        "targetCount": 115,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch159",
            "label": "880高数第2章(后24道错题收官)",
            "indices": [
              55,
              56,
              57,
              60,
              68,
              69,
              80,
              82,
              88,
              91,
              92,
              93,
              97,
              98,
              99,
              102,
              103,
              104,
              106,
              107,
              109,
              111,
              112,
              113
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch160",
            "label": "880高数第3章(前10道错题)",
            "indices": [
              1,
              2,
              6,
              9,
              10,
              11,
              12,
              15,
              17,
              18
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch15",
            "label": "30讲高数第15讲",
            "indices": [
              2,
              4,
              5,
              6,
              7,
              9,
              10,
              11,
              12,
              13,
              16,
              18,
              19,
              20,
              21,
              22,
              25,
              26,
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch16",
            "label": "30讲高数第16讲",
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
              38,
              39,
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d9_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "2017年数一真题(15道非绿，含11未标) 重做清零 + 邂逅第7章无穷级数(推至45题)",
        "desc": "17年真题有11道未标题+4道错题，上午精做标绿；随后推进邂逅第7章无穷级数35题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2017",
            "label": "17年数一真题(23题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_07",
            "label": "邂逅高数第7章(题11–45)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d9_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【南大851三套连刷】2016年(7题) + 2017年(7题) + 2018年(9题)",
        "desc": "16–18年南大真题合计23题，下午3h考场块完整刷完并订正标绿！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_16",
            "label": "南大16真题(7题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_17",
            "label": "南大17真题(7题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_18",
            "label": "南大18真题(9题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d9_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》高数第7章 无穷级数（后43题，🎉第7章88题全绿收官！）",
        "desc": "今晚彻底攻克邂逅高数第7章无穷级数88题！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_07",
            "label": "邂逅高数第7章(题46–88收官)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d9_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "⚡电路专题必搞 (4/5)",
        "time": "20:45–22:00",
        "title": "⚡【电路专题Day 4】波哥习题集第9章电路专题(39题，清前20道🟡/🔴错题) + 手头电路专题难题攻克",
        "desc": "波哥习题集第9章电路专题共有37道黄红错题，今晚先干掉前20道，结合手头电路专题资料彻底吃透等效电路与运算电路！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_09",
            "label": "波哥习题集第9章·电路(前20道错题)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d9_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》新思想第5–7章(改革开放/高质量发展/科教人才，共59题)",
        "desc": "刷完新思想第5–7章59题，当场复盘错题标绿。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100426",
            "label": "新思想·第5章(17题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100427",
            "label": "新思想·第6章(33题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100428",
            "label": "新思想·第7章(9题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d9_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间小作文建议信/投诉信/邀请信背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "巩固小作文高频信件类型。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2020",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d9_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《李林880》高数第3章积分错题(推进30道，达70绿) + 《30讲》高数第17–18讲点绿(🎉30讲高数全绿！)",
        "desc": "继续清理880第3章积分错题；同时点绿30讲高数最后两讲（第17–18讲），30讲高数18讲全部点绿收官！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch160",
            "label": "880高数第3章(中30道错题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch17",
            "label": "30讲高数第17讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch18",
            "label": "30讲高数第18讲(收官)"
          }
        ],
        "targetCount": 82,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch160",
            "label": "880高数第3章(中30道错题)",
            "indices": [
              23,
              24,
              25,
              26,
              31,
              32,
              35,
              44,
              45,
              46,
              49,
              51,
              54,
              55,
              57,
              59,
              62,
              63,
              64,
              69,
              70,
              71,
              72,
              73,
              76,
              78,
              79,
              80,
              81,
              82
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch17",
            "label": "30讲高数第17讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch18",
            "label": "30讲高数第18讲(收官)",
            "indices": [
              0,
              1,
              2,
              4,
              5,
              8,
              10,
              12,
              13,
              14,
              15,
              16,
              18,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28,
              29,
              31,
              33,
              35,
              36,
              37,
              38,
              39,
              40
            ],
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d10_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "2018年数一真题(14道非绿题重做清零) + 邂逅高数第8章空间几何(全章30题全绿收官！)",
        "desc": "上午清零18年真题14道错题，随后把邂逅第8章空间几何30题全部拿下！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2018",
            "label": "18年数一真题(23题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_08",
            "label": "邂逅第8章·空间几何(30题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d10_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【华科824】2019年真题(23题) 3h全真模考 + 订正标绿",
        "desc": "下午3h整块完成华科2019年真题23题并批改复盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_19",
            "label": "华科19真题(23题)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d10_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》高数第9章 三重积分和线面积分（前35题，题1–35）",
        "desc": "数一压轴大题核心区！今晚专注攻克邂逅第9章前35题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_09",
            "label": "邂逅高数第9章(题1–35)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d10_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "⚡电路专题必搞 (5/5收官)",
        "time": "20:45–22:00",
        "title": "⚡【电路专题Day 5收官】波哥习题集第9章电路专题(清后17道错题) + 手头《电路专题》100%通关！",
        "desc": "今晚彻底清零波哥习题集第9章(39/39全绿)，连同讲义第9章(10/10)、强化第7章(18/18)与手头《电路专题》全部搞定！明晚正式接棒【🎓南大期末题】！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_09",
            "label": "波哥习题集第9章·电路(后17道错题收官)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d10_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》新思想第8–10章(民主/法治/文化强国，共52题)",
        "desc": "刷完新思想第8–10章52题并复盘错题。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100429",
            "label": "新思想·第8章(24题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100430",
            "label": "新思想·第9章(10题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100431",
            "label": "新思想·第10章(18题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d10_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大作文人生哲理/文化交流主题背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "背诵高频主题词群与万能例证。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2020",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d10_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《李林880》高数第3章错题清零(达85绿) + 第9章线面错题(前20题) + 《30讲》线代第1–3讲点绿",
        "desc": "把880第3章已做错题全部清零，并启动第9章线面积分错题；同时点绿30讲线代前3讲。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch160",
            "label": "880高数第3章(后15道错题+50未标)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch166",
            "label": "880高数第9章(前20道错题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch19",
            "label": "30讲线代第1讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch20",
            "label": "30讲线代第2讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch21",
            "label": "30讲线代第3讲"
          }
        ],
        "targetCount": 143,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch160",
            "label": "880高数第3章(后15道错题+50未标)",
            "indices": [
              83,
              84,
              86,
              87,
              88,
              89,
              90,
              94,
              95,
              96,
              97,
              100,
              103,
              106,
              107,
              19,
              27,
              28,
              29,
              34,
              36,
              37,
              38,
              39,
              40,
              41,
              42,
              43,
              47,
              50,
              52,
              74,
              75,
              77,
              91,
              93,
              98,
              101,
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
              128,
              129,
              130,
              131,
              132,
              133,
              134
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch166",
            "label": "880高数第9章(前20道错题)",
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
              10,
              11,
              12,
              13,
              14,
              15,
              16,
              18,
              19,
              20,
              21
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch19",
            "label": "30讲线代第1讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch20",
            "label": "30讲线代第2讲",
            "indices": [
              1,
              4,
              17,
              25,
              27,
              28,
              29,
              34
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch21",
            "label": "30讲线代第3讲",
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d11_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "2019年数一真题(16道非绿，含9未标) 重做清零 + 邂逅第9章线面积分(后36题，🎉第9章收官！)",
        "desc": "上午清零19年真题16道非绿题，随后把邂逅第9章三重与线面积分后36题全部刷完标绿！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2019",
            "label": "19年数一真题(23题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_09",
            "label": "邂逅高数第9章(题36–71收官)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d11_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【南大851两套连刷】2019年真题(11题) + 2024年真题(10题)",
        "desc": "下午3h整块拿下南大19年与24年真题共21道大题，当场批改订正标绿！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_19",
            "label": "南大19真题(11题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_24",
            "label": "南大24真题(10题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d11_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》高数第10章线面补充(20题，🎉邂逅高数744题全篇收官！) + 线代第1章行列式(前16题)",
        "desc": "今晚完成邂逅高数第10章20题，宣告《邂逅遗憾》高数篇744题全部通关！顺势开启线代第1章行列式。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_10",
            "label": "邂逅第10章·线面补充(20题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_11",
            "label": "邂逅线代第1章(前16道非绿)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d11_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "🎓南大期末题必搞 (1/6)",
        "time": "20:45–22:00",
        "title": "🎓【南大期末题Day 1】时域与卷积期末题专练 + 波哥强化第6章离散复频域(题1–25) & 讲义第6章扫尾",
        "desc": "电路专题已圆满收官，今晚正式启动【🎓南大期末题】第1天！配合波哥第6章Z变换（讲义10道非绿+强化前25题）。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_06",
            "label": "波哥强化第6章(前25题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_06",
            "label": "波哥讲义第6章(27题收官)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d11_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》新思想第11–16章(社会/生态/国安/国防/一国两制/外交，共52题)",
        "desc": "刷完新思想第11–16章共52题并复盘错题。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100432",
            "label": "新思想·第11章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100433",
            "label": "新思想·第12章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100439",
            "label": "新思想·第13章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100435",
            "label": "新思想·第14章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100436",
            "label": "新思想·第15章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100437",
            "label": "新思想·第16章"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d11_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大作文科技创新/环境保护主题背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "默写高频话题核心词句，下午精读阅读。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2019",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d11_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《李林880》高数第9章线面错题收尾(达45绿) + 36讲高数第16讲级数错题(13题) + 《30讲》线代第4–6讲点绿(🎉30讲线代全绿！)",
        "desc": "清完880第9章已做错题与36讲级数错题；同时把30讲线代第4–6讲过筛点绿，30讲线代全篇收官！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch166",
            "label": "880高数第9章(后19道错题+23未标)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch46",
            "label": "36讲高数第16讲·级数(13道错题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch22",
            "label": "30讲线代第4讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch23",
            "label": "30讲线代第5讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch24",
            "label": "30讲线代第6讲(收官)"
          }
        ],
        "targetCount": 110,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch166",
            "label": "880高数第9章(后19道错题+23未标)",
            "indices": [
              22,
              23,
              29,
              30,
              32,
              34,
              35,
              36,
              37,
              38,
              39,
              40,
              42,
              43,
              44,
              45,
              46,
              47,
              48,
              24,
              25,
              26,
              27,
              28,
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch46",
            "label": "36讲高数第16讲·级数(13道错题)",
            "indices": [
              9,
              10,
              12,
              13,
              14,
              16,
              17,
              18,
              19,
              20,
              24,
              25,
              51
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch22",
            "label": "30讲线代第4讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch23",
            "label": "30讲线代第5讲",
            "indices": [
              1,
              2,
              4,
              8,
              9,
              11,
              13,
              15,
              16,
              17,
              18,
              20,
              24,
              25,
              27,
              28,
              30,
              32,
              33
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch24",
            "label": "30讲线代第6讲(收官)",
            "indices": [
              1,
              2,
              5,
              10,
              11,
              19,
              20,
              21,
              22,
              23,
              24
            ],
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d12_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "2020年数一真题(21道非绿，含12未标) 3h深度攻克 + 邂逅线代第1章行列式收官(后20题)",
        "desc": "2020年是史上最难数一真题之一（剩21道非绿），上午用足时间逐题攻克标绿；随后收官邂逅线代第1章！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2020",
            "label": "20年数一真题(23题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_11",
            "label": "邂逅线代第1章(后19道非绿收官)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d12_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【华科824】2020年真题(26题) 3h全真模考 + 订正标绿",
        "desc": "下午3h考场整块完成华科2020年真题26题，当场批改复盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_20",
            "label": "华科20真题(26题)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d12_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》线代第2章 矩阵（前35题，题1–35）",
        "desc": "邂逅线代第2章矩阵共56题，今晚高效率推进前35题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_12",
            "label": "邂逅线代第2章(题1–35)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d12_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "🎓南大期末题必搞 (2/6)",
        "time": "20:45–22:00",
        "title": "🎓【南大期末题Day 2】傅里叶与采样调制期末题 + 波哥强化第6章离散复频域(后30题，🎉强化第6章收官！)",
        "desc": "推进手头《南大期末题》第2部分（傅里叶与采样），并把波哥强化第6章55题全部刷完收官！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_06",
            "label": "波哥强化第6章(后30题收官)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d12_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》新思想第17章收官 + 史纲第1–2章(共57题)",
        "desc": "新思想全篇收官！正式切入中国近现代史纲要第1–2章。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100438",
            "label": "新思想·第17章(13题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100440",
            "label": "史纲·第1章(22题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100441",
            "label": "史纲·第2章(22题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d12_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大小作文高频功能句默写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "持续保持阅读手感与词汇复盘。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2019",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d12_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《李林880》线代已做错题总清零(第10-11章28错题 + 第14-15章26错题) + 《30讲》概率第1–3讲点绿",
        "desc": "把880线代之前留下的54道🟡/🔴错题一举清零！同时点绿30讲概率前3讲。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch167",
            "label": "880线代第10章·行列式"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch168",
            "label": "880线代第11章·矩阵"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch171",
            "label": "880线代第14章·相似"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch172",
            "label": "880线代第15章·二次型"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch25",
            "label": "30讲概率第1讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch26",
            "label": "30讲概率第2讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch27",
            "label": "30讲概率第3讲"
          }
        ],
        "targetCount": 244,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch167",
            "label": "880线代第10章·行列式",
            "indices": [
              2,
              3,
              4,
              8,
              9,
              11,
              13,
              15,
              16,
              17,
              19,
              21,
              23,
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch168",
            "label": "880线代第11章·矩阵",
            "indices": [
              3,
              7,
              8,
              9,
              10,
              13,
              15,
              16,
              17,
              18,
              20,
              22,
              23,
              29,
              32,
              33,
              34,
              35,
              36,
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch171",
            "label": "880线代第14章·相似",
            "indices": [
              3,
              4,
              5,
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
              26,
              27,
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch172",
            "label": "880线代第15章·二次型",
            "indices": [
              0,
              2,
              4,
              5,
              6,
              7,
              8,
              11,
              13,
              14,
              15,
              16,
              17,
              18,
              19,
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
              54
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch25",
            "label": "30讲概率第1讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch26",
            "label": "30讲概率第2讲",
            "indices": [
              3,
              6,
              7,
              8,
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch27",
            "label": "30讲概率第3讲",
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d13_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "2021年数一真题(11道非绿题重做，🎉09–23年15套真题一轮全通！) + 邂逅线代第2章矩阵收官(后21题)",
        "desc": "上午清完2021年真题11道错题，09–23年15套真题完成一轮全覆盖！余时收官邂逅线代第2章矩阵并开启第3章向量前15题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2021",
            "label": "21年数一真题(22题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_12",
            "label": "邂逅线代第2章(题36–56收官)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_13",
            "label": "邂逅线代第3章(题1–15)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d13_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【南大851最新卷】2025年真题(9题) + 2026年真题(10题)（🎉南大16套未做卷全部刷完！）",
        "desc": "下午3h整块攻克南大最新25、26年真题共19题！至此南大851全部20套真题一轮全部做完！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_25",
            "label": "南大25真题(9题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_26",
            "label": "南大26真题(10题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d13_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》线代第3章向量(后29题收官) + 第4章方程组(前10题)",
        "desc": "今晚收官邂逅线代第3章向量44题，并推进第4章方程组前10题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_13",
            "label": "邂逅线代第3章(题16–44收官)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_14",
            "label": "邂逅线代第4章(题1–10)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d13_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "🎓南大期末题必搞 (3/6)",
        "time": "20:45–22:00",
        "title": "🎓【南大期末题Day 3】拉氏变换与S域系统期末题 + 波哥习题集第6章Z变换(清前30道🟡/🔴错题)",
        "desc": "完成手头《南大期末题》第3部分，同时把波哥习题集第6章Z变换绿标从17题推至47题！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_06",
            "label": "波哥习题集第6章(前30道错题)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d13_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》史纲第3–4章(辛亥革命/建党与大革命，共65题)",
        "desc": "推进史纲第3、4章65题并当场复盘错题。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100442",
            "label": "史纲·第3章(24题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100443",
            "label": "史纲·第4章(41题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d13_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间小作文通知/告示/纪要模板背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "覆盖全部小作文文体格式。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2018",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d13_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《李林880》概率已做错题清零(第16–18章，清前50道错题) + 《30讲》概率第4–6讲点绿(🎉基础30讲全书30讲100%绿！)",
        "desc": "清理880概率第16–18章错题；同时点绿30讲概率最后3讲，至此《张宇基础30讲》高数+线代+概率共872题全部点绿收官！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch173",
            "label": "880概率第16章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch174",
            "label": "880概率第17章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch175",
            "label": "880概率第18章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch28",
            "label": "30讲概率第4讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch29",
            "label": "30讲概率第5讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch30",
            "label": "30讲概率第6讲(全书收官)"
          }
        ],
        "targetCount": 136,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch173",
            "label": "880概率第16章",
            "indices": [
              1,
              2,
              5,
              16,
              17,
              18,
              19,
              20,
              21,
              22,
              23
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch174",
            "label": "880概率第17章",
            "indices": [
              0,
              1,
              2,
              3,
              5,
              6,
              8,
              9,
              10,
              11,
              13,
              14,
              15,
              16,
              17,
              22,
              25,
              26,
              27,
              28,
              29,
              30,
              31,
              32
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch175",
            "label": "880概率第18章",
            "indices": [
              1,
              2,
              3,
              4,
              5,
              6,
              8,
              9,
              10,
              11,
              12,
              13,
              14,
              15,
              17,
              18,
              19,
              20,
              21,
              22,
              23,
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
              37,
              38,
              39
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch28",
            "label": "30讲概率第4讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch29",
            "label": "30讲概率第5讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch30",
            "label": "30讲概率第6讲(全书收官)",
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d14_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "【真题二刷Day 1】09–11年真题残余黄/红题盲做清零 + 邂逅线代第4章收官(后11题) & 第5章相似(全29题)",
        "desc": "开启真题二刷验收：确保09、10、11三年真题共69题100%全绿！随后拿下邂逅线代第4章收尾与第5章相似矩阵全部29题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2009",
            "label": "09真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2010",
            "label": "10真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2011",
            "label": "11真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_14",
            "label": "邂逅线代第4章(题11–21收官)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_15",
            "label": "邂逅线代第5章·相似(29题)"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d14_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h模考",
        "time": "14:00–17:00",
        "title": "🔥【专业课模拟卷(二)】3h全真模考（可选手头模拟卷2 或 网站刺猬哥/芝麻模拟卷二）",
        "desc": "第二周周五下午14:00-17:00全真3h模拟！检验本周电路专题与期末题特训成果。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_mn_26_02",
            "label": "26刺猬哥预测卷(二)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_02",
            "label": "26芝麻模拟卷(二)"
          }
        ],
        "offlineLabel": "专业课模拟卷(二) 3h模考+订正",
        "offlineTarget": 1,
        "special": true,
        "isOptionalOnlineMock": true,
        "scopedItems": []
      },
      {
        "id": "d14_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》线代第6章 二次型（前35题，题1–35）",
        "desc": "二次型共42题，今晚拿下前35题，明天即可收官邂逅线代全篇！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_16",
            "label": "邂逅线代第6章(题1–35)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d14_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "🎓南大期末题必搞 (4/6)",
        "time": "20:45–22:00",
        "title": "🎓【南大期末题Day 4】Z变换与离散系统期末题 + 波哥习题集第6章Z变换(清后27道错题，🎉第6章74题全绿！)",
        "desc": "推进手头《南大期末题》第4部分，同时将波哥习题集第6章Z变换74题全部清零标绿！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_06",
            "label": "波哥习题集第6章(后27道错题收官)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d14_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》史纲第5–6章(革命新道路/抗日战争，共64题) + 第二周政治错题复盘",
        "desc": "完成史纲第5、6章64题，并复盘本周新思想与史纲错题。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100444",
            "label": "史纲·第5章(22题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100445",
            "label": "史纲·第6章(42题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d14_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间第二周大小作文限时默写检验(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "25分钟完整默写一篇大作文+一篇小作文提纲。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2018",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d14_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《李林880》概率第19章数字特征(35道🟡/🔴错题清零) + 《1000题基础篇》高数第1–4章过筛点绿",
        "desc": "把880概率第19章已做错题全部清零！30讲已全绿，今晚起每晚顺手把纸质做过的1000题基础篇点绿。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch176",
            "label": "880概率第19章(错题清零)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch67",
            "label": "1000题基础·高数第1章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch68",
            "label": "1000题基础·高数第2章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch69",
            "label": "1000题基础·高数第3章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch70",
            "label": "1000题基础·高数第4章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch31",
            "label": "36讲高数第1讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch32",
            "label": "36讲高数第2讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch33",
            "label": "36讲高数第3讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch34",
            "label": "36讲高数第4讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch35",
            "label": "36讲高数第5讲"
          }
        ],
        "targetCount": 158,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch176",
            "label": "880概率第19章(错题清零)",
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
              22,
              23,
              25,
              26,
              27,
              28,
              30,
              31,
              32,
              33,
              35,
              37,
              39,
              40,
              41,
              42,
              43,
              44,
              45,
              46,
              48,
              49
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch67",
            "label": "1000题基础·高数第1章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch68",
            "label": "1000题基础·高数第2章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch69",
            "label": "1000题基础·高数第3章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch70",
            "label": "1000题基础·高数第4章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch31",
            "label": "36讲高数第1讲",
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
              14
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch32",
            "label": "36讲高数第2讲",
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
              10,
              11,
              12
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch33",
            "label": "36讲高数第3讲",
            "indices": [
              1,
              2,
              3,
              5,
              7
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch34",
            "label": "36讲高数第4讲",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6,
              8
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch35",
            "label": "36讲高数第5讲",
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d15_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "【真题二刷Day 2】12–14年真题残余错题清零 + 邂逅线代第6章收尾(7题) & 第7章数一专项(19题，🎉邂逅线代收官！)",
        "desc": "上午二刷12–14年真题确保69题100%全绿；随后完成邂逅线代最后26题，宣告《邂逅遗憾》线代篇247题全部收官！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2012",
            "label": "12真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2013",
            "label": "13真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2014",
            "label": "14真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_16",
            "label": "邂逅线代第6章(题36–42收官)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_17",
            "label": "邂逅线代第7章·数一专项(19题)"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d15_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【华科824】2022年真题(28题) 3h全真模考 + 订正标绿",
        "desc": "进入华科近3年压轴大卷！3小时考场标准完成2022年真题28题并批改复盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_22",
            "label": "华科22真题(28题)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d15_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》概率第1章随机事件(18题) + 第2章一维随机变量(前20题)",
        "desc": "正式开启《邂逅遗憾》概率论篇（共228题，4天即可全通）！今晚拿下前38题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_18",
            "label": "邂逅概率第1章(18题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_19",
            "label": "邂逅概率第2章(题1–20)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d15_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "🎓南大期末题必搞 (5/6)",
        "time": "20:45–22:00",
        "title": "🎓【南大期末题Day 5】DTFT与滤波器综合期末题 + 波哥第7章DTFT(讲义8错题 + 习题集35错题清零)",
        "desc": "完成手头《南大期末题》第5部分，同时把波哥第7章离散时间傅氏变换（讲义8题+习题集35题）一举清零全绿！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_07",
            "label": "波哥讲义第7章·DTFT(8题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_07",
            "label": "波哥习题集第7章·DTFT(35题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d15_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》史纲第7–8章(新中国成立与社会主义建设探索，共59题)",
        "desc": "刷完史纲第7、8章59题并当场复盘错题。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100446",
            "label": "史纲·第7章(23题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100447",
            "label": "史纲·第8章(36题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d15_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大作文正反论证/双刃剑模板背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "巩固科技双刃剑类话题写法。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2017",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d15_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《强化36讲》高数重点未标章：第6讲中值定理(22题) + 第11讲积分不等式(19题) + 《1000题基础》高数第5–8章点绿",
        "desc": "主攻数一证明题核心：36讲第6讲中值定理与第11讲积分不等式！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch36",
            "label": "36讲高数第6讲·中值定理(22题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch41",
            "label": "36讲高数第11讲·积分不等式(19题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch71",
            "label": "1000题基础·高数第5章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch72",
            "label": "1000题基础·高数第6章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch37",
            "label": "36讲高数第7讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch38",
            "label": "36讲高数第8讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch39",
            "label": "36讲高数第9讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch40",
            "label": "36讲高数第10讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch42",
            "label": "36讲高数第12讲"
          }
        ],
        "targetCount": 138,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch36",
            "label": "36讲高数第6讲·中值定理(22题)",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch41",
            "label": "36讲高数第11讲·积分不等式(19题)",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch71",
            "label": "1000题基础·高数第5章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch72",
            "label": "1000题基础·高数第6章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch37",
            "label": "36讲高数第7讲",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch38",
            "label": "36讲高数第8讲",
            "indices": [
              1,
              2,
              3,
              4,
              6,
              7
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch39",
            "label": "36讲高数第9讲",
            "indices": [
              1,
              2,
              3,
              4,
              7,
              8,
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch40",
            "label": "36讲高数第10讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch42",
            "label": "36讲高数第12讲",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d16_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "【真题二刷Day 3】15–17年真题残余错题清零 + 邂逅概率第2章一维随机变量收官(后20题)",
        "desc": "二刷15–17年真题确保69题100%全绿；随后收官邂逅概率第2章40题！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2015",
            "label": "15真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2016",
            "label": "16真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2017",
            "label": "17真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_19",
            "label": "邂逅概率第2章(题21–40收官)"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d16_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【华科824】2023年真题(28题) 3h全真模考 + 订正标绿",
        "desc": "下午3h整块完成华科2023年真题28题并当场批改复盘。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_23",
            "label": "华科23真题(28题)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d16_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》概率第3章 二维随机变量（前35题，题1–35）",
        "desc": "二维随机变量共45题，今晚拿下前35题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_20",
            "label": "邂逅概率第3章(题1–35)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d16_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "🎓南大期末题必搞 (6/6收官)",
        "time": "20:45–22:00",
        "title": "🎓【南大期末题Day 6收官】期末错题总验收 + 波哥第8章傅氏应用(讲义3题+习题集45题清零，🎉波哥4–9章全通！)",
        "desc": "今晚彻底收官手头《南大期末题》全套，并把波哥第8章傅氏应用全部清零标绿！至此⚡电路专题、🎓南大期末题、波哥4–9章全部搞定！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_08",
            "label": "波哥讲义第8章(3题收官)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_08",
            "label": "波哥习题集第8章(45题收官)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d16_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》史纲第9–10章收官 + 思修绪论与第1–2章(共52题)",
        "desc": "史纲全篇收官！正式进入最后一个模块：思修法基。",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100448",
            "label": "史纲·第9章(12题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100449",
            "label": "史纲·第10章(7题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100450",
            "label": "思修·绪论(7题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100451",
            "label": "思修·第1章(16题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100452",
            "label": "思修·第2章(10题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d16_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间小作文推荐信/道歉信/感谢信背默(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "熟练默写高频交际信件。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2017",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d16_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《强化36讲》高数第13讲多元微分(32题) + 《1000题基础》高数第9–12章点绿",
        "desc": "攻克36讲高数第13讲多元函数微分学32题，并继续点绿1000题基础篇。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch43",
            "label": "36讲高数第13讲·多元微分(32题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch75",
            "label": "1000题基础·高数第9章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch76",
            "label": "1000题基础·高数第10章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch44",
            "label": "36讲高数第14讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch45",
            "label": "36讲高数第15讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch47",
            "label": "36讲高数第17讲"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch73",
            "label": "1000基础·高数第7章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch74",
            "label": "1000基础·高数第8章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch77",
            "label": "1000基础·高数第11章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch78",
            "label": "1000基础·高数第12章"
          }
        ],
        "targetCount": 154,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch43",
            "label": "36讲高数第13讲·多元微分(32题)",
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
              31
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch75",
            "label": "1000题基础·高数第9章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch76",
            "label": "1000题基础·高数第10章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch44",
            "label": "36讲高数第14讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch45",
            "label": "36讲高数第15讲",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch47",
            "label": "36讲高数第17讲",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              6
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch73",
            "label": "1000基础·高数第7章",
            "indices": [
              0,
              1,
              2,
              3,
              4
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch74",
            "label": "1000基础·高数第8章",
            "indices": [
              0,
              1,
              3,
              4,
              6,
              7,
              9,
              11,
              18,
              20,
              21,
              23
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch77",
            "label": "1000基础·高数第11章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch78",
            "label": "1000基础·高数第12章",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d17_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "【真题二刷Day 4】18–20年真题残余错题清零 + 邂逅概率第3章收尾(10题) & 第4章数字特征(前15题)",
        "desc": "重点二刷18–20年真题确保69题100%全绿；随后收官邂逅概率第3章并开启第4章数字特征。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2018",
            "label": "18真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2019",
            "label": "19真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2020",
            "label": "20真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_20",
            "label": "邂逅概率第3章(题36–45收官)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_21",
            "label": "邂逅概率第4章(题1–15)"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d17_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【华科824收官】2024年真题(28题) 3h全真模考（🎉华科近10年真题全部刷完！）",
        "desc": "下午3h整块完成华科2024年最新真题28题！至此华科824近10年真题一轮全部通关！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_24",
            "label": "华科24真题(28题收官)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d17_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》概率第4章 随机变量的数字特征（后34题，🎉第4章49题全绿收官！）",
        "desc": "今晚拿下邂逅概率第4章数字特征全部49题！明天即可实现《邂逅遗憾》全书1219题大满贯！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_21",
            "label": "邂逅概率第4章(题16–49收官)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d17_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "📚芝麻400题 & 波哥1-3清零",
        "time": "20:45–22:00",
        "title": "📚【芝麻400题专题一】时域/卷积/傅氏挑刷 + 波哥强化第1–2章残余错题清零(46道🟡/🔴题)",
        "desc": "挑刷手头《芝麻400题》薄弱专题，并把波哥强化第1章(15错题)与第2章(31错题)彻底清零标绿！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_01",
            "label": "波哥强化第1章(50题收官)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_02",
            "label": "波哥强化第2章(49题收官)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_01",
            "label": "波哥习题集第1章(88题未标)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d17_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》思修第3–5章(中国精神/价值准则/道德规范，共70题)",
        "desc": "思修选择题简单速度快，今日一鼓作气拿下第3–5章70题！",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100453",
            "label": "思修·第3章(15题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100454",
            "label": "思修·第4章(14题)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100455",
            "label": "思修·第5章(41题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d17_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大小作文套卷限时仿写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "直接用真题作文题目限时写提纲与首尾段。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2016",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d17_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《强化36讲》高数第16讲无穷级数(清剩余33未标) + 第18讲多元积分(清11未标+11错题)",
        "desc": "攻克36讲高数最核心的第16讲无穷级数与第18讲多元积分！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch46",
            "label": "36讲高数第16讲·级数(33道未标收官)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch48",
            "label": "36讲高数第18讲·多元积分(29题收官)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch79",
            "label": "1000基础·高数第13章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch80",
            "label": "1000基础·高数第14章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch81",
            "label": "1000基础·高数第15章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch82",
            "label": "1000基础·高数第16章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch83",
            "label": "1000基础·高数第17章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch84",
            "label": "1000基础·高数第18章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch85",
            "label": "1000基础·高数零基础"
          }
        ],
        "targetCount": 189,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch46",
            "label": "36讲高数第16讲·级数(33道未标收官)",
            "indices": [
              21,
              22,
              23,
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
              52,
              53,
              54,
              55,
              56
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch48",
            "label": "36讲高数第18讲·多元积分(29题收官)",
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
              14,
              17,
              18,
              21,
              22,
              23,
              24,
              25,
              26,
              27,
              28
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch79",
            "label": "1000基础·高数第13章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch80",
            "label": "1000基础·高数第14章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch81",
            "label": "1000基础·高数第15章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch82",
            "label": "1000基础·高数第16章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch83",
            "label": "1000基础·高数第17章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch84",
            "label": "1000基础·高数第18章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch85",
            "label": "1000基础·高数零基础",
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
            "taskType": "full_recheck"
          }
        ]
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
        "id": "d18_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "【真题二刷Day 5收官】21–23年真题残余错题清零 + 邂逅概率第5章大数定律(13题) & 第6章抽样分布(20题)",
        "desc": "上午二刷21–23年真题确保66题100%全绿（09–23年15套真题二刷全部完成！）；随后拿下邂逅概率第5、6章共33题。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2021",
            "label": "21真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2022",
            "label": "22真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2023",
            "label": "23真题(二刷全绿)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_22",
            "label": "邂逅概率第5章·大数定律(13题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_23",
            "label": "邂逅概率第6章·抽样分布(20题)"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d18_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【南大851全绿验收】2020–2023年真题 44道🟡/🔴/⚪非绿题专场清零（🎉南大20套229题100%全绿！）",
        "desc": "专门用3小时把之前做过的南大20–23年真题里剩下的44道非绿题逐一重算标绿，实现南大851二十年真题100%全绿！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_20",
            "label": "南大20真题(19题全绿)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_21",
            "label": "南大21真题(10道黄/红错题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_22",
            "label": "南大22真题(22题全绿)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_23",
            "label": "南大23真题(11道黄/红错题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d18_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》概率第7章参数估计(21题) + 第8章假设检验(22题)（🎉🎉《邂逅遗憾》全书25章1219题100%收官！）",
        "desc": "里程碑时刻！今晚刷完最后43题，《邂逅遗憾》高数+线代+概率共1219题全部刷完！最后3天转入二刷错题验收！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_24",
            "label": "邂逅概率第7章·参数估计(21题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_25",
            "label": "邂逅概率第8章·假设检验(22题)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d18_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "📚芝麻400题 & 波哥强化收官",
        "time": "20:45–22:00",
        "title": "📚【芝麻400题专题二】拉氏/Z变换/系统函数挑刷 + 波哥强化第3章离散时域(清18未标+5错题，🎉波哥强化1–7章全绿！)",
        "desc": "把波哥强化第3章剩余23道非绿题全部清零，实现《波哥强化习题集》1–7章310题100%全绿！同时挑刷芝麻400题。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_03",
            "label": "波哥强化第3章(33题收官)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_02",
            "label": "波哥习题集第2章(66题未标)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d18_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "《27肖1000》思修第6章法治素养(63题)（🎉🎉《27肖1000题》全书52章1148题一轮全部刷完！）",
        "desc": "今日刷完思修最后一章63题，肖1000全书1148题一轮全部刷完！后3天集中清零所有政治黄红错题！",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100456",
            "label": "思修·第6章法治(63题收官)"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d18_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大小作文套卷限时仿写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "稳扎稳打推进阅读与生词本。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2016",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d18_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《李林880》线代未标重点章：第12章向量(39题) + 第13章方程组(48题) 选刷核心综合题",
        "desc": "针对880线代尚未刷过的第12章向量与第13章方程组，精选核心大题与选填攻克标绿。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch169",
            "label": "880线代第12章·向量(39题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch170",
            "label": "880线代第13章·方程组(48题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch104",
            "label": "1000基础·线代第1章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch105",
            "label": "1000基础·线代第2章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch106",
            "label": "1000基础·线代第3章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch107",
            "label": "1000基础·线代第4章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch108",
            "label": "1000基础·线代第5章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch109",
            "label": "1000基础·线代第6章"
          }
        ],
        "targetCount": 186,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch169",
            "label": "880线代第12章·向量(39题)",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch170",
            "label": "880线代第13章·方程组(48题)",
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
              47
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch104",
            "label": "1000基础·线代第1章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch105",
            "label": "1000基础·线代第2章",
            "indices": [
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch106",
            "label": "1000基础·线代第3章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch107",
            "label": "1000基础·线代第4章",
            "indices": [
              3,
              4,
              5,
              6,
              7,
              8,
              10,
              11,
              12,
              13,
              15,
              16
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch108",
            "label": "1000基础·线代第5章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch109",
            "label": "1000基础·线代第6章",
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d19_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "【真题三刷验收(上)】2009–2016年8套数一真题 错题转盘无死角抽检 + 顽固题重算",
        "desc": "打开网站「错题转盘」或逐套检查09–16年真题，任何之前卡壳过的题当场动笔再算一遍，确保100%秒出思路！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2009",
            "label": "09真题验收"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2012",
            "label": "12真题验收"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2014",
            "label": "14真题验收"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2016",
            "label": "16真题验收"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
          }
        ]
      },
      {
        "id": "d19_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【华科824二刷清零(上)】2015–2019年5套华科真题 🟡/🔴错题专场重做全绿",
        "desc": "下午3h整块把第一、二周刷过的华科15–19年真题里留下的所有模糊/不会题全部二刷变绿！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_15",
            "label": "华科15全绿"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_16",
            "label": "华科16全绿"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_17",
            "label": "华科17全绿"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_18",
            "label": "华科18全绿"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_19",
            "label": "华科19全绿"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
          }
        ]
      },
      {
        "id": "d19_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "【《邂逅遗憾》二刷(上)】高数第1–10章 残余🟡/🔴错题集中二刷清零",
        "desc": "使用章节筛选功能（只看🟡模糊/🔴不会），把《邂逅遗憾》高数篇留下的错题逐个击破变绿！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_01",
            "label": "邂逅第1章(二刷复检)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_02",
            "label": "邂逅第2章(二刷复检)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_07",
            "label": "邂逅第7章(二刷复检)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_09",
            "label": "邂逅第9章(二刷复检)"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
          }
        ]
      },
      {
        "id": "d19_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "📚芝麻400题 & 波哥1-3点绿",
        "time": "20:45–22:00",
        "title": "📚【芝麻400题专题三】+ 波哥1–3章讲义与基础习题集（线下已做部分线上过筛点绿）",
        "desc": "挑刷《芝麻400题》专题三，并把线下早已做过的波哥1–3章讲义与习题集快速过筛点绿。",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_01",
            "label": "波哥讲义第1章"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_02",
            "label": "波哥讲义第2章"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_jy_03",
            "label": "波哥讲义第3章"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_03",
            "label": "波哥习题集第3章(44题未标)"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d19_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "【肖1000错题总清零(一)】马原全8章 🟡/🔴错题专场二刷全绿",
        "desc": "肖1000一轮已刷完！今日把马原所有章节中的模糊/不会题全部二刷变绿！",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100403",
            "label": "马原·第1章(二刷复检)"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100406",
            "label": "马原·第4章政经(剩余52道错题清零)"
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
            "taskType": "full_recheck"
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
            "taskType": "clear_non_green"
          }
        ]
      },
      {
        "id": "d19_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大小作文高频模板默写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "保持每日英语手感。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2015",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d19_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《李林880》概率未标重点章：第20–23章(大数定律/数理统计/参数估计/假设检验，共66题)",
        "desc": "攻克880概率论最后4章数理统计与参数估计（ch177–ch180），实现880概率论全篇通关！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch177",
            "label": "880概率第20章(10题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch178",
            "label": "880概率第21章(25题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch179",
            "label": "880概率第22章(24题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch180",
            "label": "880概率第23章(7题)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch119",
            "label": "1000基础·概率第1章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch120",
            "label": "1000基础·概率第2章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch121",
            "label": "1000基础·概率第3章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch122",
            "label": "1000基础·概率第4章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch123",
            "label": "1000基础·概率第5章"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch124",
            "label": "1000基础·概率第6章"
          }
        ],
        "targetCount": 151,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch177",
            "label": "880概率第20章(10题)",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch178",
            "label": "880概率第21章(25题)",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch179",
            "label": "880概率第22章(24题)",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch180",
            "label": "880概率第23章(7题)",
            "indices": [
              0,
              1,
              2,
              3,
              4,
              5,
              6
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch119",
            "label": "1000基础·概率第1章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch120",
            "label": "1000基础·概率第2章",
            "indices": [
              3,
              8,
              9,
              10
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch121",
            "label": "1000基础·概率第3章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch122",
            "label": "1000基础·概率第4章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch123",
            "label": "1000基础·概率第5章",
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch124",
            "label": "1000基础·概率第6章",
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d20_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "【真题三刷终极验收(下)】2017–2023年7套数一真题 100%全绿验收（🎉09–23年342题100%全绿！）",
        "desc": "逐套核验17–23年真题，把最后残余的任何一道非绿题彻底干掉，达成09–23年15套数一真题342道题100%全绿成就！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2017",
            "label": "17真题全绿"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2019",
            "label": "19真题全绿"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2020",
            "label": "20真题全绿"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2022",
            "label": "22真题全绿"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2023",
            "label": "23真题全绿"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
          }
        ]
      },
      {
        "id": "d20_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h整块",
        "time": "14:00–17:00",
        "title": "【南大851对账补遗10道未标题(21年3题+23年7题) + 华科824(20–24)错题回炉】",
        "desc": "精准补齐南大851在2021年(3道未标⚪)与2023年(7道未标⚪)合计10道差额题（凑齐193道待绿全覆盖），并完成华科824近5年错题二刷！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_21",
            "label": "南大21真题(对账补遗3道未标题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_23",
            "label": "南大23真题(对账补遗7道未标题)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_20",
            "label": "华科20真题"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_21",
            "label": "华科21真题"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_22",
            "label": "华科22真题"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_23",
            "label": "华科23真题"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_24",
            "label": "华科24真题"
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
            "taskType": "clear_non_green"
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
            "taskType": "clear_non_green"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
          }
        ]
      },
      {
        "id": "d20_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "【《邂逅遗憾》二刷(下)】线代第1–7章 & 概率第1–8章 残余🟡/🔴错题集中二刷清零",
        "desc": "把《邂逅遗憾》线代篇与概率篇留下的模糊/不会题全部二刷清零变绿！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_12",
            "label": "邂逅线代第2章(二刷复检)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_16",
            "label": "邂逅线代第6章(二刷复检)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_20",
            "label": "邂逅概率第3章(二刷复检)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_21",
            "label": "邂逅概率第4章(二刷复检)"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
          }
        ]
      },
      {
        "id": "d20_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "⚡电路 & 🎓期末题二刷",
        "time": "20:45–22:00",
        "title": "⚡电路专题 + 🎓南大期末题 + 波哥4–9章 顽固红题终极二刷清零",
        "desc": "专门复盘第二周做过的手头《电路专题》、《南大期末题》以及波哥第4–9章标记过的重点难题，确保考场遇到秒杀！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_09",
            "label": "波哥习题集第9章·电路(二刷复检)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_qh_07",
            "label": "波哥强化第7章·电路(二刷复检)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_05",
            "label": "波哥习题集第5章(二刷复检)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_06",
            "label": "波哥习题集第6章(二刷复检)"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
          }
        ]
      },
      {
        "id": "d20_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "【肖1000错题总清零(二)】新思想 + 毛中特 🟡/🔴错题专场二刷全绿",
        "desc": "把毛中特与新思想所有章节的模糊/不会题全部二刷变绿！",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100412",
            "label": "毛中特·第2章"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100427",
            "label": "新思想·第6章"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
          }
        ]
      },
      {
        "id": "d20_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大小作文终极个人模板定稿默写(30m) + 下午真题阅读精读2篇(50m)",
        "desc": "形成属于你自己的考场大小作文定稿模板。",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2015",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d20_night",
        "cat": "night",
        "catLabel": "居家深夜·1h25m",
        "time": "22:50–00:15",
        "title": "《李林880》高数重点未标章查漏补缺：第5章多元微分(68题) / 第8章无穷级数(71题) 选刷核心题",
        "desc": "针对880高数多元微分与级数章节选刷30道核心综合题，强化计算熟练度。",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch162",
            "label": "880高数第5章·多元微分"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch165",
            "label": "880高数第8章·无穷级数"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch158",
            "label": "880高数第1章极限"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch161",
            "label": "880高数第4章几何"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch163",
            "label": "880高数第6章重积分"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch164",
            "label": "880高数第7章微分方程"
          }
        ],
        "targetCount": 335,
        "mode": "green",
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch162",
            "label": "880高数第5章·多元微分",
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
              67
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch165",
            "label": "880高数第8章·无穷级数",
            "indices": [
              3,
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
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch158",
            "label": "880高数第1章极限",
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
              57
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch161",
            "label": "880高数第4章几何",
            "indices": [
              2,
              8,
              9,
              14,
              16,
              17,
              19,
              21,
              22,
              24
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch163",
            "label": "880高数第6章重积分",
            "indices": [
              0,
              5,
              6,
              7,
              8,
              9,
              11,
              12,
              14,
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
              81
            ],
            "taskType": "clear_non_green"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch164",
            "label": "880高数第7章微分方程",
            "indices": [
              1,
              3,
              4,
              5,
              6,
              7,
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
            "taskType": "clear_non_green"
          }
        ]
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
        "id": "d21_m_am",
        "cat": "math",
        "catLabel": "数学·上午3h+45m",
        "time": "08:30–12:15",
        "title": "🎉【数学21天结营总验收】09–23真题(15套) + 《邂逅遗憾》(25章) 绿标率终极总检",
        "desc": "最后核查09–23年真题与《邂逅遗憾》全书绿标率，整理出后29天考前模拟卷冲刺阶段的「核心公式与易错陷阱清单」！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2022",
            "label": "22真题终检"
          },
          {
            "subjectId": "shu1",
            "chapterId": "s1_zt_2023",
            "label": "23真题终检"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gs_03",
            "label": "邂逅高数第3章(绿标终检)"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_xd_16",
            "label": "邂逅线代终检"
          },
          {
            "subjectId": "shu1",
            "chapterId": "xhy_gl_24",
            "label": "邂逅概率终检"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
          }
        ]
      },
      {
        "id": "d21_p_pm",
        "cat": "major",
        "catLabel": "专业课·下午3h模考",
        "time": "14:00–17:00",
        "title": "🔥【专业课模拟卷(三) · 结营大考】3h全真模考（手头模拟卷3 或 网站刺猬哥/芝麻模拟卷三）",
        "desc": "21天魔鬼特训最后一场下午3h全真模考！用满分状态检验南大851+华科824+电路专题+南大期末题全部打通后的硬实力！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_mn_26_03",
            "label": "26刺猬哥预测卷(三)"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_zm_26_03",
            "label": "26芝麻模拟卷(三)"
          }
        ],
        "offlineLabel": "专业课模拟卷(三) 3h结营模考+订正",
        "offlineTarget": 1,
        "special": true,
        "isOptionalOnlineMock": true,
        "scopedItems": []
      },
      {
        "id": "d21_m_pm",
        "cat": "math",
        "catLabel": "数学·晚间1h45m",
        "time": "19:00–20:45",
        "title": "《邂逅遗憾》&《36讲》&《李林880》全书终极复盘验收",
        "desc": "用网站「数学错题转盘」随机抽检15–20道曾错题，确保道道秒杀！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch57",
            "label": "36讲线代终检"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch66",
            "label": "36讲概率终检"
          },
          {
            "subjectId": "shu1",
            "chapterId": "ch159",
            "label": "880高数第2章(未标与绿标终检)"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
          }
        ]
      },
      {
        "id": "d21_p_ev",
        "cat": "MajorSpecial",
        "catLabel": "专业课·结营总检",
        "time": "20:45–22:00",
        "title": "🎉【专业课21天结营总验收】南大851(20套)+华科824(10套)+波哥(1–9章)+⚡电路+🎓期末题 终极验收",
        "desc": "用网站「专业课错题转盘」抽检15道核心大题，确认专业课进入135+冲刺状态！",
        "chapters": [
          {
            "subjectId": "zhuanye",
            "chapterId": "nju_851_26",
            "label": "南大851终检"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "hust_824_24",
            "label": "华科824终检"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_09",
            "label": "波哥电路专题终检"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
          },
          {
            "subjectId": "zhuanye",
            "chapterId": "bg_xt_09",
            "label": "波哥电路专题终检",
            "indices": [
              10,
              15
            ],
            "taskType": "full_recheck"
          }
        ]
      },
      {
        "id": "d21_pol",
        "cat": "politics",
        "catLabel": "政治·65m+带背",
        "time": "13:25 & 18:30",
        "title": "🎉【肖1000结营总验收】史纲 + 思修 🟡/🔴错题专场二刷清零（肖1000全书1148题100%全绿！）",
        "desc": "把史纲与思修残余错题全部清零，实现《27肖1000题》全书通关，无缝衔接肖八肖四！",
        "chapters": [
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100445",
            "label": "史纲·第6章全绿"
          },
          {
            "subjectId": "politics",
            "chapterId": "pol_b25728-c100456",
            "label": "思修·第6章全绿"
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
            "taskType": "full_recheck"
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
            "taskType": "full_recheck"
          }
        ]
      },
      {
        "id": "d21_eng",
        "cat": "english",
        "catLabel": "英语·80m",
        "time": "08:00 & 17:00",
        "title": "早间大小作文考场全真模拟默写(30m) + 下午真题阅读与生词本总检(50m)",
        "desc": "21天累计背默21次作文+42篇精读阅读，英语稳拿高分！",
        "chapters": [
          {
            "subjectId": "english",
            "chapterId": "en_zhenti_2025",
            "label": "英语真题阅读/词本"
          }
        ],
        "offlineLabel": "作文默写+阅读2篇",
        "offlineTarget": 2,
        "scopedItems": []
      },
      {
        "id": "d21_night",
        "cat": "night",
        "catLabel": "居家深夜·结营仪式",
        "time": "22:50–00:15",
        "title": "🏆【21天魔鬼特训结营汇报】导出最新完整备份 .json + 开启最后29天模拟卷冲刺计划！",
        "desc": "导出21天结营备份发给助手，生成21天总战报，正式进入考前最后29天（数学模拟卷+1000题强化+专业课后4套模拟卷+肖八肖四）决胜阶段！",
        "chapters": [
          {
            "subjectId": "shu1",
            "chapterId": "ch30",
            "label": "基础30讲全书绿标"
          }
        ],
        "targetCount": 29,
        "mode": "green",
        "offlineLabel": "导出结营备份 .json 汇报",
        "offlineTarget": 1,
        "scopedItems": [
          {
            "subjectId": "shu1",
            "chapterId": "ch30",
            "label": "基础30讲全书绿标",
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
            "taskType": "full_recheck"
          }
        ]
      }
    ]
  }
];

  // ===== 工具与状态管理引擎 (V3.1 精准题号绑定与四维口径核验引擎) =====
  var CAMP21_BASELINE_STR = {"ch1": "PPPPPP________________________________________________", "ch2": "__________________________", "ch3": "_____________________", "ch4": "___________________________", "ch5": "________________________", "ch6": "_______________________________", "ch7": "_________", "ch8": "__________________________", "ch9": "______________________________________________", "ch10": "WWWWVVWWWRRPWRPPPFPPVFV", "ch11": "WWWRWWWWWWW______", "ch12": "________", "ch13": "PFFVVVPFFW____________PPP___________", "ch14": "_____________________________", "ch15": "PPWFRWRWFRWRRWPFRFWWWWWPPWWF____________", "ch16": "VWWVWVWWRWRWPFVWVWWWWWWRWPWWWRWRWWRWWPWWP_______________", "ch17": "____________P__________", "ch18": "VVVFWRPFWPVFWWWWVFVPPRWWRWWRWWFWPWFW_____", "ch19": "________________________", "ch20": "PVPFRPPPPPPPPPPFFVPPPPPPPWPVWWPFFPV", "ch21": "__________________________", "ch22": "_________________________", "ch23": "PRWPWPFPVVPWPVPWRWRPWPPPVVPRVFVFWR", "ch24": "PVVFPVPPPPVRPPPPPPF______", "ch25": "__________________________________", "ch26": "FFPVPFWRVPPV________________________", "ch27": "______________________________", "ch28": "__________________________", "ch29": "___________", "ch30": "_____________________________", "ch31": "P____________W_", "ch32": "VFWWWWWWWWWRW", "ch33": "PVWVFRFV", "ch34": "RWRVWVVPW", "ch35": "_________", "ch36": "______________________", "ch37": "_____", "ch38": "FVR_VFVV", "ch39": "P__W_PFW_F____________", "ch40": "_______________", "ch41": "___________________", "ch42": "_______", "ch43": "________________________________", "ch44": "________", "ch45": "__________________P", "ch46": "PPPPPFPPPWWPWWWFWWVWW___RW_________________________V_____", "ch47": "WRWWWFV", "ch48": "___________FPPWFPVVPPVWVWWWWW", "ch49": "_______", "ch50": "WRPW", "ch51": "WPP_PV_WVP___FPFWW__", "ch52": "_________", "ch53": "__________", "ch54": "_______", "ch55": "V___", "ch56": "__________", "ch57": "PVWPVWWW_______", "ch58": "__________", "ch59": "VWWVRRW_____", "ch60": "______", "ch61": "____", "ch62": "_________", "ch63": "__________", "ch64": "___", "ch65": "_____", "ch66": "____________", "ch67": "_______________________", "ch68": "____________", "ch69": "_______________", "ch70": "__________________", "ch71": "________________________", "ch72": "______________________", "ch73": "_____", "ch74": "RRP__P__P_PVFFPPPFVPVVFWP", "ch75": "____________________________________", "ch76": "___________________", "ch77": "___________", "ch78": "_______", "ch79": "________________________", "ch80": "________________________", "ch81": "_____________________", "ch82": "___________________", "ch83": "______________", "ch84": "________________", "ch85": "PPPPPPPPPPPPPPPP", "ch86": "______________________________________", "ch87": "PPFWWWWW___", "ch88": "______________________", "ch89": "________________", "ch90": "_________________________________", "ch91": "_____________________", "ch92": "FPV", "ch93": "RR_RFRPF______F____", "ch94": "____________________________", "ch95": "__________________________", "ch96": "_________", "ch97": "_____", "ch98": "________________________________________", "ch99": "_________________________________________", "ch100": "________________________________________", "ch101": "________________________________________", "ch102": "_______________", "ch103": "_____________________________", "ch104": "___________", "ch105": "PPF________________", "ch106": "_______________", "ch107": "FFPWWWWWWPWRWRFRW", "ch108": "V______________________", "ch109": "______________________", "ch110": "_______", "ch111": "____", "ch112": "W_P_______", "ch113": "________", "ch114": "_______________", "ch115": "___________", "ch116": "_________", "ch117": "_____________________", "ch118": "___________________________", "ch119": "______________", "ch120": "FPFRPPFPW__", "ch121": "______________", "ch122": "_____________________", "ch123": "________", "ch124": "________________________", "ch125": "WRPWWW", "ch126": "WW_W___W_", "ch127": "_______", "ch128": "_______", "ch129": "____________", "ch130": "_____________________", "ch131": "____", "ch132": "____________", "ch133": "______________________________", "ch134": "__________________P______________________", "ch135": "_______________________________________", "ch136": "_______________________________________________________________", "ch137": "_PWR_____R_F____________________VF_________", "ch138": "________________", "ch139": "P___F___________________", "ch140": "____________________", "ch141": "________________________________", "ch142": "______________________________________________________________________", "ch143": "_________________________", "ch144": "__________________________", "ch145": "______________________", "ch146": "_________________________________________", "ch147": "_________________________________________________________", "ch148": "______________________________________", "ch149": "_________________________________________________", "ch150": "_______________________________", "ch151": "VWWVVPWWVPPVVPWP___________", "ch152": "__________________________________", "ch153": "______________________________", "ch154": "____________________________", "ch155": "_____________", "ch156": "_________________", "ch157": "____________________", "ch158": "__________________________________________________________", "ch159": "PPVPPWFWWVPPPFWRWWW_WFFPWFFWRWPFWWWVV_VWWWWVFP_PFV_VVW_WWVPFW______PWW____FP__PPV_WFF_PPWP_WWVFP_VRWFFRRR_RW_W_RRR", "ch160": "PVVPFPWPPWWWWFPWPWR_FFFWWVW___FVVP_W________RRW_PV_W_FRVPRFWFPWWWPPPPWWWWW__V_VWVWRRVPWWRRW_P_WVWW_FR_PWPPWW___________________________", "ch161": "PPVPFPFPRVPPPFWPWVFVP__PR", "ch162": "____________________________________________________________________", "ch163": "WPPPPWWWVWPVWFWPPWWW______________________________________________________________", "ch164": "FVPRVVWVFWVWV_____________________________________________________", "ch165": "FFPWPFFPPFW____________________________________________________________", "ch166": "WVVWWWWPWVRWWWRWWPWWWWWR_____VVPWFRWWWWWVPVWVRRRWP__________________", "ch167": "PFWVRFPFVVFVPVPV__PWPRF_F_R_______", "ch168": "FPPWFPPRWWWPFVFWVVWPVPWWPPPPFVFF__VWWP___________", "ch169": "_______________________________________", "ch170": "________________________________________________", "ch171": "FPPRRWPRRWRRRWW__________PVVFWW_________________________", "ch172": "VPVPW___VPPVPRVW____PWWR_______________________________", "ch173": "PRWPPWPPPFFFPPPPWVWWWWWW", "ch174": "WRWRFRWPWWRVPWVVW_FFPP_FFR_W___V_", "ch175": "PWWWWWVPWWWWWWWWPWWWRWWWPVWWWWVVVWRWPWVW", "ch176": "WFRWWWWWVWWWPWRRWWWRRWWWPWWWWFWVVVFWPRPRVV_____P__", "ch177": "__________", "ch178": "_________________________", "ch179": "________________________", "ch180": "_______", "opt880-ch01": "___________________________________________________________________________", "opt880-ch02": "___________________________________________________________________________________________________________________________", "opt880-ch03": "________________________________________________________________________________________________________________________________________________________________________________", "opt880-ch04": "____________________________", "opt880-ch05": "__________________________________________________________________________", "opt880-ch06": "____________________________________________________________________________________", "opt880-ch07": "_________________________________________________________________________", "opt880-ch08": "________________________________________________________________________________________________", "opt880-ch09": "_____________________________________________________________________________", "opt880-ch10": "_________________________________", "opt880-ch11": "_______________________________________________", "opt880-ch12": "____________________________________________", "opt880-ch13": "____________________________________________________", "opt880-ch14": "__________________________________________________________________________________", "opt880-ch15": "____________________________________________________________________________", "opt880-ch16": "______________________________", "opt880-ch17": "________________________________", "opt880-ch18": "_____________________________________________________", "opt880-ch19": "______________________________________________________________", "opt880-ch20": "_________", "opt880-ch21": "______________________________", "opt880-ch22": "______________________________________________", "opt880-ch23": "______", "ch261": "_______________________________________________________", "ch262": "____________________________________________________________________________________________________", "ch263": "_____________________________________________________________________________________", "ch264": "__________", "ch265": "_________________________________________________________________", "ch266": "____________________________________________________________", "ch267": "____________________________________________________________", "ch268": "_______________________________________________________", "ch269": "_____________________________________________", "ch270": "___________________", "ch271": "_________________________________", "ch272": "____________________________", "ch273": "__________________________________", "ch274": "_______________________________________", "ch275": "_____________________________________", "ch276": "________________________", "ch277": "_________________________________", "ch278": "__________________________________", "ch279": "____________________________________", "ch280": "__________", "ch281": "_______________", "ch282": "___________________", "ch283": "____", "yeyu_gd_01": "______________________________________________________", "yeyu_gd_02": "_______________________________________________", "yeyu_gd_03": "_________________________", "yeyu_gd_04": "____________________________________________________________________________________________________", "yeyu_gd_05": "FFFPVFFPPPFW___________________________________________________", "yeyu_gd_06": "________________PFPPVPVW_P_________________________________", "yeyu_gd_07": "_____________________", "yeyu_gd_08": "___________________", "yeyu_gd_09": "___________", "yeyu_gd_10": "__________________VVFRFWWF", "yeyu_gd_11": "__________", "yeyu_gd_12": "______________________________________________________________", "yeyu_gd_13": "____", "yeyu_gd_14": "____", "yeyu_gd_15": "___", "yeyu_gd_16": "_________", "yeyu_gd_17": "_______", "yeyu_gd_18": "RPWWWPVRPWWPPPPVPPPVWRRWVRWPFWPFW", "yeyu_gd_19": "__________________", "yeyu_gd_20": "_______", "yeyu_gd_21": "__________", "yeyu_gd_22": "__________________________", "yeyu_la_01": "PPPPPPPPPPPPPPPPPPPPWVVWWPPPWWPW", "yeyu_la_02": "_________________________________________", "yeyu_la_03": "PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP", "yeyu_la_05": "__________________", "yeyu_la_06": "___________________", "yeyu_la_07": "P___________________________________________________________", "yeyu_la_08": "PFPPPPPPVPVVFWPPWP______________________________", "yeyu_la_09": "___________________________________________________", "yeyu_la_10": "WWWWWW", "yeyu_la_11": "_", "yeyu_pr_01": "________________________________________________", "yeyu_pr_02": "____________________________", "yeyu_pr_03": "_________________________________", "yeyu_pr_04": "_________________________", "yeyu_pr_05": "_______", "yeyu_pr_06": "_____________________", "yeyu_pr_07": "____________________", "yeyu_pr_08": "_____", "xhy_gs_01": "_________________________________________________________________________________________________________________________________", "xhy_gs_02": "_____________________________________________________________________________________________________", "xhy_gs_03": "VPPRPFVVVPFFWWVPPVWPPPPPPPPVRFRVVWFPRWWVFVFVPVFFPWPWFVRRWPFRVWVFPVVFFWVPFPPPFWWWFFPPPWWRWFWRFPRVVFVVWVWWWWWWW____FR_________________", "xhy_gs_04": "W_PFWWRV___________________________________________________", "xhy_gs_05": "____________________________________________________________________", "xhy_gs_06": "______________________________________________", "xhy_gs_07": "________________________________________________________________________________________", "xhy_gs_08": "______________________________", "xhy_gs_09": "_______________________________________________________________________", "xhy_gs_10": "____________________", "xhy_xd_11": "____F_______________________________", "xhy_xd_12": "________________________________________________________", "xhy_xd_13": "____________________________________________", "xhy_xd_14": "_____________________", "xhy_xd_15": "_____________________________", "xhy_xd_16": "__________________________________________", "xhy_xd_17": "___________________", "xhy_gl_18": "__________________", "xhy_gl_19": "________________________________________", "xhy_gl_20": "_____________________________________________", "xhy_gl_21": "_________________________________________________", "xhy_gl_22": "_____________", "xhy_gl_23": "____________________", "xhy_gl_24": "_____________________", "xhy_gl_25": "______________________", "s1_zt_1987": "_____________________", "s1_zt_1988": "______________________", "s1_zt_1989": "_______________________", "s1_zt_1990": "___________________R___", "s1_zt_1991": "______________________", "s1_zt_1992": "______________________", "s1_zt_1993": "_______________________", "s1_zt_1994": "______________________", "s1_zt_1995": "______________________", "s1_zt_1996": "______________________", "s1_zt_1997": "______________________", "s1_zt_1998": "_______________________", "s1_zt_1999": "_____________________", "s1_zt_2000": "_____________________", "s1_zt_2001": "____________________", "s1_zt_2002": "____________________", "s1_zt_2003": "______________________", "s1_zt_2004": "_______________________", "s1_zt_2005": "_______________________", "s1_zt_2006": "_______________________", "s1_zt_2007": "________________________", "s1_zt_2008": "____________________W__", "s1_zt_2009": "PFFRVVWRVWPRWWWWRWWWWWW", "s1_zt_2010": "PWWPPPPPPPPFFPVVFRWVFFW", "s1_zt_2011": "VPVPPWPPRPPPPPPPFVRVFWW", "s1_zt_2012": "FPWPVWWVFFWPRPRRWWVRRWW", "s1_zt_2013": "PVFVWWPWWVPPPPVWVFWWWWV", "s1_zt_2014": "VWPWPWPWVPPPVWPFWWWFWWW", "s1_zt_2015": "PPPPFWPVPPPWWPPVWPRVWWF", "s1_zt_2016": "PPWPVVPWPFPWPWP_R______", "s1_zt_2017": "PPWPWPPWRPPF___________", "s1_zt_2018": "RVFPPPPWPPVFPWVRRWWVWRR", "s1_zt_2019": "PPVWPWPP_FRRPRV________", "s1_zt_2020": "VWWWRRWWPPW____________", "s1_zt_2021": "FWPFPPFPVWPPWVPWPRWWWR", "s1_zt_2022": "______________________", "s1_zt_2023": "______________________", "s1_zt_2024": "______________________", "s1_zt_2025": "______________________", "s1_zt_2026": "______________________", "bg_jy_01": "__________________________", "bg_jy_02": "__________________________", "bg_jy_03": "_______________________", "bg_jy_04": "P__________________________________", "bg_jy_05": "FFPVFFVPPPFPFFFPPPPVPPPPFVVRWPFWVVPFVVFVFFPPWFFPPFV", "bg_jy_06": "VPVVPFWPPPPPVFFVPPPFFFVVP__", "bg_jy_07": "WWWWWWWW", "bg_jy_08": "RRV", "bg_jy_09": "VRWWRRWWWW", "bg_jy_10": "_________", "bg_xt_01": "________________________________________________________________________________________", "bg_xt_02": "__________________________________________________________________", "bg_xt_03": "____________________________________________", "bg_xt_04": "PFPVPFWWPVFPPPWWWPRFWPPFPFPPPPWPVRFFFPPFPPWWVVVPPRVWWWRVRWR_______________", "bg_xt_05": "FFFPFFFRPPWWWWWWWWWRPWPPFPPWVRWVVWWWWFWVVWPVWWWWWWWWPWWWWWWWWWWWFVFVWWRRWRWWWWWFWWWWWWW", "bg_xt_06": "PWRPVWWWRWWWWWPPRPVVFVRWPVWWWPFVWVVWWWPFWWVVFWVPWWWWWWWWPPRVWRWWWRRRRRFPWW", "bg_xt_07": "WVWWWWWWWWWWRWWWWWWWWWWWWWWWWWWWWWW", "bg_xt_08": "RWRWWWWWWWWWWWWWW____________________R_______", "bg_xt_09": "VWVWWRRWWVFRWRWFWVRVRRVRVWWWWRWRRRRRRRW", "bg_xt_10": "WPW____________________________________", "dlut_852_11": "__________", "dlut_852_13": "___________", "dlut_852_14": "_________", "dlut_852_15": "____________", "dlut_852_16": "_________", "dlut_852_17": "________", "dlut_852_18": "________", "dlut_852_19": "________", "dlut_852_20": "________", "dlut_852_22": "__________________________", "dlut_852_24": "___________________", "nju_851_07": "WPR________", "nju_851_08": "FP_PFP_____", "nju_851_09": "___________", "nju_851_10": "___________", "nju_851_11": "___________", "nju_851_12": "_______", "nju_851_13": "_______", "nju_851_14": "_______", "nju_851_15": "_______", "nju_851_16": "_______", "nju_851_17": "_______", "nju_851_18": "_________", "nju_851_19": "___________", "nju_851_20": "PPPPWVWPWRPPFVFRVRV", "nju_851_21": "WPVRPPVVWPWPWWFRF___", "nju_851_22": "PPFPVVFWWWPPWWPFWWWWWW", "nju_851_23": "PVRRWWRWWWFP__PW__W___", "nju_851_24": "__________", "nju_851_25": "_F_______", "nju_851_26": "__________", "whu_807_10": "________", "whu_807_11": "________", "whu_807_12": "________", "whu_807_13": "__________", "whu_807_14": "__________", "whu_807_15": "__________", "whu_807_16": "__________", "whu_807_17": "__________", "whu_807_18": "__________", "whu_807_20": "__________", "whu_807_21": "______________", "whu_807_22": "__________", "whu_807_23": "____________________", "whu_807_24": "___________", "xmu_847_10": "_____", "xmu_847_11": "_________", "xmu_847_12": "_________", "xmu_847_13": "__________", "xmu_847_14": "_________", "xmu_847_15": "__________", "xmu_847_16": "________", "xmu_847_17": "_________", "xmu_847_18": "_________", "xmu_847_19": "_________", "xmu_847_20": "________", "xmu_847_21": "________", "xmu_847_22": "________", "xmu_847_23": "________", "xmu_847_24": "________", "xmu_847_25": "________", "hust_824_06": "______________", "hust_824_07": "____________________", "hust_824_08": "____________________", "hust_824_09": "__________________________________", "hust_824_10": "_________________________________", "hust_824_11": "_______________________________", "hust_824_12": "___________________________", "hust_824_13": "________________________", "hust_824_14": "________________", "hust_824_15": "__________________", "hust_824_16": "________________________", "hust_824_17": "____________", "hust_824_18": "____________________", "hust_824_19": "_______________________", "hust_824_20": "__________________________", "hust_824_21": "RRWWPPWRWWRRRWWWWWRV________", "hust_824_22": "____________________________", "hust_824_23": "____________________________", "hust_824_24": "____________________________", "bg_qh_01": "PPPPPPPWFPPPRWPPWPPPPFFWVPPPPPPFRFPFWVFFPVRPWPVWWP", "bg_qh_02": "PVVVRVFWRRPPPRPVRRPFPPPPPWRWWWPPPWWRWWWPVFWWRRRRR", "bg_qh_03": "PPPPPPWRVWPWPPP__________________", "bg_qh_04": "PPPVPPW___________P_________________________________________________", "bg_qh_05": "_____________________________________", "bg_qh_06": "_______________________________________________________", "bg_qh_07": "__________________", "bg_qh_08": "______________________", "nju_851_mn_26_01": "_________", "nju_851_mn_26_02": "_________", "nju_851_mn_26_03": "_________", "nju_851_mn_26_04": "_________", "nju_851_mn_26_05": "_________", "nju_851_mn_26_06": "_________", "nju_851_zm_26_01": "___________", "nju_851_zm_26_02": "_________", "nju_851_zm_26_03": "__________", "nju_851_zm_26_04": "_________", "nju_851_zm_26_05": "___________", "nju_851_zm_26_06": "_________", "nju_851_zm_25_01": "______", "nju_851_zm_25_02": "_______", "nju_851_zm_25_03": "__________", "nju_851_zm_25_04": "_________", "nju_851_zm_25_05": "_________", "nju_851_zm_25_06": "________", "moni_ll_01": "______________________", "moni_ll_02": "______________________", "moni_ll_03": "______________________", "moni_ll_04": "______________________", "moni_ll_05": "______________________", "moni_ll_06": "______________________", "moni_zy_01": "RWFWPPWRWWPWVWFVRWWWRW", "moni_zy_02": "FPVWWWWVPWPVRWRVPWWVRW", "moni_zy_03": "______________________", "moni_zy_04": "______________________", "moni_zy_05": "______________________", "moni_zy_06": "______________________", "moni_zy_07": "______________________", "moni_zy_08": "______________________", "xuantian_ll26_01": "________________", "xuantian_ll26_02": "VPP_P_____F__P__", "xuantian_ll26_03": "VPW_____________", "xuantian_ll26_04": "________________", "xuantian_ll26_05": "________________", "xuantian_ll26_06": "________________", "pol_b25728-c100402": "F________", "pol_b25728-c100403": "___________________________________________________________________________________", "pol_b25728-c100404": "___________________________________________________________", "pol_b25728-c100405": "________________________________________________________", "pol_b25728-c100406": "WWWWWWFVWWVVVVWFFFWVWRFVWVRWVWWWRFFVWWFWFWWFWWRWFFFVWWWWWWWWWWVWPVFVVWWWWWWVWWWWWWWVVWFWWWWWW____________________", "pol_b25728-c100407": "____________________________________________", "pol_b25728-c100408": "__________________________", "pol_b25728-c100409": "______", "pol_b25728-c100410": "V___", "pol_b25728-c100411": "__________", "pol_b25728-c100412": "_____________________________________", "pol_b25728-c100413": "_______________________", "pol_b25728-c100414": "_________________", "pol_b25728-c100415": "__", "pol_b25728-c100416": "_____________", "pol_b25728-c100417": "_____", "pol_b25728-c100418": "____", "pol_b25728-c100421": "___________", "pol_b25728-c100422": "__________", "pol_b25728-c100423": "_______", "pol_b25728-c100424": "________", "pol_b25728-c100425": "________", "pol_b25728-c100426": "_________________", "pol_b25728-c100427": "_________________________________", "pol_b25728-c100428": "_________", "pol_b25728-c100429": "________________________", "pol_b25728-c100430": "__________", "pol_b25728-c100431": "__________________", "pol_b25728-c100432": "____________", "pol_b25728-c100433": "________", "pol_b25728-c100439": "__________", "pol_b25728-c100435": "_______", "pol_b25728-c100436": "__________", "pol_b25728-c100437": "_____", "pol_b25728-c100438": "_____________", "pol_b25728-c100440": "______________________", "pol_b25728-c100441": "______________________", "pol_b25728-c100442": "________________________", "pol_b25728-c100443": "_________________________________________", "pol_b25728-c100444": "______________________", "pol_b25728-c100445": "__________________________________________", "pol_b25728-c100446": "_______________________", "pol_b25728-c100447": "____________________________________", "pol_b25728-c100448": "____________", "pol_b25728-c100449": "_______", "pol_b25728-c100450": "_______", "pol_b25728-c100451": "________________", "pol_b25728-c100452": "__________", "pol_b25728-c100453": "_______________", "pol_b25728-c100454": "______________", "pol_b25728-c100455": "_________________________________________", "pol_b25728-c100456": "_______________________________________________________________"};
  var CAMP21_CHAPTER_META = {"ch1": {"t": 54, "s": "s1", "n": "基础30讲 - 高数 - 第1讲 函数极限与连续", "w": "基础30讲"}, "ch2": {"t": 26, "s": "s1", "n": "基础30讲 - 高数 - 第2讲 数列极限", "w": "基础30讲"}, "ch3": {"t": 21, "s": "s1", "n": "基础30讲 - 高数 - 第3讲 一元函数微分学的概念", "w": "基础30讲"}, "ch4": {"t": 27, "s": "s1", "n": "基础30讲 - 高数 - 第4讲 一元函数微分学的计算", "w": "基础30讲"}, "ch5": {"t": 24, "s": "s1", "n": "基础30讲 - 高数 - 第5讲 一元函数微分学的应用（一）", "w": "基础30讲"}, "ch6": {"t": 31, "s": "s1", "n": "基础30讲 - 高数 - 第6讲一元函数微分学的应用（二）", "w": "基础30讲"}, "ch7": {"t": 9, "s": "s1", "n": "基础30讲 - 高数 - 第7讲 一元函数微分学的应用（三）", "w": "基础30讲"}, "ch8": {"t": 26, "s": "s1", "n": "基础30讲 - 高数 - 第8讲 一元函数积分学的概念与性质", "w": "基础30讲"}, "ch9": {"t": 46, "s": "s1", "n": "基础30讲 - 高数 - 第9讲 一元函数积分学的计算", "w": "基础30讲"}, "ch10": {"t": 23, "s": "s1", "n": "基础30讲 - 高数 - 第10讲 一元函数积分学的应用（一）", "w": "基础30讲"}, "ch11": {"t": 17, "s": "s1", "n": "基础30讲 - 高数 - 第11讲 一元函数积分学的应用（二）", "w": "基础30讲"}, "ch12": {"t": 8, "s": "s1", "n": "基础30讲 - 高数 - 第12讲 一元函数积分学的应用（三）", "w": "基础30讲"}, "ch13": {"t": 36, "s": "s1", "n": "基础30讲 - 高数 - 第13讲 多元函数微分学", "w": "基础30讲"}, "ch14": {"t": 29, "s": "s1", "n": "基础30讲 - 高数 - 第14讲 二重积分", "w": "基础30讲"}, "ch15": {"t": 40, "s": "s1", "n": "基础30讲 - 高数 - 第15讲 微分方程", "w": "基础30讲"}, "ch16": {"t": 56, "s": "s1", "n": "基础30讲 - 高数 - 第16讲 无穷级数（仅数一、数三）", "w": "基础30讲"}, "ch17": {"t": 23, "s": "s1", "n": "基础30讲 - 高数 - 第17讲 多元函数积分学的预备知识（仅数一）", "w": "基础30讲"}, "ch18": {"t": 41, "s": "s1", "n": "基础30讲 - 高数 - 第18讲 多元函数积分学（仅数一）", "w": "基础30讲"}, "ch19": {"t": 24, "s": "s1", "n": "基础30讲 - 线代 - 第1讲 行列式", "w": "基础30讲"}, "ch20": {"t": 35, "s": "s1", "n": "基础30讲 - 线代 - 第2讲 矩阵", "w": "基础30讲"}, "ch21": {"t": 26, "s": "s1", "n": "基础30讲 - 线代 - 第3讲 向量组", "w": "基础30讲"}, "ch22": {"t": 25, "s": "s1", "n": "基础30讲 - 线代 - 第4讲 线性方程组", "w": "基础30讲"}, "ch23": {"t": 34, "s": "s1", "n": "基础30讲 - 线代 - 第5讲 特征值与特征向量", "w": "基础30讲"}, "ch24": {"t": 25, "s": "s1", "n": "基础30讲 - 线代 - 第6讲 二次型", "w": "基础30讲"}, "ch25": {"t": 34, "s": "s1", "n": "基础30讲 - 概率论 - 第1讲 随机事件与概率", "w": "基础30讲"}, "ch26": {"t": 36, "s": "s1", "n": "基础30讲 - 概率论 - 第2讲 一维随机变量及其分布", "w": "基础30讲"}, "ch27": {"t": 30, "s": "s1", "n": "基础30讲 - 概率论 - 第3讲 多维随机变量及其分布", "w": "基础30讲"}, "ch28": {"t": 26, "s": "s1", "n": "基础30讲 - 概率论 - 第4讲 随机变量的数字特征", "w": "基础30讲"}, "ch29": {"t": 11, "s": "s1", "n": "基础30讲 - 概率论 - 第5讲 大数定律与中心极限定理", "w": "基础30讲"}, "ch30": {"t": 29, "s": "s1", "n": "基础30讲 - 概率论 - 第6讲 数理统计", "w": "基础30讲"}, "ch31": {"t": 15, "s": "s1", "n": "强化36讲 - 高数 - 第1讲 函数极限与连续", "w": "强化36讲"}, "ch32": {"t": 13, "s": "s1", "n": "强化36讲 - 高数 - 第2讲 数列极限", "w": "强化36讲"}, "ch33": {"t": 8, "s": "s1", "n": "强化36讲 - 高数 - 第3讲 一元函数微分学的概念", "w": "强化36讲"}, "ch34": {"t": 9, "s": "s1", "n": "强化36讲 - 高数 - 第4讲 一元函数微分学的计算", "w": "强化36讲"}, "ch35": {"t": 9, "s": "s1", "n": "强化36讲 - 高数 - 第5讲 一元函数微分学的应用（一）—几何应用", "w": "强化36讲"}, "ch36": {"t": 22, "s": "s1", "n": "强化36讲 - 高数 - 第6讲 一元函数微分学的应用（二）—中值定理等", "w": "强化36讲"}, "ch37": {"t": 5, "s": "s1", "n": "强化36讲 - 高数 - 第7讲 一元函数微分学的应用（三）—物理应用与经济应用", "w": "强化36讲"}, "ch38": {"t": 8, "s": "s1", "n": "强化36讲 - 高数 - 第8讲 一元函数积分学的概念与性质", "w": "强化36讲"}, "ch39": {"t": 22, "s": "s1", "n": "强化36讲 - 高数 - 第9讲 一元函数积分学的概念与性质", "w": "强化36讲"}, "ch40": {"t": 15, "s": "s1", "n": "强化36讲 - 高数 - 第10讲 一元函数积分学的应用（一）—几何应用", "w": "强化36讲"}, "ch41": {"t": 19, "s": "s1", "n": "强化36讲 - 高数 - 第11讲 一元函数积分学的应用（二）—积分等式与积分不等式", "w": "强化36讲"}, "ch42": {"t": 7, "s": "s1", "n": "强化36讲 - 高数 - 第12讲 一元函数积分学的应用（三）—物理应用与经济应用", "w": "强化36讲"}, "ch43": {"t": 32, "s": "s1", "n": "强化36讲 - 高数 - 第13讲 多元函数微分学", "w": "强化36讲"}, "ch44": {"t": 8, "s": "s1", "n": "强化36讲 - 高数 - 第14讲 二重积分", "w": "强化36讲"}, "ch45": {"t": 19, "s": "s1", "n": "强化36讲 - 高数 - 第15讲 微分方程", "w": "强化36讲"}, "ch46": {"t": 57, "s": "s1", "n": "强化36讲 - 高数 - 第16讲 无穷级数（仅数一、三）", "w": "强化36讲"}, "ch47": {"t": 7, "s": "s1", "n": "强化36讲 - 高数 - 第17讲 多元函数积分学的预备知识（仅数一）", "w": "强化36讲"}, "ch48": {"t": 29, "s": "s1", "n": "强化36讲 - 高数 - 第18讲 多元函数积分学（仅数一）", "w": "强化36讲"}, "ch49": {"t": 7, "s": "s1", "n": "强化36讲 - 线代 - 第1讲 行列式", "w": "强化36讲"}, "ch50": {"t": 4, "s": "s1", "n": "强化36讲 - 线代 - 第2讲 余子式和代数余子式的计算", "w": "强化36讲"}, "ch51": {"t": 20, "s": "s1", "n": "强化36讲 - 线代 - 第3讲 矩阵运算", "w": "强化36讲"}, "ch52": {"t": 9, "s": "s1", "n": "强化36讲 - 线代 - 第4讲 矩阵的秩", "w": "强化36讲"}, "ch53": {"t": 10, "s": "s1", "n": "强化36讲 - 线代 - 第5讲 线性方程组", "w": "强化36讲"}, "ch54": {"t": 7, "s": "s1", "n": "强化36讲 - 线代 - 第6讲 向量组", "w": "强化36讲"}, "ch55": {"t": 4, "s": "s1", "n": "强化36讲 - 线代 - 第7讲 特征值与特征向量", "w": "强化36讲"}, "ch56": {"t": 10, "s": "s1", "n": "强化36讲 - 线代 - 第8讲 相似理论", "w": "强化36讲"}, "ch57": {"t": 15, "s": "s1", "n": "强化36讲 - 线代 - 第9讲 二次型", "w": "强化36讲"}, "ch58": {"t": 10, "s": "s1", "n": "强化36讲 - 概率论 - 第1讲 随机事件和概率", "w": "强化36讲"}, "ch59": {"t": 12, "s": "s1", "n": "强化36讲 - 概率论 - 第2讲 一维随机变量及其分布", "w": "强化36讲"}, "ch60": {"t": 6, "s": "s1", "n": "强化36讲 - 概率论 - 第3讲 一维随机变量函数的分布", "w": "强化36讲"}, "ch61": {"t": 4, "s": "s1", "n": "强化36讲 - 概率论 - 第4讲 多维随机变量及其分布", "w": "强化36讲"}, "ch62": {"t": 9, "s": "s1", "n": "强化36讲 - 概率论 - 第5讲 多维随机变量函数的分布", "w": "强化36讲"}, "ch63": {"t": 10, "s": "s1", "n": "强化36讲 - 概率论 - 第6讲 数字特征", "w": "强化36讲"}, "ch64": {"t": 3, "s": "s1", "n": "强化36讲 - 概率论 - 第7讲 大数定律与中心极限定理", "w": "强化36讲"}, "ch65": {"t": 5, "s": "s1", "n": "强化36讲 - 概率论 - 第8讲 统计量及其分布", "w": "强化36讲"}, "ch66": {"t": 12, "s": "s1", "n": "强化36讲 - 概率论 - 第9讲 参数估计与假设检验", "w": "强化36讲"}, "ch67": {"t": 23, "s": "s1", "n": "1000题 - 基础篇-高数 - 第1章 函数极限与连续", "w": "1000题"}, "ch68": {"t": 12, "s": "s1", "n": "1000题 - 基础篇-高数 - 第2讲 数列极限", "w": "1000题"}, "ch69": {"t": 15, "s": "s1", "n": "1000题 - 基础篇-高数 - 第3章 一元函数微分学的概念", "w": "1000题"}, "ch70": {"t": 18, "s": "s1", "n": "1000题 - 基础篇-高数 - 第4章 一元函数微分学的计算", "w": "1000题"}, "ch71": {"t": 24, "s": "s1", "n": "1000题 - 基础篇-高数 - 第5章 一元函数微分学的应用（一）—几何应用", "w": "1000题"}, "ch72": {"t": 22, "s": "s1", "n": "1000题 - 基础篇-高数 - 第6章 一元函数微分学的应用（二）—中值定理与不等式", "w": "1000题"}, "ch73": {"t": 5, "s": "s1", "n": "1000题 - 基础篇-高数 - 第7章 一元函数微分学的应用（三）—物理应用", "w": "1000题"}, "ch74": {"t": 25, "s": "s1", "n": "1000题 - 基础篇-高数 - 第8章 一元函数积分学的概念与性质", "w": "1000题"}, "ch75": {"t": 36, "s": "s1", "n": "1000题 - 基础篇-高数 - 第9章 一元函数积分学的计算", "w": "1000题"}, "ch76": {"t": 19, "s": "s1", "n": "1000题 - 基础篇-高数 - 第10章 一元函数积分的应用（一）—几何应用", "w": "1000题"}, "ch77": {"t": 11, "s": "s1", "n": "1000题 - 基础篇-高数 - 第11章 一元函数积分学的应用（二）—积分等式与积分不等式", "w": "1000题"}, "ch78": {"t": 7, "s": "s1", "n": "1000题 - 基础篇-高数 - 第12章 一元函数积分学的应用（三）—物理应用", "w": "1000题"}, "ch79": {"t": 24, "s": "s1", "n": "1000题 - 基础篇-高数 - 第13章 多元函数微分学", "w": "1000题"}, "ch80": {"t": 24, "s": "s1", "n": "1000题 - 基础篇-高数 - 第14章 二重积分", "w": "1000题"}, "ch81": {"t": 21, "s": "s1", "n": "1000题 - 基础篇-高数 - 第15章 微分方程", "w": "1000题"}, "ch82": {"t": 19, "s": "s1", "n": "1000题 - 基础篇-高数 - 第16章 无穷级数", "w": "1000题"}, "ch83": {"t": 14, "s": "s1", "n": "1000题 - 基础篇-高数 - 第17章 多元函数积分学的预备知识", "w": "1000题"}, "ch84": {"t": 16, "s": "s1", "n": "1000题 - 基础篇-高数 - 第18章 多元函数积分学", "w": "1000题"}, "ch85": {"t": 16, "s": "s1", "n": "1000题 - 基础篇-高数 - 零基础", "w": "1000题"}, "ch86": {"t": 38, "s": "s1", "n": "1000题 - 强化篇-高数 - 第1章 函数极限与连续", "w": "1000题"}, "ch87": {"t": 11, "s": "s1", "n": "1000题 - 强化篇-高数 - 第2章 数列极限", "w": "1000题"}, "ch88": {"t": 22, "s": "s1", "n": "1000题 - 强化篇-高数 - 第3章 一元函数微分学的概念", "w": "1000题"}, "ch89": {"t": 16, "s": "s1", "n": "1000题 - 强化篇-高数 - 第4章 一元函数微分学的计算", "w": "1000题"}, "ch90": {"t": 33, "s": "s1", "n": "1000题 - 强化篇-高数 - 第5章 一元函数微分学的应用—几何应用", "w": "1000题"}, "ch91": {"t": 21, "s": "s1", "n": "1000题 - 强化篇-高数 - 第6章 一元函数为分析的应用—中值定理等", "w": "1000题"}, "ch92": {"t": 3, "s": "s1", "n": "1000题 - 强化篇-高数 - 第7章 一元函数微分学的应用—物理应用", "w": "1000题"}, "ch93": {"t": 19, "s": "s1", "n": "1000题 - 强化篇-高数 - 第8章 一元函数积分学的概念与性质", "w": "1000题"}, "ch94": {"t": 28, "s": "s1", "n": "1000题 - 强化篇-高数 - 第9章 一元函数积分学的计算", "w": "1000题"}, "ch95": {"t": 26, "s": "s1", "n": "1000题 - 强化篇-高数 - 第10章 一元函数积分学的应用—几何应用", "w": "1000题"}, "ch96": {"t": 9, "s": "s1", "n": "1000题 - 强化篇-高数 - 第11章 一元函数积分学的应用—积分等式与积分不等式", "w": "1000题"}, "ch97": {"t": 5, "s": "s1", "n": "1000题 - 强化篇-高数 - 第12章 一元函数积分学的应用—物理应用", "w": "1000题"}, "ch98": {"t": 40, "s": "s1", "n": "1000题 - 强化篇-高数 - 第13章 多元函数微分学", "w": "1000题"}, "ch99": {"t": 41, "s": "s1", "n": "1000题 - 强化篇-高数 - 第14章 二重积分", "w": "1000题"}, "ch100": {"t": 40, "s": "s1", "n": "1000题 - 强化篇-高数 - 第15章 微分方程", "w": "1000题"}, "ch101": {"t": 40, "s": "s1", "n": "1000题 - 强化篇-高数 - 第16章 无穷级数", "w": "1000题"}, "ch102": {"t": 15, "s": "s1", "n": "1000题 - 强化篇-高数 - 第17章 多元函数积分学的预备知识", "w": "1000题"}, "ch103": {"t": 29, "s": "s1", "n": "1000题 - 强化篇-高数 - 第18章 多元函数积分学", "w": "1000题"}, "ch104": {"t": 11, "s": "s1", "n": "1000题 - 基础篇-线代 - 第1章 行列式", "w": "1000题"}, "ch105": {"t": 19, "s": "s1", "n": "1000题 - 基础篇-线代 - 第2章 矩阵", "w": "1000题"}, "ch106": {"t": 15, "s": "s1", "n": "1000题 - 基础篇-线代 - 第3章 向量组", "w": "1000题"}, "ch107": {"t": 17, "s": "s1", "n": "1000题 - 基础篇-线代 - 第4章 线性方程组", "w": "1000题"}, "ch108": {"t": 23, "s": "s1", "n": "1000题 - 基础篇-线代 - 第5章 特征值与特征向量", "w": "1000题"}, "ch109": {"t": 22, "s": "s1", "n": "1000题 - 基础篇-线代 - 第6章 二次型", "w": "1000题"}, "ch110": {"t": 7, "s": "s1", "n": "1000题 - 强化篇-线代 - 第1章 行列式", "w": "1000题"}, "ch111": {"t": 4, "s": "s1", "n": "1000题 - 强化篇-线代 - 第2章 余子式和代数余子式的计算", "w": "1000题"}, "ch112": {"t": 10, "s": "s1", "n": "1000题 - 强化篇-线代 - 第3章 矩阵运算", "w": "1000题"}, "ch113": {"t": 8, "s": "s1", "n": "1000题 - 强化篇-线代 - 第4章 矩阵的秩", "w": "1000题"}, "ch114": {"t": 15, "s": "s1", "n": "1000题 - 强化篇-线代 - 第5章 线性方程组", "w": "1000题"}, "ch115": {"t": 11, "s": "s1", "n": "1000题 - 强化篇-线代 - 第6章 向量组", "w": "1000题"}, "ch116": {"t": 9, "s": "s1", "n": "1000题 - 强化篇-线代 - 第7章 特征值与特征向量", "w": "1000题"}, "ch117": {"t": 21, "s": "s1", "n": "1000题 - 强化篇-线代 - 第8章 相似理论", "w": "1000题"}, "ch118": {"t": 27, "s": "s1", "n": "1000题 - 强化篇-线代 - 第9章 二次型", "w": "1000题"}, "ch119": {"t": 14, "s": "s1", "n": "1000题 - 基础篇-概率论 - 第1章 随机事件与概率", "w": "1000题"}, "ch120": {"t": 11, "s": "s1", "n": "1000题 - 基础篇-概率论 - 第2章 一维随机变量及其分布", "w": "1000题"}, "ch121": {"t": 14, "s": "s1", "n": "1000题 - 基础篇-概率论 - 第3章 多维随机变量的数字特征", "w": "1000题"}, "ch122": {"t": 21, "s": "s1", "n": "1000题 - 基础篇-概率论 - 第4章 随机变量的数字特征", "w": "1000题"}, "ch123": {"t": 8, "s": "s1", "n": "1000题 - 基础篇-概率论 - 第5章 大数定律与中心极限定理", "w": "1000题"}, "ch124": {"t": 24, "s": "s1", "n": "1000题 - 基础篇-概率论 - 第6章 数理统计", "w": "1000题"}, "ch125": {"t": 6, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第1章 随机事件和概率", "w": "1000题"}, "ch126": {"t": 9, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第2章 一维随机变量及其分布", "w": "1000题"}, "ch127": {"t": 7, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第3章 一维随机变量函数的分布", "w": "1000题"}, "ch128": {"t": 7, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第4章 多维随机变量及其分布", "w": "1000题"}, "ch129": {"t": 12, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第5章 多维随机变量函数的分布", "w": "1000题"}, "ch130": {"t": 21, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第6章 数字特征", "w": "1000题"}, "ch131": {"t": 4, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第7章 大数定律与中心极限定理", "w": "1000题"}, "ch132": {"t": 12, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第8章 统计量及其分布", "w": "1000题"}, "ch133": {"t": 30, "s": "s1", "n": "1000题 - 强化篇-概率论 - 第9章 参数估计与假设检验", "w": "1000题"}, "ch134": {"t": 41, "s": "s1", "n": "李范全书 - 高数 - 第1章 极限、连续与求极限的方法", "w": "李范全书"}, "ch135": {"t": 39, "s": "s1", "n": "李范全书 - 高数 - 第2章 一元函数的导数与微分概念及其计算", "w": "李范全书"}, "ch136": {"t": 63, "s": "s1", "n": "李范全书 - 高数 - 第3章 一元函数积分概念、计算及应用", "w": "李范全书"}, "ch137": {"t": 43, "s": "s1", "n": "李范全书 - 高数 - 第4章 微分中值定理及其应用", "w": "李范全书"}, "ch138": {"t": 16, "s": "s1", "n": "李范全书 - 高数 - 第5章 一元函数的泰勒公式及其应用", "w": "李范全书"}, "ch139": {"t": 24, "s": "s1", "n": "李范全书 - 高数 - 第6章 常微分方程", "w": "李范全书"}, "ch140": {"t": 20, "s": "s1", "n": "李范全书 - 高数 - 第7章 向量代数和空间解析几何", "w": "李范全书"}, "ch141": {"t": 32, "s": "s1", "n": "李范全书 - 高数 - 第8章 多元函数微分学", "w": "李范全书"}, "ch142": {"t": 70, "s": "s1", "n": "李范全书 - 高数 - 第9章 多元函数积分的概念、计算及其应用", "w": "李范全书"}, "ch143": {"t": 25, "s": "s1", "n": "李范全书 - 高数 - 第10章 多元函数积分学中的基本公式及其应用", "w": "李范全书"}, "ch144": {"t": 26, "s": "s1", "n": "李范全书 - 高数 - 第11章 无穷级数", "w": "李范全书"}, "ch145": {"t": 22, "s": "s1", "n": "李范全书 - 线代 - 第1章 行列式", "w": "李范全书"}, "ch146": {"t": 41, "s": "s1", "n": "李范全书 - 线代 - 第2章 矩阵", "w": "李范全书"}, "ch147": {"t": 57, "s": "s1", "n": "李范全书 - 线代 - 第3章 向量组的线性关系与秩", "w": "李范全书"}, "ch148": {"t": 38, "s": "s1", "n": "李范全书 - 线代 - 第4章 线性方程组", "w": "李范全书"}, "ch149": {"t": 49, "s": "s1", "n": "李范全书 - 线代 - 第5章 特征向量与特征值，相似，对角化", "w": "李范全书"}, "ch150": {"t": 31, "s": "s1", "n": "李范全书 - 线代 - 第6章 二次型", "w": "李范全书"}, "ch151": {"t": 27, "s": "s1", "n": "李范全书 - 概率论 - 第1章 随机事件和概率", "w": "李范全书"}, "ch152": {"t": 34, "s": "s1", "n": "李范全书 - 概率论 - 第2章 随机变量及其分布", "w": "李范全书"}, "ch153": {"t": 30, "s": "s1", "n": "李范全书 - 概率论 - 第3章 多维随机变量及其分布", "w": "李范全书"}, "ch154": {"t": 28, "s": "s1", "n": "李范全书 - 概率论 - 第4章 随机变量的数字特征", "w": "李范全书"}, "ch155": {"t": 13, "s": "s1", "n": "李范全书 - 概率论 - 第5章 大数定律和中心极限定理", "w": "李范全书"}, "ch156": {"t": 17, "s": "s1", "n": "李范全书 - 概率论 - 第6章 数理统计的基本概念", "w": "李范全书"}, "ch157": {"t": 20, "s": "s1", "n": "李范全书 - 概率论 - 第7章 参数估计和假设检验", "w": "李范全书"}, "ch158": {"t": 58, "s": "s1", "n": "李林880 - 高数 - 第1章 函数、极限、连续", "w": "李林880"}, "ch159": {"t": 114, "s": "s1", "n": "李林880 - 高数 - 第2章 一元函数微分学", "w": "李林880"}, "ch160": {"t": 135, "s": "s1", "n": "李林880 - 高数 - 第3章 一元函数积分学", "w": "李林880"}, "ch161": {"t": 25, "s": "s1", "n": "李林880 - 高数 - 第4章 空间解析几何", "w": "李林880"}, "ch162": {"t": 68, "s": "s1", "n": "李林880 - 高数 - 第5章 多元函数微分学", "w": "李林880"}, "ch163": {"t": 82, "s": "s1", "n": "李林880 - 高数 - 第6章 重积分", "w": "李林880"}, "ch164": {"t": 66, "s": "s1", "n": "李林880 - 高数 - 第7章 微分方程", "w": "李林880"}, "ch165": {"t": 71, "s": "s1", "n": "李林880 - 高数 - 第8章 无穷级数", "w": "李林880"}, "ch166": {"t": 68, "s": "s1", "n": "李林880 - 高数 - 第9章 曲线积分与曲面积分", "w": "李林880"}, "ch167": {"t": 34, "s": "s1", "n": "李林880 - 线代 - 第10章 行列式", "w": "李林880"}, "ch168": {"t": 49, "s": "s1", "n": "李林880 - 线代 - 第11章 矩阵", "w": "李林880"}, "ch169": {"t": 39, "s": "s1", "n": "李林880 - 线代 - 第12章 向量", "w": "李林880"}, "ch170": {"t": 48, "s": "s1", "n": "李林880 - 线代 - 第13章 线性方程组", "w": "李林880"}, "ch171": {"t": 56, "s": "s1", "n": "李林880 - 线代 - 第14章 相似矩阵", "w": "李林880"}, "ch172": {"t": 55, "s": "s1", "n": "李林880 - 线代 - 第15章 二次型", "w": "李林880"}, "ch173": {"t": 24, "s": "s1", "n": "李林880 - 概率论 - 第16章 随机事件及其概率", "w": "李林880"}, "ch174": {"t": 33, "s": "s1", "n": "李林880 - 概率论 - 第17章 随机变量及其分布", "w": "李林880"}, "ch175": {"t": 40, "s": "s1", "n": "李林880 - 概率论 - 第18章 多维随机变量及其分布", "w": "李林880"}, "ch176": {"t": 50, "s": "s1", "n": "李林880 - 概率论 - 第19章 随机变量的数字特征", "w": "李林880"}, "ch177": {"t": 10, "s": "s1", "n": "李林880 - 概率论 - 第20章 大数定律与中心极限定理", "w": "李林880"}, "ch178": {"t": 25, "s": "s1", "n": "李林880 - 概率论 - 第21章 数理统计的基本概念", "w": "李林880"}, "ch179": {"t": 24, "s": "s1", "n": "李林880 - 概率论 - 第22章 参数估计", "w": "李林880"}, "ch180": {"t": 7, "s": "s1", "n": "李林880 - 概率论 - 第23章 假设检验", "w": "李林880"}, "opt880-ch01": {"t": 75, "s": "s1", "n": "李林880优化版 - 高数 - 第1章 函数、极限、连续", "w": "李林880优化版"}, "opt880-ch02": {"t": 123, "s": "s1", "n": "李林880优化版 - 高数 - 第2章 一元函数微分学及其应用", "w": "李林880优化版"}, "opt880-ch03": {"t": 176, "s": "s1", "n": "李林880优化版 - 高数 - 第3章 一元函数积分学及其应用", "w": "李林880优化版"}, "opt880-ch04": {"t": 28, "s": "s1", "n": "李林880优化版 - 高数 - 第4章 空间解析几何", "w": "李林880优化版"}, "opt880-ch05": {"t": 74, "s": "s1", "n": "李林880优化版 - 高数 - 第5章 多元函数微分学及其应用", "w": "李林880优化版"}, "opt880-ch06": {"t": 84, "s": "s1", "n": "李林880优化版 - 高数 - 第6章 重积分及其应用", "w": "李林880优化版"}, "opt880-ch07": {"t": 73, "s": "s1", "n": "李林880优化版 - 高数 - 第7章 微分方程及其应用", "w": "李林880优化版"}, "opt880-ch08": {"t": 96, "s": "s1", "n": "李林880优化版 - 高数 - 第8章 无穷级数", "w": "李林880优化版"}, "opt880-ch09": {"t": 77, "s": "s1", "n": "李林880优化版 - 高数 - 第9章 曲线积分与曲面积分", "w": "李林880优化版"}, "opt880-ch10": {"t": 33, "s": "s1", "n": "李林880优化版 - 线代 - 第10章 行列式", "w": "李林880优化版"}, "opt880-ch11": {"t": 47, "s": "s1", "n": "李林880优化版 - 线代 - 第11章 矩阵", "w": "李林880优化版"}, "opt880-ch12": {"t": 44, "s": "s1", "n": "李林880优化版 - 线代 - 第12章 向量", "w": "李林880优化版"}, "opt880-ch13": {"t": 52, "s": "s1", "n": "李林880优化版 - 线代 - 第13章 线性方程组", "w": "李林880优化版"}, "opt880-ch14": {"t": 82, "s": "s1", "n": "李林880优化版 - 线代 - 第14章 相似矩阵", "w": "李林880优化版"}, "opt880-ch15": {"t": 76, "s": "s1", "n": "李林880优化版 - 线代 - 第15章 二次型", "w": "李林880优化版"}, "opt880-ch16": {"t": 30, "s": "s1", "n": "李林880优化版 - 概率论 - 第16章 随机事件及其概率", "w": "李林880优化版"}, "opt880-ch17": {"t": 32, "s": "s1", "n": "李林880优化版 - 概率论 - 第17章 随机变量及其分布", "w": "李林880优化版"}, "opt880-ch18": {"t": 53, "s": "s1", "n": "李林880优化版 - 概率论 - 第18章 多维随机变量及其分布", "w": "李林880优化版"}, "opt880-ch19": {"t": 62, "s": "s1", "n": "李林880优化版 - 概率论 - 第19章 随机变量的数字特征", "w": "李林880优化版"}, "opt880-ch20": {"t": 9, "s": "s1", "n": "李林880优化版 - 概率论 - 第20章 大数定律与中心极限定理", "w": "李林880优化版"}, "opt880-ch21": {"t": 30, "s": "s1", "n": "李林880优化版 - 概率论 - 第21章 数理统计的基本概念", "w": "李林880优化版"}, "opt880-ch22": {"t": 46, "s": "s1", "n": "李林880优化版 - 概率论 - 第22章 参数估计", "w": "李林880优化版"}, "opt880-ch23": {"t": 6, "s": "s1", "n": "李林880优化版 - 概率论 - 第23章 假设检验", "w": "李林880优化版"}, "ch261": {"t": 55, "s": "s1", "n": "李艳芳900 - 高数 - 第1章 函数、极限、连续", "w": "李艳芳900"}, "ch262": {"t": 100, "s": "s1", "n": "李艳芳900 - 高数 - 第2章 一元函数微分学", "w": "李艳芳900"}, "ch263": {"t": 85, "s": "s1", "n": "李艳芳900 - 高数 - 第3章 一元函数积分学", "w": "李艳芳900"}, "ch264": {"t": 10, "s": "s1", "n": "李艳芳900 - 高数 - 第4章 向量代数与空间解析几何", "w": "李艳芳900"}, "ch265": {"t": 65, "s": "s1", "n": "李艳芳900 - 高数 - 第5章 多元函数微分学", "w": "李艳芳900"}, "ch266": {"t": 60, "s": "s1", "n": "李艳芳900 - 高数 - 第6章 重积分及其应用", "w": "李艳芳900"}, "ch267": {"t": 60, "s": "s1", "n": "李艳芳900 - 高数 - 第7章 常微分方程", "w": "李艳芳900"}, "ch268": {"t": 55, "s": "s1", "n": "李艳芳900 - 高数 - 第8章 无穷级数", "w": "李艳芳900"}, "ch269": {"t": 45, "s": "s1", "n": "李艳芳900 - 高数 - 第9章 曲线积分与曲面积分", "w": "李艳芳900"}, "ch270": {"t": 19, "s": "s1", "n": "李艳芳900 - 线代 - 第10章 行列式", "w": "李艳芳900"}, "ch271": {"t": 33, "s": "s1", "n": "李艳芳900 - 线代 - 第11章 矩阵", "w": "李艳芳900"}, "ch272": {"t": 28, "s": "s1", "n": "李艳芳900 - 线代 - 第12章 向量", "w": "李艳芳900"}, "ch273": {"t": 34, "s": "s1", "n": "李艳芳900 - 线代 - 第13章 线性方程组", "w": "李艳芳900"}, "ch274": {"t": 39, "s": "s1", "n": "李艳芳900 - 线代 - 第14章 矩阵的特征值与特征向量", "w": "李艳芳900"}, "ch275": {"t": 37, "s": "s1", "n": "李艳芳900 - 线代 - 第15章 二次型", "w": "李艳芳900"}, "ch276": {"t": 24, "s": "s1", "n": "李艳芳900 - 概率论 - 第16章 随机事件及其概率", "w": "李艳芳900"}, "ch277": {"t": 33, "s": "s1", "n": "李艳芳900 - 概率论 - 第17章 随机变量及其分布", "w": "李艳芳900"}, "ch278": {"t": 34, "s": "s1", "n": "李艳芳900 - 概率论 - 第18章 多维随机变量及其分布", "w": "李艳芳900"}, "ch279": {"t": 36, "s": "s1", "n": "李艳芳900 - 概率论 - 第19章 随机变量的数字特征", "w": "李艳芳900"}, "ch280": {"t": 10, "s": "s1", "n": "李艳芳900 - 概率论 - 第20章 大数定律与中心极限定理", "w": "李艳芳900"}, "ch281": {"t": 15, "s": "s1", "n": "李艳芳900 - 概率论 - 第21章 数理统计的基本概念", "w": "李艳芳900"}, "ch282": {"t": 19, "s": "s1", "n": "李艳芳900 - 概率论 - 第22章 参数估计", "w": "李艳芳900"}, "ch283": {"t": 4, "s": "s1", "n": "李艳芳900 - 概率论 - 第23章 假设检验", "w": "李艳芳900"}, "yeyu_gd_01": {"t": 54, "s": "s1", "n": "夜雨强化 - 高数 - 第1章 极限", "w": "夜雨强化"}, "yeyu_gd_02": {"t": 47, "s": "s1", "n": "夜雨强化 - 高数 - 第2章 导数与高阶导数", "w": "夜雨强化"}, "yeyu_gd_03": {"t": 25, "s": "s1", "n": "夜雨强化 - 高数 - 第3章 极值点与拐点", "w": "夜雨强化"}, "yeyu_gd_04": {"t": 100, "s": "s1", "n": "夜雨强化 - 高数 - 第4章 微分中值定理与不等式证明", "w": "夜雨强化"}, "yeyu_gd_05": {"t": 63, "s": "s1", "n": "夜雨强化 - 高数 - 第5章 不定积分计算方法", "w": "夜雨强化"}, "yeyu_gd_06": {"t": 59, "s": "s1", "n": "夜雨强化 - 高数 - 第6章 定积分与反常积分", "w": "夜雨强化"}, "yeyu_gd_07": {"t": 21, "s": "s1", "n": "夜雨强化 - 高数 - 第7章 定积分的几何与物理应用", "w": "夜雨强化"}, "yeyu_gd_08": {"t": 19, "s": "s1", "n": "夜雨强化 - 高数 - 第8章 多元函数微分学与极值最值", "w": "夜雨强化"}, "yeyu_gd_09": {"t": 11, "s": "s1", "n": "夜雨强化 - 高数 - 第9章 常微分方程与微分方程综合题", "w": "夜雨强化"}, "yeyu_gd_10": {"t": 26, "s": "s1", "n": "夜雨强化 - 高数 - 第10章 二重积分计算与对称性", "w": "夜雨强化"}, "yeyu_gd_11": {"t": 10, "s": "s1", "n": "夜雨强化 - 高数 - 第11章 三重积分计算与柱面球面坐标", "w": "夜雨强化"}, "yeyu_gd_12": {"t": 62, "s": "s1", "n": "夜雨强化 - 高数 - 第12章 常数项级数与幂级数", "w": "夜雨强化"}, "yeyu_gd_13": {"t": 4, "s": "s1", "n": "夜雨强化 - 高数 - 第13章 傅里叶级数", "w": "夜雨强化"}, "yeyu_gd_14": {"t": 4, "s": "s1", "n": "夜雨强化 - 高数 - 第14章 第一类与第二类曲线积分", "w": "夜雨强化"}, "yeyu_gd_15": {"t": 3, "s": "s1", "n": "夜雨强化 - 高数 - 第15章 第一类与第二类曲面积分及高斯斯托克斯公式", "w": "夜雨强化"}, "yeyu_gd_16": {"t": 9, "s": "s1", "n": "夜雨强化 - 高数 - 第16章 微分不等式与积分不等式综合", "w": "夜雨强化"}, "yeyu_gd_17": {"t": 7, "s": "s1", "n": "夜雨强化 - 高数 - 第17章 空间解析几何", "w": "夜雨强化"}, "yeyu_gd_18": {"t": 33, "s": "s1", "n": "夜雨强化 - 高数 - 第18章 极限概念与选择题特训", "w": "夜雨强化"}, "yeyu_gd_19": {"t": 18, "s": "s1", "n": "夜雨强化 - 高数 - 第19章 导数概念与选择题特训", "w": "夜雨强化"}, "yeyu_gd_20": {"t": 7, "s": "s1", "n": "夜雨强化 - 高数 - 第20章 积分概念与选择题特训", "w": "夜雨强化"}, "yeyu_gd_21": {"t": 10, "s": "s1", "n": "夜雨强化 - 高数 - 第21章 多元微分概念与选择题特训", "w": "夜雨强化"}, "yeyu_gd_22": {"t": 26, "s": "s1", "n": "夜雨强化 - 高数 - 第22章 级数概念与选择题特训", "w": "夜雨强化"}, "yeyu_la_01": {"t": 32, "s": "s1", "n": "夜雨强化 - 线代 - 第1章 行列式的计算与性质", "w": "夜雨强化"}, "yeyu_la_02": {"t": 41, "s": "s1", "n": "夜雨强化 - 线代 - 第2章 向量与线性相关性", "w": "夜雨强化"}, "yeyu_la_03": {"t": 42, "s": "s1", "n": "夜雨强化 - 线代 - 第3章 常见矩阵的性质与运算", "w": "夜雨强化"}, "yeyu_la_05": {"t": 18, "s": "s1", "n": "夜雨强化 - 线代 - 第5章 矩阵 An 次方计算", "w": "夜雨强化"}, "yeyu_la_06": {"t": 19, "s": "s1", "n": "夜雨强化 - 线代 - 第6章 矩阵及分块矩阵的秩", "w": "夜雨强化"}, "yeyu_la_07": {"t": 60, "s": "s1", "n": "夜雨强化 - 线代 - 第7章 线性方程组所有考法", "w": "夜雨强化"}, "yeyu_la_08": {"t": 48, "s": "s1", "n": "夜雨强化 - 线代 - 第8章 相似的所有考法", "w": "夜雨强化"}, "yeyu_la_09": {"t": 51, "s": "s1", "n": "夜雨强化 - 线代 - 第9章 二次型的所有考法", "w": "夜雨强化"}, "yeyu_la_10": {"t": 6, "s": "s1", "n": "夜雨强化 - 线代 - 第10章 专题一：AB=BA 专题（矩阵可交换）", "w": "夜雨强化"}, "yeyu_la_11": {"t": 1, "s": "s1", "n": "夜雨强化 - 线代 - 第11章 专题二：AB=0 专题", "w": "夜雨强化"}, "yeyu_pr_01": {"t": 48, "s": "s1", "n": "夜雨强化 - 概率论 - 第1章 随机事件及其概率", "w": "夜雨强化"}, "yeyu_pr_02": {"t": 28, "s": "s1", "n": "夜雨强化 - 概率论 - 第2章 一维随机变量及其分布", "w": "夜雨强化"}, "yeyu_pr_03": {"t": 33, "s": "s1", "n": "夜雨强化 - 概率论 - 第3章 二维随机变量及其分布", "w": "夜雨强化"}, "yeyu_pr_04": {"t": 25, "s": "s1", "n": "夜雨强化 - 概率论 - 第4章 随机变量的数字特征", "w": "夜雨强化"}, "yeyu_pr_05": {"t": 7, "s": "s1", "n": "夜雨强化 - 概率论 - 第5章 大数定律和中心极限定理", "w": "夜雨强化"}, "yeyu_pr_06": {"t": 21, "s": "s1", "n": "夜雨强化 - 概率论 - 第6章 数理统计的基本概念", "w": "夜雨强化"}, "yeyu_pr_07": {"t": 20, "s": "s1", "n": "夜雨强化 - 概率论 - 第7章 参数估计", "w": "夜雨强化"}, "yeyu_pr_08": {"t": 5, "s": "s1", "n": "夜雨强化 - 概率论 - 第8章 假设检验与置信区间", "w": "夜雨强化"}, "xhy_gs_01": {"t": 129, "s": "s1", "n": "邂逅遗憾 - 高数 - 第1章 极限与函数性质", "w": "邂逅遗憾"}, "xhy_gs_02": {"t": 101, "s": "s1", "n": "邂逅遗憾 - 高数 - 第2章 导数", "w": "邂逅遗憾"}, "xhy_gs_03": {"t": 132, "s": "s1", "n": "邂逅遗憾 - 高数 - 第3章 积分", "w": "邂逅遗憾"}, "xhy_gs_04": {"t": 59, "s": "s1", "n": "邂逅遗憾 - 高数 - 第4章 微分方程", "w": "邂逅遗憾"}, "xhy_gs_05": {"t": 68, "s": "s1", "n": "邂逅遗憾 - 高数 - 第5章 多元微分", "w": "邂逅遗憾"}, "xhy_gs_06": {"t": 46, "s": "s1", "n": "邂逅遗憾 - 高数 - 第6章 二重积分", "w": "邂逅遗憾"}, "xhy_gs_07": {"t": 88, "s": "s1", "n": "邂逅遗憾 - 高数 - 第7章 无穷级数", "w": "邂逅遗憾"}, "xhy_gs_08": {"t": 30, "s": "s1", "n": "邂逅遗憾 - 高数 - 第8章 空间几何", "w": "邂逅遗憾"}, "xhy_gs_09": {"t": 71, "s": "s1", "n": "邂逅遗憾 - 高数 - 第9章 三重积分和线面积分", "w": "邂逅遗憾"}, "xhy_gs_10": {"t": 20, "s": "s1", "n": "邂逅遗憾 - 高数 - 第10章 空间几何线面积分补充", "w": "邂逅遗憾"}, "xhy_xd_11": {"t": 36, "s": "s1", "n": "邂逅遗憾 - 线代 - 第1章 行列式", "w": "邂逅遗憾"}, "xhy_xd_12": {"t": 56, "s": "s1", "n": "邂逅遗憾 - 线代 - 第2章 矩阵", "w": "邂逅遗憾"}, "xhy_xd_13": {"t": 44, "s": "s1", "n": "邂逅遗憾 - 线代 - 第3章 向量", "w": "邂逅遗憾"}, "xhy_xd_14": {"t": 21, "s": "s1", "n": "邂逅遗憾 - 线代 - 第4章 方程组", "w": "邂逅遗憾"}, "xhy_xd_15": {"t": 29, "s": "s1", "n": "邂逅遗憾 - 线代 - 第5章 相似", "w": "邂逅遗憾"}, "xhy_xd_16": {"t": 42, "s": "s1", "n": "邂逅遗憾 - 线代 - 第6章 二次型", "w": "邂逅遗憾"}, "xhy_xd_17": {"t": 19, "s": "s1", "n": "邂逅遗憾 - 线代 - 第7章 数一专项", "w": "邂逅遗憾"}, "xhy_gl_18": {"t": 18, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第1章 随机事件及其概率", "w": "邂逅遗憾"}, "xhy_gl_19": {"t": 40, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第2章 一维随机变量", "w": "邂逅遗憾"}, "xhy_gl_20": {"t": 45, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第3章 二维随机变量", "w": "邂逅遗憾"}, "xhy_gl_21": {"t": 49, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第4章 随机变量的数字特征", "w": "邂逅遗憾"}, "xhy_gl_22": {"t": 13, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第5章 大数定律与中心极限定理", "w": "邂逅遗憾"}, "xhy_gl_23": {"t": 20, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第6章 抽样分布", "w": "邂逅遗憾"}, "xhy_gl_24": {"t": 21, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第7章 参数估计", "w": "邂逅遗憾"}, "xhy_gl_25": {"t": 22, "s": "s1", "n": "邂逅遗憾 - 概率论 - 第8章 区间估计与假设检验", "w": "邂逅遗憾"}, "s1_zt_1987": {"t": 21, "s": "s1", "n": "历年真题 - 1987年真题", "w": "历年真题"}, "s1_zt_1988": {"t": 22, "s": "s1", "n": "历年真题 - 1988年真题", "w": "历年真题"}, "s1_zt_1989": {"t": 23, "s": "s1", "n": "历年真题 - 1989年真题", "w": "历年真题"}, "s1_zt_1990": {"t": 23, "s": "s1", "n": "历年真题 - 1990年真题", "w": "历年真题"}, "s1_zt_1991": {"t": 22, "s": "s1", "n": "历年真题 - 1991年真题", "w": "历年真题"}, "s1_zt_1992": {"t": 22, "s": "s1", "n": "历年真题 - 1992年真题", "w": "历年真题"}, "s1_zt_1993": {"t": 23, "s": "s1", "n": "历年真题 - 1993年真题", "w": "历年真题"}, "s1_zt_1994": {"t": 22, "s": "s1", "n": "历年真题 - 1994年真题", "w": "历年真题"}, "s1_zt_1995": {"t": 22, "s": "s1", "n": "历年真题 - 1995年真题", "w": "历年真题"}, "s1_zt_1996": {"t": 22, "s": "s1", "n": "历年真题 - 1996年真题", "w": "历年真题"}, "s1_zt_1997": {"t": 22, "s": "s1", "n": "历年真题 - 1997年真题", "w": "历年真题"}, "s1_zt_1998": {"t": 23, "s": "s1", "n": "历年真题 - 1998年真题", "w": "历年真题"}, "s1_zt_1999": {"t": 21, "s": "s1", "n": "历年真题 - 1999年真题", "w": "历年真题"}, "s1_zt_2000": {"t": 21, "s": "s1", "n": "历年真题 - 2000年真题", "w": "历年真题"}, "s1_zt_2001": {"t": 20, "s": "s1", "n": "历年真题 - 2001年真题", "w": "历年真题"}, "s1_zt_2002": {"t": 20, "s": "s1", "n": "历年真题 - 2002年真题", "w": "历年真题"}, "s1_zt_2003": {"t": 22, "s": "s1", "n": "历年真题 - 2003年真题", "w": "历年真题"}, "s1_zt_2004": {"t": 23, "s": "s1", "n": "历年真题 - 2004年真题", "w": "历年真题"}, "s1_zt_2005": {"t": 23, "s": "s1", "n": "历年真题 - 2005年真题", "w": "历年真题"}, "s1_zt_2006": {"t": 23, "s": "s1", "n": "历年真题 - 2006年真题", "w": "历年真题"}, "s1_zt_2007": {"t": 24, "s": "s1", "n": "历年真题 - 2007年真题", "w": "历年真题"}, "s1_zt_2008": {"t": 23, "s": "s1", "n": "历年真题 - 2008年真题", "w": "历年真题"}, "s1_zt_2009": {"t": 23, "s": "s1", "n": "历年真题 - 2009年真题", "w": "历年真题"}, "s1_zt_2010": {"t": 23, "s": "s1", "n": "历年真题 - 2010年真题", "w": "历年真题"}, "s1_zt_2011": {"t": 23, "s": "s1", "n": "历年真题 - 2011年真题", "w": "历年真题"}, "s1_zt_2012": {"t": 23, "s": "s1", "n": "历年真题 - 2012年真题", "w": "历年真题"}, "s1_zt_2013": {"t": 23, "s": "s1", "n": "历年真题 - 2013年真题", "w": "历年真题"}, "s1_zt_2014": {"t": 23, "s": "s1", "n": "历年真题 - 2014年真题", "w": "历年真题"}, "s1_zt_2015": {"t": 23, "s": "s1", "n": "历年真题 - 2015年真题", "w": "历年真题"}, "s1_zt_2016": {"t": 23, "s": "s1", "n": "历年真题 - 2016年真题", "w": "历年真题"}, "s1_zt_2017": {"t": 23, "s": "s1", "n": "历年真题 - 2017年真题", "w": "历年真题"}, "s1_zt_2018": {"t": 23, "s": "s1", "n": "历年真题 - 2018年真题", "w": "历年真题"}, "s1_zt_2019": {"t": 23, "s": "s1", "n": "历年真题 - 2019年真题", "w": "历年真题"}, "s1_zt_2020": {"t": 23, "s": "s1", "n": "历年真题 - 2020年真题", "w": "历年真题"}, "s1_zt_2021": {"t": 22, "s": "s1", "n": "历年真题 - 2021年真题", "w": "历年真题"}, "s1_zt_2022": {"t": 22, "s": "s1", "n": "历年真题 - 2022年真题", "w": "历年真题"}, "s1_zt_2023": {"t": 22, "s": "s1", "n": "历年真题 - 2023年真题", "w": "历年真题"}, "s1_zt_2024": {"t": 22, "s": "s1", "n": "历年真题 - 2024年真题", "w": "历年真题"}, "s1_zt_2025": {"t": 22, "s": "s1", "n": "历年真题 - 2025年真题", "w": "历年真题"}, "s1_zt_2026": {"t": 22, "s": "s1", "n": "历年真题 - 2026年真题", "w": "历年真题"}, "bg_jy_01": {"t": 26, "s": "zhuanye", "n": "波哥讲义例题 - 第1章 信号与系统绪论", "w": "波哥讲义例题"}, "bg_jy_02": {"t": 26, "s": "zhuanye", "n": "波哥讲义例题 - 第2章 连续系统时域分析", "w": "波哥讲义例题"}, "bg_jy_03": {"t": 23, "s": "zhuanye", "n": "波哥讲义例题 - 第3章 离散系统时域分析", "w": "波哥讲义例题"}, "bg_jy_04": {"t": 35, "s": "zhuanye", "n": "波哥讲义例题 - 第4章 傅里叶变换理论及频域分析", "w": "波哥讲义例题"}, "bg_jy_05": {"t": 51, "s": "zhuanye", "n": "波哥讲义例题 - 第5章 连续时间系统的复频域分析", "w": "波哥讲义例题"}, "bg_jy_06": {"t": 27, "s": "zhuanye", "n": "波哥讲义例题 - 第6章 离散时间系统的z域分析", "w": "波哥讲义例题"}, "bg_jy_07": {"t": 8, "s": "zhuanye", "n": "波哥讲义例题 - 第7章 离散时间傅氏分析", "w": "波哥讲义例题"}, "bg_jy_08": {"t": 3, "s": "zhuanye", "n": "波哥讲义例题 - 第8章 傅氏变换运用", "w": "波哥讲义例题"}, "bg_jy_09": {"t": 10, "s": "zhuanye", "n": "波哥讲义例题 - 第9章 电路专题", "w": "波哥讲义例题"}, "bg_jy_10": {"t": 9, "s": "zhuanye", "n": "波哥讲义例题 - 第10章 状态变量分析", "w": "波哥讲义例题"}, "bg_xt_01": {"t": 88, "s": "zhuanye", "n": "波哥习题集 - 第1章 信号及其基本运算", "w": "波哥习题集"}, "bg_xt_02": {"t": 66, "s": "zhuanye", "n": "波哥习题集 - 第2章 连续信号的时域分析", "w": "波哥习题集"}, "bg_xt_03": {"t": 44, "s": "zhuanye", "n": "波哥习题集 - 第3章 离散系统时域分析", "w": "波哥习题集"}, "bg_xt_04": {"t": 74, "s": "zhuanye", "n": "波哥习题集 - 第4章 傅里叶变换及频域分析", "w": "波哥习题集"}, "bg_xt_05": {"t": 87, "s": "zhuanye", "n": "波哥习题集 - 第5章 拉普拉斯变换", "w": "波哥习题集"}, "bg_xt_06": {"t": 74, "s": "zhuanye", "n": "波哥习题集 - 第6章 z 变换", "w": "波哥习题集"}, "bg_xt_07": {"t": 35, "s": "zhuanye", "n": "波哥习题集 - 第7章 离散时间傅氏变换", "w": "波哥习题集"}, "bg_xt_08": {"t": 45, "s": "zhuanye", "n": "波哥习题集 - 第8章 傅氏变换的应用", "w": "波哥习题集"}, "bg_xt_09": {"t": 39, "s": "zhuanye", "n": "波哥习题集 - 第9章 电路专题", "w": "波哥习题集"}, "bg_xt_10": {"t": 39, "s": "zhuanye", "n": "波哥习题集 - 第10章 状态变量分析", "w": "波哥习题集"}, "dlut_852_11": {"t": 10, "s": "zhuanye", "n": "大连理工大学852 - 2011年真题", "w": "大连理工大学852"}, "dlut_852_13": {"t": 11, "s": "zhuanye", "n": "大连理工大学852 - 2013年真题", "w": "大连理工大学852"}, "dlut_852_14": {"t": 9, "s": "zhuanye", "n": "大连理工大学852 - 2014年真题", "w": "大连理工大学852"}, "dlut_852_15": {"t": 12, "s": "zhuanye", "n": "大连理工大学852 - 2015年真题", "w": "大连理工大学852"}, "dlut_852_16": {"t": 9, "s": "zhuanye", "n": "大连理工大学852 - 2016年真题", "w": "大连理工大学852"}, "dlut_852_17": {"t": 8, "s": "zhuanye", "n": "大连理工大学852 - 2017年真题", "w": "大连理工大学852"}, "dlut_852_18": {"t": 8, "s": "zhuanye", "n": "大连理工大学852 - 2018年真题", "w": "大连理工大学852"}, "dlut_852_19": {"t": 8, "s": "zhuanye", "n": "大连理工大学852 - 2019年真题", "w": "大连理工大学852"}, "dlut_852_20": {"t": 8, "s": "zhuanye", "n": "大连理工大学852 - 2020年真题", "w": "大连理工大学852"}, "dlut_852_22": {"t": 26, "s": "zhuanye", "n": "大连理工大学852 - 2022年真题", "w": "大连理工大学852"}, "dlut_852_24": {"t": 19, "s": "zhuanye", "n": "大连理工大学852 - 2024年真题", "w": "大连理工大学852"}, "nju_851_07": {"t": 11, "s": "zhuanye", "n": "南京大学851 - 2007年真题", "w": "南京大学851"}, "nju_851_08": {"t": 11, "s": "zhuanye", "n": "南京大学851 - 2008年真题", "w": "南京大学851"}, "nju_851_09": {"t": 11, "s": "zhuanye", "n": "南京大学851 - 2009年真题", "w": "南京大学851"}, "nju_851_10": {"t": 11, "s": "zhuanye", "n": "南京大学851 - 2010年真题", "w": "南京大学851"}, "nju_851_11": {"t": 11, "s": "zhuanye", "n": "南京大学851 - 2011年真题", "w": "南京大学851"}, "nju_851_12": {"t": 7, "s": "zhuanye", "n": "南京大学851 - 2012年真题", "w": "南京大学851"}, "nju_851_13": {"t": 7, "s": "zhuanye", "n": "南京大学851 - 2013年真题", "w": "南京大学851"}, "nju_851_14": {"t": 7, "s": "zhuanye", "n": "南京大学851 - 2014年真题", "w": "南京大学851"}, "nju_851_15": {"t": 7, "s": "zhuanye", "n": "南京大学851 - 2015年真题", "w": "南京大学851"}, "nju_851_16": {"t": 7, "s": "zhuanye", "n": "南京大学851 - 2016年真题", "w": "南京大学851"}, "nju_851_17": {"t": 7, "s": "zhuanye", "n": "南京大学851 - 2017年真题", "w": "南京大学851"}, "nju_851_18": {"t": 9, "s": "zhuanye", "n": "南京大学851 - 2018年真题", "w": "南京大学851"}, "nju_851_19": {"t": 11, "s": "zhuanye", "n": "南京大学851 - 2019年真题", "w": "南京大学851"}, "nju_851_20": {"t": 19, "s": "zhuanye", "n": "南京大学851 - 2020年真题", "w": "南京大学851"}, "nju_851_21": {"t": 20, "s": "zhuanye", "n": "南京大学851 - 2021年真题", "w": "南京大学851"}, "nju_851_22": {"t": 22, "s": "zhuanye", "n": "南京大学851 - 2022年真题", "w": "南京大学851"}, "nju_851_23": {"t": 22, "s": "zhuanye", "n": "南京大学851 - 2023年真题", "w": "南京大学851"}, "nju_851_24": {"t": 10, "s": "zhuanye", "n": "南京大学851 - 2024年真题", "w": "南京大学851"}, "nju_851_25": {"t": 9, "s": "zhuanye", "n": "南京大学851 - 2025年真题", "w": "南京大学851"}, "nju_851_26": {"t": 10, "s": "zhuanye", "n": "南京大学851 - 2026年真题", "w": "南京大学851"}, "whu_807_10": {"t": 8, "s": "zhuanye", "n": "武汉大学807 - 2010年真题", "w": "武汉大学807"}, "whu_807_11": {"t": 8, "s": "zhuanye", "n": "武汉大学807 - 2011年真题", "w": "武汉大学807"}, "whu_807_12": {"t": 8, "s": "zhuanye", "n": "武汉大学807 - 2012年真题", "w": "武汉大学807"}, "whu_807_13": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2013年真题", "w": "武汉大学807"}, "whu_807_14": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2014年真题", "w": "武汉大学807"}, "whu_807_15": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2015年真题", "w": "武汉大学807"}, "whu_807_16": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2016年真题", "w": "武汉大学807"}, "whu_807_17": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2017年真题", "w": "武汉大学807"}, "whu_807_18": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2018年真题", "w": "武汉大学807"}, "whu_807_20": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2020年真题", "w": "武汉大学807"}, "whu_807_21": {"t": 14, "s": "zhuanye", "n": "武汉大学807 - 2021年真题", "w": "武汉大学807"}, "whu_807_22": {"t": 10, "s": "zhuanye", "n": "武汉大学807 - 2022年真题", "w": "武汉大学807"}, "whu_807_23": {"t": 20, "s": "zhuanye", "n": "武汉大学807 - 2023年真题", "w": "武汉大学807"}, "whu_807_24": {"t": 11, "s": "zhuanye", "n": "武汉大学807 - 2024年真题", "w": "武汉大学807"}, "xmu_847_10": {"t": 5, "s": "zhuanye", "n": "厦门大学847 - 2010年真题", "w": "厦门大学847"}, "xmu_847_11": {"t": 9, "s": "zhuanye", "n": "厦门大学847 - 2011年真题", "w": "厦门大学847"}, "xmu_847_12": {"t": 9, "s": "zhuanye", "n": "厦门大学847 - 2012年真题", "w": "厦门大学847"}, "xmu_847_13": {"t": 10, "s": "zhuanye", "n": "厦门大学847 - 2013年真题", "w": "厦门大学847"}, "xmu_847_14": {"t": 9, "s": "zhuanye", "n": "厦门大学847 - 2014年真题", "w": "厦门大学847"}, "xmu_847_15": {"t": 10, "s": "zhuanye", "n": "厦门大学847 - 2015年真题", "w": "厦门大学847"}, "xmu_847_16": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2016年真题", "w": "厦门大学847"}, "xmu_847_17": {"t": 9, "s": "zhuanye", "n": "厦门大学847 - 2017年真题", "w": "厦门大学847"}, "xmu_847_18": {"t": 9, "s": "zhuanye", "n": "厦门大学847 - 2018年真题", "w": "厦门大学847"}, "xmu_847_19": {"t": 9, "s": "zhuanye", "n": "厦门大学847 - 2019年真题", "w": "厦门大学847"}, "xmu_847_20": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2020年真题", "w": "厦门大学847"}, "xmu_847_21": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2021年真题", "w": "厦门大学847"}, "xmu_847_22": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2022年真题", "w": "厦门大学847"}, "xmu_847_23": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2023年真题", "w": "厦门大学847"}, "xmu_847_24": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2024年真题", "w": "厦门大学847"}, "xmu_847_25": {"t": 8, "s": "zhuanye", "n": "厦门大学847 - 2025年真题", "w": "厦门大学847"}, "hust_824_06": {"t": 14, "s": "zhuanye", "n": "华中科技大学824 - 2006年真题", "w": "华中科技大学824"}, "hust_824_07": {"t": 20, "s": "zhuanye", "n": "华中科技大学824 - 2007年真题", "w": "华中科技大学824"}, "hust_824_08": {"t": 20, "s": "zhuanye", "n": "华中科技大学824 - 2008年真题", "w": "华中科技大学824"}, "hust_824_09": {"t": 34, "s": "zhuanye", "n": "华中科技大学824 - 2009年真题", "w": "华中科技大学824"}, "hust_824_10": {"t": 33, "s": "zhuanye", "n": "华中科技大学824 - 2010年真题", "w": "华中科技大学824"}, "hust_824_11": {"t": 31, "s": "zhuanye", "n": "华中科技大学824 - 2011年真题", "w": "华中科技大学824"}, "hust_824_12": {"t": 27, "s": "zhuanye", "n": "华中科技大学824 - 2012年真题", "w": "华中科技大学824"}, "hust_824_13": {"t": 24, "s": "zhuanye", "n": "华中科技大学824 - 2013年真题", "w": "华中科技大学824"}, "hust_824_14": {"t": 16, "s": "zhuanye", "n": "华中科技大学824 - 2014年真题", "w": "华中科技大学824"}, "hust_824_15": {"t": 18, "s": "zhuanye", "n": "华中科技大学824 - 2015年真题", "w": "华中科技大学824"}, "hust_824_16": {"t": 24, "s": "zhuanye", "n": "华中科技大学824 - 2016年真题", "w": "华中科技大学824"}, "hust_824_17": {"t": 12, "s": "zhuanye", "n": "华中科技大学824 - 2017年真题", "w": "华中科技大学824"}, "hust_824_18": {"t": 20, "s": "zhuanye", "n": "华中科技大学824 - 2018年真题", "w": "华中科技大学824"}, "hust_824_19": {"t": 23, "s": "zhuanye", "n": "华中科技大学824 - 2019年真题", "w": "华中科技大学824"}, "hust_824_20": {"t": 26, "s": "zhuanye", "n": "华中科技大学824 - 2020年真题", "w": "华中科技大学824"}, "hust_824_21": {"t": 28, "s": "zhuanye", "n": "华中科技大学824 - 2021年真题", "w": "华中科技大学824"}, "hust_824_22": {"t": 28, "s": "zhuanye", "n": "华中科技大学824 - 2022年真题", "w": "华中科技大学824"}, "hust_824_23": {"t": 28, "s": "zhuanye", "n": "华中科技大学824 - 2023年真题", "w": "华中科技大学824"}, "hust_824_24": {"t": 28, "s": "zhuanye", "n": "华中科技大学824 - 2024年真题", "w": "华中科技大学824"}, "bg_qh_01": {"t": 50, "s": "zhuanye", "n": "波哥强化习题集 - 第1章 信号及其基本运算", "w": "波哥强化习题集"}, "bg_qh_02": {"t": 49, "s": "zhuanye", "n": "波哥强化习题集 - 第2章 连续系统的时域分析", "w": "波哥强化习题集"}, "bg_qh_03": {"t": 33, "s": "zhuanye", "n": "波哥强化习题集 - 第3章 离散系统的时域分析", "w": "波哥强化习题集"}, "bg_qh_04": {"t": 68, "s": "zhuanye", "n": "波哥强化习题集 - 第4章 连续时间信号的傅里叶分析", "w": "波哥强化习题集"}, "bg_qh_05": {"t": 37, "s": "zhuanye", "n": "波哥强化习题集 - 第5章 拉普拉斯变换", "w": "波哥强化习题集"}, "bg_qh_06": {"t": 55, "s": "zhuanye", "n": "波哥强化习题集 - 第6章 离散时域复频域分析", "w": "波哥强化习题集"}, "bg_qh_07": {"t": 18, "s": "zhuanye", "n": "波哥强化习题集 - 第7章 电路专题", "w": "波哥强化习题集"}, "bg_qh_08": {"t": 22, "s": "zhuanye", "n": "波哥强化习题集 - 第8章 状态变量分析", "w": "波哥强化习题集"}, "nju_851_mn_26_01": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26刺猬哥终极预测卷（一）", "w": "南京大学851模拟卷"}, "nju_851_mn_26_02": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26刺猬哥终极预测卷（二）", "w": "南京大学851模拟卷"}, "nju_851_mn_26_03": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26刺猬哥终极预测卷（三）", "w": "南京大学851模拟卷"}, "nju_851_mn_26_04": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26刺猬哥终极预测卷（四）", "w": "南京大学851模拟卷"}, "nju_851_mn_26_05": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26刺猬哥终极预测卷（五）", "w": "南京大学851模拟卷"}, "nju_851_mn_26_06": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26刺猬哥终极预测卷（六）", "w": "南京大学851模拟卷"}, "nju_851_zm_26_01": {"t": 11, "s": "zhuanye", "n": "南京大学851模拟卷 - 26芝麻南大851模拟卷（一）", "w": "南京大学851模拟卷"}, "nju_851_zm_26_02": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26芝麻南大851模拟卷（二）", "w": "南京大学851模拟卷"}, "nju_851_zm_26_03": {"t": 10, "s": "zhuanye", "n": "南京大学851模拟卷 - 26芝麻南大851模拟卷（三）", "w": "南京大学851模拟卷"}, "nju_851_zm_26_04": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26芝麻南大851模拟卷（四）", "w": "南京大学851模拟卷"}, "nju_851_zm_26_05": {"t": 11, "s": "zhuanye", "n": "南京大学851模拟卷 - 26芝麻南大851模拟卷（五）", "w": "南京大学851模拟卷"}, "nju_851_zm_26_06": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 26芝麻南大851模拟卷（六）", "w": "南京大学851模拟卷"}, "nju_851_zm_25_01": {"t": 6, "s": "zhuanye", "n": "南京大学851模拟卷 - 25芝麻南大851模拟卷（一）", "w": "南京大学851模拟卷"}, "nju_851_zm_25_02": {"t": 7, "s": "zhuanye", "n": "南京大学851模拟卷 - 25芝麻南大851模拟卷（二）", "w": "南京大学851模拟卷"}, "nju_851_zm_25_03": {"t": 10, "s": "zhuanye", "n": "南京大学851模拟卷 - 25芝麻南大851模拟卷（三）", "w": "南京大学851模拟卷"}, "nju_851_zm_25_04": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 25芝麻南大851模拟卷（四）", "w": "南京大学851模拟卷"}, "nju_851_zm_25_05": {"t": 9, "s": "zhuanye", "n": "南京大学851模拟卷 - 25芝麻南大851模拟卷（五）", "w": "南京大学851模拟卷"}, "nju_851_zm_25_06": {"t": 8, "s": "zhuanye", "n": "南京大学851模拟卷 - 25芝麻南大851模拟卷（六）", "w": "南京大学851模拟卷"}, "moni_ll_01": {"t": 22, "s": "moni", "n": "李林六套卷 - 第1套", "w": "李林六套卷"}, "moni_ll_02": {"t": 22, "s": "moni", "n": "李林六套卷 - 第2套", "w": "李林六套卷"}, "moni_ll_03": {"t": 22, "s": "moni", "n": "李林六套卷 - 第3套", "w": "李林六套卷"}, "moni_ll_04": {"t": 22, "s": "moni", "n": "李林六套卷 - 第4套", "w": "李林六套卷"}, "moni_ll_05": {"t": 22, "s": "moni", "n": "李林六套卷 - 第5套", "w": "李林六套卷"}, "moni_ll_06": {"t": 22, "s": "moni", "n": "李林六套卷 - 第6套", "w": "李林六套卷"}, "moni_zy_01": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第1套", "w": "张宇八套卷"}, "moni_zy_02": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第2套", "w": "张宇八套卷"}, "moni_zy_03": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第3套", "w": "张宇八套卷"}, "moni_zy_04": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第4套", "w": "张宇八套卷"}, "moni_zy_05": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第5套", "w": "张宇八套卷"}, "moni_zy_06": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第6套", "w": "张宇八套卷"}, "moni_zy_07": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第7套", "w": "张宇八套卷"}, "moni_zy_08": {"t": 22, "s": "moni", "n": "张宇八套卷 - 第8套", "w": "张宇八套卷"}, "xuantian_ll26_01": {"t": 16, "s": "xuantian", "n": "26李林六套卷 - 第1套", "w": "26李林六套卷"}, "xuantian_ll26_02": {"t": 16, "s": "xuantian", "n": "26李林六套卷 - 第2套", "w": "26李林六套卷"}, "xuantian_ll26_03": {"t": 16, "s": "xuantian", "n": "26李林六套卷 - 第3套", "w": "26李林六套卷"}, "xuantian_ll26_04": {"t": 16, "s": "xuantian", "n": "26李林六套卷 - 第4套", "w": "26李林六套卷"}, "xuantian_ll26_05": {"t": 16, "s": "xuantian", "n": "26李林六套卷 - 第5套", "w": "26李林六套卷"}, "xuantian_ll26_06": {"t": 16, "s": "xuantian", "n": "26李林六套卷 - 第6套", "w": "26李林六套卷"}, "pol_b25728-c100402": {"t": 9, "s": "pol", "n": "27肖1000 - 马原 - 导论", "w": "27肖1000"}, "pol_b25728-c100403": {"t": 83, "s": "pol", "n": "27肖1000 - 马原 - 第一章世界的物质性及发展规律", "w": "27肖1000"}, "pol_b25728-c100404": {"t": 59, "s": "pol", "n": "27肖1000 - 马原 - 第二章实践与认识及其发展规律", "w": "27肖1000"}, "pol_b25728-c100405": {"t": 56, "s": "pol", "n": "27肖1000 - 马原 - 第三章人类社会及其发展规律", "w": "27肖1000"}, "pol_b25728-c100406": {"t": 113, "s": "pol", "n": "27肖1000 - 马原 - 第四章资本主义的本质及规律", "w": "27肖1000"}, "pol_b25728-c100407": {"t": 44, "s": "pol", "n": "27肖1000 - 马原 - 第五章资本主义的发展及其趋势", "w": "27肖1000"}, "pol_b25728-c100408": {"t": 26, "s": "pol", "n": "27肖1000 - 马原 - 第六章社会主义的发展及其规律", "w": "27肖1000"}, "pol_b25728-c100409": {"t": 6, "s": "pol", "n": "27肖1000 - 马原 - 第七章共产主义崇高理想及其最终实现", "w": "27肖1000"}, "pol_b25728-c100410": {"t": 4, "s": "pol", "n": "27肖1000 - 毛中特 - 导论  马克思主义中国化时代化的历史进程与理论成果", "w": "27肖1000"}, "pol_b25728-c100411": {"t": 10, "s": "pol", "n": "27肖1000 - 毛中特 - 第一章 毛泽东思想及其历史地位", "w": "27肖1000"}, "pol_b25728-c100412": {"t": 37, "s": "pol", "n": "27肖1000 - 毛中特 - 第二章 新民主主义革命理论", "w": "27肖1000"}, "pol_b25728-c100413": {"t": 23, "s": "pol", "n": "27肖1000 - 毛中特 - 第三章 社会主义改造理论", "w": "27肖1000"}, "pol_b25728-c100414": {"t": 17, "s": "pol", "n": "27肖1000 - 毛中特 - 第四章 社会主义建设道路初步探索", "w": "27肖1000"}, "pol_b25728-c100415": {"t": 2, "s": "pol", "n": "27肖1000 - 毛中特 - 第五章 中国特色社会主义理论体系的形成发展", "w": "27肖1000"}, "pol_b25728-c100416": {"t": 13, "s": "pol", "n": "27肖1000 - 毛中特 - 第六章 邓小平理论", "w": "27肖1000"}, "pol_b25728-c100417": {"t": 5, "s": "pol", "n": "27肖1000 - 毛中特 - 第七章 “三个代表”重要思想", "w": "27肖1000"}, "pol_b25728-c100418": {"t": 4, "s": "pol", "n": "27肖1000 - 毛中特 - 第八章 科学发展观", "w": "27肖1000"}, "pol_b25728-c100421": {"t": 11, "s": "pol", "n": "27肖1000 - 新思想 - 导论", "w": "27肖1000"}, "pol_b25728-c100422": {"t": 10, "s": "pol", "n": "27肖1000 - 新思想 - 第一章 新时代坚持和发展中国特色社会主义", "w": "27肖1000"}, "pol_b25728-c100423": {"t": 7, "s": "pol", "n": "27肖1000 - 新思想 - 第二章 以中国式现代化全面推进中华民族伟大复兴", "w": "27肖1000"}, "pol_b25728-c100424": {"t": 8, "s": "pol", "n": "27肖1000 - 新思想 - 第三章 坚持党的全面领导", "w": "27肖1000"}, "pol_b25728-c100425": {"t": 8, "s": "pol", "n": "27肖1000 - 新思想 - 第四章 坚持以人民为中心", "w": "27肖1000"}, "pol_b25728-c100426": {"t": 17, "s": "pol", "n": "27肖1000 - 新思想 - 第五章 全面深化改革开放", "w": "27肖1000"}, "pol_b25728-c100427": {"t": 33, "s": "pol", "n": "27肖1000 - 新思想 - 第六章 推动高质量发展", "w": "27肖1000"}, "pol_b25728-c100428": {"t": 9, "s": "pol", "n": "27肖1000 - 新思想 - 第七章 社会主义现代化建设的教育、科技、人才战略", "w": "27肖1000"}, "pol_b25728-c100429": {"t": 24, "s": "pol", "n": "27肖1000 - 新思想 - 第八章 发展全过程人民民主", "w": "27肖1000"}, "pol_b25728-c100430": {"t": 10, "s": "pol", "n": "27肖1000 - 新思想 - 第九章 全面依法治国(结合第五部分第六章的内容进行复习)", "w": "27肖1000"}, "pol_b25728-c100431": {"t": 18, "s": "pol", "n": "27肖1000 - 新思想 - 第十章 建设社会主义文化强国", "w": "27肖1000"}, "pol_b25728-c100432": {"t": 12, "s": "pol", "n": "27肖1000 - 新思想 - 第十一章 以保障和改善民生为重点加强社会建设", "w": "27肖1000"}, "pol_b25728-c100433": {"t": 8, "s": "pol", "n": "27肖1000 - 新思想 - 第十二章 建设社会主义生态文明", "w": "27肖1000"}, "pol_b25728-c100439": {"t": 10, "s": "pol", "n": "27肖1000 - 新思想 - 第十三章 维护和塑造国家安全", "w": "27肖1000"}, "pol_b25728-c100435": {"t": 7, "s": "pol", "n": "27肖1000 - 新思想 - 第十四章 建设巩固国防和强大人民军队", "w": "27肖1000"}, "pol_b25728-c100436": {"t": 10, "s": "pol", "n": "27肖1000 - 新思想 - 第十五章 坚持“一国两制”和推进祖国完全统一", "w": "27肖1000"}, "pol_b25728-c100437": {"t": 5, "s": "pol", "n": "27肖1000 - 新思想 - 第十六章 中国特色大国外交和推动构建人类命运共同体", "w": "27肖1000"}, "pol_b25728-c100438": {"t": 13, "s": "pol", "n": "27肖1000 - 新思想 - 第十七章 全面从严治党", "w": "27肖1000"}, "pol_b25728-c100440": {"t": 22, "s": "pol", "n": "27肖1000 - 史纲 - 第一章 进入近代后中华民族的磨难与抗争", "w": "27肖1000"}, "pol_b25728-c100441": {"t": 22, "s": "pol", "n": "27肖1000 - 史纲 - 第二章 不同社会力量对国家出路的早期探索", "w": "27肖1000"}, "pol_b25728-c100442": {"t": 24, "s": "pol", "n": "27肖1000 - 史纲 - 第三章 辛亥革命与君主专制制度的终结", "w": "27肖1000"}, "pol_b25728-c100443": {"t": 41, "s": "pol", "n": "27肖1000 - 史纲 - 第四章 中国共产党成立和中国革命新局面", "w": "27肖1000"}, "pol_b25728-c100444": {"t": 22, "s": "pol", "n": "27肖1000 - 史纲 - 第五章 中国革命的新道路", "w": "27肖1000"}, "pol_b25728-c100445": {"t": 42, "s": "pol", "n": "27肖1000 - 史纲 - 第六章 中华民族的抗日战争", "w": "27肖1000"}, "pol_b25728-c100446": {"t": 23, "s": "pol", "n": "27肖1000 - 史纲 - 第七章 为建立新中国而奋斗", "w": "27肖1000"}, "pol_b25728-c100447": {"t": 36, "s": "pol", "n": "27肖1000 - 史纲 - 第八章 中华人民共和国的成立与中国社会主义建设道路的探索", "w": "27肖1000"}, "pol_b25728-c100448": {"t": 12, "s": "pol", "n": "27肖1000 - 史纲 - 第九章 改革开放与中国特色社会主义的开创和发展", "w": "27肖1000"}, "pol_b25728-c100449": {"t": 7, "s": "pol", "n": "27肖1000 - 史纲 - 第十章 中国特色社会主义进入新时代", "w": "27肖1000"}, "pol_b25728-c100450": {"t": 7, "s": "pol", "n": "27肖1000 - 思修 - 绪论 担当复兴大任成就时代新人", "w": "27肖1000"}, "pol_b25728-c100451": {"t": 16, "s": "pol", "n": "27肖1000 - 思修 - 第一章 领悟人生真谛把握人生方向", "w": "27肖1000"}, "pol_b25728-c100452": {"t": 10, "s": "pol", "n": "27肖1000 - 思修 - 第二章 追求远大理想坚定崇高信念", "w": "27肖1000"}, "pol_b25728-c100453": {"t": 15, "s": "pol", "n": "27肖1000 - 思修 - 第三章 继承优良传统弘扬中国精神", "w": "27肖1000"}, "pol_b25728-c100454": {"t": 14, "s": "pol", "n": "27肖1000 - 思修 - 第四章 明确价值要求践行价值准则", "w": "27肖1000"}, "pol_b25728-c100455": {"t": 41, "s": "pol", "n": "27肖1000 - 思修 - 第五章 遵守道德规范锤炼道德品格", "w": "27肖1000"}, "pol_b25728-c100456": {"t": 63, "s": "pol", "n": "27肖1000 - 思修 - 第六章 学习法治思想提升法治素养", "w": "27肖1000"}};
  var BASE_CODE_MAP = { P: 'proficient', F: 'familiar', V: 'vague', R: 'rusty', W: 'wrong', _: 'unmarked' };

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

  function defaultOfflineMaterials() {
    return {
      circuit: { name: '⚡手头电路专题纸质讲义及全部题目', totalInventoried: 0, done: 0, mastered: 0, note: '' },
      njuFinal: { name: '🎓手头南大历年期末题全部试卷', totalInventoried: 0, done: 0, mastered: 0, note: '' }
    };
  }

  function loadCampState() {
    try {
      var raw = window.localStorage.getItem(stateStorageKey());
      var parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object') {
        parsed.checked = parsed.checked || {};
        parsed.manualConfirmed = parsed.manualConfirmed || {};
        parsed.scopedVerified = parsed.scopedVerified || {};
        parsed.scopedAttempted = parsed.scopedAttempted || {};
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
      scopedVerified: {},
      scopedAttempted: {},
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
      window.localStorage.setItem(stateStorageKey(), JSON.stringify(state));
    } catch (e) {}
  }

  // 凌晨 00:00–02:59 仍归属前一学习日（防止 22:50–00:15 深夜局跨零点刷新后跳到次日）
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
      sum: sum, goal: 780, schedule: 845,
      pct: Math.min(100, Math.round((sum / 780) * 100)),
      reached: sum >= 780
    };
  }

  function getV3QuotaStatsForDay(state, dayNum) {
    var q = getV3DayQuota(dayNum);
    var items = [];
    var totalTarget = 0, totalActual = 0, totalMastered = 0, totalBacklog = 0;
    V3_QUOTA_MODULES.forEach(function (mod) {
      var target = Number(q[mod.key]) || 0;
      if (dayNum === 0) target = 0;
      var recKey = 'd' + dayNum + '_' + mod.id;
      var actual = Math.max(0, Math.floor(Number(state.v3Actual && state.v3Actual[recKey]) || 0));
      var mastered = Math.min(actual, Math.max(0, Math.floor(Number(state.v3Mastered && state.v3Mastered[recKey]) || 0)));
      var backlog = Math.max(0, target - actual);
      totalTarget += target;
      totalActual += actual;
      totalMastered += mastered;
      totalBacklog += backlog;
      items.push({
        mod: mod, recKey: recKey, target: target, actual: actual, mastered: mastered, backlog: backlog
      });
    });
    var pct = totalTarget > 0 ? Math.min(100, Math.round((totalActual / totalTarget) * 100)) : 0;
    return {
      items: items, totalTarget: totalTarget, totalActual: totalActual,
      totalMastered: totalMastered, totalBacklog: totalBacklog, pct: pct
    };
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

  // 获取章节元数据（内置 CAMP21_CHAPTER_META 兜底，保证 index.html 与 study.html 100%一致）
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
      total: total,
      done: done,
      green: green,
      proficient: proficient,
      familiar: familiar,
      yellow: yellow,
      red: red,
      unmarked: unmarked,
      name: meta.name
    };
  }

  // 将 1-based 题号数组格式化为紧凑区间，例如 [113, 116, 117, 118] -> "#113, #116~#118"
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
    if (ranges.length > 6) {
      return ranges.slice(0, 5).join(', ') + ' 等(' + sorted.length + '题)';
    }
    return ranges.join(', ');
  }

  // 核心函数：严格基于 task.scopedItems 计算单卡真实进度，彻底根除历史存量冒充今日进度与手动勾选伪造100%
  function evaluateTaskProgress(task, state) {
    state = state || loadCampState();
    var chapters = Array.isArray(task.chapters) ? task.chapters : [];
    var scopedItems = Array.isArray(task.scopedItems) ? task.scopedItems : [];

    // 1. 计算章节全量存量（仅用于跳转按钮旁展示全章存量参考，绝不混入今日完成率！）
    var invTotal = 0, invDone = 0, invGreen = 0, invProf = 0, invFam = 0, invYellow = 0, invRed = 0, invUnmarked = 0;
    chapters.forEach(function (c) {
      var st = getChapterLiveStats(c.subjectId, c.chapterId);
      invTotal += st.total;
      invDone += st.done;
      invGreen += st.green;
      invProf += st.proficient;
      invFam += st.familiar;
      invYellow += st.yellow;
      invRed += st.red;
      invUnmarked += st.unmarked;
    });

    var offlineTarget = Number(task.offlineTarget) || 0;
    var offlineDone = Math.min(offlineTarget, Math.max(0, Number(state.offline && state.offline[task.id]) || 0));
    var mode = task.mode || 'green';
    var isScopedOnline = scopedItems.length > 0 && !task.isOptionalOnlineMock;

    if (isScopedOnline) {
      var totalScoped = 0;
      var attempted = 0;
      var broadGreen = 0;
      var strictProficient = 0;
      var scopedYellow = 0;
      var scopedRed = 0;
      var scopedUnmarked = 0;
      var completedCount = 0;
      var remainingDetails = [];
      var hasRecheckSlices = false;

      scopedItems.forEach(function (slice) {
        var liveMap = getChapterStatusMap(slice.subjectId, slice.chapterId);
        var recheckKey = task.id + ':' + slice.chapterId;
        var recheckSliceVerified = !!(state.recheckVerified && state.recheckVerified[recheckKey]);
        if (slice.taskType === 'full_recheck') hasRecheckSlices = true;
        var sliceRemNums = [];

        (slice.indices || []).forEach(function (idx) {
          totalScoped += 1;
          var liveSt = liveMap[String(idx)] || 'unmarked';
          var baseSt = getBaselineStatus(slice.chapterId, idx);
          var qKey = slice.subjectId + ':' + slice.chapterId + ':' + idx;
          var touchedInTask = !!(state.scopedVerified && state.scopedVerified[task.id] && state.scopedVerified[task.id][qKey]) ||
                              !!(state.scopedAttempted && state.scopedAttempted[qKey]);

          var qAttempted = false;
          var qBroadGreen = false;
          var qStrictProf = false;
          var qDoneForTask = false;

          if (slice.taskType === 'clear_unmarked') {
            // 仅针对2026-10-30基线未标(unmarked)题集：只有变为非未标才算本次已覆盖
            qAttempted = (liveSt !== 'unmarked');
            qBroadGreen = (liveSt === 'proficient' || liveSt === 'familiar');
            qStrictProf = (liveSt === 'proficient');
            qDoneForTask = (mode === 'green') ? qBroadGreen : qAttempted;
          } else if (slice.taskType === 'clear_non_green') {
            // 针对2026-10-30基线非绿题集（各天完全不重叠切片）
            qBroadGreen = (liveSt === 'proficient' || liveSt === 'familiar');
            qStrictProf = (liveSt === 'proficient');
            qAttempted = qBroadGreen ||
                         (baseSt === 'unmarked' && liveSt !== 'unmarked') ||
                         (baseSt !== 'unmarked' && liveSt !== 'unmarked' && liveSt !== baseSt) ||
                         touchedInTask;
            qDoneForTask = (mode === 'done') ? qAttempted : qBroadGreen;
          } else {
            // full_recheck (二刷/三刷/历史绿题复检)：必须当前仍为绿标 且 在本任务复盘核验过，防止第一轮做完后二刷提前变100%
            var liveIsGreen = (liveSt === 'proficient' || liveSt === 'familiar');
            var liveIsProf = (liveSt === 'proficient');
            var isRechecked = !!(state.scopedVerified && state.scopedVerified[task.id] && state.scopedVerified[task.id][qKey]) || recheckSliceVerified;
            qBroadGreen = isRechecked && liveIsGreen;
            qStrictProf = isRechecked && liveIsProf;
            qAttempted = isRechecked && (liveSt !== 'unmarked');
            qDoneForTask = qBroadGreen;
          }

          if (qAttempted) attempted += 1;
          if (qBroadGreen) broadGreen += 1;
          if (qStrictProf) strictProficient += 1;

          if (liveSt === 'vague' || liveSt === 'rusty') scopedYellow += 1;
          else if (liveSt === 'wrong') scopedRed += 1;
          else if (liveSt === 'unmarked') scopedUnmarked += 1;

          if (qDoneForTask) {
            completedCount += 1;
          } else {
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
            rangeText: formatQuestionRanges(sliceRemNums)
          });
        }
      });

      var targetVal = totalScoped;
      var currentVal = completedCount;
      var remainingCount = Math.max(0, targetVal - currentVal);
      var pct = targetVal > 0 ? Math.min(100, Math.round((currentVal / targetVal) * 100)) : 0;
      // 严禁手动勾选覆盖线上题库任务状态 (P0-3 / T04)
      var isDone = (targetVal > 0 && currentVal >= targetVal);
      var familiarOnly = Math.max(0, broadGreen - strictProficient);
      var masteryTier = 'in_progress';
      var statusBadge = '⏳ 待清零 ' + remainingCount + ' 题';

      if (isDone) {
        if (strictProficient >= targetVal) {
          masteryTier = 'strict_proficient';
          statusBadge = '💎 已核验全精通 (' + strictProficient + '/' + targetVal + ')';
        } else if (broadGreen >= targetVal) {
          masteryTier = 'broad_green';
          statusBadge = '🟢 广义绿已达标 · 待严格精通 (精通 ' + strictProficient + '/' + targetVal + ')';
        } else {
          masteryTier = 'attempted_done';
          statusBadge = '📘 已覆盖未标 · 待错题转绿 (🟢 ' + broadGreen + '/' + targetVal + ')';
        }
      }

      var remainingSummary = remainingDetails.map(function (r) {
        return r.label + ' 剩' + r.count + '题[' + r.rangeText + ']';
      }).join('；');

      return {
        isScopedOnline: true,
        hasRecheckSlices: hasRecheckSlices,
        total: totalScoped,
        done: attempted,
        attempted: attempted,
        green: broadGreen,
        broadGreen: broadGreen,
        strictProficient: strictProficient,
        familiarOnly: familiarOnly,
        yellow: scopedYellow,
        red: scopedRed,
        unmarked: scopedUnmarked,
        currentVal: currentVal,
        targetVal: targetVal,
        remainingCount: remainingCount,
        remainingDetails: remainingDetails,
        remainingSummary: remainingSummary,
        mode: mode,
        offlineDone: offlineDone,
        offlineTarget: offlineTarget,
        pct: pct,
        isDone: isDone,
        masteryTier: masteryTier,
        statusBadge: statusBadge,
        manualChecked: false,
        invTotal: invTotal,
        invGreen: invGreen,
        invProf: invProf,
        invUnmarked: invUnmarked
      };
    }

    // 2. 纯线下任务或周五可选纸质/线上模考任务
    var manualConfirmed = !!(state.manualConfirmed && state.manualConfirmed[task.id]);
    var offTarget = offlineTarget > 0 ? offlineTarget : 1;
    var offCur = offlineTarget > 0 ? offlineDone : (manualConfirmed ? 1 : 0);
    if (task.isOptionalOnlineMock && invDone > 0 && invTotal > 0) {
      // 如果用户在题库里做了模拟卷，也支持自动识别
      var halfSet = Math.max(10, Math.round(invTotal / 2));
      if (invDone >= halfSet) offCur = offTarget;
    }
    if (manualConfirmed) offCur = offTarget;
    var offPct = Math.min(100, Math.round((offCur / offTarget) * 100));
    var offIsDone = offCur >= offTarget;
    var offRem = Math.max(0, offTarget - offCur);

    return {
      isScopedOnline: false,
      hasRecheckSlices: false,
      total: offTarget,
      done: offCur,
      attempted: offCur,
      green: offCur,
      broadGreen: offCur,
      strictProficient: offCur,
      familiarOnly: 0,
      yellow: 0,
      red: 0,
      unmarked: offRem,
      currentVal: offCur,
      targetVal: offTarget,
      remainingCount: offRem,
      remainingDetails: [],
      remainingSummary: offIsDone ? '' : ((task.offlineLabel || '线下任务') + ' 待完成 ' + offRem + ' 项'),
      mode: 'offline',
      offlineDone: offCur,
      offlineTarget: offTarget,
      pct: offPct,
      isDone: offIsDone,
      masteryTier: offIsDone ? 'offline_confirmed' : 'offline_pending',
      statusBadge: offIsDone ? '📝 线下自评已确认' : ('📝 线下待完成 (' + offCur + '/' + offTarget + ')'),
      manualChecked: manualConfirmed,
      invTotal: invTotal,
      invGreen: invGreen,
      invProf: invProf,
      invUnmarked: invUnmarked
    };
  }

  function evaluateDayProgress(dayObj, state) {
    state = state || loadCampState();
    var tasks = (dayObj && dayObj.tasks) || [];
    var doneTasks = 0;
    var totalTasks = tasks.length;
    var scopedCurrentSum = 0;
    var scopedTargetSum = 0;
    var scopedAttemptedSum = 0;
    var scopedBroadGreenSum = 0;
    var scopedStrictProfSum = 0;
    var scopedRemainingSum = 0;

    tasks.forEach(function (t) {
      var ev = evaluateTaskProgress(t, state);
      if (ev.isDone) doneTasks += 1;
      if (ev.isScopedOnline) {
        scopedCurrentSum += ev.currentVal;
        scopedTargetSum += ev.targetVal;
        scopedAttemptedSum += ev.attempted;
        scopedBroadGreenSum += ev.broadGreen;
        scopedStrictProfSum += ev.strictProficient;
        scopedRemainingSum += ev.remainingCount;
      }
    });

    // 当日总进度严格按当日绑定题量加权计算（若无线上题则按任务项计算），彻底杜绝单卡虚高拉高全天百分比 (P1-5 / T11)
    var pct = 0;
    if (scopedTargetSum > 0) {
      pct = Math.min(100, Math.round((scopedCurrentSum / scopedTargetSum) * 100));
    } else if (totalTasks > 0) {
      pct = Math.min(100, Math.round((doneTasks / totalTasks) * 100));
    }

    return {
      doneTasks: doneTasks,
      totalTasks: totalTasks,
      pct: pct,
      totalGreen: scopedBroadGreenSum,
      totalCurrent: scopedCurrentSum,
      totalTarget: scopedTargetSum,
      totalAttempted: scopedAttemptedSum,
      totalBroadGreen: scopedBroadGreenSum,
      totalStrictProf: scopedStrictProfSum,
      totalRemaining: scopedRemainingSum
    };
  }

  // 全科四维口径实时统计（已覆盖 vs 🟢广义绿 vs 💎严格精通 vs ⚪未标）(P1-4 / T10)
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

  // ===== 实时作息时段检测与章节直达 =====
  function parseTimeMinutes(hhmm) {
    var parts = String(hhmm || '00:00').split(':');
    return (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
  }

  function getCurrentSlotInfo(customNow) {
    var now = customNow ? new Date(customNow) : new Date();
    var curMin = now.getHours() * 60 + now.getMinutes();
    for (var i = 0; i < CAMP21_SCHEDULE_SLOTS.length; i++) {
      var s = CAMP21_SCHEDULE_SLOTS[i];
      var st = parseTimeMinutes(s.start);
      var ed = parseTimeMinutes(s.end);
      if (ed < st) {
        if (curMin >= st || curMin < ed) return { index: i, slot: s };
      } else {
        if (curMin >= st && curMin < ed) return { index: i, slot: s };
      }
    }
    return { index: -1, slot: null };
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

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

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

  // ===== 1. 增强顶部 #dailyGoalButton (保留原今日目标点击弹窗，独立挂载特训指挥舱按钮) =====
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
    var isComplete = dayProg.doneTasks >= dayProg.totalTasks && dayProg.totalTasks > 0;

    campItem.classList.toggle('is-complete', isComplete);
    if (ring) ring.style.setProperty('--goal-progress', dayProg.pct + '%');
    if (pctEl) pctEl.textContent = dayProg.pct + '%';
    if (txtEl) {
      txtEl.textContent = dayProg.totalTarget > 0
        ? (dayProg.totalCurrent + '/' + dayProg.totalTarget + '题')
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
      standaloneBtn.innerHTML = '🔥 D' + dayObj.day + ' · 特训指挥舱 (' + dayProg.pct + '%)';
    }
  }

  // ===== 2. 渲染单个任务卡片 HTML (四维口径 + 剩余1-based题号区间 + 全章存量分离) =====
  function buildTaskCardHtml(task, state) {
    var ev = evaluateTaskProgress(task, state);
    var cardCls = 'camp21-task-card' + (ev.isDone ? ' is-done' : '') + (task.special ? ' is-highlight-special' : '') + (' tier-' + ev.masteryTier);
    var chapters = Array.isArray(task.chapters) ? task.chapters : [];

    var statsHtml = '';
    if (ev.isScopedOnline) {
      var primaryMetricLabel = ev.mode === 'done'
        ? ('🎯 本卡绑定 ' + ev.targetVal + ' 题 · 本次已覆盖 ' + ev.attempted + '/' + ev.targetVal + ' 题')
        : ('🎯 本卡绑定 ' + ev.targetVal + ' 题 · 本次🟢广义绿 ' + ev.broadGreen + '/' + ev.targetVal + ' 题');

      var remHtml = '';
      if (ev.remainingDetails.length > 0) {
        var remItems = ev.remainingDetails.map(function (r) {
          var verifyBtn = r.taskType === 'full_recheck'
            ? (' <button type="button" class="camp21-recheck-btn" data-action="verify-recheck" data-task="' + escapeHtml(task.id) + '" data-subject="' + escapeHtml(r.subjectId) + '" data-chapter="' + escapeHtml(r.chapterId) + '">🔍 核验本章已全绿</button>')
            : '';
          return '<div class="camp21-rem-item">📍 <strong>' + escapeHtml(r.label) + '</strong> 待清零 <strong>' + r.count + '</strong> 题：<code class="camp21-rem-codes">' + escapeHtml(r.rangeText) + '</code>' + verifyBtn + '</div>';
        }).join('');
        remHtml = '<div class="camp21-rem-box">' + remItems + '</div>';
      } else if (ev.strictProficient < ev.targetVal) {
        remHtml =
          '<div class="camp21-rem-box is-familiar-notice">' +
            '📘 本卡 ' + ev.targetVal + ' 道绑定题已全部覆盖（🟢广义绿 ' + ev.broadGreen + '/' + ev.targetVal + '），其中 <strong>' + (ev.targetVal - ev.strictProficient) + ' 道题尚未达到「💎严格熟练(proficient)」</strong>，二刷盲做通过后可晋升满精通！' +
          '</div>';
      } else {
        remHtml =
          '<div class="camp21-rem-box is-all-proficient">' +
            '💎 本卡 ' + ev.targetVal + ' 道绑定题已 100% 达到「严格熟练(proficient)」！' +
          '</div>';
      }

      statsHtml =
        '<div class="camp21-task-prog-section">' +
          '<div class="camp21-task-stats-row">' +
            '<span><strong>' + primaryMetricLabel + '</strong> (' + ev.pct + '%)</span>' +
            '<span class="camp21-stat-pills">' +
              '<span class="st-attempted" title="本次任务范围内已做/已覆盖题数">✍️已做 ' + ev.attempted + '/' + ev.targetVal + '</span>' +
              '<span class="st-green" title="广义绿标 = 熟练(proficient) + 熟悉(familiar)">🟢广义绿 ' + ev.broadGreen + '/' + ev.targetVal + '</span>' +
              '<span class="st-prof" title="严格熟练 = 仅含熟练(proficient)">💎精通 ' + ev.strictProficient + '/' + ev.targetVal + '</span>' +
              '<span class="st-yellow" title="当前范围内模糊/生疏题数">🟡' + ev.yellow + '</span>' +
              '<span class="st-red" title="当前范围内不会/错题数">🔴' + ev.red + '</span>' +
              '<span class="st-unmarked" title="当前范围内未标题数">⚪' + ev.unmarked + '</span>' +
              '<span class="st-rem" title="本卡剩余待清零题数">⏳待清零 ' + ev.remainingCount + '</span>' +
            '</span>' +
          '</div>' +
          '<div class="camp21-mini-track"><div class="camp21-mini-fill" style="width:' + ev.pct + '%"></div></div>' +
          remHtml +
        '</div>';
    } else {
      statsHtml =
        '<div class="camp21-task-prog-section">' +
          '<div class="camp21-task-stats-row">' +
            '<span><strong>📝 线下/自评进度：' + ev.currentVal + '/' + ev.targetVal + '</strong> (' + ev.pct + '%)</span>' +
            '<span class="camp21-stat-pills">' +
              '<span class="st-attempted">' + escapeHtml(ev.statusBadge) + '</span>' +
            '</span>' +
          '</div>' +
          '<div class="camp21-mini-track"><div class="camp21-mini-fill" style="width:' + ev.pct + '%"></div></div>' +
        '</div>';
    }

    var chipsHtml = chapters.map(function (c) {
      var st = getChapterLiveStats(c.subjectId, c.chapterId);
      var subStat = st.total > 0 ? (' [全章存量: 🟢' + st.green + '/' + st.total + ' · 💎' + st.proficient + ' · ⚪' + st.unmarked + ']') : '';
      return '<button type="button" class="camp21-jump-chip" data-action="jump" data-subject="' + escapeHtml(c.subjectId) + '" data-chapter="' + escapeHtml(c.chapterId) + '" title="点击跳转到该章节题库（括号内为全章历史总存量参考，不计入今日单卡百分比）">' +
        '🚀 ' + escapeHtml(c.label) + escapeHtml(subStat) +
      '</button>';
    }).join('');

    var stepperHtml = '';
    if (ev.offlineTarget > 0) {
      stepperHtml =
        '<div class="camp21-stepper" title="记录纸质/线下任务进度">' +
          '<span class="camp21-step-val">📝 ' + escapeHtml(task.offlineLabel || '线下进度') + ': ' + ev.offlineDone + '/' + ev.offlineTarget + '</span>' +
          '<button type="button" class="camp21-step-btn" data-action="step-dec" data-task="' + escapeHtml(task.id) + '">-</button>' +
          '<button type="button" class="camp21-step-btn" data-action="step-inc" data-task="' + escapeHtml(task.id) + '">+</button>' +
        '</div>';
    }

    var checkTitle = ev.isScopedOnline
      ? (ev.isDone ? '题库已自动核验完成' : '题库自动核验任务：需在题库中完成本卡绑定的 ' + ev.targetVal + ' 道题后自动亮起，不可手动伪造100%')
      : '点击确认/取消线下任务完成状态';

    return (
      '<div class="' + cardCls + '" data-task-id="' + escapeHtml(task.id) + '">' +
        '<div class="camp21-task-top">' +
          '<label class="camp21-task-check-wrap" title="' + escapeHtml(checkTitle) + '">' +
            '<input type="checkbox" class="camp21-task-checkbox" data-action="toggle-check" data-task="' + escapeHtml(task.id) + '" ' + (ev.isDone ? 'checked' : '') + '>' +
            '<div class="camp21-task-title-box">' +
              '<div class="camp21-task-kicker-row">' +
                '<span class="camp21-cat-badge cat-' + escapeHtml(task.cat) + '">' + escapeHtml(task.catLabel) + '</span>' +
                '<span class="camp21-time-tag">⏰ ' + escapeHtml(task.time) + '</span>' +
                '<span class="camp21-status-tier-badge tier-' + escapeHtml(ev.masteryTier) + '">' + escapeHtml(ev.statusBadge) + '</span>' +
              '</div>' +
              '<div class="camp21-task-title">' + escapeHtml(task.title) + '</div>' +
              '<div class="camp21-task-desc">' + escapeHtml(task.desc) + '</div>' +
            '</div>' +
          '</label>' +
        '</div>' +
        statsHtml +
        '<div class="camp21-task-footer">' +
          '<div class="camp21-jump-chips">' + chipsHtml + '</div>' +
          stepperHtml +
        '</div>' +
      '</div>'
    );
  }

  // ===== 2.5 构建 V3 13h净专注记录条 & 四维口径条 & 今日零删减配额核验折叠面板 =====
  function buildV3FocusAndQuotaStripHtml(dayNum, state) {
    var nf = getDayNetFocus(state, dayNum);
    var qs = getV3QuotaStatsForDay(state, dayNum);
    var cal = getFourCaliberSubjectStats();
    var activeQuotaItems = qs.items.filter(function (it) { return it.target > 0; });

    var quotaRowsHtml = activeQuotaItems.map(function (it) {
      var doneCls = it.actual >= it.target ? 'color:#15803d;font-weight:800;' : 'color:#b45309;font-weight:700;';
      return (
        '<div class="camp21-v3-qcard">' +
          '<div style="font-size:11.5px;font-weight:800;color:#0f172a;margin-bottom:4px;">' + escapeHtml(it.mod.label) + '</div>' +
          '<div style="display:flex;align-items:center;gap:6px;font-size:11px;flex-wrap:wrap;">' +
            '<span>今日配额: <strong>' + it.target + '</strong>题</span>' +
            '<label style="display:inline-flex;align-items:center;gap:3px;">实做:' +
              '<input type="number" min="0" max="2000" class="camp21-v3-num-input" data-action="v3-actual" data-reckey="' + escapeHtml(it.recKey) + '" value="' + it.actual + '">' +
            '</label>' +
            '<label style="display:inline-flex;align-items:center;gap:3px;">独立掌握:' +
              '<input type="number" min="0" max="2000" class="camp21-v3-num-input" data-action="v3-mastered" data-reckey="' + escapeHtml(it.recKey) + '" value="' + it.mastered + '">' +
            '</label>' +
            '<span style="' + doneCls + '">' + (it.backlog > 0 ? ('待清零:' + it.backlog) : '✓配额完成') + '</span>' +
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
          '<span style="font-weight:800;color:#1e293b;">📐 题库四维真实口径对照（严禁将全章旧存量或“熟悉”混同为今日100%严格熟练）：</span>' +
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
            '<summary>📌 展开 V3 零删减今日定额核验台（今日定额合计 <strong>' + qs.totalTarget + '</strong> 题次 · 已实做 <strong>' + qs.totalActual + '</strong> · 独立掌握 <strong>' + qs.totalMastered + '</strong> · 待清零欠账 <strong style="color:#dc2626;">' + qs.totalBacklog + '</strong>）</summary>' +
            '<div class="camp21-v3-qgrid">' + quotaRowsHtml + '</div>' +
          '</details>'
        ) : '') +
      '</div>'
    );
  }

  // ===== 3. 渲染工作台顶部「21天魔鬼特训」面板 (#camp21WorkbenchPanel) =====
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
    var activeDay = getActiveDayNumber();
    var todayDay = getTodayCampDay();
    var dayObj = getDayObj(activeDay);
    var dayProg = evaluateDayProgress(dayObj, state);
    var slotInfo = getCurrentSlotInfo();

    enhanceHeaderDailyGoalButton(dayObj, dayProg);

    panel.classList.toggle('is-collapsed', !!state.collapsed);

    var optionsHtml = CAMP21_DAYS.map(function (d) {
      var isTodayTag = d.day === todayDay ? ' [今日]' : '';
      return '<option value="' + d.day + '" ' + (d.day === activeDay ? 'selected' : '') + '>' +
        escapeHtml(d.label + isTodayTag) +
      '</option>';
    }).join('');

    var slotText = slotInfo.slot
      ? ('⏰ 当前时段 (' + slotInfo.slot.start + '-' + slotInfo.slot.end + ')：' + slotInfo.slot.title.replace(/^🔥/, ''))
      : '⏰ 自由复盘时段 · 保持专注';

    var cardsHtml = dayObj.tasks.map(function (t) {
      return buildTaskCardHtml(t, state);
    }).join('');

    panel.innerHTML =
      '<div class="camp21-wb-header">' +
        '<div class="camp21-wb-left">' +
          '<span class="camp21-fire-pill">🔥 21天魔鬼特训</span>' +
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
              '<span>今日核验完成 <strong>' + dayProg.doneTasks + '/' + dayProg.totalTasks + ' 项</strong> · 本日绑定题 <strong>' + dayProg.totalCurrent + '/' + dayProg.totalTarget + '</strong> (🟢广义绿 ' + dayProg.totalBroadGreen + ' · 💎精通 ' + dayProg.totalStrictProf + ' · ⏳待清零 ' + dayProg.totalRemaining + ')</span>' +
              '<strong>' + dayProg.pct + '%</strong>' +
            '</div>' +
            '<div class="camp21-wb-progress-track">' +
              '<div class="camp21-wb-progress-fill" style="width:' + dayProg.pct + '%"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="camp21-wb-actions">' +
          '<button type="button" class="camp21-btn primary" data-action="open-modal" data-tab="all">🗓️ 21天全景表</button>' +
          '<button type="button" class="camp21-btn" data-action="open-modal" data-tab="v3ledger">📊 V3零删减总账(7680)</button>' +
          '<button type="button" class="camp21-btn" data-action="open-modal" data-tab="schedule">⏰ 14h排班表</button>' +
          '<button type="button" class="camp21-btn report-btn" data-action="copy-report">📋 复制今日战报</button>' +
          '<button type="button" class="camp21-btn" data-action="open-settings">⚙️ 目标设置</button>' +
          '<button type="button" class="camp21-btn" data-action="toggle-collapse">' + (state.collapsed ? '展开清单 ▼' : '收起 ▲') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="camp21-wb-body">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">' +
          '<span class="camp21-now-slot-pill">' + escapeHtml(slotText) + '</span>' +
          '<span style="font-size:11.5px;color:#64748b;">💡 铁律：每张任务卡仅统计该卡绑定的具体题号(scopedItems)，旧存量绝不冒充今日进度，未完成绑定题不可手动勾选伪造100%。</span>' +
        '</div>' +
        buildV3FocusAndQuotaStripHtml(activeDay, state) +
        '<div class="camp21-tasks-grid">' + cardsHtml + '</div>' +
      '</div>';
  }

  // ===== 4. 首页 index.html 嵌入总览卡 =====
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
    var activeDay = getActiveDayNumber();
    var dayObj = getDayObj(activeDay);
    var dayProg = evaluateDayProgress(dayObj, state);

    card.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px;">' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
          '<span class="camp21-fire-pill">🔥 21天魔鬼特训 · ' + escapeHtml(dayObj.label) + '</span>' +
          '<strong style="font-size:14px;color:#0f172a;">' + escapeHtml(dayObj.focus) + '</strong>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:8px;">' +
          '<span style="font-size:13px;font-weight:800;color:#ea580c;">今日进度：' + dayProg.doneTasks + '/' + dayProg.totalTasks + ' 项 · 绑定题 ' + dayProg.totalCurrent + '/' + dayProg.totalTarget + ' (' + dayProg.pct + '%)</span>' +
          '<a href="study.html" class="camp21-btn primary" style="text-decoration:none;">🚀 进入特训工作台</a>' +
        '</div>' +
      '</div>' +
      '<div class="camp21-wb-progress-track" style="height:10px;">' +
        '<div class="camp21-wb-progress-fill" style="width:' + dayProg.pct + '%"></div>' +
      '</div>';
  }

  // ===== 5. 21天魔鬼特训全景指挥舱 Modal (#camp21ModalBackdrop) =====
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
            '<h2>🔥 Kyson 考研冲刺 · 21天魔鬼特训全景指挥舱</h2>' +
            '<p>上下午双3h考场整块制 · 数学真题&邂逅&36讲&880 · 南大851&华科824&波哥&⚡电路专题&🎓南大期末题 · 肖1000</p>' +
          '</div>' +
          '<button type="button" class="camp21-modal-close" data-action="close-modal" aria-label="关闭">×</button>' +
        '</div>' +
        '<div class="camp21-modal-tabs">' +
          '<button type="button" class="camp21-tab-btn" data-action="switch-tab" data-tab="today">📋 今日特训清单 & 净专注</button>' +
          '<button type="button" class="camp21-tab-btn" data-action="switch-tab" data-tab="v3ledger">📊 V3零删减全量总账 (7680题次&线下盘点)</button>' +
          '<button type="button" class="camp21-tab-btn" data-action="switch-tab" data-tab="all">🗓️ 21天全景作战大表 (含⚡电路&🎓期末题)</button>' +
          '<button type="button" class="camp21-tab-btn" data-action="switch-tab" data-tab="schedule">⏰ 14h05m 排班作息表</button>' +
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
    var activeDay = getActiveDayNumber();
    var dayObj = getDayObj(activeDay);
    var dayProg = evaluateDayProgress(dayObj, state);

    if (_activeModalTab === 'today') {
      var cardsHtml = dayObj.tasks.map(function (t) {
        return buildTaskCardHtml(t, state);
      }).join('');
      body.innerHTML =
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px;">' +
          '<div>' +
            '<h3 style="margin:0;font-size:16px;color:#0f172a;">' + escapeHtml(dayObj.label) + ' · ' + escapeHtml(dayObj.week) + '</h3>' +
            '<p style="margin:4px 0 0;font-size:12.5px;color:#475569;">今日核心目标：' + escapeHtml(dayObj.focus) + '</p>' +
          '</div>' +
          '<div style="display:flex;gap:8px;align-items:center;">' +
            '<span class="camp21-fire-pill">已核验 ' + dayProg.doneTasks + '/' + dayProg.totalTasks + ' 项 · 绑定题 ' + dayProg.totalCurrent + '/' + dayProg.totalTarget + ' (' + dayProg.pct + '%)</span>' +
            '<button type="button" class="camp21-btn report-btn" data-action="copy-report">📊 复制今日战报</button>' +
          '</div>' +
        '</div>' +
        buildV3FocusAndQuotaStripHtml(activeDay, state) +
        '<div class="camp21-tasks-grid">' + cardsHtml + '</div>';
      return;
    }

    if (_activeModalTab === 'v3ledger') {
      var om = state.offlineMaterials || defaultOfflineMaterials();
      var cir = om.circuit || { name: '⚡手头电路专题纸质讲义', totalInventoried: 0, done: 0, mastered: 0, note: '' };
      var njuF = om.njuFinal || { name: '🎓手头南大历年期末题试卷', totalInventoried: 0, done: 0, mastered: 0, note: '' };

      var modRows = V3_QUOTA_MODULES.map(function (mod) {
        var sumActual = 0, sumMastered = 0;
        for (var d = 1; d <= 21; d++) {
          var rk = 'd' + d + '_' + mod.id;
          sumActual += Math.max(0, Math.floor(Number(state.v3Actual && state.v3Actual[rk]) || 0));
          sumMastered += Math.max(0, Math.floor(Number(state.v3Mastered && state.v3Mastered[rk]) || 0));
        }
        var rem = Math.max(0, mod.total - sumActual);
        return (
          '<tr>' +
            '<td><strong>' + escapeHtml(mod.label) + '</strong></td>' +
            '<td>' + mod.bookTotal + '</td>' +
            '<td>' + mod.green + '</td>' +
            '<td><strong>' + mod.total + '</strong></td>' +
            '<td style="color:#0369a1;font-weight:700;">' + sumActual + '</td>' +
            '<td style="color:#15803d;font-weight:700;">' + sumMastered + '</td>' +
            '<td style="color:' + (rem > 0 ? '#dc2626' : '#15803d') + ';font-weight:800;">' + (rem > 0 ? (rem + ' 题待清零') : '✓ 全量清零') + '</td>' +
          '</tr>'
        );
      }).join('');

      var dailyMatrixRows = V3_FULL_DATA.days.map(function (d) {
        var qs = getV3QuotaStatsForDay(state, d.day);
        var nf = getDayNetFocus(state, d.day);
        return (
          '<tr class="' + (d.day === activeDay ? 'is-active-day' : '') + '">' +
            '<td><strong>D' + d.day + ' (' + escapeHtml(d.date.slice(5)) + ')</strong><br>' +
              '<button type="button" class="camp21-btn" style="margin-top:3px;padding:1px 6px;font-size:10.5px;" data-action="pick-day" data-day="' + d.day + '">跳转填写</button>' +
            '</td>' +
            '<td>' + d.math_truth_pending_target + '</td>' +
            '<td>' + d.xhy_pending_target + '</td>' +
            '<td>' + d.ll880_pending_target + '</td>' +
            '<td>' + d.zy36_pending_target + '</td>' +
            '<td>' + d.zy30_pending_target + ' / ' + d.zy1000basic_pending_target + '</td>' +
            '<td>' + d.nju851_pending_target + '</td>' +
            '<td>' + d.hust824_pending_target + '</td>' +
            '<td>' + d.bogo_ch1to8_pending_target + '</td>' +
            '<td>' + d.bogo_ch9_pending_target + '</td>' +
            '<td>' + d.zhima400_firstpass_target + '</td>' +
            '<td>' + d.politics_pending_target + '</td>' +
            '<td>' + d.historic_green_recheck_target + '</td>' +
            '<td><strong>' + qs.totalActual + '/' + qs.totalTarget + '</strong> (欠' + qs.totalBacklog + ')</td>' +
            '<td>' + nf.sum + 'm</td>' +
          '</tr>'
        );
      }).join('');

      body.innerHTML =
        '<div style="margin-bottom:14px;padding:12px 16px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;font-size:12.5px;color:#7c2d12;line-height:1.6;">' +
          '<strong>🔥 V3 零删减全量对账说明（本地真实 JSON 审计结果）：</strong><br>' +
          '1. <strong>6,879 道待绿/待核验 + 801 道历史绿题复检 = 7,680 题次</strong>全部硬性入账，绝不砍题、绝不改为“只刷核心”。《基础30讲》(759待绿) 与《1000题基础篇》(506待绿) 已拆分为双独立队列。<br>' +
          '2. <strong>南大851 的 10 道差额已查明</strong>：2020–2023年共有 44 道红黄错题 + <strong>2021年 3 道未标⚪题 + 2023年 7 道未标⚪题 = 54 道待绿题</strong>，那 10 道未标题已精准锁定在 Day 20 对账补遗！<br>' +
          '3. <strong>波哥去重与排除</strong>：强化第7章电路(18题)计入1–8章(801待绿)，不与第9章(讲义10+习题39=49题)重复累加；状态变量(讲义Ch10/习题Ch10/强化Ch8)按要求排除。' +
        '</div>' +
        '<h4 style="margin:10px 0 8px;font-size:14px;color:#0f172a;">📂 纸质《电路专题》&《南大期末题》离线题册盘点器（未盘点题量不虚标100%）</h4>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;margin-bottom:16px;">' +
          '<div class="camp21-v3-qcard">' +
            '<div style="font-weight:800;font-size:13px;color:#0f172a;margin-bottom:6px;">' + escapeHtml(cir.name) + '</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;font-size:12px;">' +
              '<label>盘点总题数: <input type="number" min="0" max="5000" class="camp21-v3-num-input" data-action="v3-offline-mat" data-mat="circuit" data-field="totalInventoried" value="' + (Number(cir.totalInventoried) || 0) + '"></label>' +
              '<label>已做题数: <input type="number" min="0" max="5000" class="camp21-v3-num-input" data-action="v3-offline-mat" data-mat="circuit" data-field="done" value="' + (Number(cir.done) || 0) + '"></label>' +
              '<label>独立掌握: <input type="number" min="0" max="5000" class="camp21-v3-num-input" data-action="v3-offline-mat" data-mat="circuit" data-field="mastered" value="' + (Number(cir.mastered) || 0) + '"></label>' +
              '<span style="font-weight:800;color:' + (cir.totalInventoried > 0 && cir.done >= cir.totalInventoried ? '#15803d' : '#dc2626') + ';">' +
                (cir.totalInventoried > 0 ? ('进度 ' + cir.done + '/' + cir.totalInventoried + ' (待清零 ' + Math.max(0, cir.totalInventoried - cir.done) + ')') : '⚠️ 待盘点纸质总题数（未盘点不标100%）') +
              '</span>' +
            '</div>' +
          '</div>' +
          '<div class="camp21-v3-qcard">' +
            '<div style="font-weight:800;font-size:13px;color:#0f172a;margin-bottom:6px;">' + escapeHtml(njuF.name) + '</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;font-size:12px;">' +
              '<label>盘点总题数: <input type="number" min="0" max="5000" class="camp21-v3-num-input" data-action="v3-offline-mat" data-mat="njuFinal" data-field="totalInventoried" value="' + (Number(njuF.totalInventoried) || 0) + '"></label>' +
              '<label>已做题数: <input type="number" min="0" max="5000" class="camp21-v3-num-input" data-action="v3-offline-mat" data-mat="njuFinal" data-field="done" value="' + (Number(njuF.done) || 0) + '"></label>' +
              '<label>独立掌握: <input type="number" min="0" max="5000" class="camp21-v3-num-input" data-action="v3-offline-mat" data-mat="njuFinal" data-field="mastered" value="' + (Number(njuF.mastered) || 0) + '"></label>' +
              '<span style="font-weight:800;color:' + (njuF.totalInventoried > 0 && njuF.done >= njuF.totalInventoried ? '#15803d' : '#dc2626') + ';">' +
                (njuF.totalInventoried > 0 ? ('进度 ' + njuF.done + '/' + njuF.totalInventoried + ' (待清零 ' + Math.max(0, njuF.totalInventoried - njuF.done) + ')') : '⚠️ 待盘点纸质总题数（未盘点不标100%）') +
              '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<h4 style="margin:10px 0 8px;font-size:14px;color:#0f172a;">📊 13 大量化队列总账（6,879 待绿/核验 + 801 历史绿复检 = 7,680 题次）</h4>' +
        '<div class="camp21-all-days-table-wrap" style="margin-bottom:18px;">' +
          '<table class="camp21-all-days-table">' +
            '<thead><tr><th>必做资料模块</th><th>原库总题</th><th>原已绿(入复检)</th><th>21天必做配额</th><th>累计已实做</th><th>累计独立掌握</th><th>滚动待清零欠账</th></tr></thead>' +
            '<tbody>' + modRows + '</tbody>' +
          '</table>' +
        '</div>' +
        '<h4 style="margin:10px 0 8px;font-size:14px;color:#0f172a;">🗓️ V3 每日全量数字配额矩阵（Day 1 ~ Day 21）</h4>' +
        '<div class="camp21-all-days-table-wrap">' +
          '<table class="camp21-all-days-table">' +
            '<thead><tr><th>Day</th><th>数一真题</th><th>邂逅</th><th>880</th><th>36讲</th><th>30讲/1000基</th><th>南大851</th><th>华科824</th><th>波哥1-8</th><th>波哥Ch9</th><th>芝麻400</th><th>政治</th><th>绿题复检</th><th>今日实做/配额</th><th>净专注</th></tr></thead>' +
            '<tbody>' + dailyMatrixRows + '</tbody>' +
          '</table>' +
        '</div>';
      return;
    }

    if (_activeModalTab === 'schedule') {
      var slotInfo = getCurrentSlotInfo();
      var slotsHtml = CAMP21_SCHEDULE_SLOTS.map(function (s, idx) {
        var isNow = slotInfo.index === idx;
        return (
          '<div class="camp21-slot-card' + (isNow ? ' is-now' : '') + '">' +
            '<div>' +
              '<div class="camp21-slot-time">' + escapeHtml(s.start + ' – ' + s.end) + '</div>' +
              '<div style="font-size:11px;color:#64748b;margin-top:3px;">' + escapeHtml(s.dur + ' · ' + s.scene) + (isNow ? ' · 🔥当前时段' : '') + '</div>' +
            '</div>' +
            '<div style="flex:1;">' +
              '<div style="font-size:13px;font-weight:800;color:#0f172a;">' + escapeHtml(s.title) + '</div>' +
              '<div style="font-size:11.5px;color:#475569;margin-top:3px;">🎯 量化标准：' + escapeHtml(s.target) + '</div>' +
            '</div>' +
          '</div>'
        );
      }).join('');
      body.innerHTML =
        '<div style="margin-bottom:12px;padding:10px 14px;background:#eff6ff;border-radius:10px;font-size:12.5px;color:#1e3a8a;font-weight:600;">' +
          '💡 上午 08:30–11:30（整3h数学考场块）+ 下午 14:00–17:00（整3h专业课考场块）+ 22:00闭馆通勤 + 22:50–00:15居家深夜收尾 = 每日净专注 13.5h+！' +
        '</div>' +
        '<div class="camp21-schedule-list">' + slotsHtml + '</div>';
      return;
    }

    // _activeModalTab === 'all' (21天全景表)
    var rowsHtml = CAMP21_DAYS.map(function (d) {
      var dp = evaluateDayProgress(d, state);
      var isAct = d.day === activeDay;
      var tMap = {};
      d.tasks.forEach(function (t) { tMap[t.cat] = t; });
      var mathTasks = d.tasks.filter(function (t) { return t.cat === 'math'; });
      var majorTasks = d.tasks.filter(function (t) { return t.cat === 'major' || t.cat === 'MajorSpecial'; });
      return (
        '<tr class="' + (isAct ? 'is-active-day' : '') + '">' +
          '<td style="white-space:nowrap;">' +
            '<strong>' + escapeHtml(d.label) + '</strong><br>' +
            '<span style="font-size:11px;color:#ea580c;font-weight:700;">进度 ' + dp.pct + '% (' + dp.doneTasks + '/' + dp.totalTasks + '项 · ' + dp.totalCurrent + '/' + dp.totalTarget + '题)</span><br>' +
            '<button type="button" class="camp21-btn" style="margin-top:4px;padding:2px 7px;font-size:11px;" data-action="pick-day" data-day="' + d.day + '">切换至此日</button>' +
          '</td>' +
          '<td>' + (mathTasks[0] ? escapeHtml(mathTasks[0].title) : '-') + '</td>' +
          '<td>' + (majorTasks[0] ? escapeHtml(majorTasks[0].title) : '-') + '</td>' +
          '<td>' + (mathTasks[1] ? escapeHtml(mathTasks[1].title) : '-') + '</td>' +
          '<td>' + (majorTasks[1] ? ('<strong style="color:#c2410c;">' + escapeHtml(majorTasks[1].title) + '</strong>') : '-') + '</td>' +
          '<td>' + (tMap.night ? escapeHtml(tMap.night.title) : '-') + '</td>' +
          '<td>' + (tMap.politics ? escapeHtml(tMap.politics.title) : '-') + '</td>' +
        '</tr>'
      );
    }).join('');

    body.innerHTML =
      '<div class="camp21-all-days-table-wrap">' +
        '<table class="camp21-all-days-table">' +
          '<thead>' +
            '<tr>' +
              '<th>天数 / 核验进度</th>' +
              '<th>上午3h+45m：数学真题 & 邂逅(上)</th>' +
              '<th>下午3h：专业课真题/模拟卷</th>' +
              '<th>晚间1h45m：数学邂逅(下)</th>' +
              '<th>晚间1h15m：波哥 / ⚡电路 / 🎓期末题</th>' +
              '<th>居家1h25m：36讲 / 880 / 30讲点绿</th>' +
              '<th>政治肖1000 & 错题</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + rowsHtml + '</tbody>' +
        '</table>' +
      '</div>';
  }

  // ===== 6. 一键生成并复制今日战报 =====
  function copyDailyReport() {
    var state = loadCampState();
    var dayObj = getDayObj(getActiveDayNumber());
    var dayProg = evaluateDayProgress(dayObj, state);
    var nf = getDayNetFocus(state, dayObj.day);
    var qs = getV3QuotaStatsForDay(state, dayObj.day);
    var lines = [
      '【🔥 21天魔鬼特训 V3.1精准核验版 · ' + dayObj.label + ' 每日战报】',
      '⏱️ 今日真实净专注：' + Math.floor(nf.sum / 60) + '小时' + String(nf.sum % 60).padStart(2, '0') + '分 (' + nf.sum + '/780分钟 · ' + (nf.reached ? '✅13h达标' : '⏳未满13h') + ') [数' + nf.math + 'm/专' + nf.major + 'm/政' + nf.politics + 'm/英' + nf.english + 'm]',
      '📌 V3全量定额核验：今日实做 ' + qs.totalActual + '/' + qs.totalTarget + ' 题次 (' + qs.pct + '%) | 独立掌握 ' + qs.totalMastered + ' 题 | 待清零欠账 ' + qs.totalBacklog + ' 题',
      '📊 今日绑定任务核验：' + dayProg.doneTasks + '/' + dayProg.totalTasks + ' 项 (' + dayProg.pct + '%) | 绑定题完成 ' + dayProg.totalCurrent + '/' + dayProg.totalTarget + ' 题 [🟢广义绿 ' + dayProg.totalBroadGreen + ' · 💎严格精通 ' + dayProg.totalStrictProf + ' · ⏳待清零 ' + dayProg.totalRemaining + ']'
    ];
    dayObj.tasks.forEach(function (t) {
      var ev = evaluateTaskProgress(t, state);
      var mark = ev.isDone ? '✅' : '⏳';
      var statStr = ev.isScopedOnline
        ? (' [本卡绑定 ' + ev.currentVal + '/' + ev.targetVal + ' (' + ev.pct + '%) | ✍️已做' + ev.attempted + ' 🟢广义绿' + ev.broadGreen + ' 💎精通' + ev.strictProficient + ' ⏳剩' + ev.remainingCount + '题' + (ev.remainingSummary ? (' (' + ev.remainingSummary + ')') : '') + ']')
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

  function findTaskById(taskId) {
    for (var i = 0; i < CAMP21_DAYS.length; i++) {
      var tasks = CAMP21_DAYS[i].tasks || [];
      for (var j = 0; j < tasks.length; j++) {
        if (tasks[j].id === taskId) return tasks[j];
      }
    }
    return null;
  }

  function handleVerifyRecheckSlice(taskId, subjectId, chapterId) {
    var task = findTaskById(taskId);
    if (!task) return false;
    var state = loadCampState();
    var liveMap = getChapterStatusMap(subjectId, chapterId);
    var slice = null;
    (task.scopedItems || []).forEach(function (s) {
      if (s.chapterId === chapterId) slice = s;
    });
    if (!slice) return false;

    var nonGreenNums = [];
    (slice.indices || []).forEach(function (idx) {
      var st = liveMap[String(idx)] || 'unmarked';
      if (st !== 'proficient' && st !== 'familiar') {
        nonGreenNums.push(idx + 1);
      }
    });

    if (nonGreenNums.length > 0) {
      showCampToast('⚠️ 核验未通过：' + slice.label + ' 仍有 ' + nonGreenNums.length + ' 道题非绿标 (' + formatQuestionRanges(nonGreenNums) + ')，请先在题库中重做标绿！');
      return false;
    }

    state.recheckVerified = state.recheckVerified || {};
    state.recheckVerified[taskId + ':' + chapterId] = true;
    saveCampState(state);
    renderAll();
    showCampToast('✅ 已核验通过：' + slice.label + ' 全部题目均在题库中保持绿标状态！');
    return true;
  }

  // ===== 7. 事件委托与生命周期绑定 =====
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
      } else if (action === 'verify-recheck') {
        e.preventDefault();
        e.stopPropagation();
        handleVerifyRecheckSlice(
          btn.getAttribute('data-task'),
          btn.getAttribute('data-subject'),
          btn.getAttribute('data-chapter')
        );
      } else if (action === 'step-inc' || action === 'step-dec') {
        e.preventDefault();
        var tId = btn.getAttribute('data-task');
        var cur = Number(state.offline[tId]) || 0;
        state.offline[tId] = Math.max(0, cur + (action === 'step-inc' ? 1 : -1));
        saveCampState(state);
        renderAll();
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
      } else if (action === 'toggle-check') {
        var tId = target.getAttribute('data-task');
        var taskObj = findTaskById(tId);
        if (!taskObj) return;
        var ev = evaluateTaskProgress(taskObj, state);

        if (ev.isScopedOnline) {
          // 线上题库绑定任务严禁手动勾选伪造 100% 完成度 (P0-3 / T04)
          delete state.checked[tId];
          delete state.manualConfirmed[tId];
          saveCampState(state);
          target.checked = ev.isDone;
          if (!ev.isDone) {
            showCampToast('⏳ 题库绑定任务不可手动勾选伪造100%！当前还剩 ' + ev.remainingCount + ' 道绑定题未完成 (' + ev.remainingSummary + ')，请先在题库中完成后自动核验。');
          }
          renderAll();
          return;
        }

        // 纯线下任务允许手动确认
        if (target.checked) {
          state.manualConfirmed[tId] = true;
          if (taskObj.offlineTarget > 0) {
            state.offline[tId] = taskObj.offlineTarget;
          }
        } else {
          delete state.manualConfirmed[tId];
          delete state.checked[tId];
          if (taskObj.offlineTarget > 0) {
            state.offline[tId] = 0;
          }
        }
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
      } else if (action === 'v3-offline-mat') {
        var matKey = target.getAttribute('data-mat');
        var field = target.getAttribute('data-field');
        state.offlineMaterials = state.offlineMaterials || defaultOfflineMaterials();
        state.offlineMaterials[matKey] = state.offlineMaterials[matKey] || {};
        state.offlineMaterials[matKey][field] = Math.max(0, Math.floor(Number(target.value) || 0));
        saveCampState(state);
        renderAll();
      }
    });
  }

  // 当用户在题库中标记题目状态时，精准记录到对应任务的 scopedVerified / scopedAttempted
  function recordScopedQuestionActivity(payload) {
    if (!payload || !payload.chapterId || payload.idx == null) return;
    var sid = String(payload.subjectId || '');
    var cid = String(payload.chapterId || '');
    var idx = Number(payload.idx);
    if (!Number.isFinite(idx) || idx < 0) return;

    var state = loadCampState();
    var qKey = sid + ':' + cid + ':' + idx;
    state.scopedAttempted = state.scopedAttempted || {};
    state.scopedAttempted[qKey] = payload.status;
    state.scopedVerified = state.scopedVerified || {};

    var activeDay = getActiveDayNumber();
    var dayObj = getDayObj(activeDay);
    if (dayObj && Array.isArray(dayObj.tasks)) {
      dayObj.tasks.forEach(function (t) {
        (t.scopedItems || []).forEach(function (slice) {
          if (slice.chapterId === cid && slice.indices && slice.indices.indexOf(idx) !== -1) {
            state.scopedVerified[t.id] = state.scopedVerified[t.id] || {};
            state.scopedVerified[t.id][qKey] = true;
          }
        });
      });
    }
    saveCampState(state);
  }

  function renderAll() {
    _chapterMapCache = null;
    ensureCampDailyGoals();
    renderWorkbenchPanel();
    renderHomeOverviewCard();
    renderCampModalContent();
  }

  function hookStudyAnalytics() {
    if (window.StudyAnalytics && typeof window.StudyAnalytics.render === 'function' && !window.StudyAnalytics._camp21Hooked) {
      var origRender = window.StudyAnalytics.render;
      window.StudyAnalytics.render = function () {
        var res = origRender.apply(this, arguments);
        try { renderAll(); } catch (e) {}
        return res;
      };
      window.StudyAnalytics._camp21Hooked = true;
    }
    if (window.StudyAnalytics && typeof window.StudyAnalytics.recordStatus === 'function' && !window.StudyAnalytics._camp21RecHooked) {
      var origRec = window.StudyAnalytics.recordStatus;
      window.StudyAnalytics.recordStatus = function (payload) {
        try { recordScopedQuestionActivity(payload); } catch (e) {}
        var res = origRec.apply(this, arguments);
        try { renderAll(); } catch (e) {}
        return res;
      };
      window.StudyAnalytics._camp21RecHooked = true;
    }
  }

  function init() {
    hookStudyAnalytics();
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
    getCurrentSlotInfo: getCurrentSlotInfo,
    evaluateTaskProgress: evaluateTaskProgress,
    evaluateDayProgress: evaluateDayProgress,
    getFourCaliberSubjectStats: getFourCaliberSubjectStats,
    recordScopedQuestionActivity: recordScopedQuestionActivity,
    verifyRecheckSlice: handleVerifyRecheckSlice,
    formatQuestionRanges: formatQuestionRanges,
    getStateKey: stateStorageKey,
    loadState: loadCampState,
    saveState: saveCampState
  };
})();
