"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Crown, ExternalLink, Loader2, RefreshCw } from "lucide-react";

import { ApiError } from "@/lib/api-client";
import {
  cancelSubscription,
  describeCycle,
  formatAmount,
  getBillingState,
  openCheckout,
  refreshSubscription,
  startSubscription,
  type BillingState,
  type SubscriptionStatus,
} from "@/lib/subscription-client";

/**
 * The subscription tab.
 *
 * What was here before was three pricing cards written into the JSX — Campus
 * Starter at $49, two more beside it, a monthly/yearly toggle that recomputed
 * the numbers in the component, and a "Renews Aug 2027" that was a string. None
 * of it was connected to anything: there was no plan in the database, no
 * provider configured, and no button that could take money. The landing page
 * carried a *different* set of invented prices, and the backend formatted
 * currency as INR while both surfaces showed dollars.
 *
 * So none of those numbers are here. There is one plan, it lives in the Razorpay
 * Dashboard, and its name, price, currency and billing period are read from
 * there through the API. This component renders what it is told and never
 * computes a price — which is the only way the number on this screen and the
 * number on the card statement stay the same number.
 *
 * Status is likewise never inferred. `isSubscribed` comes from the server,
 * which sets it from Razorpay's own record; a payment that "succeeded" in the
 * browser changes nothing on this screen until the server agrees.
 */

/** What to say about each state Razorpay can put a subscription in. */
const STATUS_COPY: Record<SubscriptionStatus, { label: string; tone: Tone; detail: string }> = {
  created: {
    label: "Awaiting payment",
    tone: "neutral",
    detail: "This subscription has been started but not paid for yet.",
  },
  authenticated: {
    label: "Active",
    tone: "good",
    detail: "Your mandate is set up. The first charge is on its way.",
  },
  active: { label: "Active", tone: "good", detail: "Your subscription is active." },
  pending: {
    label: "Payment failed",
    tone: "warn",
    detail:
      "The last charge did not go through. Razorpay will retry it — no need to start a new subscription.",
  },
  halted: {
    label: "Halted",
    tone: "bad",
    detail:
      "Payment has failed enough times that Razorpay has stopped retrying. Update your payment method to resume.",
  },
  cancelled: { label: "Cancelled", tone: "neutral", detail: "This subscription was cancelled." },
  completed: {
    label: "Completed",
    tone: "neutral",
    detail: "This subscription ran to the end of its term.",
  },
  expired: {
    label: "Expired",
    tone: "neutral",
    detail: "This subscription expired without being renewed.",
  },
};

type Tone = "good" | "warn" | "bad" | "neutral";

const TONES: Record<Tone, { bg: string; fg: string; border: string }> = {
  good: { bg: "#DCFCE7", fg: "#166534", border: "#BBF7D0" },
  warn: { bg: "#FEF3C7", fg: "#92400E", border: "#FDE68A" },
  bad: { bg: "#FEE2E2", fg: "#991B1B", border: "#FECACA" },
  neutral: { bg: "#F3F4F6", fg: "#4B5563", border: "#E5E7EB" },
};

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

type Notice = { tone: Tone; text: string } | null;

