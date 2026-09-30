/* Political mind map user edits. The bundled syllabus remains read-only. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PoliticsMindMapState = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var KEY = 'kaoyan.g.politics.mindmap.v1';
  var EDIT_FIELDS = [
    'text', 'tag', 'tagType', 'richText', 'resetRichText', 'highlightColor',
    'fontWeight', 'fontStyle', 'textDecoration', 'color', 'backgroundColor',
    'borderColor', 'fontSize', 'fontFamily'
  ];

  function fresh() {
    return { version: 1, edits: {}, added: {}, removed: {}, expanded: {}, ui: {} };
  }

  function read() {
    try {
      var parsed = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (parsed && parsed.version === 1 && parsed.edits && parsed.added && parsed.removed && parsed.expanded) {
        if (!parsed.ui || typeof parsed.ui !== 'object') parsed.ui = {};
        return parsed;
      }
    } catch (e) { /* Private mode / malformed data: use the bundled tree. */ }
    return fresh();
  }

  function write(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      if (typeof console !== 'undefined') console.warn('[PoliticsMindMapState] 保存失败:', e);
      return false;
    }
  }

  function clone(node) {
    return JSON.parse(JSON.stringify(node, function (key, value) {
      if (key === '_node' || key === '_preRenderedCard' || key === '_preRenderedKey') return undefined;
      return value;
    }));
  }

  function index(root) {
    var map = new Map();
    function walk(node, parentUid) {
      if (!node || !node.data || typeof node.data.uid !== 'string') return;
      map.set(node.data.uid, { node: node, parentUid: parentUid });
      (node.children || []).forEach(function (child) { walk(child, node.data.uid); });
    }
    walk(root, null);
    return map;
  }

  function capture(current, baseline, scope) {
    if (!current || !baseline || !current.data || !baseline.data ||
        current.data.uid !== baseline.data.uid || !scope) return false;

    var state = read();
    var base = index(baseline);
    var now = index(current);
    var expanded = {};

    now.forEach(function (entry, uid) {
      if (typeof entry.node.data.expand === 'boolean') expanded[uid] = entry.node.data.expand;
      var original = base.get(uid);
      if (!original) {
        // Only the highest new ancestor is stored; its descendants come with it.
        if (base.has(entry.parentUid)) {
          state.added[uid] = { parentUid: entry.parentUid, node: clone(entry.node) };
        }
        return;
      }
      var attrs = state.edits[uid] || {};
      EDIT_FIELDS.forEach(function (field) {
        var next = entry.node.data[field];
        var prev = original.node.data[field];
        if (JSON.stringify(next) === JSON.stringify(prev)) delete attrs[field];
        else attrs[field] = next === undefined ? null : clone(next);
      });
      if (Object.keys(attrs).length) state.edits[uid] = attrs;
      else delete state.edits[uid];
      delete state.removed[uid];
    });

    base.forEach(function (_, uid) {
      if (!now.has(uid) && uid !== baseline.data.uid) state.removed[uid] = true;
    });
    Object.keys(state.added).forEach(function (uid) {
      if (base.has(state.added[uid].parentUid) && !now.has(uid) &&
          now.has(state.added[uid].parentUid)) delete state.added[uid];
    });
    state.expanded[scope] = expanded;
    return write(state);
  }

  function restore(baseline, scope) {
    if (!baseline) return null;
    var state = read();
    var tree = clone(baseline);
    var byUid = index(tree);
    Object.keys(state.added).forEach(function (uid) {
      var addition = state.added[uid];
      var parent = addition && byUid.get(addition.parentUid);
      if (parent && !byUid.has(uid) && !state.removed[uid]) {
        parent.node.children = parent.node.children || [];
        parent.node.children.push(clone(addition.node));
      }
    });
    var expansion = state.expanded[scope] || {};
    function apply(node) {
      var uid = node.data && node.data.uid;
      var attrs = state.edits[uid] || {};
      Object.keys(attrs).forEach(function (field) {
        if (EDIT_FIELDS.indexOf(field) === -1) return;
        if (attrs[field] === null) delete node.data[field];
        else node.data[field] = clone(attrs[field]);
      });
      if (Object.prototype.hasOwnProperty.call(expansion, uid)) node.data.expand = expansion[uid];
      node.children = (node.children || []).filter(function (child) {
        return !state.removed[child.data && child.data.uid];
      });
      node.children.forEach(apply);
    }
    apply(tree);
    return tree;
  }

  function getUI(scope) {
    return read().ui[scope] || null;
  }

  function saveUI(scope, ui) {
    if (!scope || !ui) return false;
    var state = read();
    state.ui[scope] = clone(ui);
    return write(state);
  }

  return { KEY: KEY, capture: capture, restore: restore, getUI: getUI, saveUI: saveUI };
});
