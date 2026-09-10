(function () {
  'use strict';

  var DAY_MS = 86400000;
  var PREFIX_FALLBACK = 'user_guest_';
  var SETTINGS_SUFFIX = 'study_dashboard_settings_v1';
  var EVENTS_SUFFIX = 'study_events_v1';
  var MAX_EVENTS = 10000;
  var EVENT_RETENTION_DAYS = 365;
  var DEFAULT_EXAM_DATE = '';
  var STATUS_SCORE = { proficient: 5, familiar: 4, vague: 3, rusty: 2, wrong: 1 };
  var state = { bound: false };

  function getPrefix() {
    try {
      if (typeof window.userStoragePrefix === 'function') {
        var prefix = window.userStoragePrefix();
        if (typeof prefix === 'string') return prefix;
      }
    } catch (error) {}
    return PREFIX_FALLBACK;
  }
  function settingsKey() { return getPrefix() + SETTINGS_SUFFIX; }
  function eventsKey() { return getPrefix() + EVENTS_SUFFIX; }
  function readJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (error) { return fallback; }
  }
  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('[study-analytics] localStorage write failed', error);
      return false;
    }
  }
  function pad2(value) { return String(value).padStart(2, '0'); }
  function dayKey(input) {
    var date = input instanceof Date ? new Date(input.getTime()) : new Date(input);
    if (Number.isNaN(date.getTime())) return '';
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }
  function parseLocalDate(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!match) return null;
    var year = Number(match[1]);
    var month = Number(match[2]);
    var day = Number(match[3]);
    var date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    date.setHours(0, 0, 0, 0);
    return date;
  }
  function currentSettings() {
    var saved = readJSON(settingsKey(), {});
    return { schemaVersion: 1, examDate: typeof saved.examDate === 'string' ? saved.examDate : DEFAULT_EXAM_DATE };
  }
  function saveSettings(settings) {
    return writeJSON(settingsKey(), { schemaVersion: 1, examDate: settings.examDate || '' });
  }
  function setText(id, value) {
    var node = document.getElementById(id);
    if (node) node.textContent = String(value);
    return node;
  }

  function emptyTotals() {
    return {
      total: 0,
      done: 0,
      mastered: 0,
      vague: 0,
      wrong: 0,
      unmarked: 0
    };
  }

  function cloneTotals(source) {
    var result = emptyTotals();
    return mergeTotals(result, source);
  }

  function mergeTotals(target, source) {
    if (!target || !source) return target;
    target.total += Number(source.total) || 0;
    target.done += Number(source.done) || 0;
    target.mastered += Number(source.mastered) || 0;
    target.vague += Number(source.vague) || 0;
    target.wrong += Number(source.wrong) || 0;
    target.unmarked += Number(source.unmarked) || 0;
    return target;
  }

  function applyStatus(result, status) {
    if (!Object.prototype.hasOwnProperty.call(STATUS_SCORE, status)) {
      result.unmarked += 1;
      return;
    }

    result.done += 1;

    if (status === 'proficient' || status === 'familiar') {
      result.mastered += 1;
    } else if (status === 'vague' || status === 'rusty') {
      result.vague += 1;
    } else if (status === 'wrong') {
      result.wrong += 1;
    }
  }

  function normalizeAnalyticsGroup(value) {
    var group = String(value || '').trim().toLowerCase();

    if (
      group === 'math' ||
      group === 'mathematics' ||
      group === '数学'
    ) {
      return 'math';
    }

    if (
      group === 'major' ||
      group === 'professional' ||
      group === '专业' ||
      group === '专业课'
    ) {
      return 'major';
    }

    return '';
  }

  function resolveQuestionGroup(subject) {
    if (!subject) return '';

    var explicit = normalizeAnalyticsGroup(
      subject.analyticsGroup ||
      subject.progressGroup ||
      subject.group ||
      subject.category
    );

    if (explicit) return explicit;

    var text = [
      subject.id,
      subject.key,
      subject.name,
      subject.title,
      subject.label,
      subject.storageSuffix
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (
      /数学|高数|高等数学|线代|线性代数|概率|math|calculus/.test(text)
    ) {
      return 'math';
    }

    if (
      /专业课|专业|408|计算机|数据结构|组成原理|操作系统|计算机网络|电路|电子技术|信号|major|professional/.test(text)
    ) {
      return 'major';
    }

    return '';
  }

  function collectQuestionBuckets() {
    var buckets = {
      all: emptyTotals(),
      math: emptyTotals(),
      major: emptyTotals()
    };

    var subjects = Array.isArray(window.SUBJECTS)
      ? window.SUBJECTS
      : [];

    var prefix = getPrefix();

    subjects.forEach(function (subject) {
      if (!subject) return;

      var group = resolveQuestionGroup(subject);
      var chapters = Array.isArray(subject.chapters)
        ? subject.chapters
        : [];

      chapters.forEach(function (chapter) {
        if (!chapter) return;

        var rawTotal = Number(chapter.total);
        if (!Number.isFinite(rawTotal) || rawTotal <= 0) return;

        var total = Number(chapter.ownTotal || rawTotal);
        if (!Number.isFinite(total) || total <= 0) return;

        var key =
          prefix +
          chapter.id +
          '_' +
          subject.storageSuffix +
          '_status';

        var map = readJSON(key, {});

        var targets = [buckets.all];
        if (group && buckets[group]) {
          targets.push(buckets[group]);
        }

        targets.forEach(function (target) {
          target.total += total;
        });

        for (var index = 0; index < total; index += 1) {
          var status = map[String(index)];

          targets.forEach(function (target) {
            applyStatus(target, status);
          });
        }
      });
    });

    return buckets;
  }

  function collectEnglishTotals() {
    var result = emptyTotals();
    var prefix = getPrefix();

    var english = readJSON(
      prefix + 'kaoyan_english_vocabulary_v2',
      { items: [] }
    );

    var words =
      english && Array.isArray(english.items)
        ? english.items
        : [];

    result.total = words.length;

    words.forEach(function (word) {
      applyStatus(result, word && word.status);
    });

    return result;
  }

  function getSubjectTotals() {
    var questionBuckets = collectQuestionBuckets();
    var english = collectEnglishTotals();

    var all = cloneTotals(questionBuckets.all);
    mergeTotals(all, english);

    return {
      all: all,
      english: english,
      math: questionBuckets.math,
      major: questionBuckets.major
    };
  }

  function getStatusTotals() {
    return getSubjectTotals().all;
  }

  function progressPercent(totals) {
    if (!totals || !totals.total) return 0;
    return Math.round(totals.done / totals.total * 100);
  }

  function masteredPercent(totals) {
    if (!totals || !totals.total) return 0;
    return Math.round(totals.mastered / totals.total * 100);
  }

  function paintStatusDonut(donut, totals, label) {
    if (!donut) return;

    var percent = progressPercent(totals);

    if (!totals || !totals.total) {
      donut.style.background =
        'conic-gradient(#dbe8f6 0 100%)';
    } else {
      var cursor = 0;
      var segments = [];

      [
        { value: totals.mastered, color: '#087f5b' },
        { value: totals.vague, color: '#b26b00' },
        { value: totals.wrong, color: '#c63d4a' },
        { value: totals.unmarked, color: '#dbe8f6' }
      ].forEach(function (segment) {
        var end =
          cursor +
          segment.value / totals.total * 100;

        if (end > cursor) {
          segments.push(
            segment.color +
            ' ' +
            cursor +
            '% ' +
            end +
            '%'
          );
        }

        cursor = end;
      });

      donut.style.background =
        'conic-gradient(' + segments.join(', ') + ')';
    }

    donut.setAttribute(
      'aria-label',
      label +
      ' ' +
      percent +
      '%，已标记 ' +
      totals.done +
      ' / ' +
      totals.total +
      '，熟练 ' +
      totals.mastered +
      '，模糊 ' +
      totals.vague +
      '，不会 ' +
      totals.wrong +
      '，未标 ' +
      totals.unmarked
    );
  }

  function renderTotals(summary) {
    var totals =
      summary && summary.all
        ? summary.all
        : getSubjectTotals().all;

    var percent = progressPercent(totals);
    var mastered = masteredPercent(totals);

    setText('siProgressPct', percent + '%');

    setText(
      'siDoneText',
      totals.done.toLocaleString('zh-CN') +
      ' / ' +
      totals.total.toLocaleString('zh-CN')
    );

    setText(
      'siMasteredText',
      totals.mastered.toLocaleString('zh-CN') +
      ' 项（' +
      mastered +
      '%）'
    );

    setText(
      'siVagueText',
      totals.vague.toLocaleString('zh-CN') + ' 项'
    );

    setText(
      'siWrongText',
      totals.wrong.toLocaleString('zh-CN') + ' 项'
    );

    paintStatusDonut(
      document.getElementById('siMasteryDonut'),
      totals,
      '全站总进度'
    );
  }

  var SUBJECT_PROGRESS_UI = {
    english: {
      label: '英语总进度',
      donut: 'siEnglishDonut',
      pct: 'siEnglishPct',
      done: 'siEnglishDoneText',
      mastered: 'siEnglishMasteredText',
      vague: 'siEnglishVagueText',
      wrong: 'siEnglishWrongText',
      unmarked: 'siEnglishUnmarkedText'
    },

    math: {
      label: '数学总进度',
      donut: 'siMathDonut',
      pct: 'siMathPct',
      done: 'siMathDoneText',
      mastered: 'siMathMasteredText',
      vague: 'siMathVagueText',
      wrong: 'siMathWrongText',
      unmarked: 'siMathUnmarkedText'
    },

    major: {
      label: '专业课总进度',
      donut: 'siMajorDonut',
      pct: 'siMajorPct',
      done: 'siMajorDoneText',
      mastered: 'siMajorMasteredText',
      vague: 'siMajorVagueText',
      wrong: 'siMajorWrongText',
      unmarked: 'siMajorUnmarkedText'
    }
  };

  function renderSubjectProgress(summary) {
    var totalsBySubject =
      summary || getSubjectTotals();

    Object.keys(SUBJECT_PROGRESS_UI)
      .forEach(function (group) {
        var meta = SUBJECT_PROGRESS_UI[group];
        var totals =
          totalsBySubject[group] || emptyTotals();

        setText(
          meta.pct,
          progressPercent(totals) + '%'
        );

        setText(
          meta.done,
          totals.done.toLocaleString('zh-CN') +
          ' / ' +
          totals.total.toLocaleString('zh-CN')
        );

        setText(
          meta.mastered,
          totals.mastered.toLocaleString('zh-CN')
        );

        setText(
          meta.vague,
          totals.vague.toLocaleString('zh-CN')
        );

        setText(
          meta.wrong,
          totals.wrong.toLocaleString('zh-CN')
        );

        setText(
          meta.unmarked,
          totals.unmarked.toLocaleString('zh-CN')
        );

        paintStatusDonut(
          document.getElementById(meta.donut),
          totals,
          meta.label
        );
      });
  }

  function getRecentDays() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var days = [];
    for (var offset = 13; offset >= 0; offset -= 1) {
      var date = new Date(today.getTime() - offset * DAY_MS);
      days.push({ key: dayKey(date), label: (date.getMonth() + 1) + '/' + date.getDate() });
    }
    return days;
  }
  function getTrendCounts() {
    var days = getRecentDays();
    var byDay = {};
    days.forEach(function (day) { byDay[day.key] = 0; });
    var events = readJSON(eventsKey(), []);
    if (!Array.isArray(events)) events = [];
    events.forEach(function (event) {
      if (!event) return;
      var key = typeof event.day === 'string' ? event.day : dayKey(event.ts);
      if (Object.prototype.hasOwnProperty.call(byDay, key)) byDay[key] += 1;
    });
    return { days: days, counts: days.map(function (day) { return byDay[day.key]; }) };
  }
  function renderTrend() {
    var chart = document.getElementById('siTrendChart');
    var axis = document.getElementById('siTrendAxis');
    var empty = document.getElementById('siTrendEmpty');
    if (!chart || !axis) return;
    var trend = getTrendCounts();
    var counts = trend.counts;
    var total = counts.reduce(function (sum, count) { return sum + count; }, 0);
    var average = total / counts.length;
    var max = Math.max(1, counts.reduce(function (highest, count) { return Math.max(highest, count); }, 0));
    chart.replaceChildren();
    axis.replaceChildren();

    var averageLine = document.createElement('div');
    averageLine.className = 'si-average-line';
    averageLine.style.bottom = average / max * 100 + '%';
    var averageLabel = document.createElement('span');
    averageLabel.textContent = '平均';
    averageLine.appendChild(averageLabel);
    chart.appendChild(averageLine);

    counts.forEach(function (count, index) {
      var column = document.createElement('div');
      column.className = 'si-bar-col';
      var track = document.createElement('div');
      track.className = 'si-bar-track';
      var bar = document.createElement('div');
      bar.className = 'si-bar';
      bar.style.height = count > 0 ? Math.max(3, count / max * 100) + '%' : '0%';
      if (count > 0) {
        var value = document.createElement('span');
        value.className = 'si-bar-value';
        value.textContent = String(count);
        bar.appendChild(value);
      }
      track.appendChild(bar);
      column.appendChild(track);
      chart.appendChild(column);
      var label = document.createElement('span');
      label.textContent = trend.days[index].label;
      axis.appendChild(label);
    });
    setText('siTrendTotal', '近 14 天累计：' + total + ' 次');
    setText('siTrendAverage', '日均：' + average.toFixed(1) + ' 次/天');
    if (empty) empty.hidden = total !== 0;
  }

  function renderCountdown() {
    var settings = currentSettings();
    var daysNode = document.getElementById('siCountdownDays');
    var quoteNode = document.getElementById('siCountdownQuote');
    var button = document.getElementById('siExamDateBtn');
    var target = parseLocalDate(settings.examDate);
    if (!target) {
      if (daysNode) daysNode.textContent = '—';
      if (quoteNode) quoteNode.textContent = '请先设置初试日期，倒计时会自动显示。';
      if (button) button.textContent = '设置考试日期';
      return;
    }
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var difference = Math.ceil((target.getTime() - today.getTime()) / DAY_MS);
    if (daysNode) daysNode.textContent = String(Math.max(0, difference));
    if (quoteNode) {
      quoteNode.textContent = difference >= 0
        ? '稳住节奏，逐题推进；你今天的每一步，都在靠近目标。'
        : '设定的日期已过去，请更新下一次考试日期。';
    }
    if (button) button.textContent = '修改日期（' + settings.examDate + '）';
  }
  function render() {
    if (!document.getElementById('studyInsights')) return;

    var totals = getSubjectTotals();

    renderCountdown();
    renderTotals(totals);
    renderSubjectProgress(totals);
    renderTrend();
  }

  function makeEventId(timestamp) {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    } catch (error) {}
    return String(timestamp) + '-' + Math.random().toString(36).slice(2);
  }
  function recordStatus(payload) {
    if (!payload || !Object.prototype.hasOwnProperty.call(STATUS_SCORE, payload.status)) return;
    var timestamp = Date.now();
    var cutoff = timestamp - EVENT_RETENTION_DAYS * DAY_MS;
    var events = readJSON(eventsKey(), []);
    if (!Array.isArray(events)) events = [];
    events = events.filter(function (event) { return event && Number(event.ts) >= cutoff; });
    events.push({
      id: makeEventId(timestamp),
      ts: timestamp,
      day: dayKey(timestamp),
      type: 'status',
      source: payload.source === 'sm2' ? 'sm2' : 'mark',
      subjectId: payload.subjectId == null ? '' : String(payload.subjectId),
      chapterId: payload.chapterId == null ? '' : String(payload.chapterId),
      idx: Number.isFinite(Number(payload.idx)) ? Number(payload.idx) : null,
      status: payload.status,
      score: STATUS_SCORE[payload.status]
    });
    if (events.length > MAX_EVENTS) events = events.slice(events.length - MAX_EVENTS);
    writeJSON(eventsKey(), events);
    renderTrend();
  }

  function openSettings() {
    var modal = document.getElementById('studySettingsModal');
    var input = document.getElementById('siExamDateInput');
    if (!modal || !input) return;
    input.value = currentSettings().examDate || '';
    modal.hidden = false;
    modal.style.display = 'flex';
    input.focus();
  }
  function closeSettings() {
    var modal = document.getElementById('studySettingsModal');
    if (!modal) return;
    modal.hidden = true;
    modal.style.display = 'none';
  }
  function saveSettingsFromDialog() {
    var input = document.getElementById('siExamDateInput');
    if (!input) return;
    var value = String(input.value || '').trim();
    if (value && !parseLocalDate(value)) {
      window.alert('日期格式无效，请选择有效日期。');
      return;
    }
    saveSettings({ examDate: value });
    closeSettings();
    renderCountdown();
  }
  function bind() {
    if (state.bound) return;
    state.bound = true;
    var examButton = document.getElementById('siExamDateBtn');
    var cancelButton = document.getElementById('siSettingsCancel');
    var saveButton = document.getElementById('siSettingsSave');
    var modal = document.getElementById('studySettingsModal');
    if (examButton) examButton.addEventListener('click', openSettings);
    if (cancelButton) cancelButton.addEventListener('click', closeSettings);
    if (saveButton) saveButton.addEventListener('click', saveSettingsFromDialog);
    if (modal) modal.addEventListener('click', function (event) {
      if (event.target === modal) closeSettings();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeSettings();
    });
    window.addEventListener('storage', function (event) {
      if (event.key === settingsKey() || event.key === eventsKey()) render();
    });
  }
  function init() { bind(); render(); }

  window.StudyAnalytics = {
    init: init,
    render: render,
    recordStatus: recordStatus,
    getStatusTotals: getStatusTotals,
    getSubjectTotals: getSubjectTotals,
    getTrendCounts: getTrendCounts
  };
  window.addEventListener('kaoyan:ready', render);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
