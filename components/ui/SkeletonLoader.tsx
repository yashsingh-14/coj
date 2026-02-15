export function SongCardSkeleton() {
    return (
        <div className="animate-pulse bg-white/5 rounded-3xl overflow-hidden border border-white/5">
            {/* Image skeleton */}
            <div className="h-48 bg-gray-700/50"></div>

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div className="h-5 bg-gray-700/50 rounded w-3/4"></div>

                {/* Artist */}
                <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>

                {/* Category tag */}
                <div className="h-6 bg-gray-700/50 rounded-full w-20"></div>
            </div>
        </div>
    );
}

export function SongViewerSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Header */}
            <div className="space-y-3">
                <div className="h-8 bg-gray-700/50 rounded w-2/3"></div>
                <div className="h-6 bg-gray-700/50 rounded w-1/3"></div>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
                <div className="h-10 bg-gray-700/50 rounded w-24"></div>
                <div className="h-10 bg-gray-700/50 rounded w-24"></div>
                <div className="h-10 bg-gray-700/50 rounded w-24"></div>
            </div>

            {/* Content */}
            <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-700/50 rounded" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                ))}
            </div>
        </div>
    );
}

export function AdminTableSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                    <div className="h-16 w-16 bg-gray-700/50 rounded"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-700/50 rounded w-1/4"></div>
                    </div>
                    <div className="h-8 w-20 bg-gray-700/50 rounded"></div>
                </div>
            ))}
        </div>
    );
}
