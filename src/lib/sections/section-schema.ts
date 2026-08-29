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

const JUSTIFY_OPTIONS: readonly ControlOption[] = [
  { value: "", label: "Inherit" },
  { value: "flex-start", label: "Start" },
  { value: "center", label: "Centre" },
  { value: "flex-end", label: "End" },
  { value: "space-between", label: "Space between" },
  { value: "space-around", label: "Space around" },
];

const ALIGN_ITEMS_OPTIONS: readonly ControlOption[] = [
  { value: "", label: "Inherit" },
  { value: "flex-start", label: "Top" },
  { value: "center", label: "Middle" },
  { value: "flex-end", label: "Bottom" },
  { value: "stretch", label: "Stretch" },
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

  /* — Content —————————————————————————————————————————————— */

  const outerHeadings = probe.headings.filter((entry) => !insideList(entry.path));
  const outerParagraphs = probe.paragraphs.filter((entry) => !insideList(entry.path));

  outerHeadings.slice(0, 3).forEach((heading, index) => {
    group("content").controls.push({
      id: `heading-${index}`,
      label: index === 0 ? "Heading" : `Heading ${index + 1}`,
      kind: "text",
      target: at(heading.path),
      op: { kind: "text" },
      responsive: false,
      placeholder: "Heading text",
    });
  });

  outerParagraphs.slice(0, 3).forEach((paragraph, index) => {
    group("content").controls.push({
      id: `paragraph-${index}`,
      label: index === 0 ? "Description" : `Description ${index + 1}`,
      kind: "textarea",
      target: at(paragraph.path),
      op: { kind: "text" },
      responsive: false,
      placeholder: "Body copy",
    });
  });

  /* — Logo —————————————————————————————————————————————————— */

  if (probe.logo) {
    const logo = probe.logo;
    const logoTarget = at(logo.path);
    group("logo").controls.push(
      { id: "logo-src", label: "Logo image", kind: "image", target: logoTarget, op: { kind: "attr", name: "src" }, responsive: false },
      { id: "logo-alt", label: "Alt text", kind: "text", target: logoTarget, op: { kind: "attr", name: "alt" }, responsive: false },
      lengthControl("logo-width", "Width", logoTarget, "width", { max: 600 }),
      lengthControl("logo-height", "Height", logoTarget, "height", { max: 400 }),
      lengthControl("logo-gap", "Spacing", logoTarget, "margin-right", { max: 120 }),
    );

    // A logo is usually wrapped in the link to the home page; that link is what
    // "Logo link" means, and it is one level up rather than on the image.
    const wrapper = logo.node.parent;
    if (wrapper && wrapper.tag === "a") {
      const wrapperPath = pathOfDescendant(probe.root, wrapper);
      if (wrapperPath) {
        group("logo").controls.push({
          id: "logo-link",
          label: "Logo link",
          kind: "url",
          target: at(wrapperPath),
          op: { kind: "attr", name: "href" },
          responsive: false,
          placeholder: "/",
        });
      }
    }
  }

  /* — Navigation ——————————————————————————————————————————— */

  if (probe.navLinks.length > 0) {
    const navGroup = group("navigation");
    navGroup.lists.push({
      id: "nav-items",
      label: "Navigation items",
      itemNoun: "Item",
      containerPath: probe.navContainer?.path ?? [],
      items: probe.navLinks.map((link, index) => ({
        path: link.path,
        label: trimLabel(link.text) || `Item ${index + 1}`,
        controls: [
          { id: "label", label: "Label", kind: "text", target: at(link.path), op: { kind: "text" }, responsive: false },
          { id: "href", label: "Link", kind: "url", target: at(link.path), op: { kind: "attr", name: "href" }, responsive: false },
        ],
      })),
      // No `add`: a navigation item is a link inside a structure whose markup
      // varies wildly between headers, and cloning the last one is the only
      // honest way to make a new one — which is exactly what `duplicate` is.
      actions: ["duplicate", "delete", "moveUp", "moveDown"],
      itemStyleControls: [
        selectControl("nav-font", "Font", at(...probe.navLinks.map((l) => l.path)), "font-family", FONT_OPTIONS),
        lengthControl("nav-size", "Font size", at(...probe.navLinks.map((l) => l.path)), "font-size", { max: 64 }),
        selectControl("nav-weight", "Font weight", at(...probe.navLinks.map((l) => l.path)), "font-weight", WEIGHT_OPTIONS),
        colorControl("nav-color", "Text colour", at(...probe.navLinks.map((l) => l.path)), "color"),
      ],
    });

    if (probe.navContainer) {
      const navTarget = at(probe.navContainer.path);
      navGroup.controls.push(
        lengthControl("nav-gap", "Item spacing", navTarget, "gap", { max: 96 }),
        selectControl("nav-justify", "Alignment", navTarget, "justify-content", JUSTIFY_OPTIONS),
      );
    }
  }

  /* — Buttons ——————————————————————————————————————————————— */

  const buttons = probe.actions.filter((entry) => !insideList(entry.path)).slice(0, 4);
  buttons.forEach((button, index) => {
    const target = at(button.path);
    const prefix = buttons.length > 1 ? `Button ${index + 1} · ` : "";
    group("buttons").controls.push(
      { id: `btn-${index}-text`, label: `${prefix}Text`, kind: "text", target, op: { kind: "text" }, responsive: false },
      { id: `btn-${index}-href`, label: `${prefix}Link`, kind: "url", target, op: { kind: "attr", name: "href" }, responsive: false, placeholder: "#" },
      colorControl(`btn-${index}-bg`, `${prefix}Background`, target, "background-color"),
      colorControl(`btn-${index}-fg`, `${prefix}Text colour`, target, "color"),
      lengthControl(`btn-${index}-radius`, `${prefix}Radius`, target, "border-radius", { max: 999 }),
      lengthControl(`btn-${index}-size`, `${prefix}Font size`, target, "font-size", { max: 48 }),
      styleControl(`btn-${index}-pad`, `${prefix}Padding`, target, "padding", {
        kind: "box",
        op: { kind: "box", prop: "padding" },
      }),
      styleControl(`btn-${index}-border`, `${prefix}Border`, target, "border", {
        kind: "raw",
        placeholder: "1px solid #cbd5e1",
      }),
    );
  });

  /* — Media ————————————————————————————————————————————————— */

  const images = probe.images.filter((entry) => !insideList(entry.path)).slice(0, 3);
  images.forEach((image, index) => {
    const target = at(image.path);
    const prefix = images.length > 1 ? `Image ${index + 1} · ` : "";
    group("media").controls.push(
      { id: `img-${index}-src`, label: `${prefix}Image`, kind: "image", target, op: { kind: "attr", name: "src" }, responsive: false },
      { id: `img-${index}-alt`, label: `${prefix}Alt text`, kind: "text", target, op: { kind: "attr", name: "alt" }, responsive: false },
      lengthControl(`img-${index}-w`, `${prefix}Width`, target, "width", { max: 2000 }),
      lengthControl(`img-${index}-h`, `${prefix}Height`, target, "height", { max: 2000 }),
      selectControl(`img-${index}-fit`, `${prefix}Fit`, target, "object-fit", FIT_OPTIONS),
      styleControl(`img-${index}-pos`, `${prefix}Position`, target, "object-position", { kind: "raw", placeholder: "center" }),
      lengthControl(`img-${index}-radius`, `${prefix}Radius`, target, "border-radius", { max: 999 }),
    );
  });

  /* — Lists (cards, gallery, links, form fields) ——————————— */

  probe.repeaters.forEach((repeater, listIndex) => {
    const names = listLabelFor(category, repeater.kind);
    const itemPaths = repeater.items.map((item) => item.path);
    const allItems = at(...itemPaths);

    const items: ControlListItem[] = repeater.items.map((item, index) => {
      const controls: Control[] = [];
      const add = (node: ElementNode | null, control: (path: ElementPath) => Control) => {
        if (!node) return;
        const path = pathOfDescendant(probe.root, node);
        if (path) controls.push(control(path));
      };

      if (repeater.kind === "images") {
        add(firstIn(item.node, isImage), (path) => ({
          id: "src", label: "Image", kind: "image", target: at(path), op: { kind: "attr", name: "src" }, responsive: false,
        }));
        add(firstIn(item.node, isImage), (path) => ({
          id: "alt", label: "Alt text", kind: "text", target: at(path), op: { kind: "attr", name: "alt" }, responsive: false,
        }));
        add(
          firstIn(item.node, (node) => isParagraph(node) || isHeading(node)),
          (path) => ({ id: "caption", label: "Caption", kind: "text", target: at(path), op: { kind: "text" }, responsive: false }),
        );
      } else if (repeater.kind === "fields") {
        add(firstIn(item.node, (node) => node.tag === "label"), (path) => ({
          id: "label", label: "Label", kind: "text", target: at(path), op: { kind: "text" }, responsive: false,
        }));
        add(firstIn(item.node, isField), (path) => ({
          id: "placeholder", label: "Placeholder", kind: "text", target: at(path), op: { kind: "attr", name: "placeholder" }, responsive: false,
        }));
        add(firstIn(item.node, isField), (path) => ({
          id: "name", label: "Field name", kind: "text", target: at(path), op: { kind: "attr", name: "name" }, responsive: false,
        }));
      } else if (repeater.kind === "links") {
        add(firstIn(item.node, isLink), (path) => ({
          id: "label", label: "Label", kind: "text", target: at(path), op: { kind: "text" }, responsive: false,
        }));
        add(firstIn(item.node, isLink), (path) => ({
          id: "href", label: "Link", kind: "url", target: at(path), op: { kind: "attr", name: "href" }, responsive: false,
        }));
      } else {
        add(firstIn(item.node, isHeading), (path) => ({
          id: "title", label: "Title", kind: "text", target: at(path), op: { kind: "text" }, responsive: false,
        }));
        add(firstIn(item.node, isParagraph), (path) => ({
          id: "body", label: "Description", kind: "textarea", target: at(path), op: { kind: "text" }, responsive: false,
        }));
        add(firstIn(item.node, isImage), (path) => ({
          id: "image", label: "Image", kind: "image", target: at(path), op: { kind: "attr", name: "src" }, responsive: false,
        }));
        add(firstIn(item.node, isLink), (path) => ({
          id: "href", label: "Link", kind: "url", target: at(path), op: { kind: "attr", name: "href" }, responsive: false,
        }));
      }

      const label =
        trimLabel(
          textContent(probe.body, firstIn(item.node, isHeading) ?? item.node) ||
            getAttribute(firstIn(item.node, isImage) ?? item.node, "alt") ||
            "",
        ) || `${names.item} ${index + 1}`;

      return { path: item.path, label, controls };
    });

    const itemStyleControls: Control[] =
      repeater.kind === "fields"
        ? [
            colorControl("field-bg", "Field background", allItems, "background-color"),
            lengthControl("field-radius", "Field radius", allItems, "border-radius", { max: 999 }),
          ]
        : [
            colorControl("item-bg", "Background", allItems, "background-color"),
            styleControl("item-border", "Border", allItems, "border", { kind: "raw", placeholder: "1px solid #e2e8f0" }),
            lengthControl("item-radius", "Radius", allItems, "border-radius", { max: 999 }),
            styleControl("item-shadow", "Shadow", allItems, "box-shadow", { kind: "raw", placeholder: "0 10px 25px rgba(0,0,0,.08)" }),
            styleControl("item-pad", "Padding", allItems, "padding", { kind: "box", op: { kind: "box", prop: "padding" } }),
            styleControl("item-ratio", "Aspect ratio", allItems, "aspect-ratio", { kind: "raw", placeholder: "4 / 3" }),
            selectControl("item-align", "Text alignment", allItems, "text-align", ALIGN_OPTIONS),
          ];

    group("list").lists.push({
      id: `list-${listIndex}`,
      label: names.group,
      itemNoun: names.item,
      containerPath: repeater.container.path,
      items,
      actions: ["add", "duplicate", "delete", "moveUp", "moveDown"],
      itemStyleControls,
    });

    // The row the items sit in is where columns and gaps belong, and it is the
    // container rather than the section — a services grid inside a padded
    // section has its own column count.
    const containerTarget = at(repeater.container.path);
    group("layout").controls.push(
      selectControl(`list-${listIndex}-cols`, `${names.group} columns`, containerTarget, "grid-template-columns", COLUMN_OPTIONS),
      lengthControl(`list-${listIndex}-gap`, `${names.group} gap`, containerTarget, "gap", { max: 160 }),
    );
  });

  /* — Layout ———————————————————————————————————————————————— */

  const layout = group("layout");
  layout.controls.unshift(
    lengthControl("root-min-height", "Section height", rootTarget, "min-height", { max: 2000, hint: "Minimum height" }),
    lengthControl("root-max-width", "Content width", rootTarget, "max-width", { max: 3000 }),
    selectControl("root-align", "Content alignment", rootTarget, "text-align", ALIGN_OPTIONS),
  );

  const mainTrack = probe.tracks.find((track) => !insideList(track.path));
  if (mainTrack) {
    const trackTarget = at(mainTrack.path);
    layout.controls.push(
      selectControl("track-cols", "Columns", trackTarget, "grid-template-columns", COLUMN_OPTIONS),
      lengthControl("track-gap", "Gap", trackTarget, "gap", { max: 160 }),
      selectControl("track-align", "Vertical alignment", trackTarget, "align-items", ALIGN_ITEMS_OPTIONS),
      selectControl("track-justify", "Horizontal alignment", trackTarget, "justify-content", JUSTIFY_OPTIONS),
      selectControl("track-direction", "Direction", trackTarget, "flex-direction", DIRECTION_OPTIONS),
      lengthControl("track-width", "Container width", trackTarget, "max-width", { max: 3000 }),
    );
  }

  /* — Background ———————————————————————————————————————————— */

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
    selectControl("bg-gradient", "Gradient", rootTarget, "--x-gradient", GRADIENT_OPTIONS),
    colorControl("bg-overlay", "Overlay colour", rootTarget, "--x-overlay"),
    styleControl("bg-overlay-opacity", "Overlay opacity", rootTarget, "--x-overlay-opacity", {
      kind: "number",
      unit: "",
      min: 0,
      max: 1,
      step: 0.05,
    }),
    styleControl("root-opacity", "Section opacity", rootTarget, "opacity", {
      kind: "number",
      unit: "",
      min: 0,
      max: 1,
      step: 0.05,
    }),
  );

  /* — Border and shadow ————————————————————————————————————— */

  group("border").controls.push(
    lengthControl("border-width", "Border width", rootTarget, "border-width", { max: 40 }),
    selectControl("border-style", "Border style", rootTarget, "border-style", BORDER_STYLE_OPTIONS),
    colorControl("border-color", "Border colour", rootTarget, "border-color"),
    lengthControl("border-radius", "Border radius", rootTarget, "border-radius", { max: 999 }),
  );

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

  /* — Typography ———————————————————————————————————————————— */

  const typography = group("typography");
  const headingTarget = outerHeadings.length > 0 ? at(...outerHeadings.map((h) => h.path)) : null;
  const bodyTarget = outerParagraphs.length > 0 ? at(...outerParagraphs.map((p) => p.path)) : null;

  if (headingTarget) {
    typography.controls.push(
      selectControl("h-font", "Heading font", headingTarget, "font-family", FONT_OPTIONS),
      lengthControl("h-size", "Heading size", headingTarget, "font-size", { max: 160 }),
      selectControl("h-weight", "Heading weight", headingTarget, "font-weight", WEIGHT_OPTIONS),
      colorControl("h-color", "Heading colour", headingTarget, "color"),
      styleControl("h-leading", "Heading line height", headingTarget, "line-height", {
        kind: "number", unit: "", min: 0.8, max: 3, step: 0.05,
      }),
      styleControl("h-tracking", "Heading letter spacing", headingTarget, "letter-spacing", {
        kind: "number", unit: "px", min: -10, max: 20, step: 0.1,
      }),
      selectControl("h-transform", "Heading case", headingTarget, "text-transform", TRANSFORM_OPTIONS),
    );
  }

  if (bodyTarget) {
    typography.controls.push(
      selectControl("p-font", "Body font", bodyTarget, "font-family", FONT_OPTIONS),
      lengthControl("p-size", "Body size", bodyTarget, "font-size", { max: 80 }),
      selectControl("p-weight", "Body weight", bodyTarget, "font-weight", WEIGHT_OPTIONS),
      colorControl("p-color", "Body colour", bodyTarget, "color"),
      styleControl("p-leading", "Body line height", bodyTarget, "line-height", {
        kind: "number", unit: "", min: 0.8, max: 3, step: 0.05,
      }),
      lengthControl("p-width", "Text width", bodyTarget, "max-width", { max: 1600 }),
    );
  }

  /* — Spacing ——————————————————————————————————————————————— */

  group("spacing").controls.push(
    { id: "root-padding", label: "Padding", kind: "box", target: rootTarget, op: { kind: "box", prop: "padding" }, responsive: true },
    { id: "root-margin", label: "Margin", kind: "box", target: rootTarget, op: { kind: "box", prop: "margin" }, responsive: true },
  );

  /* — Responsive ———————————————————————————————————————————— */

  group("responsive").controls.push({
    id: "root-hidden",
    label: "Hide on",
    kind: "toggle",
    target: rootTarget,
    op: { kind: "hidden" },
    responsive: false,
    hint: "The section stays in the page and stops rendering at that width.",
  });

  /* — Section ——————————————————————————————————————————————— */

  group("section").controls.push({
    id: "section-title",
    label: "Section name",
    kind: "text",
    target: { kind: "record" },
    op: { kind: "title" },
    responsive: false,
    hint: "What this section is called in the editor. Not published.",
  });

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
