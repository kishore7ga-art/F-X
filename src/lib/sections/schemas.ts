import { z } from "zod";

import { SectionType } from "@/generated/prisma/enums";

/**
 * Zod schema per section type for the `college_sections.content` JSONB column.
 * Fields follow the "Standard Sections" list in Section 3 of the spec.
 *
 * URLs are plain strings, not `z.url()` — uploaded images are stored as
 * site-relative paths like `/uploads/abc.jpg`.
 */

const url = z.string().trim();
const text = z.string().trim();

export const heroContentSchema = z.object({
  collegeName: text.min(1).default("Kishore7ga Institute of Technology & Science"),
  tagline: text.default("NAAC A++ Accredited Autonomous University | NIRF Top 30"),
  intro: text.default("At Kishore7ga Institute of Technology & Science (KITS), we empower future engineering leaders with state-of-the-art research hubs, 98% placement rate, 48 LPA max salary package, and global industry partnerships."),
  bannerImageUrl: url.default("/template-brightwood.jpg"),
  ctaLabel: text.default("Explore Programmes »"),
  ctaHref: url.default("/courses"),
});

export const aboutContentSchema = z.object({
  title: text.default("About Us"),
  history: text.default("Founded in 1996, Kishore7ga Institute of Technology & Science (KITS) is a premier UGC autonomous institution with NAAC A++ accreditation (3.78 Score). Offering 18+ NBA accredited engineering, management, and doctoral programs, KITS is renowned for research innovation, world-class labs, and 100% career guidance."),
  mission: text.default("To provide rigorous, industry-aligned technical education and foster groundbreaking research to address complex global challenges."),
  vision: text.default("To be recognized as a world-class center of excellence in technical education, scientific research, and ethical leadership."),
  principalName: text.default("Dr. K. S. Kishore"),
  principalDesignation: text.default("FOUNDER & CHANCELLOR"),
  principalPhotoUrl: url.default("/seed/principal.svg"),
  principalMessage: text.default("Our commitment is to cultivate critical thinking, technological mastery, and ethical values so our graduates shape the future of global innovation."),
});

export const courseItemSchema = z.object({
  name: text.min(1),
  duration: text.default("4 Years"),
  eligibility: text.default("10+2 PCM Min 60%"),
  description: text.default("Comprehensive degree stream covering core fundamentals, hands-on lab projects, and industrial internships."),
});

export const DEFAULT_COURSES = [
  {
    name: "B.Tech in Computer Science & Engineering",
    duration: "4 Years (8 Semesters)",
    eligibility: "10+2 PCM Min 60% + JEE Main Score",
    description: "Core curriculum in Algorithms, Data Structures, Full Stack Web Development, Cloud Architecture, and Machine Learning.",
  },
  {
    name: "B.Tech in Artificial Intelligence & Data Science",
    duration: "4 Years (8 Semesters)",
    eligibility: "10+2 PCM Min 65% + Entrance Merit",
    description: "Deep learning, Neural Networks, Computer Vision, Big Data Systems, and Generative AI applications.",
  },
  {
    name: "B.Tech in Electronics & Communication",
    duration: "4 Years (8 Semesters)",
    eligibility: "10+2 PCM Min 60%",
    description: "VLSI Semiconductor Design, Embedded Robotics, Wireless 5G Networks, and Signal Processing.",
  },
  {
    name: "M.Tech in Cyber Security & Forensics",
    duration: "2 Years (4 Semesters)",
    eligibility: "B.Tech/BE in CSE/IT + GATE",
    description: "Network Defense, Ethical Hacking, Penetration Testing, Cryptography, and Incident Response.",
  },
  {
    name: "MBA - Technology & Business Leadership",
    duration: "2 Years (4 Semesters)",
    eligibility: "Bachelor's Degree Min 50% + CAT/MAT",
    description: "Strategic Management, FinTech, Global Supply Chain, Product Management, and Tech Entrepreneurship.",
  },
];

export const coursesContentSchema = z.object({
  title: text.default("Courses & Programmes"),
  subtitle: text.default("Explore our top-ranked NBA accredited degree programs and industry specializations."),
  courses: z.array(courseItemSchema).default(DEFAULT_COURSES),
});

export const facultyMemberSchema = z.object({
  name: text.min(1),
  designation: text.default("Professor"),
  department: text.default("School of Engineering"),
  photoUrl: url.default("/seed/principal.svg"),
});

export const DEFAULT_FACULTY = [
  {
    name: "Dr. Aris Thorne",
    designation: "Dean of Computer Science",
    department: "Computer Science & AI",
    photoUrl: "/seed/faculty-1.svg",
  },
  {
    name: "Dr. Meera Sen",
    designation: "Head of AI Research",
    department: "Artificial Intelligence",
    photoUrl: "/seed/faculty-2.svg",
  },
  {
    name: "Prof. Vikramaditya",
    designation: "Dean of Academics",
    department: "Electronics & Communication",
    photoUrl: "/seed/faculty-3.svg",
  },
  {
    name: "Dr. Sarah Jenkins",
    designation: "Director of Research",
    department: "Biotechnology & Applied Sciences",
    photoUrl: "/seed/faculty-4.svg",
  },
];

