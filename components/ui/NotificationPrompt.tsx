'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';

export default function NotificationPrompt() {
    const [status, setStatus] = useState<NotificationPermission | 'unsupported'>('default');
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        if (!('Notification' in window)) {
            setStatus('unsupported');
            return;
        }
        setStatus(Notification.permission);

        // Show prompt if permission is default and we haven't shown it this session
        const hasPrompted = sessionStorage.getItem('notificationPrompted');
        if (Notification.permission === 'default' && !hasPrompted) {
            const timer = setTimeout(() => setShowPrompt(true), 5000); // Show after 5 seconds
            return () => clearTimeout(timer);
        }
    }, []);

    const requestPermission = async () => {
        if (status === 'unsupported') return;

        try {
            const permission = await Notification.requestPermission();
            setStatus(permission);
            sessionStorage.setItem('notificationPrompted', 'true');
            setShowPrompt(false);

            if (permission === 'granted') {
                new Notification('Success!', {
                    body: 'You will now receive daily Bible verses and devotionals.',
                    icon: '/favicon.ico'
                });
            }
        } catch (err) {
            console.error('Permission request failed', err);
        }
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-24 right-6 left-6 md:left-auto md:w-96 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="bg-amber-500/10 backdrop-blur-2xl border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

                <button
                    onClick={() => setShowPrompt(false)}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 animate-bounce-slow">
                        <Bell className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">Daily Encouragement</h3>
                        <p className="text-white/60 text-sm leading-relaxed mb-4">
                            Stay inspired with a new Bible verse and devotional prayer every morning.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={requestPermission}
                                className="px-5 py-2.5 bg-amber-500 text-[#02000F] font-bold rounded-xl text-sm hover:scale-105 active:scale-95 transition-all"
                            >
                                Enable Notifications
                            </button>
                            <button
                                onClick={() => setShowPrompt(false)}
                                className="px-5 py-2.5 bg-white/5 text-white/60 font-bold rounded-xl text-sm hover:bg-white/10 transition-all"
                            >
                                Not now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
