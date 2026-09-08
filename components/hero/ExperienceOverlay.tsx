'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from "@/store/useAppStore";
import LandingNavbar from "./LandingNavbar";
import Link from 'next/link';
import {
    ArrowRight, ArrowUp, Music, ChevronRight, ChevronLeft,
    Youtube, Instagram, Facebook, MessageCircle,
    BookOpen, Heart, Flame, Sparkles, Quote,
    Calendar, Clock, MapPin, Sun, Wine, Navigation,
    Volume2, VolumeX, Play, Pause,
    Share2, Copy, Check, Mail, Send, ArrowUpRight, Globe
} from 'lucide-react';
import BlackRemoverImage from "@/components/ui/BlackRemoverImage";
import { generateSlug } from '@/lib/seoUtils';
import { getSongImage } from '@/lib/utils';
import { getVerseOfTheDay } from '@/lib/getVerseOfTheDay';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import CircularTestimonials from "@/components/ui/CircularTestimonials";
import LiquidButton from "@/components/ui/LiquidButton";

const ICON_MAP: Record<string, any> = {
    BookOpen,
    Sun,
    Wine,
    Calendar,
    Clock,
    MapPin,
    Sparkles,
    Flame
};

const DEFAULT_EVENTS = [
    {
        id: "6d3320ae-0c1d-49d9-9cb6-fadd8d736710",
        title_en: "Bible Study",
        title_hi: "बाइबिल अध्ययन",
        time_en: "Every Friday, 7:00 PM - 9:30 PM",
        time_hi: "हर शुक्रवार, शाम 7:00 बजे से 9:30 बजे तक",
        desc_en: "Deep dive into the Word of God.",
        desc_hi: "परमेश्वर के वचन का गहरा अध्ययन।",
        icon_name: "BookOpen",
        gradient: "from-blue-600/20 to-cyan-500/20",
        color: "text-blue-400"
    },
    {
        id: "6ddffa86-df89-41ce-973a-1cdfefe2c40d",
        title_en: "Worship Service",
        title_hi: "आराधना सभा",
        time_en: "Every Sunday, 10:30 AM",
        time_hi: "हर रविवार, सुबह 10:30 बजे",
        desc_en: "Corporate worship and sermon.",
        desc_hi: "सांप्रदायिक आराधना और उपदेश।",
        icon_name: "Sun",
        gradient: "from-amber-500/20 to-orange-500/20",
        color: "text-amber-500"
    },
    {
        id: "08e7d36d-dc02-4b49-bd42-19bbe5ca56d0",
        title_en: "Holy Communion",
        title_hi: "पवित्र प्रभु भोज",
        time_en: "1st Sunday of Every Month",
        time_hi: "हर महीने के पहले रविवार को",
        desc_en: "Remembering the Lord's sacrifice.",
        desc_hi: "प्रभु के बलिदान को याद करना।",
        icon_name: "Wine",
        gradient: "from-red-600/20 to-purple-600/20",
        color: "text-red-500"
    }
];

// ══════════════════════════════════════════════════════════════════════
// SCROLL PROGRESS BAR — Pure rAF, Zero React Re-Renders
// ══════════════════════════════════════════════════════════════════════
function ScrollProgressBar() {
    const barRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const docH = document.documentElement.scrollHeight - window.innerHeight;
                    if (docH > 0 && barRef.current) {
                        const progress = Math.min(1, Math.max(0, window.scrollY / docH));
                        barRef.current.style.transform = `scaleX(${progress})`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div
            ref={barRef}
            className="fixed top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#C2361A] via-[#FF5A2E] to-[#FFB37A] z-[100] origin-left pointer-events-none"
            style={{ transform: 'scaleX(0)' }}
        />
    );
}

// ══════════════════════════════════════════════════════════════════════
// BACK TO TOP BUTTON — Self-contained, Zero Page Re-Renders
// ══════════════════════════════════════════════════════════════════════
function BackToTopButton() {
    const [show, setShow] = useState(false);
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const shouldShow = window.scrollY > 600;
                    setShow((prev) => (prev !== shouldShow ? shouldShow : prev));
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-[#0D0B12]/95 border border-[#F4EDE2]/15 text-[#F4EDE2] flex items-center justify-center hover:border-[#FF5A2E]/60 hover:text-[#FF5A2E] active:scale-95 transition-all duration-300 shadow-2xl ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            aria-label="Scroll to top"
        >
            <ArrowUp className="w-4 h-4 text-inherit" />
        </button>
    );
}

