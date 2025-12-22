'use client';

import Link from 'next/link';
import { ArrowLeft, Camera, Save, User, Mail, AtSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function EditProfilePage() {
    const { currentUser, login } = useAppStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('Leading worship with passion.'); // Default/Mock since we don't have bio in User type yet

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
            // If user had a bio property, we'd set it here
        }
    }, [currentUser]);

    const handleSave = () => {
        if (!name || !email) {
            toast.error("Name and Email are required");
            return;
        }

        setIsLoading(true);

        // Simulate API delay
        setTimeout(() => {
            if (currentUser) {
                // Update user in store (re-login with new details)
                login({
                    ...currentUser,
                    name: name,
                    email: email,
                    // We don't have bio in the User interface yet, so we just persist what we can
                });
                toast.success("Profile updated successfully");
                router.push('/profile');
            }
            setIsLoading(false);
        }, 1000);
    };

    if (!currentUser) return null;

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
                    <div className="relative group cursor-pointer" onClick={() => toast.info("Avatar upload is simulated for now")}>
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-[var(--brand)] transition-colors">
                            {currentUser.avatar ? (
                                <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <div className="w-full h-full bg-[var(--brand)] flex items-center justify-center text-4xl font-bold">
                                    {currentUser.name.charAt(0)}
                                </div>
                            )}
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
                                value={name}
                                onChange={(e) => setName(e.target.value)}
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-2">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
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
