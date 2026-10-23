'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Volume2,
    VolumeX,
    Check,
    ChevronDown,
    X,
    Mic,
    MicOff,
    Music,
    BookOpen,
    Zap
} from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import {
    NOTE_NAMES,
    DEFAULT_A4_FREQUENCY,
    TUNING_PRESETS_INFO,
    GUITAR_PRESET_STRINGS,
    detectPitch,
    findClosestPresetString,
    calculateCentsBetween,
    GuitarString,
    TuningPreset
} from '@/lib/pitchDetection';

export default function GuitarTunerPage() {
    // -------------------------------------------------------------
    // Core Tuner States
    // -------------------------------------------------------------
    const [guitarType, setGuitarType] = useState<'electric' | 'acoustic'>('electric');
    const [activePreset, setActivePreset] = useState<TuningPreset>('standard');
    const [autoMode, setAutoMode] = useState<boolean>(true);
    const [activeStringIndex, setActiveStringIndex] = useState<number>(5); // Default to Low E (idx 5)
    const [isListening, setIsListening] = useState<boolean>(false);
    const [hasStarted, setHasStarted] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [a4Frequency, setA4Frequency] = useState<number>(DEFAULT_A4_FREQUENCY);

    // Dynamic pitch telemetry
    const [detectedFreq, setDetectedFreq] = useState<number>(0);
    const [displayCents, setDisplayCents] = useState<number>(0);
    const [isLockedInTune, setIsLockedInTune] = useState<boolean>(false);
    const [isSignalActive, setIsSignalActive] = useState<boolean>(false);
    const [signalClarity, setSignalClarity] = useState<number>(0);
    const [micError, setMicError] = useState<string | null>(null);

    // Modals & Navigation
    const [showPresetPicker, setShowPresetPicker] = useState<boolean>(false);
    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'tune' | 'songs' | 'learn'>('tune');

    // -------------------------------------------------------------
    // Audio DSP & Animation Refs (60fps Direct GPU Acceleration)
    // -------------------------------------------------------------
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const bufferRef = useRef<Float32Array | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const needlePinRef = useRef<HTMLDivElement | null>(null);

    // Real-time tracking refs to avoid stale closure lags
    const targetCentsRef = useRef<number>(0);
    const smoothedCentsRef = useRef<number>(0);
    const autoModeRef = useRef<boolean>(autoMode);
    const activeStringIndexRef = useRef<number>(activeStringIndex);
    const a4FrequencyRef = useRef<number>(a4Frequency);
    const currentStringsRef = useRef<GuitarString[]>(GUITAR_PRESET_STRINGS[activePreset]);
    const inTuneCounterRef = useRef<number>(0);
    const hasChimedRef = useRef<boolean>(false);
    const lastSignalTimeRef = useRef<number>(0);
    const lastUiUpdateRef = useRef<number>(0);
    const recentFreqsRef = useRef<number[]>([]);

    // Sticky Hold Engine (GuitarTuna Architecture: holds reading on decay, eliminates noise jumping)
    const lastStableCentsRef = useRef<number>(0);
    const lastStableFreqRef = useRef<number>(0);
    const holdUntilTimestampRef = useRef<number>(0);
    const candidateStringIdxRef = useRef<number>(-1);
    const candidateStringCountRef = useRef<number>(0);

    useEffect(() => { autoModeRef.current = autoMode; }, [autoMode]);
    useEffect(() => { activeStringIndexRef.current = activeStringIndex; }, [activeStringIndex]);
    useEffect(() => { a4FrequencyRef.current = a4Frequency; }, [a4Frequency]);
    useEffect(() => {
        currentStringsRef.current = GUITAR_PRESET_STRINGS[activePreset];
    }, [activePreset]);

    const currentStrings = GUITAR_PRESET_STRINGS[activePreset] || GUITAR_PRESET_STRINGS.standard;
    const activePresetInfo = TUNING_PRESETS_INFO.find(p => p.id === activePreset) || TUNING_PRESETS_INFO[0];
    const targetString = currentStrings[activeStringIndex] || currentStrings[0];
    const targetCalibratedFreq = targetString ? targetString.frequency * (a4Frequency / 440.0) : 82.41;

    // -------------------------------------------------------------
    // Physical String Audio Synthesis (Click to Pluck)
    // -------------------------------------------------------------
    const pluckStringSound = useCallback((freq: number) => {
        if (isMuted) return;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new AudioCtx();
            }
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = guitarType === 'electric' ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.35, now + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.12, now + 0.15);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + 1.25);
        } catch {
            // Ignore autoplay restrictions
        }
    }, [isMuted, guitarType]);

    // -------------------------------------------------------------
    // In-Tune Rewarding Harmonious Chime
    // -------------------------------------------------------------
    const playInTuneChime = useCallback(() => {
        if (isMuted) return;
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new AudioCtx();
            }
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const now = ctx.currentTime;
            const notes = [659.25, 987.77];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);

                gain.gain.setValueAtTime(0.001, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.08 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.9);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.95);
            });
        } catch {
            // Ignore chime errors
        }
    }, [isMuted]);

    // -------------------------------------------------------------
    // Stop Audio Stream
    // -------------------------------------------------------------
    const stopListening = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(t => t.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => {});
        }
        audioContextRef.current = null;
        analyserRef.current = null;
        bufferRef.current = null;
        setIsListening(false);
        setIsLockedInTune(false);
        setIsSignalActive(false);
        targetCentsRef.current = 0;
        lastStableCentsRef.current = 0;
        holdUntilTimestampRef.current = 0;
    }, []);

    // -------------------------------------------------------------
    // Start Audio Stream with Studio Pre-Filtering & YIN Loop
    // -------------------------------------------------------------
    const startListening = useCallback(async () => {
        setMicError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: true, // Enables full sensitivity for microphone input
                    channelCount: 1
                },
            });
            mediaStreamRef.current = stream;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx({ latencyHint: 'interactive' });
            audioContextRef.current = ctx;

            const src = ctx.createMediaStreamSource(stream);

            // Pre-Filters: 40Hz Highpass preserves 82.4Hz Low E while cutting sub-rumble
            const highpass = ctx.createBiquadFilter();
            highpass.type = 'highpass';
            highpass.frequency.setValueAtTime(40, ctx.currentTime);
            highpass.Q.setValueAtTime(0.707, ctx.currentTime);

            const lowpass = ctx.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.setValueAtTime(1200, ctx.currentTime);
            lowpass.Q.setValueAtTime(0.707, ctx.currentTime);

            const analyser = ctx.createAnalyser();
            analyser.fftSize = 4096;
            analyser.smoothingTimeConstant = 0.0;

            src.connect(highpass);
            highpass.connect(lowpass);
            lowpass.connect(analyser);

            analyserRef.current = analyser;
            bufferRef.current = new Float32Array(analyser.fftSize);
            setIsListening(true);
            setHasStarted(true);

            let lastProcessTime = 0;

            const audioLoop = () => {
                if (!analyserRef.current || !bufferRef.current || !audioContextRef.current) return;

                const nowMs = performance.now();

                // Run pitch detection every ~25ms
                if (nowMs - lastProcessTime >= 25) {
                    lastProcessTime = nowMs;

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    analyserRef.current.getFloatTimeDomainData(bufferRef.current as any);

                    const liveAuto = autoModeRef.current;
                    const liveActiveIdx = activeStringIndexRef.current;
                    const liveStrings = currentStringsRef.current;
                    const liveA4 = a4FrequencyRef.current;
                    const targetStr = liveStrings[liveActiveIdx] || liveStrings[0];
                    const targetExpectedFreq = !liveAuto ? targetStr.frequency * (liveA4 / 440.0) : undefined;

                    // Standard YIN pitch detection
                    const pitch = detectPitch(bufferRef.current, audioContextRef.current.sampleRate, targetExpectedFreq);

                    let validReadingFound = false;

                    if (pitch && pitch.clarity >= 0.65 && pitch.frequency >= 55 && pitch.frequency <= 950) {
                        const history = recentFreqsRef.current;
                        history.push(pitch.frequency);
                        if (history.length > 5) history.shift();

                        const sorted = [...history].sort((a, b) => a - b);
                        const medianFreq = sorted[Math.floor(sorted.length / 2)];

                        const isStable = Math.abs(pitch.frequency - medianFreq) / medianFreq < 0.08;

                        if (isStable) {
                            if (liveAuto) {
                                const match = findClosestPresetString(medianFreq, liveStrings, liveActiveIdx);
                                if (match) {
                                    // 4-frame confirmation to prevent rapid flickering between strings
                                    if (match.stringIndex !== liveActiveIdx) {
                                        if (candidateStringIdxRef.current === match.stringIndex) {
                                            candidateStringCountRef.current++;
                                            if (candidateStringCountRef.current >= 4) {
                                                setActiveStringIndex(match.stringIndex);
                                                activeStringIndexRef.current = match.stringIndex;
                                                candidateStringCountRef.current = 0;
                                                targetCentsRef.current = match.centsOffset;
                                                smoothedCentsRef.current = match.centsOffset;
                                            }
                                        } else {
                                            candidateStringIdxRef.current = match.stringIndex;
                                            candidateStringCountRef.current = 1;
                                        }
                                    } else {
                                        candidateStringCountRef.current = 0;
                                    }

                                    // If we are on the active string, apply exponential smoothing
                                    if (match.stringIndex === activeStringIndexRef.current) {
                                        validReadingFound = true;
                                        const rawTarget = match.centsOffset;
                                        // Exponential filter on target cents eliminates needle jitter
                                        targetCentsRef.current = targetCentsRef.current * 0.65 + rawTarget * 0.35;
                                        lastStableCentsRef.current = targetCentsRef.current;
                                        lastStableFreqRef.current = medianFreq;
                                        holdUntilTimestampRef.current = nowMs + 3500; // Hold steady for 3.5s

                                        setIsSignalActive(true);
                                        if (nowMs - lastUiUpdateRef.current > 40) {
                                            lastUiUpdateRef.current = nowMs;
                                            setDisplayCents(Math.round(targetCentsRef.current));
                                            setDetectedFreq(medianFreq);
                                            setSignalClarity(pitch.clarity);
                                        }

                                        // In-Tune Lock-in: +/- 3 cents
                                        if (Math.abs(targetCentsRef.current) <= 3) {
                                            inTuneCounterRef.current++;
                                            if (inTuneCounterRef.current >= 3) {
                                                setIsLockedInTune(true);
                                                if (!hasChimedRef.current) {
                                                    playInTuneChime();
                                                    hasChimedRef.current = true;
                                                }
                                            }
                                        } else {
                                            inTuneCounterRef.current = 0;
                                            hasChimedRef.current = false;
                                            setIsLockedInTune(false);
                                        }
                                    }
                                }
                            } else {
                                // Manual Mode: dedicated tuning on selected string
                                const calTarget = targetStr.frequency * (liveA4 / 440.0);
                                const cents = calculateCentsBetween(medianFreq, calTarget);

                                if (Math.abs(cents) <= 280) {
                                    validReadingFound = true;
                                    const rawTarget = Math.max(-50, Math.min(50, cents));
                                    targetCentsRef.current = targetCentsRef.current * 0.65 + rawTarget * 0.35;
                                    lastStableCentsRef.current = targetCentsRef.current;
                                    lastStableFreqRef.current = medianFreq;
                                    holdUntilTimestampRef.current = nowMs + 3500;

                                    setIsSignalActive(true);
                                    if (nowMs - lastUiUpdateRef.current > 40) {
                                        lastUiUpdateRef.current = nowMs;
                                        setDisplayCents(Math.round(targetCentsRef.current));
                                        setDetectedFreq(medianFreq);
                                        setSignalClarity(pitch.clarity);
                                    }

                                    if (Math.abs(targetCentsRef.current) <= 3) {
                                        inTuneCounterRef.current++;
                                        if (inTuneCounterRef.current >= 3) {
                                            setIsLockedInTune(true);
                                            if (!hasChimedRef.current) {
                                                playInTuneChime();
                                                hasChimedRef.current = true;
                                            }
                                        }
                                    } else {
                                        inTuneCounterRef.current = 0;
                                        hasChimedRef.current = false;
                                        setIsLockedInTune(false);
                                    }
                                }
                            }
                        }
                    }

                    // HOLD LOGIC: When note decays or silence ensues, HOLD the last stable reading
                    if (!validReadingFound) {
                        if (nowMs < holdUntilTimestampRef.current) {
                            setIsSignalActive(true);
                        } else {
                            // After 3.5s of quiet silence, smoothly reset to idle prompt
                            setIsSignalActive(false);
                            setIsLockedInTune(false);
                            hasChimedRef.current = false;
                            inTuneCounterRef.current = 0;
                            targetCentsRef.current = 0;
                            recentFreqsRef.current = [];
                        }
                    }
                }

                // Smooth Needle Physics Along the Curved Arc (GuitarTuna Navigation Standard)
                const centsDiff = targetCentsRef.current - smoothedCentsRef.current;
                smoothedCentsRef.current += centsDiff * 0.14; // Buttery smooth motion

                // Scale cents (-50 to +50) to arc position percentage (12% to 88%)
                const clampedCents = Math.max(-50, Math.min(50, smoothedCentsRef.current));
                const needlePct = 50 + (clampedCents / 50) * 38;

                // Parabolic curved arc lift
                const arcLift = Math.pow((needlePct - 50) / 38, 2) * 14;

                if (needlePinRef.current) {
                    needlePinRef.current.style.left = `${needlePct}%`;
                    needlePinRef.current.style.top = `${arcLift}px`;
                }

                animFrameRef.current = requestAnimationFrame(audioLoop);
            };

            animFrameRef.current = requestAnimationFrame(audioLoop);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Microphone permission denied';
            setMicError(msg);
            setIsListening(false);
        }
    }, [playInTuneChime]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopListening();
        };
    }, [stopListening]);

    // Handle Manual String Select
    const handleSelectString = (idx: number) => {
        setActiveStringIndex(idx);
        activeStringIndexRef.current = idx;
        lastStableCentsRef.current = 0;
        targetCentsRef.current = 0;
        holdUntilTimestampRef.current = 0;
        setIsSignalActive(false);
        setIsLockedInTune(false);
        const str = currentStrings[idx];
        if (str) {
            const calFreq = str.frequency * (a4Frequency / 440.0);
            pluckStringSound(calFreq);
        }
        if (autoMode) {
            setAutoMode(false);
            autoModeRef.current = false;
        }
    };

    const handleToggleAuto = () => {
        const next = !autoMode;
        setAutoMode(next);
        autoModeRef.current = next;
    };

    // Strings ordered from 6 (Low E) down to 1 (High E) for 6-in-line electric headstock
    const electricStrings = [
        { str: currentStrings[5] || currentStrings[0], idx: 5, label: currentStrings[5]?.note || 'E', num: '6', oct: currentStrings[5]?.octave || '2' },
        { str: currentStrings[4] || currentStrings[0], idx: 4, label: currentStrings[4]?.note || 'A', num: '5', oct: currentStrings[4]?.octave || '2' },
        { str: currentStrings[3] || currentStrings[0], idx: 3, label: currentStrings[3]?.note || 'D', num: '4', oct: currentStrings[3]?.octave || '3' },
        { str: currentStrings[2] || currentStrings[0], idx: 2, label: currentStrings[2]?.note || 'G', num: '3', oct: currentStrings[2]?.octave || '3' },
        { str: currentStrings[1] || currentStrings[0], idx: 1, label: currentStrings[1]?.note || 'B', num: '2', oct: currentStrings[1]?.octave || '3' },
        { str: currentStrings[0] || currentStrings[0], idx: 0, label: currentStrings[0]?.note || 'E', num: '1', oct: currentStrings[0]?.octave || '4' },
    ];

    return (
        <div
            className="h-screen w-full text-white select-none flex flex-col justify-between relative overflow-hidden animate-tuner-background-flow no-scrollbar"
            style={{
                backgroundColor: '#1b1c1e',
                backgroundImage: `
                    linear-gradient(#0000 18%, #1b1c1e 70%), 
                    linear-gradient(#1b1c1e 5%, #0000 20%), 
                    repeating-linear-gradient(#ffffff14 calc(100% - 10px) calc(100% - 9px), #0000 calc(100% - 9px) calc(100% + 10px)), 
                    repeating-linear-gradient(90deg, #ffffff14 calc(100% - 10px) calc(100% - 9px), #0000 calc(100% - 9px) calc(100% + 10px))
                `,
                backgroundSize: '100% 100%, 100% 100%, 20px 20px, 20px 20px',
                fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
            }}
        >
            {/* CSS Keyframes for Downward Flow & Scrollbar Removal */}
            <style jsx global>{`
                @keyframes tunerBackgroundFlow {
                    0% {
                        background-position: 50%, 50%, 50% -21px, 50% -21px;
                    }
                    100% {
                        background-position: 50%, 50%, 50% -1px, 50% -1px;
                    }
                }
                .animate-tuner-background-flow {
                    animation: tunerBackgroundFlow 1.2s linear infinite;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes inTunePulse {
                    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 16px rgba(255, 90, 46, 0.9)); }
                    50% { transform: scale(1.08); filter: drop-shadow(0 0 28px rgba(255, 90, 46, 1)); }
                }
                .in-tune-button {
                    animation: inTunePulse 1.2s infinite ease-in-out;
                }
            `}</style>

            {/* ------------------------------------------------------------- */}
            {/* CONTAINER (Auto fluid scale, NO SCROLLBAR)                     */}
            {/* ------------------------------------------------------------- */}
            <div className="text-[3.2vw] min-[420px]:text-[13px] sm:text-[14.5px] md:text-base w-full max-w-4xl mx-auto h-full flex flex-col justify-between relative overflow-hidden no-scrollbar">
                
                {/* ------------------------------------------------------------- */}
                {/* 1. TOP HEADER: CojTuner Branding & Controls                   */}
                {/* ------------------------------------------------------------- */}
                <header className="px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between border-b border-white/[0.08] bg-[#1b1c1e]/90 backdrop-blur-md shrink-0 z-40">
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Clean Single Arrow BackButton */}
                        <BackButton fallback="/worship" className="p-1.5 sm:p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors" />

                        <div>
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-lg sm:text-2xl font-black tracking-tight leading-none">
                                    <span className="text-white font-extrabold">Coj</span>
                                    <span className="text-[#FF5A2E] font-black">Tuner</span>
                                </h1>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPresetPicker(true)}
                                className="flex items-center gap-1 text-[11px] sm:text-xs text-white/60 hover:text-white transition-colors mt-0.5"
                            >
                                <span className="font-semibold text-white/90">{activePresetInfo.name.split('(')[0].trim()}</span>
                                <ChevronDown className="w-3 h-3 opacity-70" />
                            </button>
                        </div>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowSettingsModal(true)}
                            className="text-[11px] sm:text-xs font-mono font-bold text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 sm:py-1 rounded-full transition-colors"
                        >
                            A4: {a4Frequency}Hz
                        </button>

                        <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/10">
                            <span className={`text-[10px] sm:text-[11px] font-black tracking-wider ${autoMode ? 'text-[#FF5A2E]' : 'text-white/40'}`}>
                                AUTO
                            </span>
                            <button
                                type="button"
                                onClick={handleToggleAuto}
                                aria-label="Toggle Auto Mode"
                                className={`w-9 sm:w-11 h-5 sm:h-6 rounded-full transition-colors p-0.5 active:scale-95 flex items-center ${
                                    autoMode ? 'bg-[#FF5A2E]' : 'bg-[#2a2c30]'
                                }`}
                            >
                                <div className={`w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                                    autoMode ? 'translate-x-[16px] sm:translate-x-[20px]' : 'translate-x-0.5'
                                }`} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* ------------------------------------------------------------- */}
                {/* 2. MAIN TUNER VIEWPORT (Authentic GuitarTuna Arc & Headstock)  */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'tune' && (
                    <main className="flex-1 flex flex-col items-center justify-between px-2 sm:px-6 py-1 overflow-hidden min-h-0 no-scrollbar">
                        
                        {/* Guitar Type Selector (Acoustic vs Electric Pill) */}
                        <div className="flex items-center justify-center my-0.5 shrink-0 z-10">
                            <div className="inline-flex rounded-full bg-[#24262b] p-0.5 gap-1 border border-white/[0.08] shadow-inner">
                                <button
                                    type="button"
                                    onClick={() => setGuitarType('electric')}
                                    className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full font-semibold text-xs transition-all ${
                                        guitarType === 'electric'
                                            ? 'bg-[#FF5A2E] text-white shadow-md'
                                            : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    <Zap className="w-3 h-3" />
                                    <span>Electric</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setGuitarType('acoustic')}
                                    className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full font-semibold text-xs transition-all ${
                                        guitarType === 'acoustic'
                                            ? 'bg-[#FF5A2E] text-white shadow-md'
                                            : 'text-white/60 hover:text-white'
                                    }`}
                                >
                                    <span>🎸 Acoustic</span>
                                </button>
                            </div>
                        </div>

                        {/* ------------------------------------------------------------- */}
                        {/* GUITARTUNA AUTHENTIC ARC NEEDLE & CENTER NOTE (NO BLACK BOX)  */}
                        {/* ------------------------------------------------------------- */}
                        <div className="w-full max-w-md h-[80px] sm:h-[95px] flex flex-col items-center justify-center relative shrink-0 my-0.5 z-20">
                            {!hasStarted ? (
                                <button
                                    type="button"
                                    onClick={startListening}
                                    className="px-6 py-2 rounded-2xl bg-gradient-to-r from-[#FF6D00] to-[#FF3D00] hover:opacity-95 text-white font-extrabold text-sm sm:text-base transition-all transform active:scale-95 shadow-[0_0_25px_rgba(255,90,46,0.5)] flex items-center gap-2"
                                >
                                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span>Tap to tune</span>
                                </button>
                            ) : (
                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                    
                                    {/* Curved Arc Background Track */}
                                    <svg viewBox="0 0 340 70" className="w-full h-full pointer-events-none overflow-visible">
                                        {/* Subtle Dotted Arc */}
                                        <path
                                            d="M 50 55 Q 170 20 290 55"
                                            fill="none"
                                            stroke="rgba(255, 255, 255, 0.15)"
                                            strokeWidth="2"
                                            strokeDasharray="3 5"
                                        />
                                        {/* Center Target Hash */}
                                        <line x1="170" y1="20" x2="170" y2="28" stroke="#FF5A2E" strokeWidth="2" />
                                    </svg>

                                    {/* Center Note Target Circle (e.g. E2) */}
                                    <div className="absolute top-[28px] left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none z-15">
                                        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full border flex items-center justify-center transition-all ${
                                            isLockedInTune
                                                ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF3D00] border-white text-white shadow-[0_0_25px_#FF5A2E] scale-110'
                                                : 'bg-[#22252c]/90 border-white/10 text-white shadow-md'
                                        }`}>
                                            <span className="font-black text-sm sm:text-lg leading-none">{targetString.note}</span>
                                            <span className="text-[9px] font-mono opacity-80 mt-1">{targetString.octave}</span>
                                        </div>
                                    </div>

                                    {/* Dynamic Droplet Needle Pin (GuitarTuna Pin Marker) */}
                                    {isSignalActive && (
                                        <div
                                            ref={needlePinRef}
                                            className="absolute pointer-events-none z-30 flex flex-col items-center transition-all duration-75 will-change-[left,top]"
                                            style={{ left: '50%', top: '0px', transform: 'translateX(-50%)' }}
                                        >
                                            {/* Droplet Badge with Number */}
                                            <div className={`px-2 py-0.5 rounded-full border-2 font-mono font-black text-[10px] sm:text-[11px] shadow-xl flex items-center justify-center leading-none ${
                                                isLockedInTune
                                                    ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF3D00] border-white text-white shadow-[0_0_20px_#FF5A2E]'
                                                    : 'bg-[#1b1c1e] border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                                            }`}>
                                                {displayCents > 0 ? `+${displayCents}` : displayCents}
                                            </div>
                                            {/* Droplet Downward Pointing Arrow Beak */}
                                            <div className={`w-0 h-0 border-l-[3.5px] border-r-[3.5px] border-t-[5px] border-transparent mt-[-1px] ${
                                                isLockedInTune ? 'border-t-[#FF5A2E]' : 'border-t-amber-400'
                                            }`} />
                                        </div>
                                    )}

                                    {/* Dynamic Guidance Pill (e.g. "Tune up!", "Tune down!", "In tune!") */}
                                    {isSignalActive ? (
                                        <div className={`absolute top-0 right-3 sm:right-8 px-3 py-0.5 rounded-full text-[10px] sm:text-xs font-black shadow-lg transition-all flex items-center gap-1 leading-none ${
                                            isLockedInTune || Math.abs(displayCents) <= 3
                                                ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF3D00] text-white shadow-[0_0_18px_rgba(255,90,46,0.7)] scale-105'
                                                : displayCents < 0
                                                ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                                                : 'bg-[#ff4560] text-white shadow-[0_0_12px_rgba(255,69,96,0.6)]'
                                        }`}>
                                            {isLockedInTune || Math.abs(displayCents) <= 3
                                                ? 'In tune! ✓'
                                                : displayCents < 0
                                                ? 'Tune up! ↑'
                                                : 'Tune down! ↓'}
                                        </div>
                                    ) : (
                                        <div className="absolute top-1 text-white/40 text-[10px] sm:text-[11px] flex items-center gap-1.5 pointer-events-none">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#FF5A2E] animate-ping" />
                                            <span>Pluck a string...</span>
                                        </div>
                                    )}

                                    {/* Telemetry Readout */}
                                    <div className="absolute bottom-0 w-full flex items-center justify-between px-3 text-[10px] sm:text-[11px] font-mono text-white/60 pointer-events-none">
                                        <div className="flex items-center gap-1">
                                            <span className="text-white/40">Pitch:</span>
                                            <span className={detectedFreq > 0 ? 'text-[#FF5A2E] font-bold' : 'text-white/40'}>
                                                {detectedFreq > 0 ? `${detectedFreq.toFixed(1)} Hz` : '--'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-white/40">Target:</span>
                                            <span className="text-amber-400 font-bold">{targetCalibratedFreq.toFixed(1)} Hz</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ------------------------------------------------------------- */}
                        {/* 3. HEADSTOCK DISPLAY: ELECTRIC (6 LEFT) vs ACOUSTIC (3+3)     */}
                        {/* ------------------------------------------------------------- */}
                        <div className="flex-1 w-full flex items-center justify-center min-h-0 my-auto py-0.5">
                            {guitarType === 'electric' ? (
                                /* ELECTRIC GUITAR: 6 Notes on LEFT HAND SIDE in a Single Vertical Line */
                                <div className="grid box-border items-center justify-center gap-x-[1.2em] sm:gap-x-[1.8em] gap-y-[0.25em] sm:gap-y-[0.4em] grid-rows-[repeat(6,2.7em)] sm:grid-rows-[repeat(6,3.3em)] grid-cols-[2.7em_12em] sm:grid-cols-[3.3em_16em]">
                                    
                                    {/* 6 STRING BUTTONS IN A SINGLE LINE ON THE LEFT */}
                                    {electricStrings.map((item, rowIdx) => {
                                        const isSelected = activeStringIndex === item.idx;
                                        const isTuned = isSelected && isLockedInTune;
                                        return (
                                            <button
                                                key={`${item.label}-${item.num}`}
                                                type="button"
                                                aria-label={`String ${item.label}${item.oct}`}
                                                onClick={() => handleSelectString(item.idx)}
                                                style={{ gridArea: `${rowIdx + 1} / 1` }}
                                                className={`w-full h-full cursor-pointer rounded-full text-[1.2em] font-bold leading-none text-center align-middle transition-all duration-150 p-0 m-0 border shadow-md flex flex-col items-center justify-center active:scale-95 ${
                                                    isTuned
                                                        ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF3D00] text-white border-white in-tune-button scale-110 z-20 shadow-[0_0_20px_#FF5A2E]'
                                                        : isSelected
                                                        ? 'bg-amber-400 text-black border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.7)] scale-105 z-10'
                                                        : 'bg-[#2b2d33] text-white border-white/10 hover:bg-[#383a42]'
                                                }`}
                                            >
                                                <span className="font-black text-xs sm:text-base">{item.label}</span>
                                                <span className="text-[7.5px] sm:text-[9px] font-mono opacity-80 leading-none mt-0.5">{item.num}</span>
                                            </button>
                                        );
                                    })}

                                    {/* ELECTRIC GUITAR HEADSTOCK IMAGE (Properly Scaled Beside Buttons - NO OVERLAP) */}
                                    <div
                                        className="h-full w-full flex items-center justify-center pointer-events-none select-none"
                                        style={{ gridArea: '1 / 2 / span 6 / 2' }}
                                    >
                                        <img
                                            src="/images/tuner/electric_headstock.png"
                                            alt="electric guitar headstock"
                                            className="h-full w-auto max-h-[17.5em] sm:max-h-[21.5em] object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
                                            loading="eager"
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* ACOUSTIC GUITAR: 3 on Left, 3 on Right */
                                <div className="grid box-border items-center justify-center gap-x-[1.1em] gap-y-[0.25em] sm:gap-y-[0.4em] grid-rows-[repeat(6,2.7em)] sm:grid-rows-[repeat(6,3.3em)] grid-cols-[2.7em_10.5em_2.7em] sm:grid-cols-[3.3em_14em_3.3em]">
                                    {/* String 4 (D3) -> row 1, col 1 */}
                                    <button
                                        type="button"
                                        aria-label="String D3"
                                        onClick={() => handleSelectString(3)}
                                        style={{ gridArea: '1 / 1' }}
                                        className={`w-full h-full cursor-pointer rounded-full text-[1.2em] font-bold leading-none text-center align-middle transition-all duration-150 p-0 m-0 border shadow-md flex flex-col items-center justify-center active:scale-95 ${
                                            activeStringIndex === 3 && isLockedInTune
                                                ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF3D00] text-white border-white in-tune-button shadow-[0_0_15px_#FF5A2E]'
                                                : activeStringIndex === 3
                                                ? 'bg-amber-400 text-black border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.7)] scale-105'
                                                : 'bg-[#2b2d33] text-white border-white/10 hover:bg-[#383a42]'
                                        }`}
                                    >
                                        <span>D</span>
                                    </button>

                                    {/* String 5 (A2) -> row 2, col 1 */}
                                    <button
                                        type="button"
                                        aria-label="String A2"
                                        onClick={() => handleSelectString(4)}
                                        style={{ gridArea: '2 / 1' }}
                                        className={`w-full h-full cursor-pointer rounded-full text-[1.2em] font-bold leading-none text-center align-middle transition-all duration-150 p-0 m-0 border shadow-md flex flex-col items-center justify-center active:scale-95 ${
                                            activeStringIndex === 4 && isLockedInTune
                                                ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF3D00] text-white border-white in-tune-button shadow-[0_0_15px_#FF5A2E]'
                                                : activeStringIndex === 4
                                                ? 'bg-amber-400 text-black border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.7)] scale-105'
                                                : 'bg-[#2b2d33] text-white border-white/10 hover:bg-[#383a42]'
                                        }`}
                                    >
                                        <span>A</span>
                                    </button>

                                    {/* String 6 (E2) -> row 3, col 1 */}
                                    <button
                                        type="button"
                                        aria-label="String E2"
                                        onClick={() => handleSelectString(5)}
                                        style={{ gridArea: '3 / 1' }}
                                        className={`w-full h-full cursor-pointer rounded-full text-[1.2em] font-bold leading-none text-center align-middle transition-all duration-150 p-0 m-0 border shadow-md flex flex-col items-center justify-center active:scale-95 ${
                                            activeStringIndex === 5 && isLockedInTune
                                                ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF3D00] text-white border-white in-tune-button shadow-[0_0_15px_#FF5A2E]'
                                                : activeStringIndex === 5
                                                ? 'bg-amber-400 text-black border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.7)] scale-105'
                                                : 'bg-[#2b2d33] text-white border-white/10 hover:bg-[#383a42]'
                                        }`}
                                    >
                                        <span>E</span>
                                    </button>

                                    {/* Right Tuning Buttons (Strings 3G, 2B, 1E) */}
                                    <button
                                        type="button"
                                        aria-label="String G3"
                                        onClick={() => handleSelectString(2)}
                                        style={{ gridArea: '1 / 3' }}
                                        className={`w-full h-full cursor-pointer rounded-full text-[1.2em] font-bold leading-none text-center align-middle transition-all duration-150 p-0 m-0 border shadow-md flex flex-col items-center justify-center active:scale-95 ${
                                            activeStringIndex === 2 && isLockedInTune
                                                ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF3D00] text-white border-white in-tune-button shadow-[0_0_15px_#FF5A2E]'
                                                : activeStringIndex === 2
                                                ? 'bg-amber-400 text-black border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.7)] scale-105'
                                                : 'bg-[#2b2d33] text-white border-white/10 hover:bg-[#383a42]'
                                        }`}
                                    >
                                        <span>G</span>
                                    </button>

                                    <button
                                        type="button"
                                        aria-label="String B3"
                                        onClick={() => handleSelectString(1)}
                                        style={{ gridArea: '2 / 3' }}
                                        className={`w-full h-full cursor-pointer rounded-full text-[1.2em] font-bold leading-none text-center align-middle transition-all duration-150 p-0 m-0 border shadow-md flex flex-col items-center justify-center active:scale-95 ${
                                            activeStringIndex === 1 && isLockedInTune
                                                ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF3D00] text-white border-white in-tune-button shadow-[0_0_15px_#FF5A2E]'
                                                : activeStringIndex === 1
                                                ? 'bg-amber-400 text-black border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.7)] scale-105'
                                                : 'bg-[#2b2d33] text-white border-white/10 hover:bg-[#383a42]'
                                        }`}
                                    >
                                        <span>B</span>
                                    </button>

                                    <button
                                        type="button"
                                        aria-label="String E4"
                                        onClick={() => handleSelectString(0)}
                                        style={{ gridArea: '3 / 3' }}
                                        className={`w-full h-full cursor-pointer rounded-full text-[1.2em] font-bold leading-none text-center align-middle transition-all duration-150 p-0 m-0 border shadow-md flex flex-col items-center justify-center active:scale-95 ${
                                            activeStringIndex === 0 && isLockedInTune
                                                ? 'bg-gradient-to-r from-[#FF6D00] to-[#FF3D00] text-white border-white in-tune-button shadow-[0_0_15px_#FF5A2E]'
                                                : activeStringIndex === 0
                                                ? 'bg-amber-400 text-black border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.7)] scale-105'
                                                : 'bg-[#2b2d33] text-white border-white/10 hover:bg-[#383a42]'
                                        }`}
                                    >
                                        <span>E</span>
                                    </button>

                                    {/* Center Acoustic Headstock Image */}
                                    <div
                                        className="h-full w-full flex items-center justify-center pointer-events-none select-none"
                                        style={{ gridArea: '1 / 2 / span 6 / 2' }}
                                    >
                                        <img
                                            src="/images/tuner/acoustic_headstock.png"
                                            alt="acoustic guitar headstock with tuning pegs"
                                            className="h-full w-auto max-h-[17.5em] sm:max-h-[21.5em] object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
                                            loading="eager"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                )}

                {/* ------------------------------------------------------------- */}
                {/* 4. SONGS & LEARN TABS                                         */}
                {/* ------------------------------------------------------------- */}
                {activeTab === 'songs' && (
                    <div className="flex-1 flex flex-col px-4 sm:px-8 pt-4 overflow-y-auto no-scrollbar">
                        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mb-4">
                            <Music className="w-5 h-5 text-amber-400" />
                            Worship & Praise Songs for Guitar
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                { title: '10,000 Reasons (Bless the Lord)', key: 'G Major', chords: 'G - D - Em - C' },
                                { title: 'Way Maker', key: 'C Major', chords: 'C - G - D - Em' },
                                { title: 'Goodness of God', key: 'G Major', chords: 'G - C - D - Em' },
                                { title: 'What a Beautiful Name', key: 'D Major', chords: 'D - A - Bm - G' },
                            ].map((s, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-[#24262b] border border-white/[0.08]">
                                    <h3 className="font-bold text-white text-base">{s.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-amber-300 mt-1 font-mono">
                                        <span>Key: {s.key}</span>
                                        <span>•</span>
                                        <span>Chords: {s.chords}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'learn' && (
                    <div className="flex-1 flex flex-col px-4 sm:px-8 pt-4 overflow-y-auto no-scrollbar">
                        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mb-4">
                            <BookOpen className="w-5 h-5 text-amber-400" />
                            Guitar Lessons & Worship Chords
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {['Open Chords 101', 'Barre Chords Masterclass', 'Fingerpicking Praise Patterns'].map((title, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-[#24262b] border border-white/[0.08]">
                                    <h3 className="font-bold text-white text-base">{title}</h3>
                                    <p className="text-xs text-white/60 mt-1">Foundational lessons for church praise team guitarists.</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* 5. BOTTOM NAVIGATION & MIC CONTROLS                           */}
                {/* ------------------------------------------------------------- */}
                <footer className="px-3 sm:px-6 py-2 border-t border-white/[0.08] bg-[#1b1c1e] flex items-center justify-between shrink-0 z-40">
                    <button
                        type="button"
                        onClick={isListening ? stopListening : startListening}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-md ${
                            isListening
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-[#FF5A2E] text-white border border-white/20'
                        }`}
                    >
                        {isListening ? (
                            <>
                                <MicOff className="w-3.5 h-3.5" />
                                <span>Stop Mic</span>
                            </>
                        ) : (
                            <>
                                <Mic className="w-3.5 h-3.5" />
                                <span>Start Mic</span>
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-1 bg-[#12141a] p-1 rounded-xl border border-white/[0.06]">
                        <button
                            type="button"
                            onClick={() => setActiveTab('tune')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'tune'
                                    ? 'bg-[#FF5A2E] text-white shadow-sm'
                                    : 'text-white/60 hover:text-white'
                            }`}
                        >
                            Tune
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('songs')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'songs'
                                    ? 'bg-[#FF5A2E] text-white shadow-sm'
                                    : 'text-white/60 hover:text-white'
                            }`}
                        >
                            Songs
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('learn')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                activeTab === 'learn'
                                    ? 'bg-[#FF5A2E] text-white shadow-sm'
                                    : 'text-white/60 hover:text-white'
                            }`}
                        >
                            Learn
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
                    >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#FF5A2E]" />}
                    </button>
                </footer>

                {/* ------------------------------------------------------------- */}
                {/* PRESET PICKER MODAL                                           */}
                {/* ------------------------------------------------------------- */}
                {showPresetPicker && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="w-full max-w-md rounded-3xl bg-[#24262b] border border-white/10 shadow-2xl p-5 overflow-hidden flex flex-col max-h-[85vh]">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <h3 className="font-black text-lg text-white">Select Tuning Preset</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowPresetPicker(false)}
                                    className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="overflow-y-auto py-3 space-y-2 no-scrollbar">
                                {TUNING_PRESETS_INFO.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => {
                                            setActivePreset(p.id);
                                            setActiveStringIndex(guitarType === 'electric' ? 5 : 0);
                                            activeStringIndexRef.current = guitarType === 'electric' ? 5 : 0;
                                            setShowPresetPicker(false);
                                        }}
                                        className={`w-full text-left p-3 rounded-2xl border transition-all flex flex-col ${
                                            activePreset === p.id
                                                ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                                                : 'bg-white/[0.03] border-white/[0.06] text-white/70 hover:text-white hover:bg-white/[0.06]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-sm text-white">{p.name}</span>
                                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/10 text-white/60">
                                                {p.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-white/40 mt-1">{p.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* SETTINGS MODAL: A4 Calibration                                */}
                {/* ------------------------------------------------------------- */}
                {showSettingsModal && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="w-full max-w-sm rounded-3xl bg-[#24262b] border border-white/10 shadow-2xl p-5">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <h3 className="font-black text-lg text-white">A4 Calibration</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowSettingsModal(false)}
                                    className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="py-4 space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-black font-mono text-amber-400">{a4Frequency} Hz</div>
                                    <div className="text-xs text-white/50 mt-1">Concert Pitch Reference</div>
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setA4Frequency(Math.max(420, a4Frequency - 1))}
                                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg"
                                    >
                                        -
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setA4Frequency(DEFAULT_A4_FREQUENCY)}
                                        className="px-3 py-2 rounded-xl bg-amber-400 text-black font-bold text-xs"
                                    >
                                        Reset (440Hz)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setA4Frequency(Math.min(460, a4Frequency + 1))}
                                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
