import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { ALL_SONGS } from '@/data/songs';

export const revalidate = 60; // Cache on edge/server for 60 seconds

export async function GET() {
    try {
        const { data, error } = await supabaseServer
            .from('songs')
            .select('id, title, artist, category, img, is_featured, hindi_lyrics, chords, tempo, key, youtube_id')
            .order('title', { ascending: true });

        if (error || !data || data.length === 0) {
            return NextResponse.json({ songs: ALL_SONGS, count: ALL_SONGS.length });
        }

        return NextResponse.json({ songs: data, count: data.length });
    } catch {
        return NextResponse.json({ songs: ALL_SONGS, count: ALL_SONGS.length });
    }
}
