import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  describeDomain,
  domainChecklist,
  type Domain,
  type DomainStage,
  type DomainStatus,
  type SslStatus,
} from "./publishing-client";

/**
 * What the DNS screen tells a tenant about their domain.
 *
 * The failures worth pinning down here are not crashes — every one of them
 * rendered fine. They were sentences that were *wrong*: a domain the platform
 * had switched off being told to add a TXT record, and a domain that had passed
 * every check being labelled "Pending verification" because its certificate had
 * not arrived yet. Both sent the tenant to edit a zone that was already correct.
 */

const domain = (over: Partial<Domain> = {}): Domain => ({
  id: "d1",
  hostname: "www.college.edu",
  status: "PENDING_VERIFICATION" as DomainStatus,
  stage: "ownership" as DomainStage,
  sslStatus: "NONE" as SslStatus,
  isPrimary: false,
  verifiedAt: null,
  lastError: null,
  verificationCheckedAt: null,
  sslCheckedAt: null,
  createdAt: "2026-08-01T00:00:00.000Z",
  dnsInstructions: {
    verification: { type: "TXT", name: "_xite-verify.www.college.edu", value: "tok" },
    routing: { type: "CNAME", name: "www.college.edu", value: "cname.webxite.org" },
  },
  ...over,
});

describe("describeDomain — the one-line summary", () => {
  it("calls a working domain connected", () => {
    const described = describeDomain(domain({ status: "ACTIVE", sslStatus: "ACTIVE" }));
    assert.equal(described.label, "Connected");
    assert.equal(described.tone, "live");
  });

  it("does not call a served domain unverified while its certificate is issuing", () => {
    // The old code required ACTIVE *and* an active certificate for its first
    // branch and had no second branch for ACTIVE, so this fell all the way
    // through to "Pending verification — add the TXT record below". That is the
    // opposite end of the process from where the domain actually was, and it
    // sent tenants to re-add a record that had already been verified.
    const described = describeDomain(domain({ status: "ACTIVE", sslStatus: "PENDING" }));
    assert.equal(described.label, "Certificate pending");
    assert.equal(described.tone, "progress");
    assert.notEqual(described.tone, "pending");
  });

  it("says a disabled domain is disconnected rather than unverified", () => {
    // This also fell through to "Pending verification". The tenant would add a
    // record that was already there, then press a Check button that returns 404
    // for a disconnected domain, with nothing anywhere explaining why.
    const described = describeDomain(
      domain({ status: "DISCONNECTED", lastError: "Disabled by a platform administrator." }),
    );
    assert.equal(described.label, "Disconnected");
    assert.equal(described.tone, "off");
    assert.match(described.detail, /administrator/);
  });

  it("distinguishes the three situations that share the status VERIFIED", () => {
    // One status, three quite different positions, and only the first is the
    // tenant's to fix. They all used to read "Almost there".
    const at = (stage: DomainStage) =>
      describeDomain(domain({ status: "VERIFIED", stage })).label;

    assert.equal(at("routing"), "Waiting for DNS");
    assert.equal(at("edge"), "Not being served yet");
    assert.equal(at("tls"), "Certificate pending");
    assert.equal(new Set([at("routing"), at("edge"), at("tls")]).size, 3);
  });

  it("prefers the server's own message to a generic one", () => {
    // `lastError` is written by the code that ran the check and knows what it
    // saw. A fallback sentence that contradicts it would be worse than silence.
    const described = describeDomain(
      domain({ status: "VERIFIED", stage: "edge", lastError: "Edge routing is not configured." }),
    );
    assert.equal(described.detail, "Edge routing is not configured.");
  });

  it("always produces something to render", () => {
    const statuses: DomainStatus[] = [
      "PENDING_VERIFICATION",
      "VERIFIED",
      "ACTIVE",
      "FAILED",
      "DISCONNECTED",
    ];
    const ssls: SslStatus[] = ["NONE", "PENDING", "ACTIVE", "ERROR"];
    const stages: DomainStage[] = ["ownership", "routing", "edge", "tls", "done"];

    for (const status of statuses) {
      for (const sslStatus of ssls) {
        for (const stage of stages) {
          const described = describeDomain(domain({ status, sslStatus, stage }));
          assert.ok(described.label.length > 0, `${status}/${sslStatus}/${stage} had no label`);
          assert.ok(described.detail.length > 0, `${status}/${sslStatus}/${stage} had no detail`);
        }
      }
    }
  });
});

