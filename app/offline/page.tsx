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
    ChevronDown,
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
    Maximize2
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
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [fullscreenSong, setFullscreenSong] = useState<Song | null>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);
    const [retryMessage, setRetryMessage] = useState<string | null>(null);

    // Global transpositions per song: { [songId]: transposeSemis }
    const [songTranspositions, setSongTranspositions] = useState<Record<string, number>>({});
    // Active tab per song: { [songId]: 'chords' | 'lyrics' | 'hindi' | 'all' }
    const [songTabs, setSongTabs] = useState<Record<string, 'chords' | 'lyrics' | 'hindi' | 'all'>>({});
    // Font size per song
    const [fontSize, setFontSize] = useState(15);
    // Copy feedback
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Fullscreen auto-scroll
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState<1 | 2 | 3>(1);
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Online/offline detection
    useEffect(() => {
        setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : false);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Load synced offline songs from localStorage if available
        try {
            const cached = localStorage.getItem('coj_offline_songs_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setOfflineSongs(parsed);
                }
            }
        } catch { }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Auto-scroll loop for fullscreen mode
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

    // Categories available
    const categories = useMemo(() => {
        const cats = Array.from(new Set(offlineSongs.map(s => s.category).filter(Boolean)));
        return ['all', ...cats];
    }, [offlineSongs]);

    // Filtered songs
    const filteredSongs = useMemo(() => {
        let list = offlineSongs;
        if (selectedCategory !== 'all') {
            list = list.filter(s => s.category === selectedCategory);
        }

        const q = searchQuery.toLowerCase().trim();
        if (!q) return list;

        return list.filter(s =>
            (s.title || '').toLowerCase().includes(q) ||
            (s.artist || '').toLowerCase().includes(q) ||
            (s.lyrics || '').toLowerCase().includes(q) ||
            (s.hindi_lyrics || '').toLowerCase().includes(q)
        );
    }, [offlineSongs, selectedCategory, searchQuery]);

    // Safe Retry Handler
    const handleSafeRetry = async () => {
        setIsCheckingNetwork(true);
        setRetryMessage(null);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch('/manifest.json?_t=' + Date.now(), {
                cache: 'no-store',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                window.location.href = '/';
                return;
            }
        } catch { }

        setIsCheckingNetwork(false);
        setRetryMessage('Abhi bhi internet connect nahi hua hai. Data/Wi-Fi check karein.');
        setTimeout(() => setRetryMessage(null), 4000);
    };

    // Transpose helper
    const getTranspose = (songId: string) => songTranspositions[songId] || 0;
    const setTranspose = (songId: string, val: number) => {
        setSongTranspositions(prev => ({ ...prev, [songId]: val }));
    };

    // Tab helper
    const getActiveTab = (song: Song) => {
        if (songTabs[song.id]) return songTabs[song.id];
        if (song.chords && song.chords.trim().length > 0) return 'chords';
        if (song.lyrics && song.lyrics.trim().length > 0) return 'lyrics';
        return 'all';
    };

    const setActiveTab = (songId: string, tab: 'chords' | 'lyrics' | 'hindi' | 'all') => {
        setSongTabs(prev => ({ ...prev, [songId]: tab }));
    };

    // Copy to clipboard
    const handleCopy = async (song: Song) => {
        const trans = getTranspose(song.id);
        const origKey = song.key || 'C';
        const curKey = transposeChord(origKey, trans, false);
        const currentTab = getActiveTab(song);

        let text = `${song.title} - ${song.artist || 'Worship'}\nKey: ${curKey}\n\n`;

        if (currentTab === 'chords' && song.chords) {
            let trChords = song.chords;
            if (trans !== 0) {
                trChords = song.chords.replace(/\[([A-G][#b]?[^\]]*)\]/g, (match, chord) => {
                    const isChord = isValidChord(chord);
                    return isChord ? `[${transposeChord(chord, trans, false)}]` : match;
                });
            }
            text += trChords;
        } else if (currentTab === 'hindi' && song.hindi_lyrics) {
            text += song.hindi_lyrics;
        } else {
            text += song.lyrics || '';
        }

        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(song.id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch { }
    };

    // Render Chords (ChordPro)
    const renderChords = (chordsText?: string, transposeAmount = 0) => {
        if (!chordsText) return <p className="text-white/40 text-xs italic">No chords available for this song.</p>;

        return chordsText.split('\n').map((line, lineIndex) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lineIndex} className="h-2" />;

            const headerMatch = trimmed.match(/^(?:\[)?(Intro|Verse|Chorus|Bridge|Pre-Chorus|PreChorus|Outro|Interlude|Ending|Instrumental)(?:[\s\d:]*)?(?:\])?$/i) || trimmed.match(/^\[.*\]$/);
            if (headerMatch) {
                return (
                    <div key={lineIndex} className="mt-3.5 mb-1.5 first:mt-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2 py-0.5 rounded shadow-sm inline-block">
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
                <div key={lineIndex} className="flex flex-wrap items-end mb-2 w-full">
                    {segments.map((seg, idx) => {
                        const isChord = seg.chord ? isValidChord(seg.chord) : false;
                        const transposed = (seg.chord && isChord) ? transposeChord(seg.chord, transposeAmount, false) : null;

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
                                            const tokenTransposed = isTokenChord ? transposeChord(token.trim(), transposeAmount, false) : null;

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
        if (!lyricsText) return <p className="text-white/40 text-xs italic">No lyrics available.</p>;

        return lyricsText.split('\n').map((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={index} className="h-2" />;

            const isHeader = /^\[.*\]$/.test(trimmed) || /^(?:\[)?(Intro|Verse|Chorus|Bridge|Pre-Chorus|PreChorus|Outro|Interlude|Ending|Instrumental)(?:[\s\d:]*)?(?:\])?$/i.test(trimmed);
            if (isHeader) {
                return (
                    <div key={index} className="mt-3.5 mb-1.5 first:mt-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/25 px-2 py-0.5 rounded shadow-sm inline-block">
                            {trimmed.replace(/[\[\]:]/g, '').trim()}
                        </span>
                    </div>
                );
            }

            return (
                <p
                    key={index}
                    className={`mb-1 leading-relaxed text-white/90 whitespace-pre-wrap ${isDevanagari ? 'font-serif' : 'font-medium'} break-words`}
                    style={{ fontSize: `${isDevanagari ? fontSize + 1 : fontSize}px` }}
                >
                    {line}
                </p>
            );
        });
    };

    // FULLSCREEN STAGE VIEW
    if (fullscreenSong) {
        const currentTrans = getTranspose(fullscreenSong.id);
        const origKey = fullscreenSong.key || 'C';
        const curKey = transposeChord(origKey, currentTrans, false);
        const activeTab = getActiveTab(fullscreenSong);

        return (
            <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500 selection:text-black pb-28">
                {/* Header */}
                <div className="sticky top-0 z-40 bg-[#080808]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl">
                    <button
                        type="button"
                        onClick={() => setFullscreenSong(null)}
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white/80 hover:text-white py-1 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5"
                    >
                        <ArrowLeft className="w-4 h-4 text-amber-400" />
                        <span>Back to Songbook</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            Key: {curKey}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span>Offline</span>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <h1 className="text-2xl sm:text-3xl font-black text-white">{fullscreenSong.title}</h1>
                    <p className="text-xs sm:text-sm text-white/50">{fullscreenSong.artist || 'Worship'}</p>

                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-2 mt-4 pb-3 border-b border-white/10 flex-wrap">
                        {/* Transpose */}
                        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
                            <button
                                onClick={() => setTranspose(fullscreenSong.id, currentTrans - 1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setTranspose(fullscreenSong.id, 0)}
                                className="px-2 py-0.5 text-xs font-bold text-amber-400 font-mono"
                            >
                                {curKey} {currentTrans !== 0 && `(${currentTrans > 0 ? `+${currentTrans}` : currentTrans})`}
                            </button>
                            <button
                                onClick={() => setTranspose(fullscreenSong.id, currentTrans + 1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Font size & Copy */}
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/5 text-xs">
                                <button onClick={() => setFontSize(s => Math.max(12, s - 1))} className="w-6 h-6 font-bold text-white/70">A-</button>
                                <span className="text-[11px] font-mono text-amber-400 px-1">{fontSize}</span>
                                <button onClick={() => setFontSize(s => Math.min(24, s + 1))} className="w-6 h-6 font-bold text-white/70">A+</button>
                            </div>

                            <button
                                onClick={() => handleCopy(fullscreenSong)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10"
                            >
                                {copiedId === fullscreenSong.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                                <span>{copiedId === fullscreenSong.id ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1.5 my-3">
                        {fullscreenSong.chords && (
                            <button
                                onClick={() => setActiveTab(fullscreenSong.id, 'chords')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${activeTab === 'chords' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60'}`}
                            >
                                Chords
                            </button>
                        )}
                        {fullscreenSong.lyrics && (
                            <button
                                onClick={() => setActiveTab(fullscreenSong.id, 'lyrics')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${activeTab === 'lyrics' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60'}`}
                            >
                                Hinglish
                            </button>
                        )}
                        {fullscreenSong.hindi_lyrics && (
                            <button
                                onClick={() => setActiveTab(fullscreenSong.id, 'hindi')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${activeTab === 'hindi' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60'}`}
                            >
                                हिन्दी
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab(fullscreenSong.id, 'all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${activeTab === 'all' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/40'}`}
                        >
                            All
                        </button>
                    </div>

                    {/* Content */}
                    <div className="bg-[#0C0C0C]/80 border border-white/5 rounded-2xl p-4 sm:p-6 shadow-2xl overflow-x-auto">
                        {activeTab === 'chords' && renderChords(fullscreenSong.chords, currentTrans)}
                        {activeTab === 'lyrics' && renderLyrics(fullscreenSong.lyrics, false)}
                        {activeTab === 'hindi' && renderLyrics(fullscreenSong.hindi_lyrics, true)}
                        {activeTab === 'all' && (
                            <div className="space-y-6">
                                {fullscreenSong.chords && (
                                    <section>
                                        <h3 className="text-xs font-bold uppercase text-amber-500 mb-2 border-b border-white/10 pb-1">Chords & Lyrics</h3>
                                        {renderChords(fullscreenSong.chords, currentTrans)}
                                    </section>
                                )}
                                {fullscreenSong.lyrics && (
                                    <section>
                                        <h3 className="text-xs font-bold uppercase text-amber-500 mb-2 border-b border-white/10 pb-1">Hinglish Lyrics</h3>
                                        {renderLyrics(fullscreenSong.lyrics, false)}
                                    </section>
                                )}
                                {fullscreenSong.hindi_lyrics && (
                                    <section>
                                        <h3 className="text-xs font-bold uppercase text-amber-500 mb-2 border-b border-white/10 pb-1">हिन्दी Lyrics</h3>
                                        {renderLyrics(fullscreenSong.hindi_lyrics, true)}
                                    </section>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Auto Scroll */}
                <div className="fixed bottom-6 right-5 z-50 flex items-center gap-2">
                    {isAutoScrolling && (
                        <div className="flex items-center gap-1 bg-[#1A1A1A] border border-white/10 rounded-full p-1 shadow-2xl">
                            {([1, 2, 3] as const).map((spd) => (
                                <button
                                    key={spd}
                                    onClick={() => setScrollSpeed(spd)}
                                    className={`w-7 h-7 rounded-full text-xs font-bold ${scrollSpeed === spd ? 'bg-amber-500 text-black font-black' : 'text-white/60'}`}
                                >
                                    {spd}x
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                        className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center ${isAutoScrolling ? 'bg-amber-500 text-black' : 'bg-[#181818] text-white/80 border border-white/10'}`}
                        title={isAutoScrolling ? 'Stop Auto-Scroll' : 'Start Auto-Scroll'}
                    >
                        {isAutoScrolling ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                </div>
            </div>
        );
    }

    // MAIN OFFLINE SONGBOOK LIST VIEW
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
                                {offlineSongs.length} Songs Ready
                            </span>
                        </h1>
                        <p className="text-xs text-white/50 font-medium">
                            {isOnline
                                ? 'Internet restored! Tap Go Online to resume.'
                                : '100% Offline Mode. Tap any song to view lyrics & chords.'}
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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-3">
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-2.5">
                        <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>{retryMessage}</span>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 space-y-4">
                {/* Worship Quick Tools */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/tools/tuner"
                        className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-amber-500/30 transition-all flex items-center gap-3 group active:scale-98"
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
                        className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/5 hover:border-blue-500/30 transition-all flex items-center gap-3 group active:scale-98"
                    >
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                            <Disc3 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white">Infinity Pad</div>
                            <div className="text-[11px] text-white/40">Ambient pad & rhythm</div>
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
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
                    />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${
                                selectedCategory === cat
                                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                            }`}
                        >
                            {cat === 'all' ? `All Songs (${offlineSongs.length})` : cat.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                {/* Native Touchable Accordion Song Cards */}
                <div className="space-y-3">
                    <div className="text-xs font-bold text-white/40 uppercase tracking-wider px-1">
                        Available Offline Tracks ({filteredSongs.length})
                    </div>

                    {filteredSongs.length === 0 ? (
                        <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/5 text-white/40 text-sm">
                            No matching songs found in offline library.
                        </div>
                    ) : (
                        filteredSongs.map((song) => {
                            const trans = getTranspose(song.id);
                            const origKey = song.key || 'C';
                            const curKey = transposeChord(origKey, trans, false);
                            const activeTab = getActiveTab(song);

                            return (
                                <details
                                    key={song.id}
                                    className="group rounded-2xl bg-white/[0.03] border border-white/5 open:border-amber-500/40 open:bg-white/[0.05] transition-all overflow-hidden"
                                >
                                    {/* Native Touchable Header Summary */}
                                    <summary className="list-none cursor-pointer p-4 flex items-center justify-between select-none">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-open:bg-amber-500 group-open:text-black transition-colors shrink-0">
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
                                                            <span className="text-amber-400/80 font-bold font-mono">Key: {curKey}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/5 group-open:bg-amber-500/20 group-open:text-amber-300">
                                                Tap to View
                                            </span>
                                            <ChevronDown className="w-4 h-4 text-white/30 group-open:rotate-180 transition-transform" />
                                        </div>
                                    </summary>

                                    {/* Expanded Lyrics and Chords Drawer */}
                                    <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3">
                                        {/* In-Card Toolbar */}
                                        <div className="flex items-center justify-between gap-2 flex-wrap pt-2">
                                            {/* Transpose Controls */}
                                            <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setTranspose(song.id, trans - 1); }}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80 active:scale-90"
                                                    title="Transpose -1"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setTranspose(song.id, 0); }}
                                                    className="px-2 py-0.5 text-xs font-bold text-amber-400 font-mono"
                                                    title="Reset Key"
                                                >
                                                    {curKey} {trans !== 0 && `(${trans > 0 ? `+${trans}` : trans})`}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setTranspose(song.id, trans + 1); }}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80 active:scale-90"
                                                    title="Transpose +1"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-1.5">
                                                {/* Copy */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); handleCopy(song); }}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10"
                                                >
                                                    {copiedId === song.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                                                    <span>{copiedId === song.id ? 'Copied' : 'Copy'}</span>
                                                </button>

                                                {/* Fullscreen Stage Mode */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setFullscreenSong(song); }}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 shadow-md shadow-amber-500/20"
                                                >
                                                    <Maximize2 className="w-3.5 h-3.5" />
                                                    <span>Stage View</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tabs */}
                                        <div className="flex items-center gap-1.5 pt-1">
                                            {song.chords && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setActiveTab(song.id, 'chords'); }}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === 'chords' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
                                                >
                                                    Chords
                                                </button>
                                            )}
                                            {song.lyrics && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setActiveTab(song.id, 'lyrics'); }}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === 'lyrics' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
                                                >
                                                    Hinglish
                                                </button>
                                            )}
                                            {song.hindi_lyrics && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); setActiveTab(song.id, 'hindi'); }}
                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === 'hindi' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
                                                >
                                                    हिन्दी
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setActiveTab(song.id, 'all'); }}
                                                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-amber-500 text-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                                            >
                                                All
                                            </button>
                                        </div>

                                        {/* Chords & Lyrics Display Body */}
                                        <div className="bg-[#080808] border border-white/5 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm overflow-x-auto leading-relaxed">
                                            {activeTab === 'chords' && renderChords(song.chords, trans)}
                                            {activeTab === 'lyrics' && renderLyrics(song.lyrics, false)}
                                            {activeTab === 'hindi' && renderLyrics(song.hindi_lyrics, true)}
                                            {activeTab === 'all' && (
                                                <div className="space-y-4">
                                                    {song.chords && (
                                                        <div>
                                                            <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1.5 border-b border-white/5 pb-1">Chords & Lyrics</div>
                                                            {renderChords(song.chords, trans)}
                                                        </div>
                                                    )}
                                                    {song.lyrics && (
                                                        <div>
                                                            <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1.5 border-b border-white/5 pb-1">Hinglish Lyrics</div>
                                                            {renderLyrics(song.lyrics, false)}
                                                        </div>
                                                    )}
                                                    {song.hindi_lyrics && (
                                                        <div>
                                                            <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1.5 border-b border-white/5 pb-1">हिन्दी Lyrics</div>
                                                            {renderLyrics(song.hindi_lyrics, true)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </details>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
