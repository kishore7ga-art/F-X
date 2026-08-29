/**
 * A source-preserving HTML reader for section markup.
 *
 * ── Why this exists at all ─────────────────────────────────────────────────
 *
 * A section in this platform is not a configuration object. It is a string of
 * hand-authored HTML, rendered with `dangerouslySetInnerHTML`, and the design
 * *is* the string — see SECTION-ARCHITECTURE.md §1. So a toolbar control that
 * says "heading size" has nothing to set but that string.
 *
 * Three properties are non-negotiable for that job:
 *
 *  1. **It must run in Node.** `DOMParser` is browser-only and this repository
 *     has no jsdom; the unit tests run under `tsx --test`. An edit pipeline
 *     that can only be exercised in a browser is an edit pipeline nobody tests.
 *
 *  2. **It must not reformat what it did not touch.** Parsing to a DOM and
 *     serialising back rewrites attribute order, quoting and whitespace across
 *     the *whole* section, so changing one font size would produce a diff
 *     touching every line — and would push an undo entry and an autosave for
 *     markup nobody edited. That is the same failure the inline text editor had
 *     and fixed by debouncing on real input.
 *
 *  3. **It must survive the round trip.** Whatever it writes goes through
 *     `recomposeSectionCode`, the backend's `sanitizeSectionHtml`, and back.
 *
 * So: parse to a tree that remembers **source offsets**, and express every edit
 * as a splice on the original string. Untouched bytes stay untouched, byte for
 * byte, and the tests run anywhere.
 *
 * ── What it is not ─────────────────────────────────────────────────────────
 *
 * Not a spec-compliant HTML5 tree builder. It does not do foster parenting, it
 * does not reconstruct active formatting elements, and it does not care about
 * `<template>` contents. It handles void elements, raw-text elements, comments,
 * and the implied end tags that actually occur in section markup (`<li>`,
 * `<p>`, table cells, `<option>`). Section markup is authored HTML from a
 * template library, not adversarial input — and anything genuinely malformed
 * degrades to "this control finds no target", never to corrupted markup,
 * because every edit is a splice at an offset the parser produced.
 */

/* ── The tree ───────────────────────────────────────────────────────────── */

export type HtmlAttr = {
  /** Lower-cased, as the HTML parser treats attribute names. */
  name: string;
  value: string;
  /** `[start, end)` of the whole `name="value"` run in the source. */
  start: number;
  end: number;
  /** `[start, end)` of the value *inside* its quotes. Equal when valueless. */
  valueStart: number;
  valueEnd: number;
  /** A double quote, a single quote, or empty for unquoted/valueless. */
  quote: string;
};

export type ElementNode = {
  type: "element";
  /** Lower-cased tag name. `#root` for the synthetic document node. */
  tag: string;
  attrs: HtmlAttr[];
  /** `[start, end)` of the element including both tags. */
  start: number;
  end: number;
  /** Offset just past the closing angle bracket of the opening tag. */
  openEnd: number;
  /** Offset of the opening angle bracket of the closing tag, or `end`. */
  closeStart: number;
  selfClosing: boolean;
  children: HtmlNode[];
  parent: ElementNode | null;
};

export type TextNode = { type: "text"; start: number; end: number; parent: ElementNode | null };
export type CommentNode = { type: "comment"; start: number; end: number; parent: ElementNode | null };

export type HtmlNode = ElementNode | TextNode | CommentNode;

/** Elements with no closing tag. */
const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

/** Elements whose content is text, not markup. An angle bracket there is data. */
const RAW_TEXT_TAGS = new Set(["script", "style", "textarea", "title"]);

/**
 * Implied end tags, restricted to the ones that occur in real section markup.
 *
 * The library is full of list items closed by the next list item, and of
 * paragraphs closed by the next block element rather than by an end tag.
 * Without these an entire section nests itself into one deep spine and every
 * "the third card" lookup returns the wrong element.
 */
const P_CLOSERS = new Set([
  "address", "article", "aside", "blockquote", "details", "div", "dl",
  "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3",
  "h4", "h5", "h6", "header", "hgroup", "hr", "main", "menu", "nav", "ol",
  "p", "pre", "section", "table", "ul",
]);

