/* eslint-disable no-console */
// English reader / daily wheel polish contract test.
// 仅依赖 Node 内置模块，便于在没有浏览器依赖的本地仓库中回归。
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const root = require('node:path').resolve(__dirname, '..');
const englishSource = fs.readFileSync(require('node:path').join(root, 'js/english.js'), 'utf8');
const wheelSource = fs.readFileSync(require('node:path').join(root, 'js/daily-study-wheel.js'), 'utf8');
const cssSource = fs.readFileSync(require('node:path').join(root, 'css/styles.css'), 'utf8');
const dataSource = fs.readFileSync(require('node:path').join(root, 'data/english/english-zhenti-data.js'), 'utf8');

assert.match(englishSource, /function safeRichHtml\(value\)/);
assert.match(englishSource, /DOMPurify\.sanitize/);
assert.match(englishSource, /bilingualMode \? '🙈 隐藏中文译文' : '👁️ 显示中文译文'/);
assert.match(englishSource, /class="ez-reading-hint"/);
assert.match(englishSource, /class="ez-para-number"/);
assert.match(englishSource, /<button class="' \+ optClass \+ '" type="button"/);
assert.match(englishSource, /safeRichHtml\(q\.explanation\)/);
assert.match(englishSource, /safeRichHtml\(curSec\.writing\.analysis\)/);
assert.doesNotMatch(englishSource, /class="ez-exp-content">' \+ q\.explanation/);
assert.match(englishSource, /var isAct = activeQuestionId === q\.id \|\| \(!activeQuestionId && qIdx === 0\)/);

const context = { window: {} };
vm.runInNewContext(dataSource, context, { filename: 'english-zhenti-data.js' });
const papers = context.window.ENGLISH_ZHENTI_PAPERS;
assert.ok(papers && Object.keys(papers).length === 29, '应包含 1998-2026 共 29 年');
let questionCount = 0;
for (const [year, paper] of Object.entries(papers)) {
  assert.ok(Array.isArray(paper.sections) && paper.sections.length > 0, `${year} 缺少 sections`);
  for (const section of paper.sections) {
    assert.ok(Array.isArray(section.paragraphs) && section.paragraphs.length > 0, `${year}/${section.sectionName} 缺少段落`);
    questionCount += Array.isArray(section.questions) ? section.questions.length : 0;
  }
}
assert.equal(questionCount, 1390, '题目总数应保持 1390');

assert.match(wheelSource, /let spinCandidates = null/);
assert.match(wheelSource, /function getDisplayCandidates\(subjectId\)/);
assert.match(wheelSource, /function setCanvasRotation\(deg, animate\)/);
assert.match(wheelSource, /const rotationDelta = normalizeDeg\(finalRest - currentRotation\)/);
assert.match(wheelSource, /window\.requestAnimationFrame\(function \(\)/);
assert.doesNotMatch(wheelSource, /const finalDeg = extraTurns \* 360 \+ finalRest/);
assert.match(cssSource, /backface-visibility: hidden/);
assert.match(cssSource, /transform-origin: 50% 50%/);
assert.match(cssSource, /\.ez-option \{[\s\S]*?width: 100%/);

// 验证“抽中项从可抽取池移除后，显示池仍保留原索引”的纯逻辑不变量。
const all = ['a', 'b', 'c', 'd'];
const active = ['a', 'b', 'c', 'd'];
const picked = 'c';
const remaining = active.filter((id) => id !== picked);
const selectedIndex = all.indexOf(picked);
const activeSet = new Set(remaining);
let insertAt = 0;
for (let i = 0; i < selectedIndex; i += 1) if (activeSet.has(all[i])) insertAt += 1;
remaining.splice(insertAt, 0, picked);
assert.deepEqual(remaining, active, '显示池必须恢复抽中项原有扇区顺序');

console.log('ENGLISH_WHEEL_POLISH_CONTRACT_PASSED');
console.log(`years=${Object.keys(papers).length} questions=${questionCount}`);
