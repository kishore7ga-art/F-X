/**
 * The toolbar for one selected section, derived rather than declared.
 *
 * ── The shape of the thing ─────────────────────────────────────────────────
 *
 *     section.code ──► splitSectionCode ──► body markup
 *                                             │
 *                                     probeSection (what is in there)
 *                                             │
 *                        buildSectionSchema (this file) ──► groups of controls
 *                                             │
 *                                    SectionToolbar renders them
 *                                             │
 *                              applyControl ──► new section.code
 *
 * Every control in the panel is a row in a structure this file produces. There
 * is no per-section-type component, no `HeroToolbar.tsx`, no `switch (type)`.
 * Adding a section type to the platform adds nothing here; adding a *control*
 * adds one entry to one builder and it becomes available to every section whose
 * markup supports it. That is what §2 and §16 of the brief ask for, and it is
 * the only version of this that survives an administrator publishing a section
 * kind nobody anticipated.
 *
 * ── Why controls carry paths rather than elements ──────────────────────────
 *
 * A `Control` is plain data: a path, an operation and a label. It holds no
 * reference to a parsed node, so it can be built during render and used after
 * the markup has changed underneath it — the apply step re-parses and re-walks
 * the path, and a path that no longer resolves does nothing at all. Holding a
 * node would mean editing an element that has been deleted, which in a system
 * where the section *is* the string means writing that element back.
 */

import {
  categoryLabel,
  defaultOpenFor,
  groupOrderFor,
  listLabelFor,
  GROUP_LABEL,
  type CapabilityId,
  type SectionCategory,
} from "./section-capabilities";
import { childElements, descendants, getAttribute, textContent, type ElementNode } from "./html-dom";
import { probeSection, type ElementPath, type SectionProbe } from "./section-probe";
import { splitSectionCode, type Device } from "./section-managed-css";

/* ── The control model ──────────────────────────────────────────────────── */

export type ControlKind =
  | "text"
  | "textarea"
  | "url"
  | "image"
  | "color"
  | "number"
  | "select"
  | "toggle"
  | "box"
  | "raw";

export type ControlOption = { value: string; label: string };

/**
 * What a control acts on.
 *
 * `paths` is a list because a styling control very often means "all of them":
 * "Card background" has to reach every card, or the person sets it once and
 * watches one of six cards change.
 */
export type ControlTarget =
  | { kind: "elements"; paths: readonly ElementPath[] }
  /** The section row itself — its `title`, not its markup. */
  | { kind: "record" };

export type ControlOp =
  /** The section's name in the editor. Not part of the published markup. */
  | { kind: "title" }
  /** The element's text. */
  | { kind: "text" }
  /** An attribute: `href`, `src`, `alt`. */
  | { kind: "attr"; name: string }
  /** One CSS declaration in the managed region. */
  | { kind: "style"; prop: string }
  /** The four sides of `padding` or `margin`, as longhands. */
  | { kind: "box"; prop: "padding" | "margin" }
  /** Which devices the section is hidden on. */
  | { kind: "hidden" };

export type Control = {
  id: string;
  label: string;
  kind: ControlKind;
  target: ControlTarget;
  op: ControlOp;
  /** Whether the value is stored per device. Content is not; styling is. */
  responsive: boolean;
  options?: readonly ControlOption[];
  /** Appended to a bare number typed into a `number` control. */
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  hint?: string;
};

export type ListAction = "add" | "duplicate" | "delete" | "moveUp" | "moveDown";

export type ControlListItem = {
  path: ElementPath;
  label: string;
  controls: Control[];
};

/** A repeated structure — cards, gallery images, navigation links, form fields. */
export type ControlList = {
  id: string;
  label: string;
  itemNoun: string;
  containerPath: ElementPath;
  items: ControlListItem[];
  actions: readonly ListAction[];
  /** Styling that applies to every item at once. */
  itemStyleControls: Control[];
};

export type ControlGroup = {
  id: CapabilityId;
  label: string;
  controls: Control[];
  lists: ControlList[];
  open: boolean;
};

export type SectionSchema = {
  category: SectionCategory;
  categoryLabel: string;
  /** The groups that had something to show, in this category's order. */
  groups: ControlGroup[];
  /** For the panel's summary line and for tests. */
  capabilities: CapabilityId[];
};

/* ── Option lists ───────────────────────────────────────────────────────── */

const ALIGN_OPTIONS: readonly ControlOption[] = [
  { value: "", label: "Inherit" },
  { value: "left", label: "Left" },
  { value: "center", label: "Centre" },
  { value: "right", label: "Right" },
];



