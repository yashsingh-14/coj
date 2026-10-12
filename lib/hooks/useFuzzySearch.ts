import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { ALL_SONGS } from '@/data/songs';
import { Song } from '@/data/types';
import { filterAndRankSongs } from '@/lib/searchUtils';

export function useFuzzySearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    // Initialize immediately with ALL_SONGS for instant 0ms search
    const [allSongs, setAllSongs] = useState<Song[]>(ALL_SONGS);

    // Refresh with fresh DB songs in background via cached /api/songs
    useEffect(() => {
        let isMounted = true;
        const fetchSearchIndex = async () => {
            try {
                const res = await fetch('/api/songs');
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted && data.songs && data.songs.length > 0) {
                        setAllSongs(data.songs);
                    }
                }
            } catch (err) {
                console.warn("Using offline search index fallback:", err);
            }
        };

        fetchSearchIndex();
        return () => { isMounted = false; };
    }, []);

    // Initialize Fuse instance with memoization & expanded forgiving keys
    const fuse = useMemo(() => {
        if (!allSongs || allSongs.length === 0) return null;

        return new Fuse(allSongs, {
            keys: [
                { name: 'title', weight: 0.8 },
                { name: 'artist', weight: 0.4 },
                { name: 'category', weight: 0.3 },
                { name: 'lyrics', weight: 0.2 },
                { name: 'hindiLyrics', weight: 0.2 },
                { name: 'hindi_lyrics', weight: 0.2 },
            ],
            threshold: 0.55, // Highly forgiving of typos & spacing differences
            distance: 200,
            includeScore: true,
            ignoreLocation: true,
            minMatchCharLength: 2,
        });
    }, [allSongs]);

    // Perform Search with hybrid forgiving algorithm
    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const timer = setTimeout(() => {
            // 1. Run our forgiving token & phonetic & lyrics ranker
            const rankedByScore = filterAndRankSongs(allSongs, trimmed);

            // 2. Run Fuse for additional typo tolerance
            let fuseItems: Song[] = [];
            if (fuse) {
                const fuseResults = fuse.search(trimmed);
                fuseItems = fuseResults.map(r => r.item);
            }

            // 3. Merge both with rankedByScore having top priority, deduplicating by ID
            const seen = new Set<string>();
            const combined: Song[] = [];

            for (const s of rankedByScore) {
                if (!seen.has(s.id)) {
                    seen.add(s.id);
                    combined.push(s);
                }
            }

            for (const s of fuseItems) {
                if (!seen.has(s.id)) {
                    seen.add(s.id);
                    combined.push(s);
                }
            }

            setResults(combined.slice(0, 50));
            setLoading(false);
        }, 60);

        return () => clearTimeout(timer);
    }, [query, fuse, allSongs]);

    return {
        query,
        setQuery,
        results,
        loading: loading && results.length === 0
    };
}
