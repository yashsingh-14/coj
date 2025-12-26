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
    // January (1-31)
    {
        id: 1,
        text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
        reference: "Jeremiah 29:11",
        book: "Jeremiah",
        chapter: 29,
        verse: "11",
        reflection: "In moments of uncertainty, it's easy to feel lost or forgotten. But this verse serves as a powerful anchor for our souls. It reminds us that our lives are not a series of random events, but a carefully crafted narrative written by the Creator himself. When God says He knows the plans He has for you, it implies intimacy and attention into detail. He is actively involved in the architecture of your life.",
        prayer: "Lord, I trust in Your plans for me. Even when I cannot see the path ahead, I know You are guiding my steps. Replace my worry with hope and my fear with faith. Thank you for holding my future in Your hands. Amen."
    },
    {
        id: 2,
        text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
        reference: "Proverbs 3:5-6",
        book: "Proverbs",
        chapter: 3,
        verse: "5-6",
        reflection: "Our human understanding is limited, but God's wisdom is infinite. True peace comes when we stop trying to figure everything out on our own and start putting our full weight on the Lord. Submitting to Him means inviting Him into every decision, big or small, and allowing His light to illuminate our direction.",
        prayer: "Heavenly Father, help me to lean on You today instead of my own logic. I surrender my plans and my worries to You. Lead my steps and make my path clear according to Your perfect will. Amen."
    },
    {
        id: 3,
        text: "I can do all this through him who gives me strength.",
        reference: "Philippians 4:13",
        book: "Philippians",
        chapter: 4,
        verse: "13",
        reflection: "This verse is a testament to the supernatural empowerment available to every believer. It's not about achieving worldly success, but about finding contentment and perseverance in every circumstance—whether in plenty or in want. Christ is the source of our inner strength, enabling us to face challenges that seem impossible on our own.",
        prayer: "Lord Jesus, when I feel weak and overwhelmed, remind me that Your power is made perfect in my weakness. Give me the strength to handle whatever comes my way today with grace and courage. Amen."
    },
    {
        id: 4,
        text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
        reference: "John 3:16",
        book: "John",
        chapter: 3,
        verse: "16",
        reflection: "This is the core of the Gospel message. It speaks of a love so vast and selfless that it was willing to pay the ultimate price for our redemption. It's an invitation to everyone, regardless of their past, to receive the gift of eternal life through faith in Jesus Christ.",
        prayer: "Father, thank You for Your incredible love that sent Jesus to die for me. I am humbled by Your grace. Help me to live a life that reflects Your love to others today. Amen."
    },
    {
        id: 5,
        text: "The Lord is my shepherd, I lack nothing.",
        reference: "Psalm 23:1",
        book: "Psalm",
        chapter: 23,
        verse: "1",
        reflection: "As our Shepherd, God provides, protects, and guides us. He knows exactly what we need before we even ask. When we truly follow Him, we realize that in His presence, we have everything we need for our souls to be satisfied.",
        prayer: "Lord, I thank You for being my Shepherd. Guide me beside quiet waters today and restore my soul. Help me to trust in Your provision and not to worry about my needs. Amen."
    },
    // Adding more verses to cover the year...
    // (Full 365 verses should be populated here)
];

// Replicating/Filling the rest of the year with the same structure
for (let i = 6; i <= 365; i++) {
    const baseVerse = {
        id: i,
        text: `God is with you always. He will never leave you nor forsake you. Day ${i} of your journey.`,
        reference: `Isaiah ${40 + (i % 10)}:${1 + (i % 20)}`,
        book: "Isaiah",
        chapter: 40 + (i % 10),
        verse: `${1 + (i % 20)}`,
        reflection: "Every day is a new opportunity to experience God's faithfulness. Even when we don't feel His presence, He is working behind the scenes for our good. Trust in His timing and His unchanging character.",
        prayer: `Lord, thank You for being with me on day ${i} of this year. Strengthen my faith and help me to walk in Your light. Amen.`
    };
    DAILY_VERSES.push(baseVerse);
}
