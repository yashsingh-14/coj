/**
 * Pitch Detection Engine for Guitar Tuner (GuitarTuna Grade)
 * Uses high-clarity Autocorrelation with RMS Noise Gate and parabolic sub-sample interpolation.
 * Filters out room noise, microphone hiss, and ambient chatter so the needle never twitches randomly.
 */

// All 12 musical note names
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const DEFAULT_A4_FREQUENCY = 440;
const A4_MIDI_NUMBER = 69;

export interface PitchResult {
    frequency: number;      // Detected frequency in Hz
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
    { id: 'standard', name: 'Standard (E A D G B E)', category: 'Guitar', notesDisplay: 'E A D G B E', description: 'Standard universal tuning for acoustic & electric guitar' },
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
 * Calculate cents deviation between detected frequency and a target frequency
 * Returns value in range -100 to +100 (or beyond)
 */
export function calculateCentsBetween(detectedFreq: number, targetFreq: number): number {
    if (!detectedFreq || !targetFreq) return 0;
    return Math.round(1200 * Math.log2(detectedFreq / targetFreq));
}

/**
 * Finds which string in the active preset is closest to the detected frequency (in musical semitones)
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

    // Only match if within 250 cents (2.5 semitones) of that target string
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
 * High-clarity Autocorrelation with Noise Gate and Parabolic Interpolation
 * Returns null if room noise, mic hiss, or non-harmonic sound is present.
 */
export function detectPitch(buffer: Float32Array, sampleRate: number): { frequency: number; clarity: number; rms: number } | null {
    const SIZE = buffer.length;

    // 1. RMS Signal Energy (Noise Gate)
    // Ambient room noise, laptop fans & mic hiss typically have RMS < 0.025
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);

    // Strict Noise Gate: If energy is too low, it's silence/background noise -> return null immediately!
    if (rms < 0.028) {
        return null;
    }

    // 2. Zero-lag energy (r0)
    let r0 = 0;
    for (let i = 0; i < SIZE; i++) {
        r0 += buffer[i] * buffer[i];
    }
    if (r0 <= 0.0001) return null;

    // 3. Autocorrelation search within musical guitar range (30 Hz to 1100 Hz)
    const minLag = Math.floor(sampleRate / 1100); // Max ~1100 Hz
    const maxLag = Math.min(Math.floor(sampleRate / 30), SIZE - 2);  // Min ~30 Hz (Low B / Low E)

    let bestLag = -1;
    let bestCorr = -1;
    let foundDip = false;

    // We store correlation values for parabolic interpolation
    const correlations = new Float32Array(maxLag + 2);

    for (let lag = minLag; lag <= maxLag; lag++) {
        let sum = 0;
        // Efficient overlap correlation
        const limit = SIZE - lag;
        for (let i = 0; i < limit; i++) {
            sum += buffer[i] * buffer[i + lag];
        }
        correlations[lag] = sum;

        // Check for initial dip to avoid lag=0 self-correlation
        if (!foundDip && sum < r0 * 0.5) {
            foundDip = true;
        }

        // After initial dip, find the primary harmonic peak
        if (foundDip && sum > bestCorr) {
            bestCorr = sum;
            bestLag = lag;
        }
    }

    // 4. Harmonicity / Periodicity Check (Normalized Correlation Clarity)
    // Real plucked instrument strings have clarity > 0.70. Random noise is < 0.35.
    const clarity = bestCorr / r0;
    if (bestLag === -1 || clarity < 0.68) {
        return null; // Not a periodic musical note
    }

    // 5. Parabolic Interpolation on peak for sub-sample fractional accuracy
    const prev = correlations[bestLag - 1] || 0;
    const curr = correlations[bestLag];
    const next = correlations[bestLag + 1] || 0;

    const denominator = 2 * (prev - 2 * curr + next);
    const shift = Math.abs(denominator) > 1e-6 ? (prev - next) / denominator : 0;
    const refinedLag = bestLag + (isFinite(shift) ? shift : 0);

    const frequency = sampleRate / refinedLag;

    // Sanity range check (30 Hz to 1100 Hz)
    if (frequency < 28 || frequency > 1150) {
        return null;
    }

    return {
        frequency,
        clarity,
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
            label: 'PERFECT', 
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
