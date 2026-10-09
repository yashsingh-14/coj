import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Extracts clean 11-character YouTube video ID from direct ID or full YouTube URL
 * Examples supported:
 * - ocgm5MCe8Cw
 * - https://www.youtube.com/watch?v=ocgm5MCe8Cw
 * - https://youtu.be/ocgm5MCe8Cw
 * - https://www.youtube.com/embed/ocgm5MCe8Cw
 * - https://www.youtube.com/shorts/ocgm5MCe8Cw
 */
export function extractYoutubeId(urlOrId?: string | null): string {
    if (!urlOrId || typeof urlOrId !== 'string') return '';
    const trimmed = urlOrId.trim();
    if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '';

    // Already an 11-character standard YouTube ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
    }

    // Match standard YouTube URL patterns
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (match && match[1]) {
        return match[1];
    }

    return trimmed;
}

/**
 * Resolves song image URL with priority:
 * 1. YouTube Thumbnail (if YouTube ID exists, automatically preferred)
 * 2. Custom Image (if non-empty and not generic Unsplash placeholder)
 * 3. Fallback worship placeholder
 */
export const getSongImage = (
    song?: { youtube_id?: string | null; youtubeId?: string | null; img?: string | null } | null
): string => {
    if (!song) {
        return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80";
    }

    // 1. YouTube Thumbnail Priority
    const rawYt = song.youtube_id || song.youtubeId;
    const cleanYt = extractYoutubeId(rawYt);
    if (cleanYt && cleanYt.length >= 6) {
        return `https://img.youtube.com/vi/${cleanYt}/hqdefault.jpg`;
    }

    // 2. Custom Image (if present and not null/undefined/empty)
    if (song.img && song.img.trim().length > 5 && song.img !== "null" && song.img !== "undefined") {
        return song.img;
    }

    // 3. Fallback
    return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80";
};
