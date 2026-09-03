/**
 * Reading and writing one section through the toolbar's controls.
 *
 * Everything in this file is a **pure function from a section to a section**.
 * Nothing here touches React state, the network, or the DOM. That is what lets
 * the whole editing surface plug into the existing architecture rather than
 * beside it: `EditorStudio` calls one of these, gets a new `code` string back,
 * and hands it to `setSectionsWithHistory` — the same call the swap button and
 * the inline text editor already make. Undo/redo, the per-page save queue, the
 * dirty flag and the autosave are therefore not features of the toolbar; they
 * are things the toolbar cannot avoid getting right, because it writes through
 * the one path that has them.
 *
 * Two consequences worth stating, because both are requirements of the brief:
 *
 *  - **No new API calls** (§22). A control change is a state mutation. It
 *    reaches the database through `useEditorPages`'s existing debounce, exactly
 *    as typing into a heading on the canvas does.
 *
 *  - **No second history** (§21). There is no undo stack here to keep in sync
 *    with the editor's, because there is no state here at all.
 */

import {
  applyEdits,
  descendants,
  getAttribute,
  outerHtml,
  parseHtml,
  removeAttributeEdit,
  setAttributeEdit,
  setTextEdit,
  textContent,
  type Edit,
  type ElementNode,
} from "./html-dom";
import {
  DEVICES,
  ELEMENT_KEY_ATTR,
  isUsableImageUrl,
  joinSectionCode,
  parseDeclarations,
  parseManagedStyles,
  pruneManagedStyles,
  resolveManagedValue,
  setManagedProperty,
  splitManagedRegion,
  splitSectionCode,
  writeManagedRegion,
  type Device,
  type ManagedStyles,
  type SectionParts,
  type Tier,
} from "./section-managed-css";
import { resolvePath, type ElementPath } from "./section-probe";
import type { Control, ControlList, ListAction } from "./section-schema";

/** The part of a section this module reads and rewrites. */
export type EditableSection = {
  title: string;
  code: string;
  category: string;
};

/** What a control writes. `null` in a field means "clear it". */
export type BoxValue = { top: string; right: string; bottom: string; left: string };
export const EMPTY_BOX: BoxValue = { top: "", right: "", bottom: "", left: "" };

export type ControlValue = string | BoxValue | readonly Device[];

export type ValueSource = "managed" | "authored" | "none";

export type ControlReading = {
  value: ControlValue;
  source: ValueSource;
  /** Which device tier a managed value actually came from. */
  from: Device | null;
};

/** The fields a control change asks the editor to write. */
export type SectionPatch = { code?: string; title?: string };

/* ── Element keys ───────────────────────────────────────────────────────── */

function existingKeys(root: ElementNode): Set<string> {
  const keys = new Set<string>();
  descendants(root).forEach((node) => {
    const key = getAttribute(node, ELEMENT_KEY_ATTR);
    if (key) keys.add(key);
  });
  return keys;
}

/**
 * Gives every named element a key, stamping the markup where one is missing.
 *
 * Returns the new body and the keys in the same order as the paths. Paths that
 * do not resolve are skipped rather than substituted — a control whose element
 * has been deleted since the panel rendered writes nothing, which is the only
 * safe answer when the alternative is styling whatever now sits at that index.
 */
function ensureKeys(
  body: string,
  paths: readonly ElementPath[],
): { body: string; keys: string[] } {
  const root = parseHtml(body);
  const taken = existingKeys(root);
  const edits: Edit[] = [];
  const keys: string[] = [];
  let counter = 1;

  const mint = () => {
    let candidate = `e${counter}`;
    while (taken.has(candidate)) {
      counter += 1;
      candidate = `e${counter}`;
    }
    taken.add(candidate);
    return candidate;
  };

  paths.forEach((path) => {
    const node = resolvePath(root, path);
    if (!node) return;
    const existing = getAttribute(node, ELEMENT_KEY_ATTR);
    if (existing) {
      keys.push(existing);
      return;
    }
    const key = mint();
    const edit = setAttributeEdit(node, ELEMENT_KEY_ATTR, key);
    if (edit) edits.push(edit);
    keys.push(key);
  });

  return { body: applyEdits(body, edits), keys };
}

/* ── Composite declarations ─────────────────────────────────────────────── */

/**
 * Colours the toolbar can turn into `rgba()`.
 *
 * An overlay is a colour *and* an opacity, and CSS has nowhere to put the
 * second except inside the first. Hex and `rgb()` cover everything the colour
 * inputs produce and everything the library is authored in; anything else — a
 * named colour, `hsl()`, a `var()` — is used as given and the opacity is
 * ignored rather than guessed at, because a wrong alpha on a full-bleed overlay
 * is the difference between a photograph and a black rectangle.
 */
