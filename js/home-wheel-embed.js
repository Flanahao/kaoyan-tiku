(function () {
  'use strict';

  var host = document.getElementById('homeWheelHost');
  var frame = document.getElementById('homeWheelFrame');
  var loading = document.getElementById('homeWheelLoading');
  var closeButton = document.getElementById('homeWheelClose');
  if (!host || !frame || !loading || !closeButton) return;

  var token = Date.now().toString(36) + Math.random().toString(36).slice(2);
  var targetOrigin = location.protocol === 'file:' ? '*' : location.origin;
  var ready = false;
  var loadingFrame = false;
  var pendingKind = null;
  var opener = null;
  var timer = 0;

  function send(type, extra) {
    if (!frame.contentWindow) return;
    frame.contentWindow.postMessage(Object.assign({
      channel: 'kyson-home-wheel', token: token, type: type
    }, extra || {}), targetOrigin);
  }

  function closeHost() {
    host.hidden = true;
    if (opener) opener.focus();
    opener = null;
  }

  function fail(reason) {
    window.clearTimeout(timer);
    console.error('[home-wheel]', reason);
    loading.hidden = false;
    loading.textContent = '转盘加载失败，请刷新首页后重试。';
    frame.style.visibility = 'hidden';
    loadingFrame = false;
  }

  function handoff(subjectId, chapterId, mode) {
    if (subjectId !== 'shu1' && subjectId !== 'zhuanye') return;
    if (!chapterId) return;
    var url = new URL('study.html', window.location.href);
    url.searchParams.set('subject', subjectId);
    url.searchParams.set('chapter', String(chapterId));
    url.searchParams.set('from', 'home');
    if (mode === 'mistakes' || mode === 'practice') url.searchParams.set('wheelMode', mode);
    window.location.assign(url.href);
  }

  window.addEventListener('message', function (event) {
    if (event.source !== frame.contentWindow) return;
    if (location.protocol !== 'file:' && event.origin !== location.origin) return;
    var data = event.data;
    if (!data || data.channel !== 'kyson-home-wheel' || data.token !== token) return;
    if (data.type === 'ready') {
      window.clearTimeout(timer);
      ready = true;
      loadingFrame = false;
      if (!host.hidden) send('open', { kind: pendingKind });
    } else if (data.type === 'opened') {
      window.clearTimeout(timer);
      loading.hidden = true;
      frame.style.visibility = 'visible';
      frame.focus();
    } else if (data.type === 'closed') {
      if (!host.hidden) closeHost();
    } else if (data.type === 'handoff') {
      handoff(data.subjectId, data.chapterId, data.mode);
    } else if (data.type === 'error') {
      fail(data.message || '转盘初始化失败');
    }
  });

  function open(kind, trigger) {
    pendingKind = kind;
    opener = trigger;
    host.hidden = false;
    loading.hidden = false;
    loading.textContent = '正在加载转盘…';
    frame.style.visibility = 'hidden';
    if (ready) {
      send('open', { kind: kind });
      return;
    }
    if (loadingFrame) return;
    loadingFrame = true;
    timer = window.setTimeout(function () {
      if (!ready) fail('题库初始化超时');
    }, 30000);
    frame.src = 'study.html?embeddedWheel=1&bridgeToken=' + encodeURIComponent(token);
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('.kh-wheel-card[data-wheel]');
    if (!trigger) return;
    event.preventDefault();
    var kind = trigger.getAttribute('data-wheel');
    open(kind === 'major' || kind === 'wrong' ? kind : 'math', trigger);
  });

  closeButton.addEventListener('click', function () {
    if (ready) send('close');
    closeHost();
  });
})();
