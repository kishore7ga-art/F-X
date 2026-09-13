"use client";

import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";

import type { Domain } from "@/lib/publishing-client";

/**
 * The DNS records a tenant has to create, in a form they can actually copy.
 *
 * The screen this replaces printed each record as one line with a single copy
 * button on the value. The **name** — `_xite-verify.www.college.edu`, the
 * fiddliest string on the page and the one with an underscore, four dots and no
 * forgiving typo — had no copy button at all, so it was retyped. A mistyped
 * verification host fails in exactly the same way as an absent one, which is a
 * support conversation that starts "I definitely added it".
 *
 * ── The copied text is the value, byte for byte ─────────────────────────────
 *
 * Nothing here trims, quotes, lowercases or normalises. That sounds obvious and
 * is the specific thing that goes wrong: a UI that renders a TXT value inside
 * quotes for readability, then copies what it rendered, hands over a token that
 * will never match. `copy()` is given the same string that was rendered, and
 * that string is the one the API sent.
 *
 * Values are also selectable — `user-select: text` — because a copy button is
 * useless behind a clipboard permission prompt somebody has already denied, and
 * because people paste into places that strip clipboard formatting.
 */

/**
 * Writes to the clipboard, with a fallback.
 *
 * `navigator.clipboard` is unavailable over plain http and inside some embedded
 * browsers, and it rejects rather than throwing when permission is refused. The
 * old call site used it unawaited with no catch, so in those cases it showed
 * "Copied!" and copied nothing.
 */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the legacy path rather than reporting success.
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    // Off-screen rather than hidden: `display: none` cannot be selected, and a
    // visible element would scroll the page as it is focused.
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.setAttribute("readonly", "");
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

type Field = { label: string; value: string };

export function DnsRecords({
  domain,
  onVerify,
  busy,
}: {
  domain: Domain;
  onVerify: () => void;
  busy: boolean;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const copy = useCallback(async (text: string, key: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(key);
      setFailed(null);
      setTimeout(() => setCopied((k) => (k === key ? null : k)), 1800);
    } else {
      // Said plainly. The value is selectable, so there is a way forward.
      setFailed(key);
      setTimeout(() => setFailed((k) => (k === key ? null : k)), 3000);
    }
  }, []);

  const { verification, routing, routingUnavailable } = domain.dnsInstructions;

  /**
   * Whether the domain is already through, and the check has nothing left to do.
   *
   * `VERIFIED` and `ACTIVE` are both "the records are correct" — the difference
   * between them is the certificate, which this button does not check and
   * cannot hurry. So pressing it in either state re-runs a DNS lookup whose
   * answer is already known, and the tenant learns nothing from doing it twenty
   * times.
   *
   * Nothing is remembered to enforce this. It is read from the status on every
   * render, so it lifts by itself the moment the domain stops being connected —
   * a record edited at the registrar drops it to `FAILED` or `DISCONNECTED`
   * and the button is live again, with no state to get stuck and no way for a
   * tenant to be locked out of a check they genuinely need.
   */
  const connected = domain.status === "VERIFIED" || domain.status === "ACTIVE";
  const locked = busy || connected;

  /**
   * All records as text, in the shape a DNS panel asks for them.
   *
   * Tab-separated rather than a table or JSON: it pastes into a spreadsheet as
   * columns, into a ticket as readable text, and into a terminal without
   * mangling. A pretty-printed table would paste as a wall of box characters.
   */
  const allRecords = [
    `Type\tName\tValue`,
    `TXT\t${verification.name}\t${verification.value}`,
    ...(routing ? [`${routing.type}\t${routing.name}\t${routing.value}`] : []),
  ].join("\n");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexWrap: "wrap" }}>
        <p style={{ margin: 0, fontSize: "12px", color: "#6B7280", lineHeight: 1.6 }}>
          Add these at your domain provider. Both are required.
        </p>
        <button
          type="button"
          onClick={() => void copy(allRecords, "all")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            backgroundColor: copied === "all" ? "#DCFCE7" : "#FFFFFF",
            color: copied === "all" ? "#166534" : "#374151",
            padding: "8px 14px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 150ms ease",
          }}
        >
          {copied === "all" ? (
            <Check style={{ width: "13px", height: "13px" }} />
          ) : (
            <Copy style={{ width: "13px", height: "13px" }} />
          )}
          {copied === "all" ? "Copied!" : "Copy all records"}
        </button>
      </div>

      {/* Step 1 — ownership. Kept visually separate from the routing record
          because they are added at different times and fail differently: a
          missing TXT means "we cannot tell this is yours", a missing A/CNAME
          means "it is yours and points elsewhere". */}
      <RecordCard
        step="1"
        title="TXT record — proves the domain is yours"
        badge="TXT"
        fields={[
          { label: "Name / Host", value: verification.name },
          { label: "Value", value: verification.value },
        ]}
        idPrefix={`${domain.id}-txt`}
        copied={copied}
        failed={failed}
        onCopy={copy}
      />

      {routing ? (
        <RecordCard
          step="2"
          title={
            routing.type === "A"
              ? "A record — points the domain at our server"
              : "CNAME record — points the domain at us"
          }
          badge={routing.type}
          fields={[
            { label: "Name / Host", value: routing.name },
            { label: routing.type === "A" ? "Value / IP address" : "Value / Target", value: routing.value },
          ]}
          idPrefix={`${domain.id}-route`}
          copied={copied}
          failed={failed}
          onCopy={copy}
        />
      ) : (
        routingUnavailable && (
          <div style={{ borderRadius: "10px", border: "1px solid #FDE68A", backgroundColor: "#FEF3C7", color: "#92400E", padding: "12px 14px", fontSize: "12px", lineHeight: 1.6 }}>
            {routingUnavailable}
          </div>
        )
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onVerify}
          disabled={locked}
          style={{
            borderRadius: "8px",
            backgroundColor: "#171717",
            color: "#FFFFFF",
            padding: "10px 18px",
            fontSize: "12px",
            fontWeight: 600,
            border: "none",
            cursor: locked ? "default" : "pointer",
            opacity: locked ? 0.6 : 1,
          }}
        >
          {busy
            ? "Checking…"
            : connected
              ? "Connected"
              : domain.status === "PENDING_VERIFICATION"
                ? "Verify DNS"
                : "Check again"}
        </button>
        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
          {connected
            ? "Your domain is connected — there is nothing left to check. This comes back if the DNS changes."
            : "DNS changes can take a few minutes to an hour to spread."}
        </span>
      </div>

      {/* What is actually wrong, when something is. `lastError` is the server's
          own sentence about the check that did not pass — not a generic
          "verification failed", which tells a tenant nothing about which of the
          two records to look at. */}
      {domain.lastError && (
        <div
          role="status"
          style={{
            borderRadius: "10px",
            border: "1px solid #FECACA",
            backgroundColor: "#FEF2F2",
            color: "#991B1B",
            padding: "12px 14px",
            fontSize: "12px",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ display: "block", marginBottom: "2px" }}>
            {domain.stage === "ownership"
              ? "The TXT record above was not found"
              : domain.stage === "routing"
                ? "The domain is not pointing here yet"
                : "Not ready yet"}
          </strong>
          {domain.lastError}
        </div>
      )}
    </div>
  );
}

