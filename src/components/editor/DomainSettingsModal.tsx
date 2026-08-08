"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Globe,
  Rocket,
  Key,
  Sliders,
  ArrowLeft,
  MessageSquare,
  ArrowUpRight,
  LogOut,
  Check,
  Copy,
  RefreshCw,
  Zap,
  CheckCircle2,
  Lock,
  Smartphone,
  Shield,
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
  initialTab = "advanced",
}: DomainSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeNav, setActiveNav] = useState(initialTab || "advanced");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [customDomain, setCustomDomain] = useState(`${subdomain}.edu.in`);
  const [savedDomain, setSavedDomain] = useState(`${subdomain}.edu.in`);
  const [publishing, setPublishing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
    return "Aug 8, 2026 at 11:30 PM";
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

  useEffect(() => {
    if (initialTab) {
      setActiveNav(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen || !mounted) return null;

  const NAV_ITEMS = [
    { id: "domain", label: "Custom Domain & SSL", icon: Globe },
    { id: "deploy", label: "Production Deploy", icon: Rocket },
    { id: "security", label: "Password & Security", icon: Key },
    { id: "advanced", label: "Advanced Settings & Custom Code", icon: Sliders },
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
        gridTemplateColumns: "76px minmax(0, 1fr)",
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
      {/* 1. LEFT SLIM ICON SIDEBAR (76px Full Height, Sticky) */}
      {/* ========================================================= */}
      <aside
        style={{
          width: "76px",
          height: "100vh",
          position: "sticky",
          top: 0,
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E5E5E5",
          padding: "24px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
          zIndex: 40,
        }}
        className="max-md:!hidden"
      >
        {/* Top Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "28px", width: "100%" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#171717",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontWeight: 900,
              fontSize: "14px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              cursor: "pointer",
            }}
            onClick={() => showToast("XITE Studio Workspace")}
            title="XITE Studio"
          >
            <div style={{ width: "14px", height: "14px", borderTopLeftRadius: "14px", borderBottomLeftRadius: "14px", backgroundColor: "#FFFFFF", marginRight: "auto", marginLeft: "5px" }} />
          </div>

          {/* Navigation Icons Group */}
          <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%" }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id)}
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "none",
                    backgroundColor: isActive ? "#F5F5F3" : "transparent",
                    color: isActive ? "#171717" : "#737373",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                  title={item.label}
                >
                  <Icon style={{ width: "20px", height: "20px", strokeWidth: isActive ? 2.2 : 1.8 }} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Exit / Back to Editor */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #E5E5E5",
            backgroundColor: "#FAFAFA",
            color: "#171717",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
          title="Back to Editor"
        >
          <LogOut style={{ width: "18px", height: "18px", transform: "rotate(180deg)" }} />
        </button>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN CONTENT AREA (Fills Remaining Viewport) */}
      {/* ========================================================= */}
      <main
        style={{
          minWidth: 0,
          width: "100%",
          height: "100vh",
          overflowY: "auto",
          padding: "32px 48px 48px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          boxSizing: "border-box",
        }}
        className="max-md:!p-4 max-md:!h-auto"
      >
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

          {/* User Profile & Details Card in Top Right */}
          <div
            onClick={() => showToast("Logged in as Kishore (Owner Account)")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "6px 14px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E5E5",
              borderRadius: "14px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
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
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                  border: "2px solid #FFFFFF",
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#171717", lineHeight: 1.2 }}>
                Kishore
              </span>
              <span style={{ fontSize: "11px", fontWeight: 500, color: "#737373", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>Owner Account</span>
                <span style={{ color: "#A3A3A3" }}>•</span>
                <span style={{ color: "#2563EB", fontWeight: 600 }}>Details ↗</span>
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 4: ADVANCED SETTINGS & CUSTOM CODE (Exact Screenshot Match) */}
        {/* ========================================================= */}
        {activeNav === "advanced" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Eyebrow & Page Title */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                CODE INJECTION &amp; INDEXING
              </span>
              <h1
                style={{
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#171717",
                  lineHeight: 1.15,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Advanced Settings &amp; Custom Code
              </h1>
            </div>

            {/* Card 1: SEO & Maintenance Toggles Card */}
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid #E5E5E5",
                backgroundColor: "#FFFFFF",
                padding: "24px 28px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                boxSizing: "border-box",
              }}
            >
              {/* Row 1: Search Engine Indexing */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>
                    Search Engine Indexing (SEO)
                  </h4>
                  <p style={{ fontSize: "12px", color: "#737373", margin: 0 }}>
                    Allows Google, Bing, and search crawlers to index your college pages.
                  </p>
                </div>

                {/* iOS-Style Toggle Switch */}
                <button
                  type="button"
                  onClick={() => {
                    setSeoIndexing(!seoIndexing);
                    showToast(`SEO indexing ${!seoIndexing ? "enabled" : "disabled"}!`);
                  }}
                  style={{
                    width: "48px",
                    height: "26px",
                    borderRadius: "13px",
                    backgroundColor: seoIndexing ? "#34D399" : "#E5E5E5",
                    border: "none",
                    padding: "3px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    transition: "background-color 200ms ease",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#FFFFFF",
                      transform: seoIndexing ? "translateX(22px)" : "translateX(0px)",
                      transition: "transform 200ms ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </button>
              </div>

              <div style={{ height: "1px", backgroundColor: "#F0F0F0" }} />

              {/* Row 2: Maintenance Mode */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>
                    Maintenance Mode
                  </h4>
                  <p style={{ fontSize: "12px", color: "#737373", margin: 0 }}>
                    Shows a temporary maintenance announcement to website visitors.
                  </p>
                </div>

                {/* iOS-Style Toggle Switch */}
                <button
                  type="button"
                  onClick={() => {
                    setMaintenanceMode(!maintenanceMode);
                    showToast(`Maintenance mode ${!maintenanceMode ? "activated" : "deactivated"}!`);
                  }}
                  style={{
                    width: "48px",
                    height: "26px",
                    borderRadius: "13px",
                    backgroundColor: maintenanceMode ? "#F59E0B" : "#E5E5E5",
                    border: "none",
                    padding: "3px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    transition: "background-color 200ms ease",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#FFFFFF",
                      transform: maintenanceMode ? "translateX(22px)" : "translateX(0px)",
                      transition: "transform 200ms ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Card 2: Custom <head> Code Injection Card */}
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid #E5E5E5",
                backgroundColor: "#FFFFFF",
                padding: "24px 28px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>
                  Custom &lt;head&gt; Code Injection
                </h4>
                <p style={{ fontSize: "12px", color: "#737373", margin: 0 }}>
                  Inject custom Google Analytics tags, Facebook Pixel, or third-party chat widgets.
                </p>
              </div>

              {/* Code Box */}
              <textarea
                rows={4}
                value={headerScript}
                onChange={(e) => setHeaderScript(e.target.value)}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #222222",
                  backgroundColor: "#0A0A0A",
                  color: "#34D399",
                  fontFamily: "'Courier New', Courier, monospace",
                  fontSize: "12px",
                  padding: "16px",
                  boxSizing: "border-box",
                  outline: "none",
                  lineHeight: "1.6",
                }}
              />

              <button
                type="button"
                onClick={() => showToast("Custom header code saved successfully! 💾")}
                style={{
                  borderRadius: "8px",
                  backgroundColor: "#171717",
                  color: "#FFFFFF",
                  padding: "9px 18px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                  transition: "all 150ms ease",
                }}
              >
                Save Code
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 1: CUSTOM DOMAIN & SSL */}
        {/* ========================================================= */}
        {activeNav === "domain" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                DOMAIN CONFIGURATION &amp; HOSTING
              </span>
              <h1
                style={{
                  fontSize: "30px",
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

            {/* Main Domain Setup Card */}
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid #E5E5E5",
                backgroundColor: "#FFFFFF",
                padding: "24px 28px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>
                  Primary Custom Domain
                </h4>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#047857", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "12px" }}>
                  ● SSL Active &amp; Connected
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                    padding: "10px 14px",
                    fontSize: "13px",
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
                    padding: "10px 18px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Save Domain
                </button>
              </div>
            </div>

            {/* DNS Instructions Table Card */}
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid #E5E5E5",
                backgroundColor: "#FFFFFF",
                padding: "24px 28px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>
                DNS Configuration Records
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { type: "A Record", host: "@", value: "76.76.21.21", status: "Active" },
                  { type: "CNAME", host: "www", value: "cname.xite.co.in", status: "Active" },
                  { type: "TXT Challenge", host: "_xite-challenge", value: "xite-auth-token-9884", status: "Active" },
                ].map((rec) => (
                  <div key={rec.type} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "8px", backgroundColor: "#FAFAFA", border: "1px solid #EEEEEE", fontSize: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontWeight: 700, color: "#171717", width: "100px" }}>{rec.type}</span>
                      <span style={{ fontFamily: "monospace", color: "#737373" }}>{rec.host}</span>
                      <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#171717" }}>{rec.value}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ color: "#047857", fontWeight: 600 }}>● {rec.status}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(rec.value, rec.type)}
                        style={{ background: "transparent", border: "none", cursor: "pointer", color: "#737373" }}
                      >
                        <Copy style={{ width: "13px", height: "13px" }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRODUCTION DEPLOY */}
        {/* ========================================================= */}
        {activeNav === "deploy" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                EDGE CDN &amp; HOSTING
              </span>
              <h1
                style={{
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#171717",
                  lineHeight: 1.15,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Production Deployment Center
              </h1>
            </div>

            <div
              style={{
                borderRadius: "14px",
                border: "1px solid #E5E5E5",
                backgroundColor: "#FFFFFF",
                padding: "24px 28px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>
                  Trigger Live Production Build
                </h4>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#047857", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "12px" }}>
                  🟢 Ready to Deploy
                </span>
              </div>

              <p style={{ fontSize: "12px", color: "#737373", margin: 0 }}>
                Compiles all 23 institutional college pages and synchronizes with the Edge CDN network.
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing}
                  style={{
                    borderRadius: "8px",
                    backgroundColor: "#171717",
                    color: "#FFFFFF",
                    padding: "10px 20px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {publishing ? (
                    <RefreshCw style={{ width: "13px", height: "13px" }} className="animate-spin" />
                  ) : (
                    <Zap style={{ width: "13px", height: "13px", fill: "#FFFFFF" }} />
                  )}
                  <span>{publishing ? "Deploying..." : "Publish to Production"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PASSWORD & SECURITY */}
        {/* ========================================================= */}
        {activeNav === "security" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                AUTHENTICATION &amp; ACCESS
              </span>
              <h1
                style={{
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#171717",
                  lineHeight: 1.15,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Password &amp; Security Settings
              </h1>
            </div>

            <form
              onSubmit={handleUpdatePassword}
              style={{
                borderRadius: "14px",
                border: "1px solid #E5E5E5",
                backgroundColor: "#FFFFFF",
                padding: "24px 28px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                maxWidth: "600px",
              }}
            >
              <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>
                Change Account Password
              </h4>

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
                  padding: "9px 18px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                }}
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </main>
    </div>,
    document.body
  );
}
