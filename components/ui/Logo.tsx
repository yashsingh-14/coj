export default function Logo({ className = "w-12" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center transform-style-3d ${className}`}>
            <style jsx>{`
                @keyframes fire-pulse-logo {
                    0% {
                        filter: drop-shadow(0 0 5px rgba(255, 100, 0, 0.3)) brightness(1) saturate(1);
                        transform: scale(1);
                    }
                    50% {
                        filter: drop-shadow(0 0 15px rgba(255, 60, 0, 0.6)) brightness(1.15) saturate(1.2);
                        transform: scale(1.05);
                    }
                    100% {
                        filter: drop-shadow(0 0 5px rgba(255, 100, 0, 0.3)) brightness(1) saturate(1);
                        transform: scale(1);
                    }
                }
            `}</style>

            <div className="relative w-full h-full" style={{ animation: 'fire-pulse-logo 3s infinite ease-in-out' }}>
                <img
                    src="/images/logo-main.png"
                    alt="Call of Jesus Ministries"
                    className="w-full h-full object-contain"
                />
            </div>
        </div>
    );
}
