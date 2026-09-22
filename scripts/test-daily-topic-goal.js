'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');

// 构造浏览器沙箱以加载 study-analytics.js
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

const mockElements = {};
function getMockElement(id) {
  if (!mockElements[id]) {
    mockElements[id] = {
      id: id,
      textContent: '',
      innerHTML: '',
      value: '',
      hidden: false,
      title: '',
      style: {
        display: '',
        setProperty: function (k, v) { this[k] = v; }
      },
      classList: {
        classes: new Set(),
        add: function (c) { this.classes.add(c); },
        remove: function (c) { this.classes.delete(c); },
        contains: function (c) { return this.classes.has(c); },
        toggle: function (c, force) {
          if (force === undefined) {
            if (this.classes.has(c)) this.classes.delete(c);
            else this.classes.add(c);
          } else if (force) {
            this.classes.add(c);
          } else {
            this.classes.delete(c);
          }
        }
      },
      attributes: {},
      setAttribute: function (name, val) { this.attributes[name] = String(val); },
      getAttribute: function (name) { return this.attributes[name] || null; },
      children: [],
      appendChild: function (c) { this.children.push(c); return c; },
      replaceChildren: function () { this.children = []; this.innerHTML = ''; },
      querySelector: function () { return getMockElement('qs_' + Math.random()); },
      addEventListener: function () {}
    };
  }
  return mockElements[id];
}

global.window = {
  localStorage: mockLocalStorage,
  userStoragePrefix: function () { return 'user_guest_'; },
  addEventListener: function () {},
  SUBJECTS: [
    {
      id: 'shu1',
      name: '数学',
      analyticsGroup: 'math',
      chapters: [
        { id: 'ch1', wb: '基础30讲', short: '函数极限与连续', name: '第1讲 函数极限与连续', total: 54 },
        { id: 'ch2', wb: '基础30讲', short: '数列极限', name: '第2讲 数列极限', total: 26 }
      ]
    },
    {
      id: 'zhuanye',
      name: '专业课',
      analyticsGroup: 'major',
      chapters: [
        { id: 'bg_jy_01', wb: '波哥讲义例题', short: '信号基础', name: '第1讲 信号基础', total: 30 },
        { id: 'bg_jy_02', wb: '波哥讲义例题', short: 'LTI系统', name: '第2讲 LTI系统', total: 25 }
      ]
    }
  ]
};
global.document = {
  getElementById: getMockElement,
  createElement: function (tag) { return getMockElement('tag_' + tag + '_' + Math.random()); },
  createElementNS: function (ns, tag) { return getMockElement('ns_' + tag + '_' + Math.random()); },
  addEventListener: function () {},
  readyState: 'complete'
};

// 读取并执行 study-analytics.js
const code = fs.readFileSync(path.join(ROOT, 'js/study-analytics.js'), 'utf8');
eval(code);

const SA = global.window.StudyAnalytics;
assert(SA, 'StudyAnalytics 必须成功初始化并挂载至 window');
assert(typeof SA.getTopicProgressFromEvents === 'function', '必须提供 getTopicProgressFromEvents 函数');
assert(typeof SA.normalizeDailyTopicGoals === 'function', '必须提供 normalizeDailyTopicGoals 函数');

function pad2(n) { return String(n).padStart(2, '0'); }
function localDayKey(date) {
  const d = date || new Date();
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}

const todayKey = localDayKey(new Date());
const yesterdayKey = localDayKey(new Date(Date.now() - 86400000));

console.log('Running test-daily-topic-goal.js...');

// =========================================================================
// Case 1：数学专题只统计目标章节
// =========================================================================
(function testCase1() {
  const goal = {
    enabled: true,
    title: '极限与连续',
    subjectId: 'shu1',
    chapterId: 'ch1',
    target: 10
  };

  const events = [
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 0, day: todayKey },
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 1, day: todayKey },
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch2', idx: 0, day: todayKey }
  ];

  const progress = SA.getTopicProgressFromEvents(goal, events, todayKey);
  assert.strictEqual(progress.count, 2, 'Case 1 失败：只应统计目标章节 ch1 的 2 题，期望 2，得到 ' + progress.count);
  assert.strictEqual(progress.bound, true, 'Case 1 失败：bound 应为 true');
  assert.strictEqual(progress.done, false, 'Case 1 失败：2/10 题 done 应为 false');
  console.log('✅ Case 1 PASS: 数学专题只统计目标章节');
})();

