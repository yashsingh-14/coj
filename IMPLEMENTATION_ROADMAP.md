# COJ Project - Complete Implementation Roadmap

> **Purpose:** This document contains ALL pending fixes, improvements, and features for the COJ (Call of Jesus) worship platform. Any AI assistant can use this to understand what needs to be done.

---

## 📋 Project Context

**Project:** Call of Jesus (COJ) - Modern Christian Worship Platform  
**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Supabase, GSAP, Three.js, Zustand  
**Deployment:** Vercel  
**Current Status:** Functional but needs production-ready improvements

---

## 🎯 Implementation Phases

### **PHASE 1: Critical Security & Stability Fixes (2 days)**
**Priority:** URGENT - Must fix before public launch

#### 1.1 Rate Limiting on AI API
**File:** `app/api/generate-song/route.ts`  
**Problem:** No rate limiting - anyone can spam AI requests and exhaust credits  
**Solution:**
- Install: `npm install @upstash/ratelimit @upstash/redis`
- Add rate limiting middleware
- Limit: 5 requests per minute per IP
- Return 429 status when exceeded

**Implementation Steps:**
```typescript
// Add at top of route.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
});

// In POST function, before AI call:
const identifier = req.headers.get("x-forwarded-for") ?? "anonymous";
const { success } = await ratelimit.limit(identifier);
if (!success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}
```

**Environment Variables Needed:**
```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

#### 1.2 Input Validation & Sanitization
**Files:** 
- `components/admin/SongForm.tsx`
- `app/api/generate-song/route.ts`

**Problem:** No input validation - XSS attacks possible  
**Solution:**
- Install: `npm install zod`
- Create validation schemas
- Sanitize all user inputs

**Implementation:**
```typescript
// lib/validations.ts (NEW FILE)
import { z } from 'zod';

export const songSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  artist: z.string().max(100).trim().optional(),
  lyrics: z.string().min(1).max(10000),
  chords: z.string().max(10000).optional(),
  key: z.string().max(10).optional(),
  tempo: z.string().max(10).optional(),
  youtube_id: z.string().max(50).optional(),
});

// Use in API routes:
const validatedData = songSchema.parse(body);
```

---

#### 1.3 Comprehensive Error Handling
**Files:** All API routes and components

**Problem:** Generic error messages, no user-friendly feedback  
**Solution:**
- Add try-catch blocks everywhere
- Create custom error messages
- Log errors properly

**Implementation:**
```typescript
// lib/errors.ts (NEW FILE)
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public userMessage: string = "Something went wrong"
  ) {
    super(message);
  }
}

// Usage in API routes:
try {
  // ... code
} catch (error) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.userMessage },
      { status: error.statusCode }
    );
  }
  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 }
  );
}
```

---

#### 1.4 Loading States & User Feedback
**Files:**
- `components/admin/SongForm.tsx`
- `components/songs/SongViewer.tsx`

**Problem:** No loading indicators during AI generation  
**Solution:**
- Add loading spinners
- Show progress messages
- Disable buttons during loading

**Implementation:**
```typescript
// In SongForm.tsx
const [isGenerating, setIsGenerating] = useState(false);
const [progress, setProgress] = useState("");

const handleGenerate = async () => {
  setIsGenerating(true);
  setProgress("Connecting to AI...");
  
  try {
    setProgress("Generating song data...");
    const response = await fetch('/api/generate-song', {...});
    setProgress("Processing response...");
    // ... rest of code
  } finally {
    setIsGenerating(false);
    setProgress("");
  }
};

// UI:
{isGenerating && (
  <div className="flex items-center gap-2">
    <Loader2 className="animate-spin" />
    <span>{progress}</span>
  </div>
)}
```

---

#### 1.5 Image Optimization
**Files:** All components using images

**Problem:** Images load slowly, not optimized  
**Solution:**
- Replace `<img>` with Next.js `<Image>`
- Add proper width/height
- Enable lazy loading

**Implementation:**
```typescript
// Replace all instances of:
<img src={song.img} alt={song.title} />

// With:
import Image from 'next/image';

<Image 
  src={song.img} 
  alt={song.title}
  width={400}
  height={400}
  className="..."
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/svg+xml;base64,..." // Add blur placeholder
/>
```

---

### **PHASE 2: Performance & UX Improvements (5 days)**

#### 2.1 Error Tracking with Sentry
**Installation:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configuration:**
```typescript
// sentry.client.config.ts (AUTO-GENERATED)
// sentry.server.config.ts (AUTO-GENERATED)
// Add DSN from Sentry dashboard
```

**Environment Variable:**
```
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

---

#### 2.2 Search Improvements
**File:** `app/songs/page.tsx`

**Improvements Needed:**
1. **Search History** - Store in localStorage
2. **Search Suggestions** - Show as user types
3. **Debounced Search** - Reduce API calls

**Implementation:**
```typescript
// lib/hooks/useSearchHistory.ts (NEW FILE)
export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);
  
  const addToHistory = (query: string) => {
    const updated = [query, ...history.filter(h => h !== query)].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };
  
  return { history, addToHistory };
}

// Use debounce for search:
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback((value) => {
  performSearch(value);
}, 300);
```

