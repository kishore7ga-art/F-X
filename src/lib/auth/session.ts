import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

import { AUTH_DISABLED, openAccessCollege } from "@/lib/auth/open-access";

const COOKIE_NAME = "college_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: string;
  collegeId: string;
};

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be set and at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  // Open-access mode short-circuits here rather than at each of the dozen call
  // sites. Everything downstream — the editor guard, the section and publish
  // actions, upload authorisation, draft visibility — already asks this one
  // question, so answering it differently is the whole switch.
  //
  // Only collegeId is ever read from a session; userId exists for the JWT's
  // sake, so a synthetic one costs nothing and needs no User row.
  if (AUTH_DISABLED) {
    const college = await openAccessCollege();
    return { userId: `open-access:${college.id}`, collegeId: college.id };
  }

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const userId = payload.userId;
    const collegeId = payload.collegeId;
    if (typeof userId !== "string" || typeof collegeId !== "string") {
      return null;
    }
    return { userId, collegeId };
  } catch {
    // Expired or tampered token — treat as signed out.
    return null;
  }
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
