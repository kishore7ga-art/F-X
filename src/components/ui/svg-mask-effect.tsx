"use client";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const MaskContainer = ({
  children,
  revealText,
  size = 0,
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
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
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

  const maskRadius = isHovered ? revealSize : size;
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage: `radial-gradient(circle ${maskRadius}px at ${mousePosition.x}px ${mousePosition.y}px, black 0%, black 65%, transparent 100%)`,
    maskImage: `radial-gradient(circle ${maskRadius}px at ${mousePosition.x}px ${mousePosition.y}px, black 0%, black 65%, transparent 100%)`,
    transition: "mask-image 0.2s ease-out, -webkit-mask-image 0.2s ease-out",
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("h-full w-full relative font-sans overflow-hidden bg-black cursor-pointer", className)}
    >
      {/* SPOTLIGHT REVEAL LAYER */}
      <div
        className="w-full h-full flex items-center justify-center absolute inset-0 bg-neutral-950 text-white z-20 pointer-events-none"
        style={maskStyle}
      >
        <div className="max-w-5xl mx-auto text-center text-white font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl px-6 py-12 leading-tight">
          {children}
        </div>
      </div>

      {/* BASE TEXT LAYER */}
      <div className="w-full h-full flex items-center justify-center text-neutral-400 px-6 py-12 bg-black z-10">
        <div className="max-w-5xl mx-auto text-center font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-neutral-300 leading-tight">
          {revealText}
        </div>
      </div>
    </div>
  );
};
