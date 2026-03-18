export default function Loading() {
    return (
        <div className="min-h-screen bg-[#02000F] p-6 pb-32">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header skeleton */}
                <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />
                <div className="h-5 w-80 bg-white/5 rounded-lg animate-pulse" />
                
                {/* List skeleton */}
                <div className="space-y-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 bg-white/5 rounded-xl p-4 animate-pulse">
                            <div className="w-4 h-6 bg-white/5 rounded" />
                            <div className="w-12 h-12 bg-white/5 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 w-52 bg-white/5 rounded-lg" />
                                <div className="h-3 w-36 bg-white/5 rounded-lg" />
                            </div>
                            <div className="h-8 w-16 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