---

#### 2.3 Better Offline Support
**File:** `public/sw.js`

**Improvements:**
- Cache more pages
- Add offline fallback page
- Implement background sync

**Implementation:**
```javascript
// Add to CACHE_URLS:
const CACHE_URLS = [
  '/',
  '/songs',
  '/artists',
  '/events',
  '/offline', // Create this page
  '/manifest.json',
  '/images/logo-footer-final.png',
  // Add common song pages
];

// Create app/offline/page.tsx:
export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1>You're Offline</h1>
        <p>Please check your internet connection</p>
      </div>
    </div>
  );
}
```

---

#### 2.4 Performance Optimization
**Files:** Multiple

**Tasks:**
1. **Code Splitting:**
```typescript
// Use dynamic imports for heavy components
const AdminPanel = dynamic(() => import('@/components/admin/AdminPanel'), {
  loading: () => <Loader />,
  ssr: false
});
```

2. **Bundle Analysis:**
```bash
npm install @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({...});
```

3. **Database Query Optimization:**
```typescript
// Add indexes in Supabase:
// - songs: title, artist_id
// - artists: name
// - categories: name

// Use select() to fetch only needed fields:
const { data } = await supabase
  .from('songs')
  .select('id, title, artist_id, img')
  .limit(20);
```

---

#### 2.5 Analytics Dashboard
**File:** `app/admin/analytics/page.tsx` (NEW)

**Features:**
- Total songs, artists, users
- Popular songs (most viewed)
- Recent activity
- Search trends

**Implementation:**
```typescript
// Create analytics table in Supabase:
CREATE TABLE analytics (
  id UUID PRIMARY KEY,
  event_type TEXT,
  song_id UUID REFERENCES songs(id),
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

// Track events:
export async function trackEvent(type: string, songId?: string) {
  await supabase.from('analytics').insert({
    event_type: type,
    song_id: songId,
    user_id: (await supabase.auth.getUser()).data.user?.id
  });
}

// Use in components:
useEffect(() => {
  trackEvent('song_view', song.id);
}, [song.id]);
```

---

### **PHASE 3: New Features (2 weeks)**

#### 3.1 Playlist Feature
**Files:** 
- `app/playlists/page.tsx` (NEW)
- `components/playlists/PlaylistCard.tsx` (NEW)

**Database Schema:**
```sql
CREATE TABLE playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE playlist_songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER,
  added_at TIMESTAMP DEFAULT NOW()
);
```

**Implementation:**
```typescript
// lib/playlists.ts (NEW FILE)
export async function createPlaylist(name: string, description?: string) {
  const { data, error } = await supabase
    .from('playlists')
    .insert({ name, description })
    .select()
    .single();
  return { data, error };
}

export async function addSongToPlaylist(playlistId: string, songId: string) {
  const { data, error } = await supabase
    .from('playlist_songs')
    .insert({ playlist_id: playlistId, song_id: songId });
  return { data, error };
}
```

---

#### 3.2 Social Sharing
**File:** `components/songs/ShareButton.tsx` (NEW)

**Features:**
- WhatsApp share
- Copy link
- Facebook share
- Twitter share

**Implementation:**
```typescript
export function ShareButton({ song }: { song: Song }) {
  const shareUrl = `${window.location.origin}/songs/${song.id}`;
  const shareText = `Check out "${song.title}" by ${song.artist}`;
  
  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
  };
  
  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied!');
  };
  
  return (
    <div className="flex gap-2">
      <button onClick={shareToWhatsApp}>WhatsApp</button>
      <button onClick={copyLink}>Copy Link</button>
    </div>
  );
}
```

---

#### 3.3 Print Functionality
**File:** `components/songs/PrintButton.tsx` (NEW)

**Implementation:**
```typescript
export function PrintButton({ song }: { song: Song }) {
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow?.document.write(`
      <html>
        <head>
          <title>${song.title} - Chords</title>
          <style>
            body { font-family: monospace; padding: 20px; }
            h1 { font-size: 24px; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>${song.title}</h1>
          <p>Artist: ${song.artist}</p>
          <p>Key: ${song.key}</p>
          <pre>${song.chords}</pre>
        </body>
      </html>
    `);
    printWindow?.print();
  };
  
  return <button onClick={handlePrint}>Print Chords</button>;
}
```

---

#### 3.4 Dark/Light Mode Toggle
**Files:**
- `app/layout.tsx`
- `components/ThemeToggle.tsx` (NEW)

**Implementation:**
```typescript
// Use next-themes
npm install next-themes

// app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// components/ThemeToggle.tsx
'use client';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

---

#### 3.5 Advanced Admin Features

**3.5.1 Bulk Operations**
**File:** `components/admin/BulkActions.tsx` (NEW)

```typescript
export function BulkActions({ selectedSongs }: { selectedSongs: string[] }) {
  const handleBulkDelete = async () => {
    await supabase.from('songs').delete().in('id', selectedSongs);
    toast.success(`${selectedSongs.length} songs deleted`);
  };
  
  const handleBulkExport = () => {
    // Export to JSON/CSV
  };
  
  return (
    <div>
      <button onClick={handleBulkDelete}>Delete Selected</button>
      <button onClick={handleBulkExport}>Export Selected</button>
    </div>
  );
}
```

**3.5.2 Song Preview**
**File:** `components/admin/SongPreview.tsx` (NEW)

```typescript
export function SongPreview({ songData }: { songData: Partial<Song> }) {
  return (
    <div className="border rounded-lg p-4">
      <h3>{songData.title}</h3>
      <p>{songData.artist}</p>
      <pre className="whitespace-pre-wrap">{songData.chords}</pre>
    </div>
  );
}
```

---

### **PHASE 4: Accessibility & Polish (1 week)**

#### 4.1 Keyboard Navigation
**Files:** All interactive components

**Implementation:**
```typescript
// Add keyboard handlers
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter') submitForm();
  if (e.key === 'ArrowUp') navigateUp();
  if (e.key === 'ArrowDown') navigateDown();
};

