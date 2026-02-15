import { z } from 'zod';

// Song Validation Schema
export const songSchema = z.object({
    title: z.string()
        .min(1, 'Title is required')
        .max(200, 'Title too long')
        .trim(),

    artist: z.string()
        .max(100, 'Artist name too long')
        .trim()
        .optional(),

    category: z.enum(['worship', 'praise', 'hymns', 'kids', 'contemporary'])
        .default('worship'),

    key: z.string()
        .max(10, 'Key too long')
        .trim()
        .optional(),

    tempo: z.string()
        .max(10, 'Tempo too long')
        .trim()
        .optional(),

    youtube_id: z.string()
        .max(50, 'YouTube ID too long')
        .trim()
        .optional(),

    img: z.string()
        .url('Invalid image URL')
        .optional()
        .or(z.literal('')),

    lyrics: z.string()
        .min(1, 'Lyrics are required')
        .max(10000, 'Lyrics too long'),

    hindi_lyrics: z.string()
        .max(10000, 'Hindi lyrics too long')
        .optional()
        .nullable(),

    chords: z.string()
        .max(10000, 'Chords too long')
        .optional()
        .nullable(),
});

// AI Generation Request Schema
export const aiGenerateSchema = z.object({
    songName: z.string()
        .min(1, 'Song name is required')
        .max(200, 'Song name too long')
        .trim(),

    artist: z.string()
        .max(100, 'Artist name too long')
        .trim()
        .optional(),

    useHighAccuracy: z.boolean()
        .default(false),
});

// Type exports
export type SongInput = z.infer<typeof songSchema>;
export type AIGenerateInput = z.infer<typeof aiGenerateSchema>;
