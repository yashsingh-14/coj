'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ArtistFormPage({ params }: { params: any }) {
    // Typescript nuance: params might be a Promise or object depending on Next.js version in this project.
    // Handling as any for safety across version bumps in specific app dir setups.
    const [artistIdParam, setArtistIdParam] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        id: '', // Slug ID
        name: '',
        image: '',
        followers: '',
        genre: '',
        songs_count: 0
    });

    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        // unwrapping params
        Promise.resolve(params).then((resolvedParams: any) => {
            if (resolvedParams.id && resolvedParams.id !== 'new') {
                // Important: resolvedParams.id might be URL encoded (e.g. 'hillsong%20worship' -> 'hillsong worship')
                // But since our IDs are slugs (kebab-case), typically fine.
                const id = decodeURIComponent(resolvedParams.id);
                setArtistIdParam(id);
                setIsEditMode(true);
                fetchArtist(id);
            } else {
                setIsLoading(false); // New mode
                setIsEditMode(false);
            }
        });
    }, [params]);

    const fetchArtist = async (id: string) => {
        const { data, error } = await supabase.from('artists').select('*').eq('id', id).single();
        if (error) {
            toast.error("Failed to load artist");
            router.push('/admin/artists');
        } else {
            setFormData(data);
        }
        setIsLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateId = () => {
        // Simple helper to auto-generate slug from name if ID is empty and creating new
        if (!isEditMode && !formData.id && formData.name) {
            const slug = formData.name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
            setFormData(prev => ({ ...prev, id: slug }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (isEditMode) {
                // Update
                const { error } = await supabase.from('artists').update({
                    name: formData.name,
                    image: formData.image,
                    followers: formData.followers,
                    genre: formData.genre,
                    songs_count: formData.songs_count // Usually calculated, but manual override permitted
                }).eq('id', artistIdParam); // Use original ID to find record

                if (error) throw error;
                toast.success("Artist updated successfully");
            } else {
                // Create
                // Ensure ID is unique
                const { error } = await supabase.from('artists').insert([formData]);
                if (error) {
                    if (error.code === '23505') { // Unique violation
                        toast.error("Artist ID already exists. Please choose a unique ID.");
                        setIsSaving(false);
                        return;
                    }
                    throw error;
                }
                toast.success("Artist created successfully");
            }
            router.push('/admin/artists');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save artist");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <header className="flex items-center gap-4">
                <Link href="/admin/artists" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">{isEditMode ? 'Edit Artist' : 'New Artist'}</h1>
                    <p className="text-white/40">Manage artist profile details.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">

                <div className="bg-[#0F0F16] border border-white/5 p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-2 mb-2 text-amber-500 font-bold uppercase tracking-widest text-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Basic Info
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={generateId} // Auto-gen slug on blur
                                placeholder="e.g. Hillsong Worship"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">ID (Slug)</label>
                            <input
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                                placeholder="e.g. hillsong-worship"
                                className={`w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                required
                                readOnly={isEditMode}
                            />
                            {isEditMode ? (
                                <p className="text-[10px] text-white/30"><Info className="w-3 h-3 inline mr-1" /> ID cannot be changed after creation.</p>
                            ) : (
                                <p className="text-[10px] text-white/30">Unique URL identifier (e.g. /artists/<strong>id</strong>)</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/70">Image URL</label>
                        <input
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                        />
                        {formData.image && (
                            <div className="mt-2 w-full h-32 rounded-xl bg-white/5 overflow-hidden border border-white/10 relative">
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover opacity-60" />
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-white/50">Preview</div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">Genre</label>
                            <input
                                name="genre"
                                value={formData.genre}
                                onChange={handleChange}
                                placeholder="e.g. Worship"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">Followers (Display)</label>
                            <input
                                name="followers"
                                value={formData.followers}
                                onChange={handleChange}
                                placeholder="e.g. 5.2M"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">Song Count (Override)</label>
                            <input
                                type="number"
                                name="songs_count"
                                value={formData.songs_count}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {isEditMode ? 'Update Artist' : 'Create Artist'}
                    </button>
                </div>
            </form>
        </div>
    );
}
