'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    ChevronUp,
    Mic,
    Volume2,
    RotateCcw,
    Sparkles,
    CheckCircle2,
    Sliders,
    Disc,
    Radio
} from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import {
    detectPitch,
    frequencyToNote,
    GUITAR_TUNINGS,
    type GuitarType,
    type GuitarString,
    type PitchResult,
} from '@/lib/pitchDetection';

const GUITAR_TYPE_LABELS: Record<GuitarType, { name: string; sub: string }> = {
    acoustic: { name: 'Acoustic 6-String', sub: 'Standard (E A D G B E)' },
    electric: { name: 'Electric 6-String', sub: 'Standard (E A D G B E)' },
    bass4: { name: 'Bass 4-String', sub: 'Standard (E A D G)' },
    bass5: { name: 'Bass 5-String', sub: 'Standard (B E A D G)' },
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
    const [micError, setMicError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const bufferRef = useRef<Float32Array | null>(null);

    // Reference tone oscillator
    const refOscRef = useRef<OscillatorNode | null>(null);
    const refGainRef = useRef<GainNode | null>(null);

    const strings = GUITAR_TUNINGS[guitarType];

    // Split strings for left/right headstock layout
    const half = Math.ceil(strings.length / 2);
    const leftStrings = strings.slice(half).reverse();
    const rightStrings = strings.slice(0, half).reverse();

    const stopListening = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (mediaStreamRef.current) mediaStreamRef.current.getTracks().forEach(t => t.stop());
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            try { audioContextRef.current.close(); } catch { }
        }
        rafRef.current = null;
        mediaStreamRef.current = null;
        audioContextRef.current = null;
        analyserRef.current = null;
        bufferRef.current = null;
        setIsListening(false);
        setPitch(null);
    }, []);

    const startListening = useCallback(async () => {
        setMicError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
            });
            mediaStreamRef.current = stream;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx();
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                analyserRef.current.getFloatTimeDomainData(bufferRef.current as any);
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
        } catch (err: unknown) {
            console.error('Mic access error:', err);
            setMicError('Microphone permission required to detect instrument pitch.');
            setIsListening(false);
        }
    }, [autoMode, strings]);

    // Play acoustic reference tone when tapping peg
    const playReferenceTone = useCallback((frequency: number) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(frequency, now);

            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 1.7);
        } catch { }
    }, []);

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
    const targetString = activeStringIndex !== null ? strings[activeStringIndex] : null;

    const isActiveString = (str: GuitarString) => {
        const originalIdx = strings.findIndex(s => s.label === str.label);
        return originalIdx === activeStringIndex;
    };

    // Calculate needle rotation based on cents (-50 to +50 -> -45deg to +45deg)
    const needleRotation = pitch ? Math.max(-48, Math.min(48, (pitch.cents / 50) * 45)) : 0;

    return (
        <div className="min-h-screen bg-[#02000F] text-white select-none overflow-x-hidden flex flex-col relative font-sans">
            {/* Dynamic Background Aura */}
            <div
                className="absolute inset-0 z-0 pointer-events-none overflow-hidden transition-all duration-700"
                style={{
                    background: pitch
                        ? isTuned
                            ? 'radial-gradient(ellipse at center, rgba(34,197,94,0.18) 0%, transparent 65%)'
                            : 'radial-gradient(ellipse at center, rgba(245,158,11,0.12) 0%, transparent 65%)'
                        : 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 65%)'
                }}
            />

            {/* Top Navigation Bar */}
            <header className="px-4 sm:px-6 py-3.5 flex items-center justify-between z-40 shrink-0 relative bg-[#02000F]/80 backdrop-blur-xl border-b border-white/5">
                <BackButton
                    fallback="/worship"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-bold text-white/80 active:scale-95"
                >
                    <span>Exit Tuner</span>
                </BackButton>

                <div className="flex items-center gap-2">
                    <span className="font-black text-xs sm:text-sm tracking-wider uppercase text-white">
                        COJ Strobe Tuner
                    </span>
                    <span className="text-[10px] font-mono text-white/40 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 hidden sm:inline">
                        A4 = 440 Hz
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                    <span className="font-bold text-white/40 tracking-wider text-xs uppercase">
                        {isListening ? 'Active' : 'Mic Off'}
                    </span>
                </div>
            </header>

            {/* In-page Mic Notice */}
            {micError && (
                <div className="relative z-20 max-w-md mx-auto px-4 pt-3">
                    <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium text-center">
                        {micError}
                    </div>
                </div>
            )}

            {/* Main Tuner Stage */}
            <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-xl mx-auto px-4 py-4 pb-36">
                {/* Central Strobe Dial Station */}
                <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center z-20 my-auto">
                    {/* Outer Glow Halo */}
                    <div
                        className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${
                            pitch
                                ? isTuned
                                    ? 'border-emerald-500/60 shadow-[0_0_60px_rgba(34,197,94,0.35)] ring-4 ring-emerald-500/20'
                                    : 'border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.2)]'
                                : 'border-white/10'
                        }`}
                    />

                    {/* Inner Frosted Acrylic Glass */}
                    <div className="absolute inset-3 rounded-full bg-[#0D0B16]/85 backdrop-blur-2xl border border-white/10 shadow-inner flex flex-col items-center justify-center overflow-hidden">
                        {!hasStarted ? (
                            <button
                                onClick={handleStart}
                                className="z-20 flex flex-col items-center justify-center gap-3 w-full h-full hover:bg-white/5 transition-all group active:scale-95"
                            >
                                <div className="p-4 rounded-2xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/10">
                                    <Mic className="w-8 h-8" />
                                </div>
                                <span className="font-black tracking-widest uppercase text-xs sm:text-sm text-amber-400">
                                    Tap to Start Tuner
                                </span>
                            </button>
                        ) : (
                            <>
                                {/* Dial Calibration Marks */}
                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-1.5 h-4 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
                                <div className="absolute top-7 left-7 w-0.5 h-2.5 bg-white/20 -rotate-45" />
                                <div className="absolute top-7 right-7 w-0.5 h-2.5 bg-white/20 rotate-45" />

                                {/* Strobe Needle */}
                                <div
                                    className="absolute top-[12%] bottom-1/2 left-1/2 w-0.5 origin-bottom transition-transform duration-100 ease-out"
                                    style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}
                                >
                                    <div
                                        className={`w-1 h-full rounded-t-full transition-colors ${
                                            isTuned
                                                ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]'
                                                : 'bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                                        }`}
                                    />
                                </div>

                                {/* Center Pitch Note Display */}
                                <div className="z-10 mt-10 flex flex-col items-center justify-center">
                                    {pitch ? (
                                        <>
                                            <div className="flex items-baseline gap-1">
                                                <span
                                                    className={`text-5xl sm:text-6xl font-black tracking-tighter ${
                                                        isTuned
                                                            ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]'
                                                            : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                                                    }`}
                                                >
                                                    {pitch.note.replace(/[0-9]/g, '')}
                                                </span>
                                                <span className="text-xl sm:text-2xl font-bold text-white/40">
                                                    {pitch.octave}
                                                </span>
                                            </div>

                                            <span
                                                className={`text-xs font-black tracking-widest uppercase mt-2 px-2.5 py-0.5 rounded-full border ${
                                                    isTuned
                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                        : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                                                }`}
                                            >
                                                {isTuned ? '✓ IN TUNE' : pitch.cents > 0 ? `+${pitch.cents} CENTS (SHARP)` : `${pitch.cents} CENTS (FLAT)`}
                                            </span>

                                            {/* Exact Hz readout */}
                                            <span className="text-[11px] font-mono text-white/40 mt-1">
                                                {pitch.frequency.toFixed(1)} Hz
                                            </span>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center opacity-40 animate-pulse">
                                            <Mic className="w-9 h-9 mb-2 text-amber-400" />
                                            <span className="text-xs font-bold tracking-widest uppercase text-white/80">
                                                Pluck a String
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Target String Frequency Display */}
                {targetString && (
                    <div className="mt-4 px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-3 text-xs font-mono">
                        <span className="text-white/40 font-bold uppercase">Target:</span>
                        <span className="text-amber-400 font-black">{targetString.label}</span>
                        <span className="text-white/60">({targetString.frequency.toFixed(2)} Hz)</span>
                    </div>
                )}

                {/* Interactive Peg Layout */}
                <div className="w-full flex justify-between items-center px-2 sm:px-6 mt-6 max-w-md">
                    {/* Left Pegs */}
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {leftStrings.map(str => {
                            const active = isActiveString(str);
                            return (
                                <button
                                    key={str.label}
                                    onClick={() => {
                                        const idx = strings.findIndex(s => s.label === str.label);
                                        setActiveStringIndex(idx);
                                        setAutoMode(false);
                                        playReferenceTone(str.frequency);
                                    }}
                                    className={`flex items-center gap-2.5 p-2 rounded-2xl transition-all active:scale-95 group ${
                                        active
                                            ? 'bg-amber-500/15 border border-amber-500/50 shadow-lg shadow-amber-500/10'
                                            : 'bg-white/[0.03] border border-white/5 hover:border-white/20'
                                    }`}
                                    title={`Tap to tune ${str.label} or hear reference note`}
                                >
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-sm sm:text-base border transition-colors ${
                                        active
                                            ? 'bg-amber-500 text-black border-amber-500 shadow-md'
                                            : 'bg-white/5 border-white/10 text-white/70 group-hover:text-white'
                                    }`}>
                                        {str.note}
                                    </div>
                                    <div className="text-left hidden xs:block">
                                        <div className="text-[11px] font-bold text-white/80">{str.label}</div>
                                        <div className="text-[9px] font-mono text-white/40">{str.frequency.toFixed(1)} Hz</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Pegs */}
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {rightStrings.map(str => {
                            const active = isActiveString(str);
                            return (
                                <button
                                    key={str.label}
                                    onClick={() => {
                                        const idx = strings.findIndex(s => s.label === str.label);
                                        setActiveStringIndex(idx);
                                        setAutoMode(false);
                                        playReferenceTone(str.frequency);
                                    }}
                                    className={`flex items-center gap-2.5 p-2 rounded-2xl transition-all active:scale-95 group ${
                                        active
                                            ? 'bg-amber-500/15 border border-amber-500/50 shadow-lg shadow-amber-500/10'
                                            : 'bg-white/[0.03] border border-white/5 hover:border-white/20'
                                    }`}
                                    title={`Tap to tune ${str.label} or hear reference note`}
                                >
                                    <div className="text-right hidden xs:block">
                                        <div className="text-[11px] font-bold text-white/80">{str.label}</div>
                                        <div className="text-[9px] font-mono text-white/40">{str.frequency.toFixed(1)} Hz</div>
                                    </div>
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-sm sm:text-base border transition-colors ${
                                        active
                                            ? 'bg-amber-500 text-black border-amber-500 shadow-md'
                                            : 'bg-white/5 border-white/10 text-white/70 group-hover:text-white'
                                    }`}>
                                        {str.note}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Floating Bottom Instrument Dock */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
                {/* Presets Popup */}
                {showGuitarPicker && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full bg-[#12101E]/95 backdrop-blur-2xl border border-white/15 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-3">
                        <div className="px-5 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                                Select Instrument Tuning
                            </span>
                            <span className="text-[10px] text-white/40 font-mono">Standard Tuning</span>
                        </div>
                        <div className="p-2 flex flex-col gap-1">
                            {GUITAR_TYPES.map(type => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        setGuitarType(type);
                                        setShowGuitarPicker(false);
                                        setActiveStringIndex(null);
                                    }}
                                    className={`w-full px-4 py-3 rounded-2xl text-left transition-all flex items-center justify-between ${
                                        guitarType === type
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <span className="font-bold text-xs sm:text-sm">{GUITAR_TYPE_LABELS[type].name}</span>
                                    <span className="text-[11px] text-white/40 font-mono">{GUITAR_TYPE_LABELS[type].sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Dock Pill */}
                <div className="flex items-center justify-between bg-[#141220]/95 backdrop-blur-2xl border border-white/15 px-3 py-2 rounded-full shadow-2xl">
                    {/* Guitar Selector */}
                    <button
                        onClick={() => setShowGuitarPicker(!showGuitarPicker)}
                        className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/5 transition-colors group min-w-0"
                    >
                        <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                            {GUITAR_TYPE_LABELS[guitarType].name}
                        </span>
                        <ChevronUp className={`w-4 h-4 text-white/40 transition-transform shrink-0 ${showGuitarPicker ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Auto Detect Switch */}
                    <button
                        onClick={() => setAutoMode(!autoMode)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            autoMode
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-white/5 text-white/50 border border-white/5 hover:text-white'
                        }`}
                        title={autoMode ? 'Auto-detect active string' : 'Manual string lock'}
                    >
                        <span>{autoMode ? 'Auto: ON' : 'Auto: OFF'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
