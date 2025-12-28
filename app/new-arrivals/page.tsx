import Link from 'next/link';
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';
import { supabase } from '@/lib/supabaseClient';

export const revalidate = 60;

export default async function NewArrivalsPage() {
    // Fetch newest songs from database
    const { data: newSongs } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);

    const songs = newSongs || [];

    return (
        <div className="min-h-screen bg-[#02000F] text-white p-4 md:p-6 pb-24 md:pb-32">
            {/* Header */}
            <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10 pt-2 md:pt-4">
                <Link href="/" className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors group border border-white/5">
                    <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-500 drop-shadow-lg">
                        New Arrivals
                    </h1>
                    <p className="text-sm md:text-base text-white/60 font-medium tracking-wide">Fresh sounds of worship added this week</p>
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
                                {/* Album Art Background */}
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0" style={{ backgroundImage: `url('${song.img}')` }}></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                                {/* Glass Shine */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                {/* Floating Play Overlay - REMOVED */}

                                {/* Content Info */}
                                <div className="relative z-20 transform-style-3d translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-lg shadow-amber-500/40">
                                            NEW
                                        </span>
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white tracking-wider uppercase">
                                            {song.category}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-2xl text-white leading-none mb-2 drop-shadow-lg line-clamp-1">{song.title}</h3>
                                    <p className="text-sm text-white/70 font-bold uppercase tracking-widest line-clamp-1 mb-1">{song.artist}</p>

                                    <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500/80 uppercase tracking-widest mt-2">
                                        <Clock className="w-3 h-3" /> Still Fresh
                                    </div>

                                    <div className="w-full h-1 bg-white/20 rounded-full mt-4 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                        <div className="h-full bg-amber-500 w-full animate-loader"></div>
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
