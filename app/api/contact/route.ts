import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, message } = body;

        if (!name || !message) {
            return NextResponse.json({ error: 'Name and message are required' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Database service unavailable' }, { status: 500 });
        }

        const { data, error } = await adminDb
            .from('contact_messages')
            .insert([{
                name,
                email: email || null,
                phone: phone || null,
                message,
            }])
            .select();

        if (error) {
            console.error('Contact API database error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (err: any) {
        console.error('Contact API error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
