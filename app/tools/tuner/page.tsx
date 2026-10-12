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
    Info,
    HelpCircle
} from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import {
    detectPitch,
    frequencyToNote,
    getTuningStatus,
    calculateCentsBetween,
    findClosestPresetString,
    TUNING_PRESETS_INFO,
    GUITAR_PRESET_STRINGS,
    type TuningPreset,
    type GuitarString,
    type PitchResult,
    DEFAULT_A4_FREQUENCY
} from '@/lib/pitchDetection';

export default function TunerPage() {
    // Tuner Settings
    const [hasStarted, setHasStarted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [autoMode, setAutoMode] = useState(true);
    const [activePreset, setActivePreset] = useState<TuningPreset>('standard');
    const [a4Frequency, setA4Frequency] = useState<number>(DEFAULT_A4_FREQUENCY);
    const [soundFxEnabled, setSoundFxEnabled] = useState(true);

    // Live Detection States
    const [pitch, setPitch] = useState<PitchResult | null>(null);
    const [smoothedCents, setSmoothedCents] = useState(0);
    const [activeStringIndex, setActiveStringIndex] = useState<number>(0);
    const [vibratingStringIndex, setVibratingStringIndex] = useState<number | null>(null);
    const [isLockedInTune, setIsLockedInTune] = useState(false);
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

    // Stability Buffers
    const recentFreqsRef = useRef<number[]>([]);
    const silenceCounterRef = useRef<number>(0);
    const inTuneFramesRef = useRef<number>(0);
    const hasChimedRef = useRef<boolean>(false);
    const lastChimeTimeRef = useRef<number>(0);
    const lastProcessTimeRef = useRef<number>(0);

    // Active strings for selected preset
    const currentStrings = GUITAR_PRESET_STRINGS[activePreset] || GUITAR_PRESET_STRINGS.standard;
    const targetString = currentStrings[activeStringIndex] || currentStrings[0];

    // Split strings into Left (lower strings 6, 5, 4) and Right (higher strings 3, 2, 1)
    const half = Math.ceil(currentStrings.length / 2);
    const leftStrings = currentStrings.slice(0, half);
    const rightStrings = currentStrings.slice(half);

    // ─── Web Audio: Iconic GuitarTuna "TANGGG!" In-Tune Chime ────────
    const playInTuneTangg = useCallback(() => {
        if (!soundFxEnabled) return;
        const nowMs = Date.now();
        if (nowMs - lastChimeTimeRef.current < 2000) return;
        lastChimeTimeRef.current = nowMs;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            // 1. Crystal Harmonic Bell Strike (1760 Hz + 2637 Hz + 3520 Hz)
            const osc1 = ctx.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(1760, now);

            const osc2 = ctx.createOscillator();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(2637, now);

            const osc3 = ctx.createOscillator();
            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(3520, now);

            // 2. Resonant Metallic "TANG" Body Tone (880 Hz fundamental bell)
            const oscBody = ctx.createOscillator();
            oscBody.type = 'triangle';
            oscBody.frequency.setValueAtTime(880, now);

            // Resonant Bandpass filter for authentic acoustic bell chime
            const bandpass = ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.setValueAtTime(1760, now);
            bandpass.Q.setValueAtTime(3.5, now);

            // Master envelope: Crisp strike attack + long resonant "tanggg" decay
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.38, now + 0.003); // Instant crisp "T" strike
            gain.gain.exponentialRampToValueAtTime(0.08, now + 0.35); // "AAAN" body
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4); // "GGG" decay

            osc1.connect(gain);
            osc2.connect(bandpass).connect(gain);
            osc3.connect(gain);
            oscBody.connect(gain);
            gain.connect(ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc3.start(now);
            oscBody.start(now);

            osc1.stop(now + 1.45);
            osc2.stop(now + 1.45);
            osc3.stop(now + 1.45);
            oscBody.stop(now + 1.45);

            // Haptic vibration feedback on phones
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([45, 25, 75]);
            }
        } catch { }
    }, [soundFxEnabled]);

    // ─── Web Audio: Acoustic Guitar Pluck (Ear Tuning) ────────────────
    const playAcousticPluck = useCallback((frequency: number) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const filter = ctx.createBiquadFilter();
            const gain = ctx.createGain();

            // Pluck noise click
            const bufferSize = ctx.sampleRate * 0.02;
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.12, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

            // String tone
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

    // ─── Stop Audio Stream ───────────────────────────────────────────
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
        setIsLockedInTune(false);
    }, []);

    // ─── McLeod Pitch Method Detection Loop ───────────────────────────
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
            analyser.fftSize = 2048; // Optimized for guitar fundamental resolution & fast CPU
            src.connect(analyser);
            analyserRef.current = analyser;
            bufferRef.current = new Float32Array(analyser.fftSize);
            setIsListening(true);

            const detectLoop = () => {
                if (!analyserRef.current || !bufferRef.current || !audioContextRef.current) return;
                
                const nowMs = performance.now();
                // Process audio every 35ms (~28 fps) while RAF runs smooth visual easing at 60 fps
                if (nowMs - lastProcessTimeRef.current >= 35) {
                    lastProcessTimeRef.current = nowMs;

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    analyserRef.current.getFloatTimeDomainData(bufferRef.current as any);

                    // Run MPM NSDF pitch detection
                    const rawPitch = detectPitch(bufferRef.current, audioContextRef.current.sampleRate);

                    if (rawPitch) {
                        silenceCounterRef.current = 0;

                        // Stability filter: ensure pitch consistency
                        const history = recentFreqsRef.current;
                        history.push(rawPitch.frequency);
                        if (history.length > 3) history.shift();

                        const isStable = history.length >= 2 && Math.abs(history[history.length - 1] - history[history.length - 2]) / history[history.length - 1] < 0.04;

                        if (isStable) {
                            const stableFreq = history.reduce((a, b) => a + b, 0) / history.length;
                            const result = frequencyToNote(stableFreq, a4Frequency, rawPitch.clarity, rawPitch.rms);
                            setPitch(result);

                            let currentTarget = currentStrings[activeStringIndex];

                            // In AUTO Mode: identify matching string from active preset
                            if (autoMode) {
                                const match = findClosestPresetString(stableFreq, currentStrings);
                                if (match) {
                                    setActiveStringIndex(match.stringIndex);
                                    setVibratingStringIndex(match.stringIndex);
                                    currentTarget = match.stringItem;
                                }
                            } else {
                                setVibratingStringIndex(activeStringIndex);
                            }

                            // Calculate exact cents offset relative to TARGET string
                            const centsFromTarget = calculateCentsBetween(stableFreq, currentTarget.frequency);
                            const clamped = Math.max(-50, Math.min(50, centsFromTarget));

                            // Smooth needle towards target
                            setSmoothedCents(prev => prev + (clamped - prev) * 0.35);

                            // In-Tune Lock Check (within ±3 cents of target string)
                            if (Math.abs(centsFromTarget) <= 3) {
                                inTuneFramesRef.current++;
                                if (inTuneFramesRef.current >= 8) {
                                    setIsLockedInTune(true);
                                    if (!hasChimedRef.current) {
                                        playInTuneTangg(); // Trigger the signature "Taaannnggg!" chime
                                        hasChimedRef.current = true;
                                    }
                                }
                            } else {
                                inTuneFramesRef.current = 0;
                                hasChimedRef.current = false;
                                setIsLockedInTune(false);
                            }
                        }
                    } else {
                        // SILENCE / ROOM NOISE -> CALM STATE
                        silenceCounterRef.current++;
                        recentFreqsRef.current = [];
                        inTuneFramesRef.current = 0;
                        hasChimedRef.current = false;

                        // Smoothly return needle to resting center
                        setSmoothedCents(prev => prev * 0.88);

                        // If silence for > 500ms, clear vibrating animation
                        if (silenceCounterRef.current > 15) {
                            setVibratingStringIndex(null);
                            setPitch(null);
                            setIsLockedInTune(false);
                        }
                    }
                }

                rafRef.current = requestAnimationFrame(detectLoop);
            };

            detectLoop();
        } catch (err: unknown) {
            console.error('Microphone access denied:', err);
            setMicError('Microphone permission required to tune your guitar.');
            setIsListening(false);
        }
    }, [a4Frequency, activeStringIndex, autoMode, currentStrings, playInTuneTangg]);

    // Clean up on unmount
    useEffect(() => {
        return () => stopListening();
    }, [stopListening]);

    const handleStartTuner = () => {
        setHasStarted(true);
        startListening();
    };

    // Needle rotation (-50 to +50 cents -> -45deg to +45deg)
    const needleRotationDeg = (smoothedCents / 50) * 45;

    // Status relative to target string
    const centsOffsetFromTarget = pitch ? calculateCentsBetween(pitch.frequency, targetString.frequency) : 0;
    const tuningStatus = pitch ? getTuningStatus(centsOffsetFromTarget) : null;

    // Current preset info
    const activePresetInfo = TUNING_PRESETS_INFO.find(p => p.id === activePreset) || TUNING_PRESETS_INFO[0];

    return (
        <div className="min-h-screen bg-[#04020B] text-white select-none overflow-x-hidden flex flex-col relative font-sans">
            {/* Dynamic Background Glow */}
            <div
                className="fixed inset-0 pointer-events-none transition-all duration-700 z-0"
                style={{
                    background: isLockedInTune
                        ? 'radial-gradient(ellipse at 50% 25%, rgba(16,185,129,0.28) 0%, transparent 65%)'
                        : pitch
                        ? 'radial-gradient(ellipse at 50% 25%, rgba(245,158,11,0.14) 0%, transparent 65%)'
                        : 'radial-gradient(ellipse at 50% 25%, rgba(255,255,255,0.02) 0%, transparent 65%)'
                }}
            />

            {/* Top Navigation Bar */}
            <header className="relative z-40 bg-[#080514]/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl">
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
                        title={soundFxEnabled ? 'In-tune "TANGGG" Chime ON' : 'In-tune Chime MUTED'}
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
                <div className="w-full flex flex-col items-center pt-1">
                    {/* Arch Meter Container */}
                    <div className="relative w-72 sm:w-84 h-36 flex items-center justify-center overflow-hidden">
                        {/* Gauge Arc SVG */}
                        <svg className="w-full h-full" viewBox="0 0 320 160">
                            {/* Outer Track */}
                            <path
                                d="M 30 150 A 130 130 0 0 1 290 150"
                                fill="none"
                                stroke="#161226"
                                strokeWidth="14"
                                strokeLinecap="round"
                            />

                            {/* Center Target Sweet Spot */}
                            <path
                                d="M 152 20 A 130 130 0 0 1 168 20"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="16"
                                strokeLinecap="round"
                            />

                            {/* Cent Tick Marks */}
                            {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((c) => {
                                const angleRad = ((c / 50) * 45 - 90) * (Math.PI / 180);
                                const x1 = 160 + 114 * Math.cos(angleRad);
                                const y1 = 150 + 114 * Math.sin(angleRad);
                                const x2 = 160 + (c === 0 ? 140 : 126) * Math.cos(angleRad);
                                const y2 = 150 + (c === 0 ? 140 : 126) * Math.sin(angleRad);
                                return (
                                    <line
                                        key={c}
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke={c === 0 ? '#10b981' : 'rgba(255,255,255,0.25)'}
                                        strokeWidth={c === 0 ? 3.5 : 1.5}
                                        strokeLinecap="round"
                                    />
                                );
                            })}
                        </svg>

                        {/* Physical Eased Needle */}
                        <div
                            className="absolute bottom-2 left-1/2 w-1 h-32 origin-bottom transition-transform duration-75 ease-out pointer-events-none"
                            style={{
                                transform: `translateX(-50%) rotate(${needleRotationDeg}deg)`
                            }}
                        >
                            <div
                                className={`w-1.5 h-full rounded-full transition-colors ${
                                    isLockedInTune
                                        ? 'bg-emerald-400 shadow-[0_0_20px_#10b981]'
                                        : 'bg-amber-400 shadow-[0_0_12px_#f59e0b]'
                                }`}
                            />
                            {/* Needle Pivot Cap */}
                            <div className="w-5 h-5 rounded-full bg-white border-2 border-black absolute -bottom-2.5 left-1/2 -translate-x-1/2 shadow-lg" />
                        </div>

                        {/* In-Tune Ripple Ring Celebration */}
                        {isLockedInTune && (
                            <div className="absolute inset-0 rounded-full border-4 border-emerald-400/60 animate-ping pointer-events-none" />
                        )}
                    </div>

                    {/* Status Banner */}
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
                                <div className={`text-base sm:text-xl font-black tracking-wider uppercase flex items-center justify-center gap-2 ${
                                    isLockedInTune ? 'text-emerald-400 drop-shadow-[0_0_16px_rgba(16,185,129,0.7)] animate-pulse' : 'text-amber-400'
                                }`}>
                                    {isLockedInTune && <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-bounce" />}
                                    <span>{tuningStatus?.label}</span>
                                </div>
                                <div className="text-xs text-white/60 font-bold">
                                    {tuningStatus?.subLabel} • <span className="font-mono text-amber-400">{pitch.frequency.toFixed(1)} Hz</span> ({centsOffsetFromTarget > 0 ? `+${centsOffsetFromTarget}c` : `${centsOffsetFromTarget}c`})
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span>Pluck string {targetString.label}...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. REALISTIC 3D GUITAR HEADSTOCK (GuitarTuna Accurate Design) */}
                <div className="relative w-full max-w-sm mx-auto my-3 flex items-center justify-between px-2">
                    {/* Realistic Handcrafted Wooden Headstock Silhouette & Neck */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-[-40px] w-52 sm:w-60 pointer-events-none flex flex-col items-center">
                        {/* Headstock Wooden Body with Bevel Highlights */}
                        <div
                            className="w-full h-68 bg-gradient-to-b from-[#221B16] via-[#16110D] to-[#0D0907] border border-amber-900/40 rounded-t-[44px] shadow-[0_20px_40px_rgba(0,0,0,0.8)] relative overflow-hidden"
                            style={{
                                clipPath: 'polygon(12% 0%, 88% 0%, 100% 25%, 92% 100%, 8% 100%, 0% 25%)'
                            }}
                        >
                            {/* Authentic Mahogany Woodgrain Sheen */}
                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10" />
                            {/* Realistic Chamfered Edge Highlight */}
                            <div className="absolute inset-1 rounded-t-[40px] border-t border-amber-400/20 pointer-events-none" />

                            {/* Truss Rod Cover Plate */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-7 h-10 bg-black/80 border border-white/20 rounded-b-xl shadow-md flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-400/80 shadow-inner" />
                            </div>

                            {/* Authentic Mother-of-Pearl Inlay Logo */}
                            <div className="absolute top-16 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black tracking-widest text-amber-300 uppercase shadow-sm">
                                COJ TUNA
                            </div>
                        </div>

                        {/* Real Carved Bone Nut with String Slots */}
                        <div className="w-40 h-3.5 bg-gradient-to-r from-neutral-200 via-amber-50 to-neutral-200 rounded-sm shadow-[0_4px_8px_rgba(0,0,0,0.7)] z-10 border-b border-black/60 flex justify-between px-3 items-center">
                            {currentStrings.map((str, sIdx) => (
                                <div key={sIdx} className="w-0.5 h-full bg-neutral-800/60" />
                            ))}
                        </div>

                        {/* Rosewood Fretboard Neck */}
                        <div className="w-38 h-24 bg-gradient-to-b from-[#241B14] to-[#140E0A] border-x border-neutral-800/80 relative flex justify-between px-3 shadow-inner">
                            {/* Nickel-Silver Fret Wire 1 */}
                            <div className="absolute top-10 left-0 right-0 h-1 bg-gradient-to-b from-neutral-300 to-neutral-500 shadow-sm" />
                            {/* Mother-of-pearl Fret Position Marker Dot */}
                            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-gradient-to-br from-white via-neutral-200 to-neutral-400 shadow-md border border-neutral-400/40" />

                            {/* 6 Physically Accurate Gauged Strings */}
                            {currentStrings.map((str, sIdx) => {
                                const isVibrating = vibratingStringIndex === sIdx;
                                const isTarget = activeStringIndex === sIdx;

                                // Realistic string thickness (gauge)
                                const thicknessMap: Record<string, string> = {
                                    'thick-wound': 'w-1.5',
                                    'medium-wound': 'w-1',
                                    'light-wound': 'w-1',
                                    'plain-wound': 'w-0.5',
                                    'plain-steel': 'w-0.5',
                                    'thin-steel': 'w-px',
                                };
                                const widthClass = thicknessMap[str.gauge] || 'w-0.5';

                                return (
                                    <div
                                        key={str.label}
                                        className={`h-full transition-all relative ${widthClass} ${
                                            isVibrating
                                                ? isLockedInTune
                                                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_12px_#10b981]'
                                                    : 'bg-amber-400 animate-pulse shadow-[0_0_10px_#f59e0b]'
                                                : isTarget
                                                ? 'bg-amber-300 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                                                : 'bg-gradient-to-b from-neutral-200 to-neutral-400'
                                        }`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Left Tuning Pegs (Lower Strings: 6th E, 5th A, 4th D) */}
                    <div className="relative z-30 flex flex-col gap-3.5 sm:gap-4.5">
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
                                            ? isLockedInTune
                                                ? 'bg-emerald-500/25 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/30'
                                                : 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.25)] ring-2 ring-amber-500/20'
                                            : 'bg-[#181324]/90 border border-white/10 hover:border-white/20'
                                    }`}
                                    title={`Tap to select ${str.label} or hear reference pluck`}
                                >
                                    {/* Tactile Chrome/Gold Peg Knob */}
                                    <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex flex-col items-center justify-center font-black transition-all ${
                                        isActive
                                            ? isLockedInTune
                                                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/40'
                                                : 'bg-amber-500 text-black shadow-lg shadow-amber-500/40'
                                            : 'bg-white/5 text-white/80 group-hover:text-white border border-white/5'
                                    }`}>
                                        <span className="text-base sm:text-lg leading-none">{str.note}</span>
                                        <span className={`text-[9px] font-mono mt-0.5 ${isActive ? 'text-black/80 font-black' : 'text-white/40'}`}>
                                            {str.stringNumber}
                                        </span>
                                    </div>

                                    <div className="text-left hidden xs:block pr-1">
                                        <div className="text-xs font-bold text-white/90">{str.label}</div>
                                        <div className="text-[10px] font-mono text-white/40">{str.frequency.toFixed(1)} Hz</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Tuning Pegs (Higher Strings: 3rd G, 2nd B, 1st E) */}
                    <div className="relative z-30 flex flex-col gap-3.5 sm:gap-4.5">
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
                                            ? isLockedInTune
                                                ? 'bg-emerald-500/25 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/30'
                                                : 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.25)] ring-2 ring-amber-500/20'
                                            : 'bg-[#181324]/90 border border-white/10 hover:border-white/20'
                                    }`}
                                    title={`Tap to select ${str.label} or hear reference pluck`}
                                >
                                    <div className="text-right hidden xs:block pl-1">
                                        <div className="text-xs font-bold text-white/90">{str.label}</div>
                                        <div className="text-[10px] font-mono text-white/40">{str.frequency.toFixed(1)} Hz</div>
                                    </div>

                                    {/* Tactile Chrome/Gold Peg Knob */}
                                    <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex flex-col items-center justify-center font-black transition-all ${
                                        isActive
                                            ? isLockedInTune
                                                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/40'
                                                : 'bg-amber-500 text-black shadow-lg shadow-amber-500/40'
                                            : 'bg-white/5 text-white/80 group-hover:text-white border border-white/5'
                                    }`}>
                                        <span className="text-base sm:text-lg leading-none">{str.note}</span>
                                        <span className={`text-[9px] font-mono mt-0.5 ${isActive ? 'text-black/80 font-black' : 'text-white/40'}`}>
                                            {str.stringNumber}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. TARGET STRING SPECIFICATION BADGE */}
                <div className="px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 flex items-center gap-2 text-xs font-mono shadow-md">
                    <span className="text-white/40 uppercase font-bold">Target Note:</span>
                    <span className="text-amber-400 font-black">{targetString.label}</span>
                    <span className="text-white/50">({targetString.frequency.toFixed(2)} Hz)</span>
                </div>
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
                                        setActiveStringIndex(0);
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

                    {/* Auto / Manual Mode Toggle */}
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                setAutoMode(!autoMode);
                            }}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
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
                                <div className="text-xs font-bold text-white">In-Tune &quot;TANGGG!&quot; Chime</div>
                                <div className="text-[10px] text-white/40">Plays metallic bell chime when pitch is locked</div>
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
