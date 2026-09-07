"use client";

import React from "react";
import { Layers } from "lucide-react";

interface HeaderOverlayDropZoneProps {
  isOverlaid: boolean;
  onToggleOverlay: (enable: boolean) => void;
  headerTitle?: string;
  heroTitle?: string;
}

export function HeaderOverlayDropZone({
  isOverlaid,
  onToggleOverlay,
  headerTitle = "Header",
  heroTitle = "Hero",
}: HeaderOverlayDropZoneProps) {
  return (
    <div className="relative w-full h-0 select-none z-40 pointer-events-none">
      {/* Positioned on the right side, outside the canvas, between Header and Hero */}
      <div className="absolute right-0 top-0 -translate-y-1/2 max-sm:translate-x-0 max-sm:right-2 sm:translate-x-full sm:pl-3.5 pointer-events-auto flex items-center">
        {/* Subtle connector indicator line on wide viewports */}
        <div className="hidden sm:flex items-center absolute -left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              isOverlaid
                ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                : "bg-indigo-400"
            }`}
          />
          <span
            className={`w-3.5 h-[1.5px] transition-colors ${
              isOverlaid ? "bg-cyan-400/60" : "bg-indigo-200"
            }`}
          />
        </div>

        {/* Action Card / Toggle Widget */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleOverlay(!isOverlaid);
          }}
          className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-xl border shadow-md hover:shadow-xl transition-all duration-200 backdrop-blur-md cursor-pointer ${
            isOverlaid
              ? "bg-slate-900/95 border-cyan-500/50 hover:bg-slate-900 text-white shadow-cyan-950/30"
              : "bg-white/95 border-slate-200/90 hover:border-indigo-400 text-slate-800 shadow-slate-200/60"
          }`}
          title={
            isOverlaid
              ? `${headerTitle} is overlaid on ${heroTitle}. Click to detach.`
              : `Click to overlay ${headerTitle} on top of ${heroTitle}.`
          }
        >
          {/* Icon Badge */}
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-lg transition-colors ${
              isOverlaid
                ? "bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-xs"
                : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </div>

          {/* Text Information */}
          <div className="flex flex-col text-left pr-1">
            <div className="flex items-center gap-1.5">
              {isOverlaid && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                </span>
              )}
              <span
                className={`text-[11px] font-extrabold leading-tight tracking-tight ${
                  isOverlaid ? "text-cyan-300" : "text-slate-800 group-hover:text-indigo-600"
                }`}
              >
                {isOverlaid ? "Header Overlaid" : "Header Overlay"}
              </span>
            </div>
            <span
              className={`text-[9.5px] font-semibold leading-tight ${
                isOverlaid ? "text-slate-400" : "text-slate-400 group-hover:text-slate-600"
              }`}
            >
              {isOverlaid ? "Floating on Hero" : "Overlay on Hero"}
            </span>
          </div>

          {/* Toggle Switch */}
          <div
            className={`w-7 h-4 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
              isOverlaid ? "bg-cyan-500 justify-end" : "bg-slate-200 justify-start"
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out" />
          </div>
        </button>
      </div>
    </div>
  );
}
