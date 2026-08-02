import { serverApi } from "@/lib/api/server";
import {
  DEFAULT_FONTS,
  parsePaletteColors,
  type FontPack,
  type PaletteColors,
} from "@/lib/theme/theme";
import type { SectionType } from "@/generated/prisma/enums";

export type RenderableSection = {
  id: string;
  sectionType: SectionType;
  componentKey: string;
  variantId: string;
  variantName: string;
  displayOrder: number;
  isVisible: boolean;
  content: unknown;
};

export type SiteNavPage = {
  id: string;
  slug: string;
  title: string;
};

/** What the public page renders into <head>. */
export type SiteSeo = {
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  canonicalSlug: string | null;
};

export type SitePageData = {
  college: {
    id: string;
    name: string;
    subdomain: string;
    status: string;
  };
  theme: { colors: PaletteColors; fonts: FontPack };
  pages: SiteNavPage[];
  currentPage: SiteNavPage;
  seo: SiteSeo;
  sections: RenderableSection[];
  /** True when this is a draft being shown to the college that owns it. */
  isOwnerPreview: boolean;
};

/** A college that exists but has not picked a design, so has nothing to render. */
export type SiteNotBuilt = {
  built: false;
  college: { name: string; subdomain: string };
};

/** What `GET /api/v1/sites/:subdomain` answers with. */
type SitePayload =
  | SiteNotBuilt
  | {
      built: true;
      college: SitePageData["college"];
      theme: {
        paletteColors: unknown;
        headingFont: string | null;
        bodyFont: string | null;
      };
      pages: SiteNavPage[];
      currentPage: SiteNavPage;
      seo: SiteSeo;
      sections: RenderableSection[];
      isOwnerPreview: boolean;
    };

/**
 * One page of one college's site, from the backend.
 *
 * This was a Prisma query against the frontend's own connection, which is
 * exactly why a wrong `DATABASE_URL` here turned every published site into a
 * 500 while the API reported itself healthy. The multi-tenant read lives in the
 * service that owns the data now.
 *
 * Draft visibility moved with it. The rule used to be applied afterwards, by
 * the caller, against a payload it had already been given — which works only
 * for as long as every caller remembers to ask. The backend decides it now, so
 * an unpublished site is simply not in the answer.
 *
 * `null` means nothing to show; a `built: false` result means the college is
 * real and one click from being a website, which is a different page.
 */
export async function getSitePage(
  subdomain: string,
  pageSlug?: string,
): Promise<SitePageData | SiteNotBuilt | null> {
  const query = pageSlug ? `?page=${encodeURIComponent(pageSlug)}` : "";
  let payload: SitePayload | null = null;
  try {
    payload = await serverApi<SitePayload>(
      `/api/v1/sites/${encodeURIComponent(subdomain)}${query}`,
    );
  } catch (error) {
    console.error("[site] could not load site page:", (error as Error).message);
    return null;
  }

  if (!payload) return null;
  if (!payload.built) return payload;

  /*
   * The nav lists the pages the college has, and nothing else.
   *
   * Unioning `DEFAULT_PAGES` over the payload put a link in every visitor's
   * navigation for pages that may not exist: `/site/<sub>/<slug>` calls
   * `notFound()` when the backend has no such page, so a college provisioned
   * before the starter list grew to twelve pages published a header with eight
   * links straight to a 404. A page has to exist to be linked to.
   */
  const fullPages = payload.pages;

  const currentSlug = pageSlug || payload.currentPage?.slug || "home";
  const activePage =
    fullPages.find((page) => page.slug === currentSlug) ?? payload.currentPage;

  const sections = payload.sections;

  return {
    college: payload.college,
    theme: {
      colors: parsePaletteColors(payload.theme.paletteColors),
      fonts:
        payload.theme.headingFont && payload.theme.bodyFont
          ? {
              headingFont: payload.theme.headingFont,
              bodyFont: payload.theme.bodyFont,
            }
          : DEFAULT_FONTS,
    },
    pages: fullPages,
    currentPage: activePage,
    seo: payload.seo,
    sections,
    isOwnerPreview: payload.isOwnerPreview,
  };
}

