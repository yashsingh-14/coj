/**
 * Pitch Detection Engine for Guitar Tuner (GuitarTuna Grade)
 * Uses Autocorrelation algorithm with parabolic interpolation for sub-sample accuracy.
 * Supports: Acoustic Guitar, Electric Guitar, Drop D, Half-Step Down, Open D, DADGAD, Bass, Ukulele, Chromatic.
 */

// All 12 musical note names
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const DEFAULT_A4_FREQUENCY = 440;
const A4_MIDI_NUMBER = 69;

export interface PitchResult {
    frequency: number;      // Detected frequency in Hz
    note: string;           // Note name (e.g., "E", "A", "D")
    octave: number;         // Octave number (e.g., 2, 3, 4)
    cents: number;          // How many cents off from perfect pitch (-50 to +50)
    noteFull: string;       // Full note string (e.g., "E2", "A4")
}

export interface GuitarString {
    note: string;
    octave: number;
    frequency: number;
    label: string;
    stringNumber: number; // 1 to 6 (1 = high E, 6 = low E)
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
    { id: 'standard', name: 'Standard (E A D G B E)', category: 'Guitar', notesDisplay: 'E A D G B E', description: 'Most popular guitar tuning for praise, worship & rock' },
    { id: 'drop_d', name: 'Drop D (D A D G B E)', category: 'Guitar', notesDisplay: 'D A D G B E', description: 'Deep 6th string dropped to D for powerful worship chords' },
    { id: 'half_step_down', name: 'Half Step Down (Eb Ab Db Gb Bb Eb)', category: 'Guitar', notesDisplay: 'Eb Ab Db Gb Bb Eb', description: 'Warm acoustic singing key, easier on vocal chords' },
    { id: 'full_step_down', name: 'Full Step Down (D G C F A D)', category: 'Guitar', notesDisplay: 'D G C F A D', description: 'Deep, resonant acoustic guitar tone' },
    { id: 'open_d', name: 'Open D (D A D F# A D)', category: 'Guitar', notesDisplay: 'D A D F# A D', description: 'Major chord tuning for rich ambient fingerpicking' },
    { id: 'dadgad', name: 'DADGAD (Celtic / Ambient)', category: 'Guitar', notesDisplay: 'D A D G A D', description: 'Atmospheric modal tuning for prayer & soaking' },
    { id: 'bass4', name: 'Bass 4-String (E A D G)', category: 'Bass', notesDisplay: 'E A D G', description: 'Standard 4-string electric or acoustic bass' },
    { id: 'bass5', name: 'Bass 5-String (B E A D G)', category: 'Bass', notesDisplay: 'B E A D G', description: 'Low B 5-string bass for modern church praise' },
    { id: 'ukulele', name: 'Ukulele (G C E A)', category: 'Ukulele', notesDisplay: 'G C E A', description: 'Standard soprano, concert, and tenor ukulele' },
];

