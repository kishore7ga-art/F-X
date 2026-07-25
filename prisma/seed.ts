import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { createPool } from "../src/lib/db-pool";
import { CollegeStatus, SectionType } from "../src/generated/prisma/enums";
import {
  parseSectionContent,
  type SupportedSectionType,
} from "../src/lib/sections/schemas";

// Same cloud-tuned pool the app uses, so seeding works against a managed
// database (TLS) as well as local Postgres.
const pool = createPool();
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const PALETTES = [
  {
    name: "Academic Blue",
    colors: {
      primary: "#1E3A8A",
      secondary: "#3B82F6",
      accent: "#F59E0B",
      dark: "#0F172A",
      light: "#F8FAFC",
    },
  },
  {
    name: "Heritage Maroon",
    colors: {
      primary: "#7F1D1D",
      secondary: "#B91C1C",
      accent: "#D4A017",
      dark: "#1C1917",
      light: "#FEF7ED",
    },
  },
  {
    name: "Campus Green",
    colors: {
      primary: "#14532D",
      secondary: "#16A34A",
      accent: "#FACC15",
      dark: "#0B1F16",
      light: "#F0FDF4",
    },
  },
];

/** Demo login for the sample college. */
const SEED_LOGIN = {
  email: "admin@greenfield.edu.in",
  password: "greenfield123",
};

const FONT_PACKS = [
  {
    name: "Classic Serif",
    headingFont: "Playfair Display",
    bodyFont: "Source Sans 3",
  },
  { name: "Modern Sans", headingFont: "Poppins", bodyFont: "Inter" },
];

/** Section types of the "Radian" template, with their design variants. */
const TEMPLATE_SECTIONS = [
  {
    sectionType: SectionType.HERO,
    defaultOrder: 1,
    isRequired: true,
    variants: [
      { variantName: "Centered", componentKey: "hero_centered" },
      { variantName: "Image Split", componentKey: "hero_split_image" },
      // Adapted from the AR academic template (CC BY 4.0). See
      // prisma/variants/001_hero_academic_masthead.sql
      { variantName: "Academic Masthead", componentKey: "hero_academic_masthead" },
      { variantName: "Minimal Text", componentKey: "hero_minimal_text" },
      { variantName: "Side Panel", componentKey: "hero_side_panel" },
      { variantName: "Stacked Banner", componentKey: "hero_stacked_banner" },
    ],
  },
  {
    sectionType: SectionType.ABOUT,
    defaultOrder: 2,
    isRequired: false,
    variants: [
      { variantName: "Two Column", componentKey: "about_two_column" },
      { variantName: "Stacked Cards", componentKey: "about_stacked_cards" },
      { variantName: "Timeline", componentKey: "about_timeline" },
      { variantName: "Quote Lead", componentKey: "about_quote_lead" },
      { variantName: "Image Beside", componentKey: "about_image_beside" },
      { variantName: "Split Panel", componentKey: "about_split_panel" },
    ],
  },
  {
    sectionType: SectionType.COURSES,
    defaultOrder: 3,
    isRequired: false,
    variants: [
      { variantName: "Card Grid", componentKey: "courses_card_grid" },
      { variantName: "Comparison Table", componentKey: "courses_table" },
      { variantName: "Accordion", componentKey: "courses_accordion" },
      { variantName: "Numbered List", componentKey: "courses_numbered_list" },
      { variantName: "Split Rows", componentKey: "courses_split_rows" },
      { variantName: "Compact Tiles", componentKey: "courses_compact_tiles" },
    ],
  },
  {
    sectionType: SectionType.FACULTY,
    defaultOrder: 4,
    isRequired: false,
    variants: [
      { variantName: "Photo Cards", componentKey: "faculty_photo_cards" },
      { variantName: "Roster List", componentKey: "faculty_roster_list" },
      { variantName: "Circle Grid", componentKey: "faculty_circle_grid" },
      { variantName: "Department Groups", componentKey: "faculty_department_groups" },
      { variantName: "Overlay Tiles", componentKey: "faculty_overlay_tiles" },
      { variantName: "Minimal Table", componentKey: "faculty_minimal_table" },
    ],
  },
  {
    sectionType: SectionType.CONTACT,
    defaultOrder: 5,
    isRequired: true,
    variants: [
      { variantName: "Split Map", componentKey: "contact_map_split" },
      { variantName: "Centered", componentKey: "contact_centered" },
      { variantName: "Form Only", componentKey: "contact_form_only" },
      { variantName: "Full Width Map", componentKey: "contact_full_width_map" },
      { variantName: "Cards Row", componentKey: "contact_cards_row" },
      { variantName: "Dark Panel", componentKey: "contact_dark_panel" },
    ],
  },
];

