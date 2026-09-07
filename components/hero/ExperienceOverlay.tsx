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
    Share2, Copy, Check, Mail, Phone
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

    // Carousel
    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [showBackToTop, setShowBackToTop] = useState(false);

    // ══════════════════════════════════════════════════════════════════════
    // HERO VIDEO SLIDER STATE & CONTROLS
    // Slide 1: Anniversary Special Video | Slide 2: Ministry Worship Video
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

    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const [isVideoMuted, setIsVideoMuted] = useState(true);
    const [isVideoPlaying, setIsVideoPlaying] = useState(true);
    const video1Ref = useRef<HTMLVideoElement>(null);
    const video2Ref = useRef<HTMLVideoElement>(null);

    // ═══ KINETIC TYPOGRAPHY ROTATING PHRASES (From Motion Spec) ═══
    const KINETIC_PHRASES = [
        "Meets Earth",
        "Heals Hearts",
        "Transforms Lives",
        "Ignites Revival"
    ];
    const [kineticIndex, setKineticIndex] = useState(0);
    const [prevKineticIndex, setPrevKineticIndex] = useState<number | null>(null);
    const [isKineticSwapping, setIsKineticSwapping] = useState(false);

    useEffect(() => {
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
    }, [kineticIndex]);

    const toggleVideoSound = () => {
        setIsVideoMuted((prev) => {
            const next = !prev;
            if (video1Ref.current) video1Ref.current.muted = next;
            if (video2Ref.current) video2Ref.current.muted = next;
            return next;
        });
    };

    const toggleVideoPlayback = () => {
        setIsVideoPlaying((prev) => {
            const next = !prev;
            const currentVid = activeVideoIndex === 0 ? video1Ref.current : video2Ref.current;
            if (currentVid) {
                if (next) currentVid.play().catch(() => { });
                else currentVid.pause();
            }
            return next;
        });
    };

    const handleNextVideo = () => {
        setActiveVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
    };

    const handlePrevVideo = () => {
        setActiveVideoIndex((prev) => (prev - 1 + HERO_VIDEOS.length) % HERO_VIDEOS.length);
    };

    useEffect(() => {
        const currentVid = activeVideoIndex === 0 ? video1Ref.current : video2Ref.current;
        const otherVid = activeVideoIndex === 0 ? video2Ref.current : video1Ref.current;

        if (currentVid) {
            currentVid.currentTime = 0;
            if (isVideoPlaying) {
                currentVid.play().catch(() => { });
            }
        }
        if (otherVid) {
            otherVid.pause();
        }
    }, [activeVideoIndex, isVideoPlaying]);

    // ═══ AUTO-SLIDE TIMER (Every 8 Seconds) ═══
    useEffect(() => {
        if (!isVideoPlaying) return;
        const autoSlideTimer = setInterval(() => {
            setActiveVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
        }, 8000);

        return () => clearInterval(autoSlideTimer);
    }, [activeVideoIndex, isVideoPlaying]);

    // ═══ AUTO-PAUSE HERO VIDEO ON SCROLL (Performance Booster) ═══
    useEffect(() => {
        const heroEl = document.getElementById('hero');
        if (!heroEl) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const isVisible = entries[0]?.isIntersecting;
                const currentVid = activeVideoIndex === 0 ? video1Ref.current : video2Ref.current;
                if (!currentVid) return;

                if (isVisible && isVideoPlaying) {
                    currentVid.play().catch(() => { });
                } else if (!isVisible) {
                    currentVid.pause();
                }
            },
            { threshold: 0.05 }
        );

        observer.observe(heroEl);
        return () => observer.disconnect();
    }, [activeVideoIndex, isVideoPlaying]);

    // ═══ VERSE OF THE DAY INTERACTIONS ═══
    const [copiedVerse, setCopiedVerse] = useState(false);
    const [showDevotional, setShowDevotional] = useState(false);

    const handleCopyVerse = () => {
        if (!verse) return;
        const textToCopy = `"${verse.text}"\n— ${verse.reference}\n\nCall of Jesus Ministries`;
        navigator.clipboard.writeText(textToCopy);
        setCopiedVerse(true);
        toast.success('Verse copied to clipboard! 🙏');
        setTimeout(() => setCopiedVerse(false), 2500);
    };

    const handleShareVerse = async () => {
        if (!verse) return;
        const shareData = {
            title: `Verse of the Day — ${verse.reference}`,
            text: `"${verse.text}" — ${verse.reference}`,
            url: typeof window !== 'undefined' ? window.location.href : '',
        };
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // User cancelled share
            }
        } else {
            handleCopyVerse();
        }
    };

    // ══════════════════════════════════════════════════════════════════════
    // GSAP + LENIS — Safe Animation Engine
    // Elements are fully visible by default. GSAP.context hides + animates
    // them. On cleanup/error, context.revert() restores full visibility.
    // ══════════════════════════════════════════════════════════════════════
    useEffect(() => {
        if (typeof window === 'undefined') return;

        let ctx: any = null;
        let lenisInstance: any = null;
        let rafId: any = null;

        const boot = async () => {
            try {
                const [{ default: gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
                    import('gsap'),
                    import('gsap/ScrollTrigger'),
                    import('lenis'),
                ]);

                gsap.registerPlugin(ScrollTrigger);

                // ── Lenis Smooth Scroll ──────────────────────────────
                lenisInstance = new Lenis({
                    duration: 1.2,
                    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    smoothWheel: true,
                });
                lenisInstance.on('scroll', ScrollTrigger.update);
                rafId = (time: number) => { lenisInstance?.raf(time * 1000); };
                gsap.ticker.add(rafId);
                gsap.ticker.lagSmoothing(0);

                // ── All animations inside gsap.context ───────────────
                // context.revert() will undo every gsap.set / gsap.to
                ctx = gsap.context(() => {

                    // ─── HERO: Content subtle fade on scroll ───
                    const heroBox = document.querySelector('.hero-content-box');
                    if (heroBox) {
                        gsap.to(heroBox, {
                            y: -40,
                            opacity: 0.15,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: '#hero',
                                start: 'top top',
                                end: '60% top',
                                scrub: 0.5,
                            },
                        });
                    }

                    // ─── Helper: animate a group of elements ─────────
                    const revealGroup = (
                        selector: string,
                        trigger: string,
                        fromVars: gsap.TweenVars,
                        stagger = 0.12,
                    ) => {
                        const els = document.querySelectorAll(selector);
                        if (!els.length) return;

                        // Hide elements (will be undone by context.revert)
                        gsap.set(els, { opacity: 0, ...fromVars });

                        gsap.to(els, {
                            opacity: 1,
                            x: 0, y: 0, scale: 1,
                            duration: 0.9,
                            stagger,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger,
                                start: 'top 82%',
                                toggleActions: 'play none none none',
                            },
                        });
                    };

                    // ─── VERSE section fade-in ───────────────────────
                    revealGroup('#verse .relative.z-10 > *', '#verse', { y: 30 }, 0.1);

                    // ─── GATHERINGS heading slide from left ──────────
                    revealGroup('#gatherings > div:first-child > div > *', '#gatherings', { x: -40 }, 0.08);

                    // ─── EVENT CARDS stagger from bottom ─────────────
                    revealGroup('.gsap-event-card', '#gatherings', { y: 60, scale: 0.96 }, 0.15);

                    // ─── CHURCH BANNER slide up ──────────────────────
                    revealGroup('.gsap-church-banner', '#gatherings', { y: 40 }, 0);

                    // ─── VISION left column ──────────────────────────
                    revealGroup('#vision .relative.z-10 > div:first-child > *', '#vision', { x: -50 }, 0.1);

                    // ─── VISION right column ─────────────────────────
                    revealGroup('#vision .relative.z-10 > div:last-child > *', '#vision', { x: 50 }, 0.12);

                    // ─── TRENDING heading ────────────────────────────
                    revealGroup('#trending > div:first-child > div > *', '#trending', { x: -40 }, 0.08);

                    // ─── BENTO SONG ITEMS stagger ────────────────────
                    revealGroup('.gsap-bento-song', '#trending', { y: 50, scale: 0.94 }, 0.1);

                    // ─── GOD STORIES heading & cards stagger ───────────
                    const storiesHeader = document.querySelector('#stories-header');
                    if (storiesHeader) {
                        gsap.set(storiesHeader, { x: -30, opacity: 0 });
                        gsap.to(storiesHeader, {
                            x: 0,
                            opacity: 1,
                            duration: 1.1,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: '#stories',
                                start: 'top 85%',
                                toggleActions: 'play none none none',
                            },
                        });
                    }

                    const storyCards = document.querySelectorAll('.gsap-story-card');
                    if (storyCards.length > 0) {
                        gsap.set(storyCards, { y: 60, opacity: 0, scale: 0.94 });
                        gsap.to(storyCards, {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 1.2,
                            stagger: 0.15,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: '#stories',
                                start: 'top 80%',
                                toggleActions: 'play none none none',
                            },
                        });
                    }

                    // ─── TESTIMONY section ───────────────────────────
                    revealGroup('#testimony .relative.z-10 > div:first-child > *', '#testimony', { x: -40 }, 0.1);
                    revealGroup('#testimony .relative.z-10 > div:last-child > div', '#testimony', { y: 30, scale: 0.95 }, 0.08);

                    // ─── WORSHIP CTA card ────────────────────────────
                    // Remove the basic worship-cta revealGroup — replaced with scrub below
                    // revealGroup('#worship-cta > div', '#worship-cta', { y: 40, scale: 0.97 }, 0);

                    // ─── PODCASTS heading + cards ─────────────────────
                    revealGroup('#podcasts .relative.z-10 > *', '#podcasts', { y: 30 }, 0.08);
                    revealGroup('.gsap-podcast-card', '#podcasts', { y: 35, scale: 0.95 }, 0.08);

                    // ─── SOCIAL heading ──────────────────────────────
                    revealGroup('#social > div:first-child > *', '#social', { x: -40 }, 0.08);
                    revealGroup('.gsap-social-card', '#social', { y: 45, scale: 0.95 }, 0.1);

                    // ─── NEWSLETTER ──────────────────────────────────
                    revealGroup('#newsletter > div > *', '#newsletter', { y: 25 }, 0.1);


                    // ═══════════════════════════════════════════════════
                    // FEATURE 2: STATS COUNTER — numbers count up from 0
                    // ═══════════════════════════════════════════════════
                    document.querySelectorAll('.gsap-stat-number').forEach((el) => {
                        const countTo = parseInt(el.getAttribute('data-count') || '0', 10);
                        const suffix = el.getAttribute('data-suffix') || '';
                        if (!countTo) return; // skip ∞

                        const obj = { val: 0 };
                        gsap.set(el, {}); // register with context for revert
                        gsap.to(obj, {
                            val: countTo,
                            duration: 2.2,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: el,
                                start: 'top 88%',
                                toggleActions: 'play none none none',
                            },
                            onUpdate: () => {
                                (el as HTMLElement).textContent = Math.floor(obj.val) + suffix;
                            },
                        });
                    });


                    // ═══════════════════════════════════════════════════
                    // FEATURE 3: OUR VISION ENTRANCE ANIMATIONS
                    // ═══════════════════════════════════════════════════
                    const visionHeader = document.querySelector('#vision-header');
                    if (visionHeader) {
                        gsap.set(visionHeader, { x: -40, opacity: 0 });
                        gsap.to(visionHeader, {
                            x: 0,
                            opacity: 1,
                            duration: 1.1,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: '#vision',
                                start: 'top 82%',
                                toggleActions: 'play none none none',
                            },
                        });
                    }

                    const visionCards = document.querySelectorAll('.gsap-vision-card');
                    if (visionCards.length > 0) {
                        gsap.set(visionCards, { y: 50, opacity: 0, scale: 0.96 });
                        gsap.to(visionCards, {
                            y: 0,
                            opacity: 1,
                            scale: 1,
                            duration: 1.2,
                            stagger: 0.2,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: '#vision',
                                start: 'top 80%',
                                toggleActions: 'play none none none',
                            },
                        });
                    }


                    // ═══════════════════════════════════════════════════
                    // FEATURE 5: SCRUB WORSHIP CTA — scale grows on scroll
                    // ═══════════════════════════════════════════════════
                    const ctaCard = document.querySelector('#worship-cta > div');
                    if (ctaCard) {
                        gsap.set(ctaCard, { scale: 0.82, opacity: 0.5 });
                        gsap.to(ctaCard, {
                            scale: 1,
                            opacity: 1,
                            ease: 'none',
                            scrollTrigger: {
                                trigger: '#worship-cta',
                                start: 'top 90%',
                                end: 'top 30%',
                                scrub: 1.2,
                            },
                        });
                    }


                    // ═══════════════════════════════════════════════════
                    // FEATURE 6: HORIZONTAL SCROLL SONGS
                    // ═══════════════════════════════════════════════════
                    const hscroll = document.querySelector('.gsap-songs-hscroll') as HTMLElement;
                    if (hscroll && window.innerWidth >= 768) {
                        const totalScroll = hscroll.scrollWidth - hscroll.offsetWidth;
                        if (totalScroll > 0) {
                            gsap.to(hscroll, {
                                x: -totalScroll,
                                ease: 'none',
                                scrollTrigger: {
                                    trigger: '#trending',
                                    start: 'top top',
                                    end: `+=${totalScroll}`,
                                    pin: true,
                                    scrub: 1,
                                    anticipatePin: 1,
                                },
                            });
                        }
                    }

                });

                // ═══════════════════════════════════════════════════
                // FEATURE 4: MAGNETIC BUTTONS (outside context,
                // cleaned up manually)
                // ═══════════════════════════════════════════════════
                const magneticBtns = document.querySelectorAll('.magnetic-btn');
                const magneticHandlers: Array<{ el: Element; move: (e: MouseEvent) => void; leave: () => void }> = [];

                magneticBtns.forEach((btn) => {
                    const moveHandler = (e: MouseEvent) => {
                        const rect = (btn as HTMLElement).getBoundingClientRect();
                        const dx = e.clientX - rect.left - rect.width / 2;
                        const dy = e.clientY - rect.top - rect.height / 2;
                        gsap.to(btn, { x: dx * 0.25, y: dy * 0.25, duration: 0.3, ease: 'power2.out' });
                    };
                    const leaveHandler = () => {
                        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
                    };
                    btn.addEventListener('mousemove', moveHandler as EventListener);
                    btn.addEventListener('mouseleave', leaveHandler as EventListener);
                    magneticHandlers.push({ el: btn, move: moveHandler, leave: leaveHandler });
                });

                (window as any).__magneticHandlers = magneticHandlers;


                // ═══════════════════════════════════════════════════
                // FEATURE 7: HERO TEXT SCRAMBLE on page load
                // ═══════════════════════════════════════════════════
                const scrambleEl = document.querySelector('.gsap-scramble-text') as HTMLElement;
                if (scrambleEl) {
                    const finalText = scrambleEl.textContent || '';
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*';
                    let iteration = 0;
                    const interval = setInterval(() => {
                        scrambleEl.textContent = finalText
                            .split('')
                            .map((char, idx) => {
                                if (idx < iteration) return finalText[idx];
                                return chars[Math.floor(Math.random() * chars.length)];
                            })
                            .join('');
                        iteration += 1 / 2;
                        if (iteration >= finalText.length) {
                            clearInterval(interval);
                            scrambleEl.textContent = finalText;
                        }
                    }, 35);
                    (window as any).__scrambleInterval = interval;
                }


                // ═══════════════════════════════════════════════════
                // FEATURE 8: SCROLL PROGRESS BAR
                // ═══════════════════════════════════════════════════
                const progressBar = document.querySelector('.gsap-scroll-progress') as HTMLElement;
                if (progressBar) {
                    gsap.to(progressBar, {
                        scaleX: 1,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: document.body,
                            start: 'top top',
                            end: 'bottom bottom',
                            scrub: 0.3,
                        },
                    });
                }


                // ═══════════════════════════════════════════════════
                // FEATURE 9: 3D TILT CARDS (Apple TV style)
                // ═══════════════════════════════════════════════════
                const tiltCards = document.querySelectorAll('.gsap-tilt-card');
                const tiltHandlers: Array<{ el: Element; move: (e: MouseEvent) => void; leave: () => void }> = [];

                tiltCards.forEach((card) => {
                    const moveH = (e: MouseEvent) => {
                        const rect = (card as HTMLElement).getBoundingClientRect();
                        const cx = e.clientX - rect.left;
                        const cy = e.clientY - rect.top;
                        const xRot = ((cy - rect.height / 2) / rect.height) * -12;
                        const yRot = ((cx - rect.width / 2) / rect.width) * 12;
                        gsap.to(card, {
                            rotateX: xRot,
                            rotateY: yRot,
                            duration: 0.4,
                            ease: 'power2.out',
                            transformPerspective: 800,
                        });
                    };
                    const leaveH = () => {
                        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
                    };
                    card.addEventListener('mousemove', moveH as EventListener);
                    card.addEventListener('mouseleave', leaveH as EventListener);
                    tiltHandlers.push({ el: card, move: moveH, leave: leaveH });
                });
                (window as any).__tiltHandlers = tiltHandlers;


                // ═══════════════════════════════════════════════════
                // FEATURE 10: IMAGE CURTAIN REVEAL
                // ═══════════════════════════════════════════════════
                document.querySelectorAll('.gsap-curtain-img').forEach((img) => {
                    gsap.set(img, { clipPath: 'inset(0 100% 0 0)' });
                    gsap.to(img, {
                        clipPath: 'inset(0 0% 0 0)',
                        duration: 1.2,
                        ease: 'power3.inOut',
                        scrollTrigger: {
                            trigger: img,
                            start: 'top 80%',
                            toggleActions: 'play none none none',
                        },
                    });
                });


                // ═══════════════════════════════════════════════════
                // FEATURE 11: INFINITE MARQUEE
                // ═══════════════════════════════════════════════════
                const marqueeInner = document.querySelector('.gsap-marquee-inner') as HTMLElement;
                if (marqueeInner) {
                    const mWidth = marqueeInner.scrollWidth / 2;
                    gsap.to(marqueeInner, {
                        x: -mWidth,
                        duration: 20,
                        ease: 'none',
                        repeat: -1,
                    });
                }

            } catch (err) {
                console.warn('GSAP init skipped:', err);
            }
        };

        boot();

        const onScroll = () => { setShowBackToTop(window.scrollY > 600); };
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
            if (ctx) ctx.revert();
            if (rafId) {
                import('gsap').then(({ default: gsap }) => gsap.ticker.remove(rafId)).catch(() => { });
            }
            if (lenisInstance) lenisInstance.destroy();

            // Clean up magnetic button listeners
            const handlers = (window as any).__magneticHandlers as Array<{ el: Element; move: (e: MouseEvent) => void; leave: () => void }> | undefined;
            if (handlers) {
                handlers.forEach(({ el, move, leave }: { el: Element; move: (e: MouseEvent) => void; leave: () => void }) => {
                    el.removeEventListener('mousemove', move as EventListener);
                    el.removeEventListener('mouseleave', leave as EventListener);
                });
                delete (window as any).__magneticHandlers;
            }

            // Clean up 3D tilt listeners
            const tHandlers = (window as any).__tiltHandlers as Array<{ el: Element; move: (e: MouseEvent) => void; leave: () => void }> | undefined;
            if (tHandlers) {
                tHandlers.forEach(({ el, move, leave }: { el: Element; move: (e: MouseEvent) => void; leave: () => void }) => {
                    el.removeEventListener('mousemove', move as EventListener);
                    el.removeEventListener('mouseleave', leave as EventListener);
                });
                delete (window as any).__tiltHandlers;
            }

            // Clean up scramble interval
            if ((window as any).__scrambleInterval) {
                clearInterval((window as any).__scrambleInterval);
                delete (window as any).__scrambleInterval;
            }
        };
    }, []);

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (!carouselRef.current) return;
        carouselRef.current.scrollBy({ left: direction === 'left' ? -420 : 420, behavior: 'smooth' });
        setTimeout(updateScrollButtons, 350);
    };

    const updateScrollButtons = () => {
        if (!carouselRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    // God Stories — Rich Testimonial Data
    const godStories = [
        {
            title: "Creative Miracle: A New Ovary Created After Surgical Removal",
            excerpt: "In 2020, during a routine medical examination, Shweta was informed she had a cyst. After prayer, God performed a creative miracle and doctors verified a completely new organ.",
            category: "Creative Miracle",
            person: "Sister Shweta",
            city: "New Delhi",
            scripture: "Jeremiah 32:27 • Is anything too hard for God?"
        },
        {
            title: "Healed from Cancer: Brother Rajesh's Testimony",
            excerpt: "Diagnosed with stage 3 cancer, Brother Rajesh came to the healing service with faith that moved mountains. Post-service PET scans showed zero cancer cells.",
            category: "Cancer Healed",
            person: "Brother Rajesh",
            city: "Faridabad",
            scripture: "Isaiah 53:5 • By His stripes we are healed"
        },
        {
            title: "Delivered from Depression: Sister Priya's Journey to Freedom",
            excerpt: "For years, Sister Priya struggled with severe depression and mental torment. After the prophetic gathering, peace filled her heart and all chains were broken.",
            category: "Mental Freedom",
            person: "Sister Priya",
            city: "Noida",
            scripture: "John 8:36 • Who the Son sets free is free indeed"
        },
        {
            title: "Financial Breakthrough: God's Supernatural Provision",
            excerpt: "On the verge of business bankruptcy and heavy debts, Brother Samuel stood on God's Word and experienced supernatural debt clearance within 3 months.",
            category: "Supernatural Favor",
            person: "Brother Samuel",
            city: "Gurugram",
            scripture: "Philippians 4:19 • My God shall supply all your needs"
        }
    ];

    // Rich Testimonials dataset for 3D Circular Testimonials Showcase
    const testimonialsData = [
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

    return (
        <div className="relative w-full min-h-screen bg-[#02000F] text-white selection:bg-amber-500/30 selection:text-white overflow-x-hidden">

            {/* ═══ SCROLL PROGRESS BAR ═══ */}
            <div className="gsap-scroll-progress fixed top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 z-[100] origin-left" style={{ transform: 'scaleX(0)' }} />

            <LandingNavbar />

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* HERO — Full-screen cinematic hero                             */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="hero" className="relative w-full h-[100dvh] flex items-center justify-center text-center overflow-hidden">

                {/* Background Video Slider */}
                <div className="hero-bg-img absolute inset-0 z-0 overflow-hidden bg-[#02000F]">
                    {/* Slide 1 Video: Anniversary Celebration */}
                    <video
                        ref={video1Ref}
                        src="/videos/coj%20video%20for%20hero%20annivercery.mp4"
                        autoPlay
                        muted={isVideoMuted}
                        playsInline
                        preload="auto"
                        onEnded={handleNextVideo}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${activeVideoIndex === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                    />

                    {/* Slide 2 Video: Ministry Worship */}
                    <video
                        ref={video2Ref}
                        src="/videos/coj%20video.mp4"
                        muted={isVideoMuted}
                        playsInline
                        preload="auto"
                        onEnded={handleNextVideo}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${activeVideoIndex === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                    />


                    {/* Clean Hardware-Accelerated Vignette Overlay */}
                    <div className="absolute inset-0 bg-black/25" />

                    {/* Compact Edge Fade Only at the Very Bottom Edge (Does not hide video) */}
                    <div className="absolute bottom-0 inset-x-0 h-16 md:h-24 bg-gradient-to-t from-[#02000F] to-transparent pointer-events-none z-[4]" />
                </div>

                {/* Hero Content — Centered Minimal (Ankit Sajwan Style) */}
                <div className="hero-content-box relative z-10 flex flex-col items-center px-6">

                    {/* Main Headline with Subtitle brought down directly on top */}
                    <div className="hero-fade-in flex flex-col items-center" style={{ animationDelay: '0.4s' }}>
                        {/* Subtitle — Brought right next to Where Heaven */}
                        <p className="text-xs md:text-sm font-medium tracking-[0.35em] text-white/80 uppercase mb-1 md:mb-1.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                            Call of Jesus Ministries
                        </p>

                        <h1 className="flex flex-col items-center">
                            <span
                                className="block text-5xl sm:text-7xl md:text-8xl lg:text-[120px] font-extralight tracking-[-0.02em] text-white leading-[1.05]"
                                style={{ textShadow: '0 2px 40px rgba(0,0,0,0.3)' }}
                            >
                                Where Heaven
                            </span>

                            {/* Kinetic Masked Flip Container (Properly Sized & Centered) */}
                            <div className="relative text-5xl sm:text-7xl md:text-8xl lg:text-[120px] h-[1.25em] w-full max-w-4xl overflow-hidden flex items-center justify-center select-none mt-1">
                                {/* Current / Incoming Phrase */}
                                <span
                                    key={`kinetic-curr-${kineticIndex}`}
                                    className={`block font-playfair italic font-normal text-white leading-[1.1] whitespace-nowrap ${isKineticSwapping ? 'kinetic-phrase-in' : ''
                                        }`}
                                    style={{ textShadow: '0 2px 40px rgba(0,0,0,0.3)' }}
                                >
                                    {KINETIC_PHRASES[kineticIndex]}
                                </span>

                                {/* Previous / Outgoing Phrase (slides up and out through the mask) */}
                                {isKineticSwapping && prevKineticIndex !== null && (
                                    <span
                                        key={`kinetic-prev-${prevKineticIndex}`}
                                        className="absolute font-playfair italic font-normal text-white leading-[1.1] whitespace-nowrap kinetic-phrase-out"
                                        style={{ textShadow: '0 2px 40px rgba(0,0,0,0.3)' }}
                                    >
                                        {KINETIC_PHRASES[prevKineticIndex]}
                                    </span>
                                )}
                            </div>
                        </h1>
                    </div>

                    {/* Single White Pill CTA — Clean & Minimal */}
                    <div className="hero-fade-in pt-4" style={{ animationDelay: '0.9s' }}>
                        <a
                            href="https://maps.app.goo.gl/U6Unh6WEcAdbp89K6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="liquid-btn group relative inline-flex items-center gap-3 px-8 py-4 rounded-full border border-white/40 hover:border-amber-400/80 bg-white/10 text-white font-semibold text-sm tracking-wide backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.35)] transition-all duration-500"
                        >
                            {/* Water Bottle Liquid Fill (Rises up on hover with animated waves) */}
                            <div className="liquid-water-fill bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300 text-amber-300">
                                <svg className="liquid-wave-svg liquid-wave-1" viewBox="0 0 120 20" preserveAspectRatio="none">
                                    <path d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z" fill="currentColor" />
                                </svg>
                                <svg className="liquid-wave-svg liquid-wave-2 text-amber-200" viewBox="0 0 120 20" preserveAspectRatio="none">
                                    <path d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z" fill="currentColor" />
                                </svg>
                            </div>

                            <span className="relative z-10 font-bold group-hover:text-neutral-950 transition-colors duration-500">Get Directions</span>
                            <ArrowRight className="relative z-10 w-4 h-4 group-hover:text-neutral-950 group-hover:translate-x-1.5 transition-all duration-300" />
                        </a>
                    </div>

                    {/* Secondary Link — With balanced gap */}
                    <Link
                        href="/worship"
                        className="hero-fade-in text-white/55 hover:text-white text-xs tracking-[0.15em] uppercase font-medium transition-colors duration-300 mt-5 md:mt-6"
                        style={{ animationDelay: '1.1s' }}
                    >
                        Explore Worship Songs →
                    </Link>
                </div>



                {/* Scroll indicator */}
                <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-2 opacity-40 animate-float-slow pointer-events-none">
                    <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1.5">
                        <div className="w-1 h-2 rounded-full bg-white animate-float-slow" />
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* INFINITE MARQUEE BANNER                                       */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="relative py-6 overflow-hidden bg-[#02000F]">
                <div className="gsap-marquee-inner flex whitespace-nowrap will-change-transform">
                    {Array.from({ length: 2 }).map((_, setIdx) => (
                        <div key={setIdx} className="flex items-center gap-8 px-4">
                            {['Jesus is Lord', 'Hallelujah', 'God is Good', 'Praise the Lord', 'Amen', 'Holy Spirit', 'Glory to God', 'Emmanuel'].map((word, i) => (
                                <span key={i} className="flex items-center gap-8">
                                    <span className="text-lg md:text-2xl font-light tracking-[0.2em] uppercase text-white/50">{word}</span>
                                    <span className="text-amber-400/80 text-sm drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">✦</span>
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>


            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* VERSE OF THE DAY — Large Luxury Sanctuary Showcase Card        */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="verse" className="relative py-28 md:py-44 px-4 sm:px-6 md:px-12 overflow-hidden">
                {/* Spiritual Aurora & Ambient Background Lights */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#02000F] via-[#060220] to-[#02000F]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] md:w-[950px] h-[450px] bg-gradient-to-r from-amber-500/10 via-rose-500/8 to-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="starfield opacity-40 z-0" />

                <div className="relative z-10 max-w-6xl mx-auto">
                    {/* Grand Sanctuary Showcase Card (Large Paper Layout) */}
                    <div className="relative rounded-[2.5rem] md:rounded-[3.5rem] p-10 sm:p-14 md:p-20 bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-white/[0.05] border border-amber-500/25 backdrop-blur-xl shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_100px_rgba(245,158,11,0.08)] overflow-hidden group">

                        {/* Golden Top Edge Accent Glow */}
                        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

                        {/* Decorative Giant Watermark Quote Mark */}
                        <div className="absolute -top-6 left-8 md:-top-4 md:left-14 text-amber-400/[0.07] text-9xl md:text-[160px] font-serif select-none pointer-events-none -scale-x-100">
                            &ldquo;
                        </div>

                        <div className="relative z-10 space-y-10 md:space-y-12 text-center">

                            {/* Card Top Header: Badge, Today's Date, and Ps. Samson Wilson tag */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/[0.08] pb-8">
                                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-amber-500/40 bg-amber-500/15 shadow-lg shadow-amber-500/15">
                                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                                    <span className="text-xs font-black tracking-[0.25em] uppercase text-amber-300">
                                        Verse of the Day
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-neutral-300 bg-white/[0.04] px-4 py-1.5 rounded-full border border-white/5">
                                        <BookOpen className="w-4 h-4 text-amber-400" />
                                        <span>Daily Bread</span>
                                    </div>
                                </div>
                            </div>

                            {/* Grand Holy Scripture Quote */}
                            <div className="space-y-6 py-4">
                                <blockquote className="text-3xl sm:text-5xl md:text-6xl lg:text-[56px] font-normal text-white leading-[1.3] font-playfair italic drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] max-w-5xl mx-auto tracking-tight">
                                    &ldquo;{verse?.text || "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."}&rdquo;
                                </blockquote>
                            </div>

                            {/* Reference & Pastor Samson Wilson Attribution Block */}
                            <div className="flex flex-col items-center gap-5">
                                <div className="w-28 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

                                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
                                    {/* Scripture Reference Badge */}
                                    <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white/[0.06] border border-amber-500/30 shadow-inner">
                                        <span className="text-amber-400 text-sm">✦</span>
                                        <span className="text-sm md:text-base font-bold tracking-[0.25em] uppercase text-amber-300">
                                            {verse?.reference || "John 3:16"}
                                        </span>
                                        <span className="text-amber-400 text-sm">✦</span>
                                    </div>

                                    {/* Ps. Samson Wilson Pill */}
                                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs md:text-sm font-medium text-amber-200 shadow-md">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        <strong className="font-bold text-amber-300 font-playfair italic text-sm md:text-base tracking-wide">Ps. Samson Wilson</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Reflection / Prayer Expandable Accordion */}
                            {verse?.reflection && showDevotional && (
                                <div className="p-8 rounded-3xl bg-black/50 border border-amber-500/20 text-left space-y-4 animate-fade-in-down max-w-4xl mx-auto shadow-2xl">
                                    <p className="text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-rose-400" /> Daily Reflection • Ps. Samson Wilson
                                    </p>
                                    <p className="text-sm md:text-base text-neutral-200 leading-relaxed font-light">
                                        {verse.reflection}
                                    </p>
                                    {verse.prayer && (
                                        <div className="pt-3 border-t border-white/10">
                                            <p className="text-xs md:text-sm text-amber-200/95 font-serif italic">
                                                <span className="font-bold text-amber-400 not-italic">Prayer: </span>
                                                {verse.prayer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Interactive Action Buttons */}
                            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
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


            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* WEEKLY GATHERINGS & CHURCH LOCATION                           */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="gatherings" className="relative py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/[0.05]">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-300/70">Weekly Gatherings</span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-extralight text-white tracking-tight">
                            Join Us <span className="font-playfair italic font-normal bg-gradient-to-r from-amber-200 via-amber-100 to-amber-400 bg-clip-text text-transparent">Offline</span>
                        </h2>
                        <p className="text-sm text-neutral-400 font-light max-w-2xl">
                            Experience the presence of God together. Come as you are. • <span className="font-playfair italic text-amber-300/80">परमेश्वर की उपस्थिति का अनुभव करें।</span>
                        </p>
                    </div>

                    <LiquidButton
                        href="https://maps.app.goo.gl/U6Unh6WEcAdbp89K6"
                        target="_blank"
                        rel="noopener noreferrer"
                        size="md"
                        icon={<ArrowRight className="w-4 h-4" />}
                        iconPosition="right"
                        className="self-start md:self-auto"
                    >
                        Get Directions to Church
                    </LiquidButton>
                </div>

                {/* Event Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {eventsList.map((event: any, i: number) => {
                        const IconComponent = ICON_MAP[event.icon_name] || (i === 0 ? BookOpen : i === 1 ? Sun : Wine);
                        return (
                            <div
                                key={event.id || i}
                                className="gsap-event-card gsap-tilt-card group relative rounded-3xl p-7 flex flex-col justify-between bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-amber-500/30 transition-all duration-500 hover:scale-[1.02] shadow-2xl overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${event.gradient || 'from-amber-500/10'} to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700`} />

                                <div className="space-y-5 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${event.color || 'text-amber-400'} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                                            <IconComponent className="w-6 h-6" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5">
                                            Weekly
                                        </span>
                                    </div>

                                    {/* English Details */}
                                    <div className="space-y-1.5">
                                        <h3 className="text-xl font-bold text-white group-hover:text-amber-200 transition-colors">
                                            {event.title_en || event.titleEn}
                                        </h3>
                                        <div className="flex items-start gap-2 text-xs text-neutral-300">
                                            <Clock className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                                            <span>{event.time_en || event.timeEn}</span>
                                        </div>
                                        {(event.desc_en || event.descEn) && (
                                            <p className="text-xs text-neutral-500 pt-1 font-light leading-relaxed">
                                                {event.desc_en || event.descEn}
                                            </p>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                                    {/* Hindi Details */}
                                    <div className="space-y-1.5">
                                        <h4 className="text-lg font-bold text-white/90 font-serif">
                                            {event.title_hi || event.titleHi}
                                        </h4>
                                        <div className="flex items-start gap-2 text-xs text-neutral-400 font-serif">
                                            <Clock className="w-3.5 h-3.5 text-amber-400/80 mt-0.5 shrink-0" />
                                            <span>{event.time_hi || event.timeHi}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 relative z-10">
                                    <a
                                        href="https://maps.app.goo.gl/U6Unh6WEcAdbp89K6"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors"
                                    >
                                        <span>Church Location</span>
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Church Arena Location Banner */}
                <div className="gsap-church-banner relative rounded-3xl p-8 md:p-10 bg-gradient-to-r from-neutral-900/90 via-neutral-950 to-neutral-900/90 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-3 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
                            <MapPin className="w-4 h-4" />
                            <span>Call of Jesus Ministries Church</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-extralight text-white">
                            Visit Us in <span className="font-playfair italic font-normal text-amber-300">Person</span>
                        </h3>
                        <p className="text-neutral-400 text-xs md:text-sm font-light max-w-xl">
                            Join us live every Sunday at 10:30 AM & Friday at 7:00 PM for life-changing worship, prophetic teaching, and healing.
                        </p>
                    </div>

                    <a
                        href="https://maps.app.goo.gl/U6Unh6WEcAdbp89K6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 px-8 py-4 bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs uppercase tracking-wider rounded-full shadow-2xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                    >
                        <Navigation className="w-4 h-4" />
                        <span>Get Google Maps Directions</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </section>


            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* OUR VISION — Heavenly Amber Sanctuary Pillar Design           */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="vision" className="relative py-28 md:py-36 px-6 overflow-hidden bg-[#02000F]">
                {/* Atmospheric Holy Light Backdrops */}
                <div className="absolute top-1/2 -left-24 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/[0.06] rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute -bottom-20 right-0 w-[500px] h-[500px] bg-amber-600/[0.05] rounded-full blur-[140px] pointer-events-none" />
                <div className="starfield opacity-40" />

                <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                    {/* Left: Sticky Brand Header */}
                    <div id="vision-header" className="lg:col-span-5 space-y-6">
                        {/* Divine Calling Golden Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-300">Divine Calling</span>
                        </div>

                        <h2 className="text-4xl sm:text-5xl md:text-7xl font-extralight text-white tracking-tight leading-[1.05]">
                            Our{' '}
                            <span className="font-playfair italic font-normal bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">Vision</span>
                        </h2>

                        <div className="flex items-start gap-4 pt-2">
                            <div className="w-1 h-14 rounded-full bg-gradient-to-b from-amber-400 via-amber-400/50 to-transparent flex-shrink-0 mt-1" />
                            <p className="text-sm md:text-base font-light text-neutral-300 leading-relaxed">
                                Commissioned by Jesus Christ to release supernatural freedom, royal identity, and revival to the nations through the Holy Spirit.
                            </p>
                        </div>

                        {/* Liquid CTA Button to Vision & Mission */}
                        <div className="pt-4">
                            <Link
                                href="/our-vision-and-mission"
                                className="liquid-btn group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-amber-500/40 hover:border-amber-400 bg-white/[0.04] text-white font-semibold text-xs tracking-widest uppercase backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.3)] transition-all duration-500"
                            >
                                <div className="liquid-water-fill bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300 text-amber-300">
                                    <svg className="liquid-wave-svg liquid-wave-1" viewBox="0 0 120 20" preserveAspectRatio="none">
                                        <path d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z" fill="currentColor" />
                                    </svg>
                                    <svg className="liquid-wave-svg liquid-wave-2 text-amber-200" viewBox="0 0 120 20" preserveAspectRatio="none">
                                        <path d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z" fill="currentColor" />
                                    </svg>
                                </div>
                                <span className="relative z-10 font-bold group-hover:text-neutral-950 transition-colors duration-500">Explore Full Mission</span>
                                <ArrowRight className="relative z-10 w-4 h-4 text-amber-400 group-hover:text-neutral-950 group-hover:translate-x-1 transition-all duration-300" />
                            </Link>
                        </div>
                    </div>

                    {/* Right: Two Magnificent Vision Cards */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Vision Card 01 — Freedom & Identity */}
                        <div className="gsap-vision-card group relative p-8 md:p-10 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl hover:border-amber-400/50 hover:shadow-[0_0_50px_rgba(245,158,11,0.2)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden">
                            {/* Ambient Card Glow on Hover */}
                            <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-colors duration-500 pointer-events-none" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                        <Sparkles className="w-6 h-6 text-amber-400" />
                                    </div>
                                    <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-400/70 font-mono">
                                        PILLAR 01
                                    </span>
                                </div>

                                <h3 className="text-2xl md:text-3xl font-light text-white tracking-tight">
                                    To <span className="font-playfair italic font-normal text-amber-300">Set the Captives Free</span>
                                </h3>

                                <p className="text-base md:text-lg text-neutral-300/90 font-light leading-relaxed">
                                    To unveil the <strong className="font-semibold text-white font-playfair italic text-lg md:text-xl">True identity of believers</strong> as Sons and Daughters of God the Father, releasing joy, healing, and freedom from every bondage.
                                </p>

                                <div className="pt-2 flex items-center gap-2 text-xs font-mono tracking-wider text-amber-400/80">
                                    <span>✦</span>
                                    <span>LUKE 4:18 • JOHN 8:36</span>
                                </div>
                            </div>
                        </div>

                        {/* Vision Card 02 — Kingdom Dominion */}
                        <div className="gsap-vision-card group relative p-8 md:p-10 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] via-white/[0.03] to-transparent backdrop-blur-xl hover:border-amber-400/50 hover:shadow-[0_0_50px_rgba(245,158,11,0.2)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden">
                            {/* Ambient Card Glow on Hover */}
                            <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl group-hover:bg-amber-400/20 transition-colors duration-500 pointer-events-none" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                                        <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
                                    </div>
                                    <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-400/70 font-mono">
                                        PILLAR 02
                                    </span>
                                </div>

                                <h3 className="text-2xl md:text-3xl font-light text-white tracking-tight">
                                    To <span className="font-playfair italic font-normal text-amber-300">Reign and Equip</span>
                                </h3>

                                <p className="text-base md:text-lg text-neutral-300/90 font-light leading-relaxed">
                                    To equip disciples and leaders to <strong className="font-semibold text-white font-playfair italic text-lg md:text-xl">reign in every sphere of life</strong> through the supernatural wisdom, character, and power of the Holy Spirit.
                                </p>

                                <div className="pt-2 flex items-center gap-2 text-xs font-mono tracking-wider text-amber-400/80">
                                    <span>✦</span>
                                    <span>ROMANS 5:17 • 2 TIMOTHY 3:17</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* TRENDING WORSHIP — Bento Grid                                  */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {trending.length > 0 && (
                <section id="trending" className="py-12 md:py-16 px-6 md:px-12 max-w-7xl mx-auto space-y-8">
                    <div className="flex items-end justify-between gap-4">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/[0.05]">
                                <Music className="w-3 h-3 text-amber-400" />
                                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-amber-300/70">Now Trending</span>
                            </div>
                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extralight text-white tracking-tight">
                                Worship <span className="font-playfair italic font-normal bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">Songs</span>
                            </h2>
                        </div>
                        <LiquidButton
                            onClick={() => setMode('UTILITY')}
                            size="sm"
                            icon={<ArrowRight className="w-3.5 h-3.5" />}
                            iconPosition="right"
                            className="hidden md:inline-flex"
                        >
                            View All
                        </LiquidButton>
                    </div>

                    {/* Horizontal Scroll Songs (desktop) / Grid (mobile) */}
                    <div className="gsap-songs-hscroll flex gap-4 md:gap-5 will-change-transform">
                        {trending.slice(0, 8).map((song, i) => (
                            <Link
                                key={i}
                                href={`/songs/${generateSlug(song.title)}`}
                                className={`gsap-bento-song group relative rounded-2xl overflow-hidden flex flex-col justify-end border border-white/[0.06] hover:border-white/15 transition-all duration-500 flex-shrink-0 ${i === 0 ? 'w-[85vw] md:w-[420px] min-h-[300px] md:min-h-[420px]' : 'w-[42vw] md:w-[280px] min-h-[220px] md:min-h-[320px]'
                                    }`}
                            >
                                <img
                                    src={getSongImage(song)}
                                    alt={song.title}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    style={{ filter: 'brightness(0.45) saturate(0.9)' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                <div className="relative z-10 p-4 md:p-6 space-y-1.5">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500 text-black inline-block ${i === 0 ? 'text-[10px] px-2.5 py-1' : ''}`}>
                                        #{i + 1}
                                    </span>
                                    <h3 className={`font-bold text-white leading-tight truncate ${i === 0 ? 'text-lg md:text-2xl' : 'text-sm md:text-base'}`}>
                                        {song.title}
                                    </h3>
                                    <p className={`text-neutral-400 truncate ${i === 0 ? 'text-sm' : 'text-[11px]'}`}>{song.artist}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}


            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* GOD STORIES — Ultra-Premium Sanctuary Testimony Showcase       */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="stories" className="relative py-12 md:py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-6 md:space-y-8 overflow-hidden">
                {/* Heavenly Ambient Glow Behind Stories */}
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[650px] h-[450px] bg-amber-500/[0.05] rounded-full blur-[160px] pointer-events-none" />
                <div className="absolute -bottom-10 right-10 w-[450px] h-[350px] bg-rose-500/[0.03] rounded-full blur-[140px] pointer-events-none" />

                {/* Section Header */}
                <div id="stories-header" className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                            <Heart className="w-3.5 h-3.5 text-amber-400 fill-amber-400/40 animate-pulse" />
                            <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-300">Testimonies of Faith</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extralight text-white tracking-tight leading-[1.08]">
                            God <span className="font-playfair italic font-normal bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">Stories</span>
                        </h2>
                        <p className="text-sm md:text-base text-neutral-400 font-light max-w-xl leading-relaxed">
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
                            variant="glass"
                            icon={<ArrowRight className="w-3.5 h-3.5" />}
                            iconPosition="right"
                        >
                            All Stories
                        </LiquidButton>
                    </div>
                </div>

                {/* 3D Circular Testimonial Carousel Showcase */}
                <div className="relative pt-2 pb-2">
                    <CircularTestimonials
                        testimonials={testimonialsData}
                        autoplay={true}
                        colors={{
                            name: "#ffffff",
                            designation: "#fbbf24",
                            testimony: "#e5e7eb",
                            arrowBackground: "rgba(255, 255, 255, 0.08)",
                            arrowForeground: "#ffffff",
                            arrowHoverBackground: "#f59e0b"
                        }}
                    />
                </div>
            </section>


            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SHARE TESTIMONY — Ultra-Luxury Sanctuary Encounter Banner       */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="testimony" className="relative py-12 md:py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
                {/* Outer Glass Sanctuary Container Card */}
                <div className="relative rounded-3xl sm:rounded-[2.5rem] border border-amber-500/20 bg-gradient-to-b from-white/[0.05] via-[#080417]/85 to-[#02000F] backdrop-blur-2xl p-6 sm:p-10 md:p-14 overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
                    
                    {/* Background Sanctuary Worshipper with Warm Golden Hue */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/images/testimony-bg.jpg"
                            alt="Worship and Prayer"
                            className="gsap-curtain-img w-full h-full object-cover"
                            style={{ filter: 'brightness(0.24) saturate(0.85)' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#02000F] via-[#02000F]/90 to-[#02000F]/60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#02000F] via-transparent to-transparent" />
                    </div>

                    {/* Ambient Golden Halo Glows */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/[0.12] rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-500/[0.08] rounded-full blur-[120px] pointer-events-none" />
                    
                    {/* Top Golden Accent Line */}
                    <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

                    <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                        
                        {/* Left: Typography, Impact, and Interactive CTAs */}
                        <div className="lg:col-span-7 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                <span className="text-xs font-bold tracking-[0.25em] uppercase text-amber-300">Your Story Has Power</span>
                            </div>

                            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extralight text-white tracking-tight leading-[1.08]">
                                Share Your{' '}
                                <br />
                                <span className="font-playfair italic font-normal bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                                    Miracle & Faith
                                </span>
                            </h2>

                            <p className="text-sm md:text-base text-neutral-300/90 font-light leading-relaxed max-w-xl">
                                &ldquo;They triumphed over him by the blood of the Lamb and by the word of their testimony.&rdquo; (Rev 12:11).
                                Your breakthrough is living proof that Jesus Christ is moving with power today. Speak of His goodness and ignite someone else&apos;s faith.
                            </p>

                            {/* Trust & Impact Highlights */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                                <div className="flex items-center gap-2 text-xs text-neutral-300 font-light">
                                    <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-2.5 h-2.5" />
                                    </div>
                                    <span>Pastoral Verification</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-300 font-light">
                                    <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-2.5 h-2.5" />
                                    </div>
                                    <span>Global Inspiration</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-neutral-300 font-light">
                                    <div className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-2.5 h-2.5" />
                                    </div>
                                    <span>100% Confidential</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                                <LiquidButton
                                    href="/share-testimony"
                                    size="lg"
                                    variant="amber"
                                    icon={<ArrowRight className="w-4 h-4" />}
                                    iconPosition="right"
                                >
                                    Submit Your Testimony
                                </LiquidButton>
                                <LiquidButton
                                    href="/god-stories"
                                    size="lg"
                                    variant="glass"
                                    icon={<ArrowRight className="w-4 h-4" />}
                                    iconPosition="right"
                                >
                                    Read God Stories
                                </LiquidButton>
                            </div>
                        </div>

                        {/* Right: Glassmorphism Miracle Counters & Helpline */}
                        <div className="lg:col-span-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                {[
                                    {
                                        num: '500+',
                                        count: 500,
                                        suffix: '+',
                                        label: 'Testimonies Shared',
                                        sub: 'Documented Miracles',
                                        icon: Sparkles
                                    },
                                    {
                                        num: '25+',
                                        count: 25,
                                        suffix: '+',
                                        label: 'Cities Reached',
                                        sub: 'Across 6+ Nations',
                                        icon: MapPin
                                    },
                                    {
                                        num: '10K+',
                                        count: 10000,
                                        suffix: '+',
                                        label: 'Lives Touched',
                                        sub: 'Supernatural Grace',
                                        icon: Heart
                                    },
                                    {
                                        num: '12+',
                                        count: 12,
                                        suffix: '+',
                                        label: 'Years of Ministry',
                                        sub: 'Unbroken Glory',
                                        icon: Flame
                                    },
                                ].map((stat, i) => {
                                    const IconComp = stat.icon;
                                    return (
                                        <div
                                            key={i}
                                            className="group relative p-4.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-[#040212]/90 border border-white/10 hover:border-amber-400/50 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(245,158,11,0.18)] overflow-hidden flex flex-col justify-between"
                                        >
                                            {/* Golden Ambient Corner Flare */}
                                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/25 transition-all duration-500 pointer-events-none" />
                                            
                                            {/* Top Icon & Dot */}
                                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300 shadow-sm">
                                                    <IconComp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/50 group-hover:bg-amber-400 transition-colors" />
                                            </div>

                                            {/* Stat Number & Descriptions */}
                                            <div>
                                                <p
                                                    className={`text-2xl sm:text-3xl md:text-4xl font-extralight text-white font-mono tracking-tight group-hover:text-amber-200 transition-colors ${stat.count ? 'gsap-stat-number' : ''}`}
                                                    data-count={stat.count || undefined}
                                                    data-suffix={stat.suffix || undefined}
                                                >
                                                    {stat.num}
                                                </p>
                                                <p className="text-[11px] font-bold tracking-wider uppercase text-neutral-300 mt-1">
                                                    {stat.label}
                                                </p>
                                                <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                                                    {stat.sub}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pastoral Helpline / Prayer Support Card */}
                            <div className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-white/[0.03] to-white/[0.01] border border-amber-500/20 backdrop-blur-md flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 flex-shrink-0">
                                        <Phone className="w-4 h-4 text-amber-400 animate-pulse" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-white tracking-wide">
                                            Need Prayer With Your Story?
                                        </p>
                                        <p className="text-[10px] sm:text-[11px] text-neutral-400 font-light">
                                            24/7 Pastoral Care is ready to stand in faith with you.
                                        </p>
                                    </div>
                                </div>
                                <LiquidButton
                                    href="/contact"
                                    size="sm"
                                    icon={<ArrowRight className="w-3 h-3" />}
                                    iconPosition="right"
                                    className="flex-shrink-0 !py-1.5 !px-3 text-[11px]"
                                >
                                    Connect
                                </LiquidButton>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* WORSHIP PORTAL CTA — Playfair & Amber Gradient                */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="worship-cta" className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="relative rounded-[24px] overflow-hidden border border-amber-500/10">
                    {/* BG */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-[#02000F] to-amber-950/10" />
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-amber-500/[0.03] rounded-full blur-[150px] pointer-events-none" />

                    <div className="relative z-10 p-8 md:p-14 grid grid-cols-1 md:grid-cols-5 gap-10 items-center">
                        {/* Left (3 cols) */}
                        <div className="md:col-span-3 space-y-5">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center">
                                <Music className="w-6 h-6 text-amber-400" />
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extralight text-white tracking-tight">
                                Worship <span className="font-playfair italic font-normal bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">Chords & Lyrics</span>
                            </h2>
                            <p className="text-sm text-neutral-400 font-light max-w-xl leading-relaxed">
                                Access hundreds of worship songs with guitar chords, lyrics, and key transposer — in Hindi & English. Built for worship leaders, musicians, and singers.
                            </p>
                            <LiquidButton
                                onClick={() => setMode('UTILITY')}
                                size="lg"
                                variant="amber"
                                icon={<ArrowRight className="w-4 h-4" />}
                                iconPosition="right"
                            >
                                Enter Worship Portal
                            </LiquidButton>
                        </div>

                        {/* Right (2 cols) — Feature list */}
                        <div className="md:col-span-2 space-y-3">
                            {['Guitar Chords & Tabs', 'Key Transposer', 'Hindi & English Lyrics', 'Chord Diagrams', 'Dark & Light Mode'].map((f, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    <span className="text-xs font-medium text-neutral-300">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* AUDIO PODCASTS                                                */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="podcasts" className="relative py-28 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-violet-600/[0.02] rounded-full blur-[200px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/[0.02] rounded-full blur-[200px] pointer-events-none" />
                <div className="starfield opacity-30" />

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/[0.05]">
                        <Headphones className="w-3 h-3 text-violet-400" />
                        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-violet-300/70">Listen Anywhere</span>
                    </div>
                    <h2 className="text-4xl sm:text-6xl md:text-8xl font-extralight text-white tracking-tight">
                        Audio <span className="font-playfair italic font-normal">Podcasts</span>
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4">
                        {[
                            { top: 'Listen on', name: 'Spotify', icon: '🎵' },
                            { top: 'Listen on', name: 'Apple Music', icon: '🎧' },
                            { top: 'Listen on', name: 'Amazon', icon: '📻' },
                            { top: 'COJ', name: 'Podcasts', icon: '🎙️' },
                        ].map((p, i) => (
                            <a
                                key={i}
                                href="#"
                                className="gsap-podcast-card group flex flex-col items-center justify-center gap-1.5 px-4 py-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300"
                            >
                                <span className="text-2xl mb-1">{p.icon}</span>
                                <p className="text-[9px] text-neutral-500 uppercase tracking-widest">{p.top}</p>
                                <p className="text-sm font-bold text-white group-hover:text-violet-200 transition-colors">{p.name}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* SOCIAL MEDIA                                                  */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="social" className="py-20 px-6 md:px-12 max-w-7xl mx-auto space-y-10">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/20 bg-pink-500/[0.05]">
                        <Instagram className="w-3 h-3 text-pink-400" />
                        <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-pink-300/70">Stay Connected</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-extralight text-white tracking-tight">
                        Follow Us On <span className="font-playfair italic font-normal">Social Media</span>
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {[
                        { name: 'WhatsApp', sub: 'Join Channel', icon: MessageCircle, href: 'https://whatsapp.com/channel/0029VaBFUhk9Guw4VxXqHI0m', accent: '#25D366', gradient: 'from-green-600/15' },
                        { name: 'Facebook', sub: '10K+ Followers', icon: Facebook, href: 'https://www.facebook.com/callofjesusministries', accent: '#1877F2', gradient: 'from-blue-600/15' },
                        { name: 'Youtube', sub: 'Watch Sermons', icon: Youtube, href: 'https://www.youtube.com/@callofjesusministries', accent: '#FF0000', gradient: 'from-red-600/15' },
                        { name: 'Instagram', sub: 'Daily Updates', icon: Instagram, href: 'https://www.instagram.com/callofjesusministries', accent: '#E4405F', gradient: 'from-pink-600/15' },
                    ].map((social, i) => (
                        <a
                            key={i}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`gsap-social-card gsap-tilt-card group relative rounded-2xl p-6 min-h-[200px] flex flex-col justify-between bg-gradient-to-br ${social.gradient} to-transparent bg-white/[0.01] border border-white/[0.06] hover:border-white/15 transition-all duration-500 hover:scale-[1.02] overflow-hidden`}
                        >
                            <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at bottom, ${social.accent}08, transparent)` }} />

                            <social.icon className="w-7 h-7 text-white/40 group-hover:text-white/70 transition-colors relative z-10" />
                            <div className="relative z-10">
                                <p className="text-lg font-bold text-white">{social.name}</p>
                                <p className="text-[10px] font-medium text-neutral-500 mt-0.5">{social.sub}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </section>


            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* NEWSLETTER                                                    */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <section id="newsletter" className="py-16 px-6 md:px-12 max-w-4xl mx-auto">
                <div className="text-center space-y-6">
                    <h3 className="text-2xl sm:text-3xl font-extralight text-white">
                        Stay Updated with <span className="font-playfair italic">COJ</span>
                    </h3>
                    <p className="text-xs text-neutral-500 max-w-md mx-auto">
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
                        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                    >
                        <input name="email" type="email" placeholder="Enter your email" className="flex-1 px-5 py-3.5 rounded-full bg-white/[0.04] border border-white/10 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.06] transition-all" />
                        <LiquidButton
                            type="submit"
                            size="md"
                            variant="glass"
                            className="flex-shrink-0"
                        >
                            Subscribe
                        </LiquidButton>
                    </form>
                </div>
            </section>


            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* FOOTER — Ultra-Luxury Architectural Footer                    */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <footer className="relative border-t border-white/[0.08] pt-16 sm:pt-20 pb-12 px-4 sm:px-6 md:px-12 bg-[#02000F] text-white overflow-hidden">
                {/* Ambient Golden Top Glow */}
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/35 to-transparent" />
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[160px] bg-amber-500/[0.07] rounded-full blur-[110px] pointer-events-none" />

                <div className="max-w-7xl mx-auto">
                    {/* Top Section: Brand Block + Links Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-12">
                        {/* Brand Column */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 p-1.5 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.18)]">
                                    <BlackRemoverImage src="/images/logo-footer-final.png" alt="COJ Logo" threshold={80} className="w-full h-full object-contain" />
                                </div>
                                <div>
                                    <h4 className="text-base font-black tracking-wider text-white uppercase font-sans">CALL OF JESUS</h4>
                                    <p className="text-[10px] font-bold text-amber-400 tracking-[0.35em] uppercase">MINISTRIES</p>
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm">
                                A spiritual home for every believer. Proclaiming the New Covenant Gospel of Grace, supernatural breakthrough, and raising radical lovers of Jesus worldwide.
                            </p>
                            {/* Social Buttons */}
                            <div className="flex items-center gap-2.5 pt-1">
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
                                        className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/10 active:scale-95 transition-all duration-300 shadow-sm"
                                    >
                                        <s.icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Columns (2-col on mobile, 4-col on tablet/desktop) */}
                        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                            {/* Kingdom */}
                            <div className="space-y-3.5">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400 flex items-center gap-1.5">
                                    <span>Kingdom</span>
                                </h4>
                                <ul className="space-y-2 text-xs sm:text-sm text-neutral-400">
                                    <li><Link href="/give" className="hover:text-white transition-colors">Give / Partner</Link></li>
                                    <li><Link href="/share-testimony" className="hover:text-white transition-colors">Share Testimony</Link></li>
                                    <li><Link href="/contact" className="hover:text-white transition-colors">Connect with Us</Link></li>
                                    <li><Link href="/events" className="hover:text-white transition-colors">Special Services</Link></li>
                                </ul>
                            </div>

                            {/* Grow */}
                            <div className="space-y-3.5">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400 flex items-center gap-1.5">
                                    <span>Grow</span>
                                </h4>
                                <ul className="space-y-2 text-xs sm:text-sm text-neutral-400">
                                    <li><Link href="/sermons" className="hover:text-white transition-colors">Sermons Archive</Link></li>
                                    <li><Link href="/god-stories" className="hover:text-white transition-colors">Miracle Stories</Link></li>
                                    <li><Link href="/devotional" className="hover:text-white transition-colors">Daily Devotionals</Link></li>
                                    <li><Link href="/podcasts" className="hover:text-white transition-colors">Audio Teachings</Link></li>
                                </ul>
                            </div>

                            {/* About */}
                            <div className="space-y-3.5">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400 flex items-center gap-1.5">
                                    <span>About Us</span>
                                </h4>
                                <ul className="space-y-2 text-xs sm:text-sm text-neutral-400">
                                    <li><Link href="/our-journey" className="hover:text-white transition-colors">Our Journey</Link></li>
                                    <li><Link href="/our-vision-and-mission" className="hover:text-white transition-colors">Vision & Mission</Link></li>
                                    <li><Link href="/our-leaders" className="hover:text-white transition-colors">Our Leaders</Link></li>
                                    <li><Link href="/our-branches" className="hover:text-white transition-colors">Our Branches</Link></li>
                                </ul>
                            </div>

                            {/* Worship Resources */}
                            <div className="space-y-3.5">
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400 flex items-center gap-1.5">
                                    <span>Worship</span>
                                </h4>
                                <ul className="space-y-2 text-xs sm:text-sm text-neutral-400">
                                    <li><button onClick={() => setMode('UTILITY')} className="hover:text-white transition-colors text-left">Worship Portal</button></li>
                                    <li><Link href="/songs" className="hover:text-white transition-colors">Songs Catalog</Link></li>
                                    <li><Link href="/tools/tuner" className="hover:text-white transition-colors">Guitar Tuner</Link></li>
                                    <li><Link href="/tools/pad" className="hover:text-white transition-colors">Worship Pads</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Middle Section: 3 Luxury Info & Gathering Cards */}
                    <div className="border-t border-white/[0.06] pt-8 pb-8 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                        {/* Card 1: Email */}
                        <a
                            href="mailto:contact@callofjesus.in"
                            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-amber-500/30 flex items-center gap-3.5 transition-all group shadow-sm"
                        >
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Direct Inquiries</p>
                                <p className="text-xs sm:text-sm text-white font-medium group-hover:text-amber-300 transition-colors">contact@callofjesus.in</p>
                            </div>
                        </a>

                        {/* Card 2: Church Location */}
                        <a
                            href="https://maps.app.goo.gl/U6Unh6WEcAdbp89K6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-amber-500/30 flex items-center gap-3.5 transition-all group shadow-sm"
                        >
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Church Arena</p>
                                <p className="text-xs sm:text-sm text-white font-medium flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                                    <span>Get Maps Directions</span>
                                    <Navigation className="w-3 h-3 text-amber-400" />
                                </p>
                            </div>
                        </a>

                        {/* Card 3: Gatherings */}
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3.5 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                                <Clock className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Weekly Gatherings</p>
                                <p className="text-xs sm:text-sm text-white font-medium">Sun 10:30 AM IST • Fri 7:00 PM IST</p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Legal & Copyright Bar */}
                    <div className="border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-3">
                        <p>© {new Date().getFullYear()} Call of Jesus Ministries. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                            <span className="w-1 h-1 rounded-full bg-neutral-700" />
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                            <span className="w-1 h-1 rounded-full bg-neutral-700" />
                            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                        </div>
                    </div>
                </div>
            </footer>


            {/* BACK TO TOP */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-2xl ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                aria-label="Scroll to top"
            >
                <ArrowUp className="w-4 h-4 text-white" />
            </button>

        </div>
    );
}
