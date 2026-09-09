'use client';

import React, { useEffect, useState, useRef } from 'react';

interface GlowingLogoTraceProps {
    className?: string;
    onComplete?: () => void;
}

export default function GlowingLogoTrace({
    className = "w-12 h-12",
    onComplete,
}: GlowingLogoTraceProps) {
    const [isTraced, setIsTraced] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Trigger trace animation sequence upon mount
        const timer = setTimeout(() => {
            setIsTraced(true);
            onComplete?.();
        }, 1600);

        return () => clearTimeout(timer);
    }, [onComplete]);

    const handleReplay = () => {
        setIsTraced(false);
        setTimeout(() => setIsTraced(true), 1600);
    };

    return (
        <div
            ref={containerRef}
            onClick={handleReplay}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative flex items-center justify-center cursor-pointer select-none group ${className}`}
            title="Call of Jesus Ministries"
        >
            {/* Ambient Celestial Flame Bloom Behind Logo */}
            <div
                className={`absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-700 ${
                    isHovered
                        ? 'opacity-80 scale-125 bg-[radial-gradient(circle_at_center,rgba(255,90,46,0.35)_0%,rgba(245,158,11,0.25)_40%,transparent_70%)]'
                        : 'opacity-40 scale-100 bg-[radial-gradient(circle_at_center,rgba(255,90,46,0.22)_0%,rgba(245,158,11,0.12)_40%,transparent_70%)]'
                }`}
            />

            {/* Official Brand Artwork with Fire Pulse */}
            <div
                className={`relative w-full h-full flex items-center justify-center transition-all duration-1000 ${
                    isTraced
                        ? 'opacity-100 scale-100 filter drop-shadow-[0_0_12px_rgba(255,140,50,0.45)]'
                        : 'opacity-30 scale-95 filter drop-shadow-[0_0_4px_rgba(255,140,50,0.15)]'
                }`}
            >
                <img
                    src="/images/logo-main.png"
                    alt="Call of Jesus Ministries"
                    className={`max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-105 ${
                        isTraced ? 'animate-fire-pulse-logo' : ''
                    }`}
                />
            </div>

            {/* Animated SVG Glowing Trace Lines Overlay */}
            <div
                className={`absolute inset-0 pointer-events-none flex items-center justify-center transition-opacity duration-1000 ${
                    isTraced ? 'opacity-0 group-hover:opacity-40' : 'opacity-100'
                }`}
            >
                <svg
                    viewBox="0 0 200 240"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full max-h-full max-w-full object-contain filter drop-shadow-[0_0_8px_rgba(255,179,122,0.8)]"
                >
                    <defs>
                        {/* Radiant Holy Fire Gradient */}
                        <linearGradient id="holyFlameTraceGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#C2361A" />
                            <stop offset="30%" stopColor="#FF5A2E" />
                            <stop offset="70%" stopColor="#FFB37A" />
                            <stop offset="100%" stopColor="#FFFDF8" />
                        </linearGradient>

                        <linearGradient id="holyCrossTraceGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                            <stop offset="0%" stopColor="#FFFDF8" />
                            <stop offset="50%" stopColor="#FFD700" />
                            <stop offset="100%" stopColor="#FF5A2E" />
                        </linearGradient>

                        {/* Ember Filter */}
                        <filter id="holyGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Outer Radiant Halo Ring */}
                    <circle
                        cx="100"
                        cy="110"
                        r="78"
                        stroke="url(#holyFlameTraceGrad)"
                        strokeWidth="1.2"
                        strokeDasharray="12 6"
                        className="animate-spin-slow opacity-60 origin-center"
                        style={{ transformOrigin: '100px 110px' }}
                    />

                    {/* The Sacred Latin Cross — Traced with Glowing Light */}
                    {/* Vertical Shaft */}
                    <path
                        d="M100 45 L100 175"
                        stroke="url(#holyCrossTraceGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        filter="url(#holyGlowFilter)"
                        className="logo-trace-stroke"
                        style={{
                            strokeDasharray: 140,
                            strokeDashoffset: isTraced ? 0 : 140,
                            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
                        }}
                    />

                    {/* Horizontal Beam */}
                    <path
                        d="M68 85 L132 85"
                        stroke="url(#holyCrossTraceGrad)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        filter="url(#holyGlowFilter)"
                        className="logo-trace-stroke"
                        style={{
                            strokeDasharray: 70,
                            strokeDashoffset: isTraced ? 0 : 70,
                            transition: 'stroke-dashoffset 0.9s cubic-bezier(0.25, 1, 0.5, 1) 0.3s',
                        }}
                    />

                    {/* Outer Leaping Holy Flame Tongues */}
                    {/* Left Wing Flame Arc */}
                    <path
                        d="M100 205 C75 185 45 155 52 110 C56 80 82 82 88 105 C92 120 85 145 100 170"
                        stroke="url(#holyFlameTraceGrad)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        filter="url(#holyGlowFilter)"
                        className="logo-trace-stroke"
                        style={{
                            strokeDasharray: 260,
                            strokeDashoffset: isTraced ? 0 : 260,
                            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
                        }}
                    />

                    {/* Right Wing Flame Arc */}
                    <path
                        d="M100 205 C125 185 155 155 148 110 C144 80 118 82 112 105 C108 120 115 145 100 170"
                        stroke="url(#holyFlameTraceGrad)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        filter="url(#holyGlowFilter)"
                        className="logo-trace-stroke"
                        style={{
                            strokeDasharray: 260,
                            strokeDashoffset: isTraced ? 0 : 260,
                            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
                        }}
                    />

                    {/* Inner Flame Tongue (Center Pinnacle) */}
                    <path
                        d="M100 175 C94 150 92 125 100 95 C108 125 106 150 100 175 Z"
                        stroke="url(#holyFlameTraceGrad)"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        filter="url(#holyGlowFilter)"
                        className="logo-trace-stroke"
                        style={{
                            strokeDasharray: 180,
                            strokeDashoffset: isTraced ? 0 : 180,
                            transition: 'stroke-dashoffset 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
                        }}
                    />

                    {/* Base Pedestal Arch */}
                    <path
                        d="M75 210 C90 205 110 205 125 210"
                        stroke="url(#holyFlameTraceGrad)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        filter="url(#holyGlowFilter)"
                        style={{
                            strokeDasharray: 60,
                            strokeDashoffset: isTraced ? 0 : 60,
                            transition: 'stroke-dashoffset 0.8s ease-out 0.6s',
                        }}
                    />
                </svg>
            </div>
        </div>
    );
}
