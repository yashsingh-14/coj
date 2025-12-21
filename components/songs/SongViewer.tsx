'use client';

import { useState } from 'react';
import { transposeChord } from '@/lib/music';
import { ArrowLeft, Clock, Heart, Minus, Play, PlayCircle, Plus } from 'lucide-react';
import Link from 'next/link';

interface SongViewerProps {
    title: string;
    author: string;
    originalKey: string;
    lyrics: string;
    chords?: string;
    youtubeId?: string;
    category?: string;
    duration?: string;
    plays?: string;
    tempo?: string;
    relatedSongs?: {
        title: string;
        slug: string;
        artist: string;
    }[];
}

export default function SongViewer({ title, author, originalKey, lyrics, chords, youtubeId, category, duration, plays, tempo, relatedSongs }: SongViewerProps) {
    const [transpose, setTranspose] = useState(0);
    const [fontSize, setFontSize] = useState(18);
    const [useFlats, setUseFlats] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);
    const [showVideo, setShowVideo] = useState(false);

    // Derived State
    const currentKey = transposeChord(originalKey, transpose, useFlats);

    // Render Logic for Lyrics (Pure Text)
    const renderLyrics = () => {
        return lyrics.split('\n').map((line, index) => (
            <p key={index} className="mb-4 leading-relaxed text-white/90 whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
                {line}
            </p>
        ));
    };

    // Render Logic for Chords (With Transposition)
    const renderChords = () => {
        if (!chords) return null;
        return chords.split('\n').map((line, lineIndex) => {
            const parts = line.split(/(\[.*?\])/g);
            return (
                <div key={lineIndex} className="min-h-[1.5em] leading-loose whitespace-pre-wrap mb-1 relative pl-1 font-mono text-amber-200/80" style={{ fontSize: `${fontSize - 2}px` }}>
                    {parts.map((part, partIndex) => {
                        if (part.startsWith('[') && part.endsWith(']')) {
                            const chord = part.slice(1, -1);
                            const transposed = transposeChord(chord, transpose, useFlats);
                            return (
                                <span key={partIndex} className="font-bold text-amber-500 mr-1">
                                    {transposed}
                                </span>
                            );
                        } else {
                            return <span key={partIndex} className="text-white/60">{part}</span>;
                        }
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
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 pt-20">
                    <div className="max-w-7xl mx-auto">
                        <Link href="/songs" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 text-xs font-bold uppercase tracking-widest transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Library
                        </Link>

                        {/* DISTINCT H1 AS REQUESTED - Semantic SEO */}
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3 text-white drop-shadow-2xl">
                            {title} – Lyrics & Chords
                        </h1>

                        <p className="text-xl text-white/80 font-serif italic tracking-wide mb-6">{author}</p>

                        <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-white/60">
                            {category && (
                                <span className="px-3 py-1 rounded-full bg-white/10 uppercase tracking-wider text-xs">{category}</span>
                            )}
                            {duration && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{duration}</span>
                                </div>
                            )}
                            {plays && (
                                <div className="flex items-center gap-2">
                                    <PlayCircle className="w-4 h-4" />
                                    <span>{plays} Plays</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. METADATA BAR */}
            <div className="sticky top-0 z-30 bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 py-4 px-6 shadow-2xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8 text-sm font-bold text-white/60">
                        {/* Only show key controls if chords exist */}
                        {chords && (
                            <>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Original Key</span>
                                    <span className="text-white text-lg leading-none">{originalKey}</span>
                                </div>
                                <div className="h-8 w-px bg-white/10"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Current Key</span>
                                    <span className="text-[var(--brand)] text-lg leading-none">{currentKey}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setIsFavourite(!isFavourite)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${isFavourite
                            ? 'bg-[var(--brand)] border-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/20'
                            : 'bg-transparent border-white/20 text-white/60 hover:border-white/50 hover:text-white'
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${isFavourite ? 'fill-current' : ''}`} />
                        {isFavourite ? 'Saved' : 'Save Song'}
                    </button>
                </div>
            </div>

            {/* 3. MAIN CONTENT (Split Layout) */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 relative animate-fade-in-up">

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
                        <div className="bg-white/5 rounded-[2rem] p-8 md:p-10 border border-white/5">
                            {renderLyrics()}
                        </div>
                    </section>

                    {/* Chords Section */}
                    {chords && (
                        <section>
                            <h2 className="text-2xl font-bold text-amber-500 mb-6 border-b border-white/10 pb-2">Chords</h2>
                            <div className="bg-white/5 rounded-[2rem] p-8 md:p-10 border border-white/5 overflow-x-auto">
                                {renderChords()}
                            </div>
                        </section>
                    )}
                </div>

                {/* RIGHT COLUMN: VIDEO & TOOLS */}
                <div className="block lg:col-span-5 relative">
                    <div className="sticky top-28 space-y-6">
                        {/* Video Player Box */}
                        <div className="rounded-3xl overflow-hidden bg-black aspect-video shadow-2xl shadow-black/50 border border-white/10 relative group">
                            {showVideo && youtubeId ? (
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                                    title="YouTube Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#111] bg-[url('https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center">
                                    <div className="absolute inset-0 bg-black/60"></div>
                                    <div className="relative z-10 flex flex-col items-center">
                                        <button
                                            onClick={() => setShowVideo(true)}
                                            className="w-20 h-20 rounded-full bg-[var(--brand)] flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-[var(--brand)]/40 animate-pulse-slow group-hover:animate-none"
                                            title="Watch Video"
                                        >
                                            <Play className="w-8 h-8 text-white fill-current ml-1" />
                                        </button>
                                        <p className="mt-4 text-sm font-bold text-white uppercase tracking-widest">Watch Video</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pro Tools Panel - Only if chords exist */}
                        {chords && (
                            <div className="p-8 rounded-3xl bg-[#111] border border-white/10">
                                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-6">Quick Tools</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setTranspose(t => t - 1)}
                                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-2 border border-white/5 group"
                                    >
                                        <Minus className="w-5 h-5 text-white/60 group-hover:text-white" />
                                        <span className="text-xs font-bold text-white/60 group-hover:text-white">Transpose -1</span>
                                    </button>
                                    <button
                                        onClick={() => setTranspose(t => t + 1)}
                                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center gap-2 border border-white/5 group"
                                    >
                                        <Plus className="w-5 h-5 text-white/60 group-hover:text-white" />
                                        <span className="text-xs font-bold text-white/60 group-hover:text-white">Transpose +1</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 4. MOBILE CONTROLS */}
            {chords && (
                <div className="fixed bottom-6 left-0 right-0 z-40 w-full px-4 lg:hidden">
                    <div className="max-w-xl mx-auto bg-[#1F1F1F]/90 backdrop-blur-xl rounded-2xl shadow-2xl p-2 ring-1 ring-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 w-full justify-between px-4">
                            <span className="text-xs font-bold uppercase text-white/50">Transpose</span>
                            <div className="flex gap-2">
                                <button onClick={() => setTranspose(t => t - 1)} className="p-2 rounded-lg bg-white/10"><Minus className="w-4 h-4" /></button>
                                <span className="text-sm font-bold w-6 text-center pt-1">{currentKey}</span>
                                <button onClick={() => setTranspose(t => t + 1)} className="p-2 rounded-lg bg-white/10"><Plus className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* 5. RELATED SONGS */}
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
