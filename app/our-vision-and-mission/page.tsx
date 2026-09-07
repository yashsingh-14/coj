import LandingNavbar from '@/components/hero/LandingNavbar';
import { Flame, Compass, Shield } from 'lucide-react';

export const metadata = {
    title: "Our Vision & Mission | Call of Jesus Ministries",
    description: "Learn about the mission, values, and vision of Call of Jesus Ministries."
};

export default function OurVisionAndMissionPage() {
    return (
        <main className="min-h-screen bg-[#07060A] text-[#F4EDE2] font-space py-20 sm:py-28 px-4 sm:px-6 md:px-12 relative overflow-hidden">
            {/* Ambient Fire Glows */}
            <div className="absolute w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(255,90,46,0.25),transparent_70%)] blur-[90px] -top-24 -right-24 pointer-events-none z-0" />
            <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(110,91,255,0.18),transparent_70%)] blur-[90px] -bottom-20 -left-20 pointer-events-none z-0" />

            <LandingNavbar />

            <div className="max-w-5xl mx-auto space-y-12 sm:space-y-16 pt-12 sm:pt-16 relative z-10">
                {/* Header */}
                <div className="text-center space-y-5 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF5A2E]/10 border border-[#FF5A2E]/30 text-[#FF5A2E] text-xs font-semibold uppercase tracking-wider">
                        <Flame className="w-3.5 h-3.5 text-[#FF5A2E]" />
                        Divine Calling & Kingdom Mission
                    </div>
                    <h1 className="font-fraunces text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-[#F4EDE2]">
                        Our Vision & <span className="italic bg-gradient-to-r from-[#FFB37A] via-[#FF5A2E] to-[#C2361A] bg-clip-text text-transparent">Mission</span>
                    </h1>
                    <p className="text-[#C9C3D4] text-base sm:text-lg font-light leading-relaxed">
                        Commissioned by Jesus Christ to release supernatural freedom, royal identity, and revival to the nations through the Holy Spirit.
                    </p>
                </div>

                {/* Grid: Vision Pillars Rail & Mission Pillars */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                    {/* Vision Pillars Rail */}
                    <div className="rounded-3xl bg-[#0D0B12] border border-[#F4EDE2]/10 p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-3">
                            <Compass className="w-6 h-6 text-[#FF5A2E]" />
                            <h2 className="font-fraunces text-2xl sm:text-3xl font-medium text-[#F4EDE2]">Our Vision</h2>
                        </div>

                        <div className="relative pl-12 space-y-8">
                            {/* Rail */}
                            <div className="absolute left-[15px] top-[8px] bottom-[8px] w-[1px] bg-gradient-to-b from-[#FF5A2E] via-[#FF5A2E]/60 to-[#6E5BFF]/60" />

                            {/* Item 01 */}
                            <div className="relative">
                                <div className="absolute -left-12 top-0 w-8 h-8 rounded-full flex items-center justify-center font-fraunces text-xs italic bg-[#07060A] border border-[#FF5A2E]/40 text-[#FF5A2E]">
                                    01
                                </div>
                                <h3 className="font-fraunces text-lg sm:text-xl font-medium text-[#F4EDE2] mb-1.5">
                                    To <span className="italic text-[#FF5A2E]">set the captives</span> free
                                </h3>
                                <p className="text-sm text-[#B7B1C2] leading-relaxed mb-2 font-light">
                                    To unveil the <strong className="text-[#F4EDE2] font-semibold">true identity of believers</strong> as sons and daughters of God the Father — releasing joy, healing, and freedom from every bondage.
                                </p>
                                <div className="text-xs text-[#8A8496] space-x-3">
                                    <span>Luke 4:18</span>
                                    <span>John 8:36</span>
                                </div>
                            </div>

                            {/* Item 02 */}
                            <div className="relative">
                                <div className="absolute -left-12 top-0 w-8 h-8 rounded-full flex items-center justify-center font-fraunces text-xs italic bg-[#07060A] border border-[#6E5BFF]/40 text-[#6E5BFF]">
                                    02
                                </div>
                                <h3 className="font-fraunces text-lg sm:text-xl font-medium text-[#F4EDE2] mb-1.5">
                                    To <span className="italic text-[#6E5BFF]">reign and equip</span>
                                </h3>
                                <p className="text-sm text-[#B7B1C2] leading-relaxed mb-2 font-light">
                                    To equip disciples and leaders to <strong className="text-[#F4EDE2] font-semibold">reign in every sphere of life</strong> through the supernatural wisdom, character, and power of the Holy Spirit.
                                </p>
                                <div className="text-xs text-[#8A8496] space-x-3">
                                    <span>Romans 5:17</span>
                                    <span>2 Timothy 3:17</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mission Pillars */}
                    <div className="rounded-3xl bg-[#0D0B12] border border-[#F4EDE2]/10 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-[#FF5A2E]" />
                            <h2 className="font-fraunces text-2xl sm:text-3xl font-medium text-[#F4EDE2]">Our Mission</h2>
                        </div>

                        <div className="space-y-5 text-sm text-[#B7B1C2] leading-relaxed font-light">
                            <p>
                                To mobilize the body of Christ into apostolic maturity, establishing worship and prayer hubs that break demonic oppression across cities.
                            </p>
                            <p>
                                To release anointed resources, equip music leaders, and train ministers who carry the presence and power of Jesus Christ with integrity and excellence.
                            </p>
                            <p>
                                To herald revival in churches and college campuses, igniting an unshakeable passion for God's presence and His eternal Word.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
