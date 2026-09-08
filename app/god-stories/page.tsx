import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, HeartHandshake } from 'lucide-react';
import LandingNavbar from '@/components/hero/LandingNavbar';

export const metadata = {
    title: "God Stories & Testimonies | Call of Jesus Ministries",
    description: "Read supernatural healing, deliverance, and miracle testimonies of how Lord Jesus Christ is transforming lives daily at Call of Jesus Ministries."
};

const storiesData = [
    {
        id: 1,
        title: "Brother Rajesh - Cancer Healed at the Altar",
        category: "Miracle Healing",
        image: "/images/stories/story-1.webp",
        snippet: "Diagnosed with stage 3 cancer, faith moved mountains. Post-service PET scans showed zero cancer cells remaining!",
        fullText: "Diagnosed with stage 3 cancer, Brother Rajesh came to the Call of Jesus Ministries healing service with faith that moved mountains. After anointed prayer at the altar, repeated diagnostic screenings and post-service PET scans showed zero cancer cells remaining in his body! By His stripes, he is completely healed and alive to praise the Lord Jesus Christ."
    },
    {
        id: 2,
        title: "Youth Revival - Overcomers Conference Breakthrough",
        category: "Deliverance & Revival",
        image: "/images/stories/story-2.webp",
        snippet: "Hundreds of young lives delivered from addiction and depression as Holy Spirit swept the auditorium.",
        fullText: "During the Overcomers Youth Conference, hundreds of young lives were delivered from substance abuse, chronic depression, and suicidal ideation in a single anointed night. The tangible power of the Holy Spirit moved through the auditorium, restoring purpose, purity, and passion for God."
    },
    {
        id: 3,
        title: "Sister Priya & Worship Team - Delivered from Panic & Depression",
        category: "Inner Healing & Freedom",
        image: "/images/stories/story-3.webp",
        snippet: "Eight years of chronic panic attacks, sleepless nights, and fear shattered during prophetic corporate worship.",
        fullText: "For over eight years, Sister Priya battled debilitating panic attacks, sleepless night terrors, and severe anxiety. Stepping into corporate prophetic worship at Call of Jesus Ministries, every chain shattered. Jesus filled her soul with divine supernatural peace that surpasses all human understanding."
    },
    {
        id: 4,
        title: "Sisters Fellowship - Barren Wombs Blessed & Marriages Restored",
        category: "Prophetic Restoration",
        image: "/images/stories/story-4.webp",
        snippet: "Covenant prayer bringing breakthrough in barrenness, broken families, and terminal medical verdicts.",
        fullText: "During the annual Sisters Fellowship conference, God moved mightily among the daughters of the King. Barren sisters testified of healthy pregnancies, broken families received supernatural reconciliation, and reactive medical diagnoses were miraculously overturned."
    },
    {
        id: 5,
        title: "Brother Samuel - Supernatural Debt Clearance & Provision",
        category: "Financial Miracle",
        image: "/images/stories/story-5.webp",
        snippet: "Facing imminent bankruptcy and crippling debts, obedience and prayer opened supernatural financial doors.",
        fullText: "Standing on the absolute verge of total business bankruptcy with mounting debts, Brother Samuel anchored his soul on God's covenant promises. Within 90 days, unexpected supernatural contracts were signed and complete debt clearance took place. God supplied every single need exceedingly!"
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
                            <div className="relative h-52 sm:h-64 w-full">
                                <Image
                                    src={story.image}
                                    alt={story.title}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
                                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                                    {story.category}
                                </span>
                            </div>

                            <div className="p-5 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                                        {story.title}
                                    </h2>
                                    <p className="text-neutral-300 text-sm leading-relaxed">
                                        {story.fullText}
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
