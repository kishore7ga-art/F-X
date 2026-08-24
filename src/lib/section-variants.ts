/**
 * Which template a section shows, and which one it shows next.
 *
 * ── Why the old swap was unreliable ────────────────────────────────────────
 *
 * `handleSwapVariant` was 200 lines and got three things wrong, each of which
 * alone was enough to make swapping fail:
 *
 *  1. **It had no templates.** It read `adminDbTemplates`, filled by a fetch of
 *     `/api/v1/admin/templates` — an admin-only route. A college session gets
 *     401, the `catch` swallowed it, and the list stayed empty. Every swap
 *     therefore built a cycle of length one and reported "Only 1 variant".
 *     Fixed at the source: `/api/v1/section-library` (see `editor-api.ts`).
 *
 *  2. **It matched by comparing HTML.** The current variant was located with
 *     `template.code.trim() === section.code.trim()`. The moment a user edited
 *     any text inline — which is the editor's headline feature — the section's
 *     code no longer equalled any template, the search returned -1, and the
 *     code fell back to `nextIdx = 0`. So swapping an edited section jumped to
 *     the first variant instead of the next one, and the user's edits were
 *     silently discarded with no way back. Identity is `templateId` now: an id
 *     survives editing, because editing does not change which template the
 *     section came from.
 *
 *  3. **Its category matching contradicted itself.** Two "STRICT SAFETY GUARDs"
 *     dropped any template whose markup contained the substring `<header` or
 *     `<footer` from every non-navbar, non-footer category. A hero with a
 *     `<header>` element inside it — which is valid HTML and common in the
 *     library — was therefore invisible to the hero cycle. Categories are
 *     resolved once, server-side, by `resolveCategory`; there is no second
 *     opinion here to disagree with the first.
 *
 * ── The rule ───────────────────────────────────────────────────────────────
 *
 * A section's variants are exactly the library templates whose resolved
 * category equals the section's resolved category. The cycle is that list, in
 * the order the API returned it — which is deterministic and stable across
 * requests — plus the section's own current markup when it is not one of them.
 * Swapping advances one position and wraps. Nothing else.
 */

import type { EditorSection, LibrarySection, SectionLibrary } from "@/lib/editor-api";
import { UNCATEGORISED } from "@/lib/sections/categories";

export type Variant = {
  /** The library template's id, or null for the section's own current markup. */
  templateId: string | null;
  name: string;
  code: string;
};

/**
 * Every variant available to this section, in cycle order.
 *
 * The section's own markup is included when it is not a library template — a
 * seeded section, or one the user has customised — and it goes *first*, so
 * "swap forward then keep going" returns to what the user started with rather
 * than stranding it. A section that IS showing a library template does not get
 * a duplicate entry.
 */
export function variantsFor(section: EditorSection, library: SectionLibrary): Variant[] {
  // An uncategorised section has no siblings by definition. Matching it against
  // the "custom" bucket would put a college's one-off hand-written block into a
  // cycle with every other unrelated one-off on the platform.
  if (!section.category || section.category === UNCATEGORISED) {
    return section.code ? [{ templateId: null, name: section.title, code: section.code }] : [];
  }

  const templates: LibrarySection[] = library.byCategory[section.category] ?? [];
  const variants: Variant[] = templates.map((t) => ({
    templateId: t.id,
    name: t.name,
    code: t.code,
  }));

  const showingKnownTemplate =
    section.templateId !== null && variants.some((v) => v.templateId === section.templateId);

  if (!showingKnownTemplate && section.code.trim()) {
    variants.unshift({ templateId: null, name: section.title || "Current", code: section.code });
  }

  return variants;
}

/**
 * Where this section sits in its own cycle.
 *
 * By id when it has one, and by position 0 otherwise — position 0 being the
 * section's own markup, which `variantsFor` put there. Never by comparing
 * markup: that is the comparison inline editing breaks.
 */
export function currentVariantIndex(section: EditorSection, variants: Variant[]): number {
  if (section.templateId) {
    const byId = variants.findIndex((v) => v.templateId === section.templateId);
    if (byId >= 0) return byId;
  }
  const own = variants.findIndex((v) => v.templateId === null);
  return own >= 0 ? own : 0;
}

