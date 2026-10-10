/**
 * Intelligent Song Sheet Parser & Formatter for COJ Worship
 * Automatically cleans, aligns, and standardizes raw chord sheets into professional ChordPro format.
 */

const CHORD_REGEX = /^[A-G](?:[#b])?(?:m|min|maj|dim|aug|sus|add)?(?:[0-9]{1,2})?(?:[#b][0-9])?(?:\/[A-G](?:[#b])?)?$/;

export function isChordToken(token: string): boolean {
    const clean = token.replace(/[()\[\],.]/g, '').trim();
    if (!clean) return false;
    return CHORD_REGEX.test(clean);
}

export function isSectionHeader(line: string): boolean {
    const trimmed = line.trim().replace(/[\[\]:]/g, '').trim();
    return /^(intro|verse|chorus|bridge|pre-chorus|prechorus|outro|interlude|ending|instrumental)(\s*\d*)?$/i.test(trimmed);
}

export function formatSectionHeader(line: string): string {
    const trimmed = line.trim().replace(/[\[\]:]/g, '').trim();
    const match = trimmed.match(/^(intro|verse|chorus|bridge|pre-chorus|prechorus|outro|interlude|ending|instrumental)(.*)$/i);
    if (!match) return `[${trimmed}]`;
    const name = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    const rest = match[2].trim();
    return `[${name}${rest ? ' ' + rest : ''}]`;
}

export function isRhythmLine(line: string): boolean {
    const trimmed = line.trim();
    return /^[\s\/\-\|]+$/.test(trimmed) || /^\/{2,}/.test(trimmed);
}

export function isChordLine(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (isSectionHeader(trimmed)) return false;
    if (isRhythmLine(trimmed)) return false;

    const tokens = trimmed.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return false;

    let count = 0;
    for (const t of tokens) {
        if (isChordToken(t)) count++;
    }
    return (count / tokens.length) >= 0.5;
}

export function hasBracketedChords(line: string): boolean {
    return /\[[A-G](?:[#b])?(?:m|min|maj|dim|aug|sus|add)?(?:[0-9]{1,2})?(?:[#b][0-9])?(?:\/[A-G](?:[#b])?)?\]/g.test(line);
}

/**
 * Word-aligned chord merger: places chords directly at word boundaries in ChordPro format
 * avoiding awkward mid-word breaks like "Dhany[C#m]awad".
 */
export function mergeChordsWithLyrics(chordLine: string, lyricLine: string): string {
    const chords: { chord: string; index: number }[] = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(chordLine)) !== null) {
        if (isChordToken(match[0])) {
            chords.push({ chord: match[0].replace(/[\[\]]/g, ''), index: match.index });
        }
    }

    if (chords.length === 0) return lyricLine;

    const words: { text: string; index: number }[] = [];
    const wordRegex = /\S+/g;
    let wm;
    while ((wm = wordRegex.exec(lyricLine)) !== null) {
        words.push({ text: wm[0], index: wm.index });
    }

    if (words.length === 0) {
        return chords.map(c => `[${c.chord}]`).join(' ');
    }

    // Determine if chord line was shorthand spaced (e.g. only 4 spaces typed for 30 chars of lyrics)
    const lastChord = chords[chords.length - 1];
    const lastChordEnd = lastChord.index + lastChord.chord.length;
    const shouldScale = chords.length > 1 && lyricLine.length > lastChordEnd * 1.5;

    const chordPositions: { chord: string; insertAt: number }[] = [];
    let lastWordIndex = -1;

    for (let ci = 0; ci < chords.length; ci++) {
        const ch = chords[ci];
        let targetIndex = ch.index;

        if (ci > 0 && shouldScale) {
            const ratio = ci / chords.length;
            targetIndex = Math.round(ratio * lyricLine.length);
        }

        let chosenWordIdx = -1;
        let minDiff = Infinity;
        for (let wi = lastWordIndex + 1; wi < words.length; wi++) {
            const diff = Math.abs(words[wi].index - targetIndex);
            if (diff < minDiff) {
                minDiff = diff;
                chosenWordIdx = wi;
            }
        }

        if (chosenWordIdx === -1 || chosenWordIdx <= lastWordIndex) {
            chosenWordIdx = Math.min(lastWordIndex + 1, words.length - 1);
        }

        lastWordIndex = chosenWordIdx;
        chordPositions.push({ chord: ch.chord, insertAt: words[chosenWordIdx].index });
    }

    chordPositions.sort((a, b) => a.insertAt - b.insertAt);

    let result = '';
    let currIdx = 0;

    for (const cp of chordPositions) {
        if (cp.insertAt > currIdx) {
            result += lyricLine.slice(currIdx, cp.insertAt);
            currIdx = cp.insertAt;
        }
        result += `[${cp.chord}]`;
    }

    if (currIdx < lyricLine.length) {
        result += lyricLine.slice(currIdx);
    }

    return result.replace(/\s+/g, ' ').trim();
}

/**
 * Parses raw messy song sheets into standardized, beautiful ChordPro format.
 */
export function parseSongSheet(rawText: string) {
    const rawLines = rawText.split('\n');
    const outputChords: string[] = [];
    const outputLyrics: string[] = [];

    let title = '';
    let artist = '';
    let key = '';
    let tempo = '';

    const metaRegex = /^(Title|Artist|Author|Key|Tempo|BPM|CCLI)(\s*[:|-]\s*)(.*)$/i;

    // Filter lines: ignore rhythm slashes and handle capo instructions
    const lines: string[] = [];
    for (const line of rawLines) {
        const trimmed = line.trim();
        if (!trimmed) {
            lines.push('');
            continue;
        }

        // Capo detection: "CAPO on 1st Fret", "Capo: 1", etc.
        const capoMatch = trimmed.match(/^capo\s*(?:on|at)?\s*(\d+)?(?:\w+)?(?:\s+fret)?/i);
        if (capoMatch) {
            continue; // Do not let capo instructions become the song title
        }

        // Ignore strumming slashes / rhythm marks
        if (isRhythmLine(trimmed)) {
            continue;
        }

        lines.push(line);
    }

    let firstLyricText = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            // Keep clean single empty line between sections
            if (outputChords.length > 0 && outputChords[outputChords.length - 1] !== '') {
                outputChords.push('');
                outputLyrics.push('');
            }
            continue;
        }

        // Check explicit metadata (Key: A, Title: ...)
        const match = trimmed.match(metaRegex);
        if (match) {
            const label = match[1].toLowerCase();
            const value = match[3].trim();
            if (label === 'title') title = value;
            if (label === 'artist' || label === 'author') artist = value;
            if (label === 'key') key = value;
            if (label === 'tempo' || label === 'bpm') tempo = value;
            continue;
        }

        // Isolated single chord at the top before lyrics (e.g. "A")
        if (!key && outputChords.length === 0 && isChordToken(trimmed) && trimmed.split(/\s+/).length === 1) {
            key = trimmed;
            continue;
        }

        // Section Headers: [Intro], [Chorus], Verse 1, etc.
        if (isSectionHeader(trimmed)) {
            const formatted = formatSectionHeader(trimmed);
            if (outputChords.length > 0 && outputChords[outputChords.length - 1] !== '') {
                outputChords.push('');
                outputLyrics.push('');
            }
            outputChords.push(formatted);
            outputLyrics.push(formatted);
            continue;
        }

        // Already Bracketed Chords (ChordPro)
        if (hasBracketedChords(line)) {
            outputChords.push(trimmed);
            const cleanLyrics = trimmed.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();
            if (cleanLyrics) {
                outputLyrics.push(cleanLyrics);
                if (!firstLyricText) firstLyricText = cleanLyrics;
            }
            continue;
        }

        // Chord Line (Chord over Lyric)
        if (isChordLine(line)) {
            // Look ahead for matching lyric line
            let nextLyricIndex = -1;
            for (let j = i + 1; j < lines.length; j++) {
                const peek = lines[j].trim();
                if (!peek) continue;
                if (isSectionHeader(peek)) break;
                if (isChordLine(peek)) break; // Another chord line (instrumental)
                nextLyricIndex = j;
                break;
            }

            if (nextLyricIndex !== -1) {
                const nextLyric = lines[nextLyricIndex].trim();
                const merged = mergeChordsWithLyrics(line, nextLyric);
                outputChords.push(merged);
                outputLyrics.push(nextLyric);
                if (!firstLyricText) firstLyricText = nextLyric;
                i = nextLyricIndex; // Jump past matched lyric line
            } else {
                // Instrumental / Intro chord line (e.g. Intro "A C#m D A")
                const tokens = trimmed.split(/\s+/).filter(Boolean);
                const bracketed = tokens.map(t => isChordToken(t) ? `[${t.replace(/[\[\]]/g, '')}]` : t).join(' ');
                outputChords.push(bracketed);
            }
            continue;
        }

        // Plain Lyric Line
        outputChords.push(trimmed);
        outputLyrics.push(trimmed);
        if (!firstLyricText) firstLyricText = trimmed;
    }

    // Auto-detect Title if not specified
    if (!title && firstLyricText) {
        const words = firstLyricText.split(/\s+/).slice(0, 4);
        title = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }

    return {
        title,
        artist,
        key: key || 'A',
        tempo,
        chords: outputChords.join('\n').trim(),
        lyrics: outputLyrics.join('\n').trim()
    };
}
