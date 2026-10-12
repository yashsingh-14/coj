import { Song } from '@/data/types';

/**
 * Calculates Damerau-Levenshtein distance between two strings
 * Handles insertions, deletions, substitutions, and transpositions (e.g. "worshp" -> "worship", "elevaton" -> "elevation")
 */
export function damerauLevenshtein(a: string, b: string): number {
    const la = a.length;
    const lb = b.length;
    if (la === 0) return lb;
    if (lb === 0) return la;

    const d: number[][] = Array.from({ length: la + 1 }, () => Array(lb + 1).fill(0));

    for (let i = 0; i <= la; i++) d[i][0] = i;
    for (let j = 0; j <= lb; j++) d[0][j] = j;

    for (let i = 1; i <= la; i++) {
        for (let j = 1; j <= lb; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            d[i][j] = Math.min(
                d[i - 1][j] + 1,       // deletion
                d[i][j - 1] + 1,       // insertion
                d[i - 1][j - 1] + cost // substitution
            );

            // Transposition (e.g., "teh" -> "the", "dhanayvad" -> "dhanyavad")
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
            }
        }
    }
    return d[la][lb];
}

/**
 * Calculates Dice's bigram similarity coefficient (0 to 1)
 */
export function diceSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return 0;

    const getBigrams = (str: string) => {
        const map = new Map<string, number>();
        for (let i = 0; i < str.length - 1; i++) {
            const bg = str.slice(i, i + 2);
            map.set(bg, (map.get(bg) || 0) + 1);
        }
        return map;
    };

    const b1 = getBigrams(a);
    const b2 = getBigrams(b);

    let intersection = 0;
    for (const [bg, count] of b1.entries()) {
        if (b2.has(bg)) {
            intersection += Math.min(count, b2.get(bg)!);
        }
    }

    return (2 * intersection) / (a.length - 1 + b.length - 1);
}

/**
 * Normalizes text for forgiving comparison.
 */
