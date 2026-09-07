# 🕊️ Call of Jesus Ministries (COJ) — AI Master Handover & Architecture Guide

> **Important Note for Any AI / Developer Reading This Document:**
> This document is the single source of truth for the **Call of Jesus Ministries (COJ)** web platform. Read this entire document before writing any code. It details the architecture, design philosophy, file hierarchy, database models, work completed, known issues, and the exact next tasks to execute.

---

## 📌 1. Project Overview & Dual-Purpose Concept

**Project Name:** Call of Jesus Ministries Web Platform (`coj`)  
**Repository:** `yashsingh-14/coj`  
**Domain / Brand:** Call of Jesus Ministries (Senior Leader: Samson Wilson)  
**Location:** Gurugram / Delhi NCR, India  

The platform is designed with a **Dual-Purpose Architecture**:
1. **Church Spiritual Experience Portal (`/`)**: A cinematic, awe-inspiring landing page showcasing church mission, live gatherings, daily scripture, anointed sermon podcasts, believer testimonies (God Stories), and an online giving sanctuary.
2. **Worship Songs & Chords Utility Portal (`/worship`, `/songs`, `/categories/...`)**: A musician & believer tool with lyrics and chords in English & Hindi, real-time key transposer, audio pads, chord diagrams, and a Web Audio API guitar tuner.

---

## 🛠️ 2. Technology Stack & Key Libraries

| Layer | Technology | Purpose / Notes |
|---|---|---|
| **Framework** | **Next.js 16 (App Router)** | Next.js with Turbopack, React 19, Server Components for SEO & fast initial loads. |
| **Language** | **TypeScript** | Strict typing across components, database models, and API routes. |
| **Styling** | **Tailwind CSS + Vanilla CSS** | Custom CSS variables in `app/globals.css`, dark sanctuary palette, responsive utilities. |
| **Animations** | **GSAP 3 + ScrollTrigger + Lenis** | Hardware-accelerated entrance animations, kinetic typography, smooth scrolling via Lenis. |
| **3D Graphics** | **Three.js + @react-three/fiber + @react-three/drei** | Interactive 3D visuals and background particles. |
| **Database & Auth** | **Supabase (PostgreSQL)** | Client (`lib/supabaseClient.ts`) and Server (`lib/supabaseServer.ts`) clients. Handles songs, daily verses, events, announcements, and user favorites. |
| **State Management**| **Zustand (`store/useAppStore.ts`)** | Persistent global state (`mode`, `currentUser`, `preferences`). Persisted in localStorage key `coj-storage`. |
| **Icons** | **Lucide React** | Modern, lightweight icon suite. |
| **Rate Limiting** | **Upstash Redis (`@upstash/ratelimit`)** | API protection for song generation and notifications. |
| **Audio Processing**| **Web Audio API** | Pitch detection in `lib/pitchDetection.ts` for real-time guitar tuner. |

---

## 🎨 3. Design System & Aesthetics (STRICT RULES)

The website uses a **Golden Sanctuary & Holy Fire** aesthetic:
- **Base Backgrounds**: Deep midnight sanctuary tones (`#02000F`, `#070514`, `#0A071E`, `#000000`).
- **Primary Accents**: Divine Holy Flame & Gold (`#FFD700`, `amber-200`, `amber-300`, `amber-400`, `amber-500`, `#F59E0B`).
- **Secondary Accents**: Holy fire orange/crimson (`orange-500`, `red-500`) used selectively for badges, live indicators, or communion elements.
- **Typography**:
  - Headings / Quotes / Scripture: **Playfair Display** (italic, elegant, editorial serif).
  - Body / UI / Controls: **Inter / sans-serif** (clean, high legibility).
  - Lyrics: Supports Hindi Devanagari script cleanly alongside English.
- **Button Effects**: Interactive **Liquid Wave Filling Buttons** (animated wave SVG rising up on hover with golden glow).
- **Cards**: Glassmorphic 3D tilt cards with subtle white/gold borders (`border-white/10 hover:border-amber-400/50`) and backdrop blur (`backdrop-blur-2xl`).
- **Spacing Rule**: Avoid excessive voids! Maintain balanced section padding (`py-12 md:py-20`) so scrolling feels engaging and content-rich.

