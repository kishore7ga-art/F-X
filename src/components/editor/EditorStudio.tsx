"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Eye, Sparkles, Layout, RefreshCw, Layers } from "lucide-react";
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
<section style="background: #000000; color: #ffffff; padding: 80px 24px; text-align: center; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
  <div style="max-width: 900px; margin: 0 auto;">
    <h1 style="font-size: 48px; font-weight: 900;">Academic Campus Portal</h1>
  </div>
</section>`;

const PAGE_SECTION_TEMPLATES: Record<string, string> = {
  "/home": `<!-- Home Page Section -->
<section style="background: #000000; color: #ffffff; padding: 90px 24px; text-align: center; font-family: system-ui, -apple-system, sans-serif; width: 100%; box-sizing: border-box;">
  <div style="max-width: 950px; margin: 0 auto;">
    <span style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); padding: 6px 20px; border-radius: 9999px; font-size: 12px; font-weight: 800; color: #ffffff; letter-spacing: 0.1em; text-transform: uppercase;">
      Official Campus Portal
    </span>
    <h1 style="font-size: 52px; font-weight: 900; margin-top: 24px; line-height: 1.1; color: #ffffff; letter-spacing: -0.03em;">
      Excellence in Higher Education & Global Innovation
    </h1>
    <p style="font-size: 17px; color: #a1a1aa; margin-top: 18px; line-height: 1.6; max-width: 720px; margin-left: auto; margin-right: auto;">
      Empowering future leaders with world-class faculty, modern research laboratories, and vibrant campus life.
    </p>
    <div style="margin-top: 36px; display: flex; justify-content: center; gap: 16px;">
      <a href="#explore" style="background: #ffffff; color: #000000; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 900; text-decoration: none; display: inline-block;">Explore Programs</a>
      <a href="#contact" style="background: transparent; border: 1px solid rgba(255,255,255,0.25); color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 900; text-decoration: none; display: inline-block;">Contact Us</a>
    </div>
  </div>
</section>`,

  "/about": `<!-- About Us Page Section -->
<section style="background: #0f172a; color: #ffffff; padding: 80px 24px; font-family: system-ui, -apple-system, sans-serif; width: 100%; box-sizing: border-box;">
  <div style="max-width: 900px; margin: 0 auto; text-align: center;">
    <span style="color: #38bdf8; font-size: 12px; font-weight: 800; uppercase; tracking: 0.1em;">OUR HERITAGE & VISION</span>
    <h2 style="font-size: 40px; font-weight: 900; margin-top: 16px; color: #ffffff;">About Our Institution</h2>
    <p style="font-size: 16px; color: #94a3b8; margin-top: 16px; line-height: 1.7;">
      Founded with a commitment to academic rigor and societal advancement, our university nurtures critical thinkers, groundbreaking researchers, and compassionate leaders.
    </p>
    <div style="margin-top: 40px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
      <div style="background: #1e293b; padding: 24px; border-radius: 16px; text-align: center;">
        <h3 style="font-size: 32px; font-weight: 900; color: #38bdf8;">100+</h3>
        <p style="font-size: 13px; color: #cbd5e1; margin-top: 8px;">Years of Academic Excellence</p>
      </div>
      <div style="background: #1e293b; padding: 24px; border-radius: 16px; text-align: center;">
        <h3 style="font-size: 32px; font-weight: 900; color: #38bdf8;">25,000+</h3>
        <p style="font-size: 13px; color: #cbd5e1; margin-top: 8px;">Active Campus Students</p>
      </div>
      <div style="background: #1e293b; padding: 24px; border-radius: 16px; text-align: center;">
        <h3 style="font-size: 32px; font-weight: 900; color: #38bdf8;">98%</h3>
        <p style="font-size: 13px; color: #cbd5e1; margin-top: 8px;">Graduate Career Placement</p>
      </div>
    </div>
  </div>
</section>`,

  "/academics": `<!-- Academics Page Section -->
