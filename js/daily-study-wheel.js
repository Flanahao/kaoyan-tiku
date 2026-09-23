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
  const STORAGE_UNDO_SUFFIX = 'daily_study_wheel_undo_v1';

  let currentSubjectId = 'shu1'; // 'shu1' or 'zhuanye'
  let spinning = false;
  let spinTimer = 0;
  let midnightTimer = 0;
  let opener = null;
  // 动画期间固定候选快照，避免抽中章节写入 localStorage 后候选池立即缩小，
  // 导致 canvas 的扇区数量与停靠角度不一致。
  let spinCandidates = null;
  let spinPickedIndex = -1;
  let settledRotationDeg = 0;

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

  function undoStorageKey() {
    return getStoragePrefix() + STORAGE_UNDO_SUFFIX;
  }

  function createWheelActionId() {
    return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
  }

  function getUndoState() {
    try {
      const raw = window.localStorage.getItem(undoStorageKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            schemaVersion: 1,
            math: Array.isArray(parsed.math) ? parsed.math : [],
            major: Array.isArray(parsed.major) ? parsed.major : []
          };
        }
      }
    } catch (e) {
      console.warn('[daily-wheel] load undo state failed', e);
    }

    return {
      schemaVersion: 1,
      math: [],
      major: []
    };
  }

  function saveUndoState(state) {
    try {
      window.localStorage.setItem(undoStorageKey(), JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('[daily-wheel] save undo state failed', e);
      return false;
    }
  }

  function pushWheelUndo(subjectKey, undo) {
    const state = getUndoState();
    if (!state[subjectKey]) state[subjectKey] = [];
    state[subjectKey].push(undo);
    saveUndoState(state);
  }

  function popWheelUndo(subjectKey) {
    const state = getUndoState();
    if (!state[subjectKey] || state[subjectKey].length === 0) return null;
    const undo = state[subjectKey].pop();
    saveUndoState(state);
    return undo;
  }

  function restoreWheelUndo(subjectKey, undo) {
    if (!undo) return;
    const state = getUndoState();
    if (!state[subjectKey]) state[subjectKey] = [];
    state[subjectKey].push(undo);
    saveUndoState(state);
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

  // 统一科目 Key 归一化入口
  function normalizeWheelSubjectKey(value) {
    const raw = String(value || '').toLowerCase().trim();
    if (raw === 'math' || raw === 'shu1' || raw === '数学') {
      return 'math';
    }
    if (raw === 'major' || raw === 'zhuanye' || raw === 'professional' || raw === '专业课') {
      return 'major';
    }
    return raw || 'math';
  }

  // 归一化科目内部路由 ID ('shu1' / 'zhuanye')
  function toWheelSubjectId(value) {
    return normalizeWheelSubjectKey(value) === 'major' ? 'zhuanye' : 'shu1';
  }

  function getSubjectKey(subjectId) {
    return normalizeWheelSubjectKey(subjectId);
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

  // 保证已分配且处于 active 进行中状态的轮次，绝不出现于当前阶段的完成池（自愈旧版遗留的脏完成记录）
  function reconcileActiveRoundsWithHistory(subjectId) {
    const daily = getDailyState();
    const key = getSubjectKey(subjectId);
    const rounds = getSubjectRounds(daily, subjectId);
    if (!rounds || rounds.length === 0) return;

    const activeChapterIds = new Set();
    rounds.forEach(function (r) {
      if (r && r.status === 'active' && r.chapterId) {
        activeChapterIds.add(r.chapterId);
      }
    });

    if (activeChapterIds.size > 0) {
      const hist = getHistoryState();
      if (hist[key] && Array.isArray(hist[key].completed)) {
        const originalLen = hist[key].completed.length;
        hist[key].completed = hist[key].completed.filter(function (c) {
          return c && !activeChapterIds.has(c.chapterId);
        });
        if (hist[key].completed.length !== originalLen) {
          saveHistoryState(hist);
        }
      }
    }
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
    const key = getSubjectKey(subjectId);
    const undoState = getUndoState();
    if (undoState[key] && undoState[key].length > 0) {
      return true;
    }

    const daily = getDailyState();
    const rounds = getSubjectRounds(daily, subjectId);
    if (!rounds || rounds.length === 0) return false;

    // 多于 1 轮时：可撤回上一轮
    if (rounds.length > 1) return true;

    // 仅有 1 轮且该轮已完成：可撤回 active 进行中
    if (rounds.length === 1 && rounds[0].status === 'completed') return true;

    return false;
  }

  // 撤销上一轮操作 (事务性回滚：轮次状态恢复 + 删除生成下一轮 + 撤销历史完成池记录 + 动态重绘)
  function undoLastRound(subjectId) {
    const daily = getDailyState();
    const key = getSubjectKey(subjectId);
    const rounds = getSubjectRounds(daily, subjectId);
    if (!rounds || rounds.length === 0) return false;

    const undo = popWheelUndo(key);

    if (undo && undo.action === 'complete-round') {
      let updatedRounds = rounds.slice();

      // 1. 若本次完成动作随后生成了下一轮，精确删除该生成轮次
      if (undo.generatedRoundNumber != null) {
        updatedRounds = updatedRounds.filter(function (r) {
          return r.round !== undo.generatedRoundNumber;
        });
      }

      // 2. 找到上一轮，恢复其进行中状态
      const targetRound = updatedRounds.find(function (r) {
        return r.round === undo.roundNumber;
      });

      if (!targetRound) {
        // 数据异常保护
        restoreWheelUndo(key, undo);
        return false;
      }

      targetRound.status = undo.previousRoundStatus || 'active';
      if (undo.previousCompletedAt) {
        targetRound.completedAt = undo.previousCompletedAt;
      } else {
        delete targetRound.completedAt;
      }

      // 3. 核心修复：无论之前历史状态如何，只要本轮次被撤销恢复为 active 进行中状态，该章节就属于未完成，必须从当前阶段完成池中精确撤回
      const hist = getHistoryState();
      if (hist[key] && Array.isArray(hist[key].completed)) {
        hist[key].completed = hist[key].completed.filter(function (c) {
          if (c.wheelActionId && undo.actionId && c.wheelActionId === undo.actionId) {
            return false;
          }
          if (c.chapterId === undo.chapterId || c.chapterId === targetRound.chapterId) {
            return false;
          }
          return true;
        });
        saveHistoryState(hist);
      }

      daily[key] = updatedRounds;
      saveDailyState(daily);
      reconcileActiveRoundsWithHistory(subjectId);
      renderAll();
      return true;
    }

    // 容错兜底：若无 undo 栈记录（例如旧版本历史数据），执行安全兜底撤销
    const cur = rounds[rounds.length - 1];
    if (rounds.length > 1) {
      rounds.pop();
      const prev = rounds[rounds.length - 1];
      if (prev) {
        prev.status = 'active';
        delete prev.completedAt;
        const hist = getHistoryState();
        if (hist[key] && Array.isArray(hist[key].completed)) {
          hist[key].completed = hist[key].completed.filter(function (c) {
            return c.chapterId !== prev.chapterId;
          });
          saveHistoryState(hist);
        }
      }
    } else if (rounds.length === 1 && cur.status === 'completed') {
      cur.status = 'active';
      delete cur.completedAt;
      const hist = getHistoryState();
      if (hist[key] && Array.isArray(hist[key].completed)) {
        hist[key].completed = hist[key].completed.filter(function (c) {
          return c.chapterId !== cur.chapterId;
        });
        saveHistoryState(hist);
      }
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

  function isWheelChapterCompleted(subjectKey, chapterId) {
    const hist = getHistoryState();
    if (!hist[subjectKey] || !Array.isArray(hist[subjectKey].completed)) return false;
    return hist[subjectKey].completed.some(function (c) {
      return c && c.chapterId === chapterId;
    });
  }

  // 标记当前轮次为已完成（记录事务 Undo 状态）
  function markCurrentRoundCompleted(subjectId) {
    const daily = getDailyState();
    const key = getSubjectKey(subjectId);
    const rounds = getSubjectRounds(daily, subjectId);
    if (!rounds || rounds.length === 0) return false;

    const cur = rounds[rounds.length - 1];
    if (cur.status === 'completed') return true;

    const chapterWasCompletedBefore = isWheelChapterCompleted(key, cur.chapterId);
    const actionId = createWheelActionId();

    const undo = {
      schemaVersion: 1,
      actionId: actionId,
      action: 'complete-round',
      subjectKey: key,
      roundNumber: cur.round,
      chapterId: cur.chapterId,
      previousRoundStatus: cur.status || 'active',
      previousCompletedAt: cur.completedAt || null,
      chapterWasCompletedBefore: chapterWasCompletedBefore,
      completionAddedByThisAction: !chapterWasCompletedBefore,
      generatedRoundNumber: null,
      createdAt: new Date().toISOString()
    };

    cur.status = 'completed';
    cur.completedAt = localDayKey(new Date());
    daily[key] = rounds;
    saveDailyState(daily);

    // 加入永久完成池
    const hist = getHistoryState();
    if (!chapterWasCompletedBefore) {
      hist[key].completed.push({
        chapterId: cur.chapterId,
        book: cur.book,
        name: cur.name,
        short: cur.short,
        total: cur.total,
        completedAt: cur.completedAt,
        source: 'wheel-complete-round',
        wheelActionId: actionId
      });
      saveHistoryState(hist);
    }

    pushWheelUndo(key, undo);

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

  function setCanvasRotation(deg, animate) {
    const canvas = getCanvas();
    if (!canvas) return;
    if (!animate) canvas.style.transition = 'none';
    canvas.style.transform = 'rotate(' + Number(deg || 0) + 'deg)';
  }

  // 当前轮进行中时把已抽中的章节临时放回显示池，保持动画结束后的扇区稳定；
  // 它仍不在 getActiveCandidates 返回的可抽取池里，不会造成重复抽取。
  function getDisplayCandidates(subjectId) {
    if (spinning && spinCandidates && subjectId === currentSubjectId) {
      return spinCandidates.slice();
    }

    const active = getActiveCandidates(subjectId);
    const round = getCurrentRound(subjectId);
    if (!round || round.status !== 'active') return active;

    const all = getAllCandidates(subjectId);
    const selectedIndex = all.findIndex(function (item) {
      return item && String(item.chapterId) === String(round.chapterId);
    });
    if (selectedIndex < 0 || active.some(function (item) {
      return item && String(item.chapterId) === String(round.chapterId);
    })) {
      return active;
    }

    const activeIds = new Set(active.map(function (item) { return item && item.chapterId; }));
    let insertAt = 0;
    for (let i = 0; i < selectedIndex; i += 1) {
      if (all[i] && activeIds.has(all[i].chapterId)) insertAt += 1;
    }
    active.splice(Math.min(insertAt, active.length), 0, all[selectedIndex]);
    return active;
  }

  // 画布尺寸准备函数 (单一尺寸源、同一 Backing store DPR 规则、统一 Radius 比例)
  function prepareStudyWheelCanvas(canvas) {
    if (!canvas) return null;

    const stage =
      (typeof canvas.closest === 'function' && (canvas.closest('.study-wheel-stage') || canvas.closest('.daily-math-wheel-canvas-wrap') || canvas.closest('.daily-math-wheel-stage'))) ||
      canvas.parentElement;

    if (!stage) return null;

    const rect = typeof stage.getBoundingClientRect === 'function'
      ? stage.getBoundingClientRect()
      : { width: 0, height: 0 };

    // 隐藏容器不要用 0 宽初始化
    if (!rect.width || rect.width < 2) {
      if (typeof window === 'undefined' || !window.document || !window.document.body) {
        // 兼容非浏览器沙箱环境
      } else {
        return null;
      }
    }

    const cssSize = Math.floor(rect.width || DAILY_WHEEL_CONFIG.size);
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    const pixelSize = Math.round(cssSize * dpr);

    if (canvas.width !== pixelSize) {
      canvas.width = pixelSize;
    }

    if (canvas.height !== pixelSize) {
      canvas.height = pixelSize;
    }

    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const ctx = typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
    if (!ctx) return null;

    // canvas.width/height 被设置后 transform 会复位，所以这里统一重新设置
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    return {
      ctx: ctx,
      size: cssSize,
      centerX: cssSize / 2,
      centerY: cssSize / 2,
      radius: cssSize * 0.445
    };
  }

  // 绘制转盘 (基于统一 prepareStudyWheelCanvas 规格)
  function drawWheel(candidates, targetCanvas) {
    const canvas = targetCanvas || getCanvas();
    if (!canvas) return;

    const prepared = prepareStudyWheelCanvas(canvas);
    if (!prepared) return;

    const ctx = prepared.ctx;
    const baseSize = prepared.size;
    const cx = prepared.centerX;
    const cy = prepared.centerY;
    const radius = prepared.radius;

    ctx.clearRect(0, 0, baseSize, baseSize);

    if (!candidates || candidates.length === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#E5E7EB';
      ctx.fill();

      ctx.fillStyle = '#64748B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '600 ' + Math.max(12, Math.round(baseSize * 0.04)) + 'px system-ui, sans-serif';
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
        const fontSize = Math.max(9, Math.min(11, Math.round(baseSize * 0.028)));
        ctx.font = '600 ' + fontSize + 'px system-ui, sans-serif';

        const label = String(item.short || item.name || '').replace(/^第/, '');
        ctx.fillText(label.length > 12 ? label.slice(0, 11) + '…' : label, radius - 10, 0);
        ctx.restore();
      }
    });

    // 中心白色轮毂 (按统一比例)
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
    draw: drawWheel,
    prepareStudyWheelCanvas: prepareStudyWheelCanvas
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

  // 派生计算转盘进度（单一真实来源）
  function getWheelProgress(subjectKey) {
    const subjectId = subjectKey === 'major' ? 'zhuanye' : 'shu1';
    reconcileActiveRoundsWithHistory(subjectId);
    const pool = getAllCandidates(subjectId);
    const hist = getHistoryState();
    const key = getSubjectKey(subjectId);
    const completedList = (hist[key] && Array.isArray(hist[key].completed)) ? hist[key].completed : [];
    const completedSet = new Set(completedList.map(function (c) { return c && c.chapterId; }).filter(Boolean));

    const validCompleted = pool.filter(function (item) {
      return completedSet.has(item.chapterId);
    });

    const total = pool.length;
    const completed = validCompleted.length;
    const remaining = Math.max(0, total - completed);
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const stage = (hist[key] && hist[key].round) || 1;

    return {
      stage: stage,
      total: total,
      completed: completed,
      remaining: remaining,
      percent: percent
    };
  }

  // 渲染推进进度条与阶段状态 (严格根据 getWheelProgress 派生)
  function renderProgressInfo() {
    const key = getSubjectKey(currentSubjectId);
    const prog = getWheelProgress(key);

    const stageNode = document.getElementById('studyWheelStageInfo');
    if (stageNode) {
      stageNode.innerHTML = '<span>第 ' + prog.stage + ' 阶段推进</span> · <span>完成 ' + prog.completed + '/' + prog.total + ' 章 (' + prog.percent + '%)</span> · <span>剩余 ' + prog.remaining + ' 章</span>';
    }

    const fillNode = document.getElementById('studyWheelProgressFill');
    if (fillNode) {
      fillNode.style.width = prog.percent + '%';
    }

    // 全部完成 banner
    const nextStageBox = document.getElementById('studyWheelNextStageBox');
    if (nextStageBox) {
      if (prog.remaining === 0 && prog.total > 0) {
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
    const key = getSubjectKey(currentSubjectId);
    const prog = getWheelProgress(key);
    const remainingCount = prog.remaining;

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

  // 获得指定科目今日已完成的有效轮次列表
  function getWheelCompletedRoundsToday(subjectKey) {
    const key = normalizeWheelSubjectKey(subjectKey);
    const daily = getDailyState();
    const rounds = getSubjectRounds(daily, key);
    return rounds.filter(function (round) {
      return round && round.status === 'completed';
    });
  }

  // 获得指定科目当前活跃进行中的轮次
  function getActiveWheelRound(subjectKey) {
    const key = normalizeWheelSubjectKey(subjectKey);
    const daily = getDailyState();
    const rounds = getSubjectRounds(daily, key);
    for (let i = rounds.length - 1; i >= 0; i--) {
      if (rounds[i] && rounds[i].status === 'active') {
        return rounds[i];
      }
    }
    return null;
  }

  // 派生 Header 转盘小部件视觉状态：'progressed' | 'active' | 'idle'
  // 语义：只要今天已至少推进/完成过 1 个轮次，即呈现 .is-progressed 完成推进态绿色
  function getWheelHeaderVisualState(subjectKey) {
    const key = normalizeWheelSubjectKey(subjectKey);
    const completedRounds = getWheelCompletedRoundsToday(key);
    if (completedRounds.length > 0) {
      return 'progressed';
    }
    const activeRound = getActiveWheelRound(key);
    if (activeRound) {
      return 'active';
    }
    return 'idle';
  }

  // 渲染单个 Header 顶部导航小部件 (两科共用同一渲染管道)
  function renderWheelHeaderChip(subjectKey) {
    const key = normalizeWheelSubjectKey(subjectKey);
    const subjId = toWheelSubjectId(key);
    const btn = document.getElementById(key === 'major' ? 'dailyMajorWheelButton' : 'dailyMathWheelButton');
    const sub = document.getElementById(key === 'major' ? 'dailyMajorWheelSummary' : 'dailyMathWheelSummary');
    if (!btn) return;

    const visualState = getWheelHeaderVisualState(key);

    btn.classList.toggle('is-progressed', visualState === 'progressed');
    btn.classList.toggle('is-active', visualState === 'active');
    btn.classList.toggle('is-idle', visualState === 'idle');

    const round = getCurrentRound(subjId);
    if (!round) {
      if (sub) sub.textContent = '今日未抽取';
      return;
    }

    if (round.status === 'completed') {
      const completedCount = getWheelCompletedRoundsToday(key).length;
      if (sub) sub.textContent = '今日已完成 ' + completedCount + ' 轮';
    } else {
      if (sub) sub.textContent = '第' + round.round + '轮 · ' + (round.short || round.name || round.book);
    }
  }

  // 统一渲染两科 Header 顶部导航小部件
  function renderAllWheelHeaderChips() {
    renderWheelHeaderChip('math');
    renderWheelHeaderChip('major');
  }

  function renderHeaderWidgets() {
    renderAllWheelHeaderChips();
  }

  function renderAll() {
    reconcileActiveRoundsWithHistory(currentSubjectId);
    const displayCandidates = getDisplayCandidates(currentSubjectId);
    drawWheel(displayCandidates);
    renderLegend();
    renderProgressInfo();
    renderResultAndActions();
    renderHeaderWidgets();

    // 动画期间完全交给 spin() 控制；其它重绘都把当前轮结果重新对齐到指针，
    // 避免 resize / 切换 Tab 后 canvas 保留旧 transform 而产生跳动。
    if (!spinning) {
      const round = getCurrentRound(currentSubjectId);
      let rotation = 0;
      if (round && round.status === 'active') {
        const resultIndex = displayCandidates.findIndex(function (item) {
          return item && String(item.chapterId) === String(round.chapterId);
        });
        if (resultIndex >= 0) {
          rotation = restRotationForIndex(resultIndex, displayCandidates.length);
        }
      }
      settledRotationDeg = rotation;
      setCanvasRotation(rotation, false);
    }

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
    spinCandidates = active.slice();
    spinPickedIndex = pickedIndex;

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

    // 关联新生成的下一轮到顶部 undo 记录
    const undoState = getUndoState();
    if (undoState[key] && undoState[key].length > 0) {
      const topUndo = undoState[key][undoState[key].length - 1];
      if (topUndo && topUndo.generatedRoundNumber == null) {
        topUndo.generatedRoundNumber = newRound.round;
        saveUndoState(undoState);
      }
    }

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
      spinCandidates = null;
      spinPickedIndex = -1;
      renderAll();
      return;
    }

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 250 : DAILY_WHEEL_CONFIG.animationDuration;
    const finalRest = restRotationForIndex(spinPickedIndex, spinCandidates.length);
    const currentRotation = normalizeDeg(settledRotationDeg);
    const rotationDelta = normalizeDeg(finalRest - currentRotation);
    const extraTurns = reduceMotion ? 1 : 8 + Math.floor(Math.random() * 4);
    const finalDeg = settledRotationDeg + extraTurns * 360 + rotationDelta;

    canvas.style.transition = 'transform ' + duration + 'ms cubic-bezier(.12,.72,.08,1)';
    void canvas.offsetWidth; // 触发 reflow

    window.requestAnimationFrame(function () {
      canvas.style.transform = 'rotate(' + finalDeg + 'deg)';
    });

    clearTimeout(spinTimer);
    spinTimer = window.setTimeout(function () {
      canvas.style.transition = 'none';
      canvas.style.transform = 'rotate(' + finalRest + 'deg)';
      settledRotationDeg = finalRest;
      spinning = false;
      spinCandidates = null;
      spinPickedIndex = -1;
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

    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          renderAll();
        });
      });
    }

    const closeButton = document.getElementById('btnCloseDailyMathWheel');
    if (closeButton) closeButton.focus();
  }

  function closeModal() {
    const modal = document.getElementById('dailyMathWheelModal') || document.getElementById('dailyStudyWheelModal');
    if (!modal) return;

    modal.hidden = true;
    modal.style.display = 'none';

    renderAllWheelHeaderChips();

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
            if (typeof window.requestAnimationFrame === 'function') {
              window.requestAnimationFrame(function () {
                window.requestAnimationFrame(function () {
                  renderAll();
                });
              });
            }
          }
        });
      });
    }

    // ResizeObserver 支持自适应尺寸重绘
    if (typeof window.ResizeObserver === 'function') {
      const stage = (typeof document.querySelector === 'function' && (document.querySelector('.study-wheel-stage') || document.querySelector('.daily-math-wheel-canvas-wrap'))) || null;
      if (stage) {
        const resizeObserver = new window.ResizeObserver(function (entries) {
          for (let i = 0; i < entries.length; i++) {
            if (entries[i].contentRect && entries[i].contentRect.width > 1) {
              if (!spinning && modal && !modal.hidden && modal.style.display !== 'none') {
                renderAll();
              }
            }
          }
        });
        resizeObserver.observe(stage);
      }
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
    getUndoState: getUndoState,
    saveUndoState: saveUndoState,
    pushWheelUndo: pushWheelUndo,
    popWheelUndo: popWheelUndo,
    createWheelActionId: createWheelActionId,
    getWheelProgress: getWheelProgress,
    prepareStudyWheelCanvas: prepareStudyWheelCanvas,
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
    CONFIG: DAILY_WHEEL_CONFIG,
    MATH_BOOKS: MATH_BOOKS,
    MAJOR_BOOKS: MAJOR_BOOKS,
    BOOK_COLORS: BOOK_COLORS,
    DailyStudyWheelRenderer: DailyStudyWheelRenderer,
    normalizeWheelSubjectKey: normalizeWheelSubjectKey,
    toWheelSubjectId: toWheelSubjectId,
    getWheelCompletedRoundsToday: getWheelCompletedRoundsToday,
    getActiveWheelRound: getActiveWheelRound,
    getWheelHeaderVisualState: getWheelHeaderVisualState,
    renderWheelHeaderChip: renderWheelHeaderChip,
    renderAllWheelHeaderChips: renderAllWheelHeaderChips
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
