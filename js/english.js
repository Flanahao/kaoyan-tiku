(function () {
  'use strict';

  var panel = document.getElementById('englishPanel');
  var button = document.getElementById('btnEnglish');
  if (!panel || !button) return;

  var activeType = 'synonyms';
  var data = load();

  function uid() { return 'w_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function cleanText(value) { return String(value || '').trim(); }
  function storageKey() {
    return 'user_guest_kaoyan_english_vocabulary_v2';
  }
  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey()));
      if (saved && Array.isArray(saved.items)) return saved;
    } catch (e) {}
    var words = Array.isArray(window.ENGLISH_IMPORTED_WORDS) ? window.ENGLISH_IMPORTED_WORDS : [];
    var groups = [];
    for (var i = 0; i < words.length; i += 4) {
      var group = words.slice(i, i + 4).join(' · ');
      groups.push({ id: uid() + i, type: 'synonyms', text: words[i], group: group, status: '' });
    }
    return { items: groups };
  }
  function save() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(data));
    } catch (e) {
      console.warn('保存英语词汇失败:', e);
    }
  }
  function escapeHtml(value) {
    return cleanText(value).replace(/[&<>'"]/g, function (c) { return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[c]; });
  }
  function title(type) { return ({ mistakes:'易错词', meanings:'熟词生义', synonyms:'同义词 / 短语' })[type]; }
  function render() {
    var items = data.items.filter(function (item) { return item.type === activeType; });
    var counts = { familiar: 0, vague: 0, wrong: 0 };
    data.items.forEach(function (item) { if (counts[item.status] !== undefined) counts[item.status]++; });
    panel.innerHTML = '<div class="english-head"><div><h2>英语词汇</h2><div class="english-summary">熟悉 ' + counts.familiar + ' · 模糊 ' + counts.vague + ' · 不会 ' + counts.wrong + ' · 共 ' + data.items.length + '</div></div><button class="english-action" data-action="back">返回刷题</button></div>' +
      '<div class="english-tabs">' + ['mistakes','meanings','synonyms'].map(function (type) { return '<button class="english-tab ' + (type === activeType ? 'active' : '') + '" data-type="' + type + '">' + title(type) + '</button>'; }).join('') + '</div>' +
      '<form class="english-form" id="englishForm"><input id="englishInput" placeholder="' + (activeType === 'synonyms' ? '输入词汇；用 · 或逗号分隔可添加同义词组' : '输入一个词或短语') + '"/><button class="english-action" type="submit">添加到此模块</button></form>' +
      '<div class="english-list">' + (items.length ? items.map(card).join('') : '<div class="section-empty">这里还没有词汇，先添加一条吧。</div>') + '</div>';
  }
  function card(item) {
    var terms = (item.group || item.text).split(' · ').filter(Boolean);
    return '<article class="english-card"><div class="english-word">' + escapeHtml(item.text) + '</div><div class="english-terms">' + terms.map(function (term) { return '<span class="english-term">' + escapeHtml(term) + '</span>'; }).join('') + '</div>' +
      '<div class="english-group">' + (item.note ? escapeHtml(item.note) : (item.type === 'synonyms' ? '同义词 / 短语' : title(item.type))) + '</div>' +
      '<div class="english-controls">' + ['familiar','vague','wrong'].map(function (status) { return '<button class="english-status ' + status + (item.status === status ? ' active' : '') + '" data-status="' + status + '" data-id="' + item.id + '">' + ({ familiar:'熟悉', vague:'模糊', wrong:'不会' })[status] + '</button>'; }).join('') +
      '</div><div><button class="english-add-under" data-add-under="' + item.id + '">在这条词汇下添加</button><button class="english-delete" data-delete="' + item.id + '">删除这条词汇</button></div></article>';
  }
  function open() {
    if (typeof window.closeAllWorkbenchPanels === 'function') {
      window.closeAllWorkbenchPanels('english');
    }
    var content = document.getElementById('mainAreaContent');
    if (content) content.style.display = 'none';
    var layout = document.querySelector('.app-layout');
    if (layout) layout.classList.add('english-mode');
    panel.hidden = false;
    button.textContent = '返回刷题';
    render();
  }
  window.openEnglishVocabulary = open;

  function close() {
    panel.hidden = true;
    var layout = document.querySelector('.app-layout');
    if (layout) layout.classList.remove('english-mode');
    var content = document.getElementById('mainAreaContent');
    if (content) content.style.display = '';
    button.textContent = '英语词汇';
    if (typeof window.renderTitle === 'function') {
      window.renderTitle();
    }
  }
  window.closeEnglishVocabulary = close;
  button.addEventListener('click', function () { if (panel.hidden) open(); else close(); });
  panel.addEventListener('click', function (event) {
    var target = event.target.closest('button'); if (!target) return;
    if (target.dataset.action === 'back') return close();
    if (target.dataset.type) { activeType = target.dataset.type; return render(); }
    if (target.dataset.addUnder) {
      var extra = cleanText(window.prompt('添加到这条词汇下（用 · 或逗号分隔多个词）', ''));
      var parent = data.items.find(function (item) { return item.id === target.dataset.addUnder; });
      if (parent && extra) { parent.group = [parent.group || parent.text, extra.split(/[，,·、]/).map(cleanText).filter(Boolean).join(' · ')].filter(Boolean).join(' · '); save(); render(); }
      return;
    }
    if (target.dataset.delete) { data.items = data.items.filter(function (item) { return item.id !== target.dataset.delete; }); save(); return render(); }
    if (target.dataset.status) {
      var item = data.items.find(function (entry) { return entry.id === target.dataset.id; });
      if (item) { item.status = item.status === target.dataset.status ? '' : target.dataset.status; save(); render(); }
    }
  });
  panel.addEventListener('submit', function (event) {
    if (event.target.id !== 'englishForm') return;
    event.preventDefault(); var input = document.getElementById('englishInput'); var text = cleanText(input.value); if (!text) return;
    var group = activeType === 'synonyms' ? text.split(/[，,·、]/).map(cleanText).filter(Boolean).join(' · ') : '';
    data.items.unshift({ id: uid(), type: activeType, text: group || text, group: group, status: '' }); save(); render();
  });
})();
