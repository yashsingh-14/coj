'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { adminDb } from '@/lib/supabaseAdmin';

async function getAuthServer() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
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
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
}

export async function addSongToSetServer(setId: string, songId: string) {
    if (!adminDb) return { success: false, error: 'Admin DB not configured' };
    const { user } = await getAuthServer();
    if (!user) return { success: false, error: 'Unauthorized' };

    // Verify Set Ownership
    const { data: set, error: setError } = await adminDb
        .from('sets')
        .select('created_by')
        .eq('id', setId)
        .single();

    if (setError || !set) return { success: false, error: 'Set not found' };
    if (set.created_by !== user.id) return { success: false, error: 'Unauthorized: You do not own this set.' };

    // Get current count
    const { count } = await adminDb
        .from('set_songs')
        .select('*', { count: 'exact', head: true })
        .eq('set_id', setId);

    const nextOrder = (count || 0) + 1;

    const { error } = await adminDb
        .from('set_songs')
        .insert({
            set_id: setId,
            song_id: songId,
            order_index: nextOrder
        });

    if (error) return { success: false, error: error.message };
    return { success: true };
}

export async function removeSongFromSetServer(junctionId: string) {
    if (!adminDb) return { success: false, error: 'Admin DB not configured' };
    const { user } = await getAuthServer();
    if (!user) return { success: false, error: 'Unauthorized' };

    // Verify Set Ownership via Junction Table
    const { data: junction, error: fetchError } = await adminDb
        .from('set_songs')
        .select('set_id, sets (created_by)')
        .eq('id', junctionId)
        .single();

    if (fetchError || !junction) return { success: false, error: 'Song in set not found' };

    const createdBy = (junction.sets as unknown as { created_by: string })?.created_by;

    if (createdBy !== user.id) {
        return { success: false, error: 'Unauthorized: You do not own this set.' };
    }

    const { error } = await adminDb
        .from('set_songs')
        .delete()
        .eq('id', junctionId);

    if (error) return { success: false, error: error.message };
    return { success: true };
}
