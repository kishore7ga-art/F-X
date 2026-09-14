"use client";

import type { GenericProps } from "@/lib/editor/element-resolver";
import type { PanelProps } from "./CardPanel";
import { ColorField, Divider, Field, PxField, TextField } from "./fields";

export function GenericPanel({ tab, props, onChange }: PanelProps<GenericProps>) {
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
        <ColorField
          label="Text color"
          value={props.color}
          fallback="#0f172a"
          onChange={(color) => onChange({ color })}
        />
        <PxField
          label="Radius"
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
      </>
    );
  }

  // Spacing
  return (
    <>
      <Field label="Padding">
        <TextField
          value={props.padding}
          placeholder="0px"
          onCommit={(padding) => onChange({ padding })}
          width="w-[120px]"
          mono
        />
      </Field>
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
