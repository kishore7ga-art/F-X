"use client";

import React from "react";
import { Plus } from "lucide-react";

export interface AddSectionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const AddSectionButton = React.forwardRef<HTMLButtonElement, AddSectionButtonProps>(
  ({ label = "Add Section", icon, className = "", style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={`group relative z-30 inline-flex items-center justify-center gap-2 h-9 px-3.5 bg-slate-900 text-white rounded-[18px] border border-slate-700/90 shadow-[0_4px_14px_rgba(0,0,0,0.35)] hover:bg-slate-800 hover:border-blue-500/80 hover:scale-[1.03] active:scale-[0.97] cursor-pointer transition-all duration-200 select-none whitespace-nowrap shrink-0 max-w-max ${className}`}
        style={{
          fontFamily: "'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif",
          ...style,
        }}
      >
        {icon !== undefined ? (
          icon
        ) : (
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 group-hover:rotate-90 transition-transform duration-200 shadow-sm">
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        )}
        <span className="text-xs font-extrabold tracking-tight text-white whitespace-nowrap">
          {label}
        </span>
      </button>
    );
  }
);

AddSectionButton.displayName = "AddSectionButton";
