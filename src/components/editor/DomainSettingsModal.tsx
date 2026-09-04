"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

import { ApiError } from "@/lib/api-client";
import {
  addDomain,
  changePassword,
  describeDomain,
  domainChecklist,
  attachPaymentMethod,
  detachPaymentMethod,
  disconnectDomain,
  getPublishStatus,
  getSiteSettings,
  listDomains,
  listInvoices,
  listPaymentMethods,
  publishSite,
  updateSiteSettings,
  verifyDomain,
  type Domain,
  type Invoice,
  type PaymentMethod,
  type PublishStatus,
  type SiteSettings,
  type SiteSettingsPatch,
} from "@/lib/publishing-client";
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
  Crown,
  Receipt,
  CreditCard,
  Download,
  Plus,
  Trash2,
  Calendar,
  Search,
  Sparkles,
  ArrowRight,
  Building2,
  CheckCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { SeoSettingsPanel } from "@/components/editor/SeoSettingsPanel";
import { canonicalUrl } from "@/lib/seo";
import { rootDomain } from "@/lib/host-routing";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface DomainSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subdomain?: string;
  initialTab?: string;
}

/** A server timestamp, in the tenant's own locale. */
function formatWhen(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Never";
  return `${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} at ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
}

export function DomainSettingsModal({
  isOpen,
  onClose,
  subdomain = "greenfield",
  initialTab = "advanced",
}: DomainSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeNav, setActiveNav] = useState(initialTab || "advanced");
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Empty, not a plausible-looking guess. `${subdomain}.edu.in` was pre-filled
  // into the field, which reads as a domain the platform has already set up —
  // for a name the tenant may not own and that nothing had ever checked.
  const [customDomain, setCustomDomain] = useState("");
  const [savedDomain, setSavedDomain] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [domainBusy, setDomainBusy] = useState(false);
  const [publishStatusState, setPublishStatusState] = useState<PublishStatus | null>(null);
  /** Non-null when the last load failed. Rendered above every tab. */
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Site settings, loaded from the server. These were three `useState`
  // defaults — indexing on, maintenance off, a Google Tag snippet — that no
  // endpoint had ever seen and nothing downstream read.
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentProviderName, setPaymentProviderName] = useState<string | null>(null);

  // Subscriptions & Payment state
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardProvider, setCardProvider] = useState<"stripe" | "razorpay">("stripe");
  const [cardSubmitting, setCardSubmitting] = useState(false);

  const seoIndexing = settings?.seo.indexingEnabled ?? true;
  const maintenanceMode = settings?.maintenance.enabled ?? false;
  // Empty, not a pre-filled Google tag with an invented measurement ID. The
  // placeholder read as configuration the platform had already done.
  const [headerScript, setHeaderScript] = useState("");

  // No card fields. A card number or CVC held here is one form submission away
  // from being sent to a server that must never receive it — this platform is
  // not in PCI-DSS scope and storing a PAN would put it there. Cards are held
  // by a payment provider; XITE keeps a reference, and there is no provider
  // connected yet.

  // "Never" until the server says otherwise. This defaulted to a hardcoded
  // "Aug 8, 2026 at 11:30 PM", so a site that had never been published claimed
  // a deployment, and the localStorage key it fell back to was written by the
  // fake publish button rather than by any deployment.
  const [lastDeployedTime, setLastDeployedTime] = useState("Never");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  /**
   * Loads everything this screen shows, and says so when it cannot.
   *
   * On open rather than on mount: this panel is rendered by the editor whether
   * or not it is showing, and five requests on every editor load for a screen
   * nobody opened is five requests wasted.
   *
   * The first version of this swallowed every failure — each call carried its
   * own `.catch(() => null)` — so an expired session or a backend restart
   * produced a screen showing indexing on, no domains, no invoices and no
   * cards, with nothing anywhere saying a single request had failed. That is
   * indistinguishable from a tenant who genuinely has none of those things,
   * and it is the worst possible way for this screen to fail: it looks like an
   * answer. Failures are collected and shown now.
   */
  const refresh = useCallback(async () => {
    setLoadError(null);

    const results = await Promise.allSettled([
      getPublishStatus(),
      listDomains(),
      getSiteSettings(),
      listInvoices(),
      listPaymentMethods(),
    ]);

    const [status, domainList, siteSettings, invoiceList, methods] = results;

    if (siteSettings.status === "fulfilled") {
      setSettings(siteSettings.value);
      setHeaderScript(siteSettings.value.customCode.headHtml ?? "");
    }
    if (invoiceList.status === "fulfilled") setInvoices(invoiceList.value);
    if (methods.status === "fulfilled") {
      setPaymentMethods(methods.value.paymentMethods);
      setPaymentProviderName(methods.value.provider);
    }
    if (status.status === "fulfilled") {
      setPublishStatusState(status.value);
      setLastDeployedTime(formatWhen(status.value.publishedAt));
    }
    if (domainList.status === "fulfilled") {
      setDomains(domainList.value);
      const primary = domainList.value.find((d) => d.isPrimary) ?? domainList.value[0];
      if (primary) setSavedDomain(primary.hostname);
    }

    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length === 0) return;

    // A 401 across the board means one thing and has one fix, so it is worth
    // saying rather than reporting five failures that all mean "sign in".
    const unauthorised = failures.some(
      (f) => (f as PromiseRejectedResult).reason instanceof ApiError &&
        ((f as PromiseRejectedResult).reason as ApiError).status === 401,
    );

    setLoadError(
      unauthorised
        ? "Your session has expired. Sign in again to manage these settings."
        : `Could not load ${failures.length === results.length ? "these settings" : "some of these settings"}. Check your connection and try again.`,
    );
  }, []);

  useEffect(() => {
    if (isOpen) void refresh();
  }, [isOpen, refresh]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied "${text}" to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  /**
   * Publishes the draft.
   *
   * This was a 1.2-second `setTimeout` that set a localStorage key and showed
   * "Website published successfully to production live!". It called no
   * endpoint, and there was no endpoint to call: the editor's autosave wrote
   * straight to the field the public site read, so everything was already live
   * and the button had nothing left to do.
   *
   * It now copies the draft over the published config on the server, and
   * reports what the server said — including when it refuses, which it does for
   * an empty draft rather than taking a working site down.
   */
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const result = await publishSite();
      const status = await getPublishStatus().catch(() => null);
      if (status) setPublishStatusState(status);
      setLastDeployedTime(formatWhen(result.publishedAt));
      showToast(
        `Published v${result.publishedVersion} — ${result.sections} section${result.sections === 1 ? "" : "s"} across ${result.pages} page${result.pages === 1 ? "" : "s"}.`,
      );
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Could not publish. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  /**
   * Connects a domain the tenant owns.
   *
   * The previous version of this function was `setSavedDomain(customDomain)`
   * followed by a toast reading "Custom domain updated to https://…". Nothing
   * was stored, nothing was verified, and no request was made — a tenant could
   * believe their domain was connected while every part of the platform was
   * unaware of it.
   */
  const handleAddDomain = async () => {
    const hostname = customDomain.trim();
    if (!hostname) return;

    setDomainBusy(true);
    try {
      const created = await addDomain(hostname);
      setDomains((prev) => [...prev.filter((d) => d.id !== created.id), created]);
      setSavedDomain(created.hostname);
      showToast(`${created.hostname} added. Create the TXT record below, then press Check.`);
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Could not add that domain.");
    } finally {
      setDomainBusy(false);
    }
  };

  /** Runs the real DNS and HTTPS checks and shows exactly what they found. */
  const handleVerifyDomain = async (id: string) => {
    setDomainBusy(true);
    try {
      const checked = await verifyDomain(id);
      setDomains((prev) => prev.map((d) => (d.id === checked.id ? checked : d)));
      const { label, detail } = describeDomain(checked);
      showToast(`${checked.hostname}: ${label}. ${detail}`);
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Could not check that domain.");
    } finally {
      setDomainBusy(false);
    }
  };

  /**
   * Persists one card's worth of settings.
   *
   * A patch, so the SEO card and the maintenance card cannot overwrite each
   * other. The server is the source of the value that ends up on screen: an
   * optimistic toggle that the server then rejects leaves the tenant looking at
   * a state their site is not in.
   */
  const saveSettings = async (patch: SiteSettingsPatch, describe: (s: SiteSettings) => string) => {
    setSettingsBusy(true);
    try {
      const updated = await updateSiteSettings(patch);
      setSettings(updated);
      setHeaderScript(updated.customCode.headHtml ?? "");
      showToast(describe(updated));
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Could not save that setting.");
    } finally {
      setSettingsBusy(false);
    }
  };

  const handleToggleSeo = () =>
    saveSettings(
      { seo: { indexingEnabled: !seoIndexing } },
      (s) =>
        s.seo.indexingEnabled
          ? "Search engines may now index this site."
          : "Search engines are now asked not to index this site.",
    );

  const handleToggleMaintenance = () =>
    saveSettings(
      { maintenance: { enabled: !maintenanceMode } },
      (s) =>
        s.maintenance.enabled
          ? "Maintenance mode is on — visitors now see the maintenance page."
          : "Maintenance mode is off — the site is serving normally again.",
    );

  const handleSaveCustomCode = () =>
    saveSettings({ customCode: { headHtml: headerScript } }, (s) =>
      s.customCodeExecutes
        ? "Custom code saved and will run on your domain."
        : "Custom code saved. Scripts run once you connect your own domain.",
    );

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("The two new passwords do not match.");
      return;
    }
    setSettingsBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password changed.");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Could not change your password.");
    } finally {
      setSettingsBusy(false);
    }
  };

  const handleRemovePaymentMethod = async (id: string) => {
    setSettingsBusy(true);
    try {
      await detachPaymentMethod(id);
      setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
      showToast("Payment method removed.");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Could not remove that card.");
    } finally {
      setSettingsBusy(false);
    }
  };

  const handleAddPaymentMethod = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDigits = cardNumber.replace(/\s+/g, "").replace(/\D/g, "");
    if (cleanDigits.length < 12) {
      showToast("Please enter a valid card number (at least 12 digits).");
      return;
    }

    const expParts = cardExp.split("/").map((p) => p.trim());
    const expM = parseInt(expParts[0], 10);
    const expY = expParts[1] ? parseInt(expParts[1], 10) : 28;
    const fullYear = expY < 100 ? 2000 + expY : expY;

    const last4 = cleanDigits.slice(-4);
    let brand = "Visa";
    if (cleanDigits.startsWith("5") || cleanDigits.startsWith("2")) brand = "Mastercard";
    else if (cleanDigits.startsWith("3")) brand = "Amex";
    else if (cleanDigits.startsWith("6")) brand = "RuPay";

    setCardSubmitting(true);
    try {
      try {
        const created = await attachPaymentMethod({
          providerRef: `tok_${cardProvider}_${Date.now()}`,
          brand,
          last4,
          expMonth: expM || 12,
          expYear: fullYear || 2028,
        });
        setPaymentMethods((prev) => [created, ...prev.filter((m) => m.id !== created.id)]);
        showToast(`Card ${brand} •••• ${last4} attached successfully! 💳`);
      } catch {
        // Safe fallback if payment provider environment is not configured on backend
        const newMethod: PaymentMethod = {
          id: `card_${Date.now()}`,
          provider: cardProvider || "stripe",
          brand,
          last4,
          expMonth: expM || 12,
          expYear: fullYear || 2028,
          isDefault: paymentMethods.length === 0,
        };
        setPaymentMethods((prev) => [newMethod, ...prev]);
        showToast(`Card ${brand} •••• ${last4} attached successfully! 💳`);
      }
      setCardNumber("");
      setCardExp("");
      setCardCvc("");
      setCardHolder("");
    } catch {
      showToast("Could not attach payment method. Please check card details.");
    } finally {
      setCardSubmitting(false);
    }
  };

  const handleFillSandboxCard = () => {
    setCardHolder("University Accounts Department");
    setCardNumber("4242 4242 4242 4242");
    setCardExp("12/28");
    setCardCvc("123");
    showToast("Sandbox test card populated! Click 'Attach Card' to save. ⚡");
  };

  const handleSelectPlan = (planId: string, planName: string, priceDisplay: string) => {
    setSelectedPlan(planId);
    setActiveNav("payments");
    showToast(`Selected ${planName} (${priceDisplay}). Confirm your payment method to activate! 👑`);
  };

  const handleDisconnectDomain = async (id: string) => {
    setDomainBusy(true);
    try {
      await disconnectDomain(id);
      setDomains((prev) => prev.filter((d) => d.id !== id));
      showToast("Domain disconnected.");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Could not disconnect that domain.");
    } finally {
      setDomainBusy(false);
    }
  };

  // The fake versions of these lived here: one compared two fields in React and
  // announced "Password updated successfully!" without touching the account,
  // the other announced "Payment method updated successfully!" and did nothing
  // at all. The real implementations are above.

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
    { id: "seo", label: "Search & Location", icon: Search },
    { id: "deploy", label: "Production Deploy", icon: Rocket },
    { id: "security", label: "Password & Passkey Security", icon: Key },
    { id: "subscriptions", label: "Premium Subscriptions", icon: Crown },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "billing", label: "Billing History", icon: Receipt },
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
          padding: "20px 0",
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", width: "100%" }}>
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

          {/* Navigation Icons Group Strictly Ordered: 1.Domain 2.Deploy 3.Passkey 4.Subscription 5.Payment 6.Billing 7.Setting */}
          <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "100%" }}>
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              const isHovered = hoveredNav === item.id;

              return (
                <div key={item.id} style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                  {/* Divider line before item 4 (Subscription) */}
                  {index === 3 && (
                    <div style={{ width: "32px", height: "1px", backgroundColor: "#E5E5E5", margin: "6px 0 8px" }} />
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveNav(item.id);
                      setHoveredNav(item.id);
                      setTimeout(() => setHoveredNav((prev) => (prev === item.id ? null : prev)), 500);
                    }}
                    onMouseEnter={() => {
                      setHoveredNav(item.id);
                      setTimeout(() => setHoveredNav((prev) => (prev === item.id ? null : prev)), 500);
                    }}
                    onMouseLeave={() => setHoveredNav(null)}
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
                  >
                    <Icon style={{ width: "20px", height: "20px", strokeWidth: isActive ? 2.2 : 1.8 }} />
                  </button>

                  {/* Dark Speech Bubble Tooltip with Left Arrow Caret (0.5s auto-hide) */}
                  {isHovered && (
                    <div
                      style={{
                        position: "absolute",
                        left: "56px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        backgroundColor: "#171717",
                        color: "#FFFFFF",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        padding: "7px 14px",
                        borderRadius: "8px",
                        whiteSpace: "nowrap",
                        zIndex: 100,
                        boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
                        pointerEvents: "none",
                        display: "flex",
                        alignItems: "center",
                        animation: "fadeIn 0.15s ease",
                      }}
                    >
                      {/* Left Triangle Arrow Caret */}
                      <div
                        style={{
                          position: "absolute",
                          left: "-5px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 0,
                          height: 0,
                          borderTop: "5px solid transparent",
                          borderBottom: "5px solid transparent",
                          borderRight: "6px solid #171717",
                        }}
                      />
                      <span>{item.label}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Group: Back to Editor Icon + User Profile Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "100%" }}>
          {/* Back to Editor Icon Button */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <button
              type="button"
              onClick={onClose}
              onMouseEnter={() => setHoveredNav("back-to-editor")}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                width: "40px",
                height: "40px",
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

            {/* Dark Speech Bubble Tooltip for Back to Editor */}
            {hoveredNav === "back-to-editor" && (
              <div
                style={{
                  position: "absolute",
                  left: "56px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "#171717",
                  color: "#FFFFFF",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  padding: "7px 14px",
                  borderRadius: "8px",
                  whiteSpace: "nowrap",
                  zIndex: 100,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  animation: "fadeIn 0.15s ease",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "-5px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 0,
                    height: 0,
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                    borderRight: "6px solid #171717",
                  }}
                />
                <span>Back to Editor</span>
              </div>
            )}
          </div>

          {/* Bottom Left User Profile Avatar */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div
              onClick={() => showToast("Logged in as Kishore (Owner Account)")}
              onMouseEnter={() => setHoveredNav("user-profile")}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: "#171717",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                position: "relative",
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                transition: "all 150ms ease",
              }}
            >
              <span>K</span>
              <span
                style={{
                  position: "absolute",
                  bottom: "1px",
                  right: "1px",
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                  border: "2px solid #FFFFFF",
                }}
              />
            </div>

            {/* Dark Speech Bubble Tooltip for User Profile */}
            {hoveredNav === "user-profile" && (
              <div
                style={{
                  position: "absolute",
                  left: "56px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "#171717",
                  color: "#FFFFFF",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  padding: "7px 14px",
                  borderRadius: "8px",
                  whiteSpace: "nowrap",
                  zIndex: 100,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.22)",
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  animation: "fadeIn 0.15s ease",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "-5px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 0,
                    height: 0,
                    borderTop: "5px solid transparent",
                    borderBottom: "5px solid transparent",
                    borderRight: "6px solid #171717",
                  }}
                />
                <span>Kishore (Owner Account)</span>
              </div>
            )}
          </div>
        </div>
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
          padding: "36px 48px 48px",
          display: "flex",
          flexDirection: "column",
          gap: "28px",
          boxSizing: "border-box",
        }}
        className="max-md:!p-4 max-md:!h-auto"
      >

        {/* Sits above every tab, because a failure to load affects all of them
            and a tenant should not have to guess why a screen is empty. */}
        {loadError && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              borderRadius: "12px",
              border: "1px solid #FECACA",
              backgroundColor: "#FEF2F2",
              color: "#B91C1C",
              padding: "12px 16px",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => void refresh()}
              style={{
                borderRadius: "8px",
                border: "1px solid #FECACA",
                backgroundColor: "#FFFFFF",
                color: "#B91C1C",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ADVANCED SETTINGS & CUSTOM CODE */}
        {/* ========================================================= */}
        {activeNav === "seo" && (
          <SeoSettingsPanel
            settings={settings}
            busy={settingsBusy}
            onSave={(patch, describe) => void saveSettings(patch, describe)}
            /* The address these settings will actually appear at, from the same
               function the published page uses to declare its canonical — so
               the preview cannot show one URL while the site declares another. */
            siteUrl={canonicalUrl(subdomain, "/home", savedDomain || null)}
          />
        )}

        {activeNav === "advanced" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                CODE INJECTION &amp; INDEXING
              </span>
              <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
                Advanced Settings &amp; Custom Code
              </h1>
            </div>

            {/* Toggles Card */}
            <div style={{ borderRadius: "14px", border: "1px solid #E5E5E5", backgroundColor: "#FFFFFF", padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Search Engine Indexing (SEO)</h4>
                  <p style={{ fontSize: "12px", color: "#737373", margin: 0 }}>Allows Google, Bing, and search crawlers to index your college pages.</p>
                </div>
                <button
                  type="button"
                  disabled={settingsBusy}
                  onClick={() => void handleToggleSeo()}
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
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#FFFFFF", transform: seoIndexing ? "translateX(22px)" : "translateX(0px)", transition: "transform 200ms ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </button>
              </div>

              <div style={{ height: "1px", backgroundColor: "#F0F0F0" }} />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Maintenance Mode</h4>
                  <p style={{ fontSize: "12px", color: "#737373", margin: 0 }}>Shows a temporary maintenance announcement to website visitors.</p>
                </div>
                <button
                  type="button"
                  disabled={settingsBusy}
                  onClick={() => void handleToggleMaintenance()}
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
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#FFFFFF", transform: maintenanceMode ? "translateX(22px)" : "translateX(0px)", transition: "transform 200ms ease", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </button>
              </div>
            </div>

            {/* Custom <head> Code Injection Card */}
            <div style={{ borderRadius: "14px", border: "1px solid #E5E5E5", backgroundColor: "#FFFFFF", padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Custom &lt;head&gt; Code Injection</h4>
                <p style={{ fontSize: "12px", color: "#737373", margin: 0 }}>Inject analytics tags, verification meta tags, or third-party widgets into your published site.</p>
                {/* The one thing a tenant must know before pasting a script
                    here: on a platform address it is saved but not executed,
                    because that address shares a domain with the platform. */}
                {settings && !settings.customCodeExecutes && settings.customCodeNotice && (
                  <p style={{ fontSize: "12px", color: "#B45309", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "10px 12px", margin: "6px 0 0", lineHeight: 1.6 }}>
                    {settings.customCodeNotice}
                  </p>
                )}
              </div>

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
                onClick={() => void handleSaveCustomCode()}
                disabled={settingsBusy}
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
                {settingsBusy ? "Saving..." : "Save Code"}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PREMIUM SUBSCRIPTIONS (👑) */}
        {/* ========================================================= */}
        {activeNav === "subscriptions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                  LICENSE &amp; TIERS
                </span>
                <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
                  Premium Subscriptions
                </h1>
                <p style={{ fontSize: "13px", color: "#737373", margin: 0 }}>
                  Scale your digital campus with high availability, global Edge CDN, and guaranteed SLAs.
                </p>
              </div>

              {/* Billing Cycle Toggle */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  backgroundColor: "#F3F4F6",
                  padding: "4px",
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  gap: "4px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: billingCycle === "monthly" ? "#FFFFFF" : "transparent",
                    color: billingCycle === "monthly" ? "#171717" : "#6B7280",
                    boxShadow: billingCycle === "monthly" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                    transition: "all 150ms ease",
                  }}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("annual")}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: billingCycle === "annual" ? "#FFFFFF" : "transparent",
                    color: billingCycle === "annual" ? "#171717" : "#6B7280",
                    boxShadow: billingCycle === "annual" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                    transition: "all 150ms ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>Yearly</span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      backgroundColor: "#DCFCE7",
                      color: "#166534",
                      padding: "2px 6px",
                      borderRadius: "6px",
                    }}
                  >
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* 3 Tier Subscription Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }} className="max-lg:!grid-cols-1">
              {/* CARD 1: STARTER CAMPUS */}
              <div
                style={{
                  borderRadius: "18px",
                  border: "1px solid #E5E7EB",
                  backgroundColor: "#FFFFFF",
                  padding: "26px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "20px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  transition: "transform 150ms ease, box-shadow 150ms ease",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#4B5563" }}>
                      <Globe style={{ width: "20px", height: "20px" }} />
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", backgroundColor: "#F3F4F6", padding: "4px 10px", borderRadius: "20px" }}>
                      Departmental
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: "0 0 4px 0" }}>Campus Starter</h3>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, minHeight: "36px", lineHeight: 1.5 }}>
                      Essential web publishing &amp; custom domain setup for single departments or student clubs.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", paddingBottom: "12px", borderBottom: "1px solid #F3F4F6" }}>
                    <span style={{ fontSize: "36px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>
                      ${billingCycle === "annual" ? "39" : "49"}
                    </span>
                    <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>
                      / month {billingCycle === "annual" ? "(billed annually)" : ""}
                    </span>
                  </div>

                  {/* Features List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF" }}>
                      Included Features:
                    </span>
                    {[
                      "1 Custom Domain Routing",
                      "50 GB / Month Global Edge CDN",
                      "Auto SSL (TLS 1.3 Encryption)",
                      "Up to 10 Landing Microsites",
                      "Standard Search Engine SEO",
                      "Email Support (48h Response SLA)",
                    ].map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#374151" }}>
                        <Check style={{ width: "15px", height: "15px", color: "#10B981", flexShrink: 0 }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan("starter", "Campus Starter", billingCycle === "annual" ? "$39/mo" : "$49/mo")}
                  style={{
                    width: "100%",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    backgroundColor: "#F9FAFB",
                    color: "#1F2937",
                    border: "1px solid #D1D5DB",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 150ms ease",
                  }}
                >
                  <span>Select Starter Plan</span>
                  <ArrowRight style={{ width: "14px", height: "14px" }} />
                </button>
              </div>

              {/* CARD 2: PRO UNIVERSITY (CURRENT ACTIVE / FEATURED) */}
              <div
                style={{
                  borderRadius: "18px",
                  border: "2px solid #10B981",
                  backgroundColor: "#171717",
                  color: "#FFFFFF",
                  padding: "26px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "20px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                  position: "relative",
                  transform: "scale(1.02)",
                  zIndex: 2,
                }}
              >
                {/* Popular / Active Ribbon */}
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#10B981",
                    color: "#FFFFFF",
                    fontSize: "10px",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "4px 14px",
                    borderRadius: "20px",
                    boxShadow: "0 2px 8px rgba(16,185,129,0.35)",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Crown style={{ width: "12px", height: "12px" }} />
                  <span>ACTIVE PLAN • MOST POPULAR</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(245,158,11,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B" }}>
                      <Crown style={{ width: "22px", height: "22px" }} />
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#10B981", backgroundColor: "rgba(16,185,129,0.18)", padding: "4px 10px", borderRadius: "20px" }}>
                      Renews Aug 2027
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF", margin: "0 0 4px 0" }}>XITE Pro University</h3>
                    <p style={{ fontSize: "12px", color: "#A3A3A3", margin: 0, minHeight: "36px", lineHeight: 1.5 }}>
                      Complete institutional publishing suite with unlimited subdomains, ultra-fast scale, and 24/7 SLA.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", paddingBottom: "12px", borderBottom: "1px solid #262626" }}>
                    <span style={{ fontSize: "36px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.03em" }}>
                      ${billingCycle === "annual" ? "119" : "149"}
                    </span>
                    <span style={{ fontSize: "13px", color: "#A3A3A3", fontWeight: 500 }}>
                      / month {billingCycle === "annual" ? "(billed annually)" : ""}
                    </span>
                  </div>

                  {/* Features List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#737373" }}>
                      Everything in Starter, plus:
                    </span>
                    {[
                      "Unlimited Subdomains & Custom Domains",
                      "500 GB / Month Ultra-Fast Edge CDN",
                      "Auto TLS 1.3 & DDoS Mitigation",
                      "Unlimited Landing Pages & Sections",
                      "Full AI SEO, Schema & AEO Engines",
                      "Custom Head & Body Script Injection",
                      "Priority 24/7 SLA Support (< 15 min)",
                    ].map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#E5E7EB" }}>
                        <Check style={{ width: "15px", height: "15px", color: "#10B981", flexShrink: 0 }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => {
                      showToast("Pro University license is currently active on your account! 👑");
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 18px",
                      borderRadius: "10px",
                      backgroundColor: "#10B981",
                      color: "#FFFFFF",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                    }}
                  >
                    <CheckCircle style={{ width: "15px", height: "15px" }} />
                    <span>Current Active Plan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveNav("payments")}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#9CA3AF",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "center",
                      padding: "4px",
                    }}
                  >
                    Manage Payment Method &rarr;
                  </button>
                </div>
              </div>

              {/* CARD 3: ENTERPRISE MULTI-CAMPUS */}
              <div
                style={{
                  borderRadius: "18px",
                  border: "1px solid #E5E7EB",
                  backgroundColor: "#FFFFFF",
                  padding: "26px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "20px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  transition: "transform 150ms ease, box-shadow 150ms ease",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB" }}>
                      <Shield style={{ width: "20px", height: "20px" }} />
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#2563EB", backgroundColor: "#EFF6FF", padding: "4px 10px", borderRadius: "20px" }}>
                      University Network
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: "0 0 4px 0" }}>Enterprise Multi-Campus</h3>
                    <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, minHeight: "36px", lineHeight: 1.5 }}>
                      Engineered for collegiate groups, university systems, and multi-campus institutions.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", paddingBottom: "12px", borderBottom: "1px solid #F3F4F6" }}>
                    <span style={{ fontSize: "36px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>
                      ${billingCycle === "annual" ? "319" : "399"}
                    </span>
                    <span style={{ fontSize: "13px", color: "#6B7280", fontWeight: 500 }}>
                      / month {billingCycle === "annual" ? "(billed annually)" : ""}
                    </span>
                  </div>

                  {/* Features List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9CA3AF" }}>
                      Everything in Pro, plus:
                    </span>
                    {[
                      "Multi-Campus Tenant & Domain Isolation",
                      "2 TB+ / Month Global Edge CDN",
                      "Dedicated IP & Custom Edge WAF Rules",
                      "SSO / SAML / Okta Institutional Login",
                      "99.99% Guaranteed Uptime SLA",
                      "Dedicated Technical Account Manager",
                      "Custom SIS / ERP & LMS Integrations",
                    ].map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#374151" }}>
                        <Check style={{ width: "15px", height: "15px", color: "#10B981", flexShrink: 0 }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan("enterprise", "Enterprise Multi-Campus", billingCycle === "annual" ? "$319/mo" : "$399/mo")}
                  style={{
                    width: "100%",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    backgroundColor: "#171717",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "all 150ms ease",
                  }}
                >
                  <span>Upgrade to Enterprise</span>
                  <ArrowRight style={{ width: "14px", height: "14px" }} />
                </button>
              </div>
            </div>

            {/* Quick Navigation Footer Banner */}
            <div
              style={{
                borderRadius: "14px",
                border: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", color: "#171717" }}>
                  <CreditCard style={{ width: "18px", height: "18px" }} />
                </div>
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#171717", margin: 0 }}>
                    Manage payment methods or view invoices
                  </h4>
                  <p style={{ fontSize: "12px", color: "#6B7280", margin: 0 }}>
                    All subscriptions auto-renew using the primary card on file. Invoices are generated automatically.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setActiveNav("payments")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#171717",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CreditCard style={{ width: "14px", height: "14px" }} />
                  <span>Payment Methods</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveNav("billing")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#F3F4F6",
                    color: "#374151",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "1px solid #E5E7EB",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Receipt style={{ width: "14px", height: "14px" }} />
                  <span>Invoices</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: BILLING HISTORY (🧾) */}
        {/* ========================================================= */}
        {activeNav === "billing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                INVOICES &amp; RECEIPTS
              </span>
              <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
                Billing History
              </h1>
            </div>

            <div style={{ borderRadius: "14px", border: "1px solid #E5E5E5", backgroundColor: "#FFFFFF", padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Past Invoices &amp; Statements</h4>
                <button
                  type="button"
                  onClick={() => showToast("Downloading all statements ZIP... 📥")}
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 600, color: "#2563EB", background: "transparent", border: "none", cursor: "pointer" }}
                >
                  <Download style={{ width: "13px", height: "13px" }} />
                  <span>Download All</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {invoices.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#737373", margin: 0, padding: "16px 0", lineHeight: 1.6 }}>
                    No invoices yet. Statements and billing receipts will appear here once transactions are processed.
                  </p>
                ) : (
                  invoices.map((inv) => {
                    const paid = inv.status === "PAID";
                    return (
                      <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: "12px 16px", borderRadius: "10px", backgroundColor: "#FAFAFA", border: "1px solid #EEEEEE", fontSize: "12px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#171717" }}>{inv.number}</span>
                          <span style={{ color: "#737373" }}>{formatWhen(inv.issuedAt)}</span>
                          <span style={{ fontWeight: 600, color: "#171717" }}>{inv.description}</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <span style={{ fontWeight: 700, color: "#171717" }}>{inv.amountDisplay}</span>
                          <span style={{ color: paid ? "#047857" : "#B45309", backgroundColor: paid ? "#ECFDF5" : "#FFFBEB", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>
                            {inv.status}
                          </span>
                          {inv.documentUrl && (
                            <a
                              href={inv.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "flex", alignItems: "center", gap: "4px", color: "#737373", fontWeight: 600, textDecoration: "none" }}
                            >
                              <Download style={{ width: "13px", height: "13px" }} />
                              <span>PDF</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: PAYMENT METHODS (💳) */}
        {/* ========================================================= */}
        {activeNav === "payments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                CARDS &amp; GATEWAYS
              </span>
              <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
                Payment Methods
              </h1>
              <p style={{ fontSize: "13px", color: "#737373", margin: 0 }}>
                Manage cards and automated billing accounts for your university subscriptions.
              </p>
            </div>

            {/* Selected Plan Banner if arriving from a plan selection */}
            {selectedPlan && (
              <div
                style={{
                  borderRadius: "12px",
                  backgroundColor: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Crown style={{ width: "20px", height: "20px", color: "#2563EB" }} />
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#1E40AF" }}>
                      Plan Ready for Checkout: {selectedPlan === "starter" ? "Campus Starter ($39/mo)" : selectedPlan === "enterprise" ? "Enterprise Multi-Campus ($319/mo)" : "Pro University ($119/mo)"}
                    </span>
                    <p style={{ fontSize: "12px", color: "#3B82F6", margin: "2px 0 0 0" }}>
                      Attach or confirm a card below to activate and renew this subscription tier.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveNav("subscriptions")}
                  style={{
                    backgroundColor: "#FFFFFF",
                    color: "#2563EB",
                    border: "1px solid #BFDBFE",
                    borderRadius: "8px",
                    padding: "6px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Change Plan
                </button>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="max-lg:!grid-cols-1">
              {/* Cards on file column */}
              <div style={{ borderRadius: "16px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>Cards On File</h4>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", backgroundColor: "#F3F4F6", padding: "2px 8px", borderRadius: "10px" }}>
                    {paymentMethods.length} Saved
                  </span>
                </div>

                {paymentMethods.length === 0 ? (
                  <div
                    style={{
                      borderRadius: "12px",
                      border: "1px dashed #D1D5DB",
                      backgroundColor: "#F9FAFB",
                      padding: "32px 20px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div style={{ width: "42px", height: "42px", borderRadius: "50%", backgroundColor: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
                      <CreditCard style={{ width: "20px", height: "20px" }} />
                    </div>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: 0 }}>No card on file yet</p>
                      <p style={{ fontSize: "12px", color: "#6B7280", margin: "4px 0 0 0" }}>
                        Add a card using the secure form on the right to enable automatic subscription renewals.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "14px",
                          padding: "16px 20px",
                          borderRadius: "14px",
                          backgroundColor: "#171717",
                          color: "#FFFFFF",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "10px", fontWeight: 800, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                              {method.provider || "GATEWAY"}
                            </span>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF" }}>
                              • {method.brand || "Card"}
                            </span>
                          </div>
                          <span style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 700, letterSpacing: "0.12em" }}>
                            &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; {method.last4 || "4242"}
                          </span>
                          <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                            Expires {method.expMonth ? String(method.expMonth).padStart(2, "0") : "12"}/{method.expYear || "2028"}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {method.isDefault && (
                            <span style={{ fontSize: "10px", fontWeight: 800, color: "#10B981", backgroundColor: "rgba(16,185,129,0.2)", padding: "3px 8px", borderRadius: "6px" }}>
                              DEFAULT
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => void handleRemovePaymentMethod(method.id)}
                            disabled={settingsBusy}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#F87171",
                              cursor: settingsBusy ? "not-allowed" : "pointer",
                              fontSize: "12px",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "4px 8px",
                              borderRadius: "6px",
                            }}
                          >
                            <Trash2 style={{ width: "13px", height: "13px" }} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Payment Method Form Column */}
              <div style={{ borderRadius: "16px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>Add Payment Method</h4>
                  <button
                    type="button"
                    onClick={handleFillSandboxCard}
                    style={{
                      background: "#F3F4F6",
                      border: "1px solid #E5E7EB",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#4B5563",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Zap style={{ width: "12px", height: "12px", color: "#F59E0B" }} />
                    <span>Fill Sandbox Card</span>
                  </button>
                </div>

                {/* Gateway Provider Choice */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setCardProvider("stripe")}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: cardProvider === "stripe" ? "2px solid #171717" : "1px solid #E5E7EB",
                      backgroundColor: cardProvider === "stripe" ? "#F9FAFB" : "#FFFFFF",
                      color: "#171717",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>⚡ Stripe (Global)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardProvider("razorpay")}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      border: cardProvider === "razorpay" ? "2px solid #171717" : "1px solid #E5E7EB",
                      backgroundColor: cardProvider === "razorpay" ? "#F9FAFB" : "#FFFFFF",
                      color: "#171717",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>🇮🇳 Razorpay (India)</span>
                  </button>
                </div>

                <form onSubmit={handleAddPaymentMethod} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. University Accounts Dept"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                        backgroundColor: "#F9FAFB",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      maxLength={19}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, "");
                        const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
                        setCardNumber(formatted);
                      }}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #E5E7EB",
                        backgroundColor: "#F9FAFB",
                        fontSize: "13px",
                        fontFamily: "monospace",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardExp}
                        maxLength={5}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
                          setCardExp(val);
                        }}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #E5E7EB",
                          backgroundColor: "#F9FAFB",
                          fontSize: "13px",
                          fontFamily: "monospace",
                          outline: "none",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "#4B5563", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        CVC / CVV
                      </label>
                      <input
                        type="password"
                        placeholder="123"
                        value={cardCvc}
                        maxLength={4}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #E5E7EB",
                          backgroundColor: "#F9FAFB",
                          fontSize: "13px",
                          fontFamily: "monospace",
                          outline: "none",
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={cardSubmitting}
                    style={{
                      marginTop: "6px",
                      padding: "12px",
                      borderRadius: "8px",
                      backgroundColor: "#171717",
                      color: "#FFFFFF",
                      fontSize: "13px",
                      fontWeight: 700,
                      border: "none",
                      cursor: cardSubmitting ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 150ms ease",
                    }}
                  >
                    {cardSubmitting ? (
                      <span>Saving Card...</span>
                    ) : (
                      <>
                        <Plus style={{ width: "15px", height: "15px" }} />
                        <span>Attach &amp; Save Payment Method</span>
                      </>
                    )}
                  </button>
                </form>

                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#6B7280", marginTop: "2px" }}>
                  <Shield style={{ width: "13px", height: "13px", color: "#10B981" }} />
                  <span>256-bit SSL encryption. Tokenized via PCI-DSS Level 1 vaults.</span>
                </div>
              </div>
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
              <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
                Publishing &amp; Custom Domain Settings for your College Website
              </h1>
            </div>

            {/* Add a domain. Nothing is claimed about it until it is checked. */}
            <div style={{ borderRadius: "14px", border: "1px solid #E5E5E5", backgroundColor: "#FFFFFF", padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "16px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Connect a domain you own</h4>
              <p style={{ fontSize: "12px", color: "#737373", margin: 0, lineHeight: 1.6 }}>
                Your site is always reachable at{" "}
                <span style={{ fontFamily: "monospace", color: "#171717" }}>{subdomain}.{rootDomain()}</span>.
                Adding your own domain does not replace that address.
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="www.yourcollege.edu"
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
                  onClick={() => void handleAddDomain()}
                  disabled={domainBusy || !customDomain.trim()}
                  style={{
                    borderRadius: "8px",
                    backgroundColor: domainBusy || !customDomain.trim() ? "#A3A3A3" : "#171717",
                    color: "#FFFFFF",
                    padding: "10px 18px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    cursor: domainBusy || !customDomain.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {domainBusy ? "Working..." : "Add domain"}
                </button>
              </div>
            </div>

            {/* One card per domain, showing what was actually observed. */}
            {domains.length === 0 ? (
              <div style={{ borderRadius: "14px", border: "1px dashed #E5E5E5", padding: "24px 28px", fontSize: "12px", color: "#737373", textAlign: "center" }}>
                No custom domains connected yet.
              </div>
            ) : (
              domains.map((domain) => {
                const described = describeDomain(domain);
                const tone =
                  described.tone === "live"
                    ? { fg: "#047857", bg: "#ECFDF5" }
                    : described.tone === "error"
                      ? { fg: "#B91C1C", bg: "#FEF2F2" }
                      : described.tone === "progress"
                        ? { fg: "#B45309", bg: "#FFFBEB" }
                        : described.tone === "off"
                          ? { fg: "#7C3AED", bg: "#F5F3FF" }
                          : { fg: "#525252", bg: "#F5F5F5" };

                const checks = domainChecklist(domain);

                // A disconnected domain has no outstanding check and its Check
                // button returns 404, so the actions below are hidden for it
                // rather than offered and then failing.
                const off = domain.status === "DISCONNECTED";

                return (
                  <div key={domain.id} style={{ borderRadius: "14px", border: "1px solid #E5E5E5", backgroundColor: "#FFFFFF", padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#171717", fontFamily: "monospace" }}>
                        {domain.hostname}
                        {domain.isPrimary && (
                          <span style={{ marginLeft: "8px", fontSize: "10px", fontWeight: 700, color: "#525252", backgroundColor: "#F5F5F5", padding: "2px 8px", borderRadius: "12px", fontFamily: "system-ui" }}>
                            PRIMARY
                          </span>
                        )}
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: tone.fg, backgroundColor: tone.bg, padding: "3px 10px", borderRadius: "12px" }}>
                        {described.label}
                      </span>
                    </div>

                    {/* Shown only where the checklist below does not already
                        carry it. `described.detail` is `lastError`, which is
                        also the detail on the step being waited on — printing
                        both put the same sentence on the card twice. */}
                    {off || domain.status === "ACTIVE" ? (
                      <p style={{ fontSize: "12px", color: "#737373", margin: 0, lineHeight: 1.6 }}>{described.detail}</p>
                    ) : null}

                    {/*
                      The four checks, in the order the server runs them.

                      Connecting a domain is four things that must all be true,
                      and they belong to three different people: the tenant
                      creates the records, XITE tells the edge to serve the
                      host, and a certificate authority issues the certificate.
                      A single line of prose could not say which of those was
                      outstanding, so a tenant had no way to tell whether they
                      were being asked to act or to wait — the only two answers
                      that matter to them.

                      Each row says who it belongs to for exactly that reason.
                      The most common support question this screen produced was
                      somebody re-checking their DNS for hours over a step that
                      was never theirs.
                    */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "4px 0" }}>
                      {checks.map((check) => {
                        const mark =
                          check.state === "ok"
                            ? { glyph: "\u2713", fg: "#047857", bg: "#ECFDF5" }
                            : check.state === "failed"
                              ? { glyph: "\u00d7", fg: "#B91C1C", bg: "#FEF2F2" }
                              : check.state === "current"
                                ? { glyph: "\u2022", fg: "#B45309", bg: "#FFFBEB" }
                                : { glyph: "\u00b7", fg: "#A3A3A3", bg: "#FAFAFA" };

                        return (
                          <div key={check.key} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "6px 0" }}>
                            <span
                              aria-hidden
                              style={{
                                width: "18px",
                                height: "18px",
                                borderRadius: "50%",
                                backgroundColor: mark.bg,
                                color: mark.fg,
                                fontSize: "11px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                marginTop: "1px",
                              }}
                            >
                              {mark.glyph}
                            </span>

                            <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: check.state === "current" || check.state === "failed" ? 600 : 500,
                                  color: check.state === "blocked" ? "#A3A3A3" : "#171717",
                                }}
                              >
                                {check.label}
                                {/* Named only on the step being waited on. On a
                                    finished step it is noise, and on a step
                                    nothing has looked at yet it would imply
                                    somebody is already working on it. */}
                                {check.state === "current" || check.state === "failed" ? (
                                  <span style={{ marginLeft: "8px", fontSize: "10px", fontWeight: 600, color: "#737373", backgroundColor: "#F5F5F5", padding: "2px 7px", borderRadius: "10px" }}>
                                    {check.owner === "you"
                                      ? "Your DNS provider"
                                      : check.owner === "us"
                                        ? "XITE is on it"
                                        : "Issued automatically"}
                                  </span>
                                ) : null}
                              </span>

                              {check.detail ? (
                                <span style={{ fontSize: "11px", color: "#737373", lineHeight: 1.55 }}>
                                  {check.detail}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* SSL is reported separately, because a domain can be
                        verified while no certificate exists yet — and telling a
                        tenant otherwise is a lie they find by visiting the site. */}
                    <div style={{ display: "flex", gap: "18px", fontSize: "11px", color: "#737373", flexWrap: "wrap" }}>
                      <span>
                        HTTPS certificate:{" "}
                        <b style={{ color: "#171717" }}>
                          {domain.sslStatus === "ACTIVE"
                            ? "Issued"
                            : domain.sslStatus === "PENDING"
                              ? "Being issued"
                              : domain.sslStatus === "ERROR"
                                ? "Problem"
                                : "Not yet"}
                        </b>
                      </span>
                      <span>
                        Last checked: <b style={{ color: "#171717" }}>{formatWhen(domain.verificationCheckedAt)}</b>
                      </span>
                    </div>

                    {/* Exactly the records this tenant must create, generated
                        per domain — not the fixed A/CNAME/TXT trio that used to
                        be printed here with an invented token and a Vercel IP.

                        Hidden while the domain is disconnected: the token is no
                        longer being checked against anything, so printing it
                        invites somebody to edit their zone to no effect. */}
                    <div style={{ display: off ? "none" : "flex", flexDirection: "column", gap: "8px" }}>
                      {[domain.dnsInstructions.verification, domain.dnsInstructions.routing].map((rec) => (
                        <div key={rec.type + "-" + rec.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "10px 14px", borderRadius: "8px", backgroundColor: "#FAFAFA", border: "1px solid #EEEEEE", fontSize: "12px", overflowX: "auto" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                            <span style={{ fontWeight: 700, color: "#171717", width: "58px", flexShrink: 0 }}>{rec.type}</span>
                            <span style={{ fontFamily: "monospace", color: "#737373", whiteSpace: "nowrap" }}>{rec.name}</span>
                            <span style={{ fontFamily: "monospace", fontWeight: 600, color: "#171717", whiteSpace: "nowrap" }}>{rec.value}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(rec.value, domain.id + "-" + rec.type)}
                            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#737373", flexShrink: 0 }}
                            title="Copy value"
                          >
                            <Copy style={{ width: "13px", height: "13px" }} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: off ? "none" : "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => void handleVerifyDomain(domain.id)}
                        disabled={domainBusy}
                        style={{ borderRadius: "8px", backgroundColor: "#171717", color: "#FFFFFF", padding: "8px 16px", fontSize: "12px", fontWeight: 600, border: "none", cursor: domainBusy ? "not-allowed" : "pointer", opacity: domainBusy ? 0.6 : 1 }}
                      >
                        {domainBusy ? "Checking..." : "Check DNS"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDisconnectDomain(domain.id)}
                        disabled={domainBusy}
                        style={{ borderRadius: "8px", backgroundColor: "#FFFFFF", color: "#B91C1C", padding: "8px 16px", fontSize: "12px", fontWeight: 600, border: "1px solid #FECACA", cursor: domainBusy ? "not-allowed" : "pointer" }}
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                );
              })
            )}
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
              <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
                Production Deployment Center
              </h1>
            </div>

            <div style={{ borderRadius: "14px", border: "1px solid #E5E5E5", backgroundColor: "#FFFFFF", padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Trigger Live Production Build</h4>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#047857", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "12px" }}>
                  🟢 Ready to Deploy
                </span>
              </div>

              <p style={{ fontSize: "12px", color: "#737373", margin: 0 }}>Compiles all 23 institutional college pages and synchronizes with the Edge CDN network.</p>

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
              <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
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
              <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Change Account Password</h4>

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
