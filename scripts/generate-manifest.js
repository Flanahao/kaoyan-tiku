#!/usr/bin/env node
/**
 * 考研题库 - 解析图片资源 Manifest 生成器
 * 
 * 扫描所有题目对应的真实解析切片 (_solution.png, _solution_2.png ... _solution_20.png)，
 * 生成真实文件名数组映射: { [basePath]: ["_solution.png", "_solution_2.png"] }
 * 保证运行时精准按需加载，彻底杜绝 404 探测请求。
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');

// 构造沙箱加载章节数据
const sandbox = {
  window: {},
  document: { addEventListener: () => {}, removeEventListener: () => {} },
  console: console,
  Set: Set, Map: Map, Array: Array, Object: Object, String: String, Number: Number, Boolean: Boolean, Date: Date, Math: Math, JSON: JSON
};
sandbox.window = sandbox;
const context = vm.createContext(sandbox);

function runScript(relPath) {
  const fullPath = path.join(rootDir, relPath);
  const scriptContent = fs.readFileSync(fullPath, 'utf8');
  vm.runInContext(scriptContent, context, { filename: relPath });
}

runScript('js/lilin880-chapters.js');
runScript('js/professional-chapters.js');
runScript('js/chapters.js');

const subjects = sandbox.SUBJECTS;
if (!Array.isArray(subjects)) {
  console.error('错误: 沙箱中未检测到 SUBJECTS');
  process.exit(1);
}

const manifest = {};
let totalSlices = 0;
let totalQuestionsWithSolution = 0;

subjects.forEach(subj => {
  if (subj.id === 'zhuanye' || subj.id === 'professional') return;

  subj.chapters.forEach(ch => {
    (ch.labels || []).forEach(label => {
      const imgBase = subj.getImgPath(ch, label);
      const slices = [];

      // 检查 _solution.png
      const s1Path = path.join(rootDir, imgBase + '_solution.png');
      if (fs.existsSync(s1Path)) {
        slices.push('_solution.png');
      }

      // 检查 _solution_2.png 到 _solution_20.png
      for (let n = 2; n <= 20; n++) {
        const snPath = path.join(rootDir, `${imgBase}_solution_${n}.png`);
        if (fs.existsSync(snPath)) {
          slices.push(`_solution_${n}.png`);
        }
      }

      if (slices.length > 0) {
        manifest[imgBase] = slices;
        totalQuestionsWithSolution++;
        totalSlices += slices.length;
      }
    });
  });
});

const outPath = path.join(rootDir, 'js', 'solution-manifest.js');
const fileContent = '/* 自动生成的考研题库解析图片资源 Manifest */\n' +
  'window.SOLUTION_MANIFEST = ' + JSON.stringify(manifest, null, 2) + ';\n';

fs.writeFileSync(outPath, fileContent, 'utf8');
console.log(`✅ 成功生成解析 Manifest: ${outPath}`);
console.log(`   包含题量: ${totalQuestionsWithSolution}, 总切片文件数: ${totalSlices}`);
