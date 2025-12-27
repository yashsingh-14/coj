'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

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
            const hash = window.location.hash;
            if (hash && hash.includes('access_token')) {
                const { data, error: hashError } = await supabase.auth.getSession();
                if (!hashError && data.session) {
                    router.push('/');
                    return;
                }
            }

            // If we are here, we might have a session or just need to redirect home
            router.push('/');
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--brand)] mb-4" />
            <p className="text-white/60">Finalizing secure login...</p>
        </div>
    );
}