<section style="background: #020617; color: #ffffff; padding: 80px 24px; font-family: system-ui, -apple-system, sans-serif; width: 100%; box-sizing: border-box;">
  <div style="max-width: 950px; margin: 0 auto;">
    <div style="text-align: center;">
      <span style="color: #a855f7; font-size: 12px; font-weight: 800; text-transform: uppercase;">ACADEMIC DEPARTMENTS</span>
      <h2 style="font-size: 40px; font-weight: 900; margin-top: 12px; color: #ffffff;">Programs & Curriculum</h2>
      <p style="font-size: 15px; color: #94a3b8; margin-top: 12px;">Discover world-class undergraduate, postgraduate, and doctoral degrees.</p>
    </div>
    <div style="margin-top: 40px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
      <div style="border: 1px solid #1e293b; background: #0f172a; padding: 28px; border-radius: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: #ffffff;">School of Engineering & Tech</h3>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 10px; line-height: 1.6;">Computer Science, Artificial Intelligence, Robotics, and Civil Engineering.</p>
      </div>
      <div style="border: 1px solid #1e293b; background: #0f172a; padding: 28px; border-radius: 16px;">
        <h3 style="font-size: 20px; font-weight: 800; color: #ffffff;">School of Medical Sciences</h3>
        <p style="font-size: 13px; color: #94a3b8; margin-top: 10px; line-height: 1.6;">Clinical Medicine, Nursing, Pharmacy, and Biomedical Research.</p>
      </div>
    </div>
  </div>
</section>`,

  "/admissions": `<!-- Admissions Page Section -->
<section style="background: #09090b; color: #ffffff; padding: 80px 24px; font-family: system-ui, -apple-system, sans-serif; width: 100%; box-sizing: border-box;">
  <div style="max-width: 850px; margin: 0 auto; text-align: center;">
    <span style="background: #27272a; color: #a1a1aa; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase;">
      ADMISSIONS 2026-2027 NOW OPEN
    </span>
    <h2 style="font-size: 42px; font-weight: 900; margin-top: 20px; color: #ffffff;">Join Our Next Academic Cohort</h2>
    <p style="font-size: 15px; color: #71717a; margin-top: 14px; line-height: 1.6;">
      Begin your application process today. Explore entrance requirements, financial aid, and campus visits.
    </p>
    <div style="margin-top: 32px; background: #18181b; padding: 32px; border-radius: 20px; border: 1px solid #27272a; text-align: left;">
      <h3 style="font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 16px;">Application Deadlines</h3>
      <ul style="color: #a1a1aa; font-size: 14px; line-height: 2;">
        <li>✔ Early Action Deadline: <strong>November 15</strong></li>
        <li>✔ Regular Decision Deadline: <strong>January 31</strong></li>
        <li>✔ International Student Applications: <strong>February 28</strong></li>
      </ul>
    </div>
  </div>
</section>`,

  "/contact": `<!-- Contact Us Page Section -->
<section style="background: #000000; color: #ffffff; padding: 80px 24px; font-family: system-ui, -apple-system, sans-serif; width: 100%; box-sizing: border-box;">
  <div style="max-width: 900px; margin: 0 auto; text-align: center;">
    <span style="color: #22c55e; font-size: 12px; font-weight: 800; text-transform: uppercase;">GET IN TOUCH</span>
    <h2 style="font-size: 40px; font-weight: 900; margin-top: 12px; color: #ffffff;">Contact Campus Administration</h2>
    <p style="font-size: 15px; color: #a1a1aa; margin-top: 12px;">We are here to answer your queries regarding admissions, visits, and campus info.</p>
    <div style="margin-top: 36px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
      <div style="background: #18181b; padding: 24px; border-radius: 16px; border: 1px solid #27272a;">
        <h4 style="font-size: 14px; font-weight: 800; color: #ffffff;">Campus Address</h4>
        <p style="font-size: 12px; color: #a1a1aa; margin-top: 8px;">100 University Boulevard, Education District</p>
      </div>
      <div style="background: #18181b; padding: 24px; border-radius: 16px; border: 1px solid #27272a;">
        <h4 style="font-size: 14px; font-weight: 800; color: #ffffff;">Helpline Phone</h4>
        <p style="font-size: 12px; color: #a1a1aa; margin-top: 8px;">+1 (800) 555-COLLEGE</p>
      </div>
      <div style="background: #18181b; padding: 24px; border-radius: 16px; border: 1px solid #27272a;">
        <h4 style="font-size: 14px; font-weight: 800; color: #ffffff;">Email Inquiry</h4>
        <p style="font-size: 12px; color: #a1a1aa; margin-top: 8px;">admissions@university.edu</p>
      </div>
    </div>
  </div>
