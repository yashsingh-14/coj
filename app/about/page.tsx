import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#02000F] text-white relative overflow-hidden">
            {/* Simple Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand)]/10 to-transparent pointer-events-none"></div>

            <div className="sticky top-0 z-20 p-6 flex items-center gap-4">
                <Link href="/" className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all group">
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">About COJ</h1>
            </div>

            <div className="container mx-auto px-6 pt-4 pb-32 max-w-3xl space-y-12">
                {/* Hero Text */}
                <section className="text-center py-10">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Raising a Generation<br />in Spirit & Truth
                    </h2>
                    <p className="text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
                        Call of Jesus Ministries operates at the intersection of faith, music, and technology. We believe in creating immersive experiences that lead people into profound encounters with God.
                    </p>
                </section>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <h3 className="text-xl font-bold text-[var(--brand)] mb-4">Our Vision</h3>
                        <p className="text-white/70 leading-relaxed">
                            To see every nation, tribe, and tongue united in worship, empowered by the Holy Spirit to transform their communities.
                        </p>
                    </div>
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-[var(--brand)] to-[#BF360C] text-white shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Join Us This Sunday</h3>
                        <ul className="space-y-3 font-medium">
                            <li className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-white"></span>
                                9:00 AM — Morning Glory
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-white"></span>
                                11:00 AM — Main Service
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
