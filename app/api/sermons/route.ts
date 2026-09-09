import { NextResponse } from 'next/server';

interface CachedData {
    data: any[];
    timestamp: number;
}

// In-memory cache with 5 minute TTL
let cache: CachedData | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const DEFAULT_CHANNEL_ID = 'UCU65-FwxF6QkrOmZVsxTrWQ';
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

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
        const videos = await fetchYouTubeData();
        return NextResponse.json(
            { videos },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
                },
            }
        );
    } catch (error: any) {
        console.error('Sermons API error:', error);
        return NextResponse.json(
            { videos: [], error: error.message || 'Failed to fetch sermons' },
            { status: 500 }
        );
    }
}
