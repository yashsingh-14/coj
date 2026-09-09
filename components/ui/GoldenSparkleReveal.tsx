'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface GoldenSparkleRevealProps {
    children: React.ReactNode;
    className?: string;
    duration?: number; // in ms
    delay?: number; // delay before starting sweep in ms
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
    decay: number;
    twinkleSpeed: number;
    twinklePhase: number;
    isStar?: boolean;
}

const GOLD_PALETTE = [
    '#FFFFFF',
    '#FFF8D6',
    '#FFE072',
    '#FFC83B',
    '#F59E0B',
    '#F97316',
    '#FFD700',
    '#FFF0A0'
];

export default function GoldenSparkleReveal({
    children,
    className = '',
    duration = 2200,
    delay = 100,
}: GoldenSparkleRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

    const [isIntersecting, setIsIntersecting] = useState(false);
    const animRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const particlesRef = useRef<Particle[]>([]);
    const progressRef = useRef(0);

    // Track intersection
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry && entry.isIntersecting) {
                    setIsIntersecting(true);
                } else {
                    setIsIntersecting(false);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '-20px 0px -40px 0px',
            }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // Draw a glittering 4-point star
    const drawStar = (
        ctx: CanvasRenderingContext2D,
        cx: number,
        cy: number,
        spikes: number,
        outerRadius: number,
        innerRadius: number
    ) => {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    };

    const runAnimation = useCallback(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        const textEl = textRef.current;
        if (!canvas || !container || !textEl) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = container.getBoundingClientRect();
        const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

        // Add padding around canvas for floating sparkles
        const paddingX = 40;
        const paddingY = 60;
        const width = rect.width + paddingX * 2;
        const height = rect.height + paddingY * 2;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        particlesRef.current = [];
        progressRef.current = 0;
        startTimeRef.current = null;

        let delayTimer: NodeJS.Timeout;

        const startSweep = () => {
            const animate = (timestamp: number) => {
                if (!startTimeRef.current) startTimeRef.current = timestamp;
                const elapsed = timestamp - startTimeRef.current;
                const p = Math.min(1, elapsed / duration);
                progressRef.current = p;

                // Eased progress for smooth sweeping acceleration and deceleration
                const easedP = p < 0.5 
                    ? 2 * p * p 
                    : 1 - Math.pow(-2 * p + 2, 2) / 2;

                // Unmask the text synchronized with the particle sweep
                // Clip from left to right
                const revealPercentage = easedP * 100;
                textEl.style.clipPath = `polygon(0 0, ${revealPercentage}% 0, ${revealPercentage}% 100%, 0 100%)`;
                textEl.style.opacity = '1';

                ctx.save();
                ctx.scale(dpr, dpr);
                ctx.clearRect(0, 0, width, height);

                // Sweep head position in canvas coordinates
                const sweepX = paddingX + easedP * rect.width;
                const centerY = paddingY + rect.height / 2;

                // Spawn particles while sweeping across
                if (p < 0.98) {
                    const spawnCount = Math.floor(Math.random() * 4) + 4;
                    for (let i = 0; i < spawnCount; i++) {
                        const isStar = Math.random() < 0.22;
                        particlesRef.current.push({
                            x: sweepX + (Math.random() - 0.5) * 20,
                            y: paddingY + Math.random() * rect.height,
                            vx: (Math.random() - 0.25) * 1.6,
                            vy: -(Math.random() * 2.2 + 0.5), // float upwards like golden stardust
                            size: isStar ? Math.random() * 3.5 + 2 : Math.random() * 2.5 + 0.8,
                            color: GOLD_PALETTE[Math.floor(Math.random() * GOLD_PALETTE.length)],
                            alpha: Math.random() * 0.4 + 0.6,
                            decay: Math.random() * 0.018 + 0.012,
                            twinkleSpeed: Math.random() * 0.15 + 0.05,
                            twinklePhase: Math.random() * Math.PI * 2,
                            isStar,
                        });
                    }

                    // Draw glowing leading head light
                    const grad = ctx.createRadialGradient(sweepX, centerY, 0, sweepX, centerY, 50);
                    grad.addColorStop(0, 'rgba(255, 240, 180, 0.45)');
                    grad.addColorStop(0.3, 'rgba(245, 158, 11, 0.22)');
                    grad.addColorStop(1, 'transparent');
                    ctx.fillStyle = grad;
                    ctx.fillRect(sweepX - 60, centerY - 60, 120, 120);
                }

                // Update and render all active golden particles
                const activeParticles: Particle[] = [];
                for (let i = 0; i < particlesRef.current.length; i++) {
                    const pt = particlesRef.current[i];
                    pt.x += pt.vx;
                    pt.y += pt.vy;
                    pt.alpha -= pt.decay;
                    pt.twinklePhase += pt.twinkleSpeed;

                    if (pt.alpha > 0) {
                        const currentAlpha = Math.max(0, Math.min(1, pt.alpha * (0.7 + 0.3 * Math.sin(pt.twinklePhase))));

                        ctx.save();
                        ctx.globalAlpha = currentAlpha;
                        ctx.fillStyle = pt.color;
                        ctx.shadowColor = pt.color;
                        ctx.shadowBlur = pt.isStar ? 12 : 6;

                        if (pt.isStar) {
                            drawStar(ctx, pt.x, pt.y, 4, pt.size * 1.8, pt.size * 0.6);
                        } else {
                            ctx.beginPath();
                            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        ctx.restore();
                        activeParticles.push(pt);
                    }
                }
                particlesRef.current = activeParticles;
                ctx.restore();

                // Continue loop until sweep finishes and all particles dissipate
                if (p < 1 || activeParticles.length > 0) {
                    animRef.current = requestAnimationFrame(animate);
                } else {
                    // Fully revealed state
                    textEl.style.clipPath = 'none';
                    if (ctx) ctx.clearRect(0, 0, width, height);
                }
            };

            animRef.current = requestAnimationFrame(animate);
        };

        delayTimer = setTimeout(startSweep, delay);

        return () => {
            clearTimeout(delayTimer);
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, [duration, delay]);

    // React to intersection state (plays when scrolled into view, resets when scrolled away)
    useEffect(() => {
        const textEl = textRef.current;
        const canvas = canvasRef.current;

        if (isIntersecting) {
            const cleanup = runAnimation();
            return () => {
                cleanup?.();
            };
        } else {
            // Scrolled out of view: reset mask silently so it's ready to reveal on return
            if (textEl) {
                textEl.style.clipPath = 'polygon(0 0, 0 0, 0 100%, 0 100%)';
                textEl.style.opacity = '0';
            }
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            if (animRef.current) {
                cancelAnimationFrame(animRef.current);
                animRef.current = null;
            }
            particlesRef.current = [];
            progressRef.current = 0;
            startTimeRef.current = null;
        }
    }, [isIntersecting, runAnimation]);

    return (
        <div ref={containerRef} className={`relative inline-block w-full overflow-visible ${className}`}>
            {/* Canvas overlay for particle glittering trail */}
            <canvas
                ref={canvasRef}
                className="pointer-events-none absolute -top-[60px] -left-[40px] z-20 overflow-visible"
                style={{
                    width: 'calc(100% + 80px)',
                    height: 'calc(100% + 120px)',
                }}
            />

            {/* Revealed Text Element */}
            <div
                ref={textRef}
                className="relative z-10 will-change-[clip-path,opacity] transition-opacity duration-300"
                style={{
                    clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
                    opacity: 0,
                }}
            >
                {children}
            </div>
        </div>
    );
}
