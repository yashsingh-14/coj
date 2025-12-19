'use client';

import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SONGS } from '@/data/songs';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(SONGS);

    useEffect(() => {
        if (query.trim() === '') {
            setResults(SONGS);
        } else {
            const lowerQ = query.toLowerCase();
            setResults(SONGS.filter(s =>
                s.title.toLowerCase().includes(lowerQ) ||
                s.author.toLowerCase().includes(lowerQ)
            ));
        }
    }, [query]);

    return (
        <div className="min-h-screen bg-[var(--background)] text-white pb-32">
            {/* Search Header */}
            <div className="sticky top-0 bg-[var(--background)]/95 backdrop-blur z-20 p-4 border-b border-white/5">
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search songs, artists..."
                        className="w-full bg-[#111] border border-white/10 rounded-xl py-4 pl-12 pr-10 text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--brand)] transition-colors text-lg"
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Results List */}
            <div className="px-4 py-6">
                <h2 className="text-xs uppercase font-bold text-[#94a3b8] mb-4 tracking-widest pl-2">
                    {query ? `Results (${results.length})` : 'All Songs'}
                </h2>

                <div className="space-y-1">
                    {results.map((song) => (
                        <Link key={song.slug} href={`/songs/${song.slug}`} className="flex items-center gap-4 py-3 px-2 border-b border-[var(--muted)]/20 active:bg-white/5 transition-colors group">
                            <div className="w-10 h-10 bg-[#1a1a1a] rounded flex items-center justify-center text-white/20 font-bold border border-white/5 group-hover:border-[var(--brand)]/50 transition-colors">
                                {song.title.charAt(0)}
                            </div>
                            <div className="flex-1">
                                {/* Highlight match if searching? Keeping it simple for now */}
                                <h3 className={`font-bold text-base ${query ? 'text-[var(--accent)]' : 'text-white'}`}>{song.title}</h3>
                                <p className="text-xs text-[#94a3b8] uppercase">{song.author}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[var(--brand)] -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                        </Link>
                    ))}

                    {results.length === 0 && (
                        <div className="text-center py-20 opacity-50">
                            <p>No songs found for "{query}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
