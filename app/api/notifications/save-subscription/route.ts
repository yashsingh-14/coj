import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

async function getAuthUser() {
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
        if (error || !user) return null;

        return user;
    } catch (e) {
        return null;
    }
}

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
        
        // Validate request body limits
        const textBody = await request.text();
        if (textBody.length > 5000) {
            return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
        }
        
        let body;
        try {
            body = JSON.parse(textBody);
        } catch (e) {
            return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
        }

        // Get authenticated user instead of trusting client
        const authUser = await getAuthUser();
        const authenticatedUserId = authUser?.id || null;

        const endpoint = body.endpoint;
        const keys = body.keys;

        if (!endpoint || typeof endpoint !== 'string' || !endpoint.startsWith('https://')) {
            return NextResponse.json({ error: 'Invalid subscription endpoint' }, { status: 400 });
        }
        
        if (!keys || typeof keys !== 'object' || typeof keys.p256dh !== 'string' || typeof keys.auth !== 'string') {
            return NextResponse.json({ error: 'Invalid subscription keys' }, { status: 400 });
        }
        
        if (endpoint.length > 1000 || keys.p256dh.length > 200 || keys.auth.length > 100) {
             return NextResponse.json({ error: 'Subscription fields exceed length limits' }, { status: 400 });
        }

        const record: { endpoint: string; keys: { p256dh: string; auth: string }; user_id?: string } = {
            endpoint,
            keys: { p256dh: keys.p256dh, auth: keys.auth },
        };

        if (authenticatedUserId) {
            record.user_id = authenticatedUserId;
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
                    .upsert({ endpoint, keys: record.keys }, { onConflict: 'endpoint' });
                if (retryError) throw retryError;
            } else {
                throw error;
            }
        }

        return NextResponse.json({ success: true, message: "Subscribed to COJ Live & Ministry Notifications!" });

    } catch (error: unknown) {
        console.error('Subscription error:', error);
        return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") || 'Failed to save subscription' }, { status: 500 });
    }
}