/** An opening tag mapped to the open tags it implicitly closes. */
const IMPLIED_END: Record<string, ReadonlySet<string>> = {
  li: new Set(["li"]),
  dt: new Set(["dt", "dd"]),
  dd: new Set(["dt", "dd"]),
  option: new Set(["option"]),
  optgroup: new Set(["option", "optgroup"]),
  td: new Set(["td", "th"]),
  th: new Set(["td", "th"]),
  tr: new Set(["td", "th", "tr"]),
  thead: new Set(["td", "th", "tr"]),
  tbody: new Set(["td", "th", "tr", "thead"]),
  tfoot: new Set(["td", "th", "tr", "thead", "tbody"]),
};

const NAME_START = /[a-zA-Z]/;
const isWhitespace = (ch: string) =>
  ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\f";

/**
 * Parses markup into a tree of nodes carrying source offsets.
 *
 * The returned root is synthetic: its tag is `#root`, and its inner range is
 * the whole string, so the same edit helpers work on it as on any element.
 */
export function parseHtml(html: string): ElementNode {
  const source = html || "";
  const root: ElementNode = {
    type: "element",
    tag: "#root",
    attrs: [],
    start: 0,
    end: source.length,
    openEnd: 0,
    closeStart: source.length,
    selfClosing: false,
    children: [],
    parent: null,
  };

  const stack: ElementNode[] = [root];
  const top = () => stack[stack.length - 1]!;
  let index = 0;
  let textStart = 0;

  const flushText = (upTo: number) => {
    if (upTo <= textStart) return;
    const parent = top();
    parent.children.push({ type: "text", start: textStart, end: upTo, parent });
  };

  /** Closes a node at an offset, and everything left open inside it. */
  const closeThrough = (node: ElementNode, closeStart: number, end: number) => {
    while (stack.length > 1) {
      const current = stack.pop()!;
      if (current === node) {
        current.closeStart = closeStart;
        current.end = end;
        return;
      }
      // An element left open inside the one being closed. It ends where its
      // parent's content does, which is the only defensible answer.
      current.closeStart = closeStart;
      current.end = closeStart;
    }
  };

  while (index < source.length) {
    const lt = source.indexOf("<", index);
    if (lt < 0) break;

    // An angle bracket that begins nothing is literal text, as in "a < b".
    const next = source[lt + 1];
    const isTagStart =
      next !== undefined &&
      (NAME_START.test(next) || next === "/" || next === "!" || next === "?");
    if (!isTagStart) {
      index = lt + 1;
      continue;
    }

    if (source.startsWith("<!--", lt)) {
      const close = source.indexOf("-->", lt + 4);
      const end = close < 0 ? source.length : close + 3;
      flushText(lt);
      const parent = top();
      parent.children.push({ type: "comment", start: lt, end, parent });
      index = end;
      textStart = end;
      continue;
    }

    // Doctype, CDATA, processing instruction — kept verbatim as a comment node
    // so nothing downstream tries to interpret it.
    if (next === "!" || next === "?") {
      const close = source.indexOf(">", lt);
      const end = close < 0 ? source.length : close + 1;
      flushText(lt);
      const parent = top();
      parent.children.push({ type: "comment", start: lt, end, parent });
      index = end;
      textStart = end;
      continue;
    }

    if (next === "/") {
      const nameEnd = readTagName(source, lt + 2);
      const tag = source.slice(lt + 2, nameEnd).toLowerCase();
      const close = source.indexOf(">", nameEnd);
      const end = close < 0 ? source.length : close + 1;

      // The **innermost** matching open element, which is why this searches the
      // stack from the top down. Searching from the bottom finds the outermost
      // one, and in markup as ordinarily nested as a card inside a grid inside
      // a section that means the first `</div>` closes the grid: every card
      // after it becomes a sibling of the grid rather than a child, and the
      // repeater detection that makes card controls exist sees one card where
      // there are three.
      //
      // A closing tag for something that was never opened is dropped, the way a
      // browser drops it. Letting it close the nearest ancestor instead is how
      // one stray end tag truncates half a section.
      const open = [...stack].reverse().find((node) => node.tag === tag && node !== root);
      if (open) {
        flushText(lt);
        closeThrough(open, lt, end);
      }
      index = end;
      textStart = end;
      continue;
    }

    const nameEnd = readTagName(source, lt + 1);
    if (nameEnd === lt + 1) {
      index = lt + 1;
      continue;
    }
    const tag = source.slice(lt + 1, nameEnd).toLowerCase();
    const parsed = readAttributes(source, nameEnd);
    flushText(lt);

    // Implied end tags, before the new element is attached to a parent.
    const implied = IMPLIED_END[tag];
    if (implied) {
      const victim = stack.slice(1).reverse().find((node) => implied.has(node.tag));
      if (victim) closeThrough(victim, lt, lt);
    } else if (P_CLOSERS.has(tag)) {
      const openP = stack.slice(1).reverse().find((node) => node.tag === "p");
      // Only when the paragraph is still the innermost open element. Closing
      // one across an open inline element invents a shape nobody wrote.
      if (openP && top() === openP) closeThrough(openP, lt, lt);
    }

    const parent = top();
    const node: ElementNode = {
      type: "element",
      tag,
      attrs: parsed.attrs,
      start: lt,
      end: parsed.end,
      openEnd: parsed.end,
      closeStart: parsed.end,
      selfClosing: parsed.selfClosing,
      children: [],
      parent,
    };
    parent.children.push(node);

    if (VOID_TAGS.has(tag) || parsed.selfClosing) {
      index = parsed.end;
      textStart = parsed.end;
      continue;
    }

    if (RAW_TEXT_TAGS.has(tag)) {
      // Angle brackets inside a stylesheet are not markup, and a section's CSS
      // is full of child combinators.
      const closer = new RegExp(`</${tag}\\s*>`, "i");
      const rest = source.slice(parsed.end);
      const match = closer.exec(rest);
      const contentEnd = match ? parsed.end + match.index : source.length;
      const end = match ? contentEnd + match[0].length : source.length;
      if (contentEnd > parsed.end) {
        node.children.push({ type: "text", start: parsed.end, end: contentEnd, parent: node });
      }
      node.closeStart = contentEnd;
      node.end = end;
      index = end;
      textStart = end;
      continue;
    }

    stack.push(node);
    index = parsed.end;
    textStart = parsed.end;
  }

  flushText(source.length);
  // Anything still open ends with the document.
  while (stack.length > 1) {
    const current = stack.pop()!;
    current.closeStart = source.length;
    current.end = source.length;
  }

  return root;
}

