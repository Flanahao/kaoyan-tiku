/* eslint-disable no-console */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const wheelSource = read('js/daily-wrong-wheel.js');
const appSource = read('js/app.js');
const englishSource = read('js/english.js');
const htmlSource = read('index.html');
const cssSource = read('css/styles.css');
const crawlerSource = read('scripts/crawl_english_papers.py');

assert.match(appSource, /applyFilters\(\['wrong', 'vague'\]\)/, '错题入口必须联合筛选不会与模糊/困难');
assert.match(englishSource, /curSec\.type === 'translation'/, '翻译题必须走专属渲染分支');
assert.match(englishSource, /visibleOptions/, '空选项必须在渲染前过滤');
assert.doesNotMatch(htmlSource, /class="wrongbook-top-bar" style=/, '错题本顶栏不应继续依赖内联布局');
assert.match(cssSource, /grid-template-columns:\s*minmax\(150px, 1fr\) auto minmax\(150px, 1fr\)/, 'Header 必须使用三列 Grid');
assert.match(cssSource, /@media \(max-width: 620px\)[\s\S]*?\.wrongbook-top-bar[\s\S]*?flex-direction:\s*column/, '错题本顶栏必须有移动端纵向布局');
assert.match(crawlerSource, /___\(\{name\}\)___/, '爬虫必须保留数字填空 token');
assert.match(crawlerSource, /if sec_type == 'translation':\s*\n\s*opts = \[\]/, '爬虫必须移除翻译题伪选项');

// 直接执行真实转盘源码，验证“完成第1轮 -> 生成第2轮 -> 撤销”是原子回滚。
const storage = new Map();
const today = (() => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
})();
const dailyKey = 'user_guest_daily_wrong_wheel_daily_v1';
const historyKey = 'user_guest_daily_wrong_wheel_history_v1';
const undoKey = 'user_guest_daily_wrong_wheel_undo_v1';

storage.set(dailyKey, JSON.stringify({
  schemaVersion: 1,
  date: today,
  math: [
    { round: 1, chapterId: 'ch1', status: 'completed', completedAt: today, scope: 'all' },
    { round: 2, chapterId: 'ch2', status: 'active', scope: 'all' }
  ],
  major: []
}));
storage.set(historyKey, JSON.stringify({
  schemaVersion: 1,
  math: { round: 1, completed: [{ chapterId: 'ch1', wheelActionId: 'a1', scope: 'all' }] },
  major: { round: 1, completed: [] }
}));
storage.set(undoKey, JSON.stringify({
  math: [{
    action: 'complete-round', actionId: 'a1', roundNumber: 1, generatedRoundNumber: 2,
    chapterId: 'ch1', previousRoundStatus: 'active', completionAddedByThisAction: true
  }],
  major: []
}));

const documentMock = {
  readyState: 'complete',
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};
const windowMock = {
  document: documentMock,
  localStorage: {
    getItem: (key) => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value))
  },
  addEventListener: () => {},
  clearTimeout: () => {},
  setTimeout: () => 1,
  requestAnimationFrame: (fn) => fn(),
  devicePixelRatio: 1,
  DailyWrongWheelBridge: {
    getStoragePrefix: () => 'user_guest_',
    getCandidates: () => [
      { chapterId: 'ch1', name: '第一章', total: 10 },
      { chapterId: 'ch2', name: '第二章', total: 10 }
    ],
    getChapterMistakes: () => ({ wrong: 1, vague: 1, totalMistakes: 2, done: 2, total: 10 })
  }
};
windowMock.window = windowMock;
vm.runInNewContext(wheelSource, {
  window: windowMock,
  document: documentMock,
  console,
  Date,
  Math,
  Set,
  Uint32Array,
  alert: () => {}
});

assert.equal(windowMock.DailyWrongWheel.undoLastRound('shu1'), true);
const afterDaily = JSON.parse(storage.get(dailyKey));
const afterHistory = JSON.parse(storage.get(historyKey));
assert.equal(afterDaily.math.length, 1, '撤销必须删除由完成动作生成的下一轮');
assert.equal(afterDaily.math[0].status, 'active', '被撤销轮次必须恢复为唯一 active 轮次');
assert.equal(afterHistory.math.completed.length, 0, '撤销必须同步回滚完成池');

console.log('PASS: latest polish fixes');
