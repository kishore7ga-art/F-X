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
  ArrowLeft,
  Sparkles,
  Check,
  Zap,
  Trash2,
  Edit3,
  Building,
  DollarSign,
  Shield,
  Calendar,
} from "lucide-react";
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

  // --- SUBSCRIPTION & PAYMENT MANAGEMENT STATE ---
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [currentPlan, setCurrentPlan] = useState<"starter" | "pro" | "enterprise">("enterprise");
  const [autoRenew, setAutoRenew] = useState(true);
  const [billingEmail, setBillingEmail] = useState(`billing@${college.subdomain}.edu.in`);
  const [taxId, setTaxId] = useState("GSTIN33AAACG1234F1Z9");
  const [selectedGateway, setSelectedGateway] = useState<"card" | "wire" | "upi">("card");
  
  const [paymentCards, setPaymentCards] = useState([
    { id: "c1", brand: "Visa", last4: "4242", exp: "08/28", holder: college.name || "University Admin", isDefault: true },
    { id: "c2", brand: "Mastercard", last4: "8899", exp: "11/27", holder: college.name || "University Admin", isDefault: false },
  ]);

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExp, setNewCardExp] = useState("");
  const [newCardCvc, setNewCardCvc] = useState("");
  const [newCardName, setNewCardName] = useState("");

  const [checkoutTargetPlan, setCheckoutTargetPlan] = useState<"starter" | "pro" | "enterprise" | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [subSaveFeedback, setSubSaveFeedback] = useState<string | null>(null);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardExp || !newCardCvc || !newCardName) return;
    const last4 = newCardNumber.slice(-4) || "9999";
    const brand = newCardNumber.startsWith("5") ? "Mastercard" : "Visa";
    setPaymentCards((prev) => [
      ...prev.map((c) => ({ ...c, isDefault: false })),
      { id: String(Date.now()), brand, last4, exp: newCardExp, holder: newCardName, isDefault: true },
    ]);
    setShowAddCardModal(false);
    setNewCardNumber("");
    setNewCardExp("");
    setNewCardCvc("");
    setNewCardName("");
  };

  const handleConfirmPlanChange = () => {
    if (!checkoutTargetPlan) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      setCurrentPlan(checkoutTargetPlan);
      setIsProcessingPayment(false);
      setCheckoutTargetPlan(null);
      setSubSaveFeedback(`Successfully updated plan to ${checkoutTargetPlan.toUpperCase()}`);
      setTimeout(() => setSubSaveFeedback(null), 4000);
    }, 1000);
  };

  const fullPageNode = (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] flex flex-col w-screen h-screen bg-slate-50 font-sans select-none overflow-hidden pointer-events-auto"
    >
      {/* Full Page Header Bar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200/90 bg-white px-8 shadow-2xs shrink-0 z-10">
        <div className="flex items-center gap-4">
          {/* Prominent Back to Editor Button */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
            <span>Back to Editor</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{college.name || "Xite Platform"} Settings</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md font-semibold">
                {college.subdomain}.xite.com
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`https://${customDomain}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-2xs"
          >
            <span>Visit Live Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {/* Full Page 2-Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="flex w-[280px] shrink-0 flex-col justify-between border-r border-slate-200/90 bg-slate-50/80 p-6">
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                System Navigation
              </span>
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("domain")}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
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
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
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
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
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
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
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
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition-all cursor-pointer ${
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

          {/* Bottom Actions */}
          <div className="space-y-2 border-t border-slate-200/80 pt-4">
            <Link
              href="/"
              className="flex w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 transition"
            >
              <LayoutDashboard className="h-4 w-4 text-slate-500" />
              <span>Back to Dashboard</span>
            </Link>

            {canSignOut && (
              <Link
                href="/login"
                onClick={() => {
                  document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                }}
                className="flex w-full items-center gap-2.5 rounded-xl border border-red-200/70 bg-red-50/50 px-3.5 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-red-500" />
                <span>Sign Out</span>
              </Link>
            )}
          </div>
        </aside>

        {/* Right Main Content Panel */}
        <main className="flex-1 overflow-y-auto bg-white p-10">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="border-b border-slate-100 pb-6">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === "domain" && "Publishing & Custom Domain Settings"}
                {activeTab === "users" && "User Management & Permissions"}
                {activeTab === "security" && "Password & Account Security"}
                {activeTab === "subscription" && "Subscription Plan & Payment Options"}
                {activeTab === "transactions" && "Transaction History & Invoices"}
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {activeTab === "domain" && "Configure A Record, CNAME, and SSL hosting for your website"}
                {activeTab === "users" && "Manage staff access, team roles, and pending invitations"}
                {activeTab === "security" && "Update master account login password and security credentials"}
                {activeTab === "subscription" && "Manage institution plans, active tier upgrades, payment cards & automated billing"}
                {activeTab === "transactions" && "Download past receipts and payment statements"}
              </p>
            </div>

            {/* TAB 1: DOMAIN & DNS */}
            {activeTab === "domain" && (
              <div className="space-y-6">

                {/* 1. PRIMARY CUSTOM DOMAIN CARD (TOP) */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Primary Custom Domain
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      SSL Active &amp; Connected
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="e.g. www.yourcollege.edu.in"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-mono font-semibold text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => alert(`Domain ${customDomain} saved!`)}
                      className="rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-slate-800 active:scale-95 transition cursor-pointer shrink-0"
                    >
                      Save Domain
                    </button>
                  </div>
                </div>

                {/* 2. ELEGANT LIGHT THEME PRODUCTION DEPLOYMENT CARD (MIDDLE) */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/60 via-slate-50 to-teal-50/40 border border-emerald-200/80 p-7 shadow-sm space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-0.5 rounded-full shrink-0">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Production Live
                        </span>
                        {prodDeployedAt && (
                          <span className="text-xs font-medium text-slate-500 truncate">
                            • Last deployed {prodDeployedAt}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
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
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-3.5 text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
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
                    <div className="rounded-xl bg-white border border-emerald-300/80 p-4 flex items-center gap-3 text-xs font-medium text-emerald-700 shadow-inner">
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
                      className="flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 transition shrink-0 bg-white border border-emerald-200 px-3.5 py-1.5 rounded-lg shadow-2xs"
                    >
                      <span>Visit Live Site</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* 3. DNS CONFIGURATION INSTRUCTIONS & TABLE */}
                <div className="space-y-4 pt-2">
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
                          <th className="px-5 py-3.5">Type</th>
                          <th className="px-5 py-3.5">Host / Name</th>
                          <th className="px-5 py-3.5">Target Value</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Copy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        <tr className="hover:bg-slate-50/60 transition">
                          <td className="px-5 py-4 font-bold text-indigo-600">A Record</td>
                          <td className="px-5 py-4 font-mono text-slate-600">@</td>
                          <td className="px-5 py-4 font-mono font-bold text-slate-900">76.76.21.21</td>
                          <td className="px-5 py-4">
                            <span className="text-emerald-600 font-semibold flex items-center gap-1.5 text-xs">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              Connected
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleCopy("a-record", "76.76.21.21")}
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
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
                          <td className="px-5 py-4 font-bold text-indigo-600">CNAME</td>
                          <td className="px-5 py-4 font-mono text-slate-600">www</td>
                          <td className="px-5 py-4 font-mono font-bold text-slate-900">cname.xite-platform.com</td>
                          <td className="px-5 py-4">
                            <span className="text-emerald-600 font-semibold flex items-center gap-1.5 text-xs">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              Verified
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleCopy("cname", "cname.xite-platform.com")}
                              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
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
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 flex gap-3 shadow-2xs">
                  <input
                    type="email"
                    value={invitedEmail}
                    onChange={(e) => setInvitedEmail(e.target.value)}
                    placeholder="Enter staff email address (e.g. dean@college.edu.in)"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs transition"
                  />
                  <button
                    type="button"
                    onClick={handleInviteUser}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 active:scale-95 transition cursor-pointer shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Invite Team Member</span>
                  </button>
                </div>

                {/* Team List */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-2xs bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Member</th>
                        <th className="px-5 py-3.5">Role</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {team.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                              <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-bold ${user.status === "Active" ? "text-emerald-600" : "text-amber-600"}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setTeam((prev) => prev.filter((u) => u.id !== user.id))}
                              className="text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer transition"
                            >
                              Remove Member
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
                <div className="rounded-2xl border border-slate-200/90 bg-white p-7 space-y-6 shadow-2xs">
                  <div className="flex items-center gap-3.5 border-b border-slate-100 pb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xs">
                      <Key className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 tracking-tight">
                        Change Account Password
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Update master account login credentials for this institution workspace
                      </p>
                    </div>
                  </div>

                  {passMessage && (
                    <div
                      className={`rounded-xl p-4 text-xs font-semibold flex items-center gap-3 ${
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

                  <form onSubmit={handleChangePassword} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPass}
                        onChange={(e) => setCurrentPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs transition"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={newPass}
                          onChange={(e) => setNewPass(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs transition"
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
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 shadow-2xs transition"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={isSavingPass}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-7 py-3 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 active:scale-95 transition cursor-pointer disabled:opacity-50"
                      >
                        {isSavingPass ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin text-white" />
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 text-white" />
                            <span>Update Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 4: FULL-FLEDGED SUBSCRIPTION PLAN & PAYMENT OPTIONS */}
            {activeTab === "subscription" && (
              <div className="space-y-8">
                {subSaveFeedback && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2.5 shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{subSaveFeedback}</span>
                  </div>
                )}

                {/* Billing Cycle Switcher */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-2xs">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Billing Cycle Frequency</h3>
                    <p className="text-xs text-slate-500">Switch to annual billing to unlock 20% discount and 2 free months</p>
                  </div>
                  <div className="flex items-center rounded-xl bg-white p-1 border border-slate-200/90 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setBillingCycle("monthly")}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                        billingCycle === "monthly"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle("annual")}
                      className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg transition ${
                        billingCycle === "annual"
                          ? "bg-slate-900 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <span>Annual</span>
                      <span className="text-[10px] bg-emerald-500 text-white font-black px-1.5 py-0.2 rounded-md uppercase">
                        Save 20%
                      </span>
                    </button>
                  </div>
                </div>

                {/* Plan Tier Selection Grid */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Select University Plan Tier
                  </h3>

                  <div className="grid grid-cols-3 gap-5">
                    {/* Tier 1: Starter */}
                    <div className={`rounded-2xl border p-6 space-y-5 transition flex flex-col justify-between ${
                      currentPlan === "starter"
                        ? "border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-600/20 shadow-md"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                    }`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-600 uppercase">Starter Campus</span>
                          {currentPlan === "starter" && (
                            <span className="text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">
                              ● Active
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-2xl font-black text-slate-900">
                            ${billingCycle === "annual" ? "24" : "29"}
                            <span className="text-xs text-slate-500 font-normal">/mo</span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Billed {billingCycle}</p>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> 1 Custom Domain</li>
                          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> 5 Staff Members</li>
                          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> Standard Edge CDN</li>
                          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> Community Support</li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => currentPlan !== "starter" && setCheckoutTargetPlan("starter")}
                        disabled={currentPlan === "starter"}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          currentPlan === "starter"
                            ? "bg-slate-100 text-slate-400 cursor-default"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                      >
                        {currentPlan === "starter" ? "Current Plan" : "Switch to Starter"}
                      </button>
                    </div>

                    {/* Tier 2: Pro */}
                    <div className={`rounded-2xl border p-6 space-y-5 transition flex flex-col justify-between ${
                      currentPlan === "pro"
                        ? "border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-600/20 shadow-md"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                    }`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-600 uppercase flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5" /> Pro University
                          </span>
                          {currentPlan === "pro" && (
                            <span className="text-[10px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-full">
                              ● Active
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-2xl font-black text-slate-900">
                            ${billingCycle === "annual" ? "64" : "79"}
                            <span className="text-xs text-slate-500 font-normal">/mo</span>
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Billed {billingCycle}</p>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> 3 Custom Domains</li>
                          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> 15 Staff Members</li>
                          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> Priority Edge CDN</li>
                          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-indigo-600" /> 99.9% Uptime SLA</li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => currentPlan !== "pro" && setCheckoutTargetPlan("pro")}
                        disabled={currentPlan === "pro"}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          currentPlan === "pro"
                            ? "bg-slate-100 text-slate-400 cursor-default"
                            : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
                        }`}
                      >
                        {currentPlan === "pro" ? "Current Plan" : "Switch to Pro"}
                      </button>
                    </div>

                    {/* Tier 3: Enterprise */}
                    <div className={`rounded-2xl border p-6 space-y-5 transition flex flex-col justify-between ${
                      currentPlan === "enterprise"
                        ? "border-slate-900 bg-slate-900 text-white shadow-xl ring-2 ring-slate-900/30"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-2xs"
                    }`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-amber-400">Enterprise</span>
                          {currentPlan === "enterprise" && (
                            <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full">
                              ● Current Plan
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-2xl font-black">
                            ${billingCycle === "annual" ? "119" : "149"}
                            <span className={`text-xs font-normal ${currentPlan === "enterprise" ? "text-slate-400" : "text-slate-500"}`}>/mo</span>
                          </p>
                          <p className={`text-[11px] mt-0.5 ${currentPlan === "enterprise" ? "text-slate-400" : "text-slate-500"}`}>Billed {billingCycle}</p>
                        </div>
                        <ul className={`space-y-2 text-xs pt-2 border-t ${currentPlan === "enterprise" ? "border-slate-800 text-slate-300" : "border-slate-100 text-slate-600"}`}>
                          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> Unlimited Domains</li>
                          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> Unlimited Staff</li>
                          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> Anycast Dedicated CDN</li>
                          <li className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-400" /> 24/7 SLA &amp; SSO/SAML</li>
                        </ul>
                      </div>

                      <button
                        type="button"
                        onClick={() => currentPlan !== "enterprise" && setCheckoutTargetPlan("enterprise")}
                        disabled={currentPlan === "enterprise"}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          currentPlan === "enterprise"
                            ? "bg-slate-800 text-slate-400 cursor-default"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                      >
                        {currentPlan === "enterprise" ? "Active Plan" : "Switch to Enterprise"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment Methods & Cards Section */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Saved Payment Cards &amp; Gateways
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Primary credit cards and billing gateways used for institutional billing</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddCardModal(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add New Payment Card</span>
                    </button>
                  </div>

                  {/* Payment Gateway Options Switcher */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedGateway("card")}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                        selectedGateway === "card"
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 shrink-0" />
                        <div>
                          <p className="text-xs font-bold">Credit / Debit Card</p>
                          <p className="text-[10px] opacity-75">Stripe Instant</p>
                        </div>
                      </div>
                      {selectedGateway === "card" && <Check className="h-4 w-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedGateway("wire")}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                        selectedGateway === "wire"
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 shrink-0" />
                        <div>
                          <p className="text-xs font-bold">Bank Wire / ACH</p>
                          <p className="text-[10px] opacity-75">Net-30 Invoice</p>
                        </div>
                      </div>
                      {selectedGateway === "wire" && <Check className="h-4 w-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedGateway("upi")}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                        selectedGateway === "upi"
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 shrink-0" />
                        <div>
                          <p className="text-xs font-bold">NetBanking / UPI</p>
                          <p className="text-[10px] opacity-75">Institutional Gateway</p>
                        </div>
                      </div>
                      {selectedGateway === "upi" && <Check className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-2.5">
                    {paymentCards.map((card) => (
                      <div
                        key={card.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-9 w-12 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs tracking-wider">
                            {card.brand}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                              <span>•••• •••• •••• {card.last4}</span>
                              {card.isDefault && (
                                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 rounded-md">
                                  Default Card
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500">Expires {card.exp} • {card.holder}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!card.isDefault && (
                            <button
                              type="button"
                              onClick={() => setPaymentCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === card.id })))}
                              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                            >
                              Make Default
                            </button>
                          )}
                          {paymentCards.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setPaymentCards((prev) => prev.filter((c) => c.id !== card.id))}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing Preferences & Invoicing Info */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Automated Invoicing &amp; Renewal Settings
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600">Finance Email (Invoice Recipient)</label>
                      <input
                        type="email"
                        value={billingEmail}
                        onChange={(e) => setBillingEmail(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600">Institutional Tax / GST / VAT ID</label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs font-mono font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="autoRenew"
                        checked={autoRenew}
                        onChange={(e) => setAutoRenew(e.target.checked)}
                        className="h-4 w-4 rounded-md border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <label htmlFor="autoRenew" className="text-xs font-semibold text-slate-800 cursor-pointer">
                        Enable automatic renewal on next billing date (Aug 28, 2026)
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert("Billing preferences saved!")}
                      className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition cursor-pointer"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>

                {/* MODAL: ADD CARD OVERLAY */}
                {showAddCardModal && (
                  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans select-none pointer-events-auto">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-indigo-600" /> Add New Payment Card
                        </h4>
                        <button type="button" onClick={() => setShowAddCardModal(false)} className="text-slate-400 hover:text-slate-900">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <form onSubmit={handleAddCard} className="space-y-3.5">
                        <div>
                          <label className="text-[11px] font-bold text-slate-600">Cardholder Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Greenfield University Finance Dept"
                            value={newCardName}
                            onChange={(e) => setNewCardName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600">Card Number</label>
                          <input
                            type="text"
                            required
                            placeholder="4242 •••• •••• 4242"
                            value={newCardNumber}
                            onChange={(e) => setNewCardNumber(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono font-medium text-slate-900"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600">Expiration Date</label>
                            <input
                              type="text"
                              required
                              placeholder="MM/YY"
                              value={newCardExp}
                              onChange={(e) => setNewCardExp(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono font-medium text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-600">CVC Code</label>
                            <input
                              type="password"
                              required
                              placeholder="123"
                              maxLength={4}
                              value={newCardCvc}
                              onChange={(e) => setNewCardCvc(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-mono font-medium text-slate-900"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddCardModal(false)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800"
                          >
                            Save Card
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* MODAL: CHECKOUT CONFIRMATION OVERLAY */}
                {checkoutTargetPlan && (
                  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans select-none pointer-events-auto">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-emerald-600" /> Plan Checkout Order Summary
                        </h4>
                        <button type="button" onClick={() => setCheckoutTargetPlan(null)} className="text-slate-400 hover:text-slate-900">
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 text-xs">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>Target Plan:</span>
                          <span className="uppercase text-indigo-600">{checkoutTargetPlan} TIER</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Billing Frequency:</span>
                          <span className="capitalize">{billingCycle}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Item Price:</span>
                          <span>${checkoutTargetPlan === "starter" ? (billingCycle === "annual" ? 24 : 29) : checkoutTargetPlan === "pro" ? (billingCycle === "annual" ? 64 : 79) : (billingCycle === "annual" ? 119 : 149)}/mo</span>
                        </div>
                        {billingCycle === "annual" && (
                          <div className="flex justify-between text-emerald-700 font-bold">
                            <span>Annual Discount:</span>
                            <span>-20% Applied</span>
                          </div>
                        )}
                        <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-sm">
                          <span>Total Due Today:</span>
                          <span>${checkoutTargetPlan === "starter" ? (billingCycle === "annual" ? 288 : 29) : checkoutTargetPlan === "pro" ? (billingCycle === "annual" ? 768 : 79) : (billingCycle === "annual" ? 1428 : 149)}</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-600">Pay With Card</label>
                        <select className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900">
                          {paymentCards.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.brand} ending in {c.last4} (Exp {c.exp})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setCheckoutTargetPlan(null)}
                          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmPlanChange}
                          disabled={isProcessingPayment}
                          className="px-6 py-2.5 rounded-xl bg-emerald-600 text-xs font-extrabold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer flex items-center gap-2"
                        >
                          {isProcessingPayment ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin text-white" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Confirm &amp; Subscribe</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: TRANSACTION HISTORY */}
            {activeTab === "transactions" && (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-2xs bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200 tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Invoice ID</th>
                        <th className="px-5 py-3.5">Date</th>
                        <th className="px-5 py-3.5">Amount</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {[
                        { id: "INV-2026-007", date: "Jul 28, 2026", amount: "$149.00", status: "Paid" },
                        { id: "INV-2026-006", date: "Jun 28, 2026", amount: "$149.00", status: "Paid" },
                        { id: "INV-2026-005", date: "May 28, 2026", amount: "$149.00", status: "Paid" },
                      ].map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-4 font-mono font-bold text-slate-900">{inv.id}</td>
                          <td className="px-5 py-4 text-slate-500">{inv.date}</td>
                          <td className="px-5 py-4 font-bold">{inv.amount}</td>
                          <td className="px-5 py-4 font-bold text-emerald-600">{inv.status}</td>
                          <td className="px-5 py-4 text-right">
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
        </main>
      </div>
    </motion.div>
  );

  return mounted ? createPortal(fullPageNode, document.body) : null;
}
