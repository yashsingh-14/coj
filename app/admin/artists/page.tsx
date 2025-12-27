'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Trash2, Edit, Mic2, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminArtistsPage() {
    const [artists, setArtists] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchArtists();
    }, []);

    const fetchArtists = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('artists')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            toast.error("Failed to load artists");
        } else {
            setArtists(data || []);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(`Are you sure you want to delete this artist? This can break songs linked to this ID: ${id}`)) return;

        const { error } = await supabase.from('artists').delete().eq('id', id);
        if (error) {
            toast.error("Failed to delete artist");
        } else {
            toast.success("Artist deleted");
            fetchArtists();
        }
    };

    const filteredArtists = artists.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Artists</h1>
                    <p className="text-white/40">Manage artist profiles and attribution.</p>
                </div>
                <Link href="/admin/artists/new" className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 justify-center">
                    <Plus className="w-5 h-5" /> Add New Artist
                </Link>
            </header>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                    type="text"
                    placeholder="Search artists by name or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#0F0F16] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-amber-500/30 transition-colors"
                />
            </div>

            <div className="bg-[#0F0F16] border border-white/5 rounded-3xl overflow-hidden">
                {isLoading ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        <p className="text-white/30">Loading artists...</p>
                    </div>
                ) : filteredArtists.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <Mic2 className="w-16 h-16 text-white/10" />
                        <h3 className="text-xl font-bold text-white/50">No artists found</h3>
                        <p className="text-white/30">Try a different search or add a new artist.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredArtists.map((artist) => (
                            <div key={artist.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/5 overflow-hidden border border-white/10 shrink-0">
                                        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-0.5">{artist.name} <span className="text-xs font-normal text-white/30 ml-2">({artist.id})</span></h3>
                                        <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-widest font-bold">
                                            <span>{artist.genre}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                            <span>{artist.followers} Fans</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-end md:self-auto">
                                    <Link href={`/admin/artists/${artist.id}`} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                        <Edit className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(artist.id)}
                                        className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
