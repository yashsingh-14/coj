'use client';

import { useEffect, useRef, useState } from 'react';
import {
    Heart, QrCode, Building2, ShieldCheck, Copy, Check,
    Smartphone, ArrowRight, ExternalLink
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { toast } from 'sonner';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Ministry Account Constants ───
const UPI_ID = 'cojministries@hdfcbank';
const BENEFICIARY_NAME = 'CALL OF JESUS MINISTRIES TRUST';
const BANK_NAME = 'HDFC Bank Ltd.';
const ACCOUNT_NUMBER = '50200012345678';
const IFSC_CODE = 'HDFC0001234';

// Real UPI URL
const UPI_DEEP_LINK = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent('Call of Jesus Ministries')}&cu=INR&tn=${encodeURIComponent('Offering - Call of Jesus')}`;
const GPAY_LINK = `tez://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent('Call of Jesus Ministries')}&cu=INR&tn=${encodeURIComponent('Offering - Call of Jesus')}`;
const PHONEPE_LINK = `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent('Call of Jesus Ministries')}&cu=INR&tn=${encodeURIComponent('Offering - Call of Jesus')}`;
const PAYTM_LINK = `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent('Call of Jesus Ministries')}&cu=INR&tn=${encodeURIComponent('Offering - Call of Jesus')}`;

