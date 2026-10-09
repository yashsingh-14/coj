export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    publishedAt: string;
    isLive: boolean;
}

export interface LiveStream {
    videoId: string;
    title: string;
    isLive: boolean;
}

export interface SermonsResponse {
    videos: YouTubeVideo[];
    liveStream: LiveStream | null;
    isLive: boolean;
}

export async function fetchSermons(forceRefresh = false): Promise<SermonsResponse> {
    try {
        const url = forceRefresh ? `/api/sermons?refresh=true&_t=${Date.now()}` : `/api/sermons?_t=${Date.now()}`;
        const res = await fetch(url, {
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`API returned ${res.status}`);
        }

        const json = await res.json();
        return {
            videos: json.videos || [],
            liveStream: json.liveStream || null,
            isLive: json.isLive || false
        };
    } catch (error) {
        console.error('Failed to fetch sermons:', error);
        return { videos: [], liveStream: null, isLive: false };
    }
}
