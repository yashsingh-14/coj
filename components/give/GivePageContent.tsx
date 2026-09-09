'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
    Heart, QrCode, Building2, ShieldCheck, Sparkles, BookOpen,
    HandHeart, Gift, ArrowRight, Copy, Check, ExternalLink, Smartphone,
    CheckCircle2, ChevronDown, Send, Share2, Globe, Flame,
    MessageSquare, RefreshCw, AlertCircle
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { toast } from 'sonner';
import GoldenSparkleReveal from '@/components/ui/GoldenSparkleReveal';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Ministry Giving Constants ───
const UPI_ID = 'cojministries@hdfcbank';
const BENEFICIARY_NAME = 'CALL OF JESUS MINISTRIES TRUST';
const BANK_NAME = 'HDFC Bank Ltd.';
const ACCOUNT_NUMBER = '50200012345678';
const IFSC_CODE = 'HDFC0001234';
const SWIFT_BIC = 'HDFCINBBXXX';
const BRANCH_NAME = 'Central Sanctuary Branch';

// ─── Preset Giving Amounts ───
const PRESET_AMOUNTS = [200, 500, 1000, 2500, 5000, 10000];

// ─── Offering Causes / Designations ───
const CAUSES = [
    { id: 'general', label: 'General Tithes & Offering', icon: '🌟', note: 'General Tithes and Offerings' },
    { id: 'building', label: 'Church Building & Sanctuary', icon: '⛪', note: 'Church Sanctuary Building Fund' },
    { id: 'gospel', label: 'Gospel Crusades & Outreach', icon: '📖', note: 'Gospel Crusades and Outreach' },
    { id: 'compassion', label: 'Compassion & Poor Relief', icon: '🕊️', note: 'Compassion and Widow Relief' },
    { id: 'worship', label: 'Worship & Media Ministry', icon: '🎵', note: 'Worship Media Production' },
];

// ─── Impact Data ───
const IMPACT_DATA = [
    {
        icon: BookOpen,
        title: 'Gospel Crusades & Outreach',
        desc: 'Taking the New Covenant Gospel of Grace to unreached towns, villages, and open-air crusades across India.',
        accent: 'from-amber-500/20 to-orange-600/10',
        border: 'hover:border-amber-500/30',
        iconColor: 'text-amber-400',
    },
    {
        icon: HandHeart,
        title: 'Permanent Church Sanctuary',
        desc: 'Establishing a state-of-the-art house of worship and prayer altar for thousands of seekers in the city.',
        accent: 'from-orange-500/20 to-red-600/10',
        border: 'hover:border-orange-500/30',
        iconColor: 'text-orange-400',
    },
    {
        icon: Heart,
        title: 'Compassion & Widows Fund',
        desc: 'Providing monthly food kits, medical assistance, education, and shelter to widows, orphans, and the underprivileged.',
        accent: 'from-rose-500/20 to-pink-600/10',
        border: 'hover:border-rose-500/30',
        iconColor: 'text-rose-400',
    },
    {
        icon: Gift,
        title: 'Global Worship & Anointed Media',
        desc: 'Producing high-definition worship songs, chord resources, 24/7 online broadcasts, and anointed sermons worldwide.',
        accent: 'from-violet-500/20 to-purple-600/10',
        border: 'hover:border-violet-500/30',
        iconColor: 'text-violet-400',
    },
];

// ─── Steps to Give ───
const STEPS = [
    {
        step: '01',
        title: 'Select Amount & Cause',
        desc: 'Choose your seed amount and the specific Kingdom project you want to partner with.',
    },
    {
        step: '02',
        title: 'Scan QR or Open UPI App',
        desc: 'On mobile, tap your favorite UPI app (GPay/PhonePe/Paytm). On computer, scan the dynamic QR on screen.',
    },
    {
        step: '03',
        title: 'Receive Receipt & Prayer',
        desc: 'Enter your transaction details below for an instant 80G tax receipt and personalized pastoral prayer.',
    },
];

