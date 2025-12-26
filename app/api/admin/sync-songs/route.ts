
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ALL_SONGS } from '@/data/songs';

export const dynamic = 'force-dynamic';

export async function GET() {
    const results = {
        total: ALL_SONGS.length,
        inserted: 0,
        skipped: 0,
        errors: [] as string[]
    };

    for (const song of ALL_SONGS) {
        // Check if exists (fuzzy match on title)
        const { data: existing, error: searchError } = await supabase
            .from('songs')
            .select('id')
            .ilike('title', song.title) // Exact-ish match
            .maybeSingle();

        if (searchError) {
            results.errors.push(`Search error for ${song.title}: ${searchError.message}`);
            continue;
        }

        if (existing) {
            results.skipped++;
        } else {
            // Insert
            const { error: insertError } = await supabase
                .from('songs')
                .insert([{
                    title: song.title,
                    artist: song.artist,
                    category: song.category,
                    key: song.key,
                    tempo: song.tempo,
                    youtube_id: song.youtubeId || song.youtube_id,
                    img: song.img,
                    lyrics: song.lyrics,
                    hindi_lyrics: song.hindiLyrics || song.hindi_lyrics, // Normalize
                    chords: song.chords
                }]);

            if (insertError) {
                results.errors.push(`Insert failed for ${song.title}: ${insertError.message}`);
            } else {
                results.inserted++;
            }
        }
    }

    return NextResponse.json(results);
}
