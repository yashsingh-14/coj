'use client';

import Link from 'next/link';
import { ArrowLeft, Mic2, Music, TrendingUp } from 'lucide-react';

export default function ArtistsPage() {
    const artists = [
        {
            id: 'hillsong-worship',
            name: 'Hillsong Worship',
            image: 'https://images.unsplash.com/photo-1525994886773-080587e124c9?q=80&w=2070&auto=format&fit=crop',
            songs: 124,
            followers: '5.2M'
        },
        {
            id: 'bethel-music',
            name: 'Bethel Music',
            image: 'https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=1974&auto=format&fit=crop',
            songs: 89,
            followers: '3.8M'
        },
        {
            id: 'elevation-worship',
            name: 'Elevation Worship',
            image: 'https://images.unsplash.com/photo-1470229722913-7ea549c1c5c4?q=80&w=2070&auto=format&fit=crop',
            songs: 76,
            followers: '4.1M'
        },
        {
            id: 'sinach',
            name: 'Sinach',
            image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop',
            songs: 45,
            followers: '2.5M'
        }
    ];

    return (
        <div className="min-h-screen bg-[#02000F] text-white">
            <div className="sticky top-0 z-20 p-6 flex items-center gap-4 bg-[#02000F]/80 backdrop-blur-xl">
                <Link href="/" className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all group">
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <h1 className="text-2xl font-bold">Artists</h1>
            </div>

            <div className="p-6 grid gap-6 pb-32 md:grid-cols-2 lg:grid-cols-3">
                {artists.map((artist) => (
                    <Link
                        key={artist.id}
                        href={`/artists/${artist.id}`}
                        className="group relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/5 hover:border-[var(--brand)] transition-all duration-500 shadow-2xl"
                    >
                        {/* Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                            style={{ backgroundImage: `url('${artist.image}')` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:via-black/20 transition-all duration-500" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 w-full p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-[var(--brand)] transition-colors">{artist.name}</h2>
                                    <div className="flex gap-4 text-xs font-medium text-white/60">
                                        <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {artist.songs} Songs</span>
                                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {artist.followers}</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <ArrowLeft className="w-5 h-5 rotate-180" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
