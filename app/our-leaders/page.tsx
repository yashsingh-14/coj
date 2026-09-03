import LandingNavbar from '@/components/hero/LandingNavbar';
import { UserCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
    title: "Our Leaders | Call of Jesus Ministries",
    description: "Meet the pastoral leadership and ministry team at Call of Jesus Ministries."
};

const leaders = [
    {
        name: "Apostle & Senior Leadership",
        role: "Founding Ministers",
        bio: "Dedicated to preaching the uncompromised word of God and mentoring generation of worshipers.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80"
    },
    {
        name: "Worship & Media Team",
        role: "Creative Ministry",
        bio: "Leading thousands into prophetic worship and producing spirit-led music and digital resources.",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80"
    }
];

export default function OurLeadersPage() {
    return (
        <main className="min-h-screen bg-black text-white py-24 px-6 md:px-12">
            <LandingNavbar />
            <div className="max-w-4xl mx-auto space-y-16 pt-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                        <UserCheck className="w-4 h-4 text-amber-400" />
                        Leadership & Shepherds
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                        Our <span className="font-serif italic font-normal text-amber-300">Leaders</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {leaders.map((leader, i) => (
                        <div key={i} className="rounded-3xl bg-neutral-900 border border-white/15 overflow-hidden p-6 space-y-4 shadow-2xl">
                            <div className="relative h-64 w-full rounded-2xl overflow-hidden">
                                <Image src={leader.image} alt={leader.name} fill unoptimized className="object-cover" />
                            </div>
                            <div>
                                <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">{leader.role}</span>
                                <h3 className="text-2xl font-bold text-white mt-1">{leader.name}</h3>
                                <p className="text-neutral-300 text-sm mt-2 leading-relaxed">{leader.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
