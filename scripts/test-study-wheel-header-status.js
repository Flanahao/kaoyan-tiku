/**
 * scripts/test-study-wheel-header-status.js
 * 考研题库：数学与专业课 Header 状态色对齐契约与状态机自动化测试
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 Running scripts/test-study-wheel-header-status.js');
console.log('====================================================');

// 1. 静态代码合约检查
const jsCode = fs.readFileSync(path.join(__dirname, '../js/daily-study-wheel.js'), 'utf-8');
const cssCode = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf-8');

assert(jsCode.includes('normalizeWheelSubjectKey'), '必须实现 normalizeWheelSubjectKey 函数');
assert(jsCode.includes('getWheelCompletedRoundsToday'), '必须实现 getWheelCompletedRoundsToday 函数');
assert(jsCode.includes('getWheelHeaderVisualState'), '必须实现 getWheelHeaderVisualState 函数');
assert(jsCode.includes('renderWheelHeaderChip'), '必须实现 renderWheelHeaderChip 函数');
assert(jsCode.includes('renderAllWheelHeaderChips'), '必须实现 renderAllWheelHeaderChips 函数');

assert(cssCode.includes('.daily-math-wheel-widget.is-progressed') || cssCode.includes('.wheel-status-chip.is-progressed'), 'CSS 必须定义公共 .is-progressed 样式');
assert(!cssCode.includes('.daily-major-wheel-widget {\n  background:'), '禁止只针对 major 硬编码背景色');

console.log('✅ 静态文件契约检查通过');

// 2. 模拟运行环境
const localStorageMap = {};
global.window = {
  localStorage: {
    getItem: function (k) { return localStorageMap[k] !== undefined ? localStorageMap[k] : null; },
    setItem: function (k, v) { localStorageMap[k] = String(v); },
    removeItem: function (k) { delete localStorageMap[k]; }
  },
  DailyStudyWheelBridge: {
    getStoragePrefix: function () { return 'user_test_'; },
    getCandidates: function (sid) {
      return [
        { chapterId: 'ch1', name: '第1章', book: 'Book A' },
        { chapterId: 'ch2', name: '第2章', book: 'Book A' }
      ];
    },
    getChapterProgress: function () { return { marked: 0, total: 10, rate: 0 }; },
    openChapter: function () { return true; }
  },
  addEventListener: function () {},
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  requestAnimationFrame: function (cb) { cb(); },
  matchMedia: function () { return { matches: false }; },
  ResizeObserver: class {
    observe() {}
    disconnect() {}
  }
};
global.document = {
  getElementById: function (id) {
    if (!this._elements) this._elements = {};
    if (!this._elements[id]) {
      this._elements[id] = {
        id: id,
        textContent: '',
        innerHTML: '',
        style: {},
        addEventListener: function () {},
        focus: function () {},
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          toggle(c, force) {
            if (force === undefined) {
              if (this.classes.has(c)) this.classes.delete(c);
              else this.classes.add(c);
            } else if (force) {
              this.classes.add(c);
            } else {
              this.classes.delete(c);
            }
          },
          contains(c) { return this.classes.has(c); }
        }
      };
    }
    return this._elements[id];
  },
  querySelectorAll: function () { return []; },
  querySelector: function () { return null; },
  addEventListener: function () {}
};

// 加载模块代码
eval(jsCode);
const W = global.window.DailyStudyWheel;

// ----------------------------------------------------
// Test 1: 科目归一化测试 (normalizeWheelSubjectKey)
// ----------------------------------------------------
console.log('----------------------------------------------------');
console.log('Test 1: normalizeWheelSubjectKey 归一化测试');
assert.strictEqual(W.normalizeWheelSubjectKey('shu1'), 'math', "normalize('shu1') 必须为 'math'");
assert.strictEqual(W.normalizeWheelSubjectKey('math'), 'math', "normalize('math') 必须为 'math'");
assert.strictEqual(W.normalizeWheelSubjectKey('数学'), 'math', "normalize('数学') 必须为 'math'");
assert.strictEqual(W.normalizeWheelSubjectKey('zhuanye'), 'major', "normalize('zhuanye') 必须为 'major'");
assert.strictEqual(W.normalizeWheelSubjectKey('major'), 'major', "normalize('major') 必须为 'major'");
assert.strictEqual(W.normalizeWheelSubjectKey('professional'), 'major', "normalize('professional') 必须为 'major'");
assert.strictEqual(W.normalizeWheelSubjectKey('专业课'), 'major', "normalize('专业课') 必须为 'major'");
console.log('✅ Test 1 PASS: 所有别名归一化完全正确');

// ----------------------------------------------------
// Test 2: 数学与专业课 0 完成 -> active / idle (未进入完成推进态)
// ----------------------------------------------------
console.log('----------------------------------------------------');
console.log('Test 2: 初始状态 (0 完成) 视觉状态测试');
const today = W.localDayKey(new Date());
const prefix = 'user_test_';

// 初始空状态
localStorageMap[prefix + 'daily_study_wheel_rounds_v2'] = JSON.stringify({
  schemaVersion: 2,
  date: today,
  math: [],
  major: []
});

assert.strictEqual(W.getWheelHeaderVisualState('math'), 'idle', '数学无轮次时应为 idle');
assert.strictEqual(W.getWheelHeaderVisualState('major'), 'idle', '专业课无轮次时应为 idle');

W.renderAllWheelHeaderChips();
const mathBtn = document.getElementById('dailyMathWheelButton');
const majorBtn = document.getElementById('dailyMajorWheelButton');

assert(!mathBtn.classList.contains('is-progressed'), '0 完成时数学不可包含 is-progressed');
assert(!majorBtn.classList.contains('is-progressed'), '0 完成时专业课不可包含 is-progressed');
assert(mathBtn.classList.contains('is-idle'), '数学应包含 is-idle');
assert(majorBtn.classList.contains('is-idle'), '专业课应包含 is-idle');
console.log('✅ Test 2 PASS: 初始 0 完成状态两科绝对一致 (idle，无 is-progressed)');

// ----------------------------------------------------
// Test 3: 单独抽取第 1 轮进行中 -> active
// ----------------------------------------------------
console.log('----------------------------------------------------');
console.log('Test 3: 单独抽取第 1 轮进行中 (active)');
localStorageMap[prefix + 'daily_study_wheel_rounds_v2'] = JSON.stringify({
  schemaVersion: 2,
  date: today,
  math: [{ round: 1, chapterId: 'ch1', status: 'active', name: '第1章' }],
  major: []
});

assert.strictEqual(W.getWheelHeaderVisualState('math'), 'active', '数学有 active 轮次时应为 active');
assert.strictEqual(W.getWheelHeaderVisualState('major'), 'idle', '专业课无轮次时仍为 idle');

W.renderAllWheelHeaderChips();
assert(!mathBtn.classList.contains('is-progressed'), 'active 轮次尚未完成不可标记 is-progressed');
assert(mathBtn.classList.contains('is-active'), '数学应包含 is-active');
console.log('✅ Test 3 PASS: active 进行中状态判定准确');

// ----------------------------------------------------
// Test 4: 数学完成第 1 轮 -> progressed (触发绿色完成态)
// ----------------------------------------------------
console.log('----------------------------------------------------');
console.log('Test 4: 数学完成第 1 轮 -> progressed (绿色完成态)');
localStorageMap[prefix + 'daily_study_wheel_rounds_v2'] = JSON.stringify({
  schemaVersion: 2,
  date: today,
  math: [
    { round: 1, chapterId: 'ch1', status: 'completed', name: '第1章', completedAt: today },
    { round: 2, chapterId: 'ch2', status: 'active', name: '第2章' }
  ],
  major: []
});

assert.strictEqual(W.getWheelHeaderVisualState('math'), 'progressed', '数学有 completed 轮次时应为 progressed');
assert.strictEqual(W.getWheelHeaderVisualState('major'), 'idle', '专业课未推进应为 idle');

W.renderAllWheelHeaderChips();
assert(mathBtn.classList.contains('is-progressed'), '数学必须具备 is-progressed');
assert(!majorBtn.classList.contains('is-progressed'), '专业课不可包含 is-progressed');
console.log('✅ Test 4 PASS: 数学完成第 1 轮后精确进入 progressed 状态');

// ----------------------------------------------------
// Test 5: 专业课完成第 1 轮 -> progressed (双科镜像对称)
// ----------------------------------------------------
console.log('----------------------------------------------------');
console.log('Test 5: 专业课完成第 1 轮 (双科镜像对称)');
localStorageMap[prefix + 'daily_study_wheel_rounds_v2'] = JSON.stringify({
  schemaVersion: 2,
  date: today,
  math: [],
  major: [
    { round: 1, chapterId: 'ch1', status: 'completed', name: '第1章', completedAt: today }
  ]
});

assert.strictEqual(W.getWheelHeaderVisualState('math'), 'idle', '数学未推进为 idle');
assert.strictEqual(W.getWheelHeaderVisualState('major'), 'progressed', '专业课应为 progressed');

W.renderAllWheelHeaderChips();
assert(!mathBtn.classList.contains('is-progressed'), '数学不可包含 is-progressed');
assert(majorBtn.classList.contains('is-progressed'), '专业课必须具备 is-progressed');
console.log('✅ Test 5 PASS: 专业课行为与数学完全镜像一致');

// ----------------------------------------------------
// Test 6: 双科均完成 -> 均进入 progressed
// ----------------------------------------------------
console.log('----------------------------------------------------');
console.log('Test 6: 双科均完成一轮推进');
localStorageMap[prefix + 'daily_study_wheel_rounds_v2'] = JSON.stringify({
  schemaVersion: 2,
  date: today,
  math: [{ round: 1, chapterId: 'ch1', status: 'completed', completedAt: today }],
  major: [{ round: 1, chapterId: 'ch2', status: 'completed', completedAt: today }]
});

assert.strictEqual(W.getWheelHeaderVisualState('math'), 'progressed');
assert.strictEqual(W.getWheelHeaderVisualState('major'), 'progressed');

W.renderAllWheelHeaderChips();
assert(mathBtn.classList.contains('is-progressed'), '数学必须具备 is-progressed');
assert(majorBtn.classList.contains('is-progressed'), '专业课必须具备 is-progressed');
console.log('✅ Test 6 PASS: 双科均呈现 is-progressed');

// ----------------------------------------------------
// Test 7: Undo 掉当天唯一完成轮次 -> is-progressed 消失
// ----------------------------------------------------
console.log('----------------------------------------------------');
console.log('Test 7: Undo 掉当天唯一完成轮次 -> is-progressed 撤销');
// 执行撤销：math 变回 active
localStorageMap[prefix + 'daily_study_wheel_rounds_v2'] = JSON.stringify({
  schemaVersion: 2,
  date: today,
  math: [{ round: 1, chapterId: 'ch1', status: 'active' }],
  major: [{ round: 1, chapterId: 'ch2', status: 'completed', completedAt: today }]
});

assert.strictEqual(W.getWheelHeaderVisualState('math'), 'active', '撤销后数学无 completed，回到 active');
assert.strictEqual(W.getWheelHeaderVisualState('major'), 'progressed', '专业课未撤销保持 progressed');

W.renderAllWheelHeaderChips();
assert(!mathBtn.classList.contains('is-progressed'), '撤销后数学不可包含 is-progressed');
assert(mathBtn.classList.contains('is-active'), '数学应包含 is-active');
assert(majorBtn.classList.contains('is-progressed'), '专业课保持 is-progressed');
console.log('✅ Test 7 PASS: 唯一完成轮次 Undo 后绿色状态精确褪去，跨科独立隔离');

// ----------------------------------------------------
// Test 8: 完成 3 轮只 Undo 最后一轮 -> 仍有 2 轮已完成 -> is-progressed 保留
// ----------------------------------------------------
console.log('----------------------------------------------------');
console.log('Test 8: 完成多轮后只 Undo 最后一轮 -> 绿色保持');
localStorageMap[prefix + 'daily_study_wheel_rounds_v2'] = JSON.stringify({
  schemaVersion: 2,
  date: today,
  math: [
    { round: 1, chapterId: 'ch1', status: 'completed', completedAt: today },
    { round: 2, chapterId: 'ch2', status: 'completed', completedAt: today },
    { round: 3, chapterId: 'ch3', status: 'active' }
  ],
  major: []
});

assert.strictEqual(W.getWheelCompletedRoundsToday('math').length, 2, '数学剩余 2 轮完成');
assert.strictEqual(W.getWheelHeaderVisualState('math'), 'progressed', '仍有完成轮次时必须保持 progressed');

W.renderAllWheelHeaderChips();
assert(mathBtn.classList.contains('is-progressed'), '多轮剩余完成时数学必须保持 is-progressed');
console.log('✅ Test 8 PASS: 连续多轮 Undo 保护准确');

console.log('====================================================');
console.log('WHEEL_HEADER_STATUS_PARITY_TEST_PASSED');
console.log('====================================================');
process.exit(0);
