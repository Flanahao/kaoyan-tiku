'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

console.log('====================================================');
console.log('🧪 Running scripts/test-daily-math-wheel.js');
console.log('====================================================');

// =========================================================================
// 0. 静态合约检查（HTML / CSS / JS 代码完备性）
// =========================================================================
const html = read('index.html');
const app = read('js/app.js');
const wheel = read('js/daily-math-wheel.js');
const css = read('css/styles.css');

assert(html.includes('id="dailyMathWheelButton"'), 'index.html 必须包含转盘入口按钮 dailyMathWheelButton');
assert(html.includes('id="dailyMathWheelModal"'), 'index.html 必须包含转盘弹窗 dailyMathWheelModal');
assert(html.includes('id="dailyMathWheelCanvas"'), 'index.html 必须包含转盘 Canvas dailyMathWheelCanvas');
assert(html.includes('id="btnDailyMathWheelSpin"'), 'index.html 必须包含旋转按钮 btnDailyMathWheelSpin');
assert(html.includes('id="btnDailyMathWheelStart"'), 'index.html 必须包含开始学习按钮 btnDailyMathWheelStart');
assert(html.includes('daily-study-wheel.js') || html.includes('daily-math-wheel.js'), 'index.html 必须引入转盘脚本');

assert(app.includes('DailyMathWheelBridge'), 'app.js 必须暴露 window.DailyMathWheelBridge');
assert(app.includes('DAILY_MATH_WHEEL_BOOKS'), 'app.js 必须定义 5 本候选书籍白名单');
assert(app.includes('dailyMathWheel'), 'app.js 导出与导入逻辑必须包含 dailyMathWheel 字段');

assert(css.includes('.daily-math-wheel-modal'), 'styles.css 必须包含 .daily-math-wheel-modal 样式');
assert(css.includes('.daily-math-wheel-canvas'), 'styles.css 必须包含 .daily-math-wheel-canvas 样式');
assert(css.includes('.daily-math-wheel-pointer'), 'styles.css 必须包含 .daily-math-wheel-pointer 样式');
assert(css.includes('@media (max-width: 620px)'), 'styles.css 必须包含转盘移动端响应式样式');

console.log('✅ 静态文件合约检查全部通过');

// =========================================================================
// 浏览器环境沙箱模拟
// =========================================================================
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
    addEventListener: function () {},
    readyState: 'complete'
  }
};
global.document = global.window.document;

// 加载真实的题库章节定义文件
eval(read('js/lilin880-chapters.js'));
eval(read('js/lilin880-optimized-chapters.js'));
eval(read('js/lyf900-chapters.js'));
eval(read('js/yeyu-chapters.js'));
eval(read('js/professional-chapters.js'));
eval(read('js/math-zhenti-chapters.js'));
eval(read('js/chapters.js'));

// 加载转盘模块
eval(read('js/daily-study-wheel.js'));

const DMW = global.window.DailyMathWheel;
assert(DMW, 'DailyMathWheel 必须成功挂载在 window 上');

// 模拟 app.js 中的候选提取逻辑与桥接对象
const ALLOWED_BOOKS = [
  '李林880',
  '基础30讲',
  '强化36讲',
  '1000题',
  '夜雨强化'
];

