/**
 * 考研政治认知思维导图数据适配器 (PoliticsDataAdapter)
 * 职责：
 * 1. 读取考研政治知识数据事实层 (692 节点 + 15 组跨学科关联 + 5 大历史分期 + 6 大学科)；
 * 2. 转换并生成适配 SimpleMindMap 的标准树状数据结构；
 * 3. 产出多维度视图数据源：
 *    - pol_macro: 全景宏观导图 (六大学科辐射展开，左右智能分流)；
 *    - pol_sg, pol_my, pol_mzt, pol_xg, pol_sx, pol_xs: 单学科垂直深耕导图；
 *    - pol_periods: 五大历史时期时空脉络纵览导图；
 * 4. 自动标注语义微标签 (tag / tagType)、星级重要度 (importance)、
 *    跨学科贝塞尔关联线目标 (associativeLineTargets / resonanceLinks) 与深度解析元数据 (detail)。
 */

(function (root, factory) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PoliticsDataAdapter = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var _rawBooks = [];
  var _rawPeriods = [];
  var _rawRelations = [];
  var _rawNodes = [];

  var _nodeMap = new Map();
  var _childrenMap = new Map();
  var _relationEdgesMap = new Map(); // uid -> array of { targetUid, label, type, note, isSource }
  var _scopeDataCache = new Map();
  var _isLoaded = false;

  // 学科色彩与简称映射表
  var BOOK_CONFIGS = {
    sg:  { title: '史纲', fullTitle: '中国近现代史纲要', color: '#B91C1C', side: 'left',  order: 1 },
    my:  { title: '马原', fullTitle: '马克思主义基本原理', color: '#1D4ED8', side: 'left',  order: 2 },
    mzt: { title: '毛中特', fullTitle: '毛泽东思想和中国特色社会主义理论体系概论', color: '#C2410C', side: 'left', order: 3 },
    xs:  { title: '当代', fullTitle: '形势与政策与当代世界经济与政治', color: '#0F766E', side: 'right', order: 4 },
    xg:  { title: '习概', fullTitle: '习近平新时代中国特色社会主义思想概论', color: '#DC2626', side: 'right', order: 5 },
    sx:  { title: '思法', fullTitle: '思想道德与法治', color: '#4338CA', side: 'right', order: 6 }
  };

  // 根据重要度与标签推导前置语义微标签
  function deriveTagAndType(node) {
    var rawTags = Array.isArray(node.tags) ? node.tags : [];
    var tagText = '';
    var tagType = 'default';
    var imp = typeof node.importance === 'number' ? node.importance : 3;

    if (node.kind === 'point') {
      if (imp >= 5) {
        tagText = '5★ 必考';
        tagType = 'exam';
      } else if (imp === 4) {
        tagText = '4★ 重点';
        tagType = 'exam';
      } else {
        tagText = '3★ 考点';
        tagType = 'exam';
      }

      // 如果有明确标签，挑选关键标签丰富呈现
      for (var i = 0; i < rawTags.length; i++) {
        var t = rawTags[i];
        if (/必背|核心|重点选择|高频/.test(t)) {
          tagText = imp + '★ ' + t;
          tagType = 'exam';
          break;
        } else if (/转折|伟业|会议|标志/.test(t)) {
          tagText = t;
          tagType = 'key';
          break;
        } else if (/原理|规律|基本特征/.test(t)) {
          tagText = t;
          tagType = 'thm';
          break;
        }
      }
    } else if (node.kind === 'section') {
      tagText = '节';
      tagType = 'section';
    } else if (node.kind === 'chapter') {
      tagText = '章';
      tagType = 'knowledge';
    } else if (node.kind === 'book') {
      tagText = '学科';
      tagType = 'key';
    }

    return { tag: tagText, tagType: tagType };
  }

  // 构建关系网索引
  function indexRelations(relations) {
    _relationEdgesMap.clear();
    if (!Array.isArray(relations)) return;

    relations.forEach(function (rel) {
      if (!rel.source || !rel.target) return;
      var s = rel.source;
      var t = rel.target;
      var lbl = rel.label || '关联';
      var typ = rel.type || 'associative';
      var note = (rel.meta && rel.meta.note) || '';

      if (!_relationEdgesMap.has(s)) _relationEdgesMap.set(s, []);
      _relationEdgesMap.get(s).push({
        targetUid: t,
        label: lbl,
        type: typ,
        note: note,
        isSource: true
      });

      if (!_relationEdgesMap.has(t)) _relationEdgesMap.set(t, []);
      _relationEdgesMap.get(t).push({
        targetUid: s,
        label: lbl,
        type: typ,
        note: note,
        isSource: false
      });
    });
  }

  // 将单一原始节点转换为 SimpleMindMap 卡片节点模型
  function transformNodeToCard(rawNode, options) {
    var opts = options || {};
    var depth = typeof rawNode.depth === 'number' ? rawNode.depth : (rawNode.kind === 'book' ? 0 : rawNode.kind === 'chapter' ? 1 : rawNode.kind === 'section' ? 2 : 3);
    var tagInfo = deriveTagAndType(rawNode);

    var relEdges = _relationEdgesMap.get(rawNode.id) || [];
    var targets = relEdges.map(function (e) { return e.targetUid; });

    // 是否有丰富考点详情
    var detail = rawNode.detail || {};
    var hasWidget = Boolean(
      detail.summary ||
      (Array.isArray(detail.keyPoints) && detail.keyPoints.length > 0) ||
      (Array.isArray(detail.traps) && detail.traps.length > 0) ||
      (Array.isArray(detail.compare) && detail.compare.length > 0) ||
      detail.mnemonic ||
      relEdges.length > 0
    );

    // 计算初次展开层级：若未特别指定，0~2级默认展开，3级考点默认收拢以保证全局清爽不乱
    var expand = true;
    if (typeof opts.defaultExpandLevel === 'number') {
      expand = (depth < opts.defaultExpandLevel);
    } else {
      expand = (depth <= 1);
    }

    var cardData = {
      text: rawNode.title || rawNode.shortTitle || rawNode.id,
      uid: rawNode.id,
      role: rawNode.kind || 'node',
      bookId: rawNode.bookId,
      periodId: rawNode.periodId,
      importance: rawNode.importance,
      tag: tagInfo.tag,
      tagType: tagInfo.tagType,
      macroLevel: depth,
      expand: expand,
      associativeLineTargets: targets,
      resonanceLinks: targets,
      hasWidget: hasWidget,
      widgetType: 'detail',
      widgetBtnText: '详解 📖',
      widgetBtnTitle: '查看考点精解与名师讲义笔记',
      detail: detail,
      relationEdges: relEdges,
      rawNode: rawNode
    };

    if (opts.dir) {
      cardData.dir = opts.dir;
    }

    return {
      data: cardData,
      children: []
    };
  }

  // 递归递归挂载子树
  function buildSubtree(rawNode, options) {
    var card = transformNodeToCard(rawNode, options);
    var childRawList = _childrenMap.get(rawNode.id) || [];

    // 按 order 属性自然升序排列
    childRawList.sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });

    var childOpts = Object.assign({}, options);
    if (options && options.dir) {
      childOpts.dir = options.dir;
    }

    childRawList.forEach(function (ch) {
      card.children.push(buildSubtree(ch, childOpts));
    });

    return card;
  }

  // 构建全景全量导图 (pol_macro)
  function buildMacroTree() {
    var macroDetail = {
      summary: '2027版徐涛考研政治权威讲义 692 核心知识节点大一统全景图，横跨六大学科与五大历史时期，配备 15 组深度跨学科哲学与历史拓扑关联。',
      keyPoints: [
        '马原 (129 节点)：辩证唯物论、唯物辩证法、认识论、唯物史观与资本主义政治经济学',
        '史纲 (156 节点)：旧民主、新民主、社会主义革命、改革开放到新时代的近代史纵深',
        '毛中特 (68 节点)：新民主主义革命理论、社会主义三大改造、邓小平理论与三大代表科学发展观',
        '习概 (240 节点)：十个明确、十四个坚持、十三个方面历史性成就与中国式现代化全面推进',
        '思法 (95 节点)：理想信念、中国精神、社会主义核心价值观、道德修养与法治体系素养',
        '当代 (4 节点)：百年未有之大变局、大国战略关系、构建人类命运共同体与全球治理'
      ],
      sourceRefs: ['《2027徐涛考研政治核心考点全书与强化讲义》']
    };

    var rootCard = {
      data: {
        text: '考研政治全景知识导图',
        uid: 'pol_macro',
        role: 'root',
        isSubjectMacroRoot: true,
        tag: '2027徐涛大纲 692考点体系',
        tagType: 'key',
        macroLevel: 0,
        expand: true,
        scopeId: 'pol_macro',
        scopeName: '全景全量',
        hasWidget: true,
        widgetType: 'detail',
        widgetBtnText: '体系概览',
        detail: macroDetail,
        rawNode: {
          id: 'pol_macro',
          title: '考研政治全景知识导图',
          kind: 'root',
          importance: 5,
          detail: macroDetail
        }
      },
      children: []
    };

    var topBooks = _childrenMap.get(null) || [];
    // 按科目既定顺序排布
    topBooks.sort(function (a, b) {
      var cfgA = BOOK_CONFIGS[a.bookId] || { order: 99 };
      var cfgB = BOOK_CONFIGS[b.bookId] || { order: 99 };
      return cfgA.order - cfgB.order;
    });

    topBooks.forEach(function (bNode) {
      var cfg = BOOK_CONFIGS[bNode.bookId] || { side: 'right' };
      var bSubtree = buildSubtree(bNode, {
        dir: cfg.side,
        defaultExpandLevel: 1 // 全景首屏展开学科，章节暂收拢，保证首屏鸟瞰全局清晰不遮挡
      });
      // 强化科目分支卡片显示
      bSubtree.data.tag = (bNode.shortTitle || cfg.title) + ' (' + countPoints(bNode.id) + '考点)';
      bSubtree.data.tagType = 'knowledge';
      bSubtree.data.color = cfg.color;
      bSubtree.data.rawNode = bNode;
      rootCard.children.push(bSubtree);
    });

    return rootCard;
  }

  // 递归统计某个节点下的考点总数
  function countPoints(nodeId) {
    var count = 0;
    var children = _childrenMap.get(nodeId) || [];
    children.forEach(function (ch) {
      if (ch.kind === 'point') count++;
      count += countPoints(ch.id);
    });
    return count;
  }

  // 构建单学科垂直树 (pol_sg, pol_my, pol_mzt, pol_xg, pol_sx, pol_xs)
  function buildSubjectTree(bookId) {
    var topBooks = _childrenMap.get(null) || [];
    var targetBook = null;
    for (var i = 0; i < topBooks.length; i++) {
      if (topBooks[i].bookId === bookId || topBooks[i].id === 'pol.' + bookId) {
        targetBook = topBooks[i];
        break;
      }
    }
    if (!targetBook) return null;

    var cfg = BOOK_CONFIGS[bookId] || { title: targetBook.title, color: '#3370ff' };
    var chapters = _childrenMap.get(targetBook.id) || [];
    chapters.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

    var rootDetail = targetBook.detail || {
      summary: targetBook.title + ' 权威考点知识体系，涵盖全部重点章节与真题命题点。'
    };

    var rootCard = {
      data: {
        text: targetBook.title + ' (' + cfg.title + ')',
        uid: 'pol_' + bookId,
        role: 'root',
        bookId: bookId,
        tag: countPoints(targetBook.id) + ' 考点体系',
        tagType: 'key',
        macroLevel: 0,
        expand: true,
        scopeId: 'pol_' + bookId,
        scopeName: cfg.title,
        hasWidget: true,
        widgetType: 'detail',
        widgetBtnText: '学科要略',
        detail: rootDetail,
        rawNode: {
          id: 'pol_' + bookId,
          title: targetBook.title + ' (' + cfg.title + ')',
          kind: 'book',
          importance: 5,
          detail: rootDetail
        }
      },
      children: []
    };

    // 左右均匀分流章节点，使向两侧发散思维导图完美对称饱满
    var half = Math.ceil(chapters.length / 2);
    chapters.forEach(function (ch, idx) {
      var dir = (idx < half) ? 'left' : 'right';
      // 如果只有 1 章 (如当代)，默认向右
      if (chapters.length <= 1) dir = 'right';

      var chSubtree = buildSubtree(ch, {
        dir: dir,
        defaultExpandLevel: 2 // 展开本章各小节
      });
      rootCard.children.push(chSubtree);
    });

    return rootCard;
  }

  // 构建历史时期时空纵览导图 (pol_periods)
  function buildPeriodsTree() {
    var periodsDetail = {
      summary: '以中国共产党历史决议划定的五大历史分期为横向时空坐标轴，打通近代史纲要、毛中特与习概的重大历史事件、转折会议与理论飞跃。',
      keyPoints: [
        '旧民主主义革命时期 (1840—1919)：近代中华民族的屈辱史、抗争史与早期探索',
        '新民主主义革命时期 (1919—1949)：中国共产党诞生、农村包围城市、抗日战争与建立新中国',
        '社会主义革命和建设时期 (1949—1978)：巩固新生政权、过渡时期总路线、三大改造与艰辛探索',
        '改革开放和社会主义现代化建设新时期 (1978—2012)：伟大转折、建设中国特色社会主义与走向21世纪',
        '中国特色社会主义新时代 (2012—至今)：全面从严治党、历史性成就历史性变革、中国式现代化新篇章'
      ],
      sourceRefs: ['《中共中央关于党的百年奋斗重大成就和历史经验的决议》']
    };

    var rootCard = {
      data: {
        text: '中国近现代重大历史时期与时空脉络',
        uid: 'pol_periods',
        role: 'root',
        tag: '五大历史分期 1840—至今',
        tagType: 'key',
        macroLevel: 0,
        expand: true,
        scopeId: 'pol_periods',
        scopeName: '历史脉络',
        hasWidget: true,
        widgetType: 'detail',
        widgetBtnText: '分期要览',
        detail: periodsDetail,
        rawNode: {
          id: 'pol_periods',
          title: '中国近现代重大历史时期与时空脉络',
          kind: 'root',
          importance: 5,
          detail: periodsDetail
        }
      },
      children: []
    };

    var sortedPeriods = _rawPeriods.slice().sort(function (a, b) {
      return (a.order || 0) - (b.order || 0);
    });

    sortedPeriods.forEach(function (p, pIdx) {
      var dir = pIdx < 2 ? 'left' : 'right';
      var pDetail = {
        summary: p.description,
        sourceRefs: ['历史时期：' + p.dateRange]
      };

      var periodCard = {
        data: {
          text: p.title,
          uid: p.id,
          role: 'chapter',
          tag: p.dateRange,
          tagType: 'knowledge',
          macroLevel: 1,
          dir: dir,
          expand: true,
          hasWidget: true,
          widgetType: 'detail',
          widgetBtnText: '时期综述',
          detail: pDetail,
          rawNode: {
            id: p.id,
            title: p.title,
            kind: 'chapter',
            importance: 4,
            detail: pDetail
          }
        },
        children: []
      };

      // 找出所有归属此时期的史纲章节或重要考点
      var periodNodes = _rawNodes.filter(function (n) {
        return n.periodId === p.id && n.kind === 'chapter';
      });
      periodNodes.sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

      periodNodes.forEach(function (chNode) {
        var chCard = buildSubtree(chNode, {
          dir: dir,
          defaultExpandLevel: 2
        });
        periodCard.children.push(chCard);
      });

      rootCard.children.push(periodCard);
    });

    return rootCard;
  }

  // 初始化索引核心库
  function init(bundleData) {
    if (!bundleData) {
      if (typeof window !== 'undefined' && window.__POLITICS_STATIC_DATA__) {
        bundleData = window.__POLITICS_STATIC_DATA__;
      } else {
        throw new Error('[PoliticsDataAdapter] 缺少知识图谱原始数据包');
      }
    }

    _rawBooks = bundleData.books || [];
    _rawPeriods = bundleData.periods || [];
    _rawRelations = bundleData.relations || [];
    _rawNodes = bundleData.nodes || [];

    _nodeMap.clear();
    _childrenMap.clear();
    _scopeDataCache.clear();

    _rawNodes.forEach(function (node) {
      _nodeMap.set(node.id, node);
      var pid = node.parentId || null;
      if (!_childrenMap.has(pid)) {
        _childrenMap.set(pid, []);
      }
      _childrenMap.get(pid).push(node);
    });

    indexRelations(_rawRelations);
    _isLoaded = true;

    console.info('[PoliticsDataAdapter] 考研政治知识库索引构建完成: ' + _rawNodes.length + ' 节点, ' + _rawRelations.length + ' 组跨学科关联。');
    return true;
  }

  // 获取特定 scope 的导图数据
  function getScopeData(scopeId) {
    if (!_isLoaded) {
      init();
    }
    var key = scopeId || 'pol_macro';
    if (_scopeDataCache.has(key)) {
      return JSON.parse(JSON.stringify(_scopeDataCache.get(key)));
    }

    var tree = null;
    if (key === 'pol_macro') {
      tree = buildMacroTree();
    } else if (key === 'pol_periods') {
      tree = buildPeriodsTree();
    } else if (key.startsWith('pol_')) {
      var bId = key.replace('pol_', '');
      tree = buildSubjectTree(bId);
    } else {
      tree = buildSubjectTree(key);
    }

    if (!tree) {
      console.warn('[PoliticsDataAdapter] 无法找到作用域: ' + scopeId + '，回退至全景全量');
      tree = buildMacroTree();
    }

    _scopeDataCache.set(key, tree);
    return JSON.parse(JSON.stringify(tree));
  }

  // 按照 ID 获取原始节点与其拓扑关联详情
  function getNodeById(id) {
    return _nodeMap.get(id) || null;
  }

  function getRelationsForNode(id) {
    return _relationEdgesMap.get(id) || [];
  }

  function getAllScopeDefs() {
    return [
      { id: 'pol_macro', title: '全景全量', count: _rawNodes.length, desc: '692 考点全景宏观体系' },
      { id: 'pol_sg', title: '史纲', count: countPoints('pol.sg'), desc: '中国近现代史纲要' },
      { id: 'pol_my', title: '马原', count: countPoints('pol.my'), desc: '马克思主义基本原理' },
      { id: 'pol_mzt', title: '毛中特', count: countPoints('pol.mzt'), desc: '毛泽东思想和中国特色社会主义理论体系概论' },
      { id: 'pol_xg', title: '习概', count: countPoints('pol.xg'), desc: '习近平新时代中国特色社会主义思想概论' },
      { id: 'pol_sx', title: '思法', count: countPoints('pol.sx'), desc: '思想道德与法治' },
      { id: 'pol_xs', title: '当代', count: countPoints('pol.xs'), desc: '形势与政策与当代世界经济与政治' },
      { id: 'pol_periods', title: '历史脉络', count: _rawPeriods.length, desc: '五大历史时期时空纵览' }
    ];
  }

  return {
    init: init,
    isLoaded: function () { return _isLoaded; },
    getScopeData: getScopeData,
    getNodeById: getNodeById,
    getRelationsForNode: getRelationsForNode,
    getAllScopeDefs: getAllScopeDefs,
    countPoints: countPoints
  };
});
