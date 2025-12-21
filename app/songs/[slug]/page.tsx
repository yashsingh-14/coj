import { ALL_SONGS } from '@/data/songs';
import SongViewer from '@/components/songs/SongViewer';
import { notFound } from 'next/navigation';
import Script from 'next/script';

export function generateStaticParams() {
    return ALL_SONGS.map((song) => ({
        slug: song.id,
    }));
}

// FIX: explicitly using synchronous params as requested
export function generateMetadata({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const song = ALL_SONGS.find((s) => s.id === slug);

    if (!song) {
        return {
            title: 'Song Not Found | COJ Worship',
        };
    }

    const isHindi = song.category === 'hindi';

    return {
        title: `${song.title} Lyrics & Chords | COJ Worship`,
        description: isHindi
            ? `Read ${song.title} Christian worship song lyrics with chords in Hindi. Perfect for church worship, prayer, and guitar practice.`
            : `Read ${song.title} worship song lyrics with chords, key, and structure for church worship. Original Key: ${song.key || 'N/A'}.`,
    };
}

// FIX: explicitly using synchronous params as requested
export default function SongPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const song = ALL_SONGS.find((s) => s.id === slug);

    if (!song) {
        notFound();
    }

    const relatedSongs = ALL_SONGS
        .filter((s) => s.category === song.category && s.id !== song.id)
        .slice(0, 3)
        .map((s) => ({
            title: s.title,
            slug: s.id,
            artist: s.artist,
        }));

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'MusicComposition',
        name: song.title,
        composer: {
            '@type': 'Person',
            name: song.artist,
        },
        inLanguage: song.category === 'hindi' ? 'hi' : 'en',
        musicalKey: song.key,
        genre: 'Worship',
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
                title={song.title}
                author={song.artist}
                originalKey={song.key || "C"}
                tempo={song.tempo}
                lyrics={song.lyrics}
                chords={song.chords}
                youtubeId={song.youtubeId}
                category={song.category}
                duration={song.duration}
                plays={song.plays}
                relatedSongs={relatedSongs}
            />
        </>
    );
}