// Reference strings for each preset
export const GUITAR_PRESET_STRINGS: Record<TuningPreset, GuitarString[]> = {
    standard: [
        { note: 'E', octave: 2, frequency: 82.41, label: '6th (E)', stringNumber: 6 },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)', stringNumber: 5 },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)', stringNumber: 4 },
        { note: 'G', octave: 3, frequency: 196.00, label: '3rd (G)', stringNumber: 3 },
        { note: 'B', octave: 3, frequency: 246.94, label: '2nd (B)', stringNumber: 2 },
        { note: 'E', octave: 4, frequency: 329.63, label: '1st (E)', stringNumber: 1 },
    ],
    drop_d: [
        { note: 'D', octave: 2, frequency: 73.42, label: '6th (D)', stringNumber: 6 },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)', stringNumber: 5 },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)', stringNumber: 4 },
        { note: 'G', octave: 3, frequency: 196.00, label: '3rd (G)', stringNumber: 3 },
        { note: 'B', octave: 3, frequency: 246.94, label: '2nd (B)', stringNumber: 2 },
        { note: 'E', octave: 4, frequency: 329.63, label: '1st (E)', stringNumber: 1 },
    ],
    half_step_down: [
        { note: 'D#', octave: 2, frequency: 77.78, label: '6th (Eb)', stringNumber: 6 },
        { note: 'G#', octave: 2, frequency: 103.83, label: '5th (Ab)', stringNumber: 5 },
        { note: 'C#', octave: 3, frequency: 138.59, label: '4th (Db)', stringNumber: 4 },
        { note: 'F#', octave: 3, frequency: 185.00, label: '3rd (Gb)', stringNumber: 3 },
        { note: 'A#', octave: 3, frequency: 233.08, label: '2nd (Bb)', stringNumber: 2 },
        { note: 'D#', octave: 4, frequency: 311.13, label: '1st (Eb)', stringNumber: 1 },
    ],
    full_step_down: [
        { note: 'D', octave: 2, frequency: 73.42, label: '6th (D)', stringNumber: 6 },
        { note: 'G', octave: 2, frequency: 98.00, label: '5th (G)', stringNumber: 5 },
        { note: 'C', octave: 3, frequency: 130.81, label: '4th (C)', stringNumber: 4 },
        { note: 'F', octave: 3, frequency: 174.61, label: '3rd (F)', stringNumber: 3 },
        { note: 'A', octave: 3, frequency: 220.00, label: '2nd (A)', stringNumber: 2 },
        { note: 'D', octave: 4, frequency: 293.66, label: '1st (D)', stringNumber: 1 },
    ],
    open_d: [
        { note: 'D', octave: 2, frequency: 73.42, label: '6th (D)', stringNumber: 6 },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)', stringNumber: 5 },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)', stringNumber: 4 },
        { note: 'F#', octave: 3, frequency: 185.00, label: '3rd (F#)', stringNumber: 3 },
        { note: 'A', octave: 3, frequency: 220.00, label: '2nd (A)', stringNumber: 2 },
        { note: 'D', octave: 4, frequency: 293.66, label: '1st (D)', stringNumber: 1 },
    ],
    dadgad: [
        { note: 'D', octave: 2, frequency: 73.42, label: '6th (D)', stringNumber: 6 },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)', stringNumber: 5 },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)', stringNumber: 4 },
        { note: 'G', octave: 3, frequency: 196.00, label: '3rd (G)', stringNumber: 3 },
        { note: 'A', octave: 3, frequency: 220.00, label: '2nd (A)', stringNumber: 2 },
        { note: 'D', octave: 4, frequency: 293.66, label: '1st (D)', stringNumber: 1 },
    ],
    bass4: [
        { note: 'E', octave: 1, frequency: 41.20, label: '4th (E)', stringNumber: 4 },
        { note: 'A', octave: 1, frequency: 55.00, label: '3rd (A)', stringNumber: 3 },
        { note: 'D', octave: 2, frequency: 73.42, label: '2nd (D)', stringNumber: 2 },
        { note: 'G', octave: 2, frequency: 98.00, label: '1st (G)', stringNumber: 1 },
    ],
    bass5: [
        { note: 'B', octave: 0, frequency: 30.87, label: '5th (B)', stringNumber: 5 },
        { note: 'E', octave: 1, frequency: 41.20, label: '4th (E)', stringNumber: 4 },
        { note: 'A', octave: 1, frequency: 55.00, label: '3rd (A)', stringNumber: 3 },
        { note: 'D', octave: 2, frequency: 73.42, label: '2nd (D)', stringNumber: 2 },
        { note: 'G', octave: 2, frequency: 98.00, label: '1st (G)', stringNumber: 1 },
    ],
    ukulele: [
        { note: 'G', octave: 4, frequency: 392.00, label: '4th (G)', stringNumber: 4 },
        { note: 'C', octave: 4, frequency: 261.63, label: '3rd (C)', stringNumber: 3 },
        { note: 'E', octave: 4, frequency: 329.63, label: '2nd (E)', stringNumber: 2 },
        { note: 'A', octave: 4, frequency: 440.00, label: '1st (A)', stringNumber: 1 },
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
 * Convert frequency (Hz) to the nearest musical note with customizable A4 reference (default: 440 Hz)
 */
export function frequencyToNote(frequency: number, a4Frequency: number = DEFAULT_A4_FREQUENCY): PitchResult {
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
    };
}

/**
 * High-precision Autocorrelation algorithm with parabolic interpolation
 */
export function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
    const SIZE = buffer.length;

    // 1. RMS signal energy check to filter background room noise
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);
    if (rms < 0.008) return null;

    // 2. Autocorrelation
    const correlations = new Float32Array(SIZE);
    for (let lag = 0; lag < SIZE; lag++) {
        let sum = 0;
        for (let i = 0; i < SIZE - lag; i++) {
            sum += buffer[i] * buffer[i + lag];
        }
        correlations[lag] = sum;
    }

    // 3. Peak detection
    let foundFirstDip = false;
    let bestLag = -1;
    let bestCorrelation = -1;

    const minLag = Math.floor(sampleRate / 1200); // Max ~1200 Hz
    const maxLag = Math.min(Math.floor(sampleRate / 25), SIZE - 1);  // Min ~25 Hz

    for (let lag = minLag; lag < maxLag; lag++) {
        if (!foundFirstDip && correlations[lag] < correlations[0] * 0.5) {
            foundFirstDip = true;
        }

        if (foundFirstDip && correlations[lag] > bestCorrelation) {
            bestCorrelation = correlations[lag];
            bestLag = lag;
        }
    }

    if (bestLag === -1 || bestCorrelation < correlations[0] * 0.28) {
        return null;
    }

    // 4. Parabolic interpolation for 10x sub-sample resolution
    const prev = correlations[bestLag - 1] || 0;
    const curr = correlations[bestLag];
    const next = correlations[bestLag + 1] || 0;

    const shift = (prev - next) / (2 * (prev - 2 * curr + next));
    const refinedLag = bestLag + (isFinite(shift) ? shift : 0);

    return sampleRate / refinedLag;
}

/**
 * Get tuning status label and color
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
            label: 'PERFECT', 
            subLabel: 'In Tune ✓', 
            color: '#10b981', 
            quality: 'perfect' 
        };
    } else if (absCents <= 8) {
        return { 
            label: cents > 0 ? 'SLIGHTLY SHARP' : 'SLIGHTLY FLAT', 
            subLabel: cents > 0 ? 'Tune Down slightly ↓' : 'Tune Up slightly ↑', 
            color: '#84cc16', 
            quality: 'close' 
        };
    } else if (absCents <= 20) {
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
