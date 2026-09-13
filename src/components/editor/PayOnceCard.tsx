"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api-client";
import { formatAmount, getOrderState, payOnce, type OrderState } from "@/lib/order-client";

/**
 * One plan, one price, one button.
 *
 * The whole card. No tier grid, no billing-cycle toggle, no invented numbers:
 * the amount comes from the server, which reads it from configuration and has
 * no default, because a default amount is a sum of money nobody chose being
 * charged to a card. When it is unset the card says payments are unavailable
 * rather than showing a price it made up.
 *
 * Nothing here decides that anybody has paid. `payOnce` resolves only after the
 * server has verified the signature and re-read the order from Razorpay; until
 * then this shows a spinner, and if verification fails it says so without
 * claiming either success or failure of the payment itself.
 */
export function PayOnceCard() {
  const [state, setState] = useState<OrderState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: Tone; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const next = await getOrderState();
        if (!cancelled) setState(next);
      } catch {
        if (!cancelled) {
          setNotice({ tone: "bad", text: "Could not load payment details. Try again." });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handlePay = async () => {
    setBusy(true);
    setNotice(null);
    try {
      const outcome = await payOnce();

      if (outcome.kind === "paid") {
        setState((prev) => (prev ? { ...prev, latest: outcome.order } : prev));
        setNotice({ tone: "good", text: "Payment successful. Your subscription is active." });
        return;
      }
      if (outcome.kind === "dismissed") {
        // Closing a dialog is not an error and does not deserve a red banner.
        setNotice({ tone: "neutral", text: "Checkout closed. Nothing was charged." });
        return;
      }
      setNotice({ tone: outcome.kind === "failed" ? "bad" : "warn", text: outcome.message });
    } catch (error) {
      setNotice({
        tone: "bad",
        text:
          error instanceof ApiError
            ? error.message
            : "Could not start checkout. Check your connection and try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#6B7280", fontSize: "13px" }}>
        <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" />
        Loading…
      </div>
    );
  }

  const paid = state?.latest?.paid ?? false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "420px" }}>
      {state?.testMode && (
        <Banner tone="warn" text="Test mode. No real money moves." />
      )}
      {notice && <Banner tone={notice.tone} text={notice.text} />}

      <div
        style={{
          borderRadius: "18px",
          border: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          alignItems: "center",
          textAlign: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <h3 style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#6B7280", margin: 0 }}>
          WebXite Plan
        </h3>

        {state?.configured && state.amountMinor ? (
          <p style={{ fontSize: "38px", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.03em" }}>
            {formatAmount(state.amountMinor, state.currency)}
          </p>
        ) : (
          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
            Payments are not set up on this server yet.
          </p>
        )}

        {paid ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "#166534" }}>
            <Check style={{ width: "17px", height: "17px" }} />
            Your subscription is active
          </span>
        ) : (
          <button
            type="button"
            onClick={() => void handlePay()}
            disabled={busy || !state?.configured || !state.amountMinor}
            style={{
              width: "100%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              borderRadius: "10px",
              backgroundColor: "#171717",
              color: "#FFFFFF",
              padding: "13px 20px",
              fontSize: "14px",
              fontWeight: 700,
              border: "none",
              cursor: busy || !state?.configured ? "default" : "pointer",
              opacity: busy || !state?.configured ? 0.55 : 1,
            }}
          >
            {busy && <Loader2 style={{ width: "15px", height: "15px" }} className="animate-spin" />}
            {busy ? "Opening Checkout…" : "Subscribe"}
          </button>
        )}
      </div>
    </div>
  );
}

type Tone = "good" | "warn" | "bad" | "neutral";

const TONES: Record<Tone, { bg: string; fg: string; border: string }> = {
  good: { bg: "#DCFCE7", fg: "#166534", border: "#BBF7D0" },
  warn: { bg: "#FEF3C7", fg: "#92400E", border: "#FDE68A" },
  bad: { bg: "#FEE2E2", fg: "#991B1B", border: "#FECACA" },
  neutral: { bg: "#F3F4F6", fg: "#4B5563", border: "#E5E7EB" },
};

function Banner({ tone, text }: { tone: Tone; text: string }) {
  const palette = TONES[tone];
  return (
    <div
      role={tone === "bad" ? "alert" : "status"}
      style={{
        borderRadius: "10px",
        border: `1px solid ${palette.border}`,
        backgroundColor: palette.bg,
        color: palette.fg,
        padding: "12px 14px",
        fontSize: "13px",
        lineHeight: 1.5,
      }}
    >
      {text}
    </div>
  );
}
