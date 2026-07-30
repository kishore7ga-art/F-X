import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Google sign-in, using the authorization-code flow.
 *
 * No SDK: the flow is two HTTPS calls and a signature check, and `jose` — which
 * is already here for our own sessions — verifies Google's id_token against
 * their published keys. A dependency for this would be more surface than logic.
 */
const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

/** Fetched once and cached; Google rotates these keys. */
const JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? "";

export const STATE_COOKIE = "google_oauth_state";
export const ACTIVATION_COOKIE = "xite_activation_token";

/**
 * Whether to offer the button at all.
 *
 * Unconfigured means the button is not rendered, rather than rendered and
 * broken — an install without Google credentials should look like one that
 * never offered it.
 */
export const googleEnabled = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

/**
 * The origin a browser actually reached us on.
 *
 * `new URL(request.url).origin` is the *container's* address behind a reverse
 * proxy — localhost:3000 on Dokploy — so redirecting to it sends the browser
 * somewhere that does not exist outside the container. Every redirect out of
 * sign-in has to be built from the public origin instead.
 *
 * APP_URL first because it is unambiguous; the forwarded headers next, so this
 * still works when nobody set it; request.url last, which is right only when
 * there is no proxy at all.
 */
export function appOrigin(request: Request): string {
  const configured = process.env.APP_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

/**
 * Where Google sends the browser back.
 *
 * Must match a URI registered in the Google Cloud console exactly, including
 * scheme and trailing path — Google compares the whole string.
 */
export function redirectUri(request: Request): string {
  return `${appOrigin(request)}/api/auth/google/callback`;
}

export function authorizationUrl(request: Request, state: string): string {
  const url = new URL(AUTH_ENDPOINT);
  url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri(request));
  url.searchParams.set("response_type", "code");
  // Only identity. We are not reading anyone's mail to let them edit a website.
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  // Ask every time rather than silently reusing a session for a different
  // Google account than the person expects.
  url.searchParams.set("prompt", "select_account");
  return url.toString();
}

export type GoogleIdentity = {
  email: string;
  name: string | null;
  emailVerified: boolean;
  /**
   * The raw token this identity was read out of.
   *
   * Returned so activation can forward it to the backend, which verifies it a
   * second time rather than believing the email beside it. That is not
   * belt-and-braces: the invite lives in the backend, and an endpoint that
   * accepts a caller-supplied address is exactly the hole the address match is
   * meant to close. Sign-in does not use this.
   */
  idToken: string;
};

/**
 * Trades the one-time code for an id_token and reads the identity out of it.
 *
 * The token is verified against Google's keys, issuer and our client id before
 * anything in it is believed — an unverified JWT is just a string the browser
 * handed us.
 */
export async function exchangeCode(
  request: Request,
  code: string,
): Promise<GoogleIdentity> {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri(request),
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    // Google's body names the misconfiguration (redirect_uri_mismatch and
    // friends); losing it would leave only "sign-in failed".
    const detail = await response.text().catch(() => "");
    throw new Error(`Google rejected the sign-in: ${detail.slice(0, 200)}`);
  }

  const { id_token: idToken } = (await response.json()) as { id_token?: string };
  if (!idToken) throw new Error("Google did not return an identity token");

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: ISSUERS,
    audience: GOOGLE_CLIENT_ID,
  });

  const email = typeof payload.email === "string" ? payload.email : null;
  if (!email) throw new Error("Google did not return an email address");

  return {
    email: email.toLowerCase(),
    name: typeof payload.name === "string" ? payload.name : null,
    // Google sets this false for some workspace configurations; an unverified
    // address is not proof of anything.
    emailVerified: payload.email_verified === true,
    idToken,
  };
}
