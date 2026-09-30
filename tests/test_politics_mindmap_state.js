const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repo = path.resolve(__dirname, '..');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(repo, 'data/politics/bundle.js'), 'utf8'), sandbox);
const adapter = require('../js/politics/politics_data_adapter.js');
const state = require('../js/politics/politics_mindmap_state.js');
const memory = new Map([['kaoyan.g.math.progress', 'untouched']]);
global.localStorage = {
  getItem: key => memory.has(key) ? memory.get(key) : null,
  setItem: (key, value) => memory.set(key, value)
};

adapter.init(sandbox.window.__POLITICS_STATIC_DATA__);
const macro = adapter.getScopeData('pol_macro');
const my = adapter.getScopeData('pol_my');
function find(node, uid) {
  if (node.data.uid === uid) return node;
  for (const child of node.children || []) {
    const hit = find(child, uid);
    if (hit) return hit;
  }
  return null;
}

const sharedUid = 'pol.my.c03.s01.p017';
const source = find(macro, sharedUid);
assert(source && find(my, sharedUid), '同一政治考点必须出现在 L1 和学科层');
const parentUid = source.data.uid;
source.data.text = '用户自定义考点';
source.data.highlightColor = '#ffee00';
source.data.expand = true;
source.children.push({ data: { uid: 'user.politics.note.1', text: '我的补充笔记', expand: false }, children: [] });
assert.equal(state.capture(macro, adapter.getScopeData('pol_macro'), 'pol_macro'), true);
assert.equal(memory.get('kaoyan.g.math.progress'), 'untouched');
assert.equal(state.saveUI('pol_macro', {
  viewMode: 'outline', lines: false, viewport: { x: 120, y: -42, scale: 0.35 }
}), true);
assert.deepEqual(state.getUI('pol_macro'), {
  viewMode: 'outline', lines: false, viewport: { x: 120, y: -42, scale: 0.35 }
});
assert.equal(state.getUI('pol_my'), null, '视口状态必须按作用域隔离');
let chapter = state.restore(my, 'pol_my');
assert.equal(find(chapter, sharedUid).data.text, '用户自定义考点');
assert.equal(find(chapter, sharedUid).data.highlightColor, '#ffee00');
assert.equal(find(chapter, 'user.politics.note.1').data.text, '我的补充笔记');
assert.equal(find(chapter, sharedUid).data.expand, find(my, sharedUid).data.expand,
  '展开状态只属于当前 scope');

const editedMy = state.restore(my, 'pol_my');
find(editedMy, sharedUid).data.text = '学科层同步修改';
assert.equal(state.capture(editedMy, my, 'pol_my'), true);
assert.equal(state.getUI('pol_macro').viewport.x, 120, 'L2 保存不能抹掉 L1 的视口');
assert.equal(find(state.restore(adapter.getScopeData('pol_macro'), 'pol_macro'), sharedUid).data.text,
  '学科层同步修改', 'L2 修改应写回 L1');
const section = find(editedMy, 'pol.my.c03.s01');
assert(section && section.children.length > 1);
const removedUid = section.children.find(child => child.data.uid !== sharedUid).data.uid;
section.children = section.children.filter(child => child.data.uid !== removedUid);
assert.equal(state.capture(editedMy, my, 'pol_my'), true);
assert.equal(find(state.restore(adapter.getScopeData('pol_macro'), 'pol_macro'), removedUid), null,
  '删除已有节点应同步到 L1，不改变打包母本');
assert.equal(state.capture({ data: { uid: 'temporary.pruned' }, children: [] }, my, 'pol_my'), false,
  '聚拢/钻取临时树不能覆盖全树');

memory.set(state.KEY, '{broken');
assert.equal(find(state.restore(my, 'pol_my'), sharedUid).data.text, find(my, sharedUid).data.text,
  '存储损坏时应回退至静态母本');
console.log('POLITICS_MINDMAP_STATE_TESTS_PASSED');
