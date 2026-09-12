'use strict';

function hasExplicitNotesMathDelimiter(line) {
  var text = String(line || '').trim();
  if (!text) return false;
  if (/\$\$[\s\S]*\$\$/.test(text)) return true;
  if (/(^|[^\\])\$[^$\n]+\$/.test(text)) return true;
  if (/\\\([\s\S]*\\\)/.test(text)) return true;
  if (/\\\[[\s\S]*\\\]/.test(text)) return true;
  if (/\\begin\{(?:equation\*?|align\*?|alignat\*?|gather\*?|CD)\}/.test(text)) return true;
  return false;
}

function looksLikeBareNotesLatex(line) {
  var text = String(line || '').trim();
  if (!text || hasExplicitNotesMathDelimiter(text)) return false;
  if (/^(?:#{1,6}\s|>|[-+*]\s|\d+[.)]\s|```|~~~|<[^>]+>)/.test(text)) return false;

  var hasChinese = /[\u3400-\u9fff]/.test(text);
  var commands = text.match(/\\[A-Za-z]+/g) || [];
  var strongCommand = /\\(?:frac|dfrac|tfrac|sqrt|sum|prod|int|oint|lim|stackrel|overset|underset|mathcal|mathbb|mathbf|mathrm|operatorname|sin|cos|tan|cot|sec|csc|log|ln|exp|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|pi|rho|sigma|phi|psi|omega|infty|partial|nabla|quad|qquad|cdot|times|pm|mp|leq|geq|neq|approx|sim|to|rightarrow|leftarrow|leftrightarrow|longleftrightarrow|mapsto|left|right)\b/.test(text);
  var mathStructure = /(?:\^|_|=|<=|>=|<|>|\\[A-Za-z]+)/.test(text);

  if (strongCommand && (mathStructure || commands.length >= 2)) return true;
  if (!hasChinese && commands.length >= 1 && /(?:\^|_|=|<|>)/.test(text)) return true;
  if (!hasChinese && commands.length === 0 && /[=<>^_]/.test(text) && /^[A-Za-z0-9\s+\-*/=<>^_{}()[\].,|:]+$/.test(text)) return true;
  return false;
}

function normalizeBareNotesLatex(src) {
  var lines = String(src || '').replace(/\r\n?/g, '\n').split('\n');
  var fenceMarker = '';

  return lines.map(function (line) {
    var trimmed = line.trim();
    var fenceMatch = trimmed.match(/^(```|~~~)/);
    if (fenceMatch) {
      if (!fenceMarker) fenceMarker = fenceMatch[1];
      else if (fenceMarker === fenceMatch[1]) fenceMarker = '';
      return line;
    }
    if (fenceMarker || !trimmed) return line;
    if (looksLikeBareNotesLatex(trimmed)) return '\\[' + trimmed + '\\]';
    return line;
  }).join('\n');
}

function protectNotesMath(src) {
  var spans = [];
  function stash(math) {
    var index = spans.length;
    spans.push(math);
    return '\uE000' + index + '\uE001';
  }

  var text = String(src || '');
  text = text.replace(/\\begin\{(equation\*?|align\*?|alignat\*?|gather\*?|CD)\}[\s\S]*?\\end\{\1\}/g, stash);
  text = text.replace(/\$\$[\s\S]*?\$\$/g, stash);
  text = text.replace(/\\\[[\s\S]*?\\\]/g, stash);
  text = text.replace(/\\\([\s\S]*?\\\)/g, stash);
  text = text.replace(/(^|[^\\])\$([^$\n]+?)\$/gm, function (_, prefix, body) {
    return prefix + stash('$' + body + '$');
  });
  return { text: text, spans: spans };
}

var sample = String.raw`e^{-at}u(t) \stackrel{\mathcal{L}}{\longleftrightarrow} \frac{1}{s+a},\quad \sigma>-a

-e^{-at}u(-t) \stackrel{\mathcal{L}}{\longleftrightarrow} \frac{1}{s+a},\quad \sigma<-a`;

var normalized = normalizeBareNotesLatex(sample);

if (!normalized.includes(String.raw`\[e^{-at}u(t) \stackrel{\mathcal{L}}{\longleftrightarrow} \frac{1}{s+a},\quad \sigma>-a\]`)) {
  throw new Error('first bare LaTeX formula was not normalized');
}

if (!normalized.includes(String.raw`\[-e^{-at}u(-t) \stackrel{\mathcal{L}}{\longleftrightarrow} \frac{1}{s+a},\quad \sigma<-a\]`)) {
  throw new Error('second bare LaTeX formula was not normalized');
}

var protectedMath = protectNotesMath(normalized);
if (protectedMath.spans.length !== 2) {
  throw new Error('expected 2 math spans, got ' + protectedMath.spans.length);
}

if (!protectedMath.spans[0].includes('stackrel')) {
  throw new Error('LaTeX content was damaged');
}

if (normalizeBareNotesLatex('普通中文笔记：拉普拉斯变换').includes('\\[')) {
  throw new Error('plain Chinese text must not be auto-converted to math');
}

if (normalizeBareNotesLatex(String.raw`正文中已有 $x^2$ 公式`).includes('\\[')) {
  throw new Error('explicit inline math must not be double-wrapped');
}

if (!normalizeBareNotesLatex('x^2+y^2=1').includes('\\[')) {
  throw new Error('simple bare equation should be recognized');
}

var fenced = normalizeBareNotesLatex('```latex\n' + String.raw`\frac{1}{2}` + '\n```');
if (fenced.includes('\\[\\frac')) {
  throw new Error('fenced code block must remain code');
}

console.log('NOTES_LATEX_BARE_LINE_LOGIC_TEST_PASSED');