export function withAlpha(color: string, alpha: number): string {
  const value = (color || "").trim();
  if (!value) return "";
  const clamped = Math.max(0, Math.min(1, alpha));

  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const digits = hex[1]!;
    const full = digits.length === 3 ? digits.split("").map((d) => d + d).join("") : digits;
    const r = Number.parseInt(full.slice(0, 2), 16);
    const g = Number.parseInt(full.slice(2, 4), 16);
    const b = Number.parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${clamped})`;
  }

  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(value);
  if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${clamped})`;

  return value;
}

/** Custom properties that are inputs to a composed declaration, not CSS to ship. */
const BACKGROUND_VARS = [
  "--x-bg-image",
  "--x-gradient",
  "--x-overlay",
  "--x-overlay-opacity",
  "--x-bg-size",
  "--x-bg-blur",
  "--x-bg-video",
  "--x-header-overlay",
] as const;
const SHADOW_VARS = [
  "--x-shadow-x", "--x-shadow-y", "--x-shadow-blur", "--x-shadow-spread",
  "--x-shadow-color", "--x-shadow-opacity",
] as const;

export const COMPOSITE_VARS: readonly string[] = [...BACKGROUND_VARS, ...SHADOW_VARS];

/**
 * Rebuilds the declarations that are made of several controls.
 *
 * Read through the cascade rather than out of this one tier: an overlay set on
 * Mobile over a background image set on Desktop has to compose *with* that
 * image, or switching to the phone view and adjusting the overlay would delete
 * the picture.
 */
function recomposeComposites(styles: ManagedStyles, key: string, tier: Tier): ManagedStyles {
  if (tier === "desktop-only" || tier === "tablet-only") return styles;
  const device = tier;
  const read = (prop: string) => resolveManagedValue(styles, key, device, prop).value;

  let next = styles;

  /* Background layers, front to back: overlay, gradient, image. */
  const layers: string[] = [];
  const overlay = read("--x-overlay");
  if (overlay) {
    const alpha = Number(read("--x-overlay-opacity") ?? "0.5");
    const tint = withAlpha(overlay, Number.isFinite(alpha) ? alpha : 0.5);
    if (tint) layers.push(`linear-gradient(${tint}, ${tint})`);
  }
  const gradient = read("--x-gradient");
  if (gradient) layers.push(gradient);
  const image = read("--x-bg-image");
  const usableImage = image && isUsableImageUrl(image) ? image : null;
  if (usableImage) layers.push(`url("${usableImage.replace(/"/g, '\\"')}")`);

  const hasLayers = layers.length > 0;
  next = setManagedProperty(next, key, device, "background-image", hasLayers ? layers.join(", ") : null);
  const customSize = read("--x-bg-size");
  next = setManagedProperty(next, key, device, "background-size", customSize || (usableImage ? "cover" : null));
  next = setManagedProperty(next, key, device, "background-position", usableImage ? "center" : null);
  next = setManagedProperty(next, key, device, "background-repeat", usableImage ? "no-repeat" : null);
  const blurValue = read("--x-bg-blur");
  next = setManagedProperty(next, key, device, "backdrop-filter", blurValue ? `blur(${blurValue})` : null);

  /* One shadow, from six inputs. */
  const shadowInputs = SHADOW_VARS.map((prop) => read(prop));
  if (shadowInputs.some((value) => Boolean(value && value.trim()))) {
    const px = (value: string | null, fallback: string) => (value && value.trim() ? value : fallback);
    const alpha = Number(read("--x-shadow-opacity") ?? "0.15");
    const color = withAlpha(read("--x-shadow-color") || "#000000", Number.isFinite(alpha) ? alpha : 0.15);
    next = setManagedProperty(
      next,
      key,
      device,
      "box-shadow",
      `${px(read("--x-shadow-x"), "0px")} ${px(read("--x-shadow-y"), "10px")} ${px(read("--x-shadow-blur"), "25px")} ${px(read("--x-shadow-spread"), "0px")} ${color}`,
    );
  }

  /* Header overlay on hero positioning */
  const headerOverlay = read("--x-header-overlay");
  if (headerOverlay === "hero") {
    next = setManagedProperty(next, key, device, "position", "absolute");
    next = setManagedProperty(next, key, device, "top", "0px");
    next = setManagedProperty(next, key, device, "left", "0px");
    next = setManagedProperty(next, key, device, "right", "0px");
    next = setManagedProperty(next, key, device, "width", "100%");
    next = setManagedProperty(next, key, device, "z-index", "50");
  } else if (headerOverlay === "none") {
    next = setManagedProperty(next, key, device, "position", null);
    next = setManagedProperty(next, key, device, "top", null);
    next = setManagedProperty(next, key, device, "left", null);
    next = setManagedProperty(next, key, device, "right", null);
    next = setManagedProperty(next, key, device, "width", null);
    next = setManagedProperty(next, key, device, "z-index", null);
  }

  return next;
}

/* ── Authored values ────────────────────────────────────────────────────── */

const BOX_SIDES = ["top", "right", "bottom", "left"] as const;

