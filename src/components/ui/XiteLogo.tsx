"use client";

import Image from "next/image";
import React from "react";
import { cn } from "@/lib/cn";

interface XiteLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textClassName?: string;
}

export function XiteLogo({
  className = "h-8 w-8",
  size = 32,
  showText = false,
  textClassName = "text-xl font-black tracking-tight text-white",
}: XiteLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src="/xite-logo.png"
          alt="XITE Logo"
          width={size}
          height={size}
          className="h-full w-auto object-contain drop-shadow-md rounded-md transition-transform duration-300 hover:scale-105"
        />
      </div>
      {showText && (
        <span className={cn("font-black tracking-tight text-white flex items-center gap-1.5", textClassName)}>
          XITE
        </span>
      )}
    </div>
  );
}

export default XiteLogo;
