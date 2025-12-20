'use client';

import { useAppStore } from "@/store/useAppStore";
import Logo from "../ui/Logo";

export default function ExperienceOverlay() {
    const setMode = useAppStore((state) => state.setMode);

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            {/* Content Overlay */}
            <div className="text-center pointer-events-auto flex flex-col items-center">
                {/* Logo Section */}
                <div className="mb-8 flex flex-col items-center justify-center transform-style-3d animate-float-slow">
                    {/* Flame & Cross Icon (Resized Smaller) */}
                    <div className="relative w-20 h-24 mb-3 drop-shadow-[0_0_20px_rgba(255,87,34,0.5)]">
                        <style jsx>{`
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
                            
                            .hero-text-shine {
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
                                <linearGradient id="fire-gradient-hero" x1="50%" y1="100%" x2="50%" y2="0%">
                                    <stop offset="0%" stopColor="#D50000" />
                                    <stop offset="50%" stopColor="#FF6D00" />
                                    <stop offset="100%" stopColor="#FFD600" />
                                </linearGradient>
                                <linearGradient id="cross-gradient-hero" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#FFECB3" />
                                    <stop offset="50%" stopColor="#FFC107" />
                                    <stop offset="100%" stopColor="#FF6F00" />
                                </linearGradient>
                                <filter id="glow-intense-hero">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <path d="M50 115 C20 115 5 80 5 60 C5 35 30 5 50 0 C70 5 95 35 95 60 C95 80 80 115 50 115 Z" fill="#B71C1C" opacity="0.6" className="flame-main" />
                            <path d="M50 110 C25 105 10 75 15 55 C20 35 40 20 50 5 C60 20 80 35 85 55 C90 75 75 105 50 110 Z" fill="url(#fire-gradient-hero)" filter="url(#glow-intense-hero)" className="flame-main" style={{ animationDelay: '0.5s' }} />
                            <path d="M50 15 Q40 40 35 55 Q30 70 50 85 Q70 70 65 55 Q60 40 50 15" fill="#FFAB00" opacity="0.8" className="flame-inner" />
                            <path d="M50 40 V 100 M30 60 H 70" stroke="url(#cross-gradient-hero)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-intense-hero)" />
                        </svg>
                    </div>

                    {/* Text Lockup (Resized Smaller) */}
                    <div className="flex flex-col items-center">
                        <div className="flex items-baseline gap-1.5 leading-none">
                            <span className="text-2xl md:text-3xl font-serif tracking-wide drop-shadow-lg hero-text-shine" style={{ fontFamily: 'Georgia, serif' }}>CALL</span>
                            <span className="text-[10px] md:text-xs font-sans font-bold uppercase tracking-wider -translate-y-0.5 text-white/70">OF</span>
                            <span className="text-2xl md:text-3xl font-serif tracking-wide drop-shadow-lg hero-text-shine" style={{ fontFamily: 'Georgia, serif' }}>JESUS</span>
                        </div>
                        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent my-1.5"></div>
                        <span className="text-[8px] md:text-[10px] font-sans font-bold tracking-[0.6em] uppercase drop-shadow-md text-amber-500 animate-pulse">
                            MINISTRIES
                        </span>
                    </div>
                </div>

                {/* Verse Section */}
                <div className="mb-12 relative group cursor-default max-w-3xl mx-auto px-4">
                    {/* Glow effect */}
                    <span className="absolute -inset-8 bg-[#FF6D00]/10 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition duration-1000"></span>

                    {/* The Verse Text (Vachan) - Main Focus */}
                    <h2 className="relative text-2xl md:text-3xl lg:text-4xl font-bold leading-tight text-white drop-shadow-2xl text-balance italic">
                        "Come to me, all you who are weary and burdened, and I will give you rest."
                    </h2>

                    {/* The Reference (Small) */}
                    <p className="mt-4 text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-[var(--brand)] opacity-90">
                        — Matthew 11:28
                    </p>
                </div>

                {/* Button */}
                <button
                    onClick={() => setMode('UTILITY')}
                    className="group relative px-8 py-3 bg-white/5 hover:bg-[var(--brand)] backdrop-blur-md border border-white/20 hover:border-[var(--brand)] rounded-full text-sm tracking-widest uppercase transition-all duration-300 overflow-hidden"
                >
                    <span className="relative z-10 group-hover:text-white font-bold">Enter Worship</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand)] to-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
            </div>
        </div>
    );
}
