"use client";

import { useState, useRef, useEffect, useMemo } from "react";
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
  Layout,
} from "lucide-react";

import { ApiError, completeOnboardingRequest } from "@/lib/api-client";
import {
  EDITOR_FONTS,
  EDITOR_THEMES,
  themeStylesheet,
  customThemeCss,
  themeFontsHref,
  tokenizeSectionHtml,
  type EditorThemeTokens,
} from "@/lib/editor-themes";
import {
  fetchDefaultWebsite,
  saveTheme,
  saveWebsite,
  type EditorPage,
  type EditorSection,
} from "@/lib/editor-api";
import {
  SECTION_RUNTIME_TAILWIND_CDN_SRC,
  SECTION_RUNTIME_HEAD_LINKS,
  sectionRuntimeCss,
  sectionResponsiveCss,
  extractStylesAndBody,
  extractCssImports,
  absolutiseUploadUrls,
  viewportUnitsToContainer,
  viewportMediaToContainer,
} from "@/lib/section-runtime";
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
    defaultPaletteId: "academic-blue",
    defaultFontPairingId: "modern-sans",
  },
  {
    id: "innovative",
    title: "Modern & Research-Driven",
    desc: "Forward-thinking. High-tech. Dynamic.",
    heroTitle: "Engineering the Future with Innovation",
    heroSubtitle:
      "Leading multidisciplinary campus empowering next-gen researchers through AI laboratories, advanced robotics, and patent innovation.",
    defaultPaletteId: "indigo-violet",
    defaultFontPairingId: "technical-sans",
  },
  {
    id: "scholarly",
    title: "Scholarly & Heritage",
    desc: "Rigorous. Academic. Cultured.",
    heroTitle: "A Legacy of Intellectual Distinction",
    heroSubtitle:
      "Upholding a storied tradition of scientific discovery, distinguished faculty scholarship, and transformative postgraduate education.",
    defaultPaletteId: "crimson-maroon",
    defaultFontPairingId: "editorial-serif",
  },
  {
    id: "vibrant",
    title: "Student-Centric & Vibrant",
    desc: "Energetic. Welcoming. Community-focused.",
    heroTitle: "Where Passion Meets Purpose & Career",
    heroSubtitle:
      "An inspiring university campus offering world-class student life, dynamic hackathons, industry internships, and 100% placement support.",
    defaultPaletteId: "coastal-teal",
    defaultFontPairingId: "expressive-display",
  },
] as const;

export type InstitutionalPageItem = {
  id: string;
  label: string;
  required: boolean;
  title: string;
  badge?: string;
  summary: string;
  img: string;
};

