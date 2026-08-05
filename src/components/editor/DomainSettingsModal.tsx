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
  const [headerScript, setHeaderScript] = useState("<!-- Google Tag Manager / Analytics -->\n<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-XITE12345\"></script>");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
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
      }}
      className="text-slate-900 font-sans select-none"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000000] bg-slate-900 text-white text-xs font-black px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in duration-200 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navigation Bar */}
      <header className="h-18 border-b border-slate-200/90 bg-white/90 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20 shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-extrabold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Editor</span>
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <span className="text-base font-black text-slate-900 tracking-tight">XITE Studio Settings</span>
        </div>

        <a
          href={`https://${savedDomain}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <span>Visit Live Site ↗</span>
        </a>
      </header>

      {/* Main Settings Body */}
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "row",
          gap: "32px",
          padding: "32px 24px",
          boxSizing: "border-box",
        }}
        className="flex-1 min-h-0"
      >
        {/* Left Sidebar Menu */}
        <aside
          style={{ width: "240px", flexShrink: 0 }}
          className="space-y-6 flex flex-col justify-between"
        >
          <div className="space-y-2 flex flex-col">
            <button
              onClick={() => setActiveTab("domain")}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-extrabold flex items-center gap-3.5 transition-all cursor-pointer ${
                activeTab === "domain"
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              <Globe className="w-4.5 h-4.5 shrink-0" />
              <span>Custom Domain & SSL</span>
            </button>

            <button
              onClick={() => setActiveTab("team")}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-extrabold flex items-center gap-3.5 transition-all cursor-pointer ${
                activeTab === "team"
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              <Users className="w-4.5 h-4.5 shrink-0" />
              <span>Team Access & Roles</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-extrabold flex items-center gap-3.5 transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              <Key className="w-4.5 h-4.5 shrink-0" />
              <span>Password & Security</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-extrabold flex items-center gap-3.5 transition-all cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              <Bell className="w-4.5 h-4.5 shrink-0" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab("advanced")}
              className={`w-full text-left px-4 py-3.5 rounded-2xl text-xs font-extrabold flex items-center gap-3.5 transition-all cursor-pointer ${
                activeTab === "advanced"
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
              }`}
            >
              <Sliders className="w-4.5 h-4.5 shrink-0" />
              <span>Advanced Settings</span>
            </button>
          </div>

          {/* Bottom User Pill */}
          <button
            onClick={() => setShowAccountModal(true)}
            className="w-full text-left p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl shadow-sm flex items-center gap-3 transition-all cursor-pointer group"
            title="View Owner Account Details"
          >
            <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs group-hover:scale-105 transition-transform shrink-0 shadow-md">
              K
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black text-slate-900 truncate">Kishore</span>
              <span className="text-[11px] text-blue-600 font-bold group-hover:underline truncate">Owner Account · Details ↗</span>
            </div>
          </button>
        </aside>

        {/* Dynamic Content Area */}
        <main
          style={{
            flex: "1 1 0%",
            minWidth: 0,
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: "32px",
          }}
        >
          
          {/* 1. TAB: CUSTOM DOMAIN & SSL */}
          {activeTab === "domain" && (
            <>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Publishing & Custom Domain Settings</h1>
                <p className="text-sm text-slate-500 font-medium">
                  Configure A Record, CNAME, and SSL hosting for your website
                </p>
              </div>

              {/* Card 1: Primary Custom Domain */}
              <div
                style={{ width: "100%", boxSizing: "border-box" }}
                className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                      PRIMARY CUSTOM DOMAIN
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">College Domain Routing</h3>
                  </div>
                  <span className="inline-flex items-center gap-2 text-xs text-emerald-700 font-extrabold bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>SSL Active & Connected</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-extrabold text-slate-700">
                    Domain Name / Subdomain Address
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="flex-1 w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-base font-mono text-slate-900 font-bold focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-inner"
                    />
                    <button
                      onClick={handleSaveDomain}
                      className="px-7 py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-2xl transition-all cursor-pointer shadow-lg shrink-0 whitespace-nowrap"
                    >
                      Save Domain
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 2: Production Live Callout Banner */}
              <div
                style={{ width: "100%", boxSizing: "border-box" }}
                className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl space-y-6 relative overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-4 py-1.5 rounded-full uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span>PRODUCTION LIVE</span>
                  </div>
                  <span className="text-slate-400 text-xs font-medium">Last deployed Jul 31, 2026 at 05:35 AM</span>
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-black text-white">Publish Website to Production</h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Target URL: <a href={`https://${savedDomain}`} target="_blank" rel="noreferrer" className="font-mono text-blue-400 underline font-bold">{`https://${savedDomain}`}</a>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={handlePublish}
                      disabled={publishing}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Rocket className="w-4 h-4 shrink-0" />
                      <span>{publishing ? "Publishing..." : "Publish to Production"}</span>
                    </button>

                    <a
                      href={`https://${savedDomain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Visit Live Site ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 3: DNS Configuration Instructions Table */}
              <div
                style={{ width: "100%", boxSizing: "border-box" }}
                className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm space-y-6"
              >
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                    DNS CONFIGURATION INSTRUCTIONS
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    Point your domain&apos;s DNS records to our servers
                  </h3>
                </div>

                <div className="w-full overflow-x-auto rounded-2xl border border-slate-200/90 shadow-sm">
                  <table className="w-full min-w-[500px] text-left text-xs font-mono">
                    <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-600 font-black tracking-wider">
                      <tr>
                        <th className="p-4">TYPE</th>
                        <th className="p-4">HOST/NAME</th>
                        <th className="p-4">TARGET VALUE</th>
                        <th className="p-4">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 font-bold">
                      <tr className="hover:bg-slate-50">
                        <td className="p-4 text-blue-600 font-black">A</td>
                        <td className="p-4">@</td>
                        <td className="p-4">76.76.21.21</td>
                        <td className="p-4 text-emerald-600 font-extrabold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Active</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-4 text-blue-600 font-black">CNAME</td>
                        <td className="p-4">www</td>
                        <td className="p-4">cname.xite.co.in</td>
                        <td className="p-4 text-emerald-600 font-extrabold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Active</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 2. TAB: TEAM ACCESS & ROLES */}
          {activeTab === "team" && (
            <>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Access & Permissions</h1>
                <p className="text-sm text-slate-500 font-medium">
                  Manage team members, editor permissions, and role access
                </p>
              </div>

              {/* Invite Form Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm space-y-6">
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                    INVITE NEW TEAM MEMBER
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">Grant Access to Collaborators</h3>
                </div>

                <form onSubmit={handleInviteMember} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="email"
                    placeholder="colleague@institution.edu.in"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-inner"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-xs text-slate-900 font-extrabold focus:outline-none shrink-0"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Content Editor">Content Editor</option>
                    <option value="Developer">Developer</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <button
                    type="submit"
                    className="px-7 py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-2xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Send Invite</span>
                  </button>
                </form>
              </div>

              {/* Team Table Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm space-y-6">
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                    ACTIVE TEAM MEMBERS ({teamMembers.length})
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">Roster of Authorized Users</h3>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-sm">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-600 font-black tracking-wider uppercase">
                      <tr>
                        <th className="p-4">MEMBER</th>
                        <th className="p-4">ROLE</th>
                        <th className="p-4">STATUS</th>
                        <th className="p-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 font-bold">
                      {teamMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-4">
                            <div className="font-extrabold text-slate-900 text-sm">{m.name}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{m.email}</div>
                          </td>
                          <td className="p-4 font-bold text-slate-700">{m.role}</td>
                          <td className="p-4">
                            <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 text-xs font-extrabold inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{m.status}</span>
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setTeamMembers((prev) => prev.filter((x) => x.id !== m.id));
                                showToast(`Removed member ${m.name}`);
                              }}
                              className="text-rose-600 hover:text-rose-800 font-extrabold text-xs px-3 py-1.5 rounded-xl hover:bg-rose-50 cursor-pointer transition-all"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* 3. TAB: PASSWORD & SECURITY */}
          {activeTab === "security" && (
            <>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Password & Account Security</h1>
                <p className="text-sm text-slate-500 font-medium">
                  Update authentication credentials, passwords, and two-factor authentication
                </p>
              </div>

              {/* Password Form Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm space-y-6 max-w-xl">
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                    AUTHENTICATION CREDENTIALS
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">Change Account Password</h3>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1.5">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1.5">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-5 py-3.5 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-inner"
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-7 py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-2xl transition-all cursor-pointer shadow-lg"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              {/* 2FA Toggle Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Protect your studio account with authenticator app verification</p>
                </div>
                <button
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showToast(twoFactorEnabled ? "2FA disabled" : "2FA enabled & configured");
                  }}
                  className={`px-6 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md shrink-0 ${
                    twoFactorEnabled ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                  }`}
                >
                  {twoFactorEnabled ? "2FA Enabled ✓" : "Enable 2FA"}
                </button>
              </div>
            </>
          )}

          {/* 4. TAB: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Notification Preferences</h1>
                <p className="text-sm text-slate-500 font-medium">
                  Customize email notifications, deployment alerts, and security digests
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm space-y-6 max-w-3xl">
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                    ALERT SUBSCRIPTIONS
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">Email & Security Notifications</h3>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Deployment & Publishing Alerts</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Receive email confirmation every time site is published</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts.deployment}
                      onChange={(e) => setEmailAlerts({ ...emailAlerts, deployment: e.target.checked })}
                      className="w-5 h-5 accent-slate-900 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">SSL & Domain Expiry Warnings</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Get notified 30 days before domain or SSL certificate renewal</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts.ssl}
                      onChange={(e) => setEmailAlerts({ ...emailAlerts, ssl: e.target.checked })}
                      className="w-5 h-5 accent-slate-900 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Security Login Alerts</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Alert on logins from unknown devices or IP locations</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts.security}
                      onChange={(e) => setEmailAlerts({ ...emailAlerts, security: e.target.checked })}
                      className="w-5 h-5 accent-slate-900 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => showToast("Notification preferences saved!")}
                    className="px-7 py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-2xl transition-all cursor-pointer shadow-lg"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 5. TAB: ADVANCED SETTINGS */}
          {activeTab === "advanced" && (
            <>
              <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Advanced Developer Settings</h1>
                <p className="text-sm text-slate-500 font-medium">
                  Custom tracking scripts, search indexing, and maintenance controls
                </p>
              </div>

              {/* Custom Header Script Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5">
                  <Code className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest block">
                      CUSTOM HEAD SCRIPTS & ANALYTICS
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-0.5">Inject Code Into HTML Head</h3>
                  </div>
                </div>
                <textarea
                  rows={5}
                  value={headerScript}
                  onChange={(e) => setHeaderScript(e.target.value)}
                  className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-5 rounded-2xl focus:outline-none border border-slate-800 shadow-inner"
                />
                <button
                  onClick={() => showToast("Header tracking script saved!")}
                  className="px-7 py-3.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-2xl transition-all cursor-pointer shadow-lg"
                >
                  Save Custom Script
                </button>
              </div>

              {/* Maintenance Toggle Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">Maintenance Mode</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Temporarily display a maintenance notice to visitors</p>
                </div>
                <button
                  onClick={() => {
                    setMaintenanceMode(!maintenanceMode);
                    showToast(maintenanceMode ? "Maintenance mode disabled" : "Maintenance mode enabled");
                  }}
                  className={`px-6 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md shrink-0 ${
                    maintenanceMode ? "bg-amber-600 hover:bg-amber-500 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                  }`}
                >
                  {maintenanceMode ? "Maintenance Enabled" : "Disable Site"}
                </button>
              </div>
            </>
          )}

        </main>
      </div>

      {/* Account Profile & Owner Details Modal */}
      {showAccountModal && (
        <div
          onClick={() => setShowAccountModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-6 border border-slate-200 text-slate-900 cursor-default"
          >
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-black text-lg">
                  K
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Kishore Profile</h3>
                  <p className="text-xs text-slate-500 font-semibold">Platform Owner & Super Administrator</p>
                </div>
              </div>
            </div>

            {/* Account Details List */}
            <div className="space-y-2.5 text-xs font-sans">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                <span className="font-extrabold text-slate-500">Full Name</span>
                <span className="font-black text-slate-900">Kishore</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                <span className="font-extrabold text-slate-500">Email Address</span>
                <span className="font-black text-slate-900 font-mono">kishore7ga@gmail.com</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                <span className="font-extrabold text-slate-500">Account Role</span>
                <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Owner Account
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                <span className="font-extrabold text-slate-500">Assigned Campus</span>
                <span className="font-black text-slate-900">Greenfield University</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                <span className="font-extrabold text-slate-500">Subscription Plan</span>
                <span className="font-black text-blue-600">Enterprise Pro SaaS (Active)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                <span className="font-extrabold text-slate-500">Tenant Identifier</span>
                <span className="font-mono text-slate-700 font-bold">tenant_greenfield_9921a</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowAccountModal(false)}
                className="w-full py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer"
              >
                Close Account Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
