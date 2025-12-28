import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

// Initialize Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Web Push
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@coj.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const title = searchParams.get('title') || 'Test Notification';
        const body = searchParams.get('body') || 'This is a test message from COJ Backend';
        const url = searchParams.get('url') || '/';

        // Fetch all subscriptions (In production, filter by user or topic)
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*');

        if (error) throw error;

        let successCount = 0;
        let failureCount = 0;

        const payload = JSON.stringify({ title, body, url });

        const promises = subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification(sub.keys ? { endpoint: sub.endpoint, keys: sub.keys } : { endpoint: sub.endpoint, keys: sub.keys }, payload);
                successCount++;
            } catch (err) {
                console.error('Failed to send to', sub.id, err);
                failureCount++;
                // Optional: Delete invalid subscriptions
                if (err.statusCode === 410) {
                    await supabase.from('push_subscriptions').delete().eq('id', sub.id);
                }
            }
        });

        await Promise.all(promises);

        return NextResponse.json({
            success: true,
            sent: successCount,
            failed: failureCount,
            message: `Sent to ${successCount} devices`
        });

    } catch (error) {
        console.error('Send error:', error);
        return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 });
    }
}
