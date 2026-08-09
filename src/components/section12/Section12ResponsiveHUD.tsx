"use client";

import { forwardRef } from "react";
import { Monitor, Tablet, Smartphone, Check } from "lucide-react";
import GlassCard from "../cinematic/GlassCard";

interface Section12ResponsiveHUDProps {
  activeDevice?: "Desktop" | "Tablet" | "Mobile";
  activeAdaptations?: string[];
}

const Section12ResponsiveHUD = forwardRef<HTMLDivElement, Section12ResponsiveHUDProps>(
  (
    {
      activeDevice = "Desktop",
      activeAdaptations = ["Fluid Typography", "Responsive Nav"],
    },
    ref
  ) => {
    const devices = [
      { name: "Desktop", resolution: "1440px", icon: Monitor },
      { name: "Tablet", resolution: "768px", icon: Tablet },
      { name: "Mobile", resolution: "375px", icon: Smartphone },
    ];

    const adaptations = [
      "Fluid Typography",
      "Responsive Nav",
      "Responsive Sections",
      "Image Adaptation",
      "Spacing Adaptation",
    ];

    return (
      <div ref={ref} className="w-full max-w-4xl mx-auto px-4 z-20 pointer-events-none">
        <GlassCard className="p-4 sm:p-6 backdrop-blur-3xl bg-black/85 border-white/[0.12] shadow-[0_25px_90px_rgba(0,0,0,0.95)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Active Device Viewport Selector */}
            <div className="flex items-center gap-2">
              {devices.map((dev) => {
                const Icon = dev.icon;
                const isActive = activeDevice === dev.name;
                return (
                  <div
                    key={dev.name}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-left transition-all duration-300 ${
                      isActive
                        ? "bg-white text-black border-white font-bold shadow-md"
                        : "bg-white/[0.02] text-neutral-500 border-white/[0.06] opacity-40"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono leading-none">{dev.name}</span>
                      <span className="text-[9px] font-mono text-neutral-400 opacity-80">{dev.resolution}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Fluid Adaptation Metrics */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {adaptations.map((item) => {
                const isActive = activeAdaptations.includes(item);
                return (
                  <div
                    key={item}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider transition-all duration-300 ${
                      isActive
                        ? "bg-white text-black font-bold shadow-md"
                        : "bg-white/[0.03] text-neutral-500 border border-white/[0.06] opacity-40"
                    }`}
                  >
                    {isActive && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
                    <span>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }
);

Section12ResponsiveHUD.displayName = "Section12ResponsiveHUD";

export default Section12ResponsiveHUD;
