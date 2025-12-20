'use client';

import { Heart, PlayCircle, ArrowLeft, MoreVertical, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';
import TiltCard from '@/components/ui/TiltCard';
import { ALL_SONGS } from '@/data/songs';

export default function FavouritesPage() {
    // Mock Favourites: Select first 5 songs from ALL_SONGS to simulate a liked list
    const favourites = ALL_SONGS.slice(0, 5);

    return (
        <div className="min-h-screen bg-[#02000F] text-white p-6 pb-32 overflow-hidden relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex items-center justify-between mb-12 animate-fade-in-down">
                    <Link href="/" className="inline-flex items-center gap-2 p-3 px-5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 backdrop-blur-md transition-all group">
                        <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-amber-500 transition-colors" />
                        <span className="text-sm font-bold tracking-widest uppercase">Back</span>
                    </Link>
                </header>

                <div className="mb-16 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                        <div className="relative">
                            <Heart className="w-8 h-8 text-red-500 fill-current animate-pulse-slow" />
                            <Sparkles className="w-4 h-4 text-amber-500 absolute -top-2 -right-2 animate-ping" />
                        </div>
                        <span className="text-amber-500 font-bold tracking-[0.3em] uppercase text-sm">Your Collection</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 mb-4 drop-shadow-2xl">
                        FAVOURITES
                    </h1>
                    <p className="text-white/40 font-medium max-w-xl text-lg">
                        Your personal sanctuary of worship. These are the songs that move your spirit.
                    </p>
                </div>

                {favourites.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {favourites.map((song, i) => (
                            <TiltCard key={i} className="w-full" max={8} scale={1.03}>
                                <div className="relative w-full h-full group">
                                    <Link
                                        href={`/songs/${song.id}`}
                                        className="group relative block w-full aspect-[3/4] rounded-[2rem] overflow-hidden bg-[#0A0A0A] border border-white/10 shadow-2xl hover:border-amber-500/30 transition-all duration-500"
                                    >
                                        {/* Image Background */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                                            style={{ backgroundImage: `url('${song.img}')` }}
                                        ></div>

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#02000F] via-[#02000F]/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-80"></div>

                                        {/* Glass Shine */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                        {/* Content Info */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 z-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">

                                            {/* Play Button Removed */}

                                            <div className="flex items-center gap-3 mb-2 opacity-80">
                                                <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/5">
                                                    Key: {song.key}
                                                </span>
                                                <span className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/5 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> 5:30
                                                </span>
                                            </div>

                                            <h3 className="text-2xl font-black text-white leading-tight mb-1 drop-shadow-lg line-clamp-2 group-hover:text-amber-400 transition-colors">
                                                {song.title}
                                            </h3>
                                            <p className="text-white/60 font-medium tracking-wide truncate">{song.artist}</p>
                                        </div>
                                    </Link>

                                    {/* Top Controls - Kept outside Link or carefully positioned to prevent navigation if clicked (but Link wraps everything so... we might need to use object/embed or just let it propagate if it's a link, but for a button we need stopPropagation) */}
                                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                                        <button
                                            className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-500 hover:border-red-500 hover:text-white text-red-500 transition-all shadow-lg pointer-events-auto"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                // Handle unlike
                                            }}
                                        >
                                            <Heart className="w-5 h-5 fill-current" />
                                        </button>
                                    </div>
                                </div>
                            </TiltCard>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 px-10">
                        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                            <Heart className="w-10 h-10 text-white/20" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-white/50">Your collection is empty</h3>
                        <p className="text-white/30 text-sm max-w-sm mx-auto">Start exploring and tap the heart icon to build your personal worship library.</p>
                        <Link href="/songs" className="inline-block mt-8 px-8 py-3 bg-amber-500 text-black font-bold rounded-full hover:bg-white transition-colors">
                            Explore Songs
                        </Link>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .animate-pulse-slow { animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}</style>
        </div>
    );
}
