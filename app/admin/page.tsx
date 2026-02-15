'use client';

import Link from 'next/link';
import { Plus, Music, Users, ArrowRight, Activity, Mic2, Calendar, BookOpen, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import RecentActivityList from '@/components/admin/RecentActivityList';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        songs: 0,
        users: 0,
        sets: 0,
        artists: 0,
        events: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            const { count: songsCount } = await supabase.from('songs').select('*', { count: 'exact', head: true });
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: setsCount } = await supabase.from('sets').select('*', { count: 'exact', head: true });
            const { count: artistsCount } = await supabase.from('artists').select('*', { count: 'exact', head: true });
            const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true });

            setStats({
                songs: songsCount || 0,
                users: usersCount || 0,
                sets: setsCount || 0,
                artists: artistsCount || 0,
                events: eventsCount || 0
            });
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-2">Dashboard</h1>
                <p className="text-white/40 text-sm md:text-base">Welcome back, Admin. Here&apos;s your daily overview.</p>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <StatCard label="Songs" value={stats.songs} icon={Music} trend="Library" />
                <StatCard label="Artists" value={stats.artists} icon={Mic2} trend="Verified" />
                <StatCard label="Users" value={stats.users} icon={Users} trend="Active" />
                <StatCard label="Events" value={stats.events} icon={Calendar} trend="Plans" />
            </div>

            {/* Quick Actions Modules */}
            <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Quick Management
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {/* Add Song */}
                    <Link href="/admin/songs/new" className="group p-3 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Plus className="w-12 h-12 md:w-24 md:h-24 text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-500 flex items-center justify-center mb-2 md:mb-4 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                <Plus className="w-4 h-4 md:w-6 md:h-6 text-black" />
                            </div>
                            <h3 className="text-sm md:text-xl font-bold text-white mb-1">Add Song</h3>
                            <p className="hidden md:block text-sm text-white/40 mb-4 line-clamp-2">Input lyrics, chords, and metadata for the library.</p>
                        </div>
                    </Link>

                    {/* Manage Events */}
                    <Link href="/admin/events" className="group p-3 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Calendar className="w-12 h-12 md:w-24 md:h-24 text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/20 flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform">
                                <Calendar className="w-4 h-4 md:w-6 md:h-6 text-blue-400" />
                            </div>
                            <h3 className="text-sm md:text-xl font-bold text-white mb-1">Events</h3>
                            <p className="hidden md:block text-sm text-white/40 mb-4">Update service timings and special events.</p>
                        </div>
                    </Link>

                    {/* Daily Content */}
                    <Link href="/admin/utils" className="group p-3 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BookOpen className="w-12 h-12 md:w-24 md:h-24 text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-emerald-400" />
                            </div>
                            <h3 className="text-sm md:text-xl font-bold text-white mb-1">Content</h3>
                            <p className="hidden md:block text-sm text-white/40 mb-4">Set Verse of the Day and announcements.</p>
                        </div>
                    </Link>

                    {/* Global Settings */}
                    <Link href="/admin/settings" className="group p-3 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Settings className="w-12 h-12 md:w-24 md:h-24 text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-purple-500/20 flex items-center justify-center mb-2 md:mb-4 group-hover:scale-110 transition-transform">
                                <Settings className="w-4 h-4 md:w-6 md:h-6 text-purple-400" />
                            </div>
                            <h3 className="text-sm md:text-xl font-bold text-white mb-1">Settings</h3>
                            <p className="hidden md:block text-sm text-white/40 mb-4">Social links, SEO, and maintenance mode.</p>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Recent Activity */}
            <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Recent Activity
                </h2>
                <RecentActivityList />
            </section>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, trend }: any) {
    return (
        <div className="p-3 md:p-6 rounded-2xl md:rounded-3xl bg-[#0F0F16] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 md:p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-8 h-8 md:w-16 md:h-16 text-white" />
            </div>
            <div className="relative z-10">
                <div className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-1 truncate">{label}</div>
                <div className="text-xl md:text-4xl font-black text-white mb-1 md:mb-2">{value}</div>
                <div className="text-emerald-500 text-[10px] md:text-xs font-bold bg-emerald-500/10 px-2 py-0.5 md:py-1 rounded inline-block truncate max-w-full">
                    {trend}
                </div>
            </div>
        </div>
    );
}
