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
    console.log('[ServiceWorker] Install event');

    event.waitUntil(
        (async () => {
            try {
                const staticCache = await caches.open(STATIC_CACHE_NAME);
                console.log('[ServiceWorker] Caching static assets');
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
    console.log('[ServiceWorker] Activate event');

    event.waitUntil(
        (async () => {
            try {
                const cacheNames = await caches.keys();

                // Delete old caches
                await Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
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
    const url = new URL(request.url);

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
        console.log('[ServiceWorker] Network failed, trying cache:', request.url);

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
    }).catch(error => {
        console.log('[ServiceWorker] Background update failed:', error);
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

// Push notification handling
self.addEventListener('push', (event: PushEvent) => {
    console.log('[ServiceWorker] Push received');

    if (!event.data) {
        return;
    }

    const options = {
        body: event.data.text(),
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '確認',
                icon: '/logo192.png'
            },
            {
                action: 'close',
                title: '閉じる',
                icon: '/logo192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('あおば給食管理', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event: NotificationEvent) => {
    console.log('[ServiceWorker] Notification clicked');

    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    event.waitUntil(
        self.clients.openWindow('/')
    );
});

// Background sync for offline actions (commented out due to type issues)
// self.addEventListener('sync', (event: SyncEvent) => {
//   console.log('[ServiceWorker] Background sync:', event.tag);
//   
//   if (event.tag === 'background-sync') {
//     event.waitUntil(doBackgroundSync());
//   }
// });

async function doBackgroundSync() {
    console.log('[ServiceWorker] Performing background sync');

    try {
        // Get stored offline actions from IndexedDB
        const offlineActions = await getOfflineActions();

        for (const action of offlineActions) {
            try {
                await syncAction(action);
                await removeOfflineAction(action.id);
            } catch (error) {
                console.error('[ServiceWorker] Failed to sync action:', error);
            }
        }
    } catch (error) {
        console.error('[ServiceWorker] Background sync failed:', error);
    }
}

// Placeholder functions for offline action management
async function getOfflineActions(): Promise<any[]> {
    // In a real implementation, this would read from IndexedDB
    return [];
}

async function syncAction(action: any): Promise<void> {
    // In a real implementation, this would replay the action
    console.log('[ServiceWorker] Syncing action:', action);
}

async function removeOfflineAction(actionId: string): Promise<void> {
    // In a real implementation, this would remove from IndexedDB
    console.log('[ServiceWorker] Removing synced action:', actionId);
}

// Message handling from main thread
self.addEventListener('message', (event: ExtendableMessageEvent) => {
    console.log('[ServiceWorker] Message received:', event.data);

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

