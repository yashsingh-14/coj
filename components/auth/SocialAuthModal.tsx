'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, User, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface SocialAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    provider: string; // 'Google' | 'Apple'
    onSuccess: (userData: { name: string; email: string; avatar?: string }) => void;
}

export default function SocialAuthModal({ isOpen, onClose, provider, onSuccess }: SocialAuthModalProps) {
    const [step, setStep] = useState<'connecting' | 'permission' | 'details' | 'finishing'>('connecting');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep('connecting');
            // Simulate connection delay
            setTimeout(() => {
                setStep('permission');
            }, 1000);
        }
    }, [isOpen]);

    const handlePermissionGrant = () => {
        setStep('details');
        // Pre-fill mock data based on provider to save user time, but let them edit
        if (provider === 'Google') {
            setName('Google User'); // Default, user expected to change this or we prompt
            setEmail('user@gmail.com');
        } else {
            setName('Apple User');
            setEmail('user@icloud.com');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStep('finishing');

        setTimeout(() => {
            onSuccess({
                name: name,
                email: email,
                avatar: provider === 'Google'
                    ? 'https://lh3.googleusercontent.com/a/ACg8ocIVO_3_2-39_23-239' // Generic/Random Google-ish avatar
                    : 'https://upload.wikimedia.org/wikipedia/commons/3/31/Apple_logo_white.svg'
            });
            setIsLoading(false);
            onClose();
            toast.success(`Successfully signed in with ${provider}`);
        }, 1500);
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
            <div className="relative w-full max-w-md bg-[#101010] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[var(--brand)]" />
                        <span className="font-semibold text-white">Sign in with {provider}</span>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5 text-white/50" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 'connecting' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 className="w-10 h-10 text-[var(--brand)] animate-spin" />
                            <p className="text-white/60 text-sm">Connecting to {provider}...</p>
                        </div>
                    )}

                    {step === 'permission' && (
                        <div className="space-y-6">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck className="w-8 h-8 text-[var(--brand)]" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Permission Required</h3>
                                <p className="text-sm text-white/50">
                                    COJ Worship wants to access your {provider} Account to get your name and email address.
                                </p>
                            </div>
                            <button
                                onClick={handlePermissionGrant}
                                className="w-full py-3 bg-[var(--brand)] hover:bg-[var(--brand)]/80 text-white rounded-xl font-medium transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {step === 'details' && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-white">Confirm Your Details</h3>
                                <p className="text-sm text-white/50">This is how you will appear in the app.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/60 ml-1">Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                                        placeholder="Enter your name"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/60 ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--brand)] transition-colors"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-[var(--brand)] hover:bg-[var(--brand)]/80 text-white rounded-xl font-medium transition-colors mt-4"
                            >
                                Continue as {name || 'User'}
                            </button>
                        </form>
                    )}

                    {step === 'finishing' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Check className="w-12 h-12 text-green-500 animate-scale-in" />
                            <p className="text-white font-medium">Successfully Authenticated</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
