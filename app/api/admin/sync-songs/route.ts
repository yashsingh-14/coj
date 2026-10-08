import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ALL_SONGS } from '@/data/songs';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkIsAdmin } from '@/app/actions/admin';

export const dynamic = 'force-dynamic';

async function verifyAdminAuthServer() {
    try {
        const cookieStore = await cookies();
        const supabaseSSR = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || '',
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            {
                cookies: {
                    get(name) {
                        return cookieStore.get(name)?.value;
                    }
                }
            }
        );

        const { data: { user }, error } = await supabaseSSR.auth.getUser();
        if (error || !user) return { isAuthenticated: false, isAdmin: false };

        const { isAdmin } = await checkIsAdmin(user.id, user.email);
        return { isAuthenticated: true, isAdmin };
    } catch (e) {
        return { isAuthenticated: false, isAdmin: false };
    }
}

export async function POST() {
    const authStatus = await verifyAdminAuthServer();
    
    if (!authStatus.isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!authStatus.isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