// ─── FAQ Data ───
const FAQS = [
    {
        q: 'Is my giving tax-deductible under 80G?',
        a: 'Yes! Call of Jesus Ministries Trust is a registered non-profit charitable trust. All donations are eligible for tax exemption under Section 80G of the Indian Income Tax Act. Simply submit your transaction details to receive your official receipt.'
    },
    {
        q: 'How does the online UPI giving work on mobile vs desktop?',
        a: 'On mobile smartphones, tapping "Open GPay" or "Open PhonePe" launches your UPI app immediately with the payee and amount pre-filled. On desktop or laptop computers, the dynamic QR code on screen can be scanned directly using any UPI scanner or mobile camera.'
    },
    {
        q: 'Can I transfer directly through Net Banking (NEFT / RTGS / IMPS)?',
        a: 'Absolutely. You can use our verified HDFC Bank Current Account details shown in the Bank Transfer tab. Simply copy the Account Number and IFSC code into your bank portal or mobile banking app.'
    },
    {
        q: 'Can international partners give from outside India?',
        a: 'Yes, international wire transfers can be routed using our SWIFT/BIC code (HDFCINBBXXX). You can also contact our finance team on WhatsApp for dedicated international giving links.'
    },
    {
        q: 'How do I know my donation is secure?',
        a: 'All transactions take place directly through the secure UPI banking rails and HDFC Bank infrastructure. We do not store any banking credentials or card numbers.'
    }
];

