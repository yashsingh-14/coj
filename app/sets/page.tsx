import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';

export default function SetsPage() {
    return (
        <div className="min-h-screen bg-[#050505] pb-20">
            <div className="sticky top-0 bg-[#050505]/95 backdrop-blur border-b border-white/10 p-4 mb-8 z-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold">Worship Sets</h1>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                <div className="grid gap-2">
                    <div className="bg-[#111] border border-white/5 p-6 rounded-xl">
                        <div className="flex items-center gap-3 text-white/50 mb-4 text-sm uppercase tracking-widest">
                            <Calendar className="w-4 h-4" />
                            <span>This Sunday</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">December 21, 2025</h3>
                        <ul className="space-y-3 font-medium opacity-80">
                            <li className="flex gap-4"><span className="opacity-30">01</span> Way Maker <span className="opacity-30 ml-auto">E</span></li>
                            <li className="flex gap-4"><span className="opacity-30">02</span> 10,000 Reasons <span className="opacity-30 ml-auto">G</span></li>
                            <li className="flex gap-4"><span className="opacity-30">03</span> Goodness of God <span className="opacity-30 ml-auto">Ab</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
