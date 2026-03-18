export default function Loading() {
    return (
        <div className="min-h-screen bg-[#02000F] p-6 pb-32">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header skeleton */}
                <div className="h-10 w-56 bg-white/5 rounded-xl animate-pulse" />
                
                {/* Search bar skeleton */}
                <div className="h-14 w-full bg-white/5 rounded-2xl animate-pulse" />
                
                {/* Results skeleton */}
                <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/5 rounded-xl p-4 animate-pulse">
                            <div className="w-12 h-12 bg-white/5 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 w-48 bg-white/5 rounded-lg" />
                                <div className="h-3 w-32 bg-white/5 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
