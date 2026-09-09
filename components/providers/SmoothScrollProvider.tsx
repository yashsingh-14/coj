'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { usePathname } from 'next/navigation';

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

        // Continuous requestAnimationFrame loop
        let rafId: number;
        function raf(time: number) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        // Sync with GSAP ScrollTrigger if available
        try {
            import('gsap/ScrollTrigger')
                .then(({ ScrollTrigger }) => {
                    lenis.on('scroll', () => ScrollTrigger.update());
                })
                .catch(() => {});
        } catch (_) {}

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
            cancelAnimationFrame(rafId);
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
