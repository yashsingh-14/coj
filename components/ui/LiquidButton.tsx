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
  variant?: "glass" | "amber";
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
      "border-white/40 hover:border-amber-400/80 bg-white/10 text-white hover:shadow-[0_0_35px_rgba(245,158,11,0.35)]",
    amber:
      "border-amber-500/40 hover:border-amber-400 bg-amber-500/10 text-white hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]",
  }[variant];

  const baseClasses = `liquid-btn group relative inline-flex items-center justify-center gap-2.5 sm:gap-3 rounded-full border font-semibold tracking-wide backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.45)] transition-all duration-500 active:scale-95 ${sizeClasses} ${variantClasses} ${className}`;

  const waveElement = (
    <div className="liquid-water-fill bg-gradient-to-t from-amber-500 via-amber-400 to-amber-300 text-amber-300 pointer-events-none">
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
        className="liquid-wave-svg liquid-wave-2 text-amber-200"
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
        <span className="relative z-10 text-amber-400 group-hover:text-neutral-950 transition-colors duration-300">
          {icon}
        </span>
      )}
      <span className="relative z-10 font-bold group-hover:text-neutral-950 transition-colors duration-500">
        {children}
      </span>
      {icon && iconPosition === "right" && (
        <span className="relative z-10 text-amber-400 group-hover:text-neutral-950 group-hover:translate-x-1 transition-all duration-300">
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
