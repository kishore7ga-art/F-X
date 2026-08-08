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
  initialTab = "plan",
}: DomainSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeNav, setActiveNav] = useState(initialTab || "plan");
  const [activeProject, setActiveProject] = useState("Numero 10");
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [customDomain, setCustomDomain] = useState(`${subdomain}.edu.in`);
  const [savedDomain, setSavedDomain] = useState(`${subdomain}.edu.in`);
  const [publishing, setPublishing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackedSeconds, setTrackedSeconds] = useState(19800); // 5.5 hours

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
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#F7F2EE] text-[#1A1A1A] font-sans antialiased select-none p-3 md:p-6 overflow-y-auto min-h-screen">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000000] flex items-center gap-2.5 rounded-2xl bg-[#1A1A1A] px-6 py-3 text-xs font-black text-white shadow-2xl"
          >
            <span className="h-2 w-2 rounded-full bg-[#CEEAD6] animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3-Column Floating Layout Container with tight proportional max-width */}
      <div className="w-full max-w-[1220px] flex flex-col lg:flex-row gap-4 items-stretch relative my-auto">
        
        {/* ========================================================= */}
        {/* 1. LEFT NAVIGATION SIDEBAR (Floating Pill Column) */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-[240px] shrink-0 bg-white rounded-[28px] p-5 shadow-sm border border-[#EBE3DC]/80 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Top Brand Logo */}
            <div className="flex items-center gap-2.5 px-1">
              <div className="h-7 w-7 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-black shadow-xs">
                <div className="h-3 w-3 rounded-l-full bg-white mr-auto ml-1" />
              </div>
              <span className="text-[17px] font-black tracking-tight text-[#1A1A1A]">
                XITE Studio
              </span>
            </div>

            {/* User Profile Card */}
            <div className="flex items-center gap-3 px-1 pt-1">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#1A1A1A] to-[#444] text-white flex items-center justify-center font-black text-xs shadow-xs">
                  K
                </div>
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#34D399] border-2 border-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-extrabold text-[#1A1A1A] tracking-tight truncate">
                  Kishore
                </span>
                <span className="text-[10px] font-semibold text-[#8C827A] truncate">
                  Owner Account
                </span>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1 pt-1">
              {/* Plan (Active) */}
              <button
                type="button"
                onClick={() => setActiveNav("plan")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[12px] font-extrabold transition-all text-left cursor-pointer",
                  activeNav === "plan"
                    ? "bg-[#F4ECE4] text-[#1A1A1A]"
                    : "text-[#6B635B] hover:bg-[#F9F5F1] hover:text-[#1A1A1A]"
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Custom Domain &amp; Plan</span>
              </button>

              {/* Task List */}
              <button
                type="button"
                onClick={() => setActiveNav("tasks")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[12px] font-bold transition-all text-left cursor-pointer",
                  activeNav === "tasks"
                    ? "bg-[#F4ECE4] text-[#1A1A1A] font-extrabold"
                    : "text-[#6B635B] hover:bg-[#F9F5F1] hover:text-[#1A1A1A]"
                )}
              >
                <CheckSquare className="h-3.5 w-3.5" />
                <span>Production Tasks</span>
              </button>

              {/* Projects Collapsible Group */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                  className="flex w-full items-center justify-between rounded-2xl px-3.5 py-2 text-[12px] font-bold text-[#6B635B] hover:text-[#1A1A1A] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Folder className="h-3.5 w-3.5" />
                    <span>Pages &amp; Routes</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform duration-200 text-[#8C827A]",
                      isProjectsOpen ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </button>

                {/* Sub-projects list */}
                {isProjectsOpen && (
                  <div className="pl-5 pr-1 py-1 space-y-1.5">
                    {[
                      { name: "Home & Hero", color: "bg-[#F48FB1]" },
                      { name: "Academics", color: "bg-[#FFB74D]" },
                      { name: "Admissions", color: "bg-[#64B5F6]" },
                      { name: "Placements", color: "bg-[#42A5F5]" },
                    ].map((proj) => (
                      <button
                        key={proj.name}
                        type="button"
                        onClick={() => {
                          setActiveProject(proj.name);
                          showToast(`Selected page: ${proj.name}`);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1 text-[11px] font-bold transition-all text-left cursor-pointer",
                          activeProject === proj.name
                            ? "text-[#1A1A1A] font-extrabold"
                            : "text-[#7D756D] hover:text-[#1A1A1A]"
                        )}
                      >
                        <span className={cn("h-2 w-2 rounded-xs shrink-0", proj.color)} />
                        <span className="truncate">{proj.name}</span>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        const name = prompt("Enter new page title:");
                        if (name) showToast(`Added page "${name}"`);
                      }}
                      className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#8C827A] hover:text-[#1A1A1A] pl-2.5 pt-0.5 cursor-pointer transition-colors"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      <span>Add New</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Tags */}
              <button
                type="button"
                onClick={() => setActiveNav("tags")}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[12px] font-bold transition-all text-left cursor-pointer",
                  activeNav === "tags"
                    ? "bg-[#F4ECE4] text-[#1A1A1A] font-extrabold"
                    : "text-[#6B635B] hover:bg-[#F9F5F1] hover:text-[#1A1A1A]"
                )}
              >
                <Tag className="h-3.5 w-3.5" />
                <span>SEO &amp; Analytics</span>
              </button>
            </nav>
          </div>

          {/* Bottom Back to Editor Button */}
          <div className="pt-3 border-t border-[#F0EAE4]">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2 text-[12px] font-extrabold text-[#1A1A1A] hover:bg-[#F4ECE4] transition-all cursor-pointer w-full"
            >
              <div className="h-6 w-6 rounded-lg bg-[#1A1A1A] text-white flex items-center justify-center">
                <ArrowLeft className="h-3 w-3" />
              </div>
              <span>Back to Editor</span>
            </button>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. CENTER MAIN DASHBOARD SLATE (Floating White Slate) */}
        {/* ========================================================= */}
        <main className="flex-1 bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-[#EBE3DC]/80 flex flex-col justify-between space-y-6">
          {/* Top Date Navigation Bar */}
          <div className="flex items-center justify-between border-b border-[#F4EFEA] pb-4">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-extrabold text-[#6B635B] hover:text-[#1A1A1A] transition-colors cursor-pointer bg-white"
            >
              <span className="h-5 w-5 rounded-md border border-[#E8E0D8] flex items-center justify-center text-[10px] font-bold">
                ‹
              </span>
              <span>Back to Editor</span>
            </button>

            <h2 className="text-[15px] font-black text-[#1A1A1A] tracking-tight">
              Publishing &amp; Custom Domain Settings
            </h2>

            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production Live</span>
            </div>
          </div>

          {/* Hero Main Task Headline & Action Bar */}
          <div className="space-y-3">
            <h1 className="text-xl md:text-[24px] font-black tracking-tight text-[#1A1A1A] leading-[1.25] max-w-2xl">
              Publishing &amp; Custom Domain Settings for your College Website
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Connected domain badge and collaborator stack */}
              <div className="flex items-center gap-4">
                <div className="text-[11px] font-bold text-[#8C827A] leading-tight">
                  Domain<br />routing
                </div>
                <div className="h-5 w-px bg-[#EBE3DC]" />
                <div className="flex items-center -space-x-1.5">
                  <div className="h-8 w-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[11px] font-black border-2 border-white shadow-xs">
                    K
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                    alt="Admin"
                    className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                    alt="Editor"
                    className="h-8 w-8 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                </div>
              </div>

              {/* Chat icon + Open Button */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => showToast("DNS routing active on all 3 records! 🟢")}
                  className="h-9 w-9 rounded-xl border border-[#E8E0D8] flex items-center justify-center text-[#1A1A1A] hover:bg-[#F7F2EE] transition cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                </button>

                <a
                  href={`/site/${subdomain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[#1A1A1A] px-5 py-2 text-xs font-black text-white hover:bg-black transition-all shadow-xs active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>Open Live Site</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Split 2-Column Dashboard Grid */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
            
            {/* Left Column: Stats & Banners (5 Cols) */}
            <div className="md:col-span-5 space-y-3.5">
              <h3 className="text-[15px] font-black text-[#1A1A1A] tracking-tight">
                Stats
              </h3>

              {/* Pastel Green Banner "Good day, Kishore!" with Abstract Art */}
              <div className="rounded-[24px] bg-[#CEEAD6] p-5 relative overflow-hidden flex flex-col justify-between min-h-[145px]">
                <div className="relative z-10 space-y-2.5 max-w-[150px]">
                  <h4 className="text-[17px] font-black text-[#1A1A1A] leading-tight tracking-tight">
                    Good day,<br />Kishore!
                  </h4>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing}
                    className="rounded-lg bg-white px-3 py-1.5 text-[11px] font-extrabold text-[#1A1A1A] shadow-xs hover:bg-[#F9F5F1] transition active:scale-95 cursor-pointer inline-flex items-center gap-1"
                  >
                    {publishing ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Rocket className="h-3 w-3" />
                    )}
                    <span>{publishing ? "Deploying..." : "Start tracking"}</span>
                  </button>
                </div>

                {/* Abstract Geometric Art in Background */}
                <div className="absolute right-2 top-2 bottom-2 w-[130px] pointer-events-none flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Circle */}
                    <div className="absolute top-1 right-6 h-8 w-8 rounded-full bg-[#1A1A1A]" />
                    {/* Sparkle */}
                    <div className="absolute top-3 right-1 text-white text-base">✦</div>
                    {/* Diagonal striped wedge */}
                    <div className="absolute bottom-1 right-4 w-16 h-20 bg-[repeating-linear-gradient(45deg,#1A1A1A,#1A1A1A_3px,#CEEAD6_3px,#CEEAD6_7px)] opacity-90 transform -rotate-12 rounded-xs" />
                    {/* Yellow half-circle */}
                    <div className="absolute bottom-0 right-0 h-12 w-12 rounded-tl-full bg-[#FCE7AF]" />
                    {/* Mini zigzag triangle */}
                    <div className="absolute bottom-0 right-10 w-5 h-5 bg-[repeating-linear-gradient(90deg,#1A1A1A,#1A1A1A_2px,transparent_2px,transparent_4px)]" />
                  </div>
                </div>
              </div>

              {/* Middle 2 Mini Stats Boxes */}
              <div className="grid grid-cols-2 gap-3">
                {/* 23 Live Pages */}
                <div className="rounded-[20px] bg-[#FAF7F4] p-3.5 border border-[#EBE3DC]/60 flex flex-col justify-between">
                  <span className="text-xl font-black text-[#1A1A1A]">23</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#1A1A1A] mt-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[7px]">
                      ✓
                    </span>
                    <span>Pages live</span>
                  </div>
                </div>

                {/* 99.9% Uptime */}
                <div className="rounded-[20px] bg-[#FAF7F4] p-3.5 border border-[#EBE3DC]/60 flex flex-col justify-between">
                  <span className="text-xl font-black text-[#1A1A1A]">99,9</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#1A1A1A] mt-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[7px]">
                      ⚡
                    </span>
                    <span>Uptime score</span>
                  </div>
                </div>
              </div>

              {/* Bottom Pastel Yellow "Your daily plan" Card */}
              <div className="rounded-[24px] bg-[#FCE7AF] p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-[14px] font-black text-[#1A1A1A] tracking-tight">
                    Your daily plan
                  </h4>
                  <p className="text-[11px] font-bold text-[#6B635B] mt-0.5">
                    4 of 6 completed
                  </p>
                </div>

                {/* 70% Progress Ring Circle */}
                <div className="relative h-13 w-13 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <svg className="h-13 w-13 -rotate-90">
                    <circle
                      cx="26"
                      cy="26"
                      r="20"
                      stroke="#F4E0A0"
                      strokeWidth="4"
                      fill="transparent"
                    />
                    <circle
                      cx="26"
                      cy="26"
                      r="20"
                      stroke="#1A1A1A"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray="125"
                      strokeDashoffset="37"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-[#1A1A1A]">
                    70%
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: "Your tasks today" Task Cards List (7 Cols) */}
            <div className="md:col-span-7 space-y-3.5">
              <h3 className="text-[15px] font-black text-[#1A1A1A] tracking-tight">
                Your tasks today
              </h3>

              <div className="space-y-2.5">
                {/* Task 1: Primary Custom Domain */}
                <div
                  className="rounded-[22px] bg-white p-4 border border-[#EBE3DC] hover:border-[#D4C8BE] transition-all shadow-xs space-y-2 group cursor-pointer"
                  onClick={() => copyToClipboard("76.76.21.21", "a-record")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#8C827A]">
                      Primary Domain
                    </span>
                    <span className="text-[11px] font-extrabold text-[#8C827A]">
                      4h
                    </span>
                  </div>

                  <h4 className="text-[13px] font-black text-[#1A1A1A] group-hover:text-black transition-colors">
                    Domain routing: {savedDomain}
                  </h4>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#6B635B]">
                      <span className="h-3 w-3 rounded-full border border-[#8C827A] flex items-center justify-center text-[8px] font-bold">
                        !
                      </span>
                      <span>A-Record: 76.76.21.21 Active</span>
                    </div>
                  </div>
                </div>

                {/* Task 2: Production Hosting */}
                <div
                  className="rounded-[22px] bg-white p-4 border border-[#EBE3DC] hover:border-[#D4C8BE] transition-all shadow-xs space-y-2 group cursor-pointer"
                  onClick={() => copyToClipboard("cname.xite.co.in", "cname-rec")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#8C827A]">
                      Production Hosting
                    </span>
                    <span className="text-[11px] font-extrabold text-[#8C827A]">
                      7d
                    </span>
                  </div>

                  <h4 className="text-[13px] font-black text-[#1A1A1A] group-hover:text-black transition-colors">
                    Global CDN Edge &amp; SSL Certificate
                  </h4>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1A1A1A]">
                      <span className="h-3.5 w-3.5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[8px] font-bold">
                        1
                      </span>
                      <span>cname.xite.co.in Active</span>
                    </div>
                  </div>
                </div>

                {/* Task 3: DNS QA */}
                <div
                  className="rounded-[22px] bg-white p-4 border border-[#EBE3DC] hover:border-[#D4C8BE] transition-all shadow-xs space-y-2 group cursor-pointer"
                  onClick={() => copyToClipboard("xite-auth-token-9884", "txt-rec")}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#8C827A]">
                      DNS Security
                    </span>
                    <span className="text-[11px] font-extrabold text-[#8C827A]">
                      2h
                    </span>
                  </div>

                  <h4 className="text-[13px] font-black text-[#1A1A1A] group-hover:text-black transition-colors">
                    Cross-platform and browser QA
                  </h4>
                </div>

                {/* Quick Domain Input Box */}
                <div className="pt-1">
                  <div className="flex items-center gap-2 rounded-xl bg-[#FAF7F4] p-1.5 border border-[#EBE3DC]">
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="e.g. kishore7ga-college.edu.in"
                      className="flex-1 bg-transparent px-2.5 py-1 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveDomain}
                      className="rounded-lg bg-[#1A1A1A] px-4 py-1.5 text-[11px] font-extrabold text-white hover:bg-black transition cursor-pointer shadow-xs active:scale-95"
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
        {/* 3. RIGHT TOOL DOCK (Floating Vertical Action Bar) */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-[68px] shrink-0 bg-white rounded-[28px] p-3 shadow-sm border border-[#EBE3DC]/80 flex flex-col items-center justify-between">
          {/* Top Quick Action Tool Icons */}
          <div className="flex flex-col items-center gap-5 w-full pt-1">
            {/* ⚡ Lightning Icon */}
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="h-8 w-8 flex items-center justify-center text-[#1A1A1A] hover:scale-110 transition cursor-pointer"
              title="Instant Production Deploy ⚡"
            >
              <Zap className="h-4 w-4 fill-[#1A1A1A]" />
            </button>

            {/* New project */}
            <button
              type="button"
              onClick={() => {
                const p = prompt("New project name:");
                if (p) showToast(`Created project "${p}"`);
              }}
              className="flex flex-col items-center gap-1 text-center text-[#6B635B] hover:text-[#1A1A1A] transition cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-xl bg-[#F7F2EE] group-hover:bg-[#EFE7DF] flex items-center justify-center transition">
                <FolderPlus className="h-3.5 w-3.5 text-[#1A1A1A]" />
              </div>
              <span className="text-[9px] font-extrabold leading-tight">
                New<br />project
              </span>
            </button>

            {/* Add new task */}
            <button
              type="button"
              onClick={() => {
                const t = prompt("New task description:");
                if (t) showToast(`Added task "${t}"`);
              }}
              className="flex flex-col items-center gap-1 text-center text-[#6B635B] hover:text-[#1A1A1A] transition cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-xl bg-[#F7F2EE] group-hover:bg-[#EFE7DF] flex items-center justify-center transition">
                <CheckSquare className="h-3.5 w-3.5 text-[#1A1A1A]" />
              </div>
              <span className="text-[9px] font-extrabold leading-tight">
                Add new<br />task
              </span>
            </button>

            {/* Project chat */}
            <button
              type="button"
              onClick={() => showToast("Opening Project Team Chat")}
              className="flex flex-col items-center gap-1 text-center text-[#6B635B] hover:text-[#1A1A1A] transition cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-xl bg-[#F7F2EE] group-hover:bg-[#EFE7DF] flex items-center justify-center transition">
                <MessageSquare className="h-3.5 w-3.5 text-[#1A1A1A]" />
              </div>
              <span className="text-[9px] font-extrabold leading-tight">
                Project<br />chat
              </span>
            </button>
          </div>

          {/* Bottom Collaborator Avatars Stack */}
          <div className="flex flex-col items-center gap-2 pb-1">
            {/* Avatar 1 with green online dot */}
            <div className="relative">
              <div className="h-7 w-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[10px] font-black shadow-xs border border-white">
                K
              </div>
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#34D399] border-2 border-white" />
            </div>

            {/* Avatar 2 */}
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
              alt="Admin"
              className="h-7 w-7 rounded-full object-cover shadow-xs border border-white"
            />

            {/* Avatar 3 */}
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
              alt="Editor"
              className="h-7 w-7 rounded-full object-cover shadow-xs border border-white"
            />

            {/* Plus add collaborator button */}
            <button
              type="button"
              onClick={() => {
                const em = prompt("Invite collaborator email:");
                if (em) showToast(`Invited ${em}`);
              }}
              className="h-7 w-7 rounded-full border border-[#E8E0D8] bg-white flex items-center justify-center text-[#1A1A1A] hover:bg-[#F7F2EE] transition cursor-pointer"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </aside>
      </div>
    </div>,
    document.body
  );
}
