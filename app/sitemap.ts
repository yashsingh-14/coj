import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://coj-puce.vercel.app',
            lastModified: new Date(),
        },
        {
            url: 'https://coj-puce.vercel.app/songs',
            lastModified: new Date(),
        },
    ]
}
