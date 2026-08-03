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

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] text-slate-900 font-sans flex flex-col overflow-y-auto select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in duration-200">
          {toastMessage}
        </div>
      )}

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
          className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <span>Visit Live Site ↗</span>
        </a>
      </header>

      {/* Main Settings Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 p-8">
        
        {/* Left Sidebar Menu */}
        <aside className="space-y-6 flex flex-col justify-between h-[calc(100vh-120px)] sticky top-24">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("domain")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer ${
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
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "team"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Team Access & Roles</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Password & Security</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab("advanced")}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all cursor-pointer ${
                activeTab === "advanced"
                  ? "bg-slate-900 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-200/60"
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Advanced Settings</span>
            </button>
          </div>

          {/* Bottom User Pill */}
          <button
            onClick={() => setShowAccountModal(true)}
            className="w-full text-left p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm flex items-center gap-3 transition-all cursor-pointer group"
            title="View Owner Account Details"
          >
            <div className="w-8 h-8 rounded-full bg-[#0f172a] text-white flex items-center justify-center font-black text-xs group-hover:scale-105 transition-transform">
              K
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-extrabold text-slate-900">Kishore</span>
              <span className="text-[10px] text-blue-600 font-bold group-hover:underline">Owner Account · Account Details ↗</span>
            </div>
          </button>
        </aside>

        {/* Dynamic Content Area */}
        <main className="space-y-6">
          
          {/* 1. TAB: CUSTOM DOMAIN & SSL */}
          {activeTab === "domain" && (
            <>
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
                    onClick={handleSaveDomain}
                    className="px-6 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Save Domain
                  </button>
                </div>
              </div>

              {/* Card 2: Production Live Callout Banner */}
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
                      className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-extrabold text-xs rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Visit Live Site ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 3: DNS Configuration Instructions Table */}
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
            </>
          )}

          {/* 2. TAB: TEAM ACCESS & ROLES */}
          {activeTab === "team" && (
            <>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Team Access & Permissions</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Manage team members, editor permissions, and role access
                </p>
              </div>

              {/* Invite Form */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  INVITE NEW TEAM MEMBER
                </h3>
                <form onSubmit={handleInviteMember} className="flex gap-3">
                  <input
                    type="email"
                    placeholder="colleague@institution.edu.in"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Content Editor">Content Editor</option>
                    <option value="Developer">Developer</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Send Invite</span>
                  </button>
                </form>
              </div>

              {/* Team Table */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  ACTIVE TEAM MEMBERS ({teamMembers.length})
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                      <tr>
                        <th className="p-3">MEMBER</th>
                        <th className="p-3">ROLE</th>
                        <th className="p-3">STATUS</th>
                        <th className="p-3 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800 font-semibold">
                      {teamMembers.map((m) => (
                        <tr key={m.id}>
                          <td className="p-3">
                            <div className="font-extrabold text-slate-900">{m.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{m.email}</div>
                          </td>
                          <td className="p-3 font-bold text-slate-700">{m.role}</td>
                          <td className="p-3">
                            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px] font-extrabold">
                              {m.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setTeamMembers((prev) => prev.filter((x) => x.id !== m.id));
                                showToast(`Removed member ${m.name}`);
                              }}
                              className="text-red-600 hover:text-red-800 font-bold cursor-pointer"
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
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Password & Account Security</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Update authentication settings, passwords, and 2FA credentials
                </p>
              </div>

              {/* Password Form */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4 max-w-xl">
                <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  UPDATE PASSWORD
                </h3>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 block mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
                  >
                    Update Password
                  </button>
                </form>
              </div>

              {/* 2FA Toggle */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Two-Factor Authentication (2FA)</h3>
                  <p className="text-xs text-slate-500 mt-1">Protect your studio account with authenticator app verification</p>
                </div>
                <button
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showToast(twoFactorEnabled ? "2FA disabled" : "2FA enabled & configured");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    twoFactorEnabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {twoFactorEnabled ? "2FA Enabled" : "Enable 2FA"}
                </button>
              </div>
            </>
          )}

          {/* 4. TAB: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notification Preferences</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Customize email notifications, deployment alerts, and security digests
                </p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Deployment & Publishing Alerts</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Receive email confirmation every time site is published</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts.deployment}
                    onChange={(e) => setEmailAlerts({ ...emailAlerts, deployment: e.target.checked })}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">SSL & Domain Expiry Warnings</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Get notified 30 days before domain or SSL certificate renewal</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts.ssl}
                    onChange={(e) => setEmailAlerts({ ...emailAlerts, ssl: e.target.checked })}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Security Login Alerts</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Alert on logins from unknown devices or IP locations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts.security}
                    onChange={(e) => setEmailAlerts({ ...emailAlerts, security: e.target.checked })}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>

                <button
                  onClick={() => showToast("Notification preferences saved!")}
                  className="px-6 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Save Preferences
                </button>
              </div>
            </>
          )}

          {/* 5. TAB: ADVANCED SETTINGS */}
          {activeTab === "advanced" && (
            <>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Advanced Developer Settings</h1>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Custom tracking scripts, search indexing, and maintenance controls
                </p>
              </div>

              {/* Custom Header Script */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                    CUSTOM HEAD SCRIPTS & ANALYTICS
                  </h3>
                </div>
                <textarea
                  rows={4}
                  value={headerScript}
                  onChange={(e) => setHeaderScript(e.target.value)}
                  className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl focus:outline-none border border-slate-800"
                />
                <button
                  onClick={() => showToast("Header tracking script saved!")}
                  className="px-6 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Save Custom Script
                </button>
              </div>

              {/* Maintenance Toggle */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Maintenance Mode</h3>
                  <p className="text-xs text-slate-500 mt-1">Temporarily display a maintenance notice to visitors</p>
                </div>
                <button
                  onClick={() => {
                    setMaintenanceMode(!maintenanceMode);
                    showToast(maintenanceMode ? "Maintenance mode disabled" : "Maintenance mode enabled");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    maintenanceMode ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-700"
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
                <span className="font-black text-slate-900 font-mono">kishore@xite.co.in</span>
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
    </div>
  );
}
