"use client";

import { forwardRef } from "react";
import { LayoutTemplate, Check, ArrowRight } from "lucide-react";
import GlassCard from "../cinematic/GlassCard";

interface Section09TemplateHUDProps {
  currentStage?: "Template" | "Branding" | "Content" | "Sections" | "Final";
  selectedTemplate?: string;
}

const Section09TemplateHUD = forwardRef<HTMLDivElement, Section09TemplateHUDProps>(
  (
    {
      currentStage = "Template",
      selectedTemplate = "University Portal Master",
    },
    ref
  ) => {
    const pipelineStages = ["Template", "Branding", "Content", "Sections", "Final"];

    return (
      <div ref={ref} className="w-full max-w-4xl mx-auto px-4 z-20 pointer-events-none">
        <GlassCard className="p-4 sm:p-6 backdrop-blur-3xl bg-black/85 border-white/[0.12] shadow-[0_25px_90px_rgba(0,0,0,0.95)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                <LayoutTemplate className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">
                  XITE TEMPLATE STUDIO
                </span>
                <span className="text-xs font-bold text-white font-mono">
                  {selectedTemplate}
                </span>
              </div>
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {pipelineStages.map((stg, idx) => {
                const isActive = currentStage === stg;
                return (
                  <div key={stg} className="flex items-center gap-1.5">
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider transition-all duration-300 ${
                        isActive
                          ? "bg-white text-black font-bold shadow-md"
                          : "bg-white/[0.03] text-neutral-500 border border-white/[0.06] opacity-40"
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
                      <span>{stg}</span>
                    </div>
                    {idx < pipelineStages.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-neutral-600 hidden sm:inline" />
                    )}
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

Section09TemplateHUD.displayName = "Section09TemplateHUD";

export default Section09TemplateHUD;
