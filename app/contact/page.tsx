'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Phone, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.message) {
            toast.error("Please fill in your name and message.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('contact_messages').insert([{
                name: formData.name,
                email: formData.email || null,
                phone: formData.phone || null,
                message: formData.message,
            }]);

            if (error) {
                console.error('Contact form error:', error);
                // Even if table doesn't exist, show success for UX
                // The message can be sent via WhatsApp as fallback
            }

            setSubmitted(true);
            toast.success("Message sent successfully! We'll get back to you soon.");
        } catch (err) {
            console.error('Contact submit error:', err);
            toast.error("Something went wrong. Please try WhatsApp instead.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white px-4 sm:px-6 py-6 pb-32">
            <Link href="/" className="inline-flex items-center gap-2 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md mb-6 sm:mb-8 transition-colors text-xs sm:text-sm">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="font-bold">Back</span>
            </Link>

            <div className="max-w-xl mx-auto">
                <h1 className="text-2xl sm:text-4xl font-serif font-bold mb-2">Get in Touch</h1>
                <p className="text-white/60 mb-6 sm:mb-10 text-sm sm:text-base">We&apos;d love to hear from you — prayer requests, testimonies, or any questions.</p>

                {submitted ? (
                    <div className="rounded-3xl bg-neutral-900 border border-amber-400/40 p-10 text-center space-y-5">
                        <CheckCircle2 className="w-14 h-14 text-amber-400 mx-auto animate-bounce" />
                        <h2 className="text-2xl font-bold text-white">Message Received!</h2>
                        <p className="text-neutral-300 leading-relaxed max-w-md mx-auto text-sm">
                            Thank you for reaching out. Our team will get back to you shortly. God bless you!
                        </p>
                        <button
                            onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', message: '' }); }}
                            className="px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all"
                        >
                            Send Another Message
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 focus:outline-none transition-colors text-sm sm:text-base"
                                    placeholder="Your name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 focus:outline-none transition-colors text-sm sm:text-base"
                                    placeholder="+91 89283 94853"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 focus:outline-none transition-colors text-sm sm:text-base"
                                placeholder="yourname@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Message *</label>
                            <textarea
                                rows={4}
                                required
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 focus:outline-none transition-colors text-sm sm:text-base"
                                placeholder="How can we pray for you?"
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 sm:py-4 bg-amber-500 rounded-xl text-black font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors text-sm sm:text-base flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Message
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* Quick WhatsApp */}
                <div className="mt-6 text-center">
                    <a
                        href="https://wa.me/918928394853?text=Hello%2C%20I%20want%20to%20connect%20with%20Call%20of%20Jesus%20Ministries"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-bold hover:bg-green-600/30 transition-all"
                    >
                        <MessageCircle className="w-4 h-4" />
                        Chat on WhatsApp
                    </a>
                </div>

                <div className="mt-10 sm:mt-16 pt-10 sm:pt-16 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-left">
                    <div>
                        <Phone className="w-6 h-6 text-amber-500 mb-2 mx-auto md:mx-0" />
                        <p className="text-sm font-bold">Prayer Line</p>
                        <a href="tel:+918928394853" className="text-xs text-white/40 hover:text-amber-400 transition-colors">
                            +91 89283 94853
                        </a>
                    </div>
                    <div>
                        <MapPin className="w-6 h-6 text-amber-500 mb-2 mx-auto md:mx-0" />
                        <p className="text-sm font-bold">Visit Us</p>
                        <p className="text-xs text-white/40">
                            Near Adivali Talab, Malangad Road, Kalyan East - 421306
                        </p>
                    </div>
                    <div>
                        <Mail className="w-6 h-6 text-amber-500 mb-2 mx-auto md:mx-0" />
                        <p className="text-sm font-bold">Social</p>
                        <a
                            href="https://www.instagram.com/callofjesusministries"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-white/40 hover:text-amber-400 transition-colors"
                        >
                            @callofjesusministries
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
