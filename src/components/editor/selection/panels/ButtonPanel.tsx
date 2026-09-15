"use client";

import type { ButtonProps, ButtonSize, ButtonVariant } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";
import { ColorField, Divider, Field, PxField, Segmented, TextField, Toggle } from "./fields";

const VARIANTS: ReadonlyArray<{ value: ButtonVariant; label: string; title: string }> = [
  { value: "solid", label: "Solid", title: "Filled with the accent colour" },
  { value: "outline", label: "Outline", title: "Accent border, transparent fill" },
  { value: "ghost", label: "Ghost", title: "Text only, no fill or border" },
];

const SIZES: ReadonlyArray<{ value: ButtonSize; label: string }> = [
  { value: "sm", label: "S" },
  { value: "md", label: "M" },
  { value: "lg", label: "L" },
];

export function ButtonPanel({ props, onChange }: PanelProps<ButtonProps>) {
  return (
    <>
      <Field label="Label">
        <TextField
          value={props.text ?? ""}
          placeholder="Button text"
          onCommit={(text) => onChange({ text })}
          width="w-[120px]"
        />
      </Field>
      <Field label="Link">
        <TextField
          value={props.href}
          placeholder="/admissions or https://…"
          onCommit={(href) => onChange({ href })}
          width="w-[180px]"
          mono
        />
      </Field>
      <Toggle
        label="New tab"
        checked={Boolean(props.newTab)}
        onChange={(newTab) => onChange({ newTab })}
      />
      <Divider />
      <Segmented label="Style" value={props.variant} options={VARIANTS} onChange={(variant) => onChange({ variant })} />
      <Segmented label="Size" value={props.size} options={SIZES} onChange={(size) => onChange({ size })} />
      <Divider />
      <ColorField label={props.variant === "solid" ? "Fill" : "Accent"} value={props.background} fallback="#2563eb" onChange={(background) => onChange({ background })} />
      <ColorField label="Text" value={props.textColor} fallback="#ffffff" onChange={(textColor) => onChange({ textColor })} />
      <PxField label="Radius" value={props.radius} max={40} onChange={(radius) => onChange({ radius })} />
    </>
  );
}
