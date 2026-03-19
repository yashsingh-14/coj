'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronUp, Mic, Vibrate } from 'lucide-react';
import {
    detectPitch,
    frequencyToNote,
    GUITAR_TUNINGS,
    type GuitarType,
    type GuitarString,
    type PitchResult,
} from '@/lib/pitchDetection';

const GUITAR_TYPE_LABELS: Record<GuitarType, { name: string; sub: string }> = {
    acoustic: { name: 'Guitar 6-string', sub: 'Standard' },
    electric: { name: 'Electric 6-string', sub: 'Standard' },
    bass4: { name: 'Bass 4-string', sub: 'Standard' },
    bass5: { name: 'Bass 5-string', sub: 'Standard' },
};

const GUITAR_TYPES: GuitarType[] = ['acoustic', 'electric', 'bass4', 'bass5'];

export default function TunerPage() {
    const [hasStarted, setHasStarted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [autoMode, setAutoMode] = useState(true);
    const [guitarType, setGuitarType] = useState<GuitarType>('acoustic');
    const [pitch, setPitch] = useState<PitchResult | null>(null);
    const [activeStringIndex, setActiveStringIndex] = useState<number | null>(null);
    const [showGuitarPicker, setShowGuitarPicker] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const bufferRef = useRef<Float32Array | null>(null);

    const strings = GUITAR_TUNINGS[guitarType];

    // Split strings for left/right headstock layout
    const half = Math.ceil(strings.length / 2);
    const leftStrings = strings.slice(half).reverse();
    const rightStrings = strings.slice(0, half).reverse();

    const stopListening = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
        rafRef.current = null;
        mediaStreamRef.current = null;
        audioContextRef.current = null;
        analyserRef.current = null;
        bufferRef.current = null;
        setIsListening(false);
        setPitch(null);
    }, []);

    const startListening = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
            });
            mediaStreamRef.current = stream;
            const ctx = new AudioContext();
            audioContextRef.current = ctx;
            const src = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 4096;
            src.connect(analyser);
            analyserRef.current = analyser;
            bufferRef.current = new Float32Array(analyser.fftSize);
            setIsListening(true);

            const detect = () => {
                if (!analyserRef.current || !bufferRef.current || !audioContextRef.current) return;
                analyserRef.current.getFloatTimeDomainData(bufferRef.current);
                const freq = detectPitch(bufferRef.current, audioContextRef.current.sampleRate);
                
                if (freq && freq > 25 && freq < 1200) {
                    const result = frequencyToNote(freq);
                    setPitch(result);

                    if (autoMode) {
                        let closestIdx = 0;
                        let closestDist = Infinity;
                        strings.forEach((s, i) => {
                            const dist = Math.abs(freq - s.frequency);
                            if (dist < closestDist) { closestDist = dist; closestIdx = i; }
                        });
                        setActiveStringIndex(closestIdx);
                    }
                }
                rafRef.current = requestAnimationFrame(detect);
            };
            detect();
        } catch { /* Mic denied */ }
    }, [autoMode, strings]);

    // Clean up on unmount
    useEffect(() => {
        return () => stopListening();
    }, [stopListening]);

    const handleStart = () => {
        setHasStarted(true);
        startListening();
    };

    // UI State Helpers
    const isTuned = pitch ? Math.abs(pitch.cents) <= 4 : false;
    const isActiveString = (str: GuitarString) => {
        const originalIdx = strings.findIndex(s => s.label === str.label);
        return originalIdx === activeStringIndex;
    };

    // Calculate needle rotation based on cents (-50 to +50 -> -45deg to +45deg)
    const needleRotation = pitch ? Math.max(-45, Math.min(45, (pitch.cents / 50) * 45)) : 0;

    return (
        <div className="min-h-screen bg-[#02000F] text-white select-none overflow-hidden flex flex-col relative font-sans">
            
            {/* Dynamic Background Aura */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-50 transition-colors duration-500"
                style={{
                    background: pitch 
                        ? isTuned 
                            ? 'radial-gradient(circle at center, rgba(34,197,94,0.15) 0%, transparent 60%)' 
                            : 'radial-gradient(circle at center, rgba(245,158,11,0.1) 0%, transparent 60%)'
                        : 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, transparent 60%)'
                }}
            />

            {/* Top Simple Header */}
            <div className="px-6 py-4 flex items-center justify-between z-40 shrink-0 relative">
                <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all backdrop-blur-md">
                    <ArrowLeft className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold tracking-wide text-white/80">Exit Tuner</span>
                </Link>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="font-bold text-white/30 tracking-widest text-xs uppercase">
                        {isListening ? 'Listening' : 'Mic Off'}
                    </span>
                </div>
            </div>

            {/* Main Tuner Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-lg mx-auto pb-32">
                
                {/* Central Glass Radial Dial */}
                <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center z-20">
                    {/* Outer Glow Ring */}
                    <div className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${pitch ? (isTuned ? 'border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)]') : 'border-white/10'}`} />
                    
                    {/* Inner Frosted Glass */}
                    <div className="absolute inset-4 rounded-full bg-[#12121A]/60 backdrop-blur-xl border border-white/5 shadow-inner flex flex-col items-center justify-center overflow-hidden">
                        
                        {!hasStarted ? (
                            <button 
                                onClick={handleStart}
                                className="z-20 flex flex-col items-center justify-center gap-4 w-full h-full hover:bg-white/5 transition-colors group"
                            >
                                <div className="p-4 rounded-full bg-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform">
                                    <Mic className="w-8 h-8" />
                                </div>
                                <span className="font-bold tracking-widest uppercase text-sm text-amber-500">Tap to Start</span>
                            </button>
                        ) : (
                            <>
                                {/* Dial Markings */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-3 bg-amber-500 rounded-full" />
                        <div className="absolute top-8 left-8 w-0.5 h-2 bg-white/20 -rotate-45" />
                        <div className="absolute top-8 right-8 w-0.5 h-2 bg-white/20 rotate-45" />

                        {/* Needle */}
                        <div className="absolute top-[10%] bottom-1/2 left-1/2 w-0.5 origin-bottom transition-transform duration-100 ease-out"
                            style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}>
                            <div className={`w-1 h-full rounded-t-full transition-colors ${isTuned ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'}`} />
                        </div>

                        {/* Note Display */}
                        <div className="z-10 mt-12 flex flex-col items-center justify-center">
                            {pitch ? (
                                <>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-5xl sm:text-6xl font-black tracking-tighter ${isTuned ? 'text-green-400 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]'}`}>
                                            {pitch.note.replace(/[0-9]/g, '')}
                                        </span>
                                        <span className="text-xl sm:text-2xl font-bold text-white/40">{pitch.octave}</span>
                                    </div>
                                    <span className={`text-sm font-bold tracking-widest uppercase mt-2 ${isTuned ? 'text-green-500' : 'text-amber-500'}`}>
                                        {isTuned ? 'In Tune' : pitch.cents > 0 ? 'Too Sharp' : 'Too Flat'}
                                    </span>
                                </>
                            ) : (
                                <div className="flex flex-col items-center opacity-30 animate-pulse">
                                    <Mic className="w-12 h-12 mb-2" />
                                    <span className="text-sm font-bold tracking-widest uppercase">Perform note</span>
                                </div>
                            )}
                        </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Headstock & Strings Layout */}
                <div className="absolute top-0 bottom-0 left-0 right-0 flex justify-between px-4 sm:px-12 pointer-events-none">
                    
                    {/* Dark Premium Headstock & Neck Structure */}
                    <div className="absolute top-[2vh] sm:top-[5vh] bottom-[-200px] left-1/2 -translate-x-1/2 flex flex-col items-center w-52 sm:w-64 z-0 opacity-60 pointer-events-none">
                        {/* Guitar Headstock Shape */}
                        <div 
                            className="w-full h-80 bg-[#1A1A24]/40 backdrop-blur-md border border-white/5 relative flex-1 flex-shrink-0"
                            style={{ 
                                clipPath: 'polygon(15% 0%, 85% 0%, 100% 20%, 90% 100%, 10% 100%, 0% 20%)',
                                borderRadius: '40px 40px 0 0'
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                            {/* Subtle Carbon Fiber / Mesh Texture overlay */}
                            <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 2px)', backgroundSize: '8px 8px' }} />
                        </div>
                        
                        {/* Guitar Neck Shape (goes down to infinity) */}
                        <div className="w-24 flex-[2] bg-gradient-to-b from-[#1A1A24]/60 to-transparent backdrop-blur-md border-l border-r border-[#1e1e2d] relative flex justify-evenly pointer-events-none">
                            {/* The Nut */}
                            <div className="absolute top-0 left-0 right-0 h-2 bg-[#2a2a35] shadow-[0_5px_10px_rgba(0,0,0,0.5)] z-10" />
                            {/* Frets */}
                            <div className="absolute top-20 left-0 right-0 h-[2px] bg-white/10 shadow-[0_2px_5px_rgba(0,0,0,0.5)]" />
                            <div className="absolute top-44 left-0 right-0 h-[2px] bg-white/10 shadow-[0_2px_5px_rgba(0,0,0,0.5)]" />
                            <div className="absolute top-72 left-0 right-0 h-[2px] bg-white/10 shadow-[0_2px_5px_rgba(0,0,0,0.5)]" />
                            {/* Visual Strings running down the neck */}
                            <div className="w-px h-full bg-white/10 mt-2" />
                            <div className="w-px h-full bg-white/10 mt-2" />
                            <div className="w-px h-full bg-white/10 mt-2" />
                            <div className="w-px h-full bg-white/10 mt-2" />
                        </div>
                    </div>

                    {/* Left Pegs */}
                    <div className="flex flex-col justify-center gap-6 sm:gap-10 w-14 sm:w-20 pointer-events-auto z-30">
                        {leftStrings.map(str => {
                            const active = isActiveString(str);
                            return (
                                <button key={str.label} onClick={() => { setActiveStringIndex(strings.findIndex(s => s.label === str.label)); setAutoMode(false); }}
                                    className="relative flex items-center justify-center group">
                                    {/* Neon String connecting to dial */}
                                    <div className={`absolute left-full top-1/2 h-[1px] w-32 -z-10 transition-all duration-300 origin-left ${active ? 'bg-gradient-to-r from-amber-500 to-transparent shadow-[0_0_10px_#f59e0b]' : 'bg-white/10'}`} />
                                    {/* Tuning Peg */}
                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all duration-300 shadow-xl ${active ? 'bg-[#1A1A24] border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-110' : 'bg-[#12121A]/80 border-white/5 hover:border-white/20'}`}>
                                        <span className={`text-lg sm:text-xl font-black ${active ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-white/40 group-hover:text-white/80'}`}>{str.note}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Pegs */}
                    <div className="flex flex-col justify-center gap-6 sm:gap-10 w-14 sm:w-20 pointer-events-auto z-30">
                        {rightStrings.map(str => {
                            const active = isActiveString(str);
                            return (
                                <button key={str.label} onClick={() => { setActiveStringIndex(strings.findIndex(s => s.label === str.label)); setAutoMode(false); }}
                                    className="relative flex items-center justify-center group">
                                    {/* Neon String connecting to dial */}
                                    <div className={`absolute right-full top-1/2 h-[1px] w-32 -z-10 transition-all duration-300 origin-right ${active ? 'bg-gradient-to-l from-amber-500 to-transparent shadow-[0_0_10px_#f59e0b]' : 'bg-white/10'}`} />
                                    {/* Tuning Peg */}
                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center backdrop-blur-xl border transition-all duration-300 shadow-xl ${active ? 'bg-[#1A1A24] border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-110' : 'bg-[#12121A]/80 border-white/5 hover:border-white/20'}`}>
                                        <span className={`text-lg sm:text-xl font-black ${active ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-white/40 group-hover:text-white/80'}`}>{str.note}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Floating Bottom Dock */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
                
                {/* Presets Menu Popup */}
                {showGuitarPicker && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full bg-[#12121A]/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom-4">
                        <div className="px-5 py-3 border-b border-white/5 bg-white/5">
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Select Instrument</span>
                        </div>
                        <div className="p-2 flex flex-col gap-1">
                            {GUITAR_TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => { setGuitarType(type); setShowGuitarPicker(false); setActiveStringIndex(null); }}
                                    className={`w-full px-4 py-3 rounded-2xl text-left transition-all flex items-center justify-between ${
                                        guitarType === type ? 'bg-amber-500/20 text-amber-400' : 'text-white/60 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <span className="font-semibold text-sm">{GUITAR_TYPE_LABELS[type].name}</span>
                                    <span className="text-xs opacity-50">{GUITAR_TYPE_LABELS[type].sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Dock Bar */}
                <div className="flex items-center justify-between bg-[#1A1A24]/80 backdrop-blur-2xl border border-white/10 px-2 py-2 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
                    
                    {/* Guitar Selector */}
                    <button 
                        onClick={() => setShowGuitarPicker(!showGuitarPicker)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full hover:bg-white/5 transition-colors group"
                    >
                        <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                            {GUITAR_TYPE_LABELS[guitarType].name}
                        </span>
                        <ChevronUp className={`w-4 h-4 text-white/40 transition-transform flex-shrink-0 ${showGuitarPicker ? 'rotate-180' : ''}`} />
                    </button>

                    <div className="w-px h-8 bg-white/10 mx-2" />

                    {/* Auto Toggle */}
                    <button 
                        onClick={() => setAutoMode(!autoMode)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-full transition-colors ${autoMode ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-white/5 text-white/40'}`}
                    >
                        <span className="text-xs font-black tracking-widest uppercase hidden sm:block">
                            {autoMode ? 'AUTO ON' : 'AUTO OFF'}
                        </span>
                        <div className={`w-10 h-5 rounded-full transition-colors relative flex items-center shadow-inner ${autoMode ? 'bg-amber-500/40' : 'bg-black/40 border border-white/10'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-md absolute transition-transform ${autoMode ? 'translate-x-5' : 'translate-x-1'}`} />
                        </div>
                    </button>
                    
                </div>
            </div>

        </div>
    );
}
