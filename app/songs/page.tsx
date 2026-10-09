import { supabaseServer } from '@/lib/supabaseServer';
import { ALL_SONGS } from '@/data/songs';
import SongsListClient from '@/components/songs/SongsListClient';
import { Metadata } from 'next';
import { Song } from '@/data/types';

export const metadata: Metadata = {
    title: 'All Worship Songs & Chords | COJ Worship',
    description: 'Browse all Christian worship songs with chords, lyrics, and guitar tabs in English and Hindi by Call of Jesus Ministries.',
};

export const revalidate = 60; // Instant 1-minute edge cache

export default async function SongsListPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const { category } = await searchParams;

    let songs: Song[] = [];
    try {
        const { data, error } = await supabaseServer
            .from('songs')
            .select('id, title, artist, category, img, is_featured, youtube_id')
            .order('title', { ascending: true });

        if (!error && data && data.length > 0) {
            songs = data as unknown as Song[];
        }
    } catch {
        // Fallback silently
    }

    const initialSongs = songs.length > 0 ? songs : ALL_SONGS;

    return <SongsListClient initialSongs={initialSongs} categoryFilter={category} />;
}
