export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    publishedAt: string;
    isLive: boolean;
}

export async function fetchSermons(): Promise<YouTubeVideo[]> {
    try {
        const res = await fetch('/api/sermons', {
            next: { revalidate: 300 },
        });

        if (!res.ok) {
            throw new Error(`API returned ${res.status}`);
        }

        const json = await res.json();
        return json.videos || [];
    } catch (error) {
        console.error('Failed to fetch sermons:', error);
        return [];
    }
}
