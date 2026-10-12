/**
 * Professional Worship Ambient Pad & Rhythm Engine
 * Designed specifically for church worship leaders, acoustic guitars, and keys.
 * 
 * Features:
 * 1. Rich Harmonic Voicing (Root Sub + Body + Perfect 5th + Octave + 9th celestial shimmer).
 *    Neutral 1-5-9 drone that harmonizes with both Major and Minor chords in the key.
 * 2. Analog Tape Warmth & Slow Breathing LFO Modulation (zero harsh static frequencies).
 * 3. Built-in Acoustic Rhythm Engine (Acoustic Shaker, Worship Groove, Metronome Click).
 * 4. 4/4 & 6/8 Time Signatures with BPM & Tap Tempo.
 */

export type PadPreset = 'celestialWarmth' | 'deepVelvet' | 'cathedralOrgan' | 'cinematicShimmer';

export const PAD_PRESET_LABELS: Record<PadPreset, string> = {
    celestialWarmth: 'Celestial Warmth',
    deepVelvet: 'Deep Velvet',
    cathedralOrgan: 'Cathedral Organ',
    cinematicShimmer: 'Cinematic Shimmer',
};

export type RhythmStyle = 'off' | 'shaker' | 'groove' | 'click';

export const RHYTHM_STYLE_LABELS: Record<RhythmStyle, string> = {
    off: 'No Rhythm',
    shaker: 'Acoustic Shaker',
    groove: 'Acoustic Groove',
    click: 'Worship Click',
};

// Full 1-5-9 Worship Voicing Harmonics for every key
interface ChordHarmonics {
    subRoot: number;   // Octave 2: deep warm base
    root: number;      // Octave 3: body
    fifth: number;     // Octave 3/4: open worship fifth
    octave: number;    // Octave 4: air
    ninth: number;     // Octave 4: celestial 9th shimmer
}

const CHORD_VOICINGS: Record<string, ChordHarmonics> = {
    'C':  { subRoot: 65.41,  root: 130.81, fifth: 196.00, octave: 261.63, ninth: 293.66 },
    'C#': { subRoot: 69.30,  root: 138.59, fifth: 207.65, octave: 277.18, ninth: 311.13 },
    'D':  { subRoot: 73.42,  root: 146.83, fifth: 220.00, octave: 293.66, ninth: 329.63 },
    'D#': { subRoot: 77.78,  root: 155.56, fifth: 233.08, octave: 311.13, ninth: 349.23 },
    'E':  { subRoot: 82.41,  root: 164.81, fifth: 246.94, octave: 329.63, ninth: 369.99 },
    'F':  { subRoot: 87.31,  root: 174.61, fifth: 261.63, octave: 349.23, ninth: 392.00 },
    'F#': { subRoot: 92.50,  root: 185.00, fifth: 277.18, octave: 369.99, ninth: 415.30 },
    'G':  { subRoot: 98.00,  root: 196.00, fifth: 293.66, octave: 392.00, ninth: 440.00 },
    'G#': { subRoot: 103.83, root: 207.65, fifth: 311.13, octave: 415.30, ninth: 466.16 },
    'A':  { subRoot: 110.00, root: 220.00, fifth: 329.63, octave: 440.00, ninth: 493.88 },
    'A#': { subRoot: 116.54, root: 233.08, fifth: 349.23, octave: 466.16, ninth: 523.25 },
    'B':  { subRoot: 123.47, root: 246.94, fifth: 369.99, octave: 493.88, ninth: 554.37 },
};

export const PAD_NOTES = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

interface ActiveVoice {
    oscillators: OscillatorNode[];
    gains: GainNode[];
    masterGain: GainNode;
    lfo?: OscillatorNode;
    filter: BiquadFilterNode;
}

export class PadSynth {
    private audioContext: AudioContext | null = null;
    private padMasterGain: GainNode | null = null;
    private rhythmMasterGain: GainNode | null = null;

    private activeVoices: Map<string, ActiveVoice> = new Map();
    private preset: PadPreset = 'celestialWarmth';
    private crossfadeTime = 2.5; // Smooth 2.5s crossfade between keys
    private padVolume = 0.85;
    private rhythmVolume = 0.80;

