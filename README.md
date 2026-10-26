<div align="center">

# ✝ Call of Jesus (COJ)

### Next-Generation Christian Worship Platform, Songbook & Audio DSP Tuner

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](./LICENSE)

<p align="center">
  A state-of-the-art worship platform engineered for modern churches, musicians, and believers worldwide.
  Featuring real-time chord transposition, liturgical songbooks in English and Hindi, Web Audio API pitch-detection guitar tuning, and an enterprise administrative CMS.
</p>

[Explore Songs](#-key-platform-features) • [COJ Tuner](#-coj-audio-tuner) • [Architecture](#-project-architecture) • [Getting Started](#-getting-started) • [Copyright & License](#-intellectual-property--copyright)

</div>

---

## 🌟 Platform Highlights

### 🎵 Interactive Songbook & Chord Engine
- **Instant Transposition:** Dynamic key shifting with algorithmic accidental correction ($♭$/$♯$).
- **Dual Display Modes:** One-tap toggle between lyrics-only and chord-annotated views.
- **Hands-Free Performance:** Smooth auto-scroll with variable tempo control and font customization.
- **Embedded Media:** Synced official YouTube worship performance for every track.
- **Typo-Tolerant Search:** Fuzzy matching search engine indexing English, Hindi, and romanized lyrics.

### 🎸 COJ Audio DSP Tuner
- **Hardware-Accelerated Pitch Detection:** Utilizes Web Audio API with normalized Autocorrelation and YIN algorithm variants.
- **Acoustic & Electric Guitar Profiles:** Custom frequency bounds calibrated for standard 6-string instruments ($E_2, A_2, D_3, G_3, B_3, E_4$).
- **Studio-Grade Needle Meter:** Smooth dynamic inertia simulation showing exact cents offset ($\pm 50$ cents) and hertz readout.
- **Dual Tuning Modes:**
  - **Auto Mode:** Intelligent string detection that locks onto the played frequency with noise-floor gating.
  - **Manual Mode:** Isolated single-string tuning target with interactive reference tone generation.

### ⚡ Progressive Web App (PWA) & Offline Mode
- **Native-Like Experience:** Installable on iOS, Android, macOS, and Windows.
- **Intelligent Cache:** Service worker caching strategies for uninterrupted offline worship during services.
- **Web Push Notifications:** VAPID-authenticated broadcasts for church announcements and fresh worship releases.

### 🛡️ Enterprise Admin Management Suite (`/admin`)
- **Song & Artist CMS:** Complete lifecycle management with AI-assisted chord formatting.
- **Role-Based Access Control:** Secure Supabase authentication safeguarding database operations.
- **Event Scheduling:** Bilingual service schedules with automatic reminders.
- **Push Broadcasting:** One-click instant delivery of announcements to all registered devices.

---

## 🏗 Project Architecture

```
coj/
├── app/                        # Next.js 16 App Router (Routes & Server Components)
│   ├── (auth)/                 # Authentication flows (signin, signup)
│   ├── admin/                  # Enterprise administration dashboard & CMS
│   ├── api/                    # Serverless API routes (push, search, VAPID)
│   ├── artists/                # Artist profile pages and song registries
│   ├── favourites/             # User bookmarked worship tracks
│   ├── give/                   # Secure tithing & ministry giving portal
│   ├── songs/                  # Dynamic song viewer & chord engine ([slug])
│   ├── tools/
│   │   └── tuner/              # COJ Chromatic Audio DSP Guitar Tuner
│   ├── layout.tsx              # Root app layout, providers, and global font loading
│   └── page.tsx                # Cinematic landing page with dual-video hero
├── components/                 # Reusable React & UI Components
│   ├── admin/                  # CMS forms, tables, and analytics widgets
│   ├── auth/                   # Authentication modals and provider buttons
│   ├── hero/                   # Experience overlay, navbar, marquee, and footer
│   ├── home/                   # Home utility feeds, sermons, and accordions
│   ├── songs/                  # Song viewer, transpose controls, print & share
│   └── ui/                     # Premium UI kit (TiltCard, LiquidButton, Logo)
├── data/                       # Static data registries & fallback snapshots
│   ├── songs.ts                # Master typed song registry
│   ├── supabase_songs_snapshot.json # Production database offline fallback
│   ├── types.ts                # TypeScript domain models
│   └── verses.ts               # Daily liturgical Scripture collections
├── lib/                        # Core Utilities & Services
│   ├── pitchDetection.ts       # Web Audio API DSP algorithms & autocorrelation
│   ├── songParser.ts           # Chord-pro / bracket parser & key transposer
│   ├── supabaseClient.ts       # Client-side Supabase client with auth session
│   ├── supabaseServer.ts       # Server-side Supabase client with cookie storage
│   ├── supabaseAdmin.ts        # Privileged server-only Supabase service client
│   └── utils.ts                # String sanitizers, tailwind merge, class helpers
├── public/                     # Static Public Assets
│   ├── images/
│   │   ├── tuner/              # Acoustic & electric headstock vector assets
│   │   └── stories/            # Ministry story photography (.webp optimized)
│   ├── videos/                 # Cinematic anniversary & intro videos (.mp4)
│   ├── manifest.json           # PWA application manifest
│   └── sw.js                   # Service worker for offline caching & push
├── scripts/                    # Automation & Maintenance Utilities
│   ├── check-duplicates.mjs    # Database hygiene & duplicate validation script
│   └── generate-vapid.mjs      # Web Push VAPID key generator
├── .env.example                # Documented environment variable template
├── .gitignore                  # Git exclusions (build artifacts, secrets, scrapers)
├── LICENSE                     # Proprietary Source-Available Legal License
├── middleware.ts               # Next.js Edge Middleware for route protection
└── package.json                # Project dependencies and script definitions
```

---

## 🛠 Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (React 19) | Server Components, Streaming SSR, App Router |
| **Language** | TypeScript 5 | Strict static typing and interface contracts |
| **Styling** | Tailwind CSS + Lucide Icons | Responsive utility classes & fluid typography |
| **Database & Auth** | Supabase (PostgreSQL) | Managed database, Row Level Security, Auth |
| **Audio Processing** | Web Audio API / DSP | Real-time pitch extraction, autocorrelation |
| **Animations** | GSAP 3 + ScrollTrigger | High-performance 60fps kinetic animations |
| **Caching & Push** | Service Worker + Web Push (VAPID) | Offline resilience and real-time broadcasts |
| **Deployment** | Vercel Edge Network | Global low-latency CDN and serverless compute |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or later (LTS recommended)
- **Package Manager**: `npm` (v10+)
- **Supabase Account**: A free or pro Supabase project instance

### 1. Clone the Repository
```bash
git clone https://github.com/yashsingh/coj.git
cd coj
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and configure your credentials:
```bash
cp .env.example .env.local
```

Fill in your project keys in `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Web Push Notification Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_SUBJECT="mailto:contact@callofjesus.org"

# YouTube Data API (Optional for enriched video metadata)
NEXT_PUBLIC_YOUTUBE_API_KEY="your-youtube-api-key"

# Canonical Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build & Verification
```bash
npm run build
npm run start
```

---

## ⚖️ Intellectual Property & Copyright

> **IMPORTANT LEGAL NOTICE**

This project is published as a **Proprietary, Source-Available** repository. It is made publicly accessible solely for personal evaluation, code review, educational reference, and ministry partnership demonstrations.

- **Copyright © 2026 Call of Jesus Ministries (COJ). All Rights Reserved.**
- **Original Author & Architect:** Yash Singh & Call of Jesus Ministries.

### Strict Prohibitions
1. **No Unauthorized Hosting:** You may **NOT** deploy, host, mirror, or publish this software on any public or private domain, server, or cloud provider (e.g., Vercel, Netlify, AWS, Cloudflare, etc.) without explicit written authorization from Call of Jesus Ministries.
2. **No Commercial Use:** You may **NOT** sell, rent, commercialize, or charge access fees for this codebase or any derived work.
3. **No Asset or Database Scraping:** All liturgical song chords, Hindi/English translations, proprietary audio tuner DSP code, video assets, and branding elements are proprietary intellectual property and cannot be extracted for external applications.
4. **DMCA Enforcement:** Any unauthorized deployment, re-branding, or distribution is subject to immediate **DMCA takedown notices** to GitHub, cloud hosting providers, domain registrars, and legal claims under the **Indian Copyright Act, 1957** and international copyright conventions.

For full legal terms and conditions, consult the [LICENSE](./LICENSE) file.

---

<div align="center">

**Call of Jesus Ministries** • *Soli Deo Gloria*  
Built with passion and dedication for worship excellence.

</div>
