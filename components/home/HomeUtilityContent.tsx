import { Search, PlayCircle, Star, Sparkles, Mic2, User, Menu } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Sidebar from '../ui/Sidebar';

export default function HomeUtilityContent() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="w-full bg-[var(--background)] min-h-screen text-white pb-32 overflow-x-hidden">

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* HEADER: Logo & Install (Mock) */}
            <div className="px-5 pt-8 pb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
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

                {/* Sign In Link */}
                <Link href="/signin" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[var(--brand)] flex items-center justify-center transition-colors border border-white/5">
                    <User className="w-5 h-5 text-white/70" />
                </Link>
            </div>

            {/* HERO CAROUSEL (Auto-Sliding) */}
            <section className="px-5 mb-8">
                <HeroCarousel />
            </section>

            {/* CATEGORIES - SLEEK PILLS */}
            <section className="px-5 mb-8">
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {['Praise', 'Worship', 'Kids', 'Instrumental', 'Hymns', 'Contemporary'].map((cat, i) => (
                        <button key={i} className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium whitespace-nowrap hover:bg-[var(--brand)] hover:text-white hover:border-transparent transition-all duration-300">
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* TRENDING - POSTER CARDS (Vertical) */}
            <section className="mb-12 pl-5">
                <div className="flex justify-between items-end pr-5 mb-5">
                    <div>
                        <span className="text-xs font-bold text-[var(--brand)] tracking-wider uppercase mb-1 block">Hot Right Now</span>
                        <h2 className="text-2xl font-bold text-white">Trending Worship</h2>
                    </div>
                </div>

                <div className="flex gap-5 overflow-x-auto pb-8 no-scrollbar pr-5 snap-x snap-mandatory">
                    {[1, 2, 3, 4, 5].map((_, i) => (
                        <Link href="/songs/way-maker" key={i} className="min-w-[200px] snap-start group relative">
                            {/* Card Image */}
                            <div className="w-full aspect-[3/4] rounded-2xl overflow-hidden mb-4 relative shadow-2xl shadow-black/50">
                                <div className="absolute inset-0 bg-[#222] animate-pulse group-hover:animate-none transition-all duration-500" />
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                                {/* Content inside card */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[var(--brand)] transition-all duration-300">
                                        <PlayCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold leading-tight mb-1 text-white group-hover:text-[var(--brand)] transition-colors">Way Maker</h3>
                                    <p className="text-sm text-gray-300">Sinach</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ARTISTS - GLASS CIRCLES */}
            <section className="mb-12 pl-5">
                <h2 className="text-lg font-bold text-white mb-5">Top Artists</h2>
                <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar pr-5">
                    {['Hillsong', 'Bethel', 'Elevation', 'Sinach', 'Maverick'].map((artist, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 min-w-[90px] group cursor-pointer">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/10 to-transparent p-1 group-hover:bg-gradient-to-tr group-hover:from-[var(--brand)] group-hover:to-[var(--accent)] transition-all duration-500">
                                <div className="w-full h-full rounded-full bg-[#111] flex items-center justify-center border border-white/5 overflow-hidden relative">
                                    <Mic2 className="w-8 h-8 text-white/40 group-hover:text-white transition-colors" />
                                </div>
                            </div>
                            <span className="text-xs font-medium text-white/50 group-hover:text-white transition-colors">{artist}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* TRACKS - GLASS ROWS */}
            <section className="px-5 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Your Mix</h2>
                    <Sparkles className="w-5 h-5 text-[var(--accent)] animate-pulse" />
                </div>

                <div className="space-y-3">
                    {['10,000 Reasons', 'Goodness of God', 'What A Beautiful Name'].map((song, i) => (
                        <Link key={i} href="/songs/way-maker" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[var(--brand)]/30 transition-all duration-300 group">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--brand)] to-[var(--accent)] flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--brand)]/20 group-hover:scale-110 transition-transform">
                                <PlayCircle className="w-6 h-6 fill-white stroke-[var(--brand)]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-white truncate group-hover:text-[var(--accent)] transition-colors">{song}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 rounded-sm bg-white/10 text-white/60">Lyrics</span>
                                    <span className="text-xs text-white/40">• Matt Redman</span>
                                </div>
                            </div>
                            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                                <Star className="w-5 h-5 text-white/20 group-hover:text-[var(--chord)] transition-colors" />
                            </button>
                        </Link>
                    ))}
                </div>
            </section>

        </div>
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
        }, 4000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className="w-full aspect-[2/1] bg-[#111] rounded-2xl relative overflow-hidden flex items-end p-6 border border-white/5 ring-1 ring-white/10">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-50"
                        style={{ backgroundImage: `url('${slide.image}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
            ))}

            <div className="relative z-10 w-full mb-2">
                <div className="h-16 overflow-hidden relative">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute bottom-0 left-0 w-full transition-all duration-700 transform ${index === currentSlide
                                ? 'translate-y-0 opacity-100'
                                : index < currentSlide ? '-translate-y-8 opacity-0' : 'translate-y-8 opacity-0'
                                }`}
                        >
                            <span className="text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-1 block">{slide.subtitle}</span>
                            <h2 className="text-2xl font-bold leading-tight whitespace-pre-line text-white shadow-black drop-shadow-lg">{slide.title}</h2>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 mt-4">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-6 bg-[var(--brand)]' : 'w-1.5 bg-white/30'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
