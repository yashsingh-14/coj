import Logo from '@/components/ui/Logo';

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#02000F] flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--brand)]/10 rounded-full blur-[80px] animate-pulse-slow"></div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="relative">
                    {/* Ring Spinner */}
                    <div className="absolute -inset-4 border border-white/5 rounded-full animate-spin-slow"></div>
                    <div className="absolute -inset-4 border border-t-[var(--brand)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>

                    {/* Logo */}
                    <Logo className="w-16 h-auto opacity-80" />
                </div>

                <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">
                    Loading
                </p>
            </div>
        </div>
    );
}
