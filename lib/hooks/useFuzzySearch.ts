import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { supabase } from '@/lib/supabaseClient';
import { Song } from '@/data/types';

export function useFuzzySearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Song[]>([]);
    const [loading, setLoading] = useState(false);
    const [allSongs, setAllSongs] = useState<Song[]>([]);
    const [isIndexReady, setIsIndexReady] = useState(false);

    // Fetch the search index (lightweight metadata) only once on mount
    useEffect(() => {
        let isMounted = true;
        const fetchSearchIndex = async () => {
            try {
                // Fetch only necessary lightweight fields for search to avoid heavy payload
                const { data, error } = await supabase
                    .from('songs')
                    .select('id, title, artist, category, img, is_featured')
                    .order('title', { ascending: true });

                if (error) {
                    console.error("Failed to load search index from Supabase:", error);
                }

                if (isMounted && data) {
                    setAllSongs(data as unknown as Song[]);
                }
            } catch (err) {
                console.error("Failed to load search index:", err);
            } finally {
                if (isMounted) {
                    setIsIndexReady(true);
                }
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
            threshold: 0.4, // Allows typos (0.0 = exact, 1.0 = match anything)
            distance: 100,
            includeScore: true,
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
                // Substring fallback while/if Fuse isn't initialized
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
        }, 120);

        return () => clearTimeout(timer);
    }, [query, fuse, allSongs]);

    return {
        query,
        setQuery,
        results,
        loading: loading || (!isIndexReady && query.trim().length > 0 && allSongs.length === 0)
    };
}
