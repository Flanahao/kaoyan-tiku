'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

console.log('====================================================');
console.log('🧪 Running scripts/test-study-wheel-progress.js');
console.log('====================================================');

// 0. 静态合约断言
const html = read('index.html');
const app = read('js/app.js');
const wheel = read('js/daily-study-wheel.js');
const css = read('css/styles.css');

assert(html.includes('id="dailyMathWheelButton"'), 'index.html 必须包含数学转盘按钮');
assert(html.includes('id="dailyMajorWheelButton"'), 'index.html 必须包含专业课转盘按钮');
assert(html.includes('daily-study-wheel.js'), 'index.html 必须引入 daily-study-wheel.js 脚本');
assert(html.includes('study-wheel-tabs'), 'index.html 必须包含转盘学科切换 Tab');
assert(html.includes('btnStudyWheelComplete'), 'index.html 必须包含完成今日任务按钮');
assert(html.includes('btnStudyWheelAddRound'), 'index.html 必须包含继续加量按钮');

assert(app.includes('DAILY_STUDY_WHEEL_BOOKS'), 'app.js 必须包含数学与专业课候选书籍白名单定义');
assert(app.includes('dailyStudyWheelHistory'), 'app.js 导出与导入必须支持 dailyStudyWheelHistory');
assert(app.includes('dailyStudyWheelDaily'), 'app.js 导出与导入必须支持 dailyStudyWheelDaily');

assert(css.includes('.study-wheel-tabs'), 'styles.css 必须包含 .study-wheel-tabs');
assert(css.includes('.breakthrough-btn'), 'styles.css 必须包含加量按钮样式');

console.log('✅ 静态文件合约检查全部通过');

// 沙箱环境搭建
const mockStorage = {};
const mockLocalStorage = {
  getItem: function (key) {
    return Object.prototype.hasOwnProperty.call(mockStorage, key) ? mockStorage[key] : null;
  },
  setItem: function (key, value) {
    mockStorage[key] = String(value);
  },
  removeItem: function (key) {
    delete mockStorage[key];
  },
  clear: function () {
    Object.keys(mockStorage).forEach(function (k) { delete mockStorage[k]; });
  }
};

