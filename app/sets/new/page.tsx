'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft, Save, Calendar, Info, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function CreateSetPage() {
    const router = useRouter();
    const { currentUser } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !date) {
            toast.error("Please fill in Title and Date");
            return;
        }

        if (!currentUser) {
            toast.error("You must be logged in to create a set");
            router.push('/signin');
            return;
        }

        setIsLoading(true);

        try {
            // 1. Insert into Sets table
            const { data, error } = await supabase
                .from('sets')
                .insert([
                    {
                        title,
                        event_date: new Date(date).toISOString(),
                        description,
                        created_by: currentUser.id // RLS handles this but good to have
                    }
                ])
                .select()
                .single();

            if (error) throw error;

            toast.success("Set created successfully!");
            // Redirect to the new set page (to be created)
            router.push('/sets'); // Temporarily back to list, later to /sets/[id]
        } catch (error: any) {
            console.error('Error creating set:', error);
            toast.error(error.message || "Failed to create set");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white p-6 md:p-12">
            <div className="max-w-2xl mx-auto">
                <Link href="/sets" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sets
                </Link>

                <div className="mb-10">
                    <h1 className="text-4xl font-black mb-2">Create New Set</h1>
                    <p className="text-white/40">Plan a new service or event.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-white/60">Set Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Sunday Morning Service"
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-all placeholder:text-white/20"
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-white/60">Event Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                            <input
                                type="datetime-local"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pl-12 text-lg focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-all text-white/80 [&::-webkit-calendar-picker-indicator]:invert"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-wider text-white/60">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Notes about the theme, team, or special instructions..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-base focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-all placeholder:text-white/20 resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[var(--brand)] hover:bg-amber-400 text-black font-bold text-lg p-4 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Create Set
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
