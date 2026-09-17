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
import { calculateOppositeContrast } from "@/lib/editor-themes";
import type { ElementType, SelectionAncestor } from "./selection-store";
import { applyLinkTarget } from "./link-target";

/* ── Props, per type ─────────────────────────────────────────────────────── */

export type ShadowPreset = "none" | "sm" | "md" | "lg" | "xl";
export type CardLayout = "vertical" | "horizontal-left" | "horizontal-right";
export type CardMediaWidth = "compact" | "1/4" | "1/3" | "1/2";
export type CardAlign = "start" | "center" | "end";

export interface CardProps {
  background: string;
  radius: string;
  shadow: ShadowPreset;
  borderWidth: string;
  borderColor: string;
  padding: string;
  margin: string;
  hasMedia?: boolean;
  mediaType?: "image" | "video" | "youtube" | null;
  mediaSrc?: string;
  mediaPath?: string | null;
  layout?: CardLayout;
  mediaWidth?: CardMediaWidth;
  align?: CardAlign;
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
  text?: string;
  newTab?: boolean;
}

export type AspectRatio = "auto" | "1 / 1" | "4 / 3" | "3 / 2" | "16 / 9" | "21 / 9";
export type ObjectFit = "cover" | "contain" | "fill";

export interface ImageProps {
  src: string;
  alt: string;
  aspectRatio: AspectRatio;
  objectFit: ObjectFit;
  radius: string;
  borderWidth?: string;
  borderColor?: string;
  shadow?: ShadowPreset;
  href?: string;
  width?: string;
  height?: string;
  padding?: string;
  opacity?: string;
}

export interface VideoProps {
  src: string;
  poster?: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  playsInline: boolean;
  aspectRatio: AspectRatio;
  objectFit: ObjectFit;
  radius: string;
  borderWidth?: string;
  borderColor?: string;
  shadow?: ShadowPreset;
  width?: string;
  height?: string;
  padding?: string;
}

export interface YouTubeProps {
  url: string;
  videoId: string;
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
  aspectRatio: AspectRatio;
  radius: string;
  borderWidth?: string;
  borderColor?: string;
  shadow?: ShadowPreset;
  width?: string;
  height?: string;
}

export interface IconProps {
  iconName: string;
  color: string;
  size: string;
  strokeWidth: string;
  background: string;
  radius: string;
  padding: string;
  href?: string;
}

export interface LogoProps {
  src: string;
  text: string;
  size: string;
  color: string;
  background: string;
  radius: string;
  padding: string;
  href: string;
  alt: string;
}

export interface PlusProps {
  placeholderText: string;
  actionType: string;
}

export type TextAlign = "left" | "center" | "right" | "justify";
export type TextTransform = "none" | "uppercase" | "capitalize" | "lowercase";

export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface HeadingProps {
  level: HeadingLevel;
  color: string;
  fontSize: string;
  fontWeight: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign: TextAlign;
  lineHeight: string;
  letterSpacing: string;
  margin: string;
  fontFamily?: string;
  textTransform?: TextTransform;
}

