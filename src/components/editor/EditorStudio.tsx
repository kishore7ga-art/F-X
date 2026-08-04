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
  const [settingsTab, setSettingsTab] = useState<string>("domain");
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [adminDbTemplates, setAdminDbTemplates] = useState<any[]>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(0);
  const [loadingDb, setLoadingDb] = useState(true);

  // Section Selector Modal
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  // Right-Click Link / Button Navigation Popup State
  const [linkPopup, setLinkPopup] = useState<{
    x: number;
    y: number;
    sectionIndex: number;
    targetElement: HTMLElement;
    currentUrl: string;
    isNewTab: boolean;
  } | null>(null);

  const toastMessage = null;

  const showToast = (_msg?: string) => {
    // Toast popups completely removed
  };

  // Auto-correct responsive section code for Tablet (768px) and Mobile (375px) viewports
  const autoCorrectMobileCode = (code: string, width: string) => {
    if (!code) return "";
    const isMobile = width === "320px" || width === "375px" || width === "425px";
    const isTablet = width === "640px" || width === "768px" || width === "1024px";

    if (!isMobile && !isTablet) return code;

    let corrected = code;

    if (isTablet) {
      // Auto-correct multi-column layouts for Tablet screens (max 2 columns, scaled text)
      corrected = corrected
        .replace(/grid-template-columns:\s*repeat\(\s*[4-9]\s*,\s*1fr\s*\)/gi, "grid-template-columns: repeat(2, 1fr)")
        .replace(/grid-template-columns:\s*1fr\s+1fr\s+1fr\s+1fr/gi, "grid-template-columns: 1fr 1fr")
        .replace(/font-size:\s*([4-9][0-9])px/gi, (_match, p1) => `font-size: ${Math.min(parseInt(p1, 10), 32)}px`);
    }

    if (isMobile) {
      // Auto-correct multi-column flex/grid containers for Mobile phone screens (1 column)
      corrected = corrected
        .replace(/grid-template-columns:\s*repeat\(\s*[2-9]\s*,\s*1fr\s*\)/gi, "grid-template-columns: repeat(1, 1fr)")
        .replace(/grid-template-columns:\s*1fr\s+1fr\s+1fr/gi, "grid-template-columns: 1fr")
        .replace(/grid-template-columns:\s*repeat\(\s*auto-fit\s*,\s*minmax\([^)]+\)\)/gi, "grid-template-columns: 1fr")
        .replace(/flex-direction:\s*row/gi, "flex-direction: column")
        .replace(/border-r\b/g, "border-b border-r-0")
        .replace(/border-right:[^;]+;/gi, "border-bottom: 1px solid rgba(255,255,255,0.1); border-right: none;")
        .replace(/font-size:\s*([3-9][0-9])px/gi, (_match, p1) => `font-size: ${Math.min(parseInt(p1, 10), 22)}px`);
    }

    return corrected;
  };

  // Active Page State
  const [currentPage, setCurrentPage] = useState({ name: "Home", slug: "/home" });

  // Per-Page Persistent Auto-Save Store
  const [pageStore, setPageStore] = useState<Record<string, SectionItem[]>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("xite_saved_pages");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  // Auto-save active sections to pageStore & localStorage whenever sections update
  useEffect(() => {
    if (sections.length > 0 && currentPage.slug) {
      setPageStore((prev) => {
        const updated = { ...prev, [currentPage.slug]: sections };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("xite_saved_pages", JSON.stringify(updated));
          } catch {}
        }
        return updated;
      });
    }
  }, [sections, currentPage.slug]);

  // Fetch sections/templates added by Admin in the Database
  const fetchDbSections = async (slug: string = "/home", forceSync: boolean = false) => {
    try {
      setLoadingDb(true);

      // 1. If page is already saved by user in pageStore and forceSync is false, load user's saved sections!
      const currentSaved = pageStore[slug];
      if (!forceSync && currentSaved !== undefined && Array.isArray(currentSaved)) {
        setSections(currentSaved);
        setActiveSectionIndex(currentSaved.length > 0 ? 0 : null);
        setLoadingDb(false);
        return;
      }

      let fetchedTemplates: any[] = [];
      try {
        const res = await fetch("/api/v1/admin/templates", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.templates && data.templates.length > 0) {
            fetchedTemplates = data.templates;
            setAdminDbTemplates(data.templates);
          }
        }
      } catch {}

      // 2. Fetch Admin-configured Default Website Structure for new pages
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
        const defRes = await fetch(`${apiBase}/api/v1/default-website`);
        if (defRes.ok) {
          const defData = await defRes.json();
          if (defData && Array.isArray(defData.pages)) {
            const formattedSlug = slug.startsWith("/") ? slug : `/${slug}`;
            const matchedPage = defData.pages.find(
              (p: any) => p.slug.toLowerCase() === formattedSlug.toLowerCase()
            );
            if (matchedPage && matchedPage.sections && matchedPage.sections.length > 0) {
              const loadedSections: SectionItem[] = matchedPage.sections.map((sec: any, idx: number) => ({
                id: sec.id || `def-${idx}`,
                title: sec.title || `Section #${idx + 1}`,
                code: sec.code,
                variantIndex: 0,
              }));

              setSections(loadedSections);
              setActiveSectionIndex(0);
              setPageStore((prev) => ({ ...prev, [slug]: loadedSections }));
              if (typeof window !== "undefined") {
                try {
                  localStorage.setItem("xite_saved_pages", JSON.stringify({ ...pageStore, [slug]: loadedSections }));
                } catch {}
              }
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Could not load default website config:", err);
      }

      // 2. If page is already saved in pageStore, load saved sections
      if (pageStore[slug] && pageStore[slug].length > 0) {
        setSections(pageStore[slug]);
        setActiveSectionIndex(0);
        return;
      }

      // Extract target category ID from page slug (e.g. /home -> hero, /about -> about, /academics -> courses)
      const cleanSlug = slug.replace(/^\//, "").toLowerCase();
      let targetCatId = cleanSlug;
      if (cleanSlug === "home") targetCatId = "hero";
      if (cleanSlug === "academics") targetCatId = "courses";

      // Find template matching category in fetched Admin templates
      const matchingAdminTpl = fetchedTemplates.find((tpl) => {
        const nameLower = (tpl.name || "").toLowerCase();
        return (
          nameLower.includes(`[${targetCatId}]`) ||
          nameLower.includes(targetCatId)
        );
      });

      if (matchingAdminTpl && matchingAdminTpl.code) {
        setSections([
          {
            id: matchingAdminTpl.id || `db-0`,
            title: matchingAdminTpl.name,
            code: matchingAdminTpl.code,
            variantIndex: 0,
          },
        ]);
        setActiveSectionIndex(0);
        return;
      }

      // Fallback if no matching section added in Admin yet
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
  }, []);

  const handlePageChange = (pageName: string, pageSlug: string) => {
    // 1. Auto-save current page sections first
    setPageStore((prev) => {
      const updated = { ...prev, [currentPage.slug]: sections };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("xite_saved_pages", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    // 2. Set new active page
    setCurrentPage({ name: pageName, slug: pageSlug });

    // 3. Load saved sections for target page if already in pageStore
    if (pageStore[pageSlug] && pageStore[pageSlug].length > 0) {
      setSections(pageStore[pageSlug]);
      setActiveSectionIndex(0);
      return;
    }

    // Otherwise load matching section added by Admin for target page
    const cleanSlug = pageSlug.replace(/^\//, "").toLowerCase();
    let targetCatId = cleanSlug;
    if (cleanSlug === "home") targetCatId = "hero";
    if (cleanSlug === "academics") targetCatId = "courses";

    const matchingAdminTpl = adminDbTemplates.find((tpl) => {
      const nameLower = (tpl.name || "").toLowerCase();
      return (
        nameLower.includes(`[${targetCatId}]`) ||
        nameLower.includes(targetCatId)
      );
    });

    if (matchingAdminTpl && matchingAdminTpl.code) {
      setSections([
        { id: `page-${pageSlug}`, title: matchingAdminTpl.name, code: matchingAdminTpl.code, variantIndex: 0 },
      ]);
      setActiveSectionIndex(0);
      return;
    }

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

    const initialSections = [
      { id: `page-${pageSlug}`, title: `${pageName} Banner`, code: pageCode, variantIndex: 0 },
    ];
    setSections(initialSections);
    setActiveSectionIndex(0);
  };

  // Handle double-click inline text editing directly on section canvas
  const handleSectionDoubleClick = (e: React.MouseEvent<HTMLDivElement>, sectionIndex: number) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    // Tags that can be edited inline
    const editableTags = ["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "A", "BUTTON", "LI", "STRONG", "EM", "B", "I", "TD", "TH"];

    let textElem: HTMLElement | null = target;
    while (textElem && textElem !== e.currentTarget && !editableTags.includes(textElem.tagName)) {
      textElem = textElem.parentElement;
    }

    if (!textElem || textElem === e.currentTarget) {
      textElem = target;
    }

    // Enable inline content editing
    textElem.contentEditable = "true";
    textElem.focus();

    // Visual editing indicator highlight
    textElem.style.outline = "2px dashed #2563eb";
    textElem.style.outlineOffset = "4px";
    textElem.style.borderRadius = "4px";

    e.stopPropagation();

    const container = e.currentTarget;

    const saveUpdatedContent = () => {
      textElem!.contentEditable = "false";
      textElem!.style.outline = "";
      textElem!.style.outlineOffset = "";
      textElem!.style.borderRadius = "";

      // Clean up contentEditable attributes before saving HTML to user's local page state
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

      const newCode = clone.innerHTML;
      if (newCode) {
        setSections((prev) =>
          prev.map((sec, i) => (i === sectionIndex ? { ...sec, code: newCode } : sec))
        );
      }
    };

    textElem.onblur = () => {
      saveUpdatedContent();
    };

    textElem.onkeydown = (keyEvent) => {
      if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
        keyEvent.preventDefault();
        textElem!.blur();
      }
    };
  };

  // Right-click handler for buttons/links to edit target URL
  const handleSectionContextMenu = (e: React.MouseEvent<HTMLDivElement>, sectionIndex: number) => {
    const target = e.target as HTMLElement;
    if (!target) return;

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
        return; // Standard element, don't hijack context menu
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

      const newCode = clone.innerHTML;
      if (newCode) {
        setSections((prev) =>
          prev.map((sec, i) => (i === sectionIndex ? { ...sec, code: newCode } : sec))
        );
      }
    }

    setLinkPopup(null);
  };

  // Select section category in modal: Fetch latest Admin DB templates and insert exact Admin code!
  const handleSelectSectionCategory = async (cat: typeof SECTION_CATEGORIES[0]) => {
    setShowAddSectionModal(false);

    let templatesList = adminDbTemplates;

    // Fetch latest templates if empty
    if (templatesList.length === 0) {
      try {
        const res = await fetch("/api/v1/admin/templates", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.templates) {
            templatesList = data.templates;
            setAdminDbTemplates(data.templates);
          }
        }
      } catch {}
    }

    // Filter admin-added templates matching selected category tag (e.g. [hero])
    const catIdLower = cat.id.toLowerCase();
    const catNameLower = cat.name.toLowerCase();
    const matchingTemplates = templatesList.filter((tpl) => {
      const nameLower = (tpl.name || "").toLowerCase();
      return (
        nameLower.includes(`[${catIdLower}]`) ||
        nameLower.includes(catIdLower) ||
        nameLower.includes(catNameLower)
      );
    });

    const targetTemplate = matchingTemplates.length > 0 ? matchingTemplates[0]! : templatesList[0];

    if (targetTemplate && targetTemplate.code) {
      const newSection: SectionItem = {
        id: `sec-${Date.now()}`,
        title: targetTemplate.name,
        code: targetTemplate.code,
        variantIndex: 0,
      };
      setSections((prev) => [...prev, newSection]);
      setActiveSectionIndex(sections.length);
    }
  };

  // Swap / Cycle between admin-added section variants (e.g. hero 1 <-> hero 2) or layout variations
  const handleSwapVariant = async () => {
    if (activeSectionIndex === null || sections.length === 0) return;

    const activeSec = sections[activeSectionIndex];
    if (!activeSec) return;

    let templatesList = adminDbTemplates;

    // Fetch latest templates from API if empty
    if (templatesList.length === 0) {
      try {
        const res = await fetch("/api/v1/admin/templates", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.templates && data.templates.length > 0) {
            templatesList = data.templates;
            setAdminDbTemplates(data.templates);
          }
        }
      } catch {}
    }

    // Determine category ID of active section (header, hero, stats, features, about, courses, placements, faculty, contact, footer)
    const titleLower = activeSec.title.toLowerCase();
    let catId = "hero";
    if (titleLower.includes("header") || titleLower.includes("nav")) catId = "header";
    else if (titleLower.includes("stat")) catId = "stats";
    else if (titleLower.includes("feature") || titleLower.includes("highlight")) catId = "features";
    else if (titleLower.includes("about")) catId = "about";
    else if (titleLower.includes("course") || titleLower.includes("academic")) catId = "courses";
    else if (titleLower.includes("placement") || titleLower.includes("career")) catId = "placements";
    else if (titleLower.includes("faculty") || titleLower.includes("staff")) catId = "faculty";
    else if (titleLower.includes("contact")) catId = "contact";
    else if (titleLower.includes("footer")) catId = "footer";
    else if (titleLower.includes("hero") || titleLower.includes("banner")) catId = "hero";

    // Filter DB templates matching active category ONLY
    const catTemplates = templatesList.filter((tpl) => {
      const nameLower = (tpl.name || "").toLowerCase();
      return (
        nameLower.includes(`[${catId}]`) ||
        nameLower.includes(catId) ||
        (catId === "header" && (nameLower.includes("header") || nameLower.includes("nav"))) ||
        (catId === "features" && (nameLower.includes("feature") || nameLower.includes("highlight"))) ||
        (catId === "stats" && (nameLower.includes("stat") || nameLower.includes("metric"))) ||
        (catId === "hero" && (nameLower.includes("hero") || nameLower.includes("banner"))) ||
        (catId === "courses" && (nameLower.includes("course") || nameLower.includes("academic"))) ||
        (catId === "about" && nameLower.includes("about")) ||
        (catId === "contact" && nameLower.includes("contact"))
      );
    });

    if (catTemplates.length > 0) {
      // Find current template index in available category templates
      const currentTplIdx = catTemplates.findIndex((tpl) => tpl.name === activeSec.title);
      const nextIdx = currentTplIdx >= 0 ? (currentTplIdx + 1) % catTemplates.length : (activeSec.variantIndex !== undefined ? (activeSec.variantIndex + 1) % catTemplates.length : 0);
      const nextTpl = catTemplates[nextIdx]!;

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
      showToast(`Swapped to ${catId.toUpperCase()} Admin Variant: "${nextTpl.name}"`);
      return;
    }

    // Fallback if no specific category DB template exists: Cycle visual layout variations of THIS SAME section without changing category/title
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
    showToast(`Swapped ${baseTitle} to Layout Variant ${nextIdx + 1}`);
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
          <div className="flex items-center gap-1.5 text-xs text-blue-700 font-black bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentPage.name}</span>
          </div>
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
                  onDoubleClick={(e) => handleSectionDoubleClick(e, idx)}
                  onContextMenu={(e) => handleSectionContextMenu(e, idx)}
                  className={`w-full cursor-pointer relative transition-all group section-wrapper-container ${
                    activeSectionIndex === idx ? "ring-2 ring-blue-600 ring-offset-2 z-10" : ""
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: autoCorrectMobileCode(sec.code, viewportWidth) }}
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
        <div
          onClick={() => setShowAddSectionModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl space-y-6 border border-slate-200 cursor-default"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">What section do you want to add?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select a category or specific Admin section variant.</p>
              </div>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Admin DB Section Variants List */}
            {adminDbTemplates.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                  Admin DB Section Variants ({adminDbTemplates.length})
                </h4>
                <div className="grid gap-2 sm:grid-cols-2 max-h-[25vh] overflow-y-auto pr-1">
                  {adminDbTemplates.map((tpl) => (
                    <div
                      key={tpl.id || tpl.name}
                      onClick={() => {
                        const newSection: SectionItem = {
                          id: `sec-${Date.now()}`,
                          title: tpl.name,
                          code: tpl.code,
                          variantIndex: 0,
                        };
                        setSections((prev) => [...prev, newSection]);
                        setActiveSectionIndex(sections.length);
                        setShowAddSectionModal(false);
                      }}
                      className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 hover:border-emerald-500 hover:bg-emerald-100 transition-all cursor-pointer flex items-center justify-between shadow-sm select-none"
                    >
                      <div className="truncate pr-2">
                        <h5 className="text-xs font-black text-slate-900 truncate">{tpl.name}</h5>
                        <p className="text-[10px] text-emerald-700 font-mono">Live DB Template</p>
                      </div>
                      <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2.5 py-1 rounded-full shrink-0 shadow-sm">
                        + Add
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
        initialTab={settingsTab}
      />

      {/* Floating Bottom Toolbar Dock - Hidden when Settings Studio is open */}
      {!isSettingsOpen && (
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
          onSyncAdminWebsite={() => fetchDbSections(currentPage.slug, true)}
        />
      )}

      {/* Floating Right-Click Button URL Navigation Popup */}
      {linkPopup && (
        <div
          onClick={() => setLinkPopup(null)}
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-100 cursor-default"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ top: `${linkPopup.y}px`, left: `${linkPopup.x}px` }}
            className="fixed z-50 w-80 bg-[#0d1117] border border-blue-500/50 rounded-2xl p-4 shadow-2xl space-y-4 text-white text-xs animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                <span className="font-extrabold text-white">Button Navigation URL</span>
              </div>
              <button
                onClick={() => setLinkPopup(null)}
                className="text-neutral-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded hover:bg-neutral-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-neutral-400 font-bold mb-1">
                  Target URL / Link Path
                </label>
                <input
                  type="text"
                  value={linkPopup.currentUrl}
                  onChange={(e) => setLinkPopup({ ...linkPopup, currentUrl: e.target.value })}
                  placeholder="e.g. https://greenfield.edu.in/apply or #contact"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Quick Page Preset Links */}
              <div>
                <label className="block text-[10px] font-mono text-neutral-500 font-bold mb-1 uppercase">
                  Quick Page Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {["/home", "/about", "/academics", "/contact", "/placements"].map((slug) => (
                    <button
                      key={slug}
                      onClick={() => setLinkPopup({ ...linkPopup, currentUrl: slug })}
                      className="text-[10px] font-mono px-2 py-1 rounded-lg bg-neutral-800 hover:bg-blue-600 hover:text-white text-neutral-300 transition-colors cursor-pointer"
                    >
                      {slug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Open in New Tab Toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={linkPopup.isNewTab}
                  onChange={(e) => setLinkPopup({ ...linkPopup, isNewTab: e.target.checked })}
                  className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                />
                <span className="text-xs font-bold text-neutral-300">Open in New Tab (`target="_blank"`)</span>
              </label>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setLinkPopup(null)}
                  className="px-3.5 py-1.5 rounded-xl text-neutral-400 hover:text-white font-bold hover:bg-neutral-800 cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveButtonUrl(linkPopup.currentUrl, linkPopup.isNewTab)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-md cursor-pointer text-xs"
                >
                  🔗 Save Button URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
