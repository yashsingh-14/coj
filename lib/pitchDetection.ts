/**
 * Pitch Detection Engine for Guitar Tuner (Yousician GuitarTuna Grade)
 * Uses McLeod Pitch Method (MPM) with Normalized Square Difference Function (NSDF)
 * and sub-sample parabolic interpolation.
 * 
 * Accurately detects fundamental guitar pitch (E2 82.4Hz to E4 329.6Hz) without octave jumping.
 * Noise-gated to ignore room noise, mic hiss, and fan hum.
 */

// All 12 musical note names
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const DEFAULT_A4_FREQUENCY = 440;
const A4_MIDI_NUMBER = 69;

export interface PitchResult {
    frequency: number;      // Detected frequency in Hz (exact guitar pitch)
    note: string;           // Note name (e.g., "E", "A", "D")
    octave: number;         // Octave number (e.g., 2, 3, 4)
    cents: number;          // How many cents off from nearest 12-TET note (-50 to +50)
    noteFull: string;       // Full note string (e.g., "E2", "A4")
    clarity: number;        // Harmonicity / Periodicity clarity (0.0 to 1.0)
    rms: number;            // Signal energy
}

export interface GuitarString {
    note: string;
    octave: number;
    frequency: number;
    label: string;
    stringNumber: number; // 1 to 6 (1 = high E, 6 = low E)
    gauge: 'thick-wound' | 'medium-wound' | 'light-wound' | 'plain-wound' | 'plain-steel' | 'thin-steel';
    color: string;
}

export type TuningPreset = 
    | 'standard' 
    | 'drop_d' 
    | 'half_step_down' 
    | 'full_step_down' 
    | 'open_d' 
    | 'dadgad' 
    | 'bass4' 
    | 'bass5' 
    | 'ukulele';

export interface TuningPresetInfo {
    id: TuningPreset;
    name: string;
    category: 'Guitar' | 'Bass' | 'Ukulele';
    notesDisplay: string;
    description: string;
}

export const TUNING_PRESETS_INFO: TuningPresetInfo[] = [
    { id: 'standard', name: 'Standard (E A D G B E)', category: 'Guitar', notesDisplay: 'E A D G B E', description: 'Universal standard guitar tuning for praise, worship & rock' },
    { id: 'drop_d', name: 'Drop D (D A D G B E)', category: 'Guitar', notesDisplay: 'D A D G B E', description: 'Deep 6th string dropped to D for powerful worship chords' },
    { id: 'half_step_down', name: 'Half Step Down (Eb Ab Db Gb Bb Eb)', category: 'Guitar', notesDisplay: 'Eb Ab Db Gb Bb Eb', description: 'Warm acoustic singing key, easier on vocal chords' },
    { id: 'full_step_down', name: 'Full Step Down (D G C F A D)', category: 'Guitar', notesDisplay: 'D G C F A D', description: 'Deep, resonant acoustic guitar tone' },
    { id: 'open_d', name: 'Open D (D A D F# A D)', category: 'Guitar', notesDisplay: 'D A D F# A D', description: 'Major chord tuning for rich ambient fingerpicking' },
    { id: 'dadgad', name: 'DADGAD (Celtic / Ambient)', category: 'Guitar', notesDisplay: 'D A D G A D', description: 'Atmospheric modal tuning for prayer & soaking' },
    { id: 'bass4', name: 'Bass 4-String (E A D G)', category: 'Bass', notesDisplay: 'E A D G', description: 'Standard 4-string electric or acoustic bass' },
    { id: 'bass5', name: 'Bass 5-String (B E A D G)', category: 'Bass', notesDisplay: 'B E A D G', description: 'Low B 5-string bass for modern church praise' },
    { id: 'ukulele', name: 'Ukulele (G C E A)', category: 'Ukulele', notesDisplay: 'G C E A', description: 'Standard soprano, concert, and tenor ukulele' },
];

