"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { AuthState } from "@/app/actions/auth";

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
};

export function AuthForm({
  title,
  subtitle,
  action,
  fields,
  submitLabel,
  footer,
}: {
  title: string;
  subtitle: string;
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  fields: Field[];
  submitLabel: string;
  footer: { text: string; linkLabel: string; href: string };
}) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
  });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-black/55">{subtitle}</p>

      <form action={formAction} className="mt-8 space-y-4">
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="text-xs font-semibold text-black/60">
              {field.label}
            </span>
            <input
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              required
              className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
            />
            {field.hint ? (
              <span className="mt-1 block text-xs text-black/45">
                {field.hint}
              </span>
            ) : null}
          </label>
        ))}

        {state.error ? (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
          >
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Please wait…" : submitLabel}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-black/55">
        {footer.text}{" "}
        <Link href={footer.href} className="font-semibold text-black underline">
          {footer.linkLabel}
        </Link>
      </p>
    </main>
  );
}