function readTagName(source: string, from: number): number {
  let index = from;
  while (index < source.length) {
    const ch = source[index]!;
    if (isWhitespace(ch) || ch === ">" || ch === "/") break;
    index += 1;
  }
  return index;
}

function readAttributes(
  source: string,
  from: number,
): { attrs: HtmlAttr[]; end: number; selfClosing: boolean } {
  const attrs: HtmlAttr[] = [];
  let index = from;
  let selfClosing = false;

  while (index < source.length) {
    while (index < source.length && isWhitespace(source[index]!)) index += 1;
    const ch = source[index];
    if (ch === undefined) break;

    if (ch === ">") {
      index += 1;
      break;
    }
    if (ch === "/" && source[index + 1] === ">") {
      selfClosing = true;
      index += 2;
      break;
    }
    // A lone slash between attributes. Skipped rather than treated as a name
    // character, which is the parse that makes the attribute after it real.
    if (ch === "/") {
      index += 1;
      continue;
    }

    const nameStart = index;
    while (index < source.length) {
      const c = source[index]!;
      if (isWhitespace(c) || c === "=" || c === ">" || c === "/") break;
      index += 1;
    }
    if (index === nameStart) {
      index += 1;
      continue;
    }
    const name = source.slice(nameStart, index).toLowerCase();

    let cursor = index;
    while (cursor < source.length && isWhitespace(source[cursor]!)) cursor += 1;

    if (source[cursor] !== "=") {
      attrs.push({
        name,
        value: "",
        start: nameStart,
        end: index,
        valueStart: index,
        valueEnd: index,
        quote: "",
      });
      continue;
    }

    cursor += 1;
    while (cursor < source.length && isWhitespace(source[cursor]!)) cursor += 1;

    const quote = source[cursor];
    if (quote === '"' || quote === "'") {
      const close = source.indexOf(quote, cursor + 1);
      const valueEnd = close < 0 ? source.length : close;
      attrs.push({
        name,
        value: source.slice(cursor + 1, valueEnd),
        start: nameStart,
        end: close < 0 ? source.length : close + 1,
        valueStart: cursor + 1,
        valueEnd,
        quote,
      });
      index = close < 0 ? source.length : close + 1;
      continue;
    }

    const valueStart = cursor;
    while (cursor < source.length) {
      const c = source[cursor]!;
      if (isWhitespace(c) || c === ">") break;
      cursor += 1;
    }
    attrs.push({
      name,
      value: source.slice(valueStart, cursor),
      start: nameStart,
      end: cursor,
      valueStart,
      valueEnd: cursor,
      quote: "",
    });
    index = cursor;
  }

  return { attrs, end: index, selfClosing };
}

