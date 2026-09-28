/**
 * 考研政治知识图谱 - 双驱动数据加载器 (Dual-Driver Data Loader)
 * 驱动 1: Fetch 异步加载器 (用于 HTTP/HTTPS 本地服务及云端部署)
 * 驱动 2: Static JS Bundle 离线加载器 (用于本地 file:// 协议免服务双击打开)
 */
(function () {
  const BASE_PATH = 'data/politics/';

  async function loadViaFetch() {
    const manifestResp = await fetch(BASE_PATH + 'manifest.json');
    if (!manifestResp.ok) throw new Error(`Manifest load failed: ${manifestResp.status}`);
    const manifest = await manifestResp.json();

    const [books, periods, relations, ...nodeFiles] = await Promise.all([
      fetch(BASE_PATH + manifest.books).then(r => r.json()),
      fetch(BASE_PATH + manifest.periods).then(r => r.json()),
      fetch(BASE_PATH + manifest.relations).then(r => r.json()),
      ...manifest.nodes.map(path => fetch(BASE_PATH + path).then(r => r.json()))
    ]);

    return {
      driver: 'fetch',
      manifest,
      books,
      periods,
      relations,
      nodes: nodeFiles.flat()
    };
  }

  function loadViaBundle() {
    return new Promise((resolve, reject) => {
      if (window.__POLITICS_STATIC_DATA__) {
        resolve({
          driver: 'bundle',
          ...window.__POLITICS_STATIC_DATA__
        });
        return;
      }

      const script = document.createElement('script');
      script.src = BASE_PATH + 'bundle.js';
      script.onload = () => {
        if (window.__POLITICS_STATIC_DATA__) {
          resolve({
            driver: 'bundle',
            ...window.__POLITICS_STATIC_DATA__
          });
        } else {
          reject(new Error('Static bundle loaded but __POLITICS_STATIC_DATA__ not found'));
        }
      };
      script.onerror = () => {
        reject(new Error('Failed to load static bundle script'));
      };
      document.head.appendChild(script);
    });
  }

  async function load() {
    // If opened directly via file://, browser security blocks fetch() on local files by default.
    // Try fetch first when HTTP, or fallback to bundle seamlessly.
    if (window.location.protocol === 'file:') {
      console.info('[PoliticsLoader] file:// protocol detected, using static bundle driver.');
      return await loadViaBundle();
    }

    try {
      const data = await loadViaFetch();
      console.info('[PoliticsLoader] Loaded data successfully via fetch driver.');
      return data;
    } catch (err) {
      console.warn('[PoliticsLoader] Fetch driver failed, falling back to static bundle driver:', err);
      const data = await loadViaBundle();
      console.info('[PoliticsLoader] Loaded data successfully via fallback bundle driver.');
      return data;
    }
  }

  window.PoliticsDataLoader = {
    load
  };
})();
