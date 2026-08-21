"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { AddSectionButton } from "@/components/ui/AddSectionButton";
import {
  Plus,
  Eye,
  Layout,
  RefreshCw,
  X,
  Info,
  GraduationCap,
  Users,
  Calendar,
  Mail,
  Briefcase,
  Award,
  AlertCircle,
  Compass,
  Target,
  Building2,
  Building,
  FileCheck,
  FlaskConical,
  Newspaper,
  Image,
  Quote,
  Trophy,
  MapPin,
  Footprints,
} from "lucide-react";
import { EditorToolbar } from "./EditorToolbar";
import { useSectionRuntime } from "@/hooks/useSectionRuntime";
import { DrawerPanel } from "./DrawerPanel";
import { DomainSettingsModal } from "./DomainSettingsModal";
import { UserProfileMenu } from "./UserProfileMenu";

/** The canvas element that stands in for `<body>` — the same scope the published site uses. */
const EDITOR_CANVAS_SCOPE = ".xite-site-canvas";

interface SectionItem {
  id: string;
  title: string;
  code: string;
  variantIndex: number;
  category?: string;
}

const SECTION_CATEGORIES = [
  { id: "navbar", name: "Navbar / Header", description: "Top navigation bar with logo, menu links & action buttons", icon: Compass },
  { id: "hero", name: "Hero Banner", description: "Lead banner, masthead & title headline", icon: Layout },
  { id: "highlights", name: "College Highlights", description: "Key stats, NIRF rankings & accreditation badges", icon: Award },
  { id: "about", name: "About College", description: "College history, overview & leadership message", icon: Info },
  { id: "vision", name: "Vision & Mission", description: "Institutional core values, vision & long-term goals", icon: Target },
  { id: "courses", name: "Courses / Programs Offered", description: "UG, PG & Ph.D degree programs grid", icon: GraduationCap },
  { id: "departments", name: "Departments", description: "Engineering, Science, Arts & Business faculties", icon: Building2 },
  { id: "admissions", name: "Admission Section", description: "Eligibility, fee structure & apply online form", icon: FileCheck },
  { id: "placements", name: "Placement & Recruiters", description: "Highest package stats & top hiring companies", icon: Briefcase },
  { id: "facilities", name: "Campus Facilities", description: "Library, hostels, sports complex & labs", icon: Building },
  { id: "research", name: "Research & Innovation", description: "Patents, R&D labs & published research papers", icon: FlaskConical },
  { id: "news", name: "News & Announcements", description: "Official circulars, notices & campus news", icon: Newspaper },
  { id: "events", name: "Upcoming Events", description: "Cultural fests, symposiums & workshops calendar", icon: Calendar },
  { id: "gallery", name: "Gallery / Campus Life", description: "Photo gallery, campus infrastructure & student life", icon: Image },
  { id: "testimonials", name: "Student Testimonials", description: "Alumni reviews, student experiences & stories", icon: Quote },
  { id: "achievements", name: "Achievements & Awards", description: "National awards, sports trophies & rankings", icon: Trophy },
  { id: "contact", name: "Contact / Enquiry Form", description: "Admissions helpdesk, address & contact form", icon: Mail },
  { id: "map", name: "Map & Location", description: "Interactive campus map, directions & transportation", icon: MapPin },
  { id: "footer", name: "Footer", description: "Bottom copyright, quick links & social icons", icon: Footprints },
];

/**
 * A unique id for a newly added section.
 *
 * At module scope rather than inline in the handler: `react-hooks/purity`
 * flags `Date.now()` and `Math.random()` anywhere inside a component, because
 * it cannot tell an event handler from a render path. Reading the clock in a
 * handler is fine; moving the call out here says so without an eslint-disable,
 * and gives the four other places that build an id this way somewhere to move.
 */
function newSectionId(prefix = "sec"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * The seam between two sections, and the way a section is added at a position.
 *
 * Collapsed to a few pixels and invisible until the pointer is over it, so the
 * canvas still reads as the page it is rather than as a form with a control
 * between every block. It expands on hover because a 4px target is not one.
 *
 * `stopPropagation` matters here: the section wrappers on either side select
 * themselves on click, and without it pressing the seam would select a section
 * and open the picker at the same time.
 */
function SectionInsertPoint({
  index,
  onInsert,
}: {
  index: number;
  onInsert: (index: number) => void;
}) {
  return (
    <div
      className="group/insert relative z-20 flex h-2 w-full items-center justify-center transition-all duration-150 hover:h-11"
      data-xite-insert-at={index}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-cyan-400/70 opacity-0 transition-opacity duration-150 group-hover/insert:opacity-100"
      />
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onInsert(index);
        }}
        title={`Add a section here (position ${index + 1})`}
        aria-label={`Add a section at position ${index + 1}`}
        className="relative inline-flex items-center gap-1.5 rounded-full border border-cyan-400/60 bg-slate-900 px-3 py-1 text-[10px] font-extrabold tracking-tight text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/insert:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif" }}
      >
        <Plus className="h-3 w-3 stroke-[3] text-cyan-300" />
        Add Section
      </button>
    </div>
  );
}

interface EditorStudioProps {
  subdomain?: string;
  collegeName?: string;
}

