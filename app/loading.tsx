export default function Loading() {
    return (
        <div className="min-h-screen bg-[#02000F] flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-white/40 text-sm uppercase tracking-widest font-bold animate-pulse">
                    Loading
                </p>
            </div>
        </div>
    );
}
