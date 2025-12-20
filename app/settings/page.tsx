'use client';

import Link from 'next/link';
import { ArrowLeft, User, Bell, Smartphone, Monitor, Lock, HelpCircle, LogOut, ChevronRight, Moon, Volume2, Shield } from 'lucide-react';

export default function SettingsPage() {

    const sections = [
        {
            title: 'Account',
            items: [
                { icon: User, label: 'Edit Profile', sub: 'Change name, avatar, bio', href: '/profile' },
                { icon: Lock, label: 'Privacy & Security', sub: 'Password, 2FA, data', href: '/privacy' },
                { icon: Shield, label: 'Subscription', sub: 'Manage Premium plan', href: '/premium' }
            ]
        },
        {
            title: 'App Settings',
            items: [
                { icon: Bell, label: 'Notifications', sub: 'Push, Email, updates', href: '#' },
                { icon: Volume2, label: 'Audio Quality', sub: 'High Fidelity (Lossless)', href: '#' },
                { icon: Moon, label: 'Appearance', sub: 'Dark Mode (System)', href: '#' }
            ]
        },
        {
            title: 'Support',
            items: [
                { icon: HelpCircle, label: 'Help & Support', sub: 'FAQ, Contact Us', href: '/contact' },
                { icon: Smartphone, label: 'About Version', sub: 'v2.4.0 (Beta)', href: '#' }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[#02000F] text-white pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#02000F]/80 backdrop-blur-xl border-b border-white/5 p-6 flex items-center gap-4">
                <Link href="/profile" className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors group">
                    <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            </div>

            <div className="container mx-auto px-6 max-w-2xl py-8">

                {sections.map((section, idx) => (
                    <div key={idx} className="mb-10">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4 px-2">{section.title}</h2>
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
                            {section.items.map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className="flex items-center gap-4 p-5 hover:bg-white/5 transition-colors group"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[var(--brand)]/20 group-hover:text-[var(--brand)] transition-colors">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-white group-hover:translate-x-1 transition-transform">{item.label}</h3>
                                        <p className="text-sm text-white/40">{item.sub}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}

                <button className="w-full p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all mb-12">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>

                <p className="text-center text-xs text-white/20 font-mono">
                    COJ Worship App<br />
                    Build 2024.12.20
                </p>

            </div>
        </div>
    );
}
