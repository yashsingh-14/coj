import { useState, useEffect } from 'react';

/**
 * Hook to manage search history in localStorage
 * Stores last 10 search queries
 */
export function useSearchHistory() {
    const [history, setHistory] = useState<string[]>([]);

    // Load history from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('searchHistory');
            if (saved) {
                setHistory(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Failed to load search history:', error);
        }
    }, []);

    // Add query to history
    const addToHistory = (query: string) => {
        if (!query.trim()) return;

        try {
            // Remove duplicates and add to front, limit to 10
            const updated = [
                query.trim(),
                ...history.filter(h => h !== query.trim())
            ].slice(0, 10);

            setHistory(updated);
            localStorage.setItem('searchHistory', JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to save search history:', error);
        }
    };

    // Clear all history
    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('searchHistory');
    };

    // Remove specific item
    const removeFromHistory = (query: string) => {
        const updated = history.filter(h => h !== query);
        setHistory(updated);
        localStorage.setItem('searchHistory', JSON.stringify(updated));
    };

    return {
        history,
        addToHistory,
        clearHistory,
        removeFromHistory
    };
}
