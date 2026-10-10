const CACHE_NAME = 'coj-v6';
const OFFLINE_URL = '/offline';

// Essential pages and assets to pre-cache on install
const CACHE_URLS = [
    '/',
    '/songs',
    '/offline',
    '/tools/tuner',
    '/tools/pad',
    '/api/songs',
    '/images/logo-footer-final.png',
    '/manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CACHE_URLS).catch((err) => {
                console.warn('Pre-cache partial warning:', err);
            });
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
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Skip development Webpack HMR, Supabase auth/management, and Ads
    if (
        url.pathname.startsWith('/_next/webpack-hmr') ||
        url.hostname.includes('supabase.co') ||
        url.hostname.includes('google-analytics.com') ||
        url.hostname.includes('googlesyndication.com') ||
        url.hostname.includes('doubleclick.net')
    ) {
        return;
    }

    // Special handling for /api/songs: Stale-While-Revalidate
    if (url.pathname === '/api/songs') {
        event.respondWith(
            caches.open(CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request);
                const fetchPromise = fetch(event.request)
                    .then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    })
                    .catch(() => cachedResponse);

                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // For Navigation Requests (HTML pages) - Network-First, fallback to Cache, fallback to /offline
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((fetchResponse) => {
                    if (fetchResponse && fetchResponse.status === 200) {
                        const responseToCache = fetchResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return fetchResponse;
                })
                .catch(async () => {
                    const cachedResponse = await caches.match(event.request);
                    if (cachedResponse) return cachedResponse;
                    const offlinePage = await caches.match(OFFLINE_URL);
                    return offlinePage || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
                })
        );
        return;
    }

    // Static Assets (_next/static, images, fonts, css, js) - Cache-First, fallback to Network
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        if (url.origin === self.location.origin) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        }
                    }
                    return networkResponse;
                })
                .catch(() => {
                    return new Response('', { status: 408, headers: { 'Content-Type': 'text/plain' } });
                });
        })
    );
});

// Push notification event
self.addEventListener('push', function (event) {
    if (event.data) {
        try {
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
        } catch {
            // Silently handle format exceptions
        }
    }
});

// Notification click event
self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
