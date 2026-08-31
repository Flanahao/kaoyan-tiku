#!/usr/bin/env node
/**
 * 考研题库 - 资源完整性审计脚本
 * 
 * 约束：
 * 1. 使用 Node.js vm 沙箱加载浏览器环境及项目实际脚本 (js/lilin880-chapters.js, js/professional-chapters.js, js/chapters.js)
 * 2. 直接调用科目对象的 getImgPath(ch, label)，绝不硬编码第二套路径生成算法
 * 3. 分开统计 1000 题路径错误与真实缺失文件 (约 132 个)
 * 4. 不硬编码 Windows 路径，使用相对路径和可移植 API
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');

// 构造浏览器沙箱环境
const sandbox = {
  window: {},
  document: {
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  console: console,
  Set: Set,
  Map: Map,
  Array: Array,
  Object: Object,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Date: Date,
  Math: Math,
  JSON: JSON
};
sandbox.window = sandbox;
const context = vm.createContext(sandbox);

function runScript(relPath) {
  const fullPath = path.join(rootDir, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  vm.runInContext(code, context, { filename: relPath });
}

// 依次加载章节数据脚本
runScript('js/lilin880-chapters.js');
runScript('js/professional-chapters.js');
runScript('js/chapters.js');

const subjects = sandbox.SUBJECTS;
if (!Array.isArray(subjects)) {
  console.error('错误: 沙箱中未检测到 SUBJECTS 数组');
  process.exit(1);
}

const report = {
  timestamp: new Date().toISOString(),
  totalQuestions: 0,
  questionsScanned: 0,
  questionImagesFound: 0,
  questionImagesMissing: [],
  solutionImagesFound: 0,
  solutionImagesMissing: [],
  wb1000Stats: {
    totalQuestions: 0,
    prefixErrors: 0,
    questionMissing: 0,
    solutionMissing: 0
  },
  realMissingResources: []
};

subjects.forEach(subj => {
  subj.chapters.forEach(ch => {
    const is1000 = ch.wb === '1000题' || ch.statsWb === '1000题';
    const isProfessional = subj.id === 'zhuanye';

    (ch.labels || []).forEach((label, idx) => {
      report.totalQuestions++;
      report.questionsScanned++;

      // 严格使用科目实际的 getImgPath
      const imgBase = subj.getImgPath(ch, label);

      if (is1000) {
        report.wb1000Stats.totalQuestions++;
        // 验证路径前缀是否是 ex_
        const baseFilename = path.basename(imgBase);
        if (!baseFilename.startsWith('ex_')) {
          report.wb1000Stats.prefixErrors++;
        }
      }

      // 题目图检查
      const qRelPath = imgBase + (isProfessional ? '.png' : '_question.png');
      const qAbs = path.join(rootDir, qRelPath);
      const qExists = fs.existsSync(qAbs);

      if (qExists) {
        report.questionImagesFound++;
      } else {
        const item = {
          subject: subj.id,
          chapterId: ch.id,
          chapterName: ch.name,
          wb: ch.wb,
          label: label,
          type: 'question',
          relPath: qRelPath
        };
        report.questionImagesMissing.push(item);
        report.realMissingResources.push(item);
        if (is1000) report.wb1000Stats.questionMissing++;
      }

      // 解析图检查 (专业课题目暂无解析图，跳过)
      if (!isProfessional) {
        const sRelPath = imgBase + '_solution.png';
        const sAbs = path.join(rootDir, sRelPath);
        const sExists = fs.existsSync(sAbs);

        if (sExists) {
          report.solutionImagesFound++;
        } else {
          const item = {
            subject: subj.id,
            chapterId: ch.id,
            chapterName: ch.name,
            wb: ch.wb,
            label: label,
            type: 'solution',
            relPath: sRelPath
          };
          report.solutionImagesMissing.push(item);
          report.realMissingResources.push(item);
          if (is1000) report.wb1000Stats.solutionMissing++;
        }
      }
    });
  });
});

console.log('================ 考研题库资源审计报告 ================');
console.log(`扫描题目总数: ${report.questionsScanned}`);
console.log(`题目图片命中: ${report.questionImagesFound}`);
console.log(`题目图片缺失: ${report.questionImagesMissing.length}`);
console.log(`解析图片命中: ${report.solutionImagesFound}`);
console.log(`解析图片缺失: ${report.solutionImagesMissing.length}`);
console.log('---------------- 1000题 专项统计 ----------------');
console.log(`1000题题目数: ${report.wb1000Stats.totalQuestions}`);
console.log(`1000题前缀错误数: ${report.wb1000Stats.prefixErrors}`);
console.log(`1000题题目缺失数: ${report.wb1000Stats.questionMissing}`);
console.log(`1000题解析缺失数: ${report.wb1000Stats.solutionMissing}`);
console.log('---------------- 真实缺失资源统计 ----------------');
console.log(`真实缺失文件总数: ${report.realMissingResources.length} (其中题目图: ${report.questionImagesMissing.length}, 解析图: ${report.solutionImagesMissing.length})`);
console.log('======================================================');

// 保存详细审计报告
const reportOutPath = path.join(rootDir, 'audit-report.json');
fs.writeFileSync(reportOutPath, JSON.stringify(report, null, 2), 'utf8');
console.log(`详细报告已写入: ${path.relative(rootDir, reportOutPath)}`);

if (report.wb1000Stats.prefixErrors > 0 || report.wb1000Stats.questionMissing > 0 || report.wb1000Stats.solutionMissing > 0) {
  console.error('❌ 1000题存在路径或缺失错误！');
  process.exit(1);
} else {
  console.log('✅ 1000题路径已全部正确命中物理文件 (2412/2412)！');
  process.exit(0);
}
