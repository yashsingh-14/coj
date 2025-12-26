import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://coj.org.in'

    // Fetch all songs
    const { data: songs } = await supabase
        .from('songs')
        .select('id, updated_at')

    const songUrls = (songs || []).map((song) => ({
        url: `${baseUrl}/songs/${song.id}`,
        lastModified: new Date(song.updated_at || new Date()),
    }))

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/songs`,
            lastModified: new Date(),
        },
        ...songUrls,
    ]
}
