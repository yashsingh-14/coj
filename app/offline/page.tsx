'use client';

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="text-center px-4">
                {/* Icon */}
                <div className="mb-6">
                    <svg
                        className="w-24 h-24 mx-auto text-white/20"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 9 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                    You're Offline
                </h1>

                {/* Description */}
                <p className="text-lg text-white/60 mb-8 max-w-md mx-auto">
                    It looks like you've lost your internet connection. Please check your network and try again.
                </p>

                {/* Retry Button */}
                <button
                    onClick={() => window.location.reload()}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 rounded-xl transition-colors"
                >
                    Try Again
                </button>

                {/* Tips */}
                <div className="mt-12 text-sm text-white/40 max-w-md mx-auto">
                    <p className="mb-2">💡 Tip: Some pages may still be available offline</p>
                    <a href="/" className="text-amber-500 hover:text-amber-400 underline">
                        Go to Homepage
                    </a>
                </div>
            </div>
        </div>
    );
}
