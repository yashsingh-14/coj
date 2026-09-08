'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../ui/Logo';
import { ChevronDown, ChevronRight, Menu, X, Heart, Sparkles, MapPin, Music, Radio, BookOpen, UserCheck, Flame, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function LandingNavbar() {
    const setMode = useAppStore((state) => state.setMode);
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

                    {/* Menu Toggle Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-[#F4EDE2] active:scale-90 transition-all shadow-md focus:outline-none"
                        aria-label="Toggle Navigation Menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-neutral-200" />}
                    </button>
                </div>
            </div>

            {/* Mobile & Tablet Luxury Glassmorphic Menu Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-x-0 top-14 md:top-16 max-h-[calc(100vh-3.5rem)] md:max-h-[calc(100vh-4rem)] overflow-y-auto bg-[#07060A]/90 backdrop-blur-3xl border-b border-white/[0.08] shadow-[0_30px_90px_rgba(0,0,0,0.95)] px-4 sm:px-8 py-6 space-y-5 animate-fade-in-down font-space relative">
                    {/* Top ambient luxury shimmer line */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#FF5A2E]/40 to-transparent pointer-events-none" />

                    {/* Ambient Glows in Menu */}
                    <div className="absolute top-0 right-10 w-72 h-72 bg-[radial-gradient(circle,rgba(255,90,46,0.14)_0%,transparent_70%)] rounded-full pointer-events-none" />
                    <div className="absolute bottom-10 left-10 w-60 h-60 bg-[radial-gradient(circle,rgba(245,158,11,0.10)_0%,transparent_70%)] rounded-full pointer-events-none" />

                    {/* Tablet/Mobile Glass Container */}
                    <div className="relative z-10 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

                        {/* Section 1: Grow in Christ */}
                        <div className="relative rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.015] border border-white/[0.08] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)] p-4 sm:p-5 space-y-3">
                            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#FF9E79]">
                                <Sparkles className="w-3.5 h-3.5 text-[#FF5A2E]" />
                                <span>Grow in Christ</span>
                            </div>
                            <div className="space-y-2">
                                <Link
                                    href="/sermons"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="group/item p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-[#FF5A2E]/30 flex items-center justify-between transition-all duration-300 active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-[#FF9E79] group-hover/item:text-white group-hover/item:border-[#FF5A2E]/40 group-hover/item:shadow-[0_0_15px_rgba(255,90,46,0.25)] shrink-0 transition-all">
                                            <Radio className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs sm:text-sm font-semibold text-[#F4EDE2] group-hover/item:text-white transition-colors">Sermons</div>
                                            <div className="text-[10px] sm:text-[11px] text-white/40 group-hover/item:text-white/65 transition-colors">Watch & Listen</div>
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-white/20 group-hover/item:text-amber-400 group-hover/item:border-amber-400/30 group-hover/item:translate-x-0.5 transition-all">
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </Link>

                                <Link
                                    href="/devotional"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="group/item p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-[#F59E0B]/30 flex items-center justify-between transition-all duration-300 active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-[#F59E0B] group-hover/item:text-white group-hover/item:border-[#F59E0B]/40 group-hover/item:shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0 transition-all">
                                            <BookOpen className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs sm:text-sm font-semibold text-[#F4EDE2] group-hover/item:text-white transition-colors">Daily Devotionals</div>
                                            <div className="text-[10px] sm:text-[11px] text-white/40 group-hover/item:text-white/65 transition-colors">Scripture & reflection</div>
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-white/20 group-hover/item:text-amber-400 group-hover/item:border-amber-400/30 group-hover/item:translate-x-0.5 transition-all">
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </Link>

                                <Link
                                    href="/god-stories"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="group/item p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-[#FF5A2E]/30 flex items-center justify-between transition-all duration-300 active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-[#FF8C68] group-hover/item:text-white group-hover/item:border-[#FF5A2E]/40 group-hover/item:shadow-[0_0_15px_rgba(255,90,46,0.25)] shrink-0 transition-all">
                                            <Flame className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs sm:text-sm font-semibold text-[#F4EDE2] group-hover/item:text-white transition-colors">God Stories</div>
                                            <div className="text-[10px] sm:text-[11px] text-white/40 group-hover/item:text-white/65 transition-colors">Miracle reports</div>
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-white/20 group-hover/item:text-amber-400 group-hover/item:border-amber-400/30 group-hover/item:translate-x-0.5 transition-all">
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Section 2: Church & Ministry */}
                        <div className="relative rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.015] border border-white/[0.08] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.08)] p-4 sm:p-5 space-y-3">
                            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#FFB37A]">
                                <MapPin className="w-3.5 h-3.5 text-[#FF5A2E]" />
                                <span>Church & Ministry</span>
                            </div>
                            <div className="space-y-2">
                                <Link
                                    href="/our-branches"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="group/item p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-[#FF5A2E]/30 flex items-center justify-between transition-all duration-300 active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-[#FF9E79] group-hover/item:text-white group-hover/item:border-[#FF5A2E]/40 group-hover/item:shadow-[0_0_15px_rgba(255,90,46,0.25)] shrink-0 transition-all">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs sm:text-sm font-semibold text-[#F4EDE2] group-hover/item:text-white transition-colors">Our Branches</div>
                                            <div className="text-[10px] sm:text-[11px] text-white/40 group-hover/item:text-white/65 transition-colors">Locations & timings</div>
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-white/20 group-hover/item:text-amber-400 group-hover/item:border-amber-400/30 group-hover/item:translate-x-0.5 transition-all">
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </Link>

                                <Link
                                    href="/our-journey"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="group/item p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-[#F59E0B]/30 flex items-center justify-between transition-all duration-300 active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-[#F59E0B] group-hover/item:text-white group-hover/item:border-[#F59E0B]/40 group-hover/item:shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0 transition-all">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs sm:text-sm font-semibold text-[#F4EDE2] group-hover/item:text-white transition-colors">Our Journey</div>
                                            <div className="text-[10px] sm:text-[11px] text-white/40 group-hover/item:text-white/65 transition-colors">From prayer roots</div>
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-white/20 group-hover/item:text-amber-400 group-hover/item:border-amber-400/30 group-hover/item:translate-x-0.5 transition-all">
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </Link>

                                <Link
                                    href="/our-vision-and-mission"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="group/item p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-[#FF5A2E]/30 flex items-center justify-between transition-all duration-300 active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-[#FF8C68] group-hover/item:text-white group-hover/item:border-[#FF5A2E]/40 group-hover/item:shadow-[0_0_15px_rgba(255,90,46,0.25)] shrink-0 transition-all">
                                            <Flame className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs sm:text-sm font-semibold text-[#F4EDE2] group-hover/item:text-white transition-colors">Vision & Mission</div>
                                            <div className="text-[10px] sm:text-[11px] text-white/40 group-hover/item:text-white/65 transition-colors">Kingdom calling</div>
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-white/20 group-hover/item:text-amber-400 group-hover/item:border-amber-400/30 group-hover/item:translate-x-0.5 transition-all">
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </Link>

                                <Link
                                    href="/our-leaders"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="group/item p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-[#FF8C68]/30 flex items-center justify-between transition-all duration-300 active:scale-[0.98]"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-[#FFB37A] group-hover/item:text-white group-hover/item:border-[#FF8C68]/40 group-hover/item:shadow-[0_0_15px_rgba(255,140,104,0.25)] shrink-0 transition-all">
                                            <UserCheck className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs sm:text-sm font-semibold text-[#F4EDE2] group-hover/item:text-white transition-colors">Our Leaders</div>
                                            <div className="text-[10px] sm:text-[11px] text-white/40 group-hover/item:text-white/65 transition-colors">Pastoral team</div>
                                        </div>
                                    </div>
                                    <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center text-white/20 group-hover/item:text-amber-400 group-hover/item:border-amber-400/30 group-hover/item:translate-x-0.5 transition-all">
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Section 3: Worship & Giving Highlight */}
                        <div className="relative rounded-3xl bg-gradient-to-br from-[#FF5A2E]/12 via-white/[0.03] to-[#F59E0B]/08 border border-[#FF5A2E]/25 backdrop-blur-2xl shadow-[0_8px_32px_rgba(255,90,46,0.15),inset_0_1px_1px_rgba(255,255,255,0.1)] p-4 sm:p-5 space-y-4 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#FFB37A]">
                                    <Music className="w-3.5 h-3.5 text-[#FF5A2E]" />
                                    <span>Worship Portal</span>
                                </div>
                                <p className="text-xs text-white/60 mt-2.5 leading-relaxed font-light">
                                    Interactive worship songs, transposed guitar chords, lyrics & pads.
                                </p>
                                <Link
                                    href="/worship"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="mt-3.5 w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FFB37A] via-[#FF5A2E] to-[#C2361A] hover:opacity-95 text-neutral-950 font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-all shadow-[0_0_25px_rgba(255,90,46,0.35)] active:scale-[0.98]"
                                >
                                    <span>Enter Worship Chords</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="pt-3 border-t border-white/10 space-y-2.5">
                                <div className="flex items-center gap-2 text-[10px] text-[#FFB37A] font-medium">
                                    <Clock className="w-3.5 h-3.5 text-[#FF5A2E]" />
                                    <span>Sun: 10:30 AM • Fri: 7:00 PM</span>
                                </div>
                                <Link
                                    href="/give"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-[#F4EDE2] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                >
                                    <Heart className="w-3.5 h-3.5 text-[#FF5A2E] fill-[#FF5A2E]" />
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

