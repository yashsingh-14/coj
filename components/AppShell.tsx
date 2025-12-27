'use client';

import Link from 'next/link';
import BottomNav from '@/components/ui/BottomNav';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { mode, login, logout } = useAppStore();

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
    }, [login, logout]);

    // Show BottomNav if:
    // 1. We are NOT on home page (utility pages always need nav)
    // 2. OR We are on home page AND mode is UTILITY
    const showNav = pathname !== '/' || mode === 'UTILITY';

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
