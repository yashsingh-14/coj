import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#02000F] flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="relative">
                <h1 className="text-[150px] font-black text-white/5 leading-none select-none">404</h1>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-700">
                        Page Not Found
                    </span>
                </div>
            </div>

            <p className="text-white/40 max-w-md mb-8">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <div className="flex gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-bold rounded-full hover:bg-amber-400 transition-colors"
                >
                    <Home className="w-4 h-4" /> Go Home
                </Link>
                <Link
                    href="/search"
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
                >
                    <Search className="w-4 h-4" /> Search
                </Link>
            </div>
        </div>
    );
}
