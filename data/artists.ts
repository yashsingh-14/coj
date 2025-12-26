export interface Artist {
    id: string;
    name: string;
    image: string;
    songs: number;
    followers: string;
    genre: string;
}

export const ALL_ARTISTS: Artist[] = [
    // --- INTERNATIONAL TITANS ---
    {
        id: 'nQWFzMvCfLE',
        name: 'Hillsong Worship',
        image: 'https://images.unsplash.com/photo-1525994886773-080587e124c9?q=80&w=2070&auto=format&fit=crop',
        songs: 156,
        followers: '8.2M',
        genre: 'Worship / Contemporary'
    },
    {
        id: 'bethel-music',
        name: 'Bethel Music',
        image: 'https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=1974&auto=format&fit=crop',
        songs: 98,
        followers: '5.5M',
        genre: 'Prophetic / Praise'
    },
    {
        id: 'elevation-worship',
        name: 'Elevation Worship',
        image: 'https://images.unsplash.com/photo-1470229722913-7ea549c1c5c4?q=80&w=2070&auto=format&fit=crop',
        songs: 84,
        followers: '4.9M',
        genre: 'Worship / Rock'
    },
    {
        id: 'maverick-city',
        name: 'Maverick City Music',
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=2070&auto=format&fit=crop',
        songs: 42,
        followers: '3.1M',
        genre: 'Gospel / Soul / Worship'
    },
    {
        id: 'sinach',
        name: 'Sinach',
        image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2070&auto=format&fit=crop',
        songs: 55,
        followers: '2.8M',
        genre: 'Gospel / Praise'
    },
    {
        id: 'phil-wickham',
        name: 'Phil Wickham',
        image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070&auto=format&fit=crop',
        songs: 60,
        followers: '1.9M',
        genre: 'Contemporary / Acoustic'
    },
    {
        id: 'chris-tomlin',
        name: 'Chris Tomlin',
        image: 'https://images.unsplash.com/photo-1459749411177-33481156047b?q=80&w=2070&auto=format&fit=crop',
        songs: 110,
        followers: '3.5M',
        genre: 'CCM / Worship'
    },
    {
        id: 'brandon-lake',
        name: 'Brandon Lake',
        image: 'https://images.unsplash.com/photo-1542557476-c775fc4c77d0?q=80&w=2070&auto=format&fit=crop',
        songs: 35,
        followers: '1.2M',
        genre: 'Indie / Worship'
    },
    {
        id: 'kari-jobe',
        name: 'Kari Jobe',
        image: 'https://images.unsplash.com/photo-1621360841012-3f62afa2e9c2?q=80&w=2070&auto=format&fit=crop',
        songs: 50,
        followers: '2.3M',
        genre: 'Prophetic / Worship'
    },
    {
        id: 'cory-asbury',
        name: 'Cory Asbury',
        image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=2070&auto=format&fit=crop',
        songs: 25,
        followers: '800K',
        genre: 'Folk / Worship'
    },
    {
        id: 'tasha-cobbs',
        name: 'Tasha Cobbs Leonard',
        image: 'https://images.unsplash.com/photo-1506157786151-b8491531e1ec?q=80&w=2070&auto=format&fit=crop',
        songs: 40,
        followers: '2.1M',
        genre: 'Gospel / Soul'
    },

    // --- INDIAN & HINDI ARTISTS ---
    {
        id: 'sheldon-bangera',
        name: 'Sheldon Bangera',
        image: 'https://img.youtube.com/vi/X0o3-q3aX7w/hqdefault.jpg',
        songs: 28,
        followers: '400K',
        genre: 'Indian Fusion / Worship'
    },
    {
        id: 'yeshua-band',
        name: 'Yeshua Band',
        image: 'https://img.youtube.com/vi/2n-pT3M0N90/hqdefault.jpg',
        songs: 45,
        followers: '750K',
        genre: 'Hindi Rock / Worship'
    },
    {
        id: 'bridge-music',
        name: 'Bridge Music',
        image: 'https://img.youtube.com/vi/nPV9Fvo59L0/hqdefault.jpg',
        songs: 30,
        followers: '350K',
        genre: 'Hindi / Contemporary'
    },
    {
        id: 'amit-kamble',
        name: 'Amit Kamble',
        image: 'https://img.youtube.com/vi/5rYFjX1-KzE/hqdefault.jpg',
        songs: 22,
        followers: '600K',
        genre: 'Hindi Gospel'
    },
    {
        id: 'shelley-reddy',
        name: 'Shelley Reddy',
        image: 'https://img.youtube.com/vi/6K_p24s0z3w/hqdefault.jpg',
        songs: 15,
        followers: '450K',
        genre: 'Hindi Worship'
    },
    {
        id: 'anil-kant',
        name: 'Anil Kant',
        image: 'https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=800&auto=format&fit=crop',
        songs: 40,
        followers: '500K',
        genre: 'Gospel / Classical'
    },
    {
        id: 'one-tribe',
        name: 'One Tribe',
        image: 'https://img.youtube.com/vi/h4u7q2d40rM/hqdefault.jpg',
        songs: 12,
        followers: '150K',
        genre: 'Hindi Worship / Group'
    },
    {
        id: 'zion-music',
        name: 'Zion Music',
        image: 'https://images.unsplash.com/photo-1621360841012-3f62afa2e9c2?q=80&w=2070&auto=format&fit=crop',
        songs: 18,
        followers: '200K',
        genre: 'Hindi Acapella / Pop'
    },
    {
        id: 'joseph-raj-alladi',
        name: 'Joseph Raj Alladi',
        image: 'https://images.unsplash.com/photo-1507838153414-b4b713384ebd?q=80&w=2070&auto=format&fit=crop',
        songs: 12,
        followers: '150K',
        genre: 'Telugu / Hindi'
    },
    {
        id: 'leeland-hindi',
        name: 'Leeland (Hindi)',
        image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop',
        songs: 5,
        followers: '100K',
        genre: 'Hindi Translated'
    },
    {
        id: 'nehemiah-kulothungan',
        name: 'Nehemiah Kulothungan',
        image: 'https://images.unsplash.com/photo-1542557476-c775fc4c77d0?q=80&w=2070&auto=format&fit=crop',
        songs: 10,
        followers: '80K',
        genre: 'Tamil / Worship'
    }
];
