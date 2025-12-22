export interface Song {
    id: string;
    title: string;
    artist: string;
    category: 'praise' | 'worship' | 'kids' | 'hymns' | 'sermons' | 'contemporary' | 'hindi';
    img: string;
    hymnNumber?: number;
    lyrics: string;
    hindiLyrics?: string;
    chords?: string;
    key?: string;
    tempo?: string;
    youtubeId?: string;
}
