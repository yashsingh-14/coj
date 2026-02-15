const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function transposeChord(chord: string, semitones: number, useFlats: boolean = false): string {
    // Limit transpose range to prevent overflow (-11 to +11)
    const limitedSemitones = Math.max(-11, Math.min(11, semitones));

    // Check for slash chord (e.g. G/B)
    const [root, bass] = chord.split('/');
    if (bass) {
        return transposeChord(root, limitedSemitones, useFlats) + '/' + transposeChord(bass, limitedSemitones, useFlats);
    }

    // Normal chord logic
    // Simple regex to split root from extension
    // e.g. "Cm7" -> "C" and "m7"
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;

    const rootNote = match[1];
    const extension = match[2];

    // Find index
    let index = NOTES.indexOf(rootNote);
    if (index === -1) index = NOTES_FLAT.indexOf(rootNote);
    if (index === -1) return chord; // Unknown chord

    // Shift with limited semitones
    let newIndex = (index + limitedSemitones) % 12;
    if (newIndex < 0) newIndex += 12;

    // Return new root + extension
    // Use Flat/Sharp array based on preference
    const newRoot = useFlats ? NOTES_FLAT[newIndex] : NOTES[newIndex];
    return newRoot + extension;
}

export function parseSong(content: string) {
    return content.split('\n').map(line => {
        // Check if line is header or metadata? For now assume raw lyrics+chords
        return line;
    });
}
