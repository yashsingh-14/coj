'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';
import HomeUtilityContent from '@/components/home/HomeUtilityContent';
import ExperienceOverlay from '@/components/hero/ExperienceOverlay';
import LiveSermonBanner from '@/components/home/LiveSermonBanner';

export default function HomeManager({ initialData }: {
    initialData: {
        trending: any[];
        madeForYou: any[];
        featured: any[];
        heroSlides: any[];
        todaysVerse: any;
        announcements: any[];
        events?: any[];
    }
}) {
    const mode = useAppStore(state => state.mode);
    const setMode = useAppStore(state => state.setMode);
    const [showExperience, setShowExperience] = useState(true);

    useEffect(() => {
        // Reset mode to EXPERIENCE whenever homepage mounts
        setMode('EXPERIENCE');
    }, [setMode]);

    useEffect(() => {
        if (mode === 'UTILITY') {
            const timer = setTimeout(() => setShowExperience(false), 1000); // Match transition duration
            return () => clearTimeout(timer);
        } else {
            setShowExperience(true);
        }
    }, [mode]);

    return (
        <div className="relative w-full bg-[var(--background)]">
            {/* LIVE SERMON FLOATING BANNER - visible across both modes */}
            {mode === 'EXPERIENCE' && (
                <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:bottom-6 md:max-w-sm">
                    <LiveSermonBanner />
                </div>
            )}

            {showExperience && (
                <div
                    className={`relative w-full min-h-screen z-20 transition-opacity duration-1000 ease-in-out bg-[var(--background)] overflow-x-hidden ${mode === 'EXPERIENCE' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none hidden'}`}
                >
                    <ExperienceOverlay initialData={initialData} />
                </div>
            )}

            {/* Utility Mode Content */}
            <div
                className={`w-full min-h-screen bg-[var(--background)] transition-opacity duration-1000 ease-in-out ${mode === 'UTILITY' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none hidden'
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
