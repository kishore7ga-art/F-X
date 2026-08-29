/**
 * The slice of CSS selector syntax the section toolbar targets elements with.
 *
 * Deliberately small. Every selector in this system is written by us, in
 * `section-schema.ts`, against markup shapes we probe for first — so the
 * question is not "what can CSS express" but "what does a control need to say
 * to find its element". That turns out to be: a tag, a class, an id, an
 * attribute, a descendant, a child, and a comma between alternatives.
 *
 * The browser's own `querySelectorAll` is not an option here for the same
 * reason `html-dom.ts` exists: this runs in Node under `tsx --test`, and an
 * edit pipeline that can only be exercised in a browser is one nobody tests.
 *
 * Anything unsupported is a **parse failure that matches nothing**, never a
 * silent partial match. A control whose selector quietly matched the wrong
 * element would edit the wrong part of somebody's website.
 */

import { descendants, getAttribute, type ElementNode } from "./html-dom";

type AttrTest = {
  name: string;
  /** `=` exact, `~=` word, `*=` substring, `^=` prefix, `$=` suffix, `` presence. */
  op: "" | "=" | "~=" | "*=" | "^=" | "$=";
  value: string;
};

type Compound = {
  /** Lower-cased tag name, or null for `*` and for a bare class/attribute. */
  tag: string | null;
  classes: string[];
  id: string | null;
  attrs: AttrTest[];
};

type Step = { combinator: " " | ">"; compound: Compound };

/** One comma-separated alternative: a list of steps, outermost first. */
type Sequence = Step[];

const COMPOUND = /^(\*|[a-zA-Z][\w-]*)?((?:[.#][\w-]+|\[[^\]]*\])*)$/;
const SIMPLE = /[.#][\w-]+|\[[^\]]*\]/g;
const ATTR = /^\[\s*([\w-]+)\s*(?:([~*^$]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]*))\s*)?\]$/;

function parseCompound(raw: string): Compound | null {
  const text = raw.trim();
  if (!text) return null;

  const shape = COMPOUND.exec(text);
  if (!shape) return null;

  const tag = !shape[1] || shape[1] === "*" ? null : shape[1].toLowerCase();
  const compound: Compound = { tag, classes: [], id: null, attrs: [] };

  const simples = shape[2] || "";
  let match: RegExpExecArray | null;
  SIMPLE.lastIndex = 0;
  let consumed = 0;
  while ((match = SIMPLE.exec(simples)) !== null) {
    consumed += match[0].length;
    const token = match[0];
    if (token[0] === ".") {
      compound.classes.push(token.slice(1));
      continue;
    }
    if (token[0] === "#") {
      compound.id = token.slice(1);
      continue;
    }
    const attr = ATTR.exec(token);
    // An attribute selector we cannot read is a selector we must not guess at.
    if (!attr) return null;
    compound.attrs.push({
      name: attr[1]!.toLowerCase(),
      op: (attr[2] as AttrTest["op"]) ?? "",
      value: attr[3] ?? attr[4] ?? attr[5] ?? "",
    });
  }
  // Trailing junk the simple-selector scanner did not account for.
  if (consumed !== simples.length) return null;

  return compound;
}

function parseSequence(raw: string): Sequence | null {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return null;

  const steps: Sequence = [];
  let combinator: " " | ">" = " ";

  for (const token of tokens) {
    if (token === ">") {
      // Two combinators in a row, or one at the start, is not a selector.
      if (steps.length === 0) return null;
      combinator = ">";
      continue;
    }
    // `a > b` written without spaces around the combinator.
    const parts = token.split(">");
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i]!;
      if (i > 0) {
        if (steps.length === 0) return null;
        combinator = ">";
      }
      if (!part) continue;
      const compound = parseCompound(part);
      if (!compound) return null;
      steps.push({ combinator, compound });
      combinator = " ";
    }
  }

  return steps.length > 0 ? steps : null;
}

/** A parsed selector, or null when any alternative failed to parse. */
export function parseSelector(selector: string): Sequence[] | null {
  const groups = String(selector || "").split(",");
  const out: Sequence[] = [];
  for (const group of groups) {
    if (!group.trim()) continue;
    const sequence = parseSequence(group);
    if (!sequence) return null;
    out.push(sequence);
  }
  return out.length > 0 ? out : null;
}

function matchesCompound(node: ElementNode, compound: Compound): boolean {
  if (compound.tag && node.tag !== compound.tag) return false;

  if (compound.id !== null && getAttribute(node, "id") !== compound.id) return false;

  if (compound.classes.length > 0) {
    const classList = (getAttribute(node, "class") || "").split(/\s+/);
    if (!compound.classes.every((name) => classList.includes(name))) return false;
  }

  return compound.attrs.every((test) => {
    const value = getAttribute(node, test.name);
    if (value === null) return false;
    switch (test.op) {
      case "":
        return true;
      case "=":
        return value === test.value;
      case "~=":
        return value.split(/\s+/).includes(test.value);
      case "*=":
        return test.value !== "" && value.includes(test.value);
      case "^=":
        return test.value !== "" && value.startsWith(test.value);
      case "$=":
        return test.value !== "" && value.endsWith(test.value);
      default:
        return false;
    }
  });
}

/**
 * Whether a node matches a sequence, read right to left.
 *
 * `scope` bounds the walk: a descendant combinator may not climb out of the
 * subtree the caller asked about. Without that, a selector evaluated against
 * one card would match through its ancestors and claim every card on the page.
 */
function matchesSequence(node: ElementNode, sequence: Sequence, scope: ElementNode): boolean {
  let current: ElementNode | null = node;
  let index = sequence.length - 1;

  if (!matchesCompound(current, sequence[index]!.compound)) return false;
  index -= 1;

  while (index >= 0) {
    const step = sequence[index + 1]!;
    const target = sequence[index]!.compound;

    if (step.combinator === ">") {
      const parent: ElementNode | null = current.parent;
      if (!parent || parent === scope.parent || current === scope) return false;
      if (!matchesCompound(parent, target)) return false;
      current = parent;
      index -= 1;
      continue;
    }

    let ancestor: ElementNode | null = current.parent;
    let found: ElementNode | null = null;
    while (ancestor && ancestor !== scope.parent) {
      if (matchesCompound(ancestor, target)) {
        found = ancestor;
        break;
      }
      if (ancestor === scope) break;
      ancestor = ancestor.parent;
    }
    if (!found) return false;
    current = found;
    index -= 1;
  }

  return true;
}

/**
 * Every element inside `root` matching the selector, in document order.
 *
 * `root` itself is never returned — the same rule the DOM applies — so a
 * control targeting the section's own wrapper asks for the root explicitly
 * rather than by selector.
 */
export function selectAll(root: ElementNode, selector: string): ElementNode[] {
  const parsed = parseSelector(selector);
  if (!parsed) return [];
  const pool = descendants(root);
  return pool.filter((node) => parsed.some((sequence) => matchesSequence(node, sequence, root)));
}

/** The first match, or null. */
export function selectOne(root: ElementNode, selector: string): ElementNode | null {
  const parsed = parseSelector(selector);
  if (!parsed) return null;
  for (const node of descendants(root)) {
    if (parsed.some((sequence) => matchesSequence(node, sequence, root))) return node;
  }
  return null;
}

/** Whether one element matches, evaluated within a scope. */
export function matches(node: ElementNode, selector: string, scope: ElementNode): boolean {
  const parsed = parseSelector(selector);
  if (!parsed) return false;
  return parsed.some((sequence) => matchesSequence(node, sequence, scope));
}
