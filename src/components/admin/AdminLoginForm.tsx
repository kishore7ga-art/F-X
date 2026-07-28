"use client";

import { useState } from "react";

/**
 * Super Admin sign-in.
 *
 * Posts straight to the backend from the browser, like college sign-in does, so
 * it is one inspectable request rather than an RSC payload.
 *
 * The code field appears only once the backend says it is needed. An account
 * that has not enrolled a second factor should not be shown a box it cannot
 * fill, and one that has should not be told "wrong password" when the password
 * was right — that message sends people to reset a password that was fine.
 */
export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [needsToken, setNeedsToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const response = await fetch(`${base}/api/v1/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          ...(token ? { token } : {}),
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        if (payload?.error?.includes("6-digit")) {
          setNeedsToken(true);
          setError("Enter the code from your authenticator app.");
        } else {
          setError(payload?.error ?? `Sign-in failed (${response.status})`);
        }
        setPending(false);
        return;
      }

      // Full page load, not a client navigation: the session was just set by
      // another origin and the destination is guarded server-side, so the
      // router cache could answer with the signed-out version of the page.
      window.location.assign("/admin");
    } catch {
      setError("Could not reach the server. Check your connection.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-chalk-dim/60">
          Email
        </span>
        <input
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="username"
          required
          className="mt-2 w-full rounded-lg border border-night-line bg-night-raised px-4 py-3 text-sm text-chalk outline-none transition focus:border-accent"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-chalk-dim/60">
          Password
        </span>
        <input
          name="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-lg border border-night-line bg-night-raised px-4 py-3 text-sm text-chalk outline-none transition focus:border-accent"
        />
      </label>

      {needsToken ? (
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-chalk-dim/60">
            Authenticator code
          </span>
          <input
            name="token"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            value={token}
            onChange={(event) => setToken(event.target.value.replace(/\D/g, ""))}
            autoComplete="one-time-code"
            autoFocus
            required
            className="mt-2 w-full rounded-lg border border-night-line bg-night-raised px-4 py-3 text-center font-mono text-lg tracking-[0.4em] text-chalk outline-none transition focus:border-accent"
          />
        </label>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-night transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
