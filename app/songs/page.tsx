import Link from 'next/link';
import { SONGS } from '@/data/songs';
import { ArrowLeft, Search } from 'lucide-react';

export default function SongsListPage() {
    return (
        <div className="min-h-screen bg-[#050505] pb-20">
            <div className="sticky top-0 bg-[#050505]/95 backdrop-blur border-b border-white/10 p-4 mb-8 z-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold">All Songs</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search songs..."
                        className="w-full bg-[#111] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-white/30 transition-colors"
                        disabled // Simplified for now, client search needs client component
                    />
                </div>

                <div className="pb-32">
                    {SONGS.map((song) => (
                        <Link key={song.slug} href={`/songs/${song.slug}`} className="flex items-center gap-4 py-3 border-b border-[var(--muted)]/20 active:bg-white/5 transition-colors group px-4 -mx-4">
                            {/* Thumbnail */}
                            <div className="w-12 h-12 bg-[#111] rounded-md flex items-center justify-center text-white/20 font-bold border border-white/5">
                                {song.title.charAt(0)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base text-white truncate">{song.title}</h3>
                                <p className="text-xs text-[#94a3b8] truncate uppercase tracking-wide">{song.author}</p>
                            </div>

                            <div className="flex flex-col items-end gap-1 px-2">
                                {/* Key Badge in Accent Color */}
                                <span className="text-xs font-bold text-[var(--accent)]">{song.key}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
