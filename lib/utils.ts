import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getSongImage = (song: any) => {
    // 1. YouTube Thumbnail Priority
    const yId = song.youtube_id || song.youtubeId;
    if (yId && yId.trim().length > 5 && yId !== "null" && yId !== "undefined") {
        return `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
    }

    // 2. Custom Image
    if (song.img && song.img.trim().length > 5 && song.img !== "null" && song.img !== "undefined") {
        return song.img;
    }

    // 3. Fallback
    return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80";
};
