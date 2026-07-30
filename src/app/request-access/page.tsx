import { redirect } from "next/navigation";

import { RequestAccessForm } from "@/components/auth/RequestAccessForm";
import { getCurrentCollegeOrNull } from "@/lib/auth/current";

export const dynamic = "force-dynamic";

export const metadata = { title: "Request access — XITE" };

/**
 * The way in, for somebody who does not have an account yet.
 *
 * Bounces anyone who already has a session, the same way /login does:
 * asking for access while signed in is a form that can only confuse. Where they
 * land follows the same rule those two use — /start once onboarding has asked
 * what kind of institution this is, /onboarding before that.
 *
 * `getCurrentCollegeOrNull` rather than the throwing version, for the reason its
 * own comment gives: this is a page somebody reaches when they are in a bad
 * state, so it has to render in one. A stale cookie plus an unreachable backend
 * must not turn the only entry point into a 500.
 */
export default async function RequestAccessPage() {
  const college = await getCurrentCollegeOrNull();
  if (college) {
    redirect(college.collegeType ? "/start" : "/onboarding");
  }

  return <RequestAccessForm />;
}
