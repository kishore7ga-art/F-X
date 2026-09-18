"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Minus,
  Plus,
  Sparkles,
  X,
  Palette,
  BookOpen,
  FileText,
  Building2,
  GraduationCap,
} from "lucide-react";

import { ApiError, completeOnboardingRequest } from "@/lib/api-client";
import { EDITOR_FONTS, EDITOR_THEMES } from "@/lib/editor-themes";
import { OnboardingShowcaseImage } from "./OnboardingShowcaseImage";

type Step = 0 | 1 | 2;
type BuilderTab = "topic" | "goals" | "site_info" | "pages" | "colors" | "fonts";

// 14 Educational & Institutional Website Goals tailored for XITE
const INSTITUTIONAL_GOALS = [
  { id: "courses", label: "Showcase academic degrees & programs", defaultChecked: true },
  { id: "admissions", label: "Accept online student admissions", defaultChecked: true },
  { id: "placements", label: "Highlight placements & top recruiters", defaultChecked: true },
  { id: "research", label: "Publish faculty research & publications", defaultChecked: false },
  { id: "facilities", label: "Promote campus facilities & infrastructure", defaultChecked: true },
  { id: "events", label: "Announce circulars, events & news", defaultChecked: false },
  { id: "alumni", label: "Connect alumni network & endowments", defaultChecked: false },
  { id: "faculty", label: "Display faculty directory & leadership", defaultChecked: true },
  { id: "accreditation", label: "Share NAAC, NIRF & NBA accreditations", defaultChecked: true },
  { id: "clubs", label: "Manage student clubs & campus life", defaultChecked: false },
  { id: "exams", label: "Provide examination schedules & results", defaultChecked: false },
  { id: "contact", label: "Offer admissions enquiry & contact form", defaultChecked: true },
  { id: "virtual_tour", label: "Host virtual 3D campus showcase", defaultChecked: false },
  { id: "vision", label: "Publish institutional vision & achievements", defaultChecked: true },
] as const;

// Institutional Brand Personalities (Matching Screenshot 3)
const BRAND_PERSONALITIES = [
  {
    id: "professional",
    title: "Professional & Accredited",
    desc: "Authoritative. Credible. Polished.",
    heroTitle: "Excellence in Higher Education & Research",
    heroSubtitle:
      "Premier NAAC A++ accredited autonomous institution cultivating technological leadership, scientific inquiry, and global career outcomes.",
  },
  {
    id: "innovative",
    title: "Modern & Research-Driven",
    desc: "Forward-thinking. High-tech. Dynamic.",
    heroTitle: "Engineering the Future with Innovation",
    heroSubtitle:
      "Leading multidisciplinary campus empowering next-gen researchers through AI laboratories, advanced robotics, and patent innovation.",
  },
  {
    id: "scholarly",
    title: "Scholarly & Heritage",
    desc: "Rigorous. Academic. Cultured.",
    heroTitle: "A Legacy of Intellectual Distinction",
    heroSubtitle:
      "Upholding a storied tradition of scientific discovery, distinguished faculty scholarship, and transformative postgraduate education.",
  },
  {
    id: "vibrant",
    title: "Student-Centric & Vibrant",
    desc: "Energetic. Welcoming. Community-focused.",
    heroTitle: "Where Passion Meets Purpose & Career",
    heroSubtitle:
      "An inspiring university campus offering world-class student life, dynamic hackathons, industry internships, and 100% placement support.",
  },
] as const;

// Institutional Pages (Matching Screenshot 4)
const INSTITUTIONAL_PAGES = [
  {
    id: "home",
    label: "Homepage",
    required: true,
    title: "Main Institutional Portal",
    badge: "Required",
    summary: "Welcome hero, university highlights, quick links, and active announcements.",
    img: "/onboarding/campus-showcase.jpg",
  },
  {
    id: "about",
    label: "About College",
    required: false,
    title: "About Our Institution",
    summary: "Founding history, chancellor message, NAAC accreditation, vision & mission statements.",
    img: "/tab2-templates.jpg",
  },
  {
    id: "academics",
    label: "Academic Programs",
    required: false,
    title: "Degree Streams & Curriculum",
    summary: "Undergraduate B.Tech, Postgraduate M.Tech, Doctoral Research, and Department syllabi.",
    img: "/tab1-builder.jpg",
  },
  {
    id: "admissions",
    label: "Admissions 2026",
    required: false,
    title: "Admissions & Applications",
    summary: "Eligibility criteria, merit scholarship schemes, fee structures, and application form.",
    img: "/onboarding/oxford.jpg",
  },
  {
    id: "placements",
    label: "Placements & Careers",
    required: false,
    title: "Training & Corporate Placements",
    summary: "Top recruiting MNCs, 100% placement track record, average packages, and alumni talks.",
    img: "/onboarding/team-collaboration.jpg",
  },
  {
    id: "faculty",
    label: "Faculty Directory",
    required: false,
    title: "Distinguished Academic Faculty",
    summary: "Dean & HOD profiles, research citations, patents, and faculty directory.",
    img: "/onboarding/cranfield.jpg",
  },
  {
    id: "contact",
    label: "Contact & Campus Map",
    required: false,
    title: "Helpdesk & Location Map",
    summary: "Registrar contacts, campus navigation, admissions enquiry form, and public helpdesk.",
    img: "/onboarding/georgetown.jpg",
  },
] as const;

// Curated Educational Color Palettes in 3 Categories (Matching Screenshot 5)
type PaletteGroup = {
  category: string;
  badge?: string;
  palettes: {
    id: string;
    name: string;
    colors: [string, string, string, string, string]; // 5 horizontal swatches
    accent: string;
    bg: string;
    text: string;
  }[];
};

