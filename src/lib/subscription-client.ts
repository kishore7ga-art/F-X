"use client";

import { api, ApiError } from "@/lib/api-client";

/**
 * The subscription flow, browser side.
 *
 * Two rules shape this file.
 *
 * **The backend decides whether anybody has paid.** Nothing here writes
 * entitlement, and `handler` firing is not success — it is the point at which
 * there is something worth asking the server to verify. Razorpay's own
 * documentation is explicit that the browser callback is not proof, and it is
 * trivially forgeable from a console.
 *
 * **The key id comes from the server, not from a build.** Razorpay's publishable
 * key is safe in a bundle, so `NEXT_PUBLIC_RAZORPAY_KEY_ID` would work — but it
 * would be a second copy of a value the backend already has to hold, set in a
 * different place, inlined at a different time. When the two drift, Checkout
 * opens against one account and verification runs against another, and the
 * symptom is a signature that never matches with nothing to say why. One source.
 */

/** Razorpay's own subscription vocabulary, mirrored from the API. */
export type SubscriptionStatus =
  | "created"
  | "authenticated"
  | "active"
  | "pending"
  | "halted"
  | "cancelled"
  | "completed"
  | "expired";

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  /** Minor units — paise for INR. */
  amountMinor: number;
  currency: string;
  period: string;
  interval: number;
};

export type Subscription = {
  id: string;
  razorpaySubscriptionId: string;
  status: SubscriptionStatus;
  isActive: boolean;
  currentStart: string | null;
  currentEnd: string | null;
  cancelledAt: string | null;
  cancelAtCycleEnd: boolean;
  paidCount: number;
  totalCount: number;
  shortUrl: string | null;
  createdAt: string;
};

/**
 * What the mandate is drawn on, as Razorpay reports it.
 *
 * Display metadata and nothing else. There is no card number, expiry or CVC in
 * this type because none exists anywhere in the platform — the instrument is
 * entered inside Razorpay Checkout and stays with Razorpay.
 */
export type PaymentInstrument = {
  method: string;
  network: string | null;
  last4: string | null;
  type: string | null;
  issuer: string | null;
  upiHandle: string | null;
  bank: string | null;
  wallet: string | null;
};

export type BillingState = {
  configured: boolean;
  testMode: boolean;
  webhooksConfigured: boolean;
  plan: Plan | null;
  subscription: Subscription | null;
  paymentInstrument: PaymentInstrument | null;
  isSubscribed: boolean;
};

/** "Visa •••• 4242", "UPI k••••@okhdfcbank", "Netbanking — HDFC". */
export function describeInstrument(instrument: PaymentInstrument): string {
  if (instrument.method === "card" && instrument.last4) {
    return `${instrument.network ?? "Card"} •••• ${instrument.last4}`;
  }
  if (instrument.method === "upi") {
    return instrument.upiHandle ? `UPI ${instrument.upiHandle}` : "UPI";
  }
  if (instrument.method === "netbanking") {
    return instrument.bank ? `Netbanking — ${instrument.bank}` : "Netbanking";
  }
  if (instrument.method === "wallet") {
    return instrument.wallet ? `Wallet — ${instrument.wallet}` : "Wallet";
  }
  // Razorpay adds methods; an unrecognised one is named rather than hidden.
  return instrument.method === "unknown" ? "Payment method on file" : instrument.method;
}

export const getBillingState = () =>
  api<BillingState>("/api/v1/billing/subscription");

export const startSubscription = () =>
  api<{
    subscription: Subscription;
    plan: Plan | null;
    keyId: string;
    reused: boolean;
  }>("/api/v1/billing/subscription", { method: "POST" });

export const verifySubscription = (payload: {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}) =>
  api<BillingState>("/api/v1/billing/subscription/verify", {
    method: "POST",
    body: payload,
  });

export const refreshSubscription = () =>
  api<BillingState>("/api/v1/billing/subscription/refresh", { method: "POST" });

export const cancelSubscription = (immediately = false) =>
  api<BillingState>("/api/v1/billing/subscription/cancel", {
    method: "POST",
    body: { immediately },
  });

/** Money, from minor units, in the currency Razorpay actually holds the plan in. */
export function formatAmount(amountMinor: number, currency: string): string {
  const major = amountMinor / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      // Whole amounts read better without ".00" on a pricing card, but a plan
      // priced at 499.50 must not silently render as 500.
      minimumFractionDigits: Number.isInteger(major) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    // An unrecognised currency code must not take the billing screen down.
    return `${currency} ${major.toFixed(2)}`;
  }
}

