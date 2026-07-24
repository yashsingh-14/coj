'use client';

import { useEffect, useState, use } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient';
import { Song } from '@/data/types';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SongForm = dynamic(() => import('@/components/admin/SongForm'), {
    loading: () => (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
        </div>
    ),
});

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
