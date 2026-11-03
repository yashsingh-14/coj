'use client';

import React, { useState } from 'react';

interface UserAvatarProps {
    src?: string | null;
    name?: string | null;
    size?: number;
    className?: string;
    textClassName?: string;
}

export default function UserAvatar({
    src,
    name,
    size = 36,
    className = "w-full h-full",
    textClassName = "font-bold text-white text-xs"
}: UserAvatarProps) {
    const [hasError, setHasError] = useState(false);
    const initial = name?.trim()?.charAt(0)?.toUpperCase() || 'U';

    const isValidUrl = Boolean(
        src &&
        typeof src === 'string' &&
        src.trim().length > 0 &&
        src !== 'undefined' &&
        src !== 'null'
    );

    if (!isValidUrl || hasError) {
        return (
            <span className={`select-none flex items-center justify-center ${textClassName}`}>
                {initial}
            </span>
        );
    }

    return (
        <img
            src={src!}
            alt={name || 'User'}
            width={size}
            height={size}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => setHasError(true)}
            className={`${className} object-cover`}
        />
    );
}
