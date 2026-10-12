'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, X, Sparkles, RotateCcw } from 'lucide-react';
import Fuse from 'fuse.js';
import BackButton from '@/components/ui/BackButton';
import TiltCard from '@/components/ui/TiltCard';
import { getSongImage } from '@/lib/utils';
import { generateSlug } from '@/lib/seoUtils';
import { Song } from '@/data/types';
import { matchesCategorySlug } from '@/lib/categoryUtils';
import { filterAndRankSongs } from '@/lib/searchUtils';

interface SongsListClientProps {
    initialSongs: Song[];
    categoryFilter?: string;
}

export default function SongsListClient({ initialSongs, categoryFilter }: SongsListClientProps) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Initialize Fuse for deep typo-tolerance
    const fuse = useMemo(() => {
        if (!initialSongs || initialSongs.length === 0) return null;
        return new Fuse(initialSongs, {
            keys: [
                { name: 'title', weight: 0.8 },
                { name: 'artist', weight: 0.4 },
                { name: 'category', weight: 0.3 },
                { name: 'lyrics', weight: 0.2 },
                { name: 'hindi_lyrics', weight: 0.2 },
            ],
            threshold: 0.55,
            distance: 200,
            includeScore: true,
            ignoreLocation: true,
            minMatchCharLength: 2,
        });
    }, [initialSongs]);

    // Instant smart typo-tolerant in-memory filtering with 0 latency
    const filteredSongs = useMemo(() => {
        let list = initialSongs;

        if (categoryFilter && categoryFilter !== 'all') {
            list = list.filter(s => matchesCategorySlug(s, categoryFilter));
        }

        const trimmed = query.trim();
        if (!trimmed) return list;

        // 1. Run our smart Damerau-Levenshtein, Dice, phonetic & multi-token ranker
        const rankedByScore = filterAndRankSongs(list, trimmed);

        // 2. Run Fuse for additional typo variations
        let fuseList: Song[] = [];
        if (fuse) {
            fuseList = fuse.search(trimmed).map(r => r.item);
            if (categoryFilter && categoryFilter !== 'all') {
                fuseList = fuseList.filter(s => matchesCategorySlug(s, categoryFilter));
            }
        }

        // 3. Merge & deduplicate by ID with rankedByScore having top priority
        const seen = new Set<string>();
        const combined: Song[] = [];

        for (const s of rankedByScore) {
            if (!seen.has(s.id)) {
                seen.add(s.id);
                combined.push(s);
            }
        }

        for (const s of fuseList) {
            if (!seen.has(s.id)) {
                seen.add(s.id);
                combined.push(s);
            }
        }

        return combined;
    }, [initialSongs, categoryFilter, query, fuse]);

    return (
        <div className="min-h-screen bg-[#02000F] text-white pb-36 md:pb-32 overflow-x-hidden selection:bg-[var(--brand)] selection:text-white">

            {/* AMBIENT BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[var(--brand)]/10 rounded-full blur-[120px] mix-blend-screen"></div>
            </div>

            {/* STICKY HEADER */}
            <div className="sticky top-0 z-40 bg-[#02000F]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <BackButton
                            fallback="/worship"
                            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors group text-white/50 hover:text-white"
                            iconClassName="w-5 h-5"
                        />
                        <h1 className="text-xl font-bold tracking-tight">
                            All Songs <span className="text-white/30 text-sm ml-2 font-medium">{filteredSongs.length} Tracks</span>
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-2.5 sm:px-6 py-5 sm:py-8 relative z-10">
                {/* SMART SEARCH INPUT */}
                <div className="relative group mb-6 sm:mb-12 max-w-2xl mx-auto">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r from-[var(--brand)] to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 ${isFocused ? 'opacity-50' : ''}`}></div>
                    <div className="relative bg-[#0A0A0A] rounded-2xl flex items-center px-5 sm:px-6 py-3.5 sm:py-4 border border-white/10 shadow-2xl">
                        <Search className={`w-5 h-5 mr-3 sm:mr-4 transition-colors shrink-0 ${isFocused ? 'text-[var(--brand)]' : 'text-white/30'}`} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="Find songs, artists, lyrics (typos supported)..."
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            className="w-full bg-transparent text-base sm:text-lg font-bold text-white placeholder:text-white/25 focus:outline-none"
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="p-1.5 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors shrink-0 ml-2 cursor-pointer"
                                title="Clear search"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        )}
                    </div>

                    {query && (
                        <div className="flex items-center justify-between text-xs text-white/50 px-3 mt-2 font-medium">
                            <span>
                                Found <strong className="text-white">{filteredSongs.length}</strong> {filteredSongs.length === 1 ? 'song' : 'songs'} matching &quot;{query}&quot;
                            </span>
                            <button
                                onClick={() => setQuery('')}
                                className="text-amber-400 hover:text-amber-300 transition-colors underline cursor-pointer"
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                {/* POPULATED GRID - 4 CARDS ACROSS ALL SCREENS */}
                {filteredSongs.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2 sm:gap-3.5 md:gap-4 lg:gap-5">
                        {filteredSongs.map((song) => (
                            <TiltCard key={song.id} className="h-full min-h-[135px] sm:min-h-[170px] md:min-h-[210px]" scale={1.03} max={10}>
                                <div className="relative h-full group">
                                    {/* NEON GLOW ON HOVER */}
                                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl md:rounded-[2rem] bg-gradient-to-br from-[var(--brand)] to-purple-600 blur-[20px] sm:blur-[30px] opacity-0 group-hover:opacity-70 transition-all duration-500 group-hover:scale-105 pointer-events-none"></div>

                                    <Link
                                        href={`/songs/${generateSlug(song.title)}`}
                                        className="relative flex flex-col justify-end p-2 sm:p-3.5 md:p-4 rounded-xl sm:rounded-2xl bg-[#0A0A0A] border border-white/10 overflow-hidden h-full group-hover:bg-[#111] transition-colors aspect-[3/4.2] sm:aspect-[3/4]"
                                    >
                                        {/* Album Art Background */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url('${getSongImage(song)}')` }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />

                                        {/* Content */}
                                        <div className="relative z-10 transform-style-3d translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                                                <span className="text-[7px] sm:text-[8.5px] md:text-[10px] font-black px-1 sm:px-1.5 py-0.5 rounded sm:rounded-full bg-white/15 backdrop-blur text-white border border-white/15 truncate max-w-full">
                                                    {(song.category || 'Worship').toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="font-bold sm:font-black text-[11px] sm:text-sm md:text-base lg:text-lg text-white leading-tight mb-0.5 sm:mb-1 drop-shadow-md line-clamp-2">
                                                {song.title}
                                            </h3>
                                            <p className="text-[8px] sm:text-[9.5px] md:text-xs text-white/70 font-semibold uppercase tracking-wider truncate">
                                                {song.artist}
                                            </p>

                                            {/* Equalizer animation on hover */}
                                            <div className="w-full h-0.5 sm:h-1 bg-white/20 rounded-full mt-1.5 sm:mt-2.5 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                                <div className="h-full bg-[var(--brand)] w-1/2 animate-loader"></div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </TiltCard>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 sm:py-24 max-w-md mx-auto px-4 bg-white/[0.02] border border-white/5 rounded-3xl">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 text-white/40">
                            <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No matching songs found</h3>
                        <p className="text-white/40 text-xs sm:text-sm mb-6">
                            No songs matched &quot;{query}&quot;. Try searching for an artist name, lyrics snippet, or clear your query.
                        </p>
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF5A2E] to-[#FF8C68] text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-[0_0_25px_rgba(255,90,46,0.4)] transition-all active:scale-95 cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>View All Songs</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
