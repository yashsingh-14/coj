'use client';

import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#02000F] text-white p-6 pb-32">
            <Link href="/" className="inline-flex items-center gap-2 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md mb-8 transition-colors">
                <ArrowLeft className="w-5 h-5 text-white" />
                <span className="text-sm font-bold">Back</span>
            </Link>

            <div className="max-w-3xl mx-auto prose prose-invert prose-lg">
                <div className="flex items-center gap-4 mb-8">
                    <FileText className="w-12 h-12 text-amber-500" />
                    <h1 className="text-4xl font-bold m-0">Terms of Service</h1>
                </div>

                <p className="lead text-white/60">Last updated: December 20, 2024</p>

                <h3>1. Acceptance of Terms</h3>
                <p>By accessing Call of Jesus Ministries&apos; platform, you agree to be bound by these Terms of Service and all applicable laws.</p>

                <h3>2. Use License</h3>
                <p>Permission is granted to stream and view the materials (lyrics, chords, videos) for personal, non-commercial worship use only.</p>

                <h3>3. User Conduct</h3>
                <p>You agree not to use the platform for any unlawful purpose or to solicit others to perform or participate in any unlawful acts.</p>

                <h3>4. Disclaimer</h3>
                <p>The materials on our website are provided on an &apos;as is&apos; basis. Makes no warranties, expressed or implied.</p>
            </div>
        </div>
    );
}
