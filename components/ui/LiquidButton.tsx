"use client";

import React from "react";
import Link from "next/link";

export interface LiquidButtonProps {
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
  variant?: "glass" | "amber" | "flame" | "spirit" | "celestial";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  ariaLabel?: string;
  disabled?: boolean;
}

export const LiquidButton: React.FC<LiquidButtonProps> = ({
  href,
  target,
  rel,
  onClick,
  children,
  className = "",
  type = "button",
  size = "md",
  variant = "glass",
  icon,
  iconPosition = "right",
  ariaLabel,
  disabled = false,
}) => {
  const sizeClasses = {
    sm: "px-5 py-2.5 text-xs",
    md: "px-7 py-3.5 text-xs sm:text-sm",
    lg: "px-8 py-4 text-sm sm:text-base",
  }[size];

  const variantClasses = {
    glass:
      "border-[#F4EDE2]/25 hover:border-[#FF5A2E]/80 bg-[#F4EDE2]/[0.05] text-[#F4EDE2] hover:shadow-[0_0_35px_rgba(255,90,46,0.35)]",
    amber:
      "border-[#FF5A2E]/40 hover:border-[#FF5A2E] bg-[#FF5A2E]/10 text-[#F4EDE2] hover:shadow-[0_0_35px_rgba(255,90,46,0.4)]",
    flame:
      "border-[#FF5A2E]/40 hover:border-[#FF5A2E] bg-[#FF5A2E]/10 text-[#F4EDE2] hover:shadow-[0_0_35px_rgba(255,90,46,0.4)]",
    spirit:
      "border-[#6E5BFF]/40 hover:border-[#6E5BFF] bg-[#6E5BFF]/10 text-[#F4EDE2] hover:shadow-[0_0_35px_rgba(110,91,255,0.4)]",
    celestial:
      "border-[#6E5BFF]/30 hover:border-[#FF5A2E] bg-gradient-to-r from-[#6E5BFF]/15 via-[#E11D48]/15 to-[#FF5A2E]/15 text-[#F4EDE2] hover:shadow-[0_0_35px_rgba(255,90,46,0.35)]",
  }[variant];

  const baseClasses = `liquid-btn group relative inline-flex items-center justify-center gap-2.5 sm:gap-3 rounded-full border font-semibold tracking-wide shadow-[0_4px_20px_rgba(0,0,0,0.45)] transition-all duration-300 active:scale-95 ${sizeClasses} ${variantClasses} ${className}`;

  const waveGradientClass =
    variant === "spirit"
      ? "bg-gradient-to-t from-[#4936E0] via-[#6E5BFF] to-[#A78BFA] text-[#6E5BFF]"
      : variant === "celestial"
      ? "bg-gradient-to-t from-[#6E5BFF] via-[#E11D48] to-[#FFB37A] text-[#E11D48]"
      : "bg-gradient-to-t from-[#C2361A] via-[#FF5A2E] to-[#FFB37A] text-[#FF5A2E]";

  const waveAccentColor =
    variant === "spirit"
      ? "text-[#C4B5FD]"
      : variant === "celestial"
      ? "text-[#FFB37A]"
      : "text-[#FFB37A]";

  const iconAccentColor =
    variant === "spirit"
      ? "text-[#A78BFA]"
      : variant === "celestial"
      ? "text-[#FFB37A]"
      : "text-[#FF5A2E]";

  const waveElement = (
    <div className={`liquid-water-fill ${waveGradientClass} pointer-events-none`}>
      <svg
        className="liquid-wave-svg liquid-wave-1"
        viewBox="0 0 120 20"
        preserveAspectRatio="none"
      >
        <path
          d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z"
          fill="currentColor"
        />
      </svg>
      <svg
        className={`liquid-wave-svg liquid-wave-2 ${waveAccentColor}`}
        viewBox="0 0 120 20"
        preserveAspectRatio="none"
      >
        <path
          d="M0,10 C30,22 40,-2 60,10 C80,22 90,-2 120,10 L120,20 L0,20 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );

  const content = (
    <>
      {waveElement}
      {icon && iconPosition === "left" && (
        <span className={`relative z-10 ${iconAccentColor} group-hover:text-neutral-950 transition-colors duration-300`}>
          {icon}
        </span>
      )}
      <span className="relative z-10 font-bold group-hover:text-neutral-950 transition-colors duration-500">
        {children}
      </span>
      {icon && iconPosition === "right" && (
        <span className={`relative z-10 ${iconAccentColor} group-hover:text-neutral-950 group-hover:translate-x-1 transition-all duration-300`}>
          {icon}
        </span>
      )}
    </>
  );

  if (href) {
    const isExternal =
      href.startsWith("http") || href.startsWith("https") || href.startsWith("//");
    if (isExternal) {
      return (
        <a
          href={href}
          target={target ?? "_blank"}
          rel={rel ?? "noopener noreferrer"}
          className={baseClasses}
          onClick={onClick}
          aria-label={ariaLabel}
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className={baseClasses}
        onClick={onClick}
        aria-label={ariaLabel}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={baseClasses}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
};

export default LiquidButton;