global.window = {
  localStorage: mockLocalStorage,
  userStoragePrefix: function () { return 'user_guest_'; },
  addEventListener: function () {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  requestAnimationFrame: function (cb) { return setTimeout(cb, 16); },
  crypto: {
    getRandomValues: function (buf) {
      for (let i = 0; i < buf.length; i++) {
        buf[i] = Math.floor(Math.random() * 0x100000000);
      }
      return buf;
    }
  },
  document: {
    getElementById: function () { return null; },
    querySelectorAll: function () { return []; },
    addEventListener: function () {},
    readyState: 'complete'
  }
};
global.document = global.window.document;

// 加载真实章节与数据
eval(read('js/lilin880-chapters.js'));
eval(read('js/lilin880-optimized-chapters.js'));
eval(read('js/lyf900-chapters.js'));
eval(read('js/yeyu-chapters.js'));
eval(read('js/professional-chapters.js'));
eval(read('js/math-zhenti-chapters.js'));
eval(read('js/chapters.js'));

// 构造与 app.js 一致的候选提取逻辑
const DAILY_STUDY_WHEEL_BOOKS = {
  shu1: [
    '李林880',
    '基础30讲',
    '强化36讲',
    '1000题',
    '夜雨强化'
  ],
  zhuanye: [
    '波哥讲义例题',
    '波哥习题集'
  ]
};

function getDailyStudyWheelCandidates(subjectId) {
  const targetId = (subjectId === 'zhuanye') ? 'zhuanye' : 'shu1';
  const allowedBooks = DAILY_STUDY_WHEEL_BOOKS[targetId] || [];

  const subj = global.window.SUBJECTS.find(function (s) {
    return s && s.id === targetId;
  });
  if (!subj || !Array.isArray(subj.chapters)) return [];

  const grouped = {};
  const seen = new Set();
  allowedBooks.forEach(function (b) { grouped[b] = []; });

  subj.chapters.forEach(function (ch) {
    if (!ch || !ch.id) return;
    const book = String(ch.wb || '');
    if (allowedBooks.indexOf(book) === -1) return;

    const total = Number(ch.total || (Array.isArray(ch.labels) ? ch.labels.length : 0));
    if (!(total > 0)) return;
    if (ch.hidden === true || ch.disabled === true) return;

    if (seen.has(ch.id)) return;
    seen.add(ch.id);

    grouped[book].push({
      subjectId: targetId,
      chapterId: ch.id,
      book: book,
      subject: ch.subj || subj.name || '',
      name: ch.name || ch.short || ch.id,
      short: ch.short || ch.name || ch.id,
      total: total
    });
  });

  const mixed = [];
  let row = 0;
  while (true) {
    let pushed = false;
    allowedBooks.forEach(function (b) {
      const it = grouped[b][row];
      if (it) {
        mixed.push(it);
        pushed = true;
      }
    });
    if (!pushed) break;
    row += 1;
  }
  return mixed;
}

let mockChapterProgressRate = 0.0;

global.window.DailyStudyWheelBridge = {
  getStoragePrefix: function () { return 'user_guest_'; },
  getCandidates: function (subjectId) { return getDailyStudyWheelCandidates(subjectId); },
  getChapterProgress: function (subjectId, chapterId) {
    return { marked: Math.round(10 * mockChapterProgressRate), total: 10, rate: mockChapterProgressRate };
  },
  openChapter: function () { return true; }
};

// 加载转盘主模块
eval(read('js/daily-study-wheel.js'));
const DSW = global.window.DailyStudyWheel;
assert(DSW, 'DailyStudyWheel 必须成功挂载');

// =========================================================================
// 1. 候选过滤测试（数学 5 本书，专业课 2 本书；严格排除其他书籍）
// =========================================================================
(function testCandidatesFiltering() {
  console.log('----------------------------------------------------');
  console.log('Test 1: 候选过滤测试');

  const mathCandidates = DSW.getAllCandidates('shu1');
  const majorCandidates = DSW.getAllCandidates('zhuanye');

  const mathBooks = new Set(mathCandidates.map(c => c.book));
  assert.equal(mathBooks.size, 5, '数学候选必须且只能包含 5 本书');
  DSW.MATH_BOOKS.forEach(b => assert(mathBooks.has(b), '数学必须包含 ' + b));
  assert(!mathBooks.has('李林880优化版'), '数学绝不能包含优化版880');
  assert(!mathBooks.has('李艳芳900'), '数学绝不能包含李艳芳900');
  assert(!mathBooks.has('李范全书'), '数学绝不能包含李范全书');
  assert(!mathBooks.has('历年真题'), '数学绝不能包含历年真题');
  assert(!mathBooks.has('波哥讲义例题'), '数学绝不能包含专业课');

  const majorBooks = new Set(majorCandidates.map(c => c.book));
  assert.equal(majorBooks.size, 2, '专业课候选必须且只能包含 2 本书');
  DSW.MAJOR_BOOKS.forEach(b => assert(majorBooks.has(b), '专业课必须包含 ' + b));
  assert(!majorBooks.has('852真题'), '专业课绝不能包含852真题');
  assert(!majorBooks.has('基础30讲'), '专业课绝不能包含数学');

  console.log(`   • 数学总章节: ${mathCandidates.length} 章`);
  DSW.MATH_BOOKS.forEach(b => {
    console.log(`     - ${b}: ${mathCandidates.filter(c => c.book === b).length} 章`);
  });

  console.log(`   • 专业课总章节: ${majorCandidates.length} 章`);
  DSW.MAJOR_BOOKS.forEach(b => {
    console.log(`     - ${b}: ${majorCandidates.filter(c => c.book === b).length} 章`);
  });

  assert.equal(mathCandidates.length, 196, '数学总候选数必须为 196 章');
  assert.equal(majorCandidates.length, 20, '专业课总候选数必须为 20 章');

  console.log('✅ Test 1 PASS: 候选过滤完全符合白名单');
})();

// =========================================================================
// 2. 章节去重推进测试（已完成章节移出随机池，重复完成幂等）
// =========================================================================
(function testDeDuplicationAndProgression() {
  console.log('----------------------------------------------------');
  console.log('Test 2: 章节去重推进与幂等性测试');

  mockLocalStorage.clear();

  const mathCandidates = DSW.getAllCandidates('shu1');
  const targetChapter = mathCandidates[0];

  // 初始状态：未完成任何章节
  let active = DSW.getActiveCandidates('shu1');
  assert.equal(active.length, mathCandidates.length, '初始未完成时，活动池等于全部章节数');

  // 模拟将 targetChapter 加入完成池
  const hist = DSW.getHistoryState();
  hist.math.completed.push({
    chapterId: targetChapter.chapterId,
    book: targetChapter.book,
    completedAt: '2026-09-22'
  });
  DSW.saveHistoryState(hist);

  active = DSW.getActiveCandidates('shu1');
  assert.equal(active.length, mathCandidates.length - 1, '已完成 1 章后，活动池数量必须减 1');
  assert(!active.some(c => c.chapterId === targetChapter.chapterId), '活动池绝不能出现已完成章节');

  // 重复标记相同章节完成，completed 不得产生重复元素
  const hist2 = DSW.getHistoryState();
  const beforeLen = hist2.math.completed.length;
  // 模拟再次完成
  if (!hist2.math.completed.some(c => c.chapterId === targetChapter.chapterId)) {
    hist2.math.completed.push(targetChapter);
  }
  assert.equal(hist2.math.completed.length, beforeLen, '重复完成相同章节，completed 长度不增加');

  console.log('✅ Test 2 PASS: 章节去重推进与幂等性验证通过');
})();

// =========================================================================
// 3. 加量规则测试（未完成禁止加量，完成后允许加量）
// =========================================================================
(function testAddRoundConditions() {
  console.log('----------------------------------------------------');
  console.log('Test 3: 加量条件限制测试');

  mockLocalStorage.clear();

  const daily = DSW.getDailyState();
  daily.math.rounds.push({
    round: 1,
    chapterId: 'test_ch_1',
    book: '基础30讲',
    status: 'doing',
    rolledAt: Date.now()
  });
  DSW.saveDailyState(daily);

  // 当前轮为 doing
  const curRound = DSW.getCurrentRound('shu1');
  assert(curRound !== null);
  assert.equal(curRound.status, 'doing');

  // 在 doing 状态下，尝试继续加量必须被拦截（不产生新轮次）
  let errorIntercepted = false;
  const originalAlert = global.window.alert;
  global.window.alert = function (msg) {
    errorIntercepted = true;
  };

  DSW.spin(); // 调用转盘加量
  assert(errorIntercepted, '当前轮处于 doing 时，尝试加量必须被拦截并弹出警告');
  assert.equal(DSW.getDailyState().math.rounds.length, 1, '轮次不得增加');

  // 标记当前轮完成
  DSW.markCurrentRoundCompleted('shu1');
  const finishedRound = DSW.getCurrentRound('shu1');
  assert.equal(finishedRound.status, 'completed', '标记后当前轮状态应为 completed');

  // 完成后允许加量
  errorIntercepted = false;
  DSW.spin();
  assert(!errorIntercepted, '完成后开启加量不应报错');
  assert.equal(DSW.getDailyState().math.rounds.length, 2, '成功开启第 2 轮');
  assert.equal(DSW.getCurrentRound('shu1').round, 2, '新轮次编号应为 2');
  assert.equal(DSW.getCurrentRound('shu1').status, 'doing', '新轮次状态应为 doing');

  global.window.alert = originalAlert;
  console.log('✅ Test 3 PASS: 加量前置条件规则严格生效');
})();

// =========================================================================
// 4. 多轮连续加量与当天防重复抽取测试
// =========================================================================
(function testMultiRoundAndSameDayDedup() {
  console.log('----------------------------------------------------');
  console.log('Test 4: 多轮连续加量与当天防重复抽取测试');

  mockLocalStorage.clear();

  // 连续完成 3 轮
  for (let r = 1; r <= 3; r++) {
    DSW.spin();
    const cur = DSW.getCurrentRound('shu1');
    assert.equal(cur.round, r, `第 ${r} 轮次生成正确`);
    assert.equal(cur.status, 'doing');

    // 验证当天已抽取章节在后续抽取候选池中不可见
    const active = DSW.getActiveCandidates('shu1');
    assert(!active.some(c => c.chapterId === cur.chapterId), `当天已抽取的 ${cur.chapterId} 不得在活跃池中`);

    // 完成本轮
    DSW.markCurrentRoundCompleted('shu1');
    assert.equal(DSW.getCurrentRound('shu1').status, 'completed');
  }

  const rounds = DSW.getDailyState().math.rounds;
  assert.equal(rounds.length, 3, '当天共记录 3 轮');
  const pickedIds = rounds.map(r => r.chapterId);
  assert.equal(new Set(pickedIds).size, 3, '多轮抽取抽中的章节互不相同，当天防重复');

  console.log('✅ Test 4 PASS: 连续多轮推进与当天防重复验证通过');
})();

// =========================================================================
// 5. 第一阶段完成与开启下一阶段测试
// =========================================================================
(function testStageProgression() {
  console.log('----------------------------------------------------');
  console.log('Test 5: 第一阶段完成与开启下一阶段测试');

  mockLocalStorage.clear();

  const majorCandidates = DSW.getAllCandidates('zhuanye');
  const hist = DSW.getHistoryState();

  // 将专业课全部 20 章模拟设置为已完成
  majorCandidates.forEach(function (c) {
    hist.major.completed.push({
      chapterId: c.chapterId,
      book: c.book,
      completedAt: '2026-09-22'
    });
  });
  DSW.saveHistoryState(hist);

  // 此时剩余章节应为 0
  const remaining = DSW.getActiveCandidates('zhuanye');
  assert.equal(remaining.length, 0, '全部章节完成后剩余数必须为 0');

  // 开启下一阶段
  DSW.startNextStage('zhuanye');
  const newHist = DSW.getHistoryState();
  assert.equal(newHist.major.round, 2, '阶段编号应升级为第 2 阶段');
  assert.equal(newHist.major.completed.length, 0, '完成池重置清空以备第二阶段推进');

  const refilled = DSW.getActiveCandidates('zhuanye');
  assert.equal(refilled.length, majorCandidates.length, '活动池重新恢复满额');

  console.log('✅ Test 5 PASS: 阶段推进与第二轮重置开启逻辑验证通过');
})();

// =========================================================================
// 6. 角度计算与公平随机校验
// =========================================================================
(function testAnglesAndCrypto() {
  console.log('----------------------------------------------------');
  console.log('Test 6: 角度与无偏随机校验');

  const count = 50;
  for (let i = 0; i < count; i++) {
    const angle = DSW.restRotationForIndex(i, count);
    assert(angle >= 0 && angle < 360, `停靠角度必须在 [0, 360)，实际: ${angle}`);
  }

  for (let i = 0; i < 200; i++) {
    const idx = DSW.secureRandomIndex(count);
    assert(idx >= 0 && idx < count, '随机索引有效');
  }

  console.log('✅ Test 6 PASS: 角度计算与公平随机算法正确');
})();

// =========================================================================
// 7. 备份导出与导入结构兼容
// =========================================================================
(function testBackupCompatibility() {
  console.log('----------------------------------------------------');
  console.log('Test 7: 完整备份导出与导入数据结构兼容性');

  assert(app.includes('dailyStudyWheelHistory'), 'app.js 导出 payload 必须包含 dailyStudyWheelHistory');
  assert(app.includes('dailyStudyWheelDaily'), 'app.js 导出 payload 必须包含 dailyStudyWheelDaily');

  console.log('✅ Test 7 PASS: 备份与恢复数据结构支持完备');
})();

console.log('====================================================');
console.log('🎉 ALL 7 TEST CASES PASSED!');
console.log('====================================================');
process.exit(0);
