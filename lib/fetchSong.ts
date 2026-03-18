import { cache } from 'react';
import { supabaseServer } from '@/lib/supabaseServer';
import { ALL_SONGS } from '@/data/songs';

/**
 * Cached song fetcher — shared between generateMetadata() and SongPage().
 * React's cache() ensures only ONE database call per request, even if called twice.
 */
export const fetchSongBySlug = cache(async (slug: string) => {
    // 1. Check if UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    if (isUuid) {
        const { data } = await supabaseServer.from('songs').select('*').eq('id', slug).single();
        return data;
    }

    // 2. Exact Title Match (e.g. way-maker -> Way Maker)
    const titleQuery = slug.replace(/-/g, ' ');
    const { data } = await supabaseServer.from('songs').select('*').ilike('title', titleQuery).single();
    if (data) return data;

    // 3. Wildcard Search
    const { data: backup } = await supabaseServer.from('songs').select('*').ilike('title', `%${titleQuery}%`).limit(1).single();
    if (backup) return backup;

    // 4. FINAL FALLBACK: Static Data (ALL_SONGS)
    const staticSong = ALL_SONGS.find(s =>
        s.id === slug ||
        s.title.toLowerCase() === titleQuery.toLowerCase() ||
        s.title.toLowerCase().includes(titleQuery.toLowerCase())
    );

    if (staticSong) {
        return {
            id: staticSong.id,
            title: staticSong.title,
            artist: staticSong.artist,
            category: staticSong.category,
            key: staticSong.key,
            tempo: staticSong.tempo,
            lyrics: staticSong.lyrics,
            hindi_lyrics: staticSong.hindiLyrics,
            chords: staticSong.chords,
            youtube_id: staticSong.youtubeId,
            img: staticSong.img
        };
    }

    return null;
});
