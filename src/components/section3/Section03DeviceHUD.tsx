"use client";

import { forwardRef } from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import GlassCard from "../cinematic/GlassCard";

interface Section03DeviceHUDProps {
  deviceMode?: "desktop" | "tablet" | "mobile";
}

const Section03DeviceHUD = forwardRef<HTMLDivElement, Section03DeviceHUDProps>(
  ({ deviceMode = "desktop" }, ref) => {
    return (
      <div ref={ref} className="w-full max-w-xl mx-auto px-4 z-20 pointer-events-none">
        <GlassCard className="p-3 sm:p-4 backdrop-blur-3xl bg-black/80 border-white/[0.12] shadow-[0_20px_80px_rgba(0,0,0,0.95)]">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Desktop Option */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                deviceMode === "desktop"
                  ? "bg-white text-black font-bold shadow-lg"
                  : "text-neutral-400 opacity-60"
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="text-[11px] font-mono tracking-wider uppercase hidden sm:inline">
                Desktop (1200px+)
              </span>
            </div>

            {/* Tablet Option */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                deviceMode === "tablet"
                  ? "bg-white text-black font-bold shadow-lg"
                  : "text-neutral-400 opacity-60"
              }`}
            >
              <Tablet className="w-4 h-4" />
              <span className="text-[11px] font-mono tracking-wider uppercase hidden sm:inline">
                Tablet (768px)
              </span>
            </div>

            {/* Mobile Option */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                deviceMode === "mobile"
                  ? "bg-white text-black font-bold shadow-lg"
                  : "text-neutral-400 opacity-60"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-[11px] font-mono tracking-wider uppercase hidden sm:inline">
                Mobile (375px)
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }
);

Section03DeviceHUD.displayName = "Section03DeviceHUD";

export default Section03DeviceHUD;