const DIRECTION_OPTIONS: readonly ControlOption[] = [
  { value: "", label: "Inherit" },
  { value: "row", label: "Row" },
  { value: "row-reverse", label: "Row reversed" },
  { value: "column", label: "Column" },
  { value: "column-reverse", label: "Column reversed" },
];

const COLUMN_OPTIONS: readonly ControlOption[] = [
  { value: "", label: "Inherit" },
  { value: "minmax(0, 1fr)", label: "1 column" },
  { value: "repeat(2, minmax(0, 1fr))", label: "2 columns" },
  { value: "repeat(3, minmax(0, 1fr))", label: "3 columns" },
  { value: "repeat(4, minmax(0, 1fr))", label: "4 columns" },
  { value: "repeat(5, minmax(0, 1fr))", label: "5 columns" },
  { value: "repeat(6, minmax(0, 1fr))", label: "6 columns" },
];

const WEIGHT_OPTIONS: readonly ControlOption[] = [
  { value: "", label: "Inherit" },
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extrabold" },
  { value: "900", label: "Black" },
];

/**
 * Families that are actually loaded.
 *
 * Two Google families and the system stack — the same three the runtime's
 * stylesheet requests. Offering a family the document never loads produces a
 * control that changes nothing visible, which reads as a broken control rather
 * than as a missing font.
 */
const FONT_OPTIONS: readonly ControlOption[] = [
  { value: "", label: "Inherit" },
  { value: "'Inter', system-ui, sans-serif", label: "Inter" },
  { value: "'Outfit', system-ui, sans-serif", label: "Outfit" },
  { value: "Georgia, 'Times New Roman', serif", label: "Serif" },
  { value: "system-ui, -apple-system, 'Segoe UI', sans-serif", label: "System" },
];

const TRANSFORM_OPTIONS: readonly ControlOption[] = [
  { value: "", label: "Inherit" },
  { value: "none", label: "Normal" },
  { value: "uppercase", label: "Uppercase" },
  { value: "lowercase", label: "Lowercase" },
  { value: "capitalize", label: "Capitalise" },
];

