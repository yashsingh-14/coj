import SongViewer from '@/components/songs/SongViewer';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { supabase } from '@/lib/supabaseClient';

// Ensure dynamic rendering for instant updates
export const dynamic = 'force-dynamic';

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
    }

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
                hindiLyrics={song.hindi_lyrics} // Note snake_case from DB
                chords={song.chords}
                youtubeId={song.youtube_id} // Note snake_case from DB
                category={song.category}
                relatedSongs={relatedSongs}
            />
        </>
    );
}
