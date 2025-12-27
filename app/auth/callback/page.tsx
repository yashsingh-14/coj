'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            // Check for hash first (Implicit Flow)
            const { error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error getting session:', error);
                router.push('/signin?error=SessionError');
                return;
            }

            // Also handle hash manually if getSession misses it
            if (hash && hash.includes('access_token')) {
                const { data, error: hashError } = await supabase.auth.getSession();
                if (!hashError && data.session?.user) {
                    const { user } = data.session;
                    // Manually update store to prevent race conditions
                    useAppStore.getState().login({
                        id: user.id,
                        name: user.user_metadata.name || user.user_metadata.full_name || user.email?.split('@')[0] || 'User',
                        email: user.email || '',
                        avatar: user.user_metadata.avatar_url || user.user_metadata.picture
                    });

                    router.push('/');
                    return;
                }
            }

            // If we are here, we might have a session or just need to redirect home
            router.push('/');
        };

        handleAuthCallback();

        // Failsafe: If stuck for 4 seconds, force redirect
        const timer = setTimeout(() => {
            console.log('Auth timeout, forcing redirect...');
            router.push('/');
        }, 4000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--brand)] mb-4" />
            <p className="text-white/60">Finalizing secure login...</p>
        </div>
    );
}
