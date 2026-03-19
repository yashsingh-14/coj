'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Check if user dismissed the banner before (respect for 3 days)
        const dismissed = localStorage.getItem('coj-install-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed, 10);
            const threeDays = 3 * 24 * 60 * 60 * 1000;
            if (Date.now() - dismissedTime < threeDays) return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show banner after a short delay so user sees the page first
            setTimeout(() => setShowBanner(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Also show for iOS Safari (which doesn't support beforeinstallprompt)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        if (isIOS && isSafari) {
            setTimeout(() => setShowBanner(true), 3000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            if (choice.outcome === 'accepted') {
                setIsInstalled(true);
            }
            setDeferredPrompt(null);
        }
        setShowBanner(false);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('coj-install-dismissed', Date.now().toString());
    };

    if (isInstalled || !showBanner) return null;

    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-3 sm:p-4 animate-in slide-in-from-bottom-8 duration-500">
            <div className="max-w-md mx-auto bg-gradient-to-r from-[#1A1A24] to-[#12121A] backdrop-blur-2xl border border-amber-500/20 rounded-2xl p-4 shadow-[0_-10px_40px_rgba(245,158,11,0.15)]">
                
                {/* Close Button */}
                <button 
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4">
                    {/* App Icon */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center shadow-lg">
                        <img 
                            src="/images/logo-footer-final.png" 
                            alt="COJ" 
                            className="w-10 h-10 rounded-xl object-contain"
                        />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 pr-6">
                        <h3 className="font-bold text-white text-sm tracking-wide">
                            COJ Worship App
                        </h3>
                        <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                            {isIOS 
                                ? 'Tap Share ↗ then "Add to Home Screen"' 
                                : 'Install for the best experience — fast, offline-ready!'
                            }
                        </p>
                    </div>
                </div>

                {/* Install Button */}
                {!isIOS && (
                    <button
                        onClick={handleInstall}
                        className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
                    >
                        <Download className="w-4 h-4" />
                        Install App
                    </button>
                )}

                {isIOS && (
                    <div className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-semibold">
                        <Smartphone className="w-4 h-4" />
                        Tap <span className="text-amber-400 font-bold mx-1">Share ↗</span> → Add to Home Screen
                    </div>
                )}
            </div>
        </div>
    );
}
