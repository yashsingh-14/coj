const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function transposeChord(chord: string, semitones: number, useFlats: boolean = false): string {
    // Simple regex to split root from bass/extension
    // e.g. "G/B" -> "G" and "/B", "Cm7" -> "C" and "m7"
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;

    const root = match[1];
    const extension = match[2];

    // Find index
    let index = NOTES.indexOf(root);
    if (index === -1) index = NOTES_FLAT.indexOf(root);
    if (index === -1) return chord; // Unknown chord

    // Shift
    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    // Return new root + extension
    // Use Flat/Sharp array based on preference
    const rootNote = useFlats ? NOTES_FLAT[newIndex] : NOTES[newIndex];
    return rootNote + extension;
}

export function parseSong(content: string) {
    return content.split('\n').map(line => {
        // Check if line is header or metadata? For now assume raw lyrics+chords
        return line;
    });
}
