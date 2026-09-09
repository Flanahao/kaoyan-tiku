(function () {
  'use strict';

  var panel = document.getElementById('englishPanel');
  var button = document.getElementById('btnEnglish');
  if (!panel || !button) return;

  var activeType = 'synonyms';
  var activeStatusFilter = 'all'; // 'all', 'unmarked', 'familiar', 'vague', 'wrong'
  var searchQuery = '';
  var hideChinese = false; // 默认显示汉语释义
  var data = load();

  function uid() {
    return 'w_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function cleanText(value) {
    return String(value || '').trim();
  }
  function storageKey() {
    return 'user_guest_kaoyan_english_vocabulary_v2';
  }

  function getImportedEntries() {
    return Array.isArray(window.ENGLISH_IMPORTED_ENTRIES) ? window.ENGLISH_IMPORTED_ENTRIES : [];
  }

  function buildDefaultItems() {
    var entries = getImportedEntries();
    if (entries.length > 0) {
      return entries.map(function (entry, idx) {
        var terms = (entry.group || entry.primary || entry.text || '').split(' · ');
        return {
          id: 'eng_' + (idx + 1) + '_' + Date.now().toString(36),
          type: 'synonyms',
          text: entry.primary || terms[0] || '',
          group: entry.group || entry.primary || '',
          meaning: entry.meaning || '',
          category: entry.category || '',
          words: entry.words || [],
          status: ''
        };
      });
    }
    // 降级：仅当未加载 ENGLISH_IMPORTED_ENTRIES 时使用旧数组
    var words = Array.isArray(window.ENGLISH_IMPORTED_WORDS) ? window.ENGLISH_IMPORTED_WORDS : [];
    var fallback = [];
    for (var i = 0; i < words.length; i += 4) {
      var group = words.slice(i, i + 4).join(' · ');
      fallback.push({ id: uid() + i, type: 'synonyms', text: words[i], group: group, meaning: '', status: '' });
    }
    return fallback;
  }

  function load() {
    var rawSaved = null;
    var saved = null;
    try {
      rawSaved = localStorage.getItem(storageKey());
      if (rawSaved) saved = JSON.parse(rawSaved);
    } catch (e) {}

    // 判断已有本地存储是否已经包含有效汉语释义
    var hasValidMeanings = saved && Array.isArray(saved.items) && saved.items.length > 0 &&
      saved.items.some(function (item) { return Boolean(item.meaning && item.meaning.trim()); });

    // 若本地已有带汉语释义的数据，直接使用
    if (hasValidMeanings) {
      return saved;
    }

    // 否则（首次加载或从无汉语释义的旧缓存升级）：重新从权威词典构建，并继承用户的标记状态
    var defaults = buildDefaultItems();

    if (saved && Array.isArray(saved.items) && saved.items.length > 0) {
      var statusMap = {};
      saved.items.forEach(function (it) {
        if (it.status) {
          if (it.text) statusMap[it.text.toLowerCase().trim()] = it.status;
          var terms = (it.group || '').split(' · ');
          terms.forEach(function (t) {
            var ct = t.toLowerCase().trim();
            if (ct) statusMap[ct] = it.status;
          });
        }
      });

      defaults.forEach(function (item) {
        var terms = (item.group || item.text || '').split(' · ');
        for (var i = 0; i < terms.length; i++) {
          var t = terms[i].toLowerCase().trim();
          if (statusMap[t]) {
            item.status = statusMap[t];
            break;
          }
        }
      });

      // 保留用户自行添加的其它分类词汇或自定义词汇
      saved.items.forEach(function (it) {
        if (it.type !== 'synonyms' || it.custom) {
          defaults.push(it);
        }
      });
    }

    var result = { items: defaults };
    save(result);
    return result;
  }

  function save(customData) {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(customData || data));
    } catch (e) {
      console.warn('保存英语词汇失败:', e);
    }
  }

  function syncWithImportedDictionary() {
    if (!window.confirm('确认重新从词库同步汉语释义？（将按最新同义词库更新全部汉语释义，并完整保留您已标记的熟悉/模糊/不会状态）')) {
      return;
    }
    var defaults = buildDefaultItems();
    var statusMap = {};
    if (data && Array.isArray(data.items)) {
      data.items.forEach(function (it) {
        if (it.status) {
          if (it.text) statusMap[it.text.toLowerCase().trim()] = it.status;
          var terms = (it.group || '').split(' · ');
          terms.forEach(function (t) {
            var ct = t.toLowerCase().trim();
            if (ct) statusMap[ct] = it.status;
          });
        }
      });
    }
    defaults.forEach(function (item) {
      var terms = (item.group || item.text || '').split(' · ');
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i].toLowerCase().trim();
        if (statusMap[t]) {
          item.status = statusMap[t];
          break;
        }
      }
    });
    // 保留自定义卡片
    if (data && Array.isArray(data.items)) {
      data.items.forEach(function (it) {
        if (it.type !== 'synonyms' || it.custom) {
          defaults.push(it);
        }
      });
    }
    data.items = defaults;
    save();
    render();
  }

  function escapeHtml(value) {
    return cleanText(value).replace(/[&<>'"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c];
    });
  }

  function title(type) {
    return ({ mistakes: '易错词', meanings: '熟词生义', synonyms: '同义词 / 短语' })[type] || type;
  }

  function card(item) {
    var terms = (item.group || item.text).split(' · ').filter(Boolean);
    var categoryBadge = item.category ? '<span class="english-badge">' + escapeHtml(item.category) + '</span>' : '';
    var meaningText = item.meaning ? escapeHtml(item.meaning) : '（暂无释义，点击修改释义添加）';

    return '<article class="english-card" data-card-id="' + item.id + '">' +
      '<div class="english-card-top">' +
        '<div class="english-terms">' +
          terms.map(function (term) {
            return '<span class="english-term">' + escapeHtml(term) + '</span>';
          }).join('') +
        '</div>' +
        categoryBadge +
      '</div>' +
      '<div class="english-meaning" data-meaning-id="' + item.id + '" title="自测模式下点击可切换此条释义显隐">' + meaningText + '</div>' +
      '<div class="english-card-footer">' +
        '<div class="english-controls">' +
          ['familiar', 'vague', 'wrong'].map(function (status) {
            var labels = { familiar: '熟悉', vague: '模糊', wrong: '不会' };
            return '<button class="english-status ' + status + (item.status === status ? ' active' : '') + '" data-status="' + status + '" data-id="' + item.id + '">' + labels[status] + '</button>';
          }).join('') +
        '</div>' +
        '<div class="english-actions-minor">' +
          '<button class="english-add-under" data-add-under="' + item.id + '" title="添加同义词或补充词汇">添加词</button>' +
          '<button class="english-edit-meaning" data-edit-meaning="' + item.id + '" title="修改或补充汉语释义">改释义</button>' +
          '<button class="english-delete" data-delete="' + item.id + '" title="删除此条词汇">删除</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function render() {
    var query = cleanText(searchQuery).toLowerCase();
    var items = data.items.filter(function (item) {
      if (item.type !== activeType) return false;
      if (activeStatusFilter === 'unmarked' && item.status) return false;
      if (activeStatusFilter === 'familiar' && item.status !== 'familiar') return false;
      if (activeStatusFilter === 'vague' && item.status !== 'vague') return false;
      if (activeStatusFilter === 'wrong' && item.status !== 'wrong') return false;
      if (query) {
        var inText = (item.text || '').toLowerCase().indexOf(query) !== -1;
        var inGroup = (item.group || '').toLowerCase().indexOf(query) !== -1;
        var inMeaning = (item.meaning || '').toLowerCase().indexOf(query) !== -1;
        var inCat = (item.category || '').toLowerCase().indexOf(query) !== -1;
        if (!inText && !inGroup && !inMeaning && !inCat) return false;
      }
      return true;
    });

    var counts = { familiar: 0, vague: 0, wrong: 0, unmarked: 0 };
    var totalWords = 0;
    data.items.forEach(function (item) {
      if (counts[item.status] !== undefined) counts[item.status]++;
      else counts.unmarked++;
      totalWords += (item.group || item.text).split(' · ').filter(Boolean).length;
    });

    panel.innerHTML =
      '<div class="english-head">' +
        '<div class="english-title-box">' +
          '<h2>考研英语词汇</h2>' +
          '<div class="english-summary">' +
            '<span>熟悉 <strong class="eng-stat-num stat-fam">' + counts.familiar + '</strong></span> · ' +
            '<span>模糊 <strong class="eng-stat-num stat-vag">' + counts.vague + '</strong></span> · ' +
            '<span>不会 <strong class="eng-stat-num stat-wro">' + counts.wrong + '</strong></span> · ' +
            '<span>未做 <strong>' + counts.unmarked + '</strong></span> · ' +
            '<span>共 <strong>' + data.items.length + '</strong> 组 (' + totalWords + ' 词)</span>' +
          '</div>' +
        '</div>' +
        '<div class="english-head-actions">' +
          '<button class="english-action english-toggle-cn ' + (hideChinese ? 'active' : '') + '" id="btnToggleChinese" type="button" title="切换显示/遮盖汉语释义用于背词自测">' +
            (hideChinese ? '👁️ 显示汉语' : '🙈 隐藏汉语') +
          '</button>' +
          '<button class="english-action" data-action="sync" type="button" title="重新从题库词典同步释义并保留学习状态">同步汉语释义</button>' +
          '<button class="english-action english-back-btn" data-action="back" type="button">返回刷题</button>' +
        '</div>' +
      '</div>' +
      '<div class="english-toolbar">' +
        '<div class="english-tabs">' +
          ['synonyms', 'meanings', 'mistakes'].map(function (type) {
            return '<button class="english-tab ' + (type === activeType ? 'active' : '') + '" data-type="' + type + '">' + title(type) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="english-search-wrapper">' +
          '<input id="englishSearch" class="english-search-input" type="search" placeholder="🔍 快速搜索英文词汇或中文释义（如：Doctrine、避开、缺点）..." value="' + escapeHtml(searchQuery) + '" />' +
        '</div>' +
      '</div>' +
      '<div class="english-filter-chips">' +
        [
          { key: 'all', label: '全部' },
          { key: 'unmarked', label: '未做' },
          { key: 'familiar', label: '熟悉' },
          { key: 'vague', label: '模糊' },
          { key: 'wrong', label: '不会' }
        ].map(function (chip) {
          return '<button class="english-chip ' + (activeStatusFilter === chip.key ? 'active' : '') + '" data-filter="' + chip.key + '">' + chip.label + '</button>';
        }).join('') +
      '</div>' +
      '<form class="english-form" id="englishForm">' +
        '<input id="englishInput" placeholder="' + (activeType === 'synonyms' ? '添加新词；可用 · 分隔同义词，附带释义例如：Doctrine · Dogma 信条' : '输入一个词或短语及汉语释义') + '"/>' +
        '<button class="english-action" type="submit">添加到此模块</button>' +
      '</form>' +
      '<div class="english-list ' + (hideChinese ? 'hide-meaning' : '') + '">' +
        (items.length ? items.map(card).join('') : '<div class="section-empty">未找到匹配的词汇条目。</div>') +
      '</div>';

    // 绑定搜索输入框焦点与事件
    var searchInput = document.getElementById('englishSearch');
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        searchQuery = e.target.value;
        renderListOnly();
      });
    }
  }

  function renderListOnly() {
    var query = cleanText(searchQuery).toLowerCase();
    var items = data.items.filter(function (item) {
      if (item.type !== activeType) return false;
      if (activeStatusFilter === 'unmarked' && item.status) return false;
      if (activeStatusFilter === 'familiar' && item.status !== 'familiar') return false;
      if (activeStatusFilter === 'vague' && item.status !== 'vague') return false;
      if (activeStatusFilter === 'wrong' && item.status !== 'wrong') return false;
      if (query) {
        var inText = (item.text || '').toLowerCase().indexOf(query) !== -1;
        var inGroup = (item.group || '').toLowerCase().indexOf(query) !== -1;
        var inMeaning = (item.meaning || '').toLowerCase().indexOf(query) !== -1;
        var inCat = (item.category || '').toLowerCase().indexOf(query) !== -1;
        if (!inText && !inGroup && !inMeaning && !inCat) return false;
      }
      return true;
    });

    var listEl = panel.querySelector('.english-list');
    if (listEl) {
      listEl.innerHTML = items.length ? items.map(card).join('') : '<div class="section-empty">未找到匹配的词汇条目。</div>';
    }
  }

  function setBtnNavText(btnId, text) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    var navText = btn.querySelector('.nav-text');
    if (navText) {
      navText.textContent = text;
    }
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
    setBtnNavText('btnEnglish', '返回刷题');
    render();
  }
  window.openEnglishVocabulary = open;

  function close() {
    panel.hidden = true;
    var layout = document.querySelector('.app-layout');
    if (layout) layout.classList.remove('english-mode');
    var content = document.getElementById('mainAreaContent');
    if (content) content.style.display = '';
    setBtnNavText('btnEnglish', '英语词汇');
    if (typeof window.renderTitle === 'function') {
      window.renderTitle();
    }
  }
  window.closeEnglishVocabulary = close;

  button.addEventListener('click', function () {
    if (panel.hidden) open();
    else close();
  });

  panel.addEventListener('click', function (event) {
    var target = event.target.closest('button');
    
    // 点击单条卡片的汉语释义（自测模糊模式下点击临时揭晓）
    if (!target) {
      var meaningEl = event.target.closest('.english-meaning');
      if (meaningEl) {
        meaningEl.classList.toggle('revealed');
      }
      return;
    }

    if (target.dataset.action === 'back') return close();
    if (target.dataset.action === 'sync') return syncWithImportedDictionary();

    if (target.id === 'btnToggleChinese') {
      hideChinese = !hideChinese;
      var listEl = panel.querySelector('.english-list');
      if (listEl) listEl.classList.toggle('hide-meaning', hideChinese);
      target.classList.toggle('active', hideChinese);
      target.textContent = hideChinese ? '👁️ 显示汉语' : '🙈 隐藏汉语';
      return;
    }

    if (target.dataset.type) {
      activeType = target.dataset.type;
      return render();
    }

    if (target.dataset.filter) {
      activeStatusFilter = target.dataset.filter;
      panel.querySelectorAll('.english-chip').forEach(function (chip) {
        chip.classList.toggle('active', chip.dataset.filter === activeStatusFilter);
      });
      return renderListOnly();
    }

    if (target.dataset.addUnder) {
      var extra = cleanText(window.prompt('添加到这条词汇下（用 · 或逗号分隔多个词，例如：term1, term2）', ''));
      var parent = data.items.find(function (item) { return item.id === target.dataset.addUnder; });
      if (parent && extra) {
        parent.group = [parent.group || parent.text, extra.split(/[，,·、]/).map(cleanText).filter(Boolean).join(' · ')].filter(Boolean).join(' · ');
        save();
        render();
      }
      return;
    }

    if (target.dataset.editMeaning) {
      var targetItem = data.items.find(function (item) { return item.id === target.dataset.editMeaning; });
      if (targetItem) {
        var newMeaning = window.prompt('编辑汉语释义：', targetItem.meaning || '');
        if (newMeaning !== null) {
          targetItem.meaning = cleanText(newMeaning);
          save();
          render();
        }
      }
      return;
    }

    if (target.dataset.delete) {
      if (window.confirm('确认删除这条词汇？')) {
        data.items = data.items.filter(function (item) { return item.id !== target.dataset.delete; });
        save();
        render();
      }
      return;
    }

    if (target.dataset.status) {
      var stItem = data.items.find(function (entry) { return entry.id === target.dataset.id; });
      if (stItem) {
        stItem.status = stItem.status === target.dataset.status ? '' : target.dataset.status;
        save();
        render();
      }
    }
  });

  panel.addEventListener('submit', function (event) {
    if (event.target.id !== 'englishForm') return;
    event.preventDefault();
    var input = document.getElementById('englishInput');
    var rawText = cleanText(input.value);
    if (!rawText) return;

    // 分离英文与可能的中文释义（例如：Doctrine · Dogma 信条）
    var m = rawText.match(/^([a-zA-Z\s\-'’\./,，·、]+?)([一-龥（\(\[].*)$/);
    var engPart = rawText;
    var cnPart = '';
    if (m) {
      engPart = m[1].trim();
      cnPart = m[2].trim();
    }

    var terms = engPart.split(/[，,·、]/).map(cleanText).filter(Boolean);
    var group = terms.join(' · ');
    var primary = terms[0] || rawText;

    data.items.unshift({
      id: uid(),
      type: activeType,
      text: primary,
      group: group,
      meaning: cnPart,
      category: '自定义',
      status: '',
      custom: true
    });
    save();
    input.value = '';
    render();
  });
})();
