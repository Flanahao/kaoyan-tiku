(function () {
  'use strict';

  var STORAGE_KEY = 'user_guest_kaoyan_english_text_annot_v1';
  var ENABLED_KEY = 'user_guest_kaoyan_english_precision_reading_v1';
  var DATA_VERSION = 1;
  var CONTEXT_CHARS = 24;

  var state = loadState();
  var enabled = localStorage.getItem(ENABLED_KEY) !== 'false';
  var boundPanel = null;
  var toolbar = null;
  var noteEditor = null;
  var pendingSelection = null;
  var suppressClickUntil = 0;
  var lastSelectionRect = null;

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { version: DATA_VERSION, scopes: {} };
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return { version: DATA_VERSION, scopes: {} };
      if (!parsed.scopes || typeof parsed.scopes !== 'object') parsed.scopes = {};
      parsed.version = DATA_VERSION;
      return parsed;
    } catch (error) {
      console.warn('[EnglishAnnotations] failed to load annotations:', error);
      return { version: DATA_VERSION, scopes: {} };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new CustomEvent('englishannotationschange', {
        detail: { total: getTotalCount() }
      }));
    } catch (error) {
      console.warn('[EnglishAnnotations] failed to save annotations:', error);
    }
  }

  function uid(prefix) {
    return (prefix || 'ann') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function escapeAttr(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function makeScopeKey(year, sectionId, kind, localId) {
    return [
      'eng',
      String(year == null ? '' : year),
      'sec',
      String(sectionId == null ? '' : sectionId),
      String(kind || 'text'),
      String(localId == null ? '' : localId)
    ].join(':');
  }

  function getScopeAnnotations(scopeKey) {
    var list = state.scopes[scopeKey];
    return Array.isArray(list) ? list : [];
  }

  function setScopeAnnotations(scopeKey, list) {
    if (!list || !list.length) delete state.scopes[scopeKey];
    else state.scopes[scopeKey] = list;
  }

  function getTotalCount() {
    return Object.keys(state.scopes).reduce(function (sum, key) {
      return sum + getScopeAnnotations(key).length;
    }, 0);
  }

  function countPrefix(prefix) {
    var target = String(prefix || '');
    return Object.keys(state.scopes).reduce(function (sum, key) {
      if (key.indexOf(target) !== 0) return sum;
      return sum + getScopeAnnotations(key).length;
    }, 0);
  }

  function setEnabled(next) {
    enabled = Boolean(next);
    localStorage.setItem(ENABLED_KEY, String(enabled));
    hideToolbar();
    if (!enabled) clearBrowserSelection();
    window.dispatchEvent(new CustomEvent('englishannotationsenabledchange', {
      detail: { enabled: enabled }
    }));
  }

  function isEnabled() {
    return enabled;
  }

  function nodeInside(scope, node) {
    if (!scope || !node) return false;
    if (scope === node) return true;
    var element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return Boolean(element && (element === scope || scope.contains(element)));
  }

  function offsetFromScope(scope, container, offset) {
    var range = document.createRange();
    range.selectNodeContents(scope);
    range.setEnd(container, offset);
    return range.toString().length;
  }

  function getSelectionParts(range) {
    if (!boundPanel || !range || range.collapsed) return [];
    var scopes = Array.prototype.slice.call(
      boundPanel.querySelectorAll('.ez-annotation-scope[data-ann-scope]')
    );

    return scopes.filter(function (scope) {
      try {
        return range.intersectsNode(scope);
      } catch (error) {
        return false;
      }
    }).map(function (scope) {
      var text = scope.textContent || '';
      var start = 0;
      var end = text.length;

      if (nodeInside(scope, range.startContainer)) {
        start = offsetFromScope(scope, range.startContainer, range.startOffset);
      }
      if (nodeInside(scope, range.endContainer)) {
        end = offsetFromScope(scope, range.endContainer, range.endOffset);
      }

      start = Math.max(0, Math.min(text.length, start));
      end = Math.max(start, Math.min(text.length, end));
      var quote = text.slice(start, end);
      if (!quote || !quote.trim()) return null;

      return {
        scopeKey: scope.getAttribute('data-ann-scope'),
        scope: scope,
        start: start,
        end: end,
        quote: quote,
        prefix: text.slice(Math.max(0, start - CONTEXT_CHARS), start),
        suffix: text.slice(end, Math.min(text.length, end + CONTEXT_CHARS))
      };
    }).filter(Boolean);
  }

  function clearBrowserSelection() {
    var selection = window.getSelection && window.getSelection();
    if (selection && typeof selection.removeAllRanges === 'function') {
      selection.removeAllRanges();
    }
  }

  function ensureToolbar() {
    if (toolbar && toolbar.isConnected) return toolbar;

    toolbar = document.createElement('div');
    toolbar.id = 'ezAnnotationToolbar';
    toolbar.className = 'ez-ann-toolbar';
    toolbar.hidden = true;
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', '精读标注工具');
    toolbar.innerHTML =
      '<button class="ez-ann-color is-yellow" data-ann-action="highlight" data-color="yellow" type="button" title="黄色荧光" aria-label="黄色荧光"></button>' +
      '<button class="ez-ann-color is-green" data-ann-action="highlight" data-color="green" type="button" title="绿色荧光" aria-label="绿色荧光"></button>' +
      '<button class="ez-ann-color is-blue" data-ann-action="highlight" data-color="blue" type="button" title="蓝色荧光" aria-label="蓝色荧光"></button>' +
      '<button class="ez-ann-color is-pink" data-ann-action="highlight" data-color="pink" type="button" title="粉色荧光" aria-label="粉色荧光"></button>' +
      '<span class="ez-ann-sep" aria-hidden="true"></span>' +
      '<button class="ez-ann-tool-btn" data-ann-action="underline" type="button" title="下划线"><span class="ez-ann-u">U</span></button>' +
      '<button class="ez-ann-tool-btn" data-ann-action="note" type="button" title="添加注释">💬</button>' +
      '<button class="ez-ann-tool-btn is-danger" data-ann-action="clear" type="button" title="清除所选标注">⌫</button>';

    toolbar.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      event.stopPropagation();
    });

    toolbar.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      var button = event.target.closest('[data-ann-action]');
      if (!button || !pendingSelection) return;
      var action = button.getAttribute('data-ann-action');

      if (action === 'highlight') {
        createAnnotations(pendingSelection.parts, {
          highlight: button.getAttribute('data-color') || 'yellow'
        });
        finishSelectionAction();
        return;
      }

      if (action === 'underline') {
        createAnnotations(pendingSelection.parts, { underline: true });
        finishSelectionAction();
        return;
      }

      if (action === 'note') {
        openNoteEditorForSelection(pendingSelection.parts, pendingSelection.rect);
        return;
      }

      if (action === 'clear') {
        clearAnnotationsInSelection(pendingSelection.parts);
        finishSelectionAction();
      }
    });

    document.body.appendChild(toolbar);
    return toolbar;
  }

  function positionFloatingElement(element, rect, widthHint, heightHint) {
    var margin = 10;
    var width = widthHint || element.offsetWidth || 260;
    var height = heightHint || element.offsetHeight || 44;
    var left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(margin, Math.min(window.innerWidth - width - margin, left));
    var top = rect.top - height - 10;
    if (top < margin) top = Math.min(window.innerHeight - height - margin, rect.bottom + 10);
    top = Math.max(margin, Math.min(window.innerHeight - height - margin, top));
    element.style.left = Math.round(left) + 'px';
    element.style.top = Math.round(top) + 'px';
  }

  function showToolbar(parts, rect) {
    if (!enabled || !parts.length) return;
    ensureToolbar();
    pendingSelection = { parts: parts, rect: rect };
    lastSelectionRect = rect;
    toolbar.hidden = false;
    toolbar.classList.add('is-visible');
    positionFloatingElement(toolbar, rect, toolbar.offsetWidth || 292, toolbar.offsetHeight || 42);
  }

  function hideToolbar() {
    pendingSelection = null;
    if (toolbar) {
      toolbar.hidden = true;
      toolbar.classList.remove('is-visible');
    }
  }

  function ensureNoteEditor() {
    if (noteEditor && noteEditor.isConnected) return noteEditor;
    noteEditor = document.createElement('div');
    noteEditor.className = 'ez-ann-note-editor';
    noteEditor.hidden = true;
    noteEditor.innerHTML =
      '<div class="ez-ann-note-head"><strong>精读注释</strong><button type="button" data-note-close aria-label="关闭">×</button></div>' +
      '<textarea class="ez-ann-note-input" rows="5" placeholder="记录句子结构、逻辑关系、熟词僻义或自己的理解……"></textarea>' +
      '<div class="ez-ann-note-actions">' +
        '<button type="button" class="is-ghost" data-note-delete hidden>删除注释</button>' +
        '<span class="ez-ann-note-spacer"></span>' +
        '<button type="button" class="is-ghost" data-note-cancel>取消</button>' +
        '<button type="button" class="is-primary" data-note-save>保存</button>' +
      '</div>';

    noteEditor.addEventListener('pointerdown', function (event) {
      event.stopPropagation();
    });
    noteEditor.addEventListener('click', function (event) {
      event.stopPropagation();
      if (event.target.closest('[data-note-close], [data-note-cancel]')) {
        closeNoteEditor();
      }
    });

    document.body.appendChild(noteEditor);
    return noteEditor;
  }

  function openNoteEditorForSelection(parts, rect) {
    var editor = ensureNoteEditor();
    hideToolbar();
    editor.dataset.mode = 'new';
    editor.dataset.groupId = '';
    editor._pendingParts = parts;
    var textarea = editor.querySelector('.ez-ann-note-input');
    textarea.value = '';
    editor.querySelector('[data-note-delete]').hidden = true;
    editor.hidden = false;
    editor.classList.add('is-visible');
    positionFloatingElement(editor, rect || lastSelectionRect || { left: 20, top: 80, bottom: 100, width: 1 }, 330, 200);
    setTimeout(function () { textarea.focus(); }, 0);

    editor.querySelector('[data-note-save]').onclick = function () {
      var note = textarea.value.trim();
      if (!note) return;
      createAnnotations(editor._pendingParts || [], { note: note });
      suppressClickUntil = 0;
      closeNoteEditor();
      clearBrowserSelection();
    };
  }

  function findGroup(groupId) {
    var hits = [];
    Object.keys(state.scopes).forEach(function (scopeKey) {
      getScopeAnnotations(scopeKey).forEach(function (annotation) {
        if (annotation.groupId === groupId) hits.push({ scopeKey: scopeKey, annotation: annotation });
      });
    });
    return hits;
  }

  function openNoteEditorForGroup(groupId, pin) {
    var hits = findGroup(groupId);
    if (!hits.length) return;
    var first = hits[0].annotation;
    var editor = ensureNoteEditor();
    hideToolbar();
    editor.dataset.mode = 'edit';
    editor.dataset.groupId = groupId;
    editor._pendingParts = null;
    var textarea = editor.querySelector('.ez-ann-note-input');
    textarea.value = first.note || '';
    var del = editor.querySelector('[data-note-delete]');
    del.hidden = false;
    editor.hidden = false;
    editor.classList.add('is-visible');
    var rect = pin.getBoundingClientRect();
    positionFloatingElement(editor, rect, 330, 200);
    setTimeout(function () { textarea.focus(); }, 0);

    editor.querySelector('[data-note-save]').onclick = function () {
      var note = textarea.value.trim();
      hits.forEach(function (hit) {
        hit.annotation.note = note;
        hit.annotation.updatedAt = Date.now();
      });
      saveState();
      closeNoteEditor();
      applyToPanel(boundPanel);
    };

    del.onclick = function () {
      removeGroup(groupId);
      closeNoteEditor();
      applyToPanel(boundPanel);
    };
  }

  function closeNoteEditor() {
    if (!noteEditor) return;
    noteEditor.hidden = true;
    noteEditor.classList.remove('is-visible');
    noteEditor._pendingParts = null;
  }

  function createAnnotations(parts, format) {
    if (!parts || !parts.length) return;
    var groupId = uid('group');
    var now = Date.now();

    parts.forEach(function (part, index) {
      var list = getScopeAnnotations(part.scopeKey).slice();
      list.push({
        id: uid('ann'),
        groupId: groupId,
        start: part.start,
        end: part.end,
        quote: part.quote,
        prefix: part.prefix,
        suffix: part.suffix,
        highlight: format.highlight || null,
        underline: Boolean(format.underline),
        note: format.note || '',
        noteAnchor: Boolean(format.note) && index === parts.length - 1,
        createdAt: now,
        updatedAt: now
      });
      setScopeAnnotations(part.scopeKey, list);
    });

    saveState();
    applyToPanel(boundPanel);
  }

  function rangesOverlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
  }

  function clearAnnotationsInSelection(parts) {
    var touchedGroups = new Set();
    parts.forEach(function (part) {
      var list = getScopeAnnotations(part.scopeKey);
      list.forEach(function (annotation) {
        if (rangesOverlap(part.start, part.end, annotation.start, annotation.end)) {
          touchedGroups.add(annotation.groupId || annotation.id);
        }
      });
    });

    if (!touchedGroups.size) return;

    Object.keys(state.scopes).forEach(function (scopeKey) {
      var filtered = getScopeAnnotations(scopeKey).filter(function (annotation) {
        return !touchedGroups.has(annotation.groupId || annotation.id);
      });
      setScopeAnnotations(scopeKey, filtered);
    });

    saveState();
    applyToPanel(boundPanel);
  }

  function removeGroup(groupId) {
    Object.keys(state.scopes).forEach(function (scopeKey) {
      var filtered = getScopeAnnotations(scopeKey).filter(function (annotation) {
        return annotation.groupId !== groupId;
      });
      setScopeAnnotations(scopeKey, filtered);
    });
    saveState();
  }

  function finishSelectionAction() {
    suppressClickUntil = 0;
    hideToolbar();
    closeNoteEditor();
    clearBrowserSelection();
  }

  function scoreCandidate(text, annotation, start) {
    var score = -Math.abs((annotation.start || 0) - start) * 0.01;
    if (annotation.prefix) {
      var prefixStart = Math.max(0, start - annotation.prefix.length);
      if (text.slice(prefixStart, start) === annotation.prefix) score += 10;
    }
    if (annotation.suffix) {
      var end = start + annotation.quote.length;
      if (text.slice(end, end + annotation.suffix.length) === annotation.suffix) score += 10;
    }
    return score;
  }

  function resolveAnnotation(annotation, text) {
    var start = Number(annotation.start) || 0;
    var end = Number(annotation.end) || 0;
    if (start >= 0 && end >= start && text.slice(start, end) === annotation.quote) {
      return { start: start, end: end, changed: false };
    }

    var quote = String(annotation.quote || '');
    if (!quote) return null;
    var candidates = [];
    var index = text.indexOf(quote);
    while (index !== -1) {
      candidates.push({ start: index, score: scoreCandidate(text, annotation, index) });
      index = text.indexOf(quote, index + 1);
    }
    if (!candidates.length) return null;
    candidates.sort(function (a, b) { return b.score - a.score; });
    var best = candidates[0];
    return {
      start: best.start,
      end: best.start + quote.length,
      changed: best.start !== start || best.start + quote.length !== end
    };
  }

  function cleanScope(scope) {
    Array.prototype.slice.call(scope.querySelectorAll('.ez-ann-note-pin')).forEach(function (pin) {
      pin.remove();
    });
    var marks = Array.prototype.slice.call(scope.querySelectorAll('mark.ez-ann-mark'));
    marks.reverse().forEach(function (mark) {
      var parent = mark.parentNode;
      if (!parent) return;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
    });
    scope.normalize();
  }

  function collectTextNodes(scope) {
    var walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        if (parent && parent.closest('.ez-ann-note-pin')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var result = [];
    var cursor = 0;
    var node;
    while ((node = walker.nextNode())) {
      var length = node.nodeValue.length;
      result.push({ node: node, start: cursor, end: cursor + length });
      cursor += length;
    }
    return result;
  }

  function wrapOffsetRange(scope, start, end, annotation) {
    if (end <= start) return;
    var nodes = collectTextNodes(scope);
    nodes.forEach(function (entry) {
      if (entry.end <= start || entry.start >= end) return;
      var localStart = Math.max(0, start - entry.start);
      var localEnd = Math.min(entry.end - entry.start, end - entry.start);
      if (localEnd <= localStart) return;

      var target = entry.node;
      if (localStart > 0) target = target.splitText(localStart);
      var segmentLength = localEnd - localStart;
      if (target.nodeValue.length > segmentLength) target.splitText(segmentLength);

      var mark = document.createElement('mark');
      var classes = ['ez-ann-mark'];
      if (annotation.highlight) classes.push('ez-ann--' + annotation.highlight);
      if (annotation.underline) classes.push('is-underline');
      if (annotation.note) classes.push('has-note');
      mark.className = classes.join(' ');
      mark.setAttribute('data-ann-id', annotation.id);
      mark.setAttribute('data-ann-group', annotation.groupId || annotation.id);
      target.parentNode.replaceChild(mark, target);
      mark.appendChild(target);
    });
  }

  function insertNotePin(scope, offset, annotation) {
    var pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'ez-ann-note-pin';
    pin.setAttribute('data-ann-group', annotation.groupId || annotation.id);
    pin.setAttribute('aria-label', '查看精读注释');
    pin.title = annotation.note || '查看注释';

    var nodes = collectTextNodes(scope);
    if (!nodes.length) {
      scope.appendChild(pin);
      return;
    }

    var inserted = false;
    for (var i = 0; i < nodes.length; i++) {
      var entry = nodes[i];
      if (offset <= entry.end) {
        var local = Math.max(0, Math.min(entry.node.nodeValue.length, offset - entry.start));
        var range = document.createRange();
        range.setStart(entry.node, local);
        range.collapse(true);
        range.insertNode(pin);
        inserted = true;
        break;
      }
    }
    if (!inserted) scope.appendChild(pin);
  }

  function applyToScope(scope) {
    if (!scope) return;
    var scopeKey = scope.getAttribute('data-ann-scope');
    if (!scopeKey) return;
    cleanScope(scope);

    var text = scope.textContent || '';
    var annotations = getScopeAnnotations(scopeKey);
    if (!annotations.length) return;

    var changed = false;
    var resolved = [];
    annotations.forEach(function (annotation) {
      var position = resolveAnnotation(annotation, text);
      if (!position) return;
      if (position.changed) {
        annotation.start = position.start;
        annotation.end = position.end;
        annotation.prefix = text.slice(Math.max(0, position.start - CONTEXT_CHARS), position.start);
        annotation.suffix = text.slice(position.end, Math.min(text.length, position.end + CONTEXT_CHARS));
        annotation.updatedAt = Date.now();
        changed = true;
      }
      resolved.push({ annotation: annotation, start: position.start, end: position.end });
    });

    resolved.sort(function (a, b) {
      if (a.start !== b.start) return a.start - b.start;
      return b.end - a.end;
    });

    resolved.forEach(function (item) {
      wrapOffsetRange(scope, item.start, item.end, item.annotation);
    });
    resolved.forEach(function (item) {
      if (item.annotation.note && item.annotation.noteAnchor) {
        insertNotePin(scope, item.end, item.annotation);
      }
    });

    if (changed) saveState();
  }

  function applyToPanel(panel) {
    var target = panel || boundPanel;
    if (!target) return;
    Array.prototype.forEach.call(
      target.querySelectorAll('.ez-annotation-scope[data-ann-scope]'),
      applyToScope
    );
  }

  function handlePointerUp() {
    if (!enabled || !boundPanel) return;
    window.requestAnimationFrame(function () {
      var selection = window.getSelection && window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        hideToolbar();
        return;
      }
      var range = selection.getRangeAt(0);
      var parts = getSelectionParts(range);
      if (!parts.length) {
        hideToolbar();
        return;
      }
      var rect = range.getBoundingClientRect();
      if (!rect || (!rect.width && !rect.height)) {
        var rects = range.getClientRects();
        rect = rects && rects.length ? rects[0] : null;
      }
      if (!rect) return;
      suppressClickUntil = Date.now() + 450;
      if (typeof window.closeEnglishWordPopover === 'function') {
        window.closeEnglishWordPopover();
      }
      showToolbar(parts, rect);
    });
  }

  function bind(panel) {
    if (!panel) return;
    if (boundPanel === panel && panel.dataset.englishAnnotationsBound === 'true') return;
    boundPanel = panel;
    if (panel.dataset.englishAnnotationsBound === 'true') return;
    panel.dataset.englishAnnotationsBound = 'true';

    panel.addEventListener('pointerup', handlePointerUp);

    panel.addEventListener('click', function (event) {
      var pin = event.target.closest('.ez-ann-note-pin');
      if (pin) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openNoteEditorForGroup(pin.getAttribute('data-ann-group'), pin);
        return;
      }

      if (Date.now() < suppressClickUntil && event.target.closest('.ez-annotation-scope')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    document.addEventListener('pointerdown', function (event) {
      if (toolbar && event.target.closest('.ez-ann-toolbar')) return;
      if (noteEditor && event.target.closest('.ez-ann-note-editor')) return;
      if (event.target.closest('.ez-ann-note-pin')) return;
      if (!event.target.closest('.ez-annotation-scope')) hideToolbar();
    }, true);
  }

  function afterRender(panel) {
    if (panel) bind(panel);
    hideToolbar();
    closeNoteEditor();
    applyToPanel(panel || boundPanel);
  }

  /* =========================================================================
     V4 Immersive Workspace Engine (Custom Highlight API + Range Persistence)
     ========================================================================= */
  var STORAGE_KEY_V4 = 'user_guest_kaoyan_english_text_annot_v4';
  var v4Toolbar = null;
  var v4CurrentSelection = null;
  var v4Enabled = true;
  var v4MountedRoot = null;
  var v4AnnotationScopePrefix = '';
  var v4ResizeHandler = null;

  function v4Uid() {
    return 'ann_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function v4ReadStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY_V4);
      var parsed = raw ? JSON.parse(raw) : { items: [] };
      if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
      return parsed;
    } catch (e) {
      return { items: [] };
    }
  }

  function v4WriteStore(store) {
    try {
      localStorage.setItem(STORAGE_KEY_V4, JSON.stringify(store));
    } catch (e) {}
  }

  function v4TextNodes(root) {
    var out = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
        var p = node.parentElement;
        if (!p || p.closest('.ew-selection-toolbar,.ew-word-pop')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walker.nextNode())) out.push(n);
    return out;
  }

  function v4ScopeText(scope) {
    return scope ? (scope.textContent || '') : '';
  }

  function v4PointToOffset(scope, node, offset) {
    var nodes = v4TextNodes(scope), total = 0;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i] === node) return total + offset;
      total += nodes[i].nodeValue.length;
    }
    return -1;
  }

  function v4OffsetToPoint(scope, offset) {
    var nodes = v4TextNodes(scope), remain = Math.max(0, offset);
    for (var i = 0; i < nodes.length; i++) {
      var len = nodes[i].nodeValue.length;
      if (remain <= len) return { node: nodes[i], offset: remain };
      remain -= len;
    }
    if (!nodes.length) return null;
    return { node: nodes[nodes.length - 1], offset: nodes[nodes.length - 1].nodeValue.length };
  }

  function v4MakeRange(scope, start, end) {
    var a = v4OffsetToPoint(scope, start), b = v4OffsetToPoint(scope, end);
    if (!a || !b || end <= start) return null;
    var range = document.createRange();
    try {
      range.setStart(a.node, a.offset);
      range.setEnd(b.node, b.offset);
      return range;
    } catch (e) {
      return null;
    }
  }

  function v4GetScopesInRange(range) {
    if (!v4MountedRoot) return [];
    var scopes = Array.prototype.slice.call(v4MountedRoot.querySelectorAll('[data-annotation-scope]'));
    return scopes.filter(function (scope) {
      try {
        return range.intersectsNode(scope);
      } catch (e) {
        return false;
      }
    });
  }

  function v4DeriveSegments(range) {
    var scopes = v4GetScopesInRange(range), segments = [];
    scopes.forEach(function (scope) {
      var scopeRange = document.createRange();
      scopeRange.selectNodeContents(scope);

      var startNode = scope.contains(range.startContainer) ? range.startContainer : scopeRange.startContainer;
      var startOffset = scope.contains(range.startContainer) ? range.startOffset : scopeRange.startOffset;
      var endNode = scope.contains(range.endContainer) ? range.endContainer : scopeRange.endContainer;
      var endOffset = scope.contains(range.endContainer) ? range.endOffset : scopeRange.endOffset;

      var start = v4PointToOffset(scope, startNode, startOffset);
      var end = v4PointToOffset(scope, endNode, endOffset);
      if (start < 0 || end < 0) return;

      if (!scope.contains(range.startContainer)) start = 0;
      if (!scope.contains(range.endContainer)) end = v4ScopeText(scope).length;

      if (end > start) {
        var full = v4ScopeText(scope);
        segments.push({
          scopeId: scope.getAttribute('data-annotation-scope'),
          start: start,
          end: end,
          quote: full.slice(start, end),
          prefix: full.slice(Math.max(0, start - 24), start),
          suffix: full.slice(end, Math.min(full.length, end + 24))
        });
      }
    });
    return segments;
  }

  function v4ResolveSegment(seg, scope) {
    var text = v4ScopeText(scope);
    if (text.slice(seg.start, seg.end) === seg.quote) return { start: seg.start, end: seg.end };
    if (!seg.quote) return null;
    var from = Math.max(0, seg.start - 120);
    var idx = text.indexOf(seg.quote, from);
    if (idx < 0) idx = text.indexOf(seg.quote);
    if (idx < 0) return null;

    if (seg.prefix || seg.suffix) {
      var candidates = [], pos = text.indexOf(seg.quote);
      while (pos >= 0) {
        var score = 0;
        if (seg.prefix && text.slice(Math.max(0, pos - seg.prefix.length), pos) === seg.prefix) score += 2;
        var tail = pos + seg.quote.length;
        if (seg.suffix && text.slice(tail, tail + seg.suffix.length) === seg.suffix) score += 2;
        score -= Math.min(1, Math.abs(pos - seg.start) / 500);
        candidates.push({ pos: pos, score: score });
        pos = text.indexOf(seg.quote, pos + 1);
      }
      candidates.sort(function (a, b) { return b.score - a.score; });
      if (candidates.length) idx = candidates[0].pos;
    }
    return { start: idx, end: idx + seg.quote.length };
  }

  function v4AnnotationsForPrefix() {
    var store = v4ReadStore();
    return store.items.filter(function (it) { return it.scopePrefix === v4AnnotationScopePrefix; });
  }

  function v4ClearCssHighlights() {
    if (!window.CSS || !CSS.highlights) return;
    ['ew-yellow', 'ew-green', 'ew-cyan', 'ew-pink', 'ew-red', 'ew-underline'].forEach(function (name) {
      CSS.highlights.delete(name);
    });
  }

  function v4UnwrapFallback(root) {
    if (!root) return;
    root.querySelectorAll('mark.ew-fallback-mark').forEach(function (mark) {
      var p = mark.parentNode;
      while (mark.firstChild) p.insertBefore(mark.firstChild, mark);
      p.removeChild(mark);
      p.normalize();
    });
  }

  function v4RenderCssHighlights(items) {
    var buckets = {
      yellow: [], green: [], cyan: [], pink: [], red: [], underline: []
    };
    items.forEach(function (it) {
      var scope = v4MountedRoot.querySelector('[data-annotation-scope="' + v4CssEscape(it.scopeId) + '"]');
      if (!scope) return;
      var resolved = v4ResolveSegment(it, scope);
      if (!resolved) return;
      var range = v4MakeRange(scope, resolved.start, resolved.end);
      if (!range) return;
      buckets[it.kind === 'underline' ? 'underline' : (it.color || 'yellow')].push(range);
    });
    Object.keys(buckets).forEach(function (key) {
      if (!buckets[key].length) return;
      try {
        CSS.highlights.set('ew-' + key, new Highlight(...buckets[key]));
      } catch (e) {
        var h = new Highlight();
        buckets[key].forEach(function (r) { h.add(r); });
        CSS.highlights.set('ew-' + key, h);
      }
    });
  }

  function v4RenderFallback(items) {
    items.slice().reverse().forEach(function (it) {
      var scope = v4MountedRoot.querySelector('[data-annotation-scope="' + v4CssEscape(it.scopeId) + '"]');
      if (!scope) return;
      var resolved = v4ResolveSegment(it, scope);
      var range = resolved && v4MakeRange(scope, resolved.start, resolved.end);
      if (!range || range.collapsed) return;
      try {
        var mark = document.createElement('mark');
        mark.className = 'ew-fallback-mark ' + (it.kind === 'underline' ? 'underline' : (it.color || 'yellow'));
        range.surroundContents(mark);
      } catch (e) {}
    });
  }

  function v4CssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(String(value));
    return String(value).replace(/["\\]/g, '\\$&');
  }

  function v4Render() {
    if (!v4MountedRoot) return;
    v4ClearCssHighlights();
    v4UnwrapFallback(v4MountedRoot);
    var items = v4AnnotationsForPrefix();
    if (window.CSS && CSS.highlights && window.Highlight) {
      v4RenderCssHighlights(items);
    } else {
      v4RenderFallback(items);
    }
    v4RenderNoteIndicators(items);
  }

  function v4RenderNoteIndicators(items) {
    v4MountedRoot.querySelectorAll('.ew-source-note[data-ann-id]').forEach(function (el) { el.remove(); });
    items.filter(function (it) { return it.note; }).forEach(function (it) {
      var scope = v4MountedRoot.querySelector('[data-annotation-scope="' + v4CssEscape(it.scopeId) + '"]');
      if (!scope) return;
      var resolved = v4ResolveSegment(it, scope);
      var pt = resolved && v4OffsetToPoint(scope, resolved.end);
      if (!pt || !pt.node.parentElement) return;
      var badge = document.createElement('button');
      badge.type = 'button';
      badge.className = 'ew-source-note';
      badge.setAttribute('data-ann-id', it.id);
      badge.textContent = '◆';
      badge.title = it.note;
      badge.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var next = window.prompt('编辑注释：', it.note || '');
        if (next === null) return;
        v4UpdateNote(it.id, next);
      });
      var parent = pt.node.parentElement;
      parent.appendChild(badge);
    });
  }

  function v4UpdateNote(id, note) {
    var store = v4ReadStore();
    var item = store.items.find(function (x) { return x.id === id; });
    if (!item) return;
    item.note = String(note || '').trim();
    item.updatedAt = Date.now();
    v4WriteStore(store);
    v4Render();
  }

  function v4SaveSegments(segments, kind, color, note) {
    if (!segments.length) return;
    var store = v4ReadStore(), groupId = v4Uid();
    segments.forEach(function (seg) {
      store.items.push({
        id: v4Uid(),
        groupId: groupId,
        scopePrefix: v4AnnotationScopePrefix,
        scopeId: seg.scopeId,
        start: seg.start,
        end: seg.end,
        quote: seg.quote,
        prefix: seg.prefix,
        suffix: seg.suffix,
        kind: kind,
        color: color || '',
        note: note || '',
        createdAt: Date.now()
      });
    });
    v4WriteStore(store);
    v4Render();
  }

  function v4ClearSegments(segments) {
    if (!segments.length) return;
    var store = v4ReadStore();
    store.items = store.items.filter(function (it) {
      if (it.scopePrefix !== v4AnnotationScopePrefix) return true;
      var seg = segments.find(function (s) { return s.scopeId === it.scopeId; });
      if (!seg) return true;
      return it.end <= seg.start || it.start >= seg.end;
    });
    v4WriteStore(store);
    v4Render();
  }

  function v4HideToolbar() {
    if (v4Toolbar) v4Toolbar.hidden = true;
  }

  function v4PlaceToolbar(range) {
    if (!v4Toolbar) return;
    var rect = range.getBoundingClientRect();
    if (!rect || (!rect.width && !rect.height)) return;
    v4Toolbar.hidden = false;
    var w = v4Toolbar.offsetWidth || 260, h = v4Toolbar.offsetHeight || 46;
    var left = Math.min(window.innerWidth - w - 10, Math.max(10, rect.left + rect.width / 2 - w / 2));
    var top = Math.max(10, rect.top - h - 10);
    if (top < 10) top = Math.min(window.innerHeight - h - 10, rect.bottom + 10);
    v4Toolbar.style.left = left + 'px';
    v4Toolbar.style.top = top + 'px';
  }

  function v4CaptureSelection() {
    if (!v4Enabled || !v4MountedRoot) return;
    var sel = window.getSelection && window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      v4HideToolbar();
      v4CurrentSelection = null;
      return;
    }
    var range = sel.getRangeAt(0);
    var common = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
    if (!common || !v4MountedRoot.contains(common)) {
      v4HideToolbar();
      v4CurrentSelection = null;
      return;
    }
    var segments = v4DeriveSegments(range);
    if (!segments.length) {
      v4HideToolbar();
      v4CurrentSelection = null;
      return;
    }
    v4CurrentSelection = { segments: segments, range: range.cloneRange() };
    v4PlaceToolbar(range);
  }

  function v4OnToolbarClick(e) {
    var btn = e.target.closest('[data-ann-action]');
    if (!btn || !v4CurrentSelection) return;
    e.preventDefault(); e.stopPropagation();
    var action = btn.getAttribute('data-ann-action');
    if (action === 'highlight') {
      v4SaveSegments(v4CurrentSelection.segments, 'highlight', btn.getAttribute('data-ann-color') || 'yellow', '');
    } else if (action === 'underline') {
      v4SaveSegments(v4CurrentSelection.segments, 'underline', '', '');
    } else if (action === 'note') {
      var note = window.prompt('给这段文字添加注释：', '');
      if (note !== null) v4SaveSegments(v4CurrentSelection.segments, 'highlight', 'yellow', String(note).trim());
    } else if (action === 'clear') {
      v4ClearSegments(v4CurrentSelection.segments);
    }
    var sel = window.getSelection && window.getSelection();
    if (sel) sel.removeAllRanges();
    v4CurrentSelection = null;
    v4HideToolbar();
  }

  function v4Mount(root, options) {
    v4Unmount();
    v4MountedRoot = root;
    v4AnnotationScopePrefix = String((options && options.scopePrefix) || 'english');
    v4Toolbar = document.getElementById('ewSelectionToolbar');
    if (v4Toolbar) v4Toolbar.addEventListener('click', v4OnToolbarClick);
    v4MountedRoot.addEventListener('mouseup', function () { setTimeout(v4CaptureSelection, 0); });
    v4MountedRoot.addEventListener('keyup', function () { setTimeout(v4CaptureSelection, 0); });
    v4ResizeHandler = v4HideToolbar;
    window.addEventListener('resize', v4ResizeHandler);
    window.addEventListener('scroll', v4ResizeHandler, true);
    v4Render();
  }

  function v4Unmount() {
    if (v4Toolbar) v4Toolbar.removeEventListener('click', v4OnToolbarClick);
    if (v4ResizeHandler) {
      window.removeEventListener('resize', v4ResizeHandler);
      window.removeEventListener('scroll', v4ResizeHandler, true);
    }
    v4ClearCssHighlights();
    if (v4MountedRoot) v4UnwrapFallback(v4MountedRoot);
    v4MountedRoot = null;
    v4Toolbar = null;
    v4CurrentSelection = null;
  }

  function v4SetEnabled(value) {
    v4Enabled = !!value;
    if (!v4Enabled) v4HideToolbar();
  }

  function v4GetEnabled() {
    return v4Enabled;
  }

  window.EnglishAnnotations = {
    // V1-V3 API
    STORAGE_KEY: STORAGE_KEY,
    ENABLED_KEY: ENABLED_KEY,
    makeScopeKey: makeScopeKey,
    bind: bind,
    afterRender: afterRender,
    applyToPanel: applyToPanel,
    setEnabled: function (val) {
      setEnabled(val);
      v4SetEnabled(val);
    },
    isEnabled: isEnabled,
    getTotalCount: getTotalCount,
    countPrefix: countPrefix,
    getScopeAnnotations: function (scopeKey) { return getScopeAnnotations(scopeKey).slice(); },
    // V4 Immersive Workspace API
    mount: v4Mount,
    unmount: v4Unmount,
    render: v4Render,
    getEnabled: v4GetEnabled,
    storageKey: STORAGE_KEY_V4,
    _debug: {
      getState: function () { return JSON.parse(JSON.stringify(state)); },
      getSelectionParts: getSelectionParts,
      resolveAnnotation: resolveAnnotation,
      reset: function () {
        state = { version: DATA_VERSION, scopes: {} };
        localStorage.removeItem(STORAGE_KEY);
        applyToPanel(boundPanel);
      }
    }
  };
})();
