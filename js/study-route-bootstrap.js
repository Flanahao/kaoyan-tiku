(function () {
  'use strict';

  // This file must be loaded in <head>, before app.js.
  // It does not render anything; it only prepares the existing workbench
  // so app.js boots directly into the subject selected on the new homepage.
  var params = new URLSearchParams(window.location.search);
  var requestedSubject = params.get('subject') || '';
  var allowedSubjects = ['shu1', 'zhuanye', 'english'];

  if (allowedSubjects.indexOf(requestedSubject) !== -1) {
    try {
      window.localStorage.setItem('user_guest_kaoyan_subject', requestedSubject);
    } catch (error) {
      console.warn('[study-route] subject preference could not be saved:', error);
    }
  }

  document.documentElement.classList.add('subject-focus-shell');
  window.__KYSON_STUDY_ENTRY__ = {
    subject: allowedSubjects.indexOf(requestedSubject) !== -1 ? requestedSubject : '',
    panel: params.get('panel') || '',
    source: params.get('from') || 'home'
  };
})();
