'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Plus, Trash2, Edit, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminEventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            toast.error("Failed to load events");
        } else {
            setEvents(data || []);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) {
            toast.error("Failed to delete event");
        } else {
            toast.success("Event deleted");
            fetchEvents();
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Events</h1>
                    <p className="text-white/40 text-sm">Manage weekly services and special events.</p>
                </div>
                <Link href="/admin/events/new" className="px-4 py-2 md:px-6 md:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 text-sm w-fit">
                    <Plus className="w-4 h-4 md:w-5 md:h-5" /> Add New Event
                </Link>
            </header>

            <div className="bg-[#0F0F16] border border-white/5 rounded-3xl overflow-hidden">
                {isLoading ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                        <p className="text-white/30">Loading events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <Calendar className="w-16 h-16 text-white/10" />
                        <h3 className="text-xl font-bold text-white/50">No events found</h3>
                        <p className="text-white/30">Create your first event to get started.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {events.map((event) => (
                            <div key={event.id} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${event.gradient || 'from-white/10 to-white/5'} flex items-center justify-center border border-white/10 shrink-0`}>
                                        <Calendar className={`w-6 h-6 md:w-8 md:h-8 ${event.color || 'text-white'}`} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg md:text-xl font-bold text-white mb-1 truncate">{event.title_en}</h3>
                                        <p className="text-xs md:text-sm text-white/40 mb-1">{event.time_en}</p>
                                        <span className="text-[10px] md:text-xs px-2 py-0.5 rounded bg-white/10 text-white/50 uppercase tracking-widest font-bold">
                                            Order: {event.sort_order}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link href={`/admin/events/${event.id}`} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                                        <Edit className="w-5 h-5" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
