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
        { note: 'E', octave: 2, frequency: 82.41, label: '6th (E)', stringNumber: 6, gauge: 'thick-wound', color: '#c49758' },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)', stringNumber: 5, gauge: 'medium-wound', color: '#c49758' },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)', stringNumber: 4, gauge: 'light-wound', color: '#c49758' },
        { note: 'G', octave: 3, frequency: 196.00, label: '3rd (G)', stringNumber: 3, gauge: 'plain-wound', color: '#d9ba82' },
        { note: 'B', octave: 3, frequency: 246.94, label: '2nd (B)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'E', octave: 4, frequency: 329.63, label: '1st (E)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
    ],
    drop_d: [
        { note: 'D', octave: 2, frequency: 73.42, label: '6th (D)', stringNumber: 6, gauge: 'thick-wound', color: '#c49758' },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)', stringNumber: 5, gauge: 'medium-wound', color: '#c49758' },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)', stringNumber: 4, gauge: 'light-wound', color: '#c49758' },
        { note: 'G', octave: 3, frequency: 196.00, label: '3rd (G)', stringNumber: 3, gauge: 'plain-wound', color: '#d9ba82' },
        { note: 'B', octave: 3, frequency: 246.94, label: '2nd (B)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'E', octave: 4, frequency: 329.63, label: '1st (E)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
    ],
    half_step_down: [
        { note: 'D#', octave: 2, frequency: 77.78, label: '6th (Eb)', stringNumber: 6, gauge: 'thick-wound', color: '#c49758' },
        { note: 'G#', octave: 2, frequency: 103.83, label: '5th (Ab)', stringNumber: 5, gauge: 'medium-wound', color: '#c49758' },
        { note: 'C#', octave: 3, frequency: 138.59, label: '4th (Db)', stringNumber: 4, gauge: 'light-wound', color: '#c49758' },
        { note: 'F#', octave: 3, frequency: 185.00, label: '3rd (Gb)', stringNumber: 3, gauge: 'plain-wound', color: '#d9ba82' },
        { note: 'A#', octave: 3, frequency: 233.08, label: '2nd (Bb)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'D#', octave: 4, frequency: 311.13, label: '1st (Eb)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
    ],
    full_step_down: [
        { note: 'D', octave: 2, frequency: 73.42, label: '6th (D)', stringNumber: 6, gauge: 'thick-wound', color: '#c49758' },
        { note: 'G', octave: 2, frequency: 98.00, label: '5th (G)', stringNumber: 5, gauge: 'medium-wound', color: '#c49758' },
        { note: 'C', octave: 3, frequency: 130.81, label: '4th (C)', stringNumber: 4, gauge: 'light-wound', color: '#c49758' },
        { note: 'F', octave: 3, frequency: 174.61, label: '3rd (F)', stringNumber: 3, gauge: 'plain-wound', color: '#d9ba82' },
        { note: 'A', octave: 3, frequency: 220.00, label: '2nd (A)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'D', octave: 4, frequency: 293.66, label: '1st (D)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
    ],
    open_d: [
        { note: 'D', octave: 2, frequency: 73.42, label: '6th (D)', stringNumber: 6, gauge: 'thick-wound', color: '#c49758' },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)', stringNumber: 5, gauge: 'medium-wound', color: '#c49758' },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)', stringNumber: 4, gauge: 'light-wound', color: '#c49758' },
        { note: 'F#', octave: 3, frequency: 185.00, label: '3rd (F#)', stringNumber: 3, gauge: 'plain-wound', color: '#d9ba82' },
        { note: 'A', octave: 3, frequency: 220.00, label: '2nd (A)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'D', octave: 4, frequency: 293.66, label: '1st (D)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
    ],
    dadgad: [
        { note: 'D', octave: 2, frequency: 73.42, label: '6th (D)', stringNumber: 6, gauge: 'thick-wound', color: '#c49758' },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)', stringNumber: 5, gauge: 'medium-wound', color: '#c49758' },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)', stringNumber: 4, gauge: 'light-wound', color: '#c49758' },
        { note: 'G', octave: 3, frequency: 196.00, label: '3rd (G)', stringNumber: 3, gauge: 'plain-wound', color: '#d9ba82' },
        { note: 'A', octave: 3, frequency: 220.00, label: '2nd (A)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'D', octave: 4, frequency: 293.66, label: '1st (D)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
    ],
    bass4: [
        { note: 'E', octave: 1, frequency: 41.20, label: '4th (E)', stringNumber: 4, gauge: 'thick-wound', color: '#94a3b8' },
        { note: 'A', octave: 1, frequency: 55.00, label: '3rd (A)', stringNumber: 3, gauge: 'medium-wound', color: '#94a3b8' },
        { note: 'D', octave: 2, frequency: 73.42, label: '2nd (D)', stringNumber: 2, gauge: 'light-wound', color: '#94a3b8' },
        { note: 'G', octave: 2, frequency: 98.00, label: '1st (G)', stringNumber: 1, gauge: 'plain-wound', color: '#cbd5e1' },
    ],
    bass5: [
        { note: 'B', octave: 0, frequency: 30.87, label: '5th (B)', stringNumber: 5, gauge: 'thick-wound', color: '#94a3b8' },
        { note: 'E', octave: 1, frequency: 41.20, label: '4th (E)', stringNumber: 4, gauge: 'thick-wound', color: '#94a3b8' },
        { note: 'A', octave: 1, frequency: 55.00, label: '3rd (A)', stringNumber: 3, gauge: 'medium-wound', color: '#94a3b8' },
        { note: 'D', octave: 2, frequency: 73.42, label: '2nd (D)', stringNumber: 2, gauge: 'light-wound', color: '#94a3b8' },
        { note: 'G', octave: 2, frequency: 98.00, label: '1st (G)', stringNumber: 1, gauge: 'plain-wound', color: '#cbd5e1' },
    ],
    ukulele: [
        { note: 'G', octave: 4, frequency: 392.00, label: '4th (G)', stringNumber: 4, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'C', octave: 4, frequency: 261.63, label: '3rd (C)', stringNumber: 3, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'E', octave: 4, frequency: 329.63, label: '2nd (E)', stringNumber: 2, gauge: 'plain-steel', color: '#e2e8f0' },
        { note: 'A', octave: 4, frequency: 440.00, label: '1st (A)', stringNumber: 1, gauge: 'thin-steel', color: '#f8fafc' },
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
 */
export function findClosestPresetString(
    detectedFreq: number, 
    presetStrings: GuitarString[]
): { stringIndex: number; stringItem: GuitarString; centsOffset: number } | null {
    if (!detectedFreq || presetStrings.length === 0) return null;

    let bestIndex = 0;
    let minAbsCents = Infinity;

    presetStrings.forEach((s, idx) => {
        const cents = calculateCentsBetween(detectedFreq, s.frequency);
        if (Math.abs(cents) < minAbsCents) {
            minAbsCents = Math.abs(cents);
            bestIndex = idx;
        }
    });

    const bestString = presetStrings[bestIndex];
    const centsOffset = calculateCentsBetween(detectedFreq, bestString.frequency);

    // Lock if within 250 cents (2.5 semitones) of that target string
    if (minAbsCents <= 250) {
        return {
            stringIndex: bestIndex,
            stringItem: bestString,
            centsOffset: Math.max(-50, Math.min(50, centsOffset))
        };
    }

    return null;
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
 * McLeod Pitch Method (MPM) with Normalized Square Difference Function (NSDF)
 * Gold-standard pitch detection used in professional guitar tuners.
 * Resolves fundamental frequencies accurately without octave jumps or room noise triggering.
 */
export function detectPitch(
    buffer: Float32Array, 
    sampleRate: number
): { frequency: number; clarity: number; rms: number } | null {
    const SIZE = buffer.length;

    // 1. RMS Energy Noise Gate
    // Requires physical pluck energy (rejects ambient fan/AC hum and microphone hiss)
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);

    if (rms < 0.026) {
        return null; // Silence or background room noise
    }

    // 2. Normalized Square Difference Function (NSDF)
    // nsdf(tau) = 2 * sum(x(t)*x(t+tau)) / (sum(x(t)^2) + sum(x(t+tau)^2))
    // Limits tau to guitar range: 35 Hz (~1370 lags at 48kHz) to 1000 Hz (~48 lags)
    const minTau = Math.max(Math.floor(sampleRate / 1050), 2);
    const maxTau = Math.min(Math.floor(sampleRate / 35), SIZE - 2);

    const nsdf = new Float32Array(maxTau + 2);

    for (let tau = 0; tau <= maxTau; tau++) {
        let num = 0;
        let den1 = 0;
        let den2 = 0;
        const len = SIZE - tau;
        for (let j = 0; j < len; j++) {
            const x = buffer[j];
            const y = buffer[j + tau];
            num += x * y;
            den1 += x * x;
            den2 += y * y;
        }
        const den = den1 + den2;
        nsdf[tau] = den > 0.0001 ? (2 * num) / den : 0;
    }

    // 3. Find all positive local maxima (peaks)
    const peaks: { tau: number; val: number }[] = [];
    let maxVal = 0;
    let inPositive = false;

    for (let tau = minTau; tau <= maxTau; tau++) {
        if (nsdf[tau] > 0) inPositive = true;
        if (inPositive && nsdf[tau] <= 0) inPositive = false;

        // Peak detection (higher than both adjacent neighbors)
        if (inPositive && nsdf[tau] > nsdf[tau - 1] && nsdf[tau] >= nsdf[tau + 1]) {
            peaks.push({ tau, val: nsdf[tau] });
            if (nsdf[tau] > maxVal) {
                maxVal = nsdf[tau];
            }
        }
    }

    // Strict Periodicity Threshold:
    // Real plucked strings have NSDF peaks > 0.68. Noise peaks are < 0.35.
    if (peaks.length === 0 || maxVal < 0.65) {
        return null;
    }

    // 4. MPM Rule: Pick FIRST peak exceeding cutoff to avoid octave-halving
    const cutoff = maxVal * 0.88;
    const bestPeak = peaks.find(p => p.val >= cutoff) || peaks[0];

    // 5. Parabolic Interpolation for sub-sample accuracy
    const tau = bestPeak.tau;
    const s0 = nsdf[tau - 1];
    const s1 = nsdf[tau];
    const s2 = nsdf[tau + 1];

    const denom = 2 * (s0 - 2 * s1 + s2);
    const delta = Math.abs(denom) > 1e-6 ? (s0 - s2) / denom : 0;
    const exactTau = tau + (isFinite(delta) ? delta : 0);

    const frequency = sampleRate / exactTau;

    // Guitar musical range check (35 Hz to 1050 Hz)
    if (frequency < 32 || frequency > 1100) {
        return null;
    }

    return {
        frequency,
        clarity: bestPeak.val,
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
