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

  // Dynamic state for tasks & tracking
  const [isTracking, setIsTracking] = useState(false);
  const [trackedSeconds, setTrackedSeconds] = useState(19800); // 5.5 hours

  const [tasks, setTasks] = useState([
    {
      id: "t1",
      project: "Numero 10",
      time: "4h",
      title: "Blog and social posts",
      tag: "Deadline is today",
      tagType: "deadline",
      completed: false,
    },
    {
      id: "t2",
      project: "Grace Aroma",
      time: "7d",
      title: "New campaign review",
      tag: "1 new feedback",
      tagType: "feedback",
      completed: false,
    },
    {
      id: "t3",
      project: "Petz App",
      time: "2h",
      title: "Cross-platform and browser QA",
      tag: null,
      tagType: null,
      completed: false,
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-[#F7F2EE] text-[#1A1A1A] font-sans antialiased select-none p-4 md:p-8 overflow-y-auto min-h-screen">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000000] flex items-center gap-2.5 rounded-2xl bg-[#1A1A1A] px-6 py-3.5 text-xs font-black text-white shadow-2xl"
          >
            <span className="h-2 w-2 rounded-full bg-[#CEEAD6] animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3-Column Floating Layout Container */}
      <div className="w-full max-w-[1440px] flex flex-col lg:flex-row gap-5 items-stretch relative">
        
        {/* ========================================================= */}
        {/* 1. LEFT NAVIGATION SIDEBAR (Floating Pill Column) */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-[260px] shrink-0 bg-white rounded-[32px] p-6 shadow-sm border border-[#EBE3DC]/80 flex flex-col justify-between min-h-[640px]">
          <div className="space-y-6">
            {/* Top Brand Logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-[#1A1A1A] flex items-center justify-center text-white text-xs font-black">
                  <div className="h-3 w-3 rounded-l-full bg-white mr-auto ml-1" />
                </div>
                <span className="text-xl font-black tracking-tight text-[#1A1A1A]">
                  Dayzer
                </span>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="flex items-center gap-3.5 pt-2">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Kristin Watson"
                  className="h-12 w-12 rounded-full object-cover shadow-sm border border-slate-100"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-extrabold text-[#1A1A1A] tracking-tight truncate">
                  Kristin Watson
                </span>
                <span className="text-[11px] font-semibold text-[#8C827A] truncate">
                  UI/UX Designer
                </span>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1.5 pt-2">
              {/* Plan (Active) */}
              <button
                type="button"
                onClick={() => setActiveNav("plan")}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-[13px] font-extrabold transition-all text-left cursor-pointer",
                  activeNav === "plan"
                    ? "bg-[#F4ECE4] text-[#1A1A1A]"
                    : "text-[#6B635B] hover:bg-[#F9F5F1] hover:text-[#1A1A1A]"
                )}
              >
                <Calendar className="h-4 w-4" />
                <span>Plan</span>
              </button>

              {/* Task List */}
              <button
                type="button"
                onClick={() => setActiveNav("tasks")}
                className={cn(
                  "flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-[13px] font-bold transition-all text-left cursor-pointer",
                  activeNav === "tasks"
                    ? "bg-[#F4ECE4] text-[#1A1A1A] font-extrabold"
                    : "text-[#6B635B] hover:bg-[#F9F5F1] hover:text-[#1A1A1A]"
                )}
              >
                <CheckSquare className="h-4 w-4" />
                <span>Task List</span>
              </button>

              {/* Projects Collapsible Group */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                  className="flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-[13px] font-bold text-[#6B635B] hover:text-[#1A1A1A] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <Folder className="h-4 w-4" />
                    <span>Projects</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200 text-[#8C827A]",
                      isProjectsOpen ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </button>

                {/* Sub-projects list */}
                {isProjectsOpen && (
                  <div className="pl-6 pr-2 py-1.5 space-y-2">
                    {[
                      { name: "Numero 10", color: "bg-[#F48FB1]" },
                      { name: "Grace Aroma", color: "bg-[#FFB74D]" },
                      { name: "Petz App", color: "bg-[#64B5F6]" },
                      { name: "Private Works", color: "bg-[#42A5F5]" },
                    ].map((proj) => (
                      <button
                        key={proj.name}
                        type="button"
                        onClick={() => {
                          setActiveProject(proj.name);
                          showToast(`Selected project: ${proj.name}`);
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
                        const name = prompt("Enter new project name:");
                        if (name) showToast(`Added project "${name}"`);
                      }}
                      className="flex items-center gap-2 text-[11px] font-extrabold text-[#8C827A] hover:text-[#1A1A1A] pl-3 pt-1 cursor-pointer transition-colors"
                    >
                      <Plus className="h-3 w-3" />
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
                  "flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-[13px] font-bold transition-all text-left cursor-pointer",
                  activeNav === "tags"
                    ? "bg-[#F4ECE4] text-[#1A1A1A] font-extrabold"
                    : "text-[#6B635B] hover:bg-[#F9F5F1] hover:text-[#1A1A1A]"
                )}
              >
                <Tag className="h-4 w-4" />
                <span>Tags</span>
              </button>
            </nav>
          </div>

          {/* Bottom Log out Button */}
          <div className="pt-4 border-t border-[#F0EAE4]">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-[13px] font-extrabold text-[#1A1A1A] hover:bg-[#F4ECE4] transition-all cursor-pointer w-full"
            >
              <div className="h-7 w-7 rounded-xl bg-[#1A1A1A] text-white flex items-center justify-center">
                <LogOut className="h-3.5 w-3.5 rotate-180" />
              </div>
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* 2. CENTER MAIN DASHBOARD SLATE (The Big Floating White Slate) */}
        {/* ========================================================= */}
        <main className="flex-1 bg-white rounded-[36px] p-7 md:p-10 shadow-sm border border-[#EBE3DC]/80 flex flex-col justify-between space-y-8">
          {/* Top Date Navigation Bar */}
          <div className="flex items-center justify-between border-b border-[#F4EFEA] pb-6">
            <button
              type="button"
              onClick={() => showToast("Navigating Archive")}
              className="flex items-center gap-2 text-xs font-extrabold text-[#6B635B] hover:text-[#1A1A1A] transition-colors cursor-pointer bg-white"
            >
              <span className="h-6 w-6 rounded-lg border border-[#E8E0D8] flex items-center justify-center text-[10px]">
                ‹
              </span>
              <span>Archive</span>
            </button>

            <h2 className="text-[17px] font-black text-[#1A1A1A] tracking-tight">
              Today's Plan
            </h2>

            <button
              type="button"
              onClick={() => showToast("Viewing This Week")}
              className="flex items-center gap-2 text-xs font-extrabold text-[#6B635B] hover:text-[#1A1A1A] transition-colors cursor-pointer bg-white"
            >
              <span>This Week</span>
              <span className="h-6 w-6 rounded-lg border border-[#E8E0D8] flex items-center justify-center text-[10px]">
                ›
              </span>
            </button>
          </div>

          {/* Hero Main Task Headline & Action Bar */}
          <div className="space-y-4">
            <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-[#1A1A1A] leading-[1.25] max-w-2xl">
              Messaging ID framework development for the marketing branch
            </h1>

            <div className="flex items-center justify-between pt-2">
              {/* Members connected stack */}
              <div className="flex items-center gap-6">
                <div className="text-[12px] font-bold text-[#8C827A] leading-tight">
                  Members<br />connected
                </div>
                <div className="h-6 w-px bg-[#EBE3DC]" />
                <div className="flex items-center -space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                    alt="Member 1"
                    className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80"
                    alt="Member 2"
                    className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                </div>
              </div>

              {/* Chat icon + Open Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => showToast("Opening project conversation")}
                  className="h-10 w-10 rounded-2xl border border-[#E8E0D8] flex items-center justify-center text-[#1A1A1A] hover:bg-[#F7F2EE] transition cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => showToast("Opening workspace project")}
                  className="rounded-2xl bg-[#1A1A1A] px-7 py-2.5 text-xs font-black text-white hover:bg-black transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Open
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Split 2-Column Dashboard Grid */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
            
            {/* Left Column: Stats & Banners (5 Cols) */}
            <div className="md:col-span-5 space-y-4">
              <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight">
                Stats
              </h3>

              {/* Pastel Green Banner "Good day, Kristin!" with Abstract Art */}
              <div className="rounded-[28px] bg-[#CEEAD6] p-6 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                <div className="relative z-10 space-y-3 max-w-[170px]">
                  <h4 className="text-xl font-black text-[#1A1A1A] leading-tight tracking-tight">
                    Good day,<br />Kristin!
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTracking(!isTracking);
                      showToast(isTracking ? "Paused time tracking" : "Started live time tracker!");
                    }}
                    className="rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-[#1A1A1A] shadow-xs hover:bg-[#F9F5F1] transition active:scale-95 cursor-pointer inline-block"
                  >
                    {isTracking ? "Stop tracking" : "Start tracking"}
                  </button>
                </div>

                {/* Abstract Geometric Art in Background */}
                <div className="absolute right-3 top-3 bottom-3 w-[150px] pointer-events-none flex items-center justify-center">
                  <div className="relative w-full h-full">
                    {/* Circle */}
                    <div className="absolute top-1 right-8 h-10 w-10 rounded-full bg-[#1A1A1A]" />
                    {/* Sparkle */}
                    <div className="absolute top-4 right-1 text-white text-lg">✦</div>
                    {/* Diagonal striped wedge */}
                    <div className="absolute bottom-2 right-6 w-20 h-24 bg-[repeating-linear-gradient(45deg,#1A1A1A,#1A1A1A_3px,#CEEAD6_3px,#CEEAD6_7px)] opacity-90 transform -rotate-12 rounded-sm" />
                    {/* Yellow half-circle */}
                    <div className="absolute bottom-0 right-0 h-16 w-16 rounded-tl-full bg-[#FCE7AF]" />
                    {/* Mini zigzag triangle */}
                    <div className="absolute bottom-0 right-14 w-6 h-6 bg-[repeating-linear-gradient(90deg,#1A1A1A,#1A1A1A_2px,transparent_2px,transparent_4px)]" />
                  </div>
                </div>
              </div>

              {/* Middle 2 Mini Stats Boxes */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* 20 Tasks finished */}
                <div className="rounded-[24px] bg-[#FAF7F4] p-4.5 border border-[#EBE3DC]/60 flex flex-col justify-between">
                  <span className="text-2xl font-black text-[#1A1A1A]">20</span>
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#1A1A1A] mt-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[8px]">
                      ✓
                    </span>
                    <span>Tasks finished</span>
                  </div>
                </div>

                {/* 5,5 Tracked hours */}
                <div className="rounded-[24px] bg-[#FAF7F4] p-4.5 border border-[#EBE3DC]/60 flex flex-col justify-between">
                  <span className="text-2xl font-black text-[#1A1A1A]">
                    {formatTrackedHours()}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#1A1A1A] mt-2">
                    <span className="h-3.5 w-3.5 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[8px]">
                      ⏱
                    </span>
                    <span>Tracked hours</span>
                  </div>
                </div>
              </div>

              {/* Bottom Pastel Yellow "Your daily plan" Card */}
              <div className="rounded-[28px] bg-[#FCE7AF] p-5 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-black text-[#1A1A1A] tracking-tight">
                    Your daily plan
                  </h4>
                  <p className="text-xs font-bold text-[#6B635B] mt-0.5">
                    4 of 6 completed
                  </p>
                </div>

                {/* 70% Progress Ring Circle */}
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
                      strokeDashoffset="48"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-[#1A1A1A]">
                    70%
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: "Your tasks today" Task Cards List (7 Cols) */}
            <div className="md:col-span-7 space-y-4">
              <h3 className="text-lg font-black text-[#1A1A1A] tracking-tight">
                Your tasks today
              </h3>

              <div className="space-y-3.5">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-[26px] bg-white p-5 border border-[#EBE3DC] hover:border-[#D4C8BE] transition-all shadow-xs space-y-3 group cursor-pointer"
                    onClick={() => {
                      showToast(`Opened task: ${task.title}`);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#8C827A]">
                        {task.project}
                      </span>
                      <span className="text-xs font-extrabold text-[#8C827A]">
                        {task.time}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-[#1A1A1A] group-hover:text-black transition-colors">
                      {task.title}
                    </h4>

                    {task.tag && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {task.tagType === "deadline" ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B635B]">
                            <span className="h-3.5 w-3.5 rounded-full border border-[#8C827A] flex items-center justify-center text-[9px] font-bold">
                              !
                            </span>
                            <span>{task.tag}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1A1A1A]">
                            <span className="h-4 w-4 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-[9px] font-bold">
                              1
                            </span>
                            <span>{task.tag}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* ========================================================= */}
        {/* 3. RIGHT TOOL DOCK / FLOATING VERTICAL ACTION BAR */}
        {/* ========================================================= */}
        <aside className="w-full lg:w-20 shrink-0 bg-white rounded-[32px] p-4 shadow-sm border border-[#EBE3DC]/80 flex flex-col items-center justify-between min-h-[640px]">
          {/* Top Quick Action Tool Icons */}
          <div className="flex flex-col items-center gap-6 w-full pt-2">
            {/* ⚡ Lightning Icon */}
            <button
              type="button"
              onClick={() => showToast("⚡ Instant Turbo Actions Ready")}
              className="h-10 w-10 flex items-center justify-center text-[#1A1A1A] hover:scale-110 transition cursor-pointer"
            >
              <Zap className="h-5 w-5 fill-[#1A1A1A]" />
            </button>

            {/* New project */}
            <button
              type="button"
              onClick={() => {
                const p = prompt("New project name:");
                if (p) showToast(`Created project "${p}"`);
              }}
              className="flex flex-col items-center gap-1.5 text-center text-[#6B635B] hover:text-[#1A1A1A] transition cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-2xl bg-[#F7F2EE] group-hover:bg-[#EFE7DF] flex items-center justify-center transition">
                <FolderPlus className="h-4 w-4 text-[#1A1A1A]" />
              </div>
              <span className="text-[10px] font-extrabold leading-tight">
                New<br />project
              </span>
            </button>

            {/* Add new task */}
            <button
              type="button"
              onClick={() => {
                const t = prompt("New task description:");
                if (t) {
                  setTasks((prev) => [
                    ...prev,
                    {
                      id: `t-${Date.now()}`,
                      project: activeProject,
                      time: "1h",
                      title: t,
                      tag: null,
                      tagType: null,
                      completed: false,
                    },
                  ]);
                  showToast(`Added new task "${t}"`);
                }
              }}
              className="flex flex-col items-center gap-1.5 text-center text-[#6B635B] hover:text-[#1A1A1A] transition cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-2xl bg-[#F7F2EE] group-hover:bg-[#EFE7DF] flex items-center justify-center transition">
                <CheckSquare className="h-4 w-4 text-[#1A1A1A]" />
              </div>
              <span className="text-[10px] font-extrabold leading-tight">
                Add new<br />task
              </span>
            </button>

            {/* Project chat */}
            <button
              type="button"
              onClick={() => showToast("Opening Project Team Chat")}
              className="flex flex-col items-center gap-1.5 text-center text-[#6B635B] hover:text-[#1A1A1A] transition cursor-pointer group"
            >
              <div className="h-10 w-10 rounded-2xl bg-[#F7F2EE] group-hover:bg-[#EFE7DF] flex items-center justify-center transition">
                <MessageSquare className="h-4 w-4 text-[#1A1A1A]" />
              </div>
              <span className="text-[10px] font-extrabold leading-tight">
                Project<br />chat
              </span>
            </button>
          </div>

          {/* Bottom Collaborator Avatars Stack */}
          <div className="flex flex-col items-center gap-2.5 pb-2">
            {/* Avatar 1 with green online dot */}
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80"
                alt="Colleague 1"
                className="h-9 w-9 rounded-full object-cover shadow-xs border border-white"
              />
              <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-[#34D399] border-2 border-white" />
            </div>

            {/* Avatar 2 */}
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&auto=format&fit=crop&q=80"
              alt="Colleague 2"
              className="h-9 w-9 rounded-full object-cover shadow-xs border border-white"
            />

            {/* Avatar 3 */}
            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80"
              alt="Colleague 3"
              className="h-9 w-9 rounded-full object-cover shadow-xs border border-white"
            />

            {/* Plus add collaborator button */}
            <button
              type="button"
              onClick={() => {
                const em = prompt("Invite collaborator email:");
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
