import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/'], // Protect admin and api routes from crawling
        },
        sitemap: 'https://cojworship.vercel.app/sitemap.xml',
    };
}
