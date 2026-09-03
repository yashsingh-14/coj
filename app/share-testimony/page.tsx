'use client';

import { useState } from 'react';
import { HeartHandshake, Send, CheckCircle2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import LandingNavbar from '@/components/hero/LandingNavbar';

export default function ShareTestimonyPage() {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        city: '',
        category: 'Healing & Miracle',
        testimony: '',
        hasMedicalReport: 'No',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.phone || !formData.testimony) {
            toast.error("Please fill in your name, phone number, and testimony details.");
            return;
        }
        setSubmitted(true);
        toast.success("Thank you! Your testimony has been submitted successfully.");
    };

    return (
        <main className="min-h-screen bg-black text-white py-24 px-6 md:px-12">
            <LandingNavbar />
            <div className="max-w-3xl mx-auto space-y-12 pt-12">
                
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                        <HeartHandshake className="w-4 h-4 text-amber-400" />
                        Praise Report Form
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Share Your <span className="font-serif italic font-normal text-amber-300">Testimony</span>
                    </h1>
                    <p className="text-neutral-300 text-base md:text-lg font-light">
                        Your breakthrough can become someone else&apos;s hope. Let&apos;s magnify the name of Lord Jesus Christ together!
                    </p>
                </div>

                {submitted ? (
                    <div className="rounded-3xl bg-neutral-900 border border-amber-400/40 p-12 text-center space-y-6">
                        <CheckCircle2 className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
                        <h2 className="text-3xl font-bold text-white">Testimony Received!</h2>
                        <p className="text-neutral-300 leading-relaxed max-w-md mx-auto">
                            Thank you for sharing what Lord Jesus has done in your life. Our team will review and contact you shortly. God bless you richly!
                        </p>
                        <button
                            onClick={() => { setSubmitted(false); setFormData({ fullName: '', phone: '', email: '', city: '', category: 'Healing & Miracle', testimony: '', hasMedicalReport: 'No' }); }}
                            className="px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all"
                        >
                            Submit Another Testimony
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="rounded-3xl bg-neutral-900/80 border border-white/15 p-8 md:p-10 space-y-6 shadow-2xl">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Enter your full name"
                                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="yourname@example.com"
                                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                    City / Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="New Delhi, India"
                                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                Breakthrough Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white focus:outline-none focus:border-amber-400 transition-all text-sm"
                            >
                                <option value="Healing & Miracle">Healing & Miracle</option>
                                <option value="Creative Organ Miracle">Creative Organ Miracle</option>
                                <option value="Deliverance & Peace">Deliverance & Peace</option>
                                <option value="Financial Breakthrough">Financial Breakthrough</option>
                                <option value="Family Restoration">Family Restoration</option>
                                <option value="Salvation & Transformation">Salvation & Transformation</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                                Your Testimony Details *
                            </label>
                            <textarea
                                required
                                rows={6}
                                value={formData.testimony}
                                onChange={(e) => setFormData({ ...formData, testimony: e.target.value })}
                                placeholder="Describe how Lord Jesus touched and transformed your situation..."
                                className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-all text-sm leading-relaxed"
                            />
                        </div>

                        <div className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-white uppercase tracking-wider">Do you have medical reports / photos?</p>
                                <p className="text-xs text-neutral-400">Attach reports if applicable for medical verification.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4 text-amber-400" />
                                <span className="text-xs text-neutral-300 font-mono">Optional</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-white text-black font-bold text-base hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-xl"
                        >
                            <Send className="w-5 h-5 text-black" />
                            <span>Submit Testimony</span>
                        </button>
                    </form>
                )}

            </div>
        </main>
    );
}
