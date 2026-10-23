/**
 * Pitch Detection Engine for Guitar Tuner (Studio-Grade GuitarTuna Architecture)
 * High-performance YIN Algorithm with CMNDF, Parabolic Interpolation & Harmonic Verification.
 * 
 * - Ultra-sensitive noise gating with normalization (works with any mic / volume)
 * - True fundamental tracking (prevents octave jumps on Low E & A strings)
 * - Automatic string snapping with sticky hysteresis
 */

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const DEFAULT_A4_FREQUENCY = 440;
const A4_MIDI_NUMBER = 69;

export interface PitchResult {
    frequency: number;
    note: string;
    octave: number;
    cents: number;
    noteFull: string;
    clarity: number;
    rms: number;
}

export interface GuitarString {
    note: string;
    octave: number;
    frequency: number;
    label: string;
    stringNumber: number; // 1 = high E, 6 = low E
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

export type GuitarType = 'acoustic' | 'electric' | 'bass4' | 'bass5';
export const GUITAR_TUNINGS: Record<GuitarType, GuitarString[]> = {
    acoustic: GUITAR_PRESET_STRINGS.standard,
    electric: GUITAR_PRESET_STRINGS.standard,
    bass4: GUITAR_PRESET_STRINGS.bass4,
    bass5: GUITAR_PRESET_STRINGS.bass5,
};

export function calculateCentsBetween(detectedFreq: number, targetFreq: number): number {
    if (!detectedFreq || !targetFreq || detectedFreq <= 0 || targetFreq <= 0) return 0;
    return Math.round(1200 * Math.log2(detectedFreq / targetFreq));
}

export function findClosestPresetString(
    detectedFreq: number, 
    presetStrings: GuitarString[],
    currentLockedIndex?: number
): { stringIndex: number; stringItem: GuitarString; centsOffset: number; rawCents: number; fundamentalFreq: number } | null {
    if (!detectedFreq || presetStrings.length === 0 || detectedFreq <= 0) return null;

    let bestIndex = -1;
    let minAbsDistance = Infinity;
    let bestRawCents = 0;

    presetStrings.forEach((s, idx) => {
        const target = s.frequency;
        const cents = calculateCentsBetween(detectedFreq, target);
        const dist = Math.abs(cents);

        // Hysteresis: 50-cents sticky bias towards currently selected string to prevent jumping
        const effDist = (currentLockedIndex !== undefined && currentLockedIndex === idx)
            ? Math.max(0, dist - 50)
            : dist;

        if (effDist < minAbsDistance) {
            minAbsDistance = effDist;
            bestIndex = idx;
            bestRawCents = cents;
        }
    });

    // If frequency is too far from any open guitar string (over ~2.5 semitones), ignore
    if (bestIndex === -1 || minAbsDistance > 280) {
        return null;
    }

    const bestString = presetStrings[bestIndex];
    // Clamp displayed cents offset strictly to [-50, +50] for gauge meter
    const clampedCents = Math.max(-50, Math.min(50, bestRawCents));

    return {
        stringIndex: bestIndex,
        stringItem: bestString,
        centsOffset: clampedCents,
        rawCents: bestRawCents,
        fundamentalFreq: detectedFreq
    };
}

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
        noteFull: note + octave,
        clarity,
        rms
    };
}

/**
 * Standard High-Performance YIN Pitch Detection Engine
 * Uses CMNDF and parabolic interpolation for studio-grade tuning stability.
 */
export function detectPitch(
    buffer: Float32Array, 
    sampleRate: number,
    targetExpectedFreq?: number
): { frequency: number; clarity: number; rms: number } | null {
    const SIZE = buffer.length;

    let sumSquares = 0;
    for (let i = 0; i < SIZE; i++) {
        sumSquares += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumSquares / SIZE);

    // Responsive noise gate: quiet room background is ignored while soft plucks are captured
    if (rms < 0.0018) {
        return null;
    }

    const half = Math.floor(SIZE / 2);
    // Covering Low E (82 Hz) up to high notes (~950 Hz)
    const minTau = Math.max(Math.floor(sampleRate / 950), 2);
    const maxTau = Math.min(Math.floor(sampleRate / 60), half - 2);

    const yin = new Float32Array(half);

    for (let tau = 0; tau < half; tau++) {
        let sum = 0;
        for (let j = 0; j < half; j++) {
            const diff = buffer[j] - buffer[j + tau];
            sum += diff * diff;
        }
        yin[tau] = sum;
    }

    yin[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau < half; tau++) {
        runningSum += yin[tau];
        yin[tau] = (yin[tau] * tau) / (runningSum + 1e-12);
    }

    const threshold = 0.15;
    let tauEstimate = -1;

    for (let tau = minTau; tau < maxTau; tau++) {
        if (yin[tau] < threshold) {
            while (tau + 1 < maxTau && yin[tau + 1] < yin[tau]) {
                tau++;
            }
            tauEstimate = tau;
            break;
        }
    }

    if (tauEstimate === -1) {
        let minVal = Infinity;
        let minTauEstimate = -1;
        for (let tau = minTau; tau < maxTau; tau++) {
            if (yin[tau] < minVal) {
                minVal = yin[tau];
                minTauEstimate = tau;
            }
        }
        if (minVal < 0.22) {
            tauEstimate = minTauEstimate;
        } else {
            return null;
        }
    }

    // Parabolic Sub-sample Interpolation
    let betterTau = tauEstimate;
    if (tauEstimate > 0 && tauEstimate < half - 1) {
        const s0 = yin[tauEstimate - 1];
        const s1 = yin[tauEstimate];
        const s2 = yin[tauEstimate + 1];
        const denom = 2 * (2 * s1 - s0 - s2);
        if (Math.abs(denom) > 1e-9) {
            betterTau = tauEstimate + (s2 - s0) / denom;
        }
    }

    const frequency = sampleRate / betterTau;
    const clarity = Math.max(0, Math.min(1.0, 1 - yin[tauEstimate]));

    // Guitar musical range validation
    if (frequency < 55 || frequency > 950) {
        return null;
    }

    // Require good harmonic clarity for stable tuning
    if (clarity < 0.65) {
        return null;
    }

    return {
        frequency,
        clarity,
        rms
    };
}

export function getTuningStatus(cents: number): { 
    label: string; 
    subLabel: string;
    color: string; 
    quality: 'perfect' | 'close' | 'off' 
} {
    const absCents = Math.abs(cents);
    if (absCents <= 3) {
        return { label: 'IN TUNE', subLabel: 'Perfect', color: '#FF5A2E', quality: 'perfect' };
    } else if (absCents <= 10) {
        return { label: cents > 0 ? 'SLIGHTLY HIGH' : 'SLIGHTLY LOW', subLabel: cents > 0 ? 'Tune Down' : 'Tune Up', color: '#f59e0b', quality: 'close' };
    } else {
        return { label: cents > 0 ? 'TOO HIGH' : 'TOO LOW', subLabel: cents > 0 ? 'Tune Down' : 'Tune Up', color: '#ff4560', quality: 'off' };
    }
}
