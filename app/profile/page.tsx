'use client';

import Link from 'next/link';
import { ArrowLeft, User, Settings, Heart, Music, ListMusic, Edit2, Camera } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';

export default function ProfilePage() {
    // Mock User Data
    const user = {
        name: 'Worship Leader',
        email: 'leader@worship.com',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2000&auto=format&fit=crop', // Placeholder avatar
        joined: 'Member since 2024',
        stats: {
            savedSongs: 142,
            playlists: 8,
            reviews: 24
        }
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white pb-32">

            {/* Header / Nav */}
            <div className="p-6 flex items-center justify-between">
                <Link href="/" className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all group border border-white/5">
                    <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                </Link>
                <Link href="/settings" className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all group border border-white/5">
                    <Settings className="w-6 h-6 text-white group-hover:rotate-45 transition-transform" />
                </Link>
            </div>

            <div className="container mx-auto px-6 max-w-4xl">

                {/* Profile Card */}
                <div className="relative mt-8 mb-12">
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 to-transparent blur-3xl opacity-30" />

                    <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-left">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-amber-500 via-purple-500 to-blue-500">
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
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">{user.name}</h1>
                            <p className="text-white/60 font-medium mb-6">{user.email} • {user.joined}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                                    <div className="text-left">
                                        <p className="text-lg font-bold leading-none">{user.stats.savedSongs}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-white/50">Saved</p>
                                    </div>
                                </div>
                                <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                                    <ListMusic className="w-5 h-5 text-amber-500" />
                                    <div className="text-left">
                                        <p className="text-lg font-bold leading-none">{user.stats.playlists}</p>
                                        <p className="text-[10px] uppercase tracking-wider text-white/50">Playlists</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid gap-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span className="w-1 h-6 bg-amber-500 rounded-full"></span>
                        Your Library
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TiltCard className="h-full" max={5} scale={1.02}>
                            <Link href="/favourites" className="block h-full">
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors h-full flex items-center gap-4 cursor-pointer group">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Heart className="w-8 h-8 text-white fill-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Liked Songs</h3>
                                        <p className="text-sm text-white/50">{user.stats.savedSongs} songs</p>
                                    </div>
                                </div>
                            </Link>
                        </TiltCard>

                        <TiltCard className="h-full" max={5} scale={1.02}>
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors h-full flex items-center gap-4 cursor-pointer group">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <ListMusic className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Your Playlists</h3>
                                    <p className="text-sm text-white/50">{user.stats.playlists} playlists</p>
                                </div>
                            </div>
                        </TiltCard>
                    </div>

                    {/* Premium Recent Activity */}
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            Recent Activity
                        </h2>
                        <div className="space-y-3">
                            {[
                                { title: "Way Maker", artist: "Sinach", time: "2 hours ago", img: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=400" },
                                { title: "Oceans", artist: "Hillsong United", time: "5 hours ago", img: "https://images.unsplash.com/photo-1506157786151-b8491531e1ec?auto=format&fit=crop&q=80&w=400" },
                                { title: "Jireh", artist: "Maverick City", time: "Yesterday", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400" }
                            ].map((track, i) => (
                                <div key={i} className="group flex items-center gap-5 p-4 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300 relative overflow-hidden cursor-pointer">
                                    {/* Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform shrink-0">
                                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${track.img}')` }} />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ListMusic className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white text-lg truncate group-hover:text-blue-400 transition-colors">{track.title}</h4>
                                        <p className="text-sm text-white/50 truncate">{track.artist}</p>
                                    </div>

                                    <div className="text-xs font-bold uppercase tracking-widest text-white/30 whitespace-nowrap">
                                        {track.time}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
