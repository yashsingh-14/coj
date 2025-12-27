'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { LayoutTemplate, Star, Save, Plus, Trash2, Loader2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminHomePage() {
    return (
        <div className="space-y-12 pb-20">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">Home Page</h1>
                <p className="text-white/40">Manage Hero Carousel and Featured Content.</p>
            </header>

            <HeroCarouselManager />
            <FeaturedSongsManager />
        </div>
    );
}

function HeroCarouselManager() {
    const [slides, setSlides] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        setIsLoading(true);
        const { data } = await supabase.from('site_settings').select('*').eq('key', 'home_hero_slides').single();
        if (data && data.value) {
            setSlides(data.value);
        } else {
            // Default seed if empty
            setSlides([
                { title: "Welcome Home", subtitle: "Join us this Sunday", image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=2073", link: "/events", cta: "Plan Your Visit" }
            ]);
        }
        setIsLoading(false);
    };

    const addSlide = () => {
        setSlides([...slides, { title: "New Slide", subtitle: "Subtitle", image: "", link: "/", cta: "Click Me" }]);
    };

    const removeSlide = (index: number) => {
        const newSlides = [...slides];
        newSlides.splice(index, 1);
        setSlides(newSlides);
    };

    const updateSlide = (index: number, field: string, value: string) => {
        const newSlides = [...slides];
        newSlides[index] = { ...newSlides[index], [field]: value };
        setSlides(newSlides);
    };

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase.from('site_settings').upsert({
            key: 'home_hero_slides',
            value: slides,
            description: 'Home Page Hero Carousel Slides'
        });
        if (error) toast.error("Failed to save slides");
        else toast.success("Carousel updated");
        setIsSaving(false);
    };

    if (isLoading) return <Loader2 className="w-6 h-6 animate-spin text-amber-500" />;

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest text-sm">
                    <LayoutTemplate className="w-5 h-5" /> Hero Carousel
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2 transition-all"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {slides.map((slide, idx) => (
                    <div key={idx} className="bg-[#0F0F16] border border-white/5 rounded-2xl p-6 space-y-4 relative group">
                        <button
                            onClick={() => removeSlide(idx)}
                            className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/50 uppercase">Slide {idx + 1}</label>
                            <input
                                value={slide.title}
                                onChange={(e) => updateSlide(idx, 'title', e.target.value)}
                                className="w-full bg-transparent border-b border-white/10 pb-2 text-xl font-bold text-white focus:outline-none focus:border-amber-500"
                                placeholder="Title"
                            />
                            <input
                                value={slide.subtitle}
                                onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)}
                                className="w-full bg-transparent border-b border-white/10 pb-2 text-sm text-white/60 focus:outline-none focus:border-amber-500"
                                placeholder="Subtitle"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg">
                                <ImageIcon className="w-4 h-4 text-white/30" />
                                <input
                                    value={slide.image}
                                    onChange={(e) => updateSlide(idx, 'image', e.target.value)}
                                    className="w-full bg-transparent text-xs text-white focus:outline-none"
                                    placeholder="Image URL"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg flex-1">
                                    <LinkIcon className="w-4 h-4 text-white/30" />
                                    <input
                                        value={slide.link}
                                        onChange={(e) => updateSlide(idx, 'link', e.target.value)}
                                        className="w-full bg-transparent text-xs text-white focus:outline-none"
                                        placeholder="Link URL"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-lg flex-1">
                                    <span className="text-xs text-white/30 font-bold px-1">BTN</span>
                                    <input
                                        value={slide.cta}
                                        onChange={(e) => updateSlide(idx, 'cta', e.target.value)}
                                        className="w-full bg-transparent text-xs text-white focus:outline-none"
                                        placeholder="Button Text"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        {slide.image && (
                            <div className="h-32 rounded-lg bg-cover bg-center opacity-50 grayscale hover:grayscale-0 transition-all" style={{ backgroundImage: `url('${slide.image}')` }}></div>
                        )}
                    </div>
                ))}

                <button
                    onClick={addSlide}
                    className="bg-[#0F0F16] border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-white/30 hover:text-white hover:border-white/30 transition-all min-h-[300px]"
                >
                    <Plus className="w-8 h-8" />
                    <span className="font-bold">Add Slide</span>
                </button>
            </div>
        </section>
    );
}

function FeaturedSongsManager() {
    const [songs, setSongs] = useState<any[]>([]);
    const [featuredCount, setFeaturedCount] = useState(0);

    useEffect(() => {
        fetchSongs();
    }, []);

    const fetchSongs = async () => {
        const { data } = await supabase.from('songs').select('id, title, artist, is_featured').order('created_at', { ascending: false });
        if (data) {
            setSongs(data);
            setFeaturedCount(data.filter(s => s.is_featured).length);
        }
    };

    const toggleFeatured = async (id: string, current: boolean) => {
        // Optimistic update
        setSongs(prev => prev.map(s => s.id === id ? { ...s, is_featured: !current } : s));
        setFeaturedCount(prev => current ? prev - 1 : prev + 1);

        const { error } = await supabase.from('songs').update({ is_featured: !current }).eq('id', id);
        if (error) {
            toast.error("Update failed");
            fetchSongs(); // Revert
        }
    };

    return (
        <section className="space-y-6 pt-8 border-t border-white/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-500 font-bold uppercase tracking-widest text-sm">
                    <Star className="w-5 h-5" /> Featured Songs
                </div>
                <div className="text-xs font-bold text-white/40 bg-white/5 px-3 py-1 rounded-full">
                    {featuredCount} Selected
                </div>
            </div>

            <div className="bg-[#0F0F16] border border-white/5 rounded-3xl overflow-hidden max-h-[500px] overflow-y-auto">
                <div className="divide-y divide-white/5">
                    {songs.map(song => (
                        <div key={song.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02]">
                            <div>
                                <h3 className="text-white font-bold">{song.title}</h3>
                                <p className="text-sm text-white/40">{song.artist}</p>
                            </div>
                            <button
                                onClick={() => toggleFeatured(song.id, song.is_featured)}
                                className={`p-2 rounded-lg border transition-all flex items-center gap-2 ${song.is_featured
                                    ? 'bg-amber-500 border-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                    : 'bg-transparent border-white/10 text-white/30 hover:text-white'}`}
                            >
                                <Star className={`w-4 h-4 ${song.is_featured ? 'fill-black' : ''}`} />
                                <span className="text-xs font-bold uppercase tracking-widest mr-1">
                                    {song.is_featured ? 'Featured' : 'Feature'}
                                </span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
