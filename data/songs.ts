export interface Song {
    slug: string;
    title: string;
    author: string;
    key: string;
    lang: string;
    content: string;
    youtubeId?: string;
}

export const SONGS: Song[] = [
    {
        slug: 'way-maker',
        title: 'Way Maker',
        author: 'Sinach',
        key: 'E',
        lang: 'English',
        youtubeId: 'n4XWfwLHeLM',
        content:
            `[E]You are here, [B]moving in our midst
I [A]worship You, I [A]worship You
[E]You are here, [B]working in this place
I [A]worship You, I [A]worship You

[E]Way maker, [B]miracle worker
[C#m]Promise keeper, [A]light in the darkness
[E]My God, [B]that is who You [A]are`
    },
    {
        slug: 'goodness-of-god',
        title: 'Goodness of God',
        author: 'Bethel Music',
        key: 'Ab',
        lang: 'English',
        youtubeId: '-f4MUUMwmV4',
        content:
            `[Ab]I love You, Lord
[Db]For Your mercy never [Ab]fails me
[Eb/G]All my days, I've been [Fm]held in Your [Db]hands
From the [Fm]moment that I [Eb]wake up
[Db]Until I lay my [Ab]head
[Fm]I will sing of the [Eb]goodness of [Ab]God`
    },
    {
        slug: '10000-reasons',
        title: '10,000 Reasons',
        author: 'Matt Redman',
        key: 'G',
        lang: 'English',
        youtubeId: 'DXDGE_lRI0E',
        content:
            `Bless the [C]Lord, O my [G]soul
[D/F#]O my [Em]soul
[C]Worship His [G]holy [Dsus4]name [D]
Sing like [C]never be-[Em]fore
[C]O my [D]soul
[I'll] [C]worship Your [D]holy [G]name`
    }
];
