(function () {
  'use strict';

  // =========================================================================
  // 考研题库 · 错题转盘核心引擎 (DailyWrongWheel)
  // 支持两大学科：数学 (shu1) 与专业课 (zhuanye)
  // 严格继承推进转盘的高精度防抖画布、增量旋转、防刷新作弊持久化与事务性撤销机制
  // =========================================================================

  const DAILY_WRONG_WHEEL_CONFIG = {
    animationDuration: 4200,
    baseCanvasSize: 360,
    defaultSubject: 'shu1'
  };

  const BOOK_COLORS = {
    '李林880': '#3B82F6',
    '基础30讲': '#10B981',
    '强化36讲': '#8B5CF6',
    '1000题': '#F59E0B',
    '夜雨强化': '#EF4444',
    '波哥讲义例题': '#06B6D4',
    '波哥习题集': '#EC4899',
    _default: '#6B7280'
  };

  let currentSubjectId = DAILY_WRONG_WHEEL_CONFIG.defaultSubject;
  let currentScope = 'all'; // 'all' (全部候选章节) | 'mistakes' (仅有错题章节)
  let spinning = false;
  let spinTimer = 0;
  let midnightTimer = 0;
  let opener = null;

  // 动画期间固定候选快照，避免抽中章节写入 localStorage 后候选池缩小导致扇区与停靠角度突变抖动
  let spinCandidates = null;
  let spinPickedIndex = -1;
  let settledRotationDeg = 0;

  function bridge() {
    return window.DailyWrongWheelBridge || window.DailyStudyWheelBridge || null;
  }

  function userStoragePrefix() {
    const b = bridge();
    if (b && typeof b.getStoragePrefix === 'function') {
      return b.getStoragePrefix();
    }
    return 'user_guest_';
  }

  function historyStorageKey() {
    return userStoragePrefix() + 'daily_wrong_wheel_history_v1';
  }

  function dailyStorageKey() {
    return userStoragePrefix() + 'daily_wrong_wheel_daily_v1';
  }

  function undoStorageKey() {
    return userStoragePrefix() + 'daily_wrong_wheel_undo_v1';
  }

  function localDayKey(date) {
    const d = date || new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function normalizeWheelSubjectKey(value) {
    const raw = String(value || '').toLowerCase().trim();
    if (raw === 'zhuanye' || raw === 'major' || raw === 'professional') {
      return 'major';
    }
    return 'math';
  }

  function toWheelSubjectId(value) {
    return normalizeWheelSubjectKey(value) === 'major' ? 'zhuanye' : 'shu1';
  }

  function getSubjectKey(subjectId) {
    return normalizeWheelSubjectKey(subjectId);
  }

  // ===== 历史进度持久化 =====
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
      console.warn('[wrong-wheel] load history failed', e);
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
      console.warn('[wrong-wheel] save history failed', e);
      return false;
    }
  }

  // ===== 每日轮次持久化 =====
  function getDailyState() {
    const today = localDayKey(new Date());
    try {
      const raw = window.localStorage.getItem(dailyStorageKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.date === today) {
          return {
            schemaVersion: 1,
            date: today,
            math: Array.isArray(parsed.math) ? parsed.math : [],
            major: Array.isArray(parsed.major) ? parsed.major : []
          };
        }
      }
    } catch (e) {
      console.warn('[wrong-wheel] load daily failed', e);
    }
    return {
      schemaVersion: 1,
      date: today,
      math: [],
      major: []
    };
  }

  function saveDailyState(state) {
    try {
      window.localStorage.setItem(dailyStorageKey(), JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn('[wrong-wheel] save daily failed', e);
      return false;
    }
  }

  // ===== 事务性撤销栈 =====
  function getUndoState() {
    try {
      const raw = window.localStorage.getItem(undoStorageKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            math: Array.isArray(parsed.math) ? parsed.math : [],
            major: Array.isArray(parsed.major) ? parsed.major : []
          };
        }
      }
    } catch (e) {}
    return { math: [], major: [] };
  }

  function saveUndoState(state) {
    try {
      window.localStorage.setItem(undoStorageKey(), JSON.stringify(state));
    } catch (e) {}
  }

  function pushWheelUndo(subjectKey, undoAction) {
    const st = getUndoState();
    const arr = st[subjectKey] || [];
    arr.push(undoAction);
    if (arr.length > 20) arr.shift();
    st[subjectKey] = arr;
    saveUndoState(st);
  }

  function popWheelUndo(subjectKey) {
    const st = getUndoState();
    const arr = st[subjectKey] || [];
    if (arr.length === 0) return null;
    const item = arr.pop();
    st[subjectKey] = arr;
    saveUndoState(st);
    return item;
  }

  function restoreWheelUndo(subjectKey, undoAction) {
    if (!undoAction) return;
    const st = getUndoState();
    const arr = st[subjectKey] || [];
    arr.push(undoAction);
    st[subjectKey] = arr;
    saveUndoState(st);
  }

  // ===== 候选章节计算 =====
  function getAllCandidates(subjectId) {
    const api = bridge();
    if (!api || typeof api.getCandidates !== 'function') return [];
    try {
      const items = api.getCandidates(subjectId);
      const list = Array.isArray(items) ? items.slice() : [];
      list.forEach(function (ch) {
        if (api.getChapterMistakes) {
          const m = api.getChapterMistakes(subjectId, ch.chapterId);
          ch.wrong = (m && m.wrong) || 0;
          ch.vague = (m && m.vague) || 0;
          ch.totalMistakes = (m && m.totalMistakes) || 0;
          ch.done = (m && m.done) || 0;
          ch.unmarked = (m && m.unmarked != null) ? m.unmarked : Math.max(0, (ch.total || 0) - ch.done);
          ch.pct = (m && m.pct) || 0;
        } else {
          ch.wrong = 0;
          ch.vague = 0;
          ch.totalMistakes = 0;
          ch.done = 0;
          ch.unmarked = ch.total || 0;
          ch.pct = 0;
        }
      });
      return list;
    } catch (e) {
      console.warn('[wrong-wheel] getAllCandidates failed', e);
      return [];
    }
  }

  function getScopeFilteredCandidates(subjectId, scope) {
    const all = getAllCandidates(subjectId);
    const effectiveScope = scope || currentScope;
    if (effectiveScope === 'mistakes') {
      const filtered = all.filter(function (c) {
        return c && (c.totalMistakes > 0 || c.wrong > 0 || c.vague > 0);
      });
      return filtered;
    }
    return all;
  }

  function getSubjectRounds(daily, subjectId) {
    const key = getSubjectKey(subjectId);
    if (!daily || !daily[key]) return [];
    return Array.isArray(daily[key]) ? daily[key] : [];
  }

  function getCurrentRound(subjectId) {
    const daily = getDailyState();
    const rounds = getSubjectRounds(daily, subjectId);
    if (!rounds || rounds.length === 0) return null;
    return rounds[rounds.length - 1];
  }

  function getActiveCandidates(subjectId) {
    const filtered = getScopeFilteredCandidates(subjectId);
    const hist = getHistoryState();
    const key = getSubjectKey(subjectId);
    const completedSet = new Set();
    if (hist[key] && Array.isArray(hist[key].completed)) {
      hist[key].completed.forEach(function (c) {
        if (c && c.chapterId) completedSet.add(c.chapterId);
      });
    }

    const daily = getDailyState();
    const rounds = getSubjectRounds(daily, subjectId);
    const assignedSet = new Set();
    rounds.forEach(function (r) {
      if (r && r.chapterId) assignedSet.add(r.chapterId);
    });

    return filtered.filter(function (c) {
      return !completedSet.has(c.chapterId) && !assignedSet.has(c.chapterId);
    });
  }

  // 维持动画期间及当前轮次中的扇区完整视觉
  function getDisplayCandidates(subjectId) {
    if (spinning && spinCandidates && subjectId === currentSubjectId) {
      return spinCandidates.slice();
    }

    const active = getActiveCandidates(subjectId);
    const round = getCurrentRound(subjectId);
    if (!round || round.status !== 'active') return active;

    if (Array.isArray(round.candidateIds) && round.candidateIds.length > 0) {
      const byId = new Map(getAllCandidates(subjectId).map(function (item) {
        return [String(item.chapterId), item];
      }));
      const snapshot = round.candidateIds.map(function (id) {
        return byId.get(String(id));
      }).filter(Boolean);
      if (snapshot.length > 0) return snapshot;
    }

    const all = getScopeFilteredCandidates(subjectId, round.scope);
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

  function getCanvas() {
    return document.getElementById('dailyWrongWheelCanvas');
  }

  function setCanvasRotation(deg, animate) {
    const canvas = getCanvas();
    if (!canvas) return;
    if (!animate) canvas.style.transition = 'none';
    canvas.style.transform = 'rotate(' + Number(deg || 0) + 'deg)';
  }

  function prepareCanvas(canvas) {
    if (!canvas) return null;
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    const size = DAILY_WRONG_WHEEL_CONFIG.baseCanvasSize;
    if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
      canvas.width = size * dpr;
      canvas.height = size * dpr;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    return { ctx: ctx, size: size, center: size / 2, radius: size / 2 - 8 };
  }

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
    const raw = -(index + 0.5) * slice;
    return normalizeDeg(raw);
  }

  // ===== 绘制转盘 =====
  function drawWheel(candidates) {
    const canvas = getCanvas();
    const prep = prepareCanvas(canvas);
    if (!prep) return;
    const ctx = prep.ctx;
    const center = prep.center;
    const radius = prep.radius;

    ctx.clearRect(0, 0, prep.size, prep.size);

    const list = Array.isArray(candidates) ? candidates : [];
    const count = list.length;

    if (count === 0) {
      // 空候选提示
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const emptyText = currentScope === 'mistakes' ? '暂无待攻坚错题 🎉' : '本阶段候选已完成';
      ctx.fillText(emptyText, center, center);
      ctx.restore();
      return;
    }

    const sliceRad = (Math.PI * 2) / count;
    // 起始角从 -PI/2 (顶部 12 点钟方向) 开始
    let startAngle = -Math.PI / 2;

    list.forEach(function (c, idx) {
      const endAngle = startAngle + sliceRad;
      const color = BOOK_COLORS[c.book] || BOOK_COLORS._default;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = count > 60 ? 0.75 : 1.5;
      ctx.stroke();

      // 文字标签（扇区数量较多时精简绘制）
      if (count <= 90) {
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + sliceRad / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';

        let fontSize = 11;
        if (count > 45) fontSize = 8.5;
        else if (count > 25) fontSize = 9.5;
        ctx.font = '600 ' + fontSize + 'px sans-serif';

        let label = String(c.short || c.name || '');
        if (c.totalMistakes > 0) {
          label += ' (' + c.totalMistakes + ')';
        } else if (c.done > 0 && c.done >= (c.total || 0)) {
          label += ' (全优)';
        }
        if (label.length > 12) label = label.slice(0, 11) + '..';

        ctx.fillText(label, radius - 10, 0);
        ctx.restore();
      }

      ctx.restore();
      startAngle = endAngle;
    });

    // 绘制外圈金色高亮线与内圈装饰
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 中心微小遮罩圆（外层覆盖在按钮下方）
    ctx.beginPath();
    ctx.arc(center, center, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.restore();
  }

  // ===== 渲染图例 =====
  function renderLegend() {
    const el = document.getElementById('dailyWrongWheelLegend');
    if (!el) return;
    const candidates = getDisplayCandidates(currentSubjectId);
    const bookCounts = {};
    candidates.forEach(function (c) {
      if (!c || !c.book) return;
      bookCounts[c.book] = (bookCounts[c.book] || 0) + 1;
    });

    const entries = Object.keys(bookCounts);
    if (entries.length === 0) {
      el.innerHTML = '<span style="color:#64748b;font-size:12px">暂无候选书籍</span>';
      return;
    }

    el.innerHTML = entries.map(function (b) {
      const color = BOOK_COLORS[b] || BOOK_COLORS._default;
      return '<span class="daily-math-wheel-legend-item">' +
        '<span class="daily-math-wheel-legend-dot" style="background:' + color + '"></span>' +
        '<span class="daily-math-wheel-legend-name">' + b + ' (' + bookCounts[b] + '章)</span>' +
      '</span>';
    }).join('');
  }

  // ===== 渲染进度与范围切换条 =====
  function renderProgressInfo() {
    const all = getAllCandidates(currentSubjectId);
    const mistakeChs = all.filter(function (c) {
      return c && (c.totalMistakes > 0 || c.wrong > 0 || c.vague > 0);
    });

    const countMistakeEl = document.getElementById('wrongScopeMistakeCount');
    const countAllEl = document.getElementById('wrongScopeAllCount');
    if (countMistakeEl) countMistakeEl.textContent = mistakeChs.length;
    if (countAllEl) countAllEl.textContent = all.length;

    // 更新 scope pill 高亮
    const btnMistakes = document.getElementById('btnWrongScopeMistakes');
    const btnAll = document.getElementById('btnWrongScopeAll');
    if (btnMistakes) btnMistakes.classList.toggle('active', currentScope === 'mistakes');
    if (btnAll) btnAll.classList.toggle('active', currentScope === 'all');

    const key = getSubjectKey(currentSubjectId);
    const hist = getHistoryState();
    const stageRound = (hist[key] && hist[key].round) || 1;
    const completedList = (hist[key] && hist[key].completed) || [];

    const scopeList = getScopeFilteredCandidates(currentSubjectId);
    const totalCount = scopeList.length;
    const scopeIds = new Set(scopeList.map(function (c) { return c && c.chapterId; }).filter(Boolean));
    const doneCount = new Set(completedList.filter(function (c) {
      return c && scopeIds.has(c.chapterId) && (!c.scope || c.scope === currentScope);
    }).map(function (c) { return c.chapterId; })).size;
    const pct = totalCount > 0 ? Math.min(100, Math.round((doneCount / totalCount) * 100)) : 100;

    const stageInfo = document.getElementById('wrongWheelStageInfo');
    if (stageInfo) {
      if (currentScope === 'all') {
        stageInfo.textContent = '错题攻坚第 ' + stageRound + ' 阶段 · 累计推进 ' + doneCount + '/' + totalCount + ' 章 (' + pct + '%) · 现存错题 ' + mistakeChs.length + ' 章';
      } else {
        stageInfo.textContent = '错题攻坚第 ' + stageRound + ' 阶段 · 累计攻克 ' + doneCount + '/' + totalCount + ' 章 (' + pct + '%)';
      }
    }

    const fill = document.getElementById('wrongWheelProgressFill');
    if (fill) fill.style.width = pct + '%';

    const nextBox = document.getElementById('wrongWheelNextStageBox');
    if (nextBox) {
      nextBox.style.display = (totalCount > 0 && doneCount >= totalCount) ? '' : 'none';
    }
  }

  // ===== 渲染结果与操作按钮 =====
  function renderResultAndActions() {
    const kicker = document.getElementById('wrongWheelRoundKicker');
    const bookEl = document.getElementById('dailyWrongWheelResultBook');
    const nameEl = document.getElementById('dailyWrongWheelResultName');
    const metaEl = document.getElementById('dailyWrongWheelResultMeta');

    const btnSpin = document.getElementById('btnDailyWrongWheelSpin');
    const btnStart = document.getElementById('btnDailyWrongWheelStart');
    const btnPractice = document.getElementById('btnDailyWrongWheelPractice');
    const btnComplete = document.getElementById('btnWrongWheelComplete');
    const btnAddRound = document.getElementById('btnWrongWheelAddRound');
    const btnUndo = document.getElementById('btnWrongWheelUndoRound');
    const btnLater = document.getElementById('btnWrongWheelLaterClose');

    const round = getCurrentRound(currentSubjectId);
    const active = getActiveCandidates(currentSubjectId);

    if (btnSpin) btnSpin.disabled = spinning;

    if (!round) {
      // 未抽取状态
      if (kicker) kicker.textContent = '错题攻坚轮次';
      if (bookEl) bookEl.textContent = '尚未抽取';
      if (nameEl) nameEl.textContent = '点击开始，让错题攻坚交给转盘';
      if (metaEl) {
        metaEl.textContent = active.length > 0
          ? '待抽取章节：' + active.length + ' 章'
          : '当前候选池为空，可先去刷题标记错题或开启下一阶段';
      }

      if (btnSpin) {
        btnSpin.style.display = '';
        btnSpin.disabled = spinning || active.length === 0;
      }
      if (btnStart) btnStart.style.display = 'none';
      if (btnPractice) btnPractice.style.display = 'none';
      if (btnComplete) btnComplete.style.display = 'none';
      if (btnAddRound) btnAddRound.style.display = 'none';
      if (btnUndo) btnUndo.style.display = 'none';
      if (btnLater) btnLater.style.display = 'none';
      return;
    }

    // 已有轮次记录
    const isCompleted = round.status === 'completed';
    if (kicker) kicker.textContent = '第 ' + (round.round || 1) + ' 轮 · ' + (isCompleted ? '已完成' : '进行中');
    if (bookEl) bookEl.textContent = round.book || '';
    if (nameEl) nameEl.textContent = round.name || round.short || '';

    const mistakes = bridge() && bridge().getChapterMistakes
      ? bridge().getChapterMistakes(currentSubjectId, round.chapterId)
      : null;
    const wrCount = (mistakes && mistakes.wrong) || 0;
    const vgCount = (mistakes && mistakes.vague) || 0;
    const totMistakes = (mistakes && mistakes.totalMistakes != null) ? mistakes.totalMistakes : (wrCount + vgCount);
    const doneCount = (mistakes && mistakes.done) || 0;
    const totalCount = (mistakes && mistakes.total) || round.total || 0;
    const unmarkedCount = (mistakes && mistakes.unmarked != null) ? mistakes.unmarked : Math.max(0, totalCount - doneCount);

    if (metaEl) {
      if (totMistakes > 0) {
        metaEl.innerHTML = '待攻克题目：<span class="daily-wrong-wheel-mistake-badge">不会 ' + wrCount + '</span>' +
          (vgCount > 0 ? '<span class="daily-wrong-wheel-mistake-badge" style="background:#fef3c7;color:#b45309">模糊 ' + vgCount + '</span>' : '') +
          ' · 本章进度: ' + doneCount + '/' + totalCount;
      } else if (doneCount === 0) {
        metaEl.innerHTML = '<span class="daily-wrong-wheel-mistake-badge" style="background:#f1f5f9;color:#475569">尚未开始</span> · 本章共 ' + totalCount + ' 题，暂无错题记录';
      } else if (doneCount < totalCount) {
        metaEl.innerHTML = '<span class="daily-wrong-wheel-mistake-badge" style="background:#ecfdf5;color:#047857">暂无错题</span> · 已做 ' + doneCount + '/' + totalCount + ' 题，剩余 ' + unmarkedCount + ' 题未做';
      } else {
        metaEl.innerHTML = '<span class="daily-wrong-wheel-mistake-badge" style="background:#ecfdf5;color:#047857">全部正确 🎉</span> · 全章 ' + totalCount + ' 题已攻坚完成且无错题';
      }
    }

    if (isCompleted) {
      if (btnSpin) btnSpin.style.display = 'none';
      if (btnStart) {
        if (totMistakes > 0) {
          btnStart.style.display = '';
          btnStart.disabled = false;
          btnStart.textContent = '📖 查看该章错题 (' + totMistakes + ')';
        } else {
          btnStart.style.display = 'none';
        }
      }
      if (btnPractice) {
        btnPractice.style.display = '';
        btnPractice.disabled = false;
        btnPractice.classList.remove('primary-style');
        btnPractice.textContent = '📖 前往该章复习巩固';
      }
      if (btnComplete) btnComplete.style.display = 'none';
      if (btnAddRound) {
        btnAddRound.style.display = '';
        btnAddRound.disabled = active.length === 0;
      }
      if (btnLater) btnLater.style.display = 'none';
    } else {
      if (btnSpin) btnSpin.style.display = 'none';
      if (totMistakes > 0) {
        if (btnStart) {
          btnStart.style.display = '';
          btnStart.disabled = false;
          btnStart.textContent = '🎯 消灭错题 (' + totMistakes + '道)';
        }
        if (btnPractice) {
          btnPractice.style.display = '';
          btnPractice.disabled = false;
          btnPractice.classList.remove('primary-style');
          btnPractice.textContent = '📝 全章正常刷题';
        }
      } else {
        if (btnStart) {
          btnStart.style.display = 'none';
        }
        if (btnPractice) {
          btnPractice.style.display = '';
          btnPractice.disabled = false;
          btnPractice.classList.add('primary-style');
          if (doneCount === 0) {
            btnPractice.textContent = '📝 先去刷题完成这章';
          } else if (doneCount < totalCount) {
            btnPractice.textContent = '📝 继续刷题完成这章';
          } else {
            btnPractice.textContent = '📖 前往该章复习巩固';
            btnPractice.classList.remove('primary-style');
          }
        }
      }
      if (btnComplete) btnComplete.style.display = '';
      if (btnAddRound) btnAddRound.style.display = 'none';
      if (btnLater) btnLater.style.display = '';
    }

    if (btnUndo) {
      btnUndo.style.display = canUndo(currentSubjectId) ? '' : 'none';
    }
  }

  // ===== 顶部 Header 状态小部件同步 =====
  function renderHeaderWidget() {
    const btn = document.getElementById('dailyWrongWheelButton');
    const summary = document.getElementById('dailyWrongWheelSummary');
    if (!btn || !summary) return;

    const round = getCurrentRound(currentSubjectId);
    if (!round) {
      summary.textContent = '未抽取';
      btn.classList.remove('is-progressed');
    } else if (round.status === 'completed') {
      const daily = getDailyState();
      const rounds = getSubjectRounds(daily, currentSubjectId);
      const doneRounds = rounds.filter(function (r) { return r && r.status === 'completed'; });
      summary.textContent = '已攻坚 ' + doneRounds.length + ' 轮';
      btn.classList.add('is-progressed');
    } else {
      summary.textContent = '第 ' + (round.round || 1) + ' 轮进行中';
      btn.classList.remove('is-progressed');
    }
  }

  function renderAll() {
    const lockedRound = getCurrentRound(currentSubjectId);
    if (lockedRound && lockedRound.status === 'active' && (lockedRound.scope === 'all' || lockedRound.scope === 'mistakes')) {
      currentScope = lockedRound.scope;
    }
    const displayCandidates = getDisplayCandidates(currentSubjectId);
    drawWheel(displayCandidates);
    renderLegend();
    renderProgressInfo();
    renderResultAndActions();
    renderHeaderWidget();

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

    if (typeof document.querySelectorAll === 'function') {
      document.querySelectorAll('#dailyWrongWheelModal .study-wheel-tab').forEach(function (tab) {
        const sid = tab.dataset.subjectId;
        const active = sid === currentSubjectId;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }
  }

  // ===== 旋转抽奖 =====
  function spin() {
    if (spinning) return;
    const active = getActiveCandidates(currentSubjectId);
    if (!Array.isArray(active) || active.length === 0) {
      alert('当前候选池暂无待攻坚章节！可切换上方“全部候选章节”或先去刷题。');
      return;
    }

    const curRound = getCurrentRound(currentSubjectId);
    if (curRound && curRound.status === 'active') {
      alert('当前有正在进行中的错题攻坚轮次，请先完成或消灭后再开启新一轮！');
      return;
    }

    const pickedIndex = secureRandomIndex(active.length);
    if (pickedIndex < 0) return;

    const picked = active[pickedIndex];
    spinCandidates = active.slice();
    spinPickedIndex = pickedIndex;

    // 落地状态持久化（防刷新作弊）
    const daily = getDailyState();
    const key = getSubjectKey(currentSubjectId);
    const rounds = getSubjectRounds(daily, currentSubjectId);
    const nextRoundNumber = rounds.length + 1;

    const roundData = {
      round: nextRoundNumber,
      chapterId: picked.chapterId,
      book: picked.book,
      name: picked.name,
      short: picked.short,
      total: picked.total,
      wrongCount: picked.wrong || 0,
      vagueCount: picked.vague || 0,
      scope: currentScope,
      candidateIds: spinCandidates.map(function (item) { return item && item.chapterId; }).filter(Boolean),
      status: 'active',
      startedAt: localDayKey(new Date())
    };

    rounds.push(roundData);
    daily[key] = rounds;

    // 将本轮关联到上一条“完成轮次”事务，撤销时可同时移除本轮。
    const undoState = getUndoState();
    const undoList = undoState[key] || [];
    const topUndo = undoList[undoList.length - 1];
    if (topUndo && topUndo.action === 'complete-round' && topUndo.generatedRoundNumber == null) {
      topUndo.generatedRoundNumber = roundData.round;
      saveUndoState(undoState);
    }
    saveDailyState(daily);

    spinning = true;
    renderResultAndActions();

    const canvas = getCanvas();
    if (!canvas) {
      spinning = false;
      spinCandidates = null;
      spinPickedIndex = -1;
      renderAll();
      return;
    }

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = reduceMotion ? 250 : DAILY_WRONG_WHEEL_CONFIG.animationDuration;
    const finalRest = restRotationForIndex(spinPickedIndex, spinCandidates.length);
    const currentRotation = normalizeDeg(settledRotationDeg);
    const rotationDelta = normalizeDeg(finalRest - currentRotation);
    const extraTurns = reduceMotion ? 1 : 8 + Math.floor(Math.random() * 4);
    const finalDeg = settledRotationDeg + extraTurns * 360 + rotationDelta;

    canvas.style.transition = 'transform ' + duration + 'ms cubic-bezier(.12,.72,.08,1)';
    void canvas.offsetWidth; // reflow

    window.requestAnimationFrame(function () {
      canvas.style.transform = 'rotate(' + finalDeg + 'deg)';
    });

    if (spinTimer) window.clearTimeout(spinTimer);
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

  // ===== 完成本轮攻坚 =====
  function markCurrentRoundCompleted() {
    const daily = getDailyState();
    const key = getSubjectKey(currentSubjectId);
    const rounds = getSubjectRounds(daily, currentSubjectId);
    if (!rounds || rounds.length === 0) return false;

    const cur = rounds[rounds.length - 1];
    if (cur.status === 'completed') return true;

    const hist = getHistoryState();
    const chapterWasCompletedBefore = hist[key].completed.some(function (c) {
      return c && c.chapterId === cur.chapterId;
    });
    const actionId = 'wrong_complete_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
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

    if (!chapterWasCompletedBefore) {
      hist[key].completed.push({
        chapterId: cur.chapterId,
        book: cur.book,
        name: cur.name,
        short: cur.short,
        total: cur.total,
        completedAt: cur.completedAt,
        scope: cur.scope || currentScope,
        wheelActionId: actionId
      });
      saveHistoryState(hist);
    }

    pushWheelUndo(key, undo);
    renderAll();
    return true;
  }

  // ===== 撤销上一轮 =====
  function canUndo(subjectId) {
    const key = getSubjectKey(subjectId);
    const undoState = getUndoState();
    if (undoState[key] && undoState[key].length > 0) return true;
    const daily = getDailyState();
    const rounds = getSubjectRounds(daily, subjectId);
    if (!rounds || rounds.length === 0) return false;
    return rounds.length > 1 || (rounds.length === 1 && rounds[0].status === 'completed');
  }

  function undoLastRound(subjectId) {
    const key = getSubjectKey(subjectId);
    const daily = getDailyState();
    const rounds = getSubjectRounds(daily, subjectId);
    if (!rounds || rounds.length === 0) return false;

    const undo = popWheelUndo(key);
    if (undo && undo.action === 'complete-round') {
      let updatedRounds = rounds.slice();
      if (undo.generatedRoundNumber != null) {
        updatedRounds = updatedRounds.filter(function (r) {
          return r.round !== undo.generatedRoundNumber;
        });
      }

      const cur = updatedRounds.find(function (r) { return r.round === undo.roundNumber; });
      if (!cur) {
        restoreWheelUndo(key, undo);
        return false;
      }

      cur.status = undo.previousRoundStatus || 'active';
      if (undo.previousCompletedAt) cur.completedAt = undo.previousCompletedAt;
      else delete cur.completedAt;

      if (undo.completionAddedByThisAction !== false) {
        const hist = getHistoryState();
        if (hist[key] && Array.isArray(hist[key].completed)) {
          hist[key].completed = hist[key].completed.filter(function (c) {
            if (!c) return false;
            if (c.wheelActionId && c.wheelActionId === undo.actionId) return false;
            return c.chapterId !== undo.chapterId;
          });
          saveHistoryState(hist);
        }
      }

      daily[key] = updatedRounds;
      saveDailyState(daily);
      renderAll();
      return true;
    }

    // 兜底撤销
    const last = rounds[rounds.length - 1];
    if (rounds.length > 1) {
      rounds.pop();
      const prev = rounds[rounds.length - 1];
      if (prev) {
        prev.status = 'active';
        delete prev.completedAt;
        const hist = getHistoryState();
        if (hist[key] && Array.isArray(hist[key].completed)) {
          hist[key].completed = hist[key].completed.filter(function (c) {
            return c && c.chapterId !== prev.chapterId;
          });
          saveHistoryState(hist);
        }
      }
    } else if (rounds.length === 1 && last.status === 'completed') {
      last.status = 'active';
      delete last.completedAt;
      const hist = getHistoryState();
      if (hist[key] && Array.isArray(hist[key].completed)) {
        hist[key].completed = hist[key].completed.filter(function (c) {
          return c && c.chapterId !== last.chapterId;
        });
        saveHistoryState(hist);
      }
    }

    daily[key] = rounds;
    saveDailyState(daily);
    renderAll();
    return true;
  }

  function startNextStage(subjectId) {
    const key = getSubjectKey(subjectId);
    const hist = getHistoryState();
    hist[key].round = (hist[key].round || 1) + 1;
    hist[key].completed = [];
    saveHistoryState(hist);
    renderAll();
  }

  // ===== 模态框显隐控制 =====
  function openModal(subjectId, event) {
    opener = (event && event.currentTarget) || document.getElementById('dailyWrongWheelButton') || null;
    if (subjectId) {
      currentSubjectId = toWheelSubjectId(subjectId);
    }
    const modal = document.getElementById('dailyWrongWheelModal');
    if (!modal) return;
    modal.style.display = '';
    modal.hidden = false;
    modal.classList.add('show');
    renderAll();
  }

  function closeModal() {
    const modal = document.getElementById('dailyWrongWheelModal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.hidden = true;
    modal.classList.remove('show');
    if (opener && typeof opener.focus === 'function') {
      try { opener.focus(); } catch (e) {}
    }
  }

  function bind() {
    const btnHeader = document.getElementById('dailyWrongWheelButton');
    const btnFromBook = document.getElementById('btnOpenWrongWheelFromBook');
    const btnClose = document.getElementById('btnCloseDailyWrongWheel');

    if (btnHeader) {
      btnHeader.addEventListener('click', function (e) { openModal(null, e); });
    }
    if (btnFromBook) {
      btnFromBook.addEventListener('click', function (e) { openModal(null, e); });
    }
    if (btnClose) {
      btnClose.addEventListener('click', closeModal);
    }

    const tabMath = document.getElementById('wrongWheelTabMath');
    const tabMajor = document.getElementById('wrongWheelTabMajor');
    if (tabMath) {
      tabMath.addEventListener('click', function () {
        if (currentSubjectId === 'shu1') return;
        currentSubjectId = 'shu1';
        renderAll();
      });
    }
    if (tabMajor) {
      tabMajor.addEventListener('click', function () {
        if (currentSubjectId === 'zhuanye') return;
        currentSubjectId = 'zhuanye';
        renderAll();
      });
    }

    const btnScopeMistakes = document.getElementById('btnWrongScopeMistakes');
    const btnScopeAll = document.getElementById('btnWrongScopeAll');
    if (btnScopeMistakes) {
      btnScopeMistakes.addEventListener('click', function () {
        if (currentScope === 'mistakes') return;
        const round = getCurrentRound(currentSubjectId);
        if (round && round.status === 'active') {
          alert('当前轮次进行中，候选范围已锁定；完成或撤销本轮后再切换。');
          return;
        }
        currentScope = 'mistakes';
        renderAll();
      });
    }
    if (btnScopeAll) {
      btnScopeAll.addEventListener('click', function () {
        if (currentScope === 'all') return;
        const round = getCurrentRound(currentSubjectId);
        if (round && round.status === 'active') {
          alert('当前轮次进行中，候选范围已锁定；完成或撤销本轮后再切换。');
          return;
        }
        currentScope = 'all';
        renderAll();
      });
    }

    const spinBtn = document.getElementById('btnDailyWrongWheelSpin');
    const centerBtn = document.getElementById('btnDailyWrongWheelSpinCenter');
    if (spinBtn) spinBtn.addEventListener('click', spin);
    if (centerBtn) centerBtn.addEventListener('click', spin);

    const startBtn = document.getElementById('btnDailyWrongWheelStart');
    if (startBtn) {
      startBtn.addEventListener('click', function () {
        const round = getCurrentRound(currentSubjectId);
        if (!round || !round.chapterId) return;
        closeModal();
        const b = bridge();
        if (b && typeof b.openWrongChapter === 'function') {
          b.openWrongChapter(currentSubjectId, round.chapterId, 'mistakes');
        } else if (b && typeof b.openChapter === 'function') {
          b.openChapter(currentSubjectId, round.chapterId);
        }
      });
    }

    const practiceBtn = document.getElementById('btnDailyWrongWheelPractice');
    if (practiceBtn) {
      practiceBtn.addEventListener('click', function () {
        const round = getCurrentRound(currentSubjectId);
        if (!round || !round.chapterId) return;
        closeModal();
        const b = bridge();
        if (b && typeof b.openWrongChapter === 'function') {
          b.openWrongChapter(currentSubjectId, round.chapterId, 'practice');
        } else if (b && typeof b.openChapter === 'function') {
          b.openChapter(currentSubjectId, round.chapterId);
        }
      });
    }

    const completeBtn = document.getElementById('btnWrongWheelComplete');
    if (completeBtn) {
      completeBtn.addEventListener('click', markCurrentRoundCompleted);
    }

    const addRoundBtn = document.getElementById('btnWrongWheelAddRound');
    if (addRoundBtn) {
      addRoundBtn.addEventListener('click', function () {
        renderAll();
        spin();
      });
    }

    const undoBtn = document.getElementById('btnWrongWheelUndoRound');
    if (undoBtn) {
      undoBtn.addEventListener('click', function () {
        undoLastRound(currentSubjectId);
      });
    }

    const laterBtn = document.getElementById('btnWrongWheelLaterClose');
    if (laterBtn) {
      laterBtn.addEventListener('click', closeModal);
    }

    const nextStageBtn = document.getElementById('btnWrongWheelNextStage');
    if (nextStageBtn) {
      nextStageBtn.addEventListener('click', function () {
        startNextStage(currentSubjectId);
      });
    }

    const modal = document.getElementById('dailyWrongWheelModal');
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
    }

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
        closeModal();
      }
    });

    window.addEventListener('resize', function () {
      if (modal && modal.classList.contains('show')) {
        renderAll();
      }
    });

    // 监听题库主就绪事件与学科变动
    window.addEventListener('kaoyan:ready', function () {
      renderHeaderWidget();
    });
  }

  function init() {
    bind();
    renderHeaderWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.DailyWrongWheel = {
    open: openModal,
    close: closeModal,
    spin: spin,
    renderAll: renderAll,
    getAllCandidates: getAllCandidates,
    getActiveCandidates: getActiveCandidates,
    getScopeFilteredCandidates: getScopeFilteredCandidates,
    getCurrentRound: getCurrentRound,
    markCurrentRoundCompleted: markCurrentRoundCompleted,
    undoLastRound: undoLastRound,
    canUndo: canUndo,
    startNextStage: startNextStage
  };
})();
