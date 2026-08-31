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

  const LOCAL_USER = Object.freeze({
    id: 'local',
    email: '本地单机模式'
  });

  let currentUser = LOCAL_USER;

  function byId(id) {
    return document.getElementById(id);
  }

  function localKey(chapterId, dataType) {
    return `user_local_${chapterId}_${dataType}`;
  }

  // 自动数据迁移：将历史存在的旧账号键或 guest 键无损继承到 local 键下
  function autoMigrateLocalData() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(k => {
        if (k.startsWith('user_') && !k.startsWith('user_local_')) {
          const subKey = k.replace(/^user_[^_]+_/, '');
          const targetKey = 'user_local_' + subKey;
          if (localStorage.getItem(targetKey) === null) {
            const val = localStorage.getItem(k);
            if (val !== null) {
              localStorage.setItem(targetKey, val);
            }
          }
        }
      });
      // 兼容无前缀的英语词汇表
      const engOld = localStorage.getItem('kaoyan_english_vocabulary_v2') || localStorage.getItem('user_guest_kaoyan_english_vocabulary_v2');
      if (engOld && !localStorage.getItem('user_local_kaoyan_english_vocabulary_v2')) {
        localStorage.setItem('user_local_kaoyan_english_vocabulary_v2', engOld);
      }
    } catch (e) {
      console.warn('[auth-progress] autoMigrateLocalData failed:', e);
    }
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
    currentUser = user || LOCAL_USER;

    const authGate = byId('authGate');
    const appShell = byId('appShell');
    const currentUserEmail = byId('currentUserEmail');

    if (authGate) {
      authGate.hidden = true;
      authGate.style.display = 'none';
    }
    if (appShell) {
      appShell.hidden = false;
      appShell.style.display = 'flex';
    }

    if (currentUserEmail) {
      currentUserEmail.textContent = currentUser.email || '本地单机模式';
    }

    setMessage('');
    setSyncStatus('🟢 本地离线存储已就绪');

    document.dispatchEvent(
      new CustomEvent('private-study:signed-in', {
        detail: { user: currentUser }
      })
    );
  }

  async function initializeAuth() {
    autoMigrateLocalData();
    showUser(LOCAL_USER);
    return LOCAL_USER;
  }

  async function signIn(email, password) {
    showUser(LOCAL_USER);
    return LOCAL_USER;
  }

  async function signOut() {
    return;
  }

  async function loadProgress(chapterId, dataType) {
    if (!ALLOWED_DATA_TYPES.has(dataType)) {
      throw new Error(`不支持的数据类型：${dataType}`);
    }
    const raw = localStorage.getItem(localKey(chapterId, dataType));
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  async function loadBundle(chapterId) {
    const dataTypes = Array.from(ALLOWED_DATA_TYPES);
    const bundle = {};
    for (const dt of dataTypes) {
      bundle[dt] = await loadProgress(chapterId, dt);
    }
    return bundle;
  }

  async function loadAllProgress() {
    return [];
  }

  function scheduleSave(chapterId, dataType, data) {
    if (!ALLOWED_DATA_TYPES.has(dataType)) return;
    try {
      localStorage.setItem(localKey(chapterId, dataType), JSON.stringify(data ?? {}));
    } catch (e) {
      console.warn('localStorage save failed:', e);
    }
  }

  async function flushPendingWrites() {}
  function cancelPendingWrites() {}
  function getCurrentUser() {
    return currentUser || LOCAL_USER;
  }

  function bindAuthUi() {
    const authForm = byId('authForm');
    const logoutButton = byId('btnLogout');

    if (authForm) {
      authForm.style.display = 'none';
    }
    if (logoutButton) {
      logoutButton.style.display = 'none';
    }
  }

  window.PrivateStudy = Object.freeze({
    get client() { return null; },
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
      console.error('初始化失败', error);
      showUser(LOCAL_USER);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
