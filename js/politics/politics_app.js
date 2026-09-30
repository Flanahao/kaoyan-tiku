/**
 * 考研政治认知思维导图 · 应用主入口 (PoliticsApp)
 * 职责：
 * 1. 监听 DOMContentLoaded，调度 PoliticsDataAdapter 与 PoliticsMindMapController 极速初始化；
 * 2. 绑定顶部悬浮导航坞 (PoliticsTopDock) 的全部交互按钮与学科切换标签；
 * 3. 绑定考点解析浮层 (PoliticsDetailInspector) 的关闭与联动事件；
 * 4. 解析 URL Query 参数 (如 ?scope=pol_my&focus=pol.my.c01.s01.p001)，支持深度链接直达指定学科与考点。
 */

(function () {
  'use strict';

  function initApp() {
    console.info('[PoliticsApp] 正在启动考研政治思维导图工作台...');

    if (!window.PoliticsDataAdapter || !window.PoliticsMindMapController) {
      console.error('[PoliticsApp] 依赖缺失: PoliticsDataAdapter 或 PoliticsMindMapController 未定义');
      return;
    }

    try {
      window.PoliticsDataAdapter.init();
    } catch (e) {
      console.error('[PoliticsApp] 数据适配器初始化失败:', e);
      return;
    }

    // 解析 URL 参数以支持深度链接
    var urlParams = new URLSearchParams(window.location.search);
    var initialScope = urlParams.get('scope') || 'pol_macro';
    var focusUid = urlParams.get('focus') || null;

    // 启动导图核心
    window.PoliticsMindMapController.loadScope(initialScope);

    // 绑定顶部导航坞事件
    setupDockEvents();

    // 若有指定聚焦节点，延迟平移并高亮
    if (focusUid) {
      setTimeout(function () {
        window.PoliticsMindMapController.centerNode(focusUid);
      }, 350);
    }

    console.info('[PoliticsApp] 考研政治认知思维导图工作台就绪！');
  }

  function setupDockEvents() {
    // 1. 学科切换选项卡
    var tabContainer = document.getElementById('politicsSubjectTabs');
    if (tabContainer) {
      tabContainer.addEventListener('click', function (e) {
        var btn = e.target.closest('.subj-tab-btn');
        if (!btn) return;
        var scope = btn.getAttribute('data-scope');
        if (scope && window.PoliticsMindMapController) {
          window.PoliticsMindMapController.loadScope(scope);
        }
      });
    }

    // 2. 导图 / 大纲视图切换按钮 (M)
    var btnView = document.getElementById('btnToggleView');
    function updateViewToggleButton(view) {
      var dvc = (window.PoliticsMindMapController && window.PoliticsMindMapController.getDualViewController()) || window._dualViewController;
      if (btnView && dvc) {
        var cur = view || dvc.currentView;
        var isOutline = (cur === 'outline');
        btnView.classList.toggle('is-active', isOutline);
        var span = btnView.querySelector('span');
        if (span) {
          span.textContent = isOutline ? '导图' : '大纲';
        }
      }
    }

    var dvc = (window.PoliticsMindMapController && window.PoliticsMindMapController.getDualViewController()) || window._dualViewController;
    if (dvc && typeof dvc.on === 'function') {
      dvc.on('view_change', updateViewToggleButton);
    }
    updateViewToggleButton();

    if (btnView) {
      btnView.addEventListener('click', function () {
        var d = (window.PoliticsMindMapController && window.PoliticsMindMapController.getDualViewController()) || window._dualViewController;
        if (d && typeof d.toggle === 'function') {
          d.toggle();
          updateViewToggleButton();
        }
      });
    }

    // 3. 关联线显隐切换按钮 (L)
    var btnLines = document.getElementById('btnToggleLines');
    if (btnLines) {
      btnLines.addEventListener('click', function () {
        if (window.PoliticsMindMapController) {
          window.PoliticsMindMapController.toggleAssociativeLines();
        }
      });
    }

    // 4. 视口自适应居中按钮 (F)
    var btnFit = document.getElementById('btnFitView');
    if (btnFit) {
      btnFit.addEventListener('click', function () {
        if (window.PoliticsMindMapController) {
          window.PoliticsMindMapController.fitCanvasToViewport();
        }
      });
    }

    // 5. 快捷键指南抽屉按钮 (H)
    var btnShortcut = document.getElementById('btnShortcutDrawer');
    if (btnShortcut) {
      btnShortcut.addEventListener('click', function () {
        var drawer = (window.PoliticsMindMapController && window.PoliticsMindMapController.getShortcutDrawer()) || window._mindMapShortcutDrawer;
        if (drawer && typeof drawer.toggle === 'function') {
          drawer.toggle();
        }
      });
    }

    // 6. 详情浮层关闭按钮
    var btnInspClose = document.getElementById('btnInspClose');
    if (btnInspClose) {
      btnInspClose.addEventListener('click', function () {
        if (window.PoliticsMindMapController) {
          window.PoliticsMindMapController.closeDetailInspector();
        }
      });
    }

    // 7. F 键自适应；L/M 由通用导图工具集各自处理一次。
    document.addEventListener('keydown', function (e) {
      var activeEl = document.activeElement;
      var isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
      if (isInput) return;

      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (window.PoliticsMindMapController) {
          window.PoliticsMindMapController.fitCanvasToViewport();
          e.preventDefault();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        setTimeout(function () {
          updateViewToggleButton();
        }, 50);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
