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
        // 1. Check active session on mount
        const initSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                login({
                    id: session.user.id,
                    name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
                    email: session.user.email || '',
                    avatar: session.user.user_metadata.avatar_url
                });
            }
        };
        initSession();

        // 2. Listen for auth changes (Sign In, Sign Out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                login({
                    id: session.user.id,
                    name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
                    email: session.user.email || '',
                    avatar: session.user.user_metadata.avatar_url
                });
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
