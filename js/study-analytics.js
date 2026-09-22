(function () {
  'use strict';

  var DAY_MS = 86400000;
  var PREFIX_FALLBACK = 'user_guest_';
  var SETTINGS_SUFFIX = 'study_dashboard_settings_v1';
  var EVENTS_SUFFIX = 'study_events_v1';
  var MAX_EVENTS = 10000;
  var EVENT_RETENTION_DAYS = 365;
  var DEFAULT_EXAM_DATE = '';
  var DEFAULT_DAILY_GOALS = { math: 20, major: 20 };
  var DEFAULT_DAILY_TOPIC_GOALS = {
    math: { enabled: false, title: '', subjectId: 'shu1', bookId: '', chapterId: '', target: 10 },
    major: { enabled: false, title: '', subjectId: 'zhuanye', bookId: '', chapterId: '', target: 10 }
  };
  var MAX_DAILY_GOAL = 999;
  var STATUS_SCORE = { proficient: 5, familiar: 4, vague: 3, rusty: 2, wrong: 1 };

  var goalToastTimer = 0;
  var goalToastSequence = 0;
  var topicToastTimer = 0;
  var topicToastSequence = 0;
  var state = {
    bound: false,
    topicBound: false,
    midnightTimer: 0
  };

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
  function normalizeGoal(value, fallback) {
    if (value === null || value === undefined) return fallback;

    var number = Number(value);
    if (!Number.isFinite(number)) return fallback;

    return Math.max(
      0,
      Math.min(MAX_DAILY_GOAL, Math.floor(number))
    );
  }

  function normalizeSingleTopicGoal(group, item) {
    var defaultSubject = group === 'major' ? 'zhuanye' : 'shu1';
    item = item && typeof item === 'object' ? item : {};

    var title = typeof item.title === 'string' ? item.title.trim() : '';
    var chapterId = typeof item.chapterId === 'string' ? item.chapterId.trim() : '';
    var bookId = typeof item.bookId === 'string' ? item.bookId.trim() : '';
    var subjectId = typeof item.subjectId === 'string' && item.subjectId.trim()
      ? item.subjectId.trim()
      : defaultSubject;

    var target = normalizeGoal(item.target, 10);
    if (target <= 0) target = 10;

    var enabled = Boolean(item.enabled && (title || chapterId));

    return {
      enabled: enabled,
      title: title,
      subjectId: subjectId,
      bookId: bookId,
      chapterId: chapterId,
      target: target
    };
  }

  function normalizeDailyTopicGoals(raw) {
    raw = raw && typeof raw === 'object' ? raw : {};
    return {
      math: normalizeSingleTopicGoal('math', raw.math),
      major: normalizeSingleTopicGoal('major', raw.major)
    };
  }

  function currentSettings() {
    var saved = readJSON(settingsKey(), {});
    var savedGoals =
      saved &&
      saved.dailyGoals &&
      typeof saved.dailyGoals === 'object'
        ? saved.dailyGoals
        : {};

    var savedTopicGoals =
      saved &&
      saved.dailyTopicGoals &&
      typeof saved.dailyTopicGoals === 'object'
        ? saved.dailyTopicGoals
        : {};

    var savedCelebrations =
      saved &&
      saved.topicGoalCelebrations &&
      typeof saved.topicGoalCelebrations === 'object'
        ? saved.topicGoalCelebrations
        : {};

    return {
      schemaVersion: 2,
      examDate:
        typeof saved.examDate === 'string'
          ? saved.examDate
          : DEFAULT_EXAM_DATE,
      dailyGoals: {
        math: normalizeGoal(
          savedGoals.math,
          DEFAULT_DAILY_GOALS.math
        ),
        major: normalizeGoal(
          savedGoals.major,
          DEFAULT_DAILY_GOALS.major
        )
      },
      dailyTopicGoals: normalizeDailyTopicGoals(savedTopicGoals),
      topicGoalCelebrations: {
        math: savedCelebrations.math || null,
        major: savedCelebrations.major || null
      }
    };
  }

  function saveSettings(settings) {
    settings = settings || {};

    var current = currentSettings();
    var goals =
      settings.dailyGoals &&
      typeof settings.dailyGoals === 'object'
        ? settings.dailyGoals
        : current.dailyGoals;

    var topicGoals =
      settings.dailyTopicGoals &&
      typeof settings.dailyTopicGoals === 'object'
        ? settings.dailyTopicGoals
        : current.dailyTopicGoals;

    var celebrations =
      settings.topicGoalCelebrations &&
      typeof settings.topicGoalCelebrations === 'object'
        ? settings.topicGoalCelebrations
        : current.topicGoalCelebrations;

    var next = {
      schemaVersion: 2,
      examDate:
        typeof settings.examDate === 'string'
          ? settings.examDate
          : current.examDate,
      dailyGoals: {
        math: normalizeGoal(
          goals.math,
          current.dailyGoals.math
        ),
        major: normalizeGoal(
          goals.major,
          current.dailyGoals.major
        )
      },
      dailyTopicGoals: normalizeDailyTopicGoals(topicGoals),
      topicGoalCelebrations: celebrations
    };

    return writeJSON(settingsKey(), next);
  }

  function getDailyTopicGoals() {
    return currentSettings().dailyTopicGoals;
  }

  function saveDailyTopicGoals(nextGoals) {
    return saveSettings({
      dailyTopicGoals: nextGoals
    });
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

    if (
      group === 'english' ||
      group === 'en' ||
      group === '英语' ||
      group === '英语词汇'
    ) {
      return 'english';
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

  function resolveEventGroup(event) {
    var direct = normalizeAnalyticsGroup(event && event.group);
    if (direct) return direct;

    var subjectId =
      event && event.subjectId != null
        ? String(event.subjectId)
        : '';

    var subjects =
      Array.isArray(window.SUBJECTS)
        ? window.SUBJECTS
        : [];

    for (var i = 0; i < subjects.length; i += 1) {
      var subject = subjects[i];

      if (
        subject &&
        String(subject.id) === subjectId
      ) {
        return resolveQuestionGroup(subject);
      }
    }

    return '';
  }

  function getDailyGoalCounts(input, eventsOverride) {
    var wantedDay = dayKey(
      input == null ? Date.now() : input
    );

    var events =
      Array.isArray(eventsOverride)
        ? eventsOverride
        : readJSON(eventsKey(), []);

    if (!Array.isArray(events)) {
      events = [];
    }

    var seen = {
      math: new Set(),
      major: new Set()
    };

    events.forEach(function (event) {
      if (!event) return;

      // 只统计状态标记事件；兼容极早期没有 type 的旧记录。
      if (event.type && event.type !== 'status') return;

      var eventDay =
        typeof event.day === 'string'
          ? event.day
          : dayKey(event.ts);

      if (eventDay !== wantedDay) return;

      var group = resolveEventGroup(event);
      if (!seen[group]) return;
      if (event.idx == null) return;

      var identity =
        String(event.subjectId || '') +
        '::' +
        String(event.chapterId || '') +
        '::' +
        String(event.idx);

      seen[group].add(identity);
    });

    return {
      math: seen.math.size,
      major: seen.major.size
    };
  }

  function getStudyStreak(input, eventsOverride) {
    var anchor =
      input == null
        ? new Date()
        : new Date(input);

    if (Number.isNaN(anchor.getTime())) {
      return 0;
    }

    anchor.setHours(0, 0, 0, 0);

    var events =
      Array.isArray(eventsOverride)
        ? eventsOverride
        : readJSON(eventsKey(), []);

    if (!Array.isArray(events)) {
      events = [];
    }

    var activeDays = new Set();

    events.forEach(function (event) {
      if (!event) return;

      // 只把真实状态学习事件算作学习日；
      // 兼容很早期没有 type 的状态记录。
      if (event.type && event.type !== 'status') {
        return;
      }

      var group = resolveEventGroup(event);

      if (
        group !== 'math' &&
        group !== 'major' &&
        group !== 'english'
      ) {
        return;
      }

      var eventDay =
        typeof event.day === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(event.day)
          ? event.day
          : dayKey(event.ts);

      if (eventDay) {
        activeDays.add(eventDay);
      }
    });

    var cursor = new Date(anchor.getTime());

    // 今天没有学习，但昨天学习了：从昨天开始算连续天数。
    if (!activeDays.has(dayKey(cursor))) {
      cursor.setDate(cursor.getDate() - 1);
    }

    var streak = 0;

    while (activeDays.has(dayKey(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
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
      var date = new Date(today.getTime());
      date.setDate(today.getDate() - offset);

      days.push({
        key: dayKey(date),
        label: (date.getMonth() + 1) + '/' + date.getDate()
      });
    }

    return days;
  }

  function getTrendCounts() {
    var days = getRecentDays();
    var byDay = {};

    days.forEach(function (day) {
      byDay[day.key] = 0;
    });

    var events = readJSON(eventsKey(), []);

    if (!Array.isArray(events)) {
      events = [];
    }

    events.forEach(function (event) {
      if (!event) return;

      if (event.type && event.type !== 'status') {
        return;
      }

      var group = resolveEventGroup(event);

      if (
        group !== 'math' &&
        group !== 'major' &&
        group !== 'english'
      ) {
        return;
      }

      var key =
        typeof event.day === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(event.day)
          ? event.day
          : dayKey(event.ts);

      if (Object.prototype.hasOwnProperty.call(byDay, key)) {
        byDay[key] += 1;
      }
    });

    return {
      days: days,
      counts: days.map(function (day) {
        return byDay[day.key];
      })
    };
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

  var DAILY_GOAL_UI = {
    math: {
      label: '数学',
      item: 'dailyGoalMathItem',
      ring: 'dailyGoalMathRing',
      pct: 'dailyGoalMathPct',
      text: 'dailyGoalMathText'
    },
    major: {
      label: '专业课',
      item: 'dailyGoalMajorItem',
      ring: 'dailyGoalMajorRing',
      pct: 'dailyGoalMajorPct',
      text: 'dailyGoalMajorText'
    }
  };

  function renderDailyGoals(counts, settings) {
    settings = settings || currentSettings();
    counts = counts || getDailyGoalCounts(Date.now());

    var targets = {
      math: normalizeGoal(
        settings.dailyGoals.math,
        DEFAULT_DAILY_GOALS.math
      ),
      major: normalizeGoal(
        settings.dailyGoals.major,
        DEFAULT_DAILY_GOALS.major
      )
    };

    Object.keys(DAILY_GOAL_UI).forEach(function (group) {
      var meta = DAILY_GOAL_UI[group];
      var target = targets[group];
      var count = Number(counts[group]) || 0;

      var complete =
        target > 0 &&
        count >= target;

      var percent =
        target > 0
          ? Math.min(
              100,
              Math.round(count / target * 100)
            )
          : 0;

      var item = document.getElementById(meta.item);
      var ring = document.getElementById(meta.ring);

      if (item) {
        item.classList.toggle('is-complete', complete);
      }

      if (ring) {
        ring.style.setProperty(
          '--goal-progress',
          percent + '%'
        );
      }

      setText(
        meta.pct,
        target > 0
          ? percent + '%'
          : '—'
      );

      setText(
        meta.text,
        target > 0
          ? (
              complete
                ? '已完成 · ' + count + '/' + target
                : count + '/' + target
            )
          : '未设置'
      );
    });

    var button = document.getElementById('dailyGoalButton');
    if (button) {
      var mathCopy =
        targets.math > 0
          ? counts.math + '/' + targets.math
          : '未设置';

      var majorCopy =
        targets.major > 0
          ? counts.major + '/' + targets.major
          : '未设置';

      button.setAttribute(
        'aria-label',
        '每日小目标：数学 ' +
          mathCopy +
          '，专业课 ' +
          majorCopy +
          '。点击设置'
      );

      button.title =
        '点击设置每日小目标｜数学 ' +
        mathCopy +
        '｜专业课 ' +
        majorCopy;
    }
  }

  function showGoalToast(group, count, target) {
    var toast = document.getElementById('dailyGoalToast');
    if (!toast) return;

    var label =
      group === 'major'
        ? '专业课'
        : '数学';

    goalToastSequence += 1;
    var sequence = goalToastSequence;

    if (goalToastTimer) {
      clearTimeout(goalToastTimer);
      goalToastTimer = 0;
    }

    toast.textContent =
      '🎉 ' +
      label +
      '今日目标完成 · ' +
      count +
      '/' +
      target +
      ' 题';

    toast.hidden = false;

    var raf =
      window.requestAnimationFrame ||
      function (callback) {
        return setTimeout(callback, 0);
      };

    raf(function () {
      if (sequence !== goalToastSequence) return;
      toast.classList.add('is-visible');
    });

    goalToastTimer = setTimeout(function () {
      if (sequence !== goalToastSequence) return;

      toast.classList.remove('is-visible');

      setTimeout(function () {
        if (sequence === goalToastSequence) {
          toast.hidden = true;
        }
      }, 200);
    }, 2200);
  }

  function maybeCelebrateGoal(
    group,
    beforeCounts,
    afterCounts,
    settings
  ) {
    if (group !== 'math' && group !== 'major') {
      return;
    }

    var target = normalizeGoal(
      settings.dailyGoals[group],
      DEFAULT_DAILY_GOALS[group]
    );

    if (
      target > 0 &&
      beforeCounts[group] < target &&
      afterCounts[group] >= target
    ) {
      showGoalToast(
        group,
        afterCounts[group],
        target
      );
    }
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
    // Header 永远存在；dashboard 的 studyInsights 可能当前不可见。
    renderDailyGoals();
    renderDailyTopicGoals();

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
    if (
      !payload ||
      !Object.prototype.hasOwnProperty.call(
        STATUS_SCORE,
        payload.status
      )
    ) {
      return;
    }

    var timestamp = Date.now();
    var cutoff =
      timestamp -
      EVENT_RETENTION_DAYS * DAY_MS;

    var events = readJSON(eventsKey(), []);

    if (!Array.isArray(events)) {
      events = [];
    }

    events = events.filter(function (event) {
      return (
        event &&
        Number(event.ts) >= cutoff
      );
    });

    var beforeCounts =
      getDailyGoalCounts(timestamp, events);

    var settingsBefore = currentSettings();
    var beforeTopicProg = {
      math: getTopicProgressFromEvents(settingsBefore.dailyTopicGoals.math, events, dayKey(timestamp)),
      major: getTopicProgressFromEvents(settingsBefore.dailyTopicGoals.major, events, dayKey(timestamp))
    };

    var group = resolveEventGroup({
      group: payload.group,
      subjectId: payload.subjectId
    });

    events.push({
      id: makeEventId(timestamp),
      ts: timestamp,
      day: dayKey(timestamp),
      type: 'status',
      source:
        payload.source === 'sm2'
          ? 'sm2'
          : 'mark',
      group: group,
      subjectId:
        payload.subjectId == null
          ? ''
          : String(payload.subjectId),
      chapterId:
        payload.chapterId == null
          ? ''
          : String(payload.chapterId),
      idx:
        Number.isFinite(Number(payload.idx))
          ? Number(payload.idx)
          : null,
      itemKey:
        payload.itemKey == null
          ? ''
          : String(payload.itemKey),
      status: payload.status,
      score: STATUS_SCORE[payload.status]
    });

    if (events.length > MAX_EVENTS) {
      events = events.slice(
        events.length - MAX_EVENTS
      );
    }

    if (!writeJSON(eventsKey(), events)) {
      return;
    }

    var afterCounts =
      getDailyGoalCounts(timestamp, events);

    var afterTopicProg = {
      math: getTopicProgressFromEvents(settingsBefore.dailyTopicGoals.math, events, dayKey(timestamp)),
      major: getTopicProgressFromEvents(settingsBefore.dailyTopicGoals.major, events, dayKey(timestamp))
    };

    renderTrend();
    renderDailyGoals(afterCounts);
    renderDailyTopicGoals(events);

    maybeCelebrateGoal(
      group,
      beforeCounts,
      afterCounts,
      currentSettings()
    );

    if (group === 'math' || group === 'major') {
      maybeCelebrateDailyTopicGoal(
        group,
        beforeTopicProg[group],
        afterTopicProg[group],
        settingsBefore.dailyTopicGoals[group]
      );
    }
  }

  function readGoalInput(input, label) {
    var raw =
      String(
        input && input.value || ''
      ).trim();

    if (raw === '') {
      return 0;
    }

    var value = Number(raw);

    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value > MAX_DAILY_GOAL
    ) {
      window.alert(
        label +
        '每日目标请输入 0–' +
        MAX_DAILY_GOAL +
        ' 的整数。'
      );

      if (input) input.focus();
      return null;
    }

    return value;
  }

  function escapeHtmlAttr(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeHtmlText(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function findSubject(subjectId) {
    var subjects = Array.isArray(window.SUBJECTS) ? window.SUBJECTS : [];
    for (var i = 0; i < subjects.length; i += 1) {
      if (subjects[i] && String(subjects[i].id) === String(subjectId)) {
        return subjects[i];
      }
    }
    return null;
  }

  function findSubjectChapter(subjectId, chapterId) {
    if (!subjectId || !chapterId) return null;
    var subject = findSubject(subjectId);
    if (!subject || !Array.isArray(subject.chapters)) return null;
    for (var j = 0; j < subject.chapters.length; j += 1) {
      if (subject.chapters[j] && String(subject.chapters[j].id) === String(chapterId)) {
        return { subject: subject, chapter: subject.chapters[j] };
      }
    }
    return null;
  }

  function getTopicProgressFromEvents(goal, events, todayKey) {
    if (!goal || !goal.enabled || !goal.chapterId) {
      return {
        count: 0,
        target: Number(goal && goal.target) || 0,
        done: false,
        bound: false
      };
    }

    todayKey = todayKey || dayKey(Date.now());
    var seen = new Set();

    (events || []).forEach(function (event) {
      if (!event || (event.type && event.type !== 'status')) return;

      var group = resolveEventGroup(event);

      if (goal.subjectId === 'shu1' && group !== 'math') return;
      if (goal.subjectId === 'zhuanye' && group !== 'major') return;

      if (String(event.subjectId || '') !== String(goal.subjectId)) return;
      if (String(event.chapterId || '') !== String(goal.chapterId)) return;

      var eventDay =
        typeof event.day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(event.day)
          ? event.day
          : dayKey(event.ts);

      if (eventDay !== todayKey) return;

      var itemKey =
        event.itemKey != null && String(event.itemKey) !== ''
          ? String(event.itemKey)
          : event.idx != null
            ? String(event.idx)
            : '';

      if (!itemKey) return;

      seen.add(
        String(goal.subjectId) +
          '|' +
          String(goal.chapterId) +
          '|' +
          itemKey
      );
    });

    var count = seen.size;
    var target = Math.max(1, Number(goal.target) || 1);

    return {
      count: count,
      target: target,
      done: count >= target,
      bound: true
    };
  }

  function getTodayTopicProgress(group, eventsOverride) {
    var goals = getDailyTopicGoals();
    var goal = goals[group];
    var events = Array.isArray(eventsOverride)
      ? eventsOverride
      : readJSON(eventsKey(), []);

    return getTopicProgressFromEvents(goal, events, dayKey(Date.now()));
  }

  function renderDailyTopicGoals(eventsOverride, settingsOverride) {
    var settings = settingsOverride || currentSettings();
    var goals = settings.dailyTopicGoals;
    var events = Array.isArray(eventsOverride)
      ? eventsOverride
      : readJSON(eventsKey(), []);
    var today = dayKey(Date.now());

    var button = document.getElementById('dailyTopicGoalButton');
    var summaries = {};

    ['math', 'major'].forEach(function (group) {
      var goal = goals[group];
      var progress = getTopicProgressFromEvents(goal, events, today);
      var nameNode = document.getElementById(group === 'math' ? 'dailyTopicMathName' : 'dailyTopicMajorName');
      var progNode = document.getElementById(group === 'math' ? 'dailyTopicMathProgress' : 'dailyTopicMajorProgress');
      var rowNode = button ? button.querySelector('.daily-topic-row[data-topic-group="' + group + '"]') : null;

      var title = '';
      var progText = '';

      if (!goal || !goal.enabled || (!goal.title && !goal.chapterId)) {
        title = '未设置';
        progText = '';
        if (rowNode) {
          rowNode.classList.remove('daily-topic-complete', 'daily-topic-unbound');
        }
      } else {
        var chMeta = goal.chapterId ? findSubjectChapter(goal.subjectId, goal.chapterId) : null;
        var defaultName = chMeta && chMeta.chapter ? (chMeta.chapter.short || chMeta.chapter.name) : '';
        title = goal.title || defaultName || '专题';

        if (!progress.bound) {
          progText = '未绑定章节';
          if (rowNode) {
            rowNode.classList.remove('daily-topic-complete');
            rowNode.classList.add('daily-topic-unbound');
          }
        } else if (progress.done) {
          progText = '已突破 · ' + progress.count + ' / ' + progress.target;
          if (rowNode) {
            rowNode.classList.add('daily-topic-complete');
            rowNode.classList.remove('daily-topic-unbound');
          }
        } else {
          progText = progress.count + ' / ' + progress.target;
          if (rowNode) {
            rowNode.classList.remove('daily-topic-complete', 'daily-topic-unbound');
          }
        }
      }

      if (nameNode) nameNode.textContent = title;
      if (progNode) progNode.textContent = progText;

      summaries[group] = (group === 'math' ? '数学' : '专业课') + ' · ' + title + (progText ? ' · ' + progText : '');
    });

    if (button) {
      var ariaLabel = '今日专题：' + summaries.math + '，' + summaries.major + '。点击设置';
      button.setAttribute('aria-label', ariaLabel);
      button.title = '点击设置今日专题｜' + summaries.math + '｜' + summaries.major;
    }
  }

  function showTopicGoalToast(group, title) {
    var toast = document.getElementById('dailyTopicGoalToast') || document.getElementById('dailyGoalToast');
    if (!toast) return;

    var label = group === 'major' ? '专业课' : '数学';
    topicToastSequence += 1;
    var sequence = topicToastSequence;

    if (topicToastTimer) {
      clearTimeout(topicToastTimer);
      topicToastTimer = 0;
    }

    toast.textContent = '🎉 ' + label + '今日专题已突破：' + (title || '目标达成');
    toast.hidden = false;

    var raf = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 0); };
    raf(function () {
      if (sequence !== topicToastSequence) return;
      toast.classList.add('is-visible');
    });

    topicToastTimer = setTimeout(function () {
      if (sequence !== topicToastSequence) return;
      toast.classList.remove('is-visible');
      setTimeout(function () {
        if (sequence === topicToastSequence) {
          toast.hidden = true;
        }
      }, 200);
    }, 2400);
  }

  function maybeCelebrateDailyTopicGoal(group, beforeProg, afterProg, goal) {
    if (group !== 'math' && group !== 'major') return;
    if (!goal || !goal.enabled || !goal.chapterId) return;

    if (!beforeProg.done && afterProg.done && afterProg.bound) {
      var today = dayKey(Date.now());
      var fingerprint = String(goal.subjectId) + '|' + String(goal.chapterId) + '|' + String(goal.title) + '|' + String(goal.target);
      var settings = currentSettings();
      var lastCelebrated = settings.topicGoalCelebrations && settings.topicGoalCelebrations[group];

      if (lastCelebrated && lastCelebrated.date === today && lastCelebrated.fingerprint === fingerprint) {
        return;
      }

      showTopicGoalToast(group, goal.title || '专题目标');

      var celebrations = {
        math: settings.topicGoalCelebrations ? settings.topicGoalCelebrations.math : null,
        major: settings.topicGoalCelebrations ? settings.topicGoalCelebrations.major : null
      };
      celebrations[group] = {
        date: today,
        fingerprint: fingerprint
      };
      saveSettings({ topicGoalCelebrations: celebrations });
    }
  }

  var lastTopicTrigger = null;

  function populateTopicGroupUI(group, goal) {
    var subjectId = group === 'major' ? 'zhuanye' : 'shu1';
    var subject = findSubject(subjectId);
    var chapters = subject && Array.isArray(subject.chapters) ? subject.chapters : [];

    var prefix = group === 'major' ? 'dailyTopicMajor' : 'dailyTopicMath';
    var titleInput = document.getElementById(prefix + 'TitleInput');
    var bookSelect = document.getElementById(prefix + 'BookSelect');
    var chapterSelect = document.getElementById(prefix + 'ChapterSelect');
    var targetInput = document.getElementById(prefix + 'TargetInput');
    var startBtn = document.getElementById(prefix + 'StartBtn');

    if (!titleInput || !bookSelect || !chapterSelect || !targetInput) return;

    titleInput.value = goal.title || '';
    targetInput.value = String(goal.target || 10);

    var books = [];
    var seenBooks = new Set();
    if (subject && Array.isArray(subject.wbOrder)) {
      subject.wbOrder.forEach(function (w) {
        var name = typeof w === 'object' && w ? (w.wb || w.label) : String(w);
        if (name && !seenBooks.has(name)) {
          seenBooks.add(name);
          books.push({ id: name, label: (typeof w === 'object' && w.label) ? w.label : name });
        }
      });
    }
    chapters.forEach(function (ch) {
      var name = ch.wb || ch.statsWb || '';
      if (name && !seenBooks.has(name)) {
        seenBooks.add(name);
        books.push({ id: name, label: name });
      }
    });

    bookSelect.innerHTML = '<option value="">全部书籍 / 未指定</option>' +
      books.map(function (b) {
        return '<option value="' + escapeHtmlAttr(b.id) + '">' + escapeHtmlText(b.label) + '</option>';
      }).join('');

    var currentBook = goal.bookId || '';
    if (!currentBook && goal.chapterId) {
      var foundCh = chapters.find(function (ch) { return ch.id === goal.chapterId; });
      if (foundCh) currentBook = foundCh.wb || foundCh.statsWb || '';
    }
    bookSelect.value = currentBook;

    function refreshChapters(selectedBookId, selectedChapterId) {
      var filtered = chapters;
      if (selectedBookId) {
        filtered = chapters.filter(function (ch) {
          return (ch.wb || ch.statsWb || '') === selectedBookId;
        });
      }
      chapterSelect.innerHTML = '<option value="">未绑定章节</option>' +
        filtered.map(function (ch) {
          var label = ch.short || ch.name || ch.id;
          return '<option value="' + escapeHtmlAttr(ch.id) + '">' + escapeHtmlText(label) + '</option>';
        }).join('');
      chapterSelect.value = selectedChapterId || '';
      updateStartBtnVisibility();
    }

    function updateStartBtnVisibility() {
      if (startBtn) {
        startBtn.style.display = chapterSelect.value ? 'inline-flex' : 'none';
      }
    }

    refreshChapters(currentBook, goal.chapterId || '');

    bookSelect.onchange = function () {
      refreshChapters(bookSelect.value, chapterSelect.value);
    };
    chapterSelect.onchange = function () {
      var selChId = chapterSelect.value;
      if (selChId && !bookSelect.value) {
        var foundCh = chapters.find(function (ch) { return ch.id === selChId; });
        if (foundCh && (foundCh.wb || foundCh.statsWb)) {
          bookSelect.value = foundCh.wb || foundCh.statsWb;
          refreshChapters(bookSelect.value, selChId);
        }
      }
      updateStartBtnVisibility();
    };
  }

  function openDailyTopicGoalSettings(event) {
    var modal = document.getElementById('dailyTopicGoalModal');
    if (!modal) return;

    if (event && event.currentTarget) {
      lastTopicTrigger = event.currentTarget;
    } else {
      lastTopicTrigger = document.getElementById('dailyTopicGoalButton');
    }

    var goals = getDailyTopicGoals();
    populateTopicGroupUI('math', goals.math);
    populateTopicGroupUI('major', goals.major);

    modal.hidden = false;
    modal.style.display = 'flex';

    var mathTitle = document.getElementById('dailyTopicMathTitleInput');
    if (mathTitle) mathTitle.focus();
  }

  function closeDailyTopicGoalSettings() {
    var modal = document.getElementById('dailyTopicGoalModal');
    if (!modal) return;

    modal.hidden = true;
    modal.style.display = 'none';

    if (lastTopicTrigger && typeof lastTopicTrigger.focus === 'function') {
      try { lastTopicTrigger.focus(); } catch (e) {}
    }
  }

  function saveDailyTopicGoalSettings() {
    var mathTitle = document.getElementById('dailyTopicMathTitleInput');
    var mathBook = document.getElementById('dailyTopicMathBookSelect');
    var mathChapter = document.getElementById('dailyTopicMathChapterSelect');
    var mathTarget = document.getElementById('dailyTopicMathTargetInput');

    var majorTitle = document.getElementById('dailyTopicMajorTitleInput');
    var majorBook = document.getElementById('dailyTopicMajorBookSelect');
    var majorChapter = document.getElementById('dailyTopicMajorChapterSelect');
    var majorTarget = document.getElementById('dailyTopicMajorTargetInput');

    var mathTargetVal = readGoalInput(mathTarget, '数学专题');
    if (mathTargetVal == null) return false;
    if (mathTargetVal <= 0) mathTargetVal = 10;

    var majorTargetVal = readGoalInput(majorTarget, '专业课专题');
    if (majorTargetVal == null) return false;
    if (majorTargetVal <= 0) majorTargetVal = 10;

    var mathT = (mathTitle ? mathTitle.value : '').trim();
    var mathB = mathBook ? mathBook.value : '';
    var mathC = mathChapter ? mathChapter.value : '';

    var majorT = (majorTitle ? majorTitle.value : '').trim();
    var majorB = majorBook ? majorBook.value : '';
    var majorC = majorChapter ? majorChapter.value : '';

    var nextGoals = {
      math: {
        enabled: Boolean(mathT || mathC),
        title: mathT,
        subjectId: 'shu1',
        bookId: mathB,
        chapterId: mathC,
        target: mathTargetVal
      },
      major: {
        enabled: Boolean(majorT || majorC),
        title: majorT,
        subjectId: 'zhuanye',
        bookId: majorB,
        chapterId: majorC,
        target: majorTargetVal
      }
    };

    var saved = saveDailyTopicGoals(nextGoals);
    if (!saved) {
      window.alert('设置保存失败，请检查浏览器本地存储权限后重试。');
      return false;
    }

    closeDailyTopicGoalSettings();
    renderDailyTopicGoals();
    return true;
  }

  function clearMathTopic() {
    var mathTitle = document.getElementById('dailyTopicMathTitleInput');
    var mathBook = document.getElementById('dailyTopicMathBookSelect');
    var mathChapter = document.getElementById('dailyTopicMathChapterSelect');
    var mathTarget = document.getElementById('dailyTopicMathTargetInput');
    var mathStart = document.getElementById('dailyTopicMathStartBtn');

    if (mathTitle) mathTitle.value = '';
    if (mathBook) mathBook.value = '';
    if (mathChapter) {
      mathChapter.value = '';
      mathChapter.innerHTML = '<option value="">未绑定章节</option>';
    }
    if (mathTarget) mathTarget.value = '10';
    if (mathStart) mathStart.style.display = 'none';
  }

  function clearMajorTopic() {
    var majorTitle = document.getElementById('dailyTopicMajorTitleInput');
    var majorBook = document.getElementById('dailyTopicMajorBookSelect');
    var majorChapter = document.getElementById('dailyTopicMajorChapterSelect');
    var majorTarget = document.getElementById('dailyTopicMajorTargetInput');
    var majorStart = document.getElementById('dailyTopicMajorStartBtn');

    if (majorTitle) majorTitle.value = '';
    if (majorBook) majorBook.value = '';
    if (majorChapter) {
      majorChapter.value = '';
      majorChapter.innerHTML = '<option value="">未绑定章节</option>';
    }
    if (majorTarget) majorTarget.value = '10';
    if (majorStart) majorStart.style.display = 'none';
  }

  function openDailyTopicPractice(group) {
    var goals = getDailyTopicGoals();
    var goal = goals[group];
    if (!goal || !goal.chapterId) {
      window.alert('请先绑定章节后再开始突破。');
      return false;
    }
    var subjectId = goal.subjectId || (group === 'major' ? 'zhuanye' : 'shu1');
    var chapterId = goal.chapterId;
    closeDailyTopicGoalSettings();

    if (typeof window.openWeakChapter === 'function') {
      window.openWeakChapter(subjectId, chapterId);
      return true;
    }
    if (typeof window.switchSubject === 'function' && typeof window.switchChapter === 'function') {
      if (typeof window.getCurrentPracticeState === 'function') {
        var s = window.getCurrentPracticeState();
        if (s && s.curSubjectId !== subjectId) {
          window.switchSubject(subjectId);
        }
      } else if (window.curSubjectId !== subjectId) {
        window.switchSubject(subjectId);
      }
      if (typeof window.setWorkbenchView === 'function') {
        window.setWorkbenchView('practice');
      }
      window.switchChapter(chapterId);
      return true;
    }
    return false;
  }

  function handleBreakthrough(group) {
    if (saveDailyTopicGoalSettings()) {
      openDailyTopicPractice(group);
    }
  }

  function setWeakChapterAsDailyTopic(subjectId, bookId, chapterId, chapterName) {
    var group = (subjectId === 'zhuanye' || subjectId === 'major') ? 'major' : 'math';
    var goals = getDailyTopicGoals();
    var cur = goals[group] || {};

    goals[group] = {
      enabled: true,
      title: chapterName || cur.title || '专题突破',
      subjectId: subjectId || (group === 'major' ? 'zhuanye' : 'shu1'),
      bookId: bookId || cur.bookId || '',
      chapterId: chapterId || '',
      target: cur.target || 10
    };

    saveDailyTopicGoals(goals);
    renderDailyTopicGoals();
    openDailyTopicGoalSettings();
  }

  function openSettings(event) {
    var modal =
      document.getElementById('studySettingsModal');

    var dateInput =
      document.getElementById('siExamDateInput');

    var mathInput =
      document.getElementById('siMathDailyGoalInput');

    var majorInput =
      document.getElementById('siMajorDailyGoalInput');

    if (
      !modal ||
      !dateInput ||
      !mathInput ||
      !majorInput
    ) {
      return;
    }

    var settings = currentSettings();

    dateInput.value =
      settings.examDate || '';

    mathInput.value =
      String(settings.dailyGoals.math);

    majorInput.value =
      String(settings.dailyGoals.major);

    modal.hidden = false;
    modal.style.display = 'flex';

    var fromGoalButton =
      event &&
      event.currentTarget &&
      event.currentTarget.id === 'dailyGoalButton';

    if (fromGoalButton) {
      mathInput.focus();
    } else {
      dateInput.focus();
    }
  }

  function closeSettings() {
    var modal =
      document.getElementById('studySettingsModal');

    if (!modal) return;

    modal.hidden = true;
    modal.style.display = 'none';
  }

  function saveSettingsFromDialog() {
    var dateInput =
      document.getElementById('siExamDateInput');

    var mathInput =
      document.getElementById('siMathDailyGoalInput');

    var majorInput =
      document.getElementById('siMajorDailyGoalInput');

    if (
      !dateInput ||
      !mathInput ||
      !majorInput
    ) {
      return;
    }

    var examDate =
      String(dateInput.value || '').trim();

    if (
      examDate &&
      !parseLocalDate(examDate)
    ) {
      window.alert(
        '日期格式无效，请选择有效日期。'
      );
      dateInput.focus();
      return;
    }

    var mathGoal =
      readGoalInput(
        mathInput,
        '数学'
      );

    if (mathGoal == null) return;

    var majorGoal =
      readGoalInput(
        majorInput,
        '专业课'
      );

    if (majorGoal == null) return;

    var saved = saveSettings({
      examDate: examDate,
      dailyGoals: {
        math: mathGoal,
        major: majorGoal
      }
    });

    if (!saved) {
      window.alert(
        '设置保存失败，请检查浏览器本地存储权限后重试。'
      );
      return;
    }

    closeSettings();
    render();
  }

  function bind() {
    if (state.bound) return;
    state.bound = true;

    var examButton = document.getElementById('siExamDateBtn');
    var goalButton = document.getElementById('dailyGoalButton');
    var cancelButton = document.getElementById('siSettingsCancel');
    var saveButton = document.getElementById('siSettingsSave');
    var modal = document.getElementById('studySettingsModal');

    if (examButton) examButton.addEventListener('click', openSettings);
    if (goalButton) goalButton.addEventListener('click', openSettings);
    if (cancelButton) cancelButton.addEventListener('click', closeSettings);
    if (saveButton) saveButton.addEventListener('click', saveSettingsFromDialog);
    if (modal) modal.addEventListener('click', function (event) {
      if (event.target === modal) closeSettings();
    });

    // 每日专题设置弹窗交互
    var topicGoalButton = document.getElementById('dailyTopicGoalButton');
    var topicModal = document.getElementById('dailyTopicGoalModal');
    var topicCloseBtn = document.getElementById('dailyTopicGoalCloseBtn');
    var topicCancel = document.getElementById('dailyTopicGoalCancel');
    var topicSave = document.getElementById('dailyTopicGoalSave');
    var mathClearBtn = document.getElementById('dailyTopicMathClearBtn');
    var majorClearBtn = document.getElementById('dailyTopicMajorClearBtn');
    var mathStartBtn = document.getElementById('dailyTopicMathStartBtn');
    var majorStartBtn = document.getElementById('dailyTopicMajorStartBtn');

    if (topicGoalButton) topicGoalButton.addEventListener('click', openDailyTopicGoalSettings);
    if (topicCloseBtn) topicCloseBtn.addEventListener('click', closeDailyTopicGoalSettings);
    if (topicCancel) topicCancel.addEventListener('click', closeDailyTopicGoalSettings);
    if (topicSave) topicSave.addEventListener('click', saveDailyTopicGoalSettings);
    if (topicModal) topicModal.addEventListener('click', function (event) {
      if (event.target === topicModal) closeDailyTopicGoalSettings();
    });

    if (mathClearBtn) mathClearBtn.addEventListener('click', clearMathTopic);
    if (majorClearBtn) majorClearBtn.addEventListener('click', clearMajorTopic);
    if (mathStartBtn) mathStartBtn.addEventListener('click', function () { handleBreakthrough('math'); });
    if (majorStartBtn) majorStartBtn.addEventListener('click', function () { handleBreakthrough('major'); });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeSettings();
        closeDailyTopicGoalSettings();
      }
    });
    window.addEventListener('storage', function (event) {
      if (event.key === settingsKey() || event.key === eventsKey()) render();
    });
  }

  function scheduleMidnightRefresh() {
    if (state.midnightTimer) {
      clearTimeout(state.midnightTimer);
    }

    var now = new Date();

    var nextMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      1
    );

    state.midnightTimer = setTimeout(
      function () {
        renderDailyGoals();
        renderDailyTopicGoals();
        scheduleMidnightRefresh();
      },
      Math.max(
        1000,
        nextMidnight.getTime() - now.getTime()
      )
    );
  }

  function init() {
    bind();
    render();
    scheduleMidnightRefresh();
  }

  window.StudyAnalytics = {
    init: init,
    render: render,
    recordStatus: recordStatus,
    getStatusTotals: getStatusTotals,
    getSubjectTotals: getSubjectTotals,
    getTrendCounts: getTrendCounts,
    getDailyGoalCounts: getDailyGoalCounts,
    getStudyStreak: getStudyStreak,
    getDailyTopicGoals: getDailyTopicGoals,
    saveDailyTopicGoals: saveDailyTopicGoals,
    normalizeDailyTopicGoals: normalizeDailyTopicGoals,
    getTodayTopicProgress: getTodayTopicProgress,
    getTopicProgressFromEvents: getTopicProgressFromEvents,
    renderDailyTopicGoals: renderDailyTopicGoals,
    openDailyTopicGoalSettings: openDailyTopicGoalSettings,
    closeDailyTopicGoalSettings: closeDailyTopicGoalSettings,
    saveDailyTopicGoalSettings: saveDailyTopicGoalSettings,
    openDailyTopicPractice: openDailyTopicPractice,
    maybeCelebrateDailyTopicGoal: maybeCelebrateDailyTopicGoal,
    setWeakChapterAsDailyTopic: setWeakChapterAsDailyTopic
  };
  window.setWeakChapterAsDailyTopic = setWeakChapterAsDailyTopic;
  window.openDailyTopicPractice = openDailyTopicPractice;
  window.addEventListener('kaoyan:ready', render);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
