'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Volume2, SlidersHorizontal, X } from 'lucide-react';
import {
    PadSynth,
    PAD_NOTES,
    PAD_PRESET_LABELS,
    type PadPreset,
} from '@/lib/padSynth';

const PRESETS: PadPreset[] = ['atmospheric', 'epicSaw', 'lushPad', 'organ', 'stringPad'];

// Colors for each note pad when active
const PAD_COLORS: Record<string, string> = {
    'A': '#8b5cf6',
    'A#': '#7c3aed',
    'B': '#6366f1',
    'C': '#3b82f6',
    'C#': '#0ea5e9',
    'D': '#14b8a6',
    'D#': '#10b981',
    'E': '#22c55e',
    'F': '#84cc16',
    'F#': '#eab308',
    'G': '#f97316',
    'G#': '#ef4444',
};

export default function PadPage() {
    const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
    const [preset, setPreset] = useState<PadPreset>('atmospheric');
    const [showPresets, setShowPresets] = useState(false);
    const [showSoundEditor, setShowSoundEditor] = useState(false);
    const [crossfade, setCrossfade] = useState(2.0);
    const [highpass, setHighpass] = useState(21);
    const [lowpass, setLowpass] = useState(756);
    const synthRef = useRef<PadSynth | null>(null);

    // Initialize synth
    useEffect(() => {
        synthRef.current = new PadSynth();
        return () => {
            synthRef.current?.dispose();
            synthRef.current = null;
        };
    }, []);

    // Update preset on synth
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

    const prevPreset = () => {
        const idx = PRESETS.indexOf(preset);
        setPreset(PRESETS[(idx - 1 + PRESETS.length) % PRESETS.length]);
    };

    const nextPreset = () => {
        const idx = PRESETS.indexOf(preset);
        setPreset(PRESETS[(idx + 1) % PRESETS.length]);
    };

    // Arrange notes in 3 rows x 4 columns
    const rows = [
        PAD_NOTES.slice(0, 4),
        PAD_NOTES.slice(4, 8),
        PAD_NOTES.slice(8, 12),
    ];

    return (
        <div className="min-h-screen bg-[#02000F] text-white select-none overflow-hidden flex flex-col">
            {/* Header - matching Infinite Pads style */}
            <div className="px-3 py-3 flex items-center justify-between border-b border-white/5 bg-[#0a0a14] z-40 shrink-0">
                <div className="flex items-center gap-2">
                    <Link href="/" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-white/50" />
                    </Link>

                    {/* Preset name with dropdown */}
                    <button
                        onClick={() => setShowPresets(!showPresets)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <span className="font-bold text-sm">{PAD_PRESET_LABELS[preset]}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Right side icons */}
                <div className="flex items-center gap-1">
                    {/* Sound Editor toggle */}
                    <button
                        onClick={() => setShowSoundEditor(!showSoundEditor)}
                        className={`p-2 rounded-lg transition-colors ${showSoundEditor ? 'bg-amber-500/20 text-amber-400' : 'hover:bg-white/10 text-white/40'}`}
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                    </button>

                    {/* Volume icon */}
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40">
                        <Volume2 className="w-5 h-5" />
                    </button>

                    {/* Prev/Next preset */}
                    <button onClick={prevPreset} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextPreset} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Preset Dropdown */}
            {showPresets && (
                <div className="absolute top-14 left-14 z-50 bg-[#0F0F16] border border-white/10 rounded-2xl overflow-hidden shadow-2xl min-w-[200px]">
                    <div className="px-4 py-2 border-b border-white/5">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Factory</span>
                    </div>
                    {PRESETS.map(p => (
                        <button
                            key={p}
                            onClick={() => { setPreset(p); setShowPresets(false); }}
                            className={`w-full px-4 py-3 text-left text-sm font-semibold transition-colors ${
                                preset === p ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {PAD_PRESET_LABELS[p]}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Pad Grid */}
                <div className={`flex-1 p-2 pb-20 flex flex-col gap-1.5 transition-all ${showSoundEditor ? 'pr-0' : ''}`}>
                    {rows.map((row, rowIdx) => (
                        <div key={rowIdx} className="flex-1 flex gap-1.5">
                            {row.map(note => {
                                const isActive = activeNotes.has(note);
                                const color = PAD_COLORS[note];

                                return (
                                    <button
                                        key={note}
                                        onPointerDown={(e) => { e.preventDefault(); handleNoteToggle(note); }}
                                        className="flex-1 rounded-lg border transition-all duration-200 relative overflow-hidden group"
                                        style={{
                                            borderColor: isActive ? `${color}80` : 'rgba(255,255,255,0.06)',
                                            background: isActive
                                                ? `linear-gradient(135deg, ${color}35, ${color}15)`
                                                : 'rgba(255,255,255,0.015)',
                                            boxShadow: isActive
                                                ? `0 0 30px ${color}20, inset 0 0 30px ${color}10`
                                                : 'none',
                                        }}
                                    >
                                        {/* Active glow */}
                                        {isActive && (
                                            <div className="absolute inset-0 opacity-15 animate-pulse"
                                                style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
                                            />
                                        )}

                                        {/* Note label */}
                                        <span
                                            className="absolute top-2.5 left-3 text-base font-bold transition-colors"
                                            style={{ color: isActive ? color : 'rgba(255,255,255,0.2)' }}
                                        >
                                            {note}
                                        </span>

                                        {/* Hover */}
                                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors" />
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Sound Editor Panel (slides in from right) */}
                {showSoundEditor && (
                    <div className="w-72 bg-[#0a0a14] border-l border-white/5 p-5 pb-20 flex flex-col gap-6 overflow-y-auto shrink-0 animate-in slide-in-from-right">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold">Sound Editor</h3>
                            <button onClick={() => setShowSoundEditor(false)} className="p-1 rounded-lg hover:bg-white/10 text-white/40">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Crossfade Slider */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">✕</span>
                                    <span className="text-sm font-semibold">Crossfade</span>
                                </div>
                                <span className="text-sm font-bold text-white/60">{crossfade.toFixed(1)} s</span>
                            </div>
                            <p className="text-[11px] text-white/30">The time it takes sounds to fade</p>
                            <input
                                type="range"
                                min="0.1"
                                max="8.0"
                                step="0.1"
                                value={crossfade}
                                onChange={(e) => handleCrossfadeChange(parseFloat(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                                style={{ accentColor: '#ffffff' }}
                            />
                        </div>

                        {/* Highpass Slider */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">⌒</span>
                                    <span className="text-sm font-semibold">Highpass</span>
                                </div>
                                <span className="text-sm font-bold text-white/60">{highpass} Hz</span>
                            </div>
                            <p className="text-[11px] text-white/30">Filter out lower frequencies for a thinner, brighter sound</p>
                            <input
                                type="range"
                                min="10"
                                max="2000"
                                step="1"
                                value={highpass}
                                onChange={(e) => handleHighpassChange(parseInt(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                style={{ accentColor: '#ffffff' }}
                            />
                        </div>

                        {/* Lowpass Slider */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">⌣</span>
                                    <span className="text-sm font-semibold">Lowpass</span>
                                </div>
                                <span className="text-sm font-bold text-white/60">{lowpass} Hz</span>
                            </div>
                            <p className="text-[11px] text-white/30">Filter out higher frequencies for a softer, warmer sound</p>
                            <input
                                type="range"
                                min="100"
                                max="5000"
                                step="1"
                                value={lowpass}
                                onChange={(e) => handleLowpassChange(parseInt(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                style={{ accentColor: '#ffffff' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