const CURATED_PALETTE_GROUPS: PaletteGroup[] = [
  {
    category: "Professional",
    palettes: [
      {
        id: "academic-blue",
        name: "Academic Navy",
        colors: ["#FFFFFF", "#F8FAFC", "#2563EB", "#1E3A8A", "#0F172A"],
        accent: "#2563EB",
        bg: "#FFFFFF",
        text: "#0F172A",
      },
      {
        id: "emerald-campus",
        name: "Forest Emerald",
        colors: ["#FFFFFF", "#ECFDF5", "#059669", "#064E3B", "#022C22"],
        accent: "#059669",
        bg: "#FFFFFF",
        text: "#064E3B",
      },
      {
        id: "monochrome",
        name: "Institutional Mono",
        colors: ["#FFFFFF", "#F3F4F6", "#9CA3AF", "#1F2937", "#000000"],
        accent: "#1F2937",
        bg: "#FFFFFF",
        text: "#000000",
      },
      {
        id: "oxford-blue",
        name: "Oxford Cyan",
        colors: ["#FFFFFF", "#F0F9FF", "#0284C7", "#0369A1", "#082F49"],
        accent: "#0284C7",
        bg: "#FFFFFF",
        text: "#082F49",
      },
    ],
  },
  {
    category: "Playful",
    badge: "Recommended",
    palettes: [
      {
        id: "crimson-maroon",
        name: "Heritage Crimson",
        colors: ["#FFF1F2", "#FFE4E6", "#E11D48", "#881337", "#4C0519"],
        accent: "#E11D48",
        bg: "#FFF1F2",
        text: "#4C0519",
      },
      {
        id: "amber-sapphire",
        name: "Gold & Sapphire",
        colors: ["#FFFBEB", "#FEF3C7", "#D97706", "#2563EB", "#1E293B"],
        accent: "#D97706",
        bg: "#FFFBEB",
        text: "#1E293B",
      },
      {
        id: "indigo-violet",
        name: "Innovation Violet",
        colors: ["#FAF5FF", "#F3E8FF", "#7C3AED", "#4C1D95", "#1E1B4B"],
        accent: "#7C3AED",
        bg: "#FAF5FF",
        text: "#1E1B4B",
      },
      {
        id: "coastal-teal",
        name: "Campus Teal",
        colors: ["#F0FDFA", "#CCFBF1", "#0D9488", "#115E59", "#042F2E"],
        accent: "#0D9488",
        bg: "#F0FDFA",
        text: "#042F2E",
      },
    ],
  },
  {
    category: "Sophisticated",
    palettes: [
      {
        id: "warm-terracotta",
        name: "Collegiate Terracotta",
        colors: ["#FFFBEB", "#FEF3C7", "#EA580C", "#44403C", "#1C1917"],
        accent: "#EA580C",
        bg: "#FFFBEB",
        text: "#1C1917",
      },
      {
        id: "regal-sand",
        name: "Autonomous Sand",
        colors: ["#FAF5F0", "#F5EBE1", "#C29B38", "#5C4B37", "#2D241E"],
        accent: "#C29B38",
        bg: "#FAF5F0",
        text: "#2D241E",
      },
      {
        id: "scholarly-slate",
        name: "Scholarly Slate",
        colors: ["#F8FAFC", "#F1F5F9", "#64748B", "#334155", "#0F172A"],
        accent: "#64748B",
        bg: "#F8FAFC",
        text: "#0F172A",
      },
      {
        id: "midnight-purple",
        name: "Obsidian Purple",
        colors: ["#0D0418", "#180828", "#A855F7", "#C084FC", "#FAF5FF"],
        accent: "#A855F7",
        bg: "#FAF5FF",
        text: "#0D0418",
      },
    ],
  },
];

// Curated Educational Font Pairings in 4 Categories (Matching Screenshot 6)
export type FontPairing = {
  id: string;
  name: string;
  category: "Professional" | "Playful" | "Sophisticated" | "Friendly";
  backendFontId: "inter" | "outfit" | "serif";
  headingFamily: string;
  headingClass: string;
  bodyFamily: string;
  previewHeading: string;
  previewParagraph: string;
};

export type FontGroup = {
  category: "Professional" | "Playful" | "Sophisticated" | "Friendly";
  badge?: string;
  pairings: FontPairing[];
};

export const CURATED_FONT_GROUPS: FontGroup[] = [
  {
    category: "Professional",
    pairings: [
      {
        id: "modern-sans",
        name: "Modern Sans",
        category: "Professional",
        backendFontId: "inter",
        headingFamily: "var(--font-inter, 'Inter', system-ui, -apple-system, sans-serif)",
        headingClass: "font-semibold text-lg sm:text-xl tracking-tight",
        bodyFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)",
        previewHeading: "Heading",
        previewParagraph: "This is your paragraph.",
      },
      {
        id: "technical-sans",
        name: "Technical Sans",
        category: "Professional",
        backendFontId: "outfit",
        headingFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
        headingClass: "font-medium text-lg sm:text-xl tracking-tight",
        bodyFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)",
        previewHeading: "Heading",
        previewParagraph: "This is your paragraph.",
      },
    ],
  },
  {
    category: "Playful",
    badge: "Recommended",
    pairings: [
      {
        id: "expressive-display",
        name: "Expressive Display",
        category: "Playful",
        backendFontId: "outfit",
        headingFamily: "'Outfit', 'Arial Black', Impact, sans-serif",
        headingClass: "font-black italic text-xl sm:text-2xl tracking-tight",
        bodyFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)",
        previewHeading: "Heading",
        previewParagraph: "This is your paragraph.",
      },
      {
        id: "bold-grotesk",
        name: "Bold Grotesk",
        category: "Playful",
        backendFontId: "outfit",
        headingFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
        headingClass: "font-extrabold text-xl sm:text-2xl tracking-tight",
        bodyFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)",
        previewHeading: "Heading",
        previewParagraph: "This is your paragraph.",
      },
    ],
  },
  {
    category: "Sophisticated",
    pairings: [
      {
        id: "editorial-serif",
        name: "Editorial Serif",
        category: "Sophisticated",
        backendFontId: "serif",
        headingFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
        headingClass: "font-serif font-normal text-xl sm:text-2xl",
        bodyFamily: "var(--font-inter, 'Inter', Georgia, serif)",
        previewHeading: "Heading",
        previewParagraph: "This is your paragraph.",
      },
      {
        id: "academic-heritage",
        name: "Academic Heritage",
        category: "Sophisticated",
        backendFontId: "serif",
        headingFamily: "'Playfair Display', 'Times New Roman', Georgia, serif",
        headingClass: "font-serif font-bold text-xl sm:text-2xl",
        bodyFamily: "Georgia, 'Times New Roman', serif",
        previewHeading: "Heading",
        previewParagraph: "This is your paragraph.",
      },
    ],
  },
  {
    category: "Friendly",
    pairings: [
      {
        id: "warm-rounded",
        name: "Warm Rounded",
        category: "Friendly",
        backendFontId: "outfit",
        headingFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        headingClass: "font-semibold text-xl sm:text-2xl tracking-normal",
        bodyFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)",
        previewHeading: "Heading",
        previewParagraph: "This is your paragraph.",
      },
      {
        id: "humanist-sans",
        name: "Humanist Sans",
        category: "Friendly",
        backendFontId: "inter",
        headingFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)",
        headingClass: "font-bold text-xl sm:text-2xl",
        bodyFamily: "var(--font-inter, 'Inter', system-ui, sans-serif)",
        previewHeading: "Heading",
        previewParagraph: "This is your paragraph.",
      },
    ],
  },
];