export function EditorStudio({
  subdomain = "greenfield",
  collegeName = "Greenfield University",
}: EditorStudioProps) {
  const [viewportWidth, setViewportWidth] = useState<string>("100%");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<string>("domain");
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [historyStack, setHistoryStack] = useState<SectionItem[][]>([]);
  const [redoStack, setRedoStack] = useState<SectionItem[][]>([]);
  const [adminDbTemplates, setAdminDbTemplates] = useState<any[]>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(0);
  const [loadingDb, setLoadingDb] = useState(true);
  // Full multi-page config loaded from /api/v1/my-website (per-college, DB-persisted)
  const [myWebsiteConfig, setMyWebsiteConfig] = useState<{ pages: Array<{ slug: string; title: string; sections: SectionItem[] }> } | null>(null);

  // Active inline text editing state tracking
  const activeEditingElemRef = useRef<HTMLElement | null>(null);
  const activeEditingSectionIdxRef = useRef<number | null>(null);
  const activeEditingContainerRef = useRef<HTMLElement | null>(null);

  // Check if user has explicitly logged out
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("xite_user_logged_out") === "true") {
        window.location.href = "/login";
      }
    }
  }, []);

  // Helper to record history snapshot before mutating sections state
  const setSectionsWithHistory: React.Dispatch<React.SetStateAction<SectionItem[]>> = (action) => {
    setSections((prevSections) => {
      const nextSections = typeof action === "function" ? action(prevSections) : action;
      if (JSON.stringify(prevSections) !== JSON.stringify(nextSections)) {
        setHistoryStack((history) => [...history.slice(-49), prevSections]);
        setRedoStack([]);
      }
      return nextSections;
    });
  };

  // Undo & Redo History Stack Handlers (Applies to Text Edits & Page Sections)
  const handleUndo = () => {
    if (typeof document !== "undefined" && document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

    if (historyStack.length === 0) {
      showToastNotification("ℹ️ At initial state (No earlier history)");
      return;
    }
    const previousState = historyStack[historyStack.length - 1]!;
    setRedoStack((prev) => [...prev, sections]);
    setHistoryStack((prev) => prev.slice(0, prev.length - 1));
    setSections(previousState);
    showToastNotification("↩️ Undo performed!");
  };

  const handleRedo = () => {
    if (typeof document !== "undefined" && document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }

    if (redoStack.length === 0) {
      showToastNotification("ℹ️ At latest state (No redo history)");
      return;
    }
    const nextState = redoStack[redoStack.length - 1]!;
    setHistoryStack((prev) => [...prev, sections]);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setSections(nextState);
    showToastNotification("↪️ Redo performed!");
  };

  // Global Keyboard Shortcuts for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;

      // Ignore shortcut only if user is typing inside form inputs / textareas
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
        return;
      }

      const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (ctrlOrCmd && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (ctrlOrCmd && (e.key.toLowerCase() === "y" || (e.shiftKey && e.key.toLowerCase() === "z"))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyStack, redoStack, sections]);

  // Section Selector Modal
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  /**
   * Where the section the user is about to pick should land.
   *
   * `null` means the modal was opened from the toolbar, which has no position
   * in mind — that path keeps its existing placement rules (a navbar goes to
   * the top, a hero directly under it, anything else replaces its own kind or
   * slots in above the footer). A number means the user pressed a specific
   * insertion point on the canvas, and the only correct answer is the index
   * they pressed.
   */
  const [pendingInsertIndex, setPendingInsertIndex] = useState<number | null>(null);

  /**
   * Pages the user created in this session that have never held a section.
   *
   * A brand-new page must open empty. Without this, `fetchDbSections` finds no
   * entry for the slug and falls through to the platform default, so creating
   * "Admissions" silently filled it with the default home page — which then
   * autosaved, making the copy permanent.
   *
   * A ref, not state: nothing renders from it, and `fetchDbSections` reads it
   * from inside an effect that must not re-run when it changes.
   */
  const freshPageSlugsRef = useRef<Set<string>>(new Set());

  /** Opens the picker for a specific slot on the canvas. */
  const openAddSectionModalAt = (index: number) => {
    setPendingInsertIndex(index);
    setShowAddSectionModal(true);
  };

  /**
   * Closes the picker and forgets the slot.
   *
   * Every dismissal goes through here — the close button, the backdrop, and
   * each branch that finishes adding a section. A `pendingInsertIndex` left
   * behind by a cancelled press would silently redirect the *next* section the
   * user adds from the toolbar to wherever they last pointed.
   */
  const closeAddSectionModal = () => {
    setShowAddSectionModal(false);
    setPendingInsertIndex(null);
  };

  // Right-Click Link / Button Navigation Popup State
  const [linkPopup, setLinkPopup] = useState<{
    x: number;
    y: number;
    sectionIndex: number;
    targetElement: HTMLElement;
    currentUrl: string;
    isNewTab: boolean;
  } | null>(null);

  // Dynamic Toast Notification State (Disabled per user request)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToastNotification = (_msg: string) => {
    // Popups completely disabled per user request
    setToastMessage(null);
  };

  // Right-Click Image, Logo & Background Editor Modal State
  const [imagePopup, setImagePopup] = useState<{
    x: number;
    y: number;
    sectionIndex: number;
    targetElement: HTMLElement;
    targetType: "logo" | "image" | "background";
    logoText: string;
    bgColor: string;
    imageUrl: string;
    originalUrl: string;
    linkUrl: string;
    applyAllLogos: boolean;
    applyAllBackgrounds: boolean;
    activeTab: "logo" | "background" | "image" | "style";
    objectFit: "cover" | "contain" | "fill";
    borderRadius: string;
  } | null>(null);

  // Right-Click Map & Location Editor Modal State
  const [mapPopup, setMapPopup] = useState<{
    sectionIndex: number;
    mapEmbedUrl: string;
    directionsUrl: string;
    locationName: string;
  } | null>(null);

  // Backward compatibility alias for legacy logoPopup state access
  const logoPopup = imagePopup;
  const setLogoPopup = (val: any) => {
    if (!val) {
      setImagePopup(null);
      return;
    }
    setImagePopup((prev) => (prev ? { ...prev, ...val } : val));
  };

  const [_activePalette, setActivePalette] = useState("academic-blue");
  const [_activeFont, setActiveFont] = useState("inter");

  // Strip out canvas wrapper divs and html entity pollution while preserving section CSS & style tags
  const cleanCanvasWrapperFromCode = (rawCode: string): string => {
    if (!rawCode) return "";

    let clean = rawCode;

    // 1. Remove mobile drawer overlays & hamburger buttons injected dynamically
    clean = clean.replace(/<div[^>]*class="[^"]*mobile-drawer-menu[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
    clean = clean.replace(/<button[^>]*class="[^"]*hamburger-toggle-btn[^"]*"[^>]*>[\s\S]*?<\/button>/gi, "");

    // 2. Un-escape HTML entities if present (&lt;, &gt;, &amp;)
    clean = clean.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

    // 3. Strip outer wrapper divs injected by canvas (.section-canvas-box, .section-wrapper-container)
    clean = clean.replace(/^<div[^>]*class="[^"]*(?:section-canvas-box|section-wrapper-container)[^"]*"[^>]*>([\s\S]*)<\/div>$/i, (_match, inner) => {
      return inner ? inner.trim() : _match;
    });

    return clean.trim();
  };

  // Handle full-page Color Theme Palette Switch across ALL sections
  const handlePaletteSelect = (paletteId: string) => {
    setActivePalette(paletteId);

    const PALETTES_MAP: Record<string, { primary: string; secondary: string; accent: string; headerBg: string; textAccent: string }> = {
      "academic-blue": { primary: "#0f172a", secondary: "#1e293b", accent: "#2563eb", headerBg: "#0d1527", textAccent: "#38bdf8" },
      "emerald-gold": { primary: "#022c22", secondary: "#064e3b", accent: "#f59e0b", headerBg: "#022c22", textAccent: "#fbbf24" },
      "crimson-slate": { primary: "#4c0519", secondary: "#881337", accent: "#f43f5e", headerBg: "#4c0519", textAccent: "#fb7185" },
      "midnight-purple": { primary: "#0d0418", secondary: "#180828", accent: "#a855f7", headerBg: "#0d0418", textAccent: "#c084fc" },
      "sunset-amber": { primary: "#18181b", secondary: "#27272a", accent: "#f59e0b", headerBg: "#09090b", textAccent: "#fbbf24" },
      "modern-dark": { primary: "#0b1329", secondary: "#1e293b", accent: "#38bdf8", headerBg: "#0b1329", textAccent: "#7dd3fc" },
      "crimson-gold": { primary: "#3b0764", secondary: "#581c87", accent: "#eab308", headerBg: "#3b0764", textAccent: "#fde047" },
      "cyber-neon": { primary: "#050814", secondary: "#0f172a", accent: "#06b6d4", headerBg: "#050814", textAccent: "#22d3ee" },
      "rose-quartz": { primary: "#1f1924", secondary: "#2d2336", accent: "#f472b6", headerBg: "#1f1924", textAccent: "#f472b6" },
      "light-minimal": { primary: "#ffffff", secondary: "#f8fafc", accent: "#2563eb", headerBg: "#0f172a", textAccent: "#2563eb" },
    };

    const target = PALETTES_MAP[paletteId] || PALETTES_MAP["academic-blue"]!;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(`xite_theme_palette_${subdomain}`, paletteId);
      }
    } catch {}

    // Transform color scheme across ALL sections (Buttons, Cards, Accents, Headers, Footers, Badges)
    setSectionsWithHistory((prevSections) =>
      prevSections.map((sec) => {
        let code = sec.code;
        // Swap button background colors, accent badges & highlights
        code = code
          .replace(/background:\s*#(2563eb|ef4444|000000|0f172a|881337|064e3b|a855f7|f59e0b|06b6d4|eab308|f472b6|f43f5e)/gi, `background: ${target.accent}`)
          .replace(/background-color:\s*#(2563eb|ef4444|000000|0f172a|881337|064e3b|a855f7|f59e0b|06b6d4|eab308|f472b6|f43f5e)/gi, `background-color: ${target.accent}`)
          .replace(/border-color:\s*#(2563eb|ef4444|000000|0f172a|881337|064e3b|a855f7|f59e0b|06b6d4|eab308|f472b6|f43f5e)/gi, `border-color: ${target.accent}`)
          .replace(/color:\s*#(38bdf8|4ade80|fbbf24|c084fc|22d3ee|7dd3fc|fde047|f472b6|60a5fa)/gi, `color: ${target.textAccent}`)
          .replace(/<header style="background:\s*[^;]+;/gi, `<header style="background: ${target.headerBg};`)
          .replace(/<footer style="background:\s*[^;]+;/gi, `<footer style="background: ${target.primary};`);

        return { ...sec, code };
      })
    );
  };

  // Handle full-page Font Family Switch across ALL sections
  const handleFontSelect = (fontId: string) => {
    setActiveFont(fontId);

    const FONT_MAP: Record<string, string> = {
      inter: "'Inter', system-ui, -apple-system, sans-serif",
      outfit: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
      serif: "'Playfair Display', Georgia, serif",
      cormorant: "'Cormorant Garamond', Georgia, serif",
      roboto: "'Roboto', system-ui, sans-serif",
      "space-grotesk": "'Space Grotesk', system-ui, sans-serif",
      "plus-jakarta": "'Plus Jakarta Sans', system-ui, sans-serif",
    };

    const targetFont = FONT_MAP[fontId] || FONT_MAP["inter"]!;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(`xite_theme_font_${subdomain}`, fontId);
      }
    } catch {}

    // Update font-family style attribute across ALL sections and inner elements
    setSectionsWithHistory((prevSections) =>
      prevSections.map((sec) => {
        let code = sec.code;
        code = code.replace(/font-family:\s*[^;]+;/gi, `font-family: ${targetFont};`);
        return { ...sec, code };
      })
    );
  };

  const showToast = (_msg?: string) => {
    // Toast popups completely removed
  };

  // ─── The section environment ────────────────────────────────────────────────
  // The environment, the responsive engine and every section's own CSS. Shared
  // with the published site, and built from the same functions the Admin's iframe
  // uses — so what is edited here is what ships, at every width.
  useSectionRuntime({
    sections,
    scope: EDITOR_CANVAS_SCOPE,
    simulatedWidth: viewportWidth,
  });

  // ─── Section Script Execution ───────────────────────────────────────────────
  // Browsers ignore <script> tags inserted via dangerouslySetInnerHTML.
  // Extract and execute inline and external scripts per section so interactive menus,
  // dropdown toggles, drawers, modals, and tab scripts work exactly as in Admin preview.
  useEffect(() => {
    document.querySelectorAll("script[data-xite-section-script]").forEach((el) => el.remove());

    const timer = setTimeout(() => {
      // Auto-attach hamburger toggle listener to all hamburger buttons in canvas
      document.querySelectorAll(".hamburger-toggle-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const header = btn.closest("header");
          const menu = header?.querySelector(".mobile-drawer-menu");
          if (menu) {
            menu.classList.toggle("active");
          }
        });
      });

      // Prevent link clicks from reloading page or changing URL inside editor
      document.querySelectorAll(".section-canvas-box a").forEach((a) => {
        a.addEventListener("click", (e) => {
          const href = (a as HTMLAnchorElement).getAttribute("href");
          if (href && (href.startsWith("#") || href.startsWith("/") || href.startsWith("http"))) {
            e.preventDefault();
          }
        });
      });

      sections.forEach((sec) => {
        if (!sec.code) return;
        const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
        let m;
        while ((m = scriptRegex.exec(sec.code)) !== null) {
          const attrs = m[1] || "";
          const inlineJs = m[2] || "";
          const srcMatch = attrs.match(/src=["']([^"']+)["']/i);

          const scriptEl = document.createElement("script");
          scriptEl.setAttribute("data-xite-section-script", sec.id);

          if (srcMatch && srcMatch[1]) {
            scriptEl.src = srcMatch[1];
          } else if (inlineJs.trim()) {
            // Unpack DOMContentLoaded / load wrappers so handlers attach immediately in React SPA
            const processed = inlineJs.replace(
              /(?:document|window)\.addEventListener\(\s*['"](?:DOMContentLoaded|load)['"]\s*,\s*(?:function\s*\([^)]*\)\s*|\([^)]*\)\s*=>\s*)\{([\s\S]*)\}\s*\);?/gi,
              "$1"
            );
            scriptEl.textContent = `try { (function(){\n${processed}\n})(); } catch(e) { console.warn("Section script error:", e); }`;
          }
          document.body.appendChild(scriptEl);
        }
      });
    }, 120);

    return () => {
      clearTimeout(timer);
      document.querySelectorAll("script[data-xite-section-script]").forEach((el) => el.remove());
    };
  }, [sections]);

  // Non-destructive canvas HTML processor
  // Preserves 100% of user-defined HTML, body styles, attributes, and colors exactly as in Admin
  const cleanFullWebCodeForCanvas = (code: string, _width: string): string => {
    if (!code) return "";

    let cleanCode = code;

    const bodyFullMatch = code.match(/<body([^>]*)>([\s\S]*?)<\/body\s*>/i);
    if (bodyFullMatch) {
      const bodyAttrs = bodyFullMatch[1] || "";
      const bodyContent = bodyFullMatch[2] || "";
      const headMatch = code.match(/<head[^>]*>([\s\S]*?)<\/head\s*>/i);
      const styles = headMatch ? headMatch[1] : "";
      cleanCode = `${styles}\n<div class="xite-body-wrapper" ${bodyAttrs}>${bodyContent}</div>`;
    } else {
      // `` on every tag name: `<head[\s\S]*?>` also matches `<header ...>` and
      // `</head>` matches `</header>`, so this pass used to delete the wrapper of
      // every navbar section — background, padding and all.
      cleanCode = code
        .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
        .replace(/<\/?html[^>]*>/gi, "")
        .replace(/<\/?head[^>]*>/gi, "")
        .replace(/<\/?body[^>]*>/gi, "");
    }

    // Wrap in section-canvas-box — the CSS isolation reset targeting this class
    // is injected into document.head once on mount (see the Canvas Isolation useEffect above).
    return `<div class="section-canvas-box w-full block text-left relative">${cleanCode}</div>`;
  };

  // Active Page State
  const [currentPage, setCurrentPage] = useState({ name: "Home", slug: "/home" });

  /**
   * Where the editor keeps work between page switches and reloads.
   *
   * Scoped to the college. The key used to be a bare, unscoped string — one slot
   * shared by every tenant that had ever used this browser — and it is read
   * *before* the database, so whoever signed in next was shown the previous
   * tenant's sections as their own. That is how a college opens its editor and
   * finds another brand's section at the top of its page, still there after the
   * original tenant has been deleted outright, because the copy lives in the
   * browser rather than in the database.
   *
   * The sibling key xite_active_sections_<subdomain>_<page> was already scoped
   * this way; this one had been missed.
   *
   * Deliberately no migration from the old key: its contents cannot be
   * attributed to any college, so importing them would repeat the bug.
   */
  const pageStoreKey = `xite_saved_pages_${subdomain}`;

  // Per-Page Persistent Auto-Save Store
  const [pageStore, setPageStore] = useState<Record<string, SectionItem[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`xite_saved_pages_${subdomain}`);
        if (saved && saved !== "undefined" && saved !== "null") {
          return JSON.parse(saved);
        }
      } catch (e) {
        console.warn("Could not parse saved pages from localStorage:", e);
      }
    }
    return {};
  });

  // Auto-save active sections to pageStore & localStorage whenever sections update
  useEffect(() => {
    if (sections.length > 0 && currentPage.slug) {
      const pageKey = (currentPage.slug || "/home").replace(/\//g, "_") || "home";
      setPageStore((prev) => {
        const updated = { ...prev, [currentPage.slug]: sections };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(pageStoreKey, JSON.stringify(updated));
            localStorage.setItem(`xite_active_sections_${subdomain}_${pageKey}`, JSON.stringify(sections));
          } catch {}
        }
        return updated;
      });
    }
  }, [sections, currentPage.slug, subdomain]);

  // Debounced autosave to /api/v1/my-website (per-college DB) whenever sections change.
  // 2s debounce: fires after user stops editing, not on every keystroke.
  useEffect(() => {
    if (sections.length === 0 || !currentPage.slug || loadingDb) return;

    const timer = setTimeout(() => {
      // Fire-and-forget: errors are non-fatal (localStorage is the fallback)
      void handlePersistWebsiteSave();
    }, 2000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  // Helper to normalize category key aliases across Admin DB templates & Editor categories
  const normalizeCategory = (cat?: string): string => {
    if (!cat) return "";
    const c = cat.toLowerCase().trim();
    if (c.includes("header") || c.includes("navbar") || c === "nav") return "navbar";
    if (c.includes("hero") || c.includes("banner") || c.includes("masthead")) return "hero";
    if (c.includes("admission") || c.includes("apply") || c.includes("eligibility")) return "admissions";
    if (c.includes("highlight") || c.includes("stat") || c.includes("metric")) return "highlights";
    if (c.includes("about")) return "about";
    if (c.includes("vision") || (c.includes("mission") && !c.includes("admission")) || c.includes("principle")) return "vision";
    if (c.includes("course") || c.includes("program") || c.includes("degree")) return "courses";
    if (c.includes("department") || c.includes("faculty") || c.includes("school")) return "departments";
    if (c.includes("placement") || c.includes("recruiter") || c.includes("career")) return "placements";
    if (c.includes("facilit") || c.includes("infrastruct") || c.includes("hostel") || c.includes("library")) return "facilities";
    if (c.includes("research") || c.includes("patent") || c.includes("r&d") || c.includes("lab")) return "research";
    if (c.includes("news") || c.includes("circular") || c.includes("announc") || c.includes("notice")) return "news";
    if (c.includes("event") || c.includes("calendar") || c.includes("fest")) return "events";
    if (c.includes("gallery") || c.includes("campus life") || c.includes("photo")) return "gallery";
    if (c.includes("testimonial") || c.includes("alumni") || c.includes("review")) return "testimonials";
    if (c.includes("award") || c.includes("achievement") || c.includes("rank") || c.includes("trophy")) return "achievements";
    if (c.includes("contact") || c.includes("enquir") || c.includes("inquir") || c.includes("helpdesk")) return "contact";
    if (c.includes("map") || c.includes("location") || c.includes("direction")) return "map";
    if (c.includes("footer") || c.includes("copyright")) return "footer";
    return c;
  };

  // Live Admin templates map state
  const [liveAdminTemplatesMap, setLiveAdminTemplatesMap] = useState<Record<string, string>>({});

  const deduplicateSections = (secs: SectionItem[]): SectionItem[] => {
    const seenIds = new Set<string>();

    return secs.filter((sec) => {
      if (!sec || !sec.code) return false;
      if (seenIds.has(sec.id)) return false;
      seenIds.add(sec.id);
      return true;
    });
  };

  /**
   * The sections for one page slug, from the college's own saved config.
   *
   * Sources, in order: the config already in state, `/api/v1/my-website`, the
   * platform default, then the localStorage cache. An empty page is a real
   * answer at the end of that list.
   *
   * Every lookup is now *exact* on the slug. Each of the three config sources
   * used to fall back to `/home`, and then to `pages[0]`, when the requested
   * slug was missing — so any page the college had not saved yet rendered the
   * home page's sections under its own name, and the editor's autosave then
   * wrote that copy to the database. Asking for a page that does not exist
   * yields nothing, which is what an empty page is.
   */
  const fetchDbSections = async (slug: string = "/home", forceSync: boolean = false) => {
    setLoadingDb(true);
    const cleanSlug = (slug || "/home").replace(/\//g, "_") || "home";

    // A page created moments ago has nothing to load and nothing to seed from.
    // It opens empty, and stays that way until the user presses Add Section.
    if (freshPageSlugsRef.current.has(slug)) {
      setSections([]);
      setActiveSectionIndex(null);
      setLoadingDb(false);
      return;
    }

    try {
      // 1. If we already have the full config in state and not forceSync, switch active page sections
      if (!forceSync && myWebsiteConfig && myWebsiteConfig.pages) {
        const targetPage = myWebsiteConfig.pages.find((p) => p.slug === slug);
        if (targetPage && Array.isArray(targetPage.sections) && targetPage.sections.length > 0) {
          const cleanSecs = deduplicateSections(targetPage.sections);
          setSections(cleanSecs);
          setActiveSectionIndex(0);
          setLoadingDb(false);
          return;
        }
      }

      // 2. Primary Source: Fetch from /api/v1/my-website (per-college, authenticated DB)
      for (const baseUrl of getApiBases()) {
        try {
          const res = await fetch(`${baseUrl}/api/v1/my-website`, { credentials: "include" });
          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            if (data && Array.isArray(data.pages) && data.pages.length > 0) {
              // Store full config for later cross-page saves
              const configWithSections = {
                pages: data.pages.map((p: any) => ({
                  slug: p.slug,
                  title: p.title,
                  sections: Array.isArray(p.sections)
                    ? p.sections.map((s: any, idx: number) => ({
                        id: s.id || `sec-${idx}`,
                        title: s.title || s.name || "Section",
                        code: s.code || s.html || s.content || "",
                        category: normalizeCategory(s.sectionType || s.category || s.type || ""),
                        variantIndex: 0,
                      }))
                    : [],
                })),
              };
              setMyWebsiteConfig(configWithSections);

              // Also update pageStore for cross-page navigation
              const newPageStore: Record<string, SectionItem[]> = {};
              configWithSections.pages.forEach((p: { slug: string; title: string; sections: SectionItem[] }) => { newPageStore[p.slug] = p.sections; });
              setPageStore((prev) => ({ ...prev, ...newPageStore }));

              const targetPage = configWithSections.pages.find(
                (p: { slug: string; title: string; sections: SectionItem[] }) => p.slug === slug,
              );
              if (targetPage && targetPage.sections.length > 0) {
                const cleanSecs = deduplicateSections(targetPage.sections);
                setSections(cleanSecs);
                setActiveSectionIndex(0);
                try {
                  localStorage.setItem(`xite_active_sections_${subdomain}_${cleanSlug}`, JSON.stringify(cleanSecs));
                } catch {}
                setLoadingDb(false);
                return;
              }
            }
          }
        } catch (e) {}
      }

      // 3. Fallback: Super Admin Default Website Config (/api/v1/default-website)
      for (const baseUrl of getApiBases()) {
        try {
          const defRes = await fetch(`${baseUrl}/api/v1/default-website`);
          if (defRes.ok) {
            const defData = await defRes.json().catch(() => ({}));
            if (defData && Array.isArray(defData.pages)) {
              const targetPage = defData.pages.find((p: any) => p.slug === slug);
              if (targetPage && Array.isArray(targetPage.sections) && targetPage.sections.length > 0) {
                const cleanSecs = deduplicateSections(targetPage.sections);
                setSections(cleanSecs);
                setActiveSectionIndex(0);
                try {
                  localStorage.setItem(`xite_active_sections_${subdomain}_${cleanSlug}`, JSON.stringify(cleanSecs));
                } catch {}
                setLoadingDb(false);
                return;
              }
            }
          }
        } catch (e) {}
      }

      // 4. Fallback: localStorage cache if DB offline
      if (typeof window !== "undefined") {
        try {
          const rawActive = localStorage.getItem(`xite_active_sections_${subdomain}_${cleanSlug}`);
          if (rawActive && rawActive !== "undefined" && rawActive !== "null") {
            const parsedActive = JSON.parse(rawActive);
            if (Array.isArray(parsedActive) && parsedActive.length > 0) {
              const cleanSecs = deduplicateSections(parsedActive);
              setSections(cleanSecs);
              setActiveSectionIndex(0);
              setLoadingDb(false);
              return;
            }
          }
        } catch (err) {
          console.warn("Could not load sections from localStorage:", err);
        }
      }

      setSections([]);
      setActiveSectionIndex(null);
    } finally {
      setLoadingDb(false);
    }
  };

  // Returns only valid absolute backend URLs — NEVER empty string (which causes
  // relative requests to broken Next.js routes like /admin/templates that previously
  // resolved to the legacy meetkishore.in domain).
  const getApiBases = (): string[] => {
    const bases: string[] = [];

    // 1. Env-configured API base (highest priority)
    if (process.env.NEXT_PUBLIC_API_BASE_URL) bases.push(process.env.NEXT_PUBLIC_API_BASE_URL);
    if (process.env.NEXT_PUBLIC_API_URL) bases.push(process.env.NEXT_PUBLIC_API_URL);

    // 2. Localhost dev fallback (only when running locally)
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        bases.push("http://localhost:4000");
      }
      // NOTE: Do NOT push "" (empty string) here — it creates relative requests
      // to Next.js routes that have no backend handler and cause cascading 404s
    }

    // 3. Hardcoded production backend (final fallback)
    bases.push("https://api.xite.co.in");

    return Array.from(new Set(bases.filter((b) => b !== undefined && b !== null && b !== "").map((b) => b.replace(/\/+$/, ""))));
  };

  const loadAdminTemplates = async () => {
    const dbTemplates: any[] = [];
    const freshMap: Record<string, string> = {};
    const seenIds = new Set<string>();

    // ONLY use the canonical admin templates endpoint — do NOT fallback to
    // /admin/templates or /api/admin/templates which have no backend route
    // and previously caused requests to leak to meetkishore.in
    for (const baseUrl of getApiBases()) {
      try {
        let res = await fetch(`${baseUrl}/api/v1/admin/templates`).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`${baseUrl}/api/v1/admin/templates`, { credentials: "include" }).catch(() => null);
        }

        if (res && res.ok) {
          const data = await res.json().catch(() => ({}));
          const rawList = Array.isArray(data) ? data : data?.templates || data?.data || [];

          if (Array.isArray(rawList) && rawList.length > 0) {
            rawList.forEach((t: any) => {
              if (t && (t.code || t.html || t.content)) {
                const tId = t.id || t._id?.toString?.() || `tpl-${t.name || Math.random()}`;
                if (!seenIds.has(tId)) {
                  seenIds.add(tId);
                  dbTemplates.push(t);
                }
              }
            });
            break; // Stop after first successful base URL
          }
        }
      } catch (e) {}
    }

    // Map all Admin DB templates into freshMap
    if (Array.isArray(dbTemplates) && dbTemplates.length > 0) {
      dbTemplates.forEach((t: any) => {
        const code = t.code || t.html || t.content;
        if (!code) return;

        // Parse category from t.category or t.name [bracket] notation
        const rawCat = (t.category && t.category !== "undefined" && t.category !== "null") ? t.category : "";
        let parsedCat = (rawCat || t.sectionType || t.type || "").toLowerCase();
        if (parsedCat === "undefined" || parsedCat === "null") parsedCat = "";

        if (!parsedCat && t.name) {
          const match = t.name.match(/\[(.*?)\]/);
          if (match && match[1]) {
            parsedCat = match[1].toLowerCase().trim();
          }
        }
        if (!parsedCat && t.name) {
          const nameLower = t.name.toLowerCase();
          if (nameLower.includes("header") || nameLower.includes("nav")) parsedCat = "header";
          else if (nameLower.includes("hero") || nameLower.includes("banner")) parsedCat = "hero";
          else if (nameLower.includes("stat") || nameLower.includes("highlight")) parsedCat = "highlights";
          else if (nameLower.includes("about")) parsedCat = "about";
          else if (nameLower.includes("vision") || nameLower.includes("mission")) parsedCat = "vision";
          else if (nameLower.includes("course") || nameLower.includes("program")) parsedCat = "courses";
          else if (nameLower.includes("department")) parsedCat = "departments";
          else if (nameLower.includes("admission") || nameLower.includes("apply")) parsedCat = "admissions";
          else if (nameLower.includes("placement") || nameLower.includes("recruiter")) parsedCat = "placements";
          else if (nameLower.includes("facility") || nameLower.includes("hostel")) parsedCat = "facilities";
          else if (nameLower.includes("research") || nameLower.includes("innovation")) parsedCat = "research";
          else if (nameLower.includes("news") || nameLower.includes("notice")) parsedCat = "news";
          else if (nameLower.includes("event")) parsedCat = "events";
          else if (nameLower.includes("gallery") || nameLower.includes("campus")) parsedCat = "gallery";
          else if (nameLower.includes("testimonial") || nameLower.includes("alumni")) parsedCat = "testimonials";
          else if (nameLower.includes("achievement") || nameLower.includes("award")) parsedCat = "achievements";
          else if (nameLower.includes("contact") || nameLower.includes("enquiry")) parsedCat = "contact";
          else if (nameLower.includes("map") || nameLower.includes("location")) parsedCat = "map";
          else if (nameLower.includes("footer")) parsedCat = "footer";
        }

        // Auto-detect header or footer from HTML tags if category is still unknown
        if (!parsedCat && typeof code === "string") {
          const codeLower = code.toLowerCase();
          if (codeLower.includes("<header") || codeLower.includes("<nav")) parsedCat = "header";
          else if (codeLower.includes("<footer")) parsedCat = "footer";
        }

        t.category = parsedCat || t.category || "hero";
        const normCat = normalizeCategory(parsedCat);

        if (parsedCat) freshMap[parsedCat] = code;
        if (normCat) freshMap[normCat] = code;
        if (parsedCat.includes("header") || parsedCat.includes("nav") || (t.name || "").toLowerCase().includes("header") || (t.name || "").toLowerCase().includes("nav")) {
          freshMap["header"] = code;
          freshMap["navbar"] = code;
        }
      });
    }

    // Fetch live Admin DB default website sections (/api/v1/default-website) configured by Super Admin
    const defaultSecsFromAdminDb: SectionItem[] = [];
    for (const baseUrl of getApiBases()) {
      try {
        const defRes = await fetch(`${baseUrl}/api/v1/default-website`);
        if (defRes.ok) {
          const defData = await defRes.json().catch(() => ({}));
          if (defData && Array.isArray(defData.pages)) {
            const targetPage = defData.pages.find((p: any) => p.slug === currentPage.slug) || defData.pages.find((p: any) => p.slug === "/home");
            if (targetPage && Array.isArray(targetPage.sections)) {
              targetPage.sections.forEach((s: any, idx: number) => {
                const code = s.code || s.html || s.content;
                if (s && code) {
                  const rawType = s.sectionType || s.category || s.type || s.id || "";
                  const normType = normalizeCategory(rawType);
                  defaultSecsFromAdminDb.push({
                    id: s.id || `admin-def-sec-${idx}`,
                    title: s.title || s.name || "Section",
                    code: code,
                    category: normType || rawType,
                    variantIndex: 0,
                  });
                }
              });
            }

            defData.pages.forEach((p: any) => {
              if (Array.isArray(p.sections)) {
                p.sections.forEach((s: any) => {
                  const code = s.code || s.html || s.content;
                  const rawType = s.sectionType || s.category || s.type || s.id || "";
                  const normType = normalizeCategory(rawType);
                  if (rawType && !freshMap[rawType.toLowerCase()]) freshMap[rawType.toLowerCase()] = code;
                  if (normType && !freshMap[normType]) freshMap[normType] = code;
                });
              }
            });
            if (defaultSecsFromAdminDb.length > 0) break;
          }
        }
      } catch (e) {}
    }

    setAdminDbTemplates(dbTemplates);
    setLiveAdminTemplatesMap((prev) => ({ ...prev, ...freshMap }));
    // Note: intentionally NOT setting sections here.
    // Admin DB templates are only used in the Add Section picker UI.
    // User sections are loaded exclusively from /api/v1/my-website.
  };

  useEffect(() => {
    void fetchDbSections(currentPage.slug);
    void loadAdminTemplates();
  }, [currentPage.slug]);

  /**
   * Fills an empty page with the section set the Admin Studio has configured.
   *
   * This is what the Add Section button on an empty canvas does, and it is the
   * one moment a page is populated without the user choosing each piece.
   *
   * It reads `/api/v1/default-website` — the Super Admin's default website —
   * and takes every section of the matching page, in the order the backend
   * returns them, which is now `sortOrder`. All of them, not the first: a page
   * seeded with a header and nothing else is not a starting point.
   *
   * The function it replaces was named for this but did something else
   * entirely: it re-read `/api/v1/my-website`, the college's *own* saved
   * config, and then fell back to the home page when the current slug was not
   * in it. On a page the user had just created that meant the button copied the
   * home page onto it. It never touched the admin defaults at all.
   *
   * If the admin has no page at this slug, the home page's set is used — that
   * is what "the default sections" means for a page the platform has no
   * specific opinion about. If there is nothing to seed from, the picker opens
   * so the button still does something.
   */
  const seedPageFromAdminDefaults = async () => {
    setLoadingDb(true);

    for (const baseUrl of getApiBases()) {
      try {
        const res = await fetch(`${baseUrl}/api/v1/default-website`);
        if (!res.ok) continue;

        const data = await res.json().catch(() => ({}));
        if (!data || !Array.isArray(data.pages)) continue;

        const targetPage =
          data.pages.find((p: any) => p.slug === currentPage.slug) ||
          data.pages.find((p: any) => p.slug === "/home");

        const rawSections = Array.isArray(targetPage?.sections) ? targetPage.sections : [];
        // Order is the backend's; nothing is re-sorted here. Two clients each
        // deciding what "in order" means is how the editor and the published
        // site end up disagreeing about a page.
        const seeded: SectionItem[] = rawSections
          .map((s: any, idx: number) => ({
            id: `sec-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            title: s.title || s.name || "Section",
            code: s.code || s.html || s.content || "",
            category: normalizeCategory(s.sectionType || s.category || s.type || ""),
            variantIndex: 0,
          }))
          .filter((s: SectionItem) => Boolean(s.code));

        if (seeded.length === 0) continue;

        // Through the history stack, so the whole seed is one undo.
        setSectionsWithHistory(() => seeded);
        setActiveSectionIndex(0);
        freshPageSlugsRef.current.delete(currentPage.slug);
        setLoadingDb(false);
        // No explicit save here: `sections` is still the old empty array inside
        // this closure, so persisting now would write the state we are
        // replacing. The debounced autosave watching `sections` fires with the
        // seeded list a moment later, which is the one that should be stored.
        return;
      } catch {
        // Try the next base, then fall through to the picker.
      }
    }

    setShowAddSectionModal(true);
    setLoadingDb(false);
  };

  // Fetch admin UI templates (for the add-section picker UI only — does NOT override user sections)
  useEffect(() => {
    void loadAdminTemplates();
    const handleFocus = () => {
      // Refresh template picker on window focus but do NOT push into user's sections
      if (!activeEditingElemRef.current) {
        void loadAdminTemplates();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handlePageChange = (pageName: string, pageSlug: string) => {
    // 1. Auto-save current page sections first to pageStore & page-specific localStorage
    const currentSlugKey = (currentPage.slug || "/home").replace(/\//g, "_") || "home";
    setPageStore((prev) => {
      const updated = { ...prev, [currentPage.slug]: sections };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(pageStoreKey, JSON.stringify(updated));
          localStorage.setItem(`xite_active_sections_${subdomain}_${currentSlugKey}`, JSON.stringify(sections));
        } catch {}
      }
      return updated;
    });

    // 2. Set new active page context
    setCurrentPage({ name: pageName, slug: pageSlug });
    setActiveSectionIndex(0);

    // 3. Load saved sections for target page if already in pageStore or target page-specific localStorage
    const targetSlugKey = (pageSlug || "/home").replace(/\//g, "_") || "home";
    let targetSecs: SectionItem[] | null = null;

    if (pageStore[pageSlug] && pageStore[pageSlug].length > 0) {
      targetSecs = pageStore[pageSlug];
    } else if (typeof window !== "undefined") {
      try {
        const rawTargetActive = localStorage.getItem(`xite_active_sections_${subdomain}_${targetSlugKey}`);
        if (rawTargetActive && rawTargetActive !== "undefined" && rawTargetActive !== "null") {
          const parsed = JSON.parse(rawTargetActive);
          if (Array.isArray(parsed) && parsed.length > 0) {
            targetSecs = parsed;
          }
        }
      } catch {}
    }

    if (targetSecs && targetSecs.length > 0) {
      const cleanTarget = deduplicateSections(targetSecs);
      setSections(cleanTarget);
      showToastNotification(`Switched to page: ${pageName}`);
    } else {
      // 4. Fetch/Load sections for target page
      void fetchDbSections(pageSlug, true);
      showToastNotification(`Switched to page: ${pageName}`);
    }
  };

  const handlePersistWebsiteSave = async () => {
    // Build the full multi-page config from the current page sections + all other pages in state
    const updatedPageStore = { ...pageStore, [currentPage.slug]: sections };
    const currentSlugKey = (currentPage.slug || "/home").replace(/\//g, "_") || "home";

    // Update localStorage cache
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`xite_active_sections_${subdomain}_${currentSlugKey}`, JSON.stringify(sections));
        localStorage.setItem(pageStoreKey, JSON.stringify(updatedPageStore));
        setPageStore(updatedPageStore);
      } catch (err) {
        console.warn("Could not write to localStorage:", err);
      }
    }

    // Build the full pages config from all pages we know about
    const knownPages = myWebsiteConfig?.pages ?? [];
    const pageSlugSet = new Set(knownPages.map((p) => p.slug));

    // Merge: update sections for pages we have in state, keep rest from server config
    const mergedPages = knownPages.map((p) => ({
      slug: p.slug,
      title: p.title,
      sections: updatedPageStore[p.slug]
        ? updatedPageStore[p.slug].map((sec, idx) => ({
            id: sec.id || `sec-${idx}`,
            title: sec.title || `Section #${idx + 1}`,
            sectionType: sec.category || "hero",
            code: sec.code,
            sortOrder: idx,
          }))
        : (p.sections as any[]).map((s, idx) => ({
            id: s.id || `sec-${idx}`,
            title: s.title || `Section #${idx + 1}`,
            sectionType: s.category || s.sectionType || "hero",
            code: s.code || s.html || s.content || "",
            sortOrder: idx,
          })),
    }));

    // Add any pages that are only in pageStore but not yet in the server config
    Object.entries(updatedPageStore).forEach(([slug, secs]) => {
      if (!pageSlugSet.has(slug) && secs && secs.length > 0) {
        mergedPages.push({
          slug,
          title: slug.replace(/^\//, "").replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase()) || "Page",
          sections: secs.map((sec, idx) => ({
            id: sec.id || `sec-${idx}`,
            title: sec.title || `Section #${idx + 1}`,
            sectionType: sec.category || "hero",
            code: sec.code,
            sortOrder: idx,
          })) as any,
        });
      }
    });

    // If config is empty (no known pages yet), just save the current page
    if (mergedPages.length === 0) {
      mergedPages.push({
        slug: currentPage.slug || "/home",
        title: currentPage.name || "Home",
        sections: sections.map((sec, idx) => ({
          id: sec.id || `sec-${idx}`,
          title: sec.title || `Section #${idx + 1}`,
          sectionType: sec.category || "hero",
          code: sec.code,
          sortOrder: idx,
        })) as any,
      });
    }

    const fullConfig = { pages: mergedPages };

    // Save to /api/v1/my-website (per-college, authenticated)
    for (const baseUrl of getApiBases()) {
      try {
        const res = await fetch(`${baseUrl}/api/v1/my-website`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(fullConfig),
        });
        if (res.ok) {
          // Update the local full-config state so subsequent saves are incremental
          const saved = await res.json().catch(() => fullConfig);
          if (saved && Array.isArray(saved.pages)) {
            setMyWebsiteConfig({
              pages: saved.pages.map((p: any) => ({
                slug: p.slug,
                title: p.title,
                sections: Array.isArray(p.sections)
                  ? p.sections.map((s: any, idx: number) => ({
                      id: s.id || `sec-${idx}`,
                      title: s.title || "Section",
                      code: s.code || s.html || s.content || "",
                      category: normalizeCategory(s.sectionType || s.category || ""),
                      variantIndex: 0,
                    }))
                  : [],
              })),
            });
          }
          break; // saved successfully, stop trying other bases
        }
      } catch (err) {
        console.warn("Could not save to /api/v1/my-website:", err);
      }
    }
  };

  // Save active inline text edit and update section code in state when clicking outside
  const finishInlineTextEditing = useCallback(() => {
    const textElem = activeEditingElemRef.current;
    const sectionIndex = activeEditingSectionIdxRef.current;
    const container = activeEditingContainerRef.current;

    if (!textElem || sectionIndex === null || !container) return;

    textElem.contentEditable = "false";
    textElem.style.outline = "";
    textElem.style.outlineOffset = "";
    textElem.style.borderRadius = "";
    textElem.style.backgroundColor = "";

    activeEditingElemRef.current = null;
    activeEditingSectionIdxRef.current = null;
    activeEditingContainerRef.current = null;

    const canvasBox = container.querySelector(".section-canvas-box") as HTMLElement;
    const targetNode = canvasBox || container;

    const clone = targetNode.cloneNode(true) as HTMLElement;

    const badges = clone.querySelectorAll('.pointer-events-none');
    badges.forEach((b) => b.remove());

    const editables = clone.querySelectorAll('[contenteditable]');
    editables.forEach((el) => {
      el.removeAttribute('contenteditable');
      (el as HTMLElement).style.outline = '';
      (el as HTMLElement).style.outlineOffset = '';
      (el as HTMLElement).style.borderRadius = '';
      (el as HTMLElement).style.backgroundColor = '';
    });

    const newCode = cleanCanvasWrapperFromCode(clone.innerHTML || clone.outerHTML);
    if (newCode) {
      setSectionsWithHistory((prev) =>
        prev.map((sec, i) => (i === sectionIndex ? { ...sec, code: newCode } : sec))
      );
      showToastNotification("Text content updated!");
    }
  }, []);

  // Global document click handler to finish inline text editing when clicking outside
  useEffect(() => {
    const handleDocumentMouseDown = (e: MouseEvent) => {
      if (activeEditingElemRef.current) {
        const target = e.target as HTMLElement;
        if (target && !activeEditingElemRef.current.contains(target)) {
          finishInlineTextEditing();
        }
      }
    };
    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, [finishInlineTextEditing]);

  // Handle double-click inline text editing directly on section canvas
  const handleSectionDoubleClick = (e: React.MouseEvent<HTMLDivElement>, sectionIndex: number) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    if (!target) return;

    // Ignore container sections & structural wrappers
    if (target.tagName === "SECTION" || target.tagName === "HEADER" || target.tagName === "FOOTER" || target.tagName === "MAIN") return;
    if (target.tagName === "IMG" || target.tagName === "SVG" || (target.tagName === "BUTTON" && target.classList.contains("hamburger-toggle-btn"))) return;

    // Tags that can be edited inline
    const editableTags = ["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "A", "BUTTON", "LI", "STRONG", "EM", "B", "I", "TD", "TH", "DIV"];

    let textElem: HTMLElement | null = target;
    while (textElem && textElem !== e.currentTarget && !editableTags.includes(textElem.tagName)) {
      textElem = textElem.parentElement;
    }

    if (!textElem || textElem === e.currentTarget) {
      textElem = target;
    }

    if (textElem.tagName === "DIV" && textElem.children.length > 2) return;

    // Finish previous edit first if user double-clicked another element directly
    if (activeEditingElemRef.current && activeEditingElemRef.current !== textElem) {
      finishInlineTextEditing();
    }

    // Set active editing references
    activeEditingElemRef.current = textElem;
    activeEditingSectionIdxRef.current = sectionIndex;
    activeEditingContainerRef.current = e.currentTarget;

    // Enable inline content editing with high-visibility blue dashed outline
    textElem.contentEditable = "true";
    textElem.style.userSelect = "text";
    (textElem.style as any).webkitUserSelect = "text";
    textElem.style.outline = "2px dashed #2563eb";
    textElem.style.outlineOffset = "4px";
    textElem.style.borderRadius = "4px";
    textElem.style.backgroundColor = "rgba(37, 99, 235, 0.08)";

    setTimeout(() => {
      textElem?.focus();
      try {
        const range = document.createRange();
        range.selectNodeContents(textElem!);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch (err) {
        // ignore selection error
      }
    }, 20);

    textElem.onkeydown = (keyEvent) => {
      if (keyEvent.key === "Escape") {
        keyEvent.preventDefault();
        finishInlineTextEditing();
      }
    };
  };

  // Smoothly scroll canvas viewport to top Navbar header section
  const handleJumpToNavbarLogo = () => {
    if (typeof document === "undefined") return;
    const headerSection = document.querySelector("header") || document.querySelector(".section-wrapper-container");
    if (headerSection) {
      headerSection.scrollIntoView({ behavior: "smooth", block: "center" });
      headerSection.classList.add("ring-4", "ring-amber-400");
      setTimeout(() => {
        headerSection.classList.remove("ring-4", "ring-amber-400");
      }, 2000);
      showToastNotification("🚀 Navigated to Header Navbar Logo!");
    } else {
      showToastNotification("Header Navbar section not found on canvas!");
    }
  };



  // Real-time image live update & auto-save handler
  const handleUpdateAndSaveImage = (newParams: Partial<NonNullable<typeof imagePopup>>) => {
    if (!imagePopup) return;

    const updatedPopup = { ...imagePopup, ...newParams };
    setImagePopup(updatedPopup);

    const { sectionIndex, targetElement, targetType } = updatedPopup;
    const originalUrl = (imagePopup.originalUrl || "").trim();
    const finalImageUrl = (updatedPopup.imageUrl || "").trim();
    const finalLogoText = (updatedPopup.logoText || "").trim();
    const finalBgColor = updatedPopup.bgColor;
    const finalLinkUrl = (updatedPopup.linkUrl || "").trim();
    const finalObjectFit = updatedPopup.objectFit || "cover";
    const finalBorderRadius = updatedPopup.borderRadius || "10px";

    // 1. Live DOM manipulation for immediate visual feedback on screen
    if (targetType === "logo") {
      if (finalImageUrl) {
        if (targetElement.tagName === "IMG") {
          (targetElement as HTMLImageElement).src = finalImageUrl;
          targetElement.style.objectFit = finalObjectFit;
          targetElement.style.borderRadius = finalBorderRadius;
        } else {
          targetElement.innerHTML = `<img src="${finalImageUrl}" alt="Logo" data-logo="true" style="height: 38px; width: 38px; object-fit: ${finalObjectFit}; border-radius: ${finalBorderRadius}; cursor: pointer;" />`;
        }
      } else if (finalLogoText) {
        if (targetElement.tagName === "IMG") {
          const parent = targetElement.parentElement;
          if (parent) {
            parent.innerHTML = `<span style="font-size: 16px; font-weight: 900; color: #ffffff; background: ${finalBgColor}; padding: 6px 12px; border-radius: ${finalBorderRadius}; display: inline-block;">${finalLogoText}</span>`;
          }
        } else {
          targetElement.innerText = finalLogoText;
          targetElement.style.backgroundColor = finalBgColor;
        }
      }
    } else if (targetType === "background") {
      if (finalImageUrl) {
        targetElement.style.backgroundImage = `url("${finalImageUrl}")`;
        targetElement.style.backgroundSize = "cover";
        targetElement.style.backgroundPosition = "center";
      }
    } else {
      if (targetElement.tagName === "IMG") {
        (targetElement as HTMLImageElement).src = finalImageUrl;
        targetElement.style.objectFit = finalObjectFit;
        targetElement.style.borderRadius = finalBorderRadius;
      } else {
        targetElement.style.backgroundImage = `url("${finalImageUrl}")`;
        targetElement.style.backgroundSize = "cover";
      }
    }

    // Update Logo Link destination if set
    if (finalLinkUrl) {
      let anchorParent: HTMLElement | null = targetElement;
      while (anchorParent && anchorParent.tagName !== "A" && anchorParent !== document.body) {
        anchorParent = anchorParent.parentElement;
      }
      if (anchorParent && anchorParent.tagName === "A") {
        anchorParent.setAttribute("href", finalLinkUrl);
      }
    }

    // 2. Clone section container DOM to extract exact updated section HTML code with 100% precision
    const container = targetElement.closest(".section-wrapper-container") as HTMLElement;

    setSectionsWithHistory((prevSections) => {
      return prevSections.map((sec, idx) => {
        let newCode = sec.code;

        // Bulk apply all logos across page
        if (targetType === "logo" && updatedPopup.applyAllLogos && finalImageUrl) {
          newCode = newCode.replace(/(<img[^>]*data-logo="true"[^>]*src=")[^"]*(")/gi, `$1${finalImageUrl}$2`);
          newCode = newCode.replace(/(<img[^>]*alt="[^"]*Emblem[^"]*"[^>]*src=")[^"]*(")/gi, `$1${finalImageUrl}$2`);
          newCode = newCode.replace(/(<img[^>]*class="[^"]*logo[^"]*"[^>]*src=")[^"]*(")/gi, `$1${finalImageUrl}$2`);
          return { ...sec, code: cleanCanvasWrapperFromCode(newCode) };
        }

        // Bulk apply all section background images across page
        if (targetType === "background" && updatedPopup.applyAllBackgrounds && finalImageUrl) {
          newCode = newCode.replace(/background-image:\s*url\([^)]+\)/gi, `background-image: url("${finalImageUrl}")`);
          return { ...sec, code: cleanCanvasWrapperFromCode(newCode) };
        }

        // Update target section HTML
        if (idx === sectionIndex && container) {
          const clone = container.cloneNode(true) as HTMLElement;

          // Remove editor badges or outline artifacts
          const badges = clone.querySelectorAll(".pointer-events-none");
          badges.forEach((b) => b.remove());

          const editables = clone.querySelectorAll("[contenteditable]");
          editables.forEach((el) => {
            el.removeAttribute("contenteditable");
            (el as HTMLElement).style.outline = "";
            (el as HTMLElement).style.outlineOffset = "";
            (el as HTMLElement).style.borderRadius = "";
          });

          // Match exact target element by tag and index position
          if (targetElement.tagName === "IMG") {
            const containerImgs = Array.from(container.querySelectorAll("img"));
            const targetImgIndex = containerImgs.indexOf(targetElement as HTMLImageElement);
            const cloneImgs = clone.querySelectorAll("img");

            if (targetImgIndex >= 0 && cloneImgs[targetImgIndex]) {
              const targetCloneImg = cloneImgs[targetImgIndex]!;
              if (finalImageUrl) targetCloneImg.src = finalImageUrl;
              targetCloneImg.style.objectFit = finalObjectFit;
              targetCloneImg.style.borderRadius = finalBorderRadius;
            } else if (originalUrl && clone.innerHTML.includes(originalUrl)) {
              clone.innerHTML = clone.innerHTML.replaceAll(originalUrl, finalImageUrl);
            }
          } else if (targetType === "background" && finalImageUrl) {
            const bgElem = clone.querySelector('[style*="background-image"]') || clone.firstElementChild || clone;
            (bgElem as HTMLElement).style.backgroundImage = `url("${finalImageUrl}")`;
            (bgElem as HTMLElement).style.backgroundSize = "cover";
            (bgElem as HTMLElement).style.backgroundPosition = "center";
          } else if (targetType === "logo") {
            if (finalImageUrl) {
              const logoElem = clone.querySelector('img[data-logo="true"]') || clone.querySelector('img.logo') || clone.querySelector('img');
              if (logoElem) {
                (logoElem as HTMLImageElement).src = finalImageUrl;
                (logoElem as HTMLElement).style.objectFit = finalObjectFit;
                (logoElem as HTMLElement).style.borderRadius = finalBorderRadius;
              }
            }
          }

          // Update logo link URL on container clone if set
          if (finalLinkUrl) {
            const logoLink = clone.querySelector('a[href]') || clone.querySelector('a');
            if (logoLink) logoLink.setAttribute("href", finalLinkUrl);
          }

          const extractedCode = cleanCanvasWrapperFromCode(clone.innerHTML);
          if (extractedCode) return { ...sec, code: extractedCode };
        }

        // Direct string replacement fallback if container element not found
        if (idx === sectionIndex && originalUrl && finalImageUrl && newCode.includes(originalUrl)) {
          newCode = newCode.replaceAll(originalUrl, finalImageUrl);
          return { ...sec, code: cleanCanvasWrapperFromCode(newCode) };
        }

        return sec;
      });
    });

    showToastNotification("⚡ Image & Logo updated & auto-saved!");
  };

  // Auto-Update & Save Map Location, iFrame Embed, and Directions Link
  const handleUpdateAndSaveMap = (newParams: Partial<NonNullable<typeof mapPopup>>) => {
    if (!mapPopup) return;
    const updatedPopup = { ...mapPopup, ...newParams };
    setMapPopup(updatedPopup);

    const { sectionIndex, mapEmbedUrl, directionsUrl, locationName } = updatedPopup;
    const sec = sections[sectionIndex];
    if (!sec) return;

    let code = sec.code;

    // 1. Replace or insert iframe embed src
    if (code.includes("<iframe")) {
      code = code.replace(/<iframe[^>]*src=["']([^"']*)["'][^>]*>/gi, (match) => {
        return match.replace(/src=["']([^"']*)["']/i, `src="${mapEmbedUrl}"`);
      });
    } else {
      code = code.replace(
        /<div[^>]*>.*?Interactive Google Map View.*?<\/div>/gi,
        `<iframe src="${mapEmbedUrl}" width="100%" height="340" style="border:0; border-radius: 20px; margin-top: 24px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
      );
    }

    // 2. Update directions link href
    if (directionsUrl && (code.includes("GET DIRECTIONS") || code.includes("maps.google"))) {
      code = code.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?GET DIRECTIONS[\s\S]*?)<\/a>/gi, (match) => {
        return match.replace(/href=["']([^"']*)["']/i, `href="${directionsUrl}"`);
      });
    }

    // 3. Update location name title text if present
    if (locationName && (code.includes("CAMPUS") || code.includes("UNIVERSITY") || code.includes("LOCATION"))) {
      code = code.replace(/(VELLORE INSTITUTE OF TECHNOLOGY|UNIVERSAL COLLEGE CAMPUS|GREENFIELD CAMPUS|MAIN CAMPUS LOCATION)/gi, locationName);
    }

    setSectionsWithHistory((prev) =>
      prev.map((s, idx) => (idx === sectionIndex ? { ...s, code } : s))
    );
    void handlePersistWebsiteSave();
    showToastNotification("⚡ Campus map location & directions updated!");
  };

  // Right-click handler for Images, Logos, Section Backgrounds, Maps, and Buttons
  const handleSectionContextMenu = (e: React.MouseEvent<HTMLDivElement>, sectionIndex: number) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    // 📍 1. Map & Location iFrame / Button Target Detection
    const secObj = sections[sectionIndex];
    const secCategory = (secObj?.category || secObj?.title || "").toLowerCase();
    const isMapTarget =
      target.tagName === "IFRAME" ||
      target.closest("iframe") !== null ||
      (target.textContent && (target.textContent.includes("GOOGLE MAPS") || target.textContent.includes("CAMPUS LOCATION") || target.textContent.includes("GET DIRECTIONS"))) ||
      secCategory.includes("map") ||
      secCategory.includes("location");

    if (isMapTarget) {
      e.preventDefault();
      e.stopPropagation();

      const secContainer = document.querySelectorAll(".section-wrapper-container")[sectionIndex] as HTMLElement;
      const iframeElem = secContainer ? (secContainer.querySelector("iframe") as HTMLIFrameElement | null) : null;
      const currentEmbedUrl = iframeElem?.src || "https://maps.google.com/maps?q=Vellore%20Institute%20of%20Technology&t=&z=14&ie=UTF8&iwloc=&output=embed";

      const directionsBtn = secContainer ? (secContainer.querySelector("a[href*='maps']") as HTMLAnchorElement | null) : null;
      const currentDirectionsUrl = directionsBtn?.getAttribute("href") || "https://maps.google.com/?q=Vellore+Institute+of+Technology";

      setMapPopup({
        sectionIndex,
        mapEmbedUrl: currentEmbedUrl,
        directionsUrl: currentDirectionsUrl,
        locationName: "VELLORE INSTITUTE OF TECHNOLOGY",
      });
      return;
    }

    let currElem: HTMLElement | null = target;
    let targetType: "logo" | "image" | "background" | null = null;
    let imageUrl = "";
    let logoText = "";
    let bgColor = "#2563eb";
    let linkUrl = "";
    let objectFit: "cover" | "contain" | "fill" = "cover";
    let borderRadius = "10px";

    while (currElem && currElem !== e.currentTarget) {
      const tagName = currElem.tagName;
      const cls = (currElem.className || "").toString().toLowerCase();
      const isDataLogo = currElem.getAttribute("data-logo") === "true";
      const compStyle = window.getComputedStyle(currElem);
      const bgImg = compStyle.backgroundImage || currElem.style.backgroundImage || "";

      if (currElem.tagName === "A" || currElem.getAttribute("href")) {
        linkUrl = currElem.getAttribute("href") || "";
      }

      if (tagName === "IMG") {
        imageUrl = (currElem as HTMLImageElement).src || currElem.getAttribute("src") || "";
        if (isDataLogo || cls.includes("logo") || currElem.parentElement?.className?.toLowerCase().includes("logo")) {
          targetType = "logo";
        } else {
          targetType = "image";
        }
        objectFit = (compStyle.objectFit as any) || "cover";
        borderRadius = compStyle.borderRadius || "10px";
        break;
      } else if (isDataLogo || cls.includes("logo") || (currElem.innerText && currElem.innerText.trim().length <= 4 && (currElem.innerText.includes("AU") || currElem.innerText.includes("🎓") || currElem.innerText.includes("MEC")))) {
        targetType = "logo";
        logoText = currElem.innerText?.trim() || "LOGO";
        const imgChild = currElem.querySelector("img");
        if (imgChild) {
          imageUrl = imgChild.src;
        }
        bgColor = compStyle.backgroundColor !== "rgba(0, 0, 0, 0)" ? compStyle.backgroundColor : "#2563eb";
        break;
      } else if (bgImg && bgImg !== "none" && bgImg.includes("url(")) {
        targetType = "background";
        const match = bgImg.match(/url\(["']?(.*?)["']?\)/);
        if (match && match[1]) imageUrl = match[1];
        break;
      }
      currElem = currElem.parentElement;
    }

    // Fallback: check section background if right clicked empty space
    if (!targetType) {
      const secWrapper = target.closest(".section-wrapper-container") as HTMLElement;
      if (secWrapper) {
        const compStyle = window.getComputedStyle(secWrapper);
        const bgImg = compStyle.backgroundImage || secWrapper.style.backgroundImage || "";
        if (bgImg && bgImg !== "none" && bgImg.includes("url(")) {
          targetType = "background";
          const match = bgImg.match(/url\(["']?(.*?)["']?\)/);
          if (match && match[1]) imageUrl = match[1];
          currElem = secWrapper;
        }
      }
    }

    // Open Image & Logo Customizer Modal if Image/Logo/Background detected
    if (targetType && currElem) {
      e.preventDefault();
      e.stopPropagation();

      const mouseX = Math.min(e.clientX, window.innerWidth - 480);
      const mouseY = Math.min(e.clientY, window.innerHeight - 480);

      setImagePopup({
        x: Math.max(10, mouseX),
        y: Math.max(10, mouseY),
        sectionIndex,
        targetElement: currElem,
        targetType,
        logoText: logoText || "AU",
        bgColor,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80",
        originalUrl: imageUrl,
        linkUrl: linkUrl || "/home",
        applyAllLogos: targetType === "logo",
        applyAllBackgrounds: targetType === "background",
        activeTab: targetType === "logo" ? "logo" : targetType === "background" ? "background" : "image",
        objectFit,
        borderRadius,
      });
      return;
    }

    // Find nearest clickable link or button
    let linkElem: HTMLElement | null = target;
    while (
      linkElem &&
      linkElem !== e.currentTarget &&
      linkElem.tagName !== "A" &&
      linkElem.tagName !== "BUTTON" &&
      !linkElem.getAttribute("href") &&
      !linkElem.getAttribute("data-href")
    ) {
      linkElem = linkElem.parentElement;
    }

    if (!linkElem || linkElem === e.currentTarget) {
      if (target.tagName === "A" || target.tagName === "BUTTON" || target.getAttribute("href")) {
        linkElem = target;
      } else {
        return;
      }
    }

    // Intercept right-click context menu on buttons/links
    e.preventDefault();
    e.stopPropagation();

    const currentHref = linkElem.getAttribute("href") || linkElem.getAttribute("data-href") || "#";
    const targetAttr = linkElem.getAttribute("target");
    const isNewTab = targetAttr === "_blank";

    const mouseX = Math.min(e.clientX, window.innerWidth - 340);
    const mouseY = Math.min(e.clientY, window.innerHeight - 300);

    setLinkPopup({
      x: Math.max(10, mouseX),
      y: Math.max(10, mouseY),
      sectionIndex,
      targetElement: linkElem,
      currentUrl: currentHref,
      isNewTab: isNewTab,
    });
  };

  const handleSaveLogo = (newText: string, newBgColor: string, newImageUrl: string) => {
    handleUpdateAndSaveImage({ logoText: newText, bgColor: newBgColor, imageUrl: newImageUrl });
    setImagePopup(null);
  };

  // Save updated URL & target attributes on button element
  const handleSaveButtonUrl = (newUrl: string, openNewTab: boolean) => {
    if (!linkPopup) return;

    const { sectionIndex, targetElement } = linkPopup;

    if (targetElement.tagName === "A" || targetElement.getAttribute("href") !== null) {
      targetElement.setAttribute("href", newUrl);
    } else {
      targetElement.setAttribute("data-href", newUrl);
      targetElement.setAttribute("onclick", `window.location.href='${newUrl}'`);
    }

    if (openNewTab) {
      targetElement.setAttribute("target", "_blank");
      targetElement.setAttribute("rel", "noopener noreferrer");
    } else {
      targetElement.removeAttribute("target");
      targetElement.removeAttribute("rel");
    }

    // Extract section wrapper element to save updated HTML
    const container = targetElement.closest('.section-wrapper-container') || targetElement.closest('.relative');
    if (container) {
      const clone = container.cloneNode(true) as HTMLElement;
      const badges = clone.querySelectorAll('.pointer-events-none');
      badges.forEach((b) => b.remove());

      const editables = clone.querySelectorAll('[contenteditable]');
      editables.forEach((el) => {
        el.removeAttribute('contenteditable');
        (el as HTMLElement).style.outline = '';
        (el as HTMLElement).style.outlineOffset = '';
        (el as HTMLElement).style.borderRadius = '';
      });

      const newCode = cleanCanvasWrapperFromCode(clone.innerHTML);
      if (newCode) {
        setSectionsWithHistory((prev) =>
          prev.map((sec, i) => (i === sectionIndex ? { ...sec, code: newCode } : sec))
        );
      }
    }

    setLinkPopup(null);
  };

  /**
   * The templates the Admin Studio holds for one category.
   *
   * The modal and the add handler both need this answer and have to agree about
   * it: the grid used its own, looser name-only test, so a category whose only
   * template was tagged by `category` rather than named for it showed as
   * unavailable while the handler found it — and, before that, a category the
   * grid *did* offer could still come up empty in the handler and get a
   * fabricated section instead. One function, one answer.
   *
   * Reads `adminDbTemplates`, which `loadAdminTemplates()` fills once on mount,
   * so this costs nothing to call per card while the modal renders.
   */
  const libraryTemplatesFor = (cat: { id: string; name: string }): any[] => {
    const catIdLower = cat.id.toLowerCase();
    const catNameLower = cat.name.toLowerCase();
    const normCat = normalizeCategory(cat.id);

    return adminDbTemplates.filter((tpl) => {
      if (!tpl || !(tpl.code || tpl.html || tpl.content)) return false;

      const nameLower = (tpl.name || tpl.title || "").toLowerCase();
      const rawCat = (tpl.category && tpl.category !== "undefined" && tpl.category !== "null") ? tpl.category : "";
      const tplCatLower = (rawCat || tpl.type || tpl.catId || tpl.sectionType || "").toLowerCase();
      const normTplCat = normalizeCategory(tplCatLower) || normalizeCategory(nameLower);

      if (normTplCat && (normTplCat === normCat || normTplCat === catIdLower)) return true;
      if (tplCatLower === catIdLower) return true;
      if (nameLower.includes(`[${catIdLower}]`) || nameLower.includes(catIdLower) || nameLower.includes(catNameLower) || (normCat && nameLower.includes(normCat))) return true;
      return false;
    });
  };

  /** Whether anything in the library — or the Super Admin's default website — covers this category. */
  const hasLibrarySection = (cat: { id: string; name: string }): boolean =>
    libraryTemplatesFor(cat).length > 0 ||
    Boolean(liveAdminTemplatesMap[cat.id] || liveAdminTemplatesMap[normalizeCategory(cat.id)]);

  // Add a section from predefined categories
  const handleAddSectionFromCategory = async (cat: { id: string; name: string }, overrideCode?: string, overrideTitle?: string) => {
    const normCat = normalizeCategory(cat.id);
    const matchingTemplates = libraryTemplatesFor(cat);

    let newCode = "";
    let newTitle = cat.name;

    // overrideCode/overrideTitle take priority — used when an Admin DB card passes its exact code
    if (overrideCode) {
      newCode = overrideCode;
      newTitle = overrideTitle || cat.name;
    } else if (matchingTemplates.length > 0) {
      const tpl = matchingTemplates[0]!;
      newCode = tpl.code || tpl.html || tpl.content;
      newTitle = tpl.name || cat.name;
    } else {
      // The Admin Studio's own library, then the platform default website the
      // Super Admin maintains. Both are real sections somebody authored.
      newCode = liveAdminTemplatesMap[cat.id] || liveAdminTemplatesMap[normCat] || "";
    }

    // Nothing in the library covers this category.
    //
    // This used to fall back to a built-in constant: a fabricated section for a
    // university that does not exist, complete with invented NIRF ranks,
    // placement percentages and student numbers. It went onto the page looking
    // exactly like a real one, so the only way to discover it was fiction was to
    // read it — and an institution that did not read it published it.
    //
    // The grid disables these categories, so this is a guard rather than a path
    // anyone should reach. It stays because the alternative to reaching it is
    // inserting a section with no content at all. There is no toast: popups are
    // switched off in this editor by request, and a message nobody sees is worse
    // than the disabled card that explains itself.
    if (!newCode) {
      console.warn(`No "${cat.name}" section in the Admin Studio library — nothing to add.`);
      closeAddSectionModal();
      return;
    }

    // ── Chosen for a specific slot ──────────────────────────────────────────
    // The user pressed an insertion point between two sections, so where it
    // goes is already decided and none of the placement rules below apply.
    // They exist to guess a sensible position when nobody said; overriding an
    // explicit choice with a guess is the one thing they must not do.
    if (pendingInsertIndex !== null) {
      const at = pendingInsertIndex;
      const newSection: SectionItem = {
        id: newSectionId(),
        title: newTitle,
        code: newCode,
        category: cat.id,
        variantIndex: 0,
      };

      setSectionsWithHistory((prev) => {
        const copy = [...prev];
        copy.splice(Math.max(0, Math.min(at, copy.length)), 0, newSection);
        return copy;
      });
      setActiveSectionIndex(Math.max(0, Math.min(at, sections.length)));
      closeAddSectionModal();
      void handlePersistWebsiteSave();
      return;
    }

    // 1. Header MUST ALWAYS be placed at index 0 (the very top of the page)
    if (cat.id === "navbar" || cat.id === "header" || normCat === "navbar") {
      const newHeaderSection: SectionItem = {
        id: `sec-header-${Date.now()}`,
        title: newTitle || "Header Navigation",
        code: newCode,
        category: "navbar",
        variantIndex: 0,
      };

      setSectionsWithHistory((prev) => {
        const filtered = prev.filter((s) => {
          const sCat = (s.category || s.title || "").toLowerCase();
          return !sCat.includes("header") && !sCat.includes("navbar") && normalizeCategory(sCat) !== "navbar";
        });
        return [newHeaderSection, ...filtered];
      });
      setActiveSectionIndex(0);
      showToastNotification(`Set Header Navigation at top of page`);
      closeAddSectionModal();
      void handlePersistWebsiteSave();
      return;
    }

    // 2. Hero MUST ALWAYS be placed at index 1 (directly below Header)
    if (cat.id === "hero" || normCat === "hero") {
      const newHeroSection: SectionItem = {
        id: `sec-hero-${Date.now()}`,
        title: newTitle || "Hero Banner",
        code: newCode,
        category: "hero",
        variantIndex: 0,
      };

      setSectionsWithHistory((prev) => {
        const filtered = prev.filter((s) => {
          const sCat = (s.category || s.title || "").toLowerCase();
          return !sCat.includes("hero") && !sCat.includes("banner") && normalizeCategory(sCat) !== "hero";
        });
        const headerSec = filtered.find((s) => {
          const sCat = (s.category || s.title || "").toLowerCase();
          return sCat.includes("header") || sCat.includes("navbar") || normalizeCategory(sCat) === "navbar";
        });
        const rest = filtered.filter((s) => s !== headerSec);
        return headerSec ? [headerSec, newHeroSection, ...rest] : [newHeroSection, ...rest];
      });
      setActiveSectionIndex(1);
      showToastNotification(`Set Hero Banner directly under Header`);
      closeAddSectionModal();
      void handlePersistWebsiteSave();
      return;
    }

    // 3. For any other section: Replace in-place if exists, otherwise insert before Footer or append in sequence
    const existingIndex = sections.findIndex((s) => {
      const sCat = (s.category || s.title || "").toLowerCase();
      const normSCat = normalizeCategory(sCat) || sCat;
      return sCat === cat.id.toLowerCase() || normSCat === normCat;
    });

    if (existingIndex >= 0) {
      setSectionsWithHistory((prev) =>
        prev.map((sec, idx) => {
          if (idx !== existingIndex) return sec;
          return {
            ...sec,
            title: newTitle,
            code: newCode,
            category: cat.id,
            variantIndex: 0,
          };
        })
      );
      setActiveSectionIndex(existingIndex);
      showToastNotification(`Updated ${newTitle} layout`);
    } else {
      const newSection: SectionItem = {
        id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: newTitle,
        code: newCode,
        category: cat.id,
        variantIndex: 0,
      };

      setSectionsWithHistory((prev) => {
        // Insert before footer if footer exists at the bottom
        const footerIdx = prev.findIndex((s) => {
          const sCat = (s.category || s.title || "").toLowerCase();
          return sCat.includes("footer") || normalizeCategory(sCat) === "footer";
        });
        if (footerIdx >= 0) {
          const copy = [...prev];
          copy.splice(footerIdx, 0, newSection);
          return copy;
        }
        return [...prev, newSection];
      });
      setActiveSectionIndex(sections.length);
      showToastNotification(`Added ${newTitle} to page`);
    }
    closeAddSectionModal();
    void handlePersistWebsiteSave();
  };

  // Swap / Cycle between section variants for the ACTIVE category ONLY
  const handleSwapVariant = async () => {
    if (sections.length === 0) return;
    const targetIndex = activeSectionIndex !== null ? activeSectionIndex : 0;
    const activeSec = sections[targetIndex];
    if (!activeSec) return;
    if (activeSectionIndex === null) {
      setActiveSectionIndex(0);
    }

    // Reuse already-loaded templates from state — avoids duplicate network requests on every swap.
    // Templates are fetched once on mount by loadAdminTemplates().
    const templatesList: any[] = adminDbTemplates.length > 0 ? adminDbTemplates : [];

    // 1. Accurately determine Category ID of the ACTIVE section
    const titleLower = (activeSec.title || "").toLowerCase();
    const codeLower = (activeSec.code || "").toLowerCase();
    const idLower = (activeSec.id || "").toLowerCase();
    const secCategoryLower = (activeSec.category || "").toLowerCase();

    let catId = secCategoryLower;

    if (!catId) {
      if (titleLower.includes("nav") || titleLower.includes("header") || idLower.includes("nav") || idLower.includes("header") || (codeLower.includes("<header") && !codeLower.includes("admissions"))) {
        catId = "navbar";
      } else if (titleLower.includes("hero") || titleLower.includes("banner") || idLower.includes("hero") || idLower.includes("banner")) {
        catId = "hero";
      } else if (titleLower.includes("admission") || idLower.includes("admission")) {
        catId = "admissions";
      } else if (titleLower.includes("highlight") || titleLower.includes("stat") || titleLower.includes("metric") || idLower.includes("highlight") || idLower.includes("stat")) {
        catId = "highlights";
      } else if (titleLower.includes("about") || idLower.includes("about")) {
        catId = "about";
      } else if (titleLower.includes("vision") || (titleLower.includes("mission") && !titleLower.includes("admission")) || idLower.includes("vision")) {
        catId = "vision";
      } else if (titleLower.includes("course") || titleLower.includes("program") || titleLower.includes("academic") || idLower.includes("course") || idLower.includes("program")) {
        catId = "courses";
      } else if (titleLower.includes("department") || idLower.includes("department")) {
        catId = "departments";
      } else if (titleLower.includes("placement") || titleLower.includes("recruiter") || titleLower.includes("career") || idLower.includes("placement")) {
        catId = "placements";
      } else if (titleLower.includes("facilit") || titleLower.includes("infrastruct") || idLower.includes("facilit")) {
        catId = "facilities";
      } else if (titleLower.includes("research") || titleLower.includes("patent") || titleLower.includes("r&d") || idLower.includes("research")) {
        catId = "research";
      } else if (titleLower.includes("news") || titleLower.includes("circular") || titleLower.includes("announcement") || idLower.includes("news")) {
        catId = "news";
      } else if (titleLower.includes("event") || titleLower.includes("calendar") || titleLower.includes("event")) {
        catId = "events";
      } else if (titleLower.includes("gallery") || titleLower.includes("campus life") || idLower.includes("gallery")) {
        catId = "gallery";
      } else if (titleLower.includes("testimonial") || titleLower.includes("alumni") || titleLower.includes("say") || idLower.includes("testimonial")) {
        catId = "testimonials";
      } else if (titleLower.includes("achievement") || titleLower.includes("award") || titleLower.includes("recognition") || idLower.includes("achievement") || idLower.includes("award")) {
        catId = "achievements";
      } else if (titleLower.includes("contact") || titleLower.includes("enquiry") || titleLower.includes("inquiry") || idLower.includes("contact")) {
        catId = "contact";
      } else if (titleLower.includes("map") || titleLower.includes("location") || idLower.includes("map")) {
        catId = "map";
      } else if (titleLower.includes("footer") || idLower.includes("footer") || codeLower.includes("<footer")) {
        catId = "footer";
      } else {
        const idParts = idLower.split("-");
        catId = idParts.length >= 2 ? idParts[1]! : "custom";
      }
    }

    const normCatId = normalizeCategory(catId);

    // Clean up repeating suffixes from current title
    const cleanBaseTitle = (activeSec.title || "")
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/(\s*Layout\s*\d+)+$/gi, "")
      .replace(/(\s*Variant\s*\d+)+$/gi, "")
      .replace(/(\s*Default)+$/gi, "")
      .trim() || catId.toUpperCase();

    // 2. Collect ALL admin DB variants and built-in variants for this category
    const adminDbMatches: { name: string; code: string }[] = [];
    templatesList.forEach((tpl) => {
      const nameLower = (tpl.name || tpl.title || "").toLowerCase();
      const rawCat = (tpl.category && tpl.category !== "undefined" && tpl.category !== "null") ? tpl.category : "";
      const tplCatLower = (rawCat || tpl.type || tpl.catId || tpl.sectionType || "").toLowerCase();
      const codeStr = (tpl.code || tpl.html || tpl.content || tpl.templateCode || "").trim();
      const normTplCat = normalizeCategory(tplCatLower) || normalizeCategory(nameLower);

      if (!codeStr) return;

      // STRICT SAFETY GUARD 1: Do NOT allow navbar/header code into non-navbar categories
      const isHeaderTpl = codeStr.toLowerCase().includes("<header") || nameLower.startsWith("header") || nameLower.includes("header navigation");
      if (normCatId !== "navbar" && isHeaderTpl) return;

      // STRICT SAFETY GUARD 2: Do NOT allow footer code into non-footer categories
      const isFooterTpl = codeStr.toLowerCase().includes("<footer") || nameLower.startsWith("footer");
      if (normCatId !== "footer" && isFooterTpl) return;

      let isMatch = false;

      if (normTplCat && normTplCat === normCatId) {
        isMatch = true;
      } else if (normCatId === "navbar" || catId === "navbar" || catId === "header") {
        isMatch = normTplCat === "navbar" || tplCatLower.includes("header") || tplCatLower.includes("nav") || nameLower.includes("header") || nameLower.includes("nav") || codeStr.toLowerCase().includes("<header");
      } else if (normCatId === "footer" || catId === "footer") {
        isMatch = normTplCat === "footer" || tplCatLower.includes("footer") || nameLower.includes("footer") || codeStr.toLowerCase().includes("<footer");
      } else if (catId === "admissions" || catId === "admission") {
        isMatch = normTplCat === "admissions" || tplCatLower === "admissions" || tplCatLower === "admission" || (nameLower.includes("admission") && !nameLower.includes("contact"));
      } else if (catId === "contact") {
        isMatch = normTplCat === "contact" || tplCatLower === "contact" || tplCatLower.includes("contact") || nameLower.includes("contact") || nameLower.includes("enquiry") || nameLower.includes("inquiry");
      } else if (catId === "vision") {
        isMatch = normTplCat === "vision" || (nameLower.includes("vision") || (nameLower.includes("mission") && !nameLower.includes("admission")));
      } else if (catId === "events" || catId === "event") {
        isMatch = normTplCat === "events" || tplCatLower === "events" || tplCatLower === "event" || tplCatLower.includes("event") || nameLower.includes("event");
      } else if (catId === "hero") {
        isMatch = (normTplCat === "hero" || tplCatLower.includes("hero") || nameLower.includes("hero") || nameLower.includes("banner")) && !nameLower.includes("header") && !nameLower.includes("nav");
      } else {
        isMatch = tplCatLower === catId || nameLower.includes(catId);
      }

      if (isMatch) {
        const trimmedCode = codeStr.trim();
        if (!adminDbMatches.some((m) => m.code.trim() === trimmedCode || cleanCanvasWrapperFromCode(m.code) === cleanCanvasWrapperFromCode(trimmedCode))) {
          adminDbMatches.push({
            name: (tpl.name || tpl.title || cleanBaseTitle).replace(/\s*\([^)]*\)/g, "").trim(),
            code: trimmedCode,
          });
        }
      }
    });

    // 3. Build the swap cycle list with a DETERMINISTIC, STABLE ORDER.
    //    We NEVER prepend the active section dynamically, because doing so mutates the array
    //    order on every click and causes alternating 2-item ping-pong behavior.
    const stableCycle: { name: string; code: string }[] = [];
    const seenCleanCodes = new Set<string>();

    // Step A: Add all Admin DB variants for this category in their natural registered order
    adminDbMatches.forEach((m) => {
      const clean = cleanCanvasWrapperFromCode(m.code);
      if (!seenCleanCodes.has(clean)) {
        seenCleanCodes.add(clean);
        stableCycle.push(m);
      }
    });

    // Step B: If the current active section code is not in the list (e.g. built-in default or customized),
    // append it to the cycle so the user can cycle back to it
    const currentActiveCode = (activeSec.code || "").trim();
    if (currentActiveCode) {
      const cleanCurrent = cleanCanvasWrapperFromCode(currentActiveCode);
      if (!seenCleanCodes.has(cleanCurrent)) {
        seenCleanCodes.add(cleanCurrent);
        stableCycle.unshift({
          name: activeSec.title || cleanBaseTitle,
          code: currentActiveCode,
        });
      }
    }

    // No variants at all
    if (stableCycle.length === 0) {
      showToastNotification("No section variants found — add sections in Admin › Templates");
      return;
    }

    // Only 1 item = current section with no admin variants added yet
    if (stableCycle.length <= 1) {
      showToastNotification("Only 1 variant — add more sections in Admin › Templates to enable swapping");
      return;
    }

    // 4. Find the current active section's index in the STABLE cycle
    const currentClean = cleanCanvasWrapperFromCode(currentActiveCode);
    const matchedIdx = stableCycle.findIndex(
      (t) =>
        t.code.trim() === currentActiveCode ||
        cleanCanvasWrapperFromCode(t.code) === currentClean
    );

    // 5. Advance cleanly in circular order (0 -> 1 -> 2 -> ... -> N-1 -> 0)
    let nextIdx: number;
    if (matchedIdx >= 0) {
      nextIdx = (matchedIdx + 1) % stableCycle.length;
    } else {
      nextIdx = 0;
    }

    const nextTpl = stableCycle[nextIdx]!;

    setSectionsWithHistory((prev) =>
      prev.map((sec, idx) => {
        if (idx !== targetIndex) return sec;
        return {
          ...sec,
          title: nextTpl.name || cleanBaseTitle,
          code: nextTpl.code,
          category: catId,
          variantIndex: nextIdx,
        };
      })
    );

    // Toast: "3 / 3 — Navbar Variant 3"
    showToastNotification(`${nextIdx + 1} / ${stableCycle.length}  —  ${nextTpl.name}`);
    void handlePersistWebsiteSave();
  };






  const handleDuplicateSection = () => {
    if (activeSectionIndex === null || sections.length === 0) return;
    const current = sections[activeSectionIndex];
    if (!current) return;
    const duplicated: SectionItem = {
      id: `sec-${Date.now()}`,
      title: `${current.title} (Copy)`,
      code: current.code,
      variantIndex: current.variantIndex,
    };
    setSectionsWithHistory((prev) => [
      ...prev.slice(0, activeSectionIndex + 1),
      duplicated,
      ...prev.slice(activeSectionIndex + 1),
    ]);
    setActiveSectionIndex(activeSectionIndex + 1);
  };

  const handleDeleteSection = () => {
    if (activeSectionIndex === null || sections.length === 0) return;
    setSectionsWithHistory((prev) => prev.filter((_, idx) => idx !== activeSectionIndex));
    setActiveSectionIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
  };

  const handleMoveUp = () => {
    if (sections.length <= 1) return;
    const targetIndex = activeSectionIndex !== null ? activeSectionIndex : 1;
    if (targetIndex <= 0) {
      showToastNotification("Header is fixed at top edge");
      return;
    }
    // Prevent moving section above top navbar (index 0) if index 0 is navbar
    const isNavbarAtTop = sections[0] && (normalizeCategory(sections[0].category || "") === "navbar" || (sections[0].title || "").toLowerCase().includes("header"));
    if (isNavbarAtTop && targetIndex <= 1) {
      showToastNotification("Header Navigation remains fixed at top");
      return;
    }

    setSectionsWithHistory((prev) => {
      const copy = [...prev];
      const temp = copy[targetIndex];
      copy[targetIndex] = copy[targetIndex - 1];
      copy[targetIndex - 1] = temp;
      return copy;
    });
    setActiveSectionIndex(targetIndex - 1);
    showToastNotification(`Moved section up to position ${targetIndex}`);
  };

  const handleMoveDown = () => {
    if (sections.length <= 1) return;
    const targetIndex = activeSectionIndex !== null ? activeSectionIndex : 0;
    if (targetIndex >= sections.length - 1) {
      showToastNotification("Section is already at bottom edge");
      return;
    }
    // Prevent moving above footer or footer moving down
    const lastIdx = sections.length - 1;
    const isFooterAtBottom = sections[lastIdx] && (normalizeCategory(sections[lastIdx].category || "") === "footer" || (sections[lastIdx].title || "").toLowerCase().includes("footer"));
    if (isFooterAtBottom && targetIndex >= lastIdx - 1) {
      showToastNotification("Footer remains fixed at bottom");
      return;
    }

    setSectionsWithHistory((prev) => {
      const copy = [...prev];
      const temp = copy[targetIndex];
      copy[targetIndex] = copy[targetIndex + 1];
      copy[targetIndex + 1] = temp;
      return copy;
    });
    setActiveSectionIndex(targetIndex + 1);
    showToastNotification(`Moved section down to position ${targetIndex + 2}`);
  };

  const handleEnableTextEditingForActiveSection = () => {
    const targetIndex = activeSectionIndex !== null ? activeSectionIndex : 0;
    if (sections.length === 0) return;

    setActiveSectionIndex(targetIndex);

    const sectionContainers = document.querySelectorAll(".section-wrapper-container");
    const container = sectionContainers[targetIndex] as HTMLElement;
    if (!container) return;

    const textElems = container.querySelectorAll("h1, h2, h3, h4, h5, h6, p, span, a, button:not(.hamburger-toggle-btn), li, strong, em, b, i, td, th");

    textElems.forEach((textElem) => {
      const elem = textElem as HTMLElement;
      if (elem.children.length > 2 && elem.tagName === "DIV") return;

      elem.contentEditable = "true";
      elem.style.userSelect = "text";
      (elem.style as any).webkitUserSelect = "text";
      elem.style.outline = "2px dashed #2563eb";
      elem.style.outlineOffset = "4px";
      elem.style.borderRadius = "4px";

      const saveUpdatedContent = () => {
        elem.contentEditable = "false";
        elem.style.outline = "";
        elem.style.outlineOffset = "";
        elem.style.borderRadius = "";

        const canvasBox = container.querySelector(".section-canvas-box") as HTMLElement;
        const targetNode = canvasBox || container;

        const clone = targetNode.cloneNode(true) as HTMLElement;

        const badges = clone.querySelectorAll('.pointer-events-none');
        badges.forEach((b) => b.remove());

        const editables = clone.querySelectorAll('[contenteditable]');
        editables.forEach((el) => {
          el.removeAttribute('contenteditable');
          (el as HTMLElement).style.outline = '';
          (el as HTMLElement).style.outlineOffset = '';
          (el as HTMLElement).style.borderRadius = '';
          (el as HTMLElement).style.backgroundColor = '';
        });

        const newCode = cleanCanvasWrapperFromCode(clone.innerHTML || clone.outerHTML);
        if (newCode) {
          setSectionsWithHistory((prev) =>
            prev.map((sec, i) => (i === targetIndex ? { ...sec, code: newCode } : sec))
          );
        }
      };

      elem.onblur = () => {
        saveUpdatedContent();
      };

      elem.onkeydown = (keyEvent) => {
        if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
          keyEvent.preventDefault();
          elem.blur();
        }
      };
    });

    if (textElems.length > 0) {
      const firstElem = textElems[0] as HTMLElement;
      try {
        firstElem.focus();
      } catch (e) {
        // ignore focus error
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans relative overflow-y-auto">
      


      {/* Main Studio Canvas Workspace */}
      <main
        onClick={() => setActiveSectionIndex(null)}
        className={`flex-1 w-full flex flex-col items-center justify-start pb-64 cursor-pointer min-h-screen transition-all ${
          viewportWidth === "100%" ? "bg-white p-0 m-0" : "bg-slate-100/90 px-4 sm:px-8 pt-0 pb-12 mt-0"
        }`}
      >
        {/* Device-frame chrome on its own element: its border would otherwise come
            out of the canvas's content box, so a "375px" preview would measure
            373px to the container queries the sections are written against. */}
        {/* Chrome shrink-wraps the canvas; the width goes on the canvas itself, or
            its own border would come out of the content box the sections are
            measured against. */}
        <div
          className={`transition-all duration-300 mx-auto max-w-full ${
            viewportWidth === "100%"
              ? "w-full rounded-none border-none shadow-none m-0 p-0"
              : "w-fit shadow-2xl rounded-2xl border border-slate-300 mt-0 mb-4"
          }`}
        >
        <div
          /**
           * The canvas hugs its sections; it does not reserve a screenful.
           *
           * `min-h-screen` is right on the published site — a short page should
           * still fill the viewport with the site's own background rather than
           * ending in a band of nothing. In the editor it produced the opposite
           * impression: a tenant whose only section is a 102px header got that
           * header and then a full screen of flat black, which reads as a page
           * that failed to load rather than a site with one section in it.
           *
           * Sizing to content puts the editor's own surface directly under the
           * last section, so what is dark on screen is a section, and what is
           * not a section does not pretend to be one.
           */
          className={`xite-site-canvas block max-w-full ${
            viewportWidth === "100%" ? "w-full m-0 p-0" : "min-h-[40vh]"
          }`}
          style={{ width: viewportWidth, maxWidth: "100%" }}
        >
          {sections.length === 0 ? (
            /* Empty Canvas State
               Wrapped in its own centring box rather than relying on the canvas
               to centre it. The canvas used to be a flex column with
               `items-center`; it is a plain block now, because it stands in for
               `<body>` and has to lay sections out the way a document does. This
               card is editor chrome, not content, so it does its own centring
               instead of dictating how sections are laid out. */
            <div className="w-full min-h-[60vh] flex items-center justify-center p-6">
            <div className="text-center space-y-4 max-w-md w-full p-8 bg-slate-50 border border-slate-200 rounded-2xl shadow-lg">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-700">
                <Layout className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Empty Page Canvas</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                No sections have been added for page {currentPage.name}. Click below to add sections to this page.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <AddSectionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    void seedPageFromAdminDefaults();
                  }}
                  label="Add Section"
                />
              </div>
            </div>
            </div>
          ) : (
            /* Pure Section Rendering for Current Page */
            <div className="w-full">
              {sections.map((sec, idx) => {
                const isHeader = idx === 0 || sec.category === "navbar" || sec.category === "header" || (sec.title || "").toLowerCase().includes("header") || (sec.title || "").toLowerCase().includes("navbar");
                return (
                  <React.Fragment key={sec.id}>
                  <SectionInsertPoint index={idx} onInsert={openAddSectionModalAt} />
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSectionIndex(idx);

                      const target = e.target as HTMLElement;
                      if (!target) return;

                      // Skip images, svgs, or hamburger toggles for inline text edit
                      if (
                        target.tagName === "IMG" ||
                        target.tagName === "SVG" ||
                        target.closest("button.hamburger-toggle-btn") ||
                        target.getAttribute("data-logo") === "true"
                      ) {
                        return;
                      }

                      // Find editable text element (e.g. h1-h6, p, span, a, button, li, strong, em, b, i, td, th)
                      const editableTarget =
                        (target.closest("h1, h2, h3, h4, h5, h6, p, span, a, button, li, strong, em, b, i, td, th, label") as HTMLElement) ||
                        (target.childNodes.length === 1 && target.childNodes[0]?.nodeType === Node.TEXT_NODE ? target : null);

                      if (editableTarget && !editableTarget.isContentEditable) {
                        editableTarget.contentEditable = "true";
                        editableTarget.style.userSelect = "text";
                        (editableTarget.style as any).webkitUserSelect = "text";
                        editableTarget.style.outline = "2px solid #38bdf8";
                        editableTarget.style.outlineOffset = "3px";
                        editableTarget.style.borderRadius = "4px";
                        editableTarget.style.cursor = "text";

                        try {
                          editableTarget.focus();
                        } catch {}

                        /**
                         * Commit while typing, not on the way out.
                         *
                         * Blur fires on the mousedown that begins the *next*
                         * click. Committing there re-rendered the canvas in the
                         * middle of that gesture — `dangerouslySetInnerHTML`
                         * replaced the subtree, mouseup landed on a node that was
                         * not the mousedown target, and the browser therefore
                         * never dispatched the click. Clicking into a heading and
                         * then clicking another section silently did nothing; it
                         * took a second click to select anything.
                         *
                         * Debounced `input` also fixes a quieter problem. The
                         * capture serialises the DOM, and the browser's
                         * serialiser normalises attribute order, quoting and
                         * whitespace — so the "new" code differed from the
                         * authored HTML even when nothing was typed. Every click
                         * into text rewrote the section, pushed an undo entry and
                         * triggered an autosave for an edit nobody made. No typing
                         * now means no `input`, which means no write.
                         */
                        const commit = () => {
                          const wrapper = editableTarget.closest(".section-wrapper-container") as HTMLElement;
                          const canvasBox = (wrapper?.querySelector(".section-canvas-box") || wrapper) as HTMLElement;
                          if (!canvasBox) return;

                          const clone = canvasBox.cloneNode(true) as HTMLElement;
                          clone.querySelectorAll("[contenteditable]").forEach((el) => {
                            el.removeAttribute("contenteditable");
                            (el as HTMLElement).style.outline = "";
                            (el as HTMLElement).style.outlineOffset = "";
                            (el as HTMLElement).style.borderRadius = "";
                            (el as HTMLElement).style.cursor = "";
                            (el as HTMLElement).style.userSelect = "";
                          });

                          const newCode = cleanCanvasWrapperFromCode(clone.innerHTML || clone.outerHTML);
                          setSectionsWithHistory((prev) => {
                            if (!newCode || prev[idx]?.code === newCode) return prev;
                            return prev.map((s, i) => (i === idx ? { ...s, code: newCode } : s));
                          });
                        };

                        let commitTimer: ReturnType<typeof setTimeout> | null = null;
                        const handleInput = () => {
                          if (commitTimer) clearTimeout(commitTimer);
                          commitTimer = setTimeout(commit, 400);
                        };

                        const handleBlur = () => {
                          editableTarget.contentEditable = "false";
                          editableTarget.style.outline = "";
                          editableTarget.style.outlineOffset = "";
                          editableTarget.style.borderRadius = "";
                          editableTarget.style.cursor = "";
                          editableTarget.style.userSelect = "";
                          editableTarget.removeEventListener("blur", handleBlur);
                          editableTarget.removeEventListener("keydown", handleKey);
                          editableTarget.removeEventListener("input", handleInput);

                          // A pending keystroke must not be lost, but it must also
                          // not land inside this click. The frame after mouseup is
                          // late enough for the click to have been dispatched.
                          if (commitTimer) {
                            clearTimeout(commitTimer);
                            commitTimer = null;
                            requestAnimationFrame(() => requestAnimationFrame(commit));
                          }
                        };

                        const handleKey = (keyEvent: KeyboardEvent) => {
                          if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
                            const tag = editableTarget.tagName.toLowerCase();
                            if (["h1", "h2", "h3", "h4", "h5", "h6", "a", "button", "span"].includes(tag)) {
                              keyEvent.preventDefault();
                              editableTarget.blur();
                            }
                          }
                        };

                        editableTarget.addEventListener("blur", handleBlur);
                        editableTarget.addEventListener("keydown", handleKey);
                        editableTarget.addEventListener("input", handleInput);
                      }
                    }}
                    onContextMenu={(e: any) => handleSectionContextMenu(e, idx)}
                    data-xite-section={sec.id}
                    style={{
                      // Only the header is lifted, and only because a sticky one
                      // has to stay above what follows it. Everything else keeps
                      // natural document order.
                      //
                      // This used to descend — `20 - idx` — which put every
                      // section *above* the one after it, the exact reverse of how
                      // HTML stacks. Any section whose content leaves its box (an
                      // overlapping card, a wave divider, a decoration hanging off
                      // the bottom) then covered the top of its neighbour and took
                      // the clicks meant for it: clicking one section selected the
                      // previous one. Reproduced with a 70px overhang — the click
                      // landed on `#overhang` and selected the hero instead of the
                      // section actually under the cursor.
                      ...(isHeader ? { zIndex: 40 } : null),
                      position: "relative",
                    }}
                    // No clipping: `overflow: hidden` cut off every shadow, dropdown
                    // and sticky element a section had, none of which the Admin's
                    // iframe clips.
                    className={`w-full relative transition-all group section-wrapper-container ${
                      activeSectionIndex === idx ? "ring-2 ring-cyan-500/80 ring-offset-2 ring-offset-slate-900" : "cursor-default"
                    }`}
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: cleanFullWebCodeForCanvas(sec.code, viewportWidth) }}
                      className="w-full block p-0 m-0 text-left"
                    />
                  </div>
                  </React.Fragment>
                );
              })}

              {/* The slot under the last section. */}
              <SectionInsertPoint index={sections.length} onInsert={openAddSectionModalAt} />

            </div>
          )}
        </div>

        {/* Clearance for the floating dock. Outside the canvas: it is editor
            chrome, and inside it the canvas painted 192px of its own background
            below the last section — which on a site with one short header read
            as a broken page rather than as space. */}
        <div className="w-full h-48 shrink-0 pointer-events-none" />
        </div>
      </main>

      {/* Select Section Category Modal */}
      {showAddSectionModal && (
        <div
          onClick={closeAddSectionModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-zinc-950/95 rounded-3xl p-6 sm:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col max-h-[85vh] overflow-hidden border border-zinc-800 text-white cursor-default relative animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 shrink-0">
              <div>
                <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>What section do you want to add?</span>
                </h3>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">
                  Select a category or specific Admin section variant to append to your page layout.
                </p>
              </div>
              <button
                onClick={closeAddSectionModal}
                className="w-9 h-9 flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all font-black text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Modal Content Body */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 pt-2 pb-2 custom-scrollbar">


              {/* Admin DB Section Variants List */}
              {adminDbTemplates.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
                    <h4 className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">
                      Admin DB Section Variants ({adminDbTemplates.length})
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-zinc-500">Live Backend Database</span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {adminDbTemplates.map((tpl) => (
                      <div
                        key={tpl.id || tpl.name}
                        onClick={(e) => {
                          e.stopPropagation();

                          const rawCat = (tpl.category && tpl.category !== "undefined" && tpl.category !== "null")
                            ? tpl.category
                            : "";

                          // Admin DB templates ALWAYS add as a NEW separate section —
                          // they never replace an existing section. This is intentional:
                          // Built-in category grid = swap/replace existing section of same type
                          // Admin DB template = add a new design variant (different section)
                          const newSection: SectionItem = {
                            id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                            title: tpl.name,
                            code: tpl.code,
                            category: rawCat || normalizeCategory((tpl.name || "").toLowerCase()) || "hero",
                            variantIndex: 0,
                          };

                          const slot = pendingInsertIndex;

                          setSectionsWithHistory((prev) => {
                            // An insertion point was pressed: that index is the
                            // answer, and the guesses below do not get a vote.
                            if (slot !== null) {
                              const copy = [...prev];
                              copy.splice(Math.max(0, Math.min(slot, copy.length)), 0, newSection);
                              return copy;
                            }

                            const normNewCat = normalizeCategory(newSection.category || "");

                            // Header/navbar → insert at position 0 (very top)
                            if (normNewCat === "navbar" || normNewCat === "header") {
                              return [newSection, ...prev];
                            }

                            // Footer → insert just before existing footer (or at end)
                            const footerIdx = prev.findIndex((s) => {
                              const sCat = normalizeCategory(s.category || s.title || "");
                              return sCat === "footer";
                            });
                            if (footerIdx >= 0) {
                              const copy = [...prev];
                              copy.splice(footerIdx, 0, newSection);
                              return copy;
                            }

                            // Everything else → append at end
                            return [...prev, newSection];
                          });

                          // Select the newly added section
                          setActiveSectionIndex(
                            slot !== null
                              ? Math.max(0, Math.min(slot, sections.length))
                              : normalizeCategory(newSection.category || "") === "navbar" ||
                                normalizeCategory(newSection.category || "") === "header"
                                ? 0
                                : sections.length
                          );
                          closeAddSectionModal();
                          void handlePersistWebsiteSave();
                        }}
                        className="group flex items-center justify-between p-3.5 rounded-2xl bg-black/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-500 transition-all duration-200 cursor-pointer shadow-sm select-none"
                      >
                        <div className="truncate pr-3">
                          <h5 className="text-xs font-black text-white group-hover:text-white truncate tracking-tight">{tpl.name}</h5>
                          <p className="text-[10px] text-zinc-400 font-mono font-bold mt-0.5">Live DB Template</p>
                        </div>
                        <span className="text-[10px] font-black bg-white text-black px-3.5 py-1.5 rounded-full shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          + Add
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section Category Grid — every card resolves to a section the
                  Admin Studio actually holds. A category the library does not
                  cover is shown, but disabled: hiding it would leave no trace of
                  what the platform supports, and enabling it used to insert a
                  fabricated section for a college that does not exist. */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
                  <h4 className="text-[10px] font-black text-zinc-400 tracking-wider uppercase">
                    Section Categories ({SECTION_CATEGORIES.length})
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-zinc-500">From Admin Studio</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {SECTION_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const available = hasLibrarySection(cat);

                    return (
                      <div
                        key={cat.id}
                        onClick={available ? () => handleAddSectionFromCategory(cat) : undefined}
                        aria-disabled={!available}
                        title={
                          available
                            ? `Add a ${cat.name} section`
                            : `No ${cat.name} section in the Admin Studio library yet`
                        }
                        className={`group relative flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 select-none overflow-hidden shadow-sm ${
                          available
                            ? "bg-black/90 hover:bg-zinc-900 border-zinc-800/80 hover:border-zinc-500 cursor-pointer hover:shadow-md"
                            : "bg-black/40 border-zinc-900 cursor-not-allowed opacity-45"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl border transition-all flex items-center justify-center shrink-0 shadow-sm ${
                            available
                              ? "bg-zinc-900 group-hover:bg-white text-white group-hover:text-black border-zinc-800 group-hover:border-white"
                              : "bg-zinc-950 text-zinc-600 border-zinc-900"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 pr-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-xs font-black truncate tracking-tight ${available ? "text-white" : "text-zinc-500"}`}>
                              {cat.name}
                            </h4>
                            <span
                              className={`text-[9px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
                                available
                                  ? "text-zinc-300 bg-zinc-800/90 border-zinc-700"
                                  : "text-zinc-600 bg-transparent border-zinc-800"
                              }`}
                            >
                              {available ? "In library" : "Not in library"}
                            </span>
                          </div>
                          <p className={`text-[11px] mt-0.5 font-medium truncate leading-normal ${available ? "text-zinc-400 group-hover:text-zinc-300" : "text-zinc-600"}`}>
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side Drawer Panel */}
      <DrawerPanel
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onPageSelect={handlePageChange}
        onPageCreate={(_name, slug) => {
          // Remembered before the page is switched to, so `fetchDbSections`
          // sees the flag on the very first load and leaves the canvas empty.
          freshPageSlugsRef.current.add(slug);
        }}
        onPaletteSelect={handlePaletteSelect}
        onFontSelect={handleFontSelect}
        onSectionAdd={(sec) => {
          const newSection: SectionItem = {
            id: sec.id || `ai-${Date.now()}`,
            title: sec.title || "AI Generated Section",
            code: sec.code,
            variantIndex: 0,
          };
          setSections((prev) => [...prev, newSection]);
        }}
        subdomain={subdomain}
      />

      {/* Domain Settings Modal */}
      <DomainSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        subdomain={subdomain}
        initialTab={settingsTab}
      />

      {/* Floating Bottom Toolbar Dock - Hidden when Settings Studio is open */}
      {!isSettingsOpen && (
        <EditorToolbar
          subdomain={subdomain}
          onOpenSettings={() => setIsSettingsOpen(!isSettingsOpen)}
          isSettingsOpen={isSettingsOpen}
          onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
          viewportWidth={viewportWidth}
          setViewportWidth={setViewportWidth}
          /* Empty when nothing is selected, so the toolbar can say so. This
             passed the literal string "Hero" instead: clicking blank canvas
             deselects — correctly — and the toolbar then named a section that
             was neither selected nor, on most sites, even present. */
          activeSectionTitle={
            activeSectionIndex !== null ? sections[activeSectionIndex]?.title ?? "" : ""
          }
          hasSections={sections.length > 0}
          isSectionSelected={activeSectionIndex !== null}
          onAddSection={() => setShowAddSectionModal(true)}
          onDuplicateSection={handleDuplicateSection}
          onSwapVariant={handleSwapVariant}
          onEditText={handleEnableTextEditingForActiveSection}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyStack.length > 0}
          canRedo={redoStack.length > 0}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onDeleteSection={handleDeleteSection}
          onSyncAdminWebsite={handlePersistWebsiteSave}
        />
      )}

      {/* Floating Right-Click Button URL Navigation Popup */}
      {linkPopup && (
        <div
          onClick={() => setLinkPopup(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            boxSizing: "border-box",
          }}
          className="select-none cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "440px",
              maxWidth: "92vw",
              backgroundColor: "#000000",
              border: "1px solid #27272a",
              borderRadius: "24px",
              padding: "24px 28px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.95)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              boxSizing: "border-box",
            }}
            className="text-white text-xs cursor-default"
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #27272a",
                paddingBottom: "14px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                  }}
                />
                <span style={{ fontSize: "16px", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.01em" }}>
                  Button Navigation URL
                </span>
              </div>
              <button
                onClick={() => setLinkPopup(null)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#a1a1aa",
                  fontSize: "14px",
                  fontWeight: 900,
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "8px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Form Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", fontFamily: "monospace", fontWeight: 800, color: "#e4e4e7" }}>
                  Target URL / Link Path
                </label>
                <input
                  type="text"
                  value={linkPopup.currentUrl}
                  onChange={(e) => setLinkPopup({ ...linkPopup, currentUrl: e.target.value })}
                  placeholder="e.g. https://greenfield.edu.in/apply or #contact"
                  style={{
                    width: "100%",
                    height: "46px",
                    backgroundColor: "#09090b",
                    border: "1px solid #3f3f46",
                    borderRadius: "14px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                    fontSize: "13px",
                    color: "#ffffff",
                    fontFamily: "monospace",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Quick Page Preset Links */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 900, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  QUICK PAGE PRESETS
                </label>
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "8px" }}>
                  {["/home", "/about", "/academics", "/contact", "/placements"].map((slug) => (
                    <button
                      key={slug}
                      onClick={() => setLinkPopup({ ...linkPopup, currentUrl: slug })}
                      style={{
                        fontSize: "12px",
                        fontFamily: "monospace",
                        fontWeight: 800,
                        padding: "6px 14px",
                        borderRadius: "10px",
                        backgroundColor: linkPopup.currentUrl === slug ? "#ffffff" : "#18181b",
                        color: linkPopup.currentUrl === slug ? "#000000" : "#a1a1aa",
                        border: linkPopup.currentUrl === slug ? "1px solid #ffffff" : "1px solid #27272a",
                        cursor: "pointer",
                      }}
                    >
                      {slug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Open in New Tab Toggle */}
              <label style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", cursor: "pointer", paddingTop: "4px" }}>
                <input
                  type="checkbox"
                  checked={linkPopup.isNewTab}
                  onChange={(e) => setLinkPopup({ ...linkPopup, isNewTab: e.target.checked })}
                  style={{ width: "16px", height: "16px", accentColor: "#ffffff", cursor: "pointer" }}
                />
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#e4e4e7" }}>
                  Open in New Tab (<code style={{ color: "#ffffff", fontFamily: "monospace" }}>target="_blank"</code>)
                </span>
              </label>

              {/* Action Buttons */}
              <div
                style={{
                  paddingTop: "16px",
                  borderTop: "1px solid #27272a",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: "12px",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                <button
                  onClick={() => setLinkPopup(null)}
                  style={{
                    height: "42px",
                    paddingLeft: "18px",
                    paddingRight: "18px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "#a1a1aa",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveButtonUrl(linkPopup.currentUrl, linkPopup.isNewTab)}
                  style={{
                    height: "42px",
                    paddingLeft: "22px",
                    paddingRight: "22px",
                    borderRadius: "12px",
                    border: "none",
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    fontSize: "13px",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    boxShadow: "0 8px 16px -4px rgba(37,99,235,0.4)",
                  }}
                >
                  <span>🔗 Save Button URL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎨 Streamlined Auto Right-Click Context-Aware Customizer Modal (Sleek Black & White Theme) */}
      {imagePopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setImagePopup(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#000000",
              border: "1px solid #27272a",
              borderRadius: "24px",
              padding: "24px 28px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.95)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              color: "#ffffff",
              fontFamily: "system-ui, -apple-system, sans-serif",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
            className="cursor-default text-xs"
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", borderBottom: "1px solid #27272a", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                  }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 900, margin: 0, color: "#ffffff", letterSpacing: "-0.01em" }}>
                      {imagePopup.targetType === "logo" ? "Edit Logo & Branding" : imagePopup.targetType === "background" ? "Edit Section Background" : "Edit Image"}
                    </h3>
                    <span style={{ fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "9999px", backgroundColor: "#18181b", color: "#a1a1aa", border: "1px solid #27272a", textTransform: "uppercase" }}>
                      AUTO-{imagePopup.targetType}
                    </span>
                  </div>
                  <p style={{ fontSize: "11px", color: "#71717a", margin: "2px 0 0 0" }}>
                    Changes apply immediately & auto-save automatically ⚡
                  </p>
                </div>
              </div>
              <button
                onClick={() => setImagePopup(null)}
                style={{ backgroundColor: "transparent", border: "none", color: "#a1a1aa", fontSize: "14px", fontWeight: 900, cursor: "pointer", padding: "4px 8px", borderRadius: "8px" }}
              >
                ✕
              </button>
            </div>

            {/* Target Navigation Bar ("NAV TO THE LOGOS") - ONLY Shown for Logo Target */}
            {imagePopup.targetType === "logo" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#09090b", padding: "10px 14px", borderRadius: "14px", border: "1px solid #27272a" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#a1a1aa", display: "flex", alignItems: "center", gap: "6px" }}>
                  🎯 Target Navigation:
                </span>
                <button
                  onClick={handleJumpToNavbarLogo}
                  style={{ backgroundColor: "#18181b", color: "#ffffff", border: "1px solid #3f3f46", borderRadius: "10px", padding: "6px 14px", fontSize: "11px", fontWeight: 900, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  🚀 Nav to Navbar Logo
                </button>
              </div>
            )}

            {/* Streamlined Direct Inputs Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* 1. File Upload from Device */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  {imagePopup.targetType === "logo" ? "Upload Logo Image File" : imagePopup.targetType === "background" ? "Upload Background Image File" : "Upload Image File from Device"}
                </label>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", height: "44px", backgroundColor: "#09090b", border: "1px dashed #3f3f46", borderRadius: "12px", color: "#ffffff", fontSize: "13px", fontWeight: 800, cursor: "pointer", transition: "all 0.15s ease" }}>
                  <span>📁 Select Image File from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (typeof ev.target?.result === "string") {
                            handleUpdateAndSaveImage({ imageUrl: ev.target.result });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* 2. Custom Image / Background / Logo URL Input */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  {imagePopup.targetType === "logo" ? "Logo Image URL" : imagePopup.targetType === "background" ? "Background Image URL" : "Image URL"}
                </label>
                <input
                  type="text"
                  value={imagePopup.imageUrl}
                  onChange={(e) => handleUpdateAndSaveImage({ imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/your-image.jpg"
                  style={{ width: "100%", height: "42px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px", padding: "0 14px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* 3. Logo Specific Destination Link & Sync Toggle */}
              {imagePopup.targetType === "logo" && (
                <>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                      Logo Navigation Destination (URL / Link)
                    </label>
                    <input
                      type="text"
                      value={imagePopup.linkUrl}
                      onChange={(e) => handleUpdateAndSaveImage({ linkUrl: e.target.value })}
                      placeholder="/home or https://yourcollege.edu.in"
                      style={{ width: "100%", height: "42px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px", padding: "0 14px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <label style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#09090b", padding: "10px 14px", borderRadius: "12px", border: "1px solid #27272a", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={imagePopup.applyAllLogos}
                      onChange={(e) => handleUpdateAndSaveImage({ applyAllLogos: e.target.checked })}
                      style={{ width: "16px", height: "16px", accentColor: "#ffffff", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>
                      ⚡ Apply logo change to ALL header navbars across site
                    </span>
                  </label>
                </>
              )}

              {/* 4. Section Background Specific Sync Toggle */}
              {imagePopup.targetType === "background" && (
                <label style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "#09090b", padding: "10px 14px", borderRadius: "12px", border: "1px solid #27272a", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={imagePopup.applyAllBackgrounds}
                    onChange={(e) => handleUpdateAndSaveImage({ applyAllBackgrounds: e.target.checked })}
                    style={{ width: "16px", height: "16px", accentColor: "#ffffff", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#ffffff" }}>
                    Apply background image to ALL sections on this page
                  </span>
                </label>
              )}

            </div>

            {/* Footer Action Buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", paddingTop: "14px", borderTop: "1px solid #27272a" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#22c55e", display: "flex", alignItems: "center", gap: "6px" }}>
                ✓ Auto-Saved & Live Updated ⚡
              </span>
              <button
                onClick={() => setImagePopup(null)}
                style={{ height: "40px", padding: "0 22px", borderRadius: "12px", backgroundColor: "#ffffff", color: "#000000", fontWeight: 900, border: "none", cursor: "pointer", fontSize: "13px", boxShadow: "0 4px 12px rgba(255,255,255,0.15)" }}
              >
                Close Modal ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📍 Sleek Black & White Map Location & Navigation Customizer Modal */}
      {mapPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setMapPopup(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: "#000000",
              border: "1px solid #27272a",
              borderRadius: "24px",
              padding: "24px 28px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.95)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              color: "#ffffff",
              fontFamily: "system-ui, -apple-system, sans-serif",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
            className="cursor-default text-xs"
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", borderBottom: "1px solid #27272a", paddingBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                  }}
                />
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 900, margin: 0, color: "#ffffff", letterSpacing: "-0.01em" }}>
                    Edit Campus Map & Location
                  </h3>
                  <p style={{ fontSize: "11px", color: "#71717a", margin: "2px 0 0 0" }}>
                    Changes apply immediately & auto-save automatically ⚡
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMapPopup(null)}
                style={{ backgroundColor: "transparent", border: "none", color: "#a1a1aa", fontSize: "14px", fontWeight: 900, cursor: "pointer", padding: "4px 8px", borderRadius: "8px" }}
              >
                ✕
              </button>
            </div>

            {/* Quick Location Presets */}
            <div>
              <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                Quick Location Presets
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {[
                  { name: "VIT Vellore Main Campus", query: "Vellore Institute of Technology" },
                  { name: "Chennai Campus", query: "Vellore Institute of Technology Chennai" },
                  { name: "Anna University", query: "Anna University Guindy Chennai" },
                  { name: "IIT Madras", query: "IIT Madras Chennai" },
                  { name: "SRM Kattankulathur", query: "SRM Institute of Science and Technology" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      const cleanEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(preset.query)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
                      const cleanDirections = `https://maps.google.com/?q=${encodeURIComponent(preset.query)}`;
                      handleUpdateAndSaveMap({
                        mapEmbedUrl: cleanEmbed,
                        directionsUrl: cleanDirections,
                        locationName: preset.name.toUpperCase(),
                      });
                    }}
                    style={{
                      backgroundColor: "#09090b",
                      border: "1px solid #27272a",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      color: "#e4e4e7",
                      fontSize: "11px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    📍 {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Input Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* 1. Google Maps Embed URL */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Google Maps Embed URL / iFrame Source
                </label>
                <input
                  type="text"
                  value={mapPopup.mapEmbedUrl}
                  onChange={(e) => handleUpdateAndSaveMap({ mapEmbedUrl: e.target.value })}
                  placeholder="https://maps.google.com/maps?q=YourCollege&output=embed"
                  style={{ width: "100%", height: "42px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px", padding: "0 14px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* 2. Directions Button Link URL */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Get Directions Button Link (URL)
                </label>
                <input
                  type="text"
                  value={mapPopup.directionsUrl}
                  onChange={(e) => handleUpdateAndSaveMap({ directionsUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=YourCollege"
                  style={{ width: "100%", height: "42px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px", padding: "0 14px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* 3. Campus Title Name */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: 800, color: "#a1a1aa", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Campus Location Name
                </label>
                <input
                  type="text"
                  value={mapPopup.locationName}
                  onChange={(e) => handleUpdateAndSaveMap({ locationName: e.target.value })}
                  placeholder="VELLORE INSTITUTE OF TECHNOLOGY"
                  style={{ width: "100%", height: "42px", backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "12px", padding: "0 14px", color: "#ffffff", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", paddingTop: "14px", borderTop: "1px solid #27272a" }}>
              <span style={{ fontSize: "12px", fontWeight: 800, color: "#22c55e", display: "flex", alignItems: "center", gap: "6px" }}>
                ✓ Auto-Saved & Live Updated ⚡
              </span>
              <button
                onClick={() => setMapPopup(null)}
                style={{ height: "40px", padding: "0 22px", borderRadius: "12px", backgroundColor: "#ffffff", color: "#000000", fontWeight: 900, border: "none", cursor: "pointer", fontSize: "13px", boxShadow: "0 4px 12px rgba(255,255,255,0.15)" }}
              >
                Close Modal ✕
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
