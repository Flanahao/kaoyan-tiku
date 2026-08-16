(function () {
  'use strict';

  const ALLOWED_DATA_TYPES = new Set([
    'status',
    'questionBad',
    'solutionBad',
    'notes',
    'reviewPlan',
    'sm2',
    'annot',
    'englishVocabulary',
    'lastPosition'
  ]);

  const config = window.APP_CONFIG;

  let client = null;
  function getClient() {
    if (client) return client;
    try {
      if (window.supabase?.createClient && config?.supabaseUrl && config?.supabasePublishableKey) {
        client = window.supabase.createClient(
          config.supabaseUrl,
          config.supabasePublishableKey,
          {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true
            }
          }
        );
      }
    } catch (e) {
      console.warn('Supabase client init error:', e);
    }
    return client;
  }

  // 立即尝试获取 client
  getClient();

  let currentUser = null;
  const pendingWrites = new Map();

  // 本地「最后一次写入」时间戳（LWW 语义）：writeKey → 客户端时间。
  // flushWrite 写前对比服务端 updated_at，仅当服务端不新于本地才覆盖（保守：绝不吞云端数据）。
  let localWriteTs = {};
  let _tsLoadedForUser = null;
  function tsStorageKey(userId) { return `user_${userId}_write_ts`; }
  function loadLocalWriteTs(userId) {
    localWriteTs = {};
    try { localWriteTs = JSON.parse(localStorage.getItem(tsStorageKey(userId)) || '{}') || {}; } catch (e) { localWriteTs = {}; }
    _tsLoadedForUser = userId;
  }
  function persistLocalWriteTs(userId) {
    try { localStorage.setItem(tsStorageKey(userId), JSON.stringify(localWriteTs)); } catch (e) {}
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value ?? {}));
  }

  function validateIdentity(chapterId, dataType) {
    if (!currentUser) {
      throw new Error('请先登录');
    }

    if (!chapterId || typeof chapterId !== 'string') {
      throw new Error('chapterId 无效');
    }

    if (!ALLOWED_DATA_TYPES.has(dataType)) {
      throw new Error(`不支持的数据类型：${dataType}`);
    }

    return currentUser;
  }

  function setMessage(message, isError = false) {
    const node = byId('authMessage');
    if (!node) return;

    node.textContent = message || '';
    node.classList.toggle('is-error', Boolean(isError));
  }

  function setSyncStatus(message, isError = false) {
    const node = byId('syncStatus');
    if (!node) return;

    if (isError && message && message.includes('user_progress')) {
      node.textContent = '☁️ 云端未建 user_progress 表 (已开启本地安全存储)';
      node.style.color = '#d97706';
      node.classList.remove('is-error');
      return;
    }

    node.textContent = message || '';
    node.classList.toggle('is-error', Boolean(isError));
  }

  function showUser(user) {
    const previousUserId = currentUser?.id || null;
    currentUser = user || null;

    const authGate = byId('authGate');
    const appShell = byId('appShell');
    const currentUserEmail = byId('currentUserEmail');

    if (authGate) {
      authGate.hidden = Boolean(currentUser);
      authGate.style.display = currentUser ? 'none' : 'flex';
    }
    if (appShell) {
      appShell.hidden = !currentUser;
      appShell.style.display = currentUser ? 'block' : 'none';
    }

    if (currentUserEmail) {
      currentUserEmail.textContent = currentUser?.email || '';
    }

    if (currentUser) {
      setMessage('');
      setSyncStatus('已登录');
      if (previousUserId !== currentUser.id) {
        loadLocalWriteTs(currentUser.id); // 预加载该用户的本地写入时间戳（LWW 用）
        document.dispatchEvent(
          new CustomEvent('private-study:signed-in', {
            detail: { user: currentUser }
          })
        );
      }
    } else {
      cancelPendingWrites();
      setSyncStatus('未登录');
      if (previousUserId) {
        document.dispatchEvent(new Event('private-study:signed-out'));
      }
    }
  }

  async function initializeAuth() {
    const c = getClient();
    if (!c) {
      console.warn('Supabase 未初始化或未连接');
      showUser(null);
      return;
    }

    const { data, error } = await c.auth.getUser();

    if (error || !data?.user) {
      showUser(null);
    } else {
      showUser(data.user);
    }

    c.auth.onAuthStateChange((event, session) => {
      window.setTimeout(() => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          showUser(null);
          return;
        }

        if (
          event === 'INITIAL_SESSION' ||
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED'
        ) {
          if (currentUser?.id !== session.user.id) {
            cancelPendingWrites();
          }
          showUser(session.user);
        }
      }, 0);
    });
  }

  async function signIn(email, password) {
    const normalizedEmail = String(email || '').trim();

    if (!normalizedEmail || !password) {
      throw new Error('请输入邮箱和密码');
    }

    const c = getClient();
    if (!c) {
      throw new Error('无法连接 Supabase 认证服务，请检查网络');
    }

    const { data, error } = await c.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (error) throw error;
    if (!data?.user) throw new Error('登录成功但未取得用户信息');

    showUser(data.user);
    return data.user;
  }

  async function signOut() {
    // 尽力而为：上行失败不阻断退出（弱网/离线时用户仍可登出，残留任务下次登录重发）
    try {
      await flushPendingWrites();
    } catch (error) {
      console.warn('退出前同步部分失败（已保留待重试）：', error);
    }

    const c = getClient();
    if (c) {
      const { error } = await c.auth.signOut();
      if (error) throw error;
    }

    localWriteTs = {};
    _tsLoadedForUser = null;
    showUser(null);
  }

  async function loadProgress(chapterId, dataType) {
    const user = validateIdentity(chapterId, dataType);
    setSyncStatus('正在读取…');

    const c = getClient();
    if (!c) throw new Error('Supabase 未连接');

    const { data, error } = await c
      .from('user_progress')
      .select('data, updated_at')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .eq('data_type', dataType)
      .maybeSingle();

    if (error) {
      setSyncStatus(`读取失败：${error.message}`, true);
      throw error;
    }

    if (currentUser?.id !== user.id) {
      throw new Error('用户已切换，已丢弃过期读取结果');
    }

    setSyncStatus('已同步');
    return data ? { data: data.data, updatedAt: new Date(data.updated_at).getTime() } : null;
  }

  async function loadBundle(chapterId) {
    const entries = await Promise.all(
      Array.from(ALLOWED_DATA_TYPES, async (dataType) => [
        dataType,
        await loadProgress(chapterId, dataType)
      ])
    );

    return Object.fromEntries(entries);
  }

  async function loadAllProgress() {
    const user = validateIdentity('all', 'status');
    const c = getClient();
    if (!c) throw new Error('Supabase 未连接');

    const { data, error } = await c
      .from('user_progress')
      .select('chapter_id, data_type, data, updated_at')
      .eq('user_id', user.id)
      .in('data_type', ['status', 'reviewPlan']);
    if (error) throw error;
    return data || [];
  }

  async function writeProgressForUser(userId, chapterId, dataType, value) {
    setSyncStatus('正在保存…');

    const c = getClient();
    if (!c) throw new Error('Supabase 未连接');

    // ---- LWW 保守合并：写前读服务端 updated_at ----
    // 仅当服务端记录不存在，或服务端时间戳不新于本地最后一次写入时才覆盖。
    // 本地无写入时间记录（首次）且服务端已有数据 → 不覆盖（由 hydrateCloudStatuses 回填云端数据）。
    const key = writeKey(userId, chapterId, dataType);
    if (_tsLoadedForUser !== userId) loadLocalWriteTs(userId);
    const localTs = localWriteTs[key] || 0;
    try {
      const { data: existing, error: readErr } = await c
        .from('user_progress')
        .select('updated_at')
        .eq('user_id', userId)
        .eq('chapter_id', chapterId)
        .eq('data_type', dataType)
        .maybeSingle();
      if (!readErr && existing) {
        const serverTs = new Date(existing.updated_at).getTime();
        if (!isNaN(serverTs) && serverTs >= localTs) {
          // 服务端不旧于本地：跳过本次写入，避免覆盖云端更新
          setSyncStatus('已同步');
          return;
        }
      }
    } catch (readErr) {
      // 读失败不阻断写入（尽力而为），避免离线/弱网时保存卡死
      console.warn('LWW 读服务端时间戳失败，直接写入', readErr);
    }

    const { error } = await c.from('user_progress').upsert(
      {
        user_id: userId,
        chapter_id: chapterId,
        data_type: dataType,
        data: cloneJson(value),
        updated_at: new Date().toISOString()
      },
      {
        onConflict: 'user_id,chapter_id,data_type'
      }
    );

    if (error) {
      setSyncStatus(`保存失败：${error.message}`, true);
      throw error;
    }

    setSyncStatus('已保存');
  }

  function writeKey(userId, chapterId, dataType) {
    return `${userId}\u0000${chapterId}\u0000${dataType}`;
  }

  function scheduleSave(chapterId, dataType, value, delayMs = 400) {
    const user = currentUser;
    if (!user) return; // 未登录时不执行云端保存

    const key = writeKey(user.id, chapterId, dataType);
    const existing = pendingWrites.get(key);

    if (existing) {
      window.clearTimeout(existing.timerId);
    }

    // 记录本地写入时间（LWW）：下次 flush 用它跟服务端 updated_at 比。
    if (_tsLoadedForUser !== user.id) loadLocalWriteTs(user.id);
    localWriteTs[key] = Date.now();
    persistLocalWriteTs(user.id);

    const job = {
      userId: user.id,
      chapterId,
      dataType,
      value: cloneJson(value),
      timerId: 0,
      retryCount: 0,
      inFlight: false
    };

    job.timerId = window.setTimeout(() => {
      flushWrite(key).catch((error) => {
        console.error('保存学习进度失败', error);
      });
    }, delayMs);

    pendingWrites.set(key, job);
  }

  async function flushWrite(key) {
    const job = pendingWrites.get(key);
    if (!job) return;

    window.clearTimeout(job.timerId);

    if (currentUser?.id !== job.userId) {
      pendingWrites.delete(key);
      return;
    }

    // in-flight 保护：重试窗口内 flushPendingWrites 并发调用时只跑一次
    if (job.inFlight) return;
    job.inFlight = true;

    try {
      await writeProgressForUser(
        job.userId,
        job.chapterId,
        job.dataType,
        job.value
      );
      pendingWrites.delete(key);
    } catch (error) {
      job.retryCount = (job.retryCount || 0) + 1;

      if (job.retryCount <= 5) {
        const delay = Math.min(30000, 1000 * (2 ** job.retryCount));
        job.timerId = window.setTimeout(() => {
          flushWrite(key).catch(console.error);
        }, delay);
      } else {
        pendingWrites.delete(key);
      }
      throw error;
    } finally {
      job.inFlight = false;
    }
  }

  async function flushPendingWrites() {
    const keys = Array.from(pendingWrites.keys());
    const results = await Promise.allSettled(keys.map(flushWrite));
    const failed = results.find((result) => result.status === 'rejected');

    if (failed) throw failed.reason;
  }

  function cancelPendingWrites() {
    for (const job of pendingWrites.values()) {
      window.clearTimeout(job.timerId);
    }
    pendingWrites.clear();
  }

  function getCurrentUser() {
    return currentUser;
  }

  function bindAuthUi() {
    const authForm = byId('authForm');
    const logoutButton = byId('btnLogout');

    authForm?.addEventListener('submit', async (event) => {
      event.preventDefault();

      const emailInput = byId('authEmail');
      const passwordInput = byId('authPassword');
      const submitButton = byId('authSubmit');

      setMessage('');
      if (submitButton) submitButton.disabled = true;

      try {
        await signIn(emailInput?.value, passwordInput?.value);
        if (passwordInput) passwordInput.value = '';
      } catch (error) {
        setMessage(`登录失败：${error.message || '请检查邮箱和密码'}`, true);
      } finally {
        if (submitButton) submitButton.disabled = false;
      }
    });

    logoutButton?.addEventListener('click', async () => {
      logoutButton.disabled = true;

      try {
        await signOut();
      } catch (error) {
        setSyncStatus(`退出失败：${error.message}`, true);
      } finally {
        logoutButton.disabled = false;
      }
    });
  }

  window.PrivateStudy = Object.freeze({
    get client() { return getClient(); },
    initializeAuth,
    signIn,
    signOut,
    getCurrentUser,
    loadProgress,
    loadBundle,
    loadAllProgress,
    scheduleSave,
    flushPendingWrites,
    cancelPendingWrites
  });

  function start() {
    bindAuthUi();
    initializeAuth().catch((error) => {
      console.error('初始化登录失败', error);
      setMessage(`初始化失败：${error.message}`, true);
      showUser(null);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
