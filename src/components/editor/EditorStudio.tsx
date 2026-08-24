"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { AddSectionButton } from "@/components/ui/AddSectionButton";
import {
  Plus,
  Layout,
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
import { recomposeSectionCode, sectionCanvasHtml } from "@/lib/section-runtime";
import { canonicalSlug, useEditorPages } from "@/hooks/useEditorPages";
import type { SectionCategoryId } from "@/lib/sections/categories";
import {
  fetchDefaultWebsite,
  fetchSectionLibrary,
  fetchTheme,
  saveTheme,
  type EditorPage,
  type EditorSection,
  type LibrarySection,
  type SectionLibrary,
} from "@/lib/editor-api";
import {
  moveSection,
  placementIndex,
  sectionFromTemplate,
  swapVariant,
  variantsFor,
} from "@/lib/section-variants";
import {
  DEFAULT_FONT_ID,
  DEFAULT_THEME_ID,
  detokenizeSectionHtml,
  themeFontsHref,
  themeStylesheet,
  tokenizeSectionHtml,
  type EditorFontId,
  type EditorThemeId,
} from "@/lib/editor-themes";
import { DrawerPanel } from "./DrawerPanel";
import { DomainSettingsModal } from "./DomainSettingsModal";
import { UserProfileMenu } from "./UserProfileMenu";

/** The canvas element that stands in for `<body>` — the same scope the published site uses. */
const EDITOR_CANVAS_SCOPE = ".xite-site-canvas";

/**
 * A section, as the editor holds it.
 *
 * Aliased to the shape the API layer defines rather than declared again here.
 * The two used to differ — the local one had an optional `category` and no
 * `templateId` — so every value crossing the boundary was cast, and a section
 * could reach the canvas with no category at all. Its category is the only
 * thing that decides which variants it can swap between, so "optional" meant
 * "sometimes unswappable for reasons nothing reports".
 */
type SectionItem = EditorSection;

/**
 * The nineteen categories, with the icon and copy the picker shows.
 *
 * The ids are `SECTION_CATEGORY_IDS` from the shared module — the same strings
 * the server files templates under — and the `satisfies` below fails the build
 * if this list and that one ever disagree. They did: this file spelled the top
 * bar `navbar` in some places and `header` in others, and a card whose id was
 * `header` matched no template because the resolver only ever emits `navbar`.
 */
const SECTION_CATEGORIES: ReadonlyArray<{
  id: SectionCategoryId;
  name: string;
  description: string;
  icon: typeof Compass;
}> = [
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
  /**
   * Every page's sections, keyed by page, with its own load and save lifecycle.
   *
   * This replaces five overlapping stores — `sections`, `pageStore`,
   * `myWebsiteConfig` and two localStorage keys — and the four effects that
   * wrote between them without ever naming the page they were writing for. See
   * `useEditorPages` for what that combination did to a site with more than one
   * page; the short version is that opening About and then editing Home wrote
   * Home's sections into About.
   *
   * localStorage is gone from the section path entirely. It was read *before*
   * the database on the offline fallback, which is how a stale copy of a page
   * could outlive a save and then be re-persisted over it. The database is the
   * only store; a failed load leaves a page untouched rather than replacing it
   * with whatever the browser last cached.
   */
  const editor = useEditorPages("/home");

  const sections = editor.activePage.sections;
  const activeSectionIndex = editor.activeSectionIndex;
  const setActiveSectionIndex = editor.selectSection;
  const currentPage = useMemo(
    () => ({ name: editor.activePage.title, slug: editor.activePage.slug }),
    [editor.activePage.title, editor.activePage.slug],
  );
  const loadingDb = editor.booting || editor.activePage.status === "loading";

  /**
   * A section mutation, recorded for undo.
   *
   * Keeps the call shape the rest of this file already uses so the twenty-odd
   * existing mutation sites did not each need rewriting, but the page id is
   * captured inside `mutateSections` at call time rather than read at apply
   * time — which is the property that makes a mutation dispatched moments
   * before a page switch land on the page it was made for.
   */
  const setSectionsWithHistory = useCallback(
    (action: SectionItem[] | ((prev: SectionItem[]) => SectionItem[])) => {
      editor.mutateSections(typeof action === "function" ? action : () => action);
    },
    [editor],
  );

  /** The same, without an undo entry. For programmatic corrections only. */
  const setSections = useCallback(
    (action: SectionItem[] | ((prev: SectionItem[]) => SectionItem[])) => {
      editor.mutateSections(typeof action === "function" ? action : () => action, { record: false });
    },
    [editor],
  );

  /**
   * The section library — every template a tenant may use, grouped by category.
   *
   * One fetch, from `/api/v1/section-library`. The editor previously made two
   * fetches per category resolution against `/api/v1/admin/templates`, an
   * admin-only route that returns 401 to a college session; the failure was
   * swallowed by an empty `catch`, so the library was silently empty for every
   * tenant in production. That single fact is what made both the Add Section
   * picker and Swap Variant appear broken.
   */
  /**
   * Sections that take up space on the canvas and show nothing.
   *
   * A section can render empty for reasons that are invisible from the markup —
   * most often because its content is *built* by a script that was stripped on
   * save, which leaves its background and padding behind as a coloured band with
   * nothing in it. From the canvas that is indistinguishable from a gap between
   * sections, and the first thing anyone asks is why the editor has put a black
   * rectangle in their page.
   *
   * Measured from the rendered DOM rather than guessed from the code, because
   * whether a section *looks* empty depends on CSS, container queries and images
   * that only the browser has resolved.
   */
  const [emptySectionIds, setEmptySectionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // After layout and after the section scripts have had their 120ms window.
    const timer = setTimeout(() => {
      const flagged = new Set<string>();

      document.querySelectorAll<HTMLElement>("[data-xite-section]").forEach((wrapper) => {
        const id = wrapper.getAttribute("data-xite-section");
        if (!id) return;

        // Too short to read as a void; a thin divider is not a broken section.
        if (wrapper.getBoundingClientRect().height < 64) return;

        const box = wrapper.querySelector<HTMLElement>(".section-canvas-box");
        if (!box) return;

        if ((box.innerText || "").trim().length > 0) return;
        if (box.querySelector("img, svg, video, iframe, canvas, picture, input, button")) return;

        // A background image is content, even with no text in front of it.
        const painted = Array.from(box.querySelectorAll<HTMLElement>("*")).some((el) => {
          const image = window.getComputedStyle(el).backgroundImage;
          return Boolean(image) && image !== "none";
        });
        if (painted) return;

        flagged.add(id);
      });

      setEmptySectionIds((previous) => {
        if (previous.size === flagged.size && [...flagged].every((id) => previous.has(id))) {
          return previous;
        }
        return flagged;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [sections, viewportWidth]);

  /** Which category's variant strip is open in the picker. One at a time. */
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  /**
   * What just happened, in one line, above the toolbar.
   *
   * The editor had `showToastNotification`, which was deliberately wired to do
   * nothing — every call set the message to `null`. So "Only 1 variant", "No
   * section variants found" and every save failure were written, called, and
   * discarded. The user pressed Swap, nothing moved, and nothing said why.
   *
   * This is not a toast: it is a status line that replaces its own previous
   * message and clears itself, so it can report a failure without interrupting.
   */
  const [swapNotice, setSwapNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!swapNotice) return;
    const timer = setTimeout(() => setSwapNotice(null), 3200);
    return () => clearTimeout(timer);
  }, [swapNotice]);

  const [library, setLibrary] = useState<SectionLibrary>({ sections: [], byCategory: {} });
  const [libraryLoaded, setLibraryLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await fetchSectionLibrary();
      if (cancelled) return;
      setLibrary(next);
      setLibraryLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * A section's markup, ready for the canvas.
   *
   * Tokenising happens here — at render — and never on the way to the database.
   * `sec.code` on disk stays exactly as its author wrote it, so the theme is
   * reversible and a section renders identically with no theme applied: every
   * `var(--xite-…)` carries the original colour as its fallback.
   */
  /**
   * A section's markup, ready for the canvas.
   *
   * `sectionCanvasHtml` is the shared one — the same function the published
   * site and the preview call — so the three surfaces cannot disagree about
   * what a section is. The editor had its own weaker version that left every
   * `<style>` block in the markup, which meant each section's CSS was in the
   * document twice: once fenced to that section by `useSectionRuntime`, and
   * once unfenced, restyling every other section on the page.
   *
   * Only the inline `style="…"` attributes are tokenised here. The `<style>`
   * blocks are gone from this markup by design, and the runtime hook tokenises
   * them where it fences them.
   */
  const canvasHtml = useCallback((code: string) => tokenizeSectionHtml(sectionCanvasHtml(code)), []);

  /** The three theme font families, loaded once for the whole editor. */
  useEffect(() => {
    const id = "xite-editor-theme-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = themeFontsHref();
    document.head.appendChild(link);
  }, []);

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

  /**
   * Undo and redo, per page.
   *
   * Both stacks live in the store, keyed by page id, so switching to About and
   * back does not discard Home's history — the old pair of component-level
   * arrays were shared across every page, which meant an undo after a page
   * switch applied the *previous page's* section list to the current one.
   */
  const handleUndo = useCallback(() => {
    if (typeof document !== "undefined" && document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
    editor.undo();
  }, [editor]);

  const handleRedo = useCallback(() => {
    if (typeof document !== "undefined" && document.activeElement) {
      (document.activeElement as HTMLElement).blur();
    }
    editor.redo();
  }, [editor]);

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
  }, [handleUndo, handleRedo]);

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

  /**
   * Report something, in the status line above the toolbar.
   *
   * This used to be `setToastMessage(null)` — every call, unconditionally,
   * with a comment saying popups were disabled. The calls stayed, so eleven
   * places in this file described what had just happened to nobody. Popups
   * genuinely are gone; this is a single non-blocking status line that
   * replaces its own message.
   */
  const showToastNotification = useCallback((message: string) => {
    setSwapNotice(message || null);
  }, []);

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

  /**
   * Strips the wrappers the canvas adds, so what is saved is the section.
   *
   * Only the two wrapper classes this file injects, and only when they are the
   * outermost element. Section CSS and `<style>` blocks are preserved: they are
   * part of the section, and an earlier version of this stripped them.
   */
  const cleanCanvasWrapperFromCode = useCallback((rawCode: string): string => {
    if (!rawCode) return "";

    /**
     * Theme variables resolved back to the colours the section was authored in.
     *
     * This function's input is markup read back out of the live DOM — that is
     * how inline text editing captures an edit — and what is in the DOM is the
     * tokenised copy. Without this, editing one word would write
     * `var(--xite-accent, …)` into the stored markup, and a section carrying
     * theme variables renders in whatever theme it is later shown under rather
     * than in its author's colours.
     *
     * Tokens exist between the store and the screen, and nowhere else.
     */
    let clean = detokenizeSectionHtml(rawCode);

    // Overlays and toggles the canvas injects at runtime, which are not content.
    clean = clean.replace(/<div[^>]*class="[^"]*mobile-drawer-menu[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
    clean = clean.replace(/<button[^>]*class="[^"]*hamburger-toggle-btn[^"]*"[^>]*>[\s\S]*?<\/button>/gi, "");
    clean = clean.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    clean = clean.replace(
      /^<div[^>]*class="[^"]*(?:section-canvas-box|section-wrapper-container)[^"]*"[^>]*>([\s\S]*)<\/div>$/i,
      (_match, inner) => (inner ? inner.trim() : _match),
    );

    return clean.trim();
  }, []);

  /* ── Themes ──────────────────────────────────────────────────────────────
   *
   * A theme is an id, and applying it writes one attribute onto the canvas.
   * Nothing else happens: no section markup is read, rewritten or saved, so
   * every section on every page retints in the same frame, the change is
   * instant with no reload, and switching back is exact.
   *
   * The previous implementation ran a find-and-replace over `sec.code` for a
   * dozen hardcoded hex values and autosaved the result. That made a theme a
   * one-way, lossy migration of the tenant's own markup — `#2563eb` became
   * `#f59e0b`, and switching back turned every `#f59e0b` blue, including the
   * ones the section was authored with. It also only ever touched the page
   * currently open, so a multi-page site ended up half one theme and half
   * another. See `lib/editor-themes.ts`.
   */
  const [themeId, setThemeId] = useState<EditorThemeId>(DEFAULT_THEME_ID);
  const [fontId, setFontId] = useState<EditorFontId>(DEFAULT_FONT_ID);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await fetchTheme();
      if (cancelled) return;
      if (stored.themeId) setThemeId(stored.themeId as EditorThemeId);
      if (stored.fontId) setFontId(stored.fontId as EditorFontId);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * All four themes, as one stylesheet, injected once.
   *
   * Every theme's tokens are present at all times; the `data-xite-theme`
   * attribute selects between them. That is why switching costs an attribute
   * write rather than a stylesheet rebuild, and why it cannot race a re-render.
   */
  useEffect(() => {
    const id = "xite-editor-theme-tokens";
    let style = document.getElementById(id) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      // Before the section runtime sheet, so a section's own CSS still wins
      // where it is specific about a colour the theme has an opinion about.
      document.head.prepend(style);
    }
    style.textContent = themeStylesheet(EDITOR_CANVAS_SCOPE);
  }, []);

  const handlePaletteSelect = useCallback((next: string) => {
    setThemeId(next as EditorThemeId);
    // Fire-and-forget: the theme is already applied on screen, and a failed
    // write is reported by `saveTheme` rather than reverting what the user sees.
    void saveTheme({ themeId: next }).catch((error) => {
      console.error("[editor] could not save the theme selection:", error);
    });
  }, []);

  const handleFontSelect = useCallback((next: string) => {
    setFontId(next as EditorFontId);
    void saveTheme({ fontId: next }).catch((error) => {
      console.error("[editor] could not save the font selection:", error);
    });
  }, []);

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
    // The canvas ends where its sections end. See `sectionRuntimeCss`.
    fillViewport: false,
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


  /* ── Page navigation ─────────────────────────────────────────────────────
   *
   * Everything that used to live between here and the inline-editor — five
   * hundred lines of `fetchDbSections`, `getApiBases`, `loadAdminTemplates`,
   * `seedPageFromAdminDefaults`, `handlePageChange`, `handlePersistWebsiteSave`
   * and a `pageStore` mirrored into two localStorage keys — is now
   * `useEditorPages` and `editor-api.ts`. What is left here is the wiring.
   *
   * Three specific behaviours changed, and each was a reported bug:
   *
   *  - Switching pages made exactly one request. It used to make two —
   *    `handlePageChange` called `fetchDbSections`, and an effect on
   *    `[currentPage.slug]` called it again — which raced, and whichever
   *    resolved last won.
   *  - A save writes one page. It used to reconstruct and PUT every page's full
   *    markup on every debounce, so a page held stale in this tab was rewritten
   *    from that stale copy.
   *  - A reorder persists on the click, not 2 seconds later.
   */

  const handlePageChange = useCallback(
    (pageName: string, pageSlug: string) => {
      editor.selectPage(pageSlug, pageName);
    },
    [editor],
  );

  /** Explicit Save. The debounced autosave already covers ordinary editing. */
  const handlePersistWebsiteSave = useCallback(() => {
    editor.flush(editor.activePage.id);
  }, [editor]);

  /**
   * Fills an empty page from the Super Admin's default website.
   *
   * Only from the admin's page at this exact slug. There is deliberately no
   * fallback to `/home`: the version this replaces fell back to the home page
   * when the slug was missing, so pressing Add Section on a page the user had
   * just created copied the entire home page onto it — and the autosave then
   * made that permanent. A slug the admin has no opinion about opens the
   * picker, which is the honest answer.
   */
  const seedPageFromAdminDefaults = useCallback(async () => {
    const defaults = await fetchDefaultWebsite();
    const match = defaults.find((page: EditorPage) => canonicalSlug(page.slug) === editor.activePage.id);

    if (!match || match.sections.length === 0) {
      setShowAddSectionModal(true);
      return;
    }

    // Fresh ids: these are this college's sections now, not references to the
    // platform default. Sharing ids with the default is what let a later admin
    // edit appear to reach into a tenant's page.
    const seeded = match.sections.map((section: EditorSection) => ({ ...section, id: newSectionId() }));
    setSectionsWithHistory(() => seeded);
    setActiveSectionIndex(0);
  }, [editor.activePage.id, setSectionsWithHistory, setActiveSectionIndex]);

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

    const newBody = cleanCanvasWrapperFromCode(clone.innerHTML || clone.outerHTML);
    if (newBody) {
      setSectionsWithHistory((prev) =>
        prev.map((sec, i) =>
          i === sectionIndex
            ? {
                ...sec,
                /**
                 * Head from the stored section, body from the canvas.
                 *
                 * The canvas holds no `<style>` — the runtime lifted it out and
                 * fenced it to this section — so saving what the DOM returns
                 * verbatim would delete the section's whole stylesheet the
                 * first time anybody fixed a typo. `sec.code` is read from
                 * `prev` rather than a closure so it is always the current one.
                 */
                code: recomposeSectionCode(sec.code, newBody),
              }
            : sec,
        ),
      );
      showToastNotification("Text content updated");
    }
  }, [cleanCanvasWrapperFromCode, setSectionsWithHistory, showToastNotification]);

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
   * The library templates for one category.
   *
   * One lookup in a map the server built, not a filter with five fuzzy string
   * tests. The picker grid and the add handler read the same array, so a
   * category cannot show as available and then come up empty — or the reverse,
   * which is what the old pair of disagreeing predicates produced.
   */
  const libraryTemplatesFor = useCallback(
    (categoryId: string): LibrarySection[] => library.byCategory[categoryId] ?? [],
    [library],
  );

  /** Whether the library holds anything at all for this category. */
  const hasLibrarySection = useCallback(
    (categoryId: string): boolean => libraryTemplatesFor(categoryId).length > 0,
    [libraryTemplatesFor],
  );

  /**
   * Add a section.
   *
   * `template` is the specific variant the user picked from the category's
   * strip; without one, the category's first template is used. Placement is
   * `placementIndex`'s call — navbar first, footer last, everything else where
   * the user pointed or above the footer.
   *
   * What this no longer does: replace an existing section of the same category.
   * Adding a second Courses section used to silently overwrite the first,
   * because the toolbar path searched for a section of that category and
   * rewrote it in place. A page may hold two of anything except a navbar and a
   * footer, and those two are enforced by position rather than by deletion.
   */
  const handleAddSectionFromCategory = useCallback(
    (categoryId: string, template?: LibrarySection) => {
      const chosen = template ?? libraryTemplatesFor(categoryId)[0];

      if (!chosen) {
        // The grid disables these cards, so this is a guard rather than a path
        // anyone should reach. It emphatically does not fall back to a built-in
        // constant: the version that did inserted a fabricated section for a
        // university that does not exist — invented NIRF ranks, placement
        // percentages and student numbers — that looked exactly like a real one,
        // so the only way to discover it was fiction was to read it.
        console.warn(`[editor] no "${categoryId}" template in the section library.`);
        setSwapNotice(`No ${categoryId} layout in the library`);
        closeAddSectionModal();
        return;
      }

      const newSection = sectionFromTemplate(chosen, newSectionId());
      const slot = pendingInsertIndex;

      // A navbar and a footer are singular: adding a second replaces the first,
      // because two navbars is not a layout anyone means to build. Everything
      // else stacks — adding a second Courses section used to silently destroy
      // the first, which is not what "add" means.
      const singular = newSection.category === "navbar" || newSection.category === "footer";
      const base = singular ? sections.filter((sec) => sec.category !== newSection.category) : sections;

      // Computed once, from the list the section is actually going into. Doing
      // it against the pre-filter list is what made the selection land on the
      // wrong section when a navbar was replaced.
      const at = placementIndex(base, newSection.category, slot);

      const next = [...base];
      next.splice(at, 0, newSection);

      setSectionsWithHistory(() => next);
      setActiveSectionIndex(at);
      closeAddSectionModal();
      setSwapNotice(`Added ${newSection.title}`);
    },
    [libraryTemplatesFor, pendingInsertIndex, sections, setSectionsWithHistory, setActiveSectionIndex],
  );

  /**
   * Swap the selected section for the next variant of its own category.
   *
   * The decision is `swapVariant`'s — a pure function over the section and the
   * library — so it is testable, and so the button, a shortcut and a test all
   * take the same path. See `lib/section-variants.ts` for the three separate
   * reasons the previous 200-line version could not work.
   */
  const handleSwapVariant = useCallback(
    (direction: 1 | -1 = 1) => {
      if (activeSectionIndex === null) return;
      const active = sections[activeSectionIndex];
      if (!active) return;

      const result = swapVariant(active, library, direction);
      if (!result.ok) {
        // Reported, because "nothing happened" is the failure mode that cost
        // the most time here: an empty library and a genuinely single-variant
        // category are indistinguishable on the canvas.
        console.info(
          result.reason === "no-variants"
            ? `[editor] no variants for "${active.category}" — nothing in the section library covers it.`
            : `[editor] "${active.category}" has one variant. Add more in Admin › Templates.`,
        );
        setSwapNotice(
          result.reason === "no-variants"
            ? `No ${active.category} layouts in the library yet`
            : `Only one ${active.category} layout available`,
        );
        return;
      }

      setSectionsWithHistory((prev) =>
        prev.map((sec, idx) => (idx === activeSectionIndex ? result.section : sec)),
      );
      setSwapNotice(`Layout ${result.position} of ${result.total} — ${result.section.title}`);
    },
    [activeSectionIndex, sections, library, setSectionsWithHistory],
  );

  /** How many variants the selected section could swap between. For the toolbar. */
  const activeVariantCount = useMemo(() => {
    if (activeSectionIndex === null) return 0;
    const active = sections[activeSectionIndex];
    return active ? variantsFor(active, library).length : 0;
  }, [activeSectionIndex, sections, library]);

  const handleDuplicateSection = useCallback(() => {
    if (activeSectionIndex === null) return;
    const current = sections[activeSectionIndex];
    if (!current) return;

    // A navbar or a footer is singular by position, so duplicating one would
    // produce a section that can never be moved anywhere legal.
    if (current.category === "navbar" || current.category === "footer") return;

    const duplicated: SectionItem = {
      ...current,
      // A new id, and the same `templateId`: the copy is the same variant of
      // the same category, so it swaps through the same cycle. Carrying the id
      // over instead — which the previous version did by omitting both fields —
      // gave two sections one identity, and React then rendered one of them.
      id: newSectionId(),
      title: `${current.title} (Copy)`,
    };

    setSectionsWithHistory((prev) => [
      ...prev.slice(0, activeSectionIndex + 1),
      duplicated,
      ...prev.slice(activeSectionIndex + 1),
    ]);
    setActiveSectionIndex(activeSectionIndex + 1);
  }, [activeSectionIndex, sections, setSectionsWithHistory, setActiveSectionIndex]);

  const handleDeleteSection = useCallback(() => {
    if (activeSectionIndex === null) return;
    const remaining = sections.length - 1;
    setSectionsWithHistory((prev) => prev.filter((_, idx) => idx !== activeSectionIndex));
    setActiveSectionIndex(
      remaining <= 0 ? null : Math.min(activeSectionIndex, remaining - 1),
    );
  }, [activeSectionIndex, sections.length, setSectionsWithHistory, setActiveSectionIndex]);

  /**
   * Move the selected section one place, and persist the new order immediately.
   *
   * ── Why the order used to be lost ─────────────────────────────────────────
   *
   * The move itself worked; nothing saved it. `handleMoveUp` mutated state and
   * returned, relying on a 2-second debounced autosave that re-serialised
   * *every page's full markup* into one `PUT /api/v1/my-website`. Three ways
   * that failed to persist a reorder:
   *
   *  - Every further click restarted the 2-second timer, so a user arranging
   *    six sections never triggered a save at all until they stopped and waited.
   *  - The payload was the whole site — hundreds of kilobytes of HTML to express
   *    "these two swapped" — and the request rebuilt other pages from browser
   *    state that could be stale.
   *  - Nothing reported a failure. Every error path was `catch (e) {}`, so a
   *    rejected save looked exactly like a successful one until the refresh.
   *
   * Now: the swap goes into state, and the new order goes to
   * `PATCH /api/v1/my-website/pages/:slug/order` as a list of ids on the same
   * tick. Small, synchronous, one page, and a failure is surfaced rather than
   * swallowed.
   *
   * The guards are `canMove`'s, which asks whether these two particular
   * sections may trade places. The old guards did index arithmetic against
   * `sections.length` and refused to move index 1 upward on any page — including
   * pages with no navbar at all, where index 0 is ordinary content.
   */
  const moveActiveSection = useCallback(
    (direction: 1 | -1) => {
      if (activeSectionIndex === null) return;

      const next = moveSection(sections, activeSectionIndex, direction);
      if (next === sections) {
        setSwapNotice(
          direction === -1
            ? "This section is already as high as it goes"
            : "This section is already as low as it goes",
        );
        return;
      }

      const pageId = editor.activePage.id;
      setSectionsWithHistory(() => next);
      setActiveSectionIndex(activeSectionIndex + direction);
      void editor.persistOrder(pageId, next.map((sec) => sec.id));
    },
    [activeSectionIndex, sections, editor, setSectionsWithHistory, setActiveSectionIndex],
  );

  const handleMoveUp = useCallback(() => moveActiveSection(-1), [moveActiveSection]);
  const handleMoveDown = useCallback(() => moveActiveSection(1), [moveActiveSection]);

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
        className={`flex-1 w-full flex flex-col items-center justify-start cursor-pointer min-h-screen transition-all ${
          viewportWidth === "100%" ? "bg-white p-0 m-0" : "bg-slate-100/90 px-4 sm:px-8 pt-0 mt-0"
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
          /* The theme switch, in full. Every theme's tokens are already in the
             injected stylesheet keyed on these two attributes, so changing one
             retints every section under this element in the same frame — no
             refetch, no section re-render, no reload, and identical behaviour
             on every page because nothing here reads the page's sections. */
          data-xite-theme={themeId}
          data-xite-font={fontId}
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
                // The navbar, by its resolved category. Four overlapping string tests used
                // to answer this, one of which was `idx === 0` — so on a page with no
                // navbar the first section, whatever it was, got the navbar z-index.
                const isHeader = sec.category === "navbar";
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
                      dangerouslySetInnerHTML={{ __html: canvasHtml(sec.code) }}
                      className="w-full block p-0 m-0 text-left"
                    />

                    {/* This section occupies space and shows nothing.
                        Said out loud rather than left as an unexplained coloured
                        band, which is what it looks like otherwise — and which
                        reads as the editor having inserted a gap rather than as
                        a section that failed to render. */}
                    {emptySectionIds.has(sec.id) && (
                      <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center p-6">
                        <div className="pointer-events-auto max-w-md rounded-xl border border-amber-400/40 bg-amber-950/85 px-4 py-3 text-center shadow-lg backdrop-blur-sm">
                          <p className="text-[11px] font-black tracking-tight text-amber-200">
                            &ldquo;{sec.title}&rdquo; is rendering empty
                          </p>
                          <p className="mt-1 text-[10px] font-medium leading-relaxed text-amber-100/70">
                            It takes up space but shows nothing. Usually its content is built by a
                            script. Try Swap to another layout, or delete it.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  </React.Fragment>
                );
              })}

              {/* The slot under the last section. */}
              <SectionInsertPoint index={sections.length} onInsert={openAddSectionModalAt} />

            </div>
          )}
        </div>

        {/* Clearance for the floating dock, and the only such clearance.
            `main` also carried `pb-64`, so 256px of padding and this 192px
            spacer both reserved room for the same dock — 448px of dead space
            under every page. The dock is ~96px tall and sits 32px from the
            bottom, so 160px clears it with room to spare. */}
        <div className="w-full h-40 shrink-0 pointer-events-none" />
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


              {/* Nothing in the library at all.
                  Said plainly rather than shown as nineteen greyed-out cards:
                  an empty library and an unreachable API produced the identical
                  screen, and telling those apart was the whole difficulty of
                  the "swap does not work" report. */}
              {libraryLoaded && library.sections.length === 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <h4 className="text-xs font-black text-amber-200">The section library is empty</h4>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-amber-100/70">
                    No published sections are available to add. A Super Admin adds them in
                    Admin&nbsp;&rsaquo;&nbsp;Templates; archived and unpublished drafts are not offered here.
                  </p>
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
                    const variants = libraryTemplatesFor(cat.id);
                    const available = variants.length > 0;
                    const expanded = expandedCategory === cat.id;

                    /* One variant: add it. The extra click to choose from a list
                       of one is just a click. More than one: show them, rather
                       than silently taking the first — which is what the old
                       handler did, so every category offered exactly one layout
                       no matter how many the admin had published. */
                    const activate = () => {
                      if (!available) return;
                      if (variants.length === 1) handleAddSectionFromCategory(cat.id, variants[0]);
                      else setExpandedCategory(expanded ? null : cat.id);
                    };

                    return (
                      <div key={cat.id} className={expanded ? "sm:col-span-2" : undefined}>
                        <div
                          onClick={available ? activate : undefined}
                          role={available ? "button" : undefined}
                          tabIndex={available ? 0 : undefined}
                          onKeyDown={
                            available
                              ? (e) => {
                                  if (e.key !== "Enter" && e.key !== " ") return;
                                  e.preventDefault();
                                  activate();
                                }
                              : undefined
                          }
                          aria-disabled={!available}
                          aria-expanded={available && variants.length > 1 ? expanded : undefined}
                          title={
                            available
                              ? `${variants.length} ${cat.name} layout${variants.length === 1 ? "" : "s"} available`
                              : `No ${cat.name} section in the library yet`
                          }
                          className={`group relative flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 select-none overflow-hidden shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
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
                              <h4
                                className={`text-xs font-black truncate tracking-tight ${
                                  available ? "text-white" : "text-zinc-500"
                                }`}
                              >
                                {cat.name}
                              </h4>
                              <span
                                className={`text-[9px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
                                  available
                                    ? "text-zinc-300 bg-zinc-800/90 border-zinc-700"
                                    : "text-zinc-600 bg-transparent border-zinc-800"
                                }`}
                              >
                                {available
                                  ? `${variants.length} layout${variants.length === 1 ? "" : "s"}`
                                  : "Not in library"}
                              </span>
                            </div>
                            <p
                              className={`text-[11px] mt-0.5 font-medium truncate leading-normal ${
                                available ? "text-zinc-400 group-hover:text-zinc-300" : "text-zinc-600"
                              }`}
                            >
                              {cat.description}
                            </p>
                          </div>
                        </div>

                        {expanded && variants.length > 1 && (
                          <div className="mt-2 grid gap-2 rounded-2xl border border-zinc-800 bg-black/60 p-2 sm:grid-cols-3">
                            {variants.map((variant, index) => (
                              <button
                                key={variant.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddSectionFromCategory(cat.id, variant);
                                }}
                                className="flex flex-col items-start gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-left transition-all hover:border-cyan-500/70 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                              >
                                <span className="text-[9px] font-mono font-extrabold text-zinc-500">
                                  Layout {index + 1}
                                </span>
                                <span className="w-full truncate text-[11px] font-black tracking-tight text-white">
                                  {variant.name}
                                </span>
                                {variant.description && (
                                  <span className="w-full truncate text-[10px] font-medium text-zinc-500">
                                    {variant.description}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
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
        onPageCreate={(name, slug) => {
          /* A page created here is marked `fresh` in the store, which is what
             makes it open empty. Without it the loader finds no entry for the
             slug and seeds from the platform default — so creating "Admissions"
             used to fill it with the home page, which the autosave then made
             permanent. */
          editor.createPage(slug, name);
        }}
        onPaletteSelect={handlePaletteSelect}
        onFontSelect={handleFontSelect}
        activePaletteId={themeId}
        activeFontId={fontId}
        pages={editor.pages.map((page) => ({ slug: page.slug, title: page.title }))}
        activePageSlug={editor.activePage.slug}
      />

      {/* Domain Settings Modal */}
      <DomainSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        subdomain={subdomain}
        initialTab={settingsTab}
      />

      {/* What just happened.
          The editor's `showToastNotification` was wired to set the message to
          `null` on every call, so every "Only 1 variant", every "no variants
          found" and every save failure was written, called and discarded — the
          user pressed Swap, nothing moved, and nothing said why. This replaces
          its own message rather than stacking, and clears itself. */}
      {(swapNotice || editor.activePage.error) && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed bottom-32 left-1/2 z-40 -translate-x-1/2"
        >
          <div
            className={`rounded-full border px-4 py-2 text-[11px] font-black tracking-tight shadow-lg backdrop-blur ${
              editor.activePage.error
                ? "border-rose-500/40 bg-rose-950/90 text-rose-100"
                : "border-zinc-700 bg-zinc-900/95 text-zinc-100"
            }`}
          >
            {editor.activePage.error ? `Could not save: ${editor.activePage.error}` : swapNotice}
          </div>
        </div>
      )}

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
          onSwapVariant={() => handleSwapVariant(1)}
          variantCount={activeVariantCount}
          onEditText={handleEnableTextEditingForActiveSection}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
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