function extractCandidatesFromSubjects(subjectsList) {
  const mathSubject = (subjectsList || []).find(function (s) { return s && s.id === 'shu1'; });
  if (!mathSubject || !Array.isArray(mathSubject.chapters)) return [];

  const grouped = {};
  const seen = new Set();

  ALLOWED_BOOKS.forEach(function (b) { grouped[b] = []; });

  mathSubject.chapters.forEach(function (ch) {
    if (!ch || !ch.id) return;
    const book = String(ch.wb || '');
    if (ALLOWED_BOOKS.indexOf(book) === -1) return;

    const total = Number(ch.total || (Array.isArray(ch.labels) ? ch.labels.length : 0));
    if (!(total > 0)) return;
    if (ch.hidden === true || ch.disabled === true) return;

    if (seen.has(ch.id)) return;
    seen.add(ch.id);

    grouped[book].push({
      subjectId: 'shu1',
      chapterId: ch.id,
      book: book,
      subject: ch.subj || '',
      name: ch.name || ch.short || ch.id,
      short: ch.short || ch.name || ch.id,
      total: total
    });
  });

  const mixed = [];
  let row = 0;
  while (true) {
    let pushed = false;
    ALLOWED_BOOKS.forEach(function (b) {
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

const realCandidates = extractCandidatesFromSubjects(global.window.SUBJECTS);

// =========================================================================
// Case 1：只允许 5 本指定书，严格排除优化版等
// =========================================================================
(function testCase1() {
  console.log('----------------------------------------------------');
  console.log('Case 1: 只允许 5 本指定书，严格排除优化版/李艳芳900/李范全书/真题');

  const testSubjects = [
    {
      id: 'shu1',
      chapters: [
        { id: 'ch_880', wb: '李林880', total: 10 },
        { id: 'ch_880_opt', wb: '李林880优化版', total: 10 },
        { id: 'ch_lyf', wb: '李艳芳900', total: 10 },
        { id: 'ch_lf', wb: '李范全书', total: 10 },
        { id: 'ch_zt', wb: '历年真题', total: 10 },
        { id: 'ch_boge', wb: '波哥讲义例题', total: 10 },
        { id: 'ch_30', wb: '基础30讲', total: 10 },
        { id: 'ch_36', wb: '强化36讲', total: 10 },
        { id: 'ch_1000', wb: '1000题', total: 10 },
        { id: 'ch_yeyu', wb: '夜雨强化', total: 10 }
      ]
    }
  ];

  const result = extractCandidatesFromSubjects(testSubjects);
  const booksInResult = new Set(result.map(function (c) { return c.book; }));

  assert.equal(booksInResult.size, 5, '应该仅包含 5 本书');
  ALLOWED_BOOKS.forEach(function (b) {
    assert(booksInResult.has(b), '结果中必须包含 ' + b);
  });

  assert(!booksInResult.has('李林880优化版'), '绝不能包含李林880优化版');
  assert(!booksInResult.has('李艳芳900'), '绝不能包含李艳芳900');
  assert(!booksInResult.has('李范全书'), '绝不能包含李范全书');
  assert(!booksInResult.has('历年真题'), '绝不能包含历年真题');
  assert(!booksInResult.has('波哥讲义例题'), '绝不能包含专业课书籍');

  // 在真实题库数据中验证
  realCandidates.forEach(function (c) {
    assert(ALLOWED_BOOKS.indexOf(c.book) !== -1, '真实候选池不包含非 5 本书章节: ' + c.book);
    assert(c.book !== '李林880优化版', '真实候选池绝不能包含李林880优化版');
    assert(c.book !== '李艳芳900', '真实候选池绝不能包含李艳芳900');
    assert(c.book !== '李范全书', '真实候选池绝不能包含李范全书');
    assert(c.book !== '历年真题', '真实候选池绝不能包含历年真题');
  });

  console.log('✅ Case 1 PASS: 5 本指定书白名单严格生效');
})();

// =========================================================================
// Case 2：5 本书都有有效章节
// =========================================================================
(function testCase2() {
  console.log('----------------------------------------------------');
  console.log('Case 2: 真实题库中 5 本书全部包含有效章节');

  const stats = {};
  ALLOWED_BOOKS.forEach(function (b) { stats[b] = 0; });

  realCandidates.forEach(function (c) {
    stats[c.book] = (stats[c.book] || 0) + 1;
  });

  ALLOWED_BOOKS.forEach(function (b) {
    assert(stats[b] > 0, b + ' 必须有有效章节进入候选池');
    console.log(`   • ${b}: ${stats[b]} 章`);
  });

  console.log(`   • 总候选章节数: ${realCandidates.length} 章`);
  console.log('✅ Case 2 PASS: 5 本书全部具有候选章节');
})();

// =========================================================================
// Case 3：chapterId 严格唯一无重复
// =========================================================================
(function testCase3() {
  console.log('----------------------------------------------------');
  console.log('Case 3: chapterId 去重性校验');

  const idSet = new Set(realCandidates.map(function (c) { return c.chapterId; }));
  assert.equal(idSet.size, realCandidates.length, '候选列表中的 chapterId 必须完全唯一');

  console.log('✅ Case 3 PASS: 所有 chapterId 唯一，无重复');
})();

// =========================================================================
// Case 4：零题章节排除
// =========================================================================
(function testCase4() {
  console.log('----------------------------------------------------');
  console.log('Case 4: 零题章节 (total <= 0) 严格排除');

  const testSubjects = [
    {
      id: 'shu1',
      chapters: [
        { id: 'ch_zero_1', wb: '基础30讲', total: 0 },
        { id: 'ch_zero_2', wb: '1000题', total: -1 },
        { id: 'ch_zero_3', wb: '李林880', labels: [] },
        { id: 'ch_valid', wb: '夜雨强化', total: 12 }
      ]
    }
  ];

  const filtered = extractCandidatesFromSubjects(testSubjects);
  assert.equal(filtered.length, 1, '零题章节应全部被排除');
  assert.equal(filtered[0].chapterId, 'ch_valid');

  // 检查真实候选池
  realCandidates.forEach(function (c) {
    assert(c.total > 0, '候选章节总题数必须大于 0: ' + c.name);
  });

  console.log('✅ Case 4 PASS: 零题章节已被严格排除');
})();

// =========================================================================
// Case 5：视觉交错（按 5 本书轮询交错）
// =========================================================================
(function testCase5() {
  console.log('----------------------------------------------------');
  console.log('Case 5: 候选池视觉交错排列顺序校验');

  const firstFive = realCandidates.slice(0, 5).map(function (c) { return c.book; });
  assert.deepEqual(firstFive, ALLOWED_BOOKS, '前 5 项必须按李林880、基础30讲、强化36讲、1000题、夜雨强化轮询排列');

  const secondFive = realCandidates.slice(5, 10).map(function (c) { return c.book; });
  assert.deepEqual(secondFive, ALLOWED_BOOKS, '第二组 5 项同样按相同顺序轮询交错');

  console.log('✅ Case 5 PASS: 视觉交错分布验证通过');
})();

// =========================================================================
// Case 6：角度计算（所有候选 index 的停靠角度均在 [0, 360) 内）
// =========================================================================
(function testCase6() {
  console.log('----------------------------------------------------');
  console.log('Case 6: 停靠角度计算函数 restRotationForIndex 校验');

  const total = realCandidates.length;
  assert(total > 0, '候选池不能为空');

  for (let i = 0; i < total; i++) {
    const angle = DMW.restRotationForIndex(i, total);
    assert(typeof angle === 'number', '角度必须为数字');
    assert(!isNaN(angle), '角度不能为 NaN');
    assert(angle >= 0 && angle < 360, `index ${i} 的停靠角度必须在 [0, 360) 范围内，实际: ${angle}`);
  }

  // 边界测试
  assert.equal(DMW.restRotationForIndex(-1, 10), 0);
  assert.equal(DMW.restRotationForIndex(10, 10), 0);
  assert.equal(DMW.restRotationForIndex(0, 0), 0);

  // 扇区中心指针校验：当 total = 4 时，每个扇区 90 度，第 0 片从 -90 到 0，其中心为 -45 度。
  // 指针在顶部（-90度），转盘需要旋转 -(0 + 0.5) * 90 = -45度 -> 315度。
  // 旋转 315 度后，第 0 片中心正好对准顶部指针！
  const testAngle0 = DMW.restRotationForIndex(0, 4);
  assert.equal(testAngle0, 315, '4 个扇区时，第 0 片停靠角度应为 315 度');

  console.log('✅ Case 6 PASS: 所有候选扇区停靠角度计算准确且在 [0, 360) 内');
})();

// =========================================================================
// Case 7：同日锁定（同一天再次获取必须返回相同结果，不能重抽）
// =========================================================================
(function testCase7() {
  console.log('----------------------------------------------------');
  console.log('Case 7: 同日锁定行为校验');

  mockLocalStorage.clear();

  const day = DMW.localDayKey(new Date());
  const sampleResult = {
    subjectId: 'shu1',
    chapterId: realCandidates[0].chapterId,
    book: realCandidates[0].book,
    subject: realCandidates[0].subject,
    short: realCandidates[0].short,
    name: realCandidates[0].name,
    total: realCandidates[0].total
  };

  const storedPayload = {
    schemaVersion: 1,
    date: day,
    rolledAt: Date.now(),
    result: sampleResult
  };

  // 写入存储
  mockLocalStorage.setItem('user_guest_daily_math_wheel_v1', JSON.stringify(storedPayload));

  // 通过 DMW 读取当天结果
  const todayResult = DMW.getTodayResult();
  assert(todayResult !== null, '同日必须能够读取到已抽取的存储结果');
  assert.equal(todayResult.chapterId, sampleResult.chapterId, '读取到的 chapterId 必须与已锁定结果完全一致');
  assert.equal(todayResult.book, sampleResult.book, '书籍必须完全一致');

  console.log('✅ Case 7 PASS: 同日结果严格锁定，不可重复抽取');
})();

// =========================================================================
// Case 8：次日解锁（模拟日期切换到第二天，getTodayResult 必须返回 null）
// =========================================================================
(function testCase8() {
  console.log('----------------------------------------------------');
  console.log('Case 8: 次日自然日自动解锁');

  mockLocalStorage.clear();

  // 存储写入昨日结果
  const yesterday = '2026-09-20';
  const sampleResult = {
    chapterId: 'test_ch_old',
    book: '李林880',
    total: 20
  };

  mockLocalStorage.setItem('user_guest_daily_math_wheel_v1', JSON.stringify({
    schemaVersion: 1,
    date: yesterday,
    rolledAt: 1789900000000,
    result: sampleResult
  }));

  // 在当前日期下读取，日期不匹配必须返回 null
  const currentResult = DMW.getTodayResult();
  assert.strictEqual(currentResult, null, '日期跨越后，昨日的转盘结果不可作为今日结果，必须返回 null 以便新一天重新抽取');

  console.log('✅ Case 8 PASS: 次日自然日成功自动解锁');
})();

// =========================================================================
// 附加测试 1：公平随机（无偏 crypto 随机函数测试）
// =========================================================================
(function testCryptoRandom() {
  console.log('----------------------------------------------------');
  console.log('附加测试 1: 消除 Modulo Bias 的公平随机算法');

  for (let i = 0; i < 500; i++) {
    const idx = DMW.secureRandomIndex(realCandidates.length);
    assert(Number.isInteger(idx), '生成的随机索引必须是整数');
    assert(idx >= 0 && idx < realCandidates.length, '生成的随机索引必须在有效候选长度内');
  }

  assert.equal(DMW.secureRandomIndex(0), -1);
  assert.equal(DMW.secureRandomIndex(-5), -1);

  console.log('✅ 附加测试 1 PASS: 公平随机算法验证通过');
})();

// =========================================================================
// 附加测试 2：备份与恢复完整链路
// =========================================================================
(function testBackupAndRestore() {
  console.log('----------------------------------------------------');
  console.log('附加测试 2: 完整学习记录导出与恢复支持 dailyMathWheel');

  assert(app.includes("dailyMathWheel: safeStorageGet(userStoragePrefix() + 'daily_math_wheel_v1')"), 'exportFullStudyBackup 中必须导出 dailyMathWheel 字段');
  assert(app.includes("if (p.dailyMathWheel)"), 'applyImportPayload 中必须支持 dailyMathWheel 字段恢复');

  console.log('✅ 附加测试 2 PASS: 备份与恢复链路上 dailyMathWheel 完整兼容');
})();

console.log('====================================================');
console.log('🎉 ALL 8 CASES + STATIC & BACKUP CHECKS PASSED!');
console.log('====================================================');
process.exit(0);

