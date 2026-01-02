'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, Search, Shield, ShieldAlert, Loader2, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { syncUsersAdmin } from '@/app/actions/admin';

export default function AdminUsersPage() {
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
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('name', { ascending: true });

        if (data) setUsers(data);
        setIsLoading(false);
    };

    const handleSync = async () => {
        setIsSyncing(true);
        toast.info("Syncing users from Auth...");
        try {
            const res = await syncUsersAdmin();
            if (res.success) {
                toast.success(res.message);
                fetchUsers(); // Refresh list
            } else {
                toast.error(res.error || "Sync failed");
            }
        } catch (e) {
            toast.error("Sync failed");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        setUpdatingId(userId);
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            toast.error("Failed to update role");
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
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">Users</h1>
                    <p className="text-white/40 text-sm">Manage user profiles and access roles.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-full px-4 py-2 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-white/50 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span className="text-white font-bold text-sm">Sync DB</span>
                    </button>
                    <div className="bg-[#0F0F16] border border-white/5 rounded-full px-4 py-2 flex items-center gap-2 w-fit">
                        <Users className="w-4 h-4 md:w-5 md:h-5 text-white/50" />
                        <span className="text-white font-bold text-sm">{users.length} Total</span>
                    </div>
                </div>
            </header>

            <div className="flex gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..."
                        className="w-full bg-[#0F0F16] border border-white/5 rounded-2xl pl-12 pr-4 py-3 md:py-4 text-white focus:outline-none focus:border-white/20 transition-all"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
            ) : (
                <div className="bg-[#0F0F16] border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr>
                                <th className="px-4 py-3 md:px-6 md:py-4 text-xs font-bold text-white/50 uppercase tracking-widest">User</th>
                                <th className="px-4 py-3 md:px-6 md:py-4 text-xs font-bold text-white/50 uppercase tracking-widest hidden md:table-cell">Email</th>
                                <th className="px-4 py-3 md:px-6 md:py-4 text-xs font-bold text-white/50 uppercase tracking-widest">Role</th>
                                <th className="px-4 py-3 md:px-6 md:py-4 text-xs font-bold text-white/50 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-4 py-3 md:px-6 md:py-4 flex items-center gap-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-bold text-white/60">
                                                    {(user.name || '?').charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-white truncate text-sm md:text-base">{user.name || 'Unknown'}</p>
                                            <p className="text-xs text-white/30 font-mono truncate md:hidden max-w-[100px]">{user.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 text-white/60 text-sm hidden md:table-cell">
                                        {user.email || 'No Email Public'}
                                    </td>
                                    <td className="px-4 py-3 md:px-6 md:py-4">
                                        <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border ${user.role === 'admin' ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-white/5 border-white/10 text-white/40'}`}>
                                            {user.role || 'user'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 md:px-6 md:py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {user.role === 'admin' ? (
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
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div className="p-12 text-center text-white/30">
                            No users found matching "{search}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
