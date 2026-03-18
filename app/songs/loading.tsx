export default function Loading() {
    return (
        <div className="min-h-screen bg-[#02000F] p-6 pb-32">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header skeleton */}
                <div className="h-10 w-48 bg-white/5 rounded-xl animate-pulse" />
                <div className="h-5 w-72 bg-white/5 rounded-lg animate-pulse" />
                
                {/* Grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="bg-white/5 rounded-2xl p-4 space-y-3 animate-pulse">
                            <div className="w-full aspect-[4/3] bg-white/5 rounded-xl" />
                            <div className="h-5 w-3/4 bg-white/5 rounded-lg" />
                            <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
