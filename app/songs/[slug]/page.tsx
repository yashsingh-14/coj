import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { SongViewerSkeleton } from '@/components/ui/SkeletonLoader';
import { generateSlug, SITE_URL } from '@/lib/seoUtils';
import { fetchSongBySlug } from '@/lib/fetchSong';
import { supabaseServer } from '@/lib/supabaseServer';
import { getSongImage } from '@/lib/utils';

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

    const isHindi = song.category === 'hindi' || Boolean(song.hindi_lyrics) || /[\u0900-\u097F]/.test(song.lyrics || '');
    const songSlug = generateSlug(song.title);
    const canonicalUrl = `${SITE_URL}/songs/${songSlug}`;

    // Target Exact Search Intent: "[Song Name] Song Lyrics & Chords - [Artist]"
    const artistPart = song.artist ? ` - ${song.artist}` : '';
    const title = `${song.title} Song Lyrics & Chords${artistPart} | COJ Worship`;

    // Extract first 2 clean lyric lines for maximum search snippet relevance
    const lyricLines = (song.lyrics || '')
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0 && !l.startsWith('[') && !l.startsWith('('))
        .slice(0, 2)
        .join(', ');

    const description = `Full "${song.title}" song lyrics and guitar chords${song.artist ? ` by ${song.artist}` : ''}.${lyricLines ? ` "${lyricLines}"...` : ''} Key: ${song.key || 'C'}. Includes English, Hindi lyrics, transpose tool & video on COJ Worship.`;

    const songImageUrl = getSongImage(song);

    return {
        title,
        description,
        keywords: [
            `${song.title} song lyrics`,
            `${song.title} lyrics`,
            `${song.title} chords`,
            `${song.title} guitar chords`,
            song.artist ? `${song.title} ${song.artist} lyrics` : '',
            song.artist ? `${song.artist} ${song.title}` : '',
            isHindi ? `${song.title} lyrics in hindi` : '',
            isHindi ? `${song.title} hindi christian song` : '',
            `${song.title} lyrics and chords`,
            `${song.title} worship song`,
            "Christian song lyrics",
            "worship chords",
            "COJ worship"
        ].filter(Boolean),
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: 'music.song' as any,
            title,
            description,
            url: canonicalUrl,
            siteName: 'COJ Worship',
            images: [{ url: songImageUrl, alt: `${song.title} - Worship Song Lyrics & Chords` }],
        },
        twitter: {
            card: 'summary_large_image' as const,
            title,
            description,
            images: [songImageUrl],
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

    const isHindi = song.category === 'hindi' || Boolean(song.hindi_lyrics) || /[\u0900-\u097F]/.test(song.lyrics || '');

    // Fetch Related Songs
    const { data: relatedSongsData } = await supabaseServer
        .from('songs')
        .select('id, title, artist, category')
        .eq('category', song.category)
        .neq('id', song.id)
        .limit(3);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const relatedSongs = (relatedSongsData || []).map((s: any) => ({
        title: s.title,
        slug: generateSlug(s.title),
        artist: s.artist,
    }));

    const songCanonicalUrl = `${SITE_URL}/songs/${generateSlug(song.title)}`;

    // High-Authority Schema.org Knowledge Graph (Breadcrumbs, MusicComposition, MusicRecording, FAQPage)
    const jsonLdGraph = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                '@id': `${songCanonicalUrl}#breadcrumb`,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: SITE_URL,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Worship Songs',
                        item: `${SITE_URL}/songs`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: `${song.title} Lyrics`,
                        item: songCanonicalUrl,
                    },
                ],
            },
            {
                '@type': 'MusicComposition',
                '@id': `${songCanonicalUrl}#composition`,
                name: song.title,
                alternateName: [
                    song.title,
                    `${song.title} Song`,
                    ...(song.hindi_lyrics ? [`${song.title} (Hindi Lyrics)`] : [])
                ],
                url: songCanonicalUrl,
                composer: {
                    '@type': 'MusicGroup',
                    name: song.artist || 'Christian Artist',
                },
                lyricist: {
                    '@type': 'MusicGroup',
                    name: song.artist || 'Christian Artist',
                },
                musicalKey: song.key || 'C',
                genre: ['Christian Worship', 'Gospel', 'Praise & Worship'],
                inLanguage: isHindi ? ['hi', 'hi-Latn', 'en'] : ['en'],
                ...(song.tempo && { tempo: { '@type': 'QuantitativeValue', value: song.tempo, unitText: 'BPM' } }),
                ...(song.lyrics && {
                    lyrics: {
                        '@type': 'CreativeWork',
                        text: song.lyrics,
                        inLanguage: 'en-US',
                    },
                }),
            },
            {
                '@type': 'MusicRecording',
                '@id': `${songCanonicalUrl}#recording`,
                name: song.title,
                byArtist: {
                    '@type': 'MusicGroup',
                    name: song.artist || 'Christian Artist',
                },
                inAlbum: {
                    '@type': 'MusicAlbum',
                    name: 'COJ Worship Songs',
                },
                recordingOf: { '@id': `${songCanonicalUrl}#composition` },
                url: songCanonicalUrl,
                ...(song.youtube_id && {
                    video: {
                        '@type': 'VideoObject',
                        name: `${song.title} Video - ${song.artist || 'Worship'}`,
                        description: `Watch ${song.title} with chords and lyrics`,
                        thumbnailUrl: `https://img.youtube.com/vi/${song.youtube_id}/hqdefault.jpg`,
                        embedUrl: `https://www.youtube.com/embed/${song.youtube_id}`,
                    },
                }),
            },
            {
                '@type': 'FAQPage',
                '@id': `${songCanonicalUrl}#faq`,
                mainEntity: [
                    {
                        '@type': 'Question',
                        name: `What are the lyrics of ${song.title}?`,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: `The full lyrics of "${song.title}"${song.artist ? ` by ${song.artist}` : ''} are available on Call of Jesus (COJ Worship) with both English and Hindi transliterations.`,
                        },
                    },
                    {
                        '@type': 'Question',
                        name: `Who sings and composed ${song.title}?`,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: `"${song.title}" is performed by ${song.artist || 'Christian Worship Artist'}.`,
                        },
                    },
                    {
                        '@type': 'Question',
                        name: `What is the original key for ${song.title} chords?`,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: `The original key of "${song.title}" is ${song.key || 'C'}${song.tempo ? ` at ${song.tempo} BPM` : ''}. You can transpose it to any key using the free chord transposition tool on COJ Worship.`,
                        },
                    },
                ],
            },
        ],
    };

    return (
        <>
            {/* Inline <script> for JSON-LD — rendered in initial HTML for Google knowledge graph */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
            />

            {/* Semantic Server-Side Rendered (SSR) Article for Googlebot & Search Crawlers */}
            <article className="sr-only" aria-hidden="true">
                <header>
                    <h1>{song.title} Song Lyrics &amp; Chords - {song.artist || 'Christian Worship'}</h1>
                    <p>Artist: {song.artist || 'Unknown'}</p>
                    <p>Original Key: {song.key || 'C'}</p>
                    {song.tempo && <p>Tempo: {song.tempo} BPM</p>}
                    <p>Category: {song.category || 'Worship'}</p>
                </header>

                <section>
                    <h2>{song.title} English &amp; Hinglish Lyrics</h2>
                    <pre>{song.lyrics}</pre>
                </section>

                {song.hindi_lyrics && (
                    <section>
                        <h2>{song.title} Hindi Lyrics (हिन्दी में)</h2>
                        <pre>{song.hindi_lyrics}</pre>
                    </section>
                )}

                {song.chords && (
                    <section>
                        <h2>{song.title} Guitar Chords Sheet</h2>
                        <pre>{song.chords}</pre>
                    </section>
                )}
            </article>

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
                coverImage={getSongImage(song)}
                relatedSongs={relatedSongs}
            />
        </>
    );
}
