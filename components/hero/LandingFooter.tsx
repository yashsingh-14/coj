'use client';

import Link from 'next/link';
import BlackRemoverImage from "@/components/ui/BlackRemoverImage";

interface LandingFooterProps {
    onOpenUtility?: () => void;
}

export default function LandingFooter({ onOpenUtility }: LandingFooterProps) {
    return (
        <footer className="relative pt-12 sm:pt-20 pb-10 sm:pb-12 px-4 sm:px-6 md:px-12 bg-[#07060A] text-[#F4EDE2] overflow-hidden">
            {/* Seamless Footer Top Fade Overlay */}
            <div className="pointer-events-none absolute top-0 inset-x-0 h-28 md:h-40 bg-gradient-to-b from-[#07060A] via-[#07060A]/70 to-transparent z-10" />

            {/* Logo Flame Top Glow Line */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#FFB37A] via-[#FF5A2E] to-[#C2361A] to-transparent" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[200px] bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.18)_0%,rgba(245,158,11,0.10)_40%,transparent_70%)] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)] rounded-full pointer-events-none" />
            <div className="starfield opacity-30 pointer-events-none z-0" />

            <div className="relative z-20 max-w-7xl mx-auto">
                {/* Top Section: Brand Block + Links Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-8 sm:pb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-3.5 sm:space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#0D0B12] border border-white/15 p-1.5 flex items-center justify-center shadow-[0_0_25px_rgba(255,90,46,0.22)]">
                                <BlackRemoverImage src="/images/logo-footer-final.png" alt="COJ Logo" threshold={80} className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h4 className="text-sm sm:text-base font-black tracking-wider text-white uppercase font-sans">CALL OF JESUS</h4>
                                <p className="text-[9px] sm:text-[10px] font-bold bg-gradient-to-r from-[#FFB37A] via-[#FF5A2E] to-[#C2361A] bg-clip-text text-transparent tracking-[0.35em] uppercase">MINISTRIES</p>
                            </div>
                        </div>
                        <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm">
                            A spiritual home for every believer. Proclaiming the New Covenant Gospel of Grace, supernatural breakthrough, and raising radical lovers of Jesus worldwide.
                        </p>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                        {/* Kingdom */}
                        <div className="space-y-3.5">
                            <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FF5A2E] flex items-center gap-1.5">
                                <span>Kingdom</span>
                            </h4>
                            <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
                                <li><Link href="/give" className="hover:text-amber-400 transition-colors">Give / Partner</Link></li>
                                <li><Link href="/share-testimony" className="hover:text-amber-400 transition-colors">Share Testimony</Link></li>
                                <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Connect with Us</Link></li>
                                <li><Link href="/events" className="hover:text-amber-400 transition-colors">Weekly Gatherings</Link></li>
                            </ul>
                        </div>

                        {/* Grow */}
                        <div className="space-y-3.5">
                            <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FFB37A] flex items-center gap-1.5">
                                <span>Grow</span>
                            </h4>
                            <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
                                <li><Link href="/sermons" className="hover:text-amber-400 transition-colors">Sermons Archive</Link></li>
                                <li><Link href="/devotional" className="hover:text-amber-400 transition-colors">Daily Devotionals</Link></li>
                                <li><Link href="/god-stories" className="hover:text-amber-400 transition-colors">Miracle Stories</Link></li>
                            </ul>
                        </div>

                        {/* About */}
                        <div className="space-y-3.5">
                            <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#F59E0B] flex items-center gap-1.5">
                                <span>About Us</span>
                            </h4>
                            <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
                                <li><Link href="/our-journey" className="hover:text-amber-400 transition-colors">Our Journey</Link></li>
                                <li><Link href="/our-vision-and-mission" className="hover:text-amber-400 transition-colors">Vision & Mission</Link></li>
                                <li><Link href="/our-leaders" className="hover:text-amber-400 transition-colors">Our Leaders</Link></li>
                                <li><Link href="/our-branches" className="hover:text-amber-400 transition-colors">Our Branches</Link></li>
                            </ul>
                        </div>

                        {/* Worship Resources */}
                        <div className="space-y-3.5">
                            <h4 className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FF8C68] flex items-center gap-1.5">
                                <span>Worship</span>
                            </h4>
                            <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
                                <li>
                                    {onOpenUtility ? (
                                        <button onClick={onOpenUtility} className="hover:text-amber-400 transition-colors text-left">
                                            Worship Portal
                                        </button>
                                    ) : (
                                        <Link href="/worship" className="hover:text-amber-400 transition-colors">
                                            Worship Portal
                                        </Link>
                                    )}
                                </li>
                                <li><Link href="/songs" className="hover:text-amber-400 transition-colors">Songs Catalog</Link></li>
                                <li><Link href="/tools/tuner" className="hover:text-amber-400 transition-colors">Musician Tools</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* GRAND FULL-WIDTH WORDMARK — Interactive Letter Blow Effect    */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="relative pt-6 pb-6 sm:pt-10 sm:pb-8 md:pt-14 md:pb-10 overflow-visible select-none -mx-4 sm:-mx-6 md:-mx-12 px-3 sm:px-6 md:px-10">
                    {/* Ambient Celestial Flame Glow matching Logo Atmosphere */}
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="w-full max-w-6xl h-28 sm:h-44 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,90,46,0.25)_0%,rgba(245,158,11,0.18)_40%,rgba(139,92,246,0.10)_75%,transparent_90%)] blur-3xl" />
                    </div>

                    {/* Full-Width Edge-to-Edge Logo-Styled Typography with Letter Blow Hover */}
                    <div className="relative z-10 w-full flex flex-col items-center overflow-visible">
                        <div className="flex items-baseline justify-center gap-2 sm:gap-3 md:gap-5 lg:gap-6 select-none whitespace-nowrap overflow-visible">
                            {/* CALL */}
                            <div className="flex items-baseline tracking-normal overflow-visible">
                                {['C', 'A', 'L', 'L'].map((char, i) => (
                                    <span
                                        key={`call-${i}`}
                                        className="letter-blow font-playfair font-black text-[11.5vw] sm:text-[10.8vw] md:text-[10vw] lg:text-[9.2vw] xl:text-[8.5vw] leading-[1.12] pb-2 sm:pb-3 md:pb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF8] via-[#FFB37A] via-[#FF5A2E] to-[#F59E0B]"
                                    >
                                        {char}
                                    </span>
                                ))}
                            </div>

                            {/* OF */}
                            <div className="flex items-baseline overflow-visible">
                                <span className="letter-blow font-playfair font-semibold text-[5vw] sm:text-[4.6vw] md:text-[4.2vw] lg:text-[3.8vw] xl:text-[3.4vw] tracking-[0.18em] leading-[1.12] pb-2 sm:pb-3 md:pb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF8] via-[#FDE047] to-[#F59E0B] align-middle">
                                    OF
                                </span>
                            </div>

                            {/* JESUS */}
                            <div className="flex items-baseline tracking-normal overflow-visible">
                                {['J', 'E', 'S', 'U', 'S'].map((char, i) => (
                                    <span
                                        key={`jesus-${i}`}
                                        className="letter-blow font-playfair font-black text-[11.5vw] sm:text-[10.8vw] md:text-[10vw] lg:text-[9.2vw] xl:text-[8.5vw] leading-[1.12] pb-2 sm:pb-3 md:pb-4 text-transparent bg-clip-text bg-gradient-to-b from-[#FFFDF8] via-[#FFB37A] via-[#FF5A2E] to-[#F59E0B]"
                                    >
                                        {char}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Subtitle */}
                        <p className="mt-2 sm:mt-3 md:mt-4 text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.55em] sm:tracking-[0.8em] text-white/40 uppercase font-space text-center w-full">
                            M I N I S T R I E S
                        </p>
                    </div>
                </div>

                {/* Bottom Legal & Copyright Bar */}
                <div className="border-t border-white/15 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-3">
                    <p>© {new Date().getFullYear()} Call of Jesus Ministries. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="/terms" className="hover:text-amber-400 text-white/60 transition-colors">Terms of Service</Link>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <Link href="/privacy" className="hover:text-amber-400 text-white/60 transition-colors">Privacy Policy</Link>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <Link href="/contact" className="hover:text-amber-400 text-white/60 transition-colors">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
