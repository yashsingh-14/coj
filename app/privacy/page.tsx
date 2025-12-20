'use client';

import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#02000F] text-white p-6 pb-32">
            <Link href="/" className="inline-flex items-center gap-2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md mb-8 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
                <span className="text-sm font-bold">Back</span>
            </Link>

            <div className="max-w-3xl mx-auto prose prose-invert prose-lg">
                <div className="flex items-center gap-4 mb-8">
                    <Shield className="w-12 h-12 text-amber-500" />
                    <h1 className="text-4xl font-bold m-0">Privacy Policy</h1>
                </div>

                <p className="lead text-white/60">Last updated: December 20, 2024</p>

                <h3>1. Introduction</h3>
                <p>Call of Jesus Ministries values your privacy. This policy explains how we collect and use your data to enhance your worship experience.</p>

                <h3>2. Information We Collect</h3>
                <p>We collect basic usage data such as songs played, favorites, and search history to personalize your recommendations. We do not sell your personal data.</p>

                <h3>3. Cookies</h3>
                <p>We use cookies to maintain your session and preferences. By using our site, you consent to our use of cookies.</p>

                <h3>4. Contact</h3>
                <p>If you have any questions regarding your privacy, please contact us at privacy@callofjesus.com.</p>
            </div>
        </div>
    );
}
