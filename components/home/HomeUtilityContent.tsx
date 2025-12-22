'use client';

import { Star, Sparkles, Mic2, User, Menu, ChevronRight, Heart, Music2, TrendingUp, ArrowRight, Youtube, Instagram, Facebook, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Sidebar from '../ui/Sidebar';
import TiltCard from '../ui/TiltCard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ALL_SONGS } from '@/data/songs';

gsap.registerPlugin(ScrollTrigger);

import { useAppStore } from '@/store/useAppStore';

export default function HomeUtilityContent() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { currentUser, isAuthenticated, logout } = useAppStore();

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

            {/* HERO CAROUSEL */}
            <section className="px-5 mb-10 mt-4 animate-slide-up">
                <HeroCarousel />
            </section>

            {/* CATEGORIES - HOLOGRAPHIC TILES (UPDATED: GAP-16) */}
            <section className="px-5 mb-14 section-anim opacity-0 translate-y-8 transition-all duration-700 ease-out">
                {/* Increased to gap-16 for maximum breathing room */}
                <div className="flex gap-16 overflow-x-auto no-scrollbar pb-16 justify-start md:justify-center px-4 pt-8">
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
                            <TiltCard key={i} className="min-w-[150px] h-[150px]" max={20} scale={1.15}>
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
                    <div className="relative rounded-[3rem] overflow-hidden group border border-white/10 shadow-2xl shadow-black/50 py-24 px-6">
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
                            <div className="mb-10 flex flex-col items-center justify-center transform-style-3d animate-float-slow">

                                {/* Flame & Cross Icon */}
                                <div className="relative w-14 h-16 mb-2 drop-shadow-[0_0_15px_rgba(255,87,34,0.4)]">
                                    <style jsx>{`
                                        @keyframes flame-sway {
                                            0%, 100% { transform: skewX(-3deg) scaleY(1); }
                                            50% { transform: skewX(3deg) scaleY(1.05); }
                                        }
                                        @keyframes flame-flutter {
                                            0%, 100% { transform: scale(1) translateY(0); opacity: 0.8; }
                                            50% { transform: scale(1.1) translateY(-2px); opacity: 1; }
                                        }
                                        @keyframes shine-move {
                                            0% { background-position: 200% center; }
                                            100% { background-position: -200% center; }
                                        }
                                        .flame-main { animation: flame-sway 4s ease-in-out infinite; transform-origin: bottom center; }
                                        .flame-inner { animation: flame-flutter 2s ease-in-out infinite; transform-origin: center; }
                                        
                                        .logo-text-shine {
                                            background: linear-gradient(to right, #FFF 20%, #FFD700 50%, #FFF 80%);
                                            background-size: 200% auto;
                                            background-clip: text;
                                            -webkit-background-clip: text;
                                            -webkit-text-fill-color: transparent;
                                            color: transparent;
                                            animation: shine-move 3s linear infinite;
                                            display: inline-block;
                                        }

                                        .verse-text-shine {
                                            background: linear-gradient(to right, #e5e5e5 20%, #FFF 50%, #e5e5e5 80%);
                                            background-size: 200% auto;
                                            background-clip: text;
                                            -webkit-background-clip: text;
                                            -webkit-text-fill-color: transparent;
                                            color: transparent;
                                            animation: shine-move 6s linear infinite;
                                        }
                                    `}</style>
                                    <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
                                        <defs>
                                            <linearGradient id="fire-gradient-main" x1="50%" y1="100%" x2="50%" y2="0%">
                                                <stop offset="0%" stopColor="#D50000" /> {/* Deep Red */}
                                                <stop offset="50%" stopColor="#FF6D00" /> {/* Orange */}
                                                <stop offset="100%" stopColor="#FFD600" /> {/* Yellow */}
                                            </linearGradient>
                                            <linearGradient id="cross-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#FFECB3" />
                                                <stop offset="50%" stopColor="#FFC107" />
                                                <stop offset="100%" stopColor="#FF6F00" />
                                            </linearGradient>
                                            <filter id="glow-intense">
                                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>

                                        {/* Outer Flames (Darker/Redder) - Slow Sway */}
                                        <path d="M50 115 C20 115 5 80 5 60 C5 35 30 5 50 0 C70 5 95 35 95 60 C95 80 80 115 50 115 Z" fill="#B71C1C" opacity="0.6" className="flame-main" />

                                        {/* Main Fire Body - Gentle Sway */}
                                        <path d="M50 110 C25 105 10 75 15 55 C20 35 40 20 50 5 C60 20 80 35 85 55 C90 75 75 105 50 110 Z" fill="url(#fire-gradient-main)" filter="url(#glow-intense)" className="flame-main" style={{ animationDelay: '0.5s' }} />

                                        {/* Inner Flame Details (Flickers) - Smooth Flutter */}
                                        <path d="M50 15 Q40 40 35 55 Q30 70 50 85 Q70 70 65 55 Q60 40 50 15" fill="#FFAB00" opacity="0.8" className="flame-inner" />

                                        {/* The Cross */}
                                        <path d="M50 40 V 100 M30 60 H 70" stroke="url(#cross-gradient)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-intense)" />
                                    </svg>
                                </div>

                                {/* Text Lockup */}
                                <div className="flex flex-col items-center">
                                    <div className="flex items-baseline gap-1 leading-none">
                                        <span className="text-2xl md:text-3xl font-serif tracking-wide drop-shadow-lg logo-text-shine" style={{ fontFamily: 'Georgia, serif' }}>CALL</span>
                                        <span className="text-[8px] md:text-[10px] font-sans font-bold uppercase tracking-wider -translate-y-0.5 text-white/70">OF</span>
                                        <span className="text-2xl md:text-3xl font-serif tracking-wide drop-shadow-lg logo-text-shine" style={{ fontFamily: 'Georgia, serif' }}>JESUS</span>
                                    </div>
                                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent my-1"></div>
                                    <span className="text-[7px] md:text-[9px] font-sans font-bold tracking-[0.6em] uppercase drop-shadow-md text-amber-500 animate-pulse">
                                        MINISTRIES
                                    </span>
                                </div>
                            </div>

                            <span className="block mb-6"></span> {/* Spacer instead of text */}

                            <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif italic leading-tight mb-10 drop-shadow-2xl px-4 relative verse-text-shine">
                                <span className="absolute -top-10 left-0 text-[100px] opacity-10 font-serif text-[var(--chord)]">&quot;</span>
                                For I know the plans I have for you, plans to prosper you and not to harm you.
                                <span className="absolute -bottom-20 right-0 text-[100px] opacity-10 font-serif text-[var(--chord)]">&quot;</span>
                            </h2>

                            <div className="flex flex-col items-center gap-8 translate-z-10">
                                <div className="flex items-center gap-4">
                                    <div className="h-[1px] w-12 bg-[var(--chord)]/50"></div>
                                    <span className="text-[var(--chord)] font-bold tracking-[0.4em] uppercase text-sm">Jeremiah 29:11</span>
                                    <div className="h-[1px] w-12 bg-[var(--chord)]/50"></div>
                                </div>

                                <Link href="/devotional" className="group relative px-10 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden transition-all hover:bg-white/10 hover:border-[var(--chord)]/50 hover:shadow-[0_0_30px_rgba(255,193,7,0.2)] inline-block">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
                                    <span className="relative text-white font-bold tracking-widest text-sm flex items-center gap-3">
                                        READ DEVOTIONAL <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
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
            <section className="mb-20 pl-6 section-anim opacity-0 translate-y-8 transition-all duration-700 ease-out">
                <div className="flex justify-between items-end pr-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                            </span>
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500">Global Charts</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter shadow-white drop-shadow-lg">
                            TRENDING <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">NOW</span>
                        </h2>
                    </div>
                </div>

                <div className="flex gap-8 overflow-x-auto pb-12 no-scrollbar pr-6 snap-x snap-mandatory pt-4">
                    {ALL_SONGS.slice(0, 10).map((song, i) => (
                        <div key={i} className="min-w-[260px] md:min-w-[300px] snap-start group relative">
                            {/* Giant Number Background */}
                            <span className="absolute -left-4 -top-12 text-[120px] font-black text-white/5 z-0 group-hover:text-white/10 transition-colors duration-500 select-none font-serif italic">
                                {i + 1}
                            </span>

                            {/* Card Container */}
                            <TiltCard className="w-full aspect-[2/3]" max={10} scale={1.05}>
                                <Link href={`/songs/${song.id}`} className="block relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl bg-[#111] group-hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] transition-shadow duration-500 border border-white/10">

                                    {/* Image */}
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                                        style={{ backgroundImage: `url('${song.img}')` }}></div>

                                    {/* Dark Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />

                                    {/* Glass Shine */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Content Info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">

                                        {/* Play Button */}
                                        {/* Play Button Removed */}

                                        <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                            <TrendingUp className="w-4 h-4 text-red-500" />
                                            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">1M+ Listening</span>
                                        </div>

                                        <h3 className="text-3xl font-black text-white leading-none mb-1 drop-shadow-md truncate">{song.title}</h3>
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
            <section className="mb-24 pl-6 section-anim opacity-0 translate-y-8 transition-all duration-700 ease-out">
                <h2 className="text-4xl font-black text-white mb-10 tracking-tighter">
                    ICONS OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand)] to-[var(--accent)]">WORSHIP</span>
                </h2>

                <div className="flex gap-8 overflow-x-auto pb-12 no-scrollbar pr-6 snap-x snap-mandatory">
                    {[
                        { name: 'Hillsong', img: 'https://images.unsplash.com/photo-1459749411177-33481156047b?q=80&w=800&auto=format&fit=crop' },
                        { name: 'Bethel', img: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop' },
                        { name: 'Elevation', img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop' },
                        { name: 'Maverick', img: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=800&auto=format&fit=crop' },
                        { name: 'Sinach', img: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=800&auto=format&fit=crop' },
                        { name: 'Kari Jobe', img: 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?q=80&w=800&auto=format&fit=crop' },
                        { name: 'Casting Crowns', img: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?q=80&w=800&auto=format&fit=crop' },
                        { name: 'MercyMe', img: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=800&auto=format&fit=crop' },
                        { name: 'Chris Tomlin', img: 'https://images.unsplash.com/photo-1621360841012-3f62afa2e9c2?q=80&w=800&auto=format&fit=crop' },
                        { name: 'Phil Wickham', img: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?q=80&w=800&auto=format&fit=crop' }
                    ].map((artist, i) => (
                        <div key={i} className="min-w-[280px] snap-center group relative cursor-pointer">
                            <TiltCard className="w-full h-[400px]" max={12} scale={1.05}>
                                <Link
                                    href={`/artists/${artist.name.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="relative block w-full h-full rounded-[2.5rem] overflow-hidden bg-[#111] shadow-2xl group-hover:shadow-[0_0_50px_rgba(233,30,99,0.3)] transition-shadow duration-500 border border-white/10"
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
                                    <div className="absolute bottom-0 left-0 w-full p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="w-12 h-1.5 bg-[var(--brand)] mb-4 w-0 group-hover:w-12 transition-all duration-500 ease-out" />

                                        <h3 className="text-4xl font-black text-white uppercase leading-[0.9] tracking-tighter mb-3 drop-shadow-lg">
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
            <section className="px-5 mb-32 section-anim opacity-0 translate-y-8 transition-all duration-700 ease-out">
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-3xl font-black italic tracking-tighter text-white drop-shadow-lg">
                        Made For <span className="text-[var(--brand)]">You</span>
                    </h2>
                    <Link href="/songs" className="text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors flex items-center gap-1 group">
                        View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {ALL_SONGS.slice(0, 20).map((song, i) => (
                        <TiltCard key={i} className="h-full min-h-[250px]" max={15} scale={1.05}>
                            <div className="relative h-full group">
                                <Link
                                    href={`/songs/${song.id}`}
                                    className="relative flex flex-col justify-end p-6 rounded-[2rem] bg-[#0A0A0A] border border-white/10 overflow-hidden h-full group-hover:bg-[#111] transition-colors"
                                >
                                    {/* Album Art Background */}
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${song.img}')` }}></div>
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
                                        <h3 className="font-black text-xl text-white leading-none mb-1 drop-shadow-lg line-clamp-1">{song.title}</h3>
                                        <p className="text-xs text-white/70 font-bold uppercase tracking-widest line-clamp-1">{song.artist}</p>

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
                                {/* Flame Icon */}
                                <div className="relative w-12 h-14 drop-shadow-[0_0_15px_rgba(255,87,34,0.4)] shrink-0">
                                    <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
                                        <defs>
                                            <linearGradient id="fire-gradient-footer" x1="50%" y1="100%" x2="50%" y2="0%">
                                                <stop offset="0%" stopColor="#D50000" />
                                                <stop offset="50%" stopColor="#FF6D00" />
                                                <stop offset="100%" stopColor="#FFD600" />
                                            </linearGradient>
                                            <linearGradient id="cross-gradient-footer" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#FFECB3" />
                                                <stop offset="50%" stopColor="#FFC107" />
                                                <stop offset="100%" stopColor="#FF6F00" />
                                            </linearGradient>
                                            <filter id="glow-intense-footer">
                                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        <path d="M50 115 C20 115 5 80 5 60 C5 35 30 5 50 0 C70 5 95 35 95 60 C95 80 80 115 50 115 Z" fill="#B71C1C" opacity="0.6" className="flame-main" />
                                        <path d="M50 110 C25 105 10 75 15 55 C20 35 40 20 50 5 C60 20 80 35 85 55 C90 75 75 105 50 110 Z" fill="url(#fire-gradient-footer)" filter="url(#glow-intense-footer)" className="flame-main" style={{ animationDelay: '0.5s' }} />
                                        <path d="M50 15 Q40 40 35 55 Q30 70 50 85 Q70 70 65 55 Q60 40 50 15" fill="#FFAB00" opacity="0.8" className="flame-inner" />
                                        <path d="M50 40 V 100 M30 60 H 70" stroke="url(#cross-gradient-footer)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-intense-footer)" />
                                    </svg>
                                </div>

                                {/* Text Lockup */}
                                <div className="flex flex-col items-start">
                                    <div className="flex items-baseline gap-1 leading-none">
                                        <span className="text-xl md:text-2xl font-serif tracking-wide drop-shadow-lg logo-text-shine" style={{ fontFamily: 'Georgia, serif' }}>CALL</span>
                                        <span className="text-[6px] md:text-[8px] font-sans font-bold uppercase tracking-wider -translate-y-0.5 text-white/70">OF</span>
                                        <span className="text-xl md:text-2xl font-serif tracking-wide drop-shadow-lg logo-text-shine" style={{ fontFamily: 'Georgia, serif' }}>JESUS</span>
                                    </div>
                                    <div className="w-full h-[1px] bg-gradient-to-r from-amber-500/50 to-transparent my-1"></div>
                                    <span className="text-[6px] md:text-[8px] font-sans font-bold tracking-[0.4em] uppercase drop-shadow-md text-amber-500">
                                        MINISTRIES
                                    </span>
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
                                    placeholder="Enter your email"
                                    className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-colors"
                                />
                                <button className="absolute right-1 top-1 bottom-1 px-4 bg-amber-500 rounded-full text-black font-bold text-xs hover:bg-amber-400 transition-colors">
                                    JOIN
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-white/20 text-xs text-center md:text-left">
                            © 2025 Call of Jesus Ministries. All rights reserved.
                        </p>
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

function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "New Worship\nCollection",
            subtitle: "Exclusive",
            image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: "Top 10 Songs\nThis Week",
            subtitle: "Trending",
            image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop"
        },
        {
            title: "Sunday Setlist\nReady For You",
            subtitle: "Worship Leader",
            image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <TiltCard max={3} scale={1.01} className="w-full">
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

                    <div className="flex gap-2.5 mt-6">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-8 bg-[var(--brand)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </TiltCard>
    );
}
