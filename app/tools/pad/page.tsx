'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Volume2,
    VolumeX,
    X,
    Music4,
    Play,
    Pause,
    Radio,
    Clock,
    Link as LinkIcon,
    Sparkles,
    Check,
    RotateCcw,
    ExternalLink,
    Disc3,
    Activity,
    Sliders,
    Layers,
    Share2,
    Headphones,
    AlertCircle
} from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { supabase } from '@/lib/supabaseClient';
import {
    DEFAULT_WORSHIP_STREAMS,
    WorshipStreamItem,
    parseYouTubeVideoId
} from '@/lib/worshipStreams';

const PAD_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Key frequencies for warm, non-crackling church drones
const KEY_FREQS: Record<string, { sub: number; root: number; fifth: number }> = {
    'C':  { sub: 65.41,  root: 130.81, fifth: 196.00 },
    'C#': { sub: 69.30,  root: 138.59, fifth: 207.65 },
    'D':  { sub: 73.42,  root: 146.83, fifth: 220.00 },
    'D#': { sub: 77.78,  root: 155.56, fifth: 233.08 },
    'E':  { sub: 82.41,  root: 164.81, fifth: 246.94 },
    'F':  { sub: 87.31,  root: 174.61, fifth: 261.63 },
    'F#': { sub: 92.50,  root: 185.00, fifth: 277.18 },
    'G':  { sub: 98.00,  root: 196.00, fifth: 293.66 },
    'G#': { sub: 103.83, root: 207.65, fifth: 311.13 },
    'A':  { sub: 110.00, root: 220.00, fifth: 329.63 },
    'A#': { sub: 116.54, root: 233.08, fifth: 349.23 },
    'B':  { sub: 123.47, root: 246.94, fifth: 369.99 },
};

