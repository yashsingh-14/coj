const CACHE_NAME = 'coj-v3'; // Bumped for TWA fix
const OFFLINE_URL = '/offline';

// Files to cache for offline use
const CACHE_URLS = [
    '/',
    '/songs',
    '/artists',
    '/events',
    '/offline',
    '/images/logo-footer-final.png',
    '/manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(CACHE_URLS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - network-first for pages, cache-first for assets
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // For navigation requests (HTML pages) - NETWORK FIRST
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((fetchResponse) => {
                    // Cache the latest version
                    const responseToCache = fetchResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                    return fetchResponse;
                })
                .catch(() => {
                    // Network failed - try cache, then offline page
                    return caches.match(event.request).then((cachedResponse) => {
                        return cachedResponse || caches.match(OFFLINE_URL);
                    });
                })
        );
        return;
    }

    // For static assets (JS, CSS, images) - CACHE FIRST
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchResponse) => {
                if (fetchResponse && fetchResponse.status === 200) {
                    const responseToCache = fetchResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return fetchResponse;
            }).catch(() => {
                return caches.match(OFFLINE_URL);
            });
        })
    );
});

// Push notification event
self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/images/logo-footer-final.png',
            badge: '/images/logo-footer-final.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2',
                url: data.url || '/'
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click event
self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
