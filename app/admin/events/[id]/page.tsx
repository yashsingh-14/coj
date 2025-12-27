'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function EventFormPage({ params }: { params: any }) {
    // Typescript nuance: params might be a Promise in newer Next.js. 
    // We will unwrap it inside or use 'any' briefly to bypass if ensuring unwrap.
    // However, for this file structure (new/page.tsx vs [id]/page.tsx), we need to handle both?
    // wait, this code is for `app/admin/events/[id]/page.tsx` AND `app/admin/events/new/page.tsx`?
    // No, I need two files or one component. 
    // I will write this file to `app/admin/events/[id]/page.tsx` primarily, 
    // and for `new`, I'll create a separate one that reuses a component or just duplicate safely for now to avoid complexity.
    // Actually, I'll make this file robust enough for 'new' if I can.

    // Let's stick to: This is `EditEventPage` for `[id]`.

    const [eventId, setEventId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const [formData, setFormData] = useState({
        title_en: '',
        title_hi: '',
        time_en: '',
        time_hi: '',
        desc_en: '',
        desc_hi: '',
        icon_name: 'Calendar',
        color: 'text-amber-500',
        gradient: 'from-amber-500/20 to-orange-500/20',
        sort_order: 0
    });

    useEffect(() => {
        // unwrapping params
        Promise.resolve(params).then((resolvedParams: any) => {
            if (resolvedParams.id && resolvedParams.id !== 'new') {
                setEventId(resolvedParams.id);
                fetchEvent(resolvedParams.id);
            } else {
                setIsLoading(false); // New mode
            }
        });
    }, [params]);

    const fetchEvent = async (id: string) => {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
        if (error) {
            toast.error("Failed to load event");
            router.push('/admin/events');
        } else {
            setFormData(data);
        }
        setIsLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            if (eventId) {
                // Update
                const { error } = await supabase.from('events').update(formData).eq('id', eventId);
                if (error) throw error;
                toast.success("Event updated successfully");
            } else {
                // Create
                const { error } = await supabase.from('events').insert([formData]);
                if (error) throw error;
                toast.success("Event created successfully");
            }
            router.push('/admin/events');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to save event");
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
                <Link href="/admin/events" className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">{eventId ? 'Edit Event' : 'New Event'}</h1>
                    <p className="text-white/40">Manage event details for bilingual display.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* English Section */}
                <div className="bg-[#0F0F16] border border-white/5 p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-2 mb-2 text-amber-500 font-bold uppercase tracking-widest text-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> English Content
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">Title</label>
                            <input
                                name="title_en"
                                value={formData.title_en}
                                onChange={handleChange}
                                placeholder="e.g. Worship Service"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">Time</label>
                            <input
                                name="time_en"
                                value={formData.time_en}
                                onChange={handleChange}
                                placeholder="e.g. Every Sunday, 10:30 AM"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/70">Description</label>
                        <textarea
                            name="desc_en"
                            value={formData.desc_en}
                            onChange={handleChange}
                            placeholder="Brief description..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 h-24 resize-none"
                        />
                    </div>
                </div>

                {/* Hindi Section */}
                <div className="bg-[#0F0F16] border border-white/5 p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-2 mb-2 text-rose-500 font-bold uppercase tracking-widest text-xs">
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span> Hindi Content
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">Title (Hindi)</label>
                            <input
                                name="title_hi"
                                value={formData.title_hi || ''}
                                onChange={handleChange}
                                placeholder="e.g. आराधना सभा"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">Time (Hindi)</label>
                            <input
                                name="time_hi"
                                value={formData.time_hi || ''}
                                onChange={handleChange}
                                placeholder="e.g. हर रविवार, सुबह 10:30 बजे"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/70">Description (Hindi)</label>
                        <textarea
                            name="desc_hi"
                            value={formData.desc_hi || ''}
                            onChange={handleChange}
                            placeholder="विवरण..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 h-24 resize-none"
                        />
                    </div>
                </div>

                {/* Appearance */}
                <div className="bg-[#0F0F16] border border-white/5 p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold uppercase tracking-widest text-xs">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Appearance
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">Icon Name</label>
                            <select
                                name="icon_name"
                                value={formData.icon_name}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                            >
                                <option value="Calendar">Calendar (Default)</option>
                                <option value="Sun">Sun (Worship)</option>
                                <option value="Wine">Wine (Communion)</option>
                                <option value="BookOpen">Book (Study)</option>
                                <option value="Music">Music</option>
                                <option value="Star">Star</option>
                            </select>
                            <p className="text-[10px] text-white/30 flex items-center gap-1"><Info className="w-3 h-3" /> Mapped to Lucide icons in frontend</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">Sort Order</label>
                            <input
                                type="number"
                                name="sort_order"
                                value={formData.sort_order}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">Color Class</label>
                            <input
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                placeholder="e.g. text-amber-500"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 font-mono text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">Gradient Class</label>
                            <input
                                name="gradient"
                                value={formData.gradient}
                                onChange={handleChange}
                                placeholder="e.g. from-amber-500/20 to-orange-500/20"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 font-mono text-sm"
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
                        {eventId ? 'Update Event' : 'Create Event'}
                    </button>
                </div>
            </form>
        </div>
    );
}
