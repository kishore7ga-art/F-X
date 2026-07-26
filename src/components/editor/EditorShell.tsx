"use client";

import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";

import { logout } from "@/app/actions/auth";
import { cycleTemplate } from "@/app/actions/design";
import { AddSectionMenu } from "@/components/editor/AddSectionMenu";
import { EditorContextProvider } from "@/components/editor/EditorContext";
import { PageTabs } from "@/components/editor/PageTabs";
import { PublishToggle } from "@/components/editor/PublishToggle";
import { SectionContentForm } from "@/components/editor/SectionContentForm";
import type { EditorPageData } from "@/lib/editor/queries";

/**
 * Screen 3 frame: page tabs on top, the live-rendered site as stacked section
 * blocks in the middle, and the content form in a right-hand panel.
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
        selectSection: setSelectedSectionId,
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

        <div className="grid min-h-0 flex-1 lg:grid-cols-[1fr_380px]">
          <div className="min-h-0 overflow-y-auto p-5">
            <div className="mx-auto max-w-5xl overflow-hidden rounded-xl border bg-white shadow-sm">
              {sections.length > 0 ? (
                children
              ) : (
                <EmptyPage pageTitle={currentPage.title} />
              )}
            </div>
          </div>

          <aside className="min-h-0 overflow-hidden border-l bg-white lg:block">
            {selectedSection ? (
              <SectionContentForm
                section={selectedSection}
                onClose={() => setSelectedSectionId(null)}
              />
            ) : (
              <div className="p-6 text-sm text-black/45">
                <p className="font-semibold text-black/70">
                  Click a section to edit it
                </p>
                <ul className="mt-3 space-y-1.5 text-xs leading-relaxed">
                  <li>▲ ▼ — reorder a section within this page</li>
                  <li>↻ — swap the design, keeping your content</li>
                  <li>◉ — show or hide the section</li>
                  <li>+ — insert a new section below</li>
                  <li className="pt-1.5">
                    ↻ Try another template (top bar) — swaps every section at
                    once, keeping your content and colours
                  </li>
                </ul>
              </div>
            )}
          </aside>
        </div>
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
