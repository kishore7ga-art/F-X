"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Globe,
  Users,
  Key,
  Bell,
  Sliders,
  ShieldCheck,
  Rocket,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";

interface DomainSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subdomain?: string;
  initialTab?: string;
}

export function DomainSettingsModal({
  isOpen,
  onClose,
  subdomain = "mec",
  initialTab = "domain",
}: DomainSettingsModalProps) {
  const [customDomain, setCustomDomain] = useState(`${subdomain}.edu.in`);
  const [savedDomain, setSavedDomain] = useState(`${subdomain}.edu.in`);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(true);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync activeTab when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-900 font-sans flex flex-col overflow-y-auto">
      {/* Top Header Navigation */}
      <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-extrabold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Editor</span>
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-sm font-black text-slate-900 tracking-tight">XITE Studio Settings</span>
        </div>

        <a
          href={`https://${savedDomain}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-sm transition-all"
        >
          <span>Visit Live Site ↗</span>
        </a>
      </header>

      {/* Main Settings Body matching Image 1 */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 p-8">
        
        {/* Left Sidebar Menu matching Image 1 */}
        <aside className="space-y-6 flex flex-col justify-between h-[calc(100vh-120px)] sticky top-24">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("domain")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all ${
                activeTab === "domain"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>Custom Domain & SSL</span>
            </button>

            <button
              onClick={() => setActiveTab("team")}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 flex items-center gap-2.5"
            >
              <Users className="w-4 h-4" />
              <span>Team Access & Roles</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 flex items-center gap-2.5"
            >
              <Key className="w-4 h-4" />
              <span>Password & Security</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 flex items-center gap-2.5"
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab("advanced")}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/60 flex items-center gap-2.5"
            >
              <Sliders className="w-4 h-4" />
              <span>Advanced Settings</span>
            </button>
          </div>

          {/* Bottom User Pill matching Image 1 */}
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-black text-xs">
              K
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-slate-900">Kishore</span>
              <span className="text-[10px] text-slate-500 font-semibold">Owner Account</span>
            </div>
          </div>
        </aside>

        {/* Content Area matching Image 1 */}
        <main className="space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Publishing & Custom Domain Settings</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Configure A Record, CNAME, and SSL hosting for your website
            </p>
          </div>

          {/* Card 1: Primary Custom Domain */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                PRIMARY CUSTOM DOMAIN
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SSL Active & Connected</span>
              </span>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-900 font-bold focus:outline-none focus:border-slate-900"
              />
              <button
                onClick={() => setSavedDomain(customDomain)}
                className="px-6 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
              >
                Save Domain
              </button>
            </div>
          </div>

          {/* Card 2: Production Live Callout Banner matching Image 1 */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>PRODUCTION LIVE</span>
                <span className="text-emerald-700 font-normal">· Last deployed Jul 31, 2026 at 05:35 AM</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Publish Website to Production</h3>
                <p className="text-xs text-slate-600 font-semibold mt-1">
                  Target URL: <span className="font-mono text-slate-900 underline font-bold">https://{savedDomain}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Rocket className="w-4 h-4" />
                  <span>{publishing ? "Publishing..." : "Publish to Production"}</span>
                </button>

                <a
                  href={`https://${savedDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-extrabold text-xs rounded-xl hover:bg-slate-50 transition-all"
                >
                  Visit Live Site ↗
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: DNS Configuration Instructions Table matching Image 1 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              DNS CONFIGURATION INSTRUCTIONS
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Point your domain&apos;s DNS records to our servers to complete custom domain setup:
            </p>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">TYPE</th>
                    <th className="p-3">HOST/NAME</th>
                    <th className="p-3">TARGET VALUE</th>
                    <th className="p-3">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800 font-semibold">
                  <tr>
                    <td className="p-3 text-blue-600 font-extrabold">A</td>
                    <td className="p-3">@</td>
                    <td className="p-3">76.76.21.21</td>
                    <td className="p-3 text-emerald-600 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Active</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-blue-600 font-extrabold">CNAME</td>
                    <td className="p-3">www</td>
                    <td className="p-3">cname.xite.co.in</td>
                    <td className="p-3 text-emerald-600 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Active</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
