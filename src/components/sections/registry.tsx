import type { ComponentType, ReactNode } from "react";

import { AboutImageBeside } from "@/components/sections/about/AboutImageBeside";
import { AboutQuoteLead } from "@/components/sections/about/AboutQuoteLead";
import { AboutSplitPanel } from "@/components/sections/about/AboutSplitPanel";
import { AboutStacked } from "@/components/sections/about/AboutStacked";
import { AboutTimeline } from "@/components/sections/about/AboutTimeline";
import { AboutTwoColumn } from "@/components/sections/about/AboutTwoColumn";
import { ContactCardsRow } from "@/components/sections/contact/ContactCardsRow";
import { ContactCentered } from "@/components/sections/contact/ContactCentered";
import { ContactDarkPanel } from "@/components/sections/contact/ContactDarkPanel";
import { ContactFormOnly } from "@/components/sections/contact/ContactFormOnly";
import { ContactFullWidthMap } from "@/components/sections/contact/ContactFullWidthMap";
import { ContactSplit } from "@/components/sections/contact/ContactSplit";
import { CoursesAccordion } from "@/components/sections/courses/CoursesAccordion";
import { CoursesCompactTiles } from "@/components/sections/courses/CoursesCompactTiles";
import { CoursesGrid } from "@/components/sections/courses/CoursesGrid";
import { CoursesNumberedList } from "@/components/sections/courses/CoursesNumberedList";
import { CoursesSplitRows } from "@/components/sections/courses/CoursesSplitRows";
import { CoursesTable } from "@/components/sections/courses/CoursesTable";
import { FacultyCards } from "@/components/sections/faculty/FacultyCards";
import { FacultyCircleGrid } from "@/components/sections/faculty/FacultyCircleGrid";
import { FacultyDepartmentGroups } from "@/components/sections/faculty/FacultyDepartmentGroups";
import { FacultyMinimalTable } from "@/components/sections/faculty/FacultyMinimalTable";
import { FacultyOverlayTiles } from "@/components/sections/faculty/FacultyOverlayTiles";
import { FacultyRoster } from "@/components/sections/faculty/FacultyRoster";
import { HeroAcademicMasthead } from "@/components/sections/hero/HeroAcademicMasthead";
import { HeroCentered } from "@/components/sections/hero/HeroCentered";
import { HeroImageSplit } from "@/components/sections/hero/HeroImageSplit";
import { HeroMinimalText } from "@/components/sections/hero/HeroMinimalText";
import { HeroSidePanel } from "@/components/sections/hero/HeroSidePanel";
import { HeroStackedBanner } from "@/components/sections/hero/HeroStackedBanner";
import { SectionType } from "@/generated/prisma/enums";
import {
  safeParseSectionContent,
  type SectionContentMap,
  type SupportedSectionType,
} from "@/lib/sections/schemas";

export type VariantEntry = {
  sectionType: SupportedSectionType;
  /** Parses raw JSONB against this section type's schema, then renders. */
  render: (rawContent: unknown) => ReactNode;
};

/**
 * Binds a component to its section type. The generic keeps the component's
 * `content` prop tied to the matching Zod-inferred type, so a Faculty component
 * can never be registered under a Courses section.
 */
function variant<T extends SupportedSectionType>(
  sectionType: T,
  Component: ComponentType<{ content: SectionContentMap[T] }>,
): VariantEntry {
  return {
    sectionType,
    render(rawContent: unknown) {
      const content = (safeParseSectionContent(sectionType, rawContent) ?? rawContent) as SectionContentMap[T];
      if (!content) return null;
      return <Component content={content} />;
    },
  };
}

/**
 * `section_variants.component_key` -> React component. The refresh (↻) button
 * in the editor swaps which key a college_section points at; content is
 * untouched because every variant of a section type reads the same fields.
 */
export const VARIANT_REGISTRY: Record<string, VariantEntry> = {
  // Keys follow {section_type}_{layout_descriptor} — see
  // adding-section-variants.md §4. Must stay in sync with
  // section_variants.component_key in the database.
  hero_centered: variant(SectionType.HERO, HeroCentered),
  hero_split_image: variant(SectionType.HERO, HeroImageSplit),
  hero_academic_masthead: variant(SectionType.HERO, HeroAcademicMasthead),
  hero_minimal_text: variant(SectionType.HERO, HeroMinimalText),
  hero_side_panel: variant(SectionType.HERO, HeroSidePanel),
  hero_stacked_banner: variant(SectionType.HERO, HeroStackedBanner),

  about_two_column: variant(SectionType.ABOUT, AboutTwoColumn),
  about_stacked_cards: variant(SectionType.ABOUT, AboutStacked),
  about_timeline: variant(SectionType.ABOUT, AboutTimeline),
  about_quote_lead: variant(SectionType.ABOUT, AboutQuoteLead),
  about_image_beside: variant(SectionType.ABOUT, AboutImageBeside),
  about_split_panel: variant(SectionType.ABOUT, AboutSplitPanel),

  courses_card_grid: variant(SectionType.COURSES, CoursesGrid),
  courses_table: variant(SectionType.COURSES, CoursesTable),
  courses_accordion: variant(SectionType.COURSES, CoursesAccordion),
  courses_numbered_list: variant(SectionType.COURSES, CoursesNumberedList),
  courses_split_rows: variant(SectionType.COURSES, CoursesSplitRows),
  courses_compact_tiles: variant(SectionType.COURSES, CoursesCompactTiles),

  faculty_photo_cards: variant(SectionType.FACULTY, FacultyCards),
  faculty_roster_list: variant(SectionType.FACULTY, FacultyRoster),
  faculty_circle_grid: variant(SectionType.FACULTY, FacultyCircleGrid),
  faculty_department_groups: variant(
    SectionType.FACULTY,
    FacultyDepartmentGroups,
  ),
  faculty_overlay_tiles: variant(SectionType.FACULTY, FacultyOverlayTiles),
  faculty_minimal_table: variant(SectionType.FACULTY, FacultyMinimalTable),

  contact_map_split: variant(SectionType.CONTACT, ContactSplit),
  contact_centered: variant(SectionType.CONTACT, ContactCentered),
  contact_form_only: variant(SectionType.CONTACT, ContactFormOnly),
  contact_full_width_map: variant(SectionType.CONTACT, ContactFullWidthMap),
  contact_cards_row: variant(SectionType.CONTACT, ContactCardsRow),
  contact_dark_panel: variant(SectionType.CONTACT, ContactDarkPanel),
};

export function getVariant(componentKey: string): VariantEntry | null {
  return VARIANT_REGISTRY[componentKey] ?? null;
}

/** Human-readable labels for section types, used by the editor UI. */
export const SECTION_TYPE_LABELS: Record<SupportedSectionType, string> = {
  [SectionType.HERO]: "Hero",
  [SectionType.ABOUT]: "About Us",
  [SectionType.COURSES]: "Courses",
  [SectionType.FACULTY]: "Faculty",
  [SectionType.CONTACT]: "Contact",
};
