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

export async function syncUsersAdmin() {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    try {
        console.log("SERVER: Starting User Sync...");

        // 1. Fetch all users from Auth (Service Role required)
        const { data: { users }, error: authError } = await adminDb.auth.admin.listUsers({ page: 1, perPage: 1000 });

        if (authError) {
            console.error("SERVER: Auth List Error:", authError);
            throw authError;
        }

        if (!users || users.length === 0) {
            console.log("SERVER: No users found in Auth.");
            return { success: true, message: "No users found in Auth database." };
        }

        console.log(`SERVER: Found ${users.length} users in Auth. Syncing...`);

        let syncedCount = 0;
        let errors = 0;

        // 2. Upsert into Profiles
        for (const user of users) {
            const { error: upsertError } = await adminDb
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown',
                    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
                    updated_at: new Date().toISOString(),
                }, { onConflict: 'id' });

            if (upsertError) {
                console.error(`SERVER: Failed to sync user ${user.email}:`, upsertError);
                errors++;
            } else {
                syncedCount++;
            }
        }

        await revalidateApp();
        return { success: true, message: `Found ${users.length} users. Synced ${syncedCount}. (Errors: ${errors})` };

    } catch (error: any) {
        console.error("Sync Users Error:", error);
        return { success: false, error: error.message };
    }
}
