(function () {
  'use strict';

  function emptyTotals() {
    return { total: 0, done: 0, mastered: 0, vague: 0, wrong: 0, unmarked: 0 };
  }

  function cloneTotals(source) {
    var src = source || emptyTotals();
    return {
      total: Number(src.total) || 0,
      done: Number(src.done) || 0,
      mastered: Number(src.mastered) || 0,
      vague: Number(src.vague) || 0,
      wrong: Number(src.wrong) || 0,
      unmarked: Number(src.unmarked) || 0
    };
  }

  function addTotals(target, source) {
    target.total += Number(source.total) || 0;
    target.done += Number(source.done) || 0;
    target.mastered += Number(source.mastered) || 0;
    target.vague += Number(source.vague) || 0;
    target.wrong += Number(source.wrong) || 0;
    target.unmarked += Number(source.unmarked) || 0;
    return target;
  }

  function pct(totals) {
    if (!totals || !totals.total) return 0;
    return Math.max(0, Math.min(100, Math.round(totals.done / totals.total * 100)));
  }

  function formatNumber(value) {
    return (Number(value) || 0).toLocaleString('zh-CN');
  }

  function getSummary() {
    var result = {
      all: emptyTotals(),
      math: emptyTotals(),
      major: emptyTotals(),
      english: emptyTotals()
    };

    try {
      if (window.StudyAnalytics && typeof window.StudyAnalytics.getSubjectTotals === 'function') {
        var raw = window.StudyAnalytics.getSubjectTotals() || {};
        result.all = cloneTotals(raw.all);
        result.math = cloneTotals(raw.math);
        result.major = cloneTotals(raw.major);
        result.english = cloneTotals(raw.english);
      }
    } catch (error) {
      console.warn('[home] StudyAnalytics unavailable:', error);
    }

    // 首次进入且英语词汇尚未初始化 localStorage 时，用已加载词库数量作为“未标记”总数。
    // 这样首页不会误显示“英语 0 / 0”。只在没有任何英语保存数据时使用。
    try {
      var englishKey = 'user_guest_kaoyan_english_vocabulary_v2';
      var hasSavedEnglish = Boolean(window.localStorage.getItem(englishKey));
      var importedEntries = Array.isArray(window.ENGLISH_IMPORTED_ENTRIES)
        ? window.ENGLISH_IMPORTED_ENTRIES
        : [];
      if (!hasSavedEnglish && result.english.total === 0 && importedEntries.length > 0) {
        var fallbackEnglish = emptyTotals();
        fallbackEnglish.total = importedEntries.length;
        fallbackEnglish.unmarked = importedEntries.length;
        result.english = fallbackEnglish;
        result.all = addTotals(result.all, fallbackEnglish);
      }
    } catch (error) {}

    return result;
  }

  function setText(id, value) {
    var node = document.getElementById(id);
    if (node) node.textContent = String(value);
  }

  function paintDonut(node, totals) {
    if (!node) return;
    var total = Math.max(0, Number(totals.total) || 0);
    if (!total) {
      node.style.background = 'conic-gradient(#dfe9f5 0 100%)';
      return;
    }

    var parts = [
      { value: totals.mastered, color: '#18a874' },
      { value: totals.vague, color: '#d58a18' },
      { value: totals.wrong, color: '#d74a5d' },
      { value: totals.unmarked, color: '#dfe9f5' }
    ];
    var cursor = 0;
    var segments = [];
    parts.forEach(function (part) {
      var value = Math.max(0, Number(part.value) || 0);
      if (!value) return;
      var end = Math.min(100, cursor + value / total * 100);
      segments.push(part.color + ' ' + cursor + '% ' + end + '%');
      cursor = end;
    });
    if (cursor < 100) segments.push('#dfe9f5 ' + cursor + '% 100%');
    node.style.background = 'conic-gradient(' + segments.join(', ') + ')';
  }

  function renderOverall(summary) {
    var totals = summary.all;
    var progress = pct(totals);
    setText('homeOverallPct', progress + '%');
    setText('homeDoneText', formatNumber(totals.done) + ' / ' + formatNumber(totals.total));
    setText('homeMasteredText', formatNumber(totals.mastered) + ' 项');
    setText('homeVagueText', formatNumber(totals.vague) + ' 项');
    setText('homeWrongText', formatNumber(totals.wrong) + ' 项');
    paintDonut(document.getElementById('homeOverallDonut'), totals);
  }

  function renderSubjectCard(key, totals) {
    var percentNode = document.querySelector('[data-progress-pct="' + key + '"]');
    var metaNode = document.querySelector('[data-progress-meta="' + key + '"]');
    var barNode = document.querySelector('[data-progress-bar="' + key + '"]');
    if (!percentNode || !metaNode || !barNode) return;

    var progress = pct(totals);
    percentNode.textContent = progress + '%';
    metaNode.textContent = formatNumber(totals.done) + ' / ' + formatNumber(totals.total) + ' 已标记';
    barNode.style.width = progress + '%';
  }

  function render() {
    var summary = getSummary();
    renderOverall(summary);
    renderSubjectCard('math', summary.math);
    renderSubjectCard('major', summary.major);
    renderSubjectCard('english', summary.english);
  }

  function bindKeyboardNavigation() {
    document.addEventListener('keydown', function (event) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.target && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
      var map = { '1': 'math', '2': 'major', '3': 'english', '4': 'politics' };
      var key = map[event.key];
      if (!key) return;
      var card = document.querySelector('[data-module="' + key + '"]');
      if (card) card.click();
    });
  }

  function init() {
    render();
    bindKeyboardNavigation();
    window.addEventListener('storage', render);
    window.addEventListener('focus', render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
