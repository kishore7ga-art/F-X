"use client";

import { forwardRef } from "react";
import { Sparkles, Check, Shield } from "lucide-react";
import GlassCard from "../cinematic/GlassCard";

interface Section06BrandHUDProps {
  activeAttributes?: string[];
  brandStatus?: string;
}

const Section06BrandHUD = forwardRef<HTMLDivElement, Section06BrandHUDProps>(
  (
    {
      activeAttributes = ["Logo", "Typography"],
      brandStatus = "Morphing Identity",
    },
    ref
  ) => {
    const attributes = [
      "Logo",
      "Typography",
      "Colors",
      "Images",
      "Buttons",
      "Visual Style",
    ];

    return (
      <div ref={ref} className="w-full max-w-3xl mx-auto px-4 z-20 pointer-events-none">
        <GlassCard className="p-4 sm:p-6 backdrop-blur-3xl bg-black/85 border-white/[0.12] shadow-[0_25px_90px_rgba(0,0,0,0.95)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">
                  BRAND IDENTITY SYSTEM
                </span>
                <span className="text-xs font-bold text-white font-mono">
                  {brandStatus}
                </span>
              </div>
            </div>

            {/* Active Brand Attribute Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {attributes.map((attr) => {
                const isActive = activeAttributes.includes(attr);
                return (
                  <div
                    key={attr}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider transition-all duration-300 ${
                      isActive
                        ? "bg-white text-black font-bold shadow-md"
                        : "bg-white/[0.03] text-neutral-500 border border-white/[0.06] opacity-40"
                    }`}
                  >
                    {isActive && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
                    <span>{attr}</span>
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

Section06BrandHUD.displayName = "Section06BrandHUD";

export default Section06BrandHUD;
