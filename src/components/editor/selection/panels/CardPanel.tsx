"use client";

import type { CardProps } from "@/lib/editor/element-resolver";
import { SHADOW_PRESETS } from "@/lib/editor/element-resolver";
import { ColorField, Divider, PxField, Segmented, TextField, Field } from "./fields";

export type PanelProps<P> = {
  tab: string;
  props: P;
  onChange: (patch: Partial<P>) => void;
};

const SHADOW_OPTIONS = SHADOW_PRESETS.map((value) => ({ value, label: value === "none" ? "None" : value.toUpperCase() }));

export function CardPanel({ tab, props, onChange }: PanelProps<CardProps>) {
  if (tab === "style") {
    return (
      <>
        <ColorField label="Card background" value={props.background} fallback="#ffffff" onChange={(background) => onChange({ background })} />
        <PxField label="Corner radius" value={props.radius} max={48} onChange={(radius) => onChange({ radius })} />
        <Divider />
        <Segmented label="Shadow" value={props.shadow} options={SHADOW_OPTIONS} onChange={(shadow) => onChange({ shadow })} />
      </>
    );
  }
  if (tab === "border") {
    return (
      <>
        <PxField label="Border width" value={props.borderWidth} max={8} onChange={(borderWidth) => onChange({ borderWidth })} />
        <ColorField label="Border colour" value={props.borderColor} fallback="#e2e8f0" onChange={(borderColor) => onChange({ borderColor })} />
      </>
    );
  }
  // spacing
  return (
    <>
      <Field label="Padding">
        <TextField value={props.padding} placeholder="24px" onCommit={(padding) => onChange({ padding })} width="w-[120px]" mono />
      </Field>
      <Field label="Margin">
        <TextField value={props.margin} placeholder="0px" onCommit={(margin) => onChange({ margin })} width="w-[120px]" mono />
      </Field>
      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">CSS shorthand: top right bottom left</span>
    </>
  );
}
