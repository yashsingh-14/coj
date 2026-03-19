'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronUp, ChevronLeft, ChevronRight, Volume2, Settings2, X, Music4 } from 'lucide-react';
import {
    PadSynth,
    PAD_NOTES,
    PAD_PRESET_LABELS,
    type PadPreset,
} from '@/lib/padSynth';

const PRESETS: PadPreset[] = ['atmospheric', 'epicSaw', 'lushPad', 'organ', 'stringPad'];

export default function PadPage() {
    const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
    const [preset, setPreset] = useState<PadPreset>('atmospheric');
    const [showPresets, setShowPresets] = useState(false);
    const [showVolume, setShowVolume] = useState(false);
    const [showSoundEditor, setShowSoundEditor] = useState(false);
    const [crossfade, setCrossfade] = useState(2.0);
    const [highpass, setHighpass] = useState(21);
    const [lowpass, setLowpass] = useState(756);
    const [volume, setVolume] = useState(1.0);
    const [polyphony, setPolyphony] = useState<'poly' | 'mono'>('poly');
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
            synthRef.current.stopAll();
            setActiveNotes(new Set());
            synthRef.current.setPreset(preset);
        }
    }, [preset]);

    const handleNoteToggle = useCallback((note: string) => {
        if (!synthRef.current) return;
        if (activeNotes.has(note)) {
            synthRef.current.stopNote(note);
            setActiveNotes(prev => { const n = new Set(prev); n.delete(note); return n; });
        } else {
            synthRef.current.startNote(note);
            setActiveNotes(prev => new Set(prev).add(note));
        }
    }, [activeNotes]);

    const handleCrossfadeChange = (val: number) => {
        setCrossfade(val);
        synthRef.current?.setCrossfadeTime(val);
    };

    const handleHighpassChange = (val: number) => {
        setHighpass(val);
        synthRef.current?.setHighpass(val);
    };

    const handleLowpassChange = (val: number) => {
        setLowpass(val);
        synthRef.current?.setLowpass(val);
    };

    const handleVolumeChange = (val: number) => {
        setVolume(val);
        synthRef.current?.setMasterVolume(val);
    };

    const togglePolyphony = () => {
        const next = polyphony === 'poly' ? 'mono' : 'poly';
        setPolyphony(next);
        synthRef.current?.setPolyphonyMode(next);
        if (next === 'mono' && activeNotes.size > 1) {
            setActiveNotes(new Set());
            synthRef.current?.stopAll();
        }
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
                            background: note.includes('#') ? 'radial-gradient(circle, rgba(220,38,38,0.4) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(217,119,6,0.5) 0%, transparent 70%)',
                            top: `${20 + (i * 15)}%`,
                            left: `${10 + (i * 20)}%`,
                            animationDuration: '4s'
                        }}
                    />
                ))}
            </div>

            {/* Top Simple Header */}
            <div className="px-6 py-4 flex items-center justify-between z-40 shrink-0 relative">
                <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all backdrop-blur-md">
                    <ArrowLeft className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-semibold tracking-wide text-white/80">Exit Pad</span>
                </Link>
                <div className="flex items-center gap-2">
                    <Music4 className="w-5 h-5 text-amber-500/50" />
                    <span className="font-bold text-white/30 tracking-widest text-xs uppercase">COJ Infinity</span>
                </div>
            </div>

            {/* Main Pad Grid */}
            <div className="flex-1 flex flex-col justify-center px-4 md:px-12 pb-32 z-10 relative max-w-5xl mx-auto w-full">
                <div className="flex flex-col gap-3 h-[65vh] w-full">
                    {rows.map((row, rowIdx) => (
                        <div key={rowIdx} className="flex-1 flex gap-3">
                            {row.map(note => {
                                const isActive = activeNotes.has(note);
                                const isSharp = note.includes('#');

                                return (
                                    <button
                                        key={note}
                                        onPointerDown={(e) => { e.preventDefault(); handleNoteToggle(note); }}
                                        className="flex-1 rounded-2xl md:rounded-3xl border transition-all duration-300 relative overflow-hidden group shadow-2xl"
                                        style={{
                                            borderColor: isActive 
                                                ? isSharp ? 'rgba(239,68,68,0.8)' : 'rgba(245,158,11,0.8)' 
                                                : 'rgba(255,255,255,0.05)',
                                            background: isActive
                                                ? isSharp 
                                                    ? 'linear-gradient(135deg, rgba(220,38,38,0.4), rgba(153,27,27,0.1))'
                                                    : 'linear-gradient(135deg, rgba(217,119,6,0.4), rgba(146,64,15,0.1))'
                                                : 'rgba(20,20,30,0.5)',
                                            boxShadow: isActive
                                                ? isSharp 
                                                    ? '0 0 40px rgba(220,38,38,0.3), inset 0 0 20px rgba(220,38,38,0.2)'
                                                    : '0 0 40px rgba(245,158,11,0.3), inset 0 0 20px rgba(245,158,11,0.2)'
                                                : '0 10px 30px rgba(0,0,0,0.5)',
                                            backdropFilter: 'blur(12px)',
                                        }}
                                    >
                                        {/* Corner Label */}
                                        <span className="absolute top-4 left-5 text-xl md:text-2xl font-black tracking-tighter transition-colors"
                                            style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.2)' }}>
                                            {note}
                                        </span>

                                        {/* Subtle internal ring for MPC look */}
                                        <div className="absolute inset-2 border border-white/5 rounded-xl md:rounded-2xl pointer-events-none" />
                                        
                                        {/* Hover glow */}
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.03] transition-colors duration-300" />
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Floating Bottom Dock */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl px-2">
                
                {/* Popups anchoring to dock */}
                <div className="relative w-full">
                    {/* Presets Menu Popup */}
                    {showPresets && (
                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 bg-[#12121A]/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom-4">
                            <div className="px-5 py-3 border-b border-white/5 bg-white/5">
                                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Sound Library</span>
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
                        <div className="absolute bottom-20 right-4 w-64 bg-[#12121A]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-in slide-in-from-bottom-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Master Out</span>
                                <span className="text-sm font-black text-white/80">{Math.round(volume * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="2.0"
                                step="0.05"
                                value={volume}
                                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                style={{ accentColor: '#f59e0b' }}
                            />
                        </div>
                    )}
                </div>

                {/* Main Dock Bar */}
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-1 sm:gap-2 bg-[#1A1A24]/90 backdrop-blur-2xl border border-white/10 p-1.5 sm:px-3 sm:py-2 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.6)] w-full">
                    
                    {/* Left: Engine Config */}
                    <button 
                        onClick={() => setShowSoundEditor(true)}
                        className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                    >
                        <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    </button>

                    {/* Center: Presets Navigator */}
                    <div className="flex items-center justify-between bg-black/40 rounded-full p-1 border border-white/5 min-w-0 w-full overflow-hidden">
                        <button onClick={prevPreset} className="p-1 sm:p-3 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white flex-shrink-0">
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        
                        <button 
                            onClick={() => {
                                setShowPresets(!showPresets);
                                setShowVolume(false);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-4 py-1.5 sm:py-2 min-w-0 group"
                        >
                            <span className="font-bold text-[11px] sm:text-sm tracking-wide text-white group-hover:text-amber-400 transition-colors truncate">
                                {PAD_PRESET_LABELS[preset]}
                            </span>
                            <ChevronUp className={`w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0 text-white/40 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                        </button>

                        <button onClick={nextPreset} className="p-1 sm:p-3 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white flex-shrink-0">
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>

                    {/* Right: Volume */}
                    <button 
                        onClick={() => {
                            setShowVolume(!showVolume);
                            setShowPresets(false);
                        }}
                        className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-colors ${showVolume ? 'bg-white/10 text-white' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}
                    >
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                    </button>
                </div>
            </div>

            {/* Sound Editor Modal (Centered Glassmorphic) */}
            {showSoundEditor && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSoundEditor(false)} />
                    
                    <div className="relative w-full max-w-sm bg-[#12121A]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black tracking-wide text-white">SOUND ENGINE</h3>
                            <button onClick={() => setShowSoundEditor(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Polyphony Switch */}
                            <div className="space-y-3 p-4 rounded-3xl bg-black/40 border border-white/5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-white/80">Voice Mode</span>
                                    <div className="flex bg-[#1A1A24] rounded-xl p-1 border border-white/5">
                                        <button 
                                            onClick={() => togglePolyphony()}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all ${polyphony === 'mono' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-white/40 hover:text-white'}`}
                                        >
                                            MONO
                                        </button>
                                        <button 
                                            onClick={() => togglePolyphony()}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all ${polyphony === 'poly' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-white/40 hover:text-white'}`}
                                        >
                                            POLY
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[11px] text-white/40 leading-relaxed font-medium">
                                    {polyphony === 'mono' ? 'Plays one note at a time. Ideal for playing scales and melodies smoothly.' : 'Plays multiple notes simultaneously. Ideal for building complex chords.'}
                                </p>
                            </div>

                            {/* Sliders */}
                            <div className="space-y-6">
                                {/* Crossfade Slider */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">Crossfade</span>
                                        <span className="text-xs font-black text-white">{crossfade.toFixed(1)} s</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="8.0"
                                        step="0.1"
                                        value={crossfade}
                                        onChange={(e) => handleCrossfadeChange(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                        style={{ accentColor: '#f59e0b' }}
                                    />
                                </div>

                                {/* Highpass Slider */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">Highpass</span>
                                        <span className="text-xs font-black text-white">{highpass} Hz</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="2000"
                                        step="1"
                                        value={highpass}
                                        onChange={(e) => handleHighpassChange(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                        style={{ accentColor: '#f59e0b' }}
                                    />
                                </div>

                                {/* Lowpass Slider */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">Lowpass</span>
                                        <span className="text-xs font-black text-white">{lowpass} Hz</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="100"
                                        max="5000"
                                        step="1"
                                        value={lowpass}
                                        onChange={(e) => handleLowpassChange(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                                        style={{ accentColor: '#f59e0b' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
