/**
 * 考研政治认知思维导图 · 核心控制器 (PoliticsMindMapController)
 * 职责：
 * 1. 宿主调度 SimpleMindMap 矢量引擎，搭载现代化认知导图主题 (cognitive_modern)；
 * 2. 调度完整思维导图工具集 (MindMap Toolkit)：
 *    - MindMapDragEnhancer: 磁吸拖拽与意图仲裁；
 *    - MindMapNodeRenderer: 紧凑卡片、KaTeX 编译、语义微标签与交互胶囊；
 *    - MindMapNodeEditor: 原位富文本与公式源码编辑气泡；
 *    - MindMapOutliner & DualViewController: 导图与纯净白板大纲无缝双向切换；
 *    - MindMapShortcutDrawer: 快捷键指南抽屉 (H 键)；
 *    - MindMapBottomToolbar: 底部高亮与文本排版工具条；
 *    - MindMapStructureController: 左下角一体化控制区 (7 种结构切换 + 缩放条 + 居中 + A/D/S 科目切换胶囊)；
 *    - MindMapShortcutManager: 全局快捷键状态机与隔离。
 * 3. 驱动跨学科贝塞尔拓扑关联线 (AssociativeLine Enhancer) 与 Focus Resonance 聚焦高亮；
 * 4. 支持 1对N / 1对1 拓扑剪枝聚拢模式 (Cluster Mode)；
 * 5. 全面集成考点深度解析浮层 (PoliticsDetailInspector)，展示名师讲义出处、考点精解、核心要点、陷阱防坑与口诀；
 * 6. 暴露全局标准 CognitiveViewController API，完全契合题库生态统一规范。
 */

