import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#02000F] text-white px-4 sm:px-6 py-6 pb-32">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md mb-6 sm:mb-8 transition-colors text-xs sm:text-sm">
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span className="font-bold">Back to Home</span>
                </Link>

                <h1 className="text-2xl sm:text-4xl font-bold mb-6 sm:mb-8">Privacy Policy</h1>
                <div className="space-y-6 text-white/70 text-sm sm:text-base">
                    <p className="text-xs sm:text-sm text-white/40">Last updated: December 28, 2024</p>
                    <section>
                        <h2 className="text-lg sm:text-2xl font-semibold text-white mb-2 sm:mb-4">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us.</p>
                    </section>
                    <section>
                        <h2 className="text-lg sm:text-2xl font-semibold text-white mb-2 sm:mb-4">2. How We Use Your Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, including to personalize your experience.</p>
                    </section>
                    <section>
                        <h2 className="text-lg sm:text-2xl font-semibold text-white mb-2 sm:mb-4">3. Data Security</h2>
                        <p>We implement reasonable security measures to protect your personal information.</p>
                    </section>
                    <section>
                        <h2 className="text-lg sm:text-2xl font-semibold text-white mb-2 sm:mb-4">4. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at support@callofjesus.com.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
