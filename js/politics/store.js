/** Politics V1.1 domain/view store */
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

      expandedNodeIds: new Set(),

      selectedNodeId: null,
      hoveredNodeId: null,

      showRelations: true,

      relationFilters: new Set([
        'theory_application',
        'historical_context',
        'evolution',
        'cause',
        'result',
        'compare',
        'same_topic',
        'related'
      ])
    },

    init(domainData) {
      this.domain.books = domainData.books || [];
      this.domain.periods = domainData.periods || [];
      this.domain.nodes = domainData.nodes || [];
      this.domain.relations = domainData.relations || [];

      const nodeMap = new Map();
      const childrenMap = new Map();
      const relationsByNodeId = new Map();
      const periodMap = new Map();
      const booksById = new Map();

      this.domain.books.forEach(book => {
        booksById.set(book.id, book);
      });

      this.domain.periods.forEach(period => {
        periodMap.set(period.id, period);
      });

      this.domain.nodes.forEach(node => {
        nodeMap.set(node.id, node);

        if (node.parentId) {
          if (!childrenMap.has(node.parentId)) {
            childrenMap.set(node.parentId, []);
          }

          childrenMap
            .get(node.parentId)
            .push(node.id);
        }
      });

      for (const ids of childrenMap.values()) {
        ids.sort((a, b) => {
          const na = nodeMap.get(a);
          const nb = nodeMap.get(b);

          return (na?.order || 0) - (nb?.order || 0);
        });
      }

      this.domain.relations.forEach(rel => {
        for (const id of [rel.source, rel.target]) {
          if (!relationsByNodeId.has(id)) {
            relationsByNodeId.set(id, []);
          }

          relationsByNodeId
            .get(id)
            .push(rel);
        }
      });

      this.domain.nodeMap = nodeMap;
      this.domain.childrenMap = childrenMap;
      this.domain.relationsByNodeId = relationsByNodeId;
      this.domain.periodMap = periodMap;
      this.domain.booksById = booksById;

      /*
       * Initial overview:
       *
       * Book 展开，因此 Chapter 可见。
       * Chapter 默认不展开，因此 Section / Point 隐藏。
       */
      this.view.expandedNodeIds = new Set(
        this.domain.nodes
          .filter(node => node.kind === 'book')
          .map(node => node.id)
      );

      this.view.selectedNodeId = null;
      this.view.hoveredNodeId = null;
    },

    getNode(id) {
      return this.domain.nodeMap.get(id);
    },

    getChildren(id) {
      return this.domain.childrenMap.get(id) || [];
    },

    hasChildren(id) {
      return (
        this.domain.childrenMap.get(id) || []
      ).length > 0;
    },

    isExpanded(id) {
      return this.view.expandedNodeIds.has(id);
    },

    toggleExpanded(id) {
      if (!this.hasChildren(id)) {
        return false;
      }

      if (this.view.expandedNodeIds.has(id)) {
        this.view.expandedNodeIds.delete(id);
      } else {
        this.view.expandedNodeIds.add(id);
      }

      return true;
    },

    getAncestors(id) {
      const result = [];

      let current = this.getNode(id);
      const guard = new Set();

      while (
        current?.parentId &&
        !guard.has(current.parentId)
      ) {
        guard.add(current.parentId);

        result.push(current.parentId);

        current = this.getNode(
          current.parentId
        );
      }

      return result;
    },

    getRelations(id) {
      return (
        this.domain.relationsByNodeId.get(id) ||
        []
      );
    }
  };

  window.PoliticsStore = store;
})();
