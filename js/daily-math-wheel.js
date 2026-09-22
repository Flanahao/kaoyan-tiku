(function () {
  'use strict';

  const BOOKS = [
    '李林880',
    '基础30讲',
    '强化36讲',
    '1000题',
    '夜雨强化'
  ];

  const COLORS = {
    '李林880': '#3B82F6',
    '基础30讲': '#10B981',
    '强化36讲': '#8B5CF6',
    '1000题': '#F59E0B',
    '夜雨强化': '#EF4444'
  };

  const STORAGE_SUFFIX = 'daily_math_wheel_v1';

  let spinning = false;
  let spinTimer = 0;
  let midnightTimer = 0;
  let opener = null;

  function bridge() {
    return window.DailyMathWheelBridge || null;
  }

  function localDayKey(input) {
    const date = input instanceof Date
      ? input
      : new Date(input || Date.now());

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');
  }

  function storageKey() {
    const api = bridge();

    let prefix = 'user_guest_';

    if (
      api &&
      typeof api.getStoragePrefix === 'function'
    ) {
      try {
        const value = api.getStoragePrefix();

        if (typeof value === 'string' && value) {
          prefix = value;
        }
      } catch (error) {}
    }

    return prefix + STORAGE_SUFFIX;
  }

  function readStoredState() {
    try {
      const raw = window.localStorage.getItem(storageKey());

      if (!raw) return null;

      const parsed = JSON.parse(raw);

      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      return parsed;
    } catch (error) {
      console.warn('[daily-wheel] read failed', error);
      return null;
    }
  }

  function writeStoredState(value) {
    try {
      window.localStorage.setItem(
        storageKey(),
        JSON.stringify(value)
      );

      return true;
    } catch (error) {
      console.warn('[daily-wheel] write failed', error);
      return false;
    }
  }

  function getTodayResult() {
    const state = readStoredState();

    if (!state) return null;

    if (state.date !== localDayKey(new Date())) {
      return null;
    }

    if (!state.result || !state.result.chapterId) {
      return null;
    }

    return state.result;
  }

  function getCandidates() {
    const api = bridge();

    if (
      !api ||
      typeof api.getCandidates !== 'function'
    ) {
      return [];
    }

    try {
      const items = api.getCandidates();

      return Array.isArray(items)
        ? items.slice()
        : [];
    } catch (error) {
      console.warn('[daily-wheel] candidate loading failed', error);
      return [];
    }
  }

  function secureRandomIndex(length) {
    if (!Number.isInteger(length) || length <= 0) {
      return -1;
    }

    if (
      window.crypto &&
      typeof window.crypto.getRandomValues === 'function'
    ) {
      const RANGE = 0x100000000;
      const limit = RANGE - (RANGE % length);
      const buf = new Uint32Array(1);

      let value;

      do {
        window.crypto.getRandomValues(buf);
        value = buf[0];
      } while (value >= limit);

      return value % length;
    }

    return Math.floor(Math.random() * length);
  }

  function normalizeDeg(value) {
    const mod = Number(value || 0) % 360;
    return mod < 0 ? mod + 360 : mod;
  }

  function restRotationForIndex(index, count) {
    if (
      !Number.isInteger(index) ||
      index < 0 ||
      !Number.isInteger(count) ||
      count <= 0 ||
      index >= count
    ) {
      return 0;
    }

    const slice = 360 / count;

    // Canvas 第一片从 -90deg 开始，
    // 指针也固定在顶部 -90deg。
    const raw = -(index + 0.5) * slice;

    return normalizeDeg(raw);
  }

  function getCanvas() {
    return document.getElementById('dailyMathWheelCanvas');
  }

  function drawWheel(candidates) {
    const canvas = getCanvas();

    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cssSize = Math.max(
      260,
      Math.min(rect.width || 440, 440)
    );

    const dpr = Math.max(
      1,
      Math.min(window.devicePixelRatio || 1, 2)
    );

    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssSize, cssSize);

    const cx = cssSize / 2;
    const cy = cssSize / 2;
    const radius = cssSize / 2 - 5;

    if (!candidates.length) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#E5E7EB';
      ctx.fill();

      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '600 14px system-ui, sans-serif';
      ctx.fillText('暂无可用章节', cx, cy);

      return;
    }

    const count = candidates.length;
    const slice = Math.PI * 2 / count;
    const startBase = -Math.PI / 2;
    const showLabels = count <= 28;

    candidates.forEach(function (item, index) {
      const start = startBase + slice * index;
      const end = start + slice;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();

      ctx.fillStyle =
        COLORS[item.book] ||
        '#94A3B8';

      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,.62)';
      ctx.lineWidth = count > 80 ? 0.45 : 1;
      ctx.stroke();

      if (!showLabels) return;

      const center = start + slice / 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(center);

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = '600 10px system-ui, sans-serif';

      const label = String(
        item.short ||
        item.name ||
        ''
      ).replace(/^第/, '');

      ctx.fillText(
        label.length > 12
          ? label.slice(0, 11) + '…'
          : label,
        radius - 10,
        0
      );

      ctx.restore();
    });

    // 中心留白
    ctx.beginPath();
    ctx.arc(cx, cy, cssSize * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function renderLegend() {
    const node =
      document.getElementById('dailyMathWheelLegend');

    if (!node) return;

    node.innerHTML = BOOKS.map(function (book) {
      const color = COLORS[book] || '#94A3B8';

      return (
        '<span class="daily-math-wheel-legend-item">' +
          '<i style="background:' + color + '"></i>' +
          '<span>' + book + '</span>' +
        '</span>'
      );
    }).join('');
  }

  function findResultIndex(
    result,
    candidates
  ) {
    if (!result || !result.chapterId) {
      return -1;
    }

    return candidates.findIndex(function (item) {
      return (
        String(item.chapterId) ===
        String(result.chapterId)
      );
    });
  }

  function setCanvasRotation(deg, animate) {
    const canvas = getCanvas();

    if (!canvas) return;

    if (!animate) {
      canvas.style.transition = 'none';
    }

    canvas.style.transform =
      'rotate(' + deg + 'deg)';
  }

  function renderResult(result) {
    const bookNode =
      document.getElementById(
        'dailyMathWheelResultBook'
      );

    const nameNode =
      document.getElementById(
        'dailyMathWheelResultName'
      );

    const metaNode =
      document.getElementById(
        'dailyMathWheelResultMeta'
      );

    const startButton =
      document.getElementById(
        'btnDailyMathWheelStart'
      );

    const spinButton =
      document.getElementById(
        'btnDailyMathWheelSpin'
      );

    const centerButton =
      document.getElementById(
        'btnDailyMathWheelSpinCenter'
      );

    if (!result) {
      if (bookNode) bookNode.textContent = '尚未抽取';

      if (nameNode) {
        nameNode.textContent =
          '点击开始，让今天的数学安排交给转盘';
      }

      if (metaNode) metaNode.textContent = '';

      if (startButton) {
        startButton.disabled = true;
      }

      if (spinButton) {
        spinButton.disabled = false;
        spinButton.textContent = '开始旋转';
      }

      if (centerButton) {
        centerButton.disabled = false;
        centerButton.textContent = '开始';
      }

      return;
    }

    if (bookNode) {
      bookNode.textContent =
        result.book || '数学';
    }

    if (nameNode) {
      nameNode.textContent =
        result.short ||
        result.name ||
        result.chapterId;
    }

    if (metaNode) {
      metaNode.textContent = [
        result.subject || '',
        result.total
          ? String(result.total) + ' 题'
          : ''
      ].filter(Boolean).join(' · ');
    }

    if (startButton) {
      startButton.disabled = false;
    }

    if (spinButton) {
      spinButton.disabled = true;
      spinButton.textContent = '今日已抽取';
    }

    if (centerButton) {
      centerButton.disabled = true;
      centerButton.textContent = '已抽';
    }
  }

  function renderHeader(result) {
    const node =
      document.getElementById(
        'dailyMathWheelSummary'
      );

    if (!node) return;

    if (!result) {
      node.textContent = '未抽取';
      return;
    }

    const short =
      result.short ||
      result.name ||
      result.chapterId;

    node.textContent =
      String(result.book || '数学') +
      ' · ' +
      String(short);
  }

  function renderAll() {
    const candidates = getCandidates();

    drawWheel(candidates);
    renderLegend();

    const result = getTodayResult();

    renderResult(result);
    renderHeader(result);

    const index =
      findResultIndex(result, candidates);

    if (index >= 0) {
      setCanvasRotation(
        restRotationForIndex(
          index,
          candidates.length
        ),
        false
      );
    } else {
      setCanvasRotation(0, false);
    }
  }

  function lockTodayResult(item) {
    const payload = {
      schemaVersion: 1,
      date: localDayKey(new Date()),
      rolledAt: Date.now(),
      result: {
        subjectId: 'shu1',
        chapterId: item.chapterId,
        book: item.book,
        subject: item.subject || '',
        short: item.short || '',
        name: item.name || '',
        total: Number(item.total) || 0
      }
    };

    const ok = writeStoredState(payload);

    return ok ? payload.result : null;
  }

  function spin() {
    if (spinning) return;

    const existing = getTodayResult();

    if (existing) {
      renderAll();
      return;
    }

    const candidates = getCandidates();

    if (!candidates.length) {
      window.alert(
        '当前没有可用于转盘的数学章节。'
      );

      return;
    }

    const pickedIndex =
      secureRandomIndex(candidates.length);

    if (pickedIndex < 0) return;

    const picked = candidates[pickedIndex];

    // 非常重要：先保存，再开始动画。
    const result = lockTodayResult(picked);

    if (!result) {
      window.alert(
        '今日转盘结果保存失败，请检查浏览器本地存储。'
      );

      return;
    }

    spinning = true;

    renderResult(result);
    renderHeader(result);

    const canvas = getCanvas();

    if (!canvas) {
      spinning = false;
      renderAll();
      return;
    }

    const reduceMotion =
      window.matchMedia &&
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    const duration =
      reduceMotion ? 250 : 4300;

    const finalRest =
      restRotationForIndex(
        pickedIndex,
        candidates.length
      );

    const extraTurns =
      reduceMotion
        ? 1
        : 8 + Math.floor(Math.random() * 4);

    const finalDeg =
      extraTurns * 360 + finalRest;

    canvas.style.transition =
      'transform ' +
      duration +
      'ms cubic-bezier(.12,.72,.08,1)';

    // 强制 layout，让 transition 一定从当前角度启动。
    void canvas.offsetWidth;

    requestAnimationFrame(function () {
      canvas.style.transform =
        'rotate(' + finalDeg + 'deg)';
    });

    clearTimeout(spinTimer);

    spinTimer = window.setTimeout(
      function () {
        canvas.style.transition = 'none';

        canvas.style.transform =
          'rotate(' + finalRest + 'deg)';

        spinning = false;

        renderResult(result);
        renderHeader(result);
      },
      duration + 40
    );
  }

  function openSelectedChapter() {
    const result = getTodayResult();

    if (!result) return;

    const api = bridge();

    if (
      !api ||
      typeof api.openChapter !== 'function'
    ) {
      window.alert(
        '章节跳转功能暂不可用，请刷新页面后重试。'
      );

      return;
    }

    const ok =
      api.openChapter(result.chapterId);

    if (ok !== false) {
      closeModal();
    }
  }

  function openModal(event) {
    const modal =
      document.getElementById(
        'dailyMathWheelModal'
      );

    if (!modal) return;

    opener =
      (event && event.currentTarget) ||
      document.activeElement;

    modal.hidden = false;
    modal.style.display = 'flex';

    renderAll();

    const closeButton =
      document.getElementById(
        'btnCloseDailyMathWheel'
      );

    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeModal() {
    const modal =
      document.getElementById(
        'dailyMathWheelModal'
      );

    if (!modal) return;

    modal.hidden = true;
    modal.style.display = 'none';

    if (
      opener &&
      typeof opener.focus === 'function'
    ) {
      opener.focus();
    }
  }

  function scheduleMidnightRefresh() {
    clearTimeout(midnightTimer);

    const now = new Date();

    const next = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      1
    );

    midnightTimer =
      window.setTimeout(function () {
        renderAll();
        scheduleMidnightRefresh();
      }, Math.max(
        1000,
        next.getTime() - now.getTime()
      ));
  }

  function bind() {
    const openButton =
      document.getElementById(
        'dailyMathWheelButton'
      );

    const closeButton =
      document.getElementById(
        'btnCloseDailyMathWheel'
      );

    const spinButton =
      document.getElementById(
        'btnDailyMathWheelSpin'
      );

    const centerButton =
      document.getElementById(
        'btnDailyMathWheelSpinCenter'
      );

    const startButton =
      document.getElementById(
        'btnDailyMathWheelStart'
      );

    const modal =
      document.getElementById(
        'dailyMathWheelModal'
      );

    if (openButton) {
      openButton.addEventListener(
        'click',
        openModal
      );
    }

    if (closeButton) {
      closeButton.addEventListener(
        'click',
        closeModal
      );
    }

    if (spinButton) {
      spinButton.addEventListener(
        'click',
        spin
      );
    }

    if (centerButton) {
      centerButton.addEventListener(
        'click',
        spin
      );
    }

    if (startButton) {
      startButton.addEventListener(
        'click',
        openSelectedChapter
      );
    }

    if (modal) {
      modal.addEventListener(
        'click',
        function (event) {
          if (event.target === modal) {
            closeModal();
          }
        }
      );
    }

    document.addEventListener(
      'keydown',
      function (event) {
        if (event.key !== 'Escape') return;

        const currentModal =
          document.getElementById(
            'dailyMathWheelModal'
          );

        if (
          currentModal &&
          !currentModal.hidden
        ) {
          closeModal();
        }
      }
    );

    window.addEventListener(
      'resize',
      function () {
        const modal =
          document.getElementById(
            'dailyMathWheelModal'
          );

        if (
          modal &&
          !modal.hidden
        ) {
          renderAll();
        }
      }
    );
  }

  function init() {
    bind();
    renderAll();
    scheduleMidnightRefresh();
  }

  window.DailyMathWheel = {
    init: init,
    render: renderAll,
    getTodayResult: getTodayResult,
    BOOKS: BOOKS,
    COLORS: COLORS,
    restRotationForIndex: restRotationForIndex,
    secureRandomIndex: secureRandomIndex,
    localDayKey: localDayKey,
    readStoredState: readStoredState,
    writeStoredState: writeStoredState
  };

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
