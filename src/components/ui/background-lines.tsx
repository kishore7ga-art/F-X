"use client";

import { cn } from "@/lib/cn";
import { motion } from "framer-motion";
import React from "react";

export const BackgroundLines = ({
  children,
  className,
  svgOptions,
}: {
  children?: React.ReactNode;
  className?: string;
  svgOptions?: {
    duration?: number;
  };
}) => {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-black dark:bg-black flex flex-col items-center justify-center relative overflow-hidden py-12",
        className
      )}
    >
      <SVG className="pointer-events-none absolute inset-0 z-0 h-full w-full" duration={svgOptions?.duration} />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

const SVG = ({ className, duration = 10 }: { className?: string; duration?: number }) => {
  const paths = [
    "M-100 100 C 200 150, 400 50, 600 200 S 900 300, 1200 150 S 1500 50, 1800 200",
    "M-100 250 C 300 200, 500 400, 800 250 S 1100 100, 1400 300 S 1700 200, 2000 350",
    "M-100 400 C 150 450, 450 300, 750 450 S 1050 500, 1350 350 S 1650 450, 1950 300",
    "M-100 550 C 250 500, 550 650, 850 500 S 1150 400, 1450 600 S 1750 500, 2050 650",
    "M-100 700 C 350 600, 650 800, 950 650 S 1250 750, 1550 600 S 1850 750, 2150 600",
    "M-100 850 C 100 750, 400 900, 700 800 S 1000 950, 1300 800 S 1600 900, 1900 750",
  ];

  return (
    <svg
      className={className}
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="line-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
          <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="line-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {paths.map((path, idx) => (
        <React.Fragment key={idx}>
          {/* Static background path */}
          <path
            d={path}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Animated flowing glowing path */}
          <motion.path
            d={path}
            stroke={idx % 2 === 0 ? "url(#line-gradient-1)" : "url(#line-gradient-2)"}
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0.2, pathOffset: 0 }}
            animate={{
              pathOffset: [0, 1],
            }}
            transition={{
              duration: duration + idx * 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </React.Fragment>
      ))}
    </svg>
  );
};
