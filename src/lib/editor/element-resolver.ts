/**
 * What was clicked or right-clicked, and what the toolbar can do to it.
 *
 * ── The hierarchy ─────────────────────────────────────────────────────────
 *
 *   Canvas → Section → Container → Card → Leaf (button, image, heading, text, generic)
 *
 * A section is a string of HTML with no structure the editor put there, so the
 * hierarchy is read off the DOM at the moment of the click, from the clicked
 * node upward. The **innermost** thing that means something wins: a button
 * inside a card selects the button, the card's own padding selects the card,
 * and anything that reaches the section root without meaning anything is the
 * section — which is left to the section toolbar.
 *
 * ── Identity ──────────────────────────────────────────────────────────────
 *
 * The canvas rebuilds a section's DOM whenever its code changes, so a node
 * reference goes stale on the very edit it was used for. An element is
 * therefore addressed by its child-index path from the section's canvas box
 * (`0/3/1`), which survives a rebuild as long as the structure does — and an
 * edit that changes the structure (delete) clears the selection anyway.
 *
 * The functions here are pure over the DOM they are handed: nothing in this
 * file reads React state or writes a section. The controller does that.
 */

import { hexFromValue } from "@/lib/sections/section-edit";
import { ELEMENT_KEY_ATTR } from "@/lib/sections/section-managed-css";
import type { ElementType, SelectionAncestor } from "./selection-store";
import { applyLinkTarget } from "./link-target";

/* ── Props, per type ─────────────────────────────────────────────────────── */

export type ShadowPreset = "none" | "sm" | "md" | "lg" | "xl";

export interface CardProps {
  background: string;
  radius: string;
  shadow: ShadowPreset;
  borderWidth: string;
  borderColor: string;
  padding: string;
  margin: string;
}

export type ButtonVariant = "solid" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  /** Where it goes. Whether it opens a new tab follows from this — see `link-target.ts`. */
  href: string;
  variant: ButtonVariant;
  size: ButtonSize;
  background: string;
  textColor: string;
  radius: string;
}

export type AspectRatio = "auto" | "1 / 1" | "4 / 3" | "3 / 2" | "16 / 9" | "21 / 9";
export type ObjectFit = "cover" | "contain" | "fill";

export interface ImageProps {
  src: string;
  alt: string;
  aspectRatio: AspectRatio;
  objectFit: ObjectFit;
  radius: string;
}

export type TextAlign = "left" | "center" | "right" | "justify";

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface HeadingProps {
  level: HeadingLevel;
  color: string;
  fontSize: string;
  fontWeight: string;
  textAlign: TextAlign;
  lineHeight: string;
  letterSpacing: string;
  margin: string;
}

export interface TextProps {
  color: string;
  fontSize: string;
  fontWeight: string;
  textAlign: TextAlign;
  lineHeight: string;
  letterSpacing: string;
  margin: string;
}

export interface ContainerProps {
  display: "flex" | "grid" | "block";
  flexDirection: "row" | "column";
  gap: string;
  alignItems: string;
  justifyContent: string;
  background: string;
  radius: string;
  shadow: ShadowPreset;
  borderWidth: string;
  borderColor: string;
  padding: string;
  margin: string;
  maxWidth: string;
}

export interface GenericProps {
  background: string;
  color: string;
  radius: string;
  borderWidth: string;
  borderColor: string;
  padding: string;
  margin: string;
}

export type ElementPropsByType = {
  card: CardProps;
  button: ButtonProps;
  image: ImageProps;
  heading: HeadingProps;
  text: TextProps;
  container: ContainerProps;
  generic: GenericProps;
};

/** The types this resolver hands to the element toolbar. `section` is handled separately. */
export type LeafType = keyof ElementPropsByType;

export interface ResolvedTarget<T extends LeafType = LeafType> {
  type: T;
  element: HTMLElement;
  /** Child-index path from the section's canvas box. */
  path: string;
  /** The card the element sits in, if any — the parent context a leaf reports. */
  cardPath: string | null;
  /** The container the element sits in, if any. */
  containerPath: string | null;
}

/* ── Ids ─────────────────────────────────────────────────────────────────── */

const ID_SEPARATOR = "::";

export function elementId(sectionId: string, path: string): string {
  return `${sectionId}${ID_SEPARATOR}${path}`;
}

