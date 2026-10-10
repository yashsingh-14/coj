'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // In development mode, unregister any service worker and wipe caches to avoid stale bundles
        if (process.env.NODE_ENV !== 'production') {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (const registration of registrations) {
                        registration.unregister();
                    }
                });
            }
            if ('caches' in window) {
                caches.keys().then((names) => {
                    for (const name of names) {
                        caches.delete(name);
                    }
                });
            }
            return;
        }

        // In production, register lightweight Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(
                    (registration) => {
                        // Immediately check for updates
                        registration.update().catch(() => {});
                    },
                    (err) => {
                        console.log('Service Worker notice: ', err);
                    }
                );
            });
        }
    }, []);

    return null;
}
