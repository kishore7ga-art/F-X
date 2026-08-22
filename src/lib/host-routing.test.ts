import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseHost, platformSubdomainOf } from "@/lib/host-routing";

describe("parseHost", () => {
  it("lowercases and trims", () => {
    assert.equal(parseHost("  Greenfield.WebXite.Org  "), "greenfield.webxite.org");
  });

  // The port has to go before any suffix test, or `localhost:3000` fails to
  // match `.localhost` and a tenant host with a port fails to match its own.
  it("strips a port", () => {
    assert.equal(parseHost("greenfield.localhost:3000"), "greenfield.localhost");
    assert.equal(parseHost("localhost:3000"), "localhost");
  });

  it("takes the first entry of a comma-joined header", () => {
    assert.equal(parseHost("greenfield.webxite.org, proxy.internal"), "greenfield.webxite.org");
  });

  it("strips a trailing dot", () => {
    assert.equal(parseHost("greenfield.webxite.org."), "greenfield.webxite.org");
  });

  it("unwraps a bracketed IPv6 literal", () => {
    assert.equal(parseHost("[::1]:3000"), "::1");
  });

  it("returns empty for missing input", () => {
    assert.equal(parseHost(null), "");
    assert.equal(parseHost(undefined), "");
    assert.equal(parseHost(""), "");
  });
});

describe("platformSubdomainOf — the substring bug this file exists to fix", () => {
  it("resolves an ordinary tenant subdomain", () => {
    assert.equal(platformSubdomainOf("greenfield.webxite.org"), "greenfield");
  });

  /**
   * The domain the platform migrated away from still resolves here, so a link
   * already handed out at `<tenant>.xite.co.in` must keep rendering the site.
   * Delete this alongside LEGACY_ROOT when the old domain stops pointing at us.
   */
  it("resolves a tenant subdomain on the legacy domain", () => {
    assert.equal(platformSubdomainOf("greenfield.xite.co.in"), "greenfield");
  });

  it("resolves a tenant subdomain in development", () => {
    assert.equal(platformSubdomainOf("greenfield.localhost"), "greenfield");
  });

  /**
   * The finding. `hostname.includes(".webxite.org")` matched this, took the
   * first label, and served a tenant's site on a domain anybody can register.
   */
  it("refuses a host that merely contains the root domain", () => {
    assert.equal(platformSubdomainOf("webxite.org.attacker.com"), null);
    assert.equal(platformSubdomainOf("greenfield.webxite.org.attacker.com"), null);
    assert.equal(platformSubdomainOf("notwebxite.org"), null);
    // The same rule has to hold for the legacy root it still accepts.
    assert.equal(platformSubdomainOf("xite.co.in.attacker.com"), null);
    assert.equal(platformSubdomainOf("notxite.co.in"), null);
  });

  it("refuses the apex itself", () => {
    assert.equal(platformSubdomainOf("webxite.org"), null);
    assert.equal(platformSubdomainOf("xite.co.in"), null);
    assert.equal(platformSubdomainOf("localhost"), null);
  });

  it("refuses reserved platform labels", () => {
    for (const host of [
      "admin.webxite.org",
      "api.webxite.org",
      "www.webxite.org",
      "app.webxite.org",
      "static.webxite.org",
      "admin.xite.co.in",
      "api.xite.co.in",
    ]) {
      assert.equal(platformSubdomainOf(host), null, host);
    }
  });

  /**
   * A nested label is not a tenant. Reducing `a.b.webxite.org` to `a` would let
   * one tenant be served at a hostname built from another's name.
   */
  it("refuses a multi-label prefix", () => {
    assert.equal(platformSubdomainOf("a.b.webxite.org"), null);
    assert.equal(platformSubdomainOf("a.b.xite.co.in"), null);
  });

  it("returns null for a custom domain, leaving it to the database lookup", () => {
    assert.equal(platformSubdomainOf("www.madrasengineering.edu.in"), null);
    assert.equal(platformSubdomainOf("college.edu"), null);
  });

  it("returns null for empty input", () => {
    assert.equal(platformSubdomainOf(""), null);
  });
});
