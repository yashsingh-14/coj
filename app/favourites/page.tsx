'use client';

import { Heart, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function FavouritesPage() {
    // Mock Favourites for visual fidelity (Real impl requires localStorage hook)
    const favourites = [
        { title: 'Way Maker', author: 'Sinach', key: 'E', slug: 'way-maker' },
        { title: 'Goodness of God', author: 'Bethel Music', key: 'Ab', slug: 'goodness-of-god' }
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] text-white pb-32">
            <div className="px-6 pt-12 pb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)]">
                    <Heart className="w-5 h-5 fill-current" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Your Favourites</h1>
            </div>

            {favourites.length > 0 ? (
                <div className="px-4">
                    {favourites.map((song, i) => (
                        <Link key={i} href={`/songs/${song.slug}`} className="flex items-center gap-4 py-3 px-2 border-b border-[var(--muted)]/20 active:bg-white/5 transition-colors group">
                            <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg flex items-center justify-center text-white/20">
                                <PlayCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-base text-white">{song.title}</h3>
                                <p className="text-xs text-[#94a3b8] uppercase">{song.author}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-[var(--chord)]">{song.key}</span>
                                <Heart className="w-4 h-4 text-[var(--brand)] fill-current mt-1" />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-10 opacity-50">
                    <Heart className="w-12 h-12 mx-auto mb-4 stroke-1" />
                    <h3 className="text-lg font-bold mb-2">No Favourites Yet</h3>
                    <p className="text-sm">Tap the heart icon on any song to add it to your list.</p>
                </div>
            )}
        </div>
    );
}
