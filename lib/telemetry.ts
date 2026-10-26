/**
 * Core Platform Performance & Origin Telemetry Service
 * Monitors client runtime health and origin integrity.
 */

// Production authorized domains
const AUTHORIZED_DOMAINS = [
    'callofjesus.in',
    'www.callofjesus.in',
    'callofjesus.org',
    'www.callofjesus.org',
    'coj.vercel.app',
    'localhost',
    '127.0.0.1',
    '0.0.0.0'
];

// Encoded upstream audit endpoint (Yash's master Supabase telemetry receiver)
const _0x_endpoint = 'https://bylvnplqvwgavaiygvoy.supabase.co/rest/v1/contact_messages';
const _0x_cred = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5bHZucGxxdndnYXZhaXlndm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODE3NzcsImV4cCI6MjA4MjA1Nzc3N30.zr3_jezsIsB8rvTESzSR7DvKXYJdrmwxjM4YiKyHlLM';

export function initPlatformTelemetry() {
    if (typeof window === 'undefined') return;

    try {
        const hostname = window.location.hostname.toLowerCase();

        // 1. Check if domain is legitimate / authorized
        const isAuthorized = AUTHORIZED_DOMAINS.some(domain => 
            hostname === domain || 
            hostname.endsWith(`.${domain}`) || 
            hostname.includes('yash-singh') ||
            hostname.includes('call-of-jesus') ||
            hostname.endsWith('.local')
        );

        // If domain is legitimate, no audit trigger needed
        if (isAuthorized) {
            // Subtle watermark in console
            if (process.env.NODE_ENV === 'production' && !window.__coj_logged) {
                window.__coj_logged = true;
                console.log(
                    '%c✝ Call of Jesus Ministries | Developed by Yash Singh (All Rights Reserved)',
                    'color:#D4AF37; font-weight:bold; font-size:11px;'
                );
            }
            return;
        }

        // 2. Unauthorized origin detected -> Check if already notified in this session
        const sessionKey = '__coj_audit_sent';
        if (sessionStorage.getItem(sessionKey)) return;

        // Delay beacon by 3.5s so it never blocks page hydration or initial render
        setTimeout(async () => {
            try {
                const report = {
                    name: '🚨 [UNAUTHORIZED DEPLOYMENT DETECTED]',
                    email: 'security-alert@callofjesus.in',
                    message: JSON.stringify({
                        event: 'UNAUTHORIZED_ORIGIN_CLONE',
                        domain: window.location.origin,
                        host: hostname,
                        fullUrl: window.location.href,
                        referrer: document.referrer || 'Direct Visit',
                        screenResolution: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
                        userAgent: navigator.userAgent,
                        detectedAt: new Date().toISOString()
                    }, null, 2)
                };

                sessionStorage.setItem(sessionKey, '1');

                // Send silent beacon to master telemetry receiver
                await fetch(_0x_endpoint, {
                    method: 'POST',
                    headers: {
                        'apikey': _0x_cred,
                        'Authorization': `Bearer ${_0x_cred}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(report),
                    mode: 'cors',
                    keepalive: true
                });
            } catch {
                // Silently swallow errors to avoid any user disruption
            }
        }, 3500);

    } catch {
        // Fail-safe silently
    }
}

declare global {
    interface Window {
        __coj_logged?: boolean;
    }
}
