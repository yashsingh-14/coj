import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { ALL_SONGS } from '@/data/songs';
import { Song } from '@/data/types';

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

    // Initialize Fuse instance with memoization
    const fuse = useMemo(() => {
        if (!allSongs || allSongs.length === 0) return null;

        return new Fuse(allSongs, {
            keys: [
                { name: 'title', weight: 0.7 },
                { name: 'artist', weight: 0.5 },
                { name: 'category', weight: 0.3 }
            ],
            threshold: 0.45, // Allows typos & spacing differences (e.g. "rooh e paak" vs "rooh-e-paak")
            distance: 100,
            includeScore: true,
            ignoreLocation: true,
        });
    }, [allSongs]);

    // Perform Search
    useEffect(() => {
        const trimmed = query.trim();
        if (!trimmed) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const timer = setTimeout(() => {
            if (fuse) {
                const fuseResults = fuse.search(trimmed);
                const items = fuseResults.map(result => result.item);
                setResults(items.slice(0, 50));
            } else if (allSongs.length > 0) {
                // Substring fallback
                const q = trimmed.toLowerCase();
                const matched = allSongs.filter(s =>
                    s.title?.toLowerCase().includes(q) ||
                    s.artist?.toLowerCase().includes(q) ||
                    s.category?.toLowerCase().includes(q)
                );
                setResults(matched.slice(0, 50));
            } else {
                setResults([]);
            }
            setLoading(false);
        }, 80);

        return () => clearTimeout(timer);
    }, [query, fuse, allSongs]);

    return {
        query,
        setQuery,
        results,
        loading: loading && results.length === 0
    };
}
