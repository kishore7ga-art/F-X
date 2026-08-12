"use client";

import React from "react";
import { Plus } from "lucide-react";

export interface AddSectionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  icon?: React.ReactNode;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export const AddSectionButton = React.forwardRef<HTMLButtonElement, AddSectionButtonProps>(
  ({ label = "Add Section", icon, size = "md", className = "", style, ...props }, ref) => {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 py-1 my-1 group select-none ${className}`}>
        {/* Ambient Subtle Glow */}
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 opacity-60 blur-md group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* The Pill Button Element */}
        <button
          ref={ref}
          {...props}
          className="relative z-10 inline-flex items-center justify-center gap-2.5 px-6 py-2.5 bg-slate-900 text-white rounded-full border border-slate-700/90 shadow-2xl hover:bg-slate-800 hover:border-blue-400 hover:scale-105 active:scale-95 cursor-pointer transition-all duration-200"
          style={{
            fontFamily: "'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif",
            ...style,
          }}
        >
          {icon !== undefined ? (
            icon
          ) : (
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 group-hover:rotate-90 transition-transform duration-300">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          )}
          <span className="text-xs sm:text-sm font-extrabold tracking-tight text-white whitespace-nowrap">
            {label}
          </span>
        </button>
      </div>
    );
  }
);

AddSectionButton.displayName = "AddSectionButton";
