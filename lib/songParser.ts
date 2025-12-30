/**
 * Detects if a line is a chord line.
 * Heuristic: Mostly A-G letters, spaces, standard chord symbols (maj, min, 7, #, b, /, sus, add, dim, aug)
 */
function isChordLine(line: string): boolean {
    const trimmed = line.trim();
    if (trimmed.length === 0) return false;

    // Filter out common section headers that might look short
    const tokens = trimmed.split(/\s+/);
    if (tokens.length === 0) return false;

    const chordRegex = /^[A-G](?:[#b])?(?:m|min|maj|dim|aug|sus|add)?(?:[0-9]{1,2})?(?:[#b][0-9])?(?:\/[A-G](?:[#b])?)?$/;

    // Header check (Intro, Verse, Chorus, Bridge, Interlude, Outro)
    const headerRegex = /^(Intro|Verse|Chorus|Bridge|Pre-Chorus|Outro|Interlude|Ending)[\s\d]*:?$/i;
    if (headerRegex.test(trimmed)) return false;

    let chordCount = 0;
    for (const token of tokens) {
        const cleanToken = token.replace(/[()]/g, '');
        if (chordRegex.test(cleanToken)) {
            chordCount++;
        }
    }

    // Threshold: If more than 50% of tokens are chords, or if it's purely chords
    return (chordCount / tokens.length) > 0.49;
}

function hasBracketedChords(line: string): boolean {
    // Looks for [C], [Gmaj7] etc.
    const bracketChordRegex = /\[[A-G](?:[#b])?(?:m|min|maj|dim|aug|sus|add)?(?:[0-9]{1,2})?(?:[#b][0-9])?(?:\/[A-G](?:[#b])?)?\]/g;
    return bracketChordRegex.test(line);
}

// ... mergeLines function (unchanged) ...
function mergeLines(chordLine: string, lyricLine: string): string {
    let result = "";
    const chords: { chord: string, index: number }[] = [];

    // Map starting positions of chords
    let currentMatch;
    const regex = /\S+/g;
    while ((currentMatch = regex.exec(chordLine)) !== null) {
        chords.push({
            chord: currentMatch[0],
            index: currentMatch.index
        });
    }

    let lyricPtr = 0;
    chords.sort((a, b) => a.index - b.index);

    let finalStr = "";

    for (const ch of chords) {
        const insertAt = ch.index;

        if (insertAt > lyricPtr) {
            const chunk = lyricLine.slice(lyricPtr, insertAt);
            finalStr += chunk;
            lyricPtr += chunk.length;

            if (lyricPtr < insertAt) {
                finalStr += " ".repeat(insertAt - lyricPtr);
                lyricPtr = insertAt;
            }
        }
        finalStr += `[${ch.chord}]`;
    }

    if (lyricPtr < lyricLine.length) {
        finalStr += lyricLine.slice(lyricPtr);
    }

    return finalStr;
}

export function parseSongSheet(rawText: string) {
    const lines = rawText.split('\n');
    const outputChords: string[] = [];
    const outputLyrics: string[] = [];

    // Metadata extractors
    let title = "";
    let artist = "";
    let key = "";
    let tempo = "";

    // Helper to detect metadata lines
    const metaRegex = /^(Title|Artist|Author|Key|Tempo|BPM|CCLI)(\s*[:|-]\s*)(.*)$/i;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) {
            // Preserve paragraph breaks (empty lines)
            outputChords.push("");
            outputLyrics.push("");
            continue;
        }

        // Check Metadata
        const match = trimmed.match(metaRegex);
        if (match) {
            const label = match[1].toLowerCase();
            const value = match[3].trim();

            if (label === 'title') title = value;
            if (label === 'artist' || label === 'author') artist = value;
            if (label === 'key') key = value;
            if (label === 'tempo' || label === 'bpm') tempo = value;
            continue; // Skip this line
        }

        // Implicit Title: First line detection (if not chord, not bracketed)
        const isEmptySoFar = outputChords.every(l => l === "") && outputLyrics.every(l => l === "");

        if (isEmptySoFar && !title && !isChordLine(line) && !hasBracketedChords(line) && !line.includes(':')) {
            title = trimmed;
            continue;
        }

        // Check if Chord Line (Chords-over-Lyrics)
        if (isChordLine(line)) {
            const nextLineIndex = i + 1;
            if (nextLineIndex < lines.length) {
                const nextLine = lines[nextLineIndex];

                // Ensure next line is not metadata
                const nextMeta = nextLine.trim().match(metaRegex);
                if (nextMeta) {
                    // Orphan chord line
                    const merged = line.replace(/(\S+)/g, "[$1]");
                    outputChords.push(merged);
                    continue;
                }

                if (!isChordLine(nextLine) && nextLine.trim().length > 0) {
                    // Merge
                    const merged = mergeLines(line, nextLine);
                    outputChords.push(merged);
                    outputLyrics.push(nextLine.trim());
                    i++;
                } else {
                    // Orphan
                    const merged = line.replace(/(\S+)/g, "[$1]");
                    outputChords.push(merged);
                }
            } else {
                const merged = line.replace(/(\S+)/g, "[$1]");
                outputChords.push(merged);
            }
        }
        // Check for Bracketed Chords (Embedded)
        else if (hasBracketedChords(line)) {
            outputChords.push(line.trim());
            // Strip chords for pure lyrics
            const cleanLyrics = line.replace(/\[.*?\]/g, "").replace(/\s+/g, " ").trim();
            outputLyrics.push(cleanLyrics);
        }
        else {
            // It's a lyric line (or header)
            outputChords.push(line.trim()); // Fallback: duplicate lyrics to chords pane so lines match
            outputLyrics.push(line.trim());
        }
    }

    return {
        title,
        artist,
        key,
        tempo,
        chords: outputChords.join('\n').trim(),
        lyrics: outputLyrics.join('\n').trim()
    };
}
