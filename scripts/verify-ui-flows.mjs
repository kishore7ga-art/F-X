/**
 * The screens, in a real browser.
 *
 * `xite-B/scripts/test-canonical-flow.mjs` proves the API composes correctly.
 * It cannot prove that the onboarding wizard's Continue button is reachable,
 * that clicking three choices sends one request rather than three, or that the
 * admin dashboard renders the numbers the API returns — the difference between
 * "the endpoint works" and "somebody can use this".
 *
 * Needs all three services up:
 *
 *     cd xite-B     && npm run dev:local -- --seed     # :4000
 *     cd xite-F     && npm run dev                     # :3000
 *     cd xite-admin && npm run dev                     # :3002
 *     npm run test:ui
 *
 * Screenshots land in `scripts/screenshots/` so a failure can be looked at
 * rather than guessed at.
 *
 * ── Why Playwright is not a dependency of this repo ────────────────────────
 *
 * It is imported at run time, not at module load, and a missing install is
 * reported as an instruction rather than a stack trace. Playwright pulls
 * browser binaries measured in hundreds of megabytes; adding it to
 * `devDependencies` puts that in the deploy image's install step for a suite
 * that only ever runs on a developer's machine against three local servers.
 *
 *     npm i -D playwright && npx playwright install chromium
 */

import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const API = process.env.TEST_API_BASE ?? "http://localhost:4000";
const APP = process.env.TEST_APP_BASE ?? "http://localhost:3000";
// Vite serves this app under a /admin/ base — see its config. The router
// picks the matching basename up from the path.
const ADMIN_APP = process.env.TEST_ADMIN_BASE ?? "http://localhost:3002/admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@local.test";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "local-admin-password-2026";

if (/webxite\.org/i.test(API) || /webxite\.org/i.test(APP)) {
  console.error("[ui] refusing to run against production");
  process.exit(2);
}

const SHOTS = path.join(path.dirname(fileURLToPath(import.meta.url)), "screenshots");
mkdirSync(SHOTS, { recursive: true });

const c = { reset: "\x1b[0m", dim: "\x1b[2m", bold: "\x1b[1m", green: "\x1b[32m", red: "\x1b[31m", cyan: "\x1b[36m" };
let passed = 0;
const failures = [];

function check(name, ok, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`  ${c.green}✓${c.reset} ${name}`);
  } else {
    failures.push({ name, detail });
    console.log(`  ${c.red}✗${c.reset} ${name}${detail ? ` ${c.dim}— ${detail}${c.reset}` : ""}`);
  }
}

const section = (t) => console.log(`\n${c.bold}${t}${c.reset}`);

async function apiJson(method, path, { body, cookie } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  let json = null;
  try {
    json = await res.json();
  } catch {
    /* not JSON */
  }
  return { status: res.status, json, setCookie };
}

