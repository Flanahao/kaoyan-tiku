/**
 * Politics V1.1
 *
 * Deterministic SVG Mind-Map Renderer
 */

(function () {
  const SVG_NS =
    'http://www.w3.org/2000/svg';

  const XHTML_NS =
    'http://www.w3.org/1999/xhtml';

  let container =
    null;

  let svg =
    null;

  let scene =
    null;

  let currentModel =
    null;

  let transform = {
    x: 0,
    y: 0,
    scale: 1
  };

  let panning =
    null;

  const callbacks = {
    nodeClick: [],
    nodeDoubleClick: [],
    nodeToggle: [],
    nodeHover: [],
    canvasClick: [],
    transform: []
  };

  function el(
    name,
    attrs = {}
  ) {
    const node =
      document
        .createElementNS(
          SVG_NS,
          name
        );

    Object
      .entries(attrs)
      .forEach(
        (
          [
            key,
            value
          ]
        ) => {
          if (
            value !==
              undefined &&
            value !==
              null
          ) {
            node.setAttribute(
              key,
              String(value)
            );
          }
        }
      );

    return node;
  }

  function htmlEl(
    name,
    className
  ) {
    const node =
      document
        .createElementNS(
          XHTML_NS,
          name
        );

    if (className) {
      node.setAttribute(
        'class',
        className
      );
    }

    return node;
  }

  function clamp(
    value,
    min,
    max
  ) {
    return Math.min(
      max,
      Math.max(
        min,
        value
      )
    );
  }

  function getZoomBounds() {
    const zoom =
      window
        .PoliticsConfig
        ?.zoom ||
      {};

    return {
      min:
        zoom.min ??
        0.18,

      max:
        zoom.max ??
        1.8
    };
  }

  function applyTransform(
    emit = true
  ) {
    if (!scene) {
      return;
    }

    scene.setAttribute(
      'transform',

      `translate(${transform.x} ${transform.y}) scale(${transform.scale})`
    );

    container
      ?.classList
      .toggle(
        'is-far-zoom',

        transform.scale <
          0.42
      );

    if (emit) {
      callbacks
        .transform
        .forEach(
          callback =>
            callback({
              ...transform
            })
        );
    }
  }

  function initGraph(
    containerId
  ) {
    container =
      typeof containerId ===
      'string'

        ? document.getElementById(
            containerId
          )

        : containerId;

    if (!container) {
      throw new Error(
        `Graph container "${containerId}" not found`
      );
    }

    container.replaceChildren();

    svg =
      el(
        'svg',
        {
          class:
            'politics-svg-canvas',

          role:
            'application',

          'aria-label':
            '考研政治知识导图'
        }
      );

    svg.setAttribute(
      'tabindex',
      '0'
    );

    const defs =
      el('defs');

    const shadow =
      el(
        'filter',
        {
          id:
            'pol-shadow',

          x:
            '-20%',

          y:
            '-20%',

          width:
            '140%',

          height:
            '140%'
        }
      );

    shadow.appendChild(
      el(
        'feDropShadow',
        {
          dx: 0,

          dy: 2,

          stdDeviation:
            2.2,

          'flood-opacity':
            0.12
        }
      )
    );

    defs.appendChild(
      shadow
    );

    svg.appendChild(
      defs
    );

    scene =
      el(
        'g',
        {
          class:
            'politics-scene'
        }
      );

    svg.appendChild(
      scene
    );

    container.appendChild(
      svg
    );

    bindCanvasGestures();

    return svg;
  }

  function bindCanvasGestures() {
    const activePointers = new Map();
    let pinchStartDist = 0;
    let pinchStartScale = 1;

    svg.addEventListener(
      'wheel',

      event => {
        event.preventDefault();

        const rect =
          svg
            .getBoundingClientRect();

        const screenX =
          event.clientX -
          rect.left;

        const screenY =
          event.clientY -
          rect.top;

        const worldX =
          (
            screenX -
            transform.x
          ) /
          transform.scale;

        const worldY =
          (
            screenY -
            transform.y
          ) /
          transform.scale;

        const factor =
          Math.exp(
            -event.deltaY *
              0.0012
          );

        const bounds =
          getZoomBounds();

        const nextScale =
          clamp(
            transform.scale *
              factor,

            bounds.min,
            bounds.max
          );

        transform.x =
          screenX -
          worldX *
            nextScale;

        transform.y =
          screenY -
          worldY *
            nextScale;

        transform.scale =
          nextScale;

        applyTransform();
      },

      {
        passive: false
      }
    );

    svg.addEventListener(
      'pointerdown',

      event => {
        if (
          event.button !== 0 &&
          event.pointerType === 'mouse'
        ) {
          return;
        }

        /*
         * Node 上不启动 canvas pan。
         */
        if (
          event
            .target
            .closest
            ?.(
              '.politics-node-fo'
            )
        ) {
          return;
        }

        activePointers.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY
        });

        if (activePointers.size === 2) {
          const [p1, p2] = Array.from(activePointers.values());
          pinchStartDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          pinchStartScale = transform.scale;
          panning = null;
          return;
        }

        panning = {
          pointerId:
            event.pointerId,

          startX:
            event.clientX,

          startY:
            event.clientY,

          originX:
            transform.x,

          originY:
            transform.y,

          moved:
            false
        };

        svg.setPointerCapture
          ?.(
            event.pointerId
          );

        container
          .classList
          .add(
            'is-panning'
          );
      }
    );

    svg.addEventListener(
      'pointermove',

      event => {
        if (activePointers.has(event.pointerId)) {
          activePointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY
          });
        }

        if (activePointers.size === 2 && pinchStartDist > 0) {
          const [p1, p2] = Array.from(activePointers.values());
          const currentDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          if (currentDist > 5) {
            const factor = currentDist / pinchStartDist;
            const bounds = getZoomBounds();
            setZoom(clamp(pinchStartScale * factor, bounds.min, bounds.max));
          }
          return;
        }

        if (
          !panning ||
          event.pointerId !==
            panning.pointerId
        ) {
          return;
        }

        const dx =
          event.clientX -
          panning.startX;

        const dy =
          event.clientY -
          panning.startY;

        if (
          Math.abs(dx) +
            Math.abs(dy) >
          3
        ) {
          panning.moved =
            true;
        }

        transform.x =
          panning.originX +
          dx;

        transform.y =
          panning.originY +
          dy;

        applyTransform();
      }
    );

    const finishPan =
      event => {
        activePointers.delete(event.pointerId);
        if (activePointers.size < 2) {
          pinchStartDist = 0;
        }

        if (
          !panning ||
          event.pointerId !==
            panning.pointerId
        ) {
          return;
        }

        const wasMoved =
          panning.moved;

        panning =
          null;

        container
          .classList
          .remove(
            'is-panning'
          );

        if (!wasMoved) {
          callbacks
            .canvasClick
            .forEach(
              callback =>
                callback()
            );
        }
      };

    svg.addEventListener(
      'pointerup',
      finishPan
    );

    svg.addEventListener(
      'pointercancel',
      finishPan
    );
  }

  function nodeMap(
    model
  ) {
    return new Map(
      model.nodes.map(
        node => [
          node.id,
          node
        ]
      )
    );
  }

  function edgeAnchor(
    from,
    to
  ) {
    const dx =
      to.x -
      from.x;

    const dy =
      to.y -
      from.y;

    if (
      Math.abs(dx) >=
      Math.abs(dy)
    ) {
      const sign =
        dx >= 0
          ? 1
          : -1;

      return {
        x:
          from.x +
          sign *
            from.width /
            2,

        y:
          from.y
      };
    }

    const sign =
      dy >= 0
        ? 1
        : -1;

    return {
      x:
        from.x,

      y:
        from.y +
        sign *
          from.height /
          2
    };
  }

  function hierarchyPath(
    source,
    target
  ) {
    const a =
      edgeAnchor(
        source,
        target
      );

    const b =
      edgeAnchor(
        target,
        source
      );

    if (
      Math.abs(
        a.x -
        b.x
      ) <
      8
    ) {
      return (
        `M ${a.x} ${a.y} ` +
        `V ${b.y}`
      );
    }

    const middleX =
      a.x +
      (
        b.x -
        a.x
      ) *
        0.48;

    return (
      `M ${a.x} ${a.y} ` +
      `H ${middleX} ` +
      `V ${b.y} ` +
      `H ${b.x}`
    );
  }

  function relationPath(
    source,
    target
  ) {
    const a =
      edgeAnchor(
        source,
        target
      );

    const b =
      edgeAnchor(
        target,
        source
      );

    const dx =
      b.x -
      a.x;

    const bend =
      Math.max(
        70,

        Math.abs(dx) *
          0.35
      );

    const c1x =
      a.x +
      Math.sign(
        dx || 1
      ) *
        bend;

    const c2x =
      b.x -
      Math.sign(
        dx || 1
      ) *
        bend;

    return (
      `M ${a.x} ${a.y} ` +
      `C ${c1x} ${a.y}, ` +
      `${c2x} ${b.y}, ` +
      `${b.x} ${b.y}`
    );
  }

  function renderBackgroundLayers(
    model
  ) {
    const background =
      el(
        'g',
        {
          class:
            'politics-layer politics-layer-bg',

          'pointer-events':
            'none'
        }
      );

    if (model.timeline) {
      background.appendChild(
        el(
          'path',
          {
            d:
              `M ${model.timeline.x} ${model.timeline.y1} ` +
              `V ${model.timeline.y2}`,

            class:
              'politics-timeline-spine'
          }
        )
      );
    }

    for (
      const marker of
      (
        model.periodMarkers ||
        []
      )
    ) {
      const group =
        el(
          'g',
          {
            class:
              'politics-period-marker',

            transform:
              `translate(${(model.timeline?.x || 0) + 28} ${marker.y - 15})`
          }
        );

      const width =
        Math.min(
          250,

          Math.max(
            118,

            marker
              .title
              .length *
              12 +
              30
          )
        );

      group.appendChild(
        el(
          'rect',
          {
            x: 0,
            y: 0,

            rx: 13,
            ry: 13,

            width,
            height: 30
          }
        )
      );

      const text =
        el(
          'text',
          {
            x: 12,
            y: 19
          }
        );

      text.textContent =
        marker.title;

      group.appendChild(
        text
      );

      background.appendChild(
        group
      );
    }

    scene.appendChild(
      background
    );
  }

  function renderRelationEdges(
    model,
    nodes
  ) {
    const layer =
      el(
        'g',
        {
          class:
            'politics-layer politics-layer-relations',

          'pointer-events':
            'none'
        }
      );

    const styles =
      window
        .PoliticsConfig
        ?.relationStyles ||
      {};

    for (
      const edge of
      model.relationEdges ||
      []
    ) {
      const source =
        nodes.get(
          edge.source
        );

      const target =
        nodes.get(
          edge.target
        );

      if (
        !source ||
        !target
      ) {
        continue;
      }

      const style =
        styles[
          edge.type
        ] ||
        styles.default ||
        {
          color:
            '#94A3B8'
        };

      const path =
        el(
          'path',
          {
            d:
              relationPath(
                source,
                target
              ),

            class:
              `politics-relation-edge${edge.active ? ' is-active' : ''}`,

            stroke:
              style.color ||
              '#94A3B8',

            'data-count':
              edge.count ||
              1,

            'data-source':
              edge.source,

            'data-target':
              edge.target
          }
        );

      layer.appendChild(
        path
      );

      if (
        (
          edge.count ||
          0
        ) >
          1
      ) {
        const middleX =
          (
            source.x +
            target.x
          ) /
          2;

        const middleY =
          (
            source.y +
            target.y
          ) /
          2;

        const badge =
          el(
            'g',
            {
              class:
                `politics-relation-count${edge.active ? ' is-active' : ''}`,

              transform:
                `translate(${middleX} ${middleY})`,

              'data-source':
                edge.source,

              'data-target':
                edge.target
            }
          );

        badge.appendChild(
          el(
            'circle',
            {
              r: 11
            }
          )
        );

        const text =
          el(
            'text',
            {
              x: 0,
              y: 4,

              'text-anchor':
                'middle'
            }
          );

        text.textContent =
          String(
            edge.count
          );

        badge.appendChild(
          text
        );

        layer.appendChild(
          badge
        );
      }
    }

    scene.appendChild(
      layer
    );
  }

  function renderHierarchyEdges(
    model,
    nodes
  ) {
    const layer =
      el(
        'g',
        {
          class:
            'politics-layer politics-layer-tree',

          'pointer-events':
            'none'
        }
      );

    const colors =
      model.colors ||
      {};

    for (
      const edge of
      model.hierarchyEdges ||
      []
    ) {
      const source =
        nodes.get(
          edge.source
        );

      const target =
        nodes.get(
          edge.target
        );

      if (
        !source ||
        !target
      ) {
        continue;
      }

      const color =
        colors[
          edge.bookId
        ]?.main ||
        '#2563EB';

      layer.appendChild(
        el(
          'path',
          {
            d:
              hierarchyPath(
                source,
                target
              ),

            class:
              'politics-tree-edge',

            stroke:
              color
          }
        )
      );
    }

    scene.appendChild(
      layer
    );
  }

  function renderNode(
    node,
    model
  ) {
    const colors =
      model.colors
        ?.[node.bookId] ||
      {
        main:
          '#2563EB',

        pale:
          '#EFF6FF',

        text:
          '#1E3A8A'
      };

    const foreignObject =
      el(
        'foreignObject',
        {
          x:
            node.x -
            node.width /
              2,

          y:
            node.y -
            node.height /
              2,

          width:
            node.width,

          height:
            node.height,

          class:
            `politics-node-fo kind-${node.kind}${node.selected ? ' is-selected' : ''}`
        }
      );

    foreignObject.dataset.nodeId =
      node.id;

    const card =
      htmlEl(
        'div',

        `politics-node-card kind-${node.kind}${node.selected ? ' is-selected' : ''}`
      );

    card.dataset.nodeId =
      node.id;

    card.style.setProperty(
      '--node-color',
      colors.main
    );

    card.style.setProperty(
      '--node-pale',
      colors.pale
    );

    card.style.setProperty(
      '--node-text',
      colors.text
    );

    card.title =
      node.title ||
      node.shortTitle ||
      '';

    const accent =
      htmlEl(
        'span',
        'politics-node-accent'
      );

    card.appendChild(
      accent
    );

    const title =
      htmlEl(
        'span',
        'politics-node-title'
      );

    title.textContent =
      node.kind === 'book'

        ? (
            node.shortTitle ||
            node.title
          )

        : (
            node.title ||
            node.shortTitle
          );

    card.appendChild(
      title
    );

    if (
      node.hasChildren
    ) {
      const toggle =
        htmlEl(
          'button',

          `politics-node-toggle ${node.outward < 0 ? 'on-left' : 'on-right'}`
        );

      toggle.setAttribute(
        'type',
        'button'
      );

      toggle.setAttribute(
        'aria-label',

        node.expanded
          ? '收起'
          : '展开'
      );

      toggle.textContent =
        node.expanded
          ? '−'
          : '+';

      toggle.addEventListener(
        'click',

        event => {
          event.stopPropagation();

          callbacks
            .nodeToggle
            .forEach(
              callback =>
                callback(
                  node.id
                )
            );
        }
      );

      card.appendChild(
        toggle
      );
    }

    card.addEventListener(
      'click',

      event => {
        event.stopPropagation();

        callbacks
          .nodeClick
          .forEach(
            callback =>
              callback(
                node.id
              )
          );
      }
    );

    card.addEventListener(
      'dblclick',

      event => {
        event.stopPropagation();

        callbacks
          .nodeDoubleClick
          .forEach(
            callback =>
              callback(
                node.id
              )
          );
      }
    );

    card.addEventListener(
      'pointerenter',

      () => {
        callbacks
          .nodeHover
          .forEach(
            callback =>
              callback(
                node.id,
                true
              )
          );
      }
    );

    card.addEventListener(
      'pointerleave',

      () => {
        callbacks
          .nodeHover
          .forEach(
            callback =>
              callback(
                node.id,
                false
              )
          );
      }
    );

    foreignObject.appendChild(
      card
    );

    return foreignObject;
  }

  async function render(
    model
  ) {
    if (!scene) {
      throw new Error(
        'Graph not initialized'
      );
    }

    currentModel =
      model;

    scene.replaceChildren();

    const nodes =
      nodeMap(
        model
      );

    renderBackgroundLayers(
      model
    );

    renderRelationEdges(
      model,
      nodes
    );

    renderHierarchyEdges(
      model,
      nodes
    );

    const nodeLayer =
      el(
        'g',
        {
          class:
            'politics-layer politics-layer-nodes'
        }
      );

    model.nodes.forEach(
      node =>
        nodeLayer.appendChild(
          renderNode(
            node,
            model
          )
        )
    );

    scene.appendChild(
      nodeLayer
    );

    applyTransform(
      false
    );
  }

  function boundsOfModel() {
    const nodes =
      currentModel
        ?.nodes ||
      [];

    if (!nodes.length) {
      return {
        minX: -400,
        minY: -300,
        maxX: 400,
        maxY: 300
      };
    }

    let minX =
      Infinity;

    let minY =
      Infinity;

    let maxX =
      -Infinity;

    let maxY =
      -Infinity;

    for (
      const node of
      nodes
    ) {
      minX =
        Math.min(
          minX,

          node.x -
            node.width /
              2
        );

      minY =
        Math.min(
          minY,

          node.y -
            node.height /
              2
        );

      maxX =
        Math.max(
          maxX,

          node.x +
            node.width /
              2
        );

      maxY =
        Math.max(
          maxY,

          node.y +
            node.height /
              2
        );
    }

    return {
      minX,
      minY,
      maxX,
      maxY
    };
  }

  async function fitView(
    padding = 88
  ) {
    if (!svg) {
      return;
    }

    const rect =
      svg
        .getBoundingClientRect();

    const bounds =
      boundsOfModel();

    const worldWidth =
      Math.max(
        1,

        bounds.maxX -
        bounds.minX
      );

    const worldHeight =
      Math.max(
        1,

        bounds.maxY -
        bounds.minY
      );

    const zoomBounds =
      getZoomBounds();

    const scale =
      clamp(
        Math.min(
          (
            rect.width -
            padding * 2
          ) /
            worldWidth,

          (
            rect.height -
            padding * 2
          ) /
            worldHeight
        ),

        zoomBounds.min,

        Math.min(
          zoomBounds.max,
          0.92
        )
      );

    const centerX =
      (
        bounds.minX +
        bounds.maxX
      ) /
      2;

    const centerY =
      (
        bounds.minY +
        bounds.maxY
      ) /
      2;

    transform.scale =
      scale;

    transform.x =
      rect.width /
        2 -
      centerX *
        scale;

    transform.y =
      rect.height /
        2 -
      centerY *
        scale;

    applyTransform();
  }

  async function resetView() {
    const target =
      window
        .PoliticsConfig
        ?.zoom
        ?.default ||
      0.72;

    const rect =
      svg
        .getBoundingClientRect();

    transform.scale =
      target;

    transform.x =
      rect.width /
      2;

    transform.y =
      84;

    applyTransform();
  }

  async function focusNode(
    nodeId,
    requestedScale
  ) {
    const node =
      currentModel
        ?.nodes
        ?.find(
          item =>
            item.id ===
            nodeId
        );

    if (
      !node ||
      !svg
    ) {
      return;
    }

    const rect =
      svg
        .getBoundingClientRect();

    const bounds =
      getZoomBounds();

    const scale =
      clamp(
        typeof requestedScale ===
        'number'

          ? requestedScale

          : Math.max(
              transform.scale,
              0.78
            ),

        bounds.min,
        bounds.max
      );

    transform.scale =
      scale;

    transform.x =
      rect.width /
        2 -
      node.x *
        scale;

    transform.y =
      rect.height /
        2 -
      node.y *
        scale;

    applyTransform();
  }

  async function setZoom(
    scale
  ) {
    if (!svg) {
      return;
    }

    const bounds =
      getZoomBounds();

    const rect =
      svg
        .getBoundingClientRect();

    const centerX =
      rect.width /
      2;

    const centerY =
      rect.height /
      2;

    const worldX =
      (
        centerX -
        transform.x
      ) /
      transform.scale;

    const worldY =
      (
        centerY -
        transform.y
      ) /
      transform.scale;

    transform.scale =
      clamp(
        scale,
        bounds.min,
        bounds.max
      );

    transform.x =
      centerX -
      worldX *
        transform.scale;

    transform.y =
      centerY -
      worldY *
        transform.scale;

    applyTransform();
  }

  async function zoomIn() {
    const step =
      window
        .PoliticsConfig
        ?.zoom
        ?.step ||
      0.12;

    return setZoom(
      transform.scale *
      (
        1 +
        step
      )
    );
  }

  async function zoomOut() {
    const step =
      window
        .PoliticsConfig
        ?.zoom
        ?.step ||
      0.12;

    return setZoom(
      transform.scale /
      (
        1 +
        step
      )
    );
  }

  function getZoom() {
    return transform.scale;
  }

  function onTransform(
    callback
  ) {
    callbacks
      .transform
      .push(
        callback
      );
  }

  function onNodeClick(
    callback
  ) {
    callbacks
      .nodeClick
      .push(
        callback
      );
  }

  function onNodeDoubleClick(
    callback
  ) {
    callbacks
      .nodeDoubleClick
      .push(
        callback
      );
  }

  function onNodeToggle(
    callback
  ) {
    callbacks
      .nodeToggle
      .push(
        callback
      );
  }

  function onNodeHover(
    callback
  ) {
    callbacks
      .nodeHover
      .push(
        callback
      );
  }

  function onCanvasClick(
    callback
  ) {
    callbacks
      .canvasClick
      .push(
        callback
      );
  }

  function setHoveredNode(
    nodeId
  ) {
    if (!scene) {
      return;
    }

    const store =
      window.PoliticsStore;

    const isRelated = (sourceId, targetId) => {
      if (!nodeId) return false;
      if (sourceId === nodeId || targetId === nodeId) return true;
      if (!store) return false;
      const sAncestors = store.getAncestors(sourceId);
      if (sAncestors.includes(nodeId)) return true;
      const tAncestors = store.getAncestors(targetId);
      if (tAncestors.includes(nodeId)) return true;
      const nAncestors = store.getAncestors(nodeId);
      if (nAncestors.includes(sourceId) || nAncestors.includes(targetId)) return true;
      return false;
    };

    scene
      .querySelectorAll(
        '.politics-relation-edge'
      )
      .forEach(
        path => {
          const hit =
            isRelated(
              path.dataset.source,
              path.dataset.target
            );

          path
            .classList
            .toggle(
              'is-hovered',
              hit
            );
        }
      );

    scene
      .querySelectorAll(
        '.politics-relation-count'
      )
      .forEach(
        badge => {
          const hit =
            isRelated(
              badge.dataset.source,
              badge.dataset.target
            );

          badge
            .classList
            .toggle(
              'is-hovered',
              hit
            );
        }
      );
  }

  window.PoliticsGraph = {
    initGraph,
    render,

    fitView,
    resetView,
    focusNode,

    setZoom,
    zoomIn,
    zoomOut,
    getZoom,

    onTransform,
    onNodeClick,
    onNodeDoubleClick,
    onNodeToggle,
    onNodeHover,
    onCanvasClick,

    setHoveredNode
  };
})();
