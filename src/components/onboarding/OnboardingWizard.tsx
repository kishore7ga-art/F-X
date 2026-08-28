"use client";

/**
 * The three questions between approval and the editor.
 *
 * ── Why this exists again ──────────────────────────────────────────────────
 *
 * There was an onboarding flow once. Its Server Actions posted to
 * `/api/v1/onboarding` and `/api/v1/onboarding/build`, both of which answered
 * 404, nothing rendered the actions, and `destinationFor()` sent every sign-in
 * straight to the editor — so what remained at this route was a redirect to a
 * hardcoded `/editor/mec`, somebody else's tenant. The visible result was that
 * a new college arrived in a builder with no theme and no font stamped on it,
 * and saw whatever the sections happened to have been authored in.
 *
 * ── Why all three answers submit at once ───────────────────────────────────
 *
 * The steps are local state until the last one. A wizard that saved each answer
 * as it was given would leave anyone who closed the tab on step two with a
 * theme, no font, and no flag saying which — a state that is neither "new" nor
 * "onboarded", and those are the only two the rest of the app knows how to
 * render. One `PUT` at the end is atomic on the server, so both possible
 * outcomes are ones the app already handles.
 *
 * ── Why the theme and font are shown, not described ────────────────────────
 *
 * Both choices are visual, and both stay reversible from the editor's drawer.
 * The swatches are drawn from the same `EDITOR_THEMES` tokens the renderer
 * uses and the samples are set in the same `stack` the site will use, so the
 * thing being chosen is the thing that will render. A second table of
 * marketing colours here is exactly what would drift from the live site.
 */

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

import { ApiError, completeOnboardingRequest } from "@/lib/api-client";
import { ONBOARDING_ROLES } from "@/lib/api-contract";
import { EDITOR_FONTS, EDITOR_THEMES } from "@/lib/editor-themes";

type Step = 0 | 1 | 2;

const STEPS = ["Your role", "Website theme", "Website font"] as const;

