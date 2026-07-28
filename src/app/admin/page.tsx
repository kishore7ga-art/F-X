import type { Metadata } from "next";
import Link from "next/link";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import {
  adminMe,
  adminOverview,
  adminSites,
  adminStatus,
  type Health,
} from "@/lib/admin/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — XITE",
  // The panel is not something to be found by searching for it.
  robots: { index: false, follow: false },
};

/**
 * The Super Admin panel: sign-in and dashboard on one route.
 *
 * One page rather than a login route and a separate dashboard, because the
 * whole difference between them is whether there is a session — and splitting
 * that across two files means two places that can disagree about what counts
 * as signed in.
 */
export default async function AdminPage() {
  const [admin, status] = await Promise.all([adminMe(), adminStatus()]);

  if (!admin) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-night px-5 py-12">
        <div className="w-full max-w-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50">
            XITE
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-chalk">
            Super Admin
          </h1>

          {/*
            The three states are genuinely different problems, and only one of
            them is fixed by typing the password again. A login form that says
            "incorrect password" when no account was ever created sends people
            to reset a password that does not exist.
          */}
          {!status.configured ? (
            <Setup
              title="Not configured"
              body="ADMIN_SESSION_SECRET is not set on the API, or it matches SESSION_SECRET. The panel refuses to run on the app's own signing key — a shared key would mean a forged college session is a forged admin session."
              steps={[
                "Generate one:  openssl rand -base64 32",
                "Set ADMIN_SESSION_SECRET on the API service",
                "Redeploy",
              ]}
            />
          ) : !status.hasAccounts ? (
            <Setup
              title="No account yet"
              body="The panel is configured and reachable, but no Super Admin has been created. There is deliberately no way to register — an account has to be put there by somebody with access to the deployment."
              steps={[
                "Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD on the API service",
                "Redeploy — the account is created once, at boot",
                "Sign in, then remove both variables",
              ]}
            />
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-chalk-dim">
              Accounts are created from a terminal, not here. There is
              deliberately no way to register.
            </p>
          )}

          <div className="mt-9">
            {/*
              Decided on the server, so the password is never in the bundle at
              all in production — not hidden by a flag the client could flip,
              simply absent from what was sent.
            */}
            <AdminLoginForm
              autofill={
                process.env.NODE_ENV !== "production" &&
                process.env.ADMIN_BOOTSTRAP_EMAIL &&
                process.env.ADMIN_BOOTSTRAP_PASSWORD
                  ? {
                      email: process.env.ADMIN_BOOTSTRAP_EMAIL,
                      password: process.env.ADMIN_BOOTSTRAP_PASSWORD,
                    }
                  : null
              }
            />
          </div>

          <Link
            href="/"
            className="mt-8 inline-block text-xs text-chalk-dim/50 transition-colors hover:text-chalk-dim"
          >
            ← Back to xite.co.in
          </Link>
        </div>
      </main>
    );
  }

  const [overview, sites, health] = await Promise.all([
    adminOverview(),
    adminSites(),
    fetch(
      `${process.env.APP_URL ?? "http://localhost:3000"}/api/health`,
      { cache: "no-store" },
    )
      .then((response) => response.json() as Promise<Health>)
      .catch(() => null),
  ]);

  return (
    <main className="min-h-svh bg-night">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8">
        <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-night-line pb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50">
              Super Admin
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-chalk">
              Dashboard
            </h1>
          </div>
          <p className="text-xs text-chalk-dim/60">
            Signed in as <span className="text-chalk">{admin.email}</span>
          </p>
        </header>

        {/* Health first. The failure that cost this project a day showed up
            nowhere until somebody thought to check — it is the top of the page
            now, and it is red when it is wrong. */}
        <section className="mt-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50">
            Platform health
          </h2>
          <div
            className={`mt-3 rounded-xl border px-5 py-4 ${
              health?.database === "connected"
                ? "border-night-line bg-night-raised"
                : "border-red-500/30 bg-red-500/10"
            }`}
          >
            {health ? (
              <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
                <Pair
                  label="Database"
                  value={`${health.database}${health.reason ? ` (${health.reason})` : ""}`}
                  bad={health.database !== "connected"}
                />
                <Pair
                  label="Backend"
                  value={
                    health.backend?.reachable
                      ? `reachable · ${health.backend.latencyMs ?? "?"}ms`
                      : "unreachable"
                  }
                  bad={!health.backend?.reachable}
                />
                <Pair
                  label="Templates seeded"
                  value={String(health.templates ?? "unknown")}
                  bad={!health.templates}
                />
              </dl>
            ) : (
              <p className="text-sm text-red-300">
                Health endpoint did not answer.
              </p>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50">
            Colleges
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-4">
            <Stat label="Total" value={overview?.colleges.total ?? 0} />
            <Stat label="Published" value={overview?.colleges.published ?? 0} />
            <Stat
              label="Onboarding incomplete"
              value={overview?.colleges.onboardingIncomplete ?? 0}
            />
            <Stat label="User accounts" value={overview?.users ?? 0} />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50">
            Template usage
          </h2>
          <ul className="mt-3 divide-y divide-night-line overflow-hidden rounded-xl border border-night-line">
            {(overview?.templates ?? []).map((template) => (
              <li
                key={template.id}
                className="flex items-center justify-between gap-4 bg-night-raised px-5 py-3.5"
              >
                <span className="text-sm font-semibold text-chalk">
                  {template.name}
                  {template.archived ? (
                    <span className="ml-3 rounded-full border border-night-line px-2 py-0.5 text-[10px] uppercase tracking-widest text-chalk-dim/60">
                      Archived
                    </span>
                  ) : null}
                </span>
                <span className="text-xs text-chalk-dim">
                  {template.colleges} college
                  {template.colleges === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50">
            Live sites
          </h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-night-line">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-night-raised text-[10px] uppercase tracking-[0.16em] text-chalk-dim/50">
                <tr>
                  <th className="px-5 py-3 font-semibold">College</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Template</th>
                  <th className="px-5 py-3 font-semibold">Owners</th>
                  <th className="px-5 py-3 font-semibold">Last edited</th>
                  <th className="px-5 py-3 font-semibold">Site</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-night-line">
                {sites.map((site) => (
                  <tr key={site.id} className="bg-night">
                    <td className="px-5 py-3">
                      <span className="block font-semibold text-chalk">
                        {site.name}
                      </span>
                      <span className="block font-mono text-xs text-chalk-dim/50">
                        /{site.subdomain}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          site.status === "PUBLISHED"
                            ? "text-accent"
                            : "text-chalk-dim/60"
                        }
                      >
                        {site.status === "PUBLISHED" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-chalk-dim">
                      {site.templateName ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      {site.orphaned ? (
                        <span className="text-amber-400">
                          none{site.adoptable ? "" : " · locked"}
                        </span>
                      ) : (
                        <span className="text-chalk-dim">{site.owners}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-chalk-dim/60">
                      {site.lastEditedAt
                        ? new Date(site.lastEditedAt).toLocaleDateString()
                        : "never"}
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/site/${site.subdomain}`}
                        target="_blank"
                        className="text-accent underline-offset-2 hover:underline"
                      >
                        Open ↗
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 pb-16">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-chalk-dim/50">
            Recent admin actions
          </h2>
          {overview?.recentActions.length ? (
            <ul className="mt-3 divide-y divide-night-line overflow-hidden rounded-xl border border-night-line">
              {overview.recentActions.map((entry) => (
                <li key={entry.id} className="bg-night-raised px-5 py-3.5">
                  <p className="text-sm text-chalk">{entry.summary}</p>
                  <p className="mt-1 text-xs text-chalk-dim/50">
                    {entry.actorEmail} · {entry.action} ·{" "}
                    {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl border border-night-line px-5 py-6 text-sm text-chalk-dim/60">
              Nothing yet. Template and user changes will appear here as they
              happen.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

/**
 * What to do about it, rather than what went wrong.
 *
 * Numbered because these genuinely are steps in order, and set in monospace
 * because most of them are things to paste into a dashboard field.
 */
function Setup({
  title,
  body,
  steps,
}: {
  title: string;
  body: string;
  steps: string[];
}) {
  return (
    <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-5">
      <p className="text-sm font-semibold text-amber-300">{title}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-chalk-dim">{body}</p>
      <ol className="mt-4 space-y-2">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3 text-chalk-dim">
            <span className="shrink-0 text-[13px] tabular-nums text-amber-300/70">
              {index + 1}.
            </span>
            <span className="font-mono text-[12px] leading-relaxed">
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-night-line bg-night-raised px-5 py-4">
      <span className="block text-3xl font-extrabold tabular-nums text-chalk">
        {value}
      </span>
      <span className="mt-1 block text-xs text-chalk-dim/60">{label}</span>
    </div>
  );
}

function Pair({
  label,
  value,
  bad,
}: {
  label: string;
  value: string;
  bad?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-chalk-dim/50">{label}</dt>
      <dd className={bad ? "text-red-300" : "text-chalk"}>{value}</dd>
    </div>
  );
}
