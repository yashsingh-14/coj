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
        title: "Sister Surabhi - Healed from Incurable Disease",
        category: "Miracle Healing",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80",
        snippet: "Sister Surabhi underwent mandatory medical screenings after her internship. To her shock, initial reports came back reactive. Through intense prayer & covenant grace, her medical reports were completely turned around!",
        fullText: "Sister Surabhi, a medical student, underwent mandatory health checks. Initial reports showed alarming reactive results for an incurable disease. Frightened, she reached out for prayer during Friday prophetic service. Apostle and the pastoral team prayed for creative healing. A week later, repeated screenings at two top diagnostic centers came back 100% negative and completely clear! Praise Lord Jesus!"
    },
    {
        id: 2,
        title: "Creative Miracle: Complete Organ & Health Restoration",
        category: "Creative Miracle",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80",
        snippet: "After suffering chronic pain and surgical complications, supernatural prayer resulted in full restoration and instantaneous relief.",
        fullText: "Brother Amit suffered severe complications following a complex surgery. Doctors advised lifelong medication and warned of permanent dysfunction. During a worship service, power of God swept through the auditorium. He felt intense warmth and was completely delivered from all pain. Subsequent medical scans confirmed total anatomical restoration."
    },
    {
        id: 3,
        title: "Financial Breakthrough & Debt Freedom",
        category: "Financial Miracle",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80",
        snippet: "Facing crippling debt and business bankruptcy, obedience in tithing and prayer opened supernatural doors of supply.",
        fullText: "When faced with immense financial loss and impending legal trouble due to business debt, Brother Rajesh stood on God's word. Through covenant giving and prayer, unexpected global contracts were signed within 30 days, completely wiping out every financial burden."
    },
    {
        id: 4,
        title: "Delivered from Severe Anxiety & Depression",
        category: "Deliverance & Freedom",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80",
        snippet: "Overcoming 8 years of insomnia and panic attacks through the tangible presence of God.",
        fullText: "Sister Priya struggled with severe panic attacks and night terror for over eight years. Attending Call of Jesus Ministries service for the first time, she experienced the overwhelming love of God. The spirit of fear left her instantly, replaced by divine peace."
    }
];

export default function GodStoriesPage() {
    return (
        <main className="min-h-screen bg-black text-white py-24 px-6 md:px-12">
            <LandingNavbar />
            <div className="max-w-7xl mx-auto space-y-16 pt-12">
                
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Supernatural Breakthroughs
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                        GOD <span className="font-serif italic font-normal text-amber-300">Stories</span>
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-300 font-light leading-relaxed">
                        Read how the power, grace, and victory of Lord Jesus Christ is setting captives free and creating supernatural miracles every single day.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {storiesData.map((story) => (
                        <div
                            key={story.id}
                            className="rounded-3xl bg-neutral-900/80 border border-white/15 overflow-hidden flex flex-col justify-between hover:border-amber-400/40 transition-all shadow-2xl"
                        >
                            <div className="relative h-64 w-full">
                                <Image
                                    src={story.image}
                                    alt={story.title}
                                    fill
                                    unoptimized
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
                                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
                                    {story.category}
                                </span>
                            </div>

                            <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
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

                <div className="rounded-3xl bg-gradient-to-r from-neutral-900 via-amber-950/40 to-neutral-900 border border-white/20 p-10 text-center space-y-6">
                    <HeartHandshake className="w-12 h-12 text-amber-400 mx-auto" />
                    <h2 className="text-3xl md:text-4xl font-bold">Have a Breakthrough to Share?</h2>
                    <p className="text-neutral-300 max-w-xl mx-auto">
                        Your testimony can ignite faith in someone&apos;s heart! Let us magnify Jesus together.
                    </p>
                    <Link
                        href="/share-testimony"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold text-base hover:bg-neutral-200 transition-all shadow-xl"
                    >
                        <span>Share Your Story</span>
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

            </div>
        </main>
    );
}
