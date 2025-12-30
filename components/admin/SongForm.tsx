'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { Save, Eye, EyeOff, Music, Mic2, GripHorizontal, ArrowLeft, Loader2, Sparkles, BrainCircuit, ClipboardPaste } from 'lucide-react';
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
    const [userId, setUserId] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        // Pre-fetch session on mount
        const fetchAuth = async () => {
            const { data } = await supabase.auth.getSession();
            if (data?.session?.user) {
                setUserId(data.session.user.id);
            }
        };
        fetchAuth();
    }, []);

    // AI & Tabs State
    const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiArtist, setAiArtist] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [useHighAccuracy, setUseHighAccuracy] = useState(false);

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
                    artist: aiArtist,
                    useHighAccuracy: useHighAccuracy
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

            addLog(`Magic Paste: Title="${title.slice(0, 20)}...", Artist="${artist}"`);

            // Safety: Ensure title isn't accidentally a whole paragraph
            const safeTitle = (title && title.length > 100) ? "" : title;

            setFormData(prev => ({
                ...prev,
                chords: chords,
                lyrics: lyrics,
                title: safeTitle || prev.title,
                artist: artist || prev.artist,
                key: key || prev.key,
                tempo: tempo || prev.tempo
            }));

            toast.success("Magic applied! Chords and Lyrics parsed.");
        } catch (error) {
            toast.error("Failed to parse. Is current format correct?");
        }
    };

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
        console.log(msg);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLogs([]); // Clear previous logs
        addLog("Starting server-side submission...");

        try {
            // STEP 0: Connectivity Check via SERVER
            addLog("Step 0: Checking Server Connection...");
            const { checkConnection } = await import('@/app/actions/admin');
            const serverStatus = await checkConnection();

            if (!serverStatus.ok) {
                addLog(`SERVER ERROR: ${serverStatus.error}`);
                throw new Error(`Server cannot reach DB: ${serverStatus.error}`);
            }
            addLog("Server Connection: OK");

            // STEP 1: Validation
            addLog("Step 1: Validating form data...");
            if (!formData.title || !formData.lyrics) {
                addLog("Error: Title or Lyrics missing.");
                toast.error("Title and Lyrics are required!");
                setIsLoading(false);
                return;
            }
            addLog("Validation passed.");

            // STEP 2: Auth Check (Using Pre-fetched ID)
            addLog("Step 2: verifying user session...");

            if (!userId) {
                // Last ditch attempt with timeout
                console.warn("User ID not pre-fetched, trying one last time...");

                const sessionPromise = supabase.auth.getSession();
                const sessionTimeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Auth Stuck (5s) - Please Refresh")), 5000)
                );

                const { data } = await Promise.race([sessionPromise, sessionTimeout]) as any;

                if (!data.session?.user) {
                    addLog("Error: Not logged in.");
                    toast.error("You are not logged in. Please Login.");
                    setIsLoading(false);
                    return;
                }
                setUserId(data.session.user.id);
            }

            const finalUserId = userId || (await supabase.auth.getUser()).data.user?.id;
            addLog(`User Verified: ${finalUserId?.slice(0, 5)}...`);

            // STEP 3: Payload
            addLog("Step 3: Preparing Payload...");
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
                ...(mode === 'create' ? { created_by: userId } : {})
            };

            // STEP 4: Server Action Execution
            addLog("Step 4: Executing Server Action...");

            let result;
            if (mode === 'create') {
                result = await createSongAdmin(payload);
            } else {
                if (!initialData?.id) throw new Error("Missing ID for update");
                result = await updateSongAdmin(initialData.id, payload);
            }

            if (!result.success) {
                const errMsg = result.error || "Unknown Server Error";
                addLog(`SERVER ACTION ERROR: ${errMsg}`);
                throw new Error(errMsg);
            }

            addLog("Action Complete. Success!");

            addLog("Success! Redirecting...");
            toast.success("Song Saved Successfully!");

            // Wait for user to see log
            await new Promise(resolve => setTimeout(resolve, 1000));

            window.location.href = '/admin/songs';

        } catch (error: any) {
            addLog(`CRITICAL ERROR: ${error.message}`);
            console.error('Submission Error:', error);
            toast.error(`Failed: ${error.message}`);
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

            {/* DEBUG CONSOLE */}
            {logs.length > 0 && (
                <div className="mb-8 bg-black border border-red-500/50 rounded-xl p-4 font-mono text-xs text-red-200 max-h-60 overflow-y-auto">
                    <h3 className="text-red-500 font-bold mb-2 sticky top-0 bg-black">DEBUG LOGS:</h3>
                    {logs.map((log, i) => (
                        <div key={i} className="border-b border-red-900/30 py-1">{log}</div>
                    ))}
                </div>
            )}

            {
                showPreview ? (
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
                            coverImage={formData.img}
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
                                    <div className="flex flex-col gap-2 w-full md:w-auto">
                                        <div className="flex items-center gap-2">
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
                                        <label className="flex items-center gap-2 cursor-pointer group w-fit ml-auto">
                                            <input
                                                type="checkbox"
                                                checked={useHighAccuracy}
                                                onChange={(e) => setUseHighAccuracy(e.target.checked)}
                                                className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50"
                                            />
                                            <span className={`text-xs font-bold uppercase tracking-wider ${useHighAccuracy ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/50'} transition-colors`}>
                                                High Accuracy (Paid)
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* MAGIC PASTE SECTION */}
                        <div className="bg-[#1A1A24] border border-white/5 rounded-3xl p-4 md:p-6 mb-8">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex items-start gap-3 md:w-1/3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
                                        <ClipboardPaste className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-base md:text-lg font-bold text-white">Magic Paste</h3>
                                        <p className="text-xs md:text-sm text-white/40 mb-2">
                                            Paste content from Ultimate Guitar or other sites.
                                            We'll try to separate Lyrics & Chords automatically.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-1 flex gap-2">
                                    <textarea
                                        value={magicText}
                                        onChange={e => setMagicText(e.target.value)}
                                        placeholder={`Paste here like:\n[G] Amazing grace [C] how sweet...`}
                                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 min-h-[80px]"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleMagicPaste}
                                        disabled={!magicText.trim()}
                                        className="bg-emerald-600 text-white px-4 rounded-xl font-bold hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 flex flex-col items-center justify-center gap-1"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        <span className="text-xs">Auto Fill</span>
                                    </button>
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
                )
            }
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
