import React from 'react';

export default function MinistryLogo({ className = "" }: { className?: string }) {
    return (
        <div className={`flex flex-col items-center justify-center transform-style-3d animate-float-slow ${className}`}>

            {/* Flame & Cross Icon */}
            <div className="relative w-16 h-20 mb-3 drop-shadow-[0_0_15px_rgba(255,87,34,0.4)]">
                <style>{`
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
                    <span className="text-2xl font-serif tracking-wide drop-shadow-lg logo-text-shine" style={{ fontFamily: 'Georgia, serif' }}>CALL</span>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider -translate-y-0.5 text-white/70">OF</span>
                    <span className="text-2xl font-serif tracking-wide drop-shadow-lg logo-text-shine" style={{ fontFamily: 'Georgia, serif' }}>JESUS</span>
                </div>
                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent my-1"></div>
                <span className="text-[9px] font-sans font-bold tracking-[0.6em] uppercase drop-shadow-md text-amber-500 animate-pulse">
                    MINISTRIES
                </span>
            </div>
        </div>
    );
}
