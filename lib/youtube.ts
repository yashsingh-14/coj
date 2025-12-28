import { supabase } from '@/lib/supabaseClient';

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    publishedAt: string;
    isLive: boolean;
}

const DEFAULT_CHANNEL_ID = 'UCU65-FwxF6QkrOmZVsxTrWQ';
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export async function fetchSermons(): Promise<YouTubeVideo[]> {
    if (!API_KEY) {
        return [];
    }

    // Fetch Config from DB
    let channelId = DEFAULT_CHANNEL_ID;
    try {
        const { data } = await supabase.from('site_settings').select('value').eq('key', 'youtube_config').single();
        if (data && data.value && data.value.channelId) {
            channelId = data.value.channelId;
        }
    } catch (err) {
        console.error("Error fetching YouTube config", err);
    }

    try {
        // Step 1: Get Uploads Playlist ID (Cost: 1 unit)
        // Step 1: Get Uploads Playlist ID (Cost: 1 unit)
        // Check if input is a Handle or ID
        const isHandle = channelId.startsWith('@');
        const param = isHandle ? `forHandle=${channelId}` : `id=${channelId}`;

        const channelRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?key=${API_KEY}&${param}&part=contentDetails`
        );
        const channelData = await channelRes.json();

        if (!channelData.items || channelData.items.length === 0) {
            console.error('Channel not found');
            return [];
        }

        const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

        // Step 2: Fetch Videos from Uploads Playlist (Cost: 1 unit)
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=12`
        );

        const data = await response.json();

        if (data.error) {
            console.error('YouTube API Error:', data.error);
            return [];
        }

        if (!data.items || data.items.length === 0) {
            return [];
        }

        return data.items.map((item: any) => ({
            id: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            isLive: false // Playlist items don't explicitly show live status usually, but this is fine for cost saving
        }));
    } catch (error) {
        console.error('Failed to fetch sermons:', error);
        return [];
    }
}
