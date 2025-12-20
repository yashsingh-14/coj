'use client';

import Link from 'next/link';
import { ArrowLeft, Heart, HandHeart, CreditCard } from 'lucide-react';

export default function GivePage() {
    return (
        <div className="min-h-screen bg-[#02000F] text-white p-6 pb-32">
            <Link href="/" className="inline-flex items-center gap-2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md mb-8 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
                <span className="text-sm font-bold">Back</span>
            </Link>

            <div className="max-w-4xl mx-auto text-center">
                <Heart className="w-20 h-20 text-red-500 mx-auto mb-6 fill-red-500 animate-pulse-slow" />
                <h1 className="text-5xl font-serif font-bold mb-6">Partner With Us</h1>
                <p className="text-xl text-white/60 max-w-2xl mx-auto mb-16">
                    Your generosity enables us to continue spreading the Gospel and equipping worship leaders around the world.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[10, 50, 100].map((amount) => (
                        <button key={amount} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500 hover:bg-white/10 transition-all">
                            <h3 className="text-4xl font-black text-white group-hover:text-amber-500 mb-2">${amount}</h3>
                            <p className="text-xs uppercase tracking-widest text-white/40">One-Time Gift</p>
                        </button>
                    ))}
                </div>

                <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-left">
                        <h3 className="text-2xl font-bold mb-2">Become a Monthly Partner</h3>
                        <p className="text-white/60 text-sm">Join the "Circle of Fire" and support steady growth.</p>
                    </div>
                    <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2">
                        <HandHeart className="w-5 h-5" /> Support Monthly
                    </button>
                </div>
            </div>
        </div>
    );
}
