'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Flame, Heart, Radio, Sparkles, TrendingUp, type LucideIcon } from 'lucide-react';

interface StatMetric {
    id: number;
    value: number;
    suffix: string;
    label: string;
    detail: string;
    icon: LucideIcon;
    accent: string;
    borderGlow: string;
}

const STATS_DATA: StatMetric[] = [
    {
        id: 1,
        value: 12,
        suffix: '+ Years',
        label: 'Kingdom Walk & Foundation',
        detail: 'Proclaiming the New Covenant Gospel of Grace since 2012 without compromise.',
        icon: Flame,
        accent: '#FF5A2E',
        borderGlow: 'hover:border-[#FF5A2E]/50 hover:shadow-[0_0_35px_rgba(255,90,46,0.2)]',
    },
    {
        id: 2,
        value: 50,
        suffix: 'K+ Believers',
        label: 'Lives Ministered & Gathered',
        detail: 'Across Sunday celebrations, Friday Deliverance nights & global prayer streams.',
        icon: Heart,
        accent: '#F59E0B',
        borderGlow: 'hover:border-[#F59E0B]/50 hover:shadow-[0_0_35px_rgba(245,158,11,0.2)]',
    },
    {
        id: 3,
        value: 1600,
        suffix: '+ Messages',
        label: 'Sermons & Anointed Releases',
        detail: 'Prophetic worship, chord charts, biblical teachings & weekly sermon archives.',
        icon: Radio,
        accent: '#8B5CF6',
        borderGlow: 'hover:border-[#8B5CF6]/50 hover:shadow-[0_0_35px_rgba(139,92,246,0.2)]',
    },
    {
        id: 4,
        value: 24,
        suffix: '/7 Prayer',
        label: 'Supernatural Intercession',
        detail: 'Unbroken intercessory altar, personal prayer requests & miraculous breakthrough.',
        icon: Sparkles,
        accent: '#10B981',
        borderGlow: 'hover:border-[#10B981]/50 hover:shadow-[0_0_35px_rgba(16,185,129,0.2)]',
    },
];

// Counting Number Hook
function useCountingValue(targetValue: number, isVisible: boolean, durationMs = 1800) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setCount(0);
            return;
        }

        let startTimestamp: number | null = null;
        let animationFrameId: number;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
            // Ease Out Quartic for buttery decelerating count
            const easeOutProgress = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutProgress * targetValue));

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(step);
            } else {
                setCount(targetValue);
            }
        };

        animationFrameId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isVisible, targetValue, durationMs]);

    return count;
}

function StatCard({ stat, isVisible }: { stat: StatMetric; isVisible: boolean }) {
    const animatedValue = useCountingValue(stat.value, isVisible);
    const Icon = stat.icon;

    return (
        <div
            className={`group relative rounded-3xl p-6 sm:p-8 min-h-[220px] sm:min-h-[260px] flex flex-col justify-between backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] ${stat.borderGlow} transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl`}
            style={{ borderColor: `${stat.accent}20` }}
        >
            {/* Ambient Platform Colored Bloom */}
            <div
                className="absolute inset-0 opacity-20 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 75% 20%, ${stat.accent}22, transparent 75%)`,
                }}
            />

            {/* Giant Subtle Background Watermark Icon */}
            <Icon
                className="absolute -bottom-6 -right-6 w-36 h-36 transition-all duration-700 pointer-events-none group-hover:scale-110 group-hover:rotate-6"
                style={{ color: stat.accent, opacity: 0.05 }}
            />

            {/* Top Row: Icon Badge + Category Sub */}
            <div className="flex items-center justify-between relative z-10">
                <div
                    className="w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-inner"
                    style={{
                        backgroundColor: `${stat.accent}15`,
                        borderColor: `${stat.accent}40`,
                        color: stat.accent,
                    }}
                >
                    <Icon className="w-6 h-6" />
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stat.accent }} />
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50">Verified</span>
                </div>
            </div>

            {/* Middle Value with Counting Animation */}
            <div className="relative z-10 pt-6">
                <div className="flex items-baseline gap-1.5">
                    <span className="font-playfair font-black text-4xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-400">
                        {animatedValue.toLocaleString()}
                    </span>
                    <span
                        className="text-lg sm:text-xl font-bold font-space"
                        style={{ color: stat.accent }}
                    >
                        {stat.suffix.replace(stat.value.toString(), '')}
                    </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight mt-2">
                    {stat.label}
                </h4>
                <p className="text-xs sm:text-sm text-white/60 font-light mt-1.5 leading-relaxed line-clamp-2">
                    {stat.detail}
                </p>
            </div>
        </div>
    );
}

