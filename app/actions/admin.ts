'use server';

import { adminDb } from '@/lib/supabaseAdmin';
import { revalidateApp } from './revalidate';

export async function updateSongAdmin(songId: string, payload: any) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const { data, error } = await adminDb
        .from('songs')
        .update(payload)
        .eq('id', songId)
        .select()
        .single();

    if (error) {
        console.error("Admin Update Error:", error);
        return { success: false, error: error.message };
    }

    await revalidateApp();
    return { success: true, data };
}

export async function createSongAdmin(payload: any) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    console.log("SERVER: Received Song Payload:", JSON.stringify(payload, null, 2));

    const { data, error } = await adminDb
        .from('songs')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error("Admin Create Error:", error);
        return { success: false, error: error.message };
    }

    await revalidateApp();
    return { success: true, data };
}

export async function deleteSongAdmin(songId: string) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const { error } = await adminDb
        .from('songs')
        .delete()
        .eq('id', songId);

    if (error) {
        console.error("Admin Delete Error:", error);
        return { success: false, error: error.message };
    }

    await revalidateApp();
    return { success: true };
}

export async function checkConnection() {
    if (!adminDb) return { ok: false, error: "Admin Key Missing" };
    try {
        const { count, error } = await adminDb.from('songs').select('count', { count: 'exact', head: true });
        if (error) throw error;
        return { ok: true, count };
    } catch (error: any) {
        return { ok: false, error: error.message };
    }
}
