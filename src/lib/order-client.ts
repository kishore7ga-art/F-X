"use client";

import { api, ApiError } from "@/lib/api-client";
import { formatAmount, loadCheckoutScript } from "@/lib/subscription-client";

/**
 * One-time payments, browser side.
 *
 * Reuses `loadCheckoutScript` and `formatAmount` from subscription-client
 * rather than restating them: there is one Razorpay Checkout script and one way
 * to render money, and a second copy of either is a second thing to keep in
 * step. What is genuinely different lives here — the order flow returns an
 * `order_id` where the subscription flow returns a `subscription_id`, and the
 * signature is verified over a different pair.
 *
 * The rule is the same as everywhere else in this integration: **`handler`
 * firing is not success.** It is the moment there is something worth asking the
 * server to verify. Razorpay's own documentation says the browser callback is
 * not proof, and it is forgeable from a console in about ten seconds.
 */

export type Order = {
  invoiceId: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  status: string;
  paid: boolean;
};

export type OrderState = {
  configured: boolean;
  testMode: boolean;
  /** Null when no amount is configured on the server — there is no default. */
  amountMinor: number | null;
  currency: string;
  latest: Order | null;
};

export const getOrderState = () => api<OrderState>("/api/v1/billing/order");

export const createOrder = () =>
  api<{ order: Order; keyId: string; testMode: boolean }>("/api/v1/billing/order", {
    method: "POST",
  });

export const verifyOrder = (payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) =>
  api<Order>("/api/v1/billing/order/verify", { method: "POST", body: payload });

export { formatAmount };

type RazorpayOrderOptions = {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  handler: (response: Record<string, string | undefined>) => void;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
};

type Checkout = {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
};

/** Why a payment attempt ended, so the caller can say the right thing. */
export type PayOutcome =
  | { kind: "paid"; order: Order }
  | { kind: "dismissed" }
  | { kind: "failed"; message: string }
  | { kind: "unverified"; message: string };

/**
 * Creates an order, opens Checkout on it, and verifies whatever comes back.
 *
 * The four outcomes are separate because they need different words. `dismissed`
 * is somebody who changed their mind and owes no explanation. `failed` is a
 * payment that was attempted and did not work — no money moved.
 *
 * `unverified` is the one that matters and the easiest to get wrong: the money
 * may well have left the customer's account and only *our confirmation* of it
 * failed. Telling them the payment failed would be untrue; telling them it
 * worked would grant access the server has not agreed to. So it says neither.
 */
export async function payOnce(): Promise<PayOutcome> {
  const created = await createOrder();
  await loadCheckoutScript();

  const Razorpay = (window as unknown as {
    Razorpay?: new (options: RazorpayOrderOptions) => Checkout;
  }).Razorpay;

  if (!Razorpay) {
    return { kind: "failed", message: "Razorpay Checkout is unavailable. Try again." };
  }

  return new Promise<PayOutcome>((resolve) => {
    // Razorpay calls neither handler nor ondismiss in some edge cases — a popup
    // blocked after open, a hard navigation. Settling once guards against a
    // double resolve, which would otherwise be silent.
    let settled = false;
    const settle = (outcome: PayOutcome) => {
      if (settled) return;
      settled = true;
      resolve(outcome);
    };

    const checkout = new Razorpay({
      key: created.keyId,
      order_id: created.order.orderId,
      amount: created.order.amountMinor,
      currency: created.order.currency,
      name: "WebXite",
      description: "Subscription",
      theme: { color: "#2563EB" },
      modal: { ondismiss: () => settle({ kind: "dismissed" }) },
      handler: (response) => {
        const orderId = response.razorpay_order_id;
        const paymentId = response.razorpay_payment_id;
        const signature = response.razorpay_signature;

        if (!orderId || !paymentId || !signature) {
          settle({
            kind: "unverified",
            message:
              "Razorpay did not return everything needed to confirm this payment. " +
              "If you were charged, contact support with your payment id.",
          });
          return;
        }

        void verifyOrder({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        })
          .then((order) => settle({ kind: "paid", order }))
          .catch((error: unknown) => {
            settle({
              kind: "unverified",
              message:
                error instanceof ApiError
                  ? `${error.message} If you were charged, contact support before paying again.`
                  : "Your payment could not be confirmed just now. If you were charged, " +
                    "contact support before paying again.",
            });
          });
      },
    });

    checkout.on("payment.failed", (payload: unknown) => {
      const description = (payload as { error?: { description?: string } } | undefined)
        ?.error?.description;
      settle({
        kind: "failed",
        message: description || "The payment did not go through. No money was taken.",
      });
    });

    checkout.open();
  });
}
