'use client';

import Link from 'next/link';
import { ArrowLeft, Info, HeartHandshake, Globe } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#02000F] text-white p-6 pb-32">
            <Link href="/" className="inline-flex items-center gap-2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md mb-8 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
                <span className="text-sm font-bold">Back</span>
            </Link>

            <div className="max-w-3xl mx-auto text-center mb-16">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl font-black text-white mx-auto mb-6 shadow-[0_0_30px_rgba(255,160,0,0.4)]">C</div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">About Call of Jesus</h1>
                <p className="text-xl text-white/60 leading-relaxed">
                    We are a digital ministry dedicated to spreading the Gospel through the universal language of worship. Connecting believers worldwide to encounter Jesus.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
                    <Globe className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Global Reach</h3>
                    <p className="text-white/40 text-sm">Touching lives in over 150 nations with the message of hope.</p>
                </div>
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <HeartHandshake className="w-10 h-10 text-amber-500 mx-auto mb-4 relative z-10" />
                    <h3 className="text-xl font-bold mb-2 relative z-10">Community</h3>
                    <p className="text-white/40 text-sm relative z-10">Building a family of worshippers united in spirit and truth.</p>
                </div>
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center">
                    <Info className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Resources</h3>
                    <p className="text-white/40 text-sm">Providing free chords, lyrics, and devotionals for the church.</p>
                </div>
            </div>
        </div>
    );
}