// Institutional Pages (Matching Screenshot 4)
const INSTITUTIONAL_PAGES: InstitutionalPageItem[] = [
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
    backendThemeId: string;
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
        backendThemeId: "academic-blue",
        colors: ["#FFFFFF", "#F8FAFC", "#2563EB", "#1E3A8A", "#0F172A"],
        accent: "#2563EB",
        bg: "#FFFFFF",
        text: "#0F172A",
      },
      {
        id: "emerald-campus",
        name: "Forest Emerald",
        backendThemeId: "forest-emerald",
        colors: ["#FFFFFF", "#ECFDF5", "#059669", "#064E3B", "#022C22"],
        accent: "#059669",
        bg: "#FFFFFF",
        text: "#064E3B",
      },
      {
        id: "monochrome",
        name: "Institutional Mono",
        backendThemeId: "black-and-white",
        colors: ["#FFFFFF", "#F3F4F6", "#9CA3AF", "#1F2937", "#000000"],
        accent: "#1F2937",
        bg: "#FFFFFF",
        text: "#000000",
      },
      {
        id: "oxford-blue",
        name: "Oxford Cyan",
        backendThemeId: "ocean-navy",
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
        backendThemeId: "crimson-slate",
        colors: ["#FFF1F2", "#FFE4E6", "#E11D48", "#881337", "#4C0519"],
        accent: "#E11D48",
        bg: "#FFF1F2",
        text: "#4C0519",
      },
      {
        id: "amber-sapphire",
        name: "Gold & Sapphire",
        backendThemeId: "emerald-gold",
        colors: ["#FFFBEB", "#FEF3C7", "#D97706", "#2563EB", "#1E293B"],
        accent: "#D97706",
        bg: "#FFFBEB",
        text: "#1E293B",
      },
      {
        id: "indigo-violet",
        name: "Innovation Violet",
        backendThemeId: "midnight-purple",
        colors: ["#FAF5FF", "#F3E8FF", "#7C3AED", "#4C1D95", "#1E1B4B"],
        accent: "#7C3AED",
        bg: "#FAF5FF",
        text: "#1E1B4B",
      },
      {
        id: "coastal-teal",
        name: "Campus Teal",
        backendThemeId: "forest-emerald",
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
        backendThemeId: "warm-terracotta",
        colors: ["#FFFBEB", "#FEF3C7", "#EA580C", "#44403C", "#1C1917"],
        accent: "#EA580C",
        bg: "#FFFBEB",
        text: "#1C1917",
      },
      {
        id: "regal-sand",
        name: "Autonomous Sand",
        backendThemeId: "warm-terracotta",
        colors: ["#FAF5F0", "#F5EBE1", "#C29B38", "#5C4B37", "#2D241E"],
        accent: "#C29B38",
        bg: "#FAF5F0",
        text: "#2D241E",
      },
      {
        id: "scholarly-slate",
        name: "Scholarly Slate",
        backendThemeId: "ocean-navy",
        colors: ["#F8FAFC", "#F1F5F9", "#64748B", "#334155", "#0F172A"],
        accent: "#64748B",
        bg: "#F8FAFC",
        text: "#0F172A",
      },
      {
        id: "midnight-purple",
        name: "Obsidian Purple",
        backendThemeId: "midnight-purple",
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

const DESKTOP_VIEWPORT_WIDTH = 1200;

/** Assembles all sections for a page into a complete, standalone preview document with Tailwind Play CDN and theme styles */
function buildMultiSectionPreviewDocument({
  sections,
  siteTitle,
  selectedPersonality = "professional",
  activePalette,
  activeFontPairing,
}: {
  sections: EditorSection[];
  siteTitle: string;
  selectedPersonality?: string;
  activePalette: (typeof CURATED_PALETTE_GROUPS)[number]["palettes"][number];
  activeFontPairing: FontPairing;
}): string {
  const personality =
    BRAND_PERSONALITIES.find((p) => p.id === selectedPersonality) ||
    BRAND_PERSONALITIES[0];

  const allHeadLinks: string[] = [];
  const allHeadCss: string[] = [];
  const bodySectionsHtml: string[] = [];

  const displayTitle = siteTitle && siteTitle.trim() ? siteTitle.trim() : "Greenfield University";
  const initials =
    displayTitle
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "GU";

  sections.forEach((sec, idx) => {
    let raw = sec.code || "";

    // 1. Dynamic Site Title replacement across Navbar and all sections
    if (displayTitle) {
      // Replace brand text inside navbar or brand logo/link
      raw = raw.replace(
        /(<span[^>]*class="[^"]*(?:lit-brand-text|brand-text|logo-text|brand-name|site-title)[^"]*"[^>]*>)([\s\S]*?)(<\/span>)/gi,
        `$1${displayTitle}$3`
      );
      raw = raw.replace(
        /(<div[^>]*class="[^"]*(?:lit-brand-text|brand-text|logo-text|brand-name|site-title)[^"]*"[^>]*>)([\s\S]*?)(<\/div>)/gi,
        `$1${displayTitle}$3`
      );
      // Replace known placeholders
      raw = raw
        .replace(/Madras Institute of Tech(?:nology)?/gi, displayTitle)
        .replace(/Greenfield University/gi, displayTitle)
        .replace(/GREENFIELD UNIVERSITY/gi, displayTitle.toUpperCase())
        .replace(/>GU</g, `>${initials}<`);
    }

    // 2. Dynamic Brand Personality updates for Hero & Lead sections
    const isHero =
      sec.category === "hero" ||
      (sec.title && sec.title.toLowerCase().includes("hero")) ||
      raw.includes("ai-hero") ||
      raw.includes("hero-title") ||
      (idx === 1 && sections.length > 1);

    if (isHero) {
      if (/class="[^"]*(?:ai-hero-title|hero-title)[^"]*"/i.test(raw)) {
        raw = raw.replace(
          /(<h1[^>]*class="[^"]*(?:ai-hero-title|hero-title)[^"]*"[^>]*>)([\s\S]*?)(<\/h1>)/gi,
          `$1${personality.heroTitle}$3`
        );
      } else {
        raw = raw.replace(
          /(<h1[^>]*>)([\s\S]*?)(<\/h1>)/i,
          `$1${personality.heroTitle}$3`
        );
      }

      if (/class="[^"]*(?:ai-hero-desc|hero-desc|hero-subtitle|lead)[^"]*"/i.test(raw)) {
        raw = raw.replace(
          /(<(?:p|div)[^>]*class="[^"]*(?:ai-hero-desc|hero-desc|hero-subtitle|lead)[^"]*"[^>]*>)([\s\S]*?)(<\/(?:p|div)>)/gi,
          `$1${personality.heroSubtitle}$3`
        );
      } else {
        raw = raw.replace(
          /(<\/h1>[\s\S]*?<p[^>]*>)([\s\S]*?)(<\/p>)/i,
          `$1${personality.heroSubtitle}$3`
        );
      }
    }

    const code = absolutiseUploadUrls(raw, null);
    const { headCss, headLinks, bodyHtml } = extractStylesAndBody(code);

    if (headLinks && headLinks.trim()) {
      allHeadLinks.push(headLinks.trim());
    }

    const { css: importedCss, hrefs } = extractCssImports(headCss);
    hrefs.forEach((href) => {
      allHeadLinks.push(`<link rel="stylesheet" href="${href}"/>`);
    });

    if (importedCss && importedCss.trim()) {
      allHeadCss.push(viewportUnitsToContainer(viewportMediaToContainer(importedCss.trim())));
    }

    // Tokenize colors so active palette tokens apply
    const tokenizedBody = tokenizeSectionHtml(bodyHtml || code);
    bodySectionsHtml.push(`
      <div data-xite-section="${sec.id || `sec-${idx}`}" class="section-canvas-box" style="width: 100%; box-sizing: border-box;">
        ${tokenizedBody}
      </div>
    `);
  });

  const themeId = activePalette.backendThemeId;
  const fontId = activeFontPairing.backendFontId;

  return `<!DOCTYPE html>
<html lang="en" data-xite-theme="${themeId}" data-xite-font="${fontId}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <script src="${SECTION_RUNTIME_TAILWIND_CDN_SRC}"></script>
  ${SECTION_RUNTIME_HEAD_LINKS}
  <link href="${themeFontsHref()}" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap" rel="stylesheet">
  ${allHeadLinks.join("\n  ")}
  <style>
    ${sectionRuntimeCss(null)}
    ${sectionResponsiveCss(null)}
    ${themeStylesheet(".xite-site-canvas")}
    ${customThemeCss(".xite-site-canvas", {
      light1: activePalette.bg,
      light2: activePalette.colors[1] || activePalette.bg,
      accent: activePalette.accent,
      dark1: `${activePalette.text}99`,
      dark2: activePalette.text,
    })}

    :root, html, body, .xite-site-canvas {
      --xite-accent: ${activePalette.accent};
      --xite-primary: ${activePalette.accent};
      --theme-accent: ${activePalette.accent};
      --xite-surface: ${activePalette.bg};
      --xite-surface-raised: ${activePalette.colors[1] || activePalette.bg};
      --theme-light-1: ${activePalette.bg};
      --theme-light-2: ${activePalette.colors[1] || activePalette.bg};
      --xite-text: ${activePalette.text};
      --xite-text-muted: ${activePalette.text}99;
      --theme-dark-1: ${activePalette.text}99;
      --theme-dark-2: ${activePalette.text};
      --xite-font: ${activeFontPairing.bodyFamily};
      --font-heading: ${activeFontPairing.headingFamily};
      --font-body: ${activeFontPairing.bodyFamily};
      font-family: ${activeFontPairing.bodyFamily};
      background-color: ${activePalette.bg};
      color: ${activePalette.text};
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }

    h1, h2, h3, h4, h5, h6, [class*="font-serif"], .font-heading {
      font-family: ${activeFontPairing.headingFamily} !important;
    }

    p, span, a, li, button, input, label, div, [class*="font-sans"], .font-body {
      font-family: ${activeFontPairing.bodyFamily} !important;
    }

    /* Live active palette color overrides for section components */
    .xite-site-canvas [class*="btn-primary"],
    .xite-site-canvas [class*="bg-blue-6"],
    .xite-site-canvas [class*="bg-indigo-6"],
    .xite-site-canvas [class*="bg-primary"],
    .xite-site-canvas a[style*="background: #2563eb"],
    .xite-site-canvas a[style*="background:#2563eb"],
    .xite-site-canvas button[style*="background: #2563eb"],
    .xite-site-canvas button[style*="background:#2563eb"] {
      background-color: ${activePalette.accent} !important;
    }

    .xite-site-canvas [class*="text-blue-6"],
    .xite-site-canvas [class*="text-indigo-6"],
    .xite-site-canvas [class*="text-primary"],
    .xite-site-canvas a[style*="color: #2563eb"],
    .xite-site-canvas a[style*="color:#2563eb"] {
      color: ${activePalette.accent} !important;
    }

    .xite-site-canvas [class*="border-blue-6"],
    .xite-site-canvas [class*="border-indigo-6"],
    .xite-site-canvas [class*="border-primary"] {
      border-color: ${activePalette.accent} !important;
    }

    html, body {
      width: 100%;
      min-height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      scrollbar-width: thin;
    }

    ${allHeadCss.join("\n\n")}
  </style>
</head>
<body class="xite-site-canvas" data-xite-theme="${themeId}" data-xite-font="${fontId}">
  <div style="width: 100%; display: flex; flex-direction: column;">
    ${bodySectionsHtml.join("\n")}
  </div>
  <script>
    (function() {
      // Prevent link navigation inside the preview iframe
      document.addEventListener("click", function(e) {
        var link = e.target.closest("a");
        if (link) {
          e.preventDefault();
        }
      }, true);

      // Dynamic live DOM updates for siteTitle and brand personality
      var title = ${JSON.stringify(displayTitle)};
      var heroTitle = ${JSON.stringify(personality.heroTitle)};
      var heroDesc = ${JSON.stringify(personality.heroSubtitle)};
      var inits = ${JSON.stringify(initials)};

      function applyUpdates(t, hT, hD, iN) {
        if (t) {
          var updated = false;
          document.querySelectorAll('.lit-brand-text, [class*="brand-text"], [class*="logo-text"], .navbar-brand span').forEach(function(el) {
            el.textContent = t;
            updated = true;
          });
          if (!updated) {
            var headerSpan = document.querySelector('header span, nav span, [data-xite-navbar] span');
            if (headerSpan) headerSpan.textContent = t;
          }
          var navLogo = document.querySelector('header div > div, nav div > div');
          if (navLogo && navLogo.textContent.trim().length <= 3) {
            navLogo.textContent = iN;
          }
        }

        if (hT) {
          var h1 = document.querySelector('.ai-hero-title, [class*="hero-title"], .ai-hero h1, section:nth-of-type(2) h1, section h1, h1');
          if (h1) {
            h1.innerHTML = hT;
          }
        }

        if (hD) {
          var p = document.querySelector('.ai-hero-desc, [class*="hero-desc"], [class*="hero-subtitle"]');
          if (!p) {
            var allH1 = document.querySelector('.ai-hero-title, [class*="hero-title"], .ai-hero h1, section:nth-of-type(2) h1, section h1, h1');
            if (allH1 && allH1.parentElement) {
              var ps = allH1.parentElement.querySelectorAll('p');
              if (ps.length > 0) p = ps[ps.length - 1];
            }
          }
          if (p) {
            p.textContent = hD;
          }
        }
      }

      applyUpdates(title, heroTitle, heroDesc, inits);

      window.addEventListener("message", function(e) {
        if (!e || !e.data) return;
        if (e.data.type === "UPDATE_TITLE" && e.data.title) {
          var newInits = e.data.title.split(/\s+/).map(function(w){return w[0];}).filter(Boolean).slice(0, 2).join("").toUpperCase() || "GU";
          applyUpdates(e.data.title, null, null, newInits);
        }
      });
    })();
  </script>
</body>
</html>`;
}

// Dynamic Multi-Section Page Canvas Card (Displays sections from Admin in full desktop fidelity scaled to fit)
function DynamicPageCanvasCard({
  page,
  sections,
  siteTitle,
  selectedPersonality,
  activePalette,
  activeFontPairing,
  isLoading,
  className,
}: {
  page: InstitutionalPageItem;
  sections: EditorSection[];
  siteTitle: string;
  selectedPersonality?: string;
  activePalette: (typeof CURATED_PALETTE_GROUPS)[number]["palettes"][number];
  activeFontPairing: FontPairing;
  isLoading?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState<number>(0.32);
  const [containerHeight, setContainerHeight] = useState<number>(580);

  // Send instant title updates via postMessage for zero-lag typing
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "UPDATE_TITLE", title: siteTitle },
        "*"
      );
    }
  }, [siteTitle]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (width > 0) {
        setScale(width / DESKTOP_VIEWPORT_WIDTH);
      }
      if (height > 0) {
        setContainerHeight(height);
      }
    };

    measure();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, [sections.length]);

  const previewDoc = useMemo(() => {
    if (!sections || sections.length === 0) return "";
    return buildMultiSectionPreviewDocument({
      sections,
      siteTitle,
      selectedPersonality,
      activePalette,
      activeFontPairing,
    });
  }, [sections, siteTitle, selectedPersonality, activePalette, activeFontPairing]);

  return (
    <div
      className={`rounded-2xl shadow-2xl overflow-hidden border border-white/20 flex flex-col transition-colors duration-500 bg-white ${
        className ? className : "w-full h-[600px] sm:h-[680px] lg:h-[740px] xl:h-[800px]"
      }`}
      style={{ backgroundColor: activePalette.bg, color: activePalette.text }}
    >
      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3">
          <Loader2 className="h-6 w-6 animate-spin opacity-40" />
          <span className="text-[11px] opacity-60">Loading sections...</span>
        </div>
      ) : sections.length === 0 ? (
        /* Empty State: Displayed until Admin adds sections */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div
            className="w-16 h-16 rounded-2xl border-2 border-dashed flex items-center justify-center"
            style={{
              borderColor: `${activePalette.text}25`,
              backgroundColor: `${activePalette.text}05`,
            }}
          >
            <Layout className="w-7 h-7 opacity-40" style={{ color: activePalette.text }} />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <div
              className={`text-base sm:text-lg font-bold ${activeFontPairing.headingClass}`}
              style={{ fontFamily: activeFontPairing.headingFamily }}
            >
              No Sections Added Yet
            </div>
            <p
              className="text-xs sm:text-sm opacity-60 leading-relaxed"
              style={{ fontFamily: activeFontPairing.bodyFamily }}
            >
              Admin has not configured sections for this page yet. It will show as empty until Admin adds them.
            </p>
          </div>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full border opacity-75"
            style={{
              borderColor: `${activePalette.text}20`,
              backgroundColor: `${activePalette.text}05`,
            }}
          >
            Awaiting Admin Sections
          </span>
        </div>
      ) : (
        /* Dynamic Sections Configured in Admin: Rendered with complete Tailwind & Custom CSS fidelity in ALWAYS DESKTOP layout */
        <div ref={containerRef} className="w-full h-full relative overflow-hidden flex-1 rounded-xl">
          <div
            className="absolute top-0 left-0 origin-top-left"
            style={{
              width: `${DESKTOP_VIEWPORT_WIDTH}px`,
              height: `${Math.max(500, Math.round(containerHeight / Math.max(0.05, scale)))}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <iframe
              ref={iframeRef}
              key={`${page.id}-${activePalette.id}-${activeFontPairing.id}-${selectedPersonality}-${sections.length}`}
              srcDoc={previewDoc}
              title={page.label || page.id}
              style={{
                width: `${DESKTOP_VIEWPORT_WIDTH}px`,
                height: "100%",
                border: 0,
              }}
              className="bg-transparent rounded-xl"
              sandbox="allow-same-origin allow-scripts"
            />
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
  const [step, setStep] = useState<Step>(1);

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

  // Dynamic Admin Configured Pages and Sections
  const [adminPages, setAdminPages] = useState<EditorPage[]>([]);
  const [adminConfigLoading, setAdminConfigLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setAdminConfigLoading(true);
    fetchDefaultWebsite()
      .then((pages) => {
        if (!cancelled && Array.isArray(pages)) {
          setAdminPages(pages);
        }
      })
      .catch((err) => {
        console.warn("Failed to load admin default website config:", err);
      })
      .finally(() => {
        if (!cancelled) setAdminConfigLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const getSectionsForPage = (pageId: string): EditorSection[] => {
    const normId = pageId.toLowerCase().replace(/^\/+/, "");
    const page = adminPages.find((p) => {
      const slug = (p.slug || "").toLowerCase().replace(/^\/+/, "");
      if (normId === "home") {
        return slug === "home" || slug === "" || slug === "index";
      }
      if (normId === "about") {
        return slug === "about" || slug === "about-us";
      }
      if (normId === "academics") {
        return slug === "academics" || slug === "courses" || slug === "programs";
      }
      if (normId === "contact") {
        return slug === "contact" || slug === "contact-us";
      }
      if (normId === "placements") {
        return slug === "placements" || slug === "careers";
      }
      return slug === normId;
    });
    return page?.sections || [];
  };

  const dynamicPages = useMemo<InstitutionalPageItem[]>(() => {
    const knownIds = new Set<string>(INSTITUTIONAL_PAGES.map((p) => p.id));
    const extraPages: InstitutionalPageItem[] = [];

    adminPages.forEach((p) => {
      const norm = (p.slug || "").toLowerCase().replace(/^\/+/, "");
      if (!norm || norm === "home" || norm === "index") return;
      if (!knownIds.has(norm)) {
        extraPages.push({
          id: norm,
          label: p.title || norm.charAt(0).toUpperCase() + norm.slice(1),
          required: false,
          title: p.title || norm,
          summary: `${p.title || norm} configured by Admin.`,
          img: "/onboarding/campus-showcase.jpg",
        });
        knownIds.add(norm);
      }
    });

    return [...INSTITUTIONAL_PAGES, ...extraPages];
  }, [adminPages]);

  const homeSections = useMemo(() => getSectionsForPage("home"), [adminPages]);

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
      const amount = direction === "left" ? -720 : 720;
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
      void handleLaunchEditor();
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

  // Skip or close: marks onboarding complete with defaults and navigates straight to editor
  async function handleSkipToEditor() {
    setPending(true);
    setError(null);
    const themePaletteId = activePalette?.backendThemeId || "academic-blue";
    const themeFontId = activeFontPairing?.backendFontId || "inter";

    const customTokens: EditorThemeTokens = {
      surface: activePalette.bg,
      surfaceRaised: activePalette.colors[1] || activePalette.bg,
      header: activePalette.text,
      footer: activePalette.text,
      accent: activePalette.accent,
      accentSoft: `${activePalette.accent}26`,
      onAccent: "#ffffff",
      text: activePalette.text,
      textMuted: `${activePalette.text}99`,
      border: `${activePalette.text}20`,
      primary: activePalette.accent,
      secondary: activePalette.colors[3] || activePalette.text,
    };

    try {
      await completeOnboardingRequest({
        role: "principal",
        themePaletteId,
        themeFontId,
      });
    } catch (cause) {
      console.warn("Skip onboarding completion error:", cause);
    }

    try {
      await saveTheme({ themeId: themePaletteId, fontId: themeFontId });
    } catch (cause) {
      console.warn("Failed to save theme during skip:", cause);
    }

    // Persist empty draft to ensure fresh site starts without admin default sections
    try {
      const pageIdsToSeed = selectedPages.size > 0 ? Array.from(selectedPages) : ["home"];
      const freshPages = pageIdsToSeed.map((pId) => {
        const pageDef = dynamicPages.find((p) => p.id === pId);
        const slug = pId === "home" ? "/home" : `/${pId}`;
        return {
          id: `page-${pId}`,
          slug,
          title: pageDef?.title || pageDef?.label || pId,
          sections: [],
        };
      });
      await saveWebsite(freshPages);
    } catch (cause) {
      console.warn("Failed to initialize empty website draft during skip:", cause);
    }

    try {
      localStorage.setItem("xite_custom_theme_tokens", JSON.stringify(customTokens));
      localStorage.setItem(`xite_fresh_site_${subdomain}`, "true");
      localStorage.setItem(
        `xite_onboarding_${subdomain}`,
        JSON.stringify({
          siteTitle,
          selectedPersonality,
          themePaletteId,
          themeFontId,
          selectedPaletteId: activePalette.id,
          selectedFontPairingId: activeFontPairing.id,
          customTokens,
          selectedGoals: Array.from(selectedGoals),
          selectedPages: Array.from(selectedPages),
          isFresh: true,
          completedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore localStorage errors
    }

    window.location.assign(`/editor/${encodeURIComponent(subdomain)}`);
  }

  // Final Action: Complete onboarding and launch the editor ("go the build now")
  async function handleLaunchEditor() {
    setPending(true);
    setError(null);

    const themePaletteId = activePalette?.backendThemeId || "academic-blue";
    const themeFontId = activeFontPairing?.backendFontId || "inter";

    const customTokens: EditorThemeTokens = {
      surface: activePalette.bg,
      surfaceRaised: activePalette.colors[1] || activePalette.bg,
      header: activePalette.text,
      footer: activePalette.text,
      accent: activePalette.accent,
      accentSoft: `${activePalette.accent}26`,
      onAccent: "#ffffff",
      text: activePalette.text,
      textMuted: `${activePalette.text}99`,
      border: `${activePalette.text}20`,
      primary: activePalette.accent,
      secondary: activePalette.colors[3] || activePalette.text,
    };

    try {
      await completeOnboardingRequest({
        role: "principal",
        themePaletteId,
        themeFontId,
      });

      try {
        await saveTheme({ themeId: themePaletteId, fontId: themeFontId });
      } catch (cause) {
        console.warn("Failed to save theme during launch:", cause);
      }

      // Persist empty draft with tenant-selected pages so tenant starts clean without admin defaults
      try {
        const pageIdsToSeed = selectedPages.size > 0 ? Array.from(selectedPages) : ["home"];
        const freshPages = pageIdsToSeed.map((pId) => {
          const pageDef = dynamicPages.find((p) => p.id === pId);
          const slug = pId === "home" ? "/home" : `/${pId}`;
          return {
            id: `page-${pId}`,
            slug,
            title: pageDef?.title || pageDef?.label || pId,
            sections: [],
          };
        });
        await saveWebsite(freshPages);
      } catch (cause) {
        console.warn("Failed to initialize empty website draft during launch:", cause);
      }

      try {
        localStorage.setItem("xite_custom_theme_tokens", JSON.stringify(customTokens));
        localStorage.setItem(`xite_fresh_site_${subdomain}`, "true");
        localStorage.setItem(
          `xite_onboarding_${subdomain}`,
          JSON.stringify({
            siteTitle,
            selectedPersonality,
            themePaletteId,
            themeFontId,
            selectedPaletteId: activePalette.id,
            selectedFontPairingId: activeFontPairing.id,
            customTokens,
            selectedGoals: Array.from(selectedGoals),
            selectedPages: Array.from(selectedPages),
            isFresh: true,
            completedAt: new Date().toISOString(),
          })
        );
      } catch {
        // ignore localStorage errors
      }

      // Hard redirect to editor
      window.location.assign(`/editor/${encodeURIComponent(subdomain)}`);
    } catch (cause) {
      console.error("Failed to complete onboarding:", cause);
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
          STEP 1: "How would you like to get started?"
          (Single Option: "Start Build Now")
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
            <button
              type="button"
              onClick={handleSkipToEditor}
              className="text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-black transition-colors cursor-pointer"
            >
              CLOSE
            </button>
          </header>

          {error && (
            <div className="my-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Main Area: Title on Left, Single 'Start Build Now' Card on Right */}
          <main className="my-auto py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
              {/* Left Column: Headline & Progress Bar */}
              <div className="lg:col-span-5 space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-normal tracking-tight text-neutral-900 leading-[1.18]">
                  How would you like to get started?
                </h1>

                {/* 2-Segment Progress Indicator */}
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 w-20">
                    <div className="h-[2.5px] w-8 bg-black rounded-full transition-all" />
                    <div className="h-[2.5px] w-8 bg-neutral-300 rounded-full transition-all" />
                  </div>
                </div>
              </div>

              {/* Right Area: Single Card for "Start Build Now" */}
              <div className="lg:col-span-7 flex justify-start">
                <div
                  onClick={() => {
                    setStep(2);
                    setBuilderTab("site_info");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="group w-full max-w-xl rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between hover:border-neutral-300"
                >
                  <div>
                    <div className="h-52 sm:h-60 w-full overflow-hidden bg-neutral-100 relative">
                      <img
                        src="/tab2-templates.jpg"
                        alt="Start Build Now"
                        className="h-full w-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                    <div className="p-6 sm:p-7">
                      <h3 className="text-base font-bold text-neutral-900 tracking-tight mb-2">
                        Professional Website Templates
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed">
                        Customize your college site title, brand personality, pages, curated color palettes, and typography before opening the editor canvas.
                      </p>
                    </div>
                  </div>

                  <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-2 flex items-center justify-between border-t border-neutral-100/80">
                    <span className="text-base font-bold text-neutral-900 group-hover:text-black flex items-center gap-2">
                      <span>Start Build Now</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Bottom Bar: Clean Step Indicator */}
          <footer className="w-full flex items-center justify-between pt-6 border-t border-neutral-100">
            <span className="text-xs font-medium text-neutral-400">Step 1 of 2</span>
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
            <button
              type="button"
              onClick={handleSkipToEditor}
              className="text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              SKIP TO CANVAS
            </button>
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
                    className="flex-1 flex items-center gap-8 overflow-x-auto pb-4 pt-2 px-4 scrollbar-none"
                    style={{ transform: `scale(${zoomScale})`, transformOrigin: "center left" }}
                  >
                    {dynamicPages.filter(
                      (p) => p.required || selectedPages.has(p.id)
                    ).map((page) => (
                      <div
                        key={page.id}
                        className="w-[540px] sm:w-[680px] lg:w-[800px] xl:w-[880px] shrink-0 flex flex-col transition-all duration-300"
                      >
                        {/* Page Top Label (Matches Screenshot 4 & 5) */}
                        <div className="text-xs sm:text-sm font-bold text-white/90 mb-2.5 px-1 flex items-center justify-between">
                          <span className="truncate">{page.label}</span>
                          <span className="text-[10px] font-mono font-medium text-white/50 uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-full">
                            Desktop View
                          </span>
                        </div>

                        {/* Page Canvas Card with Dynamic Live Palette Colors & Sections from Admin */}
                        <DynamicPageCanvasCard
                          page={page}
                          sections={getSectionsForPage(page.id)}
                          siteTitle={siteTitle}
                          selectedPersonality={selectedPersonality}
                          activePalette={activePalette}
                          activeFontPairing={activeFontPairing}
                          isLoading={adminConfigLoading}
                          className="w-full h-[580px] sm:h-[660px] lg:h-[740px] xl:h-[800px] rounded-2xl shadow-2xl overflow-hidden border border-white/20 flex flex-col transition-colors duration-500 bg-white"
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
                /* IF TAB IS 'SITE INFO' (Single Page Preview: Dynamic Home Sections from Header to Footer) */
                <div className="h-full w-full flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
                  <div className="w-full max-w-5xl xl:max-w-6xl h-full max-h-[820px] flex flex-col">
                    <DynamicPageCanvasCard
                      page={INSTITUTIONAL_PAGES[0]}
                      sections={homeSections}
                      siteTitle={siteTitle}
                      selectedPersonality={selectedPersonality}
                      activePalette={activePalette}
                      activeFontPairing={activeFontPairing}
                      isLoading={adminConfigLoading}
                      className="w-full h-full rounded-2xl shadow-2xl overflow-y-auto border border-white/20 flex flex-col transition-colors duration-500 scrollbar-none xite-site-canvas dynamic-card-home"
                    />
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
                  <button
                    type="button"
                    onClick={handleSkipToEditor}
                    className="p-1 -mr-1 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors shrink-0 cursor-pointer"
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
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
                              onClick={() => {
                                setSelectedPersonality(p.id);
                                if (p.defaultPaletteId) {
                                  setSelectedPaletteId(p.defaultPaletteId);
                                }
                                if (p.defaultFontPairingId) {
                                  setSelectedFontPairingId(p.defaultFontPairingId);
                                }
                              }}
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
                      {dynamicPages.map((page) => {
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

          {/* Error Banner */}
          {error && (
            <div className="relative z-20 px-6 py-2.5 bg-red-50 border-t border-red-200 text-red-700 text-xs font-medium flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => window.location.assign(`/editor/${encodeURIComponent(subdomain)}`)}
                className="underline font-bold hover:text-red-900 ml-4 cursor-pointer"
              >
                Proceed to Editor anyway &rarr;
              </button>
            </div>
          )}

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
              onClick={builderTab === "fonts" ? handleLaunchEditor : handleAdvanceStepper}
              disabled={pending}
              className="px-8 py-2.5 text-xs font-bold uppercase tracking-wider bg-black text-white rounded-sm hover:bg-neutral-800 active:bg-neutral-900 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {pending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{builderTab === "fonts" ? "Finalizing Studio..." : "Next..."}</span>
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