// Rich Multi-Section Page Canvas Mockup (Matches Screenshot 4, 5, 6 exactly)
function MockPageCanvasCard({
  page,
  siteTitle,
  activePalette,
  activeFontPairing,
}: {
  page: (typeof INSTITUTIONAL_PAGES)[number];
  siteTitle: string;
  activePalette: (typeof CURATED_PALETTE_GROUPS)[number]["palettes"][number];
  activeFontPairing: FontPairing;
}) {
  return (
    <div
      className="w-full h-[520px] sm:h-[580px] lg:h-[620px] rounded-xl shadow-2xl overflow-y-auto border border-white/20 flex flex-col transition-colors duration-500 scrollbar-none"
      style={{ backgroundColor: activePalette.bg, color: activePalette.text }}
    >
      {/* Mock Nav */}
      <div
        className="sticky top-0 z-10 px-5 py-3 border-b flex items-center justify-between backdrop-blur-md"
        style={{
          borderColor: `${activePalette.text}15`,
          backgroundColor: `${activePalette.bg}FA`,
        }}
      >
        <span className="font-bold text-xs truncate max-w-[160px]">
          {siteTitle}
        </span>
        <div className="flex items-center gap-3 text-[10px] font-medium opacity-70">
          <span>About</span>
          <span>Programs</span>
          <span>Admissions</span>
        </div>
      </div>

      {/* PAGE: HOMEPAGE (Matches Screenshot 6 Card 1) */}
      {page.id === "home" && (
        <div className="p-6 space-y-6">
          {/* Main Hero Heading */}
          <h1
            className={`text-2xl sm:text-3xl leading-tight ${activeFontPairing.headingClass}`}
            style={{ fontFamily: activeFontPairing.headingFamily }}
          >
            Empowering Next-Gen Innovators
          </h1>

          {/* Hero Banner Image */}
          <div className="h-44 sm:h-52 w-full rounded-lg overflow-hidden relative bg-neutral-100 shadow-xs">
            <img
              src="/onboarding/campus-showcase.jpg"
              alt="University Campus"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
              <span className="text-[11px] text-white/90 font-medium">
                Ranked #1 Autonomous Technical University 2026
              </span>
            </div>
          </div>

          {/* Section 2: Flagship Academic Programs (Matches 'Creative Services' in Screenshot 6) */}
          <div className="pt-2 space-y-3">
            <h2
              className={`text-lg sm:text-xl leading-snug ${activeFontPairing.headingClass}`}
              style={{ fontFamily: activeFontPairing.headingFamily }}
            >
              Flagship Academic Programs
            </h2>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1.5 flex flex-col">
                <div className="h-20 w-full rounded overflow-hidden bg-neutral-100">
                  <img
                    src="/tab1-builder.jpg"
                    alt="B.Tech"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-[10px] font-bold truncate">B.Tech CSE</div>
                <div className="text-[9px] opacity-70">4 Years • Full Time</div>
                <div
                  className="mt-auto py-1 px-1.5 text-center text-[9px] font-bold text-white rounded transition-colors shadow-xs"
                  style={{ backgroundColor: activePalette.accent }}
                >
                  Apply Now
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <div className="h-20 w-full rounded overflow-hidden bg-neutral-100">
                  <img
                    src="/tab2-templates.jpg"
                    alt="MBA"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-[10px] font-bold truncate">MBA Leadership</div>
                <div className="text-[9px] opacity-70">2 Years • PG</div>
                <div
                  className="mt-auto py-1 px-1.5 text-center text-[9px] font-bold text-white rounded transition-colors shadow-xs"
                  style={{ backgroundColor: activePalette.accent }}
                >
                  Apply Now
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <div className="h-20 w-full rounded overflow-hidden bg-neutral-100">
                  <img
                    src="/onboarding/team-collaboration.jpg"
                    alt="Research"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-[10px] font-bold truncate">AI Research</div>
                <div className="text-[9px] opacity-70">Doctoral Fellowship</div>
                <div
                  className="mt-auto py-1 px-1.5 text-center text-[9px] font-bold text-white rounded transition-colors shadow-xs"
                  style={{ backgroundColor: activePalette.accent }}
                >
                  Apply Now
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE: ABOUT (Matches Screenshot 6 Card 2) */}
      {page.id === "about" && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 items-start">
            <div className="space-y-2">
              <h1
                className={`text-xl sm:text-2xl leading-tight ${activeFontPairing.headingClass}`}
                style={{ fontFamily: activeFontPairing.headingFamily }}
              >
                A Legacy of Academic Distinction
              </h1>
              <p
                className="text-[11px] opacity-75 leading-relaxed"
                style={{ fontFamily: activeFontPairing.bodyFamily }}
              >
                Fostering technological innovation, interdisciplinary research, and ethics across two decades of excellence.
              </p>
            </div>
            <div className="h-36 rounded-lg overflow-hidden bg-neutral-100 shadow-xs">
              <img
                src="/onboarding/oxford.jpg"
                alt="About College"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Section 2: Admissions Inquiry Form (Matches Form in Screenshot 6) */}
          <div
            className="p-4 rounded-xl space-y-3"
            style={{
              backgroundColor: `${activePalette.text}06`,
              borderColor: `${activePalette.text}15`,
            }}
          >
            <h2
              className={`text-base font-bold ${activeFontPairing.headingClass}`}
              style={{ fontFamily: activeFontPairing.headingFamily }}
            >
              Ready to Join Our Campus?
            </h2>
            <p className="text-[10px] opacity-70 leading-relaxed">
              Drop an admissions enquiry and our faculty counsellors will assist you.
            </p>

            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="h-7 px-2.5 rounded border text-[10px] flex items-center opacity-60"
                  style={{ borderColor: `${activePalette.text}25` }}
                >
                  First Name
                </div>
                <div
                  className="h-7 px-2.5 rounded border text-[10px] flex items-center opacity-60"
                  style={{ borderColor: `${activePalette.text}25` }}
                >
                  Last Name
                </div>
              </div>
              <div
                className="h-7 px-2.5 rounded border text-[10px] flex items-center opacity-60"
                style={{ borderColor: `${activePalette.text}25` }}
              >
                Email Address
              </div>
              <div className="flex items-center gap-1.5 text-[9px] opacity-75">
                <div
                  className="h-3 w-3 rounded-xs border"
                  style={{ borderColor: `${activePalette.text}40` }}
                />
                <span>Sign up for admissions circulars</span>
              </div>
              <div
                className="h-10 px-2.5 py-1 rounded border text-[10px] opacity-60"
                style={{ borderColor: `${activePalette.text}25` }}
              >
                Message (optional)
              </div>
              <div
                className="h-7 px-4 rounded text-[10px] font-bold text-white flex items-center justify-center cursor-pointer shadow-xs"
                style={{ backgroundColor: activePalette.text }}
              >
                Submit Inquiry
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGE: CONTACT (Matches Screenshot 6 Card 3) */}
      {page.id === "contact" && (
        <div className="p-6 space-y-5">
          <h1
            className={`text-xl sm:text-2xl leading-tight ${activeFontPairing.headingClass}`}
            style={{ fontFamily: activeFontPairing.headingFamily }}
          >
            Admissions Desk & Campus Helpline
          </h1>
          <p
            className="text-[11px] opacity-75 leading-relaxed"
            style={{ fontFamily: activeFontPairing.bodyFamily }}
          >
            Have a project or admission query in mind? Reach out to our campus desk.
          </p>

          <div className="space-y-2.5 pt-1">
            <div
              className="h-7 px-2.5 rounded border text-[10px] flex items-center opacity-60"
              style={{ borderColor: `${activePalette.text}25` }}
            >
              Your Name
            </div>
            <div
              className="h-7 px-2.5 rounded border text-[10px] flex items-center opacity-60"
              style={{ borderColor: `${activePalette.text}25` }}
            >
              Your Email Address
            </div>
            <div
              className="h-14 px-2.5 py-1 rounded border text-[10px] opacity-60"
              style={{ borderColor: `${activePalette.text}25` }}
            >
              How can our admissions committee help?
            </div>
            <div
              className="h-7 px-4 rounded text-[10px] font-bold text-white flex items-center justify-center cursor-pointer shadow-xs"
              style={{ backgroundColor: activePalette.text }}
            >
              Send Message
            </div>
          </div>

          <div
            className="pt-6 border-t opacity-60 text-[10px] flex items-center justify-between"
            style={{ borderColor: `${activePalette.text}15` }}
          >
            <span>{siteTitle}</span>
            <span>Accredited Institutional Portal</span>
          </div>
        </div>
      )}

      {/* OTHER PAGES: Programs, Admissions, Placements, Faculty */}
      {page.id !== "home" && page.id !== "about" && page.id !== "contact" && (
        <div className="p-6 space-y-4">
          <h1
            className={`text-xl leading-tight ${activeFontPairing.headingClass}`}
            style={{ fontFamily: activeFontPairing.headingFamily }}
          >
            {page.title}
          </h1>

          <div className="h-44 w-full rounded-lg overflow-hidden relative bg-neutral-100">
            <img
              src={page.img}
              alt={page.title}
              className="h-full w-full object-cover object-center"
            />
          </div>

          <p
            className="text-xs opacity-75 leading-relaxed"
            style={{ fontFamily: activeFontPairing.bodyFamily }}
          >
            {page.summary}
          </p>

          <div className="pt-2 flex items-center gap-2">
            <div
              className="h-6 px-3 rounded text-[11px] font-bold text-white flex items-center justify-center shadow-xs transition-colors duration-300"
              style={{ backgroundColor: activePalette.accent }}
            >
              View Section
            </div>
            <div
              className="h-6 px-3 rounded text-[11px] font-medium border flex items-center justify-center"
              style={{
                borderColor: `${activePalette.text}25`,
                backgroundColor: `${activePalette.text}05`,
              }}
            >
              Details &rarr;
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OnboardingWizard({
  subdomain,
  collegeName,
  initialCollegeType,
}: {
  subdomain: string;
  collegeName: string;
  initialCollegeType?: string | null;
}) {
  const [step, setStep] = useState<Step>(0);

  // Step 1: Goals State
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(() => {
    return new Set(
      INSTITUTIONAL_GOALS.filter((g) => g.defaultChecked).map((g) => g.id)
    );
  });

  // Step 2: Blueprint AI Studio State (Screenshots 3, 4, 5, 6)
  const [builderTab, setBuilderTab] = useState<BuilderTab>("site_info");
  const [siteTitle, setSiteTitle] = useState(collegeName || "Greenfield University");
  const [selectedPersonality, setSelectedPersonality] = useState<string>("professional");
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>("academic-blue");
  // Default selected font pairing: Expressive Display (matches Screenshot 6)
  const [selectedFontPairingId, setSelectedFontPairingId] = useState<string>("expressive-display");

  // Selected Pages (Pages tab)
  const [selectedPages, setSelectedPages] = useState<Set<string>>(
    new Set(["home", "about", "academics", "admissions", "contact"])
  );

  // Carousel zoom and scroll state
  const [zoomScale, setZoomScale] = useState(1);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Toggle goal
  function toggleGoal(id: string) {
    setSelectedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Toggle page
  function togglePage(id: string) {
    if (id === "home") return; // Home is required
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function scrollCarousel(direction: "left" | "right") {
    if (carouselRef.current) {
      const amount = direction === "left" ? -420 : 420;
      carouselRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  }

  // Find active palette details
  let activePalette = CURATED_PALETTE_GROUPS[0].palettes[0];
  for (const group of CURATED_PALETTE_GROUPS) {
    const found = group.palettes.find((p) => p.id === selectedPaletteId);
    if (found) {
      activePalette = found;
      break;
    }
  }

  // Find active font pairing details (Matching Screenshot 6)
  let activeFontPairing = CURATED_FONT_GROUPS[1].pairings[0];
  for (const group of CURATED_FONT_GROUPS) {
    const found = group.pairings.find((p) => p.id === selectedFontPairingId);
    if (found) {
      activeFontPairing = found;
      break;
    }
  }

  // Stepper advancement
  function handleAdvanceStepper() {
    const tabs: BuilderTab[] = ["site_info", "pages", "colors", "fonts"];
    const currentIdx = tabs.indexOf(builderTab);
    if (currentIdx !== -1 && currentIdx < tabs.length - 1) {
      setBuilderTab(tabs[currentIdx + 1]);
    } else {
      handleLaunchEditor();
    }
  }

  function handleBackStepper() {
    const tabs: BuilderTab[] = ["site_info", "pages", "colors", "fonts"];
    const currentIdx = tabs.indexOf(builderTab);
    if (currentIdx > 0) {
      setBuilderTab(tabs[currentIdx - 1]);
    } else {
      setStep(1);
    }
  }

  // Final Action: Complete onboarding and launch the editor ("go the build now")
  async function handleLaunchEditor() {
    setPending(true);
    setError(null);

    try {
      await completeOnboardingRequest({
        role: "principal",
        themePaletteId: selectedPaletteId,
        themeFontId: activeFontPairing.backendFontId,
      });

      try {
        localStorage.setItem(
          `xite_onboarding_${subdomain}`,
          JSON.stringify({
            siteTitle,
            selectedPersonality,
            themePaletteId: selectedPaletteId,
            themeFontId: activeFontPairing.backendFontId,
            selectedFontPairingId,
            selectedGoals: Array.from(selectedGoals),
            selectedPages: Array.from(selectedPages),
            completedAt: new Date().toISOString(),
          })
        );
      } catch {
        // ignore localStorage errors
      }

      // Hard redirect to editor
      window.location.assign(`/editor/${subdomain}`);
    } catch (cause) {
      setPending(false);
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Could not initialize editor builder. Please try again or click SKIP TO CANVAS."
      );
    }
  }

  const activePersonalityData =
    BRAND_PERSONALITIES.find((p) => p.id === selectedPersonality) ||
    BRAND_PERSONALITIES[0];

  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-neutral-900 font-sans selection:bg-black selection:text-white">
      {/* Preload Google Font Playfair Display for academic serif pairings */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
      />
      {/* ─────────────────────────────────────────────────────────────
          STEP 0: "What do you want to do with your website?"
          (Screenshot 1: Split Screen with 14 Educational Options)
         ───────────────────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="min-h-screen w-full flex">
          {/* Left Workspace Panel */}
          <div className="flex-1 min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 max-w-[1320px]">
            {/* Top Bar */}
            <header className="w-full flex items-center justify-between pb-6">
              <div className="flex items-center gap-2.5 group select-none">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white p-1 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-black text-lg tracking-tight text-black">
                  XITE
                </span>
              </div>

              {/* Skip Link (Matches Screenshot 1 top-right) */}
              <Link
                href={`/editor/${subdomain}`}
                className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black transition-colors"
              >
                I&apos;M JUST BROWSING
              </Link>
            </header>

            {error && (
              <div className="my-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Main Question & Grid Area */}
            <main className="my-auto py-6 sm:py-8 lg:py-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* Left Column: Title & 2-Segment Progress Bar */}
                <div className="lg:col-span-4 space-y-4">
                  <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-neutral-900 leading-[1.18]">
                    What do you want to do with your website?
                  </h1>

                  {/* 2-Segment Progress Indicator (Step 1 of 2: 1st black, 2nd grey) */}
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 w-20">
                      <div className="h-[2.5px] w-8 bg-black rounded-full transition-all" />
                      <div className="h-[2.5px] w-8 bg-neutral-200 rounded-full transition-all" />
                    </div>
                  </div>
                </div>

                {/* Right Column: 14 Selection Cards in 2 Columns */}
                <div className="lg:col-span-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    {INSTITUTIONAL_GOALS.map((item) => {
                      const isChecked = selectedGoals.has(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleGoal(item.id)}
                          className={`group flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer select-none ${
                            isChecked
                              ? "bg-neutral-100/90 border-neutral-300 shadow-xs"
                              : "bg-[#F9FAFB] border-neutral-100/90 hover:bg-neutral-100/60 hover:border-neutral-200"
                          }`}
                        >
                          {/* Square Checkbox (Matches Reference Screenshot) */}
                          <div
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border transition-colors ${
                              isChecked
                                ? "bg-black border-black text-white"
                                : "bg-white border-neutral-300 group-hover:border-neutral-400"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>

                          <span className="text-[13px] sm:text-sm font-normal text-neutral-800 leading-snug">
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </main>

            {/* Bottom Bar: BACK on Left, NEXT on Right */}
            <footer className="w-full flex items-center justify-between pt-6 border-t border-neutral-100">
              <button
                type="button"
                disabled
                className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest border border-neutral-200 rounded text-neutral-400 bg-neutral-50 cursor-not-allowed opacity-40"
              >
                BACK
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-8 py-2.5 text-xs font-bold uppercase tracking-widest bg-black text-white rounded hover:bg-neutral-800 active:bg-neutral-900 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                NEXT
              </button>
            </footer>
          </div>

          {/* Right Vertical Campus Showcase Image */}
          <aside className="hidden lg:block lg:w-[28%] xl:w-[30%] min-h-screen relative shrink-0 border-l border-neutral-100">
            <OnboardingShowcaseImage />
          </aside>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 1: "How would you like to get started?"
          (Screenshot 2: Templates vs AI Builder Cards)
         ───────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 max-w-[1400px] mx-auto">
          {/* Top Bar */}
          <header className="w-full flex items-center justify-between pb-6">
            <div className="flex items-center gap-2.5 group select-none">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white p-1 shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-black text-lg tracking-tight text-black">
                XITE
              </span>
            </div>

            {/* CLOSE Button */}
            <Link
              href={`/editor/${subdomain}`}
              className="text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-black transition-colors"
            >
              CLOSE
            </Link>
          </header>

          {error && (
            <div className="my-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Main Area: Title on Left, 2 Cards on Right */}
          <main className="my-auto py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
              {/* Left Column: Headline & Progress Bar */}
              <div className="lg:col-span-4 space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-neutral-900 leading-[1.18]">
                  How would you like to get started?
                </h1>

                {/* 2-Segment Progress Indicator */}
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 w-20">
                    <div className="h-[2.5px] w-8 bg-neutral-300 rounded-full transition-all" />
                    <div className="h-[2.5px] w-8 bg-black rounded-full transition-all" />
                  </div>
                </div>
              </div>

              {/* Right Area: Two Large Cards Side-by-Side */}
              <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {/* ── CARD 1: Professional Website Templates / Build Now ── */}
                <div
                  onClick={() => {
                    setStep(2);
                    setBuilderTab("site_info");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between hover:border-neutral-300"
                >
                  <div>
                    <div className="h-44 sm:h-52 w-full overflow-hidden bg-neutral-100 relative">
                      <img
                        src="/tab2-templates.jpg"
                        alt="Professional Website Templates"
                        className="h-full w-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 sm:p-7">
                      <h3 className="text-xs font-bold text-neutral-900 tracking-tight mb-2">
                        Professional Website Templates
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                        Choose from a curated set of designer templates or Blueprint AI templates made for you.
                      </p>
                    </div>
                  </div>

                  <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-2 flex items-center justify-between">
                    <span className="text-base font-bold text-neutral-900 group-hover:text-black flex items-center gap-2">
                      <span>Build Now</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>

                {/* ── CARD 2: AI Website Builder / Build a Website ── */}
                <div
                  onClick={() => {
                    setStep(2);
                    setBuilderTab("site_info");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between hover:border-neutral-300"
                >
                  <div>
                    <div className="h-44 sm:h-52 w-full overflow-hidden bg-neutral-100 relative">
                      <img
                        src="/tab1-builder.jpg"
                        alt="AI Website Builder"
                        className="h-full w-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 sm:p-7">
                      <h3 className="text-xs font-bold text-neutral-900 tracking-tight mb-2">
                        AI Website Builder
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                        Let Blueprint AI build you a custom starting point that&apos;s ready to make your own.
                      </p>
                    </div>
                  </div>

                  <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-2 flex items-center justify-between">
                    <span className="text-base font-bold text-neutral-900 group-hover:text-black flex items-center gap-2">
                      <span>Build a Website</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Bottom Bar: BACK on Left */}
          <footer className="w-full flex items-center justify-between pt-6 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => {
                setStep(0);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest border border-neutral-200 rounded text-neutral-800 bg-white hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
            >
              BACK
            </button>
          </footer>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STEP 2: BLUEPRINT AI BUILDER STUDIO
          (Screenshot 3, 4, 5: Site Info, Pages, Colors, Fonts)
         ───────────────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="h-screen w-full flex flex-col bg-[#2A2624] text-white relative overflow-hidden select-none">
          {/* Ambient Warm Blurred Backdrop (Matches Screenshots) */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#3b322b] via-[#241f1c] to-[#171412] opacity-90" />
          <div className="absolute inset-0 backdrop-blur-3xl" />

          {/* Top Brand Bar */}
          <header className="relative z-20 w-full flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black p-1 shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="font-extrabold text-sm tracking-wider text-white uppercase">
                BLUEPRINT AI &bull; XITE
              </span>
            </div>

            {/* Quick Exit to Editor */}
            <Link
              href={`/editor/${subdomain}`}
              className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors"
            >
              SKIP TO CANVAS
            </Link>
          </header>

          {/* Center Stage + Right Drawer */}
          <div className="relative z-10 flex-1 flex overflow-hidden">
            {/* ─── CENTER PREVIEW CANVAS (Shows live recoloring and pages carousel) ─── */}
            <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 lg:p-8 overflow-hidden relative">
              {/* IF TAB IS 'PAGES' OR 'COLORS' OR 'FONTS' (Multi-Page Carousel View matching Screenshot 4 & 5) */}
              {builderTab === "pages" || builderTab === "colors" || builderTab === "fonts" ? (
                <div className="h-full w-full flex flex-col justify-between">
                  {/* Pages Horizontal Scroll Row */}
                  <div
                    ref={carouselRef}
                    className="flex-1 flex items-center gap-6 overflow-x-auto pb-4 pt-2 px-2 scrollbar-none"
                    style={{ transform: `scale(${zoomScale})`, transformOrigin: "center left" }}
                  >
                    {INSTITUTIONAL_PAGES.filter(
                      (p) => p.required || selectedPages.has(p.id)
                    ).map((page) => (
                      <div
                        key={page.id}
                        className="w-[340px] sm:w-[380px] lg:w-[410px] shrink-0 flex flex-col transition-all duration-300"
                      >
                        {/* Page Top Label (Matches Screenshot 4 & 5) */}
                        <div className="text-xs font-semibold text-white/80 mb-2.5 px-1 truncate">
                          {page.label}
                        </div>

                        {/* Page Mockup Card with Dynamic Live Palette Colors & Realistic Multi-Section Content */}
                        <MockPageCanvasCard
                          page={page}
                          siteTitle={siteTitle}
                          activePalette={activePalette}
                          activeFontPairing={activeFontPairing}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Bottom Controls on Canvas Stage: Zoom Pill & Carousel Arrows (Matches Screenshot 4 & 5) */}
                  <div className="flex items-center justify-between pt-3 px-2">
                    {/* Zoom Pill */}
                    <div className="inline-flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs select-none">
                      <button
                        type="button"
                        onClick={() => setZoomScale((z) => Math.max(0.8, z - 0.1))}
                        className="hover:text-white/80 p-0.5 cursor-pointer"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono text-[11px] font-medium">
                        {Math.round(zoomScale * 100)}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoomScale((z) => Math.min(1.2, z + 0.1))}
                        className="hover:text-white/80 p-0.5 cursor-pointer"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Carousel Nav Arrows */}
                    <div className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 text-white">
                      <button
                        type="button"
                        onClick={() => scrollCarousel("left")}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollCarousel("right")}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* IF TAB IS 'SITE INFO' (Screenshot 3: Single Floating Hero Canvas) */
                <div className="h-full flex items-center justify-center overflow-y-auto">
                  <div
                    className="w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden border border-white/20 transition-colors duration-500"
                    style={{ backgroundColor: activePalette.bg, color: activePalette.text }}
                  >
                    {/* Mock Browser Header */}
                    <div
                      className="w-full px-6 py-4 flex items-center justify-between border-b"
                      style={{
                        borderColor: `${activePalette.text}15`,
                        backgroundColor: `${activePalette.text}08`,
                      }}
                    >
                      <div className="font-black text-lg tracking-tight truncate max-w-[280px]">
                        {siteTitle}
                      </div>
                      <div className="hidden sm:flex items-center gap-6 text-xs font-semibold opacity-70">
                        <span>About</span>
                        <span>Academics</span>
                        <span>Admissions</span>
                        <span>Placements</span>
                        <span>Contact</span>
                      </div>
                    </div>

                    {/* Hero Section Preview with Live Personality & Typography */}
                    <div className="p-8 sm:p-12 lg:p-14 space-y-6">
                      <h2
                        className={`text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.12] ${activeFontPairing.headingClass}`}
                        style={{ fontFamily: activeFontPairing.headingFamily }}
                      >
                        {activePersonalityData.heroTitle}
                      </h2>

                      {/* Campus Showcase Image */}
                      <div className="relative h-64 sm:h-80 w-full rounded-xl overflow-hidden shadow-sm bg-neutral-100">
                        <img
                          src="/onboarding/campus-showcase.jpg"
                          alt="Campus Hero Preview"
                          className="h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <div className="absolute bottom-4 left-5 right-5 text-white">
                          <p
                            className="text-xs sm:text-sm font-medium text-white/90 leading-relaxed max-w-xl"
                            style={{ fontFamily: activeFontPairing.bodyFamily }}
                          >
                            {activePersonalityData.heroSubtitle}
                          </p>
                        </div>
                      </div>

                      {/* Action CTA buttons with live palette accent */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          className="px-6 py-2.5 rounded-lg text-xs font-bold text-white shadow-sm transition-colors duration-300"
                          style={{ backgroundColor: activePalette.accent }}
                        >
                          Apply for Admission 2026
                        </button>
                        <button
                          type="button"
                          className="px-6 py-2.5 rounded-lg text-xs font-bold border"
                          style={{
                            borderColor: `${activePalette.text}30`,
                            backgroundColor: `${activePalette.text}05`,
                          }}
                        >
                          Explore Programs &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── RIGHT SIDEBAR DRAWER (Matches Screenshot 3, 4, 5) ─── */}
            <aside className="w-full sm:w-[380px] lg:w-[420px] bg-white text-neutral-900 h-full border-l border-neutral-200 flex flex-col justify-between overflow-y-auto shrink-0 shadow-2xl z-20">
              <div className="p-6 sm:p-8 space-y-6">
                {/* Header with Title, Description & Close Icon (Matches Screenshots 3, 4, 5, 6) */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
                      {builderTab === "site_info" && "Site Info"}
                      {builderTab === "pages" && "Add pages to your site"}
                      {builderTab === "colors" && "Choose a color palette"}
                      {builderTab === "fonts" && "Choose a font pairing"}
                      {(builderTab === "topic" || builderTab === "goals") && "Institutional Setup"}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1 leading-relaxed">
                      {builderTab === "site_info" && "Give your website a name and select your brand personality."}
                      {builderTab === "pages" && "You can always add or remove pages later. We added some recommendations based on your site goals."}
                      {builderTab === "colors" && "These custom palettes were curated by our designers. You can always change up your colors later."}
                      {builderTab === "fonts" && "These custom pairings were curated by our designers. There are other font options you can explore later."}
                      {(builderTab === "topic" || builderTab === "goals") && "Review the academic modules configured for your portal."}
                    </p>
                  </div>
                  <Link
                    href={`/editor/${subdomain}`}
                    className="p-1 -mr-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors shrink-0"
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                  </Link>
                </div>

                {/* ─── TAB: SITE INFO / BRAND PERSONALITY (Screenshot 3) ─── */}
                {builderTab === "site_info" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">Site title</h3>
                      <p className="text-xs text-neutral-500 mt-0.5 mb-2.5">
                        This is the name of your site. You can change it later.
                      </p>

                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={siteTitle}
                          maxLength={100}
                          onChange={(e) => setSiteTitle(e.target.value)}
                          placeholder="Your site title"
                          className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3.5 py-3 pr-12 text-sm text-neutral-900 font-medium focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all"
                        />
                        <span className="absolute right-3.5 text-xs font-medium text-neutral-400">
                          {100 - siteTitle.length}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">
                        Brand personality
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5 mb-3">
                        Your selected personality shapes the tone, voice, and feel of AI-generated content.
                      </p>

                      <div className="space-y-2.5">
                        {BRAND_PERSONALITIES.map((p) => {
                          const isSelected = selectedPersonality === p.id;
                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedPersonality(p.id)}
                              className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                                isSelected
                                  ? "bg-white border-neutral-900 ring-1 ring-neutral-900 shadow-xs"
                                  : "bg-neutral-50/70 border-neutral-100 hover:bg-neutral-100/60 hover:border-neutral-200"
                              }`}
                            >
                              <p className="text-sm font-bold text-neutral-900">
                                {p.title}
                              </p>
                              <p className="text-xs text-neutral-500 mt-0.5">
                                {p.desc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB: ADD PAGES TO YOUR SITE (Screenshot 4) ─── */}
                {builderTab === "pages" && (
                  <div className="space-y-4">
                    <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                      You can always add or remove pages later. We added some recommendations based on your site goals.
                    </p>

                    <div className="space-y-2.5 pt-1">
                      {INSTITUTIONAL_PAGES.map((page) => {
                        const isChecked = page.required || selectedPages.has(page.id);
                        return (
                          <div
                            key={page.id}
                            onClick={() => togglePage(page.id)}
                            className={`group flex items-center justify-between p-4 rounded-xl border transition-all select-none ${
                              page.required
                                ? "bg-neutral-50 border-neutral-200/80 cursor-default"
                                : isChecked
                                  ? "bg-neutral-50/90 border-neutral-300 cursor-pointer"
                                  : "bg-white border-neutral-200 hover:bg-neutral-50/50 cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {!page.required ? (
                                <div
                                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-xs border transition-colors ${
                                    isChecked
                                      ? "bg-black border-black text-white"
                                      : "bg-white border-neutral-300 group-hover:border-neutral-400"
                                  }`}
                                >
                                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                              ) : null}

                              <span className="text-sm font-semibold text-neutral-900">
                                {page.label}
                              </span>
                            </div>

                            {page.required && (
                              <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-200/70 px-2.5 py-0.5 rounded-full">
                                Required
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ─── TAB: CHOOSE A COLOR PALETTE (Screenshot 5) ─── */}
                {builderTab === "colors" && (
                  <div className="space-y-6">
                    <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                      These custom palettes were curated by our designers. You can always change up your colors later.
                    </p>

                    {/* Palette Categories: Professional, Playful, Sophisticated */}
                    <div className="space-y-6">
                      {CURATED_PALETTE_GROUPS.map((group) => (
                        <div key={group.category} className="space-y-2.5">
                          {/* Category Header */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-neutral-900 tracking-tight">
                              {group.category}
                            </span>
                            {group.badge && (
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                                {group.badge}
                              </span>
                            )}
                          </div>

                          {/* 2x2 Grid of 5-Color Horizontal Palette Cards (Matches Screenshot 5) */}
                          <div className="grid grid-cols-2 gap-2.5">
                            {group.palettes.map((palette) => {
                              const isSelected = selectedPaletteId === palette.id;
                              return (
                                <div
                                  key={palette.id}
                                  onClick={() => setSelectedPaletteId(palette.id)}
                                  className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none bg-white hover:border-neutral-300 ${
                                    isSelected
                                      ? "border-black ring-1 ring-black shadow-xs"
                                      : "border-neutral-200"
                                  }`}
                                >
                                  {/* 5 Horizontal Color Blocks */}
                                  <div className="flex h-7 w-full rounded-md overflow-hidden border border-neutral-100">
                                    {palette.colors.map((c, i) => (
                                      <div
                                        key={i}
                                        className="flex-1 h-full"
                                        style={{ backgroundColor: c }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── TAB: FONTS (Screenshot 6: Choose a font pairing) ─── */}
                {builderTab === "fonts" && (
                  <div className="space-y-6 pt-1">
                    {CURATED_FONT_GROUPS.map((group) => (
                      <div key={group.category} className="space-y-2.5">
                        {/* Category Header */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-800 tracking-wide">
                            {group.category}
                          </span>
                          {group.badge && (
                            <span className="bg-blue-50 text-blue-600 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                              {group.badge}
                            </span>
                          )}
                        </div>

                        {/* 2-Column Grid of Curated Font Cards (Matches Screenshot 6) */}
                        <div className="grid grid-cols-2 gap-3">
                          {group.pairings.map((pairing) => {
                            const isSelected = selectedFontPairingId === pairing.id;
                            return (
                              <button
                                key={pairing.id}
                                type="button"
                                onClick={() => setSelectedFontPairingId(pairing.id)}
                                className={`rounded-lg p-3.5 sm:p-4 text-left transition-all cursor-pointer select-none ${
                                  isSelected
                                    ? "border-2 border-neutral-900 bg-white ring-1 ring-neutral-900 shadow-xs"
                                    : "border border-neutral-200 bg-neutral-50/70 hover:border-neutral-400 hover:bg-neutral-50"
                                }`}
                              >
                                <div
                                  className={`${pairing.headingClass} text-neutral-900 truncate leading-tight`}
                                  style={{ fontFamily: pairing.headingFamily }}
                                >
                                  {pairing.previewHeading}
                                </div>
                                <div
                                  className="text-xs text-neutral-500 mt-1 truncate"
                                  style={{ fontFamily: pairing.bodyFamily }}
                                >
                                  {pairing.previewParagraph}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ─── TAB: TOPIC & GOALS ─── */}
                {(builderTab === "topic" || builderTab === "goals") && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">
                        Configured Academic Modules
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5 mb-3">
                        {selectedGoals.size} institutional modules active.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      {Array.from(selectedGoals).map((id) => {
                        const goal = INSTITUTIONAL_GOALS.find((g) => g.id === id);
                        return (
                          <div
                            key={id}
                            className="text-xs p-2.5 rounded-lg bg-neutral-50 text-neutral-700 flex items-center gap-2"
                          >
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{goal?.label || id}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* ─── BOTTOM STEPPER NAVIGATION BAR (Matches Screenshots 3, 4, 5, 6) ─── */}
          <footer className="relative z-20 w-full flex items-center justify-between px-6 py-3.5 border-t border-neutral-200 bg-white select-none">
            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={handleBackStepper}
              className="px-6 py-2 rounded-sm border border-neutral-300 bg-white text-neutral-800 text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              BACK
            </button>

            {/* CENTER STEPPER NAVIGATION TABS */}
            <div className="hidden md:flex items-center gap-8 lg:gap-10 text-xs tracking-wide">
              {(
                [
                  { id: "topic", label: "Topic" },
                  { id: "goals", label: "Goals" },
                  { id: "site_info", label: "Site Info" },
                  { id: "pages", label: "Pages" },
                  { id: "colors", label: "Colors" },
                  { id: "fonts", label: "Fonts" },
                ] as const
              ).map((tab) => {
                const isActive = builderTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBuilderTab(tab.id as BuilderTab)}
                    className={`transition-colors cursor-pointer pb-0.5 ${
                      isActive
                        ? "text-neutral-900 font-bold border-b-2 border-neutral-900"
                        : "text-neutral-500 hover:text-neutral-900 font-medium"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* NEXT / FINISH BUTTON */}
            <button
              type="button"
              onClick={handleAdvanceStepper}
              disabled={pending}
              className="px-8 py-2.5 text-xs font-bold uppercase tracking-wider bg-black text-white rounded-sm hover:bg-neutral-800 active:bg-neutral-900 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {pending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{builderTab === "fonts" ? "Finalizing..." : "Launching Studio..."}</span>
                </>
              ) : (
                <span>{builderTab === "fonts" ? "FINISH" : "NEXT"}</span>
              )}
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}
