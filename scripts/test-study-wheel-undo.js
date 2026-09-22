'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

console.log('====================================================');
console.log('🧪 Running scripts/test-study-wheel-undo.js');
console.log('====================================================');

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
  alert: function () {},
  confirm: function () { return true; },
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
    querySelector: function () { return null; },
    addEventListener: function () {},
    readyState: 'complete'
  }
};
global.document = global.window.document;

// 加载真实章节文件
eval(read('js/lilin880-chapters.js'));
eval(read('js/lilin880-optimized-chapters.js'));
eval(read('js/lyf900-chapters.js'));
eval(read('js/yeyu-chapters.js'));
eval(read('js/professional-chapters.js'));
eval(read('js/math-zhenti-chapters.js'));
eval(read('js/chapters.js'));

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

global.window.DailyStudyWheelBridge = {
  getStoragePrefix: function () { return 'user_guest_'; },
  getCandidates: function (subjectId) { return getDailyStudyWheelCandidates(subjectId); },
  getChapterProgress: function () { return { marked: 0, total: 10, rate: 0 }; },
  openChapter: function () { return true; }
};

// 加载转盘主模块
eval(read('js/daily-study-wheel.js'));
const DSW = global.window.DailyStudyWheel;
assert(DSW, 'DailyStudyWheel 必须成功挂载');

// =========================================================================
// 1. complete round -> completed +1
// 2. undo -> completed -1
// 3. undo -> remaining +1
// 4. undo -> previous round doing
// 5. undo -> generated next round removed
// =========================================================================
(function testCompleteAndUndoBasics() {
  console.log('----------------------------------------------------');
  console.log('Test 1-5: 单轮完成与撤销基础状态机断言');

  mockLocalStorage.clear();

  const baseProg = DSW.getWheelProgress('math');
  const baseCompleted = baseProg.completed;
  const baseRemaining = baseProg.remaining;

  // 1. 抽取第 1 轮
  DSW.openModal('shu1');
  DSW.spin();
  const r1 = DSW.getCurrentRound('shu1');
  assert(r1, '第 1 轮抽取成功');
  assert.equal(r1.round, 1);
  assert.equal(r1.status, 'active');

  // 2. 完成第 1 轮
  DSW.markCurrentRoundCompleted('shu1');
  const progAfterComplete = DSW.getWheelProgress('math');
  assert.equal(progAfterComplete.completed, baseCompleted + 1, '1. complete round -> completed +1');
  assert.equal(progAfterComplete.remaining, baseRemaining - 1, 'complete round -> remaining -1');

  // 3. 抽取第 2 轮 (模拟继续加量)
  DSW.spin();
  const r2 = DSW.getCurrentRound('shu1');
  assert.equal(r2.round, 2, '成功开启第 2 轮');
  assert.equal(r2.status, 'active');

  // 4. 撤销上一轮
  const ok = DSW.undoLastRound('shu1');
  assert.equal(ok, true, '撤销成功');

  const progAfterUndo = DSW.getWheelProgress('math');
  assert.equal(progAfterUndo.completed, baseCompleted, '2. undo -> completed -1');
  assert.equal(progAfterUndo.remaining, baseRemaining, '3. undo -> remaining +1');

  const curAfterUndo = DSW.getCurrentRound('shu1');
  assert.equal(curAfterUndo.round, 1, '5. undo -> generated next round removed (回到第 1 轮)');
  assert.equal(curAfterUndo.status, 'active', '4. undo -> previous round doing (active)');
  assert.equal(curAfterUndo.chapterId, r1.chapterId, '回退到原第 1 轮章节');

  // 检查完成池确实被移除
  const hist = DSW.getHistoryState();
  assert(!hist.math.completed.some(c => c.chapterId === r1.chapterId), '转盘完成池中已撤回该章节');

  console.log('✅ Test 1-5 PASS: 单轮完成与撤销基础状态机断言全部通过');
})();

