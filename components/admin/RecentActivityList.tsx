'use client';

import { supabase } from '@/lib/supabaseClient';
import { Music, Calendar, User, Sparkles, Megaphone, RefreshCw, ExternalLink } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

type ActivityType = 'song' | 'set' | 'user' | 'event' | 'announcement';

export type ActivityItem = {
    id: string;
    type: ActivityType;
    title: string;
    date: string;
    details: string;
    link?: string;
};

function formatTimeAgo(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return 'Recently';
    }
}

export default function RecentActivityList() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchActivity = useCallback(async (isManual = false) => {
        if (isManual) setIsRefreshing(true);
        try {
            // 1. Fetch persistent audit log from site_settings
            const auditPromise = supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'admin_recent_activities')
                .maybeSingle();

            // 2. Fetch recent records across all main entities in parallel
            const songsPromise = supabase
                .from('songs')
                .select('id, title, created_at')
                .order('created_at', { ascending: false })
                .limit(10);

            const profilesPromise = supabase
                .from('profiles')
                .select('id, name, created_at')
                .order('created_at', { ascending: false })
                .limit(10);

            const setsPromise = supabase
                .from('sets')
                .select('id, title, created_at')
                .order('created_at', { ascending: false })
                .limit(6);

            const eventsPromise = supabase
                .from('events')
                .select('id, title, created_at')
                .order('created_at', { ascending: false })
                .limit(6);

            const announcementsPromise = supabase
                .from('announcements')
                .select('id, title, created_at')
                .order('created_at', { ascending: false })
                .limit(6);

            const [
                { data: auditData },
                { data: songs },
                { data: users },
                { data: sets },
                { data: events },
                { data: announcements }
            ] = await Promise.all([
                auditPromise,
                songsPromise,
                profilesPromise,
                setsPromise,
                eventsPromise,
                announcementsPromise
            ]);

            // Parse explicit audit log
            const auditList: ActivityItem[] = Array.isArray(auditData?.value) ? auditData.value : [];

            // Convert DB rows to activity items
            const dbActivities: ActivityItem[] = [
                ...(songs?.map(s => ({
                    id: s.id,
                    type: 'song' as const,
                    title: s.title,
                    date: s.created_at,
                    details: 'Song Added / Updated',
                    link: `/admin/songs/${s.id}`
                })) || []),
                ...(users?.map(u => ({
                    id: u.id,
                    type: 'user' as const,
                    title: u.name || 'Member',
                    date: u.created_at,
                    details: 'New User Joined',
                    link: '/admin/users'
                })) || []),
                ...(sets?.map(st => ({
                    id: st.id,
                    type: 'set' as const,
                    title: st.title,
                    date: st.created_at,
                    details: 'Setlist Created',
                    link: `/sets/${st.id}`
                })) || []),
                ...(events?.map(ev => ({
                    id: ev.id,
                    type: 'event' as const,
                    title: ev.title,
                    date: ev.created_at,
                    details: 'Event Created',
                    link: `/admin/events/${ev.id}`
                })) || []),
                ...(announcements?.map(an => ({
                    id: an.id,
                    type: 'announcement' as const,
                    title: an.title,
                    date: an.created_at,
                    details: 'Announcement Posted',
                    link: '/admin/content'
                })) || [])
            ];

            // Merge & deduplicate by title/type
            const combinedMap = new Map<string, ActivityItem>();

            // Prioritize audit logs first (they have exact details like "Song Updated")
            auditList.forEach(item => {
                if (item?.title) {
                    const key = `${item.type}:${item.title.toLowerCase().trim()}`;
                    combinedMap.set(key, item);
                }
            });

            // Fill with DB rows if not already present
            dbActivities.forEach(item => {
                if (item?.title) {
                    const key = `${item.type}:${item.title.toLowerCase().trim()}`;
                    if (!combinedMap.has(key)) {
                        combinedMap.set(key, item);
                    }
                }
            });

            const merged = Array.from(combinedMap.values())
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 8); // Top 8 recent actions

            setActivities(merged);
        } catch (error) {
            console.error('Activity fetch error:', error);
        } finally {
            setIsLoading(false);
            if (isManual) setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchActivity();
        // Auto-refresh every 20 seconds so newly added songs show up live
        const interval = setInterval(() => {
            fetchActivity();
        }, 20000);
        return () => clearInterval(interval);
    }, [fetchActivity]);

    const getIcon = (type: ActivityType) => {
        switch (type) {
            case 'song':
                return <Music className="w-4 h-4 text-amber-400" />;
            case 'user':
                return <User className="w-4 h-4 text-purple-400" />;
            case 'set':
                return <Calendar className="w-4 h-4 text-blue-400" />;
            case 'event':
                return <Sparkles className="w-4 h-4 text-emerald-400" />;
            case 'announcement':
                return <Megaphone className="w-4 h-4 text-rose-400" />;
            default:
                return <Sparkles className="w-4 h-4 text-amber-400" />;
        }
    };

    const getBadgeStyle = (type: ActivityType) => {
        switch (type) {
            case 'song':
                return 'bg-amber-500/10 border-amber-500/20';
            case 'user':
                return 'bg-purple-500/10 border-purple-500/20';
            case 'set':
                return 'bg-blue-500/10 border-blue-500/20';
            case 'event':
                return 'bg-emerald-500/10 border-emerald-500/20';
            case 'announcement':
                return 'bg-rose-500/10 border-rose-500/20';
            default:
                return 'bg-white/5 border-white/10';
        }
    };

    return (
        <div className="space-y-3">
            {/* Header controls */}
            <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                    Live Feed • Auto Syncing
                </span>
                <button
                    onClick={() => fetchActivity(true)}
                    disabled={isRefreshing}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-white/50 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-40"
                    title="Refresh Activity"
                >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
                    <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : activities.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-white/5 border border-white/5 text-white/30 text-sm">
                    No recent activity found.
                </div>
            ) : (
                <div className="space-y-2">
                    {activities.map((item) => {
                        const content = (
                            <div className="group flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 transition-all">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className={`p-2.5 rounded-xl border shrink-0 ${getBadgeStyle(item.type)}`}>
                                        {getIcon(item.type)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                                            {item.title}
                                        </div>
                                        <div className="text-[11px] text-white/40 flex items-center gap-2 mt-0.5">
                                            <span className="font-medium text-white/60">{item.details}</span>
                                            <span>•</span>
                                            <span className="text-amber-400/80 font-medium">{formatTimeAgo(item.date)}</span>
                                        </div>
                                    </div>
                                </div>

                                {item.link && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity pl-2 text-white/40 group-hover:text-white shrink-0">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </div>
                                )}
                            </div>
                        );

                        if (item.link) {
                            return (
                                <Link key={`${item.type}-${item.id}`} href={item.link} className="block">
                                    {content}
                                </Link>
                            );
                        }

                        return <div key={`${item.type}-${item.id}`}>{content}</div>;
                    })}
                </div>
            )}
        </div>
    );
}
