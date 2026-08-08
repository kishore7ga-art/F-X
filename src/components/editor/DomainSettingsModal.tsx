"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Calendar,
  CheckSquare,
  Folder,
  Tag,
  LogOut,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Zap,
  FolderPlus,
  Trash2,
  Users,
  Plus,
  Check,
  Clock,
  ExternalLink,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  X,
  Globe,
  ShieldCheck,
  Lock,
  Key,
  Bell,
  Sliders,
  Copy,
  CheckCircle2,
  RefreshCw,
  Rocket,
  ArrowLeft,
  Layers,
  FileText,
  Server,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface DomainSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subdomain?: string;
  initialTab?: string;
}

export function DomainSettingsModal({
  isOpen,
  onClose,
  subdomain = "greenfield",
  initialTab = "domain",
}: DomainSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeNav, setActiveNav] = useState(initialTab || "domain");
  const [activeProject, setActiveProject] = useState("Home & Hero");
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [customDomain, setCustomDomain] = useState(`${subdomain}.edu.in`);
  const [savedDomain, setSavedDomain] = useState(`${subdomain}.edu.in`);
  const [publishing, setPublishing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isVerifyingDNS, setIsVerifyingDNS] = useState(false);
  const [dnsStatus, setDnsStatus] = useState("All 3 DNS Records Connected");

  const [lastDeployedTime, setLastDeployedTime] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("xite_last_published_time");
        if (saved) return saved;
      } catch {}
    }
    return "Aug 8, 2026 at 11:20 PM";
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied "${text}" to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePublish = () => {
    setPublishing(true);
    const nowStr =
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " at " +
      new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

    setTimeout(() => {
      setPublishing(false);
      setLastDeployedTime(nowStr);
      try {
        localStorage.setItem("xite_last_published_time", nowStr);
      } catch {}
      showToast("Website published successfully to production live! 🚀");
    }, 1200);
  };

  const handleVerifyDNS = () => {
    setIsVerifyingDNS(true);
    setTimeout(() => {
      setIsVerifyingDNS(false);
      setDnsStatus("All 3 DNS Records Active & Verified");
      showToast("SSL & DNS Routing Verified 100% Active! 🟢");
    }, 1000);
  };

  const handleSaveDomain = () => {
    setSavedDomain(customDomain);
    showToast(`Custom domain updated to https://${customDomain}`);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#F7F2EE] text-[#1A1A1A] font-sans antialiased select-none p-4 md:p-6 lg:p-8 overflow-y-auto min-h-screen">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000000] flex items-center gap-2.5 rounded-2xl bg-[#1A1A1A] px-6 py-3.5 text-xs font-black text-white shadow-2xl border border-white/10"
          >
            <span className="h-2 w-2 rounded-full bg-[#CEEAD6] animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3-Column Floating Layout Container */}
      <div className="w-full max-w-[1440px] flex flex-col lg:flex-row gap-5 items-stretch relative my-auto">
        
        {/* ========================================================= */}
        {/* 1. LEFT NAVIGATION SIDEBAR (Dayzer Style Floating White Card) */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-[270px] shrink-0 bg-white rounded-[32px] p-6 shadow-sm border border-[#EBE3DC]/80 flex flex-col justify-between min-h-[660px]">
          <div className="space-y-6">
            {/* Top Brand Logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-black shadow-xs">
                  <div className="h-3.5 w-3.5 rounded-l-full bg-white mr-auto ml-1.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-[#1A1A1A] leading-none">
                    XITE Studio
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#8C827A] mt-0.5">
                    {subdomain}.edu.in
                  </span>
                </div>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="flex items-center gap-3.5 pt-1">
              <div className="relative">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#1A1A1A] to-[#404040] text-white flex items-center justify-center font-black text-sm shadow-sm border border-slate-100">
                  K
                </div>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[#34D399] border-2 border-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-extrabold text-[#1A1A1A] tracking-tight truncate">
                  Kishore
                </span>
                <span className="text-[11px] font-semibold text-[#8C827A] truncate">
                  Owner Account
                </span>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1.5 pt-1">
              {/* Custom Domain & SSL (Active Tab) */}
              <button
                type="button"
                onClick={() => setActiveNav("domain")}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-[13px] font-extrabold transition-all text-left cursor-pointer",
                  activeNav === "domain"
                    ? "bg-[#F4ECE4] text-[#1A1A1A]"
                    : "text-[#6B635B] hover:bg-[#F9F5F1] hover:text-[#1A1A1A]"
                )}
              >
                <Globe className="h-4 w-4 shrink-0" />
                <span>Custom Domain &amp; SSL</span>
              </button>

              {/* Production Deployment */}
              <button
                type="button"
                onClick={() => {
                  setActiveNav("deploy");
                  handlePublish();
                }}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-[13px] font-bold transition-all text-left cursor-pointer",
                  activeNav === "deploy"
                    ? "bg-[#F4ECE4] text-[#1A1A1A] font-extrabold"
                    : "text-[#6B635B] hover:bg-[#F9F5F1] hover:text-[#1A1A1A]"
                )}
              >
                <Rocket className="h-4 w-4 shrink-0" />
                <span>Production Deploy</span>
              </button>

              {/* Website Sections & Pages (Collapsible) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-[13px] font-bold text-[#6B635B] hover:text-[#1A1A1A] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Folder className="h-4 w-4 shrink-0" />
                    <span>Website Pages</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200 text-[#8C827A]",
                      isProjectsOpen ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </button>

                {/* Sub-pages list with Dayzer colored markers */}
                {isProjectsOpen && (
                  <div className="pl-6 pr-2 py-1.5 space-y-2">
                    {[
                      { name: "Home & Hero", color: "bg-[#F48FB1]" },
                      { name: "Academics & Courses", color: "bg-[#FFB74D]" },
                      { name: "Faculty & Team", color: "bg-[#64B5F6]" },
                      { name: "Research & Events", color: "bg-[#81C784]" },
                    ].map((proj) => (
                      <button
                        key={proj.name}
                        type="button"
                        onClick={() => {
                          setActiveProject(proj.name);
                          showToast(`Selected page category: ${proj.name}`);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-[12px] font-bold transition-all text-left cursor-pointer",
                          activeProject === proj.name
                            ? "text-[#1A1A1A] font-extrabold"
                            : "text-[#7D756D] hover:text-[#1A1A1A]"
                        )}
                      >
                        <span className={cn("h-2.5 w-2.5 rounded-sm shrink-0", proj.color)} />
                        <span className="truncate">{proj.name}</span>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        const name = prompt("Enter new college page title:");
                        if (name) showToast(`Added page "${name}"`);
                      }}
                      className="flex items-center gap-2 text-[11px] font-extrabold text-[#8C827A] hover:text-[#1A1A1A] pl-3 pt-1 cursor-pointer transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add New Page</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Team Access & Security */}
              <button
                type="button"
                onClick={() => setActiveNav("security")}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-[13px] font-bold transition-all text-left cursor-pointer",
                  activeNav === "security"
                    ? "bg-[#F4ECE4] text-[#1A1A1A] font-extrabold"
                    : "text-[#6B635B] hover:bg-[#F9F5F1] hover:text-[#1A1A1A]"
                )}
              >
                <Key className="h-4 w-4 shrink-0" />
                <span>Password &amp; Security</span>
              </button>

              {/* Advanced Settings */}
              <button
                type="button"
                onClick={() => setActiveNav("advanced")}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-[13px] font-bold transition-all text-left cursor-pointer",
                  activeNav === "advanced"
                    ? "bg-[#F4ECE4] text-[#1A1A1A] font-extrabold"
                    : "text-[#6B635B] hover:bg-[#F9F5F1] hover:text-[#1A1A1A]"
                )}
              >
                <Sliders className="h-4 w-4 shrink-0" />
                <span>Advanced Settings</span>
              </button>
            </nav>
          </div>

          {/* Bottom Back to Editor Button */}
          <div className="pt-4 border-t border-[#F0EAE4]">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13px] font-extrabold text-[#1A1A1A] hover:bg-[#F4ECE4] transition-all cursor-pointer w-full"
            >
              <div className="h-7 w-7 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center">
                <ArrowLeft className="h-3.5 w-3.5" />
              </div>
              <span>Back to Editor</span>
            </button>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. CENTER MAIN DASHBOARD SLATE (Dayzer Style Floating Slate) */}
        {/* ========================================================= */}
        <main className="flex-1 bg-white rounded-[36px] p-7 md:p-10 shadow-sm border border-[#EBE3DC]/80 flex flex-col justify-between space-y-8 min-h-[660px]">
          {/* Top Navigation & Status Bar */}
          <div className="flex items-center justify-between border-b border-[#F4EFEA] pb-5">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 text-xs font-extrabold text-[#6B635B] hover:text-[#1A1A1A] transition-colors cursor-pointer bg-white"
            >
              <span className="h-6 w-6 rounded-lg border border-[#E8E0D8] flex items-center justify-center text-[11px] font-bold">
                ‹
              </span>
              <span>Back to Editor</span>
            </button>

            <h2 className="text-[17px] font-black text-[#1A1A1A] tracking-tight">
              Publishing &amp; Custom Domain Settings
            </h2>

            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200/70 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Live</span>
            </div>
          </div>

          {/* Hero Main Headline & Actions */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#8C827A]">
                Primary Domain Routing
              </span>
              <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-[#1A1A1A] leading-[1.25] max-w-2xl">
                Custom Domain Configuration &amp; Live Production Hosting
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              {/* Connected domain badge and collaborator stack */}
              <div className="flex items-center gap-6">
                <div className="text-[12px] font-bold text-[#8C827A] leading-tight">
                  Members<br />connected
                </div>
                <div className="h-6 w-px bg-[#EBE3DC]" />
                <div className="flex items-center -space-x-2">
                  <div className="h-9 w-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-black border-2 border-white shadow-xs">
                    K
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                    alt="Colleague"
                    className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                    alt="Web Editor"
                    className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                </div>
              </div>

              {/* Actions: DNS Check + Open Live Site */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => showToast("DNS routing active on all 3 records! 🟢")}
                  className="h-10 w-10 rounded-2xl border border-[#E8E0D8] flex items-center justify-center text-[#1A1A1A] hover:bg-[#F7F2EE] transition cursor-pointer"
                  title="Check DNS Help"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>

                <a
                  href={`/site/${subdomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-[#1A1A1A] px-7 py-2.5 text-xs font-black text-white hover:bg-black transition-all shadow-md active:scale-95 cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Open Live Site</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Split 2-Column Dashboard Grid */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
            
            {/* Left Column: Stats, Banner & Daily Plan Ring (5 Cols) */}
            <div className="md:col-span-5 space-y-4">
              <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight">
                Stats
              </h3>

              {/* Pastel Green Banner "Good day, Kishore!" with Abstract Shapes */}
              <div className="rounded-[28px] bg-[#CEEAD6] p-6 relative overflow-hidden flex flex-col justify-between min-h-[165px]">
                <div className="relative z-10 space-y-3 max-w-[180px]">
                  <h4 className="text-xl font-black text-[#1A1A1A] leading-tight tracking-tight">
                    Good day,<br />Kishore!
                  </h4>
                  <button
                    type="button"
                    onClick={handleVerifyDNS}
                    disabled={isVerifyingDNS}
                    className="rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-[#1A1A1A] shadow-xs hover:bg-[#F9F5F1] transition active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    {isVerifyingDNS ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    )}
                    <span>{isVerifyingDNS ? "Verifying..." : "Verify SSL & DNS"}</span>
                  </button>
                </div>

                {/* Abstract Geometric Art in Background */}
                <div className="absolute right-3 top-3 bottom-3 w-[150px] pointer-events-none flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Dark Circle */}
                    <div className="absolute top-1 right-8 h-10 w-10 rounded-full bg-[#1A1A1A]" />
                    {/* Sparkle */}
                    <div className="absolute top-4 right-1 text-white text-lg">✦</div>
                    {/* Diagonal striped wedge */}
                    <div className="absolute bottom-2 right-6 w-20 h-24 bg-[repeating-linear-gradient(45deg,#1A1A1A,#1A1A1A_3px,#CEEAD6_3px,#CEEAD6_7px)] opacity-90 transform -rotate-12 rounded-sm" />
                    {/* Yellow half-circle */}
                    <div className="absolute bottom-0 right-0 h-16 w-16 rounded-tl-full bg-[#FCE7AF]" />
                    {/* Mini zigzag */}
                    <div className="absolute bottom-0 right-14 w-6 h-6 bg-[repeating-linear-gradient(90deg,#1A1A1A,#1A1A1A_2px,transparent_2px,transparent_4px)]" />
                  </div>
                </div>
              </div>

              {/* Middle 2 Mini Stats Counters */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* 23 Pages Published */}
                <div className="rounded-[24px] bg-[#FAF7F4] p-4.5 border border-[#EBE3DC]/60 flex flex-col justify-between">
                  <span className="text-2xl font-black text-[#1A1A1A]">23</span>
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#1A1A1A] mt-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[8px]">
                      ✓
                    </span>
                    <span>Pages live</span>
                  </div>
                </div>

                {/* 99.9% Uptime & Speed */}
                <div className="rounded-[24px] bg-[#FAF7F4] p-4.5 border border-[#EBE3DC]/60 flex flex-col justify-between">
                  <span className="text-2xl font-black text-[#1A1A1A]">
                    99,9
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#1A1A1A] mt-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[8px]">
                      ⚡
                    </span>
                    <span>Uptime score</span>
                  </div>
                </div>
              </div>

              {/* Bottom Pastel Yellow "Your daily plan" Card */}
              <div className="rounded-[28px] bg-[#FCE7AF] p-5 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-[#1A1A1A] tracking-tight">
                    Site Health &amp; SEO
                  </h4>
                  <p className="text-xs font-bold text-[#6B635B] mt-0.5">
                    {dnsStatus}
                  </p>
                </div>

                {/* 100% Circular Progress Ring */}
                <div className="relative h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <svg className="h-16 w-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#F4E0A0"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      stroke="#1A1A1A"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray="163"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-[#1A1A1A]">
                    100%
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: "DNS Records & Production Tasks" (7 Cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight">
                  DNS Records &amp; Routing
                </h3>
                <span className="text-xs font-extrabold text-[#8C827A]">
                  Auto SSL Active
                </span>
              </div>

              <div className="space-y-3.5">
                {/* Record 1: A Record */}
                <div className="rounded-[26px] bg-white p-5 border border-[#EBE3DC] hover:border-[#D4C8BE] transition-all shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#8C827A] font-mono">
                      A RECORD • ROOT HOST
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("76.76.21.21", "a-rec")}
                      className="text-xs font-extrabold text-[#1A1A1A] hover:text-blue-600 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>76.76.21.21</span>
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>

                  <h4 className="text-sm font-black text-[#1A1A1A]">
                    Point @ hostname to XITE Global IP
                  </h4>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1A1A1A]">
                      <span className="h-4 w-4 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[9px] font-bold">
                        1
                      </span>
                      <span>Connected &amp; Verified</span>
                    </div>
                  </div>
                </div>

                {/* Record 2: CNAME Record */}
                <div className="rounded-[26px] bg-white p-5 border border-[#EBE3DC] hover:border-[#D4C8BE] transition-all shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#8C827A] font-mono">
                      CNAME RECORD • WWW SUBDOMAIN
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("cname.xite.co.in", "cname-rec")}
                      className="text-xs font-extrabold text-[#1A1A1A] hover:text-blue-600 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>cname.xite.co.in</span>
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>

                  <h4 className="text-sm font-black text-[#1A1A1A]">
                    Canonical alias for www.{savedDomain}
                  </h4>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B635B]">
                      <span className="h-3.5 w-3.5 rounded-full border border-[#8C827A] flex items-center justify-center text-[9px] font-bold">
                        !
                      </span>
                      <span>Active DNS Propagation</span>
                    </div>
                  </div>
                </div>

                {/* Record 3: TXT Challenge */}
                <div className="rounded-[26px] bg-white p-5 border border-[#EBE3DC] hover:border-[#D4C8BE] transition-all shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#8C827A] font-mono">
                      TXT RECORD • SSL AUTH
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard("xite-auth-token-9884", "txt-rec")}
                      className="text-xs font-extrabold text-[#1A1A1A] hover:text-blue-600 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span className="truncate max-w-[140px]">xite-auth-token-9884</span>
                      <Copy className="h-3 w-3 shrink-0" />
                    </button>
                  </div>

                  <h4 className="text-sm font-black text-[#1A1A1A]">
                    Automatic Let's Encrypt TLS Security Token
                  </h4>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] font-bold text-emerald-700">
                      ● Active &amp; Protected
                    </span>
                  </div>
                </div>

                {/* Domain Input Field */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 rounded-2xl bg-[#FAF7F4] p-2 border border-[#EBE3DC]">
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="e.g. kishore7ga-college.edu.in"
                      className="flex-1 bg-transparent px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveDomain}
                      className="rounded-xl bg-[#1A1A1A] px-5 py-2 text-xs font-extrabold text-white hover:bg-black transition cursor-pointer shadow-xs active:scale-95"
                    >
                      Save Domain
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ========================================================= */}
        {/* 3. RIGHT TOOL DOCK (Dayzer Style Floating Action Bar) */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-20 shrink-0 bg-white rounded-[32px] p-4 shadow-sm border border-[#EBE3DC]/80 flex flex-col items-center justify-between min-h-[660px]">
          {/* Top Quick Action Tool Icons */}
          <div className="flex flex-col items-center gap-6 w-full pt-2">
            {/* ⚡ Lightning Icon */}
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="h-10 w-10 flex items-center justify-center text-[#1A1A1A] hover:scale-110 transition cursor-pointer"
              title="Instant Production Deploy ⚡"
            >
              <Zap className="h-5 w-5 fill-[#1A1A1A]" />
            </button>

            {/* New page */}
            <button
              type="button"
              onClick={() => {
                const p = prompt("Enter new college page title:");
                if (p) showToast(`Created page "${p}"`);
              }}
              className="flex flex-col items-center gap-1.5 text-center text-[#6B635B] hover:text-[#1A1A1A] transition cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-2xl bg-[#F7F2EE] group-hover:bg-[#EFE7DF] flex items-center justify-center transition">
                <FolderPlus className="h-4 w-4 text-[#1A1A1A]" />
              </div>
              <span className="text-[10px] font-extrabold leading-tight">
                New<br />page
              </span>
            </button>

            {/* Add new task */}
            <button
              type="button"
              onClick={handleVerifyDNS}
              className="flex flex-col items-center gap-1.5 text-center text-[#6B635B] hover:text-[#1A1A1A] transition cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-2xl bg-[#F7F2EE] group-hover:bg-[#EFE7DF] flex items-center justify-center transition">
                <CheckSquare className="h-4 w-4 text-[#1A1A1A]" />
              </div>
              <span className="text-[10px] font-extrabold leading-tight">
                Verify<br />DNS
              </span>
            </button>

            {/* Project chat */}
            <button
              type="button"
              onClick={() => showToast("Opening XITE Support & Domain Chat")}
              className="flex flex-col items-center gap-1.5 text-center text-[#6B635B] hover:text-[#1A1A1A] transition cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-2xl bg-[#F7F2EE] group-hover:bg-[#EFE7DF] flex items-center justify-center transition">
                <MessageSquare className="h-4 w-4 text-[#1A1A1A]" />
              </div>
              <span className="text-[10px] font-extrabold leading-tight">
                Support<br />chat
              </span>
            </button>
          </div>

          {/* Bottom Collaborator Avatars Stack */}
          <div className="flex flex-col items-center gap-2.5 pb-2">
            {/* Avatar 1 (Kishore, Owner) with green online dot */}
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-black shadow-xs border border-white">
                K
              </div>
              <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-[#34D399] border-2 border-white" />
            </div>

            {/* Avatar 2 */}
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
              alt="Admin"
              className="h-9 w-9 rounded-full object-cover shadow-xs border border-white"
            />

            {/* Avatar 3 */}
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
              alt="Editor"
              className="h-9 w-9 rounded-full object-cover shadow-xs border border-white"
            />

            {/* Plus add collaborator button */}
            <button
              type="button"
              onClick={() => {
                const em = prompt("Invite administrator or editor email:");
                if (em) showToast(`Invited ${em}`);
              }}
              className="h-9 w-9 rounded-full border border-[#E8E0D8] bg-white flex items-center justify-center text-[#1A1A1A] hover:bg-[#F7F2EE] transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </div>
    </div>,
    document.body
  );
}
