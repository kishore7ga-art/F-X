"use client";

import { api } from "@/lib/api-client";

/**
 * The browser's calls for publishing and custom domains.
 *
 * Every one of these goes through `api()`, which resolves the backend from
 * `NEXT_PUBLIC_API_BASE_URL` — the same variable the server render uses — so
 * local and live behave identically.
 *
 * The screen these serve previously called nothing at all. Its Publish button
 * was a 1.2-second `setTimeout` that wrote a localStorage key and showed
 * "Website published successfully to production live!", and its domain field
 * was a `useState` and a toast. Nothing here is optimistic: every value shown
 * to a tenant comes back from the server having been checked.
 */

export type PublishStatus = {
  hasDraft: boolean;
  hasPublished: boolean;
  publishedVersion: number;
  publishedAt: string | null;
  publishedByEmail: string | null;
  draftUpdatedAt: string | null;
  hasUnpublishedChanges: boolean;
  draftPages: number;
  publishedPages: number;
};

export type PublishResult = {
  publishedVersion: number;
  publishedAt: string;
  pages: number;
  sections: number;
};

export type DomainStatus =
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "ACTIVE"
  | "FAILED"
  | "DISCONNECTED";

export type SslStatus = "NONE" | "PENDING" | "ACTIVE" | "ERROR";

export type DnsRecord = { type: "TXT" | "CNAME" | "A"; name: string; value: string };

export type Domain = {
  id: string;
  hostname: string;
  status: DomainStatus;
  sslStatus: SslStatus;
  isPrimary: boolean;
  verifiedAt: string | null;
  lastError: string | null;
  verificationCheckedAt: string | null;
  sslCheckedAt: string | null;
  createdAt: string;
  dnsInstructions: { verification: DnsRecord; routing: DnsRecord };
};

export const getPublishStatus = () => api<PublishStatus>("/api/v1/publish/status");

export const publishSite = () => api<PublishResult>("/api/v1/publish", { method: "POST" });

export const listDomains = () =>
  api<{ domains: Domain[] }>("/api/v1/domains").then((r) => r.domains);

export const addDomain = (hostname: string) =>
  api<Domain>("/api/v1/domains", { method: "POST", body: { hostname } });

export const verifyDomain = (id: string) =>
  api<Domain>(`/api/v1/domains/${encodeURIComponent(id)}/verify`, { method: "POST" });

export const setPrimaryDomain = (id: string) =>
  api<{ domains: Domain[] }>(`/api/v1/domains/${encodeURIComponent(id)}/primary`, {
    method: "POST",
  }).then((r) => r.domains);

export const disconnectDomain = (id: string) =>
  api<void>(`/api/v1/domains/${encodeURIComponent(id)}`, { method: "DELETE" });

/**
 * How a domain should be described to the person who owns it.
 *
 * The pairing matters: a domain can be verified — we have seen its TXT record —
 * while HTTPS is not yet working, and saying "Connected" then would be a lie
 * the tenant discovers by visiting their own site. Each state names what is
 * true and what is outstanding.
 */
export function describeDomain(domain: Domain): {
  label: string;
  detail: string;
  tone: "pending" | "progress" | "live" | "error";
} {
  if (domain.status === "ACTIVE" && domain.sslStatus === "ACTIVE") {
    return { label: "Connected", detail: "Serving over HTTPS.", tone: "live" };
  }
  if (domain.status === "VERIFIED") {
    return {
      label: "Almost there",
      detail:
        domain.lastError ??
        "Ownership confirmed. Waiting for DNS to point here and for the certificate to be issued.",
      tone: "progress",
    };
  }
  if (domain.status === "FAILED") {
    return { label: "Failed", detail: domain.lastError ?? "Verification failed.", tone: "error" };
  }
  return {
    label: "Pending verification",
    detail: domain.lastError ?? "Add the TXT record below, then press Check.",
    tone: "pending",
  };
}

/* ── Site settings ───────────────────────────────────────────────────────── */

export type SiteSettings = {
  seo: { indexingEnabled: boolean; title: string | null; description: string | null };
  maintenance: { enabled: boolean; message: string | null };
  customCode: { headHtml: string | null; bodyEndHtml: string | null };
  updatedAt: string | null;
  /** Whether script in `customCode` will actually run, and why not if it will not. */
  customCodeExecutes: boolean;
  customCodeNotice: string | null;
};

/** A partial patch. Three independent cards edit this, so one must not clobber another. */
export type SiteSettingsPatch = {
  seo?: Partial<SiteSettings["seo"]>;
  maintenance?: Partial<SiteSettings["maintenance"]>;
  customCode?: Partial<SiteSettings["customCode"]>;
};

export const getSiteSettings = () => api<SiteSettings>("/api/v1/site-settings");

export const updateSiteSettings = (patch: SiteSettingsPatch) =>
  api<SiteSettings>("/api/v1/site-settings", { method: "PATCH", body: patch });

/* ── Account ─────────────────────────────────────────────────────────────── */

export const changePassword = (currentPassword: string, newPassword: string) =>
  api<void>("/api/v1/account/password", {
    method: "POST",
    body: { currentPassword, newPassword },
  });

/* ── Billing ─────────────────────────────────────────────────────────────── */

export type Invoice = {
  id: string;
  number: string;
  description: string;
  amountMinor: number;
  currency: string;
  amountDisplay: string;
  status: string;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  documentUrl: string | null;
};

export type PaymentMethod = {
  id: string;
  provider: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
};

export const listInvoices = () =>
  api<{ invoices: Invoice[] }>("/api/v1/billing/invoices").then((r) => r.invoices);

/**
 * Saved cards, and which provider holds them.
 *
 * `provider` is null when no payment provider is connected to the platform,
 * which is currently always. The screen shows that plainly instead of a card
 * form that cannot submit anywhere — it previously rendered a saved card ending
 * 4242 that belonged to nobody.
 */
export const listPaymentMethods = () =>
  api<{ provider: string | null; paymentMethods: PaymentMethod[] }>(
    "/api/v1/billing/payment-methods",
  );

export const detachPaymentMethod = (id: string) =>
  api<void>(`/api/v1/billing/payment-methods/${encodeURIComponent(id)}`, { method: "DELETE" });
