'use client';

import React, { useRef, useState } from 'react';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    scale?: number;
    max?: number; // Max tilt rotation in degrees
}

export default function TiltCard({ children, className = '', scale = 1.05, max = 15 }: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();

        // Calculate center of card
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate mouse position relative to center
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        // Calculate rotation (max degrees)
        // Rotate Y based on X position (inverted)
        // Rotate X based on Y position (inverted for natural tilt)
        const rotateY = (mouseX / (rect.width / 2)) * max;
        const rotateX = (mouseY / (rect.height / 2)) * -max;

        setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        setRotation({ x: 0, y: 0 }); // Reset position
    };

    return (
        <div
            ref={cardRef}
            className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
            style={{
                transform: `perspective(1000px) rotateX(${isHovering ? rotation.x : 0}deg) rotateY(${isHovering ? rotation.y : 0}deg) scale3d(${isHovering ? scale : 1}, ${isHovering ? scale : 1}, 1)`,
                transformStyle: 'preserve-3d'
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Glare Effect */}
            <div
                className="absolute inset-0 w-full h-full pointer-events-none opacity-0 transition-opacity duration-300 z-50 rounded-[inherit] mix-blend-overlay"
                style={{
                    opacity: isHovering ? 0.4 : 0,
                    background: `linear-gradient(${180 - rotation.x * 5}deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 80%)`
                }}
            />
            {children}
        </div>
    );
}
