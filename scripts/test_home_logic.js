const fs = require('fs');
const path = require('path');
const vm = require('vm');

function el() { return { textContent: '', style: {}, clickCalled: false, click(){ this.clickCalled = true; } }; }
const ids = {
  homeOverallPct: el(), homeDoneText: el(), homeMasteredText: el(), homeVagueText: el(), homeWrongText: el(), homeOverallDonut: el()
};
const selectors = {};
for (const key of ['math','major','english']) {
  selectors[`[data-progress-pct="${key}"]`] = el();
  selectors[`[data-progress-meta="${key}"]`] = el();
  selectors[`[data-progress-bar="${key}"]`] = el();
}
for (const key of ['math','major','english','politics']) selectors[`[data-module="${key}"]`] = el();

let domReady;
const document = {
  readyState: 'loading',
  getElementById(id){ return ids[id] || null; },
  querySelector(sel){ return selectors[sel] || null; },
  addEventListener(type, cb){ if (type === 'DOMContentLoaded') domReady = cb; }
};
const local = new Map([['user_guest_kaoyan_english_vocabulary_v2','{}']]);
const windowObj = {
  StudyAnalytics: {
    getSubjectTotals(){ return {
      all:{total:12866,done:1104,mastered:359,vague:279,wrong:466,unmarked:11762},
      math:{total:8852,done:838,mastered:298,vague:219,wrong:321,unmarked:8014},
      major:{total:1904,done:261,mastered:61,vague:55,wrong:145,unmarked:1643},
      english:{total:2110,done:5,mastered:0,vague:5,wrong:0,unmarked:2105}
    }; }
  },
  localStorage: { getItem(k){ return local.has(k) ? local.get(k) : null; } },
  addEventListener(){}
};
const context = { window: windowObj, document, console, Array, Number, Math, String };
vm.createContext(context);
const homeJs = fs.readFileSync(path.resolve(__dirname, '../js/home.js'), 'utf8');
vm.runInContext(homeJs, context);
if (!domReady) throw new Error('DOMContentLoaded handler not registered');
domReady();

const checks = [
  ['overall pct', ids.homeOverallPct.textContent === '9%'],
  ['overall marked', ids.homeDoneText.textContent === '1,104 / 12,866'],
  ['mastered', ids.homeMasteredText.textContent === '359 项'],
  ['math pct', selectors['[data-progress-pct="math"]'].textContent === '9%'],
  ['major pct', selectors['[data-progress-pct="major"]'].textContent === '14%'],
  ['english pct', selectors['[data-progress-pct="english"]'].textContent === '0%'],
  ['math bar', selectors['[data-progress-bar="math"]'].style.width === '9%'],
  ['donut', String(ids.homeOverallDonut.style.background).startsWith('conic-gradient(')]
];
for (const [name, ok] of checks) {
  console.log((ok ? 'PASS' : 'FAIL') + ' | ' + name);
  if (!ok) process.exitCode = 1;
}
