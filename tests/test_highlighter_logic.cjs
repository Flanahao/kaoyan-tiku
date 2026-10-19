'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const api = require('../js/politics-text-highlighter.js');

function mark(start, end, quote, color) {
  return { start, end, quote, color };
}
test('模块可以被加载', () => {
  assert.equal(typeof api.mount, 'function');
  assert.equal(typeof api.getOffsets, 'function');
  assert.equal(typeof api.rangeFromOffsets, 'function');
});
test('三种颜色都允许', () => {
  const marks = ['blue', 'yellow', 'red'].map((c,i) => mark(i,i+1,'字',c));
  assert.equal(api.normalizedMarks(marks).length, 3);
});
test('拒绝无效颜色', () => {
  assert.deepEqual(api.normalizedMarks([mark(0,1,'字','green')]),[]);
});
test('拒绝空区间和负值', () => {
  assert.deepEqual(api.normalizedMarks([
    mark(-1,2,'a','red'),mark(1,1,'a','blue'),mark(2,1,'a','yellow')
  ]),[]);
});
test('拒绝小数、无穷和非安全整数', () => {
  assert.deepEqual(api.normalizedMarks([
    mark(0.5,2,'a','red'),mark(0,Infinity,'a','blue'),
    mark(0,Number.MAX_SAFE_INTEGER+1,'a','yellow')
  ]),[]);
});
test('拒绝空引文和超长引文', () => {
  assert.deepEqual(api.normalizedMarks([
    mark(0,1,'','red'),mark(0,20001,'字'.repeat(20001),'blue')
  ]),[]);
});
test('损坏或非数组的数据视为空', () => {
  assert.deepEqual(api.normalizedMarks(null),[]);
  assert.deepEqual(api.normalizedMarks({color:'red'}),[]);
  assert.deepEqual(api.normalizedMarks('abc'),[]);
});
test('每题最多只保留最近 500 笔', () => {
  const data=Array.from({length:550},(_,i)=>mark(i,i+1,'字','blue'));
  const normalized=api.normalizedMarks(data);
  assert.equal(normalized.length,500);
  assert.equal(normalized[0].start,50);
  assert.equal(normalized.at(-1).start,549);
});
test('在非浏览器环境支持检测安全返回 false', () => {
  assert.equal(api.supported(), false);
});
