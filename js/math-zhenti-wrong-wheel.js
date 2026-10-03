/* 数学历年真题错题转盘。无外部依赖，不持久化任何状态。 */
(function (root) {
  'use strict';

  function normalizeYears(rows) {
    if (!Array.isArray(rows)) return [];
    const seen = new Set();
    return rows.map(row => ({
      year: Number(row && row.year),
      chapterId: row && row.chapterId,
      wrong: Number(row && row.wrong) || 0,
      vague: Number(row && row.vague) || 0
    })).filter(row => {
      if (!Number.isInteger(row.year) || row.year < 1987 || row.year > 2026) return false;
      if (!row.chapterId || seen.has(row.year)) return false;
      if (row.wrong < 0 || row.vague < 0 || row.wrong + row.vague <= 0) return false;
      seen.add(row.year);
      return true;
    }).sort((a, b) => a.year - b.year);
  }

  function chooseIndex(length, random) {
    if (!Number.isInteger(length) || length <= 0) return -1;
    const rnd = random || Math.random;
    const value = Number(rnd());
    if (!Number.isFinite(value)) throw new Error('随机数无效');
    return Math.min(length - 1, Math.max(0, Math.floor(value * length)));
  }

  function readYearRowsFromCurrentApp() {
    var chapters = (root.MATH_ZHENTI_CHAPTERS && Array.isArray(root.MATH_ZHENTI_CHAPTERS))
      ? root.MATH_ZHENTI_CHAPTERS
      : (root.window && Array.isArray(root.window.MATH_ZHENTI_CHAPTERS) ? root.window.MATH_ZHENTI_CHAPTERS : []);
    if (!chapters.length) return [];

    var bridge = root.DailyStudyWheelBridge || root.DailyWrongWheelBridge ||
      (root.window && (root.window.DailyStudyWheelBridge || root.window.DailyWrongWheelBridge));
    var rows = [];

    for (var i = 0; i < chapters.length; i++) {
      var ch = chapters[i];
      if (!ch || !ch.id) continue;

      var m = (ch.id && String(ch.id).match(/^s1_zt_(\d{4})$/)) ||
              (ch.name && String(ch.name).match(/(\d{4})/)) ||
              (ch.short && String(ch.short).match(/(\d{4})/));
      if (!m) continue;
      var year = parseInt(m[1], 10);
      if (!Number.isInteger(year) || year < 1987 || year > 2026) continue;

      var wrong = 0;
      var vague = 0;

      if (bridge && typeof bridge.getChapterMistakes === 'function') {
        var mistakes = bridge.getChapterMistakes('shu1', ch.id);
        if (mistakes) {
          wrong = Number(mistakes.wrong) || 0;
          vague = Number(mistakes.vague) || 0;
        }
      } else {
        var getPrefix = (bridge && typeof bridge.getStoragePrefix === 'function')
          ? bridge.getStoragePrefix
          : (typeof root.userStoragePrefix === 'function' ? root.userStoragePrefix : null);
        var prefix = getPrefix ? getPrefix() : 'user_guest_';
        var key = prefix + ch.id + '_s1_status';
        var statusObj = {};
        try {
          var raw = (typeof root.safeStorageGet === 'function')
            ? root.safeStorageGet(key)
            : (root.localStorage ? root.localStorage.getItem(key) : null);
          statusObj = JSON.parse(raw || '{}');
        } catch (e) {
          statusObj = {};
        }
        var total = ch.ownTotal || ch.total || (Array.isArray(ch.labels) ? ch.labels.length : 0);
        for (var q = 0; q < total; q++) {
          var s = statusObj[q];
          if (s === 'wrong') wrong++;
          else if (s === 'vague' || s === 'rusty') vague++;
        }
      }

      if (wrong + vague > 0) {
        rows.push({
          year: year,
          chapterId: ch.id,
          wrong: wrong,
          vague: vague
        });
      }
    }
    return rows;
  }

  function create(options) {
    if (!options || typeof options.getYears !== 'function' ||
        typeof options.openWrongChapter !== 'function') {
      throw new TypeError('必须提供 getYears 和 openWrongChapter');
    }
    const doc = options.document || root.document;
    const random = options.random || Math.random;
    const mount = options.mount || doc.body;
    let years = [], selected = null, spinning = false, rotation = 0;

    const overlay = doc.createElement('div');
    overlay.className = 'mzw-overlay';
    overlay.id = options.id || 'mathZhentiWrongWheelModal';
    overlay.hidden = true;
    overlay.innerHTML = [
      '<div class="mzw-dialog" role="dialog" aria-modal="true" aria-labelledby="mzw-title">',
      '  <button type="button" class="mzw-close" aria-label="关闭">×</button>',
      '  <h2 id="mzw-title">数学历年真题错题转盘</h2>',
      '  <p class="mzw-hint">只抽取有不会或模糊题的年份</p>',
      '  <div class="mzw-wheel-wrap"><span class="mzw-pointer" aria-hidden="true"></span>',
      '    <canvas class="mzw-wheel" width="520" height="520" role="img" aria-label="真题年份转盘"></canvas>',
      '  </div>',
      '  <p class="mzw-result" role="status" aria-live="polite"></p>',
      '  <div class="mzw-actions">',
      '    <button type="button" class="mzw-spin">转动转盘</button>',
      '    <button type="button" class="mzw-review" disabled>复习该年错题</button>',
      '  </div>',
      '</div>'
    ].join('');
    mount.appendChild(overlay);
    const canvas = overlay.querySelector('.mzw-wheel');
    const result = overlay.querySelector('.mzw-result');
    const spinButton = overlay.querySelector('.mzw-spin');
    const reviewButton = overlay.querySelector('.mzw-review');
    const closeButton = overlay.querySelector('.mzw-close');

    function draw() {
      const ctx = canvas && typeof canvas.getContext === 'function' ? canvas.getContext('2d') : null;
      if (!ctx) return;
      const size = canvas.width, center = size / 2, radius = center - 8;
      ctx.clearRect(0, 0, size, size);
      if (!years.length) {
        ctx.fillStyle = '#e8eef8';
        ctx.beginPath(); ctx.arc(center, center, radius, 0, Math.PI * 2); ctx.fill();
        return;
      }
      const slice = Math.PI * 2 / years.length;
      years.forEach((item, index) => {
        const start = -Math.PI / 2 + index * slice;
        ctx.beginPath(); ctx.moveTo(center, center);
        ctx.arc(center, center, radius, start, start + slice); ctx.closePath();
        ctx.fillStyle = index % 2 ? '#d9eafa' : '#4675bd'; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.save(); ctx.translate(center, center); ctx.rotate(start + slice / 2);
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillStyle = index % 2 ? '#183459' : '#fff';
        ctx.font = years.length > 24 ? 'bold 13px sans-serif' : 'bold 18px sans-serif';
        ctx.fillText(String(item.year), radius - 18, 0);
        ctx.restore();
      });
      ctx.beginPath(); ctx.arc(center, center, 25, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill();
    }

    async function open() {
      if (spinning) return;
      overlay.hidden = false;
      selected = null; reviewButton.disabled = true;
      result.textContent = '正在读取真题错题…';
      try {
        years = normalizeYears(await options.getYears());
        draw();
        spinButton.disabled = !years.length;
        result.textContent = years.length
          ? `当前 ${years.length} 个年份有错题，可开始抽取`
          : '暂无可复习的真题错题';
      } catch (error) {
        years = []; draw(); spinButton.disabled = true;
        result.textContent = '读取真题错题失败，请检查数据加载状态';
        if (options.onError) options.onError(error);
      }
      if (closeButton && typeof closeButton.focus === 'function') closeButton.focus();
    }

    function close() {
      if (spinning) return;
      overlay.hidden = true;
    }

    function spin() {
      if (spinning || !years.length) return;
      const index = chooseIndex(years.length, random);
      selected = years[index]; spinning = true;
      reviewButton.disabled = true; spinButton.disabled = true;
      result.textContent = '转盘转动中…';
      const target = (360 - (index + .5) * 360 / years.length + 360) % 360;
      rotation += 2160 + ((target - rotation % 360 + 360) % 360);
      canvas.style.transition = 'transform 4.5s cubic-bezier(.12,.7,.12,1)';
      canvas.style.transform = `rotate(${rotation}deg)`;
      const setTimer = (root && typeof root.setTimeout === 'function') ? root.setTimeout : setTimeout;
      setTimer(() => {
        spinning = false; spinButton.disabled = false; reviewButton.disabled = false;
        result.textContent = `抽中 ${selected.year} 年：不会 ${selected.wrong} 题，模糊 ${selected.vague} 题`;
      }, 4550);
    }

    function review() {
      if (!selected || spinning) return;
      options.openWrongChapter('shu1', selected.chapterId, 'mistakes');
    }

    spinButton.addEventListener('click', spin);
    reviewButton.addEventListener('click', review);
    closeButton.addEventListener('click', close);
    overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
    doc.addEventListener('keydown', event => {
      if (!overlay.hidden && event.key === 'Escape') close();
    });
    return {
      open,
      close,
      draw,
      getSelected: () => selected,
      getYearsList: () => years,
      isSpinning: () => spinning,
      spin,
      review,
      element: overlay
    };
  }

  root.MathZhentiWrongWheel = {
    create,
    normalizeYears,
    chooseIndex,
    readYearRowsFromCurrentApp
  };
})(typeof window === 'undefined' ? globalThis : window);
