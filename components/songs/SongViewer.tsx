'use client';

import { useState } from 'react';
import { transposeChord } from '@/lib/music';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Heart, PlayCircle } from 'lucide-react';
import Link from 'next/link';

interface SongViewerProps {
    title: string;
    author: string;
    originalKey: string;
    content: string; // Format: "Line 1 [C] with chord\nLine 2"
    youtubeId?: string;
}

export default function SongViewer({ title, author, originalKey, content, youtubeId }: SongViewerProps) {
    const [transpose, setTranspose] = useState(0);
    const [showChords, setShowChords] = useState(true);
    const [fontSize, setFontSize] = useState(18);
    const [useFlats, setUseFlats] = useState(false);
    const [isFavourite, setIsFavourite] = useState(false);
    const [isVideoVisible, setIsVideoVisible] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const currentKey = transposeChord(originalKey, transpose, useFlats);

    // Parse lines
    const lines = content.split('\n').map((line, lineIndex) => {
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
                                {/* Invisible spacer for layout */}
                            </span>
                        );
                    } else {
                        return <span key={partIndex} className="text-white/90 font-medium tracking-wide">{part}</span>;
                    }
                })}
            </div>
        );
    });

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[var(--brand)] selection:text-white pb-48">

            {/* 1. HERO HEADER (Premium Gradient) */}
            <div className="relative w-full h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#9C27B0] to-[var(--brand)] opacity-80 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-6 pt-20">
                    <div className="container mx-auto lg:max-w-7xl">
                        <Link href="/songs" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-xs font-bold uppercase tracking-widest transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Link>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-2 text-white drop-shadow-2xl">{title}</h1>
                        <p className="text-2xl text-white/80 font-serif italic tracking-wide">{author}</p>
                    </div>
                </div>
            </div>

            {/* 2. METADATA BAR (Key, Links) */}
            <div className="sticky top-0 z-20 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 shadow-2xl">
                <div className="container mx-auto lg:max-w-7xl flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm font-bold text-white/60">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-white/40">Key</span>
                            <span className="text-[var(--brand)] text-lg">{currentKey}</span>
                        </div>
                        <div className="h-8 w-px bg-white/10"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-white/40">Tempo</span>
                            <span className="text-white text-lg">68</span> {/* Mock */}
                        </div>
                        {youtubeId && (
                            <button
                                onClick={() => { setIsVideoVisible(true); setIsMinimized(false); }}
                                className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors ml-4"
                            >
                                <PlayCircle className="w-5 h-5" />
                                <span className="hidden md:inline">Watch Video</span>
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setIsFavourite(!isFavourite)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${isFavourite
                            ? 'bg-[var(--brand)] border-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/20'
                            : 'bg-transparent border-white/20 text-white/60 hover:border-white/50 hover:text-white'
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${isFavourite ? 'fill-current' : ''}`} />
                        {isFavourite ? 'Saved' : 'Save'}
                    </button>
                </div>
            </div>

            {/* 3. MAIN CONTENT (Split Layout on Desktop) */}
            <div className="container mx-auto px-6 py-10 lg:max-w-7xl">
                <div className={`grid gap-8 ${youtubeId && isVideoVisible ? 'lg:grid-cols-2' : ''}`}>

                    {/* Left Column: Lyrics */}
                    <div className="font-sans min-h-[50vh]">
                        {lines}
                    </div>

                    {/* Right Column: Sticky Video (Desktop) or Floating (Mobile) */}
                    {youtubeId && isVideoVisible && (
                        <div className="hidden lg:block relative">
                            <div className="sticky top-24 z-10 w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1`}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="bg-black"
                                ></iframe>
                                {/* Close Button */}
                                <button
                                    onClick={() => setIsVideoVisible(false)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 backdrop-blur-md transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Mobile Floating Player (Hidden on Desktop split-view) */}
            {youtubeId && isVideoVisible && (
                <div
                    className={`lg:hidden fixed z-50 transition-all duration-300 ease-in-out shadow-2xl rounded-2xl overflow-hidden bg-black ring-1 ring-white/10 ${isMinimized
                        ? 'bottom-24 right-4 w-48 h-28 opacity-90'
                        : 'top-[calc(4rem+env(safe-area-inset-top))] right-4 left-4 h-56'
                        }`}
                >
                    <div className="relative w-full h-full">
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&playsinline=1`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="bg-black"
                        ></iframe>
                        {/* Close/Minimize Controls Overlay */}
                        <div className="absolute top-0 right-0 z-20 p-2 flex gap-2 opacity-100 bg-gradient-to-b from-black/80 to-transparent w-full justify-end pointer-events-none">
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                                className="pointer-events-auto p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md"
                            >
                                {isMinimized ? <ArrowLeft className="w-4 h-4 -rotate-45" /> : <ArrowRight className="w-4 h-4 rotate-45" />}
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsVideoVisible(false); }}
                                className="pointer-events-auto p-1.5 rounded-full bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-md"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* 5. VIBRANT CONTROL DOCK (Sticky Bottom) */}
            <div className="fixed bottom-6 left-0 right-0 z-40 w-full px-4">
                <div className="max-w-xl mx-auto bg-gradient-to-r from-[#C2185B] to-[var(--brand)] backdrop-blur-2xl rounded-2xl shadow-2xl shadow-pink-900/40 p-1 ring-1 ring-white/20 flex items-center justify-between">

                    {/* Transpose */}
                    <div className="flex items-center bg-black/20 rounded-xl p-1">
                        <button onClick={() => setTranspose(t => t - 1)} className="w-10 h-10 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 active:scale-95 transition-all">
                            <span className="text-xl pb-1">-</span>
                        </button>
                        <div className="w-12 text-center font-bold text-white text-sm">
                            {currentKey}
                        </div>
                        <button onClick={() => setTranspose(t => t + 1)} className="w-10 h-10 rounded-lg flex items-center justify-center text-white/80 hover:bg-white/10 active:scale-95 transition-all">
                            <span className="text-xl pb-1">+</span>
                        </button>
                    </div>

                    {/* Font Size */}
                    <div className="flex items-center gap-1">
                        <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 active:scale-95 transition-all">
                            <span className="text-xs font-bold">A</span>
                        </button>
                        <button onClick={() => setFontSize(s => Math.min(36, s + 2))} className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all">
                            <span className="text-lg font-bold">A</span>
                        </button>
                    </div>

                    {/* Chords Toggle */}
                    <button
                        onClick={() => setShowChords(!showChords)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${showChords
                            ? 'bg-white text-[var(--brand)] shadow-lg'
                            : 'bg-black/20 text-white/60 hover:text-white'
                            }`}
                    >
                        {showChords ? 'Chords On' : 'Lyrics'}
                    </button>

                </div>
            </div>

        </div>
    );
}