function getFallbackSectionsForPage(slug: string, collegeName: string): RenderableSection[] {
  const formattedTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return [
    {
      id: `fallback-${slug}-hero`,
      sectionType: "HERO" as SectionType,
      componentKey: "hero_academic_masthead",
      variantId: "v1",
      variantName: "Academic Masthead",
      displayOrder: 0,
      isVisible: true,
      content: {
        collegeName: collegeName || "Kishore7ga Institute of Technology & Science",
        tagline: `${formattedTitle} — NAAC A++ Accredited Academic Portal`,
        intro: `Welcome to the official ${formattedTitle} portal of ${collegeName || "Kishore7ga Institute of Technology & Science"}. Empowering students with world-class education, NAAC accreditation, 98% placement rates, and state-of-the-art facilities.`,
        bannerImageUrl: "/template-brightwood.jpg",
        ctaLabel: "Apply for Admission 2026 »",
        ctaHref: "/admissions",
      },
    },
    {
      id: `fallback-${slug}-about`,
      sectionType: "ABOUT" as SectionType,
      componentKey: "about_two_column",
      variantId: "v2",
      variantName: "Two Column About",
      displayOrder: 1,
      isVisible: true,
      content: {
        title: `${formattedTitle} Overview & Highlights`,
        history: `Founded in 1996, ${collegeName || "Kishore7ga Institute of Technology & Science"} is a premier UGC autonomous institution ranked among India's top tech universities. Offering 18+ NBA accredited degree streams, KITS fosters innovation, hands-on learning, and 100% career guidance.`,
        mission: `To provide rigorous, industry-aligned technical education and nurture future ethical leaders and research pioneers.`,
        vision: `To be recognized among the top educational institutions globally for innovation, academic brilliance, and societal impact.`,
        principalName: "Dr. K. S. Kishore",
        principalDesignation: "FOUNDER & CHANCELLOR",
        principalPhotoUrl: "/seed/principal.svg",
        principalMessage: "Our commitment is to provide students with the critical thinking, technological mastery, and vision needed to solve real-world challenges.",
      },
    },
    {
      id: `fallback-${slug}-courses`,
      sectionType: "COURSES" as SectionType,
      componentKey: "courses_card_grid",
      variantId: "v3",
      variantName: "Courses Card Grid",
      displayOrder: 2,
      isVisible: true,
      content: {
        title: "Courses & Academic Programmes",
        subtitle: "Explore our NBA accredited undergraduate, postgraduate, and doctoral degree streams.",
        courses: [
          {
            name: "B.Tech in Computer Science & Engineering",
            duration: "4 Years (8 Semesters)",
            eligibility: "10+2 PCM Min 60% + JEE Main Score",
            description: "Core curriculum in Algorithms, Data Structures, Full Stack Web Development, Cloud Architecture, and AI.",
          },
          {
            name: "B.Tech in Artificial Intelligence & Data Science",
            duration: "4 Years (8 Semesters)",
            eligibility: "10+2 PCM Min 65% + Merit Score",
            description: "Specialized training in Machine Learning, Deep Learning, Natural Language Processing, and Big Data Systems.",
          },
          {
            name: "B.Tech in Electronics & Communication",
            duration: "4 Years (8 Semesters)",
            eligibility: "10+2 PCM Min 60%",
            description: "VLSI Semiconductor Design, Embedded Systems, Robotics, Wireless 5G Networks, and Signal Processing.",
          },
          {
            name: "M.Tech in Cyber Security & Digital Forensics",
            duration: "2 Years (4 Semesters)",
            eligibility: "B.Tech/BE in CSE/IT + GATE Score",
            description: "Advanced postgraduate program covering Network Defense, Cryptography, Penetration Testing, and Forensics.",
          },
          {
            name: "MBA - Technology & Business Leadership",
            duration: "2 Years (4 Semesters)",
            eligibility: "Bachelor's Degree Min 50% + CAT/MAT",
            description: "Equips business executives with tech-driven strategy, FinTech, product management, and corporate analytics.",
          },
        ],
      },
    },
    {
      id: `fallback-${slug}-faculty`,
      sectionType: "FACULTY" as SectionType,
      componentKey: "faculty_photo_cards",
      variantId: "v4",
      variantName: "Faculty Photo Cards",
      displayOrder: 3,
      isVisible: true,
      content: {
        title: "Faculty Directory & Mentors",
        subtitle: "Learn from distinguished academicians, researchers, and former industry leaders.",
        members: [
          {
            name: "Dr. Aris Thorne",
            designation: "Dean of Computer Science",
            department: "Computer Science & AI",
            photoUrl: "/seed/faculty-1.svg",
          },
          {
            name: "Dr. Meera Sen",
            designation: "Head of AI Research Lab",
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
        ],
      },
    },
    {
      id: `fallback-${slug}-contact`,
      sectionType: "CONTACT" as SectionType,
      componentKey: "contact_map_split",
      variantId: "v5",
      variantName: "Contact Map Split",
      displayOrder: 4,
      isVisible: true,
      content: {
        title: "Contact & Admissions Helpdesk",
        address: "Kishore7ga Tech Campus, Innovation Parkway, Tech City - 560100",
        phone: "+91 (080) 4567-8900 / Toll-Free: 1800-425-7000",
        email: "admissions@kishore7ga.edu",
        mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.752391087401!2d77.5945627!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8380f5385e99f8d!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1680000000000!5m2!1sen!2sin",
        showContactForm: true,
      },
    },
  ];
}

/** Narrows the union above, so callers read as intent rather than as a field check. */
export function isBuilt(
  data: SitePageData | SiteNotBuilt | null,
): data is SitePageData {
  return data !== null && !("built" in data && data.built === false);
}

/**
 * What a template would look like on this college, without writing anything.
 *
 * Screen 2 asks a college with no site yet to judge a design, which it cannot do
 * from an empty frame: the site read correctly answers "nothing here" for a
 * college with no pages, and the preview iframe went blank at exactly the moment
 * the template most needed showing. The backend generates what "Start with this
 * design" is about to create — same starter pages, same lead variant, same
 * default copy — so the preview is a promise the action keeps.
 *
 * It answers in the same shape as the site read, which is why one renderer draws
 * both and this only has to map the theme.
 */
export async function getTemplatePreview(
  subdomain: string,
  templateId: string,
): Promise<SitePageData | null> {
  const payload = await serverApi<Extract<SitePayload, { built: true }>>(
    `/api/v1/sites/${encodeURIComponent(subdomain)}/preview` +
      `?template=${encodeURIComponent(templateId)}`,
  );
  if (!payload) return null;

  return {
    college: payload.college,
    theme: {
      colors: parsePaletteColors(payload.theme.paletteColors),
      fonts:
        payload.theme.headingFont && payload.theme.bodyFont
          ? {
              headingFont: payload.theme.headingFont,
              bodyFont: payload.theme.bodyFont,
            }
          : DEFAULT_FONTS,
    },
    pages: payload.pages,
    currentPage: payload.currentPage,
    seo: payload.seo,
    sections: payload.sections,
    isOwnerPreview: payload.isOwnerPreview,
  };
}

