import Link from 'next/link';
import { Sparkles, HeartHandshake, ArrowRight, BookOpen } from 'lucide-react';
import LandingNavbar from '@/components/hero/LandingNavbar';

export const metadata = {
    title: "God Stories & Testimonies | Call of Jesus Ministries",
    description: "Read supernatural healing, deliverance, and miracle testimonies of how Lord Jesus Christ is transforming lives at Call of Jesus Ministries, Kalyan East."
};

const storiesData = [
    {
        id: 1,
        title: "Cancer Healed — A Medical Miracle at the Altar",
        category: "Miracle Healing",
        snippet: "Diagnosed with stage 3 cancer, faith moved mountains. After anointed prayer at the altar, post-service PET scans showed zero cancer cells remaining. By His stripes, completely healed!",
    },
    {
        id: 2,
        title: "Youth Revival — Overcomers Conference Breakthrough",
        category: "Deliverance & Revival",
        snippet: "Hundreds of young lives were delivered from substance abuse, chronic depression, and suicidal ideation in a single anointed night. The tangible power of the Holy Spirit moved through the auditorium, restoring purpose and passion for God.",
    },
    {
        id: 3,
        title: "8 Years of Panic Attacks — Shattered by Worship",
        category: "Inner Healing & Freedom",
        snippet: "For over eight years of debilitating panic attacks, sleepless night terrors, and severe anxiety. Stepping into corporate prophetic worship at Call of Jesus Ministries, every chain shattered. Jesus filled the soul with divine supernatural peace.",
    },
    {
        id: 4,
        title: "Barren Wombs Blessed — Marriages Restored",
        category: "Prophetic Restoration",
        snippet: "During the Sisters Fellowship conference, God moved mightily. Barren sisters testified of healthy pregnancies, broken families received supernatural reconciliation, and terminal medical diagnoses were miraculously overturned.",
    },
    {
        id: 5,
        title: "Supernatural Debt Clearance & Financial Provision",
        category: "Financial Miracle",
        snippet: "Standing on the verge of total business bankruptcy with mounting debts, faith in God's covenant promises brought breakthrough. Within 90 days, unexpected contracts were signed and complete debt clearance took place!",
    }
];

export default function GodStoriesPage() {
    return (
        <main className="min-h-screen bg-black text-white py-16 sm:py-24 px-4 sm:px-6 md:px-12">
            <LandingNavbar />
            <div className="max-w-7xl mx-auto space-y-10 sm:space-y-16 pt-8 sm:pt-12">

                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Supernatural Breakthroughs
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight">
                        GOD <span className="font-serif italic font-normal text-amber-300">Stories</span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-neutral-300 font-light leading-relaxed">
                        Read how the power, grace, and victory of Lord Jesus Christ is setting captives free and creating supernatural miracles every single day.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    {storiesData.map((story) => (
                        <div
                            key={story.id}
                            className="rounded-2xl sm:rounded-3xl bg-neutral-900/80 border border-white/15 overflow-hidden flex flex-col justify-between hover:border-amber-400/40 transition-all shadow-2xl"
                        >
                            {/* Icon Header instead of fake images */}
                            <div className="relative h-28 sm:h-36 w-full bg-gradient-to-br from-amber-900/30 via-neutral-900 to-neutral-900 flex items-center justify-center">
                                <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-amber-500/40" />
                                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                                    {story.category}
                                </span>
                            </div>

                            <div className="p-5 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-tight">
                                        {story.title}
                                    </h2>
                                    <p className="text-neutral-300 text-sm leading-relaxed">
                                        {story.snippet}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-amber-300 text-xs font-semibold">
                                    <span>Verified Testimony</span>
                                    <span>Call of Jesus Ministries</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-neutral-900 via-amber-950/40 to-neutral-900 border border-white/20 p-6 sm:p-10 text-center space-y-5 sm:space-y-6">
                    <HeartHandshake className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 mx-auto" />
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">Have a Breakthrough to Share?</h2>
                    <p className="text-neutral-300 text-sm sm:text-base max-w-xl mx-auto">
                        Your testimony can ignite faith in someone&apos;s heart! Let us magnify Jesus together.
                    </p>
                    <Link
                        href="/share-testimony"
                        className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white text-black font-bold text-sm sm:text-base hover:bg-neutral-200 transition-all shadow-xl"
                    >
                        <span>Share Your Story</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Link>
                </div>

            </div>
        </main>
    );
}
