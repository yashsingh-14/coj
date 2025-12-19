'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Search, ListMusic } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Favourites', href: '/favourites', icon: Heart },
        { name: 'Search', href: '/search', icon: Search },
        { name: 'All List', href: '/songs', icon: ListMusic },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 pb-safe shadow-2xl"
            style={{ background: 'var(--nav-gradient)' }}> {/* Exact Gradient applied */}
            <div className="flex justify-between items-center h-16 px-6 max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-opacity",
                                isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                            )}
                        >
                            <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                            <span className="text-[10px] uppercase tracking-wide font-bold text-white">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
