(function () {
  'use strict';

  // ===== 书籍与配色规范 =====
  const MATH_BOOKS = [
    '李林880',
    '基础30讲',
    '强化36讲',
    '1000题',
    '夜雨强化'
  ];

  const MAJOR_BOOKS = [
    '波哥讲义例题',
    '波哥习题集'
  ];

  const BOOK_COLORS = {
    '李林880': '#3B82F6',
    '基础30讲': '#10B981',
    '强化36讲': '#8B5CF6',
    '1000题': '#F59E0B',
    '夜雨强化': '#EF4444',
    '波哥讲义例题': '#2563EB',
    '波哥习题集': '#059669'
  };

  const STORAGE_HISTORY_SUFFIX = 'daily_study_wheel_history_v1';
  const STORAGE_DAILY_SUFFIX = 'daily_study_wheel_daily_v1';

  let currentSubjectId = 'shu1'; // 'shu1' or 'zhuanye'
  let spinning = false;
  let spinTimer = 0;
  let midnightTimer = 0;
  let opener = null;

  function bridge() {
    return window.DailyStudyWheelBridge || window.DailyMathWheelBridge || null;
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

  function getStoragePrefix() {
    const api = bridge();
    let prefix = 'user_guest_';
    if (api && typeof api.getStoragePrefix === 'function') {
      try {
        const val = api.getStoragePrefix();
        if (typeof val === 'string' && val) {
          prefix = val;
        }
      } catch (e) {}
    }
    return prefix;
  }

  function historyStorageKey() {
    return getStoragePrefix() + STORAGE_HISTORY_SUFFIX;
  }

  function dailySalesStorageKey() {
    return getStoragePrefix() + STORAGE_DAILY_SUFFIX;
  }

  // ===== 历史完成池 (永久完成池) =====
  function getHistoryState() {
    try {
      const raw = window.localStorage.getItem(historyStorageKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            schemaVersion: 1,
            math: {
              round: (parsed.math && parsed.math.round) || 1,
              completed: Array.isArray(parsed.math && parsed.math.completed) ? parsed.math.completed : []
            },
            major: {
              round: (parsed.major && parsed.major.round) || 1,
              completed: Array.isArray(parsed.major && parsed.major.completed) ? parsed.major.completed : []
            }
          };
        }
      }
    } catch (e) {
      console.warn('[daily-wheel] load history failed', e);
    }

    return {
      schemaVersion: 1,
      math: { round: 1, completed: [] },
      major: { round: 1, completed: [] }
    };
  }

  function saveHistoryState(state) {
    try {
      window.localStorage.setItem(historyStorageKey(), JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('[daily-wheel] save history failed', e);
      return false;
    }
  }

  // ===== 每日轮次记录 =====
  function getDailyState() {
    const today = localDayKey(new Date());
    try {
      const raw = window.localStorage.getItem(dailySalesStorageKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.date === today) {
          return {
            schemaVersion: 1,
            date: today,
            math: {
              rounds: Array.isArray(parsed.math && parsed.math.rounds) ? parsed.math.rounds : []
            },
            major: {
              rounds: Array.isArray(parsed.major && parsed.major.rounds) ? parsed.major.rounds : []
            }
          };
        }
      }
    } catch (e) {
      console.warn('[daily-wheel] load daily state failed', e);
    }

    return {
      schemaVersion: 1,
      date: today,
      math: { rounds: [] },
      major: { rounds: [] }
    };
  }

  function saveDailyState(state) {
    try {
      window.localStorage.setItem(dailySalesStorageKey(), JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('[daily-wheel] save daily state failed', e);
      return false;
    }
  }

  function getSubjectKey(subjectId) {
    return subjectId === 'zhuanye' ? 'major' : 'math';
  }

  // 获取所有底层候选章节
  function getAllCandidates(subjectId) {
    const api = bridge();
    if (!api || typeof api.getCandidates !== 'function') {
      return [];
    }
    try {
      const items = api.getCandidates(subjectId);
      return Array.isArray(items) ? items.slice() : [];
    } catch (e) {
      console.warn('[daily-wheel] getCandidates failed', e);
      return [];
    }
  }

  // 获得已完成章节 ID 集合
  function getCompletedChapterIdSet(subjectId) {
    const hist = getHistoryState();
    const key = getSubjectKey(subjectId);
    const set = new Set();
    if (hist[key] && Array.isArray(hist[key].completed)) {
      hist[key].completed.forEach(function (c) {
        if (c && c.chapterId) set.add(c.chapterId);
      });
    }
    return set;
  }

  // 获得当天已分配章节 ID 集合
  function getTodayAssignedChapterIdSet(subjectId) {
    const daily = getDailyState();
    const key = getSubjectKey(subjectId);
    const set = new Set();
    if (daily[key] && Array.isArray(daily[key].rounds)) {
      daily[key].rounds.forEach(function (r) {
        if (r && r.chapterId) set.add(r.chapterId);
      });
    }
    return set;
  }

  // 获得当前科目当前轮次可用于转盘抽取的候选章节池
  // activePool = allCandidates - permanentlyCompleted - todayAssigned
  function getActiveCandidates(subjectId) {
    const all = getAllCandidates(subjectId);
    const completedSet = getCompletedChapterIdSet(subjectId);
    const todayAssignedSet = getTodayAssignedChapterIdSet(subjectId);

    return all.filter(function (ch) {
      return !completedSet.has(ch.chapterId) && !todayAssignedSet.has(ch.chapterId);
    });
  }

  // 获取当前正在进行的最新轮次
  function getCurrentRound(subjectId) {
    const daily = getDailyState();
    const key = getSubjectKey(subjectId);
    const rounds = daily[key].rounds;
    if (!rounds || rounds.length === 0) return null;
    return rounds[rounds.length - 1];
  }

  // 检查并同步自动完成状态 (做题率 >= 90%)
  function checkAndUpdateCompletion(subjectId) {
    const round = getCurrentRound(subjectId);
    if (!round || round.status === 'completed') return round;

    const api = bridge();
    if (api && typeof api.getChapterProgress === 'function') {
      try {
        const prog = api.getChapterProgress(subjectId, round.chapterId);
        if (prog && prog.rate >= 0.9) {
          markCurrentRoundCompleted(subjectId);
          return getCurrentRound(subjectId);
        }
      } catch (e) {}
    }
    return round;
  }

  // 标记当前轮次为已完成
  function markCurrentRoundCompleted(subjectId) {
    const daily = getDailyState();
    const key = getSubjectKey(subjectId);
    const rounds = daily[key].rounds;
    if (!rounds || rounds.length === 0) return false;

    const cur = rounds[rounds.length - 1];
    if (cur.status === 'completed') return true;

    cur.status = 'completed';
    cur.completedAt = localDayKey(new Date());
    saveDailyState(daily);

    // 加入永久完成池
    const hist = getHistoryState();
    const already = hist[key].completed.some(function (c) {
      return c.chapterId === cur.chapterId;
    });

    if (!already) {
      hist[key].completed.push({
        chapterId: cur.chapterId,
        book: cur.book,
        name: cur.name,
        short: cur.short,
        total: cur.total,
        completedAt: cur.completedAt
      });
      saveHistoryState(hist);
    }

    renderAll();
    return true;
  }

  // 开启下一阶段（清空当前科目完成池，重置为新一轮循环）
  function startNextStage(subjectId) {
    const hist = getHistoryState();
    const key = getSubjectKey(subjectId);
    hist[key].round = (hist[key].round || 1) + 1;
    hist[key].completed = [];
    saveHistoryState(hist);
    renderAll();
  }

  // 公平安全随机索引生成
  function secureRandomIndex(length) {
    if (!Number.isInteger(length) || length <= 0) return -1;

    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      const RANGE = 0x100000000;
      const limit = RANGE - (RANGE % length);
      const buf = new Uint32Array(1);
      let val;
      do {
        window.crypto.getRandomValues(buf);
        val = buf[0];
      } while (val >= limit);
      return val % length;
    }

    return Math.floor(Math.random() * length);
  }

  function normalizeDeg(value) {
    const mod = Number(value || 0) % 360;
    return mod < 0 ? mod + 360 : mod;
  }

  function restRotationForIndex(index, count) {
    if (!Number.isInteger(index) || index < 0 || !Number.isInteger(count) || count <= 0 || index >= count) {
      return 0;
    }
    const slice = 360 / count;
    // Canvas 第一片中心从 -90deg 开始，指针固定在顶部 -90deg
    const raw = -(index + 0.5) * slice;
    return normalizeDeg(raw);
  }

  function getCanvas() {
    return document.getElementById('dailyMathWheelCanvas');
  }

  // 绘制转盘
  function drawWheel(candidates) {
    const canvas = getCanvas();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cssSize = Math.max(260, Math.min(rect.width || 440, 440));
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssSize, cssSize);

    const cx = cssSize / 2;
    const cy = cssSize / 2;
    const radius = cssSize / 2 - 5;

    if (!candidates || candidates.length === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#E5E7EB';
      ctx.fill();

      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '600 14px system-ui, sans-serif';
      ctx.fillText('本阶段无剩余章节', cx, cy);
      return;
    }

    const count = candidates.length;
    const slice = (Math.PI * 2) / count;
    const startBase = -Math.PI / 2;
    const showLabels = count <= 28;

    candidates.forEach(function (item, index) {
      const start = startBase + slice * index;
      const end = start + slice;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();

      ctx.fillStyle = BOOK_COLORS[item.book] || '#3B82F6';
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (showLabels) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + slice / 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.font = '600 10px system-ui, sans-serif';

        const label = String(item.short || item.name || '').replace(/^第/, '');
        ctx.fillText(label.length > 12 ? label.slice(0, 11) + '…' : label, radius - 10, 0);
        ctx.restore();
      }
    });

    // 中心白色轮毂
    ctx.beginPath();
    ctx.arc(cx, cy, cssSize * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 渲染图例
  function renderLegend() {
    const container = document.getElementById('dailyMathWheelLegend');
    if (!container) return;

    const books = currentSubjectId === 'zhuanye' ? MAJOR_BOOKS : MATH_BOOKS;
    container.innerHTML = books.map(function (b) {
      const col = BOOK_COLORS[b] || '#3B82F6';
      return '<span class="daily-math-wheel-legend-item">' +
        '<i style="background:' + col + '"></i>' +
        '<span>' + b + '</span>' +
        '</span>';
    }).join('');
  }

  // 渲染推进进度条与阶段状态
  function renderProgressInfo() {
    const all = getAllCandidates(currentSubjectId);
    const hist = getHistoryState();
    const key = getSubjectKey(currentSubjectId);
    const stage = hist[key].round || 1;
    const completedCount = hist[key].completed.length;
    const totalCount = all.length;
    const remainingCount = Math.max(0, totalCount - completedCount);
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const stageNode = document.getElementById('studyWheelStageInfo');
    if (stageNode) {
      stageNode.innerHTML = '<span>第 ' + stage + ' 阶段推进</span> · <span>完成 ' + completedCount + '/' + totalCount + ' 章 (' + pct + '%)</span> · <span>剩余 ' + remainingCount + ' 章</span>';
    }

    const fillNode = document.getElementById('studyWheelProgressFill');
    if (fillNode) {
      fillNode.style.width = pct + '%';
    }

    // 全部完成 banner
    const nextStageBox = document.getElementById('studyWheelNextStageBox');
    if (nextStageBox) {
      if (remainingCount === 0 && totalCount > 0) {
        nextStageBox.style.display = 'block';
      } else {
        nextStageBox.style.display = 'none';
      }
    }
  }

  // 渲染结果卡片与所有动作按钮
  function renderResultAndActions() {
    checkAndUpdateCompletion(currentSubjectId);

    const round = getCurrentRound(currentSubjectId);
    const all = getAllCandidates(currentSubjectId);
    const completedSet = getCompletedChapterIdSet(currentSubjectId);
    const remainingCount = Math.max(0, all.length - completedSet.size);

    const kickerNode = document.getElementById('studyWheelRoundKicker');
    const bookNode = document.getElementById('dailyMathWheelResultBook');
    const nameNode = document.getElementById('dailyMathWheelResultName');
    const metaNode = document.getElementById('dailyMathWheelResultMeta');

    const spinBtn = document.getElementById('btnDailyMathWheelSpin');
    const centerBtn = document.getElementById('btnDailyMathWheelSpinCenter');
    const startBtn = document.getElementById('btnDailyMathWheelStart');
    const completeBtn = document.getElementById('btnStudyWheelComplete');
    const addRoundBtn = document.getElementById('btnStudyWheelAddRound');

    if (!round) {
      if (kickerNode) kickerNode.textContent = '今日尚未抽取';
      if (bookNode) bookNode.textContent = currentSubjectId === 'zhuanye' ? '专业课' : '数学';
      if (nameNode) nameNode.textContent = '点击开始，让今天的学习推进交给转盘';
      if (metaNode) metaNode.textContent = '';

      if (spinBtn) {
        spinBtn.disabled = remainingCount === 0;
        spinBtn.style.display = '';
        spinBtn.textContent = '开始旋转';
      }
      if (centerBtn) {
        centerBtn.disabled = remainingCount === 0;
        centerBtn.textContent = '开始';
      }
      if (startBtn) startBtn.disabled = true;
      if (completeBtn) completeBtn.style.display = 'none';
      if (addRoundBtn) addRoundBtn.style.display = 'none';
      return;
    }

    const isDone = round.status === 'completed';

    if (kickerNode) {
      kickerNode.textContent = '今日第 ' + round.round + ' 轮 · ' + (isDone ? '✅ 已完成' : '⏳ 进行中');
    }
    if (bookNode) bookNode.textContent = round.book || '';
    if (nameNode) nameNode.textContent = round.short || round.name || round.chapterId;
    if (metaNode) {
      metaNode.textContent = [
        round.subject || '',
        round.total ? String(round.total) + ' 题' : ''
      ].filter(Boolean).join(' · ');
    }

    // 旋转按钮控制
    if (spinBtn) {
      spinBtn.style.display = isDone ? 'none' : '';
      spinBtn.disabled = true;
      spinBtn.textContent = '当前轮进行中';
    }
    if (centerBtn) {
      centerBtn.disabled = true;
      centerBtn.textContent = isDone ? '已完成' : '进行中';
    }

    // 开始学习按钮
    if (startBtn) {
      startBtn.disabled = false;
    }

    // 手动完成按钮：进行中时显示
    if (completeBtn) {
      completeBtn.style.display = isDone ? 'none' : '';
      completeBtn.disabled = false;
    }

    // 继续加量按钮：完成上一轮后展示并可用
    if (addRoundBtn) {
      if (isDone) {
        addRoundBtn.style.display = '';
        if (remainingCount === 0) {
          addRoundBtn.disabled = true;
          addRoundBtn.textContent = '本阶段已无剩余章节';
        } else {
          addRoundBtn.disabled = false;
          addRoundBtn.textContent = '🔥 状态很好，继续加量';
        }
      } else {
        addRoundBtn.style.display = 'none';
      }
    }
  }

  // 渲染 Header 顶部导航小部件
  function renderHeaderWidgets() {
    ['shu1', 'zhuanye'].forEach(function (subjId) {
      const btn = document.getElementById(subjId === 'zhuanye' ? 'dailyMajorWheelButton' : 'dailyMathWheelButton');
      const sub = document.getElementById(subjId === 'zhuanye' ? 'dailyMajorWheelSummary' : 'dailyMathWheelSummary');
      if (!btn) return;

      const round = getCurrentRound(subjId);
      if (!round) {
        if (sub) sub.textContent = '今日未抽取';
        return;
      }

      if (round.status === 'completed') {
        const daily = getDailyState();
        const key = getSubjectKey(subjId);
        const count = (daily[key].rounds || []).filter(function (r) { return r.status === 'completed'; }).length;
        if (sub) sub.textContent = '今日已完成 ' + count + ' 轮';
      } else {
        if (sub) sub.textContent = '第' + round.round + '轮 · ' + (round.short || round.name || round.book);
      }
    });
  }

  function renderAll() {
    const active = getActiveCandidates(currentSubjectId);
    drawWheel(active);
    renderLegend();
    renderProgressInfo();
    renderResultAndActions();
    renderHeaderWidgets();

    // 更新 Tab 高亮
    if (typeof document.querySelectorAll === 'function') {
      document.querySelectorAll('.study-wheel-tab').forEach(function (tab) {
        const sid = tab.getAttribute('data-subject-id');
        if (sid === currentSubjectId) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    }
  }

  // 核心旋转逻辑（支持第 1 轮或第 N 轮加量）
  function spin() {
    if (spinning) return;

    const active = getActiveCandidates(currentSubjectId);
    if (!active || active.length === 0) {
      window.alert('当前科目在第一阶段已推进完毕！请点击“开启下一阶段”重新开启新一轮复习。');
      return;
    }

    // 严禁未完成当前轮即开新轮
    const curRound = getCurrentRound(currentSubjectId);
    if (curRound && curRound.status !== 'completed') {
      window.alert('请先完成当前轮任务，再开启下一轮加量！');
      return;
    }

    const pickedIndex = secureRandomIndex(active.length);
    if (pickedIndex < 0) return;

    const picked = active[pickedIndex];

    // ===== 极其关键：动画前立刻向 localStorage 写入落地，防刷新作弊 =====
    const daily = getDailyState();
    const key = getSubjectKey(currentSubjectId);
    const nextRoundNumber = (daily[key].rounds.length) + 1;

    const newRound = {
      round: nextRoundNumber,
      chapterId: picked.chapterId,
      book: picked.book,
      subject: picked.subject,
      name: picked.name,
      short: picked.short,
      total: picked.total,
      status: 'doing',
      rolledAt: Date.now()
    };

    daily[key].rounds.push(newRound);
    const ok = saveDailyState(daily);

    // 向后兼容写入单机数学转盘旧存储
    if (currentSubjectId === 'shu1') {
      try {
        window.localStorage.setItem(getStoragePrefix() + 'daily_math_wheel_v1', JSON.stringify({
          schemaVersion: 1,
          date: daily.date,
          rolledAt: newRound.rolledAt,
          result: {
            subjectId: 'shu1',
            chapterId: picked.chapterId,
            book: picked.book,
            subject: picked.subject,
            name: picked.name,
            short: picked.short,
            total: picked.total
          }
        }));
      } catch (e) {}
    }

    if (!ok) {
      window.alert('转盘结果保存失败，请检查浏览器本地存储。');
      return;
    }

    spinning = true;
    renderAll();

    const canvas = getCanvas();
    if (!canvas) {
      spinning = false;
      renderAll();
      return;
    }

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 250 : 4300;
    const finalRest = restRotationForIndex(pickedIndex, active.length);
    const extraTurns = reduceMotion ? 1 : 8 + Math.floor(Math.random() * 4);
    const finalDeg = extraTurns * 360 + finalRest;

    canvas.style.transition = 'transform ' + duration + 'ms cubic-bezier(.12,.72,.08,1)';
    void canvas.offsetWidth; // 触发 reflow

    requestAnimationFrame(function () {
      canvas.style.transform = 'rotate(' + finalDeg + 'deg)';
    });

    clearTimeout(spinTimer);
    spinTimer = window.setTimeout(function () {
      canvas.style.transition = 'none';
      canvas.style.transform = 'rotate(' + finalRest + 'deg)';
      spinning = false;
      renderAll();
    }, duration + 40);
  }

  // 开始学习跳转
  function openSelectedChapter() {
    const round = getCurrentRound(currentSubjectId);
    if (!round) return;

    const api = bridge();
    if (!api || typeof api.openChapter !== 'function') {
      window.alert('章节跳转功能暂不可用，请刷新页面后重试。');
      return;
    }

    const ok = api.openChapter(currentSubjectId, round.chapterId);
    if (ok !== false) {
      closeModal();
    }
  }

  function openModal(subjectId, event) {
    if (subjectId === 'zhuanye' || subjectId === 'shu1') {
      currentSubjectId = subjectId;
    }

    const modal = document.getElementById('dailyMathWheelModal') || document.getElementById('dailyStudyWheelModal');
    if (!modal) return;

    opener = (event && event.currentTarget) || document.activeElement;
    modal.hidden = false;
    modal.style.display = 'flex';

    renderAll();

    const closeButton = document.getElementById('btnCloseDailyMathWheel');
    if (closeButton) closeButton.focus();
  }

  function closeModal() {
    const modal = document.getElementById('dailyMathWheelModal') || document.getElementById('dailyStudyWheelModal');
    if (!modal) return;

    modal.hidden = true;
    modal.style.display = 'none';

    if (opener && typeof opener.focus === 'function') {
      opener.focus();
    }
  }

  function scheduleMidnightRefresh() {
    clearTimeout(midnightTimer);
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    midnightTimer = window.setTimeout(function () {
      renderAll();
      scheduleMidnightRefresh();
    }, Math.max(1000, next.getTime() - now.getTime()));
  }

  function bind() {
    const mathBtn = document.getElementById('dailyMathWheelButton');
    const majorBtn = document.getElementById('dailyMajorWheelButton');
    const closeBtn = document.getElementById('btnCloseDailyMathWheel');
    const spinBtn = document.getElementById('btnDailyMathWheelSpin');
    const centerBtn = document.getElementById('btnDailyMathWheelSpinCenter');
    const startBtn = document.getElementById('btnDailyMathWheelStart');
    const completeBtn = document.getElementById('btnStudyWheelComplete');
    const addRoundBtn = document.getElementById('btnStudyWheelAddRound');
    const nextStageBtn = document.getElementById('btnStudyWheelNextStage');
    const modal = document.getElementById('dailyMathWheelModal') || document.getElementById('dailyStudyWheelModal');

    if (mathBtn) {
      mathBtn.addEventListener('click', function (e) { openModal('shu1', e); });
    }
    if (majorBtn) {
      majorBtn.addEventListener('click', function (e) { openModal('zhuanye', e); });
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    if (spinBtn) {
      spinBtn.addEventListener('click', spin);
    }
    if (centerBtn) {
      centerBtn.addEventListener('click', spin);
    }
    if (startBtn) {
      startBtn.addEventListener('click', openSelectedChapter);
    }
    if (completeBtn) {
      completeBtn.addEventListener('click', function () {
        markCurrentRoundCompleted(currentSubjectId);
      });
    }
    if (addRoundBtn) {
      addRoundBtn.addEventListener('click', spin);
    }
    if (nextStageBtn) {
      nextStageBtn.addEventListener('click', function () {
        if (window.confirm('确定开启下一阶段吗？当前科目的完成池将被重置，进入第 ' + ((getHistoryState()[getSubjectKey(currentSubjectId)].round || 1) + 1) + ' 阶段复习。')) {
          startNextStage(currentSubjectId);
        }
      });
    }

    // Tab 切换
    if (typeof document.querySelectorAll === 'function') {
      document.querySelectorAll('.study-wheel-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
          const sid = tab.getAttribute('data-subject-id');
          if (sid && sid !== currentSubjectId) {
            currentSubjectId = sid;
            renderAll();
          }
        });
      });
    }

    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (modal && !modal.hidden && modal.style.display !== 'none') {
        closeModal();
      }
    });

    window.addEventListener('resize', function () {
      if (modal && !modal.hidden && modal.style.display !== 'none') {
        renderAll();
      }
    });
  }

  function init() {
    bind();
    renderAll();
    scheduleMidnightRefresh();
  }

  // 暴露外部 API
  window.DailyStudyWheel = {
    init: init,
    render: renderAll,
    openModal: openModal,
    closeModal: closeModal,
    spin: spin,
    getHistoryState: getHistoryState,
    saveHistoryState: saveHistoryState,
    getDailyState: getDailyState,
    saveDailyState: saveDailyState,
    getActiveCandidates: getActiveCandidates,
    getAllCandidates: getAllCandidates,
    getCurrentRound: getCurrentRound,
    markCurrentRoundCompleted: markCurrentRoundCompleted,
    startNextStage: startNextStage,
    secureRandomIndex: secureRandomIndex,
    restRotationForIndex: restRotationForIndex,
    localDayKey: localDayKey,
    MATH_BOOKS: MATH_BOOKS,
    MAJOR_BOOKS: MAJOR_BOOKS,
    BOOK_COLORS: BOOK_COLORS
  };

  // 向后兼容保留 DailyMathWheel
  window.DailyMathWheel = {
    init: init,
    render: renderAll,
    getTodayResult: function () {
      const r = getCurrentRound('shu1');
      if (r) return r;
      try {
        const raw = window.localStorage.getItem(getStoragePrefix() + 'daily_math_wheel_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.date === localDayKey(new Date()) && parsed.result) {
            return parsed.result;
          }
        }
      } catch (e) {}
      return null;
    },
    BOOKS: MATH_BOOKS,
    COLORS: BOOK_COLORS,
    restRotationForIndex: restRotationForIndex,
    secureRandomIndex: secureRandomIndex,
    localDayKey: localDayKey
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
