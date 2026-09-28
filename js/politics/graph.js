/**
 * 考研政治知识图谱 - AntV G6 5.x 渲染适配器 (G6 Graph Wrapper)
 * Milestone 0 + 1
 */
(function () {
  let graph = null;
  let transformCallbacks = [];

  function initGraph(containerId) {
    if (!window.G6) {
      throw new Error('AntV G6 5.x library not loaded');
    }

    const { Graph, GraphEvent } = window.G6;
    const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;

    if (!container) {
      throw new Error(`Graph container '#${containerId}' not found`);
    }

    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 700;

    graph = new Graph({
      container,
      width,
      height,
      autoFit: false,
      behaviors: [
        'drag-canvas',
        'zoom-canvas'
      ],
      node: {
        type: 'rect'
      },
      edge: {
        type: 'cubic-horizontal'
      }
    });

    // Listen to canvas transform events (pan & zoom)
    if (GraphEvent && GraphEvent.AFTER_TRANSFORM) {
      graph.on(GraphEvent.AFTER_TRANSFORM, (e) => {
        try {
          const zoom = graph.getZoom();
          transformCallbacks.forEach(cb => {
            try { cb({ zoom, event: e }); } catch (err) { console.error(err); }
          });
        } catch (_) {
          // G6 internal camera runtime may not be ready during initial canvas setup
        }
      });
    }

    // Resize observer for responsive canvas sizing
    if (window.ResizeObserver) {
      const ro = new ResizeObserver(entries => {
        for (const entry of entries) {
          const { width: w, height: h } = entry.contentRect;
          if (w > 0 && h > 0 && graph) {
            graph.resize(w, h);
          }
        }
      });
      ro.observe(container);
    }

    return graph;
  }

  async function render(renderModel) {
    if (!graph) throw new Error('Graph not initialized before render()');

    const g6Nodes = renderModel.nodes.map(n => {
      const isBook = n.kind === 'book';
      const isChapter = n.kind === 'chapter';
      const isSection = n.kind === 'section';

      return {
        id: n.id,
        data: n.data,
        style: {
          x: n.x,
          y: n.y,
          size: n.size,
          type: 'rect',
          radius: isBook ? 8 : (isChapter ? 6 : 4),
          fill: n.colors.bg || '#FFFFFF',
          stroke: n.colors.border || '#94A3B8',
          lineWidth: isBook ? 2.5 : (isChapter ? 2 : 1.2),
          labelText: n.data.shortTitle || n.data.title,
          labelFill: n.colors.text || '#1E293B',
          labelFontSize: isBook ? 13 : (isChapter ? 12 : 11),
          labelFontWeight: isBook || isChapter ? 'bold' : 'normal',
          labelPlacement: 'center',
          cursor: 'pointer'
        }
      };
    });

    const g6Edges = renderModel.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.renderType || 'cubic-horizontal',
      style: e.style
    }));

    graph.setData({
      nodes: g6Nodes,
      edges: g6Edges
    });

    await graph.render();
  }

  function getGraph() {
    return graph;
  }

  function getZoom() {
    try {
      return graph ? graph.getZoom() : 1;
    } catch (_) {
      return 1;
    }
  }

  async function zoomIn() {
    if (!graph) return;
    const step = window.PoliticsConfig?.zoom?.step || 0.15;
    return await graph.zoomBy(1 + step, false);
  }

  async function zoomOut() {
    if (!graph) return;
    const step = window.PoliticsConfig?.zoom?.step || 0.15;
    return await graph.zoomBy(1 - step, false);
  }

  async function setZoom(zoom) {
    if (!graph) return;
    return await graph.zoomTo(zoom, false);
  }

  async function fitView() {
    if (!graph) return;
    await graph.fitView({ padding: 40 }, false);
  }

  async function resetView() {
    if (!graph) return;
    try {
      await graph.fitCenter(false);
      const targetZoom = window.PoliticsConfig?.zoom?.default || 0.75;
      await graph.zoomTo(targetZoom, false);
    } catch (e) {
      console.warn('[PoliticsGraph] resetView warning:', e);
    }
  }

  async function focusNode(nodeId, targetZoom) {
    if (!graph || !nodeId) return;
    try {
      if (typeof targetZoom === 'number') {
        await graph.zoomTo(targetZoom, false);
      } else {
        const curZoom = graph.getZoom();
        if (curZoom < 0.5) {
          const readableZoom = window.PoliticsConfig?.zoom?.default || 0.75;
          await graph.zoomTo(readableZoom, false);
        }
      }
      await graph.focusElement(nodeId, false);
    } catch (_) {
      try {
        await graph.focusElement(nodeId);
      } catch (err) {
        console.warn('[PoliticsGraph] focusNode fallback error:', err);
      }
    }
  }

  function onTransform(callback) {
    transformCallbacks.push(callback);
  }

  window.PoliticsGraph = {
    initGraph,
    render,
    getGraph,
    getZoom,
    zoomIn,
    zoomOut,
    setZoom,
    fitView,
    resetView,
    focusNode,
    onTransform
  };
})();