export function parseElementId(id: string): { sectionId: string; path: string } | null {
  const at = id.indexOf(ID_SEPARATOR);
  if (at < 0) return null;
  return { sectionId: id.slice(0, at), path: id.slice(at + ID_SEPARATOR.length) };
}

/** `0/3/1` — the index of each ancestor among its parent's element children. */
export function pathOf(element: Element, root: Element): string {
  const parts: number[] = [];
  let node: Element | null = element;
  while (node && node !== root) {
    const parent: Element | null = node.parentElement;
    if (!parent) return "";
    parts.unshift(Array.prototype.indexOf.call(parent.children, node));
    node = parent;
  }
  return node === root ? parts.join("/") : "";
}

export function resolvePath(root: Element, path: string): HTMLElement | null {
  if (path === "") return root as HTMLElement;
  let node: Element | null = root;
  for (const part of path.split("/")) {
    const index = Number(part);
    if (!Number.isInteger(index) || !node) return null;
    node = node.children[index] ?? null;
  }
  return node instanceof HTMLElement ? node : null;
}

/* ── Classification ──────────────────────────────────────────────────────── */

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

const TEXT_TAGS = new Set([
  "p", "span", "small", "strong", "em", "b", "i",
  "label", "li", "blockquote", "figcaption", "td", "th", "dt", "dd", "cite", "q", "mark", "time",
]);

const CARD_TAGS = new Set(["article", "figure"]);

const CONTAINER_CLASS_HINTS = [
  "container", "wrapper", "grid", "flex", "row", "col", "columns", "layout", "section-content"
];

const BUTTON_CLASS_HINTS = ["btn", "button", "cta", "apply", "give", "enroll", "enrol", "register"];

const isTransparent = (color: string) =>
  !color || color === "transparent" || /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)$/.test(color);

const classText = (el: Element) => (typeof el.className === "string" ? el.className : "").toLowerCase();

/** Tag- and class-level checks, kept free of `getComputedStyle` so they can be unit-tested. */
export const classify = {
  isHeadingTag(tag: string): boolean {
    return HEADING_TAGS.has(tag.toLowerCase());
  },
  isButtonLike(tag: string, cls: string, role: string | null, type: string | null): boolean {
    if (tag === "button") return true;
    if (role === "button") return true;
    if (tag === "input" && (type === "button" || type === "submit")) return true;
    return BUTTON_CLASS_HINTS.some((hint) => cls.includes(hint));
  },
  isTextTag(tag: string): boolean {
    return HEADING_TAGS.has(tag) || TEXT_TAGS.has(tag);
  },
  isParagraphOrInlineTextTag(tag: string): boolean {
    return TEXT_TAGS.has(tag);
  },
  isCardLike(tag: string, cls: string, hasDataCard: boolean): boolean {
    if (hasDataCard) return true;
    if (cls.split(/\s+/).some((c) => c.includes("card"))) return true;
    return CARD_TAGS.has(tag);
  },
  isContainerLike(tag: string, cls: string, hasDataContainer: boolean): boolean {
    if (hasDataContainer) return true;
    if (cls.split(/\s+/).some((c) => CONTAINER_CLASS_HINTS.some((hint) => c.includes(hint)))) return true;
    return tag === "div" || tag === "main" || tag === "aside";
  },
};

function isHeading(el: HTMLElement): boolean {
  return classify.isHeadingTag(el.tagName);
}

function isButton(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  if (classify.isButtonLike(tag, classText(el), el.getAttribute("role"), el.getAttribute("type"))) return true;
  if (tag !== "a") return false;
  // A styled anchor is a button in every way that matters to the person editing it.
  const style = window.getComputedStyle(el);
  const hasBg = !isTransparent(style.backgroundColor);
  const hasBorder = style.borderStyle !== "none" && parseFloat(style.borderWidth) > 0;
  const hasRadius = parseFloat(style.borderRadius) > 0;
  return hasBg || (hasBorder && hasRadius);
}