/* ── Reading ────────────────────────────────────────────────────────────── */

export function getAttribute(node: ElementNode, name: string): string | null {
  const attr = node.attrs.find((candidate) => candidate.name === name.toLowerCase());
  return attr ? decodeEntities(attr.value) : null;
}

export function hasClass(node: ElementNode, className: string): boolean {
  const value = getAttribute(node, "class");
  if (!value) return false;
  return value.split(/\s+/).includes(className);
}

/** Every element in the subtree, in document order, excluding the root itself. */
export function descendants(root: ElementNode): ElementNode[] {
  const out: ElementNode[] = [];
  const walk = (node: ElementNode) => {
    node.children.forEach((child) => {
      if (child.type !== "element") return;
      out.push(child);
      walk(child);
    });
  };
  walk(root);
  return out;
}

/** The element children of a node, in order. */
export function childElements(node: ElementNode): ElementNode[] {
  return node.children.filter((child): child is ElementNode => child.type === "element");
}

/**
 * The visible text of an element, entity-decoded and whitespace-collapsed.
 *
 * Script and style elements contribute nothing — their text is code, and a
 * "heading" control that offered a stylesheet for editing would be absurd.
 */
export function textContent(source: string, node: ElementNode): string {
  let out = "";
  const walk = (current: ElementNode) => {
    current.children.forEach((child) => {
      if (child.type === "text") out += source.slice(child.start, child.end);
      else if (child.type === "element" && !RAW_TEXT_TAGS.has(child.tag)) walk(child);
    });
  };
  walk(node);
  return decodeEntities(out).replace(/\s+/g, " ").trim();
}

/** The element's markup, opening tag to closing tag. */
export function outerHtml(source: string, node: ElementNode): string {
  return source.slice(node.start, node.end);
}

/** What sits between the element's tags. */
export function innerHtml(source: string, node: ElementNode): string {
  return source.slice(node.openEnd, node.closeStart);
}

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  copy: "©", reg: "®", trade: "™", hellip: "…",
  mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘",
  ldquo: "“", rdquo: "”", times: "×", middot: "·",
};

export function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z][a-z0-9]*);/gi, (full, body: string) => {
    if (body[0] === "#") {
      const code =
        body[1] === "x" || body[1] === "X"
          ? Number.parseInt(body.slice(2), 16)
          : Number.parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 ? String.fromCodePoint(code) : full;
    }
    return ENTITIES[body.toLowerCase()] ?? full;
  });
}

/**
 * Text made safe to put back into markup.
 *
 * Ampersand and both angle brackets only. Quotes are left alone because this
 * escapes *text content*, never an attribute value — `escapeAttribute` does
 * that — and turning every apostrophe in a tenant's copy into a numeric entity
 * is a diff nobody asked for.
 */
