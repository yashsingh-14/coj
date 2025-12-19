'use client';

import Link from 'next/link';
import { ArrowLeft, Star, Music, Heart, Mic2, BookOpen, Sun } from 'lucide-react';

export default function CategoriesPage() {
    const categories = [
        { name: 'Praise', icon: Sun, color: 'from-yellow-400 to-orange-500' },
        { name: 'Worship', icon: Heart, color: 'from-pink-500 to-rose-500' },
        { name: 'Hymns', icon: BookOpen, color: 'from-blue-400 to-indigo-500' },
        { name: 'Urban', icon: Mic2, color: 'from-purple-500 to-violet-500' },
        { name: 'Instrumental', icon: Music, color: 'from-emerald-400 to-teal-500' },
        { name: 'Featured', icon: Star, color: 'from-[var(--brand)] to-[var(--accent)]' },
    ];

    return (
        <div className="min-h-screen bg-[#02000F] text-white">
            <div className="sticky top-0 z-20 p-6 flex items-center gap-4 bg-[#02000F]/80 backdrop-blur-xl">
                <Link href="/" className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all group">
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <h1 className="text-2xl font-bold">Browse Categories</h1>
            </div>

            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4 pb-32">
                {categories.map((cat, i) => (
                    <Link
                        key={i}
                        href={`/songs?category=${cat.name.toLowerCase()}`}
                        className="aspect-square relative group overflow-hidden rounded-3xl border border-white/10 bg-white/5 hover:border-transparent transition-all duration-500"
                    >
                        {/* Hover Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 z-10">
                            <div className="p-4 rounded-full bg-white/10 group-hover:bg-white/20 backdrop-blur-md text-white/70 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                                <cat.icon className="w-8 h-8" />
                            </div>
                            <span className="font-bold text-lg text-white/80 group-hover:text-white transition-colors">{cat.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
