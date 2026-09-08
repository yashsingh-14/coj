"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export interface Testimonial {
  quote: string;
  name: string;
  designation: string;
  src: string;
}

export interface Colors {
  name?: string;
  designation?: string;
  testimony?: string;
  arrowBackground?: string;
  arrowForeground?: string;
  arrowHoverBackground?: string;
}

export interface FontSizes {
  name?: string;
  designation?: string;
  quote?: string;
}

export interface CircularTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  colors?: Colors;
  fontSizes?: FontSizes;
}

function calculateGap(width: number) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const baseMinGap = width < 480 ? 32 : width < 768 ? 44 : 60;
  const maxGap = 84;
  if (width <= minWidth) return baseMinGap;
  if (width >= maxWidth)
    return Math.max(baseMinGap, maxGap + 0.06018 * (width - maxWidth));
  return baseMinGap + (maxGap - baseMinGap) * ((width - minWidth) / (maxWidth - minWidth));
}

export const CircularTestimonials = ({
  testimonials,
  autoplay = true,
  colors = {},
  fontSizes = {},
}: CircularTestimonialsProps) => {
  // Color & font config
  const colorName = colors.name ?? "#ffffff";
  const colorDesignation = colors.designation ?? "#fbbf24";
  const colorTestimony = colors.testimony ?? "#d1d5db";
  const colorArrowBg = colors.arrowBackground ?? "rgba(255, 255, 255, 0.08)";
  const colorArrowFg = colors.arrowForeground ?? "#ffffff";
  const colorArrowHoverBg = colors.arrowHoverBackground ?? "#f59e0b";
  const fontSizeName = fontSizes.name;
  const fontSizeDesignation = fontSizes.designation;
  const fontSizeQuote = fontSizes.quote;

  // State
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1000);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  const testimonialsLength = useMemo(() => testimonials.length, [testimonials]);
  const activeTestimonial = useMemo(
    () => testimonials[activeIndex] || testimonials[0],
    [activeIndex, testimonials]
  );

  // Responsive gap calculation with check to prevent redundant re-renders
  useEffect(() => {
    function handleResize() {
      if (imageContainerRef.current) {
        const newWidth = imageContainerRef.current.offsetWidth;
        setContainerWidth((prev) => (prev !== newWidth ? newWidth : prev));
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line
  }, [activeIndex, testimonialsLength]);

  // Navigation handlers (Manual only - no auto-timer)
  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonialsLength);
  }, [testimonialsLength]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + testimonialsLength) % testimonialsLength);
  }, [testimonialsLength]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diffX = touchStartX - e.changedTouches[0].clientX;
    if (diffX > 45) {
      handleNext();
    } else if (diffX < -45) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  // Compute transforms for each image (always show 3: left, center, right)
  function getImageStyle(index: number): React.CSSProperties {
    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.7;
    const isActive = index === activeIndex;
    const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index;
    const isRight = (activeIndex + 1) % testimonialsLength === index;

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translate3d(0px, 0px, 0px) scale(1) rotateY(0deg)`,
        transition: "transform 0.45s cubic-bezier(.25,.1,.25,1), opacity 0.45s ease-out",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        willChange: "transform, opacity",
      };
    }
    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 0.8,
        pointerEvents: "auto",
        cursor: "pointer",
        transform: `translate3d(-${gap}px, -${maxStickUp}px, 0px) scale(0.85) rotateY(15deg)`,
        transition: "transform 0.45s cubic-bezier(.25,.1,.25,1), opacity 0.45s ease-out",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        willChange: "transform, opacity",
      };
    }
    if (isRight) {
      return {
        zIndex: 2,
        opacity: 0.8,
        pointerEvents: "auto",
        cursor: "pointer",
        transform: `translate3d(${gap}px, -${maxStickUp}px, 0px) scale(0.85) rotateY(-15deg)`,
        transition: "transform 0.45s cubic-bezier(.25,.1,.25,1), opacity 0.45s ease-out",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        willChange: "transform, opacity",
      };
    }
    // Hide all other images cleanly without keeping GPU compositing layers
    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: "none",
      transform: `translate3d(0px, -${maxStickUp}px, 0px) scale(0.7) rotateY(0deg)`,
      transition: "transform 0.45s cubic-bezier(.25,.1,.25,1), opacity 0.45s ease-out",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
    };
  }

  // Framer Motion variants for quote
  const quoteVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  if (!activeTestimonial) return null;

  return (
    <div
      className="testimonial-container w-full max-w-6xl mx-auto px-2 sm:px-6 py-4 sm:py-8 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="testimonial-grid grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
        
        {/* 3D Image Carousel Perspective Stack */}
        <div className="relative flex justify-center items-center py-4 sm:py-8">
          <div
            className="image-container relative w-[75%] max-w-[220px] sm:max-w-[340px] md:max-w-[380px] h-56 sm:h-80 md:h-96"
            ref={imageContainerRef}
            style={{ perspective: "1000px" }}
          >
            {testimonials.map((testimonial, index) => {
              const isActive = index === activeIndex;
              const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index;
              const isRight = (activeIndex + 1) % testimonialsLength === index;

              return (
                <img
                  key={testimonial.src + index}
                  src={testimonial.src}
                  alt={testimonial.name}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  onClick={() => {
                    if (isLeft) handlePrev();
                    if (isRight) handleNext();
                  }}
                  className={`testimonial-image absolute inset-0 w-full h-full object-cover rounded-2xl sm:rounded-3xl border transition-[box-shadow,border-color] duration-500 ${
                    isActive
                      ? "border-amber-400/40 shadow-[0_12px_32px_rgba(245,158,11,0.22)]"
                      : "border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
                  }`}
                  data-index={index}
                  style={getImageStyle(index)}
                />
              );
            })}
          </div>
        </div>

        {/* Content & Typography */}
        <div className="testimonial-content flex flex-col justify-between space-y-4 sm:space-y-6 md:pl-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              variants={quoteVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="space-y-3 sm:space-y-4"
            >
              <div>
                <span
                  className="inline-block font-mono text-[10px] sm:text-xs md:text-sm font-semibold tracking-widest uppercase mb-1 sm:mb-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-500/10 border border-amber-500/20"
                  style={{ color: colorDesignation, fontSize: fontSizeDesignation }}
                >
                  {activeTestimonial.designation}
                </span>

                <h3
                  className="font-playfair font-bold text-white text-xl sm:text-3xl md:text-4xl tracking-tight mt-1.5 sm:mt-2"
                  style={{ color: colorName, fontSize: fontSizeName }}
                >
                  {activeTestimonial.name}
                </h3>
              </div>

              <p
                className="font-sans leading-relaxed text-xs sm:text-base md:text-lg text-neutral-300 font-light italic"
                style={{ color: colorTestimony, fontSize: fontSizeQuote }}
              >
                &ldquo;{activeTestimonial.quote}&rdquo;
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Controls: Prev/Next Buttons + Dot Indicators */}
          <div className="flex items-center gap-3 sm:gap-4 pt-2">
            <button
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/15 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg active:scale-95 hover:border-amber-400"
              onClick={handlePrev}
              style={{
                backgroundColor: hoverPrev ? colorArrowHoverBg : colorArrowBg,
              }}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              aria-label="Previous testimonial"
            >
              <FaArrowLeft size={16} color={colorArrowFg} />
            </button>
            <button
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/15 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg active:scale-95 hover:border-amber-400"
              onClick={handleNext}
              style={{
                backgroundColor: hoverNext ? colorArrowHoverBg : colorArrowBg,
              }}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              aria-label="Next testimonial"
            >
              <FaArrowRight size={16} color={colorArrowFg} />
            </button>

            {/* Pagination Dots Indicator */}
            <div className="flex items-center gap-1.5 ml-3">
              {testimonials.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => {
                    setActiveIndex(dotIdx);
                  }}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    dotIdx === activeIndex
                      ? "w-6 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircularTestimonials;