    // Rhythm Engine properties
    private rhythmStyle: RhythmStyle = 'off';
    private bpm = 72;
    private timeSignature: '4/4' | '6/8' = '4/4';
    private isRhythmPlaying = false;
    private rhythmTimer: NodeJS.Timeout | null = null;
    private currentBeat = 0;
    private nextBeatTime = 0;
    private noiseBuffer: AudioBuffer | null = null;

    constructor() {
        // AudioContext initialized lazily on user gesture
    }

    private ensureAudioContext(): boolean {
        if (typeof window === 'undefined') return false;

        if (!this.audioContext) {
            try {
                const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
                this.audioContext = new AudioContextClass({ latencyHint: 'interactive' });

                // Create Pad Master Gain
                this.padMasterGain = this.audioContext.createGain();
                this.padMasterGain.gain.value = this.padVolume;
                this.padMasterGain.connect(this.audioContext.destination);

                // Create Rhythm Master Gain
                this.rhythmMasterGain = this.audioContext.createGain();
                this.rhythmMasterGain.gain.value = this.rhythmVolume;
                this.rhythmMasterGain.connect(this.audioContext.destination);

                // Build Pink/White Noise Buffer for realistic acoustic shakers
                this.generateNoiseBuffer();
            } catch (err) {
                console.error('Web Audio API could not be initialized:', err);
                return false;
            }
        }

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        return true;
    }

