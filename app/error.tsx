'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#02000F] flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-2xl font-black mb-2">Something went wrong!</h2>
            <p className="text-white/40 max-w-md mb-8">
                We apologize for the inconvenience. An unexpected error has occurred.
            </p>

            <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors font-bold"
            >
                <RefreshCcw className="w-4 h-4" /> Try again
            </button>
        </div>
    );
}
