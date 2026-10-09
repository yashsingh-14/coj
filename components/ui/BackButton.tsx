'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    fallback?: string;
    iconClassName?: string;
    children?: React.ReactNode;
}

export default function BackButton({
    fallback = '/worship',
    iconClassName = 'w-5 h-5',
    className = '',
    children,
    onClick,
    ...props
}: BackButtonProps) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
            onClick(e);
            if (e.defaultPrevented) return;
        }

        // Check if there is previous history in this session
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            router.push(fallback);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={className}
            aria-label="Go back"
            {...props}
        >
            <ArrowLeft className={iconClassName} />
            {children}
        </button>
    );
}
