/**
 * Pad Synthesizer Engine for Infinity Pad
 * Uses Web Audio API to generate ambient pad sounds.
 * Supports multiple simultaneous notes and 5 sound presets.
 */

export type PadPreset = 'atmospheric' | 'epicSaw' | 'lushPad' | 'organ' | 'stringPad';

export const PAD_PRESET_LABELS: Record<PadPreset, string> = {
    atmospheric: 'Atmospheric',
    epicSaw: 'Epic Saw',
    lushPad: 'Lush Pad',
    organ: 'Organ',
    stringPad: 'String Pad',
};

// Note frequencies for octave 3 (middle range, good for pads)
const NOTE_FREQUENCIES: Record<string, number> = {
    'C': 130.81,
    'C#': 138.59,
    'D': 146.83,
    'D#': 155.56,
    'E': 164.81,
    'F': 174.61,
    'F#': 185.00,
    'G': 196.00,
    'G#': 207.65,
    'A': 220.00,
    'A#': 233.08,
    'B': 246.94,
};

export const PAD_NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

interface ActiveNote {
    oscillators: OscillatorNode[];
    gains: GainNode[];
    filter?: BiquadFilterNode;
    highpass: BiquadFilterNode;
    lowpass: BiquadFilterNode;
    masterGain: GainNode;
}

export class PadSynth {
    private audioContext: AudioContext | null = null;
    private globalGain: GainNode | null = null;

    private activeNotes: Map<string, ActiveNote> = new Map();
    private preset: PadPreset = 'atmospheric';
    private masterVolume = 0.20; // Lowered to 0.20 to guarantee NO clipping with max 4 polyphony + overlap
    private mainVolume = 1.0;   // global output volume
    private crossfadeTime = 2.0; // seconds
    private highpassFreq = 21; // Hz
    private lowpassFreq = 756; // Hz
    private polyphonyMode: 'poly' | 'mono' = 'poly';

    constructor() {
        // We do NOT initialize AudioContext here anymore.
        // It must be initialized lazily on the first user interaction (startNote)
        // to prevent mobile Safari/Chrome 'suspended' race conditions and crackling.
    }

    private ensureAudioContext(): boolean {
        if (typeof window === 'undefined') return false;
        
        if (!this.audioContext) {
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                // 'interactive' gives a balanced buffer size to prevent mobile CPU underrun clicks
                this.audioContext = new AudioContextClass({ latencyHint: 'interactive' });
                
                this.globalGain = this.audioContext.createGain();
                this.globalGain.gain.value = this.mainVolume;
                this.globalGain.connect(this.audioContext.destination);
            } catch (err) {
                console.error("Web Audio API not supported", err);
                return false;
            }
        }
        
        if (this.audioContext.state === 'suspended') {
            // Must wait/resume before scheduling notes on mobile
            this.audioContext.resume();
        }
        
