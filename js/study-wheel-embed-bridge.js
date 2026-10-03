(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var token = params.get('bridgeToken');
  if (!params.has('embeddedWheel') || !token || window.parent === window) return;

  var targetOrigin = location.protocol === 'file:' ? '*' : location.origin;
  var ready = false;
  var activeModal = null;
  var observer = null;
  var zhentiWrongWheelInstance = null;

  function send(type, extra) {
    window.parent.postMessage(Object.assign({
      channel: 'kyson-home-wheel', token: token, type: type
    }, extra || {}), targetOrigin);
  }

  function isOpen(modal) {
    return !!(modal && !modal.hidden && window.getComputedStyle(modal).display !== 'none');
  }

  function closeActive() {
    if (!activeModal) return;
    if (observer) observer.disconnect();
    if (activeModal === 'dailyWrongWheelModal') {
      window.DailyWrongWheel.close();
    } else if (activeModal === 'mathZhentiWrongWheelModal') {
      if (zhentiWrongWheelInstance) zhentiWrongWheelInstance.close();
    } else {
      window.DailyStudyWheel.closeModal();
    }
    activeModal = null;
  }

  function open(kind) {
    if (kind !== 'math' && kind !== 'major' && kind !== 'wrong' && kind !== 'math-zhenti-wrong') return;
    closeActive();

    if (kind === 'math-zhenti-wrong') {
      if (!zhentiWrongWheelInstance) throw new Error('真题错题转盘未初始化');
      activeModal = 'mathZhentiWrongWheelModal';
      zhentiWrongWheelInstance.open();
      var modal = document.getElementById(activeModal) || document.querySelector('.mzw-overlay');
      if (!isOpen(modal)) throw new Error('转盘弹窗没有打开');
      observer = new MutationObserver(function () {
        if (!isOpen(modal)) {
          activeModal = null;
          send('closed');
          observer.disconnect();
        }
      });
      observer.observe(modal, { attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
      send('opened');
      return;
    }

    activeModal = kind === 'wrong' ? 'dailyWrongWheelModal' : 'dailyMathWheelModal';
    if (kind === 'wrong') window.DailyWrongWheel.open('shu1');
    else window.DailyStudyWheel.openModal(kind === 'major' ? 'zhuanye' : 'shu1');

    var modal = document.getElementById(activeModal);
    if (!isOpen(modal)) throw new Error('转盘弹窗没有打开');
    observer = new MutationObserver(function () {
      if (!isOpen(modal)) {
        activeModal = null;
        send('closed');
        observer.disconnect();
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
    send('opened');
  }

  window.addEventListener('message', function (event) {
    if (event.source !== window.parent) return;
    if (location.protocol !== 'file:' && event.origin !== location.origin) return;
    var data = event.data;
    if (!data || data.channel !== 'kyson-home-wheel' || data.token !== token) return;
    if (data.type === 'close') {
      closeActive();
    } else if (data.type === 'open' && ready) {
      try { open(data.kind); } catch (error) { send('error', { message: error.message }); }
    }
  });

  window.addEventListener('kaoyan:ready', function () {
    try {
      var bridge = window.DailyStudyWheelBridge;
      if (!bridge || !window.DailyStudyWheel || !window.DailyWrongWheel) {
        throw new Error('转盘引擎或题库数据未准备好');
      }
      bridge.openChapter = function (subjectId, chapterId) {
        send('handoff', { subjectId: subjectId, chapterId: chapterId });
        return true;
      };
      bridge.openWrongChapter = function (subjectId, chapterId, mode) {
        send('handoff', { subjectId: subjectId, chapterId: chapterId, mode: mode });
        return true;
      };

      if (window.MathZhentiWrongWheel && typeof window.MathZhentiWrongWheel.create === 'function') {
        var getYearsFn = window.MathZhentiWrongWheel.readYearRowsFromCurrentApp || function () { return []; };
        zhentiWrongWheelInstance = window.MathZhentiWrongWheel.create({
          getYears: getYearsFn,
          openWrongChapter: function (subject, chapterId, mode) {
            bridge.openWrongChapter(subject, chapterId, mode);
          },
          onError: console.error
        });
        window.MathZhentiWrongWheelInstance = zhentiWrongWheelInstance;
      }

      ready = true;
      send('ready');
    } catch (error) { send('error', { message: error.message }); }
  }, { once: true });
})();
