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
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: getUser() refreshes auth token if expired and sets new cookies
    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname;

    // Protected Routes
    const isProtectedRoute = 
        pathname.startsWith('/profile') || 
        pathname.startsWith('/admin') || 
        pathname === '/sets/new';

    if (isProtectedRoute && !user) {
        // Redirect to sign in, with redirect parameter
        const url = new URL('/signin', request.url);
        url.searchParams.set('redirect', pathname);
        const redirectResponse = NextResponse.redirect(url);
        
        // Ensure any refreshed cookies are carried over to redirect
        supabaseResponse.cookies.getAll().forEach(cookie => {
            redirectResponse.cookies.set(cookie.name, cookie.value);
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
