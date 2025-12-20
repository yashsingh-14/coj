import { ALL_SONGS } from '@/data/songs';
import SongViewer from '@/components/songs/SongViewer';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
    return ALL_SONGS.map((song) => ({
        slug: song.id,
    }));
}

export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const song = ALL_SONGS.find((s) => s.id === slug);

    if (!song) {
        notFound();
    }

    // Combine lyrics and chords for the viewer if they are separate
    // Or just pass lyrics if that's what we have formatted
    const combinedContent = song.chords
        ? `${song.lyrics}\n\n[CHORDS]\n${song.chords}`
        : song.lyrics;

    return (
        <SongViewer
            title={song.title}
            author={song.artist}
            originalKey={song.key || "C"}
            content={combinedContent}
            youtubeId={song.youtubeId}
            category={song.category}
            duration={song.duration}
            plays={song.plays}
        />
    );
}
