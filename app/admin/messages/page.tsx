'use client';

import { useState, useEffect } from 'react';
import {
    Mail, MessageSquare, HeartHandshake, Phone, Trash2, CheckCircle2,
    Clock, Search, ExternalLink, RefreshCw, AlertCircle
} from 'lucide-react';
import {
    getContactMessagesAdmin, deleteContactMessageAdmin,
    getTestimoniesAdmin, toggleApproveTestimonyAdmin, deleteTestimonyAdmin
} from '@/app/actions/admin';
import { toast } from 'sonner';

export default function AdminMessagesPage() {
    const [tab, setTab] = useState<'contact' | 'testimonies'>('contact');
    const [contacts, setContacts] = useState<any[]>([]);
    const [testimonies, setTestimonies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const [cRes, tRes] = await Promise.all([
                getContactMessagesAdmin(),
                getTestimoniesAdmin()
            ]);
            if (cRes.success) setContacts(cRes.data);
            if (tRes.success) setTestimonies(tRes.data);
        } catch (err) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleDeleteContact = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        const res = await deleteContactMessageAdmin(id);
        if (res.success) {
            setContacts(contacts.filter(c => c.id !== id));
            toast.success('Message deleted');
        } else {
            toast.error('Failed to delete message');
        }
    };

    const handleDeleteTestimony = async (id: string) => {
        if (!confirm('Are you sure you want to delete this testimony?')) return;
        const res = await deleteTestimonyAdmin(id);
        if (res.success) {
            setTestimonies(testimonies.filter(t => t.id !== id));
            toast.success('Testimony deleted');
        } else {
            toast.error('Failed to delete testimony');
        }
    };

    const handleToggleApprove = async (id: string, current: boolean) => {
        const res = await toggleApproveTestimonyAdmin(id, current);
        if (res.success) {
            setTestimonies(testimonies.map(t => t.id === id ? { ...t, is_approved: !current } : t));
            toast.success(!current ? 'Testimony approved for display!' : 'Testimony hidden');
        } else {
            toast.error('Failed to update status');
        }
    };

    const filteredContacts = contacts.filter(c =>
        (c.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (c.email?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (c.phone || '').includes(search) ||
        (c.message?.toLowerCase() || '').includes(search.toLowerCase())
    );

    const filteredTestimonies = testimonies.filter(t =>
        (t.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (t.city?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (t.category?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (t.story?.toLowerCase() || '').includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                        Submissions & Testimonies
                    </h1>
                    <p className="text-white/40 text-sm mt-1">
                        View contact inquiries and testimonies submitted from the website.
                    </p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white text-xs font-bold transition-all"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Counters & Tab Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={() => setTab('contact')}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                        tab === 'contact'
                            ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Mail className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-black text-white">{contacts.length}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">Contact Messages</h3>
                    <p className="text-xs text-white/50 mt-0.5">Inquiries from /contact form</p>
                </button>

                <button
                    onClick={() => setTab('testimonies')}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                        tab === 'testimonies'
                            ? 'bg-purple-500/15 border-purple-500/50 shadow-lg shadow-purple-500/10'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                            <HeartHandshake className="w-5 h-5" />
                        </div>
                        <span className="text-2xl font-black text-white">{testimonies.length}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">Testimonies</h3>
                    <p className="text-xs text-white/50 mt-0.5">Submitted via /share-testimony</p>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${tab === 'contact' ? 'contact messages' : 'testimonies'} by name, phone, or keyword...`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-amber-400/50 transition-colors"
                />
            </div>

            {/* Content List */}
            {loading ? (
                <div className="py-20 text-center">
                    <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-white/40 text-xs mt-3">Loading submissions...</p>
                </div>
            ) : tab === 'contact' ? (
                /* CONTACT MESSAGES LIST */
                filteredContacts.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-white/40">
                        <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-semibold text-sm">No contact messages found</p>
                        <p className="text-xs text-white/30 mt-1">When someone submits the Contact form, their details will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredContacts.map((c) => {
                            const date = new Date(c.created_at).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                            });
                            const cleanPhone = (c.phone || '').replace(/\D/g, '');
                            return (
                                <div
                                    key={c.id}
                                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-all space-y-3"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                                        <div>
                                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                                {c.name}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 mt-1">
                                                {c.phone && <span>📞 {c.phone}</span>}
                                                {c.email && <span>✉️ {c.email}</span>}
                                                <span className="flex items-center gap-1 text-white/30">
                                                    <Clock className="w-3 h-3" /> {date}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {cleanPhone && (
                                                <a
                                                    href={`https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=Hello%20${encodeURIComponent(c.name)}%2C%20regarding%20your%20message%20to%20Call%20of%20Jesus%20Ministries`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold transition-all flex items-center gap-1"
                                                >
                                                    <MessageSquare className="w-3 h-3" />
                                                    <span>Reply on WhatsApp</span>
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleDeleteContact(c.id)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                                                title="Delete message"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
                                        {c.message}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )
            ) : (
                /* TESTIMONIES LIST */
                filteredTestimonies.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/5 text-white/40">
                        <HeartHandshake className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-semibold text-sm">No testimonies found</p>
                        <p className="text-xs text-white/30 mt-1">When someone shares their testimony, it will appear here for review.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTestimonies.map((t) => {
                            const date = new Date(t.created_at).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                            });
                            return (
                                <div
                                    key={t.id}
                                    className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-all space-y-3"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-base font-bold text-white">{t.name}</h3>
                                                {t.category && (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                                                        {t.category}
                                                    </span>
                                                )}
                                                {t.is_approved ? (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                                                        Pending Review
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 mt-1">
                                                {t.city && <span>📍 {t.city}</span>}
                                                {t.phone && <span>📞 {t.phone}</span>}
                                                {t.email && <span>✉️ {t.email}</span>}
                                                <span className="flex items-center gap-1 text-white/30">
                                                    <Clock className="w-3 h-3" /> {date}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleApprove(t.id, Boolean(t.is_approved))}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                    t.is_approved
                                                        ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                                                        : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                                                }`}
                                            >
                                                {t.is_approved ? 'Hide' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTestimony(t.id)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                                                title="Delete testimony"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap">
                                        {t.story}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )
            )}
        </div>
    );
}
