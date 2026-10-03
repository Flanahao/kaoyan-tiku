const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

const wheelCode = fs.readFileSync('js/math-zhenti-wrong-wheel.js', 'utf8');
const chaptersCode = fs.readFileSync('js/math-zhenti-chapters.js', 'utf8');

console.log('====================================================');
console.log('🧪 Running scripts/test-math-zhenti-wrong-wheel.js');
console.log('====================================================');

// --- Step 1: normalizeYears 测试 ---
console.log('--- Step 1: normalizeYears 规范化与过滤测试 ---');
const context1 = { console, setTimeout, clearTimeout };
vm.runInNewContext(wheelCode, context1);
const { normalizeYears, chooseIndex, create, readYearRowsFromCurrentApp } = context1.MathZhentiWrongWheel;

assert.deepEqual(normalizeYears(null), []);
assert.deepEqual(normalizeYears(undefined), []);
assert.deepEqual(normalizeYears('not an array'), []);
assert.deepEqual(normalizeYears([]), []);

const sampleRows = [
  { year: 2020, chapterId: 's1_zt_2020', wrong: 2, vague: 1 },
  { year: 1986, chapterId: 's1_zt_1986', wrong: 1, vague: 0 }, // 超出下界 1987
  { year: 2027, chapterId: 's1_zt_2027', wrong: 1, vague: 0 }, // 超出上界 2026
  { year: 2019, chapterId: '', wrong: 3, vague: 0 },           // 缺少 chapterId
  { year: 2018, chapterId: 's1_zt_2018', wrong: 0, vague: 0 }, // 0 错题
  { year: 2017, chapterId: 's1_zt_2017', wrong: -1, vague: 1 },// 包含负数
  { year: 2020, chapterId: 's1_zt_2020_dup', wrong: 5, vague: 5 }, // 重复年份
  { year: 1995, chapterId: 's1_zt_1995', wrong: 0, vague: 3 }, // 仅模糊
  { year: 1987, chapterId: 's1_zt_1987', wrong: 4, vague: 0 }, // 边界年份 1987
  { year: 2026, chapterId: 's1_zt_2026', wrong: 1, vague: 0 }, // 边界年份 2026
];

const normalized = normalizeYears(sampleRows);
assert.equal(normalized.length, 4, '应只保留 1987, 1995, 2020, 2026 四个年份');
assert.deepEqual(normalized.map(r => r.year), [1987, 1995, 2020, 2026], '必须按年份从小到大排序');
assert.equal(normalized[2].chapterId, 's1_zt_2020', '重复年份应保留第一个有效条目的 chapterId');
assert.equal(normalized[2].wrong, 2);
assert.equal(normalized[2].vague, 1);
assert.equal(normalized[1].vague, 3);
console.log('✅ Step 1 PASS: normalizeYears 规范化与过滤全部正确');

// --- Step 2: chooseIndex 测试 ---
console.log('--- Step 2: chooseIndex 随机抽取测试 ---');
assert.equal(chooseIndex(0), -1);
assert.equal(chooseIndex(-3), -1);
assert.equal(chooseIndex('invalid'), -1);

// 边界抽样
assert.equal(chooseIndex(1, () => 0), 0);
assert.equal(chooseIndex(1, () => 0.999), 0);
assert.equal(chooseIndex(5, () => 0), 0);
assert.equal(chooseIndex(5, () => 0.199), 0);
assert.equal(chooseIndex(5, () => 0.2), 1);
assert.equal(chooseIndex(5, () => 0.999), 4);

// 异常测试
assert.throws(() => chooseIndex(5, () => NaN), /随机数无效/);
assert.throws(() => chooseIndex(5, () => Infinity), /随机数无效/);

// 等概率模拟（10000 次抽取 4 个年份）
const counts = [0, 0, 0, 0];
for (let i = 0; i < 10000; i++) {
  const idx = chooseIndex(4, Math.random);
  counts[idx]++;
}
counts.forEach((c, idx) => {
  assert.ok(c > 2000 && c < 3000, `等概率抽取偏差过大: index ${idx} 出现 ${c} 次`);
});
console.log('✅ Step 2 PASS: chooseIndex 随机分布与边界测试全部正确');

