import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabaseAdmin';

// Simple in-memory rate limiter to prevent obvious spam bursts
// Note: This is instance-specific. In a multi-instance serverless deployment,
// true global rate limiting requires external infrastructure like Redis.
const rateLimitCache = new Map<string, number>();
const MAX_CACHE_SIZE = 10000;
const RATE_LIMIT_MS = 60000; // 1 minute between submissions per IP

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
        
        if (ip !== 'unknown') {
            const now = Date.now();
            const lastSubmit = rateLimitCache.get(ip);
            
            if (lastSubmit && now - lastSubmit < RATE_LIMIT_MS) {
                return NextResponse.json({ error: 'Please wait a minute before submitting another message.' }, { status: 429 });
            }
            
            if (rateLimitCache.size > MAX_CACHE_SIZE) {
                rateLimitCache.clear();
            }
            rateLimitCache.set(ip, now);
        }

        const rawText = await req.text();
        if (rawText.length > 10000) {
            return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
        }

        let body;
        try {
            body = JSON.parse(rawText);
        } catch {
            return NextResponse.json({ error: 'Malformed request payload' }, { status: 400 });
        }
        
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Malformed request payload' }, { status: 400 });
        }

        const { name, email, phone, message } = body;

        // Validation
        if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
            return NextResponse.json({ error: 'Valid name is required (max 100 characters)' }, { status: 400 });
        }
        if (!message || typeof message !== 'string' || message.trim().length === 0 || message.length > 5000) {
            return NextResponse.json({ error: 'Valid message is required (max 5000 characters)' }, { status: 400 });
        }
        if (email !== undefined && email !== null) {
            if (typeof email !== 'string' || email.length > 255) {
                return NextResponse.json({ error: 'Invalid email length or format' }, { status: 400 });
            }
        }
        if (phone !== undefined && phone !== null) {
            if (typeof phone !== 'string' || phone.length > 50) {
                return NextResponse.json({ error: 'Invalid phone length or format' }, { status: 400 });
            }
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
        }

        const { data, error } = await adminDb
            .from('contact_messages')
            .insert([{
                name: name.trim(),
                email: email && typeof email === 'string' ? email.trim() : null,
                phone: phone && typeof phone === 'string' ? phone.trim() : null,
                message: message.trim(),
            }])
            .select();

        if (error) {
            console.error('Contact API database error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (err: unknown) {
        console.error('Contact API error:', err);
        return NextResponse.json({ error: (err instanceof Error ? err.message : "Unknown error") || 'Internal server error' }, { status: 500 });
    }
}
