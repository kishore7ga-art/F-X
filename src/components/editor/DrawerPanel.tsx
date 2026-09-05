"use client";

import { useMemo, useState } from "react";

import {
  DEFAULT_DUAL_THEMES,
  EDITOR_FONTS,
  TRENDING_ALGORITHMIC_PALETTES,
  generateHarmonicPalette,
  generateRandomHarmonicPalette,
  type EditorThemeTokens,
  type HarmonyMode,
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
  Sparkles,
  Sliders,
  RotateCcw,
  Wand2,
} from "lucide-react";

interface DrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPageSelect?: (pageName: string, pageSlug: string) => void;
  /** Fired once, for a page the user has just created and that has no sections yet. */
  onPageCreate?: (pageName: string, pageSlug: string) => void;
  onPaletteSelect?: (paletteId: string) => void;
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

  const [generatorSeed, setGeneratorSeed] = useState("#2563eb");
  const [generatorHarmony, setGeneratorHarmony] = useState<HarmonyMode>("complementary");
  const [generatorIsDark, setGeneratorIsDark] = useState(true);

  useMemo(() => {
    if (customThemeTokens) {
      setCustomTokens(customThemeTokens);
    }
  }, [customThemeTokens]);

  const handleUpdateCustomToken = (tokenKey: keyof EditorThemeTokens, newHex: string) => {
    const updated = { ...customTokens, [tokenKey]: newHex };
    setCustomTokens(updated);
    onCustomThemeChange?.(updated);
    onPaletteSelect?.("custom");
  };

  const handleGenerateHarmonic = () => {
    const generated = generateHarmonicPalette(generatorSeed, generatorHarmony, generatorIsDark);
    setCustomTokens(generated);
    onCustomThemeChange?.(generated);
    onPaletteSelect?.("custom");
    showNotification(`Generated ${generatorHarmony} palette!`);
  };

  const handleRandomHarmonic = () => {
    const random = generateRandomHarmonicPalette();
    setCustomTokens(random.tokens);
    setGeneratorSeed(random.tokens.accent);
    onCustomThemeChange?.(random.tokens);
    onPaletteSelect?.("custom");
    showNotification(`Generated "${random.name}" palette!`);
  };

  const handleApplyTrending = (palette: (typeof TRENDING_ALGORITHMIC_PALETTES)[number]) => {
    setCustomTokens(palette.tokens);
    setGeneratorSeed(palette.tokens.accent);
    onCustomThemeChange?.(palette.tokens);
    onPaletteSelect?.("custom");
    showNotification(`Applied "${palette.name}" palette!`);
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
  const handleSelectPalette = (paletteId: string, paletteName: string) => {
    onPaletteSelect?.(paletteId);
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
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* SECTION 1: DEFAULT 2 THEMES */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "11px", fontWeight: 900, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Default Presets (இயல்புநிலை)
                  </span>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: "#94a3b8" }}>2 Themes</span>
                </div>

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
                          padding: "12px 14px",
                          borderRadius: "16px",
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
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 900, color: "#0f172a" }}>{theme.name}</span>
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 800,
                                padding: "2px 6px",
                                borderRadius: "6px",
                                backgroundColor: theme.id === "black-and-white" ? "#000000" : "#f1f5f9",
                                color: theme.id === "black-and-white" ? "#ffffff" : "#0f172a",
                                border: "1px solid #cbd5e1",
                              }}
                            >
                              {theme.id === "black-and-white" ? "Dark Base" : "Light Base"}
                            </span>
                          </div>
                          <span style={{ fontSize: "11px", color: "#64748b", lineHeight: 1.3 }}>{theme.description}</span>
                          <div style={{ display: "flex", flexDirection: "row", gap: "6px", marginTop: "2px" }}>
                            <span
                              style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                backgroundColor: theme.swatch.base,
                                border: "1px solid #cbd5e1",
                              }}
                            />
                            <span
                              style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                backgroundColor: theme.swatch.accent,
                                border: "1px solid #cbd5e1",
                              }}
                            />
                          </div>
                        </div>
                        {isSelected && <Check style={{ width: "18px", height: "18px", color: "#0f172a", flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: CUSTOM COLOR ADJUSTERS */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "14px",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sliders style={{ width: "14px", height: "14px", color: "#0f172a" }} />
                    <span style={{ fontSize: "12px", fontWeight: 900, color: "#0f172a" }}>
                      Customize Colors (வண்ண தேர்வு)
                    </span>
                  </div>
                  {activePaletteId === "custom" && (
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
                      Active
                    </span>
                  )}
                </div>

                <p style={{ fontSize: "11px", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                  Adjust individual colors using the color swatches or Hex input:
                </p>

                {/* Adjuster Rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(
                    [
                      { key: "accent" as const, label: "Brand Accent", desc: "Buttons & active states" },
                      { key: "accentSoft" as const, label: "Accent Soft", desc: "Hover & badge highlights" },
                      { key: "surface" as const, label: "Page Background", desc: "Main canvas background" },
                      { key: "surfaceRaised" as const, label: "Card / Panel", desc: "Cards & elevated blocks" },
                      { key: "text" as const, label: "Main Text", desc: "Headlines & copy" },
                      { key: "textMuted" as const, label: "Muted Text", desc: "Secondary text & captions" },
                      { key: "header" as const, label: "Header & Nav", desc: "Top navigation bar" },
                    ] as const
                  ).map((item) => {
                    const currentColor = customTokens[item.key] || "#000000";
                    const hexValue = currentColor.startsWith("#") ? currentColor : "#000000";

                    return (
                      <div
                        key={item.key}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          borderRadius: "10px",
                          backgroundColor: "#f8fafc",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a" }}>{item.label}</span>
                          <span style={{ fontSize: "10px", color: "#64748b" }}>{item.desc}</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {/* Interactive Color Box */}
                          <label
                            style={{
                              position: "relative",
                              width: "30px",
                              height: "30px",
                              borderRadius: "8px",
                              backgroundColor: currentColor,
                              border: "1.5px solid #cbd5e1",
                              cursor: "pointer",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                              display: "block",
                              flexShrink: 0,
                            }}
                            title={`Click to pick ${item.label}`}
                          >
                            <input
                              type="color"
                              value={hexValue}
                              onChange={(e) => handleUpdateCustomToken(item.key, e.target.value)}
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

                          {/* Hex Input */}
                          <input
                            type="text"
                            value={currentColor}
                            onChange={(e) => handleUpdateCustomToken(item.key, e.target.value)}
                            maxLength={9}
                            style={{
                              width: "72px",
                              height: "28px",
                              borderRadius: "6px",
                              border: "1px solid #cbd5e1",
                              padding: "0 4px",
                              fontSize: "11px",
                              fontFamily: "monospace",
                              fontWeight: 700,
                              color: "#0f172a",
                              backgroundColor: "#ffffff",
                              textAlign: "center",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reset Base Buttons */}
                <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTokens(DEFAULT_DUAL_THEMES[0]!.tokens);
                      onCustomThemeChange?.(DEFAULT_DUAL_THEMES[0]!.tokens);
                      onPaletteSelect?.("custom");
                      showNotification("Reset to Black & White base");
                    }}
                    style={{
                      flex: 1,
                      height: "30px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    Reset (Black)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomTokens(DEFAULT_DUAL_THEMES[1]!.tokens);
                      onCustomThemeChange?.(DEFAULT_DUAL_THEMES[1]!.tokens);
                      onPaletteSelect?.("custom");
                      showNotification("Reset to White & Black base");
                    }}
                    style={{
                      flex: 1,
                      height: "30px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    Reset (White)
                  </button>
                </div>
              </div>

              {/* SECTION 3: ALGORITHMIC COLOR GENERATOR */}
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "14px",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles style={{ width: "14px", height: "14px", color: "#6366f1" }} />
                    <span style={{ fontSize: "12px", fontWeight: 900, color: "#0f172a" }}>
                      Harmonic Palette Algorithm
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRandomHarmonic}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      backgroundColor: "#eef2ff",
                      color: "#4f46e5",
                      border: "1px solid #c7d2fe",
                      borderRadius: "8px",
                      padding: "4px 8px",
                      fontSize: "10px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                    title="Generate Random Harmonious Palette"
                  >
                    <Wand2 style={{ width: "11px", height: "11px" }} />
                    <span>Shuffle</span>
                  </button>
                </div>

                <p style={{ fontSize: "11px", color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                  Color theory algorithms (HSL color wheel & WCAG contrast) mathematically calculate balanced harmonies.
                </p>

                {/* Seed Picker & Harmony Selection */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#334155" }}>Seed Base Color:</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <label
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          backgroundColor: generatorSeed,
                          border: "1px solid #cbd5e1",
                          cursor: "pointer",
                          display: "block",
                          position: "relative",
                        }}
                      >
                        <input
                          type="color"
                          value={generatorSeed}
                          onChange={(e) => setGeneratorSeed(e.target.value)}
                          style={{ opacity: 0, width: "100%", height: "100%", position: "absolute", cursor: "pointer" }}
                        />
                      </label>
                      <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 700, color: "#475569" }}>
                        {generatorSeed}
                      </span>
                    </div>
                  </div>

                  {/* Harmony Mode Pills */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                    {(
                      [
                        { id: "complementary", label: "Complementary" },
                        { id: "analogous", label: "Analogous" },
                        { id: "triadic", label: "Triadic" },
                        { id: "monochromatic", label: "Monochrome" },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setGeneratorHarmony(m.id)}
                        style={{
                          padding: "6px 4px",
                          borderRadius: "8px",
                          fontSize: "10px",
                          fontWeight: 800,
                          border: generatorHarmony === m.id ? "1.5px solid #4f46e5" : "1px solid #e2e8f0",
                          backgroundColor: generatorHarmony === m.id ? "#eef2ff" : "#ffffff",
                          color: generatorHarmony === m.id ? "#4f46e5" : "#64748b",
                          cursor: "pointer",
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* Dark/Light Mode Pill */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setGeneratorIsDark(true)}
                      style={{
                        flex: 1,
                        padding: "5px",
                        borderRadius: "8px",
                        fontSize: "10px",
                        fontWeight: 800,
                        border: generatorIsDark ? "1.5px solid #0f172a" : "1px solid #e2e8f0",
                        backgroundColor: generatorIsDark ? "#0f172a" : "#ffffff",
                        color: generatorIsDark ? "#ffffff" : "#64748b",
                        cursor: "pointer",
                      }}
                    >
                      Dark Surface
                    </button>
                    <button
                      type="button"
                      onClick={() => setGeneratorIsDark(false)}
                      style={{
                        flex: 1,
                        padding: "5px",
                        borderRadius: "8px",
                        fontSize: "10px",
                        fontWeight: 800,
                        border: !generatorIsDark ? "1.5px solid #0f172a" : "1px solid #e2e8f0",
                        backgroundColor: !generatorIsDark ? "#0f172a" : "#ffffff",
                        color: !generatorIsDark ? "#ffffff" : "#64748b",
                        cursor: "pointer",
                      }}
                    >
                      Light Surface
                    </button>
                  </div>

                  {/* Generate Button */}
                  <button
                    type="button"
                    onClick={handleGenerateHarmonic}
                    style={{
                      height: "36px",
                      borderRadius: "10px",
                      backgroundColor: "#4f46e5",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: 800,
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 2px 4px rgba(79,70,229,0.25)",
                    }}
                  >
                    <Sparkles style={{ width: "13px", height: "13px" }} />
                    <span>Generate Harmonic Palette</span>
                  </button>
                </div>

                {/* Trending Algorithmic Palettes */}
                <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Online / Trending Palettes
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    {TRENDING_ALGORITHMIC_PALETTES.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleApplyTrending(p)}
                        style={{
                          padding: "8px",
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          backgroundColor: "#f8fafc",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "4px",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              backgroundColor: p.swatch.base,
                              border: "1px solid #cbd5e1",
                            }}
                          />
                          <span
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "50%",
                              backgroundColor: p.swatch.accent,
                              border: "1px solid #cbd5e1",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "10px", fontWeight: 800, color: "#0f172a" }}>{p.name}</span>
                        <span style={{ fontSize: "9px", color: "#64748b" }}>{p.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FONTS TAB */}
          {activeTab === "fonts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                <span style={{ fontSize: "11px", fontWeight: 900, color: "#475569", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  Google Fonts (12 Styles)
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
