'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Heart, Sparkles, Music2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import TiltCard from '@/components/ui/TiltCard';
import { supabase } from '@/lib/supabaseClient';
import { Song } from '@/data/types';

export default function CategoryDetailPage() {
    const params = useParams();
    const slug = typeof params?.slug === 'string' ? params.slug : '';
    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);

    const [songs, setSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Helper to detect Hindi songs (Robust Client-Side Logic)
    // Helper to detect Hindi songs (Robust Client-Side Logic)
    const isHindiSong = (song: Song) => {
        // 1. Check DB field explicit override (if we had a language field, we'd use it here)
        // If DB has explicit "Hindi" content, trust it.
        if (song.hindi_lyrics && song.hindi_lyrics.length > 10) {
            // Heuristic: If it has substantial content in hindi_lyrics, it's likely Hindi.
            // But we need to ensure it's not just " [Translation] "
        }

        const titleLower = song.title.toLowerCase();

        // 2. ABSOLUTE HINDI INDICATOR: Devanagari Script
        const devanagariRegex = /[\u0900-\u097F]/;
        if (devanagariRegex.test(song.title) || (song.hindi_lyrics && devanagariRegex.test(song.hindi_lyrics))) return true;

        // 3. STRONG ENGLISH INDICATORS (Overrides ambiguous Hindi matches)
        // If title contains these common English words, assume it's English unless Devanagari is present.
        const englishRegex = /\b(the|lord|god|jesus|holy|spirit|love|grace|light|heart|soul|king|father|savior|worship|praise|glory|above|oceans|feet|fail|where|hills|song|your|my|our|you|me|i|am|who|what|when|how)\b/i;

        if (titleLower.includes('oceans') || englishRegex.test(titleLower)) return false;

        // 4. HINDI INDICATORS (Regex)
        // Only match if NOT flagged as English above.
        const hindiRegex = /\b(dhanyawad|yeshu|masih|tera|teri|khuda|aradhana|aaradhana|stuti|saath|pavitra|atma|gaye|krupa|prarthana|mahima|raja|prabhu|tu|mere|meri|hai|pyar|pyaar|zindagi|chahu|dil|mukti|data|sagar|vachan|naam|sarvashaktiman|el shaddai|yahowa|juda|masiha|khudawand|rehem|fazal|shanti|aanand|jivan|jeevan|marg|satya|vijay|lahu|krus|paap|maafi|uddhar|swarg|dharti|asman|rooh|pak|pavan|senaon|samarth|binti|sun|anugrah|bharosa)\b/i;

        if (hindiRegex.test(titleLower)) return true;

        return false;
    };

    useEffect(() => {
        const fetchCategorySongs = async () => {
            setIsLoading(true);

            // 1. Fetch ALL songs (Client-side filtering is safer for mixed data)
            const { data, error } = await supabase.from('songs').select('*');

            if (data) {
                let filteredSongs = data;

                // Determine Target Category & Language
                let languageFilter: 'hindi' | 'english' | null = null;
                let targetCategory = slug;

                if (slug && typeof slug === 'string' && (slug.includes('hindi-') || slug.includes('english-'))) {
                    const [lang, ...catParts] = slug.toLowerCase().split('-');
                    languageFilter = lang as 'hindi' | 'english';
                    targetCategory = catParts.join('-');
                }

                console.log('Filtering:', { slug, targetCategory, languageFilter, total: data.length });

                // 2. Filter by Category (Soft Match - Bidirectional & Grouped)
                if (targetCategory !== 'all') {
                    filteredSongs = filteredSongs.filter(song => {
                        const songCat = song.category.toLowerCase();

                        // Check direct match first
                        if (songCat.includes(targetCategory) || targetCategory.includes(songCat)) return true;

                        // Check Groups (Worship/Praise overlap)
                        const worshipKeywords = ['worship', 'praise', 'stuti', 'aradhana', 'adoration'];
                        const isWorshipTarget = worshipKeywords.some(k => targetCategory.includes(k));
                        const isWorshipSong = worshipKeywords.some(k => songCat.includes(k));

                        if (isWorshipTarget && isWorshipSong) return true;

                        return false;
                    });
                }

                // 3. Filter by Language (Robust)
                if (languageFilter === 'hindi') {
                    filteredSongs = filteredSongs.filter(song => isHindiSong(song));
                } else if (languageFilter === 'english') {
                    filteredSongs = filteredSongs.filter(song => !isHindiSong(song));
                }

                console.log(`Filtered [${slug}]: ${filteredSongs.length} songs`);
                setSongs(filteredSongs);
            }
            setIsLoading(false);
        };

        if (slug) {
            fetchCategorySongs();
        }
    }, [slug]);

    // Dynamic background based on category (mock logic)
    const getGradient = () => {
        // Handle specific slugs
        if (slug.includes('english-praise')) return 'from-orange-400 via-red-500 to-red-600';
        if (slug.includes('hindi-praise')) return 'from-yellow-400 via-orange-500 to-red-500';
        if (slug.includes('english-worship')) return 'from-purple-600 via-indigo-600 to-blue-600';
        if (slug.includes('hindi-worship')) return 'from-blue-500 via-cyan-500 to-teal-500';

        switch (slug) {
            case 'praise': return 'from-yellow-400 via-orange-500 to-red-500';
            case 'worship': return 'from-purple-600 via-indigo-600 to-blue-600';
            case 'kids': return 'from-green-400 via-teal-500 to-cyan-500';
            case 'hindi': return 'from-orange-500 via-red-600 to-yellow-500';
            case 'hymns': return 'from-indigo-400 via-blue-500 to-cyan-500';
            default: return 'from-[var(--brand)] via-pink-600 to-purple-600';
        }
    };

    // Helper to resolve song image with fallbacks
    const getSongImage = (song: Song) => {
        // 1. YouTube Thumbnail Priority
        const yId = song.youtube_id || (song as any).youtubeId;
        if (yId && yId.trim().length > 5 && yId !== "null" && yId !== "undefined") {
            return `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
        }

        // 2. Custom Image
        if (song.img && song.img.trim().length > 5 && song.img !== "null" && song.img !== "undefined") {
            return song.img;
        }

        // 3. Fallback
        return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80";
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white font-sans pb-32 overflow-x-hidden selection:bg-[var(--brand)] selection:text-white">

            {/* HERO HEADER */}
            <div className="relative h-[40vh] w-full overflow-hidden flex items-end">
                <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-20`} />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02000F] via-[#02000F]/60 to-transparent" />

                <div className="relative z-10 p-6 w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6 md:items-end justify-between animate-fade-in-up">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 text-[var(--brand)] font-bold tracking-widest uppercase text-xs mb-2">
                            <Sparkles className="w-4 h-4 animate-pulse" />
                            <span>Curated Collection</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-2 text-white shadow-xl drop-shadow-lg uppercase">
                            {categoryName}
                        </h1>
                        <p className="text-white/60 font-medium max-w-lg text-lg">
                            Dive into the presence of God with our hand-picked selection of {slug} songs.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        {/* Play All removed */}
                    </div>
                </div>
            </div>

            {/* NAVIGATION BAR */}
            <div className="sticky top-0 z-30 bg-[#02000F]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-medium group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                    <span className="text-xs font-bold text-white/30 uppercase tracking-widest">{songs.length} Tracks</span>
                </div>
            </div>

            {/* SONG GRID - CINEMATIC POSTERS */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-white/10 border-t-[var(--brand)] rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {songs.map((song, i) => (
                            <TiltCard key={i} className="min-h-[400px]" scale={1.05} max={15}>
                                <div className="relative h-full group">
                                    {/* HIGH VOLTAGE BLOW EFFECT 
                                    - Matches Home Page intensity
                                    - Blur 30px
                                    - Opacity 100 on hover
                                */}
                                    <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[var(--brand)] to-purple-600 blur-[30px] opacity-20 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"></div>

                                    <Link
                                        href={`/songs/${song.id}`}
                                        className="relative flex flex-col justify-end p-8 rounded-[2rem] bg-[#0A0A0A] border border-white/10 overflow-hidden h-full group-hover:bg-[#111] transition-colors aspect-[3/4]"
                                    >
                                        {/* Album Art Background (Full Coverage) */}
                                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${getSongImage(song)}')` }}></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                                        {/* Glass Shine */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {/* Glass Shine */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {/* Floating Play Overlay - REMOVED */}

                                        {/* Content Info */}

                                        {/* Content Info */}
                                        <div className="relative z-10 transform-style-3d translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/40 border border-white/20">
                                                    {song.category.toUpperCase()}
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-white/50"></div>
                                                <span className="text-[10px] font-bold text-white/70 tracking-widest flex items-center gap-1">
                                                    {/* Removed duration */}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-4xl text-white leading-[0.9] mb-2 drop-shadow-lg tracking-tight">{song.title}</h3>
                                            <p className="text-sm text-white/70 font-bold uppercase tracking-[0.2em]">{song.artist}</p>

                                            {/* Fake Equalizer Line */}
                                            <div className="w-full h-1.5 bg-white/20 rounded-full mt-6 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                                <div className="h-full bg-[var(--brand)] w-full animate-loader shadow-[0_0_10px_var(--brand)]"></div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </TiltCard>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
