import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // There is an unrelated package-lock.json in the parent directory, which makes
  // Next infer the wrong workspace root. Pin it to this project.
  turbopack: {
    root: path.join(import.meta.dirname, "."),
  },
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:4000";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: "/api/admin/:path*",
        destination: `${backendUrl}/api/v1/admin/:path*`,
      },
      {
        source: "/api/public/:path*",
        destination: `${backendUrl}/api/v1/public/:path*`,
      },
      {
        // Safety net: bare /admin/:path* with no /api prefix — catches stale references
        source: "/admin/:path*",
        destination: `${backendUrl}/api/v1/admin/:path*`,
      },
    ];
  },
  async headers() {
    /**
     * Security headers, which this app was serving none of.
     *
     * xite-B sets a full set on every API response and xite-F set none, which is
     * the wrong way round: the API answers JSON to a fetch, and this app is the
     * one rendering HTML into a browser — including tenant-authored section
     * markup, on the platform's own origin.
     *
     * What is here is deliberately the set that cannot break the product.
     *
     * There is no `script-src`. Next inlines its bootstrap and flight payload as
     * `<script>` on every page, so a `script-src` without per-request nonces
     * would blank the entire app, and nonces are a larger change than a security
     * fix should smuggle in. It is listed as follow-up work rather than shipped
     * half-done — a CSP that has to be reverted on Monday protects nothing.
     *
     * The three directives below are the ones that pay for themselves without a
     * nonce, and each closes a real escalation path rather than a theoretical
     * one:
     *
     *   - `object-src 'none'` — `<object>`/`<embed>` are script execution that
     *     `script-src` does not always cover.
     *   - `base-uri 'self'` — an injected `<base href>` silently repoints every
     *     relative URL on the page, including the ones Next uses to load its own
     *     chunks. It is the cheapest way to turn markup injection into script
     *     execution and nothing legitimate here sets a base tag.
     *   - `form-action 'self'` — stops an injected form posting a visitor's
     *     input to somebody else's host.
     *
     * `frame-ancestors` is what actually prevents clickjacking; `X-Frame-Options`
     * is beside it for older browsers that do not implement the CSP directive.
     * Both allow the platform's own origins because the Admin panel previews
     * tenant sites in an iframe.
     */
    const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "webxite.org").trim();

    const baseline = [
      {
        key: "Content-Security-Policy",
        value: [
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          `frame-ancestors 'self' https://${rootDomain} https://admin.${rootDomain}`,
        ].join("; "),
      },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
      },
      /**
       * HSTS is set unconditionally rather than behind a NODE_ENV check.
       *
       * A browser ignores it over plain http, so it costs nothing locally, and
       * making it conditional is how it ends up missing in the one environment
       * that needs it. `preload` is deliberately omitted: it is effectively
       * irreversible and applies to every subdomain, and tenant custom domains
       * are not ours to commit on.
       */
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      },
    ];

    return [
      { source: "/:path*", headers: baseline },
      {
        source: "/site/:path*",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        source: "/preview/:path*",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
      {
        source: "/editor/:path*",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate, max-age=0, s-maxage=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
