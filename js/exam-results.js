/* 真题每套手填成绩；纯数据模块，页面与测试共用。 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.ExamResults = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  var SUFFIX = 'exam_results_v1';
  function isPaper(subjectId, chapter) {
    if (!chapter || !chapter.id) return false;
    if (subjectId === 'shu1') return chapter.wb === '历年真题' && /^s1_zt_\d{4}$/.test(chapter.id);
    return subjectId === 'zhuanye' && /(?:^|\/)\d{4}年真题(?:\/|$)/.test(chapter.relPath || '');
  }
  function key(prefix) { return String(prefix || '') + SUFFIX; }
  function read(storage, prefix) {
    try {
      var data = JSON.parse(storage.getItem(key(prefix)) || '{}');
      return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    } catch (e) { return {}; }
  }
  function identity(subjectId, chapterId) { return subjectId + ':' + chapterId; }
  function integerOrNull(value, max) {
    if (value === '' || value === null || value === undefined) return null;
    if (!/^\d+$/.test(String(value))) throw new Error('请输入非负整数');
    var n = Number(value);
    if (!Number.isSafeInteger(n) || n > max) throw new Error('数字超出允许范围');
    return n;
  }
  function normalize(input) {
    var hours = integerOrNull(input.hours, 23);
    var minutes = integerOrNull(input.minutes, 59);
    var score = integerOrNull(input.score, 150);
    var duration = hours === null && minutes === null ? null : (hours || 0) * 60 + (minutes || 0);
    if (duration === 0) throw new Error('用时须大于 0 分钟');
    return { minutes: duration, score: score };
  }
  function validRecord(item) {
    if (!item || typeof item !== 'object') return { minutes: null, score: null };
    return {
      minutes: Number.isSafeInteger(item.minutes) && item.minutes > 0 && item.minutes < 1440 ? item.minutes : null,
      score: Number.isSafeInteger(item.score) && item.score >= 0 && item.score <= 150 ? item.score : null
    };
  }
  function get(storage, prefix, subjectId, chapterId) {
    return validRecord(read(storage, prefix)[identity(subjectId, chapterId)]);
  }
  function save(storage, prefix, subjectId, chapter, input) {
    if (!isPaper(subjectId, chapter)) throw new Error('仅真题可记录');
    var record = normalize(input);
    var data = read(storage, prefix);
    var id = identity(subjectId, chapter.id);
    if (record.minutes === null && record.score === null) delete data[id];
    else data[id] = record;
    storage.setItem(key(prefix), JSON.stringify(data));
    return record;
  }
  function summary(storage, prefix, subjectId, chapters) {
    var data = read(storage, prefix);
    var timeSum = 0, timeCount = 0, scoreSum = 0, scoreCount = 0;
    (chapters || []).forEach(function (ch) {
      if (!isPaper(subjectId, ch)) return;
      var record = validRecord(data[identity(subjectId, ch.id)]);
      if (record.minutes !== null) { timeSum += record.minutes; timeCount++; }
      if (record.score !== null) { scoreSum += record.score; scoreCount++; }
    });
    return {
      timeCount: timeCount, scoreCount: scoreCount,
      averageMinutes: timeCount ? Math.round(timeSum / timeCount) : null,
      averageScore: scoreCount ? Math.round(scoreSum / scoreCount * 10) / 10 : null
    };
  }
  function formatMinutes(value) {
    return value === null ? '—' : Math.floor(value / 60) + 'h ' + value % 60 + 'min';
  }
  return { isPaper: isPaper, key: key, read: read, get: get, save: save, summary: summary, formatMinutes: formatMinutes };
});
