import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { SongViewerSkeleton } from '@/components/ui/SkeletonLoader';
import { generateSlug, SITE_URL } from '@/lib/seoUtils';
import { fetchSongBySlug } from '@/lib/fetchSong';
import { supabaseServer } from '@/lib/supabaseServer';

const SongViewer = dynamic(() => import('@/components/songs/SongViewer'), {
    loading: () => <SongViewerSkeleton />,
});

// Revalidate every 60 seconds
export const revalidate = 60;

// ─── METADATA ───────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const song = await fetchSongBySlug(slug);

    if (!song) {
        return { title: 'Song Not Found | COJ Worship' };
    }

    const isHindi = song.category === 'hindi';
    const songSlug = generateSlug(song.title);
    const canonicalUrl = `${SITE_URL}/songs/${songSlug}`;

    const title = `${song.title} Lyrics & Chords${song.artist ? ` - ${song.artist}` : ''} | COJ Worship`;
    const description = isHindi
        ? `${song.title} - Hindi Christian worship song lyrics with guitar chords. Artist: ${song.artist || 'Unknown'}. Key: ${song.key || 'N/A'}. Free chords for church worship and praise.`
        : `${song.title} worship song lyrics with guitar chords, key (${song.key || 'N/A'}), and song structure. Artist: ${song.artist || 'Unknown'}. Free for church worship leaders.`;

    return {
        title,
        description,
        keywords: [
            song.title,
            `${song.title} lyrics`,
            `${song.title} chords`,
            `${song.title} guitar chords`,
            song.artist,
            "Christian worship",
            isHindi ? "Hindi Christian Song" : "English Christian Song",
            "worship lyrics and chords",
            "church worship songs",
            `${song.title} ${isHindi ? 'hindi' : 'english'} worship`
        ].filter(Boolean),
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: 'article' as const,
            title,
            description,
            url: canonicalUrl,
            siteName: 'COJ Worship',
            images: song.img ? [{ url: song.img, alt: `${song.title} - Worship Song` }] : [{ url: '/images/logo-main.png', alt: 'COJ Worship' }],
        },
        twitter: {
            card: 'summary' as const,
            title: `${song.title} - Lyrics & Chords`,
            description,
        },
    };
}

// ─── PAGE COMPONENT ─────────────────────────────────────────
export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    // Uses React cache() → same request as generateMetadata, NO extra DB call
    const song = await fetchSongBySlug(slug);

    if (!song) {
        notFound();
    }

    // Fetch Related Songs
    const { data: relatedSongsData } = await supabaseServer
        .from('songs')
        .select('id, title, artist, category')
        .eq('category', song.category)
        .neq('id', song.id)
        .limit(3);

    const relatedSongs = (relatedSongsData || []).map((s: any) => ({
        title: s.title,
        slug: generateSlug(s.title),
        artist: s.artist,
    }));

    const songCanonicalUrl = `${SITE_URL}/songs/${generateSlug(song.title)}`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'MusicComposition',
        name: song.title,
        url: songCanonicalUrl,
        composer: {
            '@type': 'Person',
            name: song.artist || 'Unknown',
        },
        publisher: {
            '@type': 'Organization',
            name: 'COJ Worship - Call of Jesus Ministries',
            url: SITE_URL,
        },
        inLanguage: song.category === 'hindi' ? 'hi' : 'en',
        musicalKey: song.key,
        genre: 'Christian Worship',
        ...(song.tempo && { tempo: { '@type': 'QuantitativeValue', value: song.tempo, unitText: 'BPM' } }),
        ...(song.lyrics && { lyrics: { '@type': 'CreativeWork', text: song.lyrics.substring(0, 500) + '...' } }),
    };

    return (
        <>
            {/* Inline <script> for JSON-LD — rendered in initial HTML so Google can see it */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <SongViewer
                songId={song.id}
                title={song.title}
                author={song.artist}
                originalKey={song.key || "C"}
                tempo={song.tempo}
                lyrics={song.lyrics}
                hindiLyrics={song.hindi_lyrics}
                chords={song.chords}
                youtubeId={song.youtube_id}
                category={song.category}
                relatedSongs={relatedSongs}
            />
        </>
    );
}
