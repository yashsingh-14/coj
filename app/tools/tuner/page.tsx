'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
    Mic,
    Volume2,
    VolumeX,
    Check,
    Music2,
    ChevronRight,
    ChevronDown,
    Settings,
    X,
    CheckCircle2,
    Lightbulb,
    Sliders,
    Sparkles,
    Radio,
    BookOpen,
    User,
    Search
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
    // ─── Active Tab ──────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<'tune' | 'songs' | 'learn' | 'tools' | 'profile'>('tune');

    // ─── Tuner Settings State ──────────────────────────────────────────
    const [hasStarted, setHasStarted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [autoMode, setAutoMode] = useState(true);
    const [activePreset, setActivePreset] = useState<TuningPreset>('standard');
    const [a4Frequency, setA4Frequency] = useState<number>(DEFAULT_A4_FREQUENCY);
    const [soundFxEnabled, setSoundFxEnabled] = useState(true);

    // ─── Stable Needle & Tuning State ────────────────────────────────
    const [smoothedCents, setSmoothedCents] = useState<number>(0);
    const [displayCents, setDisplayCents] = useState<number>(0);
    const [activeStringIndex, setActiveStringIndex] = useState<number>(0);
    const [isLockedInTune, setIsLockedInTune] = useState(false);
    const [micError, setMicError] = useState<string | null>(null);
    const [isSignalActive, setIsSignalActive] = useState(false);

    // ─── Drawers / Modals ─────────────────────────────────────────────
    const [showPresetPicker, setShowPresetPicker] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    // Strings for selected preset (ordered String 1 [High E] down to String 6 [Low E])
    const currentStrings = GUITAR_PRESET_STRINGS[activePreset] || GUITAR_PRESET_STRINGS.standard;
    const targetString = currentStrings[activeStringIndex] || currentStrings[0];

    // ─── Audio Nodes & Streams ─────────────────────────────────────────
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const bufferRef = useRef<Float32Array | null>(null);

    // ─── LIVE STATE REFS ─────────────────────────────────────────────
    const autoModeRef = useRef(autoMode);
    const activeStringIndexRef = useRef(activeStringIndex);
    const currentStringsRef = useRef(currentStrings);
    const a4FrequencyRef = useRef(a4Frequency);
    useEffect(() => { autoModeRef.current = autoMode; }, [autoMode]);
    useEffect(() => { activeStringIndexRef.current = activeStringIndex; }, [activeStringIndex]);
    useEffect(() => { currentStringsRef.current = currentStrings; }, [currentStrings]);
    useEffect(() => { a4FrequencyRef.current = a4Frequency; }, [a4Frequency]);

    // Stability Buffers
    const recentFreqsRef = useRef<number[]>([]);
    const targetCentsRef = useRef<number>(0);
    const smoothedCentsRef = useRef<number>(0);
    const inTuneFramesRef = useRef<number>(0);
    const hasChimedRef = useRef<boolean>(false);
    const lastChimeTimeRef = useRef<number>(0);
    const lastProcessTimeRef = useRef<number>(0);
    const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ─── Web Audio: Iconic GuitarTuna "TANGGG!" In-Tune Chime ────────
    const playInTuneTangg = useCallback(() => {
        if (!soundFxEnabled) return;
        const nowMs = Date.now();
        if (nowMs - lastChimeTimeRef.current < 1600) return;
        lastChimeTimeRef.current = nowMs;

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            // Harmonic chime strike
            const osc1 = ctx.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(1760, now);

            const osc2 = ctx.createOscillator();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(2637, now);

            const oscBody = ctx.createOscillator();
            oscBody.type = 'triangle';
            oscBody.frequency.setValueAtTime(880, now);

            const bandpass = ctx.createBiquadFilter();
            bandpass.type = 'bandpass';
            bandpass.frequency.setValueAtTime(1760, now);
            bandpass.Q.setValueAtTime(3.5, now);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.35, now + 0.004);
            gain.gain.exponentialRampToValueAtTime(0.05, now + 0.35);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

            osc1.connect(gain);
            osc2.connect(bandpass).connect(gain);
            oscBody.connect(gain);
            gain.connect(ctx.destination);

            osc1.start(now);
            osc2.start(now);
            oscBody.start(now);

            osc1.stop(now + 1.45);
            osc2.stop(now + 1.45);
            oscBody.stop(now + 1.45);

            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([45, 25, 70]);
            }
        } catch { }
    }, [soundFxEnabled]);

    // ─── Web Audio: Acoustic Guitar Pluck (Reference Ear Tuning) ─────
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
            const bufferSize = Math.floor(ctx.sampleRate * 0.02);
            const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const output = noiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

            const noise = ctx.createBufferSource();
            noise.buffer = noiseBuffer;
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.12, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(frequency, now);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(frequency * 5, now);
            filter.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + 1.2);

            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(0.38, now + 0.008);
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
        setIsLockedInTune(false);
        setIsSignalActive(false);
    }, []);

    // ─── Fast Real-Time Autocorrelation Detection Loop ───────────────
    const startListening = useCallback(async () => {
        setMicError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    channelCount: 1
                },
            });
            mediaStreamRef.current = stream;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioCtx({ latencyHint: 'interactive' });
            audioContextRef.current = ctx;

            const src = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 2048; // 2048 buffer executes in <2ms without frame drops
            src.connect(analyser);
            analyserRef.current = analyser;
            bufferRef.current = new Float32Array(analyser.fftSize);
            setIsListening(true);

            const detectLoop = () => {
                if (!analyserRef.current || !bufferRef.current || !audioContextRef.current) return;

                const nowMs = performance.now();
                // Audio processing at 25ms intervals (~40 updates per second)
                if (nowMs - lastProcessTimeRef.current >= 25) {
                    lastProcessTimeRef.current = nowMs;

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    analyserRef.current.getFloatTimeDomainData(bufferRef.current as any);

                    const liveAutoMode = autoModeRef.current;
                    const liveActiveIdx = activeStringIndexRef.current;
                    const liveStrings = currentStringsRef.current;
                    const targetStr = liveStrings[liveActiveIdx] || liveStrings[0];
                    const targetExpectedFreq = !liveAutoMode ? targetStr.frequency : undefined;

                    // McLeod Pitch Method (NSDF) with first-peak thresholding
                    const rawPitch = detectPitch(bufferRef.current, audioContextRef.current.sampleRate, targetExpectedFreq);

                    if (rawPitch && rawPitch.frequency >= 65 && rawPitch.frequency <= 450) {
                        const history = recentFreqsRef.current;
                        history.push(rawPitch.frequency);
                        if (history.length > 5) history.shift();

                        // 5-frame median filtering for rock-solid stability
                        const sorted = [...history].sort((a, b) => a - b);
                        const medianFreq = sorted[Math.floor(sorted.length / 2)];

                        // Accept if close to median
                        const isStable = Math.abs(rawPitch.frequency - medianFreq) / medianFreq < 0.08;

                        if (isStable) {
                            setIsSignalActive(true);
                            let centsOffset = 0;

                            if (liveAutoMode) {
                                // ─── AUTO MODE: Identify which string was plucked ────────
                                const match = findClosestPresetString(medianFreq, liveStrings);
                                if (match) {
                                    setActiveStringIndex(match.stringIndex);
                                    activeStringIndexRef.current = match.stringIndex;
                                    centsOffset = match.centsOffset;
                                }
                            } else {
                                // ─── MANUAL MODE: Strictly tune user-selected string ────
                                const currentTarget = liveStrings[liveActiveIdx] || liveStrings[0];
                                if (currentTarget.frequency < 160 && Math.abs(calculateCentsBetween(medianFreq, currentTarget.frequency * 2)) < 80) {
                                    centsOffset = calculateCentsBetween(medianFreq, currentTarget.frequency * 2);
                                } else {
                                    centsOffset = calculateCentsBetween(medianFreq, currentTarget.frequency);
                                }
                            }

                            // Update target cents reference
                            targetCentsRef.current = centsOffset;
                            setDisplayCents(centsOffset);

                            // In-Tune Lock Check (|cents| <= 3)
                            if (Math.abs(centsOffset) <= 3 && rawPitch.clarity >= 0.52) {
                                inTuneFramesRef.current++;
                                if (inTuneFramesRef.current >= 5) {
                                    setIsLockedInTune(true);
                                    if (!hasChimedRef.current) {
                                        playInTuneTangg();
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
                        // ─── SOUND DECAY / SILENCE: HOLD NEEDLE STEADY! ───
                        // The needle stays locked at the last measured position so guitarist can see it!
                        inTuneFramesRef.current = 0;
                        hasChimedRef.current = false;
                    }
                }

                // ─── SMOOTH PHYSICAL NEEDLE EASING (60fps) ───
                const diff = targetCentsRef.current - smoothedCentsRef.current;
                smoothedCentsRef.current += diff * 0.22;
                setSmoothedCents(smoothedCentsRef.current);

                rafRef.current = requestAnimationFrame(detectLoop);
            };

            detectLoop();
        } catch (err: unknown) {
            console.error('Microphone access denied:', err);
            setMicError('Microphone permission required to tune your guitar.');
            setIsListening(false);
        }
    }, [playInTuneTangg]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
            stopListening();
        };
    }, [stopListening]);

    const handleStartTuner = () => {
        setHasStarted(true);
        startListening();
    };

    // User explicitly taps a note button in the left column
    const handleSelectString = (idx: number) => {
        setActiveStringIndex(idx);
        activeStringIndexRef.current = idx;

        // Turn OFF AUTO mode (switches strictly to manual mode)
        setAutoMode(false);
        autoModeRef.current = false;

        // Play authentic acoustic pluck reference tone
        playAcousticPluck(currentStrings[idx].frequency);

        // Reset buffers for clean tuning of this string
        recentFreqsRef.current = [];
        inTuneFramesRef.current = 0;
        hasChimedRef.current = false;
        setIsLockedInTune(false);
        setIsSignalActive(true);
        targetCentsRef.current = 0;
        setDisplayCents(0);
    };

    // User toggles AUTO mode switch
    const handleToggleAuto = () => {
        const next = !autoMode;
        setAutoMode(next);
        autoModeRef.current = next;
        recentFreqsRef.current = [];
        inTuneFramesRef.current = 0;
        hasChimedRef.current = false;
        setIsLockedInTune(false);
    };

    const activePresetInfo = TUNING_PRESETS_INFO.find(p => p.id === activePreset) || TUNING_PRESETS_INFO[0];

    // Tuning peg knob coordinates along the left edge of the Fender headstock
    const PEG_COORDINATES = [
        { top: '12.5%', left: '43%' },   // Peg 1: High E (String 1)
        { top: '20.0%', left: '39%' },   // Peg 2: B (String 2)
        { top: '27.5%', left: '35%' },   // Peg 3: G (String 3)
        { top: '35.0%', left: '31%' },   // Peg 4: D (String 4)
        { top: '43.0%', left: '27%' },   // Peg 5: A (String 5)
        { top: '51.0%', left: '23%' },   // Peg 6: Low E (String 6)
    ];

    // Smooth needle position across grid (-150 to +150 cents mapped to 14% to 86% width)
    const clampedCents = Math.max(-150, Math.min(150, smoothedCents));
    const needlePercent = 50 + (clampedCents / 150) * 36;
    const badgeCents = Math.round(displayCents);

    return (
        <div className="min-h-screen bg-[#111215] text-white select-none flex flex-col justify-between relative overflow-x-hidden" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
            {/* Centered Mobile/Desktop Wrapper matching GuitarTuna */}
            <div className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between relative bg-[#17181c] shadow-2xl">
                {/* ═══════════════════ MAIN CONTENT BASED ON ACTIVE TAB ═══════════════════ */}
                {activeTab === 'tune' && (
                    <div className="flex-1 flex flex-col justify-between relative overflow-hidden">
                        {/* ─── TOP SECTION: HEADER + INTEGRATED GRID METER ─── */}
                        <div className="relative z-20 w-full flex flex-col pt-2">
                            {/* Top Header: Logo + AUTO Toggle Switch */}
                            <header className="px-4 pt-2 pb-1 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <BackButton fallback="/worship" className="text-white/60 hover:text-white transition-colors">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M15 18l-6-6 6-6" />
                                        </svg>
                                    </BackButton>
                                    <div>
                                        <h1 className="text-2xl font-black tracking-tight select-none leading-none">
                                            <span className="text-white">guitar</span>
                                            <span className="text-[#05d686]">túna</span>
                                        </h1>
                                        <button
                                            type="button"
                                            onClick={() => setShowPresetPicker(!showPresetPicker)}
                                            className="text-left group mt-1.5 flex items-center gap-1"
                                        >
                                            <span className="text-xs font-bold text-white group-hover:text-white/90">
                                                {activePresetInfo.category} 6-string &gt;
                                            </span>
                                            <span className="text-[11px] text-white/40 ml-1">
                                                {activePresetInfo.name.includes('(') ? activePresetInfo.name.split('(')[0].trim() : activePresetInfo.name}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* AUTO Toggle Switch */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-white/50 tracking-wider">AUTO</span>
                                    <button
                                        type="button"
                                        onClick={handleToggleAuto}
                                        aria-label="Toggle Auto Mode"
                                        className={`w-12 h-6.5 rounded-full transition-colors p-0.5 active:scale-95 flex items-center ${
                                            autoMode ? 'bg-[#05d686]' : 'bg-[#2a2c33]'
                                        }`}
                                    >
                                        <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                                            autoMode ? 'translate-x-[22px]' : 'translate-x-0.5'
                                        }`} />
                                    </button>
                                </div>
                            </header>

                            {/* ─── Integrated GuitarTuna Tuning Grid (Seamless Top Half) ─── */}
                            <div className="relative w-full h-[180px] overflow-hidden mt-2">
                                {/* Dark Grid Lines Background */}
                                <div
                                    className="absolute inset-0 pointer-events-none opacity-40"
                                    style={{
                                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                                        backgroundSize: '22px 22px'
                                    }}
                                />

                                {/* Flat (♭) and Sharp (♯) Labels */}
                                <div className="absolute top-2 left-4 text-white/30 text-2xl font-serif select-none pointer-events-none">
                                    ♭
                                </div>
                                <div className="absolute top-2 right-4 text-white/30 text-2xl font-sans select-none pointer-events-none">
                                    ♯
                                </div>

                                {/* Red Side Dash Bracket Marks (matching GuitarTuna screenshots) */}
                                <div className="absolute top-8 left-[14%] w-[2px] h-3 bg-[#ff3355]/40 pointer-events-none" />
                                <div className="absolute top-8 right-[14%] w-[2px] h-3 bg-[#ff3355]/40 pointer-events-none" />

                                {/* Center Stationary Target Marker (O▼ at top center 50%) */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                                    <div className={`w-11 h-11 rounded-full border-[2.5px] flex items-center justify-center transition-all duration-200 ${
                                        isLockedInTune
                                            ? 'border-[#05d686] bg-[#05d686]/20 shadow-[0_0_24px_rgba(5,214,134,0.85)] scale-110'
                                            : 'border-white/80 bg-transparent'
                                    }`}>
                                        {isLockedInTune && (
                                            <Check className="w-5 h-5 text-[#05d686] stroke-[3.5]" />
                                        )}
                                    </div>
                                    <div className={`w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-transparent transition-colors duration-200 ${
                                        isLockedInTune ? 'border-t-[#05d686]' : 'border-t-white/80'
                                    }`} />
                                </div>

                                {/* Center Vertical Guide Hairline */}
                                <div className={`absolute top-16 bottom-0 left-1/2 -translate-x-1/2 w-[1px] pointer-events-none transition-colors duration-200 ${
                                    isLockedInTune ? 'bg-[#05d686] shadow-[0_0_8px_#05d686]' : 'bg-white/15'
                                }`} />

                                {/* ─── Dynamic Moving Vertical Needle (Holds position steadily) ─── */}
                                {hasStarted && isSignalActive && (
                                    <div
                                        className="absolute top-0 bottom-0 pointer-events-none z-15 transition-all duration-75 ease-out"
                                        style={{ left: `${needlePercent}%` }}
                                    >
                                        {/* Full-height Vertical Needle Line */}
                                        <div className={`w-[2px] h-full transition-colors duration-200 ${
                                            isLockedInTune
                                                ? 'bg-[#05d686] shadow-[0_0_12px_#05d686]'
                                                : 'bg-[#ff3355] shadow-[0_0_8px_rgba(255,51,85,0.8)]'
                                        }`} />

                                        {/* Top Pill Badge & Guidance Text */}
                                        <div className={`absolute top-2 whitespace-nowrap pointer-events-none transition-all duration-100 ${
                                            isLockedInTune
                                                ? 'left-1/2 -translate-x-1/2'
                                                : clampedCents < -3
                                                ? 'right-2 flex items-center gap-1.5'
                                                : 'left-2 flex items-center gap-1.5'
                                        }`}>
                                            {isLockedInTune ? (
                                                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#05d686] text-black font-black text-xs shadow-[0_0_15px_#05d686]">
                                                    <span>✓ In tune</span>
                                                </div>
                                            ) : clampedCents < -3 ? (
                                                <>
                                                    <div className="w-7 h-7 rounded-full border-2 border-[#ff3355] bg-[#1a1419] text-[#ff3355] font-black text-[11px] flex items-center justify-center shadow-lg">
                                                        {badgeCents}
                                                    </div>
                                                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-[#20222a]/90 shadow-sm">Tune up</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-[#20222a]/90 shadow-sm">Tune down</span>
                                                    <div className="w-7 h-7 rounded-full border-2 border-[#ff3355] bg-[#1a1419] text-[#ff3355] font-black text-[11px] flex items-center justify-center shadow-lg">
                                                        +{badgeCents}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Waiting Prompt */}
                                {!isSignalActive && hasStarted && (
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-white/40 text-xs pointer-events-none">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#05d686] animate-pulse" />
                                        <span>Pluck a string...</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ─── Center Guideline Note Badge (E⁴ above headstock tip) ─── */}
                        <div className="relative w-full flex items-center justify-center -my-2 z-30 pointer-events-none">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs backdrop-blur-md transition-all duration-200 ${
                                isLockedInTune
                                    ? 'bg-[#05d686]/25 border-[#05d686] text-[#05d686] shadow-[0_0_15px_#05d686]'
                                    : 'bg-[#1e1f26] border-white/15 text-white'
                            }`}>
                                <span>{targetString.note}</span>
                                <span className="text-[10px] text-white/60 font-normal ml-0.5">{targetString.octave}</span>
                            </div>
                        </div>

                        {/* ─── MAIN GUITAR AREA: 6 BUTTONS (LEFT) + REALISTIC HEADSTOCK (RIGHT) ─── */}
                        <div className="relative flex-1 flex items-end justify-between px-3 pb-0 pt-2">
                            {/* Left Column: 6 Note Buttons (E4 down to E2) */}
                            <div className="flex flex-col justify-between py-2 z-30 gap-2 shrink-0 self-center">
                                {currentStrings.map((str, idx) => {
                                    const isActive = activeStringIndex === idx;
                                    const isTuned = isActive && isLockedInTune;

                                    return (
                                        <button
                                            key={`${str.note}-${str.stringNumber}`}
                                            type="button"
                                            onClick={() => handleSelectString(idx)}
                                            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-base transition-all active:scale-90 border ${
                                                isTuned
                                                    ? 'bg-[#05d686] text-black border-transparent shadow-[0_0_24px_rgba(5,214,134,0.7)] scale-110 ring-2 ring-white/50'
                                                    : isActive
                                                    ? 'bg-white text-black border-transparent shadow-[0_0_16px_rgba(255,255,255,0.45)] scale-105'
                                                    : 'bg-[#202228] text-[#8e909a] border-white/[0.04] hover:bg-[#282a32] hover:text-white'
                                            }`}
                                        >
                                            {str.note}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Center / Right: Realistic Fender Stratocaster Headstock with 3D Peg Highlight */}
                            <div className="relative flex-1 max-w-[240px] sm:max-w-[270px] ml-auto select-none pointer-events-none flex flex-col justify-end">
                                <div className="relative w-full">
                                    <img
                                        src="/images/guitar-headstock.jpg"
                                        alt="Guitar Headstock"
                                        className="w-full h-auto max-h-[380px] sm:max-h-[420px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.95)]"
                                        draggable={false}
                                    />

                                    {/* 3D Highlighted Peg Knob over active tuning peg */}
                                    {currentStrings.map((str, idx) => {
                                        const coord = PEG_COORDINATES[idx];
                                        if (!coord) return null;
                                        const isActive = activeStringIndex === idx;
                                        const isTuned = isActive && isLockedInTune;

                                        if (!isActive && !isTuned) return null;

                                        return (
                                            <div
                                                key={`peg-${str.label}`}
                                                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                                style={{ top: coord.top, left: coord.left }}
                                            >
                                                <div className={`w-5 h-7 rounded-[4px] border transition-all duration-200 transform -rotate-[16deg] ${
                                                    isTuned
                                                        ? 'bg-[#05d686] border-white shadow-[0_0_24px_#05d686,0_0_10px_#fff] scale-125'
                                                        : 'bg-gradient-to-br from-white via-[#f0f0f4] to-[#d0d0d8] border-white/90 shadow-[0_3px_10px_rgba(0,0,0,0.8),0_0_14px_rgba(255,255,255,0.7)] scale-110'
                                                }`} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════ SONGS TAB VIEW ═══════════════════ */}
                {activeTab === 'songs' && (
                    <div className="flex-1 flex flex-col px-4 pt-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black text-white">Songs</h2>
                            <BackButton fallback="/worship" className="text-white/60 hover:text-white" />
                        </div>
                        <div className="relative mb-4">
                            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search for worship songs or artists..."
                                className="w-full bg-[#1e1f26] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#05d686]"
                            />
                        </div>
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#05d686]/20 to-transparent border border-[#05d686]/30 mb-4 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-sm text-white">All Worship Songs Library</div>
                                <div className="text-xs text-white/50 mt-0.5">Offline chords, lyrics & transpose</div>
                            </div>
                            <Link href="/worship" className="px-4 py-2 rounded-xl bg-[#05d686] text-black font-bold text-xs">
                                Open
                            </Link>
                        </div>
                    </div>
                )}

                {/* ═══════════════════ LEARN TAB VIEW ═══════════════════ */}
                {activeTab === 'learn' && (
                    <div className="flex-1 flex flex-col px-4 pt-4 overflow-y-auto space-y-4">
                        <h2 className="text-2xl font-black text-white">Learn</h2>
                        <div className="grid grid-cols-3 gap-2">
                            <button className="p-3 rounded-2xl bg-[#1e1f26] border border-white/10 text-center">
                                <Music2 className="w-5 h-5 mx-auto text-[#05d686] mb-1" />
                                <span className="text-xs font-bold">Songs</span>
                            </button>
                            <button className="p-3 rounded-2xl bg-[#1e1f26] border border-white/10 text-center">
                                <BookOpen className="w-5 h-5 mx-auto text-amber-400 mb-1" />
                                <span className="text-xs font-bold">Courses</span>
                            </button>
                            <button className="p-3 rounded-2xl bg-[#1e1f26] border border-white/10 text-center">
                                <Sparkles className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                                <span className="text-xs font-bold">Riffs</span>
                            </button>
                        </div>
                        <div className="p-5 rounded-3xl bg-[#181920] border border-white/10 space-y-3">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Within Reach</span>
                            <h3 className="text-base font-black text-white">Essential Chords: C, D, G, Em</h3>
                            <p className="text-xs text-white/50">Core praise & worship acoustic chord progressions for church ministry.</p>
                            <Link href="/worship" className="block text-center w-full py-3 rounded-full bg-[#05d686] text-black font-bold text-xs uppercase tracking-wider">
                                Start Learning
                            </Link>
                        </div>
                    </div>
                )}

                {/* ═══════════════════ TOOLS TAB VIEW ═══════════════════ */}
                {activeTab === 'tools' && (
                    <div className="flex-1 flex flex-col px-4 pt-4 overflow-y-auto space-y-4">
                        <h2 className="text-2xl font-black text-white">Tools</h2>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => { setShowPresetPicker(true); }}
                                className="w-full p-4 rounded-2xl bg-[#1e1f26] border border-white/10 flex items-center justify-between text-left active:scale-[0.99] transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <Sliders className="w-5 h-5 text-[#05d686]" />
                                    <div>
                                        <div className="text-sm font-bold text-white">Alternate Tunings</div>
                                        <div className="text-xs text-white/40">Drop D, Half Step Down, Open D, DADGAD</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/40" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowSettingsModal(true)}
                                className="w-full p-4 rounded-2xl bg-[#1e1f26] border border-white/10 flex items-center justify-between text-left active:scale-[0.99] transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <Settings className="w-5 h-5 text-amber-400" />
                                    <div>
                                        <div className="text-sm font-bold text-white">A4 Pitch Calibration</div>
                                        <div className="text-xs text-white/40">Current: {a4Frequency} Hz (Standard: 440 Hz)</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/40" />
                            </button>

                            <Link
                                href="/tools/pad"
                                className="w-full p-4 rounded-2xl bg-[#1e1f26] border border-white/10 flex items-center justify-between text-left active:scale-[0.99] transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <Radio className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <div className="text-sm font-bold text-white">Ambient Pad Player</div>
                                        <div className="text-xs text-white/40">Continuous prayer & sermon background pads</div>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-white/40" />
                            </Link>
                        </div>
                    </div>
                )}

                {/* ═══════════════════ PROFILE TAB VIEW ═══════════════════ */}
                {activeTab === 'profile' && (
                    <div className="flex-1 flex flex-col px-4 pt-4 overflow-y-auto space-y-4">
                        <h2 className="text-2xl font-black text-white">Settings</h2>
                        <div className="p-5 rounded-3xl bg-[#181920] border border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-bold text-white">In-Tune Sound FX</div>
                                    <div className="text-xs text-white/40">Signature GuitarTuna chime when tuned</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSoundFxEnabled(!soundFxEnabled)}
                                    className={`w-11 h-6 rounded-full transition-colors p-0.5 ${soundFxEnabled ? 'bg-[#05d686]' : 'bg-white/10'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${soundFxEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                <div>
                                    <div className="text-sm font-bold text-white">A4 Reference</div>
                                    <div className="text-xs text-white/40">{a4Frequency} Hz</div>
                                </div>
                                <button
                                    onClick={() => setShowSettingsModal(true)}
                                    className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-bold"
                                >
                                    Adjust
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════ BOTTOM NAVIGATION BAR (Exact GuitarTuna Match) ═══════════════════ */}
                <footer className="relative z-40 bg-[#16171c] border-t border-white/[0.06] px-3 py-2 flex items-center justify-between">
                    {/* 1. Songs */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('songs')}
                        className={`flex flex-col items-center gap-1 transition-colors relative py-1 px-2.5 ${
                            activeTab === 'songs' ? 'text-[#05d686]' : 'text-white/40 hover:text-white'
                        }`}
                    >
                        <div className="relative">
                            <Music2 className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ff5544]" />
                        </div>
                        <span className="text-[10px] font-medium">Songs</span>
                    </button>

                    {/* 2. Learn */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('learn')}
                        className={`flex flex-col items-center gap-1 transition-colors relative py-1 px-2.5 ${
                            activeTab === 'learn' ? 'text-[#05d686]' : 'text-white/40 hover:text-white'
                        }`}
                    >
                        <div className="relative">
                            <Lightbulb className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#ffaa00]" />
                        </div>
                        <span className="text-[10px] font-medium">Learn</span>
                    </button>

                    {/* 3. Tune (Active) */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('tune')}
                        className={`flex flex-col items-center gap-1 transition-colors py-1 px-2.5 ${
                            activeTab === 'tune' ? 'text-[#05d686]' : 'text-white/40 hover:text-white'
                        }`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            activeTab === 'tune' ? 'bg-[#05d686]/15' : ''
                        }`}>
                            <Radio className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold">Tune</span>
                    </button>

                    {/* 4. Tools */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('tools')}
                        className={`flex flex-col items-center gap-1 transition-colors py-1 px-2.5 ${
                            activeTab === 'tools' ? 'text-[#05d686]' : 'text-white/40 hover:text-white'
                        }`}
                    >
                        <Sliders className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Tools</span>
                    </button>

                    {/* 5. Sound FX Toggle */}
                    <button
                        type="button"
                        onClick={() => setSoundFxEnabled(!soundFxEnabled)}
                        className="flex flex-col items-center gap-1 text-white/40 hover:text-white transition-colors py-1 px-2.5"
                    >
                        {soundFxEnabled ? <Volume2 className="w-5 h-5 text-white/80" /> : <VolumeX className="w-5 h-5 text-white/30" />}
                        <span className="text-[10px] font-medium">Sound</span>
                    </button>

                    {/* 6. Settings */}
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`flex flex-col items-center gap-1 transition-colors py-1 px-2.5 ${
                            activeTab === 'profile' ? 'text-[#05d686]' : 'text-white/40 hover:text-white'
                        }`}
                    >
                        <User className="w-5 h-5" />
                        <span className="text-[10px] font-medium">Profile</span>
                    </button>
                </footer>

                {/* ═══════════════════ INITIAL START MODAL ═══════════════════ */}
                {!hasStarted && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md px-6">
                        <div className="max-w-sm w-full bg-[#1b1c22] border border-white/10 rounded-3xl p-7 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
                            <div className="w-20 h-20 rounded-full bg-[#05d686]/15 border-2 border-[#05d686] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(5,214,134,0.3)]">
                                <Mic className="w-9 h-9 text-[#05d686]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white">Guitar Tuner</h2>
                                <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
                                    Professional grade tuning engine. Tap to start tuning your guitar.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleStartTuner}
                                className="w-full py-3.5 rounded-full bg-[#05d686] hover:bg-[#04bd75] text-black font-black text-sm tracking-wider uppercase shadow-xl shadow-[#05d686]/30 active:scale-95 transition-all"
                            >
                                Start Tuning
                            </button>
                        </div>
                    </div>
                )}

                {/* ─── Mic Permission Error Notice ─── */}
                {micError && (
                    <div className="fixed top-16 left-4 right-4 z-50">
                        <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold text-center backdrop-blur-xl shadow-xl">
                            {micError}
                        </div>
                    </div>
                )}

                {/* ═══════════════════ PRESET PICKER MODAL ═══════════════════ */}
                {showPresetPicker && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center">
                        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPresetPicker(false)} />
                        <div className="relative w-full max-w-md bg-[#181920] border-t border-white/10 rounded-t-3xl overflow-hidden shadow-2xl max-h-[75vh] flex flex-col animate-in slide-in-from-bottom-5">
                            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
                                <h3 className="text-sm font-black text-white">Tuning Presets</h3>
                                <button onClick={() => setShowPresetPicker(false)} className="p-1.5 rounded-full bg-white/5 text-white/50 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-3 space-y-1 overflow-y-auto">
                                {TUNING_PRESETS_INFO.map(preset => (
                                    <button
                                        key={preset.id}
                                        type="button"
                                        onClick={() => {
                                            setActivePreset(preset.id);
                                            setShowPresetPicker(false);
                                            setActiveStringIndex(0);
                                            activeStringIndexRef.current = 0;
                                            recentFreqsRef.current = [];
                                        }}
                                        className={`w-full px-4 py-3 rounded-2xl text-left transition-all flex items-center justify-between ${
                                            activePreset === preset.id
                                                ? 'bg-[#05d686]/15 border border-[#05d686]/30 text-[#05d686]'
                                                : 'text-white/70 hover:bg-white/5'
                                        }`}
                                    >
                                        <div>
                                            <div className="font-bold text-sm text-white">{preset.name}</div>
                                            <div className="text-[11px] text-white/40 mt-0.5">{preset.description}</div>
                                        </div>
                                        {activePreset === preset.id && (
                                            <CheckCircle2 className="w-5 h-5 text-[#05d686] shrink-0 ml-2" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════════ SETTINGS MODAL ═══════════════════ */}
                {showSettingsModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSettingsModal(false)} />
                        <div className="relative w-full max-w-sm bg-[#181920] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <h3 className="text-sm font-black text-white flex items-center gap-2">
                                    <Settings className="w-4 h-4 text-[#05d686]" />
                                    Tuner Settings
                                </h3>
                                <button onClick={() => setShowSettingsModal(false)} className="p-1.5 rounded-full bg-white/5 text-white/50 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* A4 Calibration */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center justify-between">
                                    <span>A4 Reference Pitch</span>
                                    <span className="text-[#05d686] font-mono font-bold">{a4Frequency} Hz</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[432, 440, 442].map(freq => (
                                        <button
                                            key={freq}
                                            type="button"
                                            onClick={() => setA4Frequency(freq)}
                                            className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                                a4Frequency === freq
                                                    ? 'bg-[#05d686] text-black border-[#05d686] font-black'
                                                    : 'bg-white/5 border-white/[0.08] text-white/70 hover:text-white'
                                            }`}
                                        >
                                            {freq} Hz
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sound FX Toggle */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                                <div>
                                    <div className="text-xs font-bold text-white">In-Tune "TANG" Chime</div>
                                    <div className="text-[10px] text-white/40">Play audio chime when string is tuned</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSoundFxEnabled(!soundFxEnabled)}
                                    className={`w-11 h-6 rounded-full transition-colors p-0.5 ${soundFxEnabled ? 'bg-[#05d686]' : 'bg-white/10'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${soundFxEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowSettingsModal(false)}
                                className="w-full py-2.5 rounded-xl bg-[#05d686]/15 hover:bg-[#05d686]/25 text-[#05d686] text-xs font-bold transition-colors border border-[#05d686]/30"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}