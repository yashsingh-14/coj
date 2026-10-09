'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { Users, Search, Shield, Loader2, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { syncUsersAdminV3, updateUserRoleAdmin } from '@/app/actions/admin';

export default function AdminUsersPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('name', { ascending: true });

        if (data) setUsers(data);
        setIsLoading(false);
    };

    const handleSync = async () => {
        setIsSyncing(true);
        toast.info("Syncing users from Auth (V3)...");
        try {
            const res = await syncUsersAdminV3();
            if (res.success) {
                toast.success(res.message);
                fetchUsers(); // Refresh list
            } else {
                toast.error(res.error || "Sync failed");
            }
        } catch {
            toast.error("Sync failed");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        setUpdatingId(userId);
        const result = await updateUserRoleAdmin(userId, newRole);

        if (!result.success) {
            toast.error(result.error || "Failed to update role");
        } else {
            toast.success("User role updated");
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        }
        setUpdatingId(null);
    };

    const filteredUsers = users.filter(u =>
        (u.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (u.email?.toLowerCase() || '').includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 md:space-y-8 pb-20">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Users</h1>
                    <p className="text-white/40 text-xs md:text-sm mt-0.5">Manage user profiles and access roles.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 rounded-full px-3.5 py-1.5 md:px-4 md:py-2 flex items-center gap-2 transition-all disabled:opacity-50 text-xs md:text-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 md:w-4 md:h-4 text-white/50 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span className="text-white font-bold">Sync DB</span>
                    </button>
                    <div className="bg-[#0F0F16] border border-white/5 rounded-full px-3.5 py-1.5 md:px-4 md:py-2 flex items-center gap-2 text-xs md:text-sm">
                        <Users className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/50" />
                        <span className="text-white font-bold">{users.length} Total</span>
                    </div>
                </div>
            </header>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/30" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="w-full bg-[#0F0F16] border border-white/5 rounded-2xl pl-11 md:pl-12 pr-10 py-3 md:py-4 text-sm md:text-base text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-all"
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center text-white/30 bg-[#0F0F16] border border-white/5 rounded-2xl">
                    No users found matching &quot;{search}&quot;
                </div>
            ) : (
                <>
                    {/* MOBILE CARDS VIEW (< md) - ZERO CLIPPING, TOUCH-FRIENDLY */}
                    <div className="md:hidden space-y-3">
                        {filteredUsers.map((user) => {
                            const avatar = user.avatar_url || user.avatar;
                            const isAdmin = user.role === 'admin';
                            return (
                                <div
                                    key={user.id}
                                    className="bg-[#0F0F16] border border-white/5 rounded-2xl p-4 transition-all shadow-sm"
                                >
                                    {/* Top Row: Avatar + Name/Email + Role Badge */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                                                {avatar ? (
                                                    <Image src={avatar} alt={user.name || 'User'} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                                ) : (
                                                    <span className="text-sm font-bold text-white/70">
                                                        {(user.name || user.email || '?').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-bold text-white text-sm truncate">{user.name || 'Unknown'}</p>
                                                    {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                                </div>
                                                <p className="text-xs text-white/40 font-mono truncate">{user.email || 'No Email'}</p>
                                            </div>
                                        </div>

                                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                            isAdmin
                                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                                                : 'bg-white/5 border-white/10 text-white/50'
                                        }`}>
                                            {user.role || 'user'}
                                        </span>
                                    </div>

                                    {/* Bottom Row: Role Label + Action Button */}
                                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                                        <span className="text-[11px] text-white/30 font-medium">
                                            {isAdmin ? 'Administrator' : 'Standard Member'}
                                        </span>

                                        {isAdmin ? (
                                            <button
                                                onClick={() => handleRoleUpdate(user.id, 'user')}
                                                disabled={updatingId === user.id}
                                                className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 text-red-400 border border-red-500/20 transition-all text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                                            >
                                                {updatingId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Demote to User'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRoleUpdate(user.id, 'admin')}
                                                disabled={updatingId === user.id}
                                                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-400 border border-emerald-500/20 transition-all text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                                            >
                                                {updatingId === user.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                                                    <>
                                                        <Shield className="w-3.5 h-3.5" />
                                                        <span>Make Admin</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* DESKTOP TABLE VIEW (md+) - OVERFLOW PROTECTED */}
                    <div className="hidden md:block bg-[#0F0F16] border border-white/5 rounded-3xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-widest">User</th>
                                        <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-widest">Email</th>
                                        <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-widest">Role</th>
                                        <th className="px-6 py-4 text-xs font-bold text-white/50 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map((user) => {
                                        const avatar = user.avatar_url || user.avatar;
                                        const isAdmin = user.role === 'admin';
                                        return (
                                            <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                                                        {avatar ? (
                                                            <Image src={avatar} alt={user.name || 'User'} width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                                        ) : (
                                                            <span className="text-xs font-bold text-white/60">
                                                                {(user.name || '?').charAt(0).toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="font-bold text-white truncate text-base">{user.name || 'Unknown'}</p>
                                                            {isAdmin && <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />}
                                                        </div>
                                                        <p className="text-xs text-white/30 font-mono truncate">{user.id}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-white/60 text-sm">
                                                    {user.email || 'No Email Public'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${isAdmin ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-white/5 border-white/10 text-white/40'}`}>
                                                        {user.role || 'user'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {isAdmin ? (
                                                            <button
                                                                onClick={() => handleRoleUpdate(user.id, 'user')}
                                                                disabled={updatingId === user.id}
                                                                className="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all text-xs font-bold"
                                                            >
                                                                {updatingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Demote'}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleRoleUpdate(user.id, 'admin')}
                                                                disabled={updatingId === user.id}
                                                                className="px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white transition-all text-xs font-bold flex items-center gap-2 ml-auto"
                                                            >
                                                                {updatingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Shield className="w-3 h-3" /> Make Admin</>}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
