'use client';

import Link from 'next/link';
import { ArrowLeft, Globe, Flame, Crown, Sparkles, ChevronRight, Heart, Zap } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';

export default function MissionPage() {
    return (
        <div className="min-h-screen bg-[#02000F] text-white p-6 pb-32 overflow-hidden relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex items-center justify-between mb-20 animate-fade-in-down">
                    <Link href="/" className="inline-flex items-center gap-2 p-3 px-5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 backdrop-blur-md transition-all group">
                        <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-amber-500 transition-colors" />
                        <span className="text-sm font-bold tracking-widest uppercase">Back</span>
                    </Link>
                </header>

                {/* Hero Section */}
                <div className="text-center mb-24 relative">
                    {/* Floating Elements */}
                    <div className="absolute top-0 left-1/4 animate-float-slow opacity-30">
                        <Sparkles className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="absolute bottom-0 right-1/4 animate-float-slower opacity-30">
                        <Flame className="w-6 h-6 text-red-500" />
                    </div>

                    <h1 className="text-[10vw] md:text-[120px] font-black leading-none mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 drop-shadow-2xl select-none">
                        OUR <span className="text-amber-500">MISSION</span>
                    </h1>

                    <div className="relative max-w-5xl mx-auto">
                        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-red-600/20 blur-xl opacity-50 rounded-full"></div>
                        <h2 className="relative text-3xl md:text-5xl lg:text-6xl font-serif font-medium italic leading-tight text-white drop-shadow-xl px-4 py-8">
                            <span className="text-amber-500 font-serif text-6xl md:text-8xl absolute -top-4 left-0 md:-left-8 opacity-40">&quot;</span>
                            To prepare people across the world for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500 font-bold not-italic">second coming</span> of Jesus Christ.
                            <span className="text-amber-500 font-serif text-6xl md:text-8xl absolute -bottom-8 right-0 md:-right-8 opacity-40">&quot;</span>
                        </h2>
                    </div>

                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-12 rounded-full opacity-50"></div>
                </div>

                {/* Core Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {[
                        {
                            icon: Globe,
                            title: "Global Reach",
                            desc: "Breaking boundaries to take the Gospel to every nation, tribe, and tongue.",
                            color: "text-blue-400",
                            gradient: "from-blue-500/20 to-cyan-500/20"
                        },
                        {
                            icon: Crown,
                            title: "Kingdom Focus",
                            desc: "Everything we do is centered on the return of our King, Jesus Christ.",
                            color: "text-amber-500",
                            gradient: "from-amber-500/20 to-orange-500/20"
                        },
                        {
                            icon: Zap,
                            title: "Spirit Empowered",
                            desc: "Walking in the power of the Holy Spirit to awaken a sleeping generation.",
                            color: "text-red-500",
                            gradient: "from-red-500/20 to-purple-500/20"
                        }
                    ].map((item, i) => (
                        <TiltCard key={i} className="w-full" max={5} scale={1.02}>
                            <div className="h-full bg-[#0A0A0A] border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${item.color}`}>
                                        <item.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:tracking-wider transition-all duration-300">{item.title}</h3>
                                    <p className="text-white/50 leading-relaxed text-sm group-hover:text-white/80 transition-colors">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        </TiltCard>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="mt-24 text-center">
                    <p className="text-white/40 uppercase tracking-[0.2em] text-xs font-bold mb-6">Join the Movement</p>
                    <Link href="/contact" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-amber-400 transition-colors hover:scale-105 active:scale-95 duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                        <span>Partner With Us</span>
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
