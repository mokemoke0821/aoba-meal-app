// Service Worker implementation for Aoba Meal Management App
// PWA features: offline support, caching, push notifications

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'aoba-meal-app-v1';
const STATIC_CACHE_NAME = 'aoba-static-v1';
const DYNAMIC_CACHE_NAME = 'aoba-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css',
    '/manifest.json',
    '/logo192.png',
    '/logo512.png',
    '/favicon.ico'
];

// API endpoints to cache for offline use
const API_CACHE_PATTERNS = [
    '/api/users',
    '/api/meals',
    '/api/statistics'
];

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(
        (async () => {
            try {
                const staticCache = await caches.open(STATIC_CACHE_NAME);
                await staticCache.addAll(STATIC_ASSETS);

                // Skip waiting to activate immediately
                self.skipWaiting();
            } catch (error) {
                console.error('[ServiceWorker] Install failed:', error);
            }
        })()
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
    event.waitUntil(
        (async () => {
            try {
                const cacheNames = await caches.keys();

                // Delete old caches
                await Promise.all(
                    cacheNames
                        .filter(cacheName => cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME)
                        .map(cacheName => caches.delete(cacheName))
                );

                // Claim all clients
                self.clients.claim();
            } catch (error) {
                console.error('[ServiceWorker] Activate failed:', error);
            }
        })()
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event: FetchEvent) => {
    const { request } = event;

    // Skip non-HTTP requests
    if (!request.url.startsWith('http')) {
        return;
    }

    event.respondWith(
        (async () => {
            try {
                // Strategy 1: Cache First for static assets
                if (isStaticAsset(request)) {
                    return await cacheFirst(request);
                }

                // Strategy 2: Network First for API requests
                if (isAPIRequest(request)) {
                    return await networkFirst(request);
                }

                // Strategy 3: Stale While Revalidate for everything else
                return await staleWhileRevalidate(request);

            } catch (error) {
                console.error('[ServiceWorker] Fetch failed:', error);

                // Return offline page for navigation requests
                if (request.mode === 'navigate') {
                    return await getOfflinePage();
                }

                throw error;
            }
        })()
    );
});

// Cache strategies
async function cacheFirst(request: Request): Promise<Response> {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
    }

    return networkResponse;
}

async function networkFirst(request: Request): Promise<Response> {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        throw error;
    }
}

async function staleWhileRevalidate(request: Request): Promise<Response> {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    // Always try to update cache in background
    const networkResponsePromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => {
        return new Response('Network failed', { status: 500 });
    });

    // Return cached version immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }

    // Otherwise wait for network
    return await networkResponsePromise;
}

// Helper functions
function isStaticAsset(request: Request): boolean {
    const url = new URL(request.url);
    return (
        url.pathname.includes('/static/') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.ico')
    );
}

function isAPIRequest(request: Request): boolean {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') ||
        API_CACHE_PATTERNS.some(pattern => url.pathname.includes(pattern));
}

async function getOfflinePage(): Promise<Response> {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const offlinePage = await cache.match('/');

    if (offlinePage) {
        return offlinePage;
    }

    // Fallback offline page
    return new Response(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>オフライン - あおば給食管理</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          margin: 0;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        h1 { font-size: 2.5rem; margin-bottom: 1rem; }
        p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
        .retry-btn {
          background: rgba(255,255,255,0.2);
          border: 2px solid rgba(255,255,255,0.5);
          color: white;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .retry-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }
        .offline-icon {
          font-size: 4rem;
          margin-bottom: 2rem;
          opacity: 0.7;
        }
      </style>
    </head>
    <body>
      <div class="offline-icon">📶</div>
      <h1>オフラインです</h1>
      <p>インターネット接続を確認してください</p>
      <button class="retry-btn" onclick="window.location.reload()">
        再試行
      </button>
      
      <script>
        // Check for connection and auto-reload
        window.addEventListener('online', () => {
          window.location.reload();
        });
      </script>
    </body>
    </html>
  `, {
        headers: { 'Content-Type': 'text/html' }
    });
}

// Push notification event
self.addEventListener('push', (event: PushEvent) => {

    const pushData = event.data?.json() ?? { title: '新しい通知', body: 'メッセージが届いています。' };
    const { title, body, icon, badge } = pushData;

    const options = {
        body: body,
        icon: icon || '/logo192.png',
        badge: badge || '/badge72.png',
        vibrate: [200, 100, 200],
        tag: 'aoba-notification'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    event.waitUntil(
        self.clients.openWindow('/')
    );
});

// Background Sync event (not fully implemented in this example)
self.addEventListener('sync', (event: any) => {
    if (event.tag === 'sync-new-data') {
        event.waitUntil(
            // Example: syncOfflineActions()
            new Promise<void>(resolve => {
                resolve();
            })
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event: ExtendableMessageEvent) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            type: 'VERSION',
            version: CACHE_NAME
        });
    }
});

// Export for TypeScript
export { };

