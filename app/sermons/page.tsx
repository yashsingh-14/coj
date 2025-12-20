'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Calendar, Clock, Share2, Sparkles, Youtube, Check } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';

export default function SermonsPage() {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Placeholder IDs - User should replace these with actual Church Video IDs
    const sermons = [
        {
            id: "t7LJ50Na4rE",
            title: "Sunday Service | Live Worship & Word",
            date: "Dec 19, 2025",
            speaker: "Ps. Samson Wilson",
            duration: "Live"
        },
        {
            id: "t7LJ50Na4rE",
            title: "Sunday Service | Live Worship & Word",
            date: "Dec 19, 2025",
            speaker: "Ps. Samson Wilson",
            duration: "Live"
        },
        {
            id: "ND4Ge64S7WY", // Placeholder 2
            title: " Holy Communion | Sunday Service | Live Worship & Word",
            date: "Dec 07, 2025",
            speaker: "Ps. Samson Wilson",
            duration: "Live"
        },
        {
            id: "ND4Ge64S7WY", // Placeholder 2
            title: " Holy Communion | Sunday Service | Live Worship & Word",
            date: "Dec 07, 2025",
            speaker: "Ps. Samson Wilson",
            duration: "Live"
        },
        {
            id: "rOe5d3zt7Qo", // Placeholder 3 (Broken/Generic) -> Let's use real IDs if possible or generic ones
            // Using a generic worship video ID for demo
            title: "Friday Service | Call of Jesus Ministries",
            date: "Dec 12, 2025",
            speaker: "Ps. Samson Wilson",
            duration: "Live"
        },
        {
            id: "zLLd5L8-Mus", // Duplicate for grid fill
            title: "Youth Sunday Service | Call of Jesus Ministries",
            date: "09 Nov 2025",
            speaker: "Ps. Samson Wilson",
            duration: "4:17:35"
        },
        {
            id: "zLLd5L8-Mus", // Duplicate for grid fill
            title: "Youth Sunday Service | Call of Jesus Ministries",
            date: "09 Nov 2025",
            speaker: "Ps. Samson Wilson",
            duration: "4:17:35"
        },
        {
            id: "zLLd5L8-Mus", // Duplicate for grid fill
            title: "Youth Sunday Service | Call of Jesus Ministries",
            date: "09 Nov 2025",
            speaker: "Ps. Samson Wilson",
            duration: "4:17:35"
        },
        {
            id: "zLLd5L8-Mus", // Duplicate for grid fill
            title: "Youth Sunday Service | Call of Jesus Ministries",
            date: "09 Nov 2025",
            speaker: "Ps. Samson Wilson",
            duration: "4:17:35"
        }
    ];

    const handleShare = async (video: typeof sermons[0]) => {
        const url = `https://www.youtube.com/watch?v=${video.id}`;
        const shareData = {
            title: video.title,
            text: `Check out this sermon: ${video.title}`,
            url: url
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(url);
                setCopiedId(video.id);
                setTimeout(() => setCopiedId(null), 2000);
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white p-6 pb-32 overflow-hidden relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-1/2 w-[60%] h-[60%] bg-red-900/10 rounded-full blur-[120px] animate-pulse-slow -translate-x-1/2"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 p-3 px-5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 backdrop-blur-md mb-12 transition-all group">
                    <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-amber-500 transition-colors" />
                    <span className="text-sm font-bold tracking-widest uppercase">Back</span>
                </Link>

                <div className="text-center mb-16 animate-fade-in-down">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
                        <Youtube className="w-4 h-4 text-red-500" />
                        <span className="text-red-500 text-xs font-bold tracking-[0.2em] uppercase">Latest Messages</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50 drop-shadow-2xl">
                        WATCH <span className="text-red-500">SERMONS</span>
                    </h1>
                    <p className="text-white/40 text-lg max-w-2xl mx-auto">
                        Missed a service? Catch up on the latest teachings and worship sessions here.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sermons.map((video, i) => (
                        <TiltCard key={i} className="w-full" max={5} scale={1.02}>
                            <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden group hover:border-red-500/30 transition-all duration-500 shadow-2xl">
                                {/* Video Container */}
                                <div className="relative aspect-video w-full bg-black">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={`https://www.youtube.com/embed/${video.id}`}
                                        title={video.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                                    ></iframe>
                                </div>

                                {/* Content */}
                                <div className="p-6 relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] to-[#050505] -z-10"></div>

                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 group-hover:text-red-500 transition-colors">
                                            {video.title}
                                        </h3>
                                        <button
                                            onClick={() => handleShare(video)}
                                            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                                            title="Share"
                                        >
                                            {copiedId === video.id ? (
                                                <Check className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Share2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-white/40 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-amber-500" />
                                            <span>{video.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3 text-amber-500" />
                                            <span>{video.duration}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-serif font-bold">
                                            Ps
                                        </div>
                                        <span className="text-sm font-medium text-white/80">{video.speaker}</span>
                                    </div>
                                </div>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}</style>
        </div>
    );
}
