import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const isOpenRouter = apiKey?.startsWith('sk-or-');

const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
});

// export const runtime = 'edge'; // Removed to ensure better compatibility with all env vars and libraries in Node

export async function POST(req: Request) {
    console.log("-----------------------------------------");
    console.log("API: /api/generate-song Call Started");

    try {
        const body = await req.json();
        const { songName, artist } = body;
        console.log("Request for:", songName, artist || "(No Artist)");

        if (!songName) {
            console.log("Error: No Song Name");
            return NextResponse.json({ error: 'Song Name is required' }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.error("CRITICAL ERROR: OPENAI_API_KEY is missing in process.env");
            return NextResponse.json({ error: 'Server API Key missing. Did you restart the server?' }, { status: 500 });
        }

        console.log("API Key present:", process.env.OPENAI_API_KEY.substring(0, 10) + "...");
        console.log("Provider:", isOpenRouter ? "OpenRouter" : "Standard OpenAI");
        console.log("Model:", isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini');

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

    OUTPUT FORMAT (PLAIN TEXT ONLY, NO JSON):
    Title: [Song Title]
    Artist: [Artist Name]
    Key: [Key]
    Tempo: [BPM]
    YoutubeID: [Video ID]
    Image: [URL]
    
    ===CHORDS===
    [Full chords with lyrics content here. standard chord-over-lyric or bracketed style.]
    
    ===LYRICS===
    [Full lyrics content here. plain text.]
    `;

        console.log("Sending request to AI with PLAIN TEXT prompt (v5)...");

        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a precise data extractor. Output formatted plain text as requested.' },
                { role: 'user', content: prompt }
            ],
            model: isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
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

        // Manual Parsing of Custom Format with Flexible Regex
        const getField = (key: string) => {
            // Match "Key: Value" case insensitive
            const regex = new RegExp(`${key}\\s*:\\s*(.*)`, 'i');
            const match = content.match(regex);
            if (match && match[1]) return match[1].trim();
            console.log(`getField: Key "${key}" not found.`);
            return "";
        };

        const getSection = (name: string) => {
            // Match === NAME === with flexible spaces
            const startRegex = new RegExp(`===\\s*${name}\\s*===`, 'i');
            const startMatch = content.match(startRegex);

            if (!startMatch) {
                console.log(`getSection: Start tag for "${name}" not found.`);
                return "";
            }

            const startIndex = startMatch.index! + startMatch[0].length;
            let sectionContent = content.substring(startIndex);

            // Find next section header (=== ANY ===)
            const nextSectionRegex = /===\s*[A-Z]+\s*===/i;
            const nextMatch = sectionContent.match(nextSectionRegex);

            if (nextMatch && nextMatch.index !== undefined) {
                sectionContent = sectionContent.substring(0, nextMatch.index);
            }

            console.log(`getSection: Found section "${name}", length: ${sectionContent.trim().length}`);
            return sectionContent.trim();
        };

        const songData = {
            title: getField("Title"),
            artist: getField("Artist"),
            key: getField("Key"),
            tempo: getField("Tempo"),
            youtube_id: getField("YoutubeID") || getField("Youtube ID"), // Handle variation
            img: getField("Image") || getField("Img"),
            chords: getSection("CHORDS"),
            lyrics: getSection("LYRICS")
        };

        console.log("Parsed Song Data:", JSON.stringify(songData, null, 2)); // Debug log

        return NextResponse.json(songData);

    } catch (error: any) {
        console.error('AI Generation API Error:', error);
        console.error('Error Details:', JSON.stringify(error, null, 2));

        return NextResponse.json(
            { error: error.message || 'Failed to generate song data', details: error.toString() },
            { status: 500 }
        );
    }
}
