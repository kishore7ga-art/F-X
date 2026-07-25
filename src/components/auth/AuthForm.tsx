"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";

import type { AuthState } from "@/app/actions/auth";

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
};

/** Values the autofill button writes into the form, keyed by field name. */
export type Autofill = {
  label: string;
  values: Record<string, string>;
};

export function AuthForm({
  title,
  subtitle,
  action,
  fields,
  submitLabel,
  footer,
  autofill,
}: {
  title: string;
  subtitle: string;
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  fields: Field[];
  submitLabel: string;
  footer: { text: string; linkLabel: string; href: string };
  autofill?: Autofill;
}) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
  });
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * The inputs are uncontrolled, so writing straight to the DOM node is what
   * the form itself will read when it builds its FormData. Dispatching `input`
   * keeps anything listening — password managers, validation — in step.
   */
  function fillDemoCredentials() {
    const form = formRef.current;
    if (!form || !autofill) return;

    for (const [name, value] of Object.entries(autofill.values)) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement) {
        field.value = value;
        field.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-black/55">{subtitle}</p>

      <form ref={formRef} action={formAction} className="mt-8 space-y-4">
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

        {autofill ? (
          // type="button" so it fills the form instead of submitting it.
          <button
            type="button"
            onClick={fillDemoCredentials}
            disabled={isPending}
            className="w-full rounded-lg border border-dashed border-black/25 px-4 py-2 text-xs font-semibold text-black/60 transition hover:border-black/50 hover:text-black disabled:opacity-50"
          >
            {autofill.label}
          </button>
        ) : null}
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
