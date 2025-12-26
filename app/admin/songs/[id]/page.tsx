'use client';

import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabaseClient';
import SongForm from '@/components/admin/SongForm';
import { Song } from '@/data/types';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EditSongPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const [song, setSong] = useState<Song | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchSong = async () => {
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .eq('id', unwrappedParams.id)
                .single();

            if (error || !data) {
                router.push('/admin/songs');
                return;
            }

            setSong(data);
            setIsLoading(false);
        };

        fetchSong();
    }, [unwrappedParams.id, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    if (!song) return null;

    return <SongForm mode="edit" initialData={song} />;
}
