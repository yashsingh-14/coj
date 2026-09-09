import LandingNavbar from '@/components/hero/LandingNavbar';
import { UserCheck, Heart, BookOpen, Music } from 'lucide-react';
import Image from 'next/image';

export const metadata = {
    title: "Our Leaders | Call of Jesus Ministries",
    description: "Meet Ps. Samson Wilson and the ministry team at Call of Jesus Ministries, Kalyan East."
};

const leaders = [
    {
        name: "Ps. Samson Wilson",
        role: "Senior Pastor & Founder",
        bio: "Pastor Samson Wilson is the founding minister of Call of Jesus Ministries. With a burning passion for the Gospel of Grace and the supernatural power of the Holy Spirit, he leads the congregation at Kalyan East with prophetic worship, powerful teaching, and a heart for the lost. Under his leadership, COJ Ministries has grown into a vibrant community of believers experiencing healing, deliverance, and transformation.",
        image: "/images/logo-footer-final.png",
        isLogo: true,
    },
];

const ministryTeams = [
    {
        title: "Worship & Media Ministry",
        icon: Music,
        description: "Leading the congregation into prophetic worship and producing spirit-led music, digital worship resources, and online chords & lyrics for worship leaders across India."
    },
    {
        title: "Teaching & Bible Study",
        icon: BookOpen,
        description: "Every Friday evening Bible Study empowers believers with the uncompromised Word of God, unlocking the New Covenant truths and equipping saints for daily victory."
    },
    {
        title: "Prayer & Intercession",
        icon: Heart,
        description: "The Prayer Line ministry (89283 94853) provides round-the-clock spiritual support, intercession, and prophetic counsel to those in need of breakthrough."
    }
];

export default function OurLeadersPage() {
    return (
        <main className="min-h-screen bg-black text-white py-16 sm:py-24 px-4 sm:px-6 md:px-12">
            <LandingNavbar />
            <div className="max-w-4xl mx-auto space-y-10 sm:space-y-16 pt-8 sm:pt-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                        <UserCheck className="w-4 h-4 text-amber-400" />
                        Leadership & Shepherds
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold tracking-tight">
                        Our <span className="font-serif italic font-normal text-amber-300">Leaders</span>
                    </h1>
                </div>

                {/* Senior Pastor */}
                <div className="max-w-2xl mx-auto">
                    {leaders.map((leader, i) => (
                        <div key={i} className="rounded-2xl sm:rounded-3xl bg-neutral-900 border border-white/15 overflow-hidden p-6 sm:p-8 space-y-5 shadow-2xl text-center">
                            <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-full bg-neutral-800 border-2 border-amber-500/30 flex items-center justify-center overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.15)]">
                                {leader.isLogo ? (
                                    <Image
                                        src={leader.image}
                                        alt={leader.name}
                                        width={120}
                                        height={120}
                                        className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                                    />
                                ) : (
                                    <Image src={leader.image} alt={leader.name} fill unoptimized className="object-cover" />
                                )}
                            </div>
                            <div>
                                <span className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-400 font-bold">{leader.role}</span>
                                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">{leader.name}</h3>
                                <p className="text-neutral-300 text-sm mt-3 leading-relaxed max-w-lg mx-auto">{leader.bio}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ministry Teams */}
                <div className="space-y-6">
                    <h2 className="text-center text-xl sm:text-2xl font-bold text-white/80">Ministry Teams</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        {ministryTeams.map((team, i) => (
                            <div key={i} className="rounded-2xl bg-neutral-900/80 border border-white/10 p-5 sm:p-6 space-y-3 hover:border-amber-500/30 transition-all">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                                    <team.icon className="w-5 h-5 text-amber-400" />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-white">{team.title}</h3>
                                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">{team.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
