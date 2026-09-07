import LandingNavbar from '@/components/hero/LandingNavbar';
import { Flame, Compass, Shield } from 'lucide-react';

export const metadata = {
    title: "Our Vision & Mission | Call of Jesus Ministries",
    description: "Learn about the mission, values, and vision of Call of Jesus Ministries."
};

export default function OurVisionAndMissionPage() {
    return (
        <main className="min-h-screen bg-black text-white py-16 sm:py-24 px-4 sm:px-6 md:px-12">
            <LandingNavbar />
            <div className="max-w-4xl mx-auto space-y-10 sm:space-y-16 pt-8 sm:pt-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                        <Flame className="w-4 h-4 text-amber-400" />
                        Kingdom Purpose
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight">
                        Vision & <span className="font-serif italic font-normal text-amber-300">Mission</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="rounded-2xl sm:rounded-3xl bg-neutral-900 border border-white/15 p-5 sm:p-8 space-y-4 shadow-2xl">
                        <Compass className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">Our Vision</h2>
                        <p className="text-neutral-300 text-sm leading-relaxed">
                            To unveil the true identity of believers as Sons and Daughters of God, setting captives free and transforming communities through intimate worship and prophetic truth.
                        </p>
                    </div>

                    <div className="rounded-2xl sm:rounded-3xl bg-neutral-900 border border-white/15 p-5 sm:p-8 space-y-4 shadow-2xl">
                        <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">Our Mission</h2>
                        <p className="text-neutral-300 text-sm leading-relaxed">
                            To equip worship leaders, release anointed music resources, establish vibrant gathering hubs, and proclaim the New Covenant gospel to all nations.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
