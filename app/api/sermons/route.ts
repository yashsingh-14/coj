import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface CachedData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    timestamp: number;
}

interface LiveCheckCache {
    liveStream: {
        videoId: string;
        title: string;
        isLive: boolean;
    } | null;
    timestamp: number;
}

// In-memory cache
let videoCache: CachedData | null = null;
const VIDEO_CACHE_TTL = 60 * 1000; // 1 minute for videos

let liveCheckCache: LiveCheckCache | null = null;
const LIVE_CHECK_CACHE_TTL = 30 * 1000; // 30 seconds for live detection

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

/**
 * Auto-detect if the channel is currently broadcasting live on YouTube.
 * Fetches the canonical /live endpoint with 0 API quota usage.
 */
async function detectYouTubeLive(channelId: string, forceRefresh = false) {
    if (!forceRefresh && liveCheckCache && Date.now() - liveCheckCache.timestamp < LIVE_CHECK_CACHE_TTL) {
        return liveCheckCache.liveStream;
    }

    try {
        const url = `https://www.youtube.com/channel/${channelId}/live`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(5000),
            cache: 'no-store'
        });

        const text = await res.text();
        const canonical = text.match(/<link rel="canonical" href="(.*?)">/);
        const isLive = text.includes('"isLive":true') || text.includes('"isLiveStream":true') || text.includes('"isLiveNow":true');

        let result = null;
        if (isLive && canonical && canonical[1]?.includes('watch?v=')) {
            const videoId = canonical[1].split('watch?v=')[1]?.split('&')[0];
            const titleMatch = text.match(/"videoDetails":\{"videoId":"[^"]+","title":"([^"]+)"/);
            const title = titleMatch ? titleMatch[1] : 'Live Worship & Sermon';
            if (videoId) {
                result = {
                    videoId,
                    title,
                    isLive: true
                };
            }
        }

        liveCheckCache = { liveStream: result, timestamp: Date.now() };
        return result;
    } catch (e) {
        console.error('Error auto-detecting YouTube live status:', e);
        return liveCheckCache?.liveStream || null;
    }
}

async function fetchYouTubeData(channelId: string, forceRefresh = false) {
    if (!API_KEY) {
        return [];
    }

    // Check cache first
    if (!forceRefresh && videoCache && Date.now() - videoCache.timestamp < VIDEO_CACHE_TTL) {
        return videoCache.data;
    }

    try {
        const isHandle = channelId.startsWith('@');
        const param = isHandle ? `forHandle=${channelId}` : `id=${channelId}`;

        const channelRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&${param}&part=contentDetails`,
            { signal: AbortSignal.timeout(8000), cache: 'no-store' }
        );
        const channelData = await channelRes.json();

        if (!channelData.items || channelData.items.length === 0) {
            console.error('YouTube channel not found');
            return videoCache?.data || [];
        }

        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

        // Step 2: Fetch videos from uploads playlist
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=15`,
            { signal: AbortSignal.timeout(8000), cache: 'no-store' }
        );

        const data = await response.json();

        if (data.error) {
            console.error('YouTube API Error:', data.error);
            return videoCache?.data || [];
        }

        if (!data.items || data.items.length === 0) {
            return [];
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        videoCache = { data: videos, timestamp: Date.now() };

        return videos;
    } catch (error) {
        console.error('YouTube API fetch error:', error);
        return videoCache?.data || [];
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const forceRefresh = url.searchParams.get('refresh') === 'true';

        const liveConfig = await getLiveConfig();
        const channelId = liveConfig?.channelId || DEFAULT_CHANNEL_ID;

        const [videos, autoDetectedLive] = await Promise.all([
            fetchYouTubeData(channelId, forceRefresh),
            liveConfig?.isLiveOverride && liveConfig?.liveVideoId
                ? Promise.resolve({
                    videoId: liveConfig.liveVideoId,
                    title: liveConfig.liveTitle || 'Live Sermon',
                    isLive: true
                })
                : detectYouTubeLive(channelId, forceRefresh)
        ]);

        const isLive = !!autoDetectedLive?.isLive;
        const liveStream = autoDetectedLive || null;

        // Mark matching video as live if present in recent videos
        if (liveStream) {
            for (const v of videos) {
                if (v.id === liveStream.videoId) {
                    v.isLive = true;
                }
            }
        }

        return NextResponse.json(
            {
                videos,
                liveStream,
                isLive
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Pragma': 'no-cache'
                },
            }
        );
    } catch (error: unknown) {
        console.error('Sermons API error:', error);
        return NextResponse.json(
            { videos: [], liveStream: null, isLive: false, error: (error instanceof Error ? error.message : "Unknown error") || 'Failed to fetch sermons' },
            { status: 500 }
        );
    }
}
