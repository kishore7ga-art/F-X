"use client";

import { forwardRef } from "react";
import { Cpu, Database, ShieldAlert, Code2, Server, Check } from "lucide-react";
import GlassCard from "../cinematic/GlassCard";

interface Section11ArchitectureHUDProps {
  activeLayers?: string[];
  systemStatus?: string;
}

const Section11ArchitectureHUD = forwardRef<HTMLDivElement, Section11ArchitectureHUDProps>(
  (
    {
      activeLayers = ["xite-F"],
      systemStatus = "High Performance Engine",
    },
    ref
  ) => {
    const techLayers = [
      { name: "xite-F", label: "Frontend", icon: Code2 },
      { name: "xite-B", label: "Backend API", icon: Server },
      { name: "xite-admin", label: "Control Plane", icon: Cpu },
      { name: "PostgreSQL", label: "Data Store", icon: Database },
      { name: "REST API", label: "OpenAPI Specs", icon: Server },
      { name: "Security", label: "OAuth2/JWT", icon: ShieldAlert },
    ];

    return (
      <div ref={ref} className="w-full max-w-4xl mx-auto px-4 z-20 pointer-events-none">
        <GlassCard className="p-4 sm:p-6 backdrop-blur-3xl bg-black/85 border-white/[0.12] shadow-[0_25px_90px_rgba(0,0,0,0.95)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">
                  TECHNICAL ARCHITECTURE
                </span>
                <span className="text-xs font-bold text-white font-mono">
                  {systemStatus}
                </span>
              </div>
            </div>

            {/* Architecture Layer Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              {techLayers.map((layer) => {
                const Icon = layer.icon;
                const isActive = activeLayers.includes(layer.name);
                return (
                  <div
                    key={layer.name}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono tracking-wider transition-all duration-300 ${
                      isActive
                        ? "bg-white text-black font-bold shadow-md"
                        : "bg-white/[0.03] text-neutral-500 border border-white/[0.06] opacity-40"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{layer.name}</span>
                    {isActive && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
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

Section11ArchitectureHUD.displayName = "Section11ArchitectureHUD";

export default Section11ArchitectureHUD;
