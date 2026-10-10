'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw, WifiOff, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('App error caught by boundary:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#02000F] flex flex-col items-center justify-center p-6 text-center text-white font-sans selection:bg-amber-500 selection:text-black">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6 text-red-500">
                <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black mb-2 tracking-tight">Something went wrong!</h2>
            <p className="text-white/40 max-w-md mb-8 text-sm">
                We apologize for the inconvenience. An unexpected error occurred or the network connection dropped.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
                <button
                    onClick={reset}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-95"
                >
                    <RefreshCcw className="w-4 h-4" />
                    <span>Try again</span>
                </button>

                <Link
                    href="/offline"
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-sm transition-all active:scale-95"
                >
                    <WifiOff className="w-4 h-4 text-amber-400" />
                    <span>Offline Songbook</span>
                </Link>
            </div>

            <button
                onClick={() => { window.location.href = '/'; }}
                className="mt-6 text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1.5"
            >
                <Home className="w-3.5 h-3.5" />
                <span>Go to Home Page</span>
            </button>
        </div>
    );
}
