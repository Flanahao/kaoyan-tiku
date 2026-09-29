'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(ROOT, 'js/app.js'), 'utf8');
const english = fs.readFileSync(path.join(ROOT, 'js/english.js'), 'utf8');
const annotations = fs.readFileSync(path.join(ROOT, 'js/english-annotations.js'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css/styles.css'), 'utf8');

// 1. 文件加载顺序与版本断言
assert.match(html, /<script src="js\/english-annotations\.js\?v=20260929[abc]"><\/script>\s*<script src="js\/english\.js\?v=20260929[abc]"><\/script>/, 'english-annotations 必须在 english.js 之前加载');
assert.match(html, /css\/styles\.css\?v=20260929[abc]/, 'styles.css 版本必须更新');

// 2. 存储键契约
assert.match(annotations, /STORAGE_KEY\s*=\s*['"]user_guest_kaoyan_english_text_annot_v1['"]/, '标注持久化键必须为 user_guest_kaoyan_english_text_annot_v1');
assert.match(annotations, /ENABLED_KEY\s*=\s*['"]user_guest_kaoyan_english_precision_reading_v1['"]/, '精读开关键必须为 user_guest_kaoyan_english_precision_reading_v1');

// 3. 完整备份自动捕获契约
assert.match(app, /payload\.annotations\[k\]\s*=\s*val/, '完整备份导出必须包含 annotations');
assert.match(app, /k\.indexOf\('_annot_'\)\s*!==\s*-1/, 'app.js 完整备份必须通过 _annot_ 自动匹配捕获标注存储');

// 4. English.js 薄集成契约
assert.match(english, /window\.closeEnglishWordPopover\s*=\s*closeWordPopover/, '必须暴露 closeEnglishWordPopover 供标注开始时安全关闭旧查词');
assert.match(english, /function buildEnglishAnnotationScope/, '必须包含 buildEnglishAnnotationScope');
assert.match(english, /function getCurrentSectionAnnotationCount/, '必须包含 getCurrentSectionAnnotationCount');
assert.match(english, /id="ezBtnPrecision"/, 'Toolbar 必须包含精读标注开关按钮');
assert.match(english, /ez-para-en\s+ez-annotation-scope/, '正文必须挂载 ez-annotation-scope');
assert.match(english, /ez-q-stem\s+ez-annotation-scope/, '题干必须挂载 ez-annotation-scope');
assert.match(english, /window\.EnglishAnnotations\.afterRender\(panel\)/, 'render 之后必须调用 EnglishAnnotations.afterRender');
assert.match(english, /function renderReadingFocusWorkspaceV2/, '必须包含 renderReadingFocusWorkspaceV2 双栏刷题渲染');
assert.match(english, /function captureReadingPassageScroll/, '必须包含 captureReadingPassageScroll 滚动位置保存');
assert.match(english, /function restoreReadingPassageScroll/, '必须包含 restoreReadingPassageScroll 滚动位置恢复');

// 5. CSS 样式契约
assert.match(css, /\.ez-annotation-scope/, '必须包含 .ez-annotation-scope');
assert.match(css, /mark\.ez-ann-mark/, '必须包含 mark.ez-ann-mark');
assert.match(css, /\.ez-ann-toolbar/, '必须包含 .ez-ann-toolbar');
assert.match(css, /\.ez-ann-note-pin/, '必须包含 .ez-ann-note-pin');
assert.match(css, /\.ez-ann-note-editor/, '必须包含 .ez-ann-note-editor');
assert.match(css, /\.ez-btn-precision/, '必须包含 .ez-btn-precision');
assert.match(css, /\.ez-reading-focus-shell/, '必须包含 .ez-reading-focus-shell');
assert.match(css, /\.ez-reading-focus-passage/, '必须包含 .ez-reading-focus-passage');
assert.match(css, /\.ez-reading-focus-qa/, '必须包含 .ez-reading-focus-qa');
assert.match(css, /\.ez-reading-qtab/, '必须包含 .ez-reading-qtab');

// 6. 纯算法单元验证：re-anchor 重定位机制
// 测试当文本由于小幅修改而在 offset 偏移时，通过 quote + prefix/suffix 重新锚定
function mockResolveAnnotation(text, ann) {
  if (text.slice(ann.start, ann.end) === ann.quote) {
    return { start: ann.start, end: ann.end };
  }
  var candidate = -1;
  var bestScore = -1;
  var from = 0;
  while (from < text.length) {
    var found = text.indexOf(ann.quote, from);
    if (found === -1) break;
    var score = 0;
    if (ann.prefix && text.slice(Math.max(0, found - ann.prefix.length), found) === ann.prefix) score += 3;
    if (ann.suffix && text.slice(found + ann.quote.length, found + ann.quote.length + ann.suffix.length) === ann.suffix) score += 3;
    score -= Math.abs(found - ann.start) * 0.001;
    if (score > bestScore) {
      bestScore = score;
      candidate = found;
    }
    from = found + 1;
  }
  if (candidate !== -1) {
    return { start: candidate, end: candidate + ann.quote.length };
  }
  return null;
}

const originalText = 'It may be said that the measure of the worth of any social institution is its effect.';
const originalAnn = {
  start: 20,
  end: 70,
  quote: 'the measure of the worth of any social institution',
  prefix: 'It may be said that ',
  suffix: ' is its effect.'
};
assert.deepEqual(mockResolveAnnotation(originalText, originalAnn), { start: 20, end: 70 });

// 前面插入 9 个字符 'PRE_TEXT '
const modifiedText = 'PRE_TEXT It may be said that the measure of the worth of any social institution is its effect.';
const relocated = mockResolveAnnotation(modifiedText, originalAnn);
assert.ok(relocated, '必须能成功重新锚定');
assert.equal(relocated.start, 29);
assert.equal(relocated.end, 79);
assert.equal(modifiedText.slice(relocated.start, relocated.end), originalAnn.quote);

console.log('ENGLISH_ANNOTATIONS_CONTRACT_PASSED');
