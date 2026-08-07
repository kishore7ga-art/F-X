"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const MaskContainer = ({
  children,
  revealText,
  size = 10,
  revealSize = 220,
  className,
}: {
  children?: string | React.ReactNode;
  revealText?: string | React.ReactNode;
  size?: number;
  revealSize?: number;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
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
      if (el) el.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  const maskSize = isHovered ? revealSize : size;

  return (
    <motion.div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("relative h-[32rem] w-full overflow-hidden bg-black font-sans cursor-pointer border border-white/10 rounded-3xl", className)}
      animate={{
        backgroundColor: isHovered ? "#09090b" : "#000000",
      }}
      transition={{
        backgroundColor: { duration: 0.3 },
      }}
    >
      {/* REVEAL LAYER (MAPPED TO MASK) */}
      <motion.div
        className="absolute inset-0 flex h-full w-full items-center justify-center bg-blue-600/10 text-white z-20 pointer-events-none"
        animate={{
          maskPosition: `${mousePosition.x - maskSize / 2}px ${mousePosition.y - maskSize / 2}px`,
          maskSize: `${maskSize}px`,
        }}
        transition={{
          maskSize: { duration: 0.25, ease: "easeInOut" },
          maskPosition: { duration: 0.1, ease: "linear" },
        }}
        style={{
          WebkitMaskImage: "url(/mask.svg)",
          WebkitMaskRepeat: "no-repeat",
          maskImage: "url(/mask.svg)",
          maskRepeat: "no-repeat",
        }}
      >
        <div className="w-full flex items-center justify-center text-center px-6">
          {children}
        </div>
      </motion.div>

      {/* BASE LAYER */}
      <div className="flex h-full w-full items-center justify-center text-center px-6">
        {revealText}
      </div>
    </motion.div>
  );
};
