(function () {
  'use strict';

  const ALLOWED_DATA_TYPES = new Set([
    'status',
    'questionBad',
    'solutionBad',
    'notes',
    'lastPosition'
  ]);

  const config = window.APP_CONFIG;

  let client = null;
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
    console.warn('Supabase client init fallback:', e);
  }

  let currentUser = null;
  const pendingWrites = new Map();

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

    node.textContent = message || '';
    node.classList.toggle('is-error', Boolean(isError));
  }

  function showUser(user) {
    const previousUserId = currentUser?.id || null;
    currentUser = user || null;

    const authGate = byId('authGate');
    const appShell = byId('appShell');
    const currentUserEmail = byId('currentUserEmail');

    if (authGate) authGate.hidden = Boolean(currentUser);
    if (appShell) appShell.hidden = !currentUser;

    if (currentUserEmail) {
      currentUserEmail.textContent = currentUser?.email || '';
    }

    if (currentUser) {
      setMessage('');
      setSyncStatus('已登录');
      if (previousUserId !== currentUser.id) {
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
    const { data, error } = await client.auth.getUser();

    if (error || !data?.user) {
      showUser(null);
    } else {
      showUser(data.user);
    }

    client.auth.onAuthStateChange((event, session) => {
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

    const { data, error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (error) throw error;
    if (!data?.user) throw new Error('登录成功但未取得用户信息');

    showUser(data.user);
    return data.user;
  }

  async function signOut() {
    await flushPendingWrites();

    const { error } = await client.auth.signOut();
    if (error) throw error;

    showUser(null);
  }

  async function loadProgress(chapterId, dataType) {
    const user = validateIdentity(chapterId, dataType);
    setSyncStatus('正在读取…');

    const { data, error } = await client
      .from('user_progress')
      .select('data')
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
    return data?.data ?? {};
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

  async function writeProgressForUser(userId, chapterId, dataType, value) {
    setSyncStatus('正在保存…');

    const { error } = await client.from('user_progress').upsert(
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
    const user = validateIdentity(chapterId, dataType);
    const key = writeKey(user.id, chapterId, dataType);
    const existing = pendingWrites.get(key);

    if (existing) {
      window.clearTimeout(existing.timerId);
    }

    const job = {
      userId: user.id,
      chapterId,
      dataType,
      value: cloneJson(value),
      timerId: 0
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
    pendingWrites.delete(key);

    if (currentUser?.id !== job.userId) return;

    await writeProgressForUser(
      job.userId,
      job.chapterId,
      job.dataType,
      job.value
    );
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
    client,
    initializeAuth,
    signIn,
    signOut,
    getCurrentUser,
    loadProgress,
    loadBundle,
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
