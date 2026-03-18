/**
 * SEO Utility Functions
 * Generates SEO-friendly slugs and canonical URLs for songs.
 */

const SITE_URL = 'https://callofjesus.in';

/**
 * Converts a song title to a URL-safe slug.
 * e.g. "Tu Hai Chattan (You Are My Rock)" → "tu-hai-chattan-you-are-my-rock"
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Collapse multiple hyphens
        .replace(/^-|-$/g, '');   // Trim leading/trailing hyphens
}

/**
 * Returns the SEO-friendly URL path for a song.
 */
export function getSongUrl(song: { id: string; title: string }): string {
    return `/songs/${generateSlug(song.title)}`;
}

/**
 * Returns the full canonical URL for a song.
 */
export function getSongCanonicalUrl(song: { id: string; title: string }): string {
    return `${SITE_URL}${getSongUrl(song)}`;
}

export { SITE_URL };
