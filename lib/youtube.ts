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

const MOCK_SERMONS: YouTubeVideo[] = [
    {
        id: 'mock1',
        title: 'The Power of Prayer | Sunday Service',
        description: 'Join us for a powerful message on the importance of prayer in our daily lives.',
        thumbnail: 'https://i.ytimg.com/vi/placeholder1/maxresdefault.jpg', // Will use fallback in UI or legitimate placeholder
        publishedAt: 'Oct 15, 2024',
        isLive: false
    },
    {
        id: 'mock2',
        title: 'Walking in Faith - Live Worship',
        description: 'Live worship session from Call of Jesus Ministries.',
        thumbnail: 'https://i.ytimg.com/vi/placeholder2/maxresdefault.jpg',
        publishedAt: 'Oct 12, 2024',
        isLive: true
    },
    {
        id: 'mock3',
        title: 'Understanding God\'s Grace',
        description: 'Pastor explores the depth of grace.',
        thumbnail: 'https://i.ytimg.com/vi/placeholder3/maxresdefault.jpg',
        publishedAt: 'Oct 05, 2024',
        isLive: false
    }
];

// Better placeholder images
const PLACEHOLDERS = [
    'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80',
    'https://images.unsplash.com/photo-1507692049790-de58293a4697?w=800&q=80',
    'https://images.unsplash.com/photo-1445445290350-16a3fa8cdb6e?w=800&q=80'
];

export async function fetchSermons(): Promise<YouTubeVideo[]> {
    // Return mock data if no key (Dev mode fallback)
    if (!API_KEY) {
        console.warn('YouTube API Key missing. Using Mock Data.');
        return MOCK_SERMONS.map((s, i) => ({ ...s, thumbnail: PLACEHOLDERS[i % PLACEHOLDERS.length] }));
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
            // Fallback to Mock on API Error
            return MOCK_SERMONS.map((s, i) => ({ ...s, thumbnail: PLACEHOLDERS[i % PLACEHOLDERS.length] }));
        }

        if (!data.items || data.items.length === 0) {
            return MOCK_SERMONS.map((s, i) => ({ ...s, thumbnail: PLACEHOLDERS[i % PLACEHOLDERS.length] }));
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
        // Fallback to Mock on Network Error
        return MOCK_SERMONS.map((s, i) => ({ ...s, thumbnail: PLACEHOLDERS[i % PLACEHOLDERS.length] }));
    }
}
