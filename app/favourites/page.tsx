'use client';

import { Heart, ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getSongImage } from '@/lib/utils';
import { generateSlug } from '@/lib/seoUtils';
import { Song } from '@/data/types';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function FavouritesPage() {
    const { currentUser, isAuthenticated } = useAppStore();
    const router = useRouter();
    const pathname = usePathname();
    const [favourites, setFavourites] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Redirect if not logged in after hydration
        if (mounted && !isAuthenticated && !loading) {
            router.push('/signin');
        }
    }, [isAuthenticated, loading, mounted, router]);

    useEffect(() => {
        let isMounted = true;
        async function fetchFavourites() {
            if (!currentUser?.id) {
                if (isMounted && mounted) {
                    setFavourites([]);
                    setLoading(false);
                }
                return;
            }

            try {
                if (isMounted) setLoading(true);

                // 1. Fetch song_ids from favourites table
                const { data: favData, error: favError } = await supabase
                    .from('favourites')
                    .select('song_id')
                    .eq('user_id', currentUser.id);

                if (favError) {
                    console.error('Error fetching favourites:', favError);
                    if (isMounted) setFavourites([]);
                    return;
                }

                if (!favData || favData.length === 0) {
                    if (isMounted) setFavourites([]);
                    return;
                }

                // 2. Extract IDs
                const songIds = favData.map(f => f.song_id);

                // 3. Fetch actual song details including youtube_id for thumbnail resolution
                const { data: songsData, error: songsError } = await supabase
                    .from('songs')
                    .select('id, title, artist, category, img, youtube_id, is_featured')
                    .in('id', songIds);

                if (songsError) {
                    console.error('Error fetching songs:', songsError);
                }

                if (isMounted && songsData) {
                    setFavourites(songsData as unknown as Song[]);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        if (mounted) {
            fetchFavourites();
        }
        return () => { isMounted = false; };
    }, [currentUser?.id, pathname, mounted]);

    const handleRemoveFavourite = async (songId: string, songTitle: string) => {
        if (!currentUser?.id) return;
        try {
            const { error } = await supabase
                .from('favourites')
                .delete()
                .eq('user_id', currentUser.id)
                .eq('song_id', songId);

            if (error) {
                toast.error("Failed to remove song");
            } else {
                setFavourites(prev => prev.filter(s => s.id !== songId));
                toast.success(`Removed "${songTitle}" from favourites`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!mounted || loading) {
        return (
            <div className="min-h-screen bg-[#02000F] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[var(--brand)] animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#02000F] text-white px-3 sm:px-6 py-4 pb-24 md:pb-32 overflow-hidden relative">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-12 pt-4 sm:pt-8 md:pt-12">
                    <div className="animate-fade-in-down">
                        <Link href="/songs" className="inline-flex items-center gap-2 text-white/40 hover:text-white mb-4 sm:mb-6 text-xs font-bold uppercase tracking-[0.3em] transition-all group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Library
                        </Link>
                        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 mb-2 sm:mb-4 drop-shadow-2xl">
                            FAVOURITES
                        </h1>
                        <div className="flex items-center gap-3 sm:gap-4 text-white/40 font-bold uppercase tracking-widest text-[10px] md:text-sm">
                            <span className="flex items-center gap-1.5 sm:gap-2">
                                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500 fill-pink-500/20" />
                                {favourites.length} Saved Songs
                            </span>
                            <div className="w-1 h-1 rounded-full bg-white/20"></div>
                            <span>Updated just now</span>
                        </div>
                    </div>
                </div>

                {/* Grid Section */}
                {favourites.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        {favourites.map((song, i) => (
                            <div key={i} className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#111] border border-white/10 p-2.5 sm:p-4 group">
                                {/* Remove Favourite Button */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleRemoveFavourite(song.id, song.title);
                                    }}
                                    className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-all opacity-80 group-hover:opacity-100"
                                    title="Remove from favourites"
                                >
                                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-pink-500 group-hover:fill-white" />
                                </button>

                                <div className="relative w-full h-full">
                                    <Link
                                        href={`/songs/${generateSlug(song.title)}`}
                                        className="relative flex flex-col justify-end p-3 sm:p-6 rounded-xl sm:rounded-[2rem] overflow-hidden h-44 sm:h-64 w-full block"
                                    >
                                        {/* Artist Background */}
                                        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                            style={{ backgroundImage: `url('${getSongImage(song)}')` }} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                                        {/* Glass Shine */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                        <div className="relative z-10 transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="text-sm sm:text-lg md:text-xl font-bold text-white mb-0.5 sm:mb-1 line-clamp-2">{song.title}</h3>
                                            <p className="text-white/60 text-xs sm:text-sm font-medium line-clamp-1">{song.artist}</p>
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
