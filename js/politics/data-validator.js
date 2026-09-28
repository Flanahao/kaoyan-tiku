/**
 * 考研政治知识图谱 - 数据校验器 (Data Validator)
 * 启动时对 Canonical 数据进行完整性、拓扑完整性与 Schema 规范性校验
 */
(function () {
  function validate(domain) {
    const errors = [];
    const warnings = [];

    if (!domain || !domain.books || !domain.nodes) {
      errors.push('Domain data incomplete: missing books or nodes array');
      return { valid: false, errors, warnings };
    }

    const { books, periods = [], nodes = [], relations = [] } = domain;

    // 1. Check books
    const bookIds = new Set();
    books.forEach(b => {
      if (!b.id) errors.push(`Book item missing id: ${JSON.stringify(b)}`);
      else if (bookIds.has(b.id)) errors.push(`Duplicate bookId: ${b.id}`);
      bookIds.add(b.id);
    });

    // 2. Check periods
    const periodIds = new Set();
    periods.forEach(p => {
      if (!p.id) errors.push(`Period missing id: ${JSON.stringify(p)}`);
      else if (periodIds.has(p.id)) errors.push(`Duplicate periodId: ${p.id}`);
      periodIds.add(p.id);

      if (typeof p.rankStart !== 'number' || typeof p.rankEnd !== 'number') {
        errors.push(`Period ${p.id} missing numeric rankStart/rankEnd`);
      }
    });

    // 3. Check nodes
    const nodeIds = new Set();
    const nodeMap = new Map();
    const parentMap = new Map();
    const validKinds = new Set(['book', 'chapter', 'section', 'point']);
    const expectedDepthByKind = { book: 0, chapter: 1, section: 2, point: 3 };

    nodes.forEach(node => {
      const nid = node.id;
      if (!nid) {
        errors.push(`Node missing id: ${JSON.stringify(node)}`);
        return;
      }
      if (nodeIds.has(nid)) {
        errors.push(`Duplicate node id: ${nid}`);
      }
      nodeIds.add(nid);
      nodeMap.set(nid, node);

      // Canonical purity: strictly forbid G6 runtime fields in domain data
      if (node.style !== undefined || node.x !== undefined || node.y !== undefined) {
        errors.push(`Node ${nid} violates canonical decoupling: contains style/x/y fields`);
      }

      // Kind and depth validation
      if (!validKinds.has(node.kind)) {
        errors.push(`Node ${nid} has invalid kind: '${node.kind}'`);
      } else {
        const expDepth = expectedDepthByKind[node.kind];
        if (node.depth !== expDepth) {
          errors.push(`Node ${nid} (${node.kind}) depth is ${node.depth}, expected ${expDepth}`);
        }
      }

      // Hierarchy parent validity
      if (node.kind === 'book') {
        if (node.parentId !== null && node.parentId !== undefined) {
          errors.push(`Book node ${nid} must have null parentId, got: ${node.parentId}`);
        }
      } else {
        if (!node.parentId) {
          errors.push(`Non-book node ${nid} (${node.kind}) missing parentId`);
        }
      }

      // Book validation
      if (!node.bookId || !bookIds.has(node.bookId)) {
        errors.push(`Node ${nid} references invalid bookId: ${node.bookId}`);
      }

      // Order validation
      if (typeof node.order !== 'number') {
        warnings.push(`Node ${nid} has non-numeric order: ${node.order}`);
      }

      // sg point timelineRank validation
      if (node.bookId === 'sg' && node.kind === 'point') {
        if (typeof node.timelineRank !== 'number') {
          errors.push(`Node ${nid} (sg point) missing valid numeric timelineRank`);
        }
      }

      // periodId validation
      if (node.periodId && !periodIds.has(node.periodId)) {
        errors.push(`Node ${nid} references invalid periodId: ${node.periodId}`);
      }

      parentMap.set(nid, node.parentId || null);
    });

    // 4. Orphan parent, hierarchy consistency & cycle check
    nodes.forEach(node => {
      if (node.parentId) {
        if (!nodeIds.has(node.parentId)) {
          errors.push(`Node ${node.id} references orphan parentId: ${node.parentId}`);
        } else {
          const parent = nodeMap.get(node.parentId);
          if (parent.bookId !== node.bookId) {
            errors.push(`Node ${node.id} cross-book parent hierarchy (${node.bookId} -> ${parent.bookId})`);
          }
          if (parent.depth !== node.depth - 1) {
            errors.push(`Node ${node.id} parent depth mismatch (${node.depth} vs ${parent.depth})`);
          }
        }
      }
    });

    nodeIds.forEach(nid => {
      const visited = new Set();
      let curr = nid;
      while (curr) {
        if (visited.has(curr)) {
          errors.push(`Parent hierarchy cycle detected at node: ${nid} (looped back to ${curr})`);
          break;
        }
        visited.add(curr);
        curr = parentMap.get(curr);
      }
    });

    // 5. Layout anchor validation
    nodes.forEach(node => {
      if (Array.isArray(node.layoutAnchorIds)) {
        node.layoutAnchorIds.forEach(anchorId => {
          if (!nodeIds.has(anchorId)) {
            errors.push(`Node ${node.id} layoutAnchorId '${anchorId}' does not exist in domain nodes`);
          } else {
            const anchorNode = nodeMap.get(anchorId);
            if (anchorNode.bookId !== 'sg') {
              errors.push(`Node ${node.id} layoutAnchorId '${anchorId}' must reference an 'sg' node, got '${anchorNode.bookId}'`);
            }
          }
        });
      }
    });

    // 6. Relations validation
    const relIds = new Set();
    relations.forEach(rel => {
      if (!rel.id) {
        errors.push(`Relation missing id: ${JSON.stringify(rel)}`);
        return;
      }
      if (relIds.has(rel.id)) {
        errors.push(`Duplicate relation id: ${rel.id}`);
      }
      relIds.add(rel.id);

      if (rel.style !== undefined) {
        errors.push(`Relation ${rel.id} violates canonical decoupling: contains style field`);
      }

      if (!rel.source || !nodeIds.has(rel.source)) {
        errors.push(`Relation ${rel.id} has orphan source: ${rel.source}`);
      }
      if (!rel.target || !nodeIds.has(rel.target)) {
        errors.push(`Relation ${rel.id} has orphan target: ${rel.target}`);
      }
    });

    const isValid = errors.length === 0;

    if (!isValid) {
      console.error('[PoliticsValidator] Validation failed with errors:', errors);
    } else {
      console.info(`[PoliticsValidator] Passed. Checked ${nodes.length} nodes, ${relations.length} relations, ${periods.length} periods.`);
    }

    if (warnings.length > 0) {
      console.warn('[PoliticsValidator] Warnings:', warnings);
    }

    return {
      valid: isValid,
      errors,
      warnings
    };
  }

  window.PoliticsValidator = {
    validate
  };
})();
