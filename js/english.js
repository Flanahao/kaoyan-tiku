(function () {
  'use strict';

  var panel = document.getElementById('englishPanel');
  var button = document.getElementById('btnEnglish');
  if (!panel) return;

  // 主模块 Tab: 'zhenti' (历年真题) | 'vocab' (核心词汇)
  var STORAGE_MAIN_TAB_KEY = 'user_guest_kaoyan_english_main_tab_v1';
  var activeMainTab = localStorage.getItem(STORAGE_MAIN_TAB_KEY) || 'zhenti';

  // =========================================================================
  // 1. 历年真题 (Zhenti) 状态与持久化
  // =========================================================================
  var STORAGE_ZHENTI_YEAR_KEY = 'user_guest_kaoyan_english_zhenti_year_v1';
  var STORAGE_ZHENTI_SEC_KEY = 'user_guest_kaoyan_english_zhenti_sec_v1';
  var STORAGE_ZHENTI_BILINGUAL_KEY = 'user_guest_kaoyan_english_bilingual_v1';
  var STORAGE_ZHENTI_STATUS_KEY = 'user_guest_kaoyan_english_zhenti_status_v1';
  var STORAGE_ZHENTI_ANSWERS_KEY = 'user_guest_kaoyan_english_user_answers_v1';
  var STORAGE_ZHENTI_NOTES_KEY = 'user_guest_kaoyan_english_notes_v1';
  var STORAGE_ZHENTI_DRAFTS_KEY = 'user_guest_kaoyan_english_drafts_v1';

  var curYear = localStorage.getItem(STORAGE_ZHENTI_YEAR_KEY) || '2026';
  var curSectionId = null;
  var savedSecId = localStorage.getItem(STORAGE_ZHENTI_SEC_KEY);
  if (savedSecId) curSectionId = parseInt(savedSecId, 10);

  var bilingualMode = localStorage.getItem(STORAGE_ZHENTI_BILINGUAL_KEY) === 'true';
  var expandedExplanations = {};
  var activeQuestionId = null;
  var editingNotes = {}; // { [qid]: boolean }

  var zhentiStatuses = loadStorageJson(STORAGE_ZHENTI_STATUS_KEY, {});
  var zhentiUserAnswers = loadStorageJson(STORAGE_ZHENTI_ANSWERS_KEY, {});
  var zhentiNotes = loadStorageJson(STORAGE_ZHENTI_NOTES_KEY, {});
  var zhentiDrafts = loadStorageJson(STORAGE_ZHENTI_DRAFTS_KEY, {});

  function loadStorageJson(key, defaultVal) {
    try {
      var raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return defaultVal;
  }

  function saveStorageJson(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  function getManifest() {
    return Array.isArray(window.ENGLISH_ZHENTI_MANIFEST) ? window.ENGLISH_ZHENTI_MANIFEST : [];
  }

  function getPapers() {
    return window.ENGLISH_ZHENTI_PAPERS || {};
  }

  function getCurrentYearData() {
    var papers = getPapers();
    return papers[curYear] || null;
  }

  function getCurrentSection() {
    var yearData = getCurrentYearData();
    if (!yearData || !Array.isArray(yearData.sections) || yearData.sections.length === 0) return null;
    if (curSectionId != null) {
      var found = yearData.sections.find(function (s) { return s.id === curSectionId; });
      if (found) return found;
    }
    curSectionId = yearData.sections[0].id;
    return yearData.sections[0];
  }

  // =========================================================================
  // 2. 词汇模块 (Vocabulary) 状态与持久化（原功能完整保留）
  // =========================================================================
  var activeType = 'synonyms';
  var activeStatusFilter = 'all';
  var searchQuery = '';
  var hideChinese = false;
  var vocabData = loadVocabData();

  // =========================================================================
  // 2.2 真题生词本 (Zhenti Vocab) 独立状态与持久化
  // =========================================================================
  var STORAGE_ZHENTI_VOCAB_KEY = 'user_guest_kaoyan_english_zhenti_vocab_v1';
  var zhentiVocabData = loadZhentiVocabData();
  var zhentiVocabYearFilter = 'all';
  var zhentiVocabStatusFilter = 'all';
  var zhentiVocabSearchQuery = '';
  var zhentiVocabHideChinese = false;
  var revealedVocabIds = {};

  function loadZhentiVocabData() {
    var raw = loadStorageJson(STORAGE_ZHENTI_VOCAB_KEY, { items: [] });
    if (!raw || !Array.isArray(raw.items)) return { items: [] };
    return raw;
  }

  function saveZhentiVocabData() {
    saveStorageJson(STORAGE_ZHENTI_VOCAB_KEY, zhentiVocabData);
  }

  function isWordInZhentiVocab(word) {
    var target = (word || '').toLowerCase().trim();
    if (!target || !zhentiVocabData || !Array.isArray(zhentiVocabData.items)) return false;
    return zhentiVocabData.items.some(function (it) {
      return (it.word || it.text || '').toLowerCase().trim() === target;
    });
  }

  function addWordToZhentiVocab(word, meaning, phonetic, sentence, year, section) {
    var clean = (word || '').trim();
    if (!clean) return;
    if (isWordInZhentiVocab(clean)) {
      showToast('该单词已经在【真题生词本】中了！');
      return;
    }
    var cleanMeaning = (meaning || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '（待补充释义）';
    var sourceTitle = (year ? year + '年 ' : '') + (section ? (section.displayTitle || section.sectionName || '') : '');
    var newItem = {
      id: uid(),
      word: clean,
      meaning: cleanMeaning,
      phonetic: phonetic || '',
      year: year || curYear || '',
      sectionId: section ? section.id : (curSectionId || null),
      sourceTitle: sourceTitle.trim(),
      sentence: sentence || '',
      status: 'wrong',
      createdAt: Date.now()
    };
    zhentiVocabData.items.unshift(newItem);
    saveZhentiVocabData();
    showToast('🎉 已将 "' + clean + '" 加入【真题生词本】！');
  }

  function uid() {
    return 'w_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function cleanText(value) {
    return String(value || '').trim();
  }
  function vocabStorageKey() {
    return 'user_guest_kaoyan_english_vocabulary_v2';
  }

  function getImportedEntries() {
    return Array.isArray(window.ENGLISH_IMPORTED_ENTRIES) ? window.ENGLISH_IMPORTED_ENTRIES : [];
  }

  function buildDefaultVocabItems() {
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
    var words = Array.isArray(window.ENGLISH_IMPORTED_WORDS) ? window.ENGLISH_IMPORTED_WORDS : [];
    var fallback = [];
    for (var i = 0; i < words.length; i += 4) {
      var group = words.slice(i, i + 4).join(' · ');
      fallback.push({ id: uid() + i, type: 'synonyms', text: words[i], group: group, meaning: '', status: '' });
    }
    return fallback;
  }

  function loadVocabData() {
    var rawSaved = null;
    var saved = null;
    try {
      rawSaved = localStorage.getItem(vocabStorageKey());
      if (rawSaved) saved = JSON.parse(rawSaved);
    } catch (e) {}

    var hasValidMeanings = saved && Array.isArray(saved.items) && saved.items.length > 0 &&
      saved.items.some(function (item) { return Boolean(item.meaning && item.meaning.trim()); });

    if (hasValidMeanings) {
      return saved;
    }

    var defaults = buildDefaultVocabItems();
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

      saved.items.forEach(function (it) {
        if (it.type !== 'synonyms' || it.custom) {
          defaults.push(it);
        }
      });
    }

    var result = { items: defaults };
    saveVocabData(result);
    return result;
  }

  function saveVocabData(customData) {
    try {
      localStorage.setItem(vocabStorageKey(), JSON.stringify(customData || vocabData));
    } catch (e) {
      console.warn('保存英语词汇失败:', e);
    }
  }

  function syncWithImportedDictionary() {
    if (!window.confirm('确认重新从词库同步汉语释义？（将按最新同义词库更新全部汉语释义，并完整保留您已标记的熟悉/模糊/不会状态）')) {
      return;
    }
    var defaults = buildDefaultVocabItems();
    var statusMap = {};
    if (vocabData && Array.isArray(vocabData.items)) {
      vocabData.items.forEach(function (it) {
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
    if (vocabData && Array.isArray(vocabData.items)) {
      vocabData.items.forEach(function (it) {
        if (it.type !== 'synonyms' || it.custom) {
          defaults.push(it);
        }
      });
    }
    vocabData.items = defaults;
    saveVocabData();
    render();
  }

  function escapeHtml(value) {
    return cleanText(value).replace(/[&<>'"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c];
    });
  }

  // 题库解析与写作素材允许保留基础排版，但不能把爬取内容直接插入 innerHTML。
  // DOMPurify 已由 index.html 提前加载；离线/测试环境没有它时退回纯文本渲染。
  function safeRichHtml(value) {
    var raw = String(value || '');
    if (!raw) return '';
    if (typeof DOMPurify !== 'undefined' && typeof DOMPurify.sanitize === 'function') {
      return DOMPurify.sanitize(raw, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target', 'rel']
      });
    }
    return escapeHtml(raw).replace(/\r?\n/g, '<br>');
  }

  function title(type) {
    return ({
      synonyms: '同义词 / 短语',
      meanings: '熟词生义',
      mistakes: '易错词',
      phrases: '常见词组',
      zhenti: '真题生词本'
    })[type] || type;
  }

  // =========================================================================
  // 2.5 考研英语：单词分词、查词缓存、发音与生词卡同步
  // =========================================================================
  var STORAGE_DICT_CACHE_KEY = 'user_guest_kaoyan_dict_cache_v2';
  var dictCache = loadStorageJson(STORAGE_DICT_CACHE_KEY, {});

  function saveDictCache() {
    saveStorageJson(STORAGE_DICT_CACHE_KEY, dictCache);
  }

  function renderClickableWords(text) {
    if (!text) return '';
    var source = normalizeExamText(text);
    return source.replace(/([a-zA-Z]+(?:['’][a-zA-Z]+)?)|([^a-zA-Z'’]+)/g, function (_, word, other) {
      if (word) {
        var clean = word.toLowerCase().replace(/['’]s$/, '');
        return '<span class="ez-word" data-word="' + escapeHtml(clean) + '">' + escapeHtml(word) + '</span>';
      }
      // 不能调用 escapeHtml(other)：escapeHtml 内部会 trim，曾导致所有单词间空格被删除。
      return escapeInlineHtml(other);
    });
  }

  function escapeInlineHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c];
    });
  }

  function normalizeExamText(value) {
    return String(value == null ? '' : value)
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\r?\n[ \t]*/g, ' ')
      .replace(/\s+([,.;:!?%])/g, '$1')
      .replace(/\.\?/g, '.')
      .replace(/!\?/g, '!')
      .replace(/\?\?/g, '?')
      .trim();
  }

  function findBuiltInWord(word) {
    var target = (word || '').toLowerCase().trim();
    if (!target || !vocabData || !Array.isArray(vocabData.items)) return null;
    for (var i = 0; i < vocabData.items.length; i++) {
      var item = vocabData.items[i];
      var itText = (item.text || '').toLowerCase().trim();
      var terms = (item.group || item.text).split(' · ').map(function (s) { return s.trim().toLowerCase(); });
      if (itText === target || terms.indexOf(target) !== -1) {
        return {
          word: item.text,
          phonetic: item.phonetic || '',
          definition: '<p><span class="pos-badge">' + escapeHtml(title(item.type) || '考点') + '</span> ' + escapeHtml(item.meaning || '') + '</p>',
          lemma: item.text,
          speakUrl: ''
        };
      }
    }
    return null;
  }

  function queryWord(word, callback) {
    var clean = (word || '').toLowerCase().trim();
    if (!clean) return;

    if (dictCache[clean]) {
      callback(dictCache[clean]);
      return;
    }

    var builtIn = findBuiltInWord(clean);
    if (builtIn) {
      dictCache[clean] = builtIn;
      saveDictCache();
      callback(builtIn);
      return;
    }

    var apiUrl = 'https://english.kaoyansou.cn/api/word/query/' + encodeURIComponent(clean);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', apiUrl, true);
    xhr.timeout = 4000;
    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          var res = JSON.parse(xhr.responseText);
          if (res && res.code === 200 && res.data) {
            var entry = {
              word: res.data.word || clean,
              lemma: res.data.lemma || clean,
              phonetic: res.data.phonetic || '',
              definition: res.data.definition || '',
              speakUrl: res.data.speakUrl || ''
            };
            dictCache[clean] = entry;
            saveDictCache();
            callback(entry);
            return;
          }
        } catch (e) {}
      }
      var fallback = {
        word: clean,
        lemma: clean,
        phonetic: '',
        definition: '',
        isCustom: true
      };
      callback(fallback);
    };
    xhr.onerror = xhr.ontimeout = function () {
      var fallback = {
        word: clean,
        lemma: clean,
        phonetic: '',
        definition: '',
        isCustom: true
      };
      callback(fallback);
    };
    xhr.send();
  }

  function speakWord(word, speakUrl) {
    if (speakUrl) {
      var audio = new Audio(speakUrl);
      var playPromise = audio.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          speakViaWebSpeech(word);
        });
      }
    } else {
      speakViaWebSpeech(word);
    }
  }

  function speakViaWebSpeech(word) {
    if ('speechSynthesis' in window && window.SpeechSynthesisUtterance) {
      try {
        var utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }
  }

  function showToast(msg) {
    var toast = document.getElementById('ezToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ezToast';
      toast.className = 'ez-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2200);
  }

  function isWordInVocabCards(word) {
    var target = (word || '').toLowerCase().trim();
    if (!target || !vocabData || !Array.isArray(vocabData.items)) return false;
    return vocabData.items.some(function (it) {
      var itText = (it.text || '').toLowerCase().trim();
      var terms = (it.group || it.text).split(' · ').map(function (s) { return s.trim().toLowerCase(); });
      return itText === target || terms.indexOf(target) !== -1;
    });
  }

  function addWordToVocab(word, meaning, phonetic, sentence) {
    var clean = (word || '').trim();
    if (!clean) return;
    if (isWordInVocabCards(clean)) {
      showToast('该单词已经在您的生词卡中了！');
      return;
    }
    var cleanMeaning = (meaning || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '（待补充释义）';
    var newItem = {
      id: uid(),
      type: 'zhenti',
      text: clean,
      meaning: cleanMeaning,
      phonetic: phonetic || '',
      group: '真题生词',
      category: '真题精读',
      status: 'wrong',
      custom: true,
      sentence: sentence || ''
    };
    vocabData.items.unshift(newItem);
    saveVocabData();
    showToast('🎉 已将 "' + clean + '" 加入【考研核心词汇背诵】生词卡！');
  }

  var activeWordPopoverEl = null;

  function closeWordPopover() {
    if (activeWordPopoverEl) {
      activeWordPopoverEl.remove();
      activeWordPopoverEl = null;
    }
    document.querySelectorAll('.ez-word.is-active').forEach(function (el) {
      el.classList.remove('is-active');
    });
  }

  function showWordPopover(wordSpan, cleanWord) {
    closeWordPopover();
    wordSpan.classList.add('is-active');

    var parentPara = wordSpan.closest('.ez-para-en, .ez-ks-en, .ez-q-stem') || wordSpan.parentElement;
    var contextSentence = '';
    if (parentPara) {
      var rawParaText = parentPara.innerText || parentPara.textContent || '';
      var sentences = rawParaText.split(/(?<=[.!?])\s+/);
      for (var i = 0; i < sentences.length; i++) {
        if (new RegExp('\\b' + cleanWord + '\\b', 'i').test(sentences[i])) {
          contextSentence = sentences[i].trim();
          break;
        }
      }
      if (!contextSentence && rawParaText) {
        contextSentence = rawParaText.slice(0, 160) + '...';
      }
    }

    var popover = document.createElement('div');
    popover.className = 'ez-word-popover';
    popover.id = 'ezWordPopover';

    var isAdded = isWordInZhentiVocab(cleanWord);
    popover.innerHTML =
      '<div class="ez-wp-header">' +
        '<div class="ez-wp-title-row">' +
          '<span class="ez-wp-word">' + escapeHtml(cleanWord) + '</span>' +
          '<span class="ez-wp-phonetic" id="ezWpPhonetic">/ ... /</span>' +
          '<button class="ez-wp-btn-audio" id="ezWpBtnAudio" type="button" title="点击发音">🔊</button>' +
        '</div>' +
        '<button class="ez-wp-btn-close" id="ezWpBtnClose" type="button" title="关闭">✕</button>' +
      '</div>' +
      '<div class="ez-wp-body">' +
        '<div class="ez-wp-loading" id="ezWpLoading">⏳ 正在查询考点释义...</div>' +
        '<div class="ez-wp-definition" id="ezWpDef" style="display:none"></div>' +
        '<div class="ez-wp-custom-input-box" id="ezWpCustomBox" style="display:none">' +
          '<p style="color:#64748b;font-size:12px;margin:0 0 6px">未查询到预设释义，可手动输入补充：</p>' +
          '<input class="ez-wp-custom-input" id="ezWpCustomInput" type="text" placeholder="例如: n. 驯养，驯化" />' +
        '</div>' +
        (contextSentence ?
          '<div class="ez-wp-sentence">' +
            '<div class="ez-wp-sentence-title">📌 真题语境：</div>' +
            '<div class="ez-wp-sentence-text">' +
              escapeHtml(contextSentence).replace(new RegExp('(' + escapeHtml(cleanWord) + ')', 'gi'), '<mark>$1</mark>') +
            '</div>' +
          '</div>' : '') +
      '</div>' +
      '<div class="ez-wp-footer">' +
        '<button class="ez-wp-btn-add ' + (isAdded ? 'is-added' : '') + '" id="ezWpBtnAdd" type="button">' +
          (isAdded ? '✅ 已在真题生词本' : '➕ 加入生词卡') +
        '</button>' +
        '<button class="ez-wp-btn-link" id="ezWpBtnGoVocab" type="button" title="前往真题生词本查看">🗂️ 查看生词本</button>' +
      '</div>';

    document.body.appendChild(popover);
    activeWordPopoverEl = popover;

    var rect = wordSpan.getBoundingClientRect();
    var popWidth = Math.min(320, window.innerWidth - 32);
    var left = rect.left + rect.width / 2 - popWidth / 2;
    left = Math.max(16, Math.min(window.innerWidth - popWidth - 16, left));

    var top = rect.bottom + 8;
    if (top + 280 > window.innerHeight) {
      top = Math.max(16, rect.top - 280);
    }
    popover.style.top = top + 'px';
    popover.style.left = left + 'px';

    popover.querySelector('#ezWpBtnClose').addEventListener('click', function (e) {
      e.stopPropagation();
      closeWordPopover();
    });

    var currentPhonetic = '';
    var currentMeaningHtml = '';
    var currentSpeakUrl = '';

    queryWord(cleanWord, function (info) {
      if (!activeWordPopoverEl || activeWordPopoverEl !== popover) return;
      var loadingEl = popover.querySelector('#ezWpLoading');
      var defEl = popover.querySelector('#ezWpDef');
      var phoneticEl = popover.querySelector('#ezWpPhonetic');
      var customBox = popover.querySelector('#ezWpCustomBox');

      if (loadingEl) loadingEl.style.display = 'none';

      currentPhonetic = info.phonetic || '';
      currentSpeakUrl = info.speakUrl || '';
      if (phoneticEl) {
        if (info.phonetic) {
          phoneticEl.textContent = info.phonetic;
        } else {
          phoneticEl.style.display = 'none';
        }
      }

      if (info.definition) {
        currentMeaningHtml = info.definition;
        if (defEl) {
          defEl.innerHTML = info.definition;
          defEl.style.display = 'block';
        }
      } else {
        if (customBox) customBox.style.display = 'block';
      }
    });

    popover.querySelector('#ezWpBtnAudio').addEventListener('click', function (e) {
      e.stopPropagation();
      speakWord(cleanWord, currentSpeakUrl);
    });

    var btnAdd = popover.querySelector('#ezWpBtnAdd');
    btnAdd.addEventListener('click', function (e) {
      e.stopPropagation();
      var customInput = popover.querySelector('#ezWpCustomInput');
      var meaning = currentMeaningHtml;
      if (customInput && customInput.value.trim()) {
        meaning = customInput.value.trim();
      }
      var curSec = getCurrentSection();
      addWordToZhentiVocab(cleanWord, meaning, currentPhonetic, contextSentence, curYear, curSec);
      btnAdd.className = 'ez-wp-btn-add is-added';
      btnAdd.innerHTML = '✅ 已在真题生词本';
    });

    var btnGoVocab = popover.querySelector('#ezWpBtnGoVocab');
    if (btnGoVocab) {
      btnGoVocab.addEventListener('click', function (e) {
        e.stopPropagation();
        closeWordPopover();
        activeMainTab = 'zhentiVocab';
        localStorage.setItem(STORAGE_MAIN_TAB_KEY, activeMainTab);
        render();
      });
    }
  }

  // =========================================================================
  // 3. 页面主渲染调度入口 (Render Router)
  // =========================================================================
  function render() {
    var zvCount = (zhentiVocabData && zhentiVocabData.items) ? zhentiVocabData.items.length : 0;
    var topTabsHtml =
      '<div class="english-top-tabs">' +
        '<button class="english-top-tab ' + (activeMainTab === 'zhenti' ? 'active' : '') + '" data-main-tab="zhenti" type="button">' +
          '📑 历年真题 (英语一 1998-2026)' +
        '</button>' +
        '<button class="english-top-tab ' + (activeMainTab === 'zhentiVocab' ? 'active' : '') + '" data-main-tab="zhentiVocab" type="button">' +
          '🗂️ 真题生词本' + (zvCount > 0 ? ' <span class="tab-badge">' + zvCount + '</span>' : '') +
        '</button>' +
        '<button class="english-top-tab ' + (activeMainTab === 'vocab' ? 'active' : '') + '" data-main-tab="vocab" type="button">' +
          '📖 考研核心词汇背诵' +
        '</button>' +
      '</div>';

    if (activeMainTab === 'zhenti') {
      panel.innerHTML = topTabsHtml + renderZhentiModuleV2();
      bindZhentiEvents();
    } else if (activeMainTab === 'zhentiVocab') {
      panel.innerHTML = topTabsHtml + renderZhentiVocabModule();
      bindZhentiVocabEvents();
    } else {
      panel.innerHTML = topTabsHtml + renderVocabModule();
      bindVocabEvents();
    }
  }

  // =========================================================================
  // 4. 历年真题 (Zhenti) 模块渲染
  // =========================================================================
  function renderZhentiModule() {
    var manifest = getManifest();
    var curSec = getCurrentSection();
    var yearData = getCurrentYearData();

    if (!manifest.length) {
      return '<div class="section-empty">暂无真题数据，请检查 data/english/english-zhenti-data.js 是否加载。</div>';
    }

    // 1. 年份选择下拉
    var yearOptionsHtml = manifest.map(function (m) {
      return '<option value="' + m.year + '" ' + (m.year === curYear ? 'selected' : '') + '>' + m.year + ' 年真题 (' + m.sectionCount + '部分)</option>';
    }).join('');

    // 2. 模块药丸切换 (Section Pills)
    var sections = (yearData && yearData.sections) ? yearData.sections : [];
    var pillsHtml = sections.map(function (s) {
      var isAct = curSec && s.id === curSec.id;
      var qCountBadge = s.questions && s.questions.length ? ' (' + s.questions.length + '题)' : '';
      return '<button class="ez-pill ' + (isAct ? 'active' : '') + '" data-sec-id="' + s.id + '" type="button">' +
        escapeHtml(s.sectionName) + qCountBadge +
      '</button>';
    }).join('');

    // 3. 工具栏
    var toolbarHtml =
      '<div class="ez-toolbar">' +
        '<div class="ez-toolbar-top">' +
          '<div class="ez-selectors-group">' +
            '<div class="ez-select-wrap">' +
              '<span class="ez-select-label">考试年份:</span>' +
              '<select class="ez-year-select" id="ezYearSelect">' + yearOptionsHtml + '</select>' +
            '</div>' +
          '</div>' +
        '<div class="ez-toolbar-actions">' +
            '<button class="ez-btn-action ' + (bilingualMode ? 'active' : '') + '" id="ezBtnBilingual" type="button" title="点击切换文章段落中文译文">' +
              (bilingualMode ? '🙈 隐藏中文译文' : '👁️ 显示中文译文') +
            '</button>' +
            '<button class="ez-btn-action ez-btn-back" data-action="back" type="button">返回刷题</button>' +
          '</div>' +
        '</div>' +
        '<div class="ez-pills-bar">' + pillsHtml + '</div>' +
      '</div>';

    if (!curSec) {
      return toolbarHtml + '<div class="section-empty">未找到该年份真题内容。</div>';
    }

    // 4. 左侧主区域内容：文章精读 / 写作卡片 / 题目卡片
    var mainHtml = '<div class="ez-main-content">';

    // 文章精读卡片 (如果有段落)
    if (curSec.paragraphs && curSec.paragraphs.length > 0) {
      mainHtml += '<article class="ez-passage-card">' +
        '<div class="ez-passage-header">' +
          '<h3 class="ez-passage-title">' + curYear + ' 年考研英语（一）· ' + escapeHtml(curSec.displayTitle) + '</h3>' +
          '<div class="ez-passage-meta">' +
            (curSec.beform ? '<span class="ez-passage-beform">出处 / 背景: ' + escapeHtml(curSec.beform) + '</span>' : '') +
            '<span>段落数: ' + curSec.paragraphs.length + ' 段</span>' +
          '</div>' +
        '</div>' +
        '<div class="ez-reading-hint">点击英文单词可查释义、发音，并加入真题生词本</div>' +
        '<div class="ez-passage-body">' +
          curSec.paragraphs.map(function (p, paragraphIndex) {
            return '<div class="ez-para" data-paragraph-index="' + (paragraphIndex + 1) + '">' +
              '<span class="ez-para-number" aria-hidden="true">P' + (paragraphIndex + 1) + '</span>' +
              '<div class="ez-para-en">' + renderClickableWords(p.english) + '</div>' +
              (bilingualMode && p.chinese ? '<div class="ez-para-zh">' + escapeHtml(p.chinese) + '</div>' : '') +
            '</div>';
          }).join('') +
        '</div>';

      // 长难句精解卡片 (如果有)
      if (curSec.keySentences && curSec.keySentences.length > 0) {
        mainHtml += '<div class="ez-keysentences-card">' +
          '<div class="ez-keysentences-title">💡 重点长难句语法剖析 (' + curSec.keySentences.length + ' 句)</div>' +
          curSec.keySentences.map(function (ks) {
            return '<div class="ez-ks-item">' +
              '<div class="ez-ks-en">' + renderClickableWords(ks.sentence) + '</div>' +
              '<div class="ez-ks-zh">' + escapeHtml(ks.analysis) + '</div>' +
            '</div>';
          }).join('') +
        '</div>';
      }

      mainHtml += '</article>';
    }

    // 写作卡片 (如果是大小作文)
    if (curSec.writing) {
      mainHtml += '<article class="ez-writing-card">' +
        '<h3 class="ez-passage-title">' + curYear + ' 年考研英语（一）· ' + escapeHtml(curSec.displayTitle) + '</h3>' +
        (curSec.writing.prompt ? '<div class="ez-writing-prompt">' + safeRichHtml(curSec.writing.prompt) + '</div>' : '') +
        (curSec.writing.imageUrl ?
          '<div class="ez-writing-img-container">' +
            '<div class="ez-writing-img-header">📸 考研英语真题图画 / 图表题目配图</div>' +
            '<img class="ez-writing-img" src="' + curSec.writing.imageUrl + '" alt="' + curYear + ' 年写作真题配图" title="点击可查看高清大图" />' +
            '<div class="ez-writing-img-hint">（真题原始配图已离线存储）</div>' +
          '</div>' : '') +
        (curSec.writing.sampleEssay && curSec.writing.sampleEssay.length ?
          '<div class="ez-writing-sample">' +
            '<h4 style="font-size:15px;font-weight:700;margin-bottom:12px;color:#0f172a">📝 官方高分参考范文与精译</h4>' +
            curSec.writing.sampleEssay.map(function (sp) {
              return '<div class="ez-para">' +
                '<div class="ez-para-en">' + renderClickableWords(sp.english) + '</div>' +
                (bilingualMode && sp.chinese ? '<div class="ez-para-zh">' + escapeHtml(sp.chinese) + '</div>' : '') +
              '</div>';
            }).join('') +
          '</div>' : '') +
        (curSec.writing.analysis ?
          '<div class="ez-exp-box" style="margin-top:16px"><h4 style="font-size:14px;font-weight:700;margin-bottom:8px">💡 范文结构解析与写作技巧</h4>' +
            safeRichHtml(curSec.writing.analysis) +
          '</div>' : '') +
      '</article>';
    }

    // 试题列表 (Questions)
    var questions = curSec.questions || [];
    if (questions.length > 0) {
      mainHtml += questions.map(function (q, qIdx) {
        var status = zhentiStatuses[q.id] || '';
        var userChoice = zhentiUserAnswers[q.id] || '';
        var isExpOpen = Boolean(expandedExplanations[q.id]);
        var note = zhentiNotes[q.id] || '';
        var isEditingNote = Boolean(editingNotes[q.id]);
        var isActive = activeQuestionId === q.id || (!activeQuestionId && qIdx === 0);
        var normAnswer = (function (ans) {
          if (!ans) return '';
          var s = String(ans).trim().toUpperCase();
          if (/^[1-8]$/.test(s)) return String.fromCharCode(64 + parseInt(s, 10));
          return s;
        })(q.answer);

        // 选项 HTML
        var optsHtml = '';
        var isTranslationQuestion = curSec.type === 'translation';
        var visibleOptions = (q.options || []).filter(function (opt) {
          return opt && String(opt.text || '').trim();
        });
        if (!isTranslationQuestion && visibleOptions.length) {
          optsHtml = '<div class="ez-options">' +
            visibleOptions.map(function (opt) {
              var isSelected = userChoice === opt.key;
              var optClass = 'ez-option';
              if (isSelected) optClass += ' selected';
              if (userChoice) {
                if (opt.key === normAnswer) optClass += ' is-correct';
                else if (isSelected) optClass += ' is-wrong';
              }
              return '<button class="' + optClass + '" type="button" aria-pressed="' + (isSelected ? 'true' : 'false') + '" data-q-id="' + escapeHtml(q.id) + '" data-opt-key="' + escapeHtml(opt.key) + '">' +
                '<span class="ez-opt-key">' + escapeHtml(opt.key) + '</span>' +
                '<span class="ez-opt-text">' + escapeHtml(opt.text) + '</span>' +
              '</button>';
            }).join('') +
          '</div>';
        }

        // 5级掌握度状态条
        var masteryHtml =
          '<div class="ez-mastery-group">' +
            [
              { key: 'proficient', label: '熟练 Z' },
              { key: 'familiar', label: '较熟练' },
              { key: 'vague', label: '模糊 X' },
              { key: 'rusty', label: '困难' },
              { key: 'wrong', label: '不会 C' }
            ].map(function (st) {
              return '<button class="ez-btn-mastery ' + st.key + (status === st.key ? ' active' : '') + '" data-q-id="' + q.id + '" data-status="' + st.key + '" type="button">' +
                st.label +
              '</button>';
            }).join('') +
          '</div>';

        // 解析框
        var expBoxHtml = '';
        if (isExpOpen) {
          expBoxHtml = '<div class="ez-exp-box">' +
            '<div class="ez-exp-answer-row"><span>' + (isTranslationQuestion ? '📝 参考译文:' : '🎯 标准正确答案:') + '</span> <strong>' + escapeHtml(normAnswer || q.answer || '无') + '</strong></div>' +
            (q.explanation ? '<div class="ez-exp-content">' + safeRichHtml(q.explanation) + '</div>' : '<div style="color:#64748b">暂无详细解析内容</div>') +
          '</div>';
        }

        // 笔记框
        var noteHtml =
          '<div class="ez-note-section">' +
            '<div class="ez-note-header">' +
              '<span class="ez-note-title">📝 题目笔记 (支持 Markdown 与公式)</span>' +
              '<button class="ez-note-btn" data-q-id="' + q.id + '" data-note-action="' + (isEditingNote ? 'save' : 'edit') + '">' +
                (isEditingNote ? '保存笔记' : (note ? '修改笔记' : '添加笔记')) +
              '</button>' +
            '</div>' +
            (isEditingNote
              ? '<textarea class="ez-note-textarea" id="noteInput_' + q.id + '" placeholder="记录本题的生词短语、长难句拆解或解题心得...">' + escapeHtml(note) + '</textarea>'
              : (note ? '<div class="ez-note-text">' + escapeHtml(note) + '</div>' : '<div style="font-size:12px;color:#94a3b8">暂无笔记，点击上方按钮添加</div>')) +
          '</div>';

        return '<article class="ez-question-card ' + (isActive ? 'is-active' : '') + '" id="qcard_' + q.id + '" data-q-id="' + q.id + '">' +
          '<div class="ez-question-header">' +
            '<span class="ez-q-badge">第 ' + (q.num || (qIdx + 1)) + ' 题</span>' +
            masteryHtml +
          '</div>' +
          '<div class="ez-q-stem">' + renderClickableWords(q.stem) + '</div>' +
          optsHtml +
          '<div class="ez-q-actions">' +
            '<button class="ez-btn-exp-toggle ' + (isExpOpen ? 'active' : '') + '" data-q-id="' + q.id + '" data-action="toggleExp" type="button">' +
              (isExpOpen ? '隐藏解析 (Space)' : '💡 显示解析 (Space)') +
            '</button>' +
          '</div>' +
          expBoxHtml +
          noteHtml +
        '</article>';
      }).join('');
    }

    mainHtml += '</div>'; // .ez-main-content

    // 5. 右侧边栏 Q-Nav 与统计 Rail
    var counts = { proficient: 0, familiar: 0, vague: 0, rusty: 0, wrong: 0, unmarked: 0 };
    questions.forEach(function (q) {
      var st = zhentiStatuses[q.id];
      if (st && counts[st] !== undefined) counts[st]++;
      else counts.unmarked++;
    });

    var qnavGridHtml = questions.map(function (q, qIdx) {
      var st = zhentiStatuses[q.id] || 'unmarked';
      var isAct = activeQuestionId === q.id || (!activeQuestionId && qIdx === 0);
      return '<button class="ez-qnav-btn status-' + st + (isAct ? ' is-active' : '') + '" data-q-id="' + q.id + '" type="button">' +
        (q.num || '') +
      '</button>';
    }).join('');

    var railHtml =
      '<aside class="ez-sidebar-rail">' +
        '<div class="ez-qnav-card">' +
          '<div class="ez-qnav-title">' +
            '<span>题号导航与进度</span>' +
            '<span style="font-size:12px;color:#64748b">' + questions.length + ' 题</span>' +
          '</div>' +
          '<div class="ez-qnav-stats">' +
            '<div class="ez-qnav-stat-item"><span class="ez-stat-dot proficient"></span>熟练: <strong>' + counts.proficient + '</strong></div>' +
            '<div class="ez-qnav-stat-item"><span class="ez-stat-dot vague"></span>模糊: <strong>' + counts.vague + '</strong></div>' +
            '<div class="ez-qnav-stat-item"><span class="ez-stat-dot wrong"></span>不会: <strong>' + counts.wrong + '</strong></div>' +
            '<div class="ez-qnav-stat-item"><span class="ez-stat-dot unmarked"></span>未做: <strong>' + counts.unmarked + '</strong></div>' +
          '</div>' +
          (questions.length ? '<div class="ez-qnav-grid">' + qnavGridHtml + '</div>' : '<div style="font-size:12px;color:#94a3b8;text-align:center">写作模块无客观题</div>') +
        '</div>' +
      '</aside>';

    return toolbarHtml + '<div class="ez-layout">' + mainHtml + railHtml + '</div>';
  }

  // =========================================================================
  // 4.1 历年真题 V2：统一外壳 + 分题型工作区
  // =========================================================================
  function normalizeObjectiveAnswer(answer) {
    var value = String(answer == null ? '' : answer).trim();
    if (/^[1-8]$/.test(value)) return String.fromCharCode(64 + parseInt(value, 10));
    if (/^[A-H]$/i.test(value)) return value.toUpperCase();
    return value;
  }

  function countEnglishWords(value) {
    var matches = String(value || '').trim().match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g);
    return matches ? matches.length : 0;
  }

  function renderSectionToolbarV2(manifest, sections, curSec) {
    var yearOptionsHtml = manifest.map(function (item) {
      return '<option value="' + item.year + '" ' + (item.year === curYear ? 'selected' : '') + '>' +
        item.year + ' 年真题 (' + item.sectionCount + '部分)</option>';
    }).join('');
    var pillsHtml = sections.map(function (section) {
      var active = curSec && section.id === curSec.id;
      var count = section.questions && section.questions.length ? ' (' + section.questions.length + '题)' : '';
      return '<button class="ez-pill ' + (active ? 'active' : '') + '" data-sec-id="' + section.id + '" type="button">' +
        escapeHtml(section.sectionName) + count +
      '</button>';
    }).join('');

    return '<div class="ez-toolbar">' +
      '<div class="ez-toolbar-top">' +
        '<div class="ez-selectors-group">' +
          '<label class="ez-select-wrap" for="ezYearSelect">' +
            '<span class="ez-select-label">考试年份</span>' +
            '<select class="ez-year-select" id="ezYearSelect">' + yearOptionsHtml + '</select>' +
          '</label>' +
        '</div>' +
        '<div class="ez-toolbar-actions">' +
          '<button class="ez-btn-action ' + (bilingualMode ? 'active' : '') + '" id="ezBtnBilingual" type="button" aria-pressed="' + (bilingualMode ? 'true' : 'false') + '">' +
            (bilingualMode ? '🙈 隐藏中文译文' : '👁️ 显示中文译文') +
          '</button>' +
          '<button class="ez-btn-action ez-btn-back" data-action="back" type="button">返回刷题</button>' +
        '</div>' +
      '</div>' +
      '<div class="ez-pills-bar" aria-label="真题题型">' + pillsHtml + '</div>' +
    '</div>';
  }

  function getSectionUiMeta(section) {
    var map = {
      cloze: { eyebrow: 'USE OF ENGLISH', label: '完形填空', hint: '先通读全文建立语境，再逐空作答；选项与题号保持联动。' },
      reading: { eyebrow: 'READING PART A', label: '阅读理解', hint: '文章与题目保持清晰层级；点击正文单词可查词并加入生词本。' },
      partB: { eyebrow: 'READING PART B', label: '新题型', hint: '先浏览全部候选段落，再为每个空位选择唯一段落。' },
      translation: { eyebrow: 'TRANSLATION', label: '英译汉', hint: '先独立完成译文，再展开参考译文与解析进行对照。' },
      writingA: { eyebrow: 'WRITING PART A', label: '应用文写作', hint: '审题、列提纲、完成草稿，最后再查看范文和结构解析。' },
      writingB: { eyebrow: 'WRITING PART B', label: '短文写作', hint: '先完成图表或图画描述，再展开论证与个人观点。' }
    };
    return map[section.type] || { eyebrow: 'ENGLISH I', label: section.sectionName || '真题', hint: '按题目要求完成作答。' };
  }

  function renderSectionHeroV2(section, questions) {
    var meta = getSectionUiMeta(section);
    var isWriting = section.type === 'writingA' || section.type === 'writingB';
    return '<header class="ez-section-hero">' +
      '<div class="ez-section-hero-copy">' +
        '<span class="ez-section-eyebrow">' + meta.eyebrow + '</span>' +
        '<h2>' + curYear + ' 年考研英语（一）· ' + escapeHtml(section.displayTitle) + '</h2>' +
        '<p>' + meta.hint + '</p>' +
      '</div>' +
      '<div class="ez-section-facts" aria-label="题型信息">' +
        '<span>' + meta.label + '</span>' +
        '<strong>' + (isWriting ? 1 : questions.length) + '</strong>' +
        '<small>' + (isWriting ? '项任务' : '题') + '</small>' +
      '</div>' +
    '</header>';
  }

  function renderPassageV2(section) {
    var paragraphs = section.paragraphs || [];
    if (!paragraphs.length) return '';
    return '<article class="ez-passage-card ez-passage-card--' + escapeHtml(section.type) + '">' +
      '<div class="ez-passage-header">' +
        '<div>' +
          '<span class="ez-card-kicker">原文</span>' +
          '<h3 class="ez-passage-title">' + escapeHtml(section.displayTitle) + '</h3>' +
        '</div>' +
        '<div class="ez-passage-meta">' +
          (section.beform ? '<span class="ez-passage-beform">出处 / 背景：' + escapeHtml(section.beform) + '</span>' : '') +
          '<span>' + paragraphs.length + ' 段</span>' +
        '</div>' +
      '</div>' +
      '<div class="ez-reading-hint">点击英文单词可查释义、发音，并加入真题生词本</div>' +
      '<div class="ez-passage-body">' +
        paragraphs.map(function (paragraph, index) {
          var label = section.type === 'partB' ? String(paragraph.duanluo || index + 1) : 'P' + (index + 1);
          return '<section class="ez-para" data-paragraph-index="' + (index + 1) + '">' +
            '<span class="ez-para-number" aria-hidden="true">' + escapeHtml(label) + '</span>' +
            '<div class="ez-para-copy">' +
              '<div class="ez-para-en">' + renderClickableWords(paragraph.english) + '</div>' +
              (bilingualMode && paragraph.chinese ? '<div class="ez-para-zh">' + escapeHtml(paragraph.chinese) + '</div>' : '') +
            '</div>' +
          '</section>';
        }).join('') +
      '</div>' +
    '</article>';
  }

  function renderMasteryV2(question, status) {
    return '<div class="ez-mastery-group" aria-label="第 ' + escapeHtml(question.num) + ' 题掌握度">' +
      [
        { key: 'proficient', label: '熟练', shortcut: 'Z' },
        { key: 'familiar', label: '较熟练', shortcut: '' },
        { key: 'vague', label: '模糊', shortcut: 'X' },
        { key: 'rusty', label: '困难', shortcut: '' },
        { key: 'wrong', label: '不会', shortcut: 'C' }
      ].map(function (item) {
        return '<button class="ez-btn-mastery ' + item.key + (status === item.key ? ' active' : '') + '" data-q-id="' + escapeHtml(question.id) + '" data-status="' + item.key + '" type="button">' +
          item.label + (item.shortcut ? '<kbd>' + item.shortcut + '</kbd>' : '') +
        '</button>';
      }).join('') +
    '</div>';
  }

  function renderOptionsV2(question, userChoice, answer, isPartB) {
    var options = (question.options || []).filter(function (option) {
      return option && String(option.text || '').trim();
    });
    if (!options.length) return '';
    return '<div class="ez-options' + (isPartB ? ' ez-options--partb' : '') + '" role="group" aria-label="第 ' + escapeHtml(question.num) + ' 题选项">' +
      options.map(function (option) {
        var selected = userChoice === option.key;
        var optionClass = 'ez-option';
        if (selected) optionClass += ' selected';
        if (userChoice) {
          if (option.key === answer) optionClass += ' is-correct';
          else if (selected) optionClass += ' is-wrong';
        }
        return '<button class="' + optionClass + '" type="button" aria-pressed="' + (selected ? 'true' : 'false') + '" data-q-id="' + escapeHtml(question.id) + '" data-opt-key="' + escapeHtml(option.key) + '">' +
          '<span class="ez-opt-key">' + escapeHtml(option.key) + '</span>' +
          '<span class="ez-opt-text">' + escapeHtml(option.text) + '</span>' +
        '</button>';
      }).join('') +
    '</div>';
  }

  function renderExplanationV2(question, isTranslation, isOpen) {
    if (!isOpen) return '';
    var answer = isTranslation ? String(question.answer || '') : normalizeObjectiveAnswer(question.answer);
    return '<div class="ez-exp-box" id="exp_' + escapeHtml(question.id) + '">' +
      '<div class="ez-exp-answer-row"><span>' + (isTranslation ? '参考译文' : '标准答案') + '</span><strong>' + escapeHtml(answer || '暂无') + '</strong></div>' +
      (question.explanation ? '<div class="ez-exp-content">' + safeRichHtml(question.explanation) + '</div>' : '<p class="ez-muted">暂无详细解析内容</p>') +
    '</div>';
  }

  function renderNoteV2(question) {
    var note = zhentiNotes[question.id] || '';
    var editing = Boolean(editingNotes[question.id]);
    return '<div class="ez-note-section">' +
      '<div class="ez-note-header">' +
        '<span class="ez-note-title">题目笔记</span>' +
        '<button class="ez-note-btn" data-q-id="' + escapeHtml(question.id) + '" data-note-action="' + (editing ? 'save' : 'edit') + '" type="button">' +
          (editing ? '保存' : (note ? '修改' : '添加')) +
        '</button>' +
      '</div>' +
      (editing
        ? '<textarea class="ez-note-textarea" id="noteInput_' + escapeHtml(question.id) + '" placeholder="记录生词、长难句或解题思路……">' + escapeHtml(note) + '</textarea>'
        : (note ? '<div class="ez-note-text">' + escapeHtml(note) + '</div>' : '<div class="ez-note-empty">暂无笔记</div>')) +
    '</div>';
  }

  function renderQuestionV2(question, index, section) {
    var status = zhentiStatuses[question.id] || '';
    var userChoice = zhentiUserAnswers[question.id] || '';
    var answer = normalizeObjectiveAnswer(question.answer);
    var isTranslation = section.type === 'translation';
    var isPartB = section.type === 'partB';
    var isOpen = Boolean(expandedExplanations[question.id]);
    var isActive = activeQuestionId === question.id || (!activeQuestionId && index === 0);
    var draftKey = 'translation_' + question.id;
    var draft = zhentiDrafts[draftKey] || '';
    var className = 'ez-question-card';
    if (section.type === 'cloze') className += ' ez-question-card--compact';
    if (isTranslation) className += ' ez-question-card--translation';
    if (isPartB) className += ' ez-question-card--partb';
    if (isActive) className += ' is-active';

    return '<article class="' + className + '" id="qcard_' + escapeHtml(question.id) + '" data-q-id="' + escapeHtml(question.id) + '">' +
      '<div class="ez-question-header">' +
        '<div class="ez-question-heading">' +
          '<span class="ez-q-badge">' + (isPartB ? '空位 ' : '第 ') + escapeHtml(question.num || index + 1) + (isPartB ? '' : ' 题') + '</span>' +
          '<span class="ez-question-kind">' + (isTranslation ? '独立翻译' : isPartB ? '段落匹配' : section.type === 'cloze' ? '语境选词' : '单项选择') + '</span>' +
        '</div>' +
        renderMasteryV2(question, status) +
      '</div>' +
      (!isPartB ? '<div class="ez-q-stem">' + renderClickableWords(question.stem) + '</div>' : '') +
      (isTranslation
        ? '<div class="ez-translation-editor">' +
            '<label for="draft_' + escapeHtml(question.id) + '">我的译文</label>' +
            '<textarea id="draft_' + escapeHtml(question.id) + '" class="ez-answer-textarea" data-draft-id="' + escapeHtml(draftKey) + '" data-count-target="count_' + escapeHtml(question.id) + '" placeholder="先独立完成译文，内容会自动保存在本机……">' + escapeHtml(draft) + '</textarea>' +
            '<span class="ez-draft-status" id="count_' + escapeHtml(question.id) + '">' + String(draft.length) + ' 字</span>' +
          '</div>'
        : renderOptionsV2(question, userChoice, answer, isPartB)) +
      '<div class="ez-q-actions">' +
        '<button class="ez-btn-exp-toggle ' + (isOpen ? 'active' : '') + '" data-q-id="' + escapeHtml(question.id) + '" data-action="toggleExp" type="button" aria-expanded="' + (isOpen ? 'true' : 'false') + '">' +
          (isOpen ? '收起' : (isTranslation ? '对照参考译文' : '查看答案与解析')) +
        '</button>' +
      '</div>' +
      renderExplanationV2(question, isTranslation, isOpen) +
      renderNoteV2(question) +
    '</article>';
  }

  function renderPartBLeadV2(section) {
    var stem = section.questions && section.questions[0] ? section.questions[0].stem : '';
    if (!stem) return '';
    return '<section class="ez-partb-lead">' +
      '<span class="ez-card-kicker">作答顺序</span>' +
      '<strong>' + escapeHtml(normalizeExamText(stem)) + '</strong>' +
      '<p>下方每个空位只显示一次选项，避免把同一题干重复五遍。</p>' +
    '</section>';
  }

  function renderWritingV2(section) {
    var writing = section.writing || {};
    var sample = writing.sampleEssay || [];
    var draftKey = 'writing_' + curYear + '_' + section.id;
    var draft = zhentiDrafts[draftKey] || '';
    return '<article class="ez-writing-workspace">' +
      '<section class="ez-writing-task">' +
        '<div class="ez-writing-section-title"><span class="ez-card-kicker">题目要求</span><h3>先审题，再动笔</h3></div>' +
        '<div class="ez-writing-prompt">' + safeRichHtml(writing.prompt || '暂无题目要求') + '</div>' +
        (writing.imageUrl ? '<figure class="ez-writing-img-container"><img class="ez-writing-img" src="' + escapeHtml(writing.imageUrl) + '" alt="' + curYear + ' 年写作真题配图" /><figcaption class="ez-writing-img-hint">点击图片可查看大图</figcaption></figure>' : '') +
      '</section>' +
      '<section class="ez-writing-draft">' +
        '<div class="ez-writing-section-title"><span class="ez-card-kicker">我的草稿</span><h3>在这里完成整篇作文</h3></div>' +
        '<textarea class="ez-writing-textarea" data-draft-id="' + escapeHtml(draftKey) + '" data-count-target="writingCount_' + section.id + '" placeholder="建议先写提纲，再完成正文；内容会自动保存在本机……">' + escapeHtml(draft) + '</textarea>' +
        '<div class="ez-writing-draft-footer"><span>自动保存</span><strong id="writingCount_' + section.id + '">' + countEnglishWords(draft) + ' words</strong></div>' +
      '</section>' +
      (sample.length ? '<details class="ez-writing-reference"><summary>查看参考范文与译文</summary><div class="ez-writing-sample">' +
        sample.map(function (paragraph, index) {
          return '<section class="ez-para"><span class="ez-para-number" aria-hidden="true">P' + (index + 1) + '</span><div class="ez-para-copy">' +
            '<div class="ez-para-en">' + renderClickableWords(paragraph.english) + '</div>' +
            (bilingualMode && paragraph.chinese ? '<div class="ez-para-zh">' + escapeHtml(paragraph.chinese) + '</div>' : '') +
          '</div></section>';
        }).join('') + '</div></details>' : '') +
      (writing.analysis ? '<details class="ez-writing-reference"><summary>查看范文结构解析与写作技巧</summary><div class="ez-exp-box ez-writing-analysis">' + safeRichHtml(writing.analysis) + '</div></details>' : '') +
    '</article>';
  }

  function renderQuestionRailV2(questions) {
    if (!questions.length) return '';
    var counts = { proficient: 0, familiar: 0, vague: 0, rusty: 0, wrong: 0, unmarked: 0 };
    questions.forEach(function (question) {
      var status = zhentiStatuses[question.id];
      if (status && counts[status] !== undefined) counts[status] += 1;
      else counts.unmarked += 1;
    });
    var nav = questions.map(function (question, index) {
      var status = zhentiStatuses[question.id] || 'unmarked';
      var active = activeQuestionId === question.id || (!activeQuestionId && index === 0);
      return '<button class="ez-qnav-btn status-' + status + (active ? ' is-active' : '') + '" data-q-id="' + escapeHtml(question.id) + '" type="button">' + escapeHtml(question.num || index + 1) + '</button>';
    }).join('');
    return '<aside class="ez-sidebar-rail">' +
      '<div class="ez-qnav-card">' +
        '<div class="ez-qnav-title"><span>答题进度</span><span>' + questions.length + ' 题</span></div>' +
        '<div class="ez-qnav-stats ez-qnav-stats--all">' +
          '<span><i class="ez-stat-dot proficient"></i>熟练 <strong>' + counts.proficient + '</strong></span>' +
          '<span><i class="ez-stat-dot familiar"></i>较熟 <strong>' + counts.familiar + '</strong></span>' +
          '<span><i class="ez-stat-dot vague"></i>模糊 <strong>' + counts.vague + '</strong></span>' +
          '<span><i class="ez-stat-dot rusty"></i>困难 <strong>' + counts.rusty + '</strong></span>' +
          '<span><i class="ez-stat-dot wrong"></i>不会 <strong>' + counts.wrong + '</strong></span>' +
          '<span><i class="ez-stat-dot unmarked"></i>未做 <strong>' + counts.unmarked + '</strong></span>' +
        '</div>' +
        '<div class="ez-qnav-grid">' + nav + '</div>' +
      '</div>' +
    '</aside>';
  }

  function renderZhentiModuleV2() {
    var manifest = getManifest();
    var section = getCurrentSection();
    var yearData = getCurrentYearData();
    if (!manifest.length) return '<div class="section-empty">暂无真题数据，请检查英语真题数据文件是否加载。</div>';
    var sections = yearData && yearData.sections ? yearData.sections : [];
    var toolbar = renderSectionToolbarV2(manifest, sections, section);
    if (!section) return toolbar + '<div class="section-empty">未找到该年份真题内容。</div>';

    var questions = section.questions || [];
    var typeClass = String(section.type || 'reading').replace(/[^a-z0-9_-]/gi, '');
    var main = '<main class="ez-main-content">' + renderSectionHeroV2(section, questions);
    if (section.type === 'writingA' || section.type === 'writingB') {
      main += renderWritingV2(section);
    } else {
      main += renderPassageV2(section);
      if (section.type === 'partB') main += renderPartBLeadV2(section);
      if (questions.length) {
        main += '<section class="ez-question-list ez-question-list--' + typeClass + '">' +
          questions.map(function (question, index) { return renderQuestionV2(question, index, section); }).join('') +
        '</section>';
      }
    }
    main += '</main>';
    return toolbar + '<div class="ez-layout ez-layout--' + typeClass + (questions.length ? '' : ' ez-layout--single') + '">' + main + renderQuestionRailV2(questions) + '</div>';
  }

  // =========================================================================
  // 5. 历年真题事件绑定
  // =========================================================================
  function bindZhentiEvents() {
    var yearSelect = document.getElementById('ezYearSelect');
    if (yearSelect) {
      yearSelect.addEventListener('change', function (e) {
        curYear = e.target.value;
        localStorage.setItem(STORAGE_ZHENTI_YEAR_KEY, curYear);
        var yData = getCurrentYearData();
        if (yData && yData.sections && yData.sections.length) {
          curSectionId = yData.sections[0].id;
          localStorage.setItem(STORAGE_ZHENTI_SEC_KEY, String(curSectionId));
        }
        activeQuestionId = null;
        render();
      });
    }

    var bilingualBtn = document.getElementById('ezBtnBilingual');
    if (bilingualBtn) {
      bilingualBtn.addEventListener('click', function () {
        bilingualMode = !bilingualMode;
        localStorage.setItem(STORAGE_ZHENTI_BILINGUAL_KEY, String(bilingualMode));
        render();
      });
    }
  }

  // =========================================================================
  // 6. 词汇模块 (Vocabulary) 渲染（完全保持原貌）
  // =========================================================================
  function card(item) {
    var terms = (item.group || item.text).split(' · ').filter(Boolean);
    var categoryBadge = item.category ? '<span class="english-badge">' + escapeHtml(item.category) + '</span>' : '';
    var phoneticBadge = item.phonetic ? '<span style="font-size:12px;color:#64748b;font-family:monospace;margin-left:6px">' + escapeHtml(item.phonetic) + '</span>' : '';
    var meaningText = item.meaning ? escapeHtml(item.meaning) : '（暂无释义，点击修改释义添加）';
    var sentenceHtml = item.sentence ? '<div style="font-size:12px;color:#475569;margin-top:6px;font-style:italic;background:#f8fafc;padding:5px 8px;border-radius:4px;border-left:2px solid #3b82f6">📌 真题语境: ' + escapeHtml(item.sentence) + '</div>' : '';

    return '<article class="english-card" data-card-id="' + item.id + '">' +
      '<div class="english-card-top">' +
        '<div class="english-terms">' +
          terms.map(function (term) {
            return '<span class="english-term">' + escapeHtml(term) + '</span>';
          }).join('') +
          phoneticBadge +
        '</div>' +
        categoryBadge +
      '</div>' +
      '<div class="english-meaning" data-meaning-id="' + item.id + '" title="自测模式下点击可切换此条释义显隐">' + meaningText + '</div>' +
      sentenceHtml +
      '<div class="english-card-footer">' +
        '<div class="english-controls">' +
          ['familiar', 'vague', 'wrong'].map(function (st) {
            var labels = { familiar: '熟悉', vague: '模糊', wrong: '不会' };
            return '<button class="english-status ' + st + (item.status === st ? ' active' : '') + '" data-status="' + st + '" data-id="' + item.id + '">' + labels[st] + '</button>';
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

  function renderVocabModule() {
    var query = cleanText(searchQuery).toLowerCase();
    var items = vocabData.items.filter(function (item) {
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
    vocabData.items.forEach(function (item) {
      if (counts[item.status] !== undefined) counts[item.status]++;
      else counts.unmarked++;
      totalWords += (item.group || item.text).split(' · ').filter(Boolean).length;
    });

    return '<div class="english-head">' +
        '<div class="english-title-box">' +
          '<h2>考研英语核心词汇</h2>' +
          '<div class="english-summary">' +
            '<span>熟悉 <strong class="eng-stat-num stat-fam">' + counts.familiar + '</strong></span> · ' +
            '<span>模糊 <strong class="eng-stat-num stat-vag">' + counts.vague + '</strong></span> · ' +
            '<span>不会 <strong class="eng-stat-num stat-wro">' + counts.wrong + '</strong></span> · ' +
            '<span>未做 <strong>' + counts.unmarked + '</strong></span> · ' +
            '<span>共 <strong>' + vocabData.items.length + '</strong> 组 (' + totalWords + ' 词)</span>' +
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
          ['synonyms', 'meanings', 'mistakes', 'phrases', 'zhenti'].map(function (type) {
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
        '<input id="englishInput" placeholder="' +
          (activeType === 'synonyms'
            ? '添加新词；可用 · 分隔同义词，附带释义例如：Doctrine · Dogma 信条'
            : (activeType === 'phrases'
                ? '添加常见词组及汉语释义，例如：in terms of 依据；就...而言'
                : (activeType === 'meanings'
                    ? '添加熟词生义及汉语释义，例如：subject 易受...影响的；使屈服'
                    : (activeType === 'mistakes'
                        ? '添加易错词及汉语释义，例如：adopt vs adapt 采纳 / 适应'
                        : (activeType === 'zhenti'
                            ? '添加真题生词及释义，例如：domestication 驯养；驯化'
                            : '输入一个词或短语及汉语释义'))))) + '"/>' +
        '<button class="english-action" type="submit">添加到此模块</button>' +
      '</form>' +
      '<div class="english-list ' + (hideChinese ? 'hide-meaning' : '') + '">' +
        (items.length ? items.map(card).join('') : '<div class="section-empty">' + (query ? '未找到匹配的词汇条目。' : '暂无' + title(activeType) + '，可在上方输入框添加。') + '</div>') +
      '</div>';
  }

  function bindVocabEvents() {
    var searchInput = document.getElementById('englishSearch');
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        searchQuery = e.target.value;
        renderVocabListOnly();
      });
    }
  }

  function renderVocabListOnly() {
    var query = cleanText(searchQuery).toLowerCase();
    var items = vocabData.items.filter(function (item) {
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

  // =========================================================================
  // 6.5 真题生词本 (Zhenti Vocab) 专属模块渲染
  // =========================================================================
  function renderZhentiVocabModule() {
    var items = (zhentiVocabData && Array.isArray(zhentiVocabData.items)) ? zhentiVocabData.items : [];

    var counts = { proficient: 0, vague: 0, wrong: 0, unmarked: 0 };
    items.forEach(function (it) {
      if (it.status === 'proficient' || it.status === 'familiar') counts.proficient++;
      else if (it.status === 'vague' || it.status === 'rusty') counts.vague++;
      else if (it.status === 'wrong') counts.wrong++;
      else counts.unmarked++;
    });

    var years = [];
    items.forEach(function (it) {
      if (it.year && years.indexOf(String(it.year)) === -1) {
        years.push(String(it.year));
      }
    });
    years.sort(function (a, b) { return parseInt(b, 10) - parseInt(a, 10); });

    var yearOptions = '<option value="all"' + (zhentiVocabYearFilter === 'all' ? ' selected' : '') + '>全部年份 (' + items.length + ' 词)</option>';
    years.forEach(function (yr) {
      var yCount = items.filter(function (it) { return String(it.year) === yr; }).length;
      yearOptions += '<option value="' + yr + '"' + (String(zhentiVocabYearFilter) === yr ? ' selected' : '') + '>' + yr + ' 年真题 (' + yCount + ' 词)</option>';
    });

    var q = cleanText(zhentiVocabSearchQuery).toLowerCase();
    var filtered = items.filter(function (it) {
      if (zhentiVocabYearFilter !== 'all' && String(it.year) !== String(zhentiVocabYearFilter)) {
        return false;
      }
      if (zhentiVocabStatusFilter === 'proficient' && it.status !== 'proficient' && it.status !== 'familiar') return false;
      if (zhentiVocabStatusFilter === 'vague' && it.status !== 'vague' && it.status !== 'rusty') return false;
      if (zhentiVocabStatusFilter === 'wrong' && it.status !== 'wrong') return false;
      if (zhentiVocabStatusFilter === 'unmarked' && it.status) return false;

      if (q) {
        var matchWord = (it.word || '').toLowerCase().indexOf(q) !== -1;
        var matchMeaning = (it.meaning || '').toLowerCase().indexOf(q) !== -1;
        var matchSrc = (it.sourceTitle || '').toLowerCase().indexOf(q) !== -1;
        var matchSent = (it.sentence || '').toLowerCase().indexOf(q) !== -1;
        if (!matchWord && !matchMeaning && !matchSrc && !matchSent) return false;
      }
      return true;
    });

    var chipsHtml = [
      { key: 'all', label: '全部', count: items.length },
      { key: 'wrong', label: '待攻克 / 不会', count: counts.wrong },
      { key: 'vague', label: '模糊', count: counts.vague },
      { key: 'proficient', label: '熟练', count: counts.proficient },
      { key: 'unmarked', label: '未标记', count: counts.unmarked }
    ].map(function (c) {
      return '<button class="english-chip ' + (zhentiVocabStatusFilter === c.key ? 'active' : '') + '" data-zv-filter="' + c.key + '">' +
        c.label + ' (' + c.count + ')' +
      '</button>';
    }).join('');

    var cardsHtml = '';
    if (filtered.length > 0) {
      cardsHtml = filtered.map(function (item) {
        var isRevealed = Boolean(revealedVocabIds[item.id]);
        var meaningClass = 'zv-meaning-box';
        if (zhentiVocabHideChinese && !isRevealed) meaningClass += ' blurred';

        var sentHtml = '';
        if (item.sentence) {
          var wordEsc = item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          var hlSent = escapeHtml(item.sentence).replace(new RegExp('(' + wordEsc + '(?:s|es|ed|ing|ly)?\\b)', 'gi'), '<mark>$1</mark>');
          sentHtml =
            '<div class="zv-sentence-box">' +
              '<div class="zv-sentence-title">📌 真题语境出处：</div>' +
              '<div class="zv-sentence-text">' + hlSent + '</div>' +
            '</div>';
        }

        var isStProficient = item.status === 'proficient' || item.status === 'familiar';
        var isStVague = item.status === 'vague' || item.status === 'rusty';
        var isStWrong = item.status === 'wrong';

        return '<article class="zv-card" data-zv-id="' + item.id + '">' +
          '<div class="zv-card-header">' +
            '<div class="zv-card-word-wrap">' +
              '<span class="zv-word">' + escapeHtml(item.word) + '</span>' +
              (item.phonetic ? '<span class="zv-phonetic">' + escapeHtml(item.phonetic) + '</span>' : '') +
              '<button class="zv-btn-audio" data-zv-audio-word="' + escapeHtml(item.word) + '" type="button" title="点击发音">🔊</button>' +
            '</div>' +
            '<div class="zv-card-meta">' +
              (item.year ? '<span class="zv-badge zv-badge-year">' + escapeHtml(item.year) + '年真题</span>' : '') +
              (item.sourceTitle ? '<span class="zv-badge zv-badge-src" title="' + escapeHtml(item.sourceTitle) + '">' + escapeHtml(item.sourceTitle) + '</span>' : '') +
              '<button class="zv-btn-tool-icon" data-zv-edit-meaning="' + item.id + '" type="button" title="修改释义">✏️</button>' +
              '<button class="zv-btn-tool-icon text-danger" data-zv-delete="' + item.id + '" type="button" title="删除生词">🗑️</button>' +
            '</div>' +
          '</div>' +
          '<div class="zv-card-body">' +
            '<div class="' + meaningClass + '" data-zv-reveal-id="' + item.id + '">' +
              (zhentiVocabHideChinese && !isRevealed ? '<span class="zv-blur-tip">👁️ 点击揭示释义</span>' : '') +
              '<div class="zv-meaning-text">' + escapeHtml(item.meaning) + '</div>' +
            '</div>' +
            sentHtml +
          '</div>' +
          '<div class="zv-card-footer">' +
            '<div class="zv-mastery-group">' +
              '<button class="zv-btn-mastery proficient ' + (isStProficient ? 'active' : '') + '" data-zv-id="' + item.id + '" data-zv-status="proficient" type="button">熟练 Z</button>' +
              '<button class="zv-btn-mastery vague ' + (isStVague ? 'active' : '') + '" data-zv-id="' + item.id + '" data-zv-status="vague" type="button">模糊 X</button>' +
              '<button class="zv-btn-mastery wrong ' + (isStWrong ? 'active' : '') + '" data-zv-id="' + item.id + '" data-zv-status="wrong" type="button">不会 C</button>' +
            '</div>' +
          '</div>' +
        '</article>';
      }).join('');
    } else {
      if (items.length === 0) {
        cardsHtml =
          '<div class="zv-empty-box">' +
            '<div class="zv-empty-icon">🗂️</div>' +
            '<div class="zv-empty-title">真题生词本目前为空</div>' +
            '<div class="zv-empty-desc">在【历年真题】文章或题目中点击任意英文单词，即可查看权威释义并一键“➕ 加入生词卡”，在此处集中复习与自测！</div>' +
            '<button class="english-btn primary" data-action="go-zhenti" type="button">👉 立即前往【历年真题】精读</button>' +
          '</div>';
      } else {
        cardsHtml = '<div class="section-empty">未找到符合筛选条件的真题生词。</div>';
      }
    }

    return '<div class="english-head">' +
        '<div class="english-title-box">' +
          '<h2>🗂️ 考研英语真题生词本</h2>' +
          '<div class="english-summary">' +
            '<span>熟练 <strong class="eng-stat-num stat-fam">' + counts.proficient + '</strong></span> · ' +
            '<span>模糊 <strong class="eng-stat-num stat-vag">' + counts.vague + '</strong></span> · ' +
            '<span>待攻克 / 不会 <strong class="eng-stat-num stat-wro">' + counts.wrong + '</strong></span> · ' +
            '<span>未标记 <strong>' + counts.unmarked + '</strong></span> · ' +
            '<span>总计 <strong>' + items.length + '</strong> 词</span>' +
          '</div>' +
        '</div>' +
        '<div class="english-head-actions">' +
          '<button class="english-action ' + (zhentiVocabHideChinese ? 'active' : '') + '" id="btnToggleZvChinese" type="button" title="切换隐藏/显示释义用于背词自测">' +
            (zhentiVocabHideChinese ? '👁️ 显示释义' : '🙈 遮盖释义（背词自测）') +
          '</button>' +
          '<button class="english-action english-back-btn" data-action="back" type="button">返回刷题</button>' +
        '</div>' +
      '</div>' +
      '<div class="zv-toolbar">' +
        '<div class="zv-filter-row">' +
          '<div class="zv-year-select-wrap">' +
            '<span class="zv-label">真题年份：</span>' +
            '<select id="zvYearSelect" class="zv-select">' + yearOptions + '</select>' +
          '</div>' +
          '<div class="zv-search-wrap">' +
            '<input id="zvSearchInput" class="zv-search-input" type="search" placeholder="🔍 搜索生词、释义或出处例句..." value="' + escapeHtml(zhentiVocabSearchQuery) + '" />' +
          '</div>' +
        '</div>' +
        '<div class="english-filter-chips">' + chipsHtml + '</div>' +
      '</div>' +
      '<div class="zv-cards-grid">' + cardsHtml + '</div>';
  }

  function bindZhentiVocabEvents() {
    var yrSelect = document.getElementById('zvYearSelect');
    if (yrSelect) {
      yrSelect.addEventListener('change', function () {
        zhentiVocabYearFilter = yrSelect.value;
        render();
      });
    }

    var searchEl = document.getElementById('zvSearchInput');
    if (searchEl) {
      searchEl.addEventListener('input', function (e) {
        zhentiVocabSearchQuery = e.target.value;
        clearTimeout(searchEl._t);
        searchEl._t = setTimeout(function () {
          render();
          var inputAfter = document.getElementById('zvSearchInput');
          if (inputAfter) {
            inputAfter.focus();
            inputAfter.selectionStart = inputAfter.selectionEnd = inputAfter.value.length;
          }
        }, 220);
      });
    }
  }

  // =========================================================================
  // 7. 视图导航与外层交互
  // =========================================================================
  function setBtnNavText(btnId, text) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    var navText = btn.querySelector('.nav-text');
    if (navText) {
      navText.textContent = text;
    }
  }

  function open() {
    if (typeof window.curSubjectId !== 'undefined' && window.curSubjectId !== 'english') {
      if (typeof window.switchSubject === 'function') {
        window.switchSubject('english');
        return;
      }
    }
    if (typeof window.setWorkbenchView === 'function') {
      window.setWorkbenchView('english');
    } else {
      var content = document.getElementById('mainAreaContent');
      if (content) content.style.display = 'none';
      var layout = document.querySelector('.app-layout');
      if (layout) layout.classList.add('english-mode');
      if (typeof window.setPracticeSidebarVisible === 'function') {
        window.setPracticeSidebarVisible(false);
      }
      panel.hidden = false;
    }

    setBtnNavText('btnEnglish', '返回刷题');
    render();
  }

  window.openEnglishVocabulary = open;

  function close() {
    if (typeof window.curSubjectId !== 'undefined' && window.curSubjectId === 'english') {
      if (typeof window.switchSubject === 'function') {
        window.switchSubject('shu1');
        return;
      }
    }
    if (typeof window.setWorkbenchView === 'function') {
      var currentView = typeof window.getWorkbenchView === 'function' ? window.getWorkbenchView() : 'english';
      if (currentView === 'english') {
        window.setWorkbenchView('practice');
      } else {
        panel.hidden = true;
      }
    } else {
      panel.hidden = true;
      var layout = document.querySelector('.app-layout');
      if (layout) layout.classList.remove('english-mode');
      var content = document.getElementById('mainAreaContent');
      if (content) content.style.display = '';
      if (typeof window.setPracticeSidebarVisible === 'function') {
        window.setPracticeSidebarVisible(true);
      }
    }

    setBtnNavText('btnEnglish', '考研英语');
    if (typeof window.renderTitle === 'function') {
      window.renderTitle();
    }
  }

  window.closeEnglishVocabulary = close;

  if (button) {
    button.addEventListener('click', function () {
      if (panel.hidden) open();
      else close();
    });
  }

  // =========================================================================
  // 8. 全局面板事件代理 (Delegation)
  // =========================================================================
  panel.addEventListener('click', function (event) {
    // 0. 点击段落中英文单词查看释义浮窗
    var wordEl = event.target.closest('.ez-word');
    if (wordEl) {
      event.stopPropagation();
      var clean = wordEl.getAttribute('data-word');
      showWordPopover(wordEl, clean);
      return;
    }

    // 0.1 点击写作真题大图打开查看
    var writingImg = event.target.closest('.ez-writing-img');
    if (writingImg) {
      event.stopPropagation();
      window.open(writingImg.src, '_blank');
      return;
    }

    // 点击其他非浮窗区域自动关闭浮窗
    if (!event.target.closest('.ez-word-popover')) {
      closeWordPopover();
    }

    var target = event.target.closest('button, .ez-pill, .ez-option, .ez-qnav-btn, .english-top-tab, .english-chip, .english-tab');

    // 1. 点击词汇自测释义（显示/隐藏）
    if (!target) {
      var meaningEl = event.target.closest('.english-meaning');
      if (meaningEl) {
        meaningEl.classList.toggle('revealed');
      }
      var zvMeaningEl = event.target.closest('.zv-meaning-box');
      if (zvMeaningEl && zvMeaningEl.dataset.zvRevealId) {
        var zvRId = zvMeaningEl.dataset.zvRevealId;
        revealedVocabIds[zvRId] = !revealedVocabIds[zvRId];
        render();
      }
      return;
    }

    // 2. 顶部主 Tab 切换 (真题 / 词汇)
    if (target.classList.contains('english-top-tab')) {
      var mainTab = target.dataset.mainTab;
      if (mainTab && mainTab !== activeMainTab) {
        activeMainTab = mainTab;
        localStorage.setItem(STORAGE_MAIN_TAB_KEY, activeMainTab);
        render();
      }
      return;
    }

    // 3. 通用返回刷题
    if (target.dataset.action === 'back') return close();

    // -----------------------------------------------------------------------
    // A. 历年真题事件分支
    // -----------------------------------------------------------------------
    if (activeMainTab === 'zhenti') {
      // (1) 切换模块分段 (Pill)
      if (target.classList.contains('ez-pill')) {
        var secId = parseInt(target.dataset.secId, 10);
        if (secId) {
          curSectionId = secId;
          localStorage.setItem(STORAGE_ZHENTI_SEC_KEY, String(curSectionId));
          activeQuestionId = null;
          render();
        }
        return;
      }

      // (2) 点击选项 (A/B/C/D)
      var optBtn = target.closest ? target.closest('.ez-option') : (target.classList.contains('ez-option') ? target : null);
      if (optBtn) {
        var qid = optBtn.dataset.qId;
        var optKey = optBtn.dataset.optKey;
        if (qid && optKey) {
          zhentiUserAnswers[qid] = optKey;
          saveStorageJson(STORAGE_ZHENTI_ANSWERS_KEY, zhentiUserAnswers);
          activeQuestionId = qid;
          render();
        }
        return;
      }

      // (3) 点击 5 级掌握度状态按钮
      if (target.classList.contains('ez-btn-mastery')) {
        var mQid = target.dataset.qId;
        var mStatus = target.dataset.status;
        if (mQid && mStatus) {
          var prev = zhentiStatuses[mQid] || '';
          var next = prev === mStatus ? '' : mStatus;
          if (next) zhentiStatuses[mQid] = next;
          else delete zhentiStatuses[mQid];

          saveStorageJson(STORAGE_ZHENTI_STATUS_KEY, zhentiStatuses);
          activeQuestionId = mQid;

          // 接入全局统计与掌握度图表
          if (next && next !== prev && window.StudyAnalytics && typeof window.StudyAnalytics.recordStatus === 'function') {
            window.StudyAnalytics.recordStatus({
              group: 'english',
              subjectId: 'english',
              chapterId: 'zhenti_' + curYear,
              itemKey: mQid,
              status: next,
              source: 'mark'
            });
          }

          render();
        }
        return;
      }

      // (4) 显示 / 隐藏解析
      if (target.dataset.action === 'toggleExp') {
        var expQid = target.dataset.qId;
        if (expQid) {
          expandedExplanations[expQid] = !expandedExplanations[expQid];
          activeQuestionId = expQid;
          render();
        }
        return;
      }

      // (5) 题目笔记 (编辑 / 保存)
      if (target.dataset.noteAction) {
        var noteQid = target.dataset.qId;
        var noteAction = target.dataset.noteAction;
        if (noteQid) {
          if (noteAction === 'edit') {
            editingNotes[noteQid] = true;
            render();
          } else if (noteAction === 'save') {
            var input = document.getElementById('noteInput_' + noteQid);
            if (input) {
              var noteVal = input.value.trim();
              if (noteVal) zhentiNotes[noteQid] = noteVal;
              else delete zhentiNotes[noteQid];
              saveStorageJson(STORAGE_ZHENTI_NOTES_KEY, zhentiNotes);
            }
            delete editingNotes[noteQid];
            render();
          }
        }
        return;
      }

      // (6) 点击 Q-Nav 题号快速滚动定位
      if (target.classList.contains('ez-qnav-btn')) {
        var navQid = target.dataset.qId;
        if (navQid) {
          activeQuestionId = navQid;
          var qCard = document.getElementById('qcard_' + navQid);
          if (qCard) {
            panel.querySelectorAll('.ez-question-card').forEach(function (c) { c.classList.remove('is-active'); });
            panel.querySelectorAll('.ez-qnav-btn').forEach(function (b) { b.classList.remove('is-active'); });
            qCard.classList.add('is-active');
            target.classList.add('is-active');
            qCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
        return;
      }
    }

    // -----------------------------------------------------------------------
    // B. 真题生词本事件分支
    // -----------------------------------------------------------------------
    if (activeMainTab === 'zhentiVocab') {
      if (target.dataset.zvFilter) {
        zhentiVocabStatusFilter = target.dataset.zvFilter;
        return render();
      }

      if (target.id === 'btnToggleZvChinese') {
        zhentiVocabHideChinese = !zhentiVocabHideChinese;
        return render();
      }

      var zvRevEl = target.closest('[data-zv-reveal-id]');
      if (zvRevEl) {
        var revId = zvRevEl.dataset.zvRevealId;
        revealedVocabIds[revId] = !revealedVocabIds[revId];
        return render();
      }

      if (target.dataset.zvAudioWord) {
        speakWord(target.dataset.zvAudioWord);
        return;
      }

      if (target.dataset.zvEditMeaning) {
        var editItem = zhentiVocabData.items.find(function (x) { return x.id === target.dataset.zvEditMeaning; });
        if (editItem) {
          var newM = window.prompt('编辑汉语释义：', editItem.meaning || '');
          if (newM !== null) {
            editItem.meaning = cleanText(newM);
            saveZhentiVocabData();
            render();
          }
        }
        return;
      }

      if (target.dataset.zvDelete) {
        if (window.confirm('确认从【真题生词本】中移除该生词？')) {
          zhentiVocabData.items = zhentiVocabData.items.filter(function (x) { return x.id !== target.dataset.zvDelete; });
          saveZhentiVocabData();
          render();
        }
        return;
      }

      if (target.dataset.zvStatus) {
        var zvId = target.dataset.zvId;
        var zvStatus = target.dataset.zvStatus;
        var zvItem = zhentiVocabData.items.find(function (x) { return x.id === zvId; });
        if (zvItem) {
          var prevZv = zvItem.status || '';
          var nextZv = (prevZv === zvStatus) ? '' : zvStatus;
          zvItem.status = nextZv;
          saveZhentiVocabData();

          if (nextZv && nextZv !== prevZv && window.StudyAnalytics && typeof window.StudyAnalytics.recordStatus === 'function') {
            window.StudyAnalytics.recordStatus({
              group: 'english',
              subjectId: 'english',
              chapterId: 'zhenti_vocab',
              itemKey: zvItem.id,
              status: nextZv,
              source: 'mark'
            });
          }
          render();
        }
        return;
      }

      if (target.dataset.action === 'go-zhenti') {
        activeMainTab = 'zhenti';
        localStorage.setItem(STORAGE_MAIN_TAB_KEY, activeMainTab);
        return render();
      }
    }

    // -----------------------------------------------------------------------
    // C. 词汇模块事件分支
    // -----------------------------------------------------------------------
    if (activeMainTab === 'vocab') {
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
        return renderVocabListOnly();
      }

      if (target.dataset.addUnder) {
        var extra = cleanText(window.prompt('添加到这条词汇下（用 · 或逗号分隔多个词，例如：term1, term2）', ''));
        var parent = vocabData.items.find(function (item) { return item.id === target.dataset.addUnder; });
        if (parent && extra) {
          parent.group = [parent.group || parent.text, extra.split(/[，,·、]/).map(cleanText).filter(Boolean).join(' · ')].filter(Boolean).join(' · ');
          saveVocabData();
          render();
        }
        return;
      }

      if (target.dataset.editMeaning) {
        var targetItem = vocabData.items.find(function (item) { return item.id === target.dataset.editMeaning; });
        if (targetItem) {
          var newMeaning = window.prompt('编辑汉语释义：', targetItem.meaning || '');
          if (newMeaning !== null) {
            targetItem.meaning = cleanText(newMeaning);
            saveVocabData();
            render();
          }
        }
        return;
      }

      if (target.dataset.delete) {
        if (window.confirm('确认删除这条词汇？')) {
          vocabData.items = vocabData.items.filter(function (item) { return item.id !== target.dataset.delete; });
          saveVocabData();
          render();
        }
        return;
      }

      if (target.dataset.status) {
        var stItem = vocabData.items.find(function (entry) {
          return entry.id === target.dataset.id;
        });

        if (stItem) {
          var previousStatus = stItem.status || '';
          var nextStatus = previousStatus === target.dataset.status ? '' : target.dataset.status;

          stItem.status = nextStatus;
          saveVocabData();

          if (nextStatus && nextStatus !== previousStatus && window.StudyAnalytics && typeof window.StudyAnalytics.recordStatus === 'function') {
            window.StudyAnalytics.recordStatus({
              group: 'english',
              subjectId: 'english',
              chapterId: 'vocabulary',
              itemKey: stItem.id,
              status: nextStatus,
              source: 'mark'
            });
          }

          render();
        }
      }
    }
  });

  // 翻译与写作草稿自动保存；仅更新计数，不整页重绘，避免输入光标跳动。
  panel.addEventListener('input', function (event) {
    var draftInput = event.target.closest('[data-draft-id]');
    if (!draftInput) return;
    var draftId = draftInput.dataset.draftId;
    if (!draftId) return;
    zhentiDrafts[draftId] = draftInput.value;
    saveStorageJson(STORAGE_ZHENTI_DRAFTS_KEY, zhentiDrafts);
    var countTarget = draftInput.dataset.countTarget;
    var countEl = countTarget ? document.getElementById(countTarget) : null;
    if (countEl) {
      countEl.textContent = draftId.indexOf('writing_') === 0
        ? countEnglishWords(draftInput.value) + ' words'
        : draftInput.value.length + ' 字';
    }
  });

  // 词汇添加表单提交
  panel.addEventListener('submit', function (event) {
    if (event.target.id !== 'englishForm') return;
    event.preventDefault();
    var input = document.getElementById('englishInput');
    var rawText = cleanText(input.value);
    if (!rawText) return;

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

    var cat = ({
      phrases: '常见词组',
      mistakes: '易错词',
      meanings: '熟词生义',
      synonyms: '同义词'
    })[activeType] || '自定义';

    vocabData.items.unshift({
      id: uid(),
      type: activeType,
      text: primary,
      group: group,
      meaning: cnPart,
      category: cat,
      status: '',
      custom: true
    });
    saveVocabData();
    input.value = '';
    render();
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.ez-word') && !e.target.closest('.ez-word-popover')) {
      closeWordPopover();
    }
  });

  // =========================================================================
  // 9. 键盘快捷键监听 (Space / Z / X / C / A-D)
  // =========================================================================
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeWordPopover();
    }
    if (panel.hidden || activeMainTab !== 'zhenti') return;
    var tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    var curSec = getCurrentSection();
    if (!curSec || !curSec.questions || !curSec.questions.length) return;
    var questions = curSec.questions;

    // 默认选取当前激活的题目或第一题
    var targetQ = questions.find(function (q) { return q.id === activeQuestionId; }) || questions[0];
    if (!targetQ) return;

    var key = e.key.toUpperCase();

    // 1. 空格键：展开 / 收起解析
    if (e.code === 'Space') {
      e.preventDefault();
      expandedExplanations[targetQ.id] = !expandedExplanations[targetQ.id];
      render();
      var cardEl = document.getElementById('qcard_' + targetQ.id);
      if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 2. 掌握度标记快捷键 (Z/X/C)
    var statusMap = { 'Z': 'proficient', 'X': 'vague', 'C': 'wrong' };
    if (statusMap[key]) {
      e.preventDefault();
      var targetStatus = statusMap[key];
      var curSt = zhentiStatuses[targetQ.id] || '';
      var nextSt = curSt === targetStatus ? '' : targetStatus;
      if (nextSt) zhentiStatuses[targetQ.id] = nextSt;
      else delete zhentiStatuses[targetQ.id];

      saveStorageJson(STORAGE_ZHENTI_STATUS_KEY, zhentiStatuses);
      render();
      return;
    }

    // 3. 做题选项选择 (1/2/3/4 或 A/B/C/D)
    var optMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D', 'A': 'A', 'B': 'B', 'D': 'D' };
    // 注意 C 键优先作为 "不会"，若用户按 Shift+C 或 3 映射到 C
    if (e.key === '3') optMap['3'] = 'C';

    if (optMap[e.key] || optMap[key]) {
      var chosenOpt = optMap[e.key] || optMap[key];
      if (chosenOpt && targetQ.options && targetQ.options.some(function (o) { return o.key === chosenOpt; })) {
        e.preventDefault();
        zhentiUserAnswers[targetQ.id] = chosenOpt;
        saveStorageJson(STORAGE_ZHENTI_ANSWERS_KEY, zhentiUserAnswers);
        render();
        return;
      }
    }

    // 4. J / K 或 上下方向键切换当前激活题目
    if (key === 'J' || e.code === 'ArrowDown') {
      e.preventDefault();
      var curIdx = questions.findIndex(function (q) { return q.id === targetQ.id; });
      var nextIdx = (curIdx + 1) % questions.length;
      activeQuestionId = questions[nextIdx].id;
      render();
      var nextCard = document.getElementById('qcard_' + activeQuestionId);
      if (nextCard) nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (key === 'K' || e.code === 'ArrowUp') {
      e.preventDefault();
      var cIdx = questions.findIndex(function (q) { return q.id === targetQ.id; });
      var pIdx = (cIdx - 1 + questions.length) % questions.length;
      activeQuestionId = questions[pIdx].id;
      render();
      var prevCard = document.getElementById('qcard_' + activeQuestionId);
      if (prevCard) prevCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
  });

})();
