'use client';

import Link from 'next/link';
import { ArrowLeft, Camera, Save, User, Mail, AtSign } from 'lucide-react';
import { useState } from 'react';

export default function EditProfilePage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = () => {
        setIsLoading(true);
        // Simulate save
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <div className="min-h-screen bg-[#02000F] text-white pb-32">
            {/* Header */}
            <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-[#02000F]/80 backdrop-blur-xl sticky top-0 z-40">
                <Link href="/profile" className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors group">
                    <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
            </div>

            <div className="container mx-auto px-6 max-w-2xl mt-10">

                {/* Avatar Uploader */}
                <div className="flex flex-col items-center mb-12">
                    <div className="relative group cursor-pointer">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-[var(--brand)] transition-colors">
                            <img
                                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2000&auto=format&fit=crop"
                                alt="Profile"
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <p className="mt-4 text-sm text-[var(--brand)] font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Change Photo</p>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Display Name</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                defaultValue="Worship Leader"
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Username</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                                <AtSign className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                defaultValue="worshiper_01"
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                defaultValue="leader@worship.com"
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Bio</label>
                        <textarea
                            defaultValue="Leading worship with passion."
                            rows={4}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-all resize-none"
                        />
                    </div>

                    <div className="pt-8">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="w-full py-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold uppercase tracking-widest text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>Saving...</>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
