'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Save, Eye, EyeOff, Music, Mic2, GripHorizontal, ArrowLeft, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import SongViewer from '@/components/songs/SongViewer';
import { parseSongSheet } from '@/lib/songParser';
import { Song } from '@/data/types';
import { revalidateApp } from '@/app/actions/revalidate';
import { updateSongAdmin, createSongAdmin } from '@/app/actions/admin';

interface SongFormProps {
    initialData?: Song;
    mode: 'create' | 'edit';
}

export default function SongForm({ initialData, mode }: SongFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [magicText, setMagicText] = useState('');

    // AI & Tabs State
    const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiArtist, setAiArtist] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        artist: initialData?.artist || '',
        category: initialData?.category || 'worship',
        key: initialData?.key || '',
        tempo: initialData?.tempo || '',
        youtube_id: initialData?.youtubeId || initialData?.youtube_id || '',
        img: initialData?.img || '',
        lyrics: initialData?.lyrics || '',
        hindi_lyrics: initialData?.hindiLyrics || initialData?.hindi_lyrics || '',
        chords: initialData?.chords || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;

        setIsGenerating(true);
        try {
            const res = await fetch('/api/generate-song', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    songName: aiPrompt,
                    artist: aiArtist
                })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to generate');

            setFormData(prev => ({
                ...prev,
                title: data.title || prev.title,
                artist: data.artist || prev.artist,
                key: data.key || prev.key,
                tempo: data.tempo || prev.tempo,
                lyrics: data.lyrics || "",
                chords: data.chords || "",
                hindi_lyrics: data.hindi_lyrics || "",
                youtube_id: data.youtube_id || prev.youtube_id,
                img: data.img || prev.img
            }));

            toast.success("AI Generation Successful!");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong with AI generation.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleMagicPaste = () => {
        if (!magicText.trim()) return;

        try {
            const { chords, lyrics, title, artist, key, tempo } = parseSongSheet(magicText);
            setFormData(prev => ({
                ...prev,
                chords: chords,
                lyrics: lyrics,
                title: title || prev.title,
                artist: artist || prev.artist,
                key: key || prev.key,
                tempo: tempo || prev.tempo
            }));

            toast.success("Magic applied! Chords and Lyrics parsed.");
        } catch (error) {
            toast.error("Failed to parse. Is current format correct?");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validation
        if (!formData.title || !formData.lyrics) {
            toast.error("Title and Lyric are required!");
            setIsLoading(false);
            return;
        }

        try {
            const userResponse = await supabase.auth.getUser();
            const userId = userResponse.data.user?.id;

            if (!userId) {
                toast.error("You must be logged in.");
                setIsLoading(false);
                return;
            }

            const payload = {
                title: formData.title,
                artist: formData.artist,
                category: formData.category,
                key: formData.key,
                tempo: formData.tempo,
                youtube_id: formData.youtube_id,
                img: formData.img || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80',
                lyrics: formData.lyrics,
                hindi_lyrics: formData.hindi_lyrics || null,
                chords: formData.chords || null,
                // Only update created_by on create? Usually owner stays same.
                ...(mode === 'create' ? { created_by: userId } : {})
            };

            if (mode === 'create') {
                try {
                    await createSongAdmin(payload);
                    toast.success("Song added successfully! 🎉");
                } catch (err: any) {
                    // Fallback to client-side if admin action fails (e.g. missing key)
                    console.warn("Admin action failed, falling back to client", err);
                    if (err.message.includes("Admin Key missing")) {
                        const { error: insertError } = await supabase.from('songs').insert([payload]);
                        if (insertError) throw insertError;
                        toast.success("Song added via Client (RLS Applied) 🎉");
                    } else {
                        throw err;
                    }
                }
            } else {
                if (!initialData?.id) throw new Error("No ID for update");

                // Try Admin Action first (Bypasses RLS)
                try {
                    await updateSongAdmin(initialData.id, payload);
                    toast.success("Song updated successfully! 🎉 (Admin Bypass)");
                } catch (err: any) {
                    console.error("Admin Update Failed:", err);

                    if (err.message.includes("Admin Key missing")) {
                        toast.error("Server Error: SUPABASE_SERVICE_ROLE_KEY is missing via .env. Cannot bypass RLS.");
                        // Optional: Try client side? Likely to fail too based on history.
                        // const { error: clientError } = await supabase.from('songs').update(payload).eq('id', initialData.id);
                        // if (clientError) throw clientError;
                    } else {
                        throw err;
                    }
                }
            }

            // await revalidateApp(); // Done inside action now

            // Force cache invalidation
            router.refresh();
            setTimeout(() => {
                router.push('/admin/songs');
            }, 500);

        } catch (error: any) {
            console.error('Error saving song message:', error.message);
            if (error.code === '23505') {
                toast.error("A song with this title already exists!");
            } else {
                toast.error(error.message || "Failed to save song.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin/songs" className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        {mode === 'create' ? "Add New Song" : "Edit Song"}
                    </h1>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${showPreview
                            ? 'bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/20'
                            : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        {showPreview ? <><EyeOff className="w-4 h-4" /> Edit Mode</> : <><Eye className="w-4 h-4" /> Preview Mode</>}
                    </button>
                </div>
            </div>

            {showPreview ? (
                // PREVIEW MODE
                <div className="rounded-3xl overflow-hidden border border-white/10 bg-[#050505]">
                    <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 text-center text-amber-500 text-xs font-bold uppercase tracking-widest">
                        Live Preview (Not Saved)
                    </div>
                    <SongViewer
                        songId="preview-mode"
                        title={formData.title || "Song Title"}
                        author={formData.artist || "Artist Name"}
                        originalKey={formData.key || "C"}
                        tempo={formData.tempo}
                        lyrics={formData.lyrics || "Lyrics will appear here..."}
                        hindiLyrics={formData.hindi_lyrics}
                        chords={formData.chords}
                        youtubeId={formData.youtube_id}
                        category={formData.category}
                        relatedSongs={[]} // Empty for preview
                    />
                </div>
            ) : (
                <>
                    {/* IMPORT TOOLS SECTION */}
                    <div className="mb-8">
                        <div className="bg-[#1A1A24] border border-white/5 rounded-3xl p-4 md:p-6 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-base md:text-lg font-bold text-white">AI Generator</h3>
                                        <p className="text-xs md:text-sm text-white/40">Auto-fill details from title</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <input
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        placeholder="Enter song title & artist..."
                                        className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 md:px-4 md:py-3 text-sm text-white focus:outline-none focus:border-indigo-500 w-full md:w-80"
                                        onKeyDown={e => e.key === 'Enter' && handleAiGenerate()}
                                    />
                                    <button
                                        onClick={handleAiGenerate}
                                        disabled={isGenerating}
                                        className="bg-white text-black px-3 py-2 md:px-4 md:py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 shrink-0 flex items-center justify-center"
                                    >
                                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: Metadata */}
                        <div className="lg:col-span-1 space-y-6">
                            <section className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                                <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Music className="w-4 h-4" />
                                    Basic Info
                                </h2>

                                <Input label="Song Title" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Way Maker" />
                                <Input label="Artist" name="artist" value={formData.artist} onChange={handleChange} placeholder="e.g. Sinach" />

                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                    >
                                        <option value="worship">Worship</option>
                                        <option value="praise">Praise</option>
                                        <option value="hymns">Hymns</option>
                                        <option value="kids">Kids</option>
                                        <option value="hindi">Hindi</option>
                                        <option value="contemporary">Contemporary</option>
                                    </select>
                                </div>
                            </section>

                            <section className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
                                <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <GripHorizontal className="w-4 h-4" />
                                    Details
                                </h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Key" name="key" value={formData.key} onChange={handleChange} placeholder="e.g. G" />
                                    <Input label="Tempo" name="tempo" value={formData.tempo} onChange={handleChange} placeholder="e.g. 72 BPM" />
                                </div>
                                <Input label="YouTube ID" name="youtube_id" value={formData.youtube_id} onChange={handleChange} placeholder="e.g. iJCV_2H9xD0" />
                                <Input label="Cover Image URL" name="img" value={formData.img} onChange={handleChange} placeholder="https://..." />
                            </section>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 rounded-xl font-bold text-black text-lg transition-all shadow-lg ${isLoading ? 'bg-amber-500/50 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 hover:scale-[1.02]'
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Saving...</span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2"><Save className="w-5 h-5" /> {mode === 'create' ? "Upload Song" : "Update Song"}</span>
                                )}
                            </button>
                        </div>

                        {/* RIGHT: Editors */}
                        <div className="lg:col-span-2 space-y-6">
                            <section className="bg-white/5 rounded-3xl p-6 border border-white/5 h-full">
                                <h2 className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <Mic2 className="w-4 h-4" />
                                    Content
                                </h2>

                                <div className="space-y-6">

                                    <div className="space-y-3 md:space-y-4">
                                        <div>
                                            <div className="flex items-center justify-between mb-1 md:mb-2">
                                                <label className="block text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest">Lyrics</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPreview(!showPreview)}
                                                    className="text-[10px] md:text-xs font-bold text-emerald-500 hover:text-emerald-400"
                                                >
                                                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                                                </button>
                                            </div>
                                            <textarea name="lyrics" value={formData.lyrics} onChange={handleChange} className="w-full h-40 md:h-64 bg-white/5 border border-white/10 rounded-xl px-3 py-2 md:px-4 md:py-3 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 resize-none" placeholder="Paste lyrics here..." />
                                        </div>

                                        {/* Chords */}
                                        <div>
                                            <label className="block text-[10px] md:text-xs font-bold text-white/40 uppercase tracking-widest mb-1 md:mb-2">Chords (ChordPro Format)</label>
                                            <textarea name="chords" value={formData.chords} onChange={handleChange} className="w-full h-40 md:h-64 bg-white/5 border border-white/10 rounded-xl px-3 py-2 md:px-4 md:py-3 text-white font-mono text-sm focus:outline-none focus:border-emerald-500 resize-none" placeholder="[C] Amazing Grace..." />
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Chords (Optional)</label>
                                        </div>
                                        <textarea
                                            name="chords"
                                            value={formData.chords}
                                            onChange={handleChange}
                                            rows={10}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-4 text-amber-200/80 font-mono text-sm leading-relaxed focus:outline-none focus:border-amber-500/50 transition-colors resize-none placeholder:text-white/10"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Hindi Lyrics (Optional)</label>
                                        </div>
                                        <textarea
                                            name="hindi_lyrics"
                                            value={formData.hindi_lyrics}
                                            onChange={handleChange}
                                            rows={6}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-4 text-white font-serif leading-relaxed focus:outline-none focus:border-amber-500/50 transition-colors resize-none placeholder:text-white/10"
                                            placeholder={`तू यहाँ है...\nकार्य कर रहा है...`}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </form >
                </>
            )
            }
        </div >
    );
}

function Input({ label, name, value, onChange, placeholder, required }: any) {
    return (
        <div>
            <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-colors font-medium"
            />
        </div>
    );
}
