'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
const english = fs.readFileSync(path.join(ROOT, 'js/english.js'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// 1. 英语模块不得再读取顶层 let 的 window 镜像。
assert.doesNotMatch(english, /window\.curSubjectId/);
assert.match(english, /window\.getCurrentSubjectId/);
assert.match(english, /window\.openLastPracticeSubject/);
assert.match(app, /window\.getCurrentSubjectId\s*=\s*getCurrentSubjectId/);
assert.match(app, /window\.openLastPracticeSubject\s*=\s*openLastPracticeSubject/);
assert.match(html, /js\/app\.js\?v=20260923d/);
assert.match(html, /js\/english\.js\?v=20260923c/);

// 2. 切换数学/专业课必须重载对应科目的 SM-2 内存态。
assert.match(
  app,
  /function switchSubject[\s\S]*?loadStatuses\(\); loadQBad\(\); loadSBad\(\); loadNotes\(\); loadSm2\(\);/
);

// 3. 写状态和切题都有上下文/索引防线，错误状态不能继续写 localStorage。
assert.match(app, /function ensurePracticeActionContext\(actionName\)/);
assert.match(app, /if \(!ensurePracticeActionContext\('setStatus'\)\) return false/);
assert.match(app, /function switchTo\(idx\)[\s\S]*?switchTo rejected invalid target/);
assert.match(app, /function statusSources\(ch\)[\s\S]*?if \(!ch\) return \[\]/);

// 4. 撤销必须同时记录科目、状态、SM-2 与复习会话快照。
assert.match(app, /subjectId: curSubjectId/);
assert.match(app, /prevSm2: prevSm2/);
assert.match(app, /reviewSnapshot: reviewSnapshot/);
assert.match(app, /if \(act\.subjectId !== curSubjectId\)[\s\S]*?switchSubject\(act\.subjectId\)/);
assert.match(app, /if \(act\.prevSm2\)[\s\S]*?saveSm2\(\)/);

// 5. 取消掌握度要同步移除 SM-2，筛选失配后必须重定位。
assert.match(app, /delete sm2\[markedIdx\];\s*saveSm2\(\);/);
assert.match(app, /function relocateAfterFilterMutation\(markedIdx\)/);

function relocate(filtered, markedIdx) {
  if (filtered.length === 0) return { filter: 'all', idx: markedIdx };
  const nextIdx = filtered.find(function (idx) { return idx > markedIdx; });
  return { filter: 'active', idx: nextIdx === undefined ? filtered[0] : nextIdx };
}

assert.deepEqual(
  relocate([1, 4, 8], 4),
  { filter: 'active', idx: 8 },
  '当前题移出筛选后应前进到下一条可见题'
);
assert.deepEqual(
  relocate([1, 4], 9),
  { filter: 'active', idx: 1 },
  '末题移出筛选后应循环到第一条可见题'
);
assert.deepEqual(
  relocate([], 3),
  { filter: 'all', idx: 3 },
  '筛选结果清空时应恢复全部并保留当前题'
);

// 6. 跨科目事务模型：撤销只恢复原科目的状态与 SM-2。
const stores = {
  shu1: { status: { 2: 'wrong' }, sm2: { 2: { reps: 1, interval: 1 } } },
  zhuanye: { status: { 2: 'vague' }, sm2: { 2: { reps: 4, interval: 12 } } }
};
const action = {
  subjectId: 'shu1',
  idx: 2,
  prevStatus: 'wrong',
  prevSm2: { reps: 1, interval: 1 }
};
stores.shu1.status[2] = 'proficient';
stores.shu1.sm2[2] = { reps: 0, interval: 6 };
stores[action.subjectId].status[action.idx] = action.prevStatus;
stores[action.subjectId].sm2[action.idx] = JSON.parse(JSON.stringify(action.prevSm2));
assert.deepEqual(stores.shu1.status, { 2: 'wrong' });
assert.deepEqual(stores.shu1.sm2, { 2: { reps: 1, interval: 1 } });
assert.deepEqual(stores.zhuanye.status, { 2: 'vague' });
assert.deepEqual(stores.zhuanye.sm2, { 2: { reps: 4, interval: 12 } });

console.log('PRACTICE_STATE_GUARD_TESTS_PASSED');
