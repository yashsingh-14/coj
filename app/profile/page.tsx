'use client';

import Link from 'next/link';
import { ArrowLeft, User, Settings, Heart, Music, ListMusic, Edit2, Camera } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';

import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ProfilePage() {
    const { currentUser, isAuthenticated } = useAppStore();
    const router = useRouter();

    const [savedCount, setSavedCount] = useState(0);
    const [setsCount, setSetsCount] = useState(0);

    // Redirect if not logged in
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/signin');
        }
    }, [isAuthenticated, router]);

    // Fetch real stats
    useEffect(() => {
        if (currentUser?.id) {
            const fetchStats = async () => {
                // Fetch Favourites
                const { count: favCount } = await supabase
                    .from('favourites')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', currentUser.id);

                if (favCount !== null) setSavedCount(favCount);

                // Fetch Sets
                const { count: setCount } = await supabase
                    .from('sets')
                    .select('*', { count: 'exact', head: true })
                    .eq('created_by', currentUser.id);

                if (setCount !== null) setSetsCount(setCount);
            };
            fetchStats();
        }
    }, [currentUser]);

    if (!currentUser) return null; // or a loading spinner

    // Use real user data with fallbacks
    const user = {
        name: currentUser.name,
        email: currentUser.email,
        image: currentUser.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2000&auto=format&fit=crop',
        joined: 'Member',
        stats: {
            savedSongs: savedCount,
            playlists: setsCount,
            reviews: 0
        }
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white pb-32">

            {/* Header / Nav */}
            <div className="px-4 py-4 sm:p-6 flex items-center justify-between">
                <Link href="/" className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all group border border-white/5">
                    <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:-translate-x-1 transition-transform" />
                </Link>
                <Link href="/settings" className="p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all group border border-white/5">
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-45 transition-transform" />
                </Link>
            </div>

            <div className="container mx-auto px-4 sm:px-6 max-w-4xl">

                {/* Profile Card */}
                <div className="relative mt-4 sm:mt-8 mb-8 sm:mb-12">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent blur-3xl opacity-30" />

                    <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8 text-center md:text-left">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full p-1 bg-gradient-to-br from-amber-500 via-purple-500 to-blue-500">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#02000F] relative">
                                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${user.image}')` }} />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                            <Link href="/profile/edit" className="absolute bottom-2 right-2 p-2 rounded-full bg-white text-black shadow-lg hover:bg-gray-200 transition-colors z-20">
                                <Edit2 className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Info */}
                        <div className="flex-1 pb-4">
                            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-2">{user.name}</h1>
                            <p className="text-white/60 font-medium mb-4 sm:mb-6 text-xs sm:text-sm break-all">{user.email} • {user.joined}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4">
                                <div className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 fill-current" />
                                    <div className="text-left">
                                        <p className="text-base sm:text-lg font-bold leading-none">{user.stats.savedSongs}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-white/50">Saved</p>
                                    </div>
                                </div>
                                <div className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <ListMusic className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                                    <div className="text-left">
                                        <p className="text-base sm:text-lg font-bold leading-none">{user.stats.playlists}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-white/50">Sets</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid gap-4 sm:gap-6">
                    <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                        <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                        Your Library
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <TiltCard className="h-full" max={5} scale={1.02}>
                            <Link href="/favourites" className="block h-full">
                                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors h-full flex items-center gap-4 cursor-pointer group">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                                        <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1">Liked Songs</h3>
                                        <p className="text-xs sm:text-sm text-white/50">{user.stats.savedSongs} songs</p>
                                    </div>
                                </div>
                            </Link>
                        </TiltCard>

                        <TiltCard className="h-full" max={5} scale={1.02}>
                            <Link href="/sets" className="block h-full">
                                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors h-full flex items-center gap-4 cursor-pointer group">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                                        <ListMusic className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-white mb-0.5 sm:mb-1">Your Sets</h3>
                                        <p className="text-xs sm:text-sm text-white/50">{user.stats.playlists} sets</p>
                                    </div>
                                </div>
                            </Link>
                        </TiltCard>
                    </div>

                    {/* Premium Recent Activity - Coming Soon
                    <div className="mt-8 opacity-50 grayscale">
                        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            Recent Activity
                        </h2>
                        <div className="p-8 border border-white/5 rounded-3xl text-center">
                            <p className="text-white/40">History tracking coming soon...</p>
                        </div>
                    </div>
                    */}

                </div>
            </div>
        </div>
    );
}