/** "monthly", "every 3 months", "yearly" — how often this is charged. */
export function describeCycle(period: string, interval: number): string {
  const unit = period === "monthly" ? "month" : period === "yearly" ? "year" : period;
  if (interval <= 1) return period === "daily" ? "day" : unit;
  return `${interval} ${unit}s`;
}

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayOptions = {
  key: string;
  subscription_id: string;
  name: string;
  description?: string;
  handler: (response: RazorpayHandlerResponse) => void;
  prefill?: { email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

type RazorpayHandlerResponse = {
  razorpay_payment_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature?: string;
};

type RazorpayCheckout = {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayCheckout;
  }
}

let scriptPromise: Promise<void> | null = null;

/**
 * Loads Razorpay's Checkout script, once.
 *
 * Deliberately lazy rather than a `<Script>` in the layout: this is a payment
 * dialog reached from one tab of one modal, and loading a third-party script
 * into every editor session — including every published tenant site render —
 * to support it would be a tracking surface and a blocking request for the
 * overwhelming majority of visits that never open it.
 *
 * The promise is cached so two clicks do not race two `<script>` tags. A
 * failure clears the cache, so a user on a flaky connection can retry rather
 * than being stuck with a rejected promise for the rest of the session.
 */
export function loadCheckoutScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Checkout can only be opened in a browser."));
  }
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${CHECKOUT_SRC}"]`,
    );
    const script = existing ?? document.createElement("script");

    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Could not load Razorpay Checkout. Check your connection.")),
      { once: true },
    );

    if (!existing) {
      script.src = CHECKOUT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  }).catch((error: unknown) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

/** Why a checkout attempt ended, so the caller can say the right thing. */
export type CheckoutOutcome =
  | { kind: "verified"; state: BillingState }
  | { kind: "dismissed" }
  | { kind: "failed"; message: string }
  | { kind: "unverified"; message: string };

/**
 * Opens Checkout on an existing subscription and verifies whatever comes back.
 *
 * `dismissed` and `failed` are separated because they need different words: one
 * is a user who changed their mind and owes no explanation, the other is a
 * payment that was attempted and did not work.
 *
 * `unverified` is the case that matters most and is the easiest to get wrong.
 * The money may well have left the customer's account; what failed is our
 * verification of it. Telling them the payment failed would be a lie, and
 * telling them it succeeded would grant access the server has not agreed to —
 * so it is reported as neither, and the webhook is what resolves it.
 */
export async function openCheckout(input: {
  keyId: string;
  subscriptionId: string;
  planName: string;
  description?: string;
  email?: string;
}): Promise<CheckoutOutcome> {
  await loadCheckoutScript();

  const Checkout = window.Razorpay;
  if (!Checkout) {
    return { kind: "failed", message: "Razorpay Checkout is unavailable. Try again." };
  }

  return new Promise<CheckoutOutcome>((resolve) => {
    // Razorpay calls neither handler nor ondismiss in some edge cases (a popup
    // blocked after open, a hard navigation). Settling once guards the promise
    // against a double resolve, which would otherwise be silent.
    let settled = false;
    const settle = (outcome: CheckoutOutcome) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };

    const checkout = new Checkout({
      key: input.keyId,
      subscription_id: input.subscriptionId,
      name: "WebXite",
      description: input.description ?? input.planName,
      prefill: input.email ? { email: input.email } : undefined,
      theme: { color: "#2563EB" },
      modal: {
        ondismiss: () => settle({ kind: "dismissed" }),
      },
      handler: (response) => {
        const paymentId = response.razorpay_payment_id;
        const subscriptionId = response.razorpay_subscription_id;
        const signature = response.razorpay_signature;

        if (!paymentId || !subscriptionId || !signature) {
          settle({
            kind: "unverified",
            message:
              "Razorpay did not return everything needed to confirm this payment. " +
              "If you were charged, it will be confirmed automatically in a few minutes.",
          });
          return;
        }

        void verifySubscription({
          razorpay_payment_id: paymentId,
          razorpay_subscription_id: subscriptionId,
          razorpay_signature: signature,
        })
          .then((state) => settle({ kind: "verified", state }))
          .catch((error: unknown) => {
            settle({
              kind: "unverified",
              message:
                error instanceof ApiError
                  ? `${error.message} If you were charged, this will be confirmed automatically.`
                  : "Your payment could not be confirmed just now. If you were charged, " +
                    "it will be confirmed automatically in a few minutes.",
            });
          });
      },
    });

    checkout.on("payment.failed", (payload: unknown) => {
      const description = (
        payload as { error?: { description?: string } } | undefined
      )?.error?.description;
      settle({
        kind: "failed",
        message: description || "The payment did not go through. No money was taken.",
      });
    });

    checkout.open();
  });
}
