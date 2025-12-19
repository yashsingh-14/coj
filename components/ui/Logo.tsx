export default function Logo({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 100 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <style>{`
        /* Smooth Core Pulse (Reduced Intensity) */
        @keyframes subtle-pulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
        
        /* The "Leher" (Wave) Effect - Gentle Sway */
        @keyframes soft-wave {
          0% { transform: skewX(0deg) translateX(0); }
          25% { transform: skewX(-2deg) translateX(1px); }
          75% { transform: skewX(2deg) translateX(-1px); }
          100% { transform: skewX(0deg) translateX(0); }
        }

        /* Upward Flow + Wave for Internal Layers */
        @keyframes rising-heat {
          0% { transform: translateY(0) skewX(0deg); opacity: 0.5; }
          50% { transform: translateY(-5px) skewX(-3deg); opacity: 0.8; }
          100% { transform: translateY(-10px) skewX(0deg); opacity: 0; }
        }

        @keyframes rise-ember-smooth {
          0% { transform: translateY(0) scale(1) translateX(0); opacity: 0.6; }
          100% { transform: translateY(-30px) scale(0) translateX(5px); opacity: 0; }
        }

        .flame-container { transform-origin: bottom center; }
        
        /* Apply smooth wave to main body */
        .wave-motion { animation: soft-wave 4s ease-in-out infinite; transform-origin: bottom center; }
        
        /* Internal Heat Wave */
        .heat-flow { animation: rising-heat 3s ease-in-out infinite; }
        
        .core-glow { animation: subtle-pulse 3s ease-in-out infinite; transform-origin: bottom center; }
        
        .ember-1 { animation: rise-ember-smooth 4s infinite linear; animation-delay: 0s; }
        .ember-2 { animation: rise-ember-smooth 5s infinite linear; animation-delay: 2s; }
      `}</style>

            <defs>
                <radialGradient id="realFire" cx="50%" cy="100%" r="80%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="15%" stopColor="#FFC107" />
                    <stop offset="40%" stopColor="#FF6D00" />
                    <stop offset="75%" stopColor="#BF360C" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>

                <filter id="softFire" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* TEXT BASE */}
            <g transform="translate(0, 15)">
                <text
                    x="50"
                    y="110"
                    fontSize="24"
                    fontWeight="900"
                    fill="currentColor"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                    style={{ letterSpacing: '0.1em' }}
                    opacity="0.9"
                >
                    COJ
                </text>
                {/* Reflection */}
                <text
                    x="50"
                    y="110"
                    fontSize="24"
                    fontWeight="900"
                    fill="url(#realFire)"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                    style={{ letterSpacing: '0.1em' }}
                    transform="scale(1, -0.4) translate(0, -220)"
                    opacity="0.15"
                    filter="url(#softFire)"
                />
            </g>

            {/* FIRE GROUP */}
            <g transform="translate(0, 20)" className="flame-container">

                {/* Main Fire Body with Sway (Wave) */}
                <g className="wave-motion">
                    <path
                        d="M50 85
                   C 30 85, 20 60, 35 40
                   C 40 35, 45 40, 50 10
                   C 55 40, 60 35, 65 40
                   C 80 60, 70 85, 50 85 Z"
                        fill="url(#realFire)"
                        filter="url(#softFire)"
                        opacity="0.75"
                    />
                </g>

                {/* Internal "Leher" Layer - Rising Heat Waves */}
                {/* Cloned path, slightly smaller, moving up and distorting */}
                <path
                    className="heat-flow"
                    d="M50 80
                C 35 80, 28 60, 40 45
                C 45 40, 48 45, 50 25
                C 52 45, 55 40, 60 45
                C 72 60, 65 80, 50 80 Z"
                    fill="url(#realFire)"
                    style={{ mixBlendMode: 'overlay' }}
                />

                {/* Focused Core (Very subtle pulse) */}
                <path
                    className="core-glow"
                    d="M50 80
               C 42 80, 38 65, 42 55
               C 44 50, 48 52, 50 35
               C 52 52, 56 50, 58 55
               C 62 65, 58 80, 50 80 Z"
                    fill="url(#realFire)"
                    style={{ mixBlendMode: 'screen' }}
                />

                {/* Slow Rising Embers */}
                <circle cx="45" cy="60" r="1" fill="#FFC107" className="ember-1" />
                <circle cx="55" cy="50" r="1.5" fill="#FF9800" className="ember-2" />
            </g>
        </svg>
    );
}
