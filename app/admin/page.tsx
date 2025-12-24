'use client';

import Link from 'next/link';
import { Plus, Music, Users, ArrowRight, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ songs: 0, users: 0, sets: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const { count: songsCount } = await supabase.from('songs').select('*', { count: 'exact', head: true });
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: setsCount } = await supabase.from('sets').select('*', { count: 'exact', head: true });

            setStats({
                songs: songsCount || 0,
                users: usersCount || 0,
                sets: setsCount || 0
            });
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">Dashboard</h1>
                <p className="text-white/40">Welcome back, Admin. Here&apos;s what&apos;s happening.</p>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Songs" value={stats.songs} icon={Music} trend="Live Library" />
                <StatCard label="Total Users" value={stats.users} icon={Users} trend="Community" />
                <StatCard label="Total Sets" value={stats.sets} icon={Activity} trend="Service Plans" />
            </div>

            {/* Quick Actions */}
            <section>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/songs/new" className="group p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-amber-500/30 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Add New Song</h3>
                        <p className="text-sm text-white/40 mb-4">Input lyrics, chords, and metadata.</p>
                        <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-widest">
                            Create <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>

                    <Link href="/admin/songs" className="group p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Music className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Manage Library</h3>
                        <p className="text-sm text-white/40 mb-4">Edit or delete existing songs.</p>
                        <div className="flex items-center gap-2 text-white/60 group-hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                            View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                </div>
            </section>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, trend }: any) {
    return (
        <div className="p-6 rounded-3xl bg-[#0F0F16] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-16 h-16 text-white" />
            </div>
            <div className="relative z-10">
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">{label}</div>
                <div className="text-4xl font-black text-white mb-2">{value}</div>
                <div className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded inline-block">
                    {trend}
                </div>
            </div>
        </div>
    );
}
