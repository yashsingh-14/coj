import Link from 'next/link';
import { ArrowLeft, TrendingUp, Music2 } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 60;

export default async function TrendingPage() {
    // Fetch trending songs from database (ordered by created_at for now)
    const { data: trendingSongs } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

    const songs = trendingSongs || [];

    return (
        <div className="min-h-screen bg-[#02000F] text-white p-4 md:p-6 pb-24 md:pb-32">
            {/* Header */}
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-12 pt-2 md:pt-4">
                <Link href="/" className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors group border border-white/5">
                    <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 drop-shadow-lg">
                        Trending Now
                    </h1>
                    <p className="text-sm md:text-base text-white/60 font-medium tracking-wide">Top 20 worship songs moving hearts globally</p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {songs.map((song, i) => (
                    <TiltCard key={song.id} className="h-full min-h-[280px] md:min-h-[300px]" max={15} scale={1.05}>
                        <div className="relative h-full group">
                            <Link
                                href={`/songs/${song.id}`}
                                className="relative flex flex-col justify-end p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] bg-[#0A0A0A] border border-white/10 overflow-hidden h-full group-hover:bg-[#111] transition-colors shadow-2xl"
                            >
                                {/* Rank Number Background */}
                                <div className="absolute top-[-15px] md:top-[-20px] right-[-15px] md:right-[-20px] text-[100px] md:text-[150px] font-black text-white/5 leading-none z-0 pointer-events-none select-none italic group-hover:text-white/10 transition-colors">
                                    {i + 1}
                                </div>

                                {/* Album Art Background */}
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 grayscale-[0.5] group-hover:grayscale-0" style={{ backgroundImage: `url('${song.img}')` }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                                {/* Glass Shine */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                {/* Floating Play Overlay - REMOVED */}

                                {/* Content Info */}
                                <div className="relative z-20 transform-style-3d translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center font-black text-sm border border-white/10">
                                            #{i + 1}
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/20 uppercase tracking-widest flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> Trending
                                        </span>
                                    </div>
                                    <h3 className="font-black text-2xl text-white leading-none mb-2 drop-shadow-lg line-clamp-1">{song.title}</h3>
                                    <p className="text-sm text-white/70 font-bold uppercase tracking-widest line-clamp-1 mb-1">{song.artist}</p>

                                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">
                                        <Music2 className="w-3 h-3" /> {song.plays} Plays
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