const CONTENT: Record<SupportedSectionType, unknown> = {
  [SectionType.HERO]: {
    collegeName: "Greenfield Institute of Technology",
    tagline: "Engineering tomorrow, today",
    intro:
      "A NAAC A+ accredited institute offering undergraduate and postgraduate programmes in engineering, management and applied sciences since 1998.",
    bannerImageUrl: "/seed/campus.svg",
    ctaLabel: "Apply for admission",
    ctaHref: "/admissions",
  },
  [SectionType.ABOUT]: {
    title: "About Greenfield",
    history:
      "Founded in 1998 by the Greenfield Education Trust, the institute began with three engineering branches and 120 students. It now serves over 4,000 students across 14 departments on a 42-acre campus.",
    mission:
      "To deliver rigorous, industry-relevant technical education that is accessible to students from every background.",
    vision:
      "To be recognised among the leading centres of applied research and engineering education in the region by 2030.",
    principalName: "Dr. Anita Raghavan",
    principalDesignation: "Principal",
    principalPhotoUrl: "/seed/principal.svg",
    principalMessage:
      "Our students leave Greenfield with more than a degree — they leave with the habit of solving real problems. That is the promise we renew with every incoming batch.",
  },
  [SectionType.COURSES]: {
    title: "Courses & Departments",
    subtitle: "Fourteen AICTE-approved programmes across three faculties.",
    courses: [
      {
        name: "B.Tech — Computer Science & Engineering",
        duration: "4 years",
        eligibility: "10+2 with Physics, Chemistry, Mathematics (min. 60%)",
        description:
          "Core computing, data structures, AI/ML electives and a two-semester industry capstone.",
      },
      {
        name: "B.Tech — Mechanical Engineering",
        duration: "4 years",
        eligibility: "10+2 with Physics, Chemistry, Mathematics (min. 55%)",
        description:
          "Thermal sciences, design and manufacturing with a dedicated CNC and robotics lab.",
      },
      {
        name: "B.Tech — Electronics & Communication",
        duration: "4 years",
        eligibility: "10+2 with Physics, Chemistry, Mathematics (min. 55%)",
        description:
          "VLSI, embedded systems and communication networks with an in-house fabrication lab.",
      },
      {
        name: "M.Tech — Structural Engineering",
        duration: "2 years",
        eligibility: "B.E./B.Tech in Civil Engineering with a valid GATE score",
        description:
          "Advanced structural analysis, earthquake engineering and a research thesis.",
      },
      {
        name: "MBA — Business Administration",
        duration: "2 years",
        eligibility: "Bachelor's degree in any discipline (min. 50%)",
        description:
          "Specialisations in finance, marketing, operations and human resources.",
      },
    ],
  },
  [SectionType.FACULTY]: {
    title: "Our Faculty",
    subtitle: "218 full-time faculty members, 64 of them with doctorates.",
    members: [
      {
        name: "Dr. Anita Raghavan",
        designation: "Principal & Professor",
        department: "Computer Science & Engineering",
        photoUrl: "/seed/faculty-1.svg",
      },
      {
        name: "Dr. Suresh Menon",
        designation: "Head of Department",
        department: "Mechanical Engineering",
        photoUrl: "/seed/faculty-2.svg",
      },
      {
        name: "Prof. Kavitha Nair",
        designation: "Associate Professor",
        department: "Electronics & Communication",
        photoUrl: "/seed/faculty-3.svg",
      },
      {
        name: "Dr. Imran Qureshi",
        designation: "Assistant Professor",
        department: "Civil Engineering",
        photoUrl: "/seed/faculty-4.svg",
      },
    ],
  },
  [SectionType.CONTACT]: {
    title: "Contact Us",
    address:
      "Greenfield Institute of Technology, NH-48, Bypass Road, Greenfield, Karnataka 562109",
    phone: "+91 80 2345 6789",
    email: "admissions@greenfield.edu.in",
    mapEmbedUrl: "",
    showContactForm: true,
  },
};

/** Sections placed on each page of the seeded college, in display order. */
const PAGE_LAYOUT: {
  slug: string;
  title: string;
  navOrder: number;
  sections: SupportedSectionType[];
}[] = [
  {
    slug: "home",
    title: "Home",
    navOrder: 0,
    sections: [
      SectionType.HERO,
      SectionType.ABOUT,
      SectionType.COURSES,
      SectionType.FACULTY,
      SectionType.CONTACT,
    ],
  },
  {
    slug: "about",
    title: "About",
    navOrder: 1,
    sections: [SectionType.ABOUT, SectionType.FACULTY],
  },
  { slug: "admissions", title: "Admissions", navOrder: 2, sections: [] },
  {
    slug: "contact",
    title: "Contact",
    navOrder: 3,
    sections: [SectionType.CONTACT],
  },
];

