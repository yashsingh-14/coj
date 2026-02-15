import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const apiKey = process.env.OPENAI_API_KEY;
const isOpenRouter = apiKey?.startsWith('sk-or-');

const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
});

// Rate Limiting Setup
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'coj:ratelimit',
});

// export const runtime = 'edge'; // Removed to ensure better compatibility with all env vars and libraries in Node

export async function POST(req: Request) {
    try {
        // Rate Limiting Check
        const identifier = req.headers.get('x-forwarded-for') ?? 'anonymous';
        const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

        if (!success) {
            console.log(`Rate limit exceeded for ${identifier}`);
            return NextResponse.json(
                {
                    error: 'Too many requests. Please try again later.',
                    limit,
                    remaining,
                    reset: new Date(reset).toISOString()
                },
                { status: 429 }
            );
        }

        console.log(`Rate limit OK: ${remaining}/${limit} remaining`);

        // Input Validation
        const body = await req.json();

        // Import validation schema
        const { aiGenerateSchema } = await import('@/lib/validations');

        // Validate and sanitize input
        const validationResult = aiGenerateSchema.safeParse(body);

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map((e: any) => e.message).join(', ');
            console.log('Validation Error:', errors);
            return NextResponse.json(
                { error: `Invalid input: ${errors}` },
                { status: 400 }
            );
        }

        const { songName, artist, useHighAccuracy } = validationResult.data;
        console.log("Request for:", songName, artist || "(No Artist)", "High Accuracy:", useHighAccuracy);

        if (!process.env.OPENAI_API_KEY) {
            console.error("CRITICAL ERROR: OPENAI_API_KEY is missing in process.env");
            return NextResponse.json({ error: 'Server API Key missing. Did you restart the server?' }, { status: 500 });
        }

        console.log("API Key present:", process.env.OPENAI_API_KEY.substring(0, 10) + "...");
        console.log("Provider:", isOpenRouter ? "OpenRouter" : "Standard OpenAI");

        // Model Selection Logic
        let model = 'gpt-4o-mini'; // Default fallback
        if (isOpenRouter) {
            if (useHighAccuracy) {
                // Paid, Search-enabled model
                model = 'perplexity/sonar';
            } else {
                // Free/Cheap model
                // Reverting to Gemini Flash as Llama was too slow/inaccurate for Hindi
                model = 'google/gemini-2.0-flash-exp:free';
            }
        }

        console.log("Selected Model:", model);

        const prompt = `
    Role: You are an expert Music Database and Worship Leader Assistant.
    Task: precise transcription of song metadata, lyrics, and chords.

    Input Song: "${songName}"
    ${artist ? `Target Artist: "${artist}"` : 'Note: No artist provided. Identify the MOST POPULAR and WIDELY KNOWN worship version of this song.'}

    REQUIREMENTS:
    1. ACCURACY: Provide the OFFICIAL lyrics and standard chords for this specific song. Do not hallucinate.
    2. COMPLETENESS: You MUST provide the FULL song.
    3. MEDIA:
       - Youtube ID: Official Video ID.
       - Image: Album Art URL.
    4. HINDI SUPPORT:
       - If the song is Hindi, providing the lyrics in Devanagari script is MANDATORY.
       - If the song is English (or other), YOU MUST GENERATE a literal Hindi translation (Devanagari script) line-by-line. This is MANDATORY. Do not leave blank.

    OUTPUT FORMAT (PLAIN TEXT ONLY, NO JSON):
    Title: [Song Title]
    Artist: [Artist Name]
    Key: [Key]
    Tempo: [BPM]
    YoutubeID: [Video ID]
    Image: [URL]
    
    ===CHORDS===
    [Include Section Headers in brackets like [Verse 1], [Chorus], [Bridge]]
    [Use standard "Chord Over Lyric" format. Place chords on their own line ABOVE the lyrics. Align them with the specific word they change on.]
    [Do NOT use bracketed chords inline like [G]. Use plain text chords spaced out with whitespace.]
    
    Example Format:
    [Verse 1]
    G             C             G
    Amazing grace how sweet the sound
    
    [Chorus]
    G             C     D
    My chains are gone, I've been set free
    
    IMPORTANT: You MUST use the Chord-Over-Lyric format. Do NOT use brackets [] for chords. Only use brackets for [Sections].
    
    ===LYRICS===
    [Plain lyrics only, no chords]
    [Full lyrics content here. plain text with section headers]

    ===HINDI_LYRICS===
    [Translate the FULL song into Hindi (Devanagari Script). This is MANDATORY.]
    [ STRICTLY NO LATIN CHARACTERS / NO HINGLISH. ]
    [ Example: Do NOT write "Zinda". Write "ज़िंदा". ]
    [ Ensure every single word is in Devanagari script. ]
    [If original is English, PROVIDE A LITERAL HINDI TRANSLATION.]
    [Do NOT leave this empty.]
    `;

        console.log("Sending request to AI with PLAIN TEXT prompt (v5)...");

        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a precise data extractor. Output formatted plain text as requested.' },
                { role: 'user', content: prompt }
            ],
            // Use selected model
            model: model,
            // no response_format needed for text
            temperature: 0.1,
            max_tokens: 4000,
        }, {
            headers: isOpenRouter ? {
                "HTTP-Referer": "https://localhost:3000",
                "X-Title": "LocalDev"
            } : undefined
        });

        console.log("AI Response received.");
        const content = completion.choices[0].message.content;

        if (!content) throw new Error('No content received from AI');

        console.log("Raw Content (first 200 chars):", content.substring(0, 200) + "...");

        // --- CUSTOM TEXT PARSER ---
        const getField = (key: string) => {
            // Matches "Key: Value" case-insensitive
            const regex = new RegExp(`${key}:\\s*(.+)`, 'i');
            const match = content.match(regex);
            return match ? match[1].trim() : '';
        };

        const getSection = (name: string) => {
            // Permissive Regex: matches === *NAME* ===
            // This allows "=== HINDI LYRICS ===" or "===HINDI_LYRICS===" or "=== HINDI ==="
            const regex = new RegExp(`===\\s*.*${name}.*\\s*===\\s*([\\s\\S]*?)(?=\\n==|$)`, 'i');
            const match = content.match(regex);

            if (match && match[1]) {
                return match[1].trim();
            }
            console.log(`getSection: No match found for section "${name}"`);

            // Fallback for HINDI specifically if strict text match fails
            if (name === "HINDI_LYRICS") {
                // Try looking for just "HINDI" or "TRANSLATION" block if exact match fails
                const fallbackRegex = /===\s*(HINDI|TRANSLATION)\s*===\s*([\s\S]*?)(?=\n==|$)/i;
                const fallbackMatch = content.match(fallbackRegex);
                if (fallbackMatch && fallbackMatch[2]) return fallbackMatch[2].trim();
            }

            return "";
        };

        const songData = {
            title: getField("Title"),
            artist: getField("Artist"),
            key: getField("Key"),
            tempo: getField("Tempo"),
            youtube_id: getField("YoutubeID") || getField("Youtube ID"),
            img: getField("Image") || getField("Img"),
            chords: getSection("CHORDS"),
            lyrics: getSection("LYRICS"),
            hindi_lyrics: getSection("HINDI_LYRICS") // Extracted from ===HINDI_LYRICS===
        };

        console.log("Parsed Song Data:", JSON.stringify(songData, null, 2));

        return NextResponse.json(songData);

    } catch (error: any) {
        console.error('AI Generation API Error:', error);

        // Import error handler
        const { handleError, ExternalAPIError } = await import('@/lib/errors');

        // Handle specific errors
        if (error.message?.includes('API') || error.message?.includes('network')) {
            const apiError = new ExternalAPIError('OpenRouter/OpenAI', error.message);
            const errorInfo = handleError(apiError);
            return NextResponse.json(
                { error: errorInfo.userMessage, details: errorInfo.message },
                { status: errorInfo.statusCode }
            );
        }

        // Handle generic errors
        const errorInfo = handleError(error);
        return NextResponse.json(
            { error: errorInfo.userMessage, details: errorInfo.message },
            { status: errorInfo.statusCode }
        );
    }
}
