export default function Loading() {
    return (
        <div className="min-h-screen bg-[#02000F] p-6 pb-32">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header skeleton */}
                <div className="h-10 w-64 bg-white/5 rounded-xl animate-pulse" />

                {/* Category grid skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="aspect-square bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}
