"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
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
  LogOut,
  User,
  Copy,
  Sparkles,
  CheckCircle2,
  Clock,
  Terminal,
  Activity,
  Layers,
  Search,
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
  const [customDomain, setCustomDomain] = useState(`${subdomain}-college.edu.in`);
  const [savedDomain, setSavedDomain] = useState(`${subdomain}-college.edu.in`);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${text} to clipboard`);
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

  const NAV_ITEMS = [
    { id: "domain", label: "Custom Domain & SSL", icon: Globe },
    { id: "team", label: "Team Access & Roles", icon: Users },
    { id: "security", label: "Password & Security", icon: Key },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "advanced", label: "Advanced Settings", icon: Sliders },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/65 backdrop-blur-md p-4 sm:p-6 overflow-y-auto font-sans select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000000] flex items-center gap-2.5 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-black text-white shadow-2xl border border-slate-800"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Center Modal Dialog Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-5xl h-[88vh] max-h-[850px] flex flex-col rounded-3xl bg-white text-slate-900 shadow-[0_30px_90px_rgba(0,0,0,0.35)] border border-slate-200/90 overflow-hidden"
      >
        {/* Top Modal Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/90 px-3 py-1.5 text-xs font-extrabold text-slate-800 shadow-2xs hover:bg-slate-200 transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Editor</span>
            </button>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-tight text-slate-900">
                XITE Studio Settings
              </span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 border border-blue-200/60">
                {subdomain}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href={`/site/${subdomain}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer active:scale-[0.99]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Visit Live Site</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Split Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50/70">
          {/* Left Sidebar Menu */}
          <aside className="w-full md:w-64 shrink-0 border-r border-slate-200/80 bg-white/70 p-3.5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Settings Menu
              </div>
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-150 text-left cursor-pointer",
                      isActive
                        ? "bg-slate-900 text-white font-extrabold shadow-md shadow-slate-900/10"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom User Card */}
            <div className="pt-3 mt-3 border-t border-slate-200/80">
              <div className="flex items-center gap-2.5 rounded-xl bg-slate-100/80 p-2.5 border border-slate-200/70">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-black text-[11px] shadow-sm">
                  K
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate text-xs font-extrabold text-slate-900">Kishore</span>
                  <span className="truncate text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Owner Account
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            {/* TAB 1: DOMAIN & SSL */}
            {activeTab === "domain" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Publishing &amp; Custom Domain Settings
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Configure A Record, CNAME, and SSL certificate hosting for your website.
                  </p>
                </div>

                {/* Card 1: Primary Custom Domain */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-900/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        PRIMARY CUSTOM DOMAIN
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900">College Domain Routing</h3>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 border border-emerald-200/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>SSL Active &amp; Connected</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Domain Name / Subdomain Address</label>
                    <div className="flex flex-col sm:flex-row items-center gap-2.5">
                      <input
                        type="text"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        placeholder="e.g. yourcollege.edu.in"
                        className="flex-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={handleSaveDomain}
                        className="w-full sm:w-auto rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer active:scale-95"
                      >
                        Save Domain
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 2: Production Hero Banner */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>PRODUCTION LIVE</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>Last deployed {lastDeployedTime}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black tracking-tight text-white">
                      Publish Website to Production
                    </h3>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                      Target URL:{" "}
                      <a
                        href={`https://${savedDomain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-blue-400 hover:underline font-bold"
                      >
                        https://{savedDomain}
                      </a>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={publishing}
                      className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      {publishing ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Rocket className="h-3.5 w-3.5" />
                      )}
                      <span>{publishing ? "Deploying..." : "Publish to Production"}</span>
                    </button>

                    <a
                      href={`/site/${subdomain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-slate-700 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Visit Live Site</span>
                    </a>
                  </div>
                </div>

                {/* Card 3: DNS Instructions Table */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-900/5 space-y-3.5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      DNS CONFIGURATION INSTRUCTIONS
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Point your domain's DNS records to our servers
                    </h3>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/90 text-slate-600 font-extrabold text-[10px] uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3.5">TYPE</th>
                          <th className="py-2.5 px-3.5">HOST / NAME</th>
                          <th className="py-2.5 px-3.5">TARGET VALUE</th>
                          <th className="py-2.5 px-3.5">STATUS</th>
                          <th className="py-2.5 px-3.5 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        <tr className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3.5 font-mono font-bold text-blue-600">A</td>
                          <td className="py-3 px-3.5 font-mono">@</td>
                          <td className="py-3 px-3.5 font-mono font-bold">76.76.21.21</td>
                          <td className="py-3 px-3.5">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                              <Check className="h-3 w-3" /> Active
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => copyToClipboard("76.76.21.21", "a-record")}
                              className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3.5 font-mono font-bold text-blue-600">CNAME</td>
                          <td className="py-3 px-3.5 font-mono">www</td>
                          <td className="py-3 px-3.5 font-mono font-bold">cname.xite.co.in</td>
                          <td className="py-3 px-3.5">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                              <Check className="h-3 w-3" /> Active
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => copyToClipboard("cname.xite.co.in", "cname-record")}
                              className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3.5 font-mono font-bold text-blue-600">TXT</td>
                          <td className="py-3 px-3.5 font-mono">_xite-challenge</td>
                          <td className="py-3 px-3.5 font-mono font-bold text-slate-500 truncate max-w-[180px]">
                            xite-auth-verification-token-9884
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                              <Check className="h-3 w-3" /> Active
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                copyToClipboard("xite-auth-verification-token-9884", "txt-record")
                              }
                              className="rounded-lg bg-slate-100 p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TEAM ACCESS */}
            {activeTab === "team" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Team Access &amp; Roles
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Manage collaborators, administrators, and web content editors for your institution.
                  </p>
                </div>

                {/* Invite Card */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-900/5 space-y-3.5">
                  <h3 className="text-sm font-extrabold text-slate-900">Invite New Team Member</h3>
                  <form onSubmit={handleInviteMember} className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@institution.edu"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                    >
                      <option value="Administrator">Administrator</option>
                      <option value="Content Editor">Content Editor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                    >
                      Send Invitation
                    </button>
                  </form>
                </div>

                {/* Team Members List */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-900/5 space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900">Active Collaborators</h3>
                  <div className="divide-y divide-slate-100">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-800 font-extrabold text-xs">
                            {member.name[0]}
                          </div>
                          <div>
                            <div className="text-xs font-extrabold text-slate-900">{member.name}</div>
                            <div className="text-[10px] font-medium text-slate-400">{member.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                            {member.role}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600">● {member.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PASSWORD & SECURITY */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Password &amp; Security
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Manage authentication credentials and multi-factor security protections.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-900/5 space-y-3.5">
                  <h3 className="text-sm font-extrabold text-slate-900">Change Account Password</h3>
                  <form onSubmit={handleUpdatePassword} className="space-y-3 max-w-md">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                    >
                      Update Password
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-900/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Two-Factor Authentication (2FA)</h3>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                      Secure your account with Google Authenticator or SMS OTP verification.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      showToast(`2FA ${!twoFactorEnabled ? "enabled" : "disabled"}`);
                    }}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border-2 border-transparent",
                      twoFactorEnabled ? "bg-emerald-600" : "bg-slate-200"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Notifications &amp; Alerts
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Choose which alerts and email digests you want to receive.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-900/5 divide-y divide-slate-100">
                  {[
                    { key: "deployment", label: "Production Deployment Success", desc: "Get notified when a new version goes live." },
                    { key: "ssl", label: "SSL Certificate Auto-Renewal", desc: "Receive advance notice when certificates refresh." },
                    { key: "security", label: "Security & Login Alerts", desc: "Get alerts on new device logins or password changes." },
                    { key: "analytics", label: "Weekly Traffic & Analytics Summary", desc: "Receive weekly visitor counts and pageview statistics." },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{item.label}</h4>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">{item.desc}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEmailAlerts((prev) => ({
                            ...prev,
                            [item.key as keyof typeof emailAlerts]: !prev[item.key as keyof typeof emailAlerts],
                          }));
                          showToast(`Notification preferences updated`);
                        }}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border-2 border-transparent",
                          emailAlerts[item.key as keyof typeof emailAlerts] ? "bg-slate-900" : "bg-slate-200"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            emailAlerts[item.key as keyof typeof emailAlerts] ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: ADVANCED */}
            {activeTab === "advanced" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900">
                    Advanced Settings &amp; Custom Code
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Configure search engine indexing, maintenance mode, and custom header scripts.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-900/5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">Search Engine Indexing (SEO)</h4>
                      <p className="text-[10px] font-medium text-slate-400">Allow Google and Bing to crawl your website pages.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSeoIndexing(!seoIndexing);
                        showToast(`SEO indexing ${!seoIndexing ? "enabled" : "disabled"}`);
                      }}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
                        seoIndexing ? "bg-emerald-600" : "bg-slate-200"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-5 w-5 rounded-full bg-white shadow transition",
                          seoIndexing ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">Maintenance Mode</h4>
                      <p className="text-[10px] font-medium text-slate-400">Display a temporary maintenance banner to visitors.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMaintenanceMode(!maintenanceMode);
                        showToast(`Maintenance mode ${!maintenanceMode ? "activated" : "deactivated"}`);
                      }}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200",
                        maintenanceMode ? "bg-amber-600" : "bg-slate-200"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-5 w-5 rounded-full bg-white shadow transition",
                          maintenanceMode ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md shadow-slate-900/5 space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900">Custom &lt;head&gt; Code Injection</h4>
                  <p className="text-[10px] font-medium text-slate-400">Insert custom analytics tags, tracking pixels, or chat widgets.</p>
                  <textarea
                    rows={4}
                    value={headerScript}
                    onChange={(e) => setHeaderScript(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-950 p-3.5 font-mono text-xs font-semibold text-emerald-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => showToast("Custom header code saved")}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-slate-800 transition cursor-pointer"
                  >
                    Save Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