/** An approved but un-onboarded tenant, which is what the wizard is for. */
async function provisionTenant() {
  const stamp = Date.now().toString(36);
  const account = {
    name: "UI Flow Principal",
    email: `ui-${stamp}@uitest.ac.in`,
    password: "ui-flow-password-2026",
    organization: `UI Flow College ${stamp}`,
    phone: "+91 90000 12345",
    website: "www.uiflowcollege.ac.in",
  };

  await apiJson("POST", "/api/v1/access-requests", { body: account });

  const login = await apiJson("POST", "/api/v1/admin/auth/login", {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const adminCookie = login.setCookie
    .map((line) => line.split(";")[0])
    .join("; ");

  const queue = await apiJson("GET", "/api/v1/admin/access-requests?status=PENDING", {
    cookie: adminCookie,
  });
  const row = (queue.json?.requests ?? []).find((r) => r.email === account.email);
  if (!row) throw new Error("the access request never reached the admin queue");

  await apiJson("POST", `/api/v1/admin/access-requests/${row.id}/approve`, {
    cookie: adminCookie,
    body: {},
  });

  const sites = await apiJson("GET", "/api/v1/admin/sites", { cookie: adminCookie });
  const site = (sites.json?.sites ?? []).find((s) => s.name === account.organization);
  if (!site) throw new Error("approval did not provision a college");

  const signedIn = await apiJson("POST", "/api/v1/auth/login", {
    body: { email: account.email, password: account.password },
  });
  const sessionCookie = signedIn.setCookie
    .map((line) => line.split(";")[0])
    .find((pair) => pair.startsWith("college_session="));
  if (!sessionCookie) throw new Error("sign-in returned no session cookie");

  return { account, subdomain: site.subdomain, sessionCookie, adminCookie, phone: account.phone };
}

async function main() {
  console.log(`${c.cyan}UI flows${c.reset} ${c.dim}${APP} · ${ADMIN_APP}${c.reset}`);

  const tenant = await provisionTenant();
  console.log(`${c.dim}tenant: ${tenant.subdomain}${c.reset}`);

  /**
   * `playwright` if it is here, `playwright-core` otherwise.
   *
   * The repo already carries `playwright-core` as a devDependency — the driver
   * without the browser downloads, which is enough on a machine that already
   * has a Chromium and adds nothing to the deploy image. `playwright` wins when
   * present because it manages its own browser, which is what a fresh checkout
   * wants.
   */
  let chromium;
  for (const pkg of ["playwright", "playwright-core"]) {
    try {
      ({ chromium } = await import(pkg));
      break;
    } catch {
      /* try the next one */
    }
  }

  if (!chromium) {
    console.error(
      "\n[ui] No Playwright driver found. To run this suite:\n\n" +
        "      npm i -D playwright && npx playwright install chromium\n",
    );
    process.exit(2);
  }

  let browser;
  try {
    browser = await chromium.launch();
  } catch (cause) {
    // `playwright-core` ships no browser of its own. Saying so beats a stack
    // trace about a missing executable path.
    console.error(
      `\n[ui] Could not launch Chromium: ${cause.message.split("\n")[0]}\n\n` +
        "      npx playwright install chromium\n",
    );
    process.exit(2);
  }

  try {
    /* ── The onboarding wizard, driven by clicking ────────────────────── */
    section("Onboarding wizard — three steps, one submit");

    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const [name, value] = tenant.sessionCookie.split("=");
    await context.addCookies([
      { name, value, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
    ]);

    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    // The editor must bounce an un-onboarded tenant to the wizard, and this is
    // the check that it does so in the browser rather than only over curl.
    await page.goto(`${APP}/editor/${tenant.subdomain}`, { waitUntil: "networkidle" });
    check("the editor redirects an un-onboarded tenant to the wizard",
      new URL(page.url()).pathname === "/onboarding", page.url());

    await page.screenshot({ path: path.join(SHOTS, "onboarding-step-1-role.png") });

    check("step 1 asks for a role",
      await page.getByText("What is your role?").isVisible());

    const continueButton = page.getByRole("button", { name: /continue/i });
    check("Continue is disabled until something is chosen",
      await continueButton.isDisabled());

    await page.getByRole("button", { name: "Principal", exact: true }).click();
    check("choosing a role enables Continue", await continueButton.isEnabled());

    await continueButton.click();
    check("step 2 asks for a theme",
      await page.getByText("Choose a website theme").isVisible());
    await page.screenshot({ path: path.join(SHOTS, "onboarding-step-2-theme.png") });

    // The theme names come from EDITOR_THEMES — the same four the renderer
    // ships. A name here that the renderer does not know is the bug the shared
    // list exists to prevent.
    check("the themes offered are the ones the renderer ships",
      await page.getByText("Academic Navy").isVisible());

    await page.getByRole("button", { name: /Academic Navy/ }).click();
    await continueButton.click();

    check("step 3 asks for a font",
      await page.getByText("Choose a font").isVisible());
    await page.screenshot({ path: path.join(SHOTS, "onboarding-step-3-font.png") });

    await page.getByRole("button", { name: /Playfair Display/ }).click();

    const finish = page.getByRole("button", { name: /finish setup/i });
    check("the final step offers Finish setup", await finish.isVisible());

    // One request, not three: the whole point of holding the answers locally.
    const onboardingCalls = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/v1/onboarding")) onboardingCalls.push(req.method());
    });

    await Promise.all([
      page.waitForURL(new RegExp(`/editor/${tenant.subdomain}`), { timeout: 30_000 }),
      finish.click(),
    ]);

    check("finishing lands in this tenant's own editor",
      page.url().includes(`/editor/${tenant.subdomain}`), page.url());
    check("  …and submitted the three answers in one request",
      onboardingCalls.filter((m) => m === "PUT").length === 1,
      `PUTs: ${onboardingCalls.filter((m) => m === "PUT").length}`);

    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SHOTS, "editor-after-onboarding.png"), fullPage: false });

    /* The answers actually landed on the project. */
    const stored = await apiJson("GET", "/api/v1/onboarding", { cookie: tenant.sessionCookie });
    check("the role reached the database", stored.json?.role === "principal", JSON.stringify(stored.json));
    check("  …with the theme chosen on screen", stored.json?.themePaletteId === "academic-blue");
    check("  …and the font", stored.json?.themeFontId === "serif");

    /* Returning to the wizard sends an onboarded tenant onward. */
    await page.goto(`${APP}/onboarding`, { waitUntil: "networkidle" });
    check("revisiting the wizard does not re-ask a finished tenant",
      page.url().includes(`/editor/${tenant.subdomain}`), page.url());

    const fatal = consoleErrors.filter(
      (line) => !/favicon|Download the React DevTools|hydrat/i.test(line),
    );
    check("no console errors through the whole wizard", fatal.length === 0,
      fatal.slice(0, 2).join(" | "));

    /* ── The wizard on a phone ────────────────────────────────────────── */
    section("Onboarding wizard — 375px");

    const phone = await browser.newContext({ viewport: { width: 375, height: 812 } });
    await phone.addCookies([
      { name, value, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
    ]);
    const phonePage = await phone.newPage();
    // A tenant that has onboarded is redirected away, so drive a fresh one.
    const second = await provisionTenant();
    const [n2, v2] = second.sessionCookie.split("=");
    await phone.clearCookies();
    await phone.addCookies([
      { name: n2, value: v2, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
    ]);
    await phonePage.goto(`${APP}/onboarding`, { waitUntil: "networkidle" });
    await phonePage.screenshot({ path: path.join(SHOTS, "onboarding-phone-375.png"), fullPage: true });

    const overflows = await phonePage.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    check("the wizard does not scroll sideways at 375px", !overflows);
    check("  …and the role buttons are reachable",
      await phonePage.getByRole("button", { name: "Principal", exact: true }).isVisible());
    await phone.close();

    /* ── The admin dashboard ──────────────────────────────────────────── */
    section("Admin dashboard — the numbers come from the API");

    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const adminPage = await adminContext.newPage();

    await adminPage.goto(`${ADMIN_APP}/login`, { waitUntil: "networkidle" });
    await adminPage.fill('input[type="email"]', ADMIN_EMAIL);
    await adminPage.fill('input[type="password"]', ADMIN_PASSWORD);
    await adminPage.getByRole("button", { name: /sign in|log in|continue/i }).first().click();
    await adminPage.waitForTimeout(2500);

    check("signing in lands on the dashboard, not the template list",
      adminPage.url().includes("/dashboard"), adminPage.url());

    await adminPage.waitForTimeout(1200);
    await adminPage.screenshot({ path: path.join(SHOTS, "admin-dashboard.png"), fullPage: true });

    const body = await adminPage.textContent("body");
    check("it shows the pending-request queue", /Pending requests/i.test(body ?? ""));
    check("it shows a live-user count", /Active now/i.test(body ?? ""));
    check("  …explaining what live means", /last \d+ min/i.test(body ?? ""));
    check("it shows published sites", /Published sites/i.test(body ?? ""));
    check("it reads the audit log", /Recent activity/i.test(body ?? ""));
    check("  …with entries in it", /Access request|Approved|approve/i.test(body ?? ""));

    /* The rendered figure has to match what the API says, not merely exist. */
    const overview = await apiJson("GET", "/api/v1/admin/overview", { cookie: tenant.adminCookie });
    const approvedCount = String(overview.json?.requests?.approved ?? "");
    check("the approved-requests figure matches the API",
      (body ?? "").includes(approvedCount), `api says ${approvedCount}`);

    /* ── The request queue shows what an approval turns on ────────────── */
    section("Admin requests — the phone number reaches the screen");

    /**
     * A request left un-approved, because the screen opens on PENDING.
     *
     * `provisionTenant` approves everything it creates, so checking against one
     * of those rows tests the empty state rather than the queue. This is the
     * row an administrator is actually looking at when they decide.
     */
    const waiting = {
      name: "Waiting Applicant",
      email: `pending-${Date.now().toString(36)}@queuetest.ac.in`,
      password: "queue-test-password-2026",
      organization: `Queue Test College ${Date.now().toString(36)}`,
      phone: "+91 91234 56789",
      website: "www.queuetestcollege.ac.in",
    };
    await apiJson("POST", "/api/v1/access-requests", { body: waiting });

    await adminPage.goto(`${ADMIN_APP}/requests`, { waitUntil: "networkidle" });
    await adminPage.waitForTimeout(1500);
    await adminPage.screenshot({ path: path.join(SHOTS, "admin-requests.png"), fullPage: true });

    const requestsBody = await adminPage.textContent("body");
    check("the pending request is on the queue screen",
      (requestsBody ?? "").includes(waiting.organization), waiting.organization);
    check("  …carrying the phone number the applicant typed",
      (requestsBody ?? "").includes(waiting.phone), waiting.phone);
    check("  …and their website", /queuetestcollege\.ac\.in/.test(requestsBody ?? ""));

    await adminContext.close();
    await context.close();
  } finally {
    await browser.close();
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`${c.dim}screenshots: ${SHOTS}${c.reset}`);
  if (failures.length === 0) {
    console.log(`${c.green}${passed} passed, 0 failed${c.reset}`);
  } else {
    console.log(`${c.red}${passed} passed, ${failures.length} failed${c.reset}`);
    for (const f of failures) console.log(`  ${c.red}✗${c.reset} ${f.name} ${c.dim}${f.detail}${c.reset}`);
  }
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(`\n${c.red}the suite could not run:${c.reset}`, error);
  process.exit(2);
});
