'use client';

import { useState, useEffect } from 'react';
import { Bell, Radio, X } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationPrompt() {
    const [status, setStatus] = useState<NotificationPermission | 'unsupported'>('default');
    const [showPrompt, setShowPrompt] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            setStatus('unsupported');
            return;
        }
        setStatus(Notification.permission);

        // Show prompt if permission is default and we haven't dismissed it this session
        const hasDismissed = sessionStorage.getItem('coj_notification_dismissed');
        if (Notification.permission === 'default' && !hasDismissed) {
            const timer = setTimeout(() => setShowPrompt(true), 6000); // 6 seconds after load
            return () => clearTimeout(timer);
        }
    }, []);

    const requestPermission = async () => {
        if (status === 'unsupported') {
            toast.error('Push notifications are not supported on this browser.');
            return;
        }

        setIsSubscribing(true);

        try {
            const permission = await Notification.requestPermission();
            setStatus(permission);
            sessionStorage.setItem('coj_notification_dismissed', 'true');

            if (permission === 'granted') {
                setShowPrompt(false);

                // 1. Ensure service worker is registered
                let registration = await navigator.serviceWorker.getRegistration();
                if (!registration) {
                    registration = await navigator.serviceWorker.register('/sw.js');
                }
                await navigator.serviceWorker.ready;

                // 2. Subscribe to Push Manager using VAPID key
                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!vapidPublicKey) {
                    console.error('VAPID public key missing');
                    return;
                }

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                });

                // 3. Save subscription to server
                await fetch('/api/notifications/save-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subscription)
                });

                toast.success('Live Notifications Activated! 🔔', {
                    description: "You'll receive alerts when we go Live on YouTube, Facebook, or post updates.",
                    duration: 5000,
                });

                // Trigger sample notification
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Call of Jesus Ministries 🔔', {
                        body: 'Notifications enabled! You will be alerted the second we go Live.',
                        icon: '/images/logo-footer-final.png'
                    });
                }
            } else {
                setShowPrompt(false);
                toast.info('Notifications not enabled', {
                    description: 'You can enable notifications later in your browser settings.'
                });
            }
        } catch (err) {
            console.error('Permission request failed', err);
            toast.error('Could not activate notifications.');
        } finally {
            setIsSubscribing(false);
        }
    };

    function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-6 right-4 sm:right-6 left-4 sm:left-auto sm:max-w-md z-[100] animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="bg-[#0E0C15]/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.12)] relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-orange-500"></div>

                <button
                    onClick={() => {
                        setShowPrompt(false);
                        sessionStorage.setItem('coj_notification_dismissed', 'true');
                    }}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-1"
                    title="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4 pr-4">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400">
                        <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                                Never Miss a Live Stream!
                            </h3>
                        </div>
                        <p className="text-white/60 text-xs leading-relaxed">
                            Get instant alerts on your device when we go Live on <strong>YouTube</strong>, <strong>Facebook</strong>, or post on <strong>Instagram</strong>.
                        </p>
                        <div className="flex items-center gap-2.5 pt-2">
                            <button
                                onClick={requestPermission}
                                disabled={isSubscribing}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isSubscribing ? 'Enabling...' : 'Enable Alerts'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowPrompt(false);
                                    sessionStorage.setItem('coj_notification_dismissed', 'true');
                                }}
                                className="px-3 py-2 text-white/40 hover:text-white text-xs font-semibold transition-colors"
                            >
                                Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
