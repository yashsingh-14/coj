import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define the primary domain - Update this if you switch to a custom domain like coj.org.in later
const SITE_URL = 'https://cojworship.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  title: {
    default: "COJ | Call of Jesus Ministries - Christian Worship Songs & Lyrics",
    template: "%s | COJ Worship"
  },
  description: "Discover a vast collection of Christian worship songs, lyrics, and chords in English and Hindi. Join Call of Jesus Ministries in praise and worship.",
  keywords: ["Christian songs", "Worship lyrics", "Hindi worship songs", "Christian chords", "Gospel lyrics", "COJ Ministries", "Call of Jesus", "Jesus songs", "Christian music"],
  authors: [{ name: "Yash Singh" }, { name: "Call of Jesus Ministries" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "COJ Worship",
    title: "COJ | Call of Jesus Ministries - Worship & Word",
    description: "Premium destination for Christian worship lyrics and chords.",
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
        <AppShell>
          {children}
        </AppShell>
        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}
