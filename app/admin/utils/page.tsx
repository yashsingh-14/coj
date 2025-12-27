'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BookOpen, Megaphone, Save, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUtilsPage() {
    const [activeTab, setActiveTab] = useState<'verse' | 'announcements'>('verse');

    return (
        <div className="space-y-8 pb-20">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">Daily Content</h1>
                <p className="text-white/40">Manage Verse of the Day and Site Announcements.</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/5 pb-1">
                <button
                    onClick={() => setActiveTab('verse')}
                    className={`px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'verse' ? 'border-amber-500 text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                >
                    Verse of the Day
                </button>
                <button
                    onClick={() => setActiveTab('announcements')}
                    className={`px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'announcements' ? 'border-amber-500 text-white' : 'border-transparent text-white/40 hover:text-white'}`}
                >
                    Announcements
                </button>
            </div>

            {activeTab === 'verse' ? <VerseManager /> : <AnnouncementsManager />}
        </div>
    );
}

function VerseManager() {
    const [verse, setVerse] = useState({ text: '', reference: '', image_url: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchTodayVerse();
    }, []);

    const fetchTodayVerse = async () => {
        setIsLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('daily_verses')
            .select('*')
            .eq('date', today)
            .single();

        if (data) {
            setVerse(data);
        } else {
            // If no verse for today, maybe fetch latest? Or just empty.
            // We'll leave it empty to prompt creation.
        }
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const today = new Date().toISOString().split('T')[0];

        // Check if exists
        const { data: existing } = await supabase.from('daily_verses').select('id').eq('date', today).single();

        let error;
        if (existing) {
            const res = await supabase.from('daily_verses').update(verse).eq('id', existing.id);
            error = res.error;
        } else {
            const res = await supabase.from('daily_verses').insert([{ ...verse, date: today }]);
            error = res.error;
        }

        if (error) {
            toast.error("Failed to save verse");
        } else {
            toast.success("Verse of the day updated!");
        }
        setIsSaving(false);
    };

    if (isLoading) return <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />;

    return (
        <form onSubmit={handleSave} className="bg-[#0F0F16] border border-white/5 rounded-3xl p-8 max-w-2xl">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Today's Verse</h2>
                    <p className="text-white/40 text-sm">Update the scripture displayed on the home page.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70">Scripture Text</label>
                    <textarea
                        value={verse.text}
                        onChange={(e) => setVerse(prev => ({ ...prev, text: e.target.value }))}
                        placeholder="For God so loved the world..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 h-32 resize-none"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70">Reference</label>
                    <input
                        value={verse.reference}
                        onChange={(e) => setVerse(prev => ({ ...prev, reference: e.target.value }))}
                        placeholder="John 3:16"
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70">Background Image URL (Optional)</label>
                    <input
                        value={verse.image_url || ''}
                        onChange={(e) => setVerse(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="https://..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Verse
                    </button>
                </div>
            </div>
        </form>
    );
}

function AnnouncementsManager() {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newAnnouncement, setNewAnnouncement] = useState('');

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setIsLoading(true);
        const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        setAnnouncements(data || []);
        setIsLoading(false);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAnnouncement.trim()) return;

        const { error } = await supabase.from('announcements').insert([{ title: 'Notice', message: newAnnouncement, is_active: true }]);
        if (error) {
            toast.error("Failed to add announcement");
        } else {
            toast.success("Announcement added");
            setNewAnnouncement('');
            fetchAnnouncements();
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) toast.error("Failed to delete");
        else fetchAnnouncements();
    };

    const toggleActive = async (id: string, current: boolean) => {
        const { error } = await supabase.from('announcements').update({ is_active: !current }).eq('id', id);
        if (error) toast.error("Failed to update status");
        else fetchAnnouncements();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Form */}
            <div className="bg-[#0F0F16] border border-white/5 rounded-3xl p-8 h-fit">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Plus className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">New Announcement</h2>
                        <p className="text-white/40 text-sm">Add a banner notice to the site.</p>
                    </div>
                </div>
                <form onSubmit={handleAdd} className="space-y-4">
                    <textarea
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                        placeholder="Type your announcement here..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 h-32 resize-none"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold shadow-lg shadow-blue-500/20 transition-all"
                    >
                        Post Announcement
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="space-y-4">
                {isLoading ? <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" /> :
                    announcements.length === 0 ? <p className="text-center text-white/30">No announcements yet.</p> :
                        announcements.map((item) => (
                            <div key={item.id} className={`p-4 rounded-2xl border ${item.is_active ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-60'} flex items-center justify-between group`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-white/20'}`}></div>
                                    <p className="text-white font-medium">{item.message}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleActive(item.id, item.is_active)}
                                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white transition-all"
                                    >
                                        {item.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                }
            </div>
        </div>
    );
}
