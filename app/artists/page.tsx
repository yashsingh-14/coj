'use client';

import Link from 'next/link';
import { ArrowLeft, Mic2, Music, TrendingUp, Users } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';
import { ALL_ARTISTS } from '@/data/artists';

export default function ArtistsPage() {
    return (
        <div className="min-h-screen bg-[#02000F] text-white p-6 pb-32">
            {/* Header */}
            <div className="flex items-center gap-4 mb-10 pt-4">
                <Link href="/" className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors group border border-white/5">
                    <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-amber-500 drop-shadow-lg">
                        Featured Artists
                    </h1>
                    <p className="text-white/60 font-medium tracking-wide">Voices leading the global church in worship</p>
                </div>
            </div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {ALL_ARTISTS.map((artist) => (
                    <TiltCard key={artist.id} className="h-full min-h-[350px]" max={10} scale={1.03}>
                        <div className="relative h-full group">
                            <Link
                                href={`/artists/${artist.id}`}
                                className="relative flex flex-col justify-end p-8 rounded-[2.5rem] bg-[#0A0A0A] border border-white/10 overflow-hidden h-full group-hover:bg-[#111] transition-colors shadow-2xl"
                            >
                                {/* Artist Background */}
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0" style={{ backgroundImage: `url('${artist.image}')` }} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                                {/* Glass Shine */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                {/* Icon Badge */}
                                <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                    <Mic2 className="w-6 h-6 text-white" />
                                </div>

                                {/* Content */}
                                <div className="relative z-10 transform-style-3d translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 mb-3">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">{artist.genre}</span>
                                    </div>

                                    <h2 className="text-3xl font-black text-white mb-2 leading-none">{artist.name}</h2>

                                    <div className="flex gap-4 text-xs font-bold text-white/60 mt-2">
                                        <span className="flex items-center gap-1.5"><Music className="w-3.5 h-3.5 text-amber-500" /> {artist.songs} Songs</span>
                                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-500" /> {artist.followers}</span>
                                    </div>

                                    {/* View Profile Button appearing on hover */}
                                    <div className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform translate-y-4 group-hover:translate-y-0">
                                        <div className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-center text-xs font-bold uppercase tracking-widest backdrop-blur-md transition-colors">
                                            View Profile
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </TiltCard>
                ))}
            </div>
        </div>
    );
}
