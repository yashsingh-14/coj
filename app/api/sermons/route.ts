import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface CachedData {
    data: any[];
    timestamp: number;
}

// In-memory cache with 5 minute TTL
let cache: CachedData | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const DEFAULT_CHANNEL_ID = 'UCU65-FwxF6QkrOmZVsxTrWQ';
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

// Server-side supabase for reading site_settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServerClient = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } })
    : null;

async function getLiveConfig() {
    if (!supabaseServerClient) return null;
    try {
        const { data } = await supabaseServerClient
            .from('site_settings')
            .select('value')
            .eq('key', 'youtube_config')
            .single();
        return data?.value || null;
    } catch {
        return null;
    }
}

async function fetchYouTubeData() {
    if (!API_KEY) {
        return [];
    }

    // Check cache first
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
        return cache.data;
    }

    try {
        const channelId = DEFAULT_CHANNEL_ID;

        // Step 1: Get uploads playlist ID
        const isHandle = channelId.startsWith('@');
        const param = isHandle ? `forHandle=${channelId}` : `id=${channelId}`;

        const channelRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&${param}&part=contentDetails`,
            { signal: AbortSignal.timeout(8000) }
        );
        const channelData = await channelRes.json();

        if (!channelData.items || channelData.items.length === 0) {
            console.error('YouTube channel not found');
            return cache?.data || [];
        }

        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

        // Step 2: Fetch videos from uploads playlist
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=15`,
            { signal: AbortSignal.timeout(8000) }
        );

        const data = await response.json();

        if (data.error) {
            console.error('YouTube API Error:', data.error);
            return cache?.data || [];
        }

        if (!data.items || data.items.length === 0) {
            return [];
        }

        const videos = data.items.map((item: any) => ({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
            publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            isLive: false
        }));

        // Update cache
        cache = { data: videos, timestamp: Date.now() };

        return videos;
    } catch (error) {
        console.error('YouTube API fetch error:', error);
        // Return stale cache if available
        return cache?.data || [];
    }
}

export async function GET() {
    try {
        const [videos, liveConfig] = await Promise.all([
            fetchYouTubeData(),
            getLiveConfig()
        ]);

        // Build live stream info from admin config
        let liveStream = null;
        if (liveConfig?.isLiveOverride && liveConfig?.liveVideoId) {
            liveStream = {
                videoId: liveConfig.liveVideoId,
                title: liveConfig.liveTitle || 'Live Sermon',
                isLive: true
            };

            // Mark the matching video as live if it exists in the list
            for (const v of videos) {
                if (v.id === liveConfig.liveVideoId) {
                    v.isLive = true;
                }
            }
        }

        return NextResponse.json(
            {
                videos,
                liveStream,
                isLive: liveConfig?.isLiveOverride || false
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
                },
            }
        );
    } catch (error: any) {
        console.error('Sermons API error:', error);
        return NextResponse.json(
            { videos: [], liveStream: null, isLive: false, error: error.message || 'Failed to fetch sermons' },
            { status: 500 }
        );
    }
}