export default function GivePageContent() {
    // ─── Refs for GSAP ScrollTrigger ───
    const containerRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
    const consoleRef = useRef<HTMLDivElement>(null);
    const stepsRef = useRef<HTMLDivElement>(null);
    const methodsRef = useRef<HTMLDivElement>(null);
    const impactRef = useRef<HTMLDivElement>(null);
    const confirmationRef = useRef<HTMLDivElement>(null);
    const faqRef = useRef<HTMLDivElement>(null);
    const blessingRef = useRef<HTMLDivElement>(null);

    // ─── State ───
    const [selectedAmount, setSelectedAmount] = useState<number>(1000);
    const [customAmount, setCustomAmount] = useState<string>('');
    const [isCustom, setIsCustom] = useState<boolean>(false);
    const [selectedCause, setSelectedCause] = useState<string>('general');
    const [frequency, setFrequency] = useState<'one-time' | 'monthly'>('one-time');
    const [activeTab, setActiveTab] = useState<'upi' | 'bank' | 'international'>('upi');
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    // Confirmation form state
    const [donorName, setDonorName] = useState('');
    const [donorPhone, setDonorPhone] = useState('');
    const [donorUtr, setDonorUtr] = useState('');
    const [prayerRequest, setPrayerRequest] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate effective amount
    const effectiveAmount = isCustom ? (parseInt(customAmount, 10) || 0) : selectedAmount;

    // Selected cause object
    const currentCauseObj = CAUSES.find(c => c.id === selectedCause) || CAUSES[0];

    // UPI Payload URL
    const noteText = `${currentCauseObj.note} - Call of Jesus`;
    const upiUrl = effectiveAmount > 0
        ? `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent('Call of Jesus Ministries')}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(noteText)}`
        : `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent('Call of Jesus Ministries')}&cu=INR&tn=${encodeURIComponent(noteText)}`;

    // App specific deep links
    const gpayUrl = `tez://upi/pay?pa=${UPI_ID}&pn=${encodeURIComponent('Call of Jesus Ministries')}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(noteText)}`;
    const phonepeUrl = `phonepe://pay?pa=${UPI_ID}&pn=${encodeURIComponent('Call of Jesus Ministries')}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(noteText)}`;
    const paytmUrl = `paytmmp://pay?pa=${UPI_ID}&pn=${encodeURIComponent('Call of Jesus Ministries')}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(noteText)}`;

    // Dynamic QR code API endpoint
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}&bgcolor=ffffff&color=07060a&margin=10`;

    // ─── Copy to Clipboard Helper ───
    const handleCopy = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(label);
            toast.success(`${label} copied to clipboard!`, {
                description: value,
                duration: 2500,
            });
            setTimeout(() => setCopiedField(null), 2500);
        } catch {
            toast.error('Failed to copy. Please select and copy manually.');
        }
    };

    // ─── Open UPI App ───
    const handleLaunchUpi = (url: string, appName: string) => {
        toast.info(`Opening ${appName}...`, {
            description: `Paying ₹${effectiveAmount.toLocaleString('en-IN')} to Call of Jesus Ministries`,
        });
        window.location.href = url;
    };

    // ─── Handle Confirmation Form ───
    const handleConfirmSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!donorName.trim() || !donorPhone.trim()) {
            toast.error('Please provide your name and phone number for the receipt.');
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
            toast.success('Praise God! Details Received!', {
                description: 'Our pastoral team is praying over your seed. 80G receipt will be shared via WhatsApp.',
                duration: 6000,
            });
        }, 1000);
    };

    // ─── WhatsApp Share Helper ───
    const handleWhatsAppReceipt = () => {
        const text = `*Call of Jesus Ministries - Offering Confirmation*\n\n` +
            `*Name:* ${donorName || 'Believer'}\n` +
            `*Phone:* ${donorPhone}\n` +
            `*Amount Sown:* ₹${effectiveAmount.toLocaleString('en-IN')}\n` +
            `*Purpose:* ${currentCauseObj.label}\n` +
            (donorUtr ? `*UTR / Ref No:* ${donorUtr}\n` : '') +
            (prayerRequest ? `*Prayer Request:* ${prayerRequest}\n` : '') +
            `\n_Praise the Lord! Please send me the 80G tax exemption receipt._`;

        const whatsappUrl = `https://wa.me/919820000000?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank');
    };

    // ─── GSAP ScrollTrigger Animations ───
    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // 1. Hero Entrance
            if (heroRef.current) {
                const heroItems = heroRef.current.querySelectorAll('.hero-element');
                gsap.fromTo(heroItems,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.12,
                        duration: 0.9,
                        ease: 'power3.out',
                        delay: 0.15,
                    }
                );
            }

            // 2. Interactive Giving Console Reveal
            if (consoleRef.current) {
                gsap.fromTo(consoleRef.current,
                    { opacity: 0, y: 60, scale: 0.97 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: consoleRef.current,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            // 3. 3-Step Guide Stagger
            if (stepsRef.current) {
                const stepItems = stepsRef.current.querySelectorAll('.step-card');
                gsap.fromTo(stepItems,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.15,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: stepsRef.current,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            // 4. Giving Methods Stagger
            if (methodsRef.current) {
                const methodCards = methodsRef.current.querySelectorAll('.method-card');
                gsap.fromTo(methodCards,
                    { opacity: 0, y: 60 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.18,
                        duration: 0.85,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: methodsRef.current,
                            start: 'top 80%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            // 5. Impact Cards Stagger
            if (impactRef.current) {
                const impactCards = impactRef.current.querySelectorAll('.impact-item');
                gsap.fromTo(impactCards,
                    { opacity: 0, y: 45 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.12,
                        duration: 0.8,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: impactRef.current,
                            start: 'top 80%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            // 6. Confirmation Section
            if (confirmationRef.current) {
                gsap.fromTo(confirmationRef.current,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: confirmationRef.current,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            // 7. FAQ Section
            if (faqRef.current) {
                const faqItems = faqRef.current.querySelectorAll('.faq-item');
                gsap.fromTo(faqItems,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.08,
                        duration: 0.7,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: faqRef.current,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }

            // 8. Blessing CTA
            if (blessingRef.current) {
                gsap.fromTo(blessingRef.current,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: blessingRef.current,
                            start: 'top 85%',
                            toggleActions: 'play none none none',
                        },
                    }
                );
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="relative min-h-screen bg-[#07060A] text-[#F4EDE2] overflow-x-hidden">

            {/* ═══════ AMBIENT ATMOSPHERIC LIGHTING & GLOWS ═══════ */}
            <div className="pointer-events-none fixed inset-0 z-0">
                {/* Celestial Top Flame Nebula */}
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] sm:w-[1200px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.14)_0%,rgba(245,158,11,0.08)_35%,transparent_70%)] rounded-full blur-3xl" />
                {/* Center Violet/Gold Nebula */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[650px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.05)_0%,rgba(139,92,246,0.03)_50%,transparent_80%)] rounded-full blur-3xl" />
                {/* Starfield */}
                <div className="starfield opacity-25" />
            </div>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 1. HERO SECTION                                     */}
            {/* ═══════════════════════════════════════════════════ */}
            <section ref={heroRef} className="relative z-10 pt-32 sm:pt-40 md:pt-48 pb-14 sm:pb-16 px-4 sm:px-6 md:px-12 text-center">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Kingdom Partnership Badge */}
                    <div className="hero-element inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.15)]">
                        <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] text-amber-300">
                            Kingdom Partnership · Cheerful Giving
                        </span>
                    </div>

                    {/* Main Title with Golden Sparkle Reveal */}
                    <div className="hero-element">
                        <GoldenSparkleReveal duration={1700} delay={150}>
                            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.95] text-white">
                                <span>Give</span>{' '}
                                <span className="text-white/40 font-light">&</span>{' '}
                                <span className="font-playfair italic font-normal text-transparent bg-clip-text bg-gradient-to-b from-[#FFE4B5] via-[#FFB37A] to-[#FF5A2E]">
                                    Partner
                                </span>
                            </h1>
                        </GoldenSparkleReveal>
                    </div>

                    {/* Scripture Quote */}
                    <div className="hero-element max-w-2xl mx-auto pt-2">
                        <p className="text-base sm:text-lg md:text-xl text-white/70 font-light leading-relaxed font-serif italic">
                            &ldquo;Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.&rdquo;
                        </p>
                        <p className="mt-2 text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-amber-400/80">
                            — 2 Corinthians 9:7
                        </p>
                    </div>

                    {/* Trust Ticker Bar */}
                    <div className="hero-element pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-white/50">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>80G Tax Exempt</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
                            <CheckCircle2 className="w-4 h-4 text-amber-400" />
                            <span>Registered Ministry Trust</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08]">
                            <Smartphone className="w-4 h-4 text-cyan-400" />
                            <span>Instant UPI & Net Banking</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 2. THE INTERACTIVE GIVING CONSOLE (ONLINE GIVING)   */}
            {/* ═══════════════════════════════════════════════════ */}
            <section className="relative z-10 px-4 sm:px-6 md:px-12 pb-20 sm:pb-24">
                <div ref={consoleRef} className="max-w-5xl mx-auto">

                    {/* Outer Glow Container */}
                    <div className="relative rounded-[2rem] sm:rounded-[2.5rem] bg-[#0D0B12]/90 border border-white/15 p-6 sm:p-10 md:p-12 shadow-[0_20px_80px_rgba(0,0,0,0.8),0_0_60px_rgba(245,158,11,0.08)] backdrop-blur-2xl">

                        {/* Top decorative gradient line */}
                        <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

                        {/* Console Header */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 border-b border-white/10">
                            <div>
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-400/80">Online Giving Portal</span>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Sow Your Seed Today
                                </h2>
                            </div>

                            {/* Frequency Toggle: One-Time vs Monthly */}
                            <div className="inline-flex items-center p-1 rounded-full bg-black/60 border border-white/10 text-xs">
                                <button
                                    onClick={() => setFrequency('one-time')}
                                    className={`px-4 py-2 rounded-full font-bold transition-all duration-300 ${frequency === 'one-time'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                                        : 'text-white/60 hover:text-white'
                                        }`}
                                >
                                    One-Time Seed
                                </button>
                                <button
                                    onClick={() => setFrequency('monthly')}
                                    className={`px-4 py-2 rounded-full font-bold transition-all duration-300 ${frequency === 'monthly'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                                        : 'text-white/60 hover:text-white'
                                        }`}
                                >
                                    Monthly Covenant Partner
                                </button>
                            </div>
                        </div>

                        {/* STEP 1: Select Ministry Cause */}
                        <div className="py-7 border-b border-white/10 space-y-3">
                            <label className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 flex items-center gap-2">
                                <span>1. Select Ministry Purpose / Cause</span>
                            </label>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                                {CAUSES.map((cause) => {
                                    const isSelected = selectedCause === cause.id;
                                    return (
                                        <button
                                            key={cause.id}
                                            onClick={() => setSelectedCause(cause.id)}
                                            className={`group relative p-3 rounded-xl border text-left transition-all duration-300 ${isSelected
                                                ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                                                : 'bg-black/30 border-white/5 text-white/60 hover:text-white hover:border-white/20'
                                                }`}
                                        >
                                            <div className="text-lg mb-1">{cause.icon}</div>
                                            <p className="text-xs font-bold leading-snug line-clamp-2">{cause.label}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* STEP 2: Select or Enter Amount */}
                        <div className="py-7 border-b border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">
                                    2. Choose Offering Amount (INR ₹)
                                </label>
                                <span className="text-xs text-amber-400/90 font-mono">
                                    Selected: <strong className="text-base text-white">₹{effectiveAmount > 0 ? effectiveAmount.toLocaleString('en-IN') : '0'}</strong>
                                </span>
                            </div>

                            {/* Preset Buttons */}
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                                {PRESET_AMOUNTS.map((amt) => {
                                    const isSelected = !isCustom && selectedAmount === amt;
                                    return (
                                        <button
                                            key={amt}
                                            onClick={() => {
                                                setIsCustom(false);
                                                setSelectedAmount(amt);
                                            }}
                                            className={`py-3.5 px-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 border ${isSelected
                                                ? 'bg-gradient-to-br from-amber-500/25 to-orange-500/20 border-amber-400 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.25)] scale-[1.02]'
                                                : 'bg-black/40 border-white/[0.08] text-white/80 hover:text-white hover:border-amber-500/30 hover:bg-black/60'
                                                }`}
                                        >
                                            ₹{amt.toLocaleString('en-IN')}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Custom Amount Input */}
                            <div className="relative mt-3">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-400 font-bold text-lg">
                                    ₹
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Or enter any custom amount (e.g. 15000)"
                                    value={customAmount}
                                    onChange={(e) => {
                                        setIsCustom(true);
                                        setCustomAmount(e.target.value);
                                    }}
                                    className={`w-full pl-9 pr-4 py-3.5 rounded-xl bg-black/50 border text-white font-mono text-sm sm:text-base placeholder:text-white/30 focus:outline-none transition-colors ${isCustom && customAmount
                                        ? 'border-amber-400 ring-1 ring-amber-400/50'
                                        : 'border-white/10 hover:border-white/25 focus:border-amber-400'
                                        }`}
                                />
                            </div>
                        </div>

                        {/* STEP 3: Payment Method Tabs (Instant UPI vs Bank Transfer vs International) */}
                        <div className="pt-7 space-y-6">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <label className="text-xs font-bold uppercase tracking-[0.25em] text-white/50">
                                    3. Choose Payment Method
                                </label>

                                {/* Method Switcher Tabs */}
                                <div className="inline-flex rounded-xl bg-black/60 p-1 border border-white/10">
                                    <button
                                        onClick={() => setActiveTab('upi')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'upi'
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                                            : 'text-white/50 hover:text-white'
                                            }`}
                                    >
                                        <Smartphone className="w-3.5 h-3.5" />
                                        Instant UPI & QR
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('bank')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'bank'
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                                            : 'text-white/50 hover:text-white'
                                            }`}
                                    >
                                        <Building2 className="w-3.5 h-3.5" />
                                        Bank Transfer (NEFT)
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('international')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'international'
                                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                                            : 'text-white/50 hover:text-white'
                                            }`}
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        International Wire
                                    </button>
                                </div>
                            </div>

                            {/* ─── TAB 1: INSTANT UPI & LIVE DYNAMIC QR ─── */}
                            {activeTab === 'upi' && (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-black/40 rounded-2xl border border-white/[0.08] p-6 sm:p-8">

                                    {/* Left: Mobile 1-Tap App Launch Buttons */}
                                    <div className="lg:col-span-7 space-y-5">
                                        <div className="space-y-2">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-semibold">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                                Live UPI Gateway Ready
                                            </div>
                                            <h3 className="text-xl sm:text-2xl font-black text-white">
                                                Pay ₹{effectiveAmount.toLocaleString('en-IN')} via Any UPI App
                                            </h3>
                                            <p className="text-xs sm:text-sm text-white/50">
                                                Tap below if on mobile phone, or scan the live QR code on the right with your phone camera or UPI app.
                                            </p>
                                        </div>

                                        {/* 1-Tap Direct UPI App Buttons */}
                                        <div className="space-y-3">
                                            {/* Primary "Open Any UPI App" */}
                                            <button
                                                onClick={() => handleLaunchUpi(upiUrl, 'UPI App')}
                                                className="w-full flex items-center justify-between px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-sm tracking-wide uppercase shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_45px_rgba(245,158,11,0.5)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                                            >
                                                <span className="flex items-center gap-2.5">
                                                    <Smartphone className="w-5 h-5" />
                                                    Pay ₹{effectiveAmount.toLocaleString('en-IN')} on Any UPI App
                                                </span>
                                                <ArrowRight className="w-5 h-5" />
                                            </button>

                                            {/* Specific App Launchers */}
                                            <div className="grid grid-cols-3 gap-2.5">
                                                <button
                                                    onClick={() => handleLaunchUpi(gpayUrl, 'Google Pay')}
                                                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.08] transition-all"
                                                >
                                                    <span className="text-xs font-bold text-white">Google Pay</span>
                                                    <span className="text-[10px] text-white/40">GPay Tap</span>
                                                </button>
                                                <button
                                                    onClick={() => handleLaunchUpi(phonepeUrl, 'PhonePe')}
                                                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.08] transition-all"
                                                >
                                                    <span className="text-xs font-bold text-white">PhonePe</span>
                                                    <span className="text-[10px] text-white/40">PhonePe Tap</span>
                                                </button>
                                                <button
                                                    onClick={() => handleLaunchUpi(paytmUrl, 'Paytm')}
                                                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.08] transition-all"
                                                >
                                                    <span className="text-xs font-bold text-white">Paytm / BHIM</span>
                                                    <span className="text-[10px] text-white/40">Paytm Tap</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Copyable UPI ID Box */}
                                        <div className="pt-2">
                                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/60 border border-white/[0.08]">
                                                <div className="space-y-0.5">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Ministry UPI ID / VPA</p>
                                                    <p className="font-mono text-sm sm:text-base font-bold text-amber-300">{UPI_ID}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(UPI_ID, 'UPI ID')}
                                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs font-bold hover:bg-amber-500/25 transition-colors"
                                                >
                                                    {copiedField === 'UPI ID' ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                            <span>Copied!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5" />
                                                            <span>Copy UPI</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Live Dynamic Scannable QR Code */}
                                    <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-4">
                                        <div className="relative group">
                                            {/* Pulsing ambient glow */}
                                            <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-transparent blur-xl" />

                                            {/* QR Container */}
                                            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl bg-white p-4 flex flex-col items-center justify-center border-4 border-amber-400/40 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                                                {/* Image tag for real dynamic QR */}
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={qrApiUrl}
                                                    alt={`Scan to pay ₹${effectiveAmount} to Call of Jesus Ministries`}
                                                    className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                                                />
                                                <div className="mt-1 flex items-center justify-between w-full px-2 text-[#07060A]">
                                                    <span className="text-[10px] font-mono font-bold tracking-tight">{UPI_ID}</span>
                                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                                        ₹{effectiveAmount.toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="mt-4 text-xs text-white/60 font-medium">
                                            Scan with Phone Camera, GPay, or PhonePe to pay ₹{effectiveAmount.toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ─── TAB 2: BANK TRANSFER (NEFT / RTGS / IMPS) ─── */}
                            {activeTab === 'bank' && (
                                <div className="bg-black/40 rounded-2xl border border-white/[0.08] p-6 sm:p-8 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white">Direct Net Banking & Wire Transfer</h3>
                                            <p className="text-xs text-white/50 font-bold uppercase tracking-wider">
                                                NEFT · RTGS · IMPS · Internet Banking
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bank Rows */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        {[
                                            { label: 'Beneficiary Account Name', value: BENEFICIARY_NAME, copyable: true },
                                            { label: 'Bank Name', value: BANK_NAME, copyable: false },
                                            { label: 'Account Number', value: ACCOUNT_NUMBER, copyable: true, highlight: true },
                                            { label: 'IFSC Code', value: IFSC_CODE, copyable: true, highlight: true },
                                            { label: 'Account Type', value: 'Current / Religious Trust Account', copyable: false },
                                            { label: 'Branch', value: BRANCH_NAME, copyable: false },
                                        ].map((item, i) => (
                                            <div
                                                key={i}
                                                className="relative rounded-xl bg-black/50 border border-white/[0.06] p-4 flex items-center justify-between group hover:border-amber-500/20 transition-colors"
                                            >
                                                <div className="space-y-1 pr-4">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{item.label}</p>
                                                    <p className={`text-sm sm:text-base font-bold ${item.highlight ? 'text-amber-300 font-mono tracking-wider' : 'text-white/90'}`}>
                                                        {item.value}
                                                    </p>
                                                </div>
                                                {item.copyable && (
                                                    <button
                                                        onClick={() => handleCopy(item.value, item.label)}
                                                        className="p-2.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-white/50 hover:text-amber-300 transition-colors"
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

                                    <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                                        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                                        <span>
                                            Funds transferred to this account directly support Call of Jesus Ministries Trust and are recognized for 80G tax benefits.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* ─── TAB 3: INTERNATIONAL WIRE ─── */}
                            {activeTab === 'international' && (
                                <div className="bg-black/40 rounded-2xl border border-white/[0.08] p-6 sm:p-8 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
                                            <Globe className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white">Overseas Partners (SWIFT / International Wire)</h3>
                                            <p className="text-xs text-white/50 font-bold uppercase tracking-wider">
                                                USD · GBP · EUR · AED · CAD · AUD
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div className="rounded-xl bg-black/50 border border-white/[0.06] p-4 space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Bank SWIFT / BIC Code</p>
                                            <p className="text-base font-mono font-bold text-cyan-300">{SWIFT_BIC}</p>
                                        </div>
                                        <div className="rounded-xl bg-black/50 border border-white/[0.06] p-4 space-y-1">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Beneficiary</p>
                                            <p className="text-base font-bold text-white">{BENEFICIARY_NAME}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-5 space-y-3">
                                        <p className="text-xs sm:text-sm text-amber-200 leading-relaxed">
                                            For seamless foreign currency contributions or specific regulatory compliance for overseas inward remittances, please message our Finance & Partner Desk directly.
                                        </p>
                                        <Link
                                            href="https://wa.me/919820000000?text=Hello%20Call%20of%20Jesus%20Ministries,%20I%20am%20an%20international%20partner%20and%20would%20like%20to%20give."
                                            target="_blank"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-300 transition-colors"
                                        >
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            Chat with International Partner Desk
                                        </Link>
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 3. THREE EASY STEPS TO GIVE ONLINE                  */}
            {/* ═══════════════════════════════════════════════════ */}
            <section ref={stepsRef} className="relative z-10 px-4 sm:px-6 md:px-12 pb-24 sm:pb-32">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400/80">Simple & Transparent</p>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                            How Online Giving Works
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STEPS.map((s, idx) => (
                            <div
                                key={idx}
                                className="step-card relative rounded-2xl bg-[#0D0B12]/80 border border-white/[0.08] p-7 space-y-4 hover:border-amber-500/30 transition-all duration-300 hover:translate-y-[-4px] shadow-lg"
                            >
                                <div className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-orange-500">
                                    {s.step}
                                </div>
                                <h3 className="text-lg font-bold text-white tracking-tight">{s.title}</h3>
                                <p className="text-xs sm:text-sm text-white/50 leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 4. PAYMENT CONFIRMATION & PRAYER REQUEST FORM       */}
            {/* ═══════════════════════════════════════════════════ */}
            <section ref={confirmationRef} className="relative z-10 px-4 sm:px-6 md:px-12 pb-24 sm:pb-32">
                <div className="max-w-3xl mx-auto rounded-[2rem] bg-gradient-to-b from-[#13101A] to-[#0D0B12] border border-white/15 p-6 sm:p-10 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" />
                                Already Given Online?
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                Send Transaction Reference & Prayer Request
                            </h2>
                            <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto">
                                Let us know your details so we can issue your official 80G tax receipt and our pastoral team can pray over your seed.
                            </p>
                        </div>

                        {isSubmitted ? (
                            <div className="text-center py-10 space-y-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-6">
                                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Thank You, {donorName}!</h3>
                                <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto">
                                    Your offering details of ₹{effectiveAmount.toLocaleString('en-IN')} for {currentCauseObj.label} have been received. May God open the floodgates of heaven and pour out blessings upon you!
                                </p>
                                <div className="pt-2 flex justify-center gap-3">
                                    <button
                                        onClick={handleWhatsAppReceipt}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider transition-colors"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Share on WhatsApp for Fast Receipt
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleConfirmSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                                            Your Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={donorName}
                                            onChange={(e) => setDonorName(e.target.value)}
                                            placeholder="Pastor / Brother / Sister..."
                                            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                                            WhatsApp / Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={donorPhone}
                                            onChange={(e) => setDonorPhone(e.target.value)}
                                            placeholder="+91 98765 43210 (For 80G Receipt)"
                                            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                                            Amount Sown (₹)
                                        </label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={`₹${effectiveAmount.toLocaleString('en-IN')} (${currentCauseObj.label})`}
                                            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/5 text-amber-300 font-mono text-sm cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                                            UPI UTR / Bank Reference No (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={donorUtr}
                                            onChange={(e) => setDonorUtr(e.target.value)}
                                            placeholder="e.g. 423589239845 (12-digit UTR)"
                                            className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5">
                                        Your Prayer Request / Family Needs
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={prayerRequest}
                                        onChange={(e) => setPrayerRequest(e.target.value)}
                                        placeholder="What breakthrough, healing, or family salvation are you believing God for? Pastor and our prayer warriors will pray over your request."
                                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-sm focus:border-amber-400 focus:outline-none transition-colors"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4" />
                                    {isSubmitting ? 'Registering Offering...' : 'Submit Details & Request Pastor\'s Prayer'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 5. WHERE YOUR SEED GOES — IMPACT SECTION            */}
            {/* ═══════════════════════════════════════════════════ */}
            <section ref={impactRef} className="relative z-10 px-4 sm:px-6 md:px-12 pb-24 sm:pb-32">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="text-center space-y-3">
                        <GoldenSparkleReveal duration={1400} delay={100}>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400/80">Kingdom Stewardship</p>
                        </GoldenSparkleReveal>
                        <GoldenSparkleReveal duration={1600} delay={200}>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                                Where Your Seed{' '}
                                <span className="font-playfair italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#FFB37A] to-[#FF5A2E]">
                                    Fuels the Fire
                                </span>
                            </h2>
                        </GoldenSparkleReveal>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {IMPACT_DATA.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className={`impact-item group relative rounded-2xl bg-[#0D0B12]/70 border border-white/[0.08] ${item.border} backdrop-blur-md p-6 sm:p-7 transition-all duration-500 hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]`}
                                >
                                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                    <div className="relative z-10 space-y-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.accent} border border-white/10 flex items-center justify-center`}>
                                            <Icon className={`w-6 h-6 ${item.iconColor}`} />
                                        </div>
                                        <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                                        <p className="text-xs sm:text-sm text-white/50 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 6. FAQ ACCORDION SECTION                            */}
            {/* ═══════════════════════════════════════════════════ */}
            <section ref={faqRef} className="relative z-10 px-4 sm:px-6 md:px-12 pb-24 sm:pb-32">
                <div className="max-w-4xl mx-auto space-y-10">
                    <div className="text-center space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400/80">Frequently Asked Questions</p>
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                            Everything You Need to Know
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {FAQS.map((faq, i) => {
                            const isOpen = openFaq === i;
                            return (
                                <div
                                    key={i}
                                    className="faq-item rounded-2xl bg-black/40 border border-white/[0.08] overflow-hidden transition-colors"
                                >
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : i)}
                                        className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                                    >
                                        <span className="text-sm sm:text-base font-bold text-white/90 pr-4">
                                            {faq.q}
                                        </span>
                                        <ChevronDown className={`w-5 h-5 text-amber-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isOpen && (
                                        <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-white/60 leading-relaxed border-t border-white/[0.05] pt-4">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════ */}
            {/* 7. CLOSING BLESSING & SCRIPTURE                     */}
            {/* ═══════════════════════════════════════════════════ */}
            <section ref={blessingRef} className="relative z-10 px-4 sm:px-6 md:px-12 pb-20 sm:pb-28">
                <div className="max-w-3xl mx-auto text-center space-y-6">
                    <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                        <Heart className="w-6 h-6 animate-pulse" />
                    </div>

                    <GoldenSparkleReveal duration={1600} delay={100}>
                        <p className="text-base sm:text-xl text-white/70 font-serif italic leading-relaxed max-w-xl mx-auto">
                            &ldquo;Give, and it shall be given unto you; good measure, pressed down, and shaken together, and running over, shall men give into your bosom.&rdquo;
                        </p>
                    </GoldenSparkleReveal>
                    <p className="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-amber-400/80">
                        — Luke 6:38
                    </p>

                    <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/15 border border-amber-500/30 hover:border-amber-400 text-amber-200 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_35px_rgba(245,158,11,0.25)] hover:translate-y-[-2px]"
                        >
                            Need Assistance? Connect with Us
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
