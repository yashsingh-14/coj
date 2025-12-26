export interface BibleVerse {
    id: number;
    text: string;
    reference: string;
    book: string;
    chapter: number;
    verse: string;
    reflection: string;
    prayer: string;
}

export const DAILY_VERSES: BibleVerse[] = [
    {
        id: 1,
        text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
        reference: "Jeremiah 29:11",
        book: "Jeremiah", chapter: 29, verse: "11",
        reflection: "In moments of uncertainty, it's easy to feel lost or forgotten. But this verse serves as a powerful anchor for our souls. It reminds us that our lives are not a series of random events, but a carefully crafted narrative written by the Creator himself.",
        prayer: "Lord, I trust in Your plans for me. Even when I cannot see the path ahead, I know You are guiding my steps. Amen."
    },
    {
        id: 2,
        text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
        reference: "Proverbs 3:5-6",
        book: "Proverbs", chapter: 3, verse: "5-6",
        reflection: "Our human understanding is limited, but God's wisdom is infinite. True peace comes when we stop trying to figure everything out on our own and start putting our full weight on the Lord.",
        prayer: "Heavenly Father, help me to lean on You today instead of my own logic. Lead my steps and make my path clear. Amen."
    },
    {
        id: 3,
        text: "I can do all this through him who gives me strength.",
        reference: "Philippians 4:13",
        book: "Philippians", chapter: 4, verse: "13",
        reflection: "Christ is the source of our inner strength, enabling us to face challenges that seem impossible on our own. This strength is available to you today.",
        prayer: "Lord Jesus, when I feel weak, remind me that Your power is made perfect in my weakness. Give me the strength I need. Amen."
    },
    {
        id: 4,
        text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
        reference: "John 3:16",
        book: "John", chapter: 3, verse: "16",
        reflection: "This is the core of the Gospel message—a love so vast that it was willing to pay the ultimate price for our redemption.",
        prayer: "Father, thank You for Your incredible love that sent Jesus to die for me. Help me to live in the light of that love today. Amen."
    },
    {
        id: 5,
        text: "The Lord is my shepherd, I lack nothing.",
        reference: "Psalm 23:1",
        book: "Psalm", chapter: 23, verse: "1",
        reflection: "As our Shepherd, God provides, protects, and guides us. In His presence, we find everything we need for our souls to be satisfied.",
        prayer: "Lord, thank You for being my Shepherd. Guide me today and help me to trust in Your provision. Amen."
    },
    {
        id: 6,
        text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
        reference: "Joshua 1:9",
        book: "Joshua", chapter: 1, verse: "9",
        reflection: "Fear and discouragement are natural, but God's presence is our constant companion. You are never alone in your battles.",
        prayer: "Lord, give me the courage to face today's challenges. Remind me that You are with me every step of the way. Amen."
    },
    {
        id: 7,
        text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
        reference: "Romans 8:28",
        book: "Romans", chapter: 8, verse: "28",
        reflection: "God can take even the most difficult situations and weave them into something beautiful for His glory and our growth.",
        prayer: "Father, I trust that You are working everything for my good. Even when I don't understand, I trust Your heart. Amen."
    },
    {
        id: 8,
        text: "Cast all your anxiety on him because he cares for you.",
        reference: "1 Peter 5:7",
        book: "1 Peter", chapter: 5, verse: "7",
        reflection: "You weren't meant to carry the weight of the world. God invites you to hand over your worries to Him because He deeply loves you.",
        prayer: "Lord, I hand over my anxieties and worries to You today. Thank You for caring for me so deeply. Amen."
    },
    {
        id: 9,
        text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.",
        reference: "Isaiah 40:31",
        book: "Isaiah", chapter: 40, verse: "31",
        reflection: "When we wait on God and put our hope in Him, He provides a supernatural energy that goes beyond our human endurance.",
        prayer: "Lord, renew my strength today. Help me to keep my eyes on You and to soar above life's difficulties. Amen."
    },
    {
        id: 10,
        text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
        reference: "Psalm 34:18",
        book: "Psalm", chapter: 34, verse: "18",
        reflection: "In your deepest pain, God is not distant. He is right there beside you, offering comfort and healing to your wounded spirit.",
        prayer: "Lord, reach out to my heart today. Comfort me where I am hurting and remind me of Your near presence. Amen."
    }
];

// Dynamically fill remaining days up to 365 to ensure no gaps
for (let i = DAILY_VERSES.length + 1; i <= 365; i++) {
    const backupVerses = [
        { text: "The Lord bless you and keep you.", ref: "Numbers 6:24", book: "Numbers", ch: 6, v: "24" },
        { text: "God is our refuge and strength.", ref: "Psalm 46:1", book: "Psalm", ch: 46, v: "1" },
        { text: "Your word is a lamp for my feet.", ref: "Psalm 119:105", book: "Psalm", ch: 119, v: "105" },
        { text: "Give thanks to the Lord, for he is good.", ref: "Psalm 136:1", book: "Psalm", ch: 136, v: "1" },
        { text: "The joy of the Lord is your strength.", ref: "Nehemiah 8:10", book: "Nehemiah", ch: 8, v: "10" }
    ];
    const pick = backupVerses[i % backupVerses.length];
    DAILY_VERSES.push({
        id: i,
        text: pick.text,
        reference: pick.ref,
        book: pick.book, chapter: pick.ch, verse: pick.v,
        reflection: "God's promises are new every morning. This verse is a reminder of His constant love and guidance for your life today.",
        prayer: "Lord, thank You for Your Word today. Let it guide my heart and mind as I walk through this day. Amen."
    });
}
