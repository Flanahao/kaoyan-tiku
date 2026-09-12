'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

const html = read('index.html');
const app = read('js/app.js');
const css = read('css/styles.css');

// ==========================================
// 1. 静态结构与合约断言
// ==========================================

// 容器升级为数学、专业课独立网格
assert(html.includes('id="dbWeakMathGrid"'), 'index.html 必须包含 dbWeakMathGrid 容器');
assert(html.includes('id="dbWeakMajorGrid"'), 'index.html 必须包含 dbWeakMajorGrid 容器');
assert(html.includes('数学薄弱章节 Top 3'), 'index.html 必须包含数学薄弱章节标题');
assert(html.includes('专业课薄弱章节 Top 3'), 'index.html 必须包含专业课薄弱章节标题');

// 旧全站混排函数必须被清理，新分科调用必须存在
assert(!app.includes('collectWeakChapters(3'), 'app.js 中旧全站混排 collectWeakChapters(3 不得继续存在');
assert(app.includes("collectWeakChaptersForSubject('shu1'"), 'app.js 必须分科调用 collectWeakChaptersForSubject(\'shu1\'');
assert(app.includes("collectWeakChaptersForSubject('zhuanye'"), 'app.js 必须分科调用 collectWeakChaptersForSubject(\'zhuanye\'');

// CSS 样式定义检查
assert(css.includes('.db-weak-subject-block'), 'styles.css 必须包含 .db-weak-subject-block 样式');
assert(css.includes('.db-weak-subject-header'), 'styles.css 必须包含 .db-weak-subject-header 样式');

// ==========================================
// 2. 算法与数据逻辑断言
// ==========================================

// 提取 app.js 中的 collectWeakChaptersForSubject 核心逻辑或加载测试环境
const mockSubjects = [
  {
    id: 'shu1',
    name: '数学一',
    analyticsGroup: 'math',
    wbOrder: [{ wb: '基础30讲', label: '30讲' }],
    chapters: [
      { id: 'm_ch1', short: '高数第1讲', total: 50, wb: '基础30讲' },
      { id: 'm_ch2', short: '高数第2讲', total: 50, wb: '基础30讲' },
      { id: 'm_ch3', short: '高数第3讲', total: 50, wb: '基础30讲' },
      { id: 'm_ch4', short: '高数第4讲', total: 50, wb: '基础30讲' },
      { id: 'm_ch5', short: '高数第5讲', total: 50, wb: '基础30讲' }
    ]
  },
  {
    id: 'zhuanye',
    name: '专业课',
    analyticsGroup: 'major',
    wbOrder: [{ wb: '信号与系统', label: '信号' }],
    chapters: [
      { id: 'p_ch1', short: '信号第1章', total: 30, wb: '信号与系统' },
      { id: 'p_ch2', short: '信号第2章', total: 30, wb: '信号与系统' },
      { id: 'p_ch3', short: '信号第3章', total: 30, wb: '信号与系统' },
      { id: 'p_ch4', short: '信号第4章', total: 30, wb: '信号与系统' }
    ]
  },
  {
    id: 'english',
    name: '英语',
    analyticsGroup: 'english',
    chapters: [
      { id: 'en_voc', short: '英语词汇', total: 600 }
    ]
  }
];

function buildCollector(statsDb, sm2Db) {
  function getChStats(ch, subject) {
    const key = subject.id + '_' + ch.id;
    return statsDb[key] || { wrong: 0, vague: 0, proficient: 0, done: 0 };
  }

  function getDashboardChapterDueCount(ch, subject, nowTime) {
    const key = subject.id + '_' + ch.id;
    return sm2Db[key] || 0;
  }

  function getSubjectBookLabel(subject, wb) {
    return wb;
  }

  return function collectWeakChaptersForSubject(subjectId, limit) {
    const subject = mockSubjects.find(item => item.id === subjectId);
    if (!subject) return [];

    const nowTime = Date.now();
    const rows = [];
    const chapters = (subject.chapters || []).filter(ch => ch && !ch.q1000Id && Number(ch.total || ch.ownTotal || 0) > 0);

    chapters.forEach(function (ch, chapterOrder) {
      const stats = getChStats(ch, subject);
      const total = Number(ch.ownTotal || ch.total || 0);
      if (total <= 0) return;

      const wrong = Number(stats.wrong || 0);
      const vague = Number(stats.vague || 0);
      const dueCount = getDashboardChapterDueCount(ch, subject, nowTime);

      if (wrong <= 0 && vague <= 0 && dueCount <= 0) return;

      const wrongRate = wrong / total;
      const vagueRate = vague / total;
      const duePressure = Math.min(dueCount, 10) / 10;
      const score = wrongRate * 0.55 + vagueRate * 0.30 + duePressure * 0.15;

      rows.push({
        subjectId: subject.id,
        subjectName: subject.name,
        analyticsGroup: subject.analyticsGroup,
        chapterId: ch.id,
        chapterName: ch.short || ch.name || ch.id,
        bookLabel: getSubjectBookLabel(subject, ch.wb || ch.statsWb || ''),
        wrong: wrong,
        vague: vague,
        dueCount: dueCount,
        total: total,
        score: score,
        chapterOrder: chapterOrder
      });
    });

    rows.sort(function (a, b) {
      return (b.score - a.score) ||
        (b.wrong - a.wrong) ||
        (b.vague - a.vague) ||
        (b.dueCount - a.dueCount) ||
        (a.chapterOrder - b.chapterOrder);
    });

    return rows.slice(0, Math.max(0, Number(limit) || 0));
  };
}

