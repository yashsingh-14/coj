'use client';

import { useState, Fragment, useEffect, useRef } from 'react';
import { transposeChord } from '@/lib/music';
import {
    Heart,
    Minus,
    Play,
    Plus,
    Loader2,
    X,
    Pause,
    Music,
    FileText,
    Languages,
    Layers,
    SlidersHorizontal,
    Copy,
    Check,
    RotateCcw,
    Video,
    Sparkles,
    ArrowRight,
    ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/ui/BackButton';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { ShareButton } from './ShareButton';
import { PrintButton } from './PrintButton';
import { extractYoutubeId } from '@/lib/utils';
import GoldenSparkleReveal from '@/components/ui/GoldenSparkleReveal';

interface SongViewerProps {
    songId: string;
    title: string;
    author: string;
    originalKey: string;
    lyrics: string;
    hindiLyrics?: string;
    chords?: string;
    youtubeId?: string;
    category?: string;
    tempo?: string;
    relatedSongs?: {
        id?: string;
        title: string;
        slug: string;
        artist: string;
        category?: string;
        originalKey?: string;
        tempo?: string;
        coverImage?: string;
        youtubeId?: string;
    }[];
    coverImage?: string;
}

type ViewTab = 'chords' | 'lyrics' | 'hindi' | 'all';

export default function SongViewer({
    songId,
    title,
    author,
    originalKey,
    lyrics,
    hindiLyrics,
    chords,
    youtubeId,
    category,
    tempo,
    relatedSongs,
    coverImage
}: SongViewerProps) {
    const currentUser = useAppStore(state => state.currentUser);
    const [transpose, setTranspose] = useState(0);
    // Compact default font size: 15px (clean, perfectly legible, minimal vertical height)
    const [fontSize, setFontSize] = useState(15);
    const [useFlats] = useState(false);
    const [isFavourite, setIsFavourite] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            try {
                return localStorage.getItem(`coj_fav_${songId}`) === 'true';
            } catch {
                return false;
            }
        }
        return false;
    });
    const [showVideo, setShowVideo] = useState(false);
    const [copied, setCopied] = useState(false);

    // Active View Tab: Chords > Hinglish Lyrics > Hindi Lyrics
    const [activeTab, setActiveTab] = useState<ViewTab>(() => {
        if (chords && chords.trim().length > 0) return 'chords';
        if (lyrics && lyrics.trim().length > 0) return 'lyrics';
        if (hindiLyrics && hindiLyrics.trim().length > 0) return 'hindi';
        return 'lyrics';
    });

    // Auto-scroll state
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(1); // 1 = slow, 2 = medium, 3 = fast
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Modal State
    const [isAddToSetOpen, setIsAddToSetOpen] = useState(false);
    const [mySets, setMySets] = useState<{ id: string, title: string, event_date: string }[]>([]);
    const [isLoadingSets, setIsLoadingSets] = useState(false);

    // Background Sync State (non-blocking)
    const [isSavingFav, setIsSavingFav] = useState(false);

    // Auto-scroll effect
    useEffect(() => {
        if (isAutoScrolling) {
            const speedMap = { 1: 1, 2: 2, 3: 3 };
            const speed = speedMap[scrollSpeed as keyof typeof speedMap] || 1;

            scrollIntervalRef.current = setInterval(() => {
                window.scrollBy(0, speed);
            }, 50);
        } else {
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
            }
        }

        return () => {
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
            }
        };
    }, [isAutoScrolling, scrollSpeed]);

    // Silent Background Check on Mount & when songId or currentUser changes
    useEffect(() => {
        let isMounted = true;

        async function checkStatus() {
            if (!currentUser) {
                if (isMounted) {
                    try {
                        const localVal = localStorage.getItem(`coj_fav_${songId}`) === 'true';
                        setIsFavourite(localVal);
                    } catch {
                        // ignore
                    }
                }
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('favourites')
                    .select('id')
                    .eq('user_id', currentUser.id)
                    .eq('song_id', songId)
                    .maybeSingle();

                if (!error && isMounted) {
                    const isFav = !!data;
                    setIsFavourite(isFav);
                    try {
                        localStorage.setItem(`coj_fav_${songId}`, String(isFav));
                    } catch {
                        // ignore
                    }
                }
            } catch (err) {
                console.warn('Favourite background check fallback:', err);
            }
        }

        checkStatus();
        return () => { isMounted = false; };
    }, [currentUser, songId]);

    const handleToggleFavourite = async () => {
        // Instant Optimistic Toggle
        const previousState = isFavourite;
        const newState = !previousState;
        setIsFavourite(newState);
        try {
            localStorage.setItem(`coj_fav_${songId}`, String(newState));
        } catch {
            // ignore
        }

        if (!currentUser) {
            toast.success(newState ? "Saved to favourites!" : "Removed from favourites");
            return;
        }

        setIsSavingFav(true);
        try {
            if (previousState) {
                const { error } = await supabase
                    .from('favourites')
                    .delete()
                    .eq('user_id', currentUser.id)
                    .eq('song_id', songId);

                if (error) throw error;
                toast.success("Removed from favourites");
            } else {
                const { error } = await supabase
                    .from('favourites')
                    .insert({
                        user_id: currentUser.id,
                        song_id: songId
                    });

                if (error) throw error;
                toast.success("Added to favourites");
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error("Toggle favourite error:", error);
            setIsFavourite(previousState);
            try {
                localStorage.setItem(`coj_fav_${songId}`, String(previousState));
            } catch {
                // ignore
            }
            toast.error(error?.message || "Action failed");
        } finally {
            setIsSavingFav(false);
        }
    };

    // Derived State
    const currentKey = transposeChord(originalKey, transpose, useFlats);

    // Fetch Sets when modal opens
    const handleOpenAddToSet = async () => {
        if (!currentUser) {
            toast.error("Please login to create sets");
            return;
        }
        setIsAddToSetOpen(true);
        if (mySets.length > 0) return;

        setIsLoadingSets(true);
        try {
            const { data, error } = await supabase
                .from('sets')
                .select('id, title, event_date')
                .eq('created_by', currentUser.id)
                .order('event_date', { ascending: false });

            if (error) throw error;
            setMySets(data || []);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error("Failed to load your sets");
        } finally {
            setIsLoadingSets(false);
        }
    };

    const handleAddToSet = async (setId: string, setTitle: string) => {
        try {
            const { count } = await supabase
                .from('set_songs')
                .select('*', { count: 'exact', head: true })
                .eq('set_id', setId);

            const nextOrder = (count || 0) + 1;

            const { error } = await supabase
                .from('set_songs')
                .insert({
                    set_id: setId,
                    song_id: songId,
                    order_index: nextOrder,
                    key_override: currentKey !== originalKey ? currentKey : null
                });

            if (error) throw error;

            toast.success(`Added to ${setTitle}`);
            setIsAddToSetOpen(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to add song to set");
        }
    };

    // Helper: Validate if a string is likely a musical chord
    const isValidChord = (str: string) => {
        const cleanStr = str.replace(/[^A-Za-z0-9#\/+\-()]/g, '');
        const invalidWords = new Set(['Go', 'Do', 'An', 'As', 'At', 'Be', 'By', 'In', 'Is', 'It', 'Of', 'On', 'Or', 'So', 'To', 'Up', 'Us', 'We', 'My', 'He', 'Hi', 'No']);
        if (invalidWords.has(cleanStr)) return false;

        return /^[A-G][#b]?([0-9]|m|min|maj|dim|aug|sus|add|M|o|\+|b|#|\-|\(|\))*(\/[A-G][#b]?)?$/.test(cleanStr);
    };

    // Exportable plain text for clipboard (includes transposition if on Chords tab)
    const getExportableText = () => {
        if (activeTab === 'lyrics') {
            return lyrics ? `${title} - ${author}\n\n${lyrics}` : '';
        }
        if (activeTab === 'hindi') {
            return (hindiLyrics || lyrics) ? `${title} - ${author}\n\n${hindiLyrics || lyrics}` : '';
        }
        if (activeTab === 'chords') {
            if (!chords) return lyrics ? `${title} - ${author}\n\n${lyrics}` : '';
            let transposedContent = chords;
            if (transpose !== 0) {
                transposedContent = chords.replace(/\[([A-G][#b]?[^\]]*)\]/g, (match, chord) => {
                    const isChord = isValidChord(chord);
                    return isChord ? `[${transposeChord(chord, transpose, useFlats)}]` : match;
                });
            }
            return `${title} - ${author}\nKey: ${currentKey} (Original: ${originalKey})\n\n${transposedContent}`;
        }
        if (activeTab === 'all') {
            let text = `${title} - ${author}\nKey: ${currentKey} (Original: ${originalKey})\n\n`;
            if (chords) {
                let trChords = chords;
                if (transpose !== 0) {
                    trChords = chords.replace(/\[([A-G][#b]?[^\]]*)\]/g, (match, chord) => {
                        const isChord = isValidChord(chord);
                        return isChord ? `[${transposeChord(chord, transpose, useFlats)}]` : match;
                    });
                }
                text += `--- CHORDS & LYRICS ---\n${trChords}\n\n`;
            }
            if (lyrics) text += `--- HINGLISH LYRICS ---\n${lyrics}\n\n`;
            if (hindiLyrics) text += `--- HINDI LYRICS (देवनागरी) ---\n${hindiLyrics}\n`;
            return text;
        }
        return lyrics ? `${title} - ${author}\n\n${lyrics}` : '';
    };

    const handleCopy = async () => {
        try {
            const textToCopy = getExportableText();
            if (!textToCopy || textToCopy.trim().length === 0) {
                toast.error("Nothing to copy");
                return;
            }
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            const label = activeTab === 'chords' ? 'Chords & lyrics' : activeTab === 'hindi' ? 'Hindi lyrics' : activeTab === 'all' ? 'All content' : 'Lyrics';
            toast.success(`${label} copied to clipboard!`);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Clipboard copy failed:', err);
            toast.error("Failed to copy to clipboard");
        }
    };

    // COMPACT Render Logic for Hinglish Lyrics
    const renderLyrics = () => {
        if (!lyrics) return <p className="text-white/40 text-sm italic">No lyrics available.</p>;
        return lyrics.split('\n').map((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) {
                return <div key={index} className="h-2 sm:h-2.5" />;
            }

            // Check if section header (e.g. [Verse 1], Chorus, [Chorus])
            const isHeader = /^\[.*\]$/.test(trimmed) || /^(?:\[)?(Intro|Verse|Chorus|Bridge|Pre-Chorus|PreChorus|Outro|Interlude|Ending|Instrumental)(?:[\s\d:]*)?(?:\])?$/i.test(trimmed);
            if (isHeader) {
                return (
                    <div key={index} className="mt-3.5 mb-1.5 first:mt-0">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 rounded shadow-sm inline-block">
                            {trimmed.replace(/[\[\]:]/g, '').trim()}
                        </span>
                    </div>
                );
            }

            return (
                <p
                    key={index}
                    className="mb-1 sm:mb-1.5 leading-normal sm:leading-relaxed text-white/90 whitespace-pre-wrap font-medium tracking-normal break-words"
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {line}
                </p>
            );
        });
    };

    // COMPACT Render Logic for Hindi Lyrics (Devanagari)
    const renderHindiLyrics = () => {
        if (!hindiLyrics) return <p className="text-white/40 text-sm italic">No Hindi lyrics available.</p>;
        return hindiLyrics.split('\n').map((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) {
                return <div key={index} className="h-2 sm:h-2.5" />;
            }

            // Check if section header
            const isHeader = /^\[.*\]$/.test(trimmed) || /^(?:\[)?(Intro|Verse|Chorus|Bridge|Pre-Chorus|PreChorus|Outro|Interlude|Ending|Instrumental)(?:[\s\d:]*)?(?:\])?$/i.test(trimmed);
            if (isHeader) {
                return (
                    <div key={index} className="mt-3.5 mb-1.5 first:mt-0 font-sans">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 rounded shadow-sm inline-block">
                            {trimmed.replace(/[\[\]:]/g, '').trim()}
                        </span>
                    </div>
                );
            }

            return (
                <p
                    key={index}
                    className="mb-1 sm:mb-1.5 leading-relaxed text-white/90 whitespace-pre-wrap font-serif tracking-normal break-words"
                    style={{ fontSize: `${fontSize + 1}px` }}
                >
                    {line}
                </p>
            );
        });
    };

    // COMPACT Render Logic for Chords (ChordPro)
    const renderChords = () => {
        if (!chords) return <p className="text-white/40 text-sm italic">No chords available for this song.</p>;
        return chords.split('\n').map((line, lineIndex) => {
            const trimmed = line.trim();
            if (!trimmed) {
                return <div key={lineIndex} className="h-2 sm:h-2.5" />;
            }

            // Section headers: [Chorus], Chorus, Verse 1, [Verse 1], etc.
            const headerMatch = trimmed.match(/^(?:\[)?(Intro|Verse|Chorus|Bridge|Pre-Chorus|PreChorus|Outro|Interlude|Ending|Instrumental)(?:[\s\d:]*)?(?:\])?$/i) || trimmed.match(/^\[.*\]$/);
            if (headerMatch) {
                return (
                    <div key={lineIndex} className="mt-4 mb-2 first:mt-0">
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 rounded shadow-sm inline-block">
                            {trimmed.replace(/[\[\]:]/g, '').trim()}
                        </span>
                    </div>
                );
            }

            const parts = line.split(/(\[.*?\])/g);
            const segments: { text: string, chord: string | null }[] = [];

            if (!parts[0].startsWith('[')) {
                segments.push({ text: parts[0], chord: null });
            }

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part.startsWith('[') && part.endsWith(']')) {
                    const chordName = part.slice(1, -1);
                    const textUnder = parts[i + 1] && !parts[i + 1].startsWith('[') ? parts[i + 1] : "";
                    segments.push({ text: textUnder, chord: chordName });
                }
            }

            return (
                <div key={lineIndex} className="flex flex-wrap items-end mb-2 sm:mb-2.5 w-full">
                    {segments.map((seg, idx) => {
                        const isChord = seg.chord ? isValidChord(seg.chord) : false;
                        const transposedChord = (seg.chord && isChord) ? transposeChord(seg.chord, transpose, useFlats) : null;

                        let displayText = seg.text || "";
                        if (!isChord && seg.chord) {
                            displayText = `${seg.chord} ` + displayText;
                        }

                        const leadingSpaceMatch = displayText.match(/^(\s+)(.*)/);
                        const leadingSpace = leadingSpaceMatch ? leadingSpaceMatch[1] : "";
                        const mainText = leadingSpaceMatch ? leadingSpaceMatch[2] : displayText;
                        const tokens = mainText.split(/(\s+)/);

                        return (
                            <Fragment key={idx}>
                                {leadingSpace && <span className="whitespace-pre font-medium" style={{ fontSize: `${fontSize}px` }}>{leadingSpace}</span>}

                                {isChord ? (
                                    <div className={`flex flex-col group ${mainText.trim().length > 0 ? 'mr-0' : 'mr-2 sm:mr-2.5'}`}>
                                        <div className="h-4 sm:h-5 mb-0.5">
                                            {transposedChord ? (
                                                <span className="text-amber-400 font-bold font-mono text-xs sm:text-sm block whitespace-nowrap leading-none drop-shadow-sm">
                                                    {transposedChord}
                                                </span>
                                            ) : null}
                                        </div>
                                        <span
                                            className="text-white/90 whitespace-pre font-medium leading-tight block min-h-[1em]"
                                            style={{ fontSize: `${fontSize}px` }}
                                        >
                                            {mainText || (mainText.trim().length > 0 ? "\u00A0" : "")}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-end">
                                        {tokens.map((token, tIdx) => {
                                            const isTokenChord = isValidChord(token.trim());
                                            const tokenTransposed = isTokenChord ? transposeChord(token.trim(), transpose, useFlats) : null;

                                            if (isTokenChord && tokenTransposed) {
                                                return (
                                                    <div key={tIdx} className="flex flex-col mr-2 relative top-[-0.2rem]">
                                                        <span className="text-amber-400 font-bold font-mono text-xs sm:text-sm block whitespace-nowrap bg-[#050505]/90 px-1 rounded border border-neutral-800 leading-none">
                                                            {tokenTransposed}
                                                        </span>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <span
                                                        key={tIdx}
                                                        className="text-white/90 whitespace-pre font-medium leading-tight block min-h-[1em]"
                                                        style={{ fontSize: `${fontSize}px` }}
                                                    >
                                                        {token}
                                                    </span>
                                                );
                                            }
                                        })}
                                    </div>
                                )}
                            </Fragment>
                        );
                    })}
                </div>
            );
        });
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[var(--brand)] selection:text-white pb-32 md:pb-40">

            {/* 1. CINEMATIC RESPONSIVE HERO POSTER (Tailored height & styling for all screen sizes) */}
            <div className="relative w-full overflow-hidden border-b border-white/10 min-h-[190px] sm:min-h-[240px] md:min-h-[290px] lg:min-h-[340px] flex flex-col justify-between py-5 sm:py-7 md:py-9 lg:py-12 group">
                {/* Background Artwork with Vibrant Presence & Smooth Hover Micro-zoom */}
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-70 sm:opacity-80 scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
                    style={{
                        backgroundImage: (coverImage && !coverImage.includes('images.unsplash.com'))
                            ? `url('${coverImage}')`
                            : youtubeId
                                ? `url('https://img.youtube.com/vi/${extractYoutubeId(youtubeId)}/hqdefault.jpg')`
                                : coverImage
                                    ? `url('${coverImage}')`
                                    : "url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop')"
                    }}
                />

                {/* Layered Cinematic Atmosphere Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/75 to-[#050505]/30 z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/95 via-[#050505]/65 to-transparent z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,90,46,0.22)_0%,rgba(245,158,11,0.12)_35%,transparent_70%)] z-10 pointer-events-none" />

                {/* Top Nav & Tag Pill Row */}
                <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <BackButton
                            fallback="/worship"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 hover:border-white/30 text-white/90 hover:text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95"
                            iconClassName="w-3.5 h-3.5"
                        >
                            <span>Back</span>
                        </BackButton>

                        {/* Badges / Actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {category && (
                                <span className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 uppercase tracking-wider text-[10px] sm:text-[11px] font-black text-amber-300 backdrop-blur-md shadow-sm">
                                    {category}
                                </span>
                            )}
                            {tempo && (
                                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-semibold text-white/70 backdrop-blur-md">
                                    {tempo}
                                </span>
                            )}
                            {youtubeId && (
                                <button
                                    type="button"
                                    onClick={() => setShowVideo(!showVideo)}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all border backdrop-blur-md shadow-sm ${
                                        showVideo
                                            ? 'bg-red-500/25 border-red-500/60 text-red-200'
                                            : 'bg-black/50 border-white/15 text-white/80 hover:bg-white/15 hover:text-white'
                                    }`}
                                    title="Toggle YouTube Video Player"
                                >
                                    <Video className="w-3.5 h-3.5 text-red-400" />
                                    <span>{showVideo ? 'Hide Video' : 'Watch Video'}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Hero Title & Metadata Area */}
                <div className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-8 mt-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-6">
                        <div className="space-y-1 sm:space-y-2 max-w-3xl">
                            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] leading-[1.1]">
                                {title}
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg text-[#FFB37A] font-medium tracking-wide flex items-center gap-2">
                                <span className="opacity-70 font-normal">by</span>
                                <span className="font-semibold text-[#FFD7A8] drop-shadow">{author || 'Call of Jesus Worship'}</span>
                            </p>
                        </div>

                        {/* Key badges with frosted glass styling */}
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm self-start md:self-end bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shrink-0">
                            <span className="text-white/60">Orig: <strong className="text-white font-mono bg-white/10 px-1.5 py-0.5 rounded ml-0.5">{originalKey}</strong></span>
                            {chords && (
                                <>
                                    <span className="text-white/20">|</span>
                                    <span className="text-white/60">Current: <strong className="text-amber-400 font-mono bg-amber-400/15 px-1.5 py-0.5 rounded ml-0.5 border border-amber-400/30">{currentKey}</strong></span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. STICKY ACTION & TRANSPOSE BAR (PINNED TO VIEWPORT - TRANSPOSE RIGHT IN FRONT!) */}
            <div className="sticky top-0 z-30 bg-[#080808]/95 backdrop-blur-xl border-b border-white/10 py-1.5 sm:py-2 px-3 sm:px-6 shadow-2xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
                    
                    {/* TRANSPOSE CONTROLLER (DIRECTLY IN FRONT - ZERO SEARCHING REQUIRED) */}
                    {chords ? (
                        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-xl p-0.5 sm:p-1 shadow-inner">
                            <button
                                type="button"
                                onClick={() => setTranspose(t => t - 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80 hover:text-white active:scale-90 transition-all border border-white/5"
                                title="Transpose Down (-1 semitone)"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setTranspose(0)}
                                className="px-2 sm:px-2.5 py-0.5 flex flex-col items-center justify-center hover:bg-white/5 rounded-lg transition-colors group cursor-pointer"
                                title={transpose !== 0 ? "Click to reset to original key" : `Original Key: ${originalKey}`}
                            >
                                <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-0.5 leading-none">
                                    Key
                                    {transpose !== 0 && <RotateCcw className="w-2.5 h-2.5 text-amber-400 opacity-70 group-hover:opacity-100" />}
                                </span>
                                <span className="text-xs sm:text-sm font-black text-amber-400 font-mono tracking-wide flex items-center gap-0.5 leading-tight">
                                    {currentKey}
                                    {transpose !== 0 && (
                                        <span className="text-[10px] font-sans font-medium text-amber-300/80">
                                            ({transpose > 0 ? `+${transpose}` : transpose})
                                        </span>
                                    )}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTranspose(t => t + 1)}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80 hover:text-white active:scale-90 transition-all border border-white/5"
                                title="Transpose Up (+1 semitone)"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-xs font-bold text-white/60">
                            <span className="text-white/40 uppercase text-[10px]">Key:</span>
                            <span className="text-amber-400 font-mono">{originalKey}</span>
                        </div>
                    )}

                    {/* ACTION BUTTONS (COPY, SAVE, ADD TO SET, SHARE, PRINT) */}
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
                        
                        {/* 1-CLICK COPY BUTTON */}
                        <button
                            type="button"
                            onClick={handleCopy}
                            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border ${
                                copied
                                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/20'
                                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-amber-400/30'
                            }`}
                            title="Copy current tab lyrics / chords to clipboard"
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                            <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleOpenAddToSet}
                            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border bg-white/5 border-white/10 text-white hover:bg-white/10"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Set</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleToggleFavourite}
                            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all border active:scale-95 cursor-pointer ${
                                isFavourite
                                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm shadow-rose-500/20'
                                    : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                            }`}
                            title={isFavourite ? "Saved to favourites" : "Save to favourites"}
                        >
                            <Heart className={`w-3.5 h-3.5 transition-transform ${isFavourite ? 'fill-rose-500 text-rose-500 scale-105' : 'text-white/80'}`} />
                            <span className="hidden sm:inline">{isFavourite ? 'Saved' : 'Save'}</span>
                        </button>

                        {/* Share Button */}
                        <ShareButton song={{ id: songId, title, artist: author }} />

                        {/* Print Button */}
                        <PrintButton song={{ title, artist: author, key: originalKey, tempo, chords, lyrics }} />
                    </div>
                </div>
            </div>

            {/* EXPANDABLE VIDEO ON MOBILE / COLLAPSIBLE ANYWHERE */}
            {youtubeId && showVideo && (
                <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 animate-fade-in-up">
                    <div className="rounded-xl overflow-hidden aspect-video shadow-2xl bg-black border border-white/10 relative max-w-2xl mx-auto">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                            title="YouTube Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>
            )}

            {/* 3. MAIN CONTENT (Split Layout) */}
            <div className="max-w-7xl mx-auto px-2.5 sm:px-4 md:px-6 py-2.5 sm:py-4 md:py-6 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 relative">

                {/* LEFT COLUMN: SONG CONTENT & TABS */}
                <div className="lg:col-span-7 space-y-3">

                    {/* CONTENT CONTAINER WITH TABS & CONTROLS */}
                    <div className="bg-[#0C0C0C]/90 border border-white/10 rounded-2xl p-3 sm:p-5 md:p-6 shadow-2xl">
                        
                        {/* TAB BAR, FONT CONTROLS, & AUTO-SCROLL */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5 mb-3.5">
                            
                            {/* View Switcher Tabs */}
                            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                                {chords && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('chords')}
                                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            activeTab === 'chords'
                                                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <Music className="w-3.5 h-3.5" />
                                        <span>Chords</span>
                                    </button>
                                )}
                                {lyrics && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('lyrics')}
                                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            activeTab === 'lyrics'
                                                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>Hinglish</span>
                                    </button>
                                )}
                                {hindiLyrics && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('hindi')}
                                        className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                            activeTab === 'hindi'
                                                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                                : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        <Languages className="w-3.5 h-3.5" />
                                        <span>हिन्दी</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('all')}
                                    className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                        activeTab === 'all'
                                            ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                            : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                                    }`}
                                    title="Show all versions"
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>All</span>
                                </button>
                            </div>

                            {/* Right-aligned Toolbar Controls: Font Size & Auto-Scroll */}
                            <div className="flex items-center gap-1.5">
                                
                                {/* Quick Auto-Scroll Toggle */}
                                {chords && (
                                    <button
                                        type="button"
                                        onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                                        className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                                            isAutoScrolling
                                                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                                                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                                        }`}
                                        title={isAutoScrolling ? 'Pause Auto-Scroll' : 'Start Auto-Scroll'}
                                    >
                                        {isAutoScrolling ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                                        <span className="hidden sm:inline">{isAutoScrolling ? 'Stop' : 'Scroll'}</span>
                                    </button>
                                )}

                                {/* Font Size Adjusters */}
                                <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 border border-white/5 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => setFontSize(s => Math.max(12, s - 1))}
                                        className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 font-bold text-xs"
                                        title="Smaller text"
                                    >
                                        A-
                                    </button>
                                    <span className="text-[11px] font-mono text-amber-400 font-bold px-1">{fontSize}px</span>
                                    <button
                                        type="button"
                                        onClick={() => setFontSize(s => Math.min(22, s + 1))}
                                        className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 font-bold text-xs"
                                        title="Larger text"
                                    >
                                        A+
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ACTIVE TAB CONTENT */}
                        {activeTab === 'chords' && (
                            <div className="overflow-x-auto pb-2">
                                {renderChords()}
                            </div>
                        )}

                        {activeTab === 'lyrics' && (
                            <div>
                                {renderLyrics()}
                            </div>
                        )}

                        {activeTab === 'hindi' && (
                            <div>
                                {renderHindiLyrics()}
                            </div>
                        )}

                        {activeTab === 'all' && (
                            <div className="space-y-5">
                                {chords && (
                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 border-b border-white/10 pb-1">
                                            Chords & Lyrics
                                        </h3>
                                        <div className="overflow-x-auto pb-2">
                                            {renderChords()}
                                        </div>
                                    </section>
                                )}

                                {lyrics && (
                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 border-b border-white/10 pb-1">
                                            Hinglish Lyrics
                                        </h3>
                                        <div>
                                            {renderLyrics()}
                                        </div>
                                    </section>
                                )}

                                {hindiLyrics && (
                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 border-b border-white/10 pb-1">
                                            Hindi Lyrics (देवनागरी)
                                        </h3>
                                        <div>
                                            {renderHindiLyrics()}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: VIDEO PLAYER & TOOLS */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="lg:sticky lg:top-16 space-y-3.5">
                        
                        {/* Video Player Box (Docked on desktop) */}
                        {youtubeId && !showVideo && (
                            <div className="rounded-2xl overflow-hidden aspect-video shadow-xl bg-black border border-white/10 relative group hidden lg:block">
                                <div
                                    className="absolute inset-0 flex flex-col items-center justify-center bg-cover bg-center cursor-pointer"
                                    style={{
                                        backgroundImage: `url('https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg')`
                                    }}
                                    onClick={() => setShowVideo(true)}
                                >
                                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
                                    <button
                                        type="button"
                                        className="w-13 h-13 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform relative z-10"
                                        title="Watch Video"
                                    >
                                        <Play className="w-5 h-5 fill-black ml-0.5" />
                                    </button>
                                    <span className="relative z-10 mt-2 text-xs font-bold uppercase tracking-wider text-white/90">
                                        Watch Official Video
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Quick Transpose & Auto-Scroll Desktop Sidebar Tools */}
                        {chords && (
                            <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 hidden lg:block">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                                        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                                        Key Transpose
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-amber-400 font-mono">
                                            {currentKey} ({transpose > 0 ? `+${transpose}` : transpose})
                                        </span>
                                        {transpose !== 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setTranspose(0)}
                                                className="text-[10px] text-white/50 hover:text-white underline ml-1"
                                                title="Reset to original key"
                                            >
                                                Reset
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTranspose(t => t - 1)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-white/80"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                        <span>Key -1</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTranspose(t => t + 1)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-white/80"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Key +1</span>
                                    </button>
                                </div>

                                {/* Auto-Scroll */}
                                <div className="border-t border-white/5 pt-2.5 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Auto-Scroll</span>
                                        <button
                                            type="button"
                                            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                                            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-all ${
                                                isAutoScrolling
                                                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                                            }`}
                                        >
                                            {isAutoScrolling ? <><Pause className="w-3 h-3 fill-current" /> Stop</> : <><Play className="w-3 h-3 fill-current" /> Scroll</>}
                                        </button>
                                    </div>

                                    {/* Speed selector */}
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {[1, 2, 3].map((speed) => (
                                            <button
                                                key={speed}
                                                type="button"
                                                onClick={() => setScrollSpeed(speed)}
                                                className={`py-1 rounded text-[11px] font-bold transition-all ${
                                                    scrollSpeed === speed
                                                        ? 'bg-white/20 text-white font-black'
                                                        : 'bg-white/5 text-white/40 hover:text-white/60'
                                                }`}
                                            >
                                                {speed === 1 ? '1x Slow' : speed === 2 ? '2x Med' : '3x Fast'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FLOATING AUTO-SCROLL BUTTON */}
            {chords && (
                <div className="fixed bottom-24 sm:bottom-28 right-4 z-40">
                    <button
                        type="button"
                        onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full shadow-2xl flex items-center justify-center transition-all ${
                            isAutoScrolling
                                ? 'bg-amber-500 text-black shadow-amber-500/40 ring-4 ring-amber-500/20'
                                : 'bg-[#1A1A1A] text-white/80 hover:bg-[#252525] border border-white/10'
                        }`}
                        title={isAutoScrolling ? 'Pause Auto-Scroll' : 'Start Auto-Scroll'}
                    >
                        {isAutoScrolling ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                </div>
            )}

            {/* ADD TO SET MODAL */}
            {isAddToSetOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddToSetOpen(false)} />
                    <div className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl animate-fade-in-up">
                        <button
                            type="button"
                            onClick={() => setIsAddToSetOpen(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold mb-1">Add to Set</h2>
                        <p className="text-white/40 text-xs mb-4">Choose a set to add <span className="text-white font-bold">&quot;{title}&quot;</span> to.</p>

                        {isLoadingSets ? (
                            <div className="flex justify-center py-6">
                                <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                            </div>
                        ) : mySets.length === 0 ? (
                            <div className="text-center py-6 bg-white/5 rounded-xl border border-dashed border-white/10">
                                <p className="text-white/50 text-xs mb-3">You haven&apos;t created any sets yet.</p>
                                <Link
                                    href="/sets/new"
                                    className="px-3.5 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-lg hover:bg-amber-400 inline-block"
                                >
                                    Create First Set
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                                {mySets.map(set => (
                                    <button
                                        key={set.id}
                                        type="button"
                                        onClick={() => handleAddToSet(set.id, set.title)}
                                        className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-between group"
                                    >
                                        <div>
                                            <div className="font-bold text-xs sm:text-sm">{set.title}</div>
                                            <div className="text-[10px] text-white/40">
                                                {new Date(set.event_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <Plus className="w-4 h-4 text-white/30 group-hover:text-amber-500 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* COMPACT GLASSMORPHIC SUGGESTIONS (Exact User Reference Design) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {relatedSongs && relatedSongs.length > 0 && (
                <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-6 sm:pt-8 pb-3 relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF8C68]" />
                            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-white/80">
                                You Might Also Like
                            </h3>
                        </div>
                        <span className="text-[11px] font-mono text-white/40 font-semibold tracking-wider">
                            {relatedSongs.length} RECOMMENDED
                        </span>
                    </div>

                    {/* Compact Glassmorphic Cards Grid (Sleek Horizontal Layout) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                        {relatedSongs.map((song) => (
                            <Link
                                key={song.slug}
                                href={`/songs/${song.slug}`}
                                className="group relative flex items-center gap-3 sm:gap-3.5 p-2.5 sm:p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] backdrop-blur-xl border border-white/10 hover:border-[#FF5A2E]/40 shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(255,90,46,0.18)] transition-all duration-300 hover:scale-[1.01]"
                            >
                                {/* Square Album Artwork with subtle glow */}
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden relative shrink-0 bg-black/60 border border-white/10 shadow-md">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                        style={{
                                            backgroundImage: `url('${song.coverImage || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80"}')`
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                    
                                    {/* Hover Play Indicator */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
                                        <Play className="w-4 h-4 fill-white text-white translate-x-0.5 drop-shadow" />
                                    </div>
                                </div>

                                {/* Title & Artist */}
                                <div className="flex-1 min-w-0 pr-1">
                                    <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-[#FFB37A] transition-colors truncate">
                                        {song.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors truncate">
                                            {song.artist}
                                        </p>
                                        {song.originalKey && (
                                            <span className="text-[10px] font-mono text-white/40 bg-white/5 px-1.5 py-0.2 rounded border border-white/5 shrink-0">
                                                Key {song.originalKey}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Sleek Diagonal Arrow (Matching Screenshot) */}
                                <div className="p-1.5 shrink-0 text-white/30 group-hover:text-white transition-colors">
                                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 -rotate-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* CALL OF JESUS MINISTRIES — GRAND ANIMATED SIGNATURE WORDMARK */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="relative pt-6 pb-8 sm:pt-8 sm:pb-12 overflow-visible select-none px-4 sm:px-6 md:px-12 border-t border-white/[0.06] mt-4 bg-gradient-to-b from-transparent via-[#0A0710]/40 to-[#02000F]/80">
                {/* Ambient Celestial Flame Glow matching Logo Atmosphere */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="w-full max-w-5xl h-28 sm:h-44 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.22)_0%,rgba(245,158,11,0.15)_40%,rgba(139,92,246,0.08)_75%,transparent_90%)] blur-3xl" />
                </div>

                {/* Subtle Dedication Tagline */}
                <div className="relative z-10 flex items-center justify-center gap-2 text-center mb-3 sm:mb-4">
                    <span className="w-8 sm:w-16 h-px bg-gradient-to-r from-transparent to-[#FFB37A]/50" />
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-[#FFB37A]/80 font-space">
                        Worship In Spirit & Truth
                    </span>
                    <span className="w-8 sm:w-16 h-px bg-gradient-to-l from-transparent to-[#FFB37A]/50" />
                </div>

                {/* Full-Width Edge-to-Edge Logo-Styled Typography with Letter Blow Hover */}
                <div className="relative z-10 w-full flex flex-col items-center overflow-visible">
                    <GoldenSparkleReveal duration={1800} delay={100} className="w-full overflow-visible">
                        <div className="flex items-baseline justify-center gap-2 sm:gap-3 md:gap-5 lg:gap-6 select-none whitespace-nowrap overflow-visible">
                            {/* CALL */}
                            <div className="flex items-baseline tracking-normal overflow-visible">
                                {['C', 'A', 'L', 'L'].map((char, i) => (
                                    <span
                                        key={`call-${i}`}
                                        className="letter-blow font-playfair font-black text-[11vw] sm:text-[10vw] md:text-[9vw] lg:text-[8vw] xl:text-[7.5vw] leading-[1.12] pb-2 sm:pb-3 md:pb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF8] via-[#FFB37A] via-[#FF5A2E] to-[#F59E0B]"
                                    >
                                        {char}
                                    </span>
                                ))}
                            </div>

                            {/* OF */}
                            <div className="flex items-baseline overflow-visible">
                                <span className="letter-blow font-playfair font-semibold text-[4.8vw] sm:text-[4.2vw] md:text-[3.8vw] lg:text-[3.4vw] xl:text-[3vw] tracking-[0.18em] leading-[1.12] pb-2 sm:pb-3 md:pb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF8] via-[#FDE047] to-[#F59E0B] align-middle">
                                    OF
                                </span>
                            </div>

                            {/* JESUS */}
                            <div className="flex items-baseline tracking-normal overflow-visible">
                                {['J', 'E', 'S', 'U', 'S'].map((char, i) => (
                                    <span
                                        key={`jesus-${i}`}
                                        className="letter-blow font-playfair font-black text-[11vw] sm:text-[10vw] md:text-[9vw] lg:text-[8vw] xl:text-[7.5vw] leading-[1.12] pb-2 sm:pb-3 md:pb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF8] via-[#FFB37A] via-[#FF5A2E] to-[#F59E0B]"
                                    >
                                        {char}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </GoldenSparkleReveal>

                    {/* Subtitle */}
                    <GoldenSparkleReveal duration={1750} delay={400}>
                        <p className="mt-1 sm:mt-2 md:mt-3 text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.55em] sm:tracking-[0.8em] text-white/40 uppercase font-space text-center w-full">
                            M I N I S T R I E S
                        </p>
                    </GoldenSparkleReveal>
                </div>
            </div>
        </div>
    );
}
