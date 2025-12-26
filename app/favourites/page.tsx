import { Heart, PlayCircle, ArrowLeft, MoreVertical, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export const dynamic = 'force-dynamic';

export default async function FavouritesPage() {
    // Fetch user's favourites from Supabase (Mocked for now or use actual)
    const { data: favouritesData } = await supabase
        .from('songs')
        .select('*')
        .limit(20); // Changed limit to 20 as per new code

    const favourites = favouritesData || [];

    return (
        <div className="min-h-screen bg-[#02000F] text-white p-4 md:p-6 pb-24 md:pb-32 overflow-hidden relative">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pt-8 md:pt-12">
                    <div className="animate-fade-in-down">
                        <Link href="/songs" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-6 text-xs font-bold uppercase tracking-[0.3em] transition-all group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Library
                        </Link>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 mb-4 drop-shadow-2xl">
                            FAVOURITES
                        </h1>
                        <div className="flex items-center gap-4 text-white/40 font-bold uppercase tracking-widest text-[10px] md:text-sm">
                            <span className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-pink-500 fill-pink-500/20" />
                                {favourites?.length || 0} Saved Songs
                            </span>
                            <div className="w-1 h-1 rounded-full bg-white/20"></div>
                            <span>Updated just now</span>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                {favourites && favourites.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                        {favourites.map((song, i) => (
                            <div key={i} className="w-full relative rounded-3xl overflow-hidden bg-[#111] border border-white/10 p-4">
                                <div className="relative w-full h-full group">
                                    <Link
                                        href={`/songs/${song.id}`}
                                        className="relative flex flex-col justify-end p-6 rounded-[2rem] overflow-hidden h-full"
                                    >
                                        {/* Artist Background */}
                                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url('${song.img}')` }} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                                        {/* Glass Shine */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                        <div className="relative z-10 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{song.title}</h3>
                                            <p className="text-white/60 text-sm font-medium">{song.artist}</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
                        <div className="relative mb-8">
                            <Heart className="w-16 h-16 text-white/5" />
                            <Heart className="w-8 h-8 text-pink-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No favourites yet</h3>
                        <p className="text-white/40 mb-8 max-w-sm">Explore our library and save your favourite worship songs to access them here instantly.</p>
                        <Link href="/songs" className="px-8 py-4 bg-white text-black font-black rounded-full hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm">
                            Browse Songs
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
