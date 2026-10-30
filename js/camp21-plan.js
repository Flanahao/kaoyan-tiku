/* ==========================================================================
   🔥 Kyson 21天魔鬼特训营 · 每日任务清单与实时进度系统 (camp21-plan.js)
   覆盖周期：Day 0 (2026-10-30 预热) + Day 1 (2026-10-31) ~ Day 21 (2026-11-20)
   包含：上下午双3h考场整块、邂逅遗憾、36讲/880/30讲、波哥全套、⚡电路专题、🎓南大期末题、肖1000、英语
   ========================================================================== */
(function () {
  'use strict';

  var STATE_KEY_SUFFIX = 'kaoyan_camp21_state_v1';
  var SETTINGS_KEY_SUFFIX = 'study_dashboard_settings_v1';

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
      day: 0,
      date: '2026-10-30',
      label: 'Day 0 · 今晚预热局',
      week: '开营预热（今晚 21:15–00:15）',
      focus: '熟悉特训指挥舱 + 邂逅高数第3章积分扫尾 + 30讲第1讲点绿',
      tasks: [
        {
          id: 'd0_math1', cat: 'math', catLabel: '数学·预热', time: '21:15–22:30',
          title: '《邂逅遗憾》高数第3章积分：清完剩余21道未标题',
          desc: '第3章积分目前已绿50题，还剩21道未标，今晚先热身干掉未标题！',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_gs_03', label: '邂逅高数第3章·积分' }],
          targetCount: 71, mode: 'done'
        },
        {
          id: 'd0_major1', cat: 'MajorSpecial', catLabel: '⚡电路/波哥预热', time: '22:30–23:30',
          title: '波哥习题集第4章傅里叶：清掉剩余15道未标题',
          desc: '习题集第4章已做59/74题，先把最后15道未标题收尾，准备明天正式开营！',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'bg_xt_04', label: '波哥习题集第4章' }],
          targetCount: 74, mode: 'done'
        },
        {
          id: 'd0_night', cat: 'night', catLabel: '居家·点绿预热', time: '23:30–00:15',
          title: '《基础30讲》高数第1讲快速过筛点绿 + 准备明日2022数一真题答题卡',
          desc: '纸质书已做过，快速看题想思路点🟢熟练，明天08:30准时开启Day 1！',
          chapters: [{ subjectId: 'shu1', chapterId: 'ch1', label: '30讲高数第1讲' }],
          targetCount: 54, mode: 'green'
        }
      ]
    },
    {
      day: 1,
      date: '2026-10-31',
      label: 'Day 1 (10.31 周六)',
      week: '第一周 · 22/23真题模考 & 36讲线代收官 & 波哥傅氏拉氏',
      focus: '22年数一3h模考 + 南大07-09三套连刷 + 邂逅第3章积分错题 + 36讲线代1-3讲',
      tasks: [
        {
          id: 'd1_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '【3h全真模考】2022年数一真题(22题全新) + 邂逅第3章积分未标收尾',
          desc: '08:30-11:30严格掐表3h完成2022年真题并批改标绿；11:30-12:15清完邂逅第3章剩余未标题。',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2022', label: '22年数一真题(22题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_03', label: '邂逅高数第3章(132题)' }
          ],
          targetCount: 95, mode: 'green'
        },
        {
          id: 'd1_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【南大851三套连刷】2007年(11题) + 2008年(11题) + 2009年(11题)',
          desc: '早期南大真题每套题量精炼（07剩10非绿、08剩6非绿、09全11题），3小时整块连刷3套并全部订正标绿！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'nju_851_07', label: '南大07真题' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_08', label: '南大08真题' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_09', label: '南大09真题' }
          ],
          targetCount: 33, mode: 'green'
        },
        {
          id: 'd1_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》高数第3章积分：清零61道🟡/🔴错题（上半场35题）',
          desc: '把第3章积分之前做出的35道模糊+26道不会题逐题重算，今晚至少把绿标推到105题以上！',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_gs_03', label: '邂逅高数第3章·积分' }],
          targetCount: 105, mode: 'green'
        },
        {
          id: 'd1_p_ev', cat: 'major', catLabel: '专业课·晚间1h15m', time: '20:45–22:00',
          title: '波哥第4章傅里叶(上)：强化习题集第4章(前30题) + 基础习题集第4章错题(前15题)',
          desc: '强化第4章共68题（已绿6题），今晚推进至30题；同时清理基础习题集第4章的黄红错题。',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'bg_qh_04', label: '波哥强化第4章' },
            { subjectId: 'zhuanye', chapterId: 'bg_xt_04', label: '波哥习题集第4章' }
          ],
          targetCount: 75, mode: 'green'
        },
        {
          id: 'd1_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》马原导论+第1章(前55题) + 复盘第4章10道错题 + 通勤带背30m',
          desc: '午休后35m刷30题，晚饭后30m刷25题+复盘马原第4章已有的黄红错题，通勤听带背。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100402', label: '马原·导论(9题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100403', label: '马原·第1章(83题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100406', label: '马原·第4章错题' }
          ],
          targetCount: 75, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd1_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大小作文功能段背默(30m) + 下午真题阅读精读2篇 & 生词本复盘(50m)',
          desc: '08:00-08:30动笔默写作文模板；17:00-17:50精读阅读并收录生词。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2024', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd1_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《强化36讲》线代第1–3讲(行列式/余子式/矩阵，共31题) + 《基础30讲》高数第1–2讲点绿',
          desc: '45m把36讲线代前3讲（待绿23题）全部刷完标绿；25m将纸质已做的30讲高数第1–2讲快速过筛点绿！',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch49', label: '36讲线代第1讲' },
            { subjectId: 'shu1', chapterId: 'ch50', label: '36讲线代第2讲' },
            { subjectId: 'shu1', chapterId: 'ch51', label: '36讲线代第3讲' },
            { subjectId: 'shu1', chapterId: 'ch1', label: '30讲高数第1讲' },
            { subjectId: 'shu1', chapterId: 'ch2', label: '30讲高数第2讲' }
          ],
          targetCount: 111, mode: 'green'
        }
      ]
    },
    {
      day: 2,
      date: '2026-11-01',
      label: 'Day 2 (11.01 周日)',
      week: '第一周 · 22/23真题模考 & 36讲线代收官 & 波哥傅氏拉氏',
      focus: '23年数一3h模考 + 华科15&21真题 + 邂逅第3章收官&第1章启动 + 36讲线代4-6讲',
      tasks: [
        {
          id: 'd2_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '【3h全真模考】2023年数一真题(22题全新) + 邂逅第3章积分最后26道错题清零(第3章100%全绿！)',
          desc: '08:30-11:30全真模考2023年真题并订正标绿；11:30-12:15把邂逅第3章积分推到132/132全绿收官！',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2023', label: '23年数一真题(22题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_03', label: '邂逅第3章积分(收官)' }
          ],
          targetCount: 154, mode: 'green'
        },
        {
          id: 'd2_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【华科824】2015年真题(18题全真) + 2021年真题扫尾(清8未标+18错题)',
          desc: '3小时整块完成华科2015年全套18题，并把之前做了一半的华科2021年真题彻底清零标绿！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'hust_824_15', label: '华科15真题(18题)' },
            { subjectId: 'zhuanye', chapterId: 'hust_824_21', label: '华科21真题(28题)' }
          ],
          targetCount: 46, mode: 'green'
        },
        {
          id: 'd2_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》高数第1章 极限与函数性质（推进前40题，题1–40）',
          desc: '邂逅第1章共129题，今晚正式开刷第1章，高强度拿下前40题并标绿！',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_gs_01', label: '邂逅高数第1章·极限(129题)' }],
          targetCount: 40, mode: 'green'
        },
        {
          id: 'd2_p_ev', cat: 'major', catLabel: '专业课·晚间1h15m', time: '20:45–22:00',
          title: '波哥第4章傅里叶(中)：强化第4章(推至50题) + 基础习题集第4章(74题全部清零全绿！)',
          desc: '把波哥基础习题集第4章剩余错题全部干掉实现74/74全绿，强化第4章推进到50题。',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'bg_qh_04', label: '波哥强化第4章' },
            { subjectId: 'zhuanye', chapterId: 'bg_xt_04', label: '波哥习题集第4章(收官)' }
          ],
          targetCount: 124, mode: 'green'
        },
        {
          id: 'd2_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》马原第1章收尾(后37题) + 第2章认识论(前20题) + 复盘第4章错题',
          desc: '确保马原第1章83题全部刷完标绿，并开启第2章认识论。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100403', label: '马原·第1章(收官)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100404', label: '马原·第2章(59题)' }
          ],
          targetCount: 103, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd2_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间小作文格式与模板背默(30m) + 下午真题阅读精读2篇(50m)',
          desc: '坚持每天早晚各一段英语输入输出，保持语感不断档。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2024', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd2_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《强化36讲》线代第4–6讲(秩/方程组/向量组，共26题) + 《基础30讲》高数第3–4讲点绿',
          desc: '45m刷完36讲线代第4–6讲26道题；25m将30讲高数第3–4讲（48题）快速过筛点绿。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch52', label: '36讲线代第4讲' },
            { subjectId: 'shu1', chapterId: 'ch53', label: '36讲线代第5讲' },
            { subjectId: 'shu1', chapterId: 'ch54', label: '36讲线代第6讲' },
            { subjectId: 'shu1', chapterId: 'ch3', label: '30讲高数第3讲' },
            { subjectId: 'shu1', chapterId: 'ch4', label: '30讲高数第4讲' }
          ],
          targetCount: 74, mode: 'green'
        }
      ]
    },
    {
      day: 3,
      date: '2026-11-02',
      label: 'Day 3 (11.02 周一)',
      week: '第一周 · 22/23真题模考 & 36讲线代收官 & 波哥傅氏拉氏',
      focus: '09年真题清零 + 南大10-11真题 + 邂逅第1章推进至95题 + 36讲线代全绿收官！',
      tasks: [
        {
          id: 'd3_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '2009年数一真题(19道非绿题重做清零) + 无缝接《邂逅遗憾》高数第1章(推至65题)',
          desc: '09年真题共19道🟡/🔴题，用1.5h–2h全部重算变绿；剩余时间+11:30后推进邂逅第1章25题！',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2009', label: '09年数一真题(23题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_01', label: '邂逅高数第1章(推至65题)' }
          ],
          targetCount: 88, mode: 'green'
        },
        {
          id: 'd3_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【南大851两套连刷】2010年真题(11题) + 2011年真题(11题)',
          desc: '下午3h考场块完整拿下南大10、11两年真题共22道大题，当场订正全部标绿。',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'nju_851_10', label: '南大10真题(11题)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_11', label: '南大11真题(11题)' }
          ],
          targetCount: 22, mode: 'green'
        },
        {
          id: 'd3_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》高数第1章 极限与函数性质（推进至95题）',
          desc: '晚间再攻克30道极限题，第1章129题已完成近3/4！',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_gs_01', label: '邂逅高数第1章(推至95题)' }],
          targetCount: 95, mode: 'green'
        },
        {
          id: 'd3_p_ev', cat: 'major', catLabel: '专业课·晚间1h15m', time: '20:45–22:00',
          title: '波哥第4章傅里叶(收官)：强化第4章(后18题收官) + 讲义第4章34题过筛全绿',
          desc: '今晚彻底拿下波哥第4章傅里叶变换（讲义+习题集+强化习题集三书全绿）！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'bg_qh_04', label: '波哥强化第4章(68题收官)' },
            { subjectId: 'zhuanye', chapterId: 'bg_jy_04', label: '波哥讲义第4章(35题)' }
          ],
          targetCount: 103, mode: 'green'
        },
        {
          id: 'd3_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》马原第2章认识论收官(后39题) + 第3章唯物史观(前16题)',
          desc: '完成马原第2章全部59题并开启第3章，复盘10道错题。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100404', label: '马原·第2章(59题收官)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100405', label: '马原·第3章(56题)' }
          ],
          targetCount: 75, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd3_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大作文首段与图画描述背默(30m) + 下午真题阅读精读2篇(50m)',
          desc: '保持每日80分钟英语高效输入输出。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2023', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd3_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《强化36讲》线代第7–9讲(特征值/相似/二次型，🎉36讲线代全书收官！) + 《30讲》高数第5–6讲点绿',
          desc: '今晚刷完ch55–ch57（待绿27题），仅用3天彻底干完《强化36讲》线代全篇！同时点绿30讲第5–6讲。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch55', label: '36讲线代第7讲' },
            { subjectId: 'shu1', chapterId: 'ch56', label: '36讲线代第8讲' },
            { subjectId: 'shu1', chapterId: 'ch57', label: '36讲线代第9讲' },
            { subjectId: 'shu1', chapterId: 'ch5', label: '30讲高数第5讲' },
            { subjectId: 'shu1', chapterId: 'ch6', label: '30讲高数第6讲' }
          ],
          targetCount: 84, mode: 'green'
        }
      ]
    },
    {
      day: 4,
      date: '2026-11-03',
      label: 'Day 4 (11.03 周二)',
      week: '第一周 · 22/23真题模考 & 36讲线代收官 & 波哥傅氏拉氏',
      focus: '10+11两年数一真题清零 + 华科16真题 + 邂逅第1章收官&第2章启动 + 波哥拉氏启动',
      tasks: [
        {
          id: 'd4_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '2010年(8道非绿) + 2011年(9道非绿) 真题并刷全绿 + 邂逅第1章收官(题96–129，🎉第1章全绿！)',
          desc: '10、11两年合计仅17道非绿题，上午一并清零标绿；随后把邂逅第1章最后34题全部干完收官！',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2010', label: '10年数一真题(23题)' },
            { subjectId: 'shu1', chapterId: 's1_zt_2011', label: '11年数一真题(23题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_01', label: '邂逅第1章(129题收官)' }
          ],
          targetCount: 175, mode: 'green'
        },
        {
          id: 'd4_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【华科824】2016年真题(24题) 3h全真模考 + 订正标绿',
          desc: '严格3小时考场标准拿下华科2016年真题24题，做完立刻批改并把错题标黄/红、掌握题标绿。',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'hust_824_16', label: '华科16真题(24题)' }],
          targetCount: 24, mode: 'done'
        },
        {
          id: 'd4_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》高数第2章 导数（推进前35题，题1–35）',
          desc: '邂逅第2章导数共101题，今晚拿下前35题。',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_gs_02', label: '邂逅高数第2章·导数(101题)' }],
          targetCount: 35, mode: 'green'
        },
        {
          id: 'd4_p_ev', cat: 'major', catLabel: '专业课·晚间1h15m', time: '20:45–22:00',
          title: '波哥第5章拉氏变换(上)：强化第5章(前19题) + 基础习题集第5章(清前30道错题)',
          desc: '拉氏变换是后面电路专题的基石！今晚做强化第5章前19题，并把习题集第5章绿标从21推到51题。',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'bg_qh_05', label: '波哥强化第5章(37题)' },
            { subjectId: 'zhuanye', chapterId: 'bg_xt_05', label: '波哥习题集第5章(87题)' }
          ],
          targetCount: 70, mode: 'green'
        },
        {
          id: 'd4_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》马原第3章唯物史观收官(后40题) + 第4章政经(清20未标+15错题)',
          desc: '马原第3章56题全绿收官，同时清理马原第4章政经剩余20道未标题与错题。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100405', label: '马原·第3章(56题收官)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100406', label: '马原·第4章(113题)' }
          ],
          targetCount: 105, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd4_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大作文中间论证段背默(30m) + 下午真题阅读精读2篇(50m)',
          desc: '背熟因果分析与举例论证黄金句型，下午精读阅读。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2023', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd4_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《强化36讲》概率第1–3讲(事件/一维随机变量，共28题) + 《30讲》高数第7–8讲点绿',
          desc: '正式启动36讲概率篇（ch58–ch60共28题），同时将30讲高数第7–8讲（35题）过筛点绿。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch58', label: '36讲概率第1讲' },
            { subjectId: 'shu1', chapterId: 'ch59', label: '36讲概率第2讲' },
            { subjectId: 'shu1', chapterId: 'ch60', label: '36讲概率第3讲' },
            { subjectId: 'shu1', chapterId: 'ch7', label: '30讲高数第7讲' },
            { subjectId: 'shu1', chapterId: 'ch8', label: '30讲高数第8讲' }
          ],
          targetCount: 63, mode: 'green'
        }
      ]
    },
    {
      day: 5,
      date: '2026-11-04',
      label: 'Day 5 (11.04 周三)',
      week: '第一周 · 22/23真题模考 & 36讲线代收官 & 波哥傅氏拉氏',
      focus: '12年数一真题清零 + 南大12-14三套连刷 + 邂逅第2章导数收官 + 波哥拉氏收官',
      tasks: [
        {
          id: 'd5_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '2012年数一真题(16道非绿题重做清零) + 邂逅高数第2章导数(推至65题)',
          desc: '上午清零2012年真题16道🟡/🔴题，余下时间推进《邂逅遗憾》高数第2章30题。',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2012', label: '12年数一真题(23题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_02', label: '邂逅高数第2章(推至65题)' }
          ],
          targetCount: 88, mode: 'green'
        },
        {
          id: 'd5_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【南大851三套连刷】2012年(7题) + 2013年(7题) + 2014年(7题)',
          desc: '12–14年南大真题每套7道大题（合计21题），3小时整块一气呵成刷完并订正标绿！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'nju_851_12', label: '南大12真题(7题)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_13', label: '南大13真题(7题)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_14', label: '南大14真题(7题)' }
          ],
          targetCount: 21, mode: 'green'
        },
        {
          id: 'd5_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》高数第2章 导数（后36题，🎉第2章101题全绿收官！）',
          desc: '今晚干掉第2章最后36题，邂逅高数前3章（极限+导数+积分共362题）全部攻克！',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_gs_02', label: '邂逅高数第2章(101题收官)' }],
          targetCount: 101, mode: 'green'
        },
        {
          id: 'd5_p_ev', cat: 'major', catLabel: '专业课·晚间1h15m', time: '20:45–22:00',
          title: '波哥第5章拉氏变换(收官)：强化第5章(后18题收官) + 习题集第5章(清剩余36道错题) + 讲义第5章(15错题)',
          desc: '把拉氏变换三本书剩余错题一网打尽，为明晚正式启动「⚡电路专题」扫清一切障碍！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'bg_qh_05', label: '波哥强化第5章(37题收官)' },
            { subjectId: 'zhuanye', chapterId: 'bg_xt_05', label: '波哥习题集第5章(87题收官)' },
            { subjectId: 'zhuanye', chapterId: 'bg_jy_05', label: '波哥讲义第5章(51题收官)' }
          ],
          targetCount: 175, mode: 'green'
        },
        {
          id: 'd5_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》马原第5章(44题) + 第6章(前15题) + 复盘第4章政经错题',
          desc: '推进马原第5、6章资本主义发展与社会主义规律共59题。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100407', label: '马原·第5章(44题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100408', label: '马原·第6章(26题)' }
          ],
          targetCount: 59, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd5_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大作文结尾总结段背默(30m) + 下午真题阅读精读2篇(50m)',
          desc: '完成大作文三段式闭环合练。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2022', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd5_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《强化36讲》概率第4–6讲(多维随机变量与数字特征，共23题) + 《30讲》高数第9–10讲点绿',
          desc: '45m刷完36讲概率ch61–ch63（23题）；25m点绿30讲高数第9–10讲（含第10讲15道错题快速复盘）。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch61', label: '36讲概率第4讲' },
            { subjectId: 'shu1', chapterId: 'ch62', label: '36讲概率第5讲' },
            { subjectId: 'shu1', chapterId: 'ch63', label: '36讲概率第6讲' },
            { subjectId: 'shu1', chapterId: 'ch9', label: '30讲高数第9讲' },
            { subjectId: 'shu1', chapterId: 'ch10', label: '30讲高数第10讲' }
          ],
          targetCount: 92, mode: 'green'
        }
      ]
    },
    {
      day: 6,
      date: '2026-11-05',
      label: 'Day 6 (11.05 周四)',
      week: '第一周 · ⚡电路专题必搞启动 & 36讲概率收官',
      focus: '13年真题清零 + 华科17&南大15真题 + 邂逅第4章微分方程全章 + ⚡电路专题(Day 1/5)',
      tasks: [
        {
          id: 'd6_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '2013年数一真题(15道非绿题重做清零) + 邂逅高数第4章微分方程(前25题)',
          desc: '上午清零2013年真题15道错题，随后开启邂逅第4章微分方程（共59题）前25题。',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2013', label: '13年数一真题(23题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_04', label: '邂逅第4章·微分方程(前25题)' }
          ],
          targetCount: 50, mode: 'green'
        },
        {
          id: 'd6_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【华科824 + 南大851】华科2017年真题(12题) + 南大2015年真题(7题)',
          desc: '华科17年(12题)与南大15年(7题)合计19题，3小时整块完美匹配！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'hust_824_17', label: '华科17真题(12题)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_15', label: '南大15真题(7题)' }
          ],
          targetCount: 19, mode: 'green'
        },
        {
          id: 'd6_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》高数第4章 微分方程（后34题，🎉第4章59题全绿收官！）',
          desc: '今晚一鼓作气把邂逅第4章微分方程全部刷完标绿！',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_gs_04', label: '邂逅第4章(59题收官)' }],
          targetCount: 59, mode: 'green'
        },
        {
          id: 'd6_p_ev', cat: 'MajorSpecial', catLabel: '⚡电路专题必搞 (1/5)', time: '20:45–22:00',
          title: '⚡【电路专题Day 1】手头《电路专题》讲义核心模型 + 波哥讲义第9章电路专题(10道错题清零)',
          desc: '紧接拉氏变换刚刷完的热度，今晚正式启动【电路专题】！先吃透手头电路专题资料第1部分 + 清零波哥讲义第9章10题。',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'bg_jy_09', label: '波哥讲义第9章·电路专题(10题)' }],
          targetCount: 10, mode: 'green',
          offlineLabel: '手头《电路专题》第1部分', offlineTarget: 1, special: true
        },
        {
          id: 'd6_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》马原第6–7章收官 + 毛中特导论与第1–2章(共57题)',
          desc: '今日马原新题全部刷完！正式切入毛中特导论与第1–2章。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100408', label: '马原·第6章(收官)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100409', label: '马原·第7章(6题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100410', label: '毛中特·导论' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100411', label: '毛中特·第1章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100412', label: '毛中特·第2章(37题)' }
          ],
          targetCount: 80, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd6_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大小作文整篇限时默写(30m) + 下午真题阅读精读2篇(50m)',
          desc: '脱离模板独立默写1篇大作文框架，下午精读阅读。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2022', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd6_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《强化36讲》概率第7–9讲(大数定律/统计量/参数估计，🎉36讲概率全书收官！) + 《30讲》高数第11–12讲点绿',
          desc: '今晚刷完ch64–ch66（20题），至此《强化36讲》线代+概率全部清零全绿！同时点绿30讲第11–12讲。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch64', label: '36讲概率第7讲' },
            { subjectId: 'shu1', chapterId: 'ch65', label: '36讲概率第8讲' },
            { subjectId: 'shu1', chapterId: 'ch66', label: '36讲概率第9讲' },
            { subjectId: 'shu1', chapterId: 'ch11', label: '30讲高数第11讲' },
            { subjectId: 'shu1', chapterId: 'ch12', label: '30讲高数第12讲' }
          ],
          targetCount: 45, mode: 'green'
        }
      ]
    },
    {
      day: 7,
      date: '2026-11-06',
      label: 'Day 7 (11.06 周五)',
      week: '第一周收官 · 专业课模拟卷(一) & ⚡电路专题(Day 2/5)',
      focus: '14年真题清零 + 🔥专业课模拟卷(一)3h模考 + 邂逅第5章多元微分全章 + ⚡电路专题(2/5)',
      tasks: [
        {
          id: 'd7_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '2014年数一真题(14道非绿题重做清零) + 邂逅高数第5章多元微分(前28题)',
          desc: '上午清零14年真题14道错题，无缝切入邂逅第5章多元微分（共68题）前28题。',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2014', label: '14年数一真题(23题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_05', label: '邂逅第5章·多元微分(前28题)' }
          ],
          targetCount: 51, mode: 'green'
        },
        {
          id: 'd7_p_pm', cat: 'major', catLabel: '专业课·下午3h模考', time: '14:00–17:00',
          title: '🔥【专业课模拟卷(一)】3h全真模考（可选手头模拟卷1 或 网站刺猬哥/芝麻模拟卷一）',
          desc: '第一周周五下午14:00-17:00全真模拟！可刷手头纸质模拟卷(一)或网站内26模拟卷一，当场批改复盘。',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'nju_851_mn_26_01', label: '26刺猬哥预测卷(一)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_zm_26_01', label: '26芝麻模拟卷(一)' }
          ],
          offlineLabel: '专业课模拟卷(一) 3h模考+订正', offlineTarget: 1, special: true
        },
        {
          id: 'd7_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》高数第5章 多元微分（后40题，🎉第5章68题全绿收官！）',
          desc: '第一周结束前拿下邂逅第5章多元微分全部68题！',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_gs_05', label: '邂逅第5章(68题收官)' }],
          targetCount: 68, mode: 'green'
        },
        {
          id: 'd7_p_ev', cat: 'MajorSpecial', catLabel: '⚡电路专题必搞 (2/5)', time: '20:45–22:00',
          title: '⚡【电路专题Day 2】手头《电路专题》典型题攻坚 + 波哥强化习题集第7章电路专题(题1–10)',
          desc: '继续推进手头《电路专题》第2部分，并完成波哥强化习题集第7章电路专题前10题。',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'bg_qh_07', label: '波哥强化第7章·电路专题(18题)' }],
          targetCount: 10, mode: 'green',
          offlineLabel: '手头《电路专题》第2部分', offlineTarget: 1, special: true
        },
        {
          id: 'd7_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》毛中特第3–6章(55题) + 马原第4章政经错题清零',
          desc: '刷完毛中特第3–6章共55题，同时把马原第4章残余错题再清15道。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100413', label: '毛中特·第3章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100414', label: '毛中特·第4章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100415', label: '毛中特·第5章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100416', label: '毛中特·第6章' }
          ],
          targetCount: 55, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd7_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间第一周作文模板总复盘默写(30m) + 下午真题阅读精读2篇(50m)',
          desc: '复盘本周背诵的所有大小作文语料。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2021', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd7_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《李林880》高数第2章微分(54道🟡/🔴错题，清前30题) + 《30讲》高数第13–14讲点绿',
          desc: '36讲线代概率已收官！今晚切入880高数错题二刷（ch159现有36绿+54错题，今晚推至66绿），并点绿30讲第13–14讲。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch159', label: '880高数第2章(清错题)' },
            { subjectId: 'shu1', chapterId: 'ch13', label: '30讲高数第13讲' },
            { subjectId: 'shu1', chapterId: 'ch14', label: '30讲高数第14讲' }
          ],
          targetCount: 131, mode: 'green'
        }
      ]
    },
    {
      day: 8,
      date: '2026-11-07',
      label: 'Day 8 (11.07 周六)',
      week: '第二周 · ⚡电路专题收官 & 🎓南大期末题登场 & 真题一轮通关',
      focus: '15+16两年真题清零 + 华科18真题 + 邂逅第6章二重积分全章 + ⚡电路专题(Day 3/5)',
      tasks: [
        {
          id: 'd8_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '2015年(10道非绿) + 2016年(14道非绿) 真题并刷全绿 + 邂逅第6章二重积分(前20题)',
          desc: '15、16两年合计24道非绿题，上午3h整块全部重做标绿；11:30后推进邂逅第6章二重积分前20题。',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2015', label: '15年数一真题(23题)' },
            { subjectId: 'shu1', chapterId: 's1_zt_2016', label: '16年数一真题(23题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_06', label: '邂逅第6章·二重积分(46题)' }
          ],
          targetCount: 66, mode: 'green'
        },
        {
          id: 'd8_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【华科824】2018年真题(20题) 3h全真模考 + 订正标绿',
          desc: '3小时考场标准拿下华科2018年真题20题，当场批改复盘。',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'hust_824_18', label: '华科18真题(20题)' }],
          targetCount: 20, mode: 'done'
        },
        {
          id: 'd8_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》高数第6章二重积分(后26题收官) + 第7章无穷级数(前10题)',
          desc: '今晚把第6章二重积分46题全部收官，并开启数一重头戏第7章无穷级数！',
          chapters: [
            { subjectId: 'shu1', chapterId: 'xhy_gs_06', label: '邂逅第6章(46题收官)' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_07', label: '邂逅第7章·无穷级数(88题)' }
          ],
          targetCount: 56, mode: 'green'
        },
        {
          id: 'd8_p_ev', cat: 'MajorSpecial', catLabel: '⚡电路专题必搞 (3/5)', time: '20:45–22:00',
          title: '⚡【电路专题Day 3】手头《电路专题》综合大题 + 波哥强化第7章电路专题(后8题，🎉强化电路收官！)',
          desc: '完成波哥强化习题集第7章电路专题全部18题，并推进手头《电路专题》第3部分综合题！',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'bg_qh_07', label: '波哥强化第7章·电路专题(18题收官)' }],
          targetCount: 18, mode: 'green',
          offlineLabel: '手头《电路专题》第3部分', offlineTarget: 1, special: true
        },
        {
          id: 'd8_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》毛中特第7–8章收官 + 新思想导论与第1–4章(共53题)',
          desc: '毛中特全篇收官！正式进入新思想前4章。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100417', label: '毛中特·第7章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100418', label: '毛中特·第8章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100421', label: '新思想·导论' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100422', label: '新思想·第1章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100423', label: '新思想·第2章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100424', label: '新思想·第3章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100425', label: '新思想·第4章' }
          ],
          targetCount: 53, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd8_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间图表/材料作文模板背默(30m) + 下午真题阅读精读2篇(50m)',
          desc: '兼顾英语一新题型/图表转换句式。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2021', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd8_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《李林880》高数第2章错题收尾(后24题) + 第3章积分错题(前10题) + 《30讲》高数第15–16讲点绿',
          desc: '把880高数第2章已做错题全部清零（达90绿），开启第3章积分错题，同时点绿30讲第15–16讲。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch159', label: '880高数第2章(错题清零)' },
            { subjectId: 'shu1', chapterId: 'ch160', label: '880高数第3章(清错题)' },
            { subjectId: 'shu1', chapterId: 'ch15', label: '30讲高数第15讲' },
            { subjectId: 'shu1', chapterId: 'ch16', label: '30讲高数第16讲' }
          ],
          targetCount: 226, mode: 'green'
        }
      ]
    },
    {
      day: 9,
      date: '2026-11-08',
      label: 'Day 9 (11.08 周日)',
      week: '第二周 · ⚡电路专题收官 & 🎓南大期末题登场 & 真题一轮通关',
      focus: '17年真题清零 + 南大16-18三套连刷 + 邂逅第7章无穷级数收官 + ⚡电路专题(Day 4/5)',
      tasks: [
        {
          id: 'd9_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '2017年数一真题(15道非绿，含11未标) 重做清零 + 邂逅第7章无穷级数(推至45题)',
          desc: '17年真题有11道未标题+4道错题，上午精做标绿；随后推进邂逅第7章无穷级数35题。',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2017', label: '17年数一真题(23题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_07', label: '邂逅第7章·无穷级数(推至45题)' }
          ],
          targetCount: 68, mode: 'green'
        },
        {
          id: 'd9_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【南大851三套连刷】2016年(7题) + 2017年(7题) + 2018年(9题)',
          desc: '16–18年南大真题合计23题，下午3h考场块完整刷完并订正标绿！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'nju_851_16', label: '南大16真题(7题)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_17', label: '南大17真题(7题)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_18', label: '南大18真题(9题)' }
          ],
          targetCount: 23, mode: 'green'
        },
        {
          id: 'd9_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》高数第7章 无穷级数（后43题，🎉第7章88题全绿收官！）',
          desc: '今晚彻底攻克邂逅高数第7章无穷级数88题！',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_gs_07', label: '邂逅第7章(88题收官)' }],
          targetCount: 88, mode: 'green'
        },
        {
          id: 'd9_p_ev', cat: 'MajorSpecial', catLabel: '⚡电路专题必搞 (4/5)', time: '20:45–22:00',
          title: '⚡【电路专题Day 4】波哥习题集第9章电路专题(39题，清前20道🟡/🔴错题) + 手头电路专题难题攻克',
          desc: '波哥习题集第9章电路专题共有37道黄红错题，今晚先干掉前20道，结合手头电路专题资料彻底吃透等效电路与运算电路！',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'bg_xt_09', label: '波哥习题集第9章·电路专题(39题)' }],
          targetCount: 22, mode: 'green',
          offlineLabel: '手头《电路专题》第4部分', offlineTarget: 1, special: true
        },
        {
          id: 'd9_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》新思想第5–7章(改革开放/高质量发展/科教人才，共59题)',
          desc: '刷完新思想第5–7章59题，当场复盘错题标绿。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100426', label: '新思想·第5章(17题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100427', label: '新思想·第6章(33题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100428', label: '新思想·第7章(9题)' }
          ],
          targetCount: 59, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd9_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间小作文建议信/投诉信/邀请信背默(30m) + 下午真题阅读精读2篇(50m)',
          desc: '巩固小作文高频信件类型。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2020', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd9_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《李林880》高数第3章积分错题(推进30道，达70绿) + 《30讲》高数第17–18讲点绿(🎉30讲高数全绿！)',
          desc: '继续清理880第3章积分错题；同时点绿30讲高数最后两讲（第17–18讲），30讲高数18讲全部点绿收官！',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch160', label: '880高数第3章(推至70绿)' },
            { subjectId: 'shu1', chapterId: 'ch17', label: '30讲高数第17讲' },
            { subjectId: 'shu1', chapterId: 'ch18', label: '30讲高数第18讲(收官)' }
          ],
          targetCount: 134, mode: 'green'
        }
      ]
    },
    {
      day: 10,
      date: '2026-11-09',
      label: 'Day 10 (11.09 周一)',
      week: '第二周 · ⚡电路专题100%收官 & 线面积分攻坚',
      focus: '18年真题清零 + 华科19真题 + 邂逅第8章空间几何&第9章线面积分 + ⚡电路专题(Day 5/5收官！)',
      tasks: [
        {
          id: 'd10_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '2018年数一真题(14道非绿题重做清零) + 邂逅高数第8章空间几何(全章30题全绿收官！)',
          desc: '上午清零18年真题14道错题，随后把邂逅第8章空间几何30题全部拿下！',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2018', label: '18年数一真题(23题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_08', label: '邂逅第8章·空间几何(30题)' }
          ],
          targetCount: 53, mode: 'green'
        },
        {
          id: 'd10_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【华科824】2019年真题(23题) 3h全真模考 + 订正标绿',
          desc: '下午3h整块完成华科2019年真题23题并批改复盘。',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'hust_824_19', label: '华科19真题(23题)' }],
          targetCount: 23, mode: 'done'
        },
        {
          id: 'd10_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》高数第9章 三重积分和线面积分（前35题，题1–35）',
          desc: '数一压轴大题核心区！今晚专注攻克邂逅第9章前35题。',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_gs_09', label: '邂逅第9章·三重与线面积分(71题)' }],
          targetCount: 35, mode: 'green'
        },
        {
          id: 'd10_p_ev', cat: 'MajorSpecial', catLabel: '⚡电路专题必搞 (5/5收官)', time: '20:45–22:00',
          title: '⚡【电路专题Day 5收官】波哥习题集第9章电路专题(清后17道错题) + 手头《电路专题》100%通关！',
          desc: '今晚彻底清零波哥习题集第9章(39/39全绿)，连同讲义第9章(10/10)、强化第7章(18/18)与手头《电路专题》全部搞定！明晚正式接棒【🎓南大期末题】！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'bg_xt_09', label: '波哥习题集第9章(39题收官)' },
            { subjectId: 'zhuanye', chapterId: 'bg_jy_09', label: '波哥讲义第9章(10题)' },
            { subjectId: 'zhuanye', chapterId: 'bg_qh_07', label: '波哥强化第7章(18题)' }
          ],
          targetCount: 67, mode: 'green',
          offlineLabel: '手头《电路专题》全套收官验收', offlineTarget: 1, special: true
        },
        {
          id: 'd10_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》新思想第8–10章(民主/法治/文化强国，共52题)',
          desc: '刷完新思想第8–10章52题并复盘错题。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100429', label: '新思想·第8章(24题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100430', label: '新思想·第9章(10题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100431', label: '新思想·第10章(18题)' }
          ],
          targetCount: 52, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd10_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大作文人生哲理/文化交流主题背默(30m) + 下午真题阅读精读2篇(50m)',
          desc: '背诵高频主题词群与万能例证。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2020', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd10_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《李林880》高数第3章错题清零(达85绿) + 第9章线面错题(前20题) + 《30讲》线代第1–3讲点绿',
          desc: '把880第3章已做错题全部清零，并启动第9章线面积分错题；同时点绿30讲线代前3讲。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch160', label: '880高数第3章(错题清零)' },
            { subjectId: 'shu1', chapterId: 'ch166', label: '880高数第9章·线面积分' },
            { subjectId: 'shu1', chapterId: 'ch19', label: '30讲线代第1讲' },
            { subjectId: 'shu1', chapterId: 'ch20', label: '30讲线代第2讲' },
            { subjectId: 'shu1', chapterId: 'ch21', label: '30讲线代第3讲' }
          ],
          targetCount: 196, mode: 'green'
        }
      ]
    },
    {
      day: 11,
      date: '2026-11-10',
      label: 'Day 11 (11.10 周二)',
      week: '第二周 · 🎓南大期末题必搞(Day 1/6) & 邂逅高数全篇收官！',
      focus: '19年真题清零 + 南大19&24真题 + 邂逅高数10章全收官 + 🎓南大期末题(1/6)&波哥Z变换',
      tasks: [
        {
          id: 'd11_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '2019年数一真题(16道非绿，含9未标) 重做清零 + 邂逅第9章线面积分(后36题，🎉第9章收官！)',
          desc: '上午清零19年真题16道非绿题，随后把邂逅第9章三重与线面积分后36题全部刷完标绿！',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2019', label: '19年数一真题(23题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_09', label: '邂逅第9章(71题收官)' }
          ],
          targetCount: 94, mode: 'green'
        },
        {
          id: 'd11_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【南大851两套连刷】2019年真题(11题) + 2024年真题(10题)',
          desc: '下午3h整块拿下南大19年与24年真题共21道大题，当场批改订正标绿！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'nju_851_19', label: '南大19真题(11题)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_24', label: '南大24真题(10题)' }
          ],
          targetCount: 21, mode: 'green'
        },
        {
          id: 'd11_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》高数第10章线面补充(20题，🎉邂逅高数744题全篇收官！) + 线代第1章行列式(前16题)',
          desc: '今晚完成邂逅高数第10章20题，宣告《邂逅遗憾》高数篇744题全部通关！顺势开启线代第1章行列式。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'xhy_gs_10', label: '邂逅第10章·线面补充(20题)' },
            { subjectId: 'shu1', chapterId: 'xhy_xd_11', label: '邂逅线代第1章·行列式(36题)' }
          ],
          targetCount: 36, mode: 'green'
        },
        {
          id: 'd11_p_ev', cat: 'MajorSpecial', catLabel: '🎓南大期末题必搞 (1/6)', time: '20:45–22:00',
          title: '🎓【南大期末题Day 1】时域与卷积期末题专练 + 波哥强化第6章离散复频域(题1–25) & 讲义第6章扫尾',
          desc: '电路专题已圆满收官，今晚正式启动【🎓南大期末题】第1天！配合波哥第6章Z变换（讲义10道非绿+强化前25题）。',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'bg_qh_06', label: '波哥强化第6章(55题)' },
            { subjectId: 'zhuanye', chapterId: 'bg_jy_06', label: '波哥讲义第6章(27题收官)' }
          ],
          targetCount: 52, mode: 'green',
          offlineLabel: '手头《南大期末题》Day 1 (时域/卷积)', offlineTarget: 1, special: true
        },
        {
          id: 'd11_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》新思想第11–16章(社会/生态/国安/国防/一国两制/外交，共52题)',
          desc: '刷完新思想第11–16章共52题并复盘错题。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100432', label: '新思想·第11章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100433', label: '新思想·第12章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100439', label: '新思想·第13章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100435', label: '新思想·第14章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100436', label: '新思想·第15章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100437', label: '新思想·第16章' }
          ],
          targetCount: 52, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd11_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大作文科技创新/环境保护主题背默(30m) + 下午真题阅读精读2篇(50m)',
          desc: '默写高频话题核心词句，下午精读阅读。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2019', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd11_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《李林880》高数第9章线面错题收尾(达45绿) + 36讲高数第16讲级数错题(13题) + 《30讲》线代第4–6讲点绿(🎉30讲线代全绿！)',
          desc: '清完880第9章已做错题与36讲级数错题；同时把30讲线代第4–6讲过筛点绿，30讲线代全篇收官！',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch166', label: '880高数第9章(错题清零)' },
            { subjectId: 'shu1', chapterId: 'ch46', label: '36讲高数第16讲·级数' },
            { subjectId: 'shu1', chapterId: 'ch22', label: '30讲线代第4讲' },
            { subjectId: 'shu1', chapterId: 'ch23', label: '30讲线代第5讲' },
            { subjectId: 'shu1', chapterId: 'ch24', label: '30讲线代第6讲(收官)' }
          ],
          targetCount: 153, mode: 'green'
        }
      ]
    },
    {
      day: 12,
      date: '2026-11-11',
      label: 'Day 12 (11.11 周三)',
      week: '第二周 · 🎓南大期末题必搞(Day 2/6) & 20年数一重点攻坚',
      focus: '20年数一真题(21道非绿) + 华科20真题 + 邂逅线代第1-2章 + 🎓南大期末题(2/6)',
      tasks: [
        {
          id: 'd12_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '2020年数一真题(21道非绿，含12未标) 3h深度攻克 + 邂逅线代第1章行列式收官(后20题)',
          desc: '2020年是史上最难数一真题之一（剩21道非绿），上午用足时间逐题攻克标绿；随后收官邂逅线代第1章！',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2020', label: '20年数一真题(23题)' },
            { subjectId: 'shu1', chapterId: 'xhy_xd_11', label: '邂逅线代第1章(36题收官)' }
          ],
          targetCount: 59, mode: 'green'
        },
        {
          id: 'd12_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【华科824】2020年真题(26题) 3h全真模考 + 订正标绿',
          desc: '下午3h考场整块完成华科2020年真题26题，当场批改复盘。',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'hust_824_20', label: '华科20真题(26题)' }],
          targetCount: 26, mode: 'done'
        },
        {
          id: 'd12_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》线代第2章 矩阵（前35题，题1–35）',
          desc: '邂逅线代第2章矩阵共56题，今晚高效率推进前35题。',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_xd_12', label: '邂逅线代第2章·矩阵(56题)' }],
          targetCount: 35, mode: 'green'
        },
        {
          id: 'd12_p_ev', cat: 'MajorSpecial', catLabel: '🎓南大期末题必搞 (2/6)', time: '20:45–22:00',
          title: '🎓【南大期末题Day 2】傅里叶与采样调制期末题 + 波哥强化第6章离散复频域(后30题，🎉强化第6章收官！)',
          desc: '推进手头《南大期末题》第2部分（傅里叶与采样），并把波哥强化第6章55题全部刷完收官！',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'bg_qh_06', label: '波哥强化第6章(55题收官)' }],
          targetCount: 55, mode: 'green',
          offlineLabel: '手头《南大期末题》Day 2 (傅氏/采样)', offlineTarget: 1, special: true
        },
        {
          id: 'd12_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》新思想第17章收官 + 史纲第1–2章(共57题)',
          desc: '新思想全篇收官！正式切入中国近现代史纲要第1–2章。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100438', label: '新思想·第17章(13题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100440', label: '史纲·第1章(22题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100441', label: '史纲·第2章(22题)' }
          ],
          targetCount: 57, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd12_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大小作文高频功能句默写(30m) + 下午真题阅读精读2篇(50m)',
          desc: '持续保持阅读手感与词汇复盘。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2019', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd12_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《李林880》线代已做错题总清零(第10-11章28错题 + 第14-15章26错题) + 《30讲》概率第1–3讲点绿',
          desc: '把880线代之前留下的54道🟡/🔴错题一举清零！同时点绿30讲概率前3讲。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch167', label: '880线代第10章·行列式' },
            { subjectId: 'shu1', chapterId: 'ch168', label: '880线代第11章·矩阵' },
            { subjectId: 'shu1', chapterId: 'ch171', label: '880线代第14章·相似' },
            { subjectId: 'shu1', chapterId: 'ch172', label: '880线代第15章·二次型' },
            { subjectId: 'shu1', chapterId: 'ch25', label: '30讲概率第1讲' },
            { subjectId: 'shu1', chapterId: 'ch26', label: '30讲概率第2讲' },
            { subjectId: 'shu1', chapterId: 'ch27', label: '30讲概率第3讲' }
          ],
          targetCount: 197, mode: 'green'
        }
      ]
    },
    {
      day: 13,
      date: '2026-11-12',
      label: 'Day 13 (11.12 周四)',
      week: '第二周 · 🎉09-23数学真题一轮全通 & 🎓南大期末题(Day 3/6)',
      focus: '21年真题清零(09-23一轮通关！) + 南大25&26真题 + 邂逅线代2-3章 + 🎓南大期末题(3/6)',
      tasks: [
        {
          id: 'd13_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '2021年数一真题(11道非绿题重做，🎉09–23年15套真题一轮全通！) + 邂逅线代第2章矩阵收官(后21题)',
          desc: '上午清完2021年真题11道错题，09–23年15套真题完成一轮全覆盖！余时收官邂逅线代第2章矩阵并开启第3章向量前15题。',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2021', label: '21年数一真题(22题)' },
            { subjectId: 'shu1', chapterId: 'xhy_xd_12', label: '邂逅线代第2章(56题收官)' },
            { subjectId: 'shu1', chapterId: 'xhy_xd_13', label: '邂逅线代第3章·向量(前15题)' }
          ],
          targetCount: 93, mode: 'green'
        },
        {
          id: 'd13_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【南大851最新卷】2025年真题(9题) + 2026年真题(10题)（🎉南大16套未做卷全部刷完！）',
          desc: '下午3h整块攻克南大最新25、26年真题共19题！至此南大851全部20套真题一轮全部做完！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'nju_851_25', label: '南大25真题(9题)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_26', label: '南大26真题(10题)' }
          ],
          targetCount: 19, mode: 'green'
        },
        {
          id: 'd13_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》线代第3章向量(后29题收官) + 第4章方程组(前10题)',
          desc: '今晚收官邂逅线代第3章向量44题，并推进第4章方程组前10题。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'xhy_xd_13', label: '邂逅线代第3章(44题收官)' },
            { subjectId: 'shu1', chapterId: 'xhy_xd_14', label: '邂逅线代第4章·方程组(21题)' }
          ],
          targetCount: 54, mode: 'green'
        },
        {
          id: 'd13_p_ev', cat: 'MajorSpecial', catLabel: '🎓南大期末题必搞 (3/6)', time: '20:45–22:00',
          title: '🎓【南大期末题Day 3】拉氏变换与S域系统期末题 + 波哥习题集第6章Z变换(清前30道🟡/🔴错题)',
          desc: '完成手头《南大期末题》第3部分，同时把波哥习题集第6章Z变换绿标从17题推至47题！',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'bg_xt_06', label: '波哥习题集第6章·Z变换(74题)' }],
          targetCount: 47, mode: 'green',
          offlineLabel: '手头《南大期末题》Day 3 (拉氏/S域)', offlineTarget: 1, special: true
        },
        {
          id: 'd13_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》史纲第3–4章(辛亥革命/建党与大革命，共65题)',
          desc: '推进史纲第3、4章65题并当场复盘错题。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100442', label: '史纲·第3章(24题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100443', label: '史纲·第4章(41题)' }
          ],
          targetCount: 65, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd13_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间小作文通知/告示/纪要模板背默(30m) + 下午真题阅读精读2篇(50m)',
          desc: '覆盖全部小作文文体格式。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2018', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd13_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《李林880》概率已做错题清零(第16–18章，清前50道错题) + 《30讲》概率第4–6讲点绿(🎉基础30讲全书30讲100%绿！)',
          desc: '清理880概率第16–18章错题；同时点绿30讲概率最后3讲，至此《张宇基础30讲》高数+线代+概率共872题全部点绿收官！',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch173', label: '880概率第16章' },
            { subjectId: 'shu1', chapterId: 'ch174', label: '880概率第17章' },
            { subjectId: 'shu1', chapterId: 'ch175', label: '880概率第18章' },
            { subjectId: 'shu1', chapterId: 'ch28', label: '30讲概率第4讲' },
            { subjectId: 'shu1', chapterId: 'ch29', label: '30讲概率第5讲' },
            { subjectId: 'shu1', chapterId: 'ch30', label: '30讲概率第6讲(全书收官)' }
          ],
          targetCount: 143, mode: 'green'
        }
      ]
    },
    {
      day: 14,
      date: '2026-11-13',
      label: 'Day 14 (11.13 周五)',
      week: '第二周收官 · 专业课模拟卷(二) & 🎓南大期末题(Day 4/6) & 真题二刷启动',
      focus: '09-11数一真题二刷100%全绿 + 🔥专业课模拟卷(二)3h模考 + 邂逅线代4-6章 + 🎓南大期末题(4/6)',
      tasks: [
        {
          id: 'd14_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '【真题二刷Day 1】09–11年真题残余黄/红题盲做清零 + 邂逅线代第4章收官(后11题) & 第5章相似(全29题)',
          desc: '开启真题二刷验收：确保09、10、11三年真题共69题100%全绿！随后拿下邂逅线代第4章收尾与第5章相似矩阵全部29题。',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2009', label: '09真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 's1_zt_2010', label: '10真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 's1_zt_2011', label: '11真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 'xhy_xd_14', label: '邂逅线代第4章(21题收官)' },
            { subjectId: 'shu1', chapterId: 'xhy_xd_15', label: '邂逅线代第5章·相似(29题)' }
          ],
          targetCount: 119, mode: 'green'
        },
        {
          id: 'd14_p_pm', cat: 'major', catLabel: '专业课·下午3h模考', time: '14:00–17:00',
          title: '🔥【专业课模拟卷(二)】3h全真模考（可选手头模拟卷2 或 网站刺猬哥/芝麻模拟卷二）',
          desc: '第二周周五下午14:00-17:00全真3h模拟！检验本周电路专题与期末题特训成果。',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'nju_851_mn_26_02', label: '26刺猬哥预测卷(二)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_zm_26_02', label: '26芝麻模拟卷(二)' }
          ],
          offlineLabel: '专业课模拟卷(二) 3h模考+订正', offlineTarget: 1, special: true
        },
        {
          id: 'd14_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》线代第6章 二次型（前35题，题1–35）',
          desc: '二次型共42题，今晚拿下前35题，明天即可收官邂逅线代全篇！',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_xd_16', label: '邂逅线代第6章·二次型(42题)' }],
          targetCount: 35, mode: 'green'
        },
        {
          id: 'd14_p_ev', cat: 'MajorSpecial', catLabel: '🎓南大期末题必搞 (4/6)', time: '20:45–22:00',
          title: '🎓【南大期末题Day 4】Z变换与离散系统期末题 + 波哥习题集第6章Z变换(清后27道错题，🎉第6章74题全绿！)',
          desc: '推进手头《南大期末题》第4部分，同时将波哥习题集第6章Z变换74题全部清零标绿！',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'bg_xt_06', label: '波哥习题集第6章(74题收官)' }],
          targetCount: 74, mode: 'green',
          offlineLabel: '手头《南大期末题》Day 4 (Z变换/离散)', offlineTarget: 1, special: true
        },
        {
          id: 'd14_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》史纲第5–6章(革命新道路/抗日战争，共64题) + 第二周政治错题复盘',
          desc: '完成史纲第5、6章64题，并复盘本周新思想与史纲错题。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100444', label: '史纲·第5章(22题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100445', label: '史纲·第6章(42题)' }
          ],
          targetCount: 64, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd14_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间第二周大小作文限时默写检验(30m) + 下午真题阅读精读2篇(50m)',
          desc: '25分钟完整默写一篇大作文+一篇小作文提纲。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2018', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd14_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《李林880》概率第19章数字特征(35道🟡/🔴错题清零) + 《1000题基础篇》高数第1–4章过筛点绿',
          desc: '把880概率第19章已做错题全部清零！30讲已全绿，今晚起每晚顺手把纸质做过的1000题基础篇点绿。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch176', label: '880概率第19章(错题清零)' },
            { subjectId: 'shu1', chapterId: 'ch67', label: '1000题基础·高数第1章' },
            { subjectId: 'shu1', chapterId: 'ch68', label: '1000题基础·高数第2章' },
            { subjectId: 'shu1', chapterId: 'ch69', label: '1000题基础·高数第3章' },
            { subjectId: 'shu1', chapterId: 'ch70', label: '1000题基础·高数第4章' }
          ],
          targetCount: 111, mode: 'green'
        }
      ]
    },
    {
      day: 15,
      date: '2026-11-14',
      label: 'Day 15 (11.14 周六)',
      week: '第三周 · 🎓南大期末题收官 & 邂逅线代概率冲刺 & 华科22-24压轴',
      focus: '12-14真题二刷 + 华科22真题 + 邂逅线代收官&概率启动 + 🎓南大期末题(Day 5/6)&波哥第7章',
      tasks: [
        {
          id: 'd15_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '【真题二刷Day 2】12–14年真题残余错题清零 + 邂逅线代第6章收尾(7题) & 第7章数一专项(19题，🎉邂逅线代收官！)',
          desc: '上午二刷12–14年真题确保69题100%全绿；随后完成邂逅线代最后26题，宣告《邂逅遗憾》线代篇247题全部收官！',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2012', label: '12真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 's1_zt_2013', label: '13真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 's1_zt_2014', label: '14真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 'xhy_xd_16', label: '邂逅线代第6章(42题收官)' },
            { subjectId: 'shu1', chapterId: 'xhy_xd_17', label: '邂逅线代第7章·数一专项(19题)' }
          ],
          targetCount: 130, mode: 'green'
        },
        {
          id: 'd15_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【华科824】2022年真题(28题) 3h全真模考 + 订正标绿',
          desc: '进入华科近3年压轴大卷！3小时考场标准完成2022年真题28题并批改复盘。',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'hust_824_22', label: '华科22真题(28题)' }],
          targetCount: 28, mode: 'done'
        },
        {
          id: 'd15_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》概率第1章随机事件(18题) + 第2章一维随机变量(前20题)',
          desc: '正式开启《邂逅遗憾》概率论篇（共228题，4天即可全通）！今晚拿下前38题。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'xhy_gl_18', label: '邂逅概率第1章(18题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gl_19', label: '邂逅概率第2章(前20题)' }
          ],
          targetCount: 38, mode: 'green'
        },
        {
          id: 'd15_p_ev', cat: 'MajorSpecial', catLabel: '🎓南大期末题必搞 (5/6)', time: '20:45–22:00',
          title: '🎓【南大期末题Day 5】DTFT与滤波器综合期末题 + 波哥第7章DTFT(讲义8错题 + 习题集35错题清零)',
          desc: '完成手头《南大期末题》第5部分，同时把波哥第7章离散时间傅氏变换（讲义8题+习题集35题）一举清零全绿！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'bg_jy_07', label: '波哥讲义第7章·DTFT(8题)' },
            { subjectId: 'zhuanye', chapterId: 'bg_xt_07', label: '波哥习题集第7章·DTFT(35题)' }
          ],
          targetCount: 43, mode: 'green',
          offlineLabel: '手头《南大期末题》Day 5 (DTFT/系统)', offlineTarget: 1, special: true
        },
        {
          id: 'd15_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》史纲第7–8章(新中国成立与社会主义建设探索，共59题)',
          desc: '刷完史纲第7、8章59题并当场复盘错题。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100446', label: '史纲·第7章(23题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100447', label: '史纲·第8章(36题)' }
          ],
          targetCount: 59, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd15_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大作文正反论证/双刃剑模板背默(30m) + 下午真题阅读精读2篇(50m)',
          desc: '巩固科技双刃剑类话题写法。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2017', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd15_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《强化36讲》高数重点未标章：第6讲中值定理(22题) + 第11讲积分不等式(19题) + 《1000题基础》高数第5–8章点绿',
          desc: '主攻数一证明题核心：36讲第6讲中值定理与第11讲积分不等式！',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch36', label: '36讲高数第6讲·中值定理(22题)' },
            { subjectId: 'shu1', chapterId: 'ch41', label: '36讲高数第11讲·积分不等式(19题)' },
            { subjectId: 'shu1', chapterId: 'ch71', label: '1000题基础·高数第5章' },
            { subjectId: 'shu1', chapterId: 'ch72', label: '1000题基础·高数第6章' }
          ],
          targetCount: 87, mode: 'green'
        }
      ]
    },
    {
      day: 16,
      date: '2026-11-15',
      label: 'Day 16 (11.15 周日)',
      week: '第三周 · 🎓南大期末题100%收官 & 🎉波哥4-9章全线收官！',
      focus: '15-17真题二刷 + 华科23真题 + 邂逅概率第2-3章 + 🎓南大期末题(Day 6/6收官)&波哥第8章收官',
      tasks: [
        {
          id: 'd16_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '【真题二刷Day 3】15–17年真题残余错题清零 + 邂逅概率第2章一维随机变量收官(后20题)',
          desc: '二刷15–17年真题确保69题100%全绿；随后收官邂逅概率第2章40题！',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2015', label: '15真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 's1_zt_2016', label: '16真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 's1_zt_2017', label: '17真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 'xhy_gl_19', label: '邂逅概率第2章(40题收官)' }
          ],
          targetCount: 109, mode: 'green'
        },
        {
          id: 'd16_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【华科824】2023年真题(28题) 3h全真模考 + 订正标绿',
          desc: '下午3h整块完成华科2023年真题28题并当场批改复盘。',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'hust_824_23', label: '华科23真题(28题)' }],
          targetCount: 28, mode: 'done'
        },
        {
          id: 'd16_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》概率第3章 二维随机变量（前35题，题1–35）',
          desc: '二维随机变量共45题，今晚拿下前35题。',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_gl_20', label: '邂逅概率第3章·二维随机变量(45题)' }],
          targetCount: 35, mode: 'green'
        },
        {
          id: 'd16_p_ev', cat: 'MajorSpecial', catLabel: '🎓南大期末题必搞 (6/6收官)', time: '20:45–22:00',
          title: '🎓【南大期末题Day 6收官】期末错题总验收 + 波哥第8章傅氏应用(讲义3题+习题集45题清零，🎉波哥4–9章全通！)',
          desc: '今晚彻底收官手头《南大期末题》全套，并把波哥第8章傅氏应用全部清零标绿！至此⚡电路专题、🎓南大期末题、波哥4–9章全部搞定！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'bg_jy_08', label: '波哥讲义第8章(3题收官)' },
            { subjectId: 'zhuanye', chapterId: 'bg_xt_08', label: '波哥习题集第8章(45题收官)' }
          ],
          targetCount: 48, mode: 'green',
          offlineLabel: '手头《南大期末题》全套收官验收', offlineTarget: 1, special: true
        },
        {
          id: 'd16_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》史纲第9–10章收官 + 思修绪论与第1–2章(共52题)',
          desc: '史纲全篇收官！正式进入最后一个模块：思修法基。',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100448', label: '史纲·第9章(12题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100449', label: '史纲·第10章(7题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100450', label: '思修·绪论(7题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100451', label: '思修·第1章(16题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100452', label: '思修·第2章(10题)' }
          ],
          targetCount: 52, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd16_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间小作文推荐信/道歉信/感谢信背默(30m) + 下午真题阅读精读2篇(50m)',
          desc: '熟练默写高频交际信件。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2017', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd16_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《强化36讲》高数第13讲多元微分(32题) + 《1000题基础》高数第9–12章点绿',
          desc: '攻克36讲高数第13讲多元函数微分学32题，并继续点绿1000题基础篇。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch43', label: '36讲高数第13讲·多元微分(32题)' },
            { subjectId: 'shu1', chapterId: 'ch75', label: '1000题基础·高数第9章' },
            { subjectId: 'shu1', chapterId: 'ch76', label: '1000题基础·高数第10章' }
          ],
          targetCount: 87, mode: 'green'
        }
      ]
    },
    {
      day: 17,
      date: '2026-11-16',
      label: 'Day 17 (11.16 周一)',
      week: '第三周 · 华科近10年真题收官 & 📚芝麻400题专题',
      focus: '18-20真题二刷 + 华科24真题(华科收官！) + 邂逅概率第3-4章收官 + 📚芝麻400题(一)',
      tasks: [
        {
          id: 'd17_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '【真题二刷Day 4】18–20年真题残余错题清零 + 邂逅概率第3章收尾(10题) & 第4章数字特征(前15题)',
          desc: '重点二刷18–20年真题确保69题100%全绿；随后收官邂逅概率第3章并开启第4章数字特征。',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2018', label: '18真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 's1_zt_2019', label: '19真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 's1_zt_2020', label: '20真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 'xhy_gl_20', label: '邂逅概率第3章(45题收官)' },
            { subjectId: 'shu1', chapterId: 'xhy_gl_21', label: '邂逅概率第4章·数字特征(前15题)' }
          ],
          targetCount: 129, mode: 'green'
        },
        {
          id: 'd17_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【华科824收官】2024年真题(28题) 3h全真模考（🎉华科近10年真题全部刷完！）',
          desc: '下午3h整块完成华科2024年最新真题28题！至此华科824近10年真题一轮全部通关！',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'hust_824_24', label: '华科24真题(28题收官)' }],
          targetCount: 28, mode: 'done'
        },
        {
          id: 'd17_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》概率第4章 随机变量的数字特征（后34题，🎉第4章49题全绿收官！）',
          desc: '今晚拿下邂逅概率第4章数字特征全部49题！明天即可实现《邂逅遗憾》全书1219题大满贯！',
          chapters: [{ subjectId: 'shu1', chapterId: 'xhy_gl_21', label: '邂逅概率第4章(49题收官)' }],
          targetCount: 49, mode: 'green'
        },
        {
          id: 'd17_p_ev', cat: 'MajorSpecial', catLabel: '📚芝麻400题 & 波哥1-3清零', time: '20:45–22:00',
          title: '📚【芝麻400题专题一】时域/卷积/傅氏挑刷 + 波哥强化第1–2章残余错题清零(46道🟡/🔴题)',
          desc: '挑刷手头《芝麻400题》薄弱专题，并把波哥强化第1章(15错题)与第2章(31错题)彻底清零标绿！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'bg_qh_01', label: '波哥强化第1章(50题收官)' },
            { subjectId: 'zhuanye', chapterId: 'bg_qh_02', label: '波哥强化第2章(49题收官)' }
          ],
          targetCount: 99, mode: 'green',
          offlineLabel: '《芝麻400题》专题一挑刷', offlineTarget: 1
        },
        {
          id: 'd17_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》思修第3–5章(中国精神/价值准则/道德规范，共70题)',
          desc: '思修选择题简单速度快，今日一鼓作气拿下第3–5章70题！',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100453', label: '思修·第3章(15题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100454', label: '思修·第4章(14题)' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100455', label: '思修·第5章(41题)' }
          ],
          targetCount: 70, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd17_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大小作文套卷限时仿写(30m) + 下午真题阅读精读2篇(50m)',
          desc: '直接用真题作文题目限时写提纲与首尾段。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2016', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd17_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《强化36讲》高数第16讲无穷级数(清剩余33未标) + 第18讲多元积分(清11未标+11错题)',
          desc: '攻克36讲高数最核心的第16讲无穷级数与第18讲多元积分！',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch46', label: '36讲高数第16讲·级数(57题收官)' },
            { subjectId: 'shu1', chapterId: 'ch48', label: '36讲高数第18讲·多元积分(29题收官)' }
          ],
          targetCount: 86, mode: 'green'
        }
      ]
    },
    {
      day: 18,
      date: '2026-11-17',
      label: 'Day 18 (11.17 周二)',
      week: '第三周 · 🎉《邂逅遗憾》1219题 & 《肖1000》1148题 & 南大20套 全部大满贯！',
      focus: '21-23真题二刷 + 南大20-23错题专场全绿 + 🎉邂逅1219题全书收官 + 🎉肖1000全书刷完！',
      tasks: [
        {
          id: 'd18_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '【真题二刷Day 5收官】21–23年真题残余错题清零 + 邂逅概率第5章大数定律(13题) & 第6章抽样分布(20题)',
          desc: '上午二刷21–23年真题确保66题100%全绿（09–23年15套真题二刷全部完成！）；随后拿下邂逅概率第5、6章共33题。',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2021', label: '21真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 's1_zt_2022', label: '22真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 's1_zt_2023', label: '23真题(二刷全绿)' },
            { subjectId: 'shu1', chapterId: 'xhy_gl_22', label: '邂逅概率第5章·大数定律(13题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gl_23', label: '邂逅概率第6章·抽样分布(20题)' }
          ],
          targetCount: 99, mode: 'green'
        },
        {
          id: 'd18_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【南大851全绿验收】2020–2023年真题 44道🟡/🔴/⚪非绿题专场清零（🎉南大20套229题100%全绿！）',
          desc: '专门用3小时把之前做过的南大20–23年真题里剩下的44道非绿题逐一重算标绿，实现南大851二十年真题100%全绿！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'nju_851_20', label: '南大20真题(19题全绿)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_21', label: '南大21真题(20题全绿)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_22', label: '南大22真题(22题全绿)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_23', label: '南大23真题(22题全绿)' }
          ],
          targetCount: 83, mode: 'green'
        },
        {
          id: 'd18_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》概率第7章参数估计(21题) + 第8章假设检验(22题)（🎉🎉《邂逅遗憾》全书25章1219题100%收官！）',
          desc: '里程碑时刻！今晚刷完最后43题，《邂逅遗憾》高数+线代+概率共1219题全部刷完！最后3天转入二刷错题验收！',
          chapters: [
            { subjectId: 'shu1', chapterId: 'xhy_gl_24', label: '邂逅概率第7章·参数估计(21题)' },
            { subjectId: 'shu1', chapterId: 'xhy_gl_25', label: '邂逅概率第8章·假设检验(22题)' }
          ],
          targetCount: 43, mode: 'green'
        },
        {
          id: 'd18_p_ev', cat: 'MajorSpecial', catLabel: '📚芝麻400题 & 波哥强化收官', time: '20:45–22:00',
          title: '📚【芝麻400题专题二】拉氏/Z变换/系统函数挑刷 + 波哥强化第3章离散时域(清18未标+5错题，🎉波哥强化1–7章全绿！)',
          desc: '把波哥强化第3章剩余23道非绿题全部清零，实现《波哥强化习题集》1–7章310题100%全绿！同时挑刷芝麻400题。',
          chapters: [{ subjectId: 'zhuanye', chapterId: 'bg_qh_03', label: '波哥强化第3章(33题收官)' }],
          targetCount: 33, mode: 'green',
          offlineLabel: '《芝麻400题》专题二挑刷', offlineTarget: 1
        },
        {
          id: 'd18_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '《27肖1000》思修第6章法治素养(63题)（🎉🎉《27肖1000题》全书52章1148题一轮全部刷完！）',
          desc: '今日刷完思修最后一章63题，肖1000全书1148题一轮全部刷完！后3天集中清零所有政治黄红错题！',
          chapters: [{ subjectId: 'politics', chapterId: 'pol_b25728-c100456', label: '思修·第6章法治(63题收官)' }],
          targetCount: 63, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd18_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大小作文套卷限时仿写(30m) + 下午真题阅读精读2篇(50m)',
          desc: '稳扎稳打推进阅读与生词本。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2016', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd18_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《李林880》线代未标重点章：第12章向量(39题) + 第13章方程组(48题) 选刷核心综合题',
          desc: '针对880线代尚未刷过的第12章向量与第13章方程组，精选核心大题与选填攻克标绿。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch169', label: '880线代第12章·向量(39题)' },
            { subjectId: 'shu1', chapterId: 'ch170', label: '880线代第13章·方程组(48题)' }
          ],
          targetCount: 45, mode: 'green'
        }
      ]
    },
    {
      day: 19,
      date: '2026-11-18',
      label: 'Day 19 (11.18 周三)',
      week: '第三周 · 全科二刷三刷错题清零大决战 (Day 1/3)',
      focus: '09-23数学真题三刷抽检 + 华科15-19错题二刷 + 邂逅高数错题二刷 + 波哥1-3章线上点绿',
      tasks: [
        {
          id: 'd19_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '【真题三刷验收(上)】2009–2016年8套数一真题 错题转盘无死角抽检 + 顽固题重算',
          desc: '打开网站「错题转盘」或逐套检查09–16年真题，任何之前卡壳过的题当场动笔再算一遍，确保100%秒出思路！',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2009', label: '09真题验收' },
            { subjectId: 'shu1', chapterId: 's1_zt_2012', label: '12真题验收' },
            { subjectId: 'shu1', chapterId: 's1_zt_2014', label: '14真题验收' },
            { subjectId: 'shu1', chapterId: 's1_zt_2016', label: '16真题验收' }
          ],
          targetCount: 92, mode: 'green'
        },
        {
          id: 'd19_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【华科824二刷清零(上)】2015–2019年5套华科真题 🟡/🔴错题专场重做全绿',
          desc: '下午3h整块把第一、二周刷过的华科15–19年真题里留下的所有模糊/不会题全部二刷变绿！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'hust_824_15', label: '华科15全绿' },
            { subjectId: 'zhuanye', chapterId: 'hust_824_16', label: '华科16全绿' },
            { subjectId: 'zhuanye', chapterId: 'hust_824_17', label: '华科17全绿' },
            { subjectId: 'zhuanye', chapterId: 'hust_824_18', label: '华科18全绿' },
            { subjectId: 'zhuanye', chapterId: 'hust_824_19', label: '华科19全绿' }
          ],
          targetCount: 97, mode: 'green'
        },
        {
          id: 'd19_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '【《邂逅遗憾》二刷(上)】高数第1–10章 残余🟡/🔴错题集中二刷清零',
          desc: '使用章节筛选功能（只看🟡模糊/🔴不会），把《邂逅遗憾》高数篇留下的错题逐个击破变绿！',
          chapters: [
            { subjectId: 'shu1', chapterId: 'xhy_gs_01', label: '邂逅第1章错题' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_02', label: '邂逅第2章错题' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_07', label: '邂逅第7章级数错题' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_09', label: '邂逅第9章线面错题' }
          ],
          targetCount: 389, mode: 'green'
        },
        {
          id: 'd19_p_ev', cat: 'MajorSpecial', catLabel: '📚芝麻400题 & 波哥1-3点绿', time: '20:45–22:00',
          title: '📚【芝麻400题专题三】+ 波哥1–3章讲义与基础习题集（线下已做部分线上过筛点绿）',
          desc: '挑刷《芝麻400题》专题三，并把线下早已做过的波哥1–3章讲义与习题集快速过筛点绿。',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'bg_jy_01', label: '波哥讲义第1章' },
            { subjectId: 'zhuanye', chapterId: 'bg_jy_02', label: '波哥讲义第2章' },
            { subjectId: 'zhuanye', chapterId: 'bg_jy_03', label: '波哥讲义第3章' }
          ],
          targetCount: 75, mode: 'green',
          offlineLabel: '《芝麻400题》专题三挑刷', offlineTarget: 1
        },
        {
          id: 'd19_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '【肖1000错题总清零(一)】马原全8章 🟡/🔴错题专场二刷全绿',
          desc: '肖1000一轮已刷完！今日把马原所有章节中的模糊/不会题全部二刷变绿！',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100403', label: '马原·第1章全绿' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100406', label: '马原·第4章政经全绿' }
          ],
          targetCount: 196, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd19_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大小作文高频模板默写(30m) + 下午真题阅读精读2篇(50m)',
          desc: '保持每日英语手感。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2015', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd19_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《李林880》概率未标重点章：第20–23章(大数定律/数理统计/参数估计/假设检验，共66题)',
          desc: '攻克880概率论最后4章数理统计与参数估计（ch177–ch180），实现880概率论全篇通关！',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch177', label: '880概率第20章(10题)' },
            { subjectId: 'shu1', chapterId: 'ch178', label: '880概率第21章(25题)' },
            { subjectId: 'shu1', chapterId: 'ch179', label: '880概率第22章(24题)' },
            { subjectId: 'shu1', chapterId: 'ch180', label: '880概率第23章(7题)' }
          ],
          targetCount: 50, mode: 'green'
        }
      ]
    },
    {
      day: 20,
      date: '2026-11-19',
      label: 'Day 20 (11.19 周四)',
      week: '第三周 · 全科二刷三刷错题清零大决战 (Day 2/3)',
      focus: '17-23数学真题三刷100%全绿 + 华科20-24错题二刷全绿 + 邂逅线代概率错题二刷 + 电路/期末题终极复盘',
      tasks: [
        {
          id: 'd20_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '【真题三刷终极验收(下)】2017–2023年7套数一真题 100%全绿验收（🎉09–23年342题100%全绿！）',
          desc: '逐套核验17–23年真题，把最后残余的任何一道非绿题彻底干掉，达成09–23年15套数一真题342道题100%全绿成就！',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2017', label: '17真题全绿' },
            { subjectId: 'shu1', chapterId: 's1_zt_2019', label: '19真题全绿' },
            { subjectId: 'shu1', chapterId: 's1_zt_2020', label: '20真题全绿' },
            { subjectId: 'shu1', chapterId: 's1_zt_2022', label: '22真题全绿' },
            { subjectId: 'shu1', chapterId: 's1_zt_2023', label: '23真题全绿' }
          ],
          targetCount: 113, mode: 'green'
        },
        {
          id: 'd20_p_pm', cat: 'major', catLabel: '专业课·下午3h整块', time: '14:00–17:00',
          title: '【华科824二刷清零(下)】2020–2024年5套华科真题 🟡/🔴错题专场重做（🎉华科近10年235题全绿！）',
          desc: '下午3h整块把华科20–24年5套压轴卷里的错题全部二刷变绿，实现华科近10年真题100%全绿！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'hust_824_20', label: '华科20全绿' },
            { subjectId: 'zhuanye', chapterId: 'hust_824_21', label: '华科21全绿' },
            { subjectId: 'zhuanye', chapterId: 'hust_824_22', label: '华科22全绿' },
            { subjectId: 'zhuanye', chapterId: 'hust_824_23', label: '华科23全绿' },
            { subjectId: 'zhuanye', chapterId: 'hust_824_24', label: '华科24全绿' }
          ],
          targetCount: 138, mode: 'green'
        },
        {
          id: 'd20_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '【《邂逅遗憾》二刷(下)】线代第1–7章 & 概率第1–8章 残余🟡/🔴错题集中二刷清零',
          desc: '把《邂逅遗憾》线代篇与概率篇留下的模糊/不会题全部二刷清零变绿！',
          chapters: [
            { subjectId: 'shu1', chapterId: 'xhy_xd_12', label: '邂逅线代矩阵' },
            { subjectId: 'shu1', chapterId: 'xhy_xd_16', label: '邂逅线代二次型' },
            { subjectId: 'shu1', chapterId: 'xhy_gl_20', label: '邂逅概率二维' },
            { subjectId: 'shu1', chapterId: 'xhy_gl_21', label: '邂逅概率数字特征' }
          ],
          targetCount: 192, mode: 'green'
        },
        {
          id: 'd20_p_ev', cat: 'MajorSpecial', catLabel: '⚡电路 & 🎓期末题二刷', time: '20:45–22:00',
          title: '⚡电路专题 + 🎓南大期末题 + 波哥4–9章 顽固红题终极二刷清零',
          desc: '专门复盘第二周做过的手头《电路专题》、《南大期末题》以及波哥第4–9章标记过的重点难题，确保考场遇到秒杀！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'bg_xt_09', label: '波哥习题集第9章·电路' },
            { subjectId: 'zhuanye', chapterId: 'bg_qh_07', label: '波哥强化第7章·电路' },
            { subjectId: 'zhuanye', chapterId: 'bg_xt_05', label: '波哥习题集第5章·拉氏' },
            { subjectId: 'zhuanye', chapterId: 'bg_xt_06', label: '波哥习题集第6章·Z变换' }
          ],
          targetCount: 218, mode: 'green',
          offlineLabel: '⚡电路专题+🎓南大期末题错题二刷', offlineTarget: 1, special: true
        },
        {
          id: 'd20_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '【肖1000错题总清零(二)】新思想 + 毛中特 🟡/🔴错题专场二刷全绿',
          desc: '把毛中特与新思想所有章节的模糊/不会题全部二刷变绿！',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100412', label: '毛中特·第2章' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100427', label: '新思想·第6章' }
          ],
          targetCount: 70, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd20_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大小作文终极个人模板定稿默写(30m) + 下午真题阅读精读2篇(50m)',
          desc: '形成属于你自己的考场大小作文定稿模板。',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2015', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd20_night', cat: 'night', catLabel: '居家深夜·1h25m', time: '22:50–00:15',
          title: '《李林880》高数重点未标章查漏补缺：第5章多元微分(68题) / 第8章无穷级数(71题) 选刷核心题',
          desc: '针对880高数多元微分与级数章节选刷30道核心综合题，强化计算熟练度。',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch162', label: '880高数第5章·多元微分' },
            { subjectId: 'shu1', chapterId: 'ch165', label: '880高数第8章·无穷级数' }
          ],
          targetCount: 45, mode: 'green'
        }
      ]
    },
    {
      day: 21,
      date: '2026-11-20',
      label: 'Day 21 (11.20 周五 · 结营大满贯)',
      week: '第三周结营 · 🔥专业课模拟卷(三) & 21天特训全科绿标总验收！',
      focus: '数学真题&邂逅&36讲&880结营总检 + 🔥专业课模拟卷(三)3h模考 + 肖1000全绿验收 + 后29天模拟卷交接',
      tasks: [
        {
          id: 'd21_m_am', cat: 'math', catLabel: '数学·上午3h+45m', time: '08:30–12:15',
          title: '🎉【数学21天结营总验收】09–23真题(15套) + 《邂逅遗憾》(25章) 绿标率终极总检',
          desc: '最后核查09–23年真题与《邂逅遗憾》全书绿标率，整理出后29天考前模拟卷冲刺阶段的「核心公式与易错陷阱清单」！',
          chapters: [
            { subjectId: 'shu1', chapterId: 's1_zt_2022', label: '22真题终检' },
            { subjectId: 'shu1', chapterId: 's1_zt_2023', label: '23真题终检' },
            { subjectId: 'shu1', chapterId: 'xhy_gs_03', label: '邂逅高数终检' },
            { subjectId: 'shu1', chapterId: 'xhy_xd_16', label: '邂逅线代终检' },
            { subjectId: 'shu1', chapterId: 'xhy_gl_24', label: '邂逅概率终检' }
          ],
          targetCount: 239, mode: 'green'
        },
        {
          id: 'd21_p_pm', cat: 'major', catLabel: '专业课·下午3h模考', time: '14:00–17:00',
          title: '🔥【专业课模拟卷(三) · 结营大考】3h全真模考（手头模拟卷3 或 网站刺猬哥/芝麻模拟卷三）',
          desc: '21天魔鬼特训最后一场下午3h全真模考！用满分状态检验南大851+华科824+电路专题+南大期末题全部打通后的硬实力！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'nju_851_mn_26_03', label: '26刺猬哥预测卷(三)' },
            { subjectId: 'zhuanye', chapterId: 'nju_851_zm_26_03', label: '26芝麻模拟卷(三)' }
          ],
          offlineLabel: '专业课模拟卷(三) 3h结营模考+订正', offlineTarget: 1, special: true
        },
        {
          id: 'd21_m_pm', cat: 'math', catLabel: '数学·晚间1h45m', time: '19:00–20:45',
          title: '《邂逅遗憾》&《36讲》&《李林880》全书终极复盘验收',
          desc: '用网站「数学错题转盘」随机抽检15–20道曾错题，确保道道秒杀！',
          chapters: [
            { subjectId: 'shu1', chapterId: 'ch57', label: '36讲线代终检' },
            { subjectId: 'shu1', chapterId: 'ch66', label: '36讲概率终检' },
            { subjectId: 'shu1', chapterId: 'ch159', label: '880高数终检' }
          ],
          targetCount: 110, mode: 'green'
        },
        {
          id: 'd21_p_ev', cat: 'MajorSpecial', catLabel: '专业课·结营总检', time: '20:45–22:00',
          title: '🎉【专业课21天结营总验收】南大851(20套)+华科824(10套)+波哥(1–9章)+⚡电路+🎓期末题 终极验收',
          desc: '用网站「专业课错题转盘」抽检15道核心大题，确认专业课进入135+冲刺状态！',
          chapters: [
            { subjectId: 'zhuanye', chapterId: 'nju_851_26', label: '南大851终检' },
            { subjectId: 'zhuanye', chapterId: 'hust_824_24', label: '华科824终检' },
            { subjectId: 'zhuanye', chapterId: 'bg_xt_09', label: '波哥电路专题终检' }
          ],
          targetCount: 77, mode: 'green',
          offlineLabel: '专业课21天特训结营总验收', offlineTarget: 1, special: true
        },
        {
          id: 'd21_pol', cat: 'politics', catLabel: '政治·65m+带背', time: '13:25 & 18:30',
          title: '🎉【肖1000结营总验收】史纲 + 思修 🟡/🔴错题专场二刷清零（肖1000全书1148题100%全绿！）',
          desc: '把史纲与思修残余错题全部清零，实现《27肖1000题》全书通关，无缝衔接肖八肖四！',
          chapters: [
            { subjectId: 'politics', chapterId: 'pol_b25728-c100445', label: '史纲·第6章全绿' },
            { subjectId: 'politics', chapterId: 'pol_b25728-c100456', label: '思修·第6章全绿' }
          ],
          targetCount: 105, mode: 'green',
          offlineLabel: '政治带背30m', offlineTarget: 1
        },
        {
          id: 'd21_eng', cat: 'english', catLabel: '英语·80m', time: '08:00 & 17:00',
          title: '早间大小作文考场全真模拟默写(30m) + 下午真题阅读与生词本总检(50m)',
          desc: '21天累计背默21次作文+42篇精读阅读，英语稳拿高分！',
          chapters: [{ subjectId: 'english', chapterId: 'en_zhenti_2025', label: '英语真题阅读/词本' }],
          offlineLabel: '作文默写+阅读2篇', offlineTarget: 2
        },
        {
          id: 'd21_night', cat: 'night', catLabel: '居家深夜·结营仪式', time: '22:50–00:15',
          title: '🏆【21天魔鬼特训结营汇报】导出最新完整备份 .json + 开启最后29天模拟卷冲刺计划！',
          desc: '导出21天结营备份发给助手，生成21天总战报，正式进入考前最后29天（数学模拟卷+1000题强化+专业课后4套模拟卷+肖八肖四）决胜阶段！',
          chapters: [{ subjectId: 'shu1', chapterId: 'ch30', label: '基础30讲全书绿标' }],
          targetCount: 29, mode: 'green',
          offlineLabel: '导出结营备份 .json 汇报', offlineTarget: 1
        }
      ]
    }
  ];

  // ===== 工具与状态管理引擎 =====
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

  function loadCampState() {
    try {
      var raw = window.localStorage.getItem(stateStorageKey());
      var parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object') {
        parsed.checked = parsed.checked || {};
        parsed.offline = parsed.offline || {};
        return parsed;
      }
    } catch (e) {}
    return {
      selectedDay: null,
      collapsed: false,
      checked: {},
      offline: {},
      goalsInitialized: false
    };
  }

  function saveCampState(state) {
    try {
      window.localStorage.setItem(stateStorageKey(), JSON.stringify(state));
    } catch (e) {}
  }

  // 根据本地日期自动推算今天是特训 Day 几 (2026-10-30 -> Day 0, 2026-10-31 -> Day 1 ... 2026-11-20 -> Day 21)
  function getTodayCampDay() {
    var now = new Date();
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

  // 自动将每日小目标默认值升级为特训标准（数学100、专业课50、政治55、考试日期2026-12-19）
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

  // 获取章节元数据与题目状态统计
  var _chapterMapCache = null;
  function getChapterMeta(subjectId, chapterId) {
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

  function getChapterLiveStats(subjectId, chapterId) {
    var meta = getChapterMeta(subjectId, chapterId);
    var stKey = getPrefix() + chapterId + '_' + meta.suffix + '_status';
    var obj = {};
    try {
      obj = JSON.parse(window.localStorage.getItem(stKey) || '{}') || {};
    } catch (e) {
      obj = {};
    }
    var green = 0, yellow = 0, red = 0, done = 0;
    var keys = Object.keys(obj);
    var maxIdx = meta.total;
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var idx = Number(k);
      if (meta.total > 0 && idx >= meta.total) continue;
      if (idx + 1 > maxIdx) maxIdx = idx + 1;
      var v = obj[k];
      if (v === 'proficient' || v === 'familiar') { green++; done++; }
      else if (v === 'vague' || v === 'rusty') { yellow++; done++; }
      else if (v === 'wrong') { red++; done++; }
    }
    var total = meta.total || maxIdx || 0;
    var unmarked = Math.max(0, total - done);
    return {
      total: total,
      done: done,
      green: green,
      yellow: yellow,
      red: red,
      unmarked: unmarked,
      name: meta.name
    };
  }

  function evaluateTaskProgress(task, state) {
    state = state || loadCampState();
    var manualChecked = !!state.checked[task.id];
    var chapters = Array.isArray(task.chapters) ? task.chapters : [];
    var tot = 0, done = 0, green = 0, yellow = 0, red = 0, unmarked = 0;
    chapters.forEach(function (c) {
      var st = getChapterLiveStats(c.subjectId, c.chapterId);
      tot += st.total;
      done += st.done;
      green += st.green;
      yellow += st.yellow;
      red += st.red;
      unmarked += st.unmarked;
    });

    var offlineTarget = Number(task.offlineTarget) || 0;
    var offlineDone = Math.min(offlineTarget, Math.max(0, Number(state.offline[task.id]) || 0));

    var mode = task.mode || 'green';
    var currentVal = mode === 'done' ? done : green;
    var targetVal = Number(task.targetCount) || tot || 0;

    var onlinePct = targetVal > 0 ? Math.min(100, Math.round((currentVal / targetVal) * 100)) : 0;
    var offlinePct = offlineTarget > 0 ? Math.min(100, Math.round((offlineDone / offlineTarget) * 100)) : 0;

    var pct = 0;
    if (targetVal > 0 && offlineTarget > 0) {
      pct = Math.round(onlinePct * 0.7 + offlinePct * 0.3);
    } else if (targetVal > 0) {
      pct = onlinePct;
    } else if (offlineTarget > 0) {
      pct = offlinePct;
    }

    var autoDone = false;
    if (targetVal > 0 && offlineTarget > 0) {
      autoDone = currentVal >= targetVal && offlineDone >= offlineTarget;
    } else if (targetVal > 0) {
      autoDone = currentVal >= targetVal;
    } else if (offlineTarget > 0) {
      autoDone = offlineDone >= offlineTarget;
    }

    var isDone = manualChecked || autoDone;
    if (isDone) pct = 100;

    return {
      total: tot,
      done: done,
      green: green,
      yellow: yellow,
      red: red,
      unmarked: unmarked,
      currentVal: currentVal,
      targetVal: targetVal,
      mode: mode,
      offlineDone: offlineDone,
      offlineTarget: offlineTarget,
      pct: pct,
      isDone: isDone,
      manualChecked: manualChecked
    };
  }

  function evaluateDayProgress(dayObj, state) {
    state = state || loadCampState();
    var tasks = (dayObj && dayObj.tasks) || [];
    var doneTasks = 0;
    var sumPct = 0;
    var totalGreen = 0;
    var totalTarget = 0;
    tasks.forEach(function (t) {
      var ev = evaluateTaskProgress(t, state);
      if (ev.isDone) doneTasks += 1;
      sumPct += ev.pct;
      totalGreen += ev.currentVal;
      totalTarget += ev.targetVal;
    });
    var avgPct = tasks.length > 0 ? Math.round(sumPct / tasks.length) : 0;
    return {
      doneTasks: doneTasks,
      totalTasks: tasks.length,
      pct: avgPct,
      totalGreen: totalGreen,
      totalTarget: totalTarget
    };
  }

  // ===== 实时作息时段检测与章节直达 =====
  function parseTimeMinutes(hhmm) {
    var parts = String(hhmm || '00:00').split(':');
    return (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
  }

  function getCurrentSlotInfo() {
    var now = new Date();
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

  // ===== 1. 增强顶部 #dailyGoalButton (加入特训 Day 徽章与清单进度环) =====
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
          '<span id="dailyGoalCampText">0/7项</span>' +
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
    if (txtEl) txtEl.textContent = dayProg.doneTasks + '/' + dayProg.totalTasks + '项';

    if (!btn._camp21Bound) {
      btn._camp21Bound = true;
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        openCampModal('today');
      }, true);
    }
  }

  // ===== 2. 渲染单个任务卡片 HTML =====
  function buildTaskCardHtml(task, state) {
    var ev = evaluateTaskProgress(task, state);
    var cardCls = 'camp21-task-card' + (ev.isDone ? ' is-done' : '') + (task.special ? ' is-highlight-special' : '');
    var chapters = Array.isArray(task.chapters) ? task.chapters : [];

    var statsHtml = '';
    if (ev.targetVal > 0 || chapters.length > 0) {
      var modeText = ev.mode === 'done' ? ('已刷 ' + ev.currentVal + '/' + ev.targetVal + ' 题') : ('🟢已绿 ' + ev.currentVal + '/' + ev.targetVal + ' 题');
      statsHtml =
        '<div class="camp21-task-prog-section">' +
          '<div class="camp21-task-stats-row">' +
            '<span><strong>' + modeText + '</strong> (' + ev.pct + '%)</span>' +
            '<span class="camp21-stat-pills">' +
              '<span class="st-green">🟢' + ev.green + '</span>' +
              '<span class="st-yellow">🟡' + ev.yellow + '</span>' +
              '<span class="st-red">🔴' + ev.red + '</span>' +
              '<span class="st-unmarked">⚪' + ev.unmarked + '</span>' +
            '</span>' +
          '</div>' +
          '<div class="camp21-mini-track"><div class="camp21-mini-fill" style="width:' + ev.pct + '%"></div></div>' +
        '</div>';
    }

    var chipsHtml = chapters.map(function (c) {
      var st = getChapterLiveStats(c.subjectId, c.chapterId);
      var subStat = st.total > 0 ? (' (' + st.green + '/' + st.total + '🟢)') : '';
      return '<button type="button" class="camp21-jump-chip" data-action="jump" data-subject="' + escapeHtml(c.subjectId) + '" data-chapter="' + escapeHtml(c.chapterId) + '">' +
        '🚀 ' + escapeHtml(c.label) + escapeHtml(subStat) +
      '</button>';
    }).join('');

    var stepperHtml = '';
    if (ev.offlineTarget > 0) {
      stepperHtml =
        '<div class="camp21-stepper" title="记录纸质/线下任务进度">' +
          '<span class="camp21-step-val">' + escapeHtml(task.offlineLabel || '线下进度') + ': ' + ev.offlineDone + '/' + ev.offlineTarget + '</span>' +
          '<button type="button" class="camp21-step-btn" data-action="step-dec" data-task="' + escapeHtml(task.id) + '">-</button>' +
          '<button type="button" class="camp21-step-btn" data-action="step-inc" data-task="' + escapeHtml(task.id) + '">+</button>' +
        '</div>';
    }

    return (
      '<div class="' + cardCls + '" data-task-id="' + escapeHtml(task.id) + '">' +
        '<div class="camp21-task-top">' +
          '<label class="camp21-task-check-wrap">' +
            '<input type="checkbox" class="camp21-task-checkbox" data-action="toggle-check" data-task="' + escapeHtml(task.id) + '" ' + (ev.isDone ? 'checked' : '') + '>' +
            '<div class="camp21-task-title-box">' +
              '<div class="camp21-task-kicker-row">' +
                '<span class="camp21-cat-badge cat-' + escapeHtml(task.cat) + '">' + escapeHtml(task.catLabel) + '</span>' +
                '<span class="camp21-time-tag">⏰ ' + escapeHtml(task.time) + '</span>' +
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
              '<span>今日清单完成 <strong>' + dayProg.doneTasks + '/' + dayProg.totalTasks + ' 项</strong> · 关联题库 🟢' + dayProg.totalGreen + '/' + dayProg.totalTarget + '</span>' +
              '<strong>' + dayProg.pct + '%</strong>' +
            '</div>' +
            '<div class="camp21-wb-progress-track">' +
              '<div class="camp21-wb-progress-fill" style="width:' + dayProg.pct + '%"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="camp21-wb-actions">' +
          '<button type="button" class="camp21-btn primary" data-action="open-modal" data-tab="all">🗓️ 21天全景表</button>' +
          '<button type="button" class="camp21-btn" data-action="open-modal" data-tab="schedule">⏰ 13.5h作息表</button>' +
          '<button type="button" class="camp21-btn report-btn" data-action="copy-report">📊 复制今日战报</button>' +
          '<button type="button" class="camp21-btn" data-action="open-settings">⚙️ 目标设置</button>' +
          '<button type="button" class="camp21-btn" data-action="toggle-collapse">' + (state.collapsed ? '展开清单 ▼' : '收起 ▲') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="camp21-wb-body">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">' +
          '<span class="camp21-now-slot-pill">' + escapeHtml(slotText) + '</span>' +
          '<span style="font-size:11.5px;color:#64748b;">💡 提示：刷题标🟢后进度条实时自动增长；纸质任务（⚡电路专题 / 🎓南大期末题 / 英语作文）可直接点「+」或勾选完成。</span>' +
        '</div>' +
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
          '<span style="font-size:13px;font-weight:800;color:#ea580c;">今日进度：' + dayProg.doneTasks + '/' + dayProg.totalTasks + ' 项 (' + dayProg.pct + '%)</span>' +
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
          '<button type="button" class="camp21-tab-btn" data-action="switch-tab" data-tab="today">📋 今日特训清单 & 实时进度</button>' +
          '<button type="button" class="camp21-tab-btn" data-action="switch-tab" data-tab="all">🗓️ 21天全景作战大表 (含⚡电路&🎓期末题)</button>' +
          '<button type="button" class="camp21-tab-btn" data-action="switch-tab" data-tab="schedule">⏰ 13.5h+ 铁血作息表 (含午晚餐)</button>' +
          '<button type="button" class="camp21-tab-btn" data-action="open-settings">⚙️ 基础每日目标题量 & 考研日期设置</button>' +
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
            '<span class="camp21-fire-pill">已完成 ' + dayProg.doneTasks + '/' + dayProg.totalTasks + ' 项 (' + dayProg.pct + '%)</span>' +
            '<button type="button" class="camp21-btn report-btn" data-action="copy-report">📊 复制今日战报</button>' +
          '</div>' +
        '</div>' +
        '<div class="camp21-tasks-grid">' + cardsHtml + '</div>';
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
            '<span style="font-size:11px;color:#ea580c;font-weight:700;">进度 ' + dp.pct + '% (' + dp.doneTasks + '/' + dp.totalTasks + ')</span><br>' +
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
              '<th>天数 / 进度</th>' +
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
    var lines = [
      '【🔥 21天魔鬼特训 · ' + dayObj.label + ' 每日汇报】',
      '📊 今日清单完成度：' + dayProg.doneTasks + '/' + dayProg.totalTasks + ' 项 (' + dayProg.pct + '%) | 关联章节累计标绿：🟢 ' + dayProg.totalGreen + '/' + dayProg.totalTarget + ' 题'
    ];
    dayObj.tasks.forEach(function (t) {
      var ev = evaluateTaskProgress(t, state);
      var mark = ev.isDone ? '✅' : '⏳';
      var statStr = ev.targetVal > 0 ? (' [🟢' + ev.green + ' 🟡' + ev.yellow + ' 🔴' + ev.red + ' ⚪' + ev.unmarked + ']') : '';
      var offStr = ev.offlineTarget > 0 ? (' [线下:' + ev.offlineDone + '/' + ev.offlineTarget + ']') : '';
      lines.push(mark + ' ' + t.catLabel + '：' + t.title + statStr + offStr);
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
        state.selectedDay = Number(btn.getAttribute('data-day')) || 1;
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
        if (target.checked) {
          state.checked[tId] = true;
        } else {
          delete state.checked[tId];
        }
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
      window.StudyAnalytics.recordStatus = function () {
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
    getStateKey: stateStorageKey
  };
})();
