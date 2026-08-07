"use client";

import { useEffect, useState } from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";

interface SectionItem {
  id: string;
  title: string;
  code: string;
}

const DEFAULT_CLEAN_FULL_SECTIONS: SectionItem[] = [
  {
    id: "nav",
    title: "Navbar / Header",
    code: `<header style="background: #0d1527; color: #ffffff; padding: 18px 40px; display: flex; align-items: center; justify-content: space-between; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-bottom: 1px solid rgba(255,255,255,0.1);">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 40px; height: 40px; border-radius: 10px; background: #2563eb; color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 18px;">🎓</div>
      <span style="font-size: 20px; font-weight: 900; color: #ffffff;">GREENFIELD UNIVERSITY</span>
    </div>
    <nav style="display: flex; gap: 24px; font-size: 14px; font-weight: 700;">
      <a href="#about" style="color: #cbd5e1; text-decoration: none;">About</a>
      <a href="#courses" style="color: #cbd5e1; text-decoration: none;">Academics</a>
      <a href="#admissions" style="color: #cbd5e1; text-decoration: none;">Admissions</a>
      <a href="#placements" style="color: #cbd5e1; text-decoration: none;">Placements</a>
      <a href="#contact" style="color: #cbd5e1; text-decoration: none;">Contact</a>
    </nav>
    <a href="#apply" style="background: #2563eb; color: #ffffff; padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 800; text-decoration: none;">Apply Now</a>
  </header>`,
  },
  {
    id: "hero",
    title: "Hero Banner",
    code: `<section style="background: #090d16; color: #ffffff; padding: 90px 24px; text-align: center; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 900px; margin: 0 auto;">
      <span style="background: rgba(37,99,235,0.2); border: 1px solid #2563eb; color: #60a5fa; padding: 6px 20px; border-radius: 9999px; font-size: 12px; font-weight: 800; text-transform: uppercase;">A++ Accredited University</span>
      <h1 style="font-size: 52px; font-weight: 900; margin-top: 24px; line-height: 1.1; color: #ffffff;">Excellence in Higher Education & Innovation</h1>
      <p style="font-size: 18px; color: #94a3b8; margin-top: 18px; line-height: 1.6; max-width: 720px; margin-left: auto; margin-right: auto;">Empowering future leaders with world-class faculty, modern research laboratories, and vibrant campus life.</p>
      <div style="margin-top: 36px; display: flex; justify-content: center; gap: 16px;">
        <a href="#courses" style="background: #2563eb; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 900; text-decoration: none;">Explore Programs</a>
        <a href="#contact" style="background: transparent; border: 1px solid #334155; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 900; text-decoration: none;">Contact Us</a>
      </div>
    </div>
  </section>`,
  },
  {
    id: "highlights",
    title: "College Highlights",
    code: `<section style="background: #0f172a; color: #ffffff; padding: 60px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; text-align: center;">
      <div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #38bdf8; margin: 0;">#15</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">NIRF National Rank</p></div>
      <div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #38bdf8; margin: 0;">98.4%</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Placement Record</p></div>
      <div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #38bdf8; margin: 0;">500+</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Top Recruiters</p></div>
      <div style="padding: 24px; background: #1e293b; border-radius: 16px; border: 1px solid #334155;"><h3 style="font-size: 36px; font-weight: 900; color: #38bdf8; margin: 0;">15,000+</h3><p style="font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 6px;">Active Students</p></div>
    </div>
  </section>`,
  },
  {
    id: "about",
    title: "About College",
    code: `<section id="about" style="background: #ffffff; color: #0f172a; padding: 80px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box;">
    <div style="max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 48px; align-items: center;">
      <div>
        <span style="color: #2563eb; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;">OUR HERITAGE</span>
        <h2 style="font-size: 36px; font-weight: 900; margin-top: 12px; color: #0f172a;">Building Tomorrow's Global Tech Leaders</h2>
        <p style="font-size: 15px; color: #475569; margin-top: 16px; line-height: 1.7;">Established in 1985, Greenfield University has been at the forefront of academic excellence, technological innovation, and societal advancement for over four decades.</p>
      </div>
      <div style="background: #f1f5f9; padding: 32px; border-radius: 24px; border: 1px solid #e2e8f0;">
        <h4 style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 0;">Key Accreditations</h4>
        <ul style="margin-top: 16px; padding-left: 20px; color: #334155; font-size: 14px; font-weight: 600; line-height: 1.8;">
          <li>NAAC A++ Grade Accreditation</li>
          <li>AICTE & UGC Approved University</li>
          <li>NIRF Top 20 Engineering Institutions</li>
        </ul>
      </div>
    </div>
  </section>`,
  },
  {
    id: "footer",
    title: "Footer",
    code: `<footer style="background: #050810; color: #ffffff; padding: 60px 24px 40px 24px; font-family: system-ui, sans-serif; width: 100%; box-sizing: border-box; border-top: 1px solid rgba(255,255,255,0.1);">
  <div style="max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 40px;">
    <div>
      <h3 style="font-size: 20px; font-weight: 900; color: #ffffff; margin: 0;">Greenfield University</h3>
      <p style="font-size: 13px; color: #64748b; margin-top: 12px; line-height: 1.6;">Empowering future leaders through education, innovation, and global collaboration.</p>
    </div>
    <div>
      <h4 style="font-size: 14px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 0;">Quick Links</h4>
      <ul style="list-style: none; padding: 0; margin: 12px 0 0 0; font-size: 13px; color: #cbd5e1; display: flex; flex-direction: column; gap: 8px;">
        <li><a href="#about" style="color: #cbd5e1; text-decoration: none;">About Us</a></li>
        <li><a href="#courses" style="color: #cbd5e1; text-decoration: none;">Academics</a></li>
        <li><a href="#contact" style="color: #cbd5e1; text-decoration: none;">Contact Us</a></li>
      </ul>
    </div>
    <div>
      <h4 style="font-size: 14px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin: 0;">Contact Campus</h4>
      <p style="font-size: 13px; color: #cbd5e1; margin-top: 12px; line-height: 1.6;">
        📍 Main Campus, University Road<br />
        ✉️ admissions@greenfield.edu.in<br />
        📞 +91 (080) 2345-6789
      </p>
    </div>
  </div>
  <div style="max-width: 1100px; margin: 40px auto 0 auto; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 12px; color: #64748b;">
    © 2026 Greenfield University. Live Published Website.
  </div>
</footer>`,
  },
];

