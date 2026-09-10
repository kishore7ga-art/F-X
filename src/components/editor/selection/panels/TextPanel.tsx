"use client";

import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";

import type { TextAlign, TextProps } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";
import { ColorField, Divider, Field, PxField, SelectField, TextField } from "./fields";

const WEIGHTS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra bold" },
  { value: "900", label: "Black" },
];

const ALIGNS: ReadonlyArray<{ value: TextAlign; Icon: typeof AlignLeft; label: string }> = [
  { value: "left", Icon: AlignLeft, label: "Align left" },
  { value: "center", Icon: AlignCenter, label: "Align centre" },
  { value: "right", Icon: AlignRight, label: "Align right" },
  { value: "justify", Icon: AlignJustify, label: "Justify" },
];

/** Weights read off the DOM come as `700` or `bold`; the select needs the number. */
const normaliseWeight = (weight: string) => (weight === "bold" ? "700" : weight === "normal" ? "400" : weight);

export function TextPanel({ tab, props, onChange }: PanelProps<TextProps>) {
  if (tab === "type") {
    return (
      <>
        <ColorField label="Colour" value={props.color} fallback="#0f172a" onChange={(color) => onChange({ color })} />
        <PxField label="Size" value={props.fontSize} min={8} max={96} onChange={(fontSize) => onChange({ fontSize })} />
        <SelectField label="Weight" value={normaliseWeight(props.fontWeight)} options={WEIGHTS} onChange={(fontWeight) => onChange({ fontWeight })} />
        <Divider />
        <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5 border border-slate-200/60 shrink-0">
          {ALIGNS.map(({ value, Icon, label }) => (
            <button
              key={value}
              type="button"
              title={label}
              aria-pressed={props.textAlign === value}
              onClick={() => onChange({ textAlign: value })}
              className={`rounded-md p-1 transition cursor-pointer ${
                props.textAlign === value ? "bg-white text-slate-900 shadow-xs" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </>
    );
  }
  // spacing
  return (
    <>
      <Field label="Line height">
        <TextField value={props.lineHeight} placeholder="1.5" onCommit={(lineHeight) => onChange({ lineHeight })} width="w-[64px]" mono />
      </Field>
      <Field label="Letter spacing">
        <TextField value={props.letterSpacing} placeholder="0.02em" onCommit={(letterSpacing) => onChange({ letterSpacing })} width="w-[72px]" mono />
      </Field>
      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Double-click the text on the canvas to edit its words</span>
    </>
  );
}
