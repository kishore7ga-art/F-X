"use client";

import { useState } from "react";
import { Save, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SaveStatusButton() {
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  function handleManualSave() {
    if (saveState === "saving") return;
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
      setTimeout(() => {
        setSaveState("idle");
      }, 2500);
    }, 600);
  }

  return (
    <div className="group relative flex items-center">
      <button
        type="button"
        onClick={handleManualSave}
        aria-label="Save status & manual save"
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 cursor-pointer",
          saveState === "saved"
            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
            : saveState === "saving"
              ? "text-slate-500 hover:bg-slate-200/80"
              : "text-slate-700 hover:bg-slate-200/80 hover:text-black"
        )}
      >
        {saveState === "saving" ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
        ) : saveState === "saved" ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Save className="h-4 w-4" strokeWidth={2.2} />
        )}

        {/* Live Auto-Save Dot Indicator (Green when idle/saved) */}
        {saveState === "idle" && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        )}
      </button>

      {/* Floating Tooltip */}
      <div className="pointer-events-none absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden rounded-md bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md group-hover:flex items-center whitespace-nowrap z-50">
        {saveState === "saving"
          ? "Saving changes..."
          : saveState === "saved"
            ? "All changes saved!"
            : "Auto-saved (Click to save now)"}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
      </div>
    </div>
  );
}
