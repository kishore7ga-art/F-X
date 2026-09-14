/**
 * What the toolbar shows for each kind of selection.
 *
 * A registry rather than a switch inside the toolbar: the toolbar renders
 * whatever tabs the selected type declares and hands the active tab to that
 * type's panel. Adding a type is one entry here and one panel; the toolbar
 * itself does not change.
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
      { id: "layout", label: "Layout" },
      { id: "badge", label: "Badge" },
    ],
    deleteLabel: "this section",
  },
  container: {
    badge: "Container",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200/60",
    tabs: [
      { id: "layout", label: "Layout & Direction" },
      { id: "style", label: "Background & Border" },
      { id: "spacing", label: "Spacing & Width" },
    ],
    deleteLabel: "this container",
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
  heading: {
    badge: "Heading",
    badgeClass: "bg-pink-50 text-pink-700 border-pink-200/60",
    tabs: [
      { id: "level", label: "Heading Level" },
      { id: "type", label: "Typography" },
      { id: "spacing", label: "Spacing" },
    ],
    deleteLabel: "this heading",
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
  button: {
    badge: "Button",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
    tabs: [
      { id: "button", label: "Button" },
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
  generic: {
    badge: "Element",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200/60",
    tabs: [
      { id: "style", label: "Style" },
      { id: "spacing", label: "Spacing" },
    ],
    deleteLabel: "this element",
  },
};
