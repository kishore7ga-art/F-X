import { serverApi, ServerApiError } from "@/lib/api/server";

/**
 * The admin panel's reads, through the same server client as everything else.
 *
 * No direct database access, exactly as the rest of the frontend now works —
 * the panel is a different audience, not a different rule.
 */

export type AdminOverview = {
  colleges: { total: number; published: number; onboardingIncomplete: number };
  users: number;
  templates: {
    id: string;
    name: string;
    colleges: number;
    archived: boolean;
  }[];
  recentActions: {
    id: string;
    actorEmail: string;
    action: string;
    summary: string;
    createdAt: string;
  }[];
};

export type AdminSite = {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  templateName: string | null;
  owners: number;
  sections: number;
  orphaned: boolean;
  adoptable: boolean;
  lastEditedAt: string | null;
  createdAt: string;
};

/**
 * Whether the panel has been set up at all.
 *
 * Read before the login form is drawn, because "no account has ever been
 * created" and "you typed the password wrong" are different problems and only
 * one of them is fixed by trying again.
 *
 * Falls back to claiming setup is complete when the backend cannot be reached.
 * Being wrong in that direction shows a login form that will not work; being
 * wrong the other way tells somebody their account does not exist when it does,
 * and sends them off to recreate one they already have.
 */
export async function adminStatus(): Promise<{
  configured: boolean;
  hasAccounts: boolean;
}> {
  try {
    return (
      (await serverApi<{ configured: boolean; hasAccounts: boolean }>(
        "/api/v1/admin/status",
      )) ?? { configured: true, hasAccounts: true }
    );
  } catch {
    return { configured: true, hasAccounts: true };
  }
}

/**
 * `null` means not signed in, which is a normal answer here rather than a
 * failure — the login page is what happens next, not an error screen.
 */
export async function adminMe(): Promise<{ email: string } | null> {
  try {
    const payload = await serverApi<{ admin: { email: string } }>(
      "/api/v1/admin/me",
    );
    return payload?.admin ?? null;
  } catch (cause) {
    if (cause instanceof ServerApiError) return null;
    throw cause;
  }
}

export async function adminOverview(): Promise<AdminOverview | null> {
  return serverApi<AdminOverview>("/api/v1/admin/overview");
}

export async function adminSites(): Promise<AdminSite[]> {
  const payload = await serverApi<{ sites: AdminSite[] }>("/api/v1/admin/sites");
  return payload?.sites ?? [];
}

/** The frontend's own health probe, shown plainly on the dashboard. */
export type Health = {
  status: string;
  database: string;
  reason?: string;
  templates: number | null;
  backend?: { reachable?: boolean; latencyMs?: number; url?: string };
};
