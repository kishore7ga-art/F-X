/**
 * What a section's markup actually contains.
 *
 * ── The requirement this answers ───────────────────────────────────────────
 *
 * §17 of the brief: *do not build the system around `hero`, `about`,
 * `services`, `footer`*. The editor has to work for sections an administrator
 * publishes after this code ships, whose category may be `custom` and whose
 * markup nobody here has seen.
 *
 * That rules out a per-category table of "the hero's heading is `h1.title`".
 * It also rules out the opposite mistake — showing every control for every
 * section — because §11 is explicit that only controls the section *supports*
 * may appear, and a "Card background" field on a section with no cards is a
 * placeholder button by another name.
 *
 * So the toolbar is built from **what the markup has**. A section with three
 * repeated cards gets card controls whether it is filed as `services`,
 * `courses`, `facilities` or `custom`; a section with no images gets no image
 * controls. The section's category then supplies *labels and ordering* only —
 * "Service cards" instead of "Cards" — which is the part it can be wrong about
 * without breaking anything.
 *
 * ── Identity across edits ──────────────────────────────────────────────────
 *
 * Elements are addressed by **path**: the chain of element-child indices from
 * the section's outermost node. The schema is rebuilt from the section's
 * current code every time it renders, so a path is always resolved against the
 * markup it was computed from. A path that no longer resolves — because a card
 * was deleted between render and click — yields no target, and the control does
 * nothing rather than editing whatever now sits at that index.
 */

import {
  childElements,
  descendants,
  getAttribute,
  parseHtml,
  textContent,
  type ElementNode,
} from "./html-dom";

/** Element-child indices from the body root down to an element. */
export type ElementPath = readonly number[];

export type ProbedElement = {
  path: ElementPath;
  node: ElementNode;
  /** Collapsed text, for labelling the control in the panel. */
  text: string;
};

export type RepeaterKind = "cards" | "images" | "links" | "fields";

export type ProbedRepeater = {
  kind: RepeaterKind;
  container: ProbedElement;
  items: ProbedElement[];
};

export type SectionProbe = {
  /** The markup the paths were computed against. */
  body: string;
  root: ElementNode;
  /** The section's outermost element(s). Usually exactly one. */
  roots: ProbedElement[];
  headings: ProbedElement[];
  paragraphs: ProbedElement[];
  /** Every image that is not the logo. */
  images: ProbedElement[];
  logo: ProbedElement | null;
  /** Links styled as buttons, or real `<button>` elements. */
  actions: ProbedElement[];
  /** Links inside a navigation structure. */
  navLinks: ProbedElement[];
  /** The element holding the navigation links, when there is one. */
  navContainer: ProbedElement | null;
  socials: ProbedElement[];
  /** Contact links — `mailto:` and `tel:`. */
  contacts: ProbedElement[];
  fields: ProbedElement[];
  /** Grid or flex containers with more than one child, largest first. */
  tracks: ProbedElement[];
  repeaters: ProbedRepeater[];
};

/* ── Paths ──────────────────────────────────────────────────────────────── */

export function resolvePath(root: ElementNode, path: ElementPath): ElementNode | null {
  let current: ElementNode | null = root;
  for (const index of path) {
    if (!current) return null;
    const children = childElements(current);
    current = children[index] ?? null;
  }
  return current;
}

export function samePath(a: ElementPath, b: ElementPath): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function pathKey(path: ElementPath): string {
  return path.join(".");
}

/** Whether `inner` is at or below `outer`. */
function isUnder(inner: ElementPath, outer: ElementPath): boolean {
  return inner.length >= outer.length && outer.every((value, index) => inner[index] === value);
}

/* ── Classification helpers ─────────────────────────────────────────────── */

const BUTTON_CLASS = /(^|[\s_-])(btn|button|cta|apply|action)([\s_-]|$)/i;
const NAV_CLASS = /(nav|menu|links)/i;
const LOGO_HINT = /logo|brand|crest|wordmark|emblem/i;
const SOCIAL_HOST =
  /facebook|twitter|x\.com|instagram|linkedin|youtube|youtu\.be|whatsapp|telegram|threads|tiktok|pinterest|github/i;
const FIELD_TAGS = new Set(["input", "select", "textarea"]);
const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

function style(node: ElementNode): string {
  return (getAttribute(node, "style") || "").toLowerCase();
}

function classes(node: ElementNode): string {
  return (getAttribute(node, "class") || "").toLowerCase();
}

/**
 * Whether a link is dressed as a button.
 *
 * Two independent tests, because the library does it both ways. Half the
 * sections use a class — `.btn`, `.prog-cta`, `.desktop-apply-btn` — and half
 * write the button inline, which is what the platform's own hero does:
 * `<a href="#admissions" style="background:#ef4444;…;border-radius:12px;…">`.
 * A class-only test finds none of the second kind, and an inline-only test
 * finds none of the first.
 */
