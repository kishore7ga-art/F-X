"use client";

import { forwardRef } from "react";
import { ShieldCheck, ArrowRight, Check } from "lucide-react";
import GlassCard from "../cinematic/GlassCard";

interface Section10GovernanceHUDProps {
  currentStep?: "Request" | "Approve" | "Created" | "Published" | "Available";
  activePillar?: string;
}

const Section10GovernanceHUD = forwardRef<HTMLDivElement, Section10GovernanceHUDProps>(
  (
    {
      currentStep = "Request",
      activePillar = "Access Requests",
    },
    ref
  ) => {
    const workflowSteps = [
      { name: "Request", label: "Access Request" },
      { name: "Approve", label: "Admin Approval" },
      { name: "Created", label: "Tenant Created" },
      { name: "Published", label: "Template Published" },
      { name: "Available", label: "Section Available" },
    ];

    return (
      <div ref={ref} className="w-full max-w-4xl mx-auto px-4 z-20 pointer-events-none">
        <GlassCard className="p-4 sm:p-6 backdrop-blur-3xl bg-black/85 border-white/[0.12] shadow-[0_25px_90px_rgba(0,0,0,0.95)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.1]">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase block">
                  XITE GOVERNANCE STUDIO
                </span>
                <span className="text-xs font-bold text-white font-mono">
                  {activePillar}
                </span>
              </div>
            </div>

            {/* Workflow Progress Steps */}
            <div className="flex items-center gap-1 sm:gap-2">
              {workflowSteps.map((step, idx) => {
                const isActive = currentStep === step.name;
                return (
                  <div key={step.name} className="flex items-center gap-1 sm:gap-2">
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono tracking-wider transition-all duration-300 ${
                        isActive
                          ? "bg-white text-black font-bold shadow-md"
                          : "bg-white/[0.03] text-neutral-500 border border-white/[0.06] opacity-40"
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
                      <span>{step.name}</span>
                    </div>
                    {idx < workflowSteps.length - 1 && (
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

Section10GovernanceHUD.displayName = "Section10GovernanceHUD";

export default Section10GovernanceHUD;
