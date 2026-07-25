import { SectionType } from "@/generated/prisma/enums";
import type { SupportedSectionType } from "@/lib/sections/schemas";

/**
 * Declarative description of the edit form for each section type. The editor
 * renders forms from these descriptors, so adding a field to a section means
 * touching its Zod schema and this list — never the form component.
 */
export type FieldDef =
  | { kind: "text"; name: string; label: string; placeholder?: string }
  | { kind: "textarea"; name: string; label: string; rows?: number }
  | { kind: "image"; name: string; label: string }
  | { kind: "boolean"; name: string; label: string }
  | {
      kind: "list";
      name: string;
      label: string;
      /** Singular noun used on the "Add ..." button, e.g. "course". */
      itemNoun: string;
      /** Field of each item used as the collapsed row title. */
      titleField: string;
      fields: FieldDef[];
    };

const HERO_FIELDS: FieldDef[] = [
  { kind: "text", name: "collegeName", label: "College name" },
  { kind: "text", name: "tagline", label: "Tagline" },
  { kind: "textarea", name: "intro", label: "Short intro", rows: 3 },
  { kind: "image", name: "bannerImageUrl", label: "Banner image" },
  { kind: "text", name: "ctaLabel", label: "Button label" },
  { kind: "text", name: "ctaHref", label: "Button link", placeholder: "/admissions" },
];

const ABOUT_FIELDS: FieldDef[] = [
  { kind: "text", name: "title", label: "Section title" },
  { kind: "textarea", name: "history", label: "History", rows: 4 },
  { kind: "textarea", name: "mission", label: "Mission", rows: 3 },
  { kind: "textarea", name: "vision", label: "Vision", rows: 3 },
  { kind: "text", name: "principalName", label: "Principal / director name" },
  { kind: "text", name: "principalDesignation", label: "Designation" },
  { kind: "image", name: "principalPhotoUrl", label: "Principal photo" },
  { kind: "textarea", name: "principalMessage", label: "Message", rows: 4 },
];

const COURSES_FIELDS: FieldDef[] = [
  { kind: "text", name: "title", label: "Section title" },
  { kind: "text", name: "subtitle", label: "Subtitle" },
  {
    kind: "list",
    name: "courses",
    label: "Courses",
    itemNoun: "course",
    titleField: "name",
    fields: [
      { kind: "text", name: "name", label: "Course name" },
      { kind: "text", name: "duration", label: "Duration" },
      { kind: "text", name: "eligibility", label: "Eligibility" },
      { kind: "textarea", name: "description", label: "Description", rows: 2 },
    ],
  },
];

const FACULTY_FIELDS: FieldDef[] = [
  { kind: "text", name: "title", label: "Section title" },
  { kind: "text", name: "subtitle", label: "Subtitle" },
  {
    kind: "list",
    name: "members",
    label: "Faculty members",
    itemNoun: "member",
    titleField: "name",
    fields: [
      { kind: "text", name: "name", label: "Name" },
      { kind: "text", name: "designation", label: "Designation" },
      { kind: "text", name: "department", label: "Department" },
      { kind: "image", name: "photoUrl", label: "Photo" },
    ],
  },
];

const CONTACT_FIELDS: FieldDef[] = [
  { kind: "text", name: "title", label: "Section title" },
  { kind: "textarea", name: "address", label: "Address", rows: 3 },
  { kind: "text", name: "phone", label: "Phone" },
  { kind: "text", name: "email", label: "Email" },
  { kind: "text", name: "mapEmbedUrl", label: "Map embed URL" },
  { kind: "boolean", name: "showContactForm", label: "Show contact form" },
];

export const SECTION_FORM_FIELDS: Record<SupportedSectionType, FieldDef[]> = {
  [SectionType.HERO]: HERO_FIELDS,
  [SectionType.ABOUT]: ABOUT_FIELDS,
  [SectionType.COURSES]: COURSES_FIELDS,
  [SectionType.FACULTY]: FACULTY_FIELDS,
  [SectionType.CONTACT]: CONTACT_FIELDS,
};

/** A blank item for a repeatable list, derived from its field definitions. */
export function emptyListItem(fields: FieldDef[]): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  for (const field of fields) {
    item[field.name] = field.kind === "boolean" ? false : "";
  }
  return item;
}