/** A CSS shorthand's four sides, in the order CSS gives them. */
function expandBox(value: string): BoxValue {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const [a, b, c, d] = parts;
  if (parts.length === 1) return { top: a!, right: a!, bottom: a!, left: a! };
  if (parts.length === 2) return { top: a!, right: b!, bottom: a!, left: b! };
  if (parts.length === 3) return { top: a!, right: b!, bottom: c!, left: b! };
  if (parts.length >= 4) return { top: a!, right: b!, bottom: c!, left: d! };
  return { ...EMPTY_BOX };
}

/**
 * What the author wrote for a property, from the element's inline style.
 *
 * Inline only, and deliberately so. The other place a value could live is the
 * section's own stylesheet, and resolving *that* needs a cascade — a selector
 * engine, specificity, the order of two Tailwind majors and the platform's
 * responsive layer. Reproducing it here would be reproducing a browser, and
 * getting it subtly wrong would show the person a number that is not what they
 * are looking at.
 *
 * So: an inline value is shown because it is unambiguous, and anything else
 * shows as empty with the control's placeholder. Setting the control then
 * writes a managed rule that wins regardless of where the old value came from,
 * which is the part that has to be right.
 */
function authoredValue(node: ElementNode, prop: string): string | null {
  const decls = parseDeclarations(getAttribute(node, "style") || "");

  if (prop === "--x-bg-image") {
    const bgImg = decls["background-image"];
    if (bgImg) {
      const match = bgImg.match(/url\(["']?([^"')]+)["']?\)/i);
      if (match && isUsableImageUrl(match[1])) return match[1];
    }
    const bg = decls.background;
    if (bg) {
      const match = bg.match(/url\(["']?([^"')]+)["']?\)/i);
      if (match && isUsableImageUrl(match[1])) return match[1];
    }
    const all = descendants(node);
    for (const child of all) {
      if (child.tag === "img") {
        const cls = (getAttribute(child, "class") || "").toLowerCase();
        const style = (getAttribute(child, "style") || "").toLowerCase();
        const src = getAttribute(child, "src") || "";
        if ((cls.includes("object-cover") || style.includes("cover") || cls.includes("w-full")) && isUsableImageUrl(src)) {
          return src;
        }
      }
    }
    return null;
  }

  if (prop.startsWith("--x-")) return null;

  const direct = decls[prop];
  if (direct) return direct;

  // `width` and `height` on an image are as often attributes as CSS.
  if ((prop === "width" || prop === "height") && node.tag === "img") {
    const attr = getAttribute(node, prop);
    if (attr) return /^\d+$/.test(attr) ? `${attr}px` : attr;
  }

  const side = BOX_SIDES.find((name) => prop === `padding-${name}` || prop === `margin-${name}`);
  if (side) {
    const shorthand = decls[prop.startsWith("padding") ? "padding" : "margin"];
    if (shorthand) return expandBox(shorthand)[side] || null;
  }

  if (prop === "background-color") {
    const background = decls.background;
    // Only when the shorthand is a bare colour. `background: url(...) center`
    // has no colour to report and guessing one would show a swatch that is not
    // on the page.
    if (background && !/url\(|gradient\(/i.test(background) && !/\s/.test(background.trim())) {
      return background.trim();
    }
  }

  if (prop === "border-width" || prop === "border-style" || prop === "border-color") {
    const border = decls.border;
    if (border) {
      const parts = border.trim().split(/\s+/);
      if (prop === "border-width") return parts.find((part) => /^[\d.]+\w*$/.test(part)) ?? null;
      if (prop === "border-style") {
        return parts.find((part) => /^(none|solid|dashed|dotted|double|groove|ridge|inset|outset)$/i.test(part)) ?? null;
      }
      return parts.find((part) => /^#|^rgb|^hsl/i.test(part)) ?? null;
    }
  }

  return null;
}

/* ── Reading ────────────────────────────────────────────────────────────── */

/** The devices a section is hidden on, as stored. */
function readHidden(styles: ManagedStyles, key: string): Device[] {
  const raw = styles[key]?.desktop?.["--x-hidden"];
  if (!raw) return [];
  return raw.split(/\s+/).filter((value): value is Device => DEVICES.includes(value as Device));
}

/**
 * The value a control should display.
 *
 * Managed first, because that is what the person set. The author's own inline
 * value second, so opening the panel on an untouched section shows the sizes
 * and colours actually on the page rather than a row of empty fields — which
 * would read as "nothing is set" for a section that is plainly styled.
 */
export function readControlValue(
  section: EditableSection,
  control: Control,
  device: Device,
): ControlReading {
  const parts = splitSectionCode(section.code);
  return readOne(section, parts, parseHtml(parts.bodyHtml), parseManagedStyles(parts.headCss), control, device);
}

/**
 * Every control's value, from one parse of the section.
 *
 * `readControlValue` is the honest single-control version and the one the tests
 * use; the panel calls this instead. A section is a string, so reading a value
 * means parsing it, and a hero has around sixty controls — sixty parses per
 * keystroke is the difference between a panel that types smoothly and one that
 * does not. §22 asks for exactly this and nothing more: no memo invalidation
 * games, just not doing the same work sixty times.
 */
export function readControlValues(
  section: EditableSection,
  controls: readonly Control[],
  device: Device,
): Map<string, ControlReading> {
  const parts = splitSectionCode(section.code);
  const root = parseHtml(parts.bodyHtml);
  const styles = parseManagedStyles(parts.headCss);
  const readings = new Map<string, ControlReading>();
  controls.forEach((control) => {
    readings.set(controlValueKey(control), readOne(section, parts, root, styles, control, device));
  });
  return readings;
}

/**
 * The identity a reading is filed under.
 *
 * A control's `id` is unique within its group but not across the panel — every
 * card in a list has a control called `title`. The target goes into the key so
 * two cards' titles are two readings rather than one shared between them.
 */
export function controlValueKey(control: Control): string {
  const target =
    control.target.kind === "elements"
      ? control.target.paths.map((path) => path.join("-")).join("/")
      : "record";
  return `${control.id}@${target}`;
}

function readOne(
  section: EditableSection,
  parts: SectionParts,
  root: ElementNode,
  styles: ManagedStyles,
  control: Control,
  device: Device,
): ControlReading {
  if (control.op.kind === "title") {
    return { value: section.title, source: "authored", from: null };
  }

  const paths = control.target.kind === "elements" ? control.target.paths : [];
  const nodes = paths.map((path) => resolvePath(root, path)).filter((node): node is ElementNode => Boolean(node));
  const node = nodes[0];
  if (!node) return { value: "", source: "none", from: null };

  const key = getAttribute(node, ELEMENT_KEY_ATTR);

  switch (control.op.kind) {
    case "text":
      return { value: textContent(parts.bodyHtml, node), source: "authored", from: null };

    case "attr":
      return { value: getAttribute(node, control.op.name) ?? "", source: "authored", from: null };

    case "hidden":
      return { value: key ? readHidden(styles, key) : [], source: key ? "managed" : "none", from: null };

    case "style": {
      const prop = control.op.prop;
      if (key) {
        const managed = resolveManagedValue(styles, key, device, prop);
        if (managed.value !== null) {
          if (prop === "--x-bg-image" && !isUsableImageUrl(managed.value)) {
            return { value: "", source: "none", from: null };
          }
          return { value: managed.value, source: "managed", from: managed.from };
        }
      }
      const authored = authoredValue(node, prop);
      if (authored !== null) {
        if (prop === "--x-bg-image" && !isUsableImageUrl(authored)) {
          return { value: "", source: "none", from: null };
        }
        return { value: authored, source: "authored", from: null };
      }
      return { value: "", source: "none", from: null };
    }

    case "box": {
      const box: BoxValue = { ...EMPTY_BOX };
      let source: ValueSource = "none";
      let from: Device | null = null;
      BOX_SIDES.forEach((side) => {
        const prop = `${(control.op as { prop: string }).prop}-${side}`;
        if (key) {
          const managed = resolveManagedValue(styles, key, device, prop);
          if (managed.value !== null) {
            box[side] = managed.value;
            source = "managed";
            from = from ?? managed.from;
            return;
          }
        }
        const authored = authoredValue(node, prop);
        if (authored !== null) {
          box[side] = authored;
          if (source === "none") source = "authored";
        }
      });
      return { value: box, source, from };
    }

    default:
      return { value: "", source: "none", from: null };
  }
}

/* ── Writing ────────────────────────────────────────────────────────────── */

function writeStyles(
  parts: SectionParts,
  paths: readonly ElementPath[],
  tier: Tier,
  props: Record<string, string | null>,
): string | null {
  /**
   * Clearing a value on an element that was never stamped changes nothing, and
   * must not stamp it.
   *
   * Without this an empty field — which is every styling field on a section
   * nobody has touched, the moment it is focused and blurred — would write
   * `data-xite-el` into the markup, and that is a change: a dirty page, an undo
   * entry, and an autosave for an edit nobody made. The inline text editor
   * learned this the same way and fixed it by committing on real input only.
   */
  if (Object.values(props).every((value) => value === null || value === "")) {
    const existing = parseHtml(parts.bodyHtml);
    const stamped = paths
      .map((path) => resolvePath(existing, path))
      .some((node) => node && getAttribute(node, ELEMENT_KEY_ATTR));
    if (!stamped) return null;
  }

  const { body, keys } = ensureKeys(parts.bodyHtml, paths);
  if (keys.length === 0) return null;

  let updatedBody = body;
  let styles = parseManagedStyles(parts.headCss);
  keys.forEach((key) => {
    Object.entries(props).forEach(([prop, value]) => {
      styles = setManagedProperty(styles, key, tier, prop, value);
    });
    if (Object.keys(props).some((prop) => COMPOSITE_VARS.includes(prop))) {
      styles = recomposeComposites(styles, key, tier);
    }
  });

  // Handle background video in markup
  if (props["--x-bg-video"] !== undefined) {
    const videoUrl = props["--x-bg-video"]?.trim() || "";
    updatedBody = updatedBody.replace(/<div\s+class=["']xite-bg-video-container["'][\s\S]*?<\/div>/gi, "");
    if (videoUrl) {
      const videoHtml = `<div class="xite-bg-video-container" style="position: absolute; inset: 0; width: 100%; height: 100%; overflow: hidden; pointer-events: none; z-index: 0;"><video src="${videoUrl}" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover;"></video><div style="position: absolute; inset: 0; background: rgba(0,0,0,0.35);"></div></div>`;
      updatedBody = updatedBody.replace(/(<(?:header|section|footer|div)[^>]*>)/i, (match) => {
        let rootTag = match;
        if (/style=["']([^"']*)["']/i.test(rootTag)) {
          rootTag = rootTag.replace(/style=["']([^"']*)["']/i, (_m, s) => {
            let ns = s;
            if (!/position\s*:/i.test(ns)) ns += ";position:relative;";
            if (!/overflow\s*:/i.test(ns)) ns += ";overflow:hidden;";
            return `style="${ns}"`;
          });
        } else {
          rootTag = rootTag.replace(/>$/, ' style="position:relative;overflow:hidden;">');
        }
        return `${rootTag}\n${videoHtml}`;
      });
    }
  } else if (props["--x-bg-image"] || props["background-color"]) {
    // Clear video container when image or colour is set
    updatedBody = updatedBody.replace(/<div\s+class=["']xite-bg-video-container["'][\s\S]*?<\/div>/gi, "");
  }

  // Handle background image in markup (both inline style and any background <img> or inner layer)
  if (props["--x-bg-image"] !== undefined) {
    const imgUrl = props["--x-bg-image"]?.trim() || "";
    if (imgUrl) {
      // 1. Update any existing url(...) in root element's style attribute
      updatedBody = updatedBody.replace(/(<(?:header|section|footer|main|div)[^>]*\s+style=(["']))([\s\S]*?)(\2)/i, (match, pre, quote, styleContent) => {
        let sc = styleContent;
        if (/background-image\s*:\s*url\([^)]+\)/i.test(sc)) {
          sc = sc.replace(/background-image\s*:\s*url\([^)]+\)/gi, `background-image: url('${imgUrl}')`);
        } else if (/url\([^)]+\)/i.test(sc)) {
          sc = sc.replace(/url\([^)]+\)/gi, `url('${imgUrl}')`);
        } else {
          sc = sc.replace(/;?\s*$/, `; background-image: url('${imgUrl}'); background-size: cover; background-position: center;`);
        }
        return `${pre}${sc}${quote}`;
      });

      // 2. Update any background <img> tag if the section uses an img element
      updatedBody = updatedBody.replace(/(<img[^>]*src=["'])[^"']+(["'][^>]*(?:object-cover|w-full|h-full|absolute|inset-0)[^>]*>)/gi, `$1${imgUrl}$2`);
      updatedBody = updatedBody.replace(/(<img[^>]*(?:object-cover|w-full|h-full|absolute|inset-0)[^>]*src=["'])[^"']+(["'][^>]*>)/gi, `$1${imgUrl}$2`);

      // 3. Update any inner container with background-image
      updatedBody = updatedBody.replace(/(style=(["'])[\s\S]*?background(?:-image)?\s*:\s*[\s\S]*?url\()[^)]+(\)[\s\S]*?\2)/gi, `$1'${imgUrl}'$3`);
    } else {
      // Cleared image
      updatedBody = updatedBody.replace(/(<(?:header|section|footer|main|div)[^>]*\s+style=(["']))([\s\S]*?)(\2)/i, (match, pre, quote, styleContent) => {
        let sc = styleContent
          .replace(/background-image\s*:\s*url\([^)]+\);?/gi, "")
          .replace(/background-size\s*:\s*[^;]+;?/gi, "")
          .replace(/background-position\s*:\s*[^;]+;?/gi, "")
          .replace(/background-repeat\s*:\s*[^;]+;?/gi, "");
        return `${pre}${sc}${quote}`;
      });
    }
  }

  // Handle background color in markup
  if (props["background-color"] !== undefined) {
    const bgColor = props["background-color"]?.trim() || "";
    if (bgColor) {
      // 1. Remove background-image and video from ManagedStyles so image won't overlay the color
      keys.forEach((key) => {
        styles = setManagedProperty(styles, key, tier, "--x-bg-image", null);
        styles = setManagedProperty(styles, key, tier, "--x-bg-video", null);
      });

      // 2. Remove video container
      updatedBody = updatedBody.replace(/<div\s+class=["']xite-bg-video-container["'][\s\S]*?<\/div>/gi, "");

      // 3. Remove any background <img> elements
      updatedBody = updatedBody.replace(/<img[^>]*?(?:(?:absolute|inset-0)[^>]*?(?:object-cover|w-full)|(?:object-cover)[^>]*?(?:absolute|inset-0)|data-xite-bg-img)[^>]*?>/gi, "");

      // 4. In root element's style, clear any background-image and apply background-color
      updatedBody = updatedBody.replace(/(<(?:header|section|footer|main|div)[^>]*\s+style=(["']))([\s\S]*?)(\2)/i, (match, pre, quote, styleContent) => {
        let sc = styleContent
          .replace(/background-image\s*:\s*[^;]+;?/gi, "")
          .replace(/background-size\s*:\s*[^;]+;?/gi, "")
          .replace(/background-position\s*:\s*[^;]+;?/gi, "")
          .replace(/background-repeat\s*:\s*[^;]+;?/gi, "");

        if (/background\s*:\s*url\([^)]+\)[^;]*;?/i.test(sc)) {
          sc = sc.replace(/background\s*:\s*url\([^)]+\)[^;]*;?/gi, `background: ${bgColor};`);
        } else if (/background-color\s*:\s*[^;]+/i.test(sc)) {
          sc = sc.replace(/background-color\s*:\s*[^;]+/gi, `background-color: ${bgColor}`);
        } else if (/background\s*:\s*#[0-9a-f]{3,8}/i.test(sc)) {
          sc = sc.replace(/background\s*:\s*#[0-9a-f]{3,8}/gi, `background: ${bgColor}`);
        } else {
          sc = sc.replace(/;?\s*$/, `; background-color: ${bgColor};`);
        }
        return `${pre}${sc}${quote}`;
      });

      // 5. In any inner containers, remove background-image
      updatedBody = updatedBody.replace(/(style=(["'])[\s\S]*?)background(?:-image)?\s*:\s*url\([^)]+\)[^;]*;?([\s\S]*?\2)/gi, `$1$3`);
    }
  }

  return joinSectionCode({
    ...parts,
    headCss: writeManagedRegion(parts.headCss, styles),
    bodyHtml: updatedBody,
  });
}

/**
 * Which devices the section is hidden on, written as three exclusive queries.
 *
 * See `Tier` for why hiding cannot use the cascading tiers. The chosen set is
 * also stored as `--x-hidden` so the toggles can be shown in the state the
 * person left them in — reading it back out of three media queries would work
 * but would break the moment anyone hand-edited the stylesheet.
 */
function writeHidden(parts: SectionParts, paths: readonly ElementPath[], hidden: readonly Device[]): string | null {
  const { body, keys } = ensureKeys(parts.bodyHtml, paths);
  if (keys.length === 0) return null;

  const set = new Set(hidden);
  let styles = parseManagedStyles(parts.headCss);

  keys.forEach((key) => {
    styles = setManagedProperty(styles, key, "desktop-only", "display", set.has("desktop") ? "none" : null);
    styles = setManagedProperty(styles, key, "tablet-only", "display", set.has("tablet") ? "none" : null);
    styles = setManagedProperty(styles, key, "mobile", "display", set.has("mobile") ? "none" : null);
    styles = setManagedProperty(
      styles,
      key,
      "desktop",
      "--x-hidden",
      set.size > 0 ? DEVICES.filter((device) => set.has(device)).join(" ") : null,
    );
  });

  return joinSectionCode({
    ...parts,
    headCss: writeManagedRegion(parts.headCss, styles),
    bodyHtml: body,
  });
}

/**
 * One control change, as a patch to the section.
 *
 * Returns `null` when nothing would change — an unresolvable path, or a value
 * identical to the current one. The caller uses that to skip the state write
 * entirely, which is what keeps a control that is merely *focused* from pushing
 * an undo entry and starting an autosave.
 */
export function applyControl(
  section: EditableSection,
  control: Control,
  device: Device,
  value: ControlValue,
): SectionPatch | null {
  if (control.op.kind === "title") {
    const title = String(value).trim();
    if (!title || title === section.title) return null;
    return { title };
  }

  const parts = splitSectionCode(section.code);
  const paths = control.target.kind === "elements" ? control.target.paths : [];
  if (paths.length === 0) return null;

  const root = parseHtml(parts.bodyHtml);

  switch (control.op.kind) {
    case "text": {
      const text = String(value);
      const edits: Edit[] = [];
      paths.forEach((path) => {
        const node = resolvePath(root, path);
        if (!node) return;
        if (textContent(parts.bodyHtml, node) === text.replace(/\s+/g, " ").trim()) return;
        edits.push(setTextEdit(node, text));
      });
      if (edits.length === 0) return null;
      return { code: joinSectionCode({ ...parts, bodyHtml: applyEdits(parts.bodyHtml, edits) }) };
    }

    case "attr": {
      const name = control.op.name;
      const next = String(value);
      const edits: Edit[] = [];
      paths.forEach((path) => {
        const node = resolvePath(root, path);
        if (!node) return;
        const current = getAttribute(node, name) ?? "";
        if (current === next) return;
        const edit = next ? setAttributeEdit(node, name, next) : removeAttributeEdit(node, name);
        if (edit) edits.push(edit);
      });
      if (edits.length === 0) return null;
      return { code: joinSectionCode({ ...parts, bodyHtml: applyEdits(parts.bodyHtml, edits) }) };
    }

    case "style": {
      const next = String(value).trim();
      const code = writeStyles(parts, paths, device, { [control.op.prop]: next || null });
      return code && code !== section.code ? { code } : null;
    }

    case "box": {
      const box = value as BoxValue;
      const props: Record<string, string | null> = {};
      BOX_SIDES.forEach((side) => {
        props[`${(control.op as { prop: string }).prop}-${side}`] = (box?.[side] ?? "").trim() || null;
      });
      const code = writeStyles(parts, paths, device, props);
      return code && code !== section.code ? { code } : null;
    }

    case "hidden": {
      const code = writeHidden(parts, paths, value as readonly Device[]);
      return code && code !== section.code ? { code } : null;
    }

    default:
      return null;
  }
}

/* ── Lists ──────────────────────────────────────────────────────────────── */

/**
 * Add, duplicate, delete or reorder one item of a repeated structure.
 *
 * "Add" clones the last item rather than instantiating a template, because
 * there is no template to instantiate: a card in this platform is markup an
 * administrator authored, and the only thing that is certainly the right shape
 * for a new card is an existing one. Cloning also carries the item's
 * `data-xite-el`, so a new card arrives already wearing the styling the others
 * have — which is what a person adding a sixth card expects to see.
 */
export function applyListAction(
  section: EditableSection,
  list: ControlList,
  index: number,
  action: ListAction,
): SectionPatch | null {
  const parts = splitSectionCode(section.code);
  const root = parseHtml(parts.bodyHtml);

  const nodes = list.items
    .map((item) => resolvePath(root, item.path))
    .filter((node): node is ElementNode => Boolean(node));
  if (nodes.length !== list.items.length) return null;

  const target = nodes[index];
  if (!target && action !== "add") return null;

  let body: string;

  switch (action) {
    case "add": {
      const last = nodes[nodes.length - 1];
      if (!last) return null;
      body = insertClone(parts.bodyHtml, last, last);
      break;
    }
    case "duplicate":
      body = insertClone(parts.bodyHtml, target!, target!);
      break;
    case "delete": {
      // The last one cannot go: an empty list has nothing to clone from, so
      // deleting it would make the structure unrecoverable from the panel.
      if (nodes.length <= 1) return null;
      body = applyEdits(parts.bodyHtml, [removeWithLeadingSpace(parts.bodyHtml, target!)]);
      break;
    }
    case "moveUp":
    case "moveDown": {
      const otherIndex = action === "moveUp" ? index - 1 : index + 1;
      const other = nodes[otherIndex];
      if (!other) return null;
      const first = target!.start < other.start ? target! : other;
      const second = first === target! ? other : target!;
      body = applyEdits(parts.bodyHtml, [
        { start: first.start, end: first.end, text: outerHtml(parts.bodyHtml, second) },
        { start: second.start, end: second.end, text: outerHtml(parts.bodyHtml, first) },
      ]);
      break;
    }
    default:
      return null;
  }

  const headCss = pruneOrphanStyles(parts.headCss, body);
  const code = joinSectionCode({ ...parts, headCss, bodyHtml: body });
  return code === section.code ? null : { code };
}

function insertClone(source: string, after: ElementNode, template: ElementNode): string {
  const markup = outerHtml(source, template);
  const lineStart = source.lastIndexOf("\n", after.start - 1) + 1;
  const run = source.slice(lineStart, after.start);
  const indent = /^\s*$/.test(run) ? run : "";
  return applyEdits(source, [{ start: after.end, end: after.end, text: `\n${indent}${markup}` }]);
}

function removeWithLeadingSpace(source: string, node: ElementNode): Edit {
  let start = node.start;
  while (start > 0 && /\s/.test(source[start - 1]!)) start -= 1;
  return { start, end: node.end, text: "" };
}

/** Managed rules for elements the markup no longer has. */
function pruneOrphanStyles(headCss: string, body: string): string {
  const styles = parseManagedStyles(headCss);
  if (Object.keys(styles).length === 0) return headCss;
  const live = existingKeys(parseHtml(body));
  const pruned = pruneManagedStyles(styles, live);
  return pruned === styles ? headCss : writeManagedRegion(headCss, pruned);
}

/* ── Whole-section operations ───────────────────────────────────────────── */

/**
 * Everything the toolbar has done to this section, undone.
 *
 * The managed region goes and so do the stamps, which leaves exactly the markup
 * and the stylesheet the section arrived with — for styling. Content edits are
 * not reversible this way and this does not claim to reverse them: text typed
 * into a heading replaced the heading, and the only thing that can put it back
 * is undo, which this goes through like every other change.
 */
export function resetSectionStyling(section: EditableSection): SectionPatch | null {
  const parts = splitSectionCode(section.code);
  const { authored } = splitManagedRegion(parts.headCss);
  const root = parseHtml(parts.bodyHtml);

  const edits: Edit[] = [];
  descendants(root).forEach((node) => {
    if (!getAttribute(node, ELEMENT_KEY_ATTR)) return;
    const edit = removeAttributeEdit(node, ELEMENT_KEY_ATTR);
    if (edit) edits.push(edit);
  });

  const code = joinSectionCode({
    ...parts,
    headCss: authored.replace(/\s+$/, ""),
    bodyHtml: applyEdits(parts.bodyHtml, edits),
  });
  return code === section.code ? null : { code };
}

/** Whether this section carries any toolbar-authored styling. */
export function hasManagedStyling(code: string): boolean {
  const { headCss } = splitSectionCode(code);
  return Object.keys(parseManagedStyles(headCss)).length > 0;
}

/* ── Formatting helpers for the UI ──────────────────────────────────────── */

/** A number typed into a length control, turned into a CSS value. */
export function formatNumberValue(raw: string, unit: string | undefined): string {
  const text = raw.trim();
  if (!text) return "";
  // Anything that is not a bare number is passed through, so somebody can type
  // `clamp(2rem, 4vw, 4rem)` into a size field and have it work.
  if (!/^-?[\d.]+$/.test(text)) return text;
  return unit ? `${text}${unit}` : text;
}

/** The leading number of a CSS length, for a number input. */
export function numberFromValue(value: string): string {
  const match = /^(-?[\d.]+)/.exec((value || "").trim());
  return match ? match[1]! : "";
}

/** A colour input needs `#rrggbb`; this is the closest honest approximation. */
export function hexFromValue(value: string, fallback = "#000000"): string {
  const text = (value || "").trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const digits = hex[1]!;
    return digits.length === 3 ? `#${digits.split("").map((d) => d + d).join("")}` : `#${digits}`;
  }
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(text);
  if (rgb) {
    const channel = (part: string) =>
      Math.max(0, Math.min(255, Math.round(Number(part)))).toString(16).padStart(2, "0");
    return `#${channel(rgb[1]!)}${channel(rgb[2]!)}${channel(rgb[3]!)}`;
  }
  return fallback;
}

/**
 * Checks whether a section is configured to overlay the hero section below it.
 */
export function isHeaderOverlaid(section: { code?: string; title?: string } | null | undefined): boolean {
  if (!section || !section.code) return false;
  return (
    section.code.includes("--x-header-overlay:hero") ||
    section.code.includes("--x-header-overlay: hero")
  );
}

/**
 * Toggles or sets the header overlay mode on a header/navbar section.
 * When enabled, the header is positioned transparently on top of the hero section below it.
 */
export function toggleHeaderOverlay<T extends EditableSection>(
  section: T,
  enable?: boolean,
): T {
  const current = isHeaderOverlaid(section);
  const nextState = enable !== undefined ? enable : !current;
  if (nextState === current) return section;

  const parts = splitSectionCode(section.code);
  const rootTarget: ElementPath = [0];
  const { body, keys } = ensureKeys(parts.bodyHtml, [rootTarget]);
  let styles = parseManagedStyles(parts.headCss);
  const rootKey = keys[0] || Object.keys(styles)[0] || "e1";

  if (nextState) {
    styles = setManagedProperty(styles, rootKey, "desktop", "--x-header-overlay", "hero");
    styles = setManagedProperty(styles, rootKey, "desktop", "position", "absolute");
    styles = setManagedProperty(styles, rootKey, "desktop", "top", "0px");
    styles = setManagedProperty(styles, rootKey, "desktop", "left", "0px");
    styles = setManagedProperty(styles, rootKey, "desktop", "right", "0px");
    styles = setManagedProperty(styles, rootKey, "desktop", "width", "100%");
    styles = setManagedProperty(styles, rootKey, "desktop", "z-index", "50");
  } else {
    const targetKeys = new Set([rootKey, ...Object.keys(styles)]);
    targetKeys.forEach((k) => {
      styles = setManagedProperty(styles, k, "desktop", "--x-header-overlay", null);
      styles = setManagedProperty(styles, k, "desktop", "position", null);
      styles = setManagedProperty(styles, k, "desktop", "top", null);
      styles = setManagedProperty(styles, k, "desktop", "left", null);
      styles = setManagedProperty(styles, k, "desktop", "right", null);
      styles = setManagedProperty(styles, k, "desktop", "width", null);
      styles = setManagedProperty(styles, k, "desktop", "z-index", null);
    });
  }

  const nextCode = joinSectionCode({
    ...parts,
    headCss: writeManagedRegion(parts.headCss, styles),
    bodyHtml: body,
  });

  return {
    ...section,
    code: nextCode,
  };
}

