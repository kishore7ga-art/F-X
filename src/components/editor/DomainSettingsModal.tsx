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
  Share2,
  Menu,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [customDomain, setCustomDomain] = useState(`${subdomain}.edu.in`);
  const [savedDomain, setSavedDomain] = useState(`${subdomain}.edu.in`);
  const [publishing, setPublishing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackedSeconds, setTrackedSeconds] = useState(19800); // 5.5 hours
  const [dnsStatus, setDnsStatus] = useState("All 3 DNS Records Connected");
  const [isVerifyingDNS, setIsVerifyingDNS] = useState(false);

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

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setTrackedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  if (!isOpen || !mounted) return null;

  const formatTrackedHours = () => {
    const hours = (trackedSeconds / 3600).toFixed(1).replace(".", ",");
    return hours;
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] w-screen h-screen bg-[#F7F7F5] text-[#171717] font-sans antialiased select-none flex flex-col md:flex-row overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000000] flex items-center gap-2.5 rounded-2xl bg-[#171717] px-6 py-3 text-xs font-bold text-white shadow-2xl border border-white/10"
          >
            <span className="h-2 w-2 rounded-full bg-[#34D399] animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 1. LEFT FIXED SIDEBAR (240px - 260px Full Height) */}
      {/* ========================================================= */}
      <aside
        className={cn(
          "w-full md:w-[250px] lg:w-[260px] shrink-0 bg-white border-r border-[#E5E5E5] flex flex-col justify-between h-full p-5 md:p-6 overflow-y-auto transition-transform duration-200 z-40",
          mobileMenuOpen ? "fixed inset-0 z-50 flex" : "hidden md:flex"
        )}
      >
        <div className="space-y-6">
          {/* Top Brand Logo & Mobile Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-[#171717] flex items-center justify-center text-white text-xs font-black shadow-xs">
                <div className="h-3.5 w-3.5 rounded-l-full bg-white mr-auto ml-1.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-bold tracking-tight text-[#171717] leading-none">
                  XITE Studio
                </span>
                <span className="text-[11px] font-mono font-medium text-[#737373] mt-1 truncate max-w-[150px]">
                  {subdomain}.edu.in
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden h-8 w-8 rounded-lg flex items-center justify-center text-[#737373] hover:bg-[#F5F5F5]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-[#FAFAFA] border border-[#EBEBEB]">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                K
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#10B981] border-2 border-white" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-bold text-[#171717] tracking-tight truncate">
                Kishore
              </span>
              <span className="text-[11px] font-medium text-[#737373] truncate">
                Owner Account
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#A3A3A3]">
              Navigation
            </div>

            {/* Custom Domain & Plan */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("domain");
                setMobileMenuOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-150 text-left cursor-pointer",
                activeNav === "domain"
                  ? "bg-[#F5F5F3] text-[#171717] font-bold"
                  : "text-[#525252] hover:bg-[#FAFAFA] hover:text-[#171717]"
              )}
            >
              <Globe className="h-4 w-4 shrink-0 text-[#737373]" />
              <span className="truncate">Custom Domain &amp; SSL</span>
            </button>

            {/* Production Deploy */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("deploy");
                handlePublish();
                setMobileMenuOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-150 text-left cursor-pointer",
                activeNav === "deploy"
                  ? "bg-[#F5F5F3] text-[#171717] font-bold"
                  : "text-[#525252] hover:bg-[#FAFAFA] hover:text-[#171717]"
              )}
            >
              <Rocket className="h-4 w-4 shrink-0 text-[#737373]" />
              <span className="truncate">Production Deploy</span>
            </button>

            {/* Website Pages Accordion */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-[13px] font-semibold text-[#525252] hover:text-[#171717] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Folder className="h-4 w-4 shrink-0 text-[#737373]" />
                  <span>Website Pages</span>
                </div>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200 text-[#A3A3A3]",
                    isProjectsOpen ? "rotate-0" : "-rotate-90"
                  )}
                />
              </button>

              {isProjectsOpen && (
                <div className="pl-6 pr-1 py-1 space-y-1">
                  {[
                    { name: "Home & Hero", color: "bg-[#F48FB1]" },
                    { name: "Academics", color: "bg-[#FFB74D]" },
                    { name: "Admissions", color: "bg-[#64B5F6]" },
                    { name: "Placements", color: "bg-[#81C784]" },
                  ].map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setActiveProject(p.name);
                        showToast(`Viewing page: ${p.name}`);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12px] transition-all text-left cursor-pointer",
                        activeProject === p.name
                          ? "text-[#171717] font-bold bg-[#F5F5F3]"
                          : "text-[#737373] hover:text-[#171717]"
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-xs shrink-0", p.color)} />
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const name = prompt("Enter new college page title:");
                      if (name) showToast(`Added page "${name}"`);
                    }}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-[#737373] hover:text-[#171717] pl-2.5 pt-1 cursor-pointer transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add New Page</span>
                  </button>
                </div>
              )}
            </div>

            {/* Password & Security */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("security");
                setMobileMenuOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-150 text-left cursor-pointer",
                activeNav === "security"
                  ? "bg-[#F5F5F3] text-[#171717] font-bold"
                  : "text-[#525252] hover:bg-[#FAFAFA] hover:text-[#171717]"
              )}
            >
              <Key className="h-4 w-4 shrink-0 text-[#737373]" />
              <span className="truncate">Password &amp; Security</span>
            </button>

            {/* Advanced Settings */}
            <button
              type="button"
              onClick={() => {
                setActiveNav("advanced");
                setMobileMenuOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-150 text-left cursor-pointer",
                activeNav === "advanced"
                  ? "bg-[#F5F5F3] text-[#171717] font-bold"
                  : "text-[#525252] hover:bg-[#FAFAFA] hover:text-[#171717]"
              )}
            >
              <Sliders className="h-4 w-4 shrink-0 text-[#737373]" />
              <span className="truncate">Advanced Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Back to Editor Action */}
        <div className="pt-4 border-t border-[#E5E5E5]">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px] font-bold text-[#171717] bg-[#FAFAFA] hover:bg-[#F5F5F3] border border-[#E5E5E5] transition-all cursor-pointer w-full justify-center shadow-2xs active:scale-[0.99]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Editor</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN VIEWPORT CONTENT (Fills 100% Remaining Width & Height) */}
      {/* ========================================================= */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center gap-2 text-xs font-bold p-2 rounded-lg bg-white border border-[#E5E5E5]"
          >
            <Menu className="h-4 w-4" />
            <span>Menu</span>
          </button>

          <div className="text-sm font-bold truncate">{subdomain}.edu.in</div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold p-2 rounded-lg bg-white border border-[#E5E5E5]"
          >
            Exit
          </button>
        </div>

        {/* Top Header Row with Breadcrumbs, Title & Live Actions */}
        <div className="flex flex-col gap-4 bg-white rounded-2xl p-5 md:p-6 border border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#F0F0F0]">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Editor</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#047857] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Production Live</span>
              </div>
              <span className="text-xs text-[#A3A3A3] font-medium hidden sm:inline">
                Last deployed {lastDeployedTime}
              </span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#A3A3A3]">
                Domain Configuration &amp; Hosting
              </span>
              <h1 className="text-2xl md:text-[30px] font-bold tracking-tight text-[#171717] leading-[1.2]">
                Publishing &amp; Custom Domain Settings for your College Website
              </h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => showToast("DNS routing active across all edge nodes 🟢")}
                className="h-10 w-10 rounded-xl border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-[#F5F5F3] flex items-center justify-center text-[#171717] transition cursor-pointer"
                title="DNS Verification Info"
              >
                <MessageSquare className="h-4 w-4" />
              </button>

              <a
                href={`/site/${subdomain}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-[#171717] hover:bg-black text-white px-5 py-2.5 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                <span>Open Live Site</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* DASHBOARD 2-COLUMN GRID (60/40 Split across full viewport) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT 7 COLS: Overview, Stats & Greeting Banner */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Greeting Banner ("Good day, Kishore!") */}
            <div className="rounded-2xl bg-[#D8EEDF] p-6 md:p-7 border border-[#C2E3CB] shadow-[0_2px_8px_rgba(0,0,0,0.03)] relative overflow-hidden flex flex-col justify-between min-h-[170px]">
              <div className="relative z-10 space-y-3 max-w-[240px]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E7D32]">
                  Welcome back
                </span>
                <h3 className="text-2xl md:text-[26px] font-bold text-[#171717] leading-tight tracking-tight">
                  Good day,<br />Kishore!
                </h3>
                <button
                  type="button"
                  onClick={handleVerifyDNS}
                  disabled={isVerifyingDNS}
                  className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-[#171717] shadow-xs hover:bg-[#F9F5F1] transition active:scale-95 cursor-pointer inline-flex items-center gap-2"
                >
                  {isVerifyingDNS ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  )}
                  <span>{isVerifyingDNS ? "Verifying..." : "Start tracking"}</span>
                </button>
              </div>

              {/* Contained Abstract Art Illustration */}
              <div className="absolute right-4 top-4 bottom-4 w-[160px] pointer-events-none flex items-center justify-center">
                <div className="relative w-full h-full">
                  <div className="absolute top-2 right-8 h-10 w-10 rounded-full bg-[#171717]" />
                  <div className="absolute top-5 right-2 text-white text-lg font-black">✦</div>
                  <div className="absolute bottom-2 right-6 w-20 h-24 bg-[repeating-linear-gradient(45deg,#171717,#171717_3px,#D8EEDF_3px,#D8EEDF_7px)] opacity-90 transform -rotate-12 rounded-sm" />
                  <div className="absolute bottom-0 right-0 h-14 w-14 rounded-tl-full bg-[#FCE7AF]" />
                  <div className="absolute bottom-0 right-14 w-6 h-6 bg-[repeating-linear-gradient(90deg,#171717,#171717_2px,transparent_2px,transparent_4px)]" />
                </div>
              </div>
            </div>

            {/* Dual Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pages Live */}
              <div className="rounded-2xl bg-white p-5 border border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[110px]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                  Published Pages
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-bold text-[#171717]">23</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Pages live</span>
                  </div>
                </div>
              </div>

              {/* Optimize Score */}
              <div className="rounded-2xl bg-white p-5 border border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[110px]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373]">
                  CDN Speed &amp; Uptime
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-bold text-[#171717]">99.9%</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981]">
                    <Zap className="h-4 w-4 fill-[#10B981]" />
                    <span>Tracked uptime</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Site Health & Daily Plan Card */}
            <div className="rounded-2xl bg-[#FDF0D0] p-6 border border-[#F5E2B3] shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#92400E]">
                  Readiness Score
                </span>
                <h4 className="text-lg font-bold text-[#171717] tracking-tight">
                  Your daily plan &amp; SEO Health
                </h4>
                <p className="text-xs font-medium text-[#78350F]">
                  4 of 6 completed • {dnsStatus}
                </p>
              </div>

              {/* 70% Circular Progress Indicator */}
              <div className="relative h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0">
                <svg className="h-16 w-16 -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="25"
                    stroke="#FDE68A"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="25"
                    stroke="#171717"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray="157"
                    strokeDashoffset="47"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-[#171717]">
                  70%
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLS: "Your tasks today" & DNS Records */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-[#171717] tracking-tight">
                Your tasks today
              </h3>
              <span className="text-xs font-bold text-[#10B981] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                ● Auto SSL Active
              </span>
            </div>

            <div className="space-y-3">
              {/* Task 1: Primary Domain Record */}
              <div
                onClick={() => copyToClipboard("76.76.21.21", "a-rec")}
                className="rounded-2xl bg-white p-5 border border-[#E5E5E5] hover:border-[#D4D4D4] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-2 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#737373]">Primary Domain Routing</span>
                  <span className="font-bold text-[#A3A3A3]">4h</span>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#171717] group-hover:text-black">
                    Domain routing: {savedDomain}
                  </h4>
                  <Copy className="h-3.5 w-3.5 text-[#A3A3A3] group-hover:text-[#171717]" />
                </div>
                <div className="flex items-center gap-2 pt-1 text-xs text-[#525252] font-medium">
                  <span className="h-4 w-4 rounded-full bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center text-[10px] font-bold text-[#171717]">
                    !
                  </span>
                  <span>A-Record: <code className="font-mono font-bold text-[#171717]">76.76.21.21</code> Active</span>
                </div>
              </div>

              {/* Task 2: Production Hosting */}
              <div
                onClick={() => copyToClipboard("cname.xite.co.in", "cname-rec")}
                className="rounded-2xl bg-white p-5 border border-[#E5E5E5] hover:border-[#D4D4D4] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-2 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#737373]">Production Hosting</span>
                  <span className="font-bold text-[#A3A3A3]">7d</span>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#171717] group-hover:text-black">
                    Global CDN Edge &amp; SSL Certificate
                  </h4>
                  <Copy className="h-3.5 w-3.5 text-[#A3A3A3] group-hover:text-[#171717]" />
                </div>
                <div className="flex items-center gap-2 pt-1 text-xs text-[#525252] font-medium">
                  <span className="h-4 w-4 rounded-full bg-[#171717] text-white flex items-center justify-center text-[10px] font-bold">
                    1
                  </span>
                  <span>CNAME: <code className="font-mono font-bold text-[#171717]">cname.xite.co.in</code></span>
                </div>
              </div>

              {/* Task 3: DNS Security QA */}
              <div
                onClick={() => copyToClipboard("xite-auth-token-9884", "txt-rec")}
                className="rounded-2xl bg-white p-5 border border-[#E5E5E5] hover:border-[#D4D4D4] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-2 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#737373]">DNS Security QA</span>
                  <span className="font-bold text-[#A3A3A3]">2h</span>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#171717] group-hover:text-black">
                    Cross-platform and browser QA
                  </h4>
                  <Copy className="h-3.5 w-3.5 text-[#A3A3A3] group-hover:text-[#171717]" />
                </div>
                <div className="flex items-center gap-2 pt-1 text-xs text-[#047857] font-semibold">
                  <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                  <span>Let's Encrypt TLS 1.3 Active</span>
                </div>
              </div>

              {/* Inline Domain Configuration Input Card */}
              <div className="rounded-2xl bg-white p-4 border border-[#E5E5E5] shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#737373] block">
                  Update Domain Name
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="e.g. kishore7ga-college.edu.in"
                    className="flex-1 bg-[#FAFAFA] border border-[#E5E5E5] rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-[#171717] focus:bg-white focus:border-[#171717] focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={handleSaveDomain}
                    className="rounded-xl bg-[#171717] hover:bg-black px-4 py-2.5 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer shrink-0"
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
      {/* 3. RIGHT FLOATING ACTION TOOLBAR (Refined Compact Rail) */}
      {/* ========================================================= */}
      <aside className="hidden xl:flex w-[68px] shrink-0 bg-white border-l border-[#E5E5E5] flex-col items-center justify-between py-6 px-2 h-full z-40">
        {/* Top Tools */}
        <div className="flex flex-col items-center gap-5 w-full">
          {/* Lightning Fast Deploy */}
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="h-10 w-10 rounded-xl bg-[#FAFAFA] hover:bg-[#F5F5F3] border border-[#E5E5E5] flex items-center justify-center text-[#171717] hover:scale-105 transition cursor-pointer shadow-2xs"
            title="Instant Fast Deploy ⚡"
          >
            <Zap className="h-4 w-4 fill-[#171717]" />
          </button>

          {/* New project */}
          <button
            type="button"
            onClick={() => {
              const p = prompt("Enter new project/page name:");
              if (p) showToast(`Created project "${p}"`);
            }}
            className="flex flex-col items-center gap-1 text-center text-[#737373] hover:text-[#171717] transition cursor-pointer group"
            title="New project"
          >
            <div className="h-9 w-9 rounded-xl bg-[#FAFAFA] group-hover:bg-[#F5F5F3] border border-[#E5E5E5] flex items-center justify-center transition">
              <FolderPlus className="h-4 w-4 text-[#171717]" />
            </div>
            <span className="text-[9px] font-bold leading-tight">
              New<br />project
            </span>
          </button>

          {/* Add task */}
          <button
            type="button"
            onClick={() => {
              const t = prompt("Enter new task title:");
              if (t) showToast(`Added task "${t}"`);
            }}
            className="flex flex-col items-center gap-1 text-center text-[#737373] hover:text-[#171717] transition cursor-pointer group"
            title="Add new task"
          >
            <div className="h-9 w-9 rounded-xl bg-[#FAFAFA] group-hover:bg-[#F5F5F3] border border-[#E5E5E5] flex items-center justify-center transition">
              <CheckSquare className="h-4 w-4 text-[#171717]" />
            </div>
            <span className="text-[9px] font-bold leading-tight">
              Add new<br />task
            </span>
          </button>

          {/* Project chat */}
          <button
            type="button"
            onClick={() => showToast("Opening XITE Support Team Chat")}
            className="flex flex-col items-center gap-1 text-center text-[#737373] hover:text-[#171717] transition cursor-pointer group"
            title="Project chat"
          >
            <div className="h-9 w-9 rounded-xl bg-[#FAFAFA] group-hover:bg-[#F5F5F3] border border-[#E5E5E5] flex items-center justify-center transition">
              <MessageSquare className="h-4 w-4 text-[#171717]" />
            </div>
            <span className="text-[9px] font-bold leading-tight">
              Project<br />chat
            </span>
          </button>
        </div>

        {/* Bottom Collaborator Stack */}
        <div className="flex flex-col items-center gap-2">
          {/* Avatar 1 */}
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-[#171717] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              K
            </div>
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#10B981] border-2 border-white" />
          </div>

          {/* Avatar 2 */}
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
            alt="Colleague"
            className="h-8 w-8 rounded-full object-cover shadow-xs border border-white"
          />

          {/* Avatar 3 */}
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
            alt="Editor"
            className="h-8 w-8 rounded-full object-cover shadow-xs border border-white"
          />

          {/* Plus invite button */}
          <button
            type="button"
            onClick={() => {
              const em = prompt("Invite team member email:");
              if (em) showToast(`Invitation sent to ${em}`);
            }}
            className="h-8 w-8 rounded-full border border-[#E5E5E5] bg-[#FAFAFA] hover:bg-[#F5F5F3] flex items-center justify-center text-[#171717] transition cursor-pointer"
            title="Invite member"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>
    </div>,
    document.body
  );
}
