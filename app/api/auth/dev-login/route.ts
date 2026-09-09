import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: "Missing Service Role Key" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Generate magic link token for admin (ys181544@gmail.com)
    const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: 'ys181544@gmail.com'
    });

    if (error || !data) {
        return NextResponse.json({ error: error?.message || "Failed to generate admin login" }, { status: 500 });
    }

    return NextResponse.json({
        token_hash: data.properties?.hashed_token,
        email: 'ys181544@gmail.com'
    });
}
