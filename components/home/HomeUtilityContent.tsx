'use client';

import { Star, Sparkles, Mic2, User, Menu, ChevronRight, Heart, Music2, TrendingUp, ArrowRight, Youtube, Instagram, Facebook, MessageCircle, Megaphone, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BlackRemoverImage from '@/components/ui/BlackRemoverImage';
import React, { useState, useEffect, TouchEvent } from 'react';
import Sidebar from '../ui/Sidebar';
import Logo from '../ui/Logo';
import TiltCard from '../ui/TiltCard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '@/lib/supabaseClient';
import { Song } from '@/data/types';
import { getVerseOfTheDay } from '@/lib/getVerseOfTheDay';
import ShareButton from '@/components/ui/ShareButton';
import NotificationPrompt from '@/components/ui/NotificationPrompt';

gsap.registerPlugin(ScrollTrigger);

import { useAppStore } from '@/store/useAppStore';

export default function HomeUtilityContent({
    trendingSongs,
    madeForYouSongs,
    featuredSongs,
    heroSlides,
    dbVerse,
    announcements
}: {
    trendingSongs: Song[];
    madeForYouSongs: Song[];
    featuredSongs: Song[];
    heroSlides: any[];
    dbVerse: any;
    announcements: any[];
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { currentUser, isAuthenticated, logout } = useAppStore();

    // Newsletter State
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!email) {
            toast.error("Please enter an email address.");
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            toast.error("Please enter a valid email.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('subscribers').insert([{ email }]);

            if (error) {
                if (error.code === '23505') { // Unique violation
                    toast.success("You're already on the list!");
                    setEmail('');
                } else {
                    console.error("Subscription Error:", error);
                    toast.error("Something went wrong. Please try again.");
                }
            } else {
                toast.success("You're on the list! Stay tuned.");
                setEmail('');
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to subscribe.");
        } finally {
            setLoading(false);
        }
    };

    // Get today's verse (DB > Local Fallback)
    const todaysVerse = dbVerse || getVerseOfTheDay();

    // Helper to resolve song image with fallbacks: Custom Img -> YouTube Thum -> Default Fallback
    // Helper to resolve song image with fallbacks: Custom Img -> YouTube Thum -> Default Fallback
    // Helper to resolve song image with fallbacks: Custom Img -> YouTube Thum -> Default Fallback
    const getSongImage = (song: Song) => {
        // 1. PRIORITY: Check YouTube Thumbnail FIRST (User Request)
        // We use 'hqdefault' because 'maxresdefault' often returns 404 for non-HD videos.
        const yId = song.youtube_id || song.youtubeId;
        if (yId && yId.trim().length > 5 && yId !== "null" && yId !== "undefined") {
            return `https://img.youtube.com/vi/${yId}/hqdefault.jpg`;
        }

        // 2. Check Custom Image (valid URL, not "null"/"undefined")
        if (song.img && song.img.trim().length > 5 && song.img !== "null" && song.img !== "undefined") {
            return song.img;
        }

        // 3. Last Resort Fallback
        return "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80";
    };

    useEffect(() => {
        // Simple entry animation using standard timeouts/CSS to ensure visibility
        const sections = document.querySelectorAll('.section-anim');
        sections.forEach((section, index) => {
            setTimeout(() => {
                section.classList.remove('opacity-0', 'translate-y-8');
            }, 100 * index);
        });
    }, []);

    return (
        <div className="w-full bg-[#02000F] min-h-screen text-white pb-32 overflow-x-hidden selection:bg-[var(--brand)] selection:text-white">

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* HEADER */}
            <header className="px-6 pt-8 pb-4 flex items-center justify-between gap-4 sticky top-0 z-40 bg-[#02000F]/80 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-4 animate-fade-in-down">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <Menu className="w-6 h-6 text-white" />
                    </button>
                    <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        COJ<span className="text-[var(--brand)]">worship</span>
                    </h1>
                </div>

                <div className="animate-fade-in-down" style={{ animationDelay: '0.1s' }}>
                    {isAuthenticated && currentUser ? (
                        <div className="w-9 h-9 rounded-full bg-[var(--brand)] flex items-center justify-center overflow-hidden border border-white/20">
                            {currentUser.avatar ? (
                                <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-white text-xs">{currentUser.name.charAt(0)}</span>
                            )}
                        </div>
                    ) : (
                        <Link href="/signin" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[var(--brand)] flex items-center justify-center transition-colors border border-white/5">
                            <User className="w-5 h-5 text-white/70" />
                        </Link>
                    )}
                </div>
            </header>

            {/* ANNOUNCEMENTS BANNER - PREMIUM REDESIGN */}
            {announcements && announcements.length > 0 && (
                <div className="relative mx-4 md:mx-6 mt-6 mb-2 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
                    {/* Glass Container */}
                    <div className="relative overflow-hidden rounded-full bg-gradient-to-r from-amber-900/20 via-[#0A0A0A] to-amber-900/20 border border-amber-500/20 backdrop-blur-xl shadow-[0_0_20px_rgba(245,158,11,0.05)] group">

                        {/* Subtle Gold Glow Background */}
                        <div className="absolute inset-0 bg-amber-500/5 mix-blend-overlay"></div>

                        <div className="py-2 flex items-center relative z-10">
                            {/* Floating Badge */}
                            <div className="absolute left-1.5 top-1.5 bottom-1.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full px-3 flex items-center justify-center z-20 shadow-lg shadow-amber-500/20 border border-white/20">
                                <Megaphone className="w-3 h-3 text-black fill-white/20" />
                                <span className="text-[9px] font-black text-black ml-2 uppercase tracking-wide hidden md:block">Update</span>
                            </div>

                            {/* Marquee Text */}
                            <div className="flex gap-12 animate-marquee whitespace-nowrap pl-14 md:pl-28 pr-4 w-full" style={{ maskImage: 'linear-gradient(to right, transparent, black 40px, black 95%, transparent)' }}>
                                {announcements.map((a, i) => (
                                    <span key={i} className="text-amber-100/90 font-medium text-xs uppercase tracking-[0.15em] flex items-center gap-4 text-shadow-sm">
                                        {a.message}
                                        <div className="w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_5px_currentColor]"></div>
                                    </span>
                                ))}
                                {/* Duplicates for continuity */}
                                {announcements.map((a, i) => (
                                    <span key={`dup-${i}`} className="text-amber-100/90 font-medium text-xs uppercase tracking-[0.15em] flex items-center gap-4 text-shadow-sm">
                                        {a.message}
                                        <div className="w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_5px_currentColor]"></div>
                                    </span>
                                ))}
                                {announcements.map((a, i) => (
                                    <span key={`dup2-${i}`} className="text-amber-100/90 font-medium text-xs uppercase tracking-[0.15em] flex items-center gap-4 text-shadow-sm">
                                        {a.message}
                                        <div className="w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_5px_currentColor]"></div>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HERO CAROUSEL */}
            <section className="px-5 mb-10 mt-4 animate-slide-up">
                <HeroCarousel slides={heroSlides.length > 0 ? heroSlides : undefined} />
            </section>

            {/* FEATURED SONGS - NEW SECTION */}
            {featuredSongs && featuredSongs.length > 0 && (
                <section className="px-5 mb-14 section-anim opacity-0 translate-y-8 transition-all duration-700 ease-out">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <h2 className="text-xl font-black text-white uppercase tracking-wider">Featured This Week</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {featuredSongs.map((song, i) => (
                            <Link key={i} href={`/songs/${song.id}`} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-all group">
                                <div className="w-16 h-16 rounded-lg overflow-hidden relative flex-shrink-0">
                                    <img src={getSongImage(song)} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white truncate">{song.title}</h3>
                                    <p className="text-xs text-white/50 uppercase tracking-wider">{song.artist}</p>
                                </div>
                                <div className="ml-auto w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors">
                                    <PlayCircle className="w-5 h-5" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* CATEGORIES - HOLOGRAPHIC TILES (UPDATED: GAP-16) */}
            <section className="px-5 mb-14 section-anim opacity-0 translate-y-8 transition-all duration-700 ease-out">
                {/* Responsive gap: smaller on mobile, larger on desktop */}
                <div className="flex gap-6 md:gap-12 lg:gap-16 overflow-x-auto no-scrollbar pb-12 md:pb-16 justify-start md:justify-center px-2 md:px-4 pt-6 md:pt-8">
                    {[
                        { name: 'Praise', icon: Sparkles, from: 'from-orange-400', to: 'to-red-600', shadow: 'shadow-orange-500/30' },
                        { name: 'Worship', icon: Heart, from: 'from-purple-500', to: 'to-indigo-600', shadow: 'shadow-purple-500/30' },
                        { name: 'Kids', icon: Star, from: 'from-pink-400', to: 'to-rose-600', shadow: 'shadow-pink-500/30' },
                        { name: 'Sermons', icon: Mic2, from: 'from-blue-400', to: 'to-cyan-600', shadow: 'shadow-blue-500/30', href: '/sermons' },
                        { name: 'Hymns', icon: Music2, from: 'from-emerald-400', to: 'to-teal-600', shadow: 'shadow-emerald-500/30' },
                        { name: 'Hindi', icon: Star, from: 'from-orange-500', to: 'to-yellow-500', shadow: 'shadow-orange-500/30' },
                    ].map((cat, i) => {
                        const Icon = cat.icon;
                        return (
                            <TiltCard key={i} className="min-w-[110px] md:min-w-[140px] h-[110px] md:h-[150px]" max={20} scale={1.15}>
                                <div className="relative w-full h-full group">

                                    {/* SUPER GLOW (The "Blow" Effect) 
                                        - Huge blur [30px]
                                        - Opacity explodes to 100 on hover
                                        - Scales up to 1.25x
                                    */}
                                    <div className={`
                                        absolute inset-0 rounded-3xl 
                                        bg-gradient-to-br ${cat.from} ${cat.to} 
                                        blur-[30px] opacity-20 group-hover:opacity-100 
                                        transition-all duration-500 group-hover:scale-125
                                    `}></div>

                                    <Link
                                        href={cat.href || `/categories/${cat.name.toLowerCase()}`}
                                        className={`
                                            relative w-full h-full rounded-3xl 
                                            bg-gradient-to-br ${cat.from} ${cat.to}
                                            border border-white/20 group-hover:border-white/50
                                            flex flex-col items-center justify-center gap-3
                                            shadow-2xl ${cat.shadow}
                                            transition-all duration-300
                                            transform-style-3d
                                            overflow-hidden
                                        `}
                                    >
                                        {/* Dynamic Shine Layer */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out skew-x-12" />

                                        {/* Glass Surface */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10 opacity-50" />

                                        {/* 3D Floating Icon */}
                                        <div className="transform-style-3d translate-z-12 group-hover:translate-z-20 transition-transform duration-500">
                                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/40 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-shadow">
                                                <Icon className="w-7 h-7 text-white drop-shadow-md" />
                                            </div>
                                        </div>

                                        {/* 3D Text */}
                                        <span className="text-xl font-black text-white tracking-widest uppercase transform-style-3d translate-z-8 group-hover:translate-z-12 transition-transform duration-500 drop-shadow-xl">
                                            {cat.name}
                                        </span>
                                    </Link>
                                </div>
                            </TiltCard>
                        );
                    })}
                </div>
            </section>

            {/* VERSE OF THE DAY (New Cinematic Section) */}
            {/* VERSE OF THE DAY - ULTIMATE PREMIUM (GOLD & GLASS) */}
            <section className="mb-24 section-anim relative px-4 md:px-6 py-8 opacity-0 translate-y-8 transition-all duration-700 ease-out">
                <TiltCard className="w-full" max={8} scale={1.02}>
                    <div className="relative rounded-[2rem] md:rounded-[3rem] overflow-hidden group border border-white/10 shadow-2xl shadow-black/50 pt-8 md:pt-12 pb-16 md:pb-24 px-4 md:px-6">
                        {/* Parallax Background - Cinematic Slow Pan */}
                        <div className="absolute inset-0 bg-cover bg-center scale-125 group-hover:scale-110 transition-transform duration-[30s] ease-linear" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507646870319-5bb8e411b742?q=80&w=2070&auto=format&fit=crop')" }}></div>

                        {/* Divine Layers - INTENSIFIED GOLD */}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-1000"></div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-amber-600/40 via-yellow-500/20 to-purple-900/30 mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60"></div>

                        {/* Gold Border Glow */}
                        <div className="absolute inset-0 border-[1px] border-amber-500/30 rounded-[3rem] m-2 box-border"></div>
                        <div className="absolute inset-0 border-[1px] border-[var(--chord)]/50 rounded-[3rem] m-3 opacity-60"></div>

                        {/* Content Container - Floating Glass */}
                        <div className="relative z-10 max-w-5xl mx-auto text-center transform-style-3d perspective-1000">

                            {/* Corner Label */}
                            <div className="absolute top-0 left-0 md:left-4 opacity-50">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-white font-sans font-bold border border-white/20 px-3 py-1 rounded-full">
                                    Verse of the Day
                                </span>
                            </div>

                            {/* CALL OF JESUS LOGO (User Reference) */}
                            <div className="flex flex-col items-center justify-center transform-style-3d animate-float-slow">
                                <Logo className="w-40 md:w-60 h-auto" />
                            </div>

                            <h2 className="-mt-12 md:-mt-16 text-lg md:text-4xl lg:text-6xl font-serif italic leading-tight mb-6 md:mb-10 drop-shadow-2xl px-2 md:px-4 relative verse-text-shine">
                                <span className="absolute -top-6 md:-top-10 left-0 text-[60px] md:text-[100px] opacity-10 font-serif text-[var(--chord)]">&quot;</span>
                                {todaysVerse.text}
                                <span className="absolute -bottom-12 md:-bottom-20 right-0 text-[60px] md:text-[100px] opacity-10 font-serif text-[var(--chord)]">&quot;</span>
                            </h2>

                            <div className="flex flex-col items-center gap-4 md:gap-8 translate-z-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] w-12 bg-[var(--chord)]/50"></div>
                                    <span className="text-[var(--chord)] font-bold tracking-[0.4em] uppercase text-sm">{todaysVerse.reference}</span>
                                    <div className="h-[1px] w-12 bg-[var(--chord)]/50"></div>
                                </div>

                                <Link href="/devotional" className="group relative px-6 md:px-10 py-3 md:py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden transition-all hover:bg-white/10 hover:border-[var(--chord)]/50 hover:shadow-[0_0_30px_rgba(255,193,7,0.2)] inline-block translate-z-10">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
                                    <span className="relative text-white font-bold tracking-widest text-sm flex items-center gap-3">
                                        READ DEVOTIONAL <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                                <NotificationPrompt />
                            </div>
                        </div>

                        {/* Signature */}
                        <div className="absolute bottom-8 right-10 opacity-70">
                            <p className="text-white/60 text-xs font-serif italic tracking-widest text-right">
                                Ps. Samson Wilson
                            </p>
                        </div>
                    </div>
                </TiltCard>
            </section>

            {/* TRENDING WORSHIP - CINEMATIC CHARTS */}
            <section className="mb-16 md:mb-20 pl-4 md:pl-6 section-anim opacity-0 translate-y-8 transition-all duration-700 ease-out">
                <div className="flex justify-between items-end pr-4 md:pr-6 mb-6 md:mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                            </span>
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500">Global Charts</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tighter shadow-white drop-shadow-lg">
                            TRENDING <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">NOW</span>
                        </h2>
                    </div>
                </div>

                <div className="flex gap-4 md:gap-8 overflow-x-auto pb-8 md:pb-12 no-scrollbar pr-4 md:pr-6 snap-x snap-mandatory pt-4">
                    {trendingSongs.map((song, i) => (
                        <div key={i} className="min-w-[220px] md:min-w-[260px] lg:min-w-[300px] snap-start group relative">
                            {/* Giant Number Background */}
                            <span className="absolute -left-2 md:-left-4 -top-8 md:-top-12 text-[80px] md:text-[120px] font-black text-white/5 z-0 group-hover:text-white/10 transition-colors duration-500 select-none font-serif italic">
                                {i + 1}
                            </span>

                            {/* Card Container */}
                            <TiltCard className="w-full aspect-[2/3]" max={10} scale={1.05}>
                                <Link href={`/songs/${song.id}`} className="block relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl bg-[#111] group-hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] transition-shadow duration-500 border border-white/10">

                                    {/* Image */}
                                    <img
                                        src={getSongImage(song)}
                                        alt={song.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80";
                                        }}
                                    />

                                    {/* Dark Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />

                                    {/* Glass Shine */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Content Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">

                                        {/* Play Button */}
                                        {/* Play Button Removed */}

                                        <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                            <TrendingUp className="w-4 h-4 text-red-500" />
                                            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">1M+ Listening</span>
                                        </div>

                                        <h3 className="text-2xl md:text-3xl font-black text-white leading-none mb-1 drop-shadow-md truncate">{song.title}</h3>
                                        <p className="text-white/60 font-medium tracking-wide truncate">{song.artist}</p>

                                        {/* Progress Bar Decoration */}
                                        <div className="w-full h-1 bg-white/20 rounded-full mt-4 overflow-hidden">
                                            <div className="h-full bg-red-600 w-2/3 group-hover:w-full transition-all duration-1000 ease-out" />
                                        </div>
                                    </div>
                                </Link>
                            </TiltCard>
                        </div>
                    ))}
                </div>
            </section>

            {/* FEATURED ARTISTS - MINDBLOWING REDESIGN */}
            <section className="mb-20 md:mb-24 pl-4 md:pl-6 section-anim opacity-0 translate-y-8 transition-all duration-700 ease-out">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-8 md:mb-10 tracking-tighter">
                    ICONS OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]">WORSHIP</span>
                </h2>

                <div className="flex gap-4 md:gap-8 overflow-x-auto pb-8 md:pb-12 no-scrollbar pr-4 md:pr-6 snap-x snap-mandatory">
                    {[
                        { name: 'Sheldon Bangera', img: 'https://img.youtube.com/vi/X0o3-q3aX7w/maxresdefault.jpg' },
                        { name: 'Yeshua Band', img: 'https://img.youtube.com/vi/2n-pT3M0N90/maxresdefault.jpg' },
                        { name: 'Bridge Music', img: 'https://img.youtube.com/vi/nPV9Fvo59L0/hqdefault.jpg' },
                        { name: 'Amit Kamble', img: 'https://img.youtube.com/vi/5rYFjX1-KzE/hqdefault.jpg' },
                        { name: 'One Tribe', img: 'https://img.youtube.com/vi/h4u7q2d40rM/hqdefault.jpg' },
                        { name: 'Shelley Reddy', img: 'https://img.youtube.com/vi/6K_p24s0z3w/hqdefault.jpg' },
                        { name: 'Anil Kant', img: 'https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=800&auto=format&fit=crop' },
                        { name: 'Hillsong', img: 'https://images.unsplash.com/photo-1459749411177-33481156047b?q=80&w=800&auto=format&fit=crop' },
                        { name: 'Bethel', img: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop' },
                        { name: 'Elevation', img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop' },
                        { name: 'Maverick', img: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=800&auto=format&fit=crop' }
                    ].map((artist, i) => (
                        <div key={i} className="min-w-[240px] md:min-w-[280px] snap-center group relative cursor-pointer">
                            <TiltCard className="w-full h-[340px] md:h-[400px]" max={12} scale={1.05}>
                                <Link
                                    href={`/artists/${artist.name.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="relative block w-full h-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-[#111] shadow-2xl group-hover:shadow-[0_0_50px_rgba(233,30,99,0.3)] transition-shadow duration-500 border border-white/10"
                                >
                                    {/* Background Image with Zoom */}
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.5s] ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
                                        style={{ backgroundImage: `url('${artist.img}')` }}
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500" />

                                    {/* Glass Shine */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Decorative Border */}
                                    <div className="absolute inset-0 border-[1.5px] border-white/10 rounded-[2.5rem] group-hover:border-[var(--brand)]/50 transition-colors duration-500" />

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 w-full p-5 md:p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="w-12 h-1.5 bg-[var(--brand)] mb-4 w-0 group-hover:w-12 transition-all duration-500 ease-out" />

                                        <h3 className="text-3xl md:text-4xl font-black text-white uppercase leading-[0.9] tracking-tighter mb-3 drop-shadow-lg">
                                            {artist.name}
                                        </h3>

                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white tracking-wider">
                                                VIEW SONGS
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-white" />
                                        </div>
                                    </div>

                                    {/* Floating Icon */}
                                    <div className="absolute top-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-500 border border-white/20 shadow-lg">
                                        <Mic2 className="w-6 h-6 text-white" />
                                    </div>
                                </Link>
                            </TiltCard>
                        </div>
                    ))}
                </div>
            </section>

            {/* MADE FOR YOU - OBSIDIAN GLASS CARDS (Expanded to 20) */}
            <section className="px-4 md:px-5 mb-24 md:mb-32 section-anim opacity-0 translate-y-8 transition-all duration-700 ease-out">
                <div className="flex items-center justify-between mb-6 md:mb-8 px-1 md:px-2">
                    <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white drop-shadow-lg">
                        Made For <span className="text-[var(--brand)]">You</span>
                    </h2>
                    <Link href="/songs" className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-1 group">
                        View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {madeForYouSongs.map((song, i) => (
                        <TiltCard key={i} className="h-full min-h-[250px]" max={15} scale={1.05}>
                            <div className="relative h-full group">
                                <Link
                                    href={`/songs/${song.id}`}
                                    className="relative flex flex-col justify-end p-6 rounded-[2rem] bg-[#0A0A0A] border border-white/10 overflow-hidden h-full group-hover:bg-[#111] transition-colors"
                                >
                                    {/* Album Art Background */}
                                    <img
                                        src={getSongImage(song)}
                                        alt={song.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80";
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                                    {/* Glass Shine */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Floating Play Overlay - REMOVED */}

                                    {/* Content Info */}
                                    <div className="relative z-10 transform-style-3d translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/40">
                                                {song.category.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="font-black text-xl text-white leading-none mb-1 drop-shadow-lg line-clamp-1">{song.title}</h3>
                                            <p className="text-xs text-white/70 font-bold uppercase tracking-widest line-clamp-1">
                                                {song.artist}
                                            </p>
                                        </div>

                                        <div className="w-full h-1 bg-white/20 rounded-full mt-3 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                            <div className="h-full bg-[var(--brand)] w-full animate-loader"></div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </TiltCard>
                    ))}
                </div>
            </section>

            {/* FOOTER */}
            {/* PREMIUM FOOTER */}
            <footer className="relative mt-32 pt-20 pb-10 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute inset-0 bg-[#02000F]"></div>
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_20px_#FFD700] opacity-80"></div>
                <div className="absolute top-[1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-900 to-transparent opacity-50"></div>
                <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 px-6 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
                        {/* Brand Column */}
                        <div className="md:col-span-5">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative w-14 h-14 -ml-2">
                                    <div className="w-full h-full animate-fire-pulse-footer">
                                        <BlackRemoverImage
                                            src="/images/logo-footer-final.png"
                                            alt="COJ Fire"
                                            threshold={80}
                                            className="w-full h-full object-contain scale-125"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-center w-full">
                                    <span className="text-xl font-black text-white leading-none tracking-tight">CALL OF JESUS</span>

                                    {/* Divider with Shine */}
                                    <div className="relative h-[2px] w-50 my-0.5 rounded-full overflow-hidden">
                                        {/* Base Gold Line */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-600/50 to-transparent shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>

                                        {/* Running Shine */}
                                        <div className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white to-transparent opacity-80 animate-shine-line"></div>
                                    </div>

                                    <span className="text-[0.65rem] font-bold text-amber-500 tracking-[0.35em] uppercase leading-tight ml-0.5 text-left">MINISTRIES</span>
                                </div>
                            </div>
                            <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-8">
                                Empowering worship leaders and believers to encounter God through music, lyrics, and creative expression. Built for His glory.
                            </p>

                            <div className="flex gap-4">
                                <div className="flex gap-4">
                                    {[
                                        { icon: Youtube, label: 'Youtube', href: 'https://www.youtube.com/@callofjesusministries' },
                                        { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/cojministries/?igshid=OGQ5ZDc2ODk2ZA%3D%3D#' },
                                        { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/COJMinistries?mibextid=zLoPMf' },
                                        { icon: MessageCircle, label: 'WhatsApp', href: 'https://www.whatsapp.com/channel/0029Vb5y3CxGJP8Bjv8eeT09' }
                                    ].map((social) => (
                                        <a
                                            href={social.href}
                                            key={social.label}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-amber-500/50 hover:scale-110 transition-all duration-300 group"
                                        >
                                            <span className="sr-only">{social.label}</span>
                                            <social.icon className="w-4 h-4" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Links Columns */}
                        <div className="md:col-span-2 col-span-6">
                            <h4 className="text-white font-bold mb-6">Discover</h4>
                            <ul className="space-y-4">
                                <li>
                                    <Link href="/new-arrivals" className="text-white/40 hover:text-amber-500 text-sm transition-colors">New Arrivals</Link>
                                </li>
                                <li>
                                    <Link href="/trending" className="text-white/40 hover:text-amber-500 text-sm transition-colors">Trending</Link>
                                </li>
                                <li>
                                    <Link href="/artists" className="text-white/40 hover:text-amber-500 text-sm transition-colors">Artists</Link>
                                </li>
                                <li>
                                    <Link href="/devotional" className="text-white/40 hover:text-amber-500 text-sm transition-colors">Devotionals</Link>
                                </li>
                            </ul>
                        </div>

                        <div className="md:col-span-2 col-span-6">
                            <h4 className="text-white font-bold mb-6">Ministries</h4>
                            <ul className="space-y-4">
                                <li>
                                    <Link href="/our-mission" className="text-white/40 hover:text-amber-500 text-sm transition-colors">Our Mission</Link>
                                </li>
                                <li>
                                    <Link href="/events" className="text-white/40 hover:text-amber-500 text-sm transition-colors">Events</Link>
                                </li>
                                <li>
                                    <Link href="/sermons" className="text-white/40 hover:text-amber-500 text-sm transition-colors">Sermons</Link>
                                </li>
                                <li>
                                    <Link href="/give" className="text-white/40 hover:text-amber-500 text-sm transition-colors">Give</Link>
                                </li>
                            </ul>
                        </div>

                        <div className="md:col-span-3">
                            <h4 className="text-white font-bold mb-6">Join the Updates</h4>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-colors"
                                />
                                <button
                                    onClick={handleSubscribe}
                                    disabled={loading}
                                    className="absolute right-1 top-1 bottom-1 px-4 bg-amber-500 rounded-full text-black font-bold text-xs hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? '...' : 'JOIN'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex flex-col md:flex-row items-center gap-1 md:gap-4 text-xs text-white/30">
                            <p>© 2025 Call of Jesus Ministries.</p>
                            <span className="hidden md:block w-px h-3 bg-white/20"></span>
                            <div className="flex items-center gap-1">
                                <span>Developed by</span>
                                <a href="https://www.instagram.com/yash.singh_1401/" target="_blank" rel="noopener noreferrer" className="relative group cursor-pointer">
                                    <span className="group-hover:text-amber-500 transition-colors">Yash Singh</span>
                                    {/* Golden Shiny Line - Sunlight Reflection Effect */}
                                    <div className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-[#FFD700]/10 overflow-hidden rounded-full">
                                        <div className="absolute top-0 bottom-0 w-[60%] bg-gradient-to-r from-transparent via-[#FFD700] via-white via-[#FFD700] to-transparent blur-[0.5px] animate-shine-line shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="text-xs text-white/20 hover:text-white/60 transition-colors">Privacy Policy</Link>
                            <Link href="/terms" className="text-xs text-white/20 hover:text-white/60 transition-colors">Terms of Service</Link>
                        </div>
                    </div>
                </div>
                {/* Bottom Golden Glow */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent shadow-[0_0_20px_#FFD700] opacity-80"></div>
                <div className="absolute bottom-[1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-900 to-transparent opacity-50"></div>
            </footer>

        </div >
    );
}

function HeroCarousel({ slides: propSlides }: { slides?: any[] }) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const defaultSlides = [
        {
            title: "New Worship\nCollection",
            subtitle: "Exclusive",
            image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=2070&auto=format&fit=crop",
            link: "/new-arrivals"
        },
        {
            title: "Top 10 Songs\nThis Week",
            subtitle: "Trending",
            image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop",
            link: "/trending"
        },
        {
            title: "Sunday Setlist\nReady For You",
            subtitle: "Worship Leader",
            image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop",
            link: "/sets"
        }
    ];

    const slides = propSlides || defaultSlides;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const router = useRouter();
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        } else if (isRightSwipe) {
            setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        }
    };

    const handleCardClick = () => {
        // Only navigate if it wasn't a swipe (touchEnd shouldn't be set far from start, but simplified: just nav)
        // If user swiped, onTouchEnd fired.
        // We rely on standard click behavior. If swipe happens strictly, click might not fire or we want to prevent it.
        // A simple way: stick to touch logic. If distance is small, it's a tap.

        // However, mixing click and touch handlers on same element:
        // Swipe: touchstart -> touchmove -> touchend. Click usually doesn't fire if default prevented or significant movement.
        // We will just execute router.push.
        router.push(slides[currentSlide].link);
    };

    return (
        <TiltCard max={3} scale={1.01} className="w-full">
            <div
                onClick={handleCardClick}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="block w-full h-full cursor-pointer select-none"
            >
                <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-[#0A0A0A] rounded-[2.5rem] relative overflow-hidden flex items-end p-8 md:p-12 border border-white/10 group shadow-2xl">

                    {/* Dynamic Slides */}
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <div
                                className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'}`}
                                style={{ backgroundImage: `url('${slide.image}')` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#02000F] via-[#02000F]/50 to-transparent opacity-90" />

                            {/* Glass Shine Effect (Made For You Style) */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </div>
                    ))}

                    <div className="relative z-10 w-full mb-2">
                        <div className="h-24 overflow-hidden relative">
                            {slides.map((slide, index) => (
                                <div
                                    key={index}
                                    className={`absolute bottom-0 left-0 w-full transition-all duration-700 transform ${index === currentSlide
                                        ? 'translate-y-0 opacity-100'
                                        : index < currentSlide ? '-translate-y-8 opacity-0' : 'translate-y-8 opacity-0'
                                        }`}
                                >
                                    <span className="text-[var(--brand)] text-xs font-black uppercase tracking-[0.2em] mb-2 block">{slide.subtitle}</span>
                                    <h2 className="text-3xl md:text-5xl font-black leading-none whitespace-pre-line text-white shadow-black drop-shadow-lg tracking-tight">{slide.title}</h2>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2.5 mt-8">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentSlide(index);
                                    }}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-8 bg-[var(--brand)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </TiltCard>
    );
}
