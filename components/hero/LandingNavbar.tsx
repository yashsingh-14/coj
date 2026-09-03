'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '../ui/Logo';
import { ChevronDown, Menu, X, Heart, Sparkles, MapPin, Music, Radio, BookOpen, UserCheck, Flame } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function LandingNavbar() {
    const setMode = useAppStore((state) => state.setMode);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [growDropdownOpen, setGrowDropdownOpen] = useState(false);
    const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 30);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
            isScrolled 
                ? 'bg-neutral-950/85 backdrop-blur-md border-b border-white/10 shadow-xl' 
                : 'bg-transparent border-b border-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-6 h-14 md:h-16 flex items-center justify-between">

                {/* Brand Logo */}
                <Link href="/" onClick={() => setMode('EXPERIENCE')} className="flex items-center group focus:outline-none translate-y-2 md:translate-y-3">
                    <Logo className="h-40 md:h-45 w-45 md:w-30" />
                </Link>

                {/* Desktop Menu Items */}
                <div className="hidden lg:flex items-center gap-8 font-semibold text-[15px] text-white">

                    {/* Grow Dropdown */}
                    <div
                        className="relative group py-2 cursor-pointer"
                        onMouseEnter={() => setGrowDropdownOpen(true)}
                        onMouseLeave={() => setGrowDropdownOpen(false)}
                    >
                        <button className="flex items-center gap-1.5 hover:text-amber-300 transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                            <span className="font-semibold tracking-wide">Grow</span>
                            <ChevronDown className="w-4 h-4 text-white/90 group-hover:rotate-180 transition-transform" />
                        </button>

                        {/* Dropdown Menu */}
                        {growDropdownOpen && (
                            <div className="absolute top-full left-0 w-60 p-2 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-1 animate-fade-in-down">
                                <Link href="/sermons" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <Radio className="w-4 h-4 text-amber-400" />
                                    <span>Sermons</span>
                                </Link>
                                <Link href="/podcasts" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <span>Podcasts</span>
                                </Link>
                                <Link href="/books" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <BookOpen className="w-4 h-4 text-amber-400" />
                                    <span>Books</span>
                                </Link>
                                <Link href="/god-stories" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <Flame className="w-4 h-4 text-amber-400" />
                                    <span>God Stories</span>
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
                            <ChevronDown className="w-4 h-4 text-white/90 group-hover:rotate-180 transition-transform" />
                        </button>

                        {/* Dropdown Menu */}
                        {aboutDropdownOpen && (
                            <div className="absolute top-full left-0 w-64 p-2 rounded-2xl bg-neutral-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-1 animate-fade-in-down">
                                <Link href="/our-journey" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <span>Our Journey</span>
                                </Link>
                                <Link href="/our-vision-and-mission" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <Flame className="w-4 h-4 text-amber-400" />
                                    <span>Our Vision & Mission</span>
                                </Link>
                                <Link href="/our-leaders" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/10 hover:text-amber-300 transition-all text-xs font-semibold">
                                    <UserCheck className="w-4 h-4 text-amber-400" />
                                    <span>Our Leaders</span>
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

                {/* Right CTA Button */}
                <div className="hidden lg:flex items-center gap-4">
                    <Link
                        href="/give"
                        className="liquid-btn group relative inline-flex items-center justify-center px-7 py-2.5 rounded-full border border-white/40 hover:border-amber-400/80 bg-white/10 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all duration-500"
                    >
                        {/* Water Bottle Liquid Fill (Rises up on hover with animated waves) */}
                        <div className="liquid-water-fill bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300 text-amber-300">
                            <svg className="liquid-wave-svg liquid-wave-1" viewBox="0 0 120 20" preserveAspectRatio="none">
                                <path d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z" fill="currentColor"/>
                            </svg>
                            <svg className="liquid-wave-svg liquid-wave-2 text-amber-200" viewBox="0 0 120 20" preserveAspectRatio="none">
                                <path d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z" fill="currentColor"/>
                            </svg>
                        </div>

                        <span className="relative z-10 group-hover:text-neutral-950 transition-colors duration-500">Give</span>
                    </Link>
                </div>

                {/* Mobile Menu Toggle Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all"
                    aria-label="Toggle Navigation Menu"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Drawer Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-neutral-950/95 backdrop-blur-2xl border-b border-white/10 px-6 py-6 space-y-4 animate-fade-in-down">
                    <div className="space-y-3 font-semibold text-sm text-neutral-200">
                        <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">Grow</div>
                        <div className="pl-4 space-y-2 border-l border-white/10">
                            <Link href="/sermons" onClick={() => setMobileMenuOpen(false)} className="block hover:text-amber-300">Sermons</Link>
                            <Link href="/podcasts" onClick={() => setMobileMenuOpen(false)} className="block hover:text-amber-300">Podcasts</Link>
                            <Link href="/books" onClick={() => setMobileMenuOpen(false)} className="block hover:text-amber-300">Books</Link>
                            <Link href="/god-stories" onClick={() => setMobileMenuOpen(false)} className="block hover:text-amber-300">God Stories</Link>
                        </div>

                        <Link href="/our-branches" onClick={() => setMobileMenuOpen(false)} className="block hover:text-amber-300 pt-2">Our Branches</Link>

                        <div className="text-xs uppercase tracking-widest text-amber-400 font-bold pt-2">About Us</div>
                        <div className="pl-4 space-y-2 border-l border-white/10">
                            <Link href="/our-journey" onClick={() => setMobileMenuOpen(false)} className="block hover:text-amber-300">Our Journey</Link>
                            <Link href="/our-vision-and-mission" onClick={() => setMobileMenuOpen(false)} className="block hover:text-amber-300">Our Vision & Mission</Link>
                            <Link href="/our-leaders" onClick={() => setMobileMenuOpen(false)} className="block hover:text-amber-300">Our Leaders</Link>
                        </div>

                        <Link
                            href="/worship"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full text-left font-bold text-amber-400 flex items-center gap-2 pt-2"
                        >
                            <Music className="w-4 h-4" />
                            <span>Worship Songs & Chords</span>
                        </Link>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <Link
                            href="/give"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block w-full text-center py-3 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider"
                        >
                            Give / Partner
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
