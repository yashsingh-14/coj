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
        console.warn('YouTube API Key is missing. Please add NEXT_PUBLIC_YOUTUBE_API_KEY to your .env.local file.');
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
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12&type=video`
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
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            isLive: item.snippet.liveBroadcastContent === 'live'
        }));
    } catch (error) {
        console.error('Failed to fetch sermons:', error);
        return [];
    }
}