// =========================================================================
// Case 2：同题重复状态只计一次
// =========================================================================
(function testCase2() {
  const goal = {
    enabled: true,
    title: '极限与连续',
    subjectId: 'shu1',
    chapterId: 'ch1',
    target: 5
  };

  const events = [
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 0, status: 'proficient', day: todayKey },
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 0, status: 'vague', day: todayKey },
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 0, status: 'wrong', day: todayKey }
  ];

  const progress = SA.getTopicProgressFromEvents(goal, events, todayKey);
  assert.strictEqual(progress.count, 1, 'Case 2 失败：同一题反复打标只应计 1 次，期望 1，得到 ' + progress.count);
  console.log('✅ Case 2 PASS: 同题重复状态只计一次');
})();

// =========================================================================
// Case 3：昨天事件不计入今天
// =========================================================================
(function testCase3() {
  const goal = {
    enabled: true,
    title: '极限与连续',
    subjectId: 'shu1',
    chapterId: 'ch1',
    target: 5
  };

  const events = [
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 0, day: yesterdayKey },
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 1, day: yesterdayKey },
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 2, day: todayKey }
  ];

  const progress = SA.getTopicProgressFromEvents(goal, events, todayKey);
  assert.strictEqual(progress.count, 1, 'Case 3 失败：昨天的事件不应计入今天，期望 1，得到 ' + progress.count);
  console.log('✅ Case 3 PASS: 昨天事件不计入今天');
})();

// =========================================================================
// Case 4：数学与专业课严格隔离
// =========================================================================
(function testCase4() {
  const mathGoal = {
    enabled: true,
    title: '极限与连续',
    subjectId: 'shu1',
    chapterId: 'ch1',
    target: 5
  };
  const majorGoal = {
    enabled: true,
    title: 'LTI系统',
    subjectId: 'zhuanye',
    chapterId: 'bg_jy_02',
    target: 5
  };

  const events = [
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 0, day: todayKey },
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 1, day: todayKey },
    { type: 'status', group: 'major', subjectId: 'zhuanye', chapterId: 'bg_jy_02', idx: 0, day: todayKey },
    { type: 'status', group: 'major', subjectId: 'zhuanye', chapterId: 'bg_jy_02', idx: 1, day: todayKey },
    { type: 'status', group: 'major', subjectId: 'zhuanye', chapterId: 'bg_jy_02', idx: 2, day: todayKey }
  ];

  const mathProgress = SA.getTopicProgressFromEvents(mathGoal, events, todayKey);
  const majorProgress = SA.getTopicProgressFromEvents(majorGoal, events, todayKey);

  assert.strictEqual(mathProgress.count, 2, 'Case 4 失败：数学题数期望 2，得到 ' + mathProgress.count);
  assert.strictEqual(majorProgress.count, 3, 'Case 4 失败：专业课题数期望 3，得到 ' + majorProgress.count);
  console.log('✅ Case 4 PASS: 数学与专业课严格隔离');
})();

// =========================================================================
// Case 5：英语绝不进入专题目标
// =========================================================================
(function testCase5() {
  const mathGoal = {
    enabled: true,
    title: '极限与连续',
    subjectId: 'shu1',
    chapterId: 'ch1',
    target: 5
  };
  const majorGoal = {
    enabled: true,
    title: 'LTI系统',
    subjectId: 'zhuanye',
    chapterId: 'bg_jy_02',
    target: 5
  };

  const events = [];
  // 模拟 20 个英语词汇事件
  for (let i = 0; i < 20; i++) {
    events.push({
      type: 'status',
      group: 'english',
      subjectId: 'english',
      chapterId: 'vocab',
      idx: i,
      itemKey: 'word_' + i,
      day: todayKey
    });
  }

  const mathProgress = SA.getTopicProgressFromEvents(mathGoal, events, todayKey);
  const majorProgress = SA.getTopicProgressFromEvents(majorGoal, events, todayKey);

  assert.strictEqual(mathProgress.count, 0, 'Case 5 失败：英语事件不可计入数学专题，期望 0，得到 ' + mathProgress.count);
  assert.strictEqual(majorProgress.count, 0, 'Case 5 失败：英语事件不可计入专业课专题，期望 0，得到 ' + majorProgress.count);
  console.log('✅ Case 5 PASS: 英语绝不进入专题目标');
})();

