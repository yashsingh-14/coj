'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Music2, Share2, Download, Clock, Mic2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function SetsPage() {
    const sets = [
        {
            id: 1,
            date: "Dec 21, 2025",
            title: "Sunday Service",
            leader: "Yash Singh",
            songs: [
                { title: "Way Maker", key: "E", type: "Worship" },
                { title: "10,000 Reasons", key: "G", type: "Praise" },
                { title: "Goodness of God", key: "Ab", type: "Worship" },
                { title: "King of Kings", key: "D", type: "Anthem" }
            ],
            status: "Upcoming"
        },
        {
            id: 2,
            date: "Dec 14, 2025",
            title: "Youth Night",
            leader: "Sarah Johnson",
            songs: [
                { title: "Lion and the Lamb", key: "B", type: "High Praise" },
                { title: "Firm Foundation", key: "Bb", type: "Worship" },
                { title: "Build My Life", key: "G", type: "Response" }
            ],
            status: "Completed"
        }
    ];

    const handleCreateSet = () => {
        toast.info("Create Set Wizard starting...");
    };

    const handleDownload = (title: string) => {
        toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
            loading: `Generating PDF for ${title}...`,
            success: `${title} PDF downloaded!`,
            error: 'Failed to download'
        });
    };

    const handleShare = (title: string) => {
        navigator.clipboard.writeText(window.location.href);
        toast.success(`Link to ${title} copied to clipboard!`);
    };

    const handlePlaySong = (e: React.MouseEvent, title: string) => {
        e.stopPropagation();
        toast.success(`Now Playing: ${title}`);
    };

    return (
        <div className="relative min-h-screen bg-[#02000F] text-white overflow-hidden selection:bg-amber-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[20%] w-[60vw] h-[60vw] bg-purple-900/10 rounded-full blur-[120px] opacity-40 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[10%] w-[40vw] h-[40vw] bg-amber-900/10 rounded-full blur-[100px] opacity-40 animate-pulse-slow delay-1000"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-fade-in-down">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-md mb-8 transition-all duration-300 group">
                            <ArrowLeft className="w-4 h-4 text-white/70 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium text-white/90">Back to Dashboard</span>
                        </Link>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                            Worship Sets
                        </h1>
                        <p className="text-lg text-white/40 font-medium">Plan, organize, and lead confident services.</p>
                    </div>

                    <button
                        onClick={handleCreateSet}
                        className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transform hover:scale-105 active:scale-95">
                        Create New Set
                    </button>
                </div>

                {/* Sets Grid */}
                <div className="grid gap-8">
                    {sets.map((set, index) => (
                        <div
                            key={set.id}
                            className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500 group relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                            {/* Card Header */}
                            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex flex-col items-center justify-center text-center shadow-lg">
                                        <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{set.date.split(' ')[0]}</span>
                                        <span className="text-2xl font-black">{set.date.split(' ')[1].replace(',', '')}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold group-hover:text-amber-500 transition-colors">{set.title}</h2>
                                            {set.status === 'Upcoming' && (
                                                <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-full uppercase tracking-wider">
                                                    Upcoming
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-white/40 text-sm">
                                            <span className="flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5" /> {set.leader}</span>
                                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 10:30 AM</span>
                                            <span className="flex items-center gap-1.5"><Music2 className="w-3.5 h-3.5" /> {set.songs.length} Songs</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDownload(set.title)}
                                        className="p-3 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white" title="Download PDF">
                                        <Download className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleShare(set.title)}
                                        className="p-3 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white" title="Share Set">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Songs List */}
                            <div className="p-4 md:p-8">
                                <div className="space-y-2">
                                    {set.songs.map((song, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group/song cursor-pointer">
                                            <span className="text-white/20 font-mono text-sm w-6">{(i + 1).toString().padStart(2, '0')}</span>

                                            <div className="flex-1">
                                                <div className="font-bold text-lg text-white/90 group-hover/song:text-white">{song.title}</div>
                                                <div className="text-xs text-white/40 uppercase tracking-widest">{song.type}</div>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="hidden md:flex flex-col items-center">
                                                    <span className="text-[10px] text-white/30 uppercase tracking-widest">Key</span>
                                                    <span className="font-bold text-amber-500">{song.key}</span>
                                                </div>
                                                <button
                                                    onClick={(e) => handlePlaySong(e, song.title)}
                                                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all opacity-0 group-hover/song:opacity-100">
                                                    <PlayCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function UserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    )
}
