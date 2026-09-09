'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const MARQUEE_TEXT_1 = 'JESUS IS LORD • SUPERNATURAL FREEDOM • HOLY SPIRIT FIRE • UNCONDITIONAL GRACE • ';
const MARQUEE_TEXT_2 = 'PRAISE THE LORD • KING OF KINGS • HEALING & REVIVAL • FAITH MOVES MOUNTAINS • ';

export default function KineticMarquee() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!row1Ref.current || !row2Ref.current || !sectionRef.current) return;

        // Row 1: Moves LEFT on scroll
        gsap.to(row1Ref.current, {
            xPercent: -35,
            ease: 'none',
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5,
            },
        });

        // Row 2: Moves RIGHT on scroll
        gsap.to(row2Ref.current, {
            xPercent: 35,
            ease: 'none',
            scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5,
            },
        });
    }, { scope: sectionRef });

    return (
        <section
            ref={sectionRef}
            className="relative py-14 sm:py-20 md:py-24 overflow-hidden bg-gradient-to-b from-[#07060A] via-[#0C0A14] to-[#07060A] select-none"
        >
            {/* Luminous Top & Bottom Seam Fades */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF5A2E]/25 via-[#FFB37A]/30 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFB37A]/30 via-[#FF5A2E]/25 to-transparent pointer-events-none" />

            {/* Left & Right Edge Vignette Fades */}
            <div className="absolute inset-y-0 left-0 w-20 sm:w-36 md:w-56 bg-gradient-to-r from-[#07060A] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-20 sm:w-36 md:w-56 bg-gradient-to-l from-[#07060A] to-transparent z-10 pointer-events-none" />

            {/* Ambient Background Aura Glow behind center */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[500px] h-48 sm:h-[300px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.18)_0%,rgba(255,90,46,0.10)_45%,transparent_75%)] blur-3xl transform-gpu" />

            {/* Row 1 — Bold Modern Typography moving Left */}
            <div className="overflow-hidden mb-4 sm:mb-6 md:mb-8">
                <div
                    ref={row1Ref}
                    className="flex whitespace-nowrap will-change-transform"
                    style={{ transform: 'translateX(0%)' }}
                >
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span
                            key={`r1-${i}`}
                            className="font-space font-black text-[9vw] sm:text-[7vw] md:text-[5.5vw] uppercase tracking-tight text-white/[0.08] hover:text-white/[0.18] transition-colors leading-none flex-shrink-0"
                            style={{ letterSpacing: '-0.02em' }}
                        >
                            {MARQUEE_TEXT_1}
                        </span>
                    ))}
                </div>
            </div>

            {/* Row 2 — Italic Editorial Serif Typography moving Right */}
            <div className="overflow-hidden">
                <div
                    ref={row2Ref}
                    className="flex whitespace-nowrap will-change-transform"
                    style={{ transform: 'translateX(-35%)' }}
                >
                    {Array.from({ length: 5 }).map((_, i) => (
                        <span
                            key={`r2-${i}`}
                            className="font-playfair italic font-bold text-[9vw] sm:text-[7vw] md:text-[5.5vw] uppercase tracking-tight text-amber-500/[0.12] hover:text-amber-500/[0.22] transition-colors leading-none flex-shrink-0"
                            style={{ letterSpacing: '-0.02em' }}
                        >
                            {MARQUEE_TEXT_2}
                        </span>
                    ))}
                </div>
            </div>

            {/* Center Fixed Focal Statement */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="text-center px-4 sm:px-6 max-w-3xl">
                    <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.35em] sm:tracking-[0.45em] text-amber-400 font-bold mb-3 sm:mb-4 font-space drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                        Call of Jesus Ministries • Since 2015
                    </p>

                    <h2
                        className="font-playfair font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight leading-[1.05] text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF8] via-[#FFB37A] to-[#F59E0B] drop-shadow-[0_10px_35px_rgba(245,158,11,0.3)]"
                        style={{ letterSpacing: '-0.02em' }}
                    >
                        Where Heaven<br />Meets Earth
                    </h2>

                    <p className="text-xs sm:text-sm text-white/60 font-light mt-3 sm:mt-4 tracking-wider max-w-md mx-auto leading-relaxed">
                        A sanctuary of supernatural faith, anointed worship, and transformation.
                    </p>

                    <div className="w-16 sm:w-24 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent mx-auto mt-5 sm:mt-7 shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                </div>
            </div>
        </section>
    );
}
