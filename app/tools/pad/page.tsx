'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Volume2,
    Settings2,
    X,
    Music4,
    Play,
    Pause,
    Radio,
    Clock,
    Link as LinkIcon,
    Sparkles,
    Check,
    RotateCcw
} from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { extractYoutubeId } from '@/lib/utils';

// Curated 2-3 Hour Continuous Worship Piano & Ambient Sermon Streams
interface WorshipStream {
    id: string;
    title: string;
    description: string;
    youtubeId: string;
    duration: string;
    mood: string;
}

const CURATED_WORSHIP_STREAMS: WorshipStream[] = [
    {
        id: 'sermon-piano-1',
        title: 'Peaceful Worship Piano & Strings',
        description: 'Gentle, continuous grand piano with warm ambient strings. Perfect backdrop for sermons & preaching.',
        youtubeId: 'Z8Z5v7zFjG8', // 3 hours peaceful piano for preaching & prayer
        duration: '3 Hours',
        mood: 'Sermon & Preaching'
    },
    {
        id: 'sermon-piano-2',
        title: 'Altar Call & Ministry Flow',
        description: 'Soft, emotional acoustic worship piano with swelling pads. Ideal for ministry time & prayer lines.',
        youtubeId: 'p7f7mQf5k_k', // 2 hours soaking prayer & altar call
        duration: '2 Hours',
        mood: 'Altar Call & Prayer'
    },
    {
        id: 'sermon-piano-3',
        title: 'Deep Holy Spirit Presence (Soaking)',
        description: 'Warm atmospheric pads and meditative acoustic keys. Non-intrusive, continuous soaking atmosphere.',
        youtubeId: 'L_LUpnjgPso', // Continuous soaking worship
        duration: '3 Hours',
        mood: 'Holy Spirit Presence'
    },
    {
        id: 'sermon-piano-4',
        title: 'Quiet Time & Reflection',
        description: 'Minimalist worship piano with soft church reverb. Never overpowers the speaker\'s voice.',
        youtubeId: '4xDzrJKXOOY', // Gentle church piano instrumental
        duration: '2.5 Hours',
        mood: 'Reflection & Word'
    }
];

