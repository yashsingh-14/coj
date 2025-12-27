'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Settings, Save, Loader2, Globe, Youtube, Facebook, Twitter, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
    const [socialLinks, setSocialLinks] = useState({
        youtube: '',
        instagram: '',
        facebook: '',
        whatsapp: '',
        phone: '',
        email: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('site_settings').select('*').eq('key', 'social_links').single();
        if (data && data.value) {
            setSocialLinks(data.value);
        }
        setIsLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSocialLinks(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const { error } = await supabase.from('site_settings').upsert({
            key: 'social_links',
            value: socialLinks,
            description: 'Footer Social and Contact Links'
        });

        if (error) {
            toast.error("Failed to save settings");
        } else {
            toast.success("Settings updated successfully");
        }
        setIsSaving(false);
    };

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">Global Settings</h1>
                <p className="text-white/40">Manage site-wide configuration and contact info.</p>
            </header>

            <form onSubmit={handleSave} className="bg-[#0F0F16] border border-white/5 rounded-3xl p-8 space-y-8">

                {/* Social Media Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2 text-amber-500 font-bold uppercase tracking-widest text-xs">
                        <Globe className="w-4 h-4" /> Social Media
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                            <input
                                name="youtube"
                                value={socialLinks.youtube}
                                onChange={handleChange}
                                placeholder="YouTube Channel URL"
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-pink-500 font-bold">IG</div>
                            <input
                                name="instagram"
                                value={socialLinks.instagram}
                                onChange={handleChange}
                                placeholder="Instagram URL"
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                            />
                        </div>
                        <div className="relative">
                            <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                            <input
                                name="facebook"
                                value={socialLinks.facebook}
                                onChange={handleChange}
                                placeholder="Facebook Page URL"
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-white/5"></div>

                {/* Contact Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold uppercase tracking-widest text-xs">
                        <Phone className="w-4 h-4" /> Contact Info
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            <input
                                name="email"
                                value={socialLinks.email}
                                onChange={handleChange}
                                placeholder="Official Email Address"
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            <input
                                name="phone"
                                value={socialLinks.phone}
                                onChange={handleChange}
                                placeholder="Official Contact Number / WhatsApp"
                                className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>

            </form>
        </div>
    );
}
