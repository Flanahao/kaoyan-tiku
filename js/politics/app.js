/** Politics V1.1 app controller */

(function () {
  let ready =
    false;

  function esc(value) {
    return String(
      value ??
      ''
    )
      .replace(
        /&/g,
        '&amp;'
      )
      .replace(
        /</g,
        '&lt;'
      )
      .replace(
        />/g,
        '&gt;'
      )
      .replace(
        /"/g,
        '&quot;'
      );
  }

  let rebuildQueue = Promise.resolve();

  function rebuild(
    reason = 'update',
    options = {}
  ) {
    rebuildQueue = rebuildQueue.then(async () => {
      await doRebuild(reason, options);
    }).catch(err => {
      console.error('[PoliticsApp] rebuild error:', err);
    });
    return rebuildQueue;
  }

  async function doRebuild(
    reason = 'update',
    options = {}
  ) {
    const store =
      window.PoliticsStore;

    const projection =
      window
        .PoliticsProjection
        .build(
          store.domain,
          store.view
        );

    const layoutModel =
      window
        .PoliticsLayout
        .computeLayout(
          store.domain,
          projection.nodes
        );

    const renderModel =
      window
        .PoliticsProjection
        .toRenderModel(
          projection,
          layoutModel,
          store
        );

    await window
      .PoliticsGraph
      .render(
        renderModel
      );

    const count =
      document.getElementById(
        'politicsVisibleCount'
      );

    if (count) {
      count.textContent =
        `${renderModel.nodes.length} / ${store.domain.nodes.length} 节点`;
    }

    renderInspector();

    if (
      options.fit
    ) {
      await window
        .PoliticsGraph
        .fitView();
    }

    console.debug(
      '[PoliticsApp] rebuild:',

      reason,

      {
        visibleNodes:
          renderModel
            .nodes
            .length,

        hierarchyEdges:
          renderModel
            .hierarchyEdges
            .length,

        relationEdges:
          renderModel
            .relationEdges
            .length
      }
    );
  }

  function renderInspector() {
    const panel =
      document.getElementById(
        'politicsInspector'
      );

    const store =
      window.PoliticsStore;

    const id =
      store
        .view
        .selectedNodeId;

    const node =
      id
        ? store.getNode(id)
        : null;

    if (!panel) {
      return;
    }

    if (!node) {
      panel
        .classList
        .remove(
          'is-open'
        );

      panel.innerHTML =
        '';

      return;
    }

    const book =
      store
        .domain
        .booksById
        .get(
          node.bookId
        );

    const summary =
      node
        .detail
        ?.summary ||
      '暂无摘要';

    const tags =
      (
        node.tags ||
        []
      ).slice(
        0,
        6
      );

    panel.innerHTML = `
      <div class="politics-inspector-head">
        <span class="politics-inspector-book">
          ${esc(book?.title || node.bookId)}
        </span>

        <button
          id="btnInspectorClose"
          type="button"
          aria-label="关闭"
        >
          ×
        </button>
      </div>

      <h2>
        ${esc(node.title)}
      </h2>

      <p>
        ${esc(summary)}
      </p>

      ${
        tags.length
          ? `
            <div class="politics-inspector-tags">
              ${
                tags
                  .map(
                    tag =>
                      `<span>${esc(tag)}</span>`
                  )
                  .join('')
              }
            </div>
          `
          : ''
      }

      ${
        window
          .PoliticsStore
          .hasChildren(
            node.id
          )

          ? `
            <button
              class="politics-inspector-expand"
              id="btnInspectorToggle"
            >
              ${
                window
                  .PoliticsStore
                  .isExpanded(
                    node.id
                  )
                  ? '收起此节点'
                  : '展开下一级'
              }
            </button>
          `

          : ''
      }
    `;

    panel
      .classList
      .add(
        'is-open'
      );

    document
      .getElementById(
        'btnInspectorClose'
      )
      ?.addEventListener(
        'click',

        async () => {
          store
            .view
            .selectedNodeId =
            null;

          await rebuild(
            'close-inspector'
          );
        }
      );

    document
      .getElementById(
        'btnInspectorToggle'
      )
      ?.addEventListener(
        'click',

        async () => {
          store.toggleExpanded(
            node.id
          );

          await rebuild(
            'inspector-toggle'
          );

          await window
            .PoliticsGraph
            .focusNode(
              node.id
            );
        }
      );
  }

  function updateZoomUI(
    scale
  ) {
    const percent =
      Math.round(
        scale *
        100
      );

    const text =
      document.getElementById(
        'politicsZoomText'
      );

    const range =
      document.getElementById(
        'politicsZoomRange'
      );

    if (text) {
      text.textContent =
        `${percent}%`;
    }

    if (range) {
      range.value =
        String(
          Math.max(
            18,

            Math.min(
              180,
              percent
            )
          )
        );
    }
  }

  function bindGraphEvents() {
    const store =
      window.PoliticsStore;

    window
      .PoliticsGraph
      .onNodeClick(
        async id => {
          store
            .view
            .selectedNodeId =
            id;

          await rebuild(
            'select-node'
          );
        }
      );

    const toggle =
      async id => {
        if (
          !store.toggleExpanded(
            id
          )
        ) {
          return;
        }

        await rebuild(
          'toggle-node'
        );

        await window
          .PoliticsGraph
          .focusNode(
            id
          );
      };

    window
      .PoliticsGraph
      .onNodeDoubleClick(
        toggle
      );

    window
      .PoliticsGraph
      .onNodeToggle(
        toggle
      );

    /*
     * Hover 不 rebuild 全图。
     *
     * 只操作 relation DOM class。
     */
    window
      .PoliticsGraph
      .onNodeHover(
        (
          id,
          entering
        ) => {
          store
            .view
            .hoveredNodeId =
            entering
              ? id
              : null;

          window
            .PoliticsGraph
            .setHoveredNode(
              entering
                ? id
                : null
            );
        }
      );

    window
      .PoliticsGraph
      .onCanvasClick(
        async () => {
          if (
            !store
              .view
              .selectedNodeId
          ) {
            return;
          }

          store
            .view
            .selectedNodeId =
            null;

          await rebuild(
            'canvas-deselect'
          );
        }
      );

    window
      .PoliticsGraph
      .onTransform(
        ({
          scale
        }) => {
          updateZoomUI(
            scale
          );
        }
      );
  }

  function bindControls() {
    const fit =
      document.getElementById(
        'btnPoliticsFit'
      );

    const reset =
      document.getElementById(
        'btnPoliticsReset'
      );

    const zoomIn =
      document.getElementById(
        'btnPoliticsZoomIn'
      );

    const zoomOut =
      document.getElementById(
        'btnPoliticsZoomOut'
      );

    const range =
      document.getElementById(
        'politicsZoomRange'
      );

    const relations =
      document.getElementById(
        'btnPoliticsRelations'
      );

    fit
      ?.addEventListener(
        'click',

        () =>
          window
            .PoliticsGraph
            .fitView()
      );

    reset
      ?.addEventListener(
        'click',

        () =>
          window
            .PoliticsGraph
            .resetView()
      );

    zoomIn
      ?.addEventListener(
        'click',

        () =>
          window
            .PoliticsGraph
            .zoomIn()
      );

    zoomOut
      ?.addEventListener(
        'click',

        () =>
          window
            .PoliticsGraph
            .zoomOut()
      );

    range
      ?.addEventListener(
        'input',

        event =>
          window
            .PoliticsGraph
            .setZoom(
              Number(
                event
                  .target
                  .value
              ) /
              100
            )
      );

    relations
      ?.addEventListener(
        'click',

        async () => {
          const store =
            window.PoliticsStore;

          store
            .view
            .showRelations =
            !store
              .view
              .showRelations;

          relations
            .classList
            .toggle(
              'is-active',

              store
                .view
                .showRelations
            );

          relations
            .setAttribute(
              'aria-pressed',

              String(
                store
                  .view
                  .showRelations
              )
            );

          relations.textContent =
            store
              .view
              .showRelations

              ? '关联线：开'

              : '关联线：关';

          await rebuild(
            'toggle-relations'
          );
        }
      );

    window.addEventListener(
      'keydown',

      async event => {
        if (
          [
            'INPUT',
            'TEXTAREA'
          ].includes(
            event
              .target
              ?.tagName
          )
        ) {
          return;
        }

        if (
          event.key
            .toLowerCase() ===
          'f'
        ) {
          await window
            .PoliticsGraph
            .fitView();
        }

        if (
          event.key ===
          '0'
        ) {
          await window
            .PoliticsGraph
            .resetView();
        }

        if (
          event.key ===
            'Escape' &&
          window
            .PoliticsStore
            .view
            .selectedNodeId
        ) {
          window
            .PoliticsStore
            .view
            .selectedNodeId =
            null;

          await rebuild(
            'escape'
          );
        }
      }
    );
  }

  async function bootstrap() {
    if (ready) {
      return;
    }

    const error =
      document.getElementById(
        'politicsErrorBanner'
      );

    try {
      const domain =
        await window
          .PoliticsDataLoader
          .load();

      const result =
        window
          .PoliticsValidator
          .validate(
            domain
          );

      if (
        !result.valid
      ) {
        throw new Error(
          result.errors.join(
            '\n'
          )
        );
      }

      window
        .PoliticsStore
        .init(
          domain
        );

      window
        .PoliticsGraph
        .initGraph(
          'politicsGraph'
        );

      bindGraphEvents();
      bindControls();

      await rebuild(
        'bootstrap'
      );

      await window
        .PoliticsGraph
        .fitView();

      updateZoomUI(
        window
          .PoliticsGraph
          .getZoom()
      );

      ready =
        true;

      window.__POLITICS_READY__ =
        true;
    } catch (err) {
      console.error(
        '[PoliticsApp] bootstrap failed',

        err
      );

      if (error) {
        error.hidden =
          false;

        error.textContent =
          `政治导图加载失败：${err.message || err}`;
      }
    }
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      bootstrap
    );
  } else {
    bootstrap();
  }

  window.PoliticsApp = {
    bootstrap,
    rebuild
  };
})();
