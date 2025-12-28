'use client';

import Link from 'next/link';
import { ArrowLeft, User, Bell, Smartphone, Lock, HelpCircle, LogOut, ChevronRight, Moon, Volume2, Shield, Share2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

// Define the shape of a settings item
interface SettingsItem {
    icon: any; // Using any for Lucide icon component simplicity
    label: string;
    sub: string;
    type?: 'link' | 'toggle' | 'static';
    href?: string;
    value?: boolean;
    action?: () => void;
}

interface SettingsSection {
    title: string;
    items: SettingsItem[];
}

export default function SettingsPage() {
    const { logout, preferences, setPreferences } = useAppStore();
    const router = useRouter();

    const handleClearCache = () => {
        if (window.confirm("Are you sure you want to clear all app data and cache? This will sign you out.")) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/';
        }
    };

    const handleLogout = () => {
        logout();
        toast.success("Signed out successfully");
        router.push('/signin');
    };

    const handleShareApp = async () => {
        const shareData = {
            title: 'Call of Jesus App',
            text: 'Listen to the best worship songs and sermons on COJ App!',
            url: window.location.origin
        };
        try {
            if (navigator.share) await navigator.share(shareData);
            else {
                await navigator.clipboard.writeText(window.location.origin);
                toast.success("App link copied to clipboard!");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const toggleSetting = async (setting: string, current: boolean, key: keyof typeof preferences) => {
        const newValue = !current;

        // Special Logic for Notifications
        if (key === 'notifications' && newValue) {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    toast.error("Permission denied for notifications");
                    return;
                }
            }
        }

        setPreferences({ [key]: newValue });
        toast.success(`${setting} ${newValue ? 'Enabled' : 'Disabled'}`);
    }

    const sections: SettingsSection[] = [
        {
            title: 'Account',
            items: [
                { icon: User, label: 'Edit Profile', sub: 'Change name, avatar, bio', href: '/profile/edit', type: 'link' },
                { icon: Lock, label: 'Privacy & Security', sub: 'Policy & Data', href: '/privacy', type: 'link' },
                { icon: Shield, label: 'Subscription', sub: 'Manage Premium (Pro)', href: '/premium', type: 'link' }
            ]
        },
        {
            title: 'Preferences',
            items: [
                {
                    icon: Bell,
                    label: 'Notifications',
                    sub: 'Push updates & alerts',
                    type: 'toggle',
                    value: preferences.notifications,
                    action: () => toggleSetting('Notifications', preferences.notifications, 'notifications')
                },
                {
                    icon: Volume2,
                    label: 'Audio Quality',
                    sub: 'High Fidelity (Lossless)',
                    type: 'toggle',
                    value: preferences.audioQuality,
                    action: () => toggleSetting('High Quality Audio', preferences.audioQuality, 'audioQuality')
                },
                {
                    icon: Smartphone,
                    label: 'Data Saver',
                    sub: 'Reduce effects & usage',
                    type: 'toggle',
                    value: preferences.dataSaver,
                    action: () => toggleSetting('Data Saver', preferences.dataSaver, 'dataSaver')
                }
            ]
        },
        {
            title: 'System',
            items: [
                { icon: Share2, label: 'Share App', sub: 'Invite friends & family', action: handleShareApp, type: 'static' }, // Using static type but with click action
                { icon: HelpCircle, label: 'Help & Support', sub: 'Contact Support', href: '/contact', type: 'link' },
                { icon: LogOut, label: 'Clear Cache', sub: 'Fix issues & Reset', action: handleClearCache, type: 'static' }
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
                                item.type === 'link' ? (
                                    <Link
                                        key={i}
                                        href={item.href || '#'}
                                        onClick={() => {
                                            if (item.href === '/privacy' || item.href === '/premium') {
                                                toast("Feature coming soon!");
                                            }
                                        }}
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
                                ) : item.type === 'toggle' ? (
                                    <div
                                        key={i}
                                        onClick={item.action}
                                        className="flex items-center gap-4 p-5 hover:bg-white/5 transition-colors cursor-pointer group select-none"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[var(--brand)]/20 group-hover:text-[var(--brand)] transition-colors">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-white">{item.label}</h3>
                                            <p className="text-sm text-white/40">{item.sub}</p>
                                        </div>
                                        {/* Toggle Switch UI */}
                                        <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${item.value ? 'bg-[var(--brand)]' : 'bg-white/10'}`}>
                                            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${item.value ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        key={i}
                                        onClick={item.action}
                                        className={`flex items-center gap-4 p-5 ${item.action ? 'cursor-pointer hover:bg-white/5' : 'opacity-60'} transition-colors`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                            <item.icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-white">{item.label}</h3>
                                            <p className="text-sm text-white/40">{item.sub}</p>
                                        </div>
                                        {item.action && (
                                            <ChevronRight className="w-5 h-5 text-white/20" />
                                        )}
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleLogout}
                    className="w-full p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all mb-12"
                >
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
