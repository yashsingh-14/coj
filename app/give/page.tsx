import { Heart, QrCode, Building2, ShieldCheck, Sparkles, BookOpen, HandHeart, Gift, ArrowRight } from 'lucide-react';
import LandingNavbar from '@/components/hero/LandingNavbar';
import Link from 'next/link';

export const metadata = {
    title: "Give & Partner | Call of Jesus Ministries",
    description: "Support Call of Jesus Ministries through online giving, UPI, and bank transfers for Kingdom expansion, worship, and church building funds."
};

export default function GivePage() {
    return (
        <main className="min-h-screen bg-[#07060A] text-[#F4EDE2] overflow-hidden relative">
            <LandingNavbar />

            {/* ═══════ AMBIENT ATMOSPHERIC LAYERS ═══════ */}
            <div className="pointer-events-none fixed inset-0 z-0">
                {/* Top celestial fire glow */}
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.12)_0%,rgba(245,158,11,0.08)_35%,transparent_70%)] rounded-full" />
                {/* Center warm nebula */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.05)_0%,rgba(139,92,246,0.03)_50%,transparent_80%)] rounded-full" />
                {/* Bottom divine mist */}
                <div className="absolute bottom-0 inset-x-0 h-[400px] bg-gradient-to-t from-[#07060A] via-[#07060A]/80 to-transparent" />
                {/* Starfield */}
                <div className="starfield opacity-20" />
            </div>

            {/* ═══════ HERO SECTION ═══════ */}
            <section className="relative z-10 pt-32 sm:pt-40 md:pt-48 pb-16 sm:pb-20 px-4 sm:px-6 md:px-12 text-center">
                {/* Flame glow behind heading */}
                <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.20)_0%,rgba(245,158,11,0.12)_40%,transparent_70%)] rounded-full pointer-events-none blur-2xl" />

                <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                    {/* Kingdom Badge */}
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-400/25 backdrop-blur-sm">
                        <Heart className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-amber-300/90">Kingdom Partnership</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight leading-[0.95]">
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/70">Give</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/60 via-white/40 to-white/20 mx-3 sm:mx-4">&</span>
                        <span className="font-playfair italic font-normal text-transparent bg-clip-text bg-gradient-to-b from-[#FFE4B5] via-[#FFB37A] to-[#FF5A2E]">Partner</span>
                    </h1>

                    {/* Scripture */}
                    <div className="max-w-2xl mx-auto">
                        <p className="text-sm sm:text-base md:text-lg text-white/50 font-light leading-relaxed font-serif italic">
                            &ldquo;Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.&rdquo;
                        </p>
                        <p className="mt-2 text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-amber-400/60">— 2 Corinthians 9:7</p>
                    </div>

                    {/* Decorative divider */}
                    <div className="flex items-center justify-center gap-3 pt-4">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500/40" />
                        <Sparkles className="w-4 h-4 text-amber-400/40" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500/40" />
                    </div>
                </div>
            </section>

            {/* ═══════ GIVING METHODS — Two Premium Cards ═══════ */}
            <section className="relative z-10 px-4 sm:px-6 md:px-12 pb-20 sm:pb-28">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

                    {/* ─── BANK TRANSFER CARD ─── */}
                    <div className="group relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-white/10 hover:border-amber-500/30 transition-all duration-700 bg-[#0D0B12]/80 backdrop-blur-xl shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
                        {/* Card ambient glow */}
                        <div className="absolute -top-20 -right-20 w-[250px] h-[250px] bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 p-6 sm:p-8 md:p-10 space-y-7">
                            {/* Header */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.15)]">
                                    <Building2 className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Bank Account Transfer</h2>
                                    <p className="text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-[0.2em]">NEFT · RTGS · IMPS</p>
                                </div>
                            </div>

                            {/* Bank Details Grid */}
                            <div className="space-y-3">
                                {[
                                    { label: 'Account Name', value: 'CALL OF JESUS MINISTRIES TRUST', highlight: false },
                                    { label: 'Bank Name', value: 'HDFC Bank Ltd.', highlight: false },
                                    { label: 'Account Number', value: '50200012345678', highlight: true },
                                    { label: 'IFSC Code', value: 'HDFC0001234', highlight: true },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="relative rounded-xl bg-black/40 border border-white/[0.06] p-4 group/item hover:border-amber-500/20 transition-colors duration-300"
                                    >
                                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30 mb-1">{item.label}</p>
                                        <p className={`text-sm sm:text-base font-bold ${item.highlight ? 'text-amber-300 font-mono tracking-wider' : 'text-white/90'}`}>
                                            {item.value}
                                        </p>
                                        {/* Copy hint glow */}
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                            <span className="text-[9px] text-white/20 uppercase tracking-wider">tap to copy</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Trust badge */}
                            <div className="flex items-center gap-2 text-xs text-white/30">
                                <ShieldCheck className="w-4 h-4 text-emerald-400/60" />
                                <span>Registered Ministry Trust · Tax Exempt under 80G</span>
                            </div>
                        </div>
                    </div>

                    {/* ─── UPI / QR CODE CARD ─── */}
                    <div className="group relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border border-white/10 hover:border-amber-500/30 transition-all duration-700 bg-[#0D0B12]/80 backdrop-blur-xl shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
                        {/* Card ambient glow */}
                        <div className="absolute -top-20 -left-20 w-[250px] h-[250px] bg-[radial-gradient(circle,rgba(255,90,46,0.08)_0%,transparent_70%)] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col items-center text-center space-y-7 h-full justify-between">
                            {/* Header */}
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/20">
                                    <QrCode className="w-4 h-4 text-amber-400" />
                                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-amber-300/80">Instant UPI Giving</span>
                                </div>
                                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Scan & Give via Any UPI App</h2>
                                <p className="text-xs text-white/40">GPay · PhonePe · Paytm · BHIM</p>
                            </div>

                            {/* QR Code Display */}
                            <div className="relative">
                                {/* Outer ring glow */}
                                <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent blur-xl" />
                                <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-2xl bg-white p-4 flex flex-col items-center justify-center border-2 border-amber-400/40 shadow-[0_0_40px_rgba(245,158,11,0.15),0_20px_60px_rgba(0,0,0,0.5)]">
                                    <QrCode className="w-36 h-36 sm:w-44 sm:h-44 text-[#07060A]" />
                                    <span className="text-[9px] sm:text-[10px] font-mono text-[#07060A]/70 font-bold mt-1.5 tracking-wide">cojministries@hdfcbank</span>
                                </div>
                            </div>

                            {/* Security Badge */}
                            <div className="flex items-center gap-2 text-xs text-white/30">
                                <ShieldCheck className="w-4 h-4 text-emerald-400/60" />
                                <span>100% Secure & Verified Ministry Trust Account</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ WHY GIVE — Impact Section ═══════ */}
            <section className="relative z-10 px-4 sm:px-6 md:px-12 pb-24 sm:pb-32">
                <div className="max-w-6xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-12 sm:mb-16">
                        <p className="text-[10px] sm:text-xs font-bold tracking-[0.4em] uppercase text-amber-400/60 mb-3">Where Your Seed Goes</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                            Your Giving <span className="font-playfair italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#FFB37A] to-[#FF5A2E]">Fuels the Fire</span>
                        </h2>
                    </div>

                    {/* Impact Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        {[
                            {
                                icon: BookOpen,
                                title: 'Gospel Outreach',
                                desc: 'Taking the New Covenant Gospel of Grace to unreached communities across India.',
                                accent: 'from-amber-500/20 to-orange-600/10',
                                border: 'hover:border-amber-500/25',
                                iconColor: 'text-amber-400',
                            },
                            {
                                icon: HandHeart,
                                title: 'Church Building',
                                desc: 'Establishing a permanent house of worship for the growing congregation.',
                                accent: 'from-orange-500/20 to-red-600/10',
                                border: 'hover:border-orange-500/25',
                                iconColor: 'text-orange-400',
                            },
                            {
                                icon: Heart,
                                title: 'Compassion Fund',
                                desc: 'Feeding the hungry, clothing the poor, and supporting widows & orphans.',
                                accent: 'from-rose-500/20 to-pink-600/10',
                                border: 'hover:border-rose-500/25',
                                iconColor: 'text-rose-400',
                            },
                            {
                                icon: Gift,
                                title: 'Worship & Media',
                                desc: 'Professional worship production, live streaming, and global media ministry.',
                                accent: 'from-violet-500/20 to-purple-600/10',
                                border: 'hover:border-violet-500/25',
                                iconColor: 'text-violet-400',
                            },
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className={`group relative rounded-2xl bg-[#0D0B12]/60 border border-white/[0.06] ${item.border} backdrop-blur-sm p-6 sm:p-7 transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]`}
                                >
                                    {/* Ambient hover glow */}
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    <div className="relative z-10 space-y-4">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.accent} border border-white/10 flex items-center justify-center`}>
                                            <Icon className={`w-5 h-5 ${item.iconColor}`} />
                                        </div>
                                        <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                                        <p className="text-xs sm:text-sm text-white/40 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════ BOTTOM CTA — Closing Blessing ═══════ */}
            <section className="relative z-10 px-4 sm:px-6 md:px-12 pb-20 sm:pb-28">
                <div className="max-w-3xl mx-auto text-center">
                    {/* Ambient glow */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 w-[500px] h-[200px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)] rounded-full pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                        <p className="text-sm sm:text-base text-white/40 font-serif italic leading-relaxed max-w-xl mx-auto">
                            &ldquo;Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over.&rdquo;
                        </p>
                        <p className="text-xs font-bold tracking-[0.3em] uppercase text-amber-400/50">— Luke 6:38</p>

                        <div className="pt-4">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/25 hover:border-amber-400/50 text-amber-200 text-sm font-bold tracking-wider uppercase transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:translate-y-[-2px]"
                            >
                                Questions? Connect with Us
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom page fade */}
            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#07060A] to-transparent z-20" />
        </main>
    );
}
