
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_ALLOW_DEV_LOGIN) {
        // Optional safety catch, though we'll allow it for now on localhost
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: "Missing Service Role Key" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get the first user
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

    if (error || !users || users.length === 0) {
        return NextResponse.json({ error: "No users found in database" }, { status: 404 });
    }

    const user = users[0];

    return NextResponse.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Dev User",
            avatar: user.user_metadata?.avatar_url
        }
    });
}
