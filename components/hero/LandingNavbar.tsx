'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '../ui/Logo';
import { ChevronDown, ChevronRight, Heart, Sparkles, MapPin, Music, Radio, BookOpen, UserCheck, Flame, Clock, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';

const growItems = [
    {
        href: '/sermons',
        label: 'Sermons',
        desc: 'Watch & Listen',
        icon: Radio,
        iconColor: 'text-[#FF5A2E]',
    },
    {
        href: '/devotional',
        label: 'Daily Devotionals',
        desc: 'Scripture & reflection',
        icon: BookOpen,
        iconColor: 'text-[#F59E0B]',
    },
    {
        href: '/god-stories',
        label: 'God Stories',
        desc: 'Miracle reports',
        icon: Flame,
        iconColor: 'text-[#FF8C68]',
    },
];

const ministryItems = [
    {
        href: '/our-branches',
        label: 'Our Branches',
        desc: 'Locations & timings',
        icon: MapPin,
        iconColor: 'text-[#FF9E79]',
    },
    {
        href: '/our-journey',
        label: 'Our Journey',
        desc: 'From prayer roots',
        icon: Sparkles,
        iconColor: 'text-[#F59E0B]',
    },
    {
        href: '/our-vision-and-mission',
        label: 'Vision & Mission',
        desc: 'Kingdom calling',
        icon: Flame,
        iconColor: 'text-[#FF8C68]',
    },
    {
        href: '/our-leaders',
        label: 'Our Leaders',
        desc: 'Pastoral team',
        icon: UserCheck,
        iconColor: 'text-[#FFB37A]',
    },
];

const sectionVariants = {
    hidden: { opacity: 0, y: 14 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.28,
            ease: [0.16, 1, 0.3, 1] as const,
        },
    },
};

