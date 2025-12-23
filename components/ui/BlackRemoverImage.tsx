'use client';

import React, { useEffect, useRef, useState } from 'react';

interface BlackRemoverImageProps {
    src: string;
    alt: string;
    className?: string;
    threshold?: number; // 0-255, pixels darker than this sum will be transparent
}

export default function BlackRemoverImage({
    src,
    alt,
    className = "",
    threshold = 50
}: BlackRemoverImageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [processedSrc, setProcessedSrc] = useState<string | null>(null);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Allow processing if on same domain
        img.src = src;

        img.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            // Set canvas dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Draw image
            ctx.drawImage(img, 0, 0);

            // Get pixel data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Loop through pixels
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // Alpha is data[i+3]

                // Simple brightness check or black check
                // If pixel is very dark (sum of RGB is low)
                if (r + g + b < threshold) {
                    data[i + 3] = 0; // Set alpha to 0 (Transparent)
                }
            }

            // Put modified data back
            ctx.putImageData(imageData, 0, 0);

            // Export to data URL
            setProcessedSrc(canvas.toDataURL());
        };
    }, [src, threshold]);

    // Hidden canvas for processing
    return (
        <>
            <canvas ref={canvasRef} className="hidden" />
            {processedSrc ? (
                <img src={processedSrc} alt={alt} className={className} />
            ) : (
                // Fallback while processing (show nothing or original)
                <div className={`animate-pulse bg-white/10 ${className}`} />
            )}
        </>
    );
}
