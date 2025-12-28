
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        console.log("SUBSCRIBE-FINAL: Logic Start");

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error("Missing Env Vars");
            return NextResponse.json({
                error: "Config Error: Missing Service Role Key (Server Side)"
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey);

        const subscription = await request.json();

        // Get userId from Query Param
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            console.error("Missing UserID in Query Param");
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        console.log(`Saving subscription for User: ${userId}`);

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: userId,
                endpoint: subscription.endpoint,
                keys: subscription.keys
            }, { onConflict: 'endpoint' });

        if (error) {
            console.error("Supabase upsert error:", error);
            throw error;
        }

        console.log("Subscription Saved Successfully");
        return NextResponse.json({ success: true, message: "Subscription Saved to Notification DB" });

    } catch (error: any) {
        console.error('Subscription error:', error);
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
    }
}