const PAD_KEYS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Frequencies for ultra-clean, warm, non-crackling key drone
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
    // Mode: 'sermonStream' | 'keyDrone'
    const [activeMode, setActiveMode] = useState<'sermonStream' | 'keyDrone'>('sermonStream');

    // Sermon Stream State
    const [selectedStream, setSelectedStream] = useState<WorshipStream>(CURATED_WORSHIP_STREAMS[0]);
    const [isPlayingStream, setIsPlayingStream] = useState(false);
    const [customUrlInput, setCustomUrlInput] = useState('');
    const [activeYoutubeId, setActiveYoutubeId] = useState(CURATED_WORSHIP_STREAMS[0].youtubeId);
    const [streamVolume, setStreamVolume] = useState(70);
    const [timerMinutes, setTimerMinutes] = useState<number | null>(null); // null = infinite
    const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
    const [showTimerModal, setShowTimerModal] = useState(false);

    // Key Drone State (Lightweight, pure audio without crackle)
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [droneVolume, setDroneVolume] = useState(0.60);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const activeNodesRef = useRef<{ oscs: OscillatorNode[]; gain: GainNode } | null>(null);

    // Timer countdown
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

    // Handle stream selection
    const handleSelectStream = (stream: WorshipStream) => {
        setSelectedStream(stream);
        setActiveYoutubeId(stream.youtubeId);
        setIsPlayingStream(true);
    };

    // Handle custom YouTube stream input
    const handleAddCustomStream = (e: React.FormEvent) => {
        e.preventDefault();
        const extracted = extractYoutubeId(customUrlInput.trim());
        if (extracted) {
            setActiveYoutubeId(extracted);
            setSelectedStream({
                id: 'custom-' + Date.now(),
                title: 'Custom Worship Background Stream',
                description: 'User-specified YouTube prayer & sermon background track.',
                youtubeId: extracted,
                duration: 'Continuous',
                mood: 'Custom Stream'
            });
            setIsPlayingStream(true);
            setCustomUrlInput('');
        }
    };

    // Clean Key Drone Web Audio logic (Single warm low-pass sine drone with zero crackle)
    const stopKeyDrone = () => {
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
    };

    const startKeyDrone = (key: string) => {
        if (activeKey === key) {
            stopKeyDrone();
            return;
        }

        stopKeyDrone();

        try {
            if (!audioCtxRef.current) {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                audioCtxRef.current = new AudioCtx({ latencyHint: 'playback' });
            }

            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const now = ctx.currentTime;
            const freqs = KEY_FREQS[key] || KEY_FREQS['D'];

            // Master voice gain with soft fade-in
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.setTargetAtTime(droneVolume * 0.25, now, 0.5);

            // Very warm low-pass filter (cuts all harsh highs, zero crackle)
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(320, now);
            filter.Q.setValueAtTime(0.7, now);

            // Root Sub (Warm Sine)
            const oscSub = ctx.createOscillator();
            oscSub.type = 'sine';
            oscSub.frequency.setValueAtTime(freqs.sub, now);

            // Root (Warm Triangle)
            const oscRoot = ctx.createOscillator();
            oscRoot.type = 'triangle';
            oscRoot.frequency.setValueAtTime(freqs.root, now);

            // 5th Harmonic (Pure Sine)
            const oscFifth = ctx.createOscillator();
            oscFifth.type = 'sine';
            oscFifth.frequency.setValueAtTime(freqs.fifth, now);

            const gSub = ctx.createGain(); gSub.gain.setValueAtTime(0.6, now);
            const gRoot = ctx.createGain(); gRoot.gain.setValueAtTime(0.3, now);
            const gFifth = ctx.createGain(); gFifth.gain.setValueAtTime(0.2, now);

            oscSub.connect(gSub).connect(filter);
            oscRoot.connect(gRoot).connect(filter);
            oscFifth.connect(gFifth).connect(filter);

            filter.connect(gain).connect(ctx.destination);

            oscSub.start(now);
            oscRoot.start(now);
            oscFifth.start(now);

            activeNodesRef.current = { oscs: [oscSub, oscRoot, oscFifth], gain };
            setActiveKey(key);
        } catch (err) {
            console.error('Audio initialization error:', err);
        }
    };

    // Format seconds to HH:MM:SS
    const formatTimeRemaining = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white flex flex-col font-sans selection:bg-amber-500 selection:text-black pb-24">
            {/* Top Navigation */}
            <div className="sticky top-0 z-40 bg-[#02000F]/95 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xl">
                <BackButton
                    fallback="/worship"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-bold text-white/80"
                >
                    <span>Exit</span>
                </BackButton>

                <div className="flex items-center gap-2">
                    <Music4 className="w-4 h-4 text-amber-500" />
                    <span className="font-black text-xs uppercase tracking-wider text-white">
                        COJ Infinity Worship Station
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Timer Badge */}
                    <button
                        onClick={() => setShowTimerModal(true)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all ${
                            timerRemaining
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                        title="Set Sermon Timer"
                    >
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="hidden sm:inline">
                            {timerRemaining ? formatTimeRemaining(timerRemaining) : 'Continuous'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="max-w-4xl mx-auto w-full px-4 pt-4">
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10">
                    <button
                        onClick={() => {
                            setActiveMode('sermonStream');
                            stopKeyDrone();
                        }}
                        className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            activeMode === 'sermonStream'
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        <Radio className="w-4 h-4" />
                        <span>Sermon Piano & Pads (2-3 Hrs)</span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveMode('keyDrone');
                            setIsPlayingStream(false);
                        }}
                        className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            activeMode === 'keyDrone'
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        <Music4 className="w-4 h-4" />
                        <span>Key Drone Pads (C to B)</span>
                    </button>
                </div>
            </div>

            {/* 1. SERMON & PRAYER MUSIC MODE (Continuous 2-3 Hours) */}
            {activeMode === 'sermonStream' && (
                <div className="max-w-4xl mx-auto w-full px-4 py-5 space-y-5">
                    {/* Active Track Stage Card */}
                    <div className="relative rounded-3xl bg-gradient-to-br from-[#12121A] to-[#0A0A10] border border-white/10 p-5 sm:p-7 shadow-2xl overflow-hidden">
                        {/* Background Ambient Glow */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider text-amber-400">
                                        {selectedStream.mood}
                                    </span>
                                    <span className="text-[11px] font-bold text-white/40">
                                        {selectedStream.duration} Continuous Loop
                                    </span>
                                    {timerRemaining && (
                                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                            Auto-stop in: {formatTimeRemaining(timerRemaining)}
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                                    {selectedStream.title}
                                </h2>
                                <p className="text-xs text-white/50 max-w-xl mt-1 leading-relaxed">
                                    {selectedStream.description}
                                </p>
                            </div>

                            {/* Main Play/Pause Button */}
                            <button
                                onClick={() => setIsPlayingStream(!isPlayingStream)}
                                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-all active:scale-95 ${
                                    isPlayingStream
                                        ? 'bg-amber-500 text-black shadow-amber-500/30'
                                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                                }`}
                                title={isPlayingStream ? 'Pause Sermon Music' : 'Start Sermon Music'}
                            >
                                {isPlayingStream ? (
                                    <Pause className="w-6 h-6 fill-current" />
                                ) : (
                                    <Play className="w-6 h-6 fill-current ml-1" />
                                )}
                            </button>
                        </div>

                        {/* YouTube Stream Embed (Hidden Audio Player) */}
                        {isPlayingStream && activeYoutubeId && (
                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Playing Smoothly in Background (Continuous Sermon Loop)</span>
                                </div>

                                <div className="text-[11px] text-white/40 font-mono">
                                    Zero Crackle • Pure Studio Audio
                                </div>

                                {/* Actual YouTube Player iframe */}
                                <div className="w-full rounded-xl overflow-hidden aspect-video max-h-48 bg-black/60 border border-white/5 mt-2">
                                    <iframe
                                        className="w-full h-full"
                                        src={`https://www.youtube.com/embed/${activeYoutubeId}?autoplay=1&loop=1&playlist=${activeYoutubeId}&controls=1`}
                                        title="Worship Background Player"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Curated Sermon & Prayer Tracks List */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                                Curated Sermon & Ministry Presets (Copyright-Free)
                            </span>
                            <span className="text-[11px] text-amber-400 font-bold">
                                4 Studio Selections
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {CURATED_WORSHIP_STREAMS.map((stream) => {
                                const isCurrent = selectedStream.id === stream.id;
                                return (
                                    <div
                                        key={stream.id}
                                        onClick={() => handleSelectStream(stream)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.99] ${
                                            isCurrent
                                                ? 'bg-amber-500/10 border-amber-500/40 text-white shadow-lg shadow-amber-500/10'
                                                : 'bg-white/[0.03] border-white/5 text-white/70 hover:bg-white/[0.06] hover:text-white'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-amber-400 border border-white/5">
                                                    {stream.mood}
                                                </span>
                                                <span className="text-[10px] font-mono text-white/40">
                                                    {stream.duration}
                                                </span>
                                            </div>
                                            <div className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                                                {stream.title}
                                            </div>
                                            <p className="text-xs text-white/40 mt-1 line-clamp-2 leading-relaxed">
                                                {stream.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
                                            <span className="text-[11px] font-bold text-white/50 group-hover:text-white flex items-center gap-1">
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
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                        <div className="flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-amber-400" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-white/80">
                                Add Custom YouTube Worship Stream (Any Sermon Background URL)
                            </h3>
                        </div>
                        <p className="text-xs text-white/40">
                            Aap apna manpasand YouTube prayer piano ya sermon instrumental link yahan paste kar sakte hain. Wo 2-3 ghante seamlessly chalta rahega.
                        </p>

                        <form onSubmit={handleAddCustomStream} className="flex gap-2">
                            <input
                                type="text"
                                value={customUrlInput}
                                onChange={(e) => setCustomUrlInput(e.target.value)}
                                placeholder="Paste YouTube link (e.g. https://youtube.com/watch?v=...)"
                                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all shrink-0 shadow-md shadow-amber-500/20"
                            >
                                Play Stream
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* 2. KEY DRONE PADS MODE (Clean, warm, non-crackling church drones) */}
            {activeMode === 'keyDrone' && (
                <div className="max-w-4xl mx-auto w-full px-4 py-5 space-y-5">
                    {/* Header Banner */}
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                        <div>
                            <div className="text-sm font-bold text-white flex items-center gap-2">
                                <span>Warm Church Drone Pads</span>
                                {activeKey && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                                        Playing Key: {activeKey}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-white/40 mt-0.5">
                                Soft, warm, low-pass church drone. Mobile speakers me bina kisi &quot;khar khar&quot; crackle ke smoothly chalta hai.
                            </p>
                        </div>

                        {activeKey && (
                            <button
                                onClick={stopKeyDrone}
                                className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold border border-red-500/30 transition-all"
                            >
                                Stop Drone
                            </button>
                        )}
                    </div>

                    {/* Key Pads Grid (C to B) */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {PAD_KEYS.map((key) => {
                            const isSelected = activeKey === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => startKeyDrone(key)}
                                    className={`p-6 sm:p-8 rounded-2xl border transition-all text-center relative overflow-hidden group active:scale-95 ${
                                        isSelected
                                            ? 'bg-amber-500 text-black border-amber-500 shadow-xl shadow-amber-500/30'
                                            : 'bg-white/[0.04] border-white/5 text-white hover:bg-white/[0.08] hover:border-white/10'
                                    }`}
                                >
                                    <div className="text-2xl sm:text-3xl font-black tracking-tight">
                                        {key}
                                    </div>
                                    <div className={`text-[10px] font-bold uppercase mt-1 ${isSelected ? 'text-black/70' : 'text-white/40'}`}>
                                        {isSelected ? 'Drone Active' : 'Tap to Play'}
                                    </div>

                                    {isSelected && (
                                        <div className="absolute inset-0 border-2 border-black/20 rounded-2xl pointer-events-none" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Timer Modal */}
            {showTimerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowTimerModal(false)} />

                    <div className="relative w-full max-w-sm bg-[#12121A] border border-white/10 rounded-3xl p-5 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-amber-500" />
                                <h3 className="text-sm font-black text-white">SERMON & PRAYER TIMER</h3>
                            </div>
                            <button onClick={() => setShowTimerModal(false)} className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/50">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-xs text-white/40 leading-relaxed">
                            Kitni der tak background music chalana chahte hain? Time khatam hote hi music automatically stop ho jayega.
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                            {[
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
                                            ? 'bg-amber-500 text-black border-amber-500'
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
