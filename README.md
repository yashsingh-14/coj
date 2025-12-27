# Call of Jesus (COJ) - Project Manual

**Version:** 1.0.0 (Production Ready)
**Status:** Deployed 🚀

## 🌟 Project Overview
**Call of Jesus** is a premium, modern Christian worship platform designed to provide easy access to song lyrics, chords, and worship resources in English and Hindi. The platform is built as a Progressive Web App (PWA) ensuring access on all devices with an app-like experience.

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + custom glassmorphism effects
- **Animations:** GSAP (Greensock) + Framer Motion
- **Database & Auth:** Supabase (PostgreSQL)
- **Deployment:** Vercel

## ✨ Key Features

### 🎸 For Users
- **Dynamic Song Viewer:**
    - Real-time Transposition (Change Keys instantly)
    - Toggle Chords/Lyrics visibility
    - Auto-scroll & Font resizing
    - YouTube integration for every song
- **Search & Discovery:**
    - Powerful search with "fuzzy matching" (handles typos)
    - Categorized browsing (Praise, Worship, Hindi, Kids, Hymns)
    - "Made For You" & "Trending" algorithms
- **PWA Support:** Installable as a native app on iOS and Android.
- **Engagement:**
    - "Verse of the Day" with cinematic generated visuals
    - Push Notifications for new songs/events

### 🛡️ Admin Panel (`/admin`)
A comprehensive CMS to manage the entire platform without touching code.

1.  **Dashboard:** Live stats on users and content.
2.  **Song Manager:** Full CRUD for songs. Includes AI-assist for formatting lyrics/chords.
3.  **Artist Manager:** Manage artist profiles and auto-link songs.
4.  **Events:** Schedule church services with bilingual support.
5.  **Broadcasts:** Send Push Notifications to all subscribed users instantly.
6.  **Sermons/Daily Content:** Update the daily verse and sermon links.

## 🚀 Maintenance Guide

### Running Locally
```bash
npm run dev
```

### Deploying Updates
Since the project is connected to Vercel (assumed via GitHub):
1.  Make changes locally.
2.  Commit and Push:
    ```bash
    git add .
    git commit -m "Update feature X"
    git push origin main
    ```
3.  Vercel will automatically build and deploy the new version.

### Database Management
- Access the **Supabase Dashboard** to view raw tables (`songs`, `profiles`, `subscribers`).
- Remember: The `push_subscriptions` table holds sensitive notification keys.

---
**Developed by Yash Singh** | *Soli Deo Gloria*
