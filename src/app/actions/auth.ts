"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSession, destroySession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import {
  DATABASE_UNAVAILABLE_MESSAGE,
  databaseErrorCode,
  isDatabaseUnavailable,
} from "@/lib/db-errors";

export type AuthState = { error: string | null };

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "app",
  "admin",
  "site",
  "editor",
  "preview",
  "templates",
  "login",
  "signup",
]);

const signupSchema = z.object({
  collegeName: z.string().trim().min(2, "Enter your college name"),
  subdomain: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Subdomain must be at least 3 characters")
    .max(40)
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and hyphens only",
    )
    .refine((value) => !RESERVED_SUBDOMAINS.has(value), "That subdomain is reserved"),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase(),
  password: z.string().min(1, "Enter your password"),
});

function fieldsOf(formData: FormData, keys: string[]) {
  return Object.fromEntries(
    keys.map((key) => [key, String(formData.get(key) ?? "")]),
  );
}

/** Creates a college plus its first login account, then signs the user in. */
export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse(
    fieldsOf(formData, ["collegeName", "subdomain", "email", "password"]),
  );

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details" };
  }

  const { collegeName, subdomain, email, password } = parsed.data;

  let user;
  try {
    const [existingUser, existingCollege] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.college.findUnique({ where: { subdomain } }),
    ]);

    if (existingUser) return { error: "That email is already registered" };
    if (existingCollege) return { error: "That subdomain is already taken" };

    const passwordHash = await bcrypt.hash(password, 12);

    /**
     * Adopt an unclaimed college before creating one.
     *
     * An install that ran in open-access mode has a real college, with real
     * content, and no user attached. Creating a second one here would strand
     * the first: whoever built it signs up, lands on an empty site, and their
     * work is intact but unreachable. The same rule the Google callback
     * follows, so both ways in behave alike.
     *
     * The name and subdomain from the form still win — they are what this
     * person just asked for.
     */
    const unclaimed = await prisma.college.findFirst({
      where: { isDemo: false, users: { none: {} } },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    user = unclaimed
      ? await prisma.user.create({
          data: {
            email,
            passwordHash,
            college: {
              connect: { id: unclaimed.id },
            },
          },
        })
      : await prisma.user.create({
          data: {
            email,
            passwordHash,
            college: {
              create: {
                name: collegeName,
                subdomain,
                // New sites start as drafts; nothing is public until published.
                status: "DRAFT",
              },
            },
          },
        });

    if (unclaimed) {
      await prisma.college.update({
        where: { id: unclaimed.id },
        data: { name: collegeName, subdomain },
      });
    }
  } catch (cause) {
    // A dead database should read as a service message, not a 500 whose text
    // Next strips in production.
    if (isDatabaseUnavailable(cause)) {
      console.error(`[signup] database unavailable (${databaseErrorCode(cause)})`);
      return { error: DATABASE_UNAVAILABLE_MESSAGE };
    }
    throw cause;
  }

  await createSession({ userId: user.id, collegeId: user.collegeId });
  // Into the flow, not past it — the same place every other way in lands.
  redirect("/onboarding");
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse(
    fieldsOf(formData, ["email", "password"]),
  );
  if (!parsed.success) return { error: "Enter your email and password" };

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      include: { college: { select: { subdomain: true } } },
    });
  } catch (cause) {
    if (isDatabaseUnavailable(cause)) {
      console.error(`[login] database unavailable (${databaseErrorCode(cause)})`);
      return { error: DATABASE_UNAVAILABLE_MESSAGE };
    }
    throw cause;
  }

  // Same message either way — don't reveal which emails exist.
  const invalid = { error: "Incorrect email or password" };
  if (!user) {
    // Constant-ish work so a missing user isn't obviously faster.
    await bcrypt.compare(parsed.data.password, "$2a$12$" + "x".repeat(53));
    return invalid;
  }

  const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!matches) return invalid;

  await createSession({ userId: user.id, collegeId: user.collegeId });
  // Into the flow like every other way in. /onboarding prefills what it knows
  // and /start carries a link straight back into an existing site, so a
  // returning user loses a click and gains a sequence that is the same every
  // time — which is worth more than the click.
  redirect("/onboarding");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
