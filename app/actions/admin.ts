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

export async function syncUsersAdminV3() {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    try {
        console.log("SERVER: Starting User Sync V3...");

        // 1. Fetch all users from Auth
        const { data: { users }, error: authError } = await adminDb.auth.admin.listUsers({ page: 1, perPage: 1000 });

        if (authError) {
            console.error("SERVER: Auth List Error:", authError);
            throw authError;
        }

        if (!users || users.length === 0) return { success: true, message: "No users in Auth" };

        console.log(`SERVER: Found ${users.length} users in Auth. Syncing V3...`);

        let syncedCount = 0;
        let errors = 0;
        let firstError = '';

        // 2. Upsert into Profiles
        // EXTREMELY MINIMAL PAYLOAD to debug schema issue
        for (const user of users) {
            // Try to construct payload WITHOUT ignoring anything, just specific fields
            const payload = {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || 'Unknown'
            };

            console.log(`SERVER: Upserting payload for ${user.email}:`, JSON.stringify(payload));

            // Explicitly selecting 'id' to avoid getting return data that might contain missing columns?
            const { error: upsertError } = await adminDb
                .from('profiles')
                .upsert(payload, { onConflict: 'id' })
                .select('id');

            if (upsertError) {
                console.error(`SERVER: Failed to sync user ${user.email}:`, upsertError);
                if (errors === 0) firstError = upsertError.message;
                errors++;
            } else {
                syncedCount++;
            }
        }

        await revalidateApp();

        let msg = `Found ${users.length} users. Synced ${syncedCount}. (Errors: ${errors})`;
        if (errors > 0) {
            msg += `. First Error: ${firstError}`;
        }

        return { success: true, message: msg };

    } catch (error: any) {
        console.error("Sync Users Critical Error:", error);
        return { success: false, error: error.message };
    }
}
