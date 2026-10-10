'use client';

import { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import Link from 'next/link';
import {
    Search,
    WifiOff,
    Music,
    Guitar,
    Disc3,
    ArrowLeft,
    RefreshCw,
    ChevronRight,
    Minus,
    Plus,
    RotateCcw,
    Play,
    Pause,
    Copy,
    Check,
    FileText,
    Languages,
    Layers,
    CheckCircle2
} from 'lucide-react';
import { ALL_SONGS } from '@/data/songs';
import { Song } from '@/data/types';
import { transposeChord } from '@/lib/music';

// Helper: validate chord string safely
const isValidChord = (str: string) => {
    const cleanStr = str.replace(/[^A-Za-z0-9#\/+\-()]/g, '');
    const invalidWords = new Set(['Go', 'Do', 'An', 'As', 'At', 'Be', 'By', 'In', 'Is', 'It', 'Of', 'On', 'Or', 'So', 'To', 'Up', 'Us', 'We', 'My', 'He', 'Hi', 'No']);
    if (invalidWords.has(cleanStr)) return false;
    return /^[A-G][#b]?([0-9]|m|min|maj|dim|aug|sus|add|M|o|\+|b|#|\-|\(|\))*(\/[A-G][#b]?)?$/.test(cleanStr);
};

export default function OfflinePage() {
    const [offlineSongs, setOfflineSongs] = useState<Song[]>(ALL_SONGS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);
    const [retryMessage, setRetryMessage] = useState<string | null>(null);

    // Song viewer local controls
    const [transpose, setTranspose] = useState(0);
    const [fontSize, setFontSize] = useState(15);
    const [activeTab, setActiveTab] = useState<'chords' | 'lyrics' | 'hindi' | 'all'>('chords');
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState<1 | 2 | 3>(1);
    const [copied, setCopied] = useState(false);
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Monitor online/offline status
    useEffect(() => {
        setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : false);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Load synced offline songs from localStorage if user previously synced
        try {
            const cached = localStorage.getItem('coj_offline_songs_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setOfflineSongs(parsed);
                }
            }
        } catch {
            // Fallback to ALL_SONGS
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Reset song viewer states when switching songs
    useEffect(() => {
        if (selectedSong) {
            setTranspose(0);
            setIsAutoScrolling(false);
            if (selectedSong.chords && selectedSong.chords.trim().length > 0) {
                setActiveTab('chords');
            } else if (selectedSong.lyrics && selectedSong.lyrics.trim().length > 0) {
                setActiveTab('lyrics');
            } else {
                setActiveTab('all');
            }
        }
    }, [selectedSong]);

    // Auto-scroll loop
    useEffect(() => {
        if (isAutoScrolling) {
            const speedMap = { 1: 1, 2: 2, 3: 3 };
            const speed = speedMap[scrollSpeed] || 1;
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

    // Search filter
    const filteredSongs = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return offlineSongs;
        return offlineSongs.filter(s =>
            (s.title || '').toLowerCase().includes(q) ||
            (s.artist || '').toLowerCase().includes(q) ||
            (s.lyrics || '').toLowerCase().includes(q) ||
            (s.hindi_lyrics || '').toLowerCase().includes(q)
        );
    }, [offlineSongs, searchQuery]);

    // Safe Retry Handler (probes connectivity before reloading, preventing crash)
    const handleSafeRetry = async () => {
        setIsCheckingNetwork(true);
        setRetryMessage(null);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            // Fetch a tiny static manifest file without caching
            const res = await fetch('/manifest.json?_t=' + Date.now(), {
                cache: 'no-store',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                // Network restored! Seamlessly go to online home page
                window.location.href = '/';
                return;
            }
        } catch {
            // Still offline
        }

        setIsCheckingNetwork(false);
        setRetryMessage('Abhi bhi internet connect nahi hua hai. Data/Wi-Fi check karein.');
        setTimeout(() => setRetryMessage(null), 4000);
    };

    // Calculate current transposed key
    const originalKey = selectedSong?.key || 'C';
    const currentKey = transposeChord(originalKey, transpose, false);

    // Exportable plain text for clipboard
    const handleCopySong = async () => {
        if (!selectedSong) return;
        let textToCopy = `${selectedSong.title} - ${selectedSong.artist || 'Worship'}\nKey: ${currentKey}\n\n`;

        if (activeTab === 'chords' && selectedSong.chords) {
            let trChords = selectedSong.chords;
            if (transpose !== 0) {
                trChords = selectedSong.chords.replace(/\[([A-G][#b]?[^\]]*)\]/g, (match, chord) => {
                    const isChord = isValidChord(chord);
                    return isChord ? `[${transposeChord(chord, transpose, false)}]` : match;
                });
            }
            textToCopy += trChords;
        } else if (activeTab === 'hindi' && selectedSong.hindi_lyrics) {
            textToCopy += selectedSong.hindi_lyrics;
        } else {
            textToCopy += selectedSong.lyrics || '';
        }

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard fallback
        }
    };

    // Render Chords (ChordPro)
    const renderChords = (chordsText?: string) => {
        if (!chordsText) return <p className="text-white/40 text-sm italic">No chords available for this track.</p>;

        return chordsText.split('\n').map((line, lineIndex) => {
            const trimmed = line.trim();
            if (!trimmed) {
                return <div key={lineIndex} className="h-2.5" />;
            }

            const headerMatch = trimmed.match(/^(?:\[)?(Intro|Verse|Chorus|Bridge|Pre-Chorus|PreChorus|Outro|Interlude|Ending|Instrumental)(?:[\s\d:]*)?(?:\])?$/i) || trimmed.match(/^\[.*\]$/);
            if (headerMatch) {
                return (
                    <div key={lineIndex} className="mt-4 mb-2 first:mt-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 rounded shadow-sm inline-block">
                            {trimmed.replace(/[\[\]:]/g, '').trim()}
                        </span>
                    </div>
                );
            }

            const parts = line.split(/(\[.*?\])/g);
            const segments: { text: string; chord: string | null }[] = [];

            if (!parts[0].startsWith('[')) {
                segments.push({ text: parts[0], chord: null });
            }

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part.startsWith('[') && part.endsWith(']')) {
                    const chordName = part.slice(1, -1);
                    const textUnder = parts[i + 1] && !parts[i + 1].startsWith('[') ? parts[i + 1] : '';
                    segments.push({ text: textUnder, chord: chordName });
                }
            }

            return (
                <div key={lineIndex} className="flex flex-wrap items-end mb-2.5 w-full">
                    {segments.map((seg, idx) => {
                        const isChord = seg.chord ? isValidChord(seg.chord) : false;
                        const transposed = (seg.chord && isChord) ? transposeChord(seg.chord, transpose, false) : null;

                        let displayText = seg.text || '';
                        if (!isChord && seg.chord) {
                            displayText = `${seg.chord} ` + displayText;
                        }

                        const leadingSpaceMatch = displayText.match(/^(\s+)(.*)/);
                        const leadingSpace = leadingSpaceMatch ? leadingSpaceMatch[1] : '';
                        const mainText = leadingSpaceMatch ? leadingSpaceMatch[2] : displayText;
                        const tokens = mainText.split(/(\s+)/);

                        return (
                            <Fragment key={idx}>
                                {leadingSpace && <span className="whitespace-pre font-medium" style={{ fontSize: `${fontSize}px` }}>{leadingSpace}</span>}

                                {isChord ? (
                                    <div className={`flex flex-col ${mainText.trim().length > 0 ? 'mr-0' : 'mr-2'}`}>
                                        <div className="h-4 mb-0.5">
                                            {transposed ? (
                                                <span className="text-amber-400 font-bold font-mono text-xs sm:text-sm block whitespace-nowrap leading-none drop-shadow-sm">
                                                    {transposed}
                                                </span>
                                            ) : null}
                                        </div>
                                        <span
                                            className="text-white/90 whitespace-pre font-medium leading-tight block min-h-[1em]"
                                            style={{ fontSize: `${fontSize}px` }}
                                        >
                                            {mainText || (mainText.trim().length > 0 ? '\u00A0' : '')}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-end">
                                        {tokens.map((token, tIdx) => {
                                            const isTokenChord = isValidChord(token.trim());
                                            const tokenTransposed = isTokenChord ? transposeChord(token.trim(), transpose, false) : null;

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

    // Render Lyrics
    const renderLyrics = (lyricsText?: string, isDevanagari = false) => {
        if (!lyricsText) return <p className="text-white/40 text-sm italic">No lyrics available.</p>;

        return lyricsText.split('\n').map((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={index} className="h-2.5" />;

            const isHeader = /^\[.*\]$/.test(trimmed) || /^(?:\[)?(Intro|Verse|Chorus|Bridge|Pre-Chorus|PreChorus|Outro|Interlude|Ending|Instrumental)(?:[\s\d:]*)?(?:\])?$/i.test(trimmed);
            if (isHeader) {
                return (
                    <div key={index} className="mt-3.5 mb-1.5 first:mt-0">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2.5 py-0.5 rounded shadow-sm inline-block">
                            {trimmed.replace(/[\[\]:]/g, '').trim()}
                        </span>
                    </div>
                );
            }

            return (
                <p
                    key={index}
                    className={`mb-1.5 leading-relaxed text-white/90 whitespace-pre-wrap ${isDevanagari ? 'font-serif' : 'font-medium'} break-words`}
                    style={{ fontSize: `${isDevanagari ? fontSize + 1 : fontSize}px` }}
                >
                    {line}
                </p>
            );
        });
    };

    // VIEW: Individual Song Chords & Lyrics Screen (100% Offline)
    if (selectedSong) {
        return (
            <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500 selection:text-black pb-28">
                {/* Header Bar */}
                <div className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-3 flex items-center justify-between shadow-2xl">
                    <button
                        type="button"
                        onClick={() => setSelectedSong(null)}
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white/80 hover:text-white transition-colors py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4 text-amber-400" />
                        <span>Songbook</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            Key: {currentKey}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Offline</span>
                        </div>
                    </div>
                </div>

                {/* Song Meta Header */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-3 border-b border-white/5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                                {selectedSong.title}
                            </h1>
                            <p className="text-sm text-white/60 font-medium mt-0.5">
                                {selectedSong.artist || 'Worship'}
                            </p>
                        </div>

                        {selectedSong.category && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10 shrink-0">
                                {selectedSong.category.replace('-', ' ')}
                            </span>
                        )}
                    </div>
                </div>

                {/* Sticky Transpose & Controls Toolbar */}
                <div className="sticky top-[53px] z-30 bg-[#0C0C0C]/95 backdrop-blur-md border-b border-white/10 py-2 px-4 sm:px-6 shadow-xl">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 flex-wrap">
                        {/* Transposer */}
                        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-xl p-1">
                            <button
                                type="button"
                                onClick={() => setTranspose(t => t - 1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80 active:scale-90 transition-all"
                                title="Transpose -1"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setTranspose(0)}
                                className="px-2.5 py-0.5 flex flex-col items-center justify-center hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                                title="Click to reset key"
                            >
                                <span className="text-[9px] uppercase font-bold text-white/40 tracking-wider flex items-center gap-0.5 leading-none">
                                    Key {transpose !== 0 && <RotateCcw className="w-2.5 h-2.5 text-amber-400" />}
                                </span>
                                <span className="text-xs sm:text-sm font-black text-amber-400 font-mono tracking-wide leading-tight">
                                    {currentKey}
                                    {transpose !== 0 && (
                                        <span className="text-[10px] font-normal text-amber-300 ml-0.5">
                                            ({transpose > 0 ? `+${transpose}` : transpose})
                                        </span>
                                    )}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTranspose(t => t + 1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80 active:scale-90 transition-all"
                                title="Transpose +1"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Font size + Copy */}
                        <div className="flex items-center gap-1.5">
                            {/* Font size */}
                            <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/5 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setFontSize(s => Math.max(12, s - 1))}
                                    className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white font-bold"
                                >
                                    A-
                                </button>
                                <span className="text-[11px] font-mono text-amber-400 font-bold px-1">{fontSize}</span>
                                <button
                                    type="button"
                                    onClick={() => setFontSize(s => Math.min(24, s + 1))}
                                    className="w-6 h-6 rounded flex items-center justify-center text-white/70 hover:text-white font-bold"
                                >
                                    A+
                                </button>
                            </div>

                            {/* Copy button */}
                            <button
                                type="button"
                                onClick={handleCopySong}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                    copied
                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                        : 'bg-white/5 border-white/10 text-white/80 hover:text-white'
                                }`}
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                                <span>{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Box */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    {/* View Switcher Tabs */}
                    <div className="flex items-center gap-1.5 border-b border-white/10 pb-3 mb-4">
                        {selectedSong.chords && (
                            <button
                                type="button"
                                onClick={() => setActiveTab('chords')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    activeTab === 'chords'
                                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                        : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Music className="w-3.5 h-3.5" />
                                <span>Chords</span>
                            </button>
                        )}

                        {selectedSong.lyrics && (
                            <button
                                type="button"
                                onClick={() => setActiveTab('lyrics')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    activeTab === 'lyrics'
                                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                        : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Hinglish</span>
                            </button>
                        )}

                        {selectedSong.hindi_lyrics && (
                            <button
                                type="button"
                                onClick={() => setActiveTab('hindi')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
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
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                activeTab === 'all'
                                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            <span>All</span>
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="bg-[#0C0C0C]/80 border border-white/5 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-x-auto">
                        {activeTab === 'chords' && renderChords(selectedSong.chords)}
                        {activeTab === 'lyrics' && renderLyrics(selectedSong.lyrics, false)}
                        {activeTab === 'hindi' && renderLyrics(selectedSong.hindi_lyrics, true)}
                        {activeTab === 'all' && (
                            <div className="space-y-6">
                                {selectedSong.chords && (
                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 border-b border-white/10 pb-1">
                                            Chords & Lyrics
                                        </h3>
                                        {renderChords(selectedSong.chords)}
                                    </section>
                                )}
                                {selectedSong.lyrics && (
                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 border-b border-white/10 pb-1">
                                            Hinglish Lyrics
                                        </h3>
                                        {renderLyrics(selectedSong.lyrics, false)}
                                    </section>
                                )}
                                {selectedSong.hindi_lyrics && (
                                    <section>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-2 border-b border-white/10 pb-1">
                                            हिन्दी Lyrics (देवनागरी)
                                        </h3>
                                        {renderLyrics(selectedSong.hindi_lyrics, true)}
                                    </section>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Auto-Scroll Button */}
                <div className="fixed bottom-6 right-5 z-50 flex items-center gap-2">
                    {isAutoScrolling && (
                        <div className="flex items-center gap-1 bg-[#1A1A1A] border border-white/10 rounded-full p-1 shadow-2xl animate-fade-in">
                            {([1, 2, 3] as const).map((spd) => (
                                <button
                                    key={spd}
                                    type="button"
                                    onClick={() => setScrollSpeed(spd)}
                                    className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                                        scrollSpeed === spd
                                            ? 'bg-amber-500 text-black font-black'
                                            : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    {spd}x
                                </button>
                            ))}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                        className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all ${
                            isAutoScrolling
                                ? 'bg-amber-500 text-black shadow-amber-500/40 ring-4 ring-amber-500/20'
                                : 'bg-[#181818] text-white/80 hover:bg-[#252525] border border-white/10'
                        }`}
                        title={isAutoScrolling ? 'Stop Auto-Scroll' : 'Start Auto-Scroll'}
                    >
                        {isAutoScrolling ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                </div>
            </div>
        );
    }

    // MAIN VIEW: Offline Songbook Library List
    return (
        <div className="min-h-screen bg-[#02000F] text-white font-sans pb-24 selection:bg-amber-500 selection:text-black">
            {/* Top Status Bar */}
            <div className="sticky top-0 z-40 bg-[#02000F]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                        <WifiOff className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                            <span>COJ Offline Songbook</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {offlineSongs.length} Songs Loaded
                            </span>
                        </h1>
                        <p className="text-xs text-white/50 font-medium">
                            {isOnline
                                ? 'Internet restored! You can go online.'
                                : 'No internet detected. Everything below works 100% offline.'}
                        </p>
                    </div>
                </div>

                {isOnline ? (
                    <button
                        type="button"
                        onClick={() => { window.location.href = '/'; }}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Go Online</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSafeRetry}
                        disabled={isCheckingNetwork}
                        className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isCheckingNetwork ? 'animate-spin text-amber-400' : ''}`} />
                        <span>{isCheckingNetwork ? 'Checking...' : 'Retry'}</span>
                    </button>
                )}
            </div>

            {/* In-page friendly retry notice if still offline */}
            {retryMessage && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4">
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-2.5 animate-fade-in">
                        <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>{retryMessage}</span>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-5">
                {/* Worship Quick Tools */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Link
                        href="/tools/tuner"
                        className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-amber-500/30 transition-all flex items-center gap-3 group active:scale-98"
                    >
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                            <Guitar className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">Guitar Tuner</div>
                            <div className="text-[11px] text-white/40">Offline pitch detector</div>
                        </div>
                    </Link>

                    <Link
                        href="/tools/pad"
                        className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-blue-500/30 transition-all flex items-center gap-3 group active:scale-98"
                    >
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                            <Disc3 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">Infinity Pad</div>
                            <div className="text-[11px] text-white/40">Ambient pad generator</div>
                        </div>
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search songs, artist, lyrics offline..."
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                </div>

                {/* Song List */}
                <div className="space-y-2">
                    <div className="text-xs font-bold text-white/40 uppercase tracking-wider px-1">
                        Offline Available Tracks ({filteredSongs.length})
                    </div>

                    {filteredSongs.length === 0 ? (
                        <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/5 text-white/40 text-sm">
                            No matching songs found in offline library.
                        </div>
                    ) : (
                        filteredSongs.map((song) => (
                            <button
                                key={song.id}
                                type="button"
                                onClick={() => setSelectedSong(song)}
                                className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 active:border-amber-500/40 transition-all flex items-center justify-between group active:scale-[0.99] cursor-pointer"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors shrink-0">
                                        <Music className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                                            {song.title}
                                        </div>
                                        <div className="text-xs text-white/40 flex items-center gap-2 truncate">
                                            <span>{song.artist || 'Worship'}</span>
                                            {song.key && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-amber-400/80 font-bold font-mono">Key: {song.key}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/5 hidden sm:inline-block">
                                        Chords & Lyrics
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-amber-400 transition-colors" />
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
