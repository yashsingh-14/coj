'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Search, ListMusic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

import { memo } from 'react';

function BottomNavComponent() {
    const pathname = usePathname();
    const currentUser = useAppStore(state => state.currentUser);

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Songs', href: '/songs', icon: ListMusic },
        { name: 'Search', href: '/search', icon: Search },
        { name: 'Favourites', href: '/favourites', icon: Heart },
        { name: 'Profile', href: '/profile', icon: null, isProfile: true },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 pb-safe shadow-2xl bg-gradient-to-r from-[#FF6D00] to-[#FF3D00]">
            <div className="flex justify-between items-center h-16 px-6 max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isProfile) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 transition-opacity",
                                    isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className={cn(
                                    "w-6 h-6 rounded-full overflow-hidden border-2 transition-all",
                                    isActive ? "border-white scale-110" : "border-white/50"
                                )}>
                                    {currentUser?.avatar ? (
                                        <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                                            {currentUser?.name?.[0] || 'U'}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] uppercase tracking-wide font-bold text-white">{item.name}</span>
                            </Link>
                        )
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 transition-opacity",
                                isActive ? "opacity-100" : "opacity-60 hover:opacity-100"
                            )}
                        >
                            {Icon && <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />}
                            <span className="text-[10px] uppercase tracking-wide font-bold text-white">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default memo(BottomNavComponent);