// Add tabIndex to focusable elements
<button tabIndex={0}>Click me</button>
```

---

#### 4.2 Screen Reader Support
**Files:** All components

**Implementation:**
```typescript
// Add ARIA labels
<button aria-label="Close modal">×</button>
<input aria-describedby="email-help" />
<div role="alert" aria-live="polite">{errorMessage}</div>

// Add semantic HTML
<nav aria-label="Main navigation">
<main>
<aside aria-label="Sidebar">
```

---

#### 4.3 Skeleton Loaders
**File:** `components/ui/SkeletonLoader.tsx` (NEW)

```typescript
export function SongCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-48 bg-gray-700 rounded-lg"></div>
      <div className="h-4 bg-gray-700 rounded mt-2 w-3/4"></div>
      <div className="h-4 bg-gray-700 rounded mt-2 w-1/2"></div>
    </div>
  );
}

// Usage:
{loading ? (
  <SongCardSkeleton />
) : (
  <SongCard song={song} />
)}
```

---

## 🔧 Bug Fixes

### Bug 1: Transpose Overflow
**File:** `lib/music.ts`

**Problem:** Excessive transposing breaks chords  
**Solution:**
```typescript
export function transposeChord(chord: string, semitones: number): string {
  // Limit transpose range to -11 to +11
  const limitedSemitones = Math.max(-11, Math.min(11, semitones));
  // ... rest of logic
}
```

---

### Bug 2: Hindi Lyrics Formatting
**File:** `components/songs/SongViewer.tsx`

**Problem:** Spacing issues in Hindi text  
**Solution:**
```typescript
<pre className="whitespace-pre-wrap font-hindi leading-relaxed">
  {song.hindi_lyrics}
</pre>

// Add to tailwind.config.js:
fontFamily: {
  hindi: ['Noto Sans Devanagari', 'sans-serif'],
}
```

---

### Bug 3: Service Worker Cache Issues
**File:** `public/sw.js`

**Problem:** Old versions cached  
**Solution:**
```javascript
// Update cache version on every deploy
const CACHE_VERSION = 'v2'; // Increment this
const CACHE_NAME = `coj-${CACHE_VERSION}`;

// Clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
```

---

## 📦 Dependencies to Install

```bash
# Phase 1
npm install @upstash/ratelimit @upstash/redis zod

# Phase 2
npm install @sentry/nextjs use-debounce @next/bundle-analyzer

# Phase 3
npm install next-themes

# Optional
npm install react-hot-toast  # Better toast notifications
npm install framer-motion    # Smooth animations
```

---

## 🌍 Environment Variables Needed

```env
# Existing
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=

# New - Phase 1
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# New - Phase 2
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# New - Phase 3 (Optional)
NEXT_PUBLIC_GA_ID=  # Google Analytics
```

---

## 📊 Testing Checklist

After each phase, test:

- [ ] All pages load without errors
- [ ] Admin panel functions work
- [ ] Song generation works
- [ ] Search works
- [ ] Offline mode works
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance is good (Lighthouse score > 90)

---

## 🚀 Deployment Steps

1. **Test locally:** `npm run dev`
2. **Build:** `npm run build`
3. **Check for errors:** Fix any build errors
4. **Deploy to Vercel:** `git push origin main`
5. **Test production:** Visit deployed URL
6. **Monitor errors:** Check Sentry dashboard

---

## 📝 Notes for Future AI Assistants

1. **Always read this file first** before making changes
2. **Follow the phase order** - don't skip critical fixes
3. **Test after each change** - don't break existing features
4. **Update this file** if you add new tasks
5. **Ask user for confirmation** before major changes

---

## 🎯 Current Priority

**START WITH PHASE 1** - These are critical security and stability fixes that must be done before public launch.

Estimated time: 2 days  
Impact: High  
Risk: Low

---

**Last Updated:** 2026-02-16  
**Document Version:** 1.0  
**Project Status:** In Development
