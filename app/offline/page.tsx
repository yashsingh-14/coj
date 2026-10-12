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
    ChevronUp,
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
    Maximize2,
    X,
    Sliders,
    Sparkles
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
    const [expandedSongId, setExpandedSongId] = useState<string | null>(null);
    const [fullscreenSong, setFullscreenSong] = useState<Song | null>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);
    const [networkStatusText, setNetworkStatusText] = useState<string | null>(null);

    // Global transpositions per song: { [songId]: transposeSemis }
    const [songTranspositions, setSongTranspositions] = useState<Record<string, number>>({});
    // Active tab per song: { [songId]: 'chords' | 'lyrics' | 'hindi' | 'all' }
    const [songTabs, setSongTabs] = useState<Record<string, 'chords' | 'lyrics' | 'hindi' | 'all'>>({});
    // Font size
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

        const handleOnline = () => {
            setIsOnline(true);
            setNetworkStatusText('Internet restored! Click "Go Online" when you are ready.');
        };

        const handleOffline = () => {
            setIsOnline(false);
            setNetworkStatusText('Aap Offline mode me hain. Saare songs & chords safely available hain.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Load synced offline songs from localStorage cache if available
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

    // Auto-scroll loop for stage mode
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

    // Safe Retry Handler (Never crashes or navigates to broken pages)
    const handleSafeRetry = async () => {
        setIsCheckingNetwork(true);
        setNetworkStatusText('Internet connectivity check kiya ja raha hai...');

        try {
            // Check online status
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                setIsCheckingNetwork(false);
                setNetworkStatusText('Device abhi bhi offline hai. Mobile data ya Wi-Fi check karein.');
                setTimeout(() => setNetworkStatusText(null), 4000);
                return;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);

            const res = await fetch('/api/health?_t=' + Date.now(), {
                cache: 'no-store',
                signal: controller.signal
            }).catch(() => null);

            clearTimeout(timeoutId);

            if (res && res.ok) {
                setIsOnline(true);
                setNetworkStatusText('Internet connect ho gaya! Redirecting to Home...');
                setTimeout(() => {
                    window.location.href = '/';
                }, 800);
                return;
            }
        } catch { }

        setIsCheckingNetwork(false);
        setIsOnline(false);
        setNetworkStatusText('Abhi network reach nahi ho pa raha hai. Aap offline songbook freely use kar sakte hain.');
        setTimeout(() => setNetworkStatusText(null), 4000);
    };

    // Toggle card expansion
    const toggleSongExpand = (songId: string) => {
        setExpandedSongId(prev => prev === songId ? null : songId);
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

        let text = `${song.title} - ${song.artist || 'Call of Jesus Worship'}\nKey: ${curKey}\n\n`;

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

    // Render Chords (ChordPro format)
    const renderChords = (chordsText?: string, transposeAmount = 0) => {
        if (!chordsText || chordsText.trim().length === 0) {
            return <p className="text-white/40 text-xs italic">No chords recorded for this song.</p>;
        }

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
        if (!lyricsText || lyricsText.trim().length === 0) {
            return <p className="text-white/40 text-xs italic">No lyrics recorded for this song.</p>;
        }

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

    // ─── FULLSCREEN STAGE VIEW ──────────────────────────────────────
    if (fullscreenSong) {
        const currentTrans = getTranspose(fullscreenSong.id);
        const origKey = fullscreenSong.key || 'C';
        const curKey = transposeChord(origKey, currentTrans, false);
        const activeTab = getActiveTab(fullscreenSong);

        return (
            <div className="min-h-screen bg-[#02000F] text-white font-sans selection:bg-amber-500 selection:text-black pb-32">
                {/* Stage Header */}
                <header className="sticky top-0 z-40 bg-[#060410]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xl">
                    <button
                        type="button"
                        onClick={() => setFullscreenSong(null)}
                        className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white/80 hover:text-white py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4 text-amber-400" />
                        <span>Songbook</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                            Key: {curKey}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span>Stage Mode</span>
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white">{fullscreenSong.title}</h1>
                        <p className="text-xs sm:text-sm text-white/50 mt-0.5">{fullscreenSong.artist || 'Call of Jesus Worship'}</p>
                    </div>

                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-2 py-3 border-y border-white/10 flex-wrap">
                        {/* Transpose Controls */}
                        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
                            <button
                                onClick={() => setTranspose(fullscreenSong.id, currentTrans - 1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80"
                                title="Transpose -1 Semitone"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setTranspose(fullscreenSong.id, 0)}
                                className="px-2.5 py-0.5 text-xs font-bold text-amber-400 font-mono"
                                title="Reset Original Key"
                            >
                                {curKey} {currentTrans !== 0 && `(${currentTrans > 0 ? `+${currentTrans}` : currentTrans})`}
                            </button>
                            <button
                                onClick={() => setTranspose(fullscreenSong.id, currentTrans + 1)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80"
                                title="Transpose +1 Semitone"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Font Size & Copy */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/5 text-xs">
                                <button onClick={() => setFontSize(s => Math.max(12, s - 1))} className="w-7 h-7 font-bold text-white/70 hover:text-white">A-</button>
                                <span className="text-[11px] font-mono text-amber-400 px-1.5">{fontSize}</span>
                                <button onClick={() => setFontSize(s => Math.min(26, s + 1))} className="w-7 h-7 font-bold text-white/70 hover:text-white">A+</button>
                            </div>

                            <button
                                onClick={() => handleCopy(fullscreenSong)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10"
                            >
                                {copiedId === fullscreenSong.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                                <span>{copiedId === fullscreenSong.id ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Language / Mode Tabs */}
                    <div className="flex items-center gap-1.5">
                        {fullscreenSong.chords && (
                            <button
                                onClick={() => setActiveTab(fullscreenSong.id, 'chords')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'chords' ? 'bg-amber-500 text-black font-black shadow-md' : 'bg-white/5 text-white/60 hover:text-white'}`}
                            >
                                Chords
                            </button>
                        )}
                        {fullscreenSong.lyrics && (
                            <button
                                onClick={() => setActiveTab(fullscreenSong.id, 'lyrics')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'lyrics' ? 'bg-amber-500 text-black font-black shadow-md' : 'bg-white/5 text-white/60 hover:text-white'}`}
                            >
                                Hinglish
                            </button>
                        )}
                        {fullscreenSong.hindi_lyrics && (
                            <button
                                onClick={() => setActiveTab(fullscreenSong.id, 'hindi')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'hindi' ? 'bg-amber-500 text-black font-black shadow-md' : 'bg-white/5 text-white/60 hover:text-white'}`}
                            >
                                हिन्दी
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab(fullscreenSong.id, 'all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-amber-500 text-black font-black shadow-md' : 'bg-white/5 text-white/40 hover:text-white'}`}
                        >
                            All
                        </button>
                    </div>

                    {/* Stage Content Card */}
                    <div className="bg-[#0A0814]/90 border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-x-auto leading-relaxed">
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
                </main>

                {/* Floating Auto-Scroll Control */}
                <aside aria-label="Stage Teleprompter Controls" className="fixed bottom-6 right-5 z-50 flex items-center gap-2">
                    {isAutoScrolling && (
                        <div className="flex items-center gap-1 bg-[#1A1828] border border-white/15 rounded-full p-1 shadow-2xl backdrop-blur-md">
                            {([1, 2, 3] as const).map((spd) => (
                                <button
                                    key={spd}
                                    onClick={() => setScrollSpeed(spd)}
                                    className={`w-7 h-7 rounded-full text-xs font-bold transition-colors ${scrollSpeed === spd ? 'bg-amber-500 text-black font-black' : 'text-white/60'}`}
                                >
                                    {spd}x
                                </button>
                            ))}
                        </div>
                    )}
                    <button
                        onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                        className={`w-13 h-13 p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-95 ${isAutoScrolling ? 'bg-amber-500 text-black' : 'bg-[#181624] text-white/90 border border-white/15'}`}
                        title={isAutoScrolling ? 'Stop Auto-Scroll' : 'Start Auto-Scroll'}
                    >
                        {isAutoScrolling ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                </aside>
            </div>
        );
    }

    // ─── MAIN OFFLINE SONGBOOK LIST VIEW ────────────────────────────
    return (
        <div className="min-h-screen bg-[#02000F] text-white font-sans pb-28 selection:bg-amber-500 selection:text-black relative">
            {/* Ambient Background Aura */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px]" />
            </div>

            {/* Top Status Bar */}
            <header className="sticky top-0 z-40 bg-[#02000F]/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 shrink-0">
                        <WifiOff className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                            <span>COJ Offline Songbook</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {offlineSongs.length} Ready
                            </span>
                        </h1>
                        <p className="text-xs text-white/50 font-medium">
                            {isOnline
                                ? 'Internet restored! Ready to sync.'
                                : '100% Offline Mode. Tap any song to open lyrics & chords.'}
                        </p>
                    </div>
                </div>

                {isOnline ? (
                    <button
                        type="button"
                        onClick={() => { window.location.href = '/'; }}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95"
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
                        <span>{isCheckingNetwork ? 'Checking...' : 'Check Net'}</span>
                    </button>
                )}
            </header>

            {/* In-page friendly notice */}
            {networkStatusText && (
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-3">
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center gap-2.5">
                        <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>{networkStatusText}</span>
                    </div>
                </div>
            )}

            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-4">
                {/* Quick Worship Tools Tiles */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/tools/tuner"
                        className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-amber-500/40 transition-all flex items-center gap-3.5 group active:scale-98 shadow-md"
                    >
                        <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                            <Guitar className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                                Guitar Tuner
                            </div>
                            <div className="text-[11px] text-white/40">Offline pitch detector</div>
                        </div>
                    </Link>

                    <Link
                        href="/tools/pad"
                        className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-blue-500/40 transition-all flex items-center gap-3.5 group active:scale-98 shadow-md"
                    >
                        <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 group-hover:scale-110 transition-transform">
                            <Disc3 className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                Infinity Pad
                            </div>
                            <div className="text-[11px] text-white/40">Pads & sermon background</div>
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
                        placeholder="Search songs, artist, or lyrics offline..."
                        className="w-full bg-[#0A0814] border border-white/10 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 shadow-inner"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${
                                selectedCategory === cat
                                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-black'
                                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
                            }`}
                        >
                            {cat === 'all' ? `All Songs (${offlineSongs.length})` : cat.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                {/* Interactive Song List */}
                <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-white/40 uppercase tracking-wider">
                            Available Tracks ({filteredSongs.length})
                        </span>
                        <span className="text-[11px] text-white/30">
                            Tap any card to view chords & lyrics
                        </span>
                    </div>

                    {filteredSongs.length === 0 ? (
                        <div className="p-8 text-center rounded-3xl bg-white/5 border border-white/5 text-white/40 text-sm">
                            No matching songs found in offline library.
                        </div>
                    ) : (
                        filteredSongs.map((song) => {
                            const isExpanded = expandedSongId === song.id;
                            const trans = getTranspose(song.id);
                            const origKey = song.key || 'C';
                            const curKey = transposeChord(origKey, trans, false);
                            const activeTab = getActiveTab(song);

                            return (
                                <div
                                    key={song.id}
                                    className={`rounded-2xl border transition-all overflow-hidden ${
                                        isExpanded
                                            ? 'bg-[#0E0C18] border-amber-500/40 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/20'
                                            : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                                    }`}
                                >
                                    {/* Touchable Card Header */}
                                    <div
                                        onClick={() => toggleSongExpand(song.id)}
                                        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none gap-3"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                                                isExpanded
                                                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                                    : 'bg-amber-500/10 text-amber-400'
                                            }`}>
                                                <Music className="w-4 h-4" />
                                            </div>

                                            <div className="min-w-0">
                                                <h2 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-amber-400">
                                                    {song.title}
                                                </h2>
                                                <div className="text-xs text-white/40 flex items-center gap-2 truncate mt-0.5">
                                                    <span>{song.artist || 'Call of Jesus'}</span>
                                                    {song.key && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-amber-400/80 font-mono font-bold">Key: {curKey}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-colors ${
                                                isExpanded
                                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                                    : 'bg-white/5 text-white/50 border-white/5'
                                            }`}>
                                                {isExpanded ? 'Hide' : 'View'}
                                            </span>
                                            {isExpanded ? (
                                                <ChevronUp className="w-4 h-4 text-amber-400" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-white/40" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Drawer */}
                                    {isExpanded && (
                                        <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-white/10 space-y-3.5">
                                            {/* In-Card Toolbar */}
                                            <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                                                {/* Transpose Controls */}
                                                <div className="flex items-center gap-1 bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setTranspose(song.id, trans - 1); }}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80 active:scale-90"
                                                        title="Transpose -1"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setTranspose(song.id, 0); }}
                                                        className="px-2 py-0.5 text-xs font-bold text-amber-400 font-mono"
                                                        title="Reset Key"
                                                    >
                                                        {curKey} {trans !== 0 && `(${trans > 0 ? `+${trans}` : trans})`}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setTranspose(song.id, trans + 1); }}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/15 text-white/80 active:scale-90"
                                                        title="Transpose +1"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2">
                                                    {/* Copy */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleCopy(song); }}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10"
                                                    >
                                                        {copiedId === song.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                                                        <span>{copiedId === song.id ? 'Copied' : 'Copy'}</span>
                                                    </button>

                                                    {/* Fullscreen Stage Mode */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setFullscreenSong(song); }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20 active:scale-95"
                                                    >
                                                        <Maximize2 className="w-3.5 h-3.5" />
                                                        <span>Stage View</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tabs */}
                                            <div className="flex items-center gap-1.5">
                                                {song.chords && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setActiveTab(song.id, 'chords'); }}
                                                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${activeTab === 'chords' ? 'bg-amber-500 text-black font-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
                                                    >
                                                        Chords
                                                    </button>
                                                )}
                                                {song.lyrics && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setActiveTab(song.id, 'lyrics'); }}
                                                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${activeTab === 'lyrics' ? 'bg-amber-500 text-black font-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
                                                    >
                                                        Hinglish
                                                    </button>
                                                )}
                                                {song.hindi_lyrics && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setActiveTab(song.id, 'hindi'); }}
                                                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${activeTab === 'hindi' ? 'bg-amber-500 text-black font-black' : 'bg-white/5 text-white/60 hover:text-white'}`}
                                                    >
                                                        हिन्दी
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setActiveTab(song.id, 'all'); }}
                                                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-amber-500 text-black font-black' : 'bg-white/5 text-white/40 hover:text-white'}`}
                                                >
                                                    All
                                                </button>
                                            </div>

                                            {/* Body View */}
                                            <div className="bg-[#07050E] border border-white/5 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm overflow-x-auto leading-relaxed">
                                                {activeTab === 'chords' && renderChords(song.chords, trans)}
                                                {activeTab === 'lyrics' && renderLyrics(song.lyrics, false)}
                                                {activeTab === 'hindi' && renderLyrics(song.hindi_lyrics, true)}
                                                {activeTab === 'all' && (
                                                    <div className="space-y-5">
                                                        {song.chords && (
                                                            <div>
                                                                <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-2 border-b border-white/10 pb-1">Chords & Lyrics</div>
                                                                {renderChords(song.chords, trans)}
                                                            </div>
                                                        )}
                                                        {song.lyrics && (
                                                            <div>
                                                                <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-2 border-b border-white/10 pb-1">Hinglish Lyrics</div>
                                                                {renderLyrics(song.lyrics, false)}
                                                            </div>
                                                        )}
                                                        {song.hindi_lyrics && (
                                                            <div>
                                                                <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-2 border-b border-white/10 pb-1">हिन्दी Lyrics</div>
                                                                {renderLyrics(song.hindi_lyrics, true)}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}
