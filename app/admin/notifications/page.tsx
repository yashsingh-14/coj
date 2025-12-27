'use client';

import { useState } from 'react';
import { Sidebar } from 'lucide-react'; // Placeholder
import { toast } from 'sonner';
import { Send, Bell, Loader2 } from 'lucide-react';

export default function NotificationsPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [url, setUrl] = useState('/');
    const [loading, setLoading] = useState(false);

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
                toast.success(`Sent to ${data.count} subscribers! 🚀`);
                setTitle('');
                setMessage('');
            } else {
                toast.error("Failed: " + data.error);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error sending notification.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10">
            <h1 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
                <Bell className="w-8 h-8 text-amber-500" />
                Push Notifications
            </h1>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <form onSubmit={handleSend} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                            placeholder="e.g. New Song Added!"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Message</label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 h-32"
                            placeholder="e.g. Check out the latest worship song 'Way Maker'..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Destination URL</label>
                        <input
                            type="text"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50"
                            placeholder="e.g. /songs/way-maker"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                            Send Broadcast
                        </button>
                        <p className="text-center text-white/20 text-xs mt-4">
                            This will send a push notification to all subscribed devices immediately.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
