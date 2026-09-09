'use client';

import Link from 'next/link';
import BottomNav from '@/components/ui/BottomNav';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const login = useAppStore(state => state.login);
    const logout = useAppStore(state => state.logout);
    const mode = useAppStore(state => state.mode);

    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Helper to get user data with role
        const getUserData = async (user: any) => {
            let role = 'user';
            // Hardcode Admin Access for Owner (Immediate Access)
            if (user.email === 'ys181544@gmail.com') role = 'admin';

            // Try fetching role from DB (fails silently if missing)
            try {
                const { data } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
                if (data?.role) role = data.role;
            } catch (e) { }

            return {
                id: user.id,
                name: user.user_metadata.name || user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
                email: user.email || '',
                avatar: user.user_metadata.avatar_url || user.user_metadata.picture,
                role
            };
        };

        // 1. Check active session on mount
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const userData = await getUserData(session.user);
                login(userData);
            }
            setIsReady(true);
        };
        initSession();

        // 2. Listen for auth changes (Sign In, Sign Out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const userData = await getUserData(session.user);
                login(userData);
            } else {
                logout();
            }
        });

        return () => subscription.unsubscribe();
    }, []); // Empty dependency array to run only once on mount

    // 3. Sync Theme with Body
    const theme = useAppStore(state => state.preferences.theme);
    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    }, [theme]);

    // Show BottomNav ONLY on utility routes (songs, search, favourites, profile, sets, worship)
    // or on home page when mode is UTILITY. Never show on landing pages like /give.
    const isUtilityRoute = pathname === '/songs' || pathname?.startsWith('/songs/') ||
        pathname === '/search' || pathname?.startsWith('/search/') ||
        pathname === '/favourites' || pathname?.startsWith('/favourites/') ||
        pathname === '/profile' || pathname?.startsWith('/profile/') ||
        pathname === '/sets' || pathname?.startsWith('/sets/') ||
        pathname === '/worship' || pathname?.startsWith('/worship/') ||
        pathname === '/tools' || pathname?.startsWith('/tools/') ||
        pathname === '/categories' || pathname?.startsWith('/categories/') ||
        pathname === '/artists' || pathname?.startsWith('/artists/') ||
        pathname === '/trending' || pathname?.startsWith('/trending/');

    const isLandingOrPublic = pathname === '/give' || pathname?.startsWith('/give/') ||
        pathname === '/contact' || pathname?.startsWith('/contact/') ||
        pathname === '/events' || pathname?.startsWith('/events/') ||
        pathname === '/about' || pathname?.startsWith('/about/') ||
        pathname?.startsWith('/our-');

    const showNav = isReady && !isLandingOrPublic && (isUtilityRoute || (pathname === '/' && mode === 'UTILITY'));

    return (
        <>
            <div className={showNav ? 'pb-24' : ''}>
                {children}
            </div>

            <div className={`transition-transform duration-500 ease-in-out ${showNav ? 'translate-y-0' : 'translate-y-full'}`}>
                <BottomNav />
            </div>
        </>
    );
}
