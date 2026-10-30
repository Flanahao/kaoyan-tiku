const fs = require('node:fs');
const path = require('node:path');

const root = process.argv[2] || 'D:/考研题库网站';
const assetRoot = path.join(root, '数一题库', '邂逅遗憾');
const output = path.join(root, 'js', 'xiehouyihan-chapters.js');
const subjectOrder = ['高数', '线代', '概率论'];
const subjectCodes = { '高数': 'gs', '线代': 'xd', '概率论': 'gl' };
const vm = require('node:vm');

let previousChapters = [];
if (fs.existsSync(output)) {
  const previousContext = { window: {} };
  vm.runInNewContext(fs.readFileSync(output, 'utf8'), previousContext);
  previousChapters = previousContext.window.XIEHOUYIHAN_CHAPTERS || [];
}
const previousByKey = new Map(previousChapters.map(chapter => [`${chapter.subj}/${chapter.short}`, chapter]));
const usedIds = new Set(previousChapters.map(chapter => chapter.id));
let nextId = previousChapters.length + 1;
let nextNumber = Math.max(0, ...previousChapters.map(chapter => Number(chapter.number) || 0)) + 1;

function newChapterId() {
  let id;
  do {
    id = `xhy_${String(nextId++).padStart(2, '0')}`;
  } while (usedIds.has(id));
  usedIds.add(id);
  return id;
}

function naturalCompare(a, b) {
  return a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' });
}

const chapters = [];
for (const subject of subjectOrder) {
  const subjectDir = path.join(assetRoot, subject);
  if (!fs.existsSync(subjectDir)) continue;
  const chapterDirs = fs.readdirSync(subjectDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort(naturalCompare);

  for (const chapterDir of chapterDirs) {
    const chapterPath = path.join(subjectDir, chapterDir);
    const questions = fs.readdirSync(chapterPath)
      .filter(name => name.endsWith('_question.png'))
      .sort(naturalCompare);
    const availableBases = [];
    for (const filename of questions) {
      const base = filename.slice(0, -'_question.png'.length);
      if (!fs.existsSync(path.join(chapterPath, `${base}_solution.png`))) continue;
      availableBases.push(base);
    }
    const previous = previousByKey.get(`${subject}/${chapterDir}`);
    const availableSet = new Set(availableBases);
    const previousBases = previous ? (previous.fileBases || []).filter(base => availableSet.has(base)) : [];
    const previousSet = new Set(previousBases);
    const fileBases = previousBases.concat(availableBases.filter(base => !previousSet.has(base)));
    const labels = fileBases.map(base => `题 ${base.replace(/^pb_/, '')}`);
    if (!labels.length) continue;
    const chapterNo = (chapterDir.match(/第\s*(\d+)\s*章/) || [])[1] || String(chapters.length + 1);
    chapters.push({
      id: previous ? previous.id : newChapterId(),
      number: previous ? previous.number : nextNumber++,
      name: `邂逅遗憾 - ${subject} - ${chapterDir}`,
      short: chapterDir,
      total: labels.length,
      cols: 5,
      wb: '邂逅遗憾',
      subj: subject,
      relPath: `邂逅遗憾/${subject}/${chapterDir}`,
      labels,
      fileBases
    });
  }
}

fs.writeFileSync(output,
  '// 邂逅遗憾数学题库章节数据（题目图与解析图成对导入）\n' +
  'window.XIEHOUYIHAN_CHAPTERS = ' + JSON.stringify(chapters, null, 2) + ';\n',
  'utf8'
);
console.log(`Generated ${output}: ${chapters.length} chapters, ${chapters.reduce((n, c) => n + c.total, 0)} complete questions.`);