/** A text element is one whose own text nodes carry visible characters. */
function isText(el: HTMLElement): boolean {
  if (isHeading(el)) return false;
  if (!classify.isParagraphOrInlineTextTag(el.tagName.toLowerCase())) {
    // If it's a leaf element with text
    if (el.children.length === 0 && (el.textContent ?? "").trim().length > 0) return true;
    return false;
  }
  return Array.from(el.childNodes).some(
    (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim().length > 0,
  );
}

const STRUCTURAL_TAGS = new Set(["section", "header", "footer", "main", "nav"]);

/**
 * A card: a boxed container with more than one thing in it. Class hints first
 * (`card`, `data-card`, `article`); failing those, a box that looks like one —
 * a background or border plus rounded corners — holding at least two children.
 */
function isCard(el: HTMLElement, root: HTMLElement): boolean {
  if (el === root) return false;
  const tag = el.tagName.toLowerCase();
  if (STRUCTURAL_TAGS.has(tag)) return false;
  if (classify.isCardLike(tag, classText(el), el.hasAttribute("data-card"))) return true;
  if (el.children.length < 2) return false;
  const style = window.getComputedStyle(el);
  const boxed =
    !isTransparent(style.backgroundColor) ||
    (style.borderStyle !== "none" && parseFloat(style.borderWidth) > 0) ||
    style.boxShadow !== "none";
  return boxed && parseFloat(style.borderRadius) > 0;
}

function isContainer(el: HTMLElement, root: HTMLElement): boolean {
  if (el === root) return false;
  const tag = el.tagName.toLowerCase();
  if (STRUCTURAL_TAGS.has(tag)) return false;
  if (isCard(el, root)) return false;
  if (el.hasAttribute("data-container")) return true;
  const cls = classText(el);
  if (cls.includes("container") || cls.includes("grid") || cls.includes("flex") || cls.includes("col-")) {
    return true;
  }
  return el.children.length > 0 && (tag === "div" || tag === "ul" || tag === "ol");
}

function nearestCardPath(from: HTMLElement | null, root: HTMLElement): string | null {
  let node = from;
  while (node && node !== root) {
    if (isCard(node, root)) return pathOf(node, root);
    node = node.parentElement;
  }
  return null;
}

function nearestContainerPath(from: HTMLElement | null, root: HTMLElement): string | null {
  let node = from;
  while (node && node !== root) {
    if (isContainer(node, root)) return pathOf(node, root);
    node = node.parentElement;
  }
  return null;
}

const resolved = (type: LeafType, element: HTMLElement, root: HTMLElement): ResolvedTarget => ({
  type,
  element,
  path: pathOf(element, root),
  cardPath: nearestCardPath(element.parentElement, root),
  containerPath: nearestContainerPath(element.parentElement, root),
});

/**
 * Builds the chain of ancestors from the section root down to the selected element.
 */
export function getAncestorHierarchy(
  element: HTMLElement,
  root: HTMLElement,
  sectionId: string,
  sectionTitle: string,
): SelectionAncestor[] {
  const ancestors: SelectionAncestor[] = [
    {
      id: sectionId,
      type: "section",
      label: sectionTitle || "Section",
      path: "",
    },
  ];

  const stack: HTMLElement[] = [];
  let node: HTMLElement | null = element.parentElement;
  while (node && node !== root) {
    stack.unshift(node);
    node = node.parentElement;
  }

  for (const ancestor of stack) {
    const p = pathOf(ancestor, root);
    if (isCard(ancestor, root)) {
      ancestors.push({
        id: elementId(sectionId, p),
        type: "card",
        label: "Card",
        path: p,
      });
    } else if (isContainer(ancestor, root)) {
      ancestors.push({
        id: elementId(sectionId, p),
        type: "container",
        label: "Container",
        path: p,
      });
    }
  }

  return ancestors;
}

/**
 * Walks from the clicked node up to the section root and returns the innermost
 * element the toolbar has a panel for, or `null` when the click lands on the
 * section itself.
 *
 * Hierarchy order:
 * Button -> Image -> Heading -> Text -> Card -> Container -> Generic
 */
export function resolveTarget(target: HTMLElement, root: HTMLElement): ResolvedTarget | null {
  if (!root.contains(target)) return null;

  // 1. Button or interactive button-like link
  const button = target.closest<HTMLElement>(
    "button, a, [role='button'], input[type='button'], input[type='submit']",
  );
  if (button && root.contains(button) && button !== root && isButton(button)) {
    return resolved("button", button, root);
  }

  let node: HTMLElement | null = target;
  while (node && node !== root) {
    const tag = node.tagName.toLowerCase();
    if (tag !== "a" && classify.isButtonLike(tag, classText(node), node.getAttribute("role"), null)) {
      return resolved("button", node, root);
    }
    node = node.parentElement;
  }

  // 2. Image
  if (target.tagName === "IMG") return resolved("image", target, root);
  const picture = target.closest<HTMLElement>("picture, figure");
  if (picture && root.contains(picture) && picture !== root && !isCard(picture, root)) {
    const img = picture.querySelector<HTMLElement>("img");
    if (img) return resolved("image", img, root);
  }

  // 3. Heading
  const heading = target.closest<HTMLElement>("h1, h2, h3, h4, h5, h6");
  if (heading && root.contains(heading) && heading !== root) {
    return resolved("heading", heading, root);
  }

  // 4. Text or Paragraph
  node = target;
  while (node && node !== root) {
    if (isHeading(node)) return resolved("heading", node, root);
    if (isText(node)) return resolved("text", node, root);
    if (isCard(node, root)) return resolved("card", node, root);
    if (isContainer(node, root)) return resolved("container", node, root);
    node = node.parentElement;
  }

  // 5. If direct click is on an element inside root that is not root itself
  if (target !== root) {
    return resolved("generic", target, root);
  }

  return null;
}

/* ── Reading props off an element ────────────────────────────────────────── */

const SHADOW_CSS: Record<ShadowPreset, string> = {
  none: "none",
  sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
};

export const SHADOW_PRESETS: readonly ShadowPreset[] = ["none", "sm", "md", "lg", "xl"];

/** Which preset an element's shadow is closest to, read from what it renders. */
function shadowPreset(el: HTMLElement): ShadowPreset {
  const own = el.getAttribute("data-xite-shadow") as ShadowPreset | null;
  if (own && SHADOW_PRESETS.includes(own)) return own;
  const value = window.getComputedStyle(el).boxShadow;
  if (!value || value === "none") return "none";
  const lengths = Array.from(value.matchAll(/(-?[\d.]+)px/g)).map((m) => parseFloat(m[1]!));
  const blur = lengths.length ? Math.max(...lengths) : 0;
  if (blur <= 2) return "sm";
  if (blur <= 6) return "md";
  if (blur <= 15) return "lg";
  return "xl";
}

export const BUTTON_SIZE_PADDING: Record<ButtonSize, string> = {
  sm: "6px 12px",
  md: "10px 20px",
  lg: "14px 28px",
};
export const BUTTON_SIZE_FONT: Record<ButtonSize, string> = { sm: "12px", md: "14px", lg: "16px" };

function buttonSize(el: HTMLElement): ButtonSize {
  const own = el.getAttribute("data-xite-size") as ButtonSize | null;
  if (own === "sm" || own === "md" || own === "lg") return own;
  const py = parseFloat(window.getComputedStyle(el).paddingTop);
  if (py <= 7) return "sm";
  if (py <= 12) return "md";
  return "lg";
}

function buttonVariant(el: HTMLElement): ButtonVariant {
  const own = el.getAttribute("data-xite-variant") as ButtonVariant | null;
  if (own === "solid" || own === "outline" || own === "ghost") return own;
  const style = window.getComputedStyle(el);
  if (!isTransparent(style.backgroundColor)) return "solid";
  if (style.borderStyle !== "none" && parseFloat(style.borderWidth) > 0) return "outline";
  return "ghost";
}

export function readElementProps<T extends LeafType>(type: T, el: HTMLElement): ElementPropsByType[T] {
  const style = window.getComputedStyle(el);
  switch (type) {
    case "card": {
      const props: CardProps = {
        background: hexFromValue(el.style.backgroundColor || style.backgroundColor, "#ffffff"),
        radius: el.style.borderRadius || style.borderRadius || "0px",
        shadow: shadowPreset(el),
        borderWidth: el.style.borderWidth || style.borderWidth || "0px",
        borderColor: hexFromValue(el.style.borderColor || style.borderColor, "#e2e8f0"),
        padding: el.style.padding || style.padding || "0px",
        margin: el.style.margin || style.margin || "0px",
      };
      return props as ElementPropsByType[T];
    }
    case "button": {
      const props: ButtonProps = {
        href: el.getAttribute("href") ?? el.getAttribute("data-href") ?? "",
        variant: buttonVariant(el),
        size: buttonSize(el),
        background: hexFromValue(el.style.backgroundColor || style.backgroundColor, "#2563eb"),
        textColor: hexFromValue(el.style.color || style.color, "#ffffff"),
        radius: el.style.borderRadius || style.borderRadius || "8px",
      };
      return props as ElementPropsByType[T];
    }
    case "image": {
      const ratio = (el.style.aspectRatio || "auto").replace(/\s*\/\s*/, " / ") as AspectRatio;
      const props: ImageProps = {
        src: el.getAttribute("src") ?? "",
        alt: el.getAttribute("alt") ?? "",
        aspectRatio: ratio || "auto",
        objectFit: ((el.style.objectFit || style.objectFit) as ObjectFit) || "cover",
        radius: el.style.borderRadius || style.borderRadius || "0px",
      };
      return props as ElementPropsByType[T];
    }
    case "heading": {
      const level = (el.tagName.toLowerCase() as HeadingLevel) || "h2";
      const props: HeadingProps = {
        level,
        color: hexFromValue(el.style.color || style.color, "#0f172a"),
        fontSize: el.style.fontSize || style.fontSize || "24px",
        fontWeight: el.style.fontWeight || style.fontWeight || "700",
        textAlign: ((el.style.textAlign || style.textAlign) as TextAlign) || "left",
        lineHeight: el.style.lineHeight || "",
        letterSpacing: el.style.letterSpacing || "",
        margin: el.style.margin || style.margin || "0px",
      };
      return props as ElementPropsByType[T];
    }
    case "text": {
      const props: TextProps = {
        color: hexFromValue(el.style.color || style.color, "#0f172a"),
        fontSize: el.style.fontSize || style.fontSize || "16px",
        fontWeight: el.style.fontWeight || style.fontWeight || "400",
        textAlign: ((el.style.textAlign || style.textAlign) as TextAlign) || "left",
        lineHeight: el.style.lineHeight || "",
        letterSpacing: el.style.letterSpacing || "",
        margin: el.style.margin || style.margin || "0px",
      };
      return props as ElementPropsByType[T];
    }
    case "container": {
      const display = style.display.includes("grid")
        ? "grid"
        : style.display.includes("flex")
        ? "flex"
        : "block";
      const flexDirection = style.flexDirection === "row" ? "row" : "column";
      const props: ContainerProps = {
        display,
        flexDirection,
        gap: el.style.gap || style.gap || "0px",
        alignItems: el.style.alignItems || style.alignItems || "stretch",
        justifyContent: el.style.justifyContent || style.justifyContent || "flex-start",
        background: hexFromValue(el.style.backgroundColor || style.backgroundColor, "transparent"),
        radius: el.style.borderRadius || style.borderRadius || "0px",
        shadow: shadowPreset(el),
        borderWidth: el.style.borderWidth || style.borderWidth || "0px",
        borderColor: hexFromValue(el.style.borderColor || style.borderColor, "#e2e8f0"),
        padding: el.style.padding || style.padding || "0px",
        margin: el.style.margin || style.margin || "0px",
        maxWidth: el.style.maxWidth || style.maxWidth || "none",
      };
      return props as ElementPropsByType[T];
    }
    case "generic": {
      const props: GenericProps = {
        background: hexFromValue(el.style.backgroundColor || style.backgroundColor, "transparent"),
        color: hexFromValue(el.style.color || style.color, "#0f172a"),
        radius: el.style.borderRadius || style.borderRadius || "0px",
        borderWidth: el.style.borderWidth || style.borderWidth || "0px",
        borderColor: hexFromValue(el.style.borderColor || style.borderColor, "#e2e8f0"),
        padding: el.style.padding || style.padding || "0px",
        margin: el.style.margin || style.margin || "0px",
      };
      return props as ElementPropsByType[T];
    }
  }
  throw new Error(`Unknown element type: ${String(type)}`);
}

/* ── Applying props to an element ────────────────────────────────────────── */

/**
 * `!important` because a section's own stylesheet — Tailwind utilities compiled
 * by the Play CDN, or hand-written rules — would otherwise beat an inline
 * declaration that carries the same property. Every existing write path in
 * this editor does the same, for the same reason.
 */
const set = (el: HTMLElement, prop: string, value: string | null | undefined) => {
  if (value === undefined) return;
  if (value === null || value === "") el.style.removeProperty(prop);
  else el.style.setProperty(prop, value, "important");
};

/**
 * Gives an element the key the managed-CSS layer uses, if it has none. Only
 * called when a rule that *needs* a selector (hover) is about to be written,
 * so an element edited purely through inline styles carries no key.
 */
export function ensureElementKey(el: HTMLElement): string {
  const existing = el.getAttribute(ELEMENT_KEY_ATTR);
  if (existing) return existing;
  const key = `el-${Math.random().toString(36).slice(2, 8)}`;
  el.setAttribute(ELEMENT_KEY_ATTR, key);
  return key;
}

export function applyElementProps<T extends LeafType>(
  type: T,
  el: HTMLElement,
  props: Partial<ElementPropsByType[T]>,
): void {
  switch (type) {
    case "card":
      applyCard(el, props as Partial<CardProps>);
      return;
    case "button":
      applyButton(el, props as Partial<ButtonProps>);
      return;
    case "image":
      applyImage(el, props as Partial<ImageProps>);
      return;
    case "heading":
      applyHeading(el, props as Partial<HeadingProps>);
      return;
    case "text":
      applyText(el, props as Partial<TextProps>);
      return;
    case "container":
      applyContainer(el, props as Partial<ContainerProps>);
      return;
    case "generic":
      applyGeneric(el, props as Partial<GenericProps>);
      return;
  }
}

function applyCard(el: HTMLElement, p: Partial<CardProps>): void {
  set(el, "background-color", p.background);
  set(el, "border-radius", p.radius);
  if (p.shadow !== undefined) {
    set(el, "box-shadow", SHADOW_CSS[p.shadow]);
    el.setAttribute("data-xite-shadow", p.shadow);
  }
  if (p.borderWidth !== undefined || p.borderColor !== undefined) {
    const width = p.borderWidth ?? el.style.borderWidth ?? "1px";
    const color = p.borderColor ?? el.style.borderColor ?? "#e2e8f0";
    set(el, "border-width", width);
    set(el, "border-style", parseFloat(width) > 0 ? "solid" : "none");
    set(el, "border-color", color);
  }
  set(el, "padding", p.padding);
  set(el, "margin", p.margin);
}

function applyButton(el: HTMLElement, p: Partial<ButtonProps>): void {
  if (p.href !== undefined) {
    if (el.tagName === "A") el.setAttribute("href", p.href);
    else el.setAttribute("data-href", p.href);
    applyLinkTarget(el, p.href);
  }

  const variant = p.variant ?? (el.getAttribute("data-xite-variant") as ButtonVariant | null) ?? "solid";
  if (p.variant !== undefined) el.setAttribute("data-xite-variant", p.variant);

  const accent = p.background ?? (el.style.backgroundColor ? hexFromValue(el.style.backgroundColor) : undefined);
  if (p.variant !== undefined || p.background !== undefined) {
    const colour = accent ?? "#2563eb";
    if (variant === "solid") {
      set(el, "background-color", colour);
      set(el, "border", "2px solid transparent");
    } else if (variant === "outline") {
      set(el, "background-color", "transparent");
      set(el, "border", `2px solid ${colour}`);
      set(el, "color", p.textColor ?? colour);
    } else {
      set(el, "background-color", "transparent");
      set(el, "border", "2px solid transparent");
      set(el, "color", p.textColor ?? colour);
    }
  }
  set(el, "color", p.textColor);

  if (p.size !== undefined) {
    el.setAttribute("data-xite-size", p.size);
    set(el, "padding", BUTTON_SIZE_PADDING[p.size]);
    set(el, "font-size", BUTTON_SIZE_FONT[p.size]);
  }
  set(el, "border-radius", p.radius);
}

function applyImage(el: HTMLElement, p: Partial<ImageProps>): void {
  if (p.src !== undefined) {
    el.setAttribute("src", p.src);
    el.removeAttribute("srcset");
    el.closest("picture")?.querySelectorAll("source").forEach((s) => s.remove());
  }
  if (p.alt !== undefined) el.setAttribute("alt", p.alt);
  if (p.aspectRatio !== undefined) {
    set(el, "aspect-ratio", p.aspectRatio === "auto" ? null : p.aspectRatio);
    if (p.aspectRatio !== "auto") set(el, "width", "100%");
  }
  set(el, "object-fit", p.objectFit);
  set(el, "border-radius", p.radius);
}

function applyHeading(el: HTMLElement, p: Partial<HeadingProps>): void {
  set(el, "color", p.color);
  set(el, "font-size", p.fontSize);
  set(el, "font-weight", p.fontWeight);
  set(el, "text-align", p.textAlign);
  set(el, "line-height", p.lineHeight);
  set(el, "letter-spacing", p.letterSpacing);
  set(el, "margin", p.margin);
}

function applyText(el: HTMLElement, p: Partial<TextProps>): void {
  set(el, "color", p.color);
  set(el, "font-size", p.fontSize);
  set(el, "font-weight", p.fontWeight);
  set(el, "text-align", p.textAlign);
  set(el, "line-height", p.lineHeight);
  set(el, "letter-spacing", p.letterSpacing);
  set(el, "margin", p.margin);
}

function applyContainer(el: HTMLElement, p: Partial<ContainerProps>): void {
  if (p.display !== undefined) set(el, "display", p.display);
  if (p.flexDirection !== undefined) set(el, "flex-direction", p.flexDirection);
  set(el, "gap", p.gap);
  set(el, "align-items", p.alignItems);
  set(el, "justify-content", p.justifyContent);
  set(el, "background-color", p.background);
  set(el, "border-radius", p.radius);
  if (p.shadow !== undefined) {
    set(el, "box-shadow", SHADOW_CSS[p.shadow]);
    el.setAttribute("data-xite-shadow", p.shadow);
  }
  if (p.borderWidth !== undefined || p.borderColor !== undefined) {
    const width = p.borderWidth ?? el.style.borderWidth ?? "0px";
    const color = p.borderColor ?? el.style.borderColor ?? "#e2e8f0";
    set(el, "border-width", width);
    set(el, "border-style", parseFloat(width) > 0 ? "solid" : "none");
    set(el, "border-color", color);
  }
  set(el, "padding", p.padding);
  set(el, "margin", p.margin);
  set(el, "max-width", p.maxWidth);
}

function applyGeneric(el: HTMLElement, p: Partial<GenericProps>): void {
  set(el, "background-color", p.background);
  set(el, "color", p.color);
  set(el, "border-radius", p.radius);
  if (p.borderWidth !== undefined || p.borderColor !== undefined) {
    const width = p.borderWidth ?? el.style.borderWidth ?? "0px";
    const color = p.borderColor ?? el.style.borderColor ?? "#e2e8f0";
    set(el, "border-width", width);
    set(el, "border-style", parseFloat(width) > 0 ? "solid" : "none");
    set(el, "border-color", color);
  }
  set(el, "padding", p.padding);
  set(el, "margin", p.margin);
}

/* ── DOM Mutation Helpers ────────────────────────────────────────────────── */

export function duplicateElementDom(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;
  element.after(clone);
  return clone;
}

export function moveElementDom(element: HTMLElement, direction: "up" | "down"): boolean {
  if (direction === "up") {
    const prev = element.previousElementSibling;
    if (prev) {
      prev.before(element);
      return true;
    }
  } else {
    const next = element.nextElementSibling;
    if (next) {
      next.after(element);
      return true;
    }
  }
  return false;
}

export function changeHeadingTagDom(element: HTMLElement, newTag: HeadingLevel): HTMLElement {
  if (element.tagName.toLowerCase() === newTag.toLowerCase()) return element;
  const newHeading = document.createElement(newTag);
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i]!;
    newHeading.setAttribute(attr.name, attr.value);
  }
  while (element.firstChild) {
    newHeading.appendChild(element.firstChild);
  }
  element.replaceWith(newHeading);
  return newHeading;
}

export const ELEMENT_TYPE_LABEL: Record<ElementType, string> = {
  section: "Section",
  container: "Container",
  card: "Card",
  heading: "Heading",
  text: "Text",
  button: "Button",
  image: "Image",
  generic: "Element",
};