// =========================================================================
// 6. math undo does not mutate major
// 7. major undo does not mutate math
// =========================================================================
(function testSubjectIsolation() {
  console.log('----------------------------------------------------');
  console.log('Test 6-7: 数学与专业课撤销跨科独立隔离');

  mockLocalStorage.clear();

  // 专业课完成一轮
  DSW.openModal('zhuanye');
  DSW.spin();
  const majorR1 = DSW.getCurrentRound('zhuanye');
  assert(majorR1, '专业课第 1 轮生成');
  DSW.markCurrentRoundCompleted('zhuanye');
  const majorProgBefore = DSW.getWheelProgress('major');
  assert.equal(majorProgBefore.completed, 1);

  // 数学也完成一轮并加量
  DSW.openModal('shu1');
  DSW.spin();
  DSW.markCurrentRoundCompleted('shu1');
  DSW.spin();
  const mathProgBefore = DSW.getWheelProgress('math');
  assert.equal(mathProgBefore.completed, 1);

  // 数学执行撤销
  DSW.undoLastRound('shu1');
  const mathProgAfter = DSW.getWheelProgress('math');
  assert.equal(mathProgAfter.completed, 0, '数学完成数回退为 0');

  // 验证专业课完全不受影响
  const majorProgAfterMathUndo = DSW.getWheelProgress('major');
  assert.equal(majorProgAfterMathUndo.completed, 1, '6. math undo does not mutate major');
  const majorRounds = DSW.getDailyState().major;
  assert.equal(majorRounds.length, 1);
  assert.equal(majorRounds[0].status, 'completed');

  // 专业课执行撤销
  DSW.undoLastRound('zhuanye');
  const majorProgAfterMajorUndo = DSW.getWheelProgress('major');
  assert.equal(majorProgAfterMajorUndo.completed, 0, '7. major undo does not mutate math (专业课回退)');

  console.log('✅ Test 6-7 PASS: 跨科独立隔离断言全部通过');
})();

// =========================================================================
// 8. real question statuses untouched
// =========================================================================
(function testRealQuestionDataUntouched() {
  console.log('----------------------------------------------------');
  console.log('Test 8: 真实题目答题状态与掌握度保护');

  mockLocalStorage.clear();

  // 模拟用户在做第 1 轮章节题目时打标真实数据
  mockLocalStorage.setItem('user_guest_q_1001_status', 'mastered');
  mockLocalStorage.setItem('user_guest_q_1002_status', 'wrong');
  mockLocalStorage.setItem('user_guest_q_1001_notes', '非常关键的定积分技巧');
  mockLocalStorage.setItem('user_guest_sm2_q_1001', JSON.stringify({ interval: 4, repetition: 2, ef: 2.5 }));

  // 执行转盘抽取 -> 完成 -> 撤销
  DSW.openModal('shu1');
  DSW.spin();
  DSW.markCurrentRoundCompleted('shu1');
  DSW.undoLastRound('shu1');

  // 断言题目数据纹丝不动
  assert.equal(mockLocalStorage.getItem('user_guest_q_1001_status'), 'mastered', '8. 题目 1001 status 绝对未被篡改');
  assert.equal(mockLocalStorage.getItem('user_guest_q_1002_status'), 'wrong', '8. 题目 1002 status 绝对未被篡改');
  assert.equal(mockLocalStorage.getItem('user_guest_q_1001_notes'), '非常关键的定积分技巧', '8. 题目笔记未受影响');
  assert(mockLocalStorage.getItem('user_guest_sm2_q_1001'), '8. SM-2 参数未受影响');

  console.log('✅ Test 8 PASS: 真实题目答题数据与笔记严格受保护');
})();

