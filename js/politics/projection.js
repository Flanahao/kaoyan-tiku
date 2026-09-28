/**
 * Politics V1.1 Projection
 *
 * 负责：
 * - 展开/折叠
 * - 当前可见节点
 * - hierarchy
 * - relation semantic aggregation
 */

(function () {
  function isVisible(
    node,
    domain,
    view
  ) {
    if (!node.parentId) {
      return true;
    }

    let current = node;

    const guard = new Set();

    while (current?.parentId) {
      if (
        guard.has(
          current.parentId
        )
      ) {
        return false;
      }

      guard.add(
        current.parentId
      );

      if (
        !view.expandedNodeIds.has(
          current.parentId
        )
      ) {
        return false;
      }

      current =
        domain.nodeMap.get(
          current.parentId
        );

      if (!current) {
        return false;
      }
    }

    return true;
  }

  function nearestVisibleAncestor(
    nodeId,
    visibleIds,
    domain
  ) {
    let current =
      domain.nodeMap.get(
        nodeId
      );

    const guard = new Set();

    while (
      current &&
      !guard.has(current.id)
    ) {
      guard.add(
        current.id
      );

      if (
        visibleIds.has(
          current.id
        )
      ) {
        return current.id;
      }

      current =
        current.parentId
          ? domain.nodeMap.get(
              current.parentId
            )
          : null;
    }

    return null;
  }

  function isAncestorOrSelf(
    ancestorId,
    nodeId,
    domain
  ) {
    if (
      !ancestorId ||
      !nodeId
    ) {
      return false;
    }

    let current =
      domain.nodeMap.get(
        nodeId
      );

    const guard = new Set();

    while (
      current &&
      !guard.has(current.id)
    ) {
      guard.add(
        current.id
      );

      if (
        current.id === ancestorId
      ) {
        return true;
      }

      current =
        current.parentId
          ? domain.nodeMap.get(
              current.parentId
            )
          : null;
    }

    return false;
  }

  function build(
    domain,
    view
  ) {
    const visibleNodes =
      domain.nodes.filter(
        node =>
          isVisible(
            node,
            domain,
            view
          )
      );

    const visibleIds =
      new Set(
        visibleNodes.map(
          node => node.id
        )
      );

    /*
     * Hierarchy
     */
    const hierarchyEdges = [];

    for (
      const node of
      visibleNodes
    ) {
      if (
        !node.parentId ||
        !visibleIds.has(
          node.parentId
        )
      ) {
        continue;
      }

      const parent =
        domain.nodeMap.get(
          node.parentId
        );

      /*
       * SG Book -> SG Chapter
       * 不再画成星状 hierarchy。
       *
       * 由 timeline spine 表现。
       */
      if (
        node.bookId === 'sg' &&
        node.kind === 'chapter' &&
        parent?.kind === 'book'
      ) {
        continue;
      }

      hierarchyEdges.push({
        id:
          `hier-${node.parentId}-${node.id}`,

        source:
          node.parentId,

        target:
          node.id,

        type:
          'hierarchy',

        bookId:
          node.bookId
      });
    }

    /*
     * Relation semantic aggregation
     */
    const relationMap =
      new Map();

    if (view.showRelations) {
      for (
        const rel of
        domain.relations
      ) {
        const type =
          rel.type ||
          'related';

        if (
          view.relationFilters?.size &&
          !view.relationFilters.has(
            type
          )
        ) {
          continue;
        }

        const source =
          nearestVisibleAncestor(
            rel.source,
            visibleIds,
            domain
          );

        const target =
          nearestVisibleAncestor(
            rel.target,
            visibleIds,
            domain
          );

        if (
          !source ||
          !target ||
          source === target
        ) {
          continue;
        }

        const a =
          source < target
            ? source
            : target;

        const b =
          source < target
            ? target
            : source;

        const key =
          `${a}__${b}__${type}`;

        if (
          !relationMap.has(
            key
          )
        ) {
          relationMap.set(
            key,
            {
              id:
                `agg-${key}`,

              source,
              target,
              type,

              count: 0,

              relationIds: [],
              labels: []
            }
          );
        }

        const agg =
          relationMap.get(
            key
          );

        agg.count += 1;

        agg.relationIds.push(
          rel.id
        );

        if (
          rel.label &&
          !agg.labels.includes(
            rel.label
          )
        ) {
          agg.labels.push(
            rel.label
          );
        }
      }
    }

    const selected =
      view.selectedNodeId;

    const hovered =
      view.hoveredNodeId;

    const relationEdges =
      [
        ...relationMap.values()
      ].map(
        edge => ({
          ...edge,

          active: !!(
            (
              selected &&
              (
                isAncestorOrSelf(
                  selected,
                  edge.source,
                  domain
                ) ||
                isAncestorOrSelf(
                  selected,
                  edge.target,
                  domain
                ) ||
                isAncestorOrSelf(
                  edge.source,
                  selected,
                  domain
                ) ||
                isAncestorOrSelf(
                  edge.target,
                  selected,
                  domain
                )
              )
            ) ||

            (
              hovered &&
              (
                isAncestorOrSelf(
                  hovered,
                  edge.source,
                  domain
                ) ||
                isAncestorOrSelf(
                  hovered,
                  edge.target,
                  domain
                ) ||
                isAncestorOrSelf(
                  edge.source,
                  hovered,
                  domain
                ) ||
                isAncestorOrSelf(
                  edge.target,
                  hovered,
                  domain
                )
              )
            )
          )
        })
      );

    return {
      nodes:
        visibleNodes,

      visibleIds,

      hierarchyEdges,

      relationEdges,

      edges: [
        ...hierarchyEdges,
        ...relationEdges
      ]
    };
  }

  function toRenderModel(
    projection,
    layoutModel,
    store
  ) {
    return {
      nodes:
        projection.nodes.map(
          node => {
            const pos =
              layoutModel
                .positions
                .get(node.id);

            return {
              ...node,

              x:
                pos?.x || 0,

              y:
                pos?.y || 0,

              width:
                pos?.width || 180,

              height:
                pos?.height || 36,

              outward:
                pos?.outward || 1,

              selected:
                store
                  .view
                  .selectedNodeId ===
                node.id,

              expanded:
                store
                  .view
                  .expandedNodeIds
                  .has(node.id),

              hasChildren:
                store
                  .hasChildren(
                    node.id
                  )
            };
          }
        ),

      hierarchyEdges:
        projection.hierarchyEdges,

      relationEdges:
        projection.relationEdges,

      timeline:
        layoutModel.timeline,

      periodMarkers:
        layoutModel.periodMarkers,

      colors:
        window
          .PoliticsConfig
          ?.bookColors ||
        {}
    };
  }

  window.PoliticsProjection = {
    build,
    toRenderModel,
    nearestVisibleAncestor
  };
})();