    private generateNoiseBuffer() {
        if (!this.audioContext) return;
        const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds of noise
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            // Soft white noise
            output[i] = Math.random() * 2 - 1;
        }
        this.noiseBuffer = buffer;
    }

    // ==========================================
    // 1. PAD SOUND ENGINE
    // ==========================================

    setPreset(preset: PadPreset) {
        this.preset = preset;
    }

    getPreset() {
        return this.preset;
    }

    setPadVolume(val: number) {
        this.padVolume = Math.max(0, Math.min(1.5, val));
        if (this.padMasterGain && this.audioContext) {
            this.padMasterGain.gain.setTargetAtTime(this.padVolume, this.audioContext.currentTime, 0.05);
        }
    }

    getPadVolume() {
        return this.padVolume;
    }

    setCrossfadeTime(val: number) {
        this.crossfadeTime = Math.max(0.5, Math.min(6.0, val));
    }

    getCrossfadeTime() {
        return this.crossfadeTime;
    }

    startNote(note: string) {
        if (!this.ensureAudioContext() || !this.audioContext || !this.padMasterGain) return;

        // Stop other active notes with smooth crossfade so there is no muddy chord clash
        Array.from(this.activeVoices.keys()).forEach(n => {
            if (n !== note) this.stopNote(n);
        });

        if (this.activeVoices.has(note)) {
            this.stopNote(note);
        }

        const chord = CHORD_VOICINGS[note] || CHORD_VOICINGS['D'];
        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Voice master gain with exponential smooth swell
        const voiceGain = ctx.createGain();
        voiceGain.gain.setValueAtTime(0.0001, now);
        voiceGain.gain.setTargetAtTime(0.22, now, this.crossfadeTime * 0.4);

        // Low-pass warm worship filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        
        // Gentle LFO for slow, organic breathing movement (0.12 Hz = ~8 second gentle swell)
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.12, now);
        const lfoGain = ctx.createGain();

        const oscillators: OscillatorNode[] = [];
        const gains: GainNode[] = [];

        // Apply Preset Sound Profiles
        switch (this.preset) {
            case 'celestialWarmth': {
                // Signature Hillsong/Bethel Warm 1-5-9 Ambient Pad
                filter.frequency.setValueAtTime(750, now);
                filter.Q.setValueAtTime(1.0, now);
                lfoGain.gain.setValueAtTime(140, now); // subtle filter breath

                // 1. Sub Bass Root (Warm Triangle)
                const sub = ctx.createOscillator();
                sub.type = 'triangle';
                sub.frequency.setValueAtTime(chord.subRoot, now);
                const gSub = ctx.createGain(); gSub.gain.setValueAtTime(0.50, now);

                // 2. Body Root (Detuned Dual Sines for lush chorus)
                const r1 = ctx.createOscillator();
                r1.type = 'sine';
                r1.frequency.setValueAtTime(chord.root, now);
                const r2 = ctx.createOscillator();
                r2.type = 'sine';
                r2.frequency.setValueAtTime(chord.root * 1.002, now);
                const gR = ctx.createGain(); gR.gain.setValueAtTime(0.40, now);

                // 3. Perfect Fifth (Soft Sine) - the worship anchor
                const fifth = ctx.createOscillator();
                fifth.type = 'sine';
                fifth.frequency.setValueAtTime(chord.fifth, now);
                const gFifth = ctx.createGain(); gFifth.gain.setValueAtTime(0.35, now);

                // 4. Shimmer 9th Harmonic (Delicate Triangle/Sine)
                const ninth = ctx.createOscillator();
                ninth.type = 'sine';
                ninth.frequency.setValueAtTime(chord.ninth, now);
                const gNinth = ctx.createGain(); gNinth.gain.setValueAtTime(0.12, now);

                sub.connect(gSub).connect(filter);
                r1.connect(gR).connect(filter);
                r2.connect(gR).connect(filter);
                fifth.connect(gFifth).connect(filter);
                ninth.connect(gNinth).connect(filter);

                oscillators.push(sub, r1, r2, fifth, ninth);
                gains.push(gSub, gR, gFifth, gNinth);
                break;
            }

            case 'deepVelvet': {
                // Extra dark, velvety, pure low-end warmth for intimate acoustic sets
                filter.frequency.setValueAtTime(450, now);
                filter.Q.setValueAtTime(0.7, now);
                lfoGain.gain.setValueAtTime(80, now);

                const sub = ctx.createOscillator();
                sub.type = 'sine';
                sub.frequency.setValueAtTime(chord.subRoot, now);
                const gSub = ctx.createGain(); gSub.gain.setValueAtTime(0.60, now);

                const root = ctx.createOscillator();
                root.type = 'triangle';
                root.frequency.setValueAtTime(chord.root, now);
                const gRoot = ctx.createGain(); gRoot.gain.setValueAtTime(0.45, now);

                const fifth = ctx.createOscillator();
                fifth.type = 'sine';
                fifth.frequency.setValueAtTime(chord.fifth, now);
                const gFifth = ctx.createGain(); gFifth.gain.setValueAtTime(0.30, now);

                sub.connect(gSub).connect(filter);
                root.connect(gRoot).connect(filter);
                fifth.connect(gFifth).connect(filter);

                oscillators.push(sub, root, fifth);
                gains.push(gSub, gRoot, gFifth);
                break;
            }

            case 'cathedralOrgan': {
                // Majestic church organ harmonic stack
                filter.frequency.setValueAtTime(1100, now);
                filter.Q.setValueAtTime(0.8, now);
                lfoGain.gain.setValueAtTime(100, now);

                const sub = ctx.createOscillator(); sub.type = 'sine'; sub.frequency.setValueAtTime(chord.subRoot, now);
                const root = ctx.createOscillator(); root.type = 'sine'; root.frequency.setValueAtTime(chord.root, now);
                const oct = ctx.createOscillator(); oct.type = 'sine'; oct.frequency.setValueAtTime(chord.octave, now);
                const fifth = ctx.createOscillator(); fifth.type = 'sine'; fifth.frequency.setValueAtTime(chord.fifth, now);

                const g1 = ctx.createGain(); g1.gain.setValueAtTime(0.4, now);
                const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.3, now);
                const g3 = ctx.createGain(); g3.gain.setValueAtTime(0.2, now);
                const g4 = ctx.createGain(); g4.gain.setValueAtTime(0.25, now);

                sub.connect(g1).connect(filter);
                root.connect(g2).connect(filter);
                oct.connect(g3).connect(filter);
                fifth.connect(g4).connect(filter);

                oscillators.push(sub, root, oct, fifth);
                gains.push(g1, g2, g3, g4);
                break;
            }

            case 'cinematicShimmer': {
                // Airy, expansive, ethereal Hillsong United shimmer
                filter.frequency.setValueAtTime(1250, now);
                filter.Q.setValueAtTime(1.2, now);
                lfoGain.gain.setValueAtTime(200, now);

                const sub = ctx.createOscillator(); sub.type = 'triangle'; sub.frequency.setValueAtTime(chord.subRoot, now);
                const root = ctx.createOscillator(); root.type = 'sawtooth'; root.frequency.setValueAtTime(chord.root, now);
                const fifth = ctx.createOscillator(); fifth.type = 'sine'; fifth.frequency.setValueAtTime(chord.fifth, now);
                const oct = ctx.createOscillator(); oct.type = 'triangle'; oct.frequency.setValueAtTime(chord.octave * 1.003, now);
                const ninth = ctx.createOscillator(); ninth.type = 'sine'; ninth.frequency.setValueAtTime(chord.ninth, now);

                const gSub = ctx.createGain(); gSub.gain.setValueAtTime(0.40, now);
                const gR = ctx.createGain(); gR.gain.setValueAtTime(0.12, now);
                const gF = ctx.createGain(); gF.gain.setValueAtTime(0.30, now);
                const gOct = ctx.createGain(); gOct.gain.setValueAtTime(0.15, now);
                const g9 = ctx.createGain(); g9.gain.setValueAtTime(0.20, now);

                sub.connect(gSub).connect(filter);
                root.connect(gR).connect(filter);
                fifth.connect(gF).connect(filter);
                oct.connect(gOct).connect(filter);
                ninth.connect(g9).connect(filter);

                oscillators.push(sub, root, fifth, oct, ninth);
                gains.push(gSub, gR, gF, gOct, g9);
                break;
            }
        }

        // Connect LFO to filter frequency for organic swell
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        // Chain: filter → voiceGain → padMasterGain
        filter.connect(voiceGain).connect(this.padMasterGain);

        // Start all oscillators
        oscillators.forEach(osc => osc.start(now));
        lfo.start(now);

        this.activeVoices.set(note, { oscillators, gains, masterGain: voiceGain, lfo, filter });
    }

    stopNote(note: string) {
        const voice = this.activeVoices.get(note);
        if (!voice || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const fadeOut = this.crossfadeTime * 0.7;

        voice.masterGain.gain.cancelScheduledValues(now);
        voice.masterGain.gain.setTargetAtTime(0.0001, now, fadeOut / 3);

        setTimeout(() => {
            voice.oscillators.forEach(osc => {
                try { osc.stop(); } catch { }
            });
            try { voice.lfo?.stop(); } catch { }
            voice.masterGain.disconnect();
        }, (fadeOut + 0.6) * 1000);

        this.activeVoices.delete(note);
    }

    stopAll() {
        Array.from(this.activeVoices.keys()).forEach(note => this.stopNote(note));
    }

    isNotePlaying(note: string): boolean {
        return this.activeVoices.has(note);
    }

    // ==========================================
    // 2. WORSHIP RHYTHM & METRONOME ENGINE
    // ==========================================

    setRhythmStyle(style: RhythmStyle) {
        this.rhythmStyle = style;
        if (style === 'off' && this.isRhythmPlaying) {
            this.stopRhythm();
        } else if (style !== 'off' && !this.isRhythmPlaying) {
            this.startRhythm();
        }
    }

    getRhythmStyle() {
        return this.rhythmStyle;
    }

    setBpm(newBpm: number) {
        this.bpm = Math.max(45, Math.min(160, Math.round(newBpm)));
    }

    getBpm() {
        return this.bpm;
    }

    setTimeSignature(sig: '4/4' | '6/8') {
        this.timeSignature = sig;
        this.currentBeat = 0;
    }

    getTimeSignature() {
        return this.timeSignature;
    }

    setRhythmVolume(val: number) {
        this.rhythmVolume = Math.max(0, Math.min(1.5, val));
        if (this.rhythmMasterGain && this.audioContext) {
            this.rhythmMasterGain.gain.setTargetAtTime(this.rhythmVolume, this.audioContext.currentTime, 0.05);
        }
    }

    getRhythmVolume() {
        return this.rhythmVolume;
    }

    toggleRhythm() {
        if (this.isRhythmPlaying) {
            this.stopRhythm();
        } else {
            if (this.rhythmStyle === 'off') {
                this.rhythmStyle = 'shaker'; // Default to warm acoustic shaker
            }
            this.startRhythm();
        }
    }

    getIsRhythmPlaying() {
        return this.isRhythmPlaying;
    }

    startRhythm() {
        if (!this.ensureAudioContext() || !this.audioContext) return;
        this.isRhythmPlaying = true;
        this.currentBeat = 0;
        this.nextBeatTime = this.audioContext.currentTime + 0.05;
        this.scheduleRhythmLoop();
    }

    stopRhythm() {
        this.isRhythmPlaying = false;
        if (this.rhythmTimer) {
            clearTimeout(this.rhythmTimer);
            this.rhythmTimer = null;
        }
    }

    private scheduleRhythmLoop = () => {
        if (!this.isRhythmPlaying || !this.audioContext) return;

        const currentTime = this.audioContext.currentTime;
        const totalBeats = this.timeSignature === '4/4' ? 4 : 6;
        // Interval between beats in seconds
        const beatInterval = this.timeSignature === '4/4' 
            ? (60 / this.bpm) 
            : (60 / (this.bpm * 1.5)); // faster 8th note pulse for 6/8

        // Lookahead scheduler: schedule sounds that will occur in the next 100ms
        while (this.nextBeatTime < currentTime + 0.1) {
            this.triggerRhythmSound(this.currentBeat, this.nextBeatTime);
            this.currentBeat = (this.currentBeat + 1) % totalBeats;
            this.nextBeatTime += beatInterval;
        }

        this.rhythmTimer = setTimeout(this.scheduleRhythmLoop, 25);
    };

    private triggerRhythmSound(beatIndex: number, time: number) {
        if (!this.audioContext || !this.rhythmMasterGain) return;
        const ctx = this.audioContext;
        const isDownbeat = beatIndex === 0;

        switch (this.rhythmStyle) {
            case 'shaker': {
                // Organic Acoustic Shaker: Short shaped noise burst
                this.playShakerHit(time, isDownbeat ? 0.75 : 0.45);
                break;
            }

            case 'groove': {
                // Acoustic Worship Groove: Shaker on all beats + Soft Kick heartbeat on beat 1 (& 3)
                this.playShakerHit(time, isDownbeat ? 0.7 : 0.4);

                if (this.timeSignature === '4/4') {
                    if (beatIndex === 0 || beatIndex === 2) {
                        this.playSoftKick(time, beatIndex === 0 ? 0.8 : 0.5);
                    }
                } else {
                    // 6/8 time: kick on 1 and 4
                    if (beatIndex === 0 || beatIndex === 3) {
                        this.playSoftKick(time, beatIndex === 0 ? 0.8 : 0.5);
                    }
                }
                break;
            }

            case 'click': {
                // Wooden Metronome / Side-stick Click
                this.playWoodClick(time, isDownbeat);
                break;
            }
        }
    }

    private playShakerHit(time: number, velocity: number) {
        if (!this.audioContext || !this.noiseBuffer || !this.rhythmMasterGain) return;
        const ctx = this.audioContext;

        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        // Bandpass filter centered around 4800Hz for egg shaker texture
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(4800, time);
        filter.Q.setValueAtTime(2.5, time);

        // Envelope: 40ms quick decay
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(velocity * 0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.045);

        noise.connect(filter).connect(gain).connect(this.rhythmMasterGain);
        noise.start(time);
        noise.stop(time + 0.05);
    }

    private playSoftKick(time: number, velocity: number) {
        if (!this.audioContext || !this.rhythmMasterGain) return;
        const ctx = this.audioContext;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        // Pitch drop from 110Hz to 45Hz
        osc.frequency.setValueAtTime(110, time);
        osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(velocity * 0.45, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);

        osc.connect(gain).connect(this.rhythmMasterGain);
        osc.start(time);
        osc.stop(time + 0.13);
    }

    private playWoodClick(time: number, isAccent: boolean) {
        if (!this.audioContext || !this.rhythmMasterGain) return;
        const ctx = this.audioContext;

        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isAccent ? 1600 : 900, time);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(isAccent ? 0.35 : 0.20, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.025);

        osc.connect(gain).connect(this.rhythmMasterGain);
        osc.start(time);
        osc.stop(time + 0.03);
    }

    dispose() {
        this.stopRhythm();
        this.stopAll();
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        this.audioContext = null;
    }
}