// =========================================================================
// 9. complete -> undo -> complete no duplicate
// =========================================================================
(function testNoDuplicateOnRecomplete() {
  console.log('----------------------------------------------------');
  console.log('Test 9: 完成 -> 撤销 -> 再完成，完成池无重复项');

  mockLocalStorage.clear();

  DSW.openModal('shu1');
  DSW.spin();
  const r1 = DSW.getCurrentRound('shu1');

  // 第 1 次完成
  DSW.markCurrentRoundCompleted('shu1');
  assert.equal(DSW.getWheelProgress('math').completed, 1);

  // 撤销
  DSW.undoLastRound('shu1');
  assert.equal(DSW.getWheelProgress('math').completed, 0);

  // 再次完成
  DSW.markCurrentRoundCompleted('shu1');
  const prog = DSW.getWheelProgress('math');
  assert.equal(prog.completed, 1, '9. complete -> undo -> complete 完成数精确为 1 (不翻倍为 2)');

  const hist = DSW.getHistoryState();
  const matching = hist.math.completed.filter(c => c.chapterId === r1.chapterId);
  assert.equal(matching.length, 1, '9. 完成池中无重复章节记录');

  console.log('✅ Test 9 PASS: 再次完成不重复计数验证通过');
})();

// =========================================================================
// 10. multi-level undo
// =========================================================================
(function testMultiLevelUndo() {
  console.log('----------------------------------------------------');
  console.log('Test 10: 连续多轮推进与逐轮多级撤销');

  mockLocalStorage.clear();

  DSW.openModal('shu1');

  // R1
  DSW.spin();
  const r1 = DSW.getCurrentRound('shu1');
  DSW.markCurrentRoundCompleted('shu1');
  assert.equal(DSW.getWheelProgress('math').completed, 1);

  // R2
  DSW.spin();
  const r2 = DSW.getCurrentRound('shu1');
  DSW.markCurrentRoundCompleted('shu1');
  assert.equal(DSW.getWheelProgress('math').completed, 2);

  // R3
  DSW.spin();
  const r3 = DSW.getCurrentRound('shu1');
  DSW.markCurrentRoundCompleted('shu1');
  assert.equal(DSW.getWheelProgress('math').completed, 3);

  // R4 (doing)
  DSW.spin();
  const r4 = DSW.getCurrentRound('shu1');
  assert.equal(r4.round, 4);
  assert.equal(r4.status, 'active');

  // 第一次 Undo: 撤销 R3 的完成，R4 被删，R3 恢复 doing
  const undo1 = DSW.undoLastRound('shu1');
  assert.equal(undo1, true);
  assert.equal(DSW.getCurrentRound('shu1').round, 3);
  assert.equal(DSW.getCurrentRound('shu1').status, 'active');
  assert.equal(DSW.getWheelProgress('math').completed, 2, '第 1 次 Undo: 完成数回退为 2');

  // 第二次 Undo: 撤销 R2 的完成，R3 被删，R2 恢复 doing
  const undo2 = DSW.undoLastRound('shu1');
  assert.equal(undo2, true);
  assert.equal(DSW.getCurrentRound('shu1').round, 2);
  assert.equal(DSW.getCurrentRound('shu1').status, 'active');
  assert.equal(DSW.getWheelProgress('math').completed, 1, '第 2 次 Undo: 完成数回退为 1');

  // 第三次 Undo: 撤销 R1 的完成，R2 被删，R1 恢复 doing
  const undo3 = DSW.undoLastRound('shu1');
  assert.equal(undo3, true);
  assert.equal(DSW.getCurrentRound('shu1').round, 1);
  assert.equal(DSW.getCurrentRound('shu1').status, 'active');
  assert.equal(DSW.getWheelProgress('math').completed, 0, '第 3 次 Undo: 完成数回退为 0');

  // 此时不可再撤销
  assert.equal(DSW.canUndo('shu1'), false, '已退回初始 R1 进行中，不可再撤销');
  assert.equal(DSW.undoLastRound('shu1'), false, '无更早轮次可撤销');

  console.log('✅ Test 10 PASS: 连续多级逐轮撤销逻辑全部验证通过');
})();

console.log('====================================================');
console.log('WHEEL_TRANSACTIONAL_UNDO_TEST_PASSED');
console.log('====================================================');
process.exit(0);
