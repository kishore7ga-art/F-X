"use client";

import Link from "next/link";
import React from "react";
import { cn } from "@/lib/cn";

interface LitButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  gradientClassName?: string;
  type?: "button" | "submit" | "reset";
  target?: string;
}

export function LitButton({
  href,
  onClick,
  children,
  className,
  innerClassName,
  gradientClassName,
  type = "button",
  target,
}: LitButtonProps) {
  const content = (
    <>
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl transition-all duration-300 opacity-90 group-hover:opacity-100 group-hover:blur-[2px]",
          gradientClassName
        )}
      />
      <div
        className={cn(
          "px-6 py-2.5 bg-black rounded-[10px] relative group transition duration-200 text-white font-bold text-sm hover:bg-transparent flex items-center justify-center gap-2",
          innerClassName
        )}
      >
        {children}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        target={target}
        className={cn("p-[2px] relative inline-block group transition-transform active:scale-95", className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn("p-[2px] relative inline-block group cursor-pointer transition-transform active:scale-95", className)}
    >
      {content}
    </button>
  );
}

export default LitButton;
