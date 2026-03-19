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
    canonical: '/',
  },
  title: {
    default: "COJ | Call of Jesus Ministries - Christian Worship Songs & Lyrics",
    template: "%s | COJ Worship"
  },
  description: "Discover a vast collection of Christian worship songs with lyrics, chords, and guitar tabs in English and Hindi. Free worship resources for church worship leaders and musicians by Call of Jesus Ministries.",
  keywords: ["Christian songs", "Worship lyrics", "Hindi worship songs", "Christian chords", "Gospel lyrics", "COJ Ministries", "Call of Jesus", "Jesus songs", "Christian music", "worship chords", "Hindi Christian songs lyrics", "guitar chords worship"],
  authors: [{ name: "Yash Singh" }, { name: "Call of Jesus Ministries" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "COJ Worship",
    title: "COJ | Call of Jesus Ministries - Christian Worship Songs, Lyrics & Chords",
    description: "Free Christian worship songs with lyrics, chords, and structure in English & Hindi. The ultimate resource for worship leaders and musicians.",
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
    title: 'COJ | Call of Jesus Ministries - Worship Songs & Chords',
    description: 'Free Christian worship songs with lyrics, chords in English & Hindi.',
    images: ['https://callofjesus.in/images/og-image.png'],
  },
  icons: {
    icon: '/images/logo-footer-final.png',
    shortcut: '/images/logo-footer-final.png',
    apple: '/images/logo-footer-final.png',
  },
  manifest: '/manifest.json',
  verification: {
    google: "LaBYax9Fpd8uHkpERTFziIsQANIBxAMaXWQw5r1Dz3I",
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
