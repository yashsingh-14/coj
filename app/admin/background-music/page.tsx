'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Radio,
    Plus,
    Trash2,
    Edit3,
    ArrowUp,
    ArrowDown,
    Save,
    RotateCcw,
    ExternalLink,
    Play,
    Pause,
    CheckCircle2,
    AlertCircle,
    Music2,
    Sparkles,
    Youtube,
    Check,
    X,
    Eye,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
    DEFAULT_WORSHIP_STREAMS,
    WorshipStreamItem,
    parseYouTubeVideoId
} from '@/lib/worshipStreams';
import { saveWorshipBackgroundMusicSetting } from '@/app/actions/admin';

const MOOD_OPTIONS = [
    'Sermon & Preaching',
    'Altar Call & Prayer',
    'Holy Spirit Presence',
    'Reflection & Word',
    'Prophetic Worship',
    'Continuous Service',
    'Custom Worship'
];

export default function AdminBackgroundMusicPage() {
    const [streams, setStreams] = useState<WorshipStreamItem[]>(DEFAULT_WORSHIP_STREAMS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Active Preview
    const [previewStream, setPreviewStream] = useState<WorshipStreamItem | null>(DEFAULT_WORSHIP_STREAMS[0]);
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

    // Modal / Drawer State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<WorshipStreamItem | null>(null);

    // Form State
    const [formTitle, setFormTitle] = useState('');
    const [formUrlOrId, setFormUrlOrId] = useState('');
    const [formMood, setFormMood] = useState(MOOD_OPTIONS[0]);
    const [formDuration, setFormDuration] = useState('3 Hours');
    const [formDescription, setFormDescription] = useState('');
    const [formIsActive, setFormIsActive] = useState(true);
    const [formParsedId, setFormParsedId] = useState<string | null>(null);

    // Load initial settings
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'worship_background_music')
                .maybeSingle();

            if (data?.value && Array.isArray(data.value) && data.value.length > 0) {
                setStreams(data.value);
                setPreviewStream(data.value[0]);
            } else {
                setStreams(DEFAULT_WORSHIP_STREAMS);
                setPreviewStream(DEFAULT_WORSHIP_STREAMS[0]);
            }
        } catch (err) {
            console.error('Error fetching worship background music:', err);
            toast.error('Failed to load settings, loaded defaults');
        } finally {
            setIsLoading(false);
        }
    };

    // Live parse input video ID
    useEffect(() => {
        const parsed = parseYouTubeVideoId(formUrlOrId);
        setFormParsedId(parsed);
    }, [formUrlOrId]);

    // Handle Save All to Supabase
    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            const res = await saveWorshipBackgroundMusicSetting(streams);
            if (res.success) {
                toast.success('Background music streams updated & synced live to /tools/pad!');
                setHasUnsavedChanges(false);
            } else {
                toast.error('Failed to save: ' + (res.error || 'Unknown error'));
            }
        } catch (err: unknown) {
            toast.error('Save failed: ' + (err instanceof Error ? err.message : 'Network error'));
        } finally {
            setIsSaving(false);
        }
    };

    // Reset to defaults
    const handleResetDefaults = () => {
        if (confirm('Are you sure you want to restore the verified Call of Jesus default worship streams?')) {
            setStreams(DEFAULT_WORSHIP_STREAMS);
            setPreviewStream(DEFAULT_WORSHIP_STREAMS[0]);
            setHasUnsavedChanges(true);
            toast.info('Restored default streams. Click "Save & Sync" to apply.');
        }
    };

    // Reordering
    const moveItem = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= streams.length) return;

        const updated = [...streams];
        const [moved] = updated.splice(index, 1);
        updated.splice(targetIndex, 0, moved);

        setStreams(updated);
        setHasUnsavedChanges(true);
    };

    // Toggle Active
    const toggleActive = (id: string) => {
        const updated = streams.map(s => s.id === id ? { ...s, isActive: !(s.isActive ?? true) } : s);
        setStreams(updated);
        setHasUnsavedChanges(true);
    };

    // Delete
    const deleteItem = (id: string) => {
        if (confirm('Delete this background music track?')) {
            const updated = streams.filter(s => s.id !== id);
            setStreams(updated);
            if (previewStream?.id === id) {
                setPreviewStream(updated[0] || null);
            }
            setHasUnsavedChanges(true);
            toast.success('Track removed from list');
        }
    };

    // Open Add Modal
    const openAddModal = () => {
        setEditingItem(null);
        setFormTitle('');
        setFormUrlOrId('');
        setFormMood(MOOD_OPTIONS[0]);
        setFormDuration('3 Hours');
        setFormDescription('Gentle, continuous instrumental atmosphere for sermons & prayer.');
        setFormIsActive(true);
        setFormParsedId(null);
        setIsModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (item: WorshipStreamItem) => {
        setEditingItem(item);
        setFormTitle(item.title);
        setFormUrlOrId(item.youtubeId);
        setFormMood(item.mood || MOOD_OPTIONS[0]);
        setFormDuration(item.duration || '3 Hours');
        setFormDescription(item.description || '');
        setFormIsActive(item.isActive ?? true);
        setFormParsedId(item.youtubeId);
        setIsModalOpen(true);
    };

    // Save item from Modal
    const handleModalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const extractedId = parseYouTubeVideoId(formUrlOrId);

        if (!extractedId) {
            toast.error('Please enter a valid YouTube Video URL or 11-character Video ID');
            return;
        }

        if (!formTitle.trim()) {
            toast.error('Please enter a track title');
            return;
        }

        if (editingItem) {
            // Update
            const updated = streams.map(s => {
                if (s.id === editingItem.id) {
                    return {
                        ...s,
                        title: formTitle.trim(),
                        youtubeId: extractedId,
                        mood: formMood,
                        duration: formDuration.trim() || 'Continuous',
                        description: formDescription.trim(),
                        isActive: formIsActive
                    };
                }
                return s;
            });
            setStreams(updated);
            toast.success('Track updated');
        } else {
            // Add new
            const newItem: WorshipStreamItem = {
                id: 'stream-' + Date.now(),
                title: formTitle.trim(),
                youtubeId: extractedId,
                mood: formMood,
                duration: formDuration.trim() || 'Continuous',
                description: formDescription.trim(),
                isActive: formIsActive
            };
            setStreams([...streams, newItem]);
            setPreviewStream(newItem);
            toast.success('New track added');
        }

        setHasUnsavedChanges(true);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 pb-20 max-w-6xl mx-auto">
            {/* Top Header Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#13111E] via-[#0E0C17] to-[#08070D] border border-white/10 p-6 sm:p-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                                <Radio className="w-3.5 h-3.5" />
                                <span>Live Stream Manager</span>
                            </span>
                            {hasUnsavedChanges && (
                                <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[11px] font-bold animate-pulse">
                                    ● Unsaved Changes
                                </span>
                            )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Worship Background Music & Sermon Streams
                        </h1>
                        <p className="text-xs sm:text-sm text-white/50 max-w-2xl mt-1.5 leading-relaxed">
                            Customise the continuous prayer piano, ambient pads & preaching instrumental streams. All changes sync directly with the <code className="text-amber-400 font-mono">/tools/pad</code> page.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/10 active:scale-95 shadow-md"
                        >
                            <Plus className="w-4 h-4 text-amber-400" />
                            <span>Add Track</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleResetDefaults}
                            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/5 active:scale-95"
                            title="Reset to Call of Jesus studio verified defaults"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Defaults</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveAll}
                            disabled={isSaving}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Save & Sync to App</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Live Test & Preview Station */}
            {previewStream && (
                <div className="rounded-3xl bg-[#0C0A14] border border-white/10 p-5 sm:p-6 shadow-xl space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                                <Eye className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <span>Live Preview & Embed Tester:</span>
                                    <span className="text-amber-400 font-mono">{previewStream.title}</span>
                                </h3>
                                <p className="text-xs text-white/40">
                                    Test the YouTube stream right here to ensure YouTube does not block embedding before saving.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <a
                                href={`https://www.youtube.com/watch?v=${previewStream.youtubeId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold border border-white/5 flex items-center gap-1.5 transition-colors"
                            >
                                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                                <span>Open on YouTube</span>
                            </a>
                        </div>
                    </div>

                    {/* Integrated Player */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center pt-2">
                        <div className="lg:col-span-2 rounded-2xl overflow-hidden aspect-video bg-black/80 border border-white/10 shadow-inner">
                            <iframe
                                key={previewStream.youtubeId}
                                className="w-full h-full"
                                src={`https://www.youtube-nocookie.com/embed/${previewStream.youtubeId}?autoplay=0&controls=1&enablejsapi=1`}
                                title={previewStream.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>

                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Active YouTube ID</div>
                                <div className="font-mono text-sm text-amber-400 font-bold bg-black/50 px-3 py-1.5 rounded-xl border border-white/5 break-all">
                                    {previewStream.youtubeId}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Category / Mood</div>
                                <div className="text-xs text-white font-bold bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                    {previewStream.mood}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Duration</div>
                                <div className="text-xs text-white/70 font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                                    {previewStream.duration}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-white/5">
                                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Ready for Sermon & Prayer Pad</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stream List Table / Cards */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                        Configured Streams ({streams.length})
                    </span>
                    <span className="text-xs text-amber-400 font-bold">
                        {streams.filter(s => s.isActive ?? true).length} Active Tracks
                    </span>
                </div>

                {isLoading ? (
                    <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/5 space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
                        <p className="text-xs text-white/40 font-mono uppercase tracking-widest">Loading Settings...</p>
                    </div>
                ) : streams.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-white/5 border border-white/5 space-y-3">
                        <Radio className="w-10 h-10 text-white/20 mx-auto" />
                        <p className="text-sm font-bold text-white/60">No background streams configured.</p>
                        <button
                            type="button"
                            onClick={handleResetDefaults}
                            className="px-4 py-2 rounded-xl bg-amber-500 text-black text-xs font-bold"
                        >
                            Load Defaults
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {streams.map((item, index) => {
                            const isCurrentPreview = previewStream?.id === item.id;
                            const isActive = item.isActive ?? true;

                            return (
                                <div
                                    key={item.id}
                                    className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                        isCurrentPreview
                                            ? 'bg-amber-500/[0.07] border-amber-500/40 shadow-lg shadow-amber-500/5'
                                            : isActive
                                            ? 'bg-[#0B0912] border-white/10 hover:border-white/20'
                                            : 'bg-[#07060A]/80 border-white/5 opacity-60'
                                    }`}
                                >
                                    {/* Left Info */}
                                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                        {/* Reorder Buttons */}
                                        <div className="flex flex-col gap-1 shrink-0 pt-0.5 sm:pt-0">
                                            <button
                                                type="button"
                                                onClick={() => moveItem(index, 'up')}
                                                disabled={index === 0}
                                                className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center disabled:opacity-20 transition-colors"
                                                title="Move Up"
                                            >
                                                <ArrowUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveItem(index, 'down')}
                                                disabled={index === streams.length - 1}
                                                className="w-6 h-6 rounded-md bg-white/5 hover:bg-white/10 text-white/50 hover:text-white flex items-center justify-center disabled:opacity-20 transition-colors"
                                                title="Move Down"
                                            >
                                                <ArrowDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        {/* Status & Preview Button */}
                                        <button
                                            type="button"
                                            onClick={() => setPreviewStream(item)}
                                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                                                isCurrentPreview
                                                    ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/30'
                                                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                                            }`}
                                            title="Click to Test Play in Preview"
                                        >
                                            <Play className="w-4 h-4 fill-current ml-0.5" />
                                        </button>

                                        {/* Title & Metadata */}
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                                                    {item.mood}
                                                </span>
                                                <span className="text-[11px] font-mono text-white/40">
                                                    {item.duration}
                                                </span>
                                                {!isActive && (
                                                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold">
                                                        Disabled
                                                    </span>
                                                )}
                                            </div>

                                            <h4 className="text-sm sm:text-base font-bold text-white truncate">
                                                {item.title}
                                            </h4>

                                            <p className="text-xs text-white/40 line-clamp-1 mt-0.5">
                                                {item.description || 'No description'}
                                            </p>

                                            <div className="text-[11px] text-white/30 font-mono mt-1 flex items-center gap-2">
                                                <span>ID: <code className="text-amber-400/80">{item.youtubeId}</code></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Action Tools */}
                                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-white/5 w-full md:w-auto justify-end">
                                        {/* Active Toggle */}
                                        <button
                                            type="button"
                                            onClick={() => toggleActive(item.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                                isActive
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                                    : 'bg-white/5 border-white/10 text-white/40'
                                            }`}
                                            title="Toggle track visibility"
                                        >
                                            {isActive ? 'Active' : 'Inactive'}
                                        </button>

                                        {/* Edit Button */}
                                        <button
                                            type="button"
                                            onClick={() => openEditModal(item)}
                                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
                                            title="Edit track"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            type="button"
                                            onClick={() => deleteItem(item.id)}
                                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                                            title="Delete track"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => setIsModalOpen(false)}
                    />

                    <div className="relative w-full max-w-xl bg-[#0F0D18] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto no-scrollbar">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                                    <Radio className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-white">
                                        {editingItem ? 'Edit Worship Stream' : 'Add New Worship Stream'}
                                    </h3>
                                    <p className="text-xs text-white/50">
                                        Configure stream metadata and verify YouTube video ID.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleModalSubmit} className="space-y-4">
                            {/* Title */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                                    Track Title
                                </label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="e.g. Peaceful Worship Piano & Strings"
                                    required
                                    className="w-full bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none"
                                />
                            </div>

                            {/* YouTube URL or ID */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 flex items-center justify-between">
                                    <span>YouTube Link or Video ID</span>
                                    {formParsedId ? (
                                        <span className="text-emerald-400 font-mono text-[10px] flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Extracted ID: {formParsedId}
                                        </span>
                                    ) : (
                                        <span className="text-amber-400/80 text-[10px]">
                                            Paste any watch, share, live, or shorts link
                                        </span>
                                    )}
                                </label>
                                <div className="relative">
                                    <Youtube className="w-4 h-4 text-red-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={formUrlOrId}
                                        onChange={(e) => setFormUrlOrId(e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=fOB73qRVGJs or fOB73qRVGJs"
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none font-mono"
                                    />
                                </div>
                            </div>

                            {/* Live Test Player inside Modal */}
                            {formParsedId && (
                                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                                    <div className="flex items-center justify-between text-xs text-white/60">
                                        <span className="font-bold flex items-center gap-1.5 text-amber-400">
                                            <Play className="w-3.5 h-3.5 fill-current" /> Instant Embed Test:
                                        </span>
                                        <a
                                            href={`https://www.youtube.com/watch?v=${formParsedId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-white/40 hover:text-white flex items-center gap-1"
                                        >
                                            <span>Open</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black max-h-48 border border-white/10">
                                        <iframe
                                            key={formParsedId}
                                            className="w-full h-full"
                                            src={`https://www.youtube-nocookie.com/embed/${formParsedId}?autoplay=0&controls=1`}
                                            title="Test Preview"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        />
                                    </div>
                                    <p className="text-[11px] text-white/40 leading-tight">
                                        If the video plays smoothly without saying &quot;This video is unavailable&quot;, it is 100% embed-compatible!
                                    </p>
                                </div>
                            )}

                            {/* Category & Duration Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                                        Category / Mood
                                    </label>
                                    <select
                                        value={formMood}
                                        onChange={(e) => setFormMood(e.target.value)}
                                        className="w-full bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                                    >
                                        {MOOD_OPTIONS.map(m => (
                                            <option key={m} value={m} className="bg-neutral-900 text-white">{m}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                                        Duration Label
                                    </label>
                                    <input
                                        type="text"
                                        value={formDuration}
                                        onChange={(e) => setFormDuration(e.target.value)}
                                        placeholder="e.g. 3 Hours or Continuous"
                                        className="w-full bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">
                                    Description & Hint
                                </label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    rows={2}
                                    placeholder="Helpful notes for pastors, preachers, and worship leaders..."
                                    className="w-full bg-black/60 border border-white/10 focus:border-amber-500/50 rounded-xl px-4 py-2 text-xs text-white placeholder-white/20 focus:outline-none resize-none"
                                />
                            </div>

                            {/* Active Checkbox */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="formIsActive"
                                    checked={formIsActive}
                                    onChange={(e) => setFormIsActive(e.target.checked)}
                                    className="w-4 h-4 rounded bg-black/60 border-white/20 text-amber-500 focus:ring-0"
                                />
                                <label htmlFor="formIsActive" className="text-xs font-bold text-white/70 select-none cursor-pointer">
                                    Active (Visible immediately on /tools/pad)
                                </label>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-lg shadow-amber-500/20 transition-all"
                                >
                                    {editingItem ? 'Update Track' : 'Add to Stream List'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
