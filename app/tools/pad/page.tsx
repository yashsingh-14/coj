'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    Volume2,
    Settings2,
    X,
    Music4,
    Play,
    Pause,
    Drum,
    Sliders,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Plus,
    Minus
} from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import {
    PadSynth,
    PAD_NOTES,
    PAD_PRESET_LABELS,
    RHYTHM_STYLE_LABELS,
    type PadPreset,
    type RhythmStyle,
} from '@/lib/padSynth';

const PRESETS: PadPreset[] = ['celestialWarmth', 'deepVelvet', 'cathedralOrgan', 'cinematicShimmer'];
const RHYTHMS: RhythmStyle[] = ['shaker', 'groove', 'click', 'off'];

export default function PadPage() {
    const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
    const [preset, setPreset] = useState<PadPreset>('celestialWarmth');
    const [showPresets, setShowPresets] = useState(false);
    const [showVolume, setShowVolume] = useState(false);
    const [showSoundEditor, setShowSoundEditor] = useState(false);
    const [showRhythmDrawer, setShowRhythmDrawer] = useState(false);

    // Audio parameters
    const [padVolume, setPadVolume] = useState(0.85);
    const [rhythmVolume, setRhythmVolume] = useState(0.80);
    const [crossfade, setCrossfade] = useState(2.5);

    // Rhythm engine state
    const [rhythmStyle, setRhythmStyle] = useState<RhythmStyle>('shaker');
    const [isRhythmPlaying, setIsRhythmPlaying] = useState(false);
    const [bpm, setBpm] = useState(72);
    const [timeSig, setTimeSig] = useState<'4/4' | '6/8'>('4/4');

    // Tap tempo helper
    const tapTimesRef = useRef<number[]>([]);

    const synthRef = useRef<PadSynth | null>(null);

    useEffect(() => {
        synthRef.current = new PadSynth();
        return () => {
            synthRef.current?.dispose();
            synthRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (synthRef.current) {
            synthRef.current.setPreset(preset);
        }
    }, [preset]);

    const handleNoteToggle = useCallback((note: string) => {
        if (!synthRef.current) return;
        if (activeNotes.has(note)) {
            synthRef.current.stopNote(note);
            setActiveNotes(prev => {
                const n = new Set(prev);
                n.delete(note);
                return n;
            });
        } else {
            // Solo mode: stop previous note, start new note with smooth crossfade
            synthRef.current.startNote(note);
            setActiveNotes(new Set([note]));
        }
    }, [activeNotes]);

    const toggleRhythmPlay = () => {
        if (!synthRef.current) return;
        if (isRhythmPlaying) {
            synthRef.current.stopRhythm();
            setIsRhythmPlaying(false);
        } else {
            synthRef.current.setRhythmStyle(rhythmStyle === 'off' ? 'shaker' : rhythmStyle);
            if (rhythmStyle === 'off') setRhythmStyle('shaker');
            synthRef.current.setBpm(bpm);
            synthRef.current.setTimeSignature(timeSig);
            synthRef.current.startRhythm();
            setIsRhythmPlaying(true);
        }
    };

    const handleRhythmStyleChange = (style: RhythmStyle) => {
        setRhythmStyle(style);
        if (!synthRef.current) return;
        synthRef.current.setRhythmStyle(style);
        if (style === 'off') {
            setIsRhythmPlaying(false);
        } else if (!isRhythmPlaying) {
            setIsRhythmPlaying(true);
        }
    };

    const handleBpmChange = (newBpm: number) => {
        const val = Math.max(45, Math.min(160, Math.round(newBpm)));
        setBpm(val);
        synthRef.current?.setBpm(val);
    };

    const handleTimeSigChange = (sig: '4/4' | '6/8') => {
        setTimeSig(sig);
        synthRef.current?.setTimeSignature(sig);
    };

    const handleTapTempo = () => {
        const now = Date.now();
        const taps = tapTimesRef.current;
        taps.push(now);

        // Keep last 4 taps within 3 seconds
        if (taps.length > 4) taps.shift();
        if (taps.length >= 2 && now - taps[0] > 3000) {
            tapTimesRef.current = [now];
            return;
        }

        if (taps.length >= 2) {
            const intervals: number[] = [];
            for (let i = 1; i < taps.length; i++) {
                intervals.push(taps[i] - taps[i - 1]);
            }
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const calculatedBpm = Math.round(60000 / avgInterval);
            if (calculatedBpm >= 45 && calculatedBpm <= 160) {
                handleBpmChange(calculatedBpm);
            }
        }
    };

    const handlePadVolumeChange = (val: number) => {
        setPadVolume(val);
        synthRef.current?.setPadVolume(val);
    };

    const handleRhythmVolumeChange = (val: number) => {
        setRhythmVolume(val);
        synthRef.current?.setRhythmVolume(val);
    };

    const handleCrossfadeChange = (val: number) => {
        setCrossfade(val);
        synthRef.current?.setCrossfadeTime(val);
    };

    const prevPreset = () => {
        const idx = PRESETS.indexOf(preset);
        setPreset(PRESETS[(idx - 1 + PRESETS.length) % PRESETS.length]);
    };

    const nextPreset = () => {
        const idx = PRESETS.indexOf(preset);
        setPreset(PRESETS[(idx + 1) % PRESETS.length]);
    };

    // Arrange in 3 rows x 4 columns
    const rows = [
        PAD_NOTES.slice(0, 4),
        PAD_NOTES.slice(4, 8),
        PAD_NOTES.slice(8, 12),
    ];

    return (
        <div className="min-h-screen bg-[#02000F] text-white select-none overflow-hidden flex flex-col relative font-sans">
            {/* Ambient Animated Background glow based on active notes */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
                {Array.from(activeNotes).map((note, i) => (
                    <div
                        key={note}
                        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] mix-blend-screen animate-pulse"
                        style={{
                            background: note.includes('#')
                                ? 'radial-gradient(circle, rgba(220,38,38,0.4) 0%, transparent 70%)'
                                : 'radial-gradient(circle, rgba(245,158,11,0.5) 0%, transparent 70%)',
                            top: `${20 + (i * 15)}%`,
                            left: `${10 + (i * 20)}%`,
                            animationDuration: '5s'
                        }}
                    />
                ))}
            </div>

            {/* Top Simple Header */}
            <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between z-40 shrink-0 relative border-b border-white/5">
                <BackButton
                    fallback="/worship"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all backdrop-blur-md"
                    iconClassName="w-4 h-4 text-amber-500"
                >
                    <span className="text-xs font-semibold tracking-wide text-white/80">Exit</span>
                </BackButton>

                <div className="flex items-center gap-2">
                    <Music4 className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-white/70 tracking-widest text-xs uppercase">
                        COJ Worship Pad & Rhythm
                    </span>
                </div>

                {/* Quick Rhythm Status Pill */}
                <button
                    onClick={() => setShowRhythmDrawer(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        isRhythmPlaying
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/20'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                    }`}
                >
                    <Drum className={`w-3.5 h-3.5 ${isRhythmPlaying ? 'animate-bounce text-amber-400' : ''}`} />
                    <span>{isRhythmPlaying ? `${bpm} BPM` : 'Rhythm'}</span>
                </button>
            </div>

            {/* Main Pad Grid */}
            <div className="flex-1 flex flex-col justify-center px-4 md:px-12 pb-36 md:pb-32 z-10 relative max-w-5xl mx-auto w-full">
                <div className="flex flex-col gap-3 h-[58vh] max-h-[500px] w-full mt-2">
                    {rows.map((row, rowIdx) => (
                        <div key={rowIdx} className="flex-1 flex gap-2.5 sm:gap-3">
                            {row.map(note => {
                                const isActive = activeNotes.has(note);
                                const isSharp = note.includes('#');

                                return (
                                    <button
                                        key={note}
                                        onPointerDown={(e) => { e.preventDefault(); handleNoteToggle(note); }}
                                        className="flex-1 rounded-xl sm:rounded-2xl md:rounded-3xl border transition-all duration-300 relative overflow-hidden group shadow-2xl active:scale-95"
                                        style={{
                                            borderColor: isActive
                                                ? isSharp ? 'rgba(239,68,68,0.8)' : 'rgba(245,158,11,0.8)'
                                                : 'rgba(255,255,255,0.05)',
                                            background: isActive
                                                ? isSharp
                                                    ? 'linear-gradient(135deg, rgba(220,38,38,0.45), rgba(153,27,27,0.15))'
                                                    : 'linear-gradient(135deg, rgba(217,119,6,0.45), rgba(146,64,15,0.15))'
                                                : 'rgba(20,20,30,0.5)',
                                            boxShadow: isActive
                                                ? isSharp
                                                    ? '0 0 40px rgba(220,38,38,0.35), inset 0 0 20px rgba(220,38,38,0.2)'
                                                    : '0 0 40px rgba(245,158,11,0.35), inset 0 0 20px rgba(245,158,11,0.2)'
                                                : '0 10px 30px rgba(0,0,0,0.5)',
                                            backdropFilter: 'blur(12px)',
                                        }}
                                    >
                                        {/* Corner Label */}
                                        <span
                                            className="absolute top-2 left-2.5 sm:top-4 sm:left-5 text-lg sm:text-2xl md:text-3xl font-black tracking-tighter transition-colors"
                                            style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.25)' }}
                                        >
                                            {note}
                                        </span>

                                        {/* Status indicator on active */}
                                        {isActive && (
                                            <span className="absolute bottom-2 right-2.5 sm:bottom-3 sm:right-4 text-[10px] font-bold uppercase tracking-wider text-amber-300/80 bg-amber-500/20 px-2 py-0.5 rounded-full">
                                                Drone On
                                            </span>
                                        )}

                                        {/* Subtle internal ring for MPC look */}
                                        <div className="absolute inset-1 sm:inset-2 border border-white/5 rounded-lg sm:rounded-xl md:rounded-2xl pointer-events-none" />

                                        {/* Hover glow */}
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.04] transition-colors duration-300" />
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Bottom Dock */}
            <div className="absolute bottom-16 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg">
                {/* Popups anchoring to dock */}
                <div className="relative w-full">
                    {/* Presets Menu Popup */}
                    {showPresets && (
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 bg-[#12121A]/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom-4">
                            <div className="px-5 py-3 border-b border-white/5 bg-white/5">
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Worship Sound Presets</span>
                            </div>
                            <div className="p-2 flex flex-col gap-1">
                                {PRESETS.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => { setPreset(p); setShowPresets(false); }}
                                        className={`w-full px-4 py-3 rounded-2xl text-left text-sm font-semibold transition-all ${
                                            preset === p ? 'bg-amber-500/20 text-amber-400' : 'text-white/60 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        {PAD_PRESET_LABELS[p]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Volume Popup */}
                    {showVolume && (
                        <div className="absolute bottom-20 right-4 w-72 bg-[#12121A]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom-4 space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Pad Drone Vol</span>
                                    <span className="text-xs font-black text-white">{Math.round(padVolume * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1.5"
                                    step="0.05"
                                    value={padVolume}
                                    onChange={(e) => handlePadVolumeChange(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                    style={{ accentColor: '#f59e0b' }}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Rhythm Beat Vol</span>
                                    <span className="text-xs font-black text-white">{Math.round(rhythmVolume * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1.5"
                                    step="0.05"
                                    value={rhythmVolume}
                                    onChange={(e) => handleRhythmVolumeChange(parseFloat(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                    style={{ accentColor: '#f59e0b' }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Dock Bar */}
                <div className="flex items-center bg-[#1A1A24]/90 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.6)] w-full overflow-hidden p-1">
                    {/* Left: Rhythm Drawer Button */}
                    <button
                        onClick={() => setShowRhythmDrawer(true)}
                        className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full transition-colors ${
                            isRhythmPlaying ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-white/10 text-white/70'
                        }`}
                        title="Rhythm & Beat Settings"
                    >
                        <Drum className="w-5 h-5 text-amber-500" />
                    </button>

                    {/* Center: Presets Navigator */}
                    <div className="flex-1 flex items-center justify-between bg-black/40 rounded-full p-1 border border-white/5 min-w-0 overflow-hidden mx-1">
                        <button onClick={prevPreset} className="p-1 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white flex-shrink-0">
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => {
                                setShowPresets(!showPresets);
                                setShowVolume(false);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-1 py-1 min-w-0 group"
                        >
                            <span className="font-bold text-xs sm:text-sm tracking-wide text-white group-hover:text-amber-400 transition-colors truncate">
                                {PAD_PRESET_LABELS[preset]}
                            </span>
                            <ChevronUp className={`w-3 h-3 flex-shrink-0 text-white/40 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                        </button>

                        <button onClick={nextPreset} className="p-1 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white flex-shrink-0">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Quick Rhythm Play/Pause Button */}
                    <button
                        onClick={toggleRhythmPlay}
                        className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                            isRhythmPlaying
                                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                        }`}
                        title={isRhythmPlaying ? 'Stop Rhythm' : 'Start Rhythm Beat'}
                    >
                        {isRhythmPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>

                    {/* Volume Button */}
                    <button
                        onClick={() => {
                            setShowVolume(!showVolume);
                            setShowPresets(false);
                        }}
                        className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                            showVolume ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-white/70'
                        }`}
                        title="Volume Controls"
                    >
                        <Volume2 className="w-4 h-4 text-amber-500" />
                    </button>

                    {/* Settings Button */}
                    <button
                        onClick={() => setShowSoundEditor(true)}
                        className="flex-shrink-0 flex items-center justify-center w-10 h-10 hover:bg-white/10 transition-colors rounded-full"
                        title="Sound Editor"
                    >
                        <Settings2 className="w-4 h-4 text-white/70 hover:text-white" />
                    </button>
                </div>
            </div>

            {/* Rhythm Drawer / Modal */}
            {showRhythmDrawer && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowRhythmDrawer(false)} />

                    <div className="relative w-full max-w-md bg-[#12121A]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 space-y-5">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center gap-2">
                                <Drum className="w-5 h-5 text-amber-500" />
                                <h3 className="text-base font-black tracking-wide text-white">WORSHIP RHYTHM & BEAT</h3>
                            </div>
                            <button onClick={() => setShowRhythmDrawer(false)} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Rhythm Style selector */}
                        <div className="space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Rhythm Pattern</span>
                            <div className="grid grid-cols-2 gap-2">
                                {RHYTHMS.map(st => (
                                    <button
                                        key={st}
                                        onClick={() => handleRhythmStyleChange(st)}
                                        className={`p-2.5 rounded-xl text-left border transition-all ${
                                            rhythmStyle === st
                                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                                                : 'bg-white/5 border-white/5 text-white/60 hover:text-white'
                                        }`}
                                    >
                                        <div className="text-xs font-bold">{RHYTHM_STYLE_LABELS[st]}</div>
                                        <div className="text-[10px] text-white/40">
                                            {st === 'shaker' && 'Acoustic egg shaker'}
                                            {st === 'groove' && 'Shaker + Soft kick'}
                                            {st === 'click' && 'Woodblock side-stick'}
                                            {st === 'off' && 'Ambient pad only'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* BPM & Time Signature */}
                        <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-2xl font-black text-amber-400 font-mono leading-none">
                                        {bpm} <span className="text-xs font-sans text-white/40 font-normal">BPM</span>
                                    </div>
                                    <div className="text-[11px] text-white/50 mt-1">Tempo</div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => handleBpmChange(bpm - 1)}
                                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleBpmChange(bpm + 1)}
                                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={handleTapTempo}
                                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/30 active:scale-95 transition-all"
                                    >
                                        TAP
                                    </button>
                                </div>
                            </div>

                            <input
                                type="range"
                                min="45"
                                max="160"
                                value={bpm}
                                onChange={(e) => handleBpmChange(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                style={{ accentColor: '#f59e0b' }}
                            />

                            {/* Time Signature */}
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <span className="text-xs font-bold text-white/60">Time Signature</span>
                                <div className="flex gap-1.5">
                                    {(['4/4', '6/8'] as const).map(sig => (
                                        <button
                                            key={sig}
                                            onClick={() => handleTimeSigChange(sig)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                                                timeSig === sig
                                                    ? 'bg-amber-500 text-black border-amber-500'
                                                    : 'bg-white/5 border-white/10 text-white/60'
                                            }`}
                                        >
                                            {sig}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Start/Stop Rhythm Button */}
                        <button
                            onClick={toggleRhythmPlay}
                            className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                                isRhythmPlaying
                                    ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                                    : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                            }`}
                        >
                            {isRhythmPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                            <span>{isRhythmPlaying ? 'Stop Rhythm' : 'Start Rhythm Beat'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Sound Editor Modal */}
            {showSoundEditor && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSoundEditor(false)} />

                    <div className="relative w-full max-w-sm bg-[#12121A]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h3 className="text-base font-black tracking-wide text-white">DRONE PARAMETERS</h3>
                            <button onClick={() => setShowSoundEditor(false)} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Crossfade Slider */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">Crossfade Fade</span>
                                <span className="text-xs font-black text-white">{crossfade.toFixed(1)} s</span>
                            </div>
                            <input
                                type="range"
                                min="0.5"
                                max="5.0"
                                step="0.1"
                                value={crossfade}
                                onChange={(e) => handleCrossfadeChange(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                style={{ accentColor: '#f59e0b' }}
                            />
                            <p className="text-[11px] text-white/40">Smooth transition time when switching between keys.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
