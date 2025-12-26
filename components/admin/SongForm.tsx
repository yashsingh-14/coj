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
            console.error('Error saving song object:', JSON.stringify(error, null, 2));
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
                    {/* IMPORT TOOLS SECTION (Only show for create or if user wants to overwrite) */}
                    <div className="mb-8">
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setActiveTab('manual')}
                                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'manual' ? 'text-amber-500' : 'text-white/40 hover:text-white'
                                    }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                Magic Paste (Manual)
                            </button>
                            <span className="text-white/10">|</span>
                            <button
                                onClick={() => setActiveTab('ai')}
                                className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors ${activeTab === 'ai' ? 'text-amber-500' : 'text-white/40 hover:text-white'
                                    }`}
                            >
                                <BrainCircuit className="w-4 h-4" />
                                AI Auto-Generate
                            </button>
                        </div>

                        {activeTab === 'manual' && (
                            <div className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 rounded-3xl p-6 animate-fade-in-down mb-8">
                                <h3 className="text-lg font-bold text-white mb-2">Paste Sheet Music</h3>
                                <p className="text-white/40 text-sm mb-4">
                                    Paste mixed lyrics/chords here. We'll separate them and automatically extract metadata.
                                </p>
                                <textarea
                                    value={magicText}
                                    onChange={(e) => setMagicText(e.target.value)}
                                    rows={8}
                                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-xs font-mono text-white/80 focus:outline-none focus:border-amber-500/50 mb-4"
                                    placeholder={`Title: Amazing Grace\nArtist: John Newton\nKey: G\n\nG        D\nAmazing Grace\n      Em      C\nHow sweet the sound`}
                                />
                                <button
                                    type="button"
                                    onClick={handleMagicPaste}
                                    className="px-6 py-3 bg-amber-500 text-black font-bold rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-2 text-sm"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    Auto-Process
                                </button>
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="bg-gradient-to-r from-purple-500/10 to-transparent border border-purple-500/20 rounded-3xl p-6 animate-fade-in-down mb-8">
                                <h3 className="text-lg font-bold text-white mb-2">AI Auto-Generate</h3>
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            value={aiPrompt}
                                            onChange={(e) => setAiPrompt(e.target.value)}
                                            placeholder="Song Title"
                                            className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 placeholder:text-white/20"
                                        />
                                        <input
                                            type="text"
                                            value={aiArtist}
                                            onChange={(e) => setAiArtist(e.target.value)}
                                            placeholder="Artist (Optional)"
                                            className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 placeholder:text-white/20"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAiGenerate}
                                        disabled={isGenerating || !aiPrompt}
                                        className="px-6 py-4 bg-purple-500 text-white font-bold rounded-xl hover:bg-purple-400 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <BrainCircuit className="w-4 h-4" />
                                                Generate Song Data
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
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
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Lyrics (English) *</label>
                                            <span className="text-xs text-white/20">Paste plain text here</span>
                                        </div>
                                        <textarea
                                            name="lyrics"
                                            value={formData.lyrics}
                                            onChange={handleChange}
                                            required
                                            rows={12}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-4 text-white font-serif leading-relaxed focus:outline-none focus:border-amber-500/50 transition-colors resize-none placeholder:text-white/10"
                                            placeholder={`Way maker, miracle worker...\nPromise keeper, light in the darkness...`}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Chords (ChordPro / Bracket Format)</label>
                                            <span className="text-xs text-white/20">Use [C] [G] [Am] format</span>
                                        </div>
                                        <textarea
                                            name="chords"
                                            value={formData.chords}
                                            onChange={handleChange}
                                            rows={10}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-4 text-amber-200/80 font-mono text-sm leading-relaxed focus:outline-none focus:border-amber-500/50 transition-colors resize-none placeholder:text-white/10"
                                            placeholder={`[Verse 1]\n[G]           [C]\nYou are here, moving in our midst`}
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
                    </form>
                </>
            )}
        </div>
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
