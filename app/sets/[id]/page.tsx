'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Calendar, Clock, Music2, MoreVertical,
    PlayCircle, Trash2, Plus, GripVertical, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';

// Ensure dynamic rendering
export const dynamic = 'force-dynamic';

type SetDetail = {
    id: string;
    title: string;
    event_date: string;
    description: string;
    created_by: string;
    profiles: { name: string } | null;
};

type SetSong = {
    id: string; // junction id
    song_id: string;
    order_index: number;
    key_override: string | null;
    songs: {
        id: string;
        title: string;
        artist: string;
        key: string;
        category: string;
    };
};

export default function SetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { currentUser } = useAppStore();
    const router = useRouter();
    const [set, setSet] = useState<SetDetail | null>(null);
    const [setSongs, setSetSongs] = useState<SetSong[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [id, setId] = useState<string>('');

    // Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ id: string, title: string, artist: string, key: string }[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Search Songs
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const { data, error } = await supabase
                    .from('songs')
                    .select('id, title, artist, key')
                    .ilike('title', `%${searchQuery}%`)
                    .limit(5);

                if (error) throw error;
                setSearchResults(data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleAddSongToSet = async (songId: string) => {
        try {
            // Get current count
            const { count } = await supabase
                .from('set_songs')
                .select('*', { count: 'exact', head: true })
                .eq('set_id', id);

            const nextOrder = (count || 0) + 1;

            const { error } = await supabase
                .from('set_songs')
                .insert({
                    set_id: id,
                    song_id: songId,
                    order_index: nextOrder
                });

            if (error) throw error;

            toast.success("Song added!");
            setIsAddModalOpen(false);
            setSearchQuery('');
            fetchSet(id); // Refresh list
        } catch (error) {
            toast.error("Failed to add song");
        }
    };

    useEffect(() => {
        params.then(unwrappedParams => {
            setId(unwrappedParams.id);
            fetchSet(unwrappedParams.id);
        });
    }, [params]);

    const fetchSet = async (setId: string) => {
        try {
            // 1. Fetch Set Details
            const { data: setData, error: setError } = await supabase
                .from('sets')
                .select('*, profiles:created_by(name)')
                .eq('id', setId)
                .single();

            if (setError) throw setError;
            setSet(setData);

            // 2. Fetch Songs in Set
            const { data: songsData, error: songsError } = await supabase
                .from('set_songs')
                .select(`
                    id,
                    song_id,
                    order_index,
                    key_override,
                    songs ( id, title, artist, key, category )
                `)
                .eq('set_id', setId)
                .order('order_index', { ascending: true });

            if (songsError) throw songsError;
            // @ts-ignore
            setSetSongs(songsData || []);

        } catch (error) {
            console.error('Error fetching set:', error);
            // toast.error("Could not load set");
            if (!set) notFound();
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSet = async () => {
        if (!confirm("Are you sure you want to delete this set?")) return;

        try {
            const { error } = await supabase.from('sets').delete().eq('id', id);
            if (error) throw error;
            toast.success("Set deleted");
            router.push('/sets');
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete set");
        }
    };

    const handleRemoveSong = async (junctionId: string) => {
        try {
            const { error } = await supabase.from('set_songs').delete().eq('id', junctionId);
            if (error) throw error;

            setSetSongs(prev => prev.filter(s => s.id !== junctionId));
            toast.success("Song removed from set");
        } catch (error) {
            toast.error("Failed to remove song");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#02000F] text-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
            </div>
        );
    }

    if (!set) return null; // Or generic 404

    const dateObj = new Date(set.event_date);

    return (
        <div className="min-h-screen bg-[#02000F] text-white p-6 md:p-12 pb-32">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                    <div>
                        <Link href="/sets" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Sets
                        </Link>

                        <div className="flex items-center gap-4 mb-2">
                            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-full uppercase tracking-wider">
                                Service Plan
                            </span>
                            <span className="text-white/40 text-sm flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">{set.title}</h1>

                        <div className="flex items-center gap-6 text-white/50">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span className="font-medium">{dateObj.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                    {set.profiles?.name?.[0] || 'U'}
                                </div>
                                <span>{set.profiles?.name || 'Unknown Leader'}</span>
                            </div>
                        </div>
                    </div>



                    <div className="flex gap-2">
                        {currentUser?.id === set.created_by && (
                            <button
                                onClick={handleDeleteSet}
                                className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                title="Delete Set"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Description */}
                {set.description && (
                    <div className="mb-12 p-6 rounded-2xl bg-white/5 border border-white/10 text-white/80 leading-relaxed">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Notes</h3>
                        {set.description}
                    </div>
                )}

                {/* Songs List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Music2 className="w-6 h-6 text-amber-500" />
                            Set List
                            <span className="text-sm font-normal text-white/30 ml-2">({setSongs.length} Songs)</span>
                        </h2>

                        {/* Add Song Button */}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Song
                        </button>
                    </div>

                    {setSongs.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl text-white/30">
                            <Music2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No songs in this set yet.</p>
                            <p className="text-sm mt-2">Go to any song and click "Add to Set".</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {setSongs.map((item, index) => (
                                <div key={item.id} className="group relative bg-white/5 border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center gap-4 transition-all hover:bg-white/[0.07]">
                                    <div className="text-white/20 font-mono text-xl font-bold w-8 text-center">{index + 1}</div>

                                    <div className="flex-1 min-w-0">
                                        <Link href={`/songs/${item.songs.id}`} className="block hover:underline">
                                            <h3 className="text-lg font-bold truncate pr-4">{item.songs.title}</h3>
                                        </Link>
                                        <div className="flex items-center gap-3 text-sm text-white/50">
                                            <span>{item.songs.artist}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                            <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] uppercase font-bold tracking-wider">{item.songs.category}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-center min-w-[3rem]">
                                            <div className="text-[10px] uppercase tracking-wider text-white/30 font-bold">Key</div>
                                            <div className="text-lg font-bold text-amber-500">{item.key_override || item.songs.key}</div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleRemoveSong(item.id)}
                                                className="p-2 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-lg transition-colors"
                                                title="Remove from Set"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Song Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
                        <div className="relative bg-[#111] border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl animate-fade-in-up">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Add Song to Set</h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <Trash2 className="w-5 h-5 opacity-0 cursor-default" /> {/* Spacer */}
                                </button>
                            </div>

                            <input
                                autoFocus
                                type="text"
                                placeholder="Search song title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg focus:outline-none focus:border-amber-500 mb-4 transition-colors placeholder:text-white/20"
                            />

                            <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar">
                                {isSearching ? (
                                    <div className="text-center py-8 text-white/30 flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Searching...
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(song => (
                                        <button
                                            key={song.id}
                                            onClick={() => handleAddSongToSet(song.id)}
                                            className="w-full text-left p-3 rounded-xl hover:bg-white/10 flex items-center justify-between group transition-colors border border-transparent hover:border-white/5"
                                        >
                                            <div>
                                                <div className="font-bold text-white/90">{song.title}</div>
                                                <div className="text-xs text-white/40 mt-0.5">{song.artist} • <span className="text-amber-500/80">{song.key}</span></div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                        </button>
                                    ))
                                ) : searchQuery.length > 1 ? (
                                    <div className="text-center py-8 text-white/30">No songs found.</div>
                                ) : (
                                    <div className="text-center py-8 text-white/20">Type to search your library</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
