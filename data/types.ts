export interface Song {
    id: string;
    title: string;
    artist: string;
    category: string;
    img: string;
    hymnNumber?: number;
    lyrics: string;
    hindiLyrics?: string;
    hindi_lyrics?: string; // DB field
    chords?: string;
    key?: string;
    tempo?: string;
    youtubeId?: string;
    youtube_id?: string; // DB field
}
