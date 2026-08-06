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
  Copy,
  Check,
  UserPlus,
  Mail,
  Shield,
  Lock,
  Smartphone,
  Code,
  AlertTriangle,
  RefreshCw,
  X,
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
  const [showAccountModal, setShowAccountModal] = useState(false);

  const [lastDeployedTime, setLastDeployedTime] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("xite_last_published_time");
        if (saved) return saved;
      } catch {}
    }
    return "Aug 6, 2026 at 11:25 AM";
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePublish = () => {
    setPublishing(true);
    const nowStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " at " + new Date().toLocaleTimeString("en-US", {
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
            onClick={() => setShowAccountModal(true)}
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
        </main>
      </div>
    </div>,
    document.body
  );
}
