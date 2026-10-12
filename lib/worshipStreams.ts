/**
 * Worship Background Music Configuration & Defaults
 * Used across /tools/pad and /admin/background-music
 */

export interface WorshipStreamItem {
    id: string;
    title: string;
    description: string;
    youtubeId: string;
    duration: string;
    mood: string;
    isActive?: boolean;
}

export const DEFAULT_WORSHIP_STREAMS: WorshipStreamItem[] = [
    {
        id: 'stream-1',
        title: 'Peaceful Worship Piano (Alone With God)',
        description: 'Gentle grand piano with warm ambient strings. Perfect peaceful backdrop for preaching, prayer & reflection.',
        youtubeId: 'fOB73qRVGJs', // 3 Hours Alone With God Piano (Verified Embeddable)
        duration: '3 Hours',
        mood: 'Sermon & Preaching',
        isActive: true
    },
    {
        id: 'stream-2',
        title: 'Altar Call & Ministry Flow',
        description: 'Emotional, soaring acoustic worship piano. Ideal for altar call, ministry time & prayer lines.',
        youtubeId: '0V8yNAZZfSE', // 3 Hours Piano Worship (Verified Embeddable)
        duration: '3 Hours',
        mood: 'Altar Call & Prayer',
        isActive: true
    },
    {
        id: 'stream-3',
        title: 'Deep Holy Spirit Presence (In His Presence)',
        description: 'Warm atmospheric pads and continuous soaking instrumental. Non-intrusive, sacred atmosphere.',
        youtubeId: 'XhASEIFbdkI', // In His Presence Soaking Instrumental (Verified Embeddable)
        duration: '3 Hours',
        mood: 'Holy Spirit Presence',
        isActive: true
    },
    {
        id: 'stream-4',
        title: 'Quiet Time with God & Word Reflection',
        description: 'Minimalist church acoustic piano with soft reverb. Keeps the focus purely on the preacher\'s voice.',
        youtubeId: 'vELBkxa-8EQ', // 1 Hour Quiet Time with God (Verified Embeddable)
        duration: '1 Hour',
        mood: 'Reflection & Word',
        isActive: true
    },
    {
        id: 'stream-5',
        title: 'Calm Soaking Prayer & Devotional',
        description: 'Deep meditative prayer tones with gentle melodic swells for private or congregational prayer.',
        youtubeId: '4wZmRQcIDME', // CALM - Soaking worship instrumental (Verified Embeddable)
        duration: '2 Hours',
        mood: 'Prophetic Worship',
        isActive: true
    },
    {
        id: 'stream-6',
        title: 'Modern Hymns Instrumental Flow',
        description: 'Continuous instrumental arrangements of classic Christian worship hymns for extended services.',
        youtubeId: 'DlAZxnpsFdo', // Modern Hymns Instrumental 5 Hours (Verified Embeddable)
        duration: '5 Hours',
        mood: 'Continuous Service',
        isActive: true
    }
];

/**
 * Extracts a clean YouTube Video ID from any format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - VIDEO_ID directly
 */
export function parseYouTubeVideoId(input: string): string | null {
    if (!input) return null;
    const trimmed = input.trim();

    // Already an 11-character video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
    }

    // Standard watch URL: v=VIDEO_ID
    const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (vMatch) return vMatch[1];

    // youtu.be/VIDEO_ID
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    // youtube.com/embed/VIDEO_ID
    const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    // youtube.com/live/VIDEO_ID
    const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
    if (liveMatch) return liveMatch[1];

    // youtube.com/shorts/VIDEO_ID
    const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];

    return null;
}
