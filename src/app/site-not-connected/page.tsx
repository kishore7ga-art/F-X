import type { Metadata } from "next";

/**
 * What a visitor sees on a domain that points here but maps to no site.
 *
 * It exists because the alternative was our sign-in page. An unrecognised
 * hostname used to fall through to the app, whose `/` redirects to `/login`, so
 * somebody typing a college's own address was shown "Sign in — XITE" — our
 * product, our branding, on their domain, with no hint that anything was
 * misconfigured or whose fault it was.
 *
 * Written for two readers at once, which is why it says so little. A member of
 * the public has no idea what WebXite is and needs to know only that the site
 * is not ready. The owner needs enough to recognise the problem as theirs to
 * fix. Neither is told which tenants exist, whether this hostname was ever
 * registered, or how far through verification it got — a 404 that distinguishes
 * "never added" from "added but unverified" is a way to enumerate customers.
 */
export const metadata: Metadata = {
  title: "Site not available",
  // Nothing here should ever be indexed. It is a transient state on somebody
  // else's domain, and a search result pointing at it would outlive the problem.
  robots: { index: false, follow: false },
};

export const dynamic = "force-static";

export default function SiteNotConnectedPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundColor: "#FAFAFA",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ maxWidth: "460px", textAlign: "center" }}>
        <div
          aria-hidden="true"
          style={{
            width: "44px",
            height: "44px",
            margin: "0 auto 20px",
            borderRadius: "12px",
            backgroundColor: "#F3F4F6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9CA3AF",
            fontSize: "20px",
          }}
        >
          ⁝
        </div>

        <h1
          style={{
            margin: "0 0 10px",
            fontSize: "22px",
            fontWeight: 700,
            color: "#111827",
            letterSpacing: "-0.01em",
          }}
        >
          This site isn&rsquo;t available yet
        </h1>

        <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.7, color: "#6B7280" }}>
          The domain is pointing here, but no published website is connected to it
          yet. If this is your domain, sign in and finish connecting it in your
          site settings.
        </p>
      </div>
    </main>
  );
}
