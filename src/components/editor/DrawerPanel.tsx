"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_DUAL_THEMES,
  EDITOR_FONTS,
  hexToRgb,
  calculateOppositeContrast,
  presetBrandTokens,
  type EditorThemeTokens,
} from "@/lib/editor-themes";
import {
  X,
  Home,
  Info,
  GraduationCap,
  Calendar,
  Users,
  Briefcase,
  Mail,
  BookOpen,
  Building,
  Award,
  Plus,
  Palette,
  Type,
  Check,
  Trash2,
  FileText,
  ArrowLeftRight,
} from "lucide-react";

const CURATED_ACCENT_SWATCHES = [
  { name: "Pitch Black", hex: "#000000" },
  { name: "Pure White", hex: "#ffffff" },
  { name: "Royal Blue", hex: "#2563eb" },
  { name: "Sky Cyan", hex: "#06b6d4" },
  { name: "Emerald Green", hex: "#10b981" },
  { name: "Deep Teal", hex: "#0d9488" },
  { name: "Vibrant Violet", hex: "#8b5cf6" },
  { name: "Electric Indigo", hex: "#6366f1" },
  { name: "Rose Pink", hex: "#f43f5e" },
  { name: "Coral Red", hex: "#ef4444" },
  { name: "Sunset Orange", hex: "#f97316" },
  { name: "Golden Amber", hex: "#f59e0b" },
];

interface DrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPageSelect?: (pageName: string, pageSlug: string) => void;
  /** Fired once, for a page the user has just created and that has no sections yet. */
  onPageCreate?: (pageName: string, pageSlug: string) => void;
  /** `tokens` accompany a preset: the brand colours it starts the tenant on. */
  onPaletteSelect?: (paletteId: string, tokens?: EditorThemeTokens) => void;
  onFontSelect?: (fontId: string) => void;
  /**
   * The theme and font currently applied.
   *
   * Passed in rather than held here. The drawer used to keep its own
   * `selectedPalette`, so the tick moved when you clicked but reverted to
   * "Academic Navy" the next time the drawer was opened — it had no idea what
   * the canvas was actually showing, and the two disagreed after any reload.
   */
  activePaletteId?: string | null;
  activeFontId?: string | null;
  /**
   * Deletes a page for real — from the database, not just from this list.
   */
  onPageDelete?: (pageSlug: string) => Promise<void>;
  /** The pages that exist, from the editor's own store. */
  pages?: { slug: string; title: string }[];
  activePageSlug?: string;
  customThemeTokens?: EditorThemeTokens | null;
  onCustomThemeChange?: (tokens: EditorThemeTokens) => void;
}

interface PageItem {
  id: string;
  name: string;
  slug: string;
  icon: typeof Home;
}

const INITIAL_PAGES: PageItem[] = [
  { id: "1", name: "Home", slug: "/home", icon: Home },
  { id: "2", name: "About Us", slug: "/about", icon: Info },
  { id: "3", name: "Academics", slug: "/academics", icon: GraduationCap },
  { id: "4", name: "Events & News", slug: "/events", icon: Calendar },
  { id: "5", name: "Faculty", slug: "/faculty", icon: Users },
  { id: "6", name: "Admissions", slug: "/admissions", icon: Briefcase },
  { id: "7", name: "Contact Us", slug: "/contact", icon: Mail },
  { id: "8", name: "Programs", slug: "/programs", icon: BookOpen },
  { id: "9", name: "Schools/Department", slug: "/departments", icon: Building },
  { id: "10", name: "Placement & Careers", slug: "/placements", icon: Briefcase },
  { id: "11", name: "Scholarships & Grants", slug: "/scholarships", icon: Award },
];

/**
 * One brand colour: a preview box that opens the native picker, a hex field,
 * and the curated swatches. The colours tab renders it twice — once for the
 * primary colour, once for the secondary — so each can be changed on its own
 * without touching the other.
 */
