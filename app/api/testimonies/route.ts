import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const name = body.name || body.fullName || body.full_name;
        const story = body.story || body.testimony;
        const email = body.email;
        const phone = body.phone;
        const city = body.city;
        const category = body.category;
        const title = body.title || (category ? `${category} Testimony` : 'God Story Testimony');
        const is_anonymous = Boolean(body.is_anonymous || body.isAnonymous);
        const allow_sharing = body.allow_sharing !== undefined ? Boolean(body.allow_sharing) : true;

        if (!name || !story) {
            return NextResponse.json({ error: 'Name and story/testimony are required' }, { status: 400 });
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
    } catch (err: any) {
        console.error('Testimonies API error:', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
