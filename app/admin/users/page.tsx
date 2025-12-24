'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trash2, Search, User, ShieldAlert, BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';

type Profile = {
    id: string;
    email: string; // If exposed directly or via view
    name: string;
    avatar_url: string | null;
    role: string;
    created_at: string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this user profile? This action cannot be undone.")) return;

        try {
            const { error } = await supabase.from('profiles').delete().eq('id', userId);
            if (error) throw error;

            toast.success("User profile removed");
            fetchUsers(); // Refresh list
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        // Note: Email might not be in profiles depending on schema, but searching name is good start
        user.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <header className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2">Users</h1>
                    <p className="text-white/40">Manage community members and roles.</p>
                </div>
                <div className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-lg text-sm font-bold">
                    {users.length} Total Users
                </div>
            </header>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-white/30" />
                <input
                    type="text"
                    placeholder="Search users by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
            </div>

            {/* Users List */}
            <div className="bg-[#0F0F16] border border-white/5 rounded-3xl overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-white/30">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-12 text-center text-white/30">No users found.</div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredUsers.map((user) => (
                            <div key={user.id} className="p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-6 h-6 text-white/50" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white text-lg">{user.name || 'Anonymous'}</h3>
                                            {user.role === 'admin' && (
                                                <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider rounded">Admin</span>
                                            )}
                                        </div>
                                        <p className="text-white/40 text-sm font-mono mt-0.5">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="p-3 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                    title="Remove User"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
