import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookieOptions: {
                maxAge: 400 * 24 * 60 * 60,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, {
                            ...options,
                            maxAge: 400 * 24 * 60 * 60,
                            sameSite: 'lax',
                            path: '/',
                            secure: process.env.NODE_ENV === 'production',
                        })
                    )
                },
            },
        }
    )

    // IMPORTANT: getUser() refreshes auth token if expired and sets new cookies
    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname;

    // Protected Routes: Only strictly server-gated routes like /admin
    // (Note: /profile manages its own client-side authentication via Zustand and local session)
    const isProtectedRoute = 
        pathname.startsWith('/admin') || 
        pathname === '/sets/new';

    if (isProtectedRoute && !user) {
        // Redirect to sign in, with redirect parameter
        const url = new URL('/signin', request.url);
        url.searchParams.set('redirect', pathname);
        const redirectResponse = NextResponse.redirect(url);
        
        // Ensure any refreshed cookies are carried over to redirect with persistent maxAge
        supabaseResponse.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value, {
                maxAge: 400 * 24 * 60 * 60,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            });
        });

        return redirectResponse;
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
