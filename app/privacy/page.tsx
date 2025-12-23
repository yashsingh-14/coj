'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, FileCheck, Mail } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="relative min-h-screen bg-[#02000F] text-white overflow-hidden selection:bg-amber-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 rounded-full blur-[120px] opacity-50 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-900/10 rounded-full blur-[120px] opacity-50 animate-pulse-slow delay-1000"></div>
                <div className="absolute top-[20%] right-[20%] w-[20vw] h-[20vw] bg-[var(--brand)]/10 rounded-full blur-[80px] opacity-30"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
                {/* Navigation */}
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-md mb-12 transition-all duration-300 group">
                    <ArrowLeft className="w-4 h-4 text-white/70 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium text-white/90">Back to Home</span>
                </Link>

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-16 animate-fade-in-down">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] transform-style-3d animate-float">
                        <Shield className="w-10 h-10 text-amber-500 drop-shadow-lg" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-white/40 font-medium tracking-wide uppercase text-xs">
                        Last Updated: December 20, 2024
                    </p>
                </div>

                {/* Content Card */}
                <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

                    <div className="space-y-12 relative z-10">
                        {/* Intro */}
                        <div className="prose prose-invert prose-lg max-w-none">
                            <p className="text-xl text-white/80 leading-relaxed font-light">
                                <span className="text-amber-500 font-bold">Call of Jesus Ministries</span> values your privacy deeply.
                                We believe transparency is the foundation of trust. This policy outlines exactly how we handle your data to enhance your worship experience.
                            </p>
                        </div>

                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                        {/* Sections */}
                        <div className="grid gap-12">
                            <PolicySection
                                icon={<Eye className="w-6 h-6 text-purple-400" />}
                                title="1. Information We Collect"
                                content="We collect basic usage data such as songs played, favorites marked, and search history. This serves one purpose: to personalize your recommendations and help you rediscover the songs that move you. We do not sell your personal data to anyone, ever."
                            />

                            <PolicySection
                                icon={<Lock className="w-6 h-6 text-blue-400" />}
                                title="2. Secure & Private"
                                content="Your data is encrypted and stored securely. We use industry-standard security measures to protect against unauthorized access, alteration, disclosure, or destruction of your personal information."
                            />

                            <PolicySection
                                icon={<FileCheck className="w-6 h-6 text-emerald-400" />}
                                title="3. Cookies & Sessions"
                                content="We use cookies solely to maintain your session (keeping you logged in) and to remember your preferences (like volume settings or dark mode). By using our platform, you consent to this essential functionality."
                            />

                            <PolicySection
                                icon={<Mail className="w-6 h-6 text-amber-400" />}
                                title="4. Contact Us"
                                content="If you have any questions or concerns regarding your privacy, please reach out. We are here to listen."
                                extra={<a href="mailto:privacy@callofjesus.com" className="inline-block mt-4 text-amber-500 hover:text-amber-400 font-bold hover:underline transition-colors">privacy@callofjesus.com</a>}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PolicySection({ icon, title, content, extra }: { icon: React.ReactNode, title: string, content: string, extra?: React.ReactNode }) {
    return (
        <div className="flex gap-6 group hover:translate-x-2 transition-transform duration-300">
            <div className="shrink-0 pt-1">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all shadow-lg">
                    {icon}
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    {title}
                </h3>
                <p className="text-white/60 leading-relaxed">
                    {content}
                </p>
                {extra}
            </div>
        </div>
    );
}
