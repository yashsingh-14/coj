'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScrollProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const lenisRef = useRef<Lenis | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        // Initialize Lenis with identical luxury smooth momentum physics
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.5,
            infinite: false,
        });

        lenisRef.current = lenis;
        (window as any).lenis = lenis;

        // Sync Lenis scroll events with ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        // Drive Lenis directly via GSAP ticker for 100% frame-perfect pin synchronization
        const updateLenis = (time: number) => {
            lenis.raf(time * 1000);
        };
        gsap.ticker.add(updateLenis);
        gsap.ticker.lagSmoothing(0);

        // Handle smooth internal hash/anchor links (#vision, #gatherings, etc.)
        const handleAnchorClick = (e: MouseEvent) => {
            const target = (e.target as HTMLElement).closest('a');
            if (!target) return;
            const href = target.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                const element = document.querySelector(href);
                if (element) {
                    e.preventDefault();
                    lenis.scrollTo(element as HTMLElement, { offset: -60, duration: 1.4 });
                }
            }
        };

        document.addEventListener('click', handleAnchorClick);

        return () => {
            document.removeEventListener('click', handleAnchorClick);
            gsap.ticker.remove(updateLenis);
            lenis.destroy();
            lenisRef.current = null;
            if ((window as any).lenis === lenis) {
                delete (window as any).lenis;
            }
        };
    }, []);

    // Scroll to top cleanly on route navigation
    useEffect(() => {
        if (lenisRef.current) {
            lenisRef.current.scrollTo(0, { immediate: true });
        }
    }, [pathname]);

    return <>{children}</>;
}