// ══════════════════════════════════════════════════════════════════════
// SECTION SEAM — Elegant luminous section transition marker
// ══════════════════════════════════════════════════════════════════════
function SectionSeam({ variant = 'amber' }: { variant?: 'amber' | 'rose' | 'purple' }) {
    const glowClass = variant === 'rose'
        ? 'via-rose-500/35 border-rose-400/40'
        : variant === 'purple'
            ? 'via-purple-500/35 border-purple-400/40'
            : 'via-amber-500/40 border-amber-400/40';

    return (
        <div className="relative w-full py-3 sm:py-5 flex items-center justify-center overflow-hidden pointer-events-none z-20">
            <div className="w-full max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent relative">
                <div className={`absolute left-1/2 -top-[1px] -translate-x-1/2 w-32 sm:w-48 h-[2px] bg-gradient-to-r from-transparent ${glowClass.split(' ')[0]} to-transparent`} />
                <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 border ${glowClass.split(' ')[1]} bg-[#07060A] shadow-[0_0_8px_rgba(245,158,11,0.5)]`} />
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════
// HERO SECTION — Fully Isolated State & Timers (Zero Below-Fold Re-renders)
// ══════════════════════════════════════════════════════════════════════
const HERO_VIDEOS = [
    {
        id: 'anniversary',
        src: '/videos/coj video for hero annivercery.mp4',
        title: '12th Anniversary Celebration',
        tag: 'Anniversary Special',
        label: '01'
    },
    {
        id: 'worship',
        src: '/videos/coj video.mp4',
        title: 'Call of Jesus Ministries',
        tag: 'Worship Experience',
        label: '02'
    }
];

const KINETIC_PHRASES = [
    { text: "Meets Earth", gradient: "from-[#FFB37A] via-[#FF5A2E] to-[#C2361A]" },
    { text: "Heals Hearts", gradient: "from-[#FFD700] via-[#FF8C68] to-[#C2361A]" },
    { text: "Transforms Lives", gradient: "from-[#F59E0B] via-[#FF5A2E] to-[#981C01]" },
    { text: "Ignites Revival", gradient: "from-[#FDE047] via-[#FF5A2E] to-[#C2361A]" }
];

function HeroSection() {
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const [isVideoMuted] = useState(true);
    const [isVideoPlaying] = useState(true);
    const [isHeroVisible, setIsHeroVisible] = useState(true);
    const video1Ref = useRef<HTMLVideoElement>(null);
    const video2Ref = useRef<HTMLVideoElement>(null);
    const heroBoxRef = useRef<HTMLDivElement>(null);

    // Mobile 3-Split Cinematic Hero Intro (Ankit Sajwan Style — Opaque, Distinct Slots)
    const [isMobileSplitExpanded, setIsMobileSplitExpanded] = useState(false);
    const topVideoRef = useRef<HTMLVideoElement>(null);
    const mobileMiddleVidRef = useRef<HTMLVideoElement>(null);
    const bottomVideoRef = useRef<HTMLVideoElement>(null);

    // Mobile 3-Split Cinematic Hero Intro Timer
    useEffect(() => {
        // Guarantee muted autoplay on mobile devices
        if (topVideoRef.current) {
            topVideoRef.current.muted = true;
            topVideoRef.current.currentTime = 2;
            topVideoRef.current.play().catch(() => { });
        }
        if (mobileMiddleVidRef.current) {
            mobileMiddleVidRef.current.muted = true;
            mobileMiddleVidRef.current.play().catch(() => { });
        }
        if (bottomVideoRef.current) {
            bottomVideoRef.current.muted = true;
            bottomVideoRef.current.currentTime = 14;
            bottomVideoRef.current.play().catch(() => { });
        }

        // Keep 3-split playing for 16s so users can fully soak in the multi-cam worship
        const expandTimer = setTimeout(() => {
            setIsMobileSplitExpanded(true);
            setTimeout(() => {
                topVideoRef.current?.pause();
                bottomVideoRef.current?.pause();
            }, 1800);
        }, 16000);

        return () => clearTimeout(expandTimer);
    }, []);

    const [kineticIndex, setKineticIndex] = useState(0);
    const [prevKineticIndex, setPrevKineticIndex] = useState<number | null>(null);
    const [isKineticSwapping, setIsKineticSwapping] = useState(false);

    // Auto-pause everything when hero scrolls out of view
    useEffect(() => {
        const heroEl = document.getElementById('hero');
        if (!heroEl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const isVisible = entries[0]?.isIntersecting ?? false;
                setIsHeroVisible(isVisible);
                const currentVid = activeVideoIndex === 0 ? video1Ref.current : video2Ref.current;
                const otherVid = activeVideoIndex === 0 ? video2Ref.current : video1Ref.current;

                if (isVisible && isVideoPlaying) {
                    currentVid?.play().catch(() => { });
                } else {
                    currentVid?.pause();
                    otherVid?.pause();
                }
            },
            { threshold: 0.05 }
        );

        observer.observe(heroEl);
        return () => observer.disconnect();
    }, [activeVideoIndex, isVideoPlaying]);

    // Kinetic Typography Swap - ONLY runs when Hero is visible
    useEffect(() => {
        if (!isHeroVisible) return;
        const interval = setInterval(() => {
            setPrevKineticIndex(kineticIndex);
            setIsKineticSwapping(true);
            setKineticIndex((prev) => (prev + 1) % KINETIC_PHRASES.length);

            const timer = setTimeout(() => {
                setIsKineticSwapping(false);
                setPrevKineticIndex(null);
            }, 680);

            return () => clearTimeout(timer);
        }, 3400);

        return () => clearInterval(interval);
    }, [kineticIndex, isHeroVisible]);

    // Video auto-slide - ONLY runs when Hero is visible & playing
    useEffect(() => {
        if (!isVideoPlaying || !isHeroVisible) return;
        const autoSlideTimer = setInterval(() => {
            setActiveVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
        }, 8000);

        return () => clearInterval(autoSlideTimer);
    }, [activeVideoIndex, isVideoPlaying, isHeroVisible]);

    // Video active switch
    useEffect(() => {
        const currentVid = activeVideoIndex === 0 ? video1Ref.current : video2Ref.current;
        const otherVid = activeVideoIndex === 0 ? video2Ref.current : video1Ref.current;

        if (currentVid) {
            currentVid.currentTime = 0;
            if (isVideoPlaying && isHeroVisible) {
                currentVid.play().catch(() => { });
            }
        }
        if (otherVid) {
            otherVid.pause();
        }
    }, [activeVideoIndex, isVideoPlaying, isHeroVisible]);

    // Hero fade on scroll - native hardware-accelerated transform & opacity
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (heroBoxRef.current && window.scrollY < window.innerHeight) {
                        const progress = Math.min(1, window.scrollY / (window.innerHeight * 0.6));
                        heroBoxRef.current.style.transform = `translate3d(0, ${-40 * progress}px, 0)`;
                        heroBoxRef.current.style.opacity = `${Math.max(0.15, 1 - 0.85 * progress)}`;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNextVideo = () => {
        setActiveVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
    };

    return (
        <section id="hero" className="relative w-full h-[100dvh] flex items-center justify-center text-center overflow-hidden">
            {/* Desktop Background Video Slider */}
            <div className="hidden md:block hero-bg-img absolute inset-0 z-0 overflow-hidden bg-[#07060A]">
                <video
                    ref={video1Ref}
                    src="/videos/coj%20video%20for%20hero%20annivercery.mp4"
                    autoPlay
                    muted={isVideoMuted}
                    playsInline
                    preload="metadata"
                    onEnded={handleNextVideo}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${activeVideoIndex === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                />
                <video
                    ref={video2Ref}
                    src="/videos/coj%20video.mp4"
                    muted={isVideoMuted}
                    playsInline
                    preload="metadata"
                    onEnded={handleNextVideo}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${activeVideoIndex === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute bottom-0 inset-x-0 h-40 sm:h-56 md:h-72 bg-gradient-to-t from-[#07060A] via-[#07060A]/85 via-[#07060A]/40 to-transparent pointer-events-none z-[4]" />
            </div>

            {/* Mobile 3-Split Cinematic Film Strips (< md — 100% Opaque, Zero Double-Exposure) */}
            <div
                onClick={() => setIsMobileSplitExpanded(true)}
                className="md:hidden absolute inset-0 z-0 flex flex-col w-full h-full overflow-hidden bg-black select-none"
            >
                {/* Top Slot (Anniversary Celebration Stage & Lights) */}
                <div
                    style={{
                        height: isMobileSplitExpanded ? '0%' : '33.333%',
                        opacity: isMobileSplitExpanded ? 0 : 1,
                        transition: 'height 1400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 900ms ease-out'
                    }}
                    className="relative w-full overflow-hidden shrink-0 bg-black"
                >
                    <video
                        ref={topVideoRef}
                        src="/videos/coj%20video%20for%20hero%20annivercery.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover object-[center_15%]"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>

                {/* Middle Slot (Pastor Preaching & Praise — Expands to 100% Full Screen) */}
                <div
                    style={{
                        height: isMobileSplitExpanded ? '100%' : '33.334%',
                        transition: 'height 1400ms cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    className="relative w-full flex-1 overflow-hidden bg-black"
                >
                    <video
                        ref={mobileMiddleVidRef}
                        src="/videos/coj%20video.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/25 pointer-events-none" />
                    {/* Seam shadows when in 3-split mode */}
                    <div
                        style={{ opacity: isMobileSplitExpanded ? 0 : 1, transition: 'opacity 800ms ease-out' }}
                        className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"
                    />
                    <div
                        style={{ opacity: isMobileSplitExpanded ? 0 : 1, transition: 'opacity 800ms ease-out' }}
                        className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"
                    />
                </div>

                {/* Bottom Slot (Congregation & Worship) */}
                <div
                    style={{
                        height: isMobileSplitExpanded ? '0%' : '33.333%',
                        opacity: isMobileSplitExpanded ? 0 : 1,
                        transition: 'height 1400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 900ms ease-out'
                    }}
                    className="relative w-full overflow-hidden shrink-0 bg-black"
                >
                    <video
                        ref={bottomVideoRef}
                        src="/videos/coj%20video%20for%20hero%20annivercery.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover object-[center_85%]"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                    <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
                </div>

                {/* Bottom fade into the page */}
                <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#07060A] via-[#07060A]/85 via-[#07060A]/40 to-transparent pointer-events-none z-[4]" />
            </div>

            {/* Hero Content */}
            <div ref={heroBoxRef} className="hero-content-box relative z-10 flex flex-col items-center px-4 sm:px-6 will-change-transform">
                <div className="hero-fade-in flex flex-col items-center" style={{ animationDelay: '0.4s' }}>
                    <p className="text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.25em] sm:tracking-[0.35em] text-amber-400/90 uppercase mb-2 md:mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] text-center">
                        Call of Jesus Ministries
                    </p>

                    <h1 className="flex flex-col items-center select-none">
                        <span
                            className="block text-3xl sm:text-5xl md:text-7xl lg:text-[100px] font-black tracking-tighter text-[#F4EDE2] drop-shadow-2xl leading-[1.08] text-center"
                        >
                            Where Heaven
                        </span>

                        <div className="relative text-3xl sm:text-5xl md:text-7xl lg:text-[100px] h-[1.3em] w-full max-w-4xl overflow-hidden flex items-center justify-center select-none mt-0.5 sm:mt-1">
                            <span
                                key={`kinetic-curr-${kineticIndex}`}
                                className={`block font-serif italic font-medium bg-gradient-to-r from-amber-400 via-[#FF5A2E] to-red-500 bg-clip-text text-transparent leading-[1.15] whitespace-nowrap drop-shadow-2xl ${isKineticSwapping ? 'kinetic-phrase-in' : ''}`}
                            >
                                {KINETIC_PHRASES[kineticIndex].text}
                            </span>

                            {isKineticSwapping && prevKineticIndex !== null && (
                                <span
                                    key={`kinetic-prev-${prevKineticIndex}`}
                                    className={`absolute font-serif italic font-medium bg-gradient-to-r from-amber-400 via-[#FF5A2E] to-red-500 bg-clip-text text-transparent leading-[1.15] whitespace-nowrap kinetic-phrase-out drop-shadow-2xl`}
                                >
                                    {KINETIC_PHRASES[prevKineticIndex].text}
                                </span>
                            )}
                        </div>
                    </h1>
                </div>

                <div className="hero-fade-in pt-4" style={{ animationDelay: '0.9s' }}>
                    <LiquidButton
                        href="https://maps.app.goo.gl/U6Unh6WEcAdbp89K6"
                        target="_blank"
                        rel="noopener noreferrer"
                        size="lg"
                        variant="amber"
                        icon={<ArrowRight className="w-4 h-4 text-[#FFB37A] group-hover:text-neutral-950 group-hover:translate-x-1.5 transition-all duration-300" />}
                        iconPosition="right"
                    >
                        Get Directions
                    </LiquidButton>
                </div>

                <Link
                    href="/worship"
                    className="hero-fade-in text-[#F4EDE2]/60 hover:text-[#FFB37A] text-xs tracking-[0.15em] uppercase font-medium transition-colors duration-300 mt-5 md:mt-6"
                    style={{ animationDelay: '1.1s' }}
                >
                    Explore Worship Songs →
                </Link>
            </div>

            {/* Static Minimal Scroll Indicator */}
            <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-2 opacity-40 pointer-events-none">
                <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1.5">
                    <div className="w-1 h-2 rounded-full bg-white" />
                </div>
            </div>
        </section>
    );
}

// ══════════════════════════════════════════════════════════════════════
// TESTIMONIALS DATASET — Static Constant Outside Component
// ══════════════════════════════════════════════════════════════════════
const TESTIMONIALS_DATA = [
    {
        name: "Sister Shweta",
        designation: "Creative Miracle • New Delhi",
        quote: "In 2020, during a routine medical examination, I was informed of a condition requiring surgical removal. But after earnest prayer at Call of Jesus Ministries, God performed a creative miracle! The doctors verified a completely brand-new organ. Truly, nothing is too hard for God!",
        src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&h=750&q=80"
    },
    {
        name: "Brother Rajesh",
        designation: "Cancer Healed • Faridabad",
        quote: "Diagnosed with stage 3 cancer, I came to the healing service with faith that moved mountains. After anointed prayer, post-service PET scans showed zero cancer cells remaining in my body! By His stripes, I am healed and alive.",
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&h=750&q=80"
    },
    {
        name: "Sister Priya",
        designation: "Mental Freedom • Noida",
        quote: "For years, I battled severe panic attacks, sleepless nights, and chronic depression. When I stepped into the prophetic presence of God here, every chain shattered. Jesus filled my heart with divine peace that surpasses all understanding.",
        src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&h=750&q=80"
    },
    {
        name: "Brother Samuel",
        designation: "Supernatural Favor • Gurugram",
        quote: "Standing on the verge of total business bankruptcy with mounting debts, I anchored my soul on God's Word. Within 90 days, supernatural contracts and miraculous debt clearance took place. God supplied every need exceedingly!",
        src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&h=750&q=80"
    },
    {
        name: "Sister Surabhi",
        designation: "Miracle Healing • New Delhi",
        quote: "Mandatory medical screenings initially showed reactive results for an incurable condition. Through intense prayer & covenant grace, repeat screenings at two top diagnostic centers came back 100% clear!",
        src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=750&q=80"
    }
];

export default function ExperienceOverlay({ initialData }: {
    initialData?: {
        trending?: any[];
        madeForYou?: any[];
        featured?: any[];
        heroSlides?: any[];
        todaysVerse?: any;
        announcements?: any[];
        events?: any[];
    }
}) {
    const setMode = useAppStore((state) => state.setMode);

    const trending = initialData?.trending || [];
    const featured = initialData?.featured || [];
    const verse = initialData?.todaysVerse || getVerseOfTheDay();
    const eventsList = (initialData?.events && initialData.events.length > 0) ? initialData.events : DEFAULT_EVENTS;

    // Verse of the Day Interactions
    const [copiedVerse, setCopiedVerse] = useState(false);
    const [showDevotional, setShowDevotional] = useState(false);

    const handleCopyVerse = () => {
        if (!verse) return;
        const textToCopy = `"${verse.text}"\n— ${verse.reference}\n\nCall of Jesus Ministries`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedVerse(true);
        toast.success('Verse copied to clipboard!');
        setTimeout(() => setCopiedVerse(false), 2500);
    };

    const handleShareVerse = () => {
        if (!verse) return;
        if (navigator.share) {
            navigator.share({
                title: 'Verse of the Day',
                text: `"${verse.text}" — ${verse.reference}`,
                url: window.location.href,
            }).catch(() => { });
        } else {
            handleCopyVerse();
        }
    };

    // Hardware-Accelerated Native IntersectionObserver for reveals & counters
    useEffect(() => {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
        );

        document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
            revealObserver.observe(el);
        });

        const counterObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target as HTMLElement;
                        const countTo = parseInt(el.getAttribute('data-count') || '0', 10);
                        const suffix = el.getAttribute('data-suffix') || '';
                        if (countTo > 0) {
                            const startTime = performance.now();
                            const duration = 1600;
                            const updateCount = (now: number) => {
                                const progress = Math.min(1, (now - startTime) / duration);
                                const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                                el.textContent = Math.floor(ease * countTo) + suffix;
                                if (progress < 1) {
                                    requestAnimationFrame(updateCount);
                                }
                            };
                            requestAnimationFrame(updateCount);
                        }
                        counterObserver.unobserve(el);
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.stat-counter-number').forEach((el) => {
            counterObserver.observe(el);
        });

        return () => {
            revealObserver.disconnect();
            counterObserver.disconnect();
        };
    }, []);

    return (
        <div className="relative w-full min-h-screen bg-[#07060A] text-[#F4EDE2] selection:bg-[#FF5A2E]/30 selection:text-white font-space overflow-x-hidden">
            <ScrollProgressBar />
            <LandingNavbar />
            <HeroSection />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* INFINITE MARQUEE BANNER — Seamless Ambient Horizon             */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="relative py-4 sm:py-6 md:py-8 overflow-hidden bg-gradient-to-b from-[#07060A] via-[#0D0B12] to-[#07060A]">
                {/* Luminous Top & Bottom Seam Fades */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF5A2E]/20 via-[#FFB37A]/25 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFB37A]/25 via-[#FF5A2E]/20 to-transparent pointer-events-none" />

                {/* Left & Right Edge Vignette Fades */}
                <div className="absolute inset-y-0 left-0 w-16 sm:w-24 md:w-48 bg-gradient-to-r from-[#07060A] to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-16 sm:w-24 md:w-48 bg-gradient-to-l from-[#07060A] to-transparent z-10 pointer-events-none" />

                <div className="animate-marquee flex whitespace-nowrap will-change-transform">
                    {Array.from({ length: 2 }).map((_, setIdx) => (
                        <div key={setIdx} className="flex items-center gap-5 sm:gap-8 px-2 sm:px-4">
                            {[
                                { word: 'Jesus is Lord', symbol: '✦', color: 'text-[#FF5A2E]', glow: 'drop-shadow-[0_0_10px_rgba(255,90,46,0.4)]' },
                                { word: 'Holy Spirit', symbol: '🕊️', color: 'text-[#FFB37A]', glow: 'drop-shadow-[0_0_10px_rgba(255,179,122,0.4)]' },
                                { word: 'Supernatural Freedom', symbol: '⚡', color: 'text-[#FDE047]', glow: 'drop-shadow-[0_0_10px_rgba(253,224,71,0.4)]' },
                                { word: 'Divine Healing', symbol: '✦', color: 'text-[#FF5A2E]', glow: 'drop-shadow-[0_0_10px_rgba(255,90,46,0.4)]' },
                                { word: 'Praise the Lord', symbol: '🔥', color: 'text-[#FF5A2E]', glow: 'drop-shadow-[0_0_10px_rgba(255,90,46,0.4)]' },
                                { word: 'Glory to God', symbol: '👑', color: 'text-[#FBBF24]', glow: 'drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]' },
                                { word: 'Emmanuel', symbol: '✦', color: 'text-[#F59E0B]', glow: 'drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]' }
                            ].map((item, i) => (
                                <span key={i} className="flex items-center gap-5 sm:gap-8">
                                    <span className="text-sm sm:text-lg md:text-2xl font-light tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[#F4EDE2]/60 font-space hover:text-[#F4EDE2] transition-colors">{item.word}</span>
                                    <span className={`${item.color} text-xs sm:text-sm ${item.glow}`}>{item.symbol}</span>
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 1. DAILY PROMISE — Intimate Scripture Sanctuary                */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="verse" className="perf-section min-h-[75vh] sm:min-h-[85vh] flex flex-col justify-center items-center relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden bg-[#07060A] text-white font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-b from-[#07060A] to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-t from-[#07060A] to-transparent z-10" />

                {/* ─────────────────────────────────────────────────────────── */}
                {/* AMBIENT GRADIENT AURA FRAMING (AJU BAJU AUR NICHE GLOW)     */}
                {/* Sacred Sanctuary Palette: Intimate Warm Amber & Honey Gold   */}
                {/* ─────────────────────────────────────────────────────────── */}

                {/* Left Side Aura ("Baaye Aju-Baju") — Warm Amber Gold Pillar */}
                <div className="pointer-events-none absolute -left-20 sm:-left-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.26)_0%,rgba(217,119,6,0.10)_45%,transparent_75%)] blur-2xl transform-gpu" />

                {/* Right Side Aura ("Daaye Aju-Baju") — Honey Gold Radiance */}
                <div className="pointer-events-none absolute -right-20 sm:-right-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.22)_0%,rgba(245,158,11,0.10)_45%,transparent_75%)] blur-2xl transform-gpu" />

                {/* Bottom Horizon Aura ("Niche Ka Gradient") — Luminous Sanctuary Atmosphere */}
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[50%] sm:h-[60%] bg-[radial-gradient(ellipse_120%_90%_at_50%_100%,rgba(245,158,11,0.20)_0%,rgba(217,119,6,0.08)_35%,transparent_80%)] transform-gpu" />

                {/* Starfield overlay for heavenly depth */}
                <div className="starfield opacity-30 pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 space-y-6 sm:space-y-8 reveal-on-scroll">
                    {/* Minimalist Editorial Title: Daily Promise */}
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white select-none">
                        Daily <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-100 to-white">Promise</span>
                    </h2>

                    {/* Scripture Quote — Centered Editorial Masterpiece */}
                    <div className="max-w-3xl mx-auto py-2 sm:py-4">
                        <blockquote className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-light italic leading-relaxed sm:leading-snug text-white/95 tracking-tight">
                            &ldquo;{verse?.text || "God is our refuge and strength, a very present help in trouble."}&rdquo;
                        </blockquote>

                        {/* Attribution: Reference & Ps. Samson Wilson */}
                        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-3">
                            <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-amber-400">
                                {verse?.reference || "Psalm 46:1"}
                            </span>
                            <span className="text-white/30">•</span>
                            <span className="text-xs sm:text-sm font-serif italic text-white/50">
                                Ps. Samson Wilson
                            </span>
                        </div>
                    </div>

                    {/* Understated Action Buttons */}
                    <div className="flex items-center justify-center gap-2.5 sm:gap-3 pt-2">
                        <button
                            onClick={handleCopyVerse}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.04] text-white/70 hover:text-amber-300 text-xs tracking-wider transition-all duration-300 active:scale-95"
                            aria-label="Copy verse"
                        >
                            {copiedVerse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedVerse ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                            onClick={handleShareVerse}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-amber-400/40 hover:bg-white/[0.04] text-white/70 hover:text-amber-300 text-xs tracking-wider transition-all duration-300 active:scale-95"
                            aria-label="Share verse"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share</span>
                        </button>
                        {verse?.reflection && (
                            <button
                                onClick={() => setShowDevotional(!showDevotional)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs tracking-wider transition-all duration-300 active:scale-95 ${
                                    showDevotional
                                        ? 'border-amber-400/50 bg-amber-500/10 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                                        : 'border-white/10 hover:border-amber-400/40 hover:bg-white/[0.04] text-white/70 hover:text-amber-300'
                                }`}
                                aria-label="Daily devotional reflection"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Reflection</span>
                            </button>
                        )}
                    </div>

                    {/* Expanded Devotional Reflection */}
                    {verse?.reflection && showDevotional && (
                        <div className="mt-8 max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-amber-500/20 backdrop-blur-md text-left space-y-4 animate-fade-in-down">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-amber-400 font-bold">
                                Daily Devotional Reflection
                            </p>
                            <p className="text-sm sm:text-base text-white/80 leading-relaxed font-light">
                                {verse.reflection}
                            </p>
                            {verse.prayer && (
                                <p className="text-sm sm:text-base text-amber-200/90 font-serif italic pt-3 border-t border-white/5">
                                    <span className="font-bold text-amber-400 not-italic text-xs tracking-widest uppercase">Prayer — </span>
                                    {verse.prayer}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 2. WEEKLY GATHERINGS — Editorial Community Timetable            */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="gatherings" className="perf-section min-h-[75vh] sm:min-h-[85vh] flex flex-col justify-center items-center relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden bg-[#07060A] text-white font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-b from-[#07060A] to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-t from-[#07060A] to-transparent z-10" />

                {/* ─────────────────────────────────────────────────────────── */}
                {/* AMBIENT GRADIENT AURA FRAMING (AJU BAJU AUR NICHE GLOW)     */}
                {/* Community Palette: Pentecost Flame & Ruby Garnet Embers     */}
                {/* ─────────────────────────────────────────────────────────── */}

                {/* Left Side Aura ("Baaye Aju-Baju") — Radiant Ruby Flame Vertical Light */}
                <div className="pointer-events-none absolute -left-20 sm:-left-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.24)_0%,rgba(225,29,72,0.10)_45%,transparent_75%)] blur-2xl transform-gpu" />

                {/* Right Side Aura ("Daaye Aju-Baju") — Warm Sunset Flame Vertical Light */}
                <div className="pointer-events-none absolute -right-20 sm:-right-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.22)_0%,rgba(255,90,46,0.10)_45%,transparent_75%)] blur-2xl transform-gpu" />

                {/* Bottom Horizon Aura ("Niche Ka Gradient") — Luminous Flame Atmosphere */}
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[50%] sm:h-[60%] bg-[radial-gradient(ellipse_120%_90%_at_50%_100%,rgba(255,90,46,0.18)_0%,rgba(225,29,72,0.08)_35%,transparent_80%)] transform-gpu" />

                {/* Starfield overlay for heavenly depth */}
                <div className="starfield opacity-30 pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 space-y-8 sm:space-y-10 reveal-on-scroll">
                    {/* Minimalist Editorial Title: Weekly Gatherings */}
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white select-none">
                            Weekly <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-br from-orange-300 via-rose-300 to-amber-200">Gatherings</span>
                        </h2>
                        <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto font-light leading-relaxed">
                            Experience the tangible presence of God together. Come as you are.
                        </p>
                    </div>

                    {/* Editorial Service Schedule List — Sleek, Unified, Professional */}
                    <div className="max-w-3xl mx-auto divide-y divide-white/[0.08] border-y border-white/[0.08]">
                        {eventsList.map((event: any, i: number) => {
                            const IconComponent = ICON_MAP[event.icon_name] || (i === 0 ? BookOpen : i === 1 ? Sun : Wine);

                            return (
                                <div
                                    key={event.id || i}
                                    className="group py-5 sm:py-6 px-2 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors rounded-xl"
                                >
                                    {/* Left: Clean Icon + Title + Hindi Badge + Desc */}
                                    <div className="flex items-start sm:items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0 text-amber-400 group-hover:border-amber-400/40 group-hover:scale-105 transition-all duration-300">
                                            <IconComponent className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <h3 className="text-base sm:text-lg font-medium text-white group-hover:text-amber-300 transition-colors">
                                                    {event.title_en || event.titleEn}
                                                </h3>
                                                {(event.title_hi || event.titleHi) && (
                                                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.04] text-amber-400/80 font-serif italic">
                                                        {event.title_hi || event.titleHi}
                                                    </span>
                                                )}
                                            </div>
                                            {(event.desc_en || event.descEn) && (
                                                <p className="text-xs sm:text-sm text-white/50 font-light">
                                                    {event.desc_en || event.descEn}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Clean Timing with Subtle Pulse */}
                                    <div className="flex items-center gap-2 pl-14 sm:pl-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-xs sm:text-sm text-white/70 font-light tracking-wide">
                                            {event.time_en || event.timeEn}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Directions CTA Button */}
                    <div className="text-center pt-2">
                        <a
                            href="https://maps.app.goo.gl/U6Unh6WEcAdbp89K6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/15 hover:border-amber-400/50 bg-white/[0.03] hover:bg-white/[0.06] text-white/90 hover:text-amber-300 transition-all duration-300 text-xs sm:text-sm tracking-wider active:scale-95"
                        >
                            <MapPin className="w-4 h-4 text-amber-400" />
                            <span>Get Directions to Church</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* 3. OUR VISION — Atmospheric Editorial Sanctuary                 */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="vision" className="perf-section min-h-[85vh] sm:min-h-screen flex flex-col justify-center items-center relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden bg-[#07060A] text-white font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-32 sm:h-44 bg-gradient-to-b from-[#07060A] to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-32 sm:h-44 bg-gradient-to-t from-[#07060A] to-transparent z-10" />

                {/* ─────────────────────────────────────────────────────────── */}
                {/* AMBIENT GRADIENT AURA FRAMING (AJU BAJU AUR NICHE GLOW)     */}
                {/* COJ Brand Signature Palette: Amber Gold + Flame + Amethyst   */}
                {/* ─────────────────────────────────────────────────────────── */}

                {/* Left Side Aura ("Baaye Aju-Baju") — Radiant Amber-Gold Vertical Light */}
                <div className="pointer-events-none absolute -left-20 sm:-left-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.28)_0%,rgba(217,119,6,0.12)_45%,transparent_75%)] blur-2xl transform-gpu" />

                {/* Right Side Aura ("Daaye Aju-Baju") — Radiant Flame & Amethyst Vertical Light */}
                <div className="pointer-events-none absolute -right-20 sm:-right-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.24)_0%,rgba(110,91,255,0.16)_45%,transparent_75%)] blur-2xl transform-gpu" />

                {/* Bottom Horizon Aura ("Niche Ka Gradient") — Luminous Atmosphere */}
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[55%] sm:h-[65%] bg-[radial-gradient(ellipse_120%_90%_at_50%_100%,rgba(245,158,11,0.24)_0%,rgba(255,90,46,0.14)_32%,rgba(110,91,255,0.06)_62%,transparent_82%)] transform-gpu" />

                {/* Starfield overlay for heavenly depth */}
                <div className="starfield opacity-30 pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto text-center px-5 sm:px-8 space-y-6 sm:space-y-8 reveal-on-scroll">
                    {/* Minimalist Editorial Title: Our Mission */}
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white select-none">
                        Our <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-100 to-white">Mission</span>
                    </h2>

                    {/* COJ Original Mission Statement with Shimmering Italic Accents */}
                    <div className="flex justify-center max-w-3xl mx-auto">
                        <p className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-tight leading-relaxed sm:leading-snug text-white/95 text-center">
                            To <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-orange-300">prepare people</span> across the world for the <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-orange-300">second coming</span> of Jesus Christ.
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TRENDING WORSHIP — Editorial Atmospheric Showcase              */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {trending.length > 0 && (
                <>
                    <SectionSeam />
                    <section id="trending" className="perf-section min-h-[75vh] flex flex-col justify-center relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden bg-[#07060A] text-white font-space">
                        {/* Seamless Section Top & Bottom Fade Overlays */}
                        <div className="pointer-events-none absolute top-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-b from-[#07060A] to-transparent z-10" />
                        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-t from-[#07060A] to-transparent z-10" />

                        {/* Left Side Aura — Warm Copper & Amber Vertical Pillar */}
                        <div className="pointer-events-none absolute -left-20 sm:-left-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.24)_0%,rgba(255,90,46,0.10)_45%,transparent_75%)] blur-2xl transform-gpu" />

                        {/* Right Side Aura — Deep Flame Vertical Pillar */}
                        <div className="pointer-events-none absolute -right-20 sm:-right-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.22)_0%,rgba(245,158,11,0.08)_45%,transparent_75%)] blur-2xl transform-gpu" />

                        {/* Bottom Horizon Aura — Luminous Atmosphere */}
                        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[50%] sm:h-[60%] bg-[radial-gradient(ellipse_120%_90%_at_50%_100%,rgba(245,158,11,0.18)_0%,rgba(255,90,46,0.08)_35%,transparent_80%)] transform-gpu" />

                        {/* Starfield overlay for depth */}
                        <div className="starfield opacity-30 pointer-events-none" />

                        <div className="relative z-10 max-w-7xl mx-auto w-full space-y-8 sm:space-y-10 reveal-on-scroll">
                            {/* Editorial Title */}
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
                                <div className="space-y-3">
                                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white select-none">
                                        Trending <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-100 to-white">Worship</span>
                                    </h2>
                                    <p className="text-sm sm:text-base text-white/60 max-w-xl font-light leading-relaxed">
                                        The most loved worship songs from our community this season.
                                    </p>
                                </div>
                                <LiquidButton
                                    onClick={() => setMode('UTILITY')}
                                    size="sm"
                                    variant="amber"
                                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                                    iconPosition="right"
                                    className="hidden md:inline-flex"
                                >
                                    View All
                                </LiquidButton>
                            </div>

                            {/* Horizontal Scroll Songs */}
                            <div className="gsap-songs-hscroll overflow-x-auto scrollbar-none flex gap-3.5 md:gap-5 pb-3 sm:pb-4 scroll-smooth reveal-on-scroll reveal-delay-1">
                                {trending.slice(0, 8).map((song, i) => {
                                    const rankBadgeStyle = i === 0
                                        ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/30 text-[10px] px-3 py-1'
                                        : i === 1
                                            ? 'bg-white text-black font-bold shadow-lg text-[9px] px-2.5 py-0.5'
                                            : i === 2
                                                ? 'bg-gradient-to-r from-amber-400 to-red-500 text-white font-bold shadow-lg text-[9px] px-2.5 py-0.5'
                                                : 'bg-white/10 border border-white/10 text-amber-400 text-[9px] px-2.5 py-0.5';

                                    return (
                                        <Link
                                            key={i}
                                            href={`/songs/${generateSlug(song.title)}`}
                                            className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-end border border-white/10 hover:border-amber-500/50 transition-all duration-300 flex-shrink-0 bg-[#0A0A0A] ${i === 0 ? 'w-[75vw] sm:w-[320px] md:w-[420px] min-h-[220px] sm:min-h-[300px] md:min-h-[420px]' : 'w-[52vw] sm:w-[240px] md:w-[280px] min-h-[170px] sm:min-h-[220px] md:min-h-[320px]'
                                                }`}
                                        >
                                            <img
                                                src={getSongImage(song)}
                                                alt={song.title}
                                                loading="lazy"
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                style={{ filter: 'brightness(0.85) contrast(1.04) saturate(1.05)' }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 via-transparent to-transparent" />

                                            <div className="relative z-10 p-3.5 sm:p-4 md:p-6 space-y-1 sm:space-y-1.5">
                                                <span className={`font-black uppercase tracking-widest rounded-full inline-block ${rankBadgeStyle}`}>
                                                    #{i + 1}
                                                </span>
                                                <h3 className={`font-bold text-white leading-tight truncate group-hover:text-amber-400 transition-colors ${i === 0 ? 'text-base sm:text-lg md:text-2xl' : 'text-xs sm:text-sm md:text-base'}`}>
                                                    {song.title}
                                                </h3>
                                                <p className={`text-white/60 truncate ${i === 0 ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-[11px]'}`}>{song.artist}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                </>
            )}

            <SectionSeam />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* GOD STORIES — Editorial Atmospheric Testimony Sanctuary        */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="stories" className="perf-section min-h-[75vh] flex flex-col justify-center relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden bg-[#07060A] text-white font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-b from-[#07060A] to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-t from-[#07060A] to-transparent z-10" />

                {/* Left Side Aura — Warm Flame Vertical Pillar (Hardware-accelerated soft feathering) */}
                <div className="pointer-events-none absolute -left-20 sm:-left-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.24)_0%,rgba(225,29,72,0.10)_45%,transparent_75%)] blur-2xl transform-gpu" />

                {/* Right Side Aura — Amber Gold Vertical Pillar (Hardware-accelerated soft feathering) */}
                <div className="pointer-events-none absolute -right-20 sm:-right-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.22)_0%,rgba(255,90,46,0.08)_45%,transparent_75%)] blur-2xl transform-gpu" />

                {/* Bottom Horizon Aura */}
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[50%] sm:h-[60%] bg-[radial-gradient(ellipse_120%_90%_at_50%_100%,rgba(255,90,46,0.18)_0%,rgba(245,158,11,0.08)_35%,transparent_80%)] transform-gpu" />

                {/* Starfield overlay */}
                <div className="starfield opacity-30 pointer-events-none" />

                <div className="relative z-10 max-w-5xl mx-auto w-full space-y-8 sm:space-y-10">
                    {/* Section Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 reveal-on-scroll">
                        <div className="space-y-3">
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white select-none">
                                God <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-orange-200 to-white">Stories</span>
                            </h2>
                            <p className="text-sm sm:text-base text-white/60 max-w-xl font-light leading-relaxed">
                                Supernatural healings, broken addictions, and miraculous encounters. Documented evidence that Jesus Christ is alive and moving with power today.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <LiquidButton
                                href="/share-testimony"
                                size="sm"
                                variant="amber"
                                icon={<ArrowRight className="w-3.5 h-3.5" />}
                                iconPosition="right"
                            >
                                Share Your Story
                            </LiquidButton>
                            <LiquidButton
                                href="/god-stories"
                                size="sm"
                                variant="flame"
                                icon={<ArrowRight className="w-3.5 h-3.5" />}
                                iconPosition="right"
                            >
                                All Stories
                            </LiquidButton>
                        </div>
                    </div>

                    {/* Circular Testimonial Carousel — Isolated without parent translateY for silky smooth scroll */}
                    <div className="relative pt-2 pb-2">
                        <CircularTestimonials
                            testimonials={TESTIMONIALS_DATA}
                            autoplay={false}
                            colors={{
                                name: "#F4EDE2",
                                designation: "#F59E0B",
                                testimony: "#C9C3D4",
                                arrowBackground: "#0D0B12",
                                arrowForeground: "#F4EDE2",
                                arrowHoverBackground: "#FF5A2E"
                            }}
                        />
                    </div>
                </div>
            </section>

            <SectionSeam />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* CONNECT WITH US — Editorial Community Platforms                */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="social" className="perf-section min-h-[75vh] flex flex-col justify-center items-center relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden bg-[#07060A] text-white font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-b from-[#07060A] to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-t from-[#07060A] to-transparent z-10" />

                {/* Left Side Aura — Amethyst & Amber Vertical Pillar */}
                <div className="pointer-events-none absolute -left-20 sm:-left-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.20)_0%,rgba(245,158,11,0.10)_45%,transparent_75%)] blur-2xl transform-gpu" />

                {/* Right Side Aura — Amber & Amethyst Vertical Pillar */}
                <div className="pointer-events-none absolute -right-20 sm:-right-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.20)_0%,rgba(139,92,246,0.10)_45%,transparent_75%)] blur-2xl transform-gpu" />

                {/* Bottom Horizon Aura */}
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[50%] sm:h-[60%] bg-[radial-gradient(ellipse_120%_90%_at_50%_100%,rgba(139,92,246,0.14)_0%,rgba(245,158,11,0.06)_35%,transparent_80%)] transform-gpu" />

                {/* Starfield overlay */}
                <div className="starfield opacity-30 pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto w-full space-y-8 sm:space-y-10 reveal-on-scroll">
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white select-none">
                            Connect <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-br from-purple-200 via-amber-100 to-white">With Us</span>
                        </h2>
                        <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto font-light leading-relaxed">
                            Join our global ministry across your favorite platforms for daily word, live worship, and community fellowship.
                        </p>
                    </div>

                    {/* Dark Smoked Glassmorphic Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 reveal-on-scroll reveal-delay-1">
                        {[
                            {
                                name: 'WhatsApp',
                                sub: 'Daily Devotionals',
                                action: 'Join Channel',
                                icon: MessageCircle,
                                href: 'https://whatsapp.com/channel/0029VaBFUhk9Guw4VxXqHI0m',
                                accent: '#25D366',
                                hoverBorder: 'hover:border-[#25D366]/40 hover:shadow-[#25D366]/10'
                            },
                            {
                                name: 'Facebook',
                                sub: 'Community Fellowship',
                                action: 'Official Page',
                                icon: Facebook,
                                href: 'https://www.facebook.com/callofjesusministries',
                                accent: '#1877F2',
                                hoverBorder: 'hover:border-[#1877F2]/40 hover:shadow-[#1877F2]/10'
                            },
                            {
                                name: 'Youtube',
                                sub: 'Worship & Sermons',
                                action: 'Watch Livestreams',
                                icon: Youtube,
                                href: 'https://www.youtube.com/@callofjesusministries',
                                accent: '#FF0000',
                                hoverBorder: 'hover:border-[#FF0000]/40 hover:shadow-[#FF0000]/10'
                            },
                            {
                                name: 'Instagram',
                                sub: 'Daily Inspiration',
                                action: 'Moments & Reels',
                                icon: Instagram,
                                href: 'https://www.instagram.com/callofjesusministries',
                                accent: '#E4405F',
                                hoverBorder: 'hover:border-[#E4405F]/40 hover:shadow-[#E4405F]/10'
                            },
                        ].map((social, i) => (
                            <a
                                key={i}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group relative rounded-3xl p-6 sm:p-7 min-h-[190px] sm:min-h-[230px] flex flex-col justify-between backdrop-blur-2xl bg-white/[0.03] border ${social.hoverBorder} transition-all duration-500 hover:-translate-y-1.5 overflow-hidden shadow-2xl`}
                                style={{ borderColor: `${social.accent}25` }}
                            >
                                {/* Platform Colored Ambient Bloom */}
                                <div
                                    className="absolute inset-0 opacity-40 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{
                                        background: `radial-gradient(circle at 75% 25%, ${social.accent}22, transparent 70%)`
                                    }}
                                />

                                {/* Giant Subtle Background Watermark Logo */}
                                <social.icon
                                    className="absolute -bottom-4 -right-4 w-32 h-32 transition-all duration-700 pointer-events-none group-hover:scale-110 group-hover:rotate-3"
                                    style={{ color: social.accent, opacity: 0.08 }}
                                />

                                {/* Top Row: Glass Icon Tile + Interactive Arrow */}
                                <div className="flex items-center justify-between relative z-10">
                                    <div
                                        className="w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-inner"
                                        style={{
                                            backgroundColor: `${social.accent}14`,
                                            borderColor: `${social.accent}35`,
                                            color: social.accent
                                        }}
                                    >
                                        <social.icon className="w-6 h-6" />
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/10 group-hover:border-white/30 group-hover:bg-white/15 flex items-center justify-center text-white/50 group-hover:text-white transition-all duration-300">
                                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </div>
                                </div>

                                {/* Bottom Info */}
                                <div className="relative z-10 pt-6">
                                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                        {social.name}
                                    </h3>
                                    <p className="text-xs sm:text-sm font-medium text-white/60 mt-1">
                                        {social.sub}
                                    </p>
                                    <span
                                        className="inline-block mt-3 text-[10px] uppercase font-bold tracking-[0.2em] transition-opacity duration-300 group-hover:translate-x-1"
                                        style={{ color: social.accent, opacity: 0.85 }}
                                    >
                                        {social.action} →
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <SectionSeam />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* STAY CONNECTED — Editorial Newsletter Sanctuary                */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="newsletter" className="perf-section min-h-[75vh] flex flex-col justify-center items-center relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden bg-[#07060A] text-white font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-b from-[#07060A] to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-t from-[#07060A] to-transparent z-10" />

                {/* Left Side Aura — Warm Amber Vertical Pillar */}
                <div className="pointer-events-none absolute -left-20 sm:-left-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.24)_0%,rgba(255,90,46,0.10)_45%,transparent_75%)] blur-2xl transform-gpu" />

                {/* Right Side Aura — Sunset Flame Vertical Pillar */}
                <div className="pointer-events-none absolute -right-20 sm:-right-32 top-1/2 -translate-y-1/2 w-48 sm:w-80 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.22)_0%,rgba(245,158,11,0.10)_45%,transparent_75%)] blur-2xl transform-gpu" />

                {/* Bottom Horizon Aura */}
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-[50%] sm:h-[60%] bg-[radial-gradient(ellipse_120%_90%_at_50%_100%,rgba(245,158,11,0.18)_0%,rgba(255,90,46,0.10)_35%,transparent_80%)] transform-gpu" />

                {/* Starfield overlay */}
                <div className="starfield opacity-30 pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 space-y-6 sm:space-y-8 reveal-on-scroll">
                    {/* Editorial Title */}
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white select-none">
                        Stay <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-br from-amber-200 via-amber-100 to-white">Connected</span>
                    </h2>

                    <p className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight leading-relaxed text-white/80 max-w-2xl mx-auto">
                        Receive weekly spirit-filled devotionals, fresh worship releases, and prophetic updates directly in your inbox.
                    </p>

                    {/* Clean Centered Email Subscription */}
                    <div className="max-w-lg mx-auto pt-4">
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const emailVal = (form.elements.namedItem('email') as HTMLInputElement).value;
                                if (!emailVal || !/^\S+@\S+\.\S+$/.test(emailVal)) { toast.error("Please enter a valid email."); return; }
                                try {
                                    const { error } = await supabase.from('subscribers').insert([{ email: emailVal }]);
                                    if (error?.code === '23505') toast.success("Already subscribed!");
                                    else if (error) toast.error("Failed. Try again.");
                                    else { toast.success("Subscribed successfully! 🎉"); (form.elements.namedItem('email') as HTMLInputElement).value = ''; }
                                } catch { toast.error("Failed to subscribe."); }
                            }}
                            className="space-y-3"
                        >
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    className="flex-1 px-5 py-3.5 rounded-full bg-white/[0.04] border border-white/15 hover:border-white/25 focus:border-amber-400/50 text-sm text-white placeholder-white/40 focus:outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    className="px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold uppercase tracking-wider text-xs sm:text-sm transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <span>Subscribe</span>
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </form>

                        <p className="text-xs text-white/40 font-light pt-4">
                            No spam ever. Unsubscribe with one click anytime.
                        </p>
                    </div>
                </div>
            </section>


            <SectionSeam />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* FOOTER — Ultra-Luxury Architectural Footer                    */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <footer className="relative pt-12 sm:pt-20 pb-10 sm:pb-12 px-4 sm:px-6 md:px-12 bg-[#07060A] text-[#F4EDE2] overflow-hidden">
                {/* Seamless Footer Top Fade Overlay */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 md:h-40 bg-gradient-to-b from-[#07060A] via-[#07060A]/70 to-transparent z-10" />

                {/* Logo Flame Top Glow Line */}
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFB37A] via-[#FF5A2E] to-[#C2361A] to-transparent" />
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[200px] bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.18)_0%,rgba(245,158,11,0.10)_40%,transparent_70%)] rounded-full pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)] rounded-full pointer-events-none" />
                <div className="starfield opacity-30 pointer-events-none z-0" />

                <div className="relative z-20 max-w-7xl mx-auto">
                    {/* Top Section: Brand Block + Links Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-8 sm:pb-12">
                        {/* Brand Column */}
                        <div className="lg:col-span-4 space-y-3.5 sm:space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#0D0B12] border border-white/15 p-1.5 flex items-center justify-center shadow-[0_0_25px_rgba(255,90,46,0.22)]">
                                    <BlackRemoverImage src="/images/logo-footer-final.png" alt="COJ Logo" threshold={80} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h4 className="text-sm sm:text-base font-black tracking-wider text-white uppercase font-sans">CALL OF JESUS</h4>
                                    <p className="text-[9px] sm:text-[10px] font-bold bg-gradient-to-r from-[#FFB37A] via-[#FF5A2E] to-[#C2361A] bg-clip-text text-transparent tracking-[0.35em] uppercase">MINISTRIES</p>
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm">
                                A spiritual home for every believer. Proclaiming the New Covenant Gospel of Grace, supernatural breakthrough, and raising radical lovers of Jesus worldwide.
                            </p>
                        </div>

                        {/* Navigation Columns */}
                        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                            {/* Kingdom */}
                            <div className="space-y-3.5">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FF5A2E] flex items-center gap-1.5">
                                    <span>Kingdom</span>
                                </h4>
                                <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
                                    <li><Link href="/give" className="hover:text-amber-400 transition-colors">Give / Partner</Link></li>
                                    <li><Link href="/share-testimony" className="hover:text-amber-400 transition-colors">Share Testimony</Link></li>
                                    <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Connect with Us</Link></li>
                                    <li><Link href="/events" className="hover:text-amber-400 transition-colors">Weekly Gatherings</Link></li>
                                </ul>
                            </div>

                            {/* Grow */}
                            <div className="space-y-3.5">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FFB37A] flex items-center gap-1.5">
                                    <span>Grow</span>
                                </h4>
                                <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
                                    <li><Link href="/sermons" className="hover:text-amber-400 transition-colors">Sermons Archive</Link></li>
                                    <li><Link href="/devotional" className="hover:text-amber-400 transition-colors">Daily Devotionals</Link></li>
                                    <li><Link href="/god-stories" className="hover:text-amber-400 transition-colors">Miracle Stories</Link></li>
                                </ul>
                            </div>

                            {/* About */}
                            <div className="space-y-3.5">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#F59E0B] flex items-center gap-1.5">
                                    <span>About Us</span>
                                </h4>
                                <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
                                    <li><Link href="/our-journey" className="hover:text-amber-400 transition-colors">Our Journey</Link></li>
                                    <li><Link href="/our-vision-and-mission" className="hover:text-amber-400 transition-colors">Vision & Mission</Link></li>
                                    <li><Link href="/our-leaders" className="hover:text-amber-400 transition-colors">Our Leaders</Link></li>
                                    <li><Link href="/our-branches" className="hover:text-amber-400 transition-colors">Our Branches</Link></li>
                                </ul>
                            </div>

                            {/* Worship Resources */}
                            <div className="space-y-3.5">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FF8C68] flex items-center gap-1.5">
                                    <span>Worship</span>
                                </h4>
                                <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
                                    <li><button onClick={() => setMode('UTILITY')} className="hover:text-amber-400 transition-colors text-left">Worship Portal</button></li>
                                    <li><Link href="/songs" className="hover:text-amber-400 transition-colors">Songs Catalog</Link></li>
                                    <li><Link href="/tools/tuner" className="hover:text-amber-400 transition-colors">Musician Tools</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    {/* GRAND FULL-WIDTH WORDMARK — Seamless Flow with Interactive Letter Blow Effect */}
                    {/* ═══════════════════════════════════════════════════════════════ */}
                    <div className="relative pt-6 pb-6 sm:pt-10 sm:pb-8 md:pt-14 md:pb-10 overflow-visible select-none -mx-4 sm:-mx-6 md:-mx-12 px-3 sm:px-6 md:px-10">
                        {/* Ambient Celestial Flame Glow matching Logo Atmosphere */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="w-full max-w-6xl h-28 sm:h-44 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.25)_0%,rgba(245,158,11,0.18)_40%,rgba(139,92,246,0.10)_75%,transparent_90%)] blur-3xl" />
                        </div>

                        {/* Full-Width Edge-to-Edge Logo-Styled Typography with Letter Blow Hover */}
                        <div className="relative z-10 w-full flex flex-col items-center overflow-visible">
                            <div className="flex items-baseline justify-center gap-2 sm:gap-3 md:gap-5 lg:gap-6 select-none whitespace-nowrap overflow-visible">
                                {/* CALL */}
                                <div className="flex items-baseline tracking-normal overflow-visible">
                                    {['C', 'A', 'L', 'L'].map((char, i) => (
                                        <span
                                            key={`call-${i}`}
                                            className="letter-blow font-playfair font-black text-[11.5vw] sm:text-[10.8vw] md:text-[10vw] lg:text-[9.2vw] xl:text-[8.5vw] leading-[1.12] pb-2 sm:pb-3 md:pb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF8] via-[#FFB37A] via-[#FF5A2E] to-[#F59E0B]"
                                        >
                                            {char}
                                        </span>
                                    ))}
                                </div>

                                {/* OF */}
                                <div className="flex items-baseline overflow-visible">
                                    <span className="letter-blow font-playfair font-semibold text-[5vw] sm:text-[4.6vw] md:text-[4.2vw] lg:text-[3.8vw] xl:text-[3.4vw] tracking-[0.18em] leading-[1.12] pb-2 sm:pb-3 md:pb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF8] via-[#FDE047] to-[#F59E0B] align-middle">
                                        OF
                                    </span>
                                </div>

                                {/* JESUS */}
                                <div className="flex items-baseline tracking-normal overflow-visible">
                                    {['J', 'E', 'S', 'U', 'S'].map((char, i) => (
                                        <span
                                            key={`jesus-${i}`}
                                            className="letter-blow font-playfair font-black text-[11.5vw] sm:text-[10.8vw] md:text-[10vw] lg:text-[9.2vw] xl:text-[8.5vw] leading-[1.12] pb-2 sm:pb-3 md:pb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF8] via-[#FFB37A] via-[#FF5A2E] to-[#F59E0B]"
                                        >
                                            {char}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Subtitle */}
                            <p className="mt-2 sm:mt-3 md:mt-4 text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.55em] sm:tracking-[0.8em] text-white/40 uppercase font-space text-center w-full">
                                M I N I S T R I E S
                            </p>
                        </div>
                    </div>

                    {/* Bottom Legal & Copyright Bar */}
                    <div className="border-t border-white/15 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-3">
                        <p>© {new Date().getFullYear()} Call of Jesus Ministries. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <Link href="/terms" className="hover:text-amber-400 text-white/60 transition-colors">Terms of Service</Link>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <Link href="/privacy" className="hover:text-amber-400 text-white/60 transition-colors">Privacy Policy</Link>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <Link href="/contact" className="hover:text-amber-400 text-white/60 transition-colors">Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>


            {/* BACK TO TOP */}
            <BackToTopButton />

        </div>
    );
}