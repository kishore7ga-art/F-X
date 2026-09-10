/**
 * What the toolbar shows for each kind of selection.
 *
 * A registry rather than a switch inside the toolbar: the toolbar renders
 * whatever tabs the selected type declares and hands the active tab to that
 * type's panel. Adding a type is one entry here and one panel; the toolbar
 * itself does not change.
 *
 * The section entry is here for completeness and for the type badge — the
 * section toolbar predates this registry and renders its own schema-driven
 * groups (Background, Animation, Text Color, …).
 */

import type { ElementType } from "@/lib/editor/selection-store";

export interface ToolbarTab {
  id: string;
  label: string;
}

export interface ToolbarTypeConfig {
  /** Badge text and colour, so a glance tells what is selected. */
  badge: string;
  badgeClass: string;
  tabs: ReadonlyArray<ToolbarTab>;
  /** What the Delete button removes. */
  deleteLabel: string;
}

export const TOOLBAR_CONFIG: Record<ElementType, ToolbarTypeConfig> = {
  section: {
    badge: "Section",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200/60",
    tabs: [
      { id: "background", label: "Background" },
      { id: "animation", label: "Animation" },
      { id: "textColor", label: "Text Color" },
      { id: "layout", label: "Layout" },
      { id: "badge", label: "Badge" },
    ],
    deleteLabel: "this section",
  },
  card: {
    badge: "Card",
    badgeClass: "bg-violet-50 text-violet-700 border-violet-200/60",
    tabs: [
      { id: "style", label: "Background & Shape" },
      { id: "border", label: "Border" },
      { id: "spacing", label: "Margin & Padding" },
    ],
    deleteLabel: "this card",
  },
  button: {
    badge: "Button",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    tabs: [
      { id: "content", label: "Label & Link" },
      { id: "style", label: "Style & Size" },
      { id: "hover", label: "Hover" },
    ],
    deleteLabel: "this button",
  },
  image: {
    badge: "Image",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    tabs: [
      { id: "media", label: "Media" },
      { id: "layout", label: "Ratio & Fit" },
    ],
    deleteLabel: "this image",
  },
  text: {
    badge: "Text",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/60",
    tabs: [
      { id: "type", label: "Typography" },
      { id: "spacing", label: "Spacing" },
    ],
    deleteLabel: "this text",
  },
};
