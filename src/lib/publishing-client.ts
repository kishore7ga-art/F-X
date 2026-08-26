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

/**
 * Which of the four checks a domain is waiting on. From the server, which ran
 * them — never inferred here.
 *
 * `status` and `stage` answer different questions. `status` is how far along a
 * domain is; `stage` is what is outstanding. Three quite different situations
 * share the status `VERIFIED` — the records do not point here, the edge has not
 * been told to serve the host, or the certificate has not been issued — and
 * only the first is the tenant's to fix. Without this the screen could only
 * print one sentence of prose and leave them to work out whether they were
 * being asked to act or to wait.
 */
export type DomainStage = "ownership" | "routing" | "edge" | "tls" | "done";

export type DnsRecord = { type: "TXT" | "CNAME" | "A"; name: string; value: string };

export type Domain = {
  id: string;
  hostname: string;
  status: DomainStatus;
  stage: DomainStage;
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
  tone: "pending" | "progress" | "live" | "error" | "off";
} {
  /**
   * Switched off by a platform administrator, and therefore not served.
   *
   * This used to fall through to the bottom of the function, so a domain the
   * platform had disabled told the tenant "Pending verification — add the TXT
   * record below, then press Check". They would then add a record that was
   * already there, press a button that returns 404 for a disconnected domain,
   * and have no way to learn what had actually happened.
   */
  if (domain.status === "DISCONNECTED") {
    return {
      label: "Disconnected",
      detail: domain.lastError ?? "This domain is not being served. Reconnect it to start again.",
      tone: "off",
    };
  }

  if (domain.status === "ACTIVE") {
    /**
     * ACTIVE without a certificate fell through to "Pending verification" too.
     *
     * The old first branch required `status === "ACTIVE" && sslStatus ===
     * "ACTIVE"` and there was no second branch for ACTIVE, so a domain that had
     * passed every check while the certificate was still being issued was
     * described as not yet verified — the opposite end of the process from
     * where it actually was.
     */
    if (domain.sslStatus === "ACTIVE") {
      return { label: "Connected", detail: "Serving over HTTPS.", tone: "live" };
    }
    return {
      label: "Certificate pending",
      detail:
        domain.lastError ??
        "DNS is correct and the site is being served. The HTTPS certificate is still being issued.",
      tone: "progress",
    };
  }

  if (domain.status === "VERIFIED") {
    /**
     * One status, three situations, and only one of them is the tenant's to
     * fix — so the label says which rather than "Almost there" for all three.
     */
    const label =
      domain.stage === "routing"
        ? "Waiting for DNS"
        : domain.stage === "edge"
          ? "Not being served yet"
          : "Certificate pending";

    return {
      label,
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

/**
 * The four checks, and where this domain has got to.
 *
 * ── Why a checklist ────────────────────────────────────────────────────────
 *
 * Connecting a domain is four things that must all be true, and they belong to
 * three different people: the tenant creates the records, the platform tells
 * the edge to serve the host, and a certificate authority issues the
 * certificate. The screen showed one line of prose, so a tenant could not tell
 * whether they were being asked to do something or to wait — and "wait" and
 * "act" are the only two answers that matter to them.
 *
 * The order is the order the server checks in, and a step after the current one
 * is `blocked` rather than `failed`: nothing has been observed about it, because
 * an earlier check stopped the pass. Reporting an unexamined step as failing
 * would send somebody to fix a record that may well be correct.
 */
export type DomainCheck = {
  key: DomainStage;
  label: string;
  /** Who has to do something about it, when it is the one outstanding. */
  owner: "you" | "us" | "automatic";
  state: "ok" | "current" | "blocked" | "failed";
  detail: string | null;
};

const CHECK_ORDER: DomainStage[] = ["ownership", "routing", "edge", "tls"];

/**
 * The stage a domain must be at, when the server did not say.
 *
 * Mirrors `stageFromStatus` in the API for the same reason it exists there:
 * only the two ends can be known. `VERIFIED` is one of three positions and the
 * response does not say which, so it is reported as `routing` — the first of
 * the three and the only one the tenant can act on. Guessing `tls` would tell
 * somebody to wait when they need to act.
 */
function stageFromStatus(status: DomainStatus): DomainStage {
  if (status === "ACTIVE") return "done";
  if (status === "VERIFIED") return "routing";
  return "ownership";
}

export function domainChecklist(domain: Domain): DomainCheck[] {
  const steps: { key: DomainStage; label: string; owner: DomainCheck["owner"] }[] = [
    { key: "ownership", label: "You own this domain", owner: "you" },
    { key: "routing", label: "DNS points to XITE", owner: "you" },
    { key: "edge", label: "XITE is serving this address", owner: "us" },
    { key: "tls", label: "HTTPS certificate issued", owner: "automatic" },
  ];

  // Disconnected is not a position in the sequence. Nothing is being checked,
  // so nothing is claimed about any of the four.
  if (domain.status === "DISCONNECTED") {
    return steps.map((step) => ({ ...step, state: "blocked" as const, detail: null }));
  }

  /**
   * `stage` comes from the server, and there are two ways it can be absent.
   *
   * A response from a deploy older than the field — including the window
   * between the frontend and the backend rolling out, and any cached
   * response — has no `stage` at all. `indexOf(undefined)` is -1, and reading
   * -1 as "past the end" would mark **all four checks passed** on a domain that
   * has verified nothing. That is the worst possible wrong answer here: it
   * tells a tenant their domain is connected while it is not being served.
   *
   * So an unrecognised value is derived from `status` instead, the same way the
   * server derives it for old rows. `done` genuinely is past the end, and is the
   * one value outside `CHECK_ORDER` that means every step passed.
   */
  const known = domain.stage === "done" || CHECK_ORDER.includes(domain.stage);
  const stage = known ? domain.stage : stageFromStatus(domain.status);

  const at = CHECK_ORDER.indexOf(stage);
  const current = at < 0 ? CHECK_ORDER.length : at;

  return steps.map((step, index) => {
    if (index < current) return { ...step, state: "ok" as const, detail: null };
    if (index > current) return { ...step, state: "blocked" as const, detail: null };

    // The one being waited on. FAILED means it has been retried to exhaustion;
    // anything else is still in progress and should not be shown as broken.
    return {
      ...step,
      state: domain.status === "FAILED" ? ("failed" as const) : ("current" as const),
      detail: domain.lastError,
    };
  });
}

/* ── Site settings ───────────────────────────────────────────────────────── */

/** Where the institution physically is. Null when it has not said. */
export type SiteGeo = {
  streetAddress: string | null;
  locality: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  telephone: string | null;
  serviceAreas: string[];
};

/** What it declares itself to be, and the questions it has answered. */
export type SiteAeo = {
  organizationType: string | null;
  legalName: string | null;
  foundingYear: number | null;
  sameAs: string[];
  faqs: { question: string; answer: string }[];
};

export type SiteSettings = {
  seo: {
    indexingEnabled: boolean;
    title: string | null;
    description: string | null;
    ogImageUrl: string | null;
  };
  geo: SiteGeo | null;
  aeo: SiteAeo | null;
  maintenance: { enabled: boolean; message: string | null };
  customCode: { headHtml: string | null; bodyEndHtml: string | null };
  updatedAt: string | null;
  /** Whether script in `customCode` will actually run, and why not if it will not. */
  customCodeExecutes: boolean;
  customCodeNotice: string | null;
};

/**
 * A partial patch. Independent cards edit this, so one must not clobber another.
 *
 * `geo` and `aeo` are whole-object rather than partial: they are edited as a
 * form, and a per-field merge cannot tell "the tenant cleared this" from "this
 * card did not send it". Sending `null` clears the group.
 */
export type SiteSettingsPatch = {
  seo?: Partial<SiteSettings["seo"]>;
  geo?: Partial<SiteGeo> | null;
  aeo?: Partial<SiteAeo> | null;
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
