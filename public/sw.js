// Service Worker for あおば給食摂食量管理アプリ
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `aoba-meal-app-${CACHE_VERSION}`;

// キャッシュするリソース
const STATIC_CACHE_URLS = [
  '/aoba-meal-app/',
  '/aoba-meal-app/index.html',
  '/aoba-meal-app/static/css/main.css',
  '/aoba-meal-app/static/js/main.js',
  '/aoba-meal-app/manifest.json',
  '/aoba-meal-app/icons/icon-192x192.png',
  '/aoba-meal-app/icons/icon-512x512.png'
];

// GitHub APIエンドポイント（Network First）
const API_URLS = [
  'https://api.github.com'
];

// インストール時：静的リソースをキャッシュ
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // 重要でないリソースのキャッシュ失敗を許容
        return Promise.allSettled(
          STATIC_CACHE_URLS.map(url => 
            cache.add(url).catch(err => console.warn(`[SW] Failed to cache: ${url}`, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// アクティベーション時：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', CACHE_VERSION);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// フェッチ時：戦略的なキャッシュ処理
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // GitHub API: Network First（常に最新データ優先）
  if (API_URLS.some(apiUrl => url.href.startsWith(apiUrl))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 成功したレスポンスをキャッシュ
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // ネットワーク失敗時にキャッシュからフォールバック
          return caches.match(request);
        })
    );
    return;
  }

  // 静的リソース: Cache First（高速表示優先）
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // キャッシュになければネットワークから取得
        return fetch(request)
          .then((response) => {
            // 有効なレスポンスのみキャッシュ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
            
            return response;
          });
      })
  );
});

// メッセージ受信：手動キャッシュクリア等
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
