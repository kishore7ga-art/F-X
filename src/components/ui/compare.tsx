"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { IconDotsVertical } from "@tabler/icons-react";

interface CompareProps {
  firstImage?: string;
  secondImage?: string;
  className?: string;
  firstImageClassName?: string;
  secondImageClassname?: string;
  initialSliderPercentage?: number;
  slideMode?: "hover" | "drag";
  showHandlebar?: boolean;
  autoplay?: boolean;
  autoplayDuration?: number;
  leftBadge?: string;
  leftTitle?: string;
  leftDescription?: string;
  rightBadge?: string;
  rightTitle?: string;
  rightDescription?: string;
}

export const Compare = ({
  firstImage = "",
  secondImage = "",
  className,
  firstImageClassName,
  secondImageClassname,
  initialSliderPercentage = 50,
  slideMode = "drag",
  showHandlebar = true,
  autoplay = false,
  autoplayDuration = 5000,
  leftBadge = "WITHOUT XITE",
  leftTitle = "Traditional College Website",
  leftDescription = "Outdated design, difficult to maintain, poor user experience.",
  rightBadge = "WITH XITE",
  rightTitle = "Website Built with XITE",
  rightDescription = "Modern design, responsive layout, easy to customize, ready to publish.",
}: CompareProps) => {
  const [sliderXPercent, setSliderXPercent] = useState(initialSliderPercentage);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = useCallback(() => {
    if (!autoplay) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsedTime = Date.now() - startTime;
      const progress =
        (elapsedTime % (autoplayDuration * 2)) / autoplayDuration;
      const percentage = progress <= 1 ? progress * 100 : (2 - progress) * 100;

      setSliderXPercent(percentage);
      autoplayRef.current = setTimeout(animate, 16);
    };

    animate();
  }, [autoplay, autoplayDuration]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearTimeout(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  function mouseEnterHandler() {
    setIsMouseOver(true);
    stopAutoplay();
  }

  function mouseLeaveHandler() {
    setIsMouseOver(false);
    if (slideMode === "hover") {
      setSliderXPercent(initialSliderPercentage);
    }
    if (slideMode === "drag") {
      setIsDragging(false);
    }
    startAutoplay();
  }

  const handleStart = useCallback(
    (clientX: number) => {
      if (slideMode === "drag" || slideMode === "hover") {
        setIsDragging(true);
      }
    },
    [slideMode]
  );

  const handleEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;
      if (slideMode === "hover" || (slideMode === "drag" && isDragging)) {
        const rect = sliderRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = (x / rect.width) * 100;
        requestAnimationFrame(() => {
          setSliderXPercent(Math.max(0, Math.min(100, percent)));
        });
      }
    },
    [slideMode, isDragging]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => handleStart(e.clientX),
    [handleStart]
  );
  const handleMouseUp = useCallback(() => handleEnd(), [handleEnd]);
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => handleMove(e.clientX),
    [handleMove]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleStart(e.touches[0].clientX);
    },
    [handleStart]
  );

  const handleTouchEnd = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  return (
    <div
      ref={sliderRef}
      className={cn("w-full h-[500px] overflow-hidden rounded-2xl relative select-none", className)}
      style={{
        position: "relative",
        cursor: "col-resize",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={mouseLeaveHandler}
      onMouseEnter={mouseEnterHandler}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {/* SLIDER HANDLEBAR & LINE */}
      <AnimatePresence initial={false}>
        <motion.div
          className="h-full w-0.5 absolute top-0 m-auto z-40 bg-gradient-to-b from-transparent via-blue-400 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.8)] pointer-events-none"
          style={{
            left: `${sliderXPercent}%`,
            top: "0",
            zIndex: 40,
          }}
          transition={{ duration: 0 }}
        >
          <div className="w-36 h-full [mask-image:radial-gradient(100px_at_left,white,transparent)] absolute top-1/2 -translate-y-1/2 left-0 bg-gradient-to-r from-blue-500 via-transparent to-transparent z-20 opacity-60" />
          {showHandlebar && (
            <div className="h-8 w-8 rounded-full top-1/2 -translate-y-1/2 bg-white text-black z-50 -right-4 absolute flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.6)] border-2 border-blue-500 cursor-grab active:cursor-grabbing">
              <IconDotsVertical className="h-4 w-4 text-black" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* LEFT SIDE: WITHOUT XITE (CLIPPED OVERLAY) */}
      <div className="overflow-hidden w-full h-full relative z-20 pointer-events-none">
        <AnimatePresence initial={false}>
          {firstImage ? (
            <motion.div
              className={cn(
                "absolute inset-0 z-20 rounded-2xl shrink-0 w-full h-full select-none overflow-hidden",
                firstImageClassName
              )}
              style={{
                clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)`,
              }}
              transition={{ duration: 0 }}
            >
              <img
                alt="Without XITE"
                src={firstImage}
                className={cn(
                  "absolute inset-0 z-20 rounded-2xl shrink-0 w-full h-full select-none object-cover object-top",
                  firstImageClassName
                )}
                draggable={false}
              />

              {/* Dark Overlay for readability */}
              <div className="absolute inset-0 bg-black/40 z-25 pointer-events-none" />

              {/* Top-Left Badge */}
              <div className="absolute top-4 left-4 z-30 pointer-events-none">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-xl border border-red-400/40 backdrop-blur-md">
                  {leftBadge}
                </span>
              </div>

              {/* Bottom-Left Description Card */}
              <div className="absolute bottom-4 left-4 z-30 max-w-[280px] sm:max-w-[340px] pointer-events-none text-left bg-black/80 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 shadow-2xl">
                <p className="text-xs sm:text-sm font-bold text-white leading-snug">{leftTitle}</p>
                <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">{leftDescription}</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* RIGHT SIDE: WITH XITE (BACKGROUND) */}
      <AnimatePresence initial={false}>
        {secondImage ? (
          <div className="absolute top-0 left-0 z-[19] rounded-2xl w-full h-full select-none overflow-hidden pointer-events-none">
            <img
              className={cn(
                "absolute top-0 left-0 z-[19] rounded-2xl w-full h-full select-none object-cover object-top",
                secondImageClassname
              )}
              alt="With XITE"
              src={secondImage}
              draggable={false}
            />

            {/* Top-Right Badge */}
            <div className="absolute top-4 right-4 z-30 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-white shadow-xl border border-emerald-400/40 backdrop-blur-md">
                {rightBadge}
              </span>
            </div>

            {/* Bottom-Right Description Card */}
            <div className="absolute bottom-4 right-4 z-30 max-w-[280px] sm:max-w-[340px] pointer-events-none text-right bg-black/80 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 shadow-2xl">
              <p className="text-xs sm:text-sm font-bold text-white leading-snug">{rightTitle}</p>
              <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">{rightDescription}</p>
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

const MemoizedSparklesCore = React.memo(SparklesCore);
