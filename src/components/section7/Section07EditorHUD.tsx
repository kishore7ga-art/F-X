"use client";

import { forwardRef } from "react";
import { MousePointer, Type, Image as ImageIcon, Move, Copy, LayoutGrid, Eye, Sparkles } from "lucide-react";
import GlassCard from "../cinematic/GlassCard";

interface Section07EditorHUDProps {
  activeTool?: string;
}

const Section07EditorHUD = forwardRef<HTMLDivElement, Section07EditorHUDProps>(
  ({ activeTool = "Select Section" }, ref) => {
    const tools = [
      { name: "Select Section", icon: MousePointer },
      { name: "Edit Text", icon: Type },
      { name: "Change Image", icon: ImageIcon },
      { name: "Move Section", icon: Move },
      { name: "Duplicate", icon: Copy },
      { name: "Change Layout", icon: LayoutGrid },
      { name: "Preview Device", icon: Eye },
    ];

    return (
      <div ref={ref} className="w-full max-w-4xl mx-auto px-4 z-20 pointer-events-none">
        <GlassCard className="p-4 sm:p-5 backdrop-blur-3xl bg-black/85 border-white/[0.12] shadow-[0_25px_90px_rgba(0,0,0,0.95)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">
                  XITE EDITOR STUDIO
                </span>
                <span className="text-xs font-bold text-white font-mono">
                  Visual Page Control Panel
                </span>
              </div>
            </div>

            {/* Active Tools Bar */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {tools.map((item) => {
                const Icon = item.icon;
                const isActive = activeTool === item.name || (activeTool === "Move / Duplicate" && (item.name === "Move Section" || item.name === "Duplicate"));
                return (
                  <div
                    key={item.name}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono tracking-wider transition-all duration-300 ${
                      isActive
                        ? "bg-white text-black font-bold shadow-lg"
                        : "bg-white/[0.03] text-neutral-400 border border-white/[0.06] opacity-40"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
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

Section07EditorHUD.displayName = "Section07EditorHUD";

export default Section07EditorHUD;
