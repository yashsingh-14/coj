'use client';

import BottomNav from '@/components/ui/BottomNav';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { mode } = useAppStore();

    // Show BottomNav if:
    // 1. We are NOT on home page (utility pages always need nav)
    // 2. OR We are on home page AND mode is UTILITY
    const showNav = pathname !== '/' || mode === 'UTILITY';

    return (
        <>
            <div className={showNav ? 'pb-24' : ''}>
                {children}
            </div>

            <div className={`transition-transform duration-500 ease-in-out ${showNav ? 'translate-y-0' : 'translate-y-full'}`}>
                <BottomNav />
            </div>
        </>
    );
}
