/**
 * 考研政治知识图谱 - 投影层 (Graph Projection)
 * 将 Domain 数据和 View 状态投影为图渲染模型
 */
(function () {
  function build(domain, view) {
    // In Milestone 1, all demo nodes are projected to verify complete layout & relations
    const visibleNodes = domain.nodes;
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

    // 1. Build hierarchy edges (parent -> child)
    const hierarchyEdges = [];
    visibleNodes.forEach(node => {
      if (node.parentId && visibleNodeIds.has(node.parentId)) {
        hierarchyEdges.push({
          id: `hier-${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
          type: 'hierarchy',
          bookId: node.bookId,
          data: { type: 'hierarchy', bookId: node.bookId }
        });
      }
    });

    // 2. Build cross-subject relation edges
    const relationEdges = [];
    domain.relations.forEach(rel => {
      if (visibleNodeIds.has(rel.source) && visibleNodeIds.has(rel.target)) {
        relationEdges.push({
          id: rel.id,
          source: rel.source,
          target: rel.target,
          type: rel.type || 'related',
          label: rel.label || '',
          data: rel
        });
      }
    });

    return {
      nodes: visibleNodes,
      hierarchyEdges,
      relationEdges,
      edges: [...hierarchyEdges, ...relationEdges]
    };
  }

  function toRenderModel(projection, positions, store) {
    const config = window.PoliticsConfig || {};
    const bookColors = config.bookColors || {};
    const relationStyles = config.relationStyles || {};
    const nodeSizes = config.nodeSizes || {};

    // Map Nodes
    const nodes = projection.nodes.map(node => {
      const pos = positions.get(node.id) || { x: 0, y: 0, width: 170, height: 34 };
      const bookColor = bookColors[node.bookId] || { main: '#3B82F6', border: '#2563EB', bg: '#EFF6FF', text: '#1E3A8A' };
      const defaultSize = nodeSizes[node.kind] || [170, 34];
      const width = pos.width || defaultSize[0];
      const height = pos.height || defaultSize[1];

      return {
        id: node.id,
        data: node,
        kind: node.kind,
        bookId: node.bookId,
        x: pos.x,
        y: pos.y,
        size: [width, height],
        colors: bookColor
      };
    });

    // Map Edges
    const edges = projection.edges.map(edge => {
      if (edge.type === 'hierarchy') {
        const bookColor = bookColors[edge.bookId] || { border: '#94A3B8' };
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          edgeType: 'hierarchy',
          data: edge.data,
          renderType: 'cubic-horizontal',
          style: {
            stroke: bookColor.border || '#94A3B8',
            lineWidth: 2,
            opacity: 0.7,
            cursor: 'default'
          }
        };
      } else {
        const relStyle = relationStyles[edge.type] || relationStyles.default || { color: '#6366F1', lineDash: [4, 4] };
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          edgeType: 'relation',
          data: edge.data,
          renderType: 'cubic-horizontal',
          style: {
            stroke: relStyle.color || '#6366F1',
            lineWidth: 1.5,
            lineDash: relStyle.lineDash || [4, 4],
            opacity: 0.85,
            labelText: edge.label || '',
            labelFontSize: 11,
            labelFill: relStyle.color || '#475569',
            labelBackground: true,
            labelBackgroundFill: '#FFFFFF',
            labelBackgroundStroke: relStyle.color || '#CBD5E1',
            labelBackgroundLineWidth: 1,
            labelBackgroundRadius: 4,
            labelBackgroundPadding: [2, 6]
          }
        };
      }
    });

    return { nodes, edges };
  }

  window.PoliticsProjection = {
    build,
    toRenderModel
  };
})();
