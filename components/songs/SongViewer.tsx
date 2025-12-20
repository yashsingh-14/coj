'use client';

import { useState } from 'react';
import { transposeChord } from '@/lib/music';
import { ArrowLeft, Clock, Eye, Heart, Minus, Play, PlayCircle, Plus } from 'lucide-react';
import Link from 'next/link';

interface SongViewerProps {
    title: string;
    author: string;
    originalKey: string;
    content: string; // Format: "Line 1 [C] with chord\nLine 2"
    youtubeId?: string;
    category?: string;
    duration?: string;
    plays?: string;
}

export default function SongViewer({ title, author, originalKey, content, youtubeId, category, duration, plays }: SongViewerProps) {
    const [transpose, setTranspose] = useState(0);
    const [showChords, setShowChords] = useState(true);
    const [fontSize, setFontSize] = useState(18);
    const [useFlats, setUseFlats] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);
    const [showVideo, setShowVideo] = useState(false); // Controls desktop iframe visibility

    // Derived State
    const currentKey = transposeChord(originalKey, transpose, useFlats);

    // Helpers
    const transposeChords = (text: string, semitones: number) => {
        return text.replace(/\[(.*?)\]/g, (match, chord) => {
            if (!showChords) return '';
            const transposed = transposeChord(chord, semitones, useFlats);
            return `[${transposed}]`;
        });
    };

    // Render Logic for Chords
    const renderContent = () => {
        return content.split('\n').map((line, lineIndex) => {
            const parts = line.split(/(\[.*?\])/g);
            return (
                <div key={lineIndex} className="min-h-[2.2em] leading-relaxed whitespace-pre-wrap mb-6 relative pl-1" style={{ fontSize: `${fontSize}px` }}>
                    {parts.map((part, partIndex) => {
                        if (part.startsWith('[') && part.endsWith(']')) {
                            const chord = part.slice(1, -1);
                            const transposed = transposeChord(chord, transpose, useFlats);
                            if (!showChords) return null;
                            return (
                                <span key={partIndex} className="inline-block relative group mr-1">
                                    <span className="absolute bottom-full left-0 font-bold text-[#FFAB00] text-[0.9em] mb-0.5 select-none whitespace-nowrap drop-shadow-md">
                                        {transposed}
                                    </span>
                                    <span className="invisible text-[0.9em] font-bold">{transposed}</span>
                                </span>
                            );
                        } else {
                            return <span key={partIndex} className="text-white/90 font-medium tracking-wide">{part}</span>;
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
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-3 text-white drop-shadow-2xl">{title}</h1>
                        <p className="text-2xl text-white/80 font-serif italic tracking-wide mb-6">{author}</p>

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
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Original Key</span>
                            <span className="text-white text-lg leading-none">{originalKey}</span>
                        </div>
                        <div className="h-8 w-px bg-white/10"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Current Key</span>
                            <span className="text-[var(--brand)] text-lg leading-none">{currentKey}</span>
                        </div>
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

                {/* LEFT COLUMN: LYRICS (Scrollable) */}
                <div className="lg:col-span-7 space-y-8 min-h-[60vh]">
                    <div className="bg-white/5 rounded-[2rem] p-8 md:p-10 border border-white/5">
                        {renderContent()}
                    </div>
                </div>

                {/* RIGHT COLUMN: VIDEO & TOOLS (Sticky) */}
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
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="flex gap-4">
                                                {/* Button 1: Watch Video */}
                                                <button
                                                    onClick={() => setShowVideo(true)}
                                                    className="w-20 h-20 rounded-full bg-[var(--brand)] flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-[var(--brand)]/40 animate-pulse-slow group-hover:animate-none"
                                                    title="Watch Video"
                                                >
                                                    <Play className="w-8 h-8 text-white fill-current ml-1" />
                                                </button>
                                            </div>
                                            <p className="mt-4 text-sm font-bold text-white uppercase tracking-widest">Watch Video</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pro Tools Panel */}
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
                    </div>
                </div>
            </div>

            {/* 4. MOBILE / FLOATING CONTROLS (Sticky Bottom) */}
            <div className="fixed bottom-6 left-0 right-0 z-40 w-full px-4 lg:hidden">
                <div className="max-w-xl mx-auto bg-[#1F1F1F]/90 backdrop-blur-xl rounded-2xl shadow-2xl p-2 ring-1 ring-white/10 flex items-center justify-between">
                    {/* Mobile controls usually here */}
                    <div className="flex items-center gap-2 w-full justify-between px-4">
                        <span className="text-xs font-bold uppercase text-white/50">Controls</span>
                        <div className="flex gap-2">
                            <button onClick={() => setTranspose(t => t - 1)} className="p-2 rounded-lg bg-white/10"><Minus className="w-4 h-4" /></button>
                            <span className="text-sm font-bold w-6 text-center pt-1">{currentKey}</span>
                            <button onClick={() => setTranspose(t => t + 1)} className="p-2 rounded-lg bg-white/10"><Plus className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
