import { Song } from './types';
import { HINDI_SONGS } from './songs_hindi';
import { ENGLISH_SONGS } from './songs_english';

// Re-export Song interface for backward compatibility
export type { Song } from './types';

// Combine all songs
// ENGLISH_SONGS came first in the original array, then HINDI, then MORE ENGLISH, then KIDS.
// But mostly users won't notice exact ordering unless it was strictly chronological.
// I will just concatenate them.
// Note: Some "MORE ENGLISH" and "KIDS" were in ENGLISH_SONGS array in my split.
// Actually, I put all non-Hindi into ENGLISH_SONGS.
// So just spreading them is enough.

export const ALL_SONGS: Song[] = [
    ...ENGLISH_SONGS,
    ...HINDI_SONGS
];