export function OnboardingWizard({
  subdomain,
  collegeName,
}: {
  subdomain: string;
  collegeName: string;
}) {
  const [step, setStep] = useState<Step>(0);
  const [role, setRole] = useState<string | null>(null);
  const [themePaletteId, setThemePaletteId] = useState<string | null>(null);
  const [themeFontId, setThemeFontId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  /**
   * Whether the step on screen has been answered.
   *
   * Drives the Continue button rather than an alert on click: a disabled
   * control that explains itself in a tooltip interrupts less than one that
   * lets you press it and then tells you off.
   */
  const answered = [role, themePaletteId, themeFontId][step] !== null;

  async function handleFinish() {
    // Belt and braces. The button is disabled without all three, but this is
    // the call that must not send a partial answer — the API would reject it,
    // and the rejection would reach the person as an unexplained failure on the
    // last step, with nothing on screen saying which answer was missing.
    if (!role || !themePaletteId || !themeFontId) {
      setError("Please answer all three questions before finishing.");
      return;
    }

    setError(null);
    setPending(true);

    try {
      await completeOnboardingRequest({ role, themePaletteId, themeFontId });
      // A full navigation, not a router push: the editor is a server-rendered
      // route whose guard reads the session's onboarding state, and that state
      // has just changed. A soft navigation would render it from a cache taken
      // before the write.
      window.location.assign(`/editor/${subdomain}`);
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? cause.message
          : "Could not save your choices. Please check your connection and try again.",
      );
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-slate-50 font-sans text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 py-8 sm:px-8 sm:py-12">
        <header className="mb-8 sm:mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Welcome to XITE
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Let&rsquo;s set up {collegeName}
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Three questions. You can change any of them later from the editor.
          </p>
        </header>

        <ol className="mb-8 flex items-center gap-2 sm:gap-3" aria-label="Progress">
          {STEPS.map((label, index) => {
            const done = index < step;
            const current = index === step;
            return (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  aria-current={current ? "step" : undefined}
                  className={[
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black transition",
                    done
                      ? "bg-emerald-600 text-white"
                      : current
                        ? "bg-slate-900 text-white"
                        : "bg-slate-200 text-slate-500",
                  ].join(" ")}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span
                  className={[
                    "hidden text-xs font-bold sm:block",
                    current ? "text-slate-900" : "text-slate-500",
                  ].join(" ")}
                >
                  {label}
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    className={[
                      "h-px flex-1 transition",
                      done ? "bg-emerald-500" : "bg-slate-200",
                    ].join(" ")}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <section className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {step === 0 && (
            <fieldset>
              <legend className="text-lg font-extrabold tracking-tight text-slate-900">
                What is your role?
              </legend>
              <p className="mt-1 mb-5 text-sm font-medium text-slate-500">
                This tells us who is running the site. It is not shown to visitors.
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {ONBOARDING_ROLES.map((option) => {
                  const selected = role === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setRole(option.id)}
                      aria-pressed={selected}
                      className={[
                        "flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-bold transition",
                        selected
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <span>{option.label}</span>
                      {selected && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset>
              <legend className="text-lg font-extrabold tracking-tight text-slate-900">
                Choose a website theme
              </legend>
              <p className="mt-1 mb-5 text-sm font-medium text-slate-500">
                Applies to every page and section. Change it any time from the editor.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {EDITOR_THEMES.map((theme) => {
                  const selected = themePaletteId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setThemePaletteId(theme.id)}
                      aria-pressed={selected}
                      className={[
                        "rounded-xl border p-3.5 text-left transition",
                        selected
                          ? "border-slate-900 ring-2 ring-slate-900/15"
                          : "border-slate-200 hover:border-slate-400",
                      ].join(" ")}
                    >
                      {/* Drawn from the same tokens the renderer uses, so this
                          is a preview rather than an impression of one. */}
                      <span
                        className="mb-3 flex h-14 w-full overflow-hidden rounded-lg"
                        style={{ backgroundColor: theme.swatch.base }}
                      >
                        <span
                          className="mt-auto mb-2 ml-2 h-4 w-16 rounded"
                          style={{ backgroundColor: theme.swatch.accent }}
                        />
                      </span>
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold text-slate-900">
                          {theme.name}
                        </span>
                        {selected && <Check className="h-4 w-4 shrink-0 text-slate-900" />}
                      </span>
                      <span className="mt-1 block text-xs font-medium leading-relaxed text-slate-500">
                        {theme.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset>
              <legend className="text-lg font-extrabold tracking-tight text-slate-900">
                Choose a font
              </legend>
              <p className="mt-1 mb-5 text-sm font-medium text-slate-500">
                Used for headings and body text across the whole site.
              </p>
              <div className="grid gap-3">
                {EDITOR_FONTS.map((font) => {
                  const selected = themeFontId === font.id;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setThemeFontId(font.id)}
                      aria-pressed={selected}
                      className={[
                        "rounded-xl border px-4 py-4 text-left transition",
                        selected
                          ? "border-slate-900 ring-2 ring-slate-900/15"
                          : "border-slate-200 hover:border-slate-400",
                      ].join(" ")}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-extrabold text-slate-900">
                          {font.name}
                        </span>
                        {selected && <Check className="h-4 w-4 shrink-0 text-slate-900" />}
                      </span>
                      {/* Set in the stack being offered — the sample is the
                          answer to "what will this look like". */}
                      <span
                        className="mt-2 block text-lg text-slate-700"
                        style={{ fontFamily: font.stack }}
                      >
                        Admissions open for 2026
                      </span>
                      <span className="mt-1 block text-xs font-medium text-slate-500">
                        {font.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-700"
            >
              {error}
            </p>
          )}
        </section>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))}
            disabled={step === 0 || pending}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200/70 disabled:pointer-events-none disabled:opacity-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {step < 2 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={!answered}
              title={answered ? undefined : "Choose an option to continue"}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              // Guarded while in flight as well as while incomplete: this write
              // creates the project's theme, and a double-click should not be
              // two of them racing.
              disabled={!answered || pending}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  Finish setup
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