export function SubscriptionPanel() {
  const [state, setState] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setState(await getBillingState());
    } catch (error) {
      setLoadError(
        error instanceof ApiError
          ? error.message
          : "Could not load your subscription. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * The first read, on mount.
   *
   * Deliberately not `void load()`. That sets state synchronously in the effect
   * body — the cascading-render pattern the lint rule objects to — and it has no
   * way to stop: this panel lives inside a modal that can be closed while the
   * request is still in flight, and every setState after that lands on an
   * unmounted component. `loading` already starts true, so nothing needs setting
   * before the await anyway.
   */
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const next = await getBillingState();
        if (!cancelled) setState(next);
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof ApiError
            ? error.message
            : "Could not load your subscription. Check your connection and try again.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Buy, or reopen Checkout on a subscription that was started and not paid.
   *
   * `startSubscription` returns the existing record rather than creating a
   * second one, so a double click, a reopened tab and a dismissed dialog all
   * land on the same subscription instead of three.
   */
  const handleSubscribe = useCallback(async () => {
    setBusy(true);
    setNotice(null);
    try {
      const started = await startSubscription();
      const outcome = await openCheckout({
        keyId: started.keyId,
        subscriptionId: started.subscription.razorpaySubscriptionId,
        planName: started.plan?.name ?? "Subscription",
        description: started.plan?.description ?? undefined,
      });

      if (outcome.kind === "verified") {
        setState(outcome.state);
        setNotice({ tone: "good", text: "Payment confirmed. Your subscription is active." });
        return;
      }

      if (outcome.kind === "dismissed") {
        // Not an error, and not worth a red banner: they closed a dialog. The
        // subscription stays in `created` and this button reopens it.
        setNotice({ tone: "neutral", text: "Checkout closed. Nothing was charged." });
        await load();
        return;
      }

      if (outcome.kind === "failed") {
        setNotice({ tone: "bad", text: outcome.message });
        await load();
        return;
      }

      // Unverified: the money may well have moved and only our confirmation of
      // it failed. Saying "payment failed" here would be untrue, and saying it
      // worked would claim access the server has not granted.
      setNotice({ tone: "warn", text: outcome.message });
      await load();
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
  }, [load]);

  const handleRefresh = useCallback(async () => {
    setBusy(true);
    setNotice(null);
    try {
      setState(await refreshSubscription());
      setNotice({ tone: "neutral", text: "Subscription status refreshed." });
    } catch (error) {
      setNotice({
        tone: "bad",
        text: error instanceof ApiError ? error.message : "Could not refresh just now.",
      });
    } finally {
      setBusy(false);
    }
  }, []);

  const handleCancel = useCallback(async () => {
    const confirmed = window.confirm(
      "Cancel your subscription at the end of the current billing period? " +
        "You keep access until then, and nothing further is charged.",
    );
    if (!confirmed) return;

    setBusy(true);
    setNotice(null);
    try {
      setState(await cancelSubscription(false));
      setNotice({
        tone: "neutral",
        text: "Cancelled. You keep access until the end of the period you have paid for.",
      });
    } catch (error) {
      setNotice({
        tone: "bad",
        text: error instanceof ApiError ? error.message : "Could not cancel just now.",
      });
    } finally {
      setBusy(false);
    }
  }, []);

  /* ── Frames ─────────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <Frame>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#6B7280", fontSize: "13px" }}>
          <Loader2 style={{ width: "16px", height: "16px" }} className="animate-spin" />
          Loading your subscription…
        </div>
      </Frame>
    );
  }

  if (loadError) {
    return (
      <Frame>
        <Banner tone="bad" text={loadError} />
        <Button onClick={() => void load()} label="Try again" icon={RefreshCw} />
      </Frame>
    );
  }

  /**
   * No provider configured. Said plainly rather than rendering a plan card with
   * a button that would fail at the last step — which is what the three
   * hardcoded tiers did for as long as they existed.
   */
  if (!state?.configured) {
    return (
      <Frame>
        <Banner
          tone="neutral"
          text="Subscriptions are not set up on this server yet. No plan can be purchased until a payment provider is configured."
        />
      </Frame>
    );
  }

  const { plan, subscription } = state;
  const copy = subscription ? STATUS_COPY[subscription.status] : null;
  const renewsOn = formatDate(subscription?.currentEnd ?? null);

  return (
    <Frame>
      {state.testMode && (
        <Banner
          tone="warn"
          text="Test mode. Payments made here are not real and no money moves."
        />
      )}

      {notice && <Banner tone={notice.tone} text={notice.text} />}

      {/* Current standing */}
      {subscription && copy && (
        <div
          style={{
            borderRadius: "14px",
            border: `1px solid ${TONES[copy.tone].border}`,
            backgroundColor: TONES[copy.tone].bg,
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: TONES[copy.tone].fg }}>
              {copy.label}
            </span>
            <button
              type="button"
              onClick={() => void handleRefresh()}
              disabled={busy}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                padding: 0,
                fontSize: "12px",
                fontWeight: 600,
                color: TONES[copy.tone].fg,
                cursor: busy ? "default" : "pointer",
                opacity: busy ? 0.5 : 1,
              }}
            >
              <RefreshCw style={{ width: "13px", height: "13px" }} />
              Refresh
            </button>
          </div>

          <p style={{ margin: 0, fontSize: "13px", color: TONES[copy.tone].fg, lineHeight: 1.5 }}>
            {copy.detail}
          </p>

          {/* A scheduled cancellation is invisible in Razorpay's status — it stays
              `active` until the period runs out — so it has to be said here. */}
          {subscription.cancelAtCycleEnd && renewsOn && (
            <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: TONES[copy.tone].fg }}>
              Ends on {renewsOn}. It will not renew.
            </p>
          )}
          {!subscription.cancelAtCycleEnd && subscription.isActive && renewsOn && (
            <p style={{ margin: 0, fontSize: "13px", color: TONES[copy.tone].fg }}>
              Renews on {renewsOn}.
            </p>
          )}

          {/* A support reference. Not a secret — it is useless without
              Dashboard access — and it is the first thing anyone will be asked for. */}
          <code style={{ fontSize: "11px", color: TONES[copy.tone].fg, opacity: 0.75, fontFamily: "ui-monospace, monospace" }}>
            {subscription.razorpaySubscriptionId}
          </code>
        </div>
      )}

      {/* The plan */}
      <div
        style={{
          borderRadius: "18px",
          border: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF",
          padding: "26px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#EFF6FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563EB",
            }}
          >
            <Crown style={{ width: "20px", height: "20px" }} />
          </div>
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>
              {plan?.name ?? "Subscription"}
            </h3>
            {plan?.description && (
              <p style={{ fontSize: "12px", color: "#6B7280", margin: "2px 0 0 0" }}>
                {plan.description}
              </p>
            )}
          </div>
        </div>

        {plan ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", paddingBottom: "16px", borderBottom: "1px solid #F3F4F6" }}>
            <span style={{ fontSize: "36px", fontWeight: 800, color: "#111827", letterSpacing: "-0.03em" }}>
              {formatAmount(plan.amountMinor, plan.currency)}
            </span>
            <span style={{ fontSize: "13px", color: "#6B7280" }}>
              per {describeCycle(plan.period, plan.interval)}
            </span>
          </div>
        ) : (
          /* The plan lookup failed but the subscription state did not. Saying so
             beats showing a price this screen would have had to invent. */
          <p style={{ fontSize: "13px", color: "#92400E", margin: 0 }}>
            The plan details could not be loaded just now. Your subscription status above is
            unaffected.
          </p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {state.isSubscribed ? (
            <>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#166534",
                }}
              >
                <Check style={{ width: "16px", height: "16px" }} />
                You are subscribed
              </span>
              {!subscription?.cancelAtCycleEnd && (
                <button
                  type="button"
                  onClick={() => void handleCancel()}
                  disabled={busy}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    backgroundColor: "#FFFFFF",
                    color: "#6B7280",
                    padding: "9px 16px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: busy ? "default" : "pointer",
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  Cancel subscription
                </button>
              )}
            </>
          ) : (
            <Button
              onClick={() => void handleSubscribe()}
              disabled={busy || !plan}
              busy={busy}
              label={
                subscription?.status === "created"
                  ? "Complete payment"
                  : subscription
                    ? "Subscribe again"
                    : "Subscribe"
              }
            />
          )}

          {/* Razorpay's hosted page, for a dialog that was blocked or lost. */}
          {subscription?.shortUrl && !state.isSubscribed && (
            <a
              href={subscription.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#2563EB",
                textDecoration: "none",
              }}
            >
              Pay on Razorpay
              <ExternalLink style={{ width: "13px", height: "13px" }} />
            </a>
          )}
        </div>
      </div>

      {/*
        `webhooksConfigured` is deliberately not rendered.
        
        It is an operator's problem, not a customer's: a tenant can do nothing
        about a server that has not had its webhook secret set, and a warning
        about it on a billing card is noise on the one screen that should be a
        plan, a price and a button. The fact is still on the API response for
        whoever is diagnosing it, and the Refresh control above is the recovery
        path either way.
      */}
    </Frame>
  );
}

/* ── Small pieces ──────────────────────────────────────────────────────────── */

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#737373" }}>
          Licence
        </span>
        <h1 style={{ fontSize: "30px", fontWeight: 700, color: "#171717", lineHeight: 1.15, margin: 0, letterSpacing: "-0.02em" }}>
          Subscription
        </h1>
      </div>
      {children}
    </div>
  );
}

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

function Button({
  onClick,
  label,
  disabled,
  busy,
  icon: Icon,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  busy?: boolean;
  icon?: typeof RefreshCw;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        borderRadius: "8px",
        backgroundColor: "#171717",
        color: "#FFFFFF",
        padding: "11px 20px",
        fontSize: "13px",
        fontWeight: 600,
        border: "none",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "all 150ms ease",
      }}
    >
      {busy ? (
        <Loader2 style={{ width: "15px", height: "15px" }} className="animate-spin" />
      ) : Icon ? (
        <Icon style={{ width: "15px", height: "15px" }} />
      ) : null}
      {label}
    </button>
  );
}
