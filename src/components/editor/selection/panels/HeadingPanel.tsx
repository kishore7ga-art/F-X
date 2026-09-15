"use client";

import type { HeadingLevel, HeadingProps, TextAlign } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";
import { ColorField, Divider, Field, PxField, RangeField, Segmented, SelectField, TextField } from "./fields";

const HEADING_LEVELS: ReadonlyArray<{ value: HeadingLevel; label: string; title: string }> = [
  { value: "h1", label: "H1", title: "Heading 1 (Main page title)" },
  { value: "h2", label: "H2", title: "Heading 2 (Section heading)" },
  { value: "h3", label: "H3", title: "Heading 3 (Subsection heading)" },
  { value: "h4", label: "H4", title: "Heading 4 (Card/feature heading)" },
  { value: "h5", label: "H5", title: "Heading 5 (Small heading)" },
  { value: "h6", label: "H6", title: "Heading 6 (Subtle heading)" },
];

const ALIGNMENTS: ReadonlyArray<{ value: TextAlign; label: string; title: string }> = [
  { value: "left", label: "Left", title: "Align left" },
  { value: "center", label: "Center", title: "Align center" },
  { value: "right", label: "Right", title: "Align right" },
  { value: "justify", label: "Justify", title: "Justify text" },
];

const WEIGHTS = [
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
  { value: "900", label: "Black" },
];

const FONT_FAMILIES = [
  { value: "", label: "Default Font" },
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'Outfit', sans-serif", label: "Outfit" },
  { value: "'Plus Jakarta Sans', sans-serif", label: "Plus Jakarta" },
  { value: "'Playfair Display', serif", label: "Playfair" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "ui-monospace, monospace", label: "Monospace" },
];

const TRANSFORMS = [
  { value: "none" as const, label: "Aa", title: "Normal case" },
  { value: "uppercase" as const, label: "AA", title: "Uppercase" },
  { value: "capitalize" as const, label: "Ab", title: "Capitalize" },
];

export interface HeadingPanelProps extends PanelProps<HeadingProps> {
  onChangeLevel?: (level: HeadingLevel) => void;
}

export function HeadingPanel({ tab, props, onChange, onChangeLevel }: HeadingPanelProps) {
  if (tab === "level") {
    return (
      <>
        <Segmented
          label="Heading tag"
          value={props.level || "h2"}
          options={HEADING_LEVELS}
          onChange={(level) => {
            onChange({ level });
            onChangeLevel?.(level);
          }}
        />
        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
          Changes semantic HTML tag (SEO & accessibility)
        </span>
      </>
    );
  }

  if (tab === "type") {
    return (
      <>
        <SelectField
          label="Font"
          value={props.fontFamily || ""}
          options={FONT_FAMILIES}
          onChange={(fontFamily) => onChange({ fontFamily })}
        />
        <ColorField
          label="Color"
          value={props.color}
          fallback="#0f172a"
          onChange={(color) => onChange({ color })}
        />
        <PxField
          label="Size"
          value={props.fontSize}
          min={12}
          max={96}
          onChange={(fontSize) => onChange({ fontSize })}
        />
        <Segmented
          label="Weight"
          value={props.fontWeight || "700"}
          options={WEIGHTS}
          onChange={(fontWeight) => onChange({ fontWeight })}
        />
        <Divider />
        <Segmented
          label="Case"
          value={props.textTransform || "none"}
          options={TRANSFORMS}
          onChange={(textTransform) => onChange({ textTransform })}
        />
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
        min={0.8}
        max={2.5}
        step={0.05}
        fallback={1.2}
        onChange={(lineHeight) => onChange({ lineHeight })}
      />
      <RangeField
        label="Letter spacing"
        value={props.letterSpacing}
        min={-0.1}
        max={0.5}
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
