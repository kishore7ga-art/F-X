"use client";

import { forwardRef } from "react";
import { Sliders, Type, Palette, LayoutGrid, CheckCircle2 } from "lucide-react";
import GlassCard from "../cinematic/GlassCard";

interface Section02CustomizationStageProps {
  activePhase?: "foundation" | "typography" | "color" | "complete";
  activeFont?: string;
  activeAccent?: string;
}

const Section02CustomizationStage = forwardRef<HTMLDivElement, Section02CustomizationStageProps>(
  ({ activePhase = "foundation", activeFont = "Geist Display", activeAccent = "Specular White" }, ref) => {
    return (
      <div ref={ref} className="w-full max-w-5xl mx-auto px-4 z-20 pointer-events-none">
        <GlassCard className="p-6 sm:p-8 backdrop-blur-3xl bg-black/70 border-white/[0.1] shadow-[0_30px_90px_rgba(0,0,0,0.95)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/[0.08] pb-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                <Sliders className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">
                  XITE VISUAL ENGINE
                </span>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Institutional Customization Pipeline
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-neutral-300 uppercase tracking-wider">
                Active Transformation State
              </span>
            </div>
          </div>

          {/* Customization Indicators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {/* 1. Typography Indicator */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Type className="w-4 h-4 text-neutral-300" />
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                    Typography
                  </span>
                  <span className="text-xs font-semibold text-white font-mono">
                    {activeFont}
                  </span>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
            </div>

            {/* 2. Color System Indicator */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-4 h-4 text-neutral-300" />
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                    Color System
                  </span>
                  <span className="text-xs font-semibold text-white font-mono">
                    {activeAccent}
                  </span>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
            </div>

            {/* 3. Layout Grid Indicator */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4 text-neutral-300" />
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">
                    Layout System
                  </span>
                  <span className="text-xs font-semibold text-white font-mono">
                    Modular Grid
                  </span>
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }
);

Section02CustomizationStage.displayName = "Section02CustomizationStage";

export default Section02CustomizationStage;
