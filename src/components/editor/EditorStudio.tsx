"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Eye,
  Sparkles,
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
} from "lucide-react";
import { EditorToolbar } from "./EditorToolbar";
import { DrawerPanel } from "./DrawerPanel";
import { DomainSettingsModal } from "./DomainSettingsModal";
import { UserProfileMenu } from "./UserProfileMenu";

interface SectionItem {
  id: string;
  title: string;
  code: string;
  variantIndex: number;
}

const SECTION_CATEGORIES = [
  { id: "hero", name: "Hero Banner", description: "Lead banner, masthead & title headline", icon: Layout },
  { id: "about", name: "About Us", description: "College history, mission statement & quote", icon: Info },
  { id: "courses", name: "Academics & Courses", description: "Degree programs & department grid", icon: GraduationCap },
  { id: "faculty", name: "Faculty Roster", description: "Professors & department heads", icon: Users },
  { id: "events", name: "Events & News", description: "Upcoming campus events & news highlights", icon: Calendar },
  { id: "contact", name: "Contact & Map", description: "Campus address, helpline & interactive map", icon: Mail },
  { id: "placements", name: "Placements & Careers", description: "Placement stats & top recruiters", icon: Briefcase },
  { id: "scholarships", name: "Scholarships & Grants", description: "Merit scholarships & financial aid", icon: Award },
];

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
  const [viewportWidth, setViewportWidth] = useState<string>("100%");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [adminDbTemplates, setAdminDbTemplates] = useState<any[]>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(0);
  const [loadingDb, setLoadingDb] = useState(true);

  // Section Selector Modal & Notification Toast
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
          setAdminDbTemplates(data.templates);
          const firstTpl = data.templates[0];
          setSections([
            {
              id: firstTpl.id || `db-0`,
              title: firstTpl.name || "Hero Section",
              code: firstTpl.code || (PAGE_SECTION_TEMPLATES[slug] || PAGE_SECTION_TEMPLATES["/home"]),
              variantIndex: 0,
            },
          ]);
          setActiveSectionIndex(0);
          return;
        }
      }

      setAdminDbTemplates([]);
      const pageCode = PAGE_SECTION_TEMPLATES[slug] || PAGE_SECTION_TEMPLATES["/home"];
      setSections([
        { id: `page-${slug}`, title: `${currentPage.name} Banner`, code: pageCode, variantIndex: 0 },
      ]);
      setActiveSectionIndex(0);
    } catch {
      setAdminDbTemplates([]);
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

  // Select section category in modal: STRICTLY only add if admin added a section for THAT category!
  const handleSelectSectionCategory = (cat: typeof SECTION_CATEGORIES[0]) => {
    setShowAddSectionModal(false);

    // Strictly find admin-added template matching the selected category
    const matchingAdminTemplate = adminDbTemplates.find((tpl) => {
      const nameLower = (tpl.name || "").toLowerCase();
      const catIdLower = cat.id.toLowerCase();
      const catNameLower = cat.name.toLowerCase();
      return (
        nameLower.includes(`[${catIdLower}]`) ||
        nameLower.includes(catIdLower) ||
        nameLower.includes(catNameLower)
      );
    });

    if (matchingAdminTemplate && matchingAdminTemplate.code) {
      const newSection: SectionItem = {
        id: `sec-${Date.now()}`,
        title: matchingAdminTemplate.name,
        code: matchingAdminTemplate.code,
        variantIndex: 0,
      };
      setSections((prev) => [...prev, newSection]);
      setActiveSectionIndex(sections.length);
      showToast(`Added Admin Section: "${matchingAdminTemplate.name}"`);
    } else {
      // STRICT: NO MATCHING SECTION ADDED BY ADMIN -> DO NOT ADD ANYTHING!
      showToast(`No "${cat.name}" section has been added in Admin Panel yet. Please upload code for "${cat.name}" in Admin Control Room first!`);
    }
  };

  // Swap / Cycle between admin-added section variants or layout variations
  const handleSwapVariant = () => {
    if (activeSectionIndex === null || sections.length === 0) return;

    const activeSec = sections[activeSectionIndex];
    if (!activeSec) return;

    // If Admin DB has multiple templates, cycle through DB templates
    if (adminDbTemplates.length > 1) {
      const currentIdx = activeSec.variantIndex !== undefined ? activeSec.variantIndex : 0;
      const nextIdx = (currentIdx + 1) % adminDbTemplates.length;
      const nextTpl = adminDbTemplates[nextIdx]!;

      setSections((prev) =>
        prev.map((sec, idx) => {
          if (idx !== activeSectionIndex) return sec;
          return {
            ...sec,
            title: nextTpl.name,
            code: nextTpl.code || sec.code,
            variantIndex: nextIdx,
          };
        })
      );
      showToast(`Swapped section to: "${nextTpl.name}"`);
      return;
    }

    // Fallback: Cycle visual layout variations (Centered -> Left Aligned -> Slate Dark)
    const currentIdx = activeSec.variantIndex !== undefined ? activeSec.variantIndex : 0;
    const nextIdx = (currentIdx + 1) % 3;

    let newCode = activeSec.code;
    if (nextIdx === 1) {
      newCode = activeSec.code
        .replace(/text-align:\s*center/gi, "text-align: left")
        .replace(/margin:\s*0\s+auto/gi, "margin: 0");
    } else if (nextIdx === 2) {
      newCode = activeSec.code
        .replace(/background:\s*#000000/gi, "background: #0f172a")
        .replace(/background:\s*#09090b/gi, "background: #1e1b4b");
    } else {
      newCode = activeSec.code
        .replace(/text-align:\s*left/gi, "text-align: center")
        .replace(/background:\s*#0f172a/gi, "background: #000000")
        .replace(/background:\s*#1e1b4b/gi, "background: #000000");
    }

    const baseTitle = activeSec.title.split(" (Variant")[0];
    const newTitle = `${baseTitle} (Variant ${nextIdx + 1})`;

    setSections((prev) =>
      prev.map((sec, idx) => {
        if (idx !== activeSectionIndex) return sec;
        return {
          ...sec,
          title: newTitle,
          code: newCode,
          variantIndex: nextIdx,
        };
      })
    );

    showToast(`Swapped layout to Variant ${nextIdx + 1}`);
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
    setSections((prev) => [
      ...prev.slice(0, activeSectionIndex + 1),
      duplicated,
      ...prev.slice(activeSectionIndex + 1),
    ]);
    setActiveSectionIndex(activeSectionIndex + 1);
  };

  const handleDeleteSection = () => {
    if (activeSectionIndex === null || sections.length === 0) return;
    setSections((prev) => prev.filter((_, idx) => idx !== activeSectionIndex));
    setActiveSectionIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
  };

  const handleMoveUp = () => {
    if (activeSectionIndex === null || activeSectionIndex <= 0) return;
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[activeSectionIndex];
      copy[activeSectionIndex] = copy[activeSectionIndex - 1];
      copy[activeSectionIndex - 1] = temp;
      return copy;
    });
    setActiveSectionIndex((prev) => (prev !== null ? prev - 1 : null));
  };

  const handleMoveDown = () => {
    if (activeSectionIndex === null || activeSectionIndex >= sections.length - 1) return;
    setSections((prev) => {
      const copy = [...prev];
      const temp = copy[activeSectionIndex];
      copy[activeSectionIndex] = copy[activeSectionIndex + 1];
      copy[activeSectionIndex + 1] = temp;
      return copy;
    });
    setActiveSectionIndex((prev) => (prev !== null ? prev + 1 : null));
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans relative overflow-x-hidden select-none">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

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
      <main
        onClick={() => setActiveSectionIndex(null)}
        className="flex-1 w-full bg-slate-100 p-4 sm:p-8 flex flex-col items-center justify-start pb-32 cursor-pointer"
      >
        <div
          className="transition-all duration-300 min-h-[70vh] flex flex-col items-center justify-start mx-auto bg-white shadow-xl rounded-none border-x border-slate-200"
          style={{ width: viewportWidth, maxWidth: "100%" }}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddSectionModal(true);
                }}
                className="inline-flex items-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
            </div>
          ) : (
            /* Pure Section Rendering for Current Page */
            <div className="w-full">
              {sections.map((sec, idx) => (
                <div
                  key={sec.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSectionIndex(idx);
                  }}
                  className={`w-full cursor-pointer relative transition-all ${
                    activeSectionIndex === idx ? "ring-2 ring-blue-600 ring-offset-2 z-10" : ""
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: sec.code }}
                    className="w-full overflow-hidden"
                  />
                </div>
              ))}

              {/* Empty Space + Add Section Button */}
              <div className="w-full py-12 flex flex-col items-center justify-center bg-slate-50/70 border-t border-b border-dashed border-slate-300 my-6 rounded-2xl">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddSectionModal(true);
                  }}
                  className="group flex items-center gap-2 bg-[#0f172a] hover:bg-[#1e293b] text-white font-black text-xs px-6 py-3 rounded-full shadow-lg transition-all border border-slate-700 hover:scale-105 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-blue-400 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Add Section</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Select Section Category Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl space-y-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">What section do you want to add?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select a category. Only sections added in the Admin Control Room will be added.</p>
              </div>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Grid */}
            <div className="grid gap-3 sm:grid-cols-2 max-h-[50vh] overflow-y-auto pr-1">
              {SECTION_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const hasAdminSection = adminDbTemplates.some(
                  (tpl) =>
                    tpl.name.toLowerCase().includes(cat.id) ||
                    tpl.name.toLowerCase().includes(cat.name.toLowerCase())
                ) || adminDbTemplates.length > 0;

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectSectionCategory(cat)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                      hasAdminSection
                        ? "bg-slate-50 border-slate-200 hover:border-slate-900 hover:bg-slate-100 shadow-sm"
                        : "bg-slate-50/50 border-slate-200/60 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black text-slate-900">{cat.name}</h4>
                          {!hasAdminSection && (
                            <span className="text-[9px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Requires Admin DB
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{cat.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
        viewportWidth={viewportWidth}
        setViewportWidth={setViewportWidth}
        activeSectionTitle={activeSectionIndex !== null && sections[activeSectionIndex] ? sections[activeSectionIndex]?.title : "Hero"}
        hasSections={sections.length > 0}
        isSectionSelected={activeSectionIndex !== null}
        onAddSection={() => setShowAddSectionModal(true)}
        onDuplicateSection={handleDuplicateSection}
        onSwapVariant={handleSwapVariant}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onDeleteSection={handleDeleteSection}
      />

    </div>
  );
}
