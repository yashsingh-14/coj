'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // 1. Background sync all songs into localStorage for instant offline access (runs only when idle)
        const syncOfflineLibrary = async () => {
            try {
                const res = await fetch('/api/songs');
                if (res.ok) {
                    const data = await res.json();
                    if (data?.songs && Array.isArray(data.songs)) {
                        localStorage.setItem('coj_offline_songs_cache', JSON.stringify(data.songs));
                        localStorage.setItem('coj_offline_synced_at', Date.now().toString());
                    }
                }
            } catch {
                // Silently ignore when offline or disconnected
            }
        };

        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => syncOfflineLibrary(), { timeout: 4000 });
        } else {
            setTimeout(syncOfflineLibrary, 3000);
        }

        // 2. In development mode, unregister any service worker to prevent stale asset caches
        if (process.env.NODE_ENV !== 'production') {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const registration of registrations) {
                        registration.unregister();
                    }
                });
            }
            return;
        }

        // 3. In production, register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                        console.log('COJ Offline Service Worker Active: ', registration.scope);
                    },
                    (err) => {
                        console.log('Service Worker registration skipped: ', err);
                    }
                );
            });
        }
    }, []);

    return null;
}
