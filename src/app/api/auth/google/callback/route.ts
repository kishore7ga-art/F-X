import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { STATE_COOKIE } from "@/app/api/auth/google/start/route";
import { createSession } from "@/lib/auth/session";
import { exchangeCode, googleEnabled } from "@/lib/auth/google";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Sign-in failures land back on /login carrying a readable reason. */
function back(request: Request, reason: string) {
  const url = new URL("/login", new URL(request.url).origin);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  if (!googleEnabled) return back(request, "Google sign-in is not configured");

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  // Google reports a refusal here rather than by failing the request.
  const denied = url.searchParams.get("error");
  if (denied) return back(request, "Sign-in was cancelled");
  if (!code || !state) return back(request, "Google sign-in did not complete");

  const store = await cookies();
  const expected = store.get(STATE_COOKIE)?.value;
  store.delete(STATE_COOKIE);

  // Single use, and it must be the one we minted.
  if (!expected || expected !== state) {
    return back(request, "Sign-in expired — please try again");
  }

  let identity;
  try {
    identity = await exchangeCode(request, code);
  } catch (error) {
    console.error("[google] exchange failed:", (error as Error).message);
    return back(request, "Could not verify your Google account");
  }

  if (!identity.emailVerified) {
    return back(request, "That Google account has an unverified email address");
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email: identity.email },
      include: { college: { select: { subdomain: true, collegeType: true, templateId: true } } },
    });

    if (!user) {
      /**
       * First sign-in. Adopt an unclaimed college before making a new one.
       *
       * An install that ran in open-access mode has a real college with real
       * content and no user attached to it. Creating a second college here
       * would strand the first: the person who built it would sign in and find
       * an empty site, with their work intact but unreachable.
       */
      const unclaimed = await prisma.college.findFirst({
        where: { isDemo: false, users: { none: {} } },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      const collegeId =
        unclaimed?.id ??
        (
          await prisma.college.create({
            data: {
              name: identity.name ? `${identity.name}'s college` : "My College",
              subdomain: `college-${Date.now().toString(36)}`,
              status: "DRAFT",
            },
            select: { id: true },
          })
        ).id;

      user = await prisma.user.create({
        data: {
          email: identity.email,
          // Google is the credential. A random unusable hash keeps the column
          // NOT NULL without inventing a password anyone could guess or reuse.
          passwordHash: `google:${crypto.randomUUID()}`,
          collegeId,
        },
        include: { college: { select: { subdomain: true, collegeType: true, templateId: true } } },
      });
    }

    await createSession({ userId: user.id, collegeId: user.collegeId });

    // Resume wherever this college actually is in the flow.
    const { collegeType, templateId, subdomain } = user.college;
    const next = !collegeType
      ? "/onboarding"
      : templateId
        ? `/editor/${subdomain}`
        : "/start";

    return NextResponse.redirect(new URL(next, url.origin));
  } catch (error) {
    console.error("[google] sign-in failed:", (error as Error).message);
    return back(request, "Could not complete sign-in");
  }
}
