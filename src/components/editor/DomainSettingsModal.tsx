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
  Menu,
  Shield,
  Smartphone,
  Code,
  AlertTriangle,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [customDomain, setCustomDomain] = useState(`${subdomain}.edu.in`);
  const [savedDomain, setSavedDomain] = useState(`${subdomain}.edu.in`);
  const [publishing, setPublishing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isVerifyingDNS, setIsVerifyingDNS] = useState(false);
  const [dnsStatus, setDnsStatus] = useState("All 3 DNS Records Connected");

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Advanced State
  const [seoIndexing, setSeoIndexing] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [headerScript, setHeaderScript] = useState(
    '<!-- Google Analytics / Tag Manager -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XITE12345"></script>'
  );

  const [lastDeployedTime, setLastDeployedTime] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("xite_last_published_time");
        if (saved) return saved;
      } catch {}
    }
    return "Aug 8, 2026 at 11:26 PM";
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
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

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match!");
      return;
    }
    showToast("Password updated successfully! 🔒");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const NAV_ITEMS = [
    { id: "domain", label: "Custom Domain & SSL", icon: Globe },
    { id: "deploy", label: "Production Deploy", icon: Rocket },
    { id: "security", label: "Password & Security", icon: Key },
    { id: "advanced", label: "Advanced Settings", icon: Sliders },
  ];

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        width: "100vw",
        height: "100vh",
        minHeight: "100vh",
        backgroundColor: "#F7F7F5",
        color: "#171717",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: "grid",
        gridTemplateColumns: "250px minmax(0, 1fr)",
        boxSizing: "border-box",
        overflow: "hidden",
        userSelect: "none",
      }}
      className="max-md:!flex max-md:!flex-col"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000000,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderRadius: "14px",
              backgroundColor: "#171717",
              padding: "12px 24px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#FFFFFF",
              boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10B981" }} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (250px Full Height, Sticky) */}
      {/* ========================================================= */}
      <aside
        style={{
          width: "250px",
          height: "100vh",
          position: "sticky",
          top: 0,
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E5E5E5",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxSizing: "border-box",
          zIndex: 40,
        }}
        className={cn(
          "max-md:w-full max-md:h-auto max-md:static",
          mobileMenuOpen ? "max-md:fixed max-md:inset-0 max-md:z-50 max-md:flex" : "max-md:hidden"
        )}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Top Logo & Workspace Name */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  backgroundColor: "#171717",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: 900,
                  fontSize: "12px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ width: "12px", height: "12px", borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px", backgroundColor: "#FFFFFF", marginRight: "auto", marginLeft: "4px" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#171717", lineHeight: 1.1 }}>
                  XITE Studio
                </span>
                <span style={{ fontSize: "11px", fontFamily: "monospace", fontWeight: 500, color: "#737373", marginTop: "2px" }}>
                  {subdomain}.edu.in
                </span>
              </div>
            </div>

            {/* Mobile close */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#737373" }}
            >
              <X style={{ width: "18px", height: "18px" }} />
            </button>
          </div>

          {/* User Profile Pill Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "12px",
              backgroundColor: "#FAFAFA",
              border: "1px solid #EBEBEB",
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#171717",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                K
              </div>
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                  border: "2px solid #FFFFFF",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#171717", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Kishore
              </span>
              <span style={{ fontSize: "11px", fontWeight: 500, color: "#737373", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Owner Account
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ padding: "4px 8px", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#A3A3A3" }}>
              Navigation
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveNav(item.id);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? "#F5F5F3" : "transparent",
                    color: isActive ? "#171717" : "#525252",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  <Icon style={{ width: "16px", height: "16px", color: isActive ? "#171717" : "#737373" }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Back to Editor Action */}
        <div style={{ paddingTop: "16px", borderTop: "1px solid #E5E5E5" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#171717",
              backgroundColor: "#FAFAFA",
              border: "1px solid #E5E5E5",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            <span>Back to Editor</span>
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN CONTENT AREA (Fills Remaining Viewport Width) */}
      {/* ========================================================= */}
      <main
        style={{
          minWidth: 0,
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          padding: "24px 32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxSizing: "border-box",
        }}
        className="max-md:!p-4 max-md:!h-auto"
      >
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, padding: "8px 12px", borderRadius: "8px", backgroundColor: "#FFFFFF", border: "1px solid #E5E5E5" }}
          >
            <Menu style={{ width: "14px", height: "14px" }} />
            <span>Menu</span>
          </button>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{subdomain}.edu.in</span>
          <button
            type="button"
            onClick={onClose}
            style={{ fontSize: "12px", fontWeight: 600, padding: "8px 12px", borderRadius: "8px", backgroundColor: "#FFFFFF", border: "1px solid #E5E5E5" }}
          >
            Exit
          </button>
        </div>

        {/* Top Header Row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              fontWeight: 500,
              color: "#737373",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            <span>Back to Editor</span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#047857",
                backgroundColor: "#ECFDF5",
                padding: "4px 10px",
                borderRadius: "20px",
                border: "1px solid #A7F3D0",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }} />
              <span>Production Live</span>
            </div>

            <span style={{ fontSize: "12px", color: "#A3A3A3", fontWeight: 400 }} className="hidden sm:inline">
              Last deployed {lastDeployedTime}
            </span>

            <button
              type="button"
              onClick={() => showToast("DNS routing active across all edge nodes 🟢")}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                border: "1px solid #E5E5E5",
                backgroundColor: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#171717",
                cursor: "pointer",
              }}
              title="DNS Verification Info"
            >
              <MessageSquare style={{ width: "14px", height: "14px" }} />
            </button>

            <a
              href={`/site/${subdomain}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "8px",
                backgroundColor: "#171717",
                color: "#FFFFFF",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                cursor: "pointer",
              }}
            >
              <span>Open Live Site</span>
              <ArrowUpRight style={{ width: "14px", height: "14px" }} />
            </a>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: CUSTOM DOMAIN & SSL */}
        {/* ========================================================= */}
        {activeNav === "domain" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Page Eyebrow & Title */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                Domain Configuration &amp; Hosting
              </span>
              <h1
                style={{
                  fontSize: "clamp(24px, 2vw, 30px)",
                  fontWeight: 700,
                  color: "#171717",
                  lineHeight: 1.15,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Publishing &amp; Custom Domain Settings for your College Website
              </h1>
            </div>

            {/* Main Dashboard 60/40 Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.45fr) minmax(360px, 0.85fr)",
                gap: "20px",
                alignItems: "start",
              }}
              className="max-lg:!grid-cols-1"
            >
              {/* LEFT COLUMN: Overview, Greeting, Stats, Daily Plan */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* A. Welcome Card */}
                <div
                  style={{
                    borderRadius: "14px",
                    backgroundColor: "#D8EEDF",
                    border: "1px solid #C2E3CB",
                    padding: "20px 24px",
                    minHeight: "130px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative", zIndex: 10, maxWidth: "240px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#2E7D32" }}>
                      Welcome back
                    </span>
                    <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#171717", lineHeight: 1.2, margin: 0, letterSpacing: "-0.01em" }}>
                      Good day,<br />Kishore!
                    </h3>
                    <div style={{ paddingTop: "4px" }}>
                      <button
                        type="button"
                        onClick={handleVerifyDNS}
                        disabled={isVerifyingDNS}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          borderRadius: "8px",
                          backgroundColor: "#FFFFFF",
                          padding: "6px 14px",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#171717",
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        }}
                      >
                        {isVerifyingDNS ? (
                          <RefreshCw style={{ width: "12px", height: "12px" }} className="animate-spin" />
                        ) : (
                          <Check style={{ width: "12px", height: "12px", strokeWidth: 3 }} />
                        )}
                        <span>{isVerifyingDNS ? "Verifying..." : "Start tracking"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Contained Abstract Art Illustration */}
                  <div style={{ width: "140px", height: "100px", position: "relative", pointerEvents: "none", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: "4px", right: "24px", width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#171717" }} />
                    <div style={{ position: "absolute", top: "14px", right: "4px", color: "#FFFFFF", fontSize: "14px", fontWeight: 900 }}>✦</div>
                    <div style={{ position: "absolute", bottom: "4px", right: "16px", width: "64px", height: "72px", backgroundImage: "repeating-linear-gradient(45deg,#171717,#171717 3px,#D8EEDF 3px,#D8EEDF 7px)", opacity: 0.9, transform: "rotate(-12deg)", borderRadius: "2px" }} />
                    <div style={{ position: "absolute", bottom: 0, right: 0, width: "48px", height: "48px", borderTopLeftRadius: "48px", backgroundColor: "#FCE7AF" }} />
                    <div style={{ position: "absolute", bottom: 0, right: "40px", width: "20px", height: "20px", backgroundImage: "repeating-linear-gradient(90deg,#171717,#171717 2px,transparent 2px,transparent 4px)" }} />
                  </div>
                </div>

                {/* B. Statistics Row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div
                    style={{
                      border: "1px solid #E7E7E7",
                      borderRadius: "14px",
                      backgroundColor: "#FFFFFF",
                      padding: "18px 20px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxSizing: "border-box",
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                      Published Pages
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "8px" }}>
                      <span style={{ fontSize: "30px", fontWeight: 700, color: "#171717", lineHeight: 1 }}>
                        23
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600, color: "#10B981" }}>
                        <CheckCircle2 style={{ width: "14px", height: "14px" }} />
                        <span>Pages live</span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      border: "1px solid #E7E7E7",
                      borderRadius: "14px",
                      backgroundColor: "#FFFFFF",
                      padding: "18px 20px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxSizing: "border-box",
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                      CDN Speed &amp; Uptime
                    </span>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: "8px" }}>
                      <span style={{ fontSize: "30px", fontWeight: 700, color: "#171717", lineHeight: 1 }}>
                        99.9%
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 600, color: "#10B981" }}>
                        <Zap style={{ width: "14px", height: "14px", fill: "#10B981" }} />
                        <span>Tracked uptime</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* C. Daily Plan & Readiness Card */}
                <div
                  style={{
                    border: "1px solid #F5E2B3",
                    borderRadius: "14px",
                    backgroundColor: "#FDF0D0",
                    padding: "16px 20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#92400E" }}>
                      Readiness Score
                    </span>
                    <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#171717", margin: 0 }}>
                      Your daily plan &amp; SEO Health
                    </h4>
                    <p style={{ fontSize: "12px", fontWeight: 500, color: "#78350F", margin: 0 }}>
                      4 of 6 completed • {dnsStatus}
                    </p>
                  </div>

                  {/* 70% Progress Ring Circle */}
                  <div style={{ position: "relative", width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", flexShrink: 0 }}>
                    <svg style={{ width: "56px", height: "56px", transform: "rotate(-90deg)" }}>
                      <circle cx="28" cy="28" r="22" stroke="#FDE68A" strokeWidth="4" fill="transparent" />
                      <circle cx="28" cy="28" r="22" stroke="#171717" strokeWidth="4" fill="transparent" strokeDasharray="138" strokeDashoffset="41" strokeLinecap="round" />
                    </svg>
                    <span style={{ position: "absolute", fontSize: "11px", fontWeight: 700, color: "#171717" }}>
                      70%
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: "Your tasks today" & DNS Records Panel */}
              <div
                style={{
                  border: "1px solid #E7E7E7",
                  borderRadius: "14px",
                  backgroundColor: "#FFFFFF",
                  padding: "20px 24px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#171717", margin: 0 }}>
                    Your tasks today
                  </h3>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#047857", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "12px", border: "1px solid #A7F3D0" }}>
                    ● Auto SSL Active
                  </span>
                </div>

                {/* Task Row 1: Primary Domain */}
                <div
                  onClick={() => copyToClipboard("76.76.21.21", "a-rec")}
                  style={{
                    paddingBottom: "12px",
                    borderBottom: "1px solid #EEEEEE",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ fontWeight: 600, color: "#737373" }}>Primary Domain Routing</span>
                    <span style={{ fontWeight: 600, color: "#A3A3A3" }}>4h</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>
                      Domain routing: {savedDomain}
                    </h4>
                    <Copy style={{ width: "13px", height: "13px", color: "#A3A3A3" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#525252" }}>
                    <span style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#FAFAFA", border: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "#171717" }}>
                      !
                    </span>
                    <span>A-Record: <code style={{ fontFamily: "monospace", fontWeight: 600, color: "#171717" }}>76.76.21.21</code> Active</span>
                  </div>
                </div>

                {/* Task Row 2: Production Hosting */}
                <div
                  onClick={() => copyToClipboard("cname.xite.co.in", "cname-rec")}
                  style={{
                    paddingBottom: "12px",
                    borderBottom: "1px solid #EEEEEE",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ fontWeight: 600, color: "#737373" }}>Production Hosting</span>
                    <span style={{ fontWeight: 600, color: "#A3A3A3" }}>7d</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>
                      Global CDN Edge &amp; SSL Certificate
                    </h4>
                    <Copy style={{ width: "13px", height: "13px", color: "#A3A3A3" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#525252" }}>
                    <span style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: "#171717", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700 }}>
                      1
                    </span>
                    <span>CNAME: <code style={{ fontFamily: "monospace", fontWeight: 600, color: "#171717" }}>cname.xite.co.in</code></span>
                  </div>
                </div>

                {/* Task Row 3: DNS Security QA */}
                <div
                  onClick={() => copyToClipboard("xite-auth-token-9884", "txt-rec")}
                  style={{
                    paddingBottom: "12px",
                    borderBottom: "1px solid #EEEEEE",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ fontWeight: 600, color: "#737373" }}>DNS Security QA</span>
                    <span style={{ fontWeight: 600, color: "#A3A3A3" }}>2h</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>
                      Cross-platform and browser QA
                    </h4>
                    <Copy style={{ width: "13px", height: "13px", color: "#A3A3A3" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#047857", fontWeight: 500 }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981" }} />
                    <span>Let's Encrypt TLS 1.3 Active</span>
                  </div>
                </div>

                {/* Inline Domain Configuration Input Card */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingTop: "2px" }}>
                  <label style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                    Update Domain Name
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="e.g. kishore7ga-college.edu.in"
                      style={{
                        flex: 1,
                        backgroundColor: "#FAFAFA",
                        border: "1px solid #E5E5E5",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        fontWeight: 600,
                        color: "#171717",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveDomain}
                      style={{
                        borderRadius: "8px",
                        backgroundColor: "#171717",
                        color: "#FFFFFF",
                        padding: "8px 14px",
                        fontSize: "12px",
                        fontWeight: 600,
                        border: "none",
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "all 150ms ease",
                      }}
                    >
                      Save Domain
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRODUCTION DEPLOY */}
        {/* ========================================================= */}
        {activeNav === "deploy" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                Continuous Deployment &amp; Edge CDN
              </span>
              <h1 style={{ fontSize: "clamp(24px, 2vw, 30px)", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0 }}>
                Production Deployment Center
              </h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="max-lg:!grid-cols-1">
              {/* Deploy Trigger Card */}
              <div style={{ border: "1px solid #E7E7E7", borderRadius: "14px", backgroundColor: "#FFFFFF", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Rocket style={{ width: "20px", height: "20px", color: "#171717" }} />
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#171717", margin: 0 }}>Trigger Live Build</h3>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#047857", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "12px" }}>
                    🟢 Ready to deploy
                  </span>
                </div>

                <p style={{ fontSize: "13px", color: "#737373", margin: 0, lineHeight: 1.5 }}>
                  Compiles all 23 institutional college pages, builds static HTML assets, and synchronizes with the Global Edge CDN.
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "8px" }}>
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={publishing}
                    style={{
                      borderRadius: "8px",
                      backgroundColor: "#171717",
                      color: "#FFFFFF",
                      padding: "10px 20px",
                      fontSize: "13px",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    }}
                  >
                    {publishing ? (
                      <RefreshCw style={{ width: "14px", height: "14px" }} className="animate-spin" />
                    ) : (
                      <Zap style={{ width: "14px", height: "14px", fill: "#FFFFFF" }} />
                    )}
                    <span>{publishing ? "Deploying Assets..." : "Publish to Production"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast("Edge cache purged across 300+ global nodes! ⚡")}
                    style={{
                      borderRadius: "8px",
                      backgroundColor: "#FAFAFA",
                      border: "1px solid #E5E5E5",
                      padding: "10px 16px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#171717",
                      cursor: "pointer",
                    }}
                  >
                    Purge CDN Cache
                  </button>
                </div>
              </div>

              {/* Deployment Logs */}
              <div style={{ border: "1px solid #E7E7E7", borderRadius: "14px", backgroundColor: "#FFFFFF", padding: "24px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#171717", margin: 0 }}>Recent Deployment Logs</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {[
                    { commit: "build-942a", status: "Success", time: lastDeployedTime, branch: "main" },
                    { commit: "build-8efa", status: "Success", time: "Aug 8, 2026 at 09:14 PM", branch: "main" },
                    { commit: "build-018e", status: "Success", time: "Aug 7, 2026 at 04:30 PM", branch: "main" },
                  ].map((log) => (
                    <div key={log.commit} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#FAFAFA", border: "1px solid #EEEEEE", fontSize: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#171717" }}>{log.commit}</span>
                        <span style={{ color: "#737373" }}>({log.branch})</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ color: "#737373" }}>{log.time}</span>
                        <span style={{ color: "#047857", fontWeight: 600 }}>● {log.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PASSWORD & SECURITY */}
        {/* ========================================================= */}
        {activeNav === "security" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                Authentication &amp; Protection
              </span>
              <h1 style={{ fontSize: "clamp(24px, 2vw, 30px)", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0 }}>
                Password &amp; Security Settings
              </h1>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="max-lg:!grid-cols-1">
              {/* Password Form */}
              <form onSubmit={handleUpdatePassword} style={{ border: "1px solid #E7E7E7", borderRadius: "14px", backgroundColor: "#FFFFFF", padding: "24px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#171717", margin: 0 }}>Change Account Password</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#525252" }}>Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={{ backgroundColor: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#525252" }}>New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ backgroundColor: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", outline: "none" }}
                  />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#525252" }}>Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ backgroundColor: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", outline: "none" }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    borderRadius: "8px",
                    backgroundColor: "#171717",
                    color: "#FFFFFF",
                    padding: "10px 16px",
                    fontSize: "13px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    alignSelf: "flex-start",
                    marginTop: "4px",
                  }}
                >
                  Update Password
                </button>
              </form>

              {/* 2FA & Active Sessions */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* 2FA Card */}
                <div style={{ border: "1px solid #E7E7E7", borderRadius: "14px", backgroundColor: "#FFFFFF", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Two-Factor Authentication</h4>
                    <p style={{ fontSize: "12px", color: "#737373", margin: "2px 0 0 0" }}>Protects your workspace with Google Authenticator OTP.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      showToast(`2FA ${!twoFactorEnabled ? "enabled" : "disabled"}!`);
                    }}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "12px",
                      backgroundColor: twoFactorEnabled ? "#10B981" : "#E5E5E5",
                      border: "none",
                      padding: "2px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      transition: "all 200ms ease",
                    }}
                  >
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
                        transform: twoFactorEnabled ? "translateX(20px)" : "translateX(0px)",
                        transition: "transform 200ms ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    />
                  </button>
                </div>

                {/* Active Sessions */}
                <div style={{ border: "1px solid #E7E7E7", borderRadius: "14px", backgroundColor: "#FFFFFF", padding: "20px", display: "flex", flexDirection: "column", gap: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Active Browser Sessions</h4>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12px", padding: "8px 10px", backgroundColor: "#FAFAFA", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Smartphone style={{ width: "14px", height: "14px", color: "#737373" }} />
                      <span style={{ fontWeight: 600 }}>Chrome on macOS (Current)</span>
                    </div>
                    <span style={{ color: "#10B981", fontWeight: 600 }}>● Online Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ADVANCED SETTINGS */}
        {/* ========================================================= */}
        {activeNav === "advanced" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                Code Injection &amp; Indexing
              </span>
              <h1 style={{ fontSize: "clamp(24px, 2vw, 30px)", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0 }}>
                Advanced Settings &amp; Custom Code
              </h1>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Toggles */}
              <div style={{ border: "1px solid #E7E7E7", borderRadius: "14px", backgroundColor: "#FFFFFF", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Search Engine Indexing (SEO)</h4>
                    <p style={{ fontSize: "12px", color: "#737373", margin: "2px 0 0 0" }}>Allows Google, Bing, and search crawlers to index your college pages.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSeoIndexing(!seoIndexing);
                      showToast(`SEO indexing ${!seoIndexing ? "enabled" : "disabled"}!`);
                    }}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "12px",
                      backgroundColor: seoIndexing ? "#10B981" : "#E5E5E5",
                      border: "none",
                      padding: "2px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      transition: "all 200ms ease",
                    }}
                  >
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#FFFFFF", transform: seoIndexing ? "translateX(20px)" : "translateX(0px)", transition: "transform 200ms ease" }} />
                  </button>
                </div>

                <div style={{ height: "1px", backgroundColor: "#EEEEEE" }} />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Maintenance Mode</h4>
                    <p style={{ fontSize: "12px", color: "#737373", margin: "2px 0 0 0" }}>Shows a temporary maintenance announcement to website visitors.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMaintenanceMode(!maintenanceMode);
                      showToast(`Maintenance mode ${!maintenanceMode ? "activated" : "deactivated"}!`);
                    }}
                    style={{
                      width: "44px",
                      height: "24px",
                      borderRadius: "12px",
                      backgroundColor: maintenanceMode ? "#F59E0B" : "#E5E5E5",
                      border: "none",
                      padding: "2px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      transition: "all 200ms ease",
                    }}
                  >
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#FFFFFF", transform: maintenanceMode ? "translateX(20px)" : "translateX(0px)", transition: "transform 200ms ease" }} />
                  </button>
                </div>
              </div>

              {/* Code Injection */}
              <div style={{ border: "1px solid #E7E7E7", borderRadius: "14px", backgroundColor: "#FFFFFF", padding: "24px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Custom &lt;head&gt; Code Injection</h4>
                <p style={{ fontSize: "12px", color: "#737373", margin: 0 }}>Inject custom Google Analytics tags, Facebook Pixel, or third-party chat widgets.</p>
                <textarea
                  rows={4}
                  value={headerScript}
                  onChange={(e) => setHeaderScript(e.target.value)}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    border: "1px solid #E5E5E5",
                    backgroundColor: "#171717",
                    color: "#34D399",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    padding: "12px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => showToast("Custom header script saved successfully! 💾")}
                  style={{
                    borderRadius: "8px",
                    backgroundColor: "#171717",
                    color: "#FFFFFF",
                    padding: "8px 16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    alignSelf: "flex-start",
                  }}
                >
                  Save Code
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>,
    document.body
  );
}