const BORDER_STYLE_OPTIONS: readonly ControlOption[] = [
  { value: "", label: "Inherit" },
  { value: "none", label: "None" },
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

const FIT_OPTIONS: readonly ControlOption[] = [
  { value: "", label: "Inherit" },
  { value: "cover", label: "Cover" },
  { value: "contain", label: "Contain" },
  { value: "fill", label: "Fill" },
  { value: "none", label: "None" },
];

const GRADIENT_OPTIONS: readonly ControlOption[] = [
  { value: "", label: "None" },
  { value: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)", label: "Fade to dark" },
  { value: "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 100%)", label: "Fade to light" },
  { value: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)", label: "Blue to violet" },
  { value: "linear-gradient(135deg, #0f172a 0%, #334155 100%)", label: "Slate" },
  { value: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", label: "Amber to red" },
];

const BUTTON_SHADOW_OPTIONS: readonly ControlOption[] = [
  { value: "", label: "None" },
  { value: "0 4px 14px -2px rgba(0, 0, 0, 0.12)", label: "Soft" },
  { value: "0 10px 25px -4px rgba(0, 0, 0, 0.28)", label: "Strong" },
];

const BUTTON_SIZE_OPTIONS: readonly ControlOption[] = [
  { value: "", label: "Default" },
  { value: "6px 14px", label: "Small" },
  { value: "10px 20px", label: "Medium" },
  { value: "14px 28px", label: "Large" },
];

/* ── Control factories ──────────────────────────────────────────────────── */

const at = (...paths: readonly ElementPath[]): ControlTarget => ({ kind: "elements", paths });

function styleControl(
  id: string,
  label: string,
  target: ControlTarget,
  prop: string,
  extra: Partial<Control> = {},
): Control {
  return {
    id,
    label,
    kind: "text",
    target,
    op: { kind: "style", prop },
    responsive: true,
    ...extra,
  };
}

const lengthControl = (id: string, label: string, target: ControlTarget, prop: string, extra: Partial<Control> = {}) =>
  styleControl(id, label, target, prop, { kind: "number", unit: "px", min: 0, step: 1, ...extra });

const colorControl = (id: string, label: string, target: ControlTarget, prop: string, extra: Partial<Control> = {}) =>
  styleControl(id, label, target, prop, { kind: "color", ...extra });

const selectControl = (
  id: string,
  label: string,
  target: ControlTarget,
  prop: string,
  options: readonly ControlOption[],
  extra: Partial<Control> = {},
) => styleControl(id, label, target, prop, { kind: "select", options, ...extra });

/* ── Building ───────────────────────────────────────────────────────────── */

/** True when the element sits inside one of the detected repeaters' items. */
function makeInsideList(probe: SectionProbe) {
  const itemPaths = probe.repeaters.flatMap((repeater) => repeater.items.map((item) => item.path));
  return (path: ElementPath) =>
    itemPaths.some((item) => path.length >= item.length && item.every((value, i) => path[i] === value));
}

/** The first descendant matching a tag test, for building an item's controls. */
function firstIn(item: ElementNode, test: (node: ElementNode) => boolean): ElementNode | null {
  if (test(item)) return item;
  return descendants(item).find(test) ?? null;
}

/** The path of a descendant, relative to nothing — an absolute path. */
function pathOfDescendant(root: ElementNode, target: ElementNode): ElementPath | null {
  const chain: number[] = [];
  let node: ElementNode | null = target;
  while (node && node !== root) {
    const parent: ElementNode | null = node.parent;
    if (!parent) return null;
    const index = childElements(parent).indexOf(node);
    if (index < 0) return null;
    chain.unshift(index);
    node = parent;
  }
  return node === root ? chain : null;
}

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
const isHeading = (node: ElementNode) => HEADING_TAGS.has(node.tag);
const isParagraph = (node: ElementNode) => node.tag === "p" || node.tag === "small" || node.tag === "span";
const isImage = (node: ElementNode) => node.tag === "img";
const isLink = (node: ElementNode) => node.tag === "a";
const isField = (node: ElementNode) => node.tag === "input" || node.tag === "textarea" || node.tag === "select";

function trimLabel(text: string, max = 28): string {
  const clean = text.trim();
  if (!clean) return "";
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

/**
 * The toolbar for one section.
 *
 * `code` is the section's stored markup — stylesheet and all. Everything else
 * is derived, so calling this twice on the same code gives the same panel, and
 * calling it after an edit gives a panel that reflects the edit. It is cheap
 * enough to run on every render of the selected section and is memoised by the
 * component that does.
 */
export function buildSectionSchema(section: {
  code: string;
  category: SectionCategory;
}): SectionSchema {
  const { bodyHtml } = splitSectionCode(section.code);
  const probe = probeSection(bodyHtml);
  const insideList = makeInsideList(probe);
  const category = section.category;

  const rootPaths = probe.roots.map((entry) => entry.path);
  const rootTarget = at(...(rootPaths.length > 0 ? rootPaths : [[] as ElementPath]));

  const groups = new Map<CapabilityId, ControlGroup>();
  const group = (id: CapabilityId): ControlGroup => {
    const existing = groups.get(id);
    if (existing) return existing;
    const created: ControlGroup = { id, label: GROUP_LABEL[id], controls: [], lists: [], open: false };
    groups.set(id, created);
    return created;
  };

  /* — 1. Background (Color, image, or gradient controls) ————————————————— */

  /* — 2. Background (Color or Image controls) ————————————————— */
  group("background").controls.push(
    colorControl("bg-color", "Background colour", rootTarget, "background-color"),
    {
      id: "bg-image",
      label: "Background image",
      kind: "image",
      target: rootTarget,
      op: { kind: "style", prop: "--x-bg-image" },
      responsive: true,
      placeholder: "https://…",
    },
    selectControl("bg-gradient", "Designs", rootTarget, "--x-gradient", GRADIENT_OPTIONS),
    styleControl("bg-shadow", "Image shadow", rootTarget, "box-shadow"),
    styleControl("bg-density", "Image density", rootTarget, "--x-bg-size"),
    styleControl("bg-blur", "Image blur", rootTarget, "--x-bg-blur"),
    colorControl("bg-overlay", "Overlay colour", rootTarget, "--x-overlay"),
    styleControl("bg-overlay-opacity", "Overlay opacity", rootTarget, "--x-overlay-opacity", {
      kind: "number",
      unit: "",
      min: 0,
      max: 1,
      step: 0.05,
    }),
  );

  /* — Buttons (4 Core Minimal Controls: Shape, Shadow, Colors, Border) — */
  const buttons = probe.actions.filter((btn) => !insideList(btn.path));
  if (buttons.length > 0) {
    const buttonsGrp = group("buttons");
    buttons.forEach((btn, index) => {
      const target = at(btn.path);
      const prefix = `btn-${index}`;
      const name = index === 0 ? "Primary Button" : index === 1 ? "Secondary Button" : `Button ${index + 1}`;

      // 1. Shape / Corner Radius: 0px to 40px
      buttonsGrp.controls.push(
        lengthControl(`${prefix}-radius`, `${name} Shape`, target, "border-radius", {
          min: 0,
          max: 40,
          step: 1,
          hint: "Corner radius (0px to 40px)",
        }),
      );

      // 2. Shadow: None | Soft | Strong
      buttonsGrp.controls.push(
        selectControl(`${prefix}-shadow`, `${name} Shadow`, target, "box-shadow", BUTTON_SHADOW_OPTIONS),
      );

      // 3. Colors: Background & Text
      buttonsGrp.controls.push(
        colorControl(`${prefix}-bg`, `${name} Background`, target, "background-color"),
        colorControl(`${prefix}-color`, `${name} Text colour`, target, "color"),
      );

      // 4. Border Stroke: 0px to 3px
      buttonsGrp.controls.push(
        lengthControl(`${prefix}-border`, `${name} Border stroke`, target, "border-width", {
          min: 0,
          max: 3,
          step: 1,
          hint: "Border stroke (0px to 3px)",
        }),
      );

      // 5. Button Size: Small | Medium | Large
      buttonsGrp.controls.push(
        selectControl(`${prefix}-size`, `${name} Size`, target, "padding", BUTTON_SIZE_OPTIONS),
      );
    });
  }

  /* — 3. Shadow (X, Y, blur, spread, and shadow color adjustments) —————— */
  group("shadow").controls.push(
    lengthControl("shadow-x", "Offset X", rootTarget, "--x-shadow-x", { min: -200, max: 200 }),
    lengthControl("shadow-y", "Offset Y", rootTarget, "--x-shadow-y", { min: -200, max: 200 }),
    lengthControl("shadow-blur", "Blur", rootTarget, "--x-shadow-blur", { max: 200 }),
    lengthControl("shadow-spread", "Spread", rootTarget, "--x-shadow-spread", { min: -100, max: 100 }),
    colorControl("shadow-color", "Shadow colour", rootTarget, "--x-shadow-color"),
    styleControl("shadow-opacity", "Shadow opacity", rootTarget, "--x-shadow-opacity", {
      kind: "number",
      unit: "",
      min: 0,
      max: 1,
      step: 0.05,
    }),
  );

  /* — 4. Animation (Entrance and hover animation effects) —————————————— */
  group("animation").controls.push(
    selectControl("anim-preset", "Entrance effect", rootTarget, "animation", [
      { value: "", label: "None" },
      { value: "xite-fade-in 0.7s ease-out both", label: "Fade in" },
      { value: "xite-slide-up 0.7s ease-out both", label: "Slide up" },
      { value: "xite-slide-down 0.7s ease-out both", label: "Slide down" },
      { value: "xite-slide-left 0.7s ease-out both", label: "Slide left" },
      { value: "xite-slide-right 0.7s ease-out both", label: "Slide right" },
      { value: "xite-zoom-in 0.7s ease-out both", label: "Zoom in" },
    ]),
    selectControl("anim-transition", "Hover transition", rootTarget, "transition", [
      { value: "", label: "None" },
      { value: "all 0.2s ease", label: "Fast (0.2s)" },
      { value: "all 0.3s ease", label: "Smooth (0.3s)" },
      { value: "all 0.5s ease", label: "Gentle (0.5s)" },
    ]),
  );

  /* — 5. Section (Preset variations, ID, and section-level options) ————— */
  group("section").controls.push(
    {
      id: "section-title",
      label: "Section name",
      kind: "text",
      target: { kind: "record" },
      op: { kind: "title" },
      responsive: false,
      hint: "What this section is called in the editor. Not published.",
    },
    {
      id: "section-id",
      label: "Section ID / Anchor",
      kind: "text",
      target: rootTarget,
      op: { kind: "attr", name: "id" },
      responsive: false,
      placeholder: "e.g. hero-section",
      hint: "HTML anchor ID for in-page jump links.",
    },
  );

  /* — Assemble ——————————————————————————————————————————————— */

  const open = defaultOpenFor(category);
  const ordered = groupOrderFor(category)
    .map((id) => groups.get(id))
    .filter((entry): entry is ControlGroup => Boolean(entry))
    .filter((entry) => entry.controls.length > 0 || entry.lists.length > 0)
    .map((entry) => ({ ...entry, open: open.has(entry.id) }));

  return {
    category,
    categoryLabel: categoryLabel(category),
    groups: ordered,
    capabilities: ordered.map((entry) => entry.id),
  };
}

/** Every control in a schema, flattened. For tests and for value lookups. */
export function allControls(schema: SectionSchema): Control[] {
  return schema.groups.flatMap((group) => [
    ...group.controls,
    ...group.lists.flatMap((list) => [
      ...list.itemStyleControls,
      ...list.items.flatMap((item) => item.controls),
    ]),
  ]);
}

export type { Device };
