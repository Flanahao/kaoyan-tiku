(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var wheel = params.get('wheel');
  var requestedSubject = params.get('subject') || '';
  if (!requestedSubject && wheel === 'math') requestedSubject = 'shu1';
  if (!requestedSubject && wheel === 'major') requestedSubject = 'zhuanye';
  var allowedSubjects = ['shu1', 'zhuanye', 'english'];

  if (allowedSubjects.indexOf(requestedSubject) !== -1) {
    try {
      window.localStorage.setItem('user_guest_kaoyan_subject', requestedSubject);
    } catch (error) {
      console.warn('[study-route] subject preference could not be saved:', error);
    }
  }

  if (document.documentElement) {
    document.documentElement.classList.add('subject-focus-shell');
  }

  window.__KYSON_STUDY_ENTRY__ = {
    subject: allowedSubjects.indexOf(requestedSubject) !== -1 ? requestedSubject : '',
    panel: params.get('panel') || '',
    source: params.get('from') || 'home'
  };

  var attempts = 0;
  var maxAttempts = 80;
  var retryMs = 100;
  var finished = false;

  function modalIsOpen(id) {
    var modal = document.getElementById(id);
    if (!modal) return false;
    var style = window.getComputedStyle(modal);
    return modal.hidden === false && style.display !== 'none' && style.visibility !== 'hidden';
  }

  function targetMeta() {
    if (wheel === 'wrong') {
      return { buttonId: 'dailyWrongWheelButton', modalId: 'dailyWrongWheelModal' };
    }
    if (wheel === 'major') {
      return { buttonId: 'dailyMajorWheelButton', modalId: 'dailyMathWheelModal' };
    }
    if (wheel === 'math') {
      return { buttonId: 'dailyMathWheelButton', modalId: 'dailyMathWheelModal' };
    }
    return null;
  }

  function clearWheelQuery() {
    try {
      var next = new URL(window.location.href);
      next.searchParams.delete('wheel');
      next.searchParams.delete('from');
      window.history.replaceState({}, '', next.pathname + (next.search ? next.search : '') + next.hash);
    } catch (error) {}
  }

  function tryOpenWheel() {
    if (finished || window.__KYSON_WHEEL_OPENED__) return;
    var meta = targetMeta();
    if (!meta) return;

    attempts += 1;
    var button = document.getElementById(meta.buttonId);
    var modal = document.getElementById(meta.modalId);

    if (!button || !modal) {
      if (attempts < maxAttempts) window.setTimeout(tryOpenWheel, retryMs);
      return;
    }

    button.click();

    if (modalIsOpen(meta.modalId)) {
      finished = true;
      window.__KYSON_WHEEL_OPENED__ = true;
      clearWheelQuery();
      return;
    }

    window.setTimeout(function () {
      if (modalIsOpen(meta.modalId)) {
        finished = true;
        window.__KYSON_WHEEL_OPENED__ = true;
        clearWheelQuery();
        return;
      }
      if (attempts < maxAttempts) {
        window.setTimeout(tryOpenWheel, retryMs);
      } else {
        console.warn('[study-route] wheel trigger found, but modal did not open:', wheel);
      }
    }, 80);
  }

  function schedule() {
    if (!targetMeta()) return;
    window.setTimeout(tryOpenWheel, 0);
  }

  window.addEventListener('kaoyan:ready', schedule, { once: true });
  window.addEventListener('load', function () {
    if (!finished) window.setTimeout(tryOpenWheel, 150);
  }, { once: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (!finished) window.setTimeout(tryOpenWheel, 300);
    }, { once: true });
  } else {
    window.setTimeout(tryOpenWheel, 300);
  }
})();
