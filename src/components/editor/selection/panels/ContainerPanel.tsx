"use client";

import type { ContainerProps } from "@/lib/editor/element-resolver";
import { SHADOW_PRESETS } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";
import { ColorField, Divider, Field, PxField, Segmented, TextField } from "./fields";

const SHADOW_OPTIONS = SHADOW_PRESETS.map((value) => ({
  value,
  label: value === "none" ? "None" : value.toUpperCase(),
}));

const DISPLAY_OPTIONS = [
  { value: "flex" as const, label: "Flex" },
  { value: "grid" as const, label: "Grid" },
  { value: "block" as const, label: "Block" },
];

const DIRECTION_OPTIONS = [
  { value: "row" as const, label: "Row (Horizontal)" },
  { value: "column" as const, label: "Column (Vertical)" },
];

export function ContainerPanel({ tab, props, onChange }: PanelProps<ContainerProps>) {
  if (tab === "layout") {
    return (
      <>
        <Segmented
          label="Display"
          value={props.display}
          options={DISPLAY_OPTIONS}
          onChange={(display) => onChange({ display })}
        />
        {props.display === "flex" && (
          <Segmented
            label="Direction"
            value={props.flexDirection}
            options={DIRECTION_OPTIONS}
            onChange={(flexDirection) => onChange({ flexDirection })}
          />
        )}
        <Divider />
        <Field label="Gap">
          <TextField
            value={props.gap}
            placeholder="16px"
            onCommit={(gap) => onChange({ gap })}
            width="w-[90px]"
            mono
          />
        </Field>
      </>
    );
  }

  if (tab === "style") {
    return (
      <>
        <ColorField
          label="Background"
          value={props.background}
          fallback="transparent"
          allowEmpty
          onChange={(background) => onChange({ background })}
        />
        <PxField
          label="Corner radius"
          value={props.radius}
          max={48}
          onChange={(radius) => onChange({ radius })}
        />
        <Divider />
        <PxField
          label="Border width"
          value={props.borderWidth}
          max={8}
          onChange={(borderWidth) => onChange({ borderWidth })}
        />
        <ColorField
          label="Border color"
          value={props.borderColor}
          fallback="#e2e8f0"
          onChange={(borderColor) => onChange({ borderColor })}
        />
        <Divider />
        <Segmented
          label="Shadow"
          value={props.shadow}
          options={SHADOW_OPTIONS}
          onChange={(shadow) => onChange({ shadow })}
        />
      </>
    );
  }

  // Spacing & Width
  return (
    <>
      <Field label="Padding">
        <TextField
          value={props.padding}
          placeholder="0px"
          onCommit={(padding) => onChange({ padding })}
          width="w-[110px]"
          mono
        />
      </Field>
      <Field label="Margin">
        <TextField
          value={props.margin}
          placeholder="0px"
          onCommit={(margin) => onChange({ margin })}
          width="w-[110px]"
          mono
        />
      </Field>
      <Field label="Max width">
        <TextField
          value={props.maxWidth}
          placeholder="1200px"
          onCommit={(maxWidth) => onChange({ maxWidth })}
          width="w-[110px]"
          mono
        />
      </Field>
      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
        CSS shorthand: top right bottom left
      </span>
    </>
  );
}
