"use client";

import { forwardRef } from "react";
import { Network, Building2, CheckCircle2 } from "lucide-react";
import GlassCard from "../cinematic/GlassCard";

interface Section08EcosystemHUDProps {
  activeInstitutions?: string[];
}

const Section08EcosystemHUD = forwardRef<HTMLDivElement, Section08EcosystemHUDProps>(
  ({ activeInstitutions = ["Northstar University"] }, ref) => {
    const institutions = [
      { name: "Northstar University", type: "Research & Higher Ed" },
      { name: "Riverdale Institute", type: "Applied Sciences" },
      { name: "Eastridge College", type: "Liberal Arts & Design" },
      { name: "Summit University", type: "Global Executive" },
    ];

    return (
      <div ref={ref} className="w-full max-w-4xl mx-auto px-4 z-20 pointer-events-none">
        <GlassCard className="p-4 sm:p-6 backdrop-blur-3xl bg-black/85 border-white/[0.12] shadow-[0_25px_90px_rgba(0,0,0,0.95)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                <Network className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">
                  MULTI-TENANT PLATFORM
                </span>
                <span className="text-xs font-bold text-white font-mono">
                  Isolated Tenants • Unified Core
                </span>
              </div>
            </div>

            {/* Connected Institutions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
              {institutions.map((inst) => {
                const isActive = activeInstitutions.includes(inst.name);
                return (
                  <div
                    key={inst.name}
                    className={`flex flex-col p-2.5 rounded-xl border text-left transition-all duration-300 ${
                      isActive
                        ? "bg-white text-black border-white font-bold shadow-md"
                        : "bg-white/[0.02] text-neutral-500 border-white/[0.06] opacity-40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Building2 className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-neutral-500"}`} />
                      {isActive && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    </div>
                    <span className="text-[10px] font-mono leading-tight tracking-tight">
                      {inst.name}
                    </span>
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

Section08EcosystemHUD.displayName = "Section08EcosystemHUD";

export default Section08EcosystemHUD;
