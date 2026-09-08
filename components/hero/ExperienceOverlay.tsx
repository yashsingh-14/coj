'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from "@/store/useAppStore";
import LandingNavbar from "./LandingNavbar";
import Link from 'next/link';
import {
    ArrowRight, ArrowUp, Music, ChevronRight, ChevronLeft,
    Youtube, Instagram, Facebook, MessageCircle,
    Headphones, BookOpen, Heart, Flame, Sparkles, Quote,
    Calendar, Clock, MapPin, Sun, Wine, Navigation,
    Volume2, VolumeX, Play, Pause,
    Share2, Copy, Check, Mail, Phone,
    Globe, Crown, Zap
} from 'lucide-react';
import BlackRemoverImage from "@/components/ui/BlackRemoverImage";
import { generateSlug } from '@/lib/seoUtils';
import { getSongImage } from '@/lib/utils';
import { getVerseOfTheDay } from '@/lib/getVerseOfTheDay';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import CircularTestimonials from "@/components/ui/CircularTestimonials";
import LiquidButton from "@/components/ui/LiquidButton";
import TiltCard from "@/components/ui/TiltCard";

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
// SECTION SEAM — Ultra-Soft Luminous Aurora Horizon (Seamless Transition)
// ══════════════════════════════════════════════════════════════════════
function SectionSeam() {
    return (
        <div className="relative w-full flex items-center justify-center pointer-events-none z-20 py-1 overflow-hidden bg-[#07060A]">
            <div className="w-full max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-[#FF5A2E]/25 via-[#FFB37A]/30 to-transparent" />
            <div className="absolute w-[460px] h-12 -top-6 bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.12)_0%,rgba(245,158,11,0.06)_45%,transparent_75%)] pointer-events-none" />
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

    // Mobile 3-Split Cinematic Hero Intro (Ankit Sajwan Style)
    const [isMobileSplitExpanded, setIsMobileSplitExpanded] = useState(false);
    const topVideoRef = useRef<HTMLVideoElement>(null);
    const bottomVideoRef = useRef<HTMLVideoElement>(null);

    // Mobile 3-Split Cinematic Hero Intro Timer
    useEffect(() => {
        // Guarantee muted autoplay on mobile devices with staggered start
        if (topVideoRef.current) {
            topVideoRef.current.muted = true;
            topVideoRef.current.currentTime = 1;
            topVideoRef.current.play().catch(() => {});
        }
        if (bottomVideoRef.current) {
            bottomVideoRef.current.muted = true;
            bottomVideoRef.current.currentTime = 10;
            bottomVideoRef.current.play().catch(() => {});
        }

        // Keep 3-split playing for 3.2s, then trigger smooth expansion to single video
        const expandTimer = setTimeout(() => {
            setIsMobileSplitExpanded(true);
            setTimeout(() => {
                topVideoRef.current?.pause();
                bottomVideoRef.current?.pause();
            }, 1200);
        }, 3200);

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
                    currentVid?.play().catch(() => {});
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
                currentVid.play().catch(() => {});
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
            {/* Background Video Slider */}
            <div className="hero-bg-img absolute inset-0 z-0 overflow-hidden bg-[#07060A]">
                <video
                    ref={video1Ref}
                    src="/videos/coj%20video%20for%20hero%20annivercery.mp4"
                    autoPlay
                    muted={isVideoMuted}
                    playsInline
                    preload="metadata"
                    onEnded={handleNextVideo}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        activeVideoIndex === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                />
                <video
                    ref={video2Ref}
                    src="/videos/coj%20video.mp4"
                    muted={isVideoMuted}
                    playsInline
                    preload="metadata"
                    onEnded={handleNextVideo}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        activeVideoIndex === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute bottom-0 inset-x-0 h-40 sm:h-56 md:h-72 bg-gradient-to-t from-[#07060A] via-[#07060A]/85 via-[#07060A]/40 to-transparent pointer-events-none z-[4]" />
            </div>

            {/* Mobile 3-Split Cinematic Panels (Ankit Sajwan Style — Seamless, Zero Borders) */}
            <div
                onClick={() => setIsMobileSplitExpanded(true)}
                style={{ zIndex: 8 }}
                className="block md:hidden absolute inset-0 overflow-hidden select-none pointer-events-none"
            >
                {/* Top Panel (Video 1 - Stage / Choir) */}
                <div
                    style={{
                        height: '35%',
                        transform: isMobileSplitExpanded ? 'translate3d(0, -100%, 0)' : 'translate3d(0, 0, 0)',
                        opacity: isMobileSplitExpanded ? 0 : 1,
                        transition: 'transform 1000ms cubic-bezier(0.16, 1, 0.3, 1), opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)',
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)'
                    }}
                    className="absolute top-0 inset-x-0 overflow-hidden"
                >
                    <video
                        ref={topVideoRef}
                        src="/videos/coj%20video.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover object-[center_20%]"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                </div>

                {/* Bottom Panel (Video 3 - Congregation / Worship) */}
                <div
                    style={{
                        height: '35%',
                        transform: isMobileSplitExpanded ? 'translate3d(0, 100%, 0)' : 'translate3d(0, 0, 0)',
                        opacity: isMobileSplitExpanded ? 0 : 1,
                        transition: 'transform 1000ms cubic-bezier(0.16, 1, 0.3, 1), opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
                        WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)',
                        maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%)'
                    }}
                    className="absolute bottom-0 inset-x-0 overflow-hidden"
                >
                    <video
                        ref={bottomVideoRef}
                        src="/videos/coj%20video.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover object-[center_85%]"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                </div>
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
        src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80"
    },
    {
        name: "Brother Rajesh",
        designation: "Cancer Healed • Faridabad",
        quote: "Diagnosed with stage 3 cancer, I came to the healing service with faith that moved mountains. After anointed prayer, post-service PET scans showed zero cancer cells remaining in my body! By His stripes, I am healed and alive.",
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80"
    },
    {
        name: "Sister Priya",
        designation: "Mental Freedom • Noida",
        quote: "For years, I battled severe panic attacks, sleepless nights, and chronic depression. When I stepped into the prophetic presence of God here, every chain shattered. Jesus filled my heart with divine peace that surpasses all understanding.",
        src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80"
    },
    {
        name: "Brother Samuel",
        designation: "Supernatural Favor • Gurugram",
        quote: "Standing on the verge of total business bankruptcy with mounting debts, I anchored my soul on God's Word. Within 90 days, supernatural contracts and miraculous debt clearance took place. God supplied every need exceedingly!",
        src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80"
    },
    {
        name: "Sister Surabhi",
        designation: "Miracle Healing • New Delhi",
        quote: "Mandatory medical screenings initially showed reactive results for an incurable condition. Through intense prayer & covenant grace, repeat screenings at two top diagnostic centers came back 100% clear!",
        src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80"
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

            <SectionSeam />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* VERSE OF THE DAY — Large Luxury Sanctuary Showcase Card        */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="verse" className="perf-section relative py-14 sm:py-24 md:py-36 px-4 sm:px-6 md:px-12 overflow-hidden bg-[#07060A] text-[#F4EDE2]">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 md:h-44 bg-gradient-to-b from-[#07060A] via-[#07060A]/70 to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 md:h-44 bg-gradient-to-t from-[#07060A] via-[#07060A]/70 to-transparent z-10" />

                {/* Ambient Ember & Golden Fire Glows matching Logo Palette (Zero Blur Shaders) */}
                <div className="absolute w-[360px] sm:w-[480px] md:w-[560px] h-[360px] sm:h-[480px] md:h-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,90,46,0.22)_0%,rgba(255,90,46,0.06)_45%,transparent_70%)] -top-28 md:-top-36 -right-24 md:-right-36 pointer-events-none z-0" />
                <div className="absolute w-[300px] sm:w-[400px] md:w-[480px] h-[300px] sm:h-[400px] md:h-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18)_0%,rgba(245,158,11,0.05)_45%,transparent_70%)] -bottom-24 md:-bottom-32 -left-20 md:-left-28 pointer-events-none z-0" />
                <div className="starfield opacity-30 pointer-events-none z-0" />

                {/* Floating Spiritual Accents */}
                <div className="absolute top-12 left-1/4 animate-float-slow opacity-30 pointer-events-none hidden sm:block">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
                </div>
                <div className="absolute bottom-16 right-1/4 animate-float-slower opacity-30 pointer-events-none hidden sm:block">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto">
                    {/* Section Top Header */}
                    <div className="text-center mb-8 sm:mb-14 reveal-on-scroll">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/40 backdrop-blur-md transition-all text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white/70 mb-3 sm:mb-4">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Verse of the Day</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 drop-shadow-2xl select-none">
                            DAILY <span className="text-amber-500">PROMISE</span>
                        </h2>
                    </div>

                    {/* Grand Sanctuary Showcase Card (Obsidian Luxury Glass) */}
                    <div className="reveal-on-scroll relative rounded-2xl sm:rounded-[2.5rem] md:rounded-[3.5rem] p-5 sm:p-10 md:p-16 bg-[#0A0A0A] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_80px_rgba(245,158,11,0.06)] overflow-hidden group hover:border-amber-500/30 transition-all duration-500">

                        {/* Top Accent Line */}
                        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 via-[#FF5A2E] to-transparent" />

                        {/* Ambient Halo Behind Scripture Quote */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/15 via-red-600/10 to-amber-500/15 blur-2xl opacity-60 rounded-full pointer-events-none" />

                        <div className="relative z-10 space-y-5 sm:space-y-8 md:space-y-10 text-center">

                            {/* Scripture Reference Tag */}
                            <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs md:text-sm font-medium text-neutral-300 bg-white/[0.04] px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full border border-white/10">
                                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                                <span>Daily Bread</span>
                            </div>

                            {/* Grand Holy Scripture Quote matching our-mission */}
                            <div className="relative max-w-5xl mx-auto px-1 sm:px-6 py-1 sm:py-6">
                                <span className="text-amber-500 font-serif text-3xl sm:text-6xl md:text-9xl absolute -top-5 sm:-top-10 left-0 md:-left-6 opacity-40 select-none pointer-events-none">&ldquo;</span>
                                
                                <blockquote className="text-base sm:text-2xl md:text-4xl lg:text-[48px] font-normal text-white leading-relaxed sm:leading-[1.35] font-serif italic drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] max-w-4xl mx-auto tracking-tight">
                                    {verse?.text || "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."}
                                </blockquote>

                                <span className="text-amber-500 font-serif text-3xl sm:text-6xl md:text-9xl absolute -bottom-6 sm:-bottom-12 right-0 md:-right-6 opacity-40 select-none pointer-events-none">&rdquo;</span>
                            </div>

                            {/* Glowing Horizon Pill Divider */}
                            <div className="w-20 sm:w-28 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2 sm:mt-4 rounded-full opacity-60 pointer-events-none" />

                            {/* Reference & Pastor Samson Wilson Attribution Block */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-6 pt-1 sm:pt-2">
                                {/* Scripture Reference Badge */}
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-6 sm:py-2 rounded-full bg-white/[0.06] border border-amber-500/30 text-amber-400 font-bold tracking-[0.2em] uppercase text-[11px] sm:text-sm shadow-inner">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{verse?.reference || "John 3:16"}</span>
                                </div>

                                {/* Ps. Samson Wilson Pill */}
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white/[0.04] border border-white/10 text-[11px] sm:text-sm font-medium text-white/90">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-white/60">Delivered by</span>
                                    <strong className="font-bold text-amber-400 font-serif italic tracking-wide">Ps. Samson Wilson</strong>
                                </div>
                            </div>

                            {/* Reflection / Prayer Expandable Accordion */}
                            {verse?.reflection && showDevotional && (
                                <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#07060A]/95 border border-[#FF5A2E]/25 text-left space-y-3 sm:space-y-4 animate-fade-in-down max-w-4xl mx-auto shadow-2xl">
                                    <p className="text-[11px] sm:text-xs uppercase tracking-widest text-[#FFB37A] font-bold flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-[#FF5A2E]" /> Daily Reflection • Ps. Samson Wilson
                                    </p>
                                    <p className="text-xs sm:text-base text-[#C9C3D4] leading-relaxed font-light font-space">
                                        {verse.reflection}
                                    </p>
                                    {verse.prayer && (
                                        <div className="pt-3 border-t border-white/10">
                                            <p className="text-xs sm:text-sm text-[#F4EDE2] font-fraunces italic">
                                                <span className="font-bold text-[#FFB37A] not-italic">Prayer: </span>
                                                {verse.prayer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Interactive Action Buttons */}
                            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-2 sm:pt-4">
                                <LiquidButton
                                    onClick={handleCopyVerse}
                                    size="sm"
                                    icon={copiedVerse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    iconPosition="left"
                                >
                                    {copiedVerse ? "Copied!" : "Copy Verse"}
                                </LiquidButton>

                                <LiquidButton
                                    onClick={handleShareVerse}
                                    size="sm"
                                    icon={<Share2 className="w-3.5 h-3.5" />}
                                    iconPosition="left"
                                >
                                    Share
                                </LiquidButton>

                                {verse?.reflection && (
                                    <LiquidButton
                                        onClick={() => setShowDevotional(!showDevotional)}
                                        size="sm"
                                        variant="amber"
                                        icon={<BookOpen className="w-3.5 h-3.5" />}
                                        iconPosition="left"
                                    >
                                        {showDevotional ? "Hide Devotional" : "Daily Devotional"}
                                    </LiquidButton>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            <SectionSeam />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* WEEKLY GATHERINGS & CHURCH LOCATION                           */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="gatherings" className="perf-section relative py-14 sm:py-24 md:py-32 px-4 sm:px-8 md:px-12 overflow-hidden bg-[#07060A] text-[#F4EDE2] font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 md:h-44 bg-gradient-to-b from-[#07060A] via-[#07060A]/70 to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 md:h-44 bg-gradient-to-t from-[#07060A] via-[#07060A]/70 to-transparent z-10" />

                {/* Ambient Flame Orange & Amber Gold Fire Glows matching Logo Palette (Zero Blur Shaders) */}
                <div className="absolute w-[360px] sm:w-[480px] md:w-[560px] h-[360px] sm:h-[480px] md:h-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,90,46,0.20)_0%,rgba(255,90,46,0.06)_45%,transparent_70%)] -top-28 md:-top-36 -left-20 md:-left-28 pointer-events-none z-0" />
                <div className="absolute w-[320px] sm:w-[420px] md:w-[500px] h-[320px] sm:h-[420px] md:h-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18)_0%,rgba(245,158,11,0.05)_45%,transparent_70%)] -bottom-24 md:-bottom-32 -right-24 md:-right-36 pointer-events-none z-0" />
                <div className="starfield opacity-30 pointer-events-none z-0" />

                <div className="relative z-10 max-w-7xl mx-auto space-y-8 sm:space-y-12">
                <div className="reveal-on-scroll flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/40 backdrop-blur-md transition-all text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white/70">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                            <span>Weekly Gatherings</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 drop-shadow-2xl select-none">
                            JOIN US <span className="text-amber-500">OFFLINE</span>
                        </h2>
                        <p className="text-xs sm:text-sm md:text-base text-white/60 font-light max-w-2xl leading-relaxed">
                            Experience the presence of God together. Come as you are. • <span className="font-serif italic text-amber-400">परमेश्वर की उपस्थिति का अनुभव करें।</span>
                        </p>
                    </div>

                    <LiquidButton
                        href="https://maps.app.goo.gl/U6Unh6WEcAdbp89K6"
                        target="_blank"
                        rel="noopener noreferrer"
                        size="md"
                        variant="amber"
                        icon={<ArrowRight className="w-4 h-4" />}
                        iconPosition="right"
                        className="self-start md:self-auto !py-2.5 !px-5 text-xs sm:!py-3 sm:!px-6 sm:text-sm"
                    >
                        Get Directions to Church
                    </LiquidButton>
                </div>

                {/* Event Cards Grid in Obsidian Luxury Glass matching our-mission */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {eventsList.map((event: any, i: number) => {
                        const IconComponent = ICON_MAP[event.icon_name] || (i === 0 ? BookOpen : i === 1 ? Sun : Wine);
                        const delayClass = i === 0 ? "reveal-delay-1" : i === 1 ? "reveal-delay-2" : "reveal-delay-3";

                        return (
                            <div
                                key={event.id || i}
                                className={`reveal-on-scroll ${delayClass} group relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 flex flex-col justify-between bg-[#0A0A0A] border border-white/10 hover:border-amber-500/40 transition-all duration-500 hover:scale-[1.02] shadow-xl overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <div className="space-y-4 sm:space-y-5 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-all duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                            <IconComponent className="w-5 h-5 sm:w-7 sm:h-7" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/5 border border-white/10 text-amber-400">
                                            Weekly
                                        </span>
                                    </div>

                                    {/* English Details */}
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                                            {event.title_en || event.titleEn}
                                        </h3>
                                        <div className="flex items-start gap-2 text-xs sm:text-sm text-white/60">
                                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 mt-0.5 shrink-0" />
                                            <span>{event.time_en || event.timeEn}</span>
                                        </div>
                                        {(event.desc_en || event.descEn) && (
                                            <p className="text-xs sm:text-sm text-white/50 pt-0.5 font-light leading-relaxed">
                                                {event.desc_en || event.descEn}
                                            </p>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                    {/* Hindi Details */}
                                    <div className="space-y-1">
                                        <h4 className="text-base sm:text-lg font-bold text-white/90 font-serif">
                                            {event.title_hi || event.titleHi}
                                        </h4>
                                        <div className="flex items-start gap-2 text-[11px] sm:text-xs text-white/50 font-serif">
                                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500/80 mt-0.5 shrink-0" />
                                            <span>{event.time_hi || event.timeHi}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 sm:pt-6 relative z-10">
                                    <a
                                        href="https://maps.app.goo.gl/U6Unh6WEcAdbp89K6"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                                    >
                                        <span>Church Location</span>
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Church Arena Location Banner */}
                <div className="reveal-on-scroll relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 bg-[#0A0A0A] border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 via-[#FF5A2E] to-transparent" />

                    <div className="space-y-2.5 sm:space-y-3 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-amber-400 font-bold tracking-wider">Call of Jesus Ministries Church</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl md:text-4xl font-black text-white tracking-tight">
                            Visit Us in <span className="text-amber-500">Person</span>
                        </h3>
                        <p className="text-white/60 text-xs sm:text-sm font-light max-w-xl leading-relaxed">
                            Join us live every Sunday at 10:30 AM & Friday at 7:00 PM for life-changing worship, prophetic teaching, and healing.
                        </p>
                    </div>

                    <a
                        href="https://maps.app.goo.gl/U6Unh6WEcAdbp89K6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 bg-white hover:bg-amber-400 text-black font-bold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all duration-300 flex-shrink-0"
                    >
                        <Navigation className="w-4 h-4 text-black" />
                        <span>Get Google Maps Directions</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-black" />
                    </a>
                </div>
                </div>
            </section>

            <SectionSeam />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* OUR MISSION & VISION — Exact Match with /our-mission            */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="vision" className="perf-section relative py-14 sm:py-24 md:py-36 px-4 sm:px-6 md:px-12 overflow-hidden bg-[#07060A] text-white font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 md:h-44 bg-gradient-to-b from-[#07060A] via-[#07060A]/70 to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 md:h-44 bg-gradient-to-t from-[#07060A] via-[#07060A]/70 to-transparent z-10" />

                {/* Background Ambience */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-amber-900/10 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-red-900/10 rounded-full blur-[120px] animate-pulse-slow delay-1000 pointer-events-none" />
                    <div className="starfield opacity-30 pointer-events-none" />
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Mission Header */}
                    <div className="text-center mb-8 sm:mb-16 relative reveal-on-scroll">
                        {/* Floating Elements */}
                        <div className="absolute top-0 left-1/4 animate-float-slow opacity-30 pointer-events-none hidden sm:block">
                            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
                        </div>
                        <div className="absolute bottom-0 right-1/4 animate-float-slower opacity-30 pointer-events-none hidden sm:block">
                            <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                        </div>

                        <h2 className="text-3xl sm:text-5xl md:text-[80px] lg:text-[100px] font-black leading-none mb-3 sm:mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 drop-shadow-2xl select-none">
                            OUR <span className="text-amber-500">MISSION</span>
                        </h2>

                        <div className="relative max-w-5xl mx-auto">
                            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-red-600/20 blur-xl opacity-50 rounded-full pointer-events-none" />
                            <h3 className="relative text-base sm:text-2xl md:text-4xl lg:text-5xl font-serif font-medium italic leading-relaxed sm:leading-tight text-white drop-shadow-xl px-1 sm:px-4 py-2 sm:py-6">
                                <span className="text-amber-500 font-serif text-2xl sm:text-5xl md:text-7xl absolute -top-3 sm:-top-4 left-0 md:-left-8 opacity-40 select-none">&ldquo;</span>
                                To prepare people across the world for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500 font-bold not-italic">second coming</span> of Jesus Christ.
                                <span className="text-amber-500 font-serif text-2xl sm:text-5xl md:text-7xl absolute -bottom-5 sm:-bottom-8 right-0 md:-right-8 opacity-40 select-none">&rdquo;</span>
                            </h3>
                        </div>

                        <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-4 sm:mt-8 rounded-full opacity-50 pointer-events-none" />
                    </div>

                    {/* Core Pillars with TiltCard */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-8 px-0 sm:px-4 reveal-on-scroll reveal-delay-1">
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
                                <div className="h-full bg-[#0A0A0A] border border-white/5 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-xl">
                                    {/* Gradient Background */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className={`w-11 h-11 sm:w-14 sm:h-16 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${item.color}`}>
                                            <item.icon className="w-5 h-5 sm:w-7 sm:h-8" />
                                        </div>
                                        <h4 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5 sm:mb-4 group-hover:tracking-wider transition-all duration-300">{item.title}</h4>
                                        <p className="text-white/50 leading-relaxed text-xs sm:text-sm group-hover:text-white/80 transition-colors">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            </TiltCard>
                        ))}
                    </div>

                    {/* Call to Action */}
                    <div className="mt-8 sm:mt-16 text-center reveal-on-scroll reveal-delay-2">
                        <p className="text-white/40 uppercase tracking-[0.2em] text-[10px] sm:text-xs font-bold mb-3 sm:mb-6">Join the Movement</p>
                        <Link href="/contact" className="inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-full font-bold hover:bg-amber-400 transition-colors hover:scale-105 active:scale-95 duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] text-xs sm:text-sm uppercase tracking-wider">
                            <span>Partner With Us</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TRENDING WORSHIP — Bento Grid                                  */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {trending.length > 0 && (
                <>
                    <SectionSeam />
                    <section id="trending" className="perf-section relative py-12 sm:py-20 md:py-32 px-4 sm:px-8 md:px-12 overflow-hidden bg-[#07060A] text-[#F4EDE2] font-space">
                        {/* Seamless Section Top & Bottom Fade Overlays */}
                        <div className="pointer-events-none absolute top-0 inset-x-0 h-28 md:h-40 bg-gradient-to-b from-[#07060A] via-[#07060A]/70 to-transparent z-10" />
                        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 md:h-40 bg-gradient-to-t from-[#07060A] via-[#07060A]/70 to-transparent z-10" />

                        {/* Ambient Amber Gold & Flame Ember Glows matching Logo Palette */}
                        <div className="absolute w-[360px] sm:w-[480px] md:w-[560px] h-[360px] sm:h-[480px] md:h-[560px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.18)_0%,transparent_70%)] -top-28 md:-top-36 -right-20 md:-right-28 pointer-events-none z-0" />
                        <div className="absolute w-[320px] sm:w-[420px] md:w-[500px] h-[320px] sm:h-[420px] md:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,90,46,0.16)_0%,transparent_70%)] -bottom-24 md:-bottom-32 -left-24 md:-left-36 pointer-events-none z-0" />
                        <div className="starfield opacity-30 pointer-events-none z-0" />


                    <div className="relative z-10 max-w-7xl mx-auto space-y-6 sm:space-y-8">
                        <div className="flex items-end justify-between gap-4 reveal-on-scroll">
                            <div className="space-y-2 sm:space-y-3">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/40 backdrop-blur-md transition-all text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white/70">
                                    <Music className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Now Trending</span>
                                </div>
                                <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 drop-shadow-2xl select-none">
                                    TRENDING <span className="text-amber-500">WORSHIP</span>
                                </h2>
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

                        {/* Horizontal Scroll Songs (desktop) / Grid (mobile) */}
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
                                        {/* Bottom vignette for crisp title legibility while keeping artwork vibrant */}
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
            {/* GOD STORIES — Ultra-Premium Sanctuary Testimony Showcase       */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="stories" className="perf-section relative py-12 sm:py-20 md:py-32 px-4 sm:px-6 md:px-12 overflow-hidden bg-[#07060A] text-[#F4EDE2] font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 md:h-40 bg-gradient-to-b from-[#07060A] via-[#07060A]/70 to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 md:h-40 bg-gradient-to-t from-[#07060A] via-[#07060A]/70 to-transparent z-10" />

                {/* Ambient Flame Ember & Amber Gold Glows matching Logo Palette */}
                <div className="absolute w-[360px] sm:w-[480px] md:w-[560px] h-[360px] sm:h-[480px] md:h-[560px] rounded-full bg-[radial-gradient(circle,rgba(255,90,46,0.20)_0%,transparent_70%)] -top-28 md:-top-36 -left-20 md:-left-28 pointer-events-none z-0" />
                <div className="absolute w-[320px] sm:w-[420px] md:w-[500px] h-[320px] sm:h-[420px] md:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.18)_0%,transparent_70%)] -bottom-24 md:-bottom-32 -right-24 md:-right-36 pointer-events-none z-0" />
                <div className="starfield opacity-30 pointer-events-none z-0" />

                {/* Floating Spiritual Accents */}
                <div className="absolute top-12 left-1/4 animate-float-slow opacity-30 pointer-events-none hidden sm:block">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
                </div>
                <div className="absolute bottom-16 right-1/4 animate-float-slower opacity-30 pointer-events-none hidden sm:block">
                    <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
                    {/* Section Header */}
                    <div id="stories-header" className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 reveal-on-scroll">
                        <div className="space-y-2 sm:space-y-3">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/40 backdrop-blur-md transition-all text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white/70">
                                <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
                                <span>Testimonies of Faith</span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 drop-shadow-2xl select-none">
                                GOD <span className="text-amber-500">STORIES</span>
                            </h2>
                            <p className="text-xs sm:text-sm md:text-base text-white/60 font-light max-w-xl leading-relaxed">
                                Supernatural healings, broken addictions, and miraculous encounters. Documented evidence that Jesus Christ is alive and moving with power today.
                            </p>
                        </div>

                        {/* Actions: Share Your Story & View All */}
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

                    {/* 3D Circular Testimonial Carousel Showcase */}
                    <div className="relative pt-2 pb-2 reveal-on-scroll reveal-delay-1">
                        <CircularTestimonials
                            testimonials={TESTIMONIALS_DATA}
                            autoplay={true}
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
            {/* SHARE TESTIMONY — Ultra-Luxury Sanctuary Encounter Banner       */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="testimony" className="perf-section relative py-12 sm:py-20 md:py-28 px-4 sm:px-6 md:px-12 overflow-hidden bg-[#07060A] text-[#F4EDE2] font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 md:h-40 bg-gradient-to-b from-[#07060A] via-[#07060A]/70 to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 md:h-40 bg-gradient-to-t from-[#07060A] via-[#07060A]/70 to-transparent z-10" />

                {/* Ambient Amber Gold & Flame Ember Glows matching Logo Palette */}
                <div className="absolute w-[360px] sm:w-[480px] md:w-[560px] h-[360px] sm:h-[480px] md:h-[560px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.18)_0%,transparent_70%)] -top-28 md:-top-36 -right-20 md:-right-28 pointer-events-none z-0" />
                <div className="absolute w-[320px] sm:w-[420px] md:w-[500px] h-[320px] sm:h-[420px] md:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,90,46,0.16)_0%,transparent_70%)] -bottom-24 md:-bottom-32 -left-24 md:-left-36 pointer-events-none z-0" />
                <div className="starfield opacity-30 pointer-events-none z-0" />

                <div className="relative z-10 max-w-7xl mx-auto">
                    {/* Outer Glass Sanctuary Container Card */}
                    <div className="reveal-on-scroll relative rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0A0A0A] p-5 sm:p-8 md:p-14 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] group hover:border-amber-500/30 transition-all duration-500">
                    
                    {/* Background Sanctuary Worshipper with Clear Visibility */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <img
                            src="/images/testimony-bg.jpg"
                            alt="Worship and Prayer"
                            loading="lazy"
                            className="w-full h-full object-cover object-right md:object-center group-hover:scale-105 transition-transform duration-700 opacity-80 sm:opacity-90"
                            style={{ filter: 'brightness(0.75) saturate(1.15) contrast(1.05)' }}
                        />
                        {/* Directional gradient: Dark on the left for text legibility, transparent on the right to reveal the worshipper */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 via-[#0A0A0A]/35 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/70 via-transparent to-transparent" />
                        {/* Atmospheric golden radiant aura */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,90,46,0.18)_0%,rgba(245,158,11,0.10)_45%,transparent_70%)] pointer-events-none" />
                    </div>

                    {/* Ambient Ember & Golden Halo Glows */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-[radial-gradient(circle,rgba(255,90,46,0.14)_0%,transparent_70%)] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[radial-gradient(circle,rgba(245,158,11,0.12)_0%,transparent_70%)] rounded-full pointer-events-none" />
                    
                    {/* Top Accent Line */}
                    <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 via-[#FF5A2E] to-transparent" />

                    <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                        
                        {/* Left: Typography, Impact, and Interactive CTAs */}
                        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/40 backdrop-blur-md transition-all text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white/70">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>Your Story Has Power</span>
                            </div>

                            <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 drop-shadow-2xl select-none">
                                SHARE YOUR{' '}
                                <br />
                                <span className="text-amber-500">
                                    TESTIMONY
                                </span>
                            </h2>

                            <p className="text-xs sm:text-sm md:text-base text-white/60 font-light leading-relaxed max-w-xl">
                                &ldquo;They triumphed over him by the blood of the Lamb and by the word of their testimony.&rdquo; (Rev 12:11).
                                Your breakthrough is living proof that Jesus Christ is moving with power today. Speak of His goodness and ignite someone else&apos;s faith.
                            </p>

                            {/* Trust & Impact Highlights with Multi-Color Icons */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-1">
                                <div className="flex items-center gap-2 text-xs text-white/70 font-light">
                                    <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-2.5 h-2.5" />
                                    </div>
                                    <span>Pastoral Verification</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/70 font-light">
                                    <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-2.5 h-2.5" />
                                    </div>
                                    <span>Global Inspiration</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/70 font-light">
                                    <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-2.5 h-2.5" />
                                    </div>
                                    <span>100% Confidential</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
                                <Link
                                    href="/share-testimony"
                                    className="inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-full font-bold hover:bg-amber-400 transition-colors hover:scale-105 active:scale-95 duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] text-xs sm:text-sm uppercase tracking-wider text-center"
                                >
                                    <span>Submit Your Testimony</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/god-stories"
                                    className="inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 duration-300 text-xs sm:text-sm uppercase tracking-wider border border-white/10 text-center"
                                >
                                    <span>Read God Stories</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Right: Glassmorphism Miracle Counters & Helpline */}
                        <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                                {[
                                    {
                                        num: '500+',
                                        count: 500,
                                        suffix: '+',
                                        label: 'Testimonies Shared',
                                        sub: 'Documented Miracles',
                                        icon: Sparkles,
                                    },
                                    {
                                        num: '25+',
                                        count: 25,
                                        suffix: '+',
                                        label: 'Cities Reached',
                                        sub: 'Across 6+ Nations',
                                        icon: MapPin,
                                    },
                                    {
                                        num: '10K+',
                                        count: 10000,
                                        suffix: '+',
                                        label: 'Lives Touched',
                                        sub: 'Supernatural Grace',
                                        icon: Heart,
                                    },
                                    {
                                        num: '12+',
                                        count: 12,
                                        suffix: '+',
                                        label: 'Years of Ministry',
                                        sub: 'Unbroken Glory',
                                        icon: Flame,
                                    },
                                ].map((stat, i) => {
                                    const IconComp = stat.icon;
                                    return (
                                        <div
                                            key={i}
                                            className="group relative p-3.5 sm:p-5 rounded-xl sm:rounded-3xl bg-[#0A0A0A] border border-white/10 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between shadow-lg"
                                        >
                                            {/* Ambient Corner Flare */}
                                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-bl from-amber-500/15 to-transparent rounded-full opacity-60 group-hover:scale-125 transition-all duration-300 pointer-events-none" />
                                            
                                            {/* Top Icon & Dot */}
                                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-all duration-300 shadow-sm">
                                                    <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-inherit" />
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            {/* Stat Number & Descriptions */}
                                            <div>
                                                <p
                                                    className={`text-xl sm:text-2xl md:text-4xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors ${stat.count ? 'stat-counter-number' : ''}`}
                                                    data-count={stat.count || undefined}
                                                    data-suffix={stat.suffix || undefined}
                                                >
                                                    {stat.num}
                                                </p>
                                                <p className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-white/90 mt-0.5 sm:mt-1">
                                                    {stat.label}
                                                </p>
                                                <p className="text-[9px] sm:text-[10px] text-white/50 font-light mt-0.5">
                                                    {stat.sub}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pastoral Helpline / Prayer Support Card */}
                            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0A0A0A] border border-white/10 hover:border-amber-500/30 flex items-center justify-between gap-3 transition-all">
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white tracking-wide">
                                            Need Prayer With Your Story?
                                        </p>
                                        <p className="text-[10px] sm:text-[11px] text-white/50 font-light">
                                            24/7 Pastoral Care is ready to stand in faith with you.
                                        </p>
                                    </div>
                                </div>
                                <LiquidButton
                                    href="/contact"
                                    size="sm"
                                    variant="amber"
                                    icon={<ArrowRight className="w-3 h-3" />}
                                    iconPosition="right"
                                    className="flex-shrink-0 !py-1.5 !px-3 text-[10px] sm:text-[11px]"
                                >
                                    Connect
                                </LiquidButton>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </section>

            <SectionSeam />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* WORSHIP PORTAL CTA — Fraunces & Celestial Multi-Color Gradient */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="worship-cta" className="perf-section relative py-12 sm:py-20 md:py-28 px-4 sm:px-8 md:px-12 overflow-hidden bg-[#07060A] text-[#F4EDE2] font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 md:h-40 bg-gradient-to-b from-[#07060A] via-[#07060A]/70 to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 md:h-40 bg-gradient-to-t from-[#07060A] via-[#07060A]/70 to-transparent z-10" />

                {/* Ambient Flame Ember & Amber Gold Glows matching Logo Palette */}
                <div className="absolute w-[360px] sm:w-[480px] md:w-[560px] h-[360px] sm:h-[480px] md:h-[560px] rounded-full bg-[radial-gradient(circle,rgba(255,90,46,0.20)_0%,transparent_70%)] -top-28 md:-top-36 -right-20 md:-right-28 pointer-events-none z-0" />
                <div className="absolute w-[320px] sm:w-[420px] md:w-[500px] h-[320px] sm:h-[420px] md:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.18)_0%,transparent_70%)] -bottom-24 md:-bottom-32 -left-24 md:-left-36 pointer-events-none z-0" />
                <div className="starfield opacity-30 pointer-events-none z-0" />

                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="reveal-on-scroll relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0A0A0A] shadow-2xl p-5 sm:p-8 md:p-14 group hover:border-amber-500/30 transition-all duration-500">
                        {/* Top Accent Line */}
                        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 via-[#FF5A2E] to-transparent" />

                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-10 items-center">
                            {/* Left (3 cols) */}
                            <div className="md:col-span-3 space-y-3.5 sm:space-y-5">
                                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500">
                                    <Music className="w-5 h-5 sm:w-7 sm:h-7 text-inherit" />
                                </div>
                                <h2 className="text-2xl sm:text-4xl md:text-6xl font-black leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 drop-shadow-2xl select-none">
                                    WORSHIP <span className="text-amber-500">PORTAL</span>
                                </h2>
                                <p className="text-xs sm:text-sm md:text-base text-white/60 font-light max-w-xl leading-relaxed">
                                    Access hundreds of worship songs with guitar chords, lyrics, and key transposer — in Hindi & English. Built for worship leaders, musicians, and singers.
                                </p>
                                <button
                                    onClick={() => setMode('UTILITY')}
                                    className="inline-flex items-center gap-2.5 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 bg-white text-black rounded-full font-bold hover:bg-amber-400 transition-colors hover:scale-105 active:scale-95 duration-300 shadow-[0_0_40px_rgba(255,255,255,0.1)] text-xs sm:text-sm uppercase tracking-wider"
                                >
                                    <span>Enter Worship Portal</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Right (2 cols) — Feature list with Multi-Color Dots */}
                            <div className="md:col-span-2 space-y-2 sm:space-y-3">
                                {[
                                    { text: 'Guitar Chords & Tabs', color: 'bg-amber-500' },
                                    { text: 'Key Transposer', color: 'bg-red-500' },
                                    { text: 'Hindi & English Lyrics', color: 'bg-amber-400' },
                                    { text: 'Chord Diagrams', color: 'bg-red-400' },
                                    { text: 'Dark & Light Mode', color: 'bg-amber-300' }
                                ].map((f, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-2.5 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-white/5 border border-white/10"
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${f.color}`} />
                                        <span className="text-xs font-medium text-white/80">{f.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <SectionSeam />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* AUDIO PODCASTS                                                */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="podcasts" className="perf-section relative py-14 sm:py-24 md:py-28 px-4 sm:px-6 overflow-hidden bg-[#07060A] text-[#F4EDE2] font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 md:h-40 bg-gradient-to-b from-[#07060A] via-[#07060A]/70 to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 md:h-40 bg-gradient-to-t from-[#07060A] via-[#07060A]/70 to-transparent z-10" />

                {/* Ambient Flame Ember & Amber Gold Fire Glows matching Logo Palette */}
                <div className="absolute w-[360px] sm:w-[480px] md:w-[560px] h-[360px] sm:h-[480px] md:h-[560px] rounded-full bg-[radial-gradient(circle,rgba(255,90,46,0.18)_0%,transparent_70%)] -top-28 md:-top-36 -left-20 md:-left-28 pointer-events-none z-0" />
                <div className="absolute w-[320px] sm:w-[420px] md:w-[500px] h-[320px] sm:h-[420px] md:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.14)_0%,transparent_70%)] -bottom-24 md:-bottom-32 -right-24 md:-right-36 pointer-events-none z-0" />
                <div className="starfield opacity-30 pointer-events-none z-0" />

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
                    <div className="reveal-on-scroll space-y-2 sm:space-y-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/40 backdrop-blur-md transition-all text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white/70">
                            <Headphones className="w-3.5 h-3.5 text-amber-500" />
                            <span>Listen Anywhere</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 drop-shadow-2xl select-none">
                            AUDIO <span className="text-amber-500">PODCASTS</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 max-w-3xl mx-auto pt-2 sm:pt-4 reveal-on-scroll reveal-delay-1">
                        {[
                            { top: 'Listen on', name: 'Spotify', icon: '🎵', hoverBorder: 'hover:border-[#1DB954]/50 group-hover:text-[#1DB954]' },
                            { top: 'Listen on', name: 'Apple Music', icon: '🎧', hoverBorder: 'hover:border-[#FC3C44]/50 group-hover:text-[#FC3C44]' },
                            { top: 'Listen on', name: 'Amazon', icon: '📻', hoverBorder: 'hover:border-amber-500/50 group-hover:text-amber-400' },
                            { top: 'COJ', name: 'Podcasts', icon: '🎙️', hoverBorder: 'hover:border-red-500/50 group-hover:text-red-400' },
                        ].map((p, i) => (
                            <a
                                key={i}
                                href="#"
                                className={`group flex flex-col items-center justify-center gap-1.5 sm:gap-2 px-3 py-4 sm:px-4 sm:py-6 bg-[#0A0A0A] border border-white/10 rounded-xl sm:rounded-2xl ${p.hoverBorder} hover:bg-white/[0.03] transition-all duration-300 shadow-md`}
                            >
                                <span className="text-xl sm:text-2xl mb-0.5 sm:mb-1">{p.icon}</span>
                                <p className="text-[9px] text-white/50 uppercase tracking-widest">{p.top}</p>
                                <p className="text-xs sm:text-sm font-bold text-white transition-colors">{p.name}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <SectionSeam />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SOCIAL MEDIA                                                  */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="social" className="perf-section relative py-12 sm:py-20 md:py-32 px-4 sm:px-8 md:px-12 overflow-hidden bg-[#07060A] text-[#F4EDE2] font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 md:h-40 bg-gradient-to-b from-[#07060A] via-[#07060A]/70 to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 md:h-40 bg-gradient-to-t from-[#07060A] via-[#07060A]/70 to-transparent z-10" />

                {/* Ambient Flame Ember & Amber Gold Glows matching Logo Palette */}
                <div className="absolute w-[360px] sm:w-[480px] md:w-[560px] h-[360px] sm:h-[480px] md:h-[560px] rounded-full bg-[radial-gradient(circle,rgba(255,90,46,0.18)_0%,transparent_70%)] -top-28 md:-top-36 -right-20 md:-right-28 pointer-events-none z-0" />
                <div className="absolute w-[320px] sm:w-[420px] md:w-[500px] h-[320px] sm:h-[420px] md:h-[500px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.16)_0%,transparent_70%)] -bottom-24 md:-bottom-32 -left-24 md:-left-36 pointer-events-none z-0" />
                <div className="starfield opacity-30 pointer-events-none z-0" />

                <div className="relative z-10 max-w-7xl mx-auto space-y-6 sm:space-y-10">
                    <div className="space-y-2 sm:space-y-3 reveal-on-scroll">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-amber-500/40 backdrop-blur-md transition-all text-[10px] sm:text-xs font-bold tracking-widest uppercase text-white/70">
                            <Instagram className="w-3.5 h-3.5 text-amber-500" />
                            <span>Stay Connected</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl md:text-6xl font-black leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 drop-shadow-2xl select-none">
                            FOLLOW US <span className="text-amber-500">ONLINE</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 reveal-on-scroll reveal-delay-1">
                        {[
                            { name: 'WhatsApp', sub: 'Join Channel', icon: MessageCircle, href: 'https://whatsapp.com/channel/0029VaBFUhk9Guw4VxXqHI0m', accent: '#25D366', gradient: 'from-green-600/15', borderHover: 'hover:border-[#25D366]/40' },
                            { name: 'Facebook', sub: '10K+ Followers', icon: Facebook, href: 'https://www.facebook.com/callofjesusministries', accent: '#1877F2', gradient: 'from-blue-600/15', borderHover: 'hover:border-[#1877F2]/40' },
                            { name: 'Youtube', sub: 'Watch Sermons', icon: Youtube, href: 'https://www.youtube.com/@callofjesusministries', accent: '#FF0000', gradient: 'from-red-600/15', borderHover: 'hover:border-[#FF0000]/40' },
                            { name: 'Instagram', sub: 'Daily Updates', icon: Instagram, href: 'https://www.instagram.com/callofjesusministries', accent: '#E4405F', gradient: 'from-pink-600/15', borderHover: 'hover:border-[#E4405F]/40' },
                        ].map((social, i) => (
                            <a
                                key={i}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group relative rounded-2xl p-4 sm:p-6 min-h-[140px] sm:min-h-[200px] flex flex-col justify-between bg-gradient-to-br ${social.gradient} to-transparent bg-[#0A0A0A] border border-white/10 ${social.borderHover} transition-all duration-300 hover:scale-[1.02] overflow-hidden shadow-lg`}
                            >
                                <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(ellipse at bottom, ${social.accent}08, transparent)` }} />

                                <social.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white/40 group-hover:text-white/70 transition-colors relative z-10" />
                                <div className="relative z-10">
                                    <p className="text-base sm:text-lg font-bold text-white">{social.name}</p>
                                    <p className="text-[9px] sm:text-[10px] font-medium text-white/50 mt-0.5">{social.sub}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <SectionSeam />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* NEWSLETTER                                                    */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="newsletter" className="perf-section relative py-12 sm:py-16 md:py-20 px-4 sm:px-8 md:px-12 overflow-hidden bg-[#07060A] text-[#F4EDE2] font-space">
                {/* Seamless Section Top & Bottom Fade Overlays */}
                <div className="pointer-events-none absolute top-0 inset-x-0 h-28 md:h-40 bg-gradient-to-b from-[#07060A] via-[#07060A]/70 to-transparent z-10" />
                <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 md:h-40 bg-gradient-to-t from-[#07060A] via-[#07060A]/70 to-transparent z-10" />

                {/* Ambient Core Convergence Glow matching Logo Palette */}
                <div className="absolute w-[420px] sm:w-[540px] h-[320px] sm:h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,90,46,0.16)_0%,rgba(245,158,11,0.12)_50%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />
                <div className="starfield opacity-30 pointer-events-none z-0" />

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 reveal-on-scroll">
                    <h3 className="text-xl sm:text-3xl md:text-5xl font-black leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white/80 to-white/20 drop-shadow-2xl select-none">
                        JOIN THE <span className="text-amber-500">MOVEMENT</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto">
                        Get weekly devotionals, worship updates, and event announcements directly in your inbox.
                    </p>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                            if (!email || !/^\S+@\S+\.\S+$/.test(email)) { toast.error("Please enter a valid email."); return; }
                            try {
                                const { error } = await supabase.from('subscribers').insert([{ email }]);
                                if (error?.code === '23505') toast.success("Already subscribed!");
                                else if (error) toast.error("Failed. Try again.");
                                else { toast.success("Subscribed successfully! 🎉"); (form.elements.namedItem('email') as HTMLInputElement).value = ''; }
                            } catch { toast.error("Failed to subscribe."); }
                        }}
                        className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 max-w-md mx-auto"
                    >
                        <input name="email" type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-[#0A0A0A] border border-white/15 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-all" />
                        <button
                            type="submit"
                            className="px-6 py-3 sm:px-8 sm:py-3.5 rounded-full bg-white text-black font-bold hover:bg-amber-400 transition-colors hover:scale-105 active:scale-95 duration-300 text-xs sm:text-sm uppercase tracking-wider flex-shrink-0 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                        >
                            Subscribe
                        </button>
                    </form>
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
                            {/* Social Buttons */}
                            <div className="flex items-center gap-2 pt-0.5 sm:pt-1">
                                {[
                                    { icon: Facebook, href: 'https://www.facebook.com/callofjesusministries', label: 'Facebook' },
                                    { icon: Instagram, href: 'https://www.instagram.com/callofjesusministries', label: 'Instagram' },
                                    { icon: Youtube, href: 'https://www.youtube.com/@callofjesusministries', label: 'YouTube' },
                                ].map((s, i) => (
                                    <a
                                        key={i}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={s.label}
                                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center text-white/70 hover:text-amber-400 hover:border-amber-500/40 hover:bg-amber-500/10 active:scale-95 transition-all duration-300 shadow-sm"
                                    >
                                        <s.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
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
                                    <li><Link href="/events" className="hover:text-amber-400 transition-colors">Special Services</Link></li>
                                </ul>
                            </div>

                            {/* Grow */}
                            <div className="space-y-3.5">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FFB37A] flex items-center gap-1.5">
                                    <span>Grow</span>
                                </h4>
                                <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
                                    <li><Link href="/sermons" className="hover:text-amber-400 transition-colors">Sermons Archive</Link></li>
                                    <li><Link href="/god-stories" className="hover:text-amber-400 transition-colors">Miracle Stories</Link></li>
                                    <li><Link href="/devotional" className="hover:text-amber-400 transition-colors">Daily Devotionals</Link></li>
                                    <li><Link href="/podcasts" className="hover:text-amber-400 transition-colors">Audio Teachings</Link></li>
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
                                    <li><Link href="/tools/tuner" className="hover:text-amber-400 transition-colors">Guitar Tuner</Link></li>
                                    <li><Link href="/tools/pad" className="hover:text-amber-400 transition-colors">Worship Pads</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Middle Section: 3 Luxury Info & Gathering Cards */}
                    <div className="border-t border-white/15 pt-6 pb-6 sm:pt-8 sm:pb-8 grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-4">
                        {/* Card 1: Email */}
                        <a
                            href="mailto:contact@callofjesus.in"
                            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0D0B12] hover:bg-white/[0.04] border border-white/15 hover:border-amber-500/50 flex items-center gap-3 transition-all group shadow-sm"
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[9px] sm:text-[10px] text-amber-400/90 uppercase tracking-widest font-bold">Direct Inquiries</p>
                                <p className="text-xs sm:text-sm text-white font-medium group-hover:text-amber-300 transition-colors">contact@callofjesus.in</p>
                            </div>
                        </a>

                        {/* Card 2: Church Location */}
                        <a
                            href="https://maps.app.goo.gl/U6Unh6WEcAdbp89K6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0D0B12] hover:bg-white/[0.04] border border-white/15 hover:border-amber-500/50 flex items-center gap-3 transition-all group shadow-sm"
                        >
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[9px] sm:text-[10px] text-amber-400/90 uppercase tracking-widest font-bold">Church Arena</p>
                                <p className="text-xs sm:text-sm text-white font-medium flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                                    <span>Get Maps Directions</span>
                                    <Navigation className="w-3 h-3 text-amber-400" />
                                </p>
                            </div>
                        </a>

                        {/* Card 3: Gatherings */}
                        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0D0B12] border border-white/15 flex items-center gap-3 shadow-sm">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[9px] sm:text-[10px] text-amber-400/90 uppercase tracking-widest font-bold">Weekly Gatherings</p>
                                <p className="text-xs sm:text-sm text-white font-medium">Sun 10:30 AM IST • Fri 7:00 PM IST</p>
                            </div>
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