function RecordCard({
  step,
  title,
  badge,
  fields,
  idPrefix,
  copied,
  failed,
  onCopy,
}: {
  step: string;
  title: string;
  badge: string;
  fields: Field[];
  idPrefix: string;
  copied: string | null;
  failed: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  return (
    <div style={{ borderRadius: "12px", border: "1px solid #E5E7EB", backgroundColor: "#FFFFFF", padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", borderRadius: "999px", backgroundColor: "#171717", color: "#FFFFFF", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
          {step}
        </span>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{title}</span>
        <span style={{ marginLeft: "auto", fontSize: "10px", fontWeight: 800, letterSpacing: "0.05em", color: "#4B5563", backgroundColor: "#F3F4F6", padding: "3px 8px", borderRadius: "6px" }}>
          {badge}
        </span>
      </div>

      {fields.map((field) => {
        const key = `${idPrefix}-${field.label}`;
        const isCopied = copied === key;
        const isFailed = failed === key;
        return (
          <div key={key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "#6B7280" }}>
              {field.label}
            </label>
            <div style={{ display: "flex", alignItems: "stretch", gap: "8px" }}>
              {/*
                A real input rather than a styled span. It is selectable with a
                double-click, focusable from the keyboard, and on a phone it
                offers the browser's own Select All / Copy menu — which is the
                path most people take on mobile regardless of what button is
                next to it. readOnly, so the displayed value can never drift
                from the one that gets copied.
              */}
              <input
                readOnly
                value={field.value}
                onFocus={(e) => e.currentTarget.select()}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                style={{
                  flex: 1,
                  minWidth: 0,
                  backgroundColor: "#FAFAFA",
                  border: "1px solid #E5E5E5",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  fontSize: "12.5px",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  color: "#111827",
                  userSelect: "text",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => onCopy(field.value, key)}
                title={`Copy ${field.label.toLowerCase()}`}
                aria-label={`Copy ${field.label.toLowerCase()}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  borderRadius: "8px",
                  border: `1px solid ${isCopied ? "#BBF7D0" : isFailed ? "#FECACA" : "#E5E7EB"}`,
                  backgroundColor: isCopied ? "#DCFCE7" : isFailed ? "#FEE2E2" : "#FFFFFF",
                  color: isCopied ? "#166534" : isFailed ? "#991B1B" : "#374151",
                  // A fixed width so the row does not jump when the label
                  // changes from "Copy" to "Copied!".
                  minWidth: "92px",
                  justifyContent: "center",
                  padding: "0 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background-color 150ms ease",
                }}
              >
                {isCopied ? (
                  <Check style={{ width: "13px", height: "13px" }} />
                ) : (
                  <Copy style={{ width: "13px", height: "13px" }} />
                )}
                {isCopied ? "Copied!" : isFailed ? "Select it" : "Copy"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
