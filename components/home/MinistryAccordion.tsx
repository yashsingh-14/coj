'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

interface MinistryItem {
    id: number;
    title: string;
    tagline: string;
    scripture: string;
    imageUrl: string;
}

const MINISTRIES: MinistryItem[] = [
    {
        id: 1,
        title: 'Healing & Deliverance',
        tagline: 'Miracles, breakthrough & supernatural freedom',
        scripture: 'Isaiah 53:5',
        imageUrl: '/images/stories/story-1.webp',
    },
    {
        id: 2,
        title: 'Next-Gen Revival',
        tagline: 'Empowering youth with Holy Spirit fire & purpose',
        scripture: '1 Timothy 4:12',
        imageUrl: '/images/stories/story-2.webp',
    },
    {
        id: 3,
        title: 'Prophetic Worship',
        tagline: 'An atmosphere where heaven touches earth in song',
        scripture: 'John 4:24',
        imageUrl: '/images/stories/story-3.webp',
    },
    {
        id: 4,
        title: 'Sisterhood & Family',
        tagline: 'Restoring hearts, marriages, and godly families',
        scripture: 'Joshua 24:15',
        imageUrl: '/images/stories/story-4.webp',
    },
    {
        id: 5,
        title: 'Word & Celebration',
        tagline: 'Deep apostolic preaching, fellowship & communion',
        scripture: 'Romans 10:17',
        imageUrl: '/images/stories/story-5.webp',
    },
];

const AccordionStrip = ({
    item,
    isActive,
    onActivate,
}: {
    item: MinistryItem;
    isActive: boolean;
    onActivate: () => void;
}) => {
    return (
        <div
            onClick={onActivate}
            onMouseEnter={onActivate}
            className={`
                relative h-[380px] sm:h-[440px] md:h-[480px] rounded-2xl overflow-hidden cursor-pointer
                transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] shrink-0 select-none border border-white/10
                ${isActive
                    ? 'w-[230px] sm:w-[300px] md:w-[360px] lg:w-[400px] ring-1 ring-amber-400/40 shadow-[0_10px_40px_rgba(245,158,11,0.2)]'
                    : 'w-[46px] sm:w-[56px] md:w-[64px] hover:border-white/25 opacity-75 hover:opacity-100'
                }
            `}
        >
            {/* Background Image */}
            <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 300px, 450px"
                className={`absolute inset-0 object-cover transition-transform duration-1000 ease-out ${
                    isActive ? 'scale-105' : 'scale-100'
                }`}
            />

            {/* Cinematic Gradient Overlays for High Legibility */}
            <div
                className={`absolute inset-0 bg-gradient-to-t from-[#07060A]/95 via-[#07060A]/40 to-black/30 transition-opacity duration-500 ${
                    isActive ? 'opacity-90' : 'opacity-70'
                }`}
            />
            {isActive && (
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.18)_0%,transparent_65%)] pointer-events-none" />
            )}

            {/* Active Content: Appears horizontally when strip expands */}
            {isActive ? (
                <div className="absolute inset-0 p-5 sm:p-7 flex flex-col justify-end text-left z-10 animate-fade-in">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-[10px] font-space font-semibold uppercase tracking-widest text-amber-300 w-fit mb-3 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        <span>{item.scripture}</span>
                    </div>

                    <h3 className="font-serif font-bold text-xl sm:text-2xl md:text-3xl text-white tracking-tight leading-tight mb-2 drop-shadow-md">
                        {item.title}
                    </h3>

                    <p className="font-space text-xs sm:text-sm text-white/75 font-light leading-relaxed mb-4 line-clamp-2 drop-shadow">
                        {item.tagline}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300 group-hover:text-amber-200">
                        <span>Experience Presence</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            ) : (
                /* Collapsed Caption: Rotated vertically for sleek editorial column */
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="text-white/80 font-serif font-semibold text-xs sm:text-sm md:text-base whitespace-nowrap tracking-wider rotate-90 drop-shadow uppercase">
                        {item.title}
                    </span>
                </div>
            )}
        </div>
    );
};

export default function MinistryAccordion() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section
            id="ministries"
            className="perf-section relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden bg-[#07060A] text-white font-space select-none"
        >
            {/* Seamless Top & Bottom Fades */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-b from-[#07060A] to-transparent z-10" />
            <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 sm:h-40 bg-gradient-to-t from-[#07060A] to-transparent z-10" />

            {/* Ambient Sanctuary Aura Glow */}
            <div className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 w-64 sm:w-96 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.16)_0%,transparent_70%)] blur-3xl transform-gpu" />
            <div className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 w-64 sm:w-96 h-[80%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.14)_0%,transparent_70%)] blur-3xl transform-gpu" />

            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
                    {/* Left Column: Editorial Heading & Context */}
                    <div className="w-full lg:w-5/12 text-center lg:text-left space-y-5 reveal-from-right">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
                            <span>✦ Sacred Pillars ✦</span>
                        </div>

                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-white leading-[1.08]">
                            Ministries of{' '}
                            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-[#FF5A2E]">
                                Fire & Grace
                            </span>
                        </h2>

                        <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-lg mx-auto lg:mx-0">
                            Discover the heartbeats of Call of Jesus Ministries — where faith is activated, the broken are restored, and generations encounter the living God.
                        </p>

                        <div className="pt-2">
                            <Link
                                href="#gatherings"
                                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-400/40 text-amber-300 hover:text-white text-xs sm:text-sm font-medium tracking-wider uppercase transition-all duration-300 shadow-lg hover:shadow-amber-500/10 active:scale-95"
                            >
                                <span>Join A Gathering</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Interactive Expanding Strips */}
                    <div className="w-full lg:w-7/12 flex justify-center lg:justify-end reveal-from-right reveal-delay-1">
                        <div className="flex flex-row items-center gap-2 sm:gap-3 overflow-x-auto p-2 sm:p-3 hide-scrollbar max-w-full">
                            {MINISTRIES.map((item, index) => (
                                <AccordionStrip
                                    key={item.id}
                                    item={item}
                                    isActive={index === activeIndex}
                                    onActivate={() => setActiveIndex(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
