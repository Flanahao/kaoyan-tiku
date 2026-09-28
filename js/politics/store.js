/**
 * 考研政治知识图谱 - 领域与视图状态存储 (Domain & View Store)
 */
(function () {
  const store = {
    domain: {
      books: [],
      periods: [],
      nodes: [],
      relations: [],
      nodeMap: new Map(),
      childrenMap: new Map(),
      relationsByNodeId: new Map(),
      periodMap: new Map(),
      booksById: new Map()
    },

    view: {
      mode: 'graph',
      zoom: window.PoliticsConfig?.zoom?.default || 0.75,
      viewport: { x: 0, y: 0 },
      selectedNodeId: null,
      hoveredNodeId: null,
      relationFilters: new Set(['theory_application', 'historical_context', 'evolution', 'cause', 'compare'])
    },

    init(domainData) {
      this.domain.books = domainData.books || [];
      this.domain.periods = domainData.periods || [];
      this.domain.nodes = domainData.nodes || [];
      this.domain.relations = domainData.relations || [];

      // Rebuild indexes
      const nodeMap = new Map();
      const childrenMap = new Map();
      const relationsByNodeId = new Map();
      const periodMap = new Map();
      const booksById = new Map();

      this.domain.books.forEach(b => booksById.set(b.id, b));
      this.domain.periods.forEach(p => periodMap.set(p.id, p));

      this.domain.nodes.forEach(node => {
        nodeMap.set(node.id, node);
        if (node.parentId) {
          if (!childrenMap.has(node.parentId)) childrenMap.set(node.parentId, []);
          childrenMap.get(node.parentId).push(node.id);
        }
      });

      this.domain.relations.forEach(rel => {
        [rel.source, rel.target].forEach(nid => {
          if (!relationsByNodeId.has(nid)) relationsByNodeId.set(nid, []);
          relationsByNodeId.get(nid).push(rel);
        });
      });

      this.domain.nodeMap = nodeMap;
      this.domain.childrenMap = childrenMap;
      this.domain.relationsByNodeId = relationsByNodeId;
      this.domain.periodMap = periodMap;
      this.domain.booksById = booksById;

      console.info(`[PoliticsStore] Initialized with ${nodeMap.size} nodes, ${this.domain.relations.length} relations.`);
    },

    getNode(id) {
      return this.domain.nodeMap.get(id);
    },

    getChildren(id) {
      return this.domain.childrenMap.get(id) || [];
    },

    getAncestors(id) {
      const ancestors = [];
      let curr = this.domain.nodeMap.get(id);
      while (curr && curr.parentId) {
        ancestors.push(curr.parentId);
        curr = this.domain.nodeMap.get(curr.parentId);
      }
      return ancestors;
    },

    getRelations(nodeId) {
      return this.domain.relationsByNodeId.get(nodeId) || [];
    }
  };

  window.PoliticsStore = store;
})();
