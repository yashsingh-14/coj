'use client';

import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#02000F] text-white px-4 sm:px-6 py-6 pb-32">
            <Link href="/" className="inline-flex items-center gap-2 p-2.5 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md mb-6 sm:mb-8 transition-colors text-xs sm:text-sm">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="font-bold">Back</span>
            </Link>

            <div className="max-w-xl mx-auto">
                <h1 className="text-2xl sm:text-4xl font-serif font-bold mb-2">Get in Touch</h1>
                <p className="text-white/60 mb-6 sm:mb-10 text-sm sm:text-base">We&apos;d love to hear your testimony or prayer requests.</p>

                <form className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Name</label>
                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 focus:outline-none transition-colors text-sm sm:text-base" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Email</label>
                            <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 focus:outline-none transition-colors text-sm sm:text-base" placeholder="john@example.com" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Message</label>
                        <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-amber-500 focus:outline-none transition-colors text-sm sm:text-base" placeholder="How can we pray for you?"></textarea>
                    </div>
                    <button className="w-full py-3.5 sm:py-4 bg-amber-500 rounded-xl text-black font-bold uppercase tracking-widest hover:bg-amber-400 transition-colors text-sm sm:text-base">
                        Send Message
                    </button>
                </form>

                <div className="mt-10 sm:mt-16 pt-10 sm:pt-16 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center sm:text-left">
                    <div>
                        <Mail className="w-6 h-6 text-amber-500 mb-2 mx-auto md:mx-0" />
                        <p className="text-sm font-bold">Email Us</p>
                        <p className="text-xs text-white/40">contact@callofjesus.com</p>
                    </div>
                    <div>
                        <Phone className="w-6 h-6 text-amber-500 mb-2 mx-auto md:mx-0" />
                        <p className="text-sm font-bold">Call Us</p>
                        <p className="text-xs text-white/40">+1 (555) 123-4567</p>
                    </div>
                    <div>
                        <MapPin className="w-6 h-6 text-amber-500 mb-2 mx-auto md:mx-0" />
                        <p className="text-sm font-bold">Visit Us</p>
                        <p className="text-xs text-white/40">123 Grace Ave, Heaven City</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