describe("domainChecklist — which of the four is outstanding", () => {
  it("has one row per check, in the order the server runs them", () => {
    const checks = domainChecklist(domain());
    assert.deepEqual(
      checks.map((c) => c.key),
      ["ownership", "routing", "edge", "tls"],
    );
  });

  it("marks everything before the current step as passed", () => {
    const checks = domainChecklist(domain({ status: "VERIFIED", stage: "tls" }));
    assert.deepEqual(
      checks.map((c) => c.state),
      ["ok", "ok", "ok", "current"],
    );
  });

  it("marks a later step blocked, not failed", () => {
    // Nothing has been observed about it — the pass stopped earlier. Showing it
    // as failing would send somebody to fix a record that may well be correct.
    const checks = domainChecklist(domain({ stage: "ownership" }));
    assert.equal(checks[0]!.state, "current");
    assert.deepEqual(checks.slice(1).map((c) => c.state), ["blocked", "blocked", "blocked"]);
    assert.ok(!checks.some((c) => c.state === "failed"));
  });

  it("passes every step once the domain is done", () => {
    const checks = domainChecklist(domain({ status: "ACTIVE", stage: "done", sslStatus: "ACTIVE" }));
    assert.ok(checks.every((c) => c.state === "ok"));
  });

  it("shows the current step as failed only after it has been given up on", () => {
    // FAILED means checked repeatedly and still not working. Anything else is
    // in progress, and a red cross on a domain somebody added a minute ago
    // reads as a mistake they made.
    assert.equal(domainChecklist(domain({ status: "FAILED", stage: "routing" }))[1]!.state, "failed");
    assert.equal(
      domainChecklist(domain({ status: "PENDING_VERIFICATION", stage: "routing" }))[1]!.state,
      "current",
    );
  });

  it("claims nothing about a disconnected domain", () => {
    // It is not at a position in the sequence; nothing is being checked.
    const checks = domainChecklist(domain({ status: "DISCONNECTED", stage: "done" }));
    assert.ok(checks.every((c) => c.state === "blocked"));
    assert.ok(checks.every((c) => c.detail === null));
  });

  it("puts the server's message on the step being waited on, and nowhere else", () => {
    const checks = domainChecklist(
      domain({ status: "VERIFIED", stage: "edge", lastError: "Not routed yet." }),
    );
    assert.equal(checks[2]!.detail, "Not routed yet.");
    assert.deepEqual(
      checks.filter((c) => c.detail !== null).map((c) => c.key),
      ["edge"],
    );
  });

  it("says who each step belongs to", () => {
    // The most common support question this screen produced was somebody
    // re-checking their DNS for hours over a step that was never theirs.
    const owners = Object.fromEntries(domainChecklist(domain()).map((c) => [c.key, c.owner]));
    assert.equal(owners.ownership, "you");
    assert.equal(owners.routing, "you");
    assert.equal(owners.edge, "us");
    assert.equal(owners.tls, "automatic");
  });

  it("never reports all four passed just because `stage` is missing", () => {
    // The deploy window, and any cached response: a body from a build older
    // than the field has no `stage`. `indexOf(undefined)` is -1, and reading -1
    // as "past the end" would mark every check passed on a domain that has
    // verified nothing — telling a tenant their domain is connected while it is
    // not being served. It falls back to the status instead.
    const missing = domainChecklist(
      domain({ status: "PENDING_VERIFICATION", stage: undefined as unknown as DomainStage }),
    );
    assert.equal(missing[0]!.state, "current");
    assert.ok(!missing.every((c) => c.state === "ok"));

    // Same for a value from a build newer than this one.
    const unknown = domainChecklist(
      domain({ status: "VERIFIED", stage: "something-new" as DomainStage }),
    );
    assert.equal(unknown.length, 4);
    assert.deepEqual(unknown.map((c) => c.state), ["ok", "current", "blocked", "blocked"]);
  });

  it("still reads a genuinely finished domain as finished with no stage", () => {
    const checks = domainChecklist(
      domain({ status: "ACTIVE", sslStatus: "ACTIVE", stage: undefined as unknown as DomainStage }),
    );
    assert.ok(checks.every((c) => c.state === "ok"));
  });
});
