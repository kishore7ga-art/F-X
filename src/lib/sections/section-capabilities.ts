/**
 * What a kind of section is *expected* to be editable with.
 *
 * ── What this table is, and what it is not ─────────────────────────────────
 *
 * It is not the source of truth for which controls appear. `section-probe.ts`
 * is: a control exists because the markup has something for it to edit. This
 * table does two smaller jobs that the markup cannot do on its own:
 *
 *  1. **Order.** A hero's Content group belongs above its Background group; a
 *     footer's Links group belongs above its Typography group. Detection has no
 *     opinion about that, and a panel whose groups appear in markup order is a
 *     panel nobody can find anything in.
 *
 *  2. **Names.** The same detected repeater is "Service cards" in a services
 *     section, "Courses" in a courses section, and "Items" in a section nobody
 *     has categorised. The controls are identical; the label is what makes them
 *     legible.
 *
 * Because it decides neither presence nor behaviour, a category missing from it
 * is not a broken section — it falls back to `DEFAULT_ORDER` and generic names
 * and every control still works. That is the property §17 asks for: an
 * administrator can publish a section type this file has never heard of and the
 * editor handles it.
 *
 * The ids are the platform's canonical twenty, from `categories.ts`, which is
 * the same list the Admin panel is compiled against — so a category cannot be
 * added on one side only (SECTION-ARCHITECTURE.md §6).
 */

import type { SectionCategoryId, UNCATEGORISED } from "./categories";

/** A group of related controls in the section toolbar. */
export type CapabilityId =
  | "background"
  | "buttons"
  | "animation"
  | "section";

export type SectionCategory = SectionCategoryId | typeof UNCATEGORISED;

/**
 * The order groups appear in the toolbar.
 */
export const DEFAULT_ORDER: readonly CapabilityId[] = [
  "background",
  "buttons",
  "animation",
  "section",
];

export const CATEGORY_ORDER: Partial<Record<SectionCategory, readonly CapabilityId[]>> = {
  navbar: ["buttons", "background", "animation", "section"],
  hero: ["buttons", "background", "animation", "section"],
  cta: ["buttons", "background", "animation", "section"],
  about: ["buttons", "background", "animation", "section"],
  vision: ["buttons", "background", "animation", "section"],
  courses: ["buttons", "background", "animation", "section"],
  departments: ["buttons", "background", "animation", "section"],
  facilities: ["buttons", "background", "animation", "section"],
  research: ["buttons", "background", "animation", "section"],
  admissions: ["buttons", "background", "animation", "section"],
  placements: ["buttons", "background", "animation", "section"],
  highlights: ["buttons", "background", "animation", "section"],
  achievements: ["buttons", "background", "animation", "section"],
  news: ["buttons", "background", "animation", "section"],
  events: ["buttons", "background", "animation", "section"],
  gallery: ["buttons", "background", "animation", "section"],
  testimonials: ["buttons", "background", "animation", "section"],
  contact: ["buttons", "background", "animation", "section"],
  map: ["buttons", "background", "animation", "section"],
  footer: ["buttons", "background", "animation", "section"],
};

/** The groups, in the order this category wants them. */
export function groupOrderFor(category: SectionCategory): readonly CapabilityId[] {
  return DEFAULT_ORDER;
}

/** The groups a category opens with, so the panel is useful without a click. */
export function defaultOpenFor(category: SectionCategory): ReadonlySet<CapabilityId> {
  const order = groupOrderFor(category);
  return new Set(order.slice(0, 2));
}

/** What to call a detected repeater in this kind of section. */
export function listLabelFor(
  category: SectionCategory,
  kind: "cards" | "images" | "links" | "fields",
): { group: string; item: string } {
  if (kind === "images") return { group: "Images", item: "Image" };
  if (kind === "fields") return { group: "Form fields", item: "Field" };
  if (kind === "links") {
    if (category === "footer") return { group: "Footer links", item: "Link" };
    if (category === "navbar") return { group: "Navigation items", item: "Item" };
    return { group: "Links", item: "Link" };
  }

  switch (category) {
    case "courses":
      return { group: "Courses", item: "Course" };
    case "departments":
      return { group: "Departments", item: "Department" };
    case "facilities":
      return { group: "Facilities", item: "Facility" };
    case "highlights":
      return { group: "Highlights", item: "Highlight" };
    case "achievements":
      return { group: "Achievements", item: "Achievement" };
    case "testimonials":
      return { group: "Testimonials", item: "Testimonial" };
    case "news":
      return { group: "News items", item: "Article" };
    case "events":
      return { group: "Events", item: "Event" };
    case "placements":
      return { group: "Recruiters", item: "Entry" };
    case "research":
      return { group: "Research areas", item: "Area" };
    case "contact":
      return { group: "Contact details", item: "Detail" };
    case "vision":
      return { group: "Statements", item: "Statement" };
    default:
      return { group: "Service cards", item: "Card" };
  }
}

/** The heading shown at the top of the panel. */
export const CATEGORY_LABEL: Record<string, string> = {
  navbar: "Header",
  hero: "Hero",
  cta: "Call to action",
  highlights: "Highlights",
  about: "About",
  vision: "Vision & mission",
  courses: "Courses",
  departments: "Departments",
  admissions: "Admissions",
  placements: "Placements",
  facilities: "Facilities",
  research: "Research",
  news: "News",
  events: "Events",
  gallery: "Gallery",
  testimonials: "Testimonials",
  achievements: "Achievements",
  contact: "Contact",
  map: "Map",
  footer: "Footer",
  custom: "Section",
};

export function categoryLabel(category: SectionCategory): string {
  return CATEGORY_LABEL[category] ?? "Section";
}

export const GROUP_LABEL: Record<CapabilityId, string> = {
  background: "Background",
  buttons: "Buttons",
  animation: "Animation",
  section: "Image Assets",
};
