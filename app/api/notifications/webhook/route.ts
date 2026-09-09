import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const platform = (body.platform || 'general').toLowerCase();
        const type = (body.type || 'update').toLowerCase();

        let defaultTitle = 'Call of Jesus Ministries Update';
        let defaultBody = 'New update from Call of Jesus Ministries.';
        let defaultUrl = '/';

        if (platform === 'youtube') {
            defaultTitle = type === 'live'
                ? '🔴 CALL OF JESUS IS LIVE NOW!'
                : '🎬 New Video from Call of Jesus Ministries';
            defaultBody = type === 'live'
                ? 'Worship Service & Word of God is live on YouTube. Tune in to receive your breakthrough!'
                : 'Watch the latest anointed sermon and worship release on YouTube.';
            defaultUrl = 'https://www.youtube.com/@cojministries/live';
        } else if (platform === 'facebook') {
            defaultTitle = type === 'live'
                ? '🔵 FACEBOOK LIVE: Join the Service Now!'
                : '🔵 New Update on Facebook';
            defaultBody = type === 'live'
                ? 'We are streaming live right now on Facebook. Join the fellowship!'
                : 'Check out the latest post and photos on our Facebook page.';
            defaultUrl = 'https://www.facebook.com/COJMinistries/live';
        } else if (platform === 'instagram') {
            defaultTitle = '📸 New Post from Call of Jesus';
            defaultBody = 'Check out our latest prophetic word, testimony, and reels on Instagram!';
            defaultUrl = 'https://www.instagram.com/cojministries';
        } else if (platform === 'whatsapp') {
            defaultTitle = '🟢 Call of Jesus Ministry Announcement';
            defaultBody = 'Important news update and prayer points from Call of Jesus Ministries.';
            defaultUrl = '/';
        }

        const title = body.title || defaultTitle;
        const message = body.message || body.body || defaultBody;
        const url = body.url || defaultUrl;

        // Forward to our internal send route
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://callofjesus.in';
        const sendUrl = `${request.headers.get('origin') || baseUrl}/api/notifications/send`;

        const sendResponse = await fetch(sendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                message,
                url,
                tag: `coj-${platform}-${type}`
            })
        });

        const data = await sendResponse.json();

        return NextResponse.json({
            success: true,
            platform,
            type,
            broadcastResult: data
        });

    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: error.message || 'Webhook failed' }, { status: 500 });
    }
}
