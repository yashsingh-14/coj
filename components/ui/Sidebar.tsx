'use client';

import { X, Home, Search, Heart, User, Sparkles, Music, Star, Settings, LogOut, ListMusic, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { logout, currentUser } = useAppStore();

    const menuItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: Search, label: 'Search', href: '/search' },
        { icon: ListMusic, label: 'Setlists', href: '/sets' },
        { icon: Sparkles, label: 'New Arrivals', href: '/new-arrivals' },
        { icon: Music, label: 'Worship', href: '/categories/worship' },
        { icon: Star, label: 'Praise', href: '/categories/praise' },
        { icon: Heart, label: 'Favorites', href: '/favourites' },
    ];

    const bottomItems = [
        ...(currentUser?.role === 'admin' ? [{ icon: ShieldCheck, label: 'Admin Panel', href: '/admin' }] : []),
        { icon: User, label: 'Profile', href: '/profile' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Floating Glass Dock */}
            <div className={`fixed top-4 bottom-4 left-4 w-72 bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl z-50 transform transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) flex flex-col overflow-hidden ${isOpen ? 'translate-x-0 opacity-100 scale-100' : '-translate-x-[120%] opacity-0 scale-95'}`}>

                <div className="p-8 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        COJ<span className="text-[var(--brand)]">worship</span>
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 px-4 overflow-y-auto no-scrollbar space-y-2">
                    <p className="px-4 text-xs font-bold text-white/30 uppercase tracking-widest mb-4 mt-2">Discover</p>

                    {menuItems.map((item, i) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={i}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive ? 'bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/30' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-current group-hover:scale-110 transition-transform'}`} />
                                <span className={`font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                            </Link>
                        );
                    })}

                    <div className="h-px bg-white/5 my-6 mx-4" />

                    <p className="px-4 text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Account</p>
                    {bottomItems.map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-white/60 hover:bg-white/10 hover:text-white transition-all duration-300 group"
                        >
                            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Bottom Actions */}
                <div className="p-6 bg-gradient-to-t from-black/40 to-transparent">
                    <button
                        onClick={async () => {
                            const { supabase } = await import('@/lib/supabaseClient');
                            await supabase.auth.signOut();
                            logout();
                            onClose();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-white/40 transition-all font-medium text-sm"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </div>
        </>
    );
}
