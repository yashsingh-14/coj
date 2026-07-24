'use client';

import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, ArrowRight, TrendingUp, Music, Mic2, Disc, Command } from 'lucide-react';
import Link from 'next/link';
import { getSongImage } from '@/lib/utils';
import { generateSlug } from '@/lib/seoUtils';
import { useFuzzySearch } from '@/lib/hooks/useFuzzySearch'; // New Hook

// Production: Pre-defined popular searches to guide new users
const TRENDING_SEARCHES = ['Way Maker', 'Elevation Worship', 'Holy Forever', 'Goodness of God'];

export default function SearchPage() {
    const { query, setQuery, results, loading } = useFuzzySearch();
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div className="min-h-screen bg-[#02000F] text-white selection:bg-[var(--brand)] selection:text-white pb-36 md:pb-32 relative">

            {/* Ambient Background Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-900/40 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[var(--brand)]/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

            {/* Main Container */}
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-12 relative z-10 flex flex-col pb-28 md:pb-32">

                {/* Header / Close */}
                <div className="flex justify-end mb-4 md:mb-8">
                    <Link href="/" className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </Link>
                </div>

                {/* SEARCH HERO */}
                <div className={`transition-all duration-500 ease-out ${query ? 'translate-y-0' : 'translate-y-0 md:translate-y-[6vh]'}`}>
                    <div className="relative group">
                        {/* Glow effect behind input */}
                        <div className={`absolute -inset-1 bg-gradient-to-r from-[var(--brand)] to-purple-600 rounded-xl md:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 ${isFocused ? 'opacity-50' : ''}`}></div>

                        <div className="relative bg-[#0A0A0A] rounded-xl md:rounded-2xl flex items-center p-3 md:p-6 border border-white/10 shadow-2xl">
                            <SearchIcon className={`w-5 md:w-8 h-5 md:h-8 mr-2 md:mr-4 transition-colors shrink-0 ${isFocused ? 'text-[var(--brand)]' : 'text-white/30'}`} />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="Search for worship songs..."
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                enterKeyHint="search"
                                className="w-full bg-transparent text-lg md:text-3xl lg:text-4xl font-bold text-white placeholder:text-white/20 focus:outline-none placeholder:font-bold"
                            />
                            {query && (
                                <button onClick={() => setQuery('')} className="p-2 text-white/30 hover:text-white transition-colors shrink-0">
                                    <X className="w-5 h-5 md:w-6 md:h-6" />
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
                        <div className="mt-8 md:mt-16 animate-fade-in-up space-y-8 md:space-y-12">
                            {/* Trending Section */}
                            <div>
                                <h3 className="flex items-center gap-2 text-xs md:text-sm font-bold text-[var(--brand)] uppercase tracking-widest mb-4 md:mb-6">
                                    <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" /> Trending Now
                                </h3>
                                <div className="flex flex-wrap gap-2 md:gap-3">
                                    {TRENDING_SEARCHES.map((term, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setQuery(term)}
                                            className="px-4 md:px-6 py-2.5 md:py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[var(--brand)]/50 text-white/70 hover:text-white transition-all text-xs md:text-sm font-bold"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Categories Grid - Visual */}
                            <div>
                                <h3 className="text-xs md:text-sm font-bold text-white/30 uppercase tracking-widest mb-4 md:mb-6">Browse Categories</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                                    {[
                                        { name: 'Worship', icon: <Mic2 className="w-4 h-4 md:w-5 md:h-5" />, color: 'from-blue-500 to-indigo-600' },
                                        { name: 'Praise', icon: <Music className="w-4 h-4 md:w-5 md:h-5" />, color: 'from-orange-400 to-red-500' },
                                        { name: 'Hymns', icon: <Disc className="w-4 h-4 md:w-5 md:h-5" />, color: 'from-emerald-400 to-teal-500' },
                                        { name: 'New', icon: <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />, color: 'from-purple-500 to-pink-500' },
                                    ].map((cat, i) => (
                                        <Link
                                            href={`/categories/${cat.name.toLowerCase()}`}
                                            key={i}
                                            className="group relative h-24 md:h-32 rounded-xl md:rounded-2xl overflow-hidden bg-[#111] border border-white/5 hover:border-white/20 transition-all"
                                        >
                                            {/* Gradient BG */}
                                            <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

                                            <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-between">
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-white/70 group-hover:text-white group-hover:scale-110 transition-all">
                                                    {cat.icon}
                                                </div>
                                                <span className="font-bold text-sm md:text-lg text-white/80 group-hover:text-white">{cat.name}</span>
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
                    <div className="mt-6 md:mt-8 space-y-3 md:space-y-4 animate-fade-in-up">
                        <div className="flex items-center justify-between text-xs font-bold text-white/30 uppercase tracking-widest px-2 mb-2">
                            <span>Top Results</span>
                            <span>{loading ? 'Searching...' : `${results.length} found`}</span>
                        </div>

                        {results.length > 0 ? results.map((song, i) => (
                            <Link
                                key={song.id}
                                href={`/songs/${generateSlug(song.title)}`}
                                className="group flex items-center gap-4 md:gap-6 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[var(--brand)]/30 hover:scale-[1.01] transition-all duration-300"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                {/* Album Art */}
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-xl md:text-2xl font-black text-[var(--brand)] shadow-lg group-hover:shadow-[var(--brand)]/20 transition-shadow overflow-hidden relative shrink-0">
                                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${getSongImage(song)}')` }} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base md:text-xl font-bold text-white truncate group-hover:text-[var(--brand)] transition-colors">
                                        {song.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-white/50 font-medium group-hover:text-white/70 transition-colors truncate">{song.artist}</p>
                                </div>

                                <div className="p-2 shrink-0">
                                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300 text-white/50 group-hover:text-white" />
                                </div>
                            </Link>
                        )) : (
                            !loading && (
                                <div className="py-12 md:py-20 text-center">
                                    <p className="text-xl md:text-2xl font-bold text-white/20">No matching songs found.</p>
                                    <p className="text-xs md:text-sm text-white/10 mt-2">Try searching for generic terms like "Worship" or "Praise"</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
