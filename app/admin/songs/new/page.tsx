'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const SongForm = dynamic(() => import('@/components/admin/SongForm'), {
    loading: () => (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
        </div>
    ),
});

export default function AddSongPage() {
    return <SongForm mode="create" />;
}
