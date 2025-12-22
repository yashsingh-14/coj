'use client';

import Link from 'next/link';
import { ALL_SONGS } from '@/data/songs';
import { ArrowLeft, Search, PlayCircle, Heart, Clock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import TiltCard from '@/components/ui/TiltCard';

export default function SongsListPage() {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Filter songs based on search
    const filteredSongs = ALL_SONGS.filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.artist.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#02000F] text-white pb-32 overflow-x-hidden selection:bg-[var(--brand)] selection:text-white">

            {/* AMBIENT BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[var(--brand)]/10 rounded-full blur-[120px] mix-blend-screen"></div>
            </div>

            {/* STICKY HEADER */}
            <div className="sticky top-0 z-40 bg-[#02000F]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors group">
                            <ArrowLeft className="w-5 h-5 text-white/50 group-hover:text-white" />
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">All Songs <span className="text-white/30 text-sm ml-2 font-medium">{filteredSongs.length} Tracks</span></h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                {/* SEARCH INPUT */}
                <div className="relative group mb-12 max-w-2xl mx-auto">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r from-[var(--brand)] to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 ${isFocused ? 'opacity-50' : ''}`}></div>
                    <div className="relative bg-[#0A0A0A] rounded-2xl flex items-center px-6 py-4 border border-white/10 shadow-2xl">
                        <Search className={`w-5 h-5 mr-4 transition-colors ${isFocused ? 'text-[var(--brand)]' : 'text-white/30'}`} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Find a song..."
                            className="w-full bg-transparent text-lg font-bold text-white placeholder:text-white/20 focus:outline-none"
                        />
                    </div>
                </div>

                {/* PREMIUM GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredSongs.map((song, i) => (
                        <TiltCard key={song.id} className="h-full min-h-[350px]" scale={1.03} max={10}>
                            <div className="relative h-full group">
                                {/* NEON GLOW ON HOVER */}
                                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[var(--brand)] to-purple-600 blur-[30px] opacity-0 group-hover:opacity-70 transition-all duration-500 group-hover:scale-105"></div>

                                <Link
                                    href={`/songs/${song.id}`}
                                    className="relative flex flex-col justify-end p-6 rounded-[2rem] bg-[#0A0A0A] border border-white/10 overflow-hidden h-full group-hover:bg-[#111] transition-colors aspect-[3/4]"
                                >
                                    {/* Album Art Background */}
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${song.img}')` }}></div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

                                    {/* Content */}
                                    <div className="relative z-10 transform-style-3d translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/10 backdrop-blur text-white border border-white/10">
                                                {song.category.toUpperCase()}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-2xl text-white leading-none mb-1 drop-shadow-lg">{song.title}</h3>
                                        <p className="text-sm text-white/70 font-bold uppercase tracking-widest">{song.artist}</p>

                                        {/* Fake Equalizer */}
                                        <div className="w-full h-1 bg-white/20 rounded-full mt-4 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                            <div className="h-full bg-[var(--brand)] w-1/2 animate-loader"></div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </TiltCard>
                    ))}
                </div>

                {filteredSongs.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-white/30 text-xl font-bold">No songs found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
