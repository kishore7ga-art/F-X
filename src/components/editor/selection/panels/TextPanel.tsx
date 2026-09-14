"use client";

import type { TextAlign, TextProps } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";
import { ColorField, Divider, Field, PxField, RangeField, Segmented, TextField } from "./fields";

const ALIGNMENTS: ReadonlyArray<{ value: TextAlign; label: string; title: string }> = [
  { value: "left", label: "Left", title: "Align left" },
  { value: "center", label: "Center", title: "Align center" },
  { value: "right", label: "Right", title: "Align right" },
  { value: "justify", label: "Justify", title: "Justify text" },
];

const WEIGHTS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
];

export function TextPanel({ tab, props, onChange }: PanelProps<TextProps>) {
  if (tab === "type") {
    return (
      <>
        <ColorField
          label="Text color"
          value={props.color}
          fallback="#0f172a"
          onChange={(color) => onChange({ color })}
        />
        <PxField
          label="Font size"
          value={props.fontSize}
          min={10}
          max={48}
          onChange={(fontSize) => onChange({ fontSize })}
        />
        <Segmented
          label="Weight"
          value={props.fontWeight || "400"}
          options={WEIGHTS}
          onChange={(fontWeight) => onChange({ fontWeight })}
        />
        <Divider />
        <Segmented
          label="Align"
          value={props.textAlign || "left"}
          options={ALIGNMENTS}
          onChange={(textAlign) => onChange({ textAlign })}
        />
      </>
    );
  }

  // Spacing
  return (
    <>
      <RangeField
        label="Line height"
        value={props.lineHeight}
        min={1.0}
        max={3.0}
        step={0.05}
        fallback={1.6}
        onChange={(lineHeight) => onChange({ lineHeight })}
      />
      <RangeField
        label="Letter spacing"
        value={props.letterSpacing}
        min={-0.05}
        max={0.3}
        step={0.01}
        unit="em"
        fallback={0}
        onChange={(letterSpacing) => onChange({ letterSpacing })}
      />
      <Field label="Margin">
        <TextField
          value={props.margin}
          placeholder="0px"
          onCommit={(margin) => onChange({ margin })}
          width="w-[120px]"
          mono
        />
      </Field>
    </>
  );
}
