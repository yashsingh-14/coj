import Link from 'next/link';
import { Sparkles, Music2 } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import TiltCard from '@/components/ui/TiltCard';
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

            {/* HERO HEADER */}
            <div className="relative min-h-[28vh] sm:min-h-[35vh] w-full overflow-hidden flex items-end">
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-20`} />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02000F] via-[#02000F]/60 to-transparent" />

                <div className="relative z-10 p-4 sm:p-6 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-4 sm:gap-6 md:items-end justify-between animate-fade-in-up">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-[var(--brand)] font-bold tracking-widest uppercase text-xs mb-1 sm:mb-2">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            <span>Curated Collection</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-2 text-white shadow-xl drop-shadow-lg uppercase">
                            {categoryName}
                        </h1>
                        <p className="text-white/60 font-medium max-w-lg text-sm sm:text-base md:text-lg">
                            Dive into the presence of God with our hand-picked selection of {categoryName} songs.
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

            {/* SONG GRID - CINEMATIC POSTERS */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
                {filteredSongs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                        {filteredSongs.map((song) => (
                            <TiltCard key={song.id} className="min-h-[300px] sm:min-h-[400px]" scale={1.05} max={15}>
                                <div className="relative h-full group">
                                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[var(--brand)] to-purple-600 blur-[30px] opacity-20 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"></div>

                                    <Link
                                        href={`/songs/${generateSlug(song.title)}`}
                                        className="relative flex flex-col justify-end p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2rem] bg-[#0A0A0A] border border-white/10 overflow-hidden h-full group-hover:bg-[#111] transition-colors aspect-[3/4]"
                                    >
                                        {/* Album Art Background (Full Coverage) */}
                                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${getSongImage(song)}')` }}></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                                        {/* Glass Shine */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {/* Content Info */}
                                        <div className="relative z-10 transform-style-3d translate-y-2 sm:translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                                <span className="text-[10px] font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/40 border border-white/20">
                                                    {(song.category || 'Worship').toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white leading-tight mb-1 sm:mb-2 drop-shadow-lg tracking-tight">{song.title}</h3>
                                            <p className="text-xs sm:text-sm text-white/70 font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em]">{song.artist}</p>

                                            {/* Fake Equalizer Line */}
                                            <div className="w-full h-1.5 bg-white/20 rounded-full mt-4 sm:mt-6 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                                <div className="h-full bg-[var(--brand)] w-full animate-loader shadow-[0_0_10px_var(--brand)]"></div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </TiltCard>
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
