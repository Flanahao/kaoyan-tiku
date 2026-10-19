/* 肖1000题：每个选项独立的手写文字批注（不影响选择、批改或掌握度）。 */
(function (global) {
  'use strict';

  var OPTION_KEYS = ['A', 'B', 'C', 'D'];
  var MAX_LENGTH = 600;

  function cleanNotes(raw) {
    var result = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;
    OPTION_KEYS.forEach(function (key) {
      if (typeof raw[key] === 'string') {
        var text = raw[key].trim();
        if (text && text.length <= MAX_LENGTH) result[key] = text;
      }
    });
    return result;
  }

  function readNotes(key) {
    try {
      var source = global.localStorage.getItem(key);
      return cleanNotes(source ? JSON.parse(source) : null);
    } catch (error) {
      console.warn('[politics-choice-notes] 读取失败', error);
      return {};
    }
  }

  function writeNotes(key, notes) {
    try {
      var cleaned = cleanNotes(notes);
      if (Object.keys(cleaned).length) {
        global.localStorage.setItem(key, JSON.stringify(cleaned));
      } else {
        global.localStorage.removeItem(key);
      }
      return true;
    } catch (error) {
      console.warn('[politics-choice-notes] 保存失败', error);
      return false;
    }
  }

  function element(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  // 被 mount 的 card 是当前题的 #questionTextCard，key 必须由 app.js 按章节和题号生成。
  function mount(card, key) {
    if (!card || typeof key !== 'string' || !key.trim()) return false;
    var choices = card.querySelector('.q-choices');
    if (!choices || card.querySelector('.politics-choice-note-zone')) return false;

    var notes = readNotes(key);
    var mounted = 0;

    Array.from(choices.querySelectorAll('.q-choice-item')).forEach(function (item) {
      var letter = item.dataset.choice;
      if (OPTION_KEYS.indexOf(letter) === -1) return;
      mounted++;

      var zone = element('div', 'politics-choice-note-zone');
      zone.dataset.choiceNote = letter;

      // 原题库监听写在 .q-choice-item 上，批改监听写在 .q-choices 上。
      // 在该子区域拦截事件，编辑备注不会选择/取消选项，也不会清除判分。
      ['click', 'dblclick', 'pointerdown', 'mousedown', 'mouseup'].forEach(function (type) {
        zone.addEventListener(type, function (event) { event.stopPropagation(); });
      });
      zone.addEventListener('keydown', function (event) {
        // 吃掉全局 A/D/Z/X/C 等快捷键（原项目会修改题目/掌握度）。
        event.stopPropagation();
      });

      var addButton = element('button', 'politics-choice-note-add', '＋ 添加标注');
      addButton.type = 'button';
      addButton.setAttribute('aria-label', '为选项' + letter + '添加文字标注');

      var display = element('div', 'politics-choice-note-display');
      display.hidden = true;
      var noteText = element('div', 'politics-choice-note-text');
      noteText.setAttribute('aria-label', '选项' + letter + '的个人批注');
      var actions = element('div', 'politics-choice-note-actions');
      var editButton = element('button', 'politics-choice-note-edit', '编辑');
      editButton.type = 'button';
      var deleteButton = element('button', 'politics-choice-note-delete', '删除');
      deleteButton.type = 'button';
      actions.append(editButton, deleteButton);
      display.append(noteText, actions);

      var editor = element('div', 'politics-choice-note-editor');
      editor.hidden = true;
      var textarea = element('textarea', 'politics-choice-note-input');
      textarea.rows = 3;
      textarea.maxLength = MAX_LENGTH;
      textarea.placeholder = '在这里写下对选项' + letter + '的理解或纠错…';
      textarea.setAttribute('aria-label', '选项' + letter + '的文字批注');
      var editorActions = element('div', 'politics-choice-note-editor-actions');
      var saveButton = element('button', 'politics-choice-note-save', '保存');
      saveButton.type = 'button';
      var cancelButton = element('button', 'politics-choice-note-cancel', '取消');
      cancelButton.type = 'button';
      editorActions.append(saveButton, cancelButton);
      var hint = element('div', 'politics-choice-note-hint', 'Ctrl / ⌘ + Enter 保存，Esc 取消');
      var error = element('div', 'politics-choice-note-error');
      error.setAttribute('role', 'alert');
      editor.append(textarea, editorActions, hint, error);

      zone.append(addButton, display, editor);
      item.appendChild(zone);

      function refresh() {
        var value = notes[letter] || '';
        var hasText = Boolean(value);
        addButton.hidden = hasText;
        display.hidden = !hasText;
        // 绝不拼接 innerHTML：用户输入中有 HTML 也只显示为纯文字。
        noteText.textContent = value;
      }

      function openEditor() {
        addButton.hidden = true;
        display.hidden = true;
        editor.hidden = false;
        error.textContent = '';
        textarea.value = notes[letter] || '';
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }

      function closeEditor() {
        editor.hidden = true;
        error.textContent = '';
        refresh();
      }

      function save() {
        var value = textarea.value.trim();
        if (!value) {
          error.textContent = '标注不能为空；需要删除请使用“删除”按钮。';
          return;
        }
        if (value.length > MAX_LENGTH) {
          error.textContent = '标注不能超过 ' + MAX_LENGTH + ' 字。';
          return;
        }
        var next = Object.assign({}, notes);
        next[letter] = value;
        if (!writeNotes(key, next)) {
          error.textContent = '保存失败，请检查浏览器存储空间或隐私模式。';
          return;
        }
        notes = next;
        closeEditor();
      }

      function remove() {
        // 删除前需要用户主动点击；不因为点错选项或提交批改而清空。
        if (!global.confirm('确定删除选项' + letter + '的文字标注吗？')) return;
        var next = Object.assign({}, notes);
        delete next[letter];
        if (!writeNotes(key, next)) {
          global.alert('删除失败：浏览器存储不可用。');
          return;
        }
        notes = next;
        closeEditor();
      }

      addButton.addEventListener('click', openEditor);
      editButton.addEventListener('click', openEditor);
      saveButton.addEventListener('click', save);
      cancelButton.addEventListener('click', closeEditor);
      deleteButton.addEventListener('click', remove);

      editor.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeEditor();
        } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          save();
        }
      });

      refresh();
    });

    return mounted > 0;
  }

  var api = {
    mount: mount,
    cleanNotes: cleanNotes,
    readNotes: readNotes,
    writeNotes: writeNotes,
    MAX_LENGTH: MAX_LENGTH
  };
  global.PoliticsChoiceNotes = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