// --- Step 3: readYearRowsFromCurrentApp 测试 ---
console.log('--- Step 3: readYearRowsFromCurrentApp 仓库数据与掌握度读取测试 ---');
const contextApp = { console, window: {} };
contextApp.window = contextApp;
vm.runInNewContext(chaptersCode, contextApp);
vm.runInNewContext(wheelCode, contextApp);

assert.ok(Array.isArray(contextApp.window.MATH_ZHENTI_CHAPTERS), '必须存在真题章节数据');
assert.equal(contextApp.window.MATH_ZHENTI_CHAPTERS.length, 40, '真题章节数量应为 40 (1987-2026)');

// 3.1 零错题状态
let rows = contextApp.MathZhentiWrongWheel.readYearRowsFromCurrentApp();
assert.deepEqual(rows, [], '在未标记任何错题时，候选应为空');

// 3.2 模拟 Bridge 存在的情况
contextApp.DailyStudyWheelBridge = {
  getChapterMistakes: (subjectId, chapterId) => {
    assert.equal(subjectId, 'shu1', '必须传入 shu1 科目');
    if (chapterId === 's1_zt_2015') return { wrong: 3, vague: 2, totalMistakes: 5 };
    if (chapterId === 's1_zt_2021') return { wrong: 1, vague: 0, totalMistakes: 1 };
    return { wrong: 0, vague: 0, totalMistakes: 0 };
  }
};

rows = contextApp.MathZhentiWrongWheel.readYearRowsFromCurrentApp();
assert.equal(rows.length, 2, '应准确过滤出 2 个有错题的年份');
assert.deepEqual(rows[0], { year: 2015, chapterId: 's1_zt_2015', wrong: 3, vague: 2 });
assert.deepEqual(rows[1], { year: 2021, chapterId: 's1_zt_2021', wrong: 1, vague: 0 });

// 3.3 模拟纯 LocalStorage 兼容降级模式
delete contextApp.DailyStudyWheelBridge;
const store = {};
contextApp.localStorage = {
  getItem: k => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); }
};
contextApp.userStoragePrefix = () => 'user_guest_';
// 在 2024 年第 1 题标 wrong，第 2 题标 rusty (应视为 vague)
store['user_guest_s1_zt_2024_s1_status'] = JSON.stringify({
  0: 'wrong',
  1: 'rusty',
  2: 'proficient'
});

rows = contextApp.MathZhentiWrongWheel.readYearRowsFromCurrentApp();
assert.equal(rows.length, 1);
assert.deepEqual(rows[0], { year: 2024, chapterId: 's1_zt_2024', wrong: 1, vague: 1 });
console.log('✅ Step 3 PASS: readYearRowsFromCurrentApp 掌握度读取与五级状态语义映射正确');

// --- Step 4: DOM 与交互生命周期测试 ---
console.log('--- Step 4: MathZhentiWrongWheel 实例创建与生命周期交互测试 ---');
class MockElement {
  constructor(tag) {
    this.tagName = (tag || 'div').toUpperCase();
    this.children = [];
    this.attributes = {};
    this.style = {};
    this.hidden = false;
    this.textContent = '';
    this._listeners = {};
    this.disabled = false;
  }
  set innerHTML(html) {
    this._innerHTML = html;
    // 粗粒度解析出子元素
    const matches = [...html.matchAll(/class="([^"]+)"/g)];
    matches.forEach(m => {
      const cls = m[1].split(' ')[0];
      const el = new MockElement(cls.includes('canvas') ? 'canvas' : 'div');
      el.className = m[1];
      this.children.push(el);
    });
  }
  get innerHTML() { return this._innerHTML || ''; }
  appendChild(child) {
    this.children.push(child);
    child.parentNode = this;
    return child;
  }
  addEventListener(event, fn) {
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(fn);
  }
  dispatch(event, arg) {
    (this._listeners[event] || []).forEach(fn => fn(arg || { target: this }));
  }
  querySelector(selector) {
    if (selector.startsWith('.')) {
      const cls = selector.slice(1);
      return this.children.find(c => c.className && c.className.includes(cls)) || null;
    }
    return null;
  }
  getContext(type) {
    return {
      clearRect() {},
      beginPath() {},
      arc() {},
      fill() {},
      moveTo() {},
      closePath() {},
      stroke() {},
      save() {},
      translate() {},
      rotate() {},
      fillText() {},
      restore() {}
    };
  }
}

