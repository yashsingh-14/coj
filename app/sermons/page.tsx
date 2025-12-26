'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, Youtube, Check, Calendar, Play } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';
import { fetchSermons, YouTubeVideo } from '@/lib/youtube';

export default function SermonsPage() {
    const [sermons, setSermons] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        const loadSermons = async () => {
            const data = await fetchSermons();
            setSermons(data);
            setLoading(false);
        };
        loadSermons();
    }, []);

    const handleShare = async (video: YouTubeVideo) => {
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
                        <span className="text-red-500 text-xs font-bold tracking-[0.2em] uppercase">Channel: Call of Jesus Ministries</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50 drop-shadow-2xl">
                        WATCH <span className="text-red-500">SERMONS</span>
                    </h1>
                    <p className="text-white/40 text-lg max-w-2xl mx-auto">
                        Missed a service? Catch up on all the latest teachings and live worship sessions from our YouTube channel.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="aspect-video bg-white/5 rounded-[2rem] animate-pulse"></div>
                        ))}
                    </div>
                ) : sermons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sermons.map((video) => (
                            <TiltCard key={video.id} className="w-full" max={5} scale={1.02}>
                                <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden group hover:border-red-500/30 transition-all duration-500 shadow-2xl relative h-full flex flex-col">
                                    {/* Video Thumbnail with Play Overlay */}
                                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-full bg-red-500/80 flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                                                <Play className="w-6 h-6 text-white fill-white ml-1" />
                                            </div>
                                        </div>
                                        {video.isLive && (
                                            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 bg-red-600 rounded-full animate-pulse shadow-lg">
                                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white">LIVE</span>
                                            </div>
                                        )}
                                        {/* Direct Link to YouTube */}
                                        <a
                                            href={`https://www.youtube.com/watch?v=${video.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 z-10"
                                        ></a>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 relative flex-grow flex flex-col justify-between">
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] to-[#050505] -z-10"></div>

                                        <div>
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <h3 className="text-lg font-bold text-white leading-tight line-clamp-2 group-hover:text-red-500 transition-colors">
                                                    {video.title}
                                                </h3>
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleShare(video);
                                                    }}
                                                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white z-20"
                                                >
                                                    {copiedId === video.id ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3 h-3 text-amber-500" />
                                                    <span>{video.publishedAt}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-serif font-bold shadow-lg border border-white/10">
                                                COJ
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Call of Jesus</span>
                                                <span className="text-[10px] text-white/40 font-medium">Ministries</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
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

            <style jsx global>{`
                .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse {
                    0%, 100% { opacity: 0.1; transform: scale(1) translate(-50%, 0); }
                    50% { opacity: 0.2; transform: scale(1.1) translate(-50%, 0); }
                }
            `}</style>
        </div>
    );
}