export type SwapResult =
  | { ok: true; section: EditorSection; position: number; total: number }
  | { ok: false; reason: "no-variants" | "single-variant"; total: number };

/**
 * The section as it should be after one press of Swap.
 *
 * Pure: it returns the next section rather than mutating anything, so the same
 * call is used by the toolbar button, by a keyboard shortcut, and by tests. The
 * `direction` argument exists because a cycle you can only go forward through
 * is a cycle you cannot back out of when you overshoot.
 */
export function swapVariant(
  section: EditorSection,
  library: SectionLibrary,
  direction: 1 | -1 = 1,
): SwapResult {
  const variants = variantsFor(section, library);

  if (variants.length === 0) return { ok: false, reason: "no-variants", total: 0 };
  if (variants.length === 1) return { ok: false, reason: "single-variant", total: 1 };

  const current = currentVariantIndex(section, variants);
  const nextIndex = (current + direction + variants.length) % variants.length;
  const next = variants[nextIndex]!;

  return {
    ok: true,
    position: nextIndex + 1,
    total: variants.length,
    section: {
      ...section,
      // The id never changes. It is what the reorder endpoint, React's keying
      // and the user's selection all address this section by; a swap that
      // minted a new one would deselect the section the user was looking at and
      // orphan any pending reorder.
      id: section.id,
      title: next.name || section.title,
      code: next.code,
      templateId: next.templateId,
      variantIndex: nextIndex,
      category: section.category,
    },
  };
}

/** A library template, as a brand-new section. */
export function sectionFromTemplate(template: LibrarySection, id: string): EditorSection {
  return {
    id,
    title: template.name,
    category: template.category,
    templateId: template.id,
    variantIndex: 0,
    code: template.code,
  };
}

/* ── Placement ──────────────────────────────────────────────────────────── */

/**
 * Where a newly added section of this category belongs.
 *
 * Only two categories have a structural constraint, and both are absolute: a
 * navbar is the first thing on a page and a footer is the last. Everything else
 * goes where the user asked, or — when they used the toolbar rather than a
 * specific insertion point — immediately above the footer, which is the bottom
 * of the page as far as content is concerned.
 *
 * The old version also *replaced* any existing section of the same category
 * when adding from the toolbar, so adding a second Courses section silently
 * destroyed the first. A page may have two of anything except a navbar and a
 * footer.
 */
export function placementIndex(
  sections: EditorSection[],
  category: string,
  requested: number | null,
): number {
  if (category === "navbar") return 0;
  if (category === "footer") return sections.length;

  if (requested !== null) {
    const clamped = Math.max(0, Math.min(requested, sections.length));
    // Even an explicit request cannot put a section above the navbar or below
    // the footer — those two positions are not the user's to choose.
    const hasNavbar = sections[0]?.category === "navbar";
    const footerIndex = sections.findIndex((s) => s.category === "footer");
    const floor = hasNavbar ? 1 : 0;
    const ceiling = footerIndex >= 0 ? footerIndex : sections.length;
    return Math.max(floor, Math.min(clamped, ceiling));
  }

  const footerIndex = sections.findIndex((s) => s.category === "footer");
  return footerIndex >= 0 ? footerIndex : sections.length;
}

/** Whether a section may move one step in this direction. */
export function canMove(sections: EditorSection[], index: number, direction: 1 | -1): boolean {
  const target = index + direction;
  if (index < 0 || index >= sections.length) return false;
  if (target < 0 || target >= sections.length) return false;

  const moving = sections[index]!;
  const displaced = sections[target]!;

  // A navbar stays first and a footer stays last, and neither can be displaced
  // past the other's position. Expressed as "can these two swap" rather than as
  // index arithmetic against `sections.length`, which is what the old guards
  // did — they blocked moving index 1 upward even on a page with no navbar.
  if (moving.category === "navbar" || moving.category === "footer") return false;
  if (displaced.category === "navbar" || displaced.category === "footer") return false;

  return true;
}

/** The sections with `index` moved one step, or the same array if it cannot. */
export function moveSection(
  sections: EditorSection[],
  index: number,
  direction: 1 | -1,
): EditorSection[] {
  if (!canMove(sections, index, direction)) return sections;
  const next = [...sections];
  const target = index + direction;
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next;
}
