(function () {
  'use strict';

  var host = document.getElementById('homeWheelHost');
  var frame = document.getElementById('homeWheelFrame');
  var loading = document.getElementById('homeWheelLoading');
  var closeButton = document.getElementById('homeWheelClose');
  if (!host || !frame || !loading || !closeButton) return;

  var ready = false;
  var loadingFrame = false;
  var pendingKind = null;
  var activeModal = null;
  var opener = null;
  var observer = null;

  function isOpen(modal) {
    return !!(modal && !modal.hidden && getComputedStyle(modal).display !== 'none');
  }

  function closeHost() {
    host.hidden = true;
    if (opener) opener.focus();
    opener = null;
    activeModal = null;
  }

  function handoff(subjectId, chapterId, mode) {
    if (subjectId !== 'shu1' && subjectId !== 'zhuanye') return false;
    if (!chapterId) return false;
    var url = new URL('study.html', window.location.href);
    url.searchParams.set('subject', subjectId);
    url.searchParams.set('chapter', String(chapterId));
    url.searchParams.set('from', 'home');
    if (mode) url.searchParams.set('wheelMode', mode);
    window.location.assign(url.href);
    return true;
  }

  function attachBridge(win) {
    var bridge = win.DailyStudyWheelBridge;
    if (!bridge) throw new Error('学习转盘数据未准备好');
    bridge.openChapter = function (subjectId, chapterId) {
      return handoff(subjectId, chapterId, '');
    };
    bridge.openWrongChapter = function (subjectId, chapterId, mode) {
      return handoff(subjectId, chapterId, mode === 'practice' ? 'practice' : 'mistakes');
    };
  }

  function show(kind) {
    var win = frame.contentWindow;
    if (!win || !win.DailyStudyWheel || !win.DailyWrongWheel) throw new Error('转盘脚本未准备好');
    if (observer) observer.disconnect();
    if (activeModal) {
      var previous = win.document.getElementById(activeModal);
      if (isOpen(previous)) {
        if (activeModal === 'dailyWrongWheelModal') win.DailyWrongWheel.close();
        else win.DailyStudyWheel.closeModal();
      }
    }

    activeModal = kind === 'wrong' ? 'dailyWrongWheelModal' : 'dailyMathWheelModal';
    if (kind === 'wrong') win.DailyWrongWheel.open('shu1');
    else win.DailyStudyWheel.openModal(kind === 'major' ? 'zhuanye' : 'shu1');

    var modal = win.document.getElementById(activeModal);
    if (!isOpen(modal)) throw new Error('转盘未能打开');
    loading.hidden = true;
    frame.style.visibility = 'visible';
    frame.focus();
    observer = new MutationObserver(function () {
      if (!isOpen(modal) && !host.hidden) closeHost();
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
  }

  function fail(error) {
    console.error('[home-wheel]', error);
    loading.hidden = false;
    loading.textContent = '转盘加载失败，请刷新首页后重试。';
    frame.style.visibility = 'hidden';
    loadingFrame = false;
  }

  function open(kind, trigger) {
    pendingKind = kind;
    opener = trigger;
    host.hidden = false;
    if (ready) {
      try { show(pendingKind); } catch (error) { fail(error); }
      return;
    }
    loading.hidden = false;
    loading.textContent = '正在加载转盘…';
    if (loadingFrame) return;
    loadingFrame = true;
    frame.addEventListener('load', function onLoad() {
      frame.removeEventListener('load', onLoad);
      loadingFrame = false;
      try {
        var win = frame.contentWindow;
        attachBridge(win);
        ready = true;
        if (!host.hidden) show(pendingKind);
      } catch (error) { fail(error); }
    });
    frame.src = 'study.html?embeddedWheel=1';
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('.kh-wheel-card[data-wheel]');
    if (!trigger) return;
    event.preventDefault();
    var kind = trigger.getAttribute('data-wheel');
    open(kind === 'major' || kind === 'wrong' ? kind : 'math', trigger);
  });

  closeButton.addEventListener('click', closeHost);
})();
