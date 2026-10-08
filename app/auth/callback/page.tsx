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
            // 1. Check for URL Errors (Database/Supabase errors redirect here)
            const params = new URLSearchParams(window.location.search);
            const errorMsg = params.get('error_description') || params.get('error');

            if (errorMsg) {
                console.error('Auth Error from URL:', errorMsg);
                // Show error state instead of redirecting
                const statusElem = document.getElementById('status-text');
                if (statusElem) {
                    statusElem.innerHTML = `<span class="text-red-500 font-bold">Login Failed: ${errorMsg}</span><br/><span class="text-xs text-white/50">Please Contact Support</span>`;
                }
                return; // STOP EXECUTION
            }

            // 2. Check for PKCE authorization code
            const code = params.get('code');
            if (code) {
                const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                if (exchangeError) {
                    console.error('Error exchanging code for session:', exchangeError);
                } else if (data?.session?.user) {
                    const { user } = data.session;
                    let role = 'user';
                    if (user.email === 'ys181544@gmail.com') role = 'admin';
                    else {
                        try {
                            const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
                            if (profile?.role) role = profile.role;
                        } catch (e) { }
                    }

                    useAppStore.getState().login({
                        id: user.id,
                        name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                        email: user.email || '',
                        avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
                        role
                    });

                    const next = params.get('next') || '/';
                    router.replace(next);
                    return;
                }
            }

            // 3. Check for hash or active session (Implicit flow / fallback)
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (!sessionError && sessionData?.session?.user) {
                const { user } = sessionData.session;
                let role = 'user';
                if (user.email === 'ys181544@gmail.com') role = 'admin';
                else {
                    try {
                        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
                        if (profile?.role) role = profile.role;
                    } catch (e) { }
                }

                useAppStore.getState().login({
                    id: user.id,
                    name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    email: user.email || '',
                    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
                    role
                });

                const next = params.get('next') || '/';
                router.replace(next);
                return;
            }

            // Fallback redirect
            const next = params.get('next') || '/';
            router.replace(next);
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
            <p id="status-text" className="text-white/60 text-center px-4">Finalizing secure login...</p>
        </div>
    );
}
