'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Scale, Gavel, AlertCircle, CheckCircle } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="relative min-h-screen bg-[#02000F] text-white overflow-hidden selection:bg-amber-500/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-900/20 rounded-full blur-[120px] opacity-50 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px] opacity-50 animate-pulse-slow delay-1000"></div>
                <div className="absolute top-[20%] left-[20%] w-[20vw] h-[20vw] bg-[var(--brand)]/10 rounded-full blur-[80px] opacity-30"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
                {/* Navigation */}
                <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-md mb-12 transition-all duration-300 group">
                    <ArrowLeft className="w-4 h-4 text-white/70 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium text-white/90">Back to Home</span>
                </Link>

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-16 animate-fade-in-down">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)] transform-style-3d animate-float">
                        <FileText className="w-10 h-10 text-blue-500 drop-shadow-lg" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Terms of Service
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
                                Welcome to <span className="text-blue-500 font-bold">Call of Jesus Ministries</span>.
                                By accessing our platform, you agree to be bound by these terms. We exist to serve the Kingdom, and these guidelines ensure a safe, respectful environment for all worshippers.
                            </p>
                        </div>

                        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                        {/* Sections */}
                        <div className="grid gap-12">
                            <TermSection
                                icon={<CheckCircle className="w-6 h-6 text-emerald-400" />}
                                title="1. Acceptance of Terms"
                                content="By accessing this website, you are agreeing to be bound by these website Terms and Conditions of Use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws."
                            />

                            <TermSection
                                icon={<Scale className="w-6 h-6 text-amber-400" />}
                                title="2. Use License"
                                content="Permission is granted to stream and view the materials (lyrics, chords, videos) on Call of Jesus Ministries' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title."
                            />

                            <TermSection
                                icon={<AlertCircle className="w-6 h-6 text-red-400" />}
                                title="3. User Conduct"
                                content="You agree not to use the platform for any unlawful purpose or to solicit others to perform or participate in any unlawful acts. We reserve the right to terminate your use of the Service for violating any of the prohibited uses."
                            />

                            <TermSection
                                icon={<Gavel className="w-6 h-6 text-purple-400" />}
                                title="4. Disclaimer"
                                content="The materials on Call of Jesus Ministries' website are provided on an 'as is' basis. Makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TermSection({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
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
            </div>
        </div>
    );
}
