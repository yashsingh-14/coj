'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Youtube, Save, Loader2, Radio, PlayCircle, Tv, Link2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { updateSiteSettingAdmin } from '@/app/actions/admin';

export default function AdminSermonsPage() {
    const [config, setConfig] = useState({
        channelId: '',
        channelHandle: '',
        isLiveOverride: false,
        liveVideoId: '',
        liveTitle: ''
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
            setConfig({
                channelId: data.value.channelId || '',
                channelHandle: data.value.channelHandle || '',
                isLiveOverride: data.value.isLiveOverride || false,
                liveVideoId: data.value.liveVideoId || '',
                liveTitle: data.value.liveTitle || ''
            });
        }
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const res = await updateSiteSettingAdmin('youtube_config', config, 'YouTube Channel & Live Settings');
        if (!res.success) {
            toast.error("Failed to save config: " + (res.error || ''));
        } else {
            toast.success("Sermon settings updated");
        }
        setIsSaving(false);
    };

    // Extract video ID from various YouTube URL formats
    const extractVideoId = (input: string): string => {
        if (!input) return '';
        // Already a raw video ID (11 chars alphanumeric)
        if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
        // Full YouTube URL formats
        try {
            const url = new URL(input);
            if (url.hostname.includes('youtube.com')) {
                return url.searchParams.get('v') || '';
            }
            if (url.hostname === 'youtu.be') {
                return url.pathname.slice(1);
            }
        } catch {
            // Not a URL, return as-is
        }
        return input.trim();
    };

    const handleVideoIdChange = (value: string) => {
        const extracted = extractVideoId(value);
        setConfig({ ...config, liveVideoId: extracted });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-20">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight mb-2">Sermons</h1>
                <p className="text-white/40">Manage YouTube integration and live stream status.</p>
            </header>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Channel Configuration */}
                <div className="bg-[#0F0F16] border border-white/5 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
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
                </div>

                {/* Live Stream Control */}
                <div className="bg-[#0F0F16] border border-white/5 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.isLiveOverride ? 'bg-red-500/30 animate-pulse' : 'bg-white/5'}`}>
                            <Radio className={`w-6 h-6 ${config.isLiveOverride ? 'text-red-500' : 'text-white/40'}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Live Stream Control</h2>
                            <p className="text-white/40 text-sm">
                                Enable this when a live sermon is streaming on YouTube.
                            </p>
                        </div>
                    </div>

                    {/* Live Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-white/70 block">🔴 Go LIVE</label>
                            <p className="text-xs text-white/30">
                                Turn this ON when you start a YouTube live stream. A live banner will appear on the Homepage and Sermons page.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setConfig({ ...config, isLiveOverride: !config.isLiveOverride })}
                            className={`w-14 h-8 rounded-full p-1 transition-colors flex-shrink-0 ml-4 ${config.isLiveOverride ? 'bg-red-500' : 'bg-white/10'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${config.isLiveOverride ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    {/* Live Video ID */}
                    <div className={`space-y-3 transition-all ${config.isLiveOverride ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70 flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-red-400" />
                                Live Video ID or URL
                            </label>
                            <input
                                value={config.liveVideoId}
                                onChange={(e) => handleVideoIdChange(e.target.value)}
                                placeholder="Paste YouTube live URL or Video ID (e.g. dQw4w9WgXcQ)"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 font-mono text-sm"
                            />
                            <p className="text-[10px] text-white/30">
                                Paste the full YouTube link or just the video ID. We&apos;ll auto-extract the ID.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-white/70">Live Stream Title (Optional)</label>
                            <input
                                value={config.liveTitle}
                                onChange={(e) => setConfig({ ...config, liveTitle: e.target.value })}
                                placeholder="e.g. Sunday Worship Service - Live"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 text-sm"
                            />
                        </div>

                        {/* Live Preview */}
                        {config.liveVideoId && (
                            <div className="space-y-2 pt-2">
                                <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Live Preview</p>
                                <div className="rounded-2xl overflow-hidden border border-red-500/30 bg-black">
                                    <div className="aspect-video">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${config.liveVideoId}?autoplay=0`}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Indicator */}
                    {config.isLiveOverride && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
                            <div>
                                <p className="text-sm font-bold text-red-400">LIVE MODE ACTIVE</p>
                                <p className="text-xs text-white/40">
                                    {config.liveVideoId
                                        ? `Streaming: ${config.liveVideoId}`
                                        : 'No video ID set — users will see a "Join Live" link to your channel'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
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
