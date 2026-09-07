import LandingNavbar from '@/components/hero/LandingNavbar';
import { Sparkles, Calendar, Heart } from 'lucide-react';

export const metadata = {
    title: "Our Journey | Call of Jesus Ministries",
    description: "The story and history of Call of Jesus Ministries from humble beginnings to a global worship movement."
};

export default function OurJourneyPage() {
    return (
        <main className="min-h-screen bg-black text-white py-16 sm:py-24 px-4 sm:px-6 md:px-12">
            <LandingNavbar />
            <div className="max-w-4xl mx-auto space-y-10 sm:space-y-16 pt-8 sm:pt-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        His Faithfulness
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight">
                        Our <span className="font-serif italic font-normal text-amber-300">Journey</span>
                    </h1>
                    <p className="text-neutral-300 text-base sm:text-lg md:text-xl font-light">
                        From a small prayer gathering to raising thousands of radical worshipers around the world.
                    </p>
                </div>

                <div className="space-y-8 border-l-2 border-amber-500/30 pl-6 md:pl-10">
                    <div className="relative space-y-2">
                        <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-amber-400 border-4 border-black" />
                        <span className="text-xs font-mono text-amber-400 font-bold uppercase">The Inception</span>
                        <h2 className="text-2xl font-bold text-white">Humble Beginnings in Prayer</h2>
                        <p className="text-neutral-300 text-sm leading-relaxed">
                            Call of Jesus Ministries began with a passionate hunger for the presence of God. Starting in a living room prayer meeting, believers gathered weekly to seek the Holy Spirit and enter deep worship.
                        </p>
                    </div>

                    <div className="relative space-y-2">
                        <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-amber-400 border-4 border-black" />
                        <span className="text-xs font-mono text-amber-400 font-bold uppercase">Worship & Chords Movement</span>
                        <h2 className="text-2xl font-bold text-white">Empowering Musicians & Worshipers Globally</h2>
                        <p className="text-neutral-300 text-sm leading-relaxed">
                            Recognizing the need for anointed Hindi and English worship resources, COJ launched its online chords and lyrics platform, equipping worship leaders across India and worldwide.
                        </p>
                    </div>

                    <div className="relative space-y-2">
                        <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-amber-400 border-4 border-black" />
                        <span className="text-xs font-mono text-amber-400 font-bold uppercase">Today & Beyond</span>
                        <h2 className="text-2xl font-bold text-white">Raising Radical Lovers of Jesus</h2>
                        <p className="text-neutral-300 text-sm leading-relaxed">
                            Today, COJ Ministries continues to grow with weekly gatherings, healing services, media broadcasts, and thousands of monthly active worshipers on the digital portal.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
