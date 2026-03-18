import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { generateSlug, SITE_URL } from '@/lib/seoUtils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch all songs with title for slug generation
    const { data: songs, error } = await supabase
        .from('songs')
        .select('id, title, updated_at')

    if (error) {
        console.error("Sitemap Supabase Error:", error);
    }

    const songUrls = (songs || []).map((song) => ({
        url: `${SITE_URL}/songs/${generateSlug(song.title)}`,
        lastModified: new Date(song.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    return [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${SITE_URL}/songs`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/search`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/favourites`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
        ...songUrls,
    ]
}
