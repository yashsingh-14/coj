const CACHE_NAME = 'coj-v8-turbo';
const OFFLINE_URL = '/offline';

// Only lightweight essential static fallbacks (Zero heavy pages on startup)
const CACHE_URLS = [
    '/offline',
    '/images/logo-footer-final.png',
    '/manifest.json'
];

// Install event - pre-cache only minimal offline essentials
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CACHE_URLS).catch((err) => {
                console.warn('Minimal pre-cache notice:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate event - purge all old/stuck caches instantly
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log('Purging stale cache:', name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - Ultra lightweight, zero overhead
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // CRITICAL: NEVER intercept Next.js chunks, APIs, video streams, or external services
    if (
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.pathname.startsWith('/_next/') ||
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/videos/') ||
        url.pathname.endsWith('.mp4') ||
        event.request.headers.get('range') ||
        url.hostname.includes('supabase.co') ||
        url.hostname.includes('google') ||
        url.hostname.includes('youtube') ||
        url.hostname.includes('doubleclick')
    ) {
        return; // Go straight to network natively, zero delay!
    }

    // Navigation requests (HTML pages) - Network-first with fast offline fallback
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(async () => {
                const cached = await caches.match(event.request);
                if (cached) return cached;
                const offline = await caches.match(OFFLINE_URL);
                return offline || new Response('Offline', { status: 503 });
            })
        );
        return;
    }

    // Static local images/icons only
    if (url.origin === self.location.origin && (url.pathname.startsWith('/images/') || url.pathname.startsWith('/icons/'))) {
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
