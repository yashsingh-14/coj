const CACHE_NAME = 'coj-v10-offline-rocksolid';
const OFFLINE_URL = '/offline';

// Essential pages & assets to pre-cache on install
const PRECACHE_URLS = [
    '/offline',
    '/tools/tuner',
    '/tools/pad',
    '/images/logo-footer-final.png',
    '/images/icon-512.png',
    '/manifest.json'
];

// Install: pre-cache all essentials gracefully without all-or-nothing failure
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                PRECACHE_URLS.map((url) => {
                    return fetch(url)
                        .then((res) => {
                            if (res && res.status === 200) {
                                return cache.put(url, res);
                            }
                        })
                        .catch((err) => {
                            console.warn('Pre-cache skip:', url, err);
                        });
                })
            );
        })
    );
    self.skipWaiting();
});

// Activate: purge all old caches immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('Purging stale cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch handler
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Completely bypass dev server, external services, heavy media, and APIs
    if (
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/videos/') ||
        url.pathname.endsWith('.mp4') ||
        event.request.headers.get('range') ||
        url.hostname.includes('supabase.co') ||
        url.hostname.includes('google') ||
        url.hostname.includes('youtube') ||
        url.hostname.includes('doubleclick')
    ) {
        return; // Go straight to network natively
    }

    // 1. Next.js Static Chunks & Assets (JS, CSS, fonts)
    // Cache-first / Stale-while-revalidate so offline page has working JS and styling!
    if (url.pathname.startsWith('/_next/static/')) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const clone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // 2. Images, icons, manifest
    if (
        url.origin === self.location.origin &&
        (url.pathname.startsWith('/images/') || url.pathname.startsWith('/icons/') || url.pathname === '/manifest.json')
    ) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                return (
                    cached ||
                    fetch(event.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.status === 200) {
                            const clone = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                        }
                        return networkResponse;
                    }).catch(() => new Response('', { status: 404 }))
                );
            })
        );
        return;
    }

    // 3. Navigation requests (HTML pages)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    // Cache successful visits to /offline, /tools/tuner, /tools/pad
                    if (
                        networkResponse &&
                        networkResponse.status === 200 &&
                        (url.pathname === '/offline' || url.pathname.startsWith('/tools/'))
                    ) {
                        const clone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return networkResponse;
                })
                .catch(async () => {
                    // Network failed (Device is offline)
                    // Check if the requested route itself is cached
                    const cachedPage = await caches.match(event.request);
                    if (cachedPage) return cachedPage;

                    // Fallback to offline page
                    const offlinePage = await caches.match(OFFLINE_URL);
                    if (offlinePage) return offlinePage;

                    return new Response('Offline - Call of Jesus', {
                        status: 503,
                        headers: { 'Content-Type': 'text/plain' }
                    });
                })
        );
        return;
    }
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
