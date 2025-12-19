'use client';

import Link from 'next/link'; // Import Link
import { useState, use } from 'react';
import { ArrowLeft, PlayCircle, Star, Shuffle, Play } from 'lucide-react';

// Use React.use to unwrap params in Next.js 15
export default function ArtistDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); // Unwrap params
    const artistId = id || 'unknown-artist';

    // Mock Artist Data (In a real app, fetch this based on artistId)
    const artist = {
        name: 'Hillsong Worship',
        bio: 'Hillsong Worship is an Australian praise and worship group from Hillsong Church, Sydney, Australia.',
        image: 'https://images.unsplash.com/photo-1525994886773-080587e124c9?q=80&w=2070&auto=format&fit=crop',
        songs: [
            { id: 'what-a-beautiful-name', title: 'What A Beautiful Name', album: 'Let There Be Light' },
            { id: 'who-you-say-i-am', title: 'Who You Say I Am', album: 'There Is More' },
            { id: 'kings-of-kings', title: 'King of Kings', album: 'Awake' },
            { id: 'oceans', title: 'Oceans (Where Feet May Fail)', album: 'Zion' },
            { id: 'mighty-to-save', title: 'Mighty To Save', album: 'Mighty To Save' },
        ]
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white pb-32">

            {/* HERO BANNER - Fixed Height */}
            <div className="relative h-[50vh] w-full overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${artist.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#02000F] via-[#02000F]/60 to-transparent" />

                {/* Navigation Back */}
                <div className="absolute top-6 left-6 z-20">
                    <Link href="/artists" className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all">
                        <ArrowLeft className="w-6 h-6 text-white" />
                    </Link>
                </div>

                {/* Artist Info Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-start gap-4 z-10">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-2xl">{artist.name}</h1>
                    <p className="text-white/70 max-w-xl text-sm md:text-base line-clamp-2 md:line-clamp-none leading-relaxed backdrop-blur-sm p-4 rounded-xl bg-black/20 border border-white/5">
                        {artist.bio}
                    </p>

                    <div className="flex gap-4 mt-2">
                        <button className="px-8 py-3 rounded-full bg-[var(--brand)] text-white font-bold tracking-wide uppercase flex items-center gap-2 hover:bg-white hover:text-[var(--brand)] transition-all shadow-lg shadow-[var(--brand)]/30">
                            <Play className="w-5 h-5 fill-current" /> Play All
                        </button>
                        <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors">
                            <Shuffle className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* SONGS LIST */}
            <div className="container mx-auto px-6 mt-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <span className="w-1 h-6 bg-[var(--brand)] rounded-full"></span>
                    Popular Tracks
                </h2>

                <div className="space-y-2">
                    {artist.songs.map((song, i) => (
                        <Link
                            key={i}
                            href={`/songs/${song.id}`}
                            className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[var(--brand)] transition-all duration-300"
                        >
                            <span className="w-8 text-center text-white/30 font-bold group-hover:text-[var(--brand)] transition-colors">{i + 1}</span>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-white group-hover:text-[var(--brand)] transition-colors truncate">{song.title}</h3>
                                <p className="text-xs text-white/50">{song.album}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="p-2 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Star className="w-5 h-5 text-white/50 hover:text-[var(--chord)]" />
                                </button>
                                <PlayCircle className="w-8 h-8 text-white/20 group-hover:text-[var(--brand)] group-hover:scale-110 transition-all" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

        </div>
    );
}
