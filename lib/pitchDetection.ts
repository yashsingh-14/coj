/**
 * Pitch Detection Engine for Guitar Tuner
 * Uses Autocorrelation algorithm to detect pitch from microphone input.
 * Supports: Acoustic Guitar, Electric Guitar, Bass Guitar (4 & 5 string)
 */

// All 12 musical note names
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// A4 = 440 Hz (standard tuning reference)
const A4_FREQUENCY = 440;
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
}

export type GuitarType = 'acoustic' | 'electric' | 'bass4' | 'bass5';

// Standard tuning frequencies for each guitar type
export const GUITAR_TUNINGS: Record<GuitarType, GuitarString[]> = {
    acoustic: [
        { note: 'E', octave: 2, frequency: 82.41, label: '6th (E)' },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)' },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)' },
        { note: 'G', octave: 3, frequency: 196.00, label: '3rd (G)' },
        { note: 'B', octave: 3, frequency: 246.94, label: '2nd (B)' },
        { note: 'E', octave: 4, frequency: 329.63, label: '1st (E)' },
    ],
    electric: [
        { note: 'E', octave: 2, frequency: 82.41, label: '6th (E)' },
        { note: 'A', octave: 2, frequency: 110.00, label: '5th (A)' },
        { note: 'D', octave: 3, frequency: 146.83, label: '4th (D)' },
        { note: 'G', octave: 3, frequency: 196.00, label: '3rd (G)' },
        { note: 'B', octave: 3, frequency: 246.94, label: '2nd (B)' },
        { note: 'E', octave: 4, frequency: 329.63, label: '1st (E)' },
    ],
    bass4: [
        { note: 'E', octave: 1, frequency: 41.20, label: '4th (E)' },
        { note: 'A', octave: 1, frequency: 55.00, label: '3rd (A)' },
        { note: 'D', octave: 2, frequency: 73.42, label: '2nd (D)' },
        { note: 'G', octave: 2, frequency: 98.00, label: '1st (G)' },
    ],
    bass5: [
        { note: 'B', octave: 0, frequency: 30.87, label: '5th (B)' },
        { note: 'E', octave: 1, frequency: 41.20, label: '4th (E)' },
        { note: 'A', octave: 1, frequency: 55.00, label: '3rd (A)' },
        { note: 'D', octave: 2, frequency: 73.42, label: '2nd (D)' },
        { note: 'G', octave: 2, frequency: 98.00, label: '1st (G)' },
    ],
};

/**
 * Convert frequency (Hz) to the nearest musical note
 */
export function frequencyToNote(frequency: number): PitchResult {
    // Calculate MIDI number from frequency
    const midiNumber = 12 * Math.log2(frequency / A4_FREQUENCY) + A4_MIDI_NUMBER;
    const roundedMidi = Math.round(midiNumber);

    // Calculate cents offset (how far from perfect pitch)
    const cents = Math.round((midiNumber - roundedMidi) * 100);

    // Get note name and octave
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
 * Autocorrelation pitch detection algorithm
 * More accurate than FFT for monophonic instruments like guitar.
 */
export function detectPitch(buffer: Float32Array<ArrayBufferLike>, sampleRate: number): number | null {
    const SIZE = buffer.length;

    // 1. Check if the signal is loud enough (avoid noise detection)
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
        rms += buffer[i] * buffer[i];
    }
    rms = Math.sqrt(rms / SIZE);

    // If the signal is too quiet, return null (no pitch detected)
    if (rms < 0.01) return null;

    // 2. Autocorrelation
    // Find the repeating pattern in the waveform
    const correlations = new Float32Array(SIZE);
    
    for (let lag = 0; lag < SIZE; lag++) {
        let sum = 0;
        for (let i = 0; i < SIZE - lag; i++) {
            sum += buffer[i] * buffer[i + lag];
        }
        correlations[lag] = sum;
    }

    // 3. Find the first peak after the initial drop
    // Skip the first peak (lag=0 is always the highest — it's the signal correlated with itself)
    let foundFirstDip = false;
    let bestLag = -1;
    let bestCorrelation = -1;

    // Minimum lag = sample rate / max frequency (e.g., 48000 / 1200 = 40)
    // Maximum lag = sample rate / min frequency (e.g., 48000 / 25 = 1920)
    const minLag = Math.floor(sampleRate / 1200); // Max detectable: ~1200 Hz (plenty for guitar)
    const maxLag = Math.min(Math.floor(sampleRate / 25), SIZE - 1);  // Min detectable: ~25 Hz (below bass guitar low B)

    for (let lag = minLag; lag < maxLag; lag++) {
        // Look for the dip (where correlation drops below threshold)
        if (!foundFirstDip && correlations[lag] < correlations[0] * 0.5) {
            foundFirstDip = true;
        }

        // After the dip, find the highest peak
        if (foundFirstDip && correlations[lag] > bestCorrelation) {
            bestCorrelation = correlations[lag];
            bestLag = lag;
        }
    }

    if (bestLag === -1 || bestCorrelation < correlations[0] * 0.3) {
        return null; // No clear pitch found
    }

    // 4. Parabolic interpolation for sub-sample accuracy
    // This improves accuracy by ~10x compared to raw lag
    const prev = correlations[bestLag - 1] || 0;
    const curr = correlations[bestLag];
    const next = correlations[bestLag + 1] || 0;

    const shift = (prev - next) / (2 * (prev - 2 * curr + next));
    const refinedLag = bestLag + (isFinite(shift) ? shift : 0);

    // Frequency = sample rate / period
    return sampleRate / refinedLag;
}

/**
 * Get the tuning status label and color based on cents offset
 */
export function getTuningStatus(cents: number): { label: string; color: string; quality: 'perfect' | 'close' | 'off' } {
    const absCents = Math.abs(cents);
    
    if (absCents <= 3) {
        return { label: 'In Tune ✓', color: '#22c55e', quality: 'perfect' };
    } else if (absCents <= 10) {
        return { label: cents > 0 ? 'Slightly Sharp' : 'Slightly Flat', color: '#84cc16', quality: 'close' };
    } else if (absCents <= 25) {
        return { label: cents > 0 ? 'Sharp ↑' : 'Flat ↓', color: '#eab308', quality: 'off' };
    } else {
        return { label: cents > 0 ? 'Too Sharp ↑↑' : 'Too Flat ↓↓', color: '#ef4444', quality: 'off' };
    }
}
