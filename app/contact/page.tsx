import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#02000F] text-white relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-[var(--brand)] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>

            <div className="sticky top-0 z-20 p-6 flex items-center gap-4">
                <Link href="/" className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all group">
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Contact Us</h1>
            </div>

            <div className="container mx-auto px-6 pt-8 pb-32 max-w-3xl">
                <div className="grid gap-6">
                    {/* Email Card */}
                    <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden hover:border-[var(--brand)]/50 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10 flex items-start gap-6">
                            <div className="p-4 rounded-2xl bg-white/10 text-[var(--brand)] group-hover:scale-110 transition-transform duration-500">
                                <Mail className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white/90 mb-1">Email Support</h3>
                                <p className="text-white/50 text-sm mb-2">For general inquiries and prayer requests</p>
                                <a href="mailto:hello@cojministries.com" className="text-xl font-bold text-white hover:text-[var(--brand)] transition-colors">hello@cojministries.com</a>
                            </div>
                        </div>
                    </div>

                    {/* Phone Card */}
                    <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden hover:border-[var(--brand)]/50 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10 flex items-start gap-6">
                            <div className="p-4 rounded-2xl bg-white/10 text-[var(--brand)] group-hover:scale-110 transition-transform duration-500">
                                <Phone className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white/90 mb-1">Phone Line</h3>
                                <p className="text-white/50 text-sm mb-2">Mon-Fri from 9am to 5pm</p>
                                <a href="tel:+15551234567" className="text-xl font-bold text-white hover:text-[var(--brand)] transition-colors">+1 (555) 123-4567</a>
                            </div>
                        </div>
                    </div>

                    {/* Address Card */}
                    <div className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden hover:border-[var(--brand)]/50 transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10 flex items-start gap-6">
                            <div className="p-4 rounded-2xl bg-white/10 text-[var(--brand)] group-hover:scale-110 transition-transform duration-500">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white/90 mb-1">Visit Us</h3>
                                <p className="text-white/50 text-sm mb-2">Join us for Sunday Service</p>
                                <address className="text-xl font-bold text-white not-italic">123 Worship Ave, City of Peace</address>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
