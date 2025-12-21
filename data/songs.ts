export interface Song {
    id: string;
    title: string;
    artist: string;
    category: 'praise' | 'worship' | 'kids' | 'hymns' | 'sermons' | 'contemporary' | 'hindi';
    duration: string;
    plays: string;
    img: string;
    hymnNumber?: number;
    lyrics: string;
    chords?: string;
    key?: string;
    tempo?: string;
    youtubeId?: string;
}

export const ALL_SONGS: Song[] = [
    // --- ENGLISH WORSHIP ---
    {
        id: 'way-maker',
        title: 'Way Maker',
        artist: 'Sinach',
        category: 'worship',
        duration: '5:12',
        plays: '2.4M',
        img: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=400',
        lyrics: `You are here, moving in our midst\nI worship You, I worship You\nYou are here, working in this place\nI worship You, I worship You\n\n(Chorus)\nWay Maker, Miracle Worker, Promise Keeper\nLight in the darkness\nMy God, that is who You are`,
        chords: `[Intro]\n[F] [C] [G] [Am]\n\n[Verse 1]\n[F]          [C]\nYou are here, moving in our midst\n[G]              [Am]\nI worship You, I worship You\n[F]          [C]\nYou are here, working in this place\n[G]              [Am]\nI worship You, I worship You\n\n[Chorus]\n[F]\nWay Maker, Miracle Worker\n[C]\nPromise Keeper, Light in the darkness\n[G]                   [Am]\nMy God, that is who You are`,
        key: 'F',
        tempo: 'Slow Ballad (68 BPM)',
        youtubeId: 'iJCV_2H9xD0'
    },
    {
        id: 'goodness-of-god',
        title: 'Goodness of God',
        artist: 'Bethel Music',
        category: 'praise',
        duration: '4:56',
        plays: '1.8M',
        img: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400',
        lyrics: `I love You, Lord\nFor Your mercy never fails me\nAll my days, I've been held in Your hands\nFrom the moment that I wake up\nUntil I lay my head\nI will sing of the goodness of God`,
        chords: `[Verse 1]\n[G]\nI love You, Lord\n[C]                       [G]\nFor Your mercy never fails me\n[D/F#]     [Em]           [C]              [D]\nAll my days, I've been held in Your hands`,
        key: 'G',
        youtubeId: 'n0FBb6hnwTo'
    },
    {
        id: 'oceans',
        title: 'Oceans',
        artist: 'Hillsong United',
        category: 'worship',
        duration: '8:05',
        plays: '3.5M',
        img: 'https://images.unsplash.com/photo-1506157786151-b8491531e1ec?auto=format&fit=crop&q=80&w=400',
        lyrics: `You call me out upon the waters\nThe great unknown where feet may fail\nAnd there I find You in the mystery\nIn oceans deep my faith will stand`,
        chords: `[Intro]\n[Bm] [A/C#] [D] [A] [G]\n\n[Chorus]\n[G]\nI will call upon Your name\n[D]\nAnd keep my eyes above the waves\n[A]\nWhen oceans rise`
    },
    {
        id: '10000-reasons',
        title: '10,000 Reasons',
        artist: 'Matt Redman',
        category: 'hymns',
        duration: '5:42',
        plays: '2.1M',
        img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=400',
        lyrics: `Bless the Lord, O my soul\nO my soul\nWorship His holy name\nSing like never before\nO my soul\nI'll worship Your holy name`,
        chords: `[Chorus]\n[C]          [G]\nBless the Lord, O my soul\n[D/F#]   [Em]\nO my soul\n[C]     [G]    [Dsus4] [D]\nWorship His holy name`
    },
    {
        id: 'how-great-is-our-god',
        title: 'How Great Is Our God',
        artist: 'Chris Tomlin',
        category: 'worship',
        duration: '4:30',
        plays: '3.0M',
        img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400',
        lyrics: `The splendor of the King, clothed in majesty\nLet all the earth rejoice\nAll the earth rejoice\nHe wraps Himself in light\nAnd darkness tries to hide\nAnd trembles at His voice\nAnd trembles at His voice`,
        chords: `[Verse 1]\n[G]\nThe splendor of the King\n[Em]\nClothed in majesty\n[C]\nLet all the earth rejoice\n[D]\nAll the earth rejoice`
    },
    {
        id: 'amazing-grace',
        title: 'Amazing Grace',
        artist: 'Traditional',
        category: 'hymns',
        duration: '4:00',
        plays: '5.2M',
        img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400',
        lyrics: `Amazing Grace, how sweet the sound\nThat saved a wretch like me\nI once was lost but now am found\nWas blind, but now I see`,
        chords: `[G]          [C]         [G]\nAmazing grace how sweet the sound\n[G]                   [D]\nThat saved a wretch like me`
    },
    {
        id: 'holy-forever',
        title: 'Holy Forever',
        artist: 'Chris Tomlin',
        category: 'worship',
        duration: '5:00',
        plays: '900k',
        img: 'https://images.unsplash.com/photo-1507838153414-b4b713384ebd?auto=format&fit=crop&q=80&w=400',
        lyrics: `A thousand generations falling down in worship\nTo sing the song of ages to the Lamb\nAnd all who've gone before us and all who will believe\nWill sing the song of ages to the Lamb`,
        chords: `[Chorus]\n[C]\nYour name is the highest\n[Am]\nYour name is the greatest\n[F]\nYour name stands above them all`
    },
    {
        id: 'gratitude',
        title: 'Gratitude',
        artist: 'Brandon Lake',
        category: 'praise',
        duration: '5:30',
        plays: '1.1M',
        img: 'https://images.unsplash.com/photo-1459749411177-33481156047b?auto=format&fit=crop&q=80&w=400',
        lyrics: `All my words fall short\nI got nothing new\nHow could I express\nAll my gratitude?`,
        chords: `[Chorus]\n[G]\nSo I throw up my hands\n[Em]\nAnd praise You again and again\n[C]\n'Cause all that I have is a hallelujah`
    },
    {
        id: 'jireh',
        title: 'Jireh',
        artist: 'Maverick City',
        category: 'contemporary',
        duration: '9:58',
        plays: '2.5M',
        img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
        lyrics: `I'll never be more loved than I am right now\nWasn't holding You up\nSo there's nothing I can do to let You down\nDoesn't take a trophy to make You proud\nI'll never be more loved than I am right now`,
        chords: `[Chorus]\n[G]\nJireh, You are enough\n[Em]\nJireh, You are enough\n[C]\nI will be content in every circumstance\n[D]             [G]\nYou are Jireh, You are enough`
    },
    {
        id: 'raise-a-hallelujah',
        title: 'Raise A Hallelujah',
        artist: 'Bethel Music',
        category: 'praise',
        duration: '5:01',
        plays: '1.4M',
        img: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80&w=400',
        lyrics: `I raise a hallelujah, in the presence of my enemies\nI raise a hallelujah, louder than the unbelief\nI raise a hallelujah, my weapon is a melody\nI raise a hallelujah, Heaven comes to fight for me`,
        chords: `[Chorus]\n[C]\nI'm gonna sing, in the middle of the storm\n[Am]\nLouder and louder, you're gonna hear my praises roar\n[F]\nUp from the ashes, hope will arise\n[G]                          [C]\nDeath is defeated, the King is alive`
    },

    // --- HINDI CHRISTIAN SONGS ---
    {
        id: 'aa-pavitra-aatma',
        title: 'Aa Pavitra Aatma',
        artist: 'Shelly Reddy',
        category: 'hindi',
        duration: '6:15',
        plays: '800k',
        img: 'https://images.unsplash.com/photo-1507838153414-b4b713384ebd?auto=format&fit=crop&q=80&w=400',
        lyrics: `Aa Pavitra Aatma, aa Pavitra Aatma\nMujhe le chal Yeshu ke charno mein\nPavitra Aatma... aa...\n\n(Chorus)\nSirf Tere liye, Yeshu Tere liye\nMain gaaunga, main jiyunga\nSirf Tere liye`,
        chords: `[Chorus]\n[C]         [G]\nSirf Tere liye\n[F]         [G]\nYeshu Tere liye\n[C]           [G]\nMain gaaunga, main jiyunga\n[F]    [G]    [C]\nSirf Tere liye`
    },
    {
        id: 'tera-lahu',
        title: 'Tera Lahu',
        artist: 'Amit Kamble',
        category: 'hindi',
        duration: '5:45',
        plays: '1.1M',
        img: 'https://images.unsplash.com/photo-1542557476-c775fc4c77d0?auto=format&fit=crop&q=80&w=400',
        lyrics: `Tera lahu, Tera lahu\nTera lahu mujhe dhota hai\nTera lahu, Tera lahu\nTera lahu mujhe bachata hai`,
        chords: `[G]            [D]\nTera lahu, Tera lahu\n[Em]              [C]\nTera lahu mujhe dhota hai`
    },
    {
        id: 'tu-hi-rab-hai',
        title: 'Tu Hi Rab Hai',
        artist: 'Bridge Music',
        category: 'hindi',
        duration: '4:50',
        plays: '700k',
        img: 'https://images.unsplash.com/photo-1525926477800-7a3be58ab299?auto=format&fit=crop&q=80&w=400',
        lyrics: `Tu hi rab hai, Tu hi sab hai\nTu hi kal tha, Tu hi ab hai\nTu hi rab hai...`,
        chords: `[Chorus]\n[G]          [D]\nTu hi rab hai, Tu hi sab hai\n[Em]         [C]\nTu hi kal tha, Tu hi ab hai`
    },
    {
        id: 'stuti-gaaoonga',
        title: 'Stuti Gaaoonga',
        artist: 'Shelly Reddy',
        category: 'hindi',
        duration: '5:20',
        plays: '950k',
        img: 'https://images.unsplash.com/photo-1621360841012-3f62afa2e9c2?auto=format&fit=crop&q=80&w=400',
        lyrics: `Main stuti gaaoonga, main aaraadhana karunga\nJab tak main zinda hu, Tera naam uthaunga\n\n(Chorus)\nHaaleluyah, Haaleluyah...`,
        chords: `[C]\nMain stuti gaaoonga\n[G]\nMain aaraadhana karunga\n[Am]\nJab tak main zinda hu\n[F]\nTera naam uthaunga`
    },
    {
        id: 'yeshu-tera-naam-sabse-uncha',
        title: 'Yeshu Tera Naam',
        artist: 'Amit Kamble',
        category: 'hindi',
        duration: '6:30',
        plays: '2.0M',
        img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400',
        lyrics: `Yeshu Tera naam sabse uncha hai\nYeshu Tera naam sabse uncha hai\nJis naam mein hai changayi\nJis naam mein hai rihayi`,
        chords: `[C]           [G]\nYeshu Tera naam sabse uncha hai\n[Am]          [F]\nYeshu Tera naam sabse uncha hai`
    },
    {
        id: 'kuch-na-tha',
        title: 'Kuch Na Tha',
        artist: 'Yeshua Band',
        category: 'hindi',
        duration: '5:10',
        plays: '1.5M',
        img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=400',
        lyrics: `Kuch na tha mere paas, khone ko\nTumne dhoond liya, mujhe\nAb kya maangu main, Khuda\nTum kaafi ho, mere liye`,
        chords: `[G]            [D]\nKuch na tha mere paas\n[Em]           [C]\nKhone ko...`
    },
    {
        id: 'dhanyavad',
        title: 'Dhanyavad',
        artist: 'Zion Music',
        category: 'hindi',
        duration: '4:45',
        plays: '600k',
        img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
        lyrics: `Dhanyavad ke saath, stuti gaaunga\nHey Yeshu mere Khuda, upkaar Tere hai mahaan\n\n(Chorus)\nDhanyavad, Dhanyavad, Dhanyavad Yeshu\nDhanyavad, Dhanyavad, Dhanyavad Yeshu`,
        chords: `[G]             [C]\nDhanyavad ke saath\n[D]             [G]\nStuti gaaunga`
    },
    {
        id: 'khoj',
        title: 'Khoj',
        artist: 'Yeshua Band',
        category: 'hindi',
        duration: '5:00',
        plays: '850k',
        img: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400',
        lyrics: `Khoj mein nikla tha main\nDhoondne ko khushi\nPar mili na mujhe\nKahin bhi wo khushi\nJab dekha Yeshu Tujhe\nMil gayi zindagi`,
        chords: `[Verse]\n[G]       [D]\nKhoj mein nikla tha main\n[Em]      [C]\nDhoondne ko khushi`
    },
    {
        id: 'gaao-hallelujah',
        title: 'Gaao Hallelujah',
        artist: 'Bridge Music',
        category: 'hindi',
        duration: '4:30',
        plays: '1.2M',
        img: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=400',
        lyrics: `Gaao Hallelujah, Gaao Hallelujah\nGaao Hallelujah, Gaao Hallelujah\nYeshu Zinda hai, Yeshu Zinda hai`,
        chords: `[C]\nGaao Hallelujah\n[F]\nGaao Hallelujah\n[G]\nGaao Hallelujah\n[C]\nGaao Hallelujah`
    },
    {
        id: 'sang-tere',
        title: 'Sang Tere',
        artist: 'Shelly Reddy',
        category: 'hindi',
        duration: '5:50',
        plays: '750k',
        img: 'https://images.unsplash.com/photo-1506157786151-b8491531e1ec?auto=format&fit=crop&q=80&w=400',
        lyrics: `Sang Tere main chalun, Yeshu mere\nSang Tere main rahun, hardam mere\nTu hi mera sab kuch hai`,
        chords: `[G]         [D]\nSang Tere main chalun\n[Em]        [C]\nYeshu mere`
    },

    // --- MORE ENGLISH ---
    { id: 'build-my-life', title: 'Build My Life', artist: 'Housefires', category: 'contemporary', duration: '6:12', plays: '500k', img: 'https://images.unsplash.com/photo-1459749411177-33481156047b?auto=format&fit=crop&q=80&w=400', lyrics: "Worthy of every song we could ever sing...", chords: "[G] [C] [D] [Em]" },
    { id: 'reckless-love', title: 'Reckless Love', artist: 'Cory Asbury', category: 'worship', duration: '5:33', plays: '4.2M', img: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80&w=400', lyrics: "Before I spoke a word...", chords: "[F#m] [E] [D] [A]" },
    { id: 'what-a-beautiful-name', title: 'What A Beautiful Name', artist: 'Hillsong', category: 'worship', duration: '5:45', plays: '3.8M', img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=400', lyrics: "You were the Word at the beginning...", chords: "[D] [G] [Bm] [A]" },
    { id: 'great-are-you-lord', title: 'Great Are You Lord', artist: 'All Sons & Daughters', category: 'praise', duration: '4:55', plays: '2.9M', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400', lyrics: "You give life, You are love...", chords: "[A] [D] [E]" },
    { id: 'king-of-kings', title: 'King Of Kings', artist: 'Hillsong Worship', category: 'worship', duration: '4:50', plays: '3.1M', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400', lyrics: "In the darkness we were waiting...", chords: "[D/F#] [G] [A] [D]" },
    { id: 'cornerstone', title: 'Cornerstone', artist: 'Hillsong', category: 'hymns', duration: '5:10', plays: '2.3M', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400', lyrics: "My hope is built on nothing less...", chords: "[C] [Am] [F] [G]" },
    { id: 'in-christ-alone', title: 'In Christ Alone', artist: 'Passion', category: 'hymns', duration: '5:00', plays: '1.9M', img: 'https://images.unsplash.com/photo-1507838153414-b4b713384ebd?auto=format&fit=crop&q=80&w=400', lyrics: "In Christ alone my hope is found...", chords: "[G] [D] [A] [Em]" },
    { id: 'graves-into-gardens', title: 'Graves Into Gardens', artist: 'Elevation Worship', category: 'contemporary', duration: '7:30', plays: '3.3M', img: 'https://images.unsplash.com/photo-1542557476-c775fc4c77d0?auto=format&fit=crop&q=80&w=400', lyrics: "I searched the world but it couldn't fill me...", chords: "[B] [G#m] [E] [F#]" },
    { id: 'canvas-and-clay', title: 'Canvas And Clay', artist: 'Pat Barrett', category: 'contemporary', duration: '5:15', plays: '600k', img: 'https://images.unsplash.com/photo-1525926477800-7a3be58ab299?auto=format&fit=crop&q=80&w=400', lyrics: "In my mother's womb, You formed me...", chords: "[C] [G] [Am] [F]" },
    { id: 'battle-belongs', title: 'Battle Belongs', artist: 'Phil Wickham', category: 'praise', duration: '4:45', plays: '2.2M', img: 'https://images.unsplash.com/photo-1621360841012-3f62afa2e9c2?auto=format&fit=crop&q=80&w=400', lyrics: "When all I see is the battle...", chords: "[D] [G] [Bm] [A]" },

    // --- KIDS SONGS ---
    { id: 'jesus-loves-me', title: 'Jesus Loves Me', artist: 'Kids Worship', category: 'kids', duration: '3:00', plays: '5.0M', img: 'https://images.unsplash.com/photo-1506157786151-b8491531e1ec?auto=format&fit=crop&q=80&w=400', lyrics: "Jesus loves me this I know...", chords: "[C] [F] [G] [C]" },
    { id: 'this-little-light', title: 'This Little Light', artist: 'Kids Worship', category: 'kids', duration: '2:45', plays: '4.5M', img: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=400', lyrics: "This little light of mine...", chords: "[G] [C] [G] [D]" },
    { id: 'father-abraham', title: 'Father Abraham', artist: 'Kids Worship', category: 'kids', duration: '3:15', plays: '3.8M', img: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400', lyrics: "Father Abraham had many sons...", chords: "[C] [G] [C]" },
    { id: 'my-god-is-so-big', title: 'My God Is So Big', artist: 'Kids Worship', category: 'kids', duration: '2:30', plays: '4.1M', img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=400', lyrics: "My God is so big, so strong and so mighty...", chords: "[G] [D] [G]" },

    // --- FILLING UP TO 60+ (Generated mix) ---
    { id: 'firm-foundation', title: 'Firm Foundation', artist: 'Cody Carnes', category: 'contemporary', duration: '6:20', plays: '1.5M', img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=400', lyrics: "Christ is my firm foundation...", chords: "[D] [G] [Bm] [A]" },
    { id: 'honey-in-the-rock', title: 'Honey In The Rock', artist: 'Brooke Ligertwood', category: 'praise', duration: '4:40', plays: '1.2M', img: 'https://images.unsplash.com/photo-1459749411177-33481156047b?auto=format&fit=crop&q=80&w=400', lyrics: "There is honey in the rock...", chords: "[D] [A] [G]" },
    { id: 'same-god', title: 'Same God', artist: 'Elevation Worship', category: 'worship', duration: '7:15', plays: '1.7M', img: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80&w=400', lyrics: "I'm calling on the God of Jacob...", chords: "[C] [G] [Am] [F]" },
    { id: 'lord-i-need-you', title: 'Lord I Need You', artist: 'Matt Maher', category: 'worship', duration: '4:15', plays: '3.5M', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400', lyrics: "Lord I come, I confess...", chords: "[G] [C] [D] [Em]" },
    { id: 'because-he-lives', title: 'Because He Lives', artist: 'Gaither', category: 'hymns', duration: '4:30', plays: '2.8M', img: 'https://images.unsplash.com/photo-1542557476-c775fc4c77d0?auto=format&fit=crop&q=80&w=400', lyrics: "God sent His Son, they called Him Jesus...", chords: "[G] [C] [D]" },
    { id: 'blessed-assurance', title: 'Blessed Assurance', artist: 'Hymn', category: 'hymns', duration: '3:45', plays: '1.5M', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400', lyrics: "Blessed assurance, Jesus is mine...", chords: "[C] [F] [G]" },
    { id: 'how-great-thou-art', title: 'How Great Thou Art', artist: 'Hymn', category: 'hymns', duration: '5:20', plays: '4.0M', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400', lyrics: "O Lord my God, when I in awesome wonder...", chords: "[G] [C] [D]" },
    { id: 'it-is-well', title: 'It Is Well', artist: 'Bethel Music', category: 'hymns', duration: '6:00', plays: '3.2M', img: 'https://images.unsplash.com/photo-1621360841012-3f62afa2e9c2?auto=format&fit=crop&q=80&w=400', lyrics: "When peace like a river...", chords: "[C] [G] [Am] [F]" },
    { id: 'living-hope', title: 'Living Hope', artist: 'Phil Wickham', category: 'contemporary', duration: '5:10', plays: '2.6M', img: 'https://images.unsplash.com/photo-1507838153414-b4b713384ebd?auto=format&fit=crop&q=80&w=400', lyrics: "How great the chasm that lay between us...", chords: "[D] [G] [A] [Bm]" },
    { id: 'king-of-my-heart', title: 'King Of My Heart', artist: 'Bethel Music', category: 'worship', duration: '5:30', plays: '1.9M', img: 'https://images.unsplash.com/photo-1525926477800-7a3be58ab299?auto=format&fit=crop&q=80&w=400', lyrics: "Let the King of my heart be the mountain where I run...", chords: "[G] [C] [Em] [D]" },
    { id: 'good-good-father', title: 'Good Good Father', artist: 'Chris Tomlin', category: 'worship', duration: '4:50', plays: '4.5M', img: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400', lyrics: "I've heard a thousand stories...", chords: "[D] [G] [A] [Bm]" },
    { id: 'who-you-say-i-am', title: 'Who You Say I Am', artist: 'Hillsong', category: 'praise', duration: '5:15', plays: '3.6M', img: 'https://images.unsplash.com/photo-1506157786151-b8491531e1ec?auto=format&fit=crop&q=80&w=400', lyrics: "Who am I that the highest King...", chords: "[G] [Em] [D] [C]" },
    { id: 'run-to-the-father', title: 'Run To The Father', artist: 'Cody Carnes', category: 'worship', duration: '6:00', plays: '1.1M', img: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=400', lyrics: "I've carried a burden for too long...", chords: "[C] [G] [Am] [F]" },
    { id: 'available', title: 'Available', artist: 'Elevation Worship', category: 'praise', duration: '6:30', plays: '800k', img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=400', lyrics: "Narrow as the road may be...", chords: "[G] [D] [Em] [C]" },
    { id: 'hymn-of-heaven', title: 'Hymn Of Heaven', artist: 'Phil Wickham', category: 'hymns', duration: '5:45', plays: '900k', img: 'https://images.unsplash.com/photo-1459749411177-33481156047b?auto=format&fit=crop&q=80&w=400', lyrics: "How I long to breathe the air of Heaven...", chords: "[D] [A] [G] [Bm]" },
    { id: 'this-i-believe', title: 'This I Believe', artist: 'Hillsong', category: 'praise', duration: '6:10', plays: '2.5M', img: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80&w=400', lyrics: "Our Father everlasting...", chords: "[C] [G] [Am] [F]" },
    { id: 'worthy-is-the-lamb', title: 'Worthy Is The Lamb', artist: 'Hillsong', category: 'worship', duration: '5:50', plays: '3.0M', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400', lyrics: "Thank You for the cross Lord...", chords: "[G] [D] [C]" },
    { id: 'holy-spirit', title: 'Holy Spirit', artist: 'Francesca Battistelli', category: 'worship', duration: '4:45', plays: '2.8M', img: 'https://images.unsplash.com/photo-1507838153414-b4b713384ebd?auto=format&fit=crop&q=80&w=400', lyrics: "Holy Spirit You are welcome here...", chords: "[D] [G] [Em] [A]" },
    { id: 'forever', title: 'Forever', artist: 'Kari Jobe', category: 'worship', duration: '6:30', plays: '2.1M', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400', lyrics: "The moon and stars they wept...", chords: "[G] [D] [Em] [C]" },
    { id: 'do-it-again', title: 'Do It Again', artist: 'Elevation Worship', category: 'worship', duration: '6:15', plays: '2.4M', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400', lyrics: "Walking around these walls...", chords: "[A] [D] [E]" },
    { id: 'resurrecting', title: 'Resurrecting', artist: 'Elevation Worship', category: 'praise', duration: '7:45', plays: '1.8M', img: 'https://images.unsplash.com/photo-1542557476-c775fc4c77d0?auto=format&fit=crop&q=80&w=400', lyrics: "The head that once was crowned with thorns...", chords: "[G] [C] [D] [Em]" },
    { id: 'no-longer-slaves', title: 'No Longer Slaves', artist: 'Bethel Music', category: 'worship', duration: '6:00', plays: '3.5M', img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=400', lyrics: "You unravel me with a melody...", chords: "[G] [C] [D]" },
    { id: 'the-blessing', title: 'The Blessing', artist: 'Elevation / Kari Jobe', category: 'worship', duration: '8:30', plays: '4.0M', img: 'https://images.unsplash.com/photo-1525926477800-7a3be58ab299?auto=format&fit=crop&q=80&w=400', lyrics: "The Lord bless you and keep you...", chords: "[G] [C] [Em] [D]" },
    { id: 'way-maker-hindi', title: 'Raasta Banaye', artist: 'Leeland (Hindi)', category: 'hindi', duration: '5:12', plays: '500k', img: 'https://images.unsplash.com/photo-1621360841012-3f62afa2e9c2?auto=format&fit=crop&q=80&w=400', lyrics: "Tum yahan ho, chal rahe ho...", chords: "[F] [C] [G] [Am]" },
    { id: 'a-child-of-god', title: 'Child Of God', artist: 'Hillsong', category: 'kids', duration: '3:30', plays: '1.0M', img: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&q=80&w=400', lyrics: "I am a child of God...", chords: "[G] [C] [D]" },
    { id: 'deep-cries-out', title: 'Deep Cries Out', artist: 'Bethel Kids', category: 'kids', duration: '3:45', plays: '1.2M', img: 'https://images.unsplash.com/photo-1506157786151-b8491531e1ec?auto=format&fit=crop&q=80&w=400', lyrics: "Deep cries out to deep...", chords: "[C] [G] [Am] [F]" },
    { id: 'peace', title: 'Peace', artist: 'Bethel Music', category: 'worship', duration: '5:00', plays: '900k', img: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&q=80&w=400', lyrics: "When my mind is out of control...", chords: "[D] [G] [A]" },
    { id: 'promises', title: 'Promises', artist: 'Maverick City', category: 'worship', duration: '8:15', plays: '1.6M', img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=400', lyrics: "God of Abraham...", chords: "[Bb] [Eb] [F] [Gm]" },
    { id: 'egypt', title: 'Egypt', artist: 'Cory Asbury', category: 'praise', duration: '5:45', plays: '1.3M', img: 'https://images.unsplash.com/photo-1459749411177-33481156047b?auto=format&fit=crop&q=80&w=400', lyrics: "I won't forget the wonder here...", chords: "[G] [C] [Em] [D]" },
    { id: 'firm-foundation-he-wont', title: 'Firm Foundation (He Wont)', artist: 'Maverick City', category: 'contemporary', duration: '6:00', plays: '1.4M', img: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&q=80&w=400', lyrics: "He won't fail...", chords: "[D] [G] [Bm] [A]" },
    { id: 'too-good-to-not-believe', title: 'Too Good To Not Believe', artist: 'Brandon Lake', category: 'worship', duration: '7:20', plays: '1.0M', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400', lyrics: "I've seen cancer disappear...", chords: "[C] [G] [Am] [F]" },
];
