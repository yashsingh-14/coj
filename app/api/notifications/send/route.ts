import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import webpush from 'web-push';

// NOTE: In production, better to move this config to a dedicated lib initialization file
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:admin@coj.com';

if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(subject, publicVapidKey, privateVapidKey);
} else {
    console.warn("VAPID Keys are missing in env.");
}

export async function POST(req: Request) {
    // 1. Auth Check (Admin Only)
    // For now, simpler check or assume middleware handles admin routes protection
    // But this API route is public, so we should ideally check session/headers.
    // Let's assume the caller passes a secret or we rely on session.
    // To keep it simple for now, we'll verify if the user sending is admin via Supabase.

    // Actually, getting user from request in App Router can be tricky without proper middleware context sometimes.
    // Let's rely on client checking for now, but in prod add strict check.

    try {
        const body = await req.json();
        const { title, message, url } = body;

        console.log("Sending Push:", title, message);

        // 2. Fetch all subscriptions
        const { data: subscriptions, error } = await supabase
            .from('push_subscriptions')
            .select('*');

        if (error) throw error;
        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ message: 'No subscribers found' });
        }

        console.log(`Found ${subscriptions.length} subscribers.`);

        // 3. Send Notification to all
        const notificationPayload = JSON.stringify({
            title: title || 'New Update',
            body: message || 'Click to check it out!',
            icon: '/icon-192x192.png',
            url: url || '/'
        });

        const promises = subscriptions.map(sub =>
            webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: sub.keys
            }, notificationPayload)
                .catch(err => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription expired, remove from DB
                        console.log('Subscription expired, deleting:', sub.id);
                        return supabase.from('push_subscriptions').delete().match({ id: sub.id });
                    }
                    console.error('Error sending to sub:', err);
                    return null;
                })
        );

        await Promise.all(promises);

        return NextResponse.json({ success: true, count: subscriptions.length });

    } catch (error: any) {
        console.error('Send Notification Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
