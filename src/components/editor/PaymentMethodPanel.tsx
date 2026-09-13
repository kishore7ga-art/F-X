"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";

import { ApiError } from "@/lib/api-client";
import {
  describeInstrument,
  getBillingState,
  type BillingState,
} from "@/lib/subscription-client";

/**
 * The payment method tab.
 *
 * What was here was a card form, and it was three separate problems stacked on
 * one another:
 *
 *  - It took a card number, an expiry and a **CVC** into React state. This
 *    platform's own billing model says in as many words that a PAN puts it in
 *    PCI-DSS scope and that storing a CVC after authorisation is prohibited
 *    outright, and the form collected both.
 *  - It fabricated `tok_<provider>_<timestamp>` and sent it as `providerRef` —
 *    a reference to a tokenised card that no provider held, because no provider
 *    was integrated.
 *  - When the backend correctly refused, it caught the error, invented a
 *    `PaymentMethod` object locally, pushed it into component state and showed
 *    "Card attached successfully". Nothing was stored anywhere. Reloading the
 *    page made the card disappear.
 *
 * None of that is replaced with a better form, because there should not be a
 * form. Razorpay Subscriptions set the mandate up inside Checkout: the customer
 * enters their card on Razorpay's page, Razorpay holds it, and this platform is
 * never given it. So this screen reads what Razorpay reports and says plainly
 * where the details are changed.
 */
export function PaymentMethodPanel({
  onGoToSubscription,
}: {
  onGoToSubscription: () => void;
}) {
  const [state, setState] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const next = await getBillingState();
        if (!cancelled) setState(next);
      } catch (cause) {
        if (cancelled) return;
        setError(
          cause instanceof ApiError
            ? cause.message
            : "Could not load your payment method. Check your connection and try again.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const instrument = state?.paymentInstrument ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
          Billing
        </span>
        <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
          Payment method
        </h1>
        <p style={{ fontSize: "13px", color: "#737373", margin: 0 }}>
          Your card is held by Razorpay, not by WebXite.
        </p>
      </div>

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#6B7280", fontSize: "13px" }}>
          <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" />
          Loading…
        </div>
      )}

      {!loading && error && (
        <div role="alert" style={panel("#FEE2E2", "#FECACA", "#991B1B")}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div
            style={{
              borderRadius: "16px",
              border: "1px solid #E5E7EB",
              backgroundColor: "#FFFFFF",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
            }}
          >
            {instrument ? (
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    backgroundColor: "#F3F4F6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#4B5563",
                  }}
                >
                  <CreditCard style={{ width: "20px", height: "20px" }} />
                </div>
                <div>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>
                    {describeInstrument(instrument)}
                  </p>
                  <p style={{ fontSize: "12px", color: "#6B7280", margin: "2px 0 0 0" }}>
                    {[instrument.issuer, instrument.type].filter(Boolean).join(" · ") ||
                      "Used for your subscription"}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    backgroundColor: "#F3F4F6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9CA3AF",
                  }}
                >
                  <CreditCard style={{ width: "20px", height: "20px" }} />
                </div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", margin: 0 }}>
                  No payment method yet
                </p>
                <p style={{ fontSize: "12px", color: "#6B7280", margin: 0, lineHeight: 1.6, maxWidth: "52ch" }}>
                  {state?.configured
                    ? "You will enter your card in Razorpay Checkout when you subscribe. It stays with Razorpay — WebXite never receives it."
                    : "Subscriptions are not set up on this server yet, so there is nothing to pay with."}
                </p>
                {state?.configured && (
                  <button
                    type="button"
                    onClick={onGoToSubscription}
                    style={{
                      borderRadius: "8px",
                      backgroundColor: "#171717",
                      color: "#FFFFFF",
                      padding: "9px 18px",
                      fontSize: "12px",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Go to Subscription
                  </button>
                )}
              </div>
            )}
          </div>

          {/*
            Where the details are actually changed. Without this the screen is a
            dead end: it shows a card and offers no way to replace it, and the
            honest answer — "in Razorpay, not here" — is the useful one.
          */}
          <div style={panel("#F9FAFB", "#E5E7EB", "#4B5563")}>
            <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <ShieldCheck style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "1px" }} />
              <div style={{ lineHeight: 1.6 }}>
                <strong style={{ color: "#374151" }}>WebXite never sees your card.</strong>{" "}
                Card details are entered on Razorpay&rsquo;s own checkout and held by
                Razorpay. This page shows only what they report back — the network and
                last four digits — which is enough to tell two of your own cards apart
                and nothing more.
                {instrument && (
                  <>
                    {" "}
                    To change the card a subscription is charged to, use the link in any
                    Razorpay receipt email, or cancel and subscribe again.
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function panel(bg: string, border: string, fg: string) {
  return {
    borderRadius: "12px",
    border: `1px solid ${border}`,
    backgroundColor: bg,
    color: fg,
    padding: "14px 16px",
    fontSize: "12px",
  } as const;
}
