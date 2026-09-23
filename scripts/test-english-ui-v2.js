/* eslint-disable no-console */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const englishSource = read('js/english.js');
const cssSource = read('css/styles.css');
const crawlerSource = read('scripts/crawl_english_papers.py');
const dataSource = read('data/english/english-zhenti-data.js');

assert.match(englishSource, /STORAGE_ZHENTI_DRAFTS_KEY/, '翻译与写作草稿必须持久化');
assert.match(englishSource, /renderZhentiModuleV2\(\)/, '真题入口必须切换到 V2 渲染器');
assert.match(englishSource, /section\.type === 'writingA' \|\| section\.type === 'writingB'[\s\S]*?renderWritingV2\(section\)[\s\S]*?else \{[\s\S]*?renderPassageV2\(section\)/, '写作不能再同时渲染通用文章卡和重复范文');
assert.match(englishSource, /renderPartBLeadV2/, '新题型必须使用独立作答顺序区');
assert.match(englishSource, /ez-answer-textarea/, '翻译题必须提供独立译文输入区');
assert.match(englishSource, /ez-writing-textarea/, '写作题必须提供整篇草稿区');
assert.match(englishSource, /escapeInlineHtml\(other\)/, '单词间分隔符必须使用保留空白的转义函数');
assert.doesNotMatch(englishSource, /return escapeHtml\(other\)/, '禁止再次用会 trim 的 escapeHtml 渲染单词间空格');

const normalizeMatch = englishSource.match(/function normalizeExamText\(value\) \{[\s\S]*?\n  \}/);
assert.ok(normalizeMatch, '必须保留 normalizeExamText');
const normalizeContext = {};
vm.runInNewContext(`${normalizeMatch[0]}\nthis.normalizeExamText = normalizeExamText;`, normalizeContext);
assert.equal(
  normalizeContext.normalizeExamText('Advances  in AI.?  Why??'),
  'Advances in AI. Why?',
  '文本规范化必须保留词间空格并清理爬虫重复标点'
);

const inlineMatch = englishSource.match(/function escapeInlineHtml\(value\) \{[\s\S]*?\n  \}/);
const clickableMatch = englishSource.match(/function renderClickableWords\(text\) \{[\s\S]*?\n  \}/);
assert.ok(inlineMatch && clickableMatch, '必须能提取正文分词函数');
const clickContext = {
  escapeHtml: (value) => String(value == null ? '' : value).trim(),
  normalizeExamText: normalizeContext.normalizeExamText
};
vm.runInNewContext(`${inlineMatch[0]}\n${clickableMatch[0]}\nthis.renderClickableWords = renderClickableWords;`, clickContext);
const rendered = clickContext.renderClickableWords('For thousands of years, donkeys mattered.');
assert.match(rendered, /<\/span> <span/, '相邻英文单词的 span 之间必须保留空格文本节点');
assert.equal(rendered.replace(/<[^>]+>/g, ''), 'For thousands of years, donkeys mattered.');

assert.match(cssSource, /英语真题刷题工作台 V2/);
assert.match(cssSource, /\.ez-question-list--cloze\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2/);
assert.match(cssSource, /\.ez-options--partb/);
assert.match(cssSource, /\.ez-answer-textarea/);
assert.match(cssSource, /\.ez-writing-workspace/);
assert.match(cssSource, /\.ez-word\s*\{[\s\S]*?display:\s*inline;[\s\S]*?margin:\s*0;/);
assert.match(cssSource, /@media \(max-width: 720px\)/);

assert.match(crawlerSource, /replace\('\.\?', '\.'\)\.replace\('!\?', '!'\)\.replace\('\?\?', '\?'\)/, '爬虫必须清理重复句末标点');

const dataContext = { window: {} };
vm.runInNewContext(dataSource, dataContext, { filename: 'english-zhenti-data.js', timeout: 10000 });
const papers = dataContext.window.ENGLISH_ZHENTI_PAPERS;
assert.equal(Object.keys(papers).length, 29, '应保留 1998-2026 共 29 年数据');

let questionCount = 0;
let translationCount = 0;
let writingCount = 0;
let partBCount = 0;
for (const paper of Object.values(papers)) {
  for (const section of paper.sections || []) {
    questionCount += (section.questions || []).length;
    if (section.type === 'translation') {
      translationCount += 1;
      for (const question of section.questions || []) {
        assert.equal((question.options || []).length, 0, `${paper.year} 翻译题不应含伪选择项`);
      }
    }
    if (section.type === 'writingA' || section.type === 'writingB') {
      writingCount += 1;
      assert.ok(section.writing && Array.isArray(section.writing.sampleEssay), `${paper.year} 写作缺少参考范文`);
    }
    if (section.type === 'partB') partBCount += 1;
  }
}

assert.equal(questionCount, 1390, 'UI 重构不能改变题目总数');
assert.equal(translationCount, 29, '应覆盖 29 年翻译');
assert.equal(writingCount, 51, '应覆盖全部写作 A/B');
assert.equal(partBCount, 22, '应覆盖 2005-2026 新题型');

console.log('PASS: English practice UI V2 contracts');
console.log(`years=${Object.keys(papers).length} questions=${questionCount} translation=${translationCount} writing=${writingCount} partB=${partBCount}`);
