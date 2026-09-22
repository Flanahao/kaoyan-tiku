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

  const DAILY_WHEEL_CONFIG = Object.freeze({
    size: 360,
    radius: 160,
    pointerSize: 24,
    animationDuration: 4500
  });

  const STORAGE_HISTORY_SUFFIX = 'daily_study_wheel_history_v1';
  const STORAGE_ROUNDS_V2_SUFFIX = 'daily_study_wheel_rounds_v2';
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

  function dailyRoundsV2StorageKey() {
    return getStoragePrefix() + STORAGE_ROUNDS_V2_SUFFIX;
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

  // ===== 每日轮次记录 (v2 优先，向下兼容 v1) =====
  function normalizeRoundStatus(round) {
    if (!round || typeof round !== 'object') return round;
    const copy = Object.assign({}, round);
    if (copy.status === 'doing') {
      copy.status = 'active';
    }
    return copy;
  }

  function createRoundList(arr) {
    const list = Array.isArray(arr) ? arr.map(normalizeRoundStatus) : [];
    Object.defineProperty(list, 'rounds', {
      get: function () { return this; },
      enumerable: false,
      configurable: true
    });
    return list;
  }

  function getDailyState() {
    const today = localDayKey(new Date());
    try {
      const rawV2 = window.localStorage.getItem(dailyRoundsV2StorageKey());
      if (rawV2) {
        const parsedV2 = JSON.parse(rawV2);
        if (parsedV2 && parsedV2.date === today) {
          return {
            schemaVersion: 2,
            date: today,
            math: createRoundList(Array.isArray(parsedV2.math) ? parsedV2.math : (parsedV2.math && parsedV2.math.rounds)),
            major: createRoundList(Array.isArray(parsedV2.major) ? parsedV2.major : (parsedV2.major && parsedV2.major.rounds))
          };
        }
      }

      // Legacy fallback: daily_study_wheel_daily_v1
      const rawV1 = window.localStorage.getItem(dailySalesStorageKey());
      if (rawV1) {
        const parsedV1 = JSON.parse(rawV1);
        if (parsedV1 && parsedV1.date === today) {
          const stateV2 = {
            schemaVersion: 2,
            date: today,
            math: createRoundList(parsedV1.math && parsedV1.math.rounds),
            major: createRoundList(parsedV1.major && parsedV1.major.rounds)
          };
          saveDailyState(stateV2);
          return stateV2;
        }
      }
    } catch (e) {
      console.warn('[daily-wheel] load daily state failed', e);
    }

    return {
      schemaVersion: 2,
      date: today,
      math: createRoundList([]),
      major: createRoundList([])
    };
  }

  function saveDailyState(state) {
    try {
      const today = localDayKey(new Date());
      const mathRounds = Array.isArray(state.math) ? state.math : (Array.isArray(state.math && state.math.rounds) ? state.math.rounds : []);
      const majorRounds = Array.isArray(state.major) ? state.major : (Array.isArray(state.major && state.major.rounds) ? state.major.rounds : []);

      const stateToSave = {
        schemaVersion: 2,
        date: state.date || today,
        math: mathRounds,
        major: majorRounds
      };
      window.localStorage.setItem(dailyRoundsV2StorageKey(), JSON.stringify(stateToSave));

      // Dual-write legacy V1
      const legacyV1 = {
        schemaVersion: 1,
        date: stateToSave.date,
        math: { rounds: mathRounds },
        major: { rounds: majorRounds }
      };
      window.localStorage.setItem(dailySalesStorageKey(), JSON.stringify(legacyV1));
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

  function getSubjectRounds(daily, subjectId) {
    const key = getSubjectKey(subjectId);
    if (!daily || !daily[key]) return [];
    return Array.isArray(daily[key]) ? daily[key] : (daily[key].rounds || []);
  }

  // 获得当天已分配章节 ID 集合
  function getTodayAssignedChapterIdSet(subjectId) {
    const daily = getDailyState();
    const rounds = getSubjectRounds(daily, subjectId);
    const set = new Set();
    rounds.forEach(function (r) {
      if (r && r.chapterId) set.add(r.chapterId);
    });
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
    const rounds = getSubjectRounds(daily, subjectId);
    if (!rounds || rounds.length === 0) return null;
    return rounds[rounds.length - 1];
  }

  // 检查是否支持撤销上一轮
  function canUndo(subjectId) {
    const daily = getDailyState();
    const rounds = getSubjectRounds(daily, subjectId);
    if (!rounds || rounds.length === 0) return false;

    // 多于 1 轮时：可撤回上一轮
    if (rounds.length > 1) return true;

    // 仅有 1 轮且该轮已完成：可撤回 active 进行中
    if (rounds.length === 1 && rounds[0].status === 'completed') return true;

    return false;
  }

  // 撤销上一轮操作 (仅撤销当日轮次流程状态，不删除永久完成记录，不重进随机池)
  function undoLastRound(subjectId) {
    const daily = getDailyState();
    const key = getSubjectKey(subjectId);
    const rounds = getSubjectRounds(daily, subjectId);
    if (!rounds || rounds.length === 0) return false;

    const cur = rounds[rounds.length - 1];

    if (rounds.length > 1) {
      // 弹出当前轮次，将上一轮状态恢复为 active 进行中
      rounds.pop();
      const prev = rounds[rounds.length - 1];
      if (prev) {
        prev.status = 'active';
        delete prev.completedAt;
      }
    } else if (rounds.length === 1 && cur.status === 'completed') {
      // 撤销第 1 轮完成状态，恢复为 active 进行中
      cur.status = 'active';
      delete cur.completedAt;
    } else {
      return false;
    }

    daily[key] = rounds;
    saveDailyState(daily);
    renderAll();
    return true;
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
    const rounds = getSubjectRounds(daily, subjectId);
    if (!rounds || rounds.length === 0) return false;

    const cur = rounds[rounds.length - 1];
    if (cur.status === 'completed') return true;

    cur.status = 'completed';
    cur.completedAt = localDayKey(new Date());
    daily[key] = rounds;
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

  // 绘制转盘 (统一样式与尺寸规格)
  function drawWheel(candidates, targetCanvas) {
    const canvas = targetCanvas || getCanvas();
    if (!canvas) return;

    const baseSize = DAILY_WHEEL_CONFIG.size;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

    canvas.width = Math.round(baseSize * dpr);
    canvas.height = Math.round(baseSize * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, baseSize, baseSize);

    const cx = baseSize / 2;
    const cy = baseSize / 2;
    const radius = DAILY_WHEEL_CONFIG.radius;

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
    ctx.arc(cx, cy, baseSize * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const DailyStudyWheelRenderer = {
    config: DAILY_WHEEL_CONFIG,
    drawWheel: drawWheel,
    draw: drawWheel
  };

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
    const laterCloseBtn = document.getElementById('btnStudyWheelLaterClose');
    const undoRoundBtn = document.getElementById('btnStudyWheelUndoRound');

    const undoPossible = canUndo(currentSubjectId);

    if (undoRoundBtn) {
      undoRoundBtn.style.display = undoPossible ? '' : 'none';
      undoRoundBtn.disabled = !undoPossible;
    }

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
      if (startBtn) {
        startBtn.style.display = '';
        startBtn.disabled = true;
      }
      if (completeBtn) completeBtn.style.display = 'none';
      if (addRoundBtn) addRoundBtn.style.display = 'none';
      if (laterCloseBtn) laterCloseBtn.style.display = 'none';
      return;
    }

    const isDone = round.status === 'completed';

    if (kickerNode) {
      kickerNode.textContent = '今日第 ' + round.round + ' 轮 · ' + (isDone ? '✅ 已完成' : '⏳ 进行中');
    }
    if (bookNode) bookNode.textContent = round.book || '';
    if (nameNode) {
      if (isDone) {
        nameNode.textContent = '🎉 本轮完成，继续挑战下一轮？';
      } else {
        nameNode.textContent = round.short || round.name || round.chapterId;
      }
    }
    if (metaNode) {
      if (isDone) {
        metaNode.textContent = '已学章节：' + (round.short || round.name || round.chapterId) + (round.total ? ' (' + round.total + ' 题)' : '');
      } else {
        metaNode.textContent = [
          round.subject || '',
          round.total ? String(round.total) + ' 题' : ''
        ].filter(Boolean).join(' · ');
      }
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
      startBtn.style.display = isDone ? 'none' : '';
      startBtn.disabled = isDone;
    }

    // 手动完成按钮：进行中时显示
    if (completeBtn) {
      completeBtn.style.display = isDone ? 'none' : '';
      completeBtn.disabled = false;
      completeBtn.textContent = '完成本轮学习';
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
          addRoundBtn.textContent = '🔥 继续加量';
        }
      } else {
        addRoundBtn.style.display = 'none';
      }
    }

    // 稍后结束按钮
    if (laterCloseBtn) {
      laterCloseBtn.style.display = isDone ? '' : 'none';
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
        const rounds = getSubjectRounds(daily, subjId);
        const count = rounds.filter(function (r) { return r.status === 'completed'; }).length;
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
    const rounds = getSubjectRounds(daily, currentSubjectId);
    const nextRoundNumber = rounds.length + 1;

    const newRound = {
      round: nextRoundNumber,
      chapterId: picked.chapterId,
      book: picked.book,
      subject: picked.subject,
      name: picked.name,
      short: picked.short,
      total: picked.total,
      status: 'active',
      rolledAt: Date.now()
    };

    rounds.push(newRound);
    daily[key] = rounds;
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
    const duration = reduceMotion ? 250 : DAILY_WHEEL_CONFIG.animationDuration;
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
    const laterCloseBtn = document.getElementById('btnStudyWheelLaterClose');
    const undoRoundBtn = document.getElementById('btnStudyWheelUndoRound');
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
        if (window.confirm('确认已完成本轮学习？完成后将记录本轮进度。')) {
          markCurrentRoundCompleted(currentSubjectId);
        }
      });
    }
    if (addRoundBtn) {
      addRoundBtn.addEventListener('click', spin);
    }
    if (laterCloseBtn) {
      laterCloseBtn.addEventListener('click', closeModal);
    }
    if (undoRoundBtn) {
      undoRoundBtn.addEventListener('click', function () {
        if (window.confirm('确认撤销上一轮操作，恢复到上一轮进行中状态？')) {
          undoLastRound(currentSubjectId);
        }
      });
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
    isSpinning: function () { return spinning; },
    getHistoryState: getHistoryState,
    saveHistoryState: saveHistoryState,
    getDailyState: getDailyState,
    saveDailyState: saveDailyState,
    getActiveCandidates: getActiveCandidates,
    getAllCandidates: getAllCandidates,
    getCurrentRound: getCurrentRound,
    markCurrentRoundCompleted: markCurrentRoundCompleted,
    undoLastRound: undoLastRound,
    canUndo: canUndo,
    startNextStage: startNextStage,
    secureRandomIndex: secureRandomIndex,
    restRotationForIndex: restRotationForIndex,
    localDayKey: localDayKey,
    MATH_BOOKS: MATH_BOOKS,
    MAJOR_BOOKS: MAJOR_BOOKS,
    BOOK_COLORS: BOOK_COLORS,
    CONFIG: DAILY_WHEEL_CONFIG,
    DailyStudyWheelRenderer: DailyStudyWheelRenderer
  };

  window.DailyStudyWheelRenderer = DailyStudyWheelRenderer;

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
