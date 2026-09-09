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

export async function updateUserRoleAdmin(userId: string, newRole: string) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const { error } = await adminDb
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

    if (error) {
        console.error("Admin Role Update Error:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function checkIsAdmin(userId: string, userEmail?: string): Promise<{ isAdmin: boolean; error?: string }> {
    if (!adminDb) return { isAdmin: false, error: "Admin Key Context Missing" };

    const normalizedEmail = (userEmail || '').toLowerCase().trim();
    const ADMIN_EMAILS = ['ys181544@gmail.com', 'callofjesus2015@gmail.com'];

    if (normalizedEmail && ADMIN_EMAILS.includes(normalizedEmail)) {
        return { isAdmin: true };
    }

    const { data: profile, error } = await adminDb
        .from('profiles')
        .select('role, email')
        .eq('id', userId)
        .single();

    if (!error && profile) {
        if (profile.role === 'admin') return { isAdmin: true };
        if (profile.email && ADMIN_EMAILS.includes(profile.email.toLowerCase().trim())) {
            return { isAdmin: true };
        }
    }

    if (normalizedEmail) {
        const { data: profileByEmail } = await adminDb
            .from('profiles')
            .select('role')
            .eq('email', normalizedEmail)
            .single();

        if (profileByEmail && profileByEmail.role === 'admin') {
            return { isAdmin: true };
        }
    }

    return { isAdmin: false };
}

export async function getContactMessagesAdmin() {
    if (!adminDb) return { success: false, data: [] };
    const { data, error } = await adminDb
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching contact messages:", error);
        return { success: false, data: [] };
    }
    return { success: true, data: data || [] };
}

export async function deleteContactMessageAdmin(id: string) {
    if (!adminDb) return { success: false };
    const { error } = await adminDb
        .from('contact_messages')
        .delete()
        .eq('id', id);

    return { success: !error };
}

export async function getTestimoniesAdmin() {
    if (!adminDb) return { success: false, data: [] };
    const { data, error } = await adminDb
        .from('testimonies')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching testimonies:", error);
        return { success: false, data: [] };
    }
    return { success: true, data: data || [] };
}

export async function toggleApproveTestimonyAdmin(id: string, currentStatus: boolean) {
    if (!adminDb) return { success: false };
    const { error } = await adminDb
        .from('testimonies')
        .update({ is_approved: !currentStatus })
        .eq('id', id);

    return { success: !error };
}

export async function deleteTestimonyAdmin(id: string) {
    if (!adminDb) return { success: false };
    const { error } = await adminDb
        .from('testimonies')
        .delete()
        .eq('id', id);

    return { success: !error };
}

// ─── EVENTS ACTIONS ──────────────────────────────────────────────

export async function createEventAdmin(payload: any) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const { data, error } = await adminDb
        .from('events')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error("Admin Create Event Error:", error);
        return { success: false, error: error.message };
    }

    await revalidateApp();
    return { success: true, data };
}

export async function updateEventAdmin(eventId: string, payload: any) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const { data, error } = await adminDb
        .from('events')
        .update(payload)
        .eq('id', eventId)
        .select()
        .single();

    if (error) {
        console.error("Admin Update Event Error:", error);
        return { success: false, error: error.message };
    }

    await revalidateApp();
    return { success: true, data };
}

export async function deleteEventAdmin(eventId: string) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const { error } = await adminDb
        .from('events')
        .delete()
        .eq('id', eventId);

    if (error) {
        console.error("Admin Delete Event Error:", error);
        return { success: false, error: error.message };
    }

    await revalidateApp();
    return { success: true };
}

// ─── ARTISTS ACTIONS ─────────────────────────────────────────────

export async function createArtistAdmin(payload: any) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const { data, error } = await adminDb
        .from('artists')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error("Admin Create Artist Error:", error);
        return { success: false, error: error.message, code: error.code };
    }

    await revalidateApp();
    return { success: true, data };
}

export async function updateArtistAdmin(artistId: string, payload: any) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const { data, error } = await adminDb
        .from('artists')
        .update(payload)
        .eq('id', artistId)
        .select()
        .single();

    if (error) {
        console.error("Admin Update Artist Error:", error);
        return { success: false, error: error.message };
    }

    await revalidateApp();
    return { success: true, data };
}

export async function deleteArtistAdmin(artistId: string) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const { error } = await adminDb
        .from('artists')
        .delete()
        .eq('id', artistId);

    if (error) {
        console.error("Admin Delete Artist Error:", error);
        return { success: false, error: error.message };
    }

    await revalidateApp();
    return { success: true };
}

// ─── SITE SETTINGS ACTIONS (HOME, SERMONS, FOOTER/GLOBAL) ────────

export async function updateSiteSettingAdmin(key: string, value: any, description?: string) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const { data, error } = await adminDb
        .from('site_settings')
        .upsert({
            key,
            value,
            description: description || ''
        })
        .select()
        .single();

    if (error) {
        console.error("Admin Site Setting Upsert Error:", error);
        return { success: false, error: error.message };
    }

    await revalidateApp();
    return { success: true, data };
}

// ─── DAILY CONTENT ACTIONS (VERSES & ANNOUNCEMENTS) ──────────────

export async function saveDailyVerseAdmin(payload: { text: string; reference: string; image_url?: string }, dateStr?: string) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const date = dateStr || new Date().toISOString().split('T')[0];

    const { data: existing } = await adminDb.from('daily_verses').select('id').eq('date', date).single();

    let error;
    if (existing) {
        const res = await adminDb.from('daily_verses').update(payload).eq('id', existing.id);
        error = res.error;
    } else {
        const res = await adminDb.from('daily_verses').insert([{ ...payload, date }]);
        error = res.error;
    }

    if (error) {
        console.error("Admin Save Daily Verse Error:", error);
        return { success: false, error: error.message };
    }

    await revalidateApp();
    return { success: true };
}

export async function createAnnouncementAdmin(message: string, title: string = 'Notice') {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const { data, error } = await adminDb
        .from('announcements')
        .insert([{ title, message, is_active: true }])
        .select()
        .single();

    if (error) {
        console.error("Admin Create Announcement Error:", error);
        return { success: false, error: error.message };
    }

    await revalidateApp();
    return { success: true, data };
}

export async function toggleAnnouncementAdmin(id: string, currentStatus: boolean) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const { error } = await adminDb
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id);

    if (error) {
        console.error("Admin Toggle Announcement Error:", error);
        return { success: false, error: error.message };
    }

    await revalidateApp();
    return { success: true };
}

export async function deleteAnnouncementAdmin(id: string) {
    if (!adminDb) return { success: false, error: "Admin Key Context Missing" };

    const { error } = await adminDb
        .from('announcements')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Admin Delete Announcement Error:", error);
        return { success: false, error: error.message };
    }

    await revalidateApp();
    return { success: true };
}

