#!/usr/bin/env node
/**
 * 考研题库 - 综合资源审计工具
 * 
 * 1. 沙箱加载真实 getImgPath()
 * 2. 检查 1000 题前缀 (ex_) 与物理文件
 * 3. 扫描 _solution.png 至 _solution_20.png 切片
 * 4. 检测切片断层 (brokenSequence)
 * 5. 校验 SOLUTION_MANIFEST 是否与文件系统完全一致
 * 6. 区分 expectedMissing (已知约 132 个) 与 unexpectedMissing (未登记缺失)
 * 7. 支持 --json <filepath> 输出报告，异常时返回非零退出码
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');

// 解析 CLI 参数
let jsonOutPath = null;
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--json' && args[i + 1]) {
    jsonOutPath = path.resolve(rootDir, args[i + 1]);
    i++;
  }
}

// 加载已知预期缺失资源清单
let expectedMissingSet = new Set();
const expectedFile = path.join(__dirname, 'expected-missing.json');
if (fs.existsSync(expectedFile)) {
  try {
    const list = JSON.parse(fs.readFileSync(expectedFile, 'utf8'));
    if (Array.isArray(list)) expectedMissingSet = new Set(list);
  } catch (e) {}
}

// 构造沙箱加载章节定义与 manifest
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
  const scriptCode = fs.readFileSync(fullPath, 'utf8');
  vm.runInContext(scriptCode, context, { filename: relPath });
}

runScript('js/lilin880-chapters.js');
runScript('js/professional-chapters.js');
runScript('js/solution-manifest.js');
runScript('js/chapters.js');

const subjects = sandbox.SUBJECTS;
const manifest = sandbox.window.SOLUTION_MANIFEST || {};

if (!Array.isArray(subjects)) {
  console.error('错误: 沙箱中未检测到 SUBJECTS 数组');
  process.exit(1);
}

const auditResult = {
  checked: 0,
  wrongPrefix: 0,
  expectedMissing: 0,
  unexpectedMissing: 0,
  brokenSequence: 0,
  manifestMismatches: 0,
  summary: {
    totalQuestions: 0,
    missingQuestion: 0,
    missingSolution: 0,
    maxSolutionSliceFound: 1
  },
  details: {
    unexpectedMissingList: [],
    brokenSequenceList: [],
    manifestMismatchList: [],
    wrongPrefixList: []
  }
};

subjects.forEach(subj => {
  const isProfessional = subj.id === 'zhuanye' || subj.id === 'professional';

  subj.chapters.forEach(ch => {
    const is1000 = ch.wb === '1000题' || ch.statsWb === '1000题';

    (ch.labels || []).forEach(label => {
      auditResult.summary.totalQuestions++;
      auditResult.checked++;

      const imgBase = subj.getImgPath(ch, label);

      // 1000 题前缀检查
      if (is1000) {
        const baseFilename = path.basename(imgBase);
        if (!baseFilename.startsWith('ex_')) {
          auditResult.wrongPrefix++;
          auditResult.details.wrongPrefixList.push({
            chapterId: ch.id,
            label: label,
            imgBase: imgBase
          });
        }
      }

      // 题目图片检查
      const qRel = imgBase + (isProfessional ? '.png' : '_question.png');
      const qAbs = path.join(rootDir, qRel);
      if (!fs.existsSync(qAbs)) {
        auditResult.summary.missingQuestion++;
        if (expectedMissingSet.has(qRel)) {
          auditResult.expectedMissing++;
        } else {
          auditResult.unexpectedMissing++;
          auditResult.details.unexpectedMissingList.push({ type: 'question', path: qRel });
        }
      }

      // 专业课无解析图，跳过解析检查
      if (isProfessional) return;

      // 解析图片分片检查 (_solution.png 至 _solution_20.png)
      const foundSlices = [];
      let highestFound = 0;

      // 检查 _solution.png (即切片 1)
      const s1Rel = imgBase + '_solution.png';
      const s1Abs = path.join(rootDir, s1Rel);
      const s1Exists = fs.existsSync(s1Abs);
      if (s1Exists) {
        foundSlices.push('_solution.png');
        highestFound = 1;
      } else {
        auditResult.summary.missingSolution++;
        if (expectedMissingSet.has(s1Rel)) {
          auditResult.expectedMissing++;
        } else {
          auditResult.unexpectedMissing++;
          auditResult.details.unexpectedMissingList.push({ type: 'solution', path: s1Rel });
        }
      }

      // 检查 _solution_2.png 到 _solution_20.png
      for (let n = 2; n <= 20; n++) {
        const snRel = `${imgBase}_solution_${n}.png`;
        const snAbs = path.join(rootDir, snRel);
        if (fs.existsSync(snAbs)) {
          foundSlices.push(`_solution_${n}.png`);
          if (n > highestFound) highestFound = n;
        }
      }

      if (highestFound > auditResult.summary.maxSolutionSliceFound) {
        auditResult.summary.maxSolutionSliceFound = highestFound;
      }

      // 断层检查: 必须从 1 到 highestFound 连续存在
      if (highestFound > 1) {
        if (!s1Exists) {
          auditResult.brokenSequence++;
          auditResult.details.brokenSequenceList.push({
            imgBase: imgBase,
            reason: '缺少 _solution.png 但存在后续分片'
          });
        }
        for (let k = 2; k <= highestFound; k++) {
          const checkSlice = `_solution_${k}.png`;
          if (!foundSlices.includes(checkSlice)) {
            auditResult.brokenSequence++;
            auditResult.details.brokenSequenceList.push({
              imgBase: imgBase,
              reason: `缺少 _solution_${k}.png 但存在分片至 ${highestFound}`
            });
          }
        }
      }

      // Manifest 一致性检查
      const manifestSlices = manifest[imgBase] || [];
      if (foundSlices.length > 0) {
        const mStr = manifestSlices.slice().sort().join(',');
        const fStr = foundSlices.slice().sort().join(',');
        if (mStr !== fStr) {
          auditResult.manifestMismatches++;
          auditResult.details.manifestMismatchList.push({
            imgBase: imgBase,
            manifest: manifestSlices,
            actual: foundSlices
          });
        }
      }
    });
  });
});

console.log('================ 资源审计报告 (Audit Summary) ================');
console.log(`总扫描题目: ${auditResult.summary.totalQuestions}`);
console.log(`错误前缀 (wrongPrefix): ${auditResult.wrongPrefix}`);
console.log(`预期缺失 (expectedMissing): ${auditResult.expectedMissing}`);
console.log(`非预期缺失 (unexpectedMissing): ${auditResult.unexpectedMissing}`);
console.log(`分片断层 (brokenSequence): ${auditResult.brokenSequence}`);
console.log(`Manifest 不匹配 (manifestMismatches): ${auditResult.manifestMismatches}`);
console.log(`最大解析分片编号 (maxSlice): ${auditResult.summary.maxSolutionSliceFound}`);
console.log('===============================================================');

// 输出 JSON 报告文件
const outTarget = jsonOutPath || path.join(rootDir, 'audit-report.json');
const outDir = path.dirname(outTarget);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outTarget, JSON.stringify(auditResult, null, 2), 'utf8');
console.log(`审计报告已保存至: ${outTarget}`);

if (
  auditResult.wrongPrefix > 0 ||
  auditResult.unexpectedMissing > 0 ||
  auditResult.brokenSequence > 0 ||
  auditResult.manifestMismatches > 0
) {
  console.error('❌ 审计失败：检测到错误前缀、非预期缺失、编号断层或 Manifest 不一致！');
  process.exit(1);
} else {
  console.log('✅ 资源审计全部通过：0 错误前缀，0 非预期缺失，0 断层，Manifest 100% 匹配！');
  process.exit(0);
}
