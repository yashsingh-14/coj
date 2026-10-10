import { Song } from '@/data/types';

/**
 * Accurately determines if a song is in Hindi / Indian Christian worship repertoire.
 */
export function isSongHindi(song: Song): boolean {
    const cat = (song.category || '').toLowerCase().trim();
    if (cat.startsWith('hindi') || cat === 'hindi') return true;
    if (cat.startsWith('english') || cat === 'english') return false;

    const artistLower = (song.artist || '').toLowerCase();
    const titleLower = (song.title || '').toLowerCase();

    // Known English Christian artists & standard titles (even if they have Hindi translation lyrics)
    const englishArtists = /\b(don moen|sinach|hillsong|bethel|matt redman|charity gayle|dennis jernigan|chris tomlin|elevation|housefires|brandon lake|cory asbury|pat barrett|leeland|passion|maverick city|traditional)\b/i;
    const englishTitles = /\b(way maker|god will make a way|i speak jesus|goodness of god|10,000 reasons|oceans|you are my all in all|amazing grace|holy forever|gratitude|jireh|raise a hallelujah|build my life|reckless love|what a beautiful name|great are you lord|king of kings|cornerstone|in christ alone|graves into gardens|canvas and clay)\b/i;

    if (englishArtists.test(artistLower) && !titleLower.includes('(hindi)')) return false;
    if (englishTitles.test(titleLower) && !titleLower.includes('(hindi)')) return false;

    // Check Devanagari script in title
    if (/[\u0900-\u097F]/.test(song.title)) return true;

    // Known Indian Christian artists
    const indianArtists = /\b(ernest mall|bridge music|yeshua band|amit kamble|shelly reddy|steven verma|shirin george|mark tribhuvan|ankur masih|zion music|abc worship|virendra|anil kant|shekhar kalla|samson masih|allen ganta)\b/i;
    if (indianArtists.test(artistLower)) return true;

    // Common Romanized Hindi/Urdu keywords
    const hindiKeywords = /\b(dhanyawad|dhanyavad|yeshu|khuda|aradhana|aaradhana|stuti|pavitra|rooh|chattan|sang tere|hazir|haq tala|rab|lahu|kareeb|khoj|raasta banaye|kuch na tha|tu hi|tera|meri|mere|prabhu|raja|anugrah|bharosa|mukti|shanti|aanand|jivan|jeevan|marg|satya|vijay|krus|paap|swarg|asman|pak|samarth)\b/i;
    if (hindiKeywords.test(titleLower)) return true;

    return false;
}

export function isSongEnglish(song: Song): boolean {
    return !isSongHindi(song);
}

/**
 * Determines the musical genre / category of a song (worship, praise, hymns, kids, contemporary)
 */
export function getSongGenre(song: Song): 'worship' | 'praise' | 'hymns' | 'kids' | 'contemporary' {
    const cat = (song.category || '').toLowerCase().trim();

    if (cat.includes('praise')) return 'praise';
    if (cat.includes('hymn')) return 'hymns';
    if (cat.includes('kid')) return 'kids';
    if (cat.includes('contemporary')) return 'contemporary';
    if (cat.includes('worship')) return 'worship';

    const titleLower = (song.title || '').toLowerCase();
    if (/\b(stuti|dhanyawad|dhanyavad|chattan|praise|gaaoonga)\b/i.test(titleLower)) {
        return 'praise';
    }
    if (/\b(10,000 reasons|amazing grace|cornerstone|in christ alone)\b/i.test(titleLower)) {
        return 'hymns';
    }

    return 'worship';
}

/**
 * Evaluates whether a song matches the target page category slug.
 * Supports granular slugs: english-praise, english-worship, hindi-praise, hindi-worship,
 * as well as broader slugs: praise, worship, hymns, kids, contemporary, hindi, english.
 */
export function matchesCategorySlug(song: Song, targetSlug: string): boolean {
    const slug = (targetSlug || '').toLowerCase().trim();
    if (!slug || slug === 'all') return true;

    const isHindi = isSongHindi(song);
    const isEnglish = !isHindi;
    const genre = getSongGenre(song);

    switch (slug) {
        case 'english-praise':
            return isEnglish && genre === 'praise';

        case 'english-worship':
            return isEnglish && genre === 'worship';

        case 'hindi-praise':
            return isHindi && genre === 'praise';

        case 'hindi-worship':
            return isHindi && genre === 'worship';

        case 'praise':
            return genre === 'praise';

        case 'worship':
            return genre === 'worship';

        case 'hymns':
            return genre === 'hymns';

        case 'kids':
            return genre === 'kids';

        case 'contemporary':
            return genre === 'contemporary';

        case 'hindi':
            return isHindi;

        case 'english':
            return isEnglish;

        default:
            const cat = (song.category || '').toLowerCase();
            return cat.includes(slug) || slug.includes(cat);
    }
}
