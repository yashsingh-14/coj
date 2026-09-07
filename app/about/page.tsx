'use client';

import Link from 'next/link';
import { ArrowLeft, Info, HeartHandshake, Globe } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#02000F] text-white px-4 sm:px-6 py-6 pb-32">
            <Link href="/" className="inline-flex items-center gap-2 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md mb-6 sm:mb-8 transition-colors text-xs sm:text-sm">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="font-bold">Back</span>
            </Link>

            <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-16">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl sm:text-3xl font-black text-white mx-auto mb-4 sm:mb-6 shadow-[0_0_30px_rgba(255,160,0,0.4)]">C</div>
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold mb-3 sm:mb-6">About Call of Jesus</h1>
                <p className="text-base sm:text-xl text-white/60 leading-relaxed">
                    We are a digital ministry dedicated to spreading the Gospel through the universal language of worship. Connecting believers worldwide to encounter Jesus.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
                <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 text-center">
                    <Globe className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">Global Reach</h3>
                    <p className="text-white/40 text-xs sm:text-sm">Touching lives in over 150 nations with the message of hope.</p>
                </div>
                <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <HeartHandshake className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500 mx-auto mb-3 sm:mb-4 relative z-10" />
                    <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 relative z-10">Community</h3>
                    <p className="text-white/40 text-xs sm:text-sm relative z-10">Building a family of worshippers united in spirit and truth.</p>
                </div>
                <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 text-center">
                    <Info className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">Resources</h3>
                    <p className="text-white/40 text-xs sm:text-sm">Providing free chords, lyrics, and devotionals for the church.</p>
                </div>
            </div>
        </div>
    );
}
