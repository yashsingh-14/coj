'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Share2, Heart, Calendar, Check } from 'lucide-react';
import { getVerseOfTheDay } from '@/lib/getVerseOfTheDay';

export default function DevotionalPage() {
    const [isLiked, setIsLiked] = useState(false);
    const [showCopied, setShowCopied] = useState(false);

    // Get today's verse
    const todaysVerse = getVerseOfTheDay();
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const handleShare = async () => {
        const shareData = {
            title: `Verse of the Day - ${todaysVerse.reference}`,
            text: `Read this daily devotional from Call of Jesus Ministries: ${todaysVerse.text} - ${todaysVerse.reference}`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                setShowCopied(true);
                setTimeout(() => setShowCopied(false), 2000);
            } catch (err) {
                console.log('Clipboard error:', err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white selection:bg-amber-500/30 overflow-x-hidden pb-32">

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-50 px-6 py-6 flex items-center justify-between">
                <Link href="/" className="p-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-colors group">
                    <ChevronLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={`p-3 bg-white/5 backdrop-blur-md rounded-full border transition-all active:scale-90 duration-300 ${isLiked ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 hover:bg-white/10'}`}
                    >
                        <Heart className={`w-6 h-6 transition-all duration-300 ${isLiked ? 'text-red-500 fill-red-500 scale-110' : 'text-white'}`} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="p-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 transition-all active:scale-95 relative group"
                    >
                        {showCopied ? (
                            <Check className="w-6 h-6 text-green-400 animate-in zoom-in spin-in-90 duration-300" />
                        ) : (
                            <Share2 className="w-6 h-6 text-white group-active:scale-90 transition-transform" />
                        )}

                        {/* Desktop Tooltip for Copied */}
                        {showCopied && (
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg animate-in fade-in slide-in-from-top-2">
                                COPIED
                            </div>
                        )}
                    </button>
                </div>
            </nav>

            {/* Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-6 pt-10">

                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold tracking-widest text-amber-500 uppercase">{today}</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-serif italic text-white mb-6 leading-tight">
                        Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200">Devotional</span>
                    </h1>
                    <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Today's verse brings encouragement and hope for your journey.
                    </p>
                </div>

                {/* Verse Card */}
                <div className="relative p-8 md:p-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl mb-16 overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>

                    <div className="relative z-10 text-center">
                        <h2 className="text-3xl md:text-5xl font-serif leading-tight text-white mb-8">
                            &quot;{todaysVerse.text}&quot;
                        </h2>
                        <div className="inline-block border-t border-b border-white/10 py-3 px-8">
                            <span className="text-amber-500 font-bold tracking-[0.3em] uppercase">{todaysVerse.reference}</span>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -left-10 text-[150px] font-serif text-white/5 pointer-events-none">&quot;</div>
                    <div className="absolute -bottom-20 -right-10 text-[150px] font-serif text-white/5 pointer-events-none rotate-180">&quot;</div>
                </div>

                {/* Reflection */}
                <div className="prose prose-lg prose-invert mx-auto">
                    <p className="text-xl text-white/90 leading-relaxed mb-8 first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-amber-500">
                        {todaysVerse.reflection}
                    </p>
                    <div className="p-8 bg-amber-500/5 border-l-4 border-amber-500 rounded-r-2xl my-10">
                        <h3 className="text-amber-500 font-bold mb-2 uppercase tracking-wide text-sm">Prayer for Today</h3>
                        <p className="text-white/90 italic">
                            &quot;{todaysVerse.prayer}&quot;
                        </p>
                    </div>
                </div>

                {/* Footer Signature */}
                <div className="mt-20 mb-10 text-center opacity-60">
                    <p className="font-serif italic text-white/80">Daily Devotional from Call of Jesus Ministries</p>
                    <p className="text-xs text-white/40 mt-2 uppercase tracking-widest">Ps. Samson Wilson</p>
                </div>

            </main>
        </div>
    );
}
