'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const grading = require('../js/politics-grading.js');

const cases = [
  ['单选正确', ['B'], 'B', 'correct'],
  ['单选错误', ['C'], 'B', 'incorrect'],
  ['多选全部正确', ['C', 'A'], 'AC', 'correct'],
  ['多选漏选', ['A'], 'AC', 'incorrect'],
  ['多选多选', ['A', 'C', 'D'], 'AC', 'incorrect'],
  ['多选全错', ['B', 'D'], 'AC', 'incorrect'],
  ['选项排序无关', ['D', 'B', 'A'], 'ABD', 'correct'],
  ['未作答', [], 'A', 'unanswered'],
  ['没有标准答案', ['A'], null, 'unavailable'],
  ['无法识别的标准答案', ['A'], '暂无答案', 'unavailable'],
  ['小写标准答案', ['B', 'A'], 'a,b', 'correct'],
  ['重复答案不影响判断', ['A', 'B'], 'AAB', 'correct'],
  ['带中文前缀的答案', ['D'], '正确答案：D', 'correct'],
  ['拒绝非法选项', ['A'], 'E', 'unavailable'],
  ['答案包含标点', ['B', 'C'], 'B、C', 'correct']
];

cases.forEach(([name, selection, answer, expected]) => {
  test(name, () => assert.equal(
    grading.gradeAnswer(selection, answer).status, expected
  ));
});

test('不修改输入数组', () => {
  const original = ['C', 'A'];
  grading.gradeAnswer(original, 'AC');
  assert.deepEqual(original, ['C', 'A']);
});
