'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../ui/Logo';
import { ChevronDown, Menu, X, Heart, Sparkles, MapPin, Music, Radio, BookOpen, UserCheck, Flame, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function LandingNavbar() {
    const setMode = useAppStore((state) => state.setMode);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [growDropdownOpen, setGrowDropdownOpen] = useState(false);
    const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent background scrolling when mobile/tablet menu drawer is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    return (
        <nav
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-none ${
                isScrolled || mobileMenuOpen
                    ? 'bg-[#02000F]/90 backdrop-blur-xl shadow-lg'
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
                    className="flex items-center group focus:outline-none translate-y-3 sm:translate-y-3.5 md:translate-y-4"
                >
                    <Logo className="h-36 sm:h-40 md:h-44 w-auto" />
                </Link>

                {/* Desktop Navigation Links (>= lg) */}
                <div className="hidden lg:flex items-center gap-8 font-semibold text-[15px] text-white">

                    {/* Grow Dropdown */}
                    <div
                        className="relative group py-2 cursor-pointer"
                        onMouseEnter={() => setGrowDropdownOpen(true)}
                        onMouseLeave={() => setGrowDropdownOpen(false)}
                    >
                        <button className="flex items-center gap-1.5 hover:text-amber-300 transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                            <span className="font-semibold tracking-wide">Grow</span>
                            <ChevronDown className={`w-4 h-4 text-white/90 transition-transform duration-300 ${growDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {growDropdownOpen && (
                            <div className="absolute top-full left-0 w-64 p-2.5 rounded-2xl bg-[#080816]/95 backdrop-blur-2xl border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.8)] space-y-1 animate-fade-in-down">
                                <Link href="/sermons" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                                        <Radio className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Sermons</div>
                                        <div className="text-[10px] text-white/40 font-normal">Sunday & Friday Messages</div>
                                    </div>
                                </Link>
                                <Link href="/podcasts" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Podcasts</div>
                                        <div className="text-[10px] text-white/40 font-normal">Spirit-led teachings</div>
                                    </div>
                                </Link>
                                <Link href="/books" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                                        <BookOpen className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Books</div>
                                        <div className="text-[10px] text-white/40 font-normal">Spiritual growth resources</div>
                                    </div>
                                </Link>
                                <Link href="/god-stories" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
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
                    <Link href="/our-branches" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold tracking-wide">Our Branches</span>
                    </Link>

                    {/* About Us Dropdown */}
                    <div
                        className="relative group py-2 cursor-pointer"
                        onMouseEnter={() => setAboutDropdownOpen(true)}
                        onMouseLeave={() => setAboutDropdownOpen(false)}
                    >
                        <button className="flex items-center gap-1.5 hover:text-amber-300 transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                            <span className="font-semibold tracking-wide">About Us</span>
                            <ChevronDown className={`w-4 h-4 text-white/90 transition-transform duration-300 ${aboutDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {aboutDropdownOpen && (
                            <div className="absolute top-full left-0 w-64 p-2.5 rounded-2xl bg-[#080816]/95 backdrop-blur-2xl border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.8)] space-y-1 animate-fade-in-down">
                                <Link href="/our-journey" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Our Journey</div>
                                        <div className="text-[10px] text-white/40 font-normal">God&apos;s faithfulness</div>
                                    </div>
                                </Link>
                                <Link href="/our-vision-and-mission" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                                        <Flame className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Vision & Mission</div>
                                        <div className="text-[10px] text-white/40 font-normal">Kingdom purpose</div>
                                    </div>
                                </Link>
                                <Link href="/our-leaders" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Our Leaders</div>
                                        <div className="text-[10px] text-white/40 font-normal">Pastoral leadership</div>
                                    </div>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Worship Portal */}
                    <Link
                        href="/worship"
                        className="hover:text-amber-200 transition-colors flex items-center gap-1.5 text-amber-300 font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
                    >
                        <Music className="w-4 h-4 text-amber-400" />
                        <span className="font-bold tracking-wide">Worship Chords</span>
                    </Link>

                </div>

                {/* Right Desktop CTA Button */}
                <div className="hidden lg:flex items-center gap-4">
                    <Link
                        href="/give"
                        className="liquid-btn group relative inline-flex items-center justify-center px-7 py-2.5 rounded-full border border-white/40 hover:border-amber-400/80 bg-white/10 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all duration-500"
                    >
                        <div className="liquid-water-fill bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300 text-amber-300">
                            <svg className="liquid-wave-svg liquid-wave-1" viewBox="0 0 120 20" preserveAspectRatio="none">
                                <path d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z" fill="currentColor" />
                            </svg>
                            <svg className="liquid-wave-svg liquid-wave-2 text-amber-200" viewBox="0 0 120 20" preserveAspectRatio="none">
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
                        className="liquid-btn group relative inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/40 hover:border-amber-400/80 bg-white/10 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-500 active:scale-95"
                    >
                        <div className="liquid-water-fill bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300 text-amber-300">
                            <svg className="liquid-wave-svg liquid-wave-1" viewBox="0 0 120 20" preserveAspectRatio="none">
                                <path d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z" fill="currentColor" />
                            </svg>
                            <svg className="liquid-wave-svg liquid-wave-2 text-amber-200" viewBox="0 0 120 20" preserveAspectRatio="none">
                                <path d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z" fill="currentColor" />
                            </svg>
                        </div>
                        <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/50 relative z-10 group-hover:text-neutral-950 group-hover:fill-neutral-950 transition-colors" />
                        <span className="relative z-10 group-hover:text-neutral-950 transition-colors duration-500">Give</span>
                    </Link>

                    {/* Menu Toggle Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-white active:scale-90 transition-all shadow-md focus:outline-none"
                        aria-label="Toggle Navigation Menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-neutral-200" />}
                    </button>
                </div>
            </div>

            {/* Mobile & Tablet Luxury Menu Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-x-0 top-14 md:top-16 max-h-[calc(100vh-4rem)] overflow-y-auto bg-[#040212]/98 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] px-4 sm:px-8 py-6 space-y-6 animate-fade-in-down">
                    {/* Ambient Glow in Menu */}
                    <div className="absolute top-0 right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />
                    <div className="absolute bottom-10 left-10 w-48 h-48 bg-purple-900/15 rounded-full blur-[80px] pointer-events-none" />

                    {/* Tablet/Mobile Grid Layout */}
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

                        {/* Section 1: Grow & Word */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Grow in Christ</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                                <Link
                                    href="/sermons"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] hover:border-amber-500/30 flex items-center gap-2.5 transition-all group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                                        <Radio className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Sermons</div>
                                        <div className="text-[10px] text-white/40">Watch & Listen</div>
                                    </div>
                                </Link>

                                <Link
                                    href="/podcasts"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] hover:border-amber-500/30 flex items-center gap-2.5 transition-all group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                                        <Sparkles className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Podcasts</div>
                                        <div className="text-[10px] text-white/40">Audio teachings</div>
                                    </div>
                                </Link>

                                <Link
                                    href="/books"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] hover:border-amber-500/30 flex items-center gap-2.5 transition-all group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                                        <BookOpen className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Books</div>
                                        <div className="text-[10px] text-white/40">Study library</div>
                                    </div>
                                </Link>

                                <Link
                                    href="/god-stories"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] hover:border-amber-500/30 flex items-center gap-2.5 transition-all group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                                        <Flame className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">God Stories</div>
                                        <div className="text-[10px] text-white/40">Miracle reports</div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Section 2: Church & Leadership */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-3">
                            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>Church & Ministry</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                                <Link
                                    href="/our-branches"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] hover:border-amber-500/30 flex items-center gap-2.5 transition-all group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                                        <MapPin className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Our Branches</div>
                                        <div className="text-[10px] text-white/40">Locations & timings</div>
                                    </div>
                                </Link>

                                <Link
                                    href="/our-journey"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] hover:border-amber-500/30 flex items-center gap-2.5 transition-all group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                                        <Sparkles className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Our Journey</div>
                                        <div className="text-[10px] text-white/40">From prayer roots</div>
                                    </div>
                                </Link>

                                <Link
                                    href="/our-vision-and-mission"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] hover:border-amber-500/30 flex items-center gap-2.5 transition-all group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                                        <Flame className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Vision & Mission</div>
                                        <div className="text-[10px] text-white/40">Kingdom calling</div>
                                    </div>
                                </Link>

                                <Link
                                    href="/our-leaders"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.04] hover:border-amber-500/30 flex items-center gap-2.5 transition-all group"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                                        <UserCheck className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">Our Leaders</div>
                                        <div className="text-[10px] text-white/40">Pastoral team</div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Section 3: Worship & Giving Highlight */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-900/10 to-black border border-amber-500/30 space-y-3 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
                                    <Music className="w-3.5 h-3.5" />
                                    <span>Worship Portal</span>
                                </div>
                                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                                    Interactive worship songs, transposed guitar chords, lyrics & pads.
                                </p>
                                <Link
                                    href="/worship"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-between transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95"
                                >
                                    <span>Enter Worship Chords</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="pt-3 border-t border-white/10 space-y-2">
                                <div className="flex items-center gap-2 text-[10px] text-amber-300/80">
                                    <Clock className="w-3 h-3" />
                                    <span>Sun: 10:30 AM • Fri: 7:00 PM</span>
                                </div>
                                <Link
                                    href="/give"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                                >
                                    <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                    <span>Partner / Give</span>
                                </Link>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </nav>
    );
}

