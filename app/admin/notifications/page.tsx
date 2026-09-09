'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
    Send, Bell, Loader2, Video, Globe, MessageSquare,
    Instagram, Radio, Sparkles, Copy, Check, ExternalLink
} from 'lucide-react';

const PRESETS = [
    {
        id: 'youtube-live',
        name: 'YouTube Live',
        icon: Video,
        color: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
        badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
        title: '🔴 CALL OF JESUS IS LIVE NOW!',
        message: 'Worship Service & Word of God is live on YouTube. Tune in to receive your breakthrough!',
        url: 'https://www.youtube.com/@cojministries/live'
    },
    {
        id: 'facebook-live',
        name: 'Facebook Live',
        icon: Radio,
        color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        title: '🔵 FACEBOOK LIVE: Join the Service Now!',
        message: 'We are broadcasting live on Facebook right now. Tune in with your family!',
        url: 'https://www.facebook.com/COJMinistries/live'
    },
    {
        id: 'instagram-post',
        name: 'Instagram Post',
        icon: Instagram,
        color: 'from-pink-500/20 to-purple-600/10 border-pink-500/30 text-pink-400',
        badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        title: '📸 New Post from Call of Jesus Ministries',
        message: 'Check out our latest prophetic word, testimony reel, and updates on Instagram!',
        url: 'https://www.instagram.com/cojministries'
    },
    {
        id: 'whatsapp-news',
        name: 'WhatsApp News',
        icon: MessageSquare,
        color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        title: '🟢 Call of Jesus: Ministry Announcement',
        message: 'Important news update and prayer points from Call of Jesus Ministries.',
        url: '/'
    },
];

export default function NotificationsPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [url, setUrl] = useState('/');
    const [loading, setLoading] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState(false);

    const applyPreset = (preset: typeof PRESETS[0]) => {
        setTitle(preset.title);
        setMessage(preset.message);
        setUrl(preset.url);
        toast.info(`Applied ${preset.name} template!`);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, message, url })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(`Broadcast sent! Delivered to ${data.count || data.sent || 0} devices 🚀`);
                setTitle('');
                setMessage('');
                setUrl('/');
            } else {
                toast.error("Failed: " + (data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error(err);
            toast.error("Error sending notification.");
        } finally {
            setLoading(false);
        }
    };

    const webhookUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/api/notifications/webhook`
        : 'https://callofjesus.in/api/notifications/webhook';

    const copyWebhook = async () => {
        await navigator.clipboard.writeText(webhookUrl);
        setCopiedWebhook(true);
        toast.success('Webhook URL copied!');
        setTimeout(() => setCopiedWebhook(false), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto py-6 md:py-10 px-4 sm:px-6 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                    <Bell className="w-7 h-7 text-amber-500" />
                    Live Streams & Social Notifications
                </h1>
                <p className="text-xs sm:text-sm text-white/50 mt-1">
                    Instantly broadcast web push alerts to all subscribed believers when you go live or post updates.
                </p>
            </div>

            {/* ─── 1-CLICK QUICK PRESETS ─── */}
            <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-widest text-amber-400">
                    1-Click Broadcast Presets
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {PRESETS.map((p) => {
                        const Icon = p.icon;
                        return (
                            <button
                                key={p.id}
                                onClick={() => applyPreset(p)}
                                className={`group p-4 rounded-2xl bg-gradient-to-br ${p.color} border text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Icon className="w-5 h-5" />
                                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Use</span>
                                </div>
                                <h3 className="text-sm font-bold text-white">{p.name}</h3>
                                <p className="text-[11px] text-white/60 line-clamp-1 mt-0.5">{p.title}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Form & Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left: Broadcast Form */}
                <div className="lg:col-span-7 bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-8">
                    <form onSubmit={handleSend} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                Notification Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-white/25"
                                placeholder="e.g. 🔴 CALL OF JESUS IS LIVE NOW!"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                Notification Message / Body
                            </label>
                            <textarea
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-white/25 h-28"
                                placeholder="e.g. Join the Sunday service stream and receive your prayer breakthrough..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
                                Target Destination URL (Opens when user taps)
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors placeholder:text-white/25"
                                placeholder="e.g. https://youtube.com/@cojministries/live or /"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black py-4 rounded-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2.5 uppercase tracking-wider text-xs sm:text-sm disabled:opacity-50 active:scale-[0.99]"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                                {loading ? 'Broadcasting to All Subscribers...' : 'Send Broadcast Notification Now'}
                            </button>
                            <p className="text-center text-white/30 text-[11px] mt-3">
                                This will instantly send a push notification to all subscribed Android, iOS & desktop devices.
                            </p>
                        </div>
                    </form>
                </div>

                {/* Right: Live Preview & Webhook Info */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Notification Preview Card */}
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Live Device Preview</span>
                        </div>

                        {/* Simulated Phone Notification Banner */}
                        <div className="rounded-2xl bg-[#181622] border border-white/15 p-4 shadow-xl space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-white/40">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-black font-bold">
                                        C
                                    </div>
                                    <span className="font-bold text-white/70">Call of Jesus</span>
                                </div>
                                <span>Just now</span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                                {title || '🔴 CALL OF JESUS IS LIVE NOW!'}
                            </h4>
                            <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                                {message || 'Worship Service & Word of God is live on YouTube. Tune in to receive your breakthrough!'}
                            </p>
                            <div className="pt-1 flex items-center gap-1 text-[10px] text-amber-400 font-mono truncate">
                                <span>URL:</span>
                                <span className="truncate text-white/40">{url || 'https://youtube.com/@cojministries/live'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Automated Webhook Integration Card */}
                    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/25 rounded-3xl p-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                                Automated Social Webhook
                            </span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                Zero-Touch
                            </span>
                        </div>

                        <p className="text-xs text-white/60 leading-relaxed">
                            Connect this webhook to <strong>Zapier</strong>, <strong>Make.com</strong>, or <strong>IFTTT</strong> with your YouTube/Facebook account so notifications send automatically the second you go live!
                        </p>

                        <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl p-2.5">
                            <span className="font-mono text-[11px] text-amber-200 truncate flex-1">
                                {webhookUrl}
                            </span>
                            <button
                                onClick={copyWebhook}
                                className="p-2 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors flex-shrink-0"
                                title="Copy Webhook URL"
                            >
                                {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