</section>`,
};

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

  // Active Page State
  const [currentPage, setCurrentPage] = useState({ name: "Home", slug: "/home" });

  // Fetch sections/templates added by Admin in the Database
  const fetchDbSections = async (slug: string = "/home") => {
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
            code: tpl.code || (PAGE_SECTION_TEMPLATES[slug] || PAGE_SECTION_TEMPLATES["/home"]),
            variantIndex: 0,
          }));
          setSections(dbSections);
          setActiveSectionIndex(0);
          return;
        }
      }

      // Fallback page-specific template code
      const pageCode = PAGE_SECTION_TEMPLATES[slug] || PAGE_SECTION_TEMPLATES["/home"];
      setSections([
        { id: `page-${slug}`, title: `${currentPage.name} Banner`, code: pageCode, variantIndex: 0 },
      ]);
      setActiveSectionIndex(0);
    } catch {
      const pageCode = PAGE_SECTION_TEMPLATES[slug] || PAGE_SECTION_TEMPLATES["/home"];
      setSections([
        { id: `page-${slug}`, title: `${currentPage.name} Banner`, code: pageCode, variantIndex: 0 },
      ]);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    void fetchDbSections(currentPage.slug);
  }, [currentPage.slug]);

  const handlePageChange = (pageName: string, pageSlug: string) => {
    setCurrentPage({ name: pageName, slug: pageSlug });
    const pageCode = PAGE_SECTION_TEMPLATES[pageSlug] || `<!-- ${pageName} Section -->
<section style="background: #09090b; color: #ffffff; padding: 90px 24px; text-align: center; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
  <div style="max-width: 850px; margin: 0 auto;">
    <span style="background: #27272a; color: #a1a1aa; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase;">
      ${pageName.toUpperCase()} PAGE
    </span>
    <h1 style="font-size: 46px; font-weight: 900; margin-top: 20px; color: #ffffff;">${pageName}</h1>
    <p style="font-size: 16px; color: #71717a; margin-top: 14px;">Welcome to the official ${pageName} portal page for ${collegeName}.</p>
  </div>
</section>`;

    setSections([
      { id: `sec-${pageSlug}-${Date.now()}`, title: `${pageName} Section`, code: pageCode, variantIndex: 0 }
    ]);
    setActiveSectionIndex(0);
  };

  const handleAddSection = () => {
    const newId = `sec-${sections.length + 1}`;
    setSections([
      ...sections,
      { id: newId, title: `${currentPage.name} Section #${sections.length + 1}`, code: DEFAULT_STARTER_CODE, variantIndex: 0 },
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
      ? "max-w-6xl"
      : viewport === "tablet"
      ? "max-w-2xl"
      : "max-w-sm";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans relative overflow-x-hidden select-none">
      
      {/* Top Navbar Header */}
      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <img src="/xite-logo.png" alt="XITE Logo" className="h-7 w-7 object-contain rounded-md" />
            <span className="text-base font-black tracking-tight text-slate-900">XITE</span>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-extrabold bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Editing Page: <strong>{currentPage.name}</strong> <code className="text-[10px] text-blue-600">({currentPage.slug})</code></span>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDbSections(currentPage.slug)}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            title="Sync with Admin DB"
          >
            <RefreshCw className={`w-4 h-4 ${loadingDb ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold transition-all shadow-sm cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visit Live Site ↗</span>
          </button>
          <UserProfileMenu collegeName={collegeName} />
        </div>
      </header>

      {/* Main White Canvas Workspace */}
      <main className="flex-1 w-full bg-white p-4 sm:p-8 flex flex-col items-center justify-start pb-32">
        <div
          className={`w-full ${viewportWidthClass} transition-all duration-300 min-h-[70vh] flex flex-col items-center justify-start`}
        >
          {sections.length === 0 ? (
            /* Empty Canvas State */
            <div className="my-16 text-center space-y-4 max-w-md p-8 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-700">
                <Layout className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Empty Page Canvas</h2>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                No sections have been added for page {currentPage.name}. Click below to add sections to this page.
              </p>
              <button
                onClick={handleAddSection}
                className="inline-flex items-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Section</span>
              </button>
            </div>
          ) : (
            /* Pure Section Rendering for Current Page */
            <div className="w-full">
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  onClick={() => setActiveSectionIndex(idx)}
                  className="w-full cursor-pointer relative"
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: sec.code }}
                    className="w-full overflow-hidden"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Side Drawer Panel */}
      <DrawerPanel
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onPageSelect={handlePageChange}
      />

      {/* Domain Settings Modal */}
      <DomainSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        subdomain={subdomain}
      />

      {/* Floating Bottom Toolbar Dock */}
      <EditorToolbar
        onOpenSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        isSettingsOpen={isSettingsOpen}
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
