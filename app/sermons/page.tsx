'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Share2, Youtube, Check, Calendar, Play, Radio } from 'lucide-react';
import { fetchSermons, YouTubeVideo, LiveStream } from '@/lib/youtube';

import { useAppStore } from '@/store/useAppStore';

// Local storage cache key
const CACHE_KEY = 'coj_sermons_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCachedSermons(): YouTubeVideo[] | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { data, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
        }
        return null;
    } catch {
        return null;
    }
}

function setCachedSermons(data: YouTubeVideo[]) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch { }
}

export default function SermonsPage() {
    const [sermons, setSermons] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [liveStream, setLiveStream] = useState<LiveStream | null>(null);
    const { preferences } = useAppStore();

    const loadSermons = useCallback(async (showLoader = true) => {
        // Show cached data instantly
        const cached = getCachedSermons();
        if (cached && cached.length > 0) {
            setSermons(cached);
            setLoading(false);
        } else if (showLoader) {
            setLoading(true);
        }

        // Fetch fresh data in background
        try {
            const response = await fetchSermons();
            if (response.videos.length > 0) {
                setSermons(response.videos);
                setCachedSermons(response.videos);
            }
            setLiveStream(response.liveStream);
        } catch (error) {
            console.error("Failed to load sermons:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSermons();
    }, [loadSermons]);

    const handleShare = async (video: YouTubeVideo) => {
        const url = `https://www.youtube.com/watch?v=${video.id}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: video.title,
                    url: url,
                });
            } catch (err) {
                // Ignore AbortError if user cancelled
            }
        } else {
            await navigator.clipboard.writeText(url);
            setCopiedId(video.id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white px-4 sm:px-6 py-6 pb-32 overflow-hidden relative">
            {/* Background Ambience - Disable if Data Saver is ON */}
            {!preferences.dataSaver && (
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-1/2 w-[60%] h-[60%] bg-red-900/10 rounded-full blur-[120px] animate-pulse-slow -translate-x-1/2"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                </div>
            )}

            <div className="max-w-7xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 p-2.5 sm:p-3 px-4 sm:px-5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 backdrop-blur-md mb-6 sm:mb-12 transition-all group text-xs sm:text-sm">
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white/70 group-hover:text-amber-500 transition-colors" />
                    <span className="font-bold tracking-widest uppercase">Back</span>
                </Link>

                {/* LIVE SERMON BANNER */}
                {liveStream && (
                    <div className="mb-8 md:mb-12 animate-fade-in-down">
                        <div className="relative rounded-[2rem] overflow-hidden border-2 border-red-500/50 bg-gradient-to-br from-red-950/40 via-black to-black shadow-[0_0_60px_-15px_rgba(239,68,68,0.4)]">
                            {/* Pulsing glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 animate-pulse pointer-events-none" />

                            {/* Live Badge */}
                            <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-4 py-2 bg-red-600/90 backdrop-blur-md border border-red-400/50 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_white] animate-pulse" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-white">LIVE NOW</span>
                            </div>

                            {/* Embedded Player */}
                            <div className="aspect-video w-full">
                                <iframe
                                    src={`https://www.youtube.com/embed/${liveStream.videoId}?autoplay=1&mute=1&rel=0`}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title={liveStream.title}
                                />
                            </div>

                            {/* Live Info Footer */}
                            <div className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                                        <Radio className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg md:text-xl font-black text-white">
                                            {liveStream.title}
                                        </h2>
                                        <p className="text-xs text-white/50">Call of Jesus Ministries • Streaming Live</p>
                                    </div>
                                </div>
                                <a
                                    href={`https://www.youtube.com/watch?v=${liveStream.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-red-600/30 flex-shrink-0"
                                >
                                    <Youtube className="w-4 h-4" />
                                    Watch on YouTube
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-center mb-8 md:mb-16 animate-fade-in-down">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-3 sm:mb-4">
                        <Youtube className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                        <span className="text-red-500 text-[9px] sm:text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">Channel: Call of Jesus Ministries</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-6xl font-black mb-2 sm:mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50 drop-shadow-2xl">
                        WATCH <span className="text-red-500">SERMONS</span>
                    </h1>
                    <p className="text-white/40 text-sm md:text-lg max-w-2xl mx-auto px-4">
                        Missed a service? Catch up on all the latest teachings and live worship sessions from our YouTube channel.
                    </p>
                </div>

                {loading && sermons.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white/5 rounded-[2rem] overflow-hidden animate-pulse">
                                <div className="aspect-video bg-white/10"></div>
                                <div className="p-5 space-y-3">
                                    <div className="h-3 w-20 bg-white/10 rounded"></div>
                                    <div className="h-5 w-full bg-white/10 rounded"></div>
                                    <div className="h-5 w-3/4 bg-white/10 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sermons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        {sermons.map((video, index) => (
                            <div key={video.id} className="w-full group relative h-full flex flex-col bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden hover:border-red-500/50 hover:shadow-[0_0_40px_-10px_rgba(220,38,38,0.3)] transition-all duration-500">
                                {/* Video Thumbnail — native img for instant load */}
                                <div className="relative aspect-video w-full overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-60"></div>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        loading={index < 3 ? 'eager' : 'lazy'}
                                        decoding="async"
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                                    />

                                    {/* Play Button - Centered & Premium */}
                                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-500 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                                        </div>
                                    </div>

                                    {/* Live Badge */}
                                    {video.isLive && (
                                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-red-600/90 backdrop-blur-md border border-red-400/50 rounded-full animate-pulse shadow-lg">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white">LIVE NOW</span>
                                        </div>
                                    )}

                                    {/* Direct Link */}
                                    <a
                                        href={`https://www.youtube.com/watch?v=${video.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 z-30"
                                    ></a>
                                </div>

                                {/* Content Section */}
                                <div className="p-4 md:p-6 relative flex-grow flex flex-col justify-between z-20">
                                    {/* Gradient Background for Text Area */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/80 pointer-events-none"></div>

                                    <div className="relative">
                                        {/* Date Badge */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 flex items-center gap-1.5 uppercase tracking-wider">
                                                <Calendar className="w-3 h-3 text-red-500" />
                                                {video.publishedAt}
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="text-lg md:text-xl font-black text-white leading-tight line-clamp-2 group-hover:text-red-500 transition-colors drop-shadow-lg text-left">
                                                {video.title}
                                            </h3>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleShare(video);
                                                }}
                                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-white/50 hover:text-white z-40 relative group/btn"
                                            >
                                                {copiedId === video.id ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Footer With Official Logo */}
                                    <div className="relative mt-6 pt-4 border-t border-white/5 flex items-center gap-3">
                                        <div className="h-14 w-auto drop-shadow-lg">
                                            <Image src="/images/logo-footer-final.png" alt="COJ" width={56} height={56} className="h-full w-auto object-contain" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-white tracking-widest uppercase group-hover:text-red-400 transition-colors">
                                                Call of Jesus
                                            </span>
                                            <span className="text-[10px] text-white/40 font-medium">
                                                Official Ministry Channel
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/10">
                        <Youtube className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white/60">No sermons found</h3>
                        <p className="text-white/40 mt-2">Check back later or visit our YouTube channel directly.</p>
                        <a
                            href="https://www.youtube.com/@CallofJesusMinistries"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-6 px-8 py-3 bg-red-600 rounded-full font-bold hover:bg-red-700 transition-colors"
                        >
                            Visit Channel
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
