import { supabase } from '@/lib/supabaseClient';
import { Music, Calendar, User } from 'lucide-react';
import { useEffect, useState } from 'react';

type ActivityItem = {
    id: string;
    type: 'song' | 'set' | 'user';
    title: string; // or name for user
    date: string;
    details?: string;
};

export default function RecentActivityList() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                // Fetch recent songs
                const { data: songs } = await supabase
                    .from('songs')
                    .select('id, title, created_at')
                    .order('created_at', { ascending: false })
                    .limit(3);

                // Fetch recent sets
                const { data: sets } = await supabase
                    .from('sets')
                    .select('id, title, created_at')
                    .order('created_at', { ascending: false })
                    .limit(3);

                // Fetch recent users
                const { data: users } = await supabase
                    .from('profiles')
                    .select('id, name, created_at') // Assuming profiles has created_at
                    .order('created_at', { ascending: false })
                    .limit(3);

                const mixedActivities: ActivityItem[] = [
                    ...(songs?.map(s => ({ id: s.id, type: 'song' as const, title: s.title, date: s.created_at, details: 'New Song' })) || []),
                    ...(sets?.map(s => ({ id: s.id, type: 'set' as const, title: s.title, date: s.created_at, details: 'New Set' })) || []),
                    ...(users?.map(u => ({ id: u.id, type: 'user' as const, title: u.name, date: u.created_at, details: 'New User' })) || [])
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5); // Show top 5 recent actions across all types

                setActivities(mixedActivities);
            } catch (error) {
                console.error("Activity fetch error (silent)", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivity();
    }, []);

    if (isLoading) return <div className="text-white/20 text-sm animate-pulse">Loading activity...</div>;
    if (activities.length === 0) return <div className="text-white/20 text-sm">No recent activity.</div>;

    return (
        <div className="space-y-4">
            {activities.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className={`p-2 rounded-lg ${item.type === 'song' ? 'bg-amber-500/10 text-amber-500' :
                            item.type === 'set' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-purple-500/10 text-purple-500'
                        }`}>
                        {item.type === 'song' ? <Music className="w-4 h-4" /> :
                            item.type === 'set' ? <Calendar className="w-4 h-4" /> :
                                <User className="w-4 h-4" />}
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">{item.title}</div>
                        <div className="text-xs text-white/40 flex items-center gap-2">
                            <span>{item.details}</span>
                            <span>•</span>
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