export function normalizeSearchText(text: string): string {
    if (!text) return '';
    return text
        .toLowerCase()
        // Remove accents / diacritics
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        // Replace punctuation, dashes, quotes with spaces
        .replace(/['’`]/g, '')
        .replace(/[-_.,!?:;/\\()[\]{}"~@#$%^&*+=<>|]/g, ' ')
        // Normalize common Romanized Hindi vowel & consonant variations
        .replace(/\b(aa|a)\b/g, 'a')
        .replace(/aa+/g, 'a')
        .replace(/ee+/g, 'i')
        .replace(/oo+/g, 'u')
        .replace(/w/g, 'v')
        .replace(/sh/g, 's')
        .replace(/kh/g, 'k')
        .replace(/ph/g, 'f')
        .replace(/z/g, 'j')
        .replace(/dh/g, 'd')
        .replace(/th/g, 't')
        .replace(/bh/g, 'b')
        .replace(/gh/g, 'g')
        // Collapse double consonants: "chattan" -> "chatan", "still" -> "stil"
        .replace(/([bcdfghjklmnpqrstvwxyz])\1+/g, '$1')
        // Collapse spaces
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Strips all spaces and punctuation for zero-spacing comparison
 * (e.g., "waymaker" matches "way maker", "hojaijaikar" matches "ho jai jai kaar")
 */
export function compactSearchText(text: string): string {
    if (!text) return '';
    return normalizeSearchText(text).replace(/[^a-z0-9\u0900-\u097F]/g, '');
}

/**
 * Checks if a query token fuzzy matches a target token with typo tolerance
 */
export function isFuzzyWordMatch(qToken: string, targetToken: string): { match: boolean; score: number } {
    if (!qToken || !targetToken) return { match: false, score: 0 };
    if (qToken === targetToken) return { match: true, score: 100 };

    const qNorm = normalizeSearchText(qToken);
    const tNorm = normalizeSearchText(targetToken);

    if (qNorm === tNorm) return { match: true, score: 95 };

    // Prefix match
    if (tNorm.startsWith(qNorm) && qNorm.length >= 3) {
        return { match: true, score: 85 };
    }

    // Substring match
    if (tNorm.includes(qNorm) && qNorm.length >= 3) {
        return { match: true, score: 75 };
    }

    // Levenshtein typo distance
    const dist = damerauLevenshtein(qNorm, tNorm);
    const maxLen = Math.max(qNorm.length, tNorm.length);

    // 1 edit allowed for words of length >= 4
    if (dist <= 1 && maxLen >= 4) {
        return { match: true, score: 70 };
    }

    // 2 edits allowed for words of length >= 7
    if (dist <= 2 && maxLen >= 7) {
        return { match: true, score: 60 };
    }

    // Dice similarity for phonetic/transposition variations
    const dice = diceSimilarity(qNorm, tNorm);
    if (dice >= 0.65 && maxLen >= 4) {
        return { match: true, score: 55 };
    }

    return { match: false, score: 0 };
}

/**
 * Calculates a forgiving relevance score between a song and user search query.
 * Returns 0 if no match, or a score >= 10 if matched.
 */
export function getSongSearchScore(song: Song, rawQuery: string): number {
    if (!rawQuery || !rawQuery.trim()) return 0;

    const query = rawQuery.trim().toLowerCase();
    const qNorm = normalizeSearchText(rawQuery);
    const qCompact = compactSearchText(rawQuery);
    const qWords = qNorm.split(/\s+/).filter(w => w.length > 0);

    const title = (song.title || '').toLowerCase();
    const titleNorm = normalizeSearchText(song.title || '');
    const titleCompact = compactSearchText(song.title || '');

    const artist = (song.artist || '').toLowerCase();
    const artistNorm = normalizeSearchText(song.artist || '');
    const artistCompact = compactSearchText(song.artist || '');

    const category = (song.category || '').toLowerCase();
    const categoryNorm = normalizeSearchText(song.category || '');

    const lyrics = (song.lyrics || '').toLowerCase();
    const hindiLyrics = ((song.hindiLyrics || song.hindi_lyrics) || '').toLowerCase();

    let score = 0;

    // 1. Exact & Prefix Matches in Title (Top Priority)
    if (title === query) return 1000;
    if (titleNorm === qNorm) return 950;
    if (titleCompact === qCompact) return 900;

    if (title.startsWith(query)) score = Math.max(score, 800);
    if (titleNorm.startsWith(qNorm)) score = Math.max(score, 750);
    if (titleCompact.startsWith(qCompact)) score = Math.max(score, 700);

    // 2. Substring & Compressed Matches in Title
    if (title.includes(query)) score = Math.max(score, 600);
    if (titleNorm.includes(qNorm)) score = Math.max(score, 550);
    if (titleCompact.includes(qCompact)) score = Math.max(score, 500);

    // 3. Multi-token Title Match with Typo Tolerance
    const titleTokens = titleNorm.split(/\s+/);
    if (qWords.length > 0 && titleTokens.length > 0) {
        let matchedCount = 0;
        let tokenScoreSum = 0;

        for (const qWord of qWords) {
            let bestWordScore = 0;
            for (const tToken of titleTokens) {
                const res = isFuzzyWordMatch(qWord, tToken);
                if (res.match && res.score > bestWordScore) {
                    bestWordScore = res.score;
                }
            }
            if (bestWordScore > 0) {
                matchedCount++;
                tokenScoreSum += bestWordScore;
            }
        }

        if (matchedCount === qWords.length) {
            // All words matched (exact or typo)
            score = Math.max(score, 450 + (tokenScoreSum / qWords.length));
        } else if (matchedCount >= Math.ceil(qWords.length * 0.65) && qWords.length > 1) {
            // Majority of words matched
            score = Math.max(score, 300 + (tokenScoreSum / qWords.length));
        }
    }

    // 4. Artist Match with Typo Tolerance
    const artistTokens = artistNorm.split(/\s+/);
    if (artist === query || artistNorm === qNorm) {
        score = Math.max(score, 400);
    } else if (artist.includes(query) || artistNorm.includes(qNorm)) {
        score = Math.max(score, 320);
    } else if (artistCompact.includes(qCompact)) {
        score = Math.max(score, 300);
    } else if (qWords.length > 0) {
        let artistMatches = 0;
        for (const qWord of qWords) {
            if (artistTokens.some(at => isFuzzyWordMatch(qWord, at).match)) {
                artistMatches++;
            }
        }
        if (artistMatches === qWords.length) {
            score = Math.max(score, 280);
        }
    }

    // 5. Multi-token Title + Artist combination with Typo Tolerance
    if (qWords.length > 1 && score === 0) {
        const fullTokens = [...titleTokens, ...artistTokens];
        const allMatched = qWords.every(qw => fullTokens.some(ft => isFuzzyWordMatch(qw, ft).match));
        if (allMatched) {
            score = Math.max(score, 260);
        }
    }

    // 6. Category match
    if (category && (category === query || categoryNorm === qNorm || category.includes(query))) {
        score = Math.max(score, 220);
    }

    // 7. Lyrics & Hindi Lyrics Match (Forgiving match for lyrics phrases)
    if (lyrics.includes(query) || hindiLyrics.includes(query)) {
        score = Math.max(score, 200);
    } else {
        const lyricsCompact = compactSearchText(lyrics);
        if (qCompact.length >= 4 && lyricsCompact.includes(qCompact)) {
            score = Math.max(score, 180);
        } else if (qWords.length > 1) {
            const matchingWords = qWords.filter(w => w.length > 2 && (lyrics.includes(w) || hindiLyrics.includes(w)));
            if (matchingWords.length === qWords.length) {
                score = Math.max(score, 160);
            } else if (matchingWords.length >= Math.ceil(qWords.length * 0.65)) {
                score = Math.max(score, 100);
            }
        }
    }

    // 8. Overall Title Similarity fallback (for single-word queries with heavy typos)
    if (score === 0 && qWords.length === 1 && qNorm.length >= 3) {
        const dist = damerauLevenshtein(qNorm, titleNorm);
        if (dist <= 2) {
            score = Math.max(score, 120);
        } else {
            const dice = diceSimilarity(qNorm, titleNorm);
            if (dice >= 0.55) {
                score = Math.max(score, 100);
            }
        }
    }

    return score;
}

/**
 * Searches a list of songs with high forgiveness, ranking by relevance score.
 */
export function filterAndRankSongs(songs: Song[], rawQuery: string): Song[] {
    if (!rawQuery || !rawQuery.trim()) return songs;

    const scored: { song: Song; score: number }[] = [];

    for (const song of songs) {
        const score = getSongSearchScore(song, rawQuery);
        if (score > 0) {
            scored.push({ song, score });
        }
    }

    // Sort by highest score first
    scored.sort((a, b) => b.score - a.score);
    return scored.map(item => item.song);
}
