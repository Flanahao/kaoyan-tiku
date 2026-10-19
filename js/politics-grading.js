/* 肖1000题：仅负责选项批改，不读写掌握度、SM-2 或学习记录。 */
(function (root) {
  'use strict';

  function normalizeAnswer(value) {
    if (value == null) return '';
    var raw = (Array.isArray(value) ? value.join('') : String(value))
      .trim()
      .toUpperCase()
      .replace(/^(?:(?:参考|正确|标准)答案|答案)\s*[:：]?\s*/u, '');

    // 遇到 E-Z 等非 A-D 选项字母时拒绝猜测标准答案。
    if (/[E-Z]/.test(raw)) return '';
    var letters = raw.match(/[A-D]/g) || [];
    return Array.from(new Set(letters)).sort().join('');
  }

  function gradeAnswer(selected, answer) {
    var chosen = normalizeAnswer(selected);
    var correct = normalizeAnswer(answer);

    if (!chosen) return { status: 'unanswered', selected: chosen, correct: correct };
    if (!correct) return { status: 'unavailable', selected: chosen, correct: correct };

    return {
      status: chosen === correct ? 'correct' : 'incorrect',
      selected: chosen,
      correct: correct
    };
  }

  function mount(card, question) {
    if (!card || !question) return false;
    var choices = card.querySelector('.q-choices');
    if (!choices || card.querySelector('.politics-grade-actions')) return false;

    var actions = document.createElement('div');
    actions.className = 'politics-grade-actions';

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'politics-grade-submit';
    button.textContent = '提交批改';

    var result = document.createElement('span');
    result.className = 'politics-grade-result';
    result.setAttribute('role', 'status');
    result.setAttribute('aria-live', 'polite');

    actions.appendChild(button);
    actions.appendChild(result);
    card.appendChild(actions);

    function clearResult() {
      result.textContent = '';
      result.removeAttribute('data-status');
      choices.querySelectorAll('.q-choice-item').forEach(function (item) {
        item.classList.remove('politics-grade-correct-choice', 'politics-grade-wrong-choice');
      });
    }

    // 原项目的点击监听先修改 is-selected；此冒泡监听只清除旧判分。
    choices.addEventListener('click', function (event) {
      var target = event.target && event.target.closest
        ? event.target.closest('.q-choice-item')
        : null;
      if (target && choices.contains(target)) clearResult();
    });

    button.addEventListener('click', function () {
      var selected = Array.from(
        choices.querySelectorAll('.q-choice-item.is-selected'),
        function (item) { return item.dataset.choice; }
      );

      var grading = gradeAnswer(selected, question.answer);
      result.dataset.status = grading.status;

      if (grading.status === 'unanswered') {
        result.textContent = '请先选择选项，再提交批改。';
        return;
      }
      if (grading.status === 'unavailable') {
        result.textContent = '本题暂无可识别的标准答案，暂时无法批改。';
        return;
      }

      result.textContent = grading.status === 'correct'
        ? '✅ 回答正确'
        : '❌ 回答错误，正确答案：' + grading.correct.split('').join('、');

      choices.querySelectorAll('.q-choice-item').forEach(function (item) {
        var key = item.dataset.choice;
        item.classList.toggle(
          'politics-grade-correct-choice',
          grading.correct.includes(key)
        );
        item.classList.toggle(
          'politics-grade-wrong-choice',
          grading.status === 'incorrect' &&
            grading.selected.includes(key) &&
            !grading.correct.includes(key)
        );
      });

      // 刻意不调用 setStatus / saveStatuses / navNext，不触碰笔记或复习排程。
    });

    return true;
  }

  var api = {
    normalizeAnswer: normalizeAnswer,
    gradeAnswer: gradeAnswer,
    mount: mount
  };
  root.PoliticsGrading = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
