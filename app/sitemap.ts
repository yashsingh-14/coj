import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://cojworship.vercel.app'

    // Fetch all songs

    const { data: songs, error } = await supabase
        .from('songs')
        .select('id, updated_at')

    if (error) {
        console.error("Sitemap Supabase Error:", error);
    }
    console.log(`Sitemap: Found ${songs?.length || 0} songs.`);

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