const mockDoc = {
  body: new MockElement('body'),
  createElement: tag => new MockElement(tag),
  addEventListener() {}
};

// 4.1 参数校验
assert.throws(() => create({}), /必须提供 getYears 和 openWrongChapter/);

// 4.2 零错题空状态测试
let reviewCalled = null;
const wheelInstance = create({
  document: mockDoc,
  mount: mockDoc.body,
  getYears: async () => [],
  openWrongChapter: (subj, ch, mode) => { reviewCalled = { subj, ch, mode }; },
  random: () => 0
});

const overlay = mockDoc.body.children[0];
assert.ok(overlay, 'overlay 必须挂载至 mount');
assert.equal(overlay.hidden, true, '初始时必须隐藏');

const spinBtn = overlay.querySelector('.mzw-spin');
const reviewBtn = overlay.querySelector('.mzw-review');
const resultEl = overlay.querySelector('.mzw-result');
const closeBtn = overlay.querySelector('.mzw-close');

// 执行 open() 空状态
let openPromise = wheelInstance.open();
assert.equal(overlay.hidden, false, 'open() 后必须显示');
assert.equal(resultEl.textContent, '正在读取真题错题…');

openPromise.then(() => {
  assert.equal(spinBtn.disabled, true, '零候选时转动按钮必须禁用');
  assert.equal(reviewBtn.disabled, true, '零候选时复习按钮必须禁用');
  assert.equal(resultEl.textContent, '暂无可复习的真题错题');

  // 4.3 存在错题年份测试
  const activeInstance = create({
    document: mockDoc,
    mount: mockDoc.body,
    getYears: async () => [
      { year: 2020, chapterId: 's1_zt_2020', wrong: 2, vague: 1 }
    ],
    openWrongChapter: (subj, ch, mode) => { reviewCalled = { subj, ch, mode }; },
    random: () => 0
  });

  const activeOverlay = mockDoc.body.children[1];
  const aSpinBtn = activeOverlay.querySelector('.mzw-spin');
  const aReviewBtn = activeOverlay.querySelector('.mzw-review');
  const aResultEl = activeOverlay.querySelector('.mzw-result');

  activeInstance.open().then(() => {
    assert.equal(aSpinBtn.disabled, false, '有错题时转动按钮必须启用');
    assert.equal(aReviewBtn.disabled, true, '转动前复习按钮必须禁用');
    assert.equal(aResultEl.textContent, '当前 1 个年份有错题，可开始抽取');

    // 触发转动
    aSpinBtn.dispatch('click');
    assert.equal(aSpinBtn.disabled, true, '转动中转动按钮必须禁用');
    assert.equal(aResultEl.textContent, '转盘转动中…');
    assert.equal(activeInstance.isSpinning(), true);

    // 模拟动画完成
    setTimeout(() => {
      assert.equal(activeInstance.isSpinning(), false);
      assert.equal(aSpinBtn.disabled, false);
      assert.equal(aReviewBtn.disabled, false);
      assert.equal(aResultEl.textContent, '抽中 2020 年：不会 2 题，模糊 1 题');

      // 触发复习
      aReviewBtn.dispatch('click');
      assert.deepEqual(reviewCalled, {
        subj: 'shu1',
        ch: 's1_zt_2020',
        mode: 'mistakes'
      }, '复习按钮必须调用 openWrongChapter 且携带真实章节 ID 和 mistakes 模式');

      console.log('✅ Step 4 PASS: MathZhentiWrongWheel 实例创建、抽中结果、按钮状态与跳转回调全部正确');
      console.log('====================================================');
      console.log('🎉 ALL UNIT TESTS PASSED (100%)!');
      console.log('====================================================');
    }, 4600);
  });
});
