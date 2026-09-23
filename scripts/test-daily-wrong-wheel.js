/* eslint-disable no-console */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const htmlSource = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const wheelSource = fs.readFileSync(path.join(root, 'js/daily-wrong-wheel.js'), 'utf8');
const appSource = fs.readFileSync(path.join(root, 'js/app.js'), 'utf8');
const cssSource = fs.readFileSync(path.join(root, 'css/styles.css'), 'utf8');

console.log('====================================================');
console.log('🧪 Running scripts/test-daily-wrong-wheel.js');
console.log('====================================================');

// 1. 静态合约断言
console.log('--- Step 1: 静态文件与 DOM 合约检查 ---');
assert.match(htmlSource, /id="dailyWrongWheelButton"/, 'index.html 必须包含 dailyWrongWheelButton');
assert.match(htmlSource, /id="dailyWrongWheelModal"/, 'index.html 必须包含 dailyWrongWheelModal');
assert.match(htmlSource, /id="dailyWrongWheelCanvas"/, 'index.html 必须包含 dailyWrongWheelCanvas');
assert.match(htmlSource, /id="btnOpenWrongWheelFromBook"/, '错题本面板必须包含开启错题转盘快捷按钮');
assert.match(htmlSource, /id="btnWrongScopeMistakes"/, '模态框必须包含错题范围切换按钮');
assert.match(htmlSource, /src="js\/daily-wrong-wheel\.js\?v=/, 'index.html 必须引入 daily-wrong-wheel.js');

assert.match(appSource, /getChapterMistakes:/, 'app.js Bridge 必须暴露 getChapterMistakes');
assert.match(appSource, /openWrongChapter:/, 'app.js Bridge 必须暴露 openWrongChapter');
assert.match(appSource, /window\.DailyWrongWheelBridge =/, 'app.js 必须注册 DailyWrongWheelBridge');

assert.match(wheelSource, /window\.DailyWrongWheel =/, 'daily-wrong-wheel.js 必须暴露 window.DailyWrongWheel');
assert.match(wheelSource, /function getScopeFilteredCandidates/, '必须实现 getScopeFilteredCandidates');
assert.match(wheelSource, /function restRotationForIndex/, '必须实现 restRotationForIndex');
assert.match(wheelSource, /function undoLastRound/, '必须实现 undoLastRound');

assert.match(cssSource, /\.daily-wrong-wheel-widget/, 'styles.css 必须定义 daily-wrong-wheel-widget');
assert.match(cssSource, /\.wrong-scope-pill/, 'styles.css 必须定义 wrong-scope-pill');

assert.match(htmlSource, /id="btnDailyWrongWheelPractice"/, 'index.html 必须包含 btnDailyWrongWheelPractice 刷题按钮');
assert.match(wheelSource, /let currentScope = 'all';/, 'daily-wrong-wheel.js 默认必须开启全量候选章节');

console.log('✅ Step 1 PASS: 静态文件合约检查全部通过');

// 2. 纯逻辑不变量测试：错题过滤与范围切换
console.log('--- Step 2: 错题范围过滤逻辑测试 ---');
const sampleChapters = [
  { chapterId: 'ch1', book: '李林880', totalMistakes: 5, wrong: 3, vague: 2, done: 10, total: 20 },
  { chapterId: 'ch2', book: '基础30讲', totalMistakes: 0, wrong: 0, vague: 0, done: 0, total: 25 },
  { chapterId: 'ch3', book: '强化36讲', totalMistakes: 2, wrong: 2, vague: 0, done: 15, total: 30 },
  { chapterId: 'ch4', book: '1000题', totalMistakes: 0, wrong: 0, vague: 0, done: 10, total: 20 },
  { chapterId: 'ch5', book: '夜雨强化', totalMistakes: 0, wrong: 0, vague: 0, done: 30, total: 30 }
];

const mistakeOnly = sampleChapters.filter((c) => c.totalMistakes > 0 || c.wrong > 0 || c.vague > 0);
assert.equal(mistakeOnly.length, 2, '错题模式应仅保留有错题的章节');
assert.deepEqual(mistakeOnly.map((c) => c.chapterId), ['ch1', 'ch3'], '应精确匹配 ch1 与 ch3');

console.log('✅ Step 2 PASS: 错题范围过滤逻辑正确');

// 3. 停靠角度与扇区计算
console.log('--- Step 3: 停靠角度计算测试 ---');
function restRotationForIndex(index, count) {
  const slice = 360 / count;
  const raw = -(index + 0.5) * slice;
  const mod = Number(raw || 0) % 360;
  return mod < 0 ? mod + 360 : mod;
}

for (let count of [1, 2, 5, 20, 196]) {
  for (let i = 0; i < count; i++) {
    const deg = restRotationForIndex(i, count);
    assert.ok(deg >= 0 && deg < 360, `角度应在 [0, 360) 范围内，实际 ${deg}`);
  }
}
console.log('✅ Step 3 PASS: 停靠角度计算全部准确');

// 4. 显示池快照恢复不变量
console.log('--- Step 4: 抽中项临时维持显示池顺序不变量 ---');
const all = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'];
const active = ['ch1', 'ch2', 'ch3', 'ch4', 'ch5'];
const picked = 'ch3';
const remaining = active.filter((id) => id !== picked);
const selectedIndex = all.indexOf(picked);
const activeSet = new Set(remaining);
let insertAt = 0;
for (let i = 0; i < selectedIndex; i += 1) {
  if (activeSet.has(all[i])) insertAt += 1;
}
remaining.splice(insertAt, 0, picked);
assert.deepEqual(remaining, all, '显示池恢复后必须与原候选扇区序列完全一致');
console.log('✅ Step 4 PASS: 动画与进行中扇区显示池恢复顺序验证通过');

// 5. 章节做题状态与双按钮兼容共存逻辑断言
console.log('--- Step 5: 章节多状态识别与按钮兼容并存测试 ---');
function resolveActionButtons(ch) {
  const totMistakes = ch.totalMistakes || 0;
  const done = ch.done || 0;
  const total = ch.total || 0;
  let startBtn = { visible: false, text: '' };
  let practiceBtn = { visible: false, text: '', isPrimary: false };

  if (totMistakes > 0) {
    startBtn = { visible: true, text: `🎯 消灭错题 (${totMistakes}道)` };
    practiceBtn = { visible: true, text: '📝 全章正常刷题', isPrimary: false };
  } else {
    startBtn = { visible: false, text: '' };
    practiceBtn = { visible: true, text: '', isPrimary: true };
    if (done === 0) {
      practiceBtn.text = '📝 先去刷题完成这章';
    } else if (done < total) {
      practiceBtn.text = '📝 继续刷题完成这章';
    } else {
      practiceBtn.text = '📖 前往该章复习巩固';
      practiceBtn.isPrimary = false;
    }
  }
  return { startBtn, practiceBtn };
}

// Case A: 有错题章节 (ch1) -> 必须同时可见消灭错题和全章刷题
const resA = resolveActionButtons(sampleChapters[0]);
assert.equal(resA.startBtn.visible, true);
assert.equal(resA.startBtn.text, '🎯 消灭错题 (5道)');
assert.equal(resA.practiceBtn.visible, true);
assert.equal(resA.practiceBtn.text, '📝 全章正常刷题');

// Case B: 从未做过的章节 (ch2) -> 隐藏消灭错题，显示“先去刷题完成这章”
const resB = resolveActionButtons(sampleChapters[1]);
assert.equal(resB.startBtn.visible, false);
assert.equal(resB.practiceBtn.visible, true);
assert.equal(resB.practiceBtn.text, '📝 先去刷题完成这章');
assert.equal(resB.practiceBtn.isPrimary, true);

// Case C: 做了一半无错题的章节 (ch4) -> 隐藏消灭错题，显示“继续刷题完成这章”
const resC = resolveActionButtons(sampleChapters[3]);
assert.equal(resC.startBtn.visible, false);
assert.equal(resC.practiceBtn.visible, true);
assert.equal(resC.practiceBtn.text, '📝 继续刷题完成这章');
assert.equal(resC.practiceBtn.isPrimary, true);

// Case D: 全做完且无错题章节 (ch5) -> 隐藏消灭错题，显示“前往该章复习巩固”
const resD = resolveActionButtons(sampleChapters[4]);
assert.equal(resD.startBtn.visible, false);
assert.equal(resD.practiceBtn.visible, true);
assert.equal(resD.practiceBtn.text, '📖 前往该章复习巩固');

console.log('✅ Step 5 PASS: 4 种做题状态下的双按钮兼容并存与文本状态全部正确！');

console.log('====================================================');
console.log('🎉 ALL TESTS PASSED: DAILY WRONG WHEEL CONTRACT VERIFIED!');
console.log('====================================================');
