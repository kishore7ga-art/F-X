"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";

import { logout } from "@/app/actions/auth";
import { cycleTemplate } from "@/app/actions/design";
import { AddSectionMenu } from "@/components/editor/AddSectionMenu";
import { EditorContextProvider } from "@/components/editor/EditorContext";
import { PageTabs } from "@/components/editor/PageTabs";
import { PublishToggle } from "@/components/editor/PublishToggle";
import { PageToolsPanel } from "@/components/editor/PageToolsPanel";
import {
  SectionEditPopup,
  type PopupAnchor,
} from "@/components/editor/SectionEditPopup";
import type { EditorPageData } from "@/lib/editor/queries";

/**
 * Screen 3 frame: page tabs on top and the live-rendered site as stacked
 * section blocks filling the width beneath them.
 *
 * The edit form is a popup opened on the section it belongs to, not a panel
 * alongside it — a sidebar that took a third of the canvas and stayed until
 * dismissed meant the page was squeezed for exactly as long as you were
 * looking at it.
 */
export function EditorShell({
  data,
  children,
  // Open-access mode has no session to end, so the control would clear a cookie
  // that is not there and bounce the user straight back into the editor.
  canSignOut = true,
  /** False when only one template is installed, leaving nothing to cycle to. */
  canCycleTemplate = false,
}: {
  data: EditorPageData;
  children: ReactNode;
  canSignOut?: boolean;
  canCycleTemplate?: boolean;
}) {
  const { college, pages, currentPage, sections, addableSections } = data;

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  // Where the popup opens. Held beside the selection rather than inside it so
  // the same section can be reopened at a different point.
  const [anchor, setAnchor] = useState<PopupAnchor | null>(null);
  const [pageToolsOpen, setPageToolsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const selectedSection =
    sections.find((section) => section.id === selectedSectionId) ?? null;

  function run(action: () => Promise<void>) {
    setActionError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (cause) {
        setActionError(
          cause instanceof Error ? cause.message : "Something went wrong.",
        );
      }
    });
  }

  return (
    <EditorContextProvider
      value={{
        collegeId: college.id,
        pageId: currentPage.id,
        sections,
        addableSections,
        selectedSectionId,
        selectSection: (id, at) => {
          setSelectedSectionId(id);
          if (at) setAnchor(at);
        },
        isPending,
        run,
      }}
    >
      <div className="flex h-dvh flex-col bg-zinc-100">
        <header className="border-b bg-white px-5 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-sm font-bold">{college.name}</h1>
              <p className="text-xs text-black/45">
                {college.templateName ?? "No template"} · /site/
                {college.subdomain}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isPending ? (
                <span className="text-xs text-black/45">Saving…</span>
              ) : null}
              <PublishToggle collegeId={college.id} status={college.status} />
              {/* Rendered even with nothing to cycle to, disabled — the same
                  way a section's ↻ stays visible when it has one variant. */}
              <button
                type="button"
                onClick={() => run(() => cycleTemplate())}
                disabled={!canCycleTemplate || isPending}
                title={
                  canCycleTemplate
                    ? "Swap every section to another template's design, keeping your content"
                    : "Only one template is installed"
                }
                className="rounded-md border px-3 py-1.5 text-xs font-semibold transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↻ Try another template
              </button>
              <Link
                href={`/templates`}
                className="rounded-md border px-3 py-1.5 text-xs font-semibold transition hover:bg-black/5"
              >
                Change design
              </Link>
              {/* Page-level tools, distinct from a section popup: this edits
                  how the page is described to something that never sees it. */}
              <button
                type="button"
                onClick={() => setPageToolsOpen((open) => !open)}
                aria-expanded={pageToolsOpen}
                title={`Page settings and SEO for ${currentPage.title}`}
                className={`grid h-[30px] w-[30px] place-items-center rounded-md border transition hover:bg-black/5 ${
                  pageToolsOpen ? "border-black bg-black/5" : ""
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1.5a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 3.2 7.5a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7.6A1.6 1.6 0 0 0 8.7 1.7V1.5a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1.1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.4 1.1Z" />
                </svg>
                <span className="sr-only">Page settings</span>
              </button>
              <Link
                href={`/site/${college.subdomain}`}
                target="_blank"
                className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
              >
                View site
              </Link>
              {canSignOut && (
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-md px-2 py-1.5 text-xs font-semibold text-black/50 transition hover:text-black"
                  >
                    Sign out
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="mt-2">
            <PageTabs
              subdomain={college.subdomain}
              pages={pages}
              currentSlug={currentPage.slug}
            />
          </div>
        </header>

        {actionError ? (
          <p className="bg-red-50 px-5 py-2 text-xs font-medium text-red-700">
            {actionError}
          </p>
        ) : null}

        {/* The canvas is the whole width now. The edit form is a popup that
            opens where it was asked for, rather than a panel that squeezed the
            thing being edited for as long as it was open. */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border bg-white shadow-sm">
            {sections.length > 0 ? (
              children
            ) : (
              <EmptyPage pageTitle={currentPage.title} />
            )}
          </div>

          <p className="mx-auto mt-4 max-w-5xl text-center text-xs text-black/40">
            Right-click a section to edit it · ▲▼ reorder · ↻ swap design · ◉
            show or hide · + add below
          </p>
        </div>

        {pageToolsOpen ? (
          <PageToolsPanel
            key={currentPage.id}
            page={currentPage}
            onClose={() => setPageToolsOpen(false)}
          />
        ) : null}

        {selectedSection && anchor ? (
          <SectionEditPopup
            // Remount per section rather than resyncing state inside an
            // effect: the form's state IS the section being edited, so a
            // different section is a different form.
            key={selectedSection.id}
            section={selectedSection}
            anchor={anchor}
            onClose={() => setSelectedSectionId(null)}
          />
        ) : null}
      </div>
    </EditorContextProvider>
  );
}

function EmptyPage({ pageTitle }: { pageTitle: string }) {
  return (
    <div className="px-6 py-20 text-center">
      <p className="text-sm font-semibold text-black/70">
        {pageTitle} has no sections yet
      </p>
      <p className="mt-1 text-xs text-black/45">
        Use the + button on another page, or add one below.
      </p>
      {/* The + affordance for a page with no sections to hover over yet. */}
      <div className="mt-5 flex justify-center">
        <AddSectionMenu afterOrder={0} />
      </div>
    </div>
  );
}