export default function PadPage() {
    // Mode switcher: 'sermonStream' | 'keyDrone'
    const [activeMode, setActiveMode] = useState<'sermonStream' | 'keyDrone'>('sermonStream');

    // Streams list (synced with Supabase site_settings)
    const [streams, setStreams] = useState<WorshipStreamItem[]>(DEFAULT_WORSHIP_STREAMS);
    const [selectedStream, setSelectedStream] = useState<WorshipStreamItem>(DEFAULT_WORSHIP_STREAMS[0]);
    const [isPlayingStream, setIsPlayingStream] = useState(false);
    const [activeYoutubeId, setActiveYoutubeId] = useState<string>(DEFAULT_WORSHIP_STREAMS[0].youtubeId);
    const [customUrlInput, setCustomUrlInput] = useState('');
    const [customInputError, setCustomInputError] = useState<string | null>(null);

    // Timer state
    const [timerMinutes, setTimerMinutes] = useState<number | null>(null);
    const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
    const [showTimerModal, setShowTimerModal] = useState(false);

    // Drone state
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [droneOctave, setDroneOctave] = useState<'sub' | 'normal' | 'high'>('normal');
    const [droneVolume, setDroneVolume] = useState(0.60);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const activeNodesRef = useRef<{ oscs: OscillatorNode[]; gain: GainNode } | null>(null);

    // 1. Fetch live synced streams from Supabase
    useEffect(() => {
        let isMounted = true;
        const fetchRemoteStreams = async () => {
            try {
                const { data } = await supabase
                    .from('site_settings')
                    .select('value')
                    .eq('key', 'worship_background_music')
                    .maybeSingle();

                if (isMounted && data?.value && Array.isArray(data.value) && data.value.length > 0) {
                    const activeOnly = data.value.filter((s: WorshipStreamItem) => s.isActive !== false);
                    if (activeOnly.length > 0) {
                        setStreams(activeOnly);
                        setSelectedStream(activeOnly[0]);
                        setActiveYoutubeId(activeOnly[0].youtubeId);
                    }
                }
            } catch (err) {
                console.error('Failed to load custom worship streams:', err);
            }
        };

        fetchRemoteStreams();
        return () => { isMounted = false; };
    }, []);

    // 2. Timer countdown
    useEffect(() => {
        if (!timerRemaining || !isPlayingStream) return;
        const interval = setInterval(() => {
            setTimerRemaining(prev => {
                if (!prev || prev <= 1) {
                    setIsPlayingStream(false);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timerRemaining, isPlayingStream]);

    // Format timer seconds
    const formatTimeRemaining = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    // Handle stream selection
    const handleSelectStream = (stream: WorshipStreamItem) => {
        setSelectedStream(stream);
        setActiveYoutubeId(stream.youtubeId);
        setIsPlayingStream(true);
    };

    // Handle custom YouTube input
    const handleAddCustomStream = (e: React.FormEvent) => {
        e.preventDefault();
        setCustomInputError(null);

        const extracted = parseYouTubeVideoId(customUrlInput.trim());
        if (!extracted) {
            setCustomInputError('Invalid YouTube link. Please paste a valid YouTube watch or share URL.');
            return;
        }

        const customItem: WorshipStreamItem = {
            id: 'custom-' + Date.now(),
            title: 'Custom YouTube Worship Stream',
            description: 'Custom background worship stream provided by user.',
            youtubeId: extracted,
            duration: 'Continuous',
            mood: 'Custom Stream',
            isActive: true
        };

        setSelectedStream(customItem);
        setActiveYoutubeId(extracted);
        setIsPlayingStream(true);
        setCustomUrlInput('');
    };

    // Web Audio Key Drone (Crack-free warm church drone)
    const stopKeyDrone = useCallback(() => {
        if (activeNodesRef.current && audioCtxRef.current) {
            const now = audioCtxRef.current.currentTime;
            const { oscs, gain } = activeNodesRef.current;
            gain.gain.setTargetAtTime(0.0001, now, 0.4);
            setTimeout(() => {
                oscs.forEach(o => {
                    try { o.stop(); o.disconnect(); } catch { }
                });
            }, 600);
            activeNodesRef.current = null;
        }
        setActiveKey(null);
    }, []);

    const startKeyDrone = useCallback((key: string, octave: 'sub' | 'normal' | 'high' = droneOctave) => {
        if (activeKey === key && droneOctave === octave) {
            stopKeyDrone();
            return;
        }

        stopKeyDrone();

        try {
            if (!audioCtxRef.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                audioCtxRef.current = new AudioCtx({ latencyHint: 'playback' });
            }

            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const now = ctx.currentTime;
            const baseFreqs = KEY_FREQS[key] || KEY_FREQS['C'];

            const multiplier = octave === 'sub' ? 0.5 : octave === 'high' ? 2 : 1;
            const subFreq = baseFreqs.sub * multiplier;
            const rootFreq = baseFreqs.root * multiplier;
            const fifthFreq = baseFreqs.fifth * multiplier;

            // Master voice gain with soft fade-in
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.setTargetAtTime(droneVolume * 0.28, now, 0.5);

            // Very warm low-pass filter (cuts harsh highs, zero crackle)
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(340, now);
            filter.Q.setValueAtTime(0.7, now);

            // Sub oscillator (Sine)
            const oscSub = ctx.createOscillator();
            oscSub.type = 'sine';
            oscSub.frequency.setValueAtTime(subFreq, now);

            // Root oscillator (Warm Triangle)
            const oscRoot = ctx.createOscillator();
            oscRoot.type = 'triangle';
            oscRoot.frequency.setValueAtTime(rootFreq, now);

            // Fifth harmonic (Pure Sine)
            const oscFifth = ctx.createOscillator();
            oscFifth.type = 'sine';
            oscFifth.frequency.setValueAtTime(fifthFreq, now);

            const gSub = ctx.createGain(); gSub.gain.setValueAtTime(0.65, now);
            const gRoot = ctx.createGain(); gRoot.gain.setValueAtTime(0.35, now);
            const gFifth = ctx.createGain(); gFifth.gain.setValueAtTime(0.20, now);

            oscSub.connect(gSub).connect(filter);
            oscRoot.connect(gRoot).connect(filter);
            oscFifth.connect(gFifth).connect(filter);

            filter.connect(gain).connect(ctx.destination);

            oscSub.start(now);
            oscRoot.start(now);
            oscFifth.start(now);

            activeNodesRef.current = { oscs: [oscSub, oscRoot, oscFifth], gain };
            setActiveKey(key);
            setDroneOctave(octave);
        } catch (err) {
            console.error('Audio initialization error:', err);
        }
    }, [activeKey, droneOctave, droneVolume, stopKeyDrone]);

    // Clean up drone on unmount
    useEffect(() => {
        return () => {
            stopKeyDrone();
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                try { audioCtxRef.current.close(); } catch { }
            }
        };
    }, [stopKeyDrone]);

    return (
        <div className="min-h-screen bg-[#02000F] text-white flex flex-col font-sans selection:bg-amber-500 selection:text-black pb-28 relative">
            {/* Ambient Background Aura */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[140px]" />
            </div>

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-[#02000F]/90 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-2xl">
                <BackButton
                    fallback="/worship"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-bold text-white/80 active:scale-95"
                >
                    <span>Exit</span>
                </BackButton>

                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-white via-white/90 to-amber-400 bg-clip-text text-transparent">
                        COJ Infinity Worship Station
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Timer trigger */}
                    <button
                        onClick={() => setShowTimerModal(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                            timerRemaining
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10'
                                : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                        title="Set Sermon / Service Timer"
                    >
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">
                            {timerRemaining ? formatTimeRemaining(timerRemaining) : 'Timer'}
                        </span>
                    </button>
                </div>
            </header>

            {/* Mode Switcher Tabs */}
            <div className="relative z-10 max-w-4xl mx-auto w-full px-4 pt-4 sm:pt-6">
                <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-lg backdrop-blur-xl">
                    <button
                        onClick={() => {
                            setActiveMode('sermonStream');
                            stopKeyDrone();
                        }}
                        className={`py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-98 ${
                            activeMode === 'sermonStream'
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 font-black'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Radio className="w-4 h-4" />
                        <span>Sermon Piano & Pads</span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveMode('keyDrone');
                            setIsPlayingStream(false);
                        }}
                        className={`py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-98 ${
                            activeMode === 'keyDrone'
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/25 font-black'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Music4 className="w-4 h-4" />
                        <span>Key Drone Pads (C-B)</span>
                    </button>
                </div>
            </div>

            {/* 1. SERMON STREAM MODE */}
            {activeMode === 'sermonStream' && (
                <main className="relative z-10 max-w-4xl mx-auto w-full px-4 py-5 space-y-6">
                    {/* Stage Hero Player Card */}
                    <div className="relative rounded-3xl bg-gradient-to-br from-[#141220] via-[#0D0B16] to-[#07060D] border border-white/15 p-5 sm:p-7 shadow-2xl overflow-hidden">
                        {/* Glow halo */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider text-amber-400">
                                        {selectedStream.mood}
                                    </span>
                                    <span className="text-[11px] font-bold text-white/50">
                                        {selectedStream.duration} Continuous Loop
                                    </span>
                                    {timerRemaining && (
                                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                            Ends in: {formatTimeRemaining(timerRemaining)}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    {selectedStream.title}
                                </h2>

                                <p className="text-xs sm:text-sm text-white/50 max-w-xl leading-relaxed">
                                    {selectedStream.description}
                                </p>
                            </div>

                            {/* Main Play/Pause Button */}
                            <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                                <button
                                    onClick={() => setIsPlayingStream(!isPlayingStream)}
                                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95 ${
                                        isPlayingStream
                                            ? 'bg-amber-500 text-black shadow-amber-500/40 ring-4 ring-amber-500/20'
                                            : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                    }`}
                                    title={isPlayingStream ? 'Pause Stream' : 'Start Stream'}
                                >
                                    {isPlayingStream ? (
                                        <Pause className="w-6 h-6 fill-current" />
                                    ) : (
                                        <Play className="w-6 h-6 fill-current ml-1" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Stream Active Player Area */}
                        {isPlayingStream && activeYoutubeId && (
                            <div className="mt-5 pt-5 border-t border-white/10 space-y-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span>Playing Smoothly in Background (Sermon Loop)</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <a
                                            href={`https://www.youtube.com/watch?v=${activeYoutubeId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[11px] font-bold border border-white/5 flex items-center gap-1 transition-colors"
                                            title="If video has embed restrictions, play in YouTube App"
                                        >
                                            <ExternalLink className="w-3 h-3 text-amber-400" />
                                            <span>Open in YouTube</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Actual YouTube Player Iframe */}
                                <div className="w-full rounded-2xl overflow-hidden aspect-video max-h-52 bg-black/80 border border-white/10 shadow-inner">
                                    <iframe
                                        key={activeYoutubeId}
                                        className="w-full h-full"
                                        src={`https://www.youtube-nocookie.com/embed/${activeYoutubeId}?autoplay=1&loop=1&playlist=${activeYoutubeId}&controls=1&enablejsapi=1`}
                                        title={selectedStream.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>

                                <p className="text-[11px] text-white/40 leading-relaxed">
                                    💡 Tip: You can adjust volume using YouTube&apos;s on-screen controls. If your device screen locks, the YouTube App button lets you stream with background audio.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Curated Track Presets */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                                Curated Sermon & Ministry Presets
                            </span>
                            <span className="text-xs text-amber-400 font-bold">
                                {streams.length} Verified Selections
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {streams.map((stream) => {
                                const isCurrent = selectedStream.id === stream.id;
                                return (
                                    <div
                                        key={stream.id}
                                        onClick={() => handleSelectStream(stream)}
                                        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99] ${
                                            isCurrent
                                                ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/30'
                                                : 'bg-white/[0.03] border-white/5 text-white/70 hover:bg-white/[0.06] hover:text-white'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-amber-400 border border-white/5">
                                                    {stream.mood}
                                                </span>
                                                <span className="text-[10px] font-mono text-white/40">
                                                    {stream.duration}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-400 transition-colors">
                                                {stream.title}
                                            </h3>

                                            <p className="text-xs text-white/40 mt-1 line-clamp-2 leading-relaxed">
                                                {stream.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                                            <span className="text-[11px] font-bold text-white/50 group-hover:text-white flex items-center gap-1.5">
                                                <Play className="w-3 h-3 text-amber-400 fill-current" />
                                                <span>{isCurrent && isPlayingStream ? 'Playing Now' : 'Load Track'}</span>
                                            </span>
                                            {isCurrent && <Check className="w-4 h-4 text-amber-400" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom YouTube Stream Form */}
                    <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                        <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-amber-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
                                Add Custom YouTube Worship Stream (Any URL)
                            </h3>
                        </div>
                        <p className="text-xs text-white/40">
                            Aap apna manpasand YouTube prayer piano ya sermon instrumental link paste kar sakte hain. Wo background me continuous loop ke sath chalta rahega.
                        </p>

                        <form onSubmit={handleAddCustomStream} className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={customUrlInput}
                                onChange={(e) => {
                                    setCustomUrlInput(e.target.value);
                                    if (customInputError) setCustomInputError(null);
                                }}
                                placeholder="Paste YouTube link (e.g. https://youtube.com/watch?v=...)"
                                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50"
                            />
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all shrink-0 shadow-md shadow-amber-500/20 active:scale-95"
                            >
                                Play Stream
                            </button>
                        </form>

                        {customInputError && (
                            <p className="text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>{customInputError}</span>
                            </p>
                        )}
                    </div>
                </main>
            )}

            {/* 2. KEY DRONE PADS MODE (Nord / MPC Luxury Station) */}
            {activeMode === 'keyDrone' && (
                <main className="relative z-10 max-w-4xl mx-auto w-full px-4 py-5 space-y-6">
                    {/* Header Controls Banner */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#12101F] to-[#0A0912] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                        <div>
                            <div className="text-base font-bold text-white flex items-center gap-2">
                                <span>Warm Church Drone Pads</span>
                                {activeKey && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-black border border-amber-500/30">
                                        Key: {activeKey} ({droneOctave.toUpperCase()})
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-white/50 mt-1 max-w-lg">
                                Deep low-pass harmonic tones. Mobile speakers me bina kisi &quot;khar-khar&quot; crackle ke continuous warm church atmosphere deta hai.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap">
                            {/* Octave switcher */}
                            <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/5">
                                {(['sub', 'normal', 'high'] as const).map(oct => (
                                    <button
                                        key={oct}
                                        onClick={() => {
                                            setDroneOctave(oct);
                                            if (activeKey) startKeyDrone(activeKey, oct);
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                            droneOctave === oct
                                                ? 'bg-amber-500 text-black font-black'
                                                : 'text-white/50 hover:text-white'
                                        }`}
                                    >
                                        {oct === 'sub' ? 'Sub Bass' : oct === 'high' ? 'High Air' : 'Mid'}
                                    </button>
                                ))}
                            </div>

                            {activeKey && (
                                <button
                                    onClick={stopKeyDrone}
                                    className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/30 transition-all active:scale-95"
                                >
                                    Stop Drone
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Key Pads Grid (C to B) - Luxury MPC Style */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                        {PAD_KEYS.map((key) => {
                            const isSelected = activeKey === key;
                            const freqs = KEY_FREQS[key];

                            return (
                                <button
                                    key={key}
                                    onClick={() => startKeyDrone(key)}
                                    className={`relative p-5 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all text-center overflow-hidden group active:scale-95 flex flex-col items-center justify-center min-h-[105px] sm:min-h-[130px] ${
                                        isSelected
                                            ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-black border-amber-300 shadow-2xl shadow-amber-500/40 ring-4 ring-amber-500/20'
                                            : 'bg-gradient-to-b from-white/[0.05] to-white/[0.02] border-white/10 text-white hover:border-amber-500/40 hover:bg-white/[0.08]'
                                    }`}
                                >
                                    {/* Breathing ring pulse when active */}
                                    {isSelected && (
                                        <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none rounded-2xl" />
                                    )}

                                    <div className={`text-2xl sm:text-4xl font-black tracking-tight ${isSelected ? 'text-black' : 'text-white group-hover:text-amber-400'} transition-colors`}>
                                        {key}
                                    </div>

                                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 ${isSelected ? 'text-black/80 font-black' : 'text-white/40'}`}>
                                        {isSelected ? '● Playing' : 'Tap to Play'}
                                    </div>

                                    <div className={`text-[9px] font-mono mt-0.5 opacity-60 ${isSelected ? 'text-black/70' : 'text-white/30'}`}>
                                        {freqs ? `${Math.round(freqs.root)} Hz` : ''}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </main>
            )}

            {/* Timer Modal */}
            {showTimerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => setShowTimerModal(false)}
                    />

                    <div className="relative w-full max-w-sm bg-[#12101E] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <h3 className="text-sm font-black text-white">SERMON & SERVICE TIMER</h3>
                            </div>
                            <button
                                onClick={() => setShowTimerModal(false)}
                                className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-white/40 leading-relaxed">
                            Kitni der tak background music chalana chahte hain? Time pura hote hi music smoothly ruk jayega.
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                            {[
                                { label: '15 Minutes', mins: 15 },
                                { label: '30 Minutes', mins: 30 },
                                { label: '1 Hour', mins: 60 },
                                { label: '2 Hours (Sermon)', mins: 120 },
                                { label: '3 Hours (Service)', mins: 180 },
                                { label: 'Continuous (No Limit)', mins: null }
                            ].map((opt) => (
                                <button
                                    key={opt.label}
                                    onClick={() => {
                                        setTimerMinutes(opt.mins);
                                        setTimerRemaining(opt.mins ? opt.mins * 60 : null);
                                        setShowTimerModal(false);
                                    }}
                                    className={`p-3 rounded-xl text-left border text-xs font-bold transition-all ${
                                        timerMinutes === opt.mins
                                            ? 'bg-amber-500 text-black border-amber-500 font-black shadow-md'
                                            : 'bg-white/5 border-white/5 text-white/70 hover:text-white'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
