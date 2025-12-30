'use client';

import { useState, Fragment, useEffect } from 'react';
import { transposeChord } from '@/lib/music';
import { ArrowLeft, Clock, Heart, Minus, Play, PlayCircle, Plus, Music2, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';

interface SongViewerProps {
    songId: string; // Added prop
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
        title: string;
        slug: string;
        artist: string;
    }[];
    coverImage?: string;
}

export default function SongViewer({ songId, title, author, originalKey, lyrics, hindiLyrics, chords, youtubeId, category, tempo, relatedSongs, coverImage }: SongViewerProps) {
    const { currentUser } = useAppStore();
    const [transpose, setTranspose] = useState(0);
    const [fontSize, setFontSize] = useState(18);
    const [useFlats, setUseFlats] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);
    const [showVideo, setShowVideo] = useState(false);

    // Modal State
    const [isAddToSetOpen, setIsAddToSetOpen] = useState(false);
    const [mySets, setMySets] = useState<{ id: string, title: string, event_date: string }[]>([]);
    const [isLoadingSets, setIsLoadingSets] = useState(false);

    // Auth Check State
    const [isCheckingFav, setIsCheckingFav] = useState(true);

    // Check Status on Mount
    useEffect(() => {
        async function checkStatus() {
            if (!currentUser) {
                setIsCheckingFav(false);
                return;
            };

            const { data } = await supabase
                .from('favourites')
                .select('id')
                .eq('user_id', currentUser.id)
                .eq('song_id', songId)
                .maybeSingle();

            if (data) setIsFavourite(true);
            setIsCheckingFav(false);
        }
        checkStatus();
    }, [currentUser, songId]);

    const handleToggleFavourite = async () => {
        if (!currentUser) {
            toast.error("Please login to save songs");
            return;
        }

        // Optimistic Update
        const previousState = isFavourite;
        setIsFavourite(!previousState);

        try {
            if (previousState) {
                // Remove
                const { error } = await supabase
                    .from('favourites')
                    .delete()
                    .eq('user_id', currentUser.id)
                    .eq('song_id', songId);

                if (error) throw error;
                toast.success("Removed from favourites");
            } else {
                // Add
                const { error } = await supabase
                    .from('favourites')
                    .insert({
                        user_id: currentUser.id,
                        song_id: songId
                    });

                if (error) throw error;
                toast.success("Added to favourites");
            }
        } catch (error) {
            console.error(error);
            toast.error("Action failed");
            setIsFavourite(previousState); // Revert
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
        if (mySets.length > 0) return; // Already fetched

        setIsLoadingSets(true);
        try {
            const { data, error } = await supabase
                .from('sets')
                .select('id, title, event_date')
                .eq('created_by', currentUser.id)
                .order('event_date', { ascending: false });

            if (error) throw error;
            setMySets(data || []);
        } catch (error: any) {
            toast.error("Failed to load your sets");
        } finally {
            setIsLoadingSets(false);
        }
    };

    const handleAddToSet = async (setId: string, setTitle: string) => {
        try {
            // Check if already in set (optional, or rely on distinct? Schema doesn't enforce unique song per set but logic might)
            // Let's just add it.

            // Get current count to determine order
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
                    key_override: currentKey !== originalKey ? currentKey : null // Save transposed key if changed
                });

            if (error) throw error;

            toast.success(`Added to ${setTitle}`);
            setIsAddToSetOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to add song to set");
        }
    };

    // Render Logic for Lyrics (Pure Text)
    const renderLyrics = () => {
        return lyrics.split('\n').map((line, index) => (
            <p key={index} className="mb-6 leading-relaxed text-white/90 whitespace-pre-wrap font-medium tracking-wide break-words" style={{ fontSize: `${fontSize}px` }}>
                {line}
            </p>
        ));
    };

    // Render Logic for Hindi Lyrics
    const renderHindiLyrics = () => {
        if (!hindiLyrics) return null;
        return hindiLyrics.split('\n').map((line, index) => (
            <p key={index} className="mb-6 leading-loose text-white/90 whitespace-pre-wrap font-serif tracking-wide break-words" style={{ fontSize: `${fontSize + 4}px` }}>
                {line}
            </p>
        ));
    };

    // Helper: Validate if a string is likely a musical chord
    const isValidChord = (str: string) => {
        const cleanStr = str.replace(/[^A-Za-z0-9#\/+\-()]/g, ''); // Allow +, -, () in checks

        // Exact blocklist for common words that might match chord patterns (e.g. "Go" -> G + o(dim))
        const invalidWords = new Set(['Go', 'Do', 'An', 'As', 'At', 'Be', 'By', 'In', 'Is', 'It', 'Of', 'On', 'Or', 'So', 'To', 'Up', 'Us', 'We', 'My', 'He', 'Hi', 'No']);
        if (invalidWords.has(cleanStr)) return false;

        // Expanded Regex:
        // Root: [A-G][#b]?
        // Suffix particles: 
        //  - m, min, maj, dim, aug, sus, add, M, o
        //  - numbers (0-9)
        //  - symbols: +, -, #, b, (, )
        return /^[A-G][#b]?([0-9]|m|min|maj|dim|aug|sus|add|M|o|\+|b|#|\-|\(|\))*(\/[A-G][#b]?)?$/.test(cleanStr);
    };

    // Render Logic for Chords (With Transposition) - Standard Vertical Alignment
    const renderChords = () => {
        if (!chords) return null;
        return chords.split('\n').map((line, lineIndex) => {
            // DETECT SECTION HEADERS: [Chorus], [Verse 1], etc.
            const headerMatch = line.trim().match(/^\[(Chorus|Verse|Bridge|Pre-Chorus|Intro|Outro|Instrumental).*\]$/i);
            if (headerMatch) {
                return (
                    <h3 key={lineIndex} className="text-amber-500 font-bold uppercase tracking-widest text-xs mt-10 mb-6 bg-white/5 inline-block px-3 py-1 rounded">
                        {headerMatch[0].replace('[', '').replace(']', '')}
                    </h3>
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
                <div key={lineIndex} className="flex flex-wrap items-end mb-8 w-full">
                    {segments.map((seg, idx) => {
                        const isChord = seg.chord ? isValidChord(seg.chord) : false;
                        const transposedChord = (seg.chord && isChord) ? transposeChord(seg.chord, transpose, useFlats) : null;

                        // 1. Merge Invalid Chords Logic
                        let displayText = seg.text || "";
                        if (!isChord && seg.chord) {
                            displayText = `${seg.chord} ` + displayText;
                        }

                        // 2. Leading Space Logic (for Alignment)
                        const leadingSpaceMatch = displayText.match(/^(\s+)(.*)/);
                        const leadingSpace = leadingSpaceMatch ? leadingSpaceMatch[1] : "";
                        const mainText = leadingSpaceMatch ? leadingSpaceMatch[2] : displayText;

                        // 3. Bare Chord Detection in "mainText"
                        // If the user typed "G D" without brackets, we parse it here.
                        // We split by space to find potential chords.
                        const tokens = mainText.split(/(\s+)/); // Keep delimiters to preserve spacing

                        return (
                            <Fragment key={idx}>
                                {leadingSpace && <span className="whitespace-pre text-lg font-medium">{leadingSpace}</span>}

                                {isChord ? (
                                    // Case A: Bracketed Chord (Stacked or Isolated)
                                    <div className={`flex flex-col group ${mainText.trim().length > 0 ? 'mr-0' : 'mr-3'}`}>
                                        <div className="h-6 mb-1">
                                            {transposedChord ? (
                                                <span className="text-amber-500 font-bold font-mono text-xs md:text-base block whitespace-nowrap">
                                                    {transposedChord}
                                                </span>
                                            ) : null}
                                        </div>
                                        <span className="text-white/90 whitespace-pre font-medium text-sm md:text-lg leading-none block min-h-[1em]">
                                            {mainText || (mainText.trim().length > 0 ? "\u00A0" : "")}
                                        </span>
                                    </div>
                                ) : (
                                    // Case B: No Bracketed Chord (Just Text OR Bare Chords)
                                    // We iterate tokens. If a token IS a chord, render as box. Else render as text.
                                    <div className="flex items-end">
                                        {tokens.map((token, tIdx) => {
                                            const isTokenChord = isValidChord(token.trim());
                                            const tokenTransposed = isTokenChord ? transposeChord(token.trim(), transpose, useFlats) : null;

                                            if (isTokenChord && tokenTransposed) {
                                                return (
                                                    <div key={tIdx} className="flex flex-col mr-3 relative top-[-0.25rem]">
                                                        <span className="text-amber-500 font-bold font-mono text-xs md:text-base block whitespace-nowrap bg-[#050505]/80 px-1 rounded border border-neutral-800">
                                                            {tokenTransposed}
                                                        </span>
                                                        {/* No text under bare chords usually, or it flows next to it */}
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <span key={tIdx} className="text-white/90 whitespace-pre font-medium text-sm md:text-lg leading-none block min-h-[1em]">
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
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[var(--brand)] selection:text-white pb-48">

            {/* 1. HERO HEADER */}
            <div className="relative w-full h-96 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#9C27B0] to-[var(--brand)] opacity-80 mix-blend-multiply"></div>
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 grayscale"
                    style={{
                        backgroundImage: coverImage
                            ? `url('${coverImage}')`
                            : youtubeId
                                ? `url('https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg')`
                                : "url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop')"
                    }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 pt-16 md:pt-20">
                    <div className="max-w-7xl mx-auto">
                        <Link href="/songs" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 text-xs font-bold uppercase tracking-widest transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Library
                        </Link>

                        {/* DISTINCT H1 AS REQUESTED - Semantic SEO */}
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2 md:mb-3 text-white drop-shadow-2xl">
                            {title} – Lyrics & Chords
                        </h1>

                        <p className="text-lg md:text-xl text-white/80 font-serif italic tracking-wide mb-4 md:mb-6">{author}</p>

                        <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-white/60">
                            {category && (
                                <span className="px-3 py-1 rounded-full bg-white/10 uppercase tracking-wider text-xs">{category}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. METADATA BAR */}
            <div className="sticky top-0 z-30 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 py-3 md:py-4 px-3 md:px-6 shadow-2xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0">
                    <div className="flex items-center gap-4 md:gap-8 text-sm font-bold text-white/60">
                        {/* Only show key controls if chords exist */}
                        {chords && (
                            <>
                                <div className="flex flex-col">
                                    <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-white/40 mb-0.5 md:mb-1">Original Key</span>
                                    <span className="text-white text-base md:text-lg leading-none">{originalKey}</span>
                                </div>
                                <div className="h-8 w-px bg-white/10"></div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-white/40 mb-0.5 md:mb-1">Current Key</span>
                                    <span className="text-[var(--brand)] text-base md:text-lg leading-none">{currentKey}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                        <button
                            onClick={handleOpenAddToSet}
                            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all border bg-white/5 border-white/10 text-white hover:bg-white/10 flex-1 md:flex-initial justify-center"
                        >
                            <Plus className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            <span className="hidden sm:inline">Add to Set</span>
                            <span className="sm:hidden">Add</span>
                        </button>

                        <button
                            onClick={handleToggleFavourite}
                            disabled={isCheckingFav}
                            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all border flex-1 md:flex-initial justify-center ${isFavourite
                                ? 'bg-[var(--brand)] border-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/20'
                                : 'bg-transparent border-white/20 text-white/60 hover:border-white/50 hover:text-white'
                                }`}
                        >
                            {isCheckingFav ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Heart className={`w-3.5 md:w-4 h-3.5 md:h-4 ${isFavourite ? 'fill-current' : ''}`} />
                            )}
                            <span className="hidden sm:inline">{isFavourite ? 'Saved' : 'Save Song'}</span>
                            <span className="sm:hidden">{isFavourite ? 'Saved' : 'Save'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. MAIN CONTENT (Split Layout) */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 relative animate-fade-in-up">

                <div className="lg:col-span-7 space-y-12 min-h-[60vh]">

                    {/* Song Info Section for SEO - Above Lyrics */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                        <h2 className="sr-only">Song Information</h2>
                        <dl className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-white/40 font-bold uppercase tracking-widest text-xs mb-1">Song Title</dt>
                                <dd className="text-white font-serif italic text-lg">{title}</dd>
                            </div>
                            <div>
                                <dt className="text-white/40 font-bold uppercase tracking-widest text-xs mb-1">Artist</dt>
                                <dd className="text-white">{author}</dd>
                            </div>
                            <div>
                                <dt className="text-white/40 font-bold uppercase tracking-widest text-xs mb-1">Original Key</dt>
                                <dd className="text-amber-500 font-bold">{originalKey}</dd>
                            </div>
                            <div>
                                <dt className="text-white/40 font-bold uppercase tracking-widest text-xs mb-1">Tempo</dt>
                                <dd className="text-white">{tempo || 'Moderate'}</dd>
                            </div>
                            <div className="col-span-2">
                                <dt className="text-white/40 font-bold uppercase tracking-widest text-xs mb-1">Worship Usage</dt>
                                <dd className="text-white capitalize">{category || 'Church Worship'}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Lyrics Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-amber-500 mb-6 border-b border-white/10 pb-2">Lyrics</h2>
                        <div className="bg-white/5 rounded-[2rem] p-5 md:p-10 border border-white/5">
                            {renderLyrics()}
                        </div>
                    </section>

                    {/* Hindi Lyrics Section (Updated) */}
                    {hindiLyrics && (
                        <section>
                            <h2 className="text-2xl font-bold text-amber-500 mb-6 border-b border-white/10 pb-2">Hindi Lyrics (Devanagari)</h2>
                            <div className="bg-white/5 rounded-[2rem] p-5 md:p-10 border border-white/5">
                                {renderHindiLyrics()}
                            </div>
                        </section>
                    )}

                    {/* Chords Section */}
                    {chords && (
                        <section>
                            <h2 className="text-2xl font-bold text-amber-500 mb-6 border-b border-white/10 pb-2">Chords</h2>
                            <div className="bg-white/5 rounded-[2rem] p-4 md:p-10 border border-white/5 overflow-x-auto pb-8">
                                {renderChords()}
                            </div>
                        </section>
                    )}
                </div>

                {/* RIGHT COLUMN: VIDEO & TOOLS */}
                <div className="block lg:col-span-5 relative">
                    <div className="sticky top-28 space-y-6">
                        {/* Premium Video Player Box */}
                        <div className="group relative rounded-3xl overflow-hidden aspect-video shadow-2xl shadow-black/80 ring-1 ring-white/10 transition-all duration-500 hover:shadow-[var(--brand)]/20 hover:ring-[var(--brand)]/50">

                            {/* Animated Border Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--brand)] to-purple-600 opacity-20 blur transition-opacity duration-500 group-hover:opacity-40"></div>

                            <div className="relative h-full w-full bg-[#050505] rounded-[22px] overflow-hidden">
                                {showVideo && youtubeId ? (
                                    <iframe
                                        className="w-full h-full"
                                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                                        title="YouTube Video"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div
                                        className="absolute inset-0 flex flex-col items-center justify-center bg-[#111] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{
                                            backgroundImage: youtubeId
                                                ? `url('https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg')`
                                                : "url('https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=1000&auto=format&fit=crop')"
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>

                                        <div className="relative z-10 flex flex-col items-center group-hover:-translate-y-2 transition-transform duration-500">
                                            <button
                                                onClick={() => setShowVideo(true)}
                                                className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-[var(--brand)] group-hover:border-[var(--brand)] group-hover:shadow-[0_0_40px_-10px_var(--brand)]"
                                                title="Watch Video"
                                            >
                                                <Play className="w-8 h-8 text-white fill-white ml-1" />
                                            </button>
                                            <p className="text-xs font-bold text-white/80 uppercase tracking-[0.2em] group-hover:text-white transition-colors">Watch Official Video</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pro Tools Panel - Only if chords exist */}
                        {chords && (
                            <div className="p-4 md:p-8 rounded-2xl md:rounded-3xl bg-[#111] border border-white/10">
                                <h3 className="text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest mb-4 md:mb-6">Quick Tools</h3>
                                <div className="grid grid-cols-2 gap-3 md:gap-4">
                                    <button
                                        onClick={() => setTranspose(t => t - 1)}
                                        className="p-3 md:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-1.5 md:gap-2 border border-white/5 group"
                                    >
                                        <Minus className="w-4 md:w-5 h-4 md:h-5 text-white/60 group-hover:text-white" />
                                        <span className="text-[10px] md:text-xs font-bold text-white/60 group-hover:text-white">Transpose -1</span>
                                    </button>
                                    <button
                                        onClick={() => setTranspose(t => t + 1)}
                                        className="p-3 md:p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-1.5 md:gap-2 border border-white/5 group"
                                    >
                                        <Plus className="w-4 md:w-5 h-4 md:h-5 text-white/60 group-hover:text-white" />
                                        <span className="text-[10px] md:text-xs font-bold text-white/60 group-hover:text-white">Transpose +1</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. MOBILE CONTROLS */}
            {chords && (
                <div className="fixed bottom-20 left-0 right-0 z-40 w-full px-3 lg:hidden">
                    <div className="max-w-xl mx-auto bg-[#1F1F1F]/90 backdrop-blur-xl rounded-xl shadow-2xl p-1.5 ring-1 ring-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 w-full justify-between px-2">
                            <span className="text-[10px] font-bold uppercase text-white/50 tracking-wider">Transpose</span>
                            <div className="flex gap-2">
                                <button onClick={() => setTranspose(t => t - 1)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                                <span className="text-base font-bold w-8 text-center pt-0.5">{currentKey}</span>
                                <button onClick={() => setTranspose(t => t + 1)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 5. ADD TO SET MODAL */}
            {isAddToSetOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddToSetOpen(false)}></div>
                    <div className="relative bg-[#111] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in-up">
                        <button
                            onClick={() => setIsAddToSetOpen(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold mb-2">Add to Set</h2>
                        <p className="text-white/40 mb-6">Choose a set to add <span className="text-white font-bold">"{title}"</span> to.</p>

                        {isLoadingSets ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                            </div>
                        ) : mySets.length === 0 ? (
                            <div className="text-center py-8 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                <p className="text-white/50 mb-4">You haven't created any sets yet.</p>
                                <Link
                                    href="/sets/new"
                                    className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg hover:bg-amber-400 inline-block"
                                >
                                    Create First Set
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {mySets.map(set => (
                                    <button
                                        key={set.id}
                                        onClick={() => handleAddToSet(set.id, set.title)}
                                        className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between group"
                                    >
                                        <div>
                                            <div className="font-bold">{set.title}</div>
                                            <div className="text-xs text-white/40">
                                                {new Date(set.event_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <Plus className="w-5 h-5 text-white/20 group-hover:text-amber-500 transition-colors" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* RELATED SONGS */}
            {relatedSongs && relatedSongs.length > 0 && (
                <div className="max-w-7xl mx-auto px-6 pb-24">
                    <h3 className="text-2xl font-bold text-white mb-8 border-b border-white/10 pb-4">You Might Also Like</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {relatedSongs.map((song) => (
                            <Link key={song.slug} href={`/songs/${song.slug}`} className="group block bg-white/5 rounded-xl p-6 border border-white/5 hover:bg-white/10 transition-colors">
                                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[var(--brand)] transition-colors">{song.title}</h4>
                                <p className="text-white/60 text-sm">{song.artist}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
