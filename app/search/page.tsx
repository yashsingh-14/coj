'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, ArrowRight, TrendingUp, Music, Mic2, Disc, Command } from 'lucide-react';
import Link from 'next/link';
import { ALL_SONGS, Song } from '@/data/songs';

// Mock additional data for the "Mindblowing" feel if real data is limited
const TRENDING_SEARCHES = ['Way Maker', 'Elevation Worship', 'Holy Forever', 'Goodness of God'];

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [results, setResults] = useState<Song[]>(ALL_SONGS);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (query.trim() === '') {
            setResults([]);
        } else {
            const lowerQ = query.toLowerCase();
            setResults(ALL_SONGS.filter(s =>
                s.title.toLowerCase().includes(lowerQ) ||
                s.artist.toLowerCase().includes(lowerQ)
            ));
        }
    }, [query]);

    // Auto-focus on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="min-h-screen bg-[#02000F] text-white selection:bg-[var(--brand)] selection:text-white pb-32 overflow-hidden relative">

            {/* Ambient Background Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/40 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--brand)]/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

            {/* Main Container */}
            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10 flex flex-col min-h-screen">

                {/* Header / Close */}
                <div className="flex justify-end mb-8">
                    <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </Link>
                </div>

                {/* SEARCH HERO */}
                <div className={`transition-all duration-500 ease-out ${query ? 'translate-y-0' : 'translate-y-[20vh]'}`}>
                    <div className="relative group">
                        {/* Glow effect behind input */}
                        <div className={`absolute -inset-1 bg-gradient-to-r from-[var(--brand)] to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 ${isFocused ? 'opacity-50' : ''}`}></div>

                        <div className="relative bg-[#0A0A0A] rounded-2xl flex items-center p-6 border border-white/10 shadow-2xl">
                            <SearchIcon className={`w-8 h-8 mr-4 transition-colors ${isFocused ? 'text-[var(--brand)]' : 'text-white/30'}`} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Search for worship songs..."
                                className="w-full bg-transparent text-2xl md:text-4xl font-bold text-white placeholder:text-white/20 focus:outline-none placeholder:font-bold"
                            />
                            {query && (
                                <button onClick={() => setQuery('')} className="p-2 text-white/30 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            )}
                            {/* Desktop Shortcut Hint */}
                            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-medium text-white/40 ml-4 pointer-events-none">
                                <Command className="w-3 h-3" />
                                <span>K</span>
                            </div>
                        </div>
                    </div>

                    {/* EMPTY STATE: Visual Tags */}
                    {!query && (
                        <div className="mt-16 animate-fade-in-up space-y-12">
                            {/* Trending Section */}
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--brand)] uppercase tracking-widest mb-6">
                                    <TrendingUp className="w-4 h-4" /> Trending Now
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {TRENDING_SEARCHES.map((term, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setQuery(term)}
                                            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[var(--brand)]/50 text-white/70 hover:text-white transition-all text-sm font-bold"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Categories Grid - Visual */}
                            <div>
                                <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-6">Browse Categories</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { name: 'Worship', icon: <Mic2 className="w-5 h-5" />, color: 'from-blue-500 to-indigo-600' },
                                        { name: 'Praise', icon: <Music className="w-5 h-5" />, color: 'from-orange-400 to-red-500' },
                                        { name: 'Hymns', icon: <Disc className="w-5 h-5" />, color: 'from-emerald-400 to-teal-500' },
                                        { name: 'New', icon: <TrendingUp className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
                                    ].map((cat, i) => (
                                        <Link
                                            href={`/categories/${cat.name.toLowerCase()}`}
                                            key={i}
                                            className="group relative h-32 rounded-2xl overflow-hidden bg-[#111] border border-white/5 hover:border-white/20 transition-all"
                                        >
                                            {/* Gradient BG */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

                                            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 group-hover:text-white group-hover:scale-110 transition-all">
                                                    {cat.icon}
                                                </div>
                                                <span className="font-bold text-lg text-white/80 group-hover:text-white">{cat.name}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* LIVE RESULTS LIST */}
                {query && (
                    <div className="mt-8 space-y-4 animate-fade-in-up">
                        <div className="flex items-center justify-between text-xs font-bold text-white/30 uppercase tracking-widest px-2 mb-2">
                            <span>Top Results</span>
                            <span>{results.length} found</span>
                        </div>

                        {results.length > 0 ? results.map((song, i) => (
                            <Link
                                key={song.id}
                                href={`/songs/${song.id}`}
                                className="group flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[var(--brand)]/30 hover:scale-[1.01] transition-all duration-300"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                {/* Album Art Placeholder */}
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-2xl font-black text-[var(--brand)] shadow-lg group-hover:shadow-[var(--brand)]/20 transition-shadow overflow-hidden">
                                    {song.img ? (
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${song.img}')` }} />
                                    ) : (
                                        <span>{song.title.charAt(0)}</span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-white truncate group-hover:text-[var(--brand)] transition-colors">{song.title}</h3>
                                    <p className="text-white/50 font-medium group-hover:text-white/70 transition-colors">{song.artist}</p>
                                </div>

                                <div className="p-3">
                                    <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300 text-white/50 group-hover:text-white" />
                                </div>
                            </Link>
                        )) : (
                            <div className="py-20 text-center">
                                <p className="text-2xl font-bold text-white/20">No matching songs found.</p>
                                <p className="text-white/10 mt-2">Try searching for generic terms like "Worship" or "Praise"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
