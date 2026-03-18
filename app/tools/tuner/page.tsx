'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import {
    detectPitch,
    frequencyToNote,
    getTuningStatus,
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

    // Split strings into left and right columns (like GuitarTuna)
    const half = Math.ceil(strings.length / 2);
    const leftStrings = strings.slice(half).reverse(); // Bottom strings on left (D, A, E for 6-string)
    const rightStrings = strings.slice(0, half).reverse(); // Top strings on right (G, B, E for 6-string)

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

                    // Auto-detect which string is being played
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
        } catch { /* mic denied */ }
    }, [autoMode, strings]);

    useEffect(() => {
        startListening();
        return () => stopListening();
    }, []);// eslint-disable-line react-hooks/exhaustive-deps

    const tuningStatus = pitch ? getTuningStatus(pitch.cents) : null;

    // Pitch indicator position: cents maps to horizontal position
    // -50 cents = far left, 0 = center, +50 cents = far right
    const indicatorPosition = pitch ? Math.max(-50, Math.min(50, pitch.cents)) : 0;
    const indicatorPercent = 50 + indicatorPosition; // 0-100%

    // Check if a specific string is "in tune"
    const isStringInTune = (str: GuitarString) => {
        if (!pitch) return false;
        return pitch.note === str.note && pitch.octave === str.octave && Math.abs(pitch.cents) <= 5;
    };

    const isStringActive = (str: GuitarString) => {
        // Find original index in the full strings array
        const originalIdx = strings.findIndex(s => s.label === str.label);
        return originalIdx === activeStringIndex;
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white select-none overflow-hidden relative">
            {/* Grid background pattern */}
            <div className="absolute inset-0 opacity-[0.08]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
            }} />

            {/* Header */}
            <div className="relative z-10 p-5 flex items-start justify-between">
                <div>
                    <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold leading-tight">
                        <span className="text-amber-400">Start tuning</span> by playing
                        <br />any string
                    </h1>
                    {/* Guitar type selector */}
                    <button
                        onClick={() => setShowGuitarPicker(!showGuitarPicker)}
                        className="mt-3 flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors"
                    >
                        <span className="font-semibold">{GUITAR_TYPE_LABELS[guitarType].name}</span>
                        <ChevronRight className="w-4 h-4" />
                        <br />
                    </button>
                    <span className="text-xs text-white/30">{GUITAR_TYPE_LABELS[guitarType].sub}</span>
                </div>

                {/* AUTO Toggle */}
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">AUTO</span>
                    <button
                        onClick={() => setAutoMode(!autoMode)}
                        className={`w-12 h-7 rounded-full transition-colors relative ${autoMode ? 'bg-amber-500' : 'bg-white/20'}`}
                    >
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${autoMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/* Guitar Type Picker Dropdown */}
            {showGuitarPicker && (
                <div className="relative z-30 mx-5 mb-4 bg-[#0F0F16] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    {GUITAR_TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => { setGuitarType(type); setShowGuitarPicker(false); setActiveStringIndex(null); }}
                            className={`w-full px-5 py-3 text-left text-sm font-semibold transition-colors flex justify-between items-center ${
                                guitarType === type ? 'bg-amber-500/20 text-amber-400' : 'text-white/60 hover:bg-white/5'
                            }`}
                        >
                            <span>{GUITAR_TYPE_LABELS[type].name}</span>
                            <span className="text-xs text-white/30">{GUITAR_TYPE_LABELS[type].sub}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Pitch Indicator Area */}
            <div className="relative z-10 px-6 mt-2">
                {/* Flat / Sharp labels */}
                <div className="flex justify-between items-center mb-3 px-1">
                    <span className="text-2xl font-light text-white/25">♭</span>
                    <span className="text-2xl font-light text-white/25">♯</span>
                </div>

                {/* The pitch track */}
                <div className="relative h-16 flex items-center justify-center">
                    {/* Center line (perfect pitch marker) */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-10 bg-amber-500/50 rounded-full" />

                    {/* Minor tick marks */}
                    {Array.from({ length: 21 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-px h-3 bg-white/10 rounded-full"
                            style={{ left: `${(i / 20) * 100}%` }}
                        />
                    ))}

                    {/* Pitch indicator ball */}
                    {pitch && isListening && (
                        <>
                            {/* Trail / wave effect */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full transition-all duration-150 ease-out"
                                style={{
                                    left: `calc(${indicatorPercent}% - 16px)`,
                                    background: `radial-gradient(circle, ${tuningStatus?.color}40, transparent)`,
                                    boxShadow: `0 0 20px ${tuningStatus?.color}30`,
                                }}
                            />
                            {/* The ball itself */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 transition-all duration-150 ease-out"
                                style={{
                                    left: `calc(${indicatorPercent}% - 10px)`,
                                    borderColor: tuningStatus?.color,
                                    background: tuningStatus?.quality === 'perfect' ? tuningStatus.color : 'transparent',
                                    boxShadow: tuningStatus?.quality === 'perfect' ? `0 0 15px ${tuningStatus.color}80` : 'none',
                                }}
                            />
                        </>
                    )}
                </div>

                {/* Cents + Direction label */}
                {pitch && isListening && (
                    <div className="flex items-center justify-center gap-3 mt-2">
                        {Math.abs(pitch.cents) > 3 && (
                            <span className="text-sm text-white/50 font-medium">
                                {pitch.cents > 0 ? 'Tune down' : 'Tune up'}
                            </span>
                        )}
                        <span
                            className="text-sm font-bold px-2.5 py-1 rounded-full border"
                            style={{
                                color: tuningStatus?.color,
                                borderColor: `${tuningStatus?.color}40`,
                                background: `${tuningStatus?.color}15`,
                            }}
                        >
                            {pitch.cents > 0 ? '+' : ''}{pitch.cents}
                        </span>
                    </div>
                )}

                {/* Detected Note Display */}
                <div className="text-center mt-4">
                    {pitch && isListening ? (
                        <div className="inline-flex items-center gap-1 px-5 py-2 rounded-full bg-white/5 border border-white/10">
                            <span className="text-3xl font-black" style={{ color: tuningStatus?.color }}>
                                {pitch.note}
                            </span>
                            <span className="text-lg text-white/30 font-bold">{pitch.octave}</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center px-5 py-2 rounded-full bg-white/5 border border-white/10">
                            <span className="text-xl font-bold text-white/20">Listening...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Guitar Headstock Area */}
            <div className="relative z-10 mt-2 flex items-center justify-center pb-24" style={{ minHeight: '280px' }}>
                {/* Center: Guitar Headstock Visual with buttons positioned relative to pegs */}
                <div className="relative">
                    {/* Headstock shape */}
                    <div className="w-32 relative">
                        {/* Top rounded part */}
                        <div className="w-full h-40 bg-gradient-to-b from-[#8B6914] via-[#A0782C] to-[#6B4F0A] rounded-t-[50px] border-2 border-[#4a3507] relative overflow-hidden">
                            {/* Wood grain effect */}
                            <div className="absolute inset-0 opacity-20" style={{
                                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.1) 9px)',
                            }} />
                            {/* Center plate */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-14 h-24 bg-gradient-to-b from-[#7a5a10] to-[#5a4008] rounded-lg border border-[#4a3507]" />
                        </div>

                        {/* Tuning pegs visual (left side) */}
                        {[0, 1, 2].map((i) => (
                            <div key={`lp-${i}`} className="absolute w-5 h-2.5 bg-gradient-to-r from-[#c0c0c0] to-[#888] rounded-full border border-[#666]"
                                style={{ left: '-12px', top: `${30 + i * 45}px` }} />
                        ))}
                        {/* Tuning pegs visual (right side) */}
                        {[0, 1, 2].map((i) => (
                            <div key={`rp-${i}`} className="absolute w-5 h-2.5 bg-gradient-to-l from-[#c0c0c0] to-[#888] rounded-full border border-[#666]"
                                style={{ right: '-12px', top: `${30 + i * 45}px` }} />
                        ))}

                        {/* LEFT side buttons - aligned with left pegs */}
                        {leftStrings.map((str, i) => {
                            const inTune = isStringInTune(str);
                            const active = isStringActive(str);
                            return (
                                <button
                                    key={str.label}
                                    onClick={() => {
                                        const idx = strings.findIndex(s => s.label === str.label);
                                        setActiveStringIndex(idx);
                                        setAutoMode(false);
                                    }}
                                    className={`absolute w-11 h-11 rounded-full flex items-center justify-center text-base font-black transition-all ${
                                        inTune
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-110'
                                            : active
                                                ? 'bg-white text-[#02000F] shadow-lg shadow-white/30 scale-105'
                                                : 'bg-white/10 text-white/50 hover:bg-white/20 border border-white/10'
                                    }`}
                                    style={{ left: '-60px', top: `${24 + i * 45}px` }}
                                >
                                    {str.note}
                                </button>
                            );
                        })}

                        {/* RIGHT side buttons - aligned with right pegs */}
                        {rightStrings.map((str, i) => {
                            const inTune = isStringInTune(str);
                            const active = isStringActive(str);
                            return (
                                <button
                                    key={str.label}
                                    onClick={() => {
                                        const idx = strings.findIndex(s => s.label === str.label);
                                        setActiveStringIndex(idx);
                                        setAutoMode(false);
                                    }}
                                    className={`absolute w-11 h-11 rounded-full flex items-center justify-center text-base font-black transition-all ${
                                        inTune
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-110'
                                            : active
                                                ? 'bg-white text-[#02000F] shadow-lg shadow-white/30 scale-105'
                                                : 'bg-white/10 text-white/50 hover:bg-white/20 border border-white/10'
                                    }`}
                                    style={{ right: '-60px', top: `${24 + i * 45}px` }}
                                >
                                    {str.note}
                                </button>
                            );
                        })}

                        {/* Neck */}
                        <div className="w-24 mx-auto h-28 bg-gradient-to-b from-[#6B4F0A] to-[#5a4008] relative">
                            {/* Fretboard */}
                            <div className="absolute inset-x-2 inset-y-0 bg-[#2a1f08] rounded-b-md">
                                {/* Strings visual */}
                                {[0, 1, 2, 3, 4, 5].slice(0, strings.length).map((_, i) => {
                                    const xPos = 12 + (i * ((100 - 24) / (strings.length - 1)));
                                    const isActive = activeStringIndex === i;
                                    const inTune = strings[i] && isStringInTune(strings[i]);
                                    return (
                                        <div
                                            key={i}
                                            className="absolute top-0 bottom-0 transition-all"
                                            style={{
                                                left: `${xPos}%`,
                                                width: `${3 - i * 0.3}px`,
                                                background: inTune
                                                    ? '#22c55e'
                                                    : isActive
                                                        ? '#ffffff'
                                                        : 'rgba(200,180,140,0.4)',
                                                boxShadow: inTune
                                                    ? '0 0 6px rgba(34,197,94,0.8)'
                                                    : isActive
                                                        ? '0 0 4px rgba(255,255,255,0.5)'
                                                        : 'none',
                                            }}
                                        />
                                    );
                                })}

                                {/* Fret lines */}
                                {[25, 50, 75].map((pos) => (
                                    <div key={pos} className="absolute left-0 right-0 h-px bg-[#c0a860]/30" style={{ top: `${pos}%` }} />
                                ))}

                                {/* Nut */}
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#f0e8d0] rounded-t-sm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom frequency display */}
            {pitch && isListening && (
                <div className="relative z-10 text-center pb-8">
                    <span className="text-xs text-white/20 font-mono">{pitch.frequency.toFixed(1)} Hz</span>
                </div>
            )}
        </div>
    );
}
