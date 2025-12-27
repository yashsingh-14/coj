import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
    try {
        const subscription = await req.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
        }

        // Check if already exists (optional, or rely on unique constraint on endpoint)
        // We'll just insert/ignore or insert
        // Supabase/Postgres specific: "ON CONFLICT DO NOTHING" logic if endpoint is unique

        // Since we enabled RLS allowing insert, we can use the client. 
        // Ideally we associate with user_id if logged in, but for now anonymous is fine too.

        // We need auth header to associate user? Or passed in body?
        // Let's assume anonymous for now or handle via session if available.

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                endpoint: subscription.endpoint,
                keys: subscription.keys,
                // user_id: session?.user?.id 
            }, { onConflict: 'endpoint' });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Subscription Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
