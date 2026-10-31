/* 肖1000题目、选项与解析荧光笔。CSS Custom Highlight API：不修改 Markdown/KaTeX 生成的 DOM。 */
(function (global) {
  'use strict';

  var COLORS = Object.freeze(['blue', 'yellow', 'red', 'magenta', 'cyan', 'lime', 'darkorange']);
  var NAMES = {
    blue: 'politics-hl-blue',
    yellow: 'politics-hl-yellow',
    red: 'politics-hl-red',
    magenta: 'politics-hl-magenta',
    cyan: 'politics-hl-cyan',
    lime: 'politics-hl-lime',
    darkorange: 'politics-hl-darkorange'
  };
  var MAX_MARKS = 500;
  var active = null;
  var pendingRange = null;
  var popup = null;
  var listenersInstalled = false;

  function supported() {
    return !!(global.CSS && global.CSS.highlights &&
      typeof global.CSS.highlights.set === 'function' &&
      typeof global.Highlight === 'function' &&
      global.document && typeof global.document.createRange === 'function');
  }

  function normalizeColor(color) {
    if (!color) return null;
    var c = String(color).toLowerCase();
    if (c === 'orange') return 'darkorange';
    return COLORS.indexOf(c) !== -1 ? c : null;
  }

  function normalizedMarks(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(function (mark) {
      if (!mark) return false;
      var color = normalizeColor(mark.color);
      var validTarget = !mark.target || typeof mark.target === 'string';
      return color !== null && validTarget &&
        Number.isSafeInteger(mark.start) && Number.isSafeInteger(mark.end) &&
        mark.start >= 0 && mark.end > mark.start &&
        typeof mark.quote === 'string' && mark.quote.length > 0 &&
        mark.quote.length <= 20000;
    }).map(function (mark) {
      return {
        target: mark.target || 'analysis',
        start: mark.start,
        end: mark.end,
        quote: mark.quote,
        color: normalizeColor(mark.color)
      };
    }).slice(-MAX_MARKS);
  }

  function storageRead(key) {
    try {
      var raw = global.localStorage.getItem(key);
      return normalizedMarks(raw ? JSON.parse(raw) : []);
    } catch (err) {
      console.warn('[politics-highlighter] 本地标注读取失败', err);
      return [];
    }
  }

  function storageWrite(key, marks) {
    try {
      global.localStorage.setItem(key, JSON.stringify(marks));
      return true;
    } catch (err) {
      console.warn('[politics-highlighter] 本地标注保存失败', err);
      return false;
    }
  }

  function allTextNodes(root) {
    var out = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) out.push(walker.currentNode);
    return out;
  }

  // 返回边界点距离正文起始的 UTF-16 文字偏移，包含跨 <strong>/<p> 的选区。
  // Range.comparePoint 避免了 Range.toString() 对某些块元素额外换行的差异。
  function boundaryOffset(root, container, offset) {
    var cursor = document.createRange();
    cursor.setStart(container, offset);
    cursor.collapse(true);
    var sum = 0;
    var nodes = allTextNodes(root);
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var len = node.nodeValue.length;
      if (cursor.comparePoint(node, len) <= 0) {
        sum += len;
      } else {
        if (node === container) sum += offset;
        break;
      }
    }
    return sum;
  }

  function getOffsets(root, range) {
    if (!root || !range || range.collapsed ||
        !root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
    var start = boundaryOffset(root, range.startContainer, range.startOffset);
    var end = boundaryOffset(root, range.endContainer, range.endOffset);
    return start < end ? { start: start, end: end } : null;
  }

  function boundaryAt(root, offset) {
    var nodes = allTextNodes(root);
    var remaining = offset;
    for (var i = 0; i < nodes.length; i++) {
      var len = nodes[i].nodeValue.length;
      if (remaining <= len) return { node: nodes[i], offset: remaining };
      remaining -= len;
    }
    if (remaining === 0 && nodes.length) {
      return { node: nodes[nodes.length - 1], offset: nodes[nodes.length - 1].nodeValue.length };
    }
    return null;
  }

  function rangeFromOffsets(root, start, end) {
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) ||
        start < 0 || end <= start) return null;
    var a = boundaryAt(root, start);
    var b = boundaryAt(root, end);
    if (!a || !b) return null;
    var range = document.createRange();
    range.setStart(a.node, a.offset);
    range.setEnd(b.node, b.offset);
    return range.collapsed ? null : range;
  }

  function hidePopup() {
    pendingRange = null;
    if (popup) popup.hidden = true;
  }

  function clearRegistry() {
    if (!supported()) return;
    COLORS.forEach(function (color) {
      global.CSS.highlights.delete(NAMES[color]);
    });
  }

  function resolveCardRoots(questionCard, solutionCard) {
    var roots = {};
    if (solutionCard) {
      var analysis = solutionCard.querySelector('.sol-analysis-content');
      if (analysis) roots.analysis = analysis;
    }
    if (questionCard) {
      var stem = questionCard.querySelector('.q-stem');
      if (stem) roots.stem = stem;
      var choiceItems = questionCard.querySelectorAll('.q-choice-item');
      choiceItems.forEach(function (item) {
        var key = item.dataset && item.dataset.choice;
        var text = item.querySelector('.choice-text');
        if (key && text) roots['choice_' + key] = text;
      });
    }
    return roots;
  }

  function renderMarks() {
    clearRegistry();
    if (!active || !supported()) return;

    var liveRoots = resolveCardRoots(
      active.questionCard || document.getElementById('questionTextCard'),
      active.solutionCard || document.getElementById('solutionTextCard')
    );
    Object.assign(active.roots, liveRoots);

    var bins = {};
    COLORS.forEach(function (c) { bins[c] = []; });

    active.marks.forEach(function (mark) {
      var target = mark.target || 'analysis';
      var root = active.roots[target];
      if (!root || !root.isConnected) return;

      var range = rangeFromOffsets(root, mark.start, mark.end);
      if (range && range.toString() === mark.quote) {
        var color = normalizeColor(mark.color);
        if (color && bins[color]) {
          bins[color].push(range);
        }
      }
    });

    COLORS.forEach(function (color) {
      if (bins[color] && bins[color].length) {
        global.CSS.highlights.set(NAMES[color], new global.Highlight(...bins[color]));
      }
    });
  }

  function updateCount() {
    if (!active) return;
    var n = active.marks.length;
    var text = '已标注 ' + n + ' 处';
    var controls = document.querySelectorAll('.politics-hl-controls');
    controls.forEach(function (ctrl) {
      var countEl = ctrl.querySelector('.politics-hl-count');
      var undoBtn = ctrl.querySelector('.politics-hl-undo');
      var clearBtn = ctrl.querySelector('.politics-hl-clear');
      if (countEl) countEl.textContent = text;
      if (undoBtn) undoBtn.disabled = n === 0;
      if (clearBtn) clearBtn.disabled = n === 0;
    });
  }

  function saveAndRender() {
    if (!active) return;
    var ok = storageWrite(active.key, active.marks);
    var notices = document.querySelectorAll('.politics-hl-notice');
    notices.forEach(function (notice) {
      if (!ok) {
        notice.textContent = '本次标注已显示，但本地保存失败（可能是存储空间不足）。';
      } else {
        notice.textContent = '';
      }
    });
    renderMarks();
    updateCount();
  }

  function findRootForNode(node) {
    if (!node) return null;
    var el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    if (!el) return null;

    // 1. 解析内容
    var analysisEl = el.closest('.sol-analysis-content');
    if (analysisEl) {
      return { target: 'analysis', root: analysisEl };
    }

    // 2. 选项文字
    var choiceTextEl = el.closest('.choice-text');
    if (choiceTextEl) {
      var item = choiceTextEl.closest('.q-choice-item');
      var key = item && item.dataset && item.dataset.choice;
      if (key) {
        return { target: 'choice_' + key, root: choiceTextEl };
      }
    }

    // 3. 题干
    var stemEl = el.closest('.q-stem');
    if (stemEl) {
      return { target: 'stem', root: stemEl };
    }

    return null;
  }

  function applyColor(color) {
    if (!active || !pendingRange || !supported()) return false;
    color = normalizeColor(color);
    if (!color) { hidePopup(); return false; }

    var target = pendingRange.target;
    var root = pendingRange.root;
    if (!root || !root.isConnected) { hidePopup(); return false; }

    var offsets = pendingRange.offsets || getOffsets(root, pendingRange.range);
    var quote = pendingRange.quote || pendingRange.range.toString();
    if (!offsets || !quote.trim() || quote.length > 20000) {
      hidePopup();
      return false;
    }

    // 同一目标同一范围重复涂色时替换颜色，不叠加重复记录。
    var matchIndex = active.marks.findIndex(function (mark) {
      return (mark.target || 'analysis') === target &&
        mark.start === offsets.start && mark.end === offsets.end;
    });

    var newMark = {
      target: target,
      start: offsets.start,
      end: offsets.end,
      quote: quote,
      color: color
    };

    if (matchIndex >= 0) {
      active.marks.splice(matchIndex, 1);
    }
    active.marks.push(newMark);
    if (active.marks.length > MAX_MARKS) active.marks.shift();

    hidePopup();
    var sel = global.getSelection && global.getSelection();
    if (sel) sel.removeAllRanges();
    saveAndRender();
    return true;
  }

  function eraseCurrent() {
    if (!active || !pendingRange) {
      hidePopup();
      return false;
    }
    var target = pendingRange.target;
    var offsets = pendingRange.offsets;
    var beforeLen = active.marks.length;

    active.marks = active.marks.filter(function (mark) {
      if ((mark.target || 'analysis') !== target) return true;
      var overlap = Math.max(mark.start, offsets.start) < Math.min(mark.end, offsets.end);
      return !overlap;
    });

    hidePopup();
    var sel = global.getSelection && global.getSelection();
    if (sel) sel.removeAllRanges();
    saveAndRender();
    return active.marks.length !== beforeLen;
  }

  function undoLastMark() {
    if (!active || !active.marks.length) return false;
    hidePopup();
    active.marks.pop();
    saveAndRender();
    return true;
  }

  function ensurePopup() {
    if (popup) return popup;
    popup = document.createElement('div');
    popup.className = 'politics-hl-popup';
    popup.hidden = true;
    popup.setAttribute('role', 'toolbar');
    popup.setAttribute('aria-label', '题目、选项与解析荧光标注颜色');
    popup.innerHTML =
      '<span class="politics-hl-popup-label">荧光笔</span>' +
      '<button type="button" class="politics-hl-swatch is-blue" data-color="blue" aria-label="蓝色荧光笔" title="蓝色荧光笔"></button>' +
      '<button type="button" class="politics-hl-swatch is-yellow" data-color="yellow" aria-label="黄色荧光笔" title="黄色荧光笔"></button>' +
      '<button type="button" class="politics-hl-swatch is-red" data-color="red" aria-label="红色荧光笔" title="红色荧光笔"></button>' +
      '<button type="button" class="politics-hl-swatch is-magenta" data-color="magenta" aria-label="洋红荧光笔" title="洋红荧光笔"></button>' +
      '<button type="button" class="politics-hl-swatch is-cyan" data-color="cyan" aria-label="青色荧光笔" title="青色荧光笔"></button>' +
      '<button type="button" class="politics-hl-swatch is-lime" data-color="lime" aria-label="酸橙色荧光笔" title="酸橙色荧光笔"></button>' +
      '<button type="button" class="politics-hl-swatch is-darkorange" data-color="darkorange" aria-label="深橙色荧光笔" title="深橙色荧光笔"></button>' +
      '<button type="button" class="politics-hl-action is-eraser" data-action="erase" aria-label="清除荧光" title="清除选中区域荧光">🧹</button>' +
      '<button type="button" class="politics-hl-action is-undo" data-action="undo" aria-label="撤销上一笔" title="撤销上一笔">↩️</button>';

    // 不让工具条夺走选区焦点；单击颜色后使用之前克隆的 Range。
    popup.addEventListener('mousedown', function (event) { event.preventDefault(); });
    popup.addEventListener('touchstart', function (event) { event.stopPropagation(); });
    popup.addEventListener('click', function (event) {
      var colorBtn = event.target.closest('button[data-color]');
      if (colorBtn) {
        applyColor(colorBtn.dataset.color);
        return;
      }
      var actionBtn = event.target.closest('button[data-action]');
      if (actionBtn) {
        var action = actionBtn.dataset.action;
        if (action === 'erase') eraseCurrent();
        else if (action === 'undo') undoLastMark();
      }
    });
    document.body.appendChild(popup);
    return popup;
  }

  function onSelectionEnd(event) {
    if (!active || !supported()) return;
    var target = event && event.target;
    if (popup && popup.contains(target)) return;

    var selection = global.getSelection && global.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      if (!popup || !popup.contains(target)) hidePopup();
      return;
    }

    var range = selection.getRangeAt(0);
    var startMatch = findRootForNode(range.startContainer);
    var endMatch = findRootForNode(range.endContainer);

    // 必须在同一合法区域内（不可跨题干与选项，也不可跨选项，更不可跨到答案或外部）
    if (!startMatch || !endMatch ||
        startMatch.target !== endMatch.target ||
        startMatch.root !== endMatch.root) {
      hidePopup();
      return;
    }

    var root = startMatch.root;
    var offsets = getOffsets(root, range);
    var quote = range.toString();
    if (!offsets || !quote.trim() || quote.length > 20000) {
      hidePopup();
      return;
    }

    if (active.roots) active.roots[startMatch.target] = root;

    pendingRange = {
      range: range.cloneRange(),
      target: startMatch.target,
      root: root,
      offsets: offsets,
      quote: quote
    };

    var bar = ensurePopup();
    bar.hidden = false;
    updatePopupPosition();
  }

  function updatePopupPosition() {
    if (!popup || popup.hidden || !pendingRange || !pendingRange.range) return;
    var rect = pendingRange.range.getBoundingClientRect();
    var winHeight = global.innerHeight || 768;
    var winWidth = global.innerWidth || 1024;

    // 若选区已完全滑出可视区，则隐藏浮动条
    if (rect.bottom < 0 || rect.top > winHeight || rect.right < 0 || rect.left > winWidth) {
      hidePopup();
      return;
    }

    var width = popup.offsetWidth || 300;
    var height = popup.offsetHeight || 45;

    // 靠近选区居中或右侧，保证不超出屏幕
    var x = Math.min(
      Math.max(8, rect.left + rect.width / 2 - width / 2),
      Math.max(8, winWidth - width - 8)
    );
    var y = rect.top - height - 10;
    if (y < 8) {
      y = rect.bottom + 10;
    }
    y = Math.min(Math.max(8, y), Math.max(8, winHeight - height - 8));
    popup.style.left = Math.max(8, x) + 'px';
    popup.style.top = Math.max(8, y) + 'px';
  }

  function installListeners() {
    if (listenersInstalled) return;
    listenersInstalled = true;
    document.addEventListener('mouseup', onSelectionEnd);
    document.addEventListener('touchend', function (event) {
      if (popup && popup.contains(event.target)) return;
      setTimeout(function () {
        onSelectionEnd(event);
      }, 150);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') hidePopup();
    });
    global.addEventListener('resize', updatePopupPosition);
    global.addEventListener('scroll', updatePopupPosition, true);
  }

  function reset() {
    hidePopup();
    clearRegistry();
    active = null;
  }

  function mount(containerOrOptions, storageKey) {
    if (!containerOrOptions) return false;

    var questionCard = null;
    var solutionCard = null;
    var key = storageKey;

    if (containerOrOptions.nodeType) {
      if (containerOrOptions.id === 'solutionTextCard' || containerOrOptions.querySelector('.sol-analysis-content')) {
        solutionCard = containerOrOptions;
        questionCard = document.getElementById('questionTextCard');
      } else if (containerOrOptions.id === 'questionTextCard' || containerOrOptions.querySelector('.q-stem')) {
        questionCard = containerOrOptions;
        solutionCard = document.getElementById('solutionTextCard');
      } else {
        questionCard = containerOrOptions.querySelector('#questionTextCard') || document.getElementById('questionTextCard');
        solutionCard = containerOrOptions.querySelector('#solutionTextCard') || containerOrOptions;
      }
    } else if (typeof containerOrOptions === 'object') {
      questionCard = containerOrOptions.questionCard || document.getElementById('questionTextCard');
      solutionCard = containerOrOptions.solutionCard || document.getElementById('solutionTextCard');
      key = containerOrOptions.storageKey || storageKey;
    }

    if (!key || typeof key !== 'string') return false;

    var roots = resolveCardRoots(questionCard, solutionCard);
    if (Object.keys(roots).length === 0) return false;

    var marks;
    if (active && active.key === key) {
      marks = active.marks;
      Object.assign(active.roots, roots);
      if (questionCard) active.questionCard = questionCard;
      if (solutionCard) active.solutionCard = solutionCard;
    } else {
      reset();
      marks = storageRead(key);
    }

    installListeners();

    if (solutionCard) {
      var solRoot = roots.analysis;
      var solWrapper = solutionCard.querySelector('.sol-analysis-body');
      if (solRoot && solWrapper) {
        solWrapper.querySelectorAll(':scope > .politics-hl-controls').forEach(function (old) {
          old.remove();
        });
        var controls = document.createElement('div');
        controls.className = 'politics-hl-controls';
        controls.innerHTML =
          '<span class="politics-hl-help">🖍️ 题目、选项与解析均支持划词/长按荧光笔标注</span>' +
          '<span class="politics-hl-count" aria-live="polite"></span>' +
          '<button type="button" class="politics-hl-undo">撤销上一笔</button>' +
          '<button type="button" class="politics-hl-clear">清空本题</button>' +
          '<span class="politics-hl-notice" role="status" aria-live="polite"></span>';

        solWrapper.insertBefore(controls, solRoot);

        controls.querySelector('.politics-hl-undo').addEventListener('click', function () {
          undoLastMark();
        });
        controls.querySelector('.politics-hl-clear').addEventListener('click', function () {
          if (!active || !active.marks.length) return;
          if (!global.confirm('确定清空当前题目的全部荧光标注吗？')) return;
          hidePopup();
          active.marks = [];
          saveAndRender();
        });
      }
    }

    active = {
      key: key,
      questionCard: questionCard,
      solutionCard: solutionCard,
      roots: roots,
      root: roots.analysis || roots.stem || (solutionCard || questionCard),
      marks: marks
    };

    if (!supported()) {
      var notices = document.querySelectorAll('.politics-hl-notice');
      notices.forEach(function (el) {
        el.textContent = '当前浏览器不支持文字荧光笔，请使用最新版 Chrome / Edge / Firefox。';
      });
      document.querySelectorAll('.politics-hl-undo, .politics-hl-clear').forEach(function (btn) {
        btn.disabled = true;
      });
      return false;
    }

    renderMarks();
    updateCount();
    return true;
  }

  var api = {
    mount: mount,
    reset: reset,
    supported: supported,
    normalizedMarks: normalizedMarks,
    getOffsets: getOffsets,
    rangeFromOffsets: rangeFromOffsets,
    applyColor: applyColor,
    eraseCurrent: eraseCurrent,
    undoLastMark: undoLastMark,
    COLORS: COLORS
  };

  global.PoliticsTextHighlighter = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
