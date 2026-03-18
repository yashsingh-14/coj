import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { supabase } from '@/lib/supabaseClient';
import { ALL_SONGS } from '@/data/songs';
import { SongViewerSkeleton } from '@/components/ui/SkeletonLoader';
import { generateSlug, SITE_URL } from '@/lib/seoUtils';

const SongViewer = dynamic(() => import('@/components/songs/SongViewer'), {
    loading: () => <SongViewerSkeleton />,
});


// Ensure dynamic rendering for instant updates
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // 1. Check if UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    let song = null;

    if (isUuid) {
        const { data } = await supabase.from('songs').select('*').eq('id', slug).single();
        song = data;
    } else {
        // 2. Fallback: Exact Title Match (e.g. way-maker -> Way Maker)
        const titleQuery = slug.replace(/-/g, ' ');
        const { data } = await supabase.from('songs').select('*').ilike('title', titleQuery).single();
        song = data;

        // 3. Fallback: Wildcard Search
        if (!song) {
            const { data: backup } = await supabase.from('songs').select('*').ilike('title', `%${titleQuery}%`).limit(1).single();
            song = backup;
        }

        // 4. FINAL FALLBACK: Static Data (ALL_SONGS)
        if (!song) {
            const staticSong = ALL_SONGS.find(s =>
                s.id === slug ||
                s.title.toLowerCase() === titleQuery.toLowerCase() ||
                s.title.toLowerCase().includes(titleQuery.toLowerCase())
            );
            if (staticSong) {
                song = {
                    id: staticSong.id,
                    title: staticSong.title,
                    artist: staticSong.artist,
                    category: staticSong.category,
                    key: staticSong.key,
                    tempo: staticSong.tempo,
                    lyrics: staticSong.lyrics,
                    hindi_lyrics: staticSong.hindiLyrics,
                    chords: staticSong.chords,
                    youtube_id: staticSong.youtubeId,
                    img: staticSong.img
                };
            }
        }
    }

    if (!song) {
        return {
            title: 'Song Not Found | COJ Worship',
        };
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
            type: 'article',
            title,
            description,
            url: canonicalUrl,
            siteName: 'COJ Worship',
            images: song.img ? [{ url: song.img, alt: `${song.title} - Worship Song` }] : [{ url: '/images/logo-main.png', alt: 'COJ Worship' }],
        },
        twitter: {
            card: 'summary',
            title: `${song.title} - Lyrics & Chords`,
            description,
        },
    };
}

export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // 1. Check if UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    let song = null;

    if (isUuid) {
        const { data } = await supabase.from('songs').select('*').eq('id', slug).single();
        song = data;
    } else {
        // 2. Fallback: Exact Title Match
        const titleQuery = slug.replace(/-/g, ' ');
        // ilike is case-insensitive
        const { data } = await supabase.from('songs').select('*').ilike('title', titleQuery).single();
        song = data;

        // 3. Fallback: Wildcard Search
        if (!song) {
            console.log(`Trying wildcard search for: ${titleQuery}`);
            const { data: backup } = await supabase.from('songs').select('*').ilike('title', `%${titleQuery}%`).limit(1).single();
            song = backup;
        }

        // 4. FINAL FALLBACK: Static Data (ALL_SONGS)
        if (!song) {
            const staticSong = ALL_SONGS.find(s =>
                s.id === slug ||
                s.title.toLowerCase() === titleQuery.toLowerCase() ||
                s.title.toLowerCase().includes(titleQuery.toLowerCase())
            );
            if (staticSong) {
                song = {
                    id: staticSong.id,
                    title: staticSong.title,
                    artist: staticSong.artist,
                    category: staticSong.category,
                    key: staticSong.key,
                    tempo: staticSong.tempo,
                    lyrics: staticSong.lyrics,
                    hindi_lyrics: staticSong.hindiLyrics,
                    chords: staticSong.chords,
                    youtube_id: staticSong.youtubeId,
                    img: staticSong.img
                };
            }
        }
    }

    if (!song) {
        notFound();
    }

    // Fetch Related Songs
    const { data: relatedSongsData } = await supabase
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
            <Script
                id="song-jsonld"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <SongViewer
                songId={song.id}
                title={song.title}
                author={song.artist}
                originalKey={song.key || "C"}
                tempo={song.tempo}
                lyrics={song.lyrics}
                hindiLyrics={song.hindi_lyrics} // Note snake_case from DB
                chords={song.chords}
                youtubeId={song.youtube_id} // Note snake_case from DB
                category={song.category}
                relatedSongs={relatedSongs}
            />
        </>
    );
}
