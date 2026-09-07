'use client';

import Link from 'next/link';
import Image from 'next/image';
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
        <div className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.35)] bg-gradient-to-r from-[#FF6D00] to-[#FF3D00]">
            <div className="flex justify-around sm:justify-between items-center h-16 md:h-18 px-2 sm:px-6 md:px-10 max-w-md md:max-w-xl mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    if (item.isProfile) {
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[52px] sm:min-w-[60px] py-1 gap-1 transition-all active:scale-95",
                                    isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                                )}
                            >
                                <div className={cn(
                                    "w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border-2 transition-all shadow-sm",
                                    isActive ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.4)]" : "border-white/60"
                                )}>
                                    {currentUser?.avatar ? (
                                        <Image src={currentUser.avatar} alt="Me" width={28} height={28} className="w-full h-full object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full bg-white/20 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white">
                                            {currentUser?.name?.[0] || 'U'}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-white leading-none">{item.name}</span>
                                <span className={cn("w-1 h-1 rounded-full bg-white transition-all duration-300", isActive ? "opacity-100 scale-100" : "opacity-0 scale-0")} />
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[52px] sm:min-w-[60px] py-1 gap-1 transition-all active:scale-95",
                                isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                            )}
                        >
                            {Icon && (
                                <Icon
                                    className={cn(
                                        "w-6 h-6 sm:w-6 sm:h-6 text-white transition-transform duration-200",
                                        isActive ? "scale-110 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]" : ""
                                    )}
                                    strokeWidth={isActive ? 2.8 : 2.2}
                                />
                            )}
                            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold text-white leading-none">{item.name}</span>
                            <span className={cn("w-1 h-1 rounded-full bg-white transition-all duration-300", isActive ? "opacity-100 scale-100" : "opacity-0 scale-0")} />
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default memo(BottomNavComponent);
