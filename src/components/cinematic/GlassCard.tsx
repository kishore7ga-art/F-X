import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export default function GlassCard({
  children,
  className,
  glow = false,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300",
        glow && "hover:border-white/[0.18] hover:bg-white/[0.04]",
        className
      )}
      {...props}
    >
      {/* Specular Refraction Border Line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