export function escapeText(value: string): string {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escapeAttribute(value: string): string {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/* ── Editing ────────────────────────────────────────────────────────────── */

/** A replacement of a source range with new text. The only kind of change made. */
export type Edit = { start: number; end: number; text: string };

/**
 * Applies edits to the source, right to left.
 *
 * Right to left so that each splice's offsets are still valid when it runs.
 * Overlapping edits are a programming error — two controls fighting over one
 * range — and throwing is far better than silently producing torn markup that
 * then gets saved.
 */
export function applyEdits(source: string, edits: readonly Edit[]): string {
  if (edits.length === 0) return source;

  const ordered = [...edits].sort((a, b) => b.start - a.start || b.end - a.end);
  let out = source;
  let lastStart = Number.POSITIVE_INFINITY;

  for (const edit of ordered) {
    if (edit.end > lastStart) {
      throw new Error(
        `overlapping section edits: [${edit.start}, ${edit.end}) runs into a later edit at ${lastStart}`,
      );
    }
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
    lastStart = edit.start;
  }
  return out;
}

/** Sets or adds an attribute. Returns the splice, or null when nothing changes. */
export function setAttributeEdit(node: ElementNode, name: string, value: string): Edit | null {
  const lower = name.toLowerCase();
  const existing = node.attrs.find((attr) => attr.name === lower);
  const encoded = escapeAttribute(value);

  if (existing) {
    if (existing.quote === '"' && existing.value === encoded) return null;
    return { start: existing.start, end: existing.end, text: `${lower}="${encoded}"` };
  }

  // After the tag name, before whatever follows — which keeps the author's own
  // attribute order and their formatting of it intact.
  const insertAt = node.attrs.length > 0 ? node.attrs[0]!.start : tagNameEnd(node);
  const prefix = node.attrs.length > 0 ? "" : " ";
  const suffix = node.attrs.length > 0 ? " " : "";
  return { start: insertAt, end: insertAt, text: `${prefix}${lower}="${encoded}"${suffix}` };
}

export function removeAttributeEdit(node: ElementNode, name: string): Edit | null {
  const lower = name.toLowerCase();
  const existing = node.attrs.find((attr) => attr.name === lower);
  if (!existing) return null;
  // Swallow one leading space so removing an attribute does not leave a gap.
  const start = existing.start > 0 ? existing.start - 1 : existing.start;
  return { start, end: existing.end, text: "" };
}

function tagNameEnd(node: ElementNode): number {
  return node.start + 1 + node.tag.length;
}

/** Replaces what is between the element's tags. */
export function setInnerHtmlEdit(node: ElementNode, html: string): Edit {
  return { start: node.openEnd, end: node.closeStart, text: html };
}

/** Replaces the element's text, escaping it. */
export function setTextEdit(node: ElementNode, text: string): Edit {
  return setInnerHtmlEdit(node, escapeText(text));
}

/** Removes the element and the whitespace run in front of it. */
export function removeNodeEdit(source: string, node: ElementNode): Edit {
  let start = node.start;
  while (start > 0 && isWhitespace(source[start - 1]!)) start -= 1;
  return { start, end: node.end, text: "" };
}

/** Inserts markup directly after the element, matching its indentation. */
export function insertAfterEdit(source: string, node: ElementNode, html: string): Edit {
  return { start: node.end, end: node.end, text: `\n${indentOf(source, node)}${html}` };
}

/** Inserts markup as the element's last child. */
export function appendChildEdit(source: string, node: ElementNode, html: string): Edit {
  const inner = source.slice(node.openEnd, node.closeStart);
  const trailing = /\s*$/.exec(inner)?.[0] ?? "";
  const at = node.closeStart - trailing.length;
  return { start: at, end: at, text: `\n  ${html}` };
}

function indentOf(source: string, node: ElementNode): string {
  const lineStart = source.lastIndexOf("\n", node.start - 1) + 1;
  const run = source.slice(lineStart, node.start);
  return /^\s*$/.test(run) ? run : "";
}
