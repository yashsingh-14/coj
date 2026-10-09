import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/worship';

    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';
    const redirectBase = isLocalEnv ? origin : (forwardedHost ? `https://${forwardedHost}` : origin);
    const redirectUrl = `${redirectBase}${next.startsWith('/') ? next : `/${next}`}`;

    const response = NextResponse.redirect(redirectUrl);

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            try {
                                cookieStore.set(name, value, options);
                            } catch {}
                            response.cookies.set(name, value, options);
                        });
                    },
                },
            }
        );

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data?.user) {
            // Ensure profile exists in profiles table
            const user = data.user;
            const userEmail = user.email || '';
            const userName = user.user_metadata?.name || user.user_metadata?.full_name || userEmail.split('@')[0] || 'User';
            const userAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
            const userRole = userEmail === 'ys181544@gmail.com' ? 'admin' : 'user';

            try {
                await supabase.from('profiles').upsert({
                    id: user.id,
                    email: userEmail,
                    name: userName,
                    avatar: userAvatar,
                    role: userRole,
                }, { onConflict: 'id' });
            } catch (e) {
                console.error('Failed to upsert profile on callback:', e);
            }

            try {
                cookieStore.getAll().forEach((c) => {
                    response.cookies.set(c.name, c.value);
                });
            } catch {}

            return response;
        } else {
            console.error('Auth callback exchangeCodeForSession error:', error);
        }
    }

    return NextResponse.redirect(`${redirectBase}/signin?error=auth-code-error`);
}
