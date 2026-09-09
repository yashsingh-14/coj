import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

// Initialize Supabase Admin client with Service Role Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Initialize Web Push VAPID details
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@coj.com';

if (vapidPublicKey && vapidPrivateKey) {
    try {
        webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    } catch (e) {
        console.error('Failed to set VAPID details:', e);
    }
}

interface NotificationPayload {
    title: string;
    body: string;
    url?: string;
    icon?: string;
    badge?: string;
    tag?: string;
}

async function sendBroadcast(payload: NotificationPayload) {
    if (!vapidPublicKey || !vapidPrivateKey) {
        throw new Error('VAPID keys not configured in environment');
    }

    // Fetch all active device subscriptions
    const { data: subscriptions, error } = await supabase
        .from('push_subscriptions')
        .select('*');

    if (error) {
        console.error('Supabase fetch push_subscriptions error:', error);
        throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
        return {
            success: true,
            sent: 0,
            failed: 0,
            total: 0,
            message: 'No subscribers registered yet'
        };
    }

    let successCount = 0;
    let failureCount = 0;
    const expiredIds: string[] = [];

    const stringifiedPayload = JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || '/',
        icon: payload.icon || '/images/logo-footer-final.png',
        badge: payload.badge || '/images/logo-footer-final.png',
        tag: payload.tag || 'coj-broadcast',
    });

    const sendPromises = subscriptions.map(async (sub) => {
        try {
            const pushSub = {
                endpoint: sub.endpoint,
                keys: sub.keys
            };
            await webpush.sendNotification(pushSub, stringifiedPayload);
            successCount++;
        } catch (err: any) {
            failureCount++;
            // 410 Gone or 404 Not Found means device unregistered or uninstalled
            if (err?.statusCode === 410 || err?.statusCode === 404) {
                if (sub.id) expiredIds.push(sub.id);
            }
        }
    });

    await Promise.allSettled(sendPromises);

    // Clean up expired tokens in background
    if (expiredIds.length > 0) {
        (async () => {
            try {
                const { error: deleteError } = await supabase
                    .from('push_subscriptions')
                    .delete()
                    .in('id', expiredIds);
                if (deleteError) {
                    console.error('Error cleaning expired subscriptions:', deleteError);
                } else {
                    console.log(`Cleaned up ${expiredIds.length} expired subscriptions`);
                }
            } catch (err) {
                console.error('Error cleaning expired subscriptions:', err);
            }
        })();
    }

    return {
        success: true,
        sent: successCount,
        count: successCount,
        failed: failureCount,
        total: subscriptions.length,
        message: `Sent to ${successCount} devices (${failureCount} failed)`
    };
}

// ─── POST Handler (Admin UI & Webhooks) ───
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const title = body.title || 'Call of Jesus Ministries';
        const message = body.message || body.body || 'New update from Call of Jesus Ministries!';
        const url = body.url || '/';
        const tag = body.tag || (body.type ? `coj-${body.type}` : 'coj-live');

        const result = await sendBroadcast({
            title,
            body: message,
            url,
            tag
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Send POST error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send notifications' },
            { status: 500 }
        );
    }
}

// ─── GET Handler (Quick test or query params) ───
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const title = searchParams.get('title') || 'Call of Jesus Ministries';
        const message = searchParams.get('message') || searchParams.get('body') || 'New update from Call of Jesus!';
        const url = searchParams.get('url') || '/';

        const result = await sendBroadcast({
            title,
            body: message,
            url
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Send GET error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send notifications' },
            { status: 500 }
        );
    }
}
