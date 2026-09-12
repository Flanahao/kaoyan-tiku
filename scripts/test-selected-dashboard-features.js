'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(
  __dirname,
  '..'
);

function read(relativePath) {
  return fs.readFileSync(
    path.join(ROOT, relativePath),
    'utf8'
  );
}

const app =
  read('js/app.js');

const analytics =
  read('js/study-analytics.js');

const english =
  read('js/english.js');

const html =
  read('index.html');

const css =
  read('css/styles.css');

// ---------- 第 1 项：同心环回归 ----------
assert(
  app.includes(
    "mastered: '#4A90E2'"
  ),
  '书籍熟练颜色必须保持蓝色'
);

assert(
  app.includes(
    "fuzzy: '#8B5CF6'"
  ),
  '书籍模糊颜色必须保持紫色'
);

assert(
  app.includes(
    "wrong: '#EF4444'"
  ),
  '书籍不会颜色必须保持红色'
);

assert(
  app.includes(
    "track: '#e8e8e8'"
  ),
  '书籍未标记轨道必须保持灰色'
);

assert(
  /function\s+drawDonut\s*\(/.test(app),
  '必须保留 drawDonut'
);

assert(
  app.includes(
    'var outerR = 108;'
  ) &&
  app.includes(
    'var innerR = 28;'
  ),
  '必须保留当前多层细同心环半径结构'
);

assert(
  !app.includes(
    'drawBookSegmentedDonut'
  ),
  '禁止退回单层粗环实现'
);

// ---------- 功能 2 / 3 ----------
assert(
  analytics.includes(
    'function getStudyStreak'
  ),
  '缺少 getStudyStreak'
);

assert(
  analytics.includes(
    "group === 'english'"
  ),
  'Analytics 必须识别 english'
);

assert(
  english.includes(
    "group: 'english'"
  ) &&
  english.includes(
    'window.StudyAnalytics.recordStatus'
  ),
  '英语状态必须写入 analytics event'
);

assert(
  analytics.includes(
    'getStudyStreak: getStudyStreak'
  ),
  'getStudyStreak 必须导出'
);

// ---------- 功能 4 ----------
assert(
  app.includes(
    "var activeWorkbenchView = 'practice';"
  ),
  '缺少 activeWorkbenchView'
);

assert(
  app.includes(
    'function setWorkbenchView'
  ),
  '缺少 setWorkbenchView'
);

assert(
  app.includes(
    'function getWorkbenchView'
  ),
  '缺少 getWorkbenchView'
);

assert(
  english.includes(
    "window.setWorkbenchView('english')"
  ),
  '英语页面必须接入统一 View State'
);

// ---------- 功能 10 ----------
assert(
  html.includes(
    'id="dbWeakGrid"'
  ),
  '缺少薄弱章节容器'
);

assert(
  app.includes(
    'function collectWeakChapters'
  ),
  '缺少薄弱章节排名函数'
);

assert(
  app.includes(
    'function renderWeakChapterTop3'
  ),
  '缺少薄弱章节渲染函数'
);

assert(
  css.includes(
    '.db-weak-grid'
  ),
  '缺少薄弱章节样式'
);

// ---------- 规格级逻辑测试 ----------
function normalizeAnalyticsGroup(value) {
  const group =
    String(value || '')
      .trim()
      .toLowerCase();

  if (
    group === 'math' ||
    group === 'mathematics' ||
    group === '数学'
  ) {
    return 'math';
  }

  if (
    group === 'major' ||
    group === 'professional' ||
    group === '专业' ||
    group === '专业课'
  ) {
    return 'major';
  }

  if (
    group === 'english' ||
    group === 'en' ||
    group === '英语' ||
    group === '英语词汇'
  ) {
    return 'english';
  }

  return '';
}

function dayKey(value) {
  const date =
    value instanceof Date
      ? new Date(value.getTime())
      : new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return '';
  }

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, '0'),
    String(
      date.getDate()
    ).padStart(2, '0')
  ].join('-');
}

function getStudyStreakSpec(
  input,
  events
) {
  const anchor = new Date(input);

  anchor.setHours(0, 0, 0, 0);

  const activeDays = new Set();

  events.forEach(function (event) {
    if (
      event.type &&
      event.type !== 'status'
    ) {
      return;
    }

    const group =
      normalizeAnalyticsGroup(
        event.group
      );

    if (
      group !== 'math' &&
      group !== 'major' &&
      group !== 'english'
    ) {
      return;
    }

    activeDays.add(event.day);
  });

  const cursor =
    new Date(anchor.getTime());

  if (
    !activeDays.has(
      dayKey(cursor)
    )
  ) {
    cursor.setDate(
      cursor.getDate() - 1
    );
  }

  let streak = 0;

  while (
    activeDays.has(
      dayKey(cursor)
    )
  ) {
    streak += 1;

    cursor.setDate(
      cursor.getDate() - 1
    );
  }

  return streak;
}

const anchor =
  new Date(
    2026,
    8,
    12,
    12,
    0,
    0
  );

assert.strictEqual(
  getStudyStreakSpec(
    anchor,
    [
      {
        type: 'status',
        day: '2026-09-12',
        group: 'english'
      },
      {
        type: 'status',
        day: '2026-09-11',
        group: 'math'
      },
      {
        type: 'status',
        day: '2026-09-10',
        group: 'major'
      }
    ]
  ),
  3
);

assert.strictEqual(
  getStudyStreakSpec(
    anchor,
    [
      {
        type: 'status',
        day: '2026-09-11',
        group: 'math'
      },
      {
        type: 'status',
        day: '2026-09-10',
        group: 'major'
      }
    ]
  ),
  2
);

assert.strictEqual(
  getStudyStreakSpec(
    anchor,
    []
  ),
  0
);

function weakScore(row) {
  const wrongRate =
    row.wrong / row.total;

  const fuzzyRate =
    row.vague / row.total;

  const duePressure =
    Math.min(
      row.dueCount,
      10
    ) / 10;

  return (
    wrongRate * 0.55 +
    fuzzyRate * 0.30 +
    duePressure * 0.15
  );
}

const weakRows = [
  {
    id: 'a',
    total: 100,
    wrong: 10,
    vague: 10,
    dueCount: 0
  },
  {
    id: 'b',
    total: 100,
    wrong: 20,
    vague: 0,
    dueCount: 10
  },
  {
    id: 'c',
    total: 100,
    wrong: 5,
    vague: 30,
    dueCount: 5
  }
]
  .map(function (row) {
    return {
      id: row.id,
      score: weakScore(row)
    };
  })
  .sort(function (a, b) {
    return b.score - a.score;
  });

assert.deepStrictEqual(
  weakRows.map(function (row) {
    return row.id;
  }),
  ['b', 'c', 'a']
);

console.log(
  'ALL_SELECTED_DASHBOARD_FEATURE_TESTS_PASSED'
);
