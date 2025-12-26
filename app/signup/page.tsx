'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Sparkles, User } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import SocialAuthModal from '@/components/auth/SocialAuthModal';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabaseClient';

export default function SignUpPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Social Modal State
    const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState('');

    const router = useRouter();
    const login = useAppStore((state) => state.login);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Real Supabase Signup
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name,
                },
            },
        });

        if (error) {
            toast.error(error.message);
            setIsLoading(false);
            return;
        }

        // Success
        toast.success(`Account created! Checking verification...`);
        // If email confirmation text is needed, it depends on project settings.
        // Usually, user is signed in automatically if "Enable Email Confirmation" is OFF.

        // We push to home. If session exists, AppShell updates state.
        router.push('/');
        setIsLoading(false);
    };

    const handleSocialLoginClick = (provider: string) => {
        setSelectedProvider(provider);
        setIsSocialModalOpen(true);
    }

    const handleSocialSuccess = (userData: { name: string; email: string; avatar?: string }) => {
        login({
            id: Math.random().toString(36).substr(2, 9),
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar
        });
        router.push('/');
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#02000F] flex items-center justify-center p-4">

            {/* --- ANIMATED BACKGROUND ATMOSPHERE --- */}
            <div className="absolute inset-0 z-0">
                {/* Brand Orb */}
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--brand)] rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>
                {/* Accent Orb */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--accent)] rounded-full mix-blend-screen filter blur-[150px] opacity-10"></div>
                {/* Moving Particles (CSS only for simplicity) */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* --- GLASS CARD CONTAINER --- */}
            <div className="relative z-10 w-full max-w-md">

                <div className="flex flex-col items-center mb-6 animate-fade-in-down">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[var(--brand)] blur-3xl opacity-20 rounded-full scale-100"></div>
                        <Logo className="relative z-10 w-53 h-auto" />
                    </div>
                    <h2 className="-mt-20 text-3xl font-bold text-white tracking-tight">Join the Family</h2>
                    <p className="text-white/40 text-sm mt-2">Begin your journey of worship</p>
                </div>

                {/* Glass Form */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    {/* Shimmer Effect on Card Border */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    <form onSubmit={handleSignUp} className="space-y-6 relative z-10">
                        {/* Name Field */}
                        <div className="space-y-2">
                            <label className="text-white/60 text-xs font-bold uppercase tracking-wider ml-1">Full Name</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-white/30 group-focus-within/input:text-[var(--brand)] transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50 transition-all duration-300"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-white/60 text-xs font-bold uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-white/30 group-focus-within/input:text-[var(--brand)] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50 transition-all duration-300"
                                    placeholder="worshipper@coj.com"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-white/60 text-xs font-bold uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-white/30 group-focus-within/input:text-[var(--brand)] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:bg-white/10 focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50 transition-all duration-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] hover:to-[var(--brand)] text-white font-bold py-4 rounded-xl shadow-lg shadow-[var(--brand)]/20 hover:shadow-[var(--brand)]/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <Sparkles className="w-5 h-5 animate-spin" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                            {/* Button Shine Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out"></div>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center gap-4 opacity-30">
                        <div className="h-px bg-white flex-1"></div>
                        <span className="text-xs text-white uppercase tracking-widest">OR</span>
                        <div className="h-px bg-white flex-1"></div>
                    </div>

                    {/* Social Login (Mock) */}
                    {/* Social Login */}
                    <div className="flex flex-col gap-4">
                        <button
                            type="button"
                            onClick={() => handleSocialLoginClick('Google')}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 w-full group"
                        >
                            {/* Google Icon SVG for better branding */}
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-white text-sm font-medium">Continue with Google</span>
                        </button>
                    </div>
                </div>

                {/* Footer Link */}
                <p className="text-center mt-8 text-white/30 text-sm">
                    Already have an account?{' '}
                    <Link href="/signin" className="text-[var(--brand)] font-bold hover:text-[var(--accent)] hover:underline transition-all">
                        Sign In
                    </Link>
                </p>
            </div>

            {/* Social Auth Modal */}
            <SocialAuthModal
                isOpen={isSocialModalOpen}
                onClose={() => setIsSocialModalOpen(false)}
                provider={selectedProvider}
                onSuccess={handleSocialSuccess}
            />
        </div>
    );
}