export function PreviewSiteViewer({ subdomain }: { subdomain: string }) {
  const [sections, setSections] = useState<SectionItem[]>(DEFAULT_CLEAN_FULL_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [previewWidth, setPreviewWidth] = useState<string>("100%");

  useEffect(() => {
    let cancelled = false;

    // 1. Load exact live sections edited in Editor Studio from localStorage
    if (typeof window !== "undefined") {
      try {
        const savedActive = localStorage.getItem(`xite_active_sections_${subdomain}`);
        if (savedActive && savedActive !== "undefined" && savedActive !== "null") {
          const parsed = JSON.parse(savedActive);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSections(parsed);
            setLoading(false);
            return;
          }
        }

        const savedPages = localStorage.getItem("xite_saved_pages");
        if (savedPages && savedPages !== "undefined" && savedPages !== "null") {
          const parsedPages = JSON.parse(savedPages);
          const homeSecs = parsedPages["/home"] || parsedPages["/"] || Object.values(parsedPages)[0];
          if (Array.isArray(homeSecs) && homeSecs.length > 0) {
            setSections(homeSecs);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not read localStorage sections for live preview:", err);
      }
    }

    // 2. Fallback to backend API if localStorage is empty
    const fetchSiteSections = async () => {
      try {
        const hostname = typeof window !== "undefined" ? window.location.hostname : "";
        const apiBase = hostname === "localhost" || hostname === "127.0.0.1" ? "http://localhost:4000" : "https://api.xite.co.in";
        const res = await fetch(`${apiBase}/api/v1/default-website`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data && data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
            if (!cancelled) {
              setSections(
                data.sections.map((sec: any, idx: number) => ({
                  id: sec.id || `sec-${idx}`,
                  title: sec.title || `Section ${idx + 1}`,
                  code: sec.code || "",
                }))
              );
            }
          }
        }
      } catch (err) {
        console.warn("Could not load backend published site sections:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSiteSections();
    return () => {
      cancelled = true;
    };
  }, [subdomain]);

  if (loading && sections.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading published website preview...</p>
        </div>
      </div>
    );
  }

  const cleanFullWebCodeForCanvas = (code: string, width: string): string => {
    if (!code) return "";

    let cleanCode = code;

    const bodyMatch = code.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      const headMatch = code.match(/<head[\s\S]*?>([\s\S]*?)<\/head>/i);
      const styles = headMatch ? headMatch[1] : "";
      cleanCode = `${styles}\n${bodyMatch[1]}`;
    } else {
      cleanCode = code
        .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
        .replace(/<\/?html[\s\S]*?>/gi, "")
        .replace(/<\/?head[\s\S]*?>/gi, "")
        .replace(/<\/?body[\s\S]*?>/gi, "");
    }

    cleanCode = cleanCode
      .replace(/position:\s*fixed/gi, "position: relative")
      .replace(/position:\s*sticky/gi, "position: relative");

    const containmentStyles = `<style>
      .section-canvas-box {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        position: relative !important;
      }
      .section-canvas-box * {
        box-sizing: border-box !important;
      }
      .section-canvas-box img, .section-canvas-box video, .section-canvas-box iframe, .section-canvas-box svg {
        max-width: 100% !important;
      }
      .section-canvas-box > div,
      .section-canvas-box > header,
      .section-canvas-box > section,
      .section-canvas-box > nav {
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .section-canvas-box [style*="position: fixed"], .section-canvas-box [style*="position:fixed"],
      .section-canvas-box [style*="position: sticky"], .section-canvas-box [style*="position:sticky"] {
        position: relative !important;
        top: auto !important;
      }
    </style>`;

    return `${containmentStyles}<div class="section-canvas-box">${cleanCode}</div>`;
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 font-sans overflow-x-hidden select-none relative">
      
      {/* Premium Floating Bottom Device Resolution Switcher Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-slate-950/95 backdrop-blur-2xl border border-slate-800/90 p-2 px-3 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(37,99,235,0.2)] flex items-center gap-1.5 transition-all duration-300 select-none animate-in fade-in slide-in-from-bottom-4">
        {[
          { label: "100%", title: "Full 100%", width: "100%", Icon: Monitor },
          { label: "1200px", title: "Desktop 1200px", width: "1200px", Icon: Monitor },
          { label: "768px", title: "Tablet 768px", width: "768px", Icon: Tablet },
          { label: "375px", title: "Mobile 375px", width: "375px", Icon: Smartphone },
        ].map((item) => {
          const isActive = previewWidth === item.width;
          const Icon = item.Icon;
          return (
            <button
              key={item.width}
              onClick={() => setPreviewWidth(item.width)}
              className={`group relative flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-95 ${
                isActive
                  ? "text-white font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60 font-medium"
              }`}
              title={item.title}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 rounded-full shadow-[0_4px_16px_rgba(37,99,235,0.5)] border border-blue-400/40 pointer-events-none" />
              )}
              <Icon className={`relative z-10 w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" : "text-slate-400 group-hover:text-blue-400"}`} />
              <span className="relative z-10 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_6px_#67e8f9]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Live Site View */}
      <main className={`w-full flex-1 flex flex-col items-center justify-start transition-all ${
        previewWidth === "100%" ? "p-0 m-0 bg-white pb-36" : "py-12 px-4 bg-slate-100/90 pb-36"
      }`}>
        <div
          className={`transition-all duration-300 flex flex-col items-center justify-start mx-auto bg-white overflow-hidden max-w-full ${
            previewWidth === "100%"
              ? "w-full min-h-screen rounded-none border-none shadow-none m-0 p-0"
              : "min-h-[75vh] shadow-2xl rounded-2xl border border-slate-300 my-4"
          }`}
          style={{ width: previewWidth, maxWidth: "100%" }}
        >
          {sections.map((sec) => (
            <div
              key={sec.id}
              dangerouslySetInnerHTML={{ __html: cleanFullWebCodeForCanvas(sec.code, previewWidth) }}
              className="w-full overflow-hidden"
            />
          ))}
          {/* Bottom Clearance Spacer for Floating Device Switcher Dock */}
          <div className="w-full h-36 bg-transparent pointer-events-none shrink-0" />
        </div>
      </main>
    </div>
  );
}