function looksLikeButton(node: ElementNode): boolean {
  if (node.tag === "button") return true;
  if (node.tag !== "a") return false;
  if (BUTTON_CLASS.test(classes(node))) return true;
  const css = style(node);
  const padded = /padding\s*:/.test(css);
  const filled = /background(-color)?\s*:/.test(css) || /border\s*:/.test(css);
  const rounded = /border-radius\s*:/.test(css);
  return padded && (filled || rounded);
}

function isInsideNav(node: ElementNode): boolean {
  let current: ElementNode | null = node.parent;
  while (current) {
    if (current.tag === "nav") return true;
    if (NAV_CLASS.test(classes(current))) return true;
    current = current.parent;
  }
  return false;
}

function isInsideHeaderOrFooter(node: ElementNode): boolean {
  let current: ElementNode | null = node.parent;
  while (current) {
    if (current.tag === "header" || current.tag === "footer") return true;
    current = current.parent;
  }
  return false;
}

function looksLikeLogo(node: ElementNode, source: string): boolean {
  if (getAttribute(node, "data-logo") === "true") return true;
  const hint = `${classes(node)} ${(getAttribute(node, "alt") || "").toLowerCase()} ${(getAttribute(node, "id") || "").toLowerCase()}`;
  if (LOGO_HINT.test(hint)) return true;
  // The first image inside a header, before any heading, is the logo by
  // position even when nobody labelled it as one.
  if (!isInsideHeaderOrFooter(node)) return false;
  return textContent(source, node.parent ?? node).length < 60;
}

function isTrack(node: ElementNode): boolean {
  const css = style(node);
  if (/display\s*:\s*(grid|inline-grid|flex|inline-flex)/.test(css)) return true;
  if (/grid-template-columns\s*:/.test(css)) return true;
  // A class-driven grid, which is the other half of the library. The class name
  // is the only evidence available without a layout engine.
  return /(grid|row|columns|cards|flex)/i.test(classes(node)) && childElements(node).length > 1;
}

/* ── Repeaters ──────────────────────────────────────────────────────────── */

/**
 * The signature two siblings share when they are the same *kind* of thing.
 *
 * Tag plus class list. Not structure: cards in this library differ in whether
 * they carry an image or a badge, and a structural signature would file the
 * one card with a "Popular" ribbon as a different kind and refuse to let the
 * person delete it.
 */
function signature(node: ElementNode): string {
  return `${node.tag}|${(getAttribute(node, "class") || "").trim().split(/\s+/).sort().join(" ")}`;
}

function classifyRepeater(source: string, items: ElementNode[]): RepeaterKind {
  const contents = items.map((item) => ({
    text: textContent(source, item),
    images: descendants(item).filter((node) => node.tag === "img").length + (item.tag === "img" ? 1 : 0),
    fields: descendants(item).filter((node) => FIELD_TAGS.has(node.tag)).length + (FIELD_TAGS.has(item.tag) ? 1 : 0),
    headings: descendants(item).filter((node) => HEADING_TAGS.has(node.tag)).length,
    links: descendants(item).filter((node) => node.tag === "a").length + (item.tag === "a" ? 1 : 0),
  }));

  if (contents.every((item) => item.fields > 0)) return "fields";
  if (contents.every((item) => item.images > 0 && item.text.length < 80 && item.headings === 0)) return "images";
  if (contents.every((item) => item.headings === 0 && item.images === 0 && item.text.length < 60 && item.links > 0)) {
    return "links";
  }
  return "cards";
}

/**
 * Repeated sibling groups, which is what a "card list" or a "gallery" is.
 *
 * Detected rather than declared, so a Services section from the library, a
 * Courses section an administrator writes next month and a `custom` section
 * with a row of three boxes all get add / duplicate / delete / reorder — with
 * no entry anywhere naming any of them.
 *
 * Two-thirds is the threshold for "these siblings are a list": a grid of four
 * cards where one carries an extra class is still a grid of four cards, and a
 * wrapper holding a heading plus one card is not a list at all.
 */
function findRepeaters(source: string, root: ElementNode, pathOf: Map<ElementNode, ElementPath>): ProbedRepeater[] {
  const found: ProbedRepeater[] = [];

  const consider = (container: ElementNode) => {
    const children = childElements(container);
    if (children.length < 2) return;

    const groups = new Map<string, ElementNode[]>();
    children.forEach((child) => {
      const key = signature(child);
      groups.set(key, [...(groups.get(key) ?? []), child]);
    });

    let best: ElementNode[] = [];
    groups.forEach((group) => {
      if (group.length > best.length) best = group;
    });

    if (best.length < 2) return;
    if (best.length * 3 < children.length * 2) return;
    // Two empty wrappers are not a list of anything.
    if (best.every((item) => textContent(source, item).length === 0 && descendants(item).length === 0)) return;

    found.push({
      kind: classifyRepeater(source, best),
      container: probed(container, pathOf, source),
      items: best.map((item) => probed(item, pathOf, source)),
    });
  };

  consider(root);
  descendants(root).forEach(consider);

  // Nested lists are noise: a grid of cards whose every card holds a two-item
  // feature list would otherwise contribute one control group per card. The
  // outermost list wins, and the card's own contents are edited through the
  // card's controls.
  const ordered = [...found].sort((a, b) => a.container.path.length - b.container.path.length);
  const kept: ProbedRepeater[] = [];
  ordered.forEach((candidate) => {
    const nested = kept.some((existing) => isUnder(candidate.container.path, existing.container.path));
    if (!nested) kept.push(candidate);
  });

  return kept.slice(0, 4);
}

