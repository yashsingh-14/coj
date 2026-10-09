import { Song } from './types';
import snapshotSongs from './supabase_songs_snapshot.json';

// Re-export Song interface
export type { Song } from './types';

// Full list of songs from database snapshot with complete metadata & chords
export const ALL_SONGS: Song[] = snapshotSongs as unknown as Song[];
