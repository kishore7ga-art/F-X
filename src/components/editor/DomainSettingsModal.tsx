"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Globe,
  Users,
  Key,
  Bell,
  Sliders,
  ShieldCheck,
  Rocket,
  Check,
  UserPlus,
  Mail,
  Shield,
  Lock,
  Smartphone,
  Code,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ExternalLink,
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
  subdomain = "greenfield",
  initialTab = "domain",
}: DomainSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [customDomain, setCustomDomain] = useState(`${subdomain}.edu.in`);
  const [savedDomain, setSavedDomain] = useState(`${subdomain}.edu.in`);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [lastDeployedTime, setLastDeployedTime] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("xite_last_published_time");
        if (saved) return saved;
      } catch {}
    }
    return "Aug 6, 2026 at 11:35 AM";
  });

  // Team Access State
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: "Kishore", email: "kishore@xite.co.in", role: "Owner Account", status: "Active" },
    { id: 2, name: "College Admin", email: "admin@greenfield.edu.in", role: "Administrator", status: "Active" },
    { id: 3, name: "Web Editor", email: "editor@greenfield.edu.in", role: "Content Editor", status: "Active" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Content Editor");

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Notification State
  const [emailAlerts, setEmailAlerts] = useState({
    deployment: true,
    ssl: true,
    security: true,
    analytics: false,
  });

  // Advanced State
  const [seoIndexing, setSeoIndexing] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [headerScript, setHeaderScript] = useState(
    '<!-- Google Tag Manager / Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XITE12345"></script>'
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
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
      showToast("Website published successfully to production live!");
    }, 1200);
  };

  const handleSaveDomain = () => {
    setSavedDomain(customDomain);
    showToast(`Domain saved: https://${customDomain}`);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newMember = {
      id: Date.now(),
      name: inviteEmail.split("@")[0] || "New Member",
      email: inviteEmail,
      role: inviteRole,
      status: "Invited",
    };
    setTeamMembers((prev) => [...prev, newMember]);
    setInviteEmail("");
    showToast(`Invitation sent to ${inviteEmail}`);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match!");
      return;
    }
    showToast("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        backgroundColor: "#f8fafc",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
      className="text-slate-900 font-sans select-none"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000000,
            backgroundColor: "#0f172a",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 900,
            padding: "14px 24px",
            borderRadius: "16px",
            boxShadow: "0 20px 30px -10px rgba(0,0,0,0.3)",
            border: "1px solid #334155",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34d399" }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation Bar */}
      <header
        style={{
          height: "72px",
          minHeight: "72px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          paddingLeft: "32px",
          paddingRight: "32px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "16px" }}>
          <button
            onClick={onClose}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: 800,
              color: "#334155",
              padding: "10px 18px",
              borderRadius: "14px",
              backgroundColor: "#f1f5f9",
              border: "1px solid #cbd5e1",
              cursor: "pointer",
            }}
          >
            <ArrowLeft style={{ width: "16px", height: "16px" }} />
            <span>Back to Editor</span>
          </button>
          <div style={{ height: "20px", width: "1px", backgroundColor: "#cbd5e1" }} />
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.02em" }}>
            XITE Studio Settings
          </span>
        </div>

        <a
          href={`https://${savedDomain}`}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#059669",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 900,
            paddingLeft: "22px",
            paddingRight: "22px",
            height: "44px",
            borderRadius: "14px",
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
            boxShadow: "0 8px 16px -4px rgba(5,150,105,0.3)",
          }}
        >
          <span>Visit Live Site ↗</span>
        </a>
      </header>

      {/* Main Settings Body Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "1600px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "row",
          gap: "32px",
          padding: "32px 36px",
          boxSizing: "border-box",
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Left Sidebar Menu */}
        <aside
          style={{
            width: "240px",
            minWidth: "240px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
            <button
              onClick={() => setActiveTab("domain")}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 18px",
                borderRadius: "16px",
                fontSize: "13px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                border: "none",
                backgroundColor: activeTab === "domain" ? "#0f172a" : "transparent",
                color: activeTab === "domain" ? "#ffffff" : "#475569",
                boxShadow: activeTab === "domain" ? "0 10px 20px -5px rgba(15,23,42,0.2)" : "none",
              }}
            >
              <Globe style={{ width: "18px", height: "18px", flexShrink: 0 }} />
              <span>Custom Domain & SSL</span>
            </button>

            <button
              onClick={() => setActiveTab("team")}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 18px",
                borderRadius: "16px",
                fontSize: "13px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                border: "none",
                backgroundColor: activeTab === "team" ? "#0f172a" : "transparent",
                color: activeTab === "team" ? "#ffffff" : "#475569",
                boxShadow: activeTab === "team" ? "0 10px 20px -5px rgba(15,23,42,0.2)" : "none",
              }}
            >
              <Users style={{ width: "18px", height: "18px", flexShrink: 0 }} />
              <span>Team Access & Roles</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 18px",
                borderRadius: "16px",
                fontSize: "13px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                border: "none",
                backgroundColor: activeTab === "security" ? "#0f172a" : "transparent",
                color: activeTab === "security" ? "#ffffff" : "#475569",
                boxShadow: activeTab === "security" ? "0 10px 20px -5px rgba(15,23,42,0.2)" : "none",
              }}
            >
              <Key style={{ width: "18px", height: "18px", flexShrink: 0 }} />
              <span>Password & Security</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 18px",
                borderRadius: "16px",
                fontSize: "13px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                border: "none",
                backgroundColor: activeTab === "notifications" ? "#0f172a" : "transparent",
                color: activeTab === "notifications" ? "#ffffff" : "#475569",
                boxShadow: activeTab === "notifications" ? "0 10px 20px -5px rgba(15,23,42,0.2)" : "none",
              }}
            >
              <Bell style={{ width: "18px", height: "18px", flexShrink: 0 }} />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab("advanced")}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "14px 18px",
                borderRadius: "16px",
                fontSize: "13px",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
                border: "none",
                backgroundColor: activeTab === "advanced" ? "#0f172a" : "transparent",
                color: activeTab === "advanced" ? "#ffffff" : "#475569",
                boxShadow: activeTab === "advanced" ? "0 10px 20px -5px rgba(15,23,42,0.2)" : "none",
              }}
            >
              <Sliders style={{ width: "18px", height: "18px", flexShrink: 0 }} />
              <span>Advanced Settings</span>
            </button>
          </div>

          {/* Bottom Owner User Pill */}
          <button
            style={{
              width: "100%",
              textAlign: "left",
              padding: "14px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                backgroundColor: "#0f172a",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "13px",
                flexShrink: 0,
              }}
            >
              K
            </div>
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span style={{ fontSize: "13px", fontWeight: 900, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Kishore
              </span>
              <span style={{ fontSize: "11px", color: "#2563eb", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Owner Account · Details ↗
              </span>
            </div>
          </button>
        </aside>

        {/* Dynamic Right Content Area */}
        <main
          style={{
            flex: "1 1 0%",
            minWidth: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            boxSizing: "border-box",
          }}
        >
          {/* TAB 1: CUSTOM DOMAIN & SSL */}
          {activeTab === "domain" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", margin: 0 }}>
                  Publishing & Custom Domain Settings
                </h1>
                <p style={{ fontSize: "14px", color: "#64748b", fontWeight: 500, margin: 0 }}>
                  Configure A Record, CNAME, and SSL hosting for your website
                </p>
              </div>

              {/* CARD 1: Custom Domain Input Form */}
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "24px",
                  padding: "32px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    borderBottom: "1px solid #f1f5f9",
                    paddingBottom: "16px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 900, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      PRIMARY CUSTOM DOMAIN
                    </span>
                    <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "4px 0 0 0" }}>
                      College Domain Routing
                    </h3>
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      color: "#047857",
                      fontWeight: 800,
                      backgroundColor: "#ecfdf5",
                      padding: "8px 16px",
                      borderRadius: "9999px",
                      border: "1px solid #a7f3d0",
                    }}
                  >
                    <ShieldCheck style={{ width: "16px", height: "16px", color: "#059669" }} />
                    <span>SSL Active & Connected</span>
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                  <label style={{ fontSize: "13px", fontWeight: 800, color: "#334155" }}>
                    Domain Name / Subdomain Address
                  </label>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "16px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      style={{
                        flex: "1 1 0%",
                        minWidth: 0,
                        width: "100%",
                        position: "static",
                        top: "auto",
                        right: "auto",
                        height: "54px",
                        paddingLeft: "20px",
                        paddingRight: "20px",
                        borderRadius: "16px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#f8fafc",
                        fontSize: "15px",
                        fontFamily: "monospace",
                        fontWeight: 700,
                        color: "#0f172a",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={handleSaveDomain}
                      style={{
                        position: "static",
                        top: "auto",
                        right: "auto",
                        height: "54px",
                        paddingLeft: "28px",
                        paddingRight: "28px",
                        backgroundColor: "#0f172a",
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 900,
                        borderRadius: "16px",
                        border: "none",
                        flexShrink: 0,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        boxShadow: "0 10px 25px -5px rgba(15,23,42,0.3)",
                      }}
                    >
                      Save Domain
                    </button>
                  </div>
                </div>
              </div>

              {/* CARD 2: Production Live Callout Banner */}
              <div
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  borderRadius: "24px",
                  padding: "32px",
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.12)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    borderBottom: "1px solid #1e293b",
                    paddingBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "11px",
                      fontWeight: 900,
                      color: "#34d399",
                      backgroundColor: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#34d399" }} />
                    <span>PRODUCTION LIVE</span>
                  </div>
                  <span style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>
                    Last deployed {lastDeployedTime}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    gap: "24px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#ffffff", margin: 0 }}>
                      Publish Website to Production
                    </h3>
                    <p style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500, margin: 0 }}>
                      Target URL:{" "}
                      <a
                        href={`https://${savedDomain}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#60a5fa", fontWeight: 800, fontFamily: "monospace", textDecoration: "underline" }}
                      >
                        https://{savedDomain}
                      </a>
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "14px", flexShrink: 0 }}>
                    <button
                      onClick={handlePublish}
                      disabled={publishing}
                      style={{
                        display: "inline-flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "#10b981",
                        color: "#ffffff",
                        fontWeight: 900,
                        fontSize: "13px",
                        height: "48px",
                        paddingLeft: "24px",
                        paddingRight: "24px",
                        borderRadius: "14px",
                        border: "none",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        boxShadow: "0 10px 20px -5px rgba(16,185,129,0.4)",
                      }}
                    >
                      <Rocket style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                      <span>{publishing ? "Publishing..." : "Publish to Production"}</span>
                    </button>

                    <a
                      href={`https://${savedDomain}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "8px",
                        backgroundColor: "#1e293b",
                        color: "#f1f5f9",
                        fontWeight: 800,
                        fontSize: "13px",
                        height: "48px",
                        paddingLeft: "20px",
                        paddingRight: "20px",
                        borderRadius: "14px",
                        border: "1px solid #334155",
                        textDecoration: "none",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      <span>Visit Live Site ↗</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* CARD 3: DNS Configuration Instructions Table */}
              <div
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                  borderRadius: "24px",
                  padding: "32px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 900, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    DNS CONFIGURATION INSTRUCTIONS
                  </span>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "4px 0 0 0" }}>
                    Point your domain&apos;s DNS records to our servers
                  </h3>
                </div>

                <div style={{ width: "100%", overflowX: "auto", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px", fontFamily: "monospace" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569", fontWeight: 900 }}>
                        <th style={{ padding: "16px 20px" }}>TYPE</th>
                        <th style={{ padding: "16px 20px" }}>HOST/NAME</th>
                        <th style={{ padding: "16px 20px" }}>TARGET VALUE</th>
                        <th style={{ padding: "16px 20px" }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontWeight: 700, color: "#0f172a" }}>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "16px 20px", color: "#2563eb", fontWeight: 900 }}>A</td>
                        <td style={{ padding: "16px 20px" }}>@</td>
                        <td style={{ padding: "16px 20px" }}>76.76.21.21</td>
                        <td style={{ padding: "16px 20px", color: "#059669", fontWeight: 900 }}>✓ Active</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "16px 20px", color: "#2563eb", fontWeight: 900 }}>CNAME</td>
                        <td style={{ padding: "16px 20px" }}>www</td>
                        <td style={{ padding: "16px 20px" }}>cname.xite.co.in</td>
                        <td style={{ padding: "16px 20px", color: "#059669", fontWeight: 900 }}>✓ Active</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: TEAM ACCESS & ROLES */}
          {activeTab === "team" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", margin: 0 }}>
                  Team Access & Roles
                </h1>
                <p style={{ fontSize: "14px", color: "#64748b", fontWeight: 500, margin: 0 }}>
                  Manage team collaborators, editor permissions, and access levels
                </p>
              </div>

              {/* Invite Team Member Form Card */}
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "24px",
                  padding: "32px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  boxSizing: "border-box",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 900, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    INVITE NEW TEAM MEMBER
                  </span>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "4px 0 0 0" }}>
                    Grant Access to Collaborators
                  </h3>
                </div>

                <form onSubmit={handleInviteMember} style={{ display: "flex", flexDirection: "row", gap: "14px", alignItems: "center", width: "100%" }}>
                  <input
                    type="email"
                    placeholder="colleague@greenfield.edu.in"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    style={{
                      flex: "1 1 0%",
                      height: "50px",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                      borderRadius: "14px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#f8fafc",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#0f172a",
                      outline: "none",
                    }}
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    style={{
                      height: "50px",
                      paddingLeft: "16px",
                      paddingRight: "16px",
                      borderRadius: "14px",
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0f172a",
                      cursor: "pointer",
                    }}
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Content Editor">Content Editor</option>
                    <option value="Billing Manager">Billing Manager</option>
                  </select>
                  <button
                    type="submit"
                    style={{
                      height: "50px",
                      paddingLeft: "24px",
                      paddingRight: "24px",
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 900,
                      borderRadius: "14px",
                      border: "none",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      flexShrink: 0,
                    }}
                  >
                    <UserPlus style={{ width: "16px", height: "16px" }} />
                    <span>Send Invite</span>
                  </button>
                </form>
              </div>

              {/* Team Members List Card */}
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "24px",
                  padding: "32px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  boxSizing: "border-box",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 900, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    ACTIVE COLLABORATORS ({teamMembers.length})
                  </span>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "4px 0 0 0" }}>
                    People with Access to this Project
                  </h3>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 20px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "14px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "12px",
                            backgroundColor: member.role === "Owner Account" ? "#0f172a" : "#3b82f6",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 900,
                            fontSize: "14px",
                          }}
                        >
                          {member.name[0].toUpperCase()}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{member.name}</span>
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>{member.email}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "16px" }}>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 800,
                            padding: "6px 14px",
                            borderRadius: "9999px",
                            backgroundColor: member.role === "Owner Account" ? "#e0e7ff" : "#ecfdf5",
                            color: member.role === "Owner Account" ? "#3730a3" : "#047857",
                          }}
                        >
                          {member.role}
                        </span>
                        {member.role !== "Owner Account" && (
                          <button
                            onClick={() => {
                              setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
                              showToast(`Removed ${member.name}`);
                            }}
                            style={{
                              backgroundColor: "transparent",
                              border: "none",
                              color: "#ef4444",
                              fontSize: "12px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 3: PASSWORD & SECURITY */}
          {activeTab === "security" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", margin: 0 }}>
                  Password & Security
                </h1>
                <p style={{ fontSize: "14px", color: "#64748b", fontWeight: 500, margin: 0 }}>
                  Manage credentials, 2-Factor Authentication, and active login sessions
                </p>
              </div>

              {/* Password Change Card */}
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "24px",
                  padding: "32px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  boxSizing: "border-box",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 900, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    CHANGE ACCOUNT PASSWORD
                  </span>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "4px 0 0 0" }}>
                    Update Login Credentials
                  </h3>
                </div>

                <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 800, color: "#334155" }}>Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{
                        height: "50px",
                        paddingLeft: "20px",
                        paddingRight: "20px",
                        borderRadius: "14px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#f8fafc",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", gap: "16px" }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#334155" }}>New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{
                          height: "50px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          borderRadius: "14px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#f8fafc",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#334155" }}>Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                          height: "50px",
                          paddingLeft: "20px",
                          paddingRight: "20px",
                          borderRadius: "14px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: "#f8fafc",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: "200px",
                      height: "50px",
                      marginTop: "8px",
                      backgroundColor: "#0f172a",
                      color: "#ffffff",
                      fontSize: "13px",
                      fontWeight: 900,
                      borderRadius: "14px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Update Password
                  </button>
                </form>
              </div>

              {/* 2FA Card */}
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "24px",
                  padding: "32px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    Two-Factor Authentication (2FA)
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                    Secure your account with an Authenticator App security code
                  </p>
                </div>
                <button
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showToast(`2FA ${!twoFactorEnabled ? "Enabled" : "Disabled"}`);
                  }}
                  style={{
                    height: "44px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    borderRadius: "14px",
                    fontSize: "13px",
                    fontWeight: 900,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: twoFactorEnabled ? "#ecfdf5" : "#f1f5f9",
                    color: twoFactorEnabled ? "#047857" : "#475569",
                  }}
                >
                  {twoFactorEnabled ? "✓ 2FA Enabled" : "Enable 2FA"}
                </button>
              </div>
            </>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", margin: 0 }}>
                  Notifications & Preferences
                </h1>
                <p style={{ fontSize: "14px", color: "#64748b", fontWeight: 500, margin: 0 }}>
                  Manage email alerts, deployment triggers, and security digests
                </p>
              </div>

              <div
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "24px",
                  padding: "32px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  boxSizing: "border-box",
                }}
              >
                {[
                  { key: "deployment", title: "Deployment & Publishing Alerts", desc: "Get notified when website changes are published to production live" },
                  { key: "ssl", title: "SSL & Custom Domain Health Alerts", desc: "Receive instant notifications for SSL certificate renewal or DNS issues" },
                  { key: "security", title: "Security & Login Activity Alerts", desc: "Get email warnings for new device logins or password changes" },
                  { key: "analytics", title: "Weekly Traffic & Analytics Summary", desc: "Receive weekly visitor counts and pageview reports in your inbox" },
                ].map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingBottom: "16px",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>{item.title}</span>
                      <span style={{ fontSize: "13px", color: "#64748b" }}>{item.desc}</span>
                    </div>
                    <button
                      onClick={() => {
                        setEmailAlerts((prev) => {
                          const updated = { ...prev, [item.key]: !prev[item.key as keyof typeof prev] };
                          showToast(`Notification setting updated`);
                          return updated;
                        });
                      }}
                      style={{
                        width: "56px",
                        height: "32px",
                        borderRadius: "9999px",
                        border: "none",
                        backgroundColor: emailAlerts[item.key as keyof typeof emailAlerts] ? "#0f172a" : "#cbd5e1",
                        cursor: "pointer",
                        position: "relative",
                        transition: "all 0.2s",
                      }}
                    >
                      <span
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: "#ffffff",
                          position: "absolute",
                          top: "4px",
                          left: emailAlerts[item.key as keyof typeof emailAlerts] ? "28px" : "4px",
                          transition: "all 0.2s",
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TAB 5: ADVANCED SETTINGS */}
          {activeTab === "advanced" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em", margin: 0 }}>
                  Advanced Developer Settings
                </h1>
                <p style={{ fontSize: "14px", color: "#64748b", fontWeight: 500, margin: 0 }}>
                  Inject custom scripts, configure SEO indexing, and manage project lifecycle
                </p>
              </div>

              {/* Custom Header Scripts Card */}
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#ffffff",
                  borderRadius: "24px",
                  padding: "32px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  boxSizing: "border-box",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 900, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    CUSTOM HEADER SCRIPTS
                  </span>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: "4px 0 0 0" }}>
                    Inject Analytics & Meta Tags inside &lt;head&gt;
                  </h3>
                </div>

                <textarea
                  rows={4}
                  value={headerScript}
                  onChange={(e) => setHeaderScript(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: "16px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#0f172a",
                    color: "#38bdf8",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />

                <button
                  onClick={() => showToast("Custom header scripts saved!")}
                  style={{
                    width: "180px",
                    height: "46px",
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 900,
                    borderRadius: "14px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Save Custom Scripts
                </button>
              </div>

              {/* Danger Zone Card */}
              <div
                style={{
                  width: "100%",
                  backgroundColor: "#fff1f2",
                  borderRadius: "24px",
                  padding: "32px",
                  border: "1px solid #fecdd3",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#9f1239", margin: 0 }}>
                    Unpublish Website Project
                  </h3>
                  <p style={{ fontSize: "13px", color: "#be123c", margin: 0 }}>
                    Take your website offline from production live domain
                  </p>
                </div>

                <button
                  onClick={() => showToast("Project unpublished from production")}
                  style={{
                    height: "46px",
                    paddingLeft: "24px",
                    paddingRight: "24px",
                    backgroundColor: "#e11d48",
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 900,
                    borderRadius: "14px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Unpublish Project
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>,
    document.body
  );
}
