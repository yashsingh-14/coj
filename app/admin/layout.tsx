'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
    LayoutDashboard,
    Music,
    Users,
    Settings,
    LogOut,
    ShieldAlert,
    Calendar,
    Mic2,
    Home,
    Youtube,
    BookOpen,
    Bell
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAppStore();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // If definitely not auth, redirect
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile && profile.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    if (!isLoading) {
                        toast.error("Access Denied: Admins Only");
                        router.push('/');
                    }
                }
            } else {
                router.push('/signin');
            }
            setIsLoading(false);
        };

        checkAdmin();
    }, [isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#02000F] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/10 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#02000F] flex flex-col md:flex-row">
            {/* MOBILE HEADER */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0A0A0A] sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    <span className="font-black text-white">COJ<span className="text-white/40">Studio</span></span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 -mr-2 text-white/60 hover:text-white"
                >
                    {isSidebarOpen ? <LogOut className="w-6 h-6 rotate-180" /> : <LayoutDashboard className="w-6 h-6" />}
                </button>
            </div>

            {/* ADMIN SIDEBAR */}
            <aside className={`
                w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col 
                fixed inset-y-0 z-40 transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 md:static md:z-auto
            `}>
                <div className="p-6 border-b border-white/5 hidden md:block">
                    <div className="flex items-center gap-2 text-amber-500 mb-1">
                        <ShieldAlert className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Admin Panel</span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">COJ<span className="text-white/40">Studio</span></h1>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar pt-20 md:pt-4">
                    <p className="px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 mt-2">Core</p>
                    <div onClick={() => setIsSidebarOpen(false)}><AdminNavLink href="/admin" icon={LayoutDashboard} label="Dashboard" /></div>
                    <div onClick={() => setIsSidebarOpen(false)}><AdminNavLink href="/admin/users" icon={Users} label="User Management" /></div>

                    <p className="px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 mt-6">Content</p>
                    <div onClick={() => setIsSidebarOpen(false)}><AdminNavLink href="/admin/songs" icon={Music} label="Songs Library" /></div>
                    <div onClick={() => setIsSidebarOpen(false)}><AdminNavLink href="/admin/artists" icon={Mic2} label="Artists" /></div>
                    <div onClick={() => setIsSidebarOpen(false)}><AdminNavLink href="/admin/events" icon={Calendar} label="Events" /></div>

                    <p className="px-4 text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2 mt-6">Presentation</p>
                    <div onClick={() => setIsSidebarOpen(false)}><AdminNavLink href="/admin/home" icon={Home} label="Home Page" /></div>
                    <div onClick={() => setIsSidebarOpen(false)}><AdminNavLink href="/admin/sermons" icon={Youtube} label="Sermons" /></div>
                    <div onClick={() => setIsSidebarOpen(false)}><AdminNavLink href="/admin/utils" icon={BookOpen} label="Daily Content" /></div>
                    <div onClick={() => setIsSidebarOpen(false)}><AdminNavLink href="/admin/notifications" icon={Bell} label="Broadcast" /></div>
                </nav>

                <div className="p-4 border-t border-white/5">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                        <LogOut className="w-4 h-4" /> Exit to App
                    </Link>
                </div>
            </aside>

            {/* OVERLAY FOR MOBILE */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* MAIN CONTENT */}
            <main className="flex-1 min-h-screen bg-[#02000F] relative w-full overflow-x-hidden">
                {/* Background Glow */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px] opacity-40"></div>
                </div>

                <div className="relative z-10 p-4 md:p-8 pt-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

function AdminNavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    const pathname = usePathname();
    // Improved active state checking that handles sub-routes
    // e.g. /admin/songs/new should keep /admin/songs active? 
    // Ideally exact match for dashboard, partial for others if nested.
    // Simplifying: if pathname starts with href (and href is not just /admin unless it is exactly /admin)

    let active = false;
    if (href === '/admin') {
        active = pathname === '/admin';
    } else {
        active = pathname.startsWith(href);
    }

    return (
        <Link href={href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active
            ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20'
            : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}>
            <Icon className={`w-5 h-5 ${active ? 'text-black' : 'group-hover:text-amber-500 transition-colors'}`} />
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
}