export interface TextProps {
  color: string;
  fontSize: string;
  fontWeight: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign: TextAlign;
  lineHeight: string;
  letterSpacing: string;
  margin: string;
  fontFamily?: string;
  textTransform?: TextTransform;
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
  video: VideoProps;
  youtube: YouTubeProps;
  icon: IconProps;
  logo: LogoProps;
  plus: PlusProps;
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

export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

export function buildYouTubeEmbedUrl(
  videoId: string,
  options: { autoplay?: boolean; muted?: boolean; loop?: boolean; controls?: boolean } = {},
): string {
  const params = new URLSearchParams({
    enablejsapi: "1",
    rel: "0",
  });
  if (options.autoplay) params.set("autoplay", "1");
  if (options.muted) params.set("mute", "1");
  if (options.loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }
  if (options.controls === false) params.set("controls", "0");
  else params.set("controls", "1");
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

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
  isYouTubeLike(tag: string, src: string, cls: string, hasDataYt: boolean): boolean {
    if (hasDataYt) return true;
    if (tag === "iframe" && (src.includes("youtube.com") || src.includes("youtu.be"))) return true;
    return cls.includes("youtube") || cls.includes("yt-embed");
  },
  isVideoLike(tag: string, cls: string, hasDataVideo: boolean): boolean {
    if (hasDataVideo || tag === "video") return true;
    return cls.includes("video-container") || cls.includes("video-wrapper");
  },
  isLogoLike(tag: string, cls: string, hasDataLogo: boolean, alt: string = ""): boolean {
    if (hasDataLogo) return true;
    if (cls.includes("logo") || cls.includes("brand")) return true;
    return alt.toLowerCase().includes("logo");
  },
  isPlusLike(tag: string, cls: string, hasDataPlus: boolean, text: string = ""): boolean {
    if (hasDataPlus) return true;
    if (cls.includes("plus") || cls.includes("add-media") || cls.includes("add-placeholder")) return true;
    const trimmed = text.trim();
    return trimmed === "+" || trimmed === "＋" || trimmed === "Add Image" || trimmed === "Add Video";
  },
  isIconLike(tag: string, cls: string, hasDataIcon: boolean): boolean {
    if (hasDataIcon || tag === "svg") return true;
    return cls.includes("lucide") || cls.includes("tabler") || cls.includes("fa-") || (tag === "i" && cls.includes("icon"));
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

function isText(el: HTMLElement): boolean {
  if (isHeading(el)) return false;
  if (!classify.isParagraphOrInlineTextTag(el.tagName.toLowerCase())) {
    if (el.children.length === 0 && (el.textContent ?? "").trim().length > 0) return true;
    return false;
  }
  return Array.from(el.childNodes).some(
    (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim().length > 0,
  );
}

const STRUCTURAL_TAGS = new Set(["section", "header", "footer", "main", "nav"]);

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

function hasBackgroundImage(el: HTMLElement): boolean {
  if (el.style && el.style.backgroundImage && el.style.backgroundImage !== "none") return true;
  const computed = typeof window !== "undefined" && window.getComputedStyle ? window.getComputedStyle(el).backgroundImage : "";
  return Boolean(computed) && computed !== "none" && computed.includes("url(");
}

export function findImageElement(target: HTMLElement, root: HTMLElement): HTMLElement | null {
  if (target === root) return null;

  // Case 1: Direct <img> element
  if (target.tagName === "IMG") {
    return target;
  }

  // Case 2: Explicit image element: [data-xite-image], [data-image], [data-element-type="image"]
  const explicitImage = target.closest<HTMLElement>("[data-xite-image], [data-image], [data-element-type='image']");
  if (explicitImage && root.contains(explicitImage) && explicitImage !== root) {
    const img = explicitImage.tagName === "IMG" ? explicitImage : explicitImage.querySelector<HTMLElement>("img");
    return img || explicitImage;
  }

  // Case 3: <picture> or <figure> containing an <img> (unless classified as a card)
  const picture = target.closest<HTMLElement>("picture, figure");
  if (picture && root.contains(picture) && picture !== root && !isCard(picture, root)) {
    const img = picture.querySelector<HTMLElement>("img");
    if (img) return img;
  }

  // Case 4: Clicked an overlay, badge, gradient, or sibling sitting directly in front of an <img>
  const parent = target.parentElement;
  if (parent && parent !== root) {
    const siblingImg = parent.querySelector<HTMLElement>(":scope > img, :scope > picture > img");
    if (siblingImg) {
      const cls = classText(target);
      const parentCls = classText(parent);
      const style = typeof window !== "undefined" && window.getComputedStyle ? window.getComputedStyle(target) : ({} as CSSStyleDeclaration);
      const isOverlay =
        style.position === "absolute" ||
        cls.includes("overlay") ||
        cls.includes("backdrop") ||
        cls.includes("mask") ||
        cls.includes("gradient") ||
        cls.includes("tint") ||
        cls.includes("inset") ||
        parentCls.includes("image") ||
        parentCls.includes("img") ||
        parentCls.includes("media") ||
        parentCls.includes("photo") ||
        parentCls.includes("aspect") ||
        parentCls.includes("thumb") ||
        parent.hasAttribute("data-xite-image") ||
        parent.hasAttribute("data-image");

      const hasText = (target.textContent ?? "").trim().length > 0;
      if (isOverlay) {
        return siblingImg;
      }
      if (!isCard(parent, root) && !hasText && target.children.length === 0) {
        return siblingImg;
      }
    }
  }

  // Case 5: Image wrapper classes (.image-wrapper, .img-wrapper, .media-image, .photo-box, etc.)
  const imageWrapper = target.closest<HTMLElement>(
    ".image-wrapper, .img-wrapper, .media-image, .image-container, .img-container, .photo-wrapper, .image-box, .media-box, .photo-frame"
  );
  if (imageWrapper && root.contains(imageWrapper) && imageWrapper !== root && !isCard(imageWrapper, root)) {
    const img = imageWrapper.querySelector<HTMLElement>("img");
    if (img) return img;
  }

  // Case 6: Target itself is a wrapper div containing an <img> as its sole visual content
  if (target !== root && !isCard(target, root)) {
    const directImg = target.querySelector<HTMLElement>(":scope > img, :scope > picture > img");
    if (directImg) {
      const hasHeading = target.querySelector("h1, h2, h3, h4, h5, h6") !== null;
      const hasParagraph = target.querySelector("p, blockquote") !== null;
      const hasButton = target.querySelector("button, a:not(:has(img))") !== null;
      if (!hasHeading && !hasParagraph && !hasButton) {
        return directImg;
      }
    }
  }

  // Case 7: Anchor tag wrapping ONLY an image: <a href="..."><img .../></a>
  const anchor = target.closest<HTMLElement>("a");
  if (anchor && root.contains(anchor) && anchor !== root) {
    const imgInside = anchor.querySelector<HTMLElement>(":scope > img, :scope > picture > img");
    const hasText = (anchor.textContent ?? "").trim().length > 0;
    if (imgInside && !hasText) {
      return imgInside;
    }
  }

  // Case 8: Element with a CSS background-image acting as a visual photo/banner (no text)
  if (target !== root && hasBackgroundImage(target) && (target.textContent ?? "").trim().length === 0 && target.children.length <= 1) {
    return target;
  }

  return null;
}

export function findYouTubeElement(target: HTMLElement, root: HTMLElement): HTMLElement | null {
  if (target === root) return null;
  const ytIframe = target.closest<HTMLElement>("iframe[src*='youtube'], iframe[src*='youtu.be']");
  if (ytIframe && root.contains(ytIframe) && ytIframe !== root) {
    const wrapper = ytIframe.closest<HTMLElement>("[data-xite-youtube], [data-youtube], .youtube-wrapper, .video-wrapper");
    return wrapper && root.contains(wrapper) && wrapper !== root ? wrapper : ytIframe;
  }
  const ytWrapper = target.closest<HTMLElement>("[data-xite-youtube], [data-youtube], [data-youtube-id]");
  if (ytWrapper && root.contains(ytWrapper) && ytWrapper !== root) {
    return ytWrapper;
  }
  const parent = target.parentElement;
  if (parent && parent !== root) {
    const siblingIframe = parent.querySelector<HTMLElement>("iframe[src*='youtube'], iframe[src*='youtu.be']");
    if (siblingIframe) return parent;
  }
  return null;
}

export function findVideoElement(target: HTMLElement, root: HTMLElement): HTMLElement | null {
  if (target === root) return null;
  const videoEl = target.closest<HTMLElement>("video, [data-xite-video], [data-video]");
  if (videoEl && root.contains(videoEl) && videoEl !== root) {
    return videoEl;
  }
  const parent = target.parentElement;
  if (parent && parent !== root) {
    const siblingVideo = parent.querySelector<HTMLElement>("video");
    if (siblingVideo) return siblingVideo;
  }
  return null;
}

function isContainer(el: HTMLElement, root: HTMLElement): boolean {
  if (el === root) return false;
  const tag = el.tagName.toLowerCase();
  if (STRUCTURAL_TAGS.has(tag)) return false;
  if (isCard(el, root)) return false;

  // Never treat an image, video, or youtube frame/wrapper as a generic container
  if (findImageElement(el, root) !== null) return false;
  if (findYouTubeElement(el, root) !== null || findVideoElement(el, root) !== null) return false;

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
 * YouTube -> Video -> Plus -> Logo -> Icon -> Image -> Button -> Heading -> Text -> Card -> Container -> Generic
 */
export function resolveTarget(target: HTMLElement, root: HTMLElement): ResolvedTarget | null {
  if (!root.contains(target)) return null;

  // 1. YouTube video
  const ytElement = findYouTubeElement(target, root);
  if (ytElement && root.contains(ytElement) && ytElement !== root) {
    return resolved("youtube", ytElement, root);
  }

  // 2. Video element
  const videoElement = findVideoElement(target, root);
  if (videoElement && root.contains(videoElement) && videoElement !== root) {
    return resolved("video", videoElement, root);
  }

  // 3. Plus Icon / Add Media Placeholder
  const plusEl = target.closest<HTMLElement>("[data-xite-plus], [data-plus], [data-add-media], .add-placeholder, .plus-placeholder");
  if (plusEl && root.contains(plusEl) && plusEl !== root) {
    return resolved("plus", plusEl, root);
  }

  // 4. Logo element (explicit logo flag, class with logo, or logo img)
  const logoEl = target.closest<HTMLElement>("[data-xite-logo], [data-logo='true'], .logo, [class*='-logo'], [class*='logo-']");
  if (logoEl && root.contains(logoEl) && logoEl !== root) {
    return resolved("logo", logoEl, root);
  }

  // 5. Icon (<svg>, [data-icon], or icon container)
  const svgEl = target.closest<HTMLElement>("svg, [data-xite-icon], [data-icon], i[class*='icon'], i[class*='fa-'], i[class*='lucide-']");
  if (svgEl && root.contains(svgEl) && svgEl !== root) {
    return resolved("icon", svgEl, root);
  }

  // 6. Image & Image Wrappers / Overlays
  const imageElement = findImageElement(target, root);
  if (imageElement && root.contains(imageElement) && imageElement !== root) {
    if (classify.isLogoLike(imageElement.tagName, classText(imageElement), imageElement.hasAttribute("data-logo"), imageElement.getAttribute("alt") ?? "")) {
      return resolved("logo", imageElement, root);
    }
    return resolved("image", imageElement, root);
  }

  // 7. Button or interactive button-like link
  const button = target.closest<HTMLElement>(
    "button, a, [role='button'], input[type='button'], input[type='submit']",
  );
  if (button && root.contains(button) && button !== root) {
    if (classify.isLogoLike(button.tagName, classText(button), button.hasAttribute("data-logo"), "")) {
      return resolved("logo", button, root);
    }
    if (classify.isPlusLike(button.tagName, classText(button), button.hasAttribute("data-plus"), button.textContent || "")) {
      return resolved("plus", button, root);
    }
    if (isButton(button)) {
      return resolved("button", button, root);
    }
  }

  let node: HTMLElement | null = target;
  while (node && node !== root) {
    const tag = node.tagName.toLowerCase();
    if (tag !== "a" && classify.isButtonLike(tag, classText(node), node.getAttribute("role"), null)) {
      return resolved("button", node, root);
    }
    node = node.parentElement;
  }

  // 8. Heading
  const heading = target.closest<HTMLElement>("h1, h2, h3, h4, h5, h6");
  if (heading && root.contains(heading) && heading !== root) {
    return resolved("heading", heading, root);
  }

  // 9. Text or Paragraph / Card / Container
  node = target;
  while (node && node !== root) {
    if (isHeading(node)) return resolved("heading", node, root);
    if (isText(node)) return resolved("text", node, root);
    if (isCard(node, root)) return resolved("card", node, root);
    if (isContainer(node, root)) return resolved("container", node, root);
    node = node.parentElement;
  }

  // 10. Fallback: generic element inside root
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

export function getEffectiveElementBackground(el: HTMLElement | null): string {
  let curr = el;
  while (curr && curr !== document.body && curr !== document.documentElement) {
    const bg = curr.style.backgroundColor || (typeof window !== "undefined" ? window.getComputedStyle(curr).backgroundColor : "");
    if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
      const hex = hexFromValue(bg, "");
      if (hex) return hex;
    }
    curr = curr.parentElement;
  }
  return "#ffffff";
}

export function findCardMediaElement(card: HTMLElement): HTMLElement | null {
  const yt = card.querySelector<HTMLElement>(
    "iframe[src*='youtube'], iframe[src*='youtu.be'], [data-xite-youtube], [data-youtube], .youtube-wrapper",
  );
  if (yt) return yt;
  const vid = card.querySelector<HTMLElement>("video, [data-xite-video], [data-video]");
  if (vid) return vid;
  const img = card.querySelector<HTMLElement>("img, [data-xite-image], [data-image]");
  if (img) return img;
  return null;
}

export function readElementProps<T extends LeafType>(type: T, el: HTMLElement): ElementPropsByType[T] {
  const style = window.getComputedStyle(el);
  switch (type) {
    case "card": {
      const mediaEl = findCardMediaElement(el);
      let mediaType: "image" | "video" | "youtube" | null = null;
      let mediaSrc = "";
      if (mediaEl) {
        if (
          mediaEl.tagName === "IFRAME" ||
          mediaEl.hasAttribute("data-xite-youtube") ||
          (mediaEl.getAttribute("src") ?? "").includes("youtube")
        ) {
          mediaType = "youtube";
          mediaSrc = mediaEl.getAttribute("src") ?? "";
        } else if (mediaEl.tagName === "VIDEO" || mediaEl.hasAttribute("data-xite-video")) {
          mediaType = "video";
          mediaSrc = mediaEl.getAttribute("src") ?? (mediaEl.querySelector("source")?.getAttribute("src") ?? "");
        } else {
          mediaType = "image";
          mediaSrc = mediaEl.getAttribute("src") ?? "";
        }
      }
      const cls = classText(el);
      const isRow =
        cls.includes("flex-row") ||
        (cls.includes("flex") && !cls.includes("flex-col") && !cls.includes("flex-col-reverse")) ||
        (style.display === "flex" &&
          (style.flexDirection.includes("row") || !style.flexDirection.includes("column")));
      const isRowReverse =
        cls.includes("flex-row-reverse") ||
        (style.display === "flex" && style.flexDirection.includes("row-reverse"));

      let layout: CardLayout = "vertical";
      if (isRowReverse) {
        layout = "horizontal-right";
      } else if (isRow) {
        layout = "horizontal-left";
      }

      let mediaWidth: CardMediaWidth = "1/3";
      if (mediaEl) {
        const mediaWrapper =
          mediaEl.closest<HTMLElement>(".card-media, .image-wrapper, .media-slot") || mediaEl;
        const mediaCls = classText(mediaWrapper);
        if (mediaCls.includes("w-1/4") || mediaCls.includes("sm:w-1/4") || mediaCls.includes("25%")) {
          mediaWidth = "1/4";
        } else if (mediaCls.includes("w-1/2") || mediaCls.includes("sm:w-1/2") || mediaCls.includes("50%")) {
          mediaWidth = "1/2";
        } else if (
          mediaCls.includes("130px") ||
          mediaCls.includes("120px") ||
          mediaCls.includes("140px") ||
          mediaCls.includes("w-28") ||
          mediaCls.includes("w-32")
        ) {
          mediaWidth = "compact";
        }
      }

      let align: CardAlign = "center";
      if (cls.includes("items-start") || (style.alignItems && style.alignItems.includes("start"))) {
        align = "start";
      } else if (cls.includes("items-end") || (style.alignItems && style.alignItems.includes("end"))) {
        align = "end";
      }

      const props: CardProps = {
        background: hexFromValue(el.style.backgroundColor || style.backgroundColor, "#ffffff"),
        radius: el.style.borderRadius || style.borderRadius || "0px",
        shadow: shadowPreset(el),
        borderWidth: el.style.borderWidth || style.borderWidth || "0px",
        borderColor: hexFromValue(el.style.borderColor || style.borderColor, "#e2e8f0"),
        padding: el.style.padding || style.padding || "0px",
        margin: el.style.margin || style.margin || "0px",
        hasMedia: Boolean(mediaEl),
        mediaType,
        mediaSrc,
        layout,
        mediaWidth,
        align,
      };
      return props as ElementPropsByType[T];
    }
    case "button": {
      const targetAttr = el.getAttribute("target");
      const props: ButtonProps = {
        href: el.getAttribute("href") ?? el.getAttribute("data-href") ?? "",
        variant: buttonVariant(el),
        size: buttonSize(el),
        background: hexFromValue(el.style.backgroundColor || style.backgroundColor, "#2563eb"),
        textColor: hexFromValue(el.style.color || style.color, "#ffffff"),
        radius: el.style.borderRadius || style.borderRadius || "8px",
        text: el.textContent?.trim() ?? "",
        newTab: targetAttr === "_blank",
      };
      return props as ElementPropsByType[T];
    }
    case "image": {
      const ratio = (el.style.aspectRatio || "auto").replace(/\s*\/\s*/, " / ") as AspectRatio;
      const props: ImageProps = {
        src: el.getAttribute("src") ?? (el.querySelector("img")?.getAttribute("src") ?? ""),
        alt: el.getAttribute("alt") ?? (el.querySelector("img")?.getAttribute("alt") ?? ""),
        aspectRatio: ratio || "auto",
        objectFit: ((el.style.objectFit || style.objectFit) as ObjectFit) || "cover",
        radius: el.style.borderRadius || style.borderRadius || "0px",
        borderWidth: el.style.borderWidth || style.borderWidth || "0px",
        borderColor: hexFromValue(el.style.borderColor || style.borderColor, "#e2e8f0"),
        shadow: shadowPreset(el),
        href: el.getAttribute("data-href") ?? (el.closest("a")?.getAttribute("href") ?? ""),
        width: el.style.width || style.width || "auto",
        height: el.style.height || style.height || "auto",
        padding: el.style.padding || style.padding || "0px",
        opacity: el.style.opacity || style.opacity || "1",
      };
      return props as ElementPropsByType[T];
    }
    case "video": {
      const videoTag = (el.tagName === "VIDEO" ? el : el.querySelector("video")) as HTMLVideoElement | null;
      const src = videoTag?.getAttribute("src") ?? videoTag?.currentSrc ?? (videoTag?.querySelector("source")?.getAttribute("src") ?? "");
      const ratio = (el.style.aspectRatio || videoTag?.style.aspectRatio || "auto").replace(/\s*\/\s*/, " / ") as AspectRatio;
      const props: VideoProps = {
        src: src || "",
        poster: videoTag?.getAttribute("poster") ?? "",
        autoplay: videoTag ? videoTag.hasAttribute("autoplay") || videoTag.autoplay : false,
        muted: videoTag ? videoTag.hasAttribute("muted") || videoTag.muted : true,
        loop: videoTag ? videoTag.hasAttribute("loop") || videoTag.loop : true,
        controls: videoTag ? videoTag.hasAttribute("controls") || videoTag.controls : true,
        playsInline: videoTag ? videoTag.hasAttribute("playsinline") || videoTag.playsInline : true,
        aspectRatio: ratio || "auto",
        objectFit: (((videoTag?.style.objectFit || el.style.objectFit || style.objectFit) as ObjectFit) || "cover"),
        radius: el.style.borderRadius || style.borderRadius || "0px",
        borderWidth: el.style.borderWidth || style.borderWidth || "0px",
        borderColor: hexFromValue(el.style.borderColor || style.borderColor, "#e2e8f0"),
        shadow: shadowPreset(el),
        width: el.style.width || style.width || "100%",
        height: el.style.height || style.height || "auto",
        padding: el.style.padding || style.padding || "0px",
      };
      return props as ElementPropsByType[T];
    }
    case "youtube": {
      const iframe = (el.tagName === "IFRAME" ? el : el.querySelector("iframe")) as HTMLIFrameElement | null;
      const iframeSrc = iframe?.getAttribute("src") ?? "";
      const videoId = el.getAttribute("data-youtube-id") || extractYouTubeVideoId(iframeSrc) || "dQw4w9WgXcQ";
      const ratio = (el.style.aspectRatio || "16 / 9").replace(/\s*\/\s*/, " / ") as AspectRatio;
      const props: YouTubeProps = {
        url: iframeSrc || `https://www.youtube.com/watch?v=${videoId}`,
        videoId,
        autoplay: iframeSrc.includes("autoplay=1"),
        muted: iframeSrc.includes("mute=1"),
        loop: iframeSrc.includes("loop=1"),
        controls: !iframeSrc.includes("controls=0"),
        aspectRatio: ratio || "16 / 9",
        radius: el.style.borderRadius || style.borderRadius || "0px",
        borderWidth: el.style.borderWidth || style.borderWidth || "0px",
        borderColor: hexFromValue(el.style.borderColor || style.borderColor, "#e2e8f0"),
        shadow: shadowPreset(el),
        width: el.style.width || style.width || "100%",
        height: el.style.height || style.height || "auto",
      };
      return props as ElementPropsByType[T];
    }
    case "icon": {
      const svg = (el.tagName === "SVG" ? el : el.querySelector("svg")) as SVGElement | null;
      const iconName = el.getAttribute("data-icon-name") || "Star";
      const iconColor = hexFromValue(
        el.style.color || svg?.getAttribute("stroke") || svg?.getAttribute("fill") || style.color,
        "#2563eb",
      );
      const iconSize = el.style.width || (svg ? `${svg.getAttribute("width") || "24"}px` : "24px");
      const props: IconProps = {
        iconName,
        color: iconColor,
        size: iconSize.includes("px") ? iconSize : `${iconSize}px`,
        strokeWidth: svg?.getAttribute("stroke-width") || "2",
        background: hexFromValue(el.style.backgroundColor || style.backgroundColor, "transparent"),
        radius: el.style.borderRadius || style.borderRadius || "0px",
        padding: el.style.padding || style.padding || "0px",
        href: el.getAttribute("data-href") ?? (el.closest("a")?.getAttribute("href") ?? ""),
      };
      return props as ElementPropsByType[T];
    }
    case "logo": {
      const img = (el.tagName === "IMG" ? el : el.querySelector("img")) as HTMLImageElement | null;
      const textEl = el.querySelector("span, p, h1, h2, h3, h4, h5, h6") as HTMLElement | null;
      const props: LogoProps = {
        src: img?.getAttribute("src") || "",
        text: textEl?.textContent?.trim() || (img ? "" : el.textContent?.trim() || "LOGO"),
        size: el.style.height || (img ? `${img.height || 40}px` : "40px"),
        color: hexFromValue(el.style.color || style.color, "#0f172a"),
        background: hexFromValue(el.style.backgroundColor || style.backgroundColor, "transparent"),
        radius: el.style.borderRadius || style.borderRadius || "0px",
        padding: el.style.padding || style.padding || "0px",
        href: el.getAttribute("href") ?? el.getAttribute("data-href") ?? "/",
        alt: img?.getAttribute("alt") || "Logo",
      };
      return props as ElementPropsByType[T];
    }
    case "plus": {
      const props: PlusProps = {
        placeholderText: el.textContent?.trim() || "Add Media",
        actionType: el.getAttribute("data-action-type") || "image",
      };
      return props as ElementPropsByType[T];
    }
    case "heading": {
      const level = (el.tagName.toLowerCase() as HeadingLevel) || "h2";
      const bg = getEffectiveElementBackground(el);
      const autoColor = calculateOppositeContrast(bg).textColor;
      const rawColor = el.style.color || style.color;
      const props: HeadingProps = {
        level,
        color: hexFromValue(rawColor, autoColor),
        fontSize: el.style.fontSize || style.fontSize || "24px",
        fontWeight: el.style.fontWeight || style.fontWeight || "700",
        fontStyle: el.style.fontStyle || style.fontStyle || "normal",
        textDecoration: el.style.textDecoration || style.textDecoration || "none",
        textAlign: ((el.style.textAlign || style.textAlign) as TextAlign) || "left",
        lineHeight: el.style.lineHeight || "",
        letterSpacing: el.style.letterSpacing || "",
        margin: el.style.margin || style.margin || "0px",
        fontFamily: el.style.fontFamily || style.fontFamily || "",
        textTransform: ((el.style.textTransform || style.textTransform || "none") as TextTransform),
      };
      return props as ElementPropsByType[T];
    }
    case "text": {
      const bg = getEffectiveElementBackground(el);
      const autoColor = calculateOppositeContrast(bg).textColor;
      const rawColor = el.style.color || style.color;
      const props: TextProps = {
        color: hexFromValue(rawColor, autoColor),
        fontSize: el.style.fontSize || style.fontSize || "16px",
        fontWeight: el.style.fontWeight || style.fontWeight || "400",
        fontStyle: el.style.fontStyle || style.fontStyle || "normal",
        textDecoration: el.style.textDecoration || style.textDecoration || "none",
        textAlign: ((el.style.textAlign || style.textAlign) as TextAlign) || "left",
        lineHeight: el.style.lineHeight || "",
        letterSpacing: el.style.letterSpacing || "",
        margin: el.style.margin || style.margin || "0px",
        fontFamily: el.style.fontFamily || style.fontFamily || "",
        textTransform: ((el.style.textTransform || style.textTransform || "none") as TextTransform),
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

const set = (el: HTMLElement, prop: string, value: string | null | undefined) => {
  if (value === undefined) return;
  if (value === null || value === "") el.style.removeProperty(prop);
  else el.style.setProperty(prop, value, "important");
};

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
    case "video":
      applyVideo(el, props as Partial<VideoProps>);
      return;
    case "youtube":
      applyYouTube(el, props as Partial<YouTubeProps>);
      return;
    case "icon":
      applyIcon(el, props as Partial<IconProps>);
      return;
    case "logo":
      applyLogo(el, props as Partial<LogoProps>);
      return;
    case "plus":
      applyPlus(el, props as Partial<PlusProps>);
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

  if (p.layout !== undefined || p.mediaWidth !== undefined || p.align !== undefined) {
    applyCardLayoutDom(
      el,
      p.layout ?? (p.mediaWidth || p.align ? "horizontal-left" : "vertical"),
      p.mediaWidth,
      p.align,
    );
  }
}

function applyButton(el: HTMLElement, p: Partial<ButtonProps>): void {
  if (p.href !== undefined) {
    if (el.tagName === "A") el.setAttribute("href", p.href);
    else el.setAttribute("data-href", p.href);
    applyLinkTarget(el, p.href);
  }

  if (p.newTab !== undefined) {
    if (p.newTab) {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    } else {
      el.removeAttribute("target");
      el.removeAttribute("rel");
    }
  }

  if (p.text !== undefined) {
    let replaced = false;
    const childNodes = el.childNodes ? Array.from(el.childNodes) : [];
    for (const node of childNodes) {
      if (node && node.nodeType === 3 && node.textContent?.trim()) {
        node.textContent = p.text;
        replaced = true;
        break;
      }
    }
    if (!replaced) {
      const span = el.querySelector ? el.querySelector("span:not([aria-hidden])") : null;
      if (span) {
        span.textContent = p.text;
      } else if (!el.children || el.children.length === 0) {
        el.textContent = p.text;
      } else if (typeof document !== "undefined") {
        const textNode = document.createTextNode(p.text);
        el.appendChild(textNode);
      } else {
        el.textContent = p.text;
      }
    }
  }

  const variant = p.variant ?? (el.getAttribute("data-xite-variant") as ButtonVariant | null) ?? "solid";
  if (p.variant !== undefined) el.setAttribute("data-xite-variant", p.variant);

  const accent = p.background ?? (el.style.backgroundColor ? hexFromValue(el.style.backgroundColor) : undefined);
  if (p.variant !== undefined || p.background !== undefined) {
    const colour = accent ?? "#2563eb";
    if (variant === "solid") {
      set(el, "background-color", colour);
      set(el, "border", "2px solid transparent");
      const autoTextColor = calculateOppositeContrast(colour).textColor;
      set(el, "color", p.textColor ?? autoTextColor);
    } else if (variant === "outline") {
      set(el, "background-color", "transparent");
      set(el, "border", `2px solid ${colour}`);
      set(el, "color", p.textColor ?? colour);
    } else {
      set(el, "background-color", "transparent");
      set(el, "border", "2px solid transparent");
      set(el, "color", p.textColor ?? colour);
    }
  } else if (p.textColor !== undefined) {
    set(el, "color", p.textColor);
  }

  if (p.size !== undefined) {
    el.setAttribute("data-xite-size", p.size);
    set(el, "padding", BUTTON_SIZE_PADDING[p.size]);
    set(el, "font-size", BUTTON_SIZE_FONT[p.size]);
  }
  set(el, "border-radius", p.radius);
}

function applyImage(el: HTMLElement, p: Partial<ImageProps>): void {
  const img = el.tagName === "IMG" ? el : (el.querySelector("img") as HTMLElement | null);
  if (p.src !== undefined) {
    if (img) {
      img.setAttribute("src", p.src);
      img.removeAttribute("srcset");
    } else {
      el.setAttribute("src", p.src);
    }
    el.closest("picture")?.querySelectorAll("source").forEach((s) => s.remove());
  }
  if (p.alt !== undefined) {
    if (img) img.setAttribute("alt", p.alt);
    else el.setAttribute("alt", p.alt);
  }
  if (p.aspectRatio !== undefined) {
    set(el, "aspect-ratio", p.aspectRatio === "auto" ? null : p.aspectRatio);
    if (p.aspectRatio !== "auto") set(el, "width", "100%");
  }
  if (p.objectFit !== undefined) {
    set(el, "object-fit", p.objectFit);
    if (img && img !== el) set(img, "object-fit", p.objectFit);
  }
  set(el, "border-radius", p.radius);
  if (img && img !== el) set(img, "border-radius", p.radius);
  if (p.borderWidth !== undefined || p.borderColor !== undefined) {
    const width = p.borderWidth ?? el.style.borderWidth ?? "0px";
    const color = p.borderColor ?? el.style.borderColor ?? "#e2e8f0";
    set(el, "border-width", width);
    set(el, "border-style", parseFloat(width) > 0 ? "solid" : "none");
    set(el, "border-color", color);
  }
  if (p.shadow !== undefined) {
    set(el, "box-shadow", SHADOW_CSS[p.shadow]);
    el.setAttribute("data-xite-shadow", p.shadow);
  }
  if (p.href !== undefined) {
    const parentA = el.closest("a");
    if (parentA) {
      parentA.setAttribute("href", p.href);
      applyLinkTarget(parentA, p.href);
    } else {
      el.setAttribute("data-href", p.href);
    }
  }
  if (p.width !== undefined) set(el, "width", p.width);
  if (p.height !== undefined) set(el, "height", p.height);
  if (p.padding !== undefined) set(el, "padding", p.padding);
  if (p.opacity !== undefined) set(el, "opacity", p.opacity);
}

function applyVideo(el: HTMLElement, p: Partial<VideoProps>): void {
  const video = (el.tagName === "VIDEO" ? el : el.querySelector("video")) as HTMLVideoElement | null;
  if (!video) return;

  if (p.src !== undefined) {
    video.setAttribute("src", p.src);
    const source = video.querySelector("source");
    if (source) source.setAttribute("src", p.src);
  }
  if (p.poster !== undefined) {
    if (p.poster) video.setAttribute("poster", p.poster);
    else video.removeAttribute("poster");
  }
  if (p.autoplay !== undefined) {
    if (p.autoplay) {
      video.setAttribute("autoplay", "");
      video.autoplay = true;
    } else {
      video.removeAttribute("autoplay");
      video.autoplay = false;
    }
  }
  if (p.muted !== undefined) {
    if (p.muted) {
      video.setAttribute("muted", "");
      video.muted = true;
    } else {
      video.removeAttribute("muted");
      video.muted = false;
    }
  }
  if (p.loop !== undefined) {
    if (p.loop) {
      video.setAttribute("loop", "");
      video.loop = true;
    } else {
      video.removeAttribute("loop");
      video.loop = false;
    }
  }
  if (p.controls !== undefined) {
    if (p.controls) {
      video.setAttribute("controls", "");
      video.controls = true;
    } else {
      video.removeAttribute("controls");
      video.controls = false;
    }
  }
  if (p.playsInline !== undefined) {
    if (p.playsInline) {
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
    } else {
      video.removeAttribute("playsinline");
      video.removeAttribute("webkit-playsinline");
    }
  }
  if (p.aspectRatio !== undefined) {
    set(el, "aspect-ratio", p.aspectRatio === "auto" ? null : p.aspectRatio);
    set(video, "aspect-ratio", p.aspectRatio === "auto" ? null : p.aspectRatio);
  }
  if (p.objectFit !== undefined) {
    set(video, "object-fit", p.objectFit);
    set(el, "object-fit", p.objectFit);
  }
  if (p.radius !== undefined) {
    set(el, "border-radius", p.radius);
    set(video, "border-radius", p.radius);
  }
  if (p.width !== undefined) set(el, "width", p.width);
  if (p.height !== undefined) set(el, "height", p.height);
  if (p.padding !== undefined) set(el, "padding", p.padding);
}

function applyYouTube(el: HTMLElement, p: Partial<YouTubeProps>): void {
  const iframe = (el.tagName === "IFRAME" ? el : el.querySelector("iframe")) as HTMLIFrameElement | null;
  const currentVideoId = p.videoId || (p.url ? extractYouTubeVideoId(p.url) : null) || el.getAttribute("data-youtube-id") || "dQw4w9WgXcQ";

  if (p.videoId || p.url || p.autoplay !== undefined || p.muted !== undefined || p.loop !== undefined || p.controls !== undefined) {
    const newEmbedUrl = buildYouTubeEmbedUrl(currentVideoId, {
      autoplay: p.autoplay,
      muted: p.muted,
      loop: p.loop,
      controls: p.controls,
    });
    if (iframe) iframe.setAttribute("src", newEmbedUrl);
    el.setAttribute("data-youtube-id", currentVideoId);
  }

  if (p.aspectRatio !== undefined) {
    set(el, "aspect-ratio", p.aspectRatio === "auto" ? null : p.aspectRatio);
  }
  if (p.radius !== undefined) {
    set(el, "border-radius", p.radius);
    if (iframe) set(iframe, "border-radius", p.radius);
  }
  if (p.width !== undefined) set(el, "width", p.width);
  if (p.height !== undefined) set(el, "height", p.height);
}

function applyIcon(el: HTMLElement, p: Partial<IconProps>): void {
  const svg = (el.tagName === "SVG" ? el : el.querySelector("svg")) as SVGElement | null;
  if (p.iconName !== undefined) {
    el.setAttribute("data-icon-name", p.iconName);
  }
  if (p.color !== undefined) {
    set(el, "color", p.color);
    if (svg) {
      if (svg.getAttribute("stroke") && svg.getAttribute("stroke") !== "none") svg.setAttribute("stroke", p.color);
      if (svg.getAttribute("fill") && svg.getAttribute("fill") !== "none") svg.setAttribute("fill", p.color);
    }
  }
  if (p.size !== undefined) {
    set(el, "width", p.size);
    set(el, "height", p.size);
    if (svg) {
      svg.setAttribute("width", p.size.replace("px", ""));
      svg.setAttribute("height", p.size.replace("px", ""));
    }
  }
  if (p.strokeWidth !== undefined && svg) {
    svg.setAttribute("stroke-width", p.strokeWidth);
  }
  if (p.background !== undefined) set(el, "background-color", p.background);
  if (p.radius !== undefined) set(el, "border-radius", p.radius);
  if (p.padding !== undefined) set(el, "padding", p.padding);
  if (p.href !== undefined) {
    const parentA = el.closest("a");
    if (parentA) {
      parentA.setAttribute("href", p.href);
      applyLinkTarget(parentA, p.href);
    } else {
      el.setAttribute("data-href", p.href);
    }
  }
}

function applyLogo(el: HTMLElement, p: Partial<LogoProps>): void {
  const img = (el.tagName === "IMG" ? el : el.querySelector("img")) as HTMLImageElement | null;
  const textEl = (el.querySelector("span, p, h1, h2, h3, h4, h5, h6") || (img ? null : el)) as HTMLElement | null;

  if (p.src !== undefined && img) {
    img.setAttribute("src", p.src);
  }
  if (p.alt !== undefined && img) {
    img.setAttribute("alt", p.alt);
  }
  if (p.text !== undefined && textEl) {
    textEl.textContent = p.text;
  }
  if (p.size !== undefined) {
    set(el, "height", p.size);
    if (img) set(img, "height", p.size);
  }
  if (p.color !== undefined) {
    set(el, "color", p.color);
    if (textEl) set(textEl, "color", p.color);
  }
  if (p.background !== undefined) set(el, "background-color", p.background);
  if (p.radius !== undefined) {
    set(el, "border-radius", p.radius);
    if (img) set(img, "border-radius", p.radius);
  }
  if (p.padding !== undefined) set(el, "padding", p.padding);
  if (p.href !== undefined) {
    if (el.tagName === "A") {
      el.setAttribute("href", p.href);
      applyLinkTarget(el, p.href);
    } else {
      const parentA = el.closest("a");
      if (parentA) {
        parentA.setAttribute("href", p.href);
        applyLinkTarget(parentA, p.href);
      } else {
        el.setAttribute("data-href", p.href);
      }
    }
  }
}

function applyPlus(el: HTMLElement, p: Partial<PlusProps>): void {
  if (p.placeholderText !== undefined) {
    el.textContent = p.placeholderText;
  }
}

function applyHeading(el: HTMLElement, p: Partial<HeadingProps>): void {
  set(el, "color", p.color);
  if (p.fontSize !== undefined) {
    set(el, "font-size", p.fontSize);
    if (typeof el.querySelectorAll === "function") {
      el.querySelectorAll<HTMLElement>("span, font, b, strong, em, i, p, h1, h2, h3, h4, h5, h6").forEach((child) => {
        set(child, "font-size", p.fontSize);
      });
    }
  }
  if (p.color !== undefined && typeof el.querySelectorAll === "function") {
    el.querySelectorAll<HTMLElement>("span, font, b, strong, em, i, p, h1, h2, h3, h4, h5, h6, a").forEach((child) => {
      set(child, "color", p.color);
    });
  }
  set(el, "font-weight", p.fontWeight);
  if (p.fontWeight !== undefined && typeof el.querySelectorAll === "function") {
    el.querySelectorAll<HTMLElement>("span, font, b, strong, em, i, p, h1, h2, h3, h4, h5, h6").forEach((child) => {
      set(child, "font-weight", p.fontWeight);
    });
  }
  if (p.fontStyle !== undefined) {
    set(el, "font-style", p.fontStyle);
    if (typeof el.querySelectorAll === "function") {
      el.querySelectorAll<HTMLElement>("span, font, b, strong, em, i, p, h1, h2, h3, h4, h5, h6").forEach((child) => {
        set(child, "font-style", p.fontStyle);
      });
    }
  }
  if (p.textDecoration !== undefined) {
    set(el, "text-decoration", p.textDecoration);
    if (typeof el.querySelectorAll === "function") {
      el.querySelectorAll<HTMLElement>("span, font, b, strong, em, i, p, h1, h2, h3, h4, h5, h6").forEach((child) => {
        set(child, "text-decoration", p.textDecoration);
      });
    }
  }
  set(el, "text-align", p.textAlign);
  set(el, "line-height", p.lineHeight);
  set(el, "letter-spacing", p.letterSpacing);
  set(el, "margin", p.margin);
  if (p.fontFamily !== undefined) {
    set(el, "font-family", p.fontFamily);
    if (typeof el.querySelectorAll === "function") {
      el.querySelectorAll<HTMLElement>("span, font, b, strong, em, i, p, h1, h2, h3, h4, h5, h6").forEach((child) => {
        set(child, "font-family", p.fontFamily);
      });
    }
  }
  if (p.textTransform !== undefined) set(el, "text-transform", p.textTransform);
}

function applyText(el: HTMLElement, p: Partial<TextProps>): void {
  set(el, "color", p.color);
  if (p.fontSize !== undefined) {
    set(el, "font-size", p.fontSize);
    if (typeof el.querySelectorAll === "function") {
      el.querySelectorAll<HTMLElement>("span, font, b, strong, em, i, p, h1, h2, h3, h4, h5, h6").forEach((child) => {
        set(child, "font-size", p.fontSize);
      });
    }
  }
  if (p.color !== undefined && typeof el.querySelectorAll === "function") {
    el.querySelectorAll<HTMLElement>("span, font, b, strong, em, i, p, h1, h2, h3, h4, h5, h6, a").forEach((child) => {
      set(child, "color", p.color);
    });
  }
  set(el, "font-weight", p.fontWeight);
  if (p.fontWeight !== undefined && typeof el.querySelectorAll === "function") {
    el.querySelectorAll<HTMLElement>("span, font, b, strong, em, i, p, h1, h2, h3, h4, h5, h6").forEach((child) => {
      set(child, "font-weight", p.fontWeight);
    });
  }
  if (p.fontStyle !== undefined) {
    set(el, "font-style", p.fontStyle);
    if (typeof el.querySelectorAll === "function") {
      el.querySelectorAll<HTMLElement>("span, font, b, strong, em, i, p, h1, h2, h3, h4, h5, h6").forEach((child) => {
        set(child, "font-style", p.fontStyle);
      });
    }
  }
  if (p.textDecoration !== undefined) {
    set(el, "text-decoration", p.textDecoration);
    if (typeof el.querySelectorAll === "function") {
      el.querySelectorAll<HTMLElement>("span, font, b, strong, em, i, p, h1, h2, h3, h4, h5, h6").forEach((child) => {
        set(child, "text-decoration", p.textDecoration);
      });
    }
  }
  set(el, "text-align", p.textAlign);
  set(el, "line-height", p.lineHeight);
  set(el, "letter-spacing", p.letterSpacing);
  set(el, "margin", p.margin);
  if (p.fontFamily !== undefined) {
    set(el, "font-family", p.fontFamily);
    if (typeof el.querySelectorAll === "function") {
      el.querySelectorAll<HTMLElement>("span, font, b, strong, em, i, p, h1, h2, h3, h4, h5, h6").forEach((child) => {
        set(child, "font-family", p.fontFamily);
      });
    }
  }
  if (p.textTransform !== undefined) set(el, "text-transform", p.textTransform);
}

function applyContainer(el: HTMLElement, p: Partial<ContainerProps>): void {
  if (p.display !== undefined) {
    set(el, "display", p.display);
    if (p.display === "grid") {
      if (!el.style.gridTemplateColumns) {
        el.style.setProperty("grid-template-columns", "repeat(auto-fit, minmax(min(100%, 200px), 1fr))");
      }
    } else if (p.display === "flex") {
      el.style.removeProperty("grid-template-columns");
      if (!el.style.alignItems) el.style.setProperty("align-items", "center");
    } else if (p.display === "block") {
      el.style.removeProperty("grid-template-columns");
    }
  }
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

  // 1. Remove existing unique identifiers so they don't collide
  clone.removeAttribute(ELEMENT_KEY_ATTR);
  clone.removeAttribute("id");
  const nestedUnique = clone.querySelectorAll<HTMLElement>(`[${ELEMENT_KEY_ATTR}], [id]`);
  for (const n of nestedUnique) {
    n.removeAttribute(ELEMENT_KEY_ATTR);
    n.removeAttribute("id");
  }

  // 2. Insert clone after the original element
  element.after(clone);

  const parent = element.parentElement;
  if (!parent) return clone;

  const tag = element.tagName.toLowerCase();
  const parentTag = parent.tagName.toLowerCase();
  const parentComputed = typeof window !== "undefined" && window.getComputedStyle ? window.getComputedStyle(parent) : null;
  const parentCls = (parent.className || "").toLowerCase();
  const elCls = (element.className || "").toLowerCase();

  const isButtonEl = isButton(element) || tag === "button" || tag === "a" || elCls.includes("btn") || elCls.includes("button");
  const isCardEl = elCls.includes("card") || element.hasAttribute("data-card") || (element.children.length >= 2 && !STRUCTURAL_TAGS.has(tag) && (parentCls.includes("grid") || parentCls.includes("cards") || parentCls.includes("col-")));
  const isImageEl = tag === "img" || tag === "picture" || tag === "figure" || elCls.includes("image") || elCls.includes("avatar");

  // 3. Auto-fit and auto-adjust parent layout depending on element and container structure
  if (isButtonEl) {
    // Buttons: Ensure parent is a flex row with clean wrapping and proper button gap
    const isParentFlex = parentComputed?.display.includes("flex") || parentCls.includes("flex");
    const isParentGrid = parentComputed?.display.includes("grid") || parentCls.includes("grid");

    if (!isParentFlex && !isParentGrid && parentTag !== "body" && !STRUCTURAL_TAGS.has(parentTag)) {
      parent.style.setProperty("display", "flex", "important");
      parent.style.setProperty("flex-wrap", "wrap", "important");
      parent.style.setProperty("gap", "12px", "important");
      parent.style.setProperty("align-items", "center", "important");
      if (parentComputed?.textAlign === "center" || parentCls.includes("text-center") || parentCls.includes("justify-center")) {
        parent.style.setProperty("justify-content", "center", "important");
      }
    } else if (isParentFlex) {
      parent.style.setProperty("flex-wrap", "wrap", "important");
      if (!parent.style.gap && (!parentComputed || parentComputed.gap === "normal" || parentComputed.gap === "0px")) {
        parent.style.setProperty("gap", "12px", "important");
      }
    }

    clone.style.setProperty("flex", "0 0 auto", "important");
    element.style.setProperty("flex", "0 0 auto", "important");
  } else {
    const siblings = Array.from(parent.children) as HTMLElement[];
    const childCount = siblings.length;
    const isParentVertical =
      parentTag === "ul" ||
      parentTag === "ol" ||
      parentCls.includes("flex-col") ||
      parentComputed?.flexDirection === "column" ||
      parentCls.includes("space-y-") ||
      parentCls.includes("stack");

    const isParentGrid =
      parentComputed?.display.includes("grid") ||
      parentCls.includes("grid") ||
      /\bgrid-cols-\d+\b/.test(parent.className);

    const isParentFlexRow =
      (parentComputed?.display.includes("flex") || parentCls.includes("flex")) &&
      !isParentVertical;

    if (isParentVertical) {
      // Vertical list / column item: Maintain vertical flow with clean spacing
      clone.style.setProperty("max-width", "100%", "important");
      clone.style.setProperty("box-sizing", "border-box", "important");
    } else if (isParentGrid || (childCount >= 2 && !STRUCTURAL_TAGS.has(parentTag) && !isParentFlexRow)) {
      // Grid container / column row: dynamically adjust grid columns to fit all children evenly
      const dynamicCols = childCount <= 6 ? childCount : Math.min(childCount, 12);

      // Update any existing Tailwind grid-cols classes on parent
      if (/\bgrid-cols-\d+\b/.test(parent.className)) {
        parent.className = parent.className
          .replace(/\bgrid-cols-\d+\b/g, `grid-cols-${dynamicCols}`)
          .replace(/\b(?:sm|md|lg|xl|2xl):grid-cols-\d+\b/g, (m) => `${m.split(":")[0]}:grid-cols-${dynamicCols}`);
      }

      parent.style.setProperty("display", "grid", "important");
      parent.style.setProperty("grid-template-columns", `repeat(${dynamicCols}, minmax(0, 1fr))`, "important");
      parent.style.setProperty("gap", parent.style.gap || (parentComputed?.gap && parentComputed.gap !== "normal" && parentComputed.gap !== "0px" ? parentComputed.gap : "24px"), "important");
      parent.style.setProperty("width", "100%", "important");
      parent.style.setProperty("box-sizing", "border-box", "important");
      parent.style.setProperty("align-items", "start", "important");

      for (const sib of siblings) {
        sib.style.setProperty("min-width", "0", "important");
        sib.style.setProperty("width", "100%", "important");
        sib.style.setProperty("max-width", "100%", "important");
        sib.style.setProperty("box-sizing", "border-box", "important");
      }
    } else if (isParentFlexRow) {
      // Flex row: distribute all children evenly across the row
      parent.style.setProperty("display", "flex", "important");
      parent.style.setProperty("flex-direction", "row", "important");
      parent.style.setProperty("gap", parent.style.gap || (parentComputed?.gap && parentComputed.gap !== "normal" && parentComputed.gap !== "0px" ? parentComputed.gap : "24px"), "important");
      parent.style.setProperty("width", "100%", "important");
      parent.style.setProperty("box-sizing", "border-box", "important");
      parent.style.setProperty("align-items", "start", "important");

      for (const sib of siblings) {
        sib.style.setProperty("flex", "1 1 0%", "important");
        sib.style.setProperty("min-width", "0", "important");
        sib.style.setProperty("max-width", "100%", "important");
        sib.style.setProperty("box-sizing", "border-box", "important");
      }
    } else {
      clone.style.setProperty("max-width", "100%", "important");
      clone.style.setProperty("box-sizing", "border-box", "important");
    }
  }

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

export const TAG_DEFAULT_STYLES: Record<
  string,
  { fontSize: string; twClasses: string[]; fontWeight: string; lineHeight: string }
> = {
  h1: { fontSize: "48px", twClasses: ["text-4xl", "sm:text-5xl", "md:text-6xl", "font-extrabold"], fontWeight: "800", lineHeight: "1.15" },
  h2: { fontSize: "36px", twClasses: ["text-3xl", "sm:text-4xl", "font-bold"], fontWeight: "700", lineHeight: "1.2" },
  h3: { fontSize: "28px", twClasses: ["text-2xl", "sm:text-3xl", "font-bold"], fontWeight: "700", lineHeight: "1.25" },
  h4: { fontSize: "22px", twClasses: ["text-xl", "sm:text-2xl", "font-semibold"], fontWeight: "600", lineHeight: "1.3" },
  h5: { fontSize: "18px", twClasses: ["text-lg", "font-semibold"], fontWeight: "600", lineHeight: "1.35" },
  h6: { fontSize: "15px", twClasses: ["text-sm", "font-semibold", "tracking-wide"], fontWeight: "600", lineHeight: "1.4" },
  p: { fontSize: "16px", twClasses: ["text-base", "font-normal"], fontWeight: "400", lineHeight: "1.6" },
  blockquote: { fontSize: "18px", twClasses: ["italic", "border-l-4", "border-slate-400", "pl-4"], fontWeight: "400", lineHeight: "1.6" },
  pre: { fontSize: "14px", twClasses: ["font-mono", "bg-slate-900", "text-slate-100", "p-4", "rounded-lg"], fontWeight: "400", lineHeight: "1.5" },
  code: { fontSize: "14px", twClasses: ["font-mono", "bg-slate-800/80", "px-1.5", "py-0.5", "rounded"], fontWeight: "400", lineHeight: "1.4" },
  span: { fontSize: "inherit", twClasses: [], fontWeight: "inherit", lineHeight: "inherit" },
  div: { fontSize: "16px", twClasses: [], fontWeight: "400", lineHeight: "1.6" },
  strong: { fontSize: "inherit", twClasses: ["font-bold"], fontWeight: "700", lineHeight: "inherit" },
  b: { fontSize: "inherit", twClasses: ["font-bold"], fontWeight: "700", lineHeight: "inherit" },
  em: { fontSize: "inherit", twClasses: ["italic"], fontWeight: "inherit", lineHeight: "inherit" },
  i: { fontSize: "inherit", twClasses: ["italic"], fontWeight: "inherit", lineHeight: "inherit" },
  u: { fontSize: "inherit", twClasses: ["underline"], fontWeight: "inherit", lineHeight: "inherit" },
  s: { fontSize: "inherit", twClasses: ["line-through"], fontWeight: "inherit", lineHeight: "inherit" },
};

const TW_FONT_SIZE_REGEX = /\b(text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)|(sm|md|lg|xl|2xl):text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl))\b/g;

const STRUCTURAL_CONTAINER_TAGS = new Set([
  "DIV", "SECTION", "ARTICLE", "HEADER", "FOOTER", "NAV", "ASIDE", "MAIN", "FORM", "BODY", "HTML"
]);

export function changeHeadingTagDom(
  element: HTMLElement,
  newTag: HeadingLevel | "p" | string,
  editorRoot?: HTMLElement | null
): HTMLElement {
  const normalizedTag = (newTag || "p").toLowerCase().trim();
  const styleDefaults = TAG_DEFAULT_STYLES[normalizedTag] || TAG_DEFAULT_STYLES.p;

  // 1. Guard against structural container replacement:
  // Structural containers (DIV, SECTION, etc.) are parent boundaries that MUST NOT be replaced by H1/P.
  if (STRUCTURAL_CONTAINER_TAGS.has(element.tagName.toUpperCase())) {
    // If the container has an inner heading, paragraph, or text element, format that inner element
    const innerTextEl =
      typeof element.querySelector === "function"
        ? element.querySelector<HTMLElement>(
            "h1, h2, h3, h4, h5, h6, p, blockquote, pre, code, span, strong, em, b, i, u, s"
          )
        : null;
    if (innerTextEl && innerTextEl !== element) {
      return changeHeadingTagDom(innerTextEl, newTag, editorRoot || element);
    }

    // If the container has no heading child, wrap or place its text content in the new tag INSIDE the container
    const doc = (typeof document !== "undefined" ? document : (element as any).ownerDocument) || {
      createElement: (tag: string) => ({ tagName: tag.toUpperCase(), children: [], style: {}, setAttribute: () => {} }),
    };
    const newEl = doc.createElement(normalizedTag);
    while (element.firstChild) {
      newEl.appendChild(element.firstChild);
    }
    if (styleDefaults?.twClasses && styleDefaults.twClasses.length > 0) {
      newEl.className = styleDefaults.twClasses.join(" ");
    }
    if (newEl.style?.setProperty) {
      if (styleDefaults?.fontSize && styleDefaults.fontSize !== "inherit") {
        newEl.style.setProperty("font-size", styleDefaults.fontSize, "important");
      }
      if (styleDefaults?.lineHeight && styleDefaults.lineHeight !== "inherit") {
        newEl.style.setProperty("line-height", styleDefaults.lineHeight, "important");
      }
    }
    element.appendChild(newEl);
    return newEl;
  }

  // 2. Element is a heading/paragraph/text element
  const currentTag = element.tagName.toLowerCase();
  let targetElement = element;
  if (currentTag !== normalizedTag) {
    const doc = (typeof document !== "undefined" ? document : (element as any).ownerDocument) || {
      createElement: (tag: string) => ({ tagName: tag.toUpperCase(), children: [], style: {}, setAttribute: () => {} }),
    };
    const newEl = doc.createElement(normalizedTag);
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i]!;
        newEl.setAttribute(attr.name, attr.value);
      }
    }
    while (element.firstChild) {
      newEl.appendChild(element.firstChild);
    }
    if (typeof element.replaceWith === "function") {
      element.replaceWith(newEl);
    }
    targetElement = newEl;
  }

  // Update font size, line-height, and Tailwind classes so the text visibly changes to match the new heading level
  if (targetElement.className) {
    const cleanClass = targetElement.className.replace(TW_FONT_SIZE_REGEX, "").replace(/\s+/g, " ").trim();
    targetElement.className = `${cleanClass} ${styleDefaults?.twClasses?.join(" ") || ""}`.trim();
  }
  if (targetElement.style?.setProperty) {
    if (styleDefaults?.fontSize && styleDefaults.fontSize !== "inherit") {
      targetElement.style.setProperty("font-size", styleDefaults.fontSize, "important");
    }
    if (styleDefaults?.lineHeight && styleDefaults.lineHeight !== "inherit") {
      targetElement.style.setProperty("line-height", styleDefaults.lineHeight, "important");
    }
  }

  // Clean hardcoded child span font sizes so the new tag size applies across the whole heading
  if (typeof targetElement.querySelectorAll === "function") {
    targetElement.querySelectorAll<HTMLElement>("span, font").forEach((child) => {
      if (child.style?.fontSize) {
        child.style.removeProperty("font-size");
      }
    });
  }

  return targetElement;
}

/**
 * Checks whether a Range is a partial text selection within container element
 * (e.g. single character, single word, multiple words, partial sentence) vs the entire element.
 */
export function isPartialTextSelection(range: Range | null, element: HTMLElement): boolean {
  if (!range || range.collapsed) return false;
  const rangeText = range.toString().trim();
  if (rangeText.length === 0) return false;

  const targetTextEl =
    /^(div|section|article|header|footer|nav|aside|main|form)$/i.test(element.tagName) &&
    typeof element.querySelector === "function"
      ? element.querySelector<HTMLElement>(
          "h1, h2, h3, h4, h5, h6, p, blockquote, pre, code, span, strong, em, b, i, u, s"
        ) || element
      : element;

  const elementText = (targetTextEl.textContent || "").trim();
  if (rangeText !== elementText) {
    return true;
  }

  try {
    if (typeof document !== "undefined" && typeof Range !== "undefined") {
      const fullRange = document.createRange();
      fullRange.selectNodeContents(targetTextEl);
      const isFull =
        range.compareBoundaryPoints(Range.START_TO_START, fullRange) <= 0 &&
        range.compareBoundaryPoints(Range.END_TO_END, fullRange) >= 0;
      return !isFull;
    }
  } catch {}

  return false;
}

/**
 * Generic Range-Based Tag Transformation Engine.
 *
 * Dynamically transforms a selected Range to a new HTML tag (H1-H6, P, BLOCKQUOTE, PRE, CODE, SPAN, etc.)
 * strictly inside the editor/container boundary.
 *
 * Enforces hard boundaries:
 * 1. Validates the Range is non-collapsed and valid.
 * 2. Identifies the nearest valid editor/container boundary (editorRoot or enclosing block/container).
 * 3. Enforces that Range commonAncestor and endpoints belong strictly within editorRoot.
 * 4. Determines the affected formatting element / text nodes.
 * 5. Safely extracts and transforms ONLY the selected range.
 * 6. Preserves unselected surrounding text and DOM hierarchy.
 * 7. Ensures transformed content NEVER escapes the parent container.
 * 8. Restores selection / caret position.
 */
export function transformSelectedRangeToTag(
  range: Range,
  newTag: HeadingLevel | "p" | string,
  containerOrRoot?: HTMLElement | null
): HTMLElement | null {
  if (!range || range.collapsed) return null;
  const normalizedTag = (newTag || "p").toLowerCase().trim();
  if (!normalizedTag) return null;

  const styleDefaults = TAG_DEFAULT_STYLES[normalizedTag] || TAG_DEFAULT_STYLES.p;

  // 1. Identify closest editor / container boundary (hard boundary)
  const anchorNode: HTMLElement | null =
    range.commonAncestorContainer.nodeType === 1
      ? (range.commonAncestorContainer as HTMLElement)
      : (range.commonAncestorContainer.parentElement as HTMLElement | null);

  const editorRoot =
    (containerOrRoot && typeof containerOrRoot.contains === "function" ? containerOrRoot : null) ||
    (anchorNode && typeof anchorNode.closest === "function"
      ? anchorNode.closest<HTMLElement>(
          ".editor-container, .editor-block, [data-editor-block], .section-wrapper-container, [data-section-id], .xite-site-canvas"
        )
      : null) ||
    anchorNode?.parentElement ||
    anchorNode ||
    containerOrRoot;

  if (!editorRoot) return null;

  // 2. Validate that the Range strictly belongs to editorRoot
  if (
    typeof editorRoot.contains === "function" &&
    !editorRoot.contains(range.commonAncestorContainer) &&
    !range.commonAncestorContainer.contains(editorRoot)
  ) {
    return null;
  }

  // 3. Find the target formatting element enclosing the range, or fallback to editorRoot
  let targetFormattingEl: HTMLElement = editorRoot;
  let currentAncestor: any = range.commonAncestorContainer;
  while (currentAncestor && currentAncestor !== editorRoot) {
    if (
      currentAncestor.tagName &&
      /^(h[1-6]|p|blockquote|pre|code|span|strong|em|b|i|u|s|label|mark|small|sub|sup|div)$/i.test(
        currentAncestor.tagName
      )
    ) {
      targetFormattingEl = currentAncestor;
      break;
    }
    currentAncestor = currentAncestor.parentNode || currentAncestor.parentElement;
  }

  // 4. Create the new semantic tag element with inline layout
  const doc =
    (typeof document !== "undefined"
      ? document
      : (editorRoot as any).ownerDocument || (targetFormattingEl as any).ownerDocument) || {
      createElement(tag: string) {
        const el: any = {
          tagName: tag.toUpperCase(),
          className: "",
          style: {
            setProperty(k: string, v: string) {
              (this as any)[k] = v;
            },
          },
          setAttribute(k: string, v: string) {
            (this as any)[k] = v;
          },
          getAttribute(k: string) {
            return (this as any)[k];
          },
          children: [],
          appendChild(c: any) {
            this.children.push(c);
            return c;
          },
        };
        return el;
      },
    };

  const tagEl = doc.createElement(normalizedTag);
  if (styleDefaults?.twClasses && styleDefaults.twClasses.length > 0) {
    tagEl.className = styleDefaults.twClasses.join(" ");
  }
  if (tagEl.style?.setProperty) {
    tagEl.style.setProperty("display", "inline", "important");
    if (styleDefaults?.fontSize && styleDefaults.fontSize !== "inherit") {
      tagEl.style.setProperty("font-size", styleDefaults.fontSize, "important");
    }
    if (styleDefaults?.fontWeight && styleDefaults.fontWeight !== "inherit") {
      tagEl.style.setProperty("font-weight", styleDefaults.fontWeight, "important");
    }
    if (styleDefaults?.lineHeight && styleDefaults.lineHeight !== "inherit") {
      tagEl.style.setProperty("line-height", styleDefaults.lineHeight, "important");
    }
  }
  if (tagEl.setAttribute) {
    tagEl.setAttribute("data-xite-heading-tag", normalizedTag);
  }

  try {
    const contents = range.extractContents();

    // If contents has a single child of an inline heading/semantic tag, unwrap it to avoid redundant nesting
    if (
      contents.childNodes?.length === 1 &&
      contents.firstChild &&
      (contents.firstChild as any).tagName &&
      /^(h[1-6]|p|span|blockquote|pre|code)$/i.test((contents.firstChild as any).tagName)
    ) {
      const child = contents.firstChild as any;
      while (child.firstChild) {
        tagEl.appendChild(child.firstChild);
      }
    } else {
      tagEl.appendChild(contents);
    }

    range.insertNode(tagEl);

    // Normalize text nodes in target formatting element / container
    if (typeof targetFormattingEl.normalize === "function") {
      targetFormattingEl.normalize();
    } else if (typeof editorRoot.normalize === "function") {
      editorRoot.normalize();
    }

    // 5. Restore selection over the new tagEl
    if (typeof window !== "undefined") {
      const sel = window.getSelection();
      if (sel) {
        try {
          sel.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(tagEl);
          sel.addRange(newRange);
        } catch {}
      }
    }

    return tagEl;
  } catch (err) {
    console.error("[transformSelectedRangeToTag] Failed to apply range tag:", err);
    return null;
  }
}

/**
 * Applies a heading level (h1-h6) or paragraph (p) or any generic tag to ONLY the specified Range within an element.
 * Delegates to transformSelectedRangeToTag.
 */
export function applyRangeHeadingTagDom(
  range: Range,
  containerElement: HTMLElement,
  newTag: HeadingLevel | "p" | string
): HTMLElement | null {
  return transformSelectedRangeToTag(range, newTag, containerElement);
}

/**
 * Replaces an image element (or container) with an HTML5 Video element in the DOM.
 */
export function replaceImageWithVideoDom(element: HTMLElement, videoProps?: Partial<VideoProps>): HTMLElement {
  const video = document.createElement("video");
  const src = videoProps?.src || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  video.setAttribute("src", src);
  video.setAttribute("controls", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("data-xite-video", "true");

  if (videoProps?.autoplay) video.setAttribute("autoplay", "");
  if (videoProps?.muted ?? true) video.setAttribute("muted", "");
  if (videoProps?.loop ?? true) video.setAttribute("loop", "");
  if (videoProps?.poster) video.setAttribute("poster", videoProps.poster);

  const style = window.getComputedStyle(element);
  video.className = element.className;
  set(video, "width", element.style.width || style.width || "100%");
  set(video, "height", element.style.height || style.height || "auto");
  set(video, "aspect-ratio", element.style.aspectRatio || "16 / 9");
  set(video, "object-fit", element.style.objectFit || "cover");
  set(video, "border-radius", element.style.borderRadius || style.borderRadius || "8px");

  element.replaceWith(video);
  return video;
}

/**
 * Replaces an image or video element with a responsive YouTube embed container.
 */
export function replaceImageWithYouTubeDom(element: HTMLElement, ytProps?: Partial<YouTubeProps>): HTMLElement {
  const videoId = ytProps?.videoId || (ytProps?.url ? extractYouTubeVideoId(ytProps.url) : null) || "dQw4w9WgXcQ";
  const embedUrl = buildYouTubeEmbedUrl(videoId, {
    autoplay: ytProps?.autoplay,
    muted: ytProps?.muted,
    loop: ytProps?.loop,
    controls: ytProps?.controls,
  });

  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-xite-youtube", "true");
  wrapper.setAttribute("data-youtube-id", videoId);
  wrapper.className = `${element.className} relative overflow-hidden`.trim();

  const style = window.getComputedStyle(element);
  set(wrapper, "width", element.style.width || style.width || "100%");
  set(wrapper, "aspect-ratio", ytProps?.aspectRatio || element.style.aspectRatio || "16 / 9");
  set(wrapper, "border-radius", ytProps?.radius || element.style.borderRadius || style.borderRadius || "8px");
  set(wrapper, "position", "relative");

  const iframe = document.createElement("iframe");
  iframe.setAttribute("src", embedUrl);
  iframe.setAttribute("title", "YouTube video player");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute(
    "allow",
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
  );
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute("loading", "lazy");
  set(iframe, "position", "absolute");
  set(iframe, "inset", "0");
  set(iframe, "width", "100%");
  set(iframe, "height", "100%");
  set(iframe, "border", "0");
  set(iframe, "border-radius", ytProps?.radius || element.style.borderRadius || style.borderRadius || "8px");

  wrapper.appendChild(iframe);
  element.replaceWith(wrapper);
  return wrapper;
}

/**
 * Replaces a video or YouTube element with an Image element in the DOM.
 */
export function replaceVideoWithImageDom(element: HTMLElement, imgProps?: Partial<ImageProps>): HTMLElement {
  const img = document.createElement("img");
  const src =
    imgProps?.src ||
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80";
  img.setAttribute("src", src);
  img.setAttribute("alt", imgProps?.alt || "Image");

  const style = window.getComputedStyle(element);
  img.className = element.className;
  set(img, "width", element.style.width || style.width || "100%");
  set(img, "height", element.style.height || style.height || "auto");
  set(img, "aspect-ratio", imgProps?.aspectRatio || element.style.aspectRatio || "16 / 9");
  set(img, "object-fit", imgProps?.objectFit || "cover");
  set(img, "border-radius", imgProps?.radius || element.style.borderRadius || style.borderRadius || "8px");

  element.replaceWith(img);
  return img;
}

/**
 * Replaces a Video element with YouTube embed.
 */
export function replaceVideoWithYouTubeDom(element: HTMLElement, ytProps?: Partial<YouTubeProps>): HTMLElement {
  return replaceImageWithYouTubeDom(element, ytProps);
}

/**
 * Replaces a YouTube embed with HTML5 Video element.
 */
export function replaceYouTubeWithVideoDom(element: HTMLElement, videoProps?: Partial<VideoProps>): HTMLElement {
  return replaceImageWithVideoDom(element, videoProps);
}

/**
 * Replaces a YouTube embed with Image element.
 */
export function replaceYouTubeWithImageDom(element: HTMLElement, imgProps?: Partial<ImageProps>): HTMLElement {
  return replaceVideoWithImageDom(element, imgProps);
}

/**
 * Replaces a Plus / Add Placeholder element with a concrete element (Image, Video, YouTube, Icon, Button).
 */
export function replacePlusWithElementDom(
  element: HTMLElement,
  targetType: "image" | "video" | "youtube" | "icon" | "button",
  props?: Record<string, unknown>,
): HTMLElement {
  switch (targetType) {
    case "video":
      return replaceImageWithVideoDom(element, props as Partial<VideoProps>);
    case "youtube":
      return replaceImageWithYouTubeDom(element, props as Partial<YouTubeProps>);
    case "icon": {
      const span = document.createElement("span");
      span.setAttribute("data-xite-icon", "true");
      span.setAttribute("data-icon-name", (props?.iconName as string) || "Star");
      span.className = "inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600";
      span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
      element.replaceWith(span);
      return span;
    }
    case "button": {
      const a = document.createElement("a");
      a.setAttribute("href", "#");
      a.className = "inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm shadow-sm hover:bg-blue-700 transition";
      a.textContent = (props?.text as string) || "Click Here";
      element.replaceWith(a);
      return a;
    }
    case "image":
    default:
      return replaceVideoWithImageDom(element, props as Partial<ImageProps>);
  }
}

/**
 * Creates an Image element configured for card layout.
 */
export function createCardImageDom(props?: Partial<ImageProps>): HTMLElement {
  const img = document.createElement("img");
  const src =
    props?.src ||
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80";
  img.setAttribute("src", src);
  img.setAttribute("alt", props?.alt || "Card image");
  img.setAttribute("data-xite-image", "true");
  img.className = "w-full aspect-video object-cover rounded-lg mb-4";
  set(img, "width", "100%");
  set(img, "max-width", "100%");
  set(img, "aspect-ratio", props?.aspectRatio || "16 / 9");
  set(img, "object-fit", props?.objectFit || "cover");
  set(img, "border-radius", props?.radius || "8px");
  set(img, "display", "block");
  return img;
}

/**
 * Creates an HTML5 Video element configured for card layout.
 */
export function createCardVideoDom(props?: Partial<VideoProps>): HTMLElement {
  const video = document.createElement("video");
  const src =
    props?.src ||
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  video.setAttribute("src", src);
  video.setAttribute("controls", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("data-xite-video", "true");
  if (props?.autoplay) video.setAttribute("autoplay", "");
  if (props?.muted ?? true) video.setAttribute("muted", "");
  if (props?.loop ?? true) video.setAttribute("loop", "");
  if (props?.poster) video.setAttribute("poster", props.poster);

  video.className = "w-full aspect-video object-cover rounded-lg mb-4";
  set(video, "width", "100%");
  set(video, "max-width", "100%");
  set(video, "aspect-ratio", props?.aspectRatio || "16 / 9");
  set(video, "object-fit", props?.objectFit || "cover");
  set(video, "border-radius", props?.radius || "8px");
  set(video, "display", "block");
  return video;
}

/**
 * Creates a responsive YouTube embed wrapper configured for card layout.
 */
export function createCardYouTubeDom(props?: Partial<YouTubeProps>): HTMLElement {
  const videoId =
    props?.videoId || (props?.url ? extractYouTubeVideoId(props.url) : null) || "dQw4w9WgXcQ";
  const embedUrl = buildYouTubeEmbedUrl(videoId, {
    autoplay: props?.autoplay,
    muted: props?.muted,
    loop: props?.loop,
    controls: props?.controls,
  });

  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-xite-youtube", "true");
  wrapper.setAttribute("data-youtube-id", videoId);
  wrapper.className = "relative w-full aspect-video rounded-lg overflow-hidden mb-4";
  set(wrapper, "width", "100%");
  set(wrapper, "aspect-ratio", props?.aspectRatio || "16 / 9");
  set(wrapper, "border-radius", props?.radius || "8px");
  set(wrapper, "position", "relative");
  set(wrapper, "overflow", "hidden");

  const iframe = document.createElement("iframe");
  iframe.setAttribute("src", embedUrl);
  iframe.setAttribute("title", "YouTube video player");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute(
    "allow",
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
  );
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute("loading", "lazy");
  set(iframe, "position", "absolute");
  set(iframe, "inset", "0");
  set(iframe, "width", "100%");
  set(iframe, "height", "100%");
  set(iframe, "border", "0");
  set(iframe, "border-radius", props?.radius || "8px");

  wrapper.appendChild(iframe);
  return wrapper;
}

export type CardMediaPosition = "top" | "bottom" | "left" | "right";

/**
 * Configures a Card's layout structure:
 * - "vertical": Stacked elements (default)
 * - "horizontal-left": Small / compact split card (Media on Left, Content on Right)
 * - "horizontal-right": Small / compact split card (Media on Right, Content on Left)
 */
export function applyCardLayoutDom(
  card: HTMLElement,
  layout: CardLayout,
  mediaWidth: CardMediaWidth = "1/3",
  align: CardAlign = "center",
): void {
  const mediaEl = findCardMediaElement(card);
  const mediaWrapper = mediaEl
    ? (mediaEl.closest<HTMLElement>(".card-media, .image-wrapper, .media-slot, [data-xite-youtube]") || mediaEl)
    : null;

  if (layout === "vertical") {
    card.classList.remove(
      "flex-row",
      "flex-row-reverse",
      "sm:flex-row",
      "sm:flex-row-reverse",
    );
    card.classList.add("flex", "flex-col");
    set(card, "display", "flex");
    set(card, "flex-direction", "column");
    set(card, "align-items", align === "start" ? "flex-start" : align === "end" ? "flex-end" : "stretch");

    if (mediaWrapper) {
      mediaWrapper.classList.remove("sm:w-1/4", "sm:w-1/3", "sm:w-1/2", "sm:w-[130px]", "shrink-0");
      mediaWrapper.classList.add("w-full");
      set(mediaWrapper, "width", "100%");
      set(mediaWrapper, "max-width", "100%");
      set(mediaWrapper, "flex-shrink", "0");
      if (mediaEl && (mediaEl.tagName === "IMG" || mediaEl.tagName === "VIDEO")) {
        set(mediaEl, "aspect-ratio", "16 / 9");
      }
    }
    return;
  }

  // Horizontal layout (horizontal-left or horizontal-right)
  const isRight = layout === "horizontal-right";
  card.classList.remove("flex-col", "flex-col-reverse");
  card.classList.add("flex", "flex-col", "sm:flex-row", "gap-4");
  if (isRight) {
    card.classList.remove("sm:flex-row");
    card.classList.add("sm:flex-row-reverse");
  } else {
    card.classList.remove("sm:flex-row-reverse");
    card.classList.add("sm:flex-row");
  }

  set(card, "display", "flex");
  set(card, "flex-direction", isRight ? "row-reverse" : "row");
  set(card, "align-items", align === "start" ? "flex-start" : align === "end" ? "flex-end" : "center");
  set(card, "gap", "1rem");

  // Format media sizing
  if (mediaWrapper) {
    mediaWrapper.classList.remove("w-full", "sm:w-1/4", "sm:w-1/3", "sm:w-1/2", "sm:w-[130px]");
    mediaWrapper.classList.add("shrink-0");

    if (mediaWidth === "compact") {
      mediaWrapper.classList.add("w-full", "sm:w-[130px]");
      set(mediaWrapper, "width", "130px");
      set(mediaWrapper, "max-width", "130px");
      set(mediaWrapper, "flex-shrink", "0");
      if (mediaEl) {
        set(mediaEl, "aspect-ratio", "1 / 1");
        set(mediaEl, "object-fit", "cover");
      }
    } else if (mediaWidth === "1/4") {
      mediaWrapper.classList.add("w-full", "sm:w-1/4");
      set(mediaWrapper, "width", "25%");
      set(mediaWrapper, "flex-shrink", "0");
      if (mediaEl) {
        set(mediaEl, "aspect-ratio", "4 / 3");
        set(mediaEl, "object-fit", "cover");
      }
    } else if (mediaWidth === "1/2") {
      mediaWrapper.classList.add("w-full", "sm:w-1/2");
      set(mediaWrapper, "width", "50%");
      set(mediaWrapper, "flex-shrink", "0");
      if (mediaEl) {
        set(mediaEl, "aspect-ratio", "16 / 9");
        set(mediaEl, "object-fit", "cover");
      }
    } else {
      // 1/3 default
      mediaWrapper.classList.add("w-full", "sm:w-1/3");
      set(mediaWrapper, "width", "33.333%");
      set(mediaWrapper, "flex-shrink", "0");
      if (mediaEl) {
        set(mediaEl, "aspect-ratio", "4 / 3");
        set(mediaEl, "object-fit", "cover");
      }
    }
  }

  // Ensure content container exists so text doesn't fragment
  const contentWrapper = card.querySelector<HTMLElement>(".card-content");
  if (contentWrapper) {
    contentWrapper.classList.add("flex-1", "min-w-0");
    set(contentWrapper, "flex", "1 1 0%");
    set(contentWrapper, "min-width", "0");
  } else {
    // Gather all non-media child elements
    const nonMedia = Array.from(card.children).filter(
      (c) => c !== mediaWrapper && c !== mediaEl && !c.contains(mediaEl || c),
    ) as HTMLElement[];

    if (nonMedia.length > 0) {
      const contentDiv = document.createElement("div");
      contentDiv.className = "card-content flex-1 min-w-0 space-y-1";
      set(contentDiv, "flex", "1 1 0%");
      set(contentDiv, "min-width", "0");

      const ref = nonMedia[0];
      card.insertBefore(contentDiv, ref);
      for (const child of nonMedia) {
        contentDiv.appendChild(child);
      }
    }
  }
}

/**
 * Inserts or replaces an Image, Video, or YouTube embed inside a card element.
 * Supports compact split cards (left/right) and stacked cards (top/bottom).
 * Preserves the card's existing text, buttons, and layout structure.
 */
export function insertMediaIntoCardDom(
  card: HTMLElement,
  mediaType: "image" | "video" | "youtube",
  props?: Record<string, unknown>,
  position: CardMediaPosition = "top",
): HTMLElement {
  const existingMedia = findCardMediaElement(card);
  let newEl: HTMLElement;

  const isHorizontal = position === "left" || position === "right";

  if (mediaType === "video") {
    newEl = createCardVideoDom(props as Partial<VideoProps>);
  } else if (mediaType === "youtube") {
    newEl = createCardYouTubeDom(props as Partial<YouTubeProps>);
  } else {
    newEl = createCardImageDom(props as Partial<ImageProps>);
  }

  if (isHorizontal) {
    newEl.className = "w-full sm:w-[130px] shrink-0 aspect-square object-cover rounded-lg";
    set(newEl, "width", "130px");
    set(newEl, "aspect-ratio", "1 / 1");
    set(newEl, "object-fit", "cover");
  }

  if (existingMedia) {
    const wrapper = existingMedia.closest<HTMLElement>(
      ".image-wrapper, .video-wrapper, .youtube-wrapper, [data-xite-youtube]",
    );
    const targetToReplace = wrapper && wrapper !== card && card.contains(wrapper) ? wrapper : existingMedia;
    targetToReplace.replaceWith(newEl);
    if (isHorizontal) {
      applyCardLayoutDom(card, position === "right" ? "horizontal-right" : "horizontal-left", "compact");
    }
    return newEl;
  }

  if (isHorizontal) {
    if (card.firstChild) {
      card.insertBefore(newEl, card.firstChild);
    } else {
      card.appendChild(newEl);
    }
    applyCardLayoutDom(card, position === "right" ? "horizontal-right" : "horizontal-left", "compact");
    return newEl;
  }

  if (position === "bottom") {
    card.appendChild(newEl);
  } else {
    if (card.firstChild) {
      card.insertBefore(newEl, card.firstChild);
    } else {
      card.appendChild(newEl);
    }
  }

  return newEl;
}

/**
 * Removes any image, video, or YouTube embed currently inside the card.
 */
export function removeMediaFromCardDom(card: HTMLElement): boolean {
  const existingMedia = findCardMediaElement(card);
  if (!existingMedia) return false;

  const wrapper = existingMedia.closest<HTMLElement>(
    ".image-wrapper, .video-wrapper, .youtube-wrapper, [data-xite-youtube]",
  );
  const targetToRemove = wrapper && wrapper !== card && card.contains(wrapper) ? wrapper : existingMedia;
  targetToRemove.remove();

  // If card had horizontal layout and content wrapper, ensure content wrapper expands cleanly
  const contentWrapper = card.querySelector<HTMLElement>(".card-content");
  if (contentWrapper) {
    contentWrapper.classList.add("w-full");
    set(contentWrapper, "width", "100%");
  }

  return true;
}

/**
 * Inserts a child element (heading, text paragraph, or button) into a card.
 * If the card has a dedicated content container (.card-content), it appends inside it,
 * keeping horizontal split cards properly structured.
 */
export function insertChildIntoCardDom(
  card: HTMLElement,
  childType: "heading" | "text" | "button",
): HTMLElement {
  const contentContainer = card.querySelector<HTMLElement>(".card-content") || card;

  let newEl: HTMLElement;
  if (childType === "heading") {
    newEl = document.createElement("h3");
    newEl.className = "text-lg font-bold text-slate-900 tracking-tight mb-1";
    newEl.textContent = "New Heading";
  } else if (childType === "button") {
    newEl = document.createElement("a");
    newEl.setAttribute("href", "#");
    newEl.setAttribute("data-xite-variant", "solid");
    newEl.className =
      "inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs shadow-xs hover:bg-blue-700 transition";
    newEl.textContent = "Learn More";
  } else {
    newEl = document.createElement("p");
    newEl.className = "text-sm text-slate-600 leading-relaxed mb-2";
    newEl.textContent = "Add your description or supporting details here.";
  }

  contentContainer.appendChild(newEl);
  return newEl;
}

export const ELEMENT_TYPE_LABEL: Record<ElementType, string> = {
  section: "Section",
  container: "Container",
  card: "Card",
  heading: "Heading",
  text: "Text",
  button: "Button",
  image: "Image",
  video: "Video",
  youtube: "YouTube",
  icon: "Icon",
  logo: "Logo",
  plus: "Add Media",
  generic: "Element",
};

