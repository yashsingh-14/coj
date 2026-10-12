'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
    Mic,
    Volume2,
    VolumeX,
    Check,
    RotateCcw,
    Sparkles,
    CheckCircle2,
    Sliders,
    Music2,
    ChevronDown,
    Settings,
    X,
    Radio,
    Compass,
    Activity,
    Info
} from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import {
    detectPitch,
    frequencyToNote,
    getTuningStatus,
    TUNING_PRESETS_INFO,
    GUITAR_PRESET_STRINGS,
    type TuningPreset,
    type GuitarString,
    type PitchResult,
    DEFAULT_A4_FREQUENCY,
    NOTE_NAMES
} from '@/lib/pitchDetection';

export default function TunerPage() {
    // Tuning State
    const [hasStarted, setHasStarted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [autoMode, setAutoMode] = useState(true);
    const [isChromatic, setIsChromatic] = useState(false);
    const [activePreset, setActivePreset] = useState<TuningPreset>('standard');
    const [a4Frequency, setA4Frequency] = useState<number>(DEFAULT_A4_FREQUENCY);
    const [soundFxEnabled, setSoundFxEnabled] = useState(true);

    // Pitch detection live state
    const [pitch, setPitch] = useState<PitchResult | null>(null);
    const [smoothedCents, setSmoothedCents] = useState(0);
    const [activeStringIndex, setActiveStringIndex] = useState<number | null>(null);
    const [vibratingStringIndex, setVibratingStringIndex] = useState<number | null>(null);
    const [inTuneSuccessTrigger, setInTuneSuccessTrigger] = useState(false);
    const [micError, setMicError] = useState<string | null>(null);

    // UI Drawers / Modals
    const [showPresetPicker, setShowPresetPicker] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Audio & Processing Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const bufferRef = useRef<Float32Array | null>(null);
    const lastChimeTimeRef = useRef<number>(0);
    const currentNeedleAngleRef = useRef<number>(0);

    // Strings for the active preset
    const currentStrings = GUITAR_PRESET_STRINGS[activePreset] || GUITAR_PRESET_STRINGS.standard;
    const isFourString = currentStrings.length === 4;
    const isFiveString = currentStrings.length === 5;

    // Split strings into Left (lower strings) and Right (higher strings) for headstock
    const half = Math.ceil(currentStrings.length / 2);
    const leftStrings = currentStrings.slice(0, half);
    const rightStrings = currentStrings.slice(half);

    // ─── Web Audio: GuitarTuna Signature "Ding!" Chime ───────────────
    const playInTuneChime = useCallback(() => {
        if (!soundFxEnabled) return;
        const nowMs = Date.now();
        // Debounce chime so it only plays once per lock (minimum 1.8 seconds apart)
        if (nowMs - lastChimeTimeRef.current < 1800) return;
        lastChimeTimeRef.current = nowMs;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            // Glockenspiel / Crystal Bell harmonics
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const osc3 = ctx.createOscillator();
            const gain = ctx.createGain();

            // High pure chime frequencies (A6 + A7 + E8 shimmer)
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(1760, now); // Fundamental bell chime

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(3520, now); // 2nd harmonic sparkle

            osc3.type = 'triangle';
            osc3.frequency.setValueAtTime(2637, now); // 5th harmonic sweetness

            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.28, now + 0.005); // Instant strike
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85); // Shimmer decay

            osc1.connect(gain);
            osc2.connect(gain);
            osc3.connect(gain);
            gain.connect(ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc3.start(now);
            osc1.stop(now + 0.9);
            osc2.stop(now + 0.9);
            osc3.stop(now + 0.9);

            // Haptic vibration on supported devices
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([40, 20, 60]);
            }
        } catch { }
    }, [soundFxEnabled]);

    // ─── Web Audio: Realistic Acoustic Guitar Pluck (Ear Tuning) ─────
    const playAcousticPluck = useCallback((frequency: number) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            // Body tone + pick strike transient
            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();

            // Pluck noise burst for pick attack
            const bufferSize = ctx.sampleRate * 0.02; // 20ms burst
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.12, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

            // Acoustic string resonance (Triangle with warm low-pass)
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(frequency, now);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(frequency * 5, now);
            filter.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 1.2);

            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.4, now + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

            noise.connect(noiseGain);
            noiseGain.connect(filter);
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start(now);
            osc.start(now);
            osc.stop(now + 2.3);
        } catch { }
    }, []);

    // ─── Stop Microphone & Audio Analysis ─────────────────────────────
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
        setVibratingStringIndex(null);
    }, []);

    // ─── Start Microphone & Pitch Detection ───────────────────────────
    const startListening = useCallback(async () => {
        setMicError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
            });
            mediaStreamRef.current = stream;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx({ latencyHint: 'interactive' });
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
                    const result = frequencyToNote(freq, a4Frequency);
                    setPitch(result);

                    // Smooth needle animation
                    setSmoothedCents(prev => prev + (result.cents - prev) * 0.35);

                    // Identify matching string in preset
                    let matchingIdx: number | null = null;
                    let closestDist = Infinity;

                    currentStrings.forEach((s, idx) => {
                        const dist = Math.abs(freq - s.frequency);
                        if (dist < closestDist) {
                            closestDist = dist;
                            matchingIdx = idx;
                        }
                    });

                    // Only consider matched if within a musical interval (~30% range)
                    if (matchingIdx !== null && closestDist < currentStrings[matchingIdx].frequency * 0.28) {
                        setVibratingStringIndex(matchingIdx);
                        if (autoMode) {
                            setActiveStringIndex(matchingIdx);
                        }
                    }

                    // Check for "In Tune" lock (within ±3 cents of target)
                    if (Math.abs(result.cents) <= 3) {
                        setInTuneSuccessTrigger(true);
                        playInTuneChime();
                    } else {
                        setInTuneSuccessTrigger(false);
                    }
                } else {
                    // Gradual reset when silence
                    setVibratingStringIndex(null);
                    setSmoothedCents(prev => prev * 0.85);
                }

                rafRef.current = requestAnimationFrame(detect);
            };

            detect();
        } catch (err: unknown) {
            console.error('Microphone access denied:', err);
            setMicError('Microphone permission required to tune your instrument.');
            setIsListening(false);
        }
    }, [a4Frequency, autoMode, currentStrings, playInTuneChime]);

    // Clean up on unmount
    useEffect(() => {
        return () => stopListening();
    }, [stopListening]);

    const handleStartTuner = () => {
        setHasStarted(true);
        startListening();
    };

    // Calculate needle rotation (-50 to +50 cents -> -45deg to +45deg)
    const targetCents = pitch ? pitch.cents : 0;
    const clampedCents = Math.max(-50, Math.min(50, targetCents));
    const needleRotationDeg = (clampedCents / 50) * 45;

    // Status analysis
    const tuningStatus = pitch ? getTuningStatus(pitch.cents) : null;
    const isLockedInTune = pitch ? Math.abs(pitch.cents) <= 3 : false;

    // Active targeted string
    const targetString = activeStringIndex !== null ? currentStrings[activeStringIndex] : null;

    // Current preset info
    const activePresetInfo = TUNING_PRESETS_INFO.find(p => p.id === activePreset) || TUNING_PRESETS_INFO[0];

    return (
        <div className="min-h-screen bg-[#03010B] text-white select-none overflow-x-hidden flex flex-col relative font-sans">
            {/* Ambient Dynamic Background Aura */}
            <div
                className="fixed inset-0 pointer-events-none transition-all duration-700 z-0"
                style={{
                    background: isLockedInTune
                        ? 'radial-gradient(ellipse at 50% 25%, rgba(16,185,129,0.22) 0%, transparent 65%)'
                        : pitch
                        ? 'radial-gradient(ellipse at 50% 25%, rgba(245,158,11,0.14) 0%, transparent 65%)'
                        : 'radial-gradient(ellipse at 50% 25%, rgba(255,255,255,0.03) 0%, transparent 65%)'
                }}
            />

            {/* Top Navigation Bar */}
            <header className="relative z-40 bg-[#060412]/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl">
                <BackButton
                    fallback="/worship"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-bold text-white/80 active:scale-95"
                >
                    <span>Exit</span>
                </BackButton>

                <div className="flex items-center gap-2">
                    <span className="font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-amber-400 via-white to-amber-400 bg-clip-text text-transparent">
                        COJ GUITARTUNA
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 hidden sm:inline">
                        {a4Frequency} Hz
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Sound FX Toggle */}
                    <button
                        type="button"
                        onClick={() => setSoundFxEnabled(!soundFxEnabled)}
                        className={`p-2 rounded-xl border transition-all active:scale-95 ${
                            soundFxEnabled
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                                : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                        title={soundFxEnabled ? 'In-tune Chime ON' : 'In-tune Chime MUTED'}
                    >
                        {soundFxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </button>

                    {/* Calibration Settings */}
                    <button
                        type="button"
                        onClick={() => setShowSettingsModal(true)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all active:scale-95"
                        title="Tuning Settings"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Microphone Notice */}
            {micError && (
                <div className="relative z-20 max-w-md mx-auto px-4 pt-3">
                    <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-medium text-center">
                        {micError}
                    </div>
                </div>
            )}

            {/* MAIN GUITARTUNA STAGE */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-between max-w-xl mx-auto w-full px-4 pt-2 pb-28">

                {/* 1. TOP CURVED ARCH GAUGE (Iconic Yousician Meter) */}
                <div className="w-full flex flex-col items-center pt-2">
                    {/* Arch Meter Container */}
                    <div className="relative w-72 sm:w-84 h-36 flex items-center justify-center overflow-hidden">
                        {/* Gauge Arc SVG */}
                        <svg className="w-full h-full" viewBox="0 0 320 160">
                            <defs>
                                <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                                    <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.6" />
                                    <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
                                    <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.6" />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.4" />
                                </linearGradient>
                            </defs>

                            {/* Background Arc Track */}
                            <path
                                d="M 30 150 A 130 130 0 0 1 290 150"
                                fill="none"
                                stroke="#1C182E"
                                strokeWidth="12"
                                strokeLinecap="round"
                            />

                            {/* Center Target Sweet Spot */}
                            <path
                                d="M 152 20 A 130 130 0 0 1 168 20"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="14"
                                strokeLinecap="round"
                            />

                            {/* Cent Tick Marks */}
                            {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((c) => {
                                const angleRad = ((c / 50) * 45 - 90) * (Math.PI / 180);
                                const x1 = 160 + 115 * Math.cos(angleRad);
                                const y1 = 150 + 115 * Math.sin(angleRad);
                                const x2 = 160 + (c === 0 ? 138 : 126) * Math.cos(angleRad);
                                const y2 = 150 + (c === 0 ? 138 : 126) * Math.sin(angleRad);
                                return (
                                    <line
                                        key={c}
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke={c === 0 ? '#10b981' : 'rgba(255,255,255,0.2)'}
                                        strokeWidth={c === 0 ? 3 : 1.5}
                                        strokeLinecap="round"
                                    />
                                );
                            })}
                        </svg>

                        {/* Physical Eased Needle */}
                        <div
                            className="absolute bottom-2 left-1/2 w-1 h-32 origin-bottom transition-transform duration-100 ease-out pointer-events-none"
                            style={{
                                transform: `translateX(-50%) rotate(${needleRotationDeg}deg)`
                            }}
                        >
                            <div
                                className={`w-1.5 h-full rounded-full transition-colors ${
                                    isLockedInTune
                                        ? 'bg-emerald-400 shadow-[0_0_16px_#10b981]'
                                        : 'bg-amber-400 shadow-[0_0_12px_#f59e0b]'
                                }`}
                            />
                            {/* Needle Pivot Cap */}
                            <div className="w-5 h-5 rounded-full bg-white border-2 border-black absolute -bottom-2.5 left-1/2 -translate-x-1/2 shadow-lg" />
                        </div>

                        {/* In-Tune Ripple Ring Animation */}
                        {isLockedInTune && (
                            <div className="absolute inset-0 rounded-full border-4 border-emerald-400/40 animate-ping pointer-events-none" />
                        )}
                    </div>

                    {/* Yousician Status Banner */}
                    <div className="text-center mt-1 space-y-1">
                        {!hasStarted ? (
                            <button
                                onClick={handleStartTuner}
                                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2 mx-auto"
                            >
                                <Mic className="w-4 h-4" />
                                <span>Tap to Start Tuner</span>
                            </button>
                        ) : pitch ? (
                            <div>
                                <div className={`text-base sm:text-lg font-black tracking-wider uppercase flex items-center justify-center gap-1.5 ${
                                    isLockedInTune ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                    {isLockedInTune && <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />}
                                    <span>{tuningStatus?.label}</span>
                                </div>
                                <div className="text-xs text-white/50 font-bold">
                                    {tuningStatus?.subLabel} • <span className="font-mono text-amber-400">{pitch.frequency.toFixed(1)} Hz</span> ({pitch.cents > 0 ? `+${pitch.cents}c` : `${pitch.cents}c`})
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span>Pluck a string...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. REALISTIC 3D GUITAR HEADSTOCK & PEGS */}
                <div className="relative w-full max-w-sm mx-auto my-3 flex items-center justify-between px-2">
                    {/* Realistic Wooden Headstock Silhouette & Neck */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-[-40px] w-48 sm:w-56 pointer-events-none flex flex-col items-center">
                        {/* Headstock Body */}
                        <div
                            className="w-full h-64 bg-gradient-to-b from-[#1C172B] via-[#120F1E] to-[#0A0812] border border-white/10 rounded-t-[40px] shadow-2xl relative overflow-hidden"
                            style={{
                                clipPath: 'polygon(12% 0%, 88% 0%, 100% 25%, 92% 100%, 8% 100%, 0% 25%)'
                            }}
                        >
                            {/* Subtle Woodgrain & Carbon Lustre */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5" />
                            {/* Inlay Badge */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black tracking-widest text-amber-400/80 uppercase">
                                Call of Jesus
                            </div>
                        </div>

                        {/* White Bone Nut */}
                        <div className="w-36 h-3 bg-gradient-to-r from-neutral-300 via-white to-neutral-300 rounded-sm shadow-md z-10 border-b border-black/40 flex justify-evenly px-2">
                            {[1, 2, 3, 4, 5, 6].map(slot => (
                                <div key={slot} className="w-0.5 h-full bg-neutral-600/40" />
                            ))}
                        </div>

                        {/* Fretboard Neck extending down */}
                        <div className="w-34 h-24 bg-gradient-to-b from-[#1E1712] to-[#120E0A] border-x border-white/10 relative flex justify-evenly px-1">
                            {/* Fret wire */}
                            <div className="absolute top-10 left-0 right-0 h-0.5 bg-neutral-300/40 shadow-sm" />

                            {/* 6 Physically Vibrating Strings */}
                            {currentStrings.map((str, sIdx) => {
                                const isVibrating = vibratingStringIndex === sIdx;
                                const isTarget = activeStringIndex === sIdx;

                                return (
                                    <div
                                        key={str.label}
                                        className={`h-full transition-all relative ${
                                            isVibrating
                                                ? 'bg-amber-400 animate-pulse w-1 shadow-[0_0_8px_#f59e0b]'
                                                : isTarget
                                                ? 'bg-amber-300/80 w-0.5'
                                                : 'bg-white/20 w-px'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Left Pegs (Lower Strings: e.g. 6th E, 5th A, 4th D) */}
                    <div className="relative z-30 flex flex-col gap-3 sm:gap-4">
                        {leftStrings.map((str) => {
                            const originalIdx = currentStrings.findIndex(s => s.label === str.label);
                            const isActive = activeStringIndex === originalIdx;
                            const isVibrating = vibratingStringIndex === originalIdx;

                            return (
                                <button
                                    key={str.label}
                                    type="button"
                                    onClick={() => {
                                        setActiveStringIndex(originalIdx);
                                        setAutoMode(false);
                                        playAcousticPluck(str.frequency);
                                    }}
                                    className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl transition-all active:scale-95 group ${
                                        isActive
                                            ? 'bg-amber-500/15 border border-amber-500/50 shadow-lg shadow-amber-500/15 ring-2 ring-amber-500/20'
                                            : 'bg-[#120E1E]/90 border border-white/10 hover:border-white/20'
                                    }`}
                                    title={`Tap to select ${str.label} or hear reference pluck`}
                                >
                                    {/* Tuning Peg Dial */}
                                    <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex flex-col items-center justify-center font-black transition-all ${
                                        isActive
                                            ? 'bg-amber-500 text-black shadow-md'
                                            : 'bg-white/5 text-white/80 group-hover:text-white border border-white/5'
                                    }`}>
                                        <span className="text-base sm:text-lg leading-none">{str.note}</span>
                                        <span className={`text-[9px] font-mono mt-0.5 ${isActive ? 'text-black/70' : 'text-white/40'}`}>
                                            {str.stringNumber}
                                        </span>
                                    </div>

                                    {/* String metadata */}
                                    <div className="text-left hidden xs:block pr-1">
                                        <div className="text-xs font-bold text-white/90">{str.label}</div>
                                        <div className="text-[10px] font-mono text-white/40">{str.frequency.toFixed(1)} Hz</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Pegs (Higher Strings: e.g. 3rd G, 2nd B, 1st E) */}
                    <div className="relative z-30 flex flex-col gap-3 sm:gap-4">
                        {rightStrings.map((str) => {
                            const originalIdx = currentStrings.findIndex(s => s.label === str.label);
                            const isActive = activeStringIndex === originalIdx;
                            const isVibrating = vibratingStringIndex === originalIdx;

                            return (
                                <button
                                    key={str.label}
                                    type="button"
                                    onClick={() => {
                                        setActiveStringIndex(originalIdx);
                                        setAutoMode(false);
                                        playAcousticPluck(str.frequency);
                                    }}
                                    className={`flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl transition-all active:scale-95 group ${
                                        isActive
                                            ? 'bg-amber-500/15 border border-amber-500/50 shadow-lg shadow-amber-500/15 ring-2 ring-amber-500/20'
                                            : 'bg-[#120E1E]/90 border border-white/10 hover:border-white/20'
                                    }`}
                                    title={`Tap to select ${str.label} or hear reference pluck`}
                                >
                                    {/* String metadata */}
                                    <div className="text-right hidden xs:block pl-1">
                                        <div className="text-xs font-bold text-white/90">{str.label}</div>
                                        <div className="text-[10px] font-mono text-white/40">{str.frequency.toFixed(1)} Hz</div>
                                    </div>

                                    {/* Tuning Peg Dial */}
                                    <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex flex-col items-center justify-center font-black transition-all ${
                                        isActive
                                            ? 'bg-amber-500 text-black shadow-md'
                                            : 'bg-white/5 text-white/80 group-hover:text-white border border-white/5'
                                    }`}>
                                        <span className="text-base sm:text-lg leading-none">{str.note}</span>
                                        <span className={`text-[9px] font-mono mt-0.5 ${isActive ? 'text-black/70' : 'text-white/40'}`}>
                                            {str.stringNumber}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. CENTER NOTE BADGE */}
                {targetString && (
                    <div className="px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-2 text-xs font-mono">
                        <span className="text-white/40 uppercase font-bold">Target Note:</span>
                        <span className="text-amber-400 font-black">{targetString.label}</span>
                        <span className="text-white/50">({targetString.frequency.toFixed(2)} Hz)</span>
                    </div>
                )}
            </main>

            {/* 4. FLOATING BOTTOM DOCK (GuitarTuna Controls) */}
            <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md">
                {/* Preset Dropup Drawer */}
                {showPresetPicker && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full bg-[#120E22]/98 backdrop-blur-2xl border border-white/15 rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-3 max-h-80 overflow-y-auto no-scrollbar">
                        <div className="px-5 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                                Select Tuning Preset
                            </span>
                            <button onClick={() => setShowPresetPicker(false)} className="p-1 text-white/40 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-2 space-y-1">
                            {TUNING_PRESETS_INFO.map(preset => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => {
                                        setActivePreset(preset.id);
                                        setShowPresetPicker(false);
                                        setActiveStringIndex(null);
                                    }}
                                    className={`w-full px-4 py-3 rounded-2xl text-left transition-all flex items-center justify-between ${
                                        activePreset === preset.id
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                            : 'text-white/70 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <div>
                                        <div className="font-bold text-xs sm:text-sm">{preset.name}</div>
                                        <div className="text-[11px] text-white/40">{preset.description}</div>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-amber-400/80 px-2 py-0.5 rounded bg-black/40 border border-white/5 shrink-0">
                                        {preset.notesDisplay}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Floating Bar */}
                <div className="flex items-center justify-between bg-[#120E22]/95 backdrop-blur-2xl border border-white/15 p-1.5 rounded-full shadow-2xl">
                    {/* Tuning Preset Selector */}
                    <button
                        type="button"
                        onClick={() => setShowPresetPicker(!showPresetPicker)}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-full hover:bg-white/5 transition-colors group min-w-0"
                    >
                        <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                            {activePresetInfo.name.split(' (')[0]}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform shrink-0 ${showPresetPicker ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Mode Toggles */}
                    <div className="flex items-center gap-1.5">
                        {/* Auto Mode Switch */}
                        <button
                            type="button"
                            onClick={() => {
                                setAutoMode(!autoMode);
                                if (!autoMode) setActiveStringIndex(null);
                            }}
                            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                                autoMode
                                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/25'
                                    : 'bg-white/5 text-white/50 border border-white/10 hover:text-white'
                            }`}
                        >
                            {autoMode ? 'AUTO' : 'MANUAL'}
                        </button>
                    </div>
                </div>
            </div>

            {/* 5. SETTINGS & CALIBRATION MODAL */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => setShowSettingsModal(false)}
                    />

                    <div className="relative w-full max-w-sm bg-[#130F24] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-amber-400" />
                                <h3 className="text-sm font-black text-white">TUNER SETTINGS</h3>
                            </div>
                            <button onClick={() => setShowSettingsModal(false)} className="p-1 rounded-full bg-white/5 text-white/50">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Calibration Frequency */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center justify-between">
                                <span>A4 Reference Calibration</span>
                                <span className="text-amber-400 font-mono font-bold">{a4Frequency} Hz</span>
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[432, 440, 442].map(freq => (
                                    <button
                                        key={freq}
                                        type="button"
                                        onClick={() => setA4Frequency(freq)}
                                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                                            a4Frequency === freq
                                                ? 'bg-amber-500 text-black border-amber-500 font-black'
                                                : 'bg-white/5 border-white/5 text-white/70 hover:text-white'
                                        }`}
                                    >
                                        {freq} Hz
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-white/40">
                                440 Hz is the universal standard for worship bands, acoustic guitar, and modern piano.
                            </p>
                        </div>

                        {/* Sound FX Toggle */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <div>
                                <div className="text-xs font-bold text-white">In-Tune &quot;Ding!&quot; Chime</div>
                                <div className="text-[10px] text-white/40">Plays audio feedback when pitch is locked</div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSoundFxEnabled(!soundFxEnabled)}
                                className={`w-11 h-6 rounded-full transition-colors p-1 ${
                                    soundFxEnabled ? 'bg-amber-500' : 'bg-white/10'
                                }`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-black transition-transform ${
                                    soundFxEnabled ? 'translate-x-5' : 'translate-x-0'
                                }`} />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowSettingsModal(false)}
                            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