async function main() {
  // --- Theme options -------------------------------------------------------
  const palettes = await Promise.all(
    PALETTES.map((p) =>
      prisma.themePalette.upsert({
        where: { name: p.name },
        update: { colors: p.colors },
        create: p,
      }),
    ),
  );

  const fonts = await Promise.all(
    FONT_PACKS.map((f) =>
      prisma.themeFont.upsert({
        where: { name: f.name },
        update: f,
        create: f,
      }),
    ),
  );

  // --- Template + its sections and variants --------------------------------
  const template = await prisma.template.upsert({
    where: { name: "Radian" },
    update: {},
    create: {
      name: "Radian",
      description:
        "A clean, content-first template for technical colleges and institutes.",
      thumbnailUrl: "/seed/template-radian.svg",
      demoUrl: "/site/greenfield",
    },
  });

  const sectionsByType = new Map<
    SupportedSectionType,
    { id: string; variantIds: string[] }
  >();

  for (const spec of TEMPLATE_SECTIONS) {
    const section = await prisma.section.upsert({
      where: {
        templateId_sectionType: {
          templateId: template.id,
          sectionType: spec.sectionType,
        },
      },
      update: { defaultOrder: spec.defaultOrder, isRequired: spec.isRequired },
      create: {
        templateId: template.id,
        sectionType: spec.sectionType,
        defaultOrder: spec.defaultOrder,
        isRequired: spec.isRequired,
      },
    });

    const variantIds: string[] = [];
    for (const variant of spec.variants) {
      const row = await prisma.sectionVariant.upsert({
        where: {
          sectionId_componentKey: {
            sectionId: section.id,
            componentKey: variant.componentKey,
          },
        },
        update: { variantName: variant.variantName },
        create: { sectionId: section.id, ...variant },
      });
      variantIds.push(row.id);
    }

    sectionsByType.set(spec.sectionType as SupportedSectionType, {
      id: section.id,
      variantIds,
    });
  }

  // --- Sample college ------------------------------------------------------
  const college = await prisma.college.upsert({
    where: { subdomain: "greenfield" },
    update: {
      templateId: template.id,
      themePaletteId: palettes[0].id,
      themeFontId: fonts[0].id,
    },
    create: {
      name: "Greenfield Institute of Technology",
      subdomain: "greenfield",
      templateId: template.id,
      themePaletteId: palettes[0].id,
      themeFontId: fonts[0].id,
      status: CollegeStatus.DRAFT,
    },
  });

  // Login account for the sample college.
  await prisma.user.upsert({
    where: { email: SEED_LOGIN.email },
    update: { collegeId: college.id },
    create: {
      email: SEED_LOGIN.email,
      passwordHash: await bcrypt.hash(SEED_LOGIN.password, 12),
      collegeId: college.id,
    },
  });

  // Rebuild this college's pages and sections so the seed is re-runnable.
  await prisma.collegeSection.deleteMany({ where: { collegeId: college.id } });
  await prisma.page.deleteMany({ where: { collegeId: college.id } });

  for (const pageSpec of PAGE_LAYOUT) {
    const page = await prisma.page.create({
      data: {
        collegeId: college.id,
        slug: pageSpec.slug,
        title: pageSpec.title,
        navOrder: pageSpec.navOrder,
      },
    });

    for (const [index, sectionType] of pageSpec.sections.entries()) {
      const section = sectionsByType.get(sectionType);
      if (!section) throw new Error(`Unseeded section type: ${sectionType}`);

      await prisma.collegeSection.create({
        data: {
          collegeId: college.id,
          sectionId: section.id,
          variantId: section.variantIds[0],
          pageId: page.id,
          displayOrder: index + 1,
          isVisible: true,
          // Validated against the section's Zod schema before it is stored.
          content: parseSectionContent(sectionType, CONTENT[sectionType]),
        },
      });
    }
  }

  const counts = {
    templates: await prisma.template.count(),
    sections: await prisma.section.count(),
    sectionVariants: await prisma.sectionVariant.count(),
    themePalettes: await prisma.themePalette.count(),
    themeFonts: await prisma.themeFont.count(),
    colleges: await prisma.college.count(),
    users: await prisma.user.count(),
    pages: await prisma.page.count(),
    collegeSections: await prisma.collegeSection.count(),
  };

  console.log("Seed complete:", counts);
  console.log(
    `Login: ${SEED_LOGIN.email} / ${SEED_LOGIN.password}  ->  /editor/greenfield`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
