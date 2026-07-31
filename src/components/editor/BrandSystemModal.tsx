"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Globe,
  Users,
  CreditCard,
  Receipt,
  LogOut,
  X,
  CheckCircle2,
  Copy,
  Plus,
  RefreshCw,
  Key,
  Lock,
  ShieldCheck,
  Building2,
  LayoutDashboard,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import { logout } from "@/app/actions/auth";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

export function BrandSystemModal({
  college,
  canSignOut = true,
  onClose,
}: {
  college: {
    id: string;
    name: string;
    subdomain: string;
    customDomain?: string | null;
    status: string;
  };
  canSignOut?: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<
    "domain" | "users" | "security" | "subscription" | "transactions"
  >("domain");

  const [customDomain, setCustomDomain] = useState(
    college.customDomain || `${college.subdomain}.edu.in`
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [invitedEmail, setInvitedEmail] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<string | null>(null);
  const [prodDeployedAt, setProdDeployedAt] = useState<string | null>("Jul 31, 2026 at 05:35 AM");

  const handlePublishToProduction = () => {
    setIsDeploying(true);
    setDeployStep("Building production static bundle...");
    setTimeout(() => {
      setDeployStep("Provisioning SSL & Edge CDN nodes...");
      setTimeout(() => {
        setIsDeploying(false);
        setDeployStep(null);
        setProdDeployedAt("Just now");
      }, 1200);
    }, 1000);
  };

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passMessage, setPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSavingPass, setIsSavingPass] = useState(false);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass || !newPass || !confirmPass) {
      setPassMessage({ type: "error", text: "Please fill in all password fields." });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }
    if (newPass.length < 6) {
      setPassMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    setIsSavingPass(true);
    setPassMessage(null);
    setTimeout(() => {
      setIsSavingPass(false);
      setPassMessage({ type: "success", text: "Password updated successfully!" });
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => setPassMessage(null), 3500);
    }, 800);
  };

  const [team, setTeam] = useState([
    { id: "1", name: "Administrator (You)", email: "admin@" + college.subdomain + ".edu.in", role: "Owner", status: "Active" },
    { id: "2", name: "Faculty Coordinator", email: "dean@" + college.subdomain + ".edu.in", role: "Editor", status: "Active" },
  ]);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInviteUser = () => {
    if (!invitedEmail) return;
    setTeam((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: invitedEmail.split("@")[0],
        email: invitedEmail,
        role: "Editor",
        status: "Invited",
      },
    ]);
    setInvitedEmail("");
  };

  const modalNode = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 font-sans select-none pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-[640px] max-h-[92vh] w-[940px] max-w-full overflow-hidden rounded-3xl bg-white shadow-[0_30px_90px_-15px_rgba(0,0,0,0.12)] border border-slate-200/90 my-auto"
      >
        {/* Left Sidebar Menu (Light Theme - Slate 50) */}
        <div className="flex w-[250px] shrink-0 flex-col justify-between border-r border-slate-100 bg-slate-50/70 p-5">
          <div className="space-y-6">
            {/* Header / Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white font-extrabold text-lg shadow-sm">
                X
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate tracking-tight">
                  {college.name || "Xite Platform"}
                </h3>
                <span className="text-[10px] font-mono font-semibold text-slate-500 truncate bg-slate-200/60 border border-slate-200 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                  {college.subdomain}.xite.com
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => setActiveTab("domain")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "domain"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Globe className={`h-4 w-4 shrink-0 ${activeTab === "domain" ? "text-indigo-600" : "text-slate-500"}`} />
                <span>Custom Domain &amp; DNS</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "users"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Users className={`h-4 w-4 shrink-0 ${activeTab === "users" ? "text-indigo-600" : "text-slate-500"}`} />
                <span>User Management</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "security"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Key className={`h-4 w-4 shrink-0 ${activeTab === "security" ? "text-indigo-600" : "text-slate-500"}`} />
                <span>Password &amp; Security</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("subscription")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "subscription"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <CreditCard className={`h-4 w-4 shrink-0 ${activeTab === "subscription" ? "text-indigo-600" : "text-slate-500"}`} />
                <span>Subscription Plan</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("transactions")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "transactions"
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Receipt className={`h-4 w-4 shrink-0 ${activeTab === "transactions" ? "text-indigo-600" : "text-slate-500"}`} />
                <span>Transaction History</span>
              </button>
            </nav>
          </div>

          {/* Bottom Actions: Dashboard & Sign Out */}
          <div className="space-y-2 border-t border-slate-200/80 pt-4">
            <Link
              href="/"
              className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 transition"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-slate-500" />
              <span>Back to Dashboard</span>
            </Link>

            {canSignOut && (
              <form action={logout}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-xl border border-red-200/70 bg-red-50/50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Main Content Panel (Light Theme) */}
        <div className="flex flex-1 flex-col overflow-hidden bg-white text-slate-900">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 px-8 py-5 bg-white">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                {activeTab === "domain" && "Publishing & Custom Domain Settings"}
                {activeTab === "users" && "User Management & Permissions"}
                {activeTab === "security" && "Password & Account Security"}
                {activeTab === "subscription" && "Subscription & Institutional Plan"}
                {activeTab === "transactions" && "Transaction History & Invoices"}
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {activeTab === "domain" && "Configure A Record, CNAME, and SSL hosting for your website"}
                {activeTab === "users" && "Manage staff access, team roles, and pending invitations"}
                {activeTab === "security" && "Update master account login password and security credentials"}
                {activeTab === "subscription" && "View active tier, feature quotas, and billing details"}
                {activeTab === "transactions" && "Download past receipts and payment statements"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200/80 bg-slate-50 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* TAB 1: DOMAIN & DNS */}
            {activeTab === "domain" && (
              <div className="space-y-6">

                {/* 1. PRIMARY CUSTOM DOMAIN CARD (TOP LIGHT THEME) */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Primary Custom Domain
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      SSL Active &amp; Connected
                    </span>
                  </div>

                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="e.g. www.yourcollege.edu.in"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-mono font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => alert(`Domain ${customDomain} saved!`)}
                      className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition cursor-pointer shrink-0"
                    >
                      Save Domain
                    </button>
                  </div>
                </div>

                {/* 2. ELEGANT LIGHT THEME PRODUCTION DEPLOYMENT CARD (MIDDLE) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/60 via-slate-50 to-teal-50/40 border border-emerald-200/80 p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Production Live
                        </span>
                        {prodDeployedAt && (
                          <span className="text-xs font-medium text-slate-500 truncate">
                            • Last deployed {prodDeployedAt}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                        Publish Website to Production
                      </h3>
                      <p className="text-xs text-slate-600">
                        Pushes all saved changes and page layouts live to <span className="font-mono font-bold text-slate-900 underline decoration-emerald-400">{customDomain}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePublishToProduction}
                      disabled={isDeploying}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3 text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isDeploying ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-white" />
                          <span>Deploying...</span>
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 stroke-[2.5]" />
                          <span>Publish to Production</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Live Deploy Steps Progress Banner */}
                  {isDeploying && (
                    <div className="rounded-xl bg-white border border-emerald-300/80 p-3.5 flex items-center gap-3 text-xs font-medium text-emerald-700 shadow-inner">
                      <RefreshCw className="h-4 w-4 animate-spin text-emerald-600 shrink-0" />
                      <span>{deployStep}</span>
                    </div>
                  )}

                  {/* Target URL Footer Bar */}
                  <div className="border-t border-emerald-200/70 pt-4 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 text-slate-600 truncate">
                      <span>Target URL:</span>
                      <span className="font-mono font-bold text-slate-900 truncate">https://{customDomain}</span>
                    </div>
                    <a
                      href={`https://${customDomain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 transition shrink-0 bg-white border border-emerald-200 px-3 py-1 rounded-lg shadow-2xs"
                    >
                      <span>Visit Live Site</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* 3. DNS CONFIGURATION INSTRUCTIONS & TABLE */}
                <div className="space-y-3 pt-1">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      DNS Configuration Instructions
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Point your domain registrar (GoDaddy, Cloudflare, Namecheap) to our servers using these DNS records:
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-2xs bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/80 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Host / Name</th>
                          <th className="px-4 py-3">Target Value</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Copy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        <tr className="hover:bg-slate-50/60 transition">
                          <td className="px-4 py-3 font-bold text-indigo-600">A Record</td>
                          <td className="px-4 py-3 font-mono text-slate-600">@</td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">76.76.21.21</td>
                          <td className="px-4 py-3">
                            <span className="text-emerald-600 font-semibold flex items-center gap-1.5 text-[11px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Connected
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleCopy("a-record", "76.76.21.21")}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                            >
                              {copiedField === "a-record" ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-50/60 transition">
                          <td className="px-4 py-3 font-bold text-indigo-600">CNAME</td>
                          <td className="px-4 py-3 font-mono text-slate-600">www</td>
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">cname.xite-platform.com</td>
                          <td className="px-4 py-3">
                            <span className="text-emerald-600 font-semibold flex items-center gap-1.5 text-[11px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Verified
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleCopy("cname", "cname.xite-platform.com")}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                            >
                              {copiedField === "cname" ? (
                                <Check className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: USER MANAGEMENT */}
            {activeTab === "users" && (
              <div className="space-y-6">
                {/* Invite Box */}
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 flex gap-3 shadow-2xs">
                  <input
                    type="email"
                    value={invitedEmail}
                    onChange={(e) => setInvitedEmail(e.target.value)}
                    placeholder="Enter staff email address (e.g. dean@college.edu.in)"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs transition"
                  />
                  <button
                    type="button"
                    onClick={handleInviteUser}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 active:scale-95 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Invite Team Member</span>
                  </button>
                </div>

                {/* Team List */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-2xs bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Member</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {team.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-bold text-slate-900">{user.name}</p>
                              <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-bold ${user.status === "Active" ? "text-emerald-600" : "text-amber-600"}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setTeam((prev) => prev.filter((u) => u.id !== user.id))}
                              className="text-xs font-semibold text-red-500 hover:text-red-700 cursor-pointer transition"
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
            )}

            {/* TAB 3: PASSWORD & SECURITY */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 space-y-5 shadow-2xs">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xs">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                        Change Account Password
                      </h4>
                      <p className="text-xs text-slate-500">
                        Update master account login credentials for this institution workspace
                      </p>
                    </div>
                  </div>

                  {passMessage && (
                    <div
                      className={`rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2.5 ${
                        passMessage.type === "success"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {passMessage.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <Lock className="h-4 w-4 shrink-0 text-red-500" />
                      )}
                      <span>{passMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs transition"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingPass}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 active:scale-95 transition cursor-pointer disabled:opacity-50"
                      >
                        {isSavingPass ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-3.5 w-3.5 text-white" />
                            <span>Update Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 4: SUBSCRIPTION MANAGEMENT */}
            {activeTab === "subscription" && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-900 bg-slate-900 text-white p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-full">
                        Active Plan
                      </span>
                      <h3 className="text-xl font-bold mt-2">Enterprise University Tier</h3>
                      <p className="text-xs text-slate-300">Unlimited sections, custom domains, priority CDN &amp; 24/7 SLA</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold">$149</p>
                      <p className="text-[11px] text-slate-400">per month</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Next billing date: <strong className="text-white">Aug 28, 2026</strong></span>
                    <button
                      type="button"
                      onClick={() => alert("Subscription portal opened")}
                      className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-100 transition cursor-pointer"
                    >
                      Manage Plan &amp; Billing
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: TRANSACTION HISTORY */}
            {activeTab === "transactions" && (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-2xs bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Invoice ID</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {[
                        { id: "INV-2026-007", date: "Jul 28, 2026", amount: "$149.00", status: "Paid" },
                        { id: "INV-2026-006", date: "Jun 28, 2026", amount: "$149.00", status: "Paid" },
                        { id: "INV-2026-005", date: "May 28, 2026", amount: "$149.00", status: "Paid" },
                      ].map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">{inv.id}</td>
                          <td className="px-4 py-3 text-slate-500">{inv.date}</td>
                          <td className="px-4 py-3 font-bold">{inv.amount}</td>
                          <td className="px-4 py-3 font-bold text-emerald-600">{inv.status}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => alert(`Downloading PDF for ${inv.id}`)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                            >
                              PDF Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  return mounted ? createPortal(modalNode, document.body) : null;
}
