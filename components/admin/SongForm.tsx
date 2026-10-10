'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import {
    Save,
    Eye,
    EyeOff,
    Music,
    Mic2,
    GripHorizontal,
    Loader2,
    Sparkles,
    BrainCircuit,
    ClipboardPaste,
    ChevronDown,
    ChevronUp,
    Wand2,
    Check
} from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import SongViewer from '@/components/songs/SongViewer';
import { parseSongSheet } from '@/lib/songParser';
import { Song } from '@/data/types';
import { updateSongAdmin, createSongAdmin } from '@/app/actions/admin';
import { extractYoutubeId } from '@/lib/utils';


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

    // Assistant Tools State (AI vs Magic Paste tabs)
    const [activeTool, setActiveTool] = useState<'ai' | 'magic' | null>('ai');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiArtist, setAiArtist] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState('');
    const [useHighAccuracy, setUseHighAccuracy] = useState(false);

    const initialYt = extractYoutubeId(initialData?.youtubeId || initialData?.youtube_id || '');
    // If initial image is empty or an unsplash placeholder and YouTube ID exists, auto-use YouTube thumbnail!
    const initialImg = (initialData?.img && !initialData.img.includes('images.unsplash.com'))
        ? initialData.img
        : (initialYt ? `https://img.youtube.com/vi/${initialYt}/hqdefault.jpg` : (initialData?.img || ''));

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        artist: initialData?.artist || '',
        category: initialData?.category || 'worship',
        key: initialData?.key || '',
        tempo: initialData?.tempo || '',
        youtube_id: initialYt,
        img: initialImg,
        lyrics: initialData?.lyrics || '',
        hindi_lyrics: initialData?.hindiLyrics || initialData?.hindi_lyrics || '',
        chords: initialData?.chords || ''
    });

    const cleanYtId = extractYoutubeId(formData.youtube_id);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'youtube_id') {
            const cleanId = extractYoutubeId(value);
            setFormData(prev => {
                const next = { ...prev, youtube_id: cleanId };
                // If img is currently empty OR was an unsplash image OR was a youtube thumbnail, auto-update img:
                if (!prev.img || prev.img.includes('images.unsplash.com') || prev.img.includes('img.youtube.com')) {
                    next.img = cleanId ? `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg` : '';
                }
                return next;
            });
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;

        setIsGenerating(true);
        setGenerationProgress('Connecting to AI...');

        try {
            setGenerationProgress('Sending request...');
            const res = await fetch('/api/generate-song', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    songName: aiPrompt,
                    artist: aiArtist,
                    useHighAccuracy: useHighAccuracy
                })
            });

            setGenerationProgress('Processing response...');
            const data = await res.json();

            // Handle rate limiting
            if (res.status === 429) {
                const resetTime = data.reset ? new Date(data.reset).toLocaleTimeString() : 'soon';
                toast.error(`Too many requests! Please wait until ${resetTime} and try again.`);
                setIsGenerating(false);
                setGenerationProgress('');
                return;
            }

            if (!res.ok) throw new Error(data.error || 'Failed to generate');

            setGenerationProgress('Applying data...');
            setFormData(prev => {
                const cleanAiYt = extractYoutubeId(data.youtube_id || prev.youtube_id);
                // Ensure AI generated chords are formatted in clean ChordPro if AI returned chord-over-lyric
                let finalChords = data.chords || "";
                let finalLyrics = data.lyrics || "";
                if (finalChords && !finalChords.includes('[')) {
                    const parsed = parseSongSheet(finalChords);
                    finalChords = parsed.chords || finalChords;
                    finalLyrics = parsed.lyrics || finalLyrics;
                }

                return {
                    ...prev,
                    title: data.title || prev.title,
                    artist: data.artist || prev.artist,
                    key: data.key || prev.key,
                    tempo: data.tempo || prev.tempo,
                    lyrics: finalLyrics,
                    chords: finalChords,
                    hindi_lyrics: data.hindi_lyrics || "",
                    youtube_id: cleanAiYt,
                    img: cleanAiYt ? `https://img.youtube.com/vi/${cleanAiYt}/hqdefault.jpg` : (data.img || prev.img)
                };
            });

            setGenerationProgress('Complete!');
            toast.success("AI Generation Successful!");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong with AI generation.");
        } finally {
            setIsGenerating(false);
            setTimeout(() => setGenerationProgress(''), 1000);
        }
    };

    const handleMagicPaste = () => {
        if (!magicText.trim()) return;

        try {
            const { chords, lyrics, title, artist, key, tempo } = parseSongSheet(magicText);

            addLog(`Magic Paste: Title="${title.slice(0, 20)}...", Artist="${artist}"`);

            // Safety: Ensure title isn't accidentally capo instruction or whole paragraph
            const safeTitle = (title && title.length < 80 && !title.toLowerCase().includes('capo')) ? title : "";

            setFormData(prev => ({
                ...prev,
                chords: chords,
                lyrics: lyrics,
                title: safeTitle || prev.title,
                artist: artist || prev.artist,
                key: key || prev.key,
                tempo: tempo || prev.tempo
            }));

            toast.success("✨ Magic applied! Chords and Lyrics formatted perfectly.");
        } catch (error) {
            toast.error("Failed to parse. Is current format correct?");
        }
    };

    const handleAutoFormatFields = () => {
        const textToFormat = formData.chords || formData.lyrics;
        if (!textToFormat.trim()) {
            toast.error("Please enter some chords or lyrics first!");
            return;
        }

        try {
            const parsed = parseSongSheet(formData.chords ? `${formData.title ? 'Title: ' + formData.title + '\n' : ''}${formData.chords}` : formData.lyrics);

            setFormData(prev => ({
                ...prev,
                title: (!prev.title || prev.title.toLowerCase().includes('capo')) ? (parsed.title || prev.title) : prev.title,
                key: parsed.key || prev.key,
                tempo: parsed.tempo || prev.tempo,
                chords: parsed.chords || prev.chords,
                lyrics: parsed.lyrics || prev.lyrics
            }));

            toast.success("✨ Formatted into Rooh-E-Paak ChordPro layout!");
        } catch (e) {
            toast.error("Failed to auto-format.");
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
                console.warn("User ID not pre-fetched, trying one last time...");
                const sessionPromise = supabase.auth.getSession();
                const sessionTimeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Auth Stuck (5s) - Please Refresh")), 5000)
                );

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            const cleanYt = extractYoutubeId(formData.youtube_id);
            let finalImg = formData.img?.trim() || '';

            // Auto-fallback: If user didn't enter custom image, or if it's the old unsplash placeholder, use YouTube thumbnail!
            if (!finalImg || finalImg.includes('images.unsplash.com')) {
                if (cleanYt) {
                    finalImg = `https://img.youtube.com/vi/${cleanYt}/hqdefault.jpg`;
                } else if (!finalImg) {
                    finalImg = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80';
                }
            }

            const payload = {
                title: formData.title,
                artist: formData.artist,
                category: formData.category,
                key: formData.key,
                tempo: formData.tempo,
                youtube_id: cleanYt,
                img: finalImg,
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
            toast.success("Song Saved Successfully!");

            // Wait for user to see log
            await new Promise(resolve => setTimeout(resolve, 800));

            window.location.href = '/admin/songs';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            addLog(`CRITICAL ERROR: ${error.message}`);
            console.error('Submission Error:', error);
            toast.error(`Failed: ${error.message}`);
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-24 md:pb-20 px-2 sm:px-4 md:px-6">
            {/* TOP HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8 pt-1">
                <div className="flex items-center gap-3">
                    <BackButton
                        fallback="/admin/songs"
                        className="p-2 sm:p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5"
                        iconClassName="w-5 h-5"
                    />
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                            {mode === 'create' ? "Add New Song" : "Edit Song"}
                        </h1>
                        <p className="text-xs text-white/40 hidden sm:block">
                            {mode === 'create' ? "Publish a new chord sheet to the song library" : "Update lyrics, chords and metadata"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-all ${
                            showPreview
                                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-black'
                                : 'bg-white/10 text-white hover:bg-white/20 border border-white/5'
                        }`}
                    >
                        {showPreview ? (
                            <><EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Edit Mode</>
                        ) : (
                            <><Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Preview</>
                        )}
                    </button>
                </div>
            </div>

            {/* DEBUG CONSOLE */}
            {logs.length > 0 && (
                <div className="mb-6 bg-black border border-red-500/50 rounded-2xl p-4 font-mono text-xs text-red-200 max-h-48 overflow-y-auto">
                    <h3 className="text-red-500 font-bold mb-2 sticky top-0 bg-black">DEBUG LOGS:</h3>
                    {logs.map((log, i) => (
                        <div key={i} className="border-b border-red-900/30 py-1">{log}</div>
                    ))}
                </div>
            )}

            {showPreview ? (
                /* PREVIEW MODE */
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#050505]">
                    <div className="bg-amber-500/10 border-b border-amber-500/20 p-2.5 sm:p-3 text-center text-amber-500 text-[11px] sm:text-xs font-bold uppercase tracking-widest">
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
                        relatedSongs={[]}
                    />
                </div>
            ) : (
                <>
                    {/* ASSISTANT QUICK TOOLS (COMPACT & COLLAPSIBLE FOR MOBILE) */}
                    <div className="mb-6 bg-[#0D0B14] border border-white/10 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Wand2 className="w-4 h-4 text-amber-400" />
                                <span className="text-xs font-bold uppercase tracking-wider text-white/80">Smart Tools</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveTool(activeTool === 'ai' ? null : 'ai')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                        activeTool === 'ai'
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>AI Generator</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTool(activeTool === 'magic' ? null : 'magic')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                        activeTool === 'magic'
                                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <ClipboardPaste className="w-3.5 h-3.5" />
                                    <span>Magic Paste</span>
                                </button>
                                {activeTool && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTool(null)}
                                        className="p-1.5 rounded-lg text-white/40 hover:text-white transition-colors"
                                        title="Collapse tool"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* AI Generator Panel */}
                        {activeTool === 'ai' && (
                            <div className="pt-3.5 space-y-3">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        value={aiPrompt}
                                        onChange={e => setAiPrompt(e.target.value)}
                                        placeholder="Enter song name & artist (e.g. Way Maker - Sinach)..."
                                        className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
                                        onKeyDown={e => e.key === 'Enter' && handleAiGenerate()}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAiGenerate}
                                        disabled={isGenerating || !aiPrompt.trim()}
                                        className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
                                    >
                                        {isGenerating ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                                        ) : (
                                            <><BrainCircuit className="w-4 h-4" /> Auto Generate</>
                                        )}
                                    </button>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                    {generationProgress ? (
                                        <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            <span>{generationProgress}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[11px] text-white/40">Fills title, artist, key, tempo, lyrics & chords automatically</span>
                                    )}

                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={useHighAccuracy}
                                            onChange={(e) => setUseHighAccuracy(e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/50"
                                        />
                                        <span className={`text-[11px] font-semibold ${useHighAccuracy ? 'text-indigo-400' : 'text-white/40 group-hover:text-white/60'} transition-colors`}>
                                            High Accuracy Model
                                        </span>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Magic Paste Panel */}
                        {activeTool === 'magic' && (
                            <div className="pt-3.5 space-y-3">
                                <p className="text-[11px] text-white/40">
                                    Paste chords from Ultimate Guitar, PraiseCharts, etc. We will auto-detect chords and lyrics format.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <textarea
                                        value={magicText}
                                        onChange={e => setMagicText(e.target.value)}
                                        placeholder={`[G] Amazing grace [C] how sweet the sound...`}
                                        rows={3}
                                        className="flex-1 bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-500 resize-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleMagicPaste}
                                        disabled={!magicText.trim()}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all disabled:opacity-50 flex sm:flex-col items-center justify-center gap-1 shrink-0"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        <span>Parse & Fill</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MAIN FORM */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* SECTION 1: METADATA & DETAILS (1 COLUMN ON DESKTOP) */}
                            <div className="lg:col-span-1 space-y-6">
                                {/* Basic Info */}
                                <section className="bg-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/5 space-y-4">
                                    <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                        <Music className="w-3.5 h-3.5 text-amber-500" />
                                        Basic Info
                                    </h2>

                                    <Input
                                        label="Song Title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Way Maker"
                                    />
                                    <Input
                                        label="Artist / Band"
                                        name="artist"
                                        value={formData.artist}
                                        onChange={handleChange}
                                        placeholder="e.g. Sinach"
                                    />

                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1.5">
                                                Category
                                            </label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                            >
                                                <option value="worship">Worship</option>
                                                <option value="praise">Praise</option>
                                                <option value="hymns">Hymns</option>
                                                <option value="kids">Kids</option>
                                                <option value="contemporary">Contemporary</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1.5">
                                                Language
                                            </label>
                                            <select
                                                name="language"
                                                value={formData.hindi_lyrics ? 'hindi' : 'english'}
                                                onChange={(e) => {
                                                    const isHindi = e.target.value === 'hindi';
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        hindi_lyrics: isHindi ? (prev.hindi_lyrics || ' ') : ''
                                                    }));
                                                }}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                                            >
                                                <option value="english">English</option>
                                                <option value="hindi">Hindi</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                {/* Musical & Media Details */}
                                <section className="bg-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/5 space-y-4">
                                    <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                        <GripHorizontal className="w-3.5 h-3.5 text-amber-500" />
                                        Details
                                    </h2>

                                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                        <Input
                                            label="Original Key"
                                            name="key"
                                            value={formData.key}
                                            onChange={handleChange}
                                            placeholder="e.g. G"
                                        />
                                        <Input
                                            label="Tempo"
                                            name="tempo"
                                            value={formData.tempo}
                                            onChange={handleChange}
                                            placeholder="e.g. 72 BPM"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Input
                                            label="YouTube Video ID"
                                            name="youtube_id"
                                            value={formData.youtube_id}
                                            onChange={handleChange}
                                            placeholder="e.g. ocgm5MCe8Cw (ya YouTube link)"
                                        />

                                        {/* LIVE YOUTUBE THUMBNAIL AUTO-DETECTION PREVIEW */}
                                        {cleanYtId ? (
                                            <div className="rounded-xl overflow-hidden border border-amber-500/30 bg-black/50 p-2.5 flex items-center gap-3 animate-fade-in-up">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={`https://img.youtube.com/vi/${cleanYtId}/hqdefault.jpg`}
                                                    alt="YouTube Thumbnail"
                                                    className="w-20 h-13 object-cover rounded-lg border border-white/10 shrink-0 shadow"
                                                />
                                                <div className="text-xs leading-tight flex-1">
                                                    <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-0.5">
                                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                        <span>Thumbnail Auto-Applied</span>
                                                    </div>
                                                    <p className="text-white/40 text-[11px]">
                                                        Cover image URL daalne ki jarurat nahi hai! Ye thumbnail sab jagah automatically use hoga.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div>
                                        <Input
                                            label="Cover Image URL (Optional)"
                                            name="img"
                                            value={formData.img}
                                            onChange={handleChange}
                                            placeholder={cleanYtId ? "Auto-managed by YouTube Video ID" : "https://images.unsplash.com/..."}
                                        />
                                        <p className="text-[10px] text-white/40 mt-1">
                                            {cleanYtId ? (
                                                <span className="text-amber-400/90 font-medium">
                                                    ✨ YouTube ID dali hai, isliye is URL ko khaali chhod sakte hain (automatic thumbnail use hoga).
                                                </span>
                                            ) : (
                                                <span>Agar YouTube Video ID nahi hai, tabhi custom cover image URL dalein.</span>
                                            )}
                                        </p>
                                    </div>
                                </section>

                                {/* DESKTOP-ONLY SUBMIT BUTTON (in left column) */}
                                <div className="hidden lg:block pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full py-3.5 rounded-xl font-bold text-black text-base transition-all shadow-lg ${
                                            isLoading
                                                ? 'bg-amber-500/50 cursor-not-allowed'
                                                : 'bg-amber-500 hover:bg-amber-400 hover:scale-[1.01] active:scale-[0.99] shadow-amber-500/20'
                                        }`}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" /> Saving Song...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <Save className="w-5 h-5" /> {mode === 'create' ? "Publish Song" : "Update Song"}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* SECTION 2: CONTENT (LYRICS, CHORDS, HINDI) - 2 COLUMNS ON DESKTOP */}
                            <div className="lg:col-span-2 space-y-6">
                                <section className="bg-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                            <Mic2 className="w-3.5 h-3.5 text-emerald-400" />
                                            Lyrics & Chords
                                        </h2>
                                        <span className="text-[11px] text-white/30 hidden sm:inline">Use ChordPro format (e.g. [G], [Am])</span>
                                    </div>

                                    {/* Lyrics */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider">
                                                Plain Lyrics <span className="text-red-500">*</span>
                                            </label>
                                            <span className="text-[10px] text-white/30">Lines: {formData.lyrics ? formData.lyrics.split('\n').length : 0}</span>
                                        </div>
                                        <textarea
                                            name="lyrics"
                                            value={formData.lyrics}
                                            onChange={handleChange}
                                            required
                                            rows={8}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-3 sm:p-4 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-emerald-500 resize-y min-h-[140px] leading-relaxed placeholder:text-white/20"
                                            placeholder="Paste plain lyrics here line by line..."
                                        />
                                    </div>

                                    {/* Chords (ChordPro) */}
                                    <div>
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                                            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider">
                                                Chords (ChordPro Format)
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={handleAutoFormatFields}
                                                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:text-white hover:border-amber-400 text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                                                    title="Auto-format chords into Rooh-e-paak ChordPro style"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                                    <span>✨ Auto-Format (Rooh-E-Paak Style)</span>
                                                </button>
                                                <span className="text-[10px] text-emerald-400/70 font-mono hidden sm:inline">[C], [G] inline</span>
                                            </div>
                                        </div>
                                        <textarea
                                            name="chords"
                                            value={formData.chords}
                                            onChange={handleChange}
                                            rows={8}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-3 sm:p-4 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-emerald-500 resize-y min-h-[140px] leading-relaxed placeholder:text-white/20"
                                            placeholder="[G] You are here, [D] moving in our midst..."
                                        />
                                    </div>

                                    {/* Hindi Lyrics */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider">
                                                Hindi Lyrics (Optional)
                                            </label>
                                            <span className="text-[10px] text-white/30">Devanagari script</span>
                                        </div>
                                        <textarea
                                            name="hindi_lyrics"
                                            value={formData.hindi_lyrics}
                                            onChange={handleChange}
                                            rows={5}
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl p-3 sm:p-4 text-white font-serif leading-relaxed text-xs sm:text-sm focus:outline-none focus:border-amber-500/50 resize-y min-h-[100px] placeholder:text-white/20"
                                            placeholder="तू यहाँ है, कार्य कर रहा है..."
                                        />
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* MOBILE SUBMIT BUTTON (PROPERLY AT BOTTOM OF ENTIRE FORM) */}
                        <div className="lg:hidden pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 rounded-xl font-bold text-black text-base transition-all shadow-xl ${
                                    isLoading
                                        ? 'bg-amber-500/50 cursor-not-allowed'
                                        : 'bg-amber-500 hover:bg-amber-400 active:scale-[0.98] shadow-amber-500/30'
                                }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" /> Saving Song...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Save className="w-5 h-5" /> {mode === 'create' ? "Publish Song" : "Update Song"}
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Input({ label, name, value, onChange, placeholder, required }: any) {
    return (
        <div>
            <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-colors font-medium"
            />
        </div>
    );
}
