"use client";

import { useState } from "react";
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
} from "lucide-react";

interface DrawerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onPageSelect?: (pageName: string, pageSlug: string) => void;
  onPaletteSelect?: (paletteId: string) => void;
  onFontSelect?: (fontId: string) => void;
}

interface PageItem {
  id: string;
  name: string;
  slug: string;
  icon: any;
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

const PALETTES = [
  { id: "academic-blue", name: "Academic Navy", primary: "#0f172a", accent: "#2563eb" },
  { id: "emerald-gold", name: "Emerald & Gold", primary: "#064e3b", accent: "#f59e0b" },
  { id: "crimson-slate", name: "Crimson Maroon", primary: "#881337", accent: "#e11d48" },
  { id: "midnight-purple", name: "Midnight Obsidian", primary: "#180828", accent: "#a855f7" },
  { id: "light-minimal", name: "Minimal Light", primary: "#ffffff", accent: "#0f172a" },
];

const FONTS = [
  { id: "inter", name: "Inter", detail: "Clean modern sans-serif for high readability" },
  { id: "serif", name: "Playfair Display", detail: "Classic academic serif typography" },
  { id: "outfit", name: "Outfit & Roboto", detail: "Bold tech & modern geometric font pairing" },
];

export function DrawerPanel({
  isOpen,
  onClose,
  onPageSelect,
  onPaletteSelect,
  onFontSelect,
}: DrawerPanelProps) {
  const [activeTab, setActiveTab] = useState<"pages" | "colors" | "fonts">("pages");
  const [pages, setPages] = useState<PageItem[]>(INITIAL_PAGES);
  const [selectedPageSlug, setSelectedPageSlug] = useState("/home");
  const [selectedPalette, setSelectedPalette] = useState("academic-blue");
  const [selectedFont, setSelectedFont] = useState("inter");

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
    showNotification(`Created new page: "${newPage.name}"`);
  };

  const handleDeletePage = (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    if (pages.length <= 1) {
      showNotification("Cannot delete the last remaining page.");
      return;
    }
    setPages((prev) => prev.filter((p) => p.id !== pageId));
    showNotification("Page deleted successfully.");
  };

  const handleSelectPalette = (paletteId: string, paletteName: string) => {
    setSelectedPalette(paletteId);
    if (onPaletteSelect) onPaletteSelect(paletteId);
    showNotification(`Applied color theme: ${paletteName}`);
  };

  const handleSelectFont = (fontId: string, fontName: string) => {
    setSelectedFont(fontId);
    if (onFontSelect) onFontSelect(fontId);
    showNotification(`Applied font family: ${fontName}`);
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
                fontSize: "12px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                border: "none",
                cursor: "pointer",
                backgroundColor: activeTab === "pages" ? "#ffffff" : "transparent",
                color: activeTab === "pages" ? "#0f172a" : "#64748b",
                boxShadow: activeTab === "pages" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <Home style={{ width: "14px", height: "14px" }} />
              <span>Pages</span>
            </button>

            <button
              onClick={() => setActiveTab("colors")}
              style={{
                flex: 1,
                height: "36px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                border: "none",
                cursor: "pointer",
                backgroundColor: activeTab === "colors" ? "#ffffff" : "transparent",
                color: activeTab === "colors" ? "#0f172a" : "#64748b",
                boxShadow: activeTab === "colors" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <Palette style={{ width: "14px", height: "14px" }} />
              <span>Colors</span>
            </button>

            <button
              onClick={() => setActiveTab("fonts")}
              style={{
                flex: 1,
                height: "36px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                border: "none",
                cursor: "pointer",
                backgroundColor: activeTab === "fonts" ? "#ffffff" : "transparent",
                color: activeTab === "fonts" ? "#0f172a" : "#64748b",
                boxShadow: activeTab === "fonts" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <Type style={{ width: "14px", height: "14px" }} />
              <span>Fonts</span>
            </button>
          </div>
        </div>

        {/* Drawer Body Scroll Area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* PAGES TAB */}
          {activeTab === "pages" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {pages.map((page) => {
                const Icon = page.icon;
                const isSelected = selectedPageSlug === page.slug;
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

                    {pages.length > 1 && (
                      <button
                        onClick={(e) => handleDeletePage(e, page.id)}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                          padding: "4px",
                          borderRadius: "6px",
                        }}
                        title="Delete Page"
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
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {PALETTES.map((palette) => {
                const isSelected = selectedPalette === palette.id;
                return (
                  <div
                    key={palette.id}
                    onClick={() => handleSelectPalette(palette.id, palette.name)}
                    style={{
                      padding: "14px",
                      borderRadius: "16px",
                      backgroundColor: isSelected ? "#f8fafc" : "#ffffff",
                      border: isSelected ? "2px solid #0f172a" : "1px solid #e2e8f0",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>{palette.name}</span>
                      <div style={{ display: "flex", flexDirection: "row", gap: "6px" }}>
                        <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: palette.primary, border: "1px solid #cbd5e1" }} />
                        <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: palette.accent, border: "1px solid #cbd5e1" }} />
                      </div>
                    </div>
                    {isSelected && <Check style={{ width: "18px", height: "18px", color: "#0f172a" }} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* FONTS TAB */}
          {activeTab === "fonts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {FONTS.map((font) => {
                const isSelected = selectedFont === font.id;
                return (
                  <div
                    key={font.id}
                    onClick={() => handleSelectFont(font.id, font.name)}
                    style={{
                      padding: "14px",
                      borderRadius: "16px",
                      backgroundColor: isSelected ? "#f8fafc" : "#ffffff",
                      border: isSelected ? "2px solid #0f172a" : "1px solid #e2e8f0",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a" }}>{font.name}</span>
                      {isSelected && <Check style={{ width: "18px", height: "18px", color: "#0f172a" }} />}
                    </div>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>{font.detail}</span>
                  </div>
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