---

## 📂 4. Route Map & Component Architecture

### App Directory (`app/`)
- **`app/page.tsx`**: Root server route. Fetches initial data (trending songs, hero slides, today's verse, events, announcements) from Supabase and directly renders `<ExperienceOverlay initialData={...} />`.
- **`app/worship/page.tsx`**: Dedicated worship songs portal. Server route rendering `<HomeUtilityContent />`.
- **`app/songs/page.tsx`**: Catalog of worship songs with search, filters, and categories.
- **`app/songs/[slug]/page.tsx`**: Individual song viewer page (`components/songs/SongViewer.tsx`) with lyrics, chords transposer, capo, auto-scroll, pad synth, and video embed.
- **`app/categories/[slug]/page.tsx`**: Songs categorized by genre (`english-worship`, `hindi-worship`, `english-praise`, `hindi-praise`).
- **`app/give/page.tsx`**: Online giving and tithes page featuring QR code, UPI IDs, bank account details, and one-click copy toast.
- **`app/god-stories/page.tsx`**: Full collection of believer testimonies and miracles.
- **`app/our-vision-and-mission/page.tsx`**: Church mission, apostolic vision, and core spiritual beliefs.
- **`app/our-journey/page.tsx`**: History, milestones, and photo timeline of Call of Jesus Ministries.
- **`app/our-leaders/page.tsx`**: Pastoral leadership and Apostle Samson Wilson profile.
- **`app/our-branches/page.tsx`**: Offline church branch locations, addresses, and maps.
- **`app/share-testimony/page.tsx`**: Submission form for church members to share what God has done in their lives.
- **`app/sermons/page.tsx`**: Video sermon library with YouTube embeds.
- **`app/tools/tuner/page.tsx`**: Real-time microphone guitar tuner with pitch detection.
- **`app/tools/pad/page.tsx`**: Ambient worship infinity pad player.
- **`app/favourites/page.tsx`**: Bookmarked songs for logged-in users.
- **`app/profile/page.tsx`**: User settings and profile management.
- **`app/layout.tsx`**: Root HTML layout with font imports, metadata, and `<AppShell>{children}</AppShell>`.

---

### Core Components (`components/`)
1. **`components/hero/ExperienceOverlay.tsx`**:
   - The master Church Landing component (~1,800 lines).
   - Contains all sections of `/`:
     1. `#hero`: Cinematic dual-video slider (`coj video for hero annivercery.mp4` & `coj video.mp4`), kinetic headline, liquid CTA buttons.
     2. `#verse`: Verse of the Day glassmorphic card with audio recitation, sharing, and devotional links.
     3. `#gatherings`: Offline weekly services (Friday Bible Study, Sunday Worship, Communion) with Google Maps directions button.
     4. `#vision`: Two golden sanctuary pillar cards (*Set the Captives Free* & *Reign and Equip*).
     5. `#trending`: Horizontal scroll preview of trending worship songs.
     6. `#stories`: GOD Stories & miracles carousel with category pills, scripture anchors, and quote watermarks.
     7. `#testimony`: "Share Your Story" banner CTA.
     8. `#worship-cta`: "Enter Worship Portal" banner linking to `/worship`.
     9. `#podcasts`: Anointed sermons showcase.
     10. `#social`: YouTube, Instagram, Facebook, WhatsApp community links.
     11. `#newsletter`: Newsletter subscription form.
     12. `<footer>`: Global church footer with navigation columns, copyright, and golden brand reflection.

2. **`components/hero/LandingNavbar.tsx`**:
   - Fixed header on the landing page with backdrop blur.
   - Includes COJ Logo, "Grow" dropdown, "About" dropdown, "Watch Live" badge, "Give" button, and "Worship Chords" link.
   - Includes mobile drawer menu.

3. **`components/AppShell.tsx`**:
   - Wraps all pages.
   - Listens to Supabase auth state changes and syncs user session to Zustand.
   - Manages Theme (`dark` / `light`).
   - Controls visibility of `<BottomNav />`:
     ```tsx
     // BottomNav is only visible on inner utility/worship routes, never on church homepage ('/')
     const showNav = isReady && pathname !== '/';
     ```

4. **`components/ui/BottomNav.tsx`**:
   - Orange mobile/desktop bottom navigation bar with items:
     - `HOME` (links to `/` and resets mode to `'EXPERIENCE'`)
     - `SONGS` (links to `/songs`)
     - `SEARCH` (links to `/search`)
     - `FAVOURITES` (links to `/favourites`)
     - `PROFILE` (links to `/profile`)

5. **`components/home/HomeUtilityContent.tsx`**:
   - Worship portal utility homepage rendered on `/worship`.
   - Contains search bar, quick category pills, top 10 songs carousel, charts, and song grid.

6. **`components/songs/SongViewer.tsx`**:
   - Interactive song view with chords transpose (`-1`, `+1`), capo selector, chord diagrams, Hindi/English toggle, tempo slider, and ambient pad trigger.

---

## 🗄️ 5. Supabase Database Schema

The app queries the following Supabase PostgreSQL tables:
- **`songs`**:
  - `id` (uuid, primary key)
  - `title` (text)
  - `title_hindi` (text)
  - `slug` (text, unique)
  - `artist` (text)
  - `key` (text, e.g. "C", "G#m")
  - `tempo` (integer, e.g. 72)
  - `time_signature` (text, e.g. "4/4")
  - `chords` (text, lyrics with chord annotations e.g. `[G]Aaradhana [C]Karu`)
  - `lyrics` (text, plain lyrics)
  - `is_featured` (boolean)
  - `category` (text)
  - `video_id` (text, YouTube ID)
  - `created_at` (timestamptz)
- **`daily_verses`**:
  - `id` (uuid)
  - `date` (date string `YYYY-MM-DD`)
  - `verse_en` (text)
  - `verse_hi` (text)
  - `reference` (text, e.g. "Psalm 46:1")
  - `chapter` (integer)
  - `book` (text)
- **`events`**:
  - `id` (uuid)
  - `title_en`, `title_hi` (text)
  - `time_en`, `time_hi` (text)
  - `desc_en`, `desc_hi` (text)
  - `icon_name` (text, e.g. "BookOpen", "Sun", "Wine")
  - `gradient`, `color` (text)
  - `sort_order` (integer)
- **`announcements`**:
  - `id` (uuid)
  - `title`, `content` (text)
  - `is_active` (boolean)
- **`favourites`**:
  - `id` (uuid)
  - `user_id` (uuid references auth.users)
  - `song_id` (uuid references songs.id)
- **`profiles`**:
  - `id` (uuid references auth.users)
  - `name`, `email`, `avatar_url` (text)
  - `role` (text, "admin" or "user")

---

## 🔄 6. Summary of Work Completed Recently (Sessions Recap)

1. **Hero Section Redesign**:
   - Replaced static background with dual-video auto-rotating background (`coj video for hero annivercery.mp4` & `coj video.mp4`).
   - Removed static image flashing on browser refresh.
   - Built liquid wave button fill effect on "Get Directions".
   - Added kinetic typography rotating tagline ("CALL OF JESUS MINISTRIES - Where Heaven Transforms Lives / Unshackles Destinies / Unleashes Purpose").
2. **"Our Vision" Section Transformation**:
   - Converted from cold cyan to warm sanctuary gold (`amber-200` to `yellow-500`).
   - Created 2 interactive pillar cards: Pillar 01 (*Set the Captives Free*) and Pillar 02 (*Reign and Equip*).
   - Added GSAP ScrollTrigger entrance animations.
3. **"GOD Stories" Section Transformation**:
   - Replaced flat dark boxes with 3D glassmorphic testimony cards with quotation watermarks, believer avatars, city tags, and scripture anchors.
4. **Section Spacing & Tight Flow**:
   - Reduced excessive vertical padding from `py-44` down to clean, modern `py-12 md:py-20` across all landing page sections.
5. **Route Separation (`/` vs `/worship`)**:
   - Separated the Church Landing Page (`/`) and the Worship Chords Portal (`/worship`) so they exist as clean, independent routes.
   - `app/page.tsx` directly renders `<ExperienceOverlay />`.
   - `app/worship/page.tsx` renders `<HomeUtilityContent />`.
6. **Bottom Navigation Bug Fix**:
   - Fixed the issue where clicking the bottom `HOME` button triggered React Error Boundary (`Something went wrong!`).
   - Configured `AppShell.tsx` so the bottom orange bar is only visible on utility pages (`pathname !== '/'`), and slides away cleanly on `/`.
7. **Hydration Bug Fix in Footer**:
   - Fixed React hydration mismatch where `<div>` was nested inside a `<p>` tag in `components/home/HomeUtilityContent.tsx`.
8. **Git Commit & Push**:
   - Committed and pushed 40 files cleanly to `origin/main` (commit `13c7450`).

---

## 📱 7. CURRENT PENDING WORK: Mobile Responsiveness

The user stated:
> **"bhai pura ka pura landing page mobile compatible nahi hai yaar"**  
> *(The landing page is not fully mobile compatible)*

### Key Areas Requiring Mobile Optimization:
1. **Hero Section (`#hero`)**:
   - **Kinetic Headline Scaling**: Ensure the main title (`CALL OF JESUS MINISTRIES - Where Heaven...`) scales down gracefully on small screens (`320px` to `390px`) without clipping or extreme line breaks. Use `clamp()` or responsive font sizes (`text-2xl sm:text-4xl md:text-6xl`).
   - **CTA Button Layout**: Ensure the "Get Directions" liquid button and "Explore Worship Songs →" link stack cleanly with touch-friendly paddings.
   - **Video Background on Mobile**: Ensure `playsInline`, `muted`, `autoPlay` are present so mobile browsers don't block playback or pop open native video players.
2. **Landing Navbar (`LandingNavbar.tsx`)**:
   - Inspect mobile burger menu.
   - Verify logo height and vertical alignment on mobile (`h-10 w-auto`).
   - Ensure the mobile navigation drawer slides in smoothly, closes when clicking any link, and doesn't cause horizontal page overflow (`overflow-x-hidden`).
3. **Verse of the Day (`#verse`)**:
   - Ensure the glass card margins fit within `px-4` on mobile screens.
   - Check that action buttons (Audio, Copy, Share, Devotional) wrap into a neat grid or flex row without horizontal scroll.
4. **Gatherings Section (`#gatherings`)**:
   - Event cards (`grid-cols-1 md:grid-cols-3`): check padding, font sizes of Hindi & English text, and map button positioning.
5. **Vision Section (`#vision`)**:
   - 2 pillar cards: Ensure pillar numbers ("01", "02"), scripture tags, and descriptions are easy to read on mobile without cramped text.
6. **Trending Songs & Stories (`#trending`, `#stories`)**:
   - Enable smooth touch horizontal swipe (`overflow-x-auto` or touch scroll) on mobile for song cards and story cards.
   - Hide or reposition desktop arrow buttons on mobile to avoid layout clutter.
7. **Footer (`ExperienceOverlay.tsx` footer)**:
   - On mobile, convert footer links from multi-column grid into an accordion or clean single-column stacked layout with generous touch targets.
   - Prevent any element from exceeding `100vw` (verify `document.documentElement.scrollWidth <= window.innerWidth`).

---

## ⚡ 8. Development & Troubleshooting Tips

- **Starting Local Dev Server**:
  ```bash
  npm run dev
  ```
  *(Default port is 3000. If port 3000 is occupied by a stale node process, kill process or run on port 3001).*
- **Testing TypeScript Compilation**:
  ```bash
  npx tsc --noEmit --skipLibCheck
  ```
- **Checking Stale Node Processes (Windows PowerShell)**:
  ```powershell
  Get-Process node | Select-Object Id, ProcessName, WorkingSet
  Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
  ```
- **Clearing Next.js / Turbopack Cache**:
  If an HMR error occurs (`module factory is not available`), delete the `.next` directory and restart:
  ```powershell
  Remove-Item -Recurse -Force .next
  npm run dev
  ```

---

*Document prepared for Call of Jesus Ministries (`coj`) repository.*
