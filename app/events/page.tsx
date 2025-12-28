'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, BookOpen, Sun, Wine, Sparkles, Loader2 } from 'lucide-react';
import TiltCard from '@/components/ui/TiltCard';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const ICON_MAP: Record<string, any> = {
    BookOpen,
    Sun,
    Wine,
    Calendar,
    Clock,
    MapPin,
    Sparkles
};

export default function EventsPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .order('sort_order', { ascending: true });

                if (error) throw error;

                // Transform data to match UI expectations
                const formattedEvents = (data || []).map(event => ({
                    ...event,
                    icon: ICON_MAP[event.icon_name] || Calendar, // Fallback icon
                    titleEn: event.title_en,
                    titleHi: event.title_hi,
                    timeEn: event.time_en,
                    timeHi: event.time_hi,
                    descEn: event.desc_en,
                    descHi: event.desc_hi
                }));

                setEvents(formattedEvents);
            } catch (err) {
                console.error('Error fetching events:', err);
                // Fallback or empty state could go here
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    return (
        <div className="min-h-screen bg-[#02000F] text-white p-6 pb-32 overflow-hidden relative">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center gap-2 p-3 px-5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 backdrop-blur-md mb-12 transition-all group">
                    <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-amber-500 transition-colors" />
                    <span className="text-sm font-bold tracking-widest uppercase">Back</span>
                </Link>

                <div className="text-center mb-8 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4 animate-fade-in-down">
                        <Calendar className="w-4 h-4 text-amber-500" />
                        <span className="text-amber-500 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">Weekly Gatherings</span>
                    </div>
                    <h1 className="text-3xl md:text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/50 drop-shadow-2xl">
                        JOIN US <span className="text-amber-500">OFFLINE</span>
                    </h1>
                    <p className="text-white/40 text-sm md:text-lg max-w-2xl mx-auto px-4">
                        Experience the presence of God together. Come as you are.
                        <br />
                        <span className="text-xs md:text-sm opacity-70 font-serif italic">परमेश्वर की उपस्थिति का अनुभव करें।</span>
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {events.map((event, i) => (
                            <TiltCard key={i} className="w-full" max={5} scale={1.02}>
                                <div className="h-full bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-1 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500 shadow-2xl">
                                    {/* Inner Content Container */}
                                    <div className="bg-[#0f0f0f] rounded-[1.8rem] p-4 md:p-6 h-full relative overflow-hidden">
                                        {/* Gradient Background */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${event.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                                        {/* Glass Shine */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                        <div className="relative z-10 flex flex-col h-full">
                                            {/* Icon */}
                                            <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(0,0,0,0.3)] ${event.color}`}>
                                                <event.icon className="w-7 h-7" />
                                            </div>

                                            {/* English Section */}
                                            <div className="mb-4 md:mb-6 space-y-2">
                                                <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">{event.titleEn}</h3>
                                                <div className="flex items-start gap-2 text-white/60 text-sm">
                                                    <Clock className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                                                    <span>{event.timeEn}</span>
                                                </div>
                                            </div>

                                            {/* Divider */}
                                            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

                                            {/* Hindi Section */}
                                            <div className="mt-auto space-y-2">
                                                <h3 className="text-xl font-bold text-white/90 leading-tight font-serif">{event.titleHi}</h3>
                                                <div className="flex items-start gap-2 text-white/50 text-sm">
                                                    <Clock className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
                                                    <span className="font-serif">{event.timeHi}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TiltCard>
                        ))}
                    </div>
                )}

                <div className="mt-16 text-center">
                    <a
                        href="https://maps.app.goo.gl/U6Unh6WEcAdbp89K6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-white/5 border border-white/10 rounded-full hover:bg-amber-500 hover:text-black hover:scale-105 transition-all duration-300 group shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-black/10">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <span className="block text-xs font-bold uppercase tracking-wider opacity-60 group-hover:opacity-80">Location</span>
                            <span className="block font-bold">Get Directions to Church</span>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
