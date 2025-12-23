'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { LayoutDashboard, Music, Users, Settings, LogOut, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { currentUser, isAuthenticated } = useAppStore();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            if (!isAuthenticated) {
                // Allow time for hydration, but if definitely not auth, redirect
                // Actually, wait a bit or check if store is hydrated. 
                // Assuming verifyAuth() ran in AppShell.
                // Let's rely on Supabase directly for double check
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push('/signin');
                    return;
                }
            }

            // Check Profile Role
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile && profile.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    toast.error("Access Denied: Admins Only");
                    router.push('/');
                }
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
        <div className="min-h-screen bg-[#02000F] flex">
            {/* ADMIN SIDEBAR */}
            <aside className="w-64 bg-[#0A0A0A] border-r border-white/5 flex flex-col fixed inset-y-0 z-50">
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-center gap-2 text-amber-500 mb-1">
                        <ShieldAlert className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Admin Panel</span>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">COJ<span className="text-white/40">Studio</span></h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <AdminNavLink href="/admin" icon={LayoutDashboard} label="Dashboard" />
                    <AdminNavLink href="/admin/songs" icon={Music} label="Manage Songs" active />
                    <AdminNavLink href="/admin/users" icon={Users} label="Users" />
                    <AdminNavLink href="/admin/settings" icon={Settings} label="Settings" />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                        <LogOut className="w-4 h-4" /> Exit to App
                    </Link>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-64 min-h-screen bg-[#02000F] relative">
                {/* Background Glow */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[100px] opacity-40"></div>
                </div>

                <div className="relative z-10 p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

function AdminNavLink({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) {
    // Determine active state roughly (can improve with usePathname)
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