function BrandColorCard({
  title,
  label,
  value,
  active,
  onChange,
}: {
  title: string;
  label: string;
  value: string;
  active: boolean;
  onChange: (hex: string) => void;
}) {
  const isWhite = value.toLowerCase() === "#ffffff";
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "12px",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Palette style={{ width: "14px", height: "14px", color: "#0f172a" }} />
          <span style={{ fontSize: "12px", fontWeight: 900, color: "#0f172a" }}>{title}</span>
        </div>
        {active && (
          <span
            style={{
              fontSize: "9px",
              fontWeight: 800,
              color: "#16a34a",
              backgroundColor: "#dcfce7",
              padding: "2px 6px",
              borderRadius: "6px",
            }}
          >
            Custom
          </span>
        )}
      </div>

      {/* The Box & Hex Input */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 8px",
          borderRadius: "10px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* The Box */}
          <label
            style={{
              position: "relative",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              backgroundColor: value,
              border: isWhite ? "2px solid #cbd5e1" : "2px solid #ffffff",
              boxShadow: "0 2px 5px rgba(0,0,0,0.12), 0 0 0 1px #cbd5e1",
              cursor: "pointer",
              display: "block",
              flexShrink: 0,
            }}
            title="Click to pick any custom color"
          >
            <input
              type="color"
              value={value.startsWith("#") ? value : "#2563eb"}
              onChange={(e) => onChange(e.target.value)}
              style={{
                opacity: 0,
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
                cursor: "pointer",
              }}
            />
          </label>

          <span style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a" }}>{label}</span>
        </div>

        {/* Hex Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={9}
          style={{
            width: "80px",
            height: "28px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1",
            padding: "0 6px",
            fontSize: "11px",
            fontFamily: "monospace",
            fontWeight: 700,
            color: "#0f172a",
            backgroundColor: "#ffffff",
            textAlign: "center",
          }}
        />
      </div>

      {/* The Circle Shape Color Palette Swatches */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {CURATED_ACCENT_SWATCHES.map((swatch) => {
          const isSelected = value.toLowerCase() === swatch.hex.toLowerCase();
          return (
            <button
              key={swatch.hex}
              type="button"
              onClick={() => onChange(swatch.hex)}
              title={swatch.name}
              style={{
                width: "26px",
                height: "26px",
                borderRadius: "50%",
                backgroundColor: swatch.hex,
                border: isSelected ? "2.5px solid #0f172a" : swatch.hex.toLowerCase() === "#ffffff" ? "1px solid #cbd5e1" : "2px solid #ffffff",
                boxShadow: isSelected
                  ? "0 0 0 2px #3b82f6, 0 2px 4px rgba(0,0,0,0.2)"
                  : "0 1px 3px rgba(0,0,0,0.15), 0 0 0 1px #cbd5e1",
                cursor: "pointer",
                transform: isSelected ? "scale(1.1)" : "scale(1)",
                transition: "all 0.15s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isSelected && (
                <Check
                  style={{
                    width: "12px",
                    height: "12px",
                    color: calculateOppositeContrast(swatch.hex).textColor,
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DrawerPanel({
  isOpen,
  onClose,
  onPageSelect,
  onPageCreate,
  onPageDelete,
  onPaletteSelect,
  onFontSelect,
  /**
   * Null when the tenant has not chosen one, and then nothing is ticked.
   *
   * These defaulted to the first theme and font, so the drawer ticked
   * "Academic Navy" and "Inter" for every tenant who had never opened it —
   * telling them they had made a choice they had not made, and disagreeing
   * with the canvas, which now stamps no theme until one is picked.
   */
  activePaletteId = null,
  activeFontId = null,
  pages: livePages,
  activePageSlug,
  customThemeTokens = null,
  onCustomThemeChange,
}: DrawerPanelProps) {
  const [activeTab, setActiveTab] = useState<"pages" | "colors" | "fonts">("pages");
  const [pages, setPages] = useState<PageItem[]>(INITIAL_PAGES);

  const [customTokens, setCustomTokens] = useState<EditorThemeTokens>(() => {
    return customThemeTokens ?? DEFAULT_DUAL_THEMES[0]!.tokens;
  });

  useMemo(() => {
    if (customThemeTokens) {
      setCustomTokens(customThemeTokens);
    }
  }, [customThemeTokens]);

  const currentAccentColor = customTokens.primary || customTokens.accent || "#000000";
  /**
   * Falls back to the primary until the tenant picks one, so the secondary
   * card never shows a colour the canvas is not actually using.
   */
  const currentSecondaryColor = customTokens.secondary || currentAccentColor;

  /**
   * What the active preset would give, so each card can say when the tenant
   * has replaced that colour. With no preset chosen there is nothing to differ
   * from, and any customisation at all counts.
   */
  const activePreset = DEFAULT_DUAL_THEMES.find((t) => t.id === activePaletteId);
  const presetDefaults = activePreset ? presetBrandTokens(activePreset) : null;
  const differsFromPreset = (value: string, presetValue: string | undefined) =>
    presetValue ? value.toLowerCase() !== presetValue.toLowerCase() : activePaletteId === "custom";

  /**
   * Changing a colour keeps the preset selected: the canvas still wears its
   * surfaces and text, with just this colour overridden on top.
   */
  const commitCustomTokens = (updated: EditorThemeTokens) => {
    setCustomTokens(updated);
    onCustomThemeChange?.(updated);
  };

  const handleApplyAccentColor = (newHex: string) => {
    const contrast = calculateOppositeContrast(newHex);
    commitCustomTokens({
      ...customTokens,
      primary: newHex,
      accent: newHex,
      accentSoft: contrast.softBackground,
      onAccent: contrast.textColor,
      accentBorder: contrast.borderColor,
    });
  };

  const handleApplySecondaryColor = (newHex: string) => {
    const contrast = calculateOppositeContrast(newHex);
    commitCustomTokens({
      ...customTokens,
      secondary: newHex,
      onSecondary: contrast.textColor,
      secondaryBorder: contrast.borderColor,
    });
  };

  /**
   * The list shown: every page the college actually has, plus the suggested
   * ones it has not created yet.
   *
   * `INITIAL_PAGES` alone was the list before, so a page created in a previous
   * session did not appear at all — the only way back to it was to create it
   * again, which then opened it empty and autosaved that over the saved one.
   */
  const visiblePages: PageItem[] = useMemo(() => {
    const bySlug = new Map<string, PageItem>();
    pages.forEach((page) => bySlug.set(page.slug, page));

    (livePages ?? []).forEach((page) => {
      const existing = bySlug.get(page.slug);
      bySlug.set(page.slug, {
        id: existing?.id ?? `live-${page.slug}`,
        name: page.title || existing?.name || page.slug,
        slug: page.slug,
        icon: existing?.icon ?? FileText,
      });
    });

    return Array.from(bySlug.values());
  }, [pages, livePages]);
  const [selectedPageSlug, setSelectedPageSlug] = useState("/home");
  /** The editor's open page wins; the local value is only the pre-boot default. */
  const currentSlug = activePageSlug ?? selectedPageSlug;

  // New Page Modal State
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSelectPage = (page: PageItem) => {
    setSelectedPageSlug(page.slug);
    if (onPageSelect) onPageSelect(page.name, page.slug);
    showNotification(`Switched to page: ${page.name} (${page.slug})`);
  };

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;

    const slug = `/${newPageName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const newPage: PageItem = {
      id: `custom-${Date.now()}`,
      name: newPageName.trim(),
      slug,
      icon: FileText,
    };

    setPages((prev) => [...prev, newPage]);
    setSelectedPageSlug(slug);
    setNewPageName("");
    setShowNewPageModal(false);

    // Announced before the page is selected, so the editor knows this slug is
    // new and must not be filled from anywhere — a page the user just made
    // starts empty, and stays empty until they ask for sections.
    if (onPageCreate) onPageCreate(newPage.name, slug);
    if (onPageSelect) onPageSelect(newPage.name, slug);

    showNotification(`Created new page: "${newPage.name}"`);
  };

  /** Slugs currently being deleted, so the button cannot be pressed twice. */
  const [deleting, setDeleting] = useState<string[]>([]);

  /**
   * Delete a page.
   *
   * This used to filter a local array and announce "Page deleted successfully."
   * Nothing was called: the page stayed in the database, stayed published, and
   * reappeared as soon as the editor's own page list re-rendered over the local
   * one — because `visiblePages` merges the two, and only the local half had
   * been touched.
   *
   * Two kinds of row are in that list and they need different handling. A
   * *suggested* page — one of the eleven this drawer offers that the college
   * has never created — exists only here, so removing it is a local edit. A
   * page the college actually has goes to the server, and the row stays put
   * until the server says it is gone.
   */
  const handleDeletePage = async (e: React.MouseEvent, page: PageItem) => {
    e.stopPropagation();

    if (visiblePages.length <= 1) {
      showNotification("Cannot delete the last remaining page.");
      return;
    }

    const isLive = (livePages ?? []).some((live) => live.slug === page.slug);

    if (!isLive) {
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      showNotification(`Removed "${page.name}" from the list.`);
      return;
    }

    if (!onPageDelete) {
      showNotification("Deleting pages is unavailable right now.");
      return;
    }

    // Deleting a page deletes its sections with it, and there is no undo for
    // that on the server. Worth one question.
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        `Delete "${page.name}" and everything on it? Visitors to ${page.slug} will get a "page not found".`,
      )
    ) {
      return;
    }

    setDeleting((prev) => [...prev, page.slug]);
    try {
      await onPageDelete(page.slug);
      setPages((prev) => prev.filter((p) => p.slug !== page.slug));
      showNotification(`Deleted "${page.name}".`);
    } catch (error) {
      showNotification(
        error instanceof Error ? `Could not delete that page: ${error.message}` : "Could not delete that page.",
      );
    } finally {
      setDeleting((prev) => prev.filter((slug) => slug !== page.slug));
    }
  };

  /**
   * Apply a theme.
   *
   * No local "selected" state: the tick reads `activePaletteId`, which is what
   * the canvas is actually showing. The drawer used to hold its own copy, so
   * the tick moved when clicked and then reverted to Academic Navy the next
   * time the drawer opened — the two disagreed after any reload.
   */
  /**
   * A preset resets both colour cards to its own pair — black on white, or
   * white on black — replacing whatever was customised on the previous one.
   */
  const handleSelectPalette = (paletteId: string, paletteName: string) => {
    const selectedTheme = DEFAULT_DUAL_THEMES.find((t) => t.id === paletteId);
    const tokens = selectedTheme ? presetBrandTokens(selectedTheme) : undefined;
    if (tokens) setCustomTokens(tokens);
    onPaletteSelect?.(paletteId, tokens);
    showNotification(`Applied theme: ${paletteName}`);
  };

  const handleSelectFont = (fontId: string, fontName: string) => {
    onFontSelect?.(fontId);
    showNotification(`Applied font: ${fontName}`);
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        backdropFilter: "blur(2px)",
        display: "flex",
        flexDirection: "row",
      }}
      className="select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          height: "100%",
          width: "320px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          position: "relative",
        }}
        className="text-slate-800 font-sans cursor-default"
      >
        {/* Notification Toast */}
        {toastMessage && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              right: "12px",
              zIndex: 10000,
              padding: "10px 14px",
              backgroundColor: "#0f172a",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 800,
              borderRadius: "12px",
              boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
              border: "1px solid #334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header & Segmented Control Switcher */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", fontWeight: 900, color: "#0f172a", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Pages, Colors & Fonts
            </span>
            <button
              onClick={onClose}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "6px",
              }}
            >
              <X style={{ width: "16px", height: "16px" }} />
            </button>
          </div>

          {/* Segmented Switcher Control */}
          <div
            style={{
              backgroundColor: "#e2e8f0",
              padding: "4px",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "row",
              gap: "4px",
              border: "1px solid #cbd5e1",
            }}
          >
            <button
              onClick={() => setActiveTab("pages")}
              style={{
                flex: 1,
                height: "36px",
                borderRadius: "12px",
                fontSize: "11.5px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                border: "none",
                cursor: "pointer",
                backgroundColor: activeTab === "pages" ? "#ffffff" : "transparent",
                color: activeTab === "pages" ? "#0f172a" : "#64748b",
                boxShadow: activeTab === "pages" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <Home style={{ width: "13px", height: "13px" }} />
              <span>Pages</span>
            </button>

            <button
              onClick={() => setActiveTab("colors")}
              style={{
                flex: 1,
                height: "36px",
                borderRadius: "12px",
                fontSize: "11.5px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                border: "none",
                cursor: "pointer",
                backgroundColor: activeTab === "colors" ? "#ffffff" : "transparent",
                color: activeTab === "colors" ? "#0f172a" : "#64748b",
                boxShadow: activeTab === "colors" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <Palette style={{ width: "13px", height: "13px" }} />
              <span>Colors</span>
            </button>

            <button
              onClick={() => setActiveTab("fonts")}
              style={{
                flex: 1,
                height: "36px",
                borderRadius: "12px",
                fontSize: "11.5px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                border: "none",
                cursor: "pointer",
                backgroundColor: activeTab === "fonts" ? "#ffffff" : "transparent",
                color: activeTab === "fonts" ? "#0f172a" : "#64748b",
                boxShadow: activeTab === "fonts" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <Type style={{ width: "13px", height: "13px" }} />
              <span>Fonts</span>
            </button>

          </div>
        </div>

        {/* Drawer Body Scroll Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* PAGES TAB */}
          {activeTab === "pages" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {visiblePages.map((page) => {
                const Icon = page.icon;
                const isSelected = currentSlug === page.slug;
                return (
                  <div
                    key={page.id}
                    onClick={() => handleSelectPage(page)}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      borderRadius: "18px",
                      backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                      border: isSelected ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                      boxShadow: isSelected ? "0 2px 4px rgba(59,130,246,0.1)" : "none",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "12px",
                          backgroundColor: isSelected ? "#0d1527" : "#f1f5f9",
                          color: isSelected ? "#ffffff" : "#475569",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon style={{ width: "18px", height: "18px" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "13px", fontWeight: isSelected ? 900 : 700, color: "#0f172a" }}>
                          {page.name}
                        </span>
                        <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#64748b", marginTop: "2px" }}>
                          {page.slug}
                        </span>
                      </div>
                    </div>

                    {visiblePages.length > 1 && (
                      <button
                        onClick={(e) => void handleDeletePage(e, page)}
                        disabled={deleting.includes(page.slug)}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#94a3b8",
                          cursor: deleting.includes(page.slug) ? "wait" : "pointer",
                          padding: "4px",
                          borderRadius: "6px",
                          opacity: deleting.includes(page.slug) ? 0.5 : 1,
                        }}
                        title={
                          deleting.includes(page.slug) ? "Deleting…" : `Delete ${page.name}`
                        }
                        aria-label={`Delete ${page.name}`}
                      >
                        <Trash2 style={{ width: "14px", height: "14px" }} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* COLORS TAB */}
          {activeTab === "colors" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* SECTION 1: WHITE & BLACK / BLACK & WHITE PRESETS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {DEFAULT_DUAL_THEMES.map((theme) => {
                  const isSelected = activePaletteId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectPalette(theme.id, theme.name)}
                      aria-pressed={isSelected}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "12px",
                        backgroundColor: isSelected ? "#f8fafc" : "#ffffff",
                        border: isSelected ? "2px solid #0f172a" : "1px solid #e2e8f0",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        textAlign: "left",
                        width: "100%",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              backgroundColor: theme.swatch.base,
                              border: theme.swatch.base === "#ffffff" ? "1px solid #cbd5e1" : "1px solid #000000",
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              backgroundColor: theme.swatch.accent,
                              border: theme.swatch.accent === "#ffffff" ? "1px solid #cbd5e1" : "1px solid #000000",
                              display: "inline-block",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                          {theme.name}
                        </span>
                      </div>
                      {isSelected && (
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Check style={{ width: "12px", height: "12px", color: "#ffffff", strokeWidth: 3 }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SECTION 2: PRIMARY & SECONDARY BRAND COLOURS */}
              <BrandColorCard
                title="Customize Primary Color"
                label="Primary"
                value={currentAccentColor}
                active={differsFromPreset(currentAccentColor, presetDefaults?.primary)}
                onChange={handleApplyAccentColor}
              />
              <BrandColorCard
                title="Customize Secondary Color"
                label="Secondary"
                value={currentSecondaryColor}
                active={differsFromPreset(currentSecondaryColor, presetDefaults?.secondary)}
                onChange={handleApplySecondaryColor}
              />
            </div>
          )}

          {/* FONTS TAB */}
          {activeTab === "fonts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                <span style={{ fontSize: "11px", fontWeight: 900, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Google Fonts ({EDITOR_FONTS.length} Styles)
                </span>
                <span style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8" }}>
                  {activeFontId ? "1 Selected" : "Default"}
                </span>
              </div>

              {EDITOR_FONTS.map((font) => {
                const isSelected = activeFontId === font.id;

                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => handleSelectFont(font.id, font.name)}
                    aria-pressed={isSelected}
                    style={{
                      padding: "11px 14px",
                      borderRadius: "12px",
                      backgroundColor: isSelected ? "#f8fafc" : "#ffffff",
                      border: isSelected ? "2px solid #0f172a" : "1px solid #e2e8f0",
                      boxShadow: isSelected ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "left",
                      width: "100%",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                      <span
                        style={{
                          fontSize: "15px",
                          fontWeight: 800,
                          color: "#0f172a",
                          fontFamily: font.stack,
                          letterSpacing: "0.01em",
                        }}
                      >
                        {font.name}
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: isSelected ? "#475569" : "#94a3b8",
                          fontFamily: font.stack,
                        }}
                      >
                        Aa
                      </span>
                    </div>

                    {isSelected && (
                      <Check style={{ width: "16px", height: "16px", color: "#0f172a", flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Bottom Sticky Add New Page Button */}
        {activeTab === "pages" && (
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid #e2e8f0",
              backgroundColor: "#ffffff",
            }}
          >
            <button
              onClick={() => setShowNewPageModal(true)}
              style={{
                width: "100%",
                height: "46px",
                backgroundColor: "#0d1527",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: 900,
                borderRadius: "14px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 6px rgba(13,21,39,0.2)",
              }}
            >
              <Plus style={{ width: "16px", height: "16px" }} />
              <span>Add New Page</span>
            </button>
          </div>
        )}
      </div>

      {/* New Page Modal Dialog */}
      {showNewPageModal && (
        <div
          onClick={() => setShowNewPageModal(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100000,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <form
            onSubmit={handleAddPage}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "360px",
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a", margin: 0 }}>Create New Website Page</h3>
            <input
              type="text"
              placeholder="e.g. Research & Development"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              autoFocus
              style={{
                height: "46px",
                paddingLeft: "16px",
                paddingRight: "16px",
                borderRadius: "12px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", flexDirection: "row", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowNewPageModal(false)}
                style={{
                  height: "40px",
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  height: "40px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Create Page
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
