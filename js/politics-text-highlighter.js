/* 肖1000解析荧光笔。CSS Custom Highlight API：不修改 Markdown/KaTeX 生成的 DOM。 */
(function (global) {
  'use strict';

  var COLORS = Object.freeze(['blue', 'yellow', 'red']);
  var NAMES = { blue: 'politics-hl-blue', yellow: 'politics-hl-yellow', red: 'politics-hl-red' };
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

  function normalizedMarks(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(function (mark) {
      return mark && COLORS.indexOf(mark.color) !== -1 &&
        Number.isSafeInteger(mark.start) && Number.isSafeInteger(mark.end) &&
        mark.start >= 0 && mark.end > mark.start &&
        typeof mark.quote === 'string' && mark.quote.length > 0 &&
        mark.quote.length <= 20000;
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
      // 文字节点的末尾在光标之前/相同，则整个节点已走过。
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

  function renderMarks() {
    clearRegistry();
    if (!active || !supported()) return;
    var bins = { blue: [], yellow: [], red: [] };
    active.marks.forEach(function (mark) {
      var range = rangeFromOffsets(active.root, mark.start, mark.end);
      // 解析内容变动时不再把旧偏移画到错误文字上。
      if (range && range.toString() === mark.quote) bins[mark.color].push(range);
    });
    COLORS.forEach(function (color) {
      if (bins[color].length) {
        global.CSS.highlights.set(NAMES[color], new global.Highlight(...bins[color]));
      }
    });
  }

  function updateCount() {
    if (!active) return;
    var n = active.marks.length;
    active.count.textContent = '已标注 ' + n + ' 处';
    active.undo.disabled = n === 0;
    active.clear.disabled = n === 0;
  }

  function saveAndRender() {
    if (!active) return;
    if (!storageWrite(active.key, active.marks)) {
      active.notice.textContent = '本次标注已显示，但本地保存失败（可能是存储空间不足）。';
    } else {
      active.notice.textContent = '';
    }
    renderMarks();
    updateCount();
  }

  function applyColor(color) {
    if (!active || !pendingRange || COLORS.indexOf(color) === -1 || !supported()) return false;
    var range = pendingRange;
    var root = active.root;
    if (!root.isConnected) { hidePopup(); return false; }

    var offsets = getOffsets(root, range);
    var quote = range.toString();
    if (!offsets || !quote.trim() || quote.length > 20000) {
      hidePopup();
      return false;
    }

    // 同一范围重复涂色时替换颜色，不叠加重复记录；其他范围允许各自独立。
    var matches = active.marks.findIndex(function (mark) {
      return mark.start === offsets.start && mark.end === offsets.end;
    });
    var newMark = {
      start: offsets.start,
      end: offsets.end,
      quote: quote,
      color: color
    };
    if (matches >= 0) active.marks.splice(matches, 1);
    active.marks.push(newMark);
    if (active.marks.length > MAX_MARKS) active.marks.shift();
    hidePopup();
    var sel = global.getSelection && global.getSelection();
    if (sel) sel.removeAllRanges();
    saveAndRender();
    return true;
  }

  function ensurePopup() {
    if (popup) return popup;
    popup = document.createElement('div');
    popup.className = 'politics-hl-popup';
    popup.hidden = true;
    popup.setAttribute('role', 'toolbar');
    popup.setAttribute('aria-label', '解析荧光标注颜色');
    popup.innerHTML =
      '<span class="politics-hl-popup-label">荧光笔</span>' +
      '<button type="button" class="politics-hl-swatch is-blue" data-color="blue" aria-label="蓝色荧光笔" title="蓝色荧光笔"></button>' +
      '<button type="button" class="politics-hl-swatch is-yellow" data-color="yellow" aria-label="黄色荧光笔" title="黄色荧光笔"></button>' +
      '<button type="button" class="politics-hl-swatch is-red" data-color="red" aria-label="红色荧光笔" title="红色荧光笔"></button>';
    // 不让工具条夺走选区焦点；单击颜色后使用之前克隆的 Range。
    popup.addEventListener('mousedown', function (event) { event.preventDefault(); });
    popup.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-color]');
      if (button) applyColor(button.dataset.color);
    });
    document.body.appendChild(popup);
    return popup;
  }

  function onMouseUp(event) {
    if (!active || !supported()) return;
    var target = event.target;
    if (popup && popup.contains(target)) return;
    if (!active.root.contains(target)) { hidePopup(); return; }
    var selection = global.getSelection && global.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) { hidePopup(); return; }
    var range = selection.getRangeAt(0);
    if (!getOffsets(active.root, range) || !range.toString().trim()) {
      hidePopup();
      return;
    }
    pendingRange = range.cloneRange();
    var bar = ensurePopup();
    bar.hidden = false;
    var rect = range.getBoundingClientRect();
    var width = bar.offsetWidth || 210;
    var height = bar.offsetHeight || 45;
    // 固定定位，靠近选区终点且保证不超出可视区域。
    var x = Math.min(
      Math.max(8, rect.right - width / 2),
      Math.max(8, global.innerWidth - width - 8)
    );
    var y = rect.top - height - 10;
    if (y < 8) y = Math.min(global.innerHeight - height - 8, rect.bottom + 10);
    bar.style.left = Math.max(8, x) + 'px';
    bar.style.top = Math.max(8, y) + 'px';
  }

  function installListeners() {
    if (listenersInstalled) return;
    listenersInstalled = true;
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') hidePopup();
    });
    global.addEventListener('resize', hidePopup);
    global.addEventListener('scroll', hidePopup, true);
  }

  function reset() {
    hidePopup();
    clearRegistry();
    active = null;
  }

  function mount(card, storageKey) {
    reset();
    if (!card || !storageKey || typeof storageKey !== 'string') return false;
    var root = card.querySelector('.sol-analysis-content');
    var wrapper = card.querySelector('.sol-analysis-body');
    if (!root || !wrapper) return false;

    installListeners();

    // 同一正文重复挂载时也保持幂等（正常切题会重建 card.innerHTML）。
    wrapper.querySelectorAll(':scope > .politics-hl-controls').forEach(function (old) {
      old.remove();
    });

    var controls = document.createElement('div');
    controls.className = 'politics-hl-controls';
    controls.innerHTML =
      '<span class="politics-hl-help">🖍️ 选中文字后，选择蓝 / 黄 / 红荧光笔</span>' +
      '<span class="politics-hl-count" aria-live="polite"></span>' +
      '<button type="button" class="politics-hl-undo">撤销上一笔</button>' +
      '<button type="button" class="politics-hl-clear">清空本题</button>' +
      '<span class="politics-hl-notice" role="status" aria-live="polite"></span>';

    wrapper.insertBefore(controls, root);
    active = {
      root: root,
      key: storageKey,
      marks: storageRead(storageKey),
      count: controls.querySelector('.politics-hl-count'),
      undo: controls.querySelector('.politics-hl-undo'),
      clear: controls.querySelector('.politics-hl-clear'),
      notice: controls.querySelector('.politics-hl-notice')
    };

    active.undo.addEventListener('click', function () {
      if (!active || active.root !== root) return;
      hidePopup();
      if (active.marks.length) {
        active.marks.pop();
        saveAndRender();
      }
    });
    active.clear.addEventListener('click', function () {
      if (!active || active.root !== root || !active.marks.length) return;
      if (!global.confirm('确定清空当前题目解析中的全部荧光标注吗？')) return;
      hidePopup();
      active.marks = [];
      saveAndRender();
    });

    if (!supported()) {
      active.notice.textContent = '当前浏览器不支持文字荧光笔，请使用最新版 Chrome / Edge / Firefox。';
      active.undo.disabled = true;
      active.clear.disabled = true;
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
    // 暴露可测试的文本范围换算，不依赖仓库 app.js 内部状态。
    getOffsets: getOffsets,
    rangeFromOffsets: rangeFromOffsets,
    applyColor: applyColor
  };

  global.PoliticsTextHighlighter = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
