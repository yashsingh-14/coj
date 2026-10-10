'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, WifiOff, Music, Guitar, Disc3, ArrowLeft, RefreshCw, Sparkles, ChevronRight } from 'lucide-react';
import { ALL_SONGS } from '@/data/songs';
import { Song } from '@/data/types';
import SongViewer from '@/components/songs/SongViewer';

export default function OfflinePage() {
    const [offlineSongs, setOfflineSongs] = useState<Song[]>(ALL_SONGS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        setIsOnline(navigator.onLine);

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
        } catch {
            // Fallback to ALL_SONGS
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

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

    // If viewing a specific song offline
    if (selectedSong) {
        return (
            <div className="min-h-screen bg-[#02000F] text-white">
                <div className="sticky top-0 z-50 bg-[#02000F]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setSelectedSong(null)}
                        className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Offline Songbook</span>
                    </button>
                    <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Offline Ready</span>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-2 sm:px-4 py-6">
                    <SongViewer
                        songId={selectedSong.id}
                        title={selectedSong.title}
                        author={selectedSong.artist || 'Worship'}
                        originalKey={selectedSong.key || 'C'}
                        lyrics={selectedSong.lyrics || ''}
                        hindiLyrics={selectedSong.hindi_lyrics || selectedSong.hindiLyrics || ''}
                        chords={selectedSong.chords || ''}
                        youtubeId={selectedSong.youtube_id || selectedSong.youtubeId || ''}
                        category={selectedSong.category}
                        tempo={selectedSong.tempo}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#02000F] text-white font-sans pb-24 selection:bg-amber-500 selection:text-black">
            {/* Top Status Bar */}
            <div className="sticky top-0 z-40 bg-[#02000F]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <WifiOff className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                            <span>COJ Offline Songbook</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {offlineSongs.length} Songs Loaded
                            </span>
                        </h1>
                        <p className="text-xs text-white/40 font-medium">
                            {isOnline ? 'Internet restored! You can go online.' : 'No internet detected. Everything below works 100% offline.'}
                        </p>
                    </div>
                </div>

                {isOnline ? (
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Go Online</span>
                    </button>
                ) : (
                    <button
                        onClick={() => window.location.reload()}
                        className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all border border-white/5 flex items-center gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                    </button>
                )}
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Worship Quick Tools */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <Link
                        href="/tools/tuner"
                        className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all flex items-center gap-3 group"
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
                        className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all flex items-center gap-3 group"
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
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-colors"
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
                                onClick={() => setSelectedSong(song)}
                                className="w-full text-left p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
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
                                                    <span className="text-amber-400/80 font-bold">Key: {song.key}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5 hidden sm:inline-block">
                                        View Chords
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