export default function KingdomStats() {
    const sectionRef = useRef<HTMLElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px',
            }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="kingdom-stats"
            className="perf-section min-h-[75vh] flex flex-col justify-center items-center relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden bg-[#07060A] text-white font-space"
        >
            {/* Seamless Top & Bottom Fade Overlays */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-b from-[#07060A] to-transparent z-10" />
            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-t from-[#07060A] to-transparent z-10" />

            {/* Left & Right Glowing Color Pillars */}
            <div className="pointer-events-none absolute -left-20 sm:-left-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.16)_0%,rgba(245,158,11,0.08)_45%,transparent_75%)] blur-2xl transform-gpu" />
            <div className="pointer-events-none absolute -right-20 sm:-right-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.18)_0%,rgba(255,90,46,0.08)_45%,transparent_75%)] blur-2xl transform-gpu" />

            {/* Starfield overlay */}
            <div className="starfield opacity-25 pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto w-full space-y-12 sm:space-y-14">
                {/* Header Block */}
                <div className="text-center space-y-3.5 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-amber-400/25 backdrop-blur-md">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-amber-300">
                            Kingdom Impact & Testimony
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white select-none">
                        Empowered by <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-400 to-[#FF5A2E]">Grace</span>
                    </h2>

                    <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
                        A decade of unshakeable faith, transforming lives across cities and nations through the power of Jesus Christ.
                    </p>
                </div>

                {/* Animated Dynamic Kingdom Growth Curve (SVG Line) */}
                <div className="relative w-full h-12 sm:h-16 overflow-hidden pointer-events-none -mb-4">
                    <svg
                        viewBox="0 0 1000 60"
                        preserveAspectRatio="none"
                        className="w-full h-full filter drop-shadow-[0_0_8px_rgba(255,179,122,0.4)]"
                    >
                        <defs>
                            <linearGradient id="growthCurveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#C2361A" stopOpacity="0" />
                                <stop offset="25%" stopColor="#FF5A2E" stopOpacity="0.7" />
                                <stop offset="70%" stopColor="#FFD700" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path
                            d="M 0,45 Q 150,15 300,38 T 600,25 T 850,15 T 1000,35"
                            fill="none"
                            stroke="url(#growthCurveGrad)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            style={{
                                strokeDasharray: 1000,
                                strokeDashoffset: isVisible ? 0 : 1000,
                                transition: 'stroke-dashoffset 2.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                        />
                    </svg>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                    {STATS_DATA.map((stat) => (
                        <StatCard key={stat.id} stat={stat} isVisible={isVisible} />
                    ))}
                </div>

                {/* Scripture Anchor Quote */}
                <div className="text-center pt-2 select-none">
                    <p className="text-xs sm:text-sm italic font-serif text-white/40 max-w-xl mx-auto">
                        &ldquo;Not unto us, O LORD, not unto us, but unto Thy name give glory, for Thy mercy, and for Thy truth&apos;s sake.&rdquo;
                    </p>
                    <span className="block mt-1 text-[10px] uppercase font-bold tracking-[0.25em] text-amber-500/70">
                        — Psalm 115:1
                    </span>
                </div>
            </div>
        </section>
    );
}
