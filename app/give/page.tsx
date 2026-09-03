import { Heart, QrCode, Building2, ShieldCheck } from 'lucide-react';
import LandingNavbar from '@/components/hero/LandingNavbar';

export const metadata = {
    title: "Give & Partner | Call of Jesus Ministries",
    description: "Support Call of Jesus Ministries through online giving, UPI, and bank transfers for Kingdom expansion, worship, and church building funds."
};

export default function GivePage() {
    return (
        <main className="min-h-screen bg-black text-white py-24 px-6 md:px-12">
            <LandingNavbar />
            <div className="max-w-5xl mx-auto space-y-16 pt-12">
                
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                        <Heart className="w-4 h-4 text-amber-400" />
                        Kingdom Partnership
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                        Give & <span className="font-serif italic font-normal text-amber-300">Partner</span>
                    </h1>
                    <p className="text-neutral-300 text-lg md:text-xl font-light">
                        &quot;Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God loveth a cheerful giver.&quot; — 2 Corinthians 9:7
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div className="rounded-3xl bg-neutral-900 border border-white/15 p-8 md:p-10 space-y-6 shadow-2xl">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Bank Account Transfer</h2>
                                <p className="text-xs text-neutral-400">Direct NEFT / RTGS / IMPS</p>
                            </div>
                        </div>

                        <div className="space-y-4 font-mono text-sm">
                            <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-1">
                                <p className="text-xs text-neutral-400 font-sans uppercase">Account Name</p>
                                <p className="text-white font-bold font-sans">CALL OF JESUS MINISTRIES TRUST</p>
                            </div>

                            <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-1">
                                <p className="text-xs text-neutral-400 font-sans uppercase">Bank Name</p>
                                <p className="text-white font-bold font-sans">HDFC Bank Ltd.</p>
                            </div>

                            <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-1">
                                <p className="text-xs text-neutral-400 font-sans uppercase">Account Number</p>
                                <p className="text-amber-300 font-bold text-base">50200012345678</p>
                            </div>

                            <div className="bg-black/50 p-4 rounded-xl border border-white/5 space-y-1">
                                <p className="text-xs text-neutral-400 font-sans uppercase">IFSC Code</p>
                                <p className="text-amber-300 font-bold">HDFC0001234</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-neutral-900 border border-white/15 p-8 md:p-10 space-y-6 shadow-2xl flex flex-col justify-between items-center text-center">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
                                <QrCode className="w-4 h-4" />
                                Instant UPI Giving
                            </div>
                            <h2 className="text-2xl font-bold text-white">Scan & Give via Any UPI App</h2>
                            <p className="text-xs text-neutral-400">GPay, PhonePe, Paytm, BHIM</p>
                        </div>

                        <div className="w-56 h-56 rounded-2xl bg-white p-4 flex flex-col items-center justify-center border-4 border-amber-400/50 shadow-2xl relative">
                            <QrCode className="w-40 h-40 text-black" />
                            <span className="text-[10px] font-mono text-black font-bold mt-1">cojministries@hdfcbank</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>100% Secure & Verified Ministry Trust Account</span>
                        </div>
                    </div>

                </div>

            </div>
        </main>
    );
}