(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    var controller = factory();
    root.PoliticsMindMapController = controller;
    // 兼容全局统一 CognitiveViewController 接口命名
    root.CognitiveViewController = controller;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var mindMapInstance = null;
  var outliner = null;
  var dualViewController = null;
  var shortcutDrawer = null;
  var bottomToolbar = null;
  var structureController = null;
  var shortcutManager = null;
  var dragEnhancer = null;
  var nodeEditor = null;

  var currentScopeId = 'pol_macro';
  var currentLayerMode = 'subject_macro'; // 'subject_macro' | 'chapter'
  var isAssociativeLineVisible = true;
  var activeResonanceUid = null;
  var hoveredResonanceUid = null;
  var hoveredEdgePair = null;

  // 聚拢状态机
  var clusterState = {
    active: false,
    mode: null,          // 'node' | 'edge'
    centerUid: null,
    edgeFromUid: null,
    edgeToUid: null,
    involvedUids: [],
    fullTreeBackup: null
  };

  var SCOPE_ORDER = [
    'pol_macro',
    'pol_sg',
    'pol_my',
    'pol_mzt',
    'pol_xg',
    'pol_sx',
    'pol_xs',
    'pol_periods'
  ];

  // 深拷贝纯净树
  function cloneCleanTree(node, options) {
    if (!node) return null;
    var opts = options || {};
    var cleanData = {};
    var srcData = (node._node && node._node.nodeData && node._node.nodeData.data) ? node._node.nodeData.data : node.data;
    if (srcData && typeof srcData === 'object') {
      var keys = Object.keys(srcData);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (k === '_node' || k === '_mmLastSig' || k === '_expandModified' || k === '_isClusterPruned') continue;
        var val = srcData[k];
        if (Array.isArray(val)) {
          cleanData[k] = val.slice();
        } else if (val && typeof val === 'object') {
          cleanData[k] = JSON.parse(JSON.stringify(val));
        } else {
          cleanData[k] = val;
        }
      }
    }
    var cleanChildren = [];
    if (Array.isArray(node.children)) {
      for (var j = 0; j < node.children.length; j++) {
        var ch = cloneCleanTree(node.children[j], opts);
        if (ch) cleanChildren.push(ch);
      }
    }
    return {
      data: cleanData,
      children: cleanChildren
    };
  }

  // 初始化现代清晰认知导图主题
  function initTheme() {
    var MindMap = (window.simpleMindMap && (window.simpleMindMap.default || window.simpleMindMap)) || window.MindMap;
    if (!MindMap || typeof MindMap.defineTheme !== 'function') return;

    MindMap.defineTheme('cognitive_modern', {
      backgroundColor: '#f8f9fa',
      lineColor: '#3370ff',
      lineWidth: 1.8,
      lineStyle: 'straight',
      lineRadius: 8,
      nodeUseLineStyle: false,
      showLineMarker: false,
      associativeLineWidth: 1.6,
      associativeLineColor: 'rgba(51, 112, 255, 0.45)',
      associativeLineActiveWidth: 2.2,
      associativeLineActiveColor: '#3370ff',
      associativeLineTextColor: 'transparent',
      associativeLineTextFontSize: 0,
      associativeLineDasharray: '',
      root: {
        shape: 'rectangle',
        fillColor: '#3370ff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 8,
        paddingX: 18,
        paddingY: 10
      },
      second: {
        shape: 'rectangle',
        marginX: 46,
        marginY: 12,
        fillColor: '#eff0f1',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        color: '#1f2329',
        fontSize: 13,
        fontWeight: '600',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 6,
        hoverRectColor: '#3370ff',
        paddingX: 12,
        paddingY: 6
      },
      node: {
        shape: 'rectangle',
        marginX: 32,
        marginY: 8,
        fillColor: 'transparent',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        color: '#1f2329',
        fontSize: 12,
        fontWeight: 'normal',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 4,
        hoverRectColor: '#3370ff',
        paddingX: 6,
        paddingY: 3
      }
    });
  }

  // 挂载跨学科贝塞尔曲线关联线增强器 (AssociativeLine Enhancer)
  function installAssociativeLineEnhancer(AssociativeLineProto) {
    if (!AssociativeLineProto || AssociativeLineProto._hasCognitiveEnhancement) return;
    AssociativeLineProto._hasCognitiveEnhancement = true;

    AssociativeLineProto.onNodeClick = function () {
      this.clearActiveLine();
    };

    AssociativeLineProto.removeAllLines = function () {
      (this.lineList || []).forEach(function (line) {
        if (line[0] && typeof line[0].remove === 'function') line[0].remove();
        if (line[1] && typeof line[1].remove === 'function') line[1].remove();
        if (line[2] && typeof line[2].remove === 'function') line[2].remove();
      });
      this.lineList = [];
    };

    AssociativeLineProto.renderAllLines = function () {
      if (this.isNotRenderAllLines) {
        this.isNotRenderAllLines = false;
        return;
      }
      var tree = this.mindMap && this.mindMap.renderer && this.mindMap.renderer.root;
      if (!tree) return;
      this.removeAllLines();
      this.removeControls();
      this.clearActiveLine();

      // 关联线图层置于节点下方，避免遮挡卡片文字
      if (this.associativeLineDraw && this.associativeLineDraw.node &&
          this.mindMap && this.mindMap.nodeDraw && this.mindMap.nodeDraw.node) {
        var assocEl = this.associativeLineDraw.node;
        var nodeDrawEl = this.mindMap.nodeDraw.node;
        if (assocEl.parentNode && assocEl.parentNode === nodeDrawEl.parentNode && assocEl.nextSibling !== nodeDrawEl) {
          nodeDrawEl.parentNode.insertBefore(assocEl, nodeDrawEl);
        }
      }

      var idToNode = new Map();
      var rawEdges = [];

      var walk = function (cur) {
        if (!cur) return;
        var data = cur.getData();
        if (data && data.uid) {
          idToNode.set(data.uid, cur);
        }
        var targets = (data && (data.associativeLineTargets || data.resonanceLinks)) || [];
        if (Array.isArray(targets) && targets.length > 0) {
          targets.forEach(function (toUid) {
            rawEdges.push({
              fromNode: cur,
              fromUid: data.uid,
              toUid: toUid
            });
          });
        }
        if (Array.isArray(cur.children)) {
          cur.children.forEach(walk);
        }
      };
      walk(tree);

      var validEdges = [];
      var seenPairs = new Set();
      rawEdges.forEach(function (e) {
        if (!e.fromUid || !e.toUid || e.fromUid === e.toUid) return;
        var toNode = idToNode.get(e.toUid);
        if (toNode && e.fromNode) {
          var pairKey = e.fromUid < e.toUid ? (e.fromUid + '<->' + e.toUid) : (e.toUid + '<->' + e.fromUid);
          if (seenPairs.has(pairKey)) return;
          seenPairs.add(pairKey);

          // 拓扑剪枝聚拢态下过滤
          if (clusterState && clusterState.active) {
            if (clusterState.mode === 'edge') {
              var isTarget = (e.fromUid === clusterState.edgeFromUid && e.toUid === clusterState.edgeToUid) ||
                             (e.fromUid === clusterState.edgeToUid && e.toUid === clusterState.edgeFromUid);
              if (!isTarget) return;
            } else if (clusterState.mode === 'node' && clusterState.centerUid) {
              if (e.fromUid !== clusterState.centerUid && e.toUid !== clusterState.centerUid) return;
            }
          }

          validEdges.push({
            fromNode: e.fromNode,
            toNode: toNode,
            fromUid: e.fromUid,
            toUid: e.toUid,
            pairKey: pairKey
          });
        }
      });

      if (validEdges.length === 0) return;

      var self = this;
      validEdges.forEach(function (edge) {
        var fromNode = edge.fromNode;
        var toNode = edge.toNode;
        var fromUid = edge.fromUid;
        var toUid = edge.toUid;

        // 根据节点在画布上的相对横向位置，智能分配左右端点
        var fromCenterX = fromNode.left + fromNode.width / 2;
        var toCenterX = toNode.left + toNode.width / 2;
        var isFromLeft = fromCenterX <= toCenterX;

        var startX = isFromLeft ? (fromNode.left + fromNode.width) : fromNode.left;
        var startY = fromNode.top + fromNode.height / 2;
        var endX = isFromLeft ? toNode.left : (toNode.left + toNode.width);
        var endY = toNode.top + toNode.height / 2;

        var dx = endX - startX;
        var dy = endY - startY;

        var cx1, cy1, cx2, cy2;
        if (Math.abs(dx) >= 30) {
          cx1 = startX + dx * 0.42;
          cy1 = startY;
          cx2 = endX - dx * 0.42;
          cy2 = endY;
        } else {
          // 纵向接近，采用侧向拱弧
          var arcOffset = 60;
          cx1 = startX + (isFromLeft ? arcOffset : -arcOffset);
          cy1 = startY + dy * 0.3;
          cx2 = endX + (isFromLeft ? arcOffset : -arcOffset);
          cy2 = endY - dy * 0.3;
        }

        var pathStr = 'M ' + startX.toFixed(1) + ' ' + startY.toFixed(1) +
                      ' C ' + cx1.toFixed(1) + ' ' + cy1.toFixed(1) + ', ' +
                      cx2.toFixed(1) + ' ' + cy2.toFixed(1) + ', ' +
                      endX.toFixed(1) + ' ' + endY.toFixed(1);

        // 真实渲染的可视线条
        var path = self.associativeLineDraw.path();
        path.plot(pathStr);
        path.stroke({
          width: 1.5,
          color: '#4068eb'
        }).fill({
          color: 'none'
        });
        if (path.node) {
          path.node.setAttribute('class', 'smm-associative-line-path');
          path.node.setAttribute('data-from-uid', fromUid);
          path.node.setAttribute('data-to-uid', toUid);
          path.node.style.strokeDasharray = 'none';
        }

        // 宽截面悬停与点击感应路径 (18px)
        var clickPath = self.associativeLineDraw.path();
        clickPath.plot(pathStr);
        clickPath.stroke({
          width: 18,
          color: 'transparent'
        }).fill({
          color: 'none'
        });
        if (clickPath.node) {
          clickPath.node.setAttribute('class', 'smm-associative-line-click-path');
          clickPath.node.setAttribute('data-from-uid', fromUid);
          clickPath.node.setAttribute('data-to-uid', toUid);
          clickPath.node.style.cursor = 'pointer';

          clickPath.node.addEventListener('mouseenter', function () {
            hoveredEdgePair = { from: fromUid, to: toUid };
            syncAssociativeLinesState();
          });
          clickPath.node.addEventListener('mouseleave', function () {
            hoveredEdgePair = null;
            syncAssociativeLinesState();
          });
          clickPath.node.addEventListener('click', function (ev) {
            ev.stopPropagation();
            toggleEdgeCluster(fromUid, toUid);
          });
        }

        self.lineList.push([path, clickPath, null]);
      });

      syncAssociativeLinesState();
    };
  }

  // 同步关联线高亮与静音状态
  function syncAssociativeLinesState() {
    var container = document.querySelector('.smm-associative-line-container');
    if (!container) return;

    if (!isAssociativeLineVisible) {
      container.classList.add('is-global-muted');
    } else {
      container.classList.remove('is-global-muted');
    }

    var paths = container.querySelectorAll('path.smm-associative-line-path');
    var hasActiveResonance = Boolean(activeResonanceUid);
    var hasHoverPair = Boolean(hoveredEdgePair);

    container.classList.toggle('has-active-selection', hasActiveResonance);
    container.classList.toggle('has-hover-selection', hasHoverPair);

    paths.forEach(function (p) {
      var f = p.getAttribute('data-from-uid');
      var t = p.getAttribute('data-to-uid');

      var isActive = hasActiveResonance && (f === activeResonanceUid || t === activeResonanceUid);
      var isHover = hasHoverPair && (
        (f === hoveredEdgePair.from && t === hoveredEdgePair.to) ||
        (f === hoveredEdgePair.to && t === hoveredEdgePair.from)
      );

      p.classList.toggle('is-active-line', isActive);
      p.classList.toggle('is-hover-line', isHover);
    });
  }

  // 关联线显隐控制
  function toggleAssociativeLines(force) {
    if (typeof force === 'boolean') {
      isAssociativeLineVisible = force;
    } else {
      isAssociativeLineVisible = !isAssociativeLineVisible;
    }
    syncAssociativeLinesState();
    updateLinesButtonUI();
    return isAssociativeLineVisible;
  }

  function updateLinesButtonUI() {
    var btn = document.getElementById('btnToggleLines');
    if (btn) {
      btn.classList.toggle('is-active', isAssociativeLineVisible);
      btn.setAttribute('aria-pressed', isAssociativeLineVisible ? 'true' : 'false');
      var span = btn.querySelector('span:not(.pill-dot)');
      if (span) {
        span.textContent = isAssociativeLineVisible ? '关联线：开' : '关联线：关';
      }
    }
  }

  // 确保目标节点数组或单个节点的全部祖先节点处于展开状态
  function ensureAncestorsExpanded(targetUids) {
    if (!mindMapInstance || !targetUids) return false;
    var uids = Array.isArray(targetUids) ? targetUids : [targetUids];
    if (uids.length === 0) return false;
    var uidSet = new Set(uids.filter(Boolean));
    if (uidSet.size === 0) return false;

    var data = mindMapInstance.getData(false);
    if (!data) return false;

    var modified = false;
    function walk(node) {
      if (!node) return false;
      var uid = (node.data && node.data.uid) || '';
      var isSelf = uidSet.has(uid);
      var hasTargetInChild = false;
      if (Array.isArray(node.children)) {
        for (var i = 0; i < node.children.length; i++) {
          if (walk(node.children[i])) {
            hasTargetInChild = true;
          }
        }
      }
      if (hasTargetInChild && node.data && !node.data.expand) {
        node.data.expand = true;
        modified = true;
      }
      return isSelf || hasTargetInChild;
    }
    walk(data);

    if (modified) {
      mindMapInstance.setData(data);
    }
    return modified;
  }

  // 跨分支共鸣聚焦高亮 (Focus Resonance)
  function applyFocusResonanceByUid(uid) {
    if (!mindMapInstance || !uid) return;

    var relations = window.PoliticsDataAdapter ? window.PoliticsDataAdapter.getRelationsForNode(uid) : [];
    var targetUids = relations.map(function (rel) { return rel.targetUid; }).filter(Boolean);
    var allUids = [uid].concat(targetUids);

    // 检查所有相关节点是否都已在 DOM 中；如果有折叠节点，先展开其所有祖先
    var allInDom = true;
    for (var i = 0; i < allUids.length; i++) {
      if (!document.querySelector('#mindMapContainer [data-node-uid="' + allUids[i] + '"]')) {
        allInDom = false;
        break;
      }
    }

    if (!allInDom) {
      if (ensureAncestorsExpanded(allUids)) {
        setTimeout(function () {
          applyFocusResonanceByUid(uid);
        }, 120);
        return;
      }
    }

    activeResonanceUid = uid;

    var containerEl = document.querySelector('#mindMapContainer .smm-node-container');
    if (containerEl) {
      containerEl.classList.add('has-resonance-focus');
    }

    var allCards = document.querySelectorAll('#mindMapContainer .mm-node-card');
    allCards.forEach(function (card) {
      card.classList.remove('is-in-resonance', 'resonance-active', 'resonance-linked');
    });

    var allNodes = document.querySelectorAll('#mindMapContainer .smm-node');
    allNodes.forEach(function (node) {
      node.classList.remove('is-in-resonance', 'resonance-active', 'resonance-linked');
    });

    var curCard = document.querySelector('#mindMapContainer [data-node-uid="' + uid + '"]');
    if (curCard) {
      curCard.classList.add('is-in-resonance', 'resonance-active');
      var pNode = curCard.closest('.smm-node');
      if (pNode) pNode.classList.add('is-in-resonance', 'resonance-active');
    }

    relations.forEach(function (rel) {
      var tUid = rel.targetUid;
      var tCard = document.querySelector('#mindMapContainer [data-node-uid="' + tUid + '"]');
      if (tCard) {
        tCard.classList.add('is-in-resonance', 'resonance-linked');
        var p = tCard.closest('.smm-node');
        if (p) p.classList.add('is-in-resonance', 'resonance-linked');
      }
    });

    if (mindMapInstance.associativeLine && typeof mindMapInstance.associativeLine.renderAllLines === 'function') {
      mindMapInstance.associativeLine.renderAllLines();
    }
    syncAssociativeLinesState();
  }

  function clearFocusResonance() {
    activeResonanceUid = null;
    var containerEl = document.querySelector('#mindMapContainer .smm-node-container');
    if (containerEl) {
      containerEl.classList.remove('has-resonance-focus', 'is-cluster-mode');
    }

    var allCards = document.querySelectorAll('#mindMapContainer .mm-node-card');
    allCards.forEach(function (card) {
      card.classList.remove('is-in-resonance', 'resonance-active', 'resonance-linked');
    });

    var allNodes = document.querySelectorAll('#mindMapContainer .smm-node');
    allNodes.forEach(function (node) {
      node.classList.remove('is-in-resonance', 'resonance-active', 'resonance-linked');
    });

    syncAssociativeLinesState();
  }

  function toggleFocusResonanceByUid(uid) {
    if (activeResonanceUid === uid) {
      clearFocusResonance();
    } else {
      applyFocusResonanceByUid(uid);
    }
  }

  // 拓扑剪枝聚拢树构建
  function buildPrunedClusterTree(fullTree, involvedUidSet) {
    if (!fullTree || !involvedUidSet || involvedUidSet.size === 0) return null;

    var subtreeHasInvolved = new WeakMap();
    function checkSubtree(node) {
      if (!node) return false;
      var uid = (node.data && node.data.uid) || '';
      var selfIn = Boolean(uid && involvedUidSet.has(uid));
      var childIn = false;
      if (Array.isArray(node.children)) {
        for (var i = 0; i < node.children.length; i++) {
          if (checkSubtree(node.children[i])) {
            childIn = true;
          }
        }
      }
      var res = selfIn || childIn;
      subtreeHasInvolved.set(node, res);
      return res;
    }
    checkSubtree(fullTree);

    function pruneWalk(node, distFromInvolved, isRoot) {
      if (!node) return null;
      var uid = (node.data && node.data.uid) || '';
      var isSelfInvolved = Boolean(uid && involvedUidSet.has(uid));
      var hasInvolvedDescendant = false;
      if (Array.isArray(node.children)) {
        for (var i = 0; i < node.children.length; i++) {
          if (subtreeHasInvolved.get(node.children[i])) {
            hasInvolvedDescendant = true;
            break;
          }
        }
      }

      var myDist = isSelfInvolved ? 0 : (distFromInvolved !== null ? distFromInvolved + 1 : null);

      if (!isRoot && !isSelfInvolved && !hasInvolvedDescendant && myDist === null) {
        return null;
      }

      var cloned = cloneCleanTree({ data: node.data, children: [] });
      if (!cloned.data) cloned.data = {};

      if (isRoot || hasInvolvedDescendant) {
        cloned.data.expand = true;
      } else if (isSelfInvolved) {
        cloned.data.expand = Boolean(Array.isArray(node.children) && node.children.length > 0);
      } else {
        cloned.data.expand = false;
      }

      if (Array.isArray(node.children) && node.children.length > 0) {
        var nextChildren = [];
        for (var j = 0; j < node.children.length; j++) {
          var ch = pruneWalk(node.children[j], myDist, false);
          if (ch) nextChildren.push(ch);
        }
        cloned.children = nextChildren;
      }

      return cloned;
    }

    return pruneWalk(fullTree, null, true);
  }

  // 1对N 关联节点拓扑聚拢
  function enterNodeCluster(uid) {
    if (!mindMapInstance || !uid) return false;
    var curTree = (mindMapInstance.renderer && mindMapInstance.renderer.renderTree) || mindMapInstance.getData(false);
    if (!curTree) return false;

    if (!clusterState.active) {
      clusterState.fullTreeBackup = cloneCleanTree(curTree);
    }

    var relations = window.PoliticsDataAdapter ? window.PoliticsDataAdapter.getRelationsForNode(uid) : [];
    if (!relations || relations.length === 0) {
      applyFocusResonanceByUid(uid);
      return false;
    }

    var targets = relations.map(function (r) { return r.targetUid; });
    var involvedUids = [uid].concat(targets);
    var involvedSet = new Set(involvedUids);

    var prunedTree = buildPrunedClusterTree(clusterState.fullTreeBackup, involvedSet);
    if (!prunedTree) return false;

    clusterState.active = true;
    clusterState.mode = 'node';
    clusterState.centerUid = uid;
    clusterState.edgeFromUid = null;
    clusterState.edgeToUid = null;
    clusterState.involvedUids = involvedUids;
    activeResonanceUid = uid;

    applyClusterTree(prunedTree);
    return true;
  }

  function toggleNodeCluster(uid) {
    if (clusterState.active && clusterState.mode === 'node' && clusterState.centerUid === uid) {
      return exitClusterMode();
    }
    return enterNodeCluster(uid);
  }

  // 1对1 关联边拓扑聚拢
  function enterEdgeCluster(fromUid, toUid) {
    if (!mindMapInstance || !fromUid || !toUid) return false;
    var curTree = (mindMapInstance.renderer && mindMapInstance.renderer.renderTree) || mindMapInstance.getData(false);
    if (!curTree) return false;

    if (!clusterState.active) {
      clusterState.fullTreeBackup = cloneCleanTree(curTree);
    }

    var involvedUids = [fromUid, toUid];
    var involvedSet = new Set(involvedUids);
    var prunedTree = buildPrunedClusterTree(clusterState.fullTreeBackup, involvedSet);
    if (!prunedTree) return false;

    clusterState.active = true;
    clusterState.mode = 'edge';
    clusterState.centerUid = fromUid;
    clusterState.edgeFromUid = fromUid;
    clusterState.edgeToUid = toUid;
    clusterState.involvedUids = involvedUids;
    activeResonanceUid = fromUid;

    applyClusterTree(prunedTree);
    return true;
  }

  function toggleEdgeCluster(fromUid, toUid) {
    if (clusterState.active && clusterState.mode === 'edge' &&
        ((clusterState.edgeFromUid === fromUid && clusterState.edgeToUid === toUid) ||
         (clusterState.edgeFromUid === toUid && clusterState.edgeToUid === fromUid))) {
      return exitClusterMode();
    }
    return enterEdgeCluster(fromUid, toUid);
  }

  function applyClusterTree(prunedTree) {
    if (!mindMapInstance || !prunedTree) return;
    mindMapInstance.setData(prunedTree);

    setTimeout(function () {
      if (mindMapInstance.associativeLine && typeof mindMapInstance.associativeLine.renderAllLines === 'function') {
        mindMapInstance.associativeLine.renderAllLines();
      }
      fitCanvasToViewport();
      applyFocusResonanceByUid(clusterState.centerUid);
    }, 80);
  }

  // 退出聚拢模式，完整还原全树
  function exitClusterMode(options) {
    if (!clusterState.active || !clusterState.fullTreeBackup) {
      clusterState.active = false;
      clearFocusResonance();
      return false;
    }

    var backup = cloneCleanTree(clusterState.fullTreeBackup);
    clusterState.active = false;
    clusterState.mode = null;
    clusterState.centerUid = null;
    clusterState.edgeFromUid = null;
    clusterState.edgeToUid = null;
    clusterState.involvedUids = [];
    clusterState.fullTreeBackup = null;

    mindMapInstance.setData(backup);

    setTimeout(function () {
      if (mindMapInstance.associativeLine && typeof mindMapInstance.associativeLine.renderAllLines === 'function') {
        mindMapInstance.associativeLine.renderAllLines();
      }
      clearFocusResonance();
      if (!options || !options.restoreOnly) {
        fitCanvasToViewport();
      }
    }, 80);

    return true;
  }

  // 展开层级控制 (Alt + 1, 2, 3 / Alt + Shift + .)
  function expandToLevel(targetLevel) {
    if (!mindMapInstance) return;
    var data = mindMapInstance.getData(false);
    if (!data) return;

    function setExpand(node, curLevel) {
      if (!node) return;
      if (!node.data) node.data = {};
      node.data.expand = (curLevel <= targetLevel);
      if (Array.isArray(node.children)) {
        node.children.forEach(function (ch) {
          setExpand(ch, curLevel + 1);
        });
      }
    }
    setExpand(data, 0);

    mindMapInstance.setData(data);
    setTimeout(function () {
      if (mindMapInstance.associativeLine && typeof mindMapInstance.associativeLine.renderAllLines === 'function') {
        mindMapInstance.associativeLine.renderAllLines();
      }
      fitCanvasToViewport();
    }, 60);
  }

  function expandAll() {
    expandToLevel(99);
  }

  function collapseAll() {
    expandToLevel(1);
  }

  // 精准计算当前渲染世界子树的边界 (基于 SimpleMindMap 布局树内部坐标，杜绝 getRbox 缺失异常)
  function measureWorldSubtreeBounds(allowedUidSet) {
    var rootNode = mindMapInstance && mindMapInstance.renderer && mindMapInstance.renderer.root;
    if (!rootNode) return null;
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    var count = 0;

    function walk(node) {
      if (!node) return;
      var uid = (typeof node.getData === 'function' ? node.getData('uid') : '') ||
                (node.nodeData && node.nodeData.data && node.nodeData.data.uid) || '';
      var include = !allowedUidSet || (uid && allowedUidSet.has(uid));
      if (include && typeof node.left === 'number' && typeof node.top === 'number' && node.width > 0 && node.height > 0) {
        if (node.left < minX) minX = node.left;
        if (node.top < minY) minY = node.top;
        if (node.left + node.width > maxX) maxX = node.left + node.width;
        if (node.top + node.height > maxY) maxY = node.top + node.height;
        count++;
      }
      var isExpanded = (typeof node.getData === 'function' ? node.getData('expand') : true) !== false;
      if (isExpanded && Array.isArray(node.children)) {
        for (var i = 0; i < node.children.length; i++) {
          walk(node.children[i]);
        }
      }
    }

    walk(rootNode);
    if (count === 0) return null;
    return {
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
      count: count
    };
  }

  // 视口自适应居中 (F 键)
  function fitCanvasToViewport(padding) {
    if (!mindMapInstance || !mindMapInstance.view) return false;
    var wb = measureWorldSubtreeBounds(null);
    if (!wb) {
      try {
        if (typeof mindMapInstance.view.reset === 'function') {
          mindMapInstance.view.reset();
        }
      } catch (e) {}
      return false;
    }

    var container = document.getElementById('mindMapContainer');
    var cRect = container ? container.getBoundingClientRect() : null;
    var vw = (cRect && cRect.width > 0) ? cRect.width : (window.innerWidth || 1440);
    var vh = (cRect && cRect.height > 0) ? cRect.height : (window.innerHeight || 900);

    var pad = typeof padding === 'number' ? padding : 48;
    var topPad = Math.max(48, pad);
    var bottomPad = Math.max(68, pad + 18);
    var availW = Math.max(240, vw - pad * 2);
    var availH = Math.max(240, vh - topPad - bottomPad);

    var scaleToFitW = availW / Math.max(1, wb.width);
    var scaleToFitH = availH / Math.max(1, wb.height);
    var targetScale = Math.min(scaleToFitW, scaleToFitH);
    targetScale = Math.max(0.10, Math.min(1.0, targetScale));

    var worldCenterX = (wb.minX + wb.maxX) / 2;
    var worldCenterY = (wb.minY + wb.maxY) / 2;
    var targetX = (vw / 2) - worldCenterX * targetScale;
    var targetY = (vh / 2) - worldCenterY * targetScale;

    mindMapInstance.view.scale = targetScale;
    mindMapInstance.view.x = targetX;
    mindMapInstance.view.y = targetY;
    if (typeof mindMapInstance.view.transform === 'function') {
      mindMapInstance.view.transform();
    }
    if (typeof mindMapInstance.view.emitEvent === 'function') {
      mindMapInstance.view.emitEvent('scale');
      mindMapInstance.view.emitEvent('translate');
    }
    if (structureController && typeof structureController.updateZoomDisplay === 'function') {
      structureController.updateZoomDisplay();
    }
    syncAssociativeLinesState();
    return true;
  }

  // 定位居中某个节点 (支持跨学科作用域无缝直达与自动祖先展开)
  function centerNode(uid) {
    if (!mindMapInstance || !uid) return;
    var card = document.querySelector('#mindMapContainer [data-node-uid="' + uid + '"]');
    if (!card) {
      var nodeData = window.PoliticsDataAdapter ? window.PoliticsDataAdapter.getNodeById(uid) : null;
      var bookScopeMap = {
        'sg': 'pol_sg',
        'my': 'pol_my',
        'mzt': 'pol_mzt',
        'xg': 'pol_xg',
        'sx': 'pol_sx',
        'xs': 'pol_xs'
      };
      if (nodeData && nodeData.bookId && currentScopeId !== 'pol_macro' && bookScopeMap[nodeData.bookId] && bookScopeMap[nodeData.bookId] !== currentScopeId) {
        loadScope(bookScopeMap[nodeData.bookId]);
        setTimeout(function () {
          centerNode(uid);
        }, 150);
        return;
      }
      if (ensureAncestorsExpanded(uid)) {
        setTimeout(function () {
          centerNode(uid);
        }, 120);
        return;
      }
    }
    card = document.querySelector('#mindMapContainer [data-node-uid="' + uid + '"]');
    if (card && mindMapInstance.view) {
      try {
        var rect = card.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var viewCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        var dx = viewCenter.x - cx;
        var dy = viewCenter.y - cy;
        mindMapInstance.view.translate(dx, dy);
        applyFocusResonanceByUid(uid);
      } catch (e) {}
    }
  }

  var lastVisitedSubjectId = 'pol_my';

  // 学科作用域切换 (Scope Switcher)
  function loadScope(scopeId) {
    if (!window.PoliticsDataAdapter) return;
    if (clusterState.active) {
      exitClusterMode({ restoreOnly: true });
    }

    currentScopeId = scopeId || 'pol_macro';
    currentLayerMode = (currentScopeId === 'pol_macro') ? 'subject_macro' : 'chapter';

    if (currentScopeId !== 'pol_macro' && currentScopeId !== 'pol_periods') {
      lastVisitedSubjectId = currentScopeId;
    }

    var scopeData = window.PoliticsDataAdapter.getScopeData(currentScopeId);
    if (!scopeData) return;

    if (!mindMapInstance) {
      initMindMap(scopeData);
    } else {
      mindMapInstance.setData(scopeData);
      setTimeout(function () {
        if (mindMapInstance.associativeLine && typeof mindMapInstance.associativeLine.renderAllLines === 'function') {
          mindMapInstance.associativeLine.renderAllLines();
        }
        fitCanvasToViewport();
      }, 80);
    }

    // 同步更新大纲数据
    if (dualViewController) {
      dualViewController.syncMindMapToOutliner();
    }

    updateScopeUI();
  }

  // 切换上一科/下一科 (A / D 键)
  function navigateChapter(delta) {
    var curIdx = SCOPE_ORDER.indexOf(currentScopeId);
    if (curIdx === -1) curIdx = 0;
    var nextIdx = (curIdx + delta + SCOPE_ORDER.length) % SCOPE_ORDER.length;
    loadScope(SCOPE_ORDER[nextIdx]);
  }

  // 全景/分科切换 (S 键)
  function toggleLayerMode() {
    if (currentScopeId === 'pol_macro') {
      loadScope(lastVisitedSubjectId || 'pol_my');
    } else {
      loadScope('pol_macro');
    }
  }

  // 更新顶部选项卡与底部胶囊状态
  function updateScopeUI() {
    // 1. 顶部 Tab 激活状态
    var tabs = document.querySelectorAll('#politicsSubjectTabs .subj-tab-btn');
    tabs.forEach(function (tab) {
      tab.classList.toggle('active', tab.getAttribute('data-scope') === currentScopeId);
    });

    // 2. 底部胶囊状态更新
    var defs = window.PoliticsDataAdapter ? window.PoliticsDataAdapter.getAllScopeDefs() : [];
    var curDef = defs.find(function (d) { return d.id === currentScopeId; }) || { title: '考研政治全景', count: 692 };

    if (structureController && typeof structureController.updateLayerStatus === 'function') {
      structureController.updateLayerStatus({
        layerMode: currentLayerMode,
        labelText: curDef.title + (curDef.count ? ' (' + curDef.count + '考点)' : ''),
        hidden: false
      });
    }
  }

  // 考点精解与名师讲义浮层 (PoliticsDetailInspector)
  function openDetailInspector(nodeOrData, targetEl) {
    var inspector = document.getElementById('politicsInspector');
    if (!inspector || !nodeOrData) return;

    var rawNode = nodeOrData.rawNode || nodeOrData;
    var detail = rawNode.detail || nodeOrData.detail || {};
    var nodeId = rawNode.id || rawNode.uid || nodeOrData.uid || '';
    var relEdges = (window.PoliticsDataAdapter && window.PoliticsDataAdapter.getRelationsForNode(nodeId)) || [];

    var badgeEl = document.getElementById('inspBadge');
    var titleEl = document.getElementById('inspTitle');
    var bodyEl = document.getElementById('inspBody');

    if (badgeEl) {
      var kindText = '考点精解';
      if (rawNode.kind === 'period') kindText = '历史分期要览';
      else if (rawNode.kind === 'section') kindText = '小节体系';
      else if (rawNode.kind === 'chapter') kindText = '学科章节';
      else if (rawNode.kind === 'book' || rawNode.kind === 'macro' || rawNode.role === 'root') kindText = '学科总揽';
      badgeEl.textContent = (rawNode.importance ? rawNode.importance + '★ ' : '') + kindText;
    }
    if (titleEl) {
      titleEl.textContent = rawNode.title || rawNode.shortTitle || rawNode.text || nodeOrData.text || nodeId;
    }

    var html = '';

    // 1. 权威讲义出处
    if (detail.sourceRefs && detail.sourceRefs.length > 0) {
      html += '<div class="insp-section insp-source">';
      html += '<div class="insp-section-label">📖 讲义出处</div>';
      html += '<div class="insp-source-tag">' + detail.sourceRefs.join('； ') + '</div>';
      html += '</div>';
    }

    // 2. 核心总结 / 考点要义
    if (detail.summary) {
      html += '<div class="insp-section">';
      html += '<div class="insp-section-label">💡 核心精解</div>';
      html += '<div class="insp-summary-box">' + (window.MarkdownLatexEngine ? window.MarkdownLatexEngine.renderInline(detail.summary) : detail.summary) + '</div>';
      html += '</div>';
    }

    // 3. 核心要点清单
    if (Array.isArray(detail.keyPoints) && detail.keyPoints.length > 0) {
      html += '<div class="insp-section">';
      html += '<div class="insp-section-label">📋 核心要点 (' + detail.keyPoints.length + ')</div>';
      html += '<ul class="insp-key-list">';
      detail.keyPoints.forEach(function (kp) {
        var rendered = window.MarkdownLatexEngine ? window.MarkdownLatexEngine.renderInline(kp) : kp;
        html += '<li>' + rendered + '</li>';
      });
      html += '</ul></div>';
    }

    // 4. 易错陷阱与辨析防坑
    if (Array.isArray(detail.traps) && detail.traps.length > 0) {
      html += '<div class="insp-section insp-traps">';
      html += '<div class="insp-section-label">⚠️ 易错防坑与考场陷阱</div>';
      html += '<ul class="insp-trap-list">';
      detail.traps.forEach(function (tr) {
        var rendered = window.MarkdownLatexEngine ? window.MarkdownLatexEngine.renderInline(tr) : tr;
        html += '<li>' + rendered + '</li>';
      });
      html += '</ul></div>';
    }

    // 5. 易混概念辨析对比
    if (Array.isArray(detail.compare) && detail.compare.length > 0) {
      html += '<div class="insp-section insp-compare">';
      html += '<div class="insp-section-label">⚖️ 易混概念对比</div>';
      html += '<ul class="insp-compare-list">';
      detail.compare.forEach(function (cp) {
        var rendered = window.MarkdownLatexEngine ? window.MarkdownLatexEngine.renderInline(cp) : cp;
        html += '<li>' + rendered + '</li>';
      });
      html += '</ul></div>';
    }

    // 6. 记忆口诀
    if (detail.mnemonic) {
      html += '<div class="insp-section insp-mnemonic">';
      html += '<div class="insp-section-label">🎯 名师记忆口诀</div>';
      html += '<div class="insp-mnemonic-pill">' + detail.mnemonic + '</div>';
      html += '</div>';
    }

    // 7. 跨学科拓扑关联与理论应用
    if (relEdges.length > 0) {
      html += '<div class="insp-section insp-relations">';
      html += '<div class="insp-section-label">🔗 跨学科拓扑关联 (' + relEdges.length + ')</div>';
      html += '<div class="insp-relation-cards">';
      relEdges.forEach(function (r) {
        var targetNode = window.PoliticsDataAdapter ? window.PoliticsDataAdapter.getNodeById(r.targetUid) : null;
        var targetTitle = targetNode ? (targetNode.title || targetNode.id) : r.targetUid;
        html += '<div class="insp-rel-card" data-jump-uid="' + r.targetUid + '">';
        html += '<div class="insp-rel-head">';
        html += '<span class="insp-rel-type">' + r.label + '</span>';
        html += '<button type="button" class="insp-jump-btn" title="在导图中定位此节点">定位跳转 ↗</button>';
        html += '</div>';
        if (r.note) {
          html += '<div class="insp-rel-note">' + r.note + '</div>';
        }
        html += '<div class="insp-rel-target">关联目标：<strong>' + targetTitle + '</strong></div>';
        html += '</div>';
      });
      html += '</div></div>';
    }

    if (bodyEl) {
      bodyEl.innerHTML = html;

      // 绑定关联卡片跳转事件
      var jumpBtns = bodyEl.querySelectorAll('.insp-rel-card');
      jumpBtns.forEach(function (card) {
        card.addEventListener('click', function (ev) {
          ev.stopPropagation();
          var jUid = card.getAttribute('data-jump-uid');
          if (jUid) {
            centerNode(jUid);
            var targetNode = window.PoliticsDataAdapter ? window.PoliticsDataAdapter.getNodeById(jUid) : null;
            if (targetNode) {
              openDetailInspector(targetNode);
            }
          }
        });
      });
    }

    inspector.style.display = 'flex';
    inspector.classList.add('show');
  }

  function closeDetailInspector() {
    var inspector = document.getElementById('politicsInspector');
    if (inspector) {
      inspector.classList.remove('show');
      inspector.style.display = 'none';
    }
  }

  // 节点动作分发
  function handleNodeActionClick(action, uid, nodeData, pillEl) {
    if (action === 'resonance') {
      toggleNodeCluster(uid);
    } else if (action === 'detail') {
      var rawNode = (nodeData && nodeData.rawNode) || (window.PoliticsDataAdapter && window.PoliticsDataAdapter.getNodeById(uid)) || nodeData;
      openDetailInspector(rawNode, pillEl);
    }
  }

  function handleWidgetClick(widgetType, nodeData, vizBtn) {
    var rawNode = (nodeData && nodeData.rawNode) || (window.PoliticsDataAdapter && window.PoliticsDataAdapter.getNodeById(nodeData.uid)) || nodeData;
    openDetailInspector(rawNode, vizBtn);
  }

  // 初始化 SimpleMindMap 实例与配套全功能工具集
  function initMindMap(initialData) {
    var MindMap = (window.simpleMindMap && (window.simpleMindMap.default || window.simpleMindMap)) || window.MindMap;
    if (!MindMap) {
      console.error('[PoliticsMindMapController] 无法获取 SimpleMindMap 构造函数');
      return;
    }

    initTheme();

    var container = document.getElementById('mindMapContainer');
    var outlinerContainer = document.getElementById('outlinerContainer');
    if (!container) return;

    mindMapInstance = new MindMap({
      el: container,
      data: initialData,
      layout: 'mindMap', // 双向发散思维导图布局
      theme: 'cognitive_modern',
      associativeLineIsAlwaysAboveNode: false,
      enableFreeDrag: false,
      autoMoveWhenMouseInEdgeOnDrag: true,
      useLeftKeySelectionRightKeyDrag: true,
      mousewheelAction: 'zoom',
      mouseScaleCenterUseMousePosition: true,
      defaultAssociativeLineText: '',
      enableAdjustAssociativeLinePoints: false,
      dragPlaceholderLineConfig: {
        color: '#3370ff',
        width: 2.5
      },
      dragPlaceholderRectFill: 'rgba(51, 112, 255, 0.15)',
      isUseCustomNodeContent: true,
      customCreateNodeContent: function (node) {
        if (window.MindMapNodeRenderer) {
          return window.MindMapNodeRenderer.render(node, {
            onActionClick: handleNodeActionClick,
            onWidgetClick: handleWidgetClick
          });
        }
        return null;
      }
    });

    window._mindMapInstance = mindMapInstance;

    // 挂载关联线增强
    if (mindMapInstance.associativeLine) {
      var alProto = Object.getPrototypeOf(mindMapInstance.associativeLine);
      installAssociativeLineEnhancer(alProto);
      mindMapInstance.associativeLine.renderAllLines = alProto.renderAllLines.bind(mindMapInstance.associativeLine);
      mindMapInstance.associativeLine.removeAllLines = alProto.removeAllLines.bind(mindMapInstance.associativeLine);
      mindMapInstance.associativeLine.onNodeClick = alProto.onNodeClick.bind(mindMapInstance.associativeLine);
      mindMapInstance.associativeLine.renderAllLines();
    }

    // 挂载磁吸拖拽增强器
    if (window.MindMapDragEnhancer) {
      dragEnhancer = new window.MindMapDragEnhancer(mindMapInstance);
      window._mindMapDragEnhancer = dragEnhancer;
    }

    // 挂载原位富文本编辑器
    if (window.MindMapNodeEditor) {
      nodeEditor = new window.MindMapNodeEditor(mindMapInstance, {
        container: document.body
      });
      window._mindMapNodeEditor = nodeEditor;
    }

    // 挂载大纲笔记引擎与双向视图控制器
    if (window.MindMapOutliner && outlinerContainer) {
      outliner = new window.MindMapOutliner(outlinerContainer, {
        titlePlaceholder: '考研政治大纲笔记'
      });
      window._outlinerInstance = outliner;
    }

    if (window.DualViewController && outliner) {
      dualViewController = new window.DualViewController(mindMapInstance, outliner, {
        defaultView: 'mindmap',
        mountSwitcher: false
      });
      window._dualViewController = dualViewController;
    }

    // 确保双向布局下严格遵从 PoliticsDataAdapter 指定的左右方向 (sg, my, mzt 居左；xs, xg, sx 居右)
    if (mindMapInstance.mindMapLayoutPro) {
      mindMapInstance.mindMapLayoutPro.updateNodeTree = function (tree) {
        if (!this.isMindMapLayout()) return;
        if (!tree || !Array.isArray(tree.children) || tree.children.length <= 0) return;
        var childrenLength = tree.children.length;
        var center = Math.ceil(childrenLength / 2);
        tree.children.forEach(function (item, index) {
          if (!item.data) item.data = {};
          if (item.data.dir === 'left' || item.data.dir === 'right') {
            return;
          }
          if (index + 1 <= center) {
            item.data.dir = 'right';
          } else {
            item.data.dir = 'left';
          }
        });
      }.bind(mindMapInstance.mindMapLayoutPro);

      mindMapInstance.off('before_update_data', mindMapInstance.mindMapLayoutPro.updateNodeTree);
      mindMapInstance.off('before_set_data', mindMapInstance.mindMapLayoutPro.updateNodeTree);
      mindMapInstance.on('before_update_data', mindMapInstance.mindMapLayoutPro.updateNodeTree);
      mindMapInstance.on('before_set_data', mindMapInstance.mindMapLayoutPro.updateNodeTree);
    }

    // 挂载快捷键指南抽屉
    if (window.MindMapShortcutDrawer) {
      shortcutDrawer = new window.MindMapShortcutDrawer({
        container: document.body
      });
      window._mindMapShortcutDrawer = shortcutDrawer;
    }

    // 挂载底部排版与高亮工具条
    if (window.MindMapBottomToolbar) {
      bottomToolbar = new window.MindMapBottomToolbar(mindMapInstance, {
        container: document.body,
        shortcutDrawer: shortcutDrawer
      });
      window._mindMapBottomToolbar = bottomToolbar;
    }

    // 挂载左下角一体化结构控制器
    if (window.MindMapStructureController) {
      structureController = new window.MindMapStructureController(mindMapInstance, {
        container: document.body,
        defaultLayout: 'mindMap',
        defaultLineStyle: 'straight'
      });
      window._mindMapStructureController = structureController;
    }

    // 挂载全键盘快捷键管理器
    if (window.MindMapShortcutManager) {
      shortcutManager = new window.MindMapShortcutManager(mindMapInstance, {
        container: document.body,
        shortcutDrawer: shortcutDrawer,
        outliner: outliner
      });
      window._mindMapShortcutManager = shortcutManager;
    }

    // 节点点击交互与详情唤起
    mindMapInstance.on('node_click', function (node) {
      var data = node && node.getData();
      if (data && data.uid) {
        applyFocusResonanceByUid(data.uid);
        var rawNode = data.rawNode || (window.PoliticsDataAdapter && window.PoliticsDataAdapter.getNodeById(data.uid)) || data;
        openDetailInspector(rawNode);
      }
    });

    mindMapInstance.on('node_tree_render_end', function () {
      if (mindMapInstance.associativeLine && typeof mindMapInstance.associativeLine.renderAllLines === 'function') {
        mindMapInstance.associativeLine.renderAllLines();
      }
      if (activeResonanceUid) {
        var curCard = document.querySelector('#mindMapContainer [data-node-uid="' + activeResonanceUid + '"]');
        if (curCard) {
          curCard.classList.add('is-in-resonance', 'resonance-active');
          var pNode = curCard.closest('.smm-node');
          if (pNode) pNode.classList.add('is-in-resonance', 'resonance-active');
        }
        var relations = window.PoliticsDataAdapter ? window.PoliticsDataAdapter.getRelationsForNode(activeResonanceUid) : [];
        relations.forEach(function (rel) {
          var tCard = document.querySelector('#mindMapContainer [data-node-uid="' + rel.targetUid + '"]');
          if (tCard) {
            tCard.classList.add('is-in-resonance', 'resonance-linked');
            var p = tCard.closest('.smm-node');
            if (p) p.classList.add('is-in-resonance', 'resonance-linked');
          }
        });
      }
      syncAssociativeLinesState();
    });

    mindMapInstance.on('scale', function () {
      if (structureController && typeof structureController.updateZoomDisplay === 'function') {
        structureController.updateZoomDisplay();
      }
    });

    mindMapInstance.on('draw_click', function () {
      clearFocusResonance();
      closeDetailInspector();
    });

    window.addEventListener('resize', function () {
      if (mindMapInstance) mindMapInstance.resize();
    });

    setTimeout(function () {
      fitCanvasToViewport();
    }, 120);

    console.info('[PoliticsMindMapController] 政治认知思维导图引擎与全部 9 大组件工具集装载完毕。');
  }

  // 顶层全局键盘事件拦截 (Esc 关闭 Inspector / 聚拢态 / 抽屉)
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var inspector = document.getElementById('politicsInspector');
      if (inspector && inspector.classList.contains('show')) {
        closeDetailInspector();
        e.preventDefault();
        return;
      }
      if (clusterState.active) {
        exitClusterMode();
        e.preventDefault();
        return;
      }
      if (shortcutDrawer && shortcutDrawer.isOpen) {
        shortcutDrawer.close();
        e.preventDefault();
        return;
      }
    }
  });

  return {
    init: function () {
      loadScope('pol_macro');
    },
    loadScope: loadScope,
    getCurrentScopeId: function () { return currentScopeId; },
    getLayerMode: function () { return currentLayerMode; },
    toggleLayerMode: toggleLayerMode,
    navigateChapter: navigateChapter,
    toggleAssociativeLines: toggleAssociativeLines,
    isAssociativeLineVisible: function () { return isAssociativeLineVisible; },
    applyFocusResonanceByUid: applyFocusResonanceByUid,
    clearFocusResonance: clearFocusResonance,
    toggleFocusResonanceByUid: toggleFocusResonanceByUid,
    enterNodeCluster: enterNodeCluster,
    toggleNodeCluster: toggleNodeCluster,
    enterEdgeCluster: enterEdgeCluster,
    toggleEdgeCluster: toggleEdgeCluster,
    exitClusterMode: exitClusterMode,
    isClusterActive: function () { return clusterState.active; },
    expandToLevel: expandToLevel,
    expandAll: expandAll,
    collapseAll: collapseAll,
    fitCanvasToViewport: fitCanvasToViewport,
    centerNode: centerNode,
    openDetailInspector: openDetailInspector,
    closeDetailInspector: closeDetailInspector,
    getInstance: function () { return mindMapInstance; },
    getOutliner: function () { return outliner; },
    getDualViewController: function () { return dualViewController; },
    getShortcutDrawer: function () { return shortcutDrawer; },
    getShortcutManager: function () { return shortcutManager; },
    getStructureController: function () { return structureController; },
    persistCurrentMindMapState: function () {}
  };
});
