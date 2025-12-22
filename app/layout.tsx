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

export const metadata: Metadata = {
  title: "COJ | Call of Jesus Ministries",
  description: "Worship • Word • Praise",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#000000] text-[#ffffff]`}
      >
        <AppShell>
          {children}
        </AppShell>
        <Toaster position="bottom-right" theme="dark" richColors />
      </body>
    </html>
  );
}
