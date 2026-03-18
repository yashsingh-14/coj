import { createClient } from '@supabase/supabase-js';

/**
 * Server-safe Supabase client — no session persistence, no browser APIs.
 * Use this in Server Components, API routes, sitemap.ts, etc.
 * 
 * For client components (auth, real-time), continue using supabaseClient.ts.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env variables missing!');
}

export const supabaseServer = createClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    }
);