        return true;
    }

    setPolyphonyMode(mode: 'poly' | 'mono') {
        this.polyphonyMode = mode;
    }

    getPolyphonyMode() {
        return this.polyphonyMode;
    }

    setMasterVolume(val: number) {
        this.mainVolume = Math.max(0, Math.min(2.0, val));
        if (this.globalGain && this.audioContext) {
            this.globalGain.gain.setTargetAtTime(this.mainVolume, this.audioContext.currentTime, 0.05);
        }
    }

    getMasterVolume() {
        return this.mainVolume;
    }

    setPreset(preset: PadPreset) {
        this.preset = preset;
    }

    getPreset() {
        return this.preset;
    }

    setCrossfadeTime(time: number) {
        this.crossfadeTime = Math.max(0.1, Math.min(8.0, time));
    }

    getCrossfadeTime() {
        return this.crossfadeTime;
    }

    setHighpass(freq: number) {
        this.highpassFreq = Math.max(10, Math.min(2000, freq));
        // Update all active notes
        this.activeNotes.forEach(active => {
            if (active.highpass && this.audioContext) {
                active.highpass.frequency.setValueAtTime(this.highpassFreq, this.audioContext.currentTime);
            }
        });
    }

    getHighpass() {
        return this.highpassFreq;
    }

    setLowpass(freq: number) {
        this.lowpassFreq = Math.max(100, Math.min(5000, freq));
        // Update all active notes
        this.activeNotes.forEach(active => {
            if (active.lowpass && this.audioContext) {
                active.lowpass.frequency.setValueAtTime(this.lowpassFreq, this.audioContext.currentTime);
            }
        });
    }

    getLowpass() {
        return this.lowpassFreq;
    }

    private getFrequency(note: string): number {
        return NOTE_FREQUENCIES[note] || 220;
    }

    startNote(note: string) {
        if (!this.ensureAudioContext() || !this.audioContext || !this.globalGain) return;

        // Handle Poly/Mono modes
        if (this.polyphonyMode === 'mono') {
            // Stop all other notes when starting a new one
            Array.from(this.activeNotes.keys()).forEach(n => {
                if (n !== note) this.stopNote(n);
            });
        } else {
            // Mobile CPU Protection (Voice Stealing)
            // Hard limit to 4 active notes minimum (most mobile devices stutter above 16 total generic oscillators)
            if (this.activeNotes.size >= 4) {
                const oldestNote = this.activeNotes.keys().next().value;
                // If the oldest note isn't the current note, stop it to free up CPU
                if (oldestNote && oldestNote !== note) {
                    this.stopNote(oldestNote);
                }
            }
        }

        // If note already playing, stop it first to prevent double-triggering
        if (this.activeNotes.has(note)) {
            this.stopNote(note);
        }

        const freq = this.getFrequency(note);
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Master gain for this note with smooth Exponential approach
        const masterGain = ctx.createGain();
        // NEVER use exactly 0 in WebKit for exponential ramps/targets, it causes NaN math crackling/popping bugs!
        masterGain.gain.setValueAtTime(0.0001, now);
        
        // Use setTargetAtTime for smooth, click-free attack
        // timeConstant (3rd arg) is 1/3 of the desired duration to reach 95%
        const attackTimeConstant = (this.crossfadeTime * 0.3) / 3;
        masterGain.gain.setTargetAtTime(this.masterVolume, now, attackTimeConstant);

        // Global highpass and lowpass filters
        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(this.highpassFreq, now);
        highpass.Q.setValueAtTime(0.7, now);

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(this.lowpassFreq, now);
        lowpass.Q.setValueAtTime(0.7, now);

        // Chain: ... → highpass → lowpass → masterGain → globalGain
        highpass.connect(lowpass).connect(masterGain).connect(this.globalGain);

        let oscillators: OscillatorNode[] = [];
        let gains: GainNode[] = [];
        let filter: BiquadFilterNode | undefined;

        // Note: preset filters connect to `highpass` (instead of masterGain directly)
        const filterTarget = highpass;

        switch (this.preset) {
            case 'atmospheric': {
                // Two slightly detuned sine waves for warm ambient sound
                const osc1 = ctx.createOscillator();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(freq, now);
                const osc2 = ctx.createOscillator();
                osc2.type = 'sine';
                // Smaller detune (0.15%) to avoid excessive beating/wobble
                osc2.frequency.setValueAtTime(freq * 1.0015, now);
                const osc3 = ctx.createOscillator();
                osc3.type = 'sine';
                osc3.frequency.setValueAtTime(freq * 2, now);

                const g1 = ctx.createGain(); g1.gain.setValueAtTime(0.5, now);
                const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.4, now);
                const g3 = ctx.createGain(); g3.gain.setValueAtTime(0.1, now);

                filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, now);
                filter.Q.setValueAtTime(1, now);

                osc1.connect(g1).connect(filter);
                osc2.connect(g2).connect(filter);
                osc3.connect(g3).connect(filter);
                filter.connect(filterTarget);

                oscillators = [osc1, osc2, osc3];
                gains = [g1, g2, g3];
                break;
            }

            case 'epicSaw': {
                const osc1 = ctx.createOscillator();
                osc1.type = 'sawtooth';
                osc1.frequency.setValueAtTime(freq, now);
                const osc2 = ctx.createOscillator();
                osc2.type = 'sawtooth';
                // Smaller detune for stable Epic Saw
                osc2.frequency.setValueAtTime(freq * 1.002, now);

                const g1 = ctx.createGain(); g1.gain.setValueAtTime(0.3, now);
                const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.25, now);

                filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1200, now);
                filter.Q.setValueAtTime(2, now);

                osc1.connect(g1).connect(filter);
                osc2.connect(g2).connect(filter);
                filter.connect(filterTarget);

                oscillators = [osc1, osc2];
                gains = [g1, g2];
                break;
            }

            case 'lushPad': {
                const osc1 = ctx.createOscillator();
                osc1.type = 'triangle';
                osc1.frequency.setValueAtTime(freq, now);
                const osc2 = ctx.createOscillator();
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(freq * 0.998, now);
                const osc3 = ctx.createOscillator();
                osc3.type = 'sine';
                osc3.frequency.setValueAtTime(freq * 2.002, now);

                const g1 = ctx.createGain(); g1.gain.setValueAtTime(0.4, now);
                const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.35, now);
                const g3 = ctx.createGain(); g3.gain.setValueAtTime(0.08, now);

                filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(600, now);
                filter.Q.setValueAtTime(0.7, now);

                osc1.connect(g1).connect(filter);
                osc2.connect(g2).connect(filter);
                osc3.connect(g3).connect(filter);
                filter.connect(filterTarget);

                oscillators = [osc1, osc2, osc3];
                gains = [g1, g2, g3];
                break;
            }

            case 'organ': {
                const harmonics = [1, 2, 3, 4];
                const volumes = [0.5, 0.3, 0.15, 0.05];
                harmonics.forEach((h, i) => {
                    const osc = ctx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq * h, now);
                    const g = ctx.createGain();
                    g.gain.setValueAtTime(volumes[i], now);
                    osc.connect(g).connect(filterTarget);
                    oscillators.push(osc);
                    gains.push(g);
                });
                break;
            }

            case 'stringPad': {
                const osc1 = ctx.createOscillator();
                osc1.type = 'sawtooth';
                osc1.frequency.setValueAtTime(freq, now);
                const osc2 = ctx.createOscillator();
                osc2.type = 'sawtooth';
                osc2.frequency.setValueAtTime(freq * 1.004, now);
                const osc3 = ctx.createOscillator();
                osc3.type = 'triangle';
                osc3.frequency.setValueAtTime(freq * 0.5, now);

                const g1 = ctx.createGain(); g1.gain.setValueAtTime(0.2, now);
                const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.18, now);
                const g3 = ctx.createGain(); g3.gain.setValueAtTime(0.15, now);

                filter = ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2000, now);
                filter.Q.setValueAtTime(0.5, now);

                osc1.connect(g1).connect(filter);
                osc2.connect(g2).connect(filter);
                osc3.connect(g3).connect(filter);
                filter.connect(filterTarget);

                oscillators = [osc1, osc2, osc3];
                gains = [g1, g2, g3];
                break;
            }
        }

        // Start all oscillators
        oscillators.forEach(osc => osc.start(now));

        this.activeNotes.set(note, { oscillators, gains, filter, highpass, lowpass, masterGain });
    }

    stopNote(note: string) {
        const active = this.activeNotes.get(note);
        if (!active || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const fadeOut = this.crossfadeTime * 0.5;

        // Smooth fade out using setTargetAtTime
        // This avoids clicks and gracefully takes over from any current internal ramp value
        active.masterGain.gain.cancelScheduledValues(now);
        
        // Again, never target exactly 0 on iOS/Safari for exponential curves.
        const releaseTimeConstant = fadeOut / 3;
        active.masterGain.gain.setTargetAtTime(0.0001, now, releaseTimeConstant);

        // Cleanup after fade out finishes completely (roughly ~4-5 time constants)
        setTimeout(() => {
            active.oscillators.forEach(osc => {
                try { osc.stop(); } catch { /* already stopped */ }
            });
            active.masterGain.disconnect();
        }, (fadeOut + 0.5) * 1000); // give enough buffer time

        this.activeNotes.delete(note);
    }

    stopAll() {
        const notes = Array.from(this.activeNotes.keys());
        notes.forEach(note => this.stopNote(note));
    }

    isNotePlaying(note: string): boolean {
        return this.activeNotes.has(note);
    }

    dispose() {
        this.stopAll();
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        this.audioContext = null;
    }
}
