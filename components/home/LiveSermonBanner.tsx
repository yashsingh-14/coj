'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Radio, Youtube, ChevronRight } from 'lucide-react';

interface LiveConfig {
    isLiveOverride: boolean;
    liveVideoId?: string;
    liveTitle?: string;
    channelHandle?: string;
}

export default function LiveSermonBanner() {
    const [liveConfig, setLiveConfig] = useState<LiveConfig | null>(null);

    useEffect(() => {
        // Fetch live config from the sermons API
        const checkLive = async () => {
            try {
                const res = await fetch('/api/sermons');
                const json = await res.json();
                if (json.isLive && json.liveStream) {
                    setLiveConfig({
                        isLiveOverride: true,
                        liveVideoId: json.liveStream.videoId,
                        liveTitle: json.liveStream.title
                    });
                }
            } catch (err) {
                // Silently fail — banner just won't show
            }
        };
        checkLive();
    }, []);

    if (!liveConfig || !liveConfig.isLiveOverride) return null;

    return (
        <div className="mx-4 md:mx-6 mt-4 mb-2 animate-fade-in-down">
            <Link
                href="/sermons"
                className="group block relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r from-red-950/60 via-[#0A0A0A] to-red-950/60 border border-red-500/30 hover:border-red-500/50 transition-all shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]"
            >
                {/* Animated glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 animate-pulse pointer-events-none" />

                <div className="relative z-10 px-4 py-3 md:px-6 md:py-4 flex items-center gap-3 md:gap-4">
                    {/* Pulsing Live Dot */}
                    <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                            <Radio className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-red-400">
                                🔴 LIVE NOW
                            </span>
                        </div>
                        <p className="text-sm md:text-base font-bold text-white truncate">
                            {liveConfig.liveTitle || 'Live Sermon is streaming now!'}
                        </p>
                        <p className="text-[10px] md:text-xs text-white/40 mt-0.5">
                            Tap to watch the live stream →
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/40 transition-colors">
                        <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </Link>
        </div>
    );
}
