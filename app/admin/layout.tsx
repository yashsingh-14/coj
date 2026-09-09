'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { checkIsAdmin } from '@/app/actions/admin';
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
    Bell,
    MessageSquare,
    Lock,
    Mail,
    ArrowRight,
    Sparkles,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Login form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isDevLoggingIn, setIsDevLoggingIn] = useState(false);

    const verifyAdmin = async () => {
        try {
            // Check session first (0ms local storage check)
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.user) {
                setIsLoading(false);
                setIsAdmin(false);
                return;
            }

            // Verify with server action
            const result = await checkIsAdmin(session.user.id);
            if (result.isAdmin) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
                toast.error("Access Denied: Your account is not an Admin");
            }
        } catch (err) {
            console.error('[Admin] Verify error:', err);
            setIsAdmin(false);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Safety timeout so it NEVER hangs
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 3000);

        verifyAdmin();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                verifyAdmin();
            } else {
                setIsAdmin(false);
            }
        });

        return () => {
            clearTimeout(timer);
            subscription.unsubscribe();
        };
    }, []);

    const handlePasswordLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }

        setIsLoggingIn(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                toast.error(error.message);
            } else if (data.user) {
                toast.success("Signed in successfully!");
                await verifyAdmin();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to sign in");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleDevOneClickLogin = async () => {
        setIsDevLoggingIn(true);
        try {
            const res = await fetch('/api/auth/dev-login', { method: 'POST' });
            const json = await res.json();

            if (!res.ok || !json.token_hash) {
                throw new Error(json.error || "Dev login failed");
            }

            const { error } = await supabase.auth.verifyOtp({
                token_hash: json.token_hash,
                type: 'magiclink'
            });

            if (error) {
                throw error;
            }

            toast.success("Welcome, Yash Singh (Admin)! 🚀");
            await verifyAdmin();
        } catch (err: any) {
            console.error("Dev login error:", err);
            toast.error("Dev login failed: " + err.message);
        } finally {
            setIsDevLoggingIn(false);
        }
    };

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/admin`
            }
        });
    };

    // 1. LOADING STATE
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#02000F] flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-white/10 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-xs text-white/40 font-mono tracking-widest uppercase">Verifying Admin Access...</p>
            </div>
        );
    }

    // 2. UNAUTHENTICATED / NOT ADMIN: SHOW ADMIN ACCESS SCREEN
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-[#02000F] text-white flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)] rounded-full pointer-events-none" />

                <div className="relative z-10 w-full max-w-md bg-[#0D0B12] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                            <ShieldAlert className="w-7 h-7" />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">COJ Studio</h1>
                        <p className="text-xs text-white/50">Admin credentials required to access this portal.</p>
                    </div>

                    {/* 1-Click Admin Access */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-orange-500/10 border border-amber-500/30 text-center space-y-2">
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Authorized Admin Account</span>
                        </div>
                        <p className="text-[11px] text-white/60">Log in instantly as <strong>Yash Singh</strong> (ys181544@gmail.com)</p>
                        <button
                            type="button"
                            onClick={handleDevOneClickLogin}
                            disabled={isDevLoggingIn}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
                        >
                            {isDevLoggingIn ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <>
                                    <span>⚡ 1-Click Admin Access</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 text-xs text-white/30">
                        <div className="flex-1 h-px bg-white/10" />
                        <span>OR SIGN IN WITH PASSWORD</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="callofjesus2015@gmail.com"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-amber-400/50 text-sm text-white placeholder-white/30 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-white/50">Password</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-amber-400/50 text-sm text-white placeholder-white/30 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoggingIn ? 'Verifying...' : 'Sign In with Password'}
                        </button>
                    </form>

                    {/* Google Login */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        <span>Sign in with Google</span>
                    </button>

                    <div className="pt-2 text-center">
                        <Link href="/" className="text-xs text-white/40 hover:text-amber-400 transition-colors">
                            ← Back to Main Website
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

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
                    <div onClick={() => setIsSidebarOpen(false)}><AdminNavLink href="/admin/messages" icon={MessageSquare} label="Submissions" /></div>
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
                    <div onClick={() => setIsSidebarOpen(false)}><AdminNavLink href="/admin/settings" icon={Settings} label="Global Settings" /></div>
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
