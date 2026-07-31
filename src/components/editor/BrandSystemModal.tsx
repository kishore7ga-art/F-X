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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 font-sans select-none pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-[640px] max-h-[92vh] w-[940px] max-w-full overflow-hidden rounded-3xl bg-[#0B0F19] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] border border-slate-800/80 my-auto"
      >
        {/* Left Sidebar Menu */}
        <div className="flex w-[250px] shrink-0 flex-col justify-between border-r border-slate-800/80 bg-[#0A0D16] p-5">
          <div className="space-y-6">
            {/* Header / Brand */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white font-black text-lg shadow-inner border border-slate-700/60">
                X
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate tracking-tight">
                  {college.name || "Xite Platform"}
                </h3>
                <span className="text-[10px] font-mono font-semibold text-emerald-400/90 truncate bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-md mt-0.5 inline-block">
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
                    ? "bg-slate-800/90 text-white shadow-sm ring-1 ring-white/10 border border-slate-700/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Globe className={`h-4 w-4 shrink-0 ${activeTab === "domain" ? "text-indigo-400" : "text-slate-400"}`} />
                <span>Custom Domain &amp; DNS</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "users"
                    ? "bg-slate-800/90 text-white shadow-sm ring-1 ring-white/10 border border-slate-700/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Users className={`h-4 w-4 shrink-0 ${activeTab === "users" ? "text-indigo-400" : "text-slate-400"}`} />
                <span>User Management</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("security")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "security"
                    ? "bg-slate-800/90 text-white shadow-sm ring-1 ring-white/10 border border-slate-700/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Key className={`h-4 w-4 shrink-0 ${activeTab === "security" ? "text-indigo-400" : "text-slate-400"}`} />
                <span>Password &amp; Security</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("subscription")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "subscription"
                    ? "bg-slate-800/90 text-white shadow-sm ring-1 ring-white/10 border border-slate-700/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <CreditCard className={`h-4 w-4 shrink-0 ${activeTab === "subscription" ? "text-indigo-400" : "text-slate-400"}`} />
                <span>Subscription Plan</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("transactions")}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "transactions"
                    ? "bg-slate-800/90 text-white shadow-sm ring-1 ring-white/10 border border-slate-700/50"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Receipt className={`h-4 w-4 shrink-0 ${activeTab === "transactions" ? "text-indigo-400" : "text-slate-400"}`} />
                <span>Transaction History</span>
              </button>
            </nav>
          </div>

          {/* Bottom Actions: Dashboard & Sign Out */}
          <div className="space-y-2 border-t border-slate-800/80 pt-4">
            <Link
              href="/"
              className="flex w-full items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-slate-400" />
              <span>Back to Dashboard</span>
            </Link>

            {canSignOut && (
              <form action={logout}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-xl border border-rose-900/40 bg-rose-950/20 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-900/30 hover:border-rose-900/60 transition cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Main Content Panel */}
        <div className="flex flex-1 flex-col overflow-hidden bg-[#0F172A] text-slate-100">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-[#0F172A]/90 px-8 py-5 backdrop-blur-md">
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                {activeTab === "domain" && "Publishing & Custom Domain Settings"}
                {activeTab === "users" && "User Management & Permissions"}
                {activeTab === "security" && "Password & Account Security"}
                {activeTab === "subscription" && "Subscription & Institutional Plan"}
                {activeTab === "transactions" && "Transaction History & Invoices"}
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
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
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* TAB 1: DOMAIN & DNS */}
            {activeTab === "domain" && (
              <div className="space-y-6">

                {/* 1. PRIMARY CUSTOM DOMAIN CARD (TOP) */}
                <div className="rounded-2xl border border-slate-800/90 bg-[#1E293B]/70 p-5 space-y-3.5 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Primary Custom Domain
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full shadow-inner">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      SSL Active &amp; Connected
                    </span>
                  </div>

                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="e.g. www.yourcollege.edu.in"
                      className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2.5 text-xs font-mono font-medium text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition"
                    />
                    <button
                      type="button"
                      onClick={() => alert(`Domain ${customDomain} saved!`)}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 active:scale-95 transition cursor-pointer shrink-0"
                    >
                      Save Domain
                    </button>
                  </div>
                </div>

                {/* 2. PROMINENT VERCEL-STYLE PRODUCTION DEPLOYMENT CARD (MIDDLE) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#090D16] via-[#0F172A] to-[#090D16] text-white p-6 shadow-2xl border border-emerald-500/30 space-y-5 ring-1 ring-emerald-500/10">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Production Live
                        </span>
                        {prodDeployedAt && (
                          <span className="text-xs font-medium text-slate-400 truncate">
                            • Last deployed {prodDeployedAt}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-extrabold text-white tracking-tight">
                        Publish Website to Production
                      </h3>
                      <p className="text-xs text-slate-300">
                        Pushes all saved changes and page layouts live to <span className="font-mono font-bold text-emerald-400 underline decoration-slate-700">{customDomain}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handlePublishToProduction}
                      disabled={isDeploying}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold px-6 py-3 text-xs shadow-[0_0_25px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {isDeploying ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
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
                    <div className="rounded-xl bg-slate-950 border border-emerald-500/40 p-3.5 flex items-center gap-3 text-xs font-medium text-emerald-400 shadow-inner">
                      <RefreshCw className="h-4 w-4 animate-spin text-emerald-400 shrink-0" />
                      <span>{deployStep}</span>
                    </div>
                  )}

                  {/* Target URL Footer Bar */}
                  <div className="border-t border-slate-800/90 pt-4 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 text-slate-400 truncate">
                      <span>Target URL:</span>
                      <span className="font-mono font-semibold text-slate-200 truncate">https://{customDomain}</span>
                    </div>
                    <a
                      href={`https://${customDomain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 font-bold text-emerald-400 hover:text-emerald-300 transition shrink-0 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1 rounded-lg"
                    >
                      <span>Visit Live Site</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* 3. DNS CONFIGURATION INSTRUCTIONS & TABLE */}
                <div className="space-y-3 pt-1">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      DNS Configuration Instructions
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Point your domain registrar (GoDaddy, Cloudflare, Namecheap) to our servers using these DNS records:
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-800/80 shadow-lg bg-[#1E293B]/40 backdrop-blur-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800 tracking-wider">
                        <tr>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Host / Name</th>
                          <th className="px-4 py-3">Target Value</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Copy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70 font-medium text-slate-200">
                        <tr className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-bold text-indigo-400">A Record</td>
                          <td className="px-4 py-3 font-mono text-slate-400">@</td>
                          <td className="px-4 py-3 font-mono font-bold text-white">76.76.21.21</td>
                          <td className="px-4 py-3">
                            <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-[11px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              Connected
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleCopy("a-record", "76.76.21.21")}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                            >
                              {copiedField === "a-record" ? (
                                <Check className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </tr>

                        <tr className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-bold text-indigo-400">CNAME</td>
                          <td className="px-4 py-3 font-mono text-slate-400">www</td>
                          <td className="px-4 py-3 font-mono font-bold text-white">cname.xite-platform.com</td>
                          <td className="px-4 py-3">
                            <span className="text-emerald-400 font-semibold flex items-center gap-1.5 text-[11px]">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              Verified
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleCopy("cname", "cname.xite-platform.com")}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                            >
                              {copiedField === "cname" ? (
                                <Check className="h-4 w-4 text-emerald-400" />
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
                <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/50 p-4 flex gap-3 shadow-lg">
                  <input
                    type="email"
                    value={invitedEmail}
                    onChange={(e) => setInvitedEmail(e.target.value)}
                    placeholder="Enter staff email address (e.g. dean@college.edu.in)"
                    className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2 text-xs font-medium text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition"
                  />
                  <button
                    type="button"
                    onClick={handleInviteUser}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 active:scale-95 transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Invite Team Member</span>
                  </button>
                </div>

                {/* Team List */}
                <div className="overflow-hidden rounded-2xl border border-slate-800/80 shadow-lg bg-[#1E293B]/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800 tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Member</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 font-medium text-slate-200">
                      {team.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-bold text-white">{user.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[11px] font-bold text-slate-300">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[11px] font-bold ${user.status === "Active" ? "text-emerald-400" : "text-amber-400"}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setTeam((prev) => prev.filter((u) => u.id !== user.id))}
                              className="text-xs font-semibold text-rose-400 hover:text-rose-300 cursor-pointer transition"
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
                <div className="rounded-2xl border border-slate-800/80 bg-[#1E293B]/60 p-6 space-y-5 shadow-lg">
                  <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">
                        Change Account Password
                      </h4>
                      <p className="text-xs text-slate-400">
                        Update master account login credentials for this institution workspace
                      </p>
                    </div>
                  </div>

                  {passMessage && (
                    <div
                      className={`rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2.5 ${
                        passMessage.type === "success"
                          ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                          : "bg-rose-950/60 text-rose-300 border border-rose-800/60"
                      }`}
                    >
                      {passMessage.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      ) : (
                        <Lock className="h-4 w-4 shrink-0 text-rose-400" />
                      )}
                      <span>{passMessage.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2.5 text-xs font-medium text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2.5 text-xs font-medium text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={confirmPass}
                          onChange={(e) => setConfirmPass(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2.5 text-xs font-medium text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-inner transition"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingPass}
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 active:scale-95 transition cursor-pointer disabled:opacity-50"
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
                <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-[#090D16] via-[#1E1B4B]/60 to-[#090D16] text-white p-6 shadow-2xl space-y-4 ring-1 ring-indigo-500/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-full">
                        Active Plan
                      </span>
                      <h3 className="text-xl font-extrabold mt-2">Enterprise University Tier</h3>
                      <p className="text-xs text-slate-300">Unlimited sections, custom domains, priority CDN &amp; 24/7 SLA</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-white">$149</p>
                      <p className="text-[11px] text-slate-400">per month</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Next billing date: <strong className="text-white">Aug 28, 2026</strong></span>
                    <button
                      type="button"
                      onClick={() => alert("Subscription portal opened")}
                      className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-slate-100 transition cursor-pointer"
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
                <div className="overflow-hidden rounded-2xl border border-slate-800/80 shadow-lg bg-[#1E293B]/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-800 tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Invoice ID</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 font-medium text-slate-200">
                      {[
                        { id: "INV-2026-007", date: "Jul 28, 2026", amount: "$149.00", status: "Paid" },
                        { id: "INV-2026-006", date: "Jun 28, 2026", amount: "$149.00", status: "Paid" },
                        { id: "INV-2026-005", date: "May 28, 2026", amount: "$149.00", status: "Paid" },
                      ].map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3 font-mono font-bold text-white">{inv.id}</td>
                          <td className="px-4 py-3 text-slate-400">{inv.date}</td>
                          <td className="px-4 py-3 font-bold">{inv.amount}</td>
                          <td className="px-4 py-3 font-bold text-emerald-400">{inv.status}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => alert(`Downloading PDF for ${inv.id}`)}
                              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
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