// Real scannable QR code image
const QR_IMAGE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(UPI_DEEP_LINK)}&bgcolor=ffffff&color=07060a&margin=12`;

const BANK_DETAILS = [
    { label: 'Account Name', value: BENEFICIARY_NAME, copyable: true, highlight: false },
    { label: 'Bank Name', value: BANK_NAME, copyable: false, highlight: false },
    { label: 'Account Number', value: ACCOUNT_NUMBER, copyable: true, highlight: true },
    { label: 'IFSC Code', value: IFSC_CODE, copyable: true, highlight: true },
];

export default function GivePageContent() {
    const heroRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const blessingRef = useRef<HTMLDivElement>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // ─── Copy Helper ───
    const handleCopy = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(label);
            toast.success(`${label} copied!`, {
                description: value,
                duration: 2500,
            });
            setTimeout(() => setCopiedField(null), 2500);
        } catch {
            toast.error('Failed to copy');
        }
    };

    // ─── Open UPI App ───
    const handleLaunchUpi = (url: string, name: string) => {
        toast.info(`Opening ${name}...`, {
            description: 'Paying to Call of Jesus Ministries',
        });
        window.location.href = url;
    };

    // ─── GSAP Scroll Animations ───
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero entrance
            if (heroRef.current) {
                const elements = heroRef.current.querySelectorAll('.hero-fade');
                gsap.fromTo(elements,
                    { opacity: 0, y: 35 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.12,
                        duration: 0.85,
                        ease: 'power3.out',
                        delay: 0.1,
                    }
                );
            }

            // Cards entrance
            if (cardsRef.current) {
                const cards = cardsRef.current.querySelectorAll('.give-card');
                gsap.fromTo(cards,
                    { opacity: 0, y: 50, scale: 0.98 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        stagger: 0.15,
                        duration: 0.85,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: cardsRef.current,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            // Blessing entrance
            if (blessingRef.current) {
                gsap.fromTo(blessingRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: blessingRef.current,
                            start: 'top 90%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }
        });

        return () => ctx.revert();
    }, []);

    return (
        <div className="relative min-h-screen bg-[#07060A] text-[#F4EDE2] overflow-hidden">

            {/* ═══════ AMBIENT GLOWS ═══════ */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.12)_0%,rgba(245,158,11,0.06)_40%,transparent_70%)] rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.04)_0%,transparent_70%)] rounded-full blur-3xl" />
                <div className="starfield opacity-20" />
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 1. HERO SECTION (MINIMAL & IMPACTFUL)                */}
            {/* ═══════════════════════════════════════════════════ */}
            <section ref={heroRef} className="relative z-10 pt-32 sm:pt-40 md:pt-44 pb-12 sm:pb-16 px-4 sm:px-6 md:px-12 text-center">
                <div className="max-w-3xl mx-auto space-y-5">

                    {/* Badge */}
                    <div className="hero-fade inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/20 backdrop-blur-sm">
                        <Heart className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-amber-300/90">
                            Kingdom Partnership
                        </span>
                    </div>

                    {/* Title */}
                    <div className="hero-fade">
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[0.95] text-white">
                            <span>Give</span>{' '}
                            <span className="text-white/35 font-light">&</span>{' '}
                            <span className="font-playfair italic font-normal text-transparent bg-clip-text bg-gradient-to-b from-[#FFE4B5] via-[#FFB37A] to-[#FF5A2E]">
                                Partner
                            </span>
                        </h1>
                    </div>

                    {/* Scripture */}
                    <div className="hero-fade max-w-xl mx-auto pt-1">
                        <p className="text-sm sm:text-base md:text-lg text-white/50 font-serif italic leading-relaxed">
                            &ldquo;Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.&rdquo;
                        </p>
                        <p className="mt-1.5 text-xs font-bold tracking-[0.25em] uppercase text-amber-400/60">
                            — 2 Corinthians 9:7
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 2. THE TWO ESSENTIAL CARDS: UPI & BANK DETAILS      */}
            {/* ═══════════════════════════════════════════════════ */}
            <section ref={cardsRef} className="relative z-10 px-4 sm:px-6 md:px-12 pb-20 sm:pb-28">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">

                    {/* ─── CARD 1: UPI & QR CODE (CLEAN & LIVE) ─── */}
                    <div className="give-card group relative rounded-[1.8rem] sm:rounded-[2rem] bg-[#0D0B12]/80 border border-white/10 hover:border-amber-500/30 transition-all duration-500 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_12px_50px_rgba(0,0,0,0.6)]">
                        {/* Glow accent */}
                        <div className="absolute -top-20 -right-20 w-52 h-52 bg-amber-500/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="space-y-6">
                            {/* Card Header */}
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400">
                                    <QrCode className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Instant UPI Giving</h2>
                                    <p className="text-xs text-white/40">GPay · PhonePe · Paytm · Any UPI</p>
                                </div>
                            </div>

                            {/* Dynamic Scannable QR Code */}
                            <div className="flex flex-col items-center justify-center py-2">
                                <div className="relative group/qr">
                                    <div className="absolute inset-0 -m-3 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent blur-lg" />
                                    <div className="relative w-56 h-56 sm:w-60 sm:h-60 rounded-2xl bg-white p-3.5 flex flex-col items-center justify-center border-2 border-amber-400/40 shadow-xl">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={QR_IMAGE_URL}
                                            alt="Scan to pay Call of Jesus Ministries"
                                            className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
                                        />
                                        <span className="text-[10px] font-mono font-bold text-[#07060A]/80 mt-1 tracking-wide">
                                            {UPI_ID}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[11px] text-white/40 mt-3">Scan with any UPI app camera to pay directly</p>
                            </div>

                            {/* Copy UPI ID */}
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/50 border border-white/[0.08]">
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">UPI ID / VPA</p>
                                    <p className="font-mono text-sm font-bold text-amber-300">{UPI_ID}</p>
                                </div>
                                <button
                                    onClick={() => handleCopy(UPI_ID, 'UPI ID')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-bold hover:bg-amber-500/25 transition-colors"
                                >
                                    {copiedField === 'UPI ID' ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Mobile 1-Tap Payment Buttons */}
                            <div className="space-y-2.5 pt-1">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-white/40 text-center">
                                    Or Tap to Pay Directly on Phone
                                </p>

                                {/* Primary Open UPI App */}
                                <button
                                    onClick={() => handleLaunchUpi(UPI_DEEP_LINK, 'UPI App')}
                                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] transition-all active:scale-[0.99]"
                                >
                                    <Smartphone className="w-4 h-4" />
                                    Open Any UPI App to Pay
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                {/* App Shortcuts */}
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => handleLaunchUpi(GPAY_LINK, 'Google Pay')}
                                        className="py-2.5 px-2 rounded-lg bg-white/[0.04] border border-white/10 hover:border-amber-400/40 text-xs font-bold text-white/80 hover:text-white transition-all text-center"
                                    >
                                        Google Pay
                                    </button>
                                    <button
                                        onClick={() => handleLaunchUpi(PHONEPE_LINK, 'PhonePe')}
                                        className="py-2.5 px-2 rounded-lg bg-white/[0.04] border border-white/10 hover:border-amber-400/40 text-xs font-bold text-white/80 hover:text-white transition-all text-center"
                                    >
                                        PhonePe
                                    </button>
                                    <button
                                        onClick={() => handleLaunchUpi(PAYTM_LINK, 'Paytm')}
                                        className="py-2.5 px-2 rounded-lg bg-white/[0.04] border border-white/10 hover:border-amber-400/40 text-xs font-bold text-white/80 hover:text-white transition-all text-center"
                                    >
                                        Paytm
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bottom security line */}
                        <div className="pt-6 border-t border-white/[0.06] flex items-center justify-center gap-2 text-xs text-white/35">
                            <ShieldCheck className="w-4 h-4 text-emerald-400/70" />
                            <span>100% Secure & Verified Ministry UPI</span>
                        </div>
                    </div>

                    {/* ─── CARD 2: BANK ACCOUNT TRANSFER ─── */}
                    <div className="give-card group relative rounded-[1.8rem] sm:rounded-[2rem] bg-[#0D0B12]/80 border border-white/10 hover:border-amber-500/30 transition-all duration-500 backdrop-blur-xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_12px_50px_rgba(0,0,0,0.6)]">
                        {/* Glow accent */}
                        <div className="absolute -top-20 -left-20 w-52 h-52 bg-orange-500/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="space-y-6">
                            {/* Card Header */}
                            <div className="flex items-center gap-3.5">
                                <div className="w-11 h-11 rounded-xl bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">Bank Account Transfer</h2>
                                    <p className="text-xs text-white/40 font-bold uppercase tracking-wider">NEFT · RTGS · IMPS</p>
                                </div>
                            </div>

                            {/* Bank Details Rows */}
                            <div className="space-y-3 pt-2">
                                {BANK_DETAILS.map((item, i) => (
                                    <div
                                        key={i}
                                        className="relative rounded-xl bg-black/50 border border-white/[0.06] p-4 flex items-center justify-between group/row hover:border-amber-500/20 transition-colors"
                                    >
                                        <div className="space-y-1 pr-3">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                                                {item.label}
                                            </p>
                                            <p className={`text-sm sm:text-base font-bold ${item.highlight ? 'text-amber-300 font-mono tracking-wider' : 'text-white/90'
                                                }`}>
                                                {item.value}
                                            </p>
                                        </div>

                                        {item.copyable && (
                                            <button
                                                onClick={() => handleCopy(item.value, item.label)}
                                                className="p-2 rounded-lg bg-white/[0.05] hover:bg-amber-500/20 text-white/40 hover:text-amber-300 transition-colors"
                                                title={`Copy ${item.label}`}
                                            >
                                                {copiedField === item.label ? (
                                                    <Check className="w-4 h-4 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Account Note */}
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-white/50 space-y-1">
                                <p className="font-bold text-white/70">Account Type: Current / Trust Account</p>
                                <p>Transfer directly via your Mobile Banking app or Net Banking portal.</p>
                            </div>
                        </div>

                        {/* Bottom tax badge */}
                        <div className="pt-6 border-t border-white/[0.06] flex items-center justify-center gap-2 text-xs text-white/35">
                            <ShieldCheck className="w-4 h-4 text-emerald-400/70" />
                            <span>Registered Ministry Trust · 80G Tax Exempt</span>
                        </div>
                    </div>

                </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 3. CLOSING BLESSING SCRIPTURE (MINIMAL)              */}
            {/* ═══════════════════════════════════════════════════ */}
            <section ref={blessingRef} className="relative z-10 px-4 sm:px-6 md:px-12 pb-16 sm:pb-24 text-center">
                <div className="max-w-2xl mx-auto space-y-3">
                    <p className="text-sm sm:text-base text-white/45 font-serif italic leading-relaxed">
                        &ldquo;Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over.&rdquo;
                    </p>
                    <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-amber-400/50">
                        — Luke 6:38
                    </p>
                </div>
            </section>

        </div>
    );
}
