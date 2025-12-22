'use client';

import Link from 'next/link';
import { useState, use } from 'react';
import { ArrowLeft, PlayCircle, Star, Shuffle, Play, CheckCircle, Mic2, Users, Music } from 'lucide-react';
import { ALL_SONGS } from '@/data/songs';
import TiltCard from '@/components/ui/TiltCard';

// Use React.use to unwrap params in Next.js 15
export default function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const artistId = id || 'unknown-artist';

    // 1. Find the artist data (Mocking based on ID for now, real app would fetch)
    // We try to find songs by this artist ID first to get real data
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const artistSongs = ALL_SONGS.filter(s =>
        normalize(s.artist).includes(normalize(artistId)) ||
        normalize(artistId).includes(normalize(s.artist))
    );

    // Fallback data if no match found (for demo resilience)
    const displaySongs = artistSongs.length > 0 ? artistSongs : ALL_SONGS.slice(0, 5);

    // Construct artist info from the first matching song or defaults
    const artistName = artistSongs.length > 0 ? artistSongs[0].artist : artistId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const artistImage = artistSongs.length > 0 ? artistSongs[0].img : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop';

    const stats = {
        monthlyListeners: '2.4M',
        followers: '850K',
        totalStreams: '120M+'
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white pb-32">

            {/* HERO SECTION */}
            <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden flex items-end">
                {/* Background */}
                <div
                    className="absolute inset-0 bg-cover bg-center parallax-bg"
                    style={{ backgroundImage: `url('${artistImage}')`, transform: 'scale(1.1)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02000F] via-[#02000F]/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#02000F]/50 to-transparent" />

                {/* Back Button */}
                <div className="absolute top-6 left-6 z-20">
                    <Link href="/artists" className="p-3 rounded-full bg-black/20 hover:bg-white/10 backdrop-blur-xl border border-white/5 transition-all group">
                        <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Content */}
                <div className="container mx-auto px-6 pb-12 relative z-10">
                    <div className="flex flex-col md:flex-row items-end gap-8">
                        {/* Profile Image (Circle) */}
                        <div className="w-40 h-40 md:w-52 md:h-52 rounded-full border-4 border-[#02000F] shadow-2xl overflow-hidden relative hidden md:block">
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${artistImage}')` }}></div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Verified Artist
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl mb-4 leading-none">{artistName}</h1>

                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-white/60 mb-8">
                                <span className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-white/40" /> {stats.monthlyListeners} Monthly Listeners
                                </span>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <span className="flex items-center gap-2">
                                    <Music className="w-4 h-4 text-white/40" /> {displaySongs.length} Tracks
                                </span>
                            </div>

                            <div className="flex gap-4">
                                <Link
                                    href={`/songs/${displaySongs[0].id}`}
                                    className="px-8 py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold tracking-widest uppercase flex items-center gap-3 hover:scale-105 transition-transform shadow-lg shadow-orange-500/20"
                                >
                                    <Play className="w-5 h-5 fill-current" /> Play Latest
                                </Link>
                                <button className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white font-bold tracking-widest uppercase transition-all">
                                    Follow
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* POPULAR TRACKS */}
            <div className="container mx-auto px-6 mt-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Tracks</span>
                    </h2>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/40">Top 5</span>
                </div>

                <div className="grid gap-4">
                    {displaySongs.map((song, i) => (
                        <TiltCard key={i} className="w-full" max={5} scale={1.02}>
                            <Link
                                href={`/songs/${song.id}`}
                                className="group flex items-center gap-6 p-4 md:p-6 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300 relative overflow-hidden cursor-pointer"
                            >
                                {/* Background Shine */}
                                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <span className="text-2xl font-black text-white/10 w-8 text-center group-hover:text-amber-500 transition-colors">{i + 1}</span>

                                <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${song.img}')` }} />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <PlayCircle className="w-8 h-8 text-white" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors truncate">{song.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-widest mt-1">
                                        {/* Removed plays and duration */}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); /* Add to favorites logic */ }}
                                    className="p-3 rounded-full hover:bg-white/10 text-white/30 hover:text-red-500 transition-colors"
                                >
                                    <Star className="w-5 h-5" />
                                </button>
                            </Link>
                        </TiltCard>
                    ))}
                </div>
            </div>

            {/* DISCOGRAPHY / ALBUMS (Placeholder) */}
            <div className="container mx-auto px-6 mt-20">
                <h2 className="text-3xl font-bold mb-8">Latest Release</h2>
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#111] to-[#050505] border border-white/5 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-amber-500/10 to-transparent opacity-50 pointer-events-none" />

                    <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl shadow-2xl bg-cover bg-center shrink-0 group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url('${displaySongs[0]?.img}')` }} />

                    <div className="flex-1 text-center md:text-left z-10">
                        <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest mb-4 text-amber-500">New Album</span>
                        <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4">Live From Eden</h3>
                        <p className="text-white/60 max-w-xl mb-8 leading-relaxed">Experience a night of raw, unfiltered worship captured live. Featuring "{displaySongs[0]?.title}" and more anointing-filled tracks.</p>
                        <div className="flex gap-4 justify-center md:justify-start">
                            <button className="px-6 py-3 rounded-full bg-white text-black font-bold text-sm tracking-widest uppercase hover:bg-amber-500 transition-colors">
                                Listen Now
                            </button>
                            <button className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/5 text-sm font-bold tracking-widest uppercase transition-colors">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