export default function LandingNavbar() {
    const setMode = useAppStore((state) => state.setMode);
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [growDropdownOpen, setGrowDropdownOpen] = useState(false);
    const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const scrolled = window.scrollY > 20;
                    setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent background scrolling and stop Lenis virtual scroll when menu is open
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lenis = typeof window !== 'undefined' ? (window as any).lenis : null;
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            if (lenis?.stop) lenis.stop();
        } else {
            document.body.style.overflow = '';
            if (lenis?.start) lenis.start();
        }
        return () => {
            document.body.style.overflow = '';
            if (lenis?.start) lenis.start();
        };
    }, [mobileMenuOpen]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Close mobile menu on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMobileMenuOpen(false);
            }
        };
        if (mobileMenuOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mobileMenuOpen]);

    return (
        <nav
            className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 border-none ${
                isScrolled || mobileMenuOpen
                    ? 'bg-[#07060A]/95 backdrop-blur-sm shadow-md border-b border-white/[0.04]'
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-14 md:h-16 flex items-center justify-between">

                {/* Brand Logo */}
                <Link
                    href="/"
                    onClick={() => {
                        setMode('EXPERIENCE');
                        setMobileMenuOpen(false);
                    }}
                    className="flex items-center group focus:outline-none translate-y-1.5 sm:translate-y-2 md:translate-y-3.5"
                >
                    <Logo className="h-20 sm:h-28 md:h-36 lg:h-40 w-auto" />
                </Link>

                {/* Desktop Navigation Links (>= lg) */}
                <div className="hidden lg:flex items-center gap-8 font-semibold text-[15px] text-[#F4EDE2]">

                    {/* Grow Dropdown */}
                    <div
                        className="relative group py-2 cursor-pointer"
                        onMouseEnter={() => setGrowDropdownOpen(true)}
                        onMouseLeave={() => setGrowDropdownOpen(false)}
                    >
                        <button className="flex items-center gap-1.5 hover:text-[#FFB37A] transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                            <span className="font-semibold tracking-wide">Grow</span>
                            <ChevronDown className={`w-4 h-4 text-white/90 transition-transform duration-300 ${growDropdownOpen ? 'rotate-180 text-[#FFB37A]' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {growDropdownOpen && (
                            <div className="absolute top-full left-0 w-64 p-2.5 rounded-2xl bg-[#0D0B12]/95 backdrop-blur-2xl border border-[#F4EDE2]/15 shadow-[0_15px_40px_rgba(0,0,0,0.8)] space-y-1 animate-fade-in-down">
                                <Link href="/sermons" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-[#FFB37A] transition-all text-xs font-semibold">
                                    <div className="w-7 h-7 rounded-lg bg-[#FF5A2E]/15 flex items-center justify-center text-[#FF5A2E]">
                                        <Radio className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Sermons</div>
                                        <div className="text-[10px] text-white/40 font-normal">Sunday & Friday Messages</div>
                                    </div>
                                </Link>
                                <Link href="/devotional" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-[#FDE047] transition-all text-xs font-semibold">
                                    <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center text-[#F59E0B]">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Daily Devotionals</div>
                                        <div className="text-[10px] text-white/40 font-normal">Scripture & reflection</div>
                                    </div>
                                </Link>
                                <Link href="/god-stories" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-[#FFB37A] transition-all text-xs font-semibold">
                                    <div className="w-7 h-7 rounded-lg bg-[#C2361A]/15 flex items-center justify-center text-[#FF5A2E]">
                                        <Flame className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">God Stories</div>
                                        <div className="text-[10px] text-white/40 font-normal">Supernatural testimonies</div>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Our Branches */}
                    <Link href="/our-branches" className="hover:text-[#FFB37A] transition-colors flex items-center gap-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        <MapPin className="w-4 h-4 text-[#FF5A2E]" />
                        <span className="font-semibold tracking-wide">Our Branches</span>
                    </Link>

                    {/* About Us Dropdown */}
                    <div
                        className="relative group py-2 cursor-pointer"
                        onMouseEnter={() => setAboutDropdownOpen(true)}
                        onMouseLeave={() => setAboutDropdownOpen(false)}
                    >
                        <button className="flex items-center gap-1.5 hover:text-[#FFB37A] transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                            <span className="font-semibold tracking-wide">About Us</span>
                            <ChevronDown className={`w-4 h-4 text-white/90 transition-transform duration-300 ${aboutDropdownOpen ? 'rotate-180 text-[#FFB37A]' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {aboutDropdownOpen && (
                            <div className="absolute top-full left-0 w-64 p-2.5 rounded-2xl bg-[#0D0B12]/95 backdrop-blur-2xl border border-[#F4EDE2]/15 shadow-[0_15px_40px_rgba(0,0,0,0.8)] space-y-1 animate-fade-in-down">
                                <Link href="/our-journey" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-[#FDE047] transition-all text-xs font-semibold">
                                    <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center text-[#F59E0B]">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Our Journey</div>
                                        <div className="text-[10px] text-white/40 font-normal">God&apos;s faithfulness</div>
                                    </div>
                                </Link>
                                <Link href="/our-vision-and-mission" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-[#FFB37A] transition-all text-xs font-semibold">
                                    <div className="w-7 h-7 rounded-lg bg-[#FF5A2E]/15 flex items-center justify-center text-[#FF5A2E]">
                                        <Flame className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Vision & Mission</div>
                                        <div className="text-[10px] text-white/40 font-normal">Kingdom calling</div>
                                    </div>
                                </Link>
                                <Link href="/our-leaders" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-[#FFB37A] transition-all text-xs font-semibold">
                                    <div className="w-7 h-7 rounded-lg bg-[#C2361A]/15 flex items-center justify-center text-[#FF8C68]">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Our Leaders</div>
                                        <div className="text-[10px] text-white/40 font-normal">Pastoral team</div>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Worship Portal */}
                    <Link
                        href="/worship"
                        className="hover:text-[#FFD700] transition-colors flex items-center gap-1.5 text-[#FFB37A] font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                    >
                        <Music className="w-4 h-4 text-[#FF5A2E]" />
                        <span className="font-bold tracking-wide">Worship Chords</span>
                    </Link>

                </div>

                {/* Right Desktop CTA Button */}
                <div className="hidden lg:flex items-center gap-4">
                    <Link
                        href="/give"
                        className="liquid-btn group relative inline-flex items-center justify-center px-7 py-2.5 rounded-full border border-[#FF5A2E]/40 hover:border-[#FFB37A] bg-gradient-to-r from-[#FFB37A]/15 via-[#FF5A2E]/15 to-[#C2361A]/15 text-[#F4EDE2] font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(255,90,46,0.35)] transition-all duration-500"
                    >
                        <div className="liquid-water-fill bg-gradient-to-t from-[#C2361A] via-[#FF5A2E] to-[#FFB37A] text-[#FF5A2E]">
                            <svg className="liquid-wave-svg liquid-wave-1" viewBox="0 0 120 20" preserveAspectRatio="none">
                                <path d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z" fill="currentColor" />
                            </svg>
                            <svg className="liquid-wave-svg liquid-wave-2 text-[#FFD700]" viewBox="0 0 120 20" preserveAspectRatio="none">
                                <path d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z" fill="currentColor" />
                            </svg>
                        </div>
                        <span className="relative z-10 group-hover:text-neutral-950 transition-colors duration-500">Give</span>
                    </Link>
                </div>

                {/* Mobile & Tablet Right Controls */}
                <div className="lg:hidden flex items-center gap-2 sm:gap-3">
                    {/* Quick Give Button on Mobile / Tablet */}
                    <Link
                        href="/give"
                        onClick={() => setMobileMenuOpen(false)}
                        className="liquid-btn group relative inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#FF5A2E]/40 hover:border-[#FFB37A] bg-gradient-to-r from-[#FFB37A]/15 via-[#FF5A2E]/15 to-[#C2361A]/15 text-[#F4EDE2] font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-500 active:scale-95"
                    >
                        <div className="liquid-water-fill bg-gradient-to-t from-[#C2361A] via-[#FF5A2E] to-[#FFB37A] text-[#FF5A2E]">
                            <svg className="liquid-wave-svg liquid-wave-1" viewBox="0 0 120 20" preserveAspectRatio="none">
                                <path d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z" fill="currentColor" />
                            </svg>
                            <svg className="liquid-wave-svg liquid-wave-2 text-[#FFD700]" viewBox="0 0 120 20" preserveAspectRatio="none">
                                <path d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z" fill="currentColor" />
                            </svg>
                        </div>
                        <Heart className="w-3.5 h-3.5 text-[#FFB37A] fill-[#FFB37A]/50 relative z-10 group-hover:text-neutral-950 group-hover:fill-neutral-950 transition-colors" />
                        <span className="relative z-10 group-hover:text-neutral-950 transition-colors duration-500">Give</span>
                    </Link>

                    {/* Animated 3-line to X Hamburger Toggle Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center active:scale-90 transition-all duration-300 shadow-md focus:outline-none relative group ${
                            mobileMenuOpen
                                ? 'bg-[#FF5A2E]/15 border-[#FF5A2E]/40 text-amber-400 shadow-[0_0_15px_rgba(255,90,46,0.25)]'
                                : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-[#F4EDE2]'
                        }`}
                        aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                        aria-expanded={mobileMenuOpen}
                    >
                        <div className="w-5 h-4 flex flex-col justify-between items-center relative pointer-events-none">
                            <span
                                style={{
                                    transform: mobileMenuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
                                    backgroundColor: mobileMenuOpen ? '#f59e0b' : '#F4EDE2',
                                }}
                                className="w-5 h-[2px] rounded-full transition-all duration-300 origin-center block shadow-sm"
                            />
                            <span
                                style={{
                                    opacity: mobileMenuOpen ? 0 : 1,
                                    transform: mobileMenuOpen ? 'scaleX(0)' : 'none',
                                }}
                                className="w-5 h-[2px] rounded-full bg-[#F4EDE2] transition-all duration-200 origin-center block"
                            />
                            <span
                                style={{
                                    transform: mobileMenuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
                                    backgroundColor: mobileMenuOpen ? '#f59e0b' : '#F4EDE2',
                                }}
                                className="w-5 h-[2px] rounded-full transition-all duration-300 origin-center block shadow-sm"
                            />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile & Tablet Luxury Animated Menu Reveal */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        {/* Ambient Backdrop Blur Overlay (Click outside to close) */}
                        <motion.div
                            key="mobile-nav-backdrop"
                            data-lenis-prevent
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            onClick={() => setMobileMenuOpen(false)}
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                            className="lg:hidden fixed inset-0 top-14 md:top-16 bg-black/75 backdrop-blur-md z-40"
                        />

                        {/* Slide & Fade Revealed Drawer Container */}
                        <motion.div
                            key="mobile-nav-drawer"
                            data-lenis-prevent
                            initial={{ opacity: 0, y: -16, scaleY: 0.98 }}
                            animate={{ opacity: 1, y: 0, scaleY: 1 }}
                            exit={{ opacity: 0, y: -14, scaleY: 0.98 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                            style={{ touchAction: 'pan-y' }}
                            className="lg:hidden fixed inset-x-0 top-14 md:top-16 max-h-[calc(100dvh-3.5rem)] md:max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain bg-[#07060A]/95 backdrop-blur-3xl border-b border-white/[0.08] shadow-[0_30px_90px_rgba(0,0,0,0.95)] px-3 sm:px-6 py-3.5 pb-28 sm:pb-32 space-y-3 font-space relative z-50 origin-top"
                        >
                            {/* Top luxury ember shimmer line */}
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF5A2E]/50 to-transparent pointer-events-none" />

                            {/* Ambient Glows in Menu */}
                            <div className="absolute top-0 right-10 w-64 h-64 bg-[radial-gradient(circle,rgba(255,90,46,0.12)_0%,transparent_70%)] rounded-full pointer-events-none" />
                            <div className="absolute bottom-10 left-10 w-56 h-56 bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)] rounded-full pointer-events-none" />

                            {/* Staggered Content Container */}
                            <motion.div
                                data-lenis-prevent
                                variants={{
                                    hidden: { opacity: 0 },
                                    show: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.03,
                                        },
                                    },
                                }}
                                initial="hidden"
                                animate="show"
                                className="relative z-10 max-w-5xl mx-auto space-y-3"
                            >
                                {/* 1. Hero Highlight: Worship Chords Portal */}
                                <motion.div variants={sectionVariants}>
                                    <Link
                                        href="/worship"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="group relative overflow-hidden rounded-2xl p-3 sm:p-3.5 bg-gradient-to-r from-[#FF5A2E]/25 via-[#FF8C68]/15 to-[#F59E0B]/15 border border-[#FF5A2E]/40 hover:border-[#FF5A2E]/70 flex items-center justify-between transition-all duration-300 shadow-[0_4px_25px_rgba(255,90,46,0.2)] active:scale-[0.99]"
                                    >
                                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF5A2E] to-[#C2361A] text-white flex items-center justify-center shadow-[0_0_15px_rgba(255,90,46,0.5)] shrink-0 group-hover:scale-105 transition-transform">
                                                <Music className="w-4 h-4" />
                                            </div>
                                            <div className="text-left min-w-0">
                                                <div className="text-xs sm:text-sm font-bold text-[#F4EDE2] group-hover:text-white flex items-center gap-1.5">
                                                    <span>Worship Chords Portal</span>
                                                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#FF5A2E]/25 text-[#FFB37A] border border-[#FF5A2E]/35 rounded-full uppercase tracking-wider">Live</span>
                                                </div>
                                                <div className="text-[10px] text-white/55 truncate">Transposed chords, lyrics & pad sounds</div>
                                            </div>
                                        </div>
                                        <div className="w-7 h-7 rounded-lg bg-white/10 group-hover:bg-[#FF5A2E] group-hover:text-neutral-950 text-white flex items-center justify-center transition-all shrink-0 ml-2">
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </Link>
                                </motion.div>

                                {/* 2. Balanced 2-Column Luxury Grid */}
                                <motion.div
                                    variants={sectionVariants}
                                    className="grid grid-cols-2 gap-2 sm:gap-3"
                                >
                                    {/* Left Column: Grow in Christ */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF9E79] px-1 py-0.5">
                                            <Sparkles className="w-3 h-3 text-[#FF5A2E]" />
                                            <span>Grow</span>
                                        </div>
                                        {growItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="group/item relative overflow-hidden rounded-xl bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.06] hover:border-[#FF5A2E]/40 p-2 sm:p-2.5 flex flex-col justify-between gap-1.5 transition-all duration-200 active:scale-[0.98]"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className={`w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center ${item.iconColor} group-hover/item:scale-105 transition-transform shrink-0`}>
                                                        <item.icon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <ChevronRight className="w-3 h-3 text-white/20 group-hover/item:text-amber-400 group-hover/item:translate-x-0.5 transition-all" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[12px] font-semibold text-[#F4EDE2] group-hover/item:text-white truncate">
                                                        {item.label}
                                                    </div>
                                                    <div className="text-[9.5px] text-white/45 group-hover/item:text-white/65 truncate">
                                                        {item.desc}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                        {/* Service timings as 4th card in Grow column */}
                                        <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-2 sm:p-2.5 flex flex-col justify-between gap-1">
                                            <div className="flex items-center gap-1.5 text-[#FFB37A]">
                                                <Clock className="w-3 h-3 text-[#FF5A2E]" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Services</span>
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-semibold text-[#F4EDE2]">Sun 10:30 AM</div>
                                                <div className="text-[9.5px] text-white/45">Fri 7:00 PM Prayer</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Church & Ministry */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFB37A] px-1 py-0.5">
                                            <MapPin className="w-3 h-3 text-[#FF5A2E]" />
                                            <span>Church</span>
                                        </div>
                                        {ministryItems.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="group/item relative overflow-hidden rounded-xl bg-white/[0.03] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/[0.06] hover:border-[#FF5A2E]/40 p-2 sm:p-2.5 flex flex-col justify-between gap-1.5 transition-all duration-200 active:scale-[0.98]"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className={`w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center ${item.iconColor} group-hover/item:scale-105 transition-transform shrink-0`}>
                                                        <item.icon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <ChevronRight className="w-3 h-3 text-white/20 group-hover/item:text-amber-400 group-hover/item:translate-x-0.5 transition-all" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[12px] font-semibold text-[#F4EDE2] group-hover/item:text-white truncate">
                                                        {item.label}
                                                    </div>
                                                    <div className="text-[9.5px] text-white/45 group-hover/item:text-white/65 truncate">
                                                        {item.desc}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* 3. Bottom Give & Partner Action */}
                                <motion.div variants={sectionVariants} className="pt-1">
                                    <Link
                                        href="/give"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FFB37A]/20 via-[#FF5A2E]/20 to-[#C2361A]/20 hover:from-[#FF5A2E]/30 hover:to-[#C2361A]/30 border border-[#FF5A2E]/40 text-[#F4EDE2] hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_2px_15px_rgba(255,90,46,0.2)] active:scale-[0.98]"
                                    >
                                        <Heart className="w-3.5 h-3.5 text-[#FF5A2E] fill-[#FF5A2E]" />
                                        <span>Partner & Give to Ministry</span>
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
}
