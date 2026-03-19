import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner';
import { ThemeProvider } from 'next-themes';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define the primary domain
const SITE_URL = 'https://callofjesus.in';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  title: {
    default: "Call of Jesus Ministries | Worship Songs, Lyrics, Chords & Sermons — Hear the Word of God",
    template: "%s | Call of Jesus Ministries"
  },
  description: "Enter the presence of God through worship and His Word. Listen to anointed sermons every Sunday & Friday, explore powerful Christian worship songs with lyrics, chords & guitar tabs in English and Hindi. A spiritual home for every believer — by Call of Jesus Ministries.",
  keywords: ["Christian songs", "Worship lyrics", "Hindi worship songs", "Christian chords", "Gospel lyrics", "COJ Ministries", "Call of Jesus", "Jesus songs", "Christian music", "worship chords", "Hindi Christian songs lyrics", "guitar chords worship"],
  authors: [{ name: "Yash Singh" }, { name: "Call of Jesus Ministries" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "COJ Worship",
    title: "Call of Jesus Ministries | Worship Songs, Lyrics, Chords & Sermons",
    description: "Enter the presence of God through worship and His Word. Listen to anointed sermons, explore worship songs with lyrics, chords & guitar tabs in English & Hindi — a spiritual home for every believer.",
    images: [
      {
        url: 'https://callofjesus.in/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'COJ Worship - Call of Jesus Ministries - Christian Worship Songs',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Call of Jesus Ministries | Worship Songs, Lyrics, Chords & Sermons',
    description: 'Enter the presence of God through worship and His Word. Anointed sermons, worship songs, lyrics & chords in English & Hindi.',
    images: ['https://callofjesus.in/images/og-image.png'],
  },
  icons: {
    icon: '/images/logo-footer-final.png',
    shortcut: '/images/logo-footer-final.png',
    apple: '/images/logo-footer-final.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: "CYIkv8Ghl8ecRATjDtfb3ouWVTc5O2M87tRXaJ3kqA8",
  },
};

import AppShell from "@/components/AppShell";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPrompt from "@/components/InstallPrompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AppShell>
            <ServiceWorkerRegister />
            <InstallPrompt />
            {children}
          </AppShell>
          <Toaster position="bottom-right" theme="dark" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
