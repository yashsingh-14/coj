'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Youtube, Save, Loader2, Radio, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSermonsPage() {
    const [config, setConfig] = useState({
        channelId: '',
        channelHandle: '',
        isLiveOverride: false
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setIsLoading(true);
        const { data } = await supabase.from('site_settings').select('*').eq('key', 'youtube_config').single();
        if (data && data.value) {
            setConfig(data.value);
        }
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const { error } = await supabase.from('site_settings').upsert({
            key: 'youtube_config',
            value: config,
            description: 'YouTube Channel & Live Settings'
        });
        if (error) toast.error("Failed to save config");
        else toast.success("Sermon settings updated");
        setIsSaving(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">Sermons</h1>
                <p className="text-white/40">Manage YouTube integration and live stream status.</p>
            </header>

            <form onSubmit={handleSave} className="bg-[#0F0F16] border border-white/5 rounded-3xl p-8 space-y-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Youtube className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Channel Configuration</h2>
                        <p className="text-white/40 text-sm">Link your YouTube channel for auto-fetching sermons.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/70">Channel ID</label>
                        <input
                            value={config.channelId}
                            onChange={(e) => setConfig({ ...config, channelId: e.target.value })}
                            placeholder="UC..."
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 font-mono text-sm"
                        />
                        <p className="text-[10px] text-white/30">Found in YouTube Studio URL</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-white/70">Channel Handle</label>
                        <input
                            value={config.channelHandle}
                            onChange={(e) => setConfig({ ...config, channelHandle: e.target.value })}
                            placeholder="@CallofJesusMinistries"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50"
                        />
                    </div>
                </div>

                <div className="w-full h-px bg-white/5"></div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-white/70 block">Force "Live" Status</label>
                            <p className="text-xs text-white/30">Manually show the LIVE indicator on the Sermons page.</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setConfig({ ...config, isLiveOverride: !config.isLiveOverride })}
                            className={`w-14 h-8 rounded-full p-1 transition-colors ${config.isLiveOverride ? 'bg-red-500' : 'bg-white/10'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${config.isLiveOverride ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-8 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Update Config
                    </button>
                </div>
            </form>
        </div>
    );
}
