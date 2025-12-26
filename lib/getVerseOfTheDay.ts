import { DAILY_VERSES, type BibleVerse } from '@/data/verses';

/**
 * Get the Bible verse for the current day of the year
 * Returns a unique verse for each day (1-365)
 */
export function getVerseOfTheDay(): BibleVerse {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Handle day 0 and ensure we stay within array bounds
    const verseIndex = Math.max(0, Math.min(dayOfYear - 1, DAILY_VERSES.length - 1));

    return DAILY_VERSES[verseIndex] || DAILY_VERSES[0];
}

/**
 * Get verse for a specific date (useful for testing)
 */
export function getVerseForDate(date: Date): BibleVerse {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const verseIndex = Math.max(0, Math.min(dayOfYear - 1, DAILY_VERSES.length - 1));

    return DAILY_VERSES[verseIndex] || DAILY_VERSES[0];
}

/**
 * Get the current day of year (1-365/366)
 */
export function getCurrentDayOfYear(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}
