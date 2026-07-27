"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { savePageSeo, type PageSeoState } from "@/app/actions/page-seo";

export type PageSeo = {
  id: string;
  slug: string;
  title: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  canonicalSlug: string | null;
};

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

/**
 * Page-level tools, currently SEO.
 *
 * Deliberately separate from the section popup. A section popup edits what is
 * on the page; this edits how the page is described to something that will
 * never see it — different scope, different surface.
 *
 * Explicitly saved rather than autosaved, unlike section content. These four
 * fields are a considered decision made once, not a paragraph typed over
 * minutes, and a half-typed meta description written to a live page while
 * someone is still thinking is not a kindness.
 */
export function PageToolsPanel({
  page,
  onClose,
}: {
  page: PageSeo;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, action, pending] = useActionState<PageSeoState, FormData>(
    savePageSeo,
    {},
  );

  // Counters, so the advisory limits mean something while typing rather than
  // only after the field is truncated somewhere else.
  const [titleLength, setTitleLength] = useState(
    (page.metaTitle ?? page.title).length,
  );
  const [descriptionLength, setDescriptionLength] = useState(
    (page.metaDescription ?? "").length,
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) onClose();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Page settings for ${page.title}`}
      className="fixed right-4 top-16 z-50 w-[26rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xl"
    >
      <header className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-black/40">
            Page settings
          </p>
          <h2 className="text-sm font-bold">{page.title}</h2>
          <p className="text-xs text-black/45">
            How this page appears in search results and shared links
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close page settings"
          className="rounded p-1 text-black/40 transition hover:bg-black/5 hover:text-black"
        >
          ✕
        </button>
      </header>

      <form action={action} className="max-h-[70vh] space-y-4 overflow-y-auto px-4 py-4">
        <input type="hidden" name="pageId" value={page.id} />

        <Field
          label="Meta title"
          hint={`${titleLength}/${TITLE_LIMIT} shown in results`}
          over={titleLength > TITLE_LIMIT}
        >
          <input
            name="metaTitle"
            defaultValue={page.metaTitle ?? ""}
            placeholder={page.title}
            maxLength={70}
            onChange={(event) =>
              setTitleLength(
                (event.target.value || page.title).length,
              )
            }
            className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </Field>

        <Field
          label="Meta description"
          hint={`${descriptionLength}/${DESCRIPTION_LIMIT} shown in results`}
          over={descriptionLength > DESCRIPTION_LIMIT}
        >
          <textarea
            name="metaDescription"
            defaultValue={page.metaDescription ?? ""}
            rows={3}
            maxLength={200}
            placeholder="One or two sentences describing this page."
            onChange={(event) => setDescriptionLength(event.target.value.length)}
            className="w-full resize-y rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </Field>

        <Field
          label="Share image"
          hint="Shown when the page is linked on social media"
        >
          <input
            name="ogImage"
            defaultValue={page.ogImage ?? ""}
            placeholder="/uploads/… or a full URL"
            className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </Field>

        <Field
          label="Canonical slug"
          hint="Leave empty to use this page's own address"
        >
          <input
            name="canonicalSlug"
            defaultValue={page.canonicalSlug ?? ""}
            placeholder={page.slug}
            className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-black"
          />
        </Field>

        {state.error ? (
          <p className="text-xs font-medium text-red-600">{state.error}</p>
        ) : null}
        {state.savedAt && !pending ? (
          <p className="text-xs font-medium text-green-700">Saved.</p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save page settings"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  over,
  children,
}: {
  label: string;
  hint: string;
  over?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-black/60">{label}</span>
        {/* Over the advisory length is a nudge, not an error: search engines
            truncate, they do not reject. */}
        <span
          className={`text-[11px] ${over ? "text-amber-700" : "text-black/35"}`}
        >
          {hint}
        </span>
      </span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