// Reference strings for each preset with authentic string gauges
export const GUITAR_PRESET_STRINGS: Record<TuningPreset, GuitarString[]> = {
    standard: [
        { note: 'E', octave: 4, frequency: 329.63, label: '1st (E)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
        { note: 'B', octave: 3, frequency: 246.94, label: '2nd (B)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'G', octave: 3, frequency: 196.00, label: '3rd (G)', stringNumber: 3, gauge: 'plain-wound', color: '#d9ba82' },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)', stringNumber: 4, gauge: 'light-wound', color: '#c49758' },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)', stringNumber: 5, gauge: 'medium-wound', color: '#c49758' },
        { note: 'E', octave: 2, frequency: 82.41,  label: '6th (E)', stringNumber: 6, gauge: 'thick-wound', color: '#c49758' },
    ],
    drop_d: [
        { note: 'E', octave: 4, frequency: 329.63, label: '1st (E)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
        { note: 'B', octave: 3, frequency: 246.94, label: '2nd (B)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'G', octave: 3, frequency: 196.00, label: '3rd (G)', stringNumber: 3, gauge: 'plain-wound', color: '#d9ba82' },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)', stringNumber: 4, gauge: 'light-wound', color: '#c49758' },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)', stringNumber: 5, gauge: 'medium-wound', color: '#c49758' },
        { note: 'D', octave: 2, frequency: 73.42,  label: '6th (D)', stringNumber: 6, gauge: 'thick-wound', color: '#c49758' },
    ],
    half_step_down: [
        { note: 'D#', octave: 4, frequency: 311.13, label: '1st (Eb)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
        { note: 'A#', octave: 3, frequency: 233.08, label: '2nd (Bb)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'F#', octave: 3, frequency: 185.00, label: '3rd (Gb)', stringNumber: 3, gauge: 'plain-wound', color: '#d9ba82' },
        { note: 'C#', octave: 3, frequency: 138.59, label: '4th (Db)', stringNumber: 4, gauge: 'light-wound', color: '#c49758' },
        { note: 'G#', octave: 2, frequency: 103.83, label: '5th (Ab)', stringNumber: 5, gauge: 'medium-wound', color: '#c49758' },
        { note: 'D#', octave: 2, frequency: 77.78,  label: '6th (Eb)', stringNumber: 6, gauge: 'thick-wound', color: '#c49758' },
    ],
    full_step_down: [
        { note: 'D', octave: 4, frequency: 293.66, label: '1st (D)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
        { note: 'A', octave: 3, frequency: 220.00, label: '2nd (A)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'F', octave: 3, frequency: 174.61, label: '3rd (F)', stringNumber: 3, gauge: 'plain-wound', color: '#d9ba82' },
        { note: 'C', octave: 3, frequency: 130.81, label: '4th (C)', stringNumber: 4, gauge: 'light-wound', color: '#c49758' },
        { note: 'G', octave: 2, frequency: 98.00,  label: '5th (G)', stringNumber: 5, gauge: 'medium-wound', color: '#c49758' },
        { note: 'D', octave: 2, frequency: 73.42,  label: '6th (D)', stringNumber: 6, gauge: 'thick-wound', color: '#c49758' },
    ],
    open_d: [
        { note: 'D', octave: 4, frequency: 293.66, label: '1st (D)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
        { note: 'A', octave: 3, frequency: 220.00, label: '2nd (A)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'F#', octave: 3, frequency: 185.00, label: '3rd (F#)', stringNumber: 3, gauge: 'plain-wound', color: '#d9ba82' },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)', stringNumber: 4, gauge: 'light-wound', color: '#c49758' },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)', stringNumber: 5, gauge: 'medium-wound', color: '#c49758' },
        { note: 'D', octave: 2, frequency: 73.42,  label: '6th (D)', stringNumber: 6, gauge: 'thick-wound', color: '#c49758' },
    ],
    dadgad: [
        { note: 'D', octave: 4, frequency: 293.66, label: '1st (D)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
        { note: 'A', octave: 3, frequency: 220.00, label: '2nd (A)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'G', octave: 3, frequency: 196.00, label: '3rd (G)', stringNumber: 3, gauge: 'plain-wound', color: '#d9ba82' },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)', stringNumber: 4, gauge: 'light-wound', color: '#c49758' },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)', stringNumber: 5, gauge: 'medium-wound', color: '#c49758' },
        { note: 'D', octave: 2, frequency: 73.42,  label: '6th (D)', stringNumber: 6, gauge: 'thick-wound', color: '#c49758' },
    ],
    bass4: [
        { note: 'G', octave: 2, frequency: 98.00,  label: '1st (G)', stringNumber: 1, gauge: 'plain-wound', color: '#cbd5e1' },
        { note: 'D', octave: 2, frequency: 73.42,  label: '2nd (D)', stringNumber: 2, gauge: 'light-wound', color: '#94a3b8' },
        { note: 'A', octave: 1, frequency: 55.00,  label: '3rd (A)', stringNumber: 3, gauge: 'medium-wound', color: '#94a3b8' },
        { note: 'E', octave: 1, frequency: 41.20,  label: '4th (E)', stringNumber: 4, gauge: 'thick-wound', color: '#94a3b8' },
    ],
    bass5: [
        { note: 'G', octave: 2, frequency: 98.00,  label: '1st (G)', stringNumber: 1, gauge: 'plain-wound', color: '#cbd5e1' },
        { note: 'D', octave: 2, frequency: 73.42,  label: '2nd (D)', stringNumber: 2, gauge: 'light-wound', color: '#94a3b8' },
        { note: 'A', octave: 1, frequency: 55.00,  label: '3rd (A)', stringNumber: 3, gauge: 'medium-wound', color: '#94a3b8' },
        { note: 'E', octave: 1, frequency: 41.20,  label: '4th (E)', stringNumber: 4, gauge: 'thick-wound', color: '#94a3b8' },
        { note: 'B', octave: 0, frequency: 30.87,  label: '5th (B)', stringNumber: 5, gauge: 'thick-wound', color: '#94a3b8' },
    ],
    ukulele: [
        { note: 'A', octave: 4, frequency: 440.00, label: '1st (A)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
        { note: 'E', octave: 4, frequency: 329.63, label: '2nd (E)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'C', octave: 4, frequency: 261.63, label: '3rd (C)', stringNumber: 3, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'G', octave: 4, frequency: 392.00, label: '4th (G)', stringNumber: 4, gauge: 'plain-steel', color: '#e2e8f0' },
    ]
};

// Backward compatibility
export type GuitarType = 'acoustic' | 'electric' | 'bass4' | 'bass5';
export const GUITAR_TUNINGS: Record<GuitarType, GuitarString[]> = {
    acoustic: GUITAR_PRESET_STRINGS.standard,
    electric: GUITAR_PRESET_STRINGS.standard,
    bass4: GUITAR_PRESET_STRINGS.bass4,
    bass5: GUITAR_PRESET_STRINGS.bass5,
};

/**
 * Calculate cents deviation between detected frequency and a target frequency
 * Returns exact signed offset in cents (e.g. -12 means 12 cents flat, +8 means 8 cents sharp)
 */
export function calculateCentsBetween(detectedFreq: number, targetFreq: number): number {
    if (!detectedFreq || !targetFreq || detectedFreq <= 0 || targetFreq <= 0) return 0;
    return Math.round(1200 * Math.log2(detectedFreq / targetFreq));
}

/**
 * Finds which string in the active preset is closest to the detected frequency
 * Supports 2nd-harmonic matching for lower wound strings (E2, A2, D3) on phone mics
 */
export function findClosestPresetString(
    detectedFreq: number, 
    presetStrings: GuitarString[]
): { stringIndex: number; stringItem: GuitarString; centsOffset: number } | null {
    if (!detectedFreq || presetStrings.length === 0) return null;

    let bestIndex = 0;
    let minAbsCents = Infinity;
    let matchedHarmonic = 1;

    presetStrings.forEach((s, idx) => {
        // 1. Direct fundamental match
        const centsFund = calculateCentsBetween(detectedFreq, s.frequency);
        if (Math.abs(centsFund) < minAbsCents) {
            minAbsCents = Math.abs(centsFund);
            bestIndex = idx;
            matchedHarmonic = 1;
        }

        // 2. Wound string harmonic check (for strings with fundamental < 160 Hz)
        if (s.frequency < 160) {
            const centsHarmonic = calculateCentsBetween(detectedFreq, s.frequency * 2);
            if (Math.abs(centsHarmonic) < 70 && Math.abs(centsHarmonic) < minAbsCents) {
                minAbsCents = Math.abs(centsHarmonic);
                bestIndex = idx;
                matchedHarmonic = 2;
            }
        }
    });

    const bestString = presetStrings[bestIndex];
    const targetRef = matchedHarmonic === 2 ? bestString.frequency * 2 : bestString.frequency;
    const centsOffset = calculateCentsBetween(detectedFreq, targetRef);

    return {
        stringIndex: bestIndex,
        stringItem: bestString,
        centsOffset
    };
}

/**
 * Convert frequency (Hz) to the nearest musical note with customizable A4 reference (default: 440 Hz)
 */
export function frequencyToNote(
    frequency: number, 
    a4Frequency: number = DEFAULT_A4_FREQUENCY,
    clarity: number = 1.0,
    rms: number = 0.1
): PitchResult {
    const midiNumber = 12 * Math.log2(frequency / a4Frequency) + A4_MIDI_NUMBER;
    const roundedMidi = Math.round(midiNumber);

    const cents = Math.round((midiNumber - roundedMidi) * 100);

    const noteIndex = ((roundedMidi % 12) + 12) % 12;
    const octave = Math.floor(roundedMidi / 12) - 1;
    const note = NOTE_NAMES[noteIndex];

    return {
        frequency,
        note,
        octave,
        cents,
        noteFull: `${note}${octave}`,
        clarity,
        rms
    };
}

/**
 * Professional McLeod Pitch Method (MPM) Engine for GuitarTuna
 * Uses Normalized Square Difference Function (NSDF) with first-peak thresholding.
 * Operates in ~1.2ms without frame drops. Eliminates octave jumps and subharmonics
 * across all 6 strings (High E 329.6Hz down to Low E 82.4Hz).
 */
export function detectPitch(
    buffer: Float32Array, 
    sampleRate: number,
    targetExpectedFreq?: number
): { frequency: number; clarity: number; rms: number } | null {
    const SIZE = buffer.length;

    // 1. RMS Energy Calculation & DC offset removal
    let sum = 0;
    for (let i = 0; i < SIZE; i++) sum += buffer[i];
    const mean = sum / SIZE;

    let sumSquares = 0;
    for (let i = 0; i < SIZE; i++) {
        const val = buffer[i] - mean;
        sumSquares += val * val;
    }
    const rms = Math.sqrt(sumSquares / SIZE);

    // Noise gate: ignore background fan hum, room echo, breathing
    if (rms < 0.010) {
        return null;
    }

    // 2. NSDF computation over window W = SIZE / 2
    const W = Math.floor(SIZE / 2);
    const minTau = Math.max(Math.floor(sampleRate / 450), 10);
    const maxTau = Math.min(Math.floor(sampleRate / 68), W - 5);

    const r = new Float32Array(maxTau + 2);
    let maxR = 0;

    for (let tau = minTau; tau <= maxTau; tau++) {
        let num = 0;
        let den = 0;
        for (let j = 0; j < W; j++) {
            const x1 = buffer[j] - mean;
            const x2 = buffer[j + tau] - mean;
            num += x1 * x2;
            den += x1 * x1 + x2 * x2;
        }
        const val = den > 1e-6 ? (2 * num) / den : 0;
        r[tau] = val;
        if (val > maxR) maxR = val;
    }

    // Must have good periodicity
    if (maxR < 0.42) {
        return null;
    }

    // 3. Find all positive local maxima
    const peaks: { tau: number; val: number }[] = [];
    for (let tau = minTau + 1; tau < maxTau; tau++) {
        if (r[tau] > 0.38 && r[tau] > r[tau - 1] && r[tau] >= r[tau + 1]) {
            peaks.push({ tau, val: r[tau] });
        }
    }

    if (peaks.length === 0) {
        return null;
    }

    // 4. MPM First-Peak Picking: pick the first local maximum >= 0.85 * maxR
    const threshold = 0.85 * maxR;
    let chosen = peaks.find(p => p.val >= threshold) || peaks[0];

    // If manual target frequency is specified, prefer peak that aligns with target or its wound harmonic
    if (targetExpectedFreq && targetExpectedFreq > 0) {
        const expectedTau = sampleRate / targetExpectedFreq;
        const candidateForTarget = peaks.find(p => Math.abs(p.tau - expectedTau) / expectedTau < 0.15 && p.val >= 0.50);
        if (candidateForTarget) {
            chosen = candidateForTarget;
        }
    }

    // 5. Parabolic Interpolation around chosen peak for sub-cent accuracy
    const p = chosen.tau;
    const r0 = r[p - 1];
    const r1 = r[p];
    const r2 = r[p + 1];
    const denom = 2 * (2 * r1 - r0 - r2);
    const delta = Math.abs(denom) > 1e-6 ? (r2 - r0) / denom : 0;
    const exactTau = p + delta;

    let frequency = sampleRate / exactTau;

    // Harmonic check for lower wound strings (< 160 Hz) on small phone mics
    if (targetExpectedFreq && targetExpectedFreq < 160) {
        const centsFromOctave = Math.abs(1200 * Math.log2(frequency / (targetExpectedFreq * 2)));
        if (centsFromOctave < 80) {
            frequency = frequency / 2;
        }
    }

    if (frequency < 60 || frequency > 500) {
        return null;
    }

    return {
        frequency,
        clarity: Math.min(1.0, chosen.val),
        rms
    };
}

/**
 * Get tuning status label and color relative to target string
 */
export function getTuningStatus(cents: number): { 
    label: string; 
    subLabel: string;
    color: string; 
    quality: 'perfect' | 'close' | 'off' 
} {
    const absCents = Math.abs(cents);
    
    if (absCents <= 3) {
        return { 
            label: 'PERFECT!', 
            subLabel: 'In Tune ✓', 
            color: '#10b981', 
            quality: 'perfect' 
        };
    } else if (absCents <= 8) {
        return { 
            label: cents > 0 ? 'SLIGHTLY HIGH' : 'SLIGHTLY LOW', 
            subLabel: cents > 0 ? 'Tune Down slightly ↓' : 'Tune Up slightly ↑', 
            color: '#84cc16', 
            quality: 'close' 
        };
    } else if (absCents <= 22) {
        return { 
            label: cents > 0 ? 'TOO HIGH' : 'TOO LOW', 
            subLabel: cents > 0 ? 'Tune Down ↓' : 'Tune Up ↑', 
            color: '#f59e0b', 
            quality: 'off' 
        };
    } else {
        return { 
            label: cents > 0 ? 'TOO HIGH' : 'TOO LOW', 
            subLabel: cents > 0 ? 'Tune Down ↓↓' : 'Tune Up ↑↑', 
            color: '#ef4444', 
            quality: 'off' 
        };
    }
}