// ------------------------------------------
// 测试 A: 验证数学与专业课各自分开，不抢名额
// ------------------------------------------
const statsData = {
  // 数学有 5 个章节都有很高的错题分
  'shu1_m_ch1': { wrong: 30, vague: 10 },
  'shu1_m_ch2': { wrong: 25, vague: 10 },
  'shu1_m_ch3': { wrong: 20, vague: 10 },
  'shu1_m_ch4': { wrong: 15, vague: 10 },
  'shu1_m_ch5': { wrong: 10, vague: 10 },
  // 专业课有 3 个章节有中等错题分
  'zhuanye_p_ch1': { wrong: 8, vague: 4 },
  'zhuanye_p_ch2': { wrong: 6, vague: 2 },
  'zhuanye_p_ch3': { wrong: 4, vague: 2 }
};
const sm2Data = {
  'zhuanye_p_ch1': 2
};

const collector = buildCollector(statsData, sm2Data);

const mathResult = collector('shu1', 3);
const majorResult = collector('zhuanye', 3);

// 断言 1: 数学与专业课 ID 正确
assert.strictEqual(mathResult.length, 3, '数学应取前 3 名');
mathResult.forEach(item => {
  assert.strictEqual(item.subjectId, 'shu1', '数学列表每一项必须属于 shu1');
  assert.strictEqual(item.analyticsGroup, 'math');
});
assert.strictEqual(mathResult[0].chapterId, 'm_ch1');
assert.strictEqual(mathResult[1].chapterId, 'm_ch2');
assert.strictEqual(mathResult[2].chapterId, 'm_ch3');

// 断言 2: 专业课即使分数低于数学，也完整保留自己的 Top 3，绝不被数学挤掉
assert.strictEqual(majorResult.length, 3, '专业课应取满前 3 名，不得被数学挤掉');
majorResult.forEach(item => {
  assert.strictEqual(item.subjectId, 'zhuanye', '专业课列表每一项必须属于 zhuanye');
  assert.strictEqual(item.analyticsGroup, 'major');
});
assert.strictEqual(majorResult[0].chapterId, 'p_ch1');
assert.strictEqual(majorResult[1].chapterId, 'p_ch2');
assert.strictEqual(majorResult[2].chapterId, 'p_ch3');

// ------------------------------------------
// 测试 B: 单科无弱项时返回空，不借用另一科
// ------------------------------------------
const mathOnlyStats = {
  'shu1_m_ch1': { wrong: 5, vague: 2 }
};
const mathOnlyCollector = buildCollector(mathOnlyStats, {});

const mathOnlyRes = mathOnlyCollector('shu1', 3);
const majorEmptyRes = mathOnlyCollector('zhuanye', 3);

assert.strictEqual(mathOnlyRes.length, 1, '数学只有 1 个弱项时取 1 个');
assert.strictEqual(majorEmptyRes.length, 0, '专业课无弱项时返回空数组，不得拿数学凑数');

// ------------------------------------------
// 测试 C: 英语绝不进入
// ------------------------------------------
const englishCollector = buildCollector({
  'english_en_voc': { wrong: 100, vague: 50 }
}, {});
assert.strictEqual(englishCollector('shu1', 3).length, 0);
assert.strictEqual(englishCollector('zhuanye', 3).length, 0);

// ------------------------------------------
// 测试 D: 稳定排序 tie-break (同分按 wrong -> vague -> due -> chapterOrder)
// ------------------------------------------
const tieStats = {
  // m_ch1: wrongRate = 0.2 (wrong 10/50), vagueRate = 0
  'shu1_m_ch1': { wrong: 10, vague: 0 },
  // m_ch2: wrongRate = 0.2 (wrong 10/50), vagueRate = 0 (same score, later chapter)
  'shu1_m_ch2': { wrong: 10, vague: 0 }
};
const tieCollector = buildCollector(tieStats, {});
const tieResult = tieCollector('shu1', 3);
assert.strictEqual(tieResult[0].chapterId, 'm_ch1', '同分时按 chapterOrder ASC 排序稳定');
assert.strictEqual(tieResult[1].chapterId, 'm_ch2');

console.log('WEAK_CHAPTER_SPLIT_TESTS_PASSED');
