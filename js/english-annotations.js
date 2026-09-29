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

  window.EnglishAnnotations = {
    STORAGE_KEY: STORAGE_KEY,
    ENABLED_KEY: ENABLED_KEY,
    makeScopeKey: makeScopeKey,
    bind: bind,
    afterRender: afterRender,
    applyToPanel: applyToPanel,
    setEnabled: setEnabled,
    isEnabled: isEnabled,
    getTotalCount: getTotalCount,
    countPrefix: countPrefix,
    getScopeAnnotations: function (scopeKey) { return getScopeAnnotations(scopeKey).slice(); },
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
