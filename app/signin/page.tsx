'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import MinistryLogo from '@/components/ui/MinistryLogo';
import SocialAuthModal from '@/components/auth/SocialAuthModal';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function SignInPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Social Modal State
    const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState('');

    const router = useRouter();
    const login = useAppStore((state) => state.login);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Instant validation validation/simulation
        // Generate a name from email if not provided (simple logic)
        const generatedName = email.split('@')[0];
        const displayName = generatedName.charAt(0).toUpperCase() + generatedName.slice(1);

        login({
            id: Math.random().toString(36).substr(2, 9),
            name: displayName,
            email: email,
            avatar: undefined
        });
        setIsLoading(false);
        toast.success(`Welcome back, ${displayName}!`);
        router.push('/');
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
        // Toast is handled in the modal for social flow, or we can do it here. 
        // Modal handles it for specificity "Signed in with Google".
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
                    <div className="relative mb-2">
                        <div className="absolute inset-0 bg-[var(--brand)] blur-3xl opacity-20 rounded-full scale-100"></div>
                        <MinistryLogo className="relative z-10 scale-75" />
                    </div>
                    <h2 className="mt-2 text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
                    <p className="text-white/40 text-sm mt-2">Enter the Sanctuary of Worship</p>
                </div>

                {/* Glass Form */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    {/* Shimmer Effect on Card Border */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
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

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <Link href="#" className="text-xs text-white/40 hover:text-[var(--brand)] transition-colors">
                                Forgot password?
                            </Link>
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
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Sign In
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
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => handleSocialLoginClick('Google')}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
                        >
                            <span className="text-white text-sm font-medium">Google</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLoginClick('Apple')}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
                        >
                            <span className="text-white text-sm font-medium">Apple</span>
                        </button>
                    </div>
                </div>

                {/* Footer Link */}
                <p className="text-center mt-8 text-white/30 text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="/signup" className="text-[var(--brand)] font-bold hover:text-[var(--accent)] hover:underline transition-all">
                        Join the Family
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
