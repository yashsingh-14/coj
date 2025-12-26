'use server';

import { adminDb } from '@/lib/supabaseAdmin';
import { revalidateApp } from './revalidate';

export async function updateSongAdmin(songId: string, payload: any) {
    if (!adminDb) {
        throw new Error("Server Error: Admin Key missing. Cannot bypass RLS.");
    }

    const { data, error } = await adminDb
        .from('songs')
        .update(payload)
        .eq('id', songId)
        .select()
        .single();

    if (error) {
        console.error("Admin Update Error:", error);
        throw new Error(error.message);
    }

    await revalidateApp();
    return data;
}

export async function createSongAdmin(payload: any) {
    if (!adminDb) {
        throw new Error("Server Error: Admin Key missing. Cannot bypass RLS.");
    }

    const { data, error } = await adminDb
        .from('songs')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error("Admin Create Error:", error);
        throw new Error(error.message);
    }

    await revalidateApp();
    return data;
}
