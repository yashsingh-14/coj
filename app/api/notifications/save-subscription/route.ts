import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({
                error: "Config Error: Missing Supabase keys"
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const body = await request.json();

        // Get userId from Query Param or body or fallback to null / guest
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || body.userId || null;

        const endpoint = body.endpoint;
        const keys = body.keys;

        if (!endpoint || !keys) {
            return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 });
        }

        const record: any = {
            endpoint,
            keys,
        };

        if (userId) {
            record.user_id = userId;
        }

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert(record, { onConflict: 'endpoint' });

        if (error) {
            console.error("Supabase upsert push_subscriptions error:", error);
            // If user_id has a foreign key constraint that fails with null, fallback without user_id
            if (error.code === '23503' || error.message?.includes('foreign key')) {
                const { error: retryError } = await supabase
                    .from('push_subscriptions')
                    .upsert({ endpoint, keys }, { onConflict: 'endpoint' });
                if (retryError) throw retryError;
            } else {
                throw error;
            }
        }

        return NextResponse.json({ success: true, message: "Subscribed to COJ Live & Ministry Notifications!" });

    } catch (error: any) {
        console.error('Subscription error:', error);
        return NextResponse.json({ error: error.message || 'Failed to save subscription' }, { status: 500 });
    }
}
