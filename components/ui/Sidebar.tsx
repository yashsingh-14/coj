'use client';

import React from 'react';
import Link from 'next/link';
import { X, User, Heart, Home, Mic2, Grid, Phone, LogIn, ChevronRight } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sidebar Drawer - Full Screen Glass */}
            <div
                className={`fixed inset-0 w-full h-full bg-[#0a0a0a]/95 backdrop-blur-xl z-50 transform transition-transform duration-500 cubic-bezier(0.7, 0, 0.3, 1) ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* User Profile Header - Minimal & Floating */}
                <div className="absolute top-0 right-0 p-8 z-50">
                    <button
                        onClick={onClose}
                        className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90 duration-500"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-col h-full p-8 md:p-16 justify-center max-w-4xl mx-auto w-full relative">
                    {/* Background Decor */}
                    <div className="absolute top-1/4 left-0 w-64 h-64 bg-[var(--brand)] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

                    {/* Navigation Links - Large & Staggered */}
                    <nav className="space-y-6 flex flex-col items-start">
                        <SidebarItem icon={Home} label="Home" href="/" onClick={onClose} index={0} />
                        <SidebarItem icon={Heart} label="Favourites" href="/favourites" onClick={onClose} index={1} />
                        <SidebarItem icon={Grid} label="Categories" href="/categories" onClick={onClose} index={2} />
                        <SidebarItem icon={Mic2} label="Artists" href="/artists" onClick={onClose} index={3} />
                        <SidebarItem icon={Phone} label="Contact" href="/contact" onClick={onClose} index={4} />
                        <SidebarItem icon={LogIn} label="Sign In" href="/signin" onClick={onClose} index={5} className="mt-8 text-[var(--brand)]" />
                    </nav>

                    {/* Footer Info */}
                    <div className="mt-16 border-t border-white/10 pt-8 flex flex-col md:flex-row gap-8 text-white/40 text-sm">
                        <p>© 2025 COJworship.</p>
                        <div className="flex gap-4">
                            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function SidebarItem({ icon: Icon, label, href, onClick, index, className }: { icon: any, label: string, href: string, onClick: () => void, index: number, className?: string }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`group flex items-center gap-6 text-3xl md:text-5xl font-bold text-white/50 hover:text-white transition-all duration-300 transform translate-y-4 opacity-0 animate-slide-up ${className}`}
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
        >
            <span className="w-0 overflow-hidden group-hover:w-12 transition-all duration-300 flex items-center text-[var(--brand)]">
                <Icon className="w-8 h-8 md:w-10 md:h-10" />
            </span>
            <span className="relative">
                {label}
                <span className="absolute -bottom-2 left-0 w-0 h-1 bg-[var(--brand)] group-hover:w-full transition-all duration-500 ease-out"></span>
            </span>
        </Link>
    );
}
