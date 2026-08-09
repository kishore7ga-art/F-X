"use client";

import { forwardRef } from "react";
import { Globe, FileText, GraduationCap, Users, Mail, UserCheck } from "lucide-react";
import GlassCard from "../cinematic/GlassCard";

interface Section04PageNavHUDProps {
  activePage?: "Home" | "About" | "Academics" | "Admissions" | "Contact";
}

const Section04PageNavHUD = forwardRef<HTMLDivElement, Section04PageNavHUDProps>(
  ({ activePage = "Home" }, ref) => {
    const pages = [
      { name: "Home", icon: Globe },
      { name: "About", icon: FileText },
      { name: "Academics", icon: GraduationCap },
      { name: "Admissions", icon: Users },
      { name: "Contact", icon: Mail },
    ];

    return (
      <div ref={ref} className="w-full max-w-2xl mx-auto px-4 z-20 pointer-events-none">
        <GlassCard className="p-3 sm:p-4 backdrop-blur-3xl bg-black/85 border-white/[0.12] shadow-[0_20px_80px_rgba(0,0,0,0.95)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Active Page Tabs Navigation */}
            <div className="flex items-center gap-1 sm:gap-2 w-full justify-between">
              {pages.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.name;
                return (
                  <div
                    key={item.name}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-white text-black font-bold shadow-lg"
                        : "text-neutral-400 opacity-50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="text-[10px] sm:text-xs font-mono tracking-wider">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Staff Management Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] text-[10px] font-mono text-neutral-400 whitespace-nowrap">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>STAFF EDIT MODE</span>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }
);

Section04PageNavHUD.displayName = "Section04PageNavHUD";

export default Section04PageNavHUD;
