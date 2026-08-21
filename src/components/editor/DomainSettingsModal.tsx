"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

import { ApiError } from "@/lib/api-client";
import {
  addDomain,
  changePassword,
  describeDomain,
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
} from "lucide-react";
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
   * Loads the real publish status and domain list.
   *
   * On open rather than on mount: this panel is rendered by the editor whether
   * or not it is showing, and two requests on every editor load for a screen
   * nobody opened is two requests wasted.
   */
  const refresh = useCallback(async () => {
    const [status, domainList, siteSettings, invoiceList, methods] = await Promise.all([
      getPublishStatus().catch(() => null),
      listDomains().catch(() => [] as Domain[]),
      getSiteSettings().catch(() => null),
      listInvoices().catch(() => [] as Invoice[]),
      listPaymentMethods().catch(() => null),
    ]);
    if (siteSettings) {
      setSettings(siteSettings);
      setHeaderScript(siteSettings.customCode.headHtml ?? "");
    }
    setInvoices(invoiceList);
    if (methods) {
      setPaymentMethods(methods.paymentMethods);
      setPaymentProviderName(methods.provider);
    }
    if (status) {
      setPublishStatusState(status);
      setLastDeployedTime(formatWhen(status.publishedAt));
    }
    setDomains(domainList);
    const primary = domainList.find((d) => d.isPrimary) ?? domainList[0];
    if (primary) setSavedDomain(primary.hostname);
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

        {/* ========================================================= */}
        {/* TAB 4: ADVANCED SETTINGS & CUSTOM CODE */}
        {/* ========================================================= */}
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
                    here: on a xite.co.in address it is saved but not executed,
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
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
                LICENSE &amp; TIERS
              </span>
              <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
                Premium Subscriptions
              </h1>
            </div>

            {/* Current Active Plan Banner */}
            <div
              style={{
                borderRadius: "14px",
                backgroundColor: "#171717",
                color: "#FFFFFF",
                padding: "24px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Crown style={{ width: "20px", height: "20px", color: "#F59E0B" }} />
                  <span style={{ fontSize: "18px", fontWeight: 700 }}>XITE Pro University License</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#10B981", backgroundColor: "rgba(16,185,129,0.15)", padding: "2px 8px", borderRadius: "12px" }}>
                    Active • Renews Aug 2027
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#A3A3A3", margin: 0 }}>
                  Unlimited institutional landing pages, auto SSL TLS 1.3, multi-region Edge CDN, and priority 24/7 SLA.
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => showToast("Subscription is active on annual university billing! 👑")}
                  style={{
                    borderRadius: "8px",
                    backgroundColor: "#FFFFFF",
                    color: "#171717",
                    padding: "9px 18px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Manage Tier
                </button>
              </div>
            </div>

            {/* Feature Checklist Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }} className="max-lg:!grid-cols-1">
              {[
                { title: "Custom Domain Routing", val: "Unlimited Subdomains", icon: Globe },
                { title: "Edge CDN Bandwidth", val: "500 GB / Month", icon: Zap },
                { title: "Priority Support SLA", val: "< 15 min response", icon: Shield },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.title} style={{ borderRadius: "14px", border: "1px solid #E5E5E5", backgroundColor: "#FFFFFF", padding: "20px", display: "flex", flexDirection: "column", gap: "6px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#737373", fontSize: "12px", fontWeight: 600 }}>
                      <Icon style={{ width: "16px", height: "16px" }} />
                      <span>{c.title}</span>
                    </div>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: "#171717" }}>{c.val}</span>
                  </div>
                );
              })}
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
                {/* Real rows, or an honest empty state. These were three
                    invoice numbers written into the JSX — the same three for
                    every tenant on the platform, all marked Paid, for amounts
                    nobody had been charged. */}
                {invoices.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#737373", margin: 0, padding: "16px 0", lineHeight: 1.6 }}>
                    No invoices yet. XITE does not currently raise invoices or take payments,
                    so nothing has been billed to this institution.
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
                          {/* Only offered when a document actually exists. The
                              old button showed "Downloaded invoice X.pdf" for a
                              file that was never generated. */}
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
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="max-lg:!grid-cols-1">
              {/* Cards on file. There is no card form: card details go to a
                  payment provider, never to XITE, and none is connected yet. */}
              <div style={{ borderRadius: "14px", border: "1px solid #E5E5E5", backgroundColor: "#FFFFFF", padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "16px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Cards on file</h4>

                {paymentMethods.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#737373", margin: 0, lineHeight: 1.6 }}>
                    {paymentProviderName
                      ? "No card saved yet."
                      : "No payment provider is connected to XITE yet, so cards cannot be saved. Nothing is being charged."}
                  </p>
                ) : (
                  paymentMethods.map((method) => (
                    <div key={method.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "14px 18px", borderRadius: "12px", backgroundColor: "#171717", color: "#FFFFFF" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "11px", color: "#A3A3A3", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {method.provider}
                        </span>
                        <span style={{ fontFamily: "monospace", fontSize: "15px", fontWeight: 700, letterSpacing: "0.1em" }}>
                          {method.brand || "Card"} &bull;&bull;&bull;&bull; {method.last4 || "----"}
                        </span>
                        {method.expMonth && method.expYear && (
                          <span style={{ fontSize: "11px", color: "#A3A3A3" }}>
                            Expires {String(method.expMonth).padStart(2, "0")}/{method.expYear}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {method.isDefault && (
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#10B981", backgroundColor: "rgba(16,185,129,0.15)", padding: "4px 8px", borderRadius: "8px" }}>
                            DEFAULT
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => void handleRemovePaymentMethod(method.id)}
                          disabled={settingsBusy}
                          style={{ background: "transparent", border: "none", color: "#FCA5A5", cursor: settingsBusy ? "not-allowed" : "pointer", fontSize: "11px", fontWeight: 600 }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Where a card form used to be.
                  It collected a card number, an expiry and a CVC into React
                  state and submitted them nowhere. Collecting a PAN puts this
                  platform inside PCI-DSS scope, and retaining a CVC after
                  authorisation is prohibited outright — so the fix is not a
                  better form, it is no form. When a provider is integrated, its
                  own hosted field goes here and XITE stores only the token it
                  hands back. */}
              <div style={{ borderRadius: "14px", border: "1px dashed #E5E5E5", padding: "24px 28px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#171717", margin: 0 }}>Adding a card</h4>
                <p style={{ fontSize: "12px", color: "#737373", margin: 0, lineHeight: 1.6 }}>
                  Card details are never entered into XITE. Once a payment provider is connected,
                  their secure form appears here and XITE stores only a reference to the card &mdash;
                  the brand and last four digits, so you can tell your cards apart.
                </p>
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
                <span style={{ fontFamily: "monospace", color: "#171717" }}>{subdomain}.xite.co.in</span>.
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
                        : { fg: "#525252", bg: "#F5F5F5" };

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

                    <p style={{ fontSize: "12px", color: "#737373", margin: 0, lineHeight: 1.6 }}>{described.detail}</p>

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
                        be printed here with an invented token and a Vercel IP. */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
