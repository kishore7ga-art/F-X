"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Sparkles, Layout, RefreshCw } from "lucide-react";
import { EditorToolbar } from "./EditorToolbar";
import { DrawerPanel } from "./DrawerPanel";
import { DomainSettingsModal } from "./DomainSettingsModal";
import { UserProfileMenu } from "./UserProfileMenu";

type ViewportMode = "desktop" | "tablet" | "mobile";

interface SectionItem {
  id: string;
  title: string;
  code: string;
  variantIndex: number;
}

const DEFAULT_STARTER_CODE = `<!-- Default Hero Section -->
<section style="background: #000000; color: #ffffff; padding: 100px 24px; text-align: center; font-family: system-ui, -apple-system, sans-serif; width: 100%; box-sizing: border-box;">
  <div style="max-width: 1000px; margin: 0 auto;">
    <span style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); padding: 6px 20px; border-radius: 9999px; font-size: 12px; font-weight: 800; color: #ffffff; letter-spacing: 0.1em; text-transform: uppercase;">
      Official Campus Portal
    </span>
    <h1 style="font-size: 54px; font-weight: 900; margin-top: 24px; line-height: 1.1; color: #ffffff; letter-spacing: -0.03em;">
      Excellence in Higher Education & Innovation
    </h1>
    <p style="font-size: 17px; color: #a1a1aa; margin-top: 18px; line-height: 1.6; max-width: 720px; margin-left: auto; margin-right: auto;">
      Empowering minds, advancing research, and building leaders for tomorrow's challenges.
    </p>
    <div style="margin-top: 36px; display: flex; justify-content: center; gap: 16px;">
      <a href="#explore" style="background: #ffffff; color: #000000; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 900; text-decoration: none; display: inline-block;">Explore Programs</a>
      <a href="#contact" style="background: transparent; border: 1px solid rgba(255,255,255,0.25); color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 900; text-decoration: none; display: inline-block;">Contact Us</a>
    </div>
  </div>
</section>`;

interface EditorStudioProps {
  subdomain?: string;
  collegeName?: string;
}

export function EditorStudio({
  subdomain = "greenfield",
  collegeName = "Greenfield University",
}: EditorStudioProps) {
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [loadingDb, setLoadingDb] = useState(true);

  // Fetch sections/templates added by Admin in the Database
  const fetchDbSections = async () => {
    try {
      setLoadingDb(true);
      const res = await fetch("/api/v1/admin/templates", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.templates && data.templates.length > 0) {
          const dbSections: SectionItem[] = data.templates.map((tpl: any, idx: number) => ({
            id: tpl.id || `db-${idx}`,
            title: tpl.name || `Admin Section #${idx + 1}`,
            code: tpl.code || DEFAULT_STARTER_CODE,
            variantIndex: 0,
          }));
          setSections(dbSections);
          setActiveSectionIndex(0);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    void fetchDbSections();
  }, []);

  const handleAddSection = () => {
    const newId = `sec-${sections.length + 1}`;
    setSections([
      ...sections,
      { id: newId, title: `Hero Banner Variant #${sections.length + 1}`, code: DEFAULT_STARTER_CODE, variantIndex: 0 },
    ]);
    setActiveSectionIndex(sections.length);
  };

  const handleSwapVariant = () => {
    if (sections.length === 0) return;
    setSections((prev) =>
      prev.map((sec, idx) => {
        if (idx !== activeSectionIndex) return sec;
        return { ...sec };
      })
    );
  };

  const handleDuplicateSection = () => {
    if (sections.length === 0) return;
    const current = sections[activeSectionIndex];
    const duplicated: SectionItem = {
      id: `sec-${Date.now()}`,
      title: `${current.title} (Copy)`,
      code: current.code,
      variantIndex: current.variantIndex,
    };
    setSections((prev) => [
      ...prev.slice(0, activeSectionIndex + 1),
      duplicated,
      ...prev.slice(activeSectionIndex + 1),
    ]);
    setActiveSectionIndex(activeSectionIndex + 1);
  };

  const handleDeleteSection = () => {
    if (sections.length === 0) return;
    setSections((prev) => prev.filter((_, idx) => idx !== activeSectionIndex));
    setActiveSectionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleMoveUp = () => {
    if (activeSectionIndex <= 0) return;
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[activeSectionIndex];
      copy[activeSectionIndex] = copy[activeSectionIndex - 1];
      copy[activeSectionIndex - 1] = temp;
      return copy;
    });
    setActiveSectionIndex((prev) => prev - 1);
  };

  const handleMoveDown = () => {
    if (activeSectionIndex >= sections.length - 1) return;
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[activeSectionIndex];
      copy[activeSectionIndex] = copy[activeSectionIndex + 1];
      copy[activeSectionIndex + 1] = temp;
      return copy;
    });
    setActiveSectionIndex((prev) => prev + 1);
  };

  const viewportWidthClass =
    viewport === "desktop"
      ? "w-full"
      : viewport === "tablet"
      ? "max-w-3xl"
      : "max-w-sm";

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col font-sans relative overflow-x-hidden select-none">
      
      {/* Top Navbar Header */}
      <header className="h-16 border-b border-neutral-800 bg-black/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/xite-logo.png" alt="XITE Logo" className="h-7 w-7 object-contain rounded-md" />
            <span className="text-base font-black tracking-tight text-white">XITE</span>
          </Link>
          <div className="h-4 w-px bg-neutral-800" />
          <div className="flex items-center gap-1.5 text-xs text-white font-extrabold bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visual Live Editor Studio</span>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDbSections}
            className="p-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white transition-all cursor-pointer border border-neutral-800"
            title="Sync with Admin DB"
          >
            <RefreshCw className={`w-4 h-4 ${loadingDb ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-black transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visit Live Site ↗</span>
          </button>
          <UserProfileMenu collegeName={collegeName} />
        </div>
      </header>

      {/* Main Canvas Workspace — Completely Full Width & Edge-to-Edge with 0 Curved Corners */}
      <main className="flex-1 w-full flex flex-col items-center justify-start pb-32">
        <div
          className={`w-full ${viewportWidthClass} transition-all duration-300 min-h-[70vh] flex flex-col items-center justify-start`}
        >
          {sections.length === 0 ? (
            /* Empty Canvas State */
            <div className="my-16 text-center space-y-4 max-w-md p-8 bg-neutral-950 border border-neutral-800 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-black border border-neutral-800 flex items-center justify-center mx-auto text-white">
                <Layout className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-white">Empty Canvas Workspace</h2>
              <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                No sections have been added by admin yet. Add sections in the Admin Control Room or click below to build your canvas.
              </p>
              <button
                onClick={handleAddSection}
                className="inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-200 text-xs font-black px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Section</span>
              </button>
            </div>
          ) : (
            /* Pure Edge-to-Edge Full Width Rendered Sections (0 Rounded Corners) */
            <div className="w-full">
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  onClick={() => setActiveSectionIndex(idx)}
                  className="w-full cursor-pointer relative"
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: sec.code }}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Side Drawer Panel */}
      <DrawerPanel isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Domain Settings Modal */}
      <DomainSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        subdomain={subdomain}
      />

      {/* Floating Bottom Toolbar Dock */}
      <EditorToolbar
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        viewport={viewport}
        setViewport={setViewport}
        activeSectionTitle={sections.length > 0 ? sections[activeSectionIndex]?.title : "Hero"}
        hasSections={sections.length > 0}
        onAddSection={handleAddSection}
        onDuplicateSection={handleDuplicateSection}
        onSwapVariant={handleSwapVariant}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onDeleteSection={handleDeleteSection}
      />

    </div>
  );
}
