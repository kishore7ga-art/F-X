"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const MaskContainer = ({
  children,
  revealText,
  size = 40,
  revealSize = 600,
  className,
}: {
  children?: React.ReactNode;
  revealText?: React.ReactNode;
  size?: number;
  revealSize?: number;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const updateMousePosition = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("mousemove", updateMousePosition);
    return () => {
      el.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  const currentMaskSize = isHovered ? revealSize : size;
  const posX = mousePosition.x !== null ? mousePosition.x : 0;
  const posY = mousePosition.y !== null ? mousePosition.y : 0;

  return (
    <div
      ref={containerRef}
      className={cn("h-full w-full relative font-sans overflow-hidden bg-black", className)}
    >
      <motion.div
        className="w-full h-full flex items-center justify-center absolute inset-0 bg-gradient-to-b from-neutral-900 via-black to-neutral-950 text-white z-20 pointer-events-none"
        style={{
          WebkitMaskImage: `radial-gradient(${currentMaskSize}px circle at ${posX}px ${posY}px, black 0%, transparent 100%)`,
          maskImage: `radial-gradient(${currentMaskSize}px circle at ${posX}px ${posY}px, black 0%, transparent 100%)`,
        }}
      >
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="max-w-5xl mx-auto text-center text-white font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl cursor-pointer pointer-events-auto px-6 py-12 leading-tight"
        >
          {children}
        </div>
      </motion.div>

      <div className="w-full h-full flex items-center justify-center text-neutral-400 px-6 py-12 bg-black z-10">
        {revealText}
      </div>
    </div>
  );
};
