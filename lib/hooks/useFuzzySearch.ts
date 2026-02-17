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

    // Fetch the search index (lightweight) only once on mount
    useEffect(() => {
        const fetchSearchIndex = async () => {
            try {
                // Fetch necessary fields for indexing + display in search list
                // We fetch 'img' too if needed for basic display, or we fetch details on click. 
                // Let's fetch enough to render the card: id, title, artist, category, img (if available)
                const { data, error } = await supabase
                    .from('songs')
                    .select('*');

                if (error) throw error;

                if (data) {
                    setAllSongs(data as Song[]);
                    setIsIndexReady(true);
                }
            } catch (err) {
                console.error("Failed to load search index:", err);
            }
        };

        fetchSearchIndex();
    }, []);

    // Initialize Fuse instance with memoization
    const fuse = useMemo(() => {
        if (!isIndexReady) return null;

        return new Fuse(allSongs, {
            keys: [
                { name: 'title', weight: 0.7 },
                { name: 'artist', weight: 0.5 },
                { name: 'category', weight: 0.3 }
            ],
            threshold: 0.4, // Allows typos (0.0 = exact, 1.0 = match anything)
            distance: 100,   // How close the match must be to the query location
            includeScore: true,
        });
    }, [allSongs, isIndexReady]);

    // Perform Search
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }

        if (!fuse) {
            setLoading(true); // Index loading
            return;
        }

        setLoading(true);
        // Debounce slightly to avoid heavy UI updates on every key, 
        // though Fuse is fast enough for <10k items.
        const timer = setTimeout(() => {
            const fuseResults = fuse.search(query);
            const items = fuseResults.map(result => result.item);
            setResults(items.slice(0, 50)); // Limit to 50 results
            setLoading(false);
        }, 150);

        return () => clearTimeout(timer);
    }, [query, fuse]);

    return {
        query,
        setQuery,
        results,
        loading: loading || (!isIndexReady && query.length > 0)
    };
}