// =========================================================================
// Case 6：未绑定章节
// =========================================================================
(function testCase6() {
  const unboundGoal = {
    enabled: true,
    title: '极限专项突破',
    subjectId: 'shu1',
    chapterId: '',
    target: 10
  };

  const events = [
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 0, day: todayKey },
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 1, day: todayKey }
  ];

  const progress = SA.getTopicProgressFromEvents(unboundGoal, events, todayKey);
  assert.strictEqual(progress.bound, false, 'Case 6 失败：未绑定章节时 bound 必须为 false');
  assert.strictEqual(progress.count, 0, 'Case 6 失败：未绑定章节时 count 必须为 0');
  assert.strictEqual(progress.done, false, 'Case 6 失败：未绑定章节时 done 必须为 false');
  console.log('✅ Case 6 PASS: 未绑定章节不虚假计数');
})();

// =========================================================================
// Case 7：完成阈值与单次庆祝
// =========================================================================
(function testCase7() {
  const goal = {
    enabled: true,
    title: '二重积分计算',
    subjectId: 'shu1',
    chapterId: 'ch1',
    target: 3
  };

  const ev2 = [
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 0, day: todayKey },
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 1, day: todayKey }
  ];
  const ev3 = [
    ...ev2,
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 2, day: todayKey }
  ];
  const ev4 = [
    ...ev3,
    { type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 3, day: todayKey }
  ];

  const prog2 = SA.getTopicProgressFromEvents(goal, ev2, todayKey);
  const prog3 = SA.getTopicProgressFromEvents(goal, ev3, todayKey);
  const prog4 = SA.getTopicProgressFromEvents(goal, ev4, todayKey);

  assert.strictEqual(prog2.done, false, '2 题未达到 3 题目标');
  assert.strictEqual(prog3.done, true, '3 题达到 3 题目标');
  assert.strictEqual(prog4.done, true, '4 题依然为完成态');

  // 模拟 maybeCelebrateDailyTopicGoal
  let celebrateCount = 0;
  mockLocalStorage.clear();

  function runCelebrate(beforeP, afterP) {
    if (!beforeP.done && afterP.done && afterP.bound) {
      const fingerprint = goal.subjectId + '|' + goal.chapterId + '|' + goal.title + '|' + goal.target;
      const settings = SA.getDailyTopicGoals ? { topicGoalCelebrations: {} } : {};
      const savedRaw = mockLocalStorage.getItem('user_guest_study_dashboard_settings_v1');
      const saved = savedRaw ? JSON.parse(savedRaw) : {};
      const last = saved.topicGoalCelebrations && saved.topicGoalCelebrations.math;
      if (last && last.date === todayKey && last.fingerprint === fingerprint) {
        return;
      }
      celebrateCount += 1;
      saved.topicGoalCelebrations = saved.topicGoalCelebrations || {};
      saved.topicGoalCelebrations.math = { date: todayKey, fingerprint: fingerprint };
      mockLocalStorage.setItem('user_guest_study_dashboard_settings_v1', JSON.stringify(saved));
    }
  }

  // 2 -> 3: 触发第 1 次庆祝
  runCelebrate(prog2, prog3);
  assert.strictEqual(celebrateCount, 1, '2 -> 3 应触发 1 次庆祝');

  // 3 -> 4: 此时 before 已是 done (prog3.done === true)，不再次庆祝
  runCelebrate(prog3, prog4);
  assert.strictEqual(celebrateCount, 1, '3 -> 4 不应重复庆祝');

  // 再次传入 prog2 -> prog3（例如重复事件）：指纹去重，不重复庆祝
  runCelebrate(prog2, prog3);
  assert.strictEqual(celebrateCount, 1, '相同指纹当天不重复庆祝');

  console.log('✅ Case 7 PASS: 完成阈值触发且单次庆祝');
})();

console.log('\n========================================');
console.log('ALL 7 DAILY TOPIC GOAL UNIT TESTS PASSED!');
console.log('========================================\n');

process.exit(0);
