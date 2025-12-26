export default function Logo({ className = "w-12" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center transform-style-3d ${className}`}>
            <div className="relative w-full h-full animate-fire-pulse-logo">
                <img
                    src="/images/logo-main.png"
                    alt="Call of Jesus Ministries"
                    className="w-full h-full object-contain"
                />
            </div>
        </div>
    );
}
