/**
 * 考研政治知识图谱 - 多轨拓扑布局引擎 (Politics Multi-Lane Layout Engine)
 * Milestone 0 + 1
 * - 史纲: 中央垂直时间主轴 (Lane 0)
 * - 其他学科: 可配置左右轨道 (Lanes)
 * - 锚点对齐: 非史纲考点通过 layoutAnchorIds 对齐史纲历史坐标 (支持单锚点与中位数多锚点)
 * - 树形外延: 深度向外侧缩进 (depthIndent)
 * - 碰撞消解: 双向扫描 (Dual-Pass Collision Avoidance)
 */
(function () {
  function median(values) {
    if (!values || values.length === 0) return 0;
    const arr = [...values].sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
  }

  function computeLayout(domain, visibleNodes) {
    const config = window.PoliticsConfig?.layout || {
      centerX: 0,
      firstLaneOffset: 260,
      laneWidth: 920,
      depthIndent: 210,
      nodeMinGap: 48,
      periodGap: 140,
      timelineTop: 120,
      localGap: 62
    };

    const nodeSizes = window.PoliticsConfig?.nodeSizes || {
      book: [180, 44],
      chapter: [170, 38],
      section: [160, 34],
      point: [176, 32]
    };

    const booksById = new Map(domain.books.map(b => [b.id, b]));
    const nodeMap = new Map(visibleNodes.map(n => [n.id, n]));
    const positions = new Map();

    // 1. Layout Central Timeline (史纲 sg)
    layoutTimeline(domain, visibleNodes, config, nodeSizes, positions);

    // 2. Layout Subject Lanes (非史纲各学科)
    layoutSubjectLanes(domain, visibleNodes, booksById, nodeMap, config, nodeSizes, positions);

    // 3. Resolve Collisions per Lane (双向扫描消解)
    resolveLaneCollisions(domain, visibleNodes, booksById, config, positions);

    return positions;
  }

  function layoutTimeline(domain, visibleNodes, config, nodeSizes, positions) {
    const sgNodes = visibleNodes.filter(n => n.bookId === 'sg');
    if (sgNodes.length === 0) return;

    // Sort sg nodes by timelineRank, then depth, then order
    const sorted = [...sgNodes].sort((a, b) => {
      const rankA = a.timelineRank ?? (a.depth === 0 ? 0 : 1000);
      const rankB = b.timelineRank ?? (b.depth === 0 ? 0 : 1000);
      if (rankA !== rankB) return rankA - rankB;
      if (a.depth !== b.depth) return a.depth - b.depth;
      return (a.order || 0) - (b.order || 0);
    });

    let currentY = config.timelineTop;
    let prevPeriodId = null;

    sorted.forEach((node, index) => {
      const size = nodeSizes[node.kind] || [170, 34];
      const width = size[0];
      const height = size[1];

      // Add extra gap at period boundaries
      if (node.periodId && prevPeriodId && node.periodId !== prevPeriodId) {
        currentY += config.periodGap;
      }
      if (node.periodId) {
        prevPeriodId = node.periodId;
      }

      const nodeCenterY = currentY + height / 2;

      const itemPos = {
        x: config.centerX,
        y: nodeCenterY,
        targetY: nodeCenterY,
        width,
        height,
        lane: 0,
        bookId: 'sg',
        depth: node.depth || 0
      };

      positions.set(node.id, itemPos);

      // Increment currentY for next item: height of current card + gap
      let levelGap = config.nodeMinGap;
      if (node.kind === 'book') levelGap += 35;
      else if (node.kind === 'chapter') levelGap += 25;
      else if (node.kind === 'section') levelGap += 15;

      currentY += height + levelGap;
    });
  }

  function layoutSubjectLanes(domain, visibleNodes, booksById, nodeMap, config, nodeSizes, positions) {
    const nonSgNodes = visibleNodes.filter(n => n.bookId !== 'sg');

    // Build children mapping for visible non-sg nodes
    const childrenMap = new Map();
    nonSgNodes.forEach(node => {
      if (node.parentId) {
        if (!childrenMap.has(node.parentId)) childrenMap.set(node.parentId, []);
        childrenMap.get(node.parentId).push(node.id);
      }
    });

    function getDescendantAnchorYs(nodeId) {
      const anchorYs = [];
      const node = nodeMap.get(nodeId);
      if (!node) return anchorYs;

      if (Array.isArray(node.layoutAnchorIds) && node.layoutAnchorIds.length > 0) {
        node.layoutAnchorIds.forEach(id => {
          const pos = positions.get(id);
          if (pos && typeof pos.y === 'number') anchorYs.push(pos.y);
        });
      }

      const children = childrenMap.get(nodeId) || [];
      children.forEach(cid => {
        anchorYs.push(...getDescendantAnchorYs(cid));
      });

      return anchorYs;
    }

    // Group by book
    const byBook = new Map();
    nonSgNodes.forEach(node => {
      if (!byBook.has(node.bookId)) byBook.set(node.bookId, []);
      byBook.get(node.bookId).push(node);
    });

    byBook.forEach((bookNodes, bookId) => {
      const book = booksById.get(bookId) || { lane: 1, side: 'right' };
      const lane = book.lane || 1;
      const side = book.side || (lane < 0 ? 'left' : 'right');
      const firstLaneOffset = config.firstLaneOffset || 260;
      const laneWidth = config.laneWidth || 920;
      const depthIndent = config.depthIndent || 210;
      const laneIndex = Math.abs(lane) - 1;
      const baseX = (side === 'left' ? -1 : 1) * (firstLaneOffset + laneIndex * laneWidth);

      // Locate book root
      const bookRoot = bookNodes.find(n => n.depth === 0) || { id: `pol.${bookId}` };
      const chapters = bookNodes.filter(n => n.depth === 1).sort((a, b) => (a.order || 0) - (b.order || 0));

      const branchUnits = [];

      chapters.forEach(chap => {
        const secIds = childrenMap.get(chap.id) || [];
        const sections = secIds.map(id => nodeMap.get(id)).filter(Boolean).sort((a, b) => (a.order || 0) - (b.order || 0));

        const secUnits = [];

        sections.forEach(sec => {
          const ptIds = childrenMap.get(sec.id) || [];
          const points = ptIds.map(id => nodeMap.get(id)).filter(Boolean).sort((a, b) => (a.order || 0) - (b.order || 0));
          const numPts = points.length;

          const ptPitch = 56;
          const ptOffsets = new Map();
          for (let i = 0; i < numPts; i++) {
            const relY = (i - (numPts - 1) / 2) * ptPitch;
            ptOffsets.set(points[i].id, relY);
          }

          const halfSpan = Math.max(22, (numPts * ptPitch) / 2);
          secUnits.push({
            sec,
            points,
            ptOffsets,
            halfSpan,
            relY: 0
          });
        });

        // Stack sections within the chapter
        if (secUnits.length > 0) {
          secUnits[0].relY = 0;
          for (let k = 1; k < secUnits.length; k++) {
            const prev = secUnits[k - 1];
            const curr = secUnits[k];
            curr.relY = prev.relY + prev.halfSpan + curr.halfSpan + config.nodeMinGap;
          }
          // Center sections around chapter
          const centerOffset = median(secUnits.map(u => u.relY));
          secUnits.forEach(u => { u.relY -= centerOffset; });
        }

        // Calculate branch vertical bounding box
        let topOffset = -30;
        let bottomOffset = 30;
        secUnits.forEach(u => {
          const sTop = u.relY - u.halfSpan;
          const sBottom = u.relY + u.halfSpan;
          if (sTop < topOffset) topOffset = sTop;
          if (sBottom > bottomOffset) bottomOffset = sBottom;
        });

        // Determine targetY for chapter
        let ty = null;
        if (Array.isArray(chap.layoutAnchorIds) && chap.layoutAnchorIds.length > 0) {
          const anchorYs = chap.layoutAnchorIds.map(id => positions.get(id)?.y).filter(y => typeof y === 'number');
          if (anchorYs.length > 0) ty = anchorYs.length === 1 ? anchorYs[0] : median(anchorYs);
        }
        if (ty === null) {
          const descYs = getDescendantAnchorYs(chap.id);
          if (descYs.length > 0) ty = descYs.length === 1 ? descYs[0] : median(descYs);
        }

        branchUnits.push({
          chap,
          secUnits,
          topOffset,
          bottomOffset,
          targetY: ty,
          y: ty
        });
      });

      // Pass 2: Fill targetY for any chapters without anchors
      for (let i = 0; i < branchUnits.length; i++) {
        if (typeof branchUnits[i].targetY !== 'number') {
          if (i > 0 && typeof branchUnits[i - 1].targetY === 'number') {
            branchUnits[i].targetY = branchUnits[i - 1].targetY + 400;
          } else {
            branchUnits[i].targetY = config.timelineTop + (i + 1) * 350;
          }
          branchUnits[i].y = branchUnits[i].targetY;
        }
      }

      // Pass 3: Chapter-level Dual-Pass Collision Sweep
      if (branchUnits.length > 1) {
        // Top-down pass
        for (let i = 1; i < branchUnits.length; i++) {
          const prev = branchUnits[i - 1];
          const curr = branchUnits[i];
          const prevBottom = prev.y + prev.bottomOffset;
          const currTop = curr.y + curr.topOffset;
          if (currTop < prevBottom + config.nodeMinGap) {
            curr.y = prevBottom + config.nodeMinGap - curr.topOffset;
          }
        }
        // Bottom-up pass
        for (let i = branchUnits.length - 2; i >= 0; i--) {
          const curr = branchUnits[i];
          const next = branchUnits[i + 1];
          const currBottom = curr.y + curr.bottomOffset;
          const nextTop = next.y + next.topOffset;
          if (currBottom > nextTop - config.nodeMinGap) {
            curr.y = nextTop - config.nodeMinGap - curr.bottomOffset;
          }
        }
        // Strict downward enforcement
        for (let i = 1; i < branchUnits.length; i++) {
          const prev = branchUnits[i - 1];
          const curr = branchUnits[i];
          const prevBottom = prev.y + prev.bottomOffset;
          const currTop = curr.y + curr.topOffset;
          if (currTop < prevBottom + config.nodeMinGap) {
            curr.y = prevBottom + config.nodeMinGap - curr.topOffset;
          }
        }
      }

      // Pass 4: Place all nodes into positions map
      const chapYs = [];
      branchUnits.forEach(bu => {
        const chapY = Math.round(bu.y);
        chapYs.push(chapY);
        const chapX = baseX + (side === 'left' ? -1 : 1) * 1 * depthIndent;
        const chapSize = nodeSizes.chapter || [170, 38];

        positions.set(bu.chap.id, {
          x: chapX,
          y: chapY,
          targetY: bu.targetY,
          width: chapSize[0],
          height: chapSize[1],
          lane,
          bookId,
          depth: 1
        });

        bu.secUnits.forEach(su => {
          const secY = Math.round(chapY + su.relY);
          const secX = baseX + (side === 'left' ? -1 : 1) * 2 * depthIndent;
          const secSize = nodeSizes.section || [160, 34];

          positions.set(su.sec.id, {
            x: secX,
            y: secY,
            targetY: secY,
            width: secSize[0],
            height: secSize[1],
            lane,
            bookId,
            depth: 2
          });

          su.points.forEach(pt => {
            const ptRel = su.ptOffsets.get(pt.id) || 0;
            const ptY = Math.round(secY + ptRel);
            const ptX = baseX + (side === 'left' ? -1 : 1) * 3 * depthIndent;
            const ptSize = nodeSizes.point || [176, 32];

            positions.set(pt.id, {
              x: ptX,
              y: ptY,
              targetY: ptY,
              width: ptSize[0],
              height: ptSize[1],
              lane,
              bookId,
              depth: 3
            });
          });
        });
      });

      // Place book node
      const bookY = chapYs.length > 0 ? Math.round(median(chapYs)) : config.timelineTop;
      const bookSize = nodeSizes.book || [180, 44];
      positions.set(bookRoot.id, {
        x: baseX,
        y: bookY,
        targetY: bookY,
        width: bookSize[0],
        height: bookSize[1],
        lane,
        bookId,
        depth: 0
      });
    });
  }

  function resolveLaneCollisions(domain, visibleNodes, booksById, config, positions) {
    // Hierarchical branch layout already handles non-overlapping branches per lane
  }

  window.PoliticsLayout = {
    computeLayout,
    median
  };
})();