function probed(node: ElementNode, pathOf: Map<ElementNode, ElementPath>, source: string): ProbedElement {
  return { path: pathOf.get(node) ?? [], node, text: textContent(source, node) };
}

/* ── The probe ──────────────────────────────────────────────────────────── */

/**
 * Reads a section's body markup and reports what it can be edited with.
 *
 * `body` is the markup with `<style>` and `<link>` already lifted out — what
 * `splitSectionCode` returns — so nothing here has to know that a section's
 * stylesheet lives in the same string.
 */
export function probeSection(body: string): SectionProbe {
  const source = body || "";
  const root = parseHtml(source);

  const pathOf = new Map<ElementNode, ElementPath>();
  const walk = (node: ElementNode, prefix: ElementPath) => {
    childElements(node).forEach((child, index) => {
      const path = [...prefix, index];
      pathOf.set(child, path);
      walk(child, path);
    });
  };
  walk(root, []);

  const all = descendants(root);
  const at = (node: ElementNode) => probed(node, pathOf, source);

  const rawImages = all.filter((node) => node.tag === "img");
  const logoNode = rawImages.find((node) => looksLikeLogo(node, source)) ?? null;

  const links = all.filter((node) => node.tag === "a");
  const actions = all.filter(looksLikeButton);
  const socials = links.filter((node) => {
    const href = getAttribute(node, "href") || "";
    if (SOCIAL_HOST.test(href)) return true;
    // An icon-only link with no text is a social link in every section that
    // has one; there is nothing else it could be.
    return textContent(source, node).length === 0 && descendants(node).some((child) => child.tag === "svg" || child.tag === "i");
  });
  const contacts = links.filter((node) => /^(mailto:|tel:)/i.test(getAttribute(node, "href") || ""));

  const navLinks = links.filter(
    (node) => isInsideNav(node) && !looksLikeButton(node) && !socials.includes(node) && !contacts.includes(node),
  );
  const navContainer = navLinks[0]
    ? (() => {
        // The nearest ancestor that holds more than one of the nav links, so
        // "navigation spacing" reaches the row rather than one item's wrapper.
        let current: ElementNode | null = navLinks[0].parent;
        while (current) {
          const inside = navLinks.filter((link) => {
            let walker: ElementNode | null = link;
            while (walker) {
              if (walker === current) return true;
              walker = walker.parent;
            }
            return false;
          });
          if (inside.length > 1) return at(current);
          current = current.parent;
        }
        return null;
      })()
    : null;

  /**
   * A row of buttons is not a list, and neither is a navigation bar.
   *
   * Two sibling links with matching markup satisfy every structural test for a
   * repeated group — which is correct, and unhelpful: the platform's own hero
   * ends in `<a>Apply Now</a><a>Explore Programs</a>`, and reporting that as a
   * two-item list would file both buttons under "Items" and leave the Buttons
   * group empty on the one section everybody edits first. The same is true of a
   * header's `<li><a>` navigation, which already has its own group.
   *
   * So a group is dropped when every item is *nothing but* one link that some
   * other group already owns. An item carrying a heading, an image or a
   * paragraph is a card whatever its link does, and stays.
   */
  const ownedElsewhere = new Set<ElementNode>([...actions, ...navLinks]);
  const coveredByAnotherGroup = (item: ElementNode): boolean => {
    const inside = [item, ...descendants(item)];
    if (inside.some((node) => HEADING_TAGS.has(node.tag) || node.tag === "img" || node.tag === "p")) return false;
    const interactive = inside.filter((node) => node.tag === "a" || node.tag === "button");
    return interactive.length === 1 && ownedElsewhere.has(interactive[0]!);
  };

  const tracks = all
    .filter(isTrack)
    .sort((a, b) => childElements(b).length - childElements(a).length)
    .slice(0, 3);

  return {
    body: source,
    root,
    roots: childElements(root).map(at),
    headings: all.filter((node) => HEADING_TAGS.has(node.tag)).map(at),
    paragraphs: all
      .filter((node) => (node.tag === "p" || node.tag === "small") && textContent(source, node).length > 0)
      .map(at),
    images: rawImages.filter((node) => node !== logoNode).map(at),
    logo: logoNode ? at(logoNode) : null,
    actions: actions.map(at),
    navLinks: navLinks.map(at),
    navContainer,
    socials: socials.map(at),
    contacts: contacts.map(at),
    fields: all.filter((node) => FIELD_TAGS.has(node.tag)).map(at),
    tracks: tracks.map(at),
    repeaters: findRepeaters(source, root, pathOf).filter(
      (repeater) => !repeater.items.every((item) => coveredByAnotherGroup(item.node)),
    ),
  };
}
