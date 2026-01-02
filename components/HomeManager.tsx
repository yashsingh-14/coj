'use client';

import { useAppStore } from '@/store/useAppStore';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import HomeUtilityContent from '@/components/home/HomeUtilityContent';

// Dynamically import 3D canvas to avoid SSR issues
const HeroCanvas = dynamic(() => import('@/components/3d/HeroCanvas'), { ssr: false });
import ExperienceOverlay from '@/components/hero/ExperienceOverlay';

export default function HomeManager({ initialData }: {
    initialData: {
        trending: any[];
        madeForYou: any[];
        featured: any[];
        heroSlides: any[];
        todaysVerse: any;
        announcements: any[];
    }
}) {
    const mode = useAppStore(state => state.mode);
    const setMode = useAppStore(state => state.setMode);
    const [showExperience, setShowExperience] = useState(mode === 'EXPERIENCE');



    useEffect(() => {
        if (mode === 'UTILITY') {
            const timer = setTimeout(() => setShowExperience(false), 1000); // Match transition duration
            return () => clearTimeout(timer);
        } else {
            setShowExperience(true);
        }
    }, [mode]);

    return (
        <div className="relative w-full min-h-screen overflow-hidden bg-[var(--background)]">
            {showExperience && (
                <div
                    className="absolute inset-0 z-10 transition-opacity duration-1000 ease-in-out"
                    style={{ opacity: mode === 'EXPERIENCE' ? 1 : 0, pointerEvents: mode === 'EXPERIENCE' ? 'auto' : 'none' }}
                >
                    <HeroCanvas />
                    <ExperienceOverlay />
                </div>
            )}

            {/* Utility Mode Content */}
            <div
                className={`absolute inset-0 w-full min-h-screen bg-[var(--background)] transition-opacity duration-1000 ease-in-out ${mode === 'UTILITY' ? 'opacity-100 overflow-y-auto pointer-events-auto' : 'opacity-0 overflow-hidden pointer-events-none'
                    }`}
            >
                <HomeUtilityContent
                    trendingSongs={initialData.trending}
                    madeForYouSongs={initialData.madeForYou}
                    featuredSongs={initialData.featured}
                    heroSlides={initialData.heroSlides}
                    dbVerse={initialData.todaysVerse}
                    announcements={initialData.announcements}
                />
            </div>
        </div>
    );
}
