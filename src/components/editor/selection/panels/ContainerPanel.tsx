"use client";

import type { ContainerProps } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";
import { Divider, Field, Segmented } from "./fields";
import { Minus, Plus } from "lucide-react";

const DISPLAY_OPTIONS = [
  { value: "flex" as const, label: "Flex" },
  { value: "grid" as const, label: "Grid" },
  { value: "block" as const, label: "Block" },
];

const DIRECTION_OPTIONS = [
  { value: "row" as const, label: "Row" },
  { value: "column" as const, label: "Column" },
];

const ALIGN_OPTIONS = [
  { value: "stretch", label: "Stretch" },
  { value: "start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "end", label: "End" },
];

const JUSTIFY_OPTIONS = [
  { value: "flex-start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "flex-end", label: "End" },
  { value: "space-between", label: "Between" },
  { value: "space-around", label: "Around" },
];

export function ContainerPanel({ props, onChange }: PanelProps<ContainerProps>) {
  const currentGapNum = parseInt(props.gap || "16px", 10) || 0;

  const handleGapStep = (delta: number) => {
    const next = Math.max(0, currentGapNum + delta);
    onChange({ gap: `${next}px` });
  };

  return (
    <>
      <Segmented
        label="Display"
        value={props.display || "flex"}
        options={DISPLAY_OPTIONS}
        onChange={(display) => onChange({ display })}
      />
      {props.display === "flex" && (
        <>
          <Segmented
            label="Direction"
            value={props.flexDirection || "row"}
            options={DIRECTION_OPTIONS}
            onChange={(flexDirection) => onChange({ flexDirection })}
          />
          <Segmented
            label="Align"
            value={props.alignItems || "stretch"}
            options={ALIGN_OPTIONS}
            onChange={(alignItems) => onChange({ alignItems })}
          />
          <Segmented
            label="Justify"
            value={props.justifyContent || "flex-start"}
            options={JUSTIFY_OPTIONS}
            onChange={(justifyContent) => onChange({ justifyContent })}
          />
        </>
      )}
      <Divider />
      <Field label="Gap">
        <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => handleGapStep(-4)}
            title="Decrease Gap (-4px)"
            className="px-2 py-1 hover:bg-slate-100 text-slate-600 font-bold text-xs transition cursor-pointer border-r border-slate-100 flex items-center justify-center"
          >
            <Minus className="w-3 h-3" />
          </button>
          <input
            type="text"
            value={props.gap || "16px"}
            onChange={(e) => onChange({ gap: e.target.value })}
            className="w-[54px] text-center text-[11px] font-mono font-semibold text-slate-800 outline-none"
          />
          <button
            type="button"
            onClick={() => handleGapStep(4)}
            title="Increase Gap (+4px)"
            className="px-2 py-1 hover:bg-slate-100 text-slate-600 font-bold text-xs transition cursor-pointer border-l border-slate-100 flex items-center justify-center"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </Field>
    </>
  );
}

