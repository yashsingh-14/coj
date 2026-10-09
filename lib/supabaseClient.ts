
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env variables missing!')
}

export const supabase = createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        auth: {
            // Bypass Web Locks to prevent hanging indefinitely in mobile browsers / PWAs
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
                if (typeof fn === 'function') return await fn();
            },
        }
    }
)
