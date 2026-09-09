'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function MaskedVideoReveal() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    const toggleSound = () => {
        if (!videoRef.current) return;
        const newMuted = !videoRef.current.muted;
        videoRef.current.muted = newMuted;
        setIsMuted(newMuted);
    };

    useGSAP(() => {
        if (!sectionRef.current || !videoContainerRef.current) return;

        const mm = gsap.matchMedia();

        // Desktop layout — buttery smooth 60/120fps hardware-accelerated clipPath
        mm.add('(min-width: 768px)', () => {
            gsap.fromTo(
                videoContainerRef.current,
                { clipPath: 'inset(13% 13% 13% 13% round 24px)' },
                {
                    clipPath: 'inset(0% 0% 0% 0% round 0px)',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top top',
                        end: '+=100%',
                        scrub: true, // Synced directly with Lenis for zero latency lag
                        pin: true,
                    },
                }
            );
        });

        // Mobile layout
        mm.add('(max-width: 767px)', () => {
            gsap.fromTo(
                videoContainerRef.current,
                { clipPath: 'inset(9% 4% 9% 4% round 18px)' },
                {
                    clipPath: 'inset(0% 0% 0% 0% round 0px)',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top top',
                        end: '+=80%',
                        scrub: true,
                        pin: true,
                    },
                }
            );
        });

        return () => mm.revert();
    }, { scope: sectionRef });

    return (
        <section
            ref={sectionRef}
            className="relative w-full bg-[#07060A] overflow-hidden select-none"
        >
            {/* Ambient Background Radial Glow (Zero-blur CSS for maximum GPU framerate) */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="w-[85vw] max-w-5xl h-[65vh] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.12)_0%,rgba(245,158,11,0.06)_45%,transparent_75%)]" />
            </div>

            {/* Seamless Top Seam Fade */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-b from-[#07060A] via-[#07060A]/80 to-transparent z-20" />

            {/* Fullscreen Masked Container */}
            <div className="relative h-screen w-full overflow-hidden">
                <div
                    ref={videoContainerRef}
                    className="absolute inset-0 overflow-hidden transform-gpu will-change-[clip-path]"
                    style={{ clipPath: 'inset(13% 13% 13% 13% round 24px)' }}
                >
                    {/* Video Asset — Pure GPU hardware decode without software re-scaling */}
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover object-center transform-gpu"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        disablePictureInPicture
                    >
                        <source src="/videos/coj video.mp4" type="video/mp4" />
                    </video>

                    {/* Gradient Overlay for Cinematic High-Contrast Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/60 pointer-events-none" />

                    {/* Golden Radial Sheen */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.10)_0%,transparent_65%)] pointer-events-none" />

                    {/* Editorial Content Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-5 sm:px-8 pointer-events-none">
                        {/* Sacred Eyebrow Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-black/60 border border-amber-400/30 text-[10px] sm:text-xs font-semibold tracking-[0.25em] text-amber-300 uppercase mb-4 sm:mb-6 shadow-md">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Sacred Worship Sanctuary</span>
                        </div>

                        {/* Grand Title */}
                        <h2 className="font-playfair text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-3 sm:mb-5 max-w-4xl leading-[1.15] drop-shadow-2xl">
                            Step Into The <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-[#FF5A2E] bg-clip-text text-transparent italic">Presence</span>
                        </h2>

                        {/* Sacred Verse / Subtitle */}
                        <p className="font-space text-xs sm:text-sm md:text-base text-white/80 max-w-xl sm:max-w-2xl leading-relaxed mb-6 sm:mb-8 font-light drop-shadow">
                            Where hearts are restored, prayers are heard, and the tangible glory of God transforms lives every single gathering.
                        </p>

                        {/* Luminous Center Divider */}
                        <div className="flex items-center gap-3">
                            <div className="w-12 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-amber-400/60" />
                            <div className="w-1.5 h-1.5 rotate-45 bg-amber-400 shadow-[0_0_8px_#F59E0B]" />
                            <div className="w-12 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-amber-400/60" />
                        </div>
                    </div>

                    {/* Audio Toggle Button */}
                    <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 z-30 pointer-events-auto">
                        <button
                            type="button"
                            onClick={toggleSound}
                            aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                            className="group flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-black/70 hover:bg-black/90 border border-white/20 hover:border-amber-400/50 text-white/90 hover:text-white transition-all duration-200 shadow-lg cursor-pointer transform hover:scale-105 active:scale-95"
                        >
                            {isMuted ? (
                                <>
                                    <VolumeX className="w-4 h-4 text-amber-400/80 group-hover:text-amber-400 transition-colors" />
                                    <span className="text-[11px] sm:text-xs font-space tracking-wider uppercase opacity-80 group-hover:opacity-100">Sound Off</span>
                                </>
                            ) : (
                                <>
                                    <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />
                                    <span className="text-[11px] sm:text-xs font-space tracking-wider uppercase text-amber-300">Sound On</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Live Atmosphere Indicator (Top-Right) */}
                    <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-30 pointer-events-none">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-space tracking-widest text-white/70 uppercase">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span>COJ LIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seamless Bottom Seam Fade */}
            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-t from-[#07060A] via-[#07060A]/80 to-transparent z-20" />
        </section>
    );
}
