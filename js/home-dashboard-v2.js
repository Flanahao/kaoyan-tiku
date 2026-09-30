(function () {
  'use strict';

  var SETTINGS_SUFFIX = 'study_dashboard_settings_v1';
  var MAX_WAIT = 80;
  var WAIT_MS = 80;

  function getPrefix() {
    try {
      if (typeof window.userStoragePrefix === 'function') {
        var prefix = window.userStoragePrefix();
        if (typeof prefix === 'string' && prefix) return prefix;
      }
    } catch (error) {}
    return 'user_guest_';
  }

  function safeJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function format(value) {
    return (Number(value) || 0).toLocaleString('zh-CN');
  }

  function percent(part, total) {
    total = Number(total) || 0;
    if (total <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((Number(part) || 0) / total * 100)));
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var node = byId(id);
    if (node) node.textContent = String(value);
  }

  function normalizeTotals(value) {
    value = value || {};
    return {
      total: Number(value.total) || 0,
      done: Number(value.done) || 0,
      mastered: Number(value.mastered) || 0,
      vague: Number(value.vague) || 0,
      wrong: Number(value.wrong) || 0,
      unmarked: Number(value.unmarked) || 0
    };
  }

  function paintDonut(id, rawTotals) {
    var donut = byId(id);
    if (!donut) return;
    var totals = normalizeTotals(rawTotals);
    var total = totals.total;
    var mastered = total ? totals.mastered / total * 100 : 0;
    var vague = mastered + (total ? totals.vague / total * 100 : 0);
    var wrong = vague + (total ? totals.wrong / total * 100 : 0);

    donut.style.setProperty('--kh-mastered-pct', mastered.toFixed(3) + '%');
    donut.style.setProperty('--kh-vague-pct', vague.toFixed(3) + '%');
    donut.style.setProperty('--kh-wrong-pct', wrong.toFixed(3) + '%');
  }

  function renderTotals(prefix, rawTotals) {
    var totals = normalizeTotals(rawTotals);
    setText(prefix + 'Pct', percent(totals.done, totals.total) + '%');
    setText(prefix + 'Done', format(totals.done) + ' / ' + format(totals.total));
    setText(prefix + 'Mastered', format(totals.mastered));
    setText(prefix + 'Vague', format(totals.vague));
    setText(prefix + 'Wrong', format(totals.wrong));
    setText(prefix + 'Unmarked', format(totals.unmarked));
    paintDonut(prefix + 'Donut', totals);
    return totals;
  }

  function renderAll(totalsBySubject) {
    totalsBySubject = totalsBySubject || {};
    var all = normalizeTotals(totalsBySubject.all);
    var masteredPct = percent(all.mastered, all.total);

    setText('khAllPct', percent(all.done, all.total) + '%');
    setText('khAllDone', format(all.done) + ' / ' + format(all.total));
    setText('khAllMastered', format(all.mastered) + ' 项（' + masteredPct + '%）');
    setText('khAllVague', format(all.vague) + ' 项');
    setText('khAllWrong', format(all.wrong) + ' 项');
    setText('khAllUnmarked', format(all.unmarked) + ' 项');
    paintDonut('khAllDonut', all);

    renderTotals('khEnglish', totalsBySubject.english);
    renderTotals('khMath', totalsBySubject.math);
    renderTotals('khMajor', totalsBySubject.major);
  }

  function parseLocalDate(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return null;
    var date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (
      date.getFullYear() !== Number(match[1]) ||
      date.getMonth() !== Number(match[2]) - 1 ||
      date.getDate() !== Number(match[3])
    ) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  }

  function renderCountdown() {
    var settings = safeJSON(getPrefix() + SETTINGS_SUFFIX, {});
    var examDate = settings && typeof settings.examDate === 'string' ? settings.examDate : '';
    var target = parseLocalDate(examDate);
    var dateText = examDate || '尚未设置考试日期';
    setText('khExamDate', examDate ? '考试日期：' + dateText : dateText);

    if (!target) {
      setText('khCountdownDays', '—');
      return;
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var days = Math.ceil((target.getTime() - today.getTime()) / 86400000);
    setText('khCountdownDays', Math.max(0, days));
  }

  function analyticsReady() {
    return !!(
      window.StudyAnalytics &&
      typeof window.StudyAnalytics.getSubjectTotals === 'function'
    );
  }

  function render(attempt) {
    attempt = Number(attempt) || 0;
    renderCountdown();

    if (!analyticsReady()) {
      if (attempt < MAX_WAIT) {
        window.setTimeout(function () { render(attempt + 1); }, WAIT_MS);
      } else {
        console.warn('[kyson-home] StudyAnalytics not ready; progress cards stay at zero.');
      }
      return;
    }

    try {
      renderAll(window.StudyAnalytics.getSubjectTotals());
    } catch (error) {
      console.error('[kyson-home] failed to render progress cards', error);
    }
  }

  function openWheel(kind) {
    var safeKind = kind === 'major' || kind === 'wrong' ? kind : 'math';
    var target = 'study.html?wheel=' + encodeURIComponent(safeKind) + '&from=home';
    window.location.href = target;
  }

  function bindWheelLaunchers() {
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-wheel]');
      if (!trigger) return;
      event.preventDefault();
      openWheel(trigger.getAttribute('data-wheel'));
    });
  }

  function init() {
    bindWheelLaunchers();
    render(0);
    window.addEventListener('storage', function (event) {
      if (!event.key) return;
      if (
        event.key.indexOf('_status') >= 0 ||
        event.key.indexOf('kaoyan_english_vocabulary_v2') >= 0 ||
        event.key.indexOf(SETTINGS_SUFFIX) >= 0
      ) {
        render(0);
      }
    });
    window.addEventListener('pageshow', function () { render(0); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  window.KysonHomeDashboard = {
    render: function () { render(0); },
    openWheel: openWheel
  };
})();
