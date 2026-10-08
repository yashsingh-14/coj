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
                return NextResponse.json({ error: 'Please wait a minute before submitting another testimony.' }, { status: 429 });
            }
            
            if (rateLimitCache.size > MAX_CACHE_SIZE) {
                rateLimitCache.clear();
            }
            rateLimitCache.set(ip, now);
        }

        const body = await req.json();
        
        // Strict Payload Validation
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Malformed request payload' }, { status: 400 });
        }

        const name = body.name || body.fullName || body.full_name;
        const story = body.story || body.testimony;
        const email = body.email;
        const phone = body.phone;
        const city = body.city;
        const category = body.category;
        const title = body.title || (category ? `${category} Testimony` : 'God Story Testimony');
        const is_anonymous = Boolean(body.is_anonymous || body.isAnonymous);
        const allow_sharing = body.allow_sharing !== undefined ? Boolean(body.allow_sharing) : true;

        if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
            return NextResponse.json({ error: 'Valid name is required (max 100 characters)' }, { status: 400 });
        }

        if (!story || typeof story !== 'string' || story.trim().length === 0 || story.length > 5000) {
            return NextResponse.json({ error: 'Valid testimony is required (max 5000 characters)' }, { status: 400 });
        }
        
        if (email && (typeof email !== 'string' || email.length > 255)) {
            return NextResponse.json({ error: 'Email exceeds maximum length' }, { status: 400 });
        }
        
        if (phone && (typeof phone !== 'string' || phone.length > 50)) {
            return NextResponse.json({ error: 'Phone exceeds maximum length' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
        }

        const { data, error } = await adminDb
            .from('testimonies')
            .insert([{
                name,
                email: email || null,
                phone: phone || null,
                city: city || null,
                category: category || null,
                title: title || null,
                story,
                is_anonymous,
                allow_sharing,
                is_approved: false
            }])
            .select();

        if (error) {
            console.error('Testimonies API database error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (err: unknown) {
        console.error('Testimonies API error:', err);
        return NextResponse.json({ error: (err instanceof Error ? err.message : "Unknown error") || 'Internal server error' }, { status: 500 });
    }
}
