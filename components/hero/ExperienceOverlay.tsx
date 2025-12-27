'use client';

import { useAppStore } from "@/store/useAppStore";
import Logo from "../ui/Logo";

export default function ExperienceOverlay() {
    const setMode = useAppStore((state) => state.setMode);

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">

            {/* Content Overlay */}
            <div className="text-center pointer-events-auto flex flex-col items-center -mt-20">
                {/* Logo Section */}
                <div className="mb-4 md:mb-8 flex flex-col items-center justify-center transform-style-3d animate-float-slow relative">
                    <Logo className="w-24 md:w-48 h-auto" />
                </div>

                {/* Verse Section */}
                <div className="mb-8 md:mb-12 relative group cursor-default max-w-[90vw] md:max-w-5xl mx-auto px-4">
                    {/* Glow effect */}
                    <span className="absolute -inset-8 bg-[#FF6D00]/10 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition duration-1000"></span>

                    {/* The Verse Text (Vachan) - Main Focus */}
                    <h2 className="relative text-2xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-2xl text-balance italic">
                        "Come to me, all you who are weary and burdened, <br className="hidden md:block" /> and I will give you rest."
                    </h2>

                    {/* The Reference (Small) */}
                    <p className="mt-4 text-[10px] md:text-sm font-bold tracking-[0.3em] uppercase text-[var(--brand)] opacity-90">
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
