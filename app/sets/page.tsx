'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Music2, Share2, Download, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Set = {
    id: string;
    title: string;
    event_date: string;
    description: string;
    set_songs: { count: number }[];
    profiles: { name: string } | null; // created_by linked to profiles
};

export default function SetsPage() {
    const [sets, setSets] = useState<Set[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSets = async () => {
            try {
                const { data, error } = await supabase
                    .from('sets')
                    .select(`
                        *,
                        set_songs(count),
                        profiles:created_by (name)
                    `)
                    .order('event_date', { ascending: false });

                if (error) throw error;
                // @ts-ignore - Supabase type inference for foreign tables can be tricky
                setSets(data || []);
            } catch (error) {
                console.error('Error fetching sets:', error);
                toast.error("Failed to load sets");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSets();
    }, []);

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

                    <Link
                        href="/sets/new"
                        className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-full transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transform hover:scale-105 active:scale-95 text-center">
                        Create New Set
                    </Link>
                </div>

                {/* Sets Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                    </div>
                ) : sets.length === 0 ? (
                    <div className="text-center py-20 border border-white/10 rounded-3xl bg-white/5">
                        <Calendar className="w-16 h-16 text-white/20 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">No Sets Yet</h2>
                        <p className="text-white/40 mb-8">Get started by creating your first service plan.</p>
                        <Link href="/sets/new" className="text-amber-500 hover:underline">Create a Set</Link>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {sets.map((set) => {
                            const dateObj = new Date(set.event_date);
                            const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
                            const day = dateObj.getDate();
                            const time = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                            const leaderName = set.profiles?.name || 'Unknown';
                            // @ts-ignore - Supabase join returns array but we assume count
                            const songCount = set.set_songs?.[0]?.count || 0;
                            const isUpcoming = dateObj > new Date();

                            return (
                                <Link
                                    href={`/sets/${set.id}`}
                                    key={set.id}
                                    className="block backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden hover:border-white/20 transition-all duration-500 group relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                                    {/* Card Header */}
                                    <div className="p-8 flex flex-col md:flex-row justify-between gap-6 items-center md:items-start">
                                        <div className="flex gap-6 w-full">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex flex-col items-center justify-center text-center shadow-lg shrink-0">
                                                <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">{month}</span>
                                                <span className="text-2xl font-black">{day}</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <h2 className="text-2xl font-bold group-hover:text-amber-500 transition-colors">{set.title}</h2>
                                                    {isUpcoming ? (
                                                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-full uppercase tracking-wider">
                                                            Upcoming
                                                        </span>
                                                    ) : (
                                                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/40 text-xs font-bold rounded-full uppercase tracking-wider">
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-white/40 text-sm flex-wrap">
                                                    <span className="flex items-center gap-1.5"><UserIcon className="w-3.5 h-3.5" /> {leaderName}</span>
                                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {time}</span>
                                                    <span className="flex items-center gap-1.5"><Music2 className="w-3.5 h-3.5" /> {songCount} Songs</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                                            {/* Download Button - Hidden until PDF generation is implemented 
                                            <button
                                                onClick={(e) => { e.preventDefault(); handleDownload(set.title); }}
                                                className="p-3 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white" title="Download PDF">
                                                <Download className="w-5 h-5" />
                                            </button>
                                            */}
                                            <button
                                                onClick={(e) => { e.preventDefault(); handleShare(set.title); }}
                                                className="p-3 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white" title="Share Set">
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
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
