export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#02000F] text-white p-6 md:p-12 pb-32">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
                <div className="space-y-6 text-white/70">
                    <p>Last updated: December 28, 2024</p>
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, including to personalize your experience.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">3. Data Security</h2>
                        <p>We implement reasonable security measures to protect your personal information.</p>
                    </section>
                    <section>
                        <h2 className="text-2xl font-semibold text-white mb-4">4. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at support@callofjesus.com.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
