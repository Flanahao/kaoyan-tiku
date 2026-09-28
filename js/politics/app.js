/**
 * 考研政治知识图谱 - 页面主控制器 (App Bootstrap)
 * Milestone 0 + 1
 */
(function () {
  let isBootstrapping = false;

  async function bootstrap() {
    if (isBootstrapping) return;
    isBootstrapping = true;

    const errorContainer = document.getElementById('politicsErrorBanner');
    const visibleCountEl = document.getElementById('politicsVisibleCount');

    try {
      // 1. Load Data via Dual Driver
      console.info('[PoliticsApp] Loading politics data...');
      const domainData = await window.PoliticsDataLoader.load();

      // 2. Validate Data
      console.info('[PoliticsApp] Validating canonical data...');
      const validation = window.PoliticsValidator.validate(domainData);
      if (!validation.valid) {
        throw new Error(`Data validation failed:\n${validation.errors.join('\n')}`);
      }

      // 3. Initialize Store
      window.PoliticsStore.init(domainData);

      // 4. Initialize G6 Graph
      console.info('[PoliticsApp] Initializing G6 Graph...');
      window.PoliticsGraph.initGraph('politicsGraph');

      // 5. Compute Projection & Layout
      console.info('[PoliticsApp] Computing projection and layout...');
      const projection = window.PoliticsProjection.build(
        window.PoliticsStore.domain,
        window.PoliticsStore.view
      );

      const positions = window.PoliticsLayout.computeLayout(
        window.PoliticsStore.domain,
        projection.nodes
      );

      const renderModel = window.PoliticsProjection.toRenderModel(
        projection,
        positions,
        window.PoliticsStore
      );

      // 6. Render
      await window.PoliticsGraph.render(renderModel);

      // 7. Initial Fit View
      try {
        await window.PoliticsGraph.fitView();
        updateZoomUI(window.PoliticsGraph.getZoom());
      } catch (e) {
        console.warn('[PoliticsApp] Fit view warning:', e);
      }

      // 8. Bind UI Controls & Period Bar
      initPeriodBar(domainData.periods);
      bindToolbarEvents();
      bindTransformListener();

      // Update node & relation count
      if (visibleCountEl) {
        visibleCountEl.textContent = `当前展示 ${renderModel.nodes.length} 个考点节点 · ${renderModel.edges.length} 条关系（${projection.hierarchyEdges.length} 层级 / ${projection.relationEdges.length} 跨学科）`;
      }

      window.__POLITICS_READY__ = true;
      console.info('[PoliticsApp] Bootstrap completed successfully.');
    } catch (err) {
      console.error('[PoliticsApp] Fatal error during bootstrap:', err);
      if (errorContainer) {
        errorContainer.hidden = false;
        errorContainer.innerHTML = `
          <div class="politics-error-box">
            <h3>⚠️ 政治知识图谱加载异常</h3>
            <p>${escapeHtml(err.message || String(err))}</p>
            <button onclick="location.reload()" class="politics-btn primary">重新加载</button>
          </div>
        `;
      }
    } finally {
      isBootstrapping = false;
    }
  }

  function initPeriodBar(periods = []) {
    const bar = document.getElementById('politicsPeriodBar');
    if (!bar) return;

    bar.innerHTML = '';

    // "全景视角" button
    const allBtn = document.createElement('button');
    allBtn.className = 'politics-period-pill active';
    allBtn.textContent = '🌟 全学科全景';
    allBtn.addEventListener('click', async () => {
      bar.querySelectorAll('.politics-period-pill').forEach(b => b.classList.remove('active'));
      allBtn.classList.add('active');
      await window.PoliticsGraph.fitView();
    });
    bar.appendChild(allBtn);

    // Period buttons
    periods.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'politics-period-pill';
      btn.innerHTML = `<span class="period-dot"></span>${escapeHtml(p.title)} <small>(${p.dateRange})</small>`;
      btn.addEventListener('click', async () => {
        bar.querySelectorAll('.politics-period-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Locate first sg node in this period, with fallbacks
        const targetNode = window.PoliticsStore.domain.nodes.find(
          n => n.bookId === 'sg' && n.periodId === p.id && n.kind === 'chapter'
        ) || window.PoliticsStore.domain.nodes.find(
          n => n.bookId === 'sg' && n.periodId === p.id
        ) || window.PoliticsStore.domain.nodes.find(
          n => n.periodId === p.id && n.kind === 'chapter'
        ) || window.PoliticsStore.domain.nodes.find(
          n => n.periodId === p.id
        );

        if (targetNode) {
          await window.PoliticsGraph.focusNode(targetNode.id);
        }
      });
      bar.appendChild(btn);
    });
  }

  function bindToolbarEvents() {
    const btnFit = document.getElementById('btnPoliticsFit');
    const btnReset = document.getElementById('btnPoliticsReset');
    const btnZoomIn = document.getElementById('btnPoliticsZoomIn');
    const btnZoomOut = document.getElementById('btnPoliticsZoomOut');
    const zoomRange = document.getElementById('politicsZoomRange');

    btnFit?.addEventListener('click', async () => {
      await window.PoliticsGraph.fitView();
      updateZoomUI(window.PoliticsGraph.getZoom());
    });
    btnReset?.addEventListener('click', async () => {
      await window.PoliticsGraph.resetView();
      updateZoomUI(window.PoliticsGraph.getZoom());
    });
    btnZoomIn?.addEventListener('click', async () => {
      await window.PoliticsGraph.zoomIn();
      updateZoomUI(window.PoliticsGraph.getZoom());
    });
    btnZoomOut?.addEventListener('click', async () => {
      await window.PoliticsGraph.zoomOut();
      updateZoomUI(window.PoliticsGraph.getZoom());
    });

    zoomRange?.addEventListener('input', async (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) {
        await window.PoliticsGraph.setZoom(val / 100);
        const zoomText = document.getElementById('politicsZoomText');
        if (zoomText) zoomText.textContent = `${val}%`;
      }
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', async (e) => {
      // Don't trigger if user is in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.key === '0') {
        await window.PoliticsGraph.resetView();
        updateZoomUI(window.PoliticsGraph.getZoom());
      } else if (e.key.toLowerCase() === 'f') {
        await window.PoliticsGraph.fitView();
        updateZoomUI(window.PoliticsGraph.getZoom());
      } else if (e.key === '+' || e.key === '=') {
        await window.PoliticsGraph.zoomIn();
        updateZoomUI(window.PoliticsGraph.getZoom());
      } else if (e.key === '-' || e.key === '_') {
        await window.PoliticsGraph.zoomOut();
        updateZoomUI(window.PoliticsGraph.getZoom());
      }
    });
  }

  function bindTransformListener() {
    window.PoliticsGraph.onTransform(({ zoom }) => {
      updateZoomUI(zoom);
    });
  }

  function updateZoomUI(zoom) {
    const zoomText = document.getElementById('politicsZoomText');
    const zoomRange = document.getElementById('politicsZoomRange');
    const percent = Math.round(zoom * 100);

    if (zoomText) zoomText.textContent = `${percent}%`;
    if (zoomRange) zoomRange.value = Math.max(20, Math.min(200, percent));
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Auto bootstrap when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

  window.PoliticsApp = {
    bootstrap
  };
})();
