/**
 * Politics V1.1
 *
 * Spine + Branch Mind-Map Layout
 */

(function () {
  const cfg = () =>
    window.PoliticsConfig;

  function median(values) {
    if (!values?.length) {
      return null;
    }

    const array =
      [...values].sort(
        (a, b) => a - b
      );

    const middle =
      Math.floor(
        array.length / 2
      );

    return (
      array.length % 2
        ? array[middle]
        : (
            array[middle - 1] +
            array[middle]
          ) / 2
    );
  }

  function visibleChildrenMap(
    nodes
  ) {
    const map = new Map();

    const ids =
      new Set(
        nodes.map(
          node => node.id
        )
      );

    for (
      const node of nodes
    ) {
      if (
        node.parentId &&
        ids.has(node.parentId)
      ) {
        if (
          !map.has(
            node.parentId
          )
        ) {
          map.set(
            node.parentId,
            []
          );
        }

        map
          .get(node.parentId)
          .push(node);
      }
    }

    for (
      const list of
      map.values()
    ) {
      list.sort(
        (a, b) =>
          (a.order || 0) -
          (b.order || 0)
      );
    }

    return map;
  }

  function leafUnits(
    nodeId,
    childMap
  ) {
    const children =
      childMap.get(nodeId) ||
      [];

    if (!children.length) {
      return 1;
    }

    return children.reduce(
      (
        sum,
        child
      ) =>
        sum +
        leafUnits(
          child.id,
          childMap
        ),
      0
    );
  }

  function layoutVisibleDescendants(
    parent,
    side,
    parentX,
    top,
    bottom,
    childMap,
    positions,
    sizes,
    depthIndent
  ) {
    const children =
      childMap.get(
        parent.id
      ) || [];

    if (!children.length) {
      return;
    }

    const weights =
      children.map(
        child =>
          leafUnits(
            child.id,
            childMap
          )
      );

    const total =
      weights.reduce(
        (a, b) => a + b,
        0
      ) || 1;

    let cursor = top;

    children.forEach(
      (
        child,
        index
      ) => {
        const span =
          (
            bottom -
            top
          ) *
          (
            weights[index] /
            total
          );

        const childTop =
          cursor;

        const childBottom =
          cursor + span;

        const childY =
          (
            childTop +
            childBottom
          ) / 2;

        const size =
          sizes[
            child.kind
          ] ||
          sizes.point;

        const depthDelta =
          Math.max(
            1,

            (
              child.depth ||
              1
            ) -
            (
              parent.depth ||
              0
            )
          );

        const childX =
          parentX +
          side *
          depthIndent *
          depthDelta;

        positions.set(
          child.id,
          {
            x: childX,
            y: childY,

            width:
              size[0],

            height:
              size[1],

            outward:
              side
          }
        );

        layoutVisibleDescendants(
          child,
          side,
          childX,
          childTop,
          childBottom,
          childMap,
          positions,
          sizes,
          depthIndent
        );

        cursor =
          childBottom;
      }
    );
  }

  function computeLayout(
    domain,
    visibleNodes
  ) {
    const C = cfg();

    const L =
      C.layout;

    const sizes =
      C.nodeSizes;

    const positions =
      new Map();

    const childMap =
      visibleChildrenMap(
        visibleNodes
      );

    const visibleById =
      new Map(
        visibleNodes.map(
          node => [
            node.id,
            node
          ]
        )
      );

    /*
     * =====================================
     * 1. SG Central Timeline
     * =====================================
     */

    const sgRoot =
      visibleNodes.find(
        node =>
          node.bookId === 'sg' &&
          node.kind === 'book'
      );

    const sgChapters =
      visibleNodes
        .filter(
          node =>
            node.bookId === 'sg' &&
            node.kind === 'chapter'
        )
        .sort(
          (a, b) =>
            (
              a.timelineRank ||
              0
            ) -
              (
                b.timelineRank ||
                0
              ) ||

            (
              a.order ||
              0
            ) -
              (
                b.order ||
                0
              )
        );

    const periodMarkers =
      [];

    let cursorY =
      L.timelineTop;

    let lastPeriod =
      null;

    if (sgRoot) {
      const size =
        sizes.book;

      positions.set(
        sgRoot.id,
        {
          x:
            L.centerX,

          y:
            L.timelineTop -
            L.timelineRootGap,

          width:
            size[0],

          height:
            size[1],

          outward:
            1
        }
      );
    }

    /*
     * 每个 SG Chapter
     * 都拥有独立 vertical block。
     *
     * 展开后只扩张自己的 block，
     * 后面章节自然下移。
     */
    for (
      const chapter of
      sgChapters
    ) {
      const leaves =
        leafUnits(
          chapter.id,
          childMap
        );

      const blockHeight =
        Math.max(
          L.timelineChapterGap,

          leaves *
            L.branchLeafGap +
            L.branchPadding * 2
        );

      if (
        lastPeriod &&
        chapter.periodId &&
        chapter.periodId !==
          lastPeriod
      ) {
        cursorY +=
          L.periodGap;
      }

      const chapterY =
        cursorY +
        blockHeight / 2;

      const size =
        sizes.chapter;

      /*
       * SG Chapter
       * 左右交替生枝。
       */
      const side =
        (
          (
            chapter.order ||
            0
          ) %
          2 ===
          0
        )
          ? 1
          : -1;

      positions.set(
        chapter.id,
        {
          x:
            L.centerX,

          y:
            chapterY,

          width:
            size[0],

          height:
            size[1],

          outward:
            side
        }
      );

      if (
        chapter.periodId !==
        lastPeriod
      ) {
        const period =
          domain
            .periodMap
            .get(
              chapter.periodId
            );

        if (period) {
          periodMarkers.push({
            id:
              period.id,

            title:
              period.title,

            dateRange:
              period.dateRange,

            y:
              chapterY
          });
        }
      }

      lastPeriod =
        chapter.periodId ||
        lastPeriod;

      const children =
        childMap.get(
          chapter.id
        ) || [];

      if (
        children.length
      ) {
        const branchX =
          L.centerX +
          side *
          L.sgBranchOffset;

        const totalWeights =
          children.reduce(
            (
              sum,
              child
            ) =>
              sum +
              leafUnits(
                child.id,
                childMap
              ),
            0
          ) || 1;

        let branchCursor =
          chapterY -
          (
            blockHeight -
            L.branchPadding *
              2
          ) / 2;

        const usable =
          blockHeight -
          L.branchPadding *
            2;

        for (
          const child of
          children
        ) {
          const weight =
            leafUnits(
              child.id,
              childMap
            );

          const span =
            usable *
            weight /
            totalWeights;

          const childTop =
            branchCursor;

          const childBottom =
            branchCursor +
            span;

          const childY =
            (
              childTop +
              childBottom
            ) / 2;

          const childSize =
            sizes[
              child.kind
            ] ||
            sizes.section;

          positions.set(
            child.id,
            {
              x:
                branchX,

              y:
                childY,

              width:
                childSize[0],

              height:
                childSize[1],

              outward:
                side
            }
          );

          layoutVisibleDescendants(
            child,
            side,
            branchX,
            childTop,
            childBottom,
            childMap,
            positions,
            sizes,
            L.depthIndent
          );

          branchCursor =
            childBottom;
        }
      }

      cursorY +=
        blockHeight;
    }

    const timeline = {
      x:
        L.centerX,

      y1:
        sgRoot
          ? positions
              .get(
                sgRoot.id
              )
              .y +
            sizes.book[1] /
              2
          : L.timelineTop,

      y2:
        sgChapters.length
          ? positions
              .get(
                sgChapters[
                  sgChapters.length -
                    1
                ].id
              )
              .y
          : L.timelineTop +
            300
    };

    /*
     * =====================================
     * 2. Anchor -> visible SG Chapter
     * =====================================
     */

    const sgChapterYById =
      new Map(
        sgChapters.map(
          chapter => [
            chapter.id,

            positions
              .get(
                chapter.id
              )
              ?.y
          ]
        )
      );

    function anchorY(
      anchorId
    ) {
      let node =
        domain
          .nodeMap
          .get(
            anchorId
          );

      const guard =
        new Set();

      while (
        node &&
        !guard.has(node.id)
      ) {
        guard.add(
          node.id
        );

        if (
          node.bookId ===
            'sg' &&
          node.kind ===
            'chapter'
        ) {
          return (
            sgChapterYById.get(
              node.id
            ) ??
            null
          );
        }

        node =
          node.parentId
            ? domain
                .nodeMap
                .get(
                  node.parentId
                )
            : null;
      }

      return null;
    }

    /*
     * descendant anchor
     * 会被 memoize。
     */
    const anchorCache =
      new Map();

    function descendantAnchorYs(
      nodeId
    ) {
      if (
        anchorCache.has(
          nodeId
        )
      ) {
        return anchorCache.get(
          nodeId
        );
      }

      const node =
        domain
          .nodeMap
          .get(
            nodeId
          );

      if (!node) {
        return [];
      }

      const ys = [];

      for (
        const id of
        (
          node.layoutAnchorIds ||
          []
        )
      ) {
        const y =
          anchorY(id);

        if (
          typeof y ===
          'number'
        ) {
          ys.push(y);
        }
      }

      for (
        const childId of
        (
          domain
            .childrenMap
            .get(nodeId) ||
          []
        )
      ) {
        ys.push(
          ...descendantAnchorYs(
            childId
          )
        );
      }

      anchorCache.set(
        nodeId,
        ys
      );

      return ys;
    }

    /*
     * =====================================
     * 3. Other subject trees
     * =====================================
     */

    const nonSgBooks =
      domain.books.filter(
        book =>
          book.id !== 'sg'
      );

    const bySide = {
      left: [],
      right: []
    };

    nonSgBooks.forEach(book => {
      const sideKey =
        book.side === 'left' ? 'left' : 'right';
      const laneIdx =
        Math.max(0, Math.abs(book.lane || 1) - 1);
      bySide[sideKey].push({
        laneIdx,
        book
      });
    });

    Object.values(bySide).forEach(list => {
      list.sort((a, b) => a.laneIdx - b.laneIdx);
    });

    for (const [sideKey, bookItems] of Object.entries(bySide)) {
      const side =
        sideKey === 'left' ? -1 : 1;
      let currentLaneEdge =
        L.bookBaseOffset;

      for (const { book } of bookItems) {
        const bookRoot =
          visibleById.get(`pol.${book.id}`) ||
          visibleNodes.find(
            node =>
              node.bookId === book.id &&
              node.kind === 'book'
          );

        if (!bookRoot) {
          continue;
        }

        const chapters =
          (
            childMap.get(bookRoot.id) || []
          ).filter(
            node => node.kind === 'chapter'
          );

        /*
         * 严格按教材章节顺序排序，
         * 杜绝因历史锚点波动造成乱序。
         */
        chapters.sort(
          (a, b) =>
            (a.order || 0) - (b.order || 0)
        );

        const chapterUnits =
          chapters.map((chapter, index) => {
            const ys = descendantAnchorYs(chapter.id);
            const targetY =
              median(ys) ??
              (L.timelineTop + 160 + index * 150);

            const leaves = leafUnits(chapter.id, childMap);
            const height = Math.max(
              72,
              leaves * L.branchLeafGap + L.branchPadding * 2
            );

            return {
              chapter,
              targetY,
              height,
              y: targetY
            };
          });

        /*
         * 单调约束：确保章节目标 Y 沿章节顺序单调不减
         */
        for (let i = 1; i < chapterUnits.length; i++) {
          const minTY =
            chapterUnits[i - 1].y +
            chapterUnits[i - 1].height / 2 +
            L.branchGap +
            chapterUnits[i].height / 2;
          if (chapterUnits[i].y < minTY) {
            chapterUnits[i].y = minTY;
          }
        }

        /*
         * 1D 垂直碰撞消解
         */
        for (let i = 1; i < chapterUnits.length; i++) {
          const prev = chapterUnits[i - 1];
          const current = chapterUnits[i];
          const minY =
            prev.y +
            prev.height / 2 +
            L.branchGap +
            current.height / 2;

          if (current.y < minY) {
            current.y = minY;
          }
        }

        /*
         * 居中防漂移
         */
        if (chapterUnits.length) {
          const desired = median(
            chapterUnits.map(unit => unit.targetY)
          );
          const actual = median(
            chapterUnits.map(unit => unit.y)
          );
          const shift =
            (desired ?? actual) - (actual ?? desired);

          for (const unit of chapterUnits) {
            unit.y += shift;
          }
        }

        const rootSize = sizes.book;
        const rootX =
          side * (currentLaneEdge + rootSize[0] / 2);
        const rootY =
          median(chapterUnits.map(unit => unit.y)) ??
          (timeline.y1 + timeline.y2) / 2;

        positions.set(bookRoot.id, {
          x: rootX,
          y: rootY,
          width: rootSize[0],
          height: rootSize[1],
          outward: side
        });

        for (const unit of chapterUnits) {
          const chapter = unit.chapter;
          const chapterX =
            rootX + side * L.depthIndent;
          const size = sizes.chapter;

          positions.set(chapter.id, {
            x: chapterX,
            y: unit.y,
            width: size[0],
            height: size[1],
            outward: side
          });

          const top =
            unit.y - unit.height / 2 + L.branchPadding;
          const bottom =
            unit.y + unit.height / 2 - L.branchPadding;

          layoutVisibleDescendants(
            chapter,
            side,
            chapterX,
            top,
            bottom,
            childMap,
            positions,
            sizes,
            L.depthIndent
          );
        }

        /*
         * 动态外延计算：下一列科目放置在该科目最外侧可见节点之外，
         * 杜绝任何展开层级交叉碰撞。
         */
        const bookNodes = visibleNodes.filter(
          n => n.bookId === book.id && positions.has(n.id)
        );
        if (bookNodes.length) {
          const maxReach = Math.max(
            ...bookNodes.map(
              n =>
                Math.abs(positions.get(n.id).x) +
                positions.get(n.id).width / 2
            )
          );
          currentLaneEdge = maxReach + 48;
        } else {
          currentLaneEdge += rootSize[0] + 48;
        }
      }
    }

    /*
     * =====================================
     * 4. deterministic fallback
     * =====================================
     */

    let fallback = 0;

    for (
      const node of
      visibleNodes
    ) {
      if (
        positions.has(
          node.id
        )
      ) {
        continue;
      }

      const size =
        sizes[
          node.kind
        ] ||
        sizes.point;

      positions.set(
        node.id,
        {
          x: 0,

          y:
            timeline.y2 +
            180 +
            fallback++ *
              60,

          width:
            size[0],

          height:
            size[1],

          outward:
            1
        }
      );
    }

    return {
      positions,
      timeline,
      periodMarkers
    };
  }

  window.PoliticsLayout = {
    computeLayout,
    median
  };
})();
