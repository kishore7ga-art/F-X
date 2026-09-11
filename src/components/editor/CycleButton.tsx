"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import type { ControlOption } from "@/lib/sections/section-schema";

/**
 * Which option a cycle button is on.
 *
 * Exact first. Failing that, by the value's first word — an entrance saved
 * as `xite-fade-in var(--x-anim-speed, 0.7s) ease-out both` (a form that
 * existed for an hour) is still "Fade in": only the duration differs, and
 * pressing the button once rewrites it in the current form anyway. A value
 * matching nothing shows as-is and the next press starts the cycle over.
 */
export function cycleIndex(options: readonly ControlOption[], value: string): number {
  const exact = options.findIndex((option) => option.value === value);
  if (exact >= 0) return exact;
  const head = value.trim().split(/\s+/)[0] ?? "";
  if (!head) return -1;
  return options.findIndex((option) => option.value !== "" && option.value.split(/\s+/)[0] === head);
}

/**
 * A select worn as one button: each press moves to the next option and wraps,
 * the way Swap walks through layouts. No heading — the current option's label
 * is the whole caption, so it fits a one-row panel.
 */
export function CycleButton({
  options,
  value,
  onCommit,
  icon,
  title,
  className = "",
}: {
  options: readonly ControlOption[];
  value: string;
  onCommit: (value: string) => void;
  icon?: React.ReactNode;
  title?: string;
  className?: string;
}) {
  const current = cycleIndex(options, value);
  const next = options[(current + 1) % Math.max(options.length, 1)];
  const label = current >= 0 ? options[current]!.label : value || "Custom";
  return (
    <button
      type="button"
      onClick={() => next && onCommit(next.value)}
      disabled={options.length < 2}
      title={next ? `${title ? `${title} — ` : ""}next: ${next.label}` : title}
      className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-[11px] font-medium text-slate-800 outline-none transition hover:border-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-default ${className}`}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[9px] font-bold text-slate-400">
        {current >= 0 && `${current + 1}/${options.length}`}
        <ChevronRight className="h-3 w-3" />
      </span>
    </button>
  );
}
