(function () {
  'use strict';

  var entry = window.__KYSON_STUDY_ENTRY__ || { subject: '', panel: '', source: 'home' };
  var appliedEntry = false;

  function qs(selector) {
    return document.querySelector(selector);
  }

  function currentSubjectId() {
    try {
      if (typeof window.getCurrentSubjectId === 'function') {
        return window.getCurrentSubjectId() || '';
      }
    } catch (error) {}
    try {
      return window.localStorage.getItem('user_guest_kaoyan_subject') || '';
    } catch (error) {
      return '';
    }
  }

  function subjectName(id) {
    return ({
      shu1: '数学',
      zhuanye: '专业课',
      english: '英语'
    })[id] || '学习模块';
  }

  function syncHeaderLabel() {
    var id = currentSubjectId();
    var chip = document.getElementById('focusSubjectChip');
    if (chip) chip.textContent = subjectName(id);

    var root = qs('.crumb-root');
    if (root) root.textContent = 'Kyson的考研 Space';

    var current = document.getElementById('headerCurrentSection');
    if (current) current.textContent = subjectName(id) + ' · 专注学习';
  }

  function proxyClick(id) {
    var node = document.getElementById(id);
    if (node && typeof node.click === 'function') {
      node.click();
      return true;
    }
    return false;
  }

  function buildFocusControls() {
    document.body.classList.add('subject-focus-shell');

    var left = qs('.header-nav-left');
    if (left && !document.getElementById('focusHomeBtn')) {
      var home = document.createElement('a');
      home.id = 'focusHomeBtn';
      home.className = 'focus-home-btn';
      home.href = 'index.html';
      home.innerHTML = '<span aria-hidden="true">←</span><span class="focus-home-text">首页</span>';
      left.insertBefore(home, left.firstChild);

      var chip = document.createElement('span');
      chip.id = 'focusSubjectChip';
      chip.className = 'focus-subject-chip';
      chip.textContent = subjectName(currentSubjectId());
      left.appendChild(chip);
    }

    var right = qs('.header-nav-right');
    if (!right || document.getElementById('focusActions')) return;

    var actions = document.createElement('div');
    actions.id = 'focusActions';
    actions.className = 'focus-actions';
    actions.innerHTML =
      '<button class="focus-quick-btn" type="button" data-focus-action="switch" title="切换科目"><span aria-hidden="true">⌘</span><span class="focus-btn-label">切换科目</span></button>' +
      '<button class="focus-quick-btn" type="button" data-focus-action="dashboard" title="全局进度"><span aria-hidden="true">◔</span><span class="focus-btn-label">总进度</span></button>' +
      '<button class="focus-quick-btn" type="button" data-focus-action="wrong" title="错题本"><span aria-hidden="true">◇</span><span class="focus-btn-label">错题本</span></button>' +
      '<button class="focus-quick-btn" type="button" data-focus-action="sm2" title="间隔复习"><span aria-hidden="true">↻</span><span class="focus-btn-label">复习</span></button>' +
      '<div class="focus-more-wrap">' +
        '<button id="focusMoreBtn" class="focus-more-btn" type="button" aria-haspopup="menu" aria-expanded="false">更多 ···</button>' +
        '<div id="focusMoreMenu" class="focus-more-menu" role="menu">' +
          '<button type="button" data-proxy-id="dailyGoalButton">今日目标</button>' +
          '<button type="button" data-proxy-id="btnBackupExport">导出备份</button>' +
          '<button type="button" data-proxy-id="btnBackupImport">导入备份</button>' +
          '<button type="button" data-proxy-id="btnShortcutHelp">快捷键帮助</button>' +
        '</div>' +
      '</div>';

    right.insertBefore(actions, right.firstChild);

    // Reuse the original widget and its analytics listeners; do not clone its IDs.
    var goal = document.getElementById('dailyGoalButton');
    if (goal) {
      var slot = document.createElement('div');
      slot.className = 'focus-goal-slot';
      slot.appendChild(goal);
      right.appendChild(slot);
    }

    actions.addEventListener('click', function (event) {
      var quick = event.target.closest('[data-focus-action]');
      if (quick) {
        var action = quick.getAttribute('data-focus-action');
        var map = {
          switch: 'btnSwitchSubject',
          dashboard: 'btnDashboard',
          wrong: 'btnWrongBook',
          sm2: 'btnSm2PanelSidebar'
        };
        if (map[action]) proxyClick(map[action]);
        return;
      }

      var proxy = event.target.closest('[data-proxy-id]');
      if (proxy) {
        proxyClick(proxy.getAttribute('data-proxy-id'));
        closeMoreMenu();
      }
    });

    var moreBtn = document.getElementById('focusMoreBtn');
    if (moreBtn) {
      moreBtn.addEventListener('click', function (event) {
        event.stopPropagation();
        var menu = document.getElementById('focusMoreMenu');
        if (!menu) return;
        var show = !menu.classList.contains('show');
        menu.classList.toggle('show', show);
        moreBtn.setAttribute('aria-expanded', show ? 'true' : 'false');
      });
    }

    document.addEventListener('click', function (event) {
      if (!event.target.closest('.focus-more-wrap')) closeMoreMenu();
      if (event.target.closest('.subject-option')) {
        window.setTimeout(syncHeaderLabel, 0);
      }
    });

    syncHeaderLabel();
  }

  function closeMoreMenu() {
    var menu = document.getElementById('focusMoreMenu');
    var btn = document.getElementById('focusMoreBtn');
    if (menu) menu.classList.remove('show');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function applyRequestedEntry() {
    if (appliedEntry) return;
    appliedEntry = true;

    var requested = entry.subject;
    if (requested && currentSubjectId() !== requested && typeof window.switchSubject === 'function') {
      window.switchSubject(requested);
    }

    var id = requested || currentSubjectId();
    if (id === 'english' || entry.panel === 'english') {
      if (typeof window.openEnglishVocabulary === 'function') {
        window.openEnglishVocabulary();
      } else if (typeof window.setWorkbenchView === 'function') {
        window.setWorkbenchView('english');
      }
    } else {
      // app.js deliberately opens the global dashboard on every boot.
      // A module-entry page should instead land on the selected subject's practice view.
      if (typeof window.setWorkbenchView === 'function') {
        window.setWorkbenchView('practice');
      }
      if (typeof window.renderTitle === 'function') {
        window.renderTitle();
      }
    }

    if (entry.chapter && (id === 'shu1' || id === 'zhuanye')) {
      var bridge = window.DailyStudyWheelBridge;
      var mode = entry.wheelMode;
      if ((mode === 'mistakes' || mode === 'practice') && bridge && typeof bridge.openWrongChapter === 'function') {
        bridge.openWrongChapter(id, entry.chapter, mode);
      } else if (bridge && typeof bridge.openChapter === 'function') {
        bridge.openChapter(id, entry.chapter);
      }
    }

    syncHeaderLabel();
  }

  function init() {
    buildFocusControls();

    // app.js emits this AFTER its startup dashboard has been opened.
    // Handling it here lets the new subject-focused entry override that global dashboard safely.
    window.addEventListener('kaoyan:ready', applyRequestedEntry, { once: true });

    // Defensive fallback for future script-order changes or if the event fired before this file.
    window.setTimeout(function () {
      if (typeof window.getCurrentSubjectId === 'function') applyRequestedEntry();
    }, 350);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
