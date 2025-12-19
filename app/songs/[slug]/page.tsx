import { SONGS } from '@/data/songs';
import SongViewer from '@/components/songs/SongViewer';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
    return SONGS.map((song) => ({
        slug: song.slug,
    }));
}

export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const song = SONGS.find((s) => s.slug === slug);

    if (!song) {
        notFound();
    }

    return (
        <SongViewer
            title={song.title}
            author={song.author}
            originalKey={song.key}
            content={song.content}
            youtubeId={song.youtubeId}
        />
    );
}
