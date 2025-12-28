'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Song } from '@/data/types';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageSongsPage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        const { data, error } = await supabase
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setSongs(data);
        setIsLoading(false);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

        // Perform DELETE operation
        const { error } = await supabase.from('songs').delete().eq('id', id);

        if (error) {
            console.error(error);
            toast.error("Failed to delete song: " + error.message);
        } else {
            toast.success("Song deleted");
            // Optimistic update
            setSongs(prev => prev.filter(s => s.id !== id));
            // Double check by re-fetching (optional but safe)
            fetchSongs();
        }
    };

    const filtered = songs.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Manage Songs</h1>
                    <p className="text-white/40 text-sm">{songs.length} songs in library</p>
                </div>
                <Link href="/admin/songs/new" className="px-4 py-2 md:px-6 md:py-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center gap-2 transition-all text-sm md:text-base">
                    <Plus className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden md:inline">Add New Song</span><span className="md:hidden">Add</span>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                    type="text"
                    placeholder="Search library..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-3 md:py-4 text-white focus:outline-none focus:border-white/10 transition-colors"
                />
            </div>

            {/* List */}
            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="p-4 md:p-6 text-xs font-bold text-white/30 uppercase tracking-widest">Title</th>
                            <th className="p-4 md:p-6 text-xs font-bold text-white/30 uppercase tracking-widest hidden md:table-cell">Artist</th>
                            <th className="p-4 md:p-6 text-xs font-bold text-white/30 uppercase tracking-widest hidden md:table-cell">Category</th>
                            <th className="p-4 md:p-6 text-xs font-bold text-white/30 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-12 text-center text-white/30">Loading library...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={4} className="p-12 text-center text-white/30">No songs found.</td></tr>
                        ) : (
                            filtered.map(song => (
                                <tr key={song.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <td className="p-4 md:p-6 font-bold text-white">
                                        {song.title}
                                        <div className="md:hidden text-xs text-white/40 font-normal mt-1">{song.artist}</div>
                                    </td>
                                    <td className="p-4 md:p-6 text-white/60 hidden md:table-cell">{song.artist}</td>
                                    <td className="p-4 md:p-6 hidden md:table-cell">
                                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-wider text-white/40">
                                            {song.category}
                                        </span>
                                    </td>
                                    <td className="p-4 md:p-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/admin/songs/${song.id}`}
                                                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"
                                                title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(song.id, song.title)}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-500" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
