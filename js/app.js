
    // ===== 章节数据（已移至 js/chapters.js）=====

    let curSubjectId = 'shu1';
    let curSubject = SUBJECTS[0];
    let CHAPTERS = curSubject.chapters;   // 当前科目章节数组（原 const 改 let，切换科目时重赋值）
    function getCurrentSubject() { return curSubject; }
// ===== 状态变量 (0-based) =====
    let currentChapterId = 'ch1';
    let current = 0;
    let appBootToken = 0;
    // 解析默认保持隐藏，避免切题时遮挡刷题区域。
    let showSolution = false;
    let defaultShowSolution = false;
    let statuses = {};
    let qBad = {};   // R键：题目图不达标  { idx: true }
    let sBad = {};   // T键：解析图不达标  { idx: true }
    let currentFilters = new Set(['all']);
    let subMode = false; // F键：小题选择模式（仅当前题组含子题时生效）
    let visualRows = []; // W/S 视觉行映射，每个元素是一个数组包含该行的 group.startIdx

    function isAllFilterActive() {
      return currentFilters.has('all') || currentFilters.size === 0;
    }

    function getChapter() { return CHAPTERS.find(c => c.id === currentChapterId); }
    function chapterById(id) { return CHAPTERS.find(c => c.id === id); }

    // ===== 合并章节（1000题并入30讲/36讲）辅助 =====
    // 当前索引所属分区：idx 落在合并章节的 1000题 段 → '1000题'；否则按标签分类
    function partOfIdx(idx) {
      const ch = getChapter();
      if (ch && ch.q1000Total && idx >= ch.ownTotal) return '1000题';
      return classifyLabel(ch ? ch.labels[idx] : '');
    }
    // 笔记命名空间键：避免「30讲例1-1」与「1000题1-1」笔记键冲突。
    // 返回 '<源章节id>::<标签>'，源章节 = 1000题伴章（1000段）或本章（自身段）。
    function notesKeyFor(idx) {
      const ch = getChapter();
      const label = ch.labels[idx];
      if (ch.q1000Total && idx >= ch.ownTotal) {
        return chapterById(ch.q1000Id).id + '::' + label;
      }
      return ch.id + '::' + label;
    }

    // ===== 题组（父题/子题）解析 =====
    // 去掉 label 末尾括号及内容（支持 (1)、(a)、(I)、全角括号），得到父题号
    function stripSubSuffix(label) { return String(label).replace(/\s*[\(（][^\)）]*[\)）]\s*$/, ''); }
    // 提取 label 末尾括号内容，如 '3-4(1)' -> '(1)'；无括号返回原 label
    function subSuffix(label) { const m = String(label).match(/[\(（][^\)）]*[\)）]\s*$/); return m ? m[0].trim() : String(label); }

    // 为章节计算 subGroups / groupForIdx（懒计算，缓存在章节对象上）
    function ensureGroups(ch) {
      if (ch.subGroups && ch.groupForIdx) return;
      const labels = ch.labels || [];
      const groups = [];
      let i = 0;
      while (i < labels.length) {
        const parent = stripSubSuffix(labels[i]);
        const hasParen = parent !== labels[i];
        let j = i + 1;
        if (hasParen) {
          while (j < labels.length && stripSubSuffix(labels[j]) === parent && stripSubSuffix(labels[j]) !== labels[j]) j++;
        }
        groups.push({ parentLabel: parent, startIdx: i, count: j - i, isParent: hasParen && (j - i) > 1 });
        i = j;
      }
      ch.subGroups = groups;
      ch.groupForIdx = new Array(labels.length);
      groups.forEach(g => { for (let k = 0; k < g.count; k++) ch.groupForIdx[g.startIdx + k] = g; });
    }

    // 题组内当前筛选下可见的索引列表
    // filteredSet 可传入预计算的筛中索引集合，避免在 renderNav 等热路径中反复调用 getFilteredIndices()。
    // 传入 null 且当前为「全部」筛选时，直接返回整组（跳过 Set 构建）。
    function groupVisibleIndices(g, filteredSet) {
      if (!filteredSet) {
        if (isAllFilterActive()) {
          return Array.from({ length: g.count }, (_, k) => g.startIdx + k);
        }
        filteredSet = new Set(getFilteredIndices());
      }
      const out = [];
      for (let k = 0; k < g.count; k++) { const idx = g.startIdx + k; if (filteredSet.has(idx)) out.push(idx); }
      return out;
    }
    const APP_MODE = 'local';
    const LOCAL_USER_ID = 'guest';

    function safeStorageGet(key) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('[storage] get failed', key, error);
        return null;
      }
    }

    function safeStorageSet(key, value) {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('[storage] set failed (可能配额已满):', key, error);
        var statusNode = document.getElementById('syncStatus');
        if (statusNode) {
          statusNode.textContent = '本地存储空间不足，请导出备份';
          statusNode.classList.add('is-error');
        }
        return false;
      }
    }

    function safeStorageRemove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.warn('[storage] remove failed', key, error);
        return false;
      }
    }

    async function computeSha256(str) {
      if (window.crypto && window.crypto.subtle && window.TextEncoder) {
        try {
          const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
          return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {}
      }
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0;
      }
      return 'fallback_' + Math.abs(h).toString(16);
    }

    function getSignedInUserId() {
      return LOCAL_USER_ID;
    }
    function userStoragePrefix() {
      const uid = getSignedInUserId();
      return uid ? 'user_' + uid + '_' : '';
    }
    function storageKey() { return userStoragePrefix() + currentChapterId + '_' + curSubject.storageSuffix + '_status'; }
    function qBadStorageKey() { return userStoragePrefix() + currentChapterId + '_' + curSubject.storageSuffix + '_qbad'; }
    function sBadStorageKey() { return userStoragePrefix() + currentChapterId + '_' + curSubject.storageSuffix + '_sbad'; }
    function chapterStatusKey(ch) { return userStoragePrefix() + ch.id + '_' + curSubject.storageSuffix + '_status'; }
    function safeSetItem(k, v) {
      safeStorageSet(k, v);
    }
    function totalQuestions() { return getChapter().total; }

    // ===== 筛选相关 =====
    function updateFilterButtons() {
      document.querySelectorAll('.filter-btn').forEach(b => {
        const active = currentFilters.has(b.dataset.filter);
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }

    function applyFilter(filterKey) {
      // 状态筛选为单选：点击任意项立即切换，不叠加多个条件。
      currentFilters = new Set([filterKey]);
      updateFilterButtons();
      saveGlobalFilters(); // 筛选状态持久化（跨会话记忆）
      const filtered = getFilteredIndices();
      updateFilterCounts();
      if (filtered.length > 0 && !isFiltered(current)) {
        switchTo(filtered[0]);
      } else {
        renderNav();
      }
    }

    function getFilteredIndices() {
      const ch = getChapter();
      const all = Array.from({ length: ch.total }, function(_, i) { return i; });
      if (isAllFilterActive()) return all;
      return all.filter(function(i) {
        // 带笔记
        if (currentFilters.has('unmarked')) {
          if (notesData[notesKeyFor(i)] || hasQuestionImagesAnnotated(i)) return true;
        }
        const s = statuses[i] || '';
        // 合并筛选：熟练 = proficient(lv5) + familiar(lv4)
        if (currentFilters.has('proficient') && (s === 'proficient' || s === 'familiar')) return true;
        // 模糊 = vague(lv3) + rusty(lv2)
        if (currentFilters.has('vague') && (s === 'vague' || s === 'rusty')) return true;
        // 不会 = wrong(lv1)
        if (currentFilters.has('wrong') && s === 'wrong') return true;
        return false;
      });
    }
    function filteredIndex(idx) { return getFilteredIndices().indexOf(idx); }
    function isFiltered(idx) { return filteredIndex(idx) !== -1; }

    // ===== localStorage 持久化（按书分离：合并章节的自身部分与1000题部分分开存取） =====
    // 合并章节（ch 有 q1000Id）：内存态 statuses/qBad/sBad 用合并索引承载，
    // 保存时按 [本章自身段, 1000题伴章段] 拆到两本书各自的存储键，加载时反向合并。
    // 非合并章节与现状完全一致（单一源）。→ 进度天然按书分开。
    function statusSources(ch) {
      ch = ch || getChapter();
      // 合并章节：自身段长度为 ownTotal；非合并章节用 total
      const srcs = [{ ch: ch, offset: 0, len: (ch.q1000Total ? ch.ownTotal : ch.total) }];
      if (ch && ch.q1000Id) {
        srcs.push({ ch: chapterById(ch.q1000Id), offset: ch.ownTotal, len: ch.q1000Total });
      }
      return srcs;
    }
    // 通用：按「源章节+偏移」拆合（statuses/qBad/sBad 共用）
    function loadIndexedObj(readRaw) {
      const out = {};
      statusSources().forEach(function (src) {
        let o = {};
        try { o = JSON.parse(readRaw(src.ch)) || {}; } catch (e) { o = {}; }
        for (var k = 0; k < src.len; k++) {
          if (o[k] !== undefined) out[src.offset + k] = o[k];
        }
      });
      return out;
    }
    function saveIndexedObj(obj, writeRaw, removeRaw) {
      statusSources().forEach(function (src) {
        const part = {};
        for (var k = 0; k < src.len; k++) {
          if (obj[src.offset + k] !== undefined) part[k] = obj[src.offset + k];
        }
        const keys = Object.keys(part);
        if (keys.length > 0) writeRaw(src.ch, JSON.stringify(part));
        else if (removeRaw) removeRaw(src.ch); // 空源不写、清掉残留空对象，保持存储干净
      });
    }
    function loadStatuses() {
      statuses = loadIndexedObj(function (ch) { return localStorage.getItem(chapterStatusKey(ch)); });
    }

    // 兼容今天下午旧版本的本地键名，并把已登录用户的云端状态回填到新版键名。
    // 新版不能因为改了 UI/命名空间就让既有刷题记录“消失”。
    function mergeStatus(targetKey, value) {
      if (!value || typeof value !== 'object') return;
      var current = {};
      try { current = JSON.parse(localStorage.getItem(targetKey) || '{}'); } catch (e) {}
      var changed = false;
      Object.keys(value).forEach(function (key) {
        if (current[key] === undefined && value[key]) { current[key] = value[key]; changed = true; }
      });
      if (changed) localStorage.setItem(targetKey, JSON.stringify(current));
    }
    // ===== 历史旧数据安全迁移与多账号选择 =====
    async function migrateHistoricalUserData() {
      // 1. 扫描 localStorage 中的所有历史命名空间
      var historicalUids = new Set();
      var hasLegacyUnprefixed = false;
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k) continue;
        var m = k.match(/^user_([a-zA-Z0-9-]+)_/);
        if (m) {
          var uid = m[1];
          if (uid !== 'guest' && uid !== 'migration') {
            historicalUids.add(uid);
          }
        } else if (
          k.indexOf('annot_') === 0 ||
          k.indexOf('sm2_') === 0 ||
          k === 'kaoyan_english_vocabulary_v2' ||
          k === 'kaoyan_resume' ||
          k === 'kaoyan_subject' ||
          k === 'ui_filters' ||
          k === 'kaoyan_ui_filters' ||
          k.indexOf('_status') !== -1 ||
          k.indexOf('_notes') !== -1
        ) {
          hasLegacyUnprefixed = true;
        }
      }

      var uidList = Array.from(historicalUids);
      var idemRaw = safeStorageGet('kaoyan_migration_idempotent_v2');
      if (idemRaw) {
        try {
          var idem = JSON.parse(idemRaw);
          if (idem && idem.schemaVersion >= 2) {
            // 已完成过标准迁移且无新待选历史 UID
            return;
          }
        } catch (e) {}
      }

      // 若检测到多个历史用户命名空间，必须提示选择，禁止静默合并
      if (uidList.length >= 2) {
        promptMigrationSelection(uidList, hasLegacyUnprefixed);
        return;
      }

      // 仅有单个历史 UID 或仅有旧无前缀键时，直接安全迁移
      var targetUid = uidList.length === 1 ? uidList[0] : null;
      await executeDataMigration(targetUid, hasLegacyUnprefixed);
    }

    function promptMigrationSelection(uidList, hasLegacyUnprefixed) {
      var modal = document.getElementById('migrationPickerModal');
      var listEl = document.getElementById('migrationAccountList');
      var btnConfirm = document.getElementById('btnConfirmMigration');
      var btnSkip = document.getElementById('btnSkipMigration');
      if (!modal || !listEl || !btnConfirm || !btnSkip) return;

      var selected = uidList[0];
      var html = '';
      uidList.forEach(function (uid, idx) {
        var count = 0;
        var bytes = 0;
        var prefix = 'user_' + uid + '_';
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf(prefix) === 0) {
            count++;
            var val = localStorage.getItem(k) || '';
            bytes += (k.length + val.length) * 2;
          }
        }
        var kb = (bytes / 1024).toFixed(1);
        html += '<label style="display:flex;align-items:center;gap:10px;padding:10px;border:1px solid var(--border);border-radius:8px;cursor:pointer">' +
          '<input type="radio" name="migrationUid" value="' + uid + '"' + (idx === 0 ? ' checked' : '') + '>' +
          '<div><div style="font-weight:600;color:var(--text)">账号：' + uid + '</div>' +
          '<div style="font-size:12px;color:var(--text-muted)">' + count + ' 条记录 · 约 ' + kb + ' KB</div></div>' +
          '</label>';
      });
      listEl.innerHTML = html;
      listEl.onchange = function (e) {
        if (e.target && e.target.name === 'migrationUid') {
          selected = e.target.value;
        }
      };

      modal.style.display = 'flex';
      modal.hidden = false;

      btnSkip.onclick = function () {
        modal.style.display = 'none';
        modal.hidden = true;
        safeStorageSet('kaoyan_migration_idempotent_v2', JSON.stringify({
          schemaVersion: 2,
          completedAt: new Date().toISOString(),
          skipped: true
        }));
      };

      btnConfirm.onclick = async function () {
        modal.style.display = 'none';
        modal.hidden = true;
        await executeDataMigration(selected, hasLegacyUnprefixed);
      };
    }

    async function executeDataMigration(sourceUid, includeLegacyUnprefixed) {
      // 1. 迁移前生成完整 JSON 备份，防止异常或空间超额
      var fullBackup = {
        schemaVersion: 2,
        appVersion: '2.1.0',
        createdAt: new Date().toISOString(),
        sourceOrigin: window.location.origin,
        keyCount: localStorage.length,
        storageData: {}
      };
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k) fullBackup.storageData[k] = localStorage.getItem(k);
      }
      var backupStr = JSON.stringify(fullBackup);
      fullBackup.checksum = await computeSha256(backupStr);
      safeStorageSet('kaoyan_migration_backup_' + Date.now(), JSON.stringify(fullBackup));

      var tmpPrefix = 'user_guest_migration_v2_tmp_';
      try {
        // 2. 将选定 UID 数据或无前缀数据提取并写入临时目标键
        var srcPrefix = sourceUid ? 'user_' + sourceUid + '_' : '';

        // 掌握度、笔记、SM-2、报错等
        SUBJECTS.forEach(function (subject) {
          subject.chapters.forEach(function (ch) {
            // 掌握度
            var targetStatusKey = 'user_guest_' + ch.id + '_' + subject.storageSuffix + '_status';
            var curStatus = {};
            try { curStatus = JSON.parse(safeStorageGet(targetStatusKey) || '{}'); } catch (e) {}
            var srcStatusCandidates = [];
            if (srcPrefix) {
              srcStatusCandidates.push(srcPrefix + ch.id + '_' + subject.storageSuffix + '_status');
            }
            if (includeLegacyUnprefixed) {
              srcStatusCandidates.push(ch.id + '_' + subject.storageSuffix + '_status');
              srcStatusCandidates.push(ch.id + '_status');
              srcStatusCandidates.push(ch.id + '_shu1_status');
            }
            srcStatusCandidates.forEach(function (sk) {
              var sVal = safeStorageGet(sk);
              if (sVal) {
                try {
                  var obj = JSON.parse(sVal);
                  Object.keys(obj).forEach(function (qIdx) {
                    if (curStatus[qIdx] === undefined && obj[qIdx]) curStatus[qIdx] = obj[qIdx];
                  });
                } catch (e) {}
              }
            });
            if (Object.keys(curStatus).length > 0) {
              safeStorageSet(tmpPrefix + targetStatusKey, JSON.stringify(curStatus));
            }

            // 笔记
            var targetNotesKey = 'user_guest_' + ch.id + '_' + subject.storageSuffix + '_notes';
            var curNotes = {};
            try { curNotes = JSON.parse(safeStorageGet(targetNotesKey) || '{}'); } catch (e) {}
            var srcNotesCandidates = [];
            if (srcPrefix) srcNotesCandidates.push(srcPrefix + ch.id + '_' + subject.storageSuffix + '_notes');
            if (includeLegacyUnprefixed) srcNotesCandidates.push(ch.id + '_' + subject.storageSuffix + '_notes');
            srcNotesCandidates.forEach(function (nk) {
              var nVal = safeStorageGet(nk);
              if (nVal) {
                try {
                  var nobj = JSON.parse(nVal);
                  Object.keys(nobj).forEach(function (qk) {
                    if (!curNotes[qk] && nobj[qk]) curNotes[qk] = nobj[qk];
                  });
                } catch (e) {}
              }
            });
            if (Object.keys(curNotes).length > 0) {
              safeStorageSet(tmpPrefix + targetNotesKey, JSON.stringify(curNotes));
            }

            // SM-2
            var targetSm2Key = 'user_guest_sm2_' + subject.id + '_' + ch.id;
            var curSm2 = {};
            try { curSm2 = JSON.parse(safeStorageGet(targetSm2Key) || '{}'); } catch (e) {}
            var srcSm2Candidates = [];
            if (srcPrefix) srcSm2Candidates.push(srcPrefix + 'sm2_' + subject.id + '_' + ch.id);
            if (includeLegacyUnprefixed) srcSm2Candidates.push('sm2_' + subject.id + '_' + ch.id);
            srcSm2Candidates.forEach(function (smk) {
              var smVal = safeStorageGet(smk);
              if (smVal) {
                try {
                  var smObj = JSON.parse(smVal);
                  Object.keys(smObj).forEach(function (qk) {
                    var sItem = smObj[qk];
                    var cItem = curSm2[qk];
                    if (!cItem || (sItem && sItem.updatedAt && (!cItem.updatedAt || sItem.updatedAt > cItem.updatedAt))) {
                      curSm2[qk] = sItem;
                    }
                  });
                } catch (e) {}
              }
            });
            if (Object.keys(curSm2).length > 0) {
              safeStorageSet(tmpPrefix + targetSm2Key, JSON.stringify(curSm2));
            }
          });
        });

        // 标注
        for (var l = 0; l < localStorage.length; l++) {
          var lk = localStorage.key(l);
          if (!lk) continue;
          if (srcPrefix && lk.indexOf(srcPrefix + 'annot_') === 0) {
            var rawAnnot = safeStorageGet(lk);
            var annotSub = lk.substring(srcPrefix.length);
            var tKey = 'user_guest_' + annotSub;
            if (!safeStorageGet(tKey) && rawAnnot) {
              safeStorageSet(tmpPrefix + tKey, rawAnnot);
            }
          } else if (includeLegacyUnprefixed && lk.indexOf('annot_') === 0 && lk.indexOf('user_') !== 0) {
            var srcRaw = safeStorageGet(lk);
            var srcK = normalizeAnnotSrc(lk.substring('annot_'.length));
            var tK = annotKey(srcK);
            if (!safeStorageGet(tK) && srcRaw) {
              safeStorageSet(tmpPrefix + tK, srcRaw);
            }
          }
        }

        // 英语词汇
        var targetEngKey = 'user_guest_kaoyan_english_vocabulary_v2';
        var engCandidates = [];
        if (srcPrefix) engCandidates.push(srcPrefix + 'kaoyan_english_vocabulary_v2');
        if (includeLegacyUnprefixed) engCandidates.push('kaoyan_english_vocabulary_v2');
        engCandidates.forEach(function (ek) {
          var eVal = safeStorageGet(ek);
          if (eVal) {
            try {
              var eObj = JSON.parse(eVal);
              if (eObj && Array.isArray(eObj.items) && !safeStorageGet(targetEngKey)) {
                safeStorageSet(tmpPrefix + targetEngKey, eVal);
              }
            } catch (e) {}
          }
        });

        // UI 偏好
        var uiKeys = ['ui_filters', 'kaoyan_ui_filters', 'kaoyan_resume', 'kaoyan_subject', 'kaoyan_review_session'];
        uiKeys.forEach(function (uk) {
          var targetUk = 'user_guest_' + uk.replace(/^kaoyan_/, '');
          var cand = [];
          if (srcPrefix) cand.push(srcPrefix + uk);
          if (includeLegacyUnprefixed) cand.push(uk);
          cand.forEach(function (k) {
            var uVal = safeStorageGet(k);
            if (uVal && !safeStorageGet(targetUk)) {
              safeStorageSet(tmpPrefix + targetUk, uVal);
            }
          });
        });

        // 3. 校验临时键并提交写入正式目标键
        var tmpKeys = [];
        for (var t = 0; t < localStorage.length; t++) {
          var tk = localStorage.key(t);
          if (tk && tk.indexOf(tmpPrefix) === 0) tmpKeys.push(tk);
        }
        tmpKeys.forEach(function (tk) {
          var actualTargetKey = tk.substring(tmpPrefix.length);
          var content = safeStorageGet(tk);
          if (content !== null) {
            safeStorageSet(actualTargetKey, content);
          }
          safeStorageRemove(tk); // 清理临时键
        });

        // 4. 源键严格只读保留，禁止 removeItem(sourceKey)
        // 5. 写入幂等完成标记
        safeStorageSet('kaoyan_migration_idempotent_v2', JSON.stringify({
          schemaVersion: 2,
          completedAt: new Date().toISOString(),
          sourceUid: sourceUid || 'legacy_unprefixed',
          checksum: fullBackup.checksum
        }));

        loadAnnotations();
      } catch (err) {
        console.error('[migration] 执行数据迁移失败，执行回滚:', err);
        // 清理所有残留临时键
        for (var r = 0; r < localStorage.length; r++) {
          var rk = localStorage.key(r);
          if (rk && rk.indexOf(tmpPrefix) === 0) safeStorageRemove(rk);
        }
      }
    }

    // ===== 完整学习记录导出与导入 =====
    async function exportFullStudyBackup(isSilentSnapshot) {
      var payload = {
        statuses: {},
        notes: {},
        annotations: {},
        sm2: {},
        qBad: {},
        sBad: {},
        resume: safeStorageGet('user_guest_kaoyan_resume') || null,
        english: safeStorageGet('user_guest_kaoyan_english_vocabulary_v2') || null,
        uiPreferences: {
          filters: safeStorageGet('user_guest_ui_filters') || null,
          subject: safeStorageGet('user_guest_kaoyan_subject') || null,
          mathSolutionPref: safeStorageGet('user_guest_math_ui_solution') || null,
          proSolutionPref: safeStorageGet('user_guest_professional_ui_solution') || null,
          reviewSession: safeStorageGet('user_guest_kaoyan_review_session') || null
        }
      };

      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (!k || k.indexOf('user_guest_') !== 0) continue;
        var val = safeStorageGet(k);
        if (!val) continue;
        if (k.endsWith('_status')) payload.statuses[k] = val;
        else if (k.endsWith('_notes')) payload.notes[k] = val;
        else if (k.indexOf('_annot_') !== -1) payload.annotations[k] = val;
        else if (k.indexOf('_sm2_') !== -1) payload.sm2[k] = val;
        else if (k.endsWith('_qbad')) payload.qBad[k] = val;
        else if (k.endsWith('_sbad')) payload.sBad[k] = val;
      }

      var exportObj = {
        schemaVersion: 2,
        appVersion: '2.1.0',
        exportedAt: new Date().toISOString(),
        sourceOrigin: window.location.origin,
        checksumAlgorithm: 'SHA-256',
        checksum: '',
        payload: payload
      };

      var payloadStr = JSON.stringify(payload);
      exportObj.checksum = await computeSha256(payloadStr);
      var jsonStr = JSON.stringify(exportObj, null, 2);

      if (isSilentSnapshot) {
        safeStorageSet('kaoyan_backup_before_overwrite_' + Date.now(), jsonStr);
        return jsonStr;
      }

      // 下载文件 kaoyan-tiku-backup-YYYY-MM-DD.json
      var blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      var d = new Date();
      var dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      var filename = 'kaoyan-tiku-backup-' + dateStr + '.json';
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
    }

    var _pendingImportObj = null;
    async function handleBackupFileSelected(file) {
      if (!file) return;
      try {
        var text = await file.text();
        var data = JSON.parse(text);
        if (!data || typeof data !== 'object' || !data.payload) {
          alert('文件格式错误：未检测到合法的题库备份数据');
          return;
        }
        if (data.schemaVersion && data.schemaVersion > 2) {
          alert('该备份来自更新版本的题库 (schemaVersion: ' + data.schemaVersion + ')，当前版本可能无法完全解析');
        }
        if (data.checksum && data.checksumAlgorithm === 'SHA-256') {
          var calcChecksum = await computeSha256(JSON.stringify(data.payload));
          if (calcChecksum !== data.checksum) {
            console.warn('[import] 校验码不匹配', calcChecksum, data.checksum);
          }
        }
        _pendingImportObj = data;

        // 计算导入概览
        var p = data.payload;
        var statusCount = Object.keys(p.statuses || {}).length;
        var notesCount = Object.keys(p.notes || {}).length;
        var annotCount = Object.keys(p.annotations || {}).length;
        var sm2Count = Object.keys(p.sm2 || {}).length;
        var englishCount = 0;
        try {
          var engObj = typeof p.english === 'string' ? JSON.parse(p.english) : p.english;
          if (engObj && Array.isArray(engObj.items)) englishCount = engObj.items.length;
        } catch (e) {}

        var summaryEl = document.getElementById('backupImportSummary');
        if (summaryEl) {
          summaryEl.innerHTML = '<b>备份导出时间：</b>' + (data.exportedAt || '未知') + '<br>' +
            '<b>包含数据项：</b><br>' +
            '• 章节进度记录：' + statusCount + ' 份<br>' +
            '• 题目笔记记录：' + notesCount + ' 份<br>' +
            '• 图片手绘标注：' + annotCount + ' 处<br>' +
            '• SM-2 复习规划：' + sm2Count + ' 份<br>' +
            '• 英语词汇记录：' + englishCount + ' 词';
        }

        var modal = document.getElementById('backupImportModal');
        if (modal) {
          modal.style.display = 'flex';
          modal.hidden = false;
        }
      } catch (err) {
        alert('读取备份文件失败：' + (err.message || err));
      }
    }

    async function applyImportPayload(mode) {
      var modal = document.getElementById('backupImportModal');
      if (modal) {
        modal.style.display = 'none';
        modal.hidden = true;
      }
      if (!_pendingImportObj || !_pendingImportObj.payload) return;
      var p = _pendingImportObj.payload;

      if (mode === 'overwrite') {
        // 覆盖前必须先自动生成一份当前数据备份并可供下载
        await exportFullStudyBackup(true);
        // 覆盖写入
        if (p.statuses) Object.keys(p.statuses).forEach(function (k) { safeStorageSet(k, p.statuses[k]); });
        if (p.notes) Object.keys(p.notes).forEach(function (k) { safeStorageSet(k, p.notes[k]); });
        if (p.annotations) Object.keys(p.annotations).forEach(function (k) { safeStorageSet(k, p.annotations[k]); });
        if (p.sm2) Object.keys(p.sm2).forEach(function (k) { safeStorageSet(k, p.sm2[k]); });
        if (p.qBad) Object.keys(p.qBad).forEach(function (k) { safeStorageSet(k, p.qBad[k]); });
        if (p.sBad) Object.keys(p.sBad).forEach(function (k) { safeStorageSet(k, p.sBad[k]); });
        if (p.resume) safeStorageSet('user_guest_kaoyan_resume', typeof p.resume === 'string' ? p.resume : JSON.stringify(p.resume));
        if (p.english) safeStorageSet('user_guest_kaoyan_english_vocabulary_v2', typeof p.english === 'string' ? p.english : JSON.stringify(p.english));
        if (p.uiPreferences) {
          if (p.uiPreferences.filters) safeStorageSet('user_guest_ui_filters', p.uiPreferences.filters);
          if (p.uiPreferences.subject) safeStorageSet('user_guest_kaoyan_subject', p.uiPreferences.subject);
        }
      } else {
        // 合并模式 (merge)：仅填补缺失或合并新词，不覆盖已有进度
        if (p.statuses) {
          Object.keys(p.statuses).forEach(function (k) {
            var cur = {};
            try { cur = JSON.parse(safeStorageGet(k) || '{}'); } catch (e) {}
            var imp = {};
            try { imp = JSON.parse(p.statuses[k] || '{}'); } catch (e) {}
            var changed = false;
            Object.keys(imp).forEach(function (idx) {
              if (cur[idx] === undefined && imp[idx]) { cur[idx] = imp[idx]; changed = true; }
            });
            if (changed) safeStorageSet(k, JSON.stringify(cur));
          });
        }
        if (p.notes) {
          Object.keys(p.notes).forEach(function (k) {
            var cur = {};
            try { cur = JSON.parse(safeStorageGet(k) || '{}'); } catch (e) {}
            var imp = {};
            try { imp = JSON.parse(p.notes[k] || '{}'); } catch (e) {}
            var changed = false;
            Object.keys(imp).forEach(function (qk) {
              if (!cur[qk] && imp[qk]) { cur[qk] = imp[qk]; changed = true; }
            });
            if (changed) safeStorageSet(k, JSON.stringify(cur));
          });
        }
        if (p.annotations) {
          Object.keys(p.annotations).forEach(function (k) {
            if (!safeStorageGet(k)) safeStorageSet(k, p.annotations[k]);
          });
        }
        if (p.sm2) {
          Object.keys(p.sm2).forEach(function (k) {
            var cur = {};
            try { cur = JSON.parse(safeStorageGet(k) || '{}'); } catch (e) {}
            var imp = {};
            try { imp = JSON.parse(p.sm2[k] || '{}'); } catch (e) {}
            var changed = false;
            Object.keys(imp).forEach(function (qk) {
              var sItem = imp[qk];
              var cItem = cur[qk];
              if (!cItem || (sItem && sItem.updatedAt && (!cItem.updatedAt || sItem.updatedAt > cItem.updatedAt))) {
                cur[qk] = sItem;
                changed = true;
              }
            });
            if (changed) safeStorageSet(k, JSON.stringify(cur));
          });
        }
        if (p.english) {
          try {
            var impEng = typeof p.english === 'string' ? JSON.parse(p.english) : p.english;
            var curEng = JSON.parse(safeStorageGet('user_guest_kaoyan_english_vocabulary_v2') || '{"items":[]}');
            if (impEng && Array.isArray(impEng.items)) {
              var curIds = new Set(curEng.items.map(function (it) { return it.id; }));
              var changed = false;
              impEng.items.forEach(function (it) {
                if (!curIds.has(it.id)) { curEng.items.push(it); changed = true; }
              });
              if (changed) safeStorageSet('user_guest_kaoyan_english_vocabulary_v2', JSON.stringify(curEng));
            }
          } catch (e) {}
        }
      }

      loadAnnotations();
      await initAppSession();
      alert(mode === 'overwrite' ? '已成功覆盖恢复学习记录！' : '已成功合并学习记录！');
    }
    function saveStatuses() {
      saveIndexedObj(statuses,
        function (ch, val) { 
          localStorage.setItem(chapterStatusKey(ch), val); 
        },
        function (ch) { 
          localStorage.removeItem(chapterStatusKey(ch)); 
        });
    }
    function loadQBad() {
      qBad = loadIndexedObj(function (ch) { return localStorage.getItem(userStoragePrefix() + ch.id + '_' + curSubject.storageSuffix + '_qbad'); });
    }
    function saveQBad() {
      saveIndexedObj(qBad,
        function (ch, val) { 
          localStorage.setItem(userStoragePrefix() + ch.id + '_' + curSubject.storageSuffix + '_qbad', val); 
        },
        function (ch) { 
          localStorage.removeItem(userStoragePrefix() + ch.id + '_' + curSubject.storageSuffix + '_qbad'); 
        });
    }
    function loadSBad() {
      sBad = loadIndexedObj(function (ch) { return localStorage.getItem(userStoragePrefix() + ch.id + '_' + curSubject.storageSuffix + '_sbad'); });
    }
    function saveSBad() {
      saveIndexedObj(sBad,
        function (ch, val) { 
          localStorage.setItem(userStoragePrefix() + ch.id + '_' + curSubject.storageSuffix + '_sbad', val); 
        },
        function (ch) { 
          localStorage.removeItem(userStoragePrefix() + ch.id + '_' + curSubject.storageSuffix + '_sbad'); 
        });
    }

    // ===== 全局 UI 状态持久化（跨会话记忆） =====
    // 全局键：状态筛选（跨章节/科目保持）；科目键：解析显示偏好（showSolution 当前态 + defaultShowSolution 默认态）
    // 均带用户前缀：换账号不串入他人筛选/偏好
    function globalUIFilterKey() { return userStoragePrefix() + 'ui_filters'; }
    function uiSolutionStorageKey() { return userStoragePrefix() + curSubjectId + '_ui_solution'; }

    function loadGlobalFilters() {
      var saved = null;
      try { saved = JSON.parse(localStorage.getItem(globalUIFilterKey())); } catch (e) { saved = null; }
      if (!saved || !Array.isArray(saved) || saved.length === 0) {
        currentFilters = new Set(['all']);
        return;
      }
      // 只保留合法筛选键；「全部」与其他组合互斥
      var valid = ['all', 'proficient', 'vague', 'wrong', 'unmarked'].filter(function (k) { return saved.indexOf(k) !== -1; });
      if (valid.indexOf('all') !== -1) currentFilters = new Set(['all']);
      else if (valid.length > 0) currentFilters = new Set(valid);
      else currentFilters = new Set(['all']);
    }
    function saveGlobalFilters() {
      try { localStorage.setItem(globalUIFilterKey(), JSON.stringify(Array.from(currentFilters))); } catch (e) {}
    }

    function loadSolutionPref() {
      var v = null;
      try { v = JSON.parse(localStorage.getItem(uiSolutionStorageKey())); } catch (e) { v = null; }
      // 兼容旧版无前缀键（shu1_ui_solution 等）：账号隔离改造后新键为空时回退读旧键，
      // 避免老用户解析显示偏好（默认显示/隐藏）在首次加载时丢失。
      if (!v) {
        var legacyKey = curSubjectId + '_ui_solution';
        if (legacyKey !== uiSolutionStorageKey()) {
          try { v = JSON.parse(localStorage.getItem(legacyKey)); } catch (e) { v = null; }
        }
      }
      if (v && typeof v.def === 'boolean') defaultShowSolution = v.def;
      else defaultShowSolution = false;
      if (v && typeof v.show === 'boolean') showSolution = v.show;
      else showSolution = defaultShowSolution;
    }
    function saveSolutionPref() {
      try { localStorage.setItem(uiSolutionStorageKey(), JSON.stringify({ show: !!showSolution, def: !!defaultShowSolution })); } catch (e) {}
    }

    // ===== 笔记数据（按书分离：复合键 '<源章节id>::<label>'） =====
    // 合并章节的 1000题 段笔记落到 1000题 伴章的存储对象（键 1-1），自身段落到本章对象（键 例1-1）。
    // 复合键含源章节 id，天然避免「30讲例1-1」与「1000题1-1」互相覆盖。
    let notesData = {};
    let notesDirty = false; // 笔记编辑态是否有未保存改动（用于切题/切章/切科目时自动保存）
    function notesSourceId(idx) {
      const ch = getChapter();
      if (ch.q1000Total && idx >= ch.ownTotal) return chapterById(ch.q1000Id).id;
      return ch.id;
    }
    function loadNotes() {
      autoSaveNotes(); // 重建前先保存未提交的编辑内容（覆盖 applyResumeBook 等直接调 loadNotes 的路径）
      const ch = getChapter();
      notesData = {};
      const srcIds = [ch.id];
      if (ch.q1000Id) srcIds.push(ch.q1000Id);
      srcIds.forEach(function (cid) {
        let o = {};
        try { o = JSON.parse(localStorage.getItem(userStoragePrefix() + cid + '_' + curSubject.storageSuffix + '_notes')) || {}; } catch (e) { o = {}; }
        for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) notesData[cid + '::' + k] = o[k]; }
      });
    }
    function saveNotes() {
      const ch = getChapter();
      const srcIds = [ch.id];
      if (ch.q1000Id) srcIds.push(ch.q1000Id);
      srcIds.forEach(function (cid) {
        const part = {};
        for (var k in notesData) {
          if (Object.prototype.hasOwnProperty.call(notesData, k) && k.indexOf(cid + '::') === 0) {
            part[k.substring(cid.length + 2)] = notesData[k];
          }
        }
        const key = userStoragePrefix() + cid + '_' + curSubject.storageSuffix + '_notes';
        const keys = Object.keys(part);
        if (keys.length > 0) {
          localStorage.setItem(key, JSON.stringify(part));
        } else {
          localStorage.removeItem(key); // 空源不写、清残留空对象
        }
      });
    }

    function getStatusClass(idx) {
      const s = statuses[idx];
      if (s === 'proficient') return 'proficient';
      if (s === 'familiar') return 'familiar';
      if (s === 'vague') return 'vague';
      if (s === 'rusty') return 'rusty';
      if (s === 'wrong') return 'wrong';
      return '';
    }

    // ===== 图片路径（按当前科目的 getImgPath） =====
        function getImgPath(idx) {
      const ch = getChapter();
      // 合并章节的 1000题 段：路径路由到 1000题 伴章（标签与目录均为 pb_ 前缀）
      if (ch.q1000Total && idx >= ch.ownTotal) {
        const qc = chapterById(ch.q1000Id);
        return curSubject.getImgPath(qc, qc.labels[idx - ch.ownTotal]);
      }
      return curSubject.getImgPath(ch, ch.labels[idx]);
    }


    // ===== 章节切换 =====
    function switchChapter(chapterId) {
      const ch = CHAPTERS.find(c => c.id === chapterId);
      if (!ch || ch.total === 0) { alert('该章节尚未导入'); return; }
      autoSaveNotes(); // 切章前保存未提交的笔记（loadNotes 会重建 notesData）
      currentChapterId = chapterId;
      current = 0;
      showSolution = defaultShowSolution;
      // 小题模式（F）是全局开关，切章不重置，跨章保持
      loadStatuses(); loadQBad(); loadSBad(); loadNotes(); loadSm2();
      // 每次切章先清除错题本返回状态（错题本跳题会在 switchTo 之后重新置位）
      showWrongBookReturnBtn(false);
      // 全局筛选跨章保持：不重置、不按章恢复，仅加载本章数据后定位到第一条筛中题
      updateFilterButtons();
      updateFilterCounts();
      // 优先恢复章节级停靠记录（切回某章回到上次停的题），再走定位逻辑。
      // 仅恢复位置，不恢复小题模式（全局开关由 F 控制，跨章保持）
      const chResume = loadChapterResume(ch.id);
      if (chResume) {
        current = chResume.idx;
        // 若全局筛选激活且恢复位置被筛掉，跳到第一条筛中题
        if (!isAllFilterActive()) {
          const filtered = getFilteredIndices();
          if (filtered.length > 0 && filtered.indexOf(current) === -1) current = filtered[0];
        }
        renderTitle();
        switchTo(current);
        return;
      }
      // 定位逻辑：无章节记忆时落在第一道可见题（源序第一条）。
      // 不再按 partOrder 跳到"第一分区第一个"——避免落到习题区导致按 A 跳回上一分区末尾。
      // partOrder 仅用于侧栏显示排序（renderNav），不影响切章落点。
      let target = 0;
      const filtered = getFilteredIndices();
      target = filtered.length > 0 ? filtered[0] : 0;
      renderTitle();
      // switchTo 内部已调用 renderStats + renderNav，此处不重复渲染
      switchTo(target);
    }

    function gotoPrevChapter() {
      let idx = CHAPTERS.findIndex(c => c.id === currentChapterId);
      for (let i = idx - 1; i >= 0; i--) { if (CHAPTERS[i].total > 0) { switchChapter(CHAPTERS[i].id); return; } }
    }
    function gotoNextChapter() {
      let idx = CHAPTERS.findIndex(c => c.id === currentChapterId);
      for (let i = idx + 1; i < CHAPTERS.length; i++) { if (CHAPTERS[i].total > 0) { switchChapter(CHAPTERS[i].id); return; } }
    }

    // ===== 章节标题栏（三级面板式下拉） =====
    function getUniqueWbs() {
      var wbs = [];
      CHAPTERS.forEach(function(c) { if (c.wb && wbs.indexOf(c.wb) === -1) wbs.push(c.wb); });
      return wbs;
    }

    // 关闭所有标题下拉面板
    function closeAllTitlePanels() {
      document.querySelectorAll('.title-trigger.open').forEach(function(t) { t.classList.remove('open'); });
      document.querySelectorAll('.title-panel.open').forEach(function(p) { p.classList.remove('open'); });
    }

    // 填充某个面板的选项
    function fillPanel(panelId, items, idKey, textKey, activeId, onClick) {
      var panel = document.getElementById(panelId);
      panel.innerHTML = '';
      items.forEach(function(item) {
        var btn = document.createElement('button');
        btn.className = 'title-option';
        if ((idKey ? item[idKey] : item) === activeId) btn.classList.add('active');
        btn.textContent = textKey ? item[textKey] : item;
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          closeAllTitlePanels();
          onClick(item);
        });
        panel.appendChild(btn);
      });
    }

    // 书籍展示名称 + 固定排序（按当前科目的 wbOrder）
    function getSortedWbs() {
      var existing = getUniqueWbs();
      var result = [];
      var order = curSubject ? curSubject.wbOrder : [];
      order.forEach(function(entry) {
        if (existing.indexOf(entry.wb) !== -1) result.push(entry);
      });
      return result;
    }

    // 填充书籍面板
    function fillWbPanel(activeWb) {
      var entries = getSortedWbs();
      fillPanel('panelWb', entries, 'wb', 'label', activeWb, function(entry) {
        document.getElementById('txtWb').textContent = entry.label;
        // 切书先尝试恢复该书的停靠位置；无记录才落到第一学科第一章节
        if (applyResumeBook(entry.wb)) return;
        var subjs = getSortedSubjs(entry.wb);
        if (subjs.length > 0) {
          var firstSubj = subjs[0];
          document.getElementById('txtSubj').textContent = firstSubj;
          fillSubjPanel(entry.wb, firstSubj);
          var firstCh = CHAPTERS.find(function(c) { return c.wb === entry.wb && c.subj === firstSubj; });
          if (firstCh) {
            document.getElementById('txtChapter').textContent = firstCh.short;
            fillChapterPanel(entry.wb, firstSubj, firstCh.id);
            switchChapter(firstCh.id);
          }
        }
      });
    }

    // 学科固定排序（按当前科目的 subjOrder）
    function getSortedSubjs(wb) {
      var subjs = [];
      CHAPTERS.forEach(function(c) { if (c.wb === wb && c.subj && subjs.indexOf(c.subj) === -1) subjs.push(c.subj); });
      var sorted = [];
      var order = curSubject ? curSubject.subjOrder : [];
      order.forEach(function(s) { if (subjs.indexOf(s) !== -1) sorted.push(s); });
      subjs.forEach(function(s) { if (sorted.indexOf(s) === -1) sorted.push(s); }); // 未列出的学科放末尾
      return sorted;
    }

    // 填充学科面板
    function fillSubjPanel(wb, activeSubj) {
      var subjs = getSortedSubjs(wb);
      fillPanel('panelSubj', subjs, null, null, activeSubj, function(subj) {
        document.getElementById('txtSubj').textContent = subj;
        var firstCh = CHAPTERS.find(function(c) { return c.wb === wb && c.subj === subj; });
        if (firstCh) {
          document.getElementById('txtChapter').textContent = firstCh.short;
          fillChapterPanel(wb, subj, firstCh.id);
          switchChapter(firstCh.id);
        }
      });
    }

    // 填充章节面板
    function fillChapterPanel(wb, subj, activeId) {
      var chs = CHAPTERS.filter(function(c) { return c.wb === wb && c.subj === subj; });
      fillPanel('panelChapter', chs, 'id', 'short', activeId, function(ch) {
        document.getElementById('txtChapter').textContent = ch.short;
        switchChapter(ch.id);
      });
    }

    function renderTitle() {
      var ch = getChapter();
      var wb = ch.wb || '';
      var subj = ch.subj || '';

      var wbLabel = getWbLabel(wb); // 按当前科目的 wbOrder 映射显示名
      document.getElementById('txtWb').textContent = wbLabel;
      document.getElementById('txtSubj').textContent = subj;
      document.getElementById('txtChapter').textContent = ch.short;

      fillWbPanel(wb);
      fillSubjPanel(wb, subj);
      fillChapterPanel(wb, subj, ch.id);

      // 学科下拉可见性：当前书籍仅一个学科时隐藏（标题栏只需 书籍+章节；
      // 数学各书有 高数/线代/概率论 三学科，保留学科下拉）
      var ddSubjEl = document.getElementById('ddSubj');
      if (ddSubjEl) ddSubjEl.style.display = getSortedSubjs(wb).length > 1 ? '' : 'none';
    }

    // 面板展开/收起 + 外部点击关闭
    (function () {
      document.addEventListener('DOMContentLoaded', function () {
        function togglePanel(ddId, trigId) {
          var trig = document.getElementById(trigId);
          var panel = document.getElementById(ddId.replace('dd', 'panel'));
          if (!trig || !panel) return;
          trig.addEventListener('click', function(e) {
            e.stopPropagation();
            // 复习中标题只读：不响应下拉点击（保留文本标签供查看书/模块/章节）
            if (reviewSession) return;
            var isOpen = panel.classList.contains('open');
            closeAllTitlePanels();
            if (!isOpen) {
              panel.classList.add('open');
              trig.classList.add('open');
            }
          });
        }
        togglePanel('ddWb', 'trigWb');
        togglePanel('ddSubj', 'trigSubj');
        togglePanel('ddChapter', 'trigChapter');
        togglePanel('ddWbWrongbook', 'trigWbWrongbook');

        document.addEventListener('click', function(e) {
          var openPanels = document.querySelectorAll('.title-panel.open');
          if (openPanels.length === 0) return;
          var inside = false;
          openPanels.forEach(function(p) { if (p.parentElement.contains(e.target)) inside = true; });
          if (!inside) closeAllTitlePanels();
        });
      });
    })();

    // ===== 自动分区：从 label 推断所属类别（按当前科目） =====
    // 合并章节（1000题并入）分区顺序为 例题 → 习题 → 1000题；其余章节用科目 partOrder
    function getPartOrder() {
      const ch = getChapter();
      if (ch && ch.q1000Total) return ['例题', '习题', '1000题'];
      return curSubject ? curSubject.partOrder : ['例题', '习题'];
    }

    function classifyLabel(label) {
      return curSubject ? curSubject.classifyLabel(label) : (label.startsWith('例') ? '例题' : '习题');
    }

    // ===== 渲染章节统计面板 =====
    // 合并章节（1000题并入）按书分两块统计：第1块=自身部分，第2块=1000题部分；
    // 进度分别累计，实现「进度按书分开」。非合并章节单块渲染（与现状一致）。
    function renderStats() {
      const ch = getChapter();
      const hasMerge = ch && ch.q1000Total;
      const segs = hasMerge
        ? [{ label: getWbLabel(ch.wb), start: 0, len: ch.ownTotal },
           { label: '1000题', start: ch.ownTotal, len: ch.q1000Total }]
        : [{ label: '', start: 0, len: ch.total }];
      const html = segs.map(function (seg) {
        let lv5 = 0, lv4 = 0, lv3 = 0, lv2 = 0, lv1 = 0, un = 0;
        for (let i = seg.start; i < seg.start + seg.len; i++) {
          const s = statuses[i];
          if (s === 'proficient') lv5++;
          else if (s === 'familiar') lv4++;
          else if (s === 'vague') lv3++;
          else if (s === 'rusty') lv2++;
          else if (s === 'wrong') lv1++;
          else un++;
        }
        const done = lv5 + lv4 + lv3 + lv2 + lv1;
        const pct = seg.len > 0 ? Math.round(done / seg.len * 100) : 0;
        return '<div class="stats-seg">' +
          (seg.label ? '<div class="stats-seg-label">' + seg.label + '</div>' : '') +
          '<div class="stats-bar-wrap"><div class="stats-bar-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="stats-counts">' +
            '<span><span class="sc-dot" style="background:#389E0D"></span>熟练 ' + lv5 + '</span>' +
            '<span><span class="sc-dot" style="background:#7CB305"></span>较熟 ' + lv4 + '</span>' +
            '<span><span class="sc-dot" style="background:#FBC02D"></span>模糊 ' + lv3 + '</span>' +
            '<span><span class="sc-dot" style="background:#F57C00"></span>困难 ' + lv2 + '</span>' +
            '<span><span class="sc-dot" style="background:#D32F2F"></span>不会 ' + lv1 + '</span>' +
            '<span><span class="sc-dot" style="background:#bbb"></span>未做 ' + un + '</span>' +
          '</div>' +
        '</div>';
      }).join('');
      document.getElementById('statsPanel').innerHTML = html;
    }


    // ===== 全局仪表盘（环形热力图） =====
    // 书籍列表按当前科目（数学 4 本），用 getSortedWbs()
    var dashboardOpen = false;
    // 全局进度处于详情视图时，用于「返回总览」按钮与鼠标后退键回总览
    var dashboardDetailReturn = false;

    function getBookChapters(wb, chapters) {
      // 第0讲（statsWb='1000题' 但 wb 已改 '基础30讲'）按 statsWb 归属统计书
      return (chapters || CHAPTERS).filter(function(c) { return (c.statsWb || c.wb) === wb && c.total > 0; });
    }

    function getChProgress(ch, subject) {
      var key = subject ? userStoragePrefix() + ch.id + '_' + subject.storageSuffix + '_status' : chapterStatusKey(ch);
      var statusObj;
      try { statusObj = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { statusObj = {}; }
      var done = 0;
      // 合并章节只统计自身部分（1000题部分由其伴章章对象统计）→ 进度按书分开
      var len = ch.ownTotal || ch.total;
      for (var i = 0; i < len; i++) {
        var s = statusObj[i];
        if (s === 'proficient' || s === 'familiar' || s === 'vague' || s === 'rusty' || s === 'wrong') done++;
      }
      return { progress: len > 0 ? done / len : 0, done: done, total: len };
    }

    function getChStats(ch) {
      var key = chapterStatusKey(ch);
      var statusObj;
      try { statusObj = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { statusObj = {}; }
      var lv5 = 0, lv4 = 0, lv3 = 0, lv2 = 0, lv1 = 0;
      var len = ch.ownTotal || ch.total;
      for (var i = 0; i < len; i++) {
        var s = statusObj[i];
        if (s === 'proficient') lv5++;
        else if (s === 'familiar') lv4++;
        else if (s === 'vague') lv3++;
        else if (s === 'rusty') lv2++;
        else if (s === 'wrong') lv1++;
      }
      var done = lv5 + lv4 + lv3 + lv2 + lv1;
      return {
        lv5: lv5, lv4: lv4, lv3: lv3, lv2: lv2, lv1: lv1,
        proficient: lv5 + lv4, vague: lv3 + lv2, wrong: lv1,
        unmarked: len - done, done: done,
        pct: len > 0 ? Math.round(done / len * 100) : 0
      };
    }

    function dbLerpColor(c1, c2, t) {
      return [
        Math.round(c1[0] + (c2[0] - c1[0]) * t),
        Math.round(c1[1] + (c2[1] - c1[1]) * t),
        Math.round(c1[2] + (c2[2] - c1[2]) * t)
      ];
    }

    function drawDonut(canvas, chapters, label, subject) {
      var ctx = canvas.getContext('2d');
      var dpr = window.devicePixelRatio || 1;
      var size = 260;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = size + 'px';
      canvas.style.height = size + 'px';
      ctx.scale(dpr, dpr);

      var cx = size / 2, cy = size / 2;
      var outerR = 108;
      var innerR = 28;
      var ringCount = chapters.length;
      if (ringCount === 0) {
        ctx.fillStyle = '#999';
        ctx.font = '14px "Microsoft YaHei",sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('(无数据)', cx, cy);
        return;
      }
      var ringWidth = (outerR - innerR) / ringCount;

      ctx.clearRect(0, 0, size, size);

      var purpleDark = [102, 8, 116];
      var purpleLight = [225, 190, 231];
      var totalDone = 0, totalQ = 0;

      // Inner to outer: inner ring = chapter 0 (第1讲), outer ring = last chapter
      for (var i = 0; i < ringCount; i++) {
        var ri = innerR + i * ringWidth;
        var ro = innerR + (i + 1) * ringWidth;
        var pr = getChProgress(chapters[i], subject);
        totalDone += pr.done;
        totalQ += pr.total;
        var p = pr.progress;
        var color = dbLerpColor(purpleLight, purpleDark, p);
        var cStr = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';

        // Filled arc (clockwise from top)
        ctx.beginPath();
        ctx.arc(cx, cy, ro, -Math.PI / 2, -Math.PI / 2 + p * 2 * Math.PI);
        ctx.arc(cx, cy, ri, -Math.PI / 2 + p * 2 * Math.PI, -Math.PI / 2, true);
        ctx.closePath();
        ctx.fillStyle = cStr;
        ctx.fill();

        // Unfilled arc
        if (p < 1) {
          ctx.beginPath();
          ctx.arc(cx, cy, ro, -Math.PI / 2 + p * 2 * Math.PI, -Math.PI / 2 + 2 * Math.PI);
          ctx.arc(cx, cy, ri, -Math.PI / 2 + 2 * Math.PI, -Math.PI / 2 + p * 2 * Math.PI, true);
          ctx.closePath();
          ctx.fillStyle = '#e8e8e8';
          ctx.fill();
        }
      }

      // Center circle with slight shadow
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, 2 * Math.PI);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Center text
      var pct = totalQ > 0 ? Math.round(totalDone / totalQ * 100) : 0;
      ctx.fillStyle = '#333';
      ctx.font = 'bold 12px "Microsoft YaHei","PingFang SC",sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy - 9);
      ctx.fillStyle = '#660874';
      ctx.font = 'bold 17px "Microsoft YaHei","PingFang SC",sans-serif';
      ctx.fillText(pct + '%', cx, cy + 11);
    }

    function setPanelTitle(text, wrongbookMode) {
      var bar = document.getElementById('chapterTitleBar');
      var panelTitle = document.getElementById('panelTitle');
      if (!bar || !panelTitle) return;
      var dropdowns = bar.querySelectorAll('.title-dropdown');
      if (text) {
        panelTitle.textContent = text;
        panelTitle.style.display = '';
        dropdowns.forEach(function(d) {
          if (wrongbookMode && d.id === 'ddWbWrongbook') d.style.display = ''; // 错题本模式保留书籍下拉
          else d.style.display = 'none';
        });
      } else {
        panelTitle.style.display = 'none';
        dropdowns.forEach(function(d) {
          if (d.id === 'ddWbWrongbook') d.style.display = 'none'; // 退出错题本模式隐藏书籍下拉
          else d.style.display = '';
        });
      }
    }

    function toggleDashboard() {
      dashboardOpen = !dashboardOpen;
      var panel = document.getElementById('dashboardPanel');
      var content = document.getElementById('mainAreaContent');
      var btn = document.getElementById('btnDashboard');
      if (dashboardOpen) {
        renderDashboardOverview();
        panel.style.display = '';
        content.style.display = 'none';
        setPanelTitle('全局学习进度');
        btn.innerHTML = '返回章节<span class="sol-key">V</span>';
        showWrongBookReturnBtn(false); // 打开全局进度时隐藏错题本返回按钮
        // 若错题本同时打开则关闭，避免两个面板重叠
        if (wrongBookOpen) {
          wrongBookOpen = false;
          document.getElementById('wrongBookPanel').style.display = 'none';
          document.getElementById('btnWrongBook').innerHTML = '错题本<span class="sol-key">B</span>';
        }
      } else {
        panel.style.display = 'none';
        content.style.display = '';
        showDashboardBackBtn(false);
        setPanelTitle('');
        renderTitle();
        btn.innerHTML = '全局进度<span class="sol-key">V</span>';
      }
    }

    function showDashboardBackBtn(show) {
      const btn = document.getElementById('btnBackDashboard');
      if (btn) {
        btn.style.display = show ? '' : 'none';
        if (show) alignBackBtnToMainArea(btn); // 显示时动态对齐下方图片区左缘
      }
      dashboardDetailReturn = show;
    }
    function backToDashboardOverview() {
      // 从详情视图回到全局进度总览
      renderDashboardOverview();
    }
    function renderDashboardOverview() {
      showDashboardBackBtn(false);
      document.getElementById('dbOverview').style.display = '';
      document.getElementById('dbDetail').style.display = 'none';

      // 1. 顶部 Hero 卡片打招呼与时间段判断
      var hour = new Date().getHours();
      var greeting = '早上好';
      if (hour >= 11 && hour < 14) greeting = '中午好';
      else if (hour >= 14 && hour < 18) greeting = '下午好';
      else if (hour >= 18 || hour < 5) greeting = '晚上好';
      var heroGreeting = document.getElementById('heroGreeting');
      if (heroGreeting) heroGreeting.textContent = greeting + '，开始高效学习吧';

      // 2. 统计所有科目的真实学习数据（完成题数、错题数、总题数、SM-2 待复习数、连续打卡天数）
      var totalDone = 0;
      var totalWrong = 0;
      var grandTotal = 0;
      var totalDue = 0;
      var datesSet = new Set();
      var nowTime = Date.now();

      SUBJECTS.forEach(function (subject) {
        var chs = (subject.chapters || []).filter(function (c) { return !c.q1000Id; });
        chs.forEach(function (c) {
          var st = getChStats(c, subject);
          totalDone += (st.done || 0);
          totalWrong += (st.wrong || 0);
          grandTotal += (c.total || 0);

          // 读取 SM-2 复习记录
          var sKey = userStoragePrefix() + 'sm2_' + subject.id + '_' + c.id;
          try {
            var sm = JSON.parse(localStorage.getItem(sKey) || '{}');
            Object.keys(sm).forEach(function (k) {
              var item = sm[k];
              if (!item) return;
              if (item.nextReview && item.nextReview <= nowTime) {
                totalDue++;
              }
              if (item.lastReview) {
                datesSet.add(new Date(item.lastReview).toLocaleDateString('en-CA'));
              }
              if (Array.isArray(item.history)) {
                item.history.forEach(function (h) {
                  if (h && h.date) datesSet.add(new Date(h.date).toLocaleDateString('en-CA'));
                });
              }
            });
          } catch (e) {}
        });
      });

      // 计算连续打卡天数（从今天或昨天往前回溯）
      var streak = 0;
      var checkDate = new Date();
      var checkStr = checkDate.toLocaleDateString('en-CA');
      if (!datesSet.has(checkStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = checkDate.toLocaleDateString('en-CA');
      }
      while (datesSet.has(checkStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
        checkStr = checkDate.toLocaleDateString('en-CA');
      }

      // 3. 填充 Hero 卡片与 4 个真实指标卡
      var totalPct = grandTotal > 0 ? Math.round((totalDone / grandTotal) * 100) : 0;
      var heroDueCount = document.getElementById('heroDueCount');
      var heroTotalPct = document.getElementById('heroTotalPct');
      var heroRingVal = document.getElementById('heroRingVal');
      if (heroDueCount) heroDueCount.textContent = totalDue;
      if (heroTotalPct) heroTotalPct.textContent = totalPct + '%';
      if (heroRingVal) heroRingVal.textContent = totalPct + '%';

      var dbStatDue = document.getElementById('dbStatDue');
      var dbStatDone = document.getElementById('dbStatDone');
      var dbStatWrong = document.getElementById('dbStatWrong');
      var dbStatStreak = document.getElementById('dbStatStreak');
      if (dbStatDue) dbStatDue.textContent = totalDue;
      if (dbStatDone) dbStatDone.textContent = totalDone;
      if (dbStatWrong) dbStatWrong.textContent = totalWrong;
      if (dbStatStreak) dbStatStreak.textContent = (streak > 0 ? streak : (totalDone > 0 ? 1 : 0)) + ' 天';

      // 4. 填充右列 Widget 说明文本
      var widgetReviewPlan = document.getElementById('widgetReviewPlan');
      if (widgetReviewPlan) {
        widgetReviewPlan.textContent = totalDue > 0
          ? ('今日有 ' + totalDue + ' 道题目到期待复习，建议趁热打铁温习！')
          : '今日暂无到期复习题目，记忆状态极佳！';
      }
      var widgetWrongPlan = document.getElementById('widgetWrongPlan');
      if (widgetWrongPlan) {
        widgetWrongPlan.textContent = totalWrong > 0
          ? ('累计收录 ' + totalWrong + ' 道错题，点击前往逐个攻克。')
          : '目前还没有标记为不会的错题，继续保持！';
      }

      var grid = document.getElementById('dbGrid');
      var html = '';
      // 总进度必须跨科目展示，不能只显示当前正在刷的那本书。
      var books = [];
      SUBJECTS.forEach(function (subject) {
        (subject.wbOrder || []).forEach(function (book) {
          if (getBookChapters(book.wb, subject.chapters).length) {
            books.push({ wb: book.wb, label: book.label, subject: subject });
          }
        });
      });
      // 英语不是题目章节，但同样纳入全局进度，避免学习记录被遗漏。
      // 键与 english.js 一致：带用户前缀。
      try {
        var engPrefix = 'user_guest_';
        var english = JSON.parse(localStorage.getItem(engPrefix + 'kaoyan_english_vocabulary_v2') || '{"items":[]}');
        var words = Array.isArray(english.items) ? english.items : [];
        var ec = { familiar: 0, vague: 0, wrong: 0 };
        words.forEach(function (word) { if (ec[word.status] !== undefined) ec[word.status]++; });
        var done = ec.familiar + ec.vague + ec.wrong;
        var empty = Math.max(0, words.length - done);
        var ring = 'conic-gradient(#22a06b 0 ' + (words.length ? ec.familiar / words.length * 100 : 0) + '%,#f59e0b 0 ' + (words.length ? (ec.familiar + ec.vague) / words.length * 100 : 0) + '%,#e05252 0 ' + (words.length ? (ec.familiar + ec.vague + ec.wrong) / words.length * 100 : 0) + '%,#d7dde5 0 100%)';
        html += '<div class="db-donut-card" data-action="english"><div style="width:150px;height:150px;margin:0 auto;border-radius:50%;background:' + ring + ';display:grid;place-items:center"><div style="width:108px;height:108px;border-radius:50%;background:#fff;display:grid;place-items:center;text-align:center"><b>' + done + '/' + words.length + '</b><small>英语词汇</small></div></div><div style="text-align:center;margin-top:12px;font-weight:700">英语词汇</div><div class="db-chapter-stats"><span class="db-stat">熟悉 ' + ec.familiar + '</span><span class="db-stat">模糊 ' + ec.vague + '</span><span class="db-stat">不会 ' + ec.wrong + '</span><span class="db-stat">未标 ' + empty + '</span></div></div>';
      } catch (e) {}
      for (var b = 0; b < books.length; b++) {
        var wb = books[b].wb;
        var cid = 'dbCanvas' + b;
        html += '<div class="db-donut-card" data-subject-id="' + books[b].subject.id + '" data-wb="' + wb + '">' +
          '<canvas id="' + cid + '"></canvas>' +
          '<div style="text-align:center;font-size:12px;color:#64748b">' + books[b].subject.name + '</div></div>';
      }
      grid.innerHTML = html;
      grid.onclick = function (e) {
        var card = e.target.closest('.db-donut-card');
        if (!card) return;
        if (card.dataset.action === 'english') {
          if (window.openEnglishVocabulary) window.openEnglishVocabulary();
          return;
        }
        var sId = card.dataset.subjectId;
        var wbName = card.dataset.wb;
        if (sId && wbName) {
          openDashboardBook(sId, wbName);
        }
      };

      // Draw donuts after DOM update
      setTimeout(function() {
        for (var b = 0; b < books.length; b++) {
          var wb = books[b].wb;
          var chapters = getBookChapters(wb, books[b].subject.chapters);
          var canvas = document.getElementById('dbCanvas' + b);
          if (canvas) drawDonut(canvas, chapters, books[b].label, books[b].subject);
        }
      }, 20);
    }

    // 从总进度卡片进入对应书籍时，先切换数据源，再展示该书的章节明细。
    function openDashboardBook(subjectId, wb) {
      if (curSubjectId !== subjectId) {
        switchSubject(subjectId);
        dashboardOpen = true;
        document.getElementById('dashboardPanel').style.display = '';
        document.getElementById('mainAreaContent').style.display = 'none';
        setPanelTitle('全局学习进度');
      }
      openDashboardDetail(wb);
    }

    function openDashboardDetail(wb) {
      showDashboardBackBtn(true);
      document.getElementById('dbOverview').style.display = 'none';
      document.getElementById('dbDetail').style.display = '';
      document.getElementById('dbDetailTitle').textContent = getWbLabel(wb) + ' — 章节进度';

      var chapters = getBookChapters(wb);
      var grid = document.getElementById('dbDetailList');

      function cardHtml(ch) {
        var name = ch.short || ch.name;
        var stats = getChStats(ch);
        return '<div class="db-chapter-card" data-cid="' + ch.id + '">' +
          '<div class="db-chapter-name">' + name + '</div>' +
          '<div class="db-chapter-bar"><div class="db-chapter-fill" style="width:' + stats.pct + '%"></div></div>' +
          '<div class="db-chapter-stats">' +
            '<span class="db-stat"><span class="db-stat-dot" style="background:#389E0D"></span>熟练 ' + stats.proficient + '</span>' +
            '<span class="db-stat"><span class="db-stat-dot" style="background:#FBC02D"></span>模糊 ' + stats.vague + '</span>' +
            '<span class="db-stat"><span class="db-stat-dot" style="background:#D32F2F"></span>不会 ' + stats.wrong + '</span>' +
            '<span class="db-stat"><span class="db-stat-dot" style="background:#ccc"></span>未做 ' + stats.unmarked + '</span>' +
          '</div></div>';
      }

      // 按主学科分组，列顺序：高数 → 线代 → 概率论（其余排后）
      var colMap = {};
      chapters.forEach(function(ch) {
        var bs = baseSubject(ch.subj);
        (colMap[bs] = colMap[bs] || []).push(ch);
      });
      var SUBJECT_ORDER = ['高数', '线代', '概率论'];
      var colKeys = [];
      SUBJECT_ORDER.forEach(function(s) { if (colMap[s]) colKeys.push(s); });
      Object.keys(colMap).forEach(function(s) { if (colKeys.indexOf(s) === -1) colKeys.push(s); });

      var html = '';
      colKeys.forEach(function(bs) {
        var colChs = colMap[bs];
        html += '<div class="db-subject-col">' +
          '<div class="db-subject-header">' + bs + ' <span class="db-subject-count">' + colChs.length + ' 章</span></div>';
        // 列内含"基础篇/强化篇"多篇（如1000题）时，加子分组标题
        var hasSub = colChs.some(function(ch) { return /^(基础篇|强化篇)/.test(ch.subj); });
        if (hasSub) {
          ['基础篇', '强化篇'].forEach(function(pfx) {
            var group = colChs.filter(function(ch) { return String(ch.subj).indexOf(pfx) === 0; });
            if (group.length === 0) return;
            html += '<div class="db-subject-subheader">' + pfx + '</div>';
            group.forEach(function(ch) { html += cardHtml(ch); });
          });
        } else {
          colChs.forEach(function(ch) { html += cardHtml(ch); });
        }
        html += '</div>';
      });
      grid.innerHTML = html;
      grid.onclick = function (e) {
        var card = e.target.closest('.db-chapter-card');
        if (card && card.dataset.cid) {
          jumpToChapter(card.dataset.cid);
        }
      };
    }

    function jumpToChapter(chapterId) {
      // Close dashboard panel
      dashboardOpen = false;
      showDashboardBackBtn(false);
      document.getElementById('dashboardPanel').style.display = 'none';
      document.getElementById('mainAreaContent').style.display = '';
      document.getElementById('btnDashboard').innerHTML = '全局进度<span class="sol-key">V</span>';
      setPanelTitle('');
      renderTitle();
      // Switch to the chapter
      switchChapter(chapterId);
    }

    // Back button
    document.addEventListener('DOMContentLoaded', function() {
      // 「返回总览」按钮：全局进度处于详情视图时显示，点击回到总览（同时绑定后退）
      const dbBack = document.getElementById('btnBackDashboard');
      if (dbBack) dbBack.addEventListener('click', function() {
        backToDashboardOverview();
      });
      // 「返回错题本」按钮：从错题本跳题后显示，点击回到错题本面板（同时绑定后退）
      const wbBack = document.getElementById('btnBackWrongBook');
      if (wbBack) wbBack.addEventListener('click', function() {
        backToWrongBook();
      });
    });

    // ===== 错题本 =====
    let wrongBookOpen = false;
    // 从错题本跳题后，用于「返回错题本」按钮与鼠标后退键回错题本
    let wrongBookReturn = false;
    function showWrongBookReturnBtn(show) {
      const btn = document.getElementById('btnBackWrongBook');
      if (btn) {
        btn.style.display = show ? '' : 'none';
        if (show) alignBackBtnToMainArea(btn); // 显示时动态对齐下方图片区左缘
      }
      wrongBookReturn = show;
    }
    function alignBackBtnToMainArea(btn) {
      // left = 主区域左缘相对标题栏左缘的偏移（动态计算，避免硬编码宽度）
      const mainArea = document.querySelector('.main-area');
      const bar = document.getElementById('chapterTitleBar');
      if (!mainArea || !bar) return;
      const barRect = bar.getBoundingClientRect();
      const mainRect = mainArea.getBoundingClientRect();
      btn.style.left = (mainRect.left - barRect.left) + 'px';
    }
    function backToWrongBook() {
      // 从题目页回到错题本面板
      wrongBookOpen = true;
      const panel = document.getElementById('wrongBookPanel');
      const dashPanel = document.getElementById('dashboardPanel');
      const content = document.getElementById('mainAreaContent');
      const btn = document.getElementById('btnWrongBook');
      renderWrongBook();
      dashPanel.style.display = 'none';
      content.style.display = 'none';
      panel.style.display = '';
      btn.innerHTML = '返回章节<span class="sol-key">B</span>';
      if (dashboardOpen) { dashboardOpen = false; showDashboardBackBtn(false); document.getElementById('btnDashboard').innerHTML = '全局进度<span class="sol-key">V</span>'; }
      showWrongBookReturnBtn(false); // 回到错题本后隐藏返回按钮
    }
    function toggleWrongBook() {
      wrongBookOpen = !wrongBookOpen;
      const panel = document.getElementById('wrongBookPanel');
      const dashPanel = document.getElementById('dashboardPanel');
      const content = document.getElementById('mainAreaContent');
      const btn = document.getElementById('btnWrongBook');
      if (wrongBookOpen) {
        renderWrongBook();
        dashPanel.style.display = 'none';
        content.style.display = 'none';
        panel.style.display = '';
        btn.innerHTML = '返回章节<span class="sol-key">B</span>';
        showWrongBookReturnBtn(false); // 打开错题本面板本身时不显示返回按钮
        // 关闭仪表盘
        if (dashboardOpen) { dashboardOpen = false; showDashboardBackBtn(false); document.getElementById('btnDashboard').innerHTML = '全局进度<span class="sol-key">V</span>'; }
      } else {
        panel.style.display = 'none';
        content.style.display = '';
        setPanelTitle('');
        renderTitle();
        btn.innerHTML = '错题本<span class="sol-key">B</span>';
        showWrongBookReturnBtn(false);
      }
    }

    // ===== 快捷键帮助模态 =====
    let shortcutHelpOpen = false;
    function toggleShortcutHelp() {
      shortcutHelpOpen = !shortcutHelpOpen;
      document.getElementById('shortcutOverlay').classList.toggle('show', shortcutHelpOpen);
    }

    // ===== 科目选择模态 =====
    let subjectPickerOpen = false;
    function openSubjectPicker() {
      subjectPickerOpen = true;
      const list = document.getElementById('subjectOptionList');
      if (list) {
        list.innerHTML = '';
        SUBJECTS.forEach(function (s) {
          const btn = document.createElement('button');
          btn.className = 'subject-option';
          btn.dataset.subject = s.id;
          btn.innerHTML = (s.name || s.id) + '<span class="subj-desc">' + (s.desc || '') + '</span>';
          btn.addEventListener('click', function () { pickSubject(s.id); });
          list.appendChild(btn);
        });
      }
      document.getElementById('subjectOverlay').classList.add('show');
    }
    function closeSubjectPicker() {
      subjectPickerOpen = false;
      document.getElementById('subjectOverlay').classList.remove('show');
    }

    // ===== 记住上次位置（章节 + 题目 + 小题模式），按科目、再按书籍分别保存 =====
    // 键 <user_<uid>_>kaoyan_resume = JSON {
    //   '<科目id>': { ch, idx, sub },                      // 切科目时恢复
    //   '<科目id>::<书籍wb>': { ch, idx, sub }             // 切书籍时恢复
    // }
    function resumeStorageKey() { return userStoragePrefix() + 'kaoyan_resume'; }
    function subjectStorageKey() { return userStoragePrefix() + 'kaoyan_subject'; }
    function reviewSessionStorageKey() { return userStoragePrefix() + 'kaoyan_review_session'; }
    function saveResume() {
      var map = {};
      try { map = JSON.parse(localStorage.getItem(resumeStorageKey())) || {}; } catch (e) { map = {}; }
      map[curSubjectId] = { ch: currentChapterId, idx: current, sub: !!subMode };
      var wb = getChapter() ? getChapter().wb : '';
      if (wb) map[curSubjectId + '::' + wb] = { ch: currentChapterId, idx: current, sub: !!subMode };
      // 章节级记忆：切回某章时恢复上次停的题（键含 ch id，无 ch 字段）
      if (currentChapterId) map[curSubjectId + '::ch::' + currentChapterId] = { idx: current, sub: !!subMode };
      try { localStorage.setItem(resumeStorageKey(), JSON.stringify(map)); } catch (e) {}
    }
    // 读取某章的章节级停靠记录（无记录/记录失效返回 null）
    function loadChapterResume(chId) {
      var map = {};
      try { map = JSON.parse(localStorage.getItem(resumeStorageKey())) || {}; } catch (e) { map = {}; }
      var r = map[curSubjectId + '::ch::' + chId];
      if (!r) return null;
      var ch = CHAPTERS.find(function (c) { return c.id === chId; });
      if (!ch || ch.total === 0) return null;
      var idx = Math.min(Math.max(0, r.idx || 0), ch.total - 1);
      var subOk = false;
      if (r.sub) {
        ensureGroups(ch);
        var g = ch.groupForIdx[idx];
        subOk = !!(g && g.isParent && g.count > 1);
      }
      return { idx: idx, sub: subOk };
    }
    function loadResume(subjectId) {
      var map = {};
      try { map = JSON.parse(localStorage.getItem(resumeStorageKey())) || {}; } catch (e) { map = {}; }
      var r = map[subjectId];
      if (!r || !r.ch) return null;
      var subj = SUBJECTS.find(function (s) { return s.id === subjectId; });
      if (!subj) return null;
      var ch = subj.chapters.find(function (c) { return c.id === r.ch; });
      if (!ch || ch.total === 0) return null;
      var idx = Math.min(Math.max(0, r.idx || 0), ch.total - 1);
      // 小题模式仅当该题属于含子题的父题组时才恢复，避免无子题时残留
      var subOk = false;
      if (r.sub) {
        ensureGroups(ch);
        var g = ch.groupForIdx[idx];
        subOk = !!(g && g.isParent && g.count > 1);
      }
      return { ch: r.ch, idx: idx, sub: subOk };
    }
    // 切换到某本书时恢复该书停靠位置（切书不回到第1讲第1题）。
    // 返回 true 表示已恢复；false 表示无记录/记录失效，调用方走「第一学科第一章节」。
    function applyResumeBook(wb) {
      var map = {};
      try { map = JSON.parse(localStorage.getItem(resumeStorageKey())) || {}; } catch (e) { map = {}; }
      var r = map[curSubjectId + '::' + wb];
      if (!r || !r.ch) return false;
      var ch = CHAPTERS.find(function (c) { return c.id === r.ch; });
      if (!ch || ch.total === 0 || ch.wb !== wb) return false;
      var idx = Math.min(Math.max(0, r.idx || 0), ch.total - 1);
      var subOk = false;
      if (r.sub) {
        ensureGroups(ch);
        var g = ch.groupForIdx[idx];
        subOk = !!(g && g.isParent && g.count > 1);
      }
      // 改章节/题号前先保存未提交的笔记——loadNotes 内部会再调 autoSaveNotes，
      // 但那时 currentChapterId 已是新章节，必须先在此处用旧章节 current 落盘。
      autoSaveNotes();
      currentChapterId = ch.id;
      current = idx;
      // 小题模式（F）是全局开关，切书不重置、跨书保持
      loadStatuses(); loadQBad(); loadSBad(); loadNotes(); loadSm2();
      // 若全局筛选激活且恢复的位置被筛掉，跳到第一条筛中题，避免落在不可见题上
      if (!isAllFilterActive()) {
        const filtered = getFilteredIndices();
        if (filtered.length > 0 && filtered.indexOf(current) === -1) current = filtered[0];
      }
      renderTitle(); switchTo(current); updateFilterCounts();
      return true;
    }
    function switchSubject(subjectId) {
      const subj = SUBJECTS.find(s => s.id === subjectId);
      if (!subj) return;
      autoSaveNotes(); // 切科目前保存未提交的笔记（loadNotes 会重建 notesData）
      // 切科目时若有进行中的复习：提交已评级结果并清除续接会话（跨科目不保留）
      if (reviewSession) exitReviewSession();
      saveResume(); // 先记录当前科目停的位置，再切换
      curSubjectId = subjectId;
      curSubject = subj;
      CHAPTERS = subj.chapters;
      migrateAllSm2();   // 切科目时也触发迁移（每个科目只跑一次）
      var resume = loadResume(subjectId);
      if (resume) {
        currentChapterId = resume.ch;
        current = resume.idx;
      } else {
        currentChapterId = subj.initChapterId;
        current = 0;
      }
      // 小题模式（F）是全局开关，切科目不重置、跨科目保持
      localStorage.setItem(subjectStorageKey(), subjectId);
      // 关闭可能打开的全局进度/错题本面板，避免旧科目 DOM 残留
      if (dashboardOpen) {
        dashboardOpen = false; dashboardDetailReturn = false;
        document.getElementById('dashboardPanel').style.display = 'none';
        document.getElementById('mainAreaContent').style.display = '';
        document.getElementById('btnDashboard').innerHTML = '全局进度<span class="sol-key">V</span>';
        showDashboardBackBtn(false); setPanelTitle('');
      }
      if (wrongBookOpen) {
        wrongBookOpen = false; wrongBookReturn = false;
        document.getElementById('wrongBookPanel').style.display = 'none';
        document.getElementById('mainAreaContent').style.display = '';
        document.getElementById('btnWrongBook').innerHTML = '错题本<span class="sol-key">B</span>';
        showWrongBookReturnBtn(false); setPanelTitle('');
      }
      wrongBookWb = null; // 无条件重置错题本书籍筛选（书籍列表按科目不同，防跨科目残留）
      closeAllTitlePanels(); // 关闭可能残留的标题下拉面板（切换后重建）
      loadStatuses(); loadQBad(); loadSBad(); loadNotes();
      loadSolutionPref(); renderSolDefaultBtn(); updateSolutionUI(); // 解析默认按科目记忆
      renderTitle(); renderStats(); renderNav();
      // 若全局筛选激活且恢复的位置被筛掉，则跳到第一条筛中题，避免落在不可见题上
      if (!isAllFilterActive()) {
        const filtered = getFilteredIndices();
        if (filtered.length > 0 && filtered.indexOf(current) === -1) current = filtered[0];
      }
      switchTo(current); updateFilterCounts();
      closeSubjectPicker();
    }
    function pickSubject(id) {
      const s = SUBJECTS.find(x => x.id === id);
      if (s) switchSubject(id);
      closeSubjectPicker();
    }
    document.addEventListener('DOMContentLoaded', function () {
      const btnSwitch = document.getElementById('btnSwitchSubject');
      if (btnSwitch) btnSwitch.onclick = openSubjectPicker;
      document.querySelectorAll('#subjectOverlay .subject-option').forEach(function (btn) {
        btn.addEventListener('click', function () { pickSubject(btn.dataset.subject); });
      });
      const so = document.getElementById('subjectOverlay');
      if (so) so.addEventListener('click', function (e) { if (e.target === this) closeSubjectPicker(); });
    });

    // 鼠标侧键后退：详情视图/从错题本跳题后，鼠标后退键回总览或错题本
    document.addEventListener('mouseup', function (e) {
      if (e.button !== 3) return; // 按钮 3 = 浏览器后退键（XButton1）
      if (dashboardDetailReturn) backToDashboardOverview();
      else if (wrongBookReturn) backToWrongBook();
    });
    // 窗口尺寸变化时，若返回按钮可见则重新对齐
    window.addEventListener('resize', function () {
      if (dashboardDetailReturn) {
        const dbtn = document.getElementById('btnBackDashboard');
        if (dbtn) alignBackBtnToMainArea(dbtn);
      }
      if (wrongBookReturn) {
        const btn = document.getElementById('btnBackWrongBook');
        if (btn) alignBackBtnToMainArea(btn);
      }
    });

    // ===== 错题本辅助函数 =====
    // 主学科：去掉"基础篇-/强化篇-"前缀（与全局进度一致）
    function baseSubject(subj) { return String(subj).replace(/^(基础篇|强化篇)[-—]/, ''); }
    function getWbLabel(wb) {
      var order = curSubject ? curSubject.wbOrder : [];
      for (var i = 0; i < order.length; i++) { if (order[i].wb === wb) return order[i].label; }
      return wb;
    }
    let wrongBookWb = null; // 错题本书籍筛选（null=未初始化，首次打开时跟随当前章节栏书籍）

    function updateWrongBookTitle() {
      // 错题本模式：保留标题栏书籍下拉，标题固定为「错题本」
      setPanelTitle('错题本', true);
    }

    function fillWrongBookWbPanel() {
      // 收集有错/糊题的书籍（1000题已并入 30讲/36讲：不再单列 1000题 书，
      // 其错题归入对应 base 书卡；第0讲 wb 已改 '基础30讲' 也并入）。
      var wbSet = new Set();
      for (const ch of CHAPTERS) {
        if (ch.total === 0) continue;
        if (ch.wb === '1000题') continue; // 数据源章节：错题由其 base 伴章汇总
        var key = chapterStatusKey(ch);
        var statusObj;
        try { statusObj = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { statusObj = {}; }
        var ownLen = ch.ownTotal || ch.total;
        for (var i = 0; i < ownLen; i++) {
          if (statusObj[i] === 'wrong' || statusObj[i] === 'vague') { wbSet.add(ch.wb); break; }
        }
        // 1000题 伴章部分也归入 base 书
        if (ch.q1000Id && !wbSet.has(ch.wb)) {
          var qc = chapterById(ch.q1000Id);
          var qkey = chapterStatusKey(qc);
          var qobj;
          try { qobj = JSON.parse(localStorage.getItem(qkey)) || {}; } catch (e) { qobj = {}; }
          for (var q = 0; q < qc.total; q++) {
            if (qobj[q] === 'wrong' || qobj[q] === 'vague') { wbSet.add(ch.wb); break; }
          }
        }
      }
      var entries = [];
      var order = curSubject ? curSubject.wbOrder : [];
      order.forEach(function(e) { if (wbSet.has(e.wb)) entries.push({ wb: e.wb, label: e.label }); });
      wbSet.forEach(function(w) { if (!entries.some(function(e) { return e.wb === w; })) entries.push({ wb: w, label: w }); });
      var defaultWb = order.length > 0 ? order[0].wb : (entries.length > 0 ? entries[0].wb : '');
      // 首次打开（null）：跟随当前章节栏选中的书籍；若该书无错题则回退到第一个有错题的书籍
      if (wrongBookWb === null) {
        var curWb = getChapter() ? getChapter().wb : null;
        wrongBookWb = (curWb && entries.some(function(e) { return e.wb === curWb; })) ? curWb : (entries.length > 0 ? entries[0].wb : defaultWb);
      } else if (!entries.some(function(e) { return e.wb === wrongBookWb; })) {
        wrongBookWb = entries.length > 0 ? entries[0].wb : defaultWb;
      }
      document.getElementById('txtWbWrongbook').textContent = getWbLabel(wrongBookWb);
      fillPanel('panelWbWrongbook', entries, 'wb', 'label', wrongBookWb, function(entry) {
        wrongBookWb = entry.wb;
        renderWrongBook();
      });
    }

    function renderWrongBook() {
      fillWrongBookWbPanel();
      updateWrongBookTitle();
      const grid = document.getElementById('wrongBookGrid');

      // 按书籍筛选 + 按学科分组收集。
      // 合并章节（有 q1000Id）：自身部分(ownTotal) + 伴章 1000题 部分(偏移 ownTotal) 一起进 base 书卡。
      const colMap = {};
      let totalWrong = 0;
      for (const ch of CHAPTERS) {
        if (ch.total === 0) continue;
        if (ch.wb !== wrongBookWb) continue;
        if (ch.wb === '1000题') continue;
        const groups = {}; // { wrong: [], rusty: [], vague: [], familiar: [] }
        // 自身部分
        var key = chapterStatusKey(ch);
        let statusObj;
        try { statusObj = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { statusObj = {}; }
        var ownLen = ch.ownTotal || ch.total;
        for (let i = 0; i < ownLen; i++) {
          var s = statusObj[i];
          if (s === 'wrong') (groups.wrong = groups.wrong || []).push(i);
          else if (s === 'rusty') (groups.rusty = groups.rusty || []).push(i);
          else if (s === 'vague') (groups.vague = groups.vague || []).push(i);
          else if (s === 'familiar') (groups.familiar = groups.familiar || []).push(i);
        }
        // 1000题 伴章部分
        if (ch.q1000Id) {
          var qc = chapterById(ch.q1000Id);
          var qkey = chapterStatusKey(qc);
          let qobj;
          try { qobj = JSON.parse(localStorage.getItem(qkey)) || {}; } catch (e) { qobj = {}; }
          for (let q = 0; q < qc.total; q++) {
            var qs = qobj[q];
            if (qs === 'wrong') (groups.wrong = groups.wrong || []).push(ch.ownTotal + q);
            else if (qs === 'rusty') (groups.rusty = groups.rusty || []).push(ch.ownTotal + q);
            else if (qs === 'vague') (groups.vague = groups.vague || []).push(ch.ownTotal + q);
            else if (qs === 'familiar') (groups.familiar = groups.familiar || []).push(ch.ownTotal + q);
          }
        }
        var totalCount = (groups.wrong ? groups.wrong.length : 0) + (groups.rusty ? groups.rusty.length : 0) + (groups.vague ? groups.vague.length : 0) + (groups.familiar ? groups.familiar.length : 0);
        if (totalCount === 0) continue;
        totalWrong += totalCount;
        const bs = baseSubject(ch.subj);
        (colMap[bs] = colMap[bs] || []).push({ ch, groups });
      }

      let html = '';
      if (totalWrong === 0) {
        html = '<div class="wrongbook-empty">暂无标记为「不会」「困难」「模糊」「较熟练」的题目</div>';
      } else {
        // 列顺序：高数 → 线代 → 概率论（其余排后）
        const SUBJECT_ORDER = ['高数', '线代', '概率论'];
        const colKeys = [];
        SUBJECT_ORDER.forEach(function(s) { if (colMap[s]) colKeys.push(s); });
        Object.keys(colMap).forEach(function(s) { if (colKeys.indexOf(s) === -1) colKeys.push(s); });
        colKeys.forEach(function(bs) {
          const items = colMap[bs];
          html += '<div class="db-subject-col">' +
            '<div class="db-subject-header">' + bs + ' <span class="db-subject-count">' + items.length + ' 讲</span></div>';
          items.forEach(function(item) {
            const ch = item.ch;
            const name = ch.short || ch.name;
            const labels = ch.labels || [];
            var g = item.groups;
            html += '<div class="wrongbook-chapter-card">' +
              '<div class="wrongbook-chapter-name">' + name +
              '<span class="wrongbook-status-count">' +
              (g.familiar ? '<span class="ws w-familiar">较熟 ' + g.familiar.length + '</span>' : '') +
              (g.vague ? '<span class="ws w-vague">模糊 ' + g.vague.length + '</span>' : '') +
              (g.rusty ? '<span class="ws w-rusty">困难 ' + g.rusty.length + '</span>' : '') +
              (g.wrong ? '<span class="ws w-wrong">不会 ' + g.wrong.length + '</span>' : '') +
              '</span></div>' +
              '<div class="wrongbook-q-grid">';
            function qItem(idx, cls, statTitle) {
              const label = labels[idx] || (idx + 1);
              const isQ = ch.q1000Total && idx >= ch.ownTotal;
              const tag = isQ ? '<span class="ws q1000-tag">1000</span>' : '';
              return '<span class="wrongbook-q-item ' + cls + '" data-chapter="' + ch.id + '" data-index="' + idx + '" title="第' + label + '题（' + statTitle + '）">' + label + tag + '</span>';
            }
            if (g.wrong) for (var wIdx of g.wrong) html += qItem(wIdx, 'wrong', '不会');
            if (g.rusty) for (var rIdx of g.rusty) html += qItem(rIdx, 'rusty', '困难');
            if (g.vague) for (var vIdx of g.vague) html += qItem(vIdx, 'vague', '模糊');
            if (g.familiar) for (var fIdx of g.familiar) html += qItem(fIdx, 'familiar', '较熟练');
            html += '</div></div>';
          });
          html += '</div>';
        });
      }
      grid.innerHTML = html;

      // 点击跳转
      grid.querySelectorAll('.wrongbook-q-item').forEach(function(el) {
        el.addEventListener('click', function() {
          const cid = this.getAttribute('data-chapter');
          const idx = parseInt(this.getAttribute('data-index'));
          // 关闭错题本
          wrongBookOpen = false;
          document.getElementById('wrongBookPanel').style.display = 'none';
          document.getElementById('mainAreaContent').style.display = '';
          document.getElementById('btnWrongBook').innerHTML = '错题本<span class="sol-key">B</span>';
          setPanelTitle(''); // 恢复章节下拉栏（与 dashboard 跳转一致）
          renderTitle();
          // 切换章节并跳转到目标题
          switchChapter(cid);
          switchTo(idx);
          // 标记从错题本进入，显示「返回错题本」按钮
          showWrongBookReturnBtn(true);
        });
      });
    }

    // ===== 渲染题号网格 =====
    function renderNav() {
      const nav = document.getElementById('qnav');
      nav.innerHTML = '';
      const ch = getChapter();
      ensureGroups(ch);
      const cols = effectiveCols();
      nav.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
      const labels = ch.labels;
      const curGroup = ch.groupForIdx[current];
      // 预计算筛中索引集合，renderNav 内多处使用，避免重复调用 getFilteredIndices()。
      // 「全部」筛选下无需构建集合（所有组均可见）。
      const filteredSet = isAllFilterActive() ? null : new Set(getFilteredIndices());

      function appendBadges(btn, i) {
        const labels = ch.labels;
        // 该题组内任一题有笔记或有图片标注，就在题号右上角亮提示圆点
        let groupHasNote = false, groupHasAnnot = false;
        const g0 = ch.groupForIdx[i];
        const start = g0 ? g0.startIdx : i;
        const count = g0 ? g0.count : 1;
        for (var k = 0; k < count; k++) {
          const idx = start + k;
          if (notesData[notesKeyFor(idx)]) groupHasNote = true;
          if (hasQuestionImagesAnnotated(idx)) groupHasAnnot = true;
          if (groupHasNote && groupHasAnnot) break;
        }
        if (qBad[i] || sBad[i] || groupHasNote || groupHasAnnot) {
          const badgeSpan = document.createElement('span');
          badgeSpan.className = 'img-badges';
          if (qBad[i]) { const d = document.createElement('span'); d.className = 'qbad-dot'; d.textContent = 'Q'; badgeSpan.appendChild(d); }
          if (sBad[i]) { const d = document.createElement('span'); d.className = 'sbad-dot'; d.textContent = 'S'; badgeSpan.appendChild(d); }
          if (groupHasNote) { const d = document.createElement('span'); d.className = 'note-dot'; d.textContent = '●'; badgeSpan.appendChild(d); }
          if (groupHasAnnot) { const d = document.createElement('span'); d.className = 'annot-dot'; d.textContent = '●'; badgeSpan.appendChild(d); }
          btn.appendChild(badgeSpan);
        }
      }

      // 自动从 labels 推断分区（连续同类别归为一个 partition）
      // 合并章节用 partOfIdx(i)：1000题 段独立成「1000题」分区，不并入「例题/习题」
      var parts = []; // [{label, startIdx, endIdx}]
      var curPart = null;
      var partOrder = getPartOrder(); // 当前科目分区顺序
      for (var i = 0; i < labels.length; i++) {
        var cat = partOfIdx(i);
        if (!curPart || curPart.label !== cat) {
          if (curPart) curPart.endIdx = i;
          curPart = { label: cat, startIdx: i, endIdx: -1 };
          parts.push(curPart);
        }
      }
      if (curPart) curPart.endIdx = labels.length;

      // 按 partOrder 排序渲染
      parts.sort(function(a, b) {
        return partOrder.indexOf(a.label) - partOrder.indexOf(b.label);
      });
      // 补全 partOrder 中缺失的分区（如无例题则显示"无"）
      partOrder.forEach(function(po) {
        if (!parts.some(function(p) { return p.label === po; })) {
          parts.push({ label: po, startIdx: -1, endIdx: -1 });
        }
      });
      parts.sort(function(a, b) {
        return partOrder.indexOf(a.label) - partOrder.indexOf(b.label);
      });

      parts.forEach(function(part) {
        // 收集该分区的 subGroups
        var secGroups = [];
        ch.subGroups.forEach(function(g) {
          // 筛选时只渲染真正命中的题组；不要保留空白题号格，
          // 否则右侧导航会看起来没有跟随左侧状态实时变化。
          var matched = isAllFilterActive() || groupVisibleIndices(g, filteredSet).length > 0;
          if (matched && g.startIdx >= part.startIdx && g.startIdx < part.endIdx) {
            secGroups.push(g);
          }
        });

        // 该分区无题则跳过（如36讲无习题、某些章节无例题）
        if (secGroups.length === 0) return;

        // 分区标题
        var secTitle = document.createElement('div');
        secTitle.className = 'section-header';
        secTitle.textContent = part.label;
        nav.appendChild(secTitle);

        secGroups.forEach(function(g) {
          var btn = document.createElement('button');
          btn.setAttribute('data-group-start', g.startIdx);
          btn.title = g.parentLabel;
          var inCurGroup = (curGroup === g);
          var cls = '';

          if (inCurGroup && (!g.isParent || !subMode)) { cls = 'active'; }

          var visIdx = groupVisibleIndices(g, filteredSet);
          var groupHasVisible = isAllFilterActive() || visIdx.length > 0;
          if (!groupHasVisible) cls += ' filtered-out';

          if (g.isParent) {
            cls += ' has-subs';
            var anyStatus = false;
            for (var k = 0; k < g.count; k++) { if (statuses[g.startIdx + k]) { anyStatus = true; break; } }
            if (anyStatus) cls += ' has-color';
            btn.className = cls.trim();

            for (var k = 0; k < g.count; k++) {
              var idx = g.startIdx + k;
              var bar = document.createElement('span');
              bar.className = 'sub-bar';
              var st = statuses[idx];
              if (st) bar.classList.add(st);
              if (inCurGroup && subMode && idx === current) bar.classList.add('active-sub');
              bar.style.width = (100 / g.count) + '%';
              bar.style.left = (k * 100 / g.count) + '%';
              btn.appendChild(bar);
            }

            var textSpan = document.createElement('span');
            textSpan.className = 'btn-text';
            textSpan.textContent = g.parentLabel;
            btn.appendChild(textSpan);
          } else {
            cls += ' ' + getStatusClass(g.startIdx);
            btn.className = cls.trim();
            btn.textContent = g.parentLabel;
          }

          appendBadges(btn, g.startIdx);

          btn.onclick = function() {
            // 点击侧栏定位到该题组第一个可见题；小题模式（F 全局开关）不重置，跨章/跨题保持
            if (visIdx.length > 0) { switchTo(visIdx[0]); }
          };
          nav.appendChild(btn);
        });
      });

      // 构建视觉行映射（W/S 导航用）
      buildVisualRows(nav);

      renderSubSelectBar(curGroup);
    }

    // ===== 根据 DOM 构建视觉行映射 =====
    function buildVisualRows(nav) {
      visualRows = [];
      var btns = nav.querySelectorAll('button[data-group-start]');
      var lastTop = -1;
      btns.forEach(function(btn) {
        var top = btn.offsetTop;
        if (top !== lastTop) {
          visualRows.push([]);
          lastTop = top;
        }
        visualRows[visualRows.length - 1].push(parseInt(btn.getAttribute('data-group-start')));
      });
    }

    // W/S：按视觉行偏移（基于 DOM 实际布局，跳过 section header 行）
    function navByGroupOffset(offset) {
      var groups = visibleGroups();
      var g = currentGroup();
      if (!g || visualRows.length === 0) return;

      // 找到当前 group 在哪个视觉行、哪一列
      var curRow = -1, curCol = -1;
      for (var r = 0; r < visualRows.length; r++) {
        var col = visualRows[r].indexOf(g.startIdx);
        if (col !== -1) { curRow = r; curCol = col; break; }
      }
      if (curRow === -1) return;

      var targetRow = curRow + offset;
      if (targetRow < 0 || targetRow >= visualRows.length) return;

      var targetRowSids = visualRows[targetRow];
      // 目标列：优先与当前列同列；若当前列超出目标行长度（目标行较短，如末行不足一列），
      // 夹到目标行最后一个——如 13 题中第 10 题按 S 落到第 13 题（下一行最后一个）。
      var targetCol = Math.min(curCol, targetRowSids.length - 1);
      // 从目标列向外扩展，找最近的可见 group（处理筛选隐藏的题）。
      // 扩展半径覆盖整个目标行：目标行可能比当前列短（上一行/末行不足一列），
      // 此时旧代码 d 上限用 targetRowSids.length 够不到任何项 → S/W 无反应。
      for (var d = 0; d < targetRowSids.length; d++) {
        var left = targetCol - d, right = targetCol + d;
        if (left >= 0) {
          var tgL = groups.find(function(gr) { return gr.startIdx === targetRowSids[left]; });
          if (tgL && groupVisibleIndices(tgL).length > 0) { switchTo(groupVisibleIndices(tgL)[0]); return; }
        }
        if (right < targetRowSids.length && d > 0) {
          var tgR = groups.find(function(gr) { return gr.startIdx === targetRowSids[right]; });
          if (tgR && groupVisibleIndices(tgR).length > 0) { switchTo(groupVisibleIndices(tgR)[0]); return; }
        }
      }
    }

    function navUp() { navByGroupOffset(-1); }
    function navDown() { navByGroupOffset(1); }
    function renderSubSelectBar(curGroup) {
      const bar = document.getElementById('subSelectBar');
      if (!bar) return;

      if (!curGroup || !curGroup.isParent) {
        bar.innerHTML = '';
        bar.style.display = 'none';
        return;
      }

      bar.style.display = 'block';
      bar.innerHTML = '';
      const ch = getChapter();
      const labels = ch.labels;
      const filteredSet = new Set(getFilteredIndices());

      for (let k = 0; k < curGroup.count; k++) {
        const i = curGroup.startIdx + k;
        const btn = document.createElement('button');
        btn.className = 'sub-sel-btn';
        btn.textContent = subSuffix(labels[i]);
        btn.title = labels[i];

        // 未按F时所有子题高亮，按F后仅当前子题高亮
        if (!subMode || i === current) {
          btn.classList.add('active');
        }

        const visible = isAllFilterActive() || filteredSet.has(i);
        if (!visible) { btn.style.display = 'none'; }

        btn.onclick = function () {
          if (!isFiltered(i)) return;
          subMode = true;
          switchTo(i);
        };
        bar.appendChild(btn);
      }
    }

    // ===== 题组级 / 子题级导航 =====
    function visibleGroups() {
      const ch = getChapter();
      ensureGroups(ch);
      if (isAllFilterActive()) return ch.subGroups.slice();
      const filteredSet = new Set(getFilteredIndices());
      return ch.subGroups.filter(g => groupVisibleIndices(g, filteredSet).length > 0);
    }

    function currentGroup() {
      const ch = getChapter();
      ensureGroups(ch);
      return ch.groupForIdx[current];
    }

    function effectiveCols() {
      // 每行列数：按科目配置（数学为 5）；忽略章节数据中的 cols 字段
      return (curSubject && curSubject.navCols) ? curSubject.navCols : 5;
    }

    // A：上一题（题组级：跳上一题组最后一个可见子题；子题级：组内-1，越界跳上一组末尾）
    function navPrev() {
      const g = currentGroup();
      if (!g) return;
      if (subMode) {
        const vis = groupVisibleIndices(g);
        const pos = vis.indexOf(current);
        if (pos > 0) { switchTo(vis[pos - 1]); return; }
      }
      const groups = visibleGroups();
      const gi = groups.indexOf(g);
      if (gi <= 0) return;
      const pv = groupVisibleIndices(groups[gi - 1]);
      if (pv.length > 0) switchTo(pv[pv.length - 1]);
    }

    // D：下一题（题组级：跳下一题组第一个可见子题；子题级：组内+1，越界跳下一组开头）
    function navNext() {
      const g = currentGroup();
      if (!g) return;
      if (subMode) {
        const vis = groupVisibleIndices(g);
        const pos = vis.indexOf(current);
        if (pos !== -1 && pos < vis.length - 1) { switchTo(vis[pos + 1]); return; }
      }
      const groups = visibleGroups();
      const gi = groups.indexOf(g);
      if (gi === -1 || gi >= groups.length - 1) return;
      const nv = groupVisibleIndices(groups[gi + 1]);
      if (nv.length > 0) switchTo(nv[0]);
    }

    // F：切换小题选择模式（全局开关，跨章保持；当前题无子题时仅切换开关，导航仍正常逐题/逐组）
    function toggleSubMode() {
      const g = currentGroup();
      if (!g) return;
      subMode = !subMode;
      renderNav();
      renderSubSelectBar(g);
      // 同步更新题号标签
      const ch = getChapter();
      const labels = ch.labels;
      document.getElementById('qLabel').textContent = subMode ? labels[current] : g.parentLabel;
    }

    // ===== 切换题目 =====
    function updateSolutionUI() {
      const area = document.getElementById('solutionArea');
      const btn = document.getElementById('btnToggle');
      if (showSolution) {
        area.classList.add('show');
        btn.innerHTML = '<span class="func-name">隐藏解析</span><span class="key">Space</span>';
        btn.classList.add('hide');
        // 从隐藏切换为显示时，重新加载解析图并叠加标注：
        // 隐藏期间图片无实际尺寸，标注叠加会被跳过（避免 NaN 放大 bug），
        // 显示后再重新探测/渲染，等图片有尺寸后 onload 里会正常叠加。
        refreshSolutionAnnotations();
      } else {
        area.classList.remove('show');
        btn.innerHTML = '<span class="func-name">显示解析</span><span class="key">Space</span>';
        btn.classList.remove('hide');
      }
    }
    // 对当前已加载的解析图重新叠加标注（隐藏→显示后调用，修复 NaN 放大 bug）
    function refreshSolutionAnnotations() {
      const container = document.getElementById('solutionImgs');
      if (!container) return;
      container.querySelectorAll('.annot-wrapper').forEach(function (wrap) {
        const img = wrap.querySelector('.solution-img');
        const overlay = wrap.querySelector('.annot-overlay');
        if (img && overlay) renderImageAnnotation(img.src, img, overlay);
      });
    }

    function markImageMissing(imgEl, message) {
      if (!imgEl) return;
      imgEl.removeAttribute('src');
      imgEl.alt = message || '图片暂缺';
      imgEl.dataset.missing = '1';
      imgEl.classList.add('image-missing');
    }

    // ===== 图片双源容灾 Fallback =====
    function loadImageWithFallback(imgEl, localSrc, onLoadCallback, onFinalError) {
      imgEl.classList.remove('image-missing');
      delete imgEl.dataset.missing;
      imgEl.dataset.fallback = '0';
      imgEl.onerror = function() {
        if (this.dataset.fallback === '0') {
          this.dataset.fallback = '1';
          const cdnPrefix = 'https://raw.githubusercontent.com/flanahao/kaoyan-tiku/main/';
          this.src = cdnPrefix + encodeURI(localSrc).replace(/#/g, '%23');
        } else {
          if (onFinalError) onFinalError();
        }
      };
      if (onLoadCallback) {
        imgEl.onload = onLoadCallback;
      }
      imgEl.src = encodeURI(localSrc).replace(/#/g, '%23');
    }

    // 解析图探测代次：切换题目时递增，onload 里丢弃过期题目遗留的图片。
    // 必须显式声明——缺失会让 ++undefined 恒为 NaN，gen !== _solutionImgGen 永远成立，
    // 导致解析图加载成功后仍被丢弃（解析永远显示不出来）。
    let _solutionImgGen = 0;
    function setSolutionImages(base) {
      const container = document.getElementById('solutionImgs');
      if (!container) return;
      container.innerHTML = '';
      const gen = ++_solutionImgGen;
      function tryAdd(n) {
        const src = n === 1 ? base + '_solution.png' : base + '_solution_' + n + '.png';
        const img = document.createElement('img');
        img.className = 'solution-img';
        img.alt = '解析' + (n > 1 ? '（' + n + '）' : '');
        
        const wrap = document.createElement('div');
        wrap.className = 'annot-wrapper';
        const overlay = document.createElement('div');
        overlay.className = 'annot-overlay';
        overlay.style.display = 'none';
        wrap.appendChild(img);
        wrap.appendChild(overlay);

        loadImageWithFallback(img, src, function () {
          if (gen !== _solutionImgGen) return; // 已有更新的题目在加载，丢弃
          container.appendChild(wrap);
          img.classList.toggle('sbad-border', !!sBad[current]);
          if (hasAnnotation(src)) renderImageAnnotation(src, img, overlay);
          tryAdd(n + 1); // 加载成功则继续探测下一张
        }, function () {
          if (gen === _solutionImgGen && n === 1 && container.children.length === 0) {
            container.appendChild(wrap);
            markImageMissing(img, '解析图片暂缺，请反馈题号');
          }
        });
      }
      tryAdd(1);
    }

    // ===== 普通浏览标注叠加（切题即见） =====
    var _annotViewers = {}; // key: 归一化 src，value: MarkerView 实例

    // 在捕获阶段拦截只读标注容器内部抛出的 wheel 事件，彻底阻止 marker.js 内部 .canvas-container
    // 监听器执行 e.preventDefault()，从而彻底根除对 Element.prototype 的全局改写污染，
    // 同时保证父容器正常原生滚动、触摸和解析滚动。
    document.addEventListener('wheel', function (e) {
      const path = (typeof e.composedPath === 'function') ? e.composedPath() : [];
      for (let i = 0; i < path.length; i++) {
        const el = path[i];
        if (el && el.classList && (el.classList.contains('annot-overlay') || el.classList.contains('lightbox-annot-overlay'))) {
          e.stopImmediatePropagation();
          break;
        }
      }
    }, { capture: true });

    function clearImageAnnotation(src) {
      const key = normalizeAnnotSrc(src);
      const v = _annotViewers[key];
      if (v) { try { v.remove(); } catch (e) {} delete _annotViewers[key]; }
    }
    function renderImageAnnotation(src, imgEl, overlayEl) {
      const key = normalizeAnnotSrc(src);
      // 移除旧的 overlay
      if (overlayEl) overlayEl.innerHTML = '';
      clearImageAnnotation(key);
      const state = getAnnotation(key);
      if (!state || typeof markerjs3 === 'undefined' || !overlayEl) return;
      // 若图片处于 display:none（解析默认隐藏）或尚未布局出实际尺寸，此时创建 MarkerView 会用 0 尺寸
      // 计算 SVG 矩阵 → NaN → 标注区域被放大/错乱。等图片可见后再渲染（见 updateSolutionUI 的重新触发）。
      if (imgEl.getBoundingClientRect().width === 0 || imgEl.getBoundingClientRect().height === 0) return;
      overlayEl.style.display = '';
      try {
        const viewer = new markerjs3.MarkerView();
        _annotViewers[key] = viewer;
        overlayEl.appendChild(viewer);
        viewer.targetImage = imgEl;
        viewer.show(state);
      } catch (e) { /* 标注渲染失败时静默 */ }
    }
    function renderQuestionAnnotations() {
      const img = document.getElementById('questionImg');
      const overlay = document.getElementById('qAnnotOverlay');
      const src = img && img.src;
      if (!src || !overlay) return;
      if (img.complete && img.naturalWidth > 0) {
        renderImageAnnotation(img.src, img, overlay);
      } else {
        // onload 时重新读 img.src：本地图失败 CDN 兜底后是最终 URL，
        // 标注存在最终 URL 键下，必须用最终 src 查询（入口缓存 src 会导致兜底后标注不显示）
        img.onload = function() { renderImageAnnotation(img.src, img, overlay); };
      }
    }

    function switchTo(idx) {
      autoSaveNotes(); // 切题前保存未提交的笔记（当前仍是旧题，saveNote 用 current 定位正确）
      current = idx;
      showSolution = defaultShowSolution;
      const ch = getChapter();
      const base = getImgPath(idx);
      const qImg = document.getElementById('questionImg');
      const isProfessional = curSubjectId === 'zhuanye';
      loadImageWithFallback(qImg, base + (isProfessional ? '.png' : '_question.png'), function() {
        renderQuestionAnnotations();
      }, function() {
        markImageMissing(qImg, '题目图片暂缺，请反馈题号');
      });
      if (isProfessional) {
        document.getElementById('solutionImgs').innerHTML = '<div class="section-empty" style="text-align:center;padding:12px">（该专业课题目暂无解析图）</div>';
      } else {
        setSolutionImages(base);
      }
      renderQuestionAnnotations(); // 叠加已保存的图片标注（切题即见）
      updateSolutionUI();
      // 更新题号标签
      ensureGroups(ch);
      const g = ch.groupForIdx[current];
      const labels = ch.labels;
      let qLabelText;
      if (subMode) {
        qLabelText = labels[current];
      } else if (g && g.isParent) {
        qLabelText = g.parentLabel;
      } else {
        qLabelText = labels[current];
      }
      document.getElementById('qLabel').textContent = qLabelText;
      updateStatusBtns(); updateQBadBtn(); updateSBadBtn(); updateImgBadWarnings();
      renderNotes();
      renderStats();
      renderNav();
      renderSm2InfoBar();
      saveResume(); // 记住当前停的章节/题目/小题模式，刷新或切科目前保留
      try {
        var qEl = document.getElementById('questionImg');
        if (qEl && typeof qEl.scrollIntoView === 'function') {
          var rect = qEl.getBoundingClientRect();
          if (rect.top < 0 || rect.bottom > window.innerHeight) {
            qEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      } catch (e) {}
    }

    // ===== 题目图/解析图不达标 =====
    function updateQBadBtn() { document.getElementById('btnQBad').classList.toggle('marked', !!qBad[current]); }
    function updateSBadBtn() { document.getElementById('btnSBad').classList.toggle('marked', !!sBad[current]); }

    function updateImgBadWarnings() {
      document.getElementById('qBadWarning').classList.toggle('show', !!qBad[current]);
      document.getElementById('sBadWarning').classList.toggle('show', !!sBad[current]);
      document.getElementById('questionImg').classList.toggle('qbad-border', !!qBad[current]);
      document.querySelectorAll('#solutionImgs .solution-img').forEach(img => {
        img.classList.toggle('sbad-border', !!sBad[current]);
      });
    }

    // ===== 笔记渲染 =====
    // Markdown + LaTeX 渲染：marked 转 HTML → DOMPurify 消毒 → auto-render 渲染 KaTeX → 再次消毒
    // 两次消毒：marked 默认放行内联 HTML（防 <img onerror> 等注入）；KaTeX \href 可能生成链接（防 javascript: 链接）
    function sanitizeNotesHtml(html) {
      if (typeof DOMPurify === 'undefined') return String(html).replace(/<[^>]*>/g, ''); // 无 DOMPurify 时兜底去标签
      return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
    }
    function renderNotesMarkdown(src) {
      if (!src) return '';
      var html;
      try {
        // 先抽离 $...$/$$...$$ 公式占位，避免 marked 的 Markdown 转义吞掉 LaTeX 反斜杠（如 \{、\\）
        var mathSpans = [];
        var protectedSrc = src.replace(/\$\$[\s\S]+?\$\$|\$[^$\n]+?\$/g, function (m) {
          mathSpans.push(m);
          return '' + (mathSpans.length - 1) + '';
        });
        // breaks:true → 单换行渲染为 <br>，所见即所得（空行仍是段落间距）
        var md = marked.parse(protectedSrc, { breaks: true });
        html = sanitizeNotesHtml(md);
      } catch (e) { html = String(src).replace(/</g, '&lt;'); }
      var holder = document.createElement('div');
      holder.innerHTML = html;
      restoreMathPlaceholders(holder, mathSpans); // 在 DOM 中还原公式为纯文本，避免消毒器二次破坏
      try {
        renderMathInElement(holder, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      } catch (e) {}
      return sanitizeNotesHtml(holder.innerHTML);
    }

    // 把 N 占位符还原为原始 LaTeX 文本（text node，不经 HTML 解析）
    function restoreMathPlaceholders(root, spans) {
      if (!spans.length || !root) return;
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var txt = node.nodeValue || '';
        if (txt.indexOf('') === -1) continue;
        var frag = document.createDocumentFragment();
        var re = /([0-9]+)/g, m, last = 0, hit = false;
        while ((m = re.exec(txt)) !== null) {
          if (m.index > last) frag.appendChild(document.createTextNode(txt.substring(last, m.index)));
          var idx = parseInt(m[1], 10);
          if (spans[idx] !== undefined) frag.appendChild(document.createTextNode(spans[idx]));
          last = m.index + m[0].length;
          hit = true;
        }
        if (!hit) continue;
        if (last < txt.length) frag.appendChild(document.createTextNode(txt.substring(last)));
        node.parentNode.replaceChild(frag, node);
      }
    }

    // 编辑时右侧实时预览（防抖）
    var notesPreviewTimer = null;
    function updateNotesPreview() {
      clearTimeout(notesPreviewTimer);
      notesPreviewTimer = setTimeout(function() {
        var preview = document.getElementById('notesPreview');
        var textarea = document.getElementById('notesTextarea');
        if (preview) preview.innerHTML = renderNotesMarkdown(textarea ? textarea.value : '');
      }, 200);
    }

    // 查看模式：渲染结果常驻显示在「笔记」下方
    function renderNotes() {
      const hasNote = notesData[notesKeyFor(current)];
      const duo = document.getElementById('notesDuo');
      if (duo) duo.style.display = 'none'; // 非编辑态隐藏双栏编辑区
      const render = document.getElementById('notesRender');
      render.style.display = '';
      render.innerHTML = renderNotesMarkdown(hasNote || '');
      document.getElementById('btnNoteEdit').style.display = '';
      document.getElementById('btnNoteSave').style.display = 'none';
      document.getElementById('btnNoteCancel').style.display = 'none';
      document.getElementById('btnNoteDelete').style.display = hasNote ? '' : 'none';
    }

    // ===== 题号右上角「有笔记 / 有标注」提示（右侧导航角标） =====
    // 指定题号 idx 的题目图/解析图是否有标注
    function hasQuestionImagesAnnotated(idx) {
      // 用 getImgPath(idx) 自动路由到伴章路径（1000题 段）
      const base = getImgPath(idx);
      if (hasAnnotation(base + '_question.png')) return true;
      for (var n = 1; n <= 20; n++) {
        if (hasAnnotation(n === 1 ? base + '_solution.png' : base + '_solution_' + n + '.png')) return true;
      }
      return false;
    }
    // 有笔记（按当前题号 label）或任一图片有标注 → 右侧导航题号亮提示圆点（见 renderNav/appendBadges）

    function enterEditMode() {
      const duo = document.getElementById('notesDuo');
      const render = document.getElementById('notesRender');
      const btnEdit = document.getElementById('btnNoteEdit');
      const btnSave = document.getElementById('btnNoteSave');
      const btnCancel = document.getElementById('btnNoteCancel');
      const btnDelete = document.getElementById('btnNoteDelete');

      const label = getChapter().labels[current];
      const textarea = document.getElementById('notesTextarea');
      textarea.value = notesData[notesKeyFor(current)] || '';
      duo.style.display = '';
      render.style.display = 'none';
      btnEdit.style.display = 'none';
      btnSave.style.display = '';
      btnCancel.style.display = '';
      btnDelete.style.display = 'none';
      textarea.focus();
      notesDirty = false; // 进入编辑时重置（初始值即已保存内容）
      updateNotesPreview();

      // 实时预览（防抖）+ 标记未保存改动
      textarea.oninput = function() {
        notesDirty = true;
        updateNotesPreview();
      };
      // Enter 保存，Shift+Enter 换行
      textarea.onkeydown = function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          saveNote();
        }
      };
    }

    function saveNote() {
      const nk = notesKeyFor(current);
      const textarea = document.getElementById('notesTextarea');
      const val = textarea.value.trim();
      if (val) {
        notesData[nk] = val;
      } else {
        delete notesData[nk];
      }
      saveNotes();
      notesDirty = false;
      renderNotes(); // 保存后回到查看模式（渲染结果）
      renderNav();
    }

    // 离开编辑态前的自动保存：若有未提交改动且仍在编辑态，落盘并退出编辑态
    function autoSaveNotes() {
      if (!notesDirty) return;
      const duo = document.getElementById('notesDuo');
      if (duo && duo.style.display === 'none') { notesDirty = false; return; } // 已退出编辑态，忽略残留标志
      saveNote(); // 内部写 notesData + saveNotes + renderNotes（退出编辑态）+ 清零 notesDirty
    }

    function cancelNoteEdit() {
      notesDirty = false; // 用户主动放弃编辑，丢弃未保存内容
      renderNotes(); // 取消后回到查看模式（渲染结果）
    }

    function deleteNote() {
      delete notesData[notesKeyFor(current)];
      saveNotes();
      notesDirty = false;
      renderNotes();
      renderNav();
    }

    function focusNotes() {
      enterEditMode(); // N 键：直接进入编辑
    }

    function toggleQBad() { qBad[current] = !qBad[current]; if (!qBad[current]) delete qBad[current]; saveQBad(); updateQBadBtn(); updateImgBadWarnings(); renderNav(); }
    function toggleSBad() { sBad[current] = !sBad[current]; if (!sBad[current]) delete sBad[current]; saveSBad(); updateSBadBtn(); updateImgBadWarnings(); renderNav(); }

    // ===== 组合键检测（Z/X/C 5级打标） =====
    // 顺序无关：任意顺序按下 Z+X → 较熟练；X+C → 困难；单键 200ms 超时后触发各自等级
    // 注：C 也需等待 200ms（非立即触发），否则 C+X 无法识别为「困难」。
    let comboState = { z: false, x: false, c: false, timer: null };
    function resetCombo() {
      comboState.z = false; comboState.x = false; comboState.c = false;
      if (comboState.timer) { clearTimeout(comboState.timer); comboState.timer = null; }
    }
    function handleStatusKey(key) {
      // 注：调用方已在 keydown 中做了 INPUT/TEXTAREA 过滤
      var ch = key.toLowerCase();
      if (ch !== 'z' && ch !== 'x' && ch !== 'c') { resetCombo(); return; }
      comboState[ch] = true;
      // 清除之前的超时计时器（每次按键重新计时 200ms）
      if (comboState.timer) { clearTimeout(comboState.timer); comboState.timer = null; }
      // 检测组合键（顺序无关）
      // Z + X → 较熟练 (familiar, lv4)
      if (comboState.z && comboState.x) {
        setStatus('familiar'); resetCombo(); return;
      }
      // X + C → 困难 (rusty, lv2)
      if (comboState.x && comboState.c) {
        setStatus('rusty'); resetCombo(); return;
      }
      // 未形成组合，等待 200ms 后按单键触发
      comboState.timer = setTimeout(function() {
        if (comboState.z) { setStatus('proficient'); }
        else if (comboState.x) { setStatus('vague'); }
        else if (comboState.c) { setStatus('wrong'); }
        resetCombo();
      }, 200);
    }

    // ===== 掌握度 =====
    function updateStatusBtns() {
      const cur = statuses[current] || '';
      ['proficient', 'familiar', 'vague', 'rusty', 'wrong'].forEach(function(s) {
        const btn = document.getElementById('btn' + s.charAt(0).toUpperCase() + s.slice(1));
        if (!btn) return;
        btn.className = 'gel-btn btn-status' + (s === cur ? ' ' + s + ' active' : '');
      });
      // 同步移动端快捷药丸按钮状态
      const mWrong = document.getElementById('mBtnWrong');
      const mVague = document.getElementById('mBtnVague');
      const mProf = document.getElementById('mBtnProficient');
      if (mWrong) mWrong.classList.toggle('active', cur === 'wrong');
      if (mVague) mVague.classList.toggle('active', cur === 'vague');
      if (mProf) mProf.classList.toggle('active', cur === 'proficient');
    }

    function setStatus(status) {
      const had = statuses[current];
      // 复习会话中不允许取消标记（同一键重复选 = 正常记录，不 toggle off）
      const togglingOff = reviewSession ? false : (had === status);
      // 撤销栈：记录本次修改前的状态（仅一次；togglingOff 与置新值互斥）
      pushUndo(current, had, currentChapterId);
      if (togglingOff) { delete statuses[current]; }
      else { statuses[current] = status; }
      saveStatuses(); updateStatusBtns(); renderStats(); renderNav(); updateFilterCounts();
      const scoreMap = { proficient: 5, familiar: 4, vague: 3, rusty: 2, wrong: 1 };
      const score = scoreMap[status];
      if (reviewSession && !togglingOff && score) {
        // 复习会话评级：延迟提交，不即时改 SM-2
        const item = reviewCurrentItem();
        const isReviewTarget = item && currentChapterId === item.chapterId && current === item.idx;
        if (isReviewTarget) {
          item.finalScore = score;
          item.status = 'graded';
          reviewAdvance(1); // 评级后自动进入下一复习题
        } else {
          // A/D/W/S 漂移到相邻题评级：只重定基线，不改复习位置
          rebaselineSm2(current, score);
        }
      } else if (!togglingOff && score) {
        // 非复习改标：重定基线（不累加），首打标自动跳到下一题
        rebaselineSm2(current, score);
        if (!had) navNext();
      }
      renderSm2InfoBar();
    }

    // ===== 撤销最近一次掌握度标记 =====
    var undoStack = [];
    function pushUndo(idx, prevStatus, chapterId) {
      undoStack.push({ idx: idx, prevStatus: prevStatus || '', chapterId: chapterId || currentChapterId });
      if (undoStack.length > 50) undoStack.shift();
    }
    function undoLastMark() {
      if (undoStack.length === 0) return;
      var act = undoStack.pop();
      // 撤销跨章标记：先切回原章节再改状态（saveStatuses 会写对该章），避免污染当前章
      if (act.chapterId && act.chapterId !== currentChapterId) {
        currentChapterId = act.chapterId;
        loadStatuses();
        renderTitle(); // 标题栏同步切回原章（renderNav/switchTo 不更新顶部标题下拉）
      }
      switchTo(act.idx);
      if (act.prevStatus) { statuses[act.idx] = act.prevStatus; }
      else { delete statuses[act.idx]; }
      saveStatuses(); updateStatusBtns(); renderStats(); renderNav(); updateFilterCounts();
      renderSm2InfoBar();
    }

    function toggleSolution() {
      showSolution = !showSolution;
      saveSolutionPref(); // 解析显示开关持久化（按科目记忆）
      updateSolutionUI();
    }

    function toggleDefaultSolution() {
      defaultShowSolution = !defaultShowSolution;
      showSolution = defaultShowSolution;
      saveSolutionPref(); // 解析默认偏好持久化（按科目记忆）
      renderSolDefaultBtn();
      updateSolutionUI();
    }

    function renderSolDefaultBtn() {
      const btn = document.getElementById('btnSolDefault');
      if (defaultShowSolution) {
        btn.innerHTML = '解析默认：显示<span class="sol-key">Shift+Space</span>';
      } else {
        btn.innerHTML = '解析默认：隐藏<span class="sol-key">Shift+Space</span>';
      }
    }

    // ===== 筛选栏数字统计 =====
    // 标注题号集合缓存：切章/切科目时重建，saveAnnotation/clearAnnotation 时增量更新，
    // 避免 updateFilterCounts（热路径）每次对整章每题 ×20 张解析图做标注查询。
    var annotIdxCache = new Set();
    var annotIdxCacheChapter = null;
    function rebuildAnnotIdxCache() {
      annotIdxCache = new Set();
      annotIdxCacheChapter = getChapter();
      const total = annotIdxCacheChapter.total;
      for (let i = 0; i < total; i++) {
        if (hasQuestionImagesAnnotated(i)) annotIdxCache.add(i);
      }
    }
    function annotIdxHas(i) {
      const ch = getChapter();
      if (ch !== annotIdxCacheChapter) rebuildAnnotIdxCache();
      return annotIdxCache.has(i);
    }
    function updateFilterCounts() {
      const ch = getChapter();
      const total = ch.total;
      let prof = 0, vag = 0, wr = 0;
      // 按本章合并索引统计（与 renderStats 一致）：statuses[i] 只取 0..total-1，
      // 避免 Object.values 扫到合并章节 1000题 段的其它书索引造成重复/虚高计数。
      for (let i = 0; i < total; i++) {
        const s = statuses[i];
        if (s === 'proficient' || s === 'familiar') prof++;
        else if (s === 'vague' || s === 'rusty') vag++;
        else if (s === 'wrong') wr++;
      }
      // 带笔记/标注计数：标注集合走增量缓存（annotIdxHas），笔记查表 O(1)。
      let withNoteOrAnnot = 0;
      for (let i = 0; i < total; i++) {
        if (notesData[notesKeyFor(i)] || annotIdxHas(i)) withNoteOrAnnot++;
      }
      const setCount = function(filter, val) {
        const el = document.querySelector('.filter-btn[data-filter="' + filter + '"] .filter-count');
        if (el) el.textContent = val;
      };
      setCount('all', total);
      setCount('proficient', prof);
      setCount('vague', vag);
      setCount('wrong', wr);
      setCount('unmarked', withNoteOrAnnot);
    }

    // ===== 灯箱（图片点击全屏） =====
    let lbScale = 1, lbTranslateX = 0, lbTranslateY = 0, lbDragging = false, lbLastX = 0, lbLastY = 0;

    function lbApplyTransform() {
      const img = document.getElementById('lightboxImg');
      img.style.transform = 'translate(' + lbTranslateX + 'px,' + lbTranslateY + 'px) scale(' + lbScale + ')';
    }


    document.addEventListener('DOMContentLoaded', function () {
      const overlay = document.getElementById('lightbox');
      const lbImg = document.getElementById('lightboxImg');

      // 题目图片点击打开灯箱。
      // 用捕获阶段监听 .annot-wrapper（图片 + readonly 标注层的父容器）：
      // 有标注时 readonly 标注层（mjs-marker-view 及其 shadow 内部）会覆盖图片区域，
      // 点击的 target 是标注层本身而非 <img>，冒泡阶段到不了 questionImg（questionImg
      // 是兄弟节点，不在事件路径上）。捕获阶段在 wrapper 上先于 target 处理，且能拿到
      // 图片 src，保证无论是否命中标注层都能开灯箱。
      document.getElementById('qAnnotWrap').addEventListener('click', function (e) {
        const img = document.getElementById('questionImg');
        const src = img && img.src;
        if (src && !src.endsWith('/')) openLightbox(src);
      }, true);
      // 解析图片（含分片）也可点击打开灯箱。
      // 捕获阶段监听：有标注时点击 target 是标注层（mjs-marker-view）而非 <img>，
      // 需从事件路径里找对应的 .solution-img 取 src（与主题目图同理，见 qAnnotWrap）。
      document.getElementById('solutionImgs').addEventListener('click', function (e) {
        // 从事件路径找 .solution-img（覆盖 命中标注层 / 命中 <img> 两种情况）。
        // 有标注时点击命中标注层，.solution-img 是 .annot-overlay 的兄弟节点、不在路径上，
        // 但 .annot-wrapper 是标注层的祖先、一定在路径上——从它里面取回被覆盖的那张 <img>。
        const path = e.composedPath ? e.composedPath() : (e.path || []);
        let img = null;
        for (let i = 0; i < path.length; i++) {
          const el = path[i];
          if (el && el.classList) {
            if (el.classList.contains('solution-img')) { img = el; break; }
            if (el.classList.contains('annot-wrapper')) {
              const im = el.querySelector('.solution-img');
              if (im) { img = im; break; }
            }
          }
        }
        const src = img && img.src;
        if (src && !src.endsWith('/')) openLightbox(src);
      }, true);

      document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) closeLightbox(); });

      // 标注模式下点击非图片背景：与查看模式一致地退出（保存标注并回到灯箱查看）。
      // mjs-marker-area 铺满灯箱，需在 capture 阶段拦截：命中 marker-area 本身或其后代空白区即视为背景点击。
      overlay.addEventListener('click', function (e) {
        if (!lbAnnotMode) return;
        const ma = lbMarkerArea;
        if (!ma) return;
        // 工具栏 / 标注按钮 / 关闭按钮上的点击不拦截
        if (e.target.closest && e.target.closest('#annotToolbar, #lightboxAnnotate, #lightboxClose')) return;
        // 判断是否点在图内：标记编辑区（canvas-container）内的图片/控件算图内，其余算背景
        let insideImage = false;
        try {
          const cc = ma.shadowRoot && ma.shadowRoot.querySelector('.canvas-container');
          const imgEl = cc && cc.querySelector('img');
          if (imgEl && imgEl.getBoundingClientRect) {
            const r = imgEl.getBoundingClientRect();
            insideImage = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          }
        } catch (err) {}
        if (!insideImage) {
          e.stopPropagation();
          // 无标注内容 → 直接退出灯箱；有标注内容 → 先保存并退出标注模式（回到灯箱查看）
          if (annotHasContent()) saveAnnotationFromArea();
          else closeLightbox();
        }
      }, true);

      // 灯箱滚轮缩放
      overlay.addEventListener('wheel', function (e) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 1.15 : 0.87;
        const newScale = Math.min(Math.max(lbScale * delta, 0.5), 5);
        const rect = lbImg.getBoundingClientRect();
        const mx = e.clientX - rect.left - rect.width / 2;
        const my = e.clientY - rect.top - rect.height / 2;
        lbTranslateX -= mx * (newScale / lbScale - 1);
        lbTranslateY -= my * (newScale / lbScale - 1);
        lbScale = newScale;
        lbApplyTransform();
      }, { passive: false });

      // 灯箱拖拽
      lbImg.addEventListener('mousedown', function (e) {
        lbDragging = true; lbLastX = e.clientX; lbLastY = e.clientY;
        lbImg.classList.add('grabbing');
      });
      window.addEventListener('mousemove', function (e) {
        if (!lbDragging) return;
        lbTranslateX += e.clientX - lbLastX;
        lbTranslateY += e.clientY - lbLastY;
        lbLastX = e.clientX; lbLastY = e.clientY;
        lbApplyTransform();
      });
      window.addEventListener('mouseup', function () {
        lbDragging = false;
        lbImg.classList.remove('grabbing');
      });

      // 灯箱双击关闭
      lbImg.addEventListener('dblclick', closeLightbox);

      // 快捷键帮助：点击背景关闭
      const scOverlay = document.getElementById('shortcutOverlay');
      scOverlay.addEventListener('click', function(e) {
        if (e.target === scOverlay) toggleShortcutHelp();
      });
    });

    // ===== 图片标注（marker.js 3）：矢量数据持久化 =====
    var imgAnnotations = {}; // key: 图片 src，value: markerArea.getState() 的矢量 JSON
    // 统一 key：图片 src 可能来自 img.src（绝对 file:// URL）或 getImgPath 拼出的相对路径。
    // 灯箱用绝对路径存取、解析图加载用相对路径查询，必须归一化成同一个 key 才能对上。
    function normalizeAnnotSrc(imgSrc) {
      try { return new URL(imgSrc, window.location.href).href; } catch (e) { return imgSrc; }
    }
    function annotKey(imgSrc) { return userStoragePrefix() + 'annot_' + normalizeAnnotSrc(imgSrc); }
    function annotStoragePrefix() { return userStoragePrefix() + 'annot_'; }
    function loadAnnotations() {
      const prefix = annotStoragePrefix();
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf(prefix) === 0) {
            try { imgAnnotations[normalizeAnnotSrc(k.substring(prefix.length))] = JSON.parse(localStorage.getItem(k)); } catch (e) {}
          }
        }
      } catch (e) {}
    }
    function saveAnnotation(imgSrc, state) {
      imgAnnotations[normalizeAnnotSrc(imgSrc)] = state;
      try { localStorage.setItem(annotKey(imgSrc), JSON.stringify(state)); } catch (e) {}
      annotIdxCacheChapter = null; // 标注增删后失效缓存（annotIdxHas 会按需重建）
    }
    function getAnnotation(imgSrc) { return imgAnnotations[normalizeAnnotSrc(imgSrc)] || null; }
    function clearAnnotation(imgSrc) {
      const key = normalizeAnnotSrc(imgSrc);
      delete imgAnnotations[key];
      try { localStorage.removeItem(annotStoragePrefix() + key); } catch (e) {}
      annotIdxCacheChapter = null; // 标注增删后失效缓存（annotIdxHas 会按需重建）
    }
    function hasAnnotation(imgSrc) { return !!getAnnotation(imgSrc); }
    loadAnnotations();

    // ===== 灯箱标注编辑（marker.js 3 + 自建 Snipaste 风格工具栏） =====
    var lbCurrentSrc = null;     // 灯箱当前打开的图片 src
    var lbMarkerArea = null;     // 当前 MarkerArea 实例
    var lbAnnotMode = false;     // 是否处于标注模式
    var lbAnnotColor = '#ff0000'; // 当前标注颜色
    var lbAnnotWidth = 4;        // 当前标注粗细
    var lbLastAnnotTool = 'FrameMarker';   // 最近一次绘图工具（Tab/右键/横向滚轮用）
    var lbCurrentAnnotTool = 'FrameMarker'; // 当前激活工具
    var lbCurrentAnnotEditor = null;       // 当前未注册的绘图编辑器（Shift 锁定时覆写坐标）
    var lbAnnotShiftWasOn = false;         // 拖动期间是否按住 Shift（释放时再吸一次）

    // 工具按钮 → marker typeName（按工具栏从左到右顺序，横向滚轮/Tab 循环用）
    var ANNOT_TOOLS = ['FrameMarker', 'LineMarker', 'HighlighterMarker', 'FreehandMarker'];

    // 每个标注工具各自的默认颜色/粗细（Snipaste：不同标注形状分别记忆颜色）。
    // 切到某工具时载入其记忆值；用户调整后按工具分别保存，不再互相串扰。
    var ANNOT_TOOL_STYLES = {
      LineMarker:        { color: '#ff0000', width: 4 },  // 直线：红 4
      FrameMarker:       { color: '#ff0000', width: 4 },  // 矩形：红 4
      HighlighterMarker: { color: '#ffff00', width: 20 }, // 高亮：亮黄 20
      FreehandMarker:    { color: '#ff0000', width: 3 }   // 画笔：红 3
    };

    // 预设色板（Microsoft Office 标准 20 色，Snipaste 等标注工具调色板底层即此套 RGB）
    var ANNOT_COLORS = [
      '#000000', '#7f7f7f', // 黑 / 灰
      '#880015', '#ed1c24', // 深红 / 红
      '#ff7f27', '#fff200', // 橙 / 黄
      '#22b14c', '#1e90ff', // 绿 / 亮蓝
      '#3f48cc', '#a349a4', // 蓝 / 紫
      '#ffffff', '#c3c3c3', // 白 / 浅灰
      '#b97a57', '#ffaec9', // 棕 / 粉
      '#ffc90e', '#efe4b0', // 明黄 / 米黄
      '#b5e61d', '#99d9ea', // 黄绿 / 浅青
      '#7092be', '#c8bfe7'  // 蓝灰 / 浅紫
    ];

    function openLightbox(src) {
      closeAnnotator();
      const overlay = document.getElementById('lightbox');
      const img = document.getElementById('lightboxImg');
      lbCurrentSrc = src;
      img.src = src;
      lbScale = 1; lbTranslateX = 0; lbTranslateY = 0;
      img.style.transform = '';
      overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
      updateAnnotateBtn();
      openAnnotator(); // 点击图片默认即进入标注模式
    }

    function showLightboxAnnotationOverlay() {
      const lbOverlay = document.getElementById('lightboxAnnotOverlay');
      if (!lbOverlay || typeof markerjs3 === 'undefined') return;
      lbOverlay.innerHTML = '';
      const hasA = hasAnnotation(lbCurrentSrc);
      if (!lbCurrentSrc || !hasA) { lbOverlay.style.display = 'none'; return; }
      const img = document.getElementById('lightboxImg');
      lbOverlay.style.display = '';
      const apply = function () {
        const mview = new markerjs3.MarkerView();
        lbOverlay.appendChild(mview);
        mview.targetImage = img;
        mview.show(getAnnotation(lbCurrentSrc));
      };
      if (img.complete && img.naturalWidth > 0) apply();
      else { img.onload = function() { apply(); }; }
    }

    function updateAnnotateBtn() {
      const btn = document.getElementById('lightboxAnnotate');
      if (!btn) return;
      if (!lbCurrentSrc) { btn.style.display = 'none'; return; }
      btn.style.display = '';
      var hasAny = hasAnnotation(lbCurrentSrc);
      btn.textContent = hasAny ? '标注（已有）' : '标注';
      btn.classList.toggle('has-annot', hasAny);
    }

    // 应用当前颜色/粗细到编辑器（新建 marker 时生效）
    function applyAnnotStyle() {
      if (!lbMarkerArea) return;
      const editor = lbMarkerArea.currentMarkerEditor;
      if (!editor) return;
      try {
        if (lbAnnotColor) editor.strokeColor = lbAnnotColor;
        if (lbAnnotWidth) editor.strokeWidth = lbAnnotWidth;
      } catch (e) {}
    }

    // 高亮当前工具按钮
    function highlightAnnotTool(tool) {
      document.querySelectorAll('#annotToolbar .at-tool').forEach(function (b) {
        b.classList.toggle('active', b.dataset.tool === tool);
      });
    }

    // 载入某工具的已记忆/默认颜色粗细，并同步到 UI
    function loadAnnotToolStyle(tool) {
      const s = ANNOT_TOOL_STYLES[tool];
      if (!s) return;
      lbAnnotColor = s.color;
      lbAnnotWidth = s.width;
      const w = document.getElementById('annotWidth');
      if (w) w.value = lbAnnotWidth;
      updateAnnotWidthUI();
      updateAnnotColorUI();
    }

    // 切换标注工具（select → 选择模式；否则 createMarker）
    // 每次切工具载入该工具记忆的颜色/粗细（Snipaste：按形状记忆颜色），
    // 因此高亮不再被重置回默认，画笔也不会继承高亮的 20 粗细。
    function selectAnnotTool(toolName) {
      if (!lbMarkerArea) return;
      lbCurrentAnnotTool = toolName;
      lbLastAnnotTool = toolName;
      lbCurrentAnnotEditor = null;
      if (toolName !== 'select') loadAnnotToolStyle(toolName); // 载入该工具记忆值
      let editor = null;
      try {
        if (toolName === 'select') {
          lbMarkerArea.switchToSelectMode();
        } else {
          editor = lbMarkerArea.createMarker(toolName);
        }
      } catch (e) {}
      // 工具就绪后应用颜色/粗细（createMarker 返回当前编辑器）
      if (editor) {
        try {
          if (lbAnnotColor) editor.strokeColor = lbAnnotColor;
          if (lbAnnotWidth) editor.strokeWidth = lbAnnotWidth;
        } catch (e) {}
        lbCurrentAnnotEditor = editor; // 供 Shift 锁定使用
      }
      highlightAnnotTool(toolName);
    }

    function closeAnnotator(doSave) {
      // doSave=true（Esc / 工具栏「退出」/ 灯箱 X）：若有标注内容则先保存再退出，避免静默丢弃。
      // doSave 缺省/undefined（openAnnotator 清理残留、openLightbox 切换图片）：纯清理不保存。
      if (doSave && lbMarkerArea && annotHasContent()) {
        try { saveAnnotationFromArea(); } catch (e) {}
      }
      // 销毁 MarkerArea，退出标注模式，回到灯箱查看
      if (lbMarkerArea) {
        try { lbMarkerArea.remove(); } catch (e) {}
        lbMarkerArea = null;
      }
      lbAnnotMode = false;
      const img = document.getElementById('lightboxImg');
      const overlay = document.getElementById('lightbox');
      if (img) img.style.display = '';
      const hint = overlay && overlay.querySelector('.lightbox-hint');
      if (hint) { hint.style.display = ''; hint.textContent = '滚轮缩放 / 拖拽移动 / 双击或点击背景关闭'; }
      const tb = document.getElementById('annotToolbar');
      if (tb) tb.style.display = 'none';
      // 关闭预设色板
      const pal = document.getElementById('annotPalette');
      if (pal) pal.style.display = 'none';
      updateAnnotateBtn();
      // 回到查看：刷新灯箱标注叠加
      if (lbCurrentSrc) showLightboxAnnotationOverlay();
    }

    function openAnnotator() {
      if (typeof markerjs3 === 'undefined') { alert('标注组件未加载'); return; }
      if (!lbCurrentSrc) return;
      closeAnnotator(); // 清掉残留
      const img = document.getElementById('lightboxImg');
      const overlay = document.getElementById('lightbox');
      // 隐藏原图、标注叠加与提示，注入 MarkerArea
      img.style.display = 'none';
      const lbOverlay = document.getElementById('lightboxAnnotOverlay');
      if (lbOverlay) { lbOverlay.style.display = 'none'; lbOverlay.innerHTML = ''; }
      const hint = overlay.querySelector('.lightbox-hint');
      if (hint) hint.style.display = 'none';
      let ma;
      try {
        ma = new markerjs3.MarkerArea();
      } catch (e) {
        ma = null;
      }
      if (!ma) {
        img.style.display = '';
        if (hint) hint.style.display = '';
        return;
      }
      lbMarkerArea = ma;
      ma.targetImage = img; // 复用灯箱中原图引用
      // 已有标注则恢复
      const state = getAnnotation(lbCurrentSrc);
      if (state) {
        try { ma.restoreState(state); } catch (e) {}
      }
      overlay.appendChild(ma);
      // 滚轮缩放/右键粗细/横向切工具（capture 拦截，避免冒泡到 overlay 缩放监听）
      ma.addEventListener('wheel', onAnnotWheel, { passive: false, capture: true });
      // Shift 锁定：marker.js 的 window pointermove/up 在 appendChild 时已注册且永不移除，
      // remove+add 让本监听排在 marker.js 之后执行，从而能在其更新 x2/y2 后覆写为水平/竖直
      window.removeEventListener('pointermove', onAnnotPointerMove);
      window.addEventListener('pointermove', onAnnotPointerMove);
      window.removeEventListener('pointerup', onAnnotPointerUp);
      window.addEventListener('pointerup', onAnnotPointerUp);
      // 显示工具栏，默认选择矩形（进入即用 FrameMarker）
      const tb = document.getElementById('annotToolbar');
      if (tb) {
        tb.style.display = '';
        document.getElementById('annotWidth').value = lbAnnotWidth;
        updateAnnotWidthUI();
      }
      buildAnnotPalette(); // 重建预设色板（含高亮当前色）
      lbAnnotMode = true;
      selectAnnotTool('FrameMarker'); // 进入即用矩形（内部已初始化 lbCurrentAnnotTool/lbLastAnnotTool）
      const annotBtn = document.getElementById('lightboxAnnotate');
      if (annotBtn) {
        annotBtn.textContent = '退出标注';
        annotBtn.classList.remove('has-annot');
      }
    }

    // 工具栏事件绑定（DOMContentLoaded 后调用）
    function bindAnnotToolbar() {
      const tb = document.getElementById('annotToolbar');
      if (!tb) return;
      tb.addEventListener('click', function (e) {
        const btn = e.target.closest('.at-btn, .at-width-step');
        if (!btn) return;
        const action = btn.dataset.action;
        const tool = btn.dataset.tool;
        if (action === 'undo')        { doUndo(); return; }
        if (action === 'redo')        { doRedo(); return; }
        if (action === 'save')        { saveAnnotationFromArea(); return; }
        if (action === 'cancel')      { closeAnnotator(true); return; }
        if (action === 'width-minus') { adjustAnnotWidth(-1); return; }
        if (action === 'width-plus')  { adjustAnnotWidth(1); return; }
        if (tool && ANNOT_TOOLS.indexOf(tool) >= 0) { selectAnnotTool(tool); }
      });

      // 粗细滑块实时应用（同步到当前工具的记忆值）
      document.getElementById('annotWidth').addEventListener('input', function (e) {
        lbAnnotWidth = parseInt(e.target.value, 10) || 1;
        const s = ANNOT_TOOL_STYLES[lbCurrentAnnotTool];
        if (s) s.width = lbAnnotWidth;
        updateAnnotWidthUI();
        if (lbMarkerArea) applyAnnotStyle();
      });

      // 颜色按钮：开关预设色板
      const colorBtn = document.getElementById('annotColorSwatch');
      if (colorBtn) colorBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleAnnotPalette();
      });

      // 色板：预设色点击
      const pal = document.getElementById('annotPalette');
      if (pal) pal.addEventListener('click', function (e) {
        const s = e.target.closest('.at-swatch');
        if (s) { setAnnotColor(s.dataset.color); toggleAnnotPalette(false); return; }
      });

      // 色板：自定义色
      const custom = document.getElementById('annotColorCustom');
      if (custom) custom.addEventListener('input', function (e) { setAnnotColor(e.target.value); });

      // 点击工具栏外部关闭色板
      document.addEventListener('click', function (e) {
        if (!pal || pal.style.display === 'none') return;
        if (!e.target.closest('#annotPalette') && !e.target.closest('#annotColorSwatch')) {
          pal.style.display = 'none';
        }
      });

      // 右键结束当前标注编辑（画折线/多边形时）
      document.getElementById('lightbox').addEventListener('contextmenu', onAnnotContextMenu, true);
    }


    function refreshPageOverlays() {
      renderQuestionAnnotations();
      // 解析图标注由 setSolutionImages 在加载时处理；此处重新渲染当前解析图
      const container = document.getElementById('solutionImgs');
      if (container) {
        const base = getImgPath(current);
        setSolutionImages(base); // 重新探测，触发 hasAnnotation 叠加
      }
    }

    function closeLightbox() {
      // 关灯箱若有未保存标注内容则先保存（不静默丢弃用户画的内容）
      closeAnnotator(true);
      const overlay = document.getElementById('lightbox');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
      lbCurrentSrc = null;
    }

    // 标注按钮事件（在 DOMContentLoaded 中绑定）
    document.addEventListener('DOMContentLoaded', function () {
      const annotBtn = document.getElementById('lightboxAnnotate');
      if (annotBtn) {
        annotBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (lbAnnotMode) { saveAnnotationFromArea(); }
          else openAnnotator();
        });
      }
      // 灯箱内标注叠加容器（注入 HTML 之后在下方补建）
      const overlay = document.getElementById('lightbox');
      if (overlay && !document.getElementById('lightboxAnnotOverlay')) {
        const lbOverlay = document.createElement('div');
        lbOverlay.className = 'lightbox-annot-overlay';
        lbOverlay.id = 'lightboxAnnotOverlay';
        lbOverlay.style.display = 'none';
        overlay.appendChild(lbOverlay);
      }
      bindAnnotToolbar(); // 自建工具栏事件
      // Shift 锁定监听在 openAnnotator 中「remove+add」以排在 marker.js 之后执行
    });

    // ===== 标注模式键盘交互（Snipaste 式） =====
    function handleAnnotKeydown(e) {
      const key = e.key.toLowerCase();

      // Alt：退出标注（进入/退出标注的快捷键），保存并回到灯箱查看
      if (e.key === 'Alt') {
        e.preventDefault();
        saveAnnotationFromArea();
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (key) {
          case 'z': e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); break;
          case 'y': e.preventDefault(); doRedo(); break;
          case 's': e.preventDefault(); saveAnnotationFromArea(); break;
        }
        return; // 其它 Ctrl 组合放行（如 Ctrl+C 复制）
      }
      if (e.altKey) return;

      switch (key) {
        case ' ':        e.preventDefault(); toggleAnnotToolbar(); return; // 空格：显隐工具栏
        case 'tab':      e.preventDefault(); cycleAnnotTool(); return;     // Tab：在直线/矩形/高亮/画笔间切换
        case 'escape':   e.preventDefault(); closeAnnotator(true); return;     // Esc：保存并退出标注
        case 'delete':
        case 'backspace': e.preventDefault(); deleteAnnotSelection(); return;
      }

      // 工具快捷键：直线/矩形/高亮/画笔
      const map = { l: 'LineMarker', r: 'FrameMarker', h: 'HighlighterMarker', b: 'FreehandMarker' };
      if (map[key]) {
        e.preventDefault();
        selectAnnotTool(map[key]); // 切工具即载入该工具记忆的颜色/粗细
      }
    }

    // Tab 在工具栏工具顺序中循环（矩形 → 直线 → 高亮 → 画笔，与 ANNOT_TOOLS 一致）
    function cycleAnnotTool() {
      let i = ANNOT_TOOLS.indexOf(lbCurrentAnnotTool);
      if (i < 0) i = 0;
      selectAnnotTool(ANNOT_TOOLS[(i + 1) % ANNOT_TOOLS.length]);
    }

    // 空格显隐工具栏（Snipaste：空格显示/隐藏标注工具条）
    function toggleAnnotToolbar() {
      const tb = document.getElementById('annotToolbar');
      if (!tb) return;
      const hide = tb.style.display !== 'none';
      tb.style.display = hide ? 'none' : '';
      const hint = document.querySelector('#lightbox .lightbox-hint');
      if (hint) {
        if (hide) {
          hint.textContent = '工具栏已隐藏，按空格重新显示';
          hint.style.display = '';
        } else {
          hint.textContent = '滚轮缩放 / 拖拽移动 / 双击或点击背景关闭 · 空格隐藏工具栏';
          hint.style.display = '';
        }
      }
    }

    // 右键结束当前标注编辑（连续绘制同一工具）
    function onAnnotContextMenu(e) {
      if (!lbAnnotMode) return;
      if (e.target && e.target.closest && e.target.closest('#annotToolbar')) return; // 工具栏上右键不拦截
      e.preventDefault();
      finishCurrentAnnot();
    }

    function finishCurrentAnnot() {
      if (!lbMarkerArea) return;
      try {
        lbMarkerArea.switchToSelectMode(); // 内部 deselect → 收尾当前编辑
        const t = lbLastAnnotTool;
        if (t && t !== 'select') {
          // 重新进入同工具，便于连续绘制
          selectAnnotTool(t);
        }
      } catch (e) {}
    }

    // Shift 锁定直线为水平或竖直（Snipaste：按住 Shift 画直线）
    // marker.js 的 onPointerMove/onPointerUp 绑定在 window 上且先于本监听器注册，
    // 会先按局部坐标更新 marker.x2/y2；此处只做「吸到水平/竖直」的覆写。
    function snapAnnotToAxis() {
      if (!lbAnnotMode) return false;
      const tool = lbCurrentAnnotTool;
      if (tool !== 'LineMarker') return false;
      const ed = lbCurrentAnnotEditor;
      if (!ed || (ed.state !== 'creating' && ed.state !== 'select')) return false;
      const marker = ed.marker;
      if (!marker || typeof marker.x1 !== 'number' || typeof marker.y1 !== 'number') return false;
      const x1 = marker.x1, y1 = marker.y1;
      const dx = marker.x2 - x1, dy = marker.y2 - y1;
      try {
        if (Math.abs(dx) >= Math.abs(dy)) marker.y2 = y1; // 水平锁定
        else marker.x2 = x1;                              // 竖直锁定
        marker.adjustVisual();
        if (ed.adjustControlBox) ed.adjustControlBox();
      } catch (err) {}
      return true;
    }
    function onAnnotPointerMove(e) {
      if (e.shiftKey) {
        lbAnnotShiftWasOn = true;
        snapAnnotToAxis();
      } else {
        lbAnnotShiftWasOn = false;
      }
    }
    // 释放时 marker.js 的 resize 会用末帧坐标覆盖，需再吸一次（需记录 Shift 状态）
    function onAnnotPointerUp(e) {
      if (lbAnnotShiftWasOn) {
        snapAnnotToAxis();
        lbAnnotShiftWasOn = false;
      }
    }

    // 滚轮交互（capture 拦截，阻止冒泡到 overlay 缩放）：
    //   - 普通滚轮（deltaY）→ 缩放（光标处）
    //   - 右键按住 + 滚轮 → 调节画笔粗细
    //   - 横向滚轮（deltaX）→ 切换工具
    function onAnnotWheel(e) {
      if (!lbAnnotMode) return;
      e.preventDefault();
      e.stopPropagation();

      // 右键按住：调节粗细（Snipaste：右键+滚轮）
      if (e.buttons === 2 || e.button === 2) {
        const delta = (e.deltaY < 0) ? 1 : -1;
        adjustAnnotWidth(delta);
        return;
      }

      // 横向滚轮：切换工具（|deltaX| 明显大于 |deltaY| 时判定为横向）
      const dx = e.deltaX || 0, dy = e.deltaY || 0;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 1) {
        cycleAnnotToolByDelta(dx > 0 ? 1 : -1);
        return;
      }

      // 普通滚轮：缩放（光标处）
      zoomAnnotAt(e.clientX, e.clientY, dy < 0 ? 1.15 : 0.87);
    }

    // 在光标处缩放（保持光标下的图片坐标不漂移）
    function zoomAnnotAt(cx, cy, factor) {
      const ma = lbMarkerArea;
      if (!ma) return;
      const cc = ma.shadowRoot && ma.shadowRoot.querySelector('.canvas-container');
      if (!cc) return;
      const cr = cc.getBoundingClientRect();
      const Cx = cr.left + cr.width / 2, Cy = cr.top + cr.height / 2;
      const oldZoom = ma._zoomLevel || 1;
      const newZoom = Math.min(Math.max(oldZoom * factor, 0.5), 5);
      if (newZoom === oldZoom) return;
      const ddx = (cx - Cx - (ma._panX || 0)) / oldZoom;
      const ddy = (cy - Cy - (ma._panY || 0)) / oldZoom;
      ma._zoomLevel = newZoom;
      ma._panX = (ma._panX || 0) + (oldZoom - newZoom) * ddx;
      ma._panY = (ma._panY || 0) + (oldZoom - newZoom) * ddy;
      ma.applyTransform();
      try { ma.adjustEditorsZoom(); } catch (e) {}
    }

    // 横向滚轮切换工具（在工具栏工具顺序中循环）
    function cycleAnnotToolByDelta(dir) {
      let i = ANNOT_TOOLS.indexOf(lbCurrentAnnotTool);
      if (i < 0) i = ANNOT_TOOLS.indexOf(lbLastAnnotTool);
      if (i < 0) i = 0;
      selectAnnotTool(ANNOT_TOOLS[(i + dir + ANNOT_TOOLS.length) % ANNOT_TOOLS.length]);
    }

    function adjustAnnotWidth(d) {
      lbAnnotWidth = Math.max(1, Math.min(30, (lbAnnotWidth || 1) + d));
      const s = ANNOT_TOOL_STYLES[lbCurrentAnnotTool];
      if (s) s.width = lbAnnotWidth; // 同步到当前工具的记忆值
      const w = document.getElementById('annotWidth');
      if (w) w.value = lbAnnotWidth;
      updateAnnotWidthUI();
      if (lbMarkerArea) applyAnnotStyle();
    }

    // 撤销 / 重做 / 删除
    function doUndo() {
      if (lbMarkerArea) { try { lbMarkerArea.undo(); } catch (err) {} }
    }
    function doRedo() {
      if (lbMarkerArea) { try { lbMarkerArea.redo(); } catch (err) {} }
    }
    function deleteAnnotSelection() {
      if (lbMarkerArea) { try { lbMarkerArea.deleteSelectedMarkers(); } catch (err) {} }
    }

    // ===== 颜色 / 粗细 UI =====
    function buildAnnotPalette() {
      const wrap = document.getElementById('annotPaletteSwatches');
      if (!wrap) return;
      wrap.innerHTML = '';
      ANNOT_COLORS.forEach(function (c) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'at-swatch';
        b.dataset.color = c;
        b.style.background = c;
        b.title = c;
        wrap.appendChild(b);
      });
      updateAnnotColorUI();
    }
    function toggleAnnotPalette(show) {
      const p = document.getElementById('annotPalette');
      if (!p) return;
      const willShow = (typeof show === 'boolean') ? show : (p.style.display === 'none');
      p.style.display = willShow ? '' : 'none';
      if (willShow) updateAnnotColorUI();
    }
    function setAnnotColor(hex) {
      lbAnnotColor = hex;
      const s = ANNOT_TOOL_STYLES[lbCurrentAnnotTool];
      if (s) s.color = hex; // 同步到当前工具的记忆值
      updateAnnotColorUI();
      if (lbMarkerArea) applyAnnotStyle();
    }
    function updateAnnotColorUI() {
      const dot = document.getElementById('annotColorDot');
      if (dot) dot.style.background = lbAnnotColor;
      document.querySelectorAll('#annotPalette .at-swatch').forEach(function (s) {
        s.classList.toggle('active', String(s.dataset.color || '').toLowerCase() === String(lbAnnotColor).toLowerCase());
      });
    }
    function updateAnnotWidthUI() {
      const v = document.getElementById('annotWidthVal');
      if (v) v.textContent = lbAnnotWidth;
    }

    // 标注区当前是否有有效内容（用于背景点击时判断「直接关灯箱」还是「先保存再退出标注」）。
    // 需先 switchToSelectMode 收尾未完成图形，再按 saveAnnotationFromArea 相同的规则过滤 0 尺寸图形。
    function annotHasContent() {
      const ma = lbMarkerArea;
      if (!ma) return false;
      try { ma.switchToSelectMode(); } catch (e) {}
      try {
        const st = ma.getState();
        if (st && Array.isArray(st.markers)) {
          return st.markers.some(function (m) {
            if (!m) return false;
            const f = m.frame;
            if (f && f.width === 0 && f.height === 0) return false;
            return true;
          });
        }
      } catch (e) {}
      return false;
    }

    // 从当前 MarkerArea 读取并保存（点「保存」按钮时）
    function saveAnnotationFromArea() {
      if (!lbCurrentSrc) return;
      if (lbMarkerArea) {
        try { lbMarkerArea.switchToSelectMode(); } catch (e) {} // 收尾：finalize 未完成的图形
        let st;
        try { st = lbMarkerArea.getState(); } catch (e) {}
        if (st && Array.isArray(st.markers)) {
          // 过滤空图形（0 尺寸图形）
          st.markers = st.markers.filter(function (m) {
            if (!m) return false;
            var f = m.frame;
            if (f && f.width === 0 && f.height === 0) return false;
            return true;
          });
        }
        // 无有效标注则清理，避免残留空状态
        if (st && st.markers && st.markers.length === 0) {
          clearAnnotation(lbCurrentSrc);
        } else if (st) {
          saveAnnotation(lbCurrentSrc, st);
        }
      }
      closeAnnotator();
      updateAnnotateBtn();
      refreshPageOverlays();
      renderNav(); // 右侧导航角标同步（标注新增/清除）
    }

    // ===== 事件绑定 =====
    document.getElementById('btnToggle').onclick = toggleSolution;
    document.getElementById('btnSolDefault').onclick = toggleDefaultSolution;
    document.getElementById('btnDashboard').onclick = toggleDashboard;
    document.getElementById('btnWrongBook').onclick = toggleWrongBook;
    document.getElementById('btnShortcutHelp').onclick = toggleShortcutHelp;
    ['Proficient', 'Familiar', 'Vague', 'Rusty', 'Wrong'].forEach(s => {
      document.getElementById('btn' + s).onclick = function () { setStatus(s.toLowerCase()); };
    });
    document.getElementById('btnQBad').onclick = toggleQBad;
    document.getElementById('btnSBad').onclick = toggleSBad;

    // 笔记按钮事件
    document.getElementById('btnNoteEdit').onclick = enterEditMode;
    document.getElementById('btnNoteSave').onclick = saveNote;
    document.getElementById('btnNoteCancel').onclick = cancelNoteEdit;
    document.getElementById('btnNoteDelete').onclick = deleteNote;

    // 筛选按钮事件
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        applyFilter(this.dataset.filter);
      });
    });

    // 导出按钮事件
    document.getElementById('btnExportVague').onclick = function () { exportQuestions('vague'); };
    document.getElementById('btnExportWrong').onclick = function () { exportQuestions('wrong'); };

    // 侧边栏 SM-2 面板按钮事件
    const sm2SidebarBtn = document.getElementById('btnSm2PanelSidebar');
    if (sm2SidebarBtn) {
      sm2SidebarBtn.onclick = toggleSm2Panel;
    }

    // 移动端汉堡菜单与抽屉侧边栏
    const btnMobileMenu = document.getElementById('btnMobileMenu');
    const btnSidebarClose = document.getElementById('btnSidebarClose');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    function toggleMobileSidebar(open) {
      const isOpen = open !== undefined ? open : !document.body.classList.contains('sidebar-open');
      document.body.classList.toggle('sidebar-open', isOpen);
    }
    if (btnMobileMenu) btnMobileMenu.onclick = function () { toggleMobileSidebar(true); };
    if (btnSidebarClose) btnSidebarClose.onclick = function () { toggleMobileSidebar(false); };
    if (sidebarBackdrop) sidebarBackdrop.onclick = function () { toggleMobileSidebar(false); };

    // 移动端底部快捷操作栏
    const mBtnPrev = document.getElementById('mBtnPrev');
    const mBtnNext = document.getElementById('mBtnNext');
    const mBtnToggle = document.getElementById('mBtnToggle');
    const mBtnWrong = document.getElementById('mBtnWrong');
    const mBtnVague = document.getElementById('mBtnVague');
    const mBtnProficient = document.getElementById('mBtnProficient');
    if (mBtnPrev) mBtnPrev.onclick = navPrev;
    if (mBtnNext) mBtnNext.onclick = navNext;
    if (mBtnToggle) mBtnToggle.onclick = toggleSolution;
    if (mBtnWrong) mBtnWrong.onclick = function () { setStatus('wrong'); };
    if (mBtnVague) mBtnVague.onclick = function () { setStatus('vague'); };
    if (mBtnProficient) mBtnProficient.onclick = function () { setStatus('proficient'); };

    // Dashboard Hero 与侧边卡片快捷入口
    const btnHeroContinue = document.getElementById('btnHeroContinue');
    const btnHeroReview = document.getElementById('btnHeroReview');
    const btnWidgetReview = document.getElementById('btnWidgetReview');
    const btnWidgetWrong = document.getElementById('btnWidgetWrong');
    if (btnHeroContinue) btnHeroContinue.onclick = function () { if (dashboardOpen) toggleDashboard(); };
    if (btnHeroReview) btnHeroReview.onclick = function () { if (dashboardOpen) toggleDashboard(); toggleSm2Panel(); };
    if (btnWidgetReview) btnWidgetReview.onclick = function () { if (dashboardOpen) toggleDashboard(); toggleSm2Panel(); };
    if (btnWidgetWrong) btnWidgetWrong.onclick = function () { if (dashboardOpen) toggleDashboard(); toggleWrongBook(); };

    // ===== 错题导出 =====
    function exportQuestions(statusFilter) {
      const ch = getChapter();
      const items = [];
      for (let i = 0; i < ch.total; i++) {
        if (statuses[i] === statusFilter) {
          items.push({ label: ch.labels[i], qImg: getImgPath(i) + '_question.png' });
        }
      }
      if (items.length === 0) {
        alert(statusFilter === 'vague' ? '当前章节没有标记为"模糊"的题目' : '当前章节没有标记为"不会"的题目');
        return;
      }
      const statusLabel = statusFilter === 'vague' ? '模糊' : '不会';
      const statusColor = statusFilter === 'vague' ? '#FBC02D' : '#B71C1C';
      const cardsHTML = items.map((item, idx) => {
        // 导出窗口是 about:blank，相对路径无法解析；转成绝对路径（file:// 或 http(s)://）
        let abs = item.qImg;
        try { abs = new URL(item.qImg, window.location.href).href; } catch (e) {}
        return `<div class="card"><h3>${idx + 1}. ${item.label}</h3><img src="${abs}" alt="题目" onerror="this.style.display='none'"></div>`;
      }).join('');

      const w = window.open('', '_blank', 'width=900,height=700');
      if (!w) {
        alert('浏览器拦截了弹窗，请允许本站弹出窗口以进行导出');
        return;
      }
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${ch.name} — ${statusLabel}题</title>
<style>
body{font-family:"Microsoft YaHei",sans-serif;background:#fff;padding:20px;color:#333}
h1{font-size:20px;text-align:center;margin-bottom:4px}
.subtitle{text-align:center;color:${statusColor};font-size:14px;margin-bottom:20px}
.card{border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:20px;page-break-inside:avoid}
.card h3{font-size:14px;color:${statusColor};margin:0 0 8px}
.card img{max-width:100%;display:block;margin:8px 0}
@media print{body{padding:0}.card{border:none;border-bottom:1px dashed #ccc;border-radius:0;margin-bottom:12px;padding:12px 0}}
</style></head><body>
<h1>${ch.name}</h1>
<div class="subtitle">${statusLabel}题 · 共 ${items.length} 题</div>
${cardsHTML}
<script>window.onload=function(){window.print()}<\/script>
</body></html>`);
      w.document.close();
    }

    // ===== SM-2 间隔重复复习系统 =====
    let sm2 = {};          // { idx: { ef, interval, reps, nextReview, lastReview, history } }
    let reviewSession = null;  // { queue: [{chapterId, idx}], currentIdx, mode }
    let sm2PanelOpen = false;

    // SM-2 存储键：sm2_<subjectId>_<chapterId>（含科目 ID 避免数学与专业课的 ch1 冲突，并增加用户隔离）
    function sm2Key(ch) { return userStoragePrefix() + 'sm2_' + curSubjectId + '_' + ch.id; }

    function loadSm2() {
      const ch = getChapter(); if (!ch) return;
      sm2 = {};
      const srcs = statusSources();
      srcs.forEach(function(src) {
        let obj;
        try { obj = JSON.parse(localStorage.getItem(sm2Key(src.ch)) || '{}'); } catch(e) { obj = {}; }
        var len = src.len;
        for (var i = 0; i < len; i++) {
          if (obj[i]) sm2[src.offset + i] = obj[i];
        }
      });
    }

    // ===== 一次性全量迁移：为所有已有掌握度标记但缺 SM-2 记录的题目创建复习排期 =====
    // v2：修正迁移逻辑后升级版本号，确保已误迁移过的数据被清除后重新迁移
    function migrateAllSm2() {
      var flagKey = userStoragePrefix() + 'kaoyan_sm2_migrated_v2_' + curSubjectId;
      if (localStorage.getItem(flagKey) === '1') return;
      var scoreMap = { proficient: 5, familiar: 4, vague: 3, rusty: 2, wrong: 1 };
      var migrated = 0;
      CHAPTERS.forEach(function(ch) {
        if (ch.total === 0) return;
        var sm2Obj;
        try { sm2Obj = JSON.parse(localStorage.getItem(sm2Key(ch)) || '{}'); } catch(e) { sm2Obj = {}; }
        var statusObj;
        try { statusObj = JSON.parse(localStorage.getItem(chapterStatusKey(ch)) || '{}'); } catch(e) { statusObj = {}; }
        var changed = false;
        for (var i = 0; i < ch.total; i++) {
          var s = statusObj[i];
          if (s && !sm2Obj[i]) {
            changed = true;
            var score = scoreMap[s] || 3;
            sm2Obj[i] = calcSM2(getSm2Seed(score), score);
            migrated++;
          }
        }
        if (changed) {
          localStorage.setItem(sm2Key(ch), JSON.stringify(sm2Obj));
        }
      });
      localStorage.setItem(flagKey, '1');
      console.log('SM-2 migration: ' + migrated + ' records created for subject ' + curSubjectId);
    }

    function saveSm2() {
      const srcs = statusSources();
      srcs.forEach(function(src) {
        var out = {};
        var len = src.len;
        for (var i = 0; i < len; i++) {
          if (sm2[src.offset + i]) out[i] = sm2[src.offset + i];
        }
        if (Object.keys(out).length > 0) {
          localStorage.setItem(sm2Key(src.ch), JSON.stringify(out));
        } else {
          localStorage.removeItem(sm2Key(src.ch));
        }
      });
    }

    // 读取任意章节「合并后」的 SM-2（own 段 + 1000题伴章段），键为合并索引 0..total-1
    function readMergedSm2(ch) {
      var out = {};
      statusSources(ch).forEach(function(src) {
        var obj;
        try { obj = JSON.parse(localStorage.getItem(sm2Key(src.ch)) || '{}'); } catch (e) { obj = {}; }
        for (var i = 0; i < src.len; i++) {
          if (obj[i]) out[src.offset + i] = obj[i];
        }
      });
      return out;
    }
    // 将「合并后」的 SM-2 写回 own/伴章两块存储键（纯本地写入）
    function writeMergedSm2(ch, merged) {
      statusSources(ch).forEach(function(src) {
        var out = {};
        for (var i = 0; i < src.len; i++) {
          if (merged[src.offset + i]) out[i] = merged[src.offset + i];
        }
        if (Object.keys(out).length > 0) {
          localStorage.setItem(sm2Key(src.ch), JSON.stringify(out));
        } else {
          localStorage.removeItem(sm2Key(src.ch));
        }
      });
    }

    // ===== 重置所有 SM-2 复习进度（清除 bug 遗留数据后重新迁移） =====
    function resetAllSm2() {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && (k.indexOf('sm2_') === 0 || k.indexOf('_sm2_') !== -1 || k.indexOf('kaoyan_sm2_migrated_') !== -1)) {
          keys.push(k);
        }
      }
      keys.forEach(function(k) { localStorage.removeItem(k); });
      sm2 = {};
      if (sm2PanelOpen) renderSm2Panel();
      console.log('SM-2 进度已重置：' + keys.length + ' 条记录已清除。刷新页面将自动迁移已有掌握度标记。');
      alert('SM-2 复习进度已重置（' + keys.length + ' 条）。\n\n建议刷新页面以重新触发自动迁移。');
      return keys.length;
    }

    function calcSM2(record, score) {
      if (!record) record = { ef: 2.5, interval: 1, reps: 0, nextReview: 0, lastReview: 0, history: [] };
      var now = Date.now();
      var ef = record.ef, interval = record.interval, reps = record.reps;
      var deltaMap = { 5: 0.10, 4: 0.00, 3: -0.14, 2: -0.22, 1: -0.30 };
      var delta = deltaMap[score] || 0;
      if (score >= 3) {
        if (reps === 0) interval = 1;
        else if (reps === 1) interval = 6;
        else interval = Math.round(interval * ef);
        reps++;
      } else {
        interval = 1; reps = 0;
      }
      ef = Math.max(1.3, ef + delta);
      var nextReview = now + interval * 86400000;
      record.history = record.history || [];
      record.history.push({ date: now, score: score, ef: ef, interval: interval });
      return { ef: ef, interval: interval, reps: reps, nextReview: nextReview, lastReview: now, history: record.history };
    }

    function checkMastered(record) {
      if (!record || !record.history || record.history.length < 3) return false;
      var h = record.history;
      return h.slice(-3).every(function(e) { return e.score >= 4; }) && record.interval > 90;
    }

    // 根据掌握度等级返回恰当的初始 SM-2 状态（模拟已有几次复习）
    function getSm2Seed(score) {
      if (score === 5)      return { ef: 2.5, interval: 30, reps: 3, history: [] };
      else if (score === 4) return { ef: 2.5, interval: 7,  reps: 2, history: [] };
      else if (score === 3) return { ef: 2.5, interval: 1,  reps: 1, history: [] };
      else                  return { ef: 2.5, interval: 1,  reps: 0, history: [] };
    }

    function getSm2Label(rec) {
      if (!rec || !rec.nextReview) return '';
      var now = Date.now();
      if (checkMastered(rec) || rec.nextReview > now + 90 * 86400000) return 'mastered';
      if (rec.nextReview < new Date(new Date().setHours(0,0,0,0)).getTime()) return 'overdue';
      if (rec.nextReview <= now) return 'due';
      return 'queued';
    }

    // ---- SM-2 信息行 ----
    function renderSm2InfoBar() {
      var bar = document.getElementById('sm2InfoBar');
      if (!bar) return;
      var rec = sm2[current];
      if (!rec || !rec.nextReview) { bar.style.display = 'none'; return; }
      bar.style.display = '';
      var dueDate = new Date(rec.nextReview);
      var dd = dueDate.getFullYear() + '-' + String(dueDate.getMonth()+1).padStart(2,'0') + '-' + String(dueDate.getDate()).padStart(2,'0');
      var label = getSm2Label(rec);
      var tag = '';
      if (label === 'due') tag = '<span class="sm2-due-tag">今日到期</span>';
      else if (label === 'overdue') tag = '<span class="sm2-overdue-tag">已逾期</span>';
      else if (label === 'mastered') tag = '<span style="color:#F5A623;font-weight:600">⭐ 已掌握</span>';
      bar.innerHTML = '<span>EF: ' + rec.ef.toFixed(2) + '</span>' +
        '<span>间隔: ' + rec.interval + '天</span>' +
        '<span>复习次数: ' + rec.reps + '</span>' +
        (rec.lastReview ? '<span>上次: ' + new Date(rec.lastReview).toLocaleDateString('zh-CN') + '</span>' : '') +
        '<span>下次: ' + dd + '</span>' + tag;
    }

    // 模块归一：'基础篇-线代' → '线代'（1000题章节 subj 带篇前缀）
    function canonicalSubj(subj) { return String(subj || '').replace(/^(基础篇|强化篇)[-—]/, ''); }
    // 复习用「浏览章」：排除 1000题 数据源章（1000题内容已并入 30讲/36讲 合并章）
    function reviewChapters() {
      return CHAPTERS.filter(function(c) { return c.wb !== '1000题' && c.total > 0; });
    }
    // 统一收集到期题目队列（含 1000题伴章段，使用合并索引）
    function collectDueItems(chapters, mode) {
      var queue = [];
      chapters.forEach(function(ch) {
        var merged = readMergedSm2(ch);
        for (var i = 0; i < ch.total; i++) {
          var rec = merged[i];
          if (!rec || !rec.nextReview || rec.nextReview > Date.now()) continue;
          if (mode === 'overdue') {
            var todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
            if (rec.nextReview >= todayStart.getTime()) continue;
          }
          queue.push({ chapterId: ch.id, idx: i, record: rec, status: 'pending', finalScore: null });
        }
      });
      return queue;
    }
    function getSm2Mode() {
      var mode = document.querySelector('input[name="sm2mode"]:checked');
      return mode ? mode.value : 'sequential';
    }
    // 重定基线（非复习改标 / 复习中漂移到相邻题）：从对应等级种子重新计算，不累加
    function rebaselineSm2(idx, score) {
      sm2[idx] = calcSM2(getSm2Seed(score), score);
      saveSm2();
    }

    // ---- SM-2 复习面板 ----
    function sm2ChapterSummary(ch) {
      var due = 0, overdue = 0, queued = 0, mastered = 0;
      var merged = readMergedSm2(ch);
      for (var i = 0; i < ch.total; i++) {
        var rec = merged[i];
        if (!rec || !rec.nextReview) continue;
        var label = getSm2Label(rec);
        if (label === 'due') due++;
        else if (label === 'overdue') overdue++;
        else if (label === 'mastered') mastered++;
        else queued++;
      }
      return { due: due, overdue: overdue, queued: queued, mastered: mastered };
    }

    function toggleSm2Panel() {
      if (!sm2PanelOpen) {
        var panel = document.getElementById('sm2Panel');
        var mainContent = document.getElementById('mainAreaContent');
        var dashboard = document.getElementById('dashboardPanel');
        var wrongBook = document.getElementById('wrongBookPanel');
        if (dashboard) dashboard.style.display = 'none';
        if (wrongBook) wrongBook.style.display = 'none';
        dashboardOpen = false;
        wrongBookOpen = false;
        document.getElementById('btnDashboard').innerHTML = '全局进度<span class="sol-key">V</span>';
        document.getElementById('btnWrongBook').innerHTML = '错题本<span class="sol-key">B</span>';
        panel.style.display = 'block';
        mainContent.style.display = 'none';
        setPanelTitle('间隔重复复习');
        sm2PanelOpen = true;
        renderSm2Panel();
      } else {
        closeSm2Panel();
      }
    }

    function closeSm2Panel() {
      sm2PanelOpen = false;
      document.getElementById('sm2Panel').style.display = 'none';
      document.getElementById('mainAreaContent').style.display = '';
      setPanelTitle('');
      renderTitle();
    }

    // 章节行 HTML（模块分组 / 按书分组共用）
    function sm2ChapterRowHtml(ch, s) {
      var name = ch.short || ch.name;
      var statsStr = '';
      if (s.due) statsStr += '<span class="sm2-ch-due">到期 ' + s.due + '</span> ';
      if (s.overdue) statsStr += '<span class="sm2-ch-overdue">逾期 ' + s.overdue + '</span> ';
      if (s.queued) statsStr += '<span style="font-size:11px;color:#888">队列 ' + s.queued + '</span> ';
      if (s.mastered) statsStr += '<span style="font-size:11px;color:#F5A623">已掌握 ' + s.mastered + '</span> ';
      // 按钮状态：
      // - 今日无到期/逾期（due+overdue=0）且该章有 SM-2 记录（曾被复习过/有进度）→ 已完成（禁用）
      //   —— 用户今天已把到期题全部复习完，剩余题排到未来（queued）或已掌握（mastered）
      // - 有待复习项（due+overdue>0）→ 继续复习
      // - 无任何到期（如全 queued 但从未评级过）→ 复习
      var dueCount = s.due + s.overdue;
      var hasAnyRecord = (s.queued + s.mastered) > 0;
      var btnText, btnDisabled = '';
      if (dueCount === 0 && hasAnyRecord) {
        btnText = '已完成';
        btnDisabled = ' disabled style="opacity:0.6;cursor:default"';
      } else if (dueCount > 0) {
        btnText = '继续复习';
      } else {
        btnText = '复习';
      }
      return '<div class="sm2-ch-row">' +
        '<div class="sm2-ch-info"><span class="sm2-ch-name">' + name + '</span><span class="sm2-ch-stats">' + statsStr + '</span></div>' +
        '<button class="sm2-ch-btn"' + btnDisabled + ' data-action="review-chapter" data-cid="' + ch.id + '">' + btnText + '</button>' +
        '</div>';
    }

    // 复习面板按「模块」（canonicalSubj）分组：数学 高数/线代/概率论，单模块科目退化为按书布局。
    // 模块内按书（wbOrder 顺序，排除 1000题）分章；1000题内容已在合并章内统计（sm2ChapterSummary 用合并索引）。
    function renderSm2Panel() {
      var allDue = 0, allOverdue = 0, allQueued = 0, allMastered = 0;

      // 按模块分组
      var moduleMap = {};
      var subjOrder = curSubject ? curSubject.subjOrder : [];
      reviewChapters().forEach(function(ch) {
        var mod = canonicalSubj(ch.subj);
        (moduleMap[mod] = moduleMap[mod] || []).push(ch);
      });
      var moduleNames = [];
      subjOrder.forEach(function(s) { if (moduleMap[s]) moduleNames.push(s); });
      Object.keys(moduleMap).forEach(function(m) { if (moduleNames.indexOf(m) === -1) moduleNames.push(m); });

      var moduleHtmls = []; // 只保留有数据的模块 [{header, rows}]
      moduleNames.forEach(function(mod) {
        var modChs = moduleMap[mod];
        // 模块内按书分组（wbOrder 顺序，排除 1000题 数据源书）
        var bookMap = {};
        modChs.forEach(function(ch) { var wb = ch.wb || ''; (bookMap[wb] = bookMap[wb] || []).push(ch); });
        var bookNames = [];
        var wbOrder = curSubject ? curSubject.wbOrder : [];
        wbOrder.forEach(function(e) { if (e.wb !== '1000题' && bookMap[e.wb]) bookNames.push(e.wb); });
        Object.keys(bookMap).forEach(function(wb) { if (bookNames.indexOf(wb) === -1) bookNames.push(wb); });

        var rowsHtml = '';
        var modDue = 0, modOverdue = 0, modQueued = 0, modMastered = 0;
        bookNames.forEach(function(wb) {
          var bRows = [];
          bookMap[wb].forEach(function(ch) {
            var s = sm2ChapterSummary(ch);
            if (s.due + s.overdue + s.queued + s.mastered === 0) return;
            allDue += s.due; allOverdue += s.overdue; allQueued += s.queued; allMastered += s.mastered;
            modDue += s.due; modOverdue += s.overdue; modQueued += s.queued; modMastered += s.mastered;
            bRows.push({ ch: ch, summary: s });
          });
          if (bRows.length === 0) return;
          rowsHtml += '<div class="sm2-book-header" style="font-weight:700;color:var(--primary);margin:8px 0 4px;font-size:14px">' + getWbLabel(wb) + '</div>';
          bRows.forEach(function(row) { rowsHtml += sm2ChapterRowHtml(row.ch, row.summary); });
        });
        if (!rowsHtml) return; // 该模块无任何 SM-2 数据

        // 模块按钮状态：今日无到期/逾期且模块有记录 → 已完成（禁用）；否则复习此模块
        var modDueCount = modDue + modOverdue;
        var modHasRecord = (modQueued + modMastered) > 0;
        var modBtnDisabled = '', modBtnText = '复习此模块';
        if (modDueCount === 0 && modHasRecord) {
          modBtnText = '已完成';
          modBtnDisabled = ' disabled style="opacity:0.6;cursor:default"';
        }
        var header = '<div class="sm2-module-header">' +
          '<span class="sm2-module-name">' + mod + '</span>' +
          '<span class="sm2-mod-stats">' +
            (modDue ? '<span class="sm2-ch-due">到期 ' + modDue + '</span> ' : '') +
            (modOverdue ? '<span class="sm2-ch-overdue">逾期 ' + modOverdue + '</span> ' : '') +
          '</span>' +
          '<button class="sm2-mod-btn"' + modBtnDisabled + ' data-action="review-module" data-mod="' + mod + '">' + modBtnText + '</button>' +
          '</div>';
        moduleHtmls.push({ header: header, rows: rowsHtml });
      });

      // 更新统计卡片
      document.querySelector('#sm2CardDue .sm2-stat-num').textContent = allDue;
      document.querySelector('#sm2CardOverdue .sm2-stat-num').textContent = allOverdue;
      document.querySelector('#sm2CardQueue .sm2-stat-num').textContent = allQueued;
      document.querySelector('#sm2CardMastered .sm2-stat-num').textContent = allMastered;

      // 渲染章节列表：科目仅有 1 个模块时不渲染模块头，退化为按书布局
      var chHtml = '';
      var totalModuleCount = moduleNames.length;
      moduleHtmls.forEach(function(m) {
        if (totalModuleCount > 1) chHtml += m.header;
        chHtml += m.rows;
      });
      if (!chHtml) chHtml = '<div style="text-align:center;color:var(--text-muted);padding:20px">暂无 SM-2 复习数据。打标后自动生成。</div>';
      // 顶部续接按钮：存在未完成复习会话时显示
      var pending = loadReviewSession();
      if (pending) {
        var ungraded = pending.queue.filter(function(it) { return it.status !== 'graded'; }).length;
        chHtml = '<button class="sm2-resume-btn" data-action="resume-review">继续上次复习（剩余 ' + ungraded + ' 题）</button>' + chHtml;
      }
      var sm2Box = document.getElementById('sm2Chapters');
      sm2Box.innerHTML = chHtml;
      if (!sm2Box.dataset.bound) {
        sm2Box.dataset.bound = '1';
        sm2Box.addEventListener('click', function (e) {
          var btn = e.target.closest('button[data-action]');
          if (!btn || btn.disabled) return;
          var act = btn.dataset.action;
          if (act === 'review-chapter') {
            startReviewChapter(btn.dataset.cid);
          } else if (act === 'review-module') {
            startReviewModule(btn.dataset.mod);
          } else if (act === 'resume-review') {
            resumeReviewSession();
          }
        });
      }
      // 「开始全部复习」按钮状态：今日无到期/逾期且有记录 → 已完成（禁用）
      var startAllBtn = document.getElementById('btnSm2StartAll');
      if (startAllBtn) {
        var allDueCount = allDue + allOverdue;
        if (allDueCount === 0 && (allQueued + allMastered) > 0) {
          startAllBtn.textContent = '今日已完成';
          startAllBtn.disabled = true;
          startAllBtn.style.opacity = '0.6';
          startAllBtn.style.cursor = 'default';
        } else {
          startAllBtn.textContent = '开始全部复习';
          startAllBtn.disabled = false;
          startAllBtn.style.opacity = '';
          startAllBtn.style.cursor = '';
        }
      }
    }

    // 面板内联提示（替代 alert）：在 sm2Chapters 顶部显示一条短暂提示
    var sm2ToastTimer = null;
    function showSm2Toast(msg) {
      var box = document.getElementById('sm2Chapters');
      if (!box) return;
      // 插入提示条到列表顶部（保留现有章节行）
      var toast = document.createElement('div');
      toast.className = 'sm2-toast';
      toast.textContent = msg;
      box.insertBefore(toast, box.firstChild);
      if (sm2ToastTimer) clearTimeout(sm2ToastTimer);
      sm2ToastTimer = setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 2200);
    }

    // 复习某个模块（canonicalSubj）：跨 30讲/36讲/1000题段/李范全书 收集到期题
    function startReviewModule(module) {
      var mode = getSm2Mode();
      var chs = reviewChapters().filter(function(c) { return canonicalSubj(c.subj) === module; });
      var queue = collectDueItems(chs, mode);
      if (queue.length === 0) { showSm2Toast('该模块没有到期题目'); return; }
      startReview(queue, mode);
    }

    function startReviewChapter(chapterId) {
      var ch = chapterById(chapterId);
      if (!ch) return;
      var mode = getSm2Mode();
      var queue = collectDueItems([ch], mode);
      if (queue.length === 0) { showSm2Toast(mode === 'overdue' ? '该章节没有逾期题目' : '该章节没有到期题目'); return; }
      startReview(queue, mode);
    }

    var _startAllReview = function() {
      var mode = getSm2Mode();
      var queue = collectDueItems(reviewChapters(), mode);
      if (queue.length === 0) { showSm2Toast('没有到期题目'); return; }
      startReview(queue, mode);
    };

    // ===== 复习会话续接（kaoyan_review_session）=====
    // 持久化未完成复习会话，刷新/切科目后可继续。queue 项只存轻量字段（record 由 merged 实时读）。
    function saveReviewSession() {
      if (!reviewSession) return;
      var persist = {
        subjectId: curSubjectId, // 记录所属科目（切科目后据此判会话失效）
        queue: reviewSession.queue.map(function(it) {
          return { chapterId: it.chapterId, idx: it.idx, status: it.status || 'pending', finalScore: it.finalScore };
        }),
        currentIdx: reviewSession.currentIdx,
        mode: reviewSession.mode,
        originChapter: reviewSession.originChapter,
        originIdx: reviewSession.originIdx,
        done: !!reviewSession.done,
        savedAt: Date.now()
      };
      try { localStorage.setItem(reviewSessionStorageKey(), JSON.stringify(persist)); } catch (e) {}
    }
    function loadReviewSession() {
      var raw = null;
      try { raw = JSON.parse(localStorage.getItem(reviewSessionStorageKey())) || null; } catch (e) { raw = null; }
      if (!raw || !Array.isArray(raw.queue) || raw.queue.length === 0) return null;
      // 校验科目：会话记录的是上次的科目，切科目后视为失效
      if (raw.subjectId && raw.subjectId !== curSubjectId) return null;
      return raw;
    }
    function clearReviewSession() {
      try { localStorage.removeItem(reviewSessionStorageKey()); } catch (e) {}
    }

    function startReview(queue, mode) {
      if (mode === 'random') {
        for (var i = queue.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var tmp = queue[i]; queue[i] = queue[j]; queue[j] = tmp;
        }
      }
      reviewSession = { queue: queue, currentIdx: 0, mode: mode, originChapter: currentChapterId, originIdx: current };
      saveReviewSession();
      closeSm2Panel();
      // 进入复习 UI：隐藏进度块，显示复习队列面板与复习控件
      document.getElementById('statsBlock').style.display = 'none';
      document.getElementById('reviewQueuePanel').style.display = '';
      document.getElementById('reviewControls').style.display = '';
      // 跳转到第一题
      var first = queue[0];
      switchChapter(first.chapterId);
      switchTo(first.idx);
      // 渲染侧栏复习列表 + 标题进度
      renderReviewQueue();
      renderReviewProgress();
    }

    // 续接上次未完成复习：从存储重建会话并进入复习 UI
    function resumeReviewSession() {
      var persist = loadReviewSession();
      if (!persist) { showSm2Toast('没有待续接的复习'); return; }
      // 校验会话是否属于当前科目（切科目后若会话章节不在当前 CHAPTERS 中则清除，避免续接到错误科目）
      var validQueue = persist.queue.filter(function(it) { return !!chapterById(it.chapterId); });
      if (validQueue.length === 0) { clearReviewSession(); showSm2Toast('上次复习的科目已切换，无法续接'); return; }
      // 重建 queue（record 从 merged 实时读，finalScore/status 从存储恢复；过滤失效章节项）
      var queue = validQueue.map(function(it) {
        var ch = chapterById(it.chapterId);
        var rec = null;
        if (ch) {
          var merged = readMergedSm2(ch);
          rec = merged[it.idx] || null;
        }
        return { chapterId: it.chapterId, idx: it.idx, record: rec, status: it.status || 'pending', finalScore: it.finalScore };
      });
      reviewSession = {
        queue: queue,
        currentIdx: Math.min(Math.max(0, persist.currentIdx || 0), queue.length - 1),
        mode: persist.mode || 'sequential',
        originChapter: persist.originChapter,
        originIdx: persist.originIdx,
        done: !!persist.done
      };
      closeSm2Panel();
      document.getElementById('statsBlock').style.display = 'none';
      document.getElementById('reviewQueuePanel').style.display = '';
      document.getElementById('reviewControls').style.display = '';
      // 跳到当前复习项（done 态时越界则跳到队尾提示）
      var item = reviewCurrentItem();
      if (item) {
        switchChapter(item.chapterId);
        switchTo(item.idx);
      } else {
        // done 态：队尾
        switchChapter(persist.queue[persist.queue.length - 1].chapterId);
        switchTo(persist.queue[persist.queue.length - 1].idx);
      }
      renderReviewQueue();
      renderReviewProgress();
      saveReviewSession();
    }

    // 当前复习项（越界返回 null）
    function reviewCurrentItem() {
      if (!reviewSession) return null;
      var q = reviewSession.queue;
      if (reviewSession.currentIdx < 0 || reviewSession.currentIdx >= q.length) return null;
      return q[reviewSession.currentIdx];
    }

    // 复习进度标题：正常「📋 复习中 cur/total mode」；done 时「还有 K 题未复习」。
    // 复习时保留章节标题下拉的文本标签（书·模块·章节只读），仅隐藏下拉箭头，避免误切。
    function renderReviewProgress() {
      if (!reviewSession) return;
      var total = reviewSession.queue.length;
      var cur = reviewSession.currentIdx + 1;
      var panelTitle = document.getElementById('panelTitle');
      if (panelTitle) {
        var modeLabel = { sequential: '顺序', random: '随机', overdue: '仅逾期' }[reviewSession.mode] || '';
        if (reviewSession.done) {
          var ungraded = reviewSession.queue.filter(function(it) { return it.status !== 'graded'; }).length;
          panelTitle.textContent = '📋 还有 ' + ungraded + ' 题未复习';
        } else {
          panelTitle.textContent = '📋 复习中 ' + cur + '/' + total + ' ' + modeLabel;
        }
        panelTitle.style.display = '';
        document.querySelectorAll('#chapterTitleBar .title-dropdown .title-arrow').forEach(function(a) { a.style.display = 'none'; });
      }
    }

    // 侧栏复习队列：1..N 编号按钮，状态 current/graded/skipped/pending
    function renderReviewQueue() {
      var panel = document.getElementById('reviewQueue');
      if (!panel) return;
      if (!reviewSession) { panel.innerHTML = ''; return; }
      var queue = reviewSession.queue;
      panel.innerHTML = '';
      queue.forEach(function(item, i) {
        var btn = document.createElement('button');
        btn.className = 'review-q';
        btn.textContent = i + 1;
        btn.title = '第 ' + (i + 1) + ' 个复习题';
        if (reviewSession.done) {
          if (i === reviewSession.currentIdx) btn.classList.add('current');
        } else if (i === reviewSession.currentIdx) {
          btn.classList.add('current');
        }
        if (item.status === 'graded') btn.classList.add('graded');
        else if (item.status === 'skipped') btn.classList.add('skipped');
        btn.addEventListener('click', function() { reviewJump(i); });
        panel.appendChild(btn);
      });
      var header = document.getElementById('reviewQueueHeader');
      if (header) {
        if (reviewSession.done) {
          var ungraded = queue.filter(function(it) { return it.status !== 'graded'; }).length;
          header.textContent = '还有 ' + ungraded + ' 题未复习';
        } else {
          header.textContent = '本次复习 ' + queue.length + ' 题';
        }
      }
    }

    // 复习导航：delta=-1 后退（清 done），+1 前进（跳过已评级题，落到下一个未评级题）
    function reviewAdvance(delta) {
      if (!reviewSession) return;
      if (delta < 0) {
        reviewSession.currentIdx = Math.max(0, reviewSession.currentIdx - 1);
        reviewSession.done = false;
      } else {
        var q = reviewSession.queue;
        // 从当前位置向后找下一个未评级题（跳过已 graded 的题，如点回补评后顺路走到队尾）
        var idx = reviewSession.currentIdx + 1;
        while (idx < q.length && q[idx].status === 'graded') idx++;
        if (idx >= q.length) {
          var ungraded = q.filter(function(it) { return it.status !== 'graded'; }).length;
          if (ungraded === 0) { exitReviewSession(); return; }
          // 仍有未评级题：进入「done」态，停留并提示
          reviewSession.done = true;
          reviewSession.currentIdx = q.length;
          renderReviewQueue();
          renderReviewProgress();
          saveReviewSession();
          return;
        }
        reviewSession.currentIdx = idx;
      }
      var item = reviewSession.queue[reviewSession.currentIdx];
      switchChapter(item.chapterId);
      switchTo(item.idx);
      renderReviewQueue();
      renderReviewProgress();
      saveReviewSession();
    }

    function reviewPrev() { reviewAdvance(-1); }
    function reviewNext() { reviewAdvance(1); }
    // 点击侧栏编号跳到指定复习项（清除 done 态）
    function reviewJump(i) {
      if (!reviewSession) return;
      if (i < 0 || i >= reviewSession.queue.length) return;
      reviewSession.currentIdx = i;
      reviewSession.done = false;
      var item = reviewSession.queue[i];
      switchChapter(item.chapterId);
      switchTo(item.idx);
      renderReviewQueue();
      renderReviewProgress();
      saveReviewSession();
    }

    // 跳过当前项：仅标记不评级，不改 SM-2，进入下一题
    function reviewSkip() {
      if (!reviewSession) return;
      var item = reviewCurrentItem();
      if (!item) return;
      item.status = 'skipped';
      renderReviewQueue();
      reviewAdvance(1);
    }

    // 统一提交复习结果：按 chapterId 分组，对每个 finalScore!=null 的项用「复习前记录」渐进一次
    function commitReviewResults() {
      if (!reviewSession) return;
      var groups = {};
      reviewSession.queue.forEach(function(item) {
        if (item.finalScore == null) return;
        (groups[item.chapterId] = groups[item.chapterId] || []).push(item);
      });
      Object.keys(groups).forEach(function(cid) {
        var ch = chapterById(cid);
        if (!ch) return;
        var merged = readMergedSm2(ch);
        groups[cid].forEach(function(item) {
          merged[item.idx] = calcSM2(merged[item.idx], item.finalScore);
        });
        writeMergedSm2(ch, merged);
      });
      loadSm2(); // 刷新内存态，反映最新排期
    }

    function exitReviewSession() {
      if (!reviewSession) {
        // 兜底：恢复 UI（如意外状态下被调）
        document.getElementById('statsBlock').style.display = '';
        document.getElementById('reviewQueuePanel').style.display = 'none';
        document.getElementById('reviewControls').style.display = 'none';
        return;
      }
      // 提交结果即便 localStorage 写入失败也不阻断会话清理与 UI 恢复
      try {
        commitReviewResults();
      } catch (e) {
        console.warn('复习结果提交失败（已跳过写入，会话仍将结束）：', e);
      }
      clearReviewSession(); // 会话已结束，清除续接存储
      var originCh = reviewSession.originChapter;
      var originIdx = reviewSession.originIdx;
      reviewSession = null;
      // 恢复复习 UI
      document.getElementById('statsBlock').style.display = '';
      document.getElementById('reviewQueuePanel').style.display = 'none';
      document.getElementById('reviewControls').style.display = 'none';
      document.getElementById('sm2InfoBar').style.display = 'none';
      setPanelTitle('');
      document.querySelectorAll('#chapterTitleBar .title-dropdown .title-arrow').forEach(function(a) { a.style.display = ''; });
      if (originCh && originCh !== currentChapterId) {
        switchChapter(originCh);
        current = originIdx;
        switchTo(current);
      } else {
        // 同章复习：恢复进入复习前的题目（而不是停在最后一道复习题）
        if (originIdx !== undefined && originIdx !== null && originCh) {
          current = originIdx;
          switchTo(current);
        } else {
          renderTitle();
        }
      }
    }

    // 安装全局开始按钮 + 复习控件
    document.addEventListener('DOMContentLoaded', function() {
      var btn = document.getElementById('btnSm2StartAll');
      if (btn) btn.addEventListener('click', function() { _startAllReview(); });
      var bPrev = document.getElementById('btnReviewPrev');
      if (bPrev) bPrev.addEventListener('click', function() { reviewPrev(); });
      var bSkip = document.getElementById('btnReviewSkip');
      if (bSkip) bSkip.addEventListener('click', function() { reviewSkip(); });
      var bNext = document.getElementById('btnReviewNext');
      if (bNext) bNext.addEventListener('click', function() { reviewNext(); });
    });
    document.addEventListener('keydown', function (e) {
      // 标注模式下吃掉全部按键（Snipaste 式：避免切题/改状态等全局快捷键误触发）。
      // 需在 INPUT 判断之前：标注工具栏含 range 输入（粗细滑块），焦点在其上时 Alt 退出仍须生效。
      if (lbAnnotMode) { handleAnnotKeydown(e); return; }
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      const isShift = e.shiftKey;

      // 面板（全局进度/错题本/快捷键帮助/科目选择）打开时，仅允许面板相关按键，避免误操作隐藏的章节
      if (subjectPickerOpen) {
        // 科目选择弹窗独占：只放行 G（重新打开/切换）与 Esc（关闭），H 等不再叠加其它弹窗
        if (key !== 'g' && key !== 'escape') return;
      } else if (dashboardOpen || wrongBookOpen || shortcutHelpOpen || sm2PanelOpen) {
        const panelKeys = ['h', 'escape'];
        if (dashboardOpen || wrongBookOpen) panelKeys.push('v', 'b');
        if (sm2PanelOpen) panelKeys.push('m');
        if (!panelKeys.includes(key)) return;
      }

      // Alt：进入标注（进入/退出标注的快捷键；仅灯箱打开时生效）
      if (e.key === 'Alt' && !e.ctrlKey && !e.metaKey) {
        const lbEl = document.getElementById('lightbox');
        if (lbEl && lbEl.classList.contains('show')) {
          e.preventDefault();
          openAnnotator();
        }
        return;
      }

      // Ctrl+Z：撤销最近一次掌握度标记（同时清掉待触发的组合键定时器，避免残留误打标）
      if ((e.ctrlKey || e.metaKey) && key === 'z' && !isShift) {
        resetCombo();
        e.preventDefault();
        undoLastMark();
        return;
      }

      // Shift 筛选快捷键（先清组合键定时器：Shift+Z/X/C 会切筛选并跳题，
      // 若此前按过 Z 的 200ms 定时器未清，会误对新题目打标）
      if (isShift) {
        resetCombo();
        switch (key) {
          case 'a': e.preventDefault(); applyFilter('all'); return;
          case 'z': e.preventDefault(); applyFilter('proficient'); return;
          case 'x': e.preventDefault(); applyFilter('vague'); return;
          case 'c': e.preventDefault(); applyFilter('wrong'); return;
          case 'n': e.preventDefault(); applyFilter('unmarked'); return;
          case ' ': e.preventDefault(); toggleDefaultSolution(); return;
        }
      }

      // 灯箱打开（未处于标注模式）时：只放行灯箱自己的快捷键（Esc 关闭、+/=/0 缩放），
      // 屏蔽切题/改状态等全局快捷键，避免在放大查看图片时背后静默切换题目。
      if (document.getElementById('lightbox').classList.contains('show')) {
        if (key === 'escape') { closeLightbox(); return; }
        // +、=、-、0 在下方 switch 中按灯箱缩放处理
        if (key !== '+' && key !== '=' && key !== '-' && key !== '0') return;
      }

      // 带修饰键（Ctrl / Alt / Cmd）的普通键不放行：避免 Ctrl+A、Ctrl+W、Alt+A 等误触发放大/切题/改状态
      // （Shift 组合已在上方处理；Alt 进入标注已在前面单独处理）
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // 非 Z/X/C 键按下时打断待处理的组合超时，但要小心：快速「打标后紧跟导航键」
      // 不应取消尚未触发的单键标记。仅当这些键会「切换上下文/跳题」时才打断，
      // 避免 Z 后立刻按 R（标图质）导致标记静默丢失。
      if (key !== 'z' && key !== 'x' && key !== 'c') {
        if (['a','d','w','s','q','e','arrowleft','arrowright','arrowup','arrowdown',' ','v','b','m','g','f','h'].indexOf(key) !== -1) {
          resetCombo();
        }
      }

      switch (key) {
        // 上一题 / 下一题（题组级 / 子题级，见 navPrev / navNext）
        case 'a': case 'arrowleft': navPrev(); break;
        case 'd': case 'arrowright': navNext(); break;
        // 小题选择模式
        case 'f': toggleSubMode(); break;
        // 上一行 / 下一行（视觉网格行导航）
        case 'w': case 'arrowup': navUp(); break;
        case 's': case 'arrowdown': navDown(); break;
        // 掌握度（组合键）
        case 'z': case 'x': case 'c': e.preventDefault(); handleStatusKey(key); break;
        // 解析
        case ' ': e.preventDefault(); toggleSolution(); break;
        // 章节切换（复习中 Q/E = 上一/下一复习题）
        case 'q': if (reviewSession) reviewPrev(); else gotoPrevChapter(); break;
        case 'e': if (reviewSession) reviewNext(); else gotoNextChapter(); break;
        // 图片质量标记
        case 'r': toggleQBad(); break;
        case 't': toggleSBad(); break;
        // 笔记与帮助
        case 'n': e.preventDefault(); focusNotes(); break;
        case 'h': toggleShortcutHelp(); break;
        // 全局进度 / 错题本 / 间隔重复
        case 'v': toggleDashboard(); break;
        case 'b': toggleWrongBook(); break;
        case 'm': toggleSm2Panel(); break;
        // 切换科目
        case 'g': openSubjectPicker(); break;
        // 灯箱快捷键
        // Esc 关闭顺序：先关面板/灯箱/弹窗，再退复习——避免「复习中打开面板后按 Esc 直接退复习但面板残留」
        case 'escape':
          if (sm2PanelOpen) { closeSm2Panel(); return; }
          if (document.getElementById('lightbox').classList.contains('show')) { closeLightbox(); return; }
          if (subjectPickerOpen) { closeSubjectPicker(); return; }
          if (shortcutHelpOpen) { toggleShortcutHelp(); return; }
          if (dashboardOpen) { toggleDashboard(); return; }
          if (wrongBookOpen) { toggleWrongBook(); return; }
          if (reviewSession) { exitReviewSession(); return; }
          break;
        case '=':
        case '+': if (document.getElementById('lightbox').classList.contains('show')) { lbScale = Math.min(lbScale * 1.2, 5); lbApplyTransform(); return; } break;
        case '-': if (document.getElementById('lightbox').classList.contains('show')) { lbScale = Math.max(lbScale / 1.2, 0.5); lbApplyTransform(); return; } break;
        case '0': if (document.getElementById('lightbox').classList.contains('show')) { lbScale = 1; lbTranslateX = 0; lbTranslateY = 0; lbApplyTransform(); return; } break;
      }
    });

    // ===== 横向滚轮切题（常规状态，效果同 A/D 键） =====
    // 方向锁定策略：手势前几个事件确定主导方向（横/纵），之后互斥屏蔽。
    // — 锁定为横向：累积 dx，超 30 立即切题并用 lock 防连切，小幅度即可触发
    // — 锁定为纵向：整段手势忽略（触控板上下滑绝不切题）
    // — 300ms 无新事件 → 手势结束，全部重置
    // 触控板 vs 鼠标滚轮方向解耦：单次 |dx|≥50 判为鼠标滚轮（右滚→下一题），
    // 否则判为触控板（右滑→上一题）。两者语义天然相反。
    let _wDir = null, _wAccum = 0, _wLocked = false, _wTimer = null, _wIsMouse = false;
    document.addEventListener('wheel', function (e) {
      if (lbAnnotMode) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (subjectPickerOpen || dashboardOpen || wrongBookOpen || shortcutHelpOpen || sm2PanelOpen) return;
      if (document.getElementById('lightbox').classList.contains('show')) return;

      const dx = e.deltaX || 0, dy = e.deltaY || 0;
      const absDX = Math.abs(dx), absDY = Math.abs(dy);

      // 重置计时器：每次新事件都推迟 reset
      if (_wTimer) clearTimeout(_wTimer);
      _wTimer = setTimeout(function () {
        _wDir = null; _wAccum = 0; _wLocked = false; _wTimer = null; _wIsMouse = false;
      }, 300);

      if (_wLocked) return;

      // 方向未确定：哪个方向明显主导即锁定；同时标记设备类型
      if (_wDir === null) {
        if (absDX > absDY * 1.5 && absDX > 4) {
          _wDir = 'h';
          _wIsMouse = absDX >= 50; // 单次大增量 = 鼠标滚轮
        }
        else if (absDY > absDX * 1.5 && absDY > 4) { _wDir = 'v'; }
        else return; // 方向不明确，继续观察
      }

      if (_wDir === 'v') return; // 纵向手势，整段忽略

      // 横向手势：累积 dx，达标即切
      _wAccum += dx;
      if (Math.abs(_wAccum) > 15) {
        if (_wIsMouse) {
          // 鼠标滚轮：右滚→下一题
          if (_wAccum > 0) navNext();
          else navPrev();
        } else {
          // 触控板：右滑→上一题
          if (_wAccum > 0) navPrev();
          else navNext();
        }
        _wLocked = true;
        _wAccum = 0;
      }
    }, { passive: false });

    function bindBackupUi() {
      var btnExport = document.getElementById('btnBackupExport');
      var btnImport = document.getElementById('btnBackupImport');
      var fileInput = document.getElementById('inputBackupFile');
      var btnCancel = document.getElementById('btnCancelImport');
      var btnMerge = document.getElementById('btnMergeImport');
      var btnOverwrite = document.getElementById('btnOverwriteImport');

      if (btnExport && !btnExport.dataset.bound) {
        btnExport.dataset.bound = '1';
        btnExport.onclick = function () {
          void exportFullStudyBackup(false);
        };
      }
      if (btnImport && fileInput && !btnImport.dataset.bound) {
        btnImport.dataset.bound = '1';
        btnImport.onclick = function () {
          fileInput.value = '';
          fileInput.click();
        };
        fileInput.onchange = function (e) {
          if (e.target.files && e.target.files[0]) {
            void handleBackupFileSelected(e.target.files[0]);
          }
        };
      }
      if (btnCancel && !btnCancel.dataset.bound) {
        btnCancel.dataset.bound = '1';
        btnCancel.onclick = function () {
          var modal = document.getElementById('backupImportModal');
          if (modal) {
            modal.style.display = 'none';
            modal.hidden = true;
          }
        };
      }
      if (btnMerge && !btnMerge.dataset.bound) {
        btnMerge.dataset.bound = '1';
        btnMerge.onclick = function () {
          void applyImportPayload('merge');
        };
      }
      if (btnOverwrite && !btnOverwrite.dataset.bound) {
        btnOverwrite.dataset.bound = '1';
        btnOverwrite.onclick = function () {
          void applyImportPayload('overwrite');
        };
      }
    }

    // ===== 初始化流程 =====
    async function initAppSession() {
      const myToken = ++appBootToken;
      var savedSubject = localStorage.getItem(subjectStorageKey());
      curSubjectId = (savedSubject && SUBJECTS.some(function (s) { return s.id === savedSubject; })) ? savedSubject : 'shu1';
      curSubject = SUBJECTS.find(function (s) { return s.id === curSubjectId; });
      CHAPTERS = curSubject.chapters;

      migrateAllSm2();

      var resume = loadResume(curSubjectId);
      if (resume) {
        currentChapterId = resume.ch;
        current = resume.idx;
        subMode = resume.sub;
      } else {
        currentChapterId = curSubject.initChapterId;
        current = 0; subMode = false;
      }

      loadGlobalFilters(); loadSolutionPref();
      loadStatuses(); loadQBad(); loadSBad(); loadNotes(); loadSm2();

      if (!isAllFilterActive()) {
        const filtered = getFilteredIndices();
        if (filtered.length > 0 && filtered.indexOf(current) === -1) current = filtered[0];
      }
      renderTitle();
      renderStats();
      renderNav(); switchTo(current); updateFilterCounts();
      updateFilterButtons();
      renderSolDefaultBtn(); updateSolutionUI();
    }

    // 唯一的本地初始化入口
    let localAppBooted = false;

    async function bootLocalApp() {
      if (localAppBooted) return;
      localAppBooted = true;

      try {
        bindBackupUi();
        await migrateHistoricalUserData(); // 兼容旧版本本地键与历史命名空间安全迁移
        loadAnnotations();
        await initAppSession();

        // 首次使用时，题库初始化完成后再引导选择科目
        if (!localStorage.getItem(subjectStorageKey())) {
          openSubjectPicker();
        }
      } catch (error) {
        localAppBooted = false;
        console.error('[local] initAppSession failed:', error);

        var statusNode = document.getElementById('syncStatus');
        if (statusNode) {
          statusNode.textContent = '题库初始化失败，请刷新重试';
          statusNode.classList.add('is-error');
        }
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener(
        'DOMContentLoaded',
        function () {
          void bootLocalApp();
        },
        { once: true }
      );
    } else {
      void bootLocalApp();
    }

  
