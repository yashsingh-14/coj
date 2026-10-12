import Link from 'next/link';
import { Sparkles, Music2, Play, ArrowUpRight } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { supabaseServer } from '@/lib/supabaseServer';
import { ALL_SONGS } from '@/data/songs';
import { Song } from '@/data/types';
import { generateSlug } from '@/lib/seoUtils';
import { getSongImage } from '@/lib/utils';
import { Metadata } from 'next';

export const revalidate = 60; // Cache for 60 seconds

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const categoryName = (slug || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
        title: `${categoryName} Songs & Chords | COJ Worship`,
        description: `Explore Christian ${categoryName} songs with lyrics, chords and tabs by Call of Jesus Ministries.`
    };
}

import { matchesCategorySlug } from '@/lib/categoryUtils';

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const cleanSlug = typeof slug === 'string' ? slug.toLowerCase().trim() : '';
    const categoryName = cleanSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    // 1. Fetch songs from DB on server (fast, no client lock contention)
    let dbSongs: Song[] = [];
    try {
        const { data, error } = await supabaseServer
            .from('songs')
            .select('id, title, artist, category, img, is_featured, hindi_lyrics, youtube_id')
            .order('title', { ascending: true });

        if (!error && data && data.length > 0) {
            dbSongs = data as unknown as Song[];
        }
    } catch {
        // Fallback silently
    }

    const allSongs = dbSongs.length > 0 ? dbSongs : ALL_SONGS;

    // 2. Strict, bulletproof category filtering
    const filteredSongs = allSongs.filter(song => matchesCategorySlug(song, cleanSlug));

    // Dynamic background based on category
    const getGradient = () => {
        if (cleanSlug.includes('english-praise')) return 'from-orange-400 via-red-500 to-red-600';
        if (cleanSlug.includes('hindi-praise')) return 'from-yellow-400 via-orange-500 to-red-500';
        if (cleanSlug.includes('english-worship')) return 'from-purple-600 via-indigo-600 to-blue-600';
        if (cleanSlug.includes('hindi-worship')) return 'from-blue-500 via-cyan-500 to-teal-500';

        switch (cleanSlug) {
            case 'praise': return 'from-yellow-400 via-orange-500 to-red-500';
            case 'worship': return 'from-purple-600 via-indigo-600 to-blue-600';
            case 'kids': return 'from-green-400 via-teal-500 to-cyan-500';
            case 'hindi': return 'from-orange-500 via-red-600 to-yellow-500';
            case 'hymns': return 'from-indigo-400 via-blue-500 to-cyan-500';
            default: return 'from-[var(--brand)] via-pink-600 to-purple-600';
        }
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white font-sans pb-32 overflow-x-hidden selection:bg-[var(--brand)] selection:text-white">

            {/* COMPACT HERO HEADER */}
            <div className="relative min-h-[16vh] sm:min-h-[22vh] w-full overflow-hidden flex items-end">
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-20`} />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80')] bg-cover bg-center opacity-25 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02000F] via-[#02000F]/70 to-transparent" />

                <div className="relative z-10 p-4 sm:p-6 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-2 sm:gap-4 md:items-end justify-between animate-fade-in-up">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-[#FFB37A] font-bold tracking-widest uppercase text-[10px] sm:text-xs mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF5A2E]" />
                            <span>Curated Collection</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white shadow-xl drop-shadow-md uppercase">
                            {categoryName}
                        </h1>
                        <p className="text-white/60 font-medium max-w-lg text-xs sm:text-sm mt-1">
                            Dive into the presence of God with hand-picked {categoryName} worship songs.
                        </p>
                    </div>
                </div>
            </div>

            {/* NAVIGATION BAR */}
            <div className="sticky top-0 z-30 bg-[#02000F]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <BackButton fallback="/categories" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium group" iconClassName="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                        <span>Back</span>
                    </BackButton>
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{filteredSongs.length} Tracks</span>
                </div>
            </div>

            {/* COMPACT GLASSMORPHIC SONG CARDS */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
                {filteredSongs.length > 0 ? (
                    <div className="space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3.5">
                        {filteredSongs.map((song) => (
                            <Link
                                key={song.id}
                                href={`/songs/${generateSlug(song.title)}`}
                                className="group relative flex items-center gap-3 sm:gap-3.5 p-2.5 sm:p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] backdrop-blur-xl border border-white/10 hover:border-[#FF5A2E]/40 shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(255,90,46,0.18)] transition-all duration-200 hover:scale-[1.01]"
                            >
                                {/* Compact Square Album Artwork */}
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden relative shrink-0 bg-black/60 border border-white/10 shadow-md">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                        style={{ backgroundImage: `url('${getSongImage(song)}')` }}
                                    />
                                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/0 transition-colors" />

                                    {/* Hover Play Indicator */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
                                        <Play className="w-4 h-4 fill-white text-white translate-x-0.5 drop-shadow" />
                                    </div>
                                </div>

                                {/* Title & Artist & Category Tag */}
                                <div className="flex-1 min-w-0 pr-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[9.5px] uppercase font-black tracking-wider text-amber-300 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                                            {(song.category || categoryName).toUpperCase()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-[#FFB37A] transition-colors truncate">
                                        {song.title}
                                    </h3>
                                    <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors truncate mt-0.5">
                                        {song.artist}
                                    </p>
                                </div>

                                {/* Sleek Diagonal Arrow Indicator */}
                                <div className="p-1.5 shrink-0 text-white/30 group-hover:text-white transition-colors">
                                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center space-y-4">
                        <Music2 className="w-12 h-12 text-white/20 mx-auto" />
                        <p className="text-xl font-bold text-white/40">No songs found in this category yet.</p>
                        <Link
                            href="/songs"
                            className="inline-block px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
                        >
                            Explore All Songs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