export const facultyContentSchema = z.object({
  title: text.default("Faculty Directory"),
  subtitle: text.default("Renowned Academicians, Industry Veterans, and Research Directors"),
  members: z.array(facultyMemberSchema).default(DEFAULT_FACULTY),
});

export const contactContentSchema = z.object({
  title: text.default("Contact Us & Campus Helpdesk"),
  address: text.default("Kishore7ga Tech Campus, Innovation Parkway, Tech City - 560100"),
  phone: text.default("+91 (080) 4567-8900 / Toll-Free: 1800-425-7000"),
  email: text.default("admissions@kishore7ga.edu"),
  mapEmbedUrl: text.default("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.752391087401!2d77.5945627!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8380f5385e99f8d!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin"),
  showContactForm: z.boolean().default(true),
});

/** Section types the MVP can render. */
export const SUPPORTED_SECTION_TYPES = [
  SectionType.HERO,
  SectionType.ABOUT,
  SectionType.COURSES,
  SectionType.FACULTY,
  SectionType.CONTACT,
] as const;

export type SupportedSectionType = (typeof SUPPORTED_SECTION_TYPES)[number];

export const sectionContentSchemas = {
  [SectionType.HERO]: heroContentSchema,
  [SectionType.ABOUT]: aboutContentSchema,
  [SectionType.COURSES]: coursesContentSchema,
  [SectionType.FACULTY]: facultyContentSchema,
  [SectionType.CONTACT]: contactContentSchema,
} satisfies Record<SupportedSectionType, z.ZodType>;

export type HeroContent = z.infer<typeof heroContentSchema>;
export type AboutContent = z.infer<typeof aboutContentSchema>;
export type CoursesContent = z.infer<typeof coursesContentSchema>;
export type FacultyContent = z.infer<typeof facultyContentSchema>;
export type ContactContent = z.infer<typeof contactContentSchema>;

/** Discriminated map from section type -> its parsed content type. */
export type SectionContentMap = {
  [SectionType.HERO]: HeroContent;
  [SectionType.ABOUT]: AboutContent;
  [SectionType.COURSES]: CoursesContent;
  [SectionType.FACULTY]: FacultyContent;
  [SectionType.CONTACT]: ContactContent;
};

/**
 * Takes a `string`, not a `SectionType`.
 */
export function isSupportedSectionType(
  value: string,
): value is SupportedSectionType {
  return (SUPPORTED_SECTION_TYPES as readonly string[]).includes(value);
}

/** Throws on invalid content. Use when writing to the database. */
export function parseSectionContent<T extends SupportedSectionType>(
  sectionType: T,
  content: unknown,
): SectionContentMap[T] {
  return sectionContentSchemas[sectionType].parse(
    content,
  ) as SectionContentMap[T];
}

/** Never throws. Use when rendering, so one bad row can't break a whole site. */
export function safeParseSectionContent<T extends SupportedSectionType>(
  sectionType: T,
  content: unknown,
): SectionContentMap[T] | null {
  const result = sectionContentSchemas[sectionType].safeParse(content);
  if (!result.success) {
    const fallbackDefault = sectionContentSchemas[sectionType].parse({});
    return fallbackDefault as SectionContentMap[T];
  }
  
  const parsed = { ...result.data } as any;

  if (sectionType === SectionType.ABOUT) {
    if (!parsed.history) parsed.history = "Founded in 1996, Kishore7ga Institute of Technology & Science (KITS) is a premier UGC autonomous institution with NAAC A++ accreditation (3.78 Score). Offering 18+ NBA accredited engineering, management, and doctoral programs, KITS is renowned for research innovation, world-class labs, and 100% career guidance.";
    if (!parsed.mission) parsed.mission = "To provide rigorous, industry-aligned technical education and foster groundbreaking research to address complex global challenges.";
    if (!parsed.vision) parsed.vision = "To be recognized as a world-class center of excellence in technical education, scientific research, and ethical leadership.";
    if (!parsed.principalName) parsed.principalName = "Dr. K. S. Kishore";
    if (!parsed.principalDesignation) parsed.principalDesignation = "FOUNDER & CHANCELLOR";
    if (!parsed.principalPhotoUrl) parsed.principalPhotoUrl = "/seed/principal.svg";
    if (!parsed.principalMessage) parsed.principalMessage = "Our commitment is to cultivate critical thinking, technological mastery, and ethical values so our graduates shape the future of global innovation.";
  } else if (sectionType === SectionType.COURSES) {
    if (!parsed.courses || parsed.courses.length === 0) {
      parsed.courses = DEFAULT_COURSES;
    }
  } else if (sectionType === SectionType.FACULTY) {
    if (!parsed.members || parsed.members.length === 0) {
      parsed.members = DEFAULT_FACULTY;
    }
  } else if (sectionType === SectionType.CONTACT) {
    if (!parsed.address) parsed.address = "Kishore7ga Tech Campus, Innovation Parkway, Tech City - 560100";
    if (!parsed.phone) parsed.phone = "+91 (080) 4567-8900 / Toll-Free: 1800-425-7000";
    if (!parsed.email) parsed.email = "admissions@kishore7ga.edu";
    if (!parsed.mapEmbedUrl) parsed.mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.752391087401!2d77.5945627!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8380f5385e99f8d!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin";
  }

  return parsed as SectionContentMap[T];
}
