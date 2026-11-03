
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env variables missing!')
}

// 400 days in seconds (RFC 6265bis maximum allowable browser lifetime)
const COOKIE_MAX_AGE = 400 * 24 * 60 * 60;
const STORAGE_BACKUP_KEY = 'coj_sb_auth_backup';

function getBackupCookies(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem(STORAGE_BACKUP_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function saveBackupCookie(name: string, value: string) {
    if (typeof window === 'undefined') return;
    try {
        const current = getBackupCookies();
        if (value) {
            current[name] = value;
        } else {
            delete current[name];
        }
        localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify(current));
    } catch {}
}

function removeBackupCookie(name: string) {
    if (typeof window === 'undefined') return;
    try {
        const current = getBackupCookies();
        delete current[name];
        localStorage.setItem(STORAGE_BACKUP_KEY, JSON.stringify(current));
    } catch {}
}

function parseBrowserCookies(): { name: string; value: string }[] {
    if (typeof document === 'undefined') return [];
    const cookieStr = document.cookie || '';
    if (!cookieStr) return [];
    
    return cookieStr.split(';').map(c => {
        const parts = c.trim().split('=');
        const name = parts[0] ? parts[0].trim() : '';
        const value = parts.slice(1).join('=');
        return { name, value };
    }).filter(c => c.name.length > 0);
}

function setBrowserCookie(name: string, value: string, maxAge: number = COOKIE_MAX_AGE) {
    if (typeof document === 'undefined') return;
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureFlag = isHttps ? '; Secure' : '';
    document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secureFlag}`;
}

export const supabase = createBrowserClient(
    supabaseUrl || '',
    supabaseAnonKey || '',
    {
        cookieOptions: {
            maxAge: COOKIE_MAX_AGE,
            sameSite: 'lax',
            path: '/',
            secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
        },
        cookies: {
            getAll() {
                const liveCookies = parseBrowserCookies();
                const hasSupabaseCookie = liveCookies.some(c => c.name.includes('auth-token') || c.name.startsWith('sb-'));

                // If document.cookie has active supabase auth cookies, sync them to localStorage
                if (hasSupabaseCookie) {
                    liveCookies.forEach(c => {
                        if (c.name.includes('auth-token') || c.name.startsWith('sb-')) {
                            saveBackupCookie(c.name, c.value);
                        }
                    });
                    return liveCookies;
                }

                // If document.cookie lost the session (e.g. mobile browser restart / PWA clear), restore from localStorage!
                const backup = getBackupCookies();
                const backupEntries = Object.entries(backup);
                if (backupEntries.length > 0) {
                    backupEntries.forEach(([name, value]) => {
                        setBrowserCookie(name, value, COOKIE_MAX_AGE);
                        liveCookies.push({ name, value });
                    });
                }

                return liveCookies;
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    const maxAge = options?.maxAge !== undefined ? options.maxAge : COOKIE_MAX_AGE;
                    if (maxAge === 0 || !value) {
                        setBrowserCookie(name, '', 0);
                        removeBackupCookie(name);
                    } else {
                        setBrowserCookie(name, value, maxAge);
                        if (name.includes('auth-token') || name.startsWith('sb-')) {
                            saveBackupCookie(name, value);
                        }
                    }
                });
            }
        },
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            // Bypass Web Locks to prevent hanging indefinitely in mobile browsers / PWAs / background tabs
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
                if (typeof fn === 'function') {
                    return await fn();
                }
            },
        }
    }
)
