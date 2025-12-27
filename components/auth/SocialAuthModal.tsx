'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, User, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface SocialAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    provider: string; // 'Google' | 'Apple'
    onSuccess: (userData: { name: string; email: string; avatar?: string }) => void;
}

export default function SocialAuthModal({ isOpen, onClose, provider, onSuccess }: SocialAuthModalProps) {
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (isOpen && provider) {
            handleRealOAuth();
        }
    }, [isOpen, provider]);

    const handleRealOAuth = async () => {
        setIsRedirecting(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider.toLowerCase() as 'google' | 'apple',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) {
            toast.error(error.message);
            onClose();
        }
        // No need to set loading false, we are redirecting away.
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-sm bg-[#101010] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-in p-8 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-[var(--brand)] animate-spin" />
                <div className="text-center">
                    <h3 className="text-lg font-bold text-white mb-1">Redirecting to {provider}</h3>
                    <p className="text-white/40 text-sm">Secure sign-in via {provider}...</p>
                </div>
            </div>
        </div>
    );
}
